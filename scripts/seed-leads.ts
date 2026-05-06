/**
 * Seed la table `leads` (+ `lead_events`) avec un volume démo réaliste.
 *
 * ~48 leads, répartis sur 5 conseillers, 8 statuts, variés en origine /
 * budget / canal / timeline. Chaque lead a 0-5 events selon son stade.
 *
 * Idempotent : tag meta.seed_version = "v2" + suppression des précédents
 * avant réinsertion. Les leads réels (formulaires publics) sont préservés.
 *
 * Run : npx tsx scripts/seed-leads.ts
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE) {
  throw new Error("Manquant : NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const SEED_VERSION = "v2";
const NOW = new Date();
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3_600_000);
const daysAgo = (d: number) => new Date(NOW.getTime() - d * 86_400_000);
const daysFromNow = (d: number) => new Date(NOW.getTime() + d * 86_400_000);

// ── Archétypes d'acheteurs ────────────────────────────────────────
interface BuyerArchetype {
  name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  languages: string[];
  budgetMax: number;
  preferredZone: "medina" | "palmeraie" | "hivernage" | "essaouira";
  preferredType: "riad-renove" | "riad-a-renover" | "villa" | "appartement" | "maison-hotes" | "programme-neuf";
}

const ARCHETYPES: BuyerArchetype[] = [
  // FR — Paris / province
  { name: "Jean Dupont", email: "j.dupont@protonmail.com", phone: "+33 6 12 34 56 78", city: "Paris", country: "France", languages: ["FR", "EN"], budgetMax: 2500000, preferredZone: "palmeraie", preferredType: "villa" },
  { name: "Claire Dubois", email: "claire.dubois@gmail.com", phone: "+33 6 45 89 12 34", city: "Lyon", country: "France", languages: ["FR"], budgetMax: 700000, preferredZone: "medina", preferredType: "riad-renove" },
  { name: "François Arnault", email: "f.arnault@arnaultpatrimoine.fr", phone: "+33 6 55 44 33 22", city: "Paris", country: "France", languages: ["FR"], budgetMax: 1500000, preferredZone: "palmeraie", preferredType: "villa" },
  { name: "Catherine Albret", email: "c.albret@albret-family.fr", phone: "+33 6 78 90 12 34", city: "Bordeaux", country: "France", languages: ["FR"], budgetMax: 900000, preferredZone: "medina", preferredType: "riad-renove" },
  { name: "Élodie Maréchal", email: "elodie.marechal@outlook.fr", phone: "+33 6 22 44 66 88", city: "Marseille", country: "France", languages: ["FR"], budgetMax: 800000, preferredZone: "essaouira", preferredType: "maison-hotes" },
  { name: "Pierre Vasseur", email: "p.vasseur@vasseur-notaires.fr", phone: "+33 6 11 22 33 44", city: "Nice", country: "France", languages: ["FR"], budgetMax: 450000, preferredZone: "hivernage", preferredType: "appartement" },
  { name: "Isabelle Lefevre", email: "isabelle.lefevre@cabinet-lf.fr", phone: "+33 6 87 65 43 21", city: "Toulouse", country: "France", languages: ["FR", "EN"], budgetMax: 550000, preferredZone: "hivernage", preferredType: "appartement" },
  { name: "Olivier Beaumont", email: "olivier.beaumont@beaumont-gest.fr", phone: "+33 6 33 22 11 00", city: "Nantes", country: "France", languages: ["FR"], budgetMax: 1200000, preferredZone: "palmeraie", preferredType: "villa" },
  // BE / CH / LU — Benelux + Suisse
  { name: "Amélie Rousseau", email: "amelie.rousseau@rousseau-conseil.be", phone: "+32 475 12 34 56", city: "Bruxelles", country: "Belgique", languages: ["FR", "EN"], budgetMax: 900000, preferredZone: "essaouira", preferredType: "maison-hotes" },
  { name: "Yannick Lefebvre", email: "yannick.lefebvre@lefebvre-groupe.fr", phone: "+41 22 789 01 23", city: "Genève", country: "Suisse", languages: ["FR", "EN"], budgetMax: 3000000, preferredZone: "palmeraie", preferredType: "villa" },
  { name: "Margaux Delvaux", email: "m.delvaux@delvaux-avocats.be", phone: "+32 478 56 78 90", city: "Anvers", country: "Belgique", languages: ["FR", "EN"], budgetMax: 680000, preferredZone: "medina", preferredType: "riad-renove" },
  { name: "Éric Bauer", email: "eric.bauer@bauer-holding.ch", phone: "+41 79 345 67 89", city: "Zurich", country: "Suisse", languages: ["FR", "EN"], budgetMax: 2200000, preferredZone: "palmeraie", preferredType: "villa" },
  // DE / AT — DACH
  { name: "Hans Böhmer", email: "h.boehmer@boehmer-holding.de", phone: "+49 89 1234 5678", city: "Munich", country: "Allemagne", languages: ["DE", "EN"], budgetMax: 1800000, preferredZone: "palmeraie", preferredType: "villa" },
  { name: "Petra Keller", email: "p.keller@kellerbau.de", phone: "+49 30 9876 5432", city: "Berlin", country: "Allemagne", languages: ["DE", "EN"], budgetMax: 950000, preferredZone: "medina", preferredType: "riad-renove" },
  { name: "Klaus Reiner", email: "klaus@reiner-partners.at", phone: "+43 1 234 56 78", city: "Vienne", country: "Autriche", languages: ["DE", "EN"], budgetMax: 750000, preferredZone: "hivernage", preferredType: "appartement" },
  // UK / US — anglophones
  { name: "Sarah Mitchell", email: "sarah.mitchell@mitchellassoc.co.uk", phone: "+44 20 7946 0123", city: "Londres", country: "Royaume-Uni", languages: ["EN", "FR"], budgetMax: 650000, preferredZone: "medina", preferredType: "riad-renove" },
  { name: "James Whitaker", email: "jwhitaker@whitaker-cap.co.uk", phone: "+44 207 123 4567", city: "Londres", country: "Royaume-Uni", languages: ["EN"], budgetMax: 2400000, preferredZone: "palmeraie", preferredType: "villa" },
  { name: "Sophia Reiner", email: "sophia@reinerlaw.com", phone: "+1 212 555 0198", city: "New York", country: "États-Unis", languages: ["EN", "FR"], budgetMax: 550000, preferredZone: "medina", preferredType: "riad-renove" },
  { name: "Tom Anderson", email: "tom.anderson@andersoncap.com", phone: "+1 415 555 0142", city: "San Francisco", country: "États-Unis", languages: ["EN"], budgetMax: 1900000, preferredZone: "palmeraie", preferredType: "villa" },
  { name: "Julia Thompson", email: "j.thompson@thompsonpartners.com", phone: "+1 310 555 0156", city: "Los Angeles", country: "États-Unis", languages: ["EN"], budgetMax: 3500000, preferredZone: "palmeraie", preferredType: "villa" },
  // IT / ES / PT
  { name: "Marco Lorenzi", email: "m.lorenzi@lorenzi-group.it", phone: "+39 02 9876 5432", city: "Milan", country: "Italie", languages: ["IT", "EN", "FR"], budgetMax: 850000, preferredZone: "hivernage", preferredType: "appartement" },
  { name: "Chiara Romano", email: "chiara.romano@romano-archi.it", phone: "+39 06 4567 8901", city: "Rome", country: "Italie", languages: ["IT", "EN"], budgetMax: 1300000, preferredZone: "palmeraie", preferredType: "villa" },
  { name: "Carlos Vega", email: "carlos.vega@vega-inversiones.es", phone: "+34 91 234 56 78", city: "Madrid", country: "Espagne", languages: ["ES", "EN"], budgetMax: 720000, preferredZone: "essaouira", preferredType: "villa" },
  { name: "Pedro Costa", email: "p.costa@costa-imobiliaria.pt", phone: "+351 21 987 65 43", city: "Lisbonne", country: "Portugal", languages: ["PT", "EN", "FR"], budgetMax: 620000, preferredZone: "medina", preferredType: "riad-renove" },
  // Autres — NL, SE, AE, RU, CA
  { name: "Marloes van Dijk", email: "m.vandijk@vandijk-design.nl", phone: "+31 20 123 45 67", city: "Amsterdam", country: "Pays-Bas", languages: ["EN", "FR"], budgetMax: 920000, preferredZone: "essaouira", preferredType: "maison-hotes" },
  { name: "Viktor Hansson", email: "viktor@hansson-ventures.se", phone: "+46 8 555 44 33", city: "Stockholm", country: "Suède", languages: ["EN"], budgetMax: 1100000, preferredZone: "palmeraie", preferredType: "villa" },
  { name: "Ahmed Al-Sayed", email: "a.alsayed@alsayed-inv.ae", phone: "+971 50 123 4567", city: "Dubaï", country: "Émirats", languages: ["EN", "AR"], budgetMax: 4000000, preferredZone: "palmeraie", preferredType: "villa" },
  { name: "Léa Tremblay", email: "lea.tremblay@tremblay-ca.ca", phone: "+1 514 555 0199", city: "Montréal", country: "Canada", languages: ["FR", "EN"], budgetMax: 580000, preferredZone: "medina", preferredType: "riad-renove" },
];

// ── Messages types par intent + zone ──────────────────────────────
const MESSAGES: Record<string, string[]> = {
  palmeraie_villa: [
    "Villa Palmeraie, grande parcelle, piscine. Résidence secondaire famille. Visite possible prochainement.",
    "We're looking for a villa in Palmeraie — 5+ bedrooms, land 2000m² min, pool essential.",
    "Recherche villa d'exception Palmeraie, projet haut de gamme, budget ouvert.",
  ],
  medina_riad: [
    "Riad médina rénové, 4 chambres min. Projet résidentiel famille.",
    "Looking for a restored riad in the medina, authentic architecture, turnkey.",
    "Riad à rénover toléré — je souhaite ma propre restauration avec artisans traditionnels.",
  ],
  hivernage_appartement: [
    "Appartement Hivernage résidence sécurisée, 2-3 chambres. Investissement locatif.",
    "Programme neuf Hivernage ou Guéliz — livraison 2026 ou 2027 acceptée.",
    "Appartement de standing, vue jardin, services hôteliers appréciés.",
  ],
  essaouira_villa: [
    "Maison d'hôtes Essaouira en activité — reprise.",
    "Villa bord de mer Essaouira / Diabat — projet résidence secondaire.",
    "Riad médina Essaouira ou villa Ghazoua, budget confortable.",
  ],
};

function messageFor(arch: BuyerArchetype): string {
  const key = `${arch.preferredZone}_${arch.preferredType.includes("riad") ? "riad" : arch.preferredType === "villa" ? "villa" : arch.preferredType === "appartement" ? "appartement" : "villa"}`;
  const variants = MESSAGES[key] ?? MESSAGES.palmeraie_villa;
  return variants[Math.floor(Math.random() * variants.length)];
}

// ── Plan de distribution ─────────────────────────────────────────
// Pour chaque (status, count), on pioche archétype + advisor + timeline réaliste.

type Status = "new" | "contacted" | "qualified" | "visit_scheduled" | "visit_done" | "offer" | "signed" | "lost";

interface Plan {
  status: Status;
  count: number;
  ageRange: [number, number]; // heures
  needsOffer?: boolean;
  needsVisit?: boolean;
  eventsCount: [number, number]; // min, max
}

const DISTRIBUTION: Plan[] = [
  { status: "new", count: 7, ageRange: [0.1, 6], eventsCount: [0, 1] },
  { status: "contacted", count: 9, ageRange: [4, 36], eventsCount: [2, 3] },
  { status: "qualified", count: 9, ageRange: [24, 96], eventsCount: [3, 5] },
  { status: "visit_scheduled", count: 7, ageRange: [48, 168], needsVisit: true, eventsCount: [3, 5] },
  { status: "visit_done", count: 5, ageRange: [72, 240], eventsCount: [4, 6] },
  { status: "offer", count: 4, ageRange: [168, 480], needsOffer: true, eventsCount: [4, 6] },
  { status: "signed", count: 5, ageRange: [720, 2400], eventsCount: [5, 8] },
  { status: "lost", count: 4, ageRange: [240, 1440], eventsCount: [2, 4] },
];

// ── Helpers ───────────────────────────────────────────────────────
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randFloat(min: number, max: number): number { return Math.random() * (max - min) + min; }

// Map zone → advisor slug (pour assignation réaliste)
const ZONE_TO_ADVISOR: Record<string, string> = {
  medina: "camille-decourt",
  palmeraie: "idriss-el-amrani",
  hivernage: "lena-vasconcelos",
  essaouira: "hamza-bennouna",
};

// ── Exécution ─────────────────────────────────────────────────────

async function main() {
  console.log(`🌱 Seed leads démo — version ${SEED_VERSION}`);

  // Vérif advisors actifs
  const advisorsResult = await supabase.from("advisors").select("slug, name").eq("active", true);
  const advisors = advisorsResult.data;
  if (!advisors || advisors.length === 0) {
    throw new Error("Aucun advisor actif. Lance seed-supabase.ts d'abord.");
  }
  const advisorsNonNull = advisors;
  const availableAdvisorSlugs = new Set(advisorsNonNull.map((a) => a.slug));
  console.log(`  ↳ ${advisorsNonNull.length} advisors actifs`);

  const hasAntoine = availableAdvisorSlugs.has("antoine-gandin");

  // Piocher un property slug matchant zone + type (best-effort)
  async function pickProperty(zone: string, type: string): Promise<string | null> {
    // 1. Exact match quartier + type
    let q = supabase.from("properties").select("slug").eq("published", true);
    if (zone === "essaouira") {
      q = q.eq("city", "Essaouira");
    } else {
      q = q.eq("neighborhood_slug", zone);
    }
    q = q.eq("type", type);
    const { data } = await q.limit(1);
    if (data && data.length > 0) return data[0].slug;

    // 2. Fallback type seul
    const { data: d2 } = await supabase
      .from("properties")
      .select("slug")
      .eq("published", true)
      .eq("type", type)
      .limit(1);
    return d2?.[0]?.slug ?? null;
  }

  // Supprime les leads précédents (idempotent v2 + v1)
  const { error: delErr } = await supabase
    .from("leads")
    .delete()
    .or(`meta->>seed_version.eq.${SEED_VERSION},meta->>seed_version.eq.v1`);
  if (delErr) throw delErr;
  console.log("  ↳ leads démo précédents supprimés");

  let totalLeads = 0;
  let totalEvents = 0;

  for (const plan of DISTRIBUTION) {
    for (let i = 0; i < plan.count; i++) {
      const arch = pick(ARCHETYPES);
      const zoneAdvisor = ZONE_TO_ADVISOR[arch.preferredZone];
      // Antoine prend un quota de supervision : ~20% des leads stratégiques
      // (offer + signed + visit_scheduled à forte valeur)
      let advisorSlug = zoneAdvisor;
      const isStrategic = plan.status === "offer" || plan.status === "signed" || (plan.status === "visit_scheduled" && arch.budgetMax > 1500000);
      if (hasAntoine && isStrategic && Math.random() < 0.45) {
        advisorSlug = "antoine-gandin";
      }
      // Fallback si l'advisor zone n'existe pas (ex : pas de hamza → bascule)
      if (!availableAdvisorSlugs.has(advisorSlug)) {
        advisorSlug = advisorsNonNull[0].slug;
      }

      const ageHours = randFloat(plan.ageRange[0], plan.ageRange[1]);
      const createdAt = hoursAgo(ageHours);
      const slaTier: "urgent" | "standard" =
        arch.budgetMax > (arch.preferredZone === "essaouira" ? 800_000 : 1_000_000) ? "urgent" : "standard";
      const slaDueAt = new Date(createdAt.getTime() + (slaTier === "urgent" ? 4 : 24) * 3_600_000);

      // first_action_at : null pour 'new', sinon peu après création
      const firstActionAt =
        plan.status === "new"
          ? null
          : new Date(createdAt.getTime() + randFloat(0.25, 3) * 3_600_000);

      const propertySlug = await pickProperty(arch.preferredZone, arch.preferredType);

      const message = messageFor(arch);
      const channel = pick(["contact_form", "property_form", "whatsapp", "email"] as const);
      const intent: "acheter" | "louer" | "vendre" = "acheter";

      // Offre
      const offerAmount = plan.needsOffer ? Math.round(arch.budgetMax * randFloat(0.7, 0.95) / 10000) * 10000 : null;
      const offerSubmittedAt = plan.needsOffer ? new Date(createdAt.getTime() + (ageHours * 0.7) * 3_600_000) : null;
      const offerStatus = plan.needsOffer ? (Math.random() > 0.2 ? "pending" : "accepted") : null;

      // Next visit
      const nextVisit = plan.needsVisit ? daysFromNow(randInt(1, 7)) : null;

      const closedAt = (plan.status === "signed" || plan.status === "lost") ? hoursAgo(ageHours * 0.1) : null;

      // INSERT
      const { data: inserted, error: insErr } = await supabase
        .from("leads")
        .insert({
          name: arch.name,
          email: arch.email,
          phone: arch.phone,
          buyer_city: arch.city,
          buyer_country: arch.country,
          buyer_languages: arch.languages,
          channel,
          intent,
          message,
          property_slug: propertySlug,
          properties_viewed: [],
          status: plan.status,
          assigned_advisor_slug: advisorSlug,
          assigned_at: createdAt.toISOString(),
          first_action_at: firstActionAt?.toISOString() ?? null,
          sla_tier: slaTier,
          sla_due_at: slaDueAt.toISOString(),
          created_at: createdAt.toISOString(),
          next_visit_at: nextVisit?.toISOString() ?? null,
          next_visit_property_slug: nextVisit ? propertySlug : null,
          next_visit_confirmed: nextVisit ? Math.random() > 0.3 : false,
          offer_amount: offerAmount,
          offer_submitted_at: offerSubmittedAt?.toISOString() ?? null,
          offer_status: offerStatus,
          closed_at: closedAt?.toISOString() ?? null,
          meta: { seed_version: SEED_VERSION },
        })
        .select("id")
        .single();

      if (insErr || !inserted) {
        console.error(`  ✗ ${arch.name} (${plan.status}):`, insErr?.message);
        continue;
      }
      totalLeads++;

      // Events — timeline réaliste selon stade
      const numEvents = randInt(plan.eventsCount[0], plan.eventsCount[1]);
      const eventTimeline = generateEvents(plan.status, ageHours, numEvents, message);

      for (const ev of eventTimeline) {
        const { error: evErr } = await supabase.from("lead_events").insert({
          lead_id: inserted.id,
          type: ev.type,
          author_slug: ev.isAdvisor ? advisorSlug : null,
          body: ev.body,
          created_at: hoursAgo(ageHours - ev.offsetHours).toISOString(),
        });
        if (!evErr) totalEvents++;
      }
    }
  }

  console.log(`\n✓ ${totalLeads} leads + ${totalEvents} events insérés`);

  // Sommaire par statut
  const { data: summary } = await supabase
    .from("leads")
    .select("status, assigned_advisor_slug")
    .eq("meta->>seed_version", SEED_VERSION);
  if (summary) {
    const byStatus = summary.reduce<Record<string, number>>((acc, r) => {
      acc[r.status as string] = (acc[r.status as string] ?? 0) + 1;
      return acc;
    }, {});
    console.log("\n📊 Par statut :");
    Object.entries(byStatus).forEach(([s, n]) => console.log(`  ${s.padEnd(18)} ${n}`));

    const byAdvisor = summary.reduce<Record<string, number>>((acc, r) => {
      const a = (r.assigned_advisor_slug as string) ?? "?";
      acc[a] = (acc[a] ?? 0) + 1;
      return acc;
    }, {});
    console.log("\n👥 Par conseiller :");
    Object.entries(byAdvisor).forEach(([s, n]) => console.log(`  ${s.padEnd(20)} ${n}`));
  }

  console.log(`\nUI : http://localhost:3000/admin`);
}

// ── Génération d'events réalistes ─────────────────────────────────
interface EventGen {
  type: string;
  isAdvisor: boolean;
  body: string;
  offsetHours: number; // depuis createdAt (0 = pile à la création)
}

function generateEvents(status: Status, ageHours: number, desiredCount: number, initialMessage: string): EventGen[] {
  const events: EventGen[] = [];

  // Event 0 : réception initiale (si le canal était email/form/whatsapp)
  // Pas créé côté DB car le lead.message le porte déjà, on modélise juste les responses suivantes.

  const firstReplyOffset = randFloat(0.25, 4); // conseiller répond sous 15min → 4h
  const phases = ["contact", "qualification", "preparation", "visit", "negotiation", "closing"];

  // Pool d'events par phase
  const bank: Record<string, { type: string; body: string; isAdvisor: boolean }[]> = {
    contact: [
      { type: "email_sent", isAdvisor: true, body: "Bonjour, merci pour votre message. Je vous envoie un dossier détaillé dans la journée." },
      { type: "call_logged", isAdvisor: true, body: "Appel rapide de présentation. Client cordial, profil sérieux." },
      { type: "whatsapp_sent", isAdvisor: true, body: "Ravi de votre intérêt. Quand êtes-vous disponible pour un premier échange ?" },
    ],
    qualification: [
      { type: "call_logged", isAdvisor: true, body: "Appel 30 min. Projet clair, financement OK. Critères validés." },
      { type: "note", isAdvisor: true, body: "Profil confirmé : budget, timing, financement. À présenter 3 biens." },
      { type: "email_sent", isAdvisor: true, body: "Voici la sélection que j'ai composée pour vous. Confidentiel." },
    ],
    preparation: [
      { type: "email_received", isAdvisor: false, body: "Merci pour la sélection. Le premier bien nous intéresse beaucoup. On peut visiter ?" },
      { type: "note", isAdvisor: true, body: "Visite organisée, propriétaire ok. Préparer le brief PDF." },
    ],
    visit: [
      { type: "visit_scheduled", isAdvisor: true, body: "Tour de visites programmé." },
      { type: "visit_completed", isAdvisor: true, body: "Visite effectuée. Coup de cœur sur le 2e bien." },
      { type: "note", isAdvisor: true, body: "Retour très positif client après visite. À relancer rapidement." },
    ],
    negotiation: [
      { type: "email_sent", isAdvisor: true, body: "Suite à vos retours, je formalise une première offre. Prêt à la discuter." },
      { type: "call_logged", isAdvisor: true, body: "Call négociation : client souhaite réduire de 5%. Propriétaire consulté." },
      { type: "note", isAdvisor: true, body: "Propriétaire ouvert, gap de 3%. Arrangement probable cette semaine." },
    ],
    closing: [
      { type: "note", isAdvisor: true, body: "Offre acceptée. Compromis en préparation chez le notaire." },
      { type: "email_sent", isAdvisor: true, body: "Félicitations ! Voici le planning jusqu'à la signature définitive." },
      { type: "note", isAdvisor: true, body: "Acte authentique signé. Dossier clos." },
    ],
  };

  // Couverture des phases selon status
  const phaseBudget: Record<Status, string[]> = {
    new: [],
    contacted: ["contact"],
    qualified: ["contact", "qualification"],
    visit_scheduled: ["contact", "qualification", "preparation", "visit"],
    visit_done: ["contact", "qualification", "preparation", "visit"],
    offer: ["contact", "qualification", "preparation", "visit", "negotiation"],
    signed: ["contact", "qualification", "preparation", "visit", "negotiation", "closing"],
    lost: ["contact", "qualification"],
  };

  const phasesForStatus = phaseBudget[status];
  if (phasesForStatus.length === 0) return [];

  let offsetH = firstReplyOffset;
  let count = 0;
  for (const phase of phasesForStatus) {
    if (count >= desiredCount) break;
    const candidates = bank[phase];
    const ev = pick(candidates);
    events.push({
      type: ev.type,
      isAdvisor: ev.isAdvisor,
      body: ev.body,
      offsetHours: offsetH,
    });
    offsetH += randFloat(4, 24);
    count++;
  }

  return events.filter((e) => e.offsetHours < ageHours * 0.95); // events dans la fenêtre de vie du lead
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
