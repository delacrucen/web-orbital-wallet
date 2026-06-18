import { motion, useReducedMotion, type Variants } from "motion/react";
import {
  BadgeCheck,
  Landmark,
  ShieldCheck,
  Zap,
  type LucideIcon,
} from "lucide-react";

import bancardLogo from "../assets/images/logos/orbital-pay/bancard.webp";
import personalpayLogo from "../assets/images/logos/orbital-pay/personalpay.webp";
import tigomoneyLogo from "../assets/images/logos/orbital-pay/tigomoney.webp";

/**
 * Orbital Pay — the wallet's payments gateway, given equal billing to the wallet
 * feature slides. An editorial column (chip → serif title → blurb → benefit list)
 * sits beside an infinite, auto-scrolling marquee of payment-method cards that
 * fades into the dark at both edges. Deposits and the withdrawal flow share one
 * loop; each card's eyebrow names which it is (Depósito / Retiro). Retiro is bank
 * transfer, intentionally left unqualified as auto/manual.
 *
 * The 3D phone canvas dissolves for this section (choreography `orbitalpay`
 * keyframe → opacity 0), so the content owns the full viewport. The section keeps
 * `id="orbital-pay"` + `data-snap` so the snap engine pages it like the other
 * slides on desktop; on mobile the columns stack taller than the screen and the
 * engine auto-detects it as a free-scroll section.
 *
 * The partner logos ship with mismatched treatments (Bancard dark, Personal Pay a
 * white mark, Tigo Money a self-contained blue badge), so each sits on a white
 * tile to read consistently — Personal Pay's white mark is inverted to read on it.
 *
 * The marquee is pure CSS (`ow-marquee` keyframe in styles.css over a doubled
 * track), so it adds no dependency; it pauses on hover and for reduced motion.
 */

interface PayMethod {
  key: string;
  /** Uppercase eyebrow — names the flow ("Depósito" / "Retiro"). */
  kind: string;
  name: string;
  blurb: string;
  /** Brand logo (deposit methods). Mutually exclusive with `icon`. */
  logo?: string;
  /** White-on-transparent marks invert to read on the white tile. */
  invert?: boolean;
  /** Lucide glyph for methods without a brand logo (e.g. bank transfer). */
  icon?: LucideIcon;
}

const METHODS: PayMethod[] = [
  {
    key: "personalpay",
    kind: "Depósito",
    name: "Personal Pay",
    blurb: "Cargá saldo al instante desde tu billetera Personal Pay.",
    logo: personalpayLogo,
    invert: true,
  },
  {
    key: "tigomoney",
    kind: "Depósito",
    name: "Tigo Money",
    blurb: "Depositá en segundos desde tu cuenta de Tigo Money.",
    logo: tigomoneyLogo,
  },
  {
    key: "bancard",
    kind: "Depósito",
    name: "Bancard",
    blurb: "Pagá con tus tarjetas a través de la red de Bancard.",
    logo: bancardLogo,
  },
  {
    key: "transferencia",
    kind: "Retiro",
    name: "Transferencia bancaria",
    blurb: "Pasá tu saldo a tu cuenta con una transferencia bancaria.",
    icon: Landmark,
  },
];

const BENEFITS: { icon: LucideIcon; title: string }[] = [
  { icon: Zap, title: "Operaciones acreditadas en segundos." },
  {
    icon: BadgeCheck,
    title: "Medios locales integrados en una sola pasarela.",
  },
  { icon: ShieldCheck, title: "Transferencias seguras directo a cuenta." },
];

function MethodCard({ m }: { m: PayMethod }) {
  const Icon = m.icon;
  return (
    <article className="relative flex w-52 shrink-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-linear-to-b from-white/[0.08] to-white/[0.015] p-5">
      {/* Soft brand glow up top to make the card feel alive. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full bg-brand-primary/25 blur-2xl"
      />
      <div className="relative flex h-14 items-center justify-center rounded-2xl bg-white px-3 shadow-lg shadow-black/30">
        {m.logo ? (
          <img
            src={m.logo}
            alt={m.name}
            draggable={false}
            className={`max-h-7 w-full object-contain${m.invert ? " invert" : ""}`}
          />
        ) : Icon ? (
          <Icon className="h-7 w-7 text-surface" strokeWidth={1.75} />
        ) : null}
      </div>
      <p className="relative mt-5 text-[0.65rem] font-semibold uppercase tracking-widest text-brand-primary/90">
        {m.kind}
      </p>
      <h3 className="relative mt-1 font-serif text-xl font-bold italic text-white">
        {m.name}
      </h3>
      <p className="relative mt-1.5 text-xs leading-relaxed text-white/55">
        {m.blurb}
      </p>
    </article>
  );
}

export function OrbitalPay() {
  const reduce = useReducedMotion();

  // Shared stagger container — cascades chip → title → blurb → benefits, with the
  // marquee as a sibling item.
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

  // Two copies so translateX(-50%) loops seamlessly.
  const track = [...METHODS, ...METHODS];

  return (
    <section
      id="orbital-pay"
      data-snap
      className="relative flex min-h-svh flex-col justify-center px-6 pr-10 py-20 md:pr-6 md:py-24"
    >
      <motion.div
        variants={group}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.2 }}
        className="mx-auto grid w-full max-w-6xl items-center gap-10 md:grid-cols-2 md:gap-14"
      >
        {/* Editorial column. */}
        <div className="text-center md:text-left">
          <motion.span
            variants={item}
            className="inline-block rounded-full border border-brand-primary/30 bg-brand-primary/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-white/80 backdrop-blur-sm"
          >
            Pasarela de pago
          </motion.span>
          <motion.h2
            variants={item}
            className="mt-5 bg-linear-to-r from-brand-primary to-brand-secondary bg-clip-text pb-[0.12em] font-serif text-5xl font-bold italic leading-[1.05] text-transparent sm:text-5xl md:text-7xl"
          >
            Orbital Pay
          </motion.h2>
          <motion.p
            variants={item}
            className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/70 md:mx-0 md:text-base"
          >
            Pagá, depositá y retirá con métodos locales de confianza. Orbital
            Pay conecta transferencias, billeteras y cuentas bancarias para
            mover tu saldo de forma rápida y simple.
          </motion.p>

          <div className="mt-8 flex flex-col gap-4">
            {BENEFITS.map(({ icon: Icon, title }) => (
              <motion.div
                key={title}
                variants={item}
                className="flex items-center gap-3.5 text-left"
              >
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-brand-primary/25 to-brand-secondary/25 text-brand-primary">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <p className="text-sm text-white md:text-base">{title}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Infinite auto-scrolling method marquee, faded into the dark at both
            edges. Hover (or reduced motion) pauses it. */}
        <motion.div
          variants={item}
          className="group relative overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]"
        >
          <div className="flex w-max gap-4 animate-[ow-marquee_24s_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:animate-none">
            {track.map((m, i) => (
              <MethodCard key={`${m.key}-${i}`} m={m} />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
