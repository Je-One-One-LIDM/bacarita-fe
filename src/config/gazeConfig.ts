/**
 * Centralized gaze detection configuration
 * Single source of truth for all indices, model points, and thresholds
 * Used by: useFocusDetection hook, utils, worker, and unit tests
 */

// ===== MediaPipe Landmark Indices (468-point refined model) =====
export const MEDIAPIPE_INDICES = {
  // Face outline
  FACE_OUTLINE: [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109],
  
  // Eyes - outer/inner corners
  LEFT_EYE_OUTER: 33,
  LEFT_EYE_INNER: 133,
  RIGHT_EYE_OUTER: 362,
  RIGHT_EYE_INNER: 263,
  
  // Eyes - vertical extremes (for iris to eye ratio)
  LEFT_EYE_TOP: 159,
  LEFT_EYE_BOTTOM: 145,
  RIGHT_EYE_TOP: 386,
  RIGHT_EYE_BOTTOM: 374,
  
  // Iris (5 points per eye in refined model)
  LEFT_IRIS: [474, 475, 476, 477, 478],
  RIGHT_IRIS: [469, 470, 471, 472, 473],
  
  // Eye outline (16 points for bounding validation)
  LEFT_EYE_OUTLINE: [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246],
  RIGHT_EYE_OUTLINE: [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398],
  
  // solvePnP reference points (6 points: nose, eyes, mouth, chin)
  SOLVEPNP_IDX: [1, 33, 263, 61, 291, 152],
};

// ===== 3D Model Points (for solvePnP) =====
// Approximate 3D face model (in mm, nose tip as origin)
export const MODEL_POINTS_3D = [
  [0.0, 0.0, 0.0],       // 0: nose tip (origin)
  [-30.0, -65.0, -5.0],  // 1: left eye corner
  [30.0, -65.0, -5.0],   // 2: right eye corner
  [-20.0, -20.0, -30.0], // 3: left mouth corner
  [20.0, -20.0, -30.0],  // 4: right mouth corner
  [0.0, 50.0, -45.0],    // 5: chin
];

// ===== Eye Centers in 3D Model Space (mm) =====
export const EYE_CENTERS_3D = {
  LEFT: [-20.0, -65.0, 5.0],
  RIGHT: [20.0, -65.0, 5.0],
  RADIUS: 12.0, // approximate eye sphere radius
};

// ===== Detection Thresholds (tunable via auto-tune) =====
export const THRESHOLDS_DEFAULT = {
  // Head pose (degrees)
  yaw: 16,           // turn-head threshold (degrees)
  pitch: 12,         // up/down-head threshold (degrees)
  
  // Pupil offset (normalized 0..1)
  pupilMag: 0.28,    // iris offset magnitude to indicate glance (can be auto-tuned)
  
  // Gaze point projection (normalized distance from screen center)
  gazePointDist: 0.14, // off-screen distance to indicate glance
  
  // Calibration bounds (screen coordinates, normalized)
  gazeHMin: 0.32,
  gazeHMax: 0.68,
  gazeVMin: 0.36,
  gazeVMax: 0.72,
};

// ===== Temporal Smoothing & Debounce =====
export const TEMPORAL_CONFIG = {
  // Moving average windows (frames)
  poseSmoothWindow: 3,
  gazeSmoothWindow: 5,
  
  // Hysteresis (frame confirmation before state change)
  confirmFrames: 4, // require 4 consecutive frames of same proposed status
  confirmFramesStrict: 6, // for critical state changes
  
  // Worker throttling (milliseconds)
  workerMinIntervalMs: 40,      // ~25 fps
  workerFreshMs: 300,           // max age of worker pose to use
  
  // Temporal smoothing factors (exponential: 0..1)
  gazeRayAlpha: 0.25,           // gaze ray smoothing
};

// ===== Calibration Defaults =====
export const CALIBRATION_DEFAULTS = {
  gazeHMean: 0.5,
  gazeVMean: 0.5,
  gazeHStdDev: 0.08,
  gazeVStdDev: 0.08,
};

// ===== Camera Defaults =====
export const CAMERA_CONFIG = {
  width: 640,
  height: 480,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
  maxNumFaces: 1,
  refineLandmarks: true,
};

// ===== Worker Message Protocol =====
// Ensures consistent shape across all worker <-> main communication
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
  gazePoint: { x: number; y: number; confidence: number } | null; // normalized [0..1]
  gazeRayCamera: { x: number; y: number; z: number } | null;
  gazeRayHead: { x: number; y: number; z: number };
  irisCentroid: { x: number; y: number; radius: number; valid: boolean } | null;
  isValid: boolean; // iris and gaze valid (not blink/occlusion)
  usedSolvePnP: boolean;
  ts: number; // timestamp (Date.now())
}

// ===== Feature Flags =====
export const FEATURES = {
  enableOpenCV: true,      // use OpenCV worker for solvePnP
  enableAutoTune: false,   // auto-tune thresholds (can be activated by user)
  autoLoadCalibration: true, // load calibration from localStorage
  enableDebugOverlay: false, // show debug info on screen
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
