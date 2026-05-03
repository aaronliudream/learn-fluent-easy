
-- ============ 1. Friendships ============
CREATE TABLE IF NOT EXISTS public.pet_friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL,
  addressee_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','blocked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  CONSTRAINT pet_friendships_no_self CHECK (requester_id <> addressee_id),
  CONSTRAINT pet_friendships_unique UNIQUE (requester_id, addressee_id)
);
CREATE INDEX IF NOT EXISTS idx_pet_friendships_requester ON public.pet_friendships(requester_id, status);
CREATE INDEX IF NOT EXISTS idx_pet_friendships_addressee ON public.pet_friendships(addressee_id, status);

ALTER TABLE public.pet_friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users see own friendships"
  ON public.pet_friendships FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- All writes go through SECURITY DEFINER RPCs; deny direct mutation.
CREATE POLICY "no direct insert" ON public.pet_friendships FOR INSERT WITH CHECK (false);
CREATE POLICY "no direct update" ON public.pet_friendships FOR UPDATE USING (false);
CREATE POLICY "no direct delete" ON public.pet_friendships FOR DELETE USING (false);

-- ============ 2. Pet visit log (host-only visibility) ============
CREATE TABLE IF NOT EXISTS public.pet_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL,
  visitor_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pet_visits_no_self CHECK (host_id <> visitor_id)
);
CREATE INDEX IF NOT EXISTS idx_pet_visits_host ON public.pet_visits(host_id, created_at DESC);

ALTER TABLE public.pet_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "host sees own visits" ON public.pet_visits FOR SELECT USING (auth.uid() = host_id);
CREATE POLICY "no direct insert" ON public.pet_visits FOR INSERT WITH CHECK (false);
CREATE POLICY "no direct update" ON public.pet_visits FOR UPDATE USING (false);
CREATE POLICY "no direct delete" ON public.pet_visits FOR DELETE USING (false);

-- ============ 3. Pet photos (shared between two friends) ============
CREATE TABLE IF NOT EXISTS public.pet_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL,
  visitor_id uuid NOT NULL,
  caption text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pet_photos_no_self CHECK (host_id <> visitor_id),
  CONSTRAINT pet_photos_caption_len CHECK (caption IS NULL OR char_length(caption) <= 140)
);
CREATE INDEX IF NOT EXISTS idx_pet_photos_host ON public.pet_photos(host_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pet_photos_visitor ON public.pet_photos(visitor_id, created_at DESC);

ALTER TABLE public.pet_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "participants see photos"
  ON public.pet_photos FOR SELECT
  USING (auth.uid() = host_id OR auth.uid() = visitor_id);
CREATE POLICY "no direct insert" ON public.pet_photos FOR INSERT WITH CHECK (false);
CREATE POLICY "no direct update" ON public.pet_photos FOR UPDATE USING (false);
CREATE POLICY "no direct delete" ON public.pet_photos FOR DELETE USING (false);

-- ============ 4. Helper: are two users accepted friends? ============
CREATE OR REPLACE FUNCTION public.are_friends(_a uuid, _b uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM pet_friendships
    WHERE status = 'accepted'
      AND ((requester_id = _a AND addressee_id = _b)
        OR (requester_id = _b AND addressee_id = _a))
  );
$$;

-- ============ 5. Helper: is current user a minor? ============
CREATE OR REPLACE FUNCTION public.is_current_user_minor()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE((SELECT is_minor FROM profiles WHERE user_id = auth.uid()), false);
$$;

-- ============ 6. RPC: request friendship by username ============
CREATE OR REPLACE FUNCTION public.request_friend(_username text)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  target uuid;
  existing pet_friendships%ROWTYPE;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF _username IS NULL OR length(trim(_username)) < 2 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_username');
  END IF;

  SELECT user_id INTO target FROM profiles
   WHERE lower(username) = lower(trim(_username)) LIMIT 1;
  IF target IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'user_not_found');
  END IF;
  IF target = uid THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'cannot_befriend_self');
  END IF;

  -- Reuse if a row already exists either direction
  SELECT * INTO existing FROM pet_friendships
   WHERE (requester_id = uid AND addressee_id = target)
      OR (requester_id = target AND addressee_id = uid)
   LIMIT 1;

  IF existing.id IS NOT NULL THEN
    IF existing.status = 'accepted' THEN
      RETURN jsonb_build_object('ok', false, 'reason', 'already_friends');
    ELSIF existing.status = 'blocked' THEN
      RETURN jsonb_build_object('ok', false, 'reason', 'blocked');
    ELSIF existing.status = 'pending' AND existing.requester_id = uid THEN
      RETURN jsonb_build_object('ok', false, 'reason', 'already_requested');
    ELSIF existing.status = 'pending' AND existing.addressee_id = uid THEN
      -- Auto-accept: the other side already invited us
      UPDATE pet_friendships SET status = 'accepted', responded_at = now()
        WHERE id = existing.id;
      RETURN jsonb_build_object('ok', true, 'auto_accepted', true);
    END IF;
  END IF;

  -- Daily request rate limit: max 20 outgoing requests per day
  IF (SELECT COUNT(*) FROM pet_friendships
       WHERE requester_id = uid
         AND created_at >= now() - interval '24 hours') >= 20 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'rate_limited');
  END IF;

  INSERT INTO pet_friendships(requester_id, addressee_id, status)
    VALUES (uid, target, 'pending');
  RETURN jsonb_build_object('ok', true);
END $$;

-- ============ 7. RPC: respond to friend request ============
CREATE OR REPLACE FUNCTION public.respond_friend(_request_id uuid, _accept boolean)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE uid uuid := auth.uid(); r pet_friendships%ROWTYPE;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT * INTO r FROM pet_friendships WHERE id = _request_id FOR UPDATE;
  IF NOT FOUND OR r.addressee_id <> uid OR r.status <> 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_request');
  END IF;
  IF _accept THEN
    UPDATE pet_friendships SET status='accepted', responded_at=now() WHERE id=r.id;
  ELSE
    DELETE FROM pet_friendships WHERE id=r.id;
  END IF;
  RETURN jsonb_build_object('ok', true);
END $$;

-- ============ 8. RPC: remove friend ============
CREATE OR REPLACE FUNCTION public.remove_friend(_other uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  DELETE FROM pet_friendships
   WHERE status='accepted'
     AND ((requester_id = uid AND addressee_id = _other)
       OR (requester_id = _other AND addressee_id = uid));
  RETURN jsonb_build_object('ok', true);
END $$;

-- ============ 9. RPC: list friends with pet snapshot ============
CREATE OR REPLACE FUNCTION public.list_friends()
RETURNS TABLE(
  friend_id uuid,
  username text,
  display_name text,
  pet_emoji text,
  pet_nickname text,
  pet_level int,
  pet_stage int,
  pet_hunger int,
  is_online boolean
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RETURN; END IF;
  RETURN QUERY
  WITH friends AS (
    SELECT CASE WHEN requester_id = uid THEN addressee_id ELSE requester_id END AS fid
    FROM pet_friendships WHERE status='accepted'
      AND (requester_id = uid OR addressee_id = uid)
  )
  SELECT
    f.fid,
    p.username,
    p.display_name,
    CASE up.stage WHEN 0 THEN sp.emoji_egg WHEN 1 THEN sp.emoji_baby
                  WHEN 2 THEN sp.emoji_adult ELSE sp.emoji_legend END,
    up.nickname,
    up.level::int,
    up.stage::int,
    up.hunger::int,
    (up.updated_at > now() - interval '5 minutes')
  FROM friends f
  LEFT JOIN profiles p ON p.user_id = f.fid
  LEFT JOIN user_pets up ON up.user_id = f.fid AND up.is_active = true
  LEFT JOIN pet_species sp ON sp.id = up.species_id
  ORDER BY up.level DESC NULLS LAST;
END $$;

-- ============ 10. RPC: list pending requests (incoming + outgoing) ============
CREATE OR REPLACE FUNCTION public.list_friend_requests()
RETURNS TABLE(
  request_id uuid,
  direction text,
  other_id uuid,
  username text,
  display_name text,
  created_at timestamptz
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RETURN; END IF;
  RETURN QUERY
  SELECT
    pf.id,
    CASE WHEN pf.requester_id = uid THEN 'outgoing' ELSE 'incoming' END,
    CASE WHEN pf.requester_id = uid THEN pf.addressee_id ELSE pf.requester_id END,
    p.username,
    p.display_name,
    pf.created_at
  FROM pet_friendships pf
  LEFT JOIN profiles p ON p.user_id =
    CASE WHEN pf.requester_id = uid THEN pf.addressee_id ELSE pf.requester_id END
  WHERE pf.status = 'pending'
    AND (pf.requester_id = uid OR pf.addressee_id = uid)
  ORDER BY pf.created_at DESC;
END $$;

-- ============ 11. RPC: visit friend's pet (records visit + returns snapshot) ============
CREATE OR REPLACE FUNCTION public.visit_friend_pet(_friend_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  pet user_pets%ROWTYPE;
  sp pet_species%ROWTYPE;
  prof profiles%ROWTYPE;
  emoji text;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF NOT public.are_friends(uid, _friend_id) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_friends');
  END IF;

  -- Throttle: at most one visit log per host per 10 minutes (don't spam diary)
  IF NOT EXISTS (
    SELECT 1 FROM pet_visits
     WHERE host_id = _friend_id AND visitor_id = uid
       AND created_at > now() - interval '10 minutes'
  ) THEN
    INSERT INTO pet_visits(host_id, visitor_id) VALUES (_friend_id, uid);
  END IF;

  SELECT * INTO pet FROM user_pets WHERE user_id = _friend_id AND is_active = true LIMIT 1;
  SELECT * INTO prof FROM profiles WHERE user_id = _friend_id;
  IF pet.id IS NOT NULL THEN
    SELECT * INTO sp FROM pet_species WHERE id = pet.species_id;
    emoji := CASE pet.stage WHEN 0 THEN sp.emoji_egg WHEN 1 THEN sp.emoji_baby
                            WHEN 2 THEN sp.emoji_adult ELSE sp.emoji_legend END;
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'friend', jsonb_build_object('id', _friend_id,
      'username', prof.username, 'display_name', prof.display_name),
    'pet', CASE WHEN pet.id IS NULL THEN NULL ELSE jsonb_build_object(
      'nickname', pet.nickname, 'level', pet.level, 'stage', pet.stage,
      'hunger', pet.hunger, 'mood', pet.mood, 'emoji', emoji
    ) END
  );
END $$;

-- ============ 12. RPC: take a photo together ============
CREATE OR REPLACE FUNCTION public.take_pet_photo(_friend_id uuid, _caption text)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  cap text;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF public.is_current_user_minor() THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'minors_view_only');
  END IF;
  IF NOT public.are_friends(uid, _friend_id) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_friends');
  END IF;
  cap := NULLIF(trim(COALESCE(_caption, '')), '');
  IF cap IS NOT NULL AND char_length(cap) > 140 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'caption_too_long');
  END IF;
  -- Daily limit: 10 photos per host per day per visitor
  IF (SELECT COUNT(*) FROM pet_photos
       WHERE visitor_id = uid AND host_id = _friend_id
         AND created_at >= now() - interval '24 hours') >= 10 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'rate_limited');
  END IF;
  INSERT INTO pet_photos(host_id, visitor_id, caption) VALUES (_friend_id, uid, cap);
  RETURN jsonb_build_object('ok', true);
END $$;

-- ============ 13. RPC: list pet photos (mine + with friends) ============
CREATE OR REPLACE FUNCTION public.list_pet_photos(_other uuid)
RETURNS TABLE(id uuid, host_id uuid, visitor_id uuid, caption text, created_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RETURN; END IF;
  IF _other IS NOT NULL AND NOT public.are_friends(uid, _other) AND _other <> uid THEN
    RETURN;
  END IF;
  RETURN QUERY
  SELECT pp.id, pp.host_id, pp.visitor_id, pp.caption, pp.created_at
  FROM pet_photos pp
  WHERE (uid IN (pp.host_id, pp.visitor_id))
    AND (_other IS NULL OR _other IN (pp.host_id, pp.visitor_id))
  ORDER BY pp.created_at DESC
  LIMIT 50;
END $$;

-- ============ 14. RPC: list recent visitors to my pet ============
CREATE OR REPLACE FUNCTION public.list_my_pet_visitors()
RETURNS TABLE(visitor_id uuid, username text, display_name text, last_visit timestamptz, visits int)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RETURN; END IF;
  RETURN QUERY
  SELECT pv.visitor_id, p.username, p.display_name,
         MAX(pv.created_at), COUNT(*)::int
  FROM pet_visits pv
  LEFT JOIN profiles p ON p.user_id = pv.visitor_id
  WHERE pv.host_id = uid
    AND pv.created_at >= now() - interval '14 days'
  GROUP BY pv.visitor_id, p.username, p.display_name
  ORDER BY MAX(pv.created_at) DESC
  LIMIT 30;
END $$;

-- ============ 15. Harden send_gift: friends-only + minor block ============
CREATE OR REPLACE FUNCTION public.send_gift(_to_user uuid, _food_id text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE uid uuid := auth.uid(); used int;
BEGIN
  IF uid IS NULL OR _to_user IS NULL OR _to_user = uid THEN RAISE EXCEPTION 'invalid recipient'; END IF;
  IF public.is_current_user_minor() THEN
    RAISE EXCEPTION 'minors_view_only';
  END IF;
  IF NOT public.are_friends(uid, _to_user) THEN
    RAISE EXCEPTION 'not_friends';
  END IF;
  SELECT COUNT(*) INTO used FROM pet_food_gifts
   WHERE from_user=uid AND created_at::date = (now() AT TIME ZONE 'UTC')::date;
  IF used >= 3 THEN RAISE EXCEPTION 'daily gift limit reached'; END IF;
  INSERT INTO pet_food_gifts(from_user, to_user, food_id, qty) VALUES (uid, _to_user, _food_id, 1);
  INSERT INTO pet_inventory(user_id, food_id, qty) VALUES (_to_user, _food_id, 1)
  ON CONFLICT (user_id, food_id) DO UPDATE SET qty=pet_inventory.qty + 1, updated_at=now();
END $$;
