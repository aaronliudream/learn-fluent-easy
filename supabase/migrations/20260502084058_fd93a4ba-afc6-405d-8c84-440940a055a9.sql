-- ============================================================
-- 高中阅读 4 大年级板块 + 双标签科学诊断系统
-- ============================================================

-- 1. 文章表：补齐年级 sub_band 注释（已存在 grade_band 字段，扩展枚举）
-- grade_band 取值规范：'g1'|'g2'|'g3'|'gaokao_sprint'
-- sub_band 可选：'g1_term1'|'g1_term2'|'g2_term1'|'g2_term2'|'g3_term1'|'g3_term2'

-- 2. 为题目表新增"错因诊断"字段
ALTER TABLE public.gaokao_reading_article_questions
  ADD COLUMN IF NOT EXISTS error_tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS skill_focus text,
  ADD COLUMN IF NOT EXISTS distractor_pattern text;

COMMENT ON COLUMN public.gaokao_reading_article_questions.error_tags IS
  '错因标签数组：main_idea_drift|detail_misplace|over_inference|reverse_trap|vocab_gap|absolute_word|surface_match';
COMMENT ON COLUMN public.gaokao_reading_article_questions.skill_focus IS
  '该题主要训练的微技能：scanning|skimming|inference|attitude|cohesion|vocab_in_context';
COMMENT ON COLUMN public.gaokao_reading_article_questions.distractor_pattern IS
  '干扰项设计模式（用于深度讲解）';

-- 3. 文章 CEFR 与年级对齐索引
CREATE INDEX IF NOT EXISTS idx_reading_articles_grade_band
  ON public.gaokao_reading_articles(grade_band, sort_order);

CREATE INDEX IF NOT EXISTS idx_reading_articles_genre
  ON public.gaokao_reading_articles(grade_band, genre);

-- 4. 学生错因聚合表（用于雷达图与历史诊断）
CREATE TABLE IF NOT EXISTS public.gaokao_reading_diagnostics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  question_id uuid NOT NULL,
  article_id uuid NOT NULL,
  question_type text NOT NULL,
  user_answer char(1),
  correct_answer char(1) NOT NULL,
  is_correct boolean NOT NULL,
  error_tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  skill_focus text,
  time_spent_seconds integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gaokao_reading_diagnostics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own reading diagnostics"
  ON public.gaokao_reading_diagnostics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own reading diagnostics"
  ON public.gaokao_reading_diagnostics FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX idx_reading_diag_user_created
  ON public.gaokao_reading_diagnostics(user_id, created_at DESC);
CREATE INDEX idx_reading_diag_user_type
  ON public.gaokao_reading_diagnostics(user_id, question_type, is_correct);

-- 5. 雷达图聚合函数：按题型 + 错因汇总
CREATE OR REPLACE FUNCTION public.get_reading_diagnostic_radar()
RETURNS TABLE(
  question_type text,
  total_attempts integer,
  correct_count integer,
  accuracy real,
  top_error_tag text,
  top_error_count integer
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RETURN; END IF;
  RETURN QUERY
  WITH base AS (
    SELECT d.question_type, d.is_correct, d.error_tags
    FROM gaokao_reading_diagnostics d
    WHERE d.user_id = uid
  ),
  agg AS (
    SELECT
      b.question_type,
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE b.is_correct)::int AS correct
    FROM base b GROUP BY b.question_type
  ),
  errs AS (
    SELECT b.question_type, tag::text AS err, COUNT(*)::int AS c
    FROM base b, jsonb_array_elements_text(b.error_tags) tag
    WHERE NOT b.is_correct
    GROUP BY b.question_type, tag
  ),
  top_err AS (
    SELECT DISTINCT ON (e.question_type)
      e.question_type, e.err, e.c
    FROM errs e
    ORDER BY e.question_type, e.c DESC
  )
  SELECT
    a.question_type,
    a.total,
    a.correct,
    CASE WHEN a.total > 0 THEN a.correct::real / a.total ELSE 0 END,
    t.err,
    COALESCE(t.c, 0)
  FROM agg a
  LEFT JOIN top_err t ON t.question_type = a.question_type
  ORDER BY a.total DESC;
END; $$;