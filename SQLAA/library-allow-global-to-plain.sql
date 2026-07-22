-- ============================================================================
-- allow 全局卡:chunk 卡(老式"承认")→ 普通词卡"允许"(网页版 Claude 审定·B 方案)。
-- 起因:allow 的 chunk 卡是全局共享的,"承认"义泄漏到所有书的普通点词
--   (Oz "allow me to join"、Tom 9 处 allow 里 8 处"允许/被允许" 全被读成"承认")。
-- 配套:library-chunks-tom-sawyer-ch34.sql 已把 Tom seq4952 的单词 chunk 换成
--   多词 chunk "willing to allow"=愿意承认,保住那一处古义
--   (Aunt Polly "I'm willing to allow" = 我愿意承认错怪了汤姆)。
-- ⚠️ 两个 SQL 一起跑(顺序无关,touch 不同对象:本文件改 allow 词卡;ch34 那个改 chunk 索引 + 建 willing to allow 卡)。
-- 幂等 UPDATE。BEGIN/COMMIT + 前后核验。
-- ============================================================================
BEGIN;

SELECT 'before' AS phase,
       explanation->>'kind'    AS kind,
       explanation->>'pos'     AS pos,
       explanation->>'gloss_cn' AS gloss_cn
  FROM public.phrase_explanations
 WHERE normalized = 'allow' AND target_lang = 'read-v1';

UPDATE public.phrase_explanations
   SET explanation = '{"ipa":"/əˈlaʊ/","pos":"v.","word":"allow","example":{"en":"Her parents allowed her to stay up late.","cn":"她父母允许她晚点睡。"},"gloss_cn":"允许、让","gloss_en":"to allow, to let, to permit","sense_key":"allow"}'::jsonb
 WHERE normalized = 'allow' AND target_lang = 'read-v1';

SELECT 'after' AS phase,
       explanation->>'kind'    AS kind,
       explanation->>'pos'     AS pos,
       explanation->>'gloss_cn' AS gloss_cn
  FROM public.phrase_explanations
 WHERE normalized = 'allow' AND target_lang = 'read-v1';

COMMIT;
