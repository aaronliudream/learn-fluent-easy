
-- 1) 题目考点标签表（公开只读）
CREATE TABLE public.question_exam_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module text NOT NULL,
  question_id uuid NOT NULL,
  exam_year smallint,
  exam_source text,
  knowledge_point_id uuid REFERENCES public.gaokao_reading_knowledge_points(id) ON DELETE SET NULL,
  knowledge_point_label text,
  confidence real DEFAULT 0.8,
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (module, question_id)
);
CREATE INDEX idx_qet_kp ON public.question_exam_tags(knowledge_point_id);
CREATE INDEX idx_qet_module ON public.question_exam_tags(module);

ALTER TABLE public.question_exam_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Exam tags are public readable"
ON public.question_exam_tags FOR SELECT USING (true);

-- 2) AI 强化练习集合
CREATE TABLE public.ai_practice_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  module text NOT NULL,
  source_question_id uuid NOT NULL,
  knowledge_point_id uuid,
  knowledge_point_label text,
  round smallint NOT NULL DEFAULT 1,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  result jsonb NOT NULL DEFAULT '{}'::jsonb,
  passed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_aps_user_q ON public.ai_practice_sets(user_id, source_question_id, round);

ALTER TABLE public.ai_practice_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own practice sets"
ON public.ai_practice_sets FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own practice sets"
ON public.ai_practice_sets FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own practice sets"
ON public.ai_practice_sets FOR UPDATE USING (auth.uid() = user_id);

-- 3) updated_at 触发器
CREATE TRIGGER trg_qet_updated
BEFORE UPDATE ON public.question_exam_tags
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_aps_updated
BEFORE UPDATE ON public.ai_practice_sets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
