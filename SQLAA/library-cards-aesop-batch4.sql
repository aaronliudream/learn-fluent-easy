-- ============================================================================
-- 图书馆点词实词词典卡 · 伊索(aesop) 第4批(19张·CC自审)。判据:现代最高频义居首/解释性gloss/例句演居首义/屈折并卡。
-- 屈折并:freezing→freeze,hazelnuts→hazelnut,horseflies→horsefly,lunged→lunge,insulting→insult。hitting双写辅音不回退→单独造。
-- ⚠️需Aaron裁1处:frisk 排序(欢蹦 vs 搜身)——我按"欢蹦居首"(伊索义+更基础),搜身现代也高频,若要换说一声。
-- INSERT..ON CONFLICT 幂等。8字段齐,美音IPA。四本共享 read-v1。
-- ============================================================================
BEGIN;
SELECT 'before' AS phase,(SELECT count(*) FROM public.phrase_explanations WHERE target_lang='read-v1') AS n;

INSERT INTO public.phrase_explanations (phrase, normalized, source_lang, target_lang, explanation) VALUES
  ('footprint', 'footprint', 'en', 'read-v1', '{"ipa":"/ˈfʊtprɪnt/","pos":"n.","word":"footprint","example":{"en":"He left footprints in the wet sand.","cn":"他在湿沙上留下了脚印。"},"gloss_cn":"脚印、足迹","gloss_en":"a mark made by a foot","sense_key":"footprint"}'::jsonb),
  ('freeze', 'freeze', 'en', 'read-v1', '{"ipa":"/friːz/","pos":"v.","word":"freeze","example":{"en":"The lake will freeze in winter.","cn":"湖水到冬天会结冰。"},"gloss_cn":"结冰、冻僵;(freeze!)站住别动","gloss_en":"to turn to ice or become very cold; (freeze!) stop","sense_key":"freeze"}'::jsonb),
  ('frisk', 'frisk', 'en', 'read-v1', '{"ipa":"/frɪsk/","pos":"v.","word":"frisk","example":{"en":"The lambs frisked across the field.","cn":"小羊羔在田野上欢蹦乱跳。"},"gloss_cn":"欢蹦、雀跃;(v.)搜身","gloss_en":"to leap about playfully; (v.) to search someone''''s body","sense_key":"frisk"}'::jsonb),
  ('frost', 'frost', 'en', 'read-v1', '{"ipa":"/frɔːst/","pos":"n.","word":"frost","example":{"en":"Frost covered the grass this morning.","cn":"今早草地上结了霜。"},"gloss_cn":"霜、严寒","gloss_en":"a thin white ice on cold surfaces","sense_key":"frost"}'::jsonb),
  ('gnat', 'gnat', 'en', 'read-v1', '{"ipa":"/næt/","pos":"n.","word":"gnat","example":{"en":"A tiny gnat buzzed near his ear.","cn":"一只小飞虫在他耳边嗡嗡叫。"},"gloss_cn":"蚊蚋、小飞虫","gloss_en":"a very small flying insect","sense_key":"gnat"}'::jsonb),
  ('guest', 'guest', 'en', 'read-v1', '{"ipa":"/ɡest/","pos":"n.","word":"guest","example":{"en":"We had a guest over for dinner.","cn":"我们请了一位客人来吃晚饭。"},"gloss_cn":"客人、宾客","gloss_en":"a person invited to visit","sense_key":"guest"}'::jsonb),
  ('gust', 'gust', 'en', 'read-v1', '{"ipa":"/ɡʌst/","pos":"n.","word":"gust","example":{"en":"A sudden gust blew his hat off.","cn":"一阵狂风把他的帽子吹跑了。"},"gloss_cn":"一阵狂风","gloss_en":"a sudden strong rush of wind","sense_key":"gust"}'::jsonb),
  ('hatch', 'hatch', 'en', 'read-v1', '{"ipa":"/hætʃ/","pos":"v.","word":"hatch","example":{"en":"The chicks will hatch in three weeks.","cn":"小鸡再过三周就会孵出。"},"gloss_cn":"孵化、孵出;(n.)舱口","gloss_en":"to break out of an egg; (n.) a small door or opening","sense_key":"hatch"}'::jsonb),
  ('hazelnut', 'hazelnut', 'en', 'read-v1', '{"ipa":"/ˈheɪzlnʌt/","pos":"n.","word":"hazelnut","example":{"en":"She cracked a hazelnut with her teeth.","cn":"她用牙咬开了一颗榛子。"},"gloss_cn":"榛子","gloss_en":"a small round edible nut","sense_key":"hazelnut"}'::jsonb),
  ('hedgehog', 'hedgehog', 'en', 'read-v1', '{"ipa":"/ˈhedʒhɒɡ/","pos":"n.","word":"hedgehog","example":{"en":"A hedgehog rolled into a spiny ball.","cn":"刺猬蜷成了一个带刺的球。"},"gloss_cn":"刺猬","gloss_en":"a small animal covered with sharp spines","sense_key":"hedgehog"}'::jsonb),
  ('hitting', 'hitting', 'en', 'read-v1', '{"ipa":"/ˈhɪtɪŋ/","pos":"v.","word":"hitting","example":{"en":"The boys were hitting a ball in the yard.","cn":"男孩们在院子里打球。"},"gloss_cn":"打、揍（hit 现在分词）","gloss_en":"striking (present participle of hit)","sense_key":"hit"}'::jsonb),
  ('honey', 'honey', 'en', 'read-v1', '{"ipa":"/ˈhʌni/","pos":"n.","word":"honey","example":{"en":"She spread honey on the warm bread.","cn":"她把蜂蜜抹在热面包上。"},"gloss_cn":"蜂蜜","gloss_en":"a sweet food made by bees","sense_key":"honey"}'::jsonb),
  ('horsefly', 'horsefly', 'en', 'read-v1', '{"ipa":"/ˈhɔːrsflaɪ/","pos":"n.","word":"horsefly","example":{"en":"A horsefly bit the tired ox.","cn":"一只牛虻叮了那头疲惫的牛。"},"gloss_cn":"马蝇、牛虻（叮咬牲畜的大苍蝇）","gloss_en":"a large biting fly that troubles animals","sense_key":"horsefly"}'::jsonb),
  ('imitation', 'imitation', 'en', 'read-v1', '{"ipa":"/ˌɪmɪˈteɪʃn/","pos":"n.","word":"imitation","example":{"en":"His imitation of the teacher made everyone laugh.","cn":"他模仿老师，把大家逗笑了。"},"gloss_cn":"模仿;仿制品","gloss_en":"the act of copying; a copy","sense_key":"imitation"}'::jsonb),
  ('insult', 'insult', 'en', 'read-v1', '{"ipa":"/ˈɪnsʌlt/","pos":"n.","word":"insult","example":{"en":"His rude words were a clear insult.","cn":"他那些粗话分明是种侮辱。"},"gloss_cn":"侮辱、冒犯;(v.)侮辱","gloss_en":"a rude remark; (v.) to offend","sense_key":"insult"}'::jsonb),
  ('limp', 'limp', 'en', 'read-v1', '{"ipa":"/lɪmp/","pos":"v.","word":"limp","example":{"en":"He had to limp home on his hurt foot.","cn":"他只好拖着受伤的脚一瘸一拐地回家。"},"gloss_cn":"跛行、一瘸一拐;(adj.)软弱无力的","gloss_en":"to walk unevenly; (adj.) soft and drooping","sense_key":"limp"}'::jsonb),
  ('lunge', 'lunge', 'en', 'read-v1', '{"ipa":"/lʌndʒ/","pos":"v.","word":"lunge","example":{"en":"The cat lunged at the toy mouse.","cn":"猫朝玩具老鼠猛扑过去。"},"gloss_cn":"猛冲、扑","gloss_en":"to make a sudden forward rush","sense_key":"lunge"}'::jsonb),
  ('manger', 'manger', 'en', 'read-v1', '{"ipa":"/ˈmeɪndʒər/","pos":"n.","word":"manger","example":{"en":"The cattle ate from the wooden manger.","cn":"牛群在木食槽里吃草。"},"gloss_cn":"食槽、马槽（牲口吃草的槽）","gloss_en":"a trough that animals feed from","sense_key":"manger"}'::jsonb),
  ('math', 'math', 'en', 'read-v1', '{"ipa":"/mæθ/","pos":"n.","word":"math","example":{"en":"She is good at math and science.","cn":"她数学和科学都很好。"},"gloss_cn":"数学;(do the math)算一算、盘算","gloss_en":"the study of numbers; (do the math) to work it out","sense_key":"math"}'::jsonb)
ON CONFLICT (normalized, target_lang) DO UPDATE SET phrase=EXCLUDED.phrase, explanation=EXCLUDED.explanation, updated_at=now();

SELECT 'after' AS phase,(SELECT count(*) FROM public.phrase_explanations WHERE target_lang='read-v1') AS n;
COMMIT;
