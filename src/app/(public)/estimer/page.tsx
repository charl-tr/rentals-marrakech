import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionHero from "@/components/SectionHero";
import EstimationGate from "@/components/EstimationGate";
import { estimateProperty } from "@/lib/estimation";
import {
  ALL_TYPES,
  NEIGHBORHOODS,
  propertyTypeLabel,
  type PropertyType,
} from "@/data/properties";

export const metadata: Metadata = {
  title: "Estimer votre bien à Marrakech — Marrakech Realty",
  description:
    "Obtenez une fourchette d'estimation en 60 secondes, basée sur les transactions comparables de notre portefeuille.",
  alternates: { canonical: "/estimer" },
};

function isType(s: string): s is PropertyType {
  return (ALL_TYPES as readonly string[]).includes(s);
}

export default async function EstimerPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string;
    zone?: string;
    surface?: string;
    bedrooms?: string;
  }>;
}) {
  const sp = await searchParams;
  const type = sp.type && isType(sp.type) ? sp.type : undefined;
  const zone = sp.zone;
  const surface = sp.surface ? Number(sp.surface) : undefined;
  const bedrooms = sp.bedrooms ? Number(sp.bedrooms) : undefined;

  const hasInput = !!type && !!zone && !!surface && surface > 0;

  const result = hasInput
    ? await estimateProperty({
        type: type!,
        neighborhoodSlug: zone!,
        surface: surface!,
        bedrooms,
      })
    : null;

  return (
    <>
      <SectionHero
        eyebrow="Estimation vendeur"
        title={
          <>
            Combien vaut votre bien ?<br />
            <span className="italic text-[var(--color-terracotta-light)]">
              Fourchette en 60 secondes.
            </span>
          </>
        }
        subtitle="Notre algorithme s'appuie sur les transactions comparables actuelles de notre portefeuille — riads, villas, appartements à Marrakech et Essaouira."
      />

      <section className="bg-[var(--color-cream)] py-16 md:py-24">
        <div className="container-luxe max-w-3xl">
          <form
            method="get"
            className="border border-[var(--color-beige-warm)] bg-white p-8"
          >
            <div className="eyebrow">Votre bien</div>
            <h2 className="mt-3 font-serif text-2xl text-[var(--color-charcoal)]">
              Décrivez les caractéristiques clés.
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
                  Type de bien
                </span>
                <select
                  name="type"
                  defaultValue={type ?? ""}
                  required
                  className="mt-1.5 w-full border border-[var(--color-beige-warm)] bg-white px-3 py-2.5 text-sm focus:border-[var(--color-charcoal)] focus:outline-none"
                >
                  <option value="" disabled>
                    Choisir…
                  </option>
                  {(ALL_TYPES as readonly PropertyType[]).map((t) => (
                    <option key={t} value={t}>
                      {propertyTypeLabel(t)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
                  Quartier
                </span>
                <select
                  name="zone"
                  defaultValue={zone ?? ""}
                  required
                  className="mt-1.5 w-full border border-[var(--color-beige-warm)] bg-white px-3 py-2.5 text-sm focus:border-[var(--color-charcoal)] focus:outline-none"
                >
                  <option value="" disabled>
                    Choisir…
                  </option>
                  {NEIGHBORHOODS.map((n) => (
                    <option key={n.slug} value={n.slug}>
                      {n.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
                  Surface habitable (m²)
                </span>
                <input
                  type="number"
                  name="surface"
                  min={20}
                  step={5}
                  defaultValue={surface ?? ""}
                  required
                  className="mt-1.5 w-full border border-[var(--color-beige-warm)] bg-white px-3 py-2.5 text-sm focus:border-[var(--color-charcoal)] focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
                  Chambres (optionnel)
                </span>
                <input
                  type="number"
                  name="bedrooms"
                  min={0}
                  step={1}
                  defaultValue={bedrooms ?? ""}
                  className="mt-1.5 w-full border border-[var(--color-beige-warm)] bg-white px-3 py-2.5 text-sm focus:border-[var(--color-charcoal)] focus:outline-none"
                />
              </label>
            </div>

            <button
              type="submit"
              className="btn-gold mt-8 w-full justify-center"
            >
              Estimer mon bien
              <ArrowRight size={14} />
            </button>
          </form>

          {/* ── Result: gated behind email ──────────────────────── */}
          {hasInput && result && (
            <EstimationGate
              result={result}
              type={type!}
              zone={zone!}
              surface={surface!}
              bedrooms={bedrooms}
            />
          )}

          {hasInput && !result && (
            <div className="mt-8 border border-[var(--color-beige-warm)] bg-white p-8 text-center">
              <div className="eyebrow">Pas assez de données</div>
              <p className="mt-4 text-sm text-[var(--color-stone)]">
                Nous n&apos;avons pas assez de biens comparables dans notre
                base pour ce type et ce quartier. Un conseiller vous fournira
                une estimation personnalisée basée sur nos transactions
                off-market.
              </p>
              <Link
                href={`/contact?project=${encodeURIComponent("Vendre — estimation")}`}
                className="btn-gold mt-6"
              >
                Parler à un conseiller
                <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-luxe max-w-3xl">
          <div className="eyebrow">Notre méthode</div>
          <h2 className="mt-4 font-serif text-3xl text-[var(--color-charcoal)]">
            Une fourchette, pas un prix.
          </h2>
          <div className="mt-8 space-y-5 text-sm leading-relaxed text-[var(--color-charcoal)]">
            <p>
              Nous analysons les biens actuellement en commercialisation dans
              notre portefeuille qui correspondent à votre type, votre quartier
              et votre surface. La médiane du prix au m² donne l&apos;estimation
              centrale, à laquelle nous appliquons ±15 % pour tenir compte de
              facteurs que l&apos;algorithme ne voit pas : standing, vue, état
              général, rénovations récentes.
            </p>
            <p>
              <strong>Ce que cette fourchette NE fait pas</strong> : évaluer
              précisément un bien d&apos;exception, prendre en compte un titre
              foncier particulier, intégrer les transactions off-market
              récentes qui ne passent jamais sur le web. Pour cela, une
              conversation avec un conseiller senior reste indispensable.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
