import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getAdvisorIdentity } from "@/lib/auth";
import { getSafeAdminPath } from "@/lib/auth-urls";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import MfaForm from "./MfaForm";

export const metadata: Metadata = {
  title: "Vérification sécurisée — Marrakech Realty",
  description: "Double authentification de l'espace équipe Marrakech Realty.",
  robots: { index: false, follow: false },
};

export default async function MfaPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const safeNext = getSafeAdminPath(next);
  const identity = await getAdvisorIdentity();

  if (!identity) redirect("/admin/signout");

  const supabase = await createSupabaseServerClient();
  const { data: assurance } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (assurance?.currentLevel === "aal2") redirect(safeNext);

  return (
    <main className="min-h-screen bg-[var(--color-cream)] lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(520px,0.82fr)]">
      <section className="relative hidden min-h-screen overflow-hidden bg-[var(--color-charcoal-deep)] lg:block">
        <Image
          src="/hero-home.jpg"
          alt="Riad à Marrakech"
          fill
          priority
          sizes="55vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,20,15,0.2)_0%,rgba(23,20,15,0.48)_52%,rgba(23,20,15,0.94)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 p-12 xl:p-16">
          <div className="eyebrow-light">Protection renforcée</div>
          <h1 className="mt-5 max-w-xl font-serif text-5xl leading-[1.03] text-white xl:text-6xl">
            Vos données clients,<br />
            <em className="font-normal text-[var(--color-accent-light)]">
              doublement protégées.
            </em>
          </h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-white/65">
            Une vérification supplémentaire protège le portefeuille et les
            informations confidentielles de l&apos;agence.
          </p>
        </div>
      </section>

      <section className="flex min-h-screen flex-col bg-white">
        <header className="flex h-20 items-center border-b border-[var(--color-beige-warm)] px-6 sm:px-10">
          <Image
            src="/logo-complete.png"
            alt="Marrakech Realty"
            width={190}
            height={40}
            className="h-auto w-[170px] sm:w-[190px]"
            priority
          />
        </header>

        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-[470px]">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-success-soft)] text-[var(--color-success)]">
              <ShieldCheck size={19} strokeWidth={1.8} aria-hidden="true" />
            </div>
            <div className="eyebrow mt-7">Double authentification</div>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-[var(--color-charcoal)] sm:text-[2.65rem]">
              Confirmez que c&apos;est bien vous.
            </h2>
            <p className="mt-4 text-[15px] leading-7 text-[var(--color-stone)]">
              Connecté en tant que{" "}
              <span className="font-medium text-[var(--color-charcoal)]">
                {identity.advisorName}
              </span>
              .
            </p>

            <MfaForm next={safeNext} />
          </div>
        </div>

        <footer className="px-6 pb-7 text-center text-[10px] uppercase tracking-[0.16em] text-[var(--color-stone-soft)] sm:px-10">
          Marrakech Realty · Session chiffrée et sécurisée
        </footer>
      </section>
    </main>
  );
}
