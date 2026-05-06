import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  FileSignature,
  Gavel,
  HandCoins,
  HeartHandshake,
  Home,
  Landmark,
  ScrollText,
  ShieldCheck,
} from "lucide-react";
import SectionHero from "@/components/SectionHero";

export const metadata: Metadata = {
  title: "Savoir acheter au Maroc — Guide juridique · Marrakech Realty",
  description:
    "Melkia, titre foncier, rôle du notaire, fiscalité, bail, frais d'agence, retraités, SCI marocaine — l'essentiel à connaître avant d'acheter.",
  alternates: { canonical: "/savoir-acheter" },
};

const CHAPTERS = [
  {
    id: "melkia",
    icon: ScrollText,
    title: "Melkia",
    summary:
      "Acte adoulaire (notarié sous régime musulman) attestant la propriété d'un bien non immatriculé. Validité, conversion en titre foncier, précautions.",
    content: [
      "La Melkia est un acte de propriété établi par les adouls (notaires de droit musulman) et homologué par le juge du tribunal compétent. Elle atteste la propriété d'un bien non encore immatriculé au registre foncier.",
      "Avant d'acquérir un bien sous Melkia, nous procédons systématiquement à : (1) une enquête de propriété pour remonter la chaîne de transmission, (2) une vérification de l'absence de revendications par les héritiers ou tiers, (3) une procédure d'immatriculation foncière (réquisition) pour transformer la Melkia en titre foncier sécurisé.",
      "Notre cabinet partenaire à Marrakech instruit chaque dossier en moyenne en 90 à 120 jours.",
    ],
  },
  {
    id: "titre-foncier",
    icon: Landmark,
    title: "Réquisition et titre foncier",
    summary:
      "Le titre foncier (TF) est le régime le plus sécurisé. Comment l'obtenir, ce qu'il garantit, ce qu'il coûte.",
    content: [
      "Le titre foncier marocain est inscrit à la Conservation foncière et constitue la preuve incontestable et inattaquable de la propriété. Tous les biens que nous proposons sous régime « titré » bénéficient de cette garantie.",
      "Pour les biens encore sous Melkia ou sans titre, la procédure de réquisition d'immatriculation est ouverte sur demande du propriétaire. Délais : 12 à 24 mois selon la zone et l'historique du bien.",
      "Coût indicatif : 0,75 % à 1,5 % de la valeur du bien (frais de Conservation foncière + géomètre).",
    ],
  },
  {
    id: "notaire",
    icon: FileSignature,
    title: "Rôle du notaire",
    summary:
      "Le notaire marocain rédige l'acte authentique, garantit le transfert de propriété et collecte les droits. Notre cabinet partenaire.",
    content: [
      "Toute transaction immobilière au Maroc passe obligatoirement par un notaire (ou un avocat agréé), qui rédige l'acte authentique de vente, vérifie la conformité juridique du bien, collecte les droits d'enregistrement (4 % du prix de vente) et procède à l'inscription du nouveau propriétaire à la Conservation foncière.",
      "Notre cabinet partenaire — Étude Maître El Amine, Marrakech — instruit la totalité des dossiers de l'agence depuis 2008. Frais de notaire : 1 % HT du prix de vente, plafonnés selon les barèmes en vigueur.",
    ],
  },
  {
    id: "fiscalite",
    icon: HandCoins,
    title: "Juridique et fiscalité",
    summary:
      "Régime fiscal des résidents et non-résidents, plus-value, IS et IR sur revenus locatifs, conventions fiscales internationales.",
    content: [
      "Pour les non-résidents : la fiscalité de la plus-value à la revente est de 20 % du bénéfice net (avec abattements selon durée de détention : exonération totale après 6 ans pour la résidence principale).",
      "Revenus locatifs : imposés à l'impôt sur le revenu (IR) marocain selon barème progressif, avec abattement forfaitaire de 40 %. Conventions fiscales France-Maroc et Belgique-Maroc évitent la double imposition.",
      "Possibilité de structurer l'acquisition via une SCI marocaine (voir chapitre dédié) ou via une holding luxembourgeoise selon le projet.",
    ],
  },
  {
    id: "bail",
    icon: Home,
    title: "Contrat de bail",
    summary:
      "Bail meublé / non meublé, durée, dépôt de garantie, encadrement des loyers, clauses spécifiques au Maroc.",
    content: [
      "Le bail d'habitation au Maroc est encadré par la loi 67-12. Durée minimale : 1 an pour les baux non meublés, libre pour les meublés. Dépôt de garantie usuel : 2 mois de loyer.",
      "Nos baux sont rédigés par notre cabinet juridique, intègrent les clauses de revalorisation indexées (INSEE marocain), et prévoient les modalités d'état des lieux, d'entretien et de sortie.",
      "Pour les locations saisonnières (riads privatisés notamment), un contrat spécifique est établi avec inventaire détaillé et conditions d'annulation.",
    ],
  },
  {
    id: "frais",
    icon: ShieldCheck,
    title: "Frais d'agence",
    summary:
      "Honoraires Marrakech Realty, à la charge de l'acquéreur ou du vendeur, modalités de paiement.",
    content: [
      "Honoraires d'agence en transaction : 3 % HT du prix de vente, à la charge de l'acquéreur (TVA 20 % en sus). Réglés à la signature de l'acte authentique chez le notaire.",
      "Honoraires de gestion locative : 8 % HT des loyers encaissés (longue durée) ou 18 % (saisonnière). Inclus : recherche de locataires, état des lieux, encaissement des loyers, suivi des charges, reporting trimestriel.",
      "Estimation gratuite et sans engagement.",
    ],
  },
  {
    id: "retraites",
    icon: HeartHandshake,
    title: "Avantages retraités",
    summary:
      "Statut de retraité étranger au Maroc : abattement fiscal, carte de séjour, cadre douanier favorable.",
    content: [
      "Le statut de « retraité étranger » au Maroc ouvre droit à un abattement de 80 % sur l'impôt sur les pensions de retraite étrangères transférées en dirhams non convertibles. Conditions : transférer 75 % minimum de la pension via un compte en dirhams convertibles ouvert au Maroc.",
      "Carte de résidence valable 1 an (renouvelable, puis 10 ans après 4 ans de présence régulière). Aucune condition de revenu minimum imposée.",
      "Importation de mobilier et effets personnels en franchise de droits de douane à l'installation.",
    ],
  },
  {
    id: "sci-marocaine",
    icon: Gavel,
    title: "SCI marocaine",
    summary:
      "Société Civile Immobilière de droit marocain — quand l'utiliser, comment la constituer, fiscalité.",
    content: [
      "La SCI marocaine permet de structurer une acquisition à plusieurs (famille, indivision, investisseurs), de faciliter la transmission successorale et d'optimiser la fiscalité dans certains cas.",
      "Constitution : capital minimum libre, apport en numéraire ou en nature (le bien lui-même), statuts notariés, immatriculation au registre du commerce. Délai : 3 à 4 semaines.",
      "Régime fiscal : transparence fiscale par défaut (les associés sont imposés directement) ou option pour l'IS marocain (taux 31 %). Notre cabinet partenaire vous oriente selon votre profil.",
    ],
  },
] as const;

export default function SavoirAcheterPage() {
  return (
    <>
      <SectionHero
        eyebrow="Guide juridique"
        title={
          <>
            Acheter au Maroc,<br />
            <span className="italic text-[var(--color-terracotta-light)]">en connaissance</span> de cause.
          </>
        }
        subtitle="Huit chapitres pour comprendre ce qui se cache derrière une transaction marocaine. Rédigés en collaboration avec notre cabinet partenaire (Étude Maître El Amine, Marrakech)."
      />

      <section className="bg-white py-20">
        <div className="container-luxe">
          {/* Sommaire */}
          <div className="mb-20 grid gap-px bg-[var(--color-beige-warm)] md:grid-cols-2 lg:grid-cols-4">
            {CHAPTERS.map((c) => (
              <a
                key={c.id}
                href={`#${c.id}`}
                className="group flex items-start gap-4 bg-[var(--color-cream)] p-6 transition-colors hover:bg-[var(--color-beige)]"
              >
                <c.icon
                  size={20}
                  className="mt-0.5 flex-shrink-0 text-[var(--color-terracotta)]"
                />
                <div>
                  <div className="font-serif text-[15px] text-[var(--color-charcoal)] group-hover:text-[var(--color-terracotta)]">
                    {c.title}
                  </div>
                  <div className="mt-1 text-[11px] text-[var(--color-stone)]">
                    {c.summary.split(".")[0]}.
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Chapitres */}
          <div className="mx-auto max-w-3xl space-y-24">
            {CHAPTERS.map((c, idx) => (
              <article key={c.id} id={c.id} className="scroll-mt-24">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center border border-[var(--color-terracotta)] text-[var(--color-terracotta)]">
                    <c.icon size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--color-terracotta)]">
                      Chapitre {String(idx + 1).padStart(2, "0")}
                    </div>
                    <h2 className="mt-1 font-serif text-3xl text-[var(--color-charcoal)] md:text-4xl">
                      {c.title}
                    </h2>
                  </div>
                </div>
                <div className="mt-6 space-y-5 leading-relaxed text-[var(--color-ink)]">
                  {c.content.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-charcoal)] py-20 text-white">
        <div className="container-luxe text-center">
          <div className="text-[11px] font-medium uppercase tracking-[0.32em] text-[var(--color-terracotta-light)]">
            Une question juridique ?
          </div>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl">
            Notre cabinet partenaire vous répond.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-white/80">
            Étude Maître El Amine — Marrakech. Premier rendez-vous offert pour les
            clients de l&apos;agence.
          </p>
          <Link href="/contact" className="btn-gold mt-10 inline-flex">
            Demander un rendez-vous
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </>
  );
}
