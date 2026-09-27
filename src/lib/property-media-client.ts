import { MAX_SOURCE_IMAGE_BYTES, MAX_UPLOAD_IMAGE_BYTES, PROPERTY_IMAGE_TYPES } from "./property-media";

export async function compressPropertyPhoto(file: File): Promise<Blob> {
  if (!PROPERTY_IMAGE_TYPES.includes(file.type)) throw new Error("Format non pris en charge : choisissez JPG, PNG ou WebP. Pour HEIC, exportez d’abord en JPG.");
  if (!file.size || file.size > MAX_SOURCE_IMAGE_BYTES) throw new Error("Chaque photo doit peser moins de 20 Mo.");
  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width * bitmap.height > 40_000_000) throw new Error("Photo trop grande : exportez-la en dessous de 40 mégapixels.");
    const ratio = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * ratio);
    canvas.height = Math.round(bitmap.height * ratio);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Votre navigateur ne peut pas préparer cette photo.");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.86, 0.72, 0.55]) {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
      if (blob && blob.size <= MAX_UPLOAD_IMAGE_BYTES && PROPERTY_IMAGE_TYPES.includes(blob.type)) return blob;
    }
    throw new Error("Photo encore trop lourde après optimisation. Exportez une version plus légère.");
  } finally { bitmap.close(); }
}
