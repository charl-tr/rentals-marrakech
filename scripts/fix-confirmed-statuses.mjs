import {createClient} from '@supabase/supabase-js';
import {readFile,writeFile} from 'node:fs/promises';
import {classText} from './lib/source-attributes.mjs';
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
const audit=JSON.parse(await readFile('../../outputs/catalogue-status-crosscheck-2026-09-27.json','utf8'));
const targets=audit.differences.filter(r=>['sold','rented'].includes(r.database)&&r.source==='available');
const changes=[],skipped=[],cache=new Map();
async function html(url){if(!cache.has(url))cache.set(url,fetch(url,{signal:AbortSignal.timeout(25000)}).then(async r=>{if(!r.ok)throw Error(`HTTP ${r.status}`);return r.text();}));return cache.get(url);}
for(const target of targets){
 const{data:row,error}=await db.from('properties').select('slug,reference,status,source_url,updated_at').eq('slug',target.slug).single();if(error)throw Error(error.message);
 const page=await html(target.evidence.page);
 const card=[...page.matchAll(/<article\b[\s\S]*?<\/article>/g)].find(m=>classText(m[0],'right_car')===row.reference&&m[0].includes(row.source_url));
 const detail=await html(row.source_url);
 if(row.status!==target.database || !card || classText(card[0],'bien-options')?.trim() || classText(detail,'bien-options')?.trim() || classText(detail,'ref-numero')!==row.reference){skipped.push(target.reference);continue;}
 changes.push(row);
}
const backup=`/tmp/marrakech-status-before-${Date.now()}.json`;
await writeFile(backup,JSON.stringify({changes,skipped},null,2),{mode:0o600});
let updated=0;
for(const row of changes){const{data,error}=await db.from('properties').update({status:'available',updated_at:new Date().toISOString()}).eq('slug',row.slug).eq('status',row.status).eq('updated_at',row.updated_at).select('slug');if(error||!data?.length)throw Error(error?.message||'Concurrent edit');updated++;}
const{data:after,error}=await db.from('properties').select('slug,status').in('slug',changes.map(r=>r.slug));if(error)throw Error(error.message);
if(after.length!==changes.length || after.some(r=>r.status!=='available'))throw Error('Readback mismatch');
console.log({targets:targets.length,updated,skipped,verified:after.length,backup});
