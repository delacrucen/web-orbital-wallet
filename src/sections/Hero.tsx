import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";

import { stage } from "../lib/stage";
import { scrollState } from "../scroll/scrollStore";
import { StoreBadges } from "./StoreBadges";

/**
 * Hero copy. A single large verb cycles (Pagá → Transferí → Gestioná) with a
 * per-character blur/rise stagger; the whole block assembles in once the loader
 * reveals the scene (synced with the phone landing). The phone (fixed canvas)
 * sits in the right half. Honors reduced-motion.
 */
const WORDS = ["Pagá", "Transferí", "Gestioná"];
const CYCLE_MS = 2600;

const wordContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.045, delayChildren: 0.04 } },
  exit: { transition: { staggerChildren: 0.025, staggerDirection: -1 } },
};
const letterVariant: Variants = {
  hidden: { opacity: 0, y: "0.45em", filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: "0em",
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: "-0.35em",
    filter: "blur(8px)",
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

export function Hero() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  // Assemble once the loader clears (polls the shared reveal flag).
  useEffect(() => {
    if (reduce) {
      setRevealed(true);
      return;
    }
    let raf = 0;
    const check = () => {
      if (stage.revealed) setRevealed(true);
      else raf = requestAnimationFrame(check);
    };
    raf = requestAnimationFrame(check);
    return () => cancelAnimationFrame(raf);
  }, [reduce]);

  // Cycle the verb only after the hero has assembled.
  useEffect(() => {
    if (!revealed) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % WORDS.length);
    }, CYCLE_MS);
    return () => clearInterval(id);
  }, [revealed]);

  // Exit: fade + blur + lift the copy as you scroll out of the hero (and back
  // in on return). Driven straight on the DOM off the shared scroll progress.
  const exitRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    const tick = () => {
      const el = exitRef.current;
      if (el) {
        const p = Math.min(1, scrollState.progress / 0.16);
        el.style.opacity = String(1 - p);
        el.style.filter = `blur(${p * 10}px)`;
        el.style.transform = `translateY(${p * -28}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce]);

  return (
    <section
      data-snap
      className="relative flex min-h-svh flex-col md:flex-row md:items-center"
    >
      {/* Mobile: reserve the upper zone for the fixed 3D phone; the copy docks
          beneath it. Desktop: left column, phone in the right half. */}
      <div aria-hidden className="h-(--ow-hero-zone) shrink-0 md:hidden" />
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6">
        {revealed && (
          <div
            ref={exitRef}
            style={{ willChange: "opacity, transform, filter" }}
          >
            <motion.div
              className="mx-auto max-w-md text-center md:mx-0 md:max-w-xl md:text-left"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Fixed-height band (no clip) so the word morphs in place. Serif
                italic to match the feature-section emphasis type. */}
              <div className="flex h-[1.35em] items-center justify-center whitespace-nowrap font-serif text-5xl font-bold italic leading-[1.2] text-white sm:text-6xl md:justify-start md:text-8xl lg:text-9xl">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={WORDS[index]}
                    className="inline-flex"
                    variants={reduce ? undefined : wordContainer}
                    initial={reduce ? { opacity: 0 } : "hidden"}
                    animate={reduce ? { opacity: 1 } : "visible"}
                    exit={reduce ? { opacity: 0 } : "exit"}
                    transition={reduce ? { duration: 0.3 } : undefined}
                  >
                    {WORDS[index].split("").map((ch, i) => (
                      <motion.span
                        key={`${WORDS[index]}-${i}`}
                        className="inline-block"
                        variants={reduce ? undefined : letterVariant}
                      >
                        {ch}
                      </motion.span>
                    ))}
                  </motion.span>
                </AnimatePresence>
              </div>

              <motion.p
                className="mx-auto mt-4 max-w-xs  text-white/80 sm:mt-5 sm:max-w-sm sm:text-lg md:mx-0 md:text-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.9 }}
              >
                Con Orbital Wallet, pagá, enviá y gestioná tu dinero de forma
                simple, rápida y segura desde cualquier lugar
              </motion.p>

              <motion.div
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.7,
                  duration: 0.8,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <StoreBadges className="mt-6 justify-center sm:mt-8 md:justify-start" />
              </motion.div>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}
