
CREATE TABLE public.mistake_reflections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_id TEXT NOT NULL,
  module TEXT,
  word TEXT,
  i_thought TEXT NOT NULL,
  correct_was TEXT NOT NULL,
  why_wrong TEXT,
  seeds_awarded INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mistake_reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own reflections select" ON public.mistake_reflections
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own reflections insert" ON public.mistake_reflections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_mistake_reflections_user_item ON public.mistake_reflections(user_id, item_id, created_at DESC);

-- 同一道错题每日只能领一次反思能量，发 2 颗种子进 24h 消化队列
CREATE OR REPLACE FUNCTION public.claim_reflection_energy(
  _item_id TEXT,
  _module TEXT,
  _word TEXT,
  _i_thought TEXT,
  _correct_was TEXT,
  _why_wrong TEXT
) RETURNS TABLE(awarded INT, reason TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _today DATE := (now() AT TIME ZONE 'UTC')::date;
  _existing INT;
  _seeds INT := 2;
BEGIN
  IF _uid IS NULL THEN
    RETURN QUERY SELECT 0, 'no_user'::TEXT; RETURN;
  END IF;
  IF coalesce(length(trim(_i_thought)),0) < 2 OR coalesce(length(trim(_correct_was)),0) < 1 THEN
    RETURN QUERY SELECT 0, 'too_short'::TEXT; RETURN;
  END IF;

  SELECT count(*) INTO _existing
  FROM public.mistake_reflections
  WHERE user_id = _uid AND item_id = _item_id
    AND created_at::date = _today;

  IF _existing > 0 THEN
    INSERT INTO public.mistake_reflections(user_id,item_id,module,word,i_thought,correct_was,why_wrong,seeds_awarded)
      VALUES(_uid,_item_id,_module,_word,_i_thought,_correct_was,_why_wrong,0);
    RETURN QUERY SELECT 0, 'already_today'::TEXT; RETURN;
  END IF;

  INSERT INTO public.mistake_reflections(user_id,item_id,module,word,i_thought,correct_was,why_wrong,seeds_awarded)
    VALUES(_uid,_item_id,_module,_word,_i_thought,_correct_was,_why_wrong,_seeds);

  PERFORM public.add_pending_seed(_seeds, 'reflection');
  RETURN QUERY SELECT _seeds, 'ok'::TEXT;
END;
$$;
