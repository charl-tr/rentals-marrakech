// Fallback is scoped to the current browser page: private-mode/quota failures
// must not break the interaction. It is deliberately not advertised as durable.
const memory = new Map<string, string[]>();
export function cleanSelection(value: unknown, limit = 100): string[] {
  return Array.isArray(value) ? [...new Set(value.filter((s): s is string => typeof s === "string" && s.length > 0 && s.length <= 300))].slice(0, limit) : [];
}
export function readSelection(key: string, limit = 100): string[] {
  if (typeof window === "undefined") return [];
  if (memory.has(key)) return memory.get(key)!.slice(0, limit);
  try { return cleanSelection(JSON.parse(window.localStorage.getItem(key) ?? "[]"), limit); }
  catch { return []; }
}
export function writeSelection(key: string, values: string[], limit = 100): boolean {
  if (typeof window === "undefined") return false;
  const clean = cleanSelection(values, limit);
  try { window.localStorage.setItem(key, JSON.stringify(clean)); memory.delete(key); return true; }
  catch { memory.set(key, clean); return false; }
}
