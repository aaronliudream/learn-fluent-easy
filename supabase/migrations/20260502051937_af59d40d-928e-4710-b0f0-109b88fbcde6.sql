
-- ============ Ratings (ELO + 段位) ============
CREATE TABLE public.word_duel_ratings (
  user_id uuid PRIMARY KEY,
  rating integer NOT NULL DEFAULT 1000,
  peak_rating integer NOT NULL DEFAULT 1000,
  wins integer NOT NULL DEFAULT 0,
  losses integer NOT NULL DEFAULT 0,
  draws integer NOT NULL DEFAULT 0,
  current_streak integer NOT NULL DEFAULT 0,
  best_streak integer NOT NULL DEFAULT 0,
  matches_played integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.word_duel_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own duel rating" ON public.word_duel_ratings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own duel rating" ON public.word_duel_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own duel rating" ON public.word_duel_ratings
  FOR UPDATE USING (auth.uid() = user_id);

-- ============ Matches ============
CREATE TABLE public.word_duel_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_a uuid NOT NULL,
  player_b uuid NOT NULL,
  winner uuid,
  is_draw boolean NOT NULL DEFAULT false,
  is_bot boolean NOT NULL DEFAULT false,
  score_a integer NOT NULL DEFAULT 0,
  score_b integer NOT NULL DEFAULT 0,
  duration_ms integer NOT NULL DEFAULT 0,
  rounds integer NOT NULL DEFAULT 0,
  rating_a_before integer,
  rating_b_before integer,
  rating_a_after integer,
  rating_b_after integer,
  rating_delta_a integer,
  rating_delta_b integer,
  questions jsonb NOT NULL DEFAULT '[]',
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.word_duel_matches ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_duel_matches_a ON public.word_duel_matches(player_a, created_at DESC);
CREATE INDEX idx_duel_matches_b ON public.word_duel_matches(player_b, created_at DESC);

CREATE POLICY "Users view own duel matches" ON public.word_duel_matches
  FOR SELECT USING (auth.uid() = player_a OR auth.uid() = player_b);
CREATE POLICY "Users insert own duel matches" ON public.word_duel_matches
  FOR INSERT WITH CHECK (auth.uid() = player_a OR auth.uid() = player_b);

-- ============ Queue (matchmaking) ============
CREATE TABLE public.word_duel_queue (
  user_id uuid PRIMARY KEY,
  rating integer NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  matched_with uuid,
  match_seed text
);
ALTER TABLE public.word_duel_queue ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_duel_queue_rating ON public.word_duel_queue(rating, joined_at);

CREATE POLICY "Users manage own queue entry" ON public.word_duel_queue
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users see queue entries pointing to them" ON public.word_duel_queue
  FOR SELECT USING (auth.uid() = matched_with);

-- ============ RPC: 初始化/取得段位 ============
CREATE OR REPLACE FUNCTION public.get_or_init_duel_rating()
RETURNS TABLE(
  rating integer, peak_rating integer, wins integer, losses integer, draws integer,
  current_streak integer, best_streak integer, matches_played integer, tier text
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  r record;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  INSERT INTO word_duel_ratings(user_id) VALUES (uid)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO r FROM word_duel_ratings WHERE user_id = uid;

  RETURN QUERY SELECT
    r.rating, r.peak_rating, r.wins, r.losses, r.draws,
    r.current_streak, r.best_streak, r.matches_played,
    CASE
      WHEN r.rating >= 1800 THEN '王者 Legend'
      WHEN r.rating >= 1600 THEN '大师 Master'
      WHEN r.rating >= 1400 THEN '钻石 Diamond'
      WHEN r.rating >= 1200 THEN '黄金 Gold'
      WHEN r.rating >= 1050 THEN '白银 Silver'
      ELSE '青铜 Bronze'
    END;
END;
$$;

-- ============ RPC: 匹配对手 ============
CREATE OR REPLACE FUNCTION public.find_duel_opponent(_rating_range integer DEFAULT 200)
RETURNS TABLE(opponent_id uuid, opponent_alias text, opponent_rating integer, match_seed text, is_bot boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  my_rating integer;
  opp_id uuid;
  opp_rating integer;
  opp_alias text;
  seed text;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;

  INSERT INTO word_duel_ratings(user_id) VALUES (uid)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT r.rating INTO my_rating FROM word_duel_ratings r WHERE user_id = uid;

  -- 看是否有人已把我标记为 matched_with（被别人匹配到）
  SELECT q.user_id, q.rating, q.match_seed
    INTO opp_id, opp_rating, seed
  FROM word_duel_queue q
  WHERE q.matched_with = uid
  LIMIT 1;

  IF opp_id IS NOT NULL THEN
    DELETE FROM word_duel_queue WHERE user_id = uid OR user_id = opp_id;
    SELECT COALESCE(p.leaderboard_alias, 'Player #' || substr(opp_id::text, 1, 4))
      INTO opp_alias FROM profiles p WHERE p.user_id = opp_id;
    RETURN QUERY SELECT opp_id, opp_alias, opp_rating, seed, false;
    RETURN;
  END IF;

  -- 找一个 ELO 接近、且不是我自己的等待者
  SELECT q.user_id, q.rating
    INTO opp_id, opp_rating
  FROM word_duel_queue q
  WHERE q.user_id <> uid
    AND q.matched_with IS NULL
    AND ABS(q.rating - my_rating) <= _rating_range
  ORDER BY ABS(q.rating - my_rating) ASC, q.joined_at ASC
  LIMIT 1;

  IF opp_id IS NOT NULL THEN
    seed := encode(gen_random_bytes(8), 'hex');
    UPDATE word_duel_queue SET matched_with = uid, match_seed = seed WHERE user_id = opp_id;
    DELETE FROM word_duel_queue WHERE user_id = uid;
    SELECT COALESCE(p.leaderboard_alias, 'Player #' || substr(opp_id::text, 1, 4))
      INTO opp_alias FROM profiles p WHERE p.user_id = opp_id;
    RETURN QUERY SELECT opp_id, opp_alias, opp_rating, seed, false;
    RETURN;
  END IF;

  -- 没找到，把我加入队列
  INSERT INTO word_duel_queue(user_id, rating) VALUES (uid, my_rating)
  ON CONFLICT (user_id) DO UPDATE SET rating = EXCLUDED.rating, joined_at = now(), matched_with = NULL, match_seed = NULL;

  RETURN QUERY SELECT NULL::uuid, NULL::text, NULL::integer, NULL::text, false;
END;
$$;

-- ============ RPC: 取消匹配 ============
CREATE OR REPLACE FUNCTION public.cancel_duel_queue()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN; END IF;
  DELETE FROM word_duel_queue WHERE user_id = auth.uid();
END;
$$;

-- ============ RPC: 匹配机器人 ============
CREATE OR REPLACE FUNCTION public.match_duel_bot()
RETURNS TABLE(opponent_id uuid, opponent_alias text, opponent_rating integer, match_seed text, is_bot boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  my_rating integer;
  bot_names text[] := ARRAY['AI 小智','单词侠 Vox','词汇精灵','词海之王','学霸 Bot','闪电单词','词典战神'];
  bot_name text;
  bot_rating integer;
  seed text;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  DELETE FROM word_duel_queue WHERE user_id = uid;

  INSERT INTO word_duel_ratings(user_id) VALUES (uid) ON CONFLICT DO NOTHING;
  SELECT rating INTO my_rating FROM word_duel_ratings WHERE user_id = uid;

  bot_name := bot_names[1 + floor(random() * array_length(bot_names,1))::int];
  bot_rating := GREATEST(800, my_rating + (floor(random()*200)::int - 100));
  seed := encode(gen_random_bytes(8), 'hex');

  RETURN QUERY SELECT NULL::uuid, bot_name, bot_rating, seed, true;
END;
$$;

-- ============ ELO 计算辅助 ============
CREATE OR REPLACE FUNCTION public._elo_delta(_my integer, _opp integer, _score real, _k integer DEFAULT 32)
RETURNS integer LANGUAGE sql IMMUTABLE AS $$
  SELECT ROUND(_k * (_score - 1.0 / (1.0 + power(10.0, (_opp - _my)::real / 400.0))))::integer;
$$;

-- ============ RPC: 提交结果 ============
CREATE OR REPLACE FUNCTION public.submit_duel_result(
  _opponent_id uuid,
  _is_bot boolean,
  _opponent_rating integer,
  _my_score integer,
  _opp_score integer,
  _duration_ms integer,
  _rounds integer,
  _questions jsonb
)
RETURNS TABLE(my_new_rating integer, my_delta integer, won boolean, is_draw boolean, current_streak integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  my_rating integer;
  my_delta integer;
  opp_delta integer;
  won boolean;
  draw boolean;
  result_score real;
  new_streak integer;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;

  INSERT INTO word_duel_ratings(user_id) VALUES (uid) ON CONFLICT DO NOTHING;
  SELECT rating INTO my_rating FROM word_duel_ratings WHERE user_id = uid;

  draw := (_my_score = _opp_score);
  won := (_my_score > _opp_score);
  result_score := CASE WHEN draw THEN 0.5 WHEN won THEN 1.0 ELSE 0.0 END;

  my_delta := public._elo_delta(my_rating, _opponent_rating, result_score, 32);
  opp_delta := public._elo_delta(_opponent_rating, my_rating, 1.0 - result_score, 32);

  -- 更新自己的 rating
  UPDATE word_duel_ratings SET
    rating = GREATEST(0, rating + my_delta),
    peak_rating = GREATEST(peak_rating, GREATEST(0, rating + my_delta)),
    wins = wins + CASE WHEN won THEN 1 ELSE 0 END,
    losses = losses + CASE WHEN NOT won AND NOT draw THEN 1 ELSE 0 END,
    draws = draws + CASE WHEN draw THEN 1 ELSE 0 END,
    current_streak = CASE WHEN won THEN current_streak + 1 ELSE 0 END,
    best_streak = GREATEST(best_streak, CASE WHEN won THEN current_streak + 1 ELSE current_streak END),
    matches_played = matches_played + 1,
    updated_at = now()
  WHERE user_id = uid
  RETURNING rating, current_streak INTO my_rating, new_streak;

  -- 真人对手：也更新对方 rating
  IF NOT _is_bot AND _opponent_id IS NOT NULL THEN
    INSERT INTO word_duel_ratings(user_id) VALUES (_opponent_id) ON CONFLICT DO NOTHING;
    UPDATE word_duel_ratings SET
      rating = GREATEST(0, rating + opp_delta),
      peak_rating = GREATEST(peak_rating, GREATEST(0, rating + opp_delta)),
      wins = wins + CASE WHEN (NOT won AND NOT draw) THEN 1 ELSE 0 END,
      losses = losses + CASE WHEN won THEN 1 ELSE 0 END,
      draws = draws + CASE WHEN draw THEN 1 ELSE 0 END,
      current_streak = CASE WHEN (NOT won AND NOT draw) THEN current_streak + 1 ELSE 0 END,
      best_streak = GREATEST(best_streak, CASE WHEN (NOT won AND NOT draw) THEN current_streak + 1 ELSE current_streak END),
      matches_played = matches_played + 1,
      updated_at = now()
    WHERE user_id = _opponent_id;
  END IF;

  -- 写入 match 记录（player_a = me, 防止重复需在客户端协调，这里允许双方各写一条）
  INSERT INTO word_duel_matches(
    player_a, player_b, winner, is_draw, is_bot,
    score_a, score_b, duration_ms, rounds,
    rating_a_before, rating_b_before, rating_a_after, rating_b_after,
    rating_delta_a, rating_delta_b, questions
  ) VALUES (
    uid, COALESCE(_opponent_id, uid), 
    CASE WHEN draw THEN NULL WHEN won THEN uid ELSE _opponent_id END,
    draw, _is_bot,
    _my_score, _opp_score, _duration_ms, _rounds,
    my_rating - my_delta, _opponent_rating, my_rating, _opponent_rating + opp_delta,
    my_delta, opp_delta, _questions
  );

  RETURN QUERY SELECT my_rating, my_delta, won, draw, new_streak;
END;
$$;

-- ============ RPC: 段位排行榜 ============
CREATE OR REPLACE FUNCTION public.get_duel_leaderboard(_scope text DEFAULT 'all')
RETURNS TABLE(rank integer, alias text, rating integer, wins integer, losses integer, best_streak integer, tier text, is_me boolean)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  RETURN QUERY
  WITH ranked AS (
    SELECT
      r.user_id, r.rating, r.wins, r.losses, r.best_streak,
      ROW_NUMBER() OVER (ORDER BY r.rating DESC, r.wins DESC) AS rn
    FROM word_duel_ratings r
    JOIN profiles p ON p.user_id = r.user_id
    WHERE p.leaderboard_opt_in = true
      AND r.matches_played >= 1
  )
  SELECT
    r.rn::int,
    COALESCE(p.leaderboard_alias, 'Player #' || substr(r.user_id::text, 1, 4))::text,
    r.rating, r.wins, r.losses, r.best_streak,
    CASE
      WHEN r.rating >= 1800 THEN '王者'
      WHEN r.rating >= 1600 THEN '大师'
      WHEN r.rating >= 1400 THEN '钻石'
      WHEN r.rating >= 1200 THEN '黄金'
      WHEN r.rating >= 1050 THEN '白银'
      ELSE '青铜'
    END::text,
    (r.user_id = uid)
  FROM ranked r
  LEFT JOIN profiles p ON p.user_id = r.user_id
  WHERE r.rn <= 100
  ORDER BY r.rn;
END;
$$;
