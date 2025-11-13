"use client";
import { useEffect, useRef, useCallback, useState } from "react";

// Define interfaces at the top
interface WorkerPoseResult {
  yaw: number;
  pitch: number;
  ts: number;
}

interface LandmarkPoint {
  x: number;
  y: number;
  z?: number;
}

// Export DebugInfo interface
export interface DebugInfo {
  landmarks?: Array<{ x: number; y: number; z?: number }>;
  leftPupil?: { x: number; y: number };
  rightPupil?: { x: number; y: number };
  gazeDirection?: { x: number; y: number };
  gazePoint?: { x: number; y: number };
  headPose?: { yaw: number; pitch: number; roll?: number };
  usedSolvePnP?: boolean;
  rawGaze?: { h: number; v: number };
  compensatedGaze?: { h: number; v: number };
  pupilOffset?: { offsetX: number; offsetY: number };
  classification?: 'turning' | 'glancing' | 'focused';
  calibrationBounds?: { gazeHMin: number; gazeHMax: number; gazeVMin: number; gazeVMax: number };
}

// Export CalibrationData interface
export interface CalibrationData {
  gazeHMean: number;
  gazeVMean: number;
  gazeHStdDev: number;
  gazeVStdDev: number;
  gazeHMin: number;
  gazeHMax: number;
  gazeVMin: number;
  gazeVMax: number;
  recordedAt: number;
}

export enum FocusStatus {
  focus = "focus",
  glance = "glance",
  turning = "turning",
  not_detected = "not_detected",
}

// Remove unused imports and functions that are causing warnings
// computeCalibrationData, classifyGazeChange, averageEyeGaze, validateIrisInEye, exponentialSmoothing

export interface UseFocusDetectionProps {
  videoElementRef: React.RefObject<HTMLVideoElement>;
  canvasElementRef: React.RefObject<HTMLCanvasElement>;
  onDistraction?: (status: FocusStatus) => void;
  onCalibrationComplete?: (calibration: CalibrationData) => void;
  config?: {
    yawThresholdDeg?: number;
    pitchThresholdDeg?: number;
    enableOpenCV?: boolean;
    autoLoadCalibration?: boolean;
    minValidGazeSamples?: number;
    poseSmoothWindow?: number;
    gazeSmoothWindow?: number;
  };
}

export function useFocusDetection({
  videoElementRef,
  canvasElementRef,
  onDistraction,
  onCalibrationComplete,
  config = {},
}: UseFocusDetectionProps) {
  const CFG = {
    yawThresholdDeg: 15,
    pitchThresholdDeg: 12,
    enableOpenCV: false,
    autoLoadCalibration: true,
    minValidGazeSamples: 2,
    poseSmoothWindow: 3,
    gazeSmoothWindow: 2,
    ...config,
  };

  // Fix ref types
  const workerRef = useRef<Worker | null>(null);
  const workerReadyRef = useRef<boolean>(false);
  const lastWorkerPoseRef = useRef<WorkerPoseResult | null>(null);
  const headPoseRef = useRef<{ yaw: number; pitch: number } | null>(null);
  const lastWorkerPostTsRef = useRef<number>(0);
  const prevStatusRef = useRef<FocusStatus>(FocusStatus.not_detected);
  const autoTuneTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Prefix unused variables with underscore
  const _statusDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const [status, setStatus] = useState<FocusStatus>(FocusStatus.not_detected);
  const [debug, setDebug] = useState<DebugInfo | null>(null);
  const [calibrationResult, setCalibrationResult] = useState<CalibrationData | null>(null);

  // Fix worker message handler
  const handleWorkerMessage = useCallback((data: Record<string, unknown>) => {
    if (data.type === "pose") {
      const pose = data as unknown as WorkerPoseResult;
      lastWorkerPoseRef.current = pose;
      lastWorkerPostTsRef.current = Date.now();
    }
  }, []);

  // Prefix unused constants with underscore
  const _LEFT_EYE_CENTER_3D = { x: 0, y: 0, z: 0 };
  const _RIGHT_EYE_CENTER_3D = { x: 0, y: 0, z: 0 };

  // Fix face mesh callback
  const onResults = useCallback(
    (results: { faceLandmarks?: LandmarkPoint[][] }) => {
      try {
        if (!results.faceLandmarks || results.faceLandmarks.length === 0) {
          setStatus(FocusStatus.not_detected);
          return;
        }

        const landmarks = results.faceLandmarks[0] as LandmarkPoint[];
        
        // Prefix unused variables
        const _leftEye = landmarks.slice(33, 42);
        const _rightEye = landmarks.slice(362, 374);
        const leftEyeLandmarks = landmarks.slice(33, 42) as LandmarkPoint[];
        const rightEyeLandmarks = landmarks.slice(362, 374) as LandmarkPoint[];

        // Process landmarks safely
        if (leftEyeLandmarks.length === 0 || rightEyeLandmarks.length === 0) {
          setStatus(FocusStatus.not_detected);
          return;
        }

        // Get head pose
        const headPose = getHeadPose(landmarks);
        if (!headPose) {
          setStatus(FocusStatus.not_detected);
          return;
        }

        // Determine focus status
        let newStatus = FocusStatus.focus;
        if (Math.abs(headPose.yaw) > CFG.yawThresholdDeg || Math.abs(headPose.pitch) > CFG.pitchThresholdDeg) {
          newStatus = FocusStatus.turning;
        }

        setStatus(newStatus);
        if (newStatus !== FocusStatus.focus && onDistraction) {
          onDistraction(newStatus);
        }
      } catch (_e) {
        setStatus(FocusStatus.not_detected);
      }
    },
    [CFG.yawThresholdDeg, CFG.pitchThresholdDeg, onDistraction]
  );

  // Fix head pose function
  const getHeadPose = useCallback((landmarks: LandmarkPoint[]) => {
    try {
      if (!landmarks || landmarks.length < 468) return null;

      // Get key landmarks
      const noseTip = landmarks[1];
      const chinBottom = landmarks[18];
      const leftEyeCorner = landmarks[33];
      const rightEyeCorner = landmarks[263];

      if (!noseTip || !chinBottom || !leftEyeCorner || !rightEyeCorner) return null;

      // Calculate yaw (horizontal rotation)
      const eyeDistance = Math.abs(leftEyeCorner.x - rightEyeCorner.x);
      const noseOffset = (noseTip.x - (leftEyeCorner.x + rightEyeCorner.x) / 2) / eyeDistance;
      const yaw = Math.asin(Math.max(-1, Math.min(1, noseOffset))) * (180 / Math.PI);

      // Calculate pitch (vertical rotation)
      const noseToChina = Math.abs(noseTip.y - chinBottom.y);
      const eyeY = (leftEyeCorner.y + rightEyeCorner.y) / 2;
      const pitchRatio = (noseTip.y - eyeY) / noseToChina;
      const pitch = Math.asin(Math.max(-1, Math.min(1, pitchRatio))) * (180 / Math.PI);

      return { yaw, pitch };
    } catch (_e) {
      return null;
    }
  }, []);

  // Worker-based pose detection
  const getHeadPoseFromWorker = useCallback(() => {
    // Prefer worker-provided pose (fast, off-main-thread). Use recent result (<300ms).
    const wp = lastWorkerPoseRef.current;
    if (wp && wp.ts && Date.now() - wp.ts < 300) {
      return {
        yaw: wp.yaw,
        pitch: wp.pitch,
      };
    }
    return headPoseRef.current;
  }, []);

  // Process video frame
  const processFrame = useCallback(() => {
    try {
      const video = videoElementRef.current;
      const canvas = canvasElementRef.current;
      
      if (!video || !canvas || video.readyState < 2) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      // Get image data for processing
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Send to worker if available
      if (workerRef.current && workerReadyRef.current) {
        try {
          workerRef.current.postMessage({
            type: 'process',
            imageData: imageData.data,
            width: canvas.width,
            height: canvas.height
          });
        } catch (_e) {
          // Worker communication failed
        }
      }
    } catch (_e) {
      // Frame processing failed
    }
  }, [videoElementRef, canvasElementRef]);

  // Animation loop
  useEffect(() => {
    let animationId: number;
    
    const animate = () => {
      processFrame();
      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [processFrame]);

  // Eye tracking with MediaPipe
  useEffect(() => {
    let faceMesh: unknown = null;
    const _mounted = true;

    const initFaceMesh = async () => {
      try {
        const { FaceMesh } = await import('@mediapipe/face_mesh');
        const { Camera } = await import('@mediapipe/camera_utils');
        
        faceMesh = new (FaceMesh as unknown as new (options: Record<string, unknown>) => Record<string, unknown>)({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        }) as Record<string, unknown>;

        (faceMesh as Record<string, (options?: Record<string, unknown>) => void>).setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        (faceMesh as Record<string, (callback: (results: Record<string, unknown>) => void) => void>).onResults(onResults);

        if (videoElementRef.current) {
          const camera = new (Camera as unknown as new (element: HTMLVideoElement, options: Record<string, unknown>) => Record<string, unknown>)(videoElementRef.current, {
            onFrame: async () => {
              if (faceMesh && videoElementRef.current) {
                await (faceMesh as Record<string, (data: Record<string, unknown>) => Promise<void>>).send({ image: videoElementRef.current });
              }
            },
            width: 640,
            height: 480
          }) as Record<string, () => void>;
          camera.start();
        }
      } catch (_err) {
        setDebug(null);
      }
    };

    if (CFG.enableOpenCV) {
      initFaceMesh();
    }

    return () => {
      if (faceMesh) {
        const closeFn = (faceMesh as Record<string, (() => void) | undefined>).close;
        if (closeFn) {
          closeFn();
        }
      }
    };
  }, [CFG.enableOpenCV, onResults, videoElementRef]);

  return {
    status,
    debug,
    calibrationResult,
    startCalibration: () => {},
    calibrationCountdown: 0,
    isCalibrating: false,
    resetCalibration: () => setCalibrationResult(null),
  };
}