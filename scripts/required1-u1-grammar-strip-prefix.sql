-- 剥离 必修一 U1 语法题干"选出…:"术语指令前缀 → 题面直接是带 ____ 的句子。幂等。
-- 覆盖全部变体:"选出能填入空白的X短语:"/"选出正确的形容词短语填空:"/"选出能填入空白的形容词(短语):"(实测 36 道)。
BEGIN;
UPDATE public.junior_grammar_questions
SET stem = regexp_replace(stem, '^选出[^：:]*[：:][[:space:]]*', '')
WHERE point_id IN (SELECT id FROM public.junior_grammar_points WHERE volume='required1' AND unit='U1')
  AND stem ~ '^选出[^：:]*[：:]';
COMMIT;
-- 校验:应返回 0
SELECT count(*) AS remaining_prefixed FROM public.junior_grammar_questions
WHERE point_id IN (SELECT id FROM public.junior_grammar_points WHERE volume='required1' AND unit='U1')
  AND stem ~ '^选出';
