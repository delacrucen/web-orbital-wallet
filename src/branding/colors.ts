/**
 * Orbital brand colors, mirrored from the app (`app-orbital-wallet` ·
 * src/utils/colors.ts). Keep in sync if the brand palette changes there.
 *
 * For Tailwind classes use the matching theme tokens (`brand-primary`,
 * `brand-secondary`) defined in src/styles.css `@theme` — same values as here.
 * Use these constants for JS / three.js / inline rgba.
 */

export const BRAND = {
  /** Orange-red — gradient start. */
  primary: '#ea4b3a',
  /** Pink — gradient end. */
  secondary: '#e03d6d',
} as const

/** RGB triples for the brand colors, for building rgba() glows at runtime. */
export const BRAND_RGB = {
  primary: '234, 75, 58',
  secondary: '224, 61, 109',
} as const

/**
 * The vertical gradient baked into the ØW logo artwork (distinct from BRAND so
 * it matches the exported assets exactly): orange at top → pink by mid-height.
 */
export const LOGO_GRADIENT = ['#F35110', '#E03D6D'] as const
