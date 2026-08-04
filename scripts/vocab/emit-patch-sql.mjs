/**
 * 出 patch SQL:把本地已定稿内容与**线上实际值**逐字段对比,只为真正有差异的字段出 UPDATE。
 *
 * 为什么不直接重出全量 content SQL:
 *   全量 SQL 会把 198 词 594 句全部覆盖一遍。虽然结果一样,但
 *   ① 看不出这轮到底改了什么,审起来等于重审;
 *   ② 594 条 example UPSERT 里只有 3 条真变了,其余全是空转。
 *   patch 只动真变了的行,diff 一目了然。
 *
 * ⚠️ 差异以**线上值为基准**现查现比,不靠本地记忆猜"我改过哪些"。
 *
 * 用法:node scripts/vocab/emit-patch-sql.mjs --bank=toefl
 * 产出:SQLAA/vocab_<bank>_content_patch1.sql
 *
 * ⚠️ 只读库 + 产出文件,绝不写库。
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv, requireKeys } from './env.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const GEN = path.join(HERE, 'data', 'generated');

const arg = (k, d) => process.argv.find(a => a.startsWith(`--${k}=`))?.split('=').slice(1).join('=') ?? d;
const BANK = arg('bank', 'toefl');

const ENV = loadEnv(REPO);
requireKeys(ENV, ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY']);
const H = { apikey: ENV.VITE_SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${ENV.VITE_SUPABASE_PUBLISHABLE_KEY}` };

async function paged(q) {
  const out = [];
  for (let o = 0; ; o += 1000) {
    const r = await fetch(`${ENV.VITE_SUPABASE_URL}/rest/v1/${q}&offset=${o}&limit=1000`, { headers: H });
    if (!r.ok) throw new Error(`REST ${r.status}: ${(await r.text()).slice(0, 200)}`);
    const j = await r.json();
    out.push(...j);
    if (j.length < 1000) return out;
  }
}

const esc = s => String(s ?? '').replace(/'/g, "''");
const q = s => (s === null || s === undefined || s === '') ? 'NULL' : `'${esc(s)}'`;

async function main() {
  const local = JSON.parse(readFileSync(path.join(GEN, `${BANK}-content.json`), 'utf8'));

  const dbWords = await paged('vocab_words?select=id,headword,def_zh,def_en,ipa');
  const dbEx = await paged('vocab_examples?select=id,word_id,sort_order,collocation,sentence,translation_zh,scene');
  const byId = new Map(dbWords.map(w => [w.id, w]));

  // ── 释义差异 ──
  const defZhChanges = [], defEnChanges = [];
  for (const w of dbWords) {
    const L = local[w.headword.toLowerCase()];
    if (!L) continue;
    if (L.def_zh !== w.def_zh) defZhChanges.push({ headword: w.headword, from: w.def_zh, to: L.def_zh });
    if (L.def_en !== w.def_en) defEnChanges.push({ headword: w.headword, from: w.def_en, to: L.def_en });
  }

  // ── 例句差异 ──
  const exChanges = [];
  for (const e of dbEx) {
    const w = byId.get(e.word_id);
    if (!w) continue;
    const L = local[w.headword.toLowerCase()];
    const le = L?.examples?.[e.sort_order - 1];
    if (!le) continue;
    if (le.collocation !== e.collocation || le.sentence !== e.sentence
      || le.translation_zh !== e.translation_zh || le.scene !== e.scene) {
      exChanges.push({ headword: w.headword, sort_order: e.sort_order, from: e, to: le });
    }
  }

  process.stdout.write(`· 与线上实际值对比:def_zh 变 ${defZhChanges.length} · def_en 变 ${defEnChanges.length} · 例句变 ${exChanges.length}\n`);
  if (!defZhChanges.length && !defEnChanges.length && !exChanges.length) {
    process.stdout.write('· 与线上完全一致,无需 patch\n');
    return;
  }

  const words = [...new Set([...defZhChanges, ...defEnChanges].map(c => c.headword))];
  const wordRows = words.map(h => {
    const L = local[h.toLowerCase()];
    return `  (${q(h.toLowerCase())}, ${q(L.def_zh)}, ${q(L.def_en)})`;
  }).join(',\n');

  const exRows = exChanges.map(c =>
    `  (${q(c.headword.toLowerCase())}, ${c.sort_order}, ${q(c.to.collocation)}, ${q(c.to.sentence)}, ${q(c.to.translation_zh)}, ${q(c.to.scene)})`
  ).join(',\n');

  const sql = `-- 词汇内容 patch1:第三轮审核打回的定点修复
--
-- 本 patch 只动**与线上实际值真有差异**的字段(现查 DB 逐字段比对得出),
-- 不是重跑全量 —— 594 条例句里只有 ${exChanges.length} 条变了,其余一字不动。
--
-- 本轮改了什么:
--   ① def_zh ${defZhChanges.length} 条:清理"短解释句"残留。
--      新增检测规则:释义命中解释性标记词(某物/某人/的行为/相关的/一种/通常/尤其…)
--      即判不合格,规则已并入形状校验固化(gates.mjs defZhShapeProblem)。
--      模型三次给不出合格短释义的,由人工按词典体裁改写,逐条记在
--      scripts/vocab/data/defzh-manual.json 供复核。
--   ② def_en ${defEnChanges.length} 条:随 nonetheless 重生成一并更新。
--   ③ 例句 ${exChanges.length} 条:nonetheless 整词重生成 —— 原先三条 collocation 被写成整句,
--      且例3"decided to go out; nonetheless, I went for a walk"前后没有真转折。
--      新增功能词规格(pos 全为 conj./prep./adv. 时触发):collocation 给 2-5 词用法模式、
--      禁整句;转折词例句前后须真的构成转折。
--   ⚠️ 其余 197 词的例句**一字未动**。
--
-- ⚠️ 由 Aaron 执行。脚本本身从不写库。

BEGIN;

SELECT 'BEFORE' AS stage,
       (SELECT count(*) FROM vocab_words WHERE def_zh IS NOT NULL) AS words_with_def,
       (SELECT count(*) FROM vocab_examples) AS examples;

${words.length ? `-- ① 释义(def_zh / def_en)
UPDATE vocab_words w
   SET def_zh = v.def_zh,
       def_en = v.def_en,
       updated_at = now()
  FROM (VALUES
${wordRows}
  ) AS v(headword, def_zh, def_en)
 WHERE lower(w.headword) = v.headword;
` : '-- ① 释义:本批无变化\n'}
${exChanges.length ? `-- ② 例句(只有下面这 ${exChanges.length} 条)
INSERT INTO vocab_examples (word_id, sort_order, collocation, sentence, translation_zh, scene)
SELECT w.id, v.sort_order, v.collocation, v.sentence, v.translation_zh, v.scene
  FROM (VALUES
${exRows}
  ) AS v(headword, sort_order, collocation, sentence, translation_zh, scene)
  JOIN vocab_words w ON lower(w.headword) = v.headword
ON CONFLICT (word_id, sort_order) DO UPDATE
  SET collocation    = EXCLUDED.collocation,
      sentence       = EXCLUDED.sentence,
      translation_zh = EXCLUDED.translation_zh,
      scene          = EXCLUDED.scene;
` : '-- ② 例句:本批无变化\n'}
SELECT 'AFTER' AS stage,
       (SELECT count(*) FROM vocab_words WHERE def_zh IS NOT NULL) AS words_with_def,
       (SELECT count(*) FROM vocab_examples) AS examples;

-- ── count-validate:五行都必须是 t,否则 ROLLBACK ──
-- patch 不该改变行数,只改内容。
SELECT 'words_with_def 仍是 198' AS expect,
       (SELECT count(*) FROM vocab_words WHERE def_zh IS NOT NULL) = 198 AS ok
UNION ALL
SELECT 'examples 仍是 594',
       (SELECT count(*) FROM vocab_examples) = 594
UNION ALL
-- ⚠️ 判"是不是整句"只能看**字母后面的句点**,不能看有没有点号。
--    裁决指定的模式本身就带省略号("..., nonetheless, ..."),
--    用 LIKE '%.%' 会把合规模式判成违规,这条 validate 会直接让你 ROLLBACK。
SELECT 'nonetheless 三条 collocation 都是短模式(<=5 词且不是句子)',
       NOT EXISTS (
         SELECT 1 FROM vocab_examples e
           JOIN vocab_words w ON w.id = e.word_id AND lower(w.headword) = 'nonetheless'
          WHERE e.collocation ~ '[A-Za-z]\\.'          -- 字母后接句点 = 写成句子了
             OR array_length(string_to_array(btrim(e.collocation), ' '), 1) > 5
       )
UNION ALL
SELECT '没有 def_zh 写成句子(不含句号)',
       NOT EXISTS (SELECT 1 FROM vocab_words WHERE def_zh LIKE '%。%')
UNION ALL
SELECT '每条例句都有合法 scene',
       NOT EXISTS (
         SELECT 1 FROM vocab_examples
          WHERE scene IS NULL
             OR scene NOT IN ('academic','news','daily_life','work','science_tech',
                              'health','environment','education','travel','culture')
       );

COMMIT;
`;

  const out = path.join(REPO, 'SQLAA', `vocab_${BANK}_content_patch1.sql`);
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, sql, 'utf8');
  process.stdout.write(`· patch SQL → SQLAA/vocab_${BANK}_content_patch1.sql\n`);

  // 变更明细,供审
  const md = `# 内容 patch1 · 变更明细(与线上实际值对比得出)

> 只列**真有差异**的字段。其余 197 词的例句一字未动。

## def_zh(${defZhChanges.length} 条)

| 词 | 线上现值 | → | 新值 |
| --- | --- | :-: | --- |
${defZhChanges.map(c => `| ${c.headword} | ${c.from} | → | **${c.to}** |`).join('\n')}

## def_en(${defEnChanges.length} 条)

| 词 | 线上现值 | → | 新值 |
| --- | --- | :-: | --- |
${defEnChanges.map(c => `| ${c.headword} | ${c.from} | → | **${c.to}** |`).join('\n') || '| — | — | | — |'}

## 例句(${exChanges.length} 条)

${exChanges.map(c => `### ${c.headword} 例${c.sort_order}

| | 线上现值 | 新值 |
| --- | --- | --- |
| collocation | ${c.from.collocation} | **${c.to.collocation}** |
| sentence | ${c.from.sentence} | **${c.to.sentence}** |
| translation | ${c.from.translation_zh} | **${c.to.translation_zh}** |
| scene | ${c.from.scene} | ${c.to.scene} |
`).join('\n') || '(无)'}
`;
  const mdOut = path.join(REPO, 'REVIEWAA', `vocab_${BANK}_patch1_changes.md`);
  writeFileSync(mdOut, md, 'utf8');
  process.stdout.write(`· 变更明细 → REVIEWAA/vocab_${BANK}_patch1_changes.md\n`);
}

main().catch(e => { process.stderr.write(`✗ ${e.stack || e.message}\n`); process.exit(1); });
