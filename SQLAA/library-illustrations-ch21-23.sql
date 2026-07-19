-- ============================================================================
-- 图书馆插图 · 绿野仙踪 第 21–23 章(3 章 × 6 张 = 18 张独立高清水彩,Gemini)
-- 单文件单事务:每章①退休旧 Denslow 章首图(精确路径·position 挪负数·幂等)②导入 6 张。
-- position = 章内段号 1-based(见 DECISIONS.md)。
-- ⚠️ 第 24 章「Home Again」(仅 3 段)另出:图数待 Aaron 定(保留 3–4 张),单独一个 SQL。
-- 全图降采样(宽≤1000px, JPEG q82)已传桶 library-illustrations/wizard-of-oz/。ON CONFLICT 幂等。
-- ============================================================================
BEGIN;

SELECT 'before' AS phase, li.chapter_idx,
       count(*) AS rows, count(*) FILTER (WHERE li.is_published) AS published
  FROM public.library_illustrations li JOIN public.library_books b ON b.id=li.book_id
 WHERE b.book_key='wizard-of-oz' AND li.chapter_idx BETWEEN 21 AND 23
 GROUP BY li.chapter_idx ORDER BY li.chapter_idx;

-- ---------- 第 21 章 ----------
UPDATE public.library_illustrations li
   SET is_published=false, position = li.position - 1000
  FROM public.library_books b
 WHERE b.id=li.book_id AND b.book_key='wizard-of-oz' AND li.chapter_idx=21
   AND li.image_path = 'wizard-of-oz/ch21-lion-king.jpg' AND li.position >= 0;

INSERT INTO public.library_illustrations
  (book_id, chapter_idx, position, image_path, caption, alt_text, credit, width, height, is_published)
VALUES
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 21, 1, 'wizard-of-oz/ch21-marsh-crossing.jpg', '', 'The Lion leads Dorothy holding Toto, the Scarecrow, and the Tin Woodman through tall marsh grass with the china wall far behind them.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 21, 2, 'wizard-of-oz/ch21-forest-arrival.jpg', '', 'The four friends stand together in a grand green forest where sunbeams shine down through towering moss-covered trees.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 21, 8, 'wizard-of-oz/ch21-beast-assembly.jpg', '', 'The Lion stands calmly in the middle of a huge crowd of tigers, bears, deer, wolves, and an elephant gathered among the trees.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 21, 21, 'wizard-of-oz/ch21-sleeping-spider.jpg', '', 'The Lion creeps quietly up to an enormous hairy spider that lies fast asleep on the mossy forest floor.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 21, 22, 'wizard-of-oz/ch21-spider-battle.jpg', '', 'The mighty Lion rears up on his hind legs and swings a giant paw at the great spider tangled in its webs.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 21, 25, 'wizard-of-oz/ch21-lion-crowned.jpg', '', 'The Lion stands proudly on a mossy rock in a beam of golden light while all the forest animals bow down before their new king.', '', 1000, 558, true)
ON CONFLICT (book_id, chapter_idx, position) DO UPDATE SET
  image_path=EXCLUDED.image_path, caption=EXCLUDED.caption, alt_text=EXCLUDED.alt_text,
  credit=EXCLUDED.credit, width=EXCLUDED.width, height=EXCLUDED.height, is_published=EXCLUDED.is_published;

-- ---------- 第 22 章 ----------
UPDATE public.library_illustrations li
   SET is_published=false, position = li.position - 1000
  FROM public.library_books b
 WHERE b.id=li.book_id AND b.book_key='wizard-of-oz' AND li.chapter_idx=22
   AND li.image_path = 'wizard-of-oz/ch22-hammer-heads.jpg' AND li.position >= 0;

INSERT INTO public.library_illustrations
  (book_id, chapter_idx, position, image_path, caption, alt_text, credit, width, height, is_published)
VALUES
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 22, 1, 'wizard-of-oz/ch22-rocky-hill.jpg', '', 'Dorothy, the Scarecrow, the Tin Woodman, and the Lion stand at the foot of a huge hill piled high with great gray rocks.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 22, 7, 'wizard-of-oz/ch22-shouting-hillmen.jpg', '', 'A crowd of short, flat-headed armless men with wrinkled necks shout angrily from the rocks as the frightened travelers look up at them.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 22, 9, 'wizard-of-oz/ch22-neck-strike.jpg', '', 'A Hammer-Head''s neck stretches far out and its flat head strikes the Scarecrow, sending him tumbling through the air in a shower of straw.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 22, 16, 'wizard-of-oz/ch22-golden-cap-summons.jpg', '', 'Wearing the Golden Cap, Dorothy stands with her friends by the rocky hill as Winged Monkeys come flying down from a dark, cloudy sky.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 22, 19, 'wizard-of-oz/ch22-carried-over-hill.jpg', '', 'Winged Monkeys carry Dorothy, Toto, and her friends through the sky while the tiny Hammer-Heads wave their fists on the ground below.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 22, 22, 'wizard-of-oz/ch22-quadling-country.jpg', '', 'The four friends walk along a red road through fields of ripe grain, passing red farmhouses while Quadlings in red clothes wave hello.', '', 1000, 558, true)
ON CONFLICT (book_id, chapter_idx, position) DO UPDATE SET
  image_path=EXCLUDED.image_path, caption=EXCLUDED.caption, alt_text=EXCLUDED.alt_text,
  credit=EXCLUDED.credit, width=EXCLUDED.width, height=EXCLUDED.height, is_published=EXCLUDED.is_published;

-- ---------- 第 23 章 ----------
UPDATE public.library_illustrations li
   SET is_published=false, position = li.position - 1000
  FROM public.library_books b
 WHERE b.id=li.book_id AND b.book_key='wizard-of-oz' AND li.chapter_idx=23
   AND li.image_path = 'wizard-of-oz/ch23-glinda.jpg' AND li.position >= 0;

INSERT INTO public.library_illustrations
  (book_id, chapter_idx, position, image_path, caption, alt_text, credit, width, height, is_published)
VALUES
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 23, 1, 'wizard-of-oz/ch23-ruby-castle.jpg', '', 'Dorothy, the Scarecrow, the Tin Woodman, the Lion, and little Toto walk along a red path toward a glittering ruby castle.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 23, 2, 'wizard-of-oz/ch23-soldier-girls.jpg', '', 'Three girl soldiers in red-and-gold uniforms hold tall spears at the castle gate while Dorothy and Toto look up at them.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 23, 3, 'wizard-of-oz/ch23-glinda-throne.jpg', '', 'The lovely red-haired Good Witch Glinda sits on a ruby throne in a flowing white gown as little Dorothy gazes up at her.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 23, 24, 'wizard-of-oz/ch23-silver-shoes.jpg', '', 'Kneeling Glinda points to the sparkling Silver Shoes on Dorothy''s feet as the girl looks down in wonder.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 23, 31, 'wizard-of-oz/ch23-goodbye-hug.jpg', '', 'Dorothy hugs the Scarecrow tightly with tears on her cheeks while the Tin Woodman weeps and the Lion watches sadly.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 23, 35, 'wizard-of-oz/ch23-whirling-home.jpg', '', 'Holding Toto in her arms, Dorothy spins through the bright sky in a swirl of wind as her friends wave far below.', '', 1000, 558, true)
ON CONFLICT (book_id, chapter_idx, position) DO UPDATE SET
  image_path=EXCLUDED.image_path, caption=EXCLUDED.caption, alt_text=EXCLUDED.alt_text,
  credit=EXCLUDED.credit, width=EXCLUDED.width, height=EXCLUDED.height, is_published=EXCLUDED.is_published;

SELECT 'after' AS phase, li.chapter_idx,
       count(*) AS rows,
       count(*) FILTER (WHERE li.is_published) AS published,
       count(*) FILTER (WHERE NOT li.is_published) AS retired
  FROM public.library_illustrations li JOIN public.library_books b ON b.id=li.book_id
 WHERE b.book_key='wizard-of-oz' AND li.chapter_idx BETWEEN 21 AND 23
 GROUP BY li.chapter_idx ORDER BY li.chapter_idx;

COMMIT;
