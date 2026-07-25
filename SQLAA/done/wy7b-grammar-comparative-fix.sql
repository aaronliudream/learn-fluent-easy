-- 外研社七下 wy7B 语法·U3 系动词关 2 道题题干去比较级(线上修正)
-- 背景:wy7B 比较级/最高级在 U5 才教,这两题出在 U3(系动词),题干里的
--       warmer / younger than 与本题考点(get/become 系动词 + 形容词;look 单数)无关,
--       属时序超前。改题干不动考点、不动选项、不动答案键。
-- 范围:只 UPDATE 两行,不重跑 wy7b-grammar-load.sql(语法已在线上,六点各 20 题)。
-- 幂等:按旧串定位;旧串已不存在时为空操作。断言按"旧串=0 / 新串=1 / 答案键不变"判定。
BEGIN;

-- 改前快照
SELECT q.sort_order, q.stem, q.correct_answer
FROM public.junior_grammar_questions q
JOIN public.junior_grammar_points p ON p.id = q.point_id
WHERE p.publisher='junior_fltrp' AND p.volume='wy7B' AND p.code='wy7b-u3-linking-verbs'
  AND q.sort_order IN (16, 20)
ORDER BY q.sort_order;

-- ① sort_order=16 「The weather ____ warmer」→「____ warm」(答案 B: got; became 不变)
UPDATE public.junior_grammar_questions
SET stem = 'The weather ____ warm, and the trees ____ green.'
WHERE point_id = (SELECT id FROM public.junior_grammar_points
                  WHERE publisher='junior_fltrp' AND volume='wy7B' AND code='wy7b-u3-linking-verbs')
  AND stem = 'The weather ____ warmer, and the trees ____ green.';

-- ② sort_order=20 「She ____ younger than her real age」→「____ young for her age」(答案 C: looks 不变)
UPDATE public.junior_grammar_questions
SET stem = 'She ____ young for her age.'
WHERE point_id = (SELECT id FROM public.junior_grammar_points
                  WHERE publisher='junior_fltrp' AND volume='wy7B' AND code='wy7b-u3-linking-verbs')
  AND stem = 'She ____ younger than her real age.';

-- ── 断言:旧串归零 / 新串各 1 / 答案键与选项未变 ──
DO $$
DECLARE pid uuid; old_n int; new_n int; ans_bad int;
BEGIN
  SELECT id INTO pid FROM public.junior_grammar_points
  WHERE publisher='junior_fltrp' AND volume='wy7B' AND code='wy7b-u3-linking-verbs';
  IF pid IS NULL THEN RAISE EXCEPTION '找不到语法点 wy7b-u3-linking-verbs'; END IF;

  SELECT count(*) INTO old_n FROM public.junior_grammar_questions
  WHERE point_id = pid
    AND (stem LIKE '%warmer%' OR stem LIKE '%younger than%');
  IF old_n <> 0 THEN RAISE EXCEPTION '旧题干仍在 % 行', old_n; END IF;

  SELECT count(*) INTO new_n FROM public.junior_grammar_questions
  WHERE point_id = pid
    AND stem IN ('The weather ____ warm, and the trees ____ green.',
                 'She ____ young for her age.');
  IF new_n <> 2 THEN RAISE EXCEPTION '新题干命中 % 行,期望 2', new_n; END IF;

  -- 答案键与选项必须原样
  SELECT count(*) INTO ans_bad FROM public.junior_grammar_questions
  WHERE point_id = pid
    AND ((stem = 'The weather ____ warm, and the trees ____ green.'
          AND NOT (correct_answer = 'B' AND option_b = 'got; became'))
      OR (stem = 'She ____ young for her age.'
          AND NOT (correct_answer = 'C' AND option_c = 'looks')));
  IF ans_bad <> 0 THEN RAISE EXCEPTION '答案键/选项被改动的题 = %', ans_bad; END IF;

  RAISE NOTICE 'OK: wy7B U3 语法 2 题题干已去比较级,考点与答案键未变';
END $$;

-- 改后快照
SELECT q.sort_order, q.stem, q.correct_answer
FROM public.junior_grammar_questions q
JOIN public.junior_grammar_points p ON p.id = q.point_id
WHERE p.publisher='junior_fltrp' AND p.volume='wy7B' AND p.code='wy7b-u3-linking-verbs'
  AND q.sort_order IN (16, 20)
ORDER BY q.sort_order;

COMMIT;
