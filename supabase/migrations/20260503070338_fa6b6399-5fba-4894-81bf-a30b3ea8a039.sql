
CREATE TABLE IF NOT EXISTS public.junior_reading_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reading_id uuid NOT NULL,
  perfect boolean NOT NULL DEFAULT false,
  time_spent_sec integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, reading_id)
);

ALTER TABLE public.junior_reading_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own select" ON public.junior_reading_completions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own insert" ON public.junior_reading_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own update" ON public.junior_reading_completions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS jr_completions_user_idx ON public.junior_reading_completions(user_id);
