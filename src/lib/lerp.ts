/** Linear interpolation. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/** Clamp a value between min and max. */
export function clamp(v: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, v))
}

/**
 * Frame-rate independent damping factor.
 * `smoothing` ~= how much of the remaining distance is closed per frame at 60fps.
 * Use as: current = lerp(current, target, damp(smoothing, dt)).
 */
export function damp(smoothing: number, dt: number): number {
  return 1 - Math.pow(1 - smoothing, dt * 60)
}

/** Normalize a value within [min, max] to 0..1, clamped. */
export function normalize(v: number, min: number, max: number): number {
  return clamp((v - min) / (max - min))
}
