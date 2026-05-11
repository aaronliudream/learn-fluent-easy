CREATE TABLE public.primary_word_rush_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  grade SMALLINT NOT NULL,
  date DATE NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  hits INTEGER NOT NULL DEFAULT 0,
  misses INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  words JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, grade, date)
);

ALTER TABLE public.primary_word_rush_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own rush attempts"
  ON public.primary_word_rush_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own rush attempts"
  ON public.primary_word_rush_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own rush attempts"
  ON public.primary_word_rush_attempts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_primary_word_rush_attempts_updated_at
BEFORE UPDATE ON public.primary_word_rush_attempts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_primary_word_rush_user_date ON public.primary_word_rush_attempts(user_id, date DESC);