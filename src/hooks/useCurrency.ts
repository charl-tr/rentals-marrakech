"use client";

import { useCallback, useEffect, useState } from "react";

// ════════════════════════════════════════════════════════════════════
// useCurrency — devise d'affichage choisie par l'utilisateur.
//
// Persiste en localStorage. Sync cross-onglets via storage event.
// Taux hardcodés pour MVP — à remplacer par API (ex OpenExchangeRates)
// quand on monte en volume.
// ════════════════════════════════════════════════════════════════════

export type Currency = "EUR" | "MAD" | "GBP" | "USD";

const STORAGE_KEY = "mr:currency";
const EVENT_NAME = "mr:currency:change";

// Taux depuis EUR (base). Mis à jour périodiquement.
// 2026-04 mid-cycle — conservateurs.
export const RATES_FROM_EUR: Record<Currency, number> = {
  EUR: 1,
  MAD: 10.7,
  GBP: 0.85,
  USD: 1.08,
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  EUR: "€",
  MAD: "DH",
  GBP: "£",
  USD: "$",
};

export const CURRENCY_LABELS: Record<Currency, string> = {
  EUR: "Euro",
  MAD: "Dirham marocain",
  GBP: "Livre sterling",
  USD: "Dollar US",
};

function readCurrency(): Currency {
  if (typeof window === "undefined") return "EUR";
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === "EUR" || raw === "MAD" || raw === "GBP" || raw === "USD") {
    return raw;
  }
  return "EUR";
}

function writeCurrency(c: Currency) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, c);
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: c }));
}

export function useCurrency() {
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCurrency(readCurrency());
    setHydrated(true);

    const onChange = (e: Event) => {
      const custom = e as CustomEvent<Currency>;
      setCurrency(custom.detail);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setCurrency(readCurrency());
    };
    window.addEventListener(EVENT_NAME, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(EVENT_NAME, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const change = useCallback((c: Currency) => writeCurrency(c), []);

  return { currency, change, hydrated };
}

// ── Conversion + formatting helpers ─────────────────────────────────

export function convertFromEUR(amountEur: number, target: Currency): number {
  return amountEur * RATES_FROM_EUR[target];
}

export function formatInCurrency(amountEur: number, target: Currency): string {
  const amount = convertFromEUR(amountEur, target);
  // MAD a une convention différente (milliers séparés par espace, pas de décimales)
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: target,
    maximumFractionDigits: 0,
  }).format(amount);
}
