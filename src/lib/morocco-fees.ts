// ════════════════════════════════════════════════════════════════════
// Frais d'acquisition immobilière au Maroc — barèmes 2026
// ════════════════════════════════════════════════════════════════════
// Source : code général des impôts marocain + pratiques notariales Marrakech.
// Les pourcentages peuvent varier selon zone / bien neuf vs ancien.
// À réviser annuellement ou quand la loi de finances change.
// ════════════════════════════════════════════════════════════════════

export interface FeeBreakdown {
  item: string;
  description: string;
  amount: number;
  baseRate?: string; // label du taux ex "4%"
}

export interface FeesResult {
  propertyPrice: number;
  breakdown: FeeBreakdown[];
  totalFees: number;
  totalWithFees: number; // prix + frais
  feesAsPct: number; // pourcentage des frais sur prix
}

export interface FeesInput {
  price: number;
  listing: "ancien" | "neuf"; // régime fiscal différent
  buyerProfile: "resident" | "non-resident"; // impact IR éventuel
}

/**
 * Calcule les frais d'acquisition d'un bien au Maroc.
 *
 * Structure :
 * - Droits d'enregistrement : 4% (ancien) / 5% (neuf)
 * - Conservation foncière : 1% + 150 DH fixe
 * - Taxe notariale : 0.5%
 * - Honoraires notaire : 1% (dégressif au-delà, simplification MVP)
 * - Frais divers (copies, timbres, CIN conservation) : ~3 000 DH
 */
export function calculateMoroccoFees(input: FeesInput): FeesResult {
  const { price, listing } = input;

  // Droits d'enregistrement
  const droitsEnregistrementPct = listing === "neuf" ? 0.05 : 0.04;
  const droitsEnregistrement = price * droitsEnregistrementPct;

  // Conservation foncière (droit fixe + pourcentage)
  // ~10,70 MAD/EUR → 150 DH ≈ 14 €. Base 1% du prix.
  const conservationPct = 0.01;
  const conservationFixed = 14; // ≈ 150 DH en EUR
  const conservation = price * conservationPct + conservationFixed;

  // Taxe notariale
  const taxeNotariale = price * 0.005;

  // Honoraires notaire (barème simplifié MVP : 1% du prix, palier unique)
  // En réalité : dégressif par tranches. On simplifie.
  const honorairesNotaire = Math.max(3_000, price * 0.01);

  // Frais divers (CIN, copies, timbres, récépissés)
  const fraisDivers = 280; // ≈ 3 000 DH en EUR

  const breakdown: FeeBreakdown[] = [
    {
      item: "Droits d'enregistrement",
      description:
        listing === "neuf"
          ? "Bien neuf (TVA incluse côté vendeur) — 5 % du prix"
          : "Bien ancien — 4 % du prix",
      amount: droitsEnregistrement,
      baseRate: `${(droitsEnregistrementPct * 100).toFixed(0)} %`,
    },
    {
      item: "Conservation foncière",
      description: "Publicité foncière + inscription au titre foncier",
      amount: conservation,
      baseRate: "1 % + frais fixes",
    },
    {
      item: "Taxe notariale",
      description: "Tax sur l'acte authentique",
      amount: taxeNotariale,
      baseRate: "0,5 %",
    },
    {
      item: "Honoraires notaire",
      description:
        "Barème légal — dégressif par tranches. Estimation conservatrice.",
      amount: honorairesNotaire,
      baseRate: "~1 %",
    },
    {
      item: "Frais divers",
      description: "Copies, timbres, récépissés, légalisations",
      amount: fraisDivers,
    },
  ];

  const totalFees = breakdown.reduce((sum, b) => sum + b.amount, 0);

  return {
    propertyPrice: price,
    breakdown,
    totalFees,
    totalWithFees: price + totalFees,
    feesAsPct: (totalFees / price) * 100,
  };
}

// ── Simulation plus-value revente pour non-résidents ─────────────────
//
// En cas de revente par un non-résident :
// - IR sur plus-value : 20 % du gain (avec exonération si durée > 10 ans)
// - Abattement : 10 % par an à partir de la 5e année
//
export interface ResaleInput {
  purchasePrice: number;
  salePrice: number;
  yearsHeld: number;
  isNonResident: boolean;
}

export interface ResaleResult {
  grossGain: number;
  abatementPct: number;
  taxableGain: number;
  irTax: number;
  netAfterTax: number;
}

export function calculateResaleTax(input: ResaleInput): ResaleResult {
  const grossGain = input.salePrice - input.purchasePrice;

  // Abattement 10 %/an dès 5 ans, exoné totale après 10 ans
  let abatementPct = 0;
  if (input.yearsHeld >= 10) abatementPct = 100;
  else if (input.yearsHeld >= 5) abatementPct = (input.yearsHeld - 4) * 10;

  const taxableGain = Math.max(0, grossGain * (1 - abatementPct / 100));
  const irRate = 0.2;
  const irTax = taxableGain * irRate;
  const netAfterTax = input.salePrice - irTax;

  return {
    grossGain,
    abatementPct,
    taxableGain,
    irTax,
    netAfterTax,
  };
}
