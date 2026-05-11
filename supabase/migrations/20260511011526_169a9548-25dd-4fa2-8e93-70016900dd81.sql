
CREATE TABLE IF NOT EXISTS public.primary_storybook_completion (
  user_id UUID NOT NULL,
  book_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  questions_correct INT NOT NULL DEFAULT 0,
  questions_total INT NOT NULL DEFAULT 0,
  read_count INT NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id, book_id)
);

ALTER TABLE public.primary_storybook_completion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own storybook completion"
  ON public.primary_storybook_completion FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own storybook completion"
  ON public.primary_storybook_completion FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own storybook completion"
  ON public.primary_storybook_completion FOR UPDATE
  USING (auth.uid() = user_id);
