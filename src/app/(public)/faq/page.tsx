import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ChevronDown } from "lucide-react";
import SectionHero from "@/components/SectionHero";

export const metadata: Metadata = {
  title: "Questions fréquentes — Marrakech Realty",
  description:
    "Tout ce que les acquéreurs, vendeurs et locataires nous demandent avant de signer. Les réponses honnêtes de notre équipe.",
  alternates: { canonical: "/faq" },
};

const CATEGORIES = [
  {
    label: "Acheter au Maroc",
    faqs: [
      {
        q: "Un étranger peut-il acheter un bien au Maroc ?",
        a: "Oui, sans restriction pour les biens urbains titrés. Les terrains agricoles ou les biens en zone rurale peuvent nécessiter une Vocation Non Agricole (VNA). Notre cabinet partenaire vérifie systématiquement ce point avant signature.",
      },
      {
        q: "Quels sont les frais d'achat au total ?",
        a: "Comptez approximativement 8 à 10% du prix de vente : 4% de droits d'enregistrement, 1% de notaire, 3% HT d'agence (TVA 20% en sus), et environ 0,75-1% de Conservation foncière. Notre simulateur détaillé est disponible sur demande.",
      },
      {
        q: "Quelle est la différence entre Melkia, VNA et Titre Foncier ?",
        a: "Le Titre Foncier (TF) est le régime le plus sécurisé — propriété inscrite à la Conservation foncière, inattaquable. La Melkia est un acte adoulaire attestant la propriété sur un bien non titré — possible mais nécessite une enquête préalable. La VNA (Vocation Non Agricole) est l'autorisation nécessaire pour un étranger d'acquérir un terrain à l'origine agricole.",
      },
      {
        q: "Combien de temps prend une transaction ?",
        a: "De la signature du compromis à l'acte authentique, comptez 45 à 90 jours pour un bien titré. Les biens sous Melkia peuvent nécessiter 120 à 180 jours le temps de la procédure d'immatriculation.",
      },
    ],
  },
  {
    label: "Vendre son bien",
    faqs: [
      {
        q: "Combien coûte l'estimation ?",
        a: "L'estimation est gratuite et sans engagement. Un conseiller visite le bien et vous remet sous 24 heures une estimation argumentée appuyée sur les transactions comparables des 18 derniers mois.",
      },
      {
        q: "Quel type de mandat me recommandez-vous ?",
        a: "Le mandat exclusif (3-6 mois) donne les meilleurs résultats : nous engageons nos moyens photo professionnels, diffusion, fichier qualifié. En moyenne, nos biens en exclusivité se vendent 28 jours plus vite et 4% plus cher qu'en simple.",
      },
      {
        q: "Quelle commission prenez-vous ?",
        a: "3% HT du prix de vente (TVA 20% en sus), payés par l'acquéreur à la signature chez le notaire. Aucun frais caché.",
      },
      {
        q: "Quelle plus-value si je revends plus tard ?",
        a: "Pour les non-résidents : 20% du bénéfice net. Pour la résidence principale : exonération totale après 6 ans de détention. Notre cabinet partenaire vous éclaire sur votre situation personnelle.",
      },
    ],
  },
  {
    label: "Louer",
    faqs: [
      {
        q: "Quelle durée minimum pour une location longue durée ?",
        a: "Bail de 12 mois minimum, renouvelable tacitement. Dépôt de garantie usuel : 2 mois de loyer. Pour les locations saisonnières (riads privatisés), pas de durée minimum — nous traitons à la semaine.",
      },
      {
        q: "Puis-je louer mon bien via vous ?",
        a: "Oui. Nous gérons location longue durée (honoraires 8% HT des loyers perçus) et location saisonnière (18% HT incluant conciergerie, ménage, linge, accueil). Rendement net estimé : 4-5% longue durée, 6-8% saisonnière selon emplacement.",
      },
      {
        q: "Le locataire meuble-t-il ou le propriétaire ?",
        a: "Pour une location longue durée meublée (la norme premium), le propriétaire fournit le mobilier complet. Pour une location non meublée, le locataire apporte son mobilier. Nos baux précisent clairement l'inventaire en annexe.",
      },
    ],
  },
  {
    label: "Notre agence",
    faqs: [
      {
        q: "Depuis quand existe Marrakech Realty ?",
        a: "L'agence a été fondée en 2000 par Antoine Gandin. Nous sommes spécialisés sur les biens d'exception à Marrakech et Essaouira : riads restaurés, villas d'architecte, programmes neufs en domaine golfique.",
      },
      {
        q: "Combien de transactions par an ?",
        a: "Entre 20 et 30 transactions annuelles, avec un ticket moyen de 600 000 à 1,5 M€. Notre volume reste volontairement limité pour préserver la qualité de l'accompagnement.",
      },
      {
        q: "Parlez-vous anglais ?",
        a: "Oui, toute notre équipe est bilingue français-anglais. Léna Vasconcelos parle également portugais et espagnol, Hamza Bennouna parle arabe fluent.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <>
      <SectionHero
        eyebrow="Questions fréquentes"
        title={
          <>
            Les réponses{" "}
            <span className="italic text-[var(--color-terracotta-light)]">
              honnêtes
            </span>
            .
          </>
        }
        subtitle="Tout ce qu'acquéreurs, vendeurs et locataires nous demandent avant de signer. Pas de jargon, pas de langue de bois."
        backHref="/"
      />

      <section className="bg-white py-20">
        <div className="container-luxe">
          <div className="mx-auto max-w-3xl">
            {CATEGORIES.map((cat) => (
              <div key={cat.label} className="mb-16 last:mb-0">
                <div className="mb-8 flex items-baseline gap-4 border-b border-[var(--color-beige-warm)] pb-4">
                  <div className="text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--color-terracotta)]">
                    {cat.label}
                  </div>
                </div>

                <div className="divide-y divide-[var(--color-beige-warm)]">
                  {cat.faqs.map((faq, i) => (
                    <details key={i} className="group py-6">
                      <summary className="flex cursor-pointer list-none items-start justify-between gap-6">
                        <h3 className="font-serif text-xl text-[var(--color-charcoal)] transition-colors group-open:text-[var(--color-terracotta)] md:text-2xl">
                          {faq.q}
                        </h3>
                        <ChevronDown
                          size={18}
                          className="mt-2 flex-shrink-0 text-[var(--color-stone)] transition-transform duration-200 group-open:rotate-180 group-open:text-[var(--color-terracotta)]"
                        />
                      </summary>
                      <p className="mt-4 leading-relaxed text-[var(--color-ink)]">
                        {faq.a}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-charcoal)] py-16 text-white">
        <div className="container-luxe text-center">
          <div className="text-[11px] font-medium uppercase tracking-[0.32em] text-[var(--color-terracotta-light)]">
            Une question non couverte ?
          </div>
          <h2 className="mt-4 font-serif text-3xl md:text-4xl">
            Nos conseillers répondent dans la journée.
          </h2>
          <Link href="/contact" className="btn-gold mt-10 inline-flex">
            Nous écrire
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </>
  );
}
