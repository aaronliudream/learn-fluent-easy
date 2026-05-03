
-- Fix ambiguous column refs in award_learning_coins(integer, text)
CREATE OR REPLACE FUNCTION public.award_learning_coins(_amount integer, _source text DEFAULT 'study'::text)
RETURNS TABLE(awarded integer, balance integer, capped boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
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
    RETURN QUERY SELECT 0, COALESCE((SELECT uc.balance FROM public.user_coins uc WHERE uc.user_id=uid),0), false;
    RETURN;
  END IF;

  INSERT INTO public.daily_coin_log(user_id, log_date, earned) VALUES (uid, today, 0)
    ON CONFLICT (user_id, log_date) DO NOTHING;
  SELECT dcl.earned INTO already FROM public.daily_coin_log dcl WHERE dcl.user_id=uid AND dcl.log_date=today;

  give := LEAST(_amount, GREATEST(0, cap - COALESCE(already,0)));
  IF give < _amount THEN was_capped := true; END IF;

  IF give > 0 THEN
    UPDATE public.daily_coin_log dcl SET earned = dcl.earned + give
      WHERE dcl.user_id=uid AND dcl.log_date=today;
    INSERT INTO public.user_coins(user_id, balance, total_earned, updated_at)
    VALUES (uid, give, give, now())
    ON CONFLICT (user_id) DO UPDATE
      SET balance = public.user_coins.balance + EXCLUDED.balance,
          total_earned = public.user_coins.total_earned + EXCLUDED.total_earned,
          updated_at = now()
    RETURNING public.user_coins.balance INTO new_bal;
  ELSE
    SELECT uc.balance INTO new_bal FROM public.user_coins uc WHERE uc.user_id=uid;
  END IF;

  RETURN QUERY SELECT give, COALESCE(new_bal,0), was_capped;
END $function$;

-- Fix ambiguous cooldown_until / column refs in submit_stage_test
CREATE OR REPLACE FUNCTION public.submit_stage_test(
  _test_id uuid, _correct int, _total int, _new_question_count int DEFAULT 0
) RETURNS TABLE(
  passed boolean, score real, coins_awarded int, exp_awarded int,
  cooldown_until timestamptz, message text,
  new_balance int, new_pet_level int, evolved boolean
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  uid uuid := auth.uid();
  t public.stage_tests%ROWTYPE;
  prev_passes int := 0;
  prev_attempts int := 0;
  active_cd timestamptz;
  s real;
  did_pass boolean;
  award_coins_v int := 0;
  award_exp_v int := 0;
  new_qratio real;
  attempt_no_v int;
  cd timestamptz;
  msg text := '';
  bal int := 0;
  today_coin int := 0;
  today_exp int := 0;
  pet_id_v uuid;
  pet_lvl int := 0;
  did_evolve boolean := false;
  exp_to_next int;
  pet_row public.user_pets%ROWTYPE;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF _total <= 0 THEN RAISE EXCEPTION 'invalid total'; END IF;
  IF _correct < 0 OR _correct > _total THEN RAISE EXCEPTION 'invalid correct count'; END IF;

  SELECT * INTO t FROM public.stage_tests st WHERE st.id = _test_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'test not found'; END IF;

  SELECT a.cooldown_until INTO active_cd
  FROM public.stage_test_attempts a
  WHERE a.user_id = uid AND a.test_id = _test_id
  ORDER BY a.created_at DESC LIMIT 1;

  IF active_cd IS NOT NULL AND active_cd > now() THEN
    RAISE EXCEPTION 'still in cooldown until %', active_cd;
  END IF;

  SELECT
    COUNT(*) FILTER (WHERE a.passed)::int,
    COUNT(*)::int
  INTO prev_passes, prev_attempts
  FROM public.stage_test_attempts a
  WHERE a.user_id = uid AND a.test_id = _test_id;

  attempt_no_v := prev_attempts + 1;
  s := _correct::real / _total::real;
  did_pass := s >= t.pass_threshold;
  new_qratio := CASE WHEN _total > 0 THEN _new_question_count::real / _total::real ELSE 0 END;

  IF did_pass THEN
    IF prev_passes = 0 OR new_qratio >= 0.6 THEN
      award_coins_v := CASE prev_passes
        WHEN 0 THEN t.base_coins
        WHEN 1 THEN (t.base_coins * 0.5)::int
        WHEN 2 THEN (t.base_coins * 0.25)::int
        ELSE 0
      END;
      award_exp_v := CASE prev_passes
        WHEN 0 THEN t.base_exp
        WHEN 1 THEN (t.base_exp * 0.5)::int
        WHEN 2 THEN (t.base_exp * 0.25)::int
        ELSE 0
      END;
      IF prev_passes = 0 AND _correct = _total THEN
        award_coins_v := (award_coins_v * 1.5)::int;
        award_exp_v := (award_exp_v * 1.5)::int;
        msg := '🎉 首次满分！额外 +50% 奖励';
      END IF;
    ELSE
      msg := '⚠️ 重考时新题占比不足 60%，本次不发放奖励';
    END IF;
    cd := now() + interval '48 hours';
  ELSE
    cd := now() + interval '24 hours';
    msg := '继续加油，24 小时后可重考';
  END IF;

  SELECT
    COALESCE(SUM(a.coins_awarded), 0),
    COALESCE(SUM(a.exp_awarded), 0)
  INTO today_coin, today_exp
  FROM public.stage_test_attempts a
  WHERE a.user_id = uid AND a.created_at > date_trunc('day', now() AT TIME ZONE 'UTC');

  IF today_coin + award_coins_v > 500 THEN
    award_coins_v := GREATEST(0, 500 - today_coin);
    msg := msg || ' · 今日金币已达上限';
  END IF;
  IF today_exp + award_exp_v > 200 THEN
    award_exp_v := GREATEST(0, 200 - today_exp);
  END IF;

  INSERT INTO public.stage_test_attempts(
    user_id, test_id, attempt_no, correct_count, total_count,
    new_question_count, score, passed, coins_awarded, exp_awarded, cooldown_until
  ) VALUES (
    uid, _test_id, attempt_no_v, _correct, _total,
    _new_question_count, s, did_pass, award_coins_v, award_exp_v, cd
  );

  IF award_coins_v > 0 THEN
    INSERT INTO public.user_coins(user_id, balance, total_earned)
    VALUES (uid, award_coins_v, award_coins_v)
    ON CONFLICT (user_id) DO UPDATE
      SET balance = public.user_coins.balance + EXCLUDED.balance,
          total_earned = public.user_coins.total_earned + EXCLUDED.total_earned,
          updated_at = now()
    RETURNING public.user_coins.balance INTO bal;
  ELSE
    SELECT uc.balance INTO bal FROM public.user_coins uc WHERE uc.user_id = uid;
  END IF;

  IF award_exp_v > 0 THEN
    SELECT up.id INTO pet_id_v FROM public.user_pets up WHERE up.user_id = uid AND up.is_active = true LIMIT 1;
    IF pet_id_v IS NOT NULL THEN
      SELECT * INTO pet_row FROM public.user_pets WHERE id = pet_id_v;
      pet_row.exp := pet_row.exp + award_exp_v;
      exp_to_next := pet_row.level * 100;
      WHILE pet_row.exp >= exp_to_next LOOP
        pet_row.exp := pet_row.exp - exp_to_next;
        pet_row.level := pet_row.level + 1;
        exp_to_next := pet_row.level * 100;
      END LOOP;
      IF pet_row.stage = 0 AND pet_row.level >= 1 THEN
        pet_row.stage := 1; did_evolve := true;
        pet_row.hatched_at := COALESCE(pet_row.hatched_at, now());
      ELSIF pet_row.stage = 1 AND pet_row.level >= 5 THEN
        pet_row.stage := 2; did_evolve := true;
      ELSIF pet_row.stage = 2 AND pet_row.level >= 15 THEN
        pet_row.stage := 3; did_evolve := true;
      END IF;
      UPDATE public.user_pets SET exp=pet_row.exp, level=pet_row.level, stage=pet_row.stage,
        hatched_at=pet_row.hatched_at, updated_at=now() WHERE id = pet_id_v;
      pet_lvl := pet_row.level;
    END IF;
  END IF;

  RETURN QUERY SELECT did_pass, s, award_coins_v, award_exp_v, cd, msg, COALESCE(bal,0), pet_lvl, did_evolve;
END $$;

-- Drop the older 1-arg overload to avoid future ambiguities
DROP FUNCTION IF EXISTS public.award_learning_coins(integer);
