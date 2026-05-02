
CREATE TABLE public.user_mistakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  module text NOT NULL,
  source_key text NOT NULL,
  source_label text,
  question text NOT NULL,
  user_answer text,
  correct_answer text,
  explanation text,
  snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  wrong_count integer NOT NULL DEFAULT 1,
  is_resolved boolean NOT NULL DEFAULT false,
  is_starred boolean NOT NULL DEFAULT false,
  last_wrong_at timestamptz NOT NULL DEFAULT now(),
  next_review_at timestamptz NOT NULL DEFAULT (now() + interval '1 day'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, module, source_key)
);

CREATE INDEX idx_user_mistakes_user_due ON public.user_mistakes(user_id, next_review_at) WHERE is_resolved = false;
CREATE INDEX idx_user_mistakes_user_module ON public.user_mistakes(user_id, module);

ALTER TABLE public.user_mistakes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users select own mistakes" ON public.user_mistakes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own mistakes" ON public.user_mistakes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own mistakes" ON public.user_mistakes
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "users delete own mistakes" ON public.user_mistakes
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_user_mistakes_updated_at
  BEFORE UPDATE ON public.user_mistakes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
