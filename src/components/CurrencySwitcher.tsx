"use client";

import { useEffect, useRef, useState } from "react";
import {
  CURRENCY_LABELS,
  CURRENCY_SYMBOLS,
  useCurrency,
  type Currency,
} from "@/hooks/useCurrency";

const OPTIONS: Currency[] = ["EUR", "USD", "GBP"];

export default function CurrencySwitcher({ locale = "fr" }: { locale?: "fr" | "en" }) {
  const en = locale === "en";
  const { currency, change, hydrated, rates, ratesUnavailable } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative" onKeyDown={(event) => { if (event.key === "Escape") { setOpen(false); ref.current?.querySelector("button")?.focus(); } }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={en ? "Change display currency" : "Changer de devise"}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-[8px] border border-[var(--color-beige-warm)] bg-white px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--color-charcoal)] transition-colors hover:border-[var(--color-charcoal)]"
      >
        {hydrated ? CURRENCY_SYMBOLS[currency] : "€"}
        <span className="font-mono">{hydrated ? currency : "EUR"}</span>
        <span className="text-[8px] text-[var(--color-stone)]">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-1 min-w-[160px] overflow-hidden rounded-[12px] border border-[var(--color-beige-warm)] bg-white shadow-[var(--shadow-card)]">
          {OPTIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                change(c);
                setOpen(false);
              }}
              aria-pressed={c === currency}
              className={`flex w-full items-center justify-between px-3 py-2 text-xs transition-colors ${
                c === currency
                  ? "bg-[var(--color-cream)] text-[var(--color-terracotta)]"
                  : "text-[var(--color-charcoal)] hover:bg-[var(--color-cream)]"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="font-mono">{CURRENCY_SYMBOLS[c]}</span>
                <span>{en ? ({ EUR: "Euro", USD: "US dollar", GBP: "Pound sterling" }[c]) : CURRENCY_LABELS[c]}</span>
              </span>
              <span className="text-[9px] uppercase tracking-[0.22em] text-[var(--color-stone)]">
                {c}
              </span>
            </button>
          ))}
          <p className="border-t border-[var(--color-border)] px-3 py-2 text-[10px] leading-relaxed text-[var(--color-stone)]">{en ? "MAD always shown. USD/GBP are estimates from EUR." : "MAD toujours affiché. USD/GBP estimés depuis l’EUR."} {rates ? `BCE / ECB · ${rates.date}` : ratesUnavailable ? (en ? "Rates unavailable · EUR retained." : "Taux indisponibles · EUR conservé.") : (en ? "Loading rates…" : "Chargement des taux…")}</p>
        </div>
      )}
    </div>
  );
}
