
CREATE OR REPLACE FUNCTION public.get_user_streak_stats()
RETURNS TABLE (
  current_streak integer,
  longest_streak integer,
  active_days_this_month integer,
  minutes_this_month integer,
  total_quiz_correct integer,
  has_first_ai_talk boolean,
  active_today boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RETURN QUERY SELECT 0, 0, 0, 0, 0, false, false;
    RETURN;
  END IF;

  RETURN QUERY
  WITH
    -- Apply 4am day-boundary: shift timestamps back 4 hours, then take date.
    days AS (
      SELECT DISTINCT ((created_at AT TIME ZONE 'UTC') - interval '4 hours')::date AS d
      FROM learning_events
      WHERE user_id = uid
    ),
    today_d AS (
      SELECT ((now() AT TIME ZONE 'UTC') - interval '4 hours')::date AS d
    ),
    -- Streak: count consecutive days ending today or yesterday.
    streak_calc AS (
      SELECT d,
             d - (ROW_NUMBER() OVER (ORDER BY d))::int AS grp
      FROM days
    ),
    streak_groups AS (
      SELECT grp, COUNT(*) AS len, MAX(d) AS last_day
      FROM streak_calc
      GROUP BY grp
    ),
    current_s AS (
      SELECT COALESCE(MAX(len), 0)::int AS s
      FROM streak_groups, today_d
      WHERE last_day >= today_d.d - 1
    ),
    longest_s AS (
      SELECT COALESCE(MAX(len), 0)::int AS s FROM streak_groups
    ),
    month_active AS (
      SELECT COUNT(*)::int AS c
      FROM days, today_d
      WHERE date_trunc('month', d) = date_trunc('month', today_d.d)
    ),
    month_min AS (
      SELECT COALESCE(SUM(study_minutes), 0)::int AS m
      FROM learning_events
      WHERE user_id = uid
        AND date_trunc('month', ((created_at AT TIME ZONE 'UTC') - interval '4 hours'))
            = date_trunc('month', ((now() AT TIME ZONE 'UTC') - interval '4 hours'))
    ),
    total_q AS (
      SELECT COALESCE(SUM(quiz_correct), 0)::int AS q
      FROM learning_events
      WHERE user_id = uid
    ),
    first_ai AS (
      SELECT EXISTS(
        SELECT 1 FROM learning_events
        WHERE user_id = uid AND event_type = 'ai_talk'
      ) AS x
    ),
    today_active AS (
      SELECT EXISTS(SELECT 1 FROM days, today_d WHERE days.d = today_d.d) AS x
    )
  SELECT
    (SELECT s FROM current_s),
    (SELECT s FROM longest_s),
    (SELECT c FROM month_active),
    (SELECT m FROM month_min),
    (SELECT q FROM total_q),
    (SELECT x FROM first_ai),
    (SELECT x FROM today_active);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_streak_stats() TO authenticated;
