import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { supabase } from "./supabase";
import { supabaseAdmin } from "./supabase-admin";
import type { AdminSession } from "./auth";
import {
  eventToComm,
  splitName,
  type AdminLead,
  type LeadChannel,
  type LeadEvent,
  type LeadStatus,
  type SlaTier,
} from "./leads";
import type {
  Advisor,
  Listing,
  Property,
  PropertyType,
} from "@/data/properties";
import { NEIGHBORHOOD_COORDS } from "@/data/properties";

// ════════════════════════════════════════════════════════════════════
// Mapping snake_case (DB) → camelCase (app)
// ════════════════════════════════════════════════════════════════════

interface PropertyRow {
  slug: string;
  reference: string;
  title: string;
  tagline: string | null;
  type: PropertyType;
  listing: Listing;
  status: import("@/data/properties").PropertyStatus | null;
  exclusivity: boolean;
  city: "Marrakech" | "Essaouira";
  neighborhood_slug: string | null;
  price_eur: number;
  price_mad: number | null;
  price_unit: "semaine" | "mois" | null;
  bedrooms: number | null;
  bathrooms: number | null;
  surface: number | null;
  land_surface: number | null;
  year_built: number | null;
  pool: boolean;
  featured: boolean;
  published: boolean;
  owner_name: string | null;
  owner_phone: string | null;
  owner_email: string | null;
  owner_notes: string | null;
  short_description: string | null;
  description: string | null;
  story: Property["story"] | null;
  features: string[];
  images: string[];
  walking_distances: { label: string; minutes: number }[];
  advisor_slug: string | null;
}

interface NeighborhoodRow {
  slug: string;
  name: string;
  city: "Marrakech" | "Essaouira";
  tagline: string | null;
  paragraphs: string[];
  highlights: { label: string; description: string }[];
  image_hero: string | null;
}

// Coordonnées par défaut (centre ville) quand le bien n'a pas de coords précises
const CITY_DEFAULT_COORDS = {
  Marrakech: { lat: 31.6295, lng: -7.9811 },
  Essaouira: { lat: 31.5085, lng: -9.7595 },
};

function rowToProperty(row: PropertyRow, neighborhoodLabel: string | null): Property {
  return {
    slug: row.slug,
    reference: row.reference,
    title: row.title,
    tagline: row.tagline ?? "",
    type: row.type,
    listing: row.listing,
    status: row.status ?? "available",
    exclusivity: row.exclusivity,
    city: row.city,
    neighborhood: neighborhoodLabel ?? row.neighborhood_slug ?? "",
    neighborhoodSlug: row.neighborhood_slug ?? "",
    price: row.price_eur,
    currency: "EUR",
    priceMad: row.price_mad ?? undefined,
    priceUnit: row.price_unit ?? undefined,
    bedrooms: row.bedrooms ?? 0,
    bathrooms: row.bathrooms ?? 0,
    surface: row.surface ?? 0,
    landSurface: row.land_surface ?? undefined,
    yearBuilt: row.year_built ?? undefined,
    pool: row.pool,
    featured: row.featured,
    published: row.published,
    ownerName: row.owner_name,
    ownerPhone: row.owner_phone,
    ownerEmail: row.owner_email,
    ownerNotes: row.owner_notes,
    shortDescription: row.short_description ?? "",
    story: row.story ?? { eyebrow: "", title: "", paragraphs: [] },
    description: row.description ?? "",
    features: row.features ?? [],
    images: row.images ?? [],
    walkingDistances: row.walking_distances ?? [],
    coordinates:
      (row.neighborhood_slug ? NEIGHBORHOOD_COORDS[row.neighborhood_slug] : null)
      ?? CITY_DEFAULT_COORDS[row.city]
      ?? { lat: 31.6295, lng: -7.9811 },
    advisorSlug: row.advisor_slug ?? "",
  };
}

// ════════════════════════════════════════════════════════════════════
// Properties
// ════════════════════════════════════════════════════════════════════

const PROPERTY_SELECT = "*, neighborhood:neighborhoods(name)";

type PropertyWithNeigh = PropertyRow & {
  neighborhood: { name: string } | null;
};

export const getAllProperties = cache(async (): Promise<Property[]> => {
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("price_eur", { ascending: false });
  if (error) throw error;
  return (data as PropertyWithNeigh[]).map((r) =>
    rowToProperty(r, r.neighborhood?.name ?? null)
  );
});

export const getFeaturedProperties = cache(async (limit = 3): Promise<Property[]> => {
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .eq("published", true)
    .eq("featured", true)
    .order("price_eur", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as PropertyWithNeigh[]).map((r) =>
    rowToProperty(r, r.neighborhood?.name ?? null)
  );
});

export const getPropertyBySlug = cache(async (slug: string): Promise<Property | null> => {
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as PropertyWithNeigh;
  return rowToProperty(row, row.neighborhood?.name ?? null);
});

/** Batch fetch — évite le N+1 quand on a plusieurs slugs (shortlist, viewed, etc.) */
export async function getPropertiesBySlugs(slugs: string[]): Promise<Map<string, Property>> {
  if (!slugs.length) return new Map();
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .in("slug", slugs);
  if (error) throw error;
  const map = new Map<string, Property>();
  for (const row of (data as PropertyWithNeigh[])) {
    map.set(row.slug, rowToProperty(row, row.neighborhood?.name ?? null));
  }
  return map;
}

/**
 * Admin read — retourne TOUS les biens (publiés ou non) via service-role.
 * À utiliser dans /admin/biens/* uniquement.
 */
export const getAllPropertiesAdmin = cache(
  unstable_cache(
    async (): Promise<Property[]> => {
      const { data, error } = await supabaseAdmin
        .from("properties")
        .select(PROPERTY_SELECT)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as PropertyWithNeigh[]).map((r) =>
        rowToProperty(r, r.neighborhood?.name ?? null)
      );
    },
    ["properties-admin"],
    { tags: ["admin"], revalidate: 15 }
  )
);

/** Compte des leads par property_slug — pour health check dans l'admin biens. */
export const getLeadsCountByProperty = unstable_cache(
  async (): Promise<Record<string, number>> => {
    const { data, error } = await supabaseAdmin
      .from("leads")
      .select("property_slug")
      .not("property_slug", "is", null);
    if (error) throw error;
    const counts: Record<string, number> = {};
    for (const row of (data as { property_slug: string }[]) ?? []) {
      counts[row.property_slug] = (counts[row.property_slug] ?? 0) + 1;
    }
    return counts;
  },
  ["leads-count-by-property"],
  { tags: ["admin"], revalidate: 15 }
);

/** Leads associés à un bien donné — pour la fiche admin bien. */
export async function getLeadsForProperty(slug: string): Promise<AdminLead[]> {
  const { data, error } = await supabaseAdmin
    .from("leads")
    .select("*")
    .eq("property_slug", slug)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as LeadRow[]).map(rowToAdminLead);
}

export async function getAllPropertySlugs(): Promise<
  { slug: string; listing: Listing; type: PropertyType }[]
> {
  const { data, error } = await supabase
    .from("properties")
    .select("slug, listing, type")
    .eq("published", true);
  if (error) throw error;
  return data ?? [];
}

export async function getFirstEssaouiraProperty(): Promise<Property | null> {
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .eq("published", true)
    .eq("city", "Essaouira")
    .order("featured", { ascending: false })
    .order("price_eur", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as PropertyWithNeigh;
  return rowToProperty(row, row.neighborhood?.name ?? null);
}

export const getSimilarProperties = cache(async (
  current: Property,
  limit = 3
): Promise<Property[]> => {
  // Stratégie : même type OU même quartier, exclure le bien actuel
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .eq("published", true)
    .neq("slug", current.slug)
    .or(`type.eq.${current.type},neighborhood_slug.eq.${current.neighborhoodSlug}`)
    .limit(limit);
  if (error) throw error;
  return (data as PropertyWithNeigh[]).map((r) =>
    rowToProperty(r, r.neighborhood?.name ?? null)
  );
});

// ════════════════════════════════════════════════════════════════════
// Advisors
// ════════════════════════════════════════════════════════════════════

interface AdvisorRow {
  slug: string;
  name: string;
  role: string;
  photo: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  speciality: string | null;
  languages: string[];
  years_experience: number | null;
}

// Les URLs stock (Unsplash) en base sont des placeholders résiduels — on les
// neutralise pour déclencher le fallback initiales côté UI en attendant les
// vraies photos de l'équipe.
function sanitizeAdvisorPhoto(photo: string | null): string {
  if (!photo) return "";
  if (/unsplash\.com/i.test(photo)) return "";
  return photo;
}

function rowToAdvisor(r: AdvisorRow): Advisor {
  return {
    slug: r.slug,
    name: r.name,
    role: r.role,
    photo: sanitizeAdvisorPhoto(r.photo),
    phone: r.phone ?? "",
    whatsapp: r.whatsapp ?? "",
    email: r.email ?? "",
    speciality: r.speciality ?? "",
    languages: r.languages ?? [],
    yearsExperience: r.years_experience ?? 0,
  };
}

export const getAllAdvisors = cache(
  unstable_cache(
    async (): Promise<Advisor[]> => {
      const { data, error } = await supabase.from("advisors").select("*");
      if (error) throw error;
      return (data as AdvisorRow[]).map(rowToAdvisor);
    },
    ["all-advisors"],
    { tags: ["admin"], revalidate: 15 }
  )
);

export async function getAdvisor(slug: string): Promise<Advisor | null> {
  const { data, error } = await supabase
    .from("advisors")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToAdvisor(data as AdvisorRow) : null;
}

// ════════════════════════════════════════════════════════════════════
// Neighborhoods
// ════════════════════════════════════════════════════════════════════

export interface NeighborhoodPage {
  slug: string;
  name: string;
  city: "Marrakech" | "Essaouira";
  tagline: string;
  paragraphs: string[];
  highlights: { label: string; description: string }[];
  imageHero: string;
}

function rowToNeighborhood(r: NeighborhoodRow): NeighborhoodPage {
  return {
    slug: r.slug,
    name: r.name,
    city: r.city,
    tagline: r.tagline ?? "",
    paragraphs: r.paragraphs ?? [],
    highlights: r.highlights ?? [],
    imageHero: r.image_hero ?? "",
  };
}

export async function getAllNeighborhoods(): Promise<NeighborhoodPage[]> {
  const { data, error } = await supabase
    .from("neighborhoods")
    .select("*")
    .order("name");
  if (error) throw error;
  return (data as NeighborhoodRow[]).map(rowToNeighborhood);
}

export async function getNeighborhood(slug: string): Promise<NeighborhoodPage | null> {
  const { data, error } = await supabase
    .from("neighborhoods")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToNeighborhood(data as NeighborhoodRow) : null;
}

// Quartiers ayant un éditorial complet (paragraphes + highlights remplis)
export async function getEditorializedNeighborhoods(): Promise<NeighborhoodPage[]> {
  const all = await getAllNeighborhoods();
  return all.filter(
    (n) => n.paragraphs.length > 0 && n.highlights.length > 0 && n.imageHero
  );
}

// ════════════════════════════════════════════════════════════════════
// Journal
// ════════════════════════════════════════════════════════════════════

export interface JournalArticle {
  slug: string;
  title: string;
  lead: string;
  category: string;
  author: string;
  publishedAt: string;
  readingTime: number;
  imageHero: string;
  paragraphs: string[];
}

interface JournalRow {
  slug: string;
  title: string;
  lead: string | null;
  category: string | null;
  author: string | null;
  published_at: string | null;
  reading_time: number | null;
  image_hero: string | null;
  paragraphs: string[];
}

function rowToArticle(r: JournalRow): JournalArticle {
  return {
    slug: r.slug,
    title: r.title,
    lead: r.lead ?? "",
    category: r.category ?? "",
    author: r.author ?? "",
    publishedAt: r.published_at ?? "",
    readingTime: r.reading_time ?? 0,
    imageHero: r.image_hero ?? "",
    paragraphs: r.paragraphs ?? [],
  };
}

export async function getAllArticles(): Promise<JournalArticle[]> {
  const { data, error } = await supabase
    .from("journal_articles")
    .select("*")
    .order("published_at", { ascending: false });
  if (error) throw error;
  return (data as JournalRow[]).map(rowToArticle);
}

export async function getArticle(slug: string): Promise<JournalArticle | null> {
  const { data, error } = await supabase
    .from("journal_articles")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToArticle(data as JournalRow) : null;
}

// ════════════════════════════════════════════════════════════════════
// Leads (admin) — reads via supabaseAdmin (service-role, bypasse RLS)
// ════════════════════════════════════════════════════════════════════

interface LeadRow {
  id: string;
  created_at: string;
  name: string;
  email: string | null;
  phone: string | null;
  country_code: string | null;
  preferred_language: string | null;
  channel: string;
  source_page: string | null;
  property_slug: string | null;
  intent: string;
  message: string | null;
  criteria_type: string | null;
  criteria_neighborhood_slug: string | null;
  criteria_budget_max: number | null;
  criteria_bedrooms_min: number | null;
  status: string;
  assigned_advisor_slug: string | null;
  assigned_at: string | null;
  first_action_at: string | null;
  sla_tier: string;
  sla_due_at: string | null;
  closed_at: string | null;
  disposition: string | null;
  buyer_city: string | null;
  buyer_country: string | null;
  buyer_languages: string[] | null;
  properties_viewed: string[] | null;
  next_visit_at: string | null;
  next_visit_property_slug: string | null;
  next_visit_confirmed: boolean | null;
  offer_amount: number | null;
  offer_submitted_at: string | null;
  offer_status: string | null;
  meta: Record<string, unknown> | null;
  portal_token: string;
}

interface LeadEventRow {
  id: string;
  lead_id: string;
  created_at: string;
  type: string;
  author_slug: string | null;
  body: string | null;
  payload: Record<string, unknown> | null;
}

function rowToAdminLead(row: LeadRow): AdminLead {
  const { firstName, lastName } = splitName(row.name);
  return {
    id: row.id,
    buyer: {
      firstName,
      lastName,
      email: row.email ?? "",
      phone: row.phone ?? "",
      city: row.buyer_city ?? "",
      country: row.buyer_country ?? (row.country_code ?? ""),
      languages: row.buyer_languages ?? [],
      budget: { max: row.criteria_budget_max ?? 0 },
      criteria: {
        types: row.criteria_type ? [row.criteria_type] : [],
        neighborhoods: row.criteria_neighborhood_slug ? [row.criteria_neighborhood_slug] : [],
        bedroomsMin: row.criteria_bedrooms_min ?? 0,
        mustHave: [],
      },
    },
    sourcePropertySlug: row.property_slug ?? "",
    source: (row.channel as LeadChannel) ?? "contact_form",
    intent: (row.intent as import("./leads").LeadIntent) ?? "acheter",
    advisorSlug: row.assigned_advisor_slug ?? "",
    status: (row.status as LeadStatus) ?? "new",
    message: row.message ?? undefined,
    createdAt: row.created_at,
    firstResponseAt: row.first_action_at ?? undefined,
    // Sans join events, on approx avec created_at. Remplacé dès qu'on rebranche
    // un trigger de last_activity_at (ou un join MAX(event.created_at)).
    lastActivityAt: row.first_action_at ?? row.created_at,
    nextVisit:
      row.next_visit_at && row.next_visit_property_slug
        ? {
            at: row.next_visit_at,
            propertySlug: row.next_visit_property_slug,
            confirmed: row.next_visit_confirmed ?? false,
          }
        : undefined,
    offer:
      row.offer_amount && row.offer_submitted_at && row.offer_status
        ? {
            amount: row.offer_amount,
            submittedAt: row.offer_submitted_at,
            status: row.offer_status as "pending" | "accepted" | "rejected",
          }
        : undefined,
    communications: [], // hydratée seulement par getLeadById
    propertiesViewed: row.properties_viewed ?? [],
    slaTier: (row.sla_tier as SlaTier) ?? "standard",
    slaDueAt: row.sla_due_at ?? row.created_at,
    portalToken: row.portal_token,
  };
}

function rowToLeadEvent(row: LeadEventRow): LeadEvent {
  return {
    id: row.id,
    leadId: row.lead_id,
    createdAt: row.created_at,
    type: row.type,
    authorSlug: row.author_slug,
    body: row.body,
    payload: row.payload ?? {},
  };
}

/**
 * Retourne les leads filtrés côté DB.
 *   - Pas d'option → tous les leads (usage scripts, SLA watcher)
 *   - { assignedAdvisorSlug } → uniquement ceux assignés à ce conseiller
 *
 * Le contrôle d'accès par session vit dans getLeadsForSession ci-dessous.
 */
export const getAllLeads = unstable_cache(
  async (options?: { assignedAdvisorSlug?: string }): Promise<AdminLead[]> => {
    let query = supabaseAdmin
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (options?.assignedAdvisorSlug) {
      query = query.eq("assigned_advisor_slug", options.assignedAdvisorSlug);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data as LeadRow[]).map(rowToAdminLead);
  },
  ["all-leads"],
  { tags: ["admin"], revalidate: 15 }
);

/**
 * Lecture scoped par session :
 *   - director → tous les leads (vue maison)
 *   - advisor  → ses leads uniquement
 *   - null     → aucun
 */
export async function getLeadsForSession(
  session: AdminSession | null
): Promise<AdminLead[]> {
  if (!session) return [];
  if (session.role === "advisor") {
    return getAllLeads({ assignedAdvisorSlug: session.advisorSlug });
  }
  return getAllLeads();
}

/**
 * Retourne un lead spécifique — renvoie null si la session n'a pas les
 * droits de le voir (advisor non-assigné). Comportement équivalent à un 404
 * pour l'UI, ce qui évite le leak d'existence.
 */
export async function getLeadById(
  id: string,
  session?: AdminSession | null | undefined
): Promise<AdminLead | null> {
  const { data, error } = await supabaseAdmin
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const lead = rowToAdminLead(data as LeadRow);

  // Scope check — advisor ne peut voir que ses leads
  if (session === null) return null;
  if (
    session &&
    session.role === "advisor" &&
    lead.advisorSlug !== session.advisorSlug
  ) {
    return null;
  }

  // Hydrate communications depuis lead_events
  const [{ data: events }, advisor] = await Promise.all([
    supabaseAdmin
      .from("lead_events")
      .select("*")
      .eq("lead_id", id)
      .order("created_at", { ascending: true }),
    lead.advisorSlug ? getAdvisor(lead.advisorSlug) : null,
  ]);

  lead.communications = (events ?? [])
    .map((ev) => eventToComm(rowToLeadEvent(ev as LeadEventRow), advisor?.name ?? null))
    .filter((c): c is NonNullable<typeof c> => c !== null);

  // lastActivityAt = max(events.created_at, lead.createdAt)
  if (events && events.length > 0) {
    const last = events[events.length - 1] as LeadEventRow;
    lead.lastActivityAt = last.created_at;
  }

  return lead;
}

// ════════════════════════════════════════════════════════════════════
// Mandates + property events
// ════════════════════════════════════════════════════════════════════

interface MandateRow {
  id: string;
  property_slug: string;
  created_at: string;
  updated_at: string;
  type: string;
  exclusivity: boolean;
  commission_pct: number | null;
  commission_fixed: number | null;
  signed_at: string | null;
  start_date: string | null;
  expiry_date: string | null;
  closed_at: string | null;
  status: string;
  disposition: string | null;
  assigned_advisor_slug: string | null;
  notes: string | null;
  owner_token: string;
}

interface PropertyEventRow {
  id: string;
  property_slug: string;
  mandate_id: string | null;
  created_at: string;
  type: string;
  author_slug: string | null;
  body: string | null;
  payload: Record<string, unknown> | null;
}

import type {
  Mandate,
  MandateStatus,
  MandateType,
  PropertyEvent,
} from "./mandates";

function rowToMandate(r: MandateRow): Mandate {
  return {
    id: r.id,
    propertySlug: r.property_slug,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    type: r.type as MandateType,
    exclusivity: r.exclusivity,
    commissionPct: r.commission_pct,
    commissionFixed: r.commission_fixed,
    signedAt: r.signed_at,
    startDate: r.start_date,
    expiryDate: r.expiry_date,
    closedAt: r.closed_at,
    status: r.status as MandateStatus,
    disposition: r.disposition,
    assignedAdvisorSlug: r.assigned_advisor_slug,
    notes: r.notes,
    ownerToken: r.owner_token,
  };
}

function rowToPropertyEvent(r: PropertyEventRow): PropertyEvent {
  return {
    id: r.id,
    propertySlug: r.property_slug,
    mandateId: r.mandate_id,
    createdAt: r.created_at,
    type: r.type,
    authorSlug: r.author_slug,
    body: r.body,
    payload: r.payload ?? {},
  };
}

/** Mandat actif pour un bien — null si aucun. Si plusieurs actifs (théoriquement
 *  impossible mais sécurité), retourne le plus récent. */
export async function getActiveMandateForProperty(
  slug: string
): Promise<Mandate | null> {
  const { data, error } = await supabaseAdmin
    .from("mandates")
    .select("*")
    .eq("property_slug", slug)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToMandate(data as MandateRow) : null;
}

/** Tous mandats d'un bien (actif + historique) */
export async function getAllMandatesForProperty(
  slug: string
): Promise<Mandate[]> {
  const { data, error } = await supabaseAdmin
    .from("mandates")
    .select("*")
    .eq("property_slug", slug)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as MandateRow[]).map(rowToMandate);
}

/** Mandats actifs gérés par un conseiller. */
export async function getMandatesByAdvisor(advisorSlug: string): Promise<Mandate[]> {
  const { data, error } = await supabaseAdmin
    .from("mandates")
    .select("*")
    .eq("assigned_advisor_slug", advisorSlug)
    .eq("status", "active")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as MandateRow[]).map(rowToMandate);
}

/** Biens dont ce conseiller est référent. */
export async function getPropertiesByAdvisor(
  advisorSlug: string
): Promise<Property[]> {
  const { data, error } = await supabaseAdmin
    .from("properties")
    .select(PROPERTY_SELECT)
    .eq("advisor_slug", advisorSlug)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as PropertyWithNeigh[]).map((r) =>
    rowToProperty(r, r.neighborhood?.name ?? null)
  );
}

/** Events récents authored par un conseiller (leads + properties fusionnés). */
export async function getRecentEventsByAdvisor(
  advisorSlug: string,
  limit = 25
): Promise<
  Array<{
    source: "lead" | "property";
    id: string;
    refId: string; // lead_id ou property_slug
    type: string;
    body: string | null;
    createdAt: string;
  }>
> {
  const [leadEventsRes, propEventsRes] = await Promise.all([
    supabaseAdmin
      .from("lead_events")
      .select("id, lead_id, type, body, created_at")
      .eq("author_slug", advisorSlug)
      .order("created_at", { ascending: false })
      .limit(limit),
    supabaseAdmin
      .from("property_events")
      .select("id, property_slug, type, body, created_at")
      .eq("author_slug", advisorSlug)
      .order("created_at", { ascending: false })
      .limit(limit),
  ]);

  if (leadEventsRes.error) throw leadEventsRes.error;
  if (propEventsRes.error) throw propEventsRes.error;

  const merged = [
    ...((leadEventsRes.data ?? []) as Array<{
      id: string;
      lead_id: string;
      type: string;
      body: string | null;
      created_at: string;
    }>).map((e) => ({
      source: "lead" as const,
      id: e.id,
      refId: e.lead_id,
      type: e.type,
      body: e.body,
      createdAt: e.created_at,
    })),
    ...((propEventsRes.data ?? []) as Array<{
      id: string;
      property_slug: string;
      type: string;
      body: string | null;
      created_at: string;
    }>).map((e) => ({
      source: "property" as const,
      id: e.id,
      refId: e.property_slug,
      type: e.type,
      body: e.body,
      createdAt: e.created_at,
    })),
  ];

  // Sort desc + slice to limit
  return merged
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, limit);
}

export async function getPropertyEvents(
  slug: string,
  limit = 50
): Promise<PropertyEvent[]> {
  const { data, error } = await supabaseAdmin
    .from("property_events")
    .select("*")
    .eq("property_slug", slug)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as PropertyEventRow[]).map(rowToPropertyEvent);
}

// ════════════════════════════════════════════════════════════════════
// Portail vendeur — lookup par owner_token (anon, pas d'auth)
// ════════════════════════════════════════════════════════════════════

export interface SellerPortalData {
  mandate: Mandate;
  property: Property;
  events: PropertyEvent[];
  advisor: Advisor | null;
  neighborhoodStats: NeighborhoodStat | null;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getMandateByOwnerToken(
  token: string
): Promise<SellerPortalData | null> {
  if (!UUID_RE.test(token)) return null;

  const { data: mandateData, error: mandateErr } = await supabase
    .from("mandates")
    .select("*")
    .eq("owner_token", token)
    .maybeSingle();
  if (mandateErr) throw mandateErr;
  if (!mandateData) return null;

  const mandate = rowToMandate(mandateData as MandateRow);

  // Paralléliser les 4 fetches indépendants
  const [propResult, eventsResult, advisor, mStats] = await Promise.all([
    supabase
      .from("properties")
      .select(PROPERTY_SELECT)
      .eq("slug", mandate.propertySlug)
      .maybeSingle(),
    supabase
      .from("property_events")
      .select("*")
      .eq("property_slug", mandate.propertySlug)
      .not("type", "in", '("note")')
      .order("created_at", { ascending: false })
      .limit(20),
    mandate.assignedAdvisorSlug ? getAdvisor(mandate.assignedAdvisorSlug) : Promise.resolve(null),
    getMarketStats(),
  ]);

  if (propResult.error) throw propResult.error;
  if (!propResult.data) return null;
  if (eventsResult.error) throw eventsResult.error;

  const pw = propResult.data as PropertyWithNeigh;
  const property = rowToProperty(pw, pw.neighborhood?.name ?? null);
  const events = (eventsResult.data as PropertyEventRow[]).map(rowToPropertyEvent);
  const neighborhoodStats =
    mStats.byNeighborhood.find((n) => n.slug === property.neighborhoodSlug) ?? null;

  return { mandate, property, events, advisor, neighborhoodStats };
}

// ════════════════════════════════════════════════════════════════════
// Portail client — lookup par token + shortlist curée
// ════════════════════════════════════════════════════════════════════

export async function getLeadByPortalToken(token: string): Promise<AdminLead | null> {
  const { data, error } = await supabaseAdmin
    .from("leads")
    .select("*")
    .eq("portal_token", token)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return rowToAdminLead(data as LeadRow);
}

/**
 * Sélection auto-sauvegardée (favoris / comparateur) rattachée à un
 * portal_token. Alimente /ma-selection/[token] : restaure la sélection sur
 * un nouvel appareil, sans compte ni mot de passe.
 *
 * Retourne null si le token n'existe pas OU s'il ne porte pas de sélection
 * (ex. un lead de contact classique) → empêche d'exposer un lead normal via
 * la route de restauration.
 */
export async function getSavedSelectionByToken(token: string): Promise<
  { kind: "favoris" | "comparateur"; slugs: string[]; email: string } | null
> {
  const { data, error } = await supabaseAdmin
    .from("leads")
    .select("email, meta")
    .eq("portal_token", token)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const meta = (data.meta ?? {}) as Record<string, unknown>;
  const slugs = Array.isArray(meta.saved_slugs)
    ? (meta.saved_slugs as unknown[]).filter(
        (s): s is string => typeof s === "string"
      )
    : [];
  if (slugs.length === 0) return null;

  const kind = meta.saved_kind === "comparateur" ? "comparateur" : "favoris";
  return { kind, slugs, email: (data.email as string) ?? "" };
}

interface ShortlistRow {
  id: string;
  lead_id: string;
  property_slug: string;
  advisor_note: string | null;
  added_at: string;
  added_by: string | null;
}

export async function getShortlistForLead(leadId: string) {
  const { data, error } = await supabaseAdmin
    .from("lead_shortlist")
    .select("*")
    .eq("lead_id", leadId)
    .order("added_at", { ascending: false });
  if (error) throw error;

  const rows = (data as ShortlistRow[]) ?? [];
  const propMap = await getPropertiesBySlugs(rows.map((r) => r.property_slug));
  return rows
    .filter((r) => propMap.has(r.property_slug))
    .map((row) => ({
      property: propMap.get(row.property_slug)!,
      item: {
        id: row.id,
        leadId: row.lead_id,
        propertySlug: row.property_slug,
        advisorNote: row.advisor_note,
        addedAt: row.added_at,
        addedBy: row.added_by,
      },
    }));
}

export async function getLeadEvents(leadId: string): Promise<LeadEvent[]> {
  const { data, error } = await supabaseAdmin
    .from("lead_events")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as LeadEventRow[]).map(rowToLeadEvent);
}

// ════════════════════════════════════════════════════════════════════
// Map pins — données légères pour la vue carte publique
// ════════════════════════════════════════════════════════════════════

export interface PropertyPin {
  slug: string;
  title: string;
  price: number;
  priceUnit?: "semaine" | "mois";
  listing: Listing;
  type: PropertyType;
  coordinates: { lat: number; lng: number };
  neighborhoodSlug: string;
  city: string;
  image: string | null;
  bedrooms: number;
  surface: number;
}

export async function getPropertyPins(): Promise<PropertyPin[]> {
  const { data, error } = await supabase
    .from("properties")
    .select(
      "slug,title,price_eur,price_unit,listing,type,neighborhood_slug,city,images,bedrooms,surface"
    )
    .eq("published", true)
    .order("featured", { ascending: false });
  if (error) throw error;
  return (data as {
    slug: string; title: string; price_eur: number; price_unit: "semaine" | "mois" | null;
    listing: Listing; type: PropertyType; neighborhood_slug: string | null;
    city: "Marrakech" | "Essaouira"; images: string[]; bedrooms: number | null; surface: number | null;
  }[]).map((r) => ({
    slug: r.slug,
    title: r.title,
    price: r.price_eur,
    priceUnit: r.price_unit ?? undefined,
    listing: r.listing,
    type: r.type,
    coordinates:
      (r.neighborhood_slug ? NEIGHBORHOOD_COORDS[r.neighborhood_slug] : null)
      ?? CITY_DEFAULT_COORDS[r.city]
      ?? { lat: 31.6295, lng: -7.9811 },
    neighborhoodSlug: r.neighborhood_slug ?? "",
    city: r.city,
    image: r.images?.[0] ?? null,
    bedrooms: r.bedrooms ?? 0,
    surface: r.surface ?? 0,
  }));
}

// ════════════════════════════════════════════════════════════════════
// Market stats — indice prix/m² et métriques pour /marche
// ════════════════════════════════════════════════════════════════════

export interface NeighborhoodStat {
  slug: string;
  label: string;
  city: string;
  count: number;
  avgPricePerSqm: number;
  medianPrice: number;
  minPrice: number;
  maxPrice: number;
}

export interface MarketStats {
  totalListings: number;
  venteCount: number;
  locationCount: number;
  avgPriceVente: number;
  avgPriceLocation: number;
  byNeighborhood: NeighborhoodStat[];
  byType: { type: PropertyType; label: string; count: number }[];
}

export async function getMarketStats(): Promise<MarketStats> {
  const { data, error } = await supabase
    .from("properties")
    .select("listing,type,price_eur,surface,neighborhood_slug,city")
    .eq("published", true);
  if (error) throw error;

  const rows = data as {
    listing: Listing; type: PropertyType;
    price_eur: number; surface: number | null;
    neighborhood_slug: string | null; city: string;
  }[];

  const vente = rows.filter((r) => r.listing === "vente" || r.type === "programme-neuf");
  const location = rows.filter((r) => r.listing !== "vente" && r.type !== "programme-neuf");

  const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
  const median = (arr: number[]) => {
    if (!arr.length) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  };

  // Regrouper par quartier (vente uniquement, surface connue)
  const neigh = new Map<string, { prices: number[]; ppsqm: number[]; city: string }>();
  for (const r of vente) {
    if (!r.neighborhood_slug) continue;
    if (!neigh.has(r.neighborhood_slug)) neigh.set(r.neighborhood_slug, { prices: [], ppsqm: [], city: r.city });
    const n = neigh.get(r.neighborhood_slug)!;
    n.prices.push(r.price_eur);
    if (r.surface && r.surface > 0) n.ppsqm.push(Math.round(r.price_eur / r.surface));
  }

  const NEIGH_LABELS: Record<string, string> = {
    medina: "Médina", hivernage: "Hivernage", gueliz: "Guéliz", palmeraie: "Palmeraie",
    targa: "Targa", amelkis: "Amelkis", agdal: "Agdal", ourika: "Route de l'Ourika",
    fes: "Route de Fès", ouarzazate: "Route de Ouarzazate", amizmiz: "Route d'Amizmiz",
    "essaouira-medina": "Médina d'Essaouira", diabat: "Diabat",
  };

  const byNeighborhood: NeighborhoodStat[] = Array.from(neigh.entries())
    .map(([slug, d]) => ({
      slug,
      label: NEIGH_LABELS[slug] ?? slug,
      city: d.city,
      count: d.prices.length,
      avgPricePerSqm: avg(d.ppsqm),
      medianPrice: median(d.prices),
      minPrice: Math.min(...d.prices),
      maxPrice: Math.max(...d.prices),
    }))
    .filter((s) => s.avgPricePerSqm > 0)
    .sort((a, b) => b.avgPricePerSqm - a.avgPricePerSqm);

  // Regrouper par type
  const typeMap = new Map<PropertyType, number>();
  for (const r of rows) {
    typeMap.set(r.type, (typeMap.get(r.type) ?? 0) + 1);
  }
  const TYPE_LABELS_MAP: Partial<Record<PropertyType, string>> = {
    "riad-renove": "Riads rénovés", "riad-a-renover": "Riads à rénover",
    villa: "Villas", appartement: "Appartements",
    "maison-hotes": "Maisons d'hôtes", "programme-neuf": "Programmes neufs", terrain: "Terrains",
  };
  const byType = Array.from(typeMap.entries())
    .map(([type, count]) => ({ type, label: TYPE_LABELS_MAP[type] ?? type, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalListings: rows.length,
    venteCount: vente.length,
    locationCount: location.length,
    avgPriceVente: avg(vente.map((r) => r.price_eur)),
    avgPriceLocation: avg(location.map((r) => r.price_eur)),
    byNeighborhood,
    byType,
  };
}
