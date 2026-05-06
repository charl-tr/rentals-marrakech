"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { ChevronDown, X } from "lucide-react";
import {
  updateLeadStatus,
  type MutationState,
} from "@/lib/actions/leads-admin";
import { LEAD_STATUSES, STATUS_LABELS, type LeadStatus } from "@/lib/leads";

const initialState: MutationState = { status: "idle" };

export default function StatusChanger({
  leadId,
  currentStatus,
}: {
  leadId: string;
  currentStatus: LeadStatus;
}) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(updateLeadStatus, initialState);

  if (state.status === "success" && open) {
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        data-shortcut="open-status"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 border border-[var(--color-beige-warm)] bg-white px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--color-charcoal)] transition-colors hover:border-[var(--color-charcoal)]"
        title="Changer statut (s)"
      >
        Changer statut
        <ChevronDown size={12} />
        <kbd className="ml-1 inline-flex items-center border border-[var(--color-beige-warm)] bg-[var(--color-cream)] px-1 py-px font-mono text-[9px] normal-case">
          s
        </kbd>
      </button>

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
                <div className="eyebrow">Workflow</div>
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

            <form action={action} className="mt-6 space-y-5">
              <input type="hidden" name="leadId" value={leadId} />

              <div className="grid grid-cols-2 gap-2">
                {LEAD_STATUSES.map((s) => (
                  <StatusButton
                    key={s}
                    status={s}
                    disabled={s === currentStatus}
                  />
                ))}
              </div>

              <label className="block">
                <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
                  Note (optionnelle)
                </span>
                <textarea
                  name="note"
                  rows={3}
                  placeholder="Ex : appelé à 14h30, pas décroché — à rappeler demain…"
                  className="mt-2 w-full border border-[var(--color-beige-warm)] bg-white px-3 py-2.5 text-sm focus:border-[var(--color-charcoal)] focus:outline-none"
                />
              </label>

              {state.status === "error" && (
                <div className="border-l-2 border-[var(--color-terracotta)] bg-[var(--color-cream)] px-3 py-2 text-xs text-[var(--color-charcoal)]">
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

function StatusButton({
  status,
  disabled,
}: {
  status: LeadStatus;
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
