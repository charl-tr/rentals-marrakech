"use client";

import Link from "next/link";
import { RefreshCw, ArrowRight } from "lucide-react";

export default function PublicError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-[var(--color-beige)] py-32">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, var(--color-accent) 0, transparent 50%), radial-gradient(circle at 80% 70%, var(--color-accent-light) 0, transparent 50%)",
        }}
      />
      <div className="container-luxe relative z-10 flex flex-col items-center text-center text-[var(--color-charcoal)]">
        <div className="eyebrow">
          Une contrariété technique
        </div>
        <h1 className="mt-8 font-serif text-5xl leading-[1.05] md:text-6xl">
          Quelque chose<br />
          <span className="italic text-[var(--color-accent)]">a échoué</span>.
        </h1>
        <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-[var(--color-stone)]">
          Un incident passager nous a empêchés d&apos;afficher cette page. Vous
          pouvez réessayer — si cela persiste, écrivez-nous, nous corrigeons vite.
        </p>
        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
          <button
            onClick={reset}
            className="btn-primary"
          >
            <RefreshCw size={14} />
            Réessayer
          </button>
          <Link
            href="/"
            className="btn-outline"
          >
            Retour à l&apos;accueil
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
