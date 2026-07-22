import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Compass } from "lucide-react";

export const metadata: Metadata = {
  title: "Page introuvable — Marrakech Realty",
  description: "La page que vous cherchez n'existe pas ou a été déplacée.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="relative min-h-[85vh] overflow-hidden bg-[var(--color-charcoal)]">
      {/* motif discret */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, var(--color-terracotta) 0, transparent 50%), radial-gradient(circle at 80% 70%, var(--color-terracotta-light) 0, transparent 50%)",
        }}
      />

      <div className="container-luxe relative z-10 flex min-h-[85vh] flex-col items-center justify-center py-32 text-center text-white">
        <div className="eyebrow-light">
          Erreur 404
        </div>

        <h1 className="mt-8 font-serif text-7xl leading-[0.95] md:text-8xl lg:text-[140px]">
          Vous vous êtes<br />
          <span className="italic text-[var(--color-accent-light)]">perdu·e</span>.
        </h1>

        <p className="mx-auto mt-10 max-w-xl text-lg leading-relaxed text-white/75">
          La page que vous cherchez n&apos;existe pas — ou plus. Notre portefeuille évolue
          chaque semaine ; ce bien a peut-être été vendu, retiré ou renommé.
        </p>

        <div className="mt-14 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center gap-2 border border-white/60 bg-transparent px-8 py-4 text-sm font-medium uppercase tracking-[0.18em] text-white transition-colors hover:bg-white hover:text-[var(--color-charcoal)]"
          >
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/acheter"
            className="inline-flex items-center gap-2 bg-[var(--color-terracotta)] px-8 py-4 text-sm font-medium uppercase tracking-[0.18em] text-white transition-colors hover:bg-[var(--color-terracotta-deep)]"
          >
            <Compass size={14} />
            Parcourir les biens
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="mt-20 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs uppercase tracking-[0.22em] text-white/60">
          <Link href="/acheter" className="hover:text-[var(--color-terracotta-light)]">
            Acheter
          </Link>
          <span>·</span>
          <Link href="/louer" className="hover:text-[var(--color-terracotta-light)]">
            Louer
          </Link>
          <span>·</span>
          <Link href="/essaouira" className="hover:text-[var(--color-terracotta-light)]">
            Essaouira
          </Link>
          <span>·</span>
          <Link href="/quartiers" className="hover:text-[var(--color-terracotta-light)]">
            Quartiers
          </Link>
          <span>·</span>
          <Link href="/journal" className="hover:text-[var(--color-terracotta-light)]">
            Journal
          </Link>
          <span>·</span>
          <Link href="/contact" className="hover:text-[var(--color-terracotta-light)]">
            Contact
          </Link>
        </div>
      </div>
    </section>
  );
}
