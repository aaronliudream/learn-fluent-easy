/** 只读:独立写作页范文词数 vs 要求。跑完即删。 */
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
const env = Object.fromEntries(readFileSync('.env','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);
// 探测可能的表
for(const t of ['junior_writing_prompts','writing_prompts','junior_writing']){
  const { data, error } = await sb.from(t).select('*').limit(1);
  if(error){ console.log(`表 ${t}: ✗ ${error.message}`); continue; }
  console.log(`\n表 ${t}: ✓ 列名:`, Object.keys(data[0]||{}).join(', '));
}
// 详查 junior_writing_prompts
const { data, error } = await sb.from('junior_writing_prompts').select('*');
if(error){ console.log('detail err', error.message); process.exit(0); }
console.log('\n总条数:', data.length);
const wc=s=>(String(s||'').trim().match(/[A-Za-z][A-Za-z'-]*/g)||[]).length;
// 找词数限制字段
console.log('字段样本:', JSON.stringify(data[0],null,2).slice(0,600));
console.log('\n=== 各篇:标题|要求min-max|范文词数|超? ===');
for(const r of data){
  const ans=r.sample_answer ?? r.model_answer ?? r.sample ?? r.answer ?? '';
  const n=wc(ans);
  const min=r.min_words ?? r.word_min ?? r.minWords ?? null;
  const max=r.max_words ?? r.word_max ?? r.maxWords ?? null;
  const title=r.title ?? r.topic ?? r.prompt?.slice(0,30) ?? r.id;
  const over = max!=null && n>max ? `超${n-max}` : '达标';
  console.log(`  [${over}] ${n}词 (要求${min ?? '?'}-${max ?? '?'}) | ${title}`);
}
