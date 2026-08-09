import { loadEnv } from '../env.mjs';
const env = loadEnv(process.cwd(), { quiet: true });
const U = env.VITE_SUPABASE_URL, K = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const s = await (await fetch(`${U}/auth/v1/token?grant_type=password`,{method:'POST',
  headers:{apikey:K,'Content-Type':'application/json'},
  body:JSON.stringify({email:'cc-audit2@bigmooneducation.com',password:'AuditRun2!2026x'})})).json();
const H = { apikey:K, Authorization:`Bearer ${s.access_token}` };
const q = async p => (await fetch(`${U}/rest/v1/${p}`, { headers:H })).json();
const bid = (await q('vocab_banks?select=id&code=eq.toefl'))[0].id;
const links=[]; for(let o=0;;o+=1000){const c=await q(`vocab_word_banks?select=word_id&bank_id=eq.${bid}&limit=1000&offset=${o}`); links.push(...c); if(c.length<1000)break;}
const ids = links.map(l=>l.word_id);
const COLS='id,headword,ipa,pos,def_zh,def_en,freq_rank,audio_url';

const time = async (label, fn) => { const t0=Date.now(); const r=await fn(); console.log(`  ${String(Date.now()-t0).padStart(6)}ms  ${label}  → ${Array.isArray(r)?r.length:'?'} 行`); return r; };

console.log('方案对比:');
await time('A 现状:23 次串行分片', async ()=>{ const out=[]; for(let i=0;i<ids.length;i+=200) out.push(...await q(`vocab_words?select=${COLS}&id=in.(${ids.slice(i,i+200).join(',')})&def_zh=not.is.null`)); return out; });
await time('B 同样分片但并发', async ()=>{ const chunks=[]; for(let i=0;i<ids.length;i+=200) chunks.push(ids.slice(i,i+200));
  const rs=await Promise.all(chunks.map(c=>q(`vocab_words?select=${COLS}&id=in.(${c.join(',')})&def_zh=not.is.null`))); return rs.flat(); });
await time('C 不按 id 过滤,直接翻页取全表', async ()=>{ const out=[]; for(let o=0;;o+=1000){ const c=await q(`vocab_words?select=${COLS}&def_zh=not.is.null&order=freq_rank.asc.nullslast&limit=1000&offset=${o}`); out.push(...c); if(c.length<1000)break; } return out; });
console.log('\nD 今日学习其实只需要「到期/错题/少量新词」——不必拉全库:');
await time('  D 只取到期+错题的词详情(约 11 条)', async ()=>{
  const m = await q(`user_vocab_mastery?select=word_id&user_id=eq.${s.user.id}&next_review_at=lte.${new Date().toISOString()}`);
  const mm = await q(`vocab_mistake_book?select=word_id&user_id=eq.${s.user.id}&status=eq.active`);
  const need=[...new Set([...m.map(x=>x.word_id),...mm.map(x=>x.word_id)])];
  return need.length? q(`vocab_words?select=${COLS}&id=in.(${need.join(',')})`) : [];
});
await time('  D2 再取补新词用的高频前 100', ()=>q(`vocab_words?select=${COLS}&def_zh=not.is.null&order=freq_rank.asc.nullslast&limit=100`));
