import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import logoUrl from "../assets/images/logos/ow-white.webp";
import { StoreBadges } from "../sections/StoreBadges";
import { detectPlatform, storeUrlFor } from "../config/appStores";

export const Route = createFileRoute("/download")({
  component: Download,
});

/**
 * QR landing + store redirect. The download modal's QR points here; a phone that
 * scans it is sniffed for iOS/Android and sent straight to the matching store.
 * Desktop (or an unknown OS) sees both badges as a fallback instead.
 */
function Download() {
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const url = storeUrlFor(detectPlatform());
    if (url) {
      setRedirecting(true);
      window.location.replace(url);
    }
  }, []);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-surface px-6 text-center text-ink">
      <img src={logoUrl} alt="Orbital Wallet" className="h-9 w-auto" />

      {redirecting ? (
        <p className="text-white/70">Redirigiendo a la tienda…</p>
      ) : (
        <>
          <div className="max-w-sm">
            <h1 className="font-serif text-3xl font-bold italic text-white">
              Descargá Orbital Wallet
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Elegí tu tienda para descargar la app.
            </p>
          </div>
          <StoreBadges className="justify-center" />
        </>
      )}
    </div>
  );
}
