import Image from "next/image";
import Link from "next/link";
import {
 ArrowRight,
 Bath,
 BedDouble,
 Calendar,
 Hash,
 Map as MapIcon,
 MapPin,
 Maximize,
 Phone,
 Trees,
 Waves,
} from "lucide-react";
import {
 formatMad,
 formatPrice,
 propertyTypeLabel,
 STATUS_LABELS,
 type Property,
} from "@/data/properties";
import { getAdvisor, getSimilarProperties } from "@/lib/db";
import PropertyCard from "@/components/PropertyCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import BackToList from "@/components/BackToList";
import FavoriteButton from "@/components/FavoriteButton";
import CompareToggleButton from "@/components/CompareToggleButton";
import PropertyGallery from "@/components/PropertyGallery";
import ShareButton from "@/components/ShareButton";
import StickyContactBar from "@/components/StickyContactBar";
import PriceDisplay from "@/components/PriceDisplay";
import MoroccoFeesCalculator from "@/components/MoroccoFeesCalculator";

export default async function PropertyDetail({ property }: { property: Property }) {
 const [advisor, similar] = await Promise.all([
 getAdvisor(property.advisorSlug),
 getSimilarProperties(property),
 ]);
 const hero = property.images[0];
 const isLocation = property.listing !== "vente";

 const ldjson = {
 "@context": "https://schema.org",
 "@type": "RealEstateListing",
 name: property.title,
 description: property.shortDescription,
 image: property.images,
 url: `https://marrakechrealty.com/${isLocation ? "louer" : "acheter"}/${property.slug}`,
 offers: {
 "@type": "Offer",
 price: property.price,
 priceCurrency: property.currency,
 },
 address: {
 "@type": "PostalAddress",
 addressLocality: property.city,
 addressRegion: property.neighborhood,
 addressCountry: "MA",
 },
 geo: {
 "@type": "GeoCoordinates",
 latitude: property.coordinates.lat,
 longitude: property.coordinates.lng,
 },
 numberOfRooms: property.bedrooms,
 floorSize: { "@type": "QuantitativeValue", value: property.surface, unitCode: "MTK" },
 };

 const backHref = isLocation ? "/louer" : "/acheter";
 const backLabel = isLocation ? "Retour aux biens à louer" : "Retour aux biens à vendre";
 const priceLabel = !isLocation
 ? "Prix de vente"
 : property.priceUnit === "mois"
 ? "Loyer mensuel"
 : "À partir de";

 const demanderHref = `/contact?property=${encodeURIComponent(property.slug)}`;
 const formattedPrice = formatPrice(
 property.price,
 property.listing,
 property.currency,
 property.priceUnit
 );

 return (
 <article className="bg-white">
 <StickyContactBar
 propertyTitle={property.title}
 propertyReference={property.reference}
 priceLabel={formattedPrice}
 advisor={advisor}
 demanderHref={demanderHref}
 />

 {/* HERO */}
 <section className="relative h-[88vh] min-h-[640px] w-full overflow-hidden bg-[var(--color-charcoal)]">
 <Image
 src={hero}
 alt={property.title}
 fill
 priority
 sizes="100vw"
 className="object-cover animate-ken-burns"
 />
 <div className="absolute inset-0 hero-overlay-bottom" />

 <div className="absolute inset-x-0 top-[92px] z-10 lg:top-[116px]">
 <div className="container-luxe flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
 <BackToList fallbackHref={backHref} fallbackLabel={backLabel} variant="dark" />
 <Breadcrumbs
 variant="dark"
 items={[
 { label: "Accueil", href: "/" },
 { label: isLocation ? "Louer" : "Acheter", href: backHref },
 {
 label: propertyTypeLabel(property.type),
 href: isLocation ? backHref : `/acheter/${property.type}`,
 },
 { label: property.neighborhood },
 ]}
 />
 </div>
 </div>

 <div className="absolute inset-x-0 bottom-0 z-10 pb-16">
 <div className="container-luxe">
 <div className="flex flex-wrap items-center gap-3 text-white/90">
 {/* Status badge — affiché en premier si pertinent */}
 {property.status && property.status !== "available" && (
 <span
 className={`px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.28em] ${
 property.status === "new"
 ? "bg-[var(--color-terracotta)] text-white"
 : "bg-white text-[var(--color-charcoal)]"
 }`}
 >
 {STATUS_LABELS[property.status]}
 </span>
 )}
 {property.exclusivity && (
 <span className="bg-[var(--color-terracotta)] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.28em] text-white">
 Exclusivité agence
 </span>
 )}
 <span className="border border-white/40 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.28em]">
 {propertyTypeLabel(property.type)}
 </span>
 <span className="text-[11px] font-medium uppercase tracking-[0.28em]">
 {property.neighborhood}, {property.city}
 </span>
 <span className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/60">
 Réf. {property.reference}
 </span>
 <div className="ml-auto hidden items-center gap-2 md:flex">
 <FavoriteButton slug={property.slug} variant="hero" />
 <CompareToggleButton slug={property.slug} variant="hero" />
 <ShareButton
 url={`${isLocation ? "/louer" : "/acheter"}/${property.slug}`}
 title={property.title}
 description={property.shortDescription}
 />
 </div>
 </div>

 <h1 className="hero-text mt-6 max-w-4xl font-serif text-5xl leading-[1.05] text-white md:text-6xl lg:text-[68px]">
 {property.tagline || property.title}
 </h1>

 <div className="mt-8 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end md:gap-8">
 <div className="max-w-2xl text-base text-white/90">
 {property.tagline ? property.title : null}
 </div>
 <div className="text-left md:text-right">
 <div className="text-[10px] uppercase tracking-[0.28em] text-white/90">
 {priceLabel}
 </div>
 <div className="mt-1 font-serif text-3xl text-white md:text-4xl">
 <PriceDisplay
 priceEur={property.price}
 listing={property.listing}
 priceUnit={property.priceUnit}
 />
 </div>
 {property.priceMad && (
 <div className="mt-1 text-xs text-white/60">
 {formatMad(property.priceMad)}
 {property.listing !== "vente" &&
 ` / ${property.priceUnit ?? "mois"}`}
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* GALLERY — Client Component avec lightbox fullscreen */}
 {property.images.length > 1 && (
 <section className="bg-[var(--color-cream)] py-16">
 <div className="container-luxe mb-8">
 <div className="eyebrow">La visite</div>
 <h2 className="mt-3 font-serif text-2xl text-[var(--color-charcoal)]">
 {property.images.length} vues du bien.
 </h2>
 </div>
 <PropertyGallery images={property.images} title={property.title} />
 </section>
 )}

 {/* STORY + FACTS */}
 <section className="bg-white py-28">
 <div className="container-luxe">
 <div className="grid gap-16 lg:grid-cols-[1.6fr_1fr]">
 <div>
 {property.story.paragraphs.length > 0 ? (
 <>
 <div className="eyebrow">{property.story.eyebrow}</div>
 <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
 {property.story.title}
 </h2>
 <div className="my-8 h-px w-16 bg-[var(--color-terracotta)]" />
 <div className="space-y-6 leading-relaxed text-[var(--color-ink)]">
 {property.story.paragraphs.map((p, i) => (
 <p key={i} className={i === 0 ? "text-lg" : ""}>
 {p}
 </p>
 ))}
 </div>
 </>
 ) : property.description ? (
 <>
 <div className="eyebrow">À propos de ce bien</div>
 <h2 className="mt-4 font-serif text-3xl leading-tight md:text-4xl">
 {property.title}
 </h2>
 <div className="my-8 h-px w-16 bg-[var(--color-terracotta)]" />
 <div className="space-y-5 leading-relaxed text-[var(--color-ink)] whitespace-pre-line">
 {property.description}
 </div>
 </>
 ) : null}
 </div>

 <aside className="self-start border border-[var(--color-beige-warm)] bg-[var(--color-cream)] p-8">
 <div className="eyebrow">L&apos;essentiel</div>
 <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-7">
 {property.bedrooms > 0 && (
 <Fact icon={BedDouble} value={`${property.bedrooms}`} label="Chambres" />
 )}
 {property.bathrooms > 0 && (
 <Fact icon={Bath} value={`${property.bathrooms}`} label="Salles de bain" />
 )}
 {property.surface > 0 && (
 <Fact icon={Maximize} value={`${property.surface}`} label="m² habitables" />
 )}
 {property.landSurface && (
 <Fact
 icon={Trees}
 value={`${property.landSurface}`}
 label="m² de terrain"
 />
 )}
 {property.yearBuilt && (
 <Fact icon={Calendar} value={`${property.yearBuilt}`} label="Année" />
 )}
 {property.pool && <Fact icon={Waves} value="Oui" label="Piscine" />}
 <Fact
 icon={Hash}
 value={property.reference}
 label="Référence"
 small
 />
 </div>

 {advisor && (
 <a
 href={`tel:${advisor.phone.replace(/\s/g, "")}`}
 className="mt-8 flex items-center justify-center gap-2 border border-[var(--color-charcoal)] bg-transparent px-5 py-3 text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-charcoal)] transition-colors hover:bg-[var(--color-charcoal)] hover:text-white"
 >
 <Phone size={14} />
 Appeler le conseiller
 </a>
 )}
 </aside>
 </div>
 </div>
 </section>

 {/* FEATURES — type liste éditoriale, pas une grille d'icônes */}
 <section className="bg-[var(--color-beige)] py-20">
 <div className="container-luxe">
 <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[1fr_1.5fr]">
 <div>
 <div className="eyebrow">Prestations</div>
 <h2 className="mt-4 font-serif text-3xl leading-tight text-[var(--color-charcoal)] md:text-4xl">
 Ce que la maison contient.
 </h2>
 <div className="mt-6 text-sm leading-relaxed text-[var(--color-stone)]">
 {property.features.length} prestations notables recensées par notre
 conseiller lors de la visite initiale.
 </div>
 </div>

 <ul className="grid grid-cols-1 gap-x-10 gap-y-0 sm:grid-cols-2">
 {property.features.map((f, i) => (
 <li
 key={f}
 className={`border-b border-[var(--color-beige-warm)] py-3.5 text-[15px] text-[var(--color-charcoal)] ${
 // Retire le border-bottom sur la dernière ligne de chaque colonne
 i === property.features.length - 1 ||
 (property.features.length % 2 === 0 &&
 i === property.features.length - 2)
 ? "sm:last:border-b-0"
 : ""
 }`}
 >
 {f}
 </li>
 ))}
 </ul>
 </div>
 </div>
 </section>

 {/* NEIGHBORHOOD */}
 {property.walkingDistances && property.walkingDistances.length > 0 && (
 <section className="bg-white py-24">
 <div className="container-luxe grid gap-16 lg:grid-cols-[1fr_1fr]">
 <div>
 <div className="eyebrow">Le quartier</div>
 <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
 {property.neighborhood}.
 </h2>
 <div className="my-8 h-px w-16 bg-[var(--color-terracotta)]" />
 <p className="text-lg leading-relaxed text-[var(--color-stone)]">
 À deux pas des lieux qui font {property.city} — voici les principaux
 repères depuis la porte d&apos;entrée du bien.
 </p>
 <Link
 href={`/quartiers/${property.neighborhoodSlug}`}
 className="mt-8 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.18em] text-[var(--color-charcoal)] hover:text-[var(--color-terracotta)]"
 >
 Découvrir {property.neighborhood}
 <ArrowRight size={16} />
 </Link>
 </div>

 <div className="border border-[var(--color-beige-warm)]">
 <a
 href={`https://www.google.com/maps?q=${property.coordinates.lat},${property.coordinates.lng}&z=15`}
 target="_blank"
 rel="noopener noreferrer"
 className="group relative block aspect-[4/3] overflow-hidden"
 aria-label={`Voir ${property.neighborhood} sur Google Maps`}
 >
 {/* Carte stylisée façon plan : motif point au centre + grille de papier */}
 <div className="absolute inset-0 bg-[var(--color-beige)]" />
 <div
 aria-hidden
 className="absolute inset-0 opacity-[0.35]"
 style={{
 backgroundImage:
 "linear-gradient(var(--color-beige-warm) 1px, transparent 1px), linear-gradient(90deg, var(--color-beige-warm) 1px, transparent 1px)",
 backgroundSize: "32px 32px",
 }}
 />
 {/* Pin au centre */}
 <div className="absolute inset-0 flex items-center justify-center">
 <div className="relative">
 <div className="absolute -inset-6 animate-pulse rounded-full bg-[var(--color-terracotta)]/15" />
 <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-terracotta)] text-white shadow-[0_4px_18px_rgba(148,91,44,0.4)]">
 <MapPin size={20} fill="white" strokeWidth={1.5} />
 </div>
 </div>
 </div>
 {/* Coordonnées en bas-gauche */}
 <div className="absolute bottom-3 left-3 bg-white/90 px-3 py-1.5 backdrop-blur-sm">
 <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
 {property.coordinates.lat.toFixed(4)},{" "}
 {property.coordinates.lng.toFixed(4)}
 </div>
 </div>
 {/* CTA Google Maps en haut-droite */}
 <div className="absolute right-3 top-3 flex items-center gap-1.5 bg-[var(--color-charcoal)]/85 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
 <MapIcon size={12} />
 Ouvrir Google Maps
 </div>
 </a>
 <ul className="divide-y divide-[var(--color-beige-warm)]">
 {property.walkingDistances.map((d) => (
 <li
 key={d.label}
 className="flex items-center justify-between p-4"
 >
 <span className="flex items-center gap-3 text-sm text-[var(--color-charcoal)]">
 <MapPin size={14} className="text-[var(--color-terracotta)]" />
 {d.label}
 </span>
 <span className="text-xs uppercase tracking-[0.18em] text-[var(--color-stone)]">
 {d.minutes} min
 </span>
 </li>
 ))}
 </ul>
 </div>
 </div>
 </section>
 )}

 {/* ADVISOR — carte éditoriale type "interlocuteur dédié" (Christie's / Knight Frank) */}
 {advisor && (
 <section className="bg-[var(--color-cream)] py-28">
 <div className="container-luxe">
 <div className="mx-auto max-w-5xl">
 <div className="grid gap-12 md:grid-cols-[280px_1fr] md:gap-16 lg:grid-cols-[320px_1fr]">
 {/* Portrait */}
 <div>
 <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-beige)]">
 {advisor.photo ? (
 <Image
 src={advisor.photo}
 alt={advisor.name}
 fill
 sizes="(max-width: 768px) 100vw, 320px"
 className="object-cover"
 />
 ) : (
 <div className="flex h-full w-full items-center justify-center font-serif text-6xl tracking-[0.04em] text-[var(--color-charcoal)]">
 {advisor.name.split(/\s+/).filter(Boolean).map((s) => s[0].toUpperCase()).slice(0, 2).join("")}
 </div>
 )}
 </div>
 <div className="mt-5 border-t border-[var(--color-beige-warm)] pt-4 font-serif text-2xl text-[var(--color-charcoal)]">
 {advisor.name}
 </div>
 <div className="mt-1 text-[10px] uppercase tracking-[0.28em] text-[var(--color-stone)]">
 {advisor.role.split("—")[1]?.trim() ?? advisor.role}
 </div>
 </div>

 {/* Contenu */}
 <div className="flex flex-col">
 <div className="text-[10px] font-medium uppercase tracking-[0.32em] text-[var(--color-terracotta)]">
 Pour ce bien — votre interlocuteur
 </div>

 <p className="mt-6 font-serif text-2xl leading-relaxed text-[var(--color-charcoal)] md:text-3xl">
 «&nbsp;J&apos;ai visité ce bien à plusieurs reprises. Pour en comprendre
 la valeur, je vous propose d&apos;y venir avec moi — et, si vous le
 souhaitez, d&apos;y faire intervenir l&apos;un de nos partenaires
 (architecte, notaire, paysagiste).&nbsp;»
 </p>

 <div className="mt-8 text-sm leading-relaxed text-[var(--color-stone)]">
 {advisor.yearsExperience} ans à {property.city} — {advisor.speciality}.
 Disponible en {advisor.languages.join(", ")}.
 </div>

 {/* Coordonnées discrètes — calling card */}
 <dl className="mt-10 grid grid-cols-1 gap-x-12 gap-y-4 border-t border-[var(--color-beige-warm)] pt-8 sm:grid-cols-3">
 <div>
 <dt className="text-[9px] uppercase tracking-[0.28em] text-[var(--color-stone)]">
 Direct
 </dt>
 <dd className="mt-2">
 <a
 href={`tel:${advisor.phone.replace(/\s/g, "")}`}
 className="font-serif text-[15px] text-[var(--color-charcoal)] transition-colors hover:text-[var(--color-terracotta)]"
 >
 {advisor.phone}
 </a>
 </dd>
 </div>
 <div>
 <dt className="text-[9px] uppercase tracking-[0.28em] text-[var(--color-stone)]">
 Messagerie
 </dt>
 <dd className="mt-2">
 <a
 href={`https://wa.me/${advisor.whatsapp}?text=${encodeURIComponent(
 `Bonjour ${advisor.name.split(" ")[0]}, je vous écris au sujet du bien réf. ${property.reference}.`
 )}`}
 target="_blank"
 rel="noopener noreferrer"
 className="font-serif text-[15px] text-[var(--color-charcoal)] transition-colors hover:text-[var(--color-terracotta)]"
 >
 WhatsApp
 </a>
 </dd>
 </div>
 <div>
 <dt className="text-[9px] uppercase tracking-[0.28em] text-[var(--color-stone)]">
 Email
 </dt>
 <dd className="mt-2">
 <a
 href={`mailto:${advisor.email}?subject=${encodeURIComponent(`Réf. ${property.reference} — ${property.title}`)}`}
 className="font-serif text-[15px] text-[var(--color-charcoal)] transition-colors hover:text-[var(--color-terracotta)]"
 >
 {advisor.email.split("@")[0]}@…
 </a>
 </dd>
 </div>
 </dl>

 {/* CTA unique */}
 <div className="mt-10">
 <Link
 href="/contact"
 className="inline-flex items-center gap-3 border border-[var(--color-charcoal)] bg-[var(--color-charcoal)] px-8 py-4 text-sm font-medium uppercase tracking-[0.22em] text-white transition-colors hover:bg-[var(--color-terracotta)] hover:border-[var(--color-terracotta)]"
 >
 Organiser une visite privée
 <ArrowRight size={14} />
 </Link>
 </div>
 </div>
 </div>
 </div>
 </div>
 </section>
 )}

 {/* CALCULETTE FRAIS MAROC — seulement pour les ventes */}
 {property.listing === "vente" && (
 <section className="bg-white py-20">
 <div className="container-luxe max-w-3xl">
 <MoroccoFeesCalculator initialPrice={property.price} compact />
 </div>
 </section>
 )}

 {/* SIMILAR */}
 {similar.length > 0 && (
 <section className="bg-[var(--color-cream)] py-24">
 <div className="container-luxe">
 <div className="text-center">
 <div className="eyebrow">À découvrir aussi</div>
 <h2 className="mt-4 font-serif text-3xl md:text-4xl">Biens similaires.</h2>
 <div className="gold-rule" />
 </div>
 <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
 {similar.map((p) => (
 <PropertyCard key={p.slug} property={p} />
 ))}
 </div>
 </div>
 </section>
 )}

 <script
 type="application/ld+json"
 dangerouslySetInnerHTML={{ __html: JSON.stringify(ldjson) }}
 />
 </article>
 );
}

function Fact({
 icon: Icon,
 value,
 label,
 small = false,
}: {
 icon: React.ElementType;
 value: string;
 label: string;
 small?: boolean;
}) {
 return (
 <div>
 <div className="flex items-center gap-2 text-[var(--color-terracotta)]">
 <Icon size={14} />
 <span className="text-[10px] font-medium uppercase tracking-[0.18em]">
 {label}
 </span>
 </div>
 <div
 className={`mt-1 font-serif text-[var(--color-charcoal)] ${
 small ? "text-base" : "text-2xl"
 }`}
 >
 {value}
 </div>
 </div>
 );
}
