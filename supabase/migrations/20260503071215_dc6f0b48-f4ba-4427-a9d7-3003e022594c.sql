
CREATE TABLE IF NOT EXISTS public.mastery_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  module text NOT NULL,           -- 'junior_reading' | 'gaokao_reading' | 'gaokao_cloze' | 'gaokao_grammar' | 'primary_reading' ...
  item_id text NOT NULL,          -- 内容项 id (string for flexibility)
  stars smallint NOT NULL DEFAULT 0,         -- 0..5
  best_pct smallint NOT NULL DEFAULT 0,      -- 0..100
  attempts integer NOT NULL DEFAULT 0,
  last_perfect_at timestamptz,    -- 上次100%完美的时间
  next_review_at timestamptz,     -- 遗忘曲线下次复习时间
  last_attempt_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, module, item_id)
);

ALTER TABLE public.mastery_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mp own select" ON public.mastery_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "mp own insert" ON public.mastery_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "mp own update" ON public.mastery_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS mp_user_module_idx ON public.mastery_progress(user_id, module);
CREATE INDEX IF NOT EXISTS mp_review_idx ON public.mastery_progress(user_id, next_review_at);
