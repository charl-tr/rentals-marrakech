// Données fake pour la démo admin.
// Les slugs propriétés référencent des biens réellement en Supabase.
// Les advisor slugs référencent les advisors réels en Supabase.
//
// Utilisé uniquement par les routes /admin/* — l'app publique n'y touche pas.

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "visit_scheduled"
  | "visit_done"
  | "offer"
  | "signed"
  | "lost";

export type LeadSource = "fiche_bien" | "contact_form" | "whatsapp" | "phone" | "matching";

export interface LeadComm {
  id: string;
  channel: "email" | "whatsapp" | "phone" | "note" | "meeting";
  direction: "inbound" | "outbound";
  body: string;
  at: string; // ISO
  by?: string; // "Idriss" / "Client" / "Système"
}

export interface FakeBuyer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  languages: string[];
  budget: { min?: number; max: number };
  criteria: {
    types: string[];
    neighborhoods: string[];
    bedroomsMin: number;
    mustHave: string[];
  };
  avatar?: string; // optional stock photo
}

export interface FakeLead {
  id: string;
  buyer: FakeBuyer;
  sourcePropertySlug: string;
  source: LeadSource;
  advisorSlug: string;
  status: LeadStatus;
  message?: string;
  createdAt: string; // ISO
  firstResponseAt?: string;
  lastActivityAt: string;
  nextVisit?: { at: string; propertySlug: string; confirmed: boolean };
  offer?: { amount: number; submittedAt: string; status: "pending" | "accepted" | "rejected" };
  communications: LeadComm[];
  propertiesViewed?: string[]; // slugs de biens consultés sur le site public
}

// Helpers pour générer des timestamps relatifs au "now" de démo (17 avril 2026)
const NOW = new Date("2026-04-17T10:30:00Z");
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 60 * 60 * 1000).toISOString();
const daysAgo = (d: number) => new Date(NOW.getTime() - d * 24 * 60 * 60 * 1000).toISOString();
const daysFromNow = (d: number) => new Date(NOW.getTime() + d * 24 * 60 * 60 * 1000).toISOString();

export const fakeLeads: FakeLead[] = [
  // ── 1. NEW — tombé il y a 15 min, aucune réponse encore
  {
    id: "LD-2026-047",
    buyer: {
      firstName: "Jean",
      lastName: "Dupont",
      email: "j.dupont@protonmail.com",
      phone: "+33 6 12 34 56 78",
      city: "Paris",
      country: "France",
      languages: ["FR", "EN"],
      budget: { min: 1500000, max: 2500000 },
      criteria: {
        types: ["villa"],
        neighborhoods: ["palmeraie", "amelkis"],
        bedroomsMin: 4,
        mustHave: ["piscine", "jardin"],
      },
    },
    sourcePropertySlug: "villa-dexception-palmeraie-5-chambres",
    source: "fiche_bien",
    advisorSlug: "idriss-el-amrani",
    status: "new",
    message:
      "Bonjour, nous sommes en visite à Marrakech la semaine prochaine (22-26 avril). J'aimerais organiser une visite de cette villa si elle est toujours disponible. Cordialement, Jean Dupont.",
    createdAt: hoursAgo(0.25),
    lastActivityAt: hoursAgo(0.25),
    propertiesViewed: [
      "villa-dexception-palmeraie-5-chambres",
      "villa-5-suites-prestigia-golf",
      "villa-4-suites-route-ourika",
    ],
    communications: [
      {
        id: "C1",
        channel: "email",
        direction: "inbound",
        body: "Bonjour, nous sommes en visite à Marrakech la semaine prochaine (22-26 avril). J'aimerais organiser une visite de cette villa si elle est toujours disponible. Cordialement, Jean Dupont.",
        at: hoursAgo(0.25),
        by: "Client",
      },
    ],
  },

  // ── 2. CONTACTED — SLA rouge, 4h sans réponse
  {
    id: "LD-2026-046",
    buyer: {
      firstName: "Claire",
      lastName: "Dubois",
      email: "claire.dubois@gmail.com",
      phone: "+33 6 45 89 12 34",
      city: "Paris",
      country: "France",
      languages: ["FR"],
      budget: { min: 400000, max: 700000 },
      criteria: {
        types: ["riad-renove"],
        neighborhoods: ["medina"],
        bedroomsMin: 4,
        mustHave: ["terrasse"],
      },
    },
    sourcePropertySlug: "riad-renove-medina-koutoubia",
    source: "fiche_bien",
    advisorSlug: "camille-decourt",
    status: "contacted",
    createdAt: hoursAgo(8),
    firstResponseAt: hoursAgo(7.5),
    lastActivityAt: hoursAgo(4),
    propertiesViewed: [
      "riad-renove-medina-koutoubia",
      "riad-a-louer-medina-5-suites",
    ],
    communications: [
      {
        id: "C1",
        channel: "email",
        direction: "inbound",
        body: "Votre riad de la médina m'intéresse beaucoup. Pouvez-vous me donner plus de détails sur la restauration et les artisans qui ont été mobilisés ?",
        at: hoursAgo(8),
        by: "Client",
      },
      {
        id: "C2",
        channel: "email",
        direction: "outbound",
        body: "Bonjour Claire, merci pour votre intérêt. Je vous appelle dans la matinée pour vous présenter en détail le bien et le quartier. Bien à vous, Camille.",
        at: hoursAgo(7.5),
        by: "Camille Decourt",
      },
      {
        id: "C3",
        channel: "whatsapp",
        direction: "inbound",
        body: "Merci Camille, j'attends votre appel :)",
        at: hoursAgo(4),
        by: "Client",
      },
    ],
  },

  // ── 3. QUALIFIED — critères confirmés, attente de disponibilité propriétaire
  {
    id: "LD-2026-041",
    buyer: {
      firstName: "Hans",
      lastName: "Böhmer",
      email: "hans.boehmer@boehmer-partners.de",
      phone: "+49 175 892 14 02",
      city: "Munich",
      country: "Allemagne",
      languages: ["DE", "EN", "FR"],
      budget: { min: 1000000, max: 1800000 },
      criteria: {
        types: ["villa"],
        neighborhoods: ["palmeraie", "amelkis", "targa"],
        bedroomsMin: 5,
        mustHave: ["piscine", "garage", "vue"],
      },
    },
    sourcePropertySlug: "villa-5-suites-prestigia-golf",
    source: "matching",
    advisorSlug: "idriss-el-amrani",
    status: "qualified",
    createdAt: daysAgo(2),
    firstResponseAt: daysAgo(2),
    lastActivityAt: daysAgo(1),
    propertiesViewed: [
      "villa-5-suites-prestigia-golf",
      "villa-dexception-palmeraie-5-chambres",
    ],
    communications: [
      {
        id: "C1",
        channel: "whatsapp",
        direction: "outbound",
        body: "Hans, nouveau bien qui correspond à vos critères — villa 5 suites Prestigia, 1.25M€, piscine chauffée. Je vous envoie le dossier.",
        at: daysAgo(2),
        by: "Idriss El Amrani",
      },
      {
        id: "C2",
        channel: "whatsapp",
        direction: "inbound",
        body: "Parfait Idriss, cela m'intéresse. Je serai à Marrakech la semaine du 28 avril, peut-on caler une visite ?",
        at: daysAgo(2),
        by: "Client",
      },
      {
        id: "C3",
        channel: "note",
        direction: "outbound",
        body: "Appel confirmation budget 1.8M max, confirme intérêt golf, veut visiter aussi Amelkis. Propriétaire contacté pour dispos semaine 28/04.",
        at: daysAgo(1),
        by: "Idriss El Amrani",
      },
    ],
  },

  // ── 4. VISIT SCHEDULED — visite demain
  {
    id: "LD-2026-035",
    buyer: {
      firstName: "Marco",
      lastName: "Lorenzi",
      email: "m.lorenzi@lorenzi-architects.it",
      phone: "+39 348 756 12 90",
      city: "Milano",
      country: "Italie",
      languages: ["IT", "EN", "FR"],
      budget: { min: 700000, max: 1200000 },
      criteria: {
        types: ["villa"],
        neighborhoods: ["diabat", "essaouira-medina"],
        bedroomsMin: 4,
        mustHave: ["vue mer", "proche plage"],
      },
    },
    sourcePropertySlug: "villa-essaouira-vue-mer-diabat",
    source: "fiche_bien",
    advisorSlug: "hamza-bennouna",
    status: "visit_scheduled",
    createdAt: daysAgo(6),
    firstResponseAt: daysAgo(6),
    lastActivityAt: daysAgo(1),
    nextVisit: {
      at: daysFromNow(1),
      propertySlug: "villa-essaouira-vue-mer-diabat",
      confirmed: true,
    },
    propertiesViewed: ["villa-essaouira-vue-mer-diabat"],
    communications: [
      {
        id: "C1",
        channel: "phone",
        direction: "outbound",
        body: "Premier appel (25 min). Architecte milanais, second home pour weekends. Veut visiter avec sa femme. Flexibilité totale sur agenda.",
        at: daysAgo(6),
        by: "Hamza Bennouna",
      },
      {
        id: "C2",
        channel: "whatsapp",
        direction: "outbound",
        body: "Marco, visite confirmée samedi 18 avril à 11h avec M. Khalil (propriétaire). Je passe vous prendre à votre hôtel. À samedi.",
        at: daysAgo(1),
        by: "Hamza Bennouna",
      },
    ],
  },

  // ── 5. VISIT DONE — visite faite il y a 3 jours, en réflexion
  {
    id: "LD-2026-029",
    buyer: {
      firstName: "Sophie",
      lastName: "Martin",
      email: "sophie.martin.lyon@gmail.com",
      phone: "+33 6 78 23 45 67",
      city: "Lyon",
      country: "France",
      languages: ["FR", "EN"],
      budget: { min: 350000, max: 550000 },
      criteria: {
        types: ["villa", "appartement"],
        neighborhoods: ["targa", "hivernage"],
        bedroomsMin: 3,
        mustHave: ["proche école française"],
      },
    },
    sourcePropertySlug: "villa-traditionnelle-targa",
    source: "fiche_bien",
    advisorSlug: "idriss-el-amrani",
    status: "visit_done",
    createdAt: daysAgo(10),
    firstResponseAt: daysAgo(10),
    lastActivityAt: daysAgo(3),
    propertiesViewed: [
      "villa-traditionnelle-targa",
      "appartement-hivernage-standing",
    ],
    communications: [
      {
        id: "C1",
        channel: "meeting",
        direction: "outbound",
        body: "Visite Villa Targa + Appartement Hivernage. Famille expat en relocation (mari banquier Casablanca, 2 enfants à l'école française). Coup de cœur pour Targa mais soucieuse du budget (préférerait 450k). Demande estimation travaux cuisine.",
        at: daysAgo(3),
        by: "Idriss El Amrani",
      },
      {
        id: "C2",
        channel: "email",
        direction: "inbound",
        body: "Merci Idriss pour cette journée. Nous avons beaucoup aimé Targa. Pouvez-vous demander au propriétaire s'il serait prêt à descendre à 580k€ avec cuisine à refaire à notre charge ?",
        at: daysAgo(3),
        by: "Client",
      },
    ],
  },

  // ── 6. OFFER — offre déposée
  {
    id: "LD-2026-024",
    buyer: {
      firstName: "Isabelle",
      lastName: "Laurent",
      email: "isabelle.laurent@outlook.fr",
      phone: "+33 6 91 23 45 78",
      city: "Bordeaux",
      country: "France",
      languages: ["FR"],
      budget: { min: 400000, max: 500000 },
      criteria: {
        types: ["villa"],
        neighborhoods: ["ourika", "targa"],
        bedroomsMin: 3,
        mustHave: ["piscine", "vue Atlas"],
      },
    },
    sourcePropertySlug: "villa-4-suites-route-ourika",
    source: "fiche_bien",
    advisorSlug: "idriss-el-amrani",
    status: "offer",
    createdAt: daysAgo(18),
    firstResponseAt: daysAgo(18),
    lastActivityAt: daysAgo(2),
    offer: {
      amount: 460000,
      submittedAt: daysAgo(2),
      status: "pending",
    },
    propertiesViewed: ["villa-4-suites-route-ourika"],
    communications: [
      {
        id: "C1",
        channel: "meeting",
        direction: "outbound",
        body: "Visite villa Ourika. Retraitée, ex-DRH. Beaucoup aimé mais veut négocier (prix affiché 480k€).",
        at: daysAgo(14),
        by: "Idriss El Amrani",
      },
      {
        id: "C2",
        channel: "email",
        direction: "inbound",
        body: "Idriss, j'aimerais faire une offre à 460 000 € hors frais. Pouvez-vous la soumettre au propriétaire ? Financement pré-accepté banque.",
        at: daysAgo(2),
        by: "Client",
      },
      {
        id: "C3",
        channel: "note",
        direction: "outbound",
        body: "Offre 460k€ soumise au propriétaire M. Ait Ben. Il rentre de voyage samedi, réponse lundi. Ticket initial 480k, margin raisonnable.",
        at: daysAgo(2),
        by: "Idriss El Amrani",
      },
    ],
  },

  // ── 7. SIGNED — clôturé récemment
  {
    id: "LD-2026-011",
    buyer: {
      firstName: "David",
      lastName: "Chen",
      email: "d.chen@chen-capital.co.uk",
      phone: "+44 7911 234 567",
      city: "London",
      country: "Royaume-Uni",
      languages: ["EN", "FR"],
      budget: { min: 250000, max: 400000 },
      criteria: {
        types: ["appartement"],
        neighborhoods: ["hivernage", "gueliz"],
        bedroomsMin: 2,
        mustHave: ["piscine", "sécurité"],
      },
    },
    sourcePropertySlug: "appartement-hivernage-standing",
    source: "contact_form",
    advisorSlug: "lena-vasconcelos",
    status: "signed",
    createdAt: daysAgo(48),
    firstResponseAt: daysAgo(48),
    lastActivityAt: daysAgo(3),
    offer: {
      amount: 328000,
      submittedAt: daysAgo(21),
      status: "accepted",
    },
    propertiesViewed: [
      "appartement-hivernage-standing",
    ],
    communications: [
      {
        id: "C1",
        channel: "note",
        direction: "outbound",
        body: "Acte authentique signé chez Maître El Amine. Félicitations à David. Commission réglée (3% HT + TVA).",
        at: daysAgo(3),
        by: "Léna Vasconcelos",
      },
    ],
  },

  // ── 8. LOST — perdu (budget insuffisant)
  {
    id: "LD-2026-018",
    buyer: {
      firstName: "Amélie",
      lastName: "Rousseau",
      email: "amelie.rousseau@gmail.com",
      phone: "+32 477 12 34 56",
      city: "Bruxelles",
      country: "Belgique",
      languages: ["FR"],
      budget: { max: 250000 },
      criteria: {
        types: ["maison-hotes"],
        neighborhoods: ["essaouira-medina"],
        bedroomsMin: 5,
        mustHave: ["activité en cours"],
      },
    },
    sourcePropertySlug: "riad-renove-medina-koutoubia",
    source: "contact_form",
    advisorSlug: "hamza-bennouna",
    status: "lost",
    createdAt: daysAgo(25),
    firstResponseAt: daysAgo(25),
    lastActivityAt: daysAgo(14),
    propertiesViewed: ["riad-renove-medina-koutoubia"],
    communications: [
      {
        id: "C1",
        channel: "phone",
        direction: "outbound",
        body: "Appel qualification. Budget 250k € max. Trop bas pour les maisons d'hôtes d'Essaouira (350k+ pour les bonnes). Je l'invite à nous recontacter si le budget évolue.",
        at: daysAgo(14),
        by: "Hamza Bennouna",
      },
    ],
  },
];

// ── MATCHING FAKE — quand un nouveau bien rentre
export interface MatchingAlert {
  id: string;
  propertySlug: string;
  createdAt: string;
  matches: {
    buyer: FakeBuyer;
    advisorSlug: string;
    matchScore: number; // 0-100
    matchReasons: string[];
    lastLeadId?: string;
  }[];
}

export const fakeMatching: MatchingAlert[] = [
  {
    id: "MATCH-2026-003",
    propertySlug: "villa-dexception-palmeraie-5-chambres",
    createdAt: hoursAgo(0.5),
    matches: [
      {
        buyer: fakeLeads[2].buyer, // Hans
        advisorSlug: "idriss-el-amrani",
        matchScore: 96,
        matchReasons: [
          "Budget 1-1.8M€ (bien à 2.3M — tolérance haute)",
          "Quartier Palmeraie favori",
          "5+ chambres requis",
          "Piscine + jardin requis",
        ],
        lastLeadId: "LD-2026-041",
      },
      {
        buyer: {
          firstName: "Yannick",
          lastName: "Lefebvre",
          email: "yannick.lefebvre@lefebvre-groupe.fr",
          phone: "+33 6 20 11 22 33",
          city: "Genève",
          country: "Suisse",
          languages: ["FR", "EN"],
          budget: { min: 1500000, max: 3000000 },
          criteria: {
            types: ["villa"],
            neighborhoods: ["palmeraie"],
            bedroomsMin: 5,
            mustHave: ["piscine", "grand terrain"],
          },
        },
        advisorSlug: "idriss-el-amrani",
        matchScore: 98,
        matchReasons: [
          "Budget 1.5-3M€ (bien à 2.3M — cœur de cible)",
          "Palmeraie exclusivement",
          "5+ chambres",
          "Terrain >2000m² requis",
        ],
      },
      {
        buyer: {
          firstName: "Julia",
          lastName: "Thompson",
          email: "j.thompson@thompsonpartners.com",
          phone: "+1 310 555 0142",
          city: "Los Angeles",
          country: "États-Unis",
          languages: ["EN"],
          budget: { min: 2000000, max: 4000000 },
          criteria: {
            types: ["villa"],
            neighborhoods: ["palmeraie"],
            bedroomsMin: 5,
            mustHave: ["architect-designed", "pool"],
          },
        },
        advisorSlug: "idriss-el-amrani",
        matchScore: 94,
        matchReasons: [
          "Budget 2-4M€ (bien à 2.3M — sweet spot)",
          "Villa d'architecte requise",
          "5+ chambres",
        ],
      },
      {
        buyer: fakeLeads[0].buyer, // Jean Dupont (déjà lead actif)
        advisorSlug: "idriss-el-amrani",
        matchScore: 87,
        matchReasons: [
          "Budget 1.5-2.5M€ (bien à 2.3M — limite haute)",
          "Villa Palmeraie ou Amelkis",
          "4+ chambres",
        ],
        lastLeadId: "LD-2026-047",
      },
    ],
  },
];

// ── HELPERS pour les pages admin

export function getLeadById(id: string): FakeLead | undefined {
  return fakeLeads.find((l) => l.id === id);
}

export function getLeadsByStatus(status: LeadStatus): FakeLead[] {
  return fakeLeads.filter((l) => l.status === status);
}

export function getLeadsCount(): Record<LeadStatus, number> {
  const counts: Record<LeadStatus, number> = {
    new: 0,
    contacted: 0,
    qualified: 0,
    visit_scheduled: 0,
    visit_done: 0,
    offer: 0,
    signed: 0,
    lost: 0,
  };
  fakeLeads.forEach((l) => {
    counts[l.status]++;
  });
  return counts;
}

// Format "il y a 3h" / "il y a 2 jours"
export function relativeTime(iso: string, now: Date = NOW): string {
  const then = new Date(iso).getTime();
  const diffMs = now.getTime() - then;
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 0) {
    const future = Math.abs(diffMin);
    if (future < 60) return `dans ${future} min`;
    if (future < 1440) return `dans ${Math.round(future / 60)} h`;
    return `dans ${Math.round(future / 1440)} j`;
  }
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;
  const diffD = Math.round(diffH / 24);
  if (diffD < 30) return `il y a ${diffD} j`;
  const diffM = Math.round(diffD / 30);
  return `il y a ${diffM} mois`;
}

// SLA status : < 15 min = "ok", < 4h = "watch", >4h = "breach"
export function slaStatus(lead: FakeLead, now: Date = NOW): "ok" | "watch" | "breach" | "resolved" {
  if (lead.firstResponseAt) return "resolved";
  const created = new Date(lead.createdAt).getTime();
  const diffMin = (now.getTime() - created) / 60000;
  if (diffMin < 15) return "ok";
  if (diffMin < 240) return "watch";
  return "breach";
}

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Nouveau",
  contacted: "Contacté",
  qualified: "Qualifié",
  visit_scheduled: "Visite programmée",
  visit_done: "Visite effectuée",
  offer: "Offre en cours",
  signed: "Signé",
  lost: "Perdu",
};

export const KANBAN_COLUMNS: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "visit_scheduled",
  "offer",
  "signed",
];
