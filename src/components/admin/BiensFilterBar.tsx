"use client";

import { LayoutGrid, List } from "lucide-react";
import Link from "next/link";
import AdminFilterBar from "./_primitives/AdminFilterBar";
import {
  propertyTypeLabel,
  type PropertyType,
  type Listing,
} from "@/data/properties";
import { TRANSACTION_LABELS } from "@/lib/admin-inventory";

export type BiensViewMode = "table" | "grid";

const VIS_OPTIONS = [
  { value: null as string | null, label: "Toute visibilité" },
  { value: "published", label: "Publiés" },
  { value: "unpublished", label: "Masqués" },
  { value: "featured", label: "En avant" },
];

export default function BiensFilterBar({ listing, counts, types, zones }: {
  listing: Listing; counts: Record<Listing, number>; types: PropertyType[];
  zones: { slug: string; label: string }[];
}) {
  return (
    <AdminFilterBar>
      <nav aria-label="Type de transaction" className="flex flex-wrap gap-2 border-b border-[var(--color-beige-warm)] px-5 py-3 md:px-8">
        {(Object.keys(TRANSACTION_LABELS) as Listing[]).map((key) => <Link key={key} href={`/admin/biens?listing=${key}`} aria-current={listing === key ? "page" : undefined} className={`rounded-[10px] px-4 py-2 text-sm font-medium ${listing === key ? "bg-[var(--color-terracotta)] text-white" : "bg-[var(--color-cream)] text-[var(--color-charcoal)]"}`}>{TRANSACTION_LABELS[key]} <span className="ml-2 opacity-75">{counts[key]} disponibles</span></Link>)}
      </nav>
      <AdminFilterBar.Row>
        <AdminFilterBar.Search placeholder="Titre, référence, quartier, ville, description…" />
        <AdminFilterBar.Spacer />
        <AdminFilterBar.Toggle
          param="view"
          defaultValue={null}
          iconOnly
          options={[
            { value: null, icon: <List size={14} />, title: "Table" },
            { value: "grid", icon: <LayoutGrid size={14} />, title: "Grille" },
          ]}
        />
      </AdminFilterBar.Row>
      <AdminFilterBar.Pills>
        <AdminFilterBar.Toggle param="status" defaultValue={null} options={[
          { value: null, label: listing === "vente" ? "À vendre" : "À louer" },
          { value: "reserved", label: listing === "vente" ? "Sous compromis" : "Réservés" },
          { value: listing === "vente" ? "sold" : "rented", label: listing === "vente" ? "Vendus" : "Loués" },
          { value: "any", label: "Tous les biens" },
        ]} />
        <AdminFilterBar.Pill
          param="type"
          label="Type"
          options={[
            { value: null, label: "Tous types" },
            ...types.map((t) => ({
              value: t,
              label: propertyTypeLabel(t),
            })),
          ]}
        />
        <AdminFilterBar.Pill
          param="zone"
          label="Quartier"
          options={[
            { value: null, label: "Tous quartiers" },
            ...zones.map((n) => ({ value: n.slug, label: n.label })),
          ]}
        />
        <AdminFilterBar.Pill param="vis" label="Visibilité" options={VIS_OPTIONS} />
        <AdminFilterBar.Pill param="missing" label="Qualité des données" options={[
          { value: null, label: "Toutes les fiches" },
          { value: "bedrooms", label: "Chambres non renseignées" },
          { value: "bathrooms", label: "Salles de bain non renseignées" },
          { value: "surface", label: "Surface habitable non renseignée" },
          { value: "price", label: "Prix sur demande" },
          { value: "neighborhood", label: "Quartier non renseigné" },
          { value: "reference", label: "Références en doublon" },
        ]} />
        <AdminFilterBar.Pill param="sort" label="Trier" options={[
          { value: null, label: "Ajouts récents" }, { value: "price-asc", label: "Prix croissant" },
          { value: "price-desc", label: "Prix décroissant" }, { value: "surface", label: "Surface décroissante" },
          { value: "requests", label: "Plus de demandes" }, { value: "reference", label: "Référence" }, { value: "title", label: "Titre A–Z" },
        ]} />
        <AdminFilterBar.Reset preserve={["view", "listing"]} />
      </AdminFilterBar.Pills>
    </AdminFilterBar>
  );
}
