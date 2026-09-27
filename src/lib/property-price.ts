/** Display recorded prices only: a missing currency is not a live FX quote. */
export function propertyPricePair(eur: number, mad?: number) {
  const format = (value: number, currency: string) => new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
  if (!(eur > 0) && !(mad && mad > 0)) return { primary: "Prix sur demande", secondary: "" };
  return {
    primary: eur > 0 ? format(eur, "EUR") : format(mad!, "MAD"),
    secondary: eur > 0 ? (mad && mad > 0 ? format(mad, "MAD") : "Prix MAD à confirmer") : "Prix EUR à confirmer",
  };
}

export function sourcePriceRange(eur?: string, mad?: string) {
  const valid = (text?: string) => !!text && /^\d+\s*[\/_–—-]\s*\d+\s*(?:€|Dhs|MAD)\s*\/\s*nuit$/i.test(text.trim());
  if (!valid(eur) || !valid(mad)) return null;
  return { primary: eur!.replace(/[\/_–—-]/, '–'), secondary: mad!.replace(/[\/_–—-]/, '–') };
}
