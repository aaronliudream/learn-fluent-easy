-- ============================================================================
-- 图书馆 · 按书义项覆盖表 library_word_senses(古今异义 false-friend 专用)。
-- 规则(铁律):只给"该书里的义 ≠ 全局词典义"的词建行,不能变成"每本书一套词典"。
-- 点词/复习:先查本书覆盖(book_key+normalized)→ 有就用书中义,没有回退全局 read-v1 卡。
-- gloss_cn/gloss_en = 书中义(测试取);modern_cn/modern_en = 现代义(阅读卡片补充显示)。
-- 公开读(匿名读者点词/复习要用);仅服务端写。以后所有书通用。
-- 幂等:IF NOT EXISTS + policy 先删再建。Aaron 在 Dashboard 跑。
-- ============================================================================
BEGIN;

CREATE TABLE IF NOT EXISTS public.library_word_senses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_key    text NOT NULL,
  normalized  text NOT NULL,                -- 归一化键(= read-v1 / explain-phrase 同式)
  word        text NOT NULL,                -- 展示用原词
  ipa         text,
  pos         text,
  sense_key   text,
  gloss_cn    text NOT NULL,                -- 书中义(中文·测试取这个)
  gloss_en    text NOT NULL,                -- 书中义(英文·测试取这个)
  archaic     boolean NOT NULL DEFAULT true,
  modern_cn   text,                         -- 现代常见义(中文·卡片补充显示)
  modern_en   text,                         -- 现代常见义(英文)
  example_en  text,                         -- 书中义的新造例句(可选)
  example_cn  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (book_key, normalized)
);

ALTER TABLE public.library_word_senses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "word senses public read" ON public.library_word_senses;
CREATE POLICY "word senses public read" ON public.library_word_senses FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS library_word_senses_lookup
  ON public.library_word_senses (book_key, normalized);

COMMIT;
