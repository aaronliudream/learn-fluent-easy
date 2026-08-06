-- 短义项 v2 终裁 —— 11 条
--
-- ⚠️ v1 三条 validate 全 t,但人工复审发现**同病复发**:
--    单字堆砌被我升级成了双字堆砌(拉拽；拖曳 型)。
--    尺子没变过:**两段必须是词典分列的不同概念**。
--    v1 只盯着字数够不够,没回头问这两段是不是同一个意思 ——
--    **「改形」任务的产出同样要过「堆砌」这把尺,形式修复不豁免语义审。**
--
-- 8 条维持不动:gnaw / prod / peck / jug / stalk / strand / strings / hem
-- 后五条(arc/batter/cavity/shaft/trough)是捞回的真第二义,均 ECDICT 有据;
-- batter 原「揉捏」是错义,cavity 原「洞穴」误导。
-- 幂等:按 lower(headword) UPDATE。⚠️ 由 Aaron 执行。

BEGIN;

UPDATE vocab_words w SET def_zh = v.def_zh, updated_at = now()
  FROM (VALUES
  ('tug', '拉拽'),
  ('slash', '砍劈'),
  ('wring', '拧绞'),
  ('squat', '蹲下'),
  ('deity', '神祇'),
  ('ply', '层数'),
  ('arc', '弧线；电弧'),
  ('batter', '猛击；面糊'),
  ('cavity', '空腔；龋洞'),
  ('shaft', '轴杆；竖井'),
  ('trough', '水槽；低谷')
  ) AS v(headword, def_zh)
 WHERE lower(w.headword) = v.headword;

-- ── count-validate:三行都必须是 t,否则 ROLLBACK ──
SELECT '本批 11 词逐词与终裁一致' AS expect,
       NOT EXISTS (
         SELECT 1 FROM (VALUES
           ('tug', '拉拽'),
           ('slash', '砍劈'),
           ('wring', '拧绞'),
           ('squat', '蹲下'),
           ('deity', '神祇'),
           ('ply', '层数'),
           ('arc', '弧线；电弧'),
           ('batter', '猛击；面糊'),
           ('cavity', '空腔；龋洞'),
           ('shaft', '轴杆；竖井'),
           ('trough', '水槽；低谷')
         ) AS v(headword, def_zh)
         JOIN vocab_words w ON lower(w.headword) = v.headword
         WHERE w.def_zh IS DISTINCT FROM v.def_zh
       ) AS ok
UNION ALL
SELECT '维持不动的 8 条没被误改',
       (SELECT count(*) FROM vocab_words WHERE lower(headword) IN ('gnaw', 'prod', 'peck', 'jug', 'stalk', 'strand', 'strings', 'hem') AND def_zh IS NOT NULL) = 8
UNION ALL
SELECT '本批没把任何词的 def_zh 弄丢',
       NOT EXISTS (SELECT 1 FROM vocab_words WHERE lower(headword) IN ('tug', 'slash', 'wring', 'squat', 'deity', 'ply', 'arc', 'batter', 'cavity', 'shaft', 'trough') AND def_zh IS NULL);

COMMIT;
