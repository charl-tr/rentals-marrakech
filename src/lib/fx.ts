export type Currency = "EUR" | "USD" | "GBP";
export type FxRates = { base: "EUR"; date: string; source: "ECB"; rates: Record<Currency, number> };
export const ECB_RATES_URL = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml";

export function isCurrency(value: unknown): value is Currency {
  return value === "EUR" || value === "USD" || value === "GBP";
}

// Weekends/holidays are normal. Reject future, malformed or very old quotes.
export function validRates(value: unknown, now = Date.now()): value is FxRates {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<FxRates>;
  const date = Date.parse(v.date ?? "");
  return v.base === "EUR" && v.source === "ECB" && /^\d{4}-\d{2}-\d{2}$/.test(v.date ?? "") &&
    Number.isFinite(date) && date <= now + 86400000 && now - date <= 7 * 86400000 &&
    v.rates?.EUR === 1 && [v.rates.USD, v.rates.GBP].every(n => typeof n === "number" && Number.isFinite(n) && n > 0 && n < 100);
}

export function parseEcbRates(xml: string, now = Date.now()): FxRates {
  const date = xml.match(/\btime=['"](\d{4}-\d{2}-\d{2})['"]/)?.[1] ?? "";
  const rate = (currency: string) => {
    const cube = xml.match(new RegExp("<Cube\\b[^>]*currency=['\"]" + currency + "['\"][^>]*>"))?.[0];
    return Number(cube?.match(/\brate=['"]([0-9.]+)['"]/)?.[1]);
  };
  const value: FxRates = { base: "EUR", date, source: "ECB", rates: { EUR: 1, USD: rate("USD"), GBP: rate("GBP") } };
  if (!validRates(value, now)) throw new Error("Invalid or stale ECB rates");
  return value;
}

export function convertFromEUR(amount: number, currency: Currency, rates?: FxRates | null): number | null {
  if (!Number.isFinite(amount)) return null;
  if (currency === "EUR") return amount;
  return rates ? amount * rates.rates[currency] : null;
}

export function formatInCurrency(amount: number, currency: Currency, rates?: FxRates | null, locale = "fr") {
  const converted = convertFromEUR(amount, currency, rates);
  // An unavailable quote must never turn a euro number into a USD/GBP label.
  return new Intl.NumberFormat(locale === "en" ? "en-GB" : "fr-FR", {
    style: "currency", currency: converted === null ? "EUR" : currency, maximumFractionDigits: 0,
  }).format(converted ?? amount);
}

export function budgetLabel(bucket: { min?: number; max?: number }, currency: Currency, rates: FxRates | null, locale: "fr" | "en", monthly = false) {
  const en = locale === "en";
  const format = (amount: number) => formatInCurrency(amount, currency, rates, locale);
  const prefix = currency !== "EUR" && rates ? "≈ " : "";
  const range = bucket.min && bucket.max ? format(bucket.min) + " — " + format(bucket.max)
    : bucket.min ? (en ? "Over " : "Plus de ") + format(bucket.min)
    : (en ? "Up to " : "Jusqu’à ") + format(bucket.max ?? 0);
  return prefix + range + (monthly ? en ? " / month" : " / mois" : "");
}
