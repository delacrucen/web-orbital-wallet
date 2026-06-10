import { useEffect } from 'react'
import Lenis from 'lenis'

import { scrollState } from './scrollStore'

/* ---- paginated "slide" navigation tunables ------------------------------- */
/** Slide animation length (s). */
const SLIDE_DURATION = 0.9
/** Minimum wheel delta to count as intent (ignores tiny trackpad noise). */
const WHEEL_THRESHOLD = 12
/** Lock after a slide completes (ms) to absorb trackpad momentum. */
const COOLDOWN_MS = 250
/* -------------------------------------------------------------------------- */

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

/**
 * Lenis smooth scroll + section pagination. On desktop the page is driven
 * section-by-section: one wheel notch / arrow key glides to the adjacent
 * `[data-snap]` section and lands exactly on it (no off-axis drift, no fighting
 * the user). Touch devices and reduced-motion keep normal smooth scrolling.
 *
 * Feeds the shared scroll store (`progress` drives the 3D choreography).
 */
export function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    const paginate = !reduce && !isTouch

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: false })

    let rafId = 0
    const raf = (time: number) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    lenis.on('scroll', (e: { progress: number; velocity: number }) => {
      scrollState.progress = e.progress
      scrollState.velocity = e.velocity
    })

    let teardown = () => {}
    if (paginate) {
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>('[data-snap]'),
      )

      // Freeze free scroll; we move between sections programmatically.
      lenis.stop()

      let index = 0
      let animating = false

      const goTo = (next: number) => {
        const target = Math.max(0, Math.min(sections.length - 1, next))
        if (animating || target === index) return
        index = target
        animating = true
        lenis.scrollTo(sections[target], {
          duration: SLIDE_DURATION,
          easing: easeInOutCubic,
          force: true, // override the stopped state
          lock: true, // can't be interrupted mid-slide
          onComplete: () => {
            window.setTimeout(() => {
              animating = false
            }, COOLDOWN_MS)
          },
        })
      }

      const onWheel = (e: WheelEvent) => {
        if (animating || Math.abs(e.deltaY) < WHEEL_THRESHOLD) return
        goTo(index + (e.deltaY > 0 ? 1 : -1))
      }

      const onKey = (e: KeyboardEvent) => {
        if (animating) return
        if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
          e.preventDefault()
          goTo(index + 1)
        } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
          e.preventDefault()
          goTo(index - 1)
        } else if (e.key === 'Home') {
          goTo(0)
        } else if (e.key === 'End') {
          goTo(sections.length - 1)
        }
      }

      window.addEventListener('wheel', onWheel, { passive: true })
      window.addEventListener('keydown', onKey)
      teardown = () => {
        window.removeEventListener('wheel', onWheel)
        window.removeEventListener('keydown', onKey)
      }
    }

    return () => {
      teardown()
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  return null
}
