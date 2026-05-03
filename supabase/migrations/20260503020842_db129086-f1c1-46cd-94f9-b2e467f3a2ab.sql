-- Per-word mastery matrix for primary students (FSRS-lite)
CREATE TABLE IF NOT EXISTS public.primary_word_mastery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  word_id uuid NOT NULL,
  grade integer NOT NULL,
  -- per-skill tallies
  quiz_correct integer NOT NULL DEFAULT 0,
  quiz_wrong   integer NOT NULL DEFAULT 0,
  listen_correct integer NOT NULL DEFAULT 0,
  listen_wrong   integer NOT NULL DEFAULT 0,
  spell_correct integer NOT NULL DEFAULT 0,
  spell_wrong   integer NOT NULL DEFAULT 0,
  match_correct integer NOT NULL DEFAULT 0,
  match_wrong   integer NOT NULL DEFAULT 0,
  -- aggregate mastery 0..3 (new / learning / familiar / mastered)
  mastery_level smallint NOT NULL DEFAULT 0,
  -- spaced repetition lite
  ease real NOT NULL DEFAULT 2.5,
  interval_days real NOT NULL DEFAULT 0,
  due_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, word_id)
);

CREATE INDEX IF NOT EXISTS idx_pwm_user_grade ON public.primary_word_mastery(user_id, grade);

ALTER TABLE public.primary_word_mastery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pwm select own"  ON public.primary_word_mastery FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pwm insert own"  ON public.primary_word_mastery FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pwm update own"  ON public.primary_word_mastery FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "pwm delete own"  ON public.primary_word_mastery FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.touch_pwm() RETURNS trigger
LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_touch_pwm ON public.primary_word_mastery;
CREATE TRIGGER trg_touch_pwm BEFORE UPDATE ON public.primary_word_mastery
FOR EACH ROW EXECUTE FUNCTION public.touch_pwm();