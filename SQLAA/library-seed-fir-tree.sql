-- ============================================================================
-- 图书馆样书 seed:The Fir Tree (fir-tree)
-- 生成自 scripts/library/books/fir-tree.json —— node scripts/library/build-seed.mjs fir-tree
-- ⚠️ 内容(英文改写 + 中文)须先过审(Aaron/网页版 Claude)再落库(content-review-gate + D9)。
-- 幂等:upsert 书 + 删该书旧句重灌。BEGIN/COMMIT + 前后计数。
-- 章号真实(D12);共 5 章 / 158 句。
-- ============================================================================

BEGIN;

-- 0) 章标题列(方案 A:jsonb,幂等加列)。[{idx,title_en,title_zh}] + visibility(私享层已建,防御性再保一次)。
ALTER TABLE public.library_books
  ADD COLUMN IF NOT EXISTS chapters jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.library_books
  ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'public';

SELECT 'before' AS phase,
       (SELECT count(*) FROM public.library_books WHERE book_key = 'fir-tree') AS book_exists,
       (SELECT count(*) FROM public.library_sentences s
          JOIN public.library_books b ON b.id = s.book_id
         WHERE b.book_key = 'fir-tree') AS sentence_rows;

-- 1) 书目(upsert)
INSERT INTO public.library_books
  (book_key, title, zh_title, author, age_band, age_range, cover,
   intro_en, intro_zh, sentence_count, copyright_note, chapters, is_published, visibility)
VALUES
  ('fir-tree', 'The Fir Tree', '枞树', 'Hans Christian Andersen',
   '少儿', '8+', '{"c1":"#166534","c2":"#022c22"}'::jsonb,
   'A little fir tree in the woods can think of nothing but growing up and getting away. He envies the tall trees carried off to sea, aches to become a glittering Christmas tree, and never once stops to enjoy the sunlight, the birds, or his own green youth. By the time he understands what he had, it is already gone. Andersen''s quiet, aching little tale about forever living for the next thing — and missing the life standing right in front of you.', '树林里的一棵小枞树,一心只想快快长大、快快离开。他羡慕那些被运去大海的高大树木,渴望做一棵金光闪闪的圣诞树,却从没停下来,好好享受阳光、鸟儿,和自己那一身鲜绿的青春。等他终于懂得自己曾经拥有过什么,一切都已经过去了。安徒生这篇安静又心酸的小故事,写的是一个总为“下一件事”而活、却错过了眼前生活的人。', 158, '公版书 · Hans Christian Andersen, 1844 · 英文译本属公有领域 · 中译由本平台生成。',
   '[{"idx":1,"title_en":"The Little Fir in the Woods","title_zh":"林中的小枞树"},{"idx":2,"title_en":"The Splendor He Longed For","title_zh":"他向往的荣光"},{"idx":3,"title_en":"The Grandest Evening","title_zh":"最光辉的一夜"},{"idx":4,"title_en":"Forgotten in the Loft","title_zh":"被遗忘在阁楼"},{"idx":5,"title_en":"Every Tale Must End","title_zh":"一切都过去了"}]'::jsonb, false, 'public')
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
  -- 注:不覆盖 is_published / visibility —— 审后手动置 true / 由 private 翻 public,重灌 seed 不会把它们打回。

-- 2) 句子(删旧重灌,幂等)。audio_url 留 NULL:默认前端实时合成,预生成脚本审后另回填。
DELETE FROM public.library_sentences
 WHERE book_id = (SELECT id FROM public.library_books WHERE book_key = 'fir-tree');

INSERT INTO public.library_sentences (book_id, chapter_idx, para_idx, seq, text_en, text_cn)
SELECT b.id, v.chapter_idx, v.para_idx, v.seq, v.text_en, v.text_cn
FROM public.library_books b
CROSS JOIN (VALUES
    (1, 1, 1, 'Out in the woods stood a nice little Fir Tree.', '树林里长着一棵漂亮的小枞树。'),
    (1, 1, 2, 'The place he had was a very good one: the sun shone on him: as to fresh air, there was enough of that, and round him grew many large-sized comrades, pines as well as firs.', '他占的地方好极了:太阳照得到他,新鲜空气也够多;周围还长着许多高大的伙伴,松树和枞树都有。'),
    (1, 1, 3, 'But the little Fir wanted so very much to be a grown-up tree.', '可这棵小枞树,一心一意就想快点长成一棵大树。'),
    (1, 2, 4, 'He did not think of the warm sun and of the fresh air; he did not care for the little cottage children that ran about and prattled when they were in the woods looking for wild-strawberries.', '他不去想温暖的阳光和新鲜的空气,也不理会那些从村舍里跑出来的小孩子——他们在林子里找野草莓,一路又跑又叽叽喳喳。'),
    (1, 2, 5, 'The children often came with a whole pitcher full of berries, or a long row of them threaded on a straw, and sat down near the young tree and said, "Oh, how pretty he is! What a nice little fir!"', '孩子们常提着满满一罐草莓来,或用一根麦秆串起长长的一串,在这棵小树旁边坐下,说:“噢,他多可爱呀!多好看的一棵小枞树!”'),
    (1, 2, 6, 'But this was what the Tree could not bear to hear.', '可枞树最受不了的,就是这种话。'),
    (1, 3, 7, 'At the end of a year he had shot up a good deal, and after another year he was another long bit taller; for with fir trees one can always tell by the shoots how many years old they are.', '一年过去,他往上蹿了好一截;又一年过去,他又高了长长一段——因为枞树的年岁,总能从新长的枝节上数出来。'),
    (1, 4, 8, '"Oh! Were I but such a high tree as the others are," sighed he.', '“唉!我要是能像别的树那么高大就好了,”他叹着气说。'),
    (1, 4, 9, '"Then I should be able to spread out my branches, and with the tops to look into the wide world!', '“那样我就能舒展枝条,用树梢眺望这广大的世界!”'),
    (1, 4, 10, 'Then would the birds build nests among my branches: and when there was a breeze, I could bend with as much stateliness as the others!"', '“那样鸟儿就会在我的枝间做窝;起风的时候,我也能像别的树那样,气派十足地摇曳。”'),
    (1, 5, 11, 'Neither the sunbeams, nor the birds, nor the red clouds which morning and evening sailed above him, gave the little Tree any pleasure.', '阳光也罢,鸟儿也罢,早晚在他头顶飘过的红云也罢,都没能让这棵小树觉得有一点儿快乐。'),
    (1, 6, 12, 'In winter, when the snow lay glittering on the ground, a hare would often come leaping along, and jump right over the little Tree.', '冬天,雪在地上闪着亮光,一只野兔常常一路蹦跳过来,一下就从小枞树身上跳了过去。'),
    (1, 6, 13, 'Oh, that made him so angry!', '噢,这可把他气坏了!'),
    (1, 6, 14, 'But two winters were past, and in the third the Tree was so large that the hare was obliged to go round it.', '可两个冬天过去,到第三个冬天,枞树已经长得很大,野兔只好绕着他走了。'),
    (1, 6, 15, '"To grow and grow, to get older and be tall," thought the Tree -- "that, after all, is the most delightful thing in the world!"', '“长啊,长啊,长大、长高,”枞树想,“这毕竟是世界上顶顶快活的事!”'),
    (1, 7, 16, 'In autumn the wood-cutters always came and felled some of the largest trees.', '每到秋天,伐木人总会来砍倒几棵最大的树。'),
    (1, 7, 17, 'This happened every year; and the young Fir Tree, that had now grown to a very comely size, trembled at the sight; for the magnificent great trees fell to the earth with noise and cracking, the branches were lopped off, and the trees looked long and bare; they were hardly to be recognised; and then they were laid in carts, and the horses dragged them out of the wood.', '这样的事年年都有;如今已长得很秀气的小枞树,一看见就发抖——那些雄伟的大树轰隆隆、咔嚓嚓地倒在地上,枝子被砍掉,只剩下光秃秃、长长的一条,几乎认不出来了;然后它们被装上大车,马儿把它们拖出了树林。'),
    (1, 8, 18, 'Where did they go to?', '它们上哪儿去了呢?'),
    (1, 8, 19, 'What became of them?', '它们后来又怎么样了呢?'),
    (1, 9, 20, 'In spring, when the swallows and the storks came, the Tree asked them, "Don''t you know where they have been taken? Have you not met them anywhere?"', '春天,燕子和鹳鸟飞来了,枞树问它们:“你们不知道它们被运到哪儿去了吗?你们在什么地方碰见过它们没有?”'),
    (1, 10, 21, 'The swallows did not know anything about it; but the Stork looked musing, nodded his head, and said, "Yes; I think I know; I met many ships as I was flying hither from Egypt; on the ships were magnificent masts, and I venture to assert that it was they that smelt so of fir.', '燕子什么也不知道;可鹳鸟若有所思地点点头,说:“知道,我大概知道。我从埃及飞来的路上,遇见过好多船;船上竖着雄伟的桅杆,我敢说,正是它们散发出那么浓的枞树香。'),
    (1, 10, 22, 'I may congratulate you, for they lifted themselves on high most majestically!"', '我得恭喜你——它们高高地耸立着,那么威风!”'),
    (1, 11, 23, '"Oh, were I but old enough to fly across the sea! But how does the sea look in reality? What is it like?"', '“唉,我要是长得够大,能飞过大海就好了!可大海究竟是什么样儿呢?它像什么呀?”'),
    (1, 12, 24, '"That would take a long time to explain," said the Stork, and with these words off he went.', '“那可要好久才说得清呢,”鹳鸟说完,就飞走了。'),
    (1, 13, 25, '"Rejoice in thy growth!" said the Sunbeams. "Rejoice in thy vigorous growth, and in the fresh life that moveth within thee!"', '“为你的成长欢喜吧!”阳光说,“为你旺盛的生长、为你体内涌动的新鲜生命欢喜吧!”'),
    (1, 14, 26, 'And the Wind kissed the Tree, and the Dew wept tears over him; but the Fir understood it not.', '风亲吻着枞树,露水在他身上滴下泪珠;可枞树一点也不明白。'),
    (1, 15, 27, 'When Christmas came, quite young trees were cut down: trees which often were not even as large or of the same age as this Fir Tree, who could never rest, but always wanted to be off.', '圣诞节到了,一些很小的树也被砍倒了——它们往往还没这棵枞树大,年岁也不如他;可这棵枞树总是安静不下来,老想着离开这儿。'),
    (1, 15, 28, 'These young trees, and they were always the finest looking, retained their branches; they were laid on carts, and the horses drew them out of the wood.', '这些小树都是模样最俊的,一根枝子也没剪;它们被装上大车,马儿把它们拉出了树林。'),
    (2, 16, 29, '"Where are they going to?" asked the Fir.', '“它们要上哪儿去呀?”枞树问。'),
    (2, 16, 30, '"They are not taller than I; there was one indeed that was considerably shorter; and why do they retain all their branches? Whither are they taken?"', '“它们并不比我高;有一棵其实还矮得多呢。它们干吗把枝子全留着?它们被带到哪儿去了?”'),
    (2, 17, 31, '"We know! We know!" chirped the Sparrows.', '“我们知道!我们知道!”麻雀们叽叽喳喳地叫。'),
    (2, 17, 32, '"We have peeped in at the windows in the town below! We know whither they are taken!', '“我们从下面镇上的窗子往里偷看过!我们知道它们被带到哪儿去了!'),
    (2, 17, 33, 'The greatest splendor and the greatest magnificence one can imagine await them. We peeped through the windows, and saw them planted in the middle of the warm room and ornamented with the most splendid things, with gilded apples, with gingerbread, with toys, and many hundred lights!"', '等着它们的,是人能想得出的最大的光彩、最气派的排场。我们透过窗子看见,它们被栽在温暖屋子的正当中,身上挂满了最漂亮的东西——镀金的苹果、姜饼、玩具,还有好几百支灯火!”'),
    (2, 18, 34, '"And then?" asked the Fir Tree, trembling in every bough.', '“那后来呢?”枞树问,浑身的枝子都在发抖。'),
    (2, 18, 35, '"And then? What happens then?"', '“那后来呢?后来又出了什么事?”'),
    (2, 19, 36, '"We did not see anything more: it was incomparably beautiful."', '“我们没再看下去了:那真是美得没法比。”'),
    (2, 20, 37, '"I would fain know if I am destined for so glorious a career," cried the Tree, rejoicing.', '“我真想知道,我是不是也注定有这么辉煌的前程,”枞树快活地嚷起来。'),
    (2, 20, 38, '"That is still better than to cross the sea! What a longing do I suffer! Were Christmas but come!', '“那可比飘洋过海还要好!我心里多渴望呀!圣诞节快来吧!'),
    (2, 20, 39, 'I am now tall, and my branches spread like the others that were carried off last year! Oh! were I but already on the cart! Were I in the warm room with all the splendor and magnificence!', '如今我长高了,枝子也像去年被运走的那些一样舒展开了!噢,我要是已经在大车上就好了!我要是已经在那温暖的屋子里,守着满屋的光彩和排场就好了!'),
    (2, 20, 40, 'Yes; then something better, something still grander, will surely follow, or wherefore should they thus ornament me?', '是啊,那以后一定还会有更好的、更了不起的事,不然他们干吗要这样打扮我呢?'),
    (2, 20, 41, 'Something better, something still grander must follow -- but what?', '更好的、更了不起的事一定会来——可到底是什么呢?'),
    (2, 20, 42, 'Oh, how I long, how I suffer! I do not know myself what is the matter with me!"', '噢,我多渴望,我多难受!我自己也说不清,我这是怎么了!”'),
    (2, 21, 43, '"Rejoice in our presence!" said the Air and the Sunlight. "Rejoice in thy own fresh youth!"', '“为你眼前的这一切欢喜吧!”空气和阳光说,“为你自己鲜嫩的青春欢喜吧!”'),
    (2, 22, 44, 'But the Tree did not rejoice at all; he grew and grew, and was green both winter and summer.', '可枞树一点也不欢喜;他只顾着长啊长,冬夏都是绿的。'),
    (2, 22, 45, 'People that saw him said, "What a fine tree!" and towards Christmas he was one of the first that was cut down.', '见过他的人都说:“好一棵漂亮的树!”快到圣诞节的时候,他头一批就被砍倒了。'),
    (2, 22, 46, 'The axe struck deep into the very pith; the Tree fell to the earth with a sigh; he felt a pang -- it was like a swoon; he could not think of happiness, for he was sorrowful at being separated from his home, from the place where he had sprung up.', '斧头深深地劈进他的木心;枞树叹着气倒在地上;他觉得一阵剧痛——像要晕过去似的;他怎么也高兴不起来,因为一想到要离开家、离开自己长大的地方,他就难过。'),
    (2, 22, 47, 'He well knew that he should never see his dear old comrades, the little bushes and flowers around him, anymore; perhaps not even the birds!', '他心里很清楚,再也见不到那些亲爱的老伙伴了,见不到身边的小灌木和小花了——也许连鸟儿也见不到了!'),
    (2, 22, 48, 'The departure was not at all agreeable.', '这一走,一点也不叫人愉快。'),
    (2, 23, 49, 'The Tree only came to himself when he was unloaded in a court-yard with the other trees, and heard a man say, "That one is splendid! We don''t want the others."', '枞树被卸在一个院子里,和别的树堆在一起,这才醒过神来;他听见一个人说:“这一棵真棒!别的我们不要。”'),
    (2, 23, 50, 'Then two servants came in rich livery and carried the Fir Tree into a large and splendid drawing-room.', '接着来了两个穿华丽号衣的仆人,把枞树抬进了一间宽敞、豪华的客厅。'),
    (2, 23, 51, 'Portraits were hanging on the walls, and near the white porcelain stove stood two large Chinese vases with lions on the covers.', '墙上挂着一幅幅画像,白瓷炉旁立着两只很大的中国花瓶,瓶盖上还蹲着狮子。'),
    (2, 23, 52, 'There, too, were large easy-chairs, silken sofas, large tables full of picture-books and full of toys, worth hundreds and hundreds of crowns -- at least the children said so.', '屋里还有宽大的安乐椅、绸面的沙发,还有几张大桌子,堆满了图画书和玩具,值好几百个银币——至少孩子们是这么说的。'),
    (2, 23, 53, 'And the Fir Tree was stuck upright in a cask that was filled with sand; but no one could see that it was a cask, for green cloth was hung all round it, and it stood on a large gaily-colored carpet.', '枞树被直直地插在一只装满沙子的木桶里;可谁也看不出那是只木桶,因为桶外围了一圈绿布,底下还铺着一张花花绿绿的大地毯。'),
    (2, 23, 54, 'Oh! how the Tree quivered! What was to happen?', '噢,枞树抖得多厉害!接下来会发生什么呢?'),
    (2, 23, 55, 'The servants, as well as the young ladies, decorated it.', '仆人们和年轻的小姐们一起,动手装点起他来。'),
    (2, 23, 56, 'On one branch there hung little nets cut out of colored paper, and each net was filled with sugarplums; and among the other boughs gilded apples and walnuts were suspended, looking as though they had grown there, and little blue and white tapers were placed among the leaves.', '一根枝子上挂着用彩纸剪成的小网兜,每只网兜里都塞满了糖果;别的枝桠上垂着镀金的苹果和胡桃,像是本来就长在那儿似的,叶子间还插着一支支蓝白相间的小蜡烛。'),
    (2, 23, 57, 'Dolls that looked for all the world like men -- the Tree had never beheld such before -- were seen among the foliage, and at the very top a large star of gold tinsel was fixed.', '叶丛里还坐着一些活像小人儿的玩偶——枞树以前从没见过这样的东西——树顶上端端正正地安着一颗金箔做的大星星。'),
    (2, 23, 58, 'It was really splendid -- beyond description splendid.', '真是华丽极了——华丽得没法儿形容。'),
    (2, 24, 59, '"This evening!" they all said. "How it will shine this evening!"', '“就在今晚!”大家都说,“今晚他会亮得多好看!”'),
    (2, 25, 60, '"Oh!" thought the Tree. "If the evening were but come! If the tapers were but lighted! And then I wonder what will happen!', '“噢!”枞树心想,“但愿晚上快来!但愿蜡烛快点儿点上!那时候不知会出什么事呢!'),
    (2, 25, 61, 'Perhaps the other trees from the forest will come to look at me! Perhaps the sparrows will beat against the windowpanes! I wonder if I shall take root here, and winter and summer stand covered with ornaments!"', '也许林子里别的树会来看我!也许麻雀会来敲窗玻璃!说不定我会在这儿生根,冬夏都披着这一身装饰,一直立下去呢!”'),
    (2, 26, 62, 'He knew very much about the matter -- but he was so impatient that for sheer longing he got a pain in his back, and this with trees is the same thing as a headache with us.', '关于这些,他懂得可多啦——可他实在太性急,光是这份渴望,就叫他背上生疼,这对树来说,就跟我们头疼是一回事。'),
    (3, 27, 63, 'The candles were now lighted -- what brightness! What splendor!', '蜡烛这会儿都点上了——多亮堂!多华丽!'),
    (3, 27, 64, 'The Tree trembled so in every bough that one of the tapers set fire to the foliage.', '枞树浑身的枝子抖得那么厉害,一支蜡烛竟点着了叶子。'),
    (3, 27, 65, 'It blazed up famously.', '火腾地一下就烧了起来。'),
    (3, 28, 66, '"Help! Help!" cried the young ladies, and they quickly put out the fire.', '“救命!救命!”年轻的小姐们喊起来,慌忙把火扑灭了。'),
    (3, 29, 67, 'Now the Tree did not even dare tremble.', '这下枞树连抖都不敢抖了。'),
    (3, 29, 68, 'What a state he was in!', '他那副模样,别提多狼狈!'),
    (3, 29, 69, 'He was so uneasy lest he should lose something of his splendor, that he was quite bewildered amidst the glare and brightness; when suddenly both folding-doors opened and a troop of children rushed in as if they would upset the Tree.', '他生怕丢了身上哪一点光彩,在那片耀眼的光亮里慌得不知所措;这时,两扇折门忽然大开,一群孩子冲了进来,那架势像是要把枞树掀翻。'),
    (3, 29, 70, 'The older persons followed quietly; the little ones stood quite still.', '大人们跟在后头,静静地走;小小的孩子们站着一动不动。'),
    (3, 29, 71, 'But it was only for a moment; then they shouted that the whole place re-echoed with their rejoicing; they danced round the Tree, and one present after the other was pulled off.', '可这只是一会儿的工夫;接着他们就欢呼起来,喊得满屋子都是回声;他们绕着枞树又跳又闹,一件接一件地把礼物摘了下来。'),
    (3, 30, 72, '"What are they about?" thought the Tree. "What is to happen now!"', '“他们在干什么呀?”枞树想,“这会儿又要出什么事了!”'),
    (3, 30, 73, 'And the lights burned down to the very branches, and as they burned down they were put out one after the other, and then the children had permission to plunder the Tree.', '蜡烛一直烧到枝子根上,烧到哪儿就一支支灭掉;然后孩子们得到许可,可以来抢枞树上的东西了。'),
    (3, 30, 74, 'So they fell upon it with such violence that all its branches cracked; if it had not been fixed firmly in the ground, it would certainly have tumbled down.', '他们一拥而上,又扯又拽,把所有的枝子都弄得咔咔直响;要不是他被牢牢地固定在桶里,准得整个儿翻倒下来。'),
    (3, 31, 75, 'The children danced about with their beautiful playthings; no one looked at the Tree except the old nurse, who peeped between the branches; but it was only to see if there was a fig or an apple left that had been forgotten.', '孩子们拿着漂亮的玩意儿到处跳来跳去;除了那位老保姆,谁也不再看枞树一眼——老保姆倒是从枝子缝里往里瞅,可也只是看看有没有落下的、忘了摘的无花果或苹果。'),
    (3, 32, 76, '"A story! A story!" cried the children, drawing a little fat man towards the Tree.', '“讲个故事!讲个故事!”孩子们嚷着,把一个矮胖的男人拉到枞树跟前。'),
    (3, 32, 77, 'He seated himself under it and said, "Now we are in the shade, and the Tree can listen too.', '他在树下坐了下来,说:“现在我们坐在树荫里,枞树也能听一听。'),
    (3, 32, 78, 'But I shall tell only one story.', '不过我只讲一个故事。'),
    (3, 32, 79, 'Now which will you have; that about Ivedy-Avedy, or about Humpy-Dumpy, who tumbled downstairs, and yet after all came to the throne and married the princess?"', '你们要听哪一个:是讲伊威迪-阿威迪的,还是讲滚下楼梯、后来却当上国王、娶了公主的洪普迪-邓普迪的?”'),
    (3, 33, 80, '"Ivedy-Avedy," cried some; "Humpy-Dumpy," cried the others.', '“伊威迪-阿威迪!”一些孩子喊;“洪普迪-邓普迪!”另一些孩子喊。'),
    (3, 33, 81, 'There was such a bawling and screaming -- the Fir Tree alone was silent, and he thought to himself, "Am I not to bawl with the rest? Am I to do nothing whatever?" for he was one of the company, and had done what he had to do.', '又是叫又是嚷,乱成一团——只有枞树一声不响,他暗自想:“难道我不该跟着大伙儿一块儿嚷吗?难道我就什么也不用做了?”因为他也是这一伙里的一员,该做的事他都做了。'),
    (3, 34, 82, 'And the man told about Humpy-Dumpy that tumbled down, who notwithstanding came to the throne, and at last married the princess.', '那人就讲起洪普迪-邓普迪怎么滚下了楼梯,却照样当上国王,末了还娶了公主。'),
    (3, 34, 83, 'And the children clapped their hands, and cried, "Oh, go on! Do go on!"', '孩子们拍着手嚷道:“讲下去!快讲下去!”'),
    (3, 34, 84, 'They wanted to hear about Ivedy-Avedy too, but the little man only told them about Humpy-Dumpy.', '他们还想听伊威迪-阿威迪的故事,可那矮个子只讲洪普迪-邓普迪。'),
    (3, 34, 85, 'The Fir Tree stood quite still and absorbed in thought; the birds in the wood had never related the like of this.', '枞树静静地立着,想得出了神;林子里的鸟儿可从没讲过这样的事。'),
    (3, 34, 86, '"Humpy-Dumpy fell downstairs, and yet he married the princess! Yes, yes! That''s the way of the world!" thought the Fir Tree, and believed it all, because the man who told the story was so good-looking.', '“洪普迪-邓普迪滚下了楼梯,末了竟娶了公主!是啊,是啊!世上的事就是这样!”枞树想,而且句句都信,因为讲故事的那个人长得实在体面。'),
    (3, 34, 87, '"Well, well! who knows, perhaps I may fall downstairs, too, and get a princess as wife!"', '“嗯,嗯!谁知道呢,说不定我也会滚下楼梯,娶一位公主做妻子呢!”'),
    (3, 34, 88, 'And he looked forward with joy to the morrow, when he hoped to be decked out again with lights, playthings, fruits, and tinsel.', '他满心欢喜地盼着明天,盼着能再一次挂满灯火、玩具、果子和金箔。'),
    (3, 35, 89, '"I won''t tremble to-morrow!" thought the Fir Tree.', '“明天我可再不发抖了!”枞树想。'),
    (3, 35, 90, '"I will enjoy to the full all my splendor! To-morrow I shall hear again the story of Humpy-Dumpy, and perhaps that of Ivedy-Avedy too."', '“我要痛痛快快地享一享我这满身的光彩!明天我还能再听一遍洪普迪-邓普迪的故事,说不定还有伊威迪-阿威迪的呢。”'),
    (3, 35, 91, 'And the whole night the Tree stood still and in deep thought.', '整整一夜,枞树静静地立着,想得出神。'),
    (4, 36, 92, 'In the morning the servant and the housemaid came in.', '早上,仆人和女佣进来了。'),
    (4, 37, 93, '"Now then the splendor will begin again," thought the Fir.', '“这下光彩又要重新开始了,”枞树想。'),
    (4, 37, 94, 'But they dragged him out of the room, and up the stairs into the loft: and here, in a dark corner, where no daylight could enter, they left him.', '可他们却把他拖出屋子,拖上楼梯,送进了阁楼:在这儿一个照不进一丝日光的黑角落里,他们把他丢下了。'),
    (4, 37, 95, '"What''s the meaning of this?" thought the Tree. "What am I to do here? What shall I hear now, I wonder?"', '“这是什么意思呀?”枞树想,“我待在这儿干什么呢?这会儿我又能听到些什么呢?”'),
    (4, 37, 96, 'And he leaned against the wall lost in reverie.', '他靠着墙,出起神来。'),
    (4, 37, 97, 'Time enough had he too for his reflections; for days and nights passed on, and nobody came up; and when at last somebody did come, it was only to put some great trunks in a corner, out of the way.', '他有的是工夫琢磨;一天天、一夜夜过去了,没有一个人上来;好不容易来了个人,也只是把几只大箱子搬到角落里,腾开地方。'),
    (4, 37, 98, 'There stood the Tree quite hidden; it seemed as if he had been entirely forgotten.', '枞树站在那儿,完全被遮住了;看样子,他是被人彻底忘掉了。'),
    (4, 38, 99, '"''Tis now winter out-of-doors!" thought the Tree. "The earth is hard and covered with snow; men cannot plant me now, and therefore I have been put up here under shelter till the spring-time comes!', '“这会儿外头是冬天了!”枞树想,“地冻得硬邦邦的,又盖着雪,人们这会儿没法把我栽下去,所以才把我搁在这儿避避寒,等开春再说!'),
    (4, 38, 100, 'How thoughtful that is! How kind man is, after all!', '这多体贴呀!人到底还是好心的!'),
    (4, 38, 101, 'If it only were not so dark here, and so terribly lonely! Not even a hare!', '只可惜这儿这么黑,又这么孤单得叫人受不了!连只野兔也没有!'),
    (4, 38, 102, 'And out in the woods it was so pleasant, when the snow was on the ground, and the hare leaped by; yes -- even when he jumped over me; but I did not like it then!', '从前在林子里多快活呀,地上盖着雪,野兔一蹦一跳地打身边过;是啊——连他从我身上跳过去的时候也好;那会儿我还不乐意呢!'),
    (4, 38, 103, 'It is really terribly lonely here!"', '这儿可真是孤单得要命!”'),
    (4, 39, 104, '"Squeak! Squeak!" said a little Mouse, at the same moment, peeping out of his hole.', '“吱吱!吱吱!”就在这时候,一只小老鼠从洞里探出头来说。'),
    (4, 39, 105, 'And then another little one came.', '接着又来了一只小的。'),
    (4, 39, 106, 'They snuffed about the Fir Tree, and rustled among the branches.', '它们围着枞树嗅来嗅去,在枝子间钻得沙沙响。'),
    (4, 40, 107, '"It is dreadfully cold," said the Mouse.', '“这儿冷得厉害,”老鼠说。'),
    (4, 40, 108, '"But for that, it would be delightful here, old Fir, wouldn''t it?"', '“要不是这么冷,待在这儿可真舒服,老枞树,你说是不是?”'),
    (4, 41, 109, '"I am by no means old," said the Fir Tree.', '“我一点也不老,”枞树说。'),
    (4, 41, 110, '"There''s many a one considerably older than I am."', '“比我岁数大得多的多着呢。”'),
    (4, 42, 111, '"Where do you come from," asked the Mice; "and what can you do?"', '“你从哪儿来呀,”老鼠们问,“你又会些什么呢?”'),
    (4, 42, 112, 'They were so extremely curious.', '它们好奇得不得了。'),
    (4, 42, 113, '"Tell us about the most beautiful spot on the earth. Have you never been there?', '“给我们讲讲世界上最美的地方吧。你难道从没去过那儿?'),
    (4, 42, 114, 'Were you never in the larder, where cheeses lie on the shelves, and hams hang from above; where one dances about on tallow candles: that place where one enters lean, and comes out again fat and portly?"', '你难道从没进过食品间——那儿架子上摆着奶酪,上头挂着火腿;人可以在牛油蜡烛上跳来跳去:进去时瘦瘦的,出来时又肥又壮?”'),
    (4, 43, 115, '"I know no such place," said the Tree.', '“我可不知道有这样的地方,”枞树说。'),
    (4, 43, 116, '"But I know the wood, where the sun shines and where the little birds sing."', '“不过我认得树林,那儿阳光照耀,小鸟歌唱。”'),
    (4, 43, 117, 'And then he told all about his youth; and the little Mice had never heard the like before; and they listened and said, "Well, to be sure! How much you have seen! How happy you must have been!"', '接着他就把自己小时候的事,一五一十讲了出来;小老鼠们从没听过这样的事;它们听着,说:“哎呀,可不是嘛!你见过的可真多!你从前一定过得多快活呀!”'),
    (4, 44, 118, '"I!" said the Fir Tree, thinking over what he had himself related. "Yes, in reality those were happy times."', '“我?”枞树回味着自己刚讲过的话,说,“是啊,那些日子的确是快活的日子。”'),
    (4, 44, 119, 'And then he told about Christmas-eve, when he was decked out with cakes and candles.', '接着他又讲起圣诞夜,讲自己怎样被打扮得挂满了糕点和蜡烛。'),
    (4, 45, 120, '"Oh," said the little Mice, "how fortunate you have been, old Fir Tree!"', '“噢,”小老鼠们说,“你从前多有福气呀,老枞树!”'),
    (4, 46, 121, '"I am by no means old," said he.', '“我一点也不老,”他说。'),
    (4, 46, 122, '"I came from the wood this winter; I am in my prime, and am only rather short for my age."', '“我今年冬天才从林子里来;我正当壮年,只是照我的年岁,个子还嫌矮了点儿。”'),
    (4, 47, 123, '"What delightful stories you know," said the Mice: and the next night they came with four other little Mice, who were to hear what the Tree recounted: and the more he related, the more he remembered himself; and it appeared as if those times had really been happy times.', '“你知道的故事真好听,”老鼠们说;第二天夜里,它们又带了四只别的小老鼠来,要听枞树讲;他越讲,自己也记起得越多,仿佛那些日子真的都是快活的日子。'),
    (4, 47, 124, '"But they may still come -- they may still come! Humpy-Dumpy fell downstairs, and yet he got a princess!" and he thought at the moment of a nice little Birch Tree growing out in the woods: to the Fir, that would be a real charming princess.', '“可它们说不定还会来——说不定还会来的!洪普迪-邓普迪滚下了楼梯,末了不还是娶了公主!”这时候他想起林子里长着的一棵可爱的小白桦:在枞树看来,那可真是一位迷人的公主。'),
    (5, 48, 125, '"Who is Humpy-Dumpy?" asked the Mice.', '“洪普迪-邓普迪是谁呀?”老鼠们问。'),
    (5, 48, 126, 'So then the Fir Tree told the whole fairy tale, for he could remember every single word of it; and the little Mice jumped for joy up to the very top of the Tree.', '于是枞树把整个童话从头讲了一遍,因为他每一个字都记得清清楚楚;小老鼠们乐得一直蹦到枞树的顶梢上。'),
    (5, 48, 127, 'Next night two more Mice came, and on Sunday two Rats even; but they said the stories were not interesting, which vexed the little Mice; and they, too, now began to think them not so very amusing either.', '第二天夜里又来了两只老鼠,礼拜天甚至来了两只大耗子;可它们说这些故事没意思,把小老鼠们气坏了;这一来,连小老鼠们也开始觉得,故事没那么好听了。'),
    (5, 49, 128, '"Do you know only one story?" asked the Rats.', '“你就只会一个故事吗?”耗子们问。'),
    (5, 50, 129, '"Only that one," answered the Tree.', '“就那一个,”枞树答道。'),
    (5, 50, 130, '"I heard it on my happiest evening; but I did not then know how happy I was."', '“那是我一辈子最快活的晚上听来的;可那时候我还不知道自己有多快活。”'),
    (5, 51, 131, '"It is a very stupid story! Don''t you know one about bacon and tallow candles? Can''t you tell any larder stories?"', '“这故事真没劲!你难道不知道一个讲咸肉和牛油蜡烛的?你就不能讲点儿食品间的故事吗?”'),
    (5, 52, 132, '"No," said the Tree.', '“不会,”枞树说。'),
    (5, 53, 133, '"Then good-bye," said the Rats; and they went home.', '“那就再见吧,”耗子们说完,就回家去了。'),
    (5, 54, 134, 'At last the little Mice stayed away also; and the Tree sighed: "After all, it was very pleasant when the sleek little Mice sat round me, and listened to what I told them.', '到末了,连小老鼠们也不来了;枞树叹了口气:“话说回来,那些光溜溜的小老鼠围着我坐、听我讲故事的时候,还真是快活呀。'),
    (5, 54, 135, 'Now that too is over.', '如今连这也过去了。'),
    (5, 54, 136, 'But I will take good care to enjoy myself when I am brought out again."', '不过等我再被带出去的时候,我一定要好好乐一乐。”'),
    (5, 55, 137, 'But when was that to be?', '可那要等到什么时候呢?'),
    (5, 55, 138, 'Why, one morning there came a quantity of people and set to work in the loft.', '嗨,一天早上,来了一大帮人,在阁楼里忙活起来。'),
    (5, 55, 139, 'The trunks were moved, the tree was pulled out and thrown -- rather hard, it is true -- down on the floor, but a man drew him towards the stairs, where the daylight shone.', '箱子被搬开,枞树也被拖了出来,啪地摔在地板上——摔得还真不轻——接着一个人把他拉向楼梯,那儿透着日光。'),
    (5, 56, 140, '"Now a merry life will begin again," thought the Tree.', '“这下快活的日子又要开始了,”枞树想。'),
    (5, 56, 141, 'He felt the fresh air, the first sunbeam -- and now he was out in the courtyard.', '他闻到了新鲜的空气,晒到了头一缕阳光——这会儿他已经到了院子里。'),
    (5, 56, 142, 'All passed so quickly, there was so much going on around him, the Tree quite forgot to look to himself.', '一切都过得那么快,他身边的事那么多,枞树竟顾不上打量打量自己。'),
    (5, 56, 143, 'The court adjoined a garden, and all was in flower; the roses hung so fresh and odorous over the balustrade, the lindens were in blossom, the Swallows flew by, and said, "Quirre-vit! My husband is come!" but it was not the Fir Tree that they meant.', '院子连着一座花园,满园都开着花;玫瑰鲜艳芬芳地探过栏杆,菩提树也开了花,燕子飞来飞去,叫着:“唧唧——唧!我的丈夫回来啦!”——可它们说的并不是枞树。'),
    (5, 57, 144, '"Now, then, I shall really enjoy life," said he exultingly, and spread out his branches; but, alas, they were all withered and yellow!', '“好,这下我可要真正好好享受享受了,”他得意地说着,把枝子舒展开来;可是,唉,枝子全都枯黄了!'),
    (5, 57, 145, 'It was in a corner that he lay, among weeds and nettles.', '他躺在一个墙角里,身边尽是杂草和荨麻。'),
    (5, 57, 146, 'The golden star of tinsel was still on the top of the Tree, and glittered in the sunshine.', '那颗金箔星星还留在枞树的顶上,在阳光里一闪一闪。'),
    (5, 58, 147, 'In the court-yard some of the merry children were playing who had danced at Christmas round the Fir Tree, and were so glad at the sight of him.', '院子里,几个曾在圣诞节绕着枞树跳舞的、快活的孩子正在玩耍,一见他就高兴起来。'),
    (5, 58, 148, 'One of the youngest ran and tore off the golden star.', '一个顶小的孩子跑过去,把那颗金星扯了下来。'),
    (5, 59, 149, '"Only look what is still on the ugly old Christmas tree!" said he, trampling on the branches, so that they all cracked beneath his feet.', '“瞧这难看的旧圣诞树上还留着什么呢!”他说着,一脚踩在枝子上,把枝子全踩得咔咔碎响。'),
    (5, 60, 150, 'And the Tree beheld all the beauty of the flowers, and the freshness in the garden; he beheld himself, and wished he had remained in his dark corner in the loft; he thought of his first youth in the wood, of the merry Christmas-eve, and of the little Mice who had listened with so much pleasure to the story of Humpy-Dumpy.', '枞树望着满园花朵的美丽,望着花园里那一片清新;他望着自己,只盼着当初还是留在阁楼那个黑角落里的好;他想起自己在林子里的少年时光,想起那快活的圣诞夜,想起那些听洪普迪-邓普迪故事听得那么高兴的小老鼠。'),
    (5, 61, 151, '"''Tis over -- ''tis past!" said the poor Tree.', '“完了——过去了!”可怜的枞树说。'),
    (5, 61, 152, '"Had I but rejoiced when I had reason to do so! But now ''tis past, ''tis past!"', '“当初我有理由快活的时候,要是快活过就好了!可如今全过去了,全过去了!”'),
    (5, 62, 153, 'And the gardener''s boy chopped the Tree into small pieces; there was a whole heap lying there.', '花匠的小儿子把枞树劈成了一小块一小块;地上堆了满满一堆。'),
    (5, 62, 154, 'The wood flamed up splendidly under the large brewing copper, and it sighed so deeply!', '这些木柴在那口大酿酒锅底下熊熊地烧了起来,烧得直叹气!'),
    (5, 62, 155, 'Each sigh was like a shot.', '每一声叹息,都像一记枪响。'),
    (5, 63, 156, 'The boys played about in the court, and the youngest wore the gold star on his breast which the Tree had had on the happiest evening of his life.', '孩子们在院子里玩耍,那个顶小的孩子,胸前戴着枞树在他一生最快活的那个晚上戴过的金星。'),
    (5, 63, 157, 'However, that was over now -- the Tree gone, the story at an end.', '然而,那一切如今都过去了——枞树没了,故事也到了头。'),
    (5, 63, 158, 'All, all was over -- every tale must end at last.', '全都完了,全完了——每一个故事,到末了总有个完结。')
) AS v(chapter_idx, para_idx, seq, text_en, text_cn)
WHERE b.book_key = 'fir-tree';

SELECT 'after' AS phase,
       (SELECT sentence_count FROM public.library_books WHERE book_key = 'fir-tree') AS book_sentence_count,
       (SELECT count(*) FROM public.library_sentences s
          JOIN public.library_books b ON b.id = s.book_id
         WHERE b.book_key = 'fir-tree') AS sentence_rows;

COMMIT;

-- 审核通过后,单独跑这一行让样书对用户可见(软上线):
-- UPDATE public.library_books SET is_published = true WHERE book_key = 'fir-tree';
