-- ===========================================================================
-- 图书馆「文化笔记」② 读中词卡 · 绿野仙踪 第 2 章内容(4 词 7 行)。
--   Aaron 终审定版 2026-07-14:silver / munchkin / witch / sorceress 全部保留可落库。
--   已按雷区去绝对化(第一个/立刻/一定 → 较早/后来/传统上);silver 只挂 silver(shoes 基础词不挂);
--   munchkin/witch/sorceress 单复数各 1 行同内容(tap 键精确匹配)。
--   ⚠️ 表实际 UNIQUE 是 (book_id, term)(非 term+chapter_idx),故 ON CONFLICT (book_id, term),与 ch1 一致。
--   前置:表已建(library-culture-notes-ddl.sql)。ON CONFLICT DO UPDATE 幂等,可重复跑。
--   由 scripts/library/_gen-ch2-notes-sql.mjs 从审定 md 直接生成,未手抄。
-- ===========================================================================
BEGIN;

SELECT 'before' AS phase, count(*) AS ch2_notes
  FROM public.library_culture_notes lcn
  JOIN public.library_books b ON b.id=lcn.book_id
 WHERE b.book_key='wizard-of-oz' AND lcn.chapter_idx=2;

INSERT INTO public.library_culture_notes
  (book_id, term, chapter_idx, title, body_zh, body_en, is_published)
SELECT b.id, v.term, v.chapter_idx, v.title, v.body_zh, v.body_en, true
FROM (SELECT id FROM public.library_books WHERE book_key='wizard-of-oz') b
CROSS JOIN (VALUES
  ('silver', 2, $t$银鞋子:书里是银的,电影里却是红的$t$, $z$在原著里,东方坏女巫穿的、后来归多萝西的这双魔法鞋是银色的(silver shoes)。但很多人印象里那是一双闪亮的红宝石鞋——那来自 1939 年的经典电影《绿野仙踪》。当时彩色电影刚问世(Technicolor),红色在银幕上比银色更抢眼,所以剧组把鞋改成了红宝石色。后来"红宝石鞋"红遍全球,几乎盖过了鲍姆原著里的银鞋。你手上读的是原版,所以这里是银鞋。$z$, $e$In the original book, the magic shoes — worn by the Wicked Witch of the East and later by Dorothy — are silver. But many people picture sparkling ruby (red) slippers instead. Those come from the famous 1939 film, made when color movies were brand new: red showed up far more brightly on the new Technicolor screen than silver, so the film changed the shoes to ruby. The ruby slippers grew so famous that they almost replaced Baum's silver shoes. You are reading the original, so here they are silver.$e$),
  ('munchkin', 2, $t$Munchkin:一个从这本书"跑进"英语的词$t$, $z$Munchkin(芒奇金人)是鲍姆为奥兹国东方的小矮人造出来的名字,原本并不是英语单词。后来——尤其 1939 年的电影火了之后——munchkin 慢慢进了日常英语,用来亲昵地指"个子小小的人",尤其是小孩子(大人逗小孩会叫一声 little munchkin)。所以你以后在生活里再碰到这个词,它就是从这本书里来的。$z$, $e$"Munchkin" is a name Baum invented for the little people of the eastern land of Oz — it was not an English word before. But later — especially after the 1939 film became a hit — "munchkin" gradually entered everyday English, used affectionately for a very small person, especially a child (a grown-up might call a little kid "my little munchkin"). So when you meet this word in real life, it came from this very book.$e$),
  ('munchkins', 2, $t$Munchkin:一个从这本书"跑进"英语的词$t$, $z$Munchkin(芒奇金人)是鲍姆为奥兹国东方的小矮人造出来的名字,原本并不是英语单词。后来——尤其 1939 年的电影火了之后——munchkin 慢慢进了日常英语,用来亲昵地指"个子小小的人",尤其是小孩子(大人逗小孩会叫一声 little munchkin)。所以你以后在生活里再碰到这个词,它就是从这本书里来的。$z$, $e$"Munchkin" is a name Baum invented for the little people of the eastern land of Oz — it was not an English word before. But later — especially after the 1939 film became a hit — "munchkin" gradually entered everyday English, used affectionately for a very small person, especially a child (a grown-up might call a little kid "my little munchkin"). So when you meet this word in real life, it came from this very book.$e$),
  ('witch', 2, $t$女巫一定是坏人吗?$t$, $z$在很多欧洲老童话里,女巫(witch)几乎都是害人的坏角色。但这本书特意打破了这个印象:奥兹国有四个女巫,东、西两个是坏的,南、北两个却是好的——北方的好女巫这会儿就在帮多萝西。在当时的童话里,让女巫也可以是好人、还主动来帮主角,是个挺新鲜的安排。所以多萝西一听说对方是女巫就害怕,是因为她也以为"女巫都是坏的"。$z$, $e$In many old European fairy tales, a witch is almost always a wicked, harmful character. This book deliberately breaks that idea: the Land of Oz has four witches — the East and West ones are wicked, but the North and South ones are good, and the Good Witch of the North is helping Dorothy right now. For a fairy tale of that time, letting a witch be good — and having her come to help the hero — was a fresh idea. That is why Dorothy is frightened at first — she, too, assumed all witches were bad.$e$),
  ('witches', 2, $t$女巫一定是坏人吗?$t$, $z$在很多欧洲老童话里,女巫(witch)几乎都是害人的坏角色。但这本书特意打破了这个印象:奥兹国有四个女巫,东、西两个是坏的,南、北两个却是好的——北方的好女巫这会儿就在帮多萝西。在当时的童话里,让女巫也可以是好人、还主动来帮主角,是个挺新鲜的安排。所以多萝西一听说对方是女巫就害怕,是因为她也以为"女巫都是坏的"。$z$, $e$In many old European fairy tales, a witch is almost always a wicked, harmful character. This book deliberately breaks that idea: the Land of Oz has four witches — the East and West ones are wicked, but the North and South ones are good, and the Good Witch of the North is helping Dorothy right now. For a fairy tale of that time, letting a witch be good — and having her come to help the hero — was a fresh idea. That is why Dorothy is frightened at first — she, too, assumed all witches were bad.$e$),
  ('sorceress', 2, $t$sorceress:为什么词尾是 -ess?$t$, $z$sorceress 指女魔法师(男的叫 sorcerer)。英语里传统上有一批词靠词尾 -ess 表示"女性":actor→actress(女演员)、waiter→waitress(女服务员)、host→hostess(女主人)。sorcerer→sorceress 就是同一套。北方女巫恭恭敬敬叫多萝西"most noble Sorceress(最尊贵的女法师)",是把她当成了施展强大魔法、除掉坏女巫的大人物。$z$, $e$A "sorceress" is a female sorcerer (a male one is a "sorcerer"). English has traditionally had a set of words that add the ending -ess to mean "female": actor→actress, waiter→waitress, host→hostess. sorcerer→sorceress works the same way. The Good Witch of the North politely calls Dorothy "most noble Sorceress," treating her as a powerful magic-worker who has defeated the Wicked Witch.$e$),
  ('sorceresses', 2, $t$sorceress:为什么词尾是 -ess?$t$, $z$sorceress 指女魔法师(男的叫 sorcerer)。英语里传统上有一批词靠词尾 -ess 表示"女性":actor→actress(女演员)、waiter→waitress(女服务员)、host→hostess(女主人)。sorcerer→sorceress 就是同一套。北方女巫恭恭敬敬叫多萝西"most noble Sorceress(最尊贵的女法师)",是把她当成了施展强大魔法、除掉坏女巫的大人物。$z$, $e$A "sorceress" is a female sorcerer (a male one is a "sorcerer"). English has traditionally had a set of words that add the ending -ess to mean "female": actor→actress, waiter→waitress, host→hostess. sorcerer→sorceress works the same way. The Good Witch of the North politely calls Dorothy "most noble Sorceress," treating her as a powerful magic-worker who has defeated the Wicked Witch.$e$)
) AS v(term, chapter_idx, title, body_zh, body_en)
ON CONFLICT (book_id, term) DO UPDATE SET
  chapter_idx=EXCLUDED.chapter_idx, title=EXCLUDED.title,
  body_zh=EXCLUDED.body_zh, body_en=EXCLUDED.body_en, is_published=EXCLUDED.is_published;

SELECT 'after' AS phase, lcn.term, lcn.chapter_idx, lcn.title
  FROM public.library_culture_notes lcn
  JOIN public.library_books b ON b.id=lcn.book_id
 WHERE b.book_key='wizard-of-oz' AND lcn.chapter_idx=2
 ORDER BY lcn.term;

COMMIT;
