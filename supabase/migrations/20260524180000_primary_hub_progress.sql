-- Primary Hub (G3–G6) progress — one JSON blob per user per grade.
-- Additive only; does not modify legacy primary_lesson_progress.

CREATE TABLE IF NOT EXISTS public.primary_hub_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  grade SMALLINT NOT NULL CHECK (grade BETWEEN 3 AND 6),
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, grade)
);

CREATE INDEX IF NOT EXISTS idx_primary_hub_progress_user
  ON public.primary_hub_progress (user_id, updated_at DESC);

ALTER TABLE public.primary_hub_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "php_select_own" ON public.primary_hub_progress;
CREATE POLICY "php_select_own" ON public.primary_hub_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "php_insert_own" ON public.primary_hub_progress;
CREATE POLICY "php_insert_own" ON public.primary_hub_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "php_update_own" ON public.primary_hub_progress;
CREATE POLICY "php_update_own" ON public.primary_hub_progress
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "php_delete_own" ON public.primary_hub_progress;
CREATE POLICY "php_delete_own" ON public.primary_hub_progress
  FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE public.primary_hub_progress IS
  'Primary Hub G3–G6 localStorage-equivalent state synced per authenticated user.';
