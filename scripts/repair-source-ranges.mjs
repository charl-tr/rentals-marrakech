import { createClient } from '@supabase/supabase-js';
import { readFile, writeFile } from 'node:fs/promises';
import { classText } from './lib/source-attributes.mjs';
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const audit = JSON.parse(await readFile(process.argv[2], 'utf8'));
const changes = [];
for (const slug of new Set(audit.conflicts.filter(c => c.field === 'price_eur').map(c => c.slug))) {
  const { data: row, error } = await db.from('properties').select('slug,reference,source_url,price_eur,price_mad,price_unit,source_payload,updated_at').eq('slug', slug).single();
  if (error) throw Error(error.message);
  const response = await fetch(row.source_url, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw Error(`HTTP ${response.status}`);
  const html = await response.text();
  const eur = classText(html, 'price-euro'), mad = classText(html, 'price-mad');
  if (classText(html, 'ref-numero') !== row.reference || !eur || !/\d\s*[\/_–—-]\s*\d/.test(eur) || row.price_eur !== Number(eur.replace(/\D/g,''))) throw Error(`Unconfirmed range: ${slug}`);
  changes.push({ before: row, patch: { price_eur: 0, price_mad: null, price_unit: null, source_payload: { ...row.source_payload, originalPriceEur: eur, originalPriceMad: mad, priceRequiresRangeSupport: true } } });
}
const path = `/tmp/marrakech-source-repair/ranges-${Date.now()}.json`;
await writeFile(path, JSON.stringify(changes,null,2), { mode:0o600 });
for (const {before,patch} of changes) {
  const {data,error} = await db.from('properties').update({...patch,updated_at:new Date().toISOString()}).eq('slug',before.slug).eq('updated_at',before.updated_at).select('slug');
  if(error || !data?.length) throw Error(error?.message || 'Concurrent edit');
}
console.log({ corrected: changes.length, backup: path });
