-- ============================================================================
-- 图书馆:章标题回填(方案 A:library_books.chapters jsonb)。
-- 只加列 + UPDATE 两本书的 chapters;**不碰 library_sentences**(避免churn句子/清audio_url)。
-- 幂等。BEGIN/COMMIT + 前后计数。绿野仙踪 24 章 + 伊索 4 章。
-- ============================================================================

BEGIN;

ALTER TABLE public.library_books
  ADD COLUMN IF NOT EXISTS chapters jsonb NOT NULL DEFAULT '[]'::jsonb;

SELECT 'before' AS phase, book_key, jsonb_array_length(chapters) AS ch_count
FROM public.library_books WHERE book_key IN ('wizard-of-oz','aesop-easy-readers') ORDER BY book_key;

UPDATE public.library_books SET chapters = '[{"idx":1,"title_en":"The Cyclone","title_zh":"龙卷风"},{"idx":2,"title_en":"The Council with the Munchkins","title_zh":"与芒奇金人的商议"},{"idx":3,"title_en":"How Dorothy Saved the Scarecrow","title_zh":"多萝西如何拯救稻草人"},{"idx":4,"title_en":"The Road Through the Forest","title_zh":"穿过森林的路"},{"idx":5,"title_en":"The Rescue of the Tin Woodman","title_zh":"营救铁皮人"},{"idx":6,"title_en":"The Cowardly Lion","title_zh":"胆小的狮子"},{"idx":7,"title_en":"The Journey to the Great Oz","title_zh":"前往奥兹大王之旅"},{"idx":8,"title_en":"The Deadly Poppy Field","title_zh":"致命罂粟花田"},{"idx":9,"title_en":"The Queen of the Field Mice","title_zh":"田鼠女王"},{"idx":10,"title_en":"The Guardian of the Gate","title_zh":"城门守卫"},{"idx":11,"title_en":"The Wonderful City of Oz","title_zh":"奇妙的翡翠城"},{"idx":12,"title_en":"The Search for the Wicked Witch","title_zh":"寻找坏女巫"},{"idx":13,"title_en":"The Rescue","title_zh":"营救"},{"idx":14,"title_en":"The Winged Monkeys","title_zh":"飞猴"},{"idx":15,"title_en":"The Discovery of Oz, the Terrible","title_zh":"发现可怕的奥兹大王"},{"idx":16,"title_en":"The Magic Art of the Great Humbug","title_zh":"伟大骗子的魔法"},{"idx":17,"title_en":"How the Balloon Was Launched","title_zh":"气球升空"},{"idx":18,"title_en":"Away to the South","title_zh":"南行"},{"idx":19,"title_en":"Attacked by the Fighting Trees","title_zh":"战树的袭击"},{"idx":20,"title_en":"The Dainty China Country","title_zh":"娇小的瓷器国"},{"idx":21,"title_en":"The Lion Becomes the King of Beasts","title_zh":"狮子成为百兽之王"},{"idx":22,"title_en":"The Country of the Quadlings","title_zh":"奎德林人之国"},{"idx":23,"title_en":"Glinda The Good Witch Grants Dorothy’s Wish","title_zh":"好女巫格林达实现了多萝西的愿望"},{"idx":24,"title_en":"Home Again","title_zh":"重返家园"}]'::jsonb WHERE book_key = 'wizard-of-oz';
UPDATE public.library_books SET chapters = '[{"idx":1,"title_en":"The Hare and the Tortoise","title_zh":"龟兔赛跑"},{"idx":2,"title_en":"The Lion and the Mouse","title_zh":"狮子和老鼠"},{"idx":3,"title_en":"The Fox and the Grapes","title_zh":"狐狸和葡萄"},{"idx":4,"title_en":"The Ant and the Grasshopper","title_zh":"蚂蚁和蚱蜢"}]'::jsonb WHERE book_key = 'aesop-easy-readers';

SELECT 'after' AS phase, book_key, jsonb_array_length(chapters) AS ch_count,
       chapters->0->>'title_zh' AS ch1_zh
FROM public.library_books WHERE book_key IN ('wizard-of-oz','aesop-easy-readers') ORDER BY book_key;

COMMIT;
