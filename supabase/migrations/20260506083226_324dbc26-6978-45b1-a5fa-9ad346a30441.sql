ALTER TABLE public.slang_mastery
  ADD COLUMN IF NOT EXISTS mastery_matrix jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS reached_master_at timestamptz;