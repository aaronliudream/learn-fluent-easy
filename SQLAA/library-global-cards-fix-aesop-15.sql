-- ============================================================================
-- 伊索(aesop)15 张旧全局卡修正(网页版Claude审定·全B改全局主流义·多义并列·IPA保留不动)。
-- 起因:全局旧卡把罕见/次要义当默认(race=种族/fast=熟睡/bit=一点点/sweet=悦耳/want=缺乏…),读者读错整句。
-- 0 张新建A:want的Robinson覆盖(缺乏)已在library_word_senses,全局改想要后鲁滨逊自动仍读旧义。
-- 幂等 UPDATE 现卡。BEGIN/COMMIT + 前后核验。四本共享全局卡 → Oz/Robinson/Tom 同步受益。
-- ============================================================================
BEGIN;

SELECT 'before' AS phase, normalized, explanation->>'pos' AS pos, explanation->>'gloss_cn' AS gloss_cn
  FROM public.phrase_explanations WHERE target_lang='read-v1' AND normalized IN ('race','fast','want','bit','passed','sweet','steady','saved','tried','hard','full','look','missed','reach','get') ORDER BY normalized;

UPDATE public.phrase_explanations SET explanation = '{"ipa":"/reɪs/","pos":"n.","word":"race","example":{"en":"They ran a race around the playground.","cn":"他们绕着操场赛跑。"},"gloss_cn":"赛跑、比赛;(人种)种族","gloss_en":"a running contest; also a people or ethnic group","sense_key":"race"}'::jsonb
 WHERE normalized = 'race' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/fæst/","pos":"adv.","word":"fast","example":{"en":"The rabbit ran very fast.","cn":"兔子跑得非常快。"},"gloss_cn":"快、迅速地;(fast asleep)酣睡地","gloss_en":"quickly; (fast asleep) deeply","sense_key":"fast"}'::jsonb
 WHERE normalized = 'fast' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/wɑːnt/","pos":"v.","word":"want","example":{"en":"The children want a new ball.","cn":"孩子们想要一个新球。"},"gloss_cn":"想要、希望","gloss_en":"to wish for or desire","sense_key":"want"}'::jsonb
 WHERE normalized = 'want' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/bɪt/","pos":"v.","word":"bit","example":{"en":"The dog bit the bone hard.","cn":"狗狠狠咬住骨头。"},"gloss_cn":"咬(bite 过去式);(a bit)一点点","gloss_en":"bit (past of bite); also a small amount","sense_key":"bite"}'::jsonb
 WHERE normalized = 'bit' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/pæst/","pos":"v.","word":"passed","example":{"en":"We passed a small shop on the way.","cn":"我们路上经过一家小店。"},"gloss_cn":"经过、超过;(时间)流逝","gloss_en":"passed by; (of time) went by","sense_key":"pass"}'::jsonb
 WHERE normalized = 'passed' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/swiːt/","pos":"adj.","word":"sweet","example":{"en":"The ripe peach was very sweet.","cn":"熟透的桃子很甜。"},"gloss_cn":"甜的;悦耳的、温柔的","gloss_en":"sweet in taste; also pleasant or gentle","sense_key":"sweet"}'::jsonb
 WHERE normalized = 'sweet' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈstedi/","pos":"adj.","word":"steady","example":{"en":"Keep a steady pace and you''ll finish.","cn":"保持稳健的步子,你就能走完。"},"gloss_cn":"稳健的、沉稳的;(v.)使稳定","gloss_en":"steady, firm; to make steady","sense_key":"steady"}'::jsonb
 WHERE normalized = 'steady' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/seɪvd/","pos":"v.","word":"saved","example":{"en":"She saved some bread for later.","cn":"她留了些面包待会儿吃。"},"gloss_cn":"储存、留存;救、拯救","gloss_en":"saved or stored up; also rescued","sense_key":"save"}'::jsonb
 WHERE normalized = 'saved' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈtraɪd/","pos":"v.","word":"tried","example":{"en":"He tried to open the jar.","cn":"他试着打开罐子。"},"gloss_cn":"尝试、试图;(try on)试穿","gloss_en":"tried, attempted; also tried on","sense_key":"try"}'::jsonb
 WHERE normalized = 'tried' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/hɑːrd/","pos":"adj.","word":"hard","example":{"en":"The winter was long and hard.","cn":"那个冬天又长又苦。"},"gloss_cn":"艰难的、艰苦的;(adv.)努力地、用力地","gloss_en":"hard, difficult; also with effort","sense_key":"hard"}'::jsonb
 WHERE normalized = 'hard' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/fʊl/","pos":"adj.","word":"full","example":{"en":"The basket was full of apples.","cn":"篮子装满了苹果。"},"gloss_cn":"满的、充满的;(吃)饱的","gloss_en":"full; also having eaten enough","sense_key":"full"}'::jsonb
 WHERE normalized = 'full' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/lʊk/","pos":"v.","word":"look","example":{"en":"The sky looks dark before the rain.","cn":"下雨前天色看起来很暗。"},"gloss_cn":"看、瞧;看起来、显得(look + adj.)","gloss_en":"to look; also to seem or appear","sense_key":"look"}'::jsonb
 WHERE normalized = 'look' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/mɪst/","pos":"v.","word":"missed","example":{"en":"He threw the ball but missed.","cn":"他扔了球,却没投中。"},"gloss_cn":"没击中、没够到;错过","gloss_en":"missed a target; also missed out on","sense_key":"miss"}'::jsonb
 WHERE normalized = 'missed' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/riːtʃ/","pos":"v.","word":"reach","example":{"en":"She stretched to reach the top shelf.","cn":"她伸手去够最高一层的架子。"},"gloss_cn":"够到、触及;到达","gloss_en":"to reach or touch; to arrive at","sense_key":"reach"}'::jsonb
 WHERE normalized = 'reach' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ɡɛt/","pos":"v.","word":"get","example":{"en":"Water helps the plant get strong.","cn":"水帮助植物长壮。"},"gloss_cn":"得到、获得;变得(get+形容词);挣脱、脱身(get free/out)","gloss_en":"to get or obtain; to become; to break free","sense_key":"get"}'::jsonb
 WHERE normalized = 'get' AND target_lang = 'read-v1';

SELECT 'after' AS phase, normalized, explanation->>'pos' AS pos, explanation->>'gloss_cn' AS gloss_cn
  FROM public.phrase_explanations WHERE target_lang='read-v1' AND normalized IN ('race','fast','want','bit','passed','sweet','steady','saved','tried','hard','full','look','missed','reach','get') ORDER BY normalized;

COMMIT;
