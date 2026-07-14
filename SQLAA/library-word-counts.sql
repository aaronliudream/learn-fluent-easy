-- ============================================================================
-- 首页图书馆板块 · 每书正文总词数(体量提示)。library_books 加 word_count 列 + 逐书回填。
-- 数值由 scripts/library/compute-word-counts.mjs 枚举(该书 library_sentences 英文词数总和)。纯追加,幂等。
-- ============================================================================
BEGIN;

ALTER TABLE public.library_books ADD COLUMN IF NOT EXISTS word_count int;

UPDATE public.library_books SET word_count=289 WHERE id='d2c34f14-0d04-4f8d-ad3d-07ddd8ce2822'; -- aesop-easy-readers
UPDATE public.library_books SET word_count=39154 WHERE id='35ba5fa2-d642-4487-86c7-33c5855a6db9'; -- wizard-of-oz

SELECT book_key, word_count FROM public.library_books ORDER BY book_key;

COMMIT;
