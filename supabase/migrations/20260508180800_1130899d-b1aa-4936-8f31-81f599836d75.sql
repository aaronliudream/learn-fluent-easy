
-- Grammar Lab progress tracking for unlock-next gating
CREATE TABLE IF NOT EXISTS public.grammar_lab_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  point_id UUID NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('junior','gaokao')),
  boss_passed BOOLEAN NOT NULL DEFAULT false,
  best_score INT NOT NULL DEFAULT 0,
  attempts INT NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, point_id, level)
);

ALTER TABLE public.grammar_lab_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own progress"
  ON public.grammar_lab_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own progress"
  ON public.grammar_lab_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own progress"
  ON public.grammar_lab_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_glp_user_level ON public.grammar_lab_progress(user_id, level);

CREATE TRIGGER trg_glp_updated_at
  BEFORE UPDATE ON public.grammar_lab_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
