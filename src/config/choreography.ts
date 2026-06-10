import c0 from "../assets/images/screenshots/c0.webp";
import c1 from "../assets/images/screenshots/c1.webp";
import c2 from "../assets/images/screenshots/c2.webp";
import c3 from "../assets/images/screenshots/c3.webp";

import { clamp, lerp } from "../lib/lerp";

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
} as const;

/**
 * Phone config. The app screen is painted directly onto the model's own screen
 * mesh (material `4130c6244c49c5d5712e`), so its shape/rounded-corners come from
 * the geometry — no manual screen dimensions needed.
 */
export const PHONE = {
  /** Uniform scale applied to the whole phone group in world space. */
  scale: 0.36,
} as const;

/**
 * Per-section keyframes for the phone. The phone target X mirrors the text side
 * (phone left ↔ text right) so the two tracks oppose. The whole page scroll maps
 * 0→1 across these keyframes (keyframe i sits at i/(n-1)).
 */
export type SectionKey = "hero" | "feature1" | "feature2" | "feature3";

export interface SectionKeyframe {
  key: SectionKey;
  /** App screen shown on the phone at this keyframe (Phase 3 crossfade). */
  screen: keyof typeof SCREENS;
  /** Target phone X in world units (− left, + right). */
  phoneX: number;
  /** Target phone Y in world units. */
  phoneY: number;
  /** Target phone Y-axis rotation in radians (the 3/4 turn). */
  rotY: number;
  /** Scale multiplier on top of PHONE.scale. */
  scaleMul: number;
}

export const SECTIONS: SectionKeyframe[] = [
  {
    key: "hero",
    screen: "home",
    phoneX: 2.6,
    phoneY: -0.3,
    rotY: -0.3,
    scaleMul: 0.9,
  },
  {
    key: "feature1",
    screen: "feature1",
    phoneX: -2.4,
    phoneY: 0,
    rotY: 0.42,
    scaleMul: 0.92,
  },
  {
    key: "feature2",
    screen: "feature2",
    phoneX: 2.4,
    phoneY: 0,
    rotY: -0.42,
    scaleMul: 0.92,
  },
  {
    key: "feature3",
    screen: "feature3",
    phoneX: -2.4,
    phoneY: 0,
    rotY: 0.38,
    scaleMul: 0.92,
  },
];

/** Screen image URLs in section order (home → feature1 → 2 → 3). */
export const SCREEN_SEQUENCE: string[] = SECTIONS.map((s) => SCREENS[s.screen]);

/**
 * Active keyframe segment for a whole-page scroll progress (0→1): the lower
 * keyframe index and the local 0..1 progress within that segment. Shared by the
 * phone pose and the screen crossfade so they move on the same clock.
 */
export function sampleSegment(progress: number): { index: number; t: number } {
  const n = SECTIONS.length;
  const seg = clamp(progress) * (n - 1);
  const index = Math.min(Math.floor(seg), n - 2);
  return { index, t: seg - index };
}

export interface PhonePose {
  x: number;
  y: number;
  rotY: number;
  scale: number;
}

/**
 * Sample the phone pose at a given whole-page scroll progress (0→1). Interpolates
 * between the active keyframe pair with a smoothstep so the phone *settles* near
 * each section and transitions briskly between — the premium feel. This sets the
 * per-frame TARGET; the render loop still eases toward it.
 */
export function samplePhone(progress: number): PhonePose {
  const { index, t: tRaw } = sampleSegment(progress);
  const t = tRaw * tRaw * (3 - 2 * tRaw); // smoothstep
  const a = SECTIONS[index];
  const b = SECTIONS[index + 1];
  return {
    x: lerp(a.phoneX, b.phoneX, t),
    y: lerp(a.phoneY, b.phoneY, t),
    rotY: lerp(a.rotY, b.rotY, t),
    scale: lerp(a.scaleMul, b.scaleMul, t),
  };
}
