import { Environment, Lightformer } from '@react-three/drei'

import { BRAND } from '../branding/colors'

/**
 * Self-contained studio environment built from Lightformers — no HDR download,
 * so it can't stall first paint and works offline. The rect "softboxes" become
 * the reflections you see sliding across the phone's glass and metal as it
 * rotates; the warm ones tint the edges with the app's brand red.
 *
 * Direct key/fill lights add shape on top of the image-based reflections.
 */
export function Lighting() {
  return (
    <>
      <Environment resolution={256}>
        {/* Big soft key from upper-front — the main glass highlight */}
        <Lightformer
          form="rect"
          intensity={3}
          position={[0, 3, 5]}
          scale={[14, 7, 1]}
          color="#ffffff"
        />
        {/* Cool fill from the left */}
        <Lightformer
          form="rect"
          intensity={1.6}
          position={[-5, 0, 3]}
          scale={[6, 10, 1]}
          color="#dfe7ff"
        />
        {/* Warm brand rim from the right */}
        <Lightformer
          form="rect"
          intensity={2.2}
          position={[5, -1, 2]}
          scale={[6, 10, 1]}
          color={BRAND.primary}
        />
        {/* Back ring for edge separation */}
        <Lightformer
          form="ring"
          intensity={1.4}
          position={[0, 2, -5]}
          scale={6}
          color="#ffb4b4"
        />
      </Environment>

      <ambientLight intensity={0.3} />
      <directionalLight position={[4, 6, 6]} intensity={1.8} />
      <directionalLight position={[-6, 2, -4]} intensity={0.5} color={BRAND.primary} />
    </>
  )
}
