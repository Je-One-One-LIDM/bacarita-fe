/**
 * Centralized gaze detection configuration
 * Single source of truth for all indices, model points, and thresholds
 * Used by: useFocusDetection hook, utils, worker, and unit tests
 */

export const MEDIAPIPE_INDICES = {
  FACE_OUTLINE: [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109],
  
  LEFT_EYE_OUTER: 33,
  LEFT_EYE_INNER: 133,
  RIGHT_EYE_OUTER: 362,
  RIGHT_EYE_INNER: 263,
  
  LEFT_EYE_TOP: 159,
  LEFT_EYE_BOTTOM: 145,
  RIGHT_EYE_TOP: 386,
  RIGHT_EYE_BOTTOM: 374,
  
  LEFT_IRIS: [474, 475, 476, 477, 478],
  RIGHT_IRIS: [469, 470, 471, 472, 473],
  
  LEFT_EYE_OUTLINE: [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246],
  RIGHT_EYE_OUTLINE: [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398],
  
  SOLVEPNP_IDX: [1, 33, 263, 61, 291, 152],
};

export const MODEL_POINTS_3D = [
  [0.0, 0.0, 0.0],
  [-30.0, -65.0, -5.0],
  [30.0, -65.0, -5.0],
  [-20.0, -20.0, -30.0],
  [20.0, -20.0, -30.0],
  [0.0, 50.0, -45.0],
];

export const EYE_CENTERS_3D = {
  LEFT: [-20.0, -65.0, 5.0],
  RIGHT: [20.0, -65.0, 5.0],
  RADIUS: 12.0,
};

export const THRESHOLDS_DEFAULT = {
  yaw: 16,
  pitch: 12,
  pupilMag: 0.28,
  gazePointDist: 0.14,
  gazeHMin: 0.32,
  gazeHMax: 0.68,
  gazeVMin: 0.36,
  gazeVMax: 0.72,
};

export const TEMPORAL_CONFIG = {
  poseSmoothWindow: 3,
  gazeSmoothWindow: 5,
  confirmFrames: 4,
  confirmFramesStrict: 6,
  workerMinIntervalMs: 40,
  workerFreshMs: 300,
  gazeRayAlpha: 0.25,
};

export const CALIBRATION_DEFAULTS = {
  gazeHMean: 0.5,
  gazeVMean: 0.5,
  gazeHStdDev: 0.08,
  gazeVStdDev: 0.08,
};

export const CAMERA_CONFIG = {
  width: 640,
  height: 480,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
  maxNumFaces: 1,
  refineLandmarks: true,
};

export interface WorkerMessage {
  type: 'ready' | 'pose' | 'error';
  data?: any;
  message?: string;
}

export interface PoseResult {
  yaw: number;
  pitch: number;
  roll: number;
  rvec: number[];
  tvec: number[];
  gazePoint: { x: number; y: number; confidence: number } | null;
  gazeRayCamera: { x: number; y: number; z: number } | null;
  gazeRayHead: { x: number; y: number; z: number };
  irisCentroid: { x: number; y: number; radius: number; valid: boolean } | null;
  isValid: boolean;
  usedSolvePnP: boolean;
  ts: number;
}

export const FEATURES = {
  enableOpenCV: true,
  enableAutoTune: false,
  autoLoadCalibration: true,
  enableDebugOverlay: false,
};

export default {
  MEDIAPIPE_INDICES,
  MODEL_POINTS_3D,
  EYE_CENTERS_3D,
  THRESHOLDS_DEFAULT,
  TEMPORAL_CONFIG,
  CALIBRATION_DEFAULTS,
  CAMERA_CONFIG,
  FEATURES,
};