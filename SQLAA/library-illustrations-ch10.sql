-- ============================================================================
-- 图书馆插图 · 绿野仙踪 第 10 章「The Guardian of the Gates」(6 张独立高清水彩,Gemini)
-- ⚠️ 本章原本【没有】Denslow 章首图(DB 查证 ch10 零行),故无退休步骤,只新增 6 张。
-- 导入:position = 【章内段号 1-based】(见 DECISIONS.md)。本章 57 段。位置:7/44/45/46/55/57。
--    走进翠绿的奥兹国黄砖路(¶7)→抵翡翠镶嵌的城门(¶44)→门开翡翠城耀眼呈现(¶45)→守门人开门(¶46)→给众人戴绿眼镜(¶55)→随守门人进宫殿(¶57)。
--    全图 1000×558。图已降采样(宽≤1000px, JPEG q82)传入桶 library-illustrations/wizard-of-oz/。幂等;前后计数。
-- ============================================================================
BEGIN;

SELECT 'before' AS phase, count(*) AS ch10_rows,
       count(*) FILTER (WHERE li.is_published) AS published
  FROM public.library_illustrations li JOIN public.library_books b ON b.id=li.book_id
 WHERE b.book_key='wizard-of-oz' AND li.chapter_idx=10;

-- 导入新 6 张(position=章内段号)。本章无旧图,无退休步骤。
INSERT INTO public.library_illustrations
  (book_id, chapter_idx, position, image_path, caption, alt_text, credit, width, height, is_published)
VALUES
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 10, 7,  'wizard-of-oz/ch10-land-of-oz.jpg', '', 'The four companions and Toto walk a smooth yellow brick road through the lush green farmland of the Land of Oz, a green farmhouse nearby.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 10, 44, 'wizard-of-oz/ch10-emerald-gate.jpg', '', 'Dorothy and her friends stand before the great emerald-studded gate set in the green wall at the end of the yellow brick road.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 10, 45, 'wizard-of-oz/ch10-city-revealed.jpg', '', 'The gates swing open to reveal the dazzling green towers and domes of the Emerald City, as the travelers shield their eyes from its glory.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 10, 46, 'wizard-of-oz/ch10-guardian-door.jpg', '', 'The little green Guardian of the Gates, dressed all in green and carrying a green box, peers out through the door as Dorothy and her friends wait.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 10, 55, 'wizard-of-oz/ch10-fit-spectacles.jpg', '', 'The Guardian of the Gates fits green spectacles onto Dorothy from his box of green glasses, with Toto already wearing a pair and the others waiting.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 10, 57, 'wizard-of-oz/ch10-palace-hall.jpg', '', 'Wearing their green spectacles, Dorothy, Toto, the Lion, the Tin Woodman and the Scarecrow sit waiting in a grand emerald-green hall of the Palace.', '', 1000, 558, true)
ON CONFLICT (book_id, chapter_idx, position) DO UPDATE SET
  image_path=EXCLUDED.image_path, caption=EXCLUDED.caption, alt_text=EXCLUDED.alt_text,
  credit=EXCLUDED.credit, width=EXCLUDED.width, height=EXCLUDED.height, is_published=EXCLUDED.is_published;

SELECT 'after' AS phase, count(*) AS ch10_rows,
       count(*) FILTER (WHERE li.is_published) AS published,
       count(*) FILTER (WHERE NOT li.is_published) AS retired
  FROM public.library_illustrations li JOIN public.library_books b ON b.id=li.book_id
 WHERE b.book_key='wizard-of-oz' AND li.chapter_idx=10;

COMMIT;
