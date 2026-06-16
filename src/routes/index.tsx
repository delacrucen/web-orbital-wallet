import { useRef } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import { Background } from '../canvas/Background'
import { Scene } from '../canvas/Scene'
import { StarfieldScene } from '../canvas/StarfieldScene'
import { SmoothScroll } from '../scroll/SmoothScroll'
import { usePointerParallax } from '../scroll/usePointerParallax'
import { useDeviceTilt } from '../scroll/useDeviceTilt'
import { useMobileLayout } from '../scroll/useMobileLayout'
import { usePinchZoom } from '../scroll/usePinchZoom'
import { usePhoneFade } from '../scroll/usePhoneFade'
import { Header } from '../sections/Header'
import { Loader } from '../sections/Loader'
import { Hero } from '../sections/Hero'
import { Feature } from '../sections/Feature'
import { OrbitalPay } from '../sections/OrbitalPay'
import { FAQ } from '../sections/FAQ'
import { SlideNav } from '../sections/SlideNav'

export const Route = createFileRoute('/')({
  component: Landing,
})

function Landing() {
  const sceneRef = useRef<HTMLDivElement>(null)

  useMobileLayout()
  usePointerParallax()
  useDeviceTilt()
  usePinchZoom()
  usePhoneFade(sceneRef)

  return (
    <>
      <SmoothScroll />

      {/* Layer 0: fixed background (hero video + gradient). */}
      <Background />

      {/* Layer 0.5: starfield canvas. Its own layer (below the phone) so the
          phone can fade without taking the stars with it. */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <StarfieldScene />
      </div>

      {/* Layer 1: the phone's fixed, full-screen canvas. Never unmounts.
          Transparent clear so the background + stars show through. `usePhoneFade`
          dissolves this layer for the Orbital Pay section. */}
      <div
        ref={sceneRef}
        className="pointer-events-none fixed inset-0 z-10"
        style={{ willChange: 'opacity' }}
      >
        <Scene />
      </div>

      {/* Layer 3: fixed morphing top navigation, above every other layer. */}
      <Header />

      {/* Slideshow indicator — dots + up/down chevrons, bottom-right. Sits below
          the loader (z-100) so it stays hidden until the page is revealed. */}
      <SlideNav />

      {/* Layer 4: startup loader — covers everything until assets are ready,
          then fades out. Unmounts itself when done. */}
      <Loader />

      {/* Layer 2: scrolling marketing copy. Transparent sections so the phone
          shows through; defines the page height. */}
      <main className="relative z-20">
        <Hero />
        <Feature
          id="funciones"
          lead="Mové tu dinero"
          emphasis="Sin Fricción"
          body="Enviá y recibí transferencias bancarias al instante, los siete días, a cualquier hora."
          side="right"
        />
        <Feature
          id="qr"
          lead="Pagá en segundos"
          emphasis="Solo Escaneá"
          body="Apuntá la cámara, confirmá el monto y listo. Pagar en comercios nunca fue tan rápido."
          side="left"
        />
        <Feature
          id="todo"
          lead="Gestioná todo desde"
          emphasis="Un Solo Lugar"
          body="Luz, agua, internet y todas tus cuentas, pagadas y al día sin salir de la app."
          side="right"
        />
        <OrbitalPay />
        <FAQ />
      </main>
    </>
  )
}
