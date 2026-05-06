import Link from "next/link";
import type { Metadata } from "next";
import SectionHero from "@/components/SectionHero";

export const metadata: Metadata = {
  title: "Conditions d'utilisation — Marrakech Realty",
  description:
    "Les règles simples d'utilisation du site marrakechrealty.com et de ses services associés.",
  alternates: { canonical: "/cgu" },
};

/**
 * NOTE ÉDITORIALE : marrakechrealty.com n'a pas de CGU publiées aujourd'hui.
 * Cette page reprend les éléments présents dans leurs mentions légales réelles
 * (droit de reproduction, statut du site, contact) et ajoute des stipulations
 * minimales. Un document contractuel complet devra être rédigé par un juriste
 * avant mise en production si des services transactionnels (paiement en ligne,
 * création de compte) sont ajoutés.
 */
export default function CGUPage() {
  return (
    <>
      <SectionHero
        eyebrow="Cadre d'utilisation"
        title="Conditions d'utilisation."
        subtitle="Les règles simples de fonctionnement du site, rédigées pour être lues."
        backHref="/"
      />

      <section className="bg-white py-20">
        <div className="container-luxe">
          <div className="mx-auto max-w-3xl space-y-12 leading-relaxed text-[var(--color-ink)]">
            <div>
              <h2 className="font-serif text-3xl text-[var(--color-charcoal)]">
                Objet du site
              </h2>
              <p className="mt-4">
                Le site marrakechrealty.com présente le portefeuille de biens
                immobiliers de notre agence (vente, location longue durée,
                location saisonnière, programmes neufs) ainsi qu&apos;un guide
                éditorial et juridique. Les informations publiées sont fournies
                à titre indicatif et n&apos;ont pas valeur d&apos;offre ferme
                au sens juridique. Toute transaction fait l&apos;objet
                d&apos;un mandat signé préalable et d&apos;un acte authentique
                chez notaire.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-3xl text-[var(--color-charcoal)]">
                Propriété intellectuelle
              </h2>
              <p className="mt-4">
                L&apos;ensemble de ce site relève des législations française et
                internationale sur le droit d&apos;auteur et la propriété
                intellectuelle. Tous les droits de reproduction sont réservés
                pour les documents textes, iconographiques, photographiques et
                vidéos.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-3xl text-[var(--color-charcoal)]">
                Responsabilité
              </h2>
              <p className="mt-4">
                Marrakech Realty s&apos;efforce d&apos;assurer
                l&apos;exactitude des informations publiées. Les
                caractéristiques des biens (surface, prix, équipements) sont
                communiquées à titre indicatif et doivent être confirmées lors
                de la visite puis de l&apos;acte authentique.
              </p>
              <p className="mt-4">
                Nous ne pouvons être tenus responsables d&apos;une
                indisponibilité temporaire du site (maintenance, incident
                technique), ni des contenus de sites tiers accessibles via des
                liens hypertextes.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-3xl text-[var(--color-charcoal)]">
                Droit applicable
              </h2>
              <p className="mt-4">
                Les présentes conditions sont soumises au droit marocain. En
                cas de litige, et après tentative de résolution amiable, les
                tribunaux de Marrakech sont seuls compétents.
              </p>
            </div>

            <div className="border-t border-[var(--color-beige-warm)] pt-10">
              <p className="text-sm text-[var(--color-stone)]">
                Consultez également nos{" "}
                <Link
                  href="/mentions-legales"
                  className="text-[var(--color-terracotta)] hover:underline"
                >
                  mentions légales
                </Link>{" "}
                et notre{" "}
                <Link
                  href="/politique-confidentialite"
                  className="text-[var(--color-terracotta)] hover:underline"
                >
                  politique de confidentialité
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
