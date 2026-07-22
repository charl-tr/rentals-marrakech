import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Lock } from "lucide-react";

// ── Groupe PORTAIL — espaces clients token-gated (mon-espace, mon-bien) ──
// Chrome minimal et privé : ni nav marketing, ni dock de comparaison, ni
// bannière cookies — c'est un espace personnel, pas le tunnel de vente.
// Temps réel garanti (force-dynamic) : le client voit toujours l'état à jour.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PortalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      {/* En-tête minimal — logo + repère « espace privé », aucune navigation */}
      <header className="border-b border-[var(--color-border)] bg-white/95 backdrop-blur-md">
        <div className="container-luxe flex h-16 items-center justify-between">
          <Link
            href="/"
            aria-label="Marrakech Realty — Accueil"
            className="flex items-center gap-2.5"
          >
            <Image
              src="/logo-original.png"
              alt="Marrakech Realty"
              width={40}
              height={40}
              priority
              className="h-7 w-7 object-contain"
            />
            <span className="font-serif text-base tracking-[0.06em] text-[var(--color-ink)]">
              Marrakech Realty
            </span>
          </Link>
          <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--color-accent)]">
            <Lock size={11} />
            Espace privé
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* Pied minimal — contact direct, note de confidentialité */}
      <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-alt)]">
        <div className="container-luxe flex flex-col items-center gap-2 py-8 text-center text-[12px] text-[var(--color-stone)] sm:flex-row sm:justify-between sm:text-left">
          <span>Espace confidentiel — vos données ne sont jamais partagées.</span>
          <a
            href="tel:+212660629444"
            className="font-medium text-[var(--color-charcoal)] transition-colors hover:text-[var(--color-accent)]"
          >
            +212 660 62 94 44
          </a>
        </div>
      </footer>
    </div>
  );
}
