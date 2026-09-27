import {createClient} from '@supabase/supabase-js';
import {writeFile} from 'node:fs/promises';
import {classText} from './lib/source-attributes.mjs';
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
const write=process.argv.includes('--write');
const source=new Map();
for(const path of ['/vente-riad-a-renover/','/vente-riad-a-renover/page/2/']) {
 const response=await fetch('https://www.marrakechrealty.com'+path);if(!response.ok)throw Error('Source unavailable');
 for(const match of (await response.text()).matchAll(/<article\b[\s\S]*?<\/article>/g)) {
  const url=match[0].match(/href="(https:\/\/www.marrakechrealty.com\/vente\/[^\"]+)"/)?.[1];if(!url)continue;
  const badge=classText(match[0],'bien-options')||'';
  source.set(url,{reference:classText(match[0],'right_car'),status:/vendu/i.test(badge)?'sold':/compromis|réserv/i.test(badge)?'reserved':/new|nouveau/i.test(badge)?'new':'available'});
 }
}
const{data:rows,error}=await db.from('properties').select('slug,reference,type,status,source_type_label,source_url,updated_at,published,city').or('type.eq.riad-a-renover,source_type_label.ilike.%rénover%');if(error)throw Error(error.message);
const changes=[];
for(const row of rows) {
 const entry=source.get(row.source_url),patch={};
 if(entry){if(entry.reference!==row.reference)throw Error('Reference mismatch '+row.slug);patch.type='riad-a-renover';patch.status=entry.status;}
 else {
  if(!row.source_url || new URL(row.source_url).hostname!=='www.marrakechrealty.com')continue;
  const response=await fetch(row.source_url);if(!response.ok)continue;const html=await response.text();
  if(classText(html,'ref-numero')!==row.reference)continue;
  const label=classText(html,'capitalize-letter')||'';
  if(/riad.*à rénover/i.test(label))patch.type='riad-a-renover';
  else if(/commerce/i.test(label))patch.type='autre';
 }
 for(const key of Object.keys(patch))if(patch[key]===row[key])delete patch[key];
 if(Object.keys(patch).length)changes.push({before:row,patch});
}
const expected=[...source.values()].filter(s=>['new','available','reserved'].includes(s.status)).map(s=>s.reference).sort();
const backup=`/tmp/renovation-reconcile-${Date.now()}.json`;
await writeFile(backup,JSON.stringify({expected,changes},null,2),{mode:0o600});
if(write)for(const{before,patch}of changes){const{data,error}=await db.from('properties').update({...patch,updated_at:new Date().toISOString()}).eq('slug',before.slug).eq('updated_at',before.updated_at).select('slug');if(error||!data?.length)throw Error(error?.message||'Concurrent edit');}
const{data:actual,error:checkError}=await db.from('properties').select('reference,city').eq('published',true).eq('listing','vente').eq('type','riad-a-renover').in('status',['new','available','reserved']);if(checkError)throw Error(checkError.message);
console.log({write,sourceCount:source.size,expected,changes:changes.length,actual,backup});
if(write && JSON.stringify(actual.filter(r=>r.city==='Marrakech').map(r=>r.reference).sort())!==JSON.stringify(expected))throw Error('Marrakech reconciliation not exact');
