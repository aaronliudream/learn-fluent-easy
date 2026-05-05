ALTER TABLE public.gaokao_grammar_points ADD COLUMN IF NOT EXISTS ai_corpus jsonb;
ALTER TABLE public.junior_grammar_points ADD COLUMN IF NOT EXISTS ai_corpus jsonb;