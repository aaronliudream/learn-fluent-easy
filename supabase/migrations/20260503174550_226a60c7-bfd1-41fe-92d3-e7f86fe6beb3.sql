-- 反刷分日志：记录每次按 item 维度的金币发放
CREATE TABLE IF NOT EXISTS public.coin_award_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  module TEXT,
  item_id TEXT NOT NULL,
  source TEXT NOT NULL,
  amount INT NOT NULL,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_coin_award_log_user_item ON public.coin_award_log(user_id, item_id, awarded_at DESC);
ALTER TABLE public.coin_award_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users see own award log" ON public.coin_award_log FOR SELECT USING (auth.uid() = user_id);

-- 服务端反刷分发币 RPC
CREATE OR REPLACE FUNCTION public.award_for_item(
  _amount INT,
  _source TEXT,
  _item_id TEXT,
  _module TEXT DEFAULT NULL
)
RETURNS TABLE(awarded INT, balance INT, capped BOOLEAN, reason TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  recent_count INT;
  mastery_stars INT := 0;
  factor REAL := 1.0;
  final_amount INT;
  today_total INT;
  bal INT;
  reason_v TEXT := 'ok';
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF _amount IS NULL OR _amount <= 0 OR _item_id IS NULL OR _item_id = '' THEN
    RETURN QUERY SELECT 0, COALESCE((SELECT balance FROM user_coins WHERE user_id = uid),0), false, 'invalid';
    RETURN;
  END IF;

  -- 1) 已完美掌握的题：不发币
  IF _module IS NOT NULL THEN
    SELECT stars INTO mastery_stars FROM mastery_progress
      WHERE user_id = uid AND module = _module AND item_id = _item_id;
    IF COALESCE(mastery_stars, 0) >= 5 THEN
      RETURN QUERY SELECT 0, COALESCE((SELECT balance FROM user_coins WHERE user_id = uid),0), false, 'mastered';
      RETURN;
    END IF;
  END IF;

  -- 2) 24 小时内同题重复次数衰减
  SELECT COUNT(*) INTO recent_count FROM coin_award_log
    WHERE user_id = uid AND item_id = _item_id
      AND awarded_at > now() - interval '24 hours';
  IF recent_count = 0 THEN
    factor := 1.0;
  ELSIF recent_count = 1 THEN
    factor := 0.3;
    reason_v := 'repeat_30pct';
  ELSE
    RETURN QUERY SELECT 0, COALESCE((SELECT balance FROM user_coins WHERE user_id = uid),0), false, 'repeat_zero';
    RETURN;
  END IF;

  final_amount := GREATEST(0, ROUND(_amount * factor)::int);
  IF final_amount = 0 THEN
    RETURN QUERY SELECT 0, COALESCE((SELECT balance FROM user_coins WHERE user_id = uid),0), false, reason_v;
    RETURN;
  END IF;

  -- 3) 每日封顶 500
  SELECT COALESCE(SUM(amount), 0) INTO today_total FROM coin_award_log
    WHERE user_id = uid AND awarded_at > date_trunc('day', now() AT TIME ZONE 'UTC');
  IF today_total >= 500 THEN
    RETURN QUERY SELECT 0, COALESCE((SELECT balance FROM user_coins WHERE user_id = uid),0), true, 'daily_cap';
    RETURN;
  END IF;
  IF today_total + final_amount > 500 THEN
    final_amount := 500 - today_total;
    reason_v := 'partial_cap';
  END IF;

  -- 4) 入账
  INSERT INTO user_coins(user_id, balance, total_earned)
    VALUES (uid, final_amount, final_amount)
    ON CONFLICT (user_id) DO UPDATE
      SET balance = user_coins.balance + EXCLUDED.balance,
          total_earned = user_coins.total_earned + EXCLUDED.total_earned,
          updated_at = now()
    RETURNING user_coins.balance INTO bal;

  INSERT INTO coin_award_log(user_id, module, item_id, source, amount)
    VALUES (uid, _module, _item_id, _source, final_amount);

  RETURN QUERY SELECT final_amount, bal, (today_total + final_amount >= 500), reason_v;
END;
$$;