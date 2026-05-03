
DROP FUNCTION IF EXISTS public.feed_pet(uuid, text);

CREATE FUNCTION public.feed_pet(_pet_id uuid, _food_id text)
RETURNS TABLE(new_hunger int, new_exp int, new_level int, new_stage int, evolved boolean, leveled boolean, message text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  uid uuid := auth.uid();
  pet_row user_pets%ROWTYPE;
  hres int; ebon int; mbon int;
  exp_to_next int;
  msg text := '';
  did_evolve boolean := false;
  did_level boolean := false;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT * INTO pet_row FROM user_pets WHERE id=_pet_id AND user_id=uid;
  IF NOT FOUND THEN RAISE EXCEPTION 'pet not found'; END IF;

  UPDATE pet_inventory SET qty = qty - 1, updated_at=now()
  WHERE user_id=uid AND food_id=_food_id AND qty > 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'no food in inventory'; END IF;

  SELECT hunger_restore, exp_bonus, mood_bonus INTO hres, ebon, mbon
  FROM pet_food_items WHERE id=_food_id;

  pet_row.hunger := LEAST(100, pet_row.hunger + hres);
  pet_row.mood := LEAST(100, pet_row.mood + mbon);
  pet_row.exp := pet_row.exp + ebon;
  pet_row.last_fed_at := now();

  exp_to_next := pet_row.level * 100;
  WHILE pet_row.exp >= exp_to_next LOOP
    pet_row.exp := pet_row.exp - exp_to_next;
    pet_row.level := pet_row.level + 1;
    did_level := true;
    exp_to_next := pet_row.level * 100;
  END LOOP;

  IF pet_row.stage = 0 AND pet_row.level >= 1 THEN
    pet_row.stage := 1; did_evolve := true; pet_row.hatched_at := COALESCE(pet_row.hatched_at, now()); msg := '🐣 蛋蛋孵化啦！';
  ELSIF pet_row.stage = 1 AND pet_row.level >= 5 THEN
    pet_row.stage := 2; did_evolve := true; msg := '🌟 进化成成年形态！';
  ELSIF pet_row.stage = 2 AND pet_row.level >= 15 THEN
    pet_row.stage := 3; did_evolve := true; msg := '👑 觉醒为传说之姿！';
  END IF;

  UPDATE user_pets SET
    hunger=pet_row.hunger, mood=pet_row.mood, exp=pet_row.exp, level=pet_row.level,
    stage=pet_row.stage, hatched_at=pet_row.hatched_at, last_fed_at=now(), updated_at=now()
  WHERE id=_pet_id;

  IF did_evolve THEN
    INSERT INTO pet_diary(user_id, pet_id, event_type, emoji, message)
    VALUES (uid, _pet_id, 'evolve', '✨', msg);
  ELSIF did_level THEN
    INSERT INTO pet_diary(user_id, pet_id, event_type, emoji, message)
    VALUES (uid, _pet_id, 'levelup', '⭐', '升到 Lv.' || pet_row.level || ' 啦！');
  END IF;

  RETURN QUERY SELECT pet_row.hunger::int, pet_row.exp::int, pet_row.level::int, pet_row.stage::int, did_evolve, did_level, msg;
END $$;

-- Also fix take_pet_outing's ambiguous balance
CREATE OR REPLACE FUNCTION public.take_pet_outing(_pet_id uuid, _dest_id text)
RETURNS TABLE(new_hunger int, new_exp int, new_level int, balance int, surprise text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  uid uuid := auth.uid();
  pet_row user_pets%ROWTYPE;
  cost int; hcost int; ereward int;
  bal int;
  surp text := '';
  exp_to_next int;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT * INTO pet_row FROM user_pets WHERE id=_pet_id AND user_id=uid;
  IF NOT FOUND THEN RAISE EXCEPTION 'pet not found'; END IF;
  IF pet_row.stage < 1 THEN RAISE EXCEPTION 'pet still in egg'; END IF;

  SELECT cost_coins, hunger_cost, exp_reward INTO cost, hcost, ereward
  FROM pet_destinations WHERE id=_dest_id;
  IF cost IS NULL THEN RAISE EXCEPTION 'destination not found'; END IF;

  IF pet_row.hunger < hcost THEN RAISE EXCEPTION 'pet too hungry to travel'; END IF;
  SELECT uc.balance INTO bal FROM user_coins uc WHERE uc.user_id=uid;
  IF COALESCE(bal,0) < cost THEN RAISE EXCEPTION 'not enough coins'; END IF;

  UPDATE user_coins SET balance=user_coins.balance-cost, updated_at=now()
    WHERE user_id=uid RETURNING user_coins.balance INTO bal;

  pet_row.hunger := pet_row.hunger - hcost;
  pet_row.exp := pet_row.exp + ereward;
  pet_row.mood := LEAST(100, pet_row.mood + 10);

  exp_to_next := pet_row.level * 100;
  WHILE pet_row.exp >= exp_to_next LOOP
    pet_row.exp := pet_row.exp - exp_to_next;
    pet_row.level := pet_row.level + 1;
    exp_to_next := pet_row.level * 100;
  END LOOP;

  IF random() < 0.1 THEN
    surp := '🎁 路上捡到 10 星币！';
    UPDATE user_coins SET balance=user_coins.balance+10, total_earned=total_earned+10, updated_at=now()
      WHERE user_id=uid RETURNING user_coins.balance INTO bal;
  END IF;

  UPDATE user_pets SET
    hunger=pet_row.hunger, mood=pet_row.mood, exp=pet_row.exp, level=pet_row.level,
    last_played_at=now(), updated_at=now()
  WHERE id=_pet_id;

  INSERT INTO pet_diary(user_id, pet_id, event_type, emoji, message)
  VALUES (uid, _pet_id, 'outing', '🗺️', '去 ' || (SELECT name_cn FROM pet_destinations WHERE id=_dest_id) || ' 玩了一趟');

  RETURN QUERY SELECT pet_row.hunger::int, pet_row.exp::int, pet_row.level::int, bal, surp;
END $$;
