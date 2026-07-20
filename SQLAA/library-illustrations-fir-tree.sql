-- ============================================================================
-- 图书馆插图 · 枞树(封面 + 第 1-4 章·CC 压缩+已传桶·待 Aaron 跑)
-- 幂等:先删本书旧插图行再插;封面写进 library_books.cover.image。position=章内段号(1-based)。
-- ============================================================================
BEGIN;
UPDATE public.library_books
   SET cover = jsonb_build_object('c1','#166534','c2','#022c22','image','fir-tree/fir-tree-cover.jpg')
 WHERE book_key='fir-tree';

DELETE FROM public.library_illustrations
 WHERE book_id=(SELECT id FROM public.library_books WHERE book_key='fir-tree');

INSERT INTO public.library_illustrations
  (book_id, chapter_idx, position, image_path, caption, alt_text, credit, width, height, is_published)
VALUES
  ((SELECT id FROM public.library_books WHERE book_key='fir-tree'), 1, 2, 'fir-tree/ch1-1-summer-children.jpg', '', '小枞树在夏日林间空地上,附近孩子在草地上用麦秆串野草莓', 'AI illustration (watercolor)', 1000, 1000, true),
  ((SELECT id FROM public.library_books WHERE book_key='fir-tree'), 1, 6, 'fir-tree/ch1-2-winter-hare.jpg', '', '冬天雪地里,一只野兔从小枞树头顶跳过去', 'AI illustration (watercolor)', 1000, 1000, true),
  ((SELECT id FROM public.library_books WHERE book_key='fir-tree'), 1, 7, 'fir-tree/ch1-3-woodcutters.jpg', '', '秋天伐木人砍倒大树装上马车,小枞树在一旁发抖地看着', 'AI illustration (watercolor)', 1000, 1000, true),
  ((SELECT id FROM public.library_books WHERE book_key='fir-tree'), 1, 10, 'fir-tree/ch1-4-stork-ships.jpg', '', '春天清晨,一只鹳鸟对着小枞树说话,远处海上帆船的桅杆', 'AI illustration (watercolor)', 1000, 1000, true),
  ((SELECT id FROM public.library_books WHERE book_key='fir-tree'), 2, 2, 'fir-tree/ch2-1-sparrows-window.jpg', '', '麻雀停在枞树枝上说话,背景小镇窗内透出点着蜡烛的圣诞树', 'AI illustration (watercolor)', 1000, 1000, true),
  ((SELECT id FROM public.library_books WHERE book_key='fir-tree'), 2, 8, 'fir-tree/ch2-2-into-parlour.jpg', '', '两个穿号衣的仆人把枞树抬进豪华客厅,白瓷炉和中国花瓶', 'AI illustration (watercolor)', 1000, 1000, true),
  ((SELECT id FROM public.library_books WHERE book_key='fir-tree'), 2, 9, 'fir-tree/ch2-3-decorating.jpg', '', '小姐们给客厅里的枞树挂镀金苹果、糖果网兜和蜡烛,顶上安金星', 'AI illustration (watercolor)', 1000, 1000, true),
  ((SELECT id FROM public.library_books WHERE book_key='fir-tree'), 3, 4, 'fir-tree/ch3-1-christmas-eve.jpg', '', '圣诞夜,点满蜡烛的枞树旁孩子们又跳又闹地抢礼物', 'AI illustration (watercolor)', 1000, 1000, true),
  ((SELECT id FROM public.library_books WHERE book_key='fir-tree'), 4, 5, 'fir-tree/ch4-1-loft-mice.jpg', '', '昏暗阁楼角落里被遗忘的枞树,两只小老鼠在枝间嗅探', 'AI illustration (watercolor)', 1000, 1000, true);

SELECT 'after' AS phase, chapter_idx, count(*)
  FROM public.library_illustrations
 WHERE book_id=(SELECT id FROM public.library_books WHERE book_key='fir-tree')
 GROUP BY chapter_idx ORDER BY chapter_idx;
COMMIT;
