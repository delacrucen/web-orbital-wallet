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
    a: "Una billetera electrónica que funciona desde una app móvil: administrás tu cuenta, consultás saldo y movimientos, transferís y pagás servicios. Algunos servicios financieros son provistos o procesados por Financiera FIC S.A.E.C.A.",
  },
  {
    q: "¿Orbital Wallet es un banco o una financiera?",
    a: "No. Orbital Wallet es la plataforma digital que facilita el acceso a los servicios. Los servicios financieros que correspondan los presta o procesa Financiera FIC S.A.E.C.A. u otros aliados habilitados.",
  },
  {
    q: "¿Qué necesito para registrarme?",
    a: "Ser mayor de edad, tener documento de identidad vigente, una línea telefónica activa, un celular compatible y conexión a internet. Descargá la app desde los canales oficiales y aceptá los Términos y la Política de Privacidad.",
  },
  {
    q: "¿Cómo cuida Orbital Wallet mi cuenta?",
    a: "Con PIN, contraseña, OTP, biometría, validación documental, prueba de vida, geolocalización y monitoreo antifraude. Nunca te vamos a pedir tu contraseña, PIN o código OTP fuera de los canales oficiales.",
  },
  {
    q: "¿Qué hago si pierdo mi celular?",
    a: "Contactá de inmediato a Orbital Wallet por los canales oficiales para reportarlo. Podemos bloquear, limitar o revisar el acceso a tu cuenta por seguridad.",
  },
  {
    q: "¿Puedo enviar y recibir dinero?",
    a: "Sí, si la funcionalidad está habilitada podés hacer transferencias internas e interbancarias, sujetas a saldo disponible, límites, datos correctos del destinatario y validaciones de seguridad.",
  },
  {
    q: "¿Orbital Wallet tiene costo?",
    a: "Los costos, comisiones y condiciones económicas aplicables se informan en el Tarifario vigente, siempre antes de confirmar cada operación.",
  },
  {
    q: "¿Puedo pagar servicios desde la app?",
    a: "Sí, si está habilitado podés pagar facturas, servicios y recargas. Revisá la empresa, el identificador del servicio, el monto y el vencimiento antes de confirmar.",
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
      className="relative flex min-h-svh flex-col px-6 pr-10 pt-28 md:pr-6"
    >
      <motion.div
        variants={group}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.2 }}
        className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center py-6"
      >
        <motion.div variants={item} className="text-center">
          <h2 className="mt-3 bg-linear-to-r from-brand-primary to-brand-secondary bg-clip-text pb-[0.12em] font-serif text-5xl font-bold italic leading-[1.05] text-transparent sm:text-5xl md:text-7xl">
            Preguntas frecuentes
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
