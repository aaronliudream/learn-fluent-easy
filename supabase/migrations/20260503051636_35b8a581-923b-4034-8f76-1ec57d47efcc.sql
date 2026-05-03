CREATE OR REPLACE FUNCTION public.buy_pet_food(_food_id text, _qty int)
RETURNS TABLE(new_qty int, balance int)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  uid uuid := auth.uid();
  price int;
  total int;
  bal int;
  q int;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF _qty IS NULL OR _qty <= 0 THEN RAISE EXCEPTION 'invalid qty'; END IF;

  SELECT pet_food_items.price INTO price FROM pet_food_items WHERE id=_food_id;
  IF price IS NULL THEN RAISE EXCEPTION 'food not found'; END IF;
  total := price * _qty;

  SELECT uc.balance INTO bal FROM user_coins uc WHERE uc.user_id=uid;
  IF COALESCE(bal,0) < total THEN RAISE EXCEPTION 'not enough coins'; END IF;

  UPDATE user_coins SET balance = user_coins.balance - total, updated_at=now()
    WHERE user_id=uid
    RETURNING user_coins.balance INTO bal;

  INSERT INTO pet_inventory(user_id, food_id, qty) VALUES (uid, _food_id, _qty)
  ON CONFLICT (user_id, food_id) DO UPDATE SET qty = pet_inventory.qty + EXCLUDED.qty, updated_at=now()
  RETURNING pet_inventory.qty INTO q;

  RETURN QUERY SELECT q, bal;
END $$;

CREATE OR REPLACE FUNCTION public.award_learning_coins(_amount int)
RETURNS TABLE(awarded int, balance int, capped boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  uid uuid := auth.uid();
  today date := ((now() AT TIME ZONE 'UTC') - interval '4 hours')::date;
  already int;
  cap int := 500;
  give int;
  new_bal int;
  was_capped boolean := false;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF _amount IS NULL OR _amount <= 0 THEN
    RETURN QUERY SELECT 0, COALESCE((SELECT uc.balance FROM user_coins uc WHERE uc.user_id=uid),0), false;
    RETURN;
  END IF;

  INSERT INTO daily_coin_log(user_id, log_date, earned) VALUES (uid, today, 0)
    ON CONFLICT (user_id, log_date) DO NOTHING;
  SELECT dcl.earned INTO already FROM daily_coin_log dcl WHERE dcl.user_id=uid AND dcl.log_date=today;

  give := LEAST(_amount, GREATEST(0, cap - already));
  IF give < _amount THEN was_capped := true; END IF;

  IF give > 0 THEN
    UPDATE daily_coin_log SET earned = daily_coin_log.earned + give WHERE user_id=uid AND log_date=today;
    INSERT INTO user_coins(user_id, balance, total_earned, updated_at)
    VALUES (uid, give, give, now())
    ON CONFLICT (user_id) DO UPDATE
      SET balance = user_coins.balance + give,
          total_earned = user_coins.total_earned + give,
          updated_at = now()
    RETURNING user_coins.balance INTO new_bal;
  ELSE
    SELECT uc.balance INTO new_bal FROM user_coins uc WHERE uc.user_id=uid;
  END IF;

  RETURN QUERY SELECT give, COALESCE(new_bal,0), was_capped;
END $$;