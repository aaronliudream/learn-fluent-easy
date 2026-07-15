-- ===========================================================================
-- 图书馆「文化笔记」② 读中词卡 · 绿野仙踪 内容(第 1 章 4 词 5 行)。
--   Aaron 审定 2026-07-14:cyclone 改(不再把现代 cyclone 误定义为热带气旋)/cellar 改
--   (救命设施改"很常见"、storm cellar 与菜窖改"用途不同"非"两回事",标题同步)/garret 保留/prairie 保留+加干旱澄清。
--   prairie 与 prairies 两个 tap 键 → 落 2 行同内容。term 归一化小写,和点读命中一致。
--   前置:先跑 library-culture-notes-ddl.sql 建表。ON CONFLICT(book_id,term) 幂等,可重复跑。
-- ===========================================================================
BEGIN;

SELECT 'before' AS phase, count(*) AS notes
  FROM public.library_culture_notes lcn
  JOIN public.library_books b ON b.id=lcn.book_id
 WHERE b.book_key='wizard-of-oz';

INSERT INTO public.library_culture_notes
  (book_id, term, chapter_idx, title, body_zh, body_en, is_published)
SELECT b.id, v.term, v.chapter_idx, v.title, v.body_zh, v.body_en, true
FROM (SELECT id FROM public.library_books WHERE book_key='wizard-of-oz') b
CROSS JOIN (VALUES
  ('cyclone', 1,
   $t$为什么叫 cyclone,不叫 tornado?$t$,
   $z$1900 年鲍姆写这本书时,美国中部平原上的人管这种从天而降、能掀翻房子的旋风叫 cyclone(旋风)。今天气象学更常用 tornado(龙卷风)来指这种陆地上、漏斗状的小尺度强风;而 cyclone 在现代气象里指的是范围大得多的大尺度气旋系统(围绕低气压旋转的大风暴),我们熟悉的台风、飓风就是其中的一类(热带气旋)。但在堪萨斯农民口中,cyclone 就是那种突然袭来、能把多萝西的房子连根卷走的可怕龙卷风——所以第一章就叫「The Cyclone」。$z$,
   $e$When Baum wrote this book in 1900, people on the American plains called the house-lifting whirlwind a "cyclone." Today weather scientists usually call this small land twister a "tornado," and use "cyclone" for the much larger storms that spin around a center of low pressure — typhoons and hurricanes are one kind. But to a Kansas farmer, a cyclone was exactly the sudden, terrifying twister that carried Dorothy's house away — which is why Chapter 1 is called "The Cyclone."$e$),

  ('cellar', 1,
   $t$cellar:躲龙卷风的地窖$t$,
   $z$cellar 本义是「地下室」。书里 Uncle Henry 家太小,没有真正的地下室,只在地板正中挖了一个小地洞,叫 cyclone cellar(防旋风地窖)。龙卷风来时,一家人掀开地板上的活板门(trap door),顺着梯子钻进这个又小又黑的洞里躲命。这在当年美国大草原上是很常见的救命设施,和用来存酒、存菜的地窖用途完全不同。$z$,
   $e$A "cellar" is a room dug underground. Uncle Henry's house was too small for a real one, so the family only dug a little hole called a "cyclone cellar." When a twister came, they lifted a trap door in the floor and climbed down a ladder to hide in the small, dark hole. On the old American prairie this was a common life-saving shelter — used to survive a storm, not to store wine or vegetables.$e$),

  ('garret', 1,
   $t$garret 是什么样的房间?$t$,
   $z$garret 指屋顶正下方那个又矮又斜的小阁楼:墙壁跟着屋顶倾斜,通常用来堆杂物,或给最穷的人住(欧美老小说里穷学生、穷画家常「住在 garret 里」)。它和普通的 attic(阁楼)意思相近,但 garret 更强调「窄小、简陋、能住人」。书里说这间小屋「没有 garret,也没有地下室」,一句话就点出 Uncle Henry 一家有多清贫——房子只有一层、一个房间。$z$,
   $e$A "garret" is the cramped little room right under a sloping roof, often used for storage or as a home for the very poor. It is close in meaning to "attic," but "garret" stresses how small and bare it is. Saying the house had "no garret at all, and no cellar" tells us in just a few words how poor Uncle Henry's family was.$e$),

  ('prairie', 1,
   $t$prairie:美国中部一望无际的大草原$t$,
   $z$prairie 指北美中部那片辽阔平坦的大草原,堪萨斯(Kansas)正在其中。这里没有山、几乎没有树,草能长得很高,一眼望去平到天边——书里说多萝西「除了灰色的大草原什么也看不见」。草原的黑土其实非常肥沃(后来成了美国的大粮仓),书里之所以灰扑扑、干裂,是因为那年的烈日和干旱把草和泥土都烤成了灰色。19 世纪的开拓者就赶着大篷车来这里垦荒。prairie 这个词本身来自法语,意思是「草地」。$z$,
   $e$A "prairie" is the huge, flat grassland in the middle of North America, and Kansas sits right in it. There are no hills and almost no trees; the grass can grow tall and the land runs flat to the edge of the sky. Its black soil is actually very rich (these plains later became America's breadbasket) — it looks gray and cracked in the story only because that summer's burning sun and drought had baked it dry. Settlers came here in covered wagons to farm the land, and the word "prairie" comes from French, meaning "meadow."$e$),

  ('prairies', 1,
   $t$prairie:美国中部一望无际的大草原$t$,
   $z$prairie 指北美中部那片辽阔平坦的大草原,堪萨斯(Kansas)正在其中。这里没有山、几乎没有树,草能长得很高,一眼望去平到天边——书里说多萝西「除了灰色的大草原什么也看不见」。草原的黑土其实非常肥沃(后来成了美国的大粮仓),书里之所以灰扑扑、干裂,是因为那年的烈日和干旱把草和泥土都烤成了灰色。19 世纪的开拓者就赶着大篷车来这里垦荒。prairie 这个词本身来自法语,意思是「草地」。$z$,
   $e$A "prairie" is the huge, flat grassland in the middle of North America, and Kansas sits right in it. There are no hills and almost no trees; the grass can grow tall and the land runs flat to the edge of the sky. Its black soil is actually very rich (these plains later became America's breadbasket) — it looks gray and cracked in the story only because that summer's burning sun and drought had baked it dry. Settlers came here in covered wagons to farm the land, and the word "prairie" comes from French, meaning "meadow."$e$)
) AS v(term, chapter_idx, title, body_zh, body_en)
ON CONFLICT (book_id, term) DO UPDATE SET
  chapter_idx=EXCLUDED.chapter_idx, title=EXCLUDED.title,
  body_zh=EXCLUDED.body_zh, body_en=EXCLUDED.body_en, is_published=EXCLUDED.is_published;

SELECT 'after' AS phase, term, chapter_idx, title
  FROM public.library_culture_notes lcn
  JOIN public.library_books b ON b.id=lcn.book_id
 WHERE b.book_key='wizard-of-oz'
 ORDER BY term;

COMMIT;
