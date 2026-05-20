-- Fix: 20260519140000 failed because list_stage_tests return type changed without DROP.
-- Re-applies question_source column, junior module seeds, and upgraded list_stage_tests.

ALTER TABLE public.stage_tests
  ADD COLUMN IF NOT EXISTS question_source text NOT NULL DEFAULT 'vocab_pool';

ALTER TABLE public.stage_tests
  DROP CONSTRAINT IF EXISTS stage_tests_question_source_check;

ALTER TABLE public.stage_tests
  ADD CONSTRAINT stage_tests_question_source_check
  CHECK (question_source IN ('vocab_pool', 'ai_generated'));

DO $$
DECLARE
  g int;
  mods text[] := ARRAY['grammar','reading','listening','writing','vocab'];
  m text;
  mi int;
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.stage_tests
    WHERE segment = 'junior' AND question_source = 'ai_generated'
    LIMIT 1
  ) THEN
    RETURN;
  END IF;

  FOR g IN 1..3 LOOP
    mi := 0;
    FOREACH m IN ARRAY mods LOOP
      mi := mi + 1;
      IF m = 'vocab' THEN
        INSERT INTO public.stage_tests (
          segment, grade, scope, unit_index, module, question_source,
          title, description, required_lessons, total_questions,
          pass_threshold, base_coins, base_exp, sort_order
        ) VALUES
          (
            'junior', g, 'unit', 1, 'vocab', 'vocab_pool',
            '初' || g || ' · 词汇 · 单元小测 1', '词义辨认 · 英译中',
            2, 10, 0.75, 20, 30, 100 + g * 10 + mi
          ),
          (
            'junior', g, 'module', NULL, 'vocab', 'vocab_pool',
            '初' || g || ' · 词汇 · 模块综合', '本年级已学词汇综合测',
            8, 15, 0.80, 60, 80, 120 + g * 10 + mi
          );
      ELSE
        INSERT INTO public.stage_tests (
          segment, grade, scope, unit_index, module, question_source,
          title, description, required_lessons, total_questions,
          pass_threshold, base_coins, base_exp, sort_order
        ) VALUES
          (
            'junior', g, 'unit', 1, m, 'ai_generated',
            '初' || g || ' · ' || CASE m
              WHEN 'grammar' THEN '语法'
              WHEN 'reading' THEN '阅读'
              WHEN 'listening' THEN '听力'
              WHEN 'writing' THEN '写作'
            END || ' · 单元小测 1',
            'AI 根据你已学内容出题 · 中考风格',
            2, 8, 0.75, 20, 30, 100 + g * 10 + mi
          ),
          (
            'junior', g, 'unit', 2, m, 'ai_generated',
            '初' || g || ' · ' || CASE m
              WHEN 'grammar' THEN '语法'
              WHEN 'reading' THEN '阅读'
              WHEN 'listening' THEN '听力'
              WHEN 'writing' THEN '写作'
            END || ' · 单元小测 2',
            'AI 根据你已学内容出题 · 中考风格',
            5, 8, 0.75, 20, 30, 110 + g * 10 + mi
          ),
          (
            'junior', g, 'module', NULL, m, 'ai_generated',
            '初' || g || ' · ' || CASE m
              WHEN 'grammar' THEN '语法'
              WHEN 'reading' THEN '阅读'
              WHEN 'listening' THEN '听力'
              WHEN 'writing' THEN '写作'
            END || ' · 模块综合',
            '阶段性综合检验 · 弱项加权 · 错题特训',
            8, 12, 0.80, 60, 80, 130 + g * 10 + mi
          );
      END IF;
    END LOOP;
  END LOOP;
END $$;

DROP FUNCTION IF EXISTS public.list_stage_tests(text, integer, text);

CREATE OR REPLACE FUNCTION public.list_stage_tests(
  _segment text,
  _grade integer,
  _module text DEFAULT NULL
)
RETURNS TABLE(
  id uuid, scope text, unit_index integer, title text, description text,
  required_lessons integer, total_questions integer, pass_threshold real,
  base_coins integer, base_exp integer, sort_order integer,
  module text, question_source text,
  completed_lessons integer, unlocked boolean,
  pass_count integer, attempt_count integer,
  cooldown_until timestamp with time zone, best_score real,
  next_reward_coins integer, next_reward_exp integer
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  uid uuid := auth.uid();
  done_lessons int := 0;
BEGIN
  IF uid IS NULL THEN RETURN; END IF;

  IF _segment = 'primary' THEN
    SELECT COUNT(DISTINCT lesson_key)::int INTO done_lessons
    FROM primary_game_scores WHERE user_id = uid;
    SELECT done_lessons + COALESCE((SELECT COUNT(*)::int FROM primary_reading_progress WHERE user_id = uid AND completed = true), 0) INTO done_lessons;
  ELSIF _segment = 'junior' THEN
    SELECT COUNT(DISTINCT lesson_key)::int INTO done_lessons
    FROM junior_game_scores WHERE user_id = uid;
    IF _module = 'grammar' THEN
      SELECT done_lessons + COALESCE((
        SELECT COUNT(DISTINCT item_id)::int FROM junior_user_mastery
        WHERE user_id = uid AND item_type = 'grammar_point'
      ), 0) INTO done_lessons;
    ELSIF _module = 'reading' THEN
      SELECT done_lessons + COALESCE((
        SELECT COUNT(*)::int FROM mastery_progress
        WHERE user_id = uid AND module = 'junior_reading' AND stars >= 1
      ), 0) INTO done_lessons;
    ELSIF _module = 'listening' THEN
      SELECT done_lessons + COALESCE((
        SELECT COUNT(DISTINCT exercise_id)::int FROM (
          SELECT exercise_id FROM junior_listening_attempts
          WHERE user_id = uid
          GROUP BY exercise_id
          HAVING COUNT(*) FILTER (WHERE is_correct) >= GREATEST(1, COUNT(*) * 0.8)
        ) x
      ), 0) INTO done_lessons;
    ELSIF _module = 'writing' THEN
      SELECT done_lessons + COALESCE((
        SELECT COUNT(DISTINCT prompt_id)::int FROM junior_writing_attempts
        WHERE user_id = uid AND overall_score >= 80
      ), 0) INTO done_lessons;
    ELSIF _module = 'vocab' THEN
      SELECT done_lessons + COALESCE((
        SELECT COUNT(DISTINCT word_id)::int FROM junior_word_mastery
        WHERE user_id = uid AND mastery_level >= 1
      ), 0) INTO done_lessons;
    END IF;
  ELSIF _segment = 'gaokao' THEN
    SELECT COUNT(DISTINCT item_id)::int INTO done_lessons
    FROM gaokao_user_mastery WHERE user_id = uid AND mastery_level >= 1;
  END IF;

  RETURN QUERY
  WITH t AS (
    SELECT * FROM stage_tests st
    WHERE st.segment = _segment
      AND st.grade = _grade
      AND (
        _module IS NULL
        OR st.module = _module
        OR (st.module IS NULL AND st.scope IN ('term', 'final'))
      )
  ),
  agg AS (
    SELECT
      a.test_id,
      COUNT(*) FILTER (WHERE a.passed)::int AS passes,
      COUNT(*)::int AS attempts,
      MAX(a.cooldown_until) AS cd,
      MAX(a.score) AS best
    FROM stage_test_attempts a
    WHERE a.user_id = uid
    GROUP BY a.test_id
  )
  SELECT
    t.id, t.scope, t.unit_index, t.title, t.description,
    t.required_lessons, t.total_questions, t.pass_threshold,
    t.base_coins, t.base_exp, t.sort_order,
    t.module,
    COALESCE(t.question_source, 'vocab_pool'),
    done_lessons,
    (done_lessons >= t.required_lessons),
    COALESCE(agg.passes, 0),
    COALESCE(agg.attempts, 0),
    agg.cd,
    COALESCE(agg.best, 0)::real,
    CASE COALESCE(agg.passes, 0)
      WHEN 0 THEN t.base_coins
      WHEN 1 THEN (t.base_coins * 0.5)::int
      WHEN 2 THEN (t.base_coins * 0.25)::int
      ELSE 0
    END,
    CASE COALESCE(agg.passes, 0)
      WHEN 0 THEN t.base_exp
      WHEN 1 THEN (t.base_exp * 0.5)::int
      WHEN 2 THEN (t.base_exp * 0.25)::int
      ELSE 0
    END
  FROM t LEFT JOIN agg ON agg.test_id = t.id
  ORDER BY t.sort_order;
END $function$;
