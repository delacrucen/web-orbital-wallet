import { useRef, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  type Variants,
} from "motion/react";
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
 * fades into the dark at both edges. Deposit methods and the bank-transfer
 * withdrawal share one loop; each card shows its brand logo and a short blurb.
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
 * The marquee is JS-driven (a motion value advanced per animation frame over a
 * doubled track): it auto-scrolls, pauses on hover and for reduced motion, and
 * can be dragged to scrub — releasing or leaving the area resumes auto-scroll.
 */

interface PayMethod {
  key: string;
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
    name: "Personal Pay",
    blurb: "Cargá saldo al instante desde tu billetera Personal Pay.",
    logo: personalpayLogo,
    invert: true,
  },
  {
    key: "tigomoney",
    name: "Tigo Money",
    blurb: "Depositá en segundos desde tu cuenta de Tigo Money.",
    logo: tigomoneyLogo,
  },
  {
    key: "bancard",
    name: "Red Bancard",
    blurb: "Pagá con tus tarjetas a través de la red de Bancard.",
    logo: bancardLogo,
  },
  {
    key: "transferencia",
    name: "Transferencia bancaria",
    blurb: "Pasá tu saldo a tu cuenta con una transferencia bancaria.",
    icon: Landmark,
  },
];

const BENEFITS: { icon: LucideIcon; title: string }[] = [
  { icon: Zap, title: "Operaciones acreditadas en segundos" },
  {
    icon: BadgeCheck,
    title: "Medios locales integrados en una sola pasarela",
  },
  { icon: ShieldCheck, title: "Transferencias seguras directo a cuenta" },
];

function MethodCard({ m }: { m: PayMethod }) {
  const Icon = m.icon;
  return (
    <article className="relative flex w-80 shrink-0 flex-col overflow-hidden rounded-[2rem] border border-white/5 bg-linear-to-b from-white/5 to-white/3 p-8">
      <div className="relative flex h-24 items-center justify-center rounded-2xl bg-white/85 px-6 shadow-lg shadow-black/30 backdrop-blur-md">
        {m.logo ? (
          <img
            src={m.logo}
            alt={m.name}
            draggable={false}
            className={`max-h-10 max-w-[80%] object-contain opacity-80${m.invert ? " invert" : ""}`}
          />
        ) : Icon ? (
          <Icon className="h-12 w-12 text-surface" strokeWidth={1.75} />
        ) : null}
      </div>
      {/* Each word stacks on its own line (e.g. "Transferencia" / "bancaria");
          min-height reserves two lines so single-word cards stay aligned. */}
      <h3 className="relative mt-7 flex min-h-[2.1em] flex-col justify-start bg-linear-to-r from-brand-primary to-brand-secondary bg-clip-text pb-[0.12em] font-serif text-3xl font-bold italic leading-[1.05] text-transparent">
        {m.name.split(" ").map((word) => (
          <span key={word}>{word}</span>
        ))}
      </h3>
      <p className="relative mt-3 text-base leading-relaxed text-white/55">
        {m.blurb}
      </p>
    </article>
  );
}

/** Gap between cards (Tailwind `gap-8` = 2rem) — used to size the loop unit. */
const CARD_GAP = 32;
/** Pixels per millisecond the marquee auto-advances (one set crosses in ~24s). */
const MARQUEE_MS = 24_000;

export function OrbitalPay() {
  const reduce = useReducedMotion();

  // The marquee is JS-driven (instead of a CSS animation) so a pointer drag can
  // scrub the track and auto-scroll resumes once the cursor leaves the area.
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [hovering, setHovering] = useState(false);
  const dragging = useRef(false);
  const start = useRef({ pointer: 0, value: 0 });

  // Width of one card set (+ its trailing gap) — the distance after which the
  // doubled track loops seamlessly. Read live so it survives layout changes.
  const halfWidth = () => {
    const el = trackRef.current;
    return el ? (el.scrollWidth + CARD_GAP) / 2 : 0;
  };

  // Keep x within [-half, 0) so translating the doubled track never reveals an
  // edge, whichever direction the drag goes.
  const wrap = (value: number, half: number) =>
    half ? (((value % half) + half) % half) - half : value;

  useAnimationFrame((_, delta) => {
    if (reduce || hovering || dragging.current) return;
    const half = halfWidth();
    if (!half) return;
    x.set(wrap(x.get() - (half / MARQUEE_MS) * delta, half));
  });

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    start.current = { pointer: e.clientX, value: x.get() };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const delta = e.clientX - start.current.pointer;
    x.set(wrap(start.current.value + delta, halfWidth()));
  };
  // Leaving the area both ends any drag and clears hover, so auto-scroll resumes.
  const onPointerLeave = () => {
    dragging.current = false;
    setHovering(false);
  };

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

        {/* Infinite method marquee, faded into the dark at both edges. It
            auto-scrolls, pauses while hovered or dragged, and can be dragged to
            scrub — releasing or leaving the area resumes the auto-scroll. */}
        <motion.div
          variants={item}
          onPointerEnter={() => setHovering(true)}
          onPointerLeave={onPointerLeave}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={() => (dragging.current = false)}
          className="ow-edge-fade relative cursor-grab touch-pan-y select-none overflow-hidden py-2 active:cursor-grabbing"
        >
          <motion.div ref={trackRef} style={{ x }} className="flex w-max gap-8">
            {track.map((m, i) => (
              <MethodCard key={`${m.key}-${i}`} m={m} />
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
