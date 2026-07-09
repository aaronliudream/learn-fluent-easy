-- ============================================================================
-- 阅读中心(Reading Center)· 建表 DDL
-- 决策依据:docs/reading/ARCHITECTURE.md §1.1、DECISIONS.md D1/D2/D8
-- 纯技术 DDL(不含内容),可随时跑;跑完再跑 reading-center-seed-sample.sql(内容,须先过审)。
-- 幂等:IF NOT EXISTS,可重复执行。
-- ============================================================================

BEGIN;

-- 跑前基线
SELECT 'before' AS phase,
       (SELECT count(*) FROM information_schema.tables
         WHERE table_schema='public' AND table_name='reading_library') AS reading_library_exists;

CREATE TABLE IF NOT EXISTS public.reading_library (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type  text NOT NULL CHECK (content_type IN ('graded_reader','book_chapter','exam_passage')),
  grade_band    text NOT NULL CHECK (grade_band IN ('primary','junior','senior','general')),
  level         text,                          -- 词数分级标签(D8);自由文本可扩展
  title         text NOT NULL,
  body          text NOT NULL,                 -- 原文
  word_count    int,
  difficulty    smallint NOT NULL DEFAULT 2,   -- 1..4
  topic         text,
  questions     jsonb NOT NULL DEFAULT '[]',   -- [{ q, options[], answer:"A".., explanation? }] 同构 junior_reading
  vocab_notes   jsonb NOT NULL DEFAULT '[]',   -- [{ word, cn }] 同构 junior_reading
  is_published  boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reading_library_band_type
  ON public.reading_library (grade_band, content_type);

ALTER TABLE public.reading_library ENABLE ROW LEVEL SECURITY;

-- 任何人可读(练习内容公开);写入仅 service role(灌库脚本),不建 client 写策略。
DROP POLICY IF EXISTS "Anyone read reading_library" ON public.reading_library;
CREATE POLICY "Anyone read reading_library"
  ON public.reading_library FOR SELECT USING (true);

-- 跑后核对
SELECT 'after' AS phase,
       (SELECT count(*) FROM information_schema.tables
         WHERE table_schema='public' AND table_name='reading_library') AS reading_library_exists,
       (SELECT count(*) FROM public.reading_library) AS row_count;

COMMIT;
