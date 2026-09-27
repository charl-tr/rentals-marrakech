"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Download, GripVertical, ImagePlus, LoaderCircle, RotateCcw, Star, Trash2 } from "lucide-react";
import { isExternalPropertyImage, MAX_PROPERTY_IMAGES, movePropertyImage } from "@/lib/property-media";
import { compressPropertyPhoto } from "@/lib/property-media-client";

export default function PropertyImageGallery({ slug, images, onChange, onBusyChange, disabled = false }: {
  slug: string; images: string[]; onChange: (images: string[]) => void;
  onBusyChange: (busy: boolean) => void; disabled?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const lock = useRef(false);
  const replacement = useRef<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [undo, setUndo] = useState<{ url: string; index: number }[]>([]);
  const [dragged, setDragged] = useState<number | null>(null);
  const [target, setTarget] = useState<number | null>(null);
  const inactive = disabled || busy;
  const externalCount = images.filter(isExternalPropertyImage).length;
  const button = "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-white px-2.5 py-1.5 text-xs font-medium hover:bg-[var(--color-cream)] focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-40";

  async function store(body: FormData | string) {
    const response = await fetch(`/api/admin/properties/${encodeURIComponent(slug)}/images`, {
      method: "POST", body, ...(typeof body === "string" ? { headers: { "Content-Type": "application/json" } } : {}),
      signal: AbortSignal.timeout(45000),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.url) throw new Error(result?.error ?? "Le transfert a échoué. Vérifiez votre connexion et réessayez.");
    return result.url as string;
  }

  function start() {
    if (lock.current || disabled) return false;
    lock.current = true; setBusy(true); onBusyChange(true); setErrors([]); return true;
  }
  function finish() { lock.current = false; setBusy(false); onBusyChange(false); }

  async function upload(files: File[]) {
    const replaceAt = replacement.current;
    replacement.current = null;
    if (!files.length || !start()) return;
    const next = [...images];
    const failures: string[] = [];
    const limit = replaceAt === null ? MAX_PROPERTY_IMAGES - images.length : 1;
    if (files.length > limit) failures.push(`Seules ${limit} photo(s) peuvent être ajoutées : maximum ${MAX_PROPERTY_IMAGES} par bien.`);
    const selected = files.slice(0, limit);
    try {
      for (let index = 0; index < selected.length; index++) {
        const file = selected[index];
        setProgress(`Ajout de la photo ${index + 1} sur ${selected.length}…`);
        try {
          const blob = await compressPropertyPhoto(file);
          const form = new FormData(); form.set("file", blob, blob.type === "image/webp" ? "photo.webp" : "photo.png");
          const url = await store(form);
          if (replaceAt !== null) next[replaceAt] = url; else next.push(url);
          onChange([...next]);
        } catch (error) { failures.push(`${file.name} : ${error instanceof Error ? error.message : "Photo non importée."}`); }
      }
      setProgress(failures.length ? "Ajout terminé avec des erreurs. Les photos réussies sont conservées." : "Photos prêtes. Enregistrez la fiche pour appliquer les changements.");
      setErrors(failures);
    } finally { finish(); }
  }

  async function importExternal(index: number) {
    if (!start()) return;
    setProgress(`Copie de la photo ${index + 1} dans le stockage de l’app…`);
    try {
      const url = await store(JSON.stringify({ sourceUrl: images[index] }));
      const next = [...images]; next[index] = url; onChange(next);
      setProgress("Photo copiée. Enregistrez la fiche pour utiliser la copie autonome.");
    } catch (error) { setErrors([error instanceof Error ? error.message : "Copie impossible."]); setProgress(""); }
    finally { finish(); }
  }

  function move(from: number, to: number) {
    if (inactive) return;
    onChange(movePropertyImage(images, from, to));
    setProgress(to === 0 ? "Photo de couverture modifiée — à enregistrer." : `Photo déplacée en position ${to + 1} — à enregistrer.`);
  }

  return <div className="sm:col-span-2 lg:col-span-3" aria-busy={busy}>
    <input type="hidden" name="images" value={images.join("\n")} />
    <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" aria-label="Choisir des photos du bien" disabled={inactive}
      onChange={(event) => { const files = Array.from(event.target.files ?? []); event.target.value = ""; void upload(files); }} />
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="font-medium">Galerie · {images.length} photo{images.length > 1 ? "s" : ""}</p>
        <p className="mt-1 text-sm text-[var(--color-stone)]">La première photo est la couverture. Glissez les photos ou utilisez les flèches pour changer leur ordre.</p></div>
      <button type="button" disabled={inactive || images.length >= MAX_PROPERTY_IMAGES} className="inline-flex items-center gap-2 rounded-[10px] bg-[#795238] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50" onClick={() => { replacement.current = null; if (input.current) input.current.multiple = true; input.current?.click(); }}><ImagePlus size={17} /> Ajouter des photos</button>
    </div>
    <p className="mt-2 text-xs text-[var(--color-stone)]">JPG, PNG ou WebP · 20 Mo maximum par fichier · optimisation automatique. L’ajout charge une copie dans le stockage public des photos ; la fiche n’est modifiée qu’après enregistrement.</p>
    {externalCount > 0 && <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">{externalCount} photo(s) dépendent encore de l’ancien site. « Copier dans l’app » conserve une copie indépendante, sans modifier l’original.</p>}
    <p role="status" aria-live="polite" className="mt-3 flex min-h-5 items-center gap-2 text-sm text-[var(--color-stone)]">{busy && <LoaderCircle size={15} className="animate-spin" />}{progress}</p>
    {errors.length > 0 && <ul role="alert" className="mt-2 list-inside list-disc rounded-lg bg-red-50 p-3 text-sm text-red-800">{errors.map((error, index) => <li key={index}>{error}</li>)}</ul>}
    {undo.length > 0 && <button type="button" className={`${button} mt-3`} disabled={inactive || images.length >= MAX_PROPERTY_IMAGES} onClick={() => { const last = undo[undo.length - 1]; const next = [...images]; next.splice(Math.min(last.index, next.length), 0, last.url); onChange(next); setUndo(undo.slice(0, -1)); }}><RotateCcw size={14} /> Annuler le dernier retrait</button>}
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      {images.map((url, index) => <div key={`${url}-${index}`} onDragOver={(event) => { if (dragged !== null && !inactive) { event.preventDefault(); setTarget(index); } }} onDrop={(event) => { event.preventDefault(); if (dragged !== null) move(dragged, index); setDragged(null); setTarget(null); }} className={`overflow-hidden rounded-xl border bg-white ${target === index ? "border-[#795238] ring-2 ring-[#795238]/30" : "border-[var(--color-border)]"}`}>
        <div className="relative aspect-[4/3] bg-[var(--color-beige-warm)]">
          {/* Existing external URLs are intentional during gradual media migration. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={`Photo ${index + 1} du bien${index === 0 ? ", couverture" : ""}`} loading="lazy" draggable={false} className="h-full w-full object-cover" />
          <span className="absolute left-2 top-2 rounded-full bg-[#795238] px-2.5 py-1 text-xs font-medium text-white">{index === 0 ? "Couverture" : `Photo ${index + 1}`}</span>
          <button type="button" draggable={!inactive} disabled={inactive} aria-label={`Réordonner la photo ${index + 1} par glisser-déposer`} title="Glisser pour réordonner — ou utiliser les flèches" onDragStart={(event) => { setDragged(index); event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", String(index)); }} onDragEnd={() => { setDragged(null); setTarget(null); }} className="absolute right-2 top-2 cursor-grab rounded-lg bg-white/95 p-2 active:cursor-grabbing"><GripVertical size={17} /></button>
        </div>
        <div className="space-y-2.5 p-3">
          <div className="flex items-center justify-between gap-2">
            <button type="button" className={button} disabled={inactive || index === 0} onClick={() => move(index, 0)}><Star size={13} />{index === 0 ? "Couverture" : "En couverture"}</button>
            <div className="flex gap-1"><button type="button" className={button} disabled={inactive || index === 0} aria-label={`Déplacer la photo ${index + 1} avant`} onClick={() => move(index, index - 1)}><ArrowLeft size={14} /></button><button type="button" className={button} disabled={inactive || index === images.length - 1} aria-label={`Déplacer la photo ${index + 1} après`} onClick={() => move(index, index + 1)}><ArrowRight size={14} /></button></div>
          </div>
          <div className="flex flex-wrap gap-2"><button type="button" className={button} disabled={inactive} onClick={() => { replacement.current = index; if (input.current) input.current.multiple = false; input.current?.click(); }}>Remplacer</button><button type="button" className={button} disabled={inactive} aria-label={`Retirer la photo ${index + 1} de la fiche`} onClick={() => { setUndo([...undo, { url, index }]); onChange(images.filter((_, position) => position !== index)); setProgress("Photo retirée de la galerie — à enregistrer. Le fichier n’est pas détruit."); }}><Trash2 size={13} /> Retirer</button></div>
          {isExternalPropertyImage(url) ? <button type="button" className="flex min-h-9 items-center gap-1.5 text-xs font-medium text-[#795238] underline underline-offset-4 disabled:opacity-40" disabled={inactive} onClick={() => void importExternal(index)}><Download size={13} /> Copier dans l’app</button> : <p className="flex items-center gap-1.5 text-xs text-[var(--color-stone)]"><Check size={13} /> Stockage de l’app</p>}
        </div>
      </div>)}
    </div>
    {!images.length && <div className="mt-4 rounded-xl border border-dashed border-[var(--color-border)] p-8 text-center text-sm text-[var(--color-stone)]">Aucune photo pour le moment. Ajoutez-en une pour choisir la couverture.</div>}
  </div>;
}
