-- ============================================================================
-- 图书馆插图 seed:wizard-of-oz · 每章章首图(position=0)· 共 23 章(ch10 无对应图,留空)
-- 图已降采样(≤1000px, JPEG q80)传入桶 library-illustrations/wizard-of-oz/。
-- 公有领域 W. W. Denslow (1900) via Wikimedia Commons。幂等 upsert;前后计数。
-- ⚠️ 先确认图已传桶再跑本 SQL。
-- ============================================================================

BEGIN;

SELECT 'before' AS phase, count(*) AS rows
  FROM public.library_illustrations li
  JOIN public.library_books b ON b.id = li.book_id
 WHERE b.book_key = 'wizard-of-oz';

INSERT INTO public.library_illustrations
  (book_id, chapter_idx, position, image_path, caption, alt_text, credit, width, height, is_published)
VALUES
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 1, 0, 'wizard-of-oz/ch1-dorothy-toto.jpg', 'She caught Toto by the ear.', 'She caught Toto by the ear.', 'W. W. Denslow (1900) · Wikimedia Commons', 465, 624, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 2, 0, 'wizard-of-oz/ch2-good-witch-north.jpg', '"I am the Witch of the North."', '"I am the Witch of the North."', 'W. W. Denslow (1900) · Wikimedia Commons', 467, 618, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 3, 0, 'wizard-of-oz/ch3-scarecrow.jpg', 'Dorothy gazed thoughtfully at the Scarecrow.', 'Dorothy gazed thoughtfully at the Scarecrow.', 'W. W. Denslow (1900) · Wikimedia Commons', 1000, 1335, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 4, 0, 'wizard-of-oz/ch4-scarecrow-made.jpg', '"I was only made yesterday," said the Scarecrow.', '"I was only made yesterday," said the Scarecrow.', 'W. W. Denslow (1900) · Wikimedia Commons', 1000, 1336, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 5, 0, 'wizard-of-oz/ch5-tin-woodman.jpg', '"This is a great comfort," said the Tin Woodman.', '"This is a great comfort," said the Tin Woodman.', 'W. W. Denslow (1900) · Wikimedia Commons', 1000, 1325, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 6, 0, 'wizard-of-oz/ch6-cowardly-lion.jpg', '"You ought to be ashamed of yourself!"', '"You ought to be ashamed of yourself!"', 'W. W. Denslow (1900) · Wikimedia Commons', 1000, 1323, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 7, 0, 'wizard-of-oz/ch7-kalidahs.jpg', 'The tree fell with a crash into the gulf (the Kalidahs).', 'The tree fell with a crash into the gulf (the Kalidahs).', 'W. W. Denslow (1900) · Wikimedia Commons', 1000, 1316, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 8, 0, 'wizard-of-oz/ch8-poppy-field.jpg', 'The deadly poppy field.', 'The deadly poppy field.', 'W. W. Denslow (1900) · Wikimedia Commons', 1000, 887, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 9, 0, 'wizard-of-oz/ch9-field-mice-queen.jpg', 'Her Majesty, the Queen of the Field Mice.', 'Her Majesty, the Queen of the Field Mice.', 'W. W. Denslow (1900) · Wikimedia Commons', 1000, 1349, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 11, 0, 'wizard-of-oz/ch11-oz-the-head.jpg', 'The Eyes looked at her thoughtfully (Oz the Great Head).', 'The Eyes looked at her thoughtfully (Oz the Great Head).', 'W. W. Denslow (1900) · Wikimedia Commons', 1000, 1309, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 12, 0, 'wizard-of-oz/ch12-witch-monkey.jpg', 'The Wicked Witch of the West commands a Winged Monkey.', 'The Wicked Witch of the West commands a Winged Monkey.', 'W. W. Denslow (1900) · Wikimedia Commons', 1000, 552, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 13, 0, 'wizard-of-oz/ch13-tinsmiths.jpg', 'The tinsmiths worked for three days and four nights.', 'The tinsmiths worked for three days and four nights.', 'W. W. Denslow (1900) · Wikimedia Commons', 1000, 1322, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 14, 0, 'wizard-of-oz/ch14-winged-monkeys.jpg', 'The Monkeys caught Dorothy and flew away with her.', 'The Monkeys caught Dorothy and flew away with her.', 'W. W. Denslow (1900) · Wikimedia Commons', 1000, 1345, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 15, 0, 'wizard-of-oz/ch15-humbug.jpg', '"Exactly so! I am a humbug."', '"Exactly so! I am a humbug."', 'W. W. Denslow (1900) · Wikimedia Commons', 1000, 1376, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 16, 0, 'wizard-of-oz/ch16-brains.jpg', '"I feel wise, indeed," said the Scarecrow.', '"I feel wise, indeed," said the Scarecrow.', 'W. W. Denslow (1900) · Wikimedia Commons', 1000, 1335, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 17, 0, 'wizard-of-oz/ch17-balloon.jpg', 'The balloon rose into the air; the Wizard departs.', 'The balloon rose into the air; the Wizard departs.', 'W. W. Denslow (1900) · Wikimedia Commons', 1000, 1137, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 18, 0, 'wizard-of-oz/ch18-scarecrow-throne.jpg', 'The Scarecrow sat on the big throne.', 'The Scarecrow sat on the big throne.', 'W. W. Denslow (1900) · Wikimedia Commons', 1000, 1459, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 19, 0, 'wizard-of-oz/ch19-fighting-trees.jpg', 'The branches bent down and twined around him.', 'The branches bent down and twined around him.', 'W. W. Denslow (1900) · Wikimedia Commons', 524, 706, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 20, 0, 'wizard-of-oz/ch20-china-country.jpg', 'These people were all made of china.', 'These people were all made of china.', 'W. W. Denslow (1900) · Wikimedia Commons', 1000, 1280, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 21, 0, 'wizard-of-oz/ch21-lion-king.jpg', 'The Lion becomes the King of Beasts.', 'The Lion becomes the King of Beasts.', 'W. W. Denslow (1900) · Wikimedia Commons', 1000, 941, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 22, 0, 'wizard-of-oz/ch22-hammer-heads.jpg', 'The Head shot forward and struck the Scarecrow (Hammer-Heads).', 'The Head shot forward and struck the Scarecrow (Hammer-Heads).', 'W. W. Denslow (1900) · Wikimedia Commons', 1000, 1334, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 23, 0, 'wizard-of-oz/ch23-glinda.jpg', 'Glinda the Good Witch grants Dorothy''s wish.', 'Glinda the Good Witch grants Dorothy''s wish.', 'W. W. Denslow (1900) · Wikimedia Commons', 1000, 1397, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 24, 0, 'wizard-of-oz/ch24-home-again.jpg', 'Dorothy home again with Aunt Em.', 'Dorothy home again with Aunt Em.', 'W. W. Denslow (1900) · Wikimedia Commons', 1000, 833, true)
ON CONFLICT (book_id, chapter_idx, position) DO UPDATE SET
  image_path = EXCLUDED.image_path, caption = EXCLUDED.caption, alt_text = EXCLUDED.alt_text,
  credit = EXCLUDED.credit, width = EXCLUDED.width, height = EXCLUDED.height, is_published = EXCLUDED.is_published;

SELECT 'after' AS phase, count(*) AS rows
  FROM public.library_illustrations li
  JOIN public.library_books b ON b.id = li.book_id
 WHERE b.book_key = 'wizard-of-oz';

COMMIT;
