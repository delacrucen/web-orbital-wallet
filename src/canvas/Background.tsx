import { useEffect, useRef } from "react";

import heroVideo from "../assets/videos/hero.mp4";
import { BRAND_RGB } from "../branding/colors";
import { clamp } from "../lib/lerp";
import { scrollState } from "../scroll/scrollStore";

/* Brand wash over the hero video — a solid brand tint (not a gradient).
   Toggle the default by switching .primary ↔ .secondary below. */
const WASH = {
  primary: `rgba(${BRAND_RGB.primary}, 0.4)`,
  secondary: `rgba(${BRAND_RGB.secondary}, 0.4)`,
};
const WASH_COLOR = WASH.primary; // ← switch to WASH.secondary to toggle

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
  const fadeRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fade = fadeRef.current;
    const video = videoRef.current;
    let raf = 0;

    const update = () => {
      // Fully visible at the top, gone by ~25% scroll (end of the hero).
      const opacity = clamp(1 - scrollState.progress / 0.25);
      if (fade) fade.style.opacity = String(opacity);

      if (video) {
        if (opacity <= 0.01) {
          if (!video.paused) video.pause();
        } else if (video.paused) {
          void video.play().catch(() => {});
        }
      }
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 bg-surface"
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
        {/* Black darkening layer — raise the alpha (bg-black/NN) to dim the video. */}
        <div className="absolute inset-0 bg-black/80" />
        {/* Fullscreen brand wash over the video — solid brand tint
            (toggle primary/secondary via WASH_COLOR up top). */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: WASH_COLOR }}
        />
        {/* Top brand glow — its own layer so it's easy to tweak/remove. Brand
            primary, sourced from branding/colors.ts. */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(110% 70% at 50% -15%, rgba(${BRAND_RGB.primary}, 0.4) 0%, rgba(${BRAND_RGB.primary}, 0.16) 38%, transparent 70%)`,
          }}
        />
        {/* Bottom-only fade: the top + middle stay uniform (covered by the black
            + brand layers above); only the lower portion darkens to blend into
            the dark feature sections. Raise the start % to push the fade lower. */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,transparent_55%,var(--color-surface)_100%)]" />
      </div>
    </div>
  );
}
