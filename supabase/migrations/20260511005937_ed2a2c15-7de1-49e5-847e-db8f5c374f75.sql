CREATE TABLE IF NOT EXISTS public.primary_listening_completion (
  user_id UUID NOT NULL,
  dialogue_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  questions_correct INT NOT NULL DEFAULT 0,
  questions_total INT NOT NULL DEFAULT 0,
  play_count INT NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id, dialogue_id)
);

ALTER TABLE public.primary_listening_completion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own listening completion"
  ON public.primary_listening_completion FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own listening completion"
  ON public.primary_listening_completion FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listening completion"
  ON public.primary_listening_completion FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_primary_listening_completion_user
  ON public.primary_listening_completion(user_id);