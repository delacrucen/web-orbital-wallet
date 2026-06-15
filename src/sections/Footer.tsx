import logoUrl from "../assets/images/logos/ow-white.webp";

/**
 * Page footer. Brand mark, legal links, and copyright. Lives at the bottom of
 * the last (FAQ) section so the paginated scroll engine can reach it. The
 * legal hrefs are placeholders until the real pages exist.
 */
export function Footer() {
  return (
    <footer
      id="contacto"
      className="mt-16 border-t border-white/10 py-8"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 text-center md:flex-row md:justify-between md:text-left">
        <div className="flex flex-col items-center gap-2 md:items-start">
          <img src={logoUrl} alt="Orbital Wallet" className="h-6 w-auto" />
          <p className="text-xs text-white/40">
            © 2026 Orbital Wallet. Todos los derechos reservados.
          </p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/60">
          {/* TODO: link to the real legal pages when available. */}
          <a href="#" className="transition-colors hover:text-white">
            Términos de Servicio
          </a>
          <a href="#" className="transition-colors hover:text-white">
            Política de Privacidad
          </a>
        </nav>
      </div>
    </footer>
  );
}
