export function normalizePropertySearch(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr").replace(/[^a-z0-9]+/g, " ").trim();
}

export function matchesPropertySearch(query: string, fields: (string | undefined)[]) {
  const tokens = normalizePropertySearch(query).split(/\s+/).filter(Boolean);
  const haystack = normalizePropertySearch(fields.filter(Boolean).join(" "));
  return tokens.every((token) => haystack.includes(token));
}
