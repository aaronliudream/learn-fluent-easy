-- ============================================================================
-- Batch 2 · 按书掌握率分母:library_books 加 core_word_count / core_chunk_count 两列 + 逐书回填。
-- 数值由 scripts/library/compute-core-counts.mjs 枚举(该书正文 ∩ read-v1 卡)。纯追加,幂等。
-- 用途:按书掌握率 = 用户掌握该书词/块数 / 该书核心数(固定分母,只增不减·不惩罚努力)。
-- ============================================================================
BEGIN;

ALTER TABLE public.library_books
  ADD COLUMN IF NOT EXISTS core_word_count  int,
  ADD COLUMN IF NOT EXISTS core_chunk_count int;

UPDATE public.library_books SET core_word_count=126, core_chunk_count=5 WHERE id='d2c34f14-0d04-4f8d-ad3d-07ddd8ce2822'; -- aesop-easy-readers
UPDATE public.library_books SET core_word_count=2774, core_chunk_count=475 WHERE id='35ba5fa2-d642-4487-86c7-33c5855a6db9'; -- wizard-of-oz

SELECT book_key, core_word_count, core_chunk_count FROM public.library_books ORDER BY book_key;

COMMIT;
