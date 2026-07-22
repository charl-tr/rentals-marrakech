import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, MapPin } from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import {
 getAllProperties,
 getEditorializedNeighborhoods,
 getNeighborhood,
} from "@/lib/db";
import { getDayInLife } from "@/data/neighborhood-day";

export async function generateStaticParams() {
 const all = await getEditorializedNeighborhoods();
 return all.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
 params,
}: {
 params: Promise<{ slug: string }>;
}): Promise<Metadata> {
 const { slug } = await params;
 const q = await getNeighborhood(slug);
 if (!q || !q.tagline) return { title: "Quartier introuvable — Marrakech Realty" };
 return {
 title: `${q.name}, ${q.city} — Quartier · Marrakech Realty`,
 description: q.tagline,
 alternates: { canonical: `/quartiers/${q.slug}` },
 openGraph: { title: q.name, description: q.tagline, images: [q.imageHero] },
 };
}

export default async function QuartierPage({
 params,
}: {
 params: Promise<{ slug: string }>;
}) {
 const { slug } = await params;
 const q = await getNeighborhood(slug);
 if (!q || q.paragraphs.length === 0) notFound();

 const allProperties = await getAllProperties();
 const propertiesInQuartier = allProperties.filter(
 (p) => p.neighborhoodSlug === q.slug
 );
 const day = getDayInLife(q.slug);

 return (
 <article>
 {/* HERO */}
 <section className="relative h-[88vh] min-h-[640px] w-full overflow-hidden bg-[var(--color-charcoal)]">
 <Image
 src={q.imageHero}
 alt={q.name}
 fill
 priority
 sizes="100vw"
 className="object-cover"
 />
 <div className="absolute inset-0 hero-overlay-bottom" />
 <div className="container-luxe relative z-10 flex h-full flex-col justify-between pb-20 pt-[112px]">
 <Breadcrumbs
 variant="dark"
 items={[
 { label: "Accueil", href: "/" },
 { label: "Quartiers", href: "/quartiers" },
 { label: q.name },
 ]}
 />
 <div>
 <div className="hero-text-soft text-[11px] font-medium uppercase tracking-[0.32em] text-[var(--color-terracotta-light)]">
 {q.city} — Quartier
 </div>
 <h1 className="hero-text mt-5 font-serif text-6xl leading-[1.05] text-white md:text-7xl lg:text-[88px]">
 {q.name}.
 </h1>
 <p className="hero-text-soft mt-8 max-w-2xl text-xl leading-relaxed text-white/90">
 {q.tagline}
 </p>
 </div>
 </div>
 </section>

 {/* STORY ÉDITORIAL */}
 <section className="bg-white py-28">
 <div className="container-luxe grid gap-16 lg:grid-cols-[2fr_1fr]">
 <div>
 <div className="eyebrow">Le quartier</div>
 <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
 Vivre à {q.name}.
 </h2>
 <div className="my-8 h-px w-16 bg-[var(--color-terracotta)]" />
 <div className="space-y-6 leading-relaxed text-[var(--color-ink)]">
 {q.paragraphs.map((p, i) => (
 <p key={i} className={i === 0 ? "text-lg" : ""}>
 {p}
 </p>
 ))}
 </div>
 </div>

 <aside className="self-start rounded-[14px] border border-[var(--color-beige-warm)] bg-[var(--color-cream)] p-8">
 <div className="eyebrow">À deux pas</div>
 <ul className="mt-6 space-y-5">
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
 <section className="bg-[var(--color-charcoal)] py-28 text-white">
 <div className="container-luxe max-w-4xl">
 <div className="text-[11px] font-medium uppercase tracking-[0.32em] text-[var(--color-terracotta-light)]">
 Immersion
 </div>
 <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
 Un jour à {q.name}.
 </h2>
 <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
 {day.intro}
 </p>

 <div className="mt-16 space-y-10">
 {day.schedule.map((s, i) => (
 <div
 key={i}
 className="grid gap-6 border-b border-white/10 pb-10 last:border-b-0 md:grid-cols-[140px_1fr]"
 >
 <div className="text-[11px] font-medium uppercase tracking-[0.32em] text-[var(--color-terracotta-light)]">
 {s.moment}
 </div>
 <div>
 <h3 className="font-serif text-xl leading-tight text-white md:text-2xl">
 {s.title}
 </h3>
 <p className="mt-3 text-sm leading-relaxed text-white/70 md:text-base">
 {s.description}
 </p>
 {s.place && (
 <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-white/50">
 <MapPin size={10} />
 {s.place}
 </div>
 )}
 </div>
 </div>
 ))}
 </div>

 {/* Local tips */}
 <div className="mt-20 border-t border-white/10 pt-12">
 <div className="text-[11px] font-medium uppercase tracking-[0.32em] text-[var(--color-terracotta-light)]">
 À savoir
 </div>
 <div className="mt-6 grid gap-8 md:grid-cols-3">
 {day.localTips.map((t, i) => (
 <div key={i}>
 <div className="font-serif text-base text-white">{t.label}</div>
 <p className="mt-2 text-xs leading-relaxed text-white/60">
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
 <div className="eyebrow">Sélection {q.name}</div>
 <h2 className="mt-4 font-serif text-3xl md:text-4xl">
 Nos biens à {q.name}.
 </h2>
 <div className="gold-rule" />
 </div>

 {propertiesInQuartier.length > 0 ? (
 <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
 {propertiesInQuartier.map((p) => (
 <PropertyCard key={p.slug} property={p} />
 ))}
 </div>
 ) : (
 <div className="mt-12 rounded-[14px] border border-[var(--color-beige-warm)] bg-white p-12 text-center">
 <p className="font-serif text-xl text-[var(--color-charcoal)]">
 Aucun bien actuellement disponible à {q.name}.
 </p>
 <p className="mt-3 text-sm text-[var(--color-stone)]">
 Notre portefeuille évolue chaque semaine — confiez-nous vos critères.
 </p>
 <Link href="/contact" className="btn-gold mt-8 inline-flex">
 Nous contacter
 <ArrowRight size={14} />
 </Link>
 </div>
 )}
 </div>
 </section>
 </article>
 );
}
