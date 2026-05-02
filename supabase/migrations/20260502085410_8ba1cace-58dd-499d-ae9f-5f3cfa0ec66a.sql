
-- 高考英语阅读知识点完整体系
CREATE TABLE public.gaokao_reading_knowledge_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id text NOT NULL,                -- 原编号 R1-101 等
  category_code text NOT NULL,            -- R1/R2/R3/R4/R5/R6/R7/R8
  category_name text NOT NULL,            -- 题型/文体/话题/策略/信号词/长难句/七选五/基础能力
  level1 text,                            -- 一级分类
  level2 text,                            -- 二级分类
  level3 text NOT NULL,                   -- 三级原子知识点
  exam_frequency text,                    -- 极高/高/中/低
  difficulty smallint,                    -- 1-5
  example text,                           -- 典型问法/例句/特征
  strategy text,                          -- 解题策略/操作方法
  pitfall text,                           -- 易错点
  prerequisite text,                      -- 先修知识点
  extra jsonb DEFAULT '{}'::jsonb,        -- 备注/适用场景等
  grade_band text NOT NULL DEFAULT 'all', -- senior1/senior2/senior3/sprint/all
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_grkp_category ON public.gaokao_reading_knowledge_points(category_code);
CREATE INDEX idx_grkp_grade ON public.gaokao_reading_knowledge_points(grade_band);
CREATE INDEX idx_grkp_freq ON public.gaokao_reading_knowledge_points(exam_frequency);
ALTER TABLE public.gaokao_reading_knowledge_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read knowledge points" ON public.gaokao_reading_knowledge_points FOR SELECT USING (true);

-- 信号词专库（独立,便于全文检索）
CREATE TABLE public.gaokao_reading_signal_words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id text NOT NULL,
  category text NOT NULL,                 -- 一级类别 转折/因果/列举...
  semantic text,                          -- 二级语义
  word text NOT NULL,                     -- 信号词本身
  exam_frequency text,
  difficulty smallint,
  usage_note text,                        -- 用法说明
  remark text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_grsw_word ON public.gaokao_reading_signal_words(lower(word));
CREATE INDEX idx_grsw_category ON public.gaokao_reading_signal_words(category);
ALTER TABLE public.gaokao_reading_signal_words ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read signal words" ON public.gaokao_reading_signal_words FOR SELECT USING (true);

-- 学科话题与高频词
CREATE TABLE public.gaokao_reading_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id text NOT NULL,
  big_topic text NOT NULL,
  sub_topic text,
  high_freq_words text,
  exam_frequency text,
  difficulty smallint,
  exam_angle text,
  remark text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_grt_big ON public.gaokao_reading_topics(big_topic);
ALTER TABLE public.gaokao_reading_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read topics" ON public.gaokao_reading_topics FOR SELECT USING (true);

-- 种子题库（阅读理解 + 七选五）
CREATE TABLE public.gaokao_reading_seed_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id text NOT NULL,                -- Q-R001 等
  question_type text NOT NULL,            -- reading_comprehension / seven_to_five
  passage text NOT NULL,
  stem text NOT NULL,
  options jsonb NOT NULL,
  correct_answer text NOT NULL,
  explanation text,
  irt_difficulty numeric,
  related_kp text,
  distractor_analysis text,
  source text,
  grade_band text NOT NULL DEFAULT 'senior3',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_grsq_type ON public.gaokao_reading_seed_questions(question_type);
CREATE INDEX idx_grsq_grade ON public.gaokao_reading_seed_questions(grade_band);
ALTER TABLE public.gaokao_reading_seed_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read seed questions" ON public.gaokao_reading_seed_questions FOR SELECT USING (true);
