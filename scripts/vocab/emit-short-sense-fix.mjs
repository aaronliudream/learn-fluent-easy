/**
 * 短义项修正 SQL —— 只改 B 类 19 条(Aaron 裁决)。
 *
 * A 类 32 条**不动**:单字就是汉语规范词(化学元素/生物分类/解剖学名)。
 * 规格下限已从 2 放宽到 1(spec.mjs),所以它们不再算违规 ——
 * **改的是规格,不是内容**。
 *
 * ⚠️ 新值仍过 defZhShapeProblem(含刚补上的下限判据),人裁不免检。
 *
 *   node scripts/vocab/emit-short-sense-fix.mjs
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { defZhShapeProblem } from './gates.mjs';
import { SPEC } from './spec.mjs';
import { REPO, ENV, q, writeSql, writeReview } from './llm.mjs';

const SUPA = ENV.VITE_SUPABASE_URL, ANON = ENV.VITE_SUPABASE_PUBLISHABLE_KEY;

/** B 类 19 条:单字读起来像半个词,双字词典体更好。 */
const FIX = {
  tug: '拉拽；拖曳', slash: '砍劈；划破', gnaw: '啃咬', prod: '戳刺',
  wring: '拧绞；扭转', batter: '打击；揉捏', peck: '啄食；轻吻',
  squat: '蹲下；蹲坐', cavity: '空腔；洞穴', jug: '水壶；瓦罐',
  shaft: '轴杆；杆柄', stalk: '茎秆；叶柄', strand: '细线；一缕',
  strings: '细线；琴弦', hem: '边缘；褶边', arc: '弧线；弧形',
  ply: '层数；层次', deity: '神祇；神灵', trough: '水槽；食槽',
};

/* 出件前把新值过一遍闸 —— 人裁条目不免检 */
const bad = Object.entries(FIX).filter(([, v]) => defZhShapeProblem(v));
if (bad.length) {
  bad.forEach(([k, v]) => process.stderr.write(`✗ ${k}:「${v}」 ${defZhShapeProblem(v)}\n`));
  process.stderr.write('\nSHORT_FIX_VERDICT: FAIL\n');
  process.exit(1);
}

/* 只读拉当前值做对照件(翻页 —— PostgREST 1000 行硬顶) */
async function fetchAll() {
  const out = [];
  for (let offset = 0; ; offset += 1000) {
    const res = await fetch(
      `${SUPA}/rest/v1/vocab_words?select=headword,def_zh&def_zh=not.is.null&order=headword&offset=${offset}&limit=1000`,
      { headers: { apikey: ANON, Authorization: `Bearer ${ANON}` } });
    if (!res.ok) { process.stderr.write(`REST HTTP ${res.status}\n`); process.exit(1); }
    const page = await res.json();
    out.push(...page);
    if (page.length < 1000) return out;
  }
}
const live = new Map((await fetchAll()).map(r => [String(r.headword).toLowerCase(), r.def_zh]));
const rows = Object.entries(FIX).map(([hw, to]) => ({ hw, from: live.get(hw) ?? '(库里查不到)', to }));
const missing = rows.filter(r => r.from === '(库里查不到)');
if (missing.length) {
  missing.forEach(r => process.stderr.write(`✗ ${r.hw} 不在库里\n`));
  process.stderr.write('\nSHORT_FIX_VERDICT: FAIL\n');
  process.exit(1);
}

writeSql('vocab_toefl_short_sense_fix.sql', `-- 短义项修正 —— 只改 B 类 ${rows.length} 条
--
-- ⚠️ A 类 32 条**不动**:钙/氦/锌/酶/膜/腺/猿/龟 这些词的单字形
--    就是汉语里的规范词,硬凑两字只会造出「钙元素」这种注水词。
--    Aaron 裁决:**放宽规格**(义项字数下限 2 → 1),而不是改内容去迁就规格。
--    spec.mjs 已同步,体裁闸也补上了下限判据(与上限同源引用 SPEC)。
--
-- 本文件只处理 B 类:动词类的「拉；拖」「砍；划」这种单字读起来像半个词的。
-- 每条新值都过了 defZhShapeProblem(含新的下限判据),人裁不免检。
-- 幂等:按 lower(headword) UPDATE。⚠️ 由 Aaron 执行。

BEGIN;

SELECT 'BEFORE' AS stage,
       count(*) FILTER (WHERE def_zh IS NOT NULL) AS words_with_def
  FROM vocab_words;

UPDATE vocab_words w
   SET def_zh = v.def_zh, updated_at = now()
  FROM (VALUES
${rows.map(r => `  (${q(r.hw)}, ${q(r.to)})`).join(',\n')}
  ) AS v(headword, def_zh)
 WHERE lower(w.headword) = v.headword;

SELECT 'AFTER' AS stage,
       count(*) FILTER (WHERE def_zh IS NOT NULL) AS words_with_def
  FROM vocab_words;

-- ── count-validate:三行都必须是 t,否则 ROLLBACK ──
/* ⚠️ 判据用**逐词比对**,不用计数 —— 上一轮 sense_fix 就栽在计数式判据上
 *    (批内有例外时计数必然对不上)。 */
SELECT '本批 ${rows.length} 词逐词与裁决一致' AS expect,
       NOT EXISTS (
         SELECT 1 FROM (VALUES
${rows.map(r => `           (${q(r.hw)}, ${q(r.to)})`).join(',\n')}
         ) AS v(headword, def_zh)
         JOIN vocab_words w ON lower(w.headword) = v.headword
         WHERE w.def_zh IS DISTINCT FROM v.def_zh
       ) AS ok
UNION ALL
SELECT '本批没把任何词的 def_zh 弄丢',
       NOT EXISTS (SELECT 1 FROM vocab_words
                    WHERE lower(headword) IN (${rows.map(r => q(r.hw)).join(', ')})
                      AND def_zh IS NULL)
UNION ALL
SELECT '没有义项超 ${SPEC.defZh.maxChars} 字',
       NOT EXISTS (
         SELECT 1 FROM vocab_words, unnest(string_to_array(def_zh, '${SPEC.defZh.sep}')) AS seg
          WHERE def_zh IS NOT NULL AND char_length(btrim(seg)) > ${SPEC.defZh.maxChars}
       );

COMMIT;
`);

writeReview('vocab_toefl_short_sense_fix.md', `# 短义项修正 · 对照件(B 类 ${rows.length} 条)

A 类 32 条**不动** —— 采纳"单字就是规范词"的意见,**改规格不改内容**:
义项字数下限 2 → 1(\`spec.mjs\`),体裁闸补上下限判据、与上限同源引用 SPEC。

下面 ${rows.length} 条是动词类的单字义项,读起来像半个词,改双字词典体。
每条新值都过了体裁闸,人裁不免检:**0 条不合格**。

| 词 | 改前 | 改后 |
| --- | --- | --- |
${rows.map(r => `| ${r.hw} | ${r.from} | **${r.to}** |`).join('\n')}
`);

process.stdout.write('\nSHORT_FIX_VERDICT: PASS\n');
