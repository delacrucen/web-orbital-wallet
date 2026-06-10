/**
 * App-lifecycle signals shared with the R3F render loop, as a plain mutable
 * object (no React state) so `useFrame` can read it without re-rendering — same
 * pattern as the scroll/pointer store.
 */
export const stage = {
  /** Flipped true the moment the startup loader begins revealing the scene. */
  revealed: false,
}
