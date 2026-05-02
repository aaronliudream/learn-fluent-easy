CREATE OR REPLACE FUNCTION public.get_vocab_mastery_overview()
RETURNS TABLE(
  total_words integer,
  mastered integer,
  proficient integer,
  familiar integer,
  encountered integer,
  untouched integer,
  due_today integer,
  due_within_7d integer,
  mastered_due_within_7d integer,
  avg_stability_days real,
  total_lapses integer
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  uid uuid := auth.uid();
  total int;
BEGIN
  SELECT COUNT(*)::int INTO total FROM gaokao_vocab;

  IF uid IS NULL THEN
    RETURN QUERY SELECT total, 0, 0, 0, 0, total, 0, 0, 0, 0::real, 0;
    RETURN;
  END IF;

  RETURN QUERY
  WITH m AS (
    SELECT mastery_level, due_at, stability, lapses
    FROM gaokao_user_mastery
    WHERE user_id = uid AND item_type = 'vocab'
  ),
  agg AS (
    SELECT
      COUNT(*) FILTER (WHERE mastery_level = 4)::int AS mastered,
      COUNT(*) FILTER (WHERE mastery_level = 3)::int AS proficient,
      COUNT(*) FILTER (WHERE mastery_level = 2)::int AS familiar,
      COUNT(*) FILTER (WHERE mastery_level = 1)::int AS encountered,
      COUNT(*)::int AS touched,
      COUNT(*) FILTER (WHERE due_at IS NOT NULL AND due_at <= now())::int AS due_today,
      COUNT(*) FILTER (WHERE due_at IS NOT NULL AND due_at <= now() + interval '7 days')::int AS due_7d,
      COUNT(*) FILTER (WHERE mastery_level = 4 AND due_at IS NOT NULL AND due_at <= now() + interval '7 days')::int AS mastered_due_7d,
      COALESCE(AVG(stability), 0)::real AS avg_stab,
      COALESCE(SUM(lapses), 0)::int AS sum_lapses
    FROM m
  )
  SELECT
    total,
    a.mastered,
    a.proficient,
    a.familiar,
    a.encountered,
    GREATEST(0, total - a.touched),
    a.due_today,
    a.due_7d,
    a.mastered_due_7d,
    a.avg_stab,
    a.sum_lapses
  FROM agg a;
END;
$function$;