"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Heart, Trash2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { useFavorites } from "@/hooks/useFavorites";
import PropertyCard from "@/components/PropertyCard";
import SectionHero from "@/components/SectionHero";
import SaveSelectionBanner from "@/components/SaveSelectionBanner";
import type { PropertySummary } from "@/data/properties";

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

interface FavoriteRow {
  slug: string;
  title: string;
  type: PropertySummary["type"];
  listing: PropertySummary["listing"];
  status: PropertySummary["status"] | null;
  exclusivity: boolean;
  city: string;
  neighborhood_slug: string | null;
  source_type_label: string | null;
  price_eur: number;
  price_mad: number | null;
  price_unit: PropertySummary["priceUnit"] | null;
  bedrooms: number | null;
  bathrooms: number | null;
  surface: number | null;
  land_surface: number | null;
  pool: boolean;
  featured?: boolean;
  images: string[] | null;
  neighborhood: { name: string } | null;
}

function rowToProperty(row: FavoriteRow): PropertySummary {
  const neighborhood = row.neighborhood;
  return {
    slug: row.slug,
    title: row.title,
    type: row.type,
    listing: row.listing,
    status: row.status ?? "available",
    exclusivity: row.exclusivity,
    city: row.city,
    neighborhood: neighborhood?.name ?? row.neighborhood_slug ?? "",
    neighborhoodSlug: row.neighborhood_slug ?? "",
    sourceTypeLabel: row.source_type_label ?? undefined,
    price: row.price_eur,
    priceMad: row.price_mad ?? undefined,
    priceUnit: row.price_unit ?? undefined,
    bedrooms: row.bedrooms ?? 0,
    bathrooms: row.bathrooms ?? 0,
    surface: row.surface ?? 0,
    landSurface: row.land_surface ?? undefined,
    pool: row.pool,
    featured: row.featured,
    images: [row.images?.[0] ?? "/hero-home.jpg"],
    coordinates:
      CITY_DEFAULT_COORDS[row.city as keyof typeof CITY_DEFAULT_COORDS] ??
      CITY_DEFAULT_COORDS.Marrakech,
  };
}

export default function FavoritesPageContent({ locale = "fr" }: { locale?: "fr" | "en" }) {
  const en = locale === "en";
  const { favorites, hydrated, count } = useFavorites();
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!hydrated) return;
    if (favorites.length === 0) {
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(false);
      try {
      const { data, error } = await supabase
        .from("properties")
        .select(`
          slug,title,type,listing,status,exclusivity,city,neighborhood_slug,
          source_type_label,price_eur,price_mad,price_unit,bedrooms,bathrooms,
          surface,land_surface,pool,images,neighborhood:neighborhoods(name)
        `)
        .in("slug", favorites)
        .eq("published", true);
      if (cancelled) return;
      if (error) throw error;
      // Respecter l'ordre d'ajout (favoris[0] en premier)
      const rows = (data ?? []) as unknown as FavoriteRow[];
      const byslug = new Map(rows.map((row) => [row.slug, row]));
      const ordered = favorites
        .map((s) => byslug.get(s))
        .filter((row): row is FavoriteRow => Boolean(row))
        .map(rowToProperty);
      setProperties(ordered);
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [favorites, hydrated, retry]);

  return (
    <>
      <SectionHero
        locale={locale}
        eyebrow={en ? "Your selection" : "Votre sélection"}
        title={
          <>
            {en ? "Your" : "Mes biens"}{" "}
            <span className="italic text-[var(--color-accent-light)]">{en ? "saved properties" : "favoris"}</span>.
          </>
        }
        subtitle={
          en ? count > 0 ? `${count} saved properties for later.` : "Find the properties you have saved using the heart icon." : hydrated && count > 0
            ? `${count} ${count > 1 ? "biens enregistrés" : "bien enregistré"} pour plus tard.`
            : "Retrouvez ici les biens que vous avez marqués d'un cœur en naviguant."
        }
        backHref={en ? "/en/buy" : "/acheter"}
      />

      <section className="bg-[var(--color-cream)] py-6 md:py-8">
        <div className="container-luxe">
          {!hydrated || (loading && favorites.length > 0) ? (
            <div className="py-20 text-center text-sm text-[var(--color-stone)]">
              {en ? "Loading…" : <>Chargement…</>}
            </div>
          ) : count === 0 ? (
            <EmptyState locale={locale} />
          ) : loadError ? (
            <div role="alert" className="rounded-[14px] border border-[var(--color-border)] bg-white p-6 text-sm">
              <p>{en ? "Could not load properties. Your selection is kept." : <>Les fiches n’ont pas pu être chargées. Votre sélection est conservée.</>}</p>
              <button type="button" onClick={() => setRetry((value) => value + 1)} className="btn-outline mt-4">{en ? "Try again" : <>Réessayer</>}</button>
            </div>
          ) : (
            <>
              <SaveSelectionBanner locale={locale} kind="favoris" slugs={favorites} />

              <div className="mb-8 flex items-center justify-between">
                <div className="text-sm text-[var(--color-stone)]">
                  <span className="font-serif text-2xl text-[var(--color-charcoal)]">
                    {count}
                  </span>{" "}
                  {en ? count === 1 ? "saved property" : "saved properties" : count > 1 ? "biens sauvegardés" : "bien sauvegardé"}
                </div>
                <ClearAllButton locale={locale} />
              </div>

              <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
                {properties.map((p, i) => (
                  <PropertyCard locale={locale} key={p.slug} property={p} priority={i < 3} />
                ))}
              </div>
              {properties.length < count && <p className="mt-5 text-sm text-[var(--color-stone)]">{count - properties.length} {en ? "saved properties are no longer published. Your other favourites are kept." : "bien(s) de votre sélection ne sont plus publiés. Les autres favoris sont conservés."}</p>}
            </>
          )}
        </div>
      </section>
    </>
  );
}

function EmptyState({ locale }: { locale: "fr" | "en" }) {
  const en = locale === "en";
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
        {en ? "No saved properties yet." : <>Aucun favori pour l&apos;instant.</>}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-[var(--color-stone)]">
        {en ? "Explore our properties and tap the heart to save your favourites on this device." : <>Parcourez notre sélection et cliquez sur l&apos;icône cœur pour retrouver
        vos biens préférés sur ce même appareil.</>}
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link href={en ? "/en/buy" : "/acheter"} className="btn-outline inline-flex">
          {en ? "Explore properties for sale" : <>Explorer les biens à vendre</>}
          <ArrowRight size={14} />
        </Link>
        <Link
          href={en ? "/en/rent" : "/louer"}
          className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-stone)] hover:text-[var(--color-terracotta)]"
        >
          {en ? "Or find a rental →" : <>Ou les locations →</>}
        </Link>
      </div>
    </div>
  );
}

function ClearAllButton({ locale }: { locale: "fr" | "en" }) {
  const en = locale === "en";
  const { clear } = useFavorites();
  const handleClear = () => {
    if (typeof window === "undefined") return;
    if (!confirm(en ? "Clear all saved properties?" : "Effacer tous vos favoris ?")) return;
    clear();
  };
  return (
    <button
      type="button"
      onClick={handleClear}
      className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)] transition-colors hover:text-[var(--color-terracotta)]"
    >
      <Trash2 size={12} />
      {en ? "Clear all" : <>Tout effacer</>}
    </button>
  );
}
