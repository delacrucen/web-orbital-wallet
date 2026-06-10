import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'

import { Lighting } from './Lighting'
import { Phone } from './Phone'

/**
 * The single, fixed, full-screen canvas. Never unmounts for the life of the
 * page — only the phone's transform and (later) screen texture change. Sits
 * behind the marketing copy via z-index in the page layout.
 */
export function Scene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true }}
      camera={{ position: [0, 0, 12], fov: 35 }}
      aria-hidden
    >
      <Suspense fallback={null}>
        <Lighting />
        <Phone />
      </Suspense>
    </Canvas>
  )
}
