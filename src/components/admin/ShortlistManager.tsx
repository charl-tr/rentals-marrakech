"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { Heart, Plus, Search, Sparkles, X } from "lucide-react";
import {
  addToShortlist,
  removeFromShortlist,
} from "@/lib/actions/shortlist-admin";
import { useMutationToast } from "@/lib/hooks/useMutationToast";
import type { MutationState } from "@/lib/actions/_core/defineMutation";
import type { Property } from "@/data/properties";

const idle: MutationState = { status: "idle" };

interface ShortlistEntry {
  item: {
    id: string;
    propertySlug: string;
    advisorNote: string | null;
    addedAt: string;
  };
  property: Property;
}

export default function ShortlistManager({
  leadId,
  portalUrl,
  initialShortlist,
  availableProperties,
  canEdit,
}: {
  leadId: string;
  portalUrl: string;
  initialShortlist: ShortlistEntry[];
  availableProperties: Pick<Property, "slug" | "title" | "reference" | "neighborhood" | "images" | "type" | "listing">[];
  canEdit: boolean;
}) {
  const [adderOpen, setAdderOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Portail link pour copy */}
      <div className="flex flex-col gap-2 border border-[var(--color-beige-warm)] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-terracotta)]">
            Lien de l&apos;espace client
          </div>
          <div className="mt-1 truncate font-mono text-[11px] text-[var(--color-stone)]">
            {portalUrl}
          </div>
        </div>
        <CopyButton text={portalUrl} />
      </div>

      {/* Shortlist */}
      <div className="border border-[var(--color-beige-warm)] bg-white">
        <div className="flex items-center justify-between border-b border-[var(--color-beige-warm)] px-4 py-3">
          <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--color-terracotta)]">
            <Sparkles size={12} />
            Shortlist client · {initialShortlist.length}
          </div>
          {canEdit && (
            <button
              type="button"
              onClick={() => setAdderOpen(true)}
              className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)] transition-colors hover:text-[var(--color-terracotta)]"
            >
              <Plus size={11} /> Ajouter un bien
            </button>
          )}
        </div>

        {initialShortlist.length === 0 ? (
          <div className="p-6 text-sm text-[var(--color-stone)]">
            Aucun bien curé pour ce client. Cliquez « Ajouter un bien » pour
            commencer à remplir son espace.
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-beige-warm)]">
            {initialShortlist.map(({ item, property }) => (
              <ShortlistRow
                key={item.id}
                leadId={leadId}
                item={item}
                property={property}
                canEdit={canEdit}
              />
            ))}
          </div>
        )}
      </div>

      {adderOpen && (
        <AdderDialog
          leadId={leadId}
          properties={availableProperties.filter(
            (p) => !initialShortlist.some((s) => s.property.slug === p.slug)
          )}
          onClose={() => setAdderOpen(false)}
        />
      )}
    </div>
  );
}

// ── Row shortlist avec remove ────────────────────────────────────

function ShortlistRow({
  leadId,
  item,
  property,
  canEdit,
}: {
  leadId: string;
  item: ShortlistEntry["item"];
  property: Property;
  canEdit: boolean;
}) {
  const [state, action] = useActionState(removeFromShortlist, idle);
  useMutationToast(state);

  const href =
    property.listing === "vente" || property.type === "programme-neuf"
      ? `/acheter/${property.slug}`
      : `/louer/${property.slug}`;

  return (
    <div className="flex gap-3 p-4">
      <Link href={href} target="_blank" className="relative h-14 w-20 flex-shrink-0 overflow-hidden bg-[var(--color-beige)]">
        {property.images[0] && (
          <Image src={property.images[0]} alt="" fill sizes="80px" className="object-cover" />
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={href} target="_blank" className="group">
          <div className="truncate text-sm font-medium text-[var(--color-charcoal)] group-hover:text-[var(--color-terracotta)]">
            {property.title}
          </div>
          <div className="mt-0.5 truncate text-[11px] text-[var(--color-stone)]">
            {property.neighborhood} · Réf. {property.reference}
          </div>
        </Link>
        {item.advisorNote && (
          <div className="mt-2 border-l-2 border-[var(--color-beige-warm)] pl-3 text-xs italic text-[var(--color-stone)]">
            « {item.advisorNote} »
          </div>
        )}
      </div>
      {canEdit && (
        <form action={action}>
          <input type="hidden" name="leadId" value={leadId} />
          <input type="hidden" name="propertySlug" value={property.slug} />
          <RemoveBtn />
        </form>
      )}
    </div>
  );
}

function RemoveBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label="Retirer de la shortlist"
      className="flex h-7 w-7 flex-shrink-0 items-center justify-center text-[var(--color-stone)] transition-colors hover:text-[var(--color-terracotta)]"
    >
      <X size={14} />
    </button>
  );
}

// ── Dialog d'ajout ────────────────────────────────────────────────

function AdderDialog({
  leadId,
  properties,
  onClose,
}: {
  leadId: string;
  properties: Pick<Property, "slug" | "title" | "reference" | "neighborhood" | "images">[];
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [state, action] = useActionState(addToShortlist, idle);
  useMutationToast(state);

  if (state.status === "success") {
    setTimeout(onClose, 100);
  }

  const filtered = properties
    .filter((p) => {
      const q = query.toLowerCase();
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.reference.toLowerCase().includes(q) ||
        (p.neighborhood ?? "").toLowerCase().includes(q)
      );
    })
    .slice(0, 20);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-charcoal)]/30 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl border border-[var(--color-beige-warm)] bg-white shadow-[var(--shadow-luxe)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-[var(--color-beige-warm)] p-6">
          <div>
            <div className="eyebrow">Shortlist</div>
            <h3 className="mt-2 font-serif text-2xl text-[var(--color-charcoal)]">
              Ajouter un bien
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="text-[var(--color-stone)] hover:text-[var(--color-charcoal)]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="border-b border-[var(--color-beige-warm)] p-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-stone)]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Chercher par titre, référence, quartier…"
              autoFocus
              className="w-full border border-[var(--color-beige-warm)] bg-[var(--color-cream)] py-2 pl-9 pr-3 text-sm focus:border-[var(--color-charcoal)] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {!selected ? (
          <div className="max-h-[50vh] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-sm text-[var(--color-stone)]">
                Aucun bien disponible. Tous ceux qui matchent sont déjà dans la shortlist.
              </div>
            ) : (
              filtered.map((p) => (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => setSelected(p.slug)}
                  className="flex w-full items-center gap-3 border-b border-[var(--color-beige-warm)] p-3 text-left transition-colors hover:bg-[var(--color-cream)]"
                >
                  <div className="relative h-10 w-14 flex-shrink-0 overflow-hidden bg-[var(--color-beige)]">
                    {p.images[0] && (
                      <Image src={p.images[0]} alt="" fill sizes="56px" className="object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-[var(--color-charcoal)]">
                      {p.title}
                    </div>
                    <div className="mt-0.5 truncate text-[11px] text-[var(--color-stone)]">
                      {p.neighborhood} · Réf. {p.reference}
                    </div>
                  </div>
                  <Heart size={14} className="text-[var(--color-stone-soft)]" />
                </button>
              ))
            )}
          </div>
        ) : (
          <form action={action} className="space-y-4 p-6">
            <input type="hidden" name="leadId" value={leadId} />
            <input type="hidden" name="propertySlug" value={selected} />
            <div className="flex items-center gap-3 border border-[var(--color-beige-warm)] bg-[var(--color-cream)] p-3">
              {(() => {
                const p = properties.find((pp) => pp.slug === selected);
                if (!p) return null;
                return (
                  <>
                    <div className="relative h-12 w-16 flex-shrink-0 overflow-hidden bg-[var(--color-beige)]">
                      {p.images[0] && (
                        <Image src={p.images[0]} alt="" fill sizes="64px" className="object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{p.title}</div>
                      <div className="mt-0.5 truncate text-[11px] text-[var(--color-stone)]">
                        {p.neighborhood} · {p.reference}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-stone)] hover:text-[var(--color-terracotta)]"
                    >
                      Changer
                    </button>
                  </>
                );
              })()}
            </div>

            <label className="block">
              <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
                Note pour le client (facultative)
              </span>
              <textarea
                name="note"
                rows={3}
                placeholder="Ex : L'emplacement correspond exactement à vos critères, et le propriétaire est ouvert à négocier."
                className="mt-2 w-full border border-[var(--color-beige-warm)] bg-white px-3 py-2.5 text-sm focus:border-[var(--color-charcoal)] focus:outline-none"
              />
              <span className="mt-1 block text-[10px] text-[var(--color-stone)]">
                La note apparaît sur l&apos;espace client à côté du bien.
              </span>
            </label>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="border border-[var(--color-beige-warm)] bg-white px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)] transition-colors hover:border-[var(--color-charcoal)]"
              >
                Annuler
              </button>
              <AddSubmit />
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function AddSubmit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-[var(--color-charcoal)] px-5 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-white transition-colors hover:bg-[var(--color-terracotta)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "…" : "Ajouter à la shortlist"}
    </button>
  );
}

// ── Copy link button ────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {}
      }}
      className="whitespace-nowrap border border-[var(--color-beige-warm)] bg-white px-3 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--color-charcoal)] transition-colors hover:border-[var(--color-charcoal)]"
    >
      {copied ? "Copié ✓" : "Copier le lien"}
    </button>
  );
}
