import home from "../assets/images/screenshots/home-shown.webp";
import contacts from "../assets/images/screenshots/contacts.webp";
import success from "../assets/images/screenshots/success.webp";
import qr from "../assets/images/screenshots/qr.webp";
import services from "../assets/images/screenshots/services.webp";
import movements from "../assets/images/screenshots/movements-filter.webp";

import { clamp, lerp } from "../lib/lerp";

/**
 * Central motion-design config. Phone geometry, screen content, and per-section
 * keyframes live here so the whole choreography is tunable in one place.
 */

/** App screens shown on the phone, in scroll order — one per content section. */
export const SCREENS = {
  home,
  transfer: contacts,
  success,
  qr,
  services,
  movements,
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
export type SectionKey =
  | "hero"
  | "transfer"
  | "success"
  | "qr"
  | "services"
  | "movements"
  | "orbitalpay"
  | "faq";

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
  /** Phone opacity at this keyframe (default 1). Lets a section dissolve the
      phone — e.g. Orbital Pay, where a bento grid takes the phone's place. */
  opacity?: number;
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
    // Transfer: text on the right, phone slides left.
    key: "transfer",
    screen: "transfer",
    phoneX: -2.4,
    phoneY: 0,
    rotY: 0.42,
    scaleMul: 0.92,
  },
  {
    // Transfer confirmation: text on the left, phone slides right.
    key: "success",
    screen: "success",
    phoneX: 2.4,
    phoneY: 0,
    rotY: -0.42,
    scaleMul: 0.92,
  },
  {
    // QR pay: text on the right, phone slides left.
    key: "qr",
    screen: "qr",
    phoneX: -2.4,
    phoneY: 0,
    rotY: 0.42,
    scaleMul: 0.92,
  },
  {
    // Service payments: text on the left, phone slides right.
    key: "services",
    screen: "services",
    phoneX: 2.4,
    phoneY: 0,
    rotY: -0.42,
    scaleMul: 0.92,
  },
  {
    // Movements/history: text on the right, phone slides left.
    key: "movements",
    screen: "movements",
    phoneX: -2.4,
    phoneY: 0,
    rotY: 0.38,
    scaleMul: 0.92,
  },
  {
    // Orbital Pay is a sibling service. A bento grid takes the phone's place on
    // the left, so the phone stays put (mirrors the movements section) and simply
    // dissolves via opacity as the section enters.
    key: "orbitalpay",
    screen: "movements",
    phoneX: -2.4,
    phoneY: 0,
    rotY: 0.38,
    scaleMul: 0.92,
    opacity: 0,
  },
  {
    // FAQ + footer. Phone stays dissolved (like Orbital Pay); content owns the
    // viewport and the section scrolls through to reach the footer.
    key: "faq",
    screen: "movements",
    phoneX: -2.4,
    phoneY: 0,
    rotY: 0.38,
    scaleMul: 0.92,
    opacity: 0,
  },
];

/**
 * Mobile keyframes. No room for a horizontal split on a portrait phone, so the
 * device is centered (`phoneX: 0`) and lifted into the upper portion of the
 * viewport (`phoneY` up) while the copy sits in the lower band — a vertical
 * stack. The phone still rotates subtly per section for life; the gyroscope
 * parallax adds tilt on top (mirrors the desktop cursor effect). The hero phone
 * is a touch smaller and higher to clear the taller hero copy + store badges.
 */
export const SECTIONS_MOBILE: SectionKeyframe[] = [
  {
    key: "hero",
    screen: "home",
    phoneX: 0,
    phoneY: 1.4,
    rotY: -0.18,
    scaleMul: 0.54,
  },
  {
    key: "transfer",
    screen: "transfer",
    phoneX: 0,
    phoneY: 1.15,
    rotY: 0.26,
    scaleMul: 0.64,
  },
  {
    key: "success",
    screen: "success",
    phoneX: 0,
    phoneY: 1.15,
    rotY: -0.26,
    scaleMul: 0.64,
  },
  {
    key: "qr",
    screen: "qr",
    phoneX: 0,
    phoneY: 1.15,
    rotY: 0.26,
    scaleMul: 0.64,
  },
  {
    key: "services",
    screen: "services",
    phoneX: 0,
    phoneY: 1.15,
    rotY: -0.26,
    scaleMul: 0.64,
  },
  {
    key: "movements",
    screen: "movements",
    phoneX: 0,
    phoneY: 1.15,
    rotY: 0.26,
    scaleMul: 0.64,
  },
  {
    // Phone dissolves (opacity 0) so the bento grid owns the screen; pose mirrors
    // the feature sections (useMobileLayout still solves its Y/scale).
    key: "orbitalpay",
    screen: "movements",
    phoneX: 0,
    phoneY: 1.15,
    rotY: 0.26,
    scaleMul: 0.64,
    opacity: 0,
  },
  {
    key: "faq",
    screen: "movements",
    phoneX: 0,
    phoneY: 1.15,
    rotY: 0.26,
    scaleMul: 0.64,
    opacity: 0,
  },
];

/** Distinct screen textures to load, in first-appearance order. Deduped so a
    keyframe can reuse another's screen (e.g. Orbital Pay reuses feature3)
    without passing a duplicate URL to `useTexture` — duplicates in that array
    are a footgun that desyncs the returned texture list. */
export const SCREEN_TEXTURES: string[] = [
  ...new Set(SECTIONS.map((s) => SCREENS[s.screen])),
];

/** Texture index (into SCREEN_TEXTURES) shown at each section/keyframe. */
export const SECTION_TEXTURE_INDEX: number[] = SECTIONS.map((s) =>
  SCREEN_TEXTURES.indexOf(SCREENS[s.screen]),
);

/**
 * Whole-page progress where the hero backdrop finishes crossfading — video out,
 * starfield in. Three-quarters into the first segment, so it settles before the
 * first feature. It MUST scale with the section count: each segment is
 * 1/(n-1) wide, so a hardcoded value (e.g. 0.25, tuned for 4 sections) leaves
 * the hero video bleeding into the next section once more sections are added.
 */
export const HERO_BACKDROP_END = 0.75 / (SECTIONS.length - 1);

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
  opacity: number;
}

/**
 * Sample the phone pose at a given whole-page scroll progress (0→1). Interpolates
 * between the active keyframe pair with a smoothstep so the phone *settles* near
 * each section and transitions briskly between — the premium feel. This sets the
 * per-frame TARGET; the render loop still eases toward it.
 */
export function samplePhone(progress: number, mobile = false): PhonePose {
  const keyframes = mobile ? SECTIONS_MOBILE : SECTIONS;
  const { index, t: tRaw } = sampleSegment(progress);
  const t = tRaw * tRaw * (3 - 2 * tRaw); // smoothstep
  const a = keyframes[index];
  const b = keyframes[index + 1];
  return {
    x: lerp(a.phoneX, b.phoneX, t),
    y: lerp(a.phoneY, b.phoneY, t),
    rotY: lerp(a.rotY, b.rotY, t),
    scale: lerp(a.scaleMul, b.scaleMul, t),
    opacity: lerp(a.opacity ?? 1, b.opacity ?? 1, t),
  };
}
