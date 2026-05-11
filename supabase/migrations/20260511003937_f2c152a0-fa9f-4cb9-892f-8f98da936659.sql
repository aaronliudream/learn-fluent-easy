CREATE TABLE IF NOT EXISTS public.primary_roleplay_completion (
  user_id UUID NOT NULL,
  roleplay_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_choice_correct BOOLEAN,
  play_count INT NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id, roleplay_id)
);

ALTER TABLE public.primary_roleplay_completion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own roleplay completions"
  ON public.primary_roleplay_completion FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert their own roleplay completions"
  ON public.primary_roleplay_completion FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update their own roleplay completions"
  ON public.primary_roleplay_completion FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_primary_roleplay_completion_user
  ON public.primary_roleplay_completion(user_id);