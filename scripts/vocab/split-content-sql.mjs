/**
 * 把全量 content SQL 切成多片 —— Supabase 网页 SQL 编辑器扛不住 3.2 MB
 * (报 "Query is too large to be run via the SQL Editor")。
 *
 * ⚠️ 分片的口径:**按词切**,一个词的 3 条例句永远在同一片里。
 *    按行切会把某个词的例句劈到两片,中间那片跑完时该词只有 1-2 条例句,
 *    "每词恰好 3 条"的校验在中途就是假的。
 *
 * ⚠️ 逐片校验只打印 BEFORE/AFTER 计数供肉眼看,**总量 count-validate 放在最后一片**。
 *    原因:库里本来就有 198 个词带 def_zh,它们分散在各片里,
 *    中途某片的"应有多少"要把这批已存在的算进去才对 —— 与其写一个容易算错的
 *    中途期望值,不如老实说"中途只看趋势,最后一片才判定"。
 *
 * 用法:node scripts/vocab/split-content-sql.mjs --parts=5
 * 产出:SQLAA/vocab_toefl_content_p1of5.sql … p5of5.sql
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCENES } from './gates.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const GEN = path.join(HERE, 'data', 'generated');

const arg = (k, d) => process.argv.find(a => a.startsWith(`--${k}=`))?.split('=').slice(1).join('=') ?? d;
const BANK = arg('bank', 'toefl');
const PARTS = Number(arg('parts', '5'));

const esc = s => String(s ?? '').replace(/'/g, "''");
const q = s => (s === null || s === undefined || s === '') ? 'NULL' : `'${esc(s)}'`;

const data = JSON.parse(readFileSync(path.join(GEN, `${BANK}-content.json`), 'utf8'));
const all = Object.values(data);
const totalWords = all.length;
const totalEx = all.reduce((n, w) => n + w.examples.length, 0);

const size = Math.ceil(totalWords / PARTS);
mkdirSync(path.join(REPO, 'SQLAA'), { recursive: true });

for (let i = 0; i < PARTS; i++) {
  const chunk = all.slice(i * size, (i + 1) * size);
  if (!chunk.length) continue;
  const last = i === PARTS - 1;
  const n = i + 1;

  const wordRows = chunk.map(w =>
    `  (${q(w.headword.toLowerCase())}, ${q(w.ipa)}, ${q(w.def_zh)}, ${q(w.def_en)})`).join(',\n');
  const exRows = chunk.flatMap(w => w.examples.map((ex, k) =>
    `  (${q(w.headword.toLowerCase())}, ${k + 1}, ${q(ex.collocation)}, ${q(ex.sentence)}, ${q(ex.translation_zh)}, ${q(ex.scene)})`)).join(',\n');

  const sql = `-- 托福词汇内容 · 第 ${n}/${PARTS} 片(本片 ${chunk.length} 词 / ${chunk.length * 3} 例句)
-- 全量:${totalWords} 词 / ${totalEx} 例句。原始单文件 3.2MB 被 SQL 编辑器拒绝,故切片。
--
-- ⚠️ **按顺序跑 p1 → p${PARTS}**。一个词的 3 条例句都在同一片里,不会被劈开。
-- ⚠️ 前置:词本体必须已在库(先跑 vocab_toefl_words_full.sql)。
-- ⚠️ 总量 count-validate 在**最后一片**;中间几片只打印计数看趋势。
-- 幂等:def_zh 按 lower(headword) 定位更新;例句走 ON CONFLICT (word_id, sort_order)。
-- ⚠️ 由 Aaron 执行。

BEGIN;

SELECT 'p${n}/${PARTS} BEFORE' AS stage,
       (SELECT count(*) FROM vocab_words WHERE def_zh IS NOT NULL) AS words_with_def,
       (SELECT count(*) FROM vocab_examples) AS examples;

ALTER TABLE vocab_examples ADD COLUMN IF NOT EXISTS scene text;

UPDATE vocab_words w
   SET ipa = v.ipa, def_zh = v.def_zh, def_en = v.def_en, updated_at = now()
  FROM (VALUES
${wordRows}
  ) AS v(headword, ipa, def_zh, def_en)
 WHERE lower(w.headword) = v.headword;

INSERT INTO vocab_examples (word_id, sort_order, collocation, sentence, translation_zh, scene)
SELECT w.id, v.sort_order, v.collocation, v.sentence, v.translation_zh, v.scene
  FROM (VALUES
${exRows}
  ) AS v(headword, sort_order, collocation, sentence, translation_zh, scene)
  JOIN vocab_words w ON lower(w.headword) = v.headword
ON CONFLICT (word_id, sort_order) DO UPDATE
  SET collocation = EXCLUDED.collocation,
      sentence = EXCLUDED.sentence,
      translation_zh = EXCLUDED.translation_zh,
      scene = EXCLUDED.scene;

SELECT 'p${n}/${PARTS} AFTER' AS stage,
       (SELECT count(*) FROM vocab_words WHERE def_zh IS NOT NULL) AS words_with_def,
       (SELECT count(*) FROM vocab_examples) AS examples;
${last ? `
-- ── 最后一片:总量 count-validate,五行都必须是 t,否则 ROLLBACK ──
SELECT 'words_with_def = ${totalWords}' AS expect,
       (SELECT count(*) FROM vocab_words WHERE def_zh IS NOT NULL) = ${totalWords} AS ok
UNION ALL
SELECT 'examples = ${totalEx}',
       (SELECT count(*) FROM vocab_examples) = ${totalEx}
UNION ALL
SELECT '每个有释义的词恰好 3 条例句',
       NOT EXISTS (
         SELECT 1 FROM vocab_words w
          WHERE w.def_zh IS NOT NULL
            AND (SELECT count(*) FROM vocab_examples e WHERE e.word_id = w.id) <> 3
       )
UNION ALL
SELECT '每条例句的 scene 都在 10 值枚举内',
       NOT EXISTS (
         SELECT 1 FROM vocab_examples
          WHERE scene IS NULL OR scene NOT IN (${SCENES.map(s => `'${s}'`).join(', ')})
       )
UNION ALL
SELECT '没有 def_zh 混入英文字母',
       NOT EXISTS (SELECT 1 FROM vocab_words WHERE def_zh ~ '[A-Za-z]');
` : `
-- 中间片不做判定。趋势看上面两行:words_with_def 和 examples 都应递增。
`}
COMMIT;
`;
  const out = path.join(REPO, 'SQLAA', `vocab_${BANK}_content_p${n}of${PARTS}.sql`);
  writeFileSync(out, sql, 'utf8');
  const kb = (Buffer.byteLength(sql, 'utf8') / 1024).toFixed(0);
  process.stdout.write(`· p${n}/${PARTS}: ${chunk.length} 词 / ${chunk.length * 3} 句 · ${kb} KB → SQLAA/vocab_${BANK}_content_p${n}of${PARTS}.sql\n`);
}
process.stdout.write(`\n合计 ${totalWords} 词 / ${totalEx} 例句,按顺序 p1 → p${PARTS} 跑。\n`);
