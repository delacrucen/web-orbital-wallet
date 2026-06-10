import { useEffect } from 'react'

import { SECTIONS_MOBILE } from '../config/choreography'
import { layoutState } from './scrollStore'

/**
 * Responsive mobile layout engine. The phone lives in a fixed 3D canvas whose
 * vertical FOV is constant, so a fixed world scale always covers the SAME
 * fraction of viewport HEIGHT — which means a one-size layout leaves dead space
 * on tall phones and crowds short ones. This hook instead measures the viewport
 * and solves, in real pixels, for a balanced three-zone column:
 *
 *   [ header ] → [ phone ] → gap → [ copy ] → [ bottom ]
 *
 * It derives the phone's world Y + scale (written into the mobile choreography
 * keyframes) AND the pixel height of the DOM spacer that docks the copy directly
 * beneath the phone (exposed as CSS vars). Both come from the same solve, so the
 * 3D phone and the HTML copy stay aligned and the margins stay balanced on every
 * device height. Recomputed on resize / orientation change.
 */

/** Visible world height at the phone plane: 2 · camZ · tan(fov/2), cam z=12 fov=35°. */
const VIS_WORLD_H = 7.567
/** Phone body world height per unit scaleMul (model body × PHONE.scale). */
const PHONE_WORLD_PER_MUL = 5.29

interface ZoneConfig {
  /** Space the header occupies at the top. */
  headerPx: number
  /** Breathing room between header and phone. */
  topGapPx: number
  /** Approximate height the copy block needs. */
  textPx: number
  /** Gap between phone and copy. */
  gapPx: number
  /** Bottom safe space (clears the dot nav). */
  bottomPx: number
}

const HERO_ZONE: ZoneConfig = {
  headerPx: 76,
  topGapPx: 20,
  textPx: 250,
  gapPx: 24,
  bottomPx: 56,
}
const FEATURE_ZONE: ZoneConfig = {
  headerPx: 84,
  topGapPx: 24,
  textPx: 150,
  gapPx: 32,
  bottomPx: 68,
}

interface SolvedZone {
  phoneY: number
  scaleMul: number
  textTopPx: number
}

function solveZone(h: number, c: ZoneConfig): SolvedZone {
  const avail = h - c.headerPx - c.topGapPx - c.gapPx - c.textPx - c.bottomPx
  // Cap so the phone never dominates, floor so it never gets tiny.
  const maxPhonePx = Math.min(h * 0.5, 500)
  const phonePx = Math.max(160, Math.min(avail, maxPhonePx))

  const phoneTopPx = c.headerPx + c.topGapPx
  const centerFrac = (phoneTopPx + phonePx / 2) / h
  const heightFrac = phonePx / h

  return {
    scaleMul: (heightFrac * VIS_WORLD_H) / PHONE_WORLD_PER_MUL,
    phoneY: (0.5 - centerFrac) * VIS_WORLD_H,
    textTopPx: phoneTopPx + phonePx + c.gapPx,
  }
}

export function useMobileLayout() {
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')

    const apply = () => {
      const mobile = mq.matches
      layoutState.mobile = mobile
      if (!mobile) return // desktop uses the side-by-side layout; spacers hidden

      const h = window.innerHeight
      const hero = solveZone(h, HERO_ZONE)
      const feat = solveZone(h, FEATURE_ZONE)

      // Drive the mobile phone pose (rotY / screen / X stay as authored).
      SECTIONS_MOBILE[0].phoneY = hero.phoneY
      SECTIONS_MOBILE[0].scaleMul = hero.scaleMul
      for (let i = 1; i < SECTIONS_MOBILE.length; i++) {
        SECTIONS_MOBILE[i].phoneY = feat.phoneY
        SECTIONS_MOBILE[i].scaleMul = feat.scaleMul
      }

      // Dock the copy directly under the phone.
      const root = document.documentElement
      root.style.setProperty('--ow-hero-zone', `${Math.round(hero.textTopPx)}px`)
      root.style.setProperty('--ow-feat-zone', `${Math.round(feat.textTopPx)}px`)
    }

    apply()
    mq.addEventListener('change', apply)
    window.addEventListener('resize', apply)
    return () => {
      mq.removeEventListener('change', apply)
      window.removeEventListener('resize', apply)
    }
  }, [])
}
