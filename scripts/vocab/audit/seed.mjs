/* 造一个「脏」测试账号:错题 / 掌握度 / 收藏 / 跨天到期复习 各几条。
   ⚠️ 每一步都硬校验,失败立刻退出 —— 上一轮就是因为登录失败没被发现,
      整轮 E2E 以未登录态跑完还显示 14 个 ✓。 */
import { loadEnv } from '../env.mjs';
const env = loadEnv(process.cwd(), { quiet: true });
const U = env.VITE_SUPABASE_URL, K = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const EMAIL = process.env.EMAIL, PASS = process.env.PASS;
const die = (m) => { console.error('✗ ' + m); process.exit(1); };

let r = await fetch(`${U}/auth/v1/signup`,{method:'POST',headers:{apikey:K,'Content-Type':'application/json'},body:JSON.stringify({email:EMAIL,password:PASS})});
let s = await r.json();
if (!s.access_token) {
  r = await fetch(`${U}/auth/v1/token?grant_type=password`,{method:'POST',headers:{apikey:K,'Content-Type':'application/json'},body:JSON.stringify({email:EMAIL,password:PASS})});
  s = await r.json();
}
if (!s?.access_token) die(`登录失败(这一步没校验正是上轮翻车的原因):${JSON.stringify(s).slice(0,200)}`);
const uid = s.user.id;
const H = { apikey:K, Authorization:`Bearer ${s.access_token}`, 'Content-Type':'application/json' };
console.log('✓ 账号就绪', uid);

const words = await (await fetch(`${U}/rest/v1/vocab_words?select=id,headword&def_zh=not.is.null&limit=24`,{headers:H})).json();
if (!Array.isArray(words) || words.length < 24) die('取词失败');
const iso = d => new Date(Date.now()+d*864e5).toISOString();
const today = new Date().toISOString().slice(0,10);

const post = async (t, rows, label) => {
  const rr = await fetch(`${U}/rest/v1/${t}`,{method:'POST',headers:{...H,Prefer:'resolution=merge-duplicates'},body:JSON.stringify(rows)});
  if (!rr.ok) die(`${label} 失败 ${rr.status}: ${(await rr.text()).slice(0,200)}`);
  console.log(`✓ ${label} ${rows.length} 条`);
};

// ① 5 条错题(含不同 last_wrong_mode)
await post('vocab_mistake_book', words.slice(0,5).map((w,i)=>({
  user_id:uid, word_id:w.id, headword_snapshot:w.headword, wrong_total:i+1,
  last_wrong_mode:['zh_choice','spell','listen','match','zh_choice'][i], status:'active',
})), '错题');

// ② 掌握度:6 条**已到期**(昨天/前天)+ 4 条未来到期 + 3 条已掌握(30天档)
await post('user_vocab_mastery', [
  ...words.slice(5,11).map((w,i)=>({ user_id:uid, word_id:w.id, mastery_level:2, correct_days:2,
    modes_correct:['zh_choice'], tested_count:3, review_interval_idx:1,
    next_review_at: iso(-(i+1)), first_learned_date: today, last_correct_date: today })),
  ...words.slice(11,15).map(w=>({ user_id:uid, word_id:w.id, mastery_level:2, correct_days:2,
    modes_correct:['zh_choice'], tested_count:3, review_interval_idx:2,
    next_review_at: iso(3), first_learned_date: today, last_correct_date: today })),
  ...words.slice(15,18).map(w=>({ user_id:uid, word_id:w.id, mastery_level:5, correct_days:4,
    modes_correct:['zh_choice','spell'], tested_count:9, review_interval_idx:5,
    next_review_at: iso(30), first_learned_date: today, last_correct_date: today })),
], '掌握度(6 到期 / 4 未来 / 3 已掌握)');

// ③ 收藏 3 条
await post('user_vocab_wordbook', words.slice(18,21).map(w=>({
  user_id:uid, word_id:w.id, text_en:w.headword, text_zh:null, source_kind:'word', source_ref:w.id,
})), '收藏');

// 校验:读回来确认真的写进去了
const chk = async (t,label) => {
  const rr = await fetch(`${U}/rest/v1/${t}?select=*&limit=1`,{headers:{...H,Prefer:'count=exact'}});
  const n = rr.headers.get('content-range')?.split('/')[1];
  console.log(`  校验 ${label}: ${n} 行`);
  if (Number(n) === 0) die(`${label} 写了但读回来是 0`);
};
await chk('vocab_mistake_book','错题'); await chk('user_vocab_mastery','掌握度'); await chk('user_vocab_wordbook','收藏');
console.log('\nUID=' + uid);
