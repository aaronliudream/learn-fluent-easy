/**
 * C 段拼写变体修正 —— 只动受影响的组,不重出全量 115 KB。
 *
 * 由来:Aaron 审 C 段抓到 endeavor/endeavour 同组。加 c7 闸门(拼写变体不入组)
 * 后全库重扫,受影响的其实是**两组**:
 *   ① toefl:努力:n.   endeavor / exertion / endeavour → 逐出 endeavour,剩 2 个成员
 *   ② toefl:策略:n.   maneuver / manoeuvre           → **整组就是一对拼写变体**,
 *                                                       成员不足 2,整组删除
 * 第二组 Aaron 没看到 —— 它是一张彻头彻尾的假辨析卡,教了一个不存在的差别。
 *
 * 全库英美变体共 4 对:endeavor/endeavour、maneuver/manoeuvre、
 * caliber/calibre、clamour/clamor。后两对里只有 clamour/clamor 中的一个在组里,
 * 但同组另一成员不是它的变体,所以不受影响。
 *
 *   node scripts/vocab/emit-confusion-fix.mjs
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildClusters } from './gen-confusion.mjs';
import { DATA, loadWordPool, q, writeSql, writeReview } from './llm.mjs';

const BANK = 'toefl';
const cache = JSON.parse(readFileSync(path.join(DATA, 'generated', `${BANK}-confusion.json`), 'utf8'));
const now = new Map(buildClusters(loadWordPool(BANK)).map(c => [c.group_key, c]));

const dropped = [];   // 整组删除
const shrunk = [];    // 成员变少
for (const [key, card] of Object.entries(cache)) {
  const c = now.get(key);
  const oldHw = card.members.map(m => String(m.headword).toLowerCase());
  if (!c) { dropped.push({ key, members: oldHw }); continue; }
  const newHw = c.members.map(m => m.headword.toLowerCase());
  if (oldHw.length !== newHw.length) shrunk.push({ key, card, keep: newHw, removed: oldHw.filter(h => !newHw.includes(h)) });
}

const mvals = shrunk.flatMap(s =>
  s.card.members.filter(m => s.keep.includes(String(m.headword).toLowerCase()))
    .map((m, i) => `  (${q(s.key)}, ${q(String(m.headword).toLowerCase())}, ${q(m.feel_zh)}, ${q(m.contrast_hint)}, ${i + 1})`)).join(',\n');

writeSql(`vocab_${BANK}_confusion_variant_fix.sql`, `-- C 段拼写变体修正 —— 只动受影响的 ${dropped.length + shrunk.length} 组
--
-- 由来:Aaron 抓到 endeavor/endeavour 同组。加"拼写变体不入组"闸门后全库重扫,
-- 受影响的是**两组**(第二组 Aaron 未看到):
${shrunk.map(s => `--   · ${s.key}  逐出 ${s.removed.join('/')},保留 ${s.keep.join(' / ')}`).join('\n')}
${dropped.map(d => `--   · ${d.key}  整组删除 —— ${d.members.join(' / ')} 本身就是一对拼写变体,\n--       不是两个词。成员不足 2,这张辨析卡从头到尾是假的。`).join('\n')}
--
-- 全库英美变体共 4 对:endeavor/endeavour、maneuver/manoeuvre、caliber/calibre、clamour/clamor。
-- 前置:vocab_toefl_confusion.sql 已跑。本文件**不要求重跑它**。
-- ⚠️ 由 Aaron 执行。

BEGIN;

SELECT 'BEFORE' AS stage,
       (SELECT count(*) FROM vocab_confusion_groups) AS groups,
       (SELECT count(*) FROM vocab_confusion_members) AS members;

-- ① 整组删除(members 有 ON DELETE CASCADE,跟着走)
DELETE FROM vocab_confusion_groups
 WHERE group_key IN (${dropped.map(d => q(d.key)).join(', ')});

-- ② 成员收缩的组:先清本组成员再按新名单插回
DELETE FROM vocab_confusion_members m
 USING vocab_confusion_groups g
 WHERE m.group_id = g.id
   AND g.group_key IN (${shrunk.map(s => q(s.key)).join(', ')});

INSERT INTO vocab_confusion_members (group_id, word_id, feel_zh, contrast_hint, sort_order)
SELECT g.id, w.id, v.feel_zh, v.contrast_hint, v.sort_order
  FROM (VALUES
${mvals}
  ) AS v(group_key, headword, feel_zh, contrast_hint, sort_order)
  JOIN vocab_confusion_groups g ON g.group_key = v.group_key
  JOIN vocab_words w ON lower(w.headword) = v.headword;

SELECT 'AFTER' AS stage,
       (SELECT count(*) FROM vocab_confusion_groups) AS groups,
       (SELECT count(*) FROM vocab_confusion_members) AS members;

-- ── count-validate:四行都必须是 t,否则 ROLLBACK ──
SELECT '删掉的组已不存在' AS expect,
       NOT EXISTS (SELECT 1 FROM vocab_confusion_groups
                    WHERE group_key IN (${dropped.map(d => q(d.key)).join(', ')})) AS ok
UNION ALL
SELECT '拼写变体已不在任何组里',
       NOT EXISTS (
         SELECT 1 FROM vocab_confusion_members m
           JOIN vocab_words w ON w.id = m.word_id
          WHERE lower(w.headword) IN ('endeavour', 'manoeuvre', 'calibre')
       )
UNION ALL
SELECT '每组仍是 2-5 个成员',
       NOT EXISTS (
         SELECT 1 FROM vocab_confusion_groups g
          WHERE (SELECT count(*) FROM vocab_confusion_members m WHERE m.group_id = g.id) NOT BETWEEN 2 AND 5
       )
UNION ALL
SELECT '组内 feel_zh 仍互异',
       NOT EXISTS (SELECT group_id FROM vocab_confusion_members GROUP BY group_id, feel_zh HAVING count(*) > 1);

COMMIT;
`);

writeReview(`vocab_${BANK}_confusion_variant_fix.md`, `# C 段拼写变体修正 · 对照件

## 你点名的那一组

| 组 | 改前 | 改后 |
| --- | --- | --- |
${shrunk.map(s => `| ${s.key} | ${s.card.members.map(m => m.headword).join(' / ')} | **${s.keep.join(' / ')}** |`).join('\n')}

## ⚠️ 你没看到的第二组 —— 整组是假的

${dropped.map(d => `**${d.key}**:\`${d.members.join(' / ')}\` —— 这两个是**同一个词的英美拼法**,不是两个词。
整组只有它俩,逐出变体后成员不足 2,所以**整组删除**。
这张卡从头到尾在教一个不存在的差别,比漏掉一组更坏。`).join('\n\n')}

## 全库英美变体扫描结果(4 对)

| 变体对 | 是否在辨析组里 |
| --- | --- |
| endeavor / endeavour | 是 → 已逐出 endeavour |
| maneuver / manoeuvre | 是 → 整组删除 |
| caliber / calibre | 否 |
| clamour / clamor | clamour 在「喧闹」组,但同组另一成员不是它的变体,不受影响 |

闸门 c7「拼写变体不入组」已加,覆盖 \`-our/-or\`、\`-ise/-ize\`、\`-re/-er\`、
\`-ce/-se\`、\`-ogue/-og\`、双写 l、\`ae/oe\` 七类对应,以后不会再圈进来。
`);

process.stdout.write(`\n受影响:整组删除 ${dropped.length},成员收缩 ${shrunk.length}\n`);
