-- ✅ DONE 2026-08-07 已执行,Aaron 回报 validate 三条全 t
-- 反义词 · 人工清单补丁 —— 21 词 / 21 条
-- 前置:全量 vocab_toefl_antonyms.sql 已跑(四条 validate 全 t)。**本补丁不要求重跑它**。
-- 来源:① Aaron 审送审件判空栏抓到的漏网(microscopic / synthesize)
--       ② 形态同型排查里**逐条人读确认**为真反义的那批
--          (cite→incite / fraud→defraud / fusion→infusion 这类形态相关但非反义的误报已剔除)
-- 每条都过了 b1-b6,人工条目不因为"是人填的"就免检。
-- 幂等:按 lower(headword) UPDATE,重复跑无害。⚠️ 由 Aaron 执行。

BEGIN;

SELECT 'BEFORE' AS stage, count(*) AS words_with_antonyms FROM vocab_words WHERE antonyms IS NOT NULL;

UPDATE vocab_words w
   SET antonyms = v.antonyms, updated_at = now()
  FROM (VALUES
  ('microscopic', ARRAY['macroscopic']::text[]),
  ('synthesize', ARRAY['analyze']::text[]),
  ('verbal', ARRAY['nonverbal']::text[]),
  ('evenly', ARRAY['unevenly']::text[]),
  ('mobility', ARRAY['immobility']::text[]),
  ('insanity', ARRAY['sanity']::text[]),
  ('practicality', ARRAY['impracticality']::text[]),
  ('impropriety', ARRAY['propriety']::text[]),
  ('propriety', ARRAY['impropriety']::text[]),
  ('vertebrate', ARRAY['invertebrate']::text[]),
  ('invertebrate', ARRAY['vertebrate']::text[]),
  ('repute', ARRAY['disrepute']::text[]),
  ('disrepute', ARRAY['repute']::text[]),
  ('congruity', ARRAY['incongruity']::text[]),
  ('incongruity', ARRAY['congruity']::text[]),
  ('digestion', ARRAY['indigestion']::text[]),
  ('indigestion', ARRAY['digestion']::text[]),
  ('magnetize', ARRAY['demagnetize']::text[]),
  ('demagnetize', ARRAY['magnetize']::text[]),
  ('unscrupulously', ARRAY['scrupulously']::text[]),
  ('uncanny', ARRAY['canny']::text[])
  ) AS v(headword, antonyms)
 WHERE lower(w.headword) = v.headword;

SELECT 'AFTER' AS stage, count(*) AS words_with_antonyms FROM vocab_words WHERE antonyms IS NOT NULL;

-- ── count-validate:三行都必须是 t,否则 ROLLBACK ──
SELECT '本批 21 词都已有反义词' AS expect,
       (SELECT count(*) FROM vocab_words
         WHERE lower(headword) IN ('microscopic', 'synthesize', 'verbal', 'evenly', 'mobility', 'insanity', 'practicality', 'impropriety', 'propriety', 'vertebrate', 'invertebrate', 'repute', 'disrepute', 'congruity', 'incongruity', 'digestion', 'indigestion', 'magnetize', 'demagnetize', 'unscrupulously', 'uncanny')
           AND antonyms IS NOT NULL) = 21 AS ok
UNION ALL
SELECT '没有词配了超过 3 个反义词',
       NOT EXISTS (SELECT 1 FROM vocab_words WHERE array_length(antonyms, 1) > 3)
UNION ALL
SELECT '没有反义词等于它自己',
       NOT EXISTS (SELECT 1 FROM vocab_words WHERE lower(headword) = ANY(SELECT lower(unnest(antonyms))));

COMMIT;
