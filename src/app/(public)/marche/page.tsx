import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, Building2, MapPin, BarChart2 } from "lucide-react";
import { getMarketStats } from "@/lib/db";
import { PricePerSqmChart, TypeDistributionChart } from "@/components/MarketCharts";

export const metadata: Metadata = {
  title: "Rapport marché immobilier Marrakech 2025 — Marrakech Realty",
  description:
    "Indice des prix au m², tendances et analyse du marché immobilier de luxe à Marrakech. Données issues de notre catalogue de 200+ biens.",
};

const fmtEur = (v: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(v);

export default async function MarchePage() {
  const stats = await getMarketStats();
  const topNeigh = stats.byNeighborhood.slice(0, 8);

  return (
    <main className="bg-white">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="border-b border-[var(--color-beige-warm)] bg-[var(--color-cream)] py-20">
        <div className="container-luxe">
          <div className="eyebrow">Rapport annuel 2025</div>
          <h1 className="mt-4 max-w-2xl font-serif text-4xl leading-tight text-[var(--color-charcoal)] md:text-5xl">
            Marché immobilier<br />de luxe à Marrakech.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--color-stone)]">
            Analyse des prix, tendances de fond et indice par quartier — établis à partir
            de notre portefeuille de {stats.totalListings} biens actifs et de vingt-cinq ans
            d&apos;expertise terrain.
          </p>
          <div className="mt-8 flex gap-4">
            <Link
              href="/contact"
              className="btn-primary"
            >
              Parler à un expert
            </Link>
            <Link
              href="/estimer"
              className="btn-secondary"
            >
              Estimer mon bien
            </Link>
          </div>
        </div>
      </section>

      {/* ── Key metrics ──────────────────────────────────────────── */}
      <section className="border-b border-[var(--color-beige-warm)] py-16">
        <div className="container-luxe">
          <div className="grid gap-px bg-[var(--color-beige-warm)] md:grid-cols-4">
            {[
              {
                icon: Building2,
                value: stats.totalListings.toString(),
                label: "Biens en portefeuille",
                sub: "Marrakech & Essaouira",
              },
              {
                icon: TrendingUp,
                value: fmtEur(stats.avgPriceVente),
                label: "Prix moyen — vente",
                sub: `${stats.venteCount} biens`,
              },
              {
                icon: MapPin,
                value: fmtEur(stats.avgPriceLocation) + "/mois",
                label: "Loyer moyen — mensuel",
                sub: `${stats.locationCount} biens`,
              },
              {
                icon: BarChart2,
                value:
                  stats.byNeighborhood[0]
                    ? fmtEur(stats.byNeighborhood[0].avgPricePerSqm) + "/m²"
                    : "—",
                label: "Quartier premium",
                sub: stats.byNeighborhood[0]?.label ?? "",
              },
            ].map(({ icon: Icon, value, label, sub }) => (
              <div
                key={label}
                className="flex flex-col gap-2 bg-white px-8 py-10"
              >
                <Icon size={18} className="text-[var(--color-terracotta)]" />
                <div className="font-serif text-2xl text-[var(--color-charcoal)] md:text-3xl">
                  {value}
                </div>
                <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--color-charcoal)]">
                  {label}
                </div>
                <div className="text-[11px] text-[var(--color-stone)]">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Indice prix/m² ───────────────────────────────────────── */}
      <section className="border-b border-[var(--color-beige-warm)] py-20">
        <div className="container-luxe">
          <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="eyebrow">Indice 2025</div>
              <h2 className="mt-3 font-serif text-3xl text-[var(--color-charcoal)] md:text-4xl">
                Prix moyen au m² par quartier.
              </h2>
            </div>
            <p className="max-w-xs text-sm text-[var(--color-stone)]">
              Calculé sur les biens en vente avec surface renseignée.
              Données issues du catalogue actif.
            </p>
          </div>

          {/* Chart */}
          {topNeigh.length > 0 ? (
            <PricePerSqmChart data={topNeigh} />
          ) : (
            <p className="text-[var(--color-stone)]">Données insuffisantes.</p>
          )}

          {/* Table détaillée */}
          {topNeigh.length > 0 && (
            <div className="mt-12 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-beige-warm)]">
                    {["Quartier", "Biens", "Prix/m² moyen", "Médiane", "Min", "Max"].map(
                      (h) => (
                        <th
                          key={h}
                          className="pb-3 pr-6 text-left text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {topNeigh.map((n, i) => (
                    <tr
                      key={n.slug}
                      className={`border-b border-[var(--color-beige-warm)] ${
                        i === 0 ? "bg-[var(--color-cream)]" : ""
                      }`}
                    >
                      <td className="py-4 pr-6 font-medium text-[var(--color-charcoal)]">
                        {n.label}
                        {i === 0 && (
                          <span className="ml-2 rounded-none bg-[var(--color-terracotta)] px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.18em] text-white">
                            Premium
                          </span>
                        )}
                      </td>
                      <td className="py-4 pr-6 text-[var(--color-stone)]">{n.count}</td>
                      <td className="py-4 pr-6 font-medium text-[var(--color-charcoal)]">
                        {fmtEur(n.avgPricePerSqm)}
                      </td>
                      <td className="py-4 pr-6 text-[var(--color-stone)]">
                        {fmtEur(n.medianPrice)}
                      </td>
                      <td className="py-4 pr-6 text-[var(--color-stone)]">
                        {fmtEur(n.minPrice)}
                      </td>
                      <td className="py-4 text-[var(--color-stone)]">
                        {fmtEur(n.maxPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ── Répartition par type ──────────────────────────────────── */}
      <section className="border-b border-[var(--color-beige-warm)] bg-[var(--color-cream)] py-20">
        <div className="container-luxe">
          <div className="grid gap-16 md:grid-cols-2">
            <div>
              <div className="eyebrow">Composition du marché</div>
              <h2 className="mt-3 font-serif text-3xl text-[var(--color-charcoal)] md:text-4xl">
                Répartition par type de bien.
              </h2>
              <p className="mt-6 leading-relaxed text-[var(--color-stone)]">
                Le marché marrakchi de standing reste dominé par les riads — pièces
                d&apos;exception de la Médina, à mi-chemin entre investissement
                patrimonial et coup de cœur. Les villas de la Palmeraie forment un
                second pôle d&apos;attraction pour une clientèle internationale en
                quête d&apos;espace et d&apos;intimité.
              </p>
              <ul className="mt-8 space-y-3">
                {stats.byType.slice(0, 5).map((t) => (
                  <li key={t.type} className="flex items-center justify-between">
                    <span className="text-sm text-[var(--color-charcoal)]">{t.label}</span>
                    <span className="font-medium text-[var(--color-charcoal)]">
                      {t.count} biens
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-center">
              <TypeDistributionChart data={stats.byType} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Tendances éditoriales ─────────────────────────────────── */}
      <section className="border-b border-[var(--color-beige-warm)] py-20">
        <div className="container-luxe">
          <div className="eyebrow">Analyse</div>
          <h2 className="mt-3 font-serif text-3xl text-[var(--color-charcoal)] md:text-4xl">
            Tendances 2025.
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                n: "01",
                title: "La Médina — résistance des prix",
                text: "Malgré une conjoncture internationale moins favorable, les riads rénovés en cœur de Médina maintiennent leurs niveaux. La rareté des biens d'exception tire les valorisations vers le haut.",
              },
              {
                n: "02",
                title: "La Palmeraie — retour en grâce",
                text: "Après plusieurs années de stabilisation, les grandes villas retrouvent la faveur des investisseurs européens. Le profil acheteur : famille internationale, résidence secondaire, horizon 5-10 ans.",
              },
              {
                n: "03",
                title: "Guéliz — nouveau luxe urbain",
                text: "Les appartements de standing dans la Ville Nouvelle séduisent une clientèle plus jeune. Espaces ouverts, prestations contemporaines, accès immédiat aux commerces — une demande en hausse de +18 %.",
              },
            ].map(({ n, title, text }) => (
              <div key={n} className="border-t-2 border-[var(--color-terracotta)] pt-6">
                <div className="font-serif text-2xl text-[var(--color-terracotta)] opacity-40">
                  {n}
                </div>
                <h3 className="mt-4 font-serif text-lg text-[var(--color-charcoal)]">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-stone)]">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="container-luxe text-center">
          <h2 className="font-serif text-3xl text-[var(--color-charcoal)] md:text-4xl">
            Prêt à franchir le pas ?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[var(--color-stone)]">
            Nos experts terrain sont disponibles pour une consultation personnalisée,
            sans engagement.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/acheter" className="btn-primary">
              Explorer les biens
            </Link>
            <Link href="/carte" className="btn-secondary">
              Vue carte interactive
            </Link>
            <Link href="/estimer" className="btn-secondary">
              Estimer mon bien
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
