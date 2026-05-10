CREATE TABLE public.primary_phonics_mastery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  phonics_id text NOT NULL,
  quiz_correct integer NOT NULL DEFAULT 0,
  quiz_wrong integer NOT NULL DEFAULT 0,
  listen_correct integer NOT NULL DEFAULT 0,
  listen_wrong integer NOT NULL DEFAULT 0,
  mastery_level smallint NOT NULL DEFAULT 0,
  ease real NOT NULL DEFAULT 2.5,
  interval_days real NOT NULL DEFAULT 0,
  due_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, phonics_id)
);

CREATE INDEX idx_ppm_user ON public.primary_phonics_mastery(user_id);
CREATE INDEX idx_ppm_user_due ON public.primary_phonics_mastery(user_id, due_at);

ALTER TABLE public.primary_phonics_mastery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ppm select own" ON public.primary_phonics_mastery
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ppm insert own" ON public.primary_phonics_mastery
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ppm update own" ON public.primary_phonics_mastery
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "ppm delete own" ON public.primary_phonics_mastery
  FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.touch_ppm()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_touch_ppm BEFORE UPDATE ON public.primary_phonics_mastery
  FOR EACH ROW EXECUTE FUNCTION public.touch_ppm();