import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Catalogue from "@/components/Catalogue";
import EssaouiraDestination from "@/components/EssaouiraDestination";
import { type PropertySummary } from "@/data/properties";

const ESSAOUIRA_BASE = (p: PropertySummary) => p.city === "Essaouira";

const SUB_TYPES = {
 "vente-villa": {
 eyebrow: "Essaouira · Vente villa",
 title: "Villas à vendre — Essaouira & bord de mer.",
 subtitle:
 "Villas contemporaines, riads-villas et maisons pieds dans l'eau à Diabat, Sidi Kaouki, Ghazoua et la médina d'Essaouira.",
 filter: (p: PropertySummary) => ESSAOUIRA_BASE(p) && p.type === "villa" && p.listing === "vente",
 },
 "vente-riad": {
 eyebrow: "Essaouira · Vente riad",
 title: "Riads à vendre dans la médina d'Essaouira.",
 subtitle:
 "Riads rénovés et maisons d'hôtes, derrière les remparts de la médina UNESCO.",
 filter: (p: PropertySummary) =>
 ESSAOUIRA_BASE(p) &&
 (p.type === "riad-renove" || p.type === "riad-a-renover") &&
 p.listing === "vente",
 },
 "vente-terrain": {
 eyebrow: "Essaouira · Vente terrain",
 title: "Terrains à vendre — Essaouira.",
 subtitle:
 "Découvrez les terrains proposés à Essaouira et dans ses environs.",
 filter: (p: PropertySummary) => ESSAOUIRA_BASE(p) && p.type === "terrain" && p.listing === "vente",
 },
 "location-villa": {
 eyebrow: "Essaouira · Location villa",
 title: "Villas en location — Essaouira.",
 subtitle:
 "Locations longue durée meublées et locations saisonnières en bord de mer.",
 filter: (p: PropertySummary) => ESSAOUIRA_BASE(p) && p.type === "villa" && p.listing !== "vente",
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
 ["budget", "chambres", "piscine", "tri", "quartier", "page"].forEach((k) => {
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

 return <EssaouiraDestination />;
}
