-- =====================================================================
-- 【诊断·非生产】③-B 高中水平诊断错题接入验证 —— 8888 做错的诊断题进 senior_grammar
--
-- ③-B:GaokaoDiagnostic(/gaokao/diagnostic)做错 → recordSeniorGrammarMistake →
--      user_mistakes(module='senior_grammar', source_key='grammar:<q.id>',
--      source_label='水平诊断·<考点>')。与语法专项同桶、同 source_key → 做对(跨3天连对)
--      或去专项做对同题都能移出。零 SQL 改动,纯前端写入。
-- 零占位符可直接跑。前提:先在 preview 用 8888 做 /gaokao/diagnostic,故意做错几题。
-- 8888 user_id = 3c7ef843-f99e-4dbf-97f3-40758112fd9f
-- =====================================================================

-- ── A【诊断错题已入册】source_label 带「水平诊断」的 senior_grammar 行 ─────────────────
select id,
       module,                                          -- 期望 senior_grammar
       source_label,                                    -- 期望 水平诊断·<考点标题>
       left(question, 46)                  as stem_preview,
       user_answer, correct_answer,
       snapshot->>'question_type'          as q_type,   -- 期望 mcq
       (snapshot ? 'options')              as has_options, -- 期望 true(全选项 A/B/C/D)
       is_resolved, correct_streak,
       to_char((last_wrong_at at time zone 'Asia/Shanghai'),'MM-DD HH24:MI') as wrong_bj
  from public.user_mistakes
 where user_id = '3c7ef843-f99e-4dbf-97f3-40758112fd9f'
   and module = 'senior_grammar'
   and source_label like '水平诊断%'
 order by last_wrong_at desc
 limit 15;
-- ✅ 有行 = 诊断错题进了统一错题本(带全选项快照、来源=水平诊断·考点)。
-- ❌ 空 = 没写进,回来我查 pick() 钩子。


-- ── B【同桶·同钥匙】确认 source_key = 'grammar:<uuid>'(与语法专项同格式,可互相移出)──────
select source_key,
       (source_key ~ '^grammar:[0-9a-f-]{36}$') as key_shape_ok  -- 期望 true
  from public.user_mistakes
 where user_id = '3c7ef843-f99e-4dbf-97f3-40758112fd9f'
   and module = 'senior_grammar'
   and source_label like '水平诊断%'
 order by last_wrong_at desc
 limit 15;
-- ✅ key_shape_ok 全 true = source_key 与语法专项同格式(grammar:<题目uuid>),
--    以后在语法专项做对同题会按同一把钥匙自动移出(跨3天连对),不重复堆卡。
-- =====================================================================
