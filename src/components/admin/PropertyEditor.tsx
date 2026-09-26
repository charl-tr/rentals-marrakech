"use client";

import { useActionState, useEffect, useState } from "react";
import { savePropertyDetails } from "@/lib/actions/property-editor";
import type { MutationState } from "@/lib/actions/_core/defineMutation";
import { EDITOR_GROUPS, EDITOR_LABELS } from "@/lib/property-editor";
import { ALL_TYPES, propertyTypeLabel } from "@/data/properties";
import { TRANSACTION_LABELS } from "@/lib/admin-inventory";

type Option = { value: string; label: string };
const numbers = new Set(["price_eur", "price_mad", "bedrooms", "bathrooms", "surface", "land_surface", "year_built"]);
const multiline = new Set(["description", "short_description", "features", "images", "seo_description"]);

export default function PropertyEditor({ values, neighborhoods, advisors }: {
  values: Record<string, string>;
  neighborhoods: Option[];
  advisors: Option[];
}) {
  const [state, action, pending] = useActionState<MutationState, FormData>(savePropertyDetails, { status: "idle" });
  const [dirty, setDirty] = useState(false);
  const [propertyType, setPropertyType] = useState(values.type);
  const [listing, setListing] = useState(values.listing);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    const guardLink = (event: MouseEvent) => {
      const link = (event.target as Element).closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
      const destination = new URL(link.href, window.location.href);
      if (destination.pathname === window.location.pathname && destination.search === window.location.search && destination.hash) return;
      if (!window.confirm("Quitter sans enregistrer les modifications de cette fiche ?")) { event.preventDefault(); event.stopPropagation(); }
    };
    window.addEventListener("beforeunload", warn);
    document.addEventListener("click", guardLink, true);
    return () => { window.removeEventListener("beforeunload", warn); document.removeEventListener("click", guardLink, true); };
  }, [dirty]);
  const options: Record<string, Option[]> = {
    type: ALL_TYPES.map((value) => ({ value, label: propertyTypeLabel(value) })),
    listing: Object.entries(TRANSACTION_LABELS).map(([value, label]) => ({ value, label })),
    neighborhood_slug: [{ value: "", label: "Non renseigné" }, ...neighborhoods],
    advisor_slug: [{ value: "", label: "Non attribué" }, ...advisors],
    price_unit: [{ value: "", label: "Sans période / à confirmer" }, { value: "mois", label: "Par mois" }, { value: "semaine", label: "Par semaine" }],
    pool: [{ value: "false", label: "Non" }, { value: "true", label: "Oui" }],
    exclusivity: [{ value: "false", label: "Non" }, { value: "true", label: "Oui" }],
  };
  const inputClass = "mt-1.5 w-full rounded-[10px] border border-[var(--color-beige-warm)] bg-white px-3 py-2.5 text-sm text-[var(--color-charcoal)] focus:border-[var(--color-terracotta)] focus:outline-none focus:ring-1 focus:ring-[var(--color-terracotta)]";

  return <section id="modifier" className="mt-8 rounded-[14px] border border-[var(--color-beige-warm)] bg-[var(--color-cream)] p-5 md:p-6">
    <h2 className="font-serif text-2xl">Modifier la fiche</h2>
    <p className="mt-2 text-sm text-[var(--color-stone)]">Tous les champs restent accessibles, même non renseignés. Laissez une caractéristique vide si elle est inconnue ; 0 est une valeur explicite. Les changements ne sont appliqués qu’après enregistrement.</p>
    <form action={action} onChange={(event) => {
      const form = event.currentTarget;
      const data = new FormData(form);
      setDirty(Object.keys(values).some((key) => String(data.get(key) ?? "") !== values[key]));
      setPropertyType(String(data.get("type")));
      setListing(String(data.get("listing")));
    }} className="mt-5">
      <input type="hidden" name="slug" value={values.slug} />
      <input type="hidden" name="updated_at" value={values.updated_at} />
      <fieldset disabled={pending}>
        {EDITOR_GROUPS.map((group, index) => <details key={group.title} open={index < 2 || (state.status === "error" && group.fields.some((name) => state.fieldErrors?.[name]))} className="border-t border-[var(--color-beige-warm)] py-4">
          <summary className="cursor-pointer text-base font-medium">{group.title}</summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.fields.map((name) => {
              const errors = state.status === "error" ? state.fieldErrors?.[name] : undefined;
              const common = { id: `edit-${name}`, name, defaultValue: values[name] ?? "", className: inputClass, "aria-invalid": !!errors, "aria-describedby": errors ? `error-${name}` : undefined };
              return <div key={name} className={multiline.has(name) ? "sm:col-span-2 lg:col-span-3" : ""}>
                <label htmlFor={common.id} className="text-sm font-medium">{EDITOR_LABELS[name]}</label>
                {options[name] ? <select {...common}>{options[name].map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
                  : multiline.has(name) ? <textarea {...common} rows={name === "description" || name === "images" ? 7 : 3} />
                  : <input {...common} type={numbers.has(name) ? "number" : "text"} min={numbers.has(name) ? 0 : undefined} step={numbers.has(name) ? 1 : undefined} required={["title", "reference", "city"].includes(name)} placeholder="Non renseigné" />}
                {errors && <p id={`error-${name}`} className="mt-1 text-sm text-red-700">{errors.join(" ")}</p>}
              </div>;
            })}
          </div>
          {index === 0 && <p className="mt-3 text-xs text-[var(--color-stone)]">La catégorie et le quartier pilotent les filtres ; leurs libellés affichés peuvent être précisés séparément.</p>}
          {index === 1 && <p className="mt-3 text-xs text-[var(--color-stone)]">{listing === "vente" ? "La période du loyer n’est pas utilisée pour une vente." : "Précisez la période pour rendre le tarif compréhensible."} {propertyType === "terrain" && "Pour un terrain non bâti, laissez les chambres, salles de bain et l’année de construction vides."}</p>}
          {index === 2 && <p className="mt-3 text-xs text-[var(--color-stone)]">Modifier la description remplace aussi l’ancienne présentation éditoriale du bien.</p>}
          {index === 3 && <p className="mt-3 text-xs text-[var(--color-stone)]">Photos déjà hébergées sur Marrakech Realty ou le stockage Supabase du projet. L’upload depuis votre ordinateur reste à ajouter. L’URL de la fiche reste protégée.</p>}
        </details>)}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button type="submit" className="rounded-[10px] bg-[var(--color-terracotta)] px-5 py-3 text-sm font-medium text-white disabled:opacity-60">{pending ? "Enregistrement…" : "Enregistrer la fiche"}</button>
          <button type="reset" onClick={() => { setDirty(false); setPropertyType(values.type); setListing(values.listing); }} className="rounded-[10px] border border-[var(--color-beige-warm)] px-4 py-3 text-sm">Annuler les modifications</button>
          {dirty && <span className="text-xs text-[var(--color-stone)]">Modifications non enregistrées</span>}
        </div>
      </fieldset>
      {state.status !== "idle" && <p role={state.status === "error" ? "alert" : "status"} className="mt-3 text-sm">{state.message}</p>}
    </form>
  </section>;
}
