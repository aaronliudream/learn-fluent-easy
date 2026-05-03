
DROP FUNCTION IF EXISTS public.feed_pet(uuid, text);

CREATE FUNCTION public.feed_pet(_pet_id uuid, _food_id text)
RETURNS TABLE(new_hunger int, new_exp int, new_level int, balance int, surprise text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  uid uuid := auth.uid();
  cost int := 0;
  bal int;
  pet record;
  food record;
  hunger_gain int;
  exp_gain int;
  surp text := NULL;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT * INTO pet FROM user_pets WHERE id=_pet_id AND user_id=uid;
  IF pet IS NULL THEN RAISE EXCEPTION 'pet not found'; END IF;
  SELECT * INTO food FROM pet_food WHERE id=_food_id;
  IF food IS NULL THEN RAISE EXCEPTION 'food not found'; END IF;
  cost := food.price;
  SELECT uc.balance INTO bal FROM user_coins uc WHERE uc.user_id=uid;
  IF COALESCE(bal,0) < cost THEN RAISE EXCEPTION 'not enough coins'; END IF;
  UPDATE user_coins SET balance=user_coins.balance-cost, updated_at=now()
    WHERE user_id=uid RETURNING user_coins.balance INTO bal;

  hunger_gain := COALESCE(food.hunger_restore,10);
  exp_gain := COALESCE(food.exp_gain,5);
  UPDATE user_pets
    SET hunger = LEAST(100, hunger + hunger_gain),
        exp = exp + exp_gain,
        updated_at=now()
    WHERE id=_pet_id
    RETURNING hunger, exp, level INTO new_hunger, new_exp, new_level;

  IF random() < 0.05 THEN
    surp := 'lucky_coin';
    UPDATE user_coins SET balance=user_coins.balance+10, total_earned=total_earned+10, updated_at=now()
      WHERE user_id=uid RETURNING user_coins.balance INTO bal;
  END IF;

  RETURN QUERY SELECT new_hunger, new_exp, new_level, bal, surp;
END $$;
