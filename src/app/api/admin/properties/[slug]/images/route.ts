import { getAdminSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isExternalPropertyImage, MAX_UPLOAD_IMAGE_BYTES, MAX_SOURCE_IMAGE_BYTES, PROPERTY_IMAGE_TYPES } from "@/lib/property-media";
import { preparePropertyImage, readBoundedBody } from "@/lib/property-media-processing";

export const runtime = "nodejs";
export const maxDuration = 30;

const reply = (body: object, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  // Cookie-authenticated writes require a same-origin browser request (CSRF).
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) return reply({ error: "Origine de la requête refusée." }, 403);
  const session = await getAdminSession();
  if (!session) return reply({ error: "Session expirée. Reconnectez-vous avant d’ajouter des photos." }, 401);
  if (session.role !== "director") return reply({ error: "Modification des photos réservée au directeur." }, 403);
  const { slug } = await context.params;
  if (!/^[a-z0-9-]{1,250}$/.test(slug)) return reply({ error: "Bien invalide." }, 400);
  const { data: property, error } = await supabaseAdmin.from("properties").select("slug,images").eq("slug", slug).maybeSingle();
  if (error) return reply({ error: "Impossible de vérifier la fiche. Réessayez." }, 503);
  if (!property) return reply({ error: "Bien introuvable." }, 404);

  let image: Buffer;
  try {
    const contentType = request.headers.get("content-type") ?? "";
    let source: Buffer;
    if (contentType.startsWith("application/json")) {
      const body = await readBoundedBody(request.body, 4096);
      const { sourceUrl } = JSON.parse(body.toString("utf8"));
      if (typeof sourceUrl !== "string" || !isExternalPropertyImage(sourceUrl) || !property.images?.includes(sourceUrl)) {
        return reply({ error: "Seules les photos externes déjà présentes sur cette fiche peuvent être importées." }, 400);
      }
      // Fixed host/path, no redirects: never accept arbitrary server-side fetch URLs.
      const remote = await fetch(sourceUrl, { redirect: "error", signal: AbortSignal.timeout(15000), cache: "no-store" });
      if (!remote.ok) return reply({ error: "L’ancien site ne fournit plus cette photo. Ajoutez le fichier depuis votre ordinateur." }, 422);
      source = await readBoundedBody(remote.body, MAX_SOURCE_IMAGE_BYTES);
    } else if (contentType.startsWith("multipart/form-data")) {
      const body = await readBoundedBody(request.body, MAX_UPLOAD_IMAGE_BYTES + 65536);
      const form = await new Response(new Uint8Array(body), { headers: { "Content-Type": contentType } }).formData();
      const file = form.get("file");
      if (!(file instanceof File) || !file.size || file.size > MAX_UPLOAD_IMAGE_BYTES || !PROPERTY_IMAGE_TYPES.includes(file.type)) {
        return reply({ error: "Photo invalide. Ajoutez un fichier JPG, PNG ou WebP." }, 400);
      }
      source = Buffer.from(await file.arrayBuffer());
    } else return reply({ error: "Format de requête invalide." }, 415);
    image = await preparePropertyImage(source);
  } catch {
    return reply({ error: "Photo illisible, trop volumineuse ou téléchargement interrompu. Essayez un JPG, PNG ou WebP de moins de 20 Mo." }, 422);
  }

  const path = `admin/${slug}/${crypto.randomUUID()}.webp`;
  const { error: storageError } = await supabaseAdmin.storage.from("properties").upload(path, image, { contentType: "image/webp", cacheControl: "31536000", upsert: false });
  if (storageError) return reply({ error: "Le stockage des photos est indisponible ou plein. La galerie existante n’a pas été modifiée." }, 503);
  const { data } = supabaseAdmin.storage.from("properties").getPublicUrl(path);
  // Upload only. Attaching/reordering is saved atomically with the property editor.
  return reply({ url: data.publicUrl, bytes: image.length });
}
