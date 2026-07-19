-- ============================================================================
-- 图书馆插图 · 绿野仙踪 第 6 章「The Cowardly Lion」(6 张独立高清水彩,Gemini)
-- ① 退休旧图:ch6-cowardly-lion.jpg(Denslow 章首图,position=0)→ is_published=false + position 挪负数隔离(数据不删)
--    ⚠️ 用精确路径相等(非 LIKE),避免误伤新图。
-- ② 导入新 6 张:position = 【章内段号 1-based】(见 DECISIONS.md)。本章 47 段。位置:1/7/8/11/26/43。
--    ¶7 巨狮蹿上路一掌打飞稻草人/扑倒铁皮人 → 拆两图(7 咆哮登场 / 8 二人倒地);¶26 狮子拭泪诉悲哀;¶43 五人组启程。
--    全图 1000×558。图已降采样(宽≤1000px, JPEG q82)传入桶 library-illustrations/wizard-of-oz/。幂等;前后计数。
-- ============================================================================
BEGIN;

SELECT 'before' AS phase, count(*) AS ch6_rows,
       count(*) FILTER (WHERE li.is_published) AS published
  FROM public.library_illustrations li JOIN public.library_books b ON b.id=li.book_id
 WHERE b.book_key='wizard-of-oz' AND li.chapter_idx=6;

-- ① 退休旧 Denslow 章首图(精确路径 + 仅当前 position>=0 → 幂等)
UPDATE public.library_illustrations li
   SET is_published=false, position = li.position - 1000
  FROM public.library_books b
 WHERE b.id=li.book_id AND b.book_key='wizard-of-oz' AND li.chapter_idx=6
   AND li.image_path = 'wizard-of-oz/ch6-cowardly-lion.jpg' AND li.position >= 0;

-- ② 导入新 6 张(position=章内段号)
INSERT INTO public.library_illustrations
  (book_id, chapter_idx, position, image_path, caption, alt_text, credit, width, height, is_published)
VALUES
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 6, 1,  'wizard-of-oz/ch6-into-dark-forest.jpg', '', 'Dorothy holding Toto walks the yellow brick road into a dark forest alongside the Scarecrow and the Tin Woodman.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 6, 7,  'wizard-of-oz/ch6-lion-bounds.jpg', '', 'A great Lion bounds roaring onto the road as a frightened Dorothy scoops up Toto.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 6, 8,  'wizard-of-oz/ch6-knocks-down.jpg', '', 'One blow of the Lion''s paw sends the straw Scarecrow flying while the Tin Woodman lies flat in the road, his axe fallen beside him.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 6, 11, 'wizard-of-oz/ch6-dorothy-scolds.jpg', '', 'Little Dorothy shakes her finger up at the huge Lion, scolding him for being a coward, while Toto stands between them.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 6, 26, 'wizard-of-oz/ch6-lion-weeps.jpg', '', 'The Cowardly Lion wipes away tears with his paw as he tells of his sorrow, while Dorothy stands with hands on hips.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 6, 43, 'wizard-of-oz/ch6-company-five.jpg', '', 'The company of five — the Lion, Dorothy, Toto, the Scarecrow and the axe-bearing Tin Woodman — walk the yellow brick road together at sunset.', '', 1000, 558, true)
ON CONFLICT (book_id, chapter_idx, position) DO UPDATE SET
  image_path=EXCLUDED.image_path, caption=EXCLUDED.caption, alt_text=EXCLUDED.alt_text,
  credit=EXCLUDED.credit, width=EXCLUDED.width, height=EXCLUDED.height, is_published=EXCLUDED.is_published;

SELECT 'after' AS phase, count(*) AS ch6_rows,
       count(*) FILTER (WHERE li.is_published) AS published,
       count(*) FILTER (WHERE NOT li.is_published) AS retired
  FROM public.library_illustrations li JOIN public.library_books b ON b.id=li.book_id
 WHERE b.book_key='wizard-of-oz' AND li.chapter_idx=6;

COMMIT;
