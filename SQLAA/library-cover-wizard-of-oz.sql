-- ============================================================================
-- 图书馆 · 绿野仙踪整幅封面图(替换原双色渐变占位封面)
-- 封面图已传桶 library-illustrations/wizard-of-oz/oz-cover.jpg(800×1071,3:4,含书名艺术字)。
-- cover jsonb 加 image 字段(桶内相对路径);保留 c1/c2 作为图未加载时的渐变兜底。
-- 前端:cover.image 存在时渲染整幅封面并隐藏叠加的书名/图标(书名已在封面画里,避免双标题)。幂等。
-- ============================================================================
BEGIN;

SELECT 'before' AS phase, book_key, cover
  FROM public.library_books WHERE book_key='wizard-of-oz';

UPDATE public.library_books
   SET cover = jsonb_build_object(
         'image', 'wizard-of-oz/oz-cover.jpg',
         'c1', COALESCE(cover->>'c1', '#10b981'),
         'c2', COALESCE(cover->>'c2', '#065f46')
       ),
       updated_at = now()
 WHERE book_key='wizard-of-oz';

SELECT 'after' AS phase, book_key, cover
  FROM public.library_books WHERE book_key='wizard-of-oz';

COMMIT;
