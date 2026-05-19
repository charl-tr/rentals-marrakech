"use client";

import { useActionState } from "react";
import { ArrowRight, Sparkles, TrendingUp, Lock } from "lucide-react";
import Link from "next/link";
import {
  submitEstimationLead,
  type EstimationLeadState,
} from "@/lib/actions/estimation-lead";
import { formatInCurrency } from "@/hooks/useCurrency";
import type { EstimationResult } from "@/lib/estimation";

interface Props {
  result: EstimationResult;
  type: string;
  zone: string;
  surface: number;
  bedrooms?: number;
}

export default function EstimationGate({
  result,
  type,
  zone,
  surface,
  bedrooms,
}: Props) {
  const [state, formAction, isPending] = useActionState<
    EstimationLeadState,
    FormData
  >(submitEstimationLead, { status: "idle" });

  const unlocked = state.status === "success";

  return (
    <div className="mt-8">
      {/* ── Teaser (toujours visible) ──────────────────────────── */}
      <div className="border-l-4 border-[var(--color-terracotta)] bg-white p-8">
        <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--color-terracotta)]">
          <Sparkles size={12} />
          {unlocked ? "Votre fourchette estimée" : "Votre estimation est prête"}
        </div>

        {!unlocked && (
          <>
            {/* Teaser metrics — sans donner les chiffres */}
            <div className="mt-4 flex items-center gap-6 text-sm text-[var(--color-stone)]">
              <span className="flex items-center gap-1.5">
                <TrendingUp
                  size={14}
                  className="text-[var(--color-terracotta)]"
                />
                {result.comparablesCount} biens comparables analysés
              </span>
              <span>·</span>
              <span>
                Confiance{" "}
                <strong className="text-[var(--color-charcoal)]">
                  {result.confidence === "strong"
                    ? "forte"
                    : result.confidence === "moderate"
                    ? "modérée"
                    : "faible"}
                </strong>
              </span>
            </div>

            <div className="mt-6 border-t border-[var(--color-beige-warm)] pt-6">
              <div className="flex items-start gap-3">
                <Lock
                  size={16}
                  className="mt-0.5 flex-shrink-0 text-[var(--color-stone-soft)]"
                />
                <div>
                  <p className="text-sm font-medium text-[var(--color-charcoal)]">
                    Renseignez votre email pour voir la fourchette.
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-stone)]">
                    Un conseiller senior pourra affiner cette estimation avec
                    les transactions off-market récentes.
                  </p>
                </div>
              </div>

              <form action={formAction} className="mt-5">
                <input type="hidden" name="type" value={type} />
                <input type="hidden" name="zone" value={zone} />
                <input type="hidden" name="surface" value={surface} />
                {bedrooms != null && (
                  <input type="hidden" name="bedrooms" value={bedrooms} />
                )}

                <div className="flex gap-3">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="Prénom (optionnel)"
                    className="w-36 border border-[var(--color-beige-warm)] bg-white px-3 py-2.5 text-sm focus:border-[var(--color-charcoal)] focus:outline-none"
                  />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="Votre email"
                    className="flex-1 border border-[var(--color-beige-warm)] bg-white px-3 py-2.5 text-sm focus:border-[var(--color-charcoal)] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isPending}
                    className="btn-gold flex-shrink-0"
                  >
                    {isPending ? "…" : "Voir l’estimation"}
                    {!isPending && <ArrowRight size={14} />}
                  </button>
                </div>

                {state.status === "error" && (
                  <p className="mt-2 text-xs text-[var(--color-alert)]">
                    {state.message}
                  </p>
                )}
              </form>
            </div>
          </>
        )}

        {/* ── Full result (after email) ────────────────────────── */}
        {unlocked && (
          <>
            <div className="mt-4 grid gap-6 md:grid-cols-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-stone)]">
                  Borne basse
                </div>
                <div className="mt-1 font-serif text-2xl text-[var(--color-stone)]">
                  {formatInCurrency(result.estimatedPriceLow, "EUR")}
                </div>
              </div>
              <div className="border-l border-r border-[var(--color-beige-warm)] px-4">
                <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-terracotta)]">
                  Médiane
                </div>
                <div className="mt-1 font-serif text-3xl text-[var(--color-charcoal)]">
                  {formatInCurrency(result.estimatedPriceMid, "EUR")}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-stone)]">
                  Borne haute
                </div>
                <div className="mt-1 font-serif text-2xl text-[var(--color-stone)]">
                  {formatInCurrency(result.estimatedPriceHigh, "EUR")}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--color-beige-warm)] pt-4 text-xs text-[var(--color-stone)]">
              <span className="flex items-center gap-1.5">
                <TrendingUp
                  size={12}
                  className="text-[var(--color-terracotta)]"
                />
                {result.pricePerSqm.toLocaleString("fr-FR")} € / m² médian
              </span>
              <span>·</span>
              <span>
                Confiance :{" "}
                <strong className="text-[var(--color-charcoal)]">
                  {result.confidence === "strong"
                    ? "forte"
                    : result.confidence === "moderate"
                    ? "modérée"
                    : "faible"}
                </strong>
              </span>
              <span>·</span>
              <span>
                {result.comparablesCount} biens comparables analysés
              </span>
            </div>

            {result.notes.length > 0 && (
              <ul className="mt-4 space-y-1 text-xs italic text-[var(--color-stone)]">
                {result.notes.map((n, i) => (
                  <li key={i}>— {n}</li>
                ))}
              </ul>
            )}

            <div className="mt-8 border-t border-[var(--color-beige-warm)] pt-6">
              <p className="text-sm text-[var(--color-charcoal)]">
                Cette fourchette est indicative. Pour une estimation précise
                qui prend en compte l&apos;état du bien, les rénovations
                récentes, les transactions off-market et le contexte du
                marché — parlez à un de nos conseillers.
              </p>
              <Link
                href={`/contact?project=${encodeURIComponent("Vendre — estimation")}`}
                className="btn-outline mt-5"
              >
                Finaliser avec un conseiller
                <ArrowRight size={14} />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
