/**
 * Hero. Vertical text stack over a gradient backdrop; the 3D phone (rendered by
 * the fixed canvas behind) rises into the center showing the home screen.
 *
 * Hero background is a CSS gradient for now — the starfield (Phase 4) and an
 * optional video/photo (drop into the marked slot) layer in later.
 */
function Logo() {
  return (
    <span className="flex items-center gap-2 text-lg font-semibold tracking-tight">
      <span className="grid h-7 w-7 place-items-center rounded-full border border-white/40">
        <span className="block h-3.5 w-3.5 rotate-45 rounded-full border border-white/70" />
      </span>
      Orbital
    </span>
  )
}

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col">
      {/* Hero glow lives in the fixed <Background> layer (behind the canvas) so
          the phone shows through. A video/photo can layer in here later. */}

      <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-white/75 md:flex">
          <a className="transition hover:text-white" href="#funciones">
            Funciones
          </a>
          <a className="transition hover:text-white" href="#faq">
            Preguntas Frecuentes
          </a>
          <a className="transition hover:text-white" href="#contacto">
            Contacto
          </a>
        </nav>
        <button className="rounded-full bg-gradient-to-b from-[#ff6b6b] to-[#e03e3e] px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-red-900/30 transition hover:brightness-110">
          Descargar App
        </button>
      </header>

      <div className="relative z-10 mx-auto mt-10 max-w-2xl px-6 text-center">
        <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white md:text-5xl">
          Pagá, enviá y manejá
          <br />
          <span className="font-serif text-5xl italic md:text-6xl">
            Más Simple que Nunca
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-md text-balance text-white/65">
          Enviá dinero, pagá servicios y realizá transferencias gratis desde
          cualquier lugar.
        </p>
      </div>

      {/* Spacer that reserves the lower area where the phone rises into view */}
      <div className="flex-1" />
    </section>
  )
}
