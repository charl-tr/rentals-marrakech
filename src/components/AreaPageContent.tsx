import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { languagePath } from "@/lib/i18n/routes";
import OriginalEditorialNotice from "@/components/OriginalEditorialNotice";
import { ArrowRight, MapPin } from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import {
 getCatalogueProperties,
 getNeighborhood,
} from "@/lib/db";
import { getDayInLife } from "@/data/neighborhood-day";

export default async function QuartierPage({ slug, locale = "fr" }: { slug: string; locale?: "fr" | "en" }) {
 const en = locale === "en";
 const q = await getNeighborhood(slug);
 if (!q || q.paragraphs.length === 0) notFound();

 const allProperties = await getCatalogueProperties();
 const propertiesInQuartier = allProperties.filter(
 (p) => p.neighborhoodSlug === q.slug
 );
 const day = getDayInLife(q.slug);

 return (
 <article>
 {/* HERO */}
 <section className="relative h-[62svh] min-h-[460px] w-full overflow-hidden bg-[var(--color-charcoal)] md:h-[88vh] md:min-h-[640px]">
 <Image
 src={q.imageHero}
 alt={q.name}
 fill
 preload
 sizes="100vw"
 className="object-cover"
 />
 <div className="absolute inset-0 hero-overlay-bottom" />
 <div className="container-luxe relative z-10 flex h-full flex-col justify-between pb-10 pt-20 md:pb-20 md:pt-[112px]">
 <div className="hidden sm:block">
 <Breadcrumbs locale={locale}
 variant="dark"
 items={[
 { label: en ? "Home" : "Accueil", href: languagePath("/", locale) },
 { label: en ? "Areas" : "Quartiers", href: languagePath("/quartiers", locale) },
 { label: q.name },
 ]}
 />
 </div>
 <div>
 <div className="hero-text-soft eyebrow-light">
 {q.city} — {en ? "Neighbourhood" : "Quartier"}
 </div>
 <h1 className="hero-text mt-3 font-serif text-[2.75rem] leading-[1.04] text-white md:mt-5 md:text-7xl lg:text-[88px]">
 {q.name}.
 </h1>
 <p className="hero-text-soft mt-4 max-w-2xl text-sm leading-relaxed text-white/90 md:mt-8 md:text-xl">
 <span lang="fr">{q.tagline}</span>
 </p>
 </div>
 </div>
 </section>

 <OriginalEditorialNotice locale={locale} href={`/quartiers/${slug}`} />
 {/* STORY ÉDITORIAL */}
 <section className="bg-white py-28">
 <div className="container-luxe grid gap-16 lg:grid-cols-[2fr_1fr]">
 <div>
 <div className="eyebrow">{en ? "The neighbourhood" : "Le quartier"}</div>
 <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
 {en ? "Living in" : "Vivre à"} {q.name}.
 </h2>
 <div className="my-8 h-px w-16 bg-[var(--color-terracotta)]" />
 <div lang="fr" className="space-y-6 leading-relaxed text-[var(--color-ink)]">
 {q.paragraphs.map((p, i) => (
 <p key={i} className={i === 0 ? "text-lg" : ""}>
 {p}
 </p>
 ))}
 </div>
 </div>

 <aside className="self-start rounded-[14px] border border-[var(--color-beige-warm)] bg-[var(--color-cream)] p-8">
 <div className="eyebrow">{en ? "Nearby" : "À deux pas"}</div>
 <ul lang="fr" className="mt-6 space-y-5">
 {q.highlights.map((h) => (
 <li key={h.label}>
 <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-charcoal)]">
 <MapPin size={13} className="text-[var(--color-terracotta)]" />
 {h.label}
 </div>
 <div className="mt-1 pl-5 text-xs text-[var(--color-stone)]">
 {h.description}
 </div>
 </li>
 ))}
 </ul>
 </aside>
 </div>
 </section>

 {/* UN JOUR À — mini-guide expérientiel */}
 {day && (
 <section className="border-y border-[var(--color-border)] bg-[var(--color-beige)] py-28">
 <div className="container-luxe max-w-4xl">
 <div className="eyebrow">
 Immersion
 </div>
 <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
 {en ? "A day in" : "Un jour à"} {q.name}.
 </h2>
 <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--color-stone)]">
 <span lang="fr">{day.intro}</span>
 </p>

 <div lang="fr" className="mt-16 space-y-10">
 {day.schedule.map((s, i) => (
 <div
 key={i}
 className="grid gap-6 border-b border-[var(--color-border)] pb-10 last:border-b-0 md:grid-cols-[140px_1fr]"
 >
 <div className="eyebrow">
 {s.moment}
 </div>
 <div>
 <h3 className="font-serif text-xl leading-tight text-[var(--color-charcoal)] md:text-2xl">
 {s.title}
 </h3>
 <p className="mt-3 text-sm leading-relaxed text-[var(--color-stone)] md:text-base">
 {s.description}
 </p>
 {s.place && (
 <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-[var(--color-stone)]">
 <MapPin size={10} />
 {s.place}
 </div>
 )}
 </div>
 </div>
 ))}
 </div>

 {/* Local tips */}
 <div className="mt-20 border-t border-[var(--color-border)] pt-12">
 <div className="eyebrow">
 {en ? "Local tips" : "À savoir"}
 </div>
 <div lang="fr" className="mt-6 grid gap-8 md:grid-cols-3">
 {day.localTips.map((t, i) => (
 <div key={i}>
 <div className="font-serif text-base text-[var(--color-charcoal)]">{t.label}</div>
 <p className="mt-2 text-xs leading-relaxed text-[var(--color-stone)]">
 {t.description}
 </p>
 </div>
 ))}
 </div>
 </div>
 </div>
 </section>
 )}

 {/* BIENS DU QUARTIER */}
 <section className="bg-[var(--color-cream)] py-24">
 <div className="container-luxe">
 <div className="text-center">
 <div className="eyebrow">{en ? "Selection" : "Sélection"} {q.name}</div>
 <h2 className="mt-4 font-serif text-3xl md:text-4xl">
 {en ? "Our properties in" : "Nos biens à"} {q.name}.
 </h2>
 <div className="gold-rule" />
 </div>

 {propertiesInQuartier.length > 0 ? (
 <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
 {propertiesInQuartier.map((p) => (
 <PropertyCard locale={locale} key={p.slug} property={p} />
 ))}
 </div>
 ) : (
 <div className="mt-12 rounded-[14px] border border-[var(--color-beige-warm)] bg-white p-12 text-center">
 <p className="font-serif text-xl text-[var(--color-charcoal)]">
 {en ? "No properties currently available in" : "Aucun bien actuellement disponible à"} {q.name}.
 </p>
 <p className="mt-3 text-sm text-[var(--color-stone)]">
 {en ? "Tell us what you are looking for — our portfolio changes regularly." : "Notre portefeuille évolue chaque semaine — confiez-nous vos critères."}
 </p>
 <Link href={languagePath("/contact", locale)} className="btn-gold mt-8 inline-flex">
 {en ? "Contact us" : "Nous contacter"}
 <ArrowRight size={14} />
 </Link>
 </div>
 )}
 </div>
 </section>
 </article>
 );
}
