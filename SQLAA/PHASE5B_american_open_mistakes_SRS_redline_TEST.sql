-- =====================================================================
-- 【测试用·非生产】⑤-B 美语「开放题」(情景应答/句型转换)错题 SRS 隔离 + 1次移出红线
--
-- 开放题(关9情景应答 + 关5/10 reveal 转换题)= reveal 型、靠学生自评,规则与 MCQ 不同:
--   · 入册:自评「错」→ user_mistakes 一条 question_type='open' 行(module=american_scenario)。
--   · 移出:错题本里「看参考答案 → 我会了」→ **1 次直接 is_resolved=true**(不走跨3天连对、
--     correct_streak 恒为 0)。「还不会」→ 留册。
--   · SRS:reveal 型的 selfGrade **从不调 recordMastery**(只调 onRecordMistake)→ 开放题
--     在 american_user_mastery **根本没有 SRS 行**;错题本重做只改 user_mistakes.is_resolved,
--     物理上碰不到 SRS。本脚本前后对账坐实这条(过不了不合)。
--
-- 零占位符可直接跑:用 "8888" 自动定位学生。逐段单独跑。
-- 前提:先在 preview 用 8888 做关9情景应答(或关5/10转换题),自评「还不会/错」→ 开放题入册。
-- =====================================================================

-- ── STEP 0:确认 "8888" 唯一定位到该学生(应恰好 1 行)──────────────────────
select user_id, username, display_name, email
  from public.profiles
 where username ilike '%8888%' or display_name ilike '%8888%' or email ilike '%8888%';


-- ── STEP 1【记录前值】列出该生所有「开放题」错题(question_type='open')────────────
--    应满足:module='american_scenario'、snapshot.question_type='open'、correct_streak=0、
--    is_resolved=false;snapshot 带 reference_answer(参考答案,重做时「看参考答案」揭晓)。
select um.id            as mistake_id,
       um.module,                                        -- 期望 american_scenario
       um.source_label,
       um.is_resolved,                                   -- 期望 false
       um.correct_streak,                                -- 期望 0(开放题不累计)
       um.snapshot->>'question_type' as q_type,          -- 期望 open
       left(um.snapshot->>'reference_answer', 40) as ref_answer_preview
  from public.user_mistakes um
 where um.user_id = (select user_id from public.profiles
                      where username ilike '%8888%' or display_name ilike '%8888%' or email ilike '%8888%'
                      limit 1)
   and um.snapshot->>'question_type' = 'open'
 order by um.last_wrong_at desc
 limit 10;
-- 【记下上面某一行的 mistake_id 及 source_key(下段用)。】


-- ── STEP 2【红线·SRS 无足迹】证明这些开放题在 american_user_mastery 里没有任何 SRS 行 ──
--    reveal 型 selfGrade 不调 recordMastery → 开放题本就没写过 SRS 表。此查询应返回 0 行。
select aum.item_id, aum.due_at, aum.next_review_at, aum.lapses,
       aum.mastery_matrix->>'srs_step' as srs_step
  from public.american_user_mastery aum
 where aum.user_id = (select user_id from public.profiles
                       where username ilike '%8888%' or display_name ilike '%8888%' or email ilike '%8888%'
                       limit 1)
   and aum.item_type = 'am_question'
   and exists (
     select 1 from public.user_mistakes um
      where um.user_id = aum.user_id
        and um.snapshot->>'question_type' = 'open'
        and um.source_key like '%' || aum.item_id::text || '%'
   );
-- ✅ 期望 0 行 = 开放题 SRS 零足迹。若有行 = reveal 竟写了 recordMastery,叫我查。


-- ── STEP 3【操作】回 preview,进 /mistakes,把这道开放题「看参考答案 → 我会了」 ─────────
--    (开放题规则:1 次「我会了」= 直接移出,不走跨3天连对。参考答案带 TTS 朗读。
--     「还不会」= 不移出、留册。)


-- ── STEP 4【对账】复查同一 mistake_id:is_resolved=true、correct_streak 仍为 0 ──────────
select id            as mistake_id,
       is_resolved,                                      -- ✅ 期望 true(1 次移出)
       correct_streak,                                   -- ✅ 期望 仍 0(没搬 streak)
       snapshot->>'question_type' as q_type
  from public.user_mistakes
 where id = '<把 STEP 1 记下的 mistake_id 填这里>';
-- ✅ 通过 = is_resolved=true 且 correct_streak=0(开放题 1 次移出、不走连对)。
-- ❌ correct_streak 变了、或没移出 = 规则串了,别合,叫我查。


-- ── STEP 5【红线·SRS 复查】重做后再跑一次 STEP 2,仍应 0 行(移出没碰 SRS)───────────
--    (直接重跑 STEP 2 即可:重做只改 user_mistakes.is_resolved,american_user_mastery 不动。)
-- =====================================================================
