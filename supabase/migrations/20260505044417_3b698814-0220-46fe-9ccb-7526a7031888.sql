
CREATE OR REPLACE FUNCTION public.award_referrer(
  _ref_user_id uuid,
  _card_id uuid,
  _amount int DEFAULT 2
)
RETURNS TABLE(awarded int, reason text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller uuid := auth.uid();
  item_key text;
  recent int;
  today_total int;
  final_amount int := GREATEST(0, _amount);
BEGIN
  IF caller IS NULL THEN
    RETURN QUERY SELECT 0, 'no_auth'; RETURN;
  END IF;
  IF _ref_user_id IS NULL OR _ref_user_id = caller THEN
    RETURN QUERY SELECT 0, 'self_or_null'; RETURN;
  END IF;

  -- Dedup: one ref-bonus per viewer per card, ever
  item_key := 'card_ref:' || _card_id::text || ':' || caller::text;
  SELECT COUNT(*) INTO recent FROM coin_award_log
    WHERE user_id = _ref_user_id AND item_id = item_key;
  IF recent > 0 THEN
    RETURN QUERY SELECT 0, 'already_rewarded'; RETURN;
  END IF;

  -- Daily cap on referrer (separate budget so it can't farm normal study coins): 50 / day from refs
  SELECT COALESCE(SUM(amount), 0) INTO today_total FROM coin_award_log
    WHERE user_id = _ref_user_id
      AND source = 'card_share_ref'
      AND awarded_at > date_trunc('day', now() AT TIME ZONE 'UTC');
  IF today_total >= 50 THEN
    RETURN QUERY SELECT 0, 'ref_daily_cap'; RETURN;
  END IF;
  IF today_total + final_amount > 50 THEN
    final_amount := 50 - today_total;
  END IF;
  IF final_amount <= 0 THEN
    RETURN QUERY SELECT 0, 'ref_daily_cap'; RETURN;
  END IF;

  INSERT INTO user_coins(user_id, balance, total_earned)
    VALUES (_ref_user_id, final_amount, final_amount)
    ON CONFLICT (user_id) DO UPDATE
      SET balance = user_coins.balance + EXCLUDED.balance,
          total_earned = user_coins.total_earned + EXCLUDED.total_earned,
          updated_at = now();

  INSERT INTO coin_award_log(user_id, module, item_id, source, amount)
    VALUES (_ref_user_id, 'card_quiz', item_key, 'card_share_ref', final_amount);

  RETURN QUERY SELECT final_amount, 'ok';
END;
$$;
