import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Espace équipe — Marrakech Realty",
  description: "Connexion sécurisée à l'espace équipe Marrakech Realty.",
  robots: { index: false, follow: false },
};

const ERROR_MESSAGES: Record<string, string> = {
  invalid_link:
    "Ce lien a expiré ou a déjà été utilisé. Demandez-en un nouveau ci-dessous.",
  access_denied:
    "Cette adresse ne dispose pas d'un accès actif à l'espace équipe.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next = "/admin", error } = await searchParams;
  const errorMessage = error ? ERROR_MESSAGES[error] : null;

  return (
    <main className="min-h-screen bg-[var(--color-cream)] lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(520px,0.95fr)]">
      <section className="relative hidden min-h-screen overflow-hidden bg-[var(--color-charcoal-deep)] lg:block">
        <Image
          src="/hero-home.jpg"
          alt="Riad à Marrakech"
          fill
          priority
          sizes="55vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,20,15,0.2)_0%,rgba(23,20,15,0.42)_48%,rgba(23,20,15,0.92)_100%)]" />

        <div className="absolute inset-x-0 bottom-0 p-12 xl:p-16">
          <div className="eyebrow-light">Espace privé</div>
          <h1 className="mt-5 max-w-xl font-serif text-5xl leading-[1.03] text-white xl:text-6xl">
            Votre portefeuille,<br />
            <em className="font-normal text-[var(--color-accent-light)]">
              au même endroit.
            </em>
          </h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-white/65">
            Leads, biens, visites et mandats — un espace réservé à l&apos;équipe
            Marrakech Realty.
          </p>
        </div>
      </section>

      <section className="flex min-h-screen flex-col bg-white">
        <header className="flex h-20 items-center justify-between border-b border-[var(--color-beige-warm)] px-6 sm:px-10">
          <Image
            src="/logo-complete.png"
            alt="Marrakech Realty"
            width={190}
            height={40}
            className="h-auto w-[170px] sm:w-[190px]"
            priority
          />
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-stone)] transition-colors hover:text-[var(--color-charcoal)]"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            <span className="hidden sm:inline">Retour au site</span>
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-[460px]">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent-deep)]">
              <LockKeyhole size={18} strokeWidth={1.8} aria-hidden="true" />
            </div>

            <div className="eyebrow mt-8">Accès équipe</div>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-[var(--color-charcoal)] sm:text-[2.75rem]">
              Heureux de vous revoir.
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-7 text-[var(--color-stone)]">
              Saisissez votre adresse professionnelle. Vous recevrez un lien
              personnel pour accéder à votre espace, sans mot de passe.
            </p>

            {errorMessage && (
              <div
                role="alert"
                className="mt-7 rounded-[12px] border border-[var(--color-alert)]/20 bg-[var(--color-alert-soft)] px-4 py-3 text-sm leading-6 text-[var(--color-charcoal)]"
              >
                {errorMessage}
              </div>
            )}

            <LoginForm next={next} />

            <div className="mt-9 flex items-start gap-3 border-t border-[var(--color-beige-warm)] pt-6 text-xs leading-5 text-[var(--color-stone)]">
              <ShieldCheck
                size={16}
                className="mt-0.5 shrink-0 text-[var(--color-success)]"
                aria-hidden="true"
              />
              <p>
                Accès strictement réservé aux membres actifs de l&apos;équipe.
                Chaque lien est personnel et ne doit pas être transféré.
              </p>
            </div>
          </div>
        </div>

        <footer className="px-6 pb-7 text-center text-[10px] uppercase tracking-[0.16em] text-[var(--color-stone-soft)] sm:px-10">
          Marrakech Realty · Administration sécurisée
        </footer>
      </section>
    </main>
  );
}
