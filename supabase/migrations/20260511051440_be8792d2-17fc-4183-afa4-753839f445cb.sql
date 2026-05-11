CREATE TABLE IF NOT EXISTS public.primary_lesson_completion (
  user_id uuid NOT NULL,
  lesson_key text NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  play_count integer NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id, lesson_key)
);

CREATE INDEX IF NOT EXISTS idx_primary_lesson_completion_user
  ON public.primary_lesson_completion (user_id);

ALTER TABLE public.primary_lesson_completion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own lesson completions"
  ON public.primary_lesson_completion FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert their own lesson completions"
  ON public.primary_lesson_completion FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update their own lesson completions"
  ON public.primary_lesson_completion FOR UPDATE
  USING (auth.uid() = user_id);
