import type { Metadata } from "next";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import SecurityPanel from "./SecurityPanel";

export const metadata: Metadata = {
  title: "Sécurité du compte — Marrakech Realty",
  robots: { index: false, follow: false },
};

export default function SecurityPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-8 md:px-8 md:py-12">
      <div className="eyebrow">Compte</div>
      <h1 className="mt-3 font-serif text-4xl text-[var(--color-charcoal)] md:text-5xl">
        Sécurité.
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-stone)]">
        Gérez le second facteur qui protège l&apos;accès aux données clients et
        aux outils internes.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
        <SecurityPanel />

        <aside className="rounded-[16px] border border-[var(--color-beige-warm)] bg-white p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-success-soft)] text-[var(--color-success)]">
            <ShieldCheck size={18} aria-hidden="true" />
          </div>
          <h2 className="mt-5 font-serif text-2xl text-[var(--color-charcoal)]">
            Bonnes pratiques
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--color-stone)]">
            <li>Activez la sauvegarde chiffrée de votre application TOTP.</li>
            <li>Ne transmettez jamais un code, même à un membre de l&apos;équipe.</li>
            <li>Déconnectez-vous immédiatement sur un appareil perdu.</li>
          </ul>
          <div className="mt-6 flex gap-3 rounded-[12px] bg-[var(--color-cream)] p-4 text-xs leading-5 text-[var(--color-stone)]">
            <LockKeyhole size={16} className="mt-0.5 shrink-0 text-[var(--color-terracotta)]" />
            En cas de perte totale de votre authentificateur, contactez le
            directeur pour révoquer le facteur depuis Supabase Auth.
          </div>
        </aside>
      </div>
    </div>
  );
}
