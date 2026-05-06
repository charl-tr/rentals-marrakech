import type { AdminLead } from "@/lib/leads";
import type { Property } from "@/data/properties";

export interface MatchResult {
  score: number; // 0–100
  reasons: string[];
}

export function computeMatchScore(lead: AdminLead, property: Property): MatchResult {
  // Only match buyer leads against sale properties
  if (lead.intent !== "acheter") return { score: 0, reasons: [] };
  if (property.listing !== "vente" && property.type !== "programme-neuf") return { score: 0, reasons: [] };

  let score = 0;
  const reasons: string[] = [];

  // Budget (40 pts) — property.price <= lead budget, with 15% tolerance
  const budgetMax = lead.buyer.budget.max;
  if (budgetMax <= 0) {
    score += 40;
    reasons.push("Budget non contraint");
  } else if (property.price <= budgetMax) {
    score += 40;
    reasons.push(`Dans le budget (${(property.price / 1e6).toFixed(1)} M€ ≤ ${(budgetMax / 1e6).toFixed(1)} M€)`);
  } else if (property.price <= budgetMax * 1.15) {
    score += 20;
    reasons.push(`Légèrement au-dessus du budget`);
  }

  // Type (25 pts)
  const types = lead.buyer.criteria.types;
  if (types.length === 0) {
    score += 25;
  } else if (types.includes(property.type)) {
    score += 25;
    reasons.push(`Type correspondant (${property.type})`);
  }

  // Neighborhood (20 pts)
  const hoods = lead.buyer.criteria.neighborhoods;
  if (hoods.length === 0) {
    score += 20;
  } else if (property.neighborhoodSlug && hoods.includes(property.neighborhoodSlug)) {
    score += 20;
    reasons.push(`Quartier souhaité (${property.neighborhood})`);
  }

  // Bedrooms (15 pts)
  const bedroomsMin = lead.buyer.criteria.bedroomsMin;
  if (bedroomsMin <= 0) {
    score += 15;
  } else if (property.bedrooms >= bedroomsMin) {
    score += 15;
    reasons.push(`${property.bedrooms} ch. ≥ min ${bedroomsMin}`);
  }

  return { score, reasons };
}

export interface PropertyWithMatches {
  property: Property;
  matches: Array<{ lead: AdminLead; score: number; reasons: string[] }>;
}

export function buildPropertyMatches(
  properties: Property[],
  leads: AdminLead[],
  minScore = 40
): PropertyWithMatches[] {
  const activeBuyers = leads.filter(
    (l) => l.intent === "acheter" && l.status !== "signed" && l.status !== "lost"
  );

  return properties
    .filter((p) => p.listing === "vente" || p.type === "programme-neuf")
    .map((property) => {
      const matches = activeBuyers
        .map((lead) => ({ lead, ...computeMatchScore(lead, property) }))
        .filter((m) => m.score >= minScore)
        .sort((a, b) => b.score - a.score);
      return { property, matches };
    })
    .filter((r) => r.matches.length > 0)
    .sort((a, b) => b.matches.length - a.matches.length);
}
