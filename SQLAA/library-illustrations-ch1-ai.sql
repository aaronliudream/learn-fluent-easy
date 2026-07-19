-- ===========================================================================
-- 图书馆插图 · 绿野仙踪 第 1 章:换成 4 张 AI 章内插图(章首 + 文中穿插)。
--   · 渲染规则(前端已改):position=P 的图插在 para_idx==P 段之前;position=0=章首;
--     position 超出末段落章末。本章挂点:0(草原)/5(屋里叔婶)/11(龙卷风逼近)/17(房子飞上天)。
--   · Denslow 原章首图(position=0)退休:is_published=false + position=-1 隔离
--     —— 唯一键 UNIQUE(book_id,chapter_idx,position) 挡两行同 position=0,故先挪走再插。
--     数据一行不删;想切回经典版:position 改回 0、is_published=true、删掉 4 张 AI 即可。
--   · 只动 ch1;其余 23 章 Denslow 不碰。credit 留空(自生成)。BEGIN/COMMIT + 前后计数。幂等。
-- ===========================================================================

BEGIN;

SELECT 'before' AS phase,
       count(*) FILTER (WHERE position = 0)  AS ch1_pos0,
       count(*) FILTER (WHERE is_published)  AS ch1_published,
       count(*)                              AS ch1_total
FROM public.library_illustrations
WHERE book_id = (SELECT id FROM public.library_books WHERE book_key='wizard-of-oz')
  AND chapter_idx = 1;

-- 1) Denslow 原章首图退休(按 image_path 精确定位,避免误伤;幂等)。
UPDATE public.library_illustrations
SET position = -1, is_published = false
WHERE book_id = (SELECT id FROM public.library_books WHERE book_key='wizard-of-oz')
  AND chapter_idx = 1
  AND image_path = 'wizard-of-oz/ch1-dorothy-toto.jpg';

-- 2) 4 张 AI 图(position 0/5/11/17;832x467 写死宽高防 CLS;credit=NULL)。
INSERT INTO public.library_illustrations
  (book_id, chapter_idx, position, image_path, caption, alt_text, credit, width, height, is_published)
VALUES
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 1, 0,
   'wizard-of-oz/ch1-ai-prairie.jpg', NULL,
   '多萝西坐在灰色的堪萨斯草原上,小黑狗托托朝她跑来,远处有风车和小木屋', NULL, 832, 467, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 1, 5,
   'wizard-of-oz/ch1-ai-cabin.jpg', NULL,
   '屋里,艾姆婶婶在盆边洗碗,亨利叔叔坐在椅子上,多萝西抱着小黑狗托托蹲在地上', NULL, 832, 467, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 1, 11,
   'wizard-of-oz/ch1-ai-cyclone.jpg', NULL,
   '远处龙卷风逼近,亨利叔叔跑向牲口棚,艾姆婶婶在打开的地窖口,多萝西抱着托托站在门口', NULL, 832, 467, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 1, 17,
   'wizard-of-oz/ch1-ai-flying-house.jpg', NULL,
   '房子被卷进龙卷风飞上高空,多萝西抱着托托坐在屋里的床上', NULL, 832, 467, true)
ON CONFLICT (book_id, chapter_idx, position) DO UPDATE
  SET image_path = EXCLUDED.image_path,
      caption    = EXCLUDED.caption,
      alt_text   = EXCLUDED.alt_text,
      credit     = EXCLUDED.credit,
      width      = EXCLUDED.width,
      height     = EXCLUDED.height,
      is_published = EXCLUDED.is_published;

SELECT 'after' AS phase,
       count(*) FILTER (WHERE position = -1 AND NOT is_published) AS denslow_retired,
       count(*) FILTER (WHERE is_published)                      AS ch1_published,
       count(*)                                                  AS ch1_total,
       string_agg(position::text, ',' ORDER BY position) FILTER (WHERE is_published) AS published_positions
FROM public.library_illustrations
WHERE book_id = (SELECT id FROM public.library_books WHERE book_key='wizard-of-oz')
  AND chapter_idx = 1;

COMMIT;
