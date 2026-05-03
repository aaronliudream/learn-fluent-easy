CREATE TABLE IF NOT EXISTS public.primary_speaking_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  grade int,
  target_sentence text NOT NULL,
  transcript text,
  overall_score int NOT NULL DEFAULT 0,
  pronunciation_score int NOT NULL DEFAULT 0,
  fluency_score int NOT NULL DEFAULT 0,
  completeness_score int NOT NULL DEFAULT 0,
  encouragement text,
  corrections jsonb DEFAULT '[]'::jsonb,
  replacements jsonb DEFAULT '[]'::jsonb,
  scenario text,
  audio_duration_ms int,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.primary_speaking_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own select" ON public.primary_speaking_attempts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own insert" ON public.primary_speaking_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_psa_user_created ON public.primary_speaking_attempts(user_id, created_at DESC);