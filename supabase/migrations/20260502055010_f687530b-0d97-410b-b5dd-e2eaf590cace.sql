CREATE OR REPLACE FUNCTION public.get_word_quest_daily_leaderboard()
 RETURNS TABLE(rank integer, alias text, duration_ms integer, perfect boolean, is_me boolean)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  uid uuid := auth.uid();
  today date := ((now() AT TIME ZONE 'UTC') - interval '4 hours')::date;
BEGIN
  RETURN QUERY
  WITH attempts AS (
    SELECT a.user_id, a.total_duration_ms, a.perfect
    FROM word_quest_attempts a
    JOIN profiles p ON p.user_id = a.user_id
    WHERE a.quest_date = today
      AND a.stages_passed >= 18
      AND p.leaderboard_opt_in = true
  ),
  ranked AS (
    SELECT
      a.user_id, a.total_duration_ms, a.perfect,
      ROW_NUMBER() OVER (ORDER BY a.perfect DESC, a.total_duration_ms ASC) AS rn
    FROM attempts a
  )
  SELECT
    r.rn::int,
    COALESCE(p.leaderboard_alias, 'Player #' || substr(r.user_id::text, 1, 4))::text,
    r.total_duration_ms,
    r.perfect,
    (r.user_id = uid)
  FROM ranked r
  LEFT JOIN profiles p ON p.user_id = r.user_id
  WHERE r.rn <= 50
  ORDER BY r.rn;
END;
$function$;