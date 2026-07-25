-- ============================================================================
-- 图书馆点词实词词典卡 · 伊索(aesop) 第5批(19张·CC自审)。判据:现代最高频义居首/解释性gloss/例句演居首义/屈折并卡。
-- 屈折并:pebbles→pebble,outnumbered→outnumber,pleading→plead,pounced→pounce。查现有卡:全19无卡无撞车。
-- 多义自决:nerve=神经;胆量、plead=恳求;辩护、preen=梳羽;打扮——均主义居首。0处需Aaron裁。
-- INSERT..ON CONFLICT 幂等。8字段齐,美音IPA。四本共享 read-v1。
-- ============================================================================
BEGIN;
SELECT 'before' AS phase,(SELECT count(*) FROM public.phrase_explanations WHERE target_lang='read-v1') AS n;

INSERT INTO public.phrase_explanations (phrase, normalized, source_lang, target_lang, explanation) VALUES
  ('mire', 'mire', 'en', 'read-v1', '{"ipa":"/ˈmaɪər/","pos":"n.","word":"mire","example":{"en":"The cart got stuck in the deep mire.","cn":"车陷进了深深的泥潭里。"},"gloss_cn":"泥潭、烂泥、沼泽","gloss_en":"an area of deep mud","sense_key":"mire"}'::jsonb),
  ('mix', 'mix', 'en', 'read-v1', '{"ipa":"/mɪks/","pos":"v.","word":"mix","example":{"en":"Mix the flour with water to make dough.","cn":"把面粉和水混合做成面团。"},"gloss_cn":"混合、搅拌","gloss_en":"to combine things together","sense_key":"mix"}'::jsonb),
  ('nerve', 'nerve', 'en', 'read-v1', '{"ipa":"/nɜːrv/","pos":"n.","word":"nerve","example":{"en":"It took real nerve to speak up.","cn":"站出来说话是需要胆量的。"},"gloss_cn":"神经;胆量、勇气","gloss_en":"a body fiber that carries feeling; also courage","sense_key":"nerve"}'::jsonb),
  ('nightingale', 'nightingale', 'en', 'read-v1', '{"ipa":"/ˈnaɪtɪŋɡeɪl/","pos":"n.","word":"nightingale","example":{"en":"The nightingale sang sweetly at night.","cn":"夜莺在夜里婉转地歌唱。"},"gloss_cn":"夜莺","gloss_en":"a small bird known for its beautiful song","sense_key":"nightingale"}'::jsonb),
  ('outnumber', 'outnumber', 'en', 'read-v1', '{"ipa":"/ˌaʊtˈnʌmbər/","pos":"v.","word":"outnumber","example":{"en":"The sheep outnumber the people in that valley.","cn":"那山谷里羊比人多。"},"gloss_cn":"数量上超过、多于","gloss_en":"to be more in number than","sense_key":"outnumber"}'::jsonb),
  ('pantry', 'pantry', 'en', 'read-v1', '{"ipa":"/ˈpæntri/","pos":"n.","word":"pantry","example":{"en":"She kept the jars in the pantry.","cn":"她把罐子放在食品储藏室里。"},"gloss_cn":"食品储藏室","gloss_en":"a small room for storing food","sense_key":"pantry"}'::jsonb),
  ('peacock', 'peacock', 'en', 'read-v1', '{"ipa":"/ˈpiːkɒk/","pos":"n.","word":"peacock","example":{"en":"The peacock spread its bright tail.","cn":"孔雀展开了它艳丽的尾巴。"},"gloss_cn":"孔雀","gloss_en":"a large bird with a showy tail","sense_key":"peacock"}'::jsonb),
  ('pebble', 'pebble', 'en', 'read-v1', '{"ipa":"/ˈpebl/","pos":"n.","word":"pebble","example":{"en":"He skipped a flat pebble across the pond.","cn":"他把一块扁卵石打着水漂扔过池塘。"},"gloss_cn":"小卵石、鹅卵石","gloss_en":"a small smooth stone","sense_key":"pebble"}'::jsonb),
  ('peddler', 'peddler', 'en', 'read-v1', '{"ipa":"/ˈpedlər/","pos":"n.","word":"peddler","example":{"en":"The peddler sold pins and ribbons door to door.","cn":"货郎挨家挨户卖别针和缎带。"},"gloss_cn":"小贩、货郎","gloss_en":"a person who sells small goods from place to place","sense_key":"peddler"}'::jsonb),
  ('piper', 'piper', 'en', 'read-v1', '{"ipa":"/ˈpaɪpər/","pos":"n.","word":"piper","example":{"en":"The piper played a lively tune.","cn":"吹笛人吹起一支欢快的曲子。"},"gloss_cn":"吹笛人、风笛手","gloss_en":"a person who plays a pipe or bagpipes","sense_key":"piper"}'::jsonb),
  ('plead', 'plead', 'en', 'read-v1', '{"ipa":"/pliːd/","pos":"v.","word":"plead","example":{"en":"She pleaded with them to stay.","cn":"她恳求他们留下来。"},"gloss_cn":"恳求、央求;(法律)辩护、认罪","gloss_en":"to beg earnestly; (law) to argue a case","sense_key":"plead"}'::jsonb),
  ('pointless', 'pointless', 'en', 'read-v1', '{"ipa":"/ˈpɔɪntləs/","pos":"adj.","word":"pointless","example":{"en":"Arguing with him was pointless.","cn":"跟他争辩是徒劳的。"},"gloss_cn":"无意义的、徒劳的","gloss_en":"having no purpose; useless","sense_key":"pointless"}'::jsonb),
  ('pottery', 'pottery', 'en', 'read-v1', '{"ipa":"/ˈpɒtəri/","pos":"n.","word":"pottery","example":{"en":"The shelf was full of hand-made pottery.","cn":"架子上摆满了手工陶器。"},"gloss_cn":"陶器","gloss_en":"pots and dishes made from clay","sense_key":"pottery"}'::jsonb),
  ('pounce', 'pounce', 'en', 'read-v1', '{"ipa":"/paʊns/","pos":"v.","word":"pounce","example":{"en":"The cat pounced on the mouse.","cn":"猫猛扑向老鼠。"},"gloss_cn":"猛扑、突袭","gloss_en":"to jump suddenly to attack","sense_key":"pounce"}'::jsonb),
  ('pour', 'pour', 'en', 'read-v1', '{"ipa":"/pɔːr/","pos":"v.","word":"pour","example":{"en":"She poured milk into the glass.","cn":"她把牛奶倒进杯子里。"},"gloss_cn":"倒、灌、倾泻","gloss_en":"to make liquid flow out","sense_key":"pour"}'::jsonb),
  ('predator', 'predator', 'en', 'read-v1', '{"ipa":"/ˈpredətər/","pos":"n.","word":"predator","example":{"en":"The lion is a fierce predator.","cn":"狮子是凶猛的捕食者。"},"gloss_cn":"捕食者、食肉动物","gloss_en":"an animal that hunts others for food","sense_key":"predator"}'::jsonb),
  ('preen', 'preen', 'en', 'read-v1', '{"ipa":"/priːn/","pos":"v.","word":"preen","example":{"en":"The bird preened its feathers in the sun.","cn":"那只鸟在阳光下梳理羽毛。"},"gloss_cn":"(鸟)整理羽毛;(人)精心打扮","gloss_en":"(of a bird) to clean its feathers; (of a person) to groom proudly","sense_key":"preen"}'::jsonb),
  ('reassure', 'reassure', 'en', 'read-v1', '{"ipa":"/ˌriːəˈʃʊr/","pos":"v.","word":"reassure","example":{"en":"He reassured her that all was well.","cn":"他安慰她说一切都好。"},"gloss_cn":"使安心、宽慰","gloss_en":"to comfort and remove worry","sense_key":"reassure"}'::jsonb),
  ('rooster', 'rooster', 'en', 'read-v1', '{"ipa":"/ˈruːstər/","pos":"n.","word":"rooster","example":{"en":"The rooster crowed at dawn.","cn":"公鸡在黎明时打鸣。"},"gloss_cn":"公鸡","gloss_en":"an adult male chicken","sense_key":"rooster"}'::jsonb)
ON CONFLICT (normalized, target_lang) DO UPDATE SET phrase=EXCLUDED.phrase, explanation=EXCLUDED.explanation, updated_at=now();

SELECT 'after' AS phase,(SELECT count(*) FROM public.phrase_explanations WHERE target_lang='read-v1') AS n;
COMMIT;
