"use client";

import { LayoutGrid, List } from "lucide-react";
import AdminFilterBar from "./_primitives/AdminFilterBar";
import {
  ALL_TYPES,
  NEIGHBORHOODS,
  propertyTypeLabel,
  type PropertyType,
} from "@/data/properties";

export type BiensViewMode = "table" | "grid";

const STATUS_OPTIONS = [
  { value: null as string | null, label: "Tous statuts" },
  { value: "available", label: "Disponible" },
  { value: "new", label: "Nouveau" },
  { value: "reserved", label: "Sous compromis" },
  { value: "sold", label: "Vendu" },
  { value: "rented", label: "Loué" },
];

const VIS_OPTIONS = [
  { value: null as string | null, label: "Toute visibilité" },
  { value: "published", label: "Publiés" },
  { value: "unpublished", label: "Masqués" },
  { value: "featured", label: "En avant" },
];

export default function BiensFilterBar() {
  return (
    <AdminFilterBar>
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
        <AdminFilterBar.Pill param="status" label="Statut" options={STATUS_OPTIONS} />
        <AdminFilterBar.Pill
          param="type"
          label="Type"
          options={[
            { value: null, label: "Tous types" },
            ...(ALL_TYPES as readonly PropertyType[]).map((t) => ({
              value: t,
              label: propertyTypeLabel(t) + "s",
            })),
          ]}
        />
        <AdminFilterBar.Pill
          param="zone"
          label="Quartier"
          options={[
            { value: null, label: "Tous quartiers" },
            ...NEIGHBORHOODS.map((n) => ({ value: n.slug, label: n.label })),
          ]}
        />
        <AdminFilterBar.Pill param="vis" label="Visibilité" options={VIS_OPTIONS} />
        <AdminFilterBar.Reset preserve={["view"]} />
      </AdminFilterBar.Pills>
    </AdminFilterBar>
  );
}
