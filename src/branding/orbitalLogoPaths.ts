/**
 * Geometry for the Orbital Wallet "ØW" mark (O ring + slash + W), ported
 * verbatim from the app (`app-orbital-wallet` · components/icons/
 * orbitalLogoPaths.ts).
 *
 * The `*_FILL` strings are the real glyph outlines (what you see). The `*_SPINE`
 * polylines trace the centerline each stroke is "drawn" along; the draw-on
 * animation sweeps a thick stroke down a spine and uses it as a mask over the
 * matching fill, so the reveal follows the natural writing direction while the
 * final frame is the exact glyph.
 */

export const LOGO_VIEWBOX_WIDTH = 970
export const LOGO_VIEWBOX_HEIGHT = 430
export const LOGO_ASPECT_RATIO = LOGO_VIEWBOX_WIDTH / LOGO_VIEWBOX_HEIGHT

export const BIG_O_FILL =
  'M406.485 131.106C395.642 105.153 380.559 82.3723 361.235 62.7876C341.912 43.0254 319.465 27.6265 293.869 16.5658C268.273 5.50501 240.824 0 211.495 0C182.167 0 154.717 5.53038 129.121 16.5658C103.526 27.6265 81.0786 43.0254 61.7548 62.7876C42.4311 82.3723 27.2717 105.153 16.2513 131.106C5.43402 157.058 0 185.014 0 215C0 244.986 5.43402 272.765 16.2767 298.894C27.2971 324.847 42.4565 347.704 61.7802 367.466C81.104 387.051 103.551 402.373 129.147 413.434C154.743 424.495 182.192 430 211.52 430C240.849 430 268.298 424.47 293.894 413.434C319.49 402.373 341.937 387.051 361.261 367.466C380.585 347.704 395.668 324.847 406.51 298.894C417.531 272.765 423.041 244.808 423.041 215C423.041 185.192 417.531 157.058 406.51 131.106H406.485ZM379.721 288.569C370.402 311.35 357.325 331.29 340.515 348.414C323.883 365.538 304.508 378.857 282.391 388.395C260.274 397.934 236.329 402.703 210.581 402.703C184.833 402.703 160.786 397.934 138.491 388.395C116.374 378.857 96.9998 365.538 80.3676 348.414C63.7355 331.29 50.6583 311.35 41.1614 288.569C31.8423 265.788 27.1701 241.257 27.1701 214.949C27.1701 188.642 31.8423 164.11 41.1614 141.329C50.6583 118.548 63.7355 98.6083 80.3676 81.4844C96.9998 64.3605 116.374 51.0419 138.491 41.5032C160.786 31.9646 184.807 27.1953 210.581 27.1953C236.354 27.1953 260.3 31.9646 282.391 41.5032C304.508 51.0419 323.883 64.3605 340.515 81.4844C357.325 98.6083 370.402 118.548 379.721 141.329C389.04 164.11 393.713 188.642 393.713 214.949C393.713 241.257 389.04 265.788 379.721 288.569Z'

export const W_FILL =
  'M421.591 4.32498L556.007 402.757L684.376 28.8413C685.646 25.0994 689.331 22.5968 693.422 22.6211C697.513 22.6454 701.121 25.1966 702.366 28.9385L826.009 402.757L957.198 26.8732C958.087 24.3219 960.603 22.5725 963.423 22.5725C967.895 22.5725 971.046 26.7274 969.674 30.7851L836.757 422.487C835.486 426.205 831.853 428.732 827.762 428.732C823.645 428.732 820.012 426.205 818.767 422.463L690.881 42.2293L564.951 422.438C563.706 426.18 560.073 428.707 555.982 428.707C551.891 428.707 548.257 426.18 547.012 422.438L409.14 8.1397C407.768 4.0577 410.995 0 415.467 0C419.94 0 421.591 4.32498 421.591 4.32498Z'

export const SLASH_FILL =
  'M419.622 12.0162L10.6866 426.874C8.24978 429.351 4.28989 429.351 1.82764 426.874C-0.609215 424.398 -0.609215 420.374 1.82764 417.872L409.9 2.13679C412.362 -0.36531 416.677 -1.01018 419.698 2.0594C423.836 6.26396 419.622 12.0162 419.622 12.0162Z'

// ── Centerline the mark is drawn along ──
// One continuous stroke: it starts at the bottom-left tail of the slash (below
// the ring), climbs the slash to where the W begins — the slash top and the
// W's start are the same corner — then zigzags through the W to the top-right.
const DRAW_SPINE_POINTS = [
  [8, 425], // bottom-left tail of the slash, under the ring
  [419, 11], // top of the slash == start of the W
  [556, 406], // W valley 1
  [691, 34], // W mid-peak
  [827, 406], // W valley 2
  [961, 25], // W top-right
] as const

type Point = readonly [number, number]

function polyline(points: readonly Point[]): { d: string; length: number } {
  let length = 0
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1]
    const [x1, y1] = points[i]
    length += Math.hypot(x1 - x0, y1 - y0)
  }
  const d = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`).join('')
  return { d, length }
}

export const DRAW_SPINE = polyline(DRAW_SPINE_POINTS)

// Ring centerline: a full circle, drawn from the bottom-left so the stroke
// reads as flowing out of the O and into the slash. The ring is ~27 units
// thick (outer r ≈ 211.5), so its centerline radius is ≈ 198.
const O_SPINE_RADIUS = 198
const O_SPINE_START_X = 71.5 // bottom-left of the ring (≈135°)
const O_SPINE_START_Y = 355
const O_SPINE_OPPOSITE_X = 351.5
const O_SPINE_OPPOSITE_Y = 75

export const O_SPINE = {
  d: `M${O_SPINE_START_X} ${O_SPINE_START_Y} A${O_SPINE_RADIUS} ${O_SPINE_RADIUS} 0 1 1 ${O_SPINE_OPPOSITE_X} ${O_SPINE_OPPOSITE_Y} A${O_SPINE_RADIUS} ${O_SPINE_RADIUS} 0 1 1 ${O_SPINE_START_X} ${O_SPINE_START_Y}`,
  length: 2 * Math.PI * O_SPINE_RADIUS,
}

// Mask stroke widths: comfortably wider than the glyph so the sweeping pen
// fully reveals each stroke. Overshoot is harmless — the mask is intersected
// with the fill — and the arms are spaced far enough apart not to bleed.
export const PEN_WIDTH = 48
export const O_PEN_WIDTH = 44
