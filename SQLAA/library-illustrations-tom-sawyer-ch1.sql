-- ============================================================================
-- 图书馆插图 · 汤姆·索亚历险记 第 1 章(4 张水彩,16:9 横版)
-- 图已降采样(≤1000px, JPEG q82)传入桶 library-illustrations/tom-sawyer/。幂等;前后计数。
-- position=章内段号(1-based):0=章首 / P=第P段前 / >段数=章末。ch1 共 110 段。
--   0  姨妈找汤姆(开篇)| 18 偷果酱被抓 | 95 和新男孩打架 | 110 夜里翻窗回家(末段)
-- ⚠️ 先确认 4 张已传桶再跑。
-- ============================================================================
BEGIN;
SELECT 'before' AS phase, count(*) AS ch1_rows
  FROM public.library_illustrations li JOIN public.library_books b ON b.id=li.book_id
 WHERE b.book_key='tom-sawyer' AND li.chapter_idx=1;

INSERT INTO public.library_illustrations
  (book_id, chapter_idx, position, image_path, caption, alt_text, credit, width, height, is_published)
VALUES
  ((SELECT id FROM public.library_books WHERE book_key='tom-sawyer'), 1, 0, 'tom-sawyer/ch1-aunt-polly-searching.jpg', '', 'Aunt Polly peers over her spectacles searching the house for Tom, who is nowhere to be found.', '', 1000, 571, true),
  ((SELECT id FROM public.library_books WHERE book_key='tom-sawyer'), 1, 18, 'tom-sawyer/ch1-jam-caught.jpg', '', 'Aunt Polly grips Tom by the collar, catching him red-handed at the jam closet.', '', 1000, 571, true),
  ((SELECT id FROM public.library_books WHERE book_key='tom-sawyer'), 1, 95, 'tom-sawyer/ch1-fight-newboy.jpg', '', 'Tom wrestles the well-dressed new boy in the dust of the street.', '', 1000, 571, true),
  ((SELECT id FROM public.library_books WHERE book_key='tom-sawyer'), 1, 110, 'tom-sawyer/ch1-window-night.jpg', '', 'Late at night Tom climbs cautiously back in through the bedroom window.', '', 1000, 571, true)
ON CONFLICT (book_id, chapter_idx, position) DO UPDATE SET
  image_path=EXCLUDED.image_path, caption=EXCLUDED.caption, alt_text=EXCLUDED.alt_text,
  credit=EXCLUDED.credit, width=EXCLUDED.width, height=EXCLUDED.height, is_published=EXCLUDED.is_published;

SELECT 'after' AS phase, count(*) AS ch1_rows,
       count(*) FILTER (WHERE li.is_published) AS published
  FROM public.library_illustrations li JOIN public.library_books b ON b.id=li.book_id
 WHERE b.book_key='tom-sawyer' AND li.chapter_idx=1;
COMMIT;
