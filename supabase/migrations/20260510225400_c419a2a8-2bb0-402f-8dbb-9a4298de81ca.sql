CREATE TABLE public.primary_sight_word_mastery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  word_id text NOT NULL,
  recognize_correct integer NOT NULL DEFAULT 0,
  recognize_wrong integer NOT NULL DEFAULT 0,
  spell_correct integer NOT NULL DEFAULT 0,
  spell_wrong integer NOT NULL DEFAULT 0,
  mastery_level smallint NOT NULL DEFAULT 0,
  ease real NOT NULL DEFAULT 2.5,
  interval_days real NOT NULL DEFAULT 0,
  due_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, word_id)
);

CREATE INDEX idx_pswm_user ON public.primary_sight_word_mastery(user_id);
CREATE INDEX idx_pswm_user_due ON public.primary_sight_word_mastery(user_id, due_at);

ALTER TABLE public.primary_sight_word_mastery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pswm select own" ON public.primary_sight_word_mastery
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pswm insert own" ON public.primary_sight_word_mastery
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pswm update own" ON public.primary_sight_word_mastery
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "pswm delete own" ON public.primary_sight_word_mastery
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_touch_pswm BEFORE UPDATE ON public.primary_sight_word_mastery
  FOR EACH ROW EXECUTE FUNCTION public.touch_ppm();