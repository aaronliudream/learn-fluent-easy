
CREATE TABLE IF NOT EXISTS public.junior_grammar_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name_cn text NOT NULL,
  emoji text DEFAULT '📘',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.junior_grammar_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jgc read" ON public.junior_grammar_categories FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.junior_grammar_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.junior_grammar_categories(id) ON DELETE CASCADE,
  code text UNIQUE NOT NULL,
  title text NOT NULL,
  cefr text DEFAULT 'A2',
  grade int NOT NULL DEFAULT 7,
  summary text,
  explanation_md text NOT NULL DEFAULT '',
  examples jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.junior_grammar_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jgp read" ON public.junior_grammar_points FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_jgp_cat ON public.junior_grammar_points(category_id, sort_order);

CREATE TABLE IF NOT EXISTS public.junior_grammar_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  point_id uuid NOT NULL REFERENCES public.junior_grammar_points(id) ON DELETE CASCADE,
  stem text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  correct_answer text NOT NULL CHECK (correct_answer IN ('A','B','C','D')),
  explanation text DEFAULT '',
  difficulty int NOT NULL DEFAULT 2,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.junior_grammar_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jgq read" ON public.junior_grammar_questions FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_jgq_point ON public.junior_grammar_questions(point_id);

CREATE TABLE IF NOT EXISTS public.junior_reading_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reading_id uuid NOT NULL REFERENCES public.junior_reading(id) ON DELETE CASCADE,
  question_idx int NOT NULL,
  user_answer text,
  is_correct boolean NOT NULL,
  duration_ms int,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.junior_reading_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jra own select" ON public.junior_reading_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "jra own insert" ON public.junior_reading_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_jra_user ON public.junior_reading_attempts(user_id, created_at DESC);
