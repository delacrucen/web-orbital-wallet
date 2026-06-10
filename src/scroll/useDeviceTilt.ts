import { useEffect } from 'react'

import { clamp } from '../lib/lerp'
import { pointerState } from './scrollStore'

/**
 * Mobile counterpart to `usePointerParallax`: maps the device's gyroscope /
 * accelerometer tilt into the same shared `pointerState` the cursor drives, so
 * the phone's rotation + glass glare respond to physically tilting the handset
 * exactly like they respond to the mouse on desktop.
 *
 * `gamma` (left-right tilt) → x, `beta` (front-back tilt) → y. Both are measured
 * relative to the pose the user is holding when the first reading arrives, so it
 * feels neutral no matter how they hold the phone. iOS 13+ gates the sensor
 * behind a permission prompt that must fire from a user gesture, so on those
 * devices we request it on the first tap. Disabled for fine pointers (desktop)
 * and reduced-motion.
 */

/** Degrees of tilt mapped to the full -1..1 range. Lower = more sensitive. */
const TILT_RANGE = 20

type PermissionCapable = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

export function useDeviceTilt() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarse = window.matchMedia('(pointer: coarse)').matches
    if (reduce || !coarse) return
    if (typeof DeviceOrientationEvent === 'undefined') return

    // Captured on the first reading → defines "level" for this hold.
    let baseBeta: number | null = null
    let baseGamma: number | null = null

    const onOrient = (e: DeviceOrientationEvent) => {
      const { beta, gamma } = e
      if (beta == null || gamma == null) return
      if (baseBeta == null || baseGamma == null) {
        baseBeta = beta
        baseGamma = gamma
        return
      }
      pointerState.x = clamp((gamma - baseGamma) / TILT_RANGE, -1, 1)
      pointerState.y = clamp(-(beta - baseBeta) / TILT_RANGE, -1, 1)
    }

    let attached = false
    const attach = () => {
      if (attached) return
      attached = true
      window.addEventListener('deviceorientation', onOrient)
    }

    const DOE = DeviceOrientationEvent as PermissionCapable
    let cleanupGesture = () => {}

    if (typeof DOE.requestPermission === 'function') {
      // iOS: must ask from inside a user gesture.
      const request = () => {
        DOE.requestPermission?.()
          .then((res) => {
            if (res === 'granted') attach()
          })
          .catch(() => {})
      }
      window.addEventListener('touchend', request, { once: true })
      window.addEventListener('click', request, { once: true })
      cleanupGesture = () => {
        window.removeEventListener('touchend', request)
        window.removeEventListener('click', request)
      }
    } else {
      attach()
    }

    return () => {
      cleanupGesture()
      if (attached) window.removeEventListener('deviceorientation', onOrient)
    }
  }, [])
}
