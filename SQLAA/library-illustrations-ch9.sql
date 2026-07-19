-- ============================================================================
-- 图书馆插图 · 绿野仙踪 第 9 章「The Queen of the Field Mice」(6 张独立高清水彩,Gemini)
-- ① 退休旧图:ch9-field-mice-queen.jpg(Denslow 章首图,position=0)→ is_published=false + position 挪负数隔离(精确路径)。
-- ② 导入新 6 张:position = 【章内段号 1-based】(见 DECISIONS.md)。本章 41 段。位置:2/8/30/31/35/37。
--    铁皮人挥斧救田鼠(¶2)→向鼠后行礼(¶8)→造木车(¶30)+千鼠涌来(¶31)→千鼠拉载睡狮的车(¶35)→多萝西搂住获救的狮子(¶37)。
--    全图 1000×558。图已降采样(宽≤1000px, JPEG q82)传入桶 library-illustrations/wizard-of-oz/。幂等;前后计数。
-- ============================================================================
BEGIN;

SELECT 'before' AS phase, count(*) AS ch9_rows,
       count(*) FILTER (WHERE li.is_published) AS published
  FROM public.library_illustrations li JOIN public.library_books b ON b.id=li.book_id
 WHERE b.book_key='wizard-of-oz' AND li.chapter_idx=9;

-- ① 退休旧 Denslow 章首图(精确路径 + 仅当前 position>=0 → 幂等)
UPDATE public.library_illustrations li
   SET is_published=false, position = li.position - 1000
  FROM public.library_books b
 WHERE b.id=li.book_id AND b.book_key='wizard-of-oz' AND li.chapter_idx=9
   AND li.image_path = 'wizard-of-oz/ch9-field-mice-queen.jpg' AND li.position >= 0;

-- ② 导入新 6 张(position=章内段号)
INSERT INTO public.library_illustrations
  (book_id, chapter_idx, position, image_path, caption, alt_text, credit, width, height, is_published)
VALUES
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 9, 2,  'wizard-of-oz/ch9-wildcat-chase.jpg', '', 'A snarling Wildcat chases a little gray field mouse across the meadow as the Tin Woodman raises his axe to strike.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 9, 8,  'wizard-of-oz/ch9-mouse-queen-bow.jpg', '', 'The Tin Woodman kneels and bows politely to the tiny crowned Queen of the Field Mice, his axe laid on the grass.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 9, 30, 'wizard-of-oz/ch9-build-truck.jpg', '', 'The Tin Woodman and the Scarecrow build a wooden truck with round wheels while the little crowned Queen of the Mice watches from a tree stump.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 9, 31, 'wizard-of-oz/ch9-thousands-mice.jpg', '', 'Thousands upon thousands of field mice stream across the meadow toward Dorothy and the Scarecrow, each coming to help.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 9, 35, 'wizard-of-oz/ch9-mice-haul-lion.jpg', '', 'The sleeping Lion lies loaded on the little truck as thousands of harnessed mice pull it with strings and the Tin Woodman and Scarecrow push from behind.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 9, 37, 'wizard-of-oz/ch9-dorothy-lion.jpg', '', 'Dorothy hugs the great Lion fondly, glad he was saved from the poppies, with Toto beside her and the Scarecrow and Tin Woodman looking on.', '', 1000, 558, true)
ON CONFLICT (book_id, chapter_idx, position) DO UPDATE SET
  image_path=EXCLUDED.image_path, caption=EXCLUDED.caption, alt_text=EXCLUDED.alt_text,
  credit=EXCLUDED.credit, width=EXCLUDED.width, height=EXCLUDED.height, is_published=EXCLUDED.is_published;

SELECT 'after' AS phase, count(*) AS ch9_rows,
       count(*) FILTER (WHERE li.is_published) AS published,
       count(*) FILTER (WHERE NOT li.is_published) AS retired
  FROM public.library_illustrations li JOIN public.library_books b ON b.id=li.book_id
 WHERE b.book_key='wizard-of-oz' AND li.chapter_idx=9;

COMMIT;
