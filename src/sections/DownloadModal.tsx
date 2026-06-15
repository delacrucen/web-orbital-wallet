import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import { X } from "lucide-react";

import { downloadModal } from "../lib/downloadModal";
import { StoreBadges } from "./StoreBadges";

/**
 * "Descargar App" modal. Shows a static QR that points at our `/download`
 * route — scanning it on a phone redirects to the matching store (iOS/Android).
 * The store badges sit below as a direct alternative (e.g. on desktop, where
 * scanning your own screen isn't an option).
 *
 * Open state lives in the shared `downloadModal` store so any CTA (header,
 * footer) can open this single instance. Render it once near the app root.
 */
export function DownloadModal() {
  const open = useSyncExternalStore(
    downloadModal.subscribe,
    downloadModal.getSnapshot,
    downloadModal.getSnapshot,
  );
  const onClose = downloadModal.close;

  // Resolve the QR target lazily on the client (needs window.location).
  const [downloadUrl, setDownloadUrl] = useState("");
  useEffect(() => {
    setDownloadUrl(`${window.location.origin}/download`);
  }, []);

  // Close on Escape while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
          />

          {/* Card */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Descargar la app"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md rounded-3xl border border-white/10 bg-surface/95 p-8 text-center shadow-2xl"
          >
            <button
              type="button"
              aria-label="Cerrar"
              onClick={onClose}
              className="absolute right-4 top-4 text-white/50 transition-colors hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="font-serif text-2xl font-bold italic text-white">
              Descargá la app
            </h2>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-white/65">
              Escaneá el código con tu teléfono y te llevamos a la tienda
              correcta.
            </p>

            {/* QR — white quiet-zone box so any scanner reads it cleanly. */}
            <div className="mx-auto mt-6 w-fit rounded-2xl bg-white p-4">
              {downloadUrl && (
                <QRCodeSVG
                  value={downloadUrl}
                  size={180}
                  level="M"
                  marginSize={0}
                />
              )}
            </div>

            <div className="mt-7 flex items-center gap-3 text-xs uppercase tracking-widest text-white/40">
              <span className="h-px flex-1 bg-white/10" />o
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <StoreBadges className="mt-6 justify-center" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
