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
  ps AS (
    SELECT game_type, COUNT(*)::int AS sessions, COALESCE(AVG(accuracy),0)::real AS acc
    FROM primary_game_scores WHERE user_id = uid AND created_at >= since
    GROUP BY game_type
  ),
  hb AS (
    SELECT segment,
           COALESCE(SUM(active_seconds),0)::int AS secs,
           COUNT(DISTINCT date_trunc('day',created_at))::int AS days,
           COUNT(DISTINCT path)::int AS paths
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
  daily_min AS (
    SELECT date_trunc('day', created_at)::date AS d,
           ROUND(SUM(active_seconds)/60.0)::int AS mins
    FROM learning_heartbeats
    WHERE user_id = uid AND created_at >= now() - interval '14 days'
    GROUP BY 1 ORDER BY 1
  ),
  weak AS (
    SELECT module, parent_label, snapshot, wrong_count, last_wrong_at
    FROM gaokao_user_mistakes
    WHERE user_id = uid AND is_resolved = false
      AND last_wrong_at >= now() - interval '14 days'
    ORDER BY wrong_count DESC, last_wrong_at DESC
    LIMIT 5
  ),
  ga_by_type AS (
    SELECT question_type AS qt,
           COUNT(*)::int AS attempts,
           COUNT(*) FILTER (WHERE is_correct)::int AS correct
    FROM gaokao_user_attempts
    WHERE user_id = uid AND created_at >= since AND question_type IS NOT NULL
    GROUP BY question_type
  ),
  gr AS (
    SELECT COUNT(*)::int AS attempts,
           COUNT(*) FILTER (WHERE is_correct)::int AS correct
    FROM gaokao_user_attempts
    WHERE user_id = uid AND question_type IS NOT NULL AND created_at >= since
  )
  SELECT jsonb_build_object(
    'days_window', _days,
    'minutes_total', ROUND((SELECT secs FROM hb_total)/60.0)::int,
    'minutes_7d', ROUND((SELECT secs FROM hb_7)/60.0)::int,
    'minutes_by_segment', jsonb_build_object(
      'primary',   ROUND(COALESCE((SELECT secs FROM hb WHERE segment='primary'),0)/60.0)::int,
      'junior',    ROUND(COALESCE((SELECT secs FROM hb WHERE segment='junior'),0)/60.0)::int,
      'gaokao',    ROUND(COALESCE((SELECT secs FROM hb WHERE segment='gaokao'),0)/60.0)::int,
      'workplace', ROUND(COALESCE((SELECT secs FROM hb WHERE segment='workplace'),0)/60.0)::int,
      'scenes',    ROUND(COALESCE((SELECT secs FROM hb WHERE segment='scenes'),0)/60.0)::int,
      'talk',      ROUND(COALESCE((SELECT secs FROM hb WHERE segment='talk'),0)/60.0)::int,
      'systematic',ROUND(COALESCE((SELECT secs FROM hb WHERE segment='systematic'),0)/60.0)::int,
      'slang',     ROUND(COALESCE((SELECT secs FROM hb WHERE segment='slang'),0)/60.0)::int,
      'other',     ROUND(COALESCE((SELECT secs FROM hb WHERE segment='other'),0)/60.0)::int
    ),
    'tracks_activity', jsonb_build_object(
      'workplace',  jsonb_build_object('days', COALESCE((SELECT days FROM hb WHERE segment='workplace'),0),  'items', COALESCE((SELECT paths FROM hb WHERE segment='workplace'),0)),
      'scenes',     jsonb_build_object('days', COALESCE((SELECT days FROM hb WHERE segment='scenes'),0),     'items', COALESCE((SELECT paths FROM hb WHERE segment='scenes'),0)),
      'talk',       jsonb_build_object('days', COALESCE((SELECT days FROM hb WHERE segment='talk'),0),       'items', COALESCE((SELECT paths FROM hb WHERE segment='talk'),0)),
      'systematic', jsonb_build_object('days', COALESCE((SELECT days FROM hb WHERE segment='systematic'),0), 'items', COALESCE((SELECT paths FROM hb WHERE segment='systematic'),0)),
      'slang',      jsonb_build_object('days', COALESCE((SELECT days FROM hb WHERE segment='slang'),0),      'items', COALESCE((SELECT paths FROM hb WHERE segment='slang'),0))
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