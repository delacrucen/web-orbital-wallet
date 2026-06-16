import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import ReactMarkdown, { type Components } from "react-markdown";
import { ArrowLeft } from "lucide-react";

import logoUrl from "../assets/images/logos/ow-white.webp";

/**
 * Renderer for the legal documents (Términos, Política de Privacidad). A plain,
 * scrollable page — separate from the paginated landing — that renders the
 * source markdown with on-brand typography. Cross-links the two docs and home
 * at the bottom so the pages stay connected.
 */

const markdownComponents: Components = {
  h1: ({ node: _n, ...props }) => (
    <h1
      className="mb-3 font-serif text-3xl font-bold italic text-white sm:text-4xl"
      {...props}
    />
  ),
  h2: ({ node: _n, ...props }) => (
    <h2
      className="mt-10 mb-3 text-xl font-bold text-white sm:text-2xl"
      {...props}
    />
  ),
  h3: ({ node: _n, ...props }) => (
    <h3 className="mt-6 mb-2 text-base font-semibold text-white" {...props} />
  ),
  p: ({ node: _n, ...props }) => (
    <p className="mb-4 text-sm leading-relaxed text-white/70" {...props} />
  ),
  ul: ({ node: _n, ...props }) => (
    <ul
      className="mb-4 list-disc space-y-1.5 pl-5 text-sm text-white/70"
      {...props}
    />
  ),
  ol: ({ node: _n, ...props }) => (
    <ol
      className="mb-4 list-decimal space-y-1.5 pl-5 text-sm text-white/70"
      {...props}
    />
  ),
  li: ({ node: _n, ...props }) => (
    <li className="leading-relaxed" {...props} />
  ),
  strong: ({ node: _n, ...props }) => (
    <strong className="font-semibold text-white" {...props} />
  ),
  blockquote: ({ node: _n, ...props }) => (
    <blockquote
      className="my-4 border-l-2 border-brand-primary/40 bg-white/[0.03] px-4 py-2 text-sm italic text-white/55"
      {...props}
    />
  ),
  a: ({ node: _n, ...props }) => (
    <a
      className="text-brand-primary underline-offset-2 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
};

export function LegalPage({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  useEffect(() => {
    const prev = document.title;
    document.title = `${title} · Orbital Wallet`;
    return () => {
      document.title = prev;
    };
  }, [title]);

  return (
    <div className="min-h-svh bg-surface text-ink">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link to="/" aria-label="Orbital Wallet" className="flex items-center">
            <img src={logoUrl} alt="Orbital Wallet" className="h-7 w-auto" />
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
        <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>

        <nav className="mt-14 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-6 text-sm text-white/60">
          <Link to="/terminos" className="transition-colors hover:text-white">
            Términos y Condiciones
          </Link>
          <Link to="/privacidad" className="transition-colors hover:text-white">
            Política de Privacidad
          </Link>
          <Link to="/" className="transition-colors hover:text-white">
            Inicio
          </Link>
        </nav>
      </main>
    </div>
  );
}
