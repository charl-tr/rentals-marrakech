/** Display recorded prices only: a missing currency is not a live FX quote. */
export function propertyPricePair(eur: number, mad?: number) {
  const format = (value: number, currency: string) => new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
  if (!(eur > 0) && !(mad && mad > 0)) return { primary: "Prix sur demande", secondary: "" };
  return {
    primary: mad && mad > 0 ? format(mad, "MAD") : format(eur, "EUR"),
    secondary: mad && mad > 0 ? (eur > 0 ? format(eur, "EUR") : "Prix EUR à confirmer") : "Prix MAD à confirmer",
  };
}
