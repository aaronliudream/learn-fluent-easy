/**
 * 用 **anon 只读** 逐词比对:库内现值 vs 裁决清单。
 *
 * 由来:sense_fix.sql 跑出两条 false,需要分清"validate 误报"还是"UPDATE 真漏"。
 * 只有逐词比对能回答 —— 计数对不上时,计数本身说明不了是哪一边错。
 *
 * ⚠️ 只读:用 VITE_SUPABASE_PUBLISHABLE_KEY,连写的能力都没有。
 * ⚠️ PostgREST 单次最多 1000 行,一律分批 in()。
 *
 *   node scripts/vocab/verify-sense-fix-db.mjs
 * 末行 DB_VERIFY_VERDICT 便于取判定(别用管道,会吞退出码)。
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SPEC } from './spec.mjs';
import { DATA, ENV, loadWordPool } from './llm.mjs';

const BANK = 'toefl';
const SUPA = ENV.VITE_SUPABASE_URL, ANON = ENV.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!SUPA || !ANON) { process.stderr.write('缺 VITE_SUPABASE_URL / PUBLISHABLE_KEY\n'); process.exit(1); }

const cache = JSON.parse(readFileSync(path.join(DATA, 'generated', `${BANK}-sense-fix.json`), 'utf8'));
const baseline = JSON.parse(readFileSync(path.join(DATA, `${BANK}-sense-fix-baseline.json`), 'utf8'));
const manual = JSON.parse(readFileSync(path.join(DATA, 'sense-fix-manual.json'), 'utf8'));

/* 按裁决算出**每个词的期望值** —— 这是唯一权威,不看 cache 的中间态。 */
const expect = new Map();
for (const hw of Object.keys(baseline)) expect.set(hw, baseline[hw]);          // 默认:基线(=退回态)
for (const [hw, v] of Object.entries(cache)) if (!v.skip && v.def_zh) expect.set(hw, v.def_zh);
for (const r of manual.revert) expect.set(r.headword, baseline[r.headword]);   // revert 覆盖
for (const f of manual.fix) {
  const first = String(baseline[f.headword]).split(SPEC.defZh.sep)[0].trim();
  expect.set(f.headword, `${first}${SPEC.defZh.sep}${f.second}`);
}
for (const s of manual.set ?? []) expect.set(s.headword, s.def_zh);
// fagot 整词移除,def_zh 应为 NULL,不参与比对
expect.delete('fagot');

const words = loadWordPool(BANK);
const byHw = new Map(words.map(w => [w.headword.toLowerCase(), w]));
const targets = [...expect.keys()].filter(h => byHw.has(h.toLowerCase()));

async function fetchDefs(headwords) {
  const out = new Map();
  for (let i = 0; i < headwords.length; i += 100) {
    const batch = headwords.slice(i, i + 100);
    const url = new URL(`${SUPA}/rest/v1/vocab_words`);
    url.searchParams.set('select', 'headword,def_zh');
    url.searchParams.set('headword', `in.(${batch.map(h => `"${h}"`).join(',')})`);
    const res = await fetch(url, { headers: { apikey: ANON, Authorization: `Bearer ${ANON}` } });
    if (!res.ok) throw new Error(`REST HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
    for (const r of await res.json()) out.set(String(r.headword).toLowerCase(), r.def_zh);
  }
  return out;
}

const live = await fetchDefs(targets);
const diffs = [];
let missingRow = 0;
for (const hw of targets) {
  const want = expect.get(hw);
  const got = live.get(hw.toLowerCase());
  if (got === undefined) { missingRow++; continue; }
  if (String(got).trim() !== String(want).trim()) diffs.push({ hw, want, got });
}

process.stdout.write(`\n逐词比对 ${targets.length} 词(anon 只读)\n`);
process.stdout.write(`  库里查不到的行:${missingRow}\n`);
process.stdout.write(`  与裁决不一致的:${diffs.length}\n`);
diffs.slice(0, 30).forEach(d => process.stdout.write(`    ✗ ${d.hw}  库内「${d.got}」  应为「${d.want}」\n`));

/* 顺带核对那两条 false 的真实数值 —— 把"判据错"和"数据错"分开说清楚 */
const doubleInBatch = targets.filter(h => String(expect.get(h)).includes(SPEC.defZh.sep)).length;
process.stdout.write(`\n两条 false 的成因核对:\n`);
process.stdout.write(`  本批 ${targets.length} 词里,裁决后应含分号的只有 ${doubleInBatch} 个\n`);
process.stdout.write(`    → 原 SQL 用「AND def_zh LIKE '%${SPEC.defZh.sep}%' = ${targets.length}」当判据,\n`);
process.stdout.write(`      monochrome 的新值「单色」没有分号,数出来必然少 1。判据错,不是数据错。\n`);
process.stdout.write(`  fagot 移除后 def_zh 非空的词数应为 4470,原 SQL 写的 4471 是忘了改基准。\n`);

process.stdout.write(`\nDB_VERIFY_VERDICT: ${diffs.length === 0 && missingRow === 0 ? 'PASS' : 'FAIL'}\n`);
process.exit(diffs.length === 0 && missingRow === 0 ? 0 : 1);
