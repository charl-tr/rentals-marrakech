import { formatInCurrency, type Currency, type FxRates } from "./fx";

type Input = {
  priceEur: number; priceMad?: number; sourcePriceEur?: string; sourcePriceMad?: string;
  listing: string; priceUnit?: string;
};
function nightlyRange(raw?: string): [number, number] | null {
  const match = raw?.trim().match(/^(\d+)\s*[\/_–—-]\s*(\d+)\s*(?:€|Dhs|MAD)\s*\/\s*nuit$/i);
  if (!match) return null;
  const min = Number(match[1]), max = Number(match[2]);
  return min > 0 && max >= min ? [min, max] : null;
}
export function displayPropertyPrice(p: Input, currency: Currency, rates: FxRates | null, locale: "fr" | "en") {
  const en = locale === "en";
  const eur = Number.isFinite(p.priceEur) && p.priceEur > 0;
  const mad = Number.isFinite(p.priceMad) && (p.priceMad ?? 0) > 0;
  const eurRange = !eur ? nightlyRange(p.sourcePriceEur) : null;
  const madRange = !mad ? nightlyRange(p.sourcePriceMad) : null;
  const effective = currency === "EUR" || rates ? currency : "EUR";
  const estimated = effective !== "EUR" && !!(eur || eurRange);
  const suffix = p.listing === "vente" ? "" : p.priceUnit === "mois" ? (en ? " / month" : " / mois")
    : p.priceUnit === "semaine" ? (en ? " / week" : " / semaine")
    : (en ? " · rental period to confirm" : " · période à confirmer");
  const format = (amount: number) => formatInCurrency(amount, effective, rates, locale);
  const formatMad = (amount: number) => new Intl.NumberFormat(en ? "en-GB" : "fr-FR", { maximumFractionDigits: 0 }).format(amount) + " MAD";
  const range = (values: [number, number], formatter: (n: number) => string) => values.map(formatter).join(" – ") + (en ? " / night" : " / nuit");
  const primary = eur ? format(p.priceEur) + suffix : eurRange ? range(eurRange, format)
    : en ? "EUR price on request" : "Prix EUR sur demande";
  const secondary = mad ? formatMad(p.priceMad!) + suffix : madRange ? range(madRange, formatMad)
    : en ? "MAD price on request" : "Prix MAD sur demande";
  return {
    primary: (estimated ? "≈ " : "") + primary, secondary, estimated,
    fallback: currency !== "EUR" && !rates,
    date: estimated ? rates?.date : undefined,
  };
}
