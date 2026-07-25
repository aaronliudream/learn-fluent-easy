-- ============================================================================
-- 伊索(aesop) flag 修正 · 第2批 21张旧全局卡(网页版Claude审定·多义并列·现代最高频义居首·IPA保留)。
-- 跨书反例核查:embarrassed(Robinson古义)/flushed(Tom脸红)/agree/blamed/brace/spotted 旧义皆真实→并列保留。
-- Aaron 定:market补(经济)市场 / keep明标(keep doing) / charged补收费·充电。market旧"处理某情况的地方"错义已弃。
-- 幂等 UPDATE。BEGIN/COMMIT + 前后核验。四本共享全局卡。
-- ============================================================================
BEGIN;

SELECT 'before' AS phase, normalized, explanation->>'pos' AS pos, explanation->>'gloss_cn' AS gloss_cn
  FROM public.phrase_explanations
 WHERE target_lang='read-v1' AND normalized IN ('spotted','gave','sticks','catch','drink','market','agree','keep','blamed','embarrassed','scrambled','sank','shake','shift','flushed','checked','charged','brace','cover','plain','parts')
 ORDER BY normalized;

UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈspɑːtɪd/","pos":"v.","word":"spotted","example":{"en":"She spotted a friend across the street.","cn":"她一眼在街对面看见了一个朋友。"},"gloss_cn":"发现、瞥见;有斑点的;沾上污渍","gloss_en":"to see or notice; having spots; stained","sense_key":"stain"}'::jsonb
 WHERE normalized = 'spotted' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ɡeɪv/","pos":"v.","word":"gave","example":{"en":"He gave his brother a book.","cn":"他给了弟弟一本书。"},"gloss_cn":"给、给予(give 过去式);发出(叫喊等)","gloss_en":"gave (past of give); also let out (a cry)","sense_key":"make"}'::jsonb
 WHERE normalized = 'gave' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/stɪks/","pos":"n.","word":"sticks","example":{"en":"They gathered sticks to build a fire.","cn":"他们捡来树枝生火。"},"gloss_cn":"棍子、枝条;扎、插;粘住","gloss_en":"pieces of wood; (v.) to poke in; to stick","sense_key":"poke"}'::jsonb
 WHERE normalized = 'sticks' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/kætʃ/","pos":"v.","word":"catch","example":{"en":"Try to catch the ball with both hands.","cn":"用双手把球接住。"},"gloss_cn":"抓住、接住、捕捉;(catch one''''s breath)屏住呼吸","gloss_en":"to catch or grab; (catch one''''s breath) to pause for breath","sense_key":"hold"}'::jsonb
 WHERE normalized = 'catch' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/drɪŋk/","pos":"v.","word":"drink","example":{"en":"She likes to drink warm milk at night.","cn":"她喜欢晚上喝热牛奶。"},"gloss_cn":"喝;饮料、喝的东西","gloss_en":"to drink; (n.) a beverage","sense_key":"drink-liquid"}'::jsonb
 WHERE normalized = 'drink' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈmɑːkɪt/","pos":"n.","word":"market","example":{"en":"We bought fresh fruit at the market.","cn":"我们在集市上买了新鲜水果。"},"gloss_cn":"市场、集市;(经济)市场;(v.)推销、销售","gloss_en":"a market or fair; (economics) the market; (v.) to sell or promote","sense_key":"market"}'::jsonb
 WHERE normalized = 'market' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/əˈɡriː/","pos":"v.","word":"agree","example":{"en":"Do you agree with what he said?","cn":"你同意他说的话吗?"},"gloss_cn":"同意、赞同;(agree with)对…相宜、适合","gloss_en":"to agree; (agree with) to suit someone","sense_key":"suit"}'::jsonb
 WHERE normalized = 'agree' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/kiːp/","pos":"v.","word":"keep","example":{"en":"Please keep the door closed.","cn":"请让门一直关着。"},"gloss_cn":"保持、保留;(keep doing)一直、不停地做;(keep from)阻止、使不","gloss_en":"to keep; (keep doing) to keep on doing; (keep from) to prevent","sense_key":"prevent"}'::jsonb
 WHERE normalized = 'keep' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/bleɪmd/","pos":"v.","word":"blamed","example":{"en":"They blamed him for the mistake.","cn":"他们把这个错怪在他头上。"},"gloss_cn":"责怪、归咎(blame 过去式);(口)该死的、可恶的","gloss_en":"blamed (past of blame); (informal) darned","sense_key":"blamed"}'::jsonb
 WHERE normalized = 'blamed' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ɪmˈbærəst/","pos":"adj.","word":"embarrassed","example":{"en":"He felt embarrassed when he forgot her name.","cn":"他忘了她的名字，觉得很尴尬。"},"gloss_cn":"尴尬、难为情;(旧)受…所累、陷入困境","gloss_en":"feeling awkward; (archaic) burdened or hampered","sense_key":"encumbered"}'::jsonb
 WHERE normalized = 'embarrassed' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈskræmbəld/","pos":"v.","word":"scrambled","example":{"en":"The children scrambled up the rocks.","cn":"孩子们手脚并用爬上了岩石。"},"gloss_cn":"爬、攀爬;(scrambled eggs)炒(蛋)","gloss_en":"scrambled or clambered; (scrambled eggs) beaten and cooked","sense_key":"scrambled"}'::jsonb
 WHERE normalized = 'scrambled' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/sæŋk/","pos":"v.","word":"sank","example":{"en":"The heavy stone sank to the bottom.","cn":"那块重石沉到了底。"},"gloss_cn":"下沉、下陷(sink 过去式);(心情)低落、沉重","gloss_en":"sank (past of sink); (of spirits) dropped","sense_key":"sank"}'::jsonb
 WHERE normalized = 'sank' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ʃeɪk/","pos":"v.","word":"shake","example":{"en":"Shake the bottle before you open it.","cn":"打开前先摇一摇瓶子。"},"gloss_cn":"摇、抖动、甩;(shake hands)握手","gloss_en":"to shake; (shake hands) to greet by clasping hands","sense_key":"shake"}'::jsonb
 WHERE normalized = 'shake' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ʃɪft/","pos":"v.","word":"shift","example":{"en":"Help me shift the table to the wall.","cn":"帮我把桌子挪到墙边。"},"gloss_cn":"移动、转移;(make shift)将就应付;更换","gloss_en":"to move or shift; (make shift) to manage; to change","sense_key":"shift"}'::jsonb
 WHERE normalized = 'shift' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/flʌʃt/","pos":"adj.","word":"flushed","example":{"en":"Her cheeks were flushed after the run.","cn":"跑完步她双颊通红。"},"gloss_cn":"(脸)发红的;惊起、轰出(猎物)","gloss_en":"red in the face; (v.) to flush out (game)","sense_key":"flushed"}'::jsonb
 WHERE normalized = 'flushed' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/tʃekt/","pos":"v.","word":"checked","example":{"en":"He checked his answers before handing in the test.","cn":"交卷前他把答案检查了一遍。"},"gloss_cn":"检查、核对;制止、抑制;有格子图案的","gloss_en":"checked or verified; restrained; (adj.) patterned in squares","sense_key":"checked-pattern"}'::jsonb
 WHERE normalized = 'checked' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/tʃɑːdʒd/","pos":"v.","word":"charged","example":{"en":"The bull lowered its head and charged.","cn":"公牛低下头猛冲过来。"},"gloss_cn":"猛冲、冲锋;收取(费用);充电;(枪炮)装填","gloss_en":"charged or rushed; charged a fee; charged (a battery); loaded (a gun)","sense_key":"load"}'::jsonb
 WHERE normalized = 'charged' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/breɪs/","pos":"v.","word":"brace","example":{"en":"He braced his legs against the wall.","cn":"他把腿抵在墙上撑住。"},"gloss_cn":"撑住、抵住;支撑物、支架;(a brace of)一对、两个","gloss_en":"to brace or steady; a support; (a brace of) a pair","sense_key":"brace"}'::jsonb
 WHERE normalized = 'brace' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈkʌvər/","pos":"v.","word":"cover","example":{"en":"Snow covered the whole field.","cn":"雪覆盖了整片田野。"},"gloss_cn":"覆盖、遮盖;遮蔽处、掩体(n)","gloss_en":"to cover; (n.) shelter or a hiding place","sense_key":"cover"}'::jsonb
 WHERE normalized = 'cover' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/pleɪn/","pos":"adj.","word":"plain","example":{"en":"It was plain that she was tired.","cn":"很明显她累了。"},"gloss_cn":"清楚的、明显的;朴素的、简单的;(n.)平原","gloss_en":"clear or obvious; plain or simple; (n.) a flat plain","sense_key":"plain"}'::jsonb
 WHERE normalized = 'plain' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/pɑːts/","pos":"n.","word":"parts","example":{"en":"He took the machine apart into many parts.","cn":"他把机器拆成了许多部件。"},"gloss_cn":"部分、部位;地区、一带","gloss_en":"parts or portions; (these parts) a region","sense_key":"region"}'::jsonb
 WHERE normalized = 'parts' AND target_lang = 'read-v1';

SELECT 'after' AS phase, normalized, explanation->>'pos' AS pos, explanation->>'gloss_cn' AS gloss_cn, explanation->>'ipa' AS ipa
  FROM public.phrase_explanations
 WHERE target_lang='read-v1' AND normalized IN ('spotted','gave','sticks','catch','drink','market','agree','keep','blamed','embarrassed','scrambled','sank','shake','shift','flushed','checked','charged','brace','cover','plain','parts')
 ORDER BY normalized;

COMMIT;
