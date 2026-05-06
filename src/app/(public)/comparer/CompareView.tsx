"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Bath, BedDouble, Maximize, MapPin, Trees, Waves, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCompareList } from "@/hooks/useCompareList";
import { useCurrency, formatInCurrency } from "@/hooks/useCurrency";
import { propertyTypeLabel, type Property } from "@/data/properties";

// ════════════════════════════════════════════════════════════════════
// CompareView — client-side compare. Reçoit les biens pré-chargés
// depuis la page server (via slug → property lookup).
// L'utilisateur peut retirer un bien → mise à jour localStorage → l'UI
// se synchronise (mais le server render initial reste juste la baseline).
// ════════════════════════════════════════════════════════════════════

export default function CompareView({
  properties,
}: {
  properties: Property[];
}) {
  const { items, remove, hydrated } = useCompareList();
  const { currency, hydrated: currencyHydrated } = useCurrency();
  const effective = currencyHydrated ? currency : "EUR";

  // Synchroniser — si localStorage a changé, ne montrer que les biens présents dans items
  const [displayed, setDisplayed] = useState<Property[]>(properties);
  useEffect(() => {
    if (!hydrated) return;
    setDisplayed(properties.filter((p) => items.includes(p.slug)));
  }, [items, hydrated, properties]);

  if (displayed.length === 0) {
    return (
      <div className="container-luxe py-20 text-center">
        <div className="eyebrow">Comparateur</div>
        <h2 className="mt-4 font-serif text-3xl text-[var(--color-charcoal)]">
          Votre comparateur est vide.
        </h2>
        <p className="mt-3 text-sm text-[var(--color-stone)]">
          Ajoutez jusqu&apos;à 3 biens depuis leurs fiches pour les comparer côte à côte.
        </p>
        <Link href="/acheter" className="btn-outline mt-8">
          <ArrowLeft size={14} /> Parcourir les biens
        </Link>
      </div>
    );
  }

  // Helpers comparaison : quel est le winner par ligne ?
  const maxPrice = Math.max(...displayed.map((p) => p.price));
  const minPrice = Math.min(...displayed.map((p) => p.price));
  const maxSurface = Math.max(...displayed.map((p) => p.surface));
  const maxBedrooms = Math.max(...displayed.map((p) => p.bedrooms));
  const maxBathrooms = Math.max(...displayed.map((p) => p.bathrooms));
  const maxLand = Math.max(...displayed.map((p) => p.landSurface ?? 0));

  return (
    <div className="container-luxe py-10 md:py-14">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="eyebrow">Comparateur</div>
          <h1 className="mt-2 font-serif text-3xl text-[var(--color-charcoal)] md:text-4xl">
            Comparer {displayed.length} bien{displayed.length > 1 ? "s" : ""}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-stone)]">
            Les critères en vert indiquent le meilleur de chaque catégorie.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `160px repeat(${displayed.length}, minmax(240px, 1fr))` }}
        >
          {/* Row : images */}
          <div />
          {displayed.map((p) => (
            <div key={`img-${p.slug}`} className="relative">
              <Link
                href={
                  p.listing === "vente" || p.type === "programme-neuf"
                    ? `/acheter/${p.slug}`
                    : `/louer/${p.slug}`
                }
                className="group block"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-charcoal)]">
                  {p.images[0] && (
                    <Image
                      src={p.images[0]}
                      alt={p.title}
                      fill
                      sizes="240px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                </div>
              </Link>
              <button
                type="button"
                onClick={() => remove(p.slug)}
                aria-label="Retirer du comparateur"
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center bg-white/90 text-[var(--color-charcoal)] transition-colors hover:bg-[var(--color-terracotta)] hover:text-white"
              >
                <X size={14} />
              </button>
            </div>
          ))}

          {/* Row : title */}
          <Label>Bien</Label>
          {displayed.map((p) => (
            <Cell key={`title-${p.slug}`}>
              <Link
                href={
                  p.listing === "vente" || p.type === "programme-neuf"
                    ? `/acheter/${p.slug}`
                    : `/louer/${p.slug}`
                }
                className="group"
              >
                <div className="font-serif text-base leading-tight text-[var(--color-charcoal)] group-hover:text-[var(--color-terracotta)]">
                  {p.title}
                </div>
                <div className="mt-1 flex items-center gap-1 text-[10px] uppercase tracking-[0.22em] text-[var(--color-stone)]">
                  <MapPin size={10} /> {p.neighborhood}, {p.city}
                </div>
              </Link>
            </Cell>
          ))}

          {/* Row : type */}
          <Label>Type</Label>
          {displayed.map((p) => (
            <Cell key={`type-${p.slug}`}>
              <span className="text-sm text-[var(--color-charcoal)]">
                {propertyTypeLabel(p.type)}
              </span>
            </Cell>
          ))}

          {/* Row : reference */}
          <Label>Référence</Label>
          {displayed.map((p) => (
            <Cell key={`ref-${p.slug}`}>
              <span className="font-mono text-xs text-[var(--color-stone)]">
                {p.reference}
              </span>
            </Cell>
          ))}

          {/* Row : price */}
          <Label>Prix</Label>
          {displayed.map((p) => (
            <Cell key={`price-${p.slug}`} winner={p.price === minPrice && displayed.length > 1}>
              <div className="font-serif text-lg text-[var(--color-charcoal)]">
                {formatInCurrency(p.price, effective)}
              </div>
              {maxPrice !== minPrice && (
                <div className="text-[10px] text-[var(--color-stone)]">
                  {p.price === minPrice
                    ? "le plus accessible"
                    : p.price === maxPrice
                    ? "le plus premium"
                    : ""}
                </div>
              )}
            </Cell>
          ))}

          {/* Row : bedrooms */}
          <Label>Chambres</Label>
          {displayed.map((p) => (
            <Cell key={`bed-${p.slug}`} winner={p.bedrooms === maxBedrooms && displayed.length > 1}>
              <span className="flex items-center gap-1.5 text-sm text-[var(--color-charcoal)]">
                <BedDouble size={12} className="text-[var(--color-stone)]" />
                {p.bedrooms}
              </span>
            </Cell>
          ))}

          {/* Row : bathrooms */}
          <Label>Salles de bain</Label>
          {displayed.map((p) => (
            <Cell key={`bath-${p.slug}`} winner={p.bathrooms === maxBathrooms && displayed.length > 1}>
              <span className="flex items-center gap-1.5 text-sm text-[var(--color-charcoal)]">
                <Bath size={12} className="text-[var(--color-stone)]" />
                {p.bathrooms}
              </span>
            </Cell>
          ))}

          {/* Row : surface habitable */}
          <Label>Surface habitable</Label>
          {displayed.map((p) => (
            <Cell key={`surf-${p.slug}`} winner={p.surface === maxSurface && displayed.length > 1}>
              <span className="flex items-center gap-1.5 text-sm text-[var(--color-charcoal)]">
                <Maximize size={12} className="text-[var(--color-stone)]" />
                {p.surface} m²
              </span>
            </Cell>
          ))}

          {/* Row : land surface */}
          <Label>Terrain</Label>
          {displayed.map((p) => (
            <Cell
              key={`land-${p.slug}`}
              winner={Boolean(p.landSurface) && p.landSurface === maxLand && maxLand > 0 && displayed.length > 1}
            >
              <span className="flex items-center gap-1.5 text-sm text-[var(--color-charcoal)]">
                <Trees size={12} className="text-[var(--color-stone)]" />
                {p.landSurface ? `${p.landSurface} m²` : "—"}
              </span>
            </Cell>
          ))}

          {/* Row : pool */}
          <Label>Piscine</Label>
          {displayed.map((p) => (
            <Cell key={`pool-${p.slug}`}>
              <span className={`flex items-center gap-1.5 text-sm ${p.pool ? "text-[var(--color-charcoal)]" : "text-[var(--color-stone-soft)]"}`}>
                <Waves size={12} />
                {p.pool ? "Oui" : "Non"}
              </span>
            </Cell>
          ))}

          {/* Row : exclusivity */}
          <Label>Exclusivité</Label>
          {displayed.map((p) => (
            <Cell key={`excl-${p.slug}`}>
              {p.exclusivity ? (
                <span className="inline-flex items-center bg-[var(--color-terracotta)] px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.22em] text-white">
                  ★ Exclusivité
                </span>
              ) : (
                <span className="text-[11px] text-[var(--color-stone-soft)]">—</span>
              )}
            </Cell>
          ))}

          {/* Row : year built */}
          <Label>Année</Label>
          {displayed.map((p) => (
            <Cell key={`year-${p.slug}`}>
              <span className="text-sm text-[var(--color-charcoal)]">
                {p.yearBuilt ?? "—"}
              </span>
            </Cell>
          ))}

          {/* Row : CTA */}
          <Label></Label>
          {displayed.map((p) => (
            <Cell key={`cta-${p.slug}`}>
              <Link
                href={`/contact?property=${encodeURIComponent(p.slug)}`}
                className="btn-outline w-full justify-center"
              >
                Demander ce bien
              </Link>
            </Cell>
          ))}
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex items-center py-3 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
      {children}
    </div>
  );
}

function Cell({
  children,
  winner = false,
}: {
  children: React.ReactNode;
  winner?: boolean;
}) {
  return (
    <div
      className={`border-t border-[var(--color-beige-warm)] py-3 ${
        winner ? "bg-[var(--color-success-soft)] px-2" : ""
      }`}
    >
      {children}
    </div>
  );
}
