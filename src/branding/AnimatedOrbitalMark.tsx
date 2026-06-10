import { useEffect, useId, useRef } from 'react'

import { LOGO_GRADIENT } from './colors'
import {
  BIG_O_FILL,
  DRAW_SPINE,
  LOGO_ASPECT_RATIO,
  LOGO_VIEWBOX_HEIGHT,
  LOGO_VIEWBOX_WIDTH,
  O_PEN_WIDTH,
  O_SPINE,
  PEN_WIDTH,
  SLASH_FILL,
  W_FILL,
} from './orbitalLogoPaths'

/**
 * Web port of the app's `AnimatedOrbitalLogo` — the ØW mark with a self-drawing
 * reveal. Each stroke is revealed by sweeping a thick stroke down its centerline
 * (the *spine*) and using that as a mask over the real glyph fill, so the motion
 * follows the writing direction yet the final frame is the exact logo.
 *
 * Loop timeline (identical to the app): the cycle deliberately STARTS fully
 * drawn so the mark is on screen at first glance, HOLDS, FADES out as one unit,
 * pauses, then REDRAWS (ring first, then up the slash and through the W) back to
 * fully drawn — and repeats. One linear clock drives every value in the same
 * frame so they can't drift apart at the loop boundary.
 *
 * Driven by a single rAF writing straight to the SVG attributes — no per-frame
 * React state — matching this codebase's animation approach.
 */

// Loop timeline (ms).
const RING_DURATION = 360
const DRAW_DURATION = 640
const HOLD_DURATION = 900
const FADE_DURATION = 260
const GAP_DURATION = 300
const TOTAL_DURATION =
  RING_DURATION + DRAW_DURATION + HOLD_DURATION + FADE_DURATION + GAP_DURATION

// Phase boundaries as fractions of the cycle, from one linear clock.
const HOLD_END = HOLD_DURATION / TOTAL_DURATION
const FADE_END = (HOLD_DURATION + FADE_DURATION) / TOTAL_DURATION
const GAP_END = (HOLD_DURATION + FADE_DURATION + GAP_DURATION) / TOTAL_DURATION
const RING_END =
  (HOLD_DURATION + FADE_DURATION + GAP_DURATION + RING_DURATION) /
  TOTAL_DURATION
// The slash + W draw from RING_END to 1, ending fully drawn for the next cycle.

// Hand-drawn feel: accelerate off the start, settle into the finish.
const BEZIER_X1 = 0.6
const BEZIER_Y1 = 0.04
const BEZIER_X2 = 0.32
const BEZIER_Y2 = 1

function drawEase(x: number): number {
  if (x <= 0) return 0
  if (x >= 1) return 1
  // Newton-Raphson: find the bezier parameter t whose x equals the input.
  let t = x
  for (let i = 0; i < 6; i++) {
    const inv = 1 - t
    const bx =
      3 * inv * inv * t * BEZIER_X1 + 3 * inv * t * t * BEZIER_X2 + t * t * t
    const dbx =
      3 * inv * inv * BEZIER_X1 +
      6 * inv * t * (BEZIER_X2 - BEZIER_X1) +
      3 * t * t * (1 - BEZIER_X2)
    const err = bx - x
    if (err < 1e-4 && err > -1e-4) break
    if (dbx === 0) break
    t = Math.min(1, Math.max(0, t - err / dbx))
  }
  const inv = 1 - t
  return 3 * inv * inv * t * BEZIER_Y1 + 3 * inv * t * t * BEZIER_Y2 + t * t * t
}

function ringProgress(t: number): number {
  if (t < FADE_END) return 1 // fully drawn through the hold + fade
  if (t < GAP_END) return 0 // gap — hidden anyway (opacity 0)
  if (t < RING_END) return drawEase((t - GAP_END) / (RING_END - GAP_END))
  return 1 // ring done, stays drawn while the slash + W draw
}

function strokeProgress(t: number): number {
  if (t < FADE_END) return 1 // fully drawn through the hold + fade
  if (t < RING_END) return 0 // gap + while the ring is drawing
  return drawEase((t - RING_END) / (1 - RING_END))
}

function groupOpacity(t: number): number {
  if (t < HOLD_END) return 1 // hold — fully drawn and visible (first glance)
  if (t < FADE_END) return 1 - drawEase((t - HOLD_END) / (FADE_END - HOLD_END))
  if (t < GAP_END) return 0 // gap
  return 1 // redraw is visible
}

type AnimatedOrbitalMarkProps = {
  /** Rendered width in px; height follows the mark's aspect ratio. */
  width?: number
  /** When false, the finished mark is shown statically (reduce-motion). */
  animate?: boolean
  className?: string
}

export function AnimatedOrbitalMark({
  width = 180,
  animate = true,
  className,
}: AnimatedOrbitalMarkProps) {
  const uid = useId().replace(/:/g, '')
  const gradientId = `orbital-grad-${uid}`
  const ringMaskId = `orbital-ring-${uid}`
  const drawMaskId = `orbital-draw-${uid}`

  const ringRef = useRef<SVGPathElement>(null)
  const strokeRef = useRef<SVGPathElement>(null)
  const groupRef = useRef<SVGGElement>(null)

  useEffect(() => {
    if (!animate) return
    let raf = 0
    let start = 0
    const frame = (now: number) => {
      if (!start) start = now
      const elapsed = (now - start) % TOTAL_DURATION
      const t = elapsed / TOTAL_DURATION

      ringRef.current?.setAttribute(
        'stroke-dashoffset',
        String(O_SPINE.length * (1 - ringProgress(t))),
      )
      strokeRef.current?.setAttribute(
        'stroke-dashoffset',
        String(DRAW_SPINE.length * (1 - strokeProgress(t))),
      )
      if (groupRef.current) {
        groupRef.current.style.opacity = String(groupOpacity(t))
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [animate])

  return (
    <svg
      width={width}
      height={width / LOGO_ASPECT_RATIO}
      viewBox={`0 0 ${LOGO_VIEWBOX_WIDTH} ${LOGO_VIEWBOX_HEIGHT}`}
      fill="none"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2="0"
          y2={LOGO_VIEWBOX_HEIGHT}
        >
          <stop offset="0" stopColor={LOGO_GRADIENT[0]} />
          <stop offset="0.49" stopColor={LOGO_GRADIENT[1]} />
        </linearGradient>

        <mask id={ringMaskId}>
          {/* Starts fully drawn (offset 0) so the mark shows on first paint. */}
          <path
            ref={ringRef}
            d={O_SPINE.d}
            stroke="#fff"
            strokeWidth={O_PEN_WIDTH}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={O_SPINE.length}
            strokeDashoffset={0}
          />
        </mask>
        <mask id={drawMaskId}>
          <path
            ref={strokeRef}
            d={DRAW_SPINE.d}
            stroke="#fff"
            strokeWidth={PEN_WIDTH}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            strokeDasharray={DRAW_SPINE.length}
            strokeDashoffset={0}
          />
        </mask>
      </defs>

      {/* The entire mark draws on and fades out together. */}
      <g ref={groupRef}>
        <path
          d={BIG_O_FILL}
          fill={`url(#${gradientId})`}
          mask={`url(#${ringMaskId})`}
        />
        <path
          d={SLASH_FILL}
          fill={`url(#${gradientId})`}
          mask={`url(#${drawMaskId})`}
        />
        <path
          d={W_FILL}
          fill={`url(#${gradientId})`}
          mask={`url(#${drawMaskId})`}
        />
      </g>
    </svg>
  )
}
