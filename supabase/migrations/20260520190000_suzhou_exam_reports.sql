-- Persisted Suzhou exam diagnostic reports (per user)

CREATE TABLE IF NOT EXISTS public.suzhou_exam_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id text NOT NULL,
  exam_title text NOT NULL,
  mode text NOT NULL CHECK (mode IN ('exam', 'practice')),
  score_pct integer NOT NULL DEFAULT 0,
  earned integer NOT NULL DEFAULT 0,
  max_score integer NOT NULL DEFAULT 0,
  correct_count integer NOT NULL DEFAULT 0,
  total_graded integer NOT NULL DEFAULT 0,
  mistake_count integer NOT NULL DEFAULT 0,
  section_scores jsonb NOT NULL DEFAULT '[]'::jsonb,
  diagnosis jsonb NOT NULL DEFAULT '[]'::jsonb,
  weak_sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ser_user_time
  ON public.suzhou_exam_reports(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ser_user_exam
  ON public.suzhou_exam_reports(user_id, exam_id, created_at DESC);

ALTER TABLE public.suzhou_exam_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users select own suzhou reports"
  ON public.suzhou_exam_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users insert own suzhou reports"
  ON public.suzhou_exam_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT ON public.suzhou_exam_reports TO authenticated;
