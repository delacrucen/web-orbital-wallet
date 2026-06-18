import { useEffect } from 'react'

import { clamp } from '../lib/lerp'
import { pointerState } from './scrollStore'

/**
 * Mobile counterpart to `usePointerParallax`: maps the device's gyroscope /
 * accelerometer tilt into the same shared `pointerState` the cursor drives, so
 * the phone's rotation + glass glare respond to physically tilting the handset
 * exactly like they respond to the mouse on desktop.
 *
 * Only `gamma` (left-right tilt) → x; the vertical axis is left neutral so the
 * phone reacts to side-to-side tilt but not front-back. `gamma` is measured
 * relative to the pose the user is holding when the first reading arrives, so it
 * feels neutral no matter how they hold the phone. iOS 13+ gates the sensor
 * behind a permission prompt that must fire from a user gesture, so on those
 * devices we request it on the first tap. Disabled for fine pointers (desktop).
 */

/** Degrees of tilt mapped to the full -1..1 range. Lower = more sensitive. */
const TILT_RANGE = 10

type PermissionCapable = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

export function useDeviceTilt() {
  useEffect(() => {
    const coarse = window.matchMedia('(pointer: coarse)').matches
    if (!coarse) return
    if (typeof DeviceOrientationEvent === 'undefined') return

    // Captured on the first reading → defines "level" for this hold.
    let baseGamma: number | null = null

    const onOrient = (e: DeviceOrientationEvent) => {
      const { gamma } = e
      if (gamma == null) return
      if (baseGamma == null) {
        baseGamma = gamma
        return
      }
      // Left-right tilt only; leave y neutral so front-back tilt does nothing.
      pointerState.x = clamp((gamma - baseGamma) / TILT_RANGE, -1, 1)
      pointerState.y = 0
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
      // iOS 13+: permission must be requested from inside a user gesture.
      // We use touchstart on document (fires before SmoothScroll's touchmove
      // preventDefault can de-privilege the gesture) and retry on each tap
      // until we get a definitive grant or deny rather than a single shot.
      let asking = false
      const request = () => {
        if (attached || asking) return
        asking = true
        DOE.requestPermission?.()
          .then((res) => {
            asking = false
            document.removeEventListener('touchstart', request)
            if (res === 'granted') attach()
          })
          .catch(() => {
            asking = false
          })
      }
      document.addEventListener('touchstart', request, { passive: true })
      cleanupGesture = () => document.removeEventListener('touchstart', request)
    } else {
      // Android and other browsers: no permission gate, attach directly.
      attach()
    }

    return () => {
      cleanupGesture()
      if (attached) window.removeEventListener('deviceorientation', onOrient)
    }
  }, [])
}
