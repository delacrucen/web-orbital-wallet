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

/**
 * Pinch-to-zoom multiplier on the phone (touch only). 1 = base. Clamped to a
 * safe ceiling so the app-screen textures never zoom past their native
 * resolution and reveal pixelation. Written by `usePinchZoom`, read in the
 * render loop and eased onto the phone scale.
 */
export const pinchState = {
  scale: 1,
}

/**
 * Viewport layout mode, read by the render loop to pick the phone choreography.
 * Plain mutable (not React state) — a matchMedia listener (`useLayoutMode`) keeps
 * it in sync; DOM layout itself is handled by Tailwind responsive classes.
 */
export const layoutState = {
  /** Narrow viewport (phones): stacked, phone-centered choreography. */
  mobile:
    typeof window !== 'undefined'
      ? window.matchMedia('(max-width: 768px)').matches
      : false,
}
