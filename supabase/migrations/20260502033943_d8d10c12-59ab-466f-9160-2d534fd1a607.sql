-- ============= COINS =============
CREATE TABLE IF NOT EXISTS public.user_coins (
  user_id uuid PRIMARY KEY,
  balance integer NOT NULL DEFAULT 0,
  total_earned integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_coins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own coins"
  ON public.user_coins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own coins"
  ON public.user_coins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own coins"
  ON public.user_coins FOR UPDATE
  USING (auth.uid() = user_id);

-- ============= BADGES =============
CREATE TABLE IF NOT EXISTS public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge_code text NOT NULL,
  earned_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb,
  UNIQUE (user_id, badge_code)
);
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own badges"
  ON public.user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============= AWARD COINS RPC =============
CREATE OR REPLACE FUNCTION public.award_coins(_amount integer)
RETURNS TABLE(balance integer, total_earned integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  new_balance integer;
  new_total integer;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF _amount IS NULL OR _amount < 0 THEN
    _amount := 0;
  END IF;

  INSERT INTO public.user_coins (user_id, balance, total_earned, updated_at)
  VALUES (uid, _amount, _amount, now())
  ON CONFLICT (user_id) DO UPDATE
    SET balance = public.user_coins.balance + EXCLUDED.balance,
        total_earned = public.user_coins.total_earned + EXCLUDED.total_earned,
        updated_at = now()
  RETURNING public.user_coins.balance, public.user_coins.total_earned
  INTO new_balance, new_total;

  RETURN QUERY SELECT new_balance, new_total;
END;
$$;

REVOKE ALL ON FUNCTION public.award_coins(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.award_coins(integer) TO authenticated;