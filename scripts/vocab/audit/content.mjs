/* 第三节:内容质量机器扫描 —— 只出清单不改 */
import { loadEnv } from '../env.mjs';
const env = loadEnv(process.cwd(), { quiet: true });
const U = env.VITE_SUPABASE_URL, K = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const H = { apikey:K, Authorization:`Bearer ${K}` };
const all = async (t, sel) => { const o=[]; for(let f=0;;f+=1000){
  const r=await fetch(`${U}/rest/v1/${t}?select=${sel}&limit=1000&offset=${f}`,{headers:H});
  const c=await r.json(); if(!Array.isArray(c))return o; o.push(...c); if(c.length<1000)break; } return o; };

/* ① 冠词错配:按读音判 */
const A_EXCEPT=/^(uni|use|user|usu|eu|one|once|ubiq|ukul|euro|util)/i;
const AN_EXCEPT=/^(hour|honest|honor|heir|honou)/i;
function badArticles(text){
  const out=[]; const re=/\b(an?)\s+([A-Za-z][A-Za-z-]*)/g; let m;
  while((m=re.exec(text||''))){
    const art=m[1].toLowerCase(), w=m[2];
    const vowel=(/^[aeiou]/i.test(w) && !A_EXCEPT.test(w)) || AN_EXCEPT.test(w);
    if(art==='a'&&vowel) out.push(`a ${w}`);
    if(art==='an'&&!vowel) out.push(`an ${w}`);
  } return out;
}
/* ② 英式表达 */
const BRIT=[['\bflat\b','flat(公寓)'],['\bqueue','queue'],['\bneighbour','neighbour'],
  ['\bcolour','colour'],['\borganise','organise'],['\bwhilst\b','whilst'],['\bCV\b','CV'],
  ['past papers','past papers'],['sit the exam','sit the exam'],['green channel','green channel'],
  ['\bfavourite','favourite'],['\brealise','realise'],['\bcentre\b','centre'],['\blorry\b','lorry'],
  ['\bpetrol\b','petrol'],['\bautumn\b','autumn'],['\bmobile phone','mobile phone'],['\brubbish\b','rubbish']];
const britRe = BRIT.map(([p,l])=>[new RegExp(p,'i'),l]);
function britHits(t){ return britRe.filter(([r])=>r.test(t||'')).map(([,l])=>l); }
/* ④ 占位 */
const PLACEHOLDER=/^(TODO|待补充|待定|—|-|\.|。|\s)*$/;

const SRC = [
  ['vocab_words.def_en','vocab_words','id,headword,def_en','def_en'],
  ['vocab_examples.sentence','vocab_examples','id,sentence','sentence'],
  ['vocab_collocations.collocation','vocab_collocations','id,collocation','collocation'],
  ['vocab_chunks.example_en','vocab_chunks','id,chunk,example_en','example_en'],
  ['vocab_chunks.literal_trap','vocab_chunks','id,chunk,literal_trap','literal_trap'],
  ['vocab_cn_renditions.rendition','vocab_cn_renditions','id,rendition','rendition'],
  ['vocab_cn_renditions.example_en','vocab_cn_renditions','id,example_en','example_en'],
  ['vocab_scene_packs.essay_short_en','vocab_scene_packs','id,title_zh,essay_short_en','essay_short_en'],
  ['vocab_scene_packs.essay_full_en','vocab_scene_packs','id,title_zh,essay_full_en','essay_full_en'],
  ['vocab_scene_items.text_en','vocab_scene_items','id,text_en','text_en'],
];
const art=[], brit=[], place=[];
for (const [label, table, sel, field] of SRC) {
  const rows = await all(table, sel);
  for (const r of rows) {
    const t = r[field]; if (t == null) continue;
    const a = badArticles(t); if (a.length) art.push(`${label} [${r.headword||r.chunk||r.title_zh||r.id.slice(0,8)}] ${a.join(' / ')}`);
    const b = britHits(t); if (b.length) brit.push(`${label} [${r.headword||r.chunk||r.title_zh||r.id.slice(0,8)}] ${b.join(',')} :: ${String(t).slice(0,70)}`);
    if (String(t).trim() && PLACEHOLDER.test(String(t))) place.push(`${label} ${r.id}`);
  }
}
console.log(`### ① 冠词错配 ${art.length} 处`); art.slice(0,25).forEach(x=>console.log('  '+x));
console.log(`\n### ② 英式表达 ${brit.length} 处`); brit.slice(0,25).forEach(x=>console.log('  '+x));
console.log(`\n### ④ 占位/空白 ${place.length} 处`); place.slice(0,10).forEach(x=>console.log('  '+x));

/* ⑤ 表内完全重复 */
console.log('\n### ⑤ 重复');
for (const [label, table, sel, field] of SRC) {
  const rows = await all(table, sel);
  const seen=new Map();
  for (const r of rows){ const t=(r[field]||'').trim(); if(!t)continue; seen.set(t,(seen.get(t)||0)+1); }
  const dup=[...seen.entries()].filter(([,n])=>n>1);
  if (dup.length) console.log(`  ${label}: ${dup.length} 组重复,例:${dup.slice(0,3).map(([t,n])=>`"${t.slice(0,42)}"×${n}`).join(' | ')}`);
}
