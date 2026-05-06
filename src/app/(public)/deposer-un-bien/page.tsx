import Link from "next/link";
import type { Metadata } from "next";
import {
  CheckCircle2,
  Eye,
  FileSignature,
  Phone,
} from "lucide-react";
import SectionHero from "@/components/SectionHero";

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
            <span className="italic text-[var(--color-terracotta-light)]">Estimation</span> sous 24h.
          </>
        }
        subtitle="Vingt-cinq ans d'expérience à Marrakech et Essaouira. Acquéreurs qualifiés européens, américains et marocains résidents. Discrétion absolue."
      />

      {/* PROCESS */}
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
              <div key={s.n} className="bg-white p-8">
                <div className="flex items-center justify-between">
                  <s.icon size={20} className="text-[var(--color-terracotta)]" />
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

      {/* FORM */}
      <section className="bg-[var(--color-cream)] py-24">
        <div className="container-luxe">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <div className="eyebrow">Décrire le bien</div>
              <h2 className="mt-4 font-serif text-3xl md:text-4xl">
                Quelques minutes pour démarrer.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm text-[var(--color-stone)]">
                Renseignez l&apos;essentiel — un conseiller vous rappelle dans la journée.
              </p>
            </div>

            <form className="mt-12 space-y-6 border border-[var(--color-beige-warm)] bg-white p-10">
              <div className="grid gap-6 md:grid-cols-2">
                <Field label="Prénom" required>
                  <input className={inputCls} required />
                </Field>
                <Field label="Nom" required>
                  <input className={inputCls} required />
                </Field>
                <Field label="E-mail" required>
                  <input type="email" className={inputCls} required />
                </Field>
                <Field label="Téléphone" required>
                  <input type="tel" className={inputCls} required />
                </Field>
              </div>

              <Field label="Type de bien" required>
                <select className={inputCls} required defaultValue="">
                  <option value="" disabled>
                    Choisir…
                  </option>
                  <option>Riad rénové</option>
                  <option>Riad à rénover</option>
                  <option>Villa</option>
                  <option>Appartement</option>
                  <option>Maison d&apos;hôtes en activité</option>
                  <option>Terrain</option>
                  <option>Programme neuf</option>
                </select>
              </Field>

              <div className="grid gap-6 md:grid-cols-2">
                <Field label="Ville" required>
                  <select className={inputCls} required defaultValue="">
                    <option value="" disabled>
                      Choisir…
                    </option>
                    <option>Marrakech</option>
                    <option>Essaouira</option>
                    <option>Autre</option>
                  </select>
                </Field>
                <Field label="Quartier ou route">
                  <input className={inputCls} placeholder="Palmeraie, Médina, Diabat…" />
                </Field>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <Field label="Surface habitable (m²)">
                  <input type="number" className={inputCls} />
                </Field>
                <Field label="Surface terrain (m²)">
                  <input type="number" className={inputCls} />
                </Field>
                <Field label="Chambres">
                  <input type="number" className={inputCls} />
                </Field>
              </div>

              <Field label="Particularités du bien">
                <textarea
                  rows={4}
                  className={`${inputCls} resize-none`}
                  placeholder="Restauration récente, vue exceptionnelle, dépendances, dossier juridique en règle…"
                />
              </Field>

              <Field label="Calendrier de vente envisagé">
                <select className={inputCls} defaultValue="">
                  <option value="">Pas pressé</option>
                  <option>Sous 3 mois</option>
                  <option>Sous 6 mois</option>
                  <option>Cette année</option>
                </select>
              </Field>

              <button type="submit" className="btn-gold w-full justify-center">
                Demander une estimation gratuite
              </button>
              <p className="text-[11px] text-[var(--color-stone)]">
                Vos informations restent strictement confidentielles. Aucun partage avec
                des tiers, aucun acquéreur ne sera contacté sans votre accord express.
              </p>
            </form>
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

const inputCls =
  "w-full border border-[var(--color-beige-warm)] bg-white px-4 py-3 text-sm text-[var(--color-charcoal)] focus:border-[var(--color-terracotta)] focus:outline-none";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
        {label}
        {required && <span className="text-[var(--color-terracotta)]"> *</span>}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
