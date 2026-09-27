import { cleanImportedHtml } from '../../src/lib/imported-property-text.mjs';

// WordPress prices contain nested spans: stop only at the matching outer tag.
export function classText(html, className) {
  const start = new RegExp(`<([a-z][a-z0-9]*)\\b[^>]*class=["'][^"']*\\b${className}\\b[^"']*["'][^>]*>`, 'i').exec(html);
  if (!start) return null;
  const tail = html.slice(start.index + start[0].length);
  const tags = new RegExp(`<(/?)${start[1]}\\b[^>]*>`, 'gi');
  let depth = 1;
  for (const tag of tail.matchAll(tags)) {
    depth += tag[1] ? -1 : 1;
    if (!depth) return cleanImportedHtml(tail.slice(0, tag.index));
  }
  return null;
}

export function sourceNumber(value) {
  if (!value) return null;
  // A seasonal price range is not a scalar amount; never concatenate its digits.
  if (/\d\s*(?:\/|–|—|-|_)\s*\d/.test(value)) return null;
  const match = value.replace(/[\s\u00a0\u202f]/g, '').match(/^(\d+(?:[.,]\d+)?)/);
  return match ? Number(match[1].replace(',', '.')) : null;
}

export function sourceAttributes(html) {
  const rows = new Map();
  const detail = html.match(/<ul\b[^>]*class=["'][^"']*\blist-car\s+fiche\b[^"']*["'][^>]*>([\s\S]*?)<\/ul>/i)?.[1] || '';
  for (const row of detail.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)) {
    const label = classText(row[1], 'left_car');
    if (label) rows.set(label.toLowerCase().trim(), classText(row[1], 'right_car'));
  }
  const field = (...labels) => {
    for (const label of labels) if (rows.has(label)) return sourceNumber(rows.get(label));
    return null;
  };
  return {
    price_eur: sourceNumber(classText(html, 'price-euro')),
    price_mad: sourceNumber(classText(html, 'price-mad')),
    bedrooms: field('chambres', 'nombre de chambres'),
    bathrooms: field('salles de bains', 'salles de bain', 'salle de bains', 'salle de bain'),
    surface: field('surface habitable'),
    land_surface: field('surface terrain'),
  };
}
