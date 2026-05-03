
CREATE TABLE IF NOT EXISTS public.audio_clips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  translation_cn text,
  audio_url text,
  ipa text,
  speaker text DEFAULT 'us_female',
  difficulty int NOT NULL DEFAULT 2,
  grade_band text NOT NULL DEFAULT 'primary',
  tags text[] DEFAULT ARRAY[]::text[],
  duration_ms int,
  is_dialogue boolean NOT NULL DEFAULT false,
  source text DEFAULT 'lovable_ai',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audio_clips_grade_diff ON public.audio_clips(grade_band, difficulty);
CREATE INDEX IF NOT EXISTS idx_audio_clips_tags ON public.audio_clips USING GIN(tags);

ALTER TABLE public.audio_clips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audio_clips public read" ON public.audio_clips FOR SELECT USING (true);
