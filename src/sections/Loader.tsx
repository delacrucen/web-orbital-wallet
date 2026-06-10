import { useEffect, useRef, useState } from 'react'
import { useProgress } from '@react-three/drei'

import { AnimatedOrbitalMark } from '../branding/AnimatedOrbitalMark'
import { BRAND, BRAND_RGB } from '../branding/colors'

/**
 * Full-screen startup loader. Covers the page in near-black while the heavy
 * assets (the GLB phone + its screen textures, loaded through three's loading
 * manager) come in, then fades out to reveal the ready scene — so nothing is
 * shown half-loaded.
 *
 * The Orbital ØW mark plays the app's self-drawing "processing" animation over a
 * thin horizontal line that fills left→right; its brand-colored glow intensifies
 * as it approaches 100%, matching the reference. The bar is driven by direct DOM
 * writes inside one rAF loop (no per-frame React state), the same pattern the
 * scroll reveals use, so the fill stays buttery.
 *
 * Completion gates on BOTH real asset readiness (`useProgress`) and a minimum
 * visible time, so a warm cache can't make it flash; a max-time safety net
 * guarantees the page is never trapped behind the loader if a load stalls.
 */

const MIN_VISIBLE_MS = 1100
const MAX_VISIBLE_MS = 9000
const FADE_MS = 650
const BAR_WIDTH = 'min(300px, 60vw)'

export function Loader() {
  const { active, progress, total } = useProgress()

  const [assetsReady, setAssetsReady] = useState(false)
  const [minElapsed, setMinElapsed] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [reduceMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  const complete = assetsReady && minElapsed

  const fillRef = useRef<HTMLDivElement>(null)
  const headRef = useRef<HTMLDivElement>(null)
  const pctRef = useRef(0)
  const completeRef = useRef(false)
  completeRef.current = complete

  // Real asset readiness: the manager has gone idle with at least one tracked load.
  useEffect(() => {
    if (!active && total > 0 && progress >= 100) setAssetsReady(true)
  }, [active, total, progress])

  // Minimum-visible floor + max-visible safety net.
  useEffect(() => {
    const min = setTimeout(() => setMinElapsed(true), MIN_VISIBLE_MS)
    const max = setTimeout(() => setAssetsReady(true), MAX_VISIBLE_MS)
    return () => {
      clearTimeout(min)
      clearTimeout(max)
    }
  }, [])

  // Fade out, then unmount.
  useEffect(() => {
    if (!complete) return
    setLeaving(true)
    const t = setTimeout(() => setHidden(true), FADE_MS)
    return () => clearTimeout(t)
  }, [complete])

  // Bar fill: trickle toward 90% while loading, then ease to 100% once complete.
  // The line itself is a left→right gradient (transparent/dim start → bright,
  // opaque tip); a soft bloom hugs the bright end. Both brighten with the fill.
  useEffect(() => {
    let raf = 0
    const tick = () => {
      const ceil = completeRef.current ? 100 : 90
      const factor = completeRef.current ? 0.1 : 0.025
      pctRef.current += (ceil - pctRef.current) * factor
      if (ceil - pctRef.current < 0.3) pctRef.current = ceil

      const p = pctRef.current / 100

      const fill = fillRef.current
      if (fill) {
        fill.style.width = `${pctRef.current}%`
        fill.style.opacity = String(0.55 + 0.45 * p)
      }

      const head = headRef.current
      if (head) {
        head.style.opacity = String(0.35 + 0.55 * p)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  if (hidden) return null

  return (
    <div
      role="progressbar"
      aria-label="Cargando"
      aria-hidden={leaving}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#05050a] transition-opacity duration-[650ms] ease-out motion-reduce:transition-none ${
        leaving ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      {/* Soft radial bloom behind the mark, like the reference. */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: `radial-gradient(circle, rgba(${BRAND_RGB.primary}, 0.1), transparent 70%)`,
        }}
      />

      <AnimatedOrbitalMark
        width={132}
        animate={!reduceMotion}
        className="relative drop-shadow-[0_0_24px_rgba(234,75,58,0.25)]"
      />

      {/* Glowing progress line. */}
      <div
        className="relative mt-12 h-px overflow-visible rounded-full bg-white/10"
        style={{ width: BAR_WIDTH }}
      >
        {/* The line: transparent/dim at the start, ramping to a bright, opaque
            tip; the very leading edge softens into a near-white hot point. */}
        <div
          ref={fillRef}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: '0%',
            backgroundImage: `linear-gradient(to right, rgba(${BRAND_RGB.primary}, 0) 0%, rgba(${BRAND_RGB.primary}, 0.9) 55%, ${BRAND.secondary} 88%, rgba(255, 235, 240, 0.95) 100%)`,
          }}
        >
          {/* Soft bloom hugging the bright end — a halo, not a dot. */}
          <div
            ref={headRef}
            className="pointer-events-none absolute right-0 top-1/2 h-7 w-28 -translate-y-1/2 translate-x-[15%]"
            style={{
              background: `radial-gradient(ellipse at center, rgba(${BRAND_RGB.secondary}, 0.5) 0%, rgba(${BRAND_RGB.primary}, 0.18) 40%, transparent 72%)`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
