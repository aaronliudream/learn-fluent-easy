
ALTER TABLE public.user_pets
  ADD COLUMN IF NOT EXISTS last_decay_at timestamptz NOT NULL DEFAULT now();

CREATE OR REPLACE FUNCTION public.tick_pet_hunger(_pet_id uuid)
RETURNS TABLE(hunger int, mood int, decayed int)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  uid uuid := auth.uid();
  p user_pets%ROWTYPE;
  hours int;
  dec int;
  new_hunger int;
  new_mood int;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT * INTO p FROM user_pets WHERE id=_pet_id AND user_id=uid;
  IF NOT FOUND THEN RAISE EXCEPTION 'pet not found'; END IF;

  hours := GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (now() - p.last_decay_at))/3600)::int);
  IF hours <= 0 THEN
    RETURN QUERY SELECT p.hunger::int, p.mood::int, 0;
    RETURN;
  END IF;

  dec := LEAST(100, hours * 2); -- 每小时 -2
  new_hunger := GREATEST(0, p.hunger - dec);
  -- 心情：饱足回升，饥饿下降
  IF new_hunger >= 60 THEN
    new_mood := LEAST(100, p.mood + LEAST(hours, 10));
  ELSIF new_hunger < 20 THEN
    new_mood := GREATEST(0, p.mood - LEAST(hours * 3, 30));
  ELSE
    new_mood := p.mood;
  END IF;

  UPDATE user_pets
    SET hunger = new_hunger,
        mood = new_mood,
        last_decay_at = now()
    WHERE id = _pet_id;

  RETURN QUERY SELECT new_hunger, new_mood, dec;
END $$;

CREATE OR REPLACE FUNCTION public.get_my_active_pet()
RETURNS TABLE(
  id uuid, species_id text, nickname text, stage smallint,
  level int, exp int, hunger int, mood int
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  uid uuid := auth.uid();
  pid uuid;
BEGIN
  IF uid IS NULL THEN RETURN; END IF;
  SELECT up.id INTO pid FROM user_pets up
    WHERE up.user_id=uid AND up.is_active=true
    LIMIT 1;
  IF pid IS NULL THEN RETURN; END IF;
  PERFORM public.tick_pet_hunger(pid);
  RETURN QUERY
    SELECT up.id, up.species_id, up.nickname, up.stage,
           up.level::int, up.exp::int, up.hunger::int, up.mood::int
    FROM user_pets up WHERE up.id = pid;
END $$;
