import Link from "next/link";
import type { Metadata } from "next";
import {
  CheckCircle2,
  Eye,
  FileSignature,
  Phone,
} from "lucide-react";
import SectionHero from "@/components/SectionHero";
import DepositForm from "@/components/DepositForm";

export const metadata: Metadata = {
  title: "Vendre votre bien — Estimation 24h · Marrakech Realty",
  description:
    "Confiez-nous votre bien. Estimation argumentée sous 24h, mandat sur mesure, acquéreurs qualifiés. Vingt-cinq ans d'expérience à Marrakech et Essaouira.",
  alternates: { canonical: "/deposer-un-bien" },
};

const STEPS = [
  {
    icon: Phone,
    n: "01",
    title: "Premier échange",
    description:
      "Vous nous décrivez le bien (typologie, quartier, surface, particularités). Premier échange téléphonique de 20 minutes — sans engagement.",
  },
  {
    icon: Eye,
    n: "02",
    title: "Visite et estimation",
    description:
      "Un conseiller senior visite le bien et vous remet sous 24h une estimation argumentée appuyée sur les transactions comparables des 18 derniers mois.",
  },
  {
    icon: FileSignature,
    n: "03",
    title: "Mandat sur mesure",
    description:
      "Nous convenons ensemble d'un mandat (simple, semi-exclusif, exclusif) adapté à vos contraintes de discrétion, calendrier et conditions de prix.",
  },
  {
    icon: CheckCircle2,
    n: "04",
    title: "Mise en marché et signature",
    description:
      "Photographe professionnel, fiche éditoriale, diffusion ciblée auprès de notre fichier d'acquéreurs qualifiés (FR, BE, CH, GB, US). Signature chez notre notaire partenaire.",
  },
];

export default function DeposerPage() {
  return (
    <>
      <SectionHero
        eyebrow="Vendre · Estimation gratuite"
        title={
          <>
            Confiez-nous votre bien.<br />
            <span className="italic text-[var(--color-accent-light)]">Estimation</span> sous 24h.
          </>
        }
        subtitle="Vingt-cinq ans d'expérience à Marrakech et Essaouira. Acquéreurs qualifiés européens, américains et marocains résidents. Discrétion absolue."
      />

      {/* FORMULAIRE — remonté juste sous le hero (conversion) */}
      <section className="bg-[var(--color-cream)] pt-14 pb-20 md:pt-16">
        <div className="container-luxe">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <div className="eyebrow">Être rappelé</div>
              <h2 className="mt-4 font-serif text-3xl md:text-4xl">
                Moins d&apos;une minute pour démarrer.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm text-[var(--color-stone)]">
                Vos coordonnées suffisent. Les détails du bien sont facultatifs —
                un conseiller vous rappelle dans la journée.
              </p>
            </div>

            <div className="mt-10">
              <DepositForm />
            </div>
          </div>
        </div>
      </section>

      {/* PROCESSUS — réassurance, sous le formulaire */}
      <section className="bg-white py-24">
        <div className="container-luxe">
          <div className="text-center">
            <div className="eyebrow">Notre processus</div>
            <h2 className="mt-4 font-serif text-3xl md:text-4xl">
              Quatre étapes, jamais plus.
            </h2>
            <div className="gold-rule" />
          </div>
          <div className="mt-16 grid gap-px bg-[var(--color-beige-warm)] md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-[14px] bg-white p-8">
                <div className="flex items-center justify-between">
                  <s.icon size={20} className="text-[var(--color-accent)]" />
                  <span className="font-serif text-3xl text-[var(--color-stone-soft)]">
                    {s.n}
                  </span>
                </div>
                <h3 className="mt-6 font-serif text-xl text-[var(--color-charcoal)]">
                  {s.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-stone)]">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-charcoal)] py-16 text-white">
        <div className="container-luxe text-center">
          <p className="text-sm text-white/70">
            Préférez-vous parler à un conseiller directement ?
          </p>
          <a
            href="tel:+212660629444"
            className="mt-4 inline-flex items-center gap-2 font-serif text-3xl text-white hover:text-[var(--color-terracotta-light)]"
          >
            +212 660 62 94 44
          </a>
        </div>
      </section>
    </>
  );
}
