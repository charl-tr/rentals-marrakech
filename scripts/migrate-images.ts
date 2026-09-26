/**
 * Migre les images des biens (MR) vers Supabase Storage.
 *
 * Pour chaque property :
 *   1. download chaque image externe
 *   2. upload dans le bucket `properties` à `{slug}/{idx}.{ext}`
 *   3. update la colonne `images` avec les URLs Supabase publiques
 *
 * Idempotent : skip les images déjà en Storage (par checksum sur le path).
 * Peut être interrompu et relancé.
 *
 * Modes :
 *   --strategy=all        migre toutes les images de tous les biens
 *   --strategy=immersive  migre la couverture de chaque bien actif et la
 *                         galerie complète d'un bien "hero" par catégorie
 *
 * Run : npx tsx scripts/migrate-images.ts --strategy=immersive [--limit=20]
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!url || !serviceKey) {
  console.error("Manquant : credentials Supabase");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const BUCKET = "properties";
const LIMIT = Number(
  process.argv.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? 0
);
const STRATEGY =
  process.argv.find((a) => a.startsWith("--strategy="))?.split("=")[1] ??
  "all";
const ACTIVE_STATUSES = ["available", "new", "reserved"];

// ──────────────────────────────────────────────────────────────────────
// 1. Bucket creation
// ──────────────────────────────────────────────────────────────────────
async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (buckets?.some((b) => b.name === BUCKET)) {
    console.log(`  ✓ Bucket "${BUCKET}" existe`);
    return;
  }
  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024, // 10MB par image max
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  });
  if (error) throw error;
  console.log(`  ✓ Bucket "${BUCKET}" créé (public)`);
}

// ──────────────────────────────────────────────────────────────────────
// 2. Upload helper
// ──────────────────────────────────────────────────────────────────────
function extractExt(url: string): string {
  const clean = url.split("?")[0].split("#")[0];
  const match = clean.match(/\.(jpg|jpeg|png|webp|gif)$/i);
  return match ? match[1].toLowerCase() : "jpg";
}

function extractContentType(ext: string): string {
  return (
    {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      gif: "image/gif",
    }[ext] ?? "image/jpeg"
  );
}

function storageSegment(slug: string): string {
  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {
    // Un slug mal encodé reste exploitable après la normalisation ci-dessous.
  }
  return decoded
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

async function uploadImage(
  slug: string,
  idx: number,
  remoteUrl: string
): Promise<string | null> {
  const ext = extractExt(remoteUrl);
  const folder = storageSegment(slug);
  const path = `${folder}/${idx}.${ext}`;

  // Skip si déjà uploadé
  const { data: existing } = await supabase.storage
    .from(BUCKET)
    .list(folder, { search: `${idx}.${ext}` });
  if (existing?.some((f) => f.name === `${idx}.${ext}`)) {
    return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  // Download
  const res = await fetch(remoteUrl, {
    headers: { "User-Agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(20000),
  }).catch(() => null);
  if (!res || !res.ok) {
    console.log(`    ✗ fetch ${res?.status ?? "nil"} ${remoteUrl.slice(-80)}`);
    return null;
  }
  const blob = await res.arrayBuffer();

  // Upload
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: extractContentType(ext),
    upsert: false,
  });
  if (error && !error.message.includes("already exists")) {
    console.log(`    ✗ upload ${error.message}`);
    return null;
  }
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

// ──────────────────────────────────────────────────────────────────────
// 3. Main
// ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n═══ MIGRATE IMAGES → SUPABASE STORAGE ═══════════════════════\n");
  await ensureBucket();

  let propertiesQuery = supabase
    .from("properties")
    .select("slug, images, type, listing, status, published, featured")
    .order("featured", { ascending: false });

  if (STRATEGY === "immersive") {
    propertiesQuery = propertiesQuery
      .eq("published", true)
      .in("status", ACTIVE_STATUSES);
  }

  const { data: props, error } = await propertiesQuery;
  if (error) throw error;
  if (!props) return;

  const supabasePrefix = `${url}/storage/v1/object/public/${BUCKET}/`;

  // En mode immersif, le bien disposant de la galerie la plus riche dans
  // chaque catégorie devient le "hero" de démonstration. En cas d'égalité,
  // on conserve en priorité la galerie déjà migrée, puis l'ordre lexical :
  // le choix reste ainsi stable entre deux exécutions.
  const heroByType = new Map<string, (typeof props)[number]>();
  if (STRATEGY === "immersive") {
    for (const property of props) {
      const current = heroByType.get(property.type);
      const imageCount = (property.images as string[] | null)?.length ?? 0;
      const currentImageCount =
        (current?.images as string[] | null)?.length ?? 0;
      const migratedCount = ((property.images as string[] | null) ?? []).filter(
        (image) => image.startsWith(supabasePrefix)
      ).length;
      const currentMigratedCount = (
        (current?.images as string[] | null) ?? []
      ).filter((image) => image.startsWith(supabasePrefix)).length;
      if (
        !current ||
        imageCount > currentImageCount ||
        (imageCount === currentImageCount &&
          (migratedCount > currentMigratedCount ||
            (migratedCount === currentMigratedCount &&
              property.slug.localeCompare(current.slug) < 0)))
      ) {
        heroByType.set(property.type, property);
      }
    }
  }
  const heroSlugs = new Set(
    [...heroByType.values()].map((property) => property.slug)
  );

  // Skip les propriétés dont les images ciblées sont déjà en Supabase.
  const selectedIndexes = (property: (typeof props)[number]) => {
    const images = (property.images as string[] | null) ?? [];
    if (STRATEGY !== "immersive" || heroSlugs.has(property.slug)) {
      return images.map((_, index) => index);
    }
    return images.length > 0 ? [0] : [];
  };
  const needMigration = props.filter((property) => {
    const images = (property.images as string[] | null) ?? [];
    return selectedIndexes(property).some(
      (index) => !images[index]?.startsWith(supabasePrefix)
    );
  });

  console.log(
    `\nStratégie : ${STRATEGY}\n` +
      `${props.length} biens ciblés, ${needMigration.length} à migrer\n` +
      (STRATEGY === "immersive"
        ? `${heroSlugs.size} galeries hero complètes : ${[...heroSlugs].join(", ")}\n`
        : "")
  );

  const toProcess = LIMIT > 0 ? needMigration.slice(0, LIMIT) : needMigration;
  let okCount = 0;
  let failCount = 0;
  let imgUploaded = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const p = toProcess[i];
    const images = (p.images as string[]) ?? [];
    console.log(
      `[${i + 1}/${toProcess.length}] ${p.slug.slice(0, 70)} (${images.length} images)`
    );

    const newUrls = [...images];
    const indexes = selectedIndexes(p);
    for (const idx of indexes) {
      const src = images[idx];
      if (src.startsWith(supabasePrefix)) {
        continue;
      }
      const newUrl = await uploadImage(p.slug, idx, src);
      if (newUrl) {
        newUrls[idx] = newUrl;
        imgUploaded++;
      } else {
        // Fallback : l'URL d'origine reste en place si le download échoue.
        failCount++;
      }
    }

    // Update DB
    const { error: updErr } = await supabase
      .from("properties")
      .update({ images: newUrls })
      .eq("slug", p.slug);
    if (updErr) {
      console.log(`    ✗ update DB : ${updErr.message}`);
    } else {
      okCount++;
    }
  }

  console.log(
    `\n═══ DONE ═══════════════════════════════════════════════════════`
  );
  console.log(`${okCount}/${toProcess.length} biens migrés`);
  console.log(`${imgUploaded} images uploadées, ${failCount} failed\n`);
}

main().catch((e) => {
  console.error("\n✗ FATAL:", e);
  process.exit(1);
});
