import { useEffect, useState } from "react";

import logoUrl from "../assets/images/logos/ow-white.webp";

/**
 * Morphing top navigation.
 *
 * At the very top of the page (scrollY ≈ 0) the bar is "normalized": full
 * width, transparent, spread edge-to-edge. As soon as the user scrolls down it
 * "morphs" into a centered floating glass pill — narrower, rounded, blurred,
 * with the wordmark collapsing to just the mark. Scrolling back to the top
 * normalizes it again.
 *
 * The morph is a single boolean (`scrolled`) flipped by a passive scroll
 * listener; every visual change is a CSS transition keyed off that flag. This
 * is deliberately *not* the pure-CSS scroll-state trick (`animation-timeline`/
 * `:has()` hacks), which is still unstable in Firefox and Safari — driving it
 * from TS gives identical behavior across every major vendor. `transition-all`
 * + `motion-reduce:transition-none` keeps it smooth while honoring
 * reduced-motion.
 */

const NAV = [
  { label: "Funciones", href: "#funciones" },
  { label: "Preguntas Frecuentes", href: "#faq" },
  { label: "Contacto", href: "#contacto" },
];

/** Pixels scrolled before the bar morphs. Normalizes again on the way back to 0. */
const MORPH_AT = 8;

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setScrolled(window.scrollY > MORPH_AT);
      });
    };
    onScroll(); // sync on mount (e.g. restored scroll position)
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 flex justify-center px-4 transition-[padding] duration-500 ease-out ${
        scrolled ? "py-3" : "py-6"
      }`}
    >
      <nav
        className={`flex w-full items-center justify-between gap-4 border transition-all duration-500 ease-out motion-reduce:transition-none ${
          scrolled
            ? "max-w-6xl rounded-full border-white/10 bg-white/10 px-5 py-2.5 backdrop-blur-xl"
            : "max-w-full rounded-4xl border-transparent bg-transparent px-4 py-1 backdrop-blur-0"
        }`}
      >
        {/* Brand wordmark — shrinks slightly once the bar morphs. */}
        <a
          href="#top"
          className="flex items-center"
          aria-label="Orbital Wallet"
        >
          <img
            src={logoUrl}
            alt="Orbital Wallet"
            className={`w-auto transition-all duration-500 ease-out motion-reduce:transition-none ${
              scrolled ? "h-6" : "h-8"
            }`}
          />
        </a>

        {/* Links — centered between brand and CTA. */}
        <div className="hidden items-center gap-8 text-sm text-white/75 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="whitespace-nowrap transition hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </div>

        <button className="shrink-0 whitespace-nowrap rounded-full bg-linear-to-b from-brand-primary to-brand-secondary px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-red-900/30 transition hover:brightness-110">
          Descargar App
        </button>
      </nav>
    </header>
  );
}
