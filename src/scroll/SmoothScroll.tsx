import { useEffect } from 'react'
import Lenis from 'lenis'

import { scrollState } from './scrollStore'

/**
 * Initializes Lenis smooth scroll and feeds the shared scroll store.
 * Renders nothing — mount once near the page root.
 *
 * Lenis gives us a clean, smoothed scroll signal: `progress` (0→1) drives the
 * choreography clock, `velocity` drives the starfield warp later.
 */
export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      // touch uses native scrolling; smoothing touch tends to feel laggy
      syncTouch: false,
    })

    let rafId = 0
    const raf = (time: number) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    lenis.on('scroll', (e: { progress: number; velocity: number }) => {
      scrollState.progress = e.progress
      scrollState.velocity = e.velocity
    })

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  return null
}
