import { createFileRoute } from "@tanstack/react-router";

import privacidad from "../assets/docs/politica_privacidad_OW.md?raw";
import { LegalPage } from "../sections/LegalPage";

export const Route = createFileRoute("/privacidad")({
  component: Privacidad,
});

function Privacidad() {
  return <LegalPage title="Política de Privacidad" content={privacidad} />;
}
