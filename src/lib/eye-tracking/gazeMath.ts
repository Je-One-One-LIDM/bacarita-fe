/**
 * Shared gaze math utilities
 * Used by: useFocusDetection hook, utils, and tests
 * Keep logic independent of React/Worker APIs
 */

export function computeIrisCentroid(
  landmarks: Array<{ x: number; y: number } | undefined>,
  irisIndices: number[]
): { x: number; y: number; radius: number; valid: boolean } {
  if (!landmarks || irisIndices.length === 0) {
    return { x: 0.5, y: 0.5, radius: 0, valid: false };
  }

  const pts: Array<{ x: number; y: number }> = [];
  for (const idx of irisIndices) {
    if (idx < landmarks.length && landmarks[idx]) {
      const p = landmarks[idx]!;
      if (typeof p.x === 'number' && typeof p.y === 'number') {
        pts.push(p);
      }
    }
  }

  if (pts.length === 0) {
    return { x: 0.5, y: 0.5, radius: 0, valid: false };
  }

  let cx0 = 0, cy0 = 0;
  for (const p of pts) {
    cx0 += p.x;
    cy0 += p.y;
  }
  cx0 /= pts.length;
  cy0 /= pts.length;

  const dists = pts.map((p) => Math.hypot(p.x - cx0, p.y - cy0));
  const maxDist = Math.max(...dists) || 0.0001;
  const weights = dists.map((d) => 1 - d / maxDist);

  const sumW = weights.reduce((s, w) => s + w, 0) || 1;
  let cx = 0, cy = 0;
  for (let i = 0; i < pts.length; i++) {
    cx += pts[i].x * weights[i];
    cy += pts[i].y * weights[i];
  }
  cx /= sumW;
  cy /= sumW;

  return { x: cx, y: cy, radius: maxDist / 2, valid: true };
}

export function validateIrisInEye(
  iris: { x: number; y: number },
  eyeOutlineIndices: number[],
  landmarks: Array<{ x: number; y: number } | undefined>
): boolean {
  if (!eyeOutlineIndices || eyeOutlineIndices.length === 0) {
    return true;
  }

  const eyePts: Array<{ x: number; y: number }> = [];
  for (const idx of eyeOutlineIndices) {
    if (idx < landmarks.length && landmarks[idx]) {
      const p = landmarks[idx]!;
      if (typeof p.x === 'number' && typeof p.y === 'number') {
        eyePts.push(p);
      }
    }
  }

  if (eyePts.length === 0) return true;

  let minX = eyePts[0].x, maxX = eyePts[0].x, minY = eyePts[0].y, maxY = eyePts[0].y;
  for (const p of eyePts) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }

  const marginX = (maxX - minX) * 0.15;
  const marginY = (maxY - minY) * 0.15;

  return (
    iris.x >= minX - marginX &&
    iris.x <= maxX + marginX &&
    iris.y >= minY - marginY &&
    iris.y <= maxY + marginY
  );
}

export function project3DTo2D(
  point3D: [number, number, number],
  rvec: any,
  tvec: any,
  cameraMatrix: number[],
  cv: any
): { u: number; v: number; pCam: [number, number, number] } {
  const R = new cv.Mat();
  cv.Rodrigues(rvec, R);

  const rData = R.data64F;
  const tvData = tvec.data64F;

  const pCam: [number, number, number] = [
    rData[0] * point3D[0] + rData[1] * point3D[1] + rData[2] * point3D[2] + tvData[0],
    rData[3] * point3D[0] + rData[4] * point3D[1] + rData[5] * point3D[2] + tvData[1],
    rData[6] * point3D[0] + rData[7] * point3D[1] + rData[8] * point3D[2] + tvData[2],
  ];

  R.delete();

  const f = cameraMatrix[0];
  const cx = cameraMatrix[2];
  const cy = cameraMatrix[5];

  const u = f * pCam[0] / (pCam[2] || 1) + cx;
  const v = f * pCam[1] / (pCam[2] || 1) + cy;

  return { u, v, pCam };
}

export function exponentialSmoothing(oldValue: number, newValue: number, alpha: number): number {
  return oldValue * (1 - alpha) + newValue * alpha;
}

export function exponentialSmoothingVec3(
  old: [number, number, number],
  neu: [number, number, number],
  alpha: number
): [number, number, number] {
  return [
    exponentialSmoothing(old[0], neu[0], alpha),
    exponentialSmoothing(old[1], neu[1], alpha),
    exponentialSmoothing(old[2], neu[2], alpha),
  ];
}

export function movingAverage(buffer: number[], newValue: number, windowSize: number): number {
  buffer.push(newValue);
  if (buffer.length > windowSize) {
    buffer.shift();
  }
  return buffer.reduce((s, v) => s + v, 0) / buffer.length;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function distance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.hypot(dx, dy);
}

export function normalizeVector(v: [number, number, number]): [number, number, number] {
  const mag = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / mag, v[1] / mag, v[2] / mag];
}

export default {
  computeIrisCentroid,
  validateIrisInEye,
  project3DTo2D,
  exponentialSmoothing,
  exponentialSmoothingVec3,
  movingAverage,
  clamp,
  distance,
  normalizeVector,
};