-- ============================================================================
-- 图书馆插图 · 绿野仙踪 第 24 章「Home Again」(仅 3 段)· 收官章,精挑 3 张发布。
-- Aaron 定:只发布 04/05/06 = 艾姆婶婶浇白菜停住(章首)→ 搂住多萝西(¶2)→ 一家人团聚(结尾)。
--   06 必须在最后一段之后 → position 4(>段数3,尾部渲染),全书最后一笔不被冲淡。
-- 其余 3 张(醒来/看见房子/托托狂奔)入库但 is_published=false(数据留着,随时可翻开),放尾部高位不碰正文。
-- ① 退休旧 Denslow 章首图 ch24-home-again.jpg(精确路径·position 挪负数·幂等)。全图已传桶。ON CONFLICT 幂等。
-- ============================================================================
BEGIN;

SELECT 'before' AS phase, count(*) AS ch24_rows,
       count(*) FILTER (WHERE li.is_published) AS published
  FROM public.library_illustrations li JOIN public.library_books b ON b.id=li.book_id
 WHERE b.book_key='wizard-of-oz' AND li.chapter_idx=24;

-- ① 退休旧 Denslow 章首图
UPDATE public.library_illustrations li
   SET is_published=false, position = li.position - 1000
  FROM public.library_books b
 WHERE b.id=li.book_id AND b.book_key='wizard-of-oz' AND li.chapter_idx=24
   AND li.image_path = 'wizard-of-oz/ch24-home-again.jpg' AND li.position >= 0;

-- ② 发布 3 张(章首 1 / 拥抱 2 / 团聚尾部 4)+ 保留 3 张不发布(5/6/7)
INSERT INTO public.library_illustrations
  (book_id, chapter_idx, position, image_path, caption, alt_text, credit, width, height, is_published)
VALUES
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 24, 1, 'wizard-of-oz/ch24-aunt-em-cabbages.jpg', '', 'Aunt Em stands in the doorway with her watering can beside the cabbage patch, looking up in surprise across the fields.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 24, 2, 'wizard-of-oz/ch24-warm-embrace.jpg', '', 'Aunt Em sweeps Dorothy up into her arms and kisses her cheek in a warm hug on the windy prairie.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 24, 4, 'wizard-of-oz/ch24-family-together.jpg', '', 'Dorothy stands with Aunt Em, Uncle Henry, and Toto in front of their farmhouse, all together and happy at last.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 24, 5, 'wizard-of-oz/ch24-prairie-arrival.jpg', '', 'Dorothy sits in the wide gray prairie grass, holding little Toto in her lap and gazing up at the cloudy sky.', '', 1000, 558, false),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 24, 6, 'wizard-of-oz/ch24-spotting-home.jpg', '', 'Dorothy shades her eyes with one hand as she spots the little Kansas farmhouse far across the golden prairie.', '', 1000, 558, false),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 24, 7, 'wizard-of-oz/ch24-running-home.jpg', '', 'Laughing with joy, Dorothy runs barefoot through the prairie while Toto bounds along beside her toward the farmhouse.', '', 1000, 558, false)
ON CONFLICT (book_id, chapter_idx, position) DO UPDATE SET
  image_path=EXCLUDED.image_path, caption=EXCLUDED.caption, alt_text=EXCLUDED.alt_text,
  credit=EXCLUDED.credit, width=EXCLUDED.width, height=EXCLUDED.height, is_published=EXCLUDED.is_published;

SELECT 'after' AS phase, count(*) AS ch24_rows,
       count(*) FILTER (WHERE li.is_published) AS published,
       count(*) FILTER (WHERE NOT li.is_published) AS retired_or_hidden
  FROM public.library_illustrations li JOIN public.library_books b ON b.id=li.book_id
 WHERE b.book_key='wizard-of-oz' AND li.chapter_idx=24;

COMMIT;
