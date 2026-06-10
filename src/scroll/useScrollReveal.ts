import { useEffect, useRef } from 'react'

/**
 * Scroll-scrubbed entrance for a DOM element: as it scrolls toward the viewport
 * center it slides in from `from` and fades up. Drives `transform`/`opacity`
 * directly each frame (no React re-render) so it stays buttery and in sync with
 * the phone, which is driven off the same scroll. Honors reduced-motion.
 */
export function useScrollReveal(from: 'left' | 'right') {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.opacity = '1'
      el.style.transform = 'none'
      return
    }

    const offset = from === 'right' ? 64 : -64
    let raf = 0

    const update = () => {
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      // 0 when the element's top is at the viewport bottom, 1 by ~45% up.
      const p = Math.min(1, Math.max(0, (vh - rect.top) / (vh * 0.55)))
      const e = p * p * (3 - 2 * p) // smoothstep
      el.style.opacity = String(e)
      el.style.transform = `translate3d(${(1 - e) * offset}px, 0, 0)`
      raf = requestAnimationFrame(update)
    }
    raf = requestAnimationFrame(update)

    return () => cancelAnimationFrame(raf)
  }, [from])

  return ref
}
