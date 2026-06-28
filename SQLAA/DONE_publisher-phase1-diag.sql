-- ============================================================
-- 出版社分叉 Phase 1 · 只读诊断(Aaron 跑,贴结果给 CC)。不改任何东西。
-- 目的:① 确认所有带 volume 列的内容表 ② 列出这些表的唯一约束/唯一索引(conname + def),
--      好确定哪些要"删旧唯一约束、建含 publisher 的新唯一约束"。
-- ============================================================

-- ① 所有带 volume 列的表(确认分叉目标表集,别漏)
SELECT table_name
FROM information_schema.columns
WHERE table_schema='public' AND column_name='volume'
ORDER BY table_name;

-- ② 这些内容表上的唯一约束(unique constraint)定义
SELECT c.conrelid::regclass AS tbl, c.conname, pg_get_constraintdef(c.oid) AS def
FROM pg_constraint c
WHERE c.contype='u'
  AND c.conrelid::regclass::text IN (
    'public.junior_vocab','public.junior_grammar_points','public.junior_reading',
    'public.junior_cloze','public.junior_listening_exercises','public.junior_listening_items',
    'public.junior_writing_prompts','public.junior_grammar_tips','public.context_questions',
    'public.junior_grammar_questions')
ORDER BY tbl, conname;

-- ③ 这些内容表上的唯一索引(unique index,含未走 constraint 的)
SELECT schemaname||'.'||tablename AS tbl, indexname, indexdef
FROM pg_indexes
WHERE schemaname='public'
  AND tablename IN ('junior_vocab','junior_grammar_points','junior_reading','junior_cloze',
    'junior_listening_exercises','junior_listening_items','junior_writing_prompts','junior_grammar_tips',
    'context_questions','junior_grammar_questions')
  AND indexdef ILIKE '%UNIQUE%'
ORDER BY tbl, indexname;

-- ④ 进度表确认无 volume(保证它们不在分叉目标里,零触碰)
SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema='public'
  AND table_name IN ('junior_user_mastery','junior_word_mastery','mastery_progress','gaokao_user_mastery')
  AND column_name IN ('volume','publisher')
ORDER BY table_name, column_name;

-- ⑤ 各内容表当前总行数(迁移前基线,迁移后比对总数不变)
SELECT 'junior_vocab' t, count(*) n FROM public.junior_vocab
UNION ALL SELECT 'junior_grammar_points', count(*) FROM public.junior_grammar_points
UNION ALL SELECT 'junior_reading', count(*) FROM public.junior_reading
UNION ALL SELECT 'junior_cloze', count(*) FROM public.junior_cloze
UNION ALL SELECT 'junior_listening_exercises', count(*) FROM public.junior_listening_exercises
UNION ALL SELECT 'junior_listening_items', count(*) FROM public.junior_listening_items
UNION ALL SELECT 'junior_writing_prompts', count(*) FROM public.junior_writing_prompts
UNION ALL SELECT 'junior_grammar_tips', count(*) FROM public.junior_grammar_tips
UNION ALL SELECT 'context_questions', count(*) FROM public.context_questions
UNION ALL SELECT 'junior_grammar_questions', count(*) FROM public.junior_grammar_questions
ORDER BY t;

-- ⑥ 进度三表 + gaokao_user_mastery 当前行数(迁移前后必须完全不变)
SELECT 'junior_user_mastery' t, count(*) n FROM public.junior_user_mastery
UNION ALL SELECT 'junior_word_mastery', count(*) FROM public.junior_word_mastery
UNION ALL SELECT 'mastery_progress', count(*) FROM public.mastery_progress
UNION ALL SELECT 'gaokao_user_mastery', count(*) FROM public.gaokao_user_mastery
ORDER BY t;
