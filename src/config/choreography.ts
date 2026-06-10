import c0 from '../assets/images/c0.webp'
import c1 from '../assets/images/c1.webp'
import c2 from '../assets/images/c2.webp'
import c3 from '../assets/images/c3.webp'

/**
 * Central motion-design config. Phone geometry, screen content, and per-section
 * keyframes live here so the whole choreography is tunable in one place.
 */

/** App screens shown on the phone, in scroll order. */
export const SCREENS = {
  home: c0,
  feature1: c1,
  feature2: c2,
  feature3: c3,
} as const

/**
 * Phone config. The app screen is painted directly onto the model's own screen
 * mesh (material `4130c6244c49c5d5712e`), so its shape/rounded-corners come from
 * the geometry — no manual screen dimensions needed.
 */
export const PHONE = {
  /** Uniform scale applied to the whole phone group in world space. */
  scale: 0.36,
} as const

/**
 * Per-section keyframes. Phase 2 lerps the phone toward these; for now the slice
 * uses the hero pose. `xSign` mirrors phone vs. text tracks (opposing motion).
 */
export type SectionKey = 'hero' | 'feature1' | 'feature2' | 'feature3'

export interface SectionKeyframe {
  key: SectionKey
  screen: keyof typeof SCREENS
  /** Target phone X in world units. */
  phoneX: number
  /** Target phone Y-axis rotation in radians. */
  rotY: number
}

export const SECTIONS: SectionKeyframe[] = [
  { key: 'hero', screen: 'home', phoneX: 0, rotY: 0 },
  { key: 'feature1', screen: 'feature1', phoneX: -2.2, rotY: 0.5 },
  { key: 'feature2', screen: 'feature2', phoneX: 2.2, rotY: -0.5 },
  { key: 'feature3', screen: 'feature3', phoneX: -2.2, rotY: 0.4 },
]
