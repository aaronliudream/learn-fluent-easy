CREATE TABLE public.primary_lesson_chapter_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  grade SMALLINT NOT NULL CHECK (grade IN (1, 2)),
  chapter_id SMALLINT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, grade, chapter_id)
);

ALTER TABLE public.primary_lesson_chapter_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own chapter progress"
  ON public.primary_lesson_chapter_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own chapter progress"
  ON public.primary_lesson_chapter_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own chapter progress"
  ON public.primary_lesson_chapter_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own chapter progress"
  ON public.primary_lesson_chapter_progress FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_primary_lesson_chapter_user
  ON public.primary_lesson_chapter_progress(user_id, grade);