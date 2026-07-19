-- ============================================================================
-- Batch 2 · 按书掌握率「精选核心词」分母:library_books 加 core_word_count / core_chunk_count 两列 + 逐书回填。
-- 门槛(Aaron 定):核心词 = 正文出现≥10次·有 read-v1 卡·非虚词·非专名;核心语块 = read-v1 语块卡出现≥4次。
-- 由 scripts/library/compute-core-counts.mjs 枚举。固定分母·只增不减不惩罚努力。纯追加,幂等。
-- ============================================================================
BEGIN;

ALTER TABLE public.library_books
  ADD COLUMN IF NOT EXISTS core_word_count  int,
  ADD COLUMN IF NOT EXISTS core_chunk_count int;

UPDATE public.library_books SET core_word_count=0, core_chunk_count=0 WHERE id='d2c34f14-0d04-4f8d-ad3d-07ddd8ce2822'; -- aesop-easy-readers
UPDATE public.library_books SET core_word_count=401, core_chunk_count=91 WHERE id='35ba5fa2-d642-4487-86c7-33c5855a6db9'; -- wizard-of-oz

SELECT book_key, core_word_count, core_chunk_count FROM public.library_books ORDER BY book_key;

COMMIT;
