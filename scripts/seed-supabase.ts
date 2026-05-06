/**
 * Seed Supabase avec :
 *   1. neighborhoods    (depuis scripts/seed-data/neighborhoods.ts)
 *   2. advisors         (depuis scripts/seed-data/advisors.ts)
 *   3. journal_articles (depuis scripts/seed-data/journal.ts)
 *   4. properties       (depuis scripts/fixtures/properties.json — scrape MR)
 *
 * Idempotent : utilise .upsert({ onConflict: 'slug' }). Relançable à volonté.
 * NB : ne supprime jamais de rows — les biens curatés à la main dans Supabase
 *      Studio sont préservés.
 *
 * Run : npx tsx scripts/seed-supabase.ts
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

import { advisorsSeed } from "./seed-data/advisors";
import { neighborhoodsSeed } from "./seed-data/neighborhoods";
import { articlesSeed } from "./seed-data/journal";
import { NEIGHBORHOODS } from "../src/data/properties";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!url || !serviceKey) {
  console.error("Manquant : NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ══════════════════════════════════════════════════════════════════════
// Mapping : scrape JSON MR → schema Supabase
// ══════════════════════════════════════════════════════════════════════

interface ScrapedProperty {
  url: string;
  slug: string;
  ref: string | null;
  title: string | null;
  listing: "vente" | "location" | "programme-neuf";
  status: "available" | "new" | "sold" | "rented" | "reserved";
  typeBien: string | null;
  ville: string | null;
  bedrooms: number | null;
  surfaceTerrain: number | null;
  surfaceHabitable: number | null;
  priceEur: number | null;
  priceMad: number | null;
  description: string | null;
  equipements: string[];
  images: string[];
}

const TYPE_MAP: Record<string, string> = {
  Villa: "villa",
  "Riad rénové": "riad-renove",
  "Riad à rénover": "riad-a-renover",
  Riad: "riad-renove",
  Appartement: "appartement",
  "programmes neufs": "programme-neuf",
  Terrain: "terrain",
};

function guessNeighborhood(text: string): string | null {
  const t = text.toLowerCase();
  const mappings: Array<[RegExp, string]> = [
    [/palmeraie/, "palmeraie"],
    [/médina|medina/, "medina"],
    [/hivernage/, "hivernage"],
    [/\btarga\b/, "targa"],
    [/amelkis/, "amelkis"],
    [/\bagdal\b/, "agdal"],
    [/\bgueliz\b|\bguéliz\b/, "gueliz"],
    [/\bourika\b/, "ourika"],
    [/route.{0,6}f[èe]s/, "fes"],
    [/ouarzazate/, "ouarzazate"],
    [/amizmiz/, "amizmiz"],
    [/\bdiabat\b/, "diabat"],
    [/essaouira/, "essaouira-medina"],
  ];
  for (const [re, slug] of mappings) if (re.test(t)) return slug;
  return null;
}

function guessAdvisor(neighSlug: string | null, city: string): string {
  if (city === "Essaouira") return "hamza-bennouna";
  if (neighSlug === "medina") return "camille-decourt";
  if (neighSlug === "hivernage" || neighSlug === "gueliz") return "lena-vasconcelos";
  return "idriss-el-amrani";
}

function fromScraped(p: ScrapedProperty): any | null {
  if (!p.title || !p.ref) return null;
  const type = TYPE_MAP[p.typeBien ?? ""];
  if (!type) return null;
  const city = p.ville === "Essaouira" ? "Essaouira" : "Marrakech";
  const neighSlug = guessNeighborhood((p.title ?? "") + " " + (p.description ?? ""));
  return {
    slug: p.slug,
    reference: p.ref,
    title: p.title,
    tagline: null,
    type,
    listing: p.listing,
    status: p.status ?? "available",
    exclusivity: false,
    city,
    neighborhood_slug: neighSlug,
    price_eur: p.priceEur ?? 0,
    price_mad: p.priceMad,
    price_unit: p.listing === "location" ? "mois" : null,
    bedrooms: p.bedrooms,
    bathrooms: null,
    surface: p.surfaceHabitable,
    land_surface: p.surfaceTerrain,
    year_built: null,
    pool: p.equipements.some((e) => /piscine/i.test(e)),
    featured: false,
    short_description: p.description?.slice(0, 200) ?? null,
    description: p.description,
    story: null,
    features: p.equipements,
    images: p.images,
    walking_distances: [],
    advisor_slug: guessAdvisor(neighSlug, city),
    published: true,
  };
}

// ══════════════════════════════════════════════════════════════════════

async function upsert(table: string, rows: any[]) {
  if (rows.length === 0) {
    console.log(`– ${table} : rien à insérer`);
    return;
  }
  const BATCH = 50;
  let total = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const { error } = await supabase.from(table).upsert(chunk, { onConflict: "slug" });
    if (error) {
      console.error(`  ✗ ${table} batch ${i}: ${error.message}`);
      if (error.details) console.error(`    details: ${error.details}`);
      throw error;
    }
    total += chunk.length;
    process.stdout.write(`  ✓ ${table} ${total}/${rows.length}\r`);
  }
  console.log(`  ✓ ${table} ${total} upsertées`.padEnd(60));
}

async function main() {
  console.log("\n═══ SEED SUPABASE ═══════════════════════════════════════════\n");

  // 1. Neighborhoods : 13 slugs (FK requirement) + éditorial pour les 6 enrichis
  console.log("1. Neighborhoods");
  const nbRows = NEIGHBORHOODS.map((n) => {
    const editorial = neighborhoodsSeed[n.slug];
    return {
      slug: n.slug,
      name: n.label,
      city: n.city,
      tagline: editorial?.tagline ?? null,
      paragraphs: editorial?.paragraphs ?? [],
      highlights: editorial?.highlights ?? [],
      image_hero: editorial?.imageHero ?? null,
    };
  });
  await upsert("neighborhoods", nbRows);

  // 2. Advisors — deux passes pour ne pas écraser email/access_role en prod.
  //    Les champs `email` et `access_role` sont sensibles : un directeur les
  //    configure après le seed initial. On ne les touche plus après.
  console.log("2. Advisors");
  const { data: existingAdvisors } = await supabase
    .from("advisors")
    .select("slug");
  const existingSlugs = new Set(
    (existingAdvisors ?? []).map((r: { slug: string }) => r.slug)
  );

  const newRows = advisorsSeed
    .filter((a) => !existingSlugs.has(a.slug))
    .map((a) => ({
      slug: a.slug,
      name: a.name,
      role: a.role,
      photo: a.photo,
      phone: a.phone,
      whatsapp: a.whatsapp,
      email: a.email,
      speciality: a.speciality,
      languages: a.languages,
      years_experience: a.yearsExperience,
      access_role: a.accessRole,
      active: true,
    }));

  const updateRows = advisorsSeed
    .filter((a) => existingSlugs.has(a.slug))
    .map((a) => ({
      slug: a.slug,
      name: a.name,
      role: a.role,
      photo: a.photo,
      phone: a.phone,
      whatsapp: a.whatsapp,
      // Pas d'email ni access_role — on préserve ce qui a été configuré
      speciality: a.speciality,
      languages: a.languages,
      years_experience: a.yearsExperience,
      active: true,
    }));

  if (newRows.length > 0) {
    console.log(`  ↳ ${newRows.length} advisors nouveaux (insert complet)`);
    await upsert("advisors", newRows);
  }
  if (updateRows.length > 0) {
    console.log(
      `  ↳ ${updateRows.length} advisors existants (update sans toucher email/access_role)`
    );
    await upsert("advisors", updateRows);
  }

  // 3. Journal articles
  console.log("3. Journal articles");
  const artRows = articlesSeed.map((a) => ({
    slug: a.slug,
    title: a.title,
    lead: a.lead,
    category: a.category,
    author: a.author,
    published_at: a.publishedAt,
    reading_time: a.readingTime,
    image_hero: a.imageHero,
    paragraphs: a.paragraphs,
  }));
  await upsert("journal_articles", artRows);

  // 4. Properties scrapées (les biens curatés en DB sont préservés)
  console.log("4. Properties (scrape MR)");
  const scrapedPath = join(process.cwd(), "scripts/fixtures/properties.json");
  const scraped: ScrapedProperty[] = JSON.parse(readFileSync(scrapedPath, "utf-8"));
  const mapped = scraped
    .map(fromScraped)
    .filter((p): p is any => p !== null);
  console.log(`  → ${scraped.length} scrapés, ${mapped.length} valides après mapping`);
  await upsert("properties", mapped);

  // Stats finales
  const { count: pc } = await supabase
    .from("properties")
    .select("*", { count: "exact", head: true });
  const { count: pubCount } = await supabase
    .from("properties")
    .select("*", { count: "exact", head: true })
    .eq("published", true);
  console.log(`\n✓ ${pc} propriétés en DB (${pubCount} publiées). Terminé.\n`);
}

main().catch((e) => {
  console.error("\n✗ FATAL:", e);
  process.exit(1);
});
