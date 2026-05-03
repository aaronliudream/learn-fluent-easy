CREATE OR REPLACE FUNCTION public.adopt_pet(_species_id text, _nickname text)
RETURNS TABLE(pet_id uuid, balance int)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  uid uuid := auth.uid();
  cost int;
  bal int;
  new_pet_id uuid;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT adopt_cost INTO cost FROM pet_species WHERE id = _species_id;
  IF cost IS NULL THEN RAISE EXCEPTION 'species not found'; END IF;

  SELECT uc.balance INTO bal FROM user_coins uc WHERE uc.user_id = uid;
  IF COALESCE(bal,0) < cost THEN RAISE EXCEPTION 'not enough coins'; END IF;

  UPDATE user_coins SET balance = user_coins.balance - cost, updated_at = now()
    WHERE user_id = uid
    RETURNING user_coins.balance INTO bal;

  INSERT INTO user_pets(user_id, species_id, nickname, stage, hatched_at, is_active)
  VALUES (uid, _species_id, _nickname, 0, NULL, NOT EXISTS(SELECT 1 FROM user_pets WHERE user_id=uid))
  RETURNING id INTO new_pet_id;

  INSERT INTO pet_diary(user_id, pet_id, event_type, emoji, message)
  VALUES (uid, new_pet_id, 'adopt', '🥚', '欢迎新伙伴！蛋蛋孵化中…');

  RETURN QUERY SELECT new_pet_id, bal;
END $$;