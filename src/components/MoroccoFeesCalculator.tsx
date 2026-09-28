"use client";

import { useState } from "react";
import { Calculator, Info } from "lucide-react";
import { calculateMoroccoFees } from "@/lib/morocco-fees";
import { useCurrency, formatInCurrency } from "@/hooks/useCurrency";

// ════════════════════════════════════════════════════════════════════
// Widget "Frais d'acquisition au Maroc" — calculette client.
// Prix EN EUR entré par l'utilisateur. Output en devise courante.
// ════════════════════════════════════════════════════════════════════

export default function MoroccoFeesCalculator({
  initialPrice = 500_000,
  compact = false,
  locale = "fr",
}: {
  initialPrice?: number;
  compact?: boolean;
  locale?: "fr" | "en";
}) {
  const en = locale === "en";
  const feeNames: Record<string, string> = { "Droits d'enregistrement": "Registration fees", "Conservation foncière": "Land registry", "Taxe notariale": "Notarial tax", "Honoraires notaire": "Notary fees", "Frais divers": "Other costs" };
  const [price, setPrice] = useState(initialPrice);
  const [listing, setListing] = useState<"ancien" | "neuf">("ancien");
  const { currency, hydrated, rates } = useCurrency();
  const effective = hydrated ? currency : "EUR";

  const result = calculateMoroccoFees({
    price,
    listing,
    buyerProfile: "non-resident",
  });

  return (
    <div
      className={`rounded-[14px] border border-[var(--color-beige-warm)] bg-white ${
        compact ? "p-5" : "p-8"
      }`}
    >
      <div className="flex items-center gap-2.5 text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--color-terracotta)]">
        <Calculator size={12} />
        {en ? "Morocco buying cost estimate" : <>Calculette frais d&apos;acquisition Maroc</>}
      </div>

      {!compact && (
        <h3 className="mt-3 font-serif text-2xl text-[var(--color-charcoal)]">
          {en ? "What could the total purchase cost be?" : <>Combien va me coûter l&apos;acquisition au total ?</>}
        </h3>
      )}

      <p className="mt-2 text-xs text-[var(--color-stone)]">
        {en ? "Indicative estimate using the same assumptions as the French calculator. Confirm the applicable fees with your notary before committing." : <>Les frais d&apos;acquisition au Maroc représentent 6 à 8 % du prix. Détail des composantes, calculé en temps réel.</>}
      </p>

      {effective !== "EUR" && <p className="mt-2 text-xs text-[var(--color-stone)]">{rates ? (en ? `≈ Currency estimate · ECB ${rates.date}` : `≈ Conversion indicative · BCE ${rates.date}`) : (en ? "Conversion unavailable · EUR shown" : "Conversion indisponible · affichage EUR")}</p>}
      {/* Inputs */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
        <label className="block">
          <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
            {en ? "Property price (EUR)" : "Prix du bien (EUR)"}
          </span>
          <input
            type="number"
            min={10_000}
            step={10_000}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value) || 0)}
            className="field mt-1.5"
          />
        </label>

        <label className="block">
          <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
            {en ? "Property type" : "Type de bien"}
          </span>
          <select
            value={listing}
            onChange={(e) => setListing(e.target.value as "ancien" | "neuf")}
            className="field mt-1.5"
          >
            <option value="ancien">{en ? "Resale property" : <>Ancien (bien d&apos;occasion)</>}</option>
            <option value="neuf">{en ? "New development" : "Neuf (promoteur)"}</option>
          </select>
        </label>
      </div>

      {/* Breakdown */}
      <div className="mt-6 divide-y divide-[var(--color-beige-warm)] border-t border-[var(--color-beige-warm)]">
        {result.breakdown.map((b, i) => (
          <div key={i} className="py-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--color-charcoal)]">
                    {en ? feeNames[b.item] ?? b.item : b.item}
                  </span>
                  {b.baseRate && (
                    <span className="text-[10px] text-[var(--color-stone)]">
                      ({en ? b.baseRate.replace("frais fixes", "fixed fees") : b.baseRate})
                    </span>
                  )}
                </div>
                {!compact && (
                  <p className="mt-0.5 text-[11px] text-[var(--color-stone)]">
                    <span lang={en ? "fr" : undefined}>{b.description}</span>
                  </p>
                )}
              </div>
              <span className="font-serif text-sm text-[var(--color-charcoal)]">
                {formatInCurrency(b.amount, effective, rates, locale)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="mt-4 rounded-[10px] border-t-2 border-[var(--color-charcoal)] bg-[var(--color-cream)] p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
            {en ? "Total fees" : "Frais totaux"}
          </span>
          <span className="font-serif text-xl text-[var(--color-terracotta)]">
            {formatInCurrency(result.totalFees, effective, rates, locale)}
          </span>
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-[9px] uppercase tracking-[0.22em] text-[var(--color-stone)]">
            {en ? "Approximately" : "Soit"} {result.feesAsPct.toFixed(1).replace(".", en ? "." : ",")} % {en ? "of the price" : "du prix"}
          </span>
        </div>
        <div className="mt-3 flex items-baseline justify-between border-t border-[var(--color-beige-warm)] pt-3">
          <span className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--color-charcoal)]">
            {en ? "Total purchase cost" : "Coût total acquisition"}
          </span>
          <span className="font-serif text-2xl text-[var(--color-charcoal)]">
            {formatInCurrency(result.totalWithFees, effective, rates, locale)}
          </span>
        </div>
      </div>

      {!compact && (
        <div className="mt-5 flex items-start gap-2 rounded-[10px] bg-[var(--color-cream)] p-3 text-[11px] text-[var(--color-stone)]">
          <Info size={12} className="mt-0.5 flex-shrink-0 text-[var(--color-terracotta)]" />
          <span>
            {en ? "Illustrative estimate only. Rates and fees depend on your transaction. Obtain a quote from your notary before signing." : <>Estimation indicative. Les taux peuvent varier selon le notaire, la zone, et des cas particuliers (partage, viager). Votre conseiller vous fournira un devis précis avant signature.</>}
          </span>
        </div>
      )}
    </div>
  );
}
