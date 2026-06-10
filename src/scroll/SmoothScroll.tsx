import { useEffect } from 'react'
import Lenis from 'lenis'

import { scrollState } from './scrollStore'
import { slideNav } from './slideNav'

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

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('[data-snap]'),
    )

    let index = 0
    let animating = false

    slideNav.set({ count: sections.length, index: 0 })

    // Section the viewport centre currently sits in (for free-scroll/touch).
    const nearest = () => {
      const mid = lenis.scroll + window.innerHeight / 2
      let best = 0
      for (let i = 0; i < sections.length; i += 1) {
        if (sections[i].offsetTop <= mid) best = i
      }
      return best
    }

    // Glide to a section. Drives both wheel/arrow pagination and dot clicks.
    const goTo = (next: number) => {
      const target = Math.max(0, Math.min(sections.length - 1, next))
      if (animating || target === index) return
      index = target
      slideNav.set({ index })
      animating = true
      lenis.scrollTo(sections[target], {
        duration: SLIDE_DURATION,
        easing: easeInOutCubic,
        force: true, // override the stopped state (paginate mode)
        lock: true, // can't be interrupted mid-slide
        onComplete: () => {
          window.setTimeout(() => {
            animating = false
          }, COOLDOWN_MS)
        },
      })
    }
    slideNav.registerGoTo(goTo)

    lenis.on('scroll', (e: { progress: number; velocity: number }) => {
      scrollState.progress = e.progress
      scrollState.velocity = e.velocity
      if (!animating) {
        const i = nearest()
        if (i !== index) {
          index = i
          slideNav.set({ index: i })
        }
      }
    })

    let teardown = () => {}
    if (paginate) {
      // Freeze free scroll; we move between sections programmatically.
      lenis.stop()

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
      slideNav.registerGoTo(() => {})
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  return null
}
