import { useEffect } from 'react'
import Lenis from 'lenis'

import { clamp } from '../lib/lerp'
import { scrollState, pinchState } from './scrollStore'
import { slideNav } from './slideNav'

/* ---- paginated "slide" navigation tunables ------------------------------- */
/** Slide animation length (s). */
const SLIDE_DURATION = 0.9
/** Minimum wheel delta to count as intent (ignores tiny trackpad noise). */
const WHEEL_THRESHOLD = 12
/** Minimum vertical swipe distance (px) to page to the next section on touch. */
const SWIPE_THRESHOLD = 45
/** Lock after a slide completes (ms) to absorb trackpad momentum. */
const COOLDOWN_MS = 250
/** A section taller than the viewport by more than this (px) scrolls internally
 *  (snap to enter/exit, free step-scroll within) instead of paging as one unit. */
const TALL_EPS = 8
/** Fraction of the viewport a single notch/swipe glides inside a tall section. */
const STEP_FRAC = 0.8
/** Glide length (s) for an in-section step — snappier than a full page turn. */
const STEP_DURATION = 0.5
/* -------------------------------------------------------------------------- */

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

/**
 * Lenis smooth scroll + section pagination. The page is driven
 * section-by-section: one wheel notch / arrow key (desktop) or one vertical
 * swipe (touch) glides to the adjacent `[data-snap]` section and lands exactly
 * on it (no off-axis drift, no fighting the user). Reduced-motion keeps normal
 * smooth scrolling.
 *
 * Feeds the shared scroll store (`progress` drives the 3D choreography).
 */
export function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const paginate = !reduce

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

    // Bottom-aligned scroll position of a section (its last in-view scroll Y).
    const maxScrollOf = (i: number) =>
      sections[i].offsetTop + sections[i].offsetHeight - window.innerHeight
    // A section worth scrolling through rather than paging as a single slide.
    const isTall = (i: number) =>
      sections[i].offsetHeight > window.innerHeight + TALL_EPS

    // Section the viewport centre currently sits in (for free-scroll/touch).
    const nearest = () => {
      const mid = lenis.scroll + window.innerHeight / 2
      let best = 0
      for (let i = 0; i < sections.length; i += 1) {
        if (sections[i].offsetTop <= mid) best = i
      }
      return best
    }

    // Raw scroll → keyframe-space progress (0→1). Each section TOP anchors its
    // phone keyframe; the phone interpolates over the gap to the next section's
    // top. This stays aligned when a section is taller than the viewport — an
    // even-by-count division (the old model) would drift the whole choreography.
    // Equal-height sections reproduce the old linear progress exactly.
    const keyframeProgress = () => {
      const n = sections.length
      if (n < 2) return 0
      const y = lenis.scroll
      let i = 0
      for (let k = 0; k < n; k += 1) if (sections[k].offsetTop <= y + 1) i = k
      if (i >= n - 1) return 1
      const top = sections[i].offsetTop
      const nextTop = sections[i + 1].offsetTop
      const local = clamp((y - top) / Math.max(1, nextTop - top))
      return (i + local) / (n - 1)
    }

    // Glide the page to an absolute Y — the single primitive every navigation
    // (page turns, in-section steps, dot clicks) is built on.
    const glideTo = (y: number, duration = SLIDE_DURATION) => {
      animating = true
      pinchState.scale = 1 // ease any pinch-zoom back to base
      lenis.scrollTo(y, {
        duration,
        easing: easeInOutCubic,
        force: true, // override the stopped state (paginate mode)
        lock: true, // can't be interrupted mid-glide
        onComplete: () => {
          window.setTimeout(() => {
            animating = false
          }, COOLDOWN_MS)
        },
      })
    }

    // Glide to a section. Lands at its top — or its bottom when paging UP into a
    // tall section, so the reader picks up where the content met the edge.
    const goTo = (next: number) => {
      const target = Math.max(0, Math.min(sections.length - 1, next))
      if (animating || target === index) return
      const up = target < index
      index = target
      slideNav.set({ index })
      glideTo(
        up && isTall(target) ? maxScrollOf(target) : sections[target].offsetTop,
      )
    }
    slideNav.registerGoTo(goTo)

    // Inside a tall section a notch/swipe steps through its content; returns
    // false at the edge so the caller pages to the adjacent section instead.
    const stepWithin = (dir: number) => {
      if (!isTall(index)) return false
      const top = sections[index].offsetTop
      const bottom = maxScrollOf(index)
      const y = lenis.scroll
      if (dir > 0 && y < bottom - 2) {
        glideTo(Math.min(bottom, y + window.innerHeight * STEP_FRAC), STEP_DURATION)
        return true
      }
      if (dir < 0 && y > top + 2) {
        glideTo(Math.max(top, y - window.innerHeight * STEP_FRAC), STEP_DURATION)
        return true
      }
      return false
    }

    // One unit of intent: scroll within a tall section, else page to the next.
    const move = (dir: number) => {
      if (!stepWithin(dir)) goTo(index + dir)
    }

    lenis.on('scroll', (e: { velocity: number }) => {
      scrollState.progress = keyframeProgress()
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
        move(e.deltaY > 0 ? 1 : -1)
      }

      // Touch: a vertical swipe pages one section. Native scroll is blocked
      // (preventDefault on move) so the page is fully paginated like the wheel.
      let startX = 0
      let startY = 0
      let multitouch = false
      const onTouchStart = (e: TouchEvent) => {
        // Two-finger gestures are pinch-zoom (handled by usePinchZoom), not swipes.
        if (e.touches.length > 1) {
          multitouch = true
          return
        }
        startX = e.touches[0].clientX
        startY = e.touches[0].clientY
      }
      const onTouchMove = (e: TouchEvent) => {
        if (e.cancelable) e.preventDefault()
      }
      const onTouchEnd = (e: TouchEvent) => {
        if (e.touches.length === 0 && multitouch) {
          multitouch = false
          return
        }
        if (animating || multitouch) return
        const dx = startX - e.changedTouches[0].clientX
        const dy = startY - e.changedTouches[0].clientY
        // Ignore taps and mostly-horizontal swipes.
        if (Math.abs(dy) < SWIPE_THRESHOLD || Math.abs(dy) <= Math.abs(dx)) return
        move(dy > 0 ? 1 : -1)
      }

      const onKey = (e: KeyboardEvent) => {
        if (animating) return
        if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
          e.preventDefault()
          move(1)
        } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
          e.preventDefault()
          move(-1)
        } else if (e.key === 'Home') {
          goTo(0)
        } else if (e.key === 'End') {
          goTo(sections.length - 1)
        }
      }

      window.addEventListener('wheel', onWheel, { passive: true })
      window.addEventListener('touchstart', onTouchStart, { passive: true })
      window.addEventListener('touchmove', onTouchMove, { passive: false })
      window.addEventListener('touchend', onTouchEnd, { passive: true })
      window.addEventListener('keydown', onKey)
      teardown = () => {
        window.removeEventListener('wheel', onWheel)
        window.removeEventListener('touchstart', onTouchStart)
        window.removeEventListener('touchmove', onTouchMove)
        window.removeEventListener('touchend', onTouchEnd)
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
