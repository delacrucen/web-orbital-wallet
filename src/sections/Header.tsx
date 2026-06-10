import { useEffect, useState } from "react";

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

function Mark() {
  return (
    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/40">
      <span className="block h-3.5 w-3.5 rotate-45 rounded-full border border-white/70" />
    </span>
  );
}

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
            ? "max-w-6xl rounded-full border-white/10 bg-white/10 px-5 py-2.5 shadow-2xl shadow-black/40 backdrop-blur-xl"
            : "max-w-full rounded-[2rem] border-transparent bg-transparent px-4 py-1 shadow-none backdrop-blur-0"
        }`}
      >
        {/* Brand — wordmark collapses to just the mark once morphed. */}
        <a
          href="#top"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight text-white"
        >
          <Mark />
          <span
            className={`inline-block overflow-hidden whitespace-nowrap transition-all duration-500 ease-out motion-reduce:transition-none ${
              scrolled ? "max-w-0 opacity-0" : "max-w-[8rem] opacity-100"
            }`}
          >
            Orbital
          </span>
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
