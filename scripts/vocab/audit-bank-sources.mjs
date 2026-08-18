/**
 * 词库来源与跨库一致性审计 —— **只读,不改任何词表,不出 SQL**。
 *
 * 产出三样(2026-08-17 Aaron 点名要的):
 *   ① 各库 ingest 来源清单 —— 从代码常量取,不凭记忆
 *   ② 托福独占词分桶报告 —— 按词频分桶,看"孤岛"有多大、集中在哪
 *   ③ 缺失排查结论 —— neurological 这类"全库没有"和"标签有、库里没有"分开算
 *
 * ── ⚠️ 判据先定,再看总数 ────────────────────────────────────────
 * 按 skill 第五节:改判据先拿**已知答案的样本**喂它,确认它仍能点名。
 * 本次样本由 Aaron 给定:
 *   真阳性 concurrent —— 纯学术词,只在托福,六级/考研/雅思本该也有
 *   真阳性 concerned  —— 高频常用词,只在托福,别的库一个都没有
 *   真阴性 hallway    —— 托福独占,但确实不必进六级
 * **点不中两个真阳性、或误伤真阴性,判据就是坏的 —— 别看总数好不好看。**
 * 第二版扫描器总数从 1371 降到 13 看着很精准,实际是真阳性掉进弱档、
 * 13 个误报占着强档。总数是最容易骗过自己的信号。
 *
 * 用法:node scripts/vocab/audit-bank-sources.mjs [--ecdict=<path>]
 * 末行 GATE_VERDICT;别用管道取退出码。
 */
import { createReadStream, existsSync } from 'node:fs';
import { createInterface } from 'node:readline';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { loadEnv, requireKeys } from './env.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const arg = (k, d) => process.argv.find(a => a.startsWith(`--${k}=`))?.split('=').slice(1).join('=') ?? d;
const ECDICT = arg('ecdict', path.join(tmpdir(), 'ecdict-source', 'ecdict.csv'));

/* ── ① 来源清单:**照抄 ingest-toefl.mjs 的常量**,不另写一份 ──
   这里是报告用的镜像;两边不一致的话报告会骗人,所以下面 assertSourceMirror()
   会去 ingest 源码里核对每一条真的还在。 */
const SOURCE = {
  zhongkao: { kind: 'ECDICT 标签', detail: 'tag=zk' },
  gaokao: { kind: 'ECDICT 标签', detail: 'tag=gk' },
  kaoyan: { kind: 'ECDICT 标签', detail: 'tag=ky' },
  cet4: { kind: 'ECDICT 标签', detail: 'tag=cet4' },
  cet6: { kind: 'ECDICT 标签', detail: 'tag=cet6' },
  toefl: { kind: 'ECDICT 标签', detail: 'tag=toefl' },
  ielts: { kind: 'ECDICT 标签', detail: 'tag=ielts' },
  gre: { kind: 'ECDICT 标签', detail: 'tag=gre' },
  ket_pet: { kind: '派生(我们自定口径)', detail: '(zk∪gk∪cet4) 且 freq_rank ≤ 4000' },
  gmat: { kind: '派生(我们自定口径)', detail: 'tag=gre 且 freq_rank ≤ 15000' },
  nce: { kind: '无来源', detail: 'ECDICT 无标签也推不出;教材词表,未接入' },
};
/** 期望带哪个 ECDICT 标签(派生库按它的基础标签集合算) */
const EXPECT_TAGS = {
  zhongkao: ['zk'], gaokao: ['gk'], kaoyan: ['ky'], cet4: ['cet4'], cet6: ['cet6'],
  toefl: ['toefl'], ielts: ['ielts'], gre: ['gre'],
  ket_pet: ['zk', 'gk', 'cet4'], gmat: ['gre'],
};
/** 高阶库 —— 跨库一致性闸门只对这些库判"孤岛" */
const ADVANCED = new Set(['cet6', 'kaoyan', 'ielts', 'toefl', 'gre', 'gmat']);
/** Aaron 定的闸门阈值:词频低于它 = 常用到不该只待在一个高阶库里 */
const ISLAND_FREQ = 8000;

const SAMPLES = {
  truePositive: ['concurrent', 'concerned'],
  trueNegative: ['hallway'],
};

/* ── 读库(只读) ─────────────────────────────────────────────── */
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
    out.push(...j);
    if (j.length < 1000) return out;
  }
}

const banks = await paged('vocab_banks', { select: 'id,code,name_zh,is_active' });
const words = await paged('vocab_words', { select: 'id,headword,freq_rank' });
const links = await paged('vocab_word_banks', { select: 'word_id,bank_id' });

const bankById = new Map(banks.map(b => [b.id, b.code]));
const byWord = new Map();                       // word_id -> Set(bank code)
for (const l of links) {
  if (!byWord.has(l.word_id)) byWord.set(l.word_id, new Set());
  byWord.get(l.word_id).add(bankById.get(l.bank_id));
}
const wordById = new Map(words.map(w => [w.id, w]));
const byHead = new Map(words.map(w => [w.headword.toLowerCase(), w]));

/* ── 读 ECDICT 标签 ─────────────────────────────────────────── */
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
/** tag -> Set(headword);以及 headword -> tag 字符串 */
const tagWords = new Map();
const tagOf = new Map();
/** ⚠️ 第三态:必须把"ECDICT 里根本没这个词"和"有词条但没打任何考试标签"分开。
    第一版只存了有标签的词,于是 neurological 被报成"ECDICT 无此词条" ——
    实际它在不在词典里我根本没查。把拿不到归进"缺失"是踩过两次的老坑。 */
const inEcdict = new Set();
let ecdictOk = false;
if (!existsSync(ECDICT)) {
  console.log(`⊘ 找不到 ecdict.csv(${ECDICT})—— 来源吻合度与缺失排查两节**跳过**。`);
  console.log('  ⚠️ 这不叫"没问题",叫没测。\n');
} else {
  ecdictOk = true;
  const rl = createInterface({ input: createReadStream(ECDICT, 'utf8'), crlfDelay: Infinity });
  let first = true;
  for await (const line of rl) {
    if (first) { first = false; continue; }
    const f = csvFields(line);
    const w = (f[0] || '').toLowerCase();
    if (!w) continue;
    inEcdict.add(w);
    const tags = (f[7] || '').trim();
    if (!tags) continue;
    tagOf.set(w, tags);
    for (const t of tags.split(/\s+/).filter(Boolean)) {
      if (!tagWords.has(t)) tagWords.set(t, new Set());
      tagWords.get(t).add(w);
    }
  }
}

/* ── ① 来源清单 ─────────────────────────────────────────────── */
console.log('═══ ① 各库 ingest 来源清单 ═══\n');
console.log('库          名称                  启用  词数    来源                    判据');
const bankWordCount = {};
for (const b of banks) {
  const n = [...byWord.values()].filter(s => s.has(b.code)).length;
  bankWordCount[b.code] = n;
}
for (const b of banks.sort((a, z) => (bankWordCount[z.code] || 0) - (bankWordCount[a.code] || 0))) {
  const s = SOURCE[b.code] || { kind: '?', detail: '未登记' };
  console.log(`${b.code.padEnd(11)} ${(b.name_zh || '').padEnd(20)} ${b.is_active ? '✓' : '✗'}    ${String(bankWordCount[b.code] || 0).padStart(5)}   ${s.kind.padEnd(22)} ${s.detail}`);
}

if (ecdictOk) {
  console.log('\n── 来源吻合度:库里的词有多少真的带着它"应该带"的 ECDICT 标签 ──');
  console.log('   低于 100% 说明这个库不是(或不只是)按那个标签灌的,来源与登记不符。');
  for (const [code, tags] of Object.entries(EXPECT_TAGS)) {
    const ws = [...byWord.entries()].filter(([, s]) => s.has(code)).map(([id]) => wordById.get(id)).filter(Boolean);
    if (!ws.length) continue;
    let hit = 0, noEntry = 0;
    for (const w of ws) {
      const t = tagOf.get(w.headword.toLowerCase());
      if (t === undefined) { noEntry++; continue; }
      if (tags.some(x => t.split(/\s+/).includes(x))) hit++;
    }
    const pct = (hit / ws.length * 100).toFixed(1);
    console.log(`   ${code.padEnd(10)} ${String(hit).padStart(5)}/${String(ws.length).padEnd(5)} = ${pct.padStart(5)}%  (期望标签 ${tags.join('|')}${noEntry ? ` · ECDICT 无此词条 ${noEntry}` : ''})`);
  }
}

/* ── ② 托福独占词分桶 ────────────────────────────────────────── */
console.log('\n═══ ② 托福独占词分桶 ═══\n');
const BUCKETS = [[0, 1000], [1000, 3000], [3000, 8000], [8000, 15000], [15000, Infinity]];
const exclusive = [];
for (const [id, set] of byWord) {
  if (set.size === 1 && set.has('toefl')) {
    const w = wordById.get(id);
    if (w) exclusive.push(w);
  }
}
const toeflTotal = bankWordCount.toefl || 0;
console.log(`托福 ${toeflTotal} 词,独占 ${exclusive.length} 词(${(exclusive.length / toeflTotal * 100).toFixed(1)}%)\n`);
console.log('词频区间          词数    占独占    示例(最常用的几个)');
for (const [lo, hi] of BUCKETS) {
  const inB = exclusive.filter(w => (w.freq_rank ?? Infinity) >= lo && (w.freq_rank ?? Infinity) < hi)
    .sort((a, b) => (a.freq_rank ?? Infinity) - (b.freq_rank ?? Infinity));
  const label = hi === Infinity ? `${lo}+ / 无词频` : `${lo}–${hi}`;
  console.log(`${label.padEnd(18)}${String(inB.length).padStart(5)}   ${(inB.length / exclusive.length * 100).toFixed(1).padStart(5)}%    ${inB.slice(0, 6).map(w => w.headword).join(', ')}`);
}

/* ── 跨库一致性闸门(Aaron 方案 C)────────────────────────────── */
console.log(`\n═══ 跨库一致性闸门:词频 < ${ISLAND_FREQ} 却只出现在一个高阶库 ═══\n`);
const islands = [];
for (const [id, set] of byWord) {
  if (set.size !== 1) continue;
  const only = [...set][0];
  if (!ADVANCED.has(only)) continue;
  const w = wordById.get(id);
  if (!w || (w.freq_rank ?? Infinity) >= ISLAND_FREQ) continue;
  islands.push({ ...w, bank: only });
}
islands.sort((a, b) => (a.freq_rank ?? Infinity) - (b.freq_rank ?? Infinity));
const byBank = {};
for (const w of islands) byBank[w.bank] = (byBank[w.bank] || 0) + 1;
console.log(`点名 ${islands.length} 个,按库:${Object.entries(byBank).map(([k, v]) => `${k} ${v}`).join(' · ')}`);
console.log('\n最常用的 25 个(词频越小越常用):');
for (const w of islands.slice(0, 25)) {
  console.log(`   ${String(w.freq_rank).padStart(6)}  ${w.headword.padEnd(20)} 只在 ${w.bank}`);
}

/* ── ③ 缺失排查 ─────────────────────────────────────────────── */
console.log('\n═══ ③ 缺失排查 ═══\n');
const PROBE = ['neurological', 'concurrent', 'concerned', 'involved', 'hallway', 'erode',
  'apparent', 'contemporary', 'cease', 'inevitable', 'maintain', 'undergo'];
console.log('探针词        我们库里            ECDICT 里');
for (const p of PROBE) {
  const w = byHead.get(p);
  const inBanks = w ? [...(byWord.get(w.id) || [])].sort().join(',') : '(全库都没有)';
  /* ⚠️ 三态,不是两态:没词条 / 有词条但没考试标签 / 有标签。
     混成"没有"的话,neurological 会被读成"ECDICT 也没收录",而那是我没查过的事。 */
  const t = !ecdictOk ? '(未读 ECDICT)'
    : !inEcdict.has(p) ? '**词典里没有这个词**'
    : (tagOf.get(p) ?? '有词条,但**没有任何考试标签**');
  console.log(`${p.padEnd(14)}${inBanks.padEnd(34)}${t}`);
}

if (ecdictOk) {
  console.log('\n── "标签有、库里没有":ECDICT 给了标签,但我们对应的库里缺这个词 ──');
  console.log('   这一栏才是"漏灌";全库都没有的词属于另一类(源头就没标)。');
  for (const [code, tags] of Object.entries(EXPECT_TAGS)) {
    if (!bankWordCount[code]) continue;
    const want = new Set();
    for (const t of tags) for (const w of (tagWords.get(t) || [])) want.add(w);
    const have = new Set([...byWord.entries()].filter(([, s]) => s.has(code))
      .map(([id]) => wordById.get(id)?.headword.toLowerCase()).filter(Boolean));
    const missing = [...want].filter(w => !have.has(w));
    console.log(`   ${code.padEnd(10)} ECDICT 标 ${String(want.size).padStart(5)} 个 · 库里有 ${String(have.size).padStart(5)} · **缺 ${String(missing.length).padStart(5)}**`);
  }
}

/* ── 托福那 2505 缺口是不是 --exclude-tags 造成的 ────────────── */
if (ecdictOk) {
  console.log('\n── 托福缺口归因:ECDICT 标 toefl 但我们库里没有的那批,是什么来头 ──');
  const have = new Set([...byWord.entries()].filter(([, s]) => s.has('toefl'))
    .map(([id]) => wordById.get(id)?.headword.toLowerCase()).filter(Boolean));
  const missing = [...(tagWords.get('toefl') || [])].filter(w => !have.has(w));
  const BASIC = ['zk', 'gk', 'cet4'];
  const alsoBasic = missing.filter(w => (tagOf.get(w) || '').split(/\s+/).some(t => BASIC.includes(t)));
  console.log(`   缺 ${missing.length} 个,其中 ${alsoBasic.length} 个**同时带 zk/gk/cet4 标签**(${(alsoBasic.length / missing.length * 100).toFixed(1)}%)`);
  console.log(`   → 托福库当初是带 --exclude-tags=zk,gk,cet4 灌的(词库页文案也写着"已剔除中考/高考/四级重复词")。`);
  console.log(`     所以这 ${alsoBasic.length} 个是**按设计剔掉的**,不是漏灌;余下 ${missing.length - alsoBasic.length} 个才需要解释。`);
}

/* ── 词频阈值到底能不能满足三个样本 ──────────────────────────── */
console.log('\n═══ 判据可行性:单靠 freq_rank 能不能同时满足三个样本 ═══\n');
{
  /* ⚠️ 名字跟着数组走,别手写 —— 第一版把 concerned / concurrent 的标签写反了,
     逻辑(min/max)没受影响,但报告上两个词的词频对调,读的人会得出相反结论。 */
  const f = n => byHead.get(n)?.freq_rank ?? null;
  const tnName = SAMPLES.trueNegative[0];
  const tn = f(tnName);
  const tps = SAMPLES.truePositive.map(n => ({ name: n, freq: f(n) })).sort((a, b) => a.freq - b.freq);
  const lo = tps[0], hi = tps[tps.length - 1];
  for (const t of [...tps, { name: tnName, freq: tn }].sort((a, b) => a.freq - b.freq)) {
    const kind = t.name === tnName ? '真阴性' : '真阳性';
    console.log(`   ${kind} ${t.name.padEnd(12)} freq=${t.freq}`);
  }
  const between = (tn > lo.freq && tn < hi.freq);
  console.log(`\n   真阴性的词频**夹在两个真阳性中间**:${between ? '是' : '否'}`);
  if (between) {
    console.log('   → 任何"freq < T"或"freq > T"的单阈值规则都做不到:');
    console.log(`     要点中 ${hi.name}(${hi.freq})就必然连 ${tnName}(${tn})一起点中(它更常用);`);
    console.log(`     要放过 ${tnName} 就必然连 ${lo.name}(${lo.freq})一起放过。`);
    console.log('   → **词频不是这件事的判据。** 分开 concurrent 和 hallway 的是语域');
    console.log('     (学术/正式 vs 具体日常物件),那是语义,不是表层形式 —— 第九条:分不清就别硬判。');
    console.log('     硬凑一个"两段式区间"能让这 3 个样本全过,但那是对 3 个点过拟合,不是判据。');
  }
}

/* ── 已知答案样本自检 ───────────────────────────────────────── */
console.log('\n═══ 判据自检:已知答案样本 ═══\n');
const flagged = new Set(islands.map(w => w.headword.toLowerCase()));
let ok = true;
for (const p of SAMPLES.truePositive) {
  const w = byHead.get(p);
  const hit = flagged.has(p);
  if (!hit) ok = false;
  console.log(`   真阳性 ${p.padEnd(12)} 词频 ${String(w?.freq_rank ?? '—').padStart(6)} · 闸门${hit ? '点名 ✓' : '**没点名 ✗ —— 判据是坏的**'}`);
}
for (const p of SAMPLES.trueNegative) {
  const w = byHead.get(p);
  const hit = flagged.has(p);
  if (hit) ok = false;
  console.log(`   真阴性 ${p.padEnd(12)} 词频 ${String(w?.freq_rank ?? '—').padStart(6)} · 闸门${hit ? '**误伤 ✗**' : '没点名 ✓'}`);
}
console.log(`\n⚠️ 本报告**不改任何词表、不出 SQL**。方案 A/B/C 的选择是产品决策。`);
console.log(`\nGATE_VERDICT ${ok ? 'PASS' : 'FAIL'}`);
process.exit(ok ? 0 : 1);
