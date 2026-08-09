/* 给 buildTodayPlan 的每一步计时,查 /vocab/today 慢在哪 */
import { loadEnv } from '../env.mjs';
const env = loadEnv(process.cwd(), { quiet: true });
const U = env.VITE_SUPABASE_URL, K = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const s = await (await fetch(`${U}/auth/v1/token?grant_type=password`,{method:'POST',
  headers:{apikey:K,'Content-Type':'application/json'},
  body:JSON.stringify({email:'cc-audit2@bigmooneducation.com',password:'AuditRun2!2026x'})})).json();
if(!s?.access_token){ console.error('登录失败'); process.exit(1); }
const H = { apikey:K, Authorization:`Bearer ${s.access_token}` };
const uid = s.user.id;
const t = async (label, fn) => { const t0=Date.now(); const r=await fn(); console.log(`  ${String(Date.now()-t0).padStart(6)}ms  ${label}`); return r; };
const q = async p => (await fetch(`${U}/rest/v1/${p}`, { headers:H })).json();

console.log('buildTodayPlan 各步耗时:');
const bank = await t('getBankByCode(toefl)', ()=>q('vocab_banks?select=*&code=eq.toefl'));
const bid = bank[0].id;

// listBankWords = vocab_word_banks 翻页 + vocab_words 分片查
const links = await t('① vocab_word_banks 全量(翻页)', async ()=>{
  const out=[]; for(let o=0;;o+=1000){ const c=await q(`vocab_word_banks?select=word_id&bank_id=eq.${bid}&limit=1000&offset=${o}`); out.push(...c); if(c.length<1000)break; } return out;
});
console.log(`      → ${links.length} 条 link`);
const ids = links.map(l=>l.word_id);
await t(`② vocab_words 分片查(${Math.ceil(ids.length/200)} 次 × 200)`, async ()=>{
  const out=[]; for(let i=0;i<ids.length;i+=200){
    out.push(...await q(`vocab_words?select=id,headword,ipa,pos,def_zh,def_en,freq_rank,audio_url&id=in.(${ids.slice(i,i+200).join(',')})&def_zh=not.is.null`));
  } return out;
});
await t('③ user_vocab_mastery', ()=>q(`user_vocab_mastery?select=word_id,next_review_at,review_interval_idx,tested_count&user_id=eq.${uid}&limit=5000`));
await t('④ listMistakes', ()=>q(`vocab_mistake_book?select=word_id,headword_snapshot,wrong_total,last_wrong_mode,streak_days,last_streak_date,entered_at&user_id=eq.${uid}&status=eq.active&order=entered_at.asc&limit=500`));
await t('⑤ getStats', ()=>q(`vocab_user_stats?select=*&user_id=eq.${uid}`));
