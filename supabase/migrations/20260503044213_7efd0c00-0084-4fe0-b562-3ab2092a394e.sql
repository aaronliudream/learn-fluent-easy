
CREATE TABLE public.primary_reading_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grade int NOT NULL CHECK (grade BETWEEN 1 AND 6),
  sort_order int NOT NULL DEFAULT 0,
  theme text NOT NULL,
  title_cn text NOT NULL,
  title_en text NOT NULL,
  emoji text DEFAULT '📖',
  cover_gradient text DEFAULT 'from-rose-400 to-amber-400',
  level int NOT NULL DEFAULT 1,
  estimated_minutes int NOT NULL DEFAULT 6,
  warmup jsonb NOT NULL DEFAULT '[]'::jsonb,
  sentences jsonb NOT NULL DEFAULT '[]'::jsonb,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  treasure jsonb NOT NULL DEFAULT '{}'::jsonb,
  parent_tip text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.primary_reading_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reading_articles_public_read"
ON public.primary_reading_articles FOR SELECT
USING (true);

CREATE INDEX idx_pra_grade_sort ON public.primary_reading_articles(grade, sort_order);

CREATE TABLE public.primary_reading_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  article_id uuid NOT NULL REFERENCES public.primary_reading_articles(id) ON DELETE CASCADE,
  stars int NOT NULL DEFAULT 0 CHECK (stars BETWEEN 0 AND 3),
  score int NOT NULL DEFAULT 0,
  best_step int NOT NULL DEFAULT 0,
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, article_id)
);

ALTER TABLE public.primary_reading_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prp_select_own" ON public.primary_reading_progress
FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "prp_insert_own" ON public.primary_reading_progress
FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "prp_update_own" ON public.primary_reading_progress
FOR UPDATE USING (auth.uid() = user_id);
