"use client";

import { useSyncExternalStore } from "react";
import { isCurrency, validRates, type Currency, type FxRates } from "@/lib/fx";
export { convertFromEUR, formatInCurrency, type Currency } from "@/lib/fx";

const STORAGE_KEY = "mr:currency";
const EVENT_NAME = "mr:currency:change";
let current: Currency = "EUR";
let loaded = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(fn => fn());
function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    current = isCurrency(raw) ? raw : "EUR"; // migrate the old MAD-only preference
  } catch { /* Keep in-memory preference when storage is blocked. */ }
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    if (!loaded) { read(); loaded = true; }
    window.addEventListener("storage", onStorage);
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size) window.removeEventListener("storage", onStorage);
  };
}
function onStorage(event: StorageEvent) {
  if (event.key === STORAGE_KEY || event.key === null) { read(); emit(); }
}
function change(currency: Currency) {
  if (!isCurrency(currency)) return;
  current = currency;
  try { localStorage.setItem(STORAGE_KEY, currency); } catch { /* memory still works */ }
  emit();
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: currency }));
}

type FxState = { rates: FxRates | null; unavailable: boolean };
const initialFx: FxState = { rates: null, unavailable: false };
let fx: FxState = initialFx;
let pending: Promise<void> | null = null;
let nextRefresh = 0;
const fxListeners = new Set<() => void>();
async function refreshRates() {
  if (pending || Date.now() < nextRefresh) return pending;
  pending = (async () => {
    try {
      const response = await fetch("/api/exchange-rates", { signal: AbortSignal.timeout(10000) });
      const value: unknown = await response.json();
      if (!response.ok || !validRates(value)) throw new Error("No valid quote");
      fx = { rates: value, unavailable: false };
      nextRefresh = Date.now() + 3600000;
    } catch {
      fx = { rates: fx.rates && validRates(fx.rates) ? fx.rates : null, unavailable: true };
      nextRefresh = Date.now() + 60000;
    } finally {
      pending = null;
      fxListeners.forEach(fn => fn());
    }
  })();
  return pending;
}
let refreshTimer: ReturnType<typeof setInterval> | null = null;
function subscribeRates(listener: () => void) {
  fxListeners.add(listener);
  if (fxListeners.size === 1) {
    void refreshRates();
    refreshTimer = setInterval(() => {
      if (document.visibilityState === "visible") void refreshRates();
    }, 60000);
  }
  return () => {
    fxListeners.delete(listener);
    if (!fxListeners.size && refreshTimer) { clearInterval(refreshTimer); refreshTimer = null; }
  };
}
export function useCurrency() {
  const currency = useSyncExternalStore(subscribe, () => current, () => "EUR" as Currency);
  const state = useSyncExternalStore(subscribeRates, () => fx, () => initialFx);
  return { currency, change, hydrated: true, rates: state.rates, ratesUnavailable: state.unavailable };
}
export const CURRENCY_SYMBOLS: Record<Currency, string> = { EUR: "€", GBP: "£", USD: "$" };
export const CURRENCY_LABELS: Record<Currency, string> = { EUR: "Euro", GBP: "Livre sterling", USD: "Dollar US" };
