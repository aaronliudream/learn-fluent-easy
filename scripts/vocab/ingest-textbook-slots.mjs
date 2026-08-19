/**
 * 槽位批(元变量 + 斜杠变体)的 ingest —— **只读库 + 出本地文件**。
 *
 * 来源:`textbook-excluded.json` 里当初排除的两类:
 *   · 元变量 50 个(drive sb. crazy / try one's best)—— 闸门已支持槽位,现在能做
 *   · 斜杠择一 3 个 —— 按 Aaron ③ **拆成变体**(be/get ready → be ready + get ready)
 *
 * ⚠️ 去重:`lend (sb) a hand` 与 `lend sb a hand` 去掉括号后是同一条,**只留一条**。
 *    不去重的话库里会有两个词条、同一个意思,用户在词表里看到两遍。
 *
 * ⚠️ 屈折表照旧要含**短语的每个组成词** + 不规则动词补丁(be 缺 are/am/were)。
 *    ⚠️ 槽位词(sb/sth/one's/oneself/doing/do)**不进屈折表** —— 它们不是真实词,
 *       塞进去等于给闸门喂一个不存在的词的变形。
 *
 * 用法:node scripts/vocab/ingest-textbook-slots.mjs
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv, requireKeys } from './env.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const DATA = path.join(HERE, 'data');

const ex = JSON.parse(readFileSync(path.join(DATA, 'textbook-excluded.json'), 'utf8'));

/* ── 斜杠拆变体 ── */
const variants = [];
for (const w of ex.斜杠择一.词) {
  let out = [[]];
  for (const tok of w.split(/\s+/)) {
    out = tok.includes('/')
      ? out.flatMap(o => tok.split('/').map(a => [...o, a]))
      : out.map(o => [...o, tok]);
  }
  variants.push(...out.map(o => o.join(' ')));
}

/* ── 元变量去重(按去掉括号/句点后的形态)── */
const key = w => w.replace(/[().]/g, '').replace(/\s+/g, ' ').trim();
const seen = new Map(); const dupes = [];
for (const w of ex.元变量.词) {
  const k = key(w);
  if (seen.has(k)) dupes.push([w, seen.get(k)]); else seen.set(k, w);
}
const metas = ex.元变量.词.filter(w => !dupes.some(d => d[0] === w));
const batch = [...metas, ...variants];

/* ── 难度档:按这个词在教材里的最低年级 ── */
const ENV = loadEnv(REPO, { quiet: true });
requireKeys(ENV, ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY']);
const H = { apikey: ENV.VITE_SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${ENV.VITE_SUPABASE_PUBLISHABLE_KEY}` };
const paged = async q => { const o = []; for (let f = 0; ; f += 1000) {
  const r = await fetch(`${ENV.VITE_SUPABASE_URL}/rest/v1/${q}&offset=${f}&limit=1000`, { headers: H });
  if (!r.ok) throw new Error(`${r.status}: ${(await r.text()).slice(0, 160)}`);
  const j = await r.json(); o.push(...j); if (j.length < 1000) return o; } };

const jv = await paged('junior_vocab?select=word,grade');
const grades = new Map();
for (const r of jv) {
  if (r.grade < 7 || r.grade > 12) continue;
  const w = String(r.word).trim().toLowerCase();
  grades.set(w, Math.min(grades.get(w) ?? 99, r.grade));
}
/* 斜杠变体在 junior_vocab 里不存在(那里存的是 `be/get ready`),
   所以按**它的原始条目**取年级 —— 不然会全落到默认档。 */
const gradeOf = w => {
  if (grades.has(w)) return grades.get(w);
  for (const [orig, g] of grades) {
    if (!orig.includes('/')) continue;
    let out = [[]];
    for (const tok of orig.split(/\s+/)) {
      out = tok.includes('/') ? out.flatMap(o => tok.split('/').map(a => [...o, a])) : out.map(o => [...o, tok]);
    }
    if (out.map(o => o.join(' ')).includes(w)) return g;
  }
  return 9;
};
const cefrOf = w => gradeOf(w) <= 9 ? 'A2' : 'B1';

/* ── 屈折表 ── */
const EX_PATH = path.join(DATA, 'ecdict-exchange.json');
if (!existsSync(EX_PATH)) { console.error(`x 缺 ${EX_PATH},建不出含不规则形的表,停`); process.exit(2); }
const EXCHANGE = JSON.parse(readFileSync(EX_PATH, 'utf8'));
const IRREGULAR = { be: ['am', 'are', 'were', 'is', 'was', 'been', 'being'],
  do: ['does', 'did', 'done', 'doing'], have: ['has', 'had', 'having'] };
/** 槽位词不是真实词,不进表 */
const SLOT = /^(sb|sth|sw|one's|sb's|sth's|oneself|doing|do)$/;
const formsFor = w => {
  const base = EXCHANGE[w] || [];
  return IRREGULAR[w] ? [...new Set([...base, ...IRREGULAR[w]])] : base;
};
const inflections = {};
let comp = 0;
for (const w of batch) {
  for (const raw of w.split(/\s+/)) {
    const part = raw.toLowerCase().replace(/[^a-z']/g, '');
    if (!part || SLOT.test(part)) continue;
    if (inflections[part]) continue;
    const f = formsFor(part);
    if (f.length) { inflections[part] = f; comp++; }
  }
}

const rows = batch.map(w => ({ headword: w, cefr: cefrOf(w) })).sort((a, b) => a.headword.localeCompare(b.headword));
mkdirSync(DATA, { recursive: true });
writeFileSync(path.join(DATA, 'textbookslots.csv'),
  ['headword,pos,freq_rank,cefr', ...rows.map(r => `${r.headword},,,${r.cefr}`)].join('\n') + '\n', 'utf8');
writeFileSync(path.join(DATA, 'textbookslots-inflections.json'), JSON.stringify(inflections, null, 0), 'utf8');

console.log(`元变量 ${ex.元变量.词.length} → 去重后 ${metas.length}(去掉 ${dupes.map(d => d[0]).join(', ') || '无'})`);
console.log(`斜杠 ${ex.斜杠择一.词.length} → 拆出 ${variants.length}:${variants.join(' | ')}`);
console.log(`本批合计 ${batch.length}`);
console.log(`屈折表 ${Object.keys(inflections).length} key(组成词 ${comp};槽位词已排除)`);
console.log(`cefr:${JSON.stringify(rows.reduce((a, r) => (a[r.cefr] = (a[r.cefr] || 0) + 1, a), {}))}`);
console.log(`→ data/textbookslots.csv · textbookslots-inflections.json`);
