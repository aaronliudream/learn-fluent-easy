-- ============================================================================
-- 图书馆插图 · 绿野仙踪 第 8 章「The Deadly Poppy Field」(6 张独立高清水彩,Gemini)
-- ① 退休旧图:ch8-poppy-field.jpg(Denslow 章首图,position=0)→ is_published=false + position 挪负数隔离。
--    ⚠️ 精确路径相等,避免误伤新的 ch8-poppy-field-edge。
-- ② 导入新 6 张:position = 【章内段号 1-based】(见 DECISIONS.md)。本章 56 段。位置:1/10/13/34/44/48。
--    扎木筏渡河→稻草人撑篙卡住被丢下(¶9-13)→鹳鸟救回(¶34)→抵罂粟花海(¶44)→众人被毒花熏睡(¶48)。
--    全图 1000×558。图已降采样(宽≤1000px, JPEG q82)传入桶 library-illustrations/wizard-of-oz/。幂等;前后计数。
-- ============================================================================
BEGIN;

SELECT 'before' AS phase, count(*) AS ch8_rows,
       count(*) FILTER (WHERE li.is_published) AS published
  FROM public.library_illustrations li JOIN public.library_books b ON b.id=li.book_id
 WHERE b.book_key='wizard-of-oz' AND li.chapter_idx=8;

-- ① 退休旧 Denslow 章首图(精确路径 + 仅当前 position>=0 → 幂等)
UPDATE public.library_illustrations li
   SET is_published=false, position = li.position - 1000
  FROM public.library_books b
 WHERE b.id=li.book_id AND b.book_key='wizard-of-oz' AND li.chapter_idx=8
   AND li.image_path = 'wizard-of-oz/ch8-poppy-field.jpg' AND li.position >= 0;

-- ② 导入新 6 张(position=章内段号)
INSERT INTO public.library_illustrations
  (book_id, chapter_idx, position, image_path, caption, alt_text, credit, width, height, is_published)
VALUES
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 8, 1,  'wizard-of-oz/ch8-build-raft.jpg', '', 'The Tin Woodman chops logs while the Scarecrow lashes a raft together at the riverbank, as Dorothy, Toto and the drowsy Lion rest nearby.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 8, 10, 'wizard-of-oz/ch8-scarecrow-stuck.jpg', '', 'The Scarecrow clings to his pole stuck fast in the middle of the swift river as the raft drifts away and Dorothy reaches out in dismay.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 8, 13, 'wizard-of-oz/ch8-scarecrow-left-behind.jpg', '', 'The lonely Scarecrow is left behind clinging to his pole in the wide misty river while the tiny raft of friends floats far away.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 8, 34, 'wizard-of-oz/ch8-stork-rescue.jpg', '', 'A great Stork carries the Scarecrow by the collar across the river while Dorothy, the Tin Woodman and the Lion wave happily from the bank.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 8, 44, 'wizard-of-oz/ch8-poppy-field-edge.jpg', '', 'From behind, the four companions and Toto stand at the edge of a vast field of scarlet poppies with the yellow brick road running straight through it.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 8, 48, 'wizard-of-oz/ch8-poppy-sleep.jpg', '', 'Dorothy and Toto lie fast asleep among the scarlet poppies with the Lion overcome beside them, while the worried Scarecrow and Tin Woodman look on.', '', 1000, 558, true)
ON CONFLICT (book_id, chapter_idx, position) DO UPDATE SET
  image_path=EXCLUDED.image_path, caption=EXCLUDED.caption, alt_text=EXCLUDED.alt_text,
  credit=EXCLUDED.credit, width=EXCLUDED.width, height=EXCLUDED.height, is_published=EXCLUDED.is_published;

SELECT 'after' AS phase, count(*) AS ch8_rows,
       count(*) FILTER (WHERE li.is_published) AS published,
       count(*) FILTER (WHERE NOT li.is_published) AS retired
  FROM public.library_illustrations li JOIN public.library_books b ON b.id=li.book_id
 WHERE b.book_key='wizard-of-oz' AND li.chapter_idx=8;

COMMIT;
