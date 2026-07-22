"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Check, Phone, MessageCircle, Sparkles, X } from "lucide-react";
import {
  logInteraction,
  updateLeadStatus,
  addNote,
  type MutationState,
} from "@/lib/actions/leads-admin";
import type { NextAction } from "@/lib/next-best-action";
import { useMutationToast } from "@/lib/hooks/useMutationToast";

const idle: MutationState = { status: "idle" };

export default function NextActionCard({
  leadId,
  nba,
  phone,
  whatsapp,
}: {
  leadId: string;
  nba: NextAction;
  phone: string | null;
  whatsapp: string | null;
}) {
  const isUrgent = nba.priority === "urgent";
  const accent = isUrgent ? "alert" : nba.priority === "high" ? "terra" : "neutral";

  return (
    <section
      className={`mt-8 rounded-[14px] border-l-4 ${
        accent === "alert"
          ? "border-[var(--color-alert)] bg-[var(--color-alert-soft)]"
          : accent === "terra"
          ? "border-[var(--color-terracotta)] bg-[var(--color-cream)]"
          : "border-[var(--color-beige-warm)] bg-white"
      } p-6`}
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        {/* Recommendation */}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Sparkles
              size={14}
              className={
                accent === "alert"
                  ? "text-[var(--color-alert)]"
                  : "text-[var(--color-terracotta)]"
              }
            />
            <span
              className={`text-[10px] font-medium uppercase tracking-[0.28em] ${
                accent === "alert"
                  ? "text-[var(--color-alert)]"
                  : "text-[var(--color-terracotta)]"
              }`}
            >
              Prochaine action · {nba.priority}
            </span>
          </div>
          <h2 className="mt-3 font-serif text-2xl leading-tight text-[var(--color-charcoal)]">
            {nba.label}
          </h2>
          <p className="mt-2 text-sm text-[var(--color-stone)]">{nba.reason}</p>
          {nba.hint && (
            <p className="mt-3 border-t border-[var(--color-beige-warm)] pt-3 text-xs italic text-[var(--color-stone)]">
              {nba.hint}
            </p>
          )}
        </div>

        {/* Quick actions column */}
        <div className="flex flex-col gap-2 md:w-[260px] md:flex-shrink-0">
          {/* Primary suggested CTA */}
          {nba.suggested && (
            <PrimaryActionButton
              leadId={leadId}
              suggested={nba.suggested}
              accent={accent}
            />
          )}

          {/* Shortcuts : phone + whatsapp */}
          <div className="flex items-center gap-2">
            {phone && (
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="flex flex-1 items-center justify-center gap-2 rounded-[10px] border border-[var(--color-beige-warm)] bg-white px-3 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-charcoal)] transition-colors hover:border-[var(--color-charcoal)]"
              >
                <Phone size={12} />
                Appeler
              </a>
            )}
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-[10px] border border-[var(--color-beige-warm)] bg-white px-3 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-charcoal)] transition-colors hover:border-[var(--color-charcoal)]"
              >
                <MessageCircle size={12} />
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Primary CTA : triggers mutation selon suggested.type ───────────

function PrimaryActionButton({
  leadId,
  suggested,
  accent,
}: {
  leadId: string;
  suggested: NonNullable<NextAction["suggested"]>;
  accent: "alert" | "terra" | "neutral";
}) {
  if (suggested.type === "status_change" && suggested.statusTo) {
    return (
      <StatusChangeForm
        leadId={leadId}
        statusTo={suggested.statusTo}
        label={suggested.label}
        accent={accent}
      />
    );
  }
  if (suggested.type === "log_call") {
    return (
      <LogInteractionForm
        leadId={leadId}
        type="call_logged"
        label={suggested.label}
        accent={accent}
      />
    );
  }
  if (suggested.type === "add_note") {
    return (
      <NoteQuickForm leadId={leadId} label={suggested.label} accent={accent} />
    );
  }
  return null;
}

// ── Status change en 1 clic ──────────────────────────────────────

function StatusChangeForm({
  leadId,
  statusTo,
  label,
  accent,
}: {
  leadId: string;
  statusTo: string;
  label: string;
  accent: "alert" | "terra" | "neutral";
}) {
  const [state, action] = useActionState(updateLeadStatus, idle);
  useMutationToast(state);
  return (
    <form action={action}>
      <input type="hidden" name="leadId" value={leadId} />
      <input type="hidden" name="status" value={statusTo} />
      <CTAButton label={label} accent={accent} icon="check" />
    </form>
  );
}

// ── Log call / whatsapp avec prompt note ──────────────────────────

function LogInteractionForm({
  leadId,
  type,
  label,
  accent,
}: {
  leadId: string;
  type: "call_logged" | "whatsapp_sent";
  label: string;
  accent: "alert" | "terra" | "neutral";
}) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(logInteraction, idle);
  useMutationToast(state);

  if (state.status === "success" && open) setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${btnClass(accent)} flex items-center justify-center gap-2`}
      >
        <Phone size={12} />
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-charcoal)]/30 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-[14px] border border-[var(--color-beige-warm)] bg-white p-8 shadow-[var(--shadow-luxe)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="eyebrow">Interaction</div>
                <h3 className="mt-3 font-serif text-2xl text-[var(--color-charcoal)]">
                  {label}
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

            <form action={action} className="mt-6 space-y-4">
              <input type="hidden" name="leadId" value={leadId} />
              <input type="hidden" name="type" value={type} />
              <label className="block">
                <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
                  Note rapide (optionnelle)
                </span>
                <textarea
                  name="body"
                  rows={3}
                  placeholder="Ex : appelé à 15h, pas décroché — rappel demain matin"
                  className="mt-2 w-full rounded-[10px] border border-[var(--color-beige-warm)] bg-white px-3 py-2.5 text-sm focus:border-[var(--color-charcoal)] focus:outline-none"
                />
              </label>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-[10px] border border-[var(--color-beige-warm)] bg-white px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)] transition-colors hover:border-[var(--color-charcoal)] hover:text-[var(--color-charcoal)]"
                >
                  Annuler
                </button>
                <SubmitBtn label="Enregistrer" />
              </div>
              {state.status === "error" && (
                <div className="text-[11px] text-[var(--color-terracotta)]">
                  {state.message}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ── Note rapide ─────────────────────────────────────────────────────

function NoteQuickForm({
  leadId,
  label,
  accent,
}: {
  leadId: string;
  label: string;
  accent: "alert" | "terra" | "neutral";
}) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(addNote, idle);
  useMutationToast(state);
  if (state.status === "success" && open) setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${btnClass(accent)} flex items-center justify-center gap-2`}
      >
        {label}
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-charcoal)]/30 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-[14px] border border-[var(--color-beige-warm)] bg-white p-8 shadow-[var(--shadow-luxe)]"
            onClick={(e) => e.stopPropagation()}
          >
            <form action={action} className="space-y-4">
              <input type="hidden" name="leadId" value={leadId} />
              <label className="block">
                <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
                  Note interne
                </span>
                <textarea
                  name="body"
                  rows={4}
                  required
                  autoFocus
                  className="mt-2 w-full rounded-[10px] border border-[var(--color-beige-warm)] bg-white px-3 py-2.5 text-sm focus:border-[var(--color-charcoal)] focus:outline-none"
                />
              </label>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-[10px] border border-[var(--color-beige-warm)] bg-white px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)] transition-colors hover:border-[var(--color-charcoal)]"
                >
                  Annuler
                </button>
                <SubmitBtn label="Enregistrer" />
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ── Primitives ─────────────────────────────────────────────────────

function CTAButton({
  label,
  accent,
  icon,
}: {
  label: string;
  accent: "alert" | "terra" | "neutral";
  icon?: "check" | "phone";
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={btnClass(accent)}>
      {icon === "check" && !pending && <Check size={12} strokeWidth={3} />}
      {icon === "phone" && !pending && <Phone size={12} />}
      {pending ? "…" : label}
    </button>
  );
}

function SubmitBtn({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-[10px] bg-[var(--color-charcoal)] px-5 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-white transition-colors hover:bg-[var(--color-terracotta)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "…" : label}
    </button>
  );
}

function Feedback({ state }: { state: MutationState }) {
  if (state.status === "idle") return null;
  if (state.status === "success") {
    return (
      <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-[var(--color-success)]">
        <Check size={11} /> {state.message}
      </div>
    );
  }
  return (
    <div className="mt-2 text-center text-[11px] text-[var(--color-terracotta)]">
      {state.message}
    </div>
  );
}

function btnClass(accent: "alert" | "terra" | "neutral"): string {
  const base =
    "flex w-full items-center justify-center gap-1.5 rounded-[10px] px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.22em] transition-colors disabled:cursor-not-allowed disabled:opacity-60";
  if (accent === "alert") {
    return `${base} bg-[var(--color-alert)] text-white hover:bg-[var(--color-terracotta-deep)]`;
  }
  if (accent === "terra") {
    return `${base} bg-[var(--color-terracotta)] text-white hover:bg-[var(--color-terracotta-deep)]`;
  }
  return `${base} bg-[var(--color-charcoal)] text-white hover:bg-[var(--color-terracotta)]`;
}
