"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Phone, Mail, User, ScrollText, X, Edit, Plus, Link2, Check } from "lucide-react";
import {
  updatePropertyOwner,
  createMandate,
  closeMandate,
} from "@/lib/actions/mandates-admin";
import {
  type Mandate,
  MANDATE_TYPES,
  MANDATE_TYPE_LABELS,
  MANDATE_STATUS_LABELS,
  formatCommission,
  mandateExpiryBadge,
} from "@/lib/mandates";
import { useMutationToast } from "@/lib/hooks/useMutationToast";
import type { MutationState } from "@/lib/actions/_core/defineMutation";

const idle: MutationState = { status: "idle" };

interface OwnerInfo {
  name: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
}

export default function OwnerMandateSection({
  slug,
  owner,
  mandate,
  canEdit,
}: {
  slug: string;
  owner: OwnerInfo;
  mandate: Mandate | null;
  canEdit: boolean;
}) {
  return (
    <div className="space-y-4">
      <OwnerCard slug={slug} owner={owner} canEdit={canEdit} />
      <MandateCard slug={slug} mandate={mandate} canEdit={canEdit} />
    </div>
  );
}

// ── Owner card ──────────────────────────────────────────────────────

function OwnerCard({
  slug,
  owner,
  canEdit,
}: {
  slug: string;
  owner: OwnerInfo;
  canEdit: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [state, action] = useActionState(updatePropertyOwner, idle);
  useMutationToast(state);

  if (state.status === "success" && editing) setEditing(false);

  const hasOwner = owner.name || owner.phone || owner.email;

  return (
    <div className="overflow-hidden rounded-[14px] border border-[var(--color-beige-warm)] bg-white">
      <div className="flex items-start justify-between gap-3 border-b border-[var(--color-beige-warm)] px-4 py-3">
        <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--color-terracotta)]">
          <User size={12} />
          Propriétaire
        </div>
        {canEdit && !editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)] transition-colors hover:text-[var(--color-terracotta)]"
          >
            <Edit size={11} />
            {hasOwner ? "Modifier" : "Renseigner"}
          </button>
        )}
      </div>

      <div className="p-4">
        {editing ? (
          <form action={action} className="space-y-3">
            <input type="hidden" name="slug" value={slug} />
            <Field label="Nom">
              <input
                type="text"
                name="ownerName"
                defaultValue={owner.name ?? ""}
                placeholder="M. Ait Ben Yahia"
                className={inputCls}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Téléphone">
                <input
                  type="tel"
                  name="ownerPhone"
                  defaultValue={owner.phone ?? ""}
                  placeholder="+212 …"
                  className={inputCls}
                />
              </Field>
              <Field label="E-mail">
                <input
                  type="email"
                  name="ownerEmail"
                  defaultValue={owner.email ?? ""}
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Notes internes">
              <textarea
                name="ownerNotes"
                rows={2}
                defaultValue={owner.notes ?? ""}
                placeholder="Disponibilité, préférences, contraintes spécifiques…"
                className={inputCls}
              />
            </Field>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-[10px] border border-[var(--color-beige-warm)] bg-white px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)] transition-colors hover:border-[var(--color-charcoal)]"
              >
                Annuler
              </button>
              <SubmitBtn label="Enregistrer" />
            </div>
          </form>
        ) : !hasOwner ? (
          <p className="text-sm text-[var(--color-stone)]">
            Aucun propriétaire renseigné.
          </p>
        ) : (
          <div className="space-y-2 text-sm">
            {owner.name && (
              <div className="font-serif text-base text-[var(--color-charcoal)]">
                {owner.name}
              </div>
            )}
            <div className="space-y-1.5">
              {owner.phone && (
                <a
                  href={`tel:${owner.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-2 text-[var(--color-charcoal)] hover:text-[var(--color-terracotta)]"
                >
                  <Phone size={12} className="text-[var(--color-terracotta)]" />
                  {owner.phone}
                </a>
              )}
              {owner.email && (
                <a
                  href={`mailto:${owner.email}`}
                  className="flex items-center gap-2 text-[var(--color-charcoal)] hover:text-[var(--color-terracotta)]"
                >
                  <Mail size={12} className="text-[var(--color-terracotta)]" />
                  {owner.email}
                </a>
              )}
            </div>
            {owner.notes && (
              <div className="mt-3 border-t border-[var(--color-beige-warm)] pt-3 text-xs italic text-[var(--color-stone)]">
                {owner.notes}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Mandate card ────────────────────────────────────────────────────

function MandateCard({
  slug,
  mandate,
  canEdit,
}: {
  slug: string;
  mandate: Mandate | null;
  canEdit: boolean;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [showClose, setShowClose] = useState(false);

  const [createState, createAction] = useActionState(createMandate, idle);
  const [closeState, closeAction] = useActionState(closeMandate, idle);
  useMutationToast(createState);
  useMutationToast(closeState);

  if (createState.status === "success" && showCreate) setShowCreate(false);
  if (closeState.status === "success" && showClose) setShowClose(false);

  const expiryBadge = mandate ? mandateExpiryBadge(mandate) : null;

  return (
    <div className="overflow-hidden rounded-[14px] border border-[var(--color-beige-warm)] bg-white">
      <div className="flex items-start justify-between gap-3 border-b border-[var(--color-beige-warm)] px-4 py-3">
        <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--color-terracotta)]">
          <ScrollText size={12} />
          Mandat commercial
        </div>
        {canEdit && !mandate && !showCreate && (
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)] transition-colors hover:text-[var(--color-terracotta)]"
          >
            <Plus size={11} /> Nouveau
          </button>
        )}
        {canEdit && mandate && (
          <button
            type="button"
            onClick={() => setShowClose(true)}
            className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)] transition-colors hover:text-[var(--color-terracotta)]"
          >
            Clôturer
          </button>
        )}
      </div>

      <div className="p-4">
        {showCreate ? (
          <form action={createAction} className="space-y-3">
            <input type="hidden" name="propertySlug" value={slug} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Type">
                <select
                  name="type"
                  defaultValue="simple"
                  className={inputCls}
                  required
                >
                  {MANDATE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {MANDATE_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Exclusivité">
                <select
                  name="exclusivity"
                  defaultValue="false"
                  className={inputCls}
                >
                  <option value="false">Non</option>
                  <option value="true">Oui</option>
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Commission (%)">
                <input
                  type="number"
                  name="commissionPct"
                  step="0.01"
                  min="0"
                  max="20"
                  placeholder="3.00"
                  className={inputCls}
                />
              </Field>
              <Field label="Date signature">
                <input type="date" name="signedAt" className={inputCls} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Début">
                <input type="date" name="startDate" className={inputCls} />
              </Field>
              <Field label="Expiration">
                <input type="date" name="expiryDate" className={inputCls} />
              </Field>
            </div>
            <Field label="Notes">
              <textarea name="notes" rows={2} className={inputCls} />
            </Field>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-[10px] border border-[var(--color-beige-warm)] bg-white px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)] transition-colors hover:border-[var(--color-charcoal)]"
              >
                Annuler
              </button>
              <SubmitBtn label="Créer le mandat" />
            </div>
          </form>
        ) : !mandate ? (
          <p className="text-sm text-[var(--color-stone)]">
            Aucun mandat actif sur ce bien.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[var(--color-charcoal)] px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.22em] text-white">
                {MANDATE_TYPE_LABELS[mandate.type]}
              </span>
              {mandate.exclusivity && (
                <span className="rounded-full bg-[var(--color-terracotta)] px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.22em] text-white">
                  ★ Exclusif
                </span>
              )}
              <span className="rounded-full bg-[var(--color-success-soft)] px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.22em] text-[var(--color-success)]">
                {MANDATE_STATUS_LABELS[mandate.status]}
              </span>
              {expiryBadge && (
                <span
                  className={`rounded-full px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.22em] ${
                    expiryBadge.status === "expired"
                      ? "bg-[var(--color-alert-soft)] text-[var(--color-alert)]"
                      : expiryBadge.status === "watch"
                      ? "bg-[var(--color-warning-soft)] text-[var(--color-warning)]"
                      : "bg-[var(--color-cream)] text-[var(--color-stone)]"
                  }`}
                >
                  {expiryBadge.label}
                </span>
              )}
            </div>

            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Commission" value={formatCommission(mandate)} />
              {mandate.signedAt && (
                <Row label="Signé le" value={formatDate(mandate.signedAt)} />
              )}
              {mandate.startDate && (
                <Row label="Début" value={formatDate(mandate.startDate)} />
              )}
              {mandate.expiryDate && (
                <Row label="Expiration" value={formatDate(mandate.expiryDate)} />
              )}
            </dl>

            {mandate.notes && (
              <div className="mt-4 border-t border-[var(--color-beige-warm)] pt-3 text-xs italic text-[var(--color-stone)]">
                {mandate.notes}
              </div>
            )}

            {/* Portail vendeur — copy link */}
            <SellerPortalLink ownerToken={mandate.ownerToken} />

            {/* Close form modal */}
            {showClose && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-charcoal)]/30 p-4 backdrop-blur-sm"
                onClick={() => setShowClose(false)}
              >
                <div
                  className="w-full max-w-md rounded-[14px] border border-[var(--color-beige-warm)] bg-white p-8 shadow-[var(--shadow-luxe)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="eyebrow">Mandat</div>
                      <h3 className="mt-3 font-serif text-2xl text-[var(--color-charcoal)]">
                        Clôturer ce mandat
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowClose(false)}
                      aria-label="Fermer"
                      className="text-[var(--color-stone)] hover:text-[var(--color-charcoal)]"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <form action={closeAction} className="mt-6 space-y-4">
                    <input type="hidden" name="mandateId" value={mandate.id} />
                    <Field label="Motif / disposition">
                      <textarea
                        name="disposition"
                        rows={3}
                        placeholder="Ex : vendu hors mandat, retrait propriétaire, expiration conformément contrat…"
                        className={inputCls}
                      />
                    </Field>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowClose(false)}
                        className="rounded-[10px] border border-[var(--color-beige-warm)] bg-white px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)] transition-colors hover:border-[var(--color-charcoal)]"
                      >
                        Annuler
                      </button>
                      <SubmitBtn label="Clôturer" />
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Primitives locales ─────────────────────────────────────────────

const inputCls =
  "w-full rounded-[10px] border border-[var(--color-beige-warm)] bg-white px-3 py-2 text-sm focus:border-[var(--color-charcoal)] focus:outline-none";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function SubmitBtn({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-[10px] bg-[var(--color-charcoal)] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-white transition-colors hover:bg-[var(--color-terracotta)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "…" : label}
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
        {label}
      </dt>
      <dd className="text-right text-[var(--color-charcoal)]">{value}</dd>
    </div>
  );
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function SellerPortalLink({ ownerToken }: { ownerToken: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    const url = `${window.location.origin}/mon-bien/${ownerToken}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="mt-4 border-t border-[var(--color-beige-warm)] pt-4">
      <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)] mb-2">
        Portail vendeur
      </div>
      <button
        type="button"
        onClick={copy}
        className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--color-charcoal)] transition-colors hover:text-[var(--color-terracotta)]"
      >
        {copied ? <Check size={12} className="text-green-600" /> : <Link2 size={12} />}
        {copied ? "Lien copié !" : "Copier le lien vendeur"}
      </button>
      <p className="mt-1 text-[10px] text-[var(--color-stone)]">
        À envoyer au propriétaire — accès sans compte.
      </p>
    </div>
  );
}
