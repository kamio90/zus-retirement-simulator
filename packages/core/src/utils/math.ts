/**
 * Math utilities for pension engine
 * - compound: multiply sequence of rates
 * - clamp: restrict value to bounds
 * - safeMulDiv: multiply then divide, zero-protected
 * - approxEqual: test approximate equality
 */
export function compound(rates: number[]): number {
  return rates.reduce((acc, r) => acc * r, 1);
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function safeMulDiv(a: number, b: number, d: number): number {
  if (d === 0) return 0;
  return (a * b) / d;
}

export function approxEqual(a: number, b: number, epsilon = 1e-6): boolean {
  return Math.abs(a - b) < epsilon;
}
