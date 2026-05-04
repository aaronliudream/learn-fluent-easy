-- AI tutor conversations (Socratic Q&A tied to a specific question/mistake)
CREATE TABLE public.tutor_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  -- Where the conversation lives: 'junior_grammar' | 'gaokao_grammar' | 'mistakes' | 'gaokao_mistakes' | 'lesson' | 'workplace' | etc.
  context TEXT NOT NULL,
  -- Stable identifier for the specific question/word/topic (string for flexibility)
  question_ref TEXT NOT NULL,
  -- Snapshot for the AI prompt (question stem, options, correct answer, user answer, explanation, etc.)
  question_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  language TEXT NOT NULL DEFAULT 'zh',
  hint_level INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_tutor_conv_user ON public.tutor_conversations(user_id, created_at DESC);
CREATE UNIQUE INDEX idx_tutor_conv_unique ON public.tutor_conversations(user_id, context, question_ref);

ALTER TABLE public.tutor_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own conv select" ON public.tutor_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own conv insert" ON public.tutor_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own conv update" ON public.tutor_conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own conv delete" ON public.tutor_conversations FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.tutor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.tutor_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content TEXT NOT NULL,
  -- 0=normal, 1..3 = hint ladder
  hint_level INT,
  tokens_in INT,
  tokens_out INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_tutor_msg_conv ON public.tutor_messages(conversation_id, created_at);

ALTER TABLE public.tutor_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own msg select" ON public.tutor_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own msg insert" ON public.tutor_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Per-user daily quota counter
CREATE TABLE public.tutor_usage_daily (
  user_id UUID NOT NULL,
  day DATE NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::date,
  message_count INT NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);
ALTER TABLE public.tutor_usage_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own usage select" ON public.tutor_usage_daily FOR SELECT USING (auth.uid() = user_id);

CREATE TRIGGER trg_tutor_conv_updated
  BEFORE UPDATE ON public.tutor_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();