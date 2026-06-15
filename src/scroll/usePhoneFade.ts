import { useEffect, type RefObject } from 'react'

import { samplePhone } from '../config/choreography'
import { layoutState, scrollState } from './scrollStore'

/**
 * Fades the phone canvas layer in/out from the active keyframe's `opacity`
 * (1 everywhere except Orbital Pay, where a bento grid replaces the phone).
 *
 * Why fade the DOM layer and not the 3D materials: the phone is a hollow shell,
 * so dropping material opacity reveals its interior mid-fade ("the back of the
 * phone"). Compositing the whole canvas as one flat layer dissolves it cleanly.
 * The starfield is a separate canvas (StarfieldScene), so it stays put.
 */
export function usePhoneFade(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    let raf = 0
    let cur = 1
    const tick = () => {
      const target = samplePhone(scrollState.progress, layoutState.mobile).opacity
      cur += (target - cur) * 0.1
      const el = ref.current
      if (el) el.style.opacity = cur < 0.002 ? '0' : cur.toFixed(3)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [ref])
}
