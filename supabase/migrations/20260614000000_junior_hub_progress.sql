-- Junior Hub (G7–G9) progress — one JSON blob per user per grade.
-- 照抄 primary_hub_progress 结构;additive only,不动任何现有表。

CREATE TABLE IF NOT EXISTS public.junior_hub_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  grade SMALLINT NOT NULL CHECK (grade BETWEEN 7 AND 9),
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, grade)
);

CREATE INDEX IF NOT EXISTS idx_junior_hub_progress_user
  ON public.junior_hub_progress (user_id, updated_at DESC);

ALTER TABLE public.junior_hub_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "jhp_select_own" ON public.junior_hub_progress;
CREATE POLICY "jhp_select_own" ON public.junior_hub_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "jhp_insert_own" ON public.junior_hub_progress;
CREATE POLICY "jhp_insert_own" ON public.junior_hub_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "jhp_update_own" ON public.junior_hub_progress;
CREATE POLICY "jhp_update_own" ON public.junior_hub_progress
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "jhp_delete_own" ON public.junior_hub_progress;
CREATE POLICY "jhp_delete_own" ON public.junior_hub_progress
  FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE public.junior_hub_progress IS
  'Junior Hub G7–G9 localStorage-equivalent state synced per authenticated user.';
