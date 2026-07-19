-- ============================================================================
-- 图书馆插图 · 绿野仙踪 第 7 章「The Journey to the Great Oz」(6 张独立高清水彩,Gemini)
-- ① 退休旧图:ch7-kalidahs.jpg(Denslow 章首图,position=0)→ is_published=false + position 挪负数隔离(数据不删)
--    ⚠️ 用精确路径相等(非 LIKE),避免误伤新的 ch7-kalidahs-charge / ch7-kalidahs-fall。
-- ② 导入新 6 张:position = 【章内段号 1-based】(见 DECISIONS.md)。本章 41 段。位置:6/18/25/28/34/37。
--    两道深沟:第一道狮子背人跳过(¶6 发现/¶18 跳);第二道砍树搭桥(¶25 砍)引来卡力达(¶28 冲来)→ 砍断桥端卡力达坠沟(¶34)→ 抵大河(¶37)。
--    全图 1000×558。图已降采样(宽≤1000px, JPEG q82)传入桶 library-illustrations/wizard-of-oz/。幂等;前后计数。
-- ============================================================================
BEGIN;

SELECT 'before' AS phase, count(*) AS ch7_rows,
       count(*) FILTER (WHERE li.is_published) AS published
  FROM public.library_illustrations li JOIN public.library_books b ON b.id=li.book_id
 WHERE b.book_key='wizard-of-oz' AND li.chapter_idx=7;

-- ① 退休旧 Denslow 章首图(精确路径 + 仅当前 position>=0 → 幂等)
UPDATE public.library_illustrations li
   SET is_published=false, position = li.position - 1000
  FROM public.library_books b
 WHERE b.id=li.book_id AND b.book_key='wizard-of-oz' AND li.chapter_idx=7
   AND li.image_path = 'wizard-of-oz/ch7-kalidahs.jpg' AND li.position >= 0;

-- ② 导入新 6 张(position=章内段号)
INSERT INTO public.library_illustrations
  (book_id, chapter_idx, position, image_path, caption, alt_text, credit, width, height, is_published)
VALUES
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 7, 6,  'wizard-of-oz/ch7-first-gulf.jpg', '', 'Dorothy, the Tin Woodman, the Scarecrow, the Lion and Toto stand at the edge of a wide, deep gulf that cuts across the yellow brick road.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 7, 18, 'wizard-of-oz/ch7-lion-leaps.jpg', '', 'The Cowardly Lion leaps across the gulf through the air with Dorothy on his back clutching Toto and his mane.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 7, 25, 'wizard-of-oz/ch7-chop-bridge.jpg', '', 'The Tin Woodman swings his axe to chop down a tall tree so it will fall across a second gulf as a bridge, while the others watch.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 7, 28, 'wizard-of-oz/ch7-kalidahs-charge.jpg', '', 'Two Kalidahs — monstrous beasts with bodies like bears and heads like tigers — come running and snarling toward the frightened travelers.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 7, 34, 'wizard-of-oz/ch7-kalidahs-fall.jpg', '', 'The Tin Woodman chops away the end of the tree-bridge and the two Kalidahs tumble down into the deep gulf, as the travelers watch safely from the far edge.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 7, 37, 'wizard-of-oz/ch7-at-river.jpg', '', 'The four companions and Toto reach the bank of a broad river at the forest edge, with sunny open country and the yellow road on the far side.', '', 1000, 558, true)
ON CONFLICT (book_id, chapter_idx, position) DO UPDATE SET
  image_path=EXCLUDED.image_path, caption=EXCLUDED.caption, alt_text=EXCLUDED.alt_text,
  credit=EXCLUDED.credit, width=EXCLUDED.width, height=EXCLUDED.height, is_published=EXCLUDED.is_published;

SELECT 'after' AS phase, count(*) AS ch7_rows,
       count(*) FILTER (WHERE li.is_published) AS published,
       count(*) FILTER (WHERE NOT li.is_published) AS retired
  FROM public.library_illustrations li JOIN public.library_books b ON b.id=li.book_id
 WHERE b.book_key='wizard-of-oz' AND li.chapter_idx=7;

COMMIT;
