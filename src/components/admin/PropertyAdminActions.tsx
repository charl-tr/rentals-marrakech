"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Check, Eye, EyeOff, Star, X } from "lucide-react";
import {
  togglePublished,
  toggleFeatured,
  updatePropertyStatus,
  updatePropertyPrice,
  type PropertyActionState,
} from "@/lib/actions/properties-admin";
import { STATUS_LABELS, type PropertyStatus } from "@/data/properties";
import { useMutationToast } from "@/lib/hooks/useMutationToast";

const idle: PropertyActionState = { status: "idle" };

const PROP_STATUSES: PropertyStatus[] = [
  "available",
  "new",
  "reserved",
  "sold",
  "rented",
];

export default function PropertyAdminActions({
  slug,
  currentStatus,
  currentPrice,
  isPublished,
  isFeatured,
  canEdit,
}: {
  slug: string;
  currentStatus: PropertyStatus;
  currentPrice: number;
  isPublished: boolean;
  isFeatured: boolean;
  canEdit: boolean;
}) {
  if (!canEdit) {
    return (
      <div className="border-l-2 border-[var(--color-stone-soft)] bg-[var(--color-cream)] px-4 py-3 text-xs text-[var(--color-stone)]">
        Les actions sur les biens sont réservées au directeur. Vue lecture seule.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PublishCard slug={slug} isPublished={isPublished} />
      <FeaturedCard slug={slug} isFeatured={isFeatured} />
      <StatusCard slug={slug} currentStatus={currentStatus} />
      <PriceCard slug={slug} currentPrice={currentPrice} />
    </div>
  );
}

// ── Publish toggle ─────────────────────────────────────────────────

function PublishCard({ slug, isPublished }: { slug: string; isPublished: boolean }) {
  const [state, action] = useActionState(togglePublished, idle);
  useMutationToast(state);
  return (
    <form action={action} className="border border-[var(--color-beige-warm)] bg-white p-4">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="published" value={(!isPublished).toString()} />

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
            Publication
          </div>
          <div className="mt-2 flex items-center gap-2">
            {isPublished ? (
              <>
                <Eye size={14} className="text-[var(--color-success)]" />
                <span className="text-sm text-[var(--color-charcoal)]">
                  Visible sur le site public
                </span>
              </>
            ) : (
              <>
                <EyeOff size={14} className="text-[var(--color-stone)]" />
                <span className="text-sm text-[var(--color-stone)]">
                  Masqué du site public
                </span>
              </>
            )}
          </div>
        </div>
        <SubmitButton
          label={isPublished ? "Dépublier" : "Publier"}
          variant={isPublished ? "ghost" : "primary"}
        />
      </div>
      <ActionFeedback state={state} />
    </form>
  );
}

// ── Featured toggle ────────────────────────────────────────────────

function FeaturedCard({ slug, isFeatured }: { slug: string; isFeatured: boolean }) {
  const [state, action] = useActionState(toggleFeatured, idle);
  useMutationToast(state);
  return (
    <form action={action} className="border border-[var(--color-beige-warm)] bg-white p-4">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="featured" value={(!isFeatured).toString()} />

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
            Mise en avant
          </div>
          <div className="mt-2 flex items-center gap-2">
            {isFeatured ? (
              <>
                <Star
                  size={14}
                  fill="currentColor"
                  className="text-[var(--color-terracotta)]"
                />
                <span className="text-sm text-[var(--color-charcoal)]">
                  Mis en avant sur la home
                </span>
              </>
            ) : (
              <>
                <Star size={14} className="text-[var(--color-stone-soft)]" />
                <span className="text-sm text-[var(--color-stone)]">
                  Bien standard
                </span>
              </>
            )}
          </div>
        </div>
        <SubmitButton
          label={isFeatured ? "Retirer" : "Mettre en avant"}
          variant="ghost"
        />
      </div>
      <ActionFeedback state={state} />
    </form>
  );
}

// ── Status changer (modal avec options) ────────────────────────────

function StatusCard({
  slug,
  currentStatus,
}: {
  slug: string;
  currentStatus: PropertyStatus;
}) {
  const [state, action] = useActionState(updatePropertyStatus, idle);
  const [open, setOpen] = useState(false);
  useMutationToast(state);

  if (state.status === "success" && open) setOpen(false);

  return (
    <div className="border border-[var(--color-beige-warm)] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
            Statut commercial
          </div>
          <div className="mt-2 text-sm text-[var(--color-charcoal)]">
            {STATUS_LABELS[currentStatus]}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="border border-[var(--color-beige-warm)] bg-white px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--color-charcoal)] transition-colors hover:border-[var(--color-charcoal)]"
        >
          Changer
        </button>
      </div>
      <ActionFeedback state={state} />

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-charcoal)]/30 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md border border-[var(--color-beige-warm)] bg-white p-8 shadow-[var(--shadow-luxe)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="eyebrow">Commercial</div>
                <h3 className="mt-3 font-serif text-2xl text-[var(--color-charcoal)]">
                  Changer le statut
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="text-[var(--color-stone)] hover:text-[var(--color-charcoal)]"
              >
                <X size={18} />
              </button>
            </div>

            <form action={action} className="mt-6 space-y-3">
              <input type="hidden" name="slug" value={slug} />
              <div className="grid grid-cols-2 gap-2">
                {PROP_STATUSES.map((s) => (
                  <StatusOption
                    key={s}
                    status={s}
                    disabled={s === currentStatus}
                  />
                ))}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusOption({
  status,
  disabled,
}: {
  status: PropertyStatus;
  disabled: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name="status"
      value={status}
      disabled={disabled || pending}
      className={`border px-3 py-2.5 text-[11px] font-medium uppercase tracking-[0.18em] transition-colors ${
        disabled
          ? "cursor-not-allowed border-[var(--color-beige-warm)] bg-[var(--color-cream)] text-[var(--color-stone-soft)]"
          : "border-[var(--color-beige-warm)] bg-white text-[var(--color-charcoal)] hover:border-[var(--color-charcoal)] hover:bg-[var(--color-charcoal)] hover:text-white"
      }`}
    >
      {STATUS_LABELS[status]}
      {disabled && <span className="ml-1 text-[9px] normal-case">· actuel</span>}
    </button>
  );
}

// ── Price editor ───────────────────────────────────────────────────

function PriceCard({
  slug,
  currentPrice,
}: {
  slug: string;
  currentPrice: number;
}) {
  const [state, action] = useActionState(updatePropertyPrice, idle);
  const [editing, setEditing] = useState(false);
  useMutationToast(state);

  if (state.status === "success" && editing) setEditing(false);

  return (
    <div className="border border-[var(--color-beige-warm)] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
            Prix affiché
          </div>
          <div className="mt-2 font-serif text-xl text-[var(--color-charcoal)]">
            {new Intl.NumberFormat("fr-FR", {
              style: "currency",
              currency: "EUR",
              maximumFractionDigits: 0,
            }).format(currentPrice)}
          </div>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="border border-[var(--color-beige-warm)] bg-white px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--color-charcoal)] transition-colors hover:border-[var(--color-charcoal)]"
          >
            Ajuster
          </button>
        )}
      </div>

      {editing && (
        <form action={action} className="mt-3 flex items-center gap-2">
          <input type="hidden" name="slug" value={slug} />
          <input
            type="number"
            name="priceEur"
            defaultValue={currentPrice}
            min={1}
            step={1000}
            autoFocus
            className="flex-1 border border-[var(--color-beige-warm)] bg-white px-3 py-2 text-sm focus:border-[var(--color-charcoal)] focus:outline-none"
          />
          <span className="text-xs text-[var(--color-stone)]">€</span>
          <SubmitButton label="Valider" variant="primary" />
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="border border-[var(--color-beige-warm)] bg-white p-2 text-[var(--color-stone)] hover:border-[var(--color-charcoal)] hover:text-[var(--color-charcoal)]"
          >
            <X size={12} />
          </button>
        </form>
      )}
      <ActionFeedback state={state} />
    </div>
  );
}

// ── Primitives ─────────────────────────────────────────────────────

function SubmitButton({
  label,
  variant,
}: {
  label: string;
  variant: "primary" | "ghost";
}) {
  const { pending } = useFormStatus();
  const cls =
    variant === "primary"
      ? "bg-[var(--color-charcoal)] text-white hover:bg-[var(--color-terracotta)]"
      : "border border-[var(--color-beige-warm)] bg-white text-[var(--color-charcoal)] hover:border-[var(--color-charcoal)]";
  return (
    <button
      type="submit"
      disabled={pending}
      className={`${cls} whitespace-nowrap px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] transition-colors disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {pending ? "…" : label}
    </button>
  );
}

function ActionFeedback({ state }: { state: PropertyActionState }) {
  if (state.status === "idle") return null;
  if (state.status === "success") {
    return (
      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[var(--color-success)]">
        <Check size={12} /> {state.message}
      </div>
    );
  }
  return (
    <div className="mt-3 text-[11px] text-[var(--color-terracotta)]">
      {state.message}
    </div>
  );
}
