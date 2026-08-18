/**
 * 高频词混进高阶词库的排查 —— **只读**,不改任何挂载、不出 SQL。
 *
 * 判据(这一条不需要任何语义判断,所以能做成机器闸):
 *   **词频排名 ≤ N 的词,不该出现在高阶词库里。**
 * 没人会争论 in(频 6)/ on(频 17)/ as(频 33)该不该出现在雅思词汇书里。
 * 这跟前三轮追的"哪些词该补进来"是反方向 —— 那个方向要判
 * "concurrent 该不该进六级",是语义,词频做不到(实测:真阴性 hallway 的词频
 * 夹在两个真阳性中间,单阈值无解),AWL 又卡在授权上。**这个方向可判。**
 *
 * ⚠️ 本脚本额外查两件"删之前必须知道"的事,报告里单列:
 *   ① 删了挂载会不会把词**变成孤儿**(该词只属于这一个库)——
 *      孤儿行留在 vocab_words 里但任何库都看不到,和 millennia 一个下场。
 *   ② 这些词**有没有用户学习记录**(user_vocab_mastery)——
 *      有的话,删挂载会让用户的"已学/已掌握"计数当场变少。
 *      ⚠️ 匿名 key 受 RLS 限制读不到别人的行,所以 ② 只能报"我查不了",
 *         **不能报成 0**。这是第三态,不是"没有"。
 *
 * 用法:node scripts/vocab/audit-lowfreq-in-banks.mjs [--top=500] [--bank=ielts] [--list]
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv, requireKeys } from './env.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const arg = (k, d) => process.argv.find(a => a.startsWith(`--${k}=`))?.split('=').slice(1).join('=') ?? d;
const TOP = Number(arg('top', '500'));
const ONLY_BANK = arg('bank', '');
const LIST = process.argv.includes('--list');

const ENV = loadEnv(REPO, { quiet: true });
requireKeys(ENV, ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY']);
const H = { apikey: ENV.VITE_SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${ENV.VITE_SUPABASE_PUBLISHABLE_KEY}` };
async function paged(pathname, params) {
  const out = [];
  for (let off = 0; ; off += 1000) {
    const u = new URL(`${ENV.VITE_SUPABASE_URL}/rest/v1/${pathname}`);
    for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
    u.searchParams.set('offset', String(off)); u.searchParams.set('limit', '1000');
    const r = await fetch(u, { headers: H });
    if (!r.ok) throw new Error(`REST ${pathname} ${r.status}: ${(await r.text()).slice(0, 160)}`);
    const j = await r.json();
    out.push(...j); if (j.length < 1000) return out;
  }
}

const banks = await paged('vocab_banks', { select: 'id,code,name_zh,is_active,is_free,total_words' });
const words = await paged('vocab_words', { select: 'id,headword,pos,freq_rank,def_zh' });
const links = await paged('vocab_word_banks', { select: 'word_id,bank_id' });

const bankById = new Map(banks.map(b => [b.id, b]));
const wordById = new Map(words.map(w => [w.id, w]));
const banksOfWord = new Map();
for (const l of links) {
  if (!banksOfWord.has(l.word_id)) banksOfWord.set(l.word_id, new Set());
  banksOfWord.get(l.word_id).add(bankById.get(l.bank_id)?.code);
}

/* ── 各库低频段分布(独立复核,不采信任何人的汇报) ── */
console.log(`═══ 各库高频词占比(词频越小越常用)═══\n`);
console.log('库          收费  启用   词数    ≤500   ≤1000  ≤1000占比   最常用的那个');
const rows = [];
for (const b of banks) {
  const ws = [...banksOfWord.entries()].filter(([, s]) => s.has(b.code)).map(([id]) => wordById.get(id)).filter(Boolean);
  if (!ws.length) continue;
  const le500 = ws.filter(w => (w.freq_rank ?? Infinity) <= 500);
  const le1000 = ws.filter(w => (w.freq_rank ?? Infinity) <= 1000);
  const top = ws.slice().sort((a, z) => (a.freq_rank ?? Infinity) - (z.freq_rank ?? Infinity))[0];
  rows.push({ b, n: ws.length, a: le500.length, c: le1000.length, top });
}
for (const r of rows.sort((x, y) => y.c / y.n - x.c / x.n)) {
  const paid = r.b.is_free === false ? '是' : (r.b.is_free === true ? '—' : '?');
  console.log(`${r.b.code.padEnd(11)} ${paid.padEnd(5)} ${(r.b.is_active ? '✓' : '✗').padEnd(5)} ${String(r.n).padStart(5)} ${String(r.a).padStart(6)} ${String(r.c).padStart(7)} ${(r.c / r.n * 100).toFixed(1).padStart(8)}%   ${r.top?.headword ?? '—'}(${r.top?.freq_rank ?? '—'})`);
}

/* ── 目标库的清单 ── */
const targets = ONLY_BANK ? [ONLY_BANK] : rows.filter(r => r.b.is_free === false).map(r => r.b.code);
for (const code of targets) {
  const b = banks.find(x => x.code === code);
  if (!b) { console.log(`\n⊘ 没有 code=${code} 这个库`); continue; }
  const ws = [...banksOfWord.entries()].filter(([, s]) => s.has(code)).map(([id]) => wordById.get(id)).filter(Boolean)
    .filter(w => (w.freq_rank ?? Infinity) <= TOP)
    .sort((a, z) => (a.freq_rank ?? Infinity) - (z.freq_rank ?? Infinity));

  console.log(`\n═══ ${code}(${b.name_zh})· 词频 ≤ ${TOP} 的词:${ws.length} 个 ═══\n`);

  /* ① 删了会不会变孤儿:该词是不是**只**属于这一个库 */
  const orphanRisk = ws.filter(w => (banksOfWord.get(w.id) ?? new Set()).size === 1);
  console.log(`⚠️ 其中 ${orphanRisk.length} 个**只属于 ${code} 这一个库** —— 摘掉挂载后它们会变成孤儿行`);
  console.log(`   (词还在 vocab_words 里,但任何词库都看不到它,和 millennia 一个下场)。`);
  if (orphanRisk.length) {
    console.log(`   孤儿风险词:${orphanRisk.slice(0, 20).map(w => `${w.headword}(${w.freq_rank})`).join(', ')}${orphanRisk.length > 20 ? ' …' : ''}`);
  }
  const alsoElsewhere = ws.length - orphanRisk.length;
  console.log(`   另外 ${alsoElsewhere} 个同时属于别的库,摘掉这一条挂载是安全的。`);

  /* 按词性看:介词/连词/代词这类虚词最没有争议 */
  const byPos = {};
  for (const w of ws) { const p = (w.pos || '?').split('/')[0]; byPos[p] = (byPos[p] || 0) + 1; }
  console.log(`\n词性分布:${Object.entries(byPos).sort((a, z) => z[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' · ')}`);

  if (LIST) {
    console.log(`\n完整名单(频次 | 词 | 词性 | 释义 | 还属于哪些库):`);
    for (const w of ws) {
      const other = [...(banksOfWord.get(w.id) ?? new Set())].filter(x => x !== code).sort();
      console.log(`  ${String(w.freq_rank).padStart(5)}  ${w.headword.padEnd(16)} ${(w.pos || '').padEnd(14)} ${(w.def_zh || '').split('；')[0].slice(0, 14).padEnd(16)} ${other.join(',') || '**只有本库**'}`);
    }
  }
}

/* ── 删之前必须知道、但我查不到的那件事 ── */
console.log('\n═══ ⚠️ 我查不了、但删之前必须有人查的 ═══\n');
console.log('   这些词有没有**用户学习记录**(user_vocab_mastery / vocab_mistake_book)?');
console.log('   匿名 key 受 RLS 限制,读这两张表恒为 0 行 —— 那是"我没权限看",**不是"没有记录"**。');
console.log('   摘挂载不会删 user_vocab_mastery(它按 word_id 存,与库无关),');
console.log('   但**词库页的"已学/已掌握"计数会当场变少** —— 那是按库过滤算出来的。');
console.log('   用户在雅思库学过 in/on/go 的话,他会看到自己的进度数字凭空掉一截。');
console.log('   → 这条要么先查清并接受,要么在发布说明里讲清楚。');

console.log('\n⚠️ 本脚本只读:不改挂载、不改 total_words、不出 SQL。');
