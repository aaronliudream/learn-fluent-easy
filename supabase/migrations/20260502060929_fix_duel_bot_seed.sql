CREATE OR REPLACE FUNCTION public.match_duel_bot()
 RETURNS TABLE(opponent_id uuid, opponent_alias text, opponent_rating integer, match_seed text, is_bot boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  seed := replace(gen_random_uuid()::text, '-', '');

  RETURN QUERY SELECT NULL::uuid, bot_name, bot_rating, seed, true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.find_duel_opponent(_rating_range integer DEFAULT 200)
 RETURNS TABLE(opponent_id uuid, opponent_alias text, opponent_rating integer, match_seed text, is_bot boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

  SELECT q.user_id, q.rating
    INTO opp_id, opp_rating
  FROM word_duel_queue q
  WHERE q.user_id <> uid
    AND q.matched_with IS NULL
    AND ABS(q.rating - my_rating) <= _rating_range
  ORDER BY ABS(q.rating - my_rating) ASC, q.joined_at ASC
  LIMIT 1;

  IF opp_id IS NOT NULL THEN
    seed := replace(gen_random_uuid()::text, '-', '');
    UPDATE word_duel_queue SET matched_with = uid, match_seed = seed WHERE user_id = opp_id;
    DELETE FROM word_duel_queue WHERE user_id = uid;
    SELECT COALESCE(p.leaderboard_alias, 'Player #' || substr(opp_id::text, 1, 4))
      INTO opp_alias FROM profiles p WHERE p.user_id = opp_id;
    RETURN QUERY SELECT opp_id, opp_alias, opp_rating, seed, false;
    RETURN;
  END IF;

  INSERT INTO word_duel_queue(user_id, rating) VALUES (uid, my_rating)
  ON CONFLICT (user_id) DO UPDATE SET rating = EXCLUDED.rating, joined_at = now(), matched_with = NULL, match_seed = NULL;

  RETURN QUERY SELECT NULL::uuid, NULL::text, NULL::integer, NULL::text, false;
END;
$function$;
