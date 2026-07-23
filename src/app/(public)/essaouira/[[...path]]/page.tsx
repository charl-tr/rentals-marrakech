import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Catalogue from "@/components/Catalogue";
import PropertyCard from "@/components/PropertyCard";
import SectionHero from "@/components/SectionHero";
import { type Property } from "@/data/properties";
import { getAllProperties, getFirstEssaouiraProperty } from "@/lib/db";

const ESSAOUIRA_BASE = (p: Property) => p.city === "Essaouira";

const SUB_TYPES = {
 "vente-villa": {
 eyebrow: "Essaouira · Vente villa",
 title: "Villas à vendre — Essaouira & bord de mer.",
 subtitle:
 "Villas contemporaines, riads-villas et maisons pieds dans l'eau à Diabat, Sidi Kaouki, Ghazoua et la médina d'Essaouira.",
 filter: (p: Property) => ESSAOUIRA_BASE(p) && p.type === "villa" && p.listing === "vente",
 },
 "vente-riad": {
 eyebrow: "Essaouira · Vente riad",
 title: "Riads à vendre dans la médina d'Essaouira.",
 subtitle:
 "Riads rénovés et maisons d'hôtes, derrière les remparts de la médina UNESCO.",
 filter: (p: Property) =>
 ESSAOUIRA_BASE(p) &&
 (p.type === "riad-renove" || p.type === "riad-a-renover") &&
 p.listing === "vente",
 },
 "vente-terrain": {
 eyebrow: "Essaouira · Vente terrain",
 title: "Terrains constructibles — Essaouira.",
 subtitle:
 "Parcelles à bâtir à Diabat, Ghazoua et alentours d'Essaouira, sous titres fonciers garantis.",
 filter: (p: Property) => ESSAOUIRA_BASE(p) && p.type === "terrain" && p.listing === "vente",
 },
 "location-villa": {
 eyebrow: "Essaouira · Location villa",
 title: "Villas en location — Essaouira.",
 subtitle:
 "Locations longue durée meublées et locations saisonnières en bord de mer.",
 filter: (p: Property) => ESSAOUIRA_BASE(p) && p.type === "villa" && p.listing !== "vente",
 },
} as const;

type SubKey = keyof typeof SUB_TYPES;

function isSubKey(s: string): s is SubKey {
 return s in SUB_TYPES;
}

export async function generateMetadata({
 params,
}: {
 params: Promise<{ path?: string[] }>;
}): Promise<Metadata> {
 const { path = [] } = await params;
 if (path.length === 0) {
 return {
 title: "Essaouira & bord de mer — Marrakech Realty",
 description:
 "Riads, villas et terrains à Essaouira, Diabat et bord de mer atlantique. Notre sélection confidentielle.",
 alternates: { canonical: "/essaouira" },
 };
 }
 if (path.length === 1 && isSubKey(path[0])) {
 const sub = SUB_TYPES[path[0]];
 return {
 title: `${sub.title} — Marrakech Realty`,
 description: sub.subtitle,
 alternates: { canonical: `/essaouira/${path[0]}` },
 };
 }
 return { title: "Essaouira — Marrakech Realty" };
}

export default async function EssaouiraPage({
 params,
 searchParams,
}: {
 params: Promise<{ path?: string[] }>;
 searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
 const { path = [] } = await params;
 const sp = await searchParams;

 // Sub-route → catalogue prefiltré
 if (path.length === 1 && isSubKey(path[0])) {
 const sub = SUB_TYPES[path[0]];
 const selected: Record<string, string | undefined> = {};
 ["budget", "chambres", "piscine", "tri", "quartier"].forEach((k) => {
 const v = sp[k];
 if (typeof v === "string") selected[k] = v;
 });
 return (
 <Catalogue
 eyebrow={sub.eyebrow}
 title={sub.title}
 subtitle={sub.subtitle}
 prefilter={sub.filter}
 baseHref={`/essaouira/${path[0]}`}
 selectedFilters={selected}
 visibleFilters={{ budget: true, bedrooms: path[0] !== "vente-terrain" }}
 />
 );
 }

 if (path.length > 0) notFound();

 // Hub Essaouira
 const allProperties = await getAllProperties();
 const essaouiraProperties = allProperties.filter(ESSAOUIRA_BASE);
 const featured = essaouiraProperties.find((p) => p.featured) ?? essaouiraProperties[0];
 const heroSource = featured ?? (await getFirstEssaouiraProperty());
 const heroImage = heroSource?.images[0];

 return (
 <>
 {/* HERO — via SectionHero (langage hero unifié) */}
 <SectionHero
 eyebrow="Bord de mer · Cité des Alizés"
 title={
 <>
 Essaouira,<br />
 <span className="italic text-[var(--color-accent-light)]">
 l&apos;autre Maroc
 </span>
 .
 </>
 }
 subtitle="À trois heures de Marrakech, la cité des Alizés conjugue médina UNESCO, plages infinies et douceur de vivre. Notre département dédié, conduit par Hamza Bennouna, vous accompagne sur chaque transaction."
 imageSrc={heroImage}
 imageAlt={heroSource?.title ?? "Essaouira — cité des Alizés"}
 showBack={false}
 />

 {/* SOUS-CATÉGORIES */}
 <section className="bg-[var(--color-cream)] py-24">
 <div className="container-luxe">
 <div className="text-center">
 <div className="eyebrow">Quatre portes d&apos;entrée</div>
 <h2 className="mt-4 font-serif text-3xl md:text-4xl">
 Choisir son projet à Essaouira.
 </h2>
 <div className="gold-rule" />
 </div>

 <div className="mt-16 grid gap-px bg-[var(--color-beige-warm)] md:grid-cols-2 lg:grid-cols-4">
 {(Object.keys(SUB_TYPES) as SubKey[]).map((key) => (
 <Link
 key={key}
 href={`/essaouira/${key}`}
 className="group flex flex-col items-start rounded-[14px] bg-white p-8 transition-colors hover:bg-[var(--color-beige)]"
 >
 <div className="text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--color-terracotta)]">
 {SUB_TYPES[key].eyebrow.split("·")[1]?.trim()}
 </div>
 <h3 className="mt-4 font-serif text-2xl leading-snug text-[var(--color-charcoal)] group-hover:text-[var(--color-terracotta)]">
 {SUB_TYPES[key].title.split("—")[0]?.trim() ?? SUB_TYPES[key].title}
 </h3>
 <span className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--color-charcoal)]">
 Voir la sélection
 <ArrowRight size={14} />
 </span>
 </Link>
 ))}
 </div>
 </div>
 </section>

 {/* SELECTION ESSAOUIRA */}
 {essaouiraProperties.length > 0 && (
 <section className="bg-white py-24">
 <div className="container-luxe">
 <div className="text-center">
 <div className="eyebrow">Sélection en cours</div>
 <h2 className="mt-4 font-serif text-3xl md:text-4xl">
 Quelques biens d&apos;Essaouira.
 </h2>
 <div className="gold-rule" />
 </div>
 <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
 {essaouiraProperties.slice(0, 6).map((p) => (
 <PropertyCard key={p.slug} property={p} />
 ))}
 </div>
 </div>
 </section>
 )}

 {/* CTA conseiller */}
 {featured && (
 <section className="bg-[var(--color-charcoal)] py-20 text-white">
 <div className="container-luxe text-center">
 <div className="eyebrow">Conseil dédié</div>
 <h2 className="mt-4 font-serif text-4xl md:text-5xl">
 Hamza Bennouna est votre interlocuteur à Essaouira.
 </h2>
 <p className="mx-auto mt-6 max-w-2xl text-white/90">
 Douze ans à composer les plus belles transactions de la cité des Alizés.
 Riads, villas pieds dans l&apos;eau, terrains à bâtir : un seul appel suffit.
 </p>
 <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
 <Link href="/equipe" className="btn-outline-light">
 Le rencontrer
 </Link>
 <a
 href="https://wa.me/212660629447"
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[var(--color-accent)] px-7 py-3.5 text-sm font-medium uppercase tracking-[0.18em] text-white transition-colors hover:bg-[var(--color-accent-deep)]"
 >
 WhatsApp Essaouira
 </a>
 </div>
 </div>
 </section>
 )}
 </>
 );
}
