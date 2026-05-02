
-- ============================================================
-- 1. 高中阅读文章主表（科学版，区别于旧 passages）
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gaokao_reading_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,

  -- 年级板块
  grade_band TEXT NOT NULL CHECK (grade_band IN ('g1','g2','g3','gaokao')),
  sub_band TEXT, -- 如 '高三下学期冲刺' '高考真题' '高一上'

  -- 主题语境（课程标准三大主题）
  theme_context TEXT NOT NULL CHECK (theme_context IN ('self','society','nature')),
  topic_group TEXT NOT NULL,    -- 话题群，如 '生活与学习'
  specific_topic TEXT NOT NULL, -- 具体话题，如 '时间管理'

  -- 文章基本信息
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  genre TEXT NOT NULL CHECK (genre IN ('narrative','applied','expository','argumentative','seven_choose_five')),
  genre_label TEXT, -- 显示用 'D篇议论文'
  word_count INTEGER NOT NULL,
  recommended_minutes INTEGER NOT NULL DEFAULT 8,

  -- 难度
  cefr_level TEXT, -- A2/B1/B2/C1
  difficulty INTEGER NOT NULL DEFAULT 3 CHECK (difficulty BETWEEN 1 AND 5),

  -- 文章分析（Stage 3 复盘用）
  paragraph_structure TEXT,    -- 段落结构分析
  writing_techniques TEXT,     -- 写作手法
  core_question_types TEXT,    -- 核心考点
  exam_strategies TEXT,        -- 应试技巧
  topic_connection TEXT,       -- 主题关联（写作素材）

  -- 写作可借用
  useful_sentences JSONB DEFAULT '[]'::jsonb, -- [{en, cn}]
  argumentation_logic TEXT,

  -- 元数据
  source_label TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reading_articles_band ON public.gaokao_reading_articles(grade_band, sort_order);
CREATE INDEX IF NOT EXISTS idx_reading_articles_topic ON public.gaokao_reading_articles(theme_context, topic_group);

ALTER TABLE public.gaokao_reading_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reading articles are public readable"
ON public.gaokao_reading_articles FOR SELECT TO public USING (is_published = true);

CREATE TRIGGER trg_reading_articles_updated
BEFORE UPDATE ON public.gaokao_reading_articles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ============================================================
-- 2. 阅读题目表（独立于旧 reading_questions，绑定新 articles）
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gaokao_reading_article_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.gaokao_reading_articles(id) ON DELETE CASCADE,

  sort_order INTEGER NOT NULL DEFAULT 0,
  stem TEXT NOT NULL,

  -- 题型标签（核心：用于诊断）
  question_type TEXT NOT NULL CHECK (question_type IN (
    'main_idea',     -- 主旨大意
    'detail',        -- 细节理解
    'inference',     -- 推理判断
    'vocabulary',    -- 词义猜测
    'attitude',      -- 作者态度
    'purpose',       -- 写作意图
    'data_interp',   -- 数据解读
    'viewpoint'      -- 观点细节
  )),
  question_type_cn TEXT, -- 显示用中文

  -- 选项
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('A','B','C','D')),

  -- 四项逐一解析（Stage 3 复盘）
  explanation_a TEXT,
  explanation_b TEXT,
  explanation_c TEXT,
  explanation_d TEXT,
  general_explanation TEXT, -- 总解析

  -- 定位
  locate_paragraph INTEGER, -- 答案所在段落
  key_sentence TEXT,        -- 关键句

  difficulty INTEGER NOT NULL DEFAULT 3 CHECK (difficulty BETWEEN 1 AND 5),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_article_questions_article ON public.gaokao_reading_article_questions(article_id, sort_order);

ALTER TABLE public.gaokao_reading_article_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Article questions are public readable"
ON public.gaokao_reading_article_questions FOR SELECT TO public USING (true);


-- ============================================================
-- 3. 文章生词表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gaokao_reading_article_vocab (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.gaokao_reading_articles(id) ON DELETE CASCADE,

  word TEXT NOT NULL,
  phonetic TEXT,
  pos TEXT,
  meaning_cn TEXT NOT NULL,
  meaning_en TEXT,
  example_en TEXT,
  example_cn TEXT,

  category TEXT NOT NULL DEFAULT 'word' CHECK (category IN ('word','phrase','collocation')),
  importance INTEGER NOT NULL DEFAULT 3 CHECK (importance BETWEEN 1 AND 5),
  sort_order INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_article_vocab_article ON public.gaokao_reading_article_vocab(article_id, category, sort_order);

ALTER TABLE public.gaokao_reading_article_vocab ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Article vocab is public readable"
ON public.gaokao_reading_article_vocab FOR SELECT TO public USING (true);


-- ============================================================
-- 4. 阅读会话表（三阶段隔离的核心）
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gaokao_reading_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  article_id UUID NOT NULL REFERENCES public.gaokao_reading_articles(id) ON DELETE CASCADE,

  -- 会话状态
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','submitted','reviewed')),

  -- 答题记录 [{question_id, user_answer, is_correct, question_type}]
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- 成绩
  total_questions INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  score_pct REAL,

  -- 用时
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  duration_seconds INTEGER,

  -- 各题型表现 {main_idea: {correct: 1, total: 1}, ...}
  type_breakdown JSONB DEFAULT '{}'::jsonb,

  -- 用户标注（划线/笔记）
  annotations JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reading_sessions_user ON public.gaokao_reading_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_article ON public.gaokao_reading_sessions(article_id);

ALTER TABLE public.gaokao_reading_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own reading sessions"
ON public.gaokao_reading_sessions FOR SELECT TO public USING (auth.uid() = user_id);

CREATE POLICY "Users insert own reading sessions"
ON public.gaokao_reading_sessions FOR INSERT TO public WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own reading sessions"
ON public.gaokao_reading_sessions FOR UPDATE TO public USING (auth.uid() = user_id);

CREATE TRIGGER trg_reading_sessions_updated
BEFORE UPDATE ON public.gaokao_reading_sessions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
