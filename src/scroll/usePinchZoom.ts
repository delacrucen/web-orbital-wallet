import { useEffect } from 'react'

import { clamp } from '../lib/lerp'
import { pinchState } from './scrollStore'

/**
 * Two-finger pinch-to-zoom on the phone (touch devices only). Maps the pinch
 * gesture to a scale multiplier in `pinchState.scale`, which the render loop
 * eases onto the phone. Clamped between 1× and a safe ceiling so the app-screen
 * textures never zoom past their native resolution and go pixelated; the gesture
 * just "locks" once it hits the cap. Native page pinch-zoom is suppressed so only
 * the phone responds.
 *
 * Single-finger swipes are left to `SmoothScroll` (pagination); this only acts on
 * two-finger gestures.
 */

/** Hard ceiling — keep below the point where the webp screens start to soften. */
const MAX_ZOOM = 1.7
const MIN_ZOOM = 1

// iOS Safari fires non-standard gesture events for pinch; not in the DOM types.
const w = window as unknown as {
  addEventListener(type: string, listener: EventListener): void
  removeEventListener(type: string, listener: EventListener): void
}

export function usePinchZoom() {
  useEffect(() => {
    const coarse = window.matchMedia('(pointer: coarse)').matches
    if (!coarse) return

    let startDist = 0
    let startScale = 1
    let pinching = false

    const distance = (touches: TouchList) => {
      const dx = touches[0].clientX - touches[1].clientX
      const dy = touches[0].clientY - touches[1].clientY
      return Math.hypot(dx, dy)
    }

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 2) return
      pinching = true
      startDist = distance(e.touches)
      startScale = pinchState.scale
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!pinching || e.touches.length !== 2) return
      if (e.cancelable) e.preventDefault()
      const ratio = distance(e.touches) / startDist
      pinchState.scale = clamp(startScale * ratio, MIN_ZOOM, MAX_ZOOM)
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) pinching = false
    }

    // Suppress iOS Safari's native page pinch so only the phone scales.
    const blockGesture = (e: Event) => {
      if (e.cancelable) e.preventDefault()
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    w.addEventListener('gesturestart', blockGesture)
    w.addEventListener('gesturechange', blockGesture)

    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      w.removeEventListener('gesturestart', blockGesture)
      w.removeEventListener('gesturechange', blockGesture)
    }
  }, [])
}
