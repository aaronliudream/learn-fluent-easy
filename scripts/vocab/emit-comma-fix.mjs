/**
 * def_zh 逗号分隔符 · 按 Aaron 裁决出修正 SQL(43 条)。
 *
 * ⚠️ **不照我原来的"只留第一个"建议** —— 那会造出一批 1 字义项(推/拖/砍),
 *    违反规格里"每义项 2-8 字"的下限。Aaron 的修正版把这批改成双字词典体。
 *
 * 五类处理:
 *   ① 改双字词典体 7 条:shove 猛推 / chunk 大块 / tow 拖曳 / incense 熏香 /
 *                        hew 砍伐 / indite 撰写 / oxen 公牛
 *   ② 留第二义 3 条:fruitless 徒劳的 / reclamation 复垦 / capacious 宽敞的
 *   ③ hominid → 人科动物
 *   ④ 分号逗号混用 2 条,保双义但规范分隔:lug 搬运；拖曳 / quail 鹌鹑；胆怯
 *   ⑤ 其余 30 条留第一义
 *
 * 出件前对每条跑 defZhShapeProblem —— 新值同样要过体裁闸(含刚加的"禁逗号"),
 * 不因为是人裁的就免检。
 *
 *   node scripts/vocab/emit-comma-fix.mjs
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defZhShapeProblem } from './gates.mjs';
import { SPEC } from './spec.mjs';
import { DATA, loadWordPool, q, writeSql, writeReview } from './llm.mjs';

const BANK = 'toefl';

/** Aaron 逐条裁决。未列出的走"留第一义"。 */
const EXPLICIT = {
  // ① 改双字词典体(留第一义会变 1 字,违反 2-8 字下限)
  shove: '猛推', chunk: '大块', tow: '拖曳', incense: '熏香',
  hew: '砍伐', indite: '撰写', oxen: '公牛',
  // ② 留第二义
  fruitless: '徒劳的', reclamation: '复垦', capacious: '宽敞的',
  // ③ 单独裁
  hominid: '人科动物',
  // ④ 分号逗号混用:保双义,分隔符规范成全角分号
  lug: `搬运${SPEC.defZh.sep}拖曳`, quail: `鹌鹑${SPEC.defZh.sep}胆怯`,
};

const words = loadWordPool(BANK);
const comma = words.filter(w => /[，,、]/.test(w.def_zh));

const rows = comma.map(w => {
  const to = EXPLICIT[w.headword] ?? w.def_zh.split(/[；，,、]/)[0].trim();
  const kind = EXPLICIT[w.headword]
    ? (to.includes(SPEC.defZh.sep) ? '混用→规范分隔' : (w.def_zh.split(/[；，,、]/)[0].trim() === to ? '留第一义' : '人裁新值'))
    : '留第一义';
  return { headword: w.headword, from: w.def_zh, to, kind, fail: defZhShapeProblem(to) };
});

const bad = rows.filter(r => r.fail);
process.stdout.write(`逗号条目 ${rows.length} 条,人裁明确 ${Object.keys(EXPLICIT).length} 条\n`);
if (bad.length) {
  process.stdout.write(`\n✗ 新值未过体裁闸 ${bad.length} 条:\n`);
  bad.forEach(r => process.stdout.write(`   ${r.headword}:「${r.to}」 ${r.fail}\n`));
  process.stdout.write('\nCOMMA_FIX_VERDICT: FAIL\n');
  process.exit(1);
}

const vals = rows.map(r => `  (${q(r.headword.toLowerCase())}, ${q(r.to)})`).join(',\n');
writeSql(`vocab_${BANK}_comma_fix.sql`, `-- def_zh 逗号分隔符修正 —— ${rows.length} 条
--
-- 问题:这些条目用**逗号/顿号**当义项分隔符,而规格里分隔符只能是全角分号。
-- 后果不是排版,是**绕过体裁闸**:「单色，单色图像」在闸门眼里是一个 7 字义项,
-- 「≤${SPEC.defZh.maxSenses} 义项」那条约束形同虚设,双义统计也偏低,
-- 前端 optionText 只按分号切,选项里会整个显示「推，挤」。
-- 闸门已修(逗号一律拒)。本文件清存量。
--
-- ⚠️ 处理方式按 Aaron 裁决,**不是"一律只留第一个"** ——
--    那会造出一批 1 字义项(推 / 拖 / 砍),违反"每义项 ${SPEC.defZh.minChars}-${SPEC.defZh.maxChars} 字"的下限。
--    改双字词典体 ${rows.filter(r => r.kind === '人裁新值').length} 条 / 混用规范分隔 ${rows.filter(r => r.kind === '混用→规范分隔').length} 条 / 留第一义 ${rows.filter(r => r.kind === '留第一义').length} 条。
--
-- 每条新值都过了 defZhShapeProblem(含新加的"禁逗号"),人裁条目不免检。
-- 幂等:按 lower(headword) UPDATE。⚠️ 由 Aaron 执行。
--
-- ⚠️ **BEFORE 那行会显示 42 不是 43,这是对的**:monochrome 原值「单色，单色图像」
--    已被上一段 sense_fix 改成「单色」,不再含逗号。本文件里它那条是 no-op
--    (留第一义算出来还是「单色」)。清单仍按 43 条走,是为了让这个文件
--    在任何执行顺序下都自洽 —— 先跑哪个都得到同样的终态。

BEGIN;

SELECT 'BEFORE' AS stage,
       count(*) FILTER (WHERE def_zh ~ '[，,、]') AS with_comma
  FROM vocab_words WHERE def_zh IS NOT NULL;

UPDATE vocab_words w
   SET def_zh = v.def_zh, updated_at = now()
  FROM (VALUES
${vals}
  ) AS v(headword, def_zh)
 WHERE lower(w.headword) = v.headword;

SELECT 'AFTER' AS stage,
       count(*) FILTER (WHERE def_zh ~ '[，,、]') AS with_comma
  FROM vocab_words WHERE def_zh IS NOT NULL;

-- ── count-validate:四行都必须是 t,否则 ROLLBACK ──
SELECT '全库 def_zh 不再含逗号/顿号' AS expect,
       NOT EXISTS (SELECT 1 FROM vocab_words WHERE def_zh ~ '[，,、]') AS ok
UNION ALL
SELECT '没有义项短于 ${SPEC.defZh.minChars} 字',
       NOT EXISTS (
         SELECT 1 FROM vocab_words, unnest(string_to_array(def_zh, '${SPEC.defZh.sep}')) AS seg
          WHERE def_zh IS NOT NULL AND char_length(btrim(seg)) < ${SPEC.defZh.minChars}
       )
UNION ALL
SELECT '没有义项超过 ${SPEC.defZh.maxChars} 字',
       NOT EXISTS (
         SELECT 1 FROM vocab_words, unnest(string_to_array(def_zh, '${SPEC.defZh.sep}')) AS seg
          WHERE def_zh IS NOT NULL AND char_length(btrim(seg)) > ${SPEC.defZh.maxChars}
       )
UNION ALL
SELECT '本批 ${rows.length} 词都已是新值',
       (SELECT count(*) FROM vocab_words
         WHERE lower(headword) IN (${rows.map(r => q(r.headword.toLowerCase())).join(', ')})
           AND def_zh !~ '[，,、]') = ${rows.length};

COMMIT;
`);

writeReview(`vocab_${BANK}_comma_fix.md`, `# def_zh 逗号分隔符修正 · 对照件(${rows.length} 条)

按 Aaron 裁决执行,**不是**我原来建议的"一律只留第一个" ——
那会造出一批 1 字义项(推 / 拖 / 砍),违反"每义项 ${SPEC.defZh.minChars}-${SPEC.defZh.maxChars} 字"的下限。
这一点是裁决里纠正我的,记档。

每条新值都过了 \`defZhShapeProblem\`(含新加的"禁逗号"),人裁条目不免检:**0 条不合格**。

| 词 | 改前 | 改后 | 处理 |
| --- | --- | --- | --- |
${rows.map(r => `| ${r.headword} | ${r.from} | **${r.to}** | ${r.kind} |`).join('\n')}
`);

process.stdout.write('\nCOMMA_FIX_VERDICT: PASS\n');
