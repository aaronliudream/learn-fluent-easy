-- 给 stage_tests 加上模块归属（grammar/vocab/reading/listening/writing），NULL 表示综合测试
ALTER TABLE public.stage_tests
  ADD COLUMN IF NOT EXISTS module text;

ALTER TABLE public.stage_tests
  DROP CONSTRAINT IF EXISTS stage_tests_module_check;

ALTER TABLE public.stage_tests
  ADD CONSTRAINT stage_tests_module_check
  CHECK (module IS NULL OR module = ANY (ARRAY['grammar','vocab','reading','listening','writing']));

CREATE INDEX IF NOT EXISTS idx_stage_tests_segment_grade_module
  ON public.stage_tests (segment, grade, module, sort_order);

-- 升级 list_stage_tests 增加 _module 可选参数
-- _module = NULL → 返回所有
-- _module = 'grammar' 等 → 只返回该模块 + 综合测试(module IS NULL)
CREATE OR REPLACE FUNCTION public.list_stage_tests(
  _segment text,
  _grade integer,
  _module text DEFAULT NULL
)
RETURNS TABLE(
  id uuid, scope text, unit_index integer, title text, description text,
  required_lessons integer, total_questions integer, pass_threshold real,
  base_coins integer, base_exp integer, sort_order integer,
  module text,
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
  ELSIF _segment = 'gaokao' THEN
    SELECT COUNT(DISTINCT item_id)::int INTO done_lessons
    FROM gaokao_user_mastery WHERE user_id = uid AND mastery_level >= 1;
  END IF;

  RETURN QUERY
  WITH t AS (
    SELECT * FROM stage_tests
    WHERE segment = _segment
      AND grade = _grade
      AND (_module IS NULL OR module IS NULL OR module = _module)
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