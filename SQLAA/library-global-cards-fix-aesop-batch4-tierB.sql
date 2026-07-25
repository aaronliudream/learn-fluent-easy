-- ============================================================================
-- 伊索(aesop) flag 修正 · 第4批(Tier B 收尾)10张词汇卡 + you'd缩写中性化(网页版Claude审定·多义并列·高频义收全·IPA保留)。
-- Tier B=超高频功能词,判据:高频义全收、按现代频次排(覆盖不全比排序错更糟)。
-- Aaron 定:back补支持/way补远远地/got补抓住·明白/take补需要·占据/right副词"正好"提前/land补及物"搞到·钓上"。
-- you'd:语法缩写非词汇,不给释义,中性化为"you would/you had 的缩写"(同 'twas)。
-- 幂等 UPDATE。BEGIN/COMMIT + 前后核验。四本共享全局卡。至此第③层 flag 修正全清(22+21+26+10=79词汇卡)。
-- ============================================================================
BEGIN;

SELECT 'before' AS phase, normalized, explanation->>'pos' AS pos, explanation->>'gloss_cn' AS gloss_cn
  FROM public.phrase_explanations
 WHERE target_lang='read-v1' AND normalized IN ('back','got','way','take','right','took','turned','about','well','land','you''d')
 ORDER BY normalized;

UPDATE public.phrase_explanations SET explanation = '{"ipa":"/bæk/","pos":"adv.","word":"back","example":{"en":"He walked back to the house.","cn":"他走回了屋里。"},"gloss_cn":"回、返回(adv);(n.)背、背部;(adj.)后面的;(v.)支持(back sb up)","gloss_en":"back or returning; (n.) the back; (adj.) rear; (v.) to support","sense_key":"return"}'::jsonb
 WHERE normalized = 'back' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ɡɑt/","pos":"v.","word":"got","example":{"en":"She got a letter this morning.","cn":"她今天早上收到一封信。"},"gloss_cn":"得到、取得;变得(get+形);抓住、逮到;明白(I got it);(have got to)不得不;到达","gloss_en":"got or obtained; became; caught; understood; (have got to) must; reached","sense_key":"move"}'::jsonb
 WHERE normalized = 'got' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/weɪ/","pos":"n.","word":"way","example":{"en":"That is the best way to do it.","cn":"那是做这件事最好的办法。"},"gloss_cn":"方式、方法、样子;路、路线;方向;(a way off)一段路程;(way too/better)远远地","gloss_en":"a way or method; a road or path; a direction; some distance; (way too) far","sense_key":"direction"}'::jsonb
 WHERE normalized = 'way' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/ˈteɪk/","pos":"v.","word":"take","example":{"en":"Please take this book with you.","cn":"请把这本书带上。"},"gloss_cn":"拿、取、带走;花费(时间);需要;接受、采纳;当作(take for);占据(take a seat)","gloss_en":"to take or carry; to take (time); to need; to accept; (take for) to regard as; to take up","sense_key":"do-activity"}'::jsonb
 WHERE normalized = 'take' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/raɪt/","pos":"adj.","word":"right","example":{"en":"You gave the right answer.","cn":"你给出了正确的答案。"},"gloss_cn":"对的、正确的;右边;(adv.)正好、恰好、立刻(right now/away);(n.)权利;(all right)好、没事","gloss_en":"correct; the right side; (adv.) just or at once; (n.) a right; (all right) fine","sense_key":"right-side"}'::jsonb
 WHERE normalized = 'right' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/tʊk/","pos":"v.","word":"took","example":{"en":"He took the keys off the table.","cn":"他从桌上拿走了钥匙。"},"gloss_cn":"拿、取、带走(take过去式);(took for)当作、误以为;(took one''''s turn)轮到","gloss_en":"took or carried; (took for) mistook as; (took one''''s turn) had one''''s go","sense_key":"take-out"}'::jsonb
 WHERE normalized = 'took' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/tɜːrnd/","pos":"v.","word":"turned","example":{"en":"She turned and looked at me.","cn":"她转过身看着我。"},"gloss_cn":"转动、转向、转身(turn过去式);变成(turned into);(turned up)翻出、出现","gloss_en":"turned or spun; (turned into) became; (turned up) appeared","sense_key":"move-direction"}'::jsonb
 WHERE normalized = 'turned' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/əˈbaʊt/","pos":"prep.","word":"about","example":{"en":"This story is about a fox.","cn":"这个故事讲的是一只狐狸。"},"gloss_cn":"关于、有关;大约、差不多;(about to)将要、正要;到处、四处","gloss_en":"about or concerning; approximately; (about to) on the point of; around","sense_key":"around"}'::jsonb
 WHERE normalized = 'about' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/wɛl/","pos":"adv.","word":"well","example":{"en":"She sang very well.","cn":"她唱得很好。"},"gloss_cn":"很好地、充分地(adv);(Well,)嗯、好吧;(n.)井","gloss_en":"well or fully; (Well,) an opening remark; (n.) a water well","sense_key":"well"}'::jsonb
 WHERE normalized = 'well' AND target_lang = 'read-v1';
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/lænd/","pos":"n.","word":"land","example":{"en":"The ship reached dry land at last.","cn":"那船终于到了陆地。"},"gloss_cn":"土地、陆地;国家、地方;(v.)降落、使着陆;搞到(land a job)、钓上(land a fish)","gloss_en":"land or ground; a country; (v.) to land; to get (a job) or catch (a fish)","sense_key":"land"}'::jsonb
 WHERE normalized = 'land' AND target_lang = 'read-v1';
-- you'd:缩写中性化(非词汇卡)
UPDATE public.phrase_explanations SET explanation = '{"ipa":"/juːd/","pos":"contraction","word":"you''d","example":{"en":"You''d better hurry.","cn":"你最好快点。"},"gloss_cn":"you would / you had 的缩写","gloss_en":"contraction of \"you would\" or \"you had\"","sense_key":"you''d"}'::jsonb
 WHERE normalized = 'you''d' AND target_lang = 'read-v1';

SELECT 'after' AS phase, normalized, explanation->>'pos' AS pos, explanation->>'gloss_cn' AS gloss_cn, explanation->>'ipa' AS ipa
  FROM public.phrase_explanations
 WHERE target_lang='read-v1' AND normalized IN ('back','got','way','take','right','took','turned','about','well','land','you''d')
 ORDER BY normalized;

COMMIT;
