-- =============================================================
-- U1/U2 volume 迁移 'g9' → '9'(统一九年级 volume，根治语法总览双tab）
-- 方式：UPDATE（保留 row id → 听力 audio_url / 用户掌握度 / point_id 关联全不丢）
-- vocab 例外：'9' 下已有骨架(U1=31/U2=39) → 先删骨架，再把官方 'g9' 改 '9'
-- grammar_questions 无 volume 列，经 point_id 关联，points 改了它自动跟随
-- 单事务，无空窗期。分步 count 见文件末尾（DELETE/INSERT 不分跑，整体原子）
-- =============================================================

-- ---- [迁前 count]（参考，应：vocab g9=29/29、9骨架=31/39；题库 g9 各 3/6/6/6/1）----
SELECT 'PRE g9' tag, 'vocab' t, volume, unit, count(*) FROM public.junior_vocab WHERE grade=9 AND volume IN ('g9','9') AND unit IN ('U1','U2') GROUP BY volume,unit ORDER BY unit,volume;

BEGIN;

-- 1) vocab：先删 '9' 骨架(无IPA/无chunk)，再把官方 'g9' 改 '9'
DELETE FROM public.junior_vocab WHERE grade=9 AND volume='9'  AND unit IN ('U1','U2');
UPDATE public.junior_vocab SET volume='9' WHERE grade=9 AND volume='g9' AND unit IN ('U1','U2');

-- 2) 题库 5 表：'g9' 下无碰撞('9' 全 0)，直接 UPDATE volume
UPDATE public.junior_grammar_points        SET volume='9' WHERE grade=9 AND volume='g9' AND unit IN ('U1','U2');
UPDATE public.junior_reading               SET volume='9' WHERE grade=9 AND volume='g9' AND unit IN ('U1','U2');
UPDATE public.junior_cloze                 SET volume='9' WHERE grade=9 AND volume='g9' AND unit IN ('U1','U2');
UPDATE public.junior_listening_exercises   SET volume='9' WHERE grade=9 AND volume='g9' AND unit IN ('U1','U2');
UPDATE public.junior_writing_prompts       SET volume='9' WHERE grade=9 AND volume='g9' AND unit IN ('U1','U2');

COMMIT;

-- ---- [迁后校验] ----
-- a) 'g9' 应全部 = 0
SELECT 'POST g9应0' tag, 'vocab' t, count(*) v FROM public.junior_vocab WHERE grade=9 AND volume='g9' AND unit IN ('U1','U2')
UNION ALL SELECT 'POST g9应0','grammar_points', count(*) FROM public.junior_grammar_points WHERE grade=9 AND volume='g9' AND unit IN ('U1','U2')
UNION ALL SELECT 'POST g9应0','reading', count(*) FROM public.junior_reading WHERE grade=9 AND volume='g9' AND unit IN ('U1','U2')
UNION ALL SELECT 'POST g9应0','cloze', count(*) FROM public.junior_cloze WHERE grade=9 AND volume='g9' AND unit IN ('U1','U2')
UNION ALL SELECT 'POST g9应0','listening', count(*) FROM public.junior_listening_exercises WHERE grade=9 AND volume='g9' AND unit IN ('U1','U2')
UNION ALL SELECT 'POST g9应0','writing', count(*) FROM public.junior_writing_prompts WHERE grade=9 AND volume='g9' AND unit IN ('U1','U2');

-- b) '9' 应 = 旧 g9 count（vocab 29/29、grammar_points 3/3、reading 6/6、cloze 6/6、listening 6/6、writing 1/1）
SELECT '9' volume, unit, 'vocab' t, count(*) v FROM public.junior_vocab WHERE grade=9 AND volume='9' AND unit IN ('U1','U2') GROUP BY unit
UNION ALL SELECT '9', unit, 'grammar_points', count(*) FROM public.junior_grammar_points WHERE grade=9 AND volume='9' AND unit IN ('U1','U2') GROUP BY unit
UNION ALL SELECT '9', unit, 'reading', count(*) FROM public.junior_reading WHERE grade=9 AND volume='9' AND unit IN ('U1','U2') GROUP BY unit
UNION ALL SELECT '9', unit, 'cloze', count(*) FROM public.junior_cloze WHERE grade=9 AND volume='9' AND unit IN ('U1','U2') GROUP BY unit
UNION ALL SELECT '9', unit, 'listening', count(*) FROM public.junior_listening_exercises WHERE grade=9 AND volume='9' AND unit IN ('U1','U2') GROUP BY unit
UNION ALL SELECT '9', unit, 'writing', count(*) FROM public.junior_writing_prompts WHERE grade=9 AND volume='9' AND unit IN ('U1','U2') GROUP BY unit
ORDER BY unit, t;

-- c) vocab 查重(应 0 行)
SELECT word, unit, count(*) FROM public.junior_vocab WHERE grade=9 AND volume='9' AND unit IN ('U1','U2') GROUP BY word, unit HAVING count(*) > 1;

-- d) 听力 audio_url 应仍非空(UPDATE 保留;应 U1=6/U2=6)
SELECT unit, count(*) FILTER (WHERE audio_url IS NOT NULL) audio_ok, count(*) total FROM public.junior_listening_exercises WHERE grade=9 AND volume='9' AND unit IN ('U1','U2') GROUP BY unit ORDER BY unit;
