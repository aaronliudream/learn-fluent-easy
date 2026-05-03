
-- 1. 三种货币余额
CREATE TABLE public.user_currencies (
  user_id UUID NOT NULL PRIMARY KEY,
  seeds INTEGER NOT NULL DEFAULT 0,
  starlight INTEGER NOT NULL DEFAULT 0,
  crystals INTEGER NOT NULL DEFAULT 0,
  total_seeds_earned INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_currencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own currencies" ON public.user_currencies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own currencies" ON public.user_currencies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own currencies" ON public.user_currencies FOR UPDATE USING (auth.uid() = user_id);

-- 2. 待结算的种子（24h 消化）
CREATE TABLE public.pending_seeds (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  source TEXT NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  mature_at TIMESTAMPTZ NOT NULL,
  settled_at TIMESTAMPTZ
);
CREATE INDEX idx_pending_seeds_user_mature ON public.pending_seeds (user_id, mature_at) WHERE settled_at IS NULL;
ALTER TABLE public.pending_seeds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own pending" ON public.pending_seeds FOR SELECT USING (auth.uid() = user_id);

-- 3. 心愿单（48h 冷静期）
CREATE TABLE public.wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_kind TEXT NOT NULL,            -- 'food' | 'skin' | 'sticker' ...
  item_id TEXT NOT NULL,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  cooldown_until TIMESTAMPTZ NOT NULL,
  purchased_at TIMESTAMPTZ,
  removed_at TIMESTAMPTZ,
  UNIQUE (user_id, item_kind, item_id)
);
CREATE INDEX idx_wishlist_user ON public.wishlist (user_id, added_at DESC);
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own wishlist" ON public.wishlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own wishlist" ON public.wishlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own wishlist" ON public.wishlist FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "users delete own wishlist" ON public.wishlist FOR DELETE USING (auth.uid() = user_id);

-- 4. 添加待结算种子
CREATE OR REPLACE FUNCTION public.add_pending_seed(_amount INTEGER, _source TEXT)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _id BIGINT;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'auth required'; END IF;
  IF _amount <= 0 OR _amount > 50 THEN RAISE EXCEPTION 'invalid amount'; END IF;
  INSERT INTO public.pending_seeds (user_id, amount, source, mature_at)
  VALUES (_uid, _amount, COALESCE(_source, 'unknown'), now() + INTERVAL '24 hours')
  RETURNING id INTO _id;
  RETURN _id;
END $$;

-- 5. 结算已成熟种子并返回当前余额
CREATE OR REPLACE FUNCTION public.settle_matured_seeds()
RETURNS TABLE (seeds INTEGER, starlight INTEGER, crystals INTEGER, pending INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _matured INTEGER := 0;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'auth required'; END IF;

  -- ensure row exists
  INSERT INTO public.user_currencies (user_id) VALUES (_uid) ON CONFLICT DO NOTHING;

  -- sum & mark matured rows
  WITH matured AS (
    UPDATE public.pending_seeds
    SET settled_at = now()
    WHERE user_id = _uid AND settled_at IS NULL AND mature_at <= now()
    RETURNING amount
  )
  SELECT COALESCE(SUM(amount), 0)::INTEGER INTO _matured FROM matured;

  IF _matured > 0 THEN
    UPDATE public.user_currencies
    SET seeds = seeds + _matured,
        total_seeds_earned = total_seeds_earned + _matured,
        updated_at = now()
    WHERE user_id = _uid;
  END IF;

  RETURN QUERY
  SELECT
    uc.seeds, uc.starlight, uc.crystals,
    COALESCE((SELECT SUM(amount)::INTEGER FROM public.pending_seeds
              WHERE user_id = _uid AND settled_at IS NULL), 0)
  FROM public.user_currencies uc
  WHERE uc.user_id = _uid;
END $$;

-- 6. 加入心愿单（48h 冷静期）
CREATE OR REPLACE FUNCTION public.wishlist_add(_kind TEXT, _item_id TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _id UUID;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'auth required'; END IF;
  INSERT INTO public.wishlist (user_id, item_kind, item_id, cooldown_until)
  VALUES (_uid, _kind, _item_id, now() + INTERVAL '48 hours')
  ON CONFLICT (user_id, item_kind, item_id) DO UPDATE
    SET removed_at = NULL
  RETURNING id INTO _id;
  RETURN _id;
END $$;
