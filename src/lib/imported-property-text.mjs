import { decodeHTML } from "entities";

// Plain text only. Never use this output as trusted HTML.
export function cleanImportedHtml(value = "") {
  return decodeHTML(String(value)
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/\r\n?/g, "\n")
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/(?:p|div|h[1-6]|section|ul|ol)\s*>/gi, "\n\n")
    .replace(/<li\b[^>]*>/gi, "\n• ")
    .replace(/<\/li\s*>/gi, "")
    .replace(/<[^>]+>/g, ""))
    .replace(/[\u00a0\u202f]/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function isBoilerplateSummary(value = "") {
  return /caractéristiques du bien\s*référence|\[read more\]|besoin d['’]information\s*\?\s*contactez-nous/i.test(value);
}

export function propertySummary(summary = "", description = "") {
  const text = isBoilerplateSummary(summary) ? description : summary;
  const flat = String(text || description).replace(/\s+/g, " ").trim();
  if (flat.length <= 240) return flat;
  return flat.slice(0, 237).replace(/\s+\S*$/, "") + "…";
}
