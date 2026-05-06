import Link from "next/link";
import type { Metadata } from "next";
import SectionHero from "@/components/SectionHero";

export const metadata: Metadata = {
  title: "Cookies — Marrakech Realty",
  description: "Les données techniques posées par notre site sur votre navigateur.",
  alternates: { canonical: "/cookies" },
};

/**
 * NOTE ÉDITORIALE : la liste ci-dessous reflète strictement les cookies et
 * stockages locaux réellement posés par la version actuelle de l'application
 * (useFavorites + CookieBanner). À mettre à jour à chaque ajout de nouveau
 * service tiers (analytics, tag manager, outil de chat, etc.).
 */
export default function CookiesPage() {
  return (
    <>
      <SectionHero
        eyebrow="Technologies de suivi"
        title="Cookies."
        subtitle="Minimalisme assumé. Aucun cookie publicitaire tiers. Voici l'inventaire exact de ce que notre site pose sur votre navigateur."
        backHref="/"
      />

      <section className="bg-white py-20">
        <div className="container-luxe">
          <div className="mx-auto max-w-3xl space-y-12 leading-relaxed text-[var(--color-ink)]">
            <div>
              <h2 className="font-serif text-3xl text-[var(--color-charcoal)]">
                Qu&apos;est-ce qu&apos;un cookie ?
              </h2>
              <p className="mt-4">
                Un cookie est un petit fichier texte déposé sur votre appareil
                lorsque vous visitez un site. Le stockage local
                (<code>localStorage</code>) fonctionne sur un principe similaire,
                avec l&apos;avantage de ne jamais être transmis à nos serveurs.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-3xl text-[var(--color-charcoal)]">
                Ce que nous utilisons
              </h2>
              <div className="mt-6 overflow-x-auto">
                <table className="w-full border border-[var(--color-beige-warm)] text-left text-sm">
                  <thead className="bg-[var(--color-cream)]">
                    <tr className="border-b border-[var(--color-beige-warm)]">
                      <th className="px-4 py-3 font-medium">Nom</th>
                      <th className="px-4 py-3 font-medium">Rôle</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-beige-warm)]">
                    <tr>
                      <td className="px-4 py-3 font-mono text-xs">mr:favorites</td>
                      <td className="px-4 py-3 text-[var(--color-stone)]">
                        Mémoriser les biens que vous marquez d&apos;un cœur
                      </td>
                      <td className="px-4 py-3">localStorage</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-xs">mr:consent</td>
                      <td className="px-4 py-3 text-[var(--color-stone)]">
                        Retenir votre choix sur la bannière cookies
                      </td>
                      <td className="px-4 py-3">localStorage</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-6 text-sm text-[var(--color-stone)]">
                <strong>Aucun cookie publicitaire tiers</strong> n&apos;est
                actuellement installé. Si nous ajoutons à l&apos;avenir un
                outil de mesure d&apos;audience (Plausible, Vercel Analytics),
                il sera documenté ici et soumis à votre consentement explicite
                via la bannière.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-3xl text-[var(--color-charcoal)]">
                Désactiver
              </h2>
              <p className="mt-4">
                Vous pouvez à tout moment effacer les données stockées
                localement via les préférences de votre navigateur (Préférences
                → Confidentialité → Effacer les données du site).
              </p>
              <p className="mt-4">
                Le refus des cookies essentiels peut empêcher certaines
                fonctionnalités non critiques (favoris, notamment).
              </p>
            </div>

            <div className="border-t border-[var(--color-beige-warm)] pt-10">
              <p className="text-sm text-[var(--color-stone)]">
                Questions sur vos données ?{" "}
                <Link
                  href="/politique-confidentialite"
                  className="text-[var(--color-terracotta)] hover:underline"
                >
                  Voir notre politique de confidentialité
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
