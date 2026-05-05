-- ============ ielts_topics: 真题题库（公开读，管理员写） ============
CREATE TABLE public.ielts_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  part SMALLINT NOT NULL CHECK (part IN (1, 2, 3)),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  cue_card JSONB,
  difficulty TEXT NOT NULL DEFAULT 'standard' CHECK (difficulty IN ('easy', 'standard', 'hard')),
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ielts_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Topics readable by authenticated users"
  ON public.ielts_topics FOR SELECT TO authenticated
  USING (is_active = true);

-- 复用项目现有 has_role 函数（如未存在请 ping 我）
CREATE POLICY "Admins manage topics"
  ON public.ielts_topics FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_ielts_topics_part ON public.ielts_topics(part) WHERE is_active = true;
CREATE INDEX idx_ielts_topics_category ON public.ielts_topics(category);

-- ============ ielts_sessions: 单次完整练习 ============
CREATE TABLE public.ielts_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_band NUMERIC(2,1) NOT NULL DEFAULT 6.5 CHECK (target_band BETWEEN 4.0 AND 9.0),
  mode TEXT NOT NULL DEFAULT 'training' CHECK (mode IN ('training', 'mock_test', 'review')),
  topic_category TEXT,
  current_part SMALLINT DEFAULT 1 CHECK (current_part IN (1, 2, 3)),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'graded', 'abandoned')),
  transcript JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- 评分 JSON 结构: {overall_band, scores:{fluency_coherence,lexical_resource,grammar,pronunciation}, errors:[], missed_opportunities:[], strengths:[], next_session_plan:{}}
  feedback JSONB,
  overall_band NUMERIC(2,1),
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
ALTER TABLE public.ielts_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own sessions" ON public.ielts_sessions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own sessions" ON public.ielts_sessions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own sessions" ON public.ielts_sessions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own sessions" ON public.ielts_sessions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_ielts_sessions_user_recent
  ON public.ielts_sessions(user_id, created_at DESC);
CREATE INDEX idx_ielts_sessions_user_band
  ON public.ielts_sessions(user_id, completed_at DESC) WHERE status = 'graded';

-- ============ ielts_errors: 错题本 + FSRS 间隔复习 ============
CREATE TABLE public.ielts_errors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.ielts_sessions(id) ON DELETE SET NULL,
  part SMALLINT CHECK (part IN (1, 2, 3)),
  original TEXT NOT NULL,
  corrected TEXT NOT NULL,
  explanation_zh TEXT,
  higher_band_version TEXT,
  error_type TEXT NOT NULL,
  ielts_dimension TEXT NOT NULL CHECK (ielts_dimension IN ('fluency_coherence', 'lexical_resource', 'grammar', 'pronunciation')),
  severity SMALLINT NOT NULL DEFAULT 2 CHECK (severity BETWEEN 1 AND 3),
  -- FSRS 字段
  review_count INTEGER NOT NULL DEFAULT 0,
  ease_factor NUMERIC(3,2) NOT NULL DEFAULT 2.50,
  interval_days INTEGER NOT NULL DEFAULT 1,
  next_review_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_reviewed_at TIMESTAMPTZ,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ielts_errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own errors" ON public.ielts_errors
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own errors" ON public.ielts_errors
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own errors" ON public.ielts_errors
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own errors" ON public.ielts_errors
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_ielts_errors_due
  ON public.ielts_errors(user_id, next_review_at)
  WHERE is_resolved = false;
CREATE INDEX idx_ielts_errors_dimension
  ON public.ielts_errors(user_id, ielts_dimension) WHERE is_resolved = false;

-- ============ updated_at 触发器（复用现有 update_updated_at_column） ============
CREATE TRIGGER trg_ielts_topics_updated
  BEFORE UPDATE ON public.ielts_topics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_ielts_sessions_updated
  BEFORE UPDATE ON public.ielts_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_ielts_errors_updated
  BEFORE UPDATE ON public.ielts_errors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();