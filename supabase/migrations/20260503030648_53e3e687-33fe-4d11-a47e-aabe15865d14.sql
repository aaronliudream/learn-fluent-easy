
CREATE TABLE public.user_social_settings (
  user_id uuid PRIMARY KEY,
  social_visible boolean NOT NULL DEFAULT true,
  grade_band text,
  display_emoji text DEFAULT '🌟',
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_social_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone read social settings" ON public.user_social_settings FOR SELECT USING (true);
CREATE POLICY "users insert own social settings" ON public.user_social_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own social settings" ON public.user_social_settings FOR UPDATE USING (auth.uid() = user_id);

CREATE TABLE public.user_presence (
  user_id uuid PRIMARY KEY,
  last_seen timestamptz NOT NULL DEFAULT now(),
  grade_band text,
  current_page text
);
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone read presence" ON public.user_presence FOR SELECT USING (true);
CREATE POLICY "users insert own presence" ON public.user_presence FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own presence" ON public.user_presence FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX idx_presence_last_seen ON public.user_presence(last_seen DESC);

CREATE TABLE public.activity_feed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL,
  emoji text,
  message text NOT NULL,
  grade_band text,
  meta jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_feed_recent ON public.activity_feed(created_at DESC);
CREATE INDEX idx_feed_user ON public.activity_feed(user_id, created_at DESC);
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone read feed" ON public.activity_feed FOR SELECT USING (true);

CREATE TABLE public.pet_food_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL,
  food_id text NOT NULL REFERENCES public.pet_food_items(id),
  qty int NOT NULL CHECK (qty > 0),
  price_per_unit int NOT NULL CHECK (price_per_unit >= 1 AND price_per_unit <= 999),
  status text NOT NULL DEFAULT 'active',
  buyer_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  sold_at timestamptz
);
CREATE INDEX idx_listing_active ON public.pet_food_listings(status, created_at DESC) WHERE status='active';
CREATE INDEX idx_listing_seller ON public.pet_food_listings(seller_id);
ALTER TABLE public.pet_food_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone read listings" ON public.pet_food_listings FOR SELECT USING (true);

CREATE TABLE public.pet_food_gifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user uuid NOT NULL,
  to_user uuid NOT NULL,
  food_id text NOT NULL REFERENCES public.pet_food_items(id),
  qty int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  claimed_at timestamptz
);
CREATE INDEX idx_gift_to ON public.pet_food_gifts(to_user, created_at DESC);
CREATE INDEX idx_gift_from_day ON public.pet_food_gifts(from_user, created_at);
ALTER TABLE public.pet_food_gifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users see gifts to/from self" ON public.pet_food_gifts FOR SELECT USING (auth.uid() IN (from_user, to_user));
CREATE POLICY "users update gifts to self" ON public.pet_food_gifts FOR UPDATE USING (auth.uid() = to_user);

CREATE TABLE public.user_waves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user uuid NOT NULL,
  to_user uuid NOT NULL,
  emoji text NOT NULL DEFAULT '✨',
  wave_date date NOT NULL DEFAULT ((now() AT TIME ZONE 'UTC')::date),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_waves_unique_day ON public.user_waves(from_user, to_user, wave_date);
CREATE INDEX idx_waves_to ON public.user_waves(to_user, created_at DESC);
ALTER TABLE public.user_waves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users see waves to/from self" ON public.user_waves FOR SELECT USING (auth.uid() IN (from_user, to_user));

CREATE TABLE public.coop_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_correct int NOT NULL DEFAULT 20,
  current_correct int NOT NULL DEFAULT 0,
  grade_band text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 minutes')
);
CREATE TABLE public.coop_session_members (
  session_id uuid NOT NULL REFERENCES public.coop_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  contributed int NOT NULL DEFAULT 0,
  PRIMARY KEY (session_id, user_id)
);
CREATE INDEX idx_coop_open ON public.coop_sessions(grade_band, status) WHERE status IN ('open','active');
ALTER TABLE public.coop_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coop_session_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone read coop" ON public.coop_sessions FOR SELECT USING (true);
CREATE POLICY "anyone read coop members" ON public.coop_session_members FOR SELECT USING (true);

-- ===== RPC =====

CREATE OR REPLACE FUNCTION public.presence_ping(_grade text DEFAULT NULL, _page text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RETURN; END IF;
  INSERT INTO user_presence(user_id, last_seen, grade_band, current_page)
  VALUES (uid, now(), _grade, _page)
  ON CONFLICT (user_id) DO UPDATE
    SET last_seen=now(),
        grade_band=COALESCE(EXCLUDED.grade_band, user_presence.grade_band),
        current_page=COALESCE(EXCLUDED.current_page, user_presence.current_page);
  -- 顺便确保社交设置存在
  INSERT INTO user_social_settings(user_id, grade_band)
  VALUES (uid, _grade) ON CONFLICT (user_id) DO UPDATE
    SET grade_band=COALESCE(EXCLUDED.grade_band, user_social_settings.grade_band);
END $$;

CREATE OR REPLACE FUNCTION public.online_count(_grade text DEFAULT NULL)
RETURNS int LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT COUNT(*)::int FROM user_presence p
  LEFT JOIN user_social_settings s ON s.user_id=p.user_id
  WHERE p.last_seen > now() - interval '2 minutes'
    AND COALESCE(s.social_visible, true) = true
    AND (_grade IS NULL OR p.grade_band = _grade);
$$;

CREATE OR REPLACE FUNCTION public.post_activity(_kind text, _emoji text, _message text, _meta jsonb DEFAULT '{}')
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  uid uuid := auth.uid();
  recent int;
  vis boolean;
  band text;
  new_id uuid;
BEGIN
  IF uid IS NULL THEN RETURN NULL; END IF;
  IF length(_message) > 80 THEN RAISE EXCEPTION 'msg too long'; END IF;
  SELECT social_visible, grade_band INTO vis, band FROM user_social_settings WHERE user_id=uid;
  IF vis IS DISTINCT FROM true THEN RETURN NULL; END IF;
  SELECT COUNT(*) INTO recent FROM activity_feed WHERE user_id=uid AND created_at > now() - interval '1 minute';
  IF recent >= 3 THEN RETURN NULL; END IF;
  INSERT INTO activity_feed(user_id, kind, emoji, message, grade_band, meta)
  VALUES (uid, _kind, _emoji, _message, band, COALESCE(_meta,'{}'::jsonb))
  RETURNING id INTO new_id;
  RETURN new_id;
END $$;

CREATE OR REPLACE FUNCTION public.list_food(_food_id text, _qty int, _price int)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid := auth.uid(); cur int; new_id uuid;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not auth'; END IF;
  IF _qty <= 0 OR _qty > 99 THEN RAISE EXCEPTION 'invalid qty'; END IF;
  IF _price < 1 OR _price > 999 THEN RAISE EXCEPTION 'invalid price'; END IF;
  SELECT qty INTO cur FROM pet_inventory WHERE user_id=uid AND food_id=_food_id;
  IF cur IS NULL OR cur < _qty THEN RAISE EXCEPTION 'not enough food'; END IF;
  UPDATE pet_inventory SET qty = qty - _qty, updated_at=now() WHERE user_id=uid AND food_id=_food_id;
  INSERT INTO pet_food_listings(seller_id, food_id, qty, price_per_unit)
  VALUES (uid, _food_id, _qty, _price) RETURNING id INTO new_id;
  RETURN new_id;
END $$;

CREATE OR REPLACE FUNCTION public.cancel_listing(_listing_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid := auth.uid(); r record;
BEGIN
  SELECT * INTO r FROM pet_food_listings WHERE id=_listing_id FOR UPDATE;
  IF r IS NULL OR r.seller_id != uid OR r.status != 'active' THEN RAISE EXCEPTION 'invalid'; END IF;
  UPDATE pet_food_listings SET status='cancelled' WHERE id=_listing_id;
  INSERT INTO pet_inventory(user_id, food_id, qty) VALUES (uid, r.food_id, r.qty)
  ON CONFLICT (user_id, food_id) DO UPDATE SET qty=pet_inventory.qty + r.qty, updated_at=now();
END $$;

CREATE OR REPLACE FUNCTION public.buy_listing(_listing_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid := auth.uid(); r record; total int; bal int;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not auth'; END IF;
  SELECT * INTO r FROM pet_food_listings WHERE id=_listing_id FOR UPDATE;
  IF r IS NULL OR r.status != 'active' THEN RAISE EXCEPTION 'unavailable'; END IF;
  IF r.seller_id = uid THEN RAISE EXCEPTION 'cannot buy own'; END IF;
  total := r.qty * r.price_per_unit;
  SELECT balance INTO bal FROM user_coins WHERE user_id=uid;
  IF COALESCE(bal,0) < total THEN RAISE EXCEPTION 'insufficient coins'; END IF;
  UPDATE user_coins SET balance = balance - total, updated_at=now() WHERE user_id=uid;
  INSERT INTO user_coins(user_id, balance, total_earned) VALUES (r.seller_id, total, total)
  ON CONFLICT (user_id) DO UPDATE SET balance=user_coins.balance + total, updated_at=now();
  INSERT INTO pet_inventory(user_id, food_id, qty) VALUES (uid, r.food_id, r.qty)
  ON CONFLICT (user_id, food_id) DO UPDATE SET qty=pet_inventory.qty + r.qty, updated_at=now();
  UPDATE pet_food_listings SET status='sold', buyer_id=uid, sold_at=now() WHERE id=_listing_id;
END $$;

CREATE OR REPLACE FUNCTION public.send_gift(_to_user uuid, _food_id text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid := auth.uid(); used int;
BEGIN
  IF uid IS NULL OR _to_user IS NULL OR _to_user = uid THEN RAISE EXCEPTION 'invalid recipient'; END IF;
  SELECT COUNT(*) INTO used FROM pet_food_gifts
   WHERE from_user=uid AND created_at::date = (now() AT TIME ZONE 'UTC')::date;
  IF used >= 3 THEN RAISE EXCEPTION 'daily gift limit reached'; END IF;
  INSERT INTO pet_food_gifts(from_user, to_user, food_id, qty) VALUES (uid, _to_user, _food_id, 1);
  INSERT INTO pet_inventory(user_id, food_id, qty) VALUES (_to_user, _food_id, 1)
  ON CONFLICT (user_id, food_id) DO UPDATE SET qty=pet_inventory.qty + 1, updated_at=now();
END $$;

CREATE OR REPLACE FUNCTION public.send_wave(_to_user uuid, _emoji text DEFAULT '✨')
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid := auth.uid(); used int;
BEGIN
  IF uid IS NULL OR _to_user IS NULL OR _to_user = uid THEN RAISE EXCEPTION 'invalid'; END IF;
  SELECT COUNT(*) INTO used FROM user_waves
   WHERE from_user=uid AND wave_date = (now() AT TIME ZONE 'UTC')::date;
  IF used >= 5 THEN RAISE EXCEPTION 'daily wave limit'; END IF;
  INSERT INTO user_waves(from_user, to_user, emoji) VALUES (uid, _to_user, _emoji);
  INSERT INTO user_coins(user_id, balance, total_earned) VALUES (_to_user, 1, 1)
  ON CONFLICT (user_id) DO UPDATE SET balance=user_coins.balance + 1, updated_at=now();
END $$;

CREATE OR REPLACE FUNCTION public.coop_join(_grade text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid := auth.uid(); sid uuid; member_count int;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not auth'; END IF;
  SELECT s.id INTO sid FROM coop_sessions s
  JOIN coop_session_members m ON m.session_id=s.id AND m.user_id=uid
  WHERE s.status IN ('open','active') AND s.expires_at > now()
  LIMIT 1;
  IF sid IS NOT NULL THEN RETURN sid; END IF;
  SELECT s.id INTO sid FROM coop_sessions s
  WHERE s.status='open' AND s.grade_band=_grade AND s.expires_at > now()
    AND (SELECT COUNT(*) FROM coop_session_members WHERE session_id=s.id) < 3
  ORDER BY s.created_at LIMIT 1;
  IF sid IS NULL THEN
    INSERT INTO coop_sessions(grade_band) VALUES (_grade) RETURNING id INTO sid;
  END IF;
  INSERT INTO coop_session_members(session_id, user_id) VALUES (sid, uid)
    ON CONFLICT DO NOTHING;
  SELECT COUNT(*) INTO member_count FROM coop_session_members WHERE session_id=sid;
  IF member_count >= 2 THEN UPDATE coop_sessions SET status='active' WHERE id=sid AND status='open'; END IF;
  RETURN sid;
END $$;

CREATE OR REPLACE FUNCTION public.coop_contribute(_session_id uuid, _correct int)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid := auth.uid(); s record;
BEGIN
  IF uid IS NULL OR _correct <= 0 OR _correct > 50 THEN RETURN; END IF;
  SELECT * INTO s FROM coop_sessions WHERE id=_session_id FOR UPDATE;
  IF s IS NULL OR s.status NOT IN ('open','active') OR s.expires_at < now() THEN RETURN; END IF;
  UPDATE coop_session_members SET contributed = contributed + _correct
   WHERE session_id=_session_id AND user_id=uid;
  UPDATE coop_sessions SET current_correct = current_correct + _correct WHERE id=_session_id;
  IF (s.current_correct + _correct) >= s.goal_correct THEN
    UPDATE coop_sessions SET status='completed', completed_at=now() WHERE id=_session_id;
    INSERT INTO user_coins(user_id, balance, total_earned)
    SELECT user_id, 50, 50 FROM coop_session_members WHERE session_id=_session_id
    ON CONFLICT (user_id) DO UPDATE SET balance=user_coins.balance + 50, updated_at=now();
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.leaderboard_today(_grade text DEFAULT NULL, _limit int DEFAULT 20)
RETURNS TABLE(user_id uuid, username text, display_emoji text, earned int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT d.user_id, COALESCE(p.username,'同学') AS username, COALESCE(s.display_emoji,'🌟'), d.earned
  FROM daily_coin_log d
  LEFT JOIN profiles p ON p.user_id=d.user_id
  LEFT JOIN user_social_settings s ON s.user_id=d.user_id
  WHERE d.log_date = ((now() AT TIME ZONE 'UTC') - interval '4 hours')::date
    AND COALESCE(s.social_visible, true)=true
    AND (_grade IS NULL OR s.grade_band=_grade)
  ORDER BY d.earned DESC LIMIT _limit;
$$;

CREATE OR REPLACE FUNCTION public.leaderboard_pets_week(_grade text DEFAULT NULL, _limit int DEFAULT 20)
RETURNS TABLE(user_id uuid, username text, display_emoji text, pet_emoji text, pet_name text, level int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT DISTINCT ON (up.user_id)
    up.user_id,
    COALESCE(p.username,'同学') AS username,
    COALESCE(s.display_emoji,'🌟'),
    CASE up.stage WHEN 0 THEN sp.emoji_egg WHEN 1 THEN sp.emoji_baby WHEN 2 THEN sp.emoji_adult ELSE sp.emoji_legend END,
    up.nickname,
    up.level::int
  FROM user_pets up
  JOIN pet_species sp ON sp.id=up.species_id
  LEFT JOIN profiles p ON p.user_id=up.user_id
  LEFT JOIN user_social_settings s ON s.user_id=up.user_id
  WHERE COALESCE(s.social_visible, true)=true
    AND (_grade IS NULL OR s.grade_band=_grade)
    AND up.updated_at > now() - interval '7 days'
  ORDER BY up.user_id, up.level DESC, up.exp DESC
  LIMIT _limit;
$$;
