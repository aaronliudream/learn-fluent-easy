-- ============================================================================
-- 图书馆点词实词词典卡 · 伊索(aesop) 第1批(20张:19审定真生词 + dive)。CC手写·Web审后跑。
-- dive:供 dove(dive不规则过去式)词干回退落点;dove 已加入 explain-phrase IRREG 映射(⚠️需部署 edge)。dove 本身不造卡。
-- INSERT..ON CONFLICT(normalized,target_lang) 幂等。8字段齐,美音IPA(过 define-words 硬闸)。四本共享 read-v1。
-- ============================================================================
BEGIN;
SELECT 'before' AS phase,(SELECT count(*) FROM public.phrase_explanations WHERE target_lang='read-v1') AS n;

INSERT INTO public.phrase_explanations (phrase, normalized, source_lang, target_lang, explanation) VALUES
  ('donkey', 'donkey', 'en', 'read-v1', '{"ipa":"/ˈdɑːŋki/","pos":"n.","word":"donkey","example":{"en":"The donkey carried heavy bags up the hill.","cn":"驴驮着沉重的袋子上山。"},"gloss_cn":"驴","gloss_en":"a horse-like animal with long ears","sense_key":"donkey"}'::jsonb),
  ('eagle', 'eagle', 'en', 'read-v1', '{"ipa":"/ˈiːɡl/","pos":"n.","word":"eagle","example":{"en":"An eagle circled high above the valley.","cn":"一只鹰在山谷上空盘旋。"},"gloss_cn":"鹰、雕","gloss_en":"a large bird of prey","sense_key":"eagle"}'::jsonb),
  ('stag', 'stag', 'en', 'read-v1', '{"ipa":"/stæɡ/","pos":"n.","word":"stag","example":{"en":"A proud stag stood at the forest''''s edge.","cn":"一头雄鹿傲然立在林边。"},"gloss_cn":"雄鹿","gloss_en":"an adult male deer","sense_key":"stag"}'::jsonb),
  ('pool', 'pool', 'en', 'read-v1', '{"ipa":"/puːl/","pos":"n.","word":"pool","example":{"en":"The children splashed in the shallow pool.","cn":"孩子们在浅水塘里戏水。"},"gloss_cn":"水塘、水池;(v.)汇集","gloss_en":"a small body of still water; (v.) to gather together","sense_key":"pool"}'::jsonb),
  ('cloak', 'cloak', 'en', 'read-v1', '{"ipa":"/kloʊk/","pos":"n.","word":"cloak","example":{"en":"She wrapped a warm cloak around her shoulders.","cn":"她把暖和的斗篷裹在肩上。"},"gloss_cn":"斗篷、披风","gloss_en":"a loose sleeveless outer garment","sense_key":"cloak"}'::jsonb),
  ('satyr', 'satyr', 'en', 'read-v1', '{"ipa":"/ˈseɪtər/","pos":"n.","word":"satyr","example":{"en":"In the old tale, a satyr danced through the woods.","cn":"古老的故事里，一个萨梯在林间起舞。"},"gloss_cn":"萨梯（希腊神话半人半羊的林间精灵）","gloss_en":"a woodland god in Greek myth, half man and half goat","sense_key":"satyr"}'::jsonb),
  ('thief', 'thief', 'en', 'read-v1', '{"ipa":"/θiːf/","pos":"n.","word":"thief","example":{"en":"The thief slipped away before anyone noticed.","cn":"贼在被人发觉前溜走了。"},"gloss_cn":"小偷、贼","gloss_en":"a person who steals","sense_key":"thief"}'::jsonb),
  ('vineyard', 'vineyard', 'en', 'read-v1', '{"ipa":"/ˈvɪnjərd/","pos":"n.","word":"vineyard","example":{"en":"Grapes grew in long rows across the vineyard.","cn":"葡萄一排排长满了葡萄园。"},"gloss_cn":"葡萄园","gloss_en":"a field where grapes are grown","sense_key":"vineyard"}'::jsonb),
  ('anger', 'anger', 'en', 'read-v1', '{"ipa":"/ˈæŋɡər/","pos":"n.","word":"anger","example":{"en":"He tried to hide his anger, but his face turned red.","cn":"他想掩住怒气，脸却红了。"},"gloss_cn":"愤怒、怒气","gloss_en":"a strong feeling of being upset or annoyed","sense_key":"anger"}'::jsonb),
  ('antlers', 'antlers', 'en', 'read-v1', '{"ipa":"/ˈæntlərz/","pos":"n.","word":"antlers","example":{"en":"The deer''''s antlers spread wide like branches.","cn":"那鹿的角像树枝一样张开。"},"gloss_cn":"鹿角（雄鹿分叉的角）","gloss_en":"the branched horns of a deer","sense_key":"antler"}'::jsonb),
  ('boar', 'boar', 'en', 'read-v1', '{"ipa":"/bɔːr/","pos":"n.","word":"boar","example":{"en":"A wild boar crashed through the bushes.","cn":"一头野猪从灌木丛里冲了出来。"},"gloss_cn":"野猪","gloss_en":"a wild pig","sense_key":"boar"}'::jsonb),
  ('hay', 'hay', 'en', 'read-v1', '{"ipa":"/heɪ/","pos":"n.","word":"hay","example":{"en":"The farmer stacked the hay in the barn.","cn":"农夫把干草堆在谷仓里。"},"gloss_cn":"干草","gloss_en":"dried grass used to feed animals","sense_key":"hay"}'::jsonb),
  ('jackdaw', 'jackdaw', 'en', 'read-v1', '{"ipa":"/ˈdʒækdɔː/","pos":"n.","word":"jackdaw","example":{"en":"A jackdaw is a small bird in the crow family.","cn":"寒鸦是鸦科的一种小鸟。"},"gloss_cn":"寒鸦（鸦科的一种小型黑鸟）","gloss_en":"a small black bird of the crow family","sense_key":"jackdaw"}'::jsonb),
  ('shepherd', 'shepherd', 'en', 'read-v1', '{"ipa":"/ˈʃepərd/","pos":"n.","word":"shepherd","example":{"en":"The shepherd led his flock across the field.","cn":"牧羊人赶着羊群穿过田野。"},"gloss_cn":"牧羊人","gloss_en":"a person who tends sheep","sense_key":"shepherd"}'::jsonb),
  ('crab', 'crab', 'en', 'read-v1', '{"ipa":"/kræb/","pos":"n.","word":"crab","example":{"en":"A crab scuttled sideways along the beach.","cn":"一只螃蟹在沙滩上横着爬。"},"gloss_cn":"螃蟹","gloss_en":"a sea animal with a hard shell and claws","sense_key":"crab"}'::jsonb),
  ('cub', 'cub', 'en', 'read-v1', '{"ipa":"/kʌb/","pos":"n.","word":"cub","example":{"en":"The lion cub played near its mother.","cn":"幼狮在母亲身边玩耍。"},"gloss_cn":"（狮、狼、熊等的）幼崽","gloss_en":"the young of a lion, wolf, bear, and the like","sense_key":"cub"}'::jsonb),
  ('fee', 'fee', 'en', 'read-v1', '{"ipa":"/fiː/","pos":"n.","word":"fee","example":{"en":"The guide asked a small fee for the tour.","cn":"向导为这趟游要了一点酬金。"},"gloss_cn":"费用、酬金","gloss_en":"money paid for a service","sense_key":"fee"}'::jsonb),
  ('graze', 'graze', 'en', 'read-v1', '{"ipa":"/ɡreɪz/","pos":"v.","word":"graze","example":{"en":"Cows graze in the meadow all afternoon.","cn":"牛群整个下午在草地上吃草。"},"gloss_cn":"（牲畜）吃草、放牧","gloss_en":"(of animals) to eat grass in a field","sense_key":"graze"}'::jsonb),
  ('hired', 'hired', 'en', 'read-v1', '{"ipa":"/ˈhaɪərd/","pos":"v.","word":"hired","example":{"en":"The store hired three new workers for the holidays.","cn":"店里为假期雇了三个新员工。"},"gloss_cn":"雇用;租用（hire 过去式）","gloss_en":"employed for pay; also rented (past of hire)","sense_key":"hire"}'::jsonb),
  ('dive', 'dive', 'en', 'read-v1', '{"ipa":"/daɪv/","pos":"v.","word":"dive","example":{"en":"The boy learned to dive into the deep end.","cn":"男孩学会了从深水区跳水。"},"gloss_cn":"潜水、跳水;俯冲","gloss_en":"to plunge headfirst into water; to plunge down","sense_key":"dive"}'::jsonb)
ON CONFLICT (normalized, target_lang) DO UPDATE SET phrase=EXCLUDED.phrase, explanation=EXCLUDED.explanation, updated_at=now();

SELECT 'after' AS phase,(SELECT count(*) FROM public.phrase_explanations WHERE target_lang='read-v1') AS n;
COMMIT;
