import { useState, useEffect, useRef } from 'react';
import {
  CalibrationData,
  GazeSample,
  computeCalibrationData,
  computeCalibrationDataImproved,
  saveCalibration,
  loadCalibration,
  compensateGazeForHeadPoseLight,
  computePupilOffset,
  classifyGazeState,
  classifyGazeChange,
  averageEyeGaze,
} from '@/lib/eye-tracking/gazeCalibration';
import { MEDIAPIPE_INDICES, THRESHOLDS_DEFAULT, TEMPORAL_CONFIG, CAMERA_CONFIG } from '@/config/gazeConfig';
import { computeIrisCentroid, validateIrisInEye, clamp, exponentialSmoothing } from '@/lib/eye-tracking/gazeMath';

// simplified statuses (lowercase English strings via string-valued enum)
export enum FocusStatus {
  focus = 'focus',
  turning = 'turning',
  glance = 'glance',
  not_detected = 'not_detected',
}

// debug info returned from hook
export interface DebugInfo {
  landmarks?: Array<{ x: number; y: number; z?: number }>; // normalized face landmarks
  leftPupil?: { x: number; y: number }; // normalized pupil center
  rightPupil?: { x: number; y: number };
  gazeDirection?: { x: number; y: number }; // normalized gaze direction vector
  gazePoint?: { x: number; y: number }; // estimated gaze point on screen (px)
  headPose?: { yaw: number; pitch: number; roll?: number }; // degrees
  usedSolvePnP?: boolean; // whether OpenCV solvePnP was used
  rawGaze?: { h: number; v: number }; // before head compensation
  compensatedGaze?: { h: number; v: number }; // after head compensation (or undefined if not computed)
  pupilOffset?: { offsetX: number; offsetY: number }; // pupil relative to face
  classification?: 'turning' | 'glancing' | 'focused'; // high-level classification
  calibrationBounds?: { gazeHMin: number; gazeHMax: number; gazeVMin: number; gazeVMax: number }; // current bounds
}

interface UseFocusDetectionProps {
  videoElementRef: React.RefObject<HTMLVideoElement>;
  canvasElementRef?: React.RefObject<HTMLCanvasElement>;
  onDistraction?: (status: FocusStatus) => void; // callback when turning/glance detected
  onCalibrationComplete?: (calibration: CalibrationData) => void; // callback when calibration done
  // simple optional configuration
  config?: Partial<{
    yawThresholdDeg: number;
    pitchThresholdDeg: number;
    gazeHMin: number;
    gazeHMax: number;
    gazeVMin: number;
    gazeVMax: number;
    minValidGazeSamples: number;
    poseSmoothWindow: number; // frames
    gazeSmoothWindow: number; // frames
    enableOpenCV: boolean; // try to load opencv.js for better pose estimation
    autoLoadCalibration: boolean; // load from localStorage if available
  }>;
}

export function useFocusDetection({ videoElementRef, canvasElementRef, config, onDistraction, onCalibrationComplete }: UseFocusDetectionProps) {
  const [status, setStatus] = useState<FocusStatus>(FocusStatus.not_detected);
  const [debug, setDebug] = useState<DebugInfo | null>(null);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationCountdown, setCalibrationCountdown] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [readyMessage, setReadyMessage] = useState('Initializing...');

  // refs
  const faceMeshRef = useRef<any | null>(null);
  const cameraRef = useRef<any | null>(null);
  const cvReadyRef = useRef<boolean>(false);
  const workerRef = useRef<Worker | null>(null);
  const workerReadyRef = useRef<boolean>(false);
  const lastWorkerPoseRef = useRef<any | null>(null);
  const lastWorkerPostTsRef = useRef<number>(0);
  const prevStatusRef = useRef<FocusStatus>(FocusStatus.not_detected);
  const statusDebounceRef = useRef<number>(0); // frames of consecutive new state seen
  
  // calibration refs
  const calibrationRef = useRef<CalibrationData | null>(null);
  const calibrationSamplesRef = useRef<GazeSample[]>([]);
  const calibrationStartRef = useRef<number>(0);
  const calibrationDurationRef = useRef<number>(5000); // ms, default 5s for backward compatibility
  // autotune refs
  const isAutoTuningRef = useRef<boolean>(false);
  const autoTuneSamplesRef = useRef<Array<{ headYaw: number; headPitch: number; pupilMag: number; gazeH?: number; gazeV?: number }>>([]);
  const autoTuneTimerRef = useRef<any>(null);

  // simple histories for smoothing
  const poseHistoryRef = useRef<Array<{ yaw: number; pitch: number }>>([]);
  const gazeHistoryRef = useRef<Array<{ h: number; v: number }>>([]);
  // Track timestamp of last frame successfully sent to MediaPipe to avoid flooding
  const lastFrameSentTsRef = useRef<number>(0);
  // For iris validation: store last valid gaze when current iris is invalid
  const lastValidGazeRef = useRef<{ x: number; y: number } | null>(null);
  // improved debounce/hysteresis
  const lastProposedRef = useRef<FocusStatus | null>(null);
  const proposedCountRef = useRef<number>(0);

  const CFG = {
    yawThresholdDeg: THRESHOLDS_DEFAULT.yaw,
    pitchThresholdDeg: THRESHOLDS_DEFAULT.pitch,
    gazeHMin: THRESHOLDS_DEFAULT.gazeHMin,
    gazeHMax: THRESHOLDS_DEFAULT.gazeHMax,
    gazeVMin: THRESHOLDS_DEFAULT.gazeVMin,
    gazeVMax: THRESHOLDS_DEFAULT.gazeVMax,
    minValidGazeSamples: 3,
    poseSmoothWindow: TEMPORAL_CONFIG.poseSmoothWindow,
    gazeSmoothWindow: TEMPORAL_CONFIG.gazeSmoothWindow,
    enableOpenCV: true,
    autoLoadCalibration: true,
    ...config,
  };

  // MediaPipe indices for iris/eye landmarks (refined model)
  const LEFT_IRIS = MEDIAPIPE_INDICES.LEFT_IRIS;
  const RIGHT_IRIS = MEDIAPIPE_INDICES.RIGHT_IRIS;
  const LEFT_EYE_OUTER = MEDIAPIPE_INDICES.LEFT_EYE_OUTER;
  const LEFT_EYE_INNER = MEDIAPIPE_INDICES.LEFT_EYE_INNER;
  const RIGHT_EYE_OUTER = MEDIAPIPE_INDICES.RIGHT_EYE_OUTER;
  const RIGHT_EYE_INNER = MEDIAPIPE_INDICES.RIGHT_EYE_INNER;
  const LEFT_V_TOP = MEDIAPIPE_INDICES.LEFT_EYE_TOP;
  const LEFT_V_BOTTOM = MEDIAPIPE_INDICES.LEFT_EYE_BOTTOM;
  const RIGHT_V_TOP = MEDIAPIPE_INDICES.RIGHT_EYE_TOP;
  const RIGHT_V_BOTTOM = MEDIAPIPE_INDICES.RIGHT_EYE_BOTTOM;
  const LEFT_EYE_OUTLINE = MEDIAPIPE_INDICES.LEFT_EYE_OUTLINE;
  const RIGHT_EYE_OUTLINE = MEDIAPIPE_INDICES.RIGHT_EYE_OUTLINE;
  const SOLVEPNP_IDX = MEDIAPIPE_INDICES.SOLVEPNP_IDX;
  // 3D model points (in mm, nose tip as origin) for generic face
  const MODEL_POINTS_3D = [
    [0.0, 0.0, 0.0],       // nose tip
    [-30.0, -65.0, -5.0],  // left eye left corner
    [30.0, -65.0, -5.0],   // right eye right corner
    [-20.0, -20.0, -30.0], // left mouth corner
    [20.0, -20.0, -30.0],  // right mouth corner
    [0.0, 50.0, -45.0],    // chin
  ];
  // eye center 3D model points (rough)
  const LEFT_EYE_CENTER_3D = [-20.0, -65.0, 5.0];
  const RIGHT_EYE_CENTER_3D = [20.0, -65.0, 5.0];

  // helpers
  const clampVal = (v: number, a = 0, b = 1) => clamp(v, a, b);

  const irisCentroid = (lm: any[], idxs: number[]) => {
    const result = computeIrisCentroid(lm, idxs);
    return { x: result.x, y: result.y, r: result.radius };
  };

  const computeEyeRatio = (lm: any[], leftIdx: number, rightIdx: number, vTop: number, vBottom: number, irisIdxs: number[]) => {
    const left = lm[leftIdx], right = lm[rightIdx];
    const top = lm[vTop], bottom = lm[vBottom];
    if (!left || !right || !top || !bottom) return null;
    const iris = irisCentroid(lm, irisIdxs);
    const h = clampVal((iris.x - left.x) / Math.max(1e-6, right.x - left.x));
    const v = clampVal((iris.y - top.y) / Math.max(1e-6, bottom.y - top.y));
    return { h, v, r: iris.r };
  };

  // simplified head-pose proxy using nose vs eye corners and face bbox center
  const estimatePose = (lm: any[]) => {
    try {
      const nose = lm[1];
      const leftEye = lm[33];
      const rightEye = lm[263];
      const xs = lm.map((p: any) => p.x);
      const ys = lm.map((p: any) => p.y);
      const faceCenterX = (Math.min(...xs) + Math.max(...xs)) / 2;
      const faceCenterY = (Math.min(...ys) + Math.max(...ys)) / 2;
      const faceW = Math.max(1e-6, Math.max(...xs) - Math.min(...xs));
      const faceH = Math.max(1e-6, Math.max(...ys) - Math.min(...ys));
      const yawProxy = (nose.x - faceCenterX) / faceW; // -0.5..0.5
      const pitchProxy = (nose.y - faceCenterY) / faceH;
      const yaw = yawProxy * 60; // rough degrees
      const pitch = pitchProxy * 40;
      return { yaw, pitch, usedSolvePnP: false };
    } catch (e) {
      return { yaw: 0, pitch: 0, usedSolvePnP: false };
    }
  };

  // improved 3D head-pose using solvePnP (if opencv ready)
  const estimatePoseWithSolvePnP = (lm: any[], videoWidth: number, videoHeight: number) => {
    try {
      // Prefer worker-provided pose (fast, off-main-thread). Use recent result (<300ms).
      const wp = lastWorkerPoseRef.current;
      if (wp && wp.ts && Date.now() - wp.ts < 300) {
        return {
          yaw: wp.yaw,
          pitch: wp.pitch,
          roll: wp.roll,
          rvec: wp.rvec,
          tvec: wp.tvec,
          usedSolvePnP: true,
          gazePoint: wp.gazePoint, // {x, y, confidence} from worker
          irisCentroid: wp.irisCentroid, // improved iris detection from worker
        };
      }

      // As a fallback, if OpenCV is available on window (rare), run local solvePnP
      const cv = (window as any).cv;
      if (!cv || !cvReadyRef.current) {
        return estimatePose(lm); // fallback
      }

      // build image points (2D px) from landmarks
      const imgPts: number[] = [];
      SOLVEPNP_IDX.forEach((idx) => {
        imgPts.push(lm[idx].x * videoWidth, lm[idx].y * videoHeight);
      });

      // build object points (3D model)
      const objPts: number[] = [];
      MODEL_POINTS_3D.forEach((pt) => objPts.push(pt[0], pt[1], pt[2]));

      // camera matrix (simple focal length estimate)
      const focalLength = videoWidth;
      const center = [videoWidth / 2, videoHeight / 2];
      const cameraMatrix = [focalLength, 0, center[0], 0, focalLength, center[1], 0, 0, 1];

      const objMat = cv.matFromArray(6, 3, cv.CV_64F, objPts);
      const imgMat = cv.matFromArray(6, 2, cv.CV_64F, imgPts);
      const camMat = cv.matFromArray(3, 3, cv.CV_64F, cameraMatrix);
      const distCoeffs = cv.Mat.zeros(4, 1, cv.CV_64F);
      const rvec = new cv.Mat();
      const tvec = new cv.Mat();

      const success = cv.solvePnP(objMat, imgMat, camMat, distCoeffs, rvec, tvec, false, cv.SOLVEPNP_ITERATIVE);

      if (success) {
        // convert rotation vector to Euler angles
        const R = new cv.Mat();
        cv.Rodrigues(rvec, R);
        const r = R.data64F;
        const yaw = Math.atan2(r[3], r[0]) * (180 / Math.PI);
        const pitch = Math.atan2(-r[6], Math.sqrt(r[7] * r[7] + r[8] * r[8])) * (180 / Math.PI);
        const roll = Math.atan2(r[7], r[8]) * (180 / Math.PI);

        // cleanup
        objMat.delete(); imgMat.delete(); camMat.delete(); distCoeffs.delete();
        const rvecClone = rvec.clone();
        const tvecClone = tvec.clone();
        rvec.delete(); tvec.delete(); R.delete();

        return { yaw, pitch, roll, rvec: rvecClone, tvec: tvecClone, usedSolvePnP: true };
      }

      objMat.delete(); imgMat.delete(); camMat.delete(); distCoeffs.delete();
      rvec.delete(); tvec.delete();
    } catch (e) {

    }
    return estimatePose(lm);
  };

  // compute 3D gaze direction using solvePnP approach (inspired by Amit's article)
  const computeGazeDirection3D = (
    lm: any[],
    videoWidth: number,
    videoHeight: number,
    pose: any
  ): { x: number; y: number } | null => {
    try {
      if (!pose.usedSolvePnP) return null; // need solvePnP for accurate 3D

      // get left/right pupil 2D positions
      const leftPupil = irisCentroid(lm, LEFT_IRIS);
      const rightPupil = irisCentroid(lm, RIGHT_IRIS);

      // use left eye for gaze (can average both in production)
      const pupil2D = [leftPupil.x * videoWidth, leftPupil.y * videoHeight];

      // project pupil 2D -> 3D model space (rough via estimateAffine)
      // we assume pupil is on z=0 plane in image coords, then transform to model
      const cv = (window as any).cv;
      if (!cv || !cvReadyRef.current) return null;

      // simplified: compute gaze vector from eye center to pupil in 3D
      // pupil 3D ≈ transform of 2D point
      // For simplicity, use a rough heuristic: gaze direction = (pupil2D - eyeCenter2D) normalized
      const eyeCenter2D = [(lm[LEFT_EYE_OUTER].x + lm[LEFT_EYE_INNER].x) / 2 * videoWidth, (lm[LEFT_V_TOP].y + lm[LEFT_V_BOTTOM].y) / 2 * videoHeight];
      let gazeVec = [pupil2D[0] - eyeCenter2D[0], pupil2D[1] - eyeCenter2D[1]];

      // normalize
      const mag = Math.hypot(gazeVec[0], gazeVec[1]) || 1;
      gazeVec = [gazeVec[0] / mag, gazeVec[1] / mag];

      // TODO: full 3D projection with solvePnP rvec/tvec (advanced, see article)
      // For now return normalized 2D gaze direction
      return { x: gazeVec[0], y: gazeVec[1] };
    } catch (e) {
      return null;
    }
  };

  // moving-average smoothing utilities
  const pushAndSmoothPose = (v: { yaw: number; pitch: number }) => {
    const h = poseHistoryRef.current;
    h.push(v);
    if (h.length > CFG.poseSmoothWindow) h.shift();
    const avgYaw = h.reduce((s, x) => s + x.yaw, 0) / h.length;
    const avgPitch = h.reduce((s, x) => s + x.pitch, 0) / h.length;
    return { yaw: avgYaw, pitch: avgPitch };
  };

  const pushAndSmoothGaze = (v: { h: number; v: number }) => {
    const h = gazeHistoryRef.current;
    h.push(v);
    if (h.length > CFG.gazeSmoothWindow) h.shift();
    const avgH = h.reduce((s, x) => s + x.h, 0) / h.length;
    const avgV = h.reduce((s, x) => s + x.v, 0) / h.length;
    return { h: avgH, v: avgV, validCount: h.length };
  };

  // ===== Calibration Methods =====
  const startCalibration = (durationSec: number = 8) => {
    // Allow caller to specify duration; default to 8s for a more robust calibration
    const durMs = Math.max(2000, Math.round(durationSec * 1000));
    calibrationDurationRef.current = durMs;
    setIsCalibrating(true);
    setCalibrationCountdown(Math.ceil(durMs / 1000));
    calibrationSamplesRef.current = [];
    calibrationStartRef.current = Date.now();
  };

  const stopCalibration = () => {
    const samples = calibrationSamplesRef.current;
    if (samples.length > 0) {
      const newCalibration = computeCalibrationDataImproved(samples, 1.2, 2.5);
      calibrationRef.current = newCalibration;
      saveCalibration(newCalibration);
      onCalibrationComplete?.(newCalibration);
    }
    setIsCalibrating(false);
    calibrationSamplesRef.current = [];
  };

  // Reset/clear saved calibration data (callable from UI)
  const resetCalibration = () => {
    calibrationRef.current = null;
    try {
      localStorage.removeItem('focus_detection_calibration');
    } catch {}
    // also clear samples/state
    calibrationSamplesRef.current = [];
    setCalibrationCountdown(0);
    setIsCalibrating(false);
  };

  // ===== Auto-tune Thresholds =====
  const percentile = (arr: number[], p: number) => {
    if (!arr.length) return 0;
    const s = arr.slice().sort((a, b) => a - b);
    const idx = Math.max(0, Math.min(s.length - 1, Math.floor((p / 100) * (s.length - 1))));
    return s[idx];
  };

  const finishAutoTune = () => {
    const samples = autoTuneSamplesRef.current;
    isAutoTuningRef.current = false;
    if (autoTuneTimerRef.current) {
      clearTimeout(autoTuneTimerRef.current);
      autoTuneTimerRef.current = null;
    }
    if (!samples.length) return null;

    const headMags = samples.map((s) => Math.hypot(s.headYaw, s.headPitch));
    const pupilMags = samples.map((s) => s.pupilMag).filter((v) => !isNaN(v));
    const gazeDists = samples.map((s) => {
      const gx = s.gazeH ?? 0.5;
      const gy = s.gazeV ?? 0.5;
      return Math.hypot(gx - 0.5, gy - 0.5);
    });

    const strictTurning = Math.max(12, Math.round(percentile(headMags, 85))); // 85th percentile
    const softTurning = Math.max(6, Math.round(percentile(headMags, 60))); // 60th percentile
    const pupilThreshold = Math.min(0.5, Math.max(0.2, percentile(pupilMags, 80) || 0.35));
    const gazeOutThreshold = Math.min(0.18, Math.max(0.06, percentile(gazeDists, 80) || 0.12));

    // Apply tuned thresholds to CFG (mutable object)
    CFG.yawThresholdDeg = strictTurning;
    CFG.pitchThresholdDeg = Math.max(8, Math.round(strictTurning * 0.8));
    // store soft threshold in a property used by classifier (we compute it inline there)
    // expose pupil/gaze thresholds on CFG so they can be tweaked later
    (CFG as any).pupilMagThreshold = pupilThreshold;
    (CFG as any).gazeOutThreshold = gazeOutThreshold;

    // clear collected samples
    autoTuneSamplesRef.current = [];

    // return the recommended values for UI
    return { strictTurning, softTurning, pupilThreshold, gazeOutThreshold };
  };

  const startAutoTune = (durationSec = 10) => {
    autoTuneSamplesRef.current = [];
    isAutoTuningRef.current = true;
    if (autoTuneTimerRef.current) clearTimeout(autoTuneTimerRef.current);
    autoTuneTimerRef.current = setTimeout(() => {
      const result = finishAutoTune();
      // attach result to debug for quick visibility
      setDebug((d) => ({ ...(d ?? {}), calibrationBounds: calibrationRef.current ? { gazeHMin: calibrationRef.current.gazeHMin, gazeHMax: calibrationRef.current.gazeHMax, gazeVMin: calibrationRef.current.gazeVMin, gazeVMax: calibrationRef.current.gazeVMax } : undefined, }));
      // notify via console as well
      console.log('AutoTune finished, recommendations:', result);
    }, durationSec * 1000);
  };

  // ===== Main Detection Logic =====

  // main onResults callback
  const onResults = (results: any) => {
    try {
      if (!results || !results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
        setStatus(FocusStatus.not_detected);
        setDebug(null);
        poseHistoryRef.current = [];
        gazeHistoryRef.current = [];
        if (prevStatusRef.current !== FocusStatus.not_detected) {
          prevStatusRef.current = FocusStatus.not_detected;
          try { onDistraction?.(FocusStatus.not_detected); } catch {}
        }
        return;
      }

      const lm = results.multiFaceLandmarks[0];
      const videoWidth = videoElementRef.current?.videoWidth || 640;
      const videoHeight = videoElementRef.current?.videoHeight || 480;

      // Post landmarks to OpenCV worker for solvePnP (throttle to ~25 fps)
      // IMPROVED: Include eye outline indices for iris validation
      try {
        const now = Date.now();
        if (workerRef.current && now - lastWorkerPostTsRef.current >= TEMPORAL_CONFIG.workerMinIntervalMs) {
          // Only post to worker when it signalled ready to avoid "cv not ready yet" errors
          if (workerReadyRef.current) {
            lastWorkerPostTsRef.current = now;
            workerRef.current.postMessage({
              type: 'process',
              lm,
              videoWidth,
              videoHeight,
              eyeOutlineIndicesLeft: LEFT_EYE_OUTLINE,
              eyeOutlineIndicesRight: RIGHT_EYE_OUTLINE,
            });
          }
          // otherwise skip this frame; worker will process subsequent frames once ready
        }
      } catch (e) {
        // ignore worker post errors
      }

      // 1) estimate pose (use solvePnP if available, else fallback)
      const rawPose = CFG.enableOpenCV ? estimatePoseWithSolvePnP(lm, videoWidth, videoHeight) : estimatePose(lm);
      const pose = pushAndSmoothPose({ yaw: rawPose.yaw, pitch: rawPose.pitch });

      // 2) compute gaze for both eyes (prefer larger iris radius)
      // Note: If worker provided improved irisCentroid, we could use that here for better accuracy
      const left = computeEyeRatio(lm, LEFT_EYE_OUTER, LEFT_EYE_INNER, LEFT_V_TOP, LEFT_V_BOTTOM, LEFT_IRIS);
      const right = computeEyeRatio(lm, RIGHT_EYE_OUTER, RIGHT_EYE_INNER, RIGHT_V_TOP, RIGHT_V_BOTTOM, RIGHT_IRIS);
      let gazeSmoothed: { h: number; v: number; validCount: number } | null = null;
      let leftPupilPos: { x: number; y: number } | undefined;
      let rightPupilPos: { x: number; y: number } | undefined;

      if (left || right) {
        // pick the eye with larger iris radius when available, else average
        if (left && right) {
          const chosen = left.r >= right.r ? left : right;
          gazeSmoothed = pushAndSmoothGaze({ h: chosen.h, v: chosen.v });
          leftPupilPos = irisCentroid(lm, LEFT_IRIS);
          rightPupilPos = irisCentroid(lm, RIGHT_IRIS);
        } else if (left) {
          gazeSmoothed = pushAndSmoothGaze({ h: left.h, v: left.v });
          leftPupilPos = irisCentroid(lm, LEFT_IRIS);
        } else if (right) {
          gazeSmoothed = pushAndSmoothGaze({ h: right.h, v: right.v });
          rightPupilPos = irisCentroid(lm, RIGHT_IRIS);
        }
      }

      let gazePoint: { x: number; y: number } | undefined;
      if ((rawPose as any).gazePoint && (rawPose as any).isValid && (rawPose as any).gazePoint.x !== undefined) {
        gazePoint = { x: (rawPose as any).gazePoint.x * videoWidth, y: (rawPose as any).gazePoint.y * videoHeight };
        lastValidGazeRef.current = gazePoint;
      } else if ((rawPose as any).isValid === false && lastValidGazeRef.current) {
        gazePoint = lastValidGazeRef.current;
      } else {
        const gazeDirFallback = computeGazeDirection3D(lm, videoWidth, videoHeight, rawPose);
        if (gazeDirFallback && gazeSmoothed) {
          const centerX = videoWidth / 2;
          const centerY = videoHeight / 2;
          gazePoint = {
            x: centerX + gazeDirFallback.x * videoWidth * 0.3,
            y: centerY + gazeDirFallback.y * videoHeight * 0.3,
          };
          lastValidGazeRef.current = gazePoint;
        }
      }

      let gazeDir: { x: number; y: number } | null = computeGazeDirection3D(lm, videoWidth, videoHeight, rawPose);

      if (canvasElementRef?.current) {
        try {
          const canvas = canvasElementRef.current;
          const displayW = videoWidth || 640;
          const displayH = videoHeight || 480;
          canvas.style.width = `${displayW}px`;
          canvas.style.height = `${displayH}px`;
          const dpr = window.devicePixelRatio || 1;
          canvas.width = Math.round(displayW * dpr);
          canvas.height = Math.round(displayH * dpr);
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);
            ctx.clearRect(0, 0, displayW, displayH);
          }
        } catch {}
      }

      setDebug({
        landmarks: lm.map((p: any) => ({ x: p.x, y: p.y, z: p.z })),
        leftPupil: leftPupilPos,
        rightPupil: rightPupilPos,
        gazeDirection: gazeDir || undefined,
        gazePoint,
        headPose: { yaw: pose.yaw, pitch: pose.pitch, roll: (rawPose as any).roll },
        usedSolvePnP: rawPose.usedSolvePnP,
      });

      if (isCalibrating) {
        if (gazeSmoothed && leftPupilPos && rightPupilPos) {
          const sample: GazeSample = {
            h: gazeSmoothed.h,
            v: gazeSmoothed.v,
            headYaw: pose.yaw,
            headPitch: pose.pitch,
            pupilLeftX: leftPupilPos.x,
            pupilLeftY: leftPupilPos.y,
            pupilRightX: rightPupilPos.x,
            pupilRightY: rightPupilPos.y,
          };
          calibrationSamplesRef.current.push(sample);
        }

        const elapsedMs = Date.now() - calibrationStartRef.current;
        const targetMs = calibrationDurationRef.current || 5000;
        if (elapsedMs >= targetMs) {
          stopCalibration();
        } else {
          const remainingSecs = Math.ceil((targetMs - elapsedMs) / 1000);
          setCalibrationCountdown(remainingSecs);
          setStatus(FocusStatus.not_detected); // show calibrating state
        }
        return;
      }

      // ==== Load calibration on first run (if available) ====
      if (!calibrationRef.current && CFG.autoLoadCalibration) {
        const saved = loadCalibration();
        if (saved) {
          calibrationRef.current = saved;
        }
      }

      // Priority checks (1..4): not_detected handled above

      // ==== IMPROVED: Multi-tier detection + light compensation + debounce ====
      // Determine raw gaze (from smoothed readings) and compute light compensation
      let compensatedGaze = gazeSmoothed;
      let pupilOffset: { offsetX: number; offsetY: number } | null = null;

      // compute avg pupils even if only one eye detected
      const avgPupilX = ((leftPupilPos?.x ?? 0) + (rightPupilPos?.x ?? 0)) / ((leftPupilPos ? 1 : 0) + (rightPupilPos ? 1 : 0) || 1);
      const avgPupilY = ((leftPupilPos?.y ?? 0) + (rightPupilPos?.y ?? 0)) / ((leftPupilPos ? 1 : 0) + (rightPupilPos ? 1 : 0) || 1);

      if (gazeSmoothed) {
        // light head pose compensation (small effect)
        const compensated = compensateGazeForHeadPoseLight(gazeSmoothed.h, gazeSmoothed.v, pose.yaw, pose.pitch);
        compensatedGaze = { h: compensated.h, v: compensated.v, validCount: gazeSmoothed.validCount };

        // compute pupil offset relative to face center (if any pupil available)
        const lmX = lm.map((l: any) => l.x);
        const lmY = lm.map((l: any) => l.y);
        const minX = Math.min(...lmX);
        const maxX = Math.max(...lmX);
        const minY = Math.min(...lmY);
        const maxY = Math.max(...lmY);
        const faceCenterX = (minX + maxX) / 2;
        const faceCenterY = (minY + maxY) / 2;
        const faceWidth = Math.max(1e-6, maxX - minX);
        const faceHeight = Math.max(1e-6, maxY - minY);

        if ((leftPupilPos || rightPupilPos) && faceWidth > 0 && faceHeight > 0) {
          pupilOffset = computePupilOffset(avgPupilX, faceCenterX, avgPupilY, faceCenterY, faceWidth, faceHeight);
        }
      }

      // prepare calibration/fallback
      const calib: CalibrationData = calibrationRef.current ?? {
        gazeHMean: 0.5,
        gazeVMean: 0.5,
        gazeHStdDev: 0.08,
        gazeVStdDev: 0.08,
        gazeHMin: CFG.gazeHMin,
        gazeHMax: CFG.gazeHMax,
        gazeVMin: CFG.gazeVMin,
        gazeVMax: CFG.gazeVMax,
        recordedAt: Date.now(),
      };

      // Determine gazeState using multi-tier classifier (takes head yaw+pitch into account)
      let gazeState: 'focus' | 'glance' | 'turning' = 'focus';
      if (gazeSmoothed) {
        gazeState = classifyGazeState(pose.yaw, pose.pitch, gazeSmoothed.h, gazeSmoothed.v, calib, {
          strictTurningThreshold: CFG.yawThresholdDeg,
          softTurningThreshold: Math.max(8, CFG.yawThresholdDeg - 6),
          gazeOutThreshold: 0.12,
        });
      } else {
        // if no gaze reading but head rotation large, classify turning
        const headMag = Math.hypot(pose.yaw, pose.pitch);
        if (headMag > CFG.yawThresholdDeg) gazeState = 'turning';
      }

      // pupil-driven fallback: if pupil offset strongly indicates glance, prefer glance (unless turning)
      const pupilMag = pupilOffset ? Math.hypot(pupilOffset.offsetX, pupilOffset.offsetY) : 0;

      // If auto-tuning active, collect sample
      if (isAutoTuningRef.current) {
        autoTuneSamplesRef.current.push({ headYaw: pose.yaw, headPitch: pose.pitch, pupilMag, gazeH: gazeSmoothed?.h, gazeV: gazeSmoothed?.v });
      }

      // Conservative glance detection: require either the classifier to already say 'glance',
      // or require BOTH a sufficiently large pupil offset and projected gaze point off-center.
      // This avoids small jitters being classified as glance.
      const gazePointNormDist = gazePoint ? Math.hypot(gazePoint.x / videoWidth - 0.5, gazePoint.y / videoHeight - 0.5) : 0;
      const PUPIL_THRESHOLD = (CFG as any).pupilMagThreshold ?? THRESHOLDS_DEFAULT.pupilMag;
      const GAZEPOINT_DIST_THRESHOLD = (CFG as any).gazeOutThreshold ?? THRESHOLDS_DEFAULT.gazePointDist;

      if (gazeState !== 'turning') {
        if (gazeState === 'glance') {
          // keep classifier's glance
        } else if (pupilMag > PUPIL_THRESHOLD && gazePoint && gazePointNormDist > GAZEPOINT_DIST_THRESHOLD) {
          // both iris offset and projected gaze indicate off-center → mark glance
          gazeState = 'glance';
        } else {
          // otherwise keep classifier result (likely 'focus')
        }
      }

      // Map to FocusStatus
      let proposedStatus: FocusStatus = FocusStatus.not_detected;
      if (gazeState === 'turning') proposedStatus = FocusStatus.turning;
      else if (gazeState === 'glance') proposedStatus = FocusStatus.glance;
      else proposedStatus = FocusStatus.focus;

      // Improved hysteresis/debounce: require 4 consistent proposed frames to switch
      if (lastProposedRef.current === proposedStatus) {
        proposedCountRef.current += 1;
      } else {
        lastProposedRef.current = proposedStatus;
        proposedCountRef.current = 1;
      }

      if (proposedCountRef.current >= TEMPORAL_CONFIG.confirmFrames && proposedStatus !== prevStatusRef.current) {
        prevStatusRef.current = proposedStatus;
        if (proposedStatus === FocusStatus.turning || proposedStatus === FocusStatus.glance) {
          onDistraction?.(proposedStatus);
        }
        proposedCountRef.current = 0;
      }

      // Update debug info and set visible status to the last committed state
      const newDebugInfo: DebugInfo = {
        landmarks: lm.map((p: any) => ({ x: p.x, y: p.y, z: p.z })),
        leftPupil: leftPupilPos,
        rightPupil: rightPupilPos,
        gazeDirection: gazeDir || undefined,
        gazePoint,
        headPose: { yaw: pose.yaw, pitch: pose.pitch, roll: (rawPose as any).roll },
        usedSolvePnP: rawPose.usedSolvePnP,
        rawGaze: gazeSmoothed ? { h: gazeSmoothed.h, v: gazeSmoothed.v } : undefined,
        compensatedGaze: compensatedGaze ? { h: compensatedGaze.h, v: compensatedGaze.v } : undefined,
        pupilOffset: pupilOffset ? { offsetX: pupilOffset.offsetX, offsetY: pupilOffset.offsetY } : undefined,
        classification: prevStatusRef.current === FocusStatus.turning ? 'turning' : prevStatusRef.current === FocusStatus.glance ? 'glancing' : 'focused',
        calibrationBounds: calibrationRef.current
          ? {
              gazeHMin: calibrationRef.current.gazeHMin,
              gazeHMax: calibrationRef.current.gazeHMax,
              gazeVMin: calibrationRef.current.gazeVMin,
              gazeVMax: calibrationRef.current.gazeVMax,
            }
          : undefined,
      };
      setDebug(newDebugInfo);

      // reflect committed status in hook state
      setStatus(prevStatusRef.current);
    } catch (err) {
      // on unexpected error, mark as not_detected to be safe
      setStatus(FocusStatus.not_detected);
      setDebug(null);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let mounted = true;

    (async () => {
      try {
        // ESM imports from npm-installed @mediapipe packages (only method, no fallback)
        let FaceMesh: any = null;
        let CameraLib: any = null;

        try {
          const mp = await import('@mediapipe/face_mesh');
          const camMod = await import('@mediapipe/camera_utils');
          FaceMesh = (mp as any).FaceMesh ?? (mp as any).FaceMeshSolution ?? (mp as any).default ?? null;
          CameraLib = (camMod as any).Camera ?? (camMod as any).default ?? camMod;
        } catch (importError) {
          console.error('Failed to import MediaPipe ESM modules from npm. Ensure @mediapipe/face_mesh and @mediapipe/camera_utils are installed:', importError);
          return;
        }

        if (!FaceMesh || !CameraLib) {
          console.error('MediaPipe ESM imports did not expose expected classes (FaceMesh or Camera)');
          return;
        }

        console.info('✓ Loaded MediaPipe from npm ESM imports');

        // Create FaceMesh with locateFile pointing to local public/mediapipe/face_mesh/ assets
        const fm = new FaceMesh({
          locateFile: (file: string) => {
            // Serve all assets (wasm, data, js) from public/mediapipe/face_mesh/
            // This directory is populated by copy-mediapipe-assets.js script
            const path = `/mediapipe/face_mesh/${file}`;
            console.debug(`MediaPipe locateFile: ${file} → ${path}`);
            return path;
          },
        });

        fm.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        fm.onResults(onResults);
        faceMeshRef.current = fm;

        // Skip OpenCV entirely to avoid WASM Module conflicts with MediaPipe
        // If you need solvePnP later, consider running OpenCV in a WebWorker
        cvReadyRef.current = false;
        console.info('OpenCV disabled (to avoid WASM module conflicts with MediaPipe). Using 2D pose heuristic.');

        // Initialize OpenCV WebWorker (loads /opencv.js inside worker) if enabled
        if (CFG.enableOpenCV && typeof Worker !== 'undefined') {
          try {
            const w = new Worker('/opencv-worker.js');
            workerRef.current = w;
            w.onmessage = (ev) => {
              const d = ev.data || {};
              if (d.type === 'ready') {
                cvReadyRef.current = true; // worker indicates cv ready inside worker
                workerReadyRef.current = true; // now it's safe to post frames
                console.info('✓ OpenCV worker ready (cv loaded in worker). solvePnP + gaze projection active.');
                setReadyMessage('OpenCV worker ready');
                setIsReady(true);
              } else if (d.type === 'pose' && d.pose) {
                // Store pose + gaze point + iris centroid from worker
                // FIX: Check isValid flag before using gaze data
                if (d.pose.isValid) {
                  lastWorkerPoseRef.current = {
                    yaw: d.pose.yaw,
                    pitch: d.pose.pitch,
                    roll: d.pose.roll,
                    rvec: d.pose.rvec,
                    tvec: d.pose.tvec,
                    gazePoint: d.pose.gazePoint,           // {x, y, confidence} normalized
                    irisCentroid: d.pose.irisCentroid,     // improved iris detection with validation
                    gazeRayHead: d.pose.gazeRayHead,       // for fallback
                    isValid: true,
                    ts: d.pose.ts || Date.now(),
                  };
                } else {
                  // Iris invalid (blink) but head pose still ok
                  lastWorkerPoseRef.current = {
                    yaw: d.pose.yaw,
                    pitch: d.pose.pitch,
                    roll: d.pose.roll,
                    rvec: d.pose.rvec,
                    tvec: d.pose.tvec,
                    gazePoint: null,                       // invalid
                    irisCentroid: null,
                    gazeRayHead: d.pose.gazeRayHead,       // store for fallback
                    isValid: false,
                    ts: d.pose.ts || Date.now(),
                  };
                }
              } else if (d.type === 'error') {
                console.error('⚠️ OpenCV worker error:', d.message);
              }
            };
            w.onerror = (ev) => console.error('⚠️ OpenCV worker runtime error', ev);
          } catch (err) {
            console.warn('Failed to initialize OpenCV worker:', err);
          }
        }

        // Start camera using Camera utility from npm package
        if (videoElementRef.current) {
          const Camera = CameraLib;
          const camera = new Camera(videoElementRef.current, {
            onFrame: async () => {
              const v = videoElementRef.current;
              if (!v) return;

              // Guard: only send frames when the video element has valid data and non-zero dimensions.
              // Calling fm.send with an unready/zero-size video can trigger WebGL errors like
              // "INVALID_VALUE: texImage2D: no video" and framebuffer incomplete errors.
              // Use HAVE_CURRENT_DATA (or HAVE_ENOUGH_DATA) and ensure dimensions are present.
              try {
                if (v.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || v.videoWidth === 0 || v.videoHeight === 0) {
                  // skip this frame; media not ready yet
                  return;
                }

                // Optionally avoid flooding by ensuring we don't spam fm.send at micro-intervals.
                // Most Camera utilities call onFrame at the camera frame rate; keep a minimal throttle.
                const now = performance.now();
                const minIntervalMs = 8; // allow up to ~120fps bursts but avoid tight loops
                if (lastFrameSentTsRef.current && now - lastFrameSentTsRef.current < minIntervalMs) {
                  return;
                }

                await fm.send({ image: v });
                lastFrameSentTsRef.current = now;
              } catch (frameError: unknown) {
                // Log but don't crash on per-frame errors
                if (frameError instanceof Error && frameError.message?.includes('input_frames_gpu')) {
                  // This is a known MediaPipe graph error; usually recovers next frame
                  console.debug('MediaPipe frame processing (will retry next frame):', frameError.message);
                } else {
                  // Other frame errors should be visible for debugging but not fatal
                  console.debug('MediaPipe onFrame error (non-fatal):', frameError);
                }
              }
            },
            width: CAMERA_CONFIG.width,
            height: CAMERA_CONFIG.height,
          });
          camera.start();
          cameraRef.current = camera;
          // Mark UI as ready once camera has started and FaceMesh is configured
          setIsReady(true);
          setReadyMessage('Camera & FaceMesh ready');
          console.info('✓ Camera started');
        }
      } catch (e) {
        // initialization failure — remain safe: no crash, hook will fallback to not_detected
        console.error('useFocusDetection init error:', e);
      }
    })();

    return () => {
      try {
        cameraRef.current?.stop();
      } catch {}
      try {
        faceMeshRef.current?.close();
      } catch {}
      try {
        workerRef.current?.terminate();
        workerRef.current = null;
      } catch {}
    };
  }, [videoElementRef]);

  const stopAutoTune = () => finishAutoTune();

  return { status, debug, startCalibration, calibrationCountdown, isCalibrating, startAutoTune, stopAutoTune, resetCalibration, isReady, readyMessage };
}