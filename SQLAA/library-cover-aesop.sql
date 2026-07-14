-- ============================================================================
-- 图书馆 · 伊索寓言整幅封面图(替换双色渐变占位)。复用 cover.image 机制(前端已支持)。
-- 封面图已传桶 library-illustrations/aesop-easy-readers/aesop-cover.jpg(800×1125,含书名艺术字)。
-- 保留原 c1/c2 作图未加载时的渐变兜底。幂等。
-- ============================================================================
BEGIN;

SELECT 'before' AS phase, book_key, zh_title, cover FROM public.library_books WHERE book_key='aesop-easy-readers';

-- 封面图 + 去掉标题里的「 · 分级阅读」(书架卡显示「伊索寓言」)
UPDATE public.library_books
   SET cover = jsonb_build_object(
         'image', 'aesop-easy-readers/aesop-cover.jpg',
         'c1', COALESCE(cover->>'c1', '#f59e0b'),
         'c2', COALESCE(cover->>'c2', '#92400e')
       ),
       zh_title = '伊索寓言',
       updated_at = now()
 WHERE book_key='aesop-easy-readers';

SELECT 'after' AS phase, book_key, zh_title, cover FROM public.library_books WHERE book_key='aesop-easy-readers';

COMMIT;
