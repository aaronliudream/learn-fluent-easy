
-- ============================================================
-- 1. 5 大语法模块（顶层）
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gaokao_grammar_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,           -- 'morphology' / 'tense_voice' / 'non_finite' / 'three_clauses' / 'special_sentences'
  name_cn text NOT NULL,                -- '词法' / '时态语态' / ...
  name_en text NOT NULL,
  description_cn text,
  emoji text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gaokao_grammar_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Grammar modules public readable"
  ON public.gaokao_grammar_modules FOR SELECT USING (true);

-- ============================================================
-- 2. 语法二级分类（如：名词/冠词/定语从句/虚拟语气/...）
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gaokao_grammar_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.gaokao_grammar_modules(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,           -- 'noun' / 'article' / 'attributive_clause' / ...
  name_cn text NOT NULL,
  name_en text NOT NULL,
  description_cn text,
  difficulty smallint NOT NULL DEFAULT 3,   -- 1-5
  exam_frequency text DEFAULT 'medium',     -- 'extreme_high' / 'high' / 'medium' / 'low'
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gaokao_grammar_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Grammar categories public readable"
  ON public.gaokao_grammar_categories FOR SELECT USING (true);

CREATE INDEX idx_grammar_categories_module ON public.gaokao_grammar_categories(module_id);

-- ============================================================
-- 3. 扩展 gaokao_grammar_points
-- ============================================================
ALTER TABLE public.gaokao_grammar_points
  ADD COLUMN IF NOT EXISTS kp_id text,                         -- 'KP-00001' 对应主索引
  ADD COLUMN IF NOT EXISTS source_code text,                   -- 'A1-01' 来自原始 Excel 编号
  ADD COLUMN IF NOT EXISTS module_id uuid REFERENCES public.gaokao_grammar_modules(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.gaokao_grammar_categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS exam_frequency text DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS typical_example text,
  ADD COLUMN IF NOT EXISTS common_mistake text,
  ADD COLUMN IF NOT EXISTS prerequisite text,
  ADD COLUMN IF NOT EXISTS irt_avg_difficulty real,            -- 该考点下题目的平均 IRT 难度
  ADD COLUMN IF NOT EXISTS question_count int NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS idx_grammar_points_kp_id ON public.gaokao_grammar_points(kp_id) WHERE kp_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_grammar_points_module ON public.gaokao_grammar_points(module_id);
CREATE INDEX IF NOT EXISTS idx_grammar_points_category ON public.gaokao_grammar_points(category_id);

-- ============================================================
-- 4. 扩展 gaokao_grammar_questions
-- ============================================================
ALTER TABLE public.gaokao_grammar_questions
  ADD COLUMN IF NOT EXISTS source_qid text,                     -- 'Q-G001'
  ADD COLUMN IF NOT EXISTS question_type text NOT NULL DEFAULT 'multiple_choice',
    -- 'multiple_choice' / 'grammar_filling' / 'error_correction' / 'cloze'
  ADD COLUMN IF NOT EXISTS irt_difficulty real DEFAULT 0,       -- IRT 难度参数 (-3 to +3)
  ADD COLUMN IF NOT EXISTS irt_discrimination real DEFAULT 1,   -- IRT 区分度
  ADD COLUMN IF NOT EXISTS irt_guessing real DEFAULT 0.25,      -- IRT 猜测参数
  ADD COLUMN IF NOT EXISTS kp_ids jsonb DEFAULT '[]'::jsonb,    -- 多知识点关联
  ADD COLUMN IF NOT EXISTS bloom_level smallint DEFAULT 2,      -- 1=记忆 2=理解 3=应用 4=分析
  ADD COLUMN IF NOT EXISTS distractor_analysis text,
  ADD COLUMN IF NOT EXISTS source_label text,                   -- '2023全国卷I' / '原创' / 'AI生成'
  ADD COLUMN IF NOT EXISTS passage text,                        -- 用于语法填空/完形的篇章
  ADD COLUMN IF NOT EXISTS blank_index int;                     -- 篇章题中的第几空

CREATE INDEX IF NOT EXISTS idx_grammar_questions_point ON public.gaokao_grammar_questions(point_id);
CREATE INDEX IF NOT EXISTS idx_grammar_questions_type ON public.gaokao_grammar_questions(question_type);
CREATE INDEX IF NOT EXISTS idx_grammar_questions_irt ON public.gaokao_grammar_questions(irt_difficulty);

-- ============================================================
-- 5. IRT 自适应诊断会话表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gaokao_diagnostic_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_type text NOT NULL DEFAULT 'grammar_full',            -- 'grammar_full' / 'grammar_module' / 'grammar_category'
  scope_id uuid,                                                -- 当 session_type 不为 full 时指向 module 或 category
  theta real NOT NULL DEFAULT 0,                                -- 当前能力估计值
  theta_se real NOT NULL DEFAULT 1.0,                           -- 标准误（置信度）
  questions_answered int NOT NULL DEFAULT 0,
  correct_count int NOT NULL DEFAULT 0,
  answered_question_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  response_log jsonb NOT NULL DEFAULT '[]'::jsonb,              -- [{q_id, answer, correct, time_ms, theta_after}]
  status text NOT NULL DEFAULT 'in_progress',                   -- 'in_progress' / 'completed' / 'abandoned'
  final_cefr text,                                              -- 'A2' / 'B1' / 'B2' / 'C1'
  weakest_kp_ids jsonb DEFAULT '[]'::jsonb,
  module_scores jsonb DEFAULT '{}'::jsonb,                      -- {morphology: 0.78, tense_voice: 0.5, ...}
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  duration_seconds int
);

ALTER TABLE public.gaokao_diagnostic_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users insert own diagnostic sessions"
  ON public.gaokao_diagnostic_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own diagnostic sessions"
  ON public.gaokao_diagnostic_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own diagnostic sessions"
  ON public.gaokao_diagnostic_sessions FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_diag_sessions_user ON public.gaokao_diagnostic_sessions(user_id, started_at DESC);

-- ============================================================
-- 6. 用户能力评估缓存（最新一次诊断结果）
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gaokao_ability_estimates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  scope_type text NOT NULL,                          -- 'overall' / 'module' / 'category'
  scope_id uuid,                                     -- module_id 或 category_id（overall 时为 null）
  theta real NOT NULL DEFAULT 0,
  theta_se real NOT NULL DEFAULT 1.0,
  cefr text,
  mastery_pct real DEFAULT 0,                        -- 0-1，用于热力图颜色
  weakest_kp_ids jsonb DEFAULT '[]'::jsonb,
  last_session_id uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, scope_type, scope_id)
);

ALTER TABLE public.gaokao_ability_estimates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users insert own ability estimates"
  ON public.gaokao_ability_estimates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own ability estimates"
  ON public.gaokao_ability_estimates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own ability estimates"
  ON public.gaokao_ability_estimates FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_ability_user_scope ON public.gaokao_ability_estimates(user_id, scope_type);

-- ============================================================
-- 7. 触发器：当题目插入/删除时自动更新考点的 question_count 与 irt 平均值
-- ============================================================
CREATE OR REPLACE FUNCTION public.refresh_grammar_point_stats()
RETURNS TRIGGER AS $$
DECLARE
  pid uuid;
BEGIN
  pid := COALESCE(NEW.point_id, OLD.point_id);
  IF pid IS NOT NULL THEN
    UPDATE public.gaokao_grammar_points p
    SET question_count = (SELECT COUNT(*) FROM public.gaokao_grammar_questions WHERE point_id = pid),
        irt_avg_difficulty = (SELECT AVG(irt_difficulty)::real FROM public.gaokao_grammar_questions WHERE point_id = pid),
        updated_at = now()
    WHERE p.id = pid;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_refresh_point_stats_ins ON public.gaokao_grammar_questions;
DROP TRIGGER IF EXISTS trg_refresh_point_stats_del ON public.gaokao_grammar_questions;

CREATE TRIGGER trg_refresh_point_stats_ins
  AFTER INSERT OR UPDATE ON public.gaokao_grammar_questions
  FOR EACH ROW EXECUTE FUNCTION public.refresh_grammar_point_stats();

CREATE TRIGGER trg_refresh_point_stats_del
  AFTER DELETE ON public.gaokao_grammar_questions
  FOR EACH ROW EXECUTE FUNCTION public.refresh_grammar_point_stats();
