import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import SectionHero from "@/components/SectionHero";
import { estimateProperty } from "@/lib/estimation";
import {
  ALL_TYPES,
  NEIGHBORHOODS,
  propertyTypeLabel,
  type PropertyType,
} from "@/data/properties";
import { formatInCurrency } from "@/hooks/useCurrency";

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

          {/* RESULT */}
          {hasInput && result && (
            <div className="mt-8 border-l-4 border-[var(--color-terracotta)] bg-white p-8">
              <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--color-terracotta)]">
                <Sparkles size={12} />
                Votre fourchette estimée
              </div>

              <div className="mt-4 grid gap-6 md:grid-cols-3">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-stone)]">
                    Borne basse
                  </div>
                  <div className="mt-1 font-serif text-2xl text-[var(--color-stone)]">
                    {formatInCurrency(result.estimatedPriceLow, "EUR")}
                  </div>
                </div>
                <div className="border-l border-r border-[var(--color-beige-warm)] px-4">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-terracotta)]">
                    Médiane
                  </div>
                  <div className="mt-1 font-serif text-3xl text-[var(--color-charcoal)]">
                    {formatInCurrency(result.estimatedPriceMid, "EUR")}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-stone)]">
                    Borne haute
                  </div>
                  <div className="mt-1 font-serif text-2xl text-[var(--color-stone)]">
                    {formatInCurrency(result.estimatedPriceHigh, "EUR")}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--color-beige-warm)] pt-4 text-xs text-[var(--color-stone)]">
                <span className="flex items-center gap-1.5">
                  <TrendingUp size={12} className="text-[var(--color-terracotta)]" />
                  {result.pricePerSqm.toLocaleString("fr-FR")} € / m² médian
                </span>
                <span>·</span>
                <span>
                  Confiance :{" "}
                  <strong className="text-[var(--color-charcoal)]">
                    {result.confidence === "strong"
                      ? "forte"
                      : result.confidence === "moderate"
                      ? "modérée"
                      : "faible"}
                  </strong>
                </span>
                <span>·</span>
                <span>
                  {result.comparablesCount} biens comparables analysés
                </span>
              </div>

              {result.notes.length > 0 && (
                <ul className="mt-4 space-y-1 text-xs italic text-[var(--color-stone)]">
                  {result.notes.map((n, i) => (
                    <li key={i}>— {n}</li>
                  ))}
                </ul>
              )}

              <div className="mt-8 border-t border-[var(--color-beige-warm)] pt-6">
                <p className="text-sm text-[var(--color-charcoal)]">
                  Cette fourchette est indicative. Pour une estimation précise
                  qui prend en compte l&apos;état du bien, les rénovations
                  récentes, les transactions off-market et le contexte du
                  marché — parlez à un de nos conseillers.
                </p>
                <Link
                  href={`/contact?project=${encodeURIComponent("Vendre — estimation")}`}
                  className="btn-outline mt-5"
                >
                  Finaliser avec un conseiller
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
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

      {/* Pourquoi cette estimation */}
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
