#!/usr/bin/env node

/**
 * Synchronise le catalogue public Marrakech Realty vers Supabase.
 *
 * Par défaut : audit en lecture seule + fixture JSON + rapport de redirections.
 * Avec --write : upsert idempotent dans `properties` (migration 0014 requise).
 * Le script ne supprime et ne dépublie jamais automatiquement un bien absent :
 * une disparition WordPress doit être validée humainement avant mutation.
 *
 * Exemples :
 *   node scripts/sync-wordpress-properties.mjs --limit=10
 *   node scripts/sync-wordpress-properties.mjs
 *   node scripts/sync-wordpress-properties.mjs --write
 */

import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const WP_BASE = "https://www.marrakechrealty.com";
const TYPES = [
  { restBase: "vente", postType: "vente", listing: "vente" },
  { restBase: "location", postType: "location", listing: "location" },
  { restBase: "programmes-neufs", postType: "programme", listing: "vente" },
];
const FIXTURE_PATH = resolve(process.cwd(), "scripts/fixtures/properties-current.json");
const REPORT_PATH = resolve(process.cwd(), "scripts/fixtures/properties-current.report.json");
const REDIRECT_PATH = resolve(process.cwd(), "scripts/fixtures/property-redirects.csv");
const args = new Set(process.argv.slice(2));
const valueArg = (name) => {
  const hit = [...args].find((arg) => arg.startsWith(`${name}=`));
  return hit ? hit.slice(name.length + 1) : null;
};
const limit = Number(valueArg("--limit") || 0);
const concurrency = Math.max(1, Math.min(12, Number(valueArg("--concurrency") || 6)));
const shouldWrite = args.has("--write");

function decodeEntities(value = "") {
  const named = {
    amp: "&", quot: '"', apos: "'", nbsp: " ", laquo: "«", raquo: "»",
    rsquo: "’", lsquo: "‘", ndash: "–", mdash: "—", hellip: "…", eacute: "é",
    egrave: "è", agrave: "à", ecirc: "ê", ocirc: "ô", ucirc: "û", ccedil: "ç",
  };
  return String(value)
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&([a-z]+);/gi, (match, name) => named[name.toLowerCase()] ?? match);
}

function cleanText(value = "") {
  return decodeEntities(
    String(value)
      .replace(/<br\s*\/?\s*>/gi, "\n")
      .replace(/<\/p\s*>/gi, "\n\n")
      .replace(/<\/li\s*>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parseWpJson(raw) {
  const starts = [raw.indexOf("[{"), raw.indexOf("[]")].filter((n) => n >= 0);
  if (!starts.length) throw new Error("Réponse WordPress REST non JSON");
  return JSON.parse(raw.slice(Math.min(...starts)));
}

async function fetchText(url, attempt = 1) {
  const response = await fetch(url, {
    headers: { "user-agent": "MarrakechCatalogMigration/1.0 (+catalog parity)" },
    redirect: "follow",
  });
  if (!response.ok) {
    if (attempt < 4 && (response.status === 429 || response.status >= 500)) {
      await new Promise((resolvePromise) => setTimeout(resolvePromise, attempt * 750));
      return fetchText(url, attempt + 1);
    }
    throw new Error(`${response.status} ${url}`);
  }
  return { response, text: await response.text() };
}

async function fetchRestType(config) {
  const fields = "id,date,modified,slug,status,link,title,content,featured_media";
  const firstUrl = `${WP_BASE}/wp-json/wp/v2/${config.restBase}?per_page=100&page=1&_fields=${fields}`;
  const first = await fetchText(firstUrl);
  const pages = Number(first.response.headers.get("x-wp-totalpages") || 1);
  const total = Number(first.response.headers.get("x-wp-total") || 0);
  const rows = parseWpJson(first.text);
  for (let page = 2; page <= pages; page += 1) {
    const result = await fetchText(`${WP_BASE}/wp-json/wp/v2/${config.restBase}?per_page=100&page=${page}&_fields=${fields}`);
    rows.push(...parseWpJson(result.text));
  }
  return { ...config, total, rows };
}

function first(html, pattern) {
  const match = html.match(pattern);
  return match ? cleanText(match[1]) : null;
}

function numberFrom(value) {
  if (!value) return null;
  const digits = String(value).replace(/[^0-9]/g, "");
  return digits ? Number(digits) : null;
}

function metaContent(html, key, attribute = "name") {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return first(
    html,
    new RegExp(`<meta[^>]+${attribute}=["']${escaped}["'][^>]+content=["']([^"']*)["']`, "i"),
  ) || first(
    html,
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+${attribute}=["']${escaped}["']`, "i"),
  );
}

function normalizeType(label, title, postType) {
  if (postType === "programme") return "programme-neuf";
  const value = `${label || ""} ${title || ""}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (value.includes("appartement") || value.includes("penthouse") || value.includes("duplex")) return "appartement";
  if (value.includes("terrain")) return "terrain";
  if (value.includes("maison d'hote") || value.includes("maison d’hote") || value.includes("hotel")) return "maison-hotes";
  if (value.includes("riad") && value.includes("renov")) return "riad-renove";
  if (value.includes("riad") && (value.includes("renover") || value.includes("restaur"))) return "riad-a-renover";
  if (value.includes("riad")) return "riad-renove";
  if (value.includes("villa") || value.includes("maison") || value.includes("ferme")) return "villa";
  return "autre";
}

function neighborhoodSlug(text = "") {
  const value = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const mappings = [
    [/palmeraie/, "palmeraie"], [/medina/, "medina"], [/hivernage/, "hivernage"],
    [/\btarga\b/, "targa"], [/amelkis/, "amelkis"], [/\bagdal\b/, "agdal"],
    [/\bgueliz\b/, "gueliz"], [/ourika/, "ourika"], [/route.{0,8}fes/, "fes"],
    [/ouarzazate/, "ouarzazate"], [/amizmiz/, "amizmiz"], [/\bdiabat\b/, "diabat"],
    [/essaouira/, "essaouira-medina"],
  ];
  return mappings.find(([pattern]) => pattern.test(value))?.[1] ?? null;
}

function extractFeatures(html) {
  const block = html.match(/<ul[^>]+class=["'][^"']*list-eq[^"']*["'][^>]*>([\s\S]*?)<\/ul>/i)?.[1] || "";
  return [...block.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((match) => cleanText(match[1]))
    .filter(Boolean);
}

function extractImages(html) {
  const candidates = [];
  for (const match of html.matchAll(/<a\b[^>]*>/gi)) {
    const tag = match[0];
    if (!/data-fancybox=["']gallery-product["']/i.test(tag) && !/class=["'][^"']*fancybox-button/i.test(tag)) continue;
    const href = tag.match(/href=["']([^"']+)["']/i)?.[1];
    if (href) candidates.push(decodeEntities(href));
  }
  if (!candidates.length) {
    const ogImage = metaContent(html, "og:image", "property");
    if (ogImage) candidates.push(ogImage);
  }
  return [...new Set(candidates.filter((url) => /\/wp-content\/uploads\//i.test(url)))];
}

function parseStatus(html) {
  const badge = first(html, /<div[^>]+class=["'][^"']*bien-options[^"']*["'][^>]*>([\s\S]*?)<\/div>/i) || "";
  const value = badge.toLowerCase();
  if (/vendu/.test(value)) return "sold";
  if (/lou[ée]/.test(value)) return "rented";
  if (/r[ée]serv|compromis/.test(value)) return "reserved";
  if (/new|nouveau/.test(value)) return "new";
  if (/bien-options[^>]*\bvendu\b/i.test(html)) return "sold";
  if (/bien-options[^>]*\bloue\b/i.test(html)) return "rented";
  return "available";
}

function parseDetail(rest, config, html) {
  const sourceTypeLabel = first(html, /<b>Type de bien\s*:<\/b>\s*(?:<span[^>]*>)?\s*(?:vente|location|programme)?\s*\/?\s*([^<]+)/i)
    || first(html, /class=["']capitalize-letter["'][^>]*>\s*(?:vente|location|programme)?\s*\/?\s*([^<]+)/i)
    || (config.postType === "programme" ? "Programme neuf" : null);
  const city = first(html, /<b>Ville\s*:<\/b>\s*([^<]+)/i) || "Marrakech";
  const locationLine = first(html, /<i[^>]+fa-map-marker-alt[^>]*><\/i>\s*([^<]+)/i);
  const sourceLocationLabel = locationLine?.split(">").slice(1).join(">").trim() || null;
  const title = cleanText(rest.title?.rendered || "");
  const descriptionHtml = rest.content?.rendered || "";
  const description = cleanText(descriptionHtml);
  const images = extractImages(html);
  const sourceUrl = rest.link || `${WP_BASE}/${config.postType}/${rest.slug}/`;
  const newBase = config.listing === "location" ? "louer" : "acheter";
  const seoTitle = cleanText(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "") || null;
  const seoDescription = metaContent(html, "description") || metaContent(html, "og:description", "property");
  const priceText = first(html, /class=["'][^"']*price-euro[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
  const priceMadText = first(html, /class=["'][^"']*price-mad[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
  const reference = first(html, /class=["'][^"']*ref-numero[^"']*["'][^>]*>([^<]+)/i)
    || first(html, /<b>Référence\s*:<\/b>\s*([^<]+)/i)
    || "";
  const locationContext = `${title} ${sourceLocationLabel || ""} ${description.slice(0, 500)}`;
  const listing = config.listing === "location" && /locations? saisonni[èe]res?/i.test(sourceTypeLabel || "")
    ? "location-saisonniere"
    : config.listing;

  return {
    slug: rest.slug,
    reference,
    title,
    tagline: null,
    type: normalizeType(sourceTypeLabel, title, config.postType),
    listing,
    status: parseStatus(html),
    exclusivity: /exclusivit[ée]|exclusif/i.test(first(html, /bien-options[^>]*>([\s\S]*?)<\/div>/i) || ""),
    city,
    neighborhood_slug: neighborhoodSlug(locationContext),
    price_eur: numberFrom(priceText) || 0,
    price_mad: numberFrom(priceMadText),
    price_unit: listing !== "vente" ? (listing === "location-saisonniere" || /semaine/i.test(priceText || html.slice(0, 40000)) ? "semaine" : "mois") : null,
    bedrooms: numberFrom(first(html, /<b>Nombre de chambres\s*:<\/b>\s*([^<]+)/i)),
    bathrooms: numberFrom(first(html, /<b>(?:Nombre de salles? de bains?|Salles? de bains?)\s*:<\/b>\s*([^<]+)/i)),
    surface: numberFrom(first(html, /<b>Surface habitable\s*:<\/b>\s*([^<]+)/i)),
    land_surface: numberFrom(first(html, /<b>Surface terrain\s*:<\/b>\s*([^<]+)/i)),
    year_built: null,
    pool: extractFeatures(html).some((feature) => /piscine|bassin/i.test(feature)),
    featured: false,
    published: true,
    short_description: seoDescription || description.slice(0, 240),
    description,
    description_html: descriptionHtml,
    story: null,
    features: extractFeatures(html),
    images,
    walking_distances: [],
    advisor_slug: null,
    source_platform: "wordpress",
    source_id: rest.id,
    source_slug: rest.slug,
    source_post_type: config.postType,
    source_url: sourceUrl,
    source_modified_at: rest.modified ? `${rest.modified}Z` : null,
    source_type_label: sourceTypeLabel,
    source_location_label: sourceLocationLabel,
    seo_title: seoTitle,
    seo_description: seoDescription,
    source_payload: {
      wordpressDate: rest.date,
      wordpressStatus: rest.status,
      featuredMediaId: rest.featured_media,
      detailSha256: createHash("sha256").update(html).digest("hex"),
      contentSha256: createHash("sha256").update(descriptionHtml).digest("hex"),
    },
    imported_at: new Date().toISOString(),
    migration: {
      oldPath: new URL(sourceUrl).pathname.replace(/\/$/, ""),
      newPath: `/${newBase}/${rest.slug}`,
    },
  };
}

function resolveSlugCollisions(properties) {
  const bySlug = new Map();
  for (const property of properties) {
    const entries = bySlug.get(property.slug) || [];
    entries.push(property);
    bySlug.set(property.slug, entries);
  }

  const collisions = [];
  const occupied = new Set(properties.map((property) => property.slug));
  for (const [sourceSlug, entries] of bySlug) {
    if (entries.length < 2) continue;
    entries.sort((a, b) => new Date(b.source_modified_at || 0) - new Date(a.source_modified_at || 0));
    const resolution = [{ sourceId: entries[0].source_id, slug: entries[0].slug }];
    for (const property of entries.slice(1)) {
      const base = `${sourceSlug}-${property.source_post_type === "programme" ? "programme-neuf" : property.source_post_type}`;
      let candidate = base;
      if (occupied.has(candidate)) candidate = `${base}-${property.source_id}`;
      occupied.add(candidate);
      property.slug = candidate;
      property.migration.newPath = `/${property.listing === "location" ? "louer" : "acheter"}/${candidate}`;
      resolution.push({ sourceId: property.source_id, slug: candidate });
    }
    collisions.push({ sourceSlug, resolution });
  }
  return collisions;
}

async function mapLimit(rows, workerCount, mapper) {
  const output = new Array(rows.length);
  let cursor = 0;
  async function worker() {
    while (cursor < rows.length) {
      const index = cursor++;
      output[index] = await mapper(rows[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(workerCount, rows.length) }, worker));
  return output;
}

async function writeSupabase(properties) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("--write requiert NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY");
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const rows = properties.map((property) => {
    const row = { ...property };
    delete row.migration;
    return row;
  });
  for (let start = 0; start < rows.length; start += 50) {
    const batch = rows.slice(start, start + 50);
    const { error } = await client.from("properties").upsert(batch, { onConflict: "slug" });
    if (error) throw new Error(`Supabase batch ${start}: ${error.message}`);
    process.stdout.write(`\rSupabase ${Math.min(start + batch.length, rows.length)}/${rows.length}`);
  }
  process.stdout.write("\n");
}

async function main() {
  console.log("Lecture de l’inventaire WordPress…");
  const inventories = await Promise.all(TYPES.map(fetchRestType));
  let jobs = inventories.flatMap((inventory) =>
    inventory.rows.map((rest) => ({ config: inventory, rest })),
  );
  if (limit > 0) jobs = jobs.slice(0, limit);

  let done = 0;
  const failures = [];
  const parsed = await mapLimit(jobs, concurrency, async ({ rest, config }) => {
    try {
      const { text } = await fetchText(rest.link);
      return parseDetail(rest, config, text);
    } catch (error) {
      failures.push({ id: rest.id, slug: rest.slug, url: rest.link, error: String(error) });
      const fallback = parseDetail(rest, config, "");
      fallback.source_payload.detailFetchError = String(error);
      return fallback;
    } finally {
      done += 1;
      process.stdout.write(`\rFiches ${done}/${jobs.length} — erreurs ${failures.length}`);
    }
  });
  process.stdout.write("\n");
  const properties = parsed.filter(Boolean);
  const slugCollisions = resolveSlugCollisions(properties);
  const missing = (field) => properties.filter((property) => {
    const value = property[field];
    return value === null || value === "" || (Array.isArray(value) && value.length === 0);
  }).length;
  const report = {
    generatedAt: new Date().toISOString(),
    source: WP_BASE,
    declaredTotals: Object.fromEntries(inventories.map((item) => [item.postType, item.total])),
    fetched: jobs.length,
    parsed: properties.length,
    failures,
    slugCollisions,
    missing: {
      reference: missing("reference"),
      sourceTypeLabel: missing("source_type_label"),
      images: missing("images"),
      price: properties.filter((property) => property.price_eur === 0).length,
      city: missing("city"),
    },
    normalizedTypes: Object.fromEntries(
      [...new Set(properties.map((property) => property.type))].sort().map((type) => [type, properties.filter((property) => property.type === type).length]),
    ),
  };

  await mkdir(resolve(process.cwd(), "scripts/fixtures"), { recursive: true });
  await writeFile(FIXTURE_PATH, `${JSON.stringify(properties, null, 2)}\n`);
  await writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
  const csv = ["old_path,new_path,status", ...properties.map((p) => `"${p.migration.oldPath}","${p.migration.newPath}",308`)];
  await writeFile(REDIRECT_PATH, `${csv.join("\n")}\n`);

  if (shouldWrite) await writeSupabase(properties);
  console.log(JSON.stringify(report, null, 2));
  console.log(`Fixture : ${FIXTURE_PATH}`);
  console.log(`Redirections : ${REDIRECT_PATH}`);
  console.log(shouldWrite ? "Upsert Supabase terminé (aucune suppression)." : "Audit uniquement : aucune écriture Supabase.");
  if (failures.length) process.exitCode = 2;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
