-- ✅ DONE 2026-08-07 已执行,库内实证:4470 词 def_zh 非空(唯一空行是待删的 fagot)
-- def_zh 丢义项定点修复:14 词
--
-- 只 UPDATE 这 14 行的 def_zh,**其余 184 词一个字段都不碰**。
-- 起因:第二、三轮 def_zh 重修按"所有双义词"这个**类别**铺开,
--       把真双义(context / coverage / defense 等)也压成了单义。
-- 逐条改前改后见 REVIEWAA/vocab_toefl_defzh_lost_fix.md。
-- ⚠️ 由 Aaron 执行。脚本本身从不写库。

BEGIN;

SELECT 'BEFORE' AS stage,
       count(*) FILTER (WHERE def_zh LIKE '%；%') AS double_sense,
       count(*) AS total
  FROM vocab_words WHERE def_zh IS NOT NULL;

UPDATE vocab_words w
   SET def_zh = v.def_zh, updated_at = now()
  FROM (VALUES
  ('adoption', '收养；采纳'),
  ('arena', '竞技场；活动领域'),
  ('cluster', '集群；聚类'),
  ('context', '上下文；背景'),
  ('counseling', '心理咨询；辅导'),
  ('counselor', '顾问；心理咨询师'),
  ('coverage', '覆盖范围；保险范围'),
  ('dealer', '经销商；荷官'),
  ('defense', '防御；辩护'),
  ('doctrine', '教义；学说'),
  ('grab', '抓住；抢占'),
  ('mandate', '授权；命令'),
  ('odds', '可能性；赔率'),
  ('perception', '知觉；看法')
  ) AS v(headword, def_zh)
 WHERE lower(w.headword) = v.headword;

SELECT 'AFTER' AS stage,
       count(*) FILTER (WHERE def_zh LIKE '%；%') AS double_sense,
       count(*) AS total
  FROM vocab_words WHERE def_zh IS NOT NULL;

-- ── count-validate:四行都必须是 t,否则 ROLLBACK ──
SELECT '这 14 词的 def_zh 已是定稿值' AS expect,
       NOT EXISTS (
         SELECT 1 FROM (VALUES
           ('adoption', '收养；采纳'),
           ('arena', '竞技场；活动领域'),
           ('cluster', '集群；聚类'),
           ('context', '上下文；背景'),
           ('counseling', '心理咨询；辅导'),
           ('counselor', '顾问；心理咨询师'),
           ('coverage', '覆盖范围；保险范围'),
           ('dealer', '经销商；荷官'),
           ('defense', '防御；辩护'),
           ('doctrine', '教义；学说'),
           ('grab', '抓住；抢占'),
           ('mandate', '授权；命令'),
           ('odds', '可能性；赔率'),
           ('perception', '知觉；看法')
         ) AS v(headword, def_zh)
         JOIN vocab_words w ON lower(w.headword) = v.headword
         WHERE w.def_zh IS DISTINCT FROM v.def_zh
       ) AS ok
UNION ALL
SELECT '词数仍是 198(本轮不该增删行)',
       (SELECT count(*) FROM vocab_words) = 198
UNION ALL
SELECT '没有 def_zh 写成句子(不含全角句号)',
       NOT EXISTS (SELECT 1 FROM vocab_words WHERE def_zh LIKE '%。%')
UNION ALL
SELECT '没有 def_zh 带圆括号注释',
       NOT EXISTS (SELECT 1 FROM vocab_words WHERE def_zh LIKE '%(%' OR def_zh LIKE '%（%');

COMMIT;
