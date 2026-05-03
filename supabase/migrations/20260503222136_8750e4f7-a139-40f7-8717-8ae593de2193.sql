
-- 1) 家长延迟系数
CREATE TABLE IF NOT EXISTS public.parent_delay_settings (
  user_id UUID PRIMARY KEY,
  delay_hours INT NOT NULL DEFAULT 24 CHECK (delay_hours IN (1, 24, 72)),
  daily_seed_cap INT NOT NULL DEFAULT 50 CHECK (daily_seed_cap BETWEEN 10 AND 200),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.parent_delay_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own delay select" ON public.parent_delay_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own delay upsert" ON public.parent_delay_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own delay update" ON public.parent_delay_settings FOR UPDATE USING (auth.uid() = user_id);

-- 2) 无奖励日（每周共享一天）
CREATE TABLE IF NOT EXISTS public.no_reward_days (
  week_start DATE PRIMARY KEY,
  rest_date DATE NOT NULL,
  reason TEXT DEFAULT '心灵假日 — 今天为热爱而学 🌸'
);
ALTER TABLE public.no_reward_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone read no_reward_days" ON public.no_reward_days FOR SELECT USING (true);

-- 3) profiles 加耐心分
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS patience_score INT NOT NULL DEFAULT 0;

-- 4) 升级 add_pending_seed —— 支持家长延迟 + 单日上限 + 无奖励日
CREATE OR REPLACE FUNCTION public.add_pending_seed(_amount INTEGER, _source TEXT)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _id BIGINT;
  _delay_hours INT;
  _cap INT;
  _today DATE := (now() AT TIME ZONE 'UTC')::date;
  _earned_today INT;
  _allowed INT;
  _store INT;
  _mature TIMESTAMPTZ;
  _is_rest BOOLEAN;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'auth required'; END IF;
  IF _amount <= 0 OR _amount > 50 THEN RAISE EXCEPTION 'invalid amount'; END IF;

  -- 家长延迟系数
  SELECT delay_hours, daily_seed_cap INTO _delay_hours, _cap
  FROM public.parent_delay_settings WHERE user_id = _uid;
  _delay_hours := COALESCE(_delay_hours, 24);
  _cap := COALESCE(_cap, 50);

  -- 无奖励日：今天恰是 rest_date → 全部存入"明日储蓄罐"，不进消化
  SELECT EXISTS(
    SELECT 1 FROM public.no_reward_days
    WHERE rest_date = _today
  ) INTO _is_rest;

  -- 今日已发种子
  SELECT COALESCE(SUM(amount), 0)::INT INTO _earned_today
  FROM public.pending_seeds
  WHERE user_id = _uid AND earned_at::date = _today;

  IF _is_rest THEN
    _store := _amount;
    _mature := (_today + INTERVAL '1 day')::timestamptz + (_delay_hours || ' hours')::interval;
  ELSE
    _allowed := GREATEST(0, _cap - _earned_today);
    IF _amount <= _allowed THEN
      _store := _amount;
      _mature := now() + (_delay_hours || ' hours')::interval;
    ELSE
      -- 超出当日上限：进"明日储蓄罐"
      _store := _amount;
      _mature := (_today + INTERVAL '1 day')::timestamptz + (_delay_hours || ' hours')::interval;
    END IF;
  END IF;

  INSERT INTO public.pending_seeds (user_id, amount, source, mature_at)
  VALUES (_uid, _store, COALESCE(_source, 'unknown'), _mature)
  RETURNING id INTO _id;
  RETURN _id;
END $$;

-- 5) 心愿单购买（走耐心分）
CREATE OR REPLACE FUNCTION public.confirm_wishlist_purchase(_wishlist_id UUID)
RETURNS TABLE(ok BOOLEAN, days_held INT, patience_after INT, reason TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _row public.wishlist%ROWTYPE;
  _days INT;
  _new_patience INT;
BEGIN
  IF _uid IS NULL THEN RETURN QUERY SELECT false, 0, 0, 'no_user'::TEXT; RETURN; END IF;
  SELECT * INTO _row FROM public.wishlist WHERE id = _wishlist_id AND user_id = _uid;
  IF NOT FOUND THEN RETURN QUERY SELECT false, 0, 0, 'not_found'::TEXT; RETURN; END IF;
  IF _row.purchased_at IS NOT NULL OR _row.removed_at IS NOT NULL THEN
    RETURN QUERY SELECT false, 0, 0, 'closed'::TEXT; RETURN;
  END IF;
  IF _row.cooldown_until > now() THEN
    RETURN QUERY SELECT false, 0, 0, 'still_cooling'::TEXT; RETURN;
  END IF;

  _days := EXTRACT(DAY FROM (now() - _row.added_at))::INT;
  UPDATE public.wishlist SET purchased_at = now() WHERE id = _wishlist_id;

  IF _days >= 7 THEN
    UPDATE public.profiles SET patience_score = patience_score + 1
    WHERE user_id = _uid
    RETURNING patience_score INTO _new_patience;
  ELSE
    SELECT patience_score INTO _new_patience FROM public.profiles WHERE user_id = _uid;
  END IF;

  RETURN QUERY SELECT true, _days, COALESCE(_new_patience, 0), 'ok'::TEXT;
END $$;

-- 6) 家长后台设置延迟系数
CREATE OR REPLACE FUNCTION public.set_parent_delay_hours(_hours INT, _cap INT DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _uid UUID := auth.uid();
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'auth required'; END IF;
  IF _hours NOT IN (1,24,72) THEN RAISE EXCEPTION 'invalid hours'; END IF;
  INSERT INTO public.parent_delay_settings(user_id, delay_hours, daily_seed_cap, updated_at)
  VALUES (_uid, _hours, COALESCE(_cap, 50), now())
  ON CONFLICT (user_id) DO UPDATE
    SET delay_hours = EXCLUDED.delay_hours,
        daily_seed_cap = COALESCE(_cap, public.parent_delay_settings.daily_seed_cap),
        updated_at = now();
END $$;

-- 7) 周报：宠物成长信的数据来源
CREATE OR REPLACE FUNCTION public.weekly_growth_letter()
RETURNS TABLE(
  active_days INT,
  quiz_correct INT,
  minutes_active INT,
  weak_module TEXT,
  pet_name TEXT,
  pet_level INT,
  patience_score INT
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _wk TIMESTAMPTZ := date_trunc('week', now());
BEGIN
  IF _uid IS NULL THEN RETURN; END IF;
  RETURN QUERY
  SELECT
    (SELECT COUNT(DISTINCT date_trunc('day', created_at))::INT
       FROM learning_events WHERE user_id = _uid AND created_at >= _wk),
    (SELECT COALESCE(SUM(quiz_correct),0)::INT
       FROM learning_events WHERE user_id = _uid AND created_at >= _wk),
    (SELECT COALESCE(ROUND(SUM(active_seconds)/60.0)::INT, 0)
       FROM learning_heartbeats WHERE user_id = _uid AND created_at >= _wk),
    (SELECT module FROM gaokao_user_mistakes
       WHERE user_id = _uid AND is_resolved = false
       GROUP BY module ORDER BY COUNT(*) DESC LIMIT 1),
    (SELECT nickname FROM user_pets WHERE user_id = _uid AND is_active = true LIMIT 1),
    (SELECT level FROM user_pets WHERE user_id = _uid AND is_active = true LIMIT 1),
    (SELECT COALESCE(patience_score, 0) FROM profiles WHERE user_id = _uid);
END $$;
