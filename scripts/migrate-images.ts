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
 * Run : npx tsx scripts/migrate-images.ts [--limit=20]
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

async function uploadImage(
  slug: string,
  idx: number,
  remoteUrl: string
): Promise<string | null> {
  const ext = extractExt(remoteUrl);
  const path = `${slug}/${idx}.${ext}`;

  // Skip si déjà uploadé
  const { data: existing } = await supabase.storage
    .from(BUCKET)
    .list(slug, { search: `${idx}.${ext}` });
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

  const { data: props, error } = await supabase
    .from("properties")
    .select("slug, images")
    .order("featured", { ascending: false });
  if (error) throw error;
  if (!props) return;

  // Skip les propriétés dont toutes les images sont déjà en Supabase
  const supabasePrefix = `${url}/storage/v1/object/public/${BUCKET}/`;
  const needMigration = props.filter(
    (p) =>
      (p.images as string[])?.length > 0 &&
      !(p.images as string[]).every((i) => i.startsWith(supabasePrefix))
  );

  console.log(
    `\n${props.length} biens total, ${needMigration.length} à migrer\n`
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

    const newUrls: string[] = [];
    for (let idx = 0; idx < images.length; idx++) {
      const src = images[idx];
      if (src.startsWith(supabasePrefix)) {
        newUrls.push(src); // déjà migré
        continue;
      }
      const newUrl = await uploadImage(p.slug, idx, src);
      if (newUrl) {
        newUrls.push(newUrl);
        imgUploaded++;
      } else {
        // Fallback : garder l'URL d'origine si le download a échoué
        newUrls.push(src);
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
