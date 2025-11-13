import React, { useEffect, useState } from 'react';

/**
 * Simple 5-point calibration component.
 * It emits mapping coefficients after calibration:
 * transform(x,y) -> { x: x', y: y' } where values are normalized (0..1).
 *
 * The calibration computes an affine transform:
 * x' = a*x + b*y + c
 * y' = d*x + e*y + f
 *
 * Props:
 * - onComplete(transform) called with a function that maps {x,y} normalized -> normalized
 */

type Point = { x: number; y: number };
type Transform = { a: number; b: number; c: number; d: number; e: number; f: number };

function solveAffine(src: Point[], dst: Point[]): Transform | null {
  // Build normal equations for linear least squares: 6 params
  // We solve for params p s.t. A * p = b, where each row contributes:
  // [x y 1 0 0 0] * [a b c d e f]^T = x'
  // [0 0 0 x y 1] * p = y'
  // Build ATA (6x6) and ATb (6x1)
  const n = src.length;
  if (n < 3) return null;
  const ATA = Array.from({ length: 6 }, () => Array(6).fill(0));
  const ATb = Array(6).fill(0);

  for (let i = 0; i < n; i++) {
    const xs = src[i].x;
    const ys = src[i].y;
    const xd = dst[i].x;
    const yd = dst[i].y;
    const row1 = [xs, ys, 1, 0, 0, 0];
    const row2 = [0, 0, 0, xs, ys, 1];
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        ATA[r][c] += row1[r] * row1[c] + row2[r] * row2[c];
      }
      ATb[r] += row1[r] * xd + row2[r] * yd;
    }
  }

  // Solve ATA * p = ATb via Gaussian elimination (6x6)
  const A = ATA.map((row, i) => [...row, ATb[i]]); // augmented
  const m = 6;
  for (let i = 0; i < m; i++) {
    // pivot
    let maxRow = i;
    for (let k = i + 1; k < m; k++) {
      if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) maxRow = k;
    }
    if (Math.abs(A[maxRow][i]) < 1e-12) return null; // singular
    // swap
    if (i !== maxRow) {
      const tmp = A[i];
      A[i] = A[maxRow];
      A[maxRow] = tmp;
    }
    // normalize row
    const diag = A[i][i];
    for (let j = i; j <= m; j++) A[i][j] /= diag;
    // eliminate
    for (let r = 0; r < m; r++) {
      if (r === i) continue;
      const factor = A[r][i];
      for (let c = i; c <= m; c++) {
        A[r][c] -= factor * A[i][c];
      }
    }
  }

  const p = A.map((row) => row[m]);
  return { a: p[0], b: p[1], c: p[2], d: p[3], e: p[4], f: p[5] };
}

export const Calibration: React.FC<{
  onComplete: (mapFn: (pt: Point) => Point) => void;
}> = ({ onComplete }) => {
  const targets = [
    { x: 0.5, y: 0.5 },
    { x: 0.1, y: 0.1 },
    { x: 0.9, y: 0.1 },
    { x: 0.1, y: 0.9 },
    { x: 0.9, y: 0.9 },
  ];
  const [step, setStep] = useState(0);
  const [collectedSrc, setCollectedSrc] = useState<{ x: number; y: number }[]>([]);
  const [collectedDst, setCollectedDst] = useState<{ x: number; y: number }[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // This component does not capture gaze points itself.
  // Instead, the host should call `record(gaze)` on each sample; for simplicity here we simulate manual clicking.
  const next = () => {
    if (step >= targets.length) return;
    setStep((s) => s + 1);
  };

  // For prototyping, we assume host will provide pairs by calling onComplete with transform.
  // Provide a "skip" that returns identity mapping
  const finishIdentity = () => {
    onComplete((p) => ({ x: p.x, y: p.y }));
  };

  return (
    <div style={{ padding: 8 }}>
      <div>
        <strong>Kalibrasi (prototype)</strong>
        <div style={{ marginTop: 8 }}>
          <p>Fitur kalibrasi akan muncul di versi lebih lengkap. Untuk saat ini, gunakan kalibrasi sederhana di UI.</p>
          <button onClick={finishIdentity}>Gunakan mapping default (tanpa kalibrasi)</button>
        </div>
      </div>
    </div>
  );
};