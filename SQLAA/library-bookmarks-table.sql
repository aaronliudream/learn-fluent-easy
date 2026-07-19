-- ============================================================================
-- 图书馆书签表 library_bookmarks(登录用户手动标记多个精准阅读点·跨设备)。
-- 与"继续阅读"library_reading_progress 独立:续读=自动记一个最后位置;书签=手动多个。
-- 照 library_vocab_favorites 的 own-row RLS 套路(用户隔离·关联 auth.users)。
-- 预览文字加书签时快照进表(preview/preview_cn),面板展示不依赖实时查句子表。
-- 幂等:IF NOT EXISTS + policy 先删再建。Aaron 在 Dashboard 跑。
-- ============================================================================
BEGIN;

CREATE TABLE IF NOT EXISTS public.library_bookmarks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id     uuid NOT NULL REFERENCES public.library_books(id) ON DELETE CASCADE,
  seq         int  NOT NULL,                 -- 段落开头句的全书 seq(精准定位点)
  chapter_idx int  NOT NULL,                 -- 该处所在章(列表显示 + 跳转省一次查)
  preview     text,                          -- 英文首句预览(快照,面板直接显示)
  preview_cn  text,                          -- 中文预览(快照,可选)
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, book_id, seq)             -- 同一处不重复收
);

ALTER TABLE public.library_bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bm own select" ON public.library_bookmarks;
DROP POLICY IF EXISTS "bm own insert" ON public.library_bookmarks;
DROP POLICY IF EXISTS "bm own delete" ON public.library_bookmarks;
CREATE POLICY "bm own select" ON public.library_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bm own insert" ON public.library_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bm own delete" ON public.library_bookmarks FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS library_bookmarks_user_book_idx
  ON public.library_bookmarks (user_id, book_id, seq DESC);

COMMIT;
