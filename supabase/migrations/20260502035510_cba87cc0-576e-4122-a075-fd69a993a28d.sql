-- A. 多维度矩阵：JSONB 形如 {"spell":3,"listen":2,"en2cn":4,...}
ALTER TABLE public.gaokao_user_mastery
  ADD COLUMN IF NOT EXISTS mastery_matrix jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS mastery_level smallint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_latency_ms integer,
  ADD COLUMN IF NOT EXISTS lapses integer NOT NULL DEFAULT 0,
  -- B. FSRS 字段
  ADD COLUMN IF NOT EXISTS difficulty real NOT NULL DEFAULT 5.0,
  ADD COLUMN IF NOT EXISTS stability real NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_grade smallint,
  ADD COLUMN IF NOT EXISTS due_at timestamptz,
  -- C. 长期保留检测
  ADD COLUMN IF NOT EXISTS retention_check_at timestamptz,
  ADD COLUMN IF NOT EXISTS reached_master_at timestamptz;

-- Backfill due_at from existing next_review_at for compatibility
UPDATE public.gaokao_user_mastery
SET due_at = next_review_at
WHERE due_at IS NULL;

-- Index for SRS due queries
CREATE INDEX IF NOT EXISTS idx_mastery_user_due
  ON public.gaokao_user_mastery (user_id, due_at)
  WHERE item_type = 'vocab';

CREATE INDEX IF NOT EXISTS idx_mastery_user_level
  ON public.gaokao_user_mastery (user_id, mastery_level)
  WHERE item_type = 'vocab';