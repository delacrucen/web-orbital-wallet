import { useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { ChevronDown } from "lucide-react";

import { Footer } from "./Footer";

/**
 * Frequently-asked questions — the last snap section. A title leads into an
 * accordion; the page Footer sits at the bottom (so the paginated engine can
 * reach it: the section grows taller than the viewport and scrolls through).
 * The 3D phone canvas stays dissolved here (see the `faq` keyframe), matching
 * the Orbital Pay section. Content staggers in on enter, like the rest of the
 * site.
 */

interface QA {
  q: string;
  a: string;
}

const FAQS: QA[] = [
  {
    q: "¿Qué es Orbital Wallet?",
    a: "Una billetera digital para pagar, enviar y gestionar tu dinero desde el teléfono, de forma simple, rápida y segura.",
  },
  {
    q: "¿Cómo creo mi cuenta?",
    a: "Descargá la app, registrate con tu número de teléfono y verificá tu identidad en minutos. No necesitás ir a ninguna sucursal.",
  },
  {
    q: "¿Es seguro usar Orbital Wallet?",
    a: "Sí. Ciframos tus datos de extremo a extremo y protegemos cada operación con autenticación en tu dispositivo.",
  },
  {
    q: "¿Tiene algún costo?",
    a: "Abrir y mantener tu cuenta es gratis. Solo algunas operaciones específicas pueden tener comisiones, siempre informadas antes de confirmar.",
  },
  {
    q: "¿Qué es Orbital Pay?",
    a: "Nuestra solución de pagos para comercios: procesamiento de tarjetas, transferencias locales y métodos alternativos en un solo lugar.",
  },
  {
    q: "¿En qué dispositivos funciona?",
    a: "En teléfonos Android y iOS. Descargá la app desde Google Play o el App Store.",
  },
];

export function FAQ() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<number | null>(0);

  const group: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
  };
  const item: Variants = reduce
    ? {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration: 0.5 } },
      }
    : {
        hidden: { opacity: 0, y: 22, filter: "blur(8px)" },
        show: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
        },
      };

  return (
    <section
      id="faq"
      data-snap
      className="relative flex min-h-svh flex-col px-6 pt-28"
    >
      <motion.div
        variants={group}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.2 }}
        className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center py-6"
      >
        <motion.div variants={item} className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-primary">
            Preguntas frecuentes
          </p>
          <h2 className="mt-3 bg-linear-to-r from-brand-primary to-brand-secondary bg-clip-text pb-[0.1em] font-serif text-3xl font-bold italic leading-[1.1] text-transparent sm:text-4xl md:text-5xl">
            ¿Tenés dudas?
          </h2>
        </motion.div>

        <div className="mt-8 md:mt-10">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={faq.q}
                variants={item}
                className="border-b border-white/10"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="font-medium text-white">{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-brand-primary transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 text-sm leading-relaxed text-white/60">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <Footer />
    </section>
  );
}
