/** Linear interpolation. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/** Clamp a value between min and max. */
export function clamp(v: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, v))
}
