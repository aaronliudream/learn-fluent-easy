-- ===========================================================================
-- 图书馆:把《绿野仙踪》(wizard-of-oz)置为 published,开放直链访问。
--   · 仅翻转 is_published 标志,不动任何句子/进度数据。
--   · 软上线:未进 BrandHubNav,published 后也只有直链 /library/wizard-of-oz 可达。
--   · 改库铁律:BEGIN/COMMIT + 前后计数。审一眼再跑。
-- ===========================================================================

-- 跑前:确认现状(应为 1 行,is_published=false)
SELECT book_key, title, is_published
  FROM public.library_books
 WHERE book_key = 'wizard-of-oz';

BEGIN;

UPDATE public.library_books
   SET is_published = true
 WHERE book_key = 'wizard-of-oz';

COMMIT;

-- 跑后:确认已发布(应为 is_published=true),并核对句数仍 2083
SELECT b.book_key, b.title, b.is_published,
       (SELECT count(*) FROM public.library_sentences s WHERE s.book_id = b.id) AS sentence_rows
  FROM public.library_books b
 WHERE b.book_key = 'wizard-of-oz';

-- 如需回退下线:UPDATE public.library_books SET is_published=false WHERE book_key='wizard-of-oz';
