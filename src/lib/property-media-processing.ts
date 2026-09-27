import sharp from "sharp";

/** Decode, orient, bound dimensions and re-encode. No original EXIF/GPS is kept. */
export async function preparePropertyImage(bytes: Buffer): Promise<Buffer> {
  const image = sharp(bytes, { limitInputPixels: 40_000_000, failOn: "error" });
  const metadata = await image.metadata();
  if (!metadata.format || !["jpeg", "png", "webp"].includes(metadata.format) || (metadata.pages ?? 1) > 1) {
    throw new Error("Format non pris en charge. Utilisez une photo JPG, PNG ou WebP non animée.");
  }
  if (!metadata.width || !metadata.height || metadata.width < 100 || metadata.height < 100) {
    throw new Error("Cette photo est trop petite (100 × 100 pixels minimum).");
  }
  return image.rotate().resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
}

export async function readBoundedBody(stream: ReadableStream<Uint8Array> | null, limit: number): Promise<Buffer> {
  if (!stream) throw new Error("Fichier vide.");
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); throw new Error("Le fichier dépasse la taille autorisée."); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(chunks);
}
