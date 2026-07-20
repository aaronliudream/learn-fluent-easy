-- ============================================================================
-- 图书馆点词词典冷词补全 · 枞树(CC子代理手写·不走AI边缘·待Aaron/Web审后跑)
-- 与 REVIEWAA/图书馆词表/fir-tree-dict-review.md 一致。仅补全局 read-v1 里还没有的冷词。
-- read-v1 词卡 12 张(跨批去重 0)。normalized 唯一,幂等 upsert(手写卡覆盖运行时生成)。
-- ============================================================================
BEGIN;
SELECT 'before' AS phase,
  (SELECT count(*) FROM public.phrase_explanations WHERE target_lang='read-v1') AS readv1_cards;

INSERT INTO public.phrase_explanations (phrase, normalized, source_lang, target_lang, explanation)
VALUES
  ('beheld', 'beheld', 'en', 'read-v1', '{"ipa":"/bɪˈhɛld/","pos":"v.","word":"beheld","example":{"en":"From the hill she beheld the whole city below.","cn":"从山上,她望见了下面整座城市。"},"gloss_cn":"看见、注视(behold 的过去式,古旧书面语)","gloss_en":"saw; gazed at (archaic past of behold)","sense_key":"behold"}'::jsonb),
  ('tinsel', 'tinsel', 'en', 'read-v1', '{"ipa":"/ˈtɪnsəl/","pos":"n.","word":"tinsel","example":{"en":"Silver tinsel sparkled all over the shop window.","cn":"银色的亮丝在橱窗上到处闪光。"},"gloss_cn":"(装饰用的)闪亮金属箔片、亮丝","gloss_en":"thin shiny strips used for decoration","sense_key":"tinsel"}'::jsonb),
  ('larder', 'larder', 'en', 'read-v1', '{"ipa":"/ˈlɑːrdər/","pos":"n.","word":"larder","example":{"en":"She kept cheese and cold meat in the larder.","cn":"她把奶酪和冷肉放在食品储藏室里。"},"gloss_cn":"食品储藏室","gloss_en":"a cool room or cupboard for storing food","sense_key":"larder"}'::jsonb),
  ('magnificence', 'magnificence', 'en', 'read-v1', '{"ipa":"/mæɡˈnɪfəsəns/","pos":"n.","word":"magnificence","example":{"en":"The visitors gasped at the magnificence of the hall.","cn":"客人们为大厅的豪华惊叹不已。"},"gloss_cn":"壮丽、宏伟、豪华","gloss_en":"great splendor or grandeur","sense_key":"magnificence"}'::jsonb),
  ('balustrade', 'balustrade', 'en', 'read-v1', '{"ipa":"/ˈbæləstreɪd/","pos":"n.","word":"balustrade","example":{"en":"He leaned on the marble balustrade and looked down.","cn":"他靠在大理石栏杆上往下看。"},"gloss_cn":"(阳台或楼梯边的)栏杆","gloss_en":"a railing along a balcony or staircase","sense_key":"balustrade"}'::jsonb),
  ('moveth', 'moveth', 'en', 'read-v1', '{"ipa":"/ˈmuːvəθ/","pos":"v.","word":"moveth","example":{"en":"The wind moveth over the still water.","cn":"风在静静的水面上吹动。"},"gloss_cn":"动、涌动(move 的古旧第三人称形式)","gloss_en":"moves (archaic third-person form of move)","sense_key":"move"}'::jsonb),
  ('wherefore', 'wherefore', 'en', 'read-v1', '{"ipa":"/ˈwɛrfɔːr/","pos":"adv.","word":"wherefore","example":{"en":"Wherefore do you weep on such a happy day?","cn":"这样喜庆的日子,你为什么哭呢?"},"gloss_cn":"为什么、为何(古旧)","gloss_en":"why; for what reason (archaic)","sense_key":"wherefore"}'::jsonb),
  ('tis', 'tis', 'en', 'read-v1', '{"ipa":"/tɪz/","pos":"cont.","word":"tis","example":{"en":"''Tis a cold and lonely night out here.","cn":"外面是个又冷又孤单的夜晚。"},"gloss_cn":"''tis:它是、现在是(''it is'' 的古旧缩略)","gloss_en":"it is (archaic contraction of \"it is\")","sense_key":"it-is"}'::jsonb),
  ('sugarplums', 'sugarplums', 'en', 'read-v1', '{"ipa":"/ˈʃʊɡərplʌmz/","pos":"n.","word":"sugarplums","example":{"en":"The children were given sugarplums after supper.","cn":"晚饭后,孩子们分到了一些水果糖。"},"gloss_cn":"(旧时的)圆形水果糖、蜜饯糖果","gloss_en":"small round sweets or candied treats","sense_key":"sugarplum"}'::jsonb),
  ('pith', 'pith', 'en', 'read-v1', '{"ipa":"/pɪθ/","pos":"n.","word":"pith","example":{"en":"A soft pith runs down the middle of the twig.","cn":"一条柔软的木髓穿过细枝的正中。"},"gloss_cn":"(树干、茎的)木髓、中心软心","gloss_en":"the soft spongy core at the center of a stem","sense_key":"pith"}'::jsonb),
  ('pines', 'pines', 'en', 'read-v1', '{"ipa":"/paɪnz/","pos":"n.","word":"pines","example":{"en":"Tall pines lined both banks of the river.","cn":"高大的松树排列在河的两岸。"},"gloss_cn":"松树(pine 的复数)","gloss_en":"pine trees","sense_key":"pine"}'::jsonb),
  ('pitcher', 'pitcher', 'en', 'read-v1', '{"ipa":"/ˈpɪtʃər/","pos":"n.","word":"pitcher","example":{"en":"She poured milk from a heavy clay pitcher.","cn":"她从一只沉甸甸的陶罐里倒出牛奶。"},"gloss_cn":"(有柄有倾口的)大水罐、大壶","gloss_en":"a large jug with a handle and a lip","sense_key":"pitcher"}'::jsonb)
ON CONFLICT (normalized, target_lang) DO UPDATE SET phrase=EXCLUDED.phrase, explanation=EXCLUDED.explanation, updated_at=now();

SELECT 'after' AS phase,
  (SELECT count(*) FROM public.phrase_explanations WHERE target_lang='read-v1') AS readv1_cards;
COMMIT;
