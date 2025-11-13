/**
 * Gaze Calibration & Improved Detection Utilities
 * Based on Amit Aflalo's 3D gaze estimation approach
 */

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

export interface GazeSample {
  h: number;
  v: number;
  headYaw: number;
  headPitch: number;
  pupilLeftX?: number;
  pupilLeftY?: number;
  pupilRightX?: number;
  pupilRightY?: number;
}

export function classifyGazeState(
  headYawDeg: number,
  headPitchDeg: number,
  gazeH: number,
  gazeV: number,
  calibration: CalibrationData,
  options?: {
    strictTurningThreshold?: number;
    softTurningThreshold?: number;
    gazeOutThreshold?: number;
  }
): 'focus' | 'glance' | 'turning' {
  const {
    strictTurningThreshold = 18,
    softTurningThreshold = 8,
    gazeOutThreshold = 0.12,
  } = options ?? {};

  const headRotMag = Math.sqrt(headYawDeg ** 2 + headPitchDeg ** 2);

  if (headRotMag > strictTurningThreshold) {
    return 'turning';
  }

  if (headRotMag > softTurningThreshold) {
    const mildCompensationH = (headYawDeg / 60) * 0.05;
    const mildCompensationV = (headPitchDeg / 60) * 0.04;
    
    const compH = gazeH - mildCompensationH;
    const compV = gazeV - mildCompensationV;
    
    if (
      compH < calibration.gazeHMin - gazeOutThreshold ||
      compH > calibration.gazeHMax + gazeOutThreshold ||
      compV < calibration.gazeVMin - gazeOutThreshold ||
      compV > calibration.gazeVMax + gazeOutThreshold
    ) {
      return 'glance';
    }
    return 'focus';
  }

  if (
    gazeH < calibration.gazeHMin ||
    gazeH > calibration.gazeHMax ||
    gazeV < calibration.gazeVMin ||
    gazeV > calibration.gazeVMax
  ) {
    return 'glance';
  }

  return 'focus';
}

export function computeCalibrationDataImproved(
  samples: GazeSample[],
  kStdDev: number = 1.2,
  outlierThreshold: number = 2.5
): CalibrationData {
  if (samples.length === 0) {
    return {
      gazeHMean: 0.5,
      gazeVMean: 0.5,
      gazeHStdDev: 0.08,
      gazeVStdDev: 0.08,
      gazeHMin: 0.35,
      gazeHMax: 0.65,
      gazeVMin: 0.38,
      gazeVMax: 0.70,
      recordedAt: Date.now(),
    };
  }

  let hs = samples.map((s) => s.h);
  let vs = samples.map((s) => s.v);

  const gazeHMean = hs.reduce((a, b) => a + b, 0) / hs.length;
  const gazeVMean = vs.reduce((a, b) => a + b, 0) / vs.length;

  let gazeHStdDev = Math.sqrt(hs.reduce((s, h) => s + (h - gazeHMean) ** 2, 0) / hs.length);
  let gazeVStdDev = Math.sqrt(vs.reduce((s, v) => s + (v - gazeVMean) ** 2, 0) / vs.length);

  hs = hs.filter((h) => Math.abs(h - gazeHMean) < outlierThreshold * gazeHStdDev);
  vs = vs.filter((v) => Math.abs(v - gazeVMean) < outlierThreshold * gazeVStdDev);

  if (hs.length > 5 && vs.length > 5) {
    const newHMean = hs.reduce((a, b) => a + b, 0) / hs.length;
    const newVMean = vs.reduce((a, b) => a + b, 0) / vs.length;
    gazeHStdDev = Math.sqrt(hs.reduce((s, h) => s + (h - newHMean) ** 2, 0) / hs.length);
    gazeVStdDev = Math.sqrt(vs.reduce((s, v) => s + (v - newVMean) ** 2, 0) / vs.length);

    return {
      gazeHMean: newHMean,
      gazeVMean: newVMean,
      gazeHStdDev: Math.max(0.08, gazeHStdDev),
      gazeVStdDev: Math.max(0.08, gazeVStdDev),
      gazeHMin: Math.max(0.2, newHMean - kStdDev * gazeHStdDev),
      gazeHMax: Math.min(0.8, newHMean + kStdDev * gazeHStdDev),
      gazeVMin: Math.max(0.2, newVMean - kStdDev * gazeVStdDev),
      gazeVMax: Math.min(0.8, newVMean + kStdDev * gazeVStdDev),
      recordedAt: Date.now(),
    };
  }

  return {
    gazeHMean,
    gazeVMean,
    gazeHStdDev: Math.max(0.08, gazeHStdDev),
    gazeVStdDev: Math.max(0.08, gazeVStdDev),
    gazeHMin: 0.35,
    gazeHMax: 0.65,
    gazeVMin: 0.38,
    gazeVMax: 0.70,
    recordedAt: Date.now(),
  };
}

export function compensateGazeForHeadPoseLight(
  gazeH: number,
  gazeV: number,
  headYawDeg: number,
  headPitchDeg: number
): { h: number; v: number } {
  const yawEffect = (headYawDeg / 60) * 0.05;
  const pitchEffect = (headPitchDeg / 60) * 0.04;

  return {
    h: Math.max(0, Math.min(1, gazeH - yawEffect)),
    v: Math.max(0, Math.min(1, gazeV - pitchEffect)),
  };
}

export function computePupilOffset(
  pupilCenterX: number,
  faceCenterX: number,
  pupilCenterY: number,
  faceCenterY: number,
  faceWidth: number,
  faceHeight: number
): { offsetX: number; offsetY: number } {
  const offsetX = (pupilCenterX - faceCenterX) / (faceWidth / 2);
  const offsetY = (pupilCenterY - faceCenterY) / (faceHeight / 2);
  return {
    offsetX: Math.max(-1, Math.min(1, offsetX)),
    offsetY: Math.max(-1, Math.min(1, offsetY)),
  };
}


export function computeCalibrationData(samples: GazeSample[], kStdDev: number = 1.5): CalibrationData {
  if (samples.length === 0) {
    return {
      gazeHMean: 0.5,
      gazeVMean: 0.5,
      gazeHStdDev: 0.1,
      gazeVStdDev: 0.1,
      gazeHMin: 0.32,
      gazeHMax: 0.68,
      gazeVMin: 0.36,
      gazeVMax: 0.72,
      recordedAt: Date.now(),
    };
  }

  const hs = samples.map((s) => s.h);
  const vs = samples.map((s) => s.v);

  const gazeHMean = hs.reduce((a, b) => a + b, 0) / hs.length;
  const gazeVMean = vs.reduce((a, b) => a + b, 0) / vs.length;

  const gazeHStdDev = Math.sqrt(hs.reduce((s, h) => s + (h - gazeHMean) ** 2, 0) / hs.length);
  const gazeVStdDev = Math.sqrt(vs.reduce((s, v) => s + (v - gazeVMean) ** 2, 0) / vs.length);

  return {
    gazeHMean,
    gazeVMean,
    gazeHStdDev,
    gazeVStdDev,
    gazeHMin: Math.max(0, gazeHMean - kStdDev * gazeHStdDev),
    gazeHMax: Math.min(1, gazeHMean + kStdDev * gazeHStdDev),
    gazeVMin: Math.max(0, gazeVMean - kStdDev * gazeVStdDev),
    gazeVMax: Math.min(1, gazeVMean + kStdDev * gazeVStdDev),
    recordedAt: Date.now(),
  };
}

export function saveCalibration(calibration: CalibrationData): void {
  try {
    localStorage.setItem('focus_detection_calibration', JSON.stringify(calibration));
  } catch {}
}

export function loadCalibration(): CalibrationData | null {
  try {
    const stored = localStorage.getItem('focus_detection_calibration');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function compensateGazeForHeadPose(
  gazeH: number,
  gazeV: number,
  headYawDeg: number,
  headPitchDeg: number,
  maxHeadRotation: number = 60
): { h: number; v: number } {
  const yawNorm = Math.max(-1, Math.min(1, headYawDeg / maxHeadRotation));
  const pitchNorm = Math.max(-1, Math.min(1, headPitchDeg / maxHeadRotation));

  const compensatedH = Math.max(0, Math.min(1, gazeH - yawNorm * 0.15));
  const compensatedV = Math.max(0, Math.min(1, gazeV - pitchNorm * 0.12));

  return { h: compensatedH, v: compensatedV };
}

export function computeGazeVectorNormalized(
  leftIrisX: number,
  leftIrisY: number,
  rightIrisX: number,
  rightIrisY: number,
  leftEyeOuterX: number,
  leftEyeOuterY: number,
  leftEyeInnerX: number,
  leftEyeInnerY: number,
  rightEyeOuterX: number,
  rightEyeOuterY: number,
  rightEyeInnerX: number,
  rightEyeInnerY: number,
  headYawDeg: number,
  headPitchDeg: number
): { h: number; v: number } {
  const leftEyeCenterX = (leftEyeOuterX + leftEyeInnerX) / 2;
  const leftEyeCenterY = (leftEyeOuterY + leftEyeInnerY) / 2;
  const rightEyeCenterX = (rightEyeOuterX + rightEyeInnerX) / 2;
  const rightEyeCenterY = (rightEyeOuterY + rightEyeInnerY) / 2;

  const leftGazeX = leftIrisX - leftEyeCenterX;
  const leftGazeY = leftIrisY - leftEyeCenterY;
  const rightGazeX = rightIrisX - rightEyeCenterX;
  const rightGazeY = rightIrisY - rightEyeCenterY;

  const avgGazeX = (leftGazeX + rightGazeX) / 2;
  const avgGazeY = (leftGazeY + rightGazeY) / 2;

  const yawNorm = Math.max(-1, Math.min(1, headYawDeg / 60));
  const pitchNorm = Math.max(-1, Math.min(1, headPitchDeg / 60));

  const compensatedH = avgGazeX - yawNorm * 0.2;
  const compensatedV = avgGazeY - pitchNorm * 0.15;

  const normalizedH = Math.max(0, Math.min(1, 0.5 + compensatedH));
  const normalizedV = Math.max(0, Math.min(1, 0.5 + compensatedV));

  return { h: normalizedH, v: normalizedV };
}

export function classifyGazeChange(
  headYawDeg: number,
  headPitchDeg: number,
  pupilOffsetX: number,
  pupilOffsetY: number,
  headTurnThreshold: number = 15,
  pupilOffsetThreshold: number = 0.4
): 'turning' | 'glancing' | 'focused' {
  const headRotationMagnitude = Math.sqrt(headYawDeg ** 2 + headPitchDeg ** 2);
  const pupilOffsetMagnitude = Math.sqrt(pupilOffsetX ** 2 + pupilOffsetY ** 2);

  if (headRotationMagnitude > headTurnThreshold) {
    return 'turning';
  }

  if (pupilOffsetMagnitude > pupilOffsetThreshold) {
    return 'glancing';
  }

  return 'focused';
}

export function averageEyeGaze(
  leftEyeH: number | undefined,
  leftEyeV: number | undefined,
  rightEyeH: number | undefined,
  rightEyeV: number | undefined
): { h: number; v: number } | null {
  const validEyes = [];
  if (leftEyeH !== undefined && leftEyeV !== undefined) validEyes.push({ h: leftEyeH, v: leftEyeV });
  if (rightEyeH !== undefined && rightEyeV !== undefined) validEyes.push({ h: rightEyeH, v: rightEyeV });

  if (validEyes.length === 0) return null;

  const avgH = validEyes.reduce((s, e) => s + e.h, 0) / validEyes.length;
  const avgV = validEyes.reduce((s, e) => s + e.v, 0) / validEyes.length;

  return { h: avgH, v: avgV };
}
