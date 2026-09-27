export const MAX_PROPERTY_IMAGES = 100;
export const MAX_SOURCE_IMAGE_BYTES = 20 * 1024 * 1024;
export const MAX_UPLOAD_IMAGE_BYTES = 3 * 1024 * 1024;
export const PROPERTY_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function isExternalPropertyImage(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "www.marrakechrealty.com" && !url.port && !url.username && !url.password && url.pathname.startsWith("/wp-content/uploads/");
  } catch { return false; }
}

export function movePropertyImage(images: string[], from: number, to: number): string[] {
  if (from < 0 || to < 0 || from >= images.length || to >= images.length || from === to) return images;
  const next = [...images];
  const [image] = next.splice(from, 1);
  next.splice(to, 0, image);
  return next;
}

export function formatPropertyUpdatedAt(value?: string): string | null {
  if (!value || Number.isNaN(Date.parse(value))) return null;
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Casablanca" }).format(new Date(value));
}
