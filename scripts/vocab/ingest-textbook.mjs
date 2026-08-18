/**
 * 教材词表(junior_vocab)缺口的 ingest —— **只读库 + 出本地文件,不写库、不出 SQL**。
 *
 * 产出:
 *   data/textbook.csv               headword,pos,freq_rank,cefr
 *   data/textbook-inflections.json  屈折表(⚠️ 含短语的**每个组成词**,见下)
 *   data/textbook-excluded.json     本次排除的条目 + 原因(留痕,别让它们悄悄消失)
 *
 * ── ⚠️ 取词表的坑 ───────────────────────────────────────────────
 * junior_vocab 同时装着初中和高中,**必须按 grade 过滤,不能按 publisher**:
 *     初中 grade 7–9   publisher = junior / junior_fltrp
 *     高中 grade 10–12 publisher = pep / fltrp / sufe
 * `pep` 在这张表里指的是**高中人教**,不是初中人教。
 * 已用 grade×publisher 交叉表实证,不是采信描述。
 *
 * ── ⚠️ 屈折表必须含短语的组成词(这一批的核心) ──────────────────
 * `ingest-toefl.mjs` 是 `inflections[headword] = ...` —— 按 headword 建表。
 * 实测:现有 10 个 <bank>-inflections.json **短语 key 全是 0**,
 * 而 `take` / `give` 只在那几个把它们当 headword 的库里才有。
 * 轮到 `take care of` 这种短语词条,ECDICT 里根本没有这个条目,表里就是空的,
 * 于是 "Nurses **took** care of…" 匹配不上 —— 不规则形靠后缀规则推不出来。
 * 闸门允许屈折 ≠ 表里有 took。**表得自己建**:短语的每个组成词都要塞进去。
 *
 * ── ⚠️ cefr 必须显式给,不能让它从 freq_rank 推 ──────────────────
 * 短语在 ECDICT 里没有词频 → `cefrFor(null)` 一律返回 C1「低频学术词·正式语域」,
 * `look after` 会按学术语域出句子。按 grade 定档:7–9 → A2/B1,10–12 → B1/B2。
 *
 * 用法:node scripts/vocab/ingest-textbook.mjs
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv, requireKeys } from './env.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const DATA = path.join(HERE, 'data');

/* 本次**不做**的两类(Aaron 2026-08-18 定),原样留痕 */
const IS_TEMPLATE = w => /\.\.\.|…/.test(w);                       // 语法句型,归语法模块
const IS_META = w => /\bsb\b|\bsth\b|sb\.|sth\.|one's|sb's|oneself/.test(w);  // 元变量,单独 PR
const IS_SLASH = w => w.includes('/');                             // 择一变体,单独 PR
const IS_CLEAN = w => /^[a-z][a-z' -]*$/.test(w);

const ENV = loadEnv(REPO, { quiet: true });
requireKeys(ENV, ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY']);
const H = { apikey: ENV.VITE_SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${ENV.VITE_SUPABASE_PUBLISHABLE_KEY}` };
async function paged(q) {
  const out = [];
  for (let off = 0; ; off += 1000) {
    const r = await fetch(`${ENV.VITE_SUPABASE_URL}/rest/v1/${q}&offset=${off}&limit=1000`, { headers: H });
    if (!r.ok) throw new Error(`${q} → ${r.status}: ${(await r.text()).slice(0, 160)}`);
    const j = await r.json(); out.push(...j);
    if (j.length < 1000) return out;
  }
}

const norm = w => String(w).trim().toLowerCase();
const jv = await paged('junior_vocab?select=word,grade');
const have = new Set((await paged('vocab_words?select=headword')).map(w => norm(w.headword)));

/** headword -> 最低 grade(一个词可能出现在多个年级,取最低的定难度档) */
const grades = new Map();
for (const r of jv) {
  if (r.grade < 7 || r.grade > 12) continue;
  const w = norm(r.word);
  grades.set(w, Math.min(grades.get(w) ?? 99, r.grade));
}

const missing = [...grades.keys()].filter(w => !have.has(w));
const excluded = { 语法句型: [], 元变量: [], 斜杠择一: [], 杂项: [] };
const kept = [];
for (const w of missing) {
  if (IS_TEMPLATE(w)) { excluded.语法句型.push(w); continue; }
  if (IS_META(w)) { excluded.元变量.push(w); continue; }
  if (IS_SLASH(w)) { excluded.斜杠择一.push(w); continue; }
  if (!IS_CLEAN(w)) { excluded.杂项.push(w); continue; }
  kept.push(w);
}

/* ── ECDICT:单词的 pos / freq_rank / 屈折 ── */
const EX_PATH = path.join(DATA, 'ecdict-exchange.json');
if (!existsSync(EX_PATH)) {
  console.error(`x 缺 ${EX_PATH} —— 没有它就建不出含不规则形的屈折表,直接停。`);
  console.error('  ⚠️ 不产出一份"短语全靠后缀规则"的表:那会让 took/gave 全线匹配不上,');
  console.error('     而且要烧掉三次重试之后才看得见。');
  process.exit(2);
}
const EXCHANGE = JSON.parse(readFileSync(EX_PATH, 'utf8'));
const IDX_PATH = path.join(DATA, 'ecdict-index.json');
const POS_IDX = existsSync(IDX_PATH) ? JSON.parse(readFileSync(IDX_PATH, 'utf8')) : {};

/* freq_rank:从已在库的同名词拿不到(它们本来就不在库),只能从 ECDICT。
   这里只用来定档,不写进 CSV 的 freq_rank 以外的地方。 */
const freqRows = await paged('vocab_words?select=headword,freq_rank');   // 仅用于统计参考
void freqRows;

/** grade → cefr 档(Aaron 2026-08-18 定)。短语没有词频,只能按学段给。 */
function cefrFor(word, grade) {
  const junior = grade <= 9;
  if (/\s/.test(word)) return junior ? 'A2' : 'B1';     // 短语:按学段
  return junior ? 'B1' : 'B2';                          // 单词:同学段稍难一档
}

/**
 * ⚠️ ECDICT 的 exchange 表对几个最常用的不规则动词是**残缺的**,必须补。
 *    实测:`be` → ["was","is","been","being"] —— **缺 are / am / were**。
 *    后果是所有 `be + X` 短语(be fond of / be tired of / be used to / be native to)
 *    的例句写成 "are fond of" 时,g1 一律判"目标词缺席" —— 而句子完全正确。
 *    英语里最常用的动词,变形表缺了一半,这不是闸门的问题,是数据的问题。
 * ⚠️ 只补**确凿缺失的形态**,不塞任何"近似形" —— 一旦把不属于该词的形式塞进表,
 *    g1 就会放行本不该放行的句子,那就是自己给自己开后门。
 */
const IRREGULAR_SUPPLEMENT = {
  be: ['am', 'are', 'were', 'is', 'was', 'been', 'being'],
  do: ['does', 'did', 'done', 'doing'],
  have: ['has', 'had', 'having'],
};

/* ── 屈折表:短语要把**每个组成词**都塞进去 ── */
const inflections = {};
let phraseComp = 0;
const formsFor = w => {
  const base = EXCHANGE[w] || [];
  const sup = IRREGULAR_SUPPLEMENT[w];
  return sup ? [...new Set([...base, ...sup])] : base;
};
for (const w of kept) {
  const f = formsFor(w);
  if (f.length) inflections[w] = f;
  if (/\s/.test(w)) {
    for (const part of w.split(/\s+/)) {
      const pf = formsFor(part);
      if (pf.length && !inflections[part]) { inflections[part] = pf; phraseComp++; }
    }
  }
}

mkdirSync(DATA, { recursive: true });
const rows = kept.map(w => ({ headword: w, pos: (POS_IDX[w] || '').replace(/,/g, '/'), freq_rank: '', cefr: cefrFor(w, grades.get(w)) }));
rows.sort((a, b) => a.headword.localeCompare(b.headword));
writeFileSync(path.join(DATA, 'textbook.csv'),
  ['headword,pos,freq_rank,cefr', ...rows.map(r => `${r.headword},${r.pos},${r.freq_rank},${r.cefr}`)].join('\n') + '\n', 'utf8');
writeFileSync(path.join(DATA, 'textbook-inflections.json'), JSON.stringify(inflections, null, 0), 'utf8');
writeFileSync(path.join(DATA, 'textbook-excluded.json'), JSON.stringify({
  _note: '本次不生成的条目。⚠️ 留痕是为了将来查得到"为什么这些词没进库",别让它们静默消失。',
  语法句型: { 说明: '带槽位的句型,例句里字面串永远不会出现;归语法模块,不当词条', 词: excluded.语法句型 },
  元变量: { 说明: 'sb./sth./one\'s —— 真词汇高价值,单独 PR 做槽位匹配', 词: excluded.元变量 },
  斜杠择一: { 说明: '拆成变体,单独 PR', 词: excluded.斜杠择一 },
  杂项: { 说明: '缩写/整句/教材特定条目,无独立词汇价值', 词: excluded.杂项 },
}, null, 2), 'utf8');

const phrases = kept.filter(w => /\s/.test(w));
console.log(`junior_vocab grade 7–12 去重:${grades.size}`);
console.log(`其中库里没有内容的:${missing.length}`);
console.log(`本次生成:${kept.length}(单词 ${kept.length - phrases.length} · 短语 ${phrases.length})`);
console.log(`排除:${Object.entries(excluded).map(([k, v]) => `${k} ${v.length}`).join(' · ')}`);
console.log(`\n屈折表:${Object.keys(inflections).length} 个 key,其中**为短语补的组成词** ${phraseComp} 个`);
console.log(`cefr 分布:${JSON.stringify(rows.reduce((a, r) => (a[r.cefr] = (a[r.cefr] || 0) + 1, a), {}))}`);
console.log(`\n→ data/textbook.csv · textbook-inflections.json · textbook-excluded.json`);
