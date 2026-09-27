"use client";
import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AdminFilterBar from "./_primitives/AdminFilterBar";
import AdminChoice from "./AdminChoice";
import { propertyTypeLabel, type PropertyType, type Listing } from "@/data/properties";
import { TRANSACTION_LABELS } from "@/lib/admin-inventory";

export type BiensViewMode = "table" | "grid";
export default function BiensFilterBar({ listing, counts, types, zones }: {
  listing: Listing; counts: Record<Listing, number>; types: PropertyType[]; zones: { slug: string; label: string }[];
}) {
  const params = useSearchParams(); const router = useRouter(); const pathname = usePathname();
  const [expanded, setExpanded] = useState(false); const [pending, startTransition] = useTransition();
  const set = (key: string, value: string) => { const next = new URLSearchParams(params.toString()); next.delete("page"); if(value) next.set(key,value); else next.delete(key); startTransition(() => router.replace(`${pathname}?${next}`, { scroll: false })); };
  const criteria = [
    { key: "type", label: "Type de bien", options: [{ value: "", label: "Tous les types" }, ...types.map(type => ({ value: type, label: propertyTypeLabel(type) }))] },
    { key: "zone", label: "Quartier", options: [{ value: "", label: "Tous les quartiers" }, ...zones.map(zone => ({ value: zone.slug, label: zone.label }))] },
    { key: "vis", label: "Visibilité", options: [{ value: "", label: "Toute visibilité" }, { value: "published", label: "En ligne" }, { value: "unpublished", label: "Masqués / brouillons" }, { value: "featured", label: "Mis en avant" }] },
    { key: "missing", label: "À compléter", options: [{ value: "", label: "Toutes les fiches" }, { value: "bedrooms", label: "Chambres manquantes" }, { value: "bathrooms", label: "Salles de bain manquantes" }, { value: "surface", label: "Surface manquante" }, { value: "price", label: "Prix sur demande" }, { value: "neighborhood", label: "Quartier manquant" }, { value: "reference", label: "Références en doublon" }] },
  ];
  const active = criteria.filter(c => params.get(c.key));
  const statuses = [{ value: "", label: listing === "vente" ? "À vendre" : "À louer" }, { value: "reserved", label: listing === "vente" ? "Sous compromis" : "Réservés" }, { value: listing === "vente" ? "sold" : "rented", label: listing === "vente" ? "Vendus" : "Loués" }, { value: "any", label: "Tous" }];
  return <div className="border-b border-[var(--color-beige-warm)] bg-white px-5 py-4 md:px-8" aria-busy={pending}>
    <nav aria-label="Transaction" className="mb-4 flex flex-wrap gap-2">
      {(Object.keys(TRANSACTION_LABELS) as Listing[]).map(key => <Link key={key} href={`/admin/biens?listing=${key}`} aria-current={listing === key ? "page" : undefined} className={`rounded-lg px-4 py-2 text-sm font-medium ${listing === key ? "bg-[#795238] text-white" : "bg-[#f7f4ee]"}`}>{TRANSACTION_LABELS[key]} <span className="ml-2 opacity-70">{counts[key]}</span></Link>)}
    </nav>
    <div className="flex flex-wrap items-center gap-3">
      <AdminFilterBar.Search placeholder="Rechercher un bien, une référence, un quartier…" />
      <div className="flex flex-wrap gap-1 rounded-lg bg-[#f7f4ee] p-1" aria-label="Statut commercial">
        {statuses.map(s => <button type="button" key={s.value} aria-pressed={(params.get("status") ?? "") === s.value} onClick={() => set("status",s.value)} className={`min-h-9 rounded-md px-3 text-sm ${(params.get("status") ?? "") === s.value ? "bg-white font-semibold text-[#795238] shadow-sm" : ""}`}>{s.label}</button>)}
      </div>
      <button type="button" aria-expanded={expanded} aria-controls="inventory-extra-filters" onClick={() => setExpanded(!expanded)} className="min-h-10 rounded-lg border border-[var(--color-beige-warm)] px-3 text-sm font-medium">{expanded ? "Réduire les filtres" : "Plus de filtres"}{active.length > 0 ? ` (${active.length})` : ""}</button>
      <AdminChoice label="Trier les biens" value={params.get("sort") ?? ""} onChange={value => set("sort",value)} options={[{ value: "", label: "Ajouts récents" }, { value: "price-asc", label: "Prix croissant" }, { value: "price-desc", label: "Prix décroissant" }, { value: "surface", label: "Surface décroissante" }, { value: "requests", label: "Plus de demandes" }, { value: "reference", label: "Référence" }, { value: "title", label: "Titre A–Z" }]} />
      <div className="flex gap-1"><button type="button" aria-pressed={params.get("view") !== "grid"} onClick={() => set("view","")} className="min-h-10 rounded-lg border px-3 text-sm aria-pressed:bg-[#795238] aria-pressed:text-white">Liste</button><button type="button" aria-pressed={params.get("view") === "grid"} onClick={() => set("view","grid")} className="min-h-10 rounded-lg border px-3 text-sm aria-pressed:bg-[#795238] aria-pressed:text-white">Grille</button></div>
    </div>
    {active.length > 0 && <div className="mt-3 flex flex-wrap gap-2" aria-label="Filtres actifs">{active.map(c => <button type="button" key={c.key} onClick={() => set(c.key,"")} className="rounded-full bg-[#f0e7dc] px-3 py-1.5 text-xs text-[#795238]">{c.label} : {c.options.find(o => o.value === params.get(c.key))?.label ?? params.get(c.key)} ×</button>)}</div>}
    {expanded && <div id="inventory-extra-filters" className="mt-4 grid gap-3 border-t border-[var(--color-beige-warm)] pt-4 sm:grid-cols-2 xl:grid-cols-4">{criteria.map(c => <div key={c.key}><p className="mb-1 text-xs text-[var(--color-stone)]">{c.label}</p><AdminChoice label={c.label} value={params.get(c.key) ?? ""} options={c.options} onChange={value => set(c.key,value)} /></div>)}</div>}
    {pending && <p role="status" className="mt-2 text-xs text-[var(--color-stone)]">Actualisation des résultats…</p>}
  </div>;
}
