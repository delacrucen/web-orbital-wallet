import { useScrollReveal } from '../scroll/useScrollReveal'

/**
 * A feature section. The phone (fixed canvas) slides to one side while this copy
 * sits on the opposite side — mirror tracks. `side` is the side the TEXT sits on;
 * the copy scroll-reveals in from that side as the section enters.
 */
export interface FeatureProps {
  id: string
  lead: string
  emphasis: string
  body: string
  /** Side the text sits on. Phone goes to the opposite side. */
  side: 'left' | 'right'
}

export function Feature({ id, lead, emphasis, body, side }: FeatureProps) {
  const reveal = useScrollReveal(side)

  return (
    <section id={id} className="relative flex min-h-screen items-center">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div
          ref={reveal}
          style={{ opacity: 0, willChange: 'transform, opacity' }}
          className={
            side === 'right'
              ? 'ml-auto max-w-md text-right'
              : 'mr-auto max-w-md text-left'
          }
        >
          <p className="text-2xl font-medium tracking-tight text-white md:text-3xl">
            {lead}
          </p>
          <h2 className="bg-gradient-to-r from-[#ff7a7a] to-[#e03e3e] bg-clip-text font-serif text-5xl italic text-transparent md:text-6xl">
            {emphasis}
          </h2>
          <p className="mt-4 text-white/60">{body}</p>
        </div>
      </div>
    </section>
  )
}
