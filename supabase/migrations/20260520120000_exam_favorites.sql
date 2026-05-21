-- Per-question favorites for exam papers (e.g. Suzhou zhongkao)
CREATE TABLE public.exam_favorites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id text NOT NULL,
  question_id text NOT NULL,
  section text,
  note text,
  snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, exam_id, question_id)
);

CREATE INDEX idx_exam_favorites_user ON public.exam_favorites (user_id, created_at DESC);
CREATE INDEX idx_exam_favorites_user_exam ON public.exam_favorites (user_id, exam_id);

ALTER TABLE public.exam_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own exam favorites"
  ON public.exam_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own exam favorites"
  ON public.exam_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own exam favorites"
  ON public.exam_favorites FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own exam favorites"
  ON public.exam_favorites FOR DELETE
  USING (auth.uid() = user_id);
