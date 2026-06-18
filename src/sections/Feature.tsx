import { motion, useReducedMotion, type Variants } from "motion/react";

/**
 * A feature section. The phone (fixed canvas) slides to one side while this copy
 * sits on the opposite side — mirror tracks. `side` is the side the TEXT sits on.
 * The copy staggers in (slide from its side + blur) when the section enters view
 * and animates back out when it leaves — entrance/exit on every pass.
 *
 * Three stacked lines: `lead` names the service, the serif italic `emphasis` is
 * the focal "hero" word, and `body` is the full description.
 */
export interface FeatureProps {
  id: string;
  lead: string;
  emphasis: string;
  body: string;
  /** Side the text sits on. Phone goes to the opposite side. */
  side: "left" | "right";
}

export function Feature({ id, lead, emphasis, body, side }: FeatureProps) {
  const reduce = useReducedMotion();
  const fromX = side === "right" ? 48 : -48;

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
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
      className="relative flex min-h-svh flex-col md:flex-row md:items-center"
    >
      {/* Mobile: reserve the upper zone for the fixed 3D phone so the copy docks
          directly beneath it (flex-column rhythm: phone zone → text zone).
          Desktop: no spacer — the phone sits beside the copy. */}
      <div aria-hidden className="h-(--ow-feat-zone) shrink-0 md:hidden" />
      <div className="mx-auto w-full max-w-6xl px-6">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.5 }}
          className={
            side === "right"
              ? "mx-auto max-w-sm text-center md:ml-auto md:mr-0 md:max-w-md md:text-right"
              : "mx-auto max-w-sm text-center md:mr-auto md:ml-0 md:max-w-md md:text-left"
          }
        >
          <motion.p
            variants={item}
            className="text-xl font-thin tracking-wide text-white sm:text-2xl md:text-3xl pb-2"
          >
            {lead}
          </motion.p>
          <motion.h2
            variants={item}
            className="-mt-1 bg-linear-to-r from-brand-primary to-brand-secondary bg-clip-text pb-[0.12em] font-serif text-5xl font-bold italic text-transparent sm:text-5xl md:text-7xl"
          >
            {emphasis}
          </motion.h2>
          <motion.p
            variants={item}
            className="mt-3 text-sm leading-relaxed text-white/70 sm:mt-4 sm:text-base md:text-xl"
          >
            {body}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
