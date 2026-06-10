import { useEffect } from 'react'

import { pointerState } from './scrollStore'

/**
 * Tracks the pointer and writes a normalized -1..1 offset into the shared store.
 * Consumers (phone, starfield) lerp toward it for an eased parallax feel.
 * Disabled when the user prefers reduced motion.
 */
export function usePointerParallax() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const onMove = (e: PointerEvent) => {
      // Touch parallax is driven by the gyroscope (`useDeviceTilt`); ignore
      // pointer events synthesized from touch so the two don't fight.
      if (e.pointerType && e.pointerType !== 'mouse') return
      pointerState.x = (e.clientX / window.innerWidth) * 2 - 1
      pointerState.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])
}
