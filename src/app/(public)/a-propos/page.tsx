import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Award, Building2, ShieldCheck } from "lucide-react";
import SectionHero from "@/components/SectionHero";

export const metadata: Metadata = {
  title: "À propos — Marrakech Realty",
  description:
    "Fondée en 2000 par Antoine Gandin. Vingt-cinq ans à composer les plus belles transactions immobilières à Marrakech et Essaouira.",
  alternates: { canonical: "/a-propos" },
};

const STATS = [
  { value: "25", label: "Années d'expertise" },
  { value: "600+", label: "Transactions sécurisées" },
  { value: "4", label: "Conseillers seniors" },
  { value: "92%", label: "Clients recommandent" },
];

const VALEURS = [
  {
    icon: ShieldCheck,
    title: "Sécurité juridique absolue",
    description:
      "Chaque bien que nous proposons est vérifié par notre cabinet partenaire (Étude Maître El Amine) : titre foncier, absence d'hypothèque, conformité urbanistique. Aucune transaction ne démarre sans feu vert juridique.",
  },
  {
    icon: Award,
    title: "Sélection plutôt que volume",
    description:
      "Nous traitons volontairement 20 à 30 transactions par an. Chaque bien est visité, chaque client est connu. C'est ce qui nous permet un accompagnement que les grandes agences ne peuvent plus offrir.",
  },
  {
    icon: Building2,
    title: "Restauration dans les règles",
    description:
      "Pour les riads, nous travaillons exclusivement avec les maâlems de Marrakech et Fès — zellige peint à la main, tadelakt poli à la pierre d'agate, plâtre sculpté. Pas de faux-semblant.",
  },
];

export default function AProposPage() {
  return (
    <>
      <SectionHero
        eyebrow="Notre histoire"
        title={
          <>
            Depuis 2000, un seul{" "}
            <span className="italic text-[var(--color-accent-light)]">
              cap
            </span>
            .
          </>
        }
        subtitle="Fondée par Antoine Gandin au lendemain du nouveau millénaire, Marrakech Realty est née d'une conviction simple : l'immobilier de caractère mérite un accompagnement à la hauteur."
        backHref="/"
      />

      {/* Story éditoriale */}
      <section className="bg-white py-24">
        <div className="container-luxe">
          <div className="mx-auto grid max-w-5xl gap-16 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <div className="eyebrow">Une maison de famille</div>
              <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
                Marrakech n&apos;était pas encore Marrakech.
              </h2>
              <div className="my-8 h-px w-16 bg-[var(--color-terracotta)]" />
              <div className="space-y-6 text-lg leading-relaxed text-[var(--color-ink)]">
                <p>
                  En 2000, Antoine Gandin revient d&apos;Asie du Sud-Est où il
                  aurait pu rester. Marrakech n&apos;est pas encore la destination
                  luxueuse qu&apos;elle deviendra ; on peut encore acheter un riad en
                  ruine dans la médina pour le prix d&apos;un studio parisien.
                </p>
                <p>
                  Antoine flaire le mouvement. Il ouvre une petite boutique au
                  Guéliz — deux bureaux, un téléphone, une passion pour les
                  maâlems. Les premières années, il vend trois ou quatre biens ;
                  il les choisit bien, il les suit à la restauration, il garde ses
                  clients en amis.
                </p>
                <p>
                  En 2008, le premier grand cycle immobilier marrakchi démarre.
                  L&apos;agence grandit mais refuse de suivre la mode des gros
                  volumes. Marrakech Realty reste une maison de famille : une
                  vingtaine de biens en portefeuille à tout moment, chacun visité
                  personnellement par l&apos;un de nos conseillers.
                </p>
                <p>
                  Aujourd&apos;hui, vingt-cinq ans plus tard, la même philosophie.
                  Quatre conseillers seniors, un cabinet juridique partenaire, un
                  réseau de maâlems et de photographes, et une seule ambition :
                  faire de chaque transaction un moment dont on se souvient.
                </p>
              </div>
            </div>

            <aside className="self-start rounded-[14px] border border-[var(--color-beige-warm)] bg-[var(--color-cream)] p-8">
              <div className="eyebrow">En chiffres</div>
              <div className="mt-6 space-y-6">
                {STATS.map((s) => (
                  <div
                    key={s.label}
                    className="border-b border-[var(--color-beige-warm)] pb-5 last:border-b-0 last:pb-0"
                  >
                    <div className="font-serif text-4xl text-[var(--color-terracotta)]">
                      {s.value}
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-[var(--color-stone)]">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="bg-[var(--color-beige)] py-24">
        <div className="container-luxe">
          <div className="mx-auto max-w-2xl text-center">
            <div className="eyebrow">Nos valeurs</div>
            <h2 className="mt-4 font-serif text-4xl md:text-5xl">
              Trois principes, tenus depuis vingt-cinq ans.
            </h2>
            <div className="gold-rule" />
          </div>

          <div className="mt-16 grid gap-px bg-[var(--color-beige-warm)] md:grid-cols-3">
            {VALEURS.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-[14px] bg-[var(--color-cream)] p-10">
                <div className="flex h-12 w-12 items-center justify-center border border-[var(--color-terracotta)] text-[var(--color-terracotta)]">
                  <Icon size={20} />
                </div>
                <h3 className="mt-6 font-serif text-xl text-[var(--color-charcoal)]">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-stone)]">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[var(--color-charcoal)] py-20 text-white">
        <div className="container-luxe text-center">
          <div className="eyebrow-light">
            Commencer une conversation
          </div>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl">
            Dites-nous ce que vous cherchez.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-white/80">
            Une première discussion informelle suffit à caler les bases. Nos
            conseillers vous recontactent sous 24 heures ouvrées.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/equipe" className="btn-outline-light inline-flex">
              Rencontrer l&apos;équipe
            </Link>
            <Link href="/contact" className="btn-gold inline-flex">
              Nous écrire
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
