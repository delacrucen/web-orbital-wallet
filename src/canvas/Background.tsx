import { useEffect, useRef } from 'react'

import heroVideo from '../assets/videos/hero.mp4'
import { clamp } from '../lib/lerp'
import { scrollState } from '../scroll/scrollStore'

/**
 * Fixed background layer behind the canvas (z-0). The phone canvas (z-10)
 * renders over this; marketing copy (z-20) sits over both. Sections stay
 * transparent so the phone shows through.
 *
 * Hero background video + gradient overlay, fading out as you scroll past the
 * hero to reveal the dark field below (the starfield lands here in Phase 4). The
 * video is paused once fully faded to free decode resources.
 */
export function Background() {
  const fadeRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const fade = fadeRef.current
    const video = videoRef.current
    let raf = 0

    const update = () => {
      // Fully visible at the top, gone by ~25% scroll (end of the hero).
      const opacity = clamp(1 - scrollState.progress / 0.25)
      if (fade) fade.style.opacity = String(opacity)

      if (video) {
        if (opacity <= 0.01) {
          if (!video.paused) video.pause()
        } else if (video.paused) {
          void video.play().catch(() => {})
        }
      }
      raf = requestAnimationFrame(update)
    }
    raf = requestAnimationFrame(update)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 bg-[#05050a]"
    >
      <div ref={fadeRef} className="absolute inset-0">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src={heroVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
        {/* Fullscreen brand-color wash over the video (tune the /NN alphas). */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#ff6b6b]/45 via-[#e03e3e]/35 to-[#7a1d1d]/50" />
        {/* Gradient overlay: red brand glow up top, melting to black at the
            bottom so the hero blends into the dark feature sections. */}
        <div className="absolute inset-0 bg-[radial-gradient(110%_70%_at_50%_-15%,rgba(176,40,40,0.45)_0%,rgba(42,13,16,0.25)_38%,rgba(5,5,10,0)_70%),linear-gradient(180deg,rgba(5,5,10,0.55)_0%,rgba(5,5,10,0)_28%,rgba(5,5,10,0.92)_100%)]" />
      </div>
    </div>
  )
}
