-- ============================================================================
-- 图书馆点词专名事实卡 · 伊索(aesop) 5张(proper:true,无收藏钮)。CC手写·Aaron逐条核事实后跑。
-- 5神名/地名:Jupiter/Juno/Hercules/Prometheus/Rhodes。事实性内容(谁是谁·在哪),非抽验→逐条核。
-- 补查:Venus/Neptune 全书0处;Fortune/Death 作普通词已有卡。专名维持5个。
-- INSERT..ON CONFLICT 幂等。美音IPA。四本共享 read-v1。
-- ============================================================================
BEGIN;
SELECT 'before' AS phase,(SELECT count(*) FROM public.phrase_explanations WHERE target_lang='read-v1') AS n;

INSERT INTO public.phrase_explanations (phrase, normalized, source_lang, target_lang, explanation) VALUES
  ('Jupiter', 'jupiter', 'en', 'read-v1', '{"ipa":"/ˈdʒuːpɪtər/","pos":"专名·神名","word":"Jupiter","gloss_cn":"朱庇特：罗马神话的众神之王，天空与雷电之神，相当于希腊神话的宙斯(Zeus)","gloss_en":"Jupiter, king of the Roman gods and god of sky and thunder; the Roman counterpart of the Greek Zeus","proper":true}'::jsonb),
  ('Juno', 'juno', 'en', 'read-v1', '{"ipa":"/ˈdʒuːnoʊ/","pos":"专名·神名","word":"Juno","gloss_cn":"朱诺：罗马神话的天后，朱庇特之妻，掌管婚姻，相当于希腊神话的赫拉(Hera)","gloss_en":"Juno, queen of the Roman gods and wife of Jupiter, goddess of marriage; the Roman counterpart of the Greek Hera","proper":true}'::jsonb),
  ('Hercules', 'hercules', 'en', 'read-v1', '{"ipa":"/ˈhɜːrkjəliːz/","pos":"专名·英雄","word":"Hercules","gloss_cn":"赫拉克勒斯：希腊罗马神话中力大无穷的半神英雄，以完成十二项艰巨任务闻名","gloss_en":"Hercules, a hero of superhuman strength in Greek and Roman myth, famed for completing twelve great labors","proper":true}'::jsonb),
  ('Prometheus', 'prometheus', 'en', 'read-v1', '{"ipa":"/prəˈmiːθiəs/","pos":"专名·神名","word":"Prometheus","gloss_cn":"普罗米修斯：希腊神话中的泰坦神，用泥土造人，并为人类从天上盗取火种","gloss_en":"Prometheus, a Titan in Greek myth who shaped humankind from clay and stole fire from heaven for them","proper":true}'::jsonb),
  ('Rhodes', 'rhodes', 'en', 'read-v1', '{"ipa":"/roʊdz/","pos":"专名·地名","word":"Rhodes","gloss_cn":"罗得岛：希腊爱琴海东南部的岛屿，临近土耳其海岸","gloss_en":"Rhodes, a Greek island in the southeastern Aegean Sea, near the coast of Turkey","proper":true}'::jsonb)
ON CONFLICT (normalized, target_lang) DO UPDATE SET phrase=EXCLUDED.phrase, explanation=EXCLUDED.explanation, updated_at=now();

SELECT 'after' AS phase,(SELECT count(*) FROM public.phrase_explanations WHERE target_lang='read-v1') AS n;
COMMIT;
