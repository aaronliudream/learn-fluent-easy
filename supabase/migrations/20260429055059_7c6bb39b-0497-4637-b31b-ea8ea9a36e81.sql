CREATE TABLE IF NOT EXISTS public.slang_mastery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  idiom_id integer NOT NULL,
  correct_count integer NOT NULL DEFAULT 0,
  wrong_count integer NOT NULL DEFAULT 0,
  last_result text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, idiom_id)
);

ALTER TABLE public.slang_mastery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own slang mastery"
  ON public.slang_mastery FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own slang mastery"
  ON public.slang_mastery FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own slang mastery"
  ON public.slang_mastery FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own slang mastery"
  ON public.slang_mastery FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_slang_mastery_updated_at
  BEFORE UPDATE ON public.slang_mastery
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_slang_mastery_user ON public.slang_mastery (user_id);