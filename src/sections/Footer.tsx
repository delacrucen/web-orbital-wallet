import logoUrl from "../assets/images/logos/ow-white.webp";
import { downloadModal } from "../lib/downloadModal";
import { slideNav } from "../scroll/slideNav";

/**
 * Page footer. A floating frosted rounded pill (mirrors the morphed header)
 * over the starfield, at the bottom of the last (FAQ) section so the paginated
 * scroll engine can reach it. Brand + tagline jump to the top (like the header
 * wordmark), a belt of social links, a Descargar App CTA (opens the shared
 * download modal), and legal links that open /terminos and /privacidad in a new
 * tab.
 */

interface Social {
  label: string;
  href: string;
  /** 24×24 brand glyph path (lucide ships no brand icons). */
  path: string;
}

// TODO: point these at the real social profiles when they exist.
const SOCIALS: Social[] = [
  {
    label: "Instagram",
    href: "#",
    path: "M12 2.163c3.204 0 3.584.012 4.849.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.849.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163C8.741 0 8.333.015 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  },
  {
    label: "Facebook",
    href: "#",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    label: "WhatsApp",
    href: "#",
    path: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z",
  },
  {
    label: "X",
    href: "#",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
];

export function Footer() {
  return (
    <footer id="contacto" className="mt-16 mb-6">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-3xl border border-white/10 bg-white/3 px-7 py-8 text-center backdrop-blur-md">
        {/* Brand + tagline — jumps to the top, like the header wordmark. */}
        <button
          type="button"
          onClick={() => slideNav.goTo(0)}
          aria-label="Volver al inicio"
          className="flex flex-col items-center gap-3 transition-opacity hover:opacity-90"
        >
          <img src={logoUrl} alt="Orbital Wallet" className="h-7 w-auto" />
          <p className="max-w-xs text-sm leading-relaxed text-white/60">
            Tu dinero en órbita. Seguro, ágil y en tu bolsillo.
          </p>
        </button>

        {/* Social belt. */}
        <div className="flex items-center gap-3">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]" aria-hidden="true">
                <path d={s.path} />
              </svg>
            </a>
          ))}
        </div>

        {/* Download CTA — opens the shared modal. */}
        <button
          type="button"
          onClick={() => downloadModal.open()}
          className="rounded-full bg-linear-to-b from-brand-primary to-brand-secondary px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-red-900/30 transition hover:brightness-110"
        >
          Descargar App
        </button>

        {/* Legal + copyright. */}
        <div className="flex w-full flex-col items-center gap-3 border-t border-white/10 pt-5 text-center md:flex-row md:justify-between md:text-left">
          <p className="text-xs text-white/40">
            © 2026 Orbital Wallet. Todos los derechos reservados.
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/60">
            <a
              href="/terminos"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-white"
            >
              Términos de Servicio
            </a>
            <a
              href="/privacidad"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-white"
            >
              Política de Privacidad
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
