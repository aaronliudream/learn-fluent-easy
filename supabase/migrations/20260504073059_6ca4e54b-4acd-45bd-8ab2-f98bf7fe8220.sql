-- Daily task completion tracking
CREATE TABLE IF NOT EXISTS public.daily_task_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_date DATE NOT NULL,
  task_key TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  xp_awarded INTEGER NOT NULL DEFAULT 0,
  coins_awarded INTEGER NOT NULL DEFAULT 0,
  UNIQUE (user_id, task_date, task_key)
);

CREATE INDEX IF NOT EXISTS idx_dtc_user_date ON public.daily_task_completions(user_id, task_date);

ALTER TABLE public.daily_task_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own daily tasks"
  ON public.daily_task_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own daily tasks"
  ON public.daily_task_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RPC: complete a daily task with idempotent reward
CREATE OR REPLACE FUNCTION public.complete_daily_task(_task_key TEXT, _xp INTEGER DEFAULT 10, _coins INTEGER DEFAULT 5)
RETURNS TABLE(already_done BOOLEAN, xp_awarded INTEGER, coins_awarded INTEGER, total_today INTEGER, all_done BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  today DATE := ((now() AT TIME ZONE 'UTC') - interval '4 hours')::date;
  inserted BOOLEAN := false;
  count_today INTEGER;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;

  INSERT INTO public.daily_task_completions(user_id, task_date, task_key, xp_awarded, coins_awarded)
  VALUES (uid, today, _task_key, GREATEST(0, COALESCE(_xp, 0)), GREATEST(0, COALESCE(_coins, 0)))
  ON CONFLICT (user_id, task_date, task_key) DO NOTHING;
  GET DIAGNOSTICS inserted = ROW_COUNT;

  IF inserted AND COALESCE(_coins, 0) > 0 THEN
    INSERT INTO public.user_coins(user_id, balance, total_earned)
    VALUES (uid, _coins, _coins)
    ON CONFLICT (user_id) DO UPDATE
      SET balance = public.user_coins.balance + EXCLUDED.balance,
          total_earned = public.user_coins.total_earned + EXCLUDED.total_earned,
          updated_at = now();
  END IF;

  SELECT COUNT(*)::int INTO count_today
  FROM public.daily_task_completions
  WHERE user_id = uid AND task_date = today;

  RETURN QUERY SELECT
    (NOT inserted),
    CASE WHEN inserted THEN COALESCE(_xp, 0) ELSE 0 END,
    CASE WHEN inserted THEN COALESCE(_coins, 0) ELSE 0 END,
    count_today,
    (count_today >= 3);
END;
$$;

-- RPC: list today's completed task keys
CREATE OR REPLACE FUNCTION public.get_today_task_state()
RETURNS TABLE(task_key TEXT, completed_at TIMESTAMPTZ, xp_awarded INTEGER, coins_awarded INTEGER)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT task_key, completed_at, xp_awarded, coins_awarded
  FROM public.daily_task_completions
  WHERE user_id = auth.uid()
    AND task_date = ((now() AT TIME ZONE 'UTC') - interval '4 hours')::date
  ORDER BY completed_at;
$$;