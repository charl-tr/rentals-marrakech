import { createClient } from '@supabase/supabase-js';
import { writeFile, mkdir } from 'node:fs/promises';
import { sourceAttributes } from './lib/source-attributes.mjs';
import { decodeHTML } from 'entities';
import { isBoilerplateSummary, propertySummary } from '../src/lib/imported-property-text.mjs';

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const write = process.argv.includes('--write');
const rows = [];
for (let start = 0;; start += 500) {
  const { data, error } = await db.from('properties').select('slug,source_url,reference,updated_at,price_eur,price_mad,surface,land_surface,bedrooms,bathrooms,title,description,short_description').order('slug').range(start, start + 499);
  if (error) throw Error(error.message);
  rows.push(...data);
  if (data.length < 500) break;
}
const report = { time: new Date().toISOString(), total: rows.length, write, changes: [], conflicts: [], failures: [], applied: 0 };
let cursor = 0;
await Promise.all(Array.from({ length: 4 }, async () => {
  while (cursor < rows.length) {
    const row = rows[cursor++];
    if (!row.source_url || new URL(row.source_url).hostname !== 'www.marrakechrealty.com') continue;
    try {
      const response = await fetch(row.source_url, { signal: AbortSignal.timeout(25000) });
      if (!response.ok) throw Error(`HTTP ${response.status}`);
      const html = await response.text();
      const ref = html.match(/class=["'][^"']*ref-numero[^"']*["'][^>]*>([^<]+)/i)?.[1]?.trim();
      if (!ref || decodeHTML(ref) !== row.reference) throw Error('Source reference mismatch');
      const attributes = sourceAttributes(html);
      const patch = {};
      for (const [key, value] of Object.entries(attributes)) {
        if (value == null || value === row[key]) continue;
        if (row[key] == null || (key.startsWith('price_') && row[key] === 0)) patch[key] = value;
        else report.conflicts.push({ slug: row.slug, field: key, current: row[key], source: value });
      }
      for (const key of ['title', 'description', 'short_description']) {
        if (row[key] && /&(?:#\d+|#x[\da-f]+|[a-z]+);/i.test(row[key])) {
          const decoded = decodeHTML(row[key]);
          if (decoded !== row[key]) patch[key] = decoded;
        }
      }
      if (isBoilerplateSummary(row.short_description) && row.description && !isBoilerplateSummary(row.description)) {
        patch.short_description = propertySummary('', decodeHTML(row.description));
      }
      if (Object.keys(patch).length) report.changes.push({ slug: row.slug, expected: row.updated_at, before: Object.fromEntries(Object.keys(patch).map(k => [k, row[k]])), patch });
    } catch (error) { report.failures.push({ slug: row.slug, error: String(error) }); }
    if (cursor % 100 === 0) console.log(`Checked ~${cursor}/${rows.length}`);
  }
}));
const dir = '/tmp/marrakech-source-repair';
await mkdir(dir, { recursive: true, mode: 0o700 });
const path = `${dir}/${Date.now()}.json`;
// Durable before-image before the first mutation, no image/status/URL changes.
await writeFile(path, JSON.stringify(report, null, 2), { mode: 0o600 });
if (write) for (const item of report.changes) {
  const { data, error } = await db.from('properties').update({ ...item.patch, updated_at: new Date().toISOString() }).eq('slug', item.slug).eq('updated_at', item.expected).select('slug');
  if (error || !data?.length) report.failures.push({ slug: item.slug, error: error?.message || 'Concurrent edit; skipped' });
  else report.applied++;
}
await writeFile(path, JSON.stringify(report, null, 2), { mode: 0o600 });
console.log(JSON.stringify({ path, total: rows.length, changes: report.changes.length, applied: report.applied, fields: Object.fromEntries([...new Set(report.changes.flatMap(c => Object.keys(c.patch)))].map(k => [k, report.changes.filter(c => k in c.patch).length])), conflicts: report.conflicts.length, failures: report.failures }, null, 2));
