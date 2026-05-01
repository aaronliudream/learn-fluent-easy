
-- ============ 1. 语法知识点树 ============
CREATE TABLE public.gaokao_grammar_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES public.gaokao_grammar_points(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  explanation TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  difficulty INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gaokao_grammar_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Grammar points are public readable"
  ON public.gaokao_grammar_points FOR SELECT USING (true);
CREATE INDEX idx_gp_parent ON public.gaokao_grammar_points(parent_id);

-- ============ 2. 语法题库 ============
CREATE TABLE public.gaokao_grammar_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  point_id UUID NOT NULL REFERENCES public.gaokao_grammar_points(id) ON DELETE CASCADE,
  stem TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer CHAR(1) NOT NULL,
  explanation TEXT NOT NULL,
  difficulty INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gaokao_grammar_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Grammar questions are public readable"
  ON public.gaokao_grammar_questions FOR SELECT USING (true);
CREATE INDEX idx_gq_point ON public.gaokao_grammar_questions(point_id);

-- ============ 3. 阅读文章 ============
CREATE TABLE public.gaokao_reading_passages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  structure_analysis TEXT,
  topic TEXT,
  difficulty INTEGER NOT NULL DEFAULT 1,
  word_count INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gaokao_reading_passages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reading passages are public readable"
  ON public.gaokao_reading_passages FOR SELECT USING (true);

-- ============ 4. 阅读题 ============
CREATE TABLE public.gaokao_reading_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  passage_id UUID NOT NULL REFERENCES public.gaokao_reading_passages(id) ON DELETE CASCADE,
  stem TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer CHAR(1) NOT NULL,
  explanation_a TEXT,
  explanation_b TEXT,
  explanation_c TEXT,
  explanation_d TEXT,
  question_type TEXT NOT NULL DEFAULT 'detail',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gaokao_reading_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reading questions are public readable"
  ON public.gaokao_reading_questions FOR SELECT USING (true);
CREATE INDEX idx_rq_passage ON public.gaokao_reading_questions(passage_id);

-- ============ 5. 高考词汇 ============
CREATE TABLE public.gaokao_vocab (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  word TEXT NOT NULL UNIQUE,
  pos TEXT,
  meaning_cn TEXT NOT NULL,
  example_en TEXT,
  example_cn TEXT,
  frequency_band INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gaokao_vocab ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vocab is public readable"
  ON public.gaokao_vocab FOR SELECT USING (true);
CREATE INDEX idx_vocab_band ON public.gaokao_vocab(frequency_band);

-- ============ 6. 用户掌握度 ============
CREATE TABLE public.gaokao_user_mastery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_type TEXT NOT NULL,
  item_id UUID NOT NULL,
  correct_count INTEGER NOT NULL DEFAULT 0,
  wrong_count INTEGER NOT NULL DEFAULT 0,
  last_result TEXT,
  last_seen_at TIMESTAMPTZ,
  next_review_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_type, item_id)
);
ALTER TABLE public.gaokao_user_mastery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own mastery"
  ON public.gaokao_user_mastery FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own mastery"
  ON public.gaokao_user_mastery FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own mastery"
  ON public.gaokao_user_mastery FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own mastery"
  ON public.gaokao_user_mastery FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_mastery_user ON public.gaokao_user_mastery(user_id, item_type);

-- ============ 7. 用户答题记录 ============
CREATE TABLE public.gaokao_user_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  question_type TEXT NOT NULL,
  question_id UUID NOT NULL,
  user_answer CHAR(1),
  is_correct BOOLEAN NOT NULL,
  time_spent_seconds INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gaokao_user_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own attempts"
  ON public.gaokao_user_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own attempts"
  ON public.gaokao_user_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_attempts_user ON public.gaokao_user_attempts(user_id, created_at DESC);

-- ============ 触发器 ============
CREATE TRIGGER trg_gp_updated BEFORE UPDATE ON public.gaokao_grammar_points
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_mastery_updated BEFORE UPDATE ON public.gaokao_user_mastery
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
