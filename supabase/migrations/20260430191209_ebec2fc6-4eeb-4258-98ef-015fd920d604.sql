CREATE TABLE public.workplace_practice (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  dialogue_id TEXT NOT NULL,
  cat_key TEXT NOT NULL,
  vocab_score INTEGER NOT NULL DEFAULT 0,
  vocab_total INTEGER NOT NULL DEFAULT 0,
  dictation_score INTEGER NOT NULL DEFAULT 0,
  dictation_total INTEGER NOT NULL DEFAULT 0,
  roleplay_score INTEGER NOT NULL DEFAULT 0,
  roleplay_turns INTEGER NOT NULL DEFAULT 0,
  mastery NUMERIC NOT NULL DEFAULT 0,
  attempts INTEGER NOT NULL DEFAULT 0,
  last_payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, dialogue_id)
);

ALTER TABLE public.workplace_practice ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own workplace practice"
  ON public.workplace_practice FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own workplace practice"
  ON public.workplace_practice FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own workplace practice"
  ON public.workplace_practice FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own workplace practice"
  ON public.workplace_practice FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_workplace_practice_updated_at
  BEFORE UPDATE ON public.workplace_practice
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_workplace_practice_user ON public.workplace_practice(user_id);
CREATE INDEX idx_workplace_practice_dialogue ON public.workplace_practice(dialogue_id);