import { createFileRoute } from "@tanstack/react-router";

import terminos from "../assets/docs/terminos_y_condiciones_OW.md?raw";
import { LegalPage } from "../sections/LegalPage";

export const Route = createFileRoute("/terminos")({
  component: Terminos,
});

function Terminos() {
  return <LegalPage title="Términos y Condiciones" content={terminos} />;
}
