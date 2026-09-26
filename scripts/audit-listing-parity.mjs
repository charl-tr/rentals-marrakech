#!/usr/bin/env node

/**
 * Audit public, read-only, de parite entre le WordPress Marrakech Realty
 * et le catalogue Next.js deploye sur Vercel.
 *
 * Ce premier niveau compare l'inventaire public (slugs, titres, dates et
 * familles vente/location/programme). Il ne pretend pas comparer les donnees
 * privees, les brouillons WordPress ou les outils de multidiffusion internes.
 */

import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const WP_BASE = "https://www.marrakechrealty.com";
const APP_BASE = "https://rentals-marrakech.vercel.app";
const OUTPUT_DIR = resolve(process.cwd(), "../../outputs");
const JSON_OUTPUT = resolve(OUTPUT_DIR, "marrakech-listing-parity.json");
const MD_OUTPUT = resolve(OUTPUT_DIR, "marrakech-listing-parity.md");

const WP_TYPES = [
  { type: "vente", restBase: "vente" },
  { type: "location", restBase: "location" },
  { type: "programme", restBase: "programmes-neufs" },
];
const APP_CATEGORY_SLUGS = new Set([
  "villa",
  "appartement",
  "saisonnier",
  "riad-renove",
  "riad-a-renover",
  "maison-hotes",
  "programmes-neufs",
  "terrain",
]);

function decodeEntities(value = "") {
  return value
    .replaceAll("&#8211;", "–")
    .replaceAll("&#8212;", "—")
    .replaceAll("&#8217;", "’")
    .replaceAll("&#039;", "'")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replace(/<[^>]*>/g, "")
    .trim();
}

function normalizeTitle(value = "") {
  return decodeEntities(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function parseWpJson(raw) {
  // Le site injecte parfois un script Fusion Builder avant le JSON REST.
  const arrayStart = raw.indexOf("[{");
  const emptyStart = raw.indexOf("[]");
  const start = arrayStart >= 0 ? arrayStart : emptyStart;
  if (start < 0) throw new Error("Reponse WordPress non JSON");
  return JSON.parse(raw.slice(start));
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { "user-agent": "MarrakechParityAudit/1.0" },
  });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return { response, text: await response.text() };
}

async function fetchWpType({ type, restBase }) {
  const fields = "id,date,modified,slug,status,link,title,featured_media";
  const firstUrl = `${WP_BASE}/wp-json/wp/v2/${restBase}?per_page=100&page=1&_fields=${fields}`;
  const first = await fetchText(firstUrl);
  const totalPages = Number(first.response.headers.get("x-wp-totalpages") || 1);
  const total = Number(first.response.headers.get("x-wp-total") || 0);
  const rows = parseWpJson(first.text);

  for (let page = 2; page <= totalPages; page += 1) {
    const url = `${WP_BASE}/wp-json/wp/v2/${restBase}?per_page=100&page=${page}&_fields=${fields}`;
    const { text } = await fetchText(url);
    rows.push(...parseWpJson(text));
  }

  return {
    type,
    total,
    rows: rows.map((row) => ({
      source: "wordpress",
      type,
      id: row.id,
      slug: row.slug,
      title: decodeEntities(row.title?.rendered),
      normalizedTitle: normalizeTitle(row.title?.rendered),
      date: row.date,
      modified: row.modified,
      url: row.link,
      featuredMediaId: row.featured_media,
    })),
  };
}

async function fetchAppInventory() {
  const { text: sitemap } = await fetchText(`${APP_BASE}/sitemap.xml`);
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const rows = [];

  for (const originalUrl of urls) {
    const url = new URL(originalUrl);
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length !== 2) continue;
    if (!new Set(["acheter", "louer"]).has(parts[0])) continue;
    if (APP_CATEGORY_SLUGS.has(parts[1])) continue;

    rows.push({
      source: "app",
      type: parts[0] === "acheter" ? "vente" : "location",
      slug: parts[1],
      url: `${APP_BASE}${url.pathname}`,
    });
  }

  return { sitemapUrlCount: urls.length, rows };
}

function percentage(numerator, denominator) {
  return denominator ? Math.round((numerator / denominator) * 1000) / 10 : 0;
}

function sample(rows, limit = 25) {
  return rows.slice(0, limit);
}

function numericValue(value) {
  if (value === undefined || value === null || value === "") return null;
  const normalized = String(value).replace(/[^0-9.,]/g, "").replace(",", ".");
  const parsed = Number(normalized);
  // Dans les deux catalogues, 0 sert aussi de valeur sentinelle pour
  // "non renseigne" ou "prix sur demande". On ne le compare pas.
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function firstMatch(html, pattern) {
  const match = html.match(pattern);
  return match ? decodeEntities(match[1]) : null;
}

function parseAppDetail(html) {
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  let listing = null;
  for (const [, rawJson] of scripts) {
    try {
      const parsed = JSON.parse(rawJson);
      if (parsed?.offers?.price !== undefined) listing = parsed;
    } catch {
      // Un autre bloc JSON-LD peut être partiel ; on continue.
    }
  }

  return {
    reference:
      firstMatch(html, /Réf\.\s*<!-- -->([^<]+)<!-- -->/) ||
      firstMatch(html, /Réf\.\s*([^<"]+)/),
    price: numericValue(listing?.offers?.price),
    bedrooms: numericValue(listing?.numberOfRooms),
    surface: numericValue(listing?.floorSize?.value),
    imageCount: Array.isArray(listing?.image) ? listing.image.length : null,
    title: listing?.name || null,
  };
}

function parseWordpressDetail(html) {
  return {
    reference: firstMatch(html, /ref-numero">([^<]+)</),
    price: numericValue(firstMatch(html, /price-euro">([^<]+)</)),
    bedrooms: numericValue(
      firstMatch(html, /<b>Nombre de chambres\s*:<\/b>\s*([^<]+)/i),
    ),
    surface: numericValue(
      firstMatch(html, /<b>Surface habitable\s*:<\/b>\s*([^<]+)/i),
    ),
    sold: /bien-options[^>]*\bvendu\b/i.test(html),
  };
}

async function mapLimit(rows, limit, mapper) {
  const result = new Array(rows.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < rows.length) {
      const index = nextIndex;
      nextIndex += 1;
      result[index] = await mapper(rows[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, rows.length) }, worker));
  return result;
}

async function main() {
  const [wpResults, app] = await Promise.all([
    Promise.all(WP_TYPES.map(fetchWpType)),
    fetchAppInventory(),
  ]);

  const wpRows = wpResults.flatMap((result) => result.rows);
  const wpBySlug = new Map(wpRows.map((row) => [row.slug, row]));
  const appBySlug = new Map(app.rows.map((row) => [row.slug, row]));

  const exactMatches = app.rows
    .filter((row) => wpBySlug.has(row.slug))
    .map((row) => ({ app: row, wordpress: wpBySlug.get(row.slug) }));
  const onlyInApp = app.rows.filter((row) => !wpBySlug.has(row.slug));
  const onlyInWp = wpRows.filter((row) => !appBySlug.has(row.slug));
  const typeMismatches = exactMatches.filter(
    ({ app: appRow, wordpress }) =>
      wordpress.type !== "programme" && appRow.type !== wordpress.type,
  );

  const wpByTitle = new Map();
  for (const row of wpRows) {
    if (!row.normalizedTitle) continue;
    const existing = wpByTitle.get(row.normalizedTitle) || [];
    existing.push(row);
    wpByTitle.set(row.normalizedTitle, existing);
  }

  const recentWp = wpRows
    .filter((row) => row.modified)
    .sort((a, b) => new Date(b.modified) - new Date(a.modified))
    .slice(0, 50);

  const fieldComparisons = await mapLimit(exactMatches, 6, async (match) => {
    const [appDetail, wpDetail] = await Promise.all([
      fetchText(match.app.url),
      fetchText(match.wordpress.url),
    ]);
    const appFields = parseAppDetail(appDetail.text);
    const wordpressFields = parseWordpressDetail(wpDetail.text);
    const compare = (field) => ({
      app: appFields[field],
      wordpress: wordpressFields[field],
      equal:
        appFields[field] !== null &&
        wordpressFields[field] !== null &&
        String(appFields[field]).toLowerCase() === String(wordpressFields[field]).toLowerCase(),
    });

    return {
      slug: match.app.slug,
      appUrl: match.app.url,
      wordpressUrl: match.wordpress.url,
      reference: compare("reference"),
      price: compare("price"),
      bedrooms: compare("bedrooms"),
      surface: compare("surface"),
      appImageCount: appFields.imageCount,
      wordpressSoldMarker: wordpressFields.sold,
    };
  });

  const fieldStats = Object.fromEntries(
    ["reference", "price", "bedrooms", "surface"].map((field) => {
      const comparable = fieldComparisons.filter(
        (row) => row[field].app !== null && row[field].wordpress !== null,
      );
      const equal = comparable.filter((row) => row[field].equal);
      return [
        field,
        {
          comparable: comparable.length,
          equal: equal.length,
          different: comparable.length - equal.length,
          parityPercent: percentage(equal.length, comparable.length),
        },
      ];
    }),
  );

  const report = {
    generatedAt: new Date().toISOString(),
    scope: {
      wordpress: `${WP_BASE}/wp-json/wp/v2/{vente,location,programme}`,
      app: `${APP_BASE}/sitemap.xml`,
      limitations: [
        "Inventaire public seulement",
        "La disponibilite et les champs metier WordPress ne sont pas exposes dans le resume REST",
        "Les correspondances de ce rapport sont d'abord basees sur le slug exact",
      ],
    },
    counts: {
      wordpress: wpRows.length,
      wordpressByType: Object.fromEntries(wpResults.map((item) => [item.type, item.total])),
      app: app.rows.length,
      exactSlugMatches: exactMatches.length,
      appCoverageOfWordpressPercent: percentage(exactMatches.length, wpRows.length),
      appExactMatchPercent: percentage(exactMatches.length, app.rows.length),
      onlyInApp: onlyInApp.length,
      onlyInWordpress: onlyInWp.length,
      typeMismatches: typeMismatches.length,
      fieldStats,
    },
    exactMatches,
    onlyInApp,
    onlyInWordpress: onlyInWp,
    typeMismatches,
    fieldComparisons,
    recentWordpress: recentWp,
  };

  const markdown = `# Audit de parite des annonces Marrakech Realty

Genere le ${report.generatedAt}.

## Perimetre

- WordPress public : \`${report.scope.wordpress}\`
- Nouvelle plateforme : \`${report.scope.app}\`
- Comparaison principale : slugs publics exacts et famille vente/location
- Non couvert a ce stade : donnees privees, brouillons, mandats, disponibilite reelle et outil de multidiffusion eventuel

## Resultats d'inventaire

| Mesure | Valeur |
|---|---:|
| WordPress — ventes | ${report.counts.wordpressByType.vente ?? 0} |
| WordPress — locations | ${report.counts.wordpressByType.location ?? 0} |
| WordPress — programmes | ${report.counts.wordpressByType.programme ?? 0} |
| Total WordPress public | ${report.counts.wordpress} |
| Fiches de la nouvelle plateforme | ${report.counts.app} |
| Correspondances exactes par slug | ${report.counts.exactSlugMatches} |
| Part du nouveau catalogue retrouvee exactement dans WordPress | ${report.counts.appExactMatchPercent}% |
| Couverture brute du WordPress par le nouveau catalogue | ${report.counts.appCoverageOfWordpressPercent}% |
| Fiches uniquement dans la nouvelle plateforme | ${report.counts.onlyInApp} |
| Fiches uniquement dans WordPress | ${report.counts.onlyInWordpress} |
| Incoherences vente/location sur slug identique | ${report.counts.typeMismatches} |

## Parite des champs sur les ${exactMatches.length} slugs communs

| Champ | Comparables | Identiques | Differents | Parite |
|---|---:|---:|---:|---:|
| Reference | ${fieldStats.reference.comparable} | ${fieldStats.reference.equal} | ${fieldStats.reference.different} | ${fieldStats.reference.parityPercent}% |
| Prix EUR | ${fieldStats.price.comparable} | ${fieldStats.price.equal} | ${fieldStats.price.different} | ${fieldStats.price.parityPercent}% |
| Chambres | ${fieldStats.bedrooms.comparable} | ${fieldStats.bedrooms.equal} | ${fieldStats.bedrooms.different} | ${fieldStats.bedrooms.parityPercent}% |
| Surface habitable | ${fieldStats.surface.comparable} | ${fieldStats.surface.equal} | ${fieldStats.surface.different} | ${fieldStats.surface.parityPercent}% |

Ces taux portent uniquement sur les champs publiquement extractibles et les slugs strictement communs. Ils ne remplacent pas un export de production.

### Exemples d'ecarts de prix

${sample(fieldComparisons.filter((row) => row.price.app !== null && !row.price.equal), 20)
  .map((row) => `- [${row.slug}](${row.appUrl}) — app : ${row.price.app} EUR ; WordPress : ${row.price.wordpress} EUR`)
  .join("\n") || "- Aucun ecart comparable"}

## Conclusion provisoire

La parite de migration n'est pas encore demontree. Les deux inventaires n'ont pas le meme volume et une partie des differences peut provenir d'archives, de biens vendus/loues encore publies, de changements de slug ou d'ajouts recents. La prochaine etape est une comparaison metier par reference, statut, prix, champs et medias avec un export source de verite fourni par Marrakech Realty.

## Exemples recents absents ou presents a verifier

${sample(recentWp)
  .map((row) => `- ${row.modified} — [${row.title}](${row.url}) — \`${row.slug}\``)
  .join("\n")}

## Exemples uniquement dans la nouvelle plateforme

${sample(onlyInApp)
  .map((row) => `- [${row.slug}](${row.url})`)
  .join("\n") || "- Aucun"}

## Exemples uniquement dans WordPress

${sample(onlyInWp)
  .map((row) => `- [${row.title}](${row.url}) — modifie le ${row.modified}`)
  .join("\n") || "- Aucun"}
`;

  await writeFile(JSON_OUTPUT, JSON.stringify(report, null, 2));
  await writeFile(MD_OUTPUT, markdown);
  console.log(JSON.stringify(report.counts, null, 2));
  console.log(`\nRapports :\n- ${MD_OUTPUT}\n- ${JSON_OUTPUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
