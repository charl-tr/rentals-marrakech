import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, KeyRound, Map as MapIcon, ShieldCheck } from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import FadeInOnScroll from "@/components/FadeInOnScroll";
import HomeHero from "@/components/HomeHero";
import {
  ALL_TYPES,
  propertyTypeLabel,
  type PropertySummary,
} from "@/data/properties";
import { getCatalogueProperties } from "@/lib/db";
import { languagePath } from "@/lib/i18n/routes";
import { englishTypes } from "@/lib/i18n/english";
import EnglishPropertyCard from "@/components/english/EnglishPropertyCard";

export const revalidate = 300;

const DESTINATIONS = [
  { slug: "medina", label: "Médina" },
  { slug: "palmeraie", label: "Palmeraie" },
  {
    slug: "hivernage",
    label: "Hivernage",
    imageSlug: "appartements-duplex-et-riads-avec-bassin-prive-a-vendre-a-lhivernage",
  },
  { slug: "amelkis", label: "Amelkis" },
  { slug: "gueliz", label: "Guéliz" },
] as const;

const ESSAOUIRA_IMAGE_SLUG = "villa-neuve-avec-vue-mer-a-vendre-a-essaouira-cap-sim";

function editorialScore(property: PropertySummary) {
  return (
    (property.featured ? 50 : 0) +
    (property.exclusivity ? 24 : 0) +
    (property.pool ? 10 : 0) +
    Math.min(property.imageCount ?? property.images.length, 24) +
    (property.bedrooms > 0 ? 4 : 0) +
    (property.surface > 0 ? 4 : 0) -
    (property.price <= 0 ? 40 : 0)
  );
}

function selectEditorialProperties(catalogue: PropertySummary[]) {
  const saleProperties = catalogue
    .filter(
      (property) =>
        (property.listing === "vente" || property.type === "programme-neuf") &&
        property.status !== "sold" &&
        property.images[0]
    )
    .sort((a, b) => editorialScore(b) - editorialScore(a));
  const preferredTypes = ["villa", "riad-renove", "maison-hotes", "appartement"];
  const selected: PropertySummary[] = [];

  for (const type of preferredTypes) {
    const match = saleProperties.find(
      (property) => property.type === type && !selected.includes(property)
    );
    if (match) selected.push(match);
    if (selected.length === 3) break;
  }
  for (const property of saleProperties) {
    if (selected.length === 3) break;
    if (!selected.includes(property)) selected.push(property);
  }
  return selected;
}

export default async function HomePage({ locale = "fr" }: { locale?: "fr" | "en" }) {
  const en = locale === "en";
  const href = (path: string) => languagePath(path, locale);
  const catalogue = await getCatalogueProperties();
  const featuredProperties = selectEditorialProperties(catalogue);
  const presentTypes = new Set(catalogue.map((property) => property.type));
  const saleCount = catalogue.filter(
    (property) => property.listing === "vente" || property.type === "programme-neuf"
  ).length;
  const rentalCount = catalogue.filter((property) => property.listing !== "vente").length;
  const typeOptions = ALL_TYPES
    .filter((type) => presentTypes.has(type))
    .map((type) => ({ value: type, label: en ? englishTypes[type] : propertyTypeLabel(type) }));
  const zoneLabels = new Map<string, string>();
  for (const property of catalogue) {
    if (property.neighborhoodSlug) {
      zoneLabels.set(property.neighborhoodSlug, property.neighborhood);
    }
  }
  const zoneOptions = [...zoneLabels.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, "fr"));
  const destinationCards = DESTINATIONS.map((destination) => {
    const properties = catalogue.filter(
      (candidate) => candidate.neighborhoodSlug === destination.slug
    );
    const property =
      ("imageSlug" in destination
        ? properties.find((candidate) => candidate.slug === destination.imageSlug)
        : null) ?? properties.find((candidate) => candidate.images[0]);
    return property
      ? {
          slug: destination.slug,
          name: destination.label,
          city: property.city,
          imageHero: property.images[0],
          count: properties.length,
        }
      : null;
  }).filter(Boolean);
  const essaouiraProperties = catalogue.filter((property) => property.city === "Essaouira");
  const essaouiraProperty =
    essaouiraProperties.find((property) => property.slug === ESSAOUIRA_IMAGE_SLUG) ??
    essaouiraProperties.find((property) => property.images[0]);

  const shortcuts = [
    {
      href: "/acheter",
      icon: Building2,
      label: en ? "Buy" : "Acheter",
      detail: en ? `${saleCount} properties to explore` : `${saleCount} biens à découvrir`,
    },
    {
      href: "/louer",
      icon: KeyRound,
      label: en ? "Rent" : "Louer",
      detail: en ? `${rentalCount} rental properties` : `${rentalCount} opportunités`,
    },
    {
      href: "/acheter?vue=carte",
      icon: MapIcon,
      label: en ? "Explore the map" : "Explorer la carte",
      detail: en ? "Find your neighbourhood" : "Voir les biens par zone",
    },
    {
      href: "/deposer-un-bien",
      icon: ShieldCheck,
      label: en ? "Sell my property" : "Vendre mon bien",
      detail: en ? "Valuation and listing" : "Estimer et mettre en vente",
    },
  ];

  return (
    <>
      <HomeHero locale={locale} typeOptions={typeOptions} zoneOptions={zoneOptions} resultCount={saleCount} />

      <section className="border-b border-[var(--color-border)] bg-[var(--color-bg-alt)] py-6 md:py-8">
        <div className="container-luxe grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {shortcuts.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={en && item.icon === MapIcon ? "/en/areas" : href(item.href)}
                className="group flex min-h-24 items-center gap-4 rounded-[14px] border border-[var(--color-border)] bg-white/75 px-5 py-4 transition-[background-color,border-color,transform] hover:-translate-y-0.5 hover:border-[var(--color-accent)] hover:bg-white"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--color-beige)] text-[var(--color-accent-deep)]">
                  <Icon size={18} strokeWidth={1.5} />
                </span>
                <span className="min-w-0">
                  <span className="block font-serif text-lg text-[var(--color-charcoal)]">
                    {item.label}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-[var(--color-stone)]">
                    {item.detail}
                  </span>
                </span>
                <ArrowRight
                  size={14}
                  className="ml-auto shrink-0 text-[var(--color-accent)] transition-transform group-hover:translate-x-1"
                />
              </Link>
            );
          })}
        </div>
      </section>

      {featuredProperties.length === 3 && (
        <section id="selection" className="bg-[var(--color-cream)] py-20 md:py-28">
          <div className="container-luxe">
            <FadeInOnScroll as="div" className="flex items-end justify-between gap-8">
              <div>
                <div className="eyebrow">{en ? "Discover our selection" : "À découvrir maintenant"}</div>
                <h2 className="mt-4 max-w-2xl font-serif text-3xl leading-tight text-[var(--color-charcoal)] md:text-5xl">
                  {en ? "Three properties worth a closer look." : "Trois biens qui méritent votre attention."}
                </h2>
              </div>
              <Link
                href={href("/acheter")}
                className="group hidden items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-charcoal)] transition-colors hover:text-[var(--color-accent)] sm:inline-flex"
              >
                {en ? "View the full selection" : "Voir toute la sélection"}
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </FadeInOnScroll>
            <div className="mt-10 grid gap-7 md:mt-12 md:grid-cols-3">
              {featuredProperties.map((property, index) => (
                en ? <EnglishPropertyCard key={property.slug} property={property} /> : <PropertyCard
                  key={property.slug}
                  property={property}
                  priority={index === 0}
                />
              ))}
            </div>
            <Link href={href("/acheter")} className="btn-outline mt-8 w-full sm:hidden">
              {en ? "View the full selection" : "Voir toute la sélection"}
              <ArrowRight size={15} />
            </Link>
          </div>
        </section>
      )}

      <section id="destinations" className="bg-white py-20 md:py-28">
        <div className="container-luxe">
          <FadeInOnScroll as="div" className="flex items-end justify-between gap-8">
            <div>
              <div className="eyebrow">{en ? "Find your place" : "Choisir un cadre de vie"}</div>
              <h2 className="mt-4 font-serif text-3xl text-[var(--color-charcoal)] md:text-5xl">
                {en ? "Explore our destinations." : "Les destinations essentielles."}
              </h2>
            </div>
            <Link
              href={href("/quartiers")}
              className="group hidden items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-charcoal)] transition-colors hover:text-[var(--color-accent)] sm:inline-flex"
            >
              {en ? "All areas" : "Tous les quartiers"}
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </FadeInOnScroll>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {destinationCards.map((destination, index) =>
              destination ? (
                <Link
                  key={destination.slug}
                  href={href(`/quartiers/${destination.slug}`)}
                  className={`group relative min-h-64 overflow-hidden rounded-[16px] ${
                    index === 0 ? "lg:col-span-2" : ""
                  }`}
                >
                  <Image
                    src={destination.imageHero}
                    alt={`${destination.name}, ${destination.city}`}
                    fill
                    quality={55}
                    sizes={index === 0 ? "(max-width: 1024px) 100vw, 66vw" : "(max-width: 1024px) 50vw, 33vw"}
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.035]"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-[rgba(32,27,23,0.72)] via-transparent to-transparent" />
                  <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 text-white">
                    <span>
                      <span className="block font-serif text-2xl">{destination.name}</span>
                      <span className="mt-1 block text-[10px] uppercase tracking-[0.22em] text-white/75">
                        {destination.city} · {destination.count} {en ? "properties" : "biens"}
                      </span>
                    </span>
                    <span className="grid size-9 place-items-center rounded-full border border-white/50 bg-white/10 backdrop-blur-sm transition-colors group-hover:bg-white group-hover:text-[var(--color-charcoal)]">
                      <ArrowRight size={15} />
                    </span>
                  </span>
                </Link>
              ) : null
            )}
            {essaouiraProperty?.images[0] && (
              <Link
                href={href("/essaouira")}
                className="group relative min-h-64 overflow-hidden rounded-[16px]"
              >
                <Image
                  src={essaouiraProperty.images[0]}
                  alt={en ? "Essaouira and its medina on the Atlantic coast" : "Essaouira et sa médina face à l’Atlantique"}
                  fill
                  quality={55}
                  sizes="(max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.035]"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-[rgba(32,27,23,0.72)] via-transparent to-transparent" />
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 text-white">
                  <span>
                    <span className="block font-serif text-2xl">Essaouira</span>
                    <span className="mt-1 block text-[10px] uppercase tracking-[0.22em] text-white/75">
                      {en ? "Atlantic coast" : "Cité des Alizés"} · {essaouiraProperties.length} {en ? "properties" : "biens"}
                    </span>
                  </span>
                  <span className="grid size-9 place-items-center rounded-full border border-white/50 bg-white/10 backdrop-blur-sm transition-colors group-hover:bg-white group-hover:text-[var(--color-charcoal)]">
                    <ArrowRight size={15} />
                  </span>
                </span>
              </Link>
            )}
          </div>
        </div>
      </section>

      <section id="reperes" className="border-y border-[var(--color-border)] bg-[var(--color-bg-alt)] py-16 md:py-20">
        <div className="container-luxe grid gap-10 md:grid-cols-[1fr_1.25fr] md:items-center">
          <FadeInOnScroll as="div">
            <div className="eyebrow">{en ? "A clearer picture" : "Des repères concrets"}</div>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-[var(--color-charcoal)] md:text-4xl">
              {en ? "Local knowledge. A clear selection." : "Une sélection lisible, ancrée sur le terrain."}
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-[var(--color-stone)] md:text-base">
              {en ? "Identifiable properties, prices where provided, and direct access to the areas that matter to you." : "Des biens identifiés, des prix affichés quand ils sont communiqués et un accès direct aux zones qui comptent."}
            </p>
          </FadeInOnScroll>
          <div className="grid grid-cols-3 overflow-hidden rounded-[16px] border border-[var(--color-border)] bg-white">
            {[
              { value: saleCount, label: en ? "properties for sale" : "biens à vendre" },
              { value: zoneOptions.length, label: en ? "active areas" : "zones actives" },
              { value: "2000", label: en ? "established" : "maison fondée" },
            ].map((proof, index) => (
              <div
                key={proof.label}
                className={`px-3 py-7 text-center md:px-6 md:py-9 ${
                  index > 0 ? "border-l border-[var(--color-border)]" : ""
                }`}
              >
                <div className="font-serif text-3xl text-[var(--color-accent-deep)] md:text-5xl">
                  {proof.value}
                </div>
                <div className="mt-2 text-[9px] uppercase tracking-[0.18em] text-[var(--color-stone)] md:text-[10px]">
                  {proof.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="confier" className="bg-white py-16 md:py-24">
        <div className="container-luxe">
          <div className="grid overflow-hidden rounded-[18px] border border-[var(--color-border)] bg-[var(--color-beige)] md:grid-cols-[1.35fr_0.65fr]">
            <div className="p-8 md:p-14">
              <div className="eyebrow">{en ? "Property owners" : "Propriétaires"}</div>
              <h2 className="mt-4 max-w-2xl font-serif text-3xl leading-tight text-[var(--color-charcoal)] md:text-5xl">
                {en ? "Thinking of selling your property?" : "Vous avez un bien à vendre ?"}
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-[var(--color-stone)] md:text-base">
                {en ? "Villa, riad, apartment or land: let’s discuss your property in Marrakech or Essaouira. You don’t need a final asking price or photos to start a conversation." : "Villa, riad, appartement ou terrain : parlons de votre projet à Marrakech ou Essaouira. Pas besoin d’avoir déjà fixé un prix ou préparé des photos."}
              </p>
            </div>
            <div className="flex flex-col justify-center gap-4 border-t border-[var(--color-border)] bg-white/45 p-8 md:border-l md:border-t-0 md:p-10">
              <Link href={href("/deposer-un-bien")} className="btn-gold w-full justify-center">
                {en ? "Tell us about your property" : "Présenter mon bien"}
                <ArrowRight size={15} />
              </Link>
              <Link href={href("/contact")} className="btn-outline w-full justify-center">
                {en ? "Talk to an advisor" : "Parler à un conseiller"}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
