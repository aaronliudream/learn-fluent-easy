-- ============================================================================
-- 伊索(aesop) flag 修正 · 第3批(Tier A 收尾)26张旧全局卡(网页版Claude审定·多义并列·现代最高频义居首·IPA保留)。
-- 本批过半为"补义不纠错":旧卡义在别的书真用(wrung/blind/strip/drag/dragging/dropping/calling/cursed/short/fill)→保留+补伊索义。
-- Aaron 定:loads"许多"居首(复数形态最高频)/mind补动词"当心"/claim补名词"索赔"。pick抓到Tom名词"镐"。
-- 幂等 UPDATE。BEGIN/COMMIT + 前后核验。四本共享全局卡。至此 Tier A 全清(22+21+26=69)。
-- ============================================================================
BEGIN;

SELECT 'before' AS phase, normalized, explanation->>'pos' AS pos, explanation->>'gloss_cn' AS gloss_cn
  FROM public.phrase_explanations
 WHERE target_lang='read-v1' AND normalized IN ('loads','passing','walks','wanting','winning','wrung','roasted','running','blind','strip','drag','dragging','dropping','calling','stand','fill','points','business','mind','turn','laying','cursed','claim','pick','point','short')
 ORDER BY normalized;

UPDATE public.phrase_explanations SET explanation = '{"ipa":"/loʊdz/","pos":"n.","word":"loads","example":{"en":"There were loads of people at the fair.","cn":"集市上有好多人。"},"gloss_cn":"许多、大量;(一件件)货物、负载","gloss_en":"(loads of) a great many; (n.) loads or burdens","sense_key":"loads"}'::jsonb
 WHERE normalized = 'loads' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈpæsɪŋ/","pos":"v.","word":"passing","example":{"en":"A car came passing by the gate.","cn":"一辆车从门前经过。"},"gloss_cn":"经过、路过;(时间/事物的)流逝、消逝","gloss_en":"passing by; the passing of time or a thing","sense_key":"end"}'::jsonb
 WHERE normalized = 'passing' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈwɔːks/","pos":"v.","word":"walks","example":{"en":"She walks to school every morning.","cn":"她每天早上走路上学。"},"gloss_cn":"走、行走;散步、步道(n);(walks of life)阶层、领域","gloss_en":"to walk; a walk or path; (walks of life) social classes","sense_key":"walks"}'::jsonb
 WHERE normalized = 'walks' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈwɑntɪŋ/","pos":"v.","word":"wanting","example":{"en":"The child was wanting a new toy.","cn":"那孩子想要一个新玩具。"},"gloss_cn":"想要(want 现在分词);缺少的、欠缺的","gloss_en":"wanting or wishing; (found wanting) lacking","sense_key":"wanting"}'::jsonb
 WHERE normalized = 'wanting' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈwɪnɪŋ/","pos":"v.","word":"winning","example":{"en":"Our team is winning the match.","cn":"我们队正赢得这场比赛。"},"gloss_cn":"获胜、赢;赢得(人心);迷人的(winning ways)","gloss_en":"winning a game; winning someone over; (winning ways) charming","sense_key":"winning"}'::jsonb
 WHERE normalized = 'winning' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/rʌŋ/","pos":"v.","word":"wrung","example":{"en":"She wrung the water out of the towel.","cn":"她把毛巾里的水拧了出来。"},"gloss_cn":"拧、绞、扭断(wring 过去式);发出(声响)","gloss_en":"wrung (past of wring); also drew out (a sound)","sense_key":"wrung"}'::jsonb
 WHERE normalized = 'wrung' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈroʊstɪd/","pos":"v.","word":"roasted","example":{"en":"They roasted the meat over the fire.","cn":"他们把肉架在火上烤。"},"gloss_cn":"烤、烘烤;(俚)严厉斥责、整治","gloss_en":"roasted or baked; (slang) scolded harshly","sense_key":"roasted"}'::jsonb
 WHERE normalized = 'roasted' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈrʌnɪŋ/","pos":"v.","word":"running","example":{"en":"The dog came running toward us.","cn":"那条狗朝我们跑了过来。"},"gloss_cn":"跑、奔跑;延伸、穿过;流动","gloss_en":"running or racing; extending through; flowing","sense_key":"extend"}'::jsonb
 WHERE normalized = 'running' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/blaɪnd/","pos":"adj.","word":"blind","example":{"en":"The old dog was almost blind.","cn":"那条老狗几乎瞎了。"},"gloss_cn":"瞎的、失明的;盲目的;(v.)使失明","gloss_en":"unable to see; without judgment; (v.) to make blind","sense_key":"blind"}'::jsonb
 WHERE normalized = 'blind' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/strɪp/","pos":"v.","word":"strip","example":{"en":"They stripped the bark off the tree.","cn":"他们把树皮剥了下来。"},"gloss_cn":"剥去、脱去;长条、窄带(n)","gloss_en":"to strip or peel off; (n.) a narrow band","sense_key":"strip"}'::jsonb
 WHERE normalized = 'strip' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/dræɡ/","pos":"v.","word":"drag","example":{"en":"He had to drag the heavy sack home.","cn":"他只好把那袋重物拖回家。"},"gloss_cn":"拖、拽;(时间/谈话)变得拖沓、无趣","gloss_en":"to drag or pull; (of time/talk) to drag on dully","sense_key":"drag"}'::jsonb
 WHERE normalized = 'drag' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈdræɡɪŋ/","pos":"v.","word":"dragging","example":{"en":"He walked off, dragging his cargo behind him.","cn":"他走了，身后拖着货物。"},"gloss_cn":"拖、拖着;(时间)缓慢拖沓;(dragging a river)拖网打捞","gloss_en":"dragging or pulling; dragging on slowly; dredging a river","sense_key":"dragging"}'::jsonb
 WHERE normalized = 'dragging' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈdrɑːpɪŋ/","pos":"v.","word":"dropping","example":{"en":"She kept dropping coins into the jar.","cn":"她不停地往罐子里投硬币。"},"gloss_cn":"落下、丢下、投;滴落;(drop in)顺便造访","gloss_en":"dropping or letting fall; dripping; (drop in) to visit","sense_key":"dropping"}'::jsonb
 WHERE normalized = 'dropping' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈkɔlɪŋ/","pos":"v.","word":"calling","example":{"en":"I heard someone calling my name.","cn":"我听见有人在喊我的名字。"},"gloss_cn":"呼喊、召唤;称呼、叫作;(n.)职业、使命","gloss_en":"calling out; naming someone; (n.) a vocation","sense_key":"name"}'::jsonb
 WHERE normalized = 'calling' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/stænd/","pos":"v.","word":"stand","example":{"en":"Please stand by the door and wait.","cn":"请站在门边等着。"},"gloss_cn":"站立、站;(can''''t stand)忍受;停留","gloss_en":"to stand; (can''''t stand) to bear; to stay","sense_key":"stand"}'::jsonb
 WHERE normalized = 'stand' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/fɪl/","pos":"v.","word":"fill","example":{"en":"She filled the basket with apples.","cn":"她把篮子装满了苹果。"},"gloss_cn":"装满、填满;(one''''s fill)饱、足量(n)","gloss_en":"to fill up; (one''''s fill) as much as one wants","sense_key":"make-full"}'::jsonb
 WHERE normalized = 'fill' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/pɔɪnts/","pos":"n.","word":"points","example":{"en":"He made two good points in his talk.","cn":"他讲话中说了两个要点。"},"gloss_cn":"点、要点;尖端;(v.)指向","gloss_en":"points or key ideas; sharp tips; (v.) points at","sense_key":"points"}'::jsonb
 WHERE normalized = 'points' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈbɪznəs/","pos":"n.","word":"business","example":{"en":"Her family runs a small business.","cn":"她家开了间小店。"},"gloss_cn":"生意、商业;事务、正事;(one''''s business)本分、该管的事","gloss_en":"trade or business; affairs; (one''''s business) one''''s own concern","sense_key":"matter"}'::jsonb
 WHERE normalized = 'business' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/maɪnd/","pos":"n.","word":"mind","example":{"en":"A clever idea came into her mind.","cn":"她脑子里冒出一个妙主意。"},"gloss_cn":"头脑、心智、心思(n);(v.)介意;当心、注意(Mind the gap)","gloss_en":"the mind; (v.) to mind or object; to watch out","sense_key":"care-about"}'::jsonb
 WHERE normalized = 'mind' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/tɜːrn/","pos":"v.","word":"turn","example":{"en":"Turn the key to open the lock.","cn":"转动钥匙把锁打开。"},"gloss_cn":"转动、转向、转身;(n.)轮到、一次;变成(turn into)","gloss_en":"to turn; (n.) a turn or one''''s go; to turn into","sense_key":"return"}'::jsonb
 WHERE normalized = 'turn' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈleɪɪŋ/","pos":"v.","word":"laying","example":{"en":"The woman was laying the table for dinner.","cn":"那女人正在摆桌准备晚饭。"},"gloss_cn":"放置、铺、摆;(lay into)痛打、猛揍;躺(方言)","gloss_en":"laying or setting down; (lay into) to thrash; (dialect) lying","sense_key":"lay"}'::jsonb
 WHERE normalized = 'laying' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈkɜːsɪd/","pos":"v.","word":"cursed","example":{"en":"He cursed loudly when he stubbed his toe.","cn":"他踢到脚趾，大声咒骂起来。"},"gloss_cn":"咒骂、诅咒(v);可恶的、遭诅咒的(adj)","gloss_en":"to curse; (adj.) hateful or accursed","sense_key":"cursed"}'::jsonb
 WHERE normalized = 'cursed' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/kleɪm/","pos":"v.","word":"claim","example":{"en":"She claims she saw the whole thing.","cn":"她声称自己看见了全过程。"},"gloss_cn":"声称、宣称(v);要求、索取、认领;(n.)主张、索赔","gloss_en":"to claim or assert; to demand; (n.) a claim","sense_key":"demand"}'::jsonb
 WHERE normalized = 'claim' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/pɪk/","pos":"v.","word":"pick","example":{"en":"Pick the ripest apple from the tree.","cn":"从树上挑一个最熟的苹果。"},"gloss_cn":"挑选、挑;捡起、采摘;(n.)镐、鹤嘴锄","gloss_en":"to pick or choose; to pick up or pluck; (n.) a pickaxe","sense_key":"lift"}'::jsonb
 WHERE normalized = 'pick' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/pɔɪnt/","pos":"n.","word":"point","example":{"en":"That is a good point to remember.","cn":"那是个值得记住的要点。"},"gloss_cn":"点、要点;(have a point)有道理;尖端;岬角","gloss_en":"a point or key idea; (have a point) to be right; a sharp tip; a headland","sense_key":"tip"}'::jsonb
 WHERE normalized = 'point' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ʃɔːrt/","pos":"adj.","word":"short","example":{"en":"The days grow short in winter.","cn":"冬天白天变短了。"},"gloss_cn":"短的、短暂的;(short of/on)缺、不足;(stop short)突然","gloss_en":"short in length or time; (short of) lacking; (stop short) suddenly","sense_key":"short"}'::jsonb
 WHERE normalized = 'short' AND target_lang = 'read-v1';

SELECT 'after' AS phase, normalized, explanation->>'pos' AS pos, explanation->>'gloss_cn' AS gloss_cn, explanation->>'ipa' AS ipa
  FROM public.phrase_explanations
 WHERE target_lang='read-v1' AND normalized IN ('loads','passing','walks','wanting','winning','wrung','roasted','running','blind','strip','drag','dragging','dropping','calling','stand','fill','points','business','mind','turn','laying','cursed','claim','pick','point','short')
 ORDER BY normalized;

COMMIT;
