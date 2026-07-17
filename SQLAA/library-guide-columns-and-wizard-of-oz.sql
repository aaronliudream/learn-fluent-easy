-- ============================================================================
-- 文化笔记系统 · ① 导读(读前)。纯追加:library_books 加两列 guide_zh / guide_en。
-- 零新表、零 RLS 改动。内容照 Aaron 原文,仅删掉「—」分隔行(改靠空行/小标题分段);文字未改写。
-- 前端:详情页「简介」下方可折叠「导读」区(小标题加粗放大+段落留白+英文默认+显示中文+朗读高亮)。幂等。
-- ============================================================================
BEGIN;

ALTER TABLE public.library_books
  ADD COLUMN IF NOT EXISTS guide_zh text,
  ADD COLUMN IF NOT EXISTS guide_en text;

SELECT 'before' AS phase, book_key,
       (guide_zh IS NOT NULL) AS has_zh, (guide_en IS NOT NULL) AS has_en
  FROM public.library_books WHERE book_key='wizard-of-oz';

UPDATE public.library_books SET
  guide_zh = $gz$📖 书名的秘密

The Wonderful Wizard of Oz —— 「奥兹国那位了不起的巫师」。

但读到最后你会发现：这个书名是个玩笑。

那位「了不起的巫师」，屏风后面站着的不过是一个秃顶的小老头。他自己承认："我是个骗子。" 他不会魔法，那些吓人的形象全是道具。

而书里真正了不起的，是那三个一路以为自己缺了什么的伙伴——稻草人本来就聪明，铁皮人本来就有心，狮子本来就勇敢。

🔤 Oz 是人，还是地方？

两个都是。这是全书最容易混淆的一个词：

· 指人 —— 奥兹大王（the Great Oz）：住在翡翠城的那个巫师
· 指地方 —— 奥兹国（the Land of Oz）：整个魔法国度

读的时候留意上下文，这两个意思都会出现。

🎬 一个要澄清的事

你可能见过「红宝石鞋」的多萝西——那是 1939 年电影的设计。

原著里，多萝西穿的是银鞋（Silver Shoes）。

同样地，原著里的西方坏女巫也不是绿脸——她只有一只眼睛，皮肤是普通老太太的样子。

✍️ 关于书名的一个小故事

作者鲍姆说，"Oz" 这个名字来自他办公室文件柜的抽屉标签——一格写着 A–N，另一格写着 O–Z。

真假难辨，但这是流传最广的说法。

📅 关于这本书

《绿野仙踪》出版于 1900 年，是美国第一部真正的现代童话。

在此之前的童话大多来自欧洲（格林、安徒生），充满王子、公主和城堡。鲍姆想写一个属于美国孩子的故事——所以主角是堪萨斯农场的普通女孩，她的冒险从一场龙卷风开始。$gz$,
  guide_en = $ge$📖 What the Title Really Means

"The Wonderful Wizard of Oz" — the great and marvelous wizard who rules the land of Oz.

But by the end of the book, you'll find the title is a joke.

That "wonderful wizard" turns out to be a small bald old man hiding behind a screen. He admits it himself: "I'm a humbug." He has no magic at all — the terrifying shapes were only props.

The truly wonderful ones are the three friends who spent the whole journey believing something was missing in them. The Scarecrow was always clever. The Tin Woodman always had a heart. The Lion was always brave.

🔤 Is "Oz" a person or a place?

Both. This is the most easily confused word in the book:

· A person — the Great Oz: the wizard who lives in the Emerald City
· A place — the Land of Oz: the whole magical country

Watch the context as you read. Both meanings appear.

🎬 One thing worth clearing up

You may have seen a Dorothy in ruby slippers — that comes from the 1939 film.

In the original book, Dorothy wears Silver Shoes.

In the same way, the Wicked Witch of the West in the book is not green-skinned. She has only one eye, and ordinary old skin.

✍️ Where the name came from

Baum said the name "Oz" came from the label on a filing cabinet drawer in his office — one drawer read A–N, and the other read O–Z.

Nobody knows if it's true, but it's the story he told.

📅 About this book

"The Wonderful Wizard of Oz" was published in 1900, and it's often called the first true American fairy tale.

Fairy tales before it mostly came from Europe — Grimm, Andersen — full of princes, princesses and castles. Baum wanted to write a story for American children. So his hero is an ordinary farm girl from Kansas, and her adventure begins with a cyclone.$ge$,
  updated_at = now()
WHERE book_key='wizard-of-oz';

SELECT 'after' AS phase, book_key,
       length(guide_zh) AS zh_len, length(guide_en) AS en_len
  FROM public.library_books WHERE book_key='wizard-of-oz';

COMMIT;
