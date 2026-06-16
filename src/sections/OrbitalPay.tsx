import { motion, useReducedMotion, type Variants } from "motion/react";
import {
  ArrowLeftRight,
  CreditCard,
  Handshake,
  type LucideIcon,
} from "lucide-react";

/**
 * Orbital Pay — a sibling service to the wallet. A chip-badged title leads into
 * a row of three equal cards (one per pillar). The 3D phone canvas dissolves for
 * this section (see `usePhoneFade` + the `orbitalpay` keyframe) so the content
 * owns the viewport. Copy and cards stagger in on enter (and back out on leave),
 * matching the feature sections' orchestration.
 *
 * On desktop the section fits one viewport and pages like the other slides. On
 * mobile the cards stack taller than the screen, so the scroll engine treats it
 * as a scrollable section: snap to enter/exit, free step-scroll within.
 */

interface PayCard {
  icon: LucideIcon;
  title: string;
  body: string;
}

const CARDS: PayCard[] = [
  {
    icon: Handshake,
    title: "Lo que hacemos",
    body: "Pagos simples, sin que ningún comercio quede atrás.",
  },
  {
    icon: ArrowLeftRight,
    title: "Lo que ofrecemos",
    body: "Retiros y depósitos locales, sin interrupciones.",
  },
  {
    icon: CreditCard,
    title: "Métodos de pago",
    body: "Tarjetas y transferencias, locales e internacionales.",
  },
];

export function OrbitalPay() {
  const reduce = useReducedMotion();

  // Shared stagger container — reused at each level (header, grid) so the whole
  // section cascades: badge → title → description → card 1 → 2 → 3.
  const group: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.04 } },
  };

  const item: Variants = reduce
    ? {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration: 0.5 } },
      }
    : {
        hidden: { opacity: 0, y: 26, filter: "blur(8px)" },
        show: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
        },
      };

  return (
    <section
      id="orbital-pay"
      data-snap
      className="relative flex min-h-svh flex-col justify-center px-6 py-24 md:py-28"
    >
      <motion.div
        variants={group}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.25 }}
        className="mx-auto w-full max-w-5xl"
      >
        {/* Title + description, centered at the top — staggered as a group. */}
        <motion.div variants={group} className="mx-auto max-w-2xl text-center">
          <motion.span
            variants={item}
            className="inline-block rounded-full border border-brand-primary/30 bg-brand-primary/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-white/80 backdrop-blur-sm"
          >
            Orbital Pay
          </motion.span>
          <motion.h2
            variants={item}
            className="mt-5 bg-linear-to-r from-brand-primary to-brand-secondary bg-clip-text pb-[0.1em] font-serif text-3xl font-bold italic leading-[1.1] text-transparent sm:text-4xl md:text-5xl"
          >
            Soluciones de pago rápidas y seguras
          </motion.h2>
          <motion.p
            variants={item}
            className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/70 md:text-base"
          >
            Tarjetas, transferencias locales y métodos alternativos — todo el
            procesamiento de pagos de tu negocio en un solo lugar con Orbital
            Pay.
          </motion.p>
        </motion.div>

        {/* Three equal cards — staggered after the copy. */}
        <motion.div
          variants={group}
          className="mt-10 grid grid-cols-1 gap-4 md:mt-14 md:grid-cols-3"
        >
          {CARDS.map(({ icon: Icon, title, body }) => (
            <motion.div
              key={title}
              variants={item}
              className="rounded-3xl p-7 border border-white/10 bg-black/50"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-brand-primary/25 to-brand-secondary/25 text-brand-primary">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <h3 className="mt-5 text-sm font-extrabold uppercase tracking-tight text-white">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">
                {body}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
