-- ============================================================================
-- 伊索(aesop) flag 修正 · 第1批 22张旧全局卡(网页版Claude审定·多义并列·主流义居首·IPA保留)。
-- 起因:回读扫描发现全局卡把罕见/错义当默认(frog=剑挂环/ax=询问方言/bill=账单漏喙/goose=傻瓜…)。
-- 跨书反例核查:21/22 旧义在其他书真实用到(ax@Tom方言/frog@Robinson饰环/match@Oz火柴…)→全部并列保留,无替换。
--   唯 bull 旧 adj"雄性的"四本零用例→弃,定 n.公牛。
-- 排序判据:现代英语最高频义居首(非本书义、非跨书频次)。spell/match 已按此调。
-- 幂等 UPDATE。BEGIN/COMMIT + 前后核验。四本共享全局卡 → Oz/Robinson/Tom 同步受益。
-- ============================================================================
BEGIN;

SELECT 'before' AS phase, normalized, explanation->>'pos' AS pos, explanation->>'gloss_cn' AS gloss_cn
  FROM public.phrase_explanations
 WHERE target_lang='read-v1' AND normalized IN ('frog','goose','bat','bull','jar','bill','ax','mercury','swallow','wound','trap','spell','fair','pet','litter','lump','rip','fix','butcher','magic','reflection','match')
 ORDER BY normalized;

UPDATE public.phrase_explanations SET explanation = '{"ipa":"/frɑːɡ/","pos":"n.","word":"frog","example":{"en":"A green frog sat on a lily pad in the pond.","cn":"一只绿青蛙蹲在池塘的睡莲叶上。"},"gloss_cn":"青蛙;(衣带、军服上的)饰环","gloss_en":"a small jumping amphibian; also a decorative loop on a belt or coat","sense_key":"fastening"}'::jsonb
 WHERE normalized = 'frog' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ɡuːs/","pos":"n.","word":"goose","example":{"en":"The white goose waddled across the yard.","cn":"那只白鹅摇摇摆摆地走过院子。"},"gloss_cn":"鹅;(俚)傻瓜","gloss_en":"a large water bird; (informal) a silly person","sense_key":"fool"}'::jsonb
 WHERE normalized = 'goose' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/bæt/","pos":"n.","word":"bat","example":{"en":"A bat flew out of the dark cave at dusk.","cn":"黄昏时一只蝙蝠从漆黑的山洞里飞了出来。"},"gloss_cn":"蝙蝠;球棒、球拍","gloss_en":"a flying night animal; also a club used to hit a ball","sense_key":"bat"}'::jsonb
 WHERE normalized = 'bat' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/bʊl/","pos":"n.","word":"bull","example":{"en":"The bull snorted and pawed at the ground.","cn":"公牛喷着响鼻,用蹄子刨着地。"},"gloss_cn":"公牛","gloss_en":"a male ox or bovine","sense_key":"bull"}'::jsonb
 WHERE normalized = 'bull' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/dʒɑː/","pos":"n.","word":"jar","example":{"en":"She kept the honey in a glass jar.","cn":"她把蜂蜜装在一个玻璃罐里。"},"gloss_cn":"(广口)罐、坛;(v.)震动、颠簸","gloss_en":"a wide-mouthed container; (v.) to jolt or shake","sense_key":"jolt"}'::jsonb
 WHERE normalized = 'jar' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/bɪl/","pos":"n.","word":"bill","example":{"en":"The waiter brought us the bill after dinner.","cn":"晚饭后服务员把账单送了过来。"},"gloss_cn":"账单;(鸟)喙","gloss_en":"a statement of money owed; also a bird''s beak","sense_key":"bill"}'::jsonb
 WHERE normalized = 'bill' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/æks/","pos":"n.","word":"ax","example":{"en":"He split the log with a heavy ax.","cn":"他用一把重斧把木头劈开。"},"gloss_cn":"斧头;(方言)询问","gloss_en":"a tool for chopping wood; (dialect) to ask","sense_key":"ax"}'::jsonb
 WHERE normalized = 'ax' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈmɜːrkjəri/","pos":"n.","word":"mercury","example":{"en":"The old thermometer was filled with mercury.","cn":"那支旧温度计里灌的是水银。"},"gloss_cn":"水银、汞;(Mercury)墨丘利(罗马神信使)","gloss_en":"the liquid metal; (Mercury) the Roman messenger god","sense_key":"mercury"}'::jsonb
 WHERE normalized = 'mercury' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈswɑːloʊ/","pos":"v.","word":"swallow","example":{"en":"He swallowed the medicine in one gulp.","cn":"他一口把药咽了下去。"},"gloss_cn":"吞咽、吞没;(n.)燕子","gloss_en":"to make food go down the throat; to engulf; (n.) a small swift bird","sense_key":"engulf"}'::jsonb
 WHERE normalized = 'swallow' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/wuːnd/","pos":"n.","word":"wound","example":{"en":"A bandage covered the wound on his arm.","cn":"绷带盖住了他手臂上的伤口。"},"gloss_cn":"伤口;(v.)缠绕、卷绕(wind 过去式)","gloss_en":"an injury to the body; (v.) wound around (past of wind)","sense_key":"wrap"}'::jsonb
 WHERE normalized = 'wound' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/træp/","pos":"n.","word":"trap","example":{"en":"The hunter set a trap for the fox.","cn":"猎人给狐狸设了个陷阱。"},"gloss_cn":"陷阱、捕机;活板门","gloss_en":"a device for catching animals; also a trap door","sense_key":"hatch"}'::jsonb
 WHERE normalized = 'trap' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/spɛl/","pos":"v.","word":"spell","example":{"en":"Can you spell your name for me?","cn":"你能把你的名字拼给我听吗?"},"gloss_cn":"拼写;(一段)时期;咒语、魔力","gloss_en":"to name the letters of a word; a period of time; a magic charm","sense_key":"spell"}'::jsonb
 WHERE normalized = 'spell' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/feə(r)/","pos":"adj.","word":"fair","example":{"en":"It is only fair to share the food equally.","cn":"把食物平分才算公平。"},"gloss_cn":"公平的;晴朗的;美丽的;(n.)集市","gloss_en":"just and even-handed; (weather) clear; beautiful; (n.) a fair or market","sense_key":"beautiful"}'::jsonb
 WHERE normalized = 'fair' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/pɛt/","pos":"n.","word":"pet","example":{"en":"Their pet dog follows them everywhere.","cn":"他们的宠物狗到哪儿都跟着。"},"gloss_cn":"宠物;(adj.)偏爱的、心爱的","gloss_en":"a tame animal kept for company; (adj.) favorite","sense_key":"pet"}'::jsonb
 WHERE normalized = 'pet' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈlɪtə(r)/","pos":"n.","word":"litter","example":{"en":"The cat had a litter of five kittens.","cn":"那只猫生了一窝五只小猫。"},"gloss_cn":"一窝(幼崽);(方言)一点点","gloss_en":"the young born at one time to an animal; (dialect) a little","sense_key":"litter"}'::jsonb
 WHERE normalized = 'litter' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/lʌmp/","pos":"n.","word":"lump","example":{"en":"He dropped a lump of sugar into his tea.","cn":"他往茶里放了一块方糖。"},"gloss_cn":"(一)块、团;(v.)勉强忍受","gloss_en":"a solid mass or chunk; (v.) to put up with","sense_key":"lump"}'::jsonb
 WHERE normalized = 'lump' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/rɪp/","pos":"v.","word":"rip","example":{"en":"She tried to rip the paper in half.","cn":"她想把那张纸撕成两半。"},"gloss_cn":"撕、扯;(n.)(口)坏东西、老浪子","gloss_en":"to tear roughly; (n.) a worthless or dissolute person","sense_key":"rip"}'::jsonb
 WHERE normalized = 'rip' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/fɪks/","pos":"v.","word":"fix","example":{"en":"He tried to fix the broken clock.","cn":"他试着修好那只坏了的钟。"},"gloss_cn":"修理、解决;确定、安置;(n.)困境","gloss_en":"to repair or settle; to set in place; (n.) a difficult situation","sense_key":"fix"}'::jsonb
 WHERE normalized = 'fix' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈbʊtʃər/","pos":"n.","word":"butcher","example":{"en":"The butcher wrapped the fresh meat in paper.","cn":"肉贩用纸把新鲜的肉包好。"},"gloss_cn":"屠夫、肉贩;(v.)屠宰、屠杀","gloss_en":"a person who sells meat; (v.) to slaughter","sense_key":"slaughter"}'::jsonb
 WHERE normalized = 'butcher' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈmædʒɪk/","pos":"n.","word":"magic","example":{"en":"The wizard studied ancient magic.","cn":"那个巫师钻研古老的魔法。"},"gloss_cn":"魔法、巫术;(adj.)魔法的、有魔力的","gloss_en":"the power of spells and charms; (adj.) magical","sense_key":"magic"}'::jsonb
 WHERE normalized = 'magic' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/rɪˈflekʃn/","pos":"n.","word":"reflection","example":{"en":"She saw her reflection in the still water.","cn":"她在平静的水面上看见了自己的倒影。"},"gloss_cn":"倒影、映像;沉思、反省","gloss_en":"an image thrown back by a surface; deep or serious thought","sense_key":"reflection"}'::jsonb
 WHERE normalized = 'reflection' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/mætʃ/","pos":"n.","word":"match","example":{"en":"They watched an exciting soccer match.","cn":"他们看了一场精彩的足球比赛。"},"gloss_cn":"比赛;相配、匹敌;火柴","gloss_en":"a contest or game; (v.) to equal or go well with; a fire stick","sense_key":"match-fire"}'::jsonb
 WHERE normalized = 'match' AND target_lang = 'read-v1';

SELECT 'after' AS phase, normalized, explanation->>'pos' AS pos, explanation->>'gloss_cn' AS gloss_cn, explanation->>'ipa' AS ipa
  FROM public.phrase_explanations
 WHERE target_lang='read-v1' AND normalized IN ('frog','goose','bat','bull','jar','bill','ax','mercury','swallow','wound','trap','spell','fair','pet','litter','lump','rip','fix','butcher','magic','reflection','match')
 ORDER BY normalized;

COMMIT;
