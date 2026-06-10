import { motion, useReducedMotion, type Variants } from "motion/react";

/**
 * A feature section. The phone (fixed canvas) slides to one side while this copy
 * sits on the opposite side — mirror tracks. `side` is the side the TEXT sits on.
 * The copy staggers in (slide from its side + blur) when the section enters view
 * and animates back out when it leaves — entrance/exit on every pass.
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
      className="relative flex min-h-screen items-center"
    >
      <div className="mx-auto w-full max-w-6xl px-6">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.5 }}
          className={
            side === "right"
              ? "ml-auto max-w-md text-right"
              : "mr-auto max-w-md text-left"
          }
        >
          <motion.p
            variants={item}
            className="text-2xl font-medium tracking-tight text-white md:text-3xl"
          >
            {lead}
          </motion.p>
          <motion.h2
            variants={item}
            className="bg-linear-to-r from-brand-primary to-brand-secondary bg-clip-text pb-[0.2em] pr-[0.12em] font-serif text-5xl italic leading-[1.3] text-transparent md:text-6xl"
          >
            {emphasis}
          </motion.h2>
          <motion.p variants={item} className="mt-4 text-white/60">
            {body}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
