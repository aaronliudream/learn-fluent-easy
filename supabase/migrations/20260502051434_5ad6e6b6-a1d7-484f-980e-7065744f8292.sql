-- Word Quest 每日通关记录
CREATE TABLE IF NOT EXISTS public.word_quest_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  quest_date date NOT NULL,
  target_word text NOT NULL,
  target_vocab_id uuid,
  stages_passed smallint NOT NULL DEFAULT 0,    -- 0..6
  stage_results jsonb NOT NULL DEFAULT '[]'::jsonb,  -- [{stage:1,correct:true,latency_ms:1234}, ...]
  total_duration_ms integer NOT NULL DEFAULT 0,
  perfect boolean NOT NULL DEFAULT false,        -- 6 关全对
  hints_used smallint NOT NULL DEFAULT 0,
  score integer NOT NULL DEFAULT 0,
  completed_at timestamptz NOT NULL DEFAULT now()
);

-- 同一用户同一天只能通关一次
CREATE UNIQUE INDEX IF NOT EXISTS uq_word_quest_user_date
  ON public.word_quest_attempts(user_id, quest_date);

CREATE INDEX IF NOT EXISTS idx_wq_date_duration
  ON public.word_quest_attempts(quest_date, total_duration_ms ASC);

ALTER TABLE public.word_quest_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own quest attempts"
  ON public.word_quest_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own quest attempts"
  ON public.word_quest_attempts FOR SELECT
  USING (auth.uid() = user_id);

-- 连续打卡统计（按 4am 日界，与 streak 函数一致）
CREATE OR REPLACE FUNCTION public.get_word_quest_streak()
RETURNS TABLE(
  current_streak integer,
  longest_streak integer,
  today_done boolean,
  this_month_days integer,
  total_perfect integer
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RETURN QUERY SELECT 0, 0, false, 0, 0;
    RETURN;
  END IF;

  RETURN QUERY
  WITH days AS (
    SELECT DISTINCT quest_date AS d
    FROM word_quest_attempts
    WHERE user_id = uid
  ),
  today_d AS (
    SELECT ((now() AT TIME ZONE 'UTC') - interval '4 hours')::date AS d
  ),
  s_calc AS (
    SELECT d, d - (ROW_NUMBER() OVER (ORDER BY d))::int AS grp
    FROM days
  ),
  s_groups AS (
    SELECT grp, COUNT(*)::int AS len, MAX(d) AS last_day FROM s_calc GROUP BY grp
  ),
  current_s AS (
    SELECT COALESCE(MAX(len), 0)::int AS s
    FROM s_groups, today_d
    WHERE last_day >= today_d.d - 1
  ),
  longest_s AS (
    SELECT COALESCE(MAX(len), 0)::int AS s FROM s_groups
  ),
  today_done AS (
    SELECT EXISTS(
      SELECT 1 FROM word_quest_attempts, today_d
      WHERE user_id = uid AND quest_date = today_d.d
    ) AS x
  ),
  month_d AS (
    SELECT COUNT(*)::int AS c
    FROM days, today_d
    WHERE date_trunc('month', d) = date_trunc('month', today_d.d)
  ),
  perfects AS (
    SELECT COUNT(*)::int AS c
    FROM word_quest_attempts WHERE user_id = uid AND perfect = true
  )
  SELECT
    (SELECT s FROM current_s),
    (SELECT s FROM longest_s),
    (SELECT x FROM today_done),
    (SELECT c FROM month_d),
    (SELECT c FROM perfects);
END;
$$;

-- 今日通关速度榜
CREATE OR REPLACE FUNCTION public.get_word_quest_daily_leaderboard()
RETURNS TABLE(
  rank integer,
  alias text,
  duration_ms integer,
  perfect boolean,
  is_me boolean
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
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
      AND a.stages_passed = 6
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
$$;