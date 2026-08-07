-- ✅ DONE 2026-08-07 已执行,Aaron 回报 validate 四条全 t
-- C 段拼写变体修正 —— 只动受影响的 2 组
--
-- 由来:Aaron 抓到 endeavor/endeavour 同组。加"拼写变体不入组"闸门后全库重扫,
-- 受影响的是**两组**(第二组 Aaron 未看到):
--   · toefl:努力:n.  逐出 endeavour,保留 endeavor / exertion
--   · toefl:策略:n.  整组删除 —— maneuver / manoeuvre 本身就是一对拼写变体,
--       不是两个词。成员不足 2,这张辨析卡从头到尾是假的。
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
 WHERE group_key IN ('toefl:策略:n.');

-- ② 成员收缩的组:先清本组成员再按新名单插回
DELETE FROM vocab_confusion_members m
 USING vocab_confusion_groups g
 WHERE m.group_id = g.id
   AND g.group_key IN ('toefl:努力:n.');

INSERT INTO vocab_confusion_members (group_id, word_id, feel_zh, contrast_hint, sort_order)
SELECT g.id, w.id, v.feel_zh, v.contrast_hint, v.sort_order
  FROM (VALUES
  ('toefl:努力:n.', 'endeavor', '正式且庄重', '常用于书面或正式场合', 1),
  ('toefl:努力:n.', 'exertion', '强调体力或脑力', '多指体力或脑力的消耗', 2)
  ) AS v(group_key, headword, feel_zh, contrast_hint, sort_order)
  JOIN vocab_confusion_groups g ON g.group_key = v.group_key
  JOIN vocab_words w ON lower(w.headword) = v.headword;

SELECT 'AFTER' AS stage,
       (SELECT count(*) FROM vocab_confusion_groups) AS groups,
       (SELECT count(*) FROM vocab_confusion_members) AS members;

-- ── count-validate:四行都必须是 t,否则 ROLLBACK ──
SELECT '删掉的组已不存在' AS expect,
       NOT EXISTS (SELECT 1 FROM vocab_confusion_groups
                    WHERE group_key IN ('toefl:策略:n.')) AS ok
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
