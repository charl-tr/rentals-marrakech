"use client";

import { useActionState, useEffect, useState } from "react";
import { Check, Eye, Images, Save } from "lucide-react";
import { savePropertyDetails } from "@/lib/actions/property-editor";
import type { MutationState } from "@/lib/actions/_core/defineMutation";
import { EDITOR_GROUPS, EDITOR_LABELS } from "@/lib/property-editor";
import { ALL_TYPES, propertyTypeLabel } from "@/data/properties";
import { TRANSACTION_LABELS } from "@/lib/admin-inventory";
import { formatPropertyUpdatedAt } from "@/lib/property-media";
import PropertyImageGallery from "./PropertyImageGallery";

type Option = { value: string; label: string };
const numbers = new Set(["price_eur", "price_mad", "bedrooms", "bathrooms", "surface", "land_surface", "year_built"]);
const multiline = new Set(["description", "short_description", "features", "seo_description"]);

export default function PropertyEditor({ values, neighborhoods, advisors, summarySuggestion }: {
  values: Record<string, string>; neighborhoods: Option[]; advisors: Option[]; summarySuggestion?: string;
}) {
  const [state, action, pending] = useActionState<MutationState, FormData>(savePropertyDetails, { status: "idle" });
  const [draft, setDraft] = useState(values);
  const [uploading, setUploading] = useState(false);
  const [panel, setPanel] = useState<"images" | "preview">("images");
  const [resetKey, setResetKey] = useState(0);
  const [history, setHistory] = useState<Record<string, string>[]>([]);
  const [future, setFuture] = useState<Record<string, string>[]>([]);
  const dirty = Object.keys(values).some((key) => draft[key] !== values[key]);
  const images = (draft.images ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
  const update = (name: string, value: string) => {
    setHistory((previous) => [...previous.slice(-99), draft]);
    setFuture([]);
    setDraft((previous) => ({ ...previous, [name]: value }));
  };
  const travel = (back: boolean) => {
    const stack = back ? history : future;
    if (!stack.length) return;
    if (back) { setHistory(stack.slice(0, -1)); setFuture((previous) => [...previous, draft]); }
    else { setFuture(stack.slice(0, -1)); setHistory((previous) => [...previous, draft]); }
    setDraft(stack[stack.length - 1]); setResetKey((key) => key + 1);
  };
  const updated = formatPropertyUpdatedAt(values.updated_at);
  useEffect(() => {
    if (!dirty && !uploading) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    const guardLink = (event: MouseEvent) => {
      const link = (event.target as Element).closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
      const destination = new URL(link.href, window.location.href);
      if (destination.pathname === window.location.pathname && destination.search === window.location.search && destination.hash) return;
      if (!window.confirm("Quitter sans enregistrer les modifications de cette fiche ?")) { event.preventDefault(); event.stopPropagation(); }
    };
    window.addEventListener("beforeunload", warn); document.addEventListener("click", guardLink, true);
    return () => { window.removeEventListener("beforeunload", warn); document.removeEventListener("click", guardLink, true); };
  }, [dirty, uploading]);
  const options: Record<string, Option[]> = {
    type: ALL_TYPES.map((value) => ({ value, label: propertyTypeLabel(value) })),
    listing: Object.entries(TRANSACTION_LABELS).map(([value, label]) => ({ value, label })),
    neighborhood_slug: [{ value: "", label: "Non renseigné" }, ...neighborhoods],
    advisor_slug: [{ value: "", label: "Non attribué" }, ...advisors],
    price_unit: [{ value: "", label: "Sans période / à confirmer" }, { value: "mois", label: "Par mois" }, { value: "semaine", label: "Par semaine" }],
    pool: [{ value: "false", label: "Non" }, { value: "true", label: "Oui" }],
    exclusivity: [{ value: "false", label: "Non" }, { value: "true", label: "Oui" }],
  };
  const inputClass = "mt-1.5 w-full rounded-[10px] border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]";

  return <section id="modifier" className="mt-4 scroll-mt-24 rounded-[16px] border border-[var(--color-border)] bg-[var(--color-cream)]">
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-border)] p-5">
      <p className="text-xs text-[var(--color-stone)]">{updated ? `Dernière mise à jour le ${updated} · heure de Marrakech` : "Date de mise à jour non renseignée"}</p>
      <details className="text-xs text-[var(--color-stone)]"><summary className="cursor-pointer">Adresse de la fiche</summary><p className="mt-2 max-w-xl break-all">Slug protégé : <code>{values.slug}</code></p></details>
      <a href="#galerie-edition" className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm lg:hidden">Photos et aperçu ↓</a>
    </div>
    <form action={action} onSubmit={(event) => { if (uploading) event.preventDefault(); }}>
      <input type="hidden" name="slug" value={values.slug} /><input type="hidden" name="updated_at" value={values.updated_at} />
      <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <div className="min-w-0 p-5 lg:max-h-[70dvh] lg:overflow-y-auto lg:overscroll-contain lg:border-r lg:border-[var(--color-border)]" aria-label="Champs de la fiche" tabIndex={0}>
          <fieldset disabled={pending || uploading}>
            <div className="mb-5 rounded-xl border border-[var(--color-border)] bg-white p-4">
              <label htmlFor="edit-published" className="text-sm font-medium">Visibilité sur le site</label>
              <select id="edit-published" name="published" value={draft.published} onChange={(event) => update("published", event.target.value)} className={inputClass}>
                <option value="false">Brouillon — non visible</option><option value="true">Publié — visible sur le site</option>
              </select>
              <p className="mt-2 text-xs text-[var(--color-stone)]">{values.published === "true" && draft.published === "false" ? "À l’enregistrement, ce bien sera retiré du site public. Il restera accessible à l’équipe." : draft.published === "true" ? "L’enregistrement actualisera la fiche publique. L’aperçu seul ne publie rien." : "Vous pouvez compléter ce bien sans le rendre visible aux visiteurs."}</p>
            </div>
            <p className="mb-3 text-xs text-[var(--color-stone)]">Une information inconnue ? Laissez le champ vide. 0 est une valeur explicite.</p>
            {summarySuggestion && draft.short_description === values.short_description && <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">Le résumé importé contient du texte technique de l’ancien site. <button type="button" className="underline underline-offset-4" onClick={() => update("short_description", summarySuggestion)}>Le remplacer par un extrait du descriptif</button>. Vous pourrez le relire avant d’enregistrer.</div>}
            {EDITOR_GROUPS.map((group, index) => <details key={group.title} open={index < 2 || (state.status === "error" && group.fields.some((name) => state.fieldErrors?.[name]))} className="border-t border-[var(--color-border)] py-4">
              <summary className="cursor-pointer text-base font-medium">{group.title}</summary>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {group.fields.map((name) => {
                  // Keep hidden values submitted: changing category must never silently erase data.
                  if ((name === "price_unit" && draft.listing === "vente") || (draft.type === "terrain" && ["bedrooms", "bathrooms", "year_built", "pool"].includes(name) && ["", "false"].includes(draft[name] ?? ""))) {
                    return <input key={name} type="hidden" name={name} value={draft[name] ?? ""} />;
                  }
                  const errors = state.status === "error" ? state.fieldErrors?.[name] : undefined;
                  const common = { id: `edit-${name}`, name, value: draft[name] ?? "", onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => update(name, event.target.value), className: inputClass, "aria-invalid": !!errors, "aria-describedby": errors ? `error-${name}` : undefined };
                  return <div key={name} className={multiline.has(name) || name === "title" ? "sm:col-span-2" : ""}>
                    <label htmlFor={common.id} className="text-sm font-medium">{EDITOR_LABELS[name]}</label>
                    {options[name] ? <select {...common}>{options[name].map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : multiline.has(name) ? <textarea {...common} rows={name === "description" ? 7 : 3} /> : <input {...common} readOnly={name === "reference"} type={numbers.has(name) ? "number" : "text"} min={numbers.has(name) ? 0 : undefined} step={numbers.has(name) ? 1 : undefined} required={["title", "reference", "city"].includes(name)} placeholder="Non renseigné" />}
                    {name === "reference" && <p className="mt-1 text-xs text-[var(--color-stone)]">Référence protégée : elle identifie ce bien dans les échanges et imports.</p>}
                    {errors && <p id={`error-${name}`} className="mt-1 text-sm text-red-700">{errors.join(" ")}</p>}
                  </div>;
                })}
              </div>
              {index === 1 && <p className="mt-3 text-xs text-[var(--color-stone)]">{draft.listing === "vente" ? "La période du loyer n’est pas utilisée pour une vente." : "Précisez la période du tarif locatif."}</p>}
              {index === 2 && draft.type === "terrain" && <p className="mt-3 text-xs text-[var(--color-stone)]">Terrain non bâti : laissez les caractéristiques du logement vides.</p>}
            </details>)}
          </fieldset>
        </div>
        <aside id="galerie-edition" className="min-w-0 scroll-mt-24 border-t border-[var(--color-border)] p-5 lg:max-h-[70dvh] lg:overflow-y-auto lg:overscroll-contain lg:border-t-0" aria-label="Photos et aperçu de la saisie" tabIndex={0}>
          <div className="sticky -top-5 z-10 -mx-5 -mt-5 mb-5 flex gap-2 border-b border-[var(--color-border)] bg-[var(--color-cream)] p-4">
            <button type="button" aria-pressed={panel === "images"} onClick={() => setPanel("images")} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${panel === "images" ? "bg-[#795238] text-white" : "bg-white"}`}><Images size={15} /> Photos ({images.length})</button>
            <button type="button" aria-pressed={panel === "preview"} onClick={() => setPanel("preview")} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${panel === "preview" ? "bg-[#795238] text-white" : "bg-white"}`}><Eye size={15} /> Aperçu de ma saisie</button>
          </div>
          <div hidden={panel !== "images"}>
            <PropertyImageGallery key={resetKey} slug={values.slug} images={images} onChange={(next) => update("images", next.join("\n"))} onBusyChange={setUploading} disabled={pending} />
            {state.status === "error" && state.fieldErrors?.images && <p role="alert" className="mt-3 text-sm text-red-700">{state.fieldErrors.images.join(" ")}</p>}
          </div>
          {panel === "preview" && <DraftPreview draft={draft} images={images} />}
        </aside>
      </div>
      <div className="sticky bottom-0 z-20 flex flex-wrap items-center justify-between gap-3 rounded-b-[16px] border-t border-[var(--color-border)] bg-white/95 p-4 backdrop-blur-md">
        <p role="status" className="flex items-center gap-2 text-sm text-[var(--color-stone)]">{uploading ? "Transfert en cours…" : dirty ? "Modifications non enregistrées" : <><Check size={16} /> Fiche à jour</>}</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={pending || uploading || !history.length} onClick={() => travel(true)} className="rounded-[10px] border border-[var(--color-border)] px-3 py-2.5 text-sm disabled:opacity-40">↶ Annuler</button>
          <button type="button" disabled={pending || uploading || !future.length} onClick={() => travel(false)} className="rounded-[10px] border border-[var(--color-border)] px-3 py-2.5 text-sm disabled:opacity-40">↷ Rétablir</button>
          <button type="button" disabled={pending || uploading || !dirty} onClick={() => { if (!window.confirm("Revenir à la dernière version enregistrée ?")) return; setHistory((previous) => [...previous.slice(-99), draft]); setFuture([]); setDraft(values); setResetKey((key) => key + 1); }} className="rounded-[10px] border border-[var(--color-border)] px-4 py-2.5 text-sm disabled:opacity-40">Tout réinitialiser</button>
          <button type="submit" disabled={pending || uploading} className="flex items-center gap-2 rounded-[10px] bg-[#795238] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"><Save size={15} />{pending ? "Enregistrement…" : draft.published === "true" ? "Enregistrer et publier" : "Enregistrer le brouillon"}</button></div>
        {state.status !== "idle" && <p role={state.status === "error" ? "alert" : "status"} className={`w-full text-sm ${state.status === "error" ? "text-red-700" : "text-green-800"}`}>{state.message}</p>}
      </div>
    </form>
  </section>;
}

function DraftPreview({ draft, images }: { draft: Record<string, string>; images: string[] }) {
  const price = Number(draft.price_eur);
  return <div>
    <p className="mb-3 text-xs text-[var(--color-stone)]">Aperçu simplifié de votre saisie, non enregistré. La mise en page du site public peut différer.</p>
    <article className="overflow-hidden rounded-[14px] border border-[var(--color-border)] bg-white">
      {images[0] ? <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[0]} alt="Couverture en cours de préparation" className="aspect-[4/3] w-full object-cover" />
      </> : <div className="flex aspect-[4/3] items-center justify-center bg-[var(--color-beige-warm)] text-sm">Ajoutez une photo de couverture</div>}
      <div className="p-5"><p className="text-xs text-[var(--color-stone)]">{draft.published === "true" ? "Préparation de publication" : "Brouillon · non visible"} · Réf. {draft.reference || "—"}</p>
        <h3 className="mt-3 font-serif text-2xl">{draft.title || "Titre du bien"}</h3>
        <p className="mt-2 text-sm text-[var(--color-stone)]">{[draft.source_location_label, draft.city].filter(Boolean).join(" · ")}</p>
        <p className="mt-4 font-serif text-2xl">{price > 0 ? `${new Intl.NumberFormat("fr-FR").format(price)} €` : "Prix sur demande"}{price > 0 && draft.listing !== "vente" && <span className="text-sm">{draft.price_unit ? ` / ${draft.price_unit}` : " · période à confirmer"}</span>}</p>
        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">{["bedrooms", "bathrooms", "surface", "land_surface"].map((field) => <div key={field}><dt className="text-xs text-[var(--color-stone)]">{EDITOR_LABELS[field]}</dt><dd>{draft[field] || "Non renseigné"}</dd></div>)}</dl>
        <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed">{draft.short_description || draft.description || "Ajoutez une description pour présenter ce bien."}</p>
      </div>
    </article>
  </div>;
}
