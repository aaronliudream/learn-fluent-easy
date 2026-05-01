
-- 1) Add public-safe alias + opt-in to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS leaderboard_alias text,
  ADD COLUMN IF NOT EXISTS leaderboard_opt_in boolean NOT NULL DEFAULT true;

-- Backfill nicknames for existing users with anonymous "Learner #xxxx" tags
UPDATE public.profiles
SET leaderboard_alias = 'Learner #' || lpad((floor(random()*9000)+1000)::int::text, 4, '0')
WHERE leaderboard_alias IS NULL;

-- 2) Weekly leaderboard RPC (top 50, current ISO week, UTC)
CREATE OR REPLACE FUNCTION public.get_weekly_leaderboard()
RETURNS TABLE(
  rank          int,
  alias         text,
  weekly_xp     int,
  active_days   int,
  is_me         boolean
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  week_start timestamptz := date_trunc('week', (now() AT TIME ZONE 'UTC'));
BEGIN
  RETURN QUERY
  WITH agg AS (
    SELECT
      le.user_id,
      COALESCE(SUM(le.quiz_correct), 0)::int                       AS xp,
      COUNT(DISTINCT date_trunc('day', le.created_at))::int        AS days
    FROM public.learning_events le
    WHERE le.created_at >= week_start
    GROUP BY le.user_id
  ),
  ranked AS (
    SELECT
      a.user_id,
      a.xp,
      a.days,
      ROW_NUMBER() OVER (ORDER BY a.xp DESC, a.days DESC) AS rn
    FROM agg a
    JOIN public.profiles p ON p.user_id = a.user_id
    WHERE p.leaderboard_opt_in = true
      AND a.xp > 0
  )
  SELECT
    r.rn::int,
    COALESCE(p.leaderboard_alias, 'Learner #' || substr(r.user_id::text, 1, 4))::text,
    r.xp,
    r.days,
    (r.user_id = uid) AS is_me
  FROM ranked r
  LEFT JOIN public.profiles p ON p.user_id = r.user_id
  WHERE r.rn <= 50
  ORDER BY r.rn;
END;
$$;

-- 3) Personal weekly rank RPC (works even if user is opted out)
CREATE OR REPLACE FUNCTION public.get_my_weekly_rank()
RETURNS TABLE(
  weekly_xp   int,
  active_days int,
  rank        int,
  total_players int
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  week_start timestamptz := date_trunc('week', (now() AT TIME ZONE 'UTC'));
BEGIN
  IF uid IS NULL THEN
    RETURN QUERY SELECT 0, 0, 0, 0;
    RETURN;
  END IF;

  RETURN QUERY
  WITH agg AS (
    SELECT
      le.user_id,
      COALESCE(SUM(le.quiz_correct), 0)::int                AS xp,
      COUNT(DISTINCT date_trunc('day', le.created_at))::int AS days
    FROM public.learning_events le
    WHERE le.created_at >= week_start
    GROUP BY le.user_id
    HAVING COALESCE(SUM(le.quiz_correct), 0) > 0
  ),
  ranked AS (
    SELECT
      a.user_id, a.xp, a.days,
      ROW_NUMBER() OVER (ORDER BY a.xp DESC, a.days DESC) AS rn
    FROM agg a
  )
  SELECT
    COALESCE((SELECT xp   FROM ranked WHERE user_id = uid), 0)::int,
    COALESCE((SELECT days FROM ranked WHERE user_id = uid), 0)::int,
    COALESCE((SELECT rn   FROM ranked WHERE user_id = uid), 0)::int,
    (SELECT COUNT(*) FROM ranked)::int;
END;
$$;
