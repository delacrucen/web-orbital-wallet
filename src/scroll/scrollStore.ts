/**
 * Mutable, render-loop-friendly shared state.
 *
 * These are plain mutable objects (NOT React state) so the R3F render loop can
 * read them every frame without triggering re-renders. Lenis writes scroll;
 * a pointer listener writes pointer; `useFrame` consumers lerp toward them.
 */

export const scrollState = {
  /** Whole-page scroll progress, 0 (top) → 1 (bottom). */
  progress: 0,
  /** Smoothed Lenis scroll velocity (px/frame-ish). Spiky raw signal, smooth here. */
  velocity: 0,
}

export const pointerState = {
  /** Normalized pointer X, -1 (left) → 1 (right). */
  x: 0,
  /** Normalized pointer Y, -1 (top) → 1 (bottom). */
  y: 0,
}
