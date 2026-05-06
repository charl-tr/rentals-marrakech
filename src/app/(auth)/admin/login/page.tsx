import type { Metadata } from "next";
import Image from "next/image";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Connexion admin — Marrakech Realty",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next = "/admin", error } = await searchParams;

  return (
    <div className="min-h-screen bg-[var(--color-cream)] flex flex-col">
      <header className="border-b border-[var(--color-beige-warm)] bg-white">
        <div className="flex h-16 items-center gap-3 px-6">
          <Image
            src="/logo-original.png"
            alt="Marrakech Realty"
            width={40}
            height={40}
            className="h-7 w-7 object-contain"
            priority
          />
          <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--color-terracotta)]">
            Admin
          </span>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md border border-[var(--color-beige-warm)] bg-white p-10 shadow-[var(--shadow-card)]">
          <div className="eyebrow">Accès restreint</div>
          <h1 className="mt-4 font-serif text-3xl text-[var(--color-charcoal)]">
            Connexion.
          </h1>
          <p className="mt-3 text-sm text-[var(--color-stone)]">
            Entrez votre adresse email. Un lien de connexion unique vous sera
            envoyé — pas de mot de passe à retenir.
          </p>

          {error === "invalid_link" && (
            <div className="mt-6 border-l-2 border-[var(--color-terracotta)] bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-charcoal)]">
              Ce lien a expiré ou a déjà été utilisé. Demandez-en un nouveau.
            </div>
          )}

          <LoginForm next={next} />

          <p className="mt-8 border-t border-[var(--color-beige-warm)] pt-6 text-[11px] leading-relaxed text-[var(--color-stone)]">
            Seuls les emails enregistrés dans l&apos;équipe peuvent recevoir un
            lien de connexion. Si vous devez être ajouté, contactez votre
            directeur.
          </p>
        </div>
      </main>
    </div>
  );
}
