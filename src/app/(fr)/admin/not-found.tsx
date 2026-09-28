import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 bg-[var(--color-cream)] px-6 py-20 text-center">
      <div className="text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--color-accent)]">
        Erreur 404
      </div>
      <h1 className="font-serif text-3xl text-[var(--color-charcoal)]">
        Cette ressource est introuvable.
      </h1>
      <p className="max-w-md text-sm text-[var(--color-stone)]">
        Le lead, le bien ou le conseiller demandé n&apos;existe pas ou a été
        retiré. Il a peut-être changé de référence.
      </p>
      <Link
        href="/admin"
        className="inline-flex items-center rounded-[10px] bg-[var(--color-charcoal)] px-6 py-3 text-[11px] font-medium uppercase tracking-[0.18em] text-white transition-colors hover:bg-[var(--color-accent)]"
      >
        Retour au tableau de bord
      </Link>
    </div>
  );
}
