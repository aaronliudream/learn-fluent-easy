-- ===========================================================================
-- 图书馆「文化笔记」② 读中词卡笔记 · library_culture_notes 表(仅建表·零内容)。
--   · 稀疏:全书几千词只 ~30-50 词挂笔记;点词出卡 → 卡底多一行「💡 标题 ›」默认收起。
--   · 与 library_chunks / library_illustrations 同构:内容表 RLS(只读已发布,写仅 service_role)。
--   · term 存归一化小写(和点读命中一致);一书一词一条(UNIQUE book_id+term);
--     chapter_idx = 锚定章(供 ③ 章末合集按章聚合)。
--   · ⚠️ 内容红线:AI 只出候选+初稿,Aaron 逐条审过才 INSERT(讲史实/地理/气象,AI 易编造)。
--     本文件只建表结构,内容走单独的 library-culture-notes-<book>.sql(审核通过后再出)。
-- ===========================================================================

SELECT EXISTS (SELECT 1 FROM information_schema.tables
       WHERE table_schema='public' AND table_name='library_culture_notes') AS table_exists;

BEGIN;

CREATE TABLE IF NOT EXISTS public.library_culture_notes (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id      uuid NOT NULL REFERENCES public.library_books(id) ON DELETE CASCADE,
  term         text NOT NULL,                       -- 归一化小写(点读命中键)
  chapter_idx  int  NOT NULL,                        -- 锚定章(③ 章末合集按章取)
  title        text NOT NULL,                        -- 短标题(卡底那一行显示)
  body_zh      text NOT NULL,                        -- 笔记正文·中文(默认展开语言)
  body_en      text,                                 -- 笔记正文·英文(可选,EN 切换)
  is_published boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (book_id, term)
);

CREATE INDEX IF NOT EXISTS idx_library_culture_notes_book
  ON public.library_culture_notes (book_id) WHERE is_published;
CREATE INDEX IF NOT EXISTS idx_library_culture_notes_book_ch
  ON public.library_culture_notes (book_id, chapter_idx) WHERE is_published;

ALTER TABLE public.library_culture_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "lcn_read_published" ON public.library_culture_notes;
CREATE POLICY "lcn_read_published" ON public.library_culture_notes
  FOR SELECT USING (is_published = true);

COMMENT ON TABLE public.library_culture_notes IS
  '图书馆文化笔记(② 读中词卡 / ③ 章末合集);点词命中 term 显示 💡 标题,展开看史实/地理/气象小知识。内容须人工审核。';

SELECT 'after' AS phase, count(*) AS rows FROM public.library_culture_notes;

COMMIT;
