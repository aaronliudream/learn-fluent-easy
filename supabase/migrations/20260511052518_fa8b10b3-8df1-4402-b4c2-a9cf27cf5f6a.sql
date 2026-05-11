CREATE TABLE IF NOT EXISTS public.primary_word_quest_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  grade smallint NOT NULL CHECK (grade IN (1, 2)),
  date date NOT NULL,
  levels_completed smallint NOT NULL DEFAULT 0,
  total_levels smallint NOT NULL DEFAULT 6,
  perfect boolean DEFAULT false,
  duration_seconds integer,
  score integer,
  words text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, grade, date)
);

CREATE INDEX IF NOT EXISTS idx_primary_word_quest_user_date
  ON public.primary_word_quest_attempts (user_id, date);

ALTER TABLE public.primary_word_quest_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own quest attempts"
  ON public.primary_word_quest_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own quest attempts"
  ON public.primary_word_quest_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own quest attempts"
  ON public.primary_word_quest_attempts FOR UPDATE
  USING (auth.uid() = user_id);
