-- 统一游戏成绩表
CREATE TABLE IF NOT EXISTS public.vocab_game_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  game_type text NOT NULL CHECK (game_type IN ('word_rush','word_bento','word_quest','word_duel')),
  score integer NOT NULL DEFAULT 0,
  best_combo integer NOT NULL DEFAULT 0,
  duration_ms integer NOT NULL DEFAULT 0,
  hits integer NOT NULL DEFAULT 0,
  misses integer NOT NULL DEFAULT 0,
  theme text,                       -- 可选：本局所选主题
  difficulty smallint,              -- 可选：1-4 高考难度
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vocab_game_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own game scores"
  ON public.vocab_game_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own game scores"
  ON public.vocab_game_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_game_scores_game_score
  ON public.vocab_game_scores(game_type, score DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_scores_user_game
  ON public.vocab_game_scores(user_id, game_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_scores_week
  ON public.vocab_game_scores(game_type, created_at DESC);

-- 排行榜函数：本周或全时段
CREATE OR REPLACE FUNCTION public.get_game_leaderboard(
  _game_type text,
  _scope text DEFAULT 'week'  -- 'week' | 'all'
)
RETURNS TABLE(
  rank integer,
  alias text,
  best_score integer,
  total_plays integer,
  is_me boolean
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  since timestamptz;
BEGIN
  IF _scope = 'week' THEN
    since := date_trunc('week', (now() AT TIME ZONE 'UTC'));
  ELSE
    since := '1970-01-01'::timestamptz;
  END IF;

  RETURN QUERY
  WITH agg AS (
    SELECT
      s.user_id,
      MAX(s.score)::int                                AS best,
      COUNT(*)::int                                    AS plays
    FROM public.vocab_game_scores s
    WHERE s.game_type = _game_type
      AND s.created_at >= since
    GROUP BY s.user_id
    HAVING MAX(s.score) > 0
  ),
  ranked AS (
    SELECT
      a.user_id, a.best, a.plays,
      ROW_NUMBER() OVER (ORDER BY a.best DESC, a.plays DESC) AS rn
    FROM agg a
    JOIN public.profiles p ON p.user_id = a.user_id
    WHERE p.leaderboard_opt_in = true
  )
  SELECT
    r.rn::int,
    COALESCE(p.leaderboard_alias, 'Player #' || substr(r.user_id::text, 1, 4))::text,
    r.best,
    r.plays,
    (r.user_id = uid) AS is_me
  FROM ranked r
  LEFT JOIN public.profiles p ON p.user_id = r.user_id
  WHERE r.rn <= 50
  ORDER BY r.rn;
END;
$$;

-- 我的游戏统计
CREATE OR REPLACE FUNCTION public.get_my_game_stats(_game_type text)
RETURNS TABLE(
  best_score integer,
  avg_score integer,
  total_plays integer,
  week_rank integer
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
  WITH mine AS (
    SELECT MAX(score)::int AS best, COALESCE(AVG(score),0)::int AS avg_s, COUNT(*)::int AS plays
    FROM public.vocab_game_scores
    WHERE user_id = uid AND game_type = _game_type
  ),
  weekly AS (
    SELECT user_id, MAX(score)::int AS best
    FROM public.vocab_game_scores
    WHERE game_type = _game_type AND created_at >= week_start
    GROUP BY user_id
    HAVING MAX(score) > 0
  ),
  ranked AS (
    SELECT user_id, ROW_NUMBER() OVER (ORDER BY best DESC) AS rn
    FROM weekly
  )
  SELECT
    COALESCE((SELECT best FROM mine), 0),
    COALESCE((SELECT avg_s FROM mine), 0),
    COALESCE((SELECT plays FROM mine), 0),
    COALESCE((SELECT rn FROM ranked WHERE user_id = uid), 0)::int;
END;
$$;