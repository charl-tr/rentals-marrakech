// ════════════════════════════════════════════════════════════════════
// Formatage téléphone — indicatif pays + groupement de chiffres dynamique.
// Volontairement sans dépendance (pas de libphonenumber) : liste courte,
// curatée pour la clientèle de l'agence (France/Maroc en tête, puis
// Europe/Amérique du Nord courantes dans l'immobilier de luxe).
// ════════════════════════════════════════════════════════════════════

export interface CountryPhone {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  dial: string; // "+33"
  flag: string;
  maxLength: number; // nombre max de chiffres du numéro national
  groups?: number[]; // groupement fixe (ex. [1,2,2,2,2] → 6 12 34 56 78)
  format?: "us"; // formatage spécial (XXX) XXX-XXXX
}

export const COUNTRIES: CountryPhone[] = [
  { code: "FR", name: "France", dial: "+33", flag: "🇫🇷", groups: [1, 2, 2, 2, 2], maxLength: 9 },
  { code: "MA", name: "Maroc", dial: "+212", flag: "🇲🇦", groups: [1, 2, 2, 2, 2], maxLength: 9 },
  { code: "BE", name: "Belgique", dial: "+32", flag: "🇧🇪", groups: [3, 2, 2, 2], maxLength: 9 },
  { code: "CH", name: "Suisse", dial: "+41", flag: "🇨🇭", groups: [2, 3, 2, 2], maxLength: 9 },
  { code: "ES", name: "Espagne", dial: "+34", flag: "🇪🇸", groups: [3, 2, 2, 2], maxLength: 9 },
  { code: "GB", name: "Royaume-Uni", dial: "+44", flag: "🇬🇧", groups: [4, 6], maxLength: 10 },
  { code: "US", name: "États-Unis", dial: "+1", flag: "🇺🇸", format: "us", maxLength: 10 },
  { code: "CA", name: "Canada", dial: "+1", flag: "🇨🇦", format: "us", maxLength: 10 },
  { code: "DE", name: "Allemagne", dial: "+49", flag: "🇩🇪", groups: [3, 3, 4], maxLength: 11 },
  { code: "IT", name: "Italie", dial: "+39", flag: "🇮🇹", groups: [3, 3, 4], maxLength: 10 },
  { code: "NL", name: "Pays-Bas", dial: "+31", flag: "🇳🇱", groups: [1, 2, 2, 2, 2], maxLength: 9 },
  { code: "PT", name: "Portugal", dial: "+351", flag: "🇵🇹", groups: [3, 3, 3], maxLength: 9 },
  { code: "LU", name: "Luxembourg", dial: "+352", flag: "🇱🇺", groups: [3, 2, 2, 2], maxLength: 9 },
];

export const DEFAULT_COUNTRY = COUNTRIES[0]; // France

/** Groupement dynamique de secours (2 par 2) pour un pays hors liste fixe. */
function genericGroups(len: number): number[] {
  const groups: number[] = [];
  let remaining = len;
  while (remaining > 0) {
    const g = Math.min(2, remaining);
    groups.push(g);
    remaining -= g;
  }
  return groups;
}

/** Formate des chiffres nationaux selon le pays — appelé à chaque frappe. */
export function formatNational(digitsRaw: string, country: CountryPhone): string {
  let digits = digitsRaw.replace(/\D/g, "");
  // Un 0 de tronc initial (convention locale FR/MA/BE/CH/ES/IT/NL) ne fait
  // pas partie du numéro international — on l'ignore. Non pertinent pour
  // US/CA (le numéro ne commence jamais par 0 dans leur plan de numérotation).
  if (digits.startsWith("0") && country.code !== "US" && country.code !== "CA") {
    digits = digits.slice(1);
  }
  digits = digits.slice(0, country.maxLength);
  if (digits.length === 0) return "";

  if (country.format === "us") {
    const p1 = digits.slice(0, 3);
    const p2 = digits.slice(3, 6);
    const p3 = digits.slice(6, 10);
    if (digits.length > 6) return `(${p1}) ${p2}-${p3}`;
    if (digits.length > 3) return `(${p1}) ${p2}`;
    return `(${p1}`;
  }

  const groups = country.groups ?? genericGroups(digits.length);
  const parts: string[] = [];
  let idx = 0;
  for (const g of groups) {
    if (idx >= digits.length) break;
    parts.push(digits.slice(idx, idx + g));
    idx += g;
  }
  if (idx < digits.length) parts.push(digits.slice(idx));
  return parts.join(" ");
}

/**
 * Détecte le pays à partir d'un numéro international collé/tapé
 * ("+33 6 12 34 56 78", "0033612345678"…). Match par indicatif le plus long
 * d'abord (pour ne pas confondre +1 avec +33 par ex.).
 */
export function detectCountry(
  input: string
): { country: CountryPhone; nationalDigits: string } | null {
  let s = input.trim();
  if (s.startsWith("00")) s = "+" + s.slice(2);
  if (!s.startsWith("+")) return null;
  const compact = "+" + s.slice(1).replace(/\D/g, "");
  const sorted = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
  for (const c of sorted) {
    if (compact.startsWith(c.dial)) {
      return { country: c, nationalDigits: compact.slice(c.dial.length) };
    }
  }
  return null;
}
