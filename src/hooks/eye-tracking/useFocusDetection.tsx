"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export enum FocusStatus {
  focus = "focus",
  turning = "turning",
  glance = "glance",
  not_detected = "not_detected",
}

export type CalibrationData = {
  offsetX: number;
  offsetY: number;
  scale: number;
};

export type DebugInfo = {
  headPose?: { yaw: number; pitch: number };
  gazePoint?: { x: number; y: number };
  faceDetected?: boolean;
};

type UseFocusOpts = {
  videoElementRef: React.RefObject<HTMLVideoElement>;
  canvasElementRef?: React.RefObject<HTMLCanvasElement>;
  onDistraction?: (status: FocusStatus) => void;
  onCalibrationComplete?: (c: any) => void;
  config?: Partial<{
    minDetectionConfidence: number;
    minTrackingConfidence: number;
    maxNumFaces: number;
    refineLandmarks: boolean;
    enableOpenCV: boolean;
    minProcessIntervalMs: number;
    yawThresholdDeg: number;
    pitchThresholdDeg: number;
    autoLoadCalibration: boolean;
    minValidGazeSamples: number;
    poseSmoothWindow: number;
    gazeSmoothWindow: number;
  }>;
};

const DEFAULTS = {
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
  maxNumFaces: 1,
  refineLandmarks: true,
  minProcessIntervalMs: 40,
  yawThresholdDeg: 18,
  pitchThresholdDeg: 14,
  autoLoadCalibration: true,
};

const CAL_KEY = "focus_detection_calibration_v1";

export function useFocusDetection(opts: UseFocusOpts) {
  const {
    videoElementRef,
    canvasElementRef,
    onDistraction,
    onCalibrationComplete,
    config: userConfig = {},
  } = opts;

  const config = { ...DEFAULTS, ...userConfig };

  const faceMeshRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const lastProcessRef = useRef<number>(0);
  const smoothingQueue = useRef<{ yaw: number; pitch: number }[]>([]);
  const [status, setStatus] = useState<FocusStatus>(FocusStatus.not_detected);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationCountdown, setCalibrationCountdown] = useState(0);
  const [debug, setDebug] = useState<DebugInfo | undefined>();
  const calibrationRef = useRef<CalibrationData | null>(null);
  const lastStatusRef = useRef<FocusStatus>(FocusStatus.not_detected);

  const loadCalibration = useCallback(() => {
    try {
      const raw = localStorage.getItem(CAL_KEY);
      if (raw) calibrationRef.current = JSON.parse(raw);
      if (config.autoLoadCalibration && calibrationRef.current && onCalibrationComplete) {
        onCalibrationComplete(calibrationRef.current);
      }
    } catch (e) {
      calibrationRef.current = null;
    }
  }, [config.autoLoadCalibration, onCalibrationComplete]);

  const saveCalibration = useCallback((c: any) => {
    calibrationRef.current = c;
    try {
      localStorage.setItem(CAL_KEY, JSON.stringify(c));
    } catch {}
    onCalibrationComplete?.(c);
  }, [onCalibrationComplete]);

  const startCalibration = useCallback(() => {
    let countdown = 5;
    setIsCalibrating(true);
    setCalibrationCountdown(countdown);
    const interval = setInterval(() => {
      countdown -= 1;
      setCalibrationCountdown(countdown);
      if (countdown <= 0) {
        clearInterval(interval);
        setIsCalibrating(false);
        setCalibrationCountdown(0);
        const c: CalibrationData = { offsetX: 0, offsetY: 0, scale: 1 };
        saveCalibration(c);
      }
    }, 1000);
  }, [saveCalibration]);

  useEffect(() => {
    loadCalibration();
  }, [loadCalibration]);

  const drawMinimal = (landmarks: any[]) => {
    const canvas = canvasElementRef?.current;
    const video = videoElementRef.current;
    if (!canvas || !video || !landmarks) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw minimal points: left eye, right eye, nose
    const points = [landmarks[33], landmarks[263], landmarks[1]];

    ctx.fillStyle = "rgba(0, 150, 255, 0.9)";
    for (const p of points) {
      if (p) {
        const x = p.x * canvas.width;
        const y = p.y * canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  const estimatePoseProxy = (lm: any[]) => {
    const left = lm[33];
    const right = lm[263];
    const nose = lm[1];
    const faceCenterX = (left.x + right.x) / 2;
    const faceCenterY = nose.y;
    const yaw = (nose.x - faceCenterX) * 100;
    const pitch = (nose.y - faceCenterY) * 100;
    return { yaw: yaw * 1, pitch: pitch * 1 };
  };

  const processResults = (results: any) => {
    const lm = results.multiFaceLandmarks?.[0];
    const faceDetected = !!lm;

    if (!faceDetected) {
      if (lastStatusRef.current !== FocusStatus.not_detected) {
        lastStatusRef.current = FocusStatus.not_detected;
        setStatus(FocusStatus.not_detected);
      }
      setDebug({ faceDetected: false });
      return;
    }

    if (canvasElementRef?.current) drawMinimal(lm);

    const pose = estimatePoseProxy(lm);

    smoothingQueue.current.push({ yaw: pose.yaw, pitch: pose.pitch });
    if (smoothingQueue.current.length > 3) smoothingQueue.current.shift();

    const avg = smoothingQueue.current.reduce(
      (acc, v) => ({ yaw: acc.yaw + v.yaw, pitch: acc.pitch + v.pitch }),
      { yaw: 0, pitch: 0 }
    );
    avg.yaw /= smoothingQueue.current.length;
    avg.pitch /= smoothingQueue.current.length;

    const absYaw = Math.abs(avg.yaw);
    const absPitch = Math.abs(avg.pitch);

    let newStatus = FocusStatus.focus;
    if (absYaw > config.yawThresholdDeg) {
      newStatus = FocusStatus.turning;
    } else if (absPitch > config.pitchThresholdDeg) {
      newStatus = FocusStatus.glance;
    }

    if (newStatus !== lastStatusRef.current) {
      lastStatusRef.current = newStatus;
      setStatus(newStatus);

      if (newStatus !== FocusStatus.focus) {
        onDistraction?.(newStatus);
      }
    }

    setDebug({ faceDetected: true, headPose: { yaw: avg.yaw, pitch: avg.pitch } });
  };

  useEffect(() => {
    if (!videoElementRef.current) return;

    const initializeMediaPipe = async () => {
      try {
        // Dynamic import untuk FaceMesh
        const { FaceMesh } = await import("@mediapipe/face_mesh");
        const faceMesh = new FaceMesh({
          locateFile: (file: string) => {
            return `${window.location.origin}/mediapipe/face_mesh/${file}`;
          },
        });

        faceMesh.setOptions({
          maxNumFaces: config.maxNumFaces,
          refineLandmarks: config.refineLandmarks,
          minDetectionConfidence: config.minDetectionConfidence,
          minTrackingConfidence: config.minTrackingConfidence,
        });

        faceMesh.onResults((results: any) => {
          const now = performance.now();
          if (now - lastProcessRef.current < config.minProcessIntervalMs) return;
          lastProcessRef.current = now;
          processResults(results);
        });

        faceMeshRef.current = faceMesh;

        // Dynamic import untuk Camera - akses via window global
        const cameraUtils = await import("@mediapipe/camera_utils");
        const Camera = (cameraUtils as any).Camera || (window as any).Camera;

        if (!Camera) {
          console.error("Camera class not found - try using script tag instead");
          setStatus(FocusStatus.not_detected);
          return;
        }

        const camera = new Camera(videoElementRef.current, {
          onFrame: async () => {
            if (faceMeshRef.current && videoElementRef.current) {
              await faceMeshRef.current.send({ image: videoElementRef.current });
            }
          },
          width: 640,
          height: 480,
        });

        cameraRef.current = camera;
        await camera.start();
      } catch (error) {
        console.error("MediaPipe initialization failed:", error);
        setStatus(FocusStatus.not_detected);
      }
    };

    initializeMediaPipe();

    return () => {
      if (cameraRef.current?.stop) {
        try {
          cameraRef.current.stop();
        } catch (e) {
          console.error("Camera stop error:", e);
        }
      }
      if (faceMeshRef.current?.close) {
        try {
          faceMeshRef.current.close();
        } catch (e) {
          console.error("FaceMesh close error:", e);
        }
      }
      faceMeshRef.current = null;
      cameraRef.current = null;
    };
  }, [videoElementRef.current]);

  return {
    status,
    debug,
    startCalibration,
    calibrationCountdown,
    isCalibrating,
  };
}