import { Canvas } from '@react-three/fiber'

import { Starfield } from './Starfield'

/**
 * Starfield on its own fixed, full-screen canvas — separate from the phone so
 * the phone layer can fade independently (Orbital Pay) without taking the stars
 * with it. Same camera as the phone canvas so depth/parallax line up; sits a
 * layer below it. Transparent clear so the background still shows through.
 */
export function StarfieldScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 12], fov: 35 }}
      aria-hidden
    >
      <Starfield />
    </Canvas>
  )
}
