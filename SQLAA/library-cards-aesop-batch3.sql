-- ============================================================================
-- 图书馆点词实词词典卡 · 伊索(aesop) 第3批(20张·×1频次)。CC手写·Web审通过。
-- 易错义名词居首+次义并列(coast+滑行/fawn+讨好/driver兼赶牲口);figs→fig/fledglings→fledgling造词根。
-- 专名扫描:全书零漏网,专名维持5个。INSERT..ON CONFLICT 幂等。8字段齐,美音IPA。四本共享 read-v1。
-- ============================================================================
BEGIN;
SELECT 'before' AS phase,(SELECT count(*) FROM public.phrase_explanations WHERE target_lang='read-v1') AS n;

INSERT INTO public.phrase_explanations (phrase, normalized, source_lang, target_lang, explanation) VALUES
  ('churn', 'churn', 'en', 'read-v1', '{"ipa":"/tʃɜːrn/","pos":"v.","word":"churn","example":{"en":"She had to churn the cream for an hour.","cn":"她得把奶油搅上一个钟头。"},"gloss_cn":"搅拌（把奶油搅成黄油）;(n.)搅乳器","gloss_en":"to stir cream into butter; (n.) a butter-making container","sense_key":"churn"}'::jsonb),
  ('clever', 'clever', 'en', 'read-v1', '{"ipa":"/ˈklevər/","pos":"adj.","word":"clever","example":{"en":"The clever fox found a way out.","cn":"聪明的狐狸找到了出路。"},"gloss_cn":"聪明的、机灵的","gloss_en":"quick to understand; smart","sense_key":"clever"}'::jsonb),
  ('coast', 'coast', 'en', 'read-v1', '{"ipa":"/koʊst/","pos":"n.","word":"coast","example":{"en":"They walked along the rocky coast.","cn":"他们沿着多石的海岸走。"},"gloss_cn":"海岸、海滨;(v.)滑行","gloss_en":"the land beside the sea; (v.) to move without power","sense_key":"coast"}'::jsonb),
  ('coax', 'coax', 'en', 'read-v1', '{"ipa":"/koʊks/","pos":"v.","word":"coax","example":{"en":"She tried to coax the cat out from under the bed.","cn":"她试着把猫从床底下哄出来。"},"gloss_cn":"哄、劝诱","gloss_en":"to gently persuade","sense_key":"coax"}'::jsonb),
  ('contest', 'contest', 'en', 'read-v1', '{"ipa":"/ˈkɑːntest/","pos":"n.","word":"contest","example":{"en":"He won first place in the singing contest.","cn":"他在歌唱比赛中得了第一。"},"gloss_cn":"比赛、竞赛","gloss_en":"a competition","sense_key":"contest"}'::jsonb),
  ('cottager', 'cottager', 'en', 'read-v1', '{"ipa":"/ˈkɑːtɪdʒər/","pos":"n.","word":"cottager","example":{"en":"The cottager grew vegetables behind his house.","cn":"那个村舍农户在屋后种菜。"},"gloss_cn":"住小农舍的人、村舍农户","gloss_en":"a person who lives in a small country house","sense_key":"cottager"}'::jsonb),
  ('crier', 'crier', 'en', 'read-v1', '{"ipa":"/ˈkraɪər/","pos":"n.","word":"crier","example":{"en":"The town crier read the news aloud in the square.","cn":"宣令官在广场上大声念出消息。"},"gloss_cn":"宣令官（旧时沿街高声通告的人）","gloss_en":"an official who shouts out public news","sense_key":"crier"}'::jsonb),
  ('delegation', 'delegation', 'en', 'read-v1', '{"ipa":"/ˌdeləˈɡeɪʃn/","pos":"n.","word":"delegation","example":{"en":"A delegation was sent to speak with the king.","cn":"一个代表团被派去和国王交涉。"},"gloss_cn":"代表团","gloss_en":"a group sent to represent others","sense_key":"delegation"}'::jsonb),
  ('disarmed', 'disarmed', 'en', 'read-v1', '{"ipa":"/dɪsˈɑːrmd/","pos":"v.","word":"disarmed","example":{"en":"The soldiers were disarmed at the border.","cn":"士兵们在边境被缴了械。"},"gloss_cn":"解除武装、缴械（disarm过去式）","gloss_en":"had weapons taken away (past of disarm)","sense_key":"disarm"}'::jsonb),
  ('dissolved', 'dissolved', 'en', 'read-v1', '{"ipa":"/dɪˈzɑːlvd/","pos":"v.","word":"dissolved","example":{"en":"The sugar dissolved quickly in the hot tea.","cn":"糖在热茶里很快溶化了。"},"gloss_cn":"溶解（dissolve过去式）","gloss_en":"melted into a liquid (past of dissolve)","sense_key":"dissolve"}'::jsonb),
  ('doe', 'doe', 'en', 'read-v1', '{"ipa":"/doʊ/","pos":"n.","word":"doe","example":{"en":"A gentle doe watched over her fawn.","cn":"一只温顺的母鹿守着她的小鹿。"},"gloss_cn":"母鹿","gloss_en":"a female deer","sense_key":"doe"}'::jsonb),
  ('drab', 'drab', 'en', 'read-v1', '{"ipa":"/dræb/","pos":"adj.","word":"drab","example":{"en":"The room had drab gray walls.","cn":"房间里是单调的灰墙。"},"gloss_cn":"单调的、灰暗的","gloss_en":"dull and lacking color","sense_key":"drab"}'::jsonb),
  ('driver', 'driver', 'en', 'read-v1', '{"ipa":"/ˈdraɪvər/","pos":"n.","word":"driver","example":{"en":"The bus driver waited at the stop.","cn":"公交司机在站点等候。"},"gloss_cn":"司机、驾驶员;赶车（赶牲口）的人","gloss_en":"a person who drives a vehicle or animals","sense_key":"driver"}'::jsonb),
  ('dusty', 'dusty', 'en', 'read-v1', '{"ipa":"/ˈdʌsti/","pos":"adj.","word":"dusty","example":{"en":"The old books were dusty and worn.","cn":"那些旧书满是灰尘、破旧不堪。"},"gloss_cn":"满是灰尘的","gloss_en":"covered with dust","sense_key":"dusty"}'::jsonb),
  ('envious', 'envious', 'en', 'read-v1', '{"ipa":"/ˈenviəs/","pos":"adj.","word":"envious","example":{"en":"She was envious of her friend''''s new bike.","cn":"她羡慕朋友的新自行车。"},"gloss_cn":"嫉妒的、羡慕的","gloss_en":"wishing you had what someone else has","sense_key":"envious"}'::jsonb),
  ('farmyard', 'farmyard', 'en', 'read-v1', '{"ipa":"/ˈfɑːrmjɑːrd/","pos":"n.","word":"farmyard","example":{"en":"Chickens pecked around the farmyard.","cn":"鸡在农家院子里啄食。"},"gloss_cn":"农家院子、农场空地","gloss_en":"the yard around farm buildings","sense_key":"farmyard"}'::jsonb),
  ('fawn', 'fawn', 'en', 'read-v1', '{"ipa":"/fɔːn/","pos":"n.","word":"fawn","example":{"en":"A spotted fawn hid in the tall grass.","cn":"一只带斑点的小鹿藏在高草里。"},"gloss_cn":"小鹿、幼鹿;(v.)讨好、奉承","gloss_en":"a young deer; (v.) to flatter","sense_key":"fawn"}'::jsonb),
  ('fig', 'fig', 'en', 'read-v1', '{"ipa":"/fɪɡ/","pos":"n.","word":"fig","example":{"en":"He picked a ripe fig from the tree.","cn":"他从树上摘了一个熟无花果。"},"gloss_cn":"无花果","gloss_en":"a soft sweet fruit","sense_key":"fig"}'::jsonb),
  ('fledgling', 'fledgling', 'en', 'read-v1', '{"ipa":"/ˈfledʒlɪŋ/","pos":"n.","word":"fledgling","example":{"en":"The fledgling flapped its wings at the nest''''s edge.","cn":"雏鸟在巢边拍打翅膀。"},"gloss_cn":"雏鸟（刚长羽毛、初学飞的幼鸟）","gloss_en":"a young bird just learning to fly","sense_key":"fledgling"}'::jsonb),
  ('fletched', 'fletched', 'en', 'read-v1', '{"ipa":"/fletʃt/","pos":"adj.","word":"fletched","example":{"en":"The arrow was fletched with three feathers.","cn":"那支箭尾装着三片翎羽。"},"gloss_cn":"（箭尾）装有翎羽的","gloss_en":"(of an arrow) fitted with feathers","sense_key":"fletch"}'::jsonb)
ON CONFLICT (normalized, target_lang) DO UPDATE SET phrase=EXCLUDED.phrase, explanation=EXCLUDED.explanation, updated_at=now();

SELECT 'after' AS phase,(SELECT count(*) FROM public.phrase_explanations WHERE target_lang='read-v1') AS n;
COMMIT;
