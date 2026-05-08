ALTER TABLE public.junior_grammar_points
  ADD COLUMN IF NOT EXISTS hook_line text,
  ADD COLUMN IF NOT EXISTS hook_line_cn text,
  ADD COLUMN IF NOT EXISTS contrast_table jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS reflex_cards jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS situation_drills jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS correction_tasks jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS boss_questions jsonb NOT NULL DEFAULT '[]'::jsonb;