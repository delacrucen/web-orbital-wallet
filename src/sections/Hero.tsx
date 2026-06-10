/**
 * Hero. Vertical text stack over a gradient backdrop; the 3D phone (rendered by
 * the fixed canvas behind) rises into the center showing the home screen.
 *
 * Hero background is a CSS gradient for now — the starfield (Phase 4) and an
 * optional video/photo (drop into the marked slot) layer in later.
 *
 * The top navigation lives in its own fixed <Header> (rendered by the route),
 * so it overlays the hero rather than sitting in this section's flow.
 */
export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col">
      {/* Hero glow lives in the fixed <Background> layer (behind the canvas) so
          the phone shows through. A video/photo can layer in here later. */}

      <div className="relative z-10 mx-auto mt-32 max-w-2xl px-6 text-center">
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
