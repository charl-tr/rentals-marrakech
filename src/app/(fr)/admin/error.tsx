"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 bg-[var(--color-cream)] px-6 py-20 text-center">
      <div className="text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--color-accent)]">
        Erreur
      </div>
      <h1 className="font-serif text-3xl text-[var(--color-charcoal)]">
        Cette section n&apos;a pas pu se charger.
      </h1>
      <p className="max-w-md text-sm text-[var(--color-stone)]">
        Réessayez. Si le problème persiste, l&apos;accès aux données est
        peut-être momentanément interrompu — vérifiez la connexion Supabase.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-[10px] bg-[var(--color-charcoal)] px-6 py-3 text-[11px] font-medium uppercase tracking-[0.18em] text-white transition-colors hover:bg-[var(--color-accent)]"
        >
          <RefreshCw size={13} />
          Réessayer
        </button>
        <Link
          href="/admin"
          className="inline-flex items-center rounded-[10px] border border-[var(--color-charcoal)] px-6 py-3 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-charcoal)] transition-colors hover:bg-[var(--color-charcoal)] hover:text-white"
        >
          Tableau de bord
        </Link>
      </div>
    </div>
  );
}
