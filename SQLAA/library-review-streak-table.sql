-- ============================================================================
-- Batch 2 · 连续学习天数(🔥)· 图书馆复习专用第四张可写表(DECISIONS.md D15,Aaron 批准·仅本功能)。
-- 用户私有,每人一行。复习完成一次记「今天学过」;跨天连续则 +1,断了重置 1;longest 记历史最长。
-- 用户私有 → RLS 仅本人读写。绝不碰那三张词汇掌握表。幂等(IF NOT EXISTS)。
-- ============================================================================
BEGIN;

CREATE TABLE IF NOT EXISTS public.library_review_streak (
  user_id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_review_date date,
  review_streak    int NOT NULL DEFAULT 0,
  longest_streak   int NOT NULL DEFAULT 0,
  updated_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.library_review_streak ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own review streak select" ON public.library_review_streak;
CREATE POLICY "own review streak select" ON public.library_review_streak
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own review streak insert" ON public.library_review_streak;
CREATE POLICY "own review streak insert" ON public.library_review_streak
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "own review streak update" ON public.library_review_streak;
CREATE POLICY "own review streak update" ON public.library_review_streak
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

COMMIT;
