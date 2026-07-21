-- ============================================================================
-- oz 回读扫描·74张旧全局卡修正(网页版Claude审定·B为主·多义并列主流义在前·IPA原样保留)。
-- 起因:全局旧卡把次要义/罕见义/错词性当默认义,读者读错整句。四本共享全局卡→改完全部书受益。
-- 已剔出单独处理:senses[]卡(desync风险)+chunk卡。幂等UPDATE现卡。BEGIN/COMMIT+前后核验。
-- ============================================================================
BEGIN;

SELECT 'before' AS phase, normalized, explanation->>'pos' AS pos, explanation->>'gloss_cn' AS gloss_cn
  FROM public.phrase_explanations WHERE target_lang='read-v1' AND normalized IN ('for','like','make','made','may','called','left','cut','oil','kept','looking','part','pass','foot','since','helped','living','given','held','fitted','pointed','rested','trouble','show','grateful','rich','yet','curiosity','empty','moved','obliged','stick','worried','brighter','burned','closed','drew','faces','giving','handsome','mean','meet','meeting','opening','serve','simply','slave','wearing','wrinkles','appeared','banks','bother','coat','covering','curious','drive','drying','gets','guard','master','raise','reaching','receive','seat','shade','skins','sweep','thin','thoughtful','whisked','careless','dull','hush','silvery') ORDER BY normalized;

UPDATE public.phrase_explanations SET explanation = '{"ipa":"/fɔr/","pos":"prep.","word":"for","example":{"en":"This little gift is for you.","cn":"这份小礼物是给你的。"},"gloss_cn":"为了、给;(conj.)因为","gloss_en":"for; (conj.) because","sense_key":"for"}'::jsonb
 WHERE normalized = 'for' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/laɪk/","pos":"prep.","word":"like","example":{"en":"She swims like a fish.","cn":"她游得像鱼一样。"},"gloss_cn":"像、如同;(v.)喜欢","gloss_en":"like, similar to; (v.) to like","sense_key":"like"}'::jsonb
 WHERE normalized = 'like' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/meɪk/","pos":"v.","word":"make","example":{"en":"Let''s make a paper boat.","cn":"我们来做一只纸船吧。"},"gloss_cn":"做、制作;使、让(某人做)","gloss_en":"to make; to cause (sb to do)","sense_key":"make"}'::jsonb
 WHERE normalized = 'make' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/meɪd/","pos":"v.","word":"made","example":{"en":"He made a kite out of paper.","cn":"他用纸做了一只风筝。"},"gloss_cn":"做、制作(make过去式);使、让","gloss_en":"made; caused (sb to do)","sense_key":"make"}'::jsonb
 WHERE normalized = 'made' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/meɪ/","pos":"aux. v.","word":"may","example":{"en":"It may rain this afternoon.","cn":"今天下午可能会下雨。"},"gloss_cn":"可能、也许;可以","gloss_en":"may, might; be allowed to","sense_key":"may"}'::jsonb
 WHERE normalized = 'may' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/kɔld/","pos":"v.","word":"called","example":{"en":"She called to her friend across the street.","cn":"她冲街对面的朋友喊。"},"gloss_cn":"喊、叫、招呼;称作、叫做","gloss_en":"called out; named","sense_key":"call"}'::jsonb
 WHERE normalized = 'called' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/lɛft/","pos":"v.","word":"left","example":{"en":"He left home before dawn.","cn":"他天亮前就离开了家。"},"gloss_cn":"离开、留下(leave过去式);剩下的、剩余的;左边的","gloss_en":"left; remaining; on the left","sense_key":"leave"}'::jsonb
 WHERE normalized = 'left' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/kʌt/","pos":"v.","word":"cut","example":{"en":"She cut the cake into eight pieces.","cn":"她把蛋糕切成八块。"},"gloss_cn":"切、割;切断、割断","gloss_en":"to cut; to sever","sense_key":"cut"}'::jsonb
 WHERE normalized = 'cut' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ɔɪl/","pos":"n.","word":"oil","example":{"en":"He oiled the squeaky hinge.","cn":"他给吱嘎作响的合页上了油。"},"gloss_cn":"(n.)油、润滑油;(v.)给…上油","gloss_en":"oil; (v.) to oil","sense_key":"oil"}'::jsonb
 WHERE normalized = 'oil' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/kɛpt/","pos":"v.","word":"kept","example":{"en":"She kept the old letter in a drawer.","cn":"她把那封旧信留在抽屉里。"},"gloss_cn":"保存、保留;保持、继续(kept doing);饲养","gloss_en":"kept; kept doing; raised","sense_key":"keep"}'::jsonb
 WHERE normalized = 'kept' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈlʊkɪŋ/","pos":"v.","word":"looking","example":{"en":"She stood looking up at the stars.","cn":"她站着仰望星星。"},"gloss_cn":"看、注视;(adj.)看起来…的","gloss_en":"looking at; (adj.) -looking","sense_key":"look"}'::jsonb
 WHERE normalized = 'looking' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/pɑːrt/","pos":"n.","word":"part","example":{"en":"This part of the town is very old.","cn":"镇上的这一带很古老。"},"gloss_cn":"部分、一部分;一带、地区;(一)方","gloss_en":"part; area; side","sense_key":"part"}'::jsonb
 WHERE normalized = 'part' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/pæs/","pos":"v.","word":"pass","example":{"en":"They passed a quiet evening by the fire.","cn":"他们在炉火旁度过了一个安静的夜晚。"},"gloss_cn":"经过、路过;度过(时间);传递","gloss_en":"to pass by; to spend (time); to hand over","sense_key":"pass"}'::jsonb
 WHERE normalized = 'pass' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/fʊt/","pos":"n.","word":"foot","example":{"en":"She hurt her left foot.","cn":"她伤了左脚。"},"gloss_cn":"脚;英尺(长度单位)","gloss_en":"foot (body part); foot (length)","sense_key":"foot"}'::jsonb
 WHERE normalized = 'foot' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/sɪns/","pos":"conj.","word":"since","example":{"en":"Since you''re tired, let''s rest.","cn":"既然你累了,我们歇一会儿吧。"},"gloss_cn":"自从…以来;既然、因为","gloss_en":"since (time); since, because","sense_key":"since"}'::jsonb
 WHERE normalized = 'since' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/hɛlpt/","pos":"v.","word":"helped","example":{"en":"He helped the old man over the fence.","cn":"他帮老人翻过篱笆。"},"gloss_cn":"帮助(help过去式);(help oneself)自取(食物)","gloss_en":"helped; helped oneself to","sense_key":"help"}'::jsonb
 WHERE normalized = 'helped' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈlɪvɪŋ/","pos":"v.","word":"living","example":{"en":"They are living in a small cottage.","cn":"他们住在一间小屋里。"},"gloss_cn":"(v.)生活、居住;(n.)谋生、生计","gloss_en":"living, dwelling; (n.) a livelihood","sense_key":"live"}'::jsonb
 WHERE normalized = 'living' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈɡɪvən/","pos":"v.","word":"given","example":{"en":"She was given a prize for her drawing.","cn":"她的画得了一个奖。"},"gloss_cn":"给予、授予(give过去分词);(give up)放弃","gloss_en":"given; (give up) given up","sense_key":"give"}'::jsonb
 WHERE normalized = 'given' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/hɛld/","pos":"v.","word":"held","example":{"en":"She held the puppy in her arms.","cn":"她把小狗抱在怀里。"},"gloss_cn":"拿着、抱着、握住(hold过去式);举行","gloss_en":"held, carried; held (an event)","sense_key":"hold"}'::jsonb
 WHERE normalized = 'held' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈfɪtɪd/","pos":"v.","word":"fitted","example":{"en":"The optician fitted him with new glasses.","cn":"眼镜师给他配了副新眼镜。"},"gloss_cn":"给…装上、配上;(衣服)合身","gloss_en":"fitted (attached); fitted (clothes)","sense_key":"fit"}'::jsonb
 WHERE normalized = 'fitted' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈpɔɪntɪd/","pos":"v.","word":"pointed","example":{"en":"She pointed to the tallest tree.","cn":"她指向那棵最高的树。"},"gloss_cn":"(v.)指、指向;(adj.)尖的、有尖头的","gloss_en":"pointed (at); (adj.) sharp-tipped","sense_key":"point"}'::jsonb
 WHERE normalized = 'pointed' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈrɛstɪd/","pos":"v.","word":"rested","example":{"en":"They rested under a big oak tree.","cn":"他们在一棵大橡树下休息。"},"gloss_cn":"休息(rest过去式);放置、搁","gloss_en":"rested; rested (placed on)","sense_key":"rest"}'::jsonb
 WHERE normalized = 'rested' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈtrʌb.əl/","pos":"n.","word":"trouble","example":{"en":"This little noise will not trouble us.","cn":"这点小声音不会打扰到我们。"},"gloss_cn":"(n.)困难、麻烦;(v.)使烦恼、打扰","gloss_en":"trouble; (v.) to trouble","sense_key":"trouble"}'::jsonb
 WHERE normalized = 'trouble' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈʃoʊ/","pos":"v.","word":"show","example":{"en":"Please show me your ticket.","cn":"请把你的票给我看看。"},"gloss_cn":"显示、给…看、表明;(show sb to)领…去、带路","gloss_en":"to show; to show sb to (a place)","sense_key":"show"}'::jsonb
 WHERE normalized = 'show' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈɡreɪtfl/","pos":"adj.","word":"grateful","example":{"en":"We are grateful for all your help.","cn":"我们很感激你的帮助。"},"gloss_cn":"感激的、感谢的","gloss_en":"grateful, thankful","sense_key":"grateful"}'::jsonb
 WHERE normalized = 'grateful' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/rɪtʃ/","pos":"adj.","word":"rich","example":{"en":"The rich merchant owned three ships.","cn":"那个富商拥有三条船。"},"gloss_cn":"富有的、富裕的;(味道)浓郁的","gloss_en":"rich, wealthy; (flavor) rich","sense_key":"rich"}'::jsonb
 WHERE normalized = 'rich' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/jɛt/","pos":"adv.","word":"yet","example":{"en":"It is late, yet she is still working.","cn":"已经很晚了,可她还在工作。"},"gloss_cn":"仍然、还;(conj.)然而、可是","gloss_en":"yet, still; (conj.) yet, but","sense_key":"yet"}'::jsonb
 WHERE normalized = 'yet' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˌkjʊriˈɑːsəti/","pos":"n.","word":"curiosity","example":{"en":"The child looked around with great curiosity.","cn":"孩子满怀好奇地四处张望。"},"gloss_cn":"好奇心;稀奇的事物","gloss_en":"curiosity; a curiosity","sense_key":"curiosity"}'::jsonb
 WHERE normalized = 'curiosity' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈempti/","pos":"adj.","word":"empty","example":{"en":"She emptied the water out of the pail.","cn":"她把桶里的水倒掉了。"},"gloss_cn":"(adj.)空的;(v.)倒空、腾空","gloss_en":"empty; (v.) to empty out","sense_key":"empty"}'::jsonb
 WHERE normalized = 'empty' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/muːvd/","pos":"v.","word":"moved","example":{"en":"She was deeply moved by the sad song.","cn":"那首悲伤的歌深深打动了她。"},"gloss_cn":"(身体)移动;感动、打动","gloss_en":"moved; moved (emotionally)","sense_key":"move"}'::jsonb
 WHERE normalized = 'moved' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/əˈblaɪdʒd/","pos":"adj.","word":"obliged","example":{"en":"He was obliged to leave early.","cn":"他不得不早早离开。"},"gloss_cn":"(be obliged to)不得不、被迫;感激的","gloss_en":"obliged to, forced to; grateful","sense_key":"oblige"}'::jsonb
 WHERE normalized = 'obliged' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/stɪk/","pos":"n.","word":"stick","example":{"en":"The dry bread stuck in his throat.","cn":"干面包卡在他的喉咙里。"},"gloss_cn":"(n.)棍子、枝条;(v.)卡住、粘住","gloss_en":"a stick; (v.) to stick, to get stuck","sense_key":"stick"}'::jsonb
 WHERE normalized = 'stick' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈwʌrid/","pos":"v.","word":"worried","example":{"en":"The strange noise worried the children.","cn":"那奇怪的声音让孩子们不安。"},"gloss_cn":"(v.)使担忧、使不安;(adj.)担忧的","gloss_en":"to worry (sb); (adj.) worried","sense_key":"worry"}'::jsonb
 WHERE normalized = 'worried' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈbraɪtər/","pos":"adj.","word":"brighter","example":{"en":"A good rest makes your mind brighter.","cn":"好好休息会让头脑更清醒。"},"gloss_cn":"更聪明的、更机灵的;更亮的","gloss_en":"brighter (smarter); brighter (in light)","sense_key":"bright"}'::jsonb
 WHERE normalized = 'brighter' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/bɜːrnd/","pos":"v.","word":"burned","example":{"en":"The campfire burned brightly all night.","cn":"篝火整夜熊熊燃烧。"},"gloss_cn":"(火)燃烧;烧焦、灼伤","gloss_en":"burned, blazed; scorched","sense_key":"burn"}'::jsonb
 WHERE normalized = 'burned' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/kloʊzd/","pos":"v.","word":"closed","example":{"en":"She quietly closed the heavy door.","cn":"她轻轻关上那扇厚重的门。"},"gloss_cn":"关上、关闭;闭上(眼)","gloss_en":"closed, shut; closed (eyes)","sense_key":"close"}'::jsonb
 WHERE normalized = 'closed' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/druː/","pos":"v.","word":"drew","example":{"en":"She drew a bucket of water from the well.","cn":"她从井里打了一桶水。"},"gloss_cn":"拉、拖;打(水)、汲取;画","gloss_en":"drew, pulled; drew (water); drew (a picture)","sense_key":"draw"}'::jsonb
 WHERE normalized = 'drew' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈfeɪsɪz/","pos":"n.","word":"faces","example":{"en":"A brave heart faces danger calmly.","cn":"勇敢的心从容面对危险。"},"gloss_cn":"(n.)脸、面孔;(v.)面对、面临","gloss_en":"faces; (v.) faces, confronts","sense_key":"face"}'::jsonb
 WHERE normalized = 'faces' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈɡɪvɪŋ/","pos":"v.","word":"giving","example":{"en":"She is giving apples to the children.","cn":"她正把苹果分给孩子们。"},"gloss_cn":"给、给予;(giving a spring)纵身(一跃)","gloss_en":"giving; (giving a spring) leaping","sense_key":"give"}'::jsonb
 WHERE normalized = 'giving' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈhænsəm/","pos":"adj.","word":"handsome","example":{"en":"The handsome young prince smiled.","cn":"那位英俊的年轻王子笑了。"},"gloss_cn":"(人)英俊的、俊美的;(物)精美的、大方的","gloss_en":"handsome (person); handsome (object)","sense_key":"handsome"}'::jsonb
 WHERE normalized = 'handsome' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/miːn/","pos":"v.","word":"mean","example":{"en":"We mean to finish the work today.","cn":"我们打算今天完成这项工作。"},"gloss_cn":"意思是、意味着;(mean to)打算、意图","gloss_en":"to mean; (mean to) to intend","sense_key":"mean"}'::jsonb
 WHERE normalized = 'mean' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/miːt/","pos":"v.","word":"meet","example":{"en":"Let''s meet at the gate at noon.","cn":"我们中午在门口见吧。"},"gloss_cn":"遇见、见面;迎接;迎战、应对","gloss_en":"to meet; to greet; to face (an attack)","sense_key":"meet"}'::jsonb
 WHERE normalized = 'meet' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈmiːtɪŋ/","pos":"n.","word":"meeting","example":{"en":"The animals held a meeting in the forest.","cn":"动物们在林中开了个会。"},"gloss_cn":"(n.)会议、集会;(v.)遇见、相遇","gloss_en":"a meeting; (v.) meeting","sense_key":"meeting"}'::jsonb
 WHERE normalized = 'meeting' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈoʊpnɪŋ/","pos":"n.","word":"opening","example":{"en":"They stepped into a wide opening in the woods.","cn":"他们走进林中一片开阔的空地。"},"gloss_cn":"(n.)开口、空地、缺口;(v.)打开","gloss_en":"an opening, a gap; (v.) opening","sense_key":"opening"}'::jsonb
 WHERE normalized = 'opening' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/sɜːv/","pos":"v.","word":"serve","example":{"en":"The knights served their king loyally.","cn":"骑士们忠心地服侍国王。"},"gloss_cn":"服侍、为…效劳;(serve as)充当、起作用","gloss_en":"to serve; (serve as) to act as","sense_key":"serve"}'::jsonb
 WHERE normalized = 'serve' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈsɪmpli/","pos":"adv.","word":"simply","example":{"en":"\"I forgot,\" she said simply.","cn":"“我忘了,”她干脆地说。"},"gloss_cn":"简单地、直截了当地;仅仅、只不过","gloss_en":"simply, plainly; simply, merely","sense_key":"simply"}'::jsonb
 WHERE normalized = 'simply' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/sleɪv/","pos":"n.","word":"slave","example":{"en":"The witch made the boy her slave.","cn":"女巫把男孩变成了她的奴隶。"},"gloss_cn":"(n.)奴隶;(v.)做苦工、辛苦劳作","gloss_en":"a slave; (v.) to slave away","sense_key":"slave"}'::jsonb
 WHERE normalized = 'slave' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈwɛrɪŋ/","pos":"v.","word":"wearing","example":{"en":"She was wearing bright silver shoes.","cn":"她穿着一双闪亮的银鞋。"},"gloss_cn":"穿着、戴着(wear-ing);(adj.)令人疲惫的、磨人的","gloss_en":"wearing (clothes); (adj.) tiring","sense_key":"wear"}'::jsonb
 WHERE normalized = 'wearing' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈrɪŋkəlz/","pos":"n.","word":"wrinkles","example":{"en":"She smoothed the wrinkles out of her dress.","cn":"她把裙子上的褶皱抚平。"},"gloss_cn":"褶皱、皱纹(皮肤或布料上的)","gloss_en":"wrinkles, creases (skin or cloth)","sense_key":"wrinkle"}'::jsonb
 WHERE normalized = 'wrinkles' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/əˈpɪrd/","pos":"v.","word":"appeared","example":{"en":"A rainbow appeared after the rain.","cn":"雨后出现了一道彩虹。"},"gloss_cn":"出现、显现;看起来、似乎","gloss_en":"appeared; seemed","sense_key":"appear"}'::jsonb
 WHERE normalized = 'appeared' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/bæŋks/","pos":"n.","word":"banks","example":{"en":"Flowers grew along the green banks.","cn":"花儿沿着绿色的河岸生长。"},"gloss_cn":"河岸;银行;(一)堆、(一)排","gloss_en":"riverbanks; banks; rows","sense_key":"bank"}'::jsonb
 WHERE normalized = 'banks' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈbɑːðər/","pos":"v.","word":"bother","example":{"en":"Don''t bother her while she''s reading.","cn":"她看书时别打扰她。"},"gloss_cn":"(v.)打扰、烦扰;(n.)麻烦","gloss_en":"to bother; (n.) a bother","sense_key":"bother"}'::jsonb
 WHERE normalized = 'bother' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/koʊt/","pos":"n.","word":"coat","example":{"en":"He gave the fence a coat of paint.","cn":"他给篱笆刷了一层漆。"},"gloss_cn":"外套;一层(涂层)","gloss_en":"a coat; a coat (layer)","sense_key":"coat"}'::jsonb
 WHERE normalized = 'coat' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈkʌvərɪŋ/","pos":"v.","word":"covering","example":{"en":"Snow was covering the whole field.","cn":"雪覆盖了整片田野。"},"gloss_cn":"(v.)覆盖、布满;(n.)遮盖物、覆盖层","gloss_en":"covering; (n.) a covering","sense_key":"cover"}'::jsonb
 WHERE normalized = 'covering' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈkjʊriəs/","pos":"adj.","word":"curious","example":{"en":"The curious cat sniffed at the box.","cn":"好奇的猫嗅着那个盒子。"},"gloss_cn":"好奇的;奇特的、古怪的","gloss_en":"curious; curious, strange","sense_key":"curious"}'::jsonb
 WHERE normalized = 'curious' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/draɪv/","pos":"v.","word":"drive","example":{"en":"The farmer drove the sheep into the pen.","cn":"农夫把羊赶进圈里。"},"gloss_cn":"驾驶;驱赶、驱使、赶(走)","gloss_en":"to drive; to drive (away)","sense_key":"drive"}'::jsonb
 WHERE normalized = 'drive' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈdraɪɪŋ/","pos":"v.","word":"drying","example":{"en":"The puddles were drying up in the sun.","cn":"水洼在太阳下渐渐干了。"},"gloss_cn":"(使)变干、干枯;擦干","gloss_en":"drying up; drying (wiping)","sense_key":"dry"}'::jsonb
 WHERE normalized = 'drying' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ɡɛts/","pos":"v.","word":"gets","example":{"en":"It gets dark early in winter.","cn":"冬天天黑得早。"},"gloss_cn":"得到、获得;变得(get+形容词)","gloss_en":"gets, obtains; gets (becomes)","sense_key":"get"}'::jsonb
 WHERE normalized = 'gets' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ɡɑːrd/","pos":"n.","word":"guard","example":{"en":"He oiled himself well to guard against rust.","cn":"他给自己好好上油以防生锈。"},"gloss_cn":"(n.)守卫、哨兵;(v.)防备、守卫","gloss_en":"a guard; (v.) to guard against","sense_key":"guard"}'::jsonb
 WHERE normalized = 'guard' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈmɑːstə, ˈmæstər/","pos":"n.","word":"master","example":{"en":"He learned the craft from a great master.","cn":"他跟一位名家学了这门手艺。"},"gloss_cn":"主人;大师、名家","gloss_en":"a master, owner; a master, expert","sense_key":"master"}'::jsonb
 WHERE normalized = 'master' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/reɪz/","pos":"v.","word":"raise","example":{"en":"He raised his axe over his head.","cn":"他把斧头举过头顶。"},"gloss_cn":"举起、抬起;种植、养育","gloss_en":"to raise, lift; to raise, grow","sense_key":"raise"}'::jsonb
 WHERE normalized = 'raise' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈriːtʃɪŋ/","pos":"v.","word":"reaching","example":{"en":"The water was reaching up to her knees.","cn":"水已经涨到她的膝盖。"},"gloss_cn":"伸手够(某物);达到(某高度/程度)","gloss_en":"reaching for; reaching (a height)","sense_key":"reach"}'::jsonb
 WHERE normalized = 'reaching' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/rɪˈsiːv/","pos":"v.","word":"receive","example":{"en":"She received a letter from her aunt.","cn":"她收到了姑姑的一封信。"},"gloss_cn":"收到、接到;接见、会见","gloss_en":"to receive; to receive (a guest)","sense_key":"receive"}'::jsonb
 WHERE normalized = 'receive' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/siːt/","pos":"n.","word":"seat","example":{"en":"The king seated himself upon the throne.","cn":"国王在王座上坐下。"},"gloss_cn":"(n.)座位;(v.)使坐下、就座","gloss_en":"a seat; (v.) to seat oneself","sense_key":"seat"}'::jsonb
 WHERE normalized = 'seat' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ʃeɪd/","pos":"n.","word":"shade","example":{"en":"They rested in the shade of a tall tree.","cn":"他们在一棵大树的树荫下休息。"},"gloss_cn":"阴凉、树荫;(颜色的)深浅、色度","gloss_en":"shade; a shade (of color)","sense_key":"shade"}'::jsonb
 WHERE normalized = 'shade' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/skɪnz/","pos":"n.","word":"skins","example":{"en":"The tent was made of animal skins.","cn":"帐篷是用兽皮做的。"},"gloss_cn":"皮肤;(动物的)皮、兽皮","gloss_en":"skin; animal skins, hides","sense_key":"skin"}'::jsonb
 WHERE normalized = 'skins' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/swiːp/","pos":"v.","word":"sweep","example":{"en":"She had to sweep the whole floor.","cn":"她得把整个地板扫一遍。"},"gloss_cn":"(v.)扫、打扫;(n.)一大片、挥动","gloss_en":"to sweep; (n.) a sweep","sense_key":"sweep"}'::jsonb
 WHERE normalized = 'sweep' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/θɪn/","pos":"adj.","word":"thin","example":{"en":"He spread a thin layer of glue.","cn":"他涂了薄薄一层胶。"},"gloss_cn":"瘦的;薄的、稀的","gloss_en":"thin (person); thin, watery (layer)","sense_key":"thin"}'::jsonb
 WHERE normalized = 'thin' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈθɔːtf(ə)l/","pos":"adj.","word":"thoughtful","example":{"en":"The lion looked thoughtful for a moment.","cn":"狮子若有所思地愣了一下。"},"gloss_cn":"体贴的、周到的;若有所思的、沉思的","gloss_en":"thoughtful, kind; thoughtful, pensive","sense_key":"thoughtful"}'::jsonb
 WHERE normalized = 'thoughtful' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/wɪskt/","pos":"v.","word":"whisked","example":{"en":"The horse whisked its tail at the flies.","cn":"马甩动尾巴驱赶苍蝇。"},"gloss_cn":"甩动、挥动;迅速带走","gloss_en":"whisked, flicked; whisked away","sense_key":"whisk"}'::jsonb
 WHERE normalized = 'whisked' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈkɛrləs/","pos":"adj.","word":"careless","example":{"en":"They spent a careless, happy summer.","cn":"他们过了一个无忧无虑的快乐夏天。"},"gloss_cn":"无忧无虑的、不操心的;粗心的、不小心的","gloss_en":"carefree; careless","sense_key":"careless"}'::jsonb
 WHERE normalized = 'careless' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/dʌl/","pos":"adj.","word":"dull","example":{"en":"The old walls were a dull gray.","cn":"那些旧墙是暗淡的灰色。"},"gloss_cn":"暗淡的、无光泽的;枯燥的、沉闷的","gloss_en":"dull, dim (color); dull, boring","sense_key":"dull"}'::jsonb
 WHERE normalized = 'dull' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/hʌʃ/","pos":"interj.","word":"hush","example":{"en":"\"Hush,\" she whispered, \"the baby is asleep.\"","cn":"“嘘,”她低声说,“宝宝睡着了。”"},"gloss_cn":"(interj.)嘘、别作声、安静;(n.)寂静","gloss_en":"hush!, be quiet; (n.) a hush","sense_key":"hush"}'::jsonb
 WHERE normalized = 'hush' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈsɪlvəri/","pos":"adj.","word":"silvery","example":{"en":"The little bell gave a silvery ring.","cn":"小铃铛发出银铃般清脆的响声。"},"gloss_cn":"银色的、银白色的;(声音)清脆悦耳的、银铃般的","gloss_en":"silvery (color); silvery, clear (sound)","sense_key":"silvery"}'::jsonb
 WHERE normalized = 'silvery' AND target_lang = 'read-v1';

SELECT 'after' AS phase, normalized, explanation->>'pos' AS pos, explanation->>'gloss_cn' AS gloss_cn
  FROM public.phrase_explanations WHERE target_lang='read-v1' AND normalized IN ('for','like','make','made','may','called','left','cut','oil','kept','looking','part','pass','foot','since','helped','living','given','held','fitted','pointed','rested','trouble','show','grateful','rich','yet','curiosity','empty','moved','obliged','stick','worried','brighter','burned','closed','drew','faces','giving','handsome','mean','meet','meeting','opening','serve','simply','slave','wearing','wrinkles','appeared','banks','bother','coat','covering','curious','drive','drying','gets','guard','master','raise','reaching','receive','seat','shade','skins','sweep','thin','thoughtful','whisked','careless','dull','hush','silvery') ORDER BY normalized;

COMMIT;
