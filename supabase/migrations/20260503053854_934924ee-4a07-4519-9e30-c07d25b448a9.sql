
-- ============== 1. 心跳表（防挂机有效学习时长） ==============
CREATE TABLE IF NOT EXISTS public.learning_heartbeats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  segment text NOT NULL DEFAULT 'other', -- primary | junior | gaokao | other
  path text,
  active_seconds integer NOT NULL DEFAULT 15,
  session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_lhb_user_time ON public.learning_heartbeats(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lhb_user_seg_time ON public.learning_heartbeats(user_id, segment, created_at DESC);

ALTER TABLE public.learning_heartbeats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hb own insert" ON public.learning_heartbeats
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "hb own select" ON public.learning_heartbeats
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ============== 2. 家长聚合 RPC ==============
CREATE OR REPLACE FUNCTION public.get_parent_dashboard(_days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  since timestamptz := now() - make_interval(days => _days);
  since7 timestamptz := now() - interval '7 days';
  result jsonb;
BEGIN
  IF uid IS NULL THEN RETURN '{}'::jsonb; END IF;

  WITH
  -- ---- 单词掌握 ----
  pw AS (
    SELECT
      COUNT(*) FILTER (WHERE mastery_level >= 4)::int AS mastered,
      COUNT(*) FILTER (WHERE mastery_level = 3)::int AS proficient,
      COUNT(*) FILTER (WHERE mastery_level IN (1,2))::int AS familiar,
      COUNT(*)::int AS touched
    FROM primary_word_mastery WHERE user_id = uid
  ),
  jw AS (
    SELECT
      COUNT(*) FILTER (WHERE mastery_level >= 4)::int AS mastered,
      COUNT(*) FILTER (WHERE mastery_level = 3)::int AS proficient,
      COUNT(*) FILTER (WHERE mastery_level IN (1,2))::int AS familiar,
      COUNT(*)::int AS touched
    FROM junior_word_mastery WHERE user_id = uid
  ),
  gw AS (
    SELECT
      COUNT(*) FILTER (WHERE mastery_level >= 4)::int AS mastered,
      COUNT(*) FILTER (WHERE mastery_level = 3)::int AS proficient,
      COUNT(*) FILTER (WHERE mastery_level IN (1,2))::int AS familiar,
      COUNT(*)::int AS touched
    FROM gaokao_user_mastery WHERE user_id = uid AND item_type = 'vocab'
  ),
  -- ---- 阅读 ----
  pr AS (
    SELECT COUNT(*) FILTER (WHERE completed_at IS NOT NULL)::int AS done,
           COALESCE(AVG(score),0)::real AS avg_score
    FROM primary_reading_progress WHERE user_id = uid
  ),
  jr AS (
    SELECT COUNT(*)::int AS attempts,
           COUNT(*) FILTER (WHERE is_correct)::int AS correct
    FROM junior_reading_attempts WHERE user_id = uid AND created_at >= since
  ),
  gr AS (
    SELECT COUNT(*)::int AS attempts,
           COUNT(*) FILTER (WHERE is_correct)::int AS correct
    FROM gaokao_user_attempts
    WHERE user_id = uid AND question_type IS NOT NULL AND created_at >= since
  ),
  -- ---- 三学段做题 (近 _days) ----
  ps AS (
    SELECT game_type, COUNT(*)::int AS sessions, COALESCE(AVG(accuracy),0)::real AS acc
    FROM primary_game_scores WHERE user_id = uid AND created_at >= since
    GROUP BY game_type
  ),
  ps_total AS (
    SELECT COUNT(*)::int AS sessions, COALESCE(AVG(accuracy),0)::real AS acc,
           COUNT(DISTINCT date_trunc('day',created_at))::int AS days
    FROM primary_game_scores WHERE user_id = uid AND created_at >= since
  ),
  js_total AS (
    SELECT COUNT(*)::int AS sessions, COALESCE(AVG(accuracy),0)::real AS acc,
           COUNT(DISTINCT date_trunc('day',created_at))::int AS days
    FROM junior_game_scores WHERE user_id = uid AND created_at >= since
  ),
  gs_total AS (
    SELECT COUNT(*)::int AS attempts,
           COUNT(*) FILTER (WHERE is_correct)::int AS correct,
           COUNT(DISTINCT date_trunc('day',created_at))::int AS days
    FROM gaokao_user_attempts WHERE user_id = uid AND created_at >= since
  ),
  -- ---- 有效学习时长（心跳） ----
  hb AS (
    SELECT segment,
           COALESCE(SUM(active_seconds),0)::int AS secs
    FROM learning_heartbeats WHERE user_id = uid AND created_at >= since
    GROUP BY segment
  ),
  hb_total AS (
    SELECT COALESCE(SUM(active_seconds),0)::int AS secs
    FROM learning_heartbeats WHERE user_id = uid AND created_at >= since
  ),
  hb_7 AS (
    SELECT COALESCE(SUM(active_seconds),0)::int AS secs
    FROM learning_heartbeats WHERE user_id = uid AND created_at >= since7
  ),
  -- ---- 每日学习分钟曲线（近 14 天） ----
  daily_min AS (
    SELECT date_trunc('day', created_at)::date AS d,
           ROUND(SUM(active_seconds)/60.0)::int AS mins
    FROM learning_heartbeats
    WHERE user_id = uid AND created_at >= now() - interval '14 days'
    GROUP BY 1 ORDER BY 1
  ),
  -- ---- 薄弱点 Top 5 ----
  weak AS (
    SELECT module, parent_label, snapshot, wrong_count, last_wrong_at
    FROM gaokao_user_mistakes
    WHERE user_id = uid AND is_resolved = false
      AND last_wrong_at >= now() - interval '14 days'
    ORDER BY wrong_count DESC, last_wrong_at DESC
    LIMIT 5
  ),
  -- ---- 高考分题型分布 ----
  ga_by_type AS (
    SELECT question_type AS qt,
           COUNT(*)::int AS attempts,
           COUNT(*) FILTER (WHERE is_correct)::int AS correct
    FROM gaokao_user_attempts
    WHERE user_id = uid AND created_at >= since AND question_type IS NOT NULL
    GROUP BY question_type
  ),
  -- ---- 跨学段足迹（按时长占比） ----
  segs AS (
    SELECT
      COALESCE((SELECT secs FROM hb WHERE segment='primary'),0) AS p_secs,
      COALESCE((SELECT secs FROM hb WHERE segment='junior'),0)  AS j_secs,
      COALESCE((SELECT secs FROM hb WHERE segment='gaokao'),0)  AS g_secs,
      COALESCE((SELECT secs FROM hb WHERE segment='other'),0)   AS o_secs
  )
  SELECT jsonb_build_object(
    'days_window', _days,
    'minutes_total', ROUND((SELECT secs FROM hb_total)/60.0)::int,
    'minutes_7d', ROUND((SELECT secs FROM hb_7)/60.0)::int,
    'minutes_by_segment', jsonb_build_object(
      'primary', ROUND((SELECT p_secs FROM segs)/60.0)::int,
      'junior',  ROUND((SELECT j_secs FROM segs)/60.0)::int,
      'gaokao',  ROUND((SELECT g_secs FROM segs)/60.0)::int,
      'other',   ROUND((SELECT o_secs FROM segs)/60.0)::int
    ),
    'primary', jsonb_build_object(
      'words', (SELECT to_jsonb(pw.*) FROM pw),
      'reading_done', (SELECT done FROM pr),
      'reading_avg_score', (SELECT avg_score FROM pr),
      'sessions', (SELECT sessions FROM ps_total),
      'accuracy', (SELECT acc FROM ps_total),
      'active_days', (SELECT days FROM ps_total),
      'by_type', (SELECT COALESCE(jsonb_agg(to_jsonb(ps.*)), '[]'::jsonb) FROM ps)
    ),
    'junior', jsonb_build_object(
      'words', (SELECT to_jsonb(jw.*) FROM jw),
      'reading_attempts', (SELECT attempts FROM jr),
      'reading_correct', (SELECT correct FROM jr),
      'sessions', (SELECT sessions FROM js_total),
      'accuracy', (SELECT acc FROM js_total),
      'active_days', (SELECT days FROM js_total)
    ),
    'gaokao', jsonb_build_object(
      'words', (SELECT to_jsonb(gw.*) FROM gw),
      'attempts', (SELECT attempts FROM gs_total),
      'correct',  (SELECT correct FROM gs_total),
      'active_days', (SELECT days FROM gs_total),
      'by_type', (SELECT COALESCE(jsonb_agg(to_jsonb(ga_by_type.*)), '[]'::jsonb) FROM ga_by_type)
    ),
    'weakness', (SELECT COALESCE(jsonb_agg(to_jsonb(weak.*)), '[]'::jsonb) FROM weak),
    'daily_minutes', (SELECT COALESCE(jsonb_agg(to_jsonb(daily_min.*)), '[]'::jsonb) FROM daily_min)
  ) INTO result;

  RETURN result;
END $$;

GRANT EXECUTE ON FUNCTION public.get_parent_dashboard(integer) TO authenticated;
