"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Heart, Trash2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { useFavorites } from "@/hooks/useFavorites";
import PropertyCard from "@/components/PropertyCard";
import SectionHero from "@/components/SectionHero";
import SaveSelectionBanner from "@/components/SaveSelectionBanner";
import type { Property } from "@/data/properties";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
);

// Coordonnées par défaut (sync avec db.ts server-side)
const CITY_DEFAULT_COORDS = {
  Marrakech: { lat: 31.6295, lng: -7.9811 },
  Essaouira: { lat: 31.5085, lng: -9.7595 },
} as const;

function rowToProperty(row: any): Property {
  const neighborhood = row.neighborhood as { name: string } | null;
  return {
    slug: row.slug,
    reference: row.reference,
    title: row.title,
    tagline: row.tagline ?? "",
    type: row.type,
    listing: row.listing,
    status: row.status ?? "available",
    exclusivity: row.exclusivity,
    city: row.city,
    neighborhood: neighborhood?.name ?? row.neighborhood_slug ?? "",
    neighborhoodSlug: row.neighborhood_slug ?? "",
    price: row.price_eur,
    currency: "EUR",
    priceMad: row.price_mad ?? undefined,
    priceUnit: row.price_unit ?? undefined,
    bedrooms: row.bedrooms ?? 0,
    bathrooms: row.bathrooms ?? 0,
    surface: row.surface ?? 0,
    landSurface: row.land_surface ?? undefined,
    yearBuilt: row.year_built ?? undefined,
    pool: row.pool,
    featured: row.featured,
    shortDescription: row.short_description ?? "",
    story: row.story ?? { eyebrow: "", title: "", paragraphs: [] },
    description: row.description ?? "",
    features: row.features ?? [],
    images: row.images ?? [],
    walkingDistances: row.walking_distances ?? [],
    coordinates:
      CITY_DEFAULT_COORDS[row.city as keyof typeof CITY_DEFAULT_COORDS] ??
      CITY_DEFAULT_COORDS.Marrakech,
    advisorSlug: row.advisor_slug ?? "",
  };
}

export default function FavorisPage() {
  const { favorites, hydrated, count } = useFavorites();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated) return;
    if (favorites.length === 0) {
      setProperties([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("properties")
        .select("*, neighborhood:neighborhoods(name)")
        .in("slug", favorites)
        .eq("published", true);
      if (cancelled) return;
      // Respecter l'ordre d'ajout (favoris[0] en premier)
      const byslug = new Map((data ?? []).map((r: any) => [r.slug, r]));
      const ordered = favorites
        .map((s) => byslug.get(s))
        .filter(Boolean)
        .map(rowToProperty);
      setProperties(ordered);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [favorites, hydrated]);

  return (
    <>
      <SectionHero
        eyebrow="Votre sélection"
        title={
          <>
            Mes biens{" "}
            <span className="italic text-[var(--color-accent-light)]">favoris</span>.
          </>
        }
        subtitle={
          hydrated && count > 0
            ? `${count} ${count > 1 ? "biens enregistrés" : "bien enregistré"} pour plus tard.`
            : "Retrouvez ici les biens que vous avez marqués d'un cœur en naviguant."
        }
        backHref="/acheter"
      />

      <section className="bg-[var(--color-cream)] py-16">
        <div className="container-luxe">
          {!hydrated || loading ? (
            <div className="py-20 text-center text-sm text-[var(--color-stone)]">
              Chargement…
            </div>
          ) : count === 0 ? (
            <EmptyState />
          ) : (
            <>
              <SaveSelectionBanner kind="favoris" slugs={favorites} />

              <div className="mb-8 flex items-center justify-between">
                <div className="text-sm text-[var(--color-stone)]">
                  <span className="font-serif text-2xl text-[var(--color-charcoal)]">
                    {count}
                  </span>{" "}
                  {count > 1 ? "biens sauvegardés" : "bien sauvegardé"}
                </div>
                <ClearAllButton />
              </div>

              <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
                {properties.map((p, i) => (
                  <PropertyCard key={p.slug} property={p} priority={i < 3} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto max-w-xl rounded-[14px] border border-[var(--color-beige-warm)] bg-white p-12 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-terracotta)]/10">
        <Heart
          size={24}
          className="text-[var(--color-terracotta)]"
          strokeWidth={1.5}
        />
      </div>
      <h2 className="mt-6 font-serif text-2xl text-[var(--color-charcoal)]">
        Aucun favori pour l&apos;instant.
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-[var(--color-stone)]">
        Parcourez notre sélection et cliquez sur l&apos;icône cœur pour retrouver
        vos biens préférés sur ce même appareil.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link href="/acheter" className="btn-outline inline-flex">
          Explorer les biens à vendre
          <ArrowRight size={14} />
        </Link>
        <Link
          href="/louer"
          className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-stone)] hover:text-[var(--color-terracotta)]"
        >
          Ou les locations →
        </Link>
      </div>
    </div>
  );
}

function ClearAllButton() {
  const handleClear = () => {
    if (typeof window === "undefined") return;
    if (!confirm("Effacer tous vos favoris ?")) return;
    window.localStorage.removeItem("mr:favorites");
    window.dispatchEvent(new CustomEvent("mr:favorites:change", { detail: [] }));
  };
  return (
    <button
      type="button"
      onClick={handleClear}
      className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)] transition-colors hover:text-[var(--color-terracotta)]"
    >
      <Trash2 size={12} />
      Tout effacer
    </button>
  );
}
