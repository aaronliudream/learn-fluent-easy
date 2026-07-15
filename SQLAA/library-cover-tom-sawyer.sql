-- ============================================================================
-- 图书馆 · 汤姆·索亚历险记 整幅封面图(替换双色渐变占位)
-- 封面已传桶 library-illustrations/tom-sawyer/tom-sawyer-cover-v2.jpg(768×1024,3:4,含金色衬线书名+作者)。
-- ⚠️ v2 文件名:原 tom-sawyer-cover.jpg 曾被浏览器/CDN 缓存成"无书名"旧图;换新文件名强制刷新,一劳永逸。
-- cover jsonb 加 image 字段;保留 c1/c2 作图未加载时渐变兜底。幂等。
-- ============================================================================
BEGIN;
SELECT 'before' AS phase, book_key, cover FROM public.library_books WHERE book_key='tom-sawyer';
UPDATE public.library_books
   SET cover = jsonb_build_object(
         'image', 'tom-sawyer/tom-sawyer-cover-v2.jpg',
         'c1', COALESCE(cover->>'c1', '#b45309'),
         'c2', COALESCE(cover->>'c2', '#78350f')
       )
 WHERE book_key='tom-sawyer';
SELECT 'after' AS phase, book_key, cover FROM public.library_books WHERE book_key='tom-sawyer';
COMMIT;
