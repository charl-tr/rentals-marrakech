"use client";
import { useActionState } from "react";
import { CalendarPlus } from "lucide-react";
import { scheduleVisit } from "@/lib/actions/leads-admin";
import type { MutationState } from "@/lib/actions/_core/defineMutation";

const INIT: MutationState = { status: "idle" };

export default function VisitScheduler({
  leadId,
  defaultPropertySlug,
  existingVisit,
}: {
  leadId: string;
  defaultPropertySlug?: string;
  existingVisit?: { at: string; propertySlug: string } | null;
}) {
  const [state, action, pending] = useActionState(scheduleVisit, INIT);

  // Convert ISO to datetime-local format
  const toLocal = (iso: string) => iso.slice(0, 16);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="leadId" value={leadId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)] mb-2">
            Date &amp; heure
          </label>
          <input
            type="datetime-local"
            name="visitAt"
            required
            defaultValue={existingVisit ? toLocal(existingVisit.at) : ""}
            className="w-full border border-[var(--color-beige-warm)] bg-white px-3 py-2.5 text-sm text-[var(--color-charcoal)] focus:border-[var(--color-charcoal)] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)] mb-2">
            Bien (slug)
          </label>
          <input
            type="text"
            name="propertySlug"
            required
            placeholder="ex: villa-palmeraie-xyz"
            defaultValue={existingVisit?.propertySlug ?? defaultPropertySlug ?? ""}
            className="w-full border border-[var(--color-beige-warm)] bg-white px-3 py-2.5 text-sm text-[var(--color-charcoal)] placeholder:text-[var(--color-stone)]/50 focus:border-[var(--color-charcoal)] focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)] mb-2">
          Note (optionnel)
        </label>
        <input
          type="text"
          name="note"
          placeholder="Instructions de visite, RDV, contact..."
          className="w-full border border-[var(--color-beige-warm)] bg-white px-3 py-2.5 text-sm text-[var(--color-charcoal)] placeholder:text-[var(--color-stone)]/50 focus:border-[var(--color-charcoal)] focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 bg-[var(--color-charcoal)] px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.22em] text-white transition-colors hover:bg-[var(--color-terracotta)] disabled:opacity-50"
        >
          <CalendarPlus size={13} />
          {existingVisit ? "Modifier la visite" : "Programmer une visite"}
        </button>
        {state.status === "success" && (
          <span className="text-xs text-[var(--color-terracotta)]">
            ✓ {state.message}
          </span>
        )}
        {state.status === "error" && (
          <span className="text-xs text-red-600">{state.message}</span>
        )}
      </div>
    </form>
  );
}
