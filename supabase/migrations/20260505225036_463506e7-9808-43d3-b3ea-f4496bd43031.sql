-- Subscribers table
CREATE TABLE public.subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free','monthly','yearly')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','canceled','past_due','trialing')),
  current_period_end TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users view own subscription" ON public.subscribers
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own subscription" ON public.subscribers
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own subscription" ON public.subscribers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER trg_subscribers_updated
  BEFORE UPDATE ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Daily quota usage
CREATE TABLE public.daily_question_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  usage_date DATE NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Shanghai')::date,
  questions_used INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, usage_date)
);

CREATE INDEX idx_daily_question_usage_user_date ON public.daily_question_usage(user_id, usage_date);

ALTER TABLE public.daily_question_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users view own usage" ON public.daily_question_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Tier helper
CREATE OR REPLACE FUNCTION public.get_user_tier(_user_id UUID)
RETURNS TEXT
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT tier FROM public.subscribers
      WHERE user_id = _user_id
        AND status IN ('active','trialing')
        AND (current_period_end IS NULL OR current_period_end > now())
      LIMIT 1),
    'free'
  );
$$;

-- Consume quota (atomic)
CREATE OR REPLACE FUNCTION public.consume_question_quota()
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _tier TEXT;
  _today DATE := (now() AT TIME ZONE 'Asia/Shanghai')::date;
  _used INT;
  _limit INT := 5;
BEGIN
  IF _uid IS NULL THEN
    RETURN jsonb_build_object('allowed', true, 'used', 0, 'limit', _limit, 'tier', 'guest');
  END IF;

  _tier := public.get_user_tier(_uid);

  IF _tier <> 'free' THEN
    RETURN jsonb_build_object('allowed', true, 'used', 0, 'limit', -1, 'tier', _tier);
  END IF;

  INSERT INTO public.daily_question_usage(user_id, usage_date, questions_used)
  VALUES (_uid, _today, 1)
  ON CONFLICT (user_id, usage_date)
  DO UPDATE SET questions_used = daily_question_usage.questions_used + 1,
                updated_at = now()
  RETURNING questions_used INTO _used;

  IF _used > _limit THEN
    -- rollback the increment
    UPDATE public.daily_question_usage
       SET questions_used = _limit, updated_at = now()
     WHERE user_id = _uid AND usage_date = _today;
    RETURN jsonb_build_object('allowed', false, 'used', _limit, 'limit', _limit, 'tier', 'free');
  END IF;

  RETURN jsonb_build_object('allowed', true, 'used', _used, 'limit', _limit, 'tier', 'free', 'remaining', _limit - _used);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_quota_status()
RETURNS JSONB
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _tier TEXT;
  _today DATE := (now() AT TIME ZONE 'Asia/Shanghai')::date;
  _used INT;
  _limit INT := 5;
BEGIN
  IF _uid IS NULL THEN
    RETURN jsonb_build_object('used', 0, 'limit', _limit, 'tier', 'guest', 'remaining', _limit);
  END IF;

  _tier := public.get_user_tier(_uid);
  IF _tier <> 'free' THEN
    RETURN jsonb_build_object('used', 0, 'limit', -1, 'tier', _tier, 'remaining', -1);
  END IF;

  SELECT questions_used INTO _used FROM public.daily_question_usage
   WHERE user_id = _uid AND usage_date = _today;
  _used := COALESCE(_used, 0);

  RETURN jsonb_build_object('used', _used, 'limit', _limit, 'tier', 'free', 'remaining', GREATEST(0, _limit - _used));
END;
$$;