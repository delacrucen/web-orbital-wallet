import { motion, useReducedMotion, type Variants } from "motion/react";

/**
 * A feature section. The phone (fixed canvas) slides to one side while this copy
 * sits on the opposite side — mirror tracks. `side` is the side the TEXT sits on.
 * The copy staggers in (slide from its side + blur) when the section enters view
 * and animates back out when it leaves — entrance/exit on every pass.
 *
 * Hierarchy, top → bottom: a small kicker tag, a two-line headline (sans lead +
 * serif italic emphasis as the focal point), a muted body line, scannable
 * highlight chips, and a quiet CTA.
 */
export interface FeatureProps {
  id: string;
  /** Small uppercase eyebrow tag above the headline. */
  kicker: string;
  lead: string;
  emphasis: string;
  body: string;
  /** Short scannable tags shown as chips under the body. */
  highlights?: string[];
  /** CTA label. Defaults to "Conocé más". */
  cta?: string;
  /** Side the text sits on. Phone goes to the opposite side. */
  side: "left" | "right";
}

export function Feature({
  id,
  kicker,
  lead,
  emphasis,
  body,
  highlights,
  cta = "Conocé más",
  side,
}: FeatureProps) {
  const reduce = useReducedMotion();
  const right = side === "right";
  const fromX = right ? 48 : -48;

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
  };
  const item: Variants = reduce
    ? {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration: 0.5 } },
      }
    : {
        hidden: {
          opacity: 0,
          x: fromX,
          filter: "blur(10px)",
          transition: { duration: 0.45, ease: "easeIn" },
        },
        show: {
          opacity: 1,
          x: 0,
          filter: "blur(0px)",
          transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
        },
      };

  return (
    <section
      id={id}
      data-snap
      className="relative flex min-h-screen items-center"
    >
      <div className="mx-auto w-full max-w-6xl px-6">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.5 }}
          className={
            right
              ? "ml-auto flex max-w-lg flex-col items-end text-right"
              : "mr-auto flex max-w-lg flex-col items-start text-left"
          }
        >
          {/* Kicker tag */}
          <motion.span
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-white/70 backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-linear-to-br from-brand-primary to-brand-secondary" />
            {kicker}
          </motion.span>

          {/* Headline — sans lead + serif italic focal word. */}
          <motion.h2 variants={item} className="mt-5">
            <span className="block text-xl font-medium tracking-tight text-white/90 md:text-2xl">
              {lead}
            </span>
            <span className="-mt-1 block bg-linear-to-r from-brand-primary to-brand-secondary bg-clip-text pb-[0.12em] font-serif text-6xl font-bold italic leading-[1.1] text-transparent md:text-7xl">
              {emphasis}
            </span>
          </motion.h2>

          {/* Body */}
          <motion.p
            variants={item}
            className="mt-5 max-w-sm text-base leading-relaxed text-white/55 md:text-lg"
          >
            {body}
          </motion.p>

          {/* Highlight chips */}
          {highlights && highlights.length > 0 && (
            <motion.ul
              variants={item}
              className={`mt-7 flex flex-wrap gap-2 ${
                right ? "justify-end" : "justify-start"
              }`}
            >
              {highlights.map((h) => (
                <li
                  key={h}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-white/75"
                >
                  {h}
                </li>
              ))}
            </motion.ul>
          )}

          {/* CTA */}
          <motion.a
            variants={item}
            href={`#${id}`}
            className="group mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-white transition-colors hover:text-brand-secondary"
          >
            {cta}
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
