-- ===========================================================================
-- 图书馆精读 · library_chunks 索引表(职责:正文虚线定位)。
--   · read-v1 服务"点击出卡"(全局按 term);library_chunks 服务"这一章有哪些语块要标虚线"。
--   · phrase_explanations 是全局按 term 存,问不出"某书某章的语块",故需本表。
--   · 与 library_illustrations 同构:内容表 RLS(只读已发布,写仅 service_role)。
--   · 每个语块每处出处一行(term 存表面形式;src_seq=出处句)。幂等:IF NOT EXISTS。
-- ===========================================================================

SELECT EXISTS (SELECT 1 FROM information_schema.tables
       WHERE table_schema='public' AND table_name='library_chunks') AS table_exists;

BEGIN;

CREATE TABLE IF NOT EXISTS public.library_chunks (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id      uuid NOT NULL REFERENCES public.library_books(id) ON DELETE CASCADE,
  chapter_idx  int  NOT NULL,
  term         text NOT NULL,                       -- 语块表面形式(和 read-v1 键一致 → 点击命中)
  src_seq      int  NOT NULL,                        -- 出处句 seq
  is_published boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (book_id, chapter_idx, term, src_seq)
);

CREATE INDEX IF NOT EXISTS idx_library_chunks_book_ch
  ON public.library_chunks (book_id, chapter_idx);

ALTER TABLE public.library_chunks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "lc_read_published" ON public.library_chunks;
CREATE POLICY "lc_read_published" ON public.library_chunks
  FOR SELECT USING (is_published = true);

COMMENT ON TABLE public.library_chunks IS
  '图书馆某书某章的语块位置索引(正文虚线用);点击出卡走 phrase_explanations read-v1。';

SELECT 'after' AS phase, count(*) AS rows FROM public.library_chunks;

COMMIT;
