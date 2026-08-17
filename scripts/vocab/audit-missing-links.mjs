/**
 * 机械漏配排查 —— **只读**。回答两个问题:
 *   ① 多标签共现漏配:ECDICT 给了 N 个考试标签,我们却只把它挂进了 M 个库(M<N)
 *   ③ 各库的真实缺口:ECDICT 标了这个库,库里却没有这个词
 *
 * 这两件其实是同一次计算的两个切面:对每个带标签的词算
 * `期望库集合`(由标签推出)对 `实际库集合`(库里现状)的差。
 *
 * ── ⚠️ 必须先扣掉"按设计剔掉的",否则会把设计报成 bug ──────────
 * 托福库当初是带 `--exclude-tags=zk,gk,cet4` 灌的(词库页文案写着
 * 「已剔除中考/高考/四级重复词」)。不扣这一条的话,ECDICT 标 toefl 的词里
 * 有 2,488 个会被算成"漏灌" —— 那是设计,不是缺口。
 * 同理 ket_pet / gmat 是按词频截断的派生库,不参与本次缺口统计。
 *
 * ── ⚠️ "库里没有"是两种完全不同的东西,必须分开 ────────────────
 *   (a) 词**在** vocab_words,只是没挂这个库 → 补一行 vocab_word_banks 就完事,
 *       释义/例句/音频都是现成的,**零内容生产、零 TTS 成本**;
 *   (b) 词**根本不在** vocab_words → 要建词条 + 生成内容 + 烧音频,
 *       还要过内容审核闸。成本差一个数量级。
 * 合成一个数报"缺 320",会让人以为都是 (a) 那种一条 SQL 的事。
 *
 * 用法:node scripts/vocab/audit-missing-links.mjs [--ecdict=<path>]
 * 末行 GATE_VERDICT;别用管道取退出码。
 */
import { createReadStream, existsSync, readFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { loadEnv, requireKeys } from './env.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const arg = (k, d) => process.argv.find(a => a.startsWith(`--${k}=`))?.split('=').slice(1).join('=') ?? d;
const ECDICT = arg('ecdict', path.join(tmpdir(), 'ecdict-source', 'ecdict.csv'));

/** ECDICT 标签 → 库。只列**纯按标签**灌的那七个;派生库不参与缺口统计。 */
const TAG2BANK = { zk: 'zhongkao', gk: 'gaokao', ky: 'kaoyan', cet4: 'cet4', cet6: 'cet6', toefl: 'toefl', ielts: 'ielts', gre: 'gre' };
/** 托福的排除规则 —— 带这些标签的词当初就没进托福库,是设计。 */
const TOEFL_EXCLUDE = ['zk', 'gk', 'cet4'];
const DERIVED_BANKS = new Set(['ket_pet', 'gmat', 'nce']);

if (!existsSync(ECDICT)) {
  console.error(`x 找不到 ecdict.csv(${ECDICT})—— 本脚本没有 ECDICT 就完全做不了,直接停。`);
  console.error('  ⚠️ 不产出"0 个缺口"那种看着像通过的空报告。');
  process.exit(2);
}

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

const banks = await paged('vocab_banks', { select: 'id,code,is_active' });
const words = await paged('vocab_words', { select: 'id,headword,freq_rank,def_zh,audio_url' });
const links = await paged('vocab_word_banks', { select: 'word_id,bank_id' });
const bankById = new Map(banks.map(b => [b.id, b.code]));
const bankIdByCode = new Map(banks.map(b => [b.code, b.id]));
const actual = new Map();                       // headword(lower) -> Set(bank code)
const wordByHead = new Map(words.map(w => [w.headword.toLowerCase(), w]));
const headById = new Map(words.map(w => [w.id, w.headword.toLowerCase()]));
for (const l of links) {
  const h = headById.get(l.word_id); if (!h) continue;
  if (!actual.has(h)) actual.set(h, new Set());
  actual.get(h).add(bankById.get(l.bank_id));
}

/* ── 读 ECDICT ─────────────────────────────────────────────── */
function csvFields(line) {
  const out = []; let cur = '', q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) { if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; }
    else if (c === '"') q = true;
    else if (c === ',') { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur); return out;
}
/** headword(小写) -> { tags, raw }。⚠️ **必须留原始拼写**:专名判定看首字母大小写,
    只留小写的话 Africa 永远命中不了"首字母大写"那条规则,归因会全错。 */
const tagged = new Map();
{
  const rl = createInterface({ input: createReadStream(ECDICT, 'utf8'), crlfDelay: Infinity });
  let first = true;
  for await (const line of rl) {
    if (first) { first = false; continue; }
    const f = csvFields(line);
    const w = (f[0] || '').toLowerCase(); if (!w) continue;
    const ts = (f[7] || '').trim().split(/\s+/).filter(t => TAG2BANK[t]);
    if (ts.length) tagged.set(w, { tags: ts, raw: (f[0] || '') });
  }
}

/** 由标签推出这个词**应该**进哪些库(已扣掉托福的设计性排除)。 */
function expectedBanks(tags) {
  const set = new Set();
  for (const t of tags) {
    if (t === 'toefl' && tags.some(x => TOEFL_EXCLUDE.includes(x))) continue;   // 设计,不是缺口
    set.add(TAG2BANK[t]);
  }
  return set;
}

/* ── 逐词算差 ───────────────────────────────────────────────── */
const gapExisting = [];   // (a) 词在库里,只是没挂这个库
const gapAbsent = [];     // (b) 词根本不在 vocab_words
for (const [head, { tags, raw }] of tagged) {
  const exp = expectedBanks(tags);
  if (!exp.size) continue;
  const w = wordByHead.get(head);
  const act = actual.get(head) ?? new Set();
  const missing = [...exp].filter(b => !act.has(b));
  if (!missing.length) continue;
  const rec = { head, raw, tags, expected: [...exp], actual: [...act], missing, word: w };
  (w ? gapExisting : gapAbsent).push(rec);
}

/* ── ① 多标签共现漏配 ───────────────────────────────────────── */
console.log('═══ ① 多标签共现漏配:ECDICT 标了 N 个考试,我们只挂进 M 个库(M<N)═══\n');
const multi = gapExisting.filter(r => r.expected.length >= 2 && r.actual.filter(b => !DERIVED_BANKS.has(b)).length <= r.expected.length - 1);
console.log(`词在库里、但少挂了库的:${gapExisting.length} 个(其中期望 ≥2 个库的:${multi.length} 个)`);
const byMissBank = {};
for (const r of gapExisting) for (const b of r.missing) byMissBank[b] = (byMissBank[b] || 0) + 1;
console.log(`按缺哪个库分:${Object.entries(byMissBank).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' · ')}`);
console.log('\n最常用的 20 个(词频越小越常用):');
for (const r of gapExisting.sort((a, b) => (a.word.freq_rank ?? Infinity) - (b.word.freq_rank ?? Infinity)).slice(0, 20)) {
  console.log(`   ${String(r.word.freq_rank ?? '—').padStart(6)}  ${r.head.padEnd(18)} 标签[${r.tags.join(' ')}] 现在只在[${r.actual.join(',') || '—'}] **缺 ${r.missing.join(',')}**`);
}

/* ── ③ 各库缺口,按 (a)/(b) 拆开 ─────────────────────────────── */
console.log('\n═══ ③ 各库缺口拆解 ═══\n');
console.log('库          (a)词在·只差挂载   (b)词根本没有   合计   (a) 里内容+音频齐备的');
const codes = [...new Set(Object.values(TAG2BANK))];
let totalA = 0, totalB = 0, totalReady = 0;
for (const code of codes) {
  const a = gapExisting.filter(r => r.missing.includes(code));
  const b = gapAbsent.filter(r => r.missing.includes(code));
  const ready = a.filter(r => r.word.def_zh && r.word.audio_url);
  totalA += a.length; totalB += b.length; totalReady += ready.length;
  console.log(`${code.padEnd(11)} ${String(a.length).padStart(14)} ${String(b.length).padStart(14)} ${String(a.length + b.length).padStart(7)} ${String(ready.length).padStart(20)}`);
}
console.log(`${'合计'.padEnd(10)} ${String(totalA).padStart(14)} ${String(totalB).padStart(14)} ${String(totalA + totalB).padStart(7)} ${String(totalReady).padStart(20)}`);

console.log(`\n(a) 类共 ${totalA} 条挂载缺失,涉及 ${new Set(gapExisting.map(r => r.head)).size} 个词 ——`);
console.log(`    这批**零内容生产、零 TTS 成本**,纯补 vocab_word_banks 关联行。`);
console.log(`(b) 类共 ${totalB} 条,涉及 ${new Set(gapAbsent.map(r => r.head)).size} 个词 ——`);
console.log(`    要建词条 + 生成释义例句 + 烧音频 + 过内容审核闸,是另一件工程,不在本轮。`);
/* ── (b) 类归因:它们是"漏灌"还是"当初按规则跳过的" ──────────────
   ⚠️ 这一步不做的话,320 会被当成"纯机械漏灌、一条 SQL 就能补"。
      实际 ingest 里有一组**有意的**清洗规则(ingest-toefl.mjs:248-253):
        含空格短语 / 首字母大写的专名 / 非纯字母 / 小写后重复 / 排除表。
      把设计报成缺口,下一步就会去"修"一个不存在的 bug。 */
const PURE_WORD = /^[a-z][a-z'-]*$/;
/* excluded-words.json 是**对象**({词: 原因}),不是数组 —— 直接 new Set(obj) 会抛。 */
const EXCLUDED_RAW = JSON.parse(readFileSync(path.join(HERE, 'data', 'excluded-words.json'), 'utf8'));
const EXCLUDED = new Set(Array.isArray(EXCLUDED_RAW) ? EXCLUDED_RAW : Object.keys(EXCLUDED_RAW));
function skipReason(raw) {
  if (/\s/.test(raw)) return '短语(含空格)';
  if (/^[A-Z]/.test(raw)) return '专有名词(首字母大写)';
  const hw = raw.toLowerCase();
  if (!PURE_WORD.test(hw)) return '非纯字母';
  if (EXCLUDED.has(hw)) return '排除表';
  return null;
}
if (gapAbsent.length) {
  console.log('\n── (b) 类归因:按 ingest 的清洗规则重放一遍 ──');
  const reasons = {};
  const unexplained = [];
  for (const r of gapAbsent) {
    /* ⚠️ 要用**原始拼写**判专名/短语,不能用我小写过的 head ——
       用小写的判的话 Africa 永远不会命中"首字母大写"这条,归因全错。 */
    const reason = skipReason(r.raw ?? r.head);
    if (reason) reasons[reason] = (reasons[reason] || 0) + 1;
    else unexplained.push(r);
  }
  for (const [k, v] of Object.entries(reasons).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${k.padEnd(24)} ${String(v).padStart(4)} 个 —— **按设计跳过,不是缺口**`);
  }
  console.log(`   ${'规则解释不了的'.padEnd(22)} ${String(unexplained.length).padStart(4)} 个 —— **这才是真缺口**`);
  if (unexplained.length) {
    console.log('\n   真缺口清单(最多 30 个):');
    for (const r of unexplained.slice(0, 30)) {
      console.log(`      ${(r.raw ?? r.head).padEnd(22)} 标签[${r.tags.join(' ')}] 应进[${r.missing.join(',')}]`);
    }
  }
}

/* ── 自检:随机抽查几条,确认差集算得对 ─────────────────────── */
console.log('\n═══ 自检 ═══\n');
let ok = true;
/* ⚠️ 判据必须能被证伪:抽 5 条 (a) 类,逐条复核"它确实带那个标签、确实没挂那个库"。
   只报总数的话,差集算反了(把已挂的报成没挂)同样能给出一个像模像样的数字。 */
for (const r of gapExisting.slice(0, 5)) {
  const tagOk = r.missing.every(b => r.tags.some(t => TAG2BANK[t] === b));
  const notLinked = r.missing.every(b => !(actual.get(r.head) ?? new Set()).has(b));
  if (!tagOk || !notLinked) ok = false;
  console.log(`   ${r.head.padEnd(18)} 标签支持缺口 ${tagOk ? '✓' : '✗'} · 确实未挂载 ${notLinked ? '✓' : '✗'}`);
}
/* 反向:随便找一个**已经挂全**的词,它不该出现在缺口里 */
const control = [...tagged.keys()].find(h => {
  const w = wordByHead.get(h); if (!w) return false;
  const exp = expectedBanks(tagged.get(h).tags);
  const act = actual.get(h) ?? new Set();
  return exp.size >= 2 && [...exp].every(b => act.has(b));
});
const controlLeaked = gapExisting.some(r => r.head === control) || gapAbsent.some(r => r.head === control);
if (controlLeaked) ok = false;
console.log(`   对照组 ${String(control).padEnd(18)} 已挂全,未出现在缺口里 ${controlLeaked ? '✗ 泄漏' : '✓'}`);

console.log('\n⚠️ 本脚本只读,不出 SQL、不改任何词表。');
console.log(`\nGATE_VERDICT ${ok ? 'PASS' : 'FAIL'}`);
process.exit(ok ? 0 : 1);
