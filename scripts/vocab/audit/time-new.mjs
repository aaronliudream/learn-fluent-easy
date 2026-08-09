/* 复刻新版 buildTodayPlan 的查询序列并计时 */
import { loadEnv } from '../env.mjs';
const env = loadEnv(process.cwd(), { quiet: true });
const U = env.VITE_SUPABASE_URL, K = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const s = await (await fetch(`${U}/auth/v1/token?grant_type=password`,{method:'POST',
  headers:{apikey:K,'Content-Type':'application/json'},
  body:JSON.stringify({email:'cc-audit2@bigmooneducation.com',password:'AuditRun2!2026x'})})).json();
const H={apikey:K,Authorization:`Bearer ${s.access_token}`}; const uid=s.user.id;
const q = async p => (await fetch(`${U}/rest/v1/${p}`,{headers:H})).json();
const C='id,headword,ipa,pos,def_zh,def_en,freq_rank,audio_url';
const now=new Date().toISOString();
const T0=Date.now();
const [stats,due,mis] = await Promise.all([
  q(`vocab_user_stats?select=*&user_id=eq.${uid}`),
  q(`user_vocab_mastery?select=word_id,next_review_at&user_id=eq.${uid}&next_review_at=lte.${now}&limit=2000`),
  q(`vocab_mistake_book?select=word_id,last_wrong_mode&user_id=eq.${uid}&status=eq.active&order=entered_at.asc&limit=500`),
]);
const need=[...new Set([...due.map(d=>d.word_id),...mis.map(m=>m.word_id)])];
const detail = need.length? await q(`vocab_words?select=${C}&id=in.(${need.join(',')})`) : [];
const goal = stats[0]?.daily_goal ?? 20;
const fresh = await q(`vocab_words?select=${C}&def_zh=not.is.null&order=freq_rank.asc.nullslast&limit=${Math.min(500,goal+need.length+60)}`);
const touched = fresh.length? await q(`user_vocab_mastery?select=word_id&user_id=eq.${uid}&word_id=in.(${fresh.map(w=>w.id).join(',')})`) : [];
console.log(`新版总耗时 ${Date.now()-T0}ms`);
console.log(`  到期 ${due.length} · 错题 ${mis.length} · 详情 ${detail.length} · 新词候选 ${fresh.length} · 其中已学过 ${touched.length}`);
console.log(`  → 今日任务量约 ${Math.min(goal, due.length+mis.length) + Math.max(0, goal-due.length-mis.length)} 词`);
