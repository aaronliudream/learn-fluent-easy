-- ============================================================================
-- 图书馆样书 seed:Aesop's Fables — Easy Readers (aesop-easy-readers)
-- 生成自 scripts/library/books/aesop-easy-readers.json —— node scripts/library/build-seed.mjs aesop-easy-readers
-- ⚠️ 内容(英文改写 + 中文)须先过审(Aaron/网页版 Claude)再落库(content-review-gate + D9)。
-- 幂等:upsert 书 + 删该书旧句重灌。BEGIN/COMMIT + 前后计数。
-- 章号真实(D12);共 4 章 / 44 句。
-- ============================================================================

BEGIN;

-- 0) 章标题列(方案 A:jsonb,幂等加列)。[{idx,title_en,title_zh}]
ALTER TABLE public.library_books
  ADD COLUMN IF NOT EXISTS chapters jsonb NOT NULL DEFAULT '[]'::jsonb;

SELECT 'before' AS phase,
       (SELECT count(*) FROM public.library_books WHERE book_key = 'aesop-easy-readers') AS book_exists,
       (SELECT count(*) FROM public.library_sentences s
          JOIN public.library_books b ON b.id = s.book_id
         WHERE b.book_key = 'aesop-easy-readers') AS sentence_rows;

-- 1) 书目(upsert)
INSERT INTO public.library_books
  (book_key, title, zh_title, author, age_band, age_range, cover,
   intro_en, intro_zh, sentence_count, copyright_note, chapters, is_published)
VALUES
  ('aesop-easy-readers', 'Aesop''s Fables — Easy Readers', '伊索寓言 · 分级阅读', 'Aesop (retold for learners)',
   '儿童', '6-9岁', '{"c1":"#2f7d6e","c2":"#14532d"}'::jsonb,
   'Aesop''s Fables are short, wise stories from long ago. In each tale, animals talk and act like people, and the story ends with a simple lesson. These easy versions use short sentences, so new readers can enjoy them and read aloud with confidence.', '《伊索寓言》是很久以前流传下来的短小而充满智慧的故事。故事里的动物像人一样说话、行动,每个故事的结尾都有一个简单的道理。本册用简短的句子改写,方便初学者阅读,也适合大声朗读。', 44, 'Public-domain fables of Aesop, retold in simple original English for young learners. 伊索寓言属公有领域;本册为面向初学者的简易改写(措辞原创),非任何现行教材节选。',
   '[{"idx":1,"title_en":"The Hare and the Tortoise","title_zh":"龟兔赛跑"},{"idx":2,"title_en":"The Lion and the Mouse","title_zh":"狮子和老鼠"},{"idx":3,"title_en":"The Fox and the Grapes","title_zh":"狐狸和葡萄"},{"idx":4,"title_en":"The Ant and the Grasshopper","title_zh":"蚂蚁和蚱蜢"}]'::jsonb, false)
ON CONFLICT (book_key) DO UPDATE SET
  title          = EXCLUDED.title,
  zh_title       = EXCLUDED.zh_title,
  author         = EXCLUDED.author,
  age_band       = EXCLUDED.age_band,
  age_range      = EXCLUDED.age_range,
  cover          = EXCLUDED.cover,
  intro_en       = EXCLUDED.intro_en,
  intro_zh       = EXCLUDED.intro_zh,
  sentence_count = EXCLUDED.sentence_count,
  copyright_note = EXCLUDED.copyright_note,
  chapters       = EXCLUDED.chapters;
  -- 注:不覆盖 is_published —— 审后手动置 true,重灌 seed 不会把它打回 false。

-- 2) 句子(删旧重灌,幂等)。audio_url 留 NULL:默认前端实时合成,预生成脚本审后另回填。
DELETE FROM public.library_sentences
 WHERE book_id = (SELECT id FROM public.library_books WHERE book_key = 'aesop-easy-readers');

INSERT INTO public.library_sentences (book_id, chapter_idx, para_idx, seq, text_en, text_cn)
SELECT b.id, v.chapter_idx, v.para_idx, v.seq, v.text_en, v.text_cn
FROM public.library_books b
CROSS JOIN (VALUES
    (1, 1, 1, 'A hare laughed at a tortoise.', '一只兔子嘲笑一只乌龟。'),
    (1, 1, 2, '"You are so slow!" he said.', '“你太慢了!”他说。'),
    (1, 1, 3, '"Let''s have a race," said the tortoise.', '“我们来赛跑吧,”乌龟说。'),
    (1, 1, 4, 'The hare thought this was very funny.', '兔子觉得这非常好笑。'),
    (1, 2, 5, 'The race began, and the hare ran fast.', '比赛开始了,兔子跑得飞快。'),
    (1, 2, 6, 'Soon he was far ahead.', '很快他就遥遥领先。'),
    (1, 2, 7, '"I have time to rest," he said, and fell asleep.', '“我有时间休息,”他说着就睡着了。'),
    (1, 3, 8, 'The tortoise walked on and on.', '乌龟一直不停地走。'),
    (1, 3, 9, 'He passed the sleeping hare.', '他经过了正在睡觉的兔子。'),
    (1, 3, 10, 'When the hare woke up, the tortoise had won.', '兔子醒来时,乌龟已经赢了。'),
    (1, 3, 11, 'Slow and steady wins the race.', '稳扎稳打者胜。'),
    (2, 4, 12, 'A lion was asleep in the sun.', '一只狮子在阳光下睡觉。'),
    (2, 4, 13, 'A little mouse ran over his nose.', '一只小老鼠从他的鼻子上跑过。'),
    (2, 4, 14, 'The lion woke up and caught the mouse.', '狮子醒了,抓住了老鼠。'),
    (2, 4, 15, '"Please let me go," cried the mouse.', '“请放了我吧,”老鼠喊道。'),
    (2, 4, 16, '"One day I may help you."', '“也许有一天我能帮到你。”'),
    (2, 5, 17, 'The lion laughed, but he let the mouse go.', '狮子笑了,但还是放走了老鼠。'),
    (2, 5, 18, 'Later, the lion was caught in a net.', '后来,狮子被困在了网里。'),
    (2, 5, 19, 'He roared, but he could not get free.', '他吼叫着,却挣脱不了。'),
    (2, 6, 20, 'The little mouse heard him.', '小老鼠听见了他。'),
    (2, 6, 21, 'She ran over and bit the ropes.', '她跑过来,咬断了绳子。'),
    (2, 6, 22, 'Soon the lion was free.', '很快狮子就自由了。'),
    (2, 6, 23, 'Even a small friend can be a great help.', '再小的朋友也能帮上大忙。'),
    (3, 7, 24, 'A hungry fox saw some grapes.', '一只饥饿的狐狸看见了一些葡萄。'),
    (3, 7, 25, 'They hung high on a vine.', '它们高高地挂在藤上。'),
    (3, 7, 26, '"Those grapes look sweet," he said.', '“那些葡萄看起来很甜,”他说。'),
    (3, 8, 27, 'The fox jumped up, but he missed.', '狐狸跳起来,却没够着。'),
    (3, 8, 28, 'He tried again and again.', '他一次又一次地尝试。'),
    (3, 8, 29, 'Each time, he could not reach them.', '每一次都够不到。'),
    (3, 9, 30, 'At last, the fox walked away.', '最后,狐狸走开了。'),
    (3, 9, 31, '"I don''t want them," he said.', '“我才不要它们呢,”他说。'),
    (3, 9, 32, '"They are sour anyway."', '“反正它们是酸的。”'),
    (3, 9, 33, 'It is easy to hate what you cannot have.', '得不到的东西,就容易去讨厌它。'),
    (4, 10, 34, 'In summer, an ant worked hard.', '夏天,一只蚂蚁辛勤地劳作。'),
    (4, 10, 35, 'She saved food for the winter.', '她为冬天储备食物。'),
    (4, 10, 36, 'A grasshopper sang all day.', '一只蚱蜢整天唱歌。'),
    (4, 10, 37, '"Why work so much?" he asked.', '“干嘛干这么多活?”他问。'),
    (4, 11, 38, '"Come and play with me!"', '“过来和我一起玩吧!”'),
    (4, 11, 39, '"There is plenty of food now."', '“现在食物多得很。”'),
    (4, 11, 40, 'But the ant did not stop.', '但蚂蚁没有停下。'),
    (4, 12, 41, 'Then winter came, and it was cold.', '后来冬天来了,天很冷。'),
    (4, 12, 42, 'The grasshopper had no food.', '蚱蜢没有食物。'),
    (4, 12, 43, 'The ant was warm and full.', '蚂蚁却温暖又饱足。'),
    (4, 12, 44, 'It is wise to prepare for hard days.', '未雨绸缪才是明智之举。')
) AS v(chapter_idx, para_idx, seq, text_en, text_cn)
WHERE b.book_key = 'aesop-easy-readers';

SELECT 'after' AS phase,
       (SELECT sentence_count FROM public.library_books WHERE book_key = 'aesop-easy-readers') AS book_sentence_count,
       (SELECT count(*) FROM public.library_sentences s
          JOIN public.library_books b ON b.id = s.book_id
         WHERE b.book_key = 'aesop-easy-readers') AS sentence_rows;

COMMIT;

-- 审核通过后,单独跑这一行让样书对用户可见(软上线):
-- UPDATE public.library_books SET is_published = true WHERE book_key = 'aesop-easy-readers';
