-- =====================================================================
-- 【测试用·非生产】⑤-A 美语错题 SRS 隔离红线 —— 证明"重做美语错题"不动 SRS 排程
--
-- 铁律:错题本写入(recordAmericanMistake→recordZoneMistake)只写 user_mistakes,
--       从不碰 american_user_mastery;/mistakes 重做只改 user_mistakes.is_resolved。
--       所以在错题本里重做一道美语错题,SRS 的 due_at/next_review_at/lapses/srs_step
--       物理上不可能被改。本脚本用 SQL 前后对账坐实这条(过不了不合)。
--
-- 零占位符可直接跑:用 "8888" 自动定位学生。逐段单独跑。
-- 前提:先在 preview 用 8888 做几道新概念题(关5/6/7/8/10)、故意做错 → 错题入册 +
--       american_user_mastery 有对应 SRS 行(答错入复习池)。
-- =====================================================================

-- ── STEP 0:确认 "8888" 唯一定位到该学生(应恰好 1 行)──────────────────────
select user_id, username, display_name, email
  from public.profiles
 where username ilike '%8888%' or display_name ilike '%8888%' or email ilike '%8888%';

-- ── STEP 1【红线·记录前值】找一道美语错题 + 它的 SRS 行,记下四列 ──────────────
--    美语错题 module ∈ senior_grammar/senior_cloze/hub_listening/hub_reading,
--    source_key 里内嵌 american_questions.id(= american_user_mastery.item_id)。
select um.id            as mistake_id,
       um.module,
       um.source_label,
       um.is_resolved,
       um.correct_streak,
       aum.item_id,
       aum.due_at,                                   -- ← 红线1
       aum.next_review_at,                           -- ← 红线2
       aum.lapses,                                   -- ← 红线3
       aum.mastery_matrix->>'srs_step' as srs_step   -- ← 红线4
  from public.user_mistakes um
  join public.american_user_mastery aum
    on aum.user_id = um.user_id
   and aum.item_type = 'am_question'
   and um.source_key like '%' || aum.item_id::text || '%'
 where um.user_id = (select user_id from public.profiles
                      where username ilike '%8888%' or display_name ilike '%8888%' or email ilike '%8888%'
                      limit 1)
   and um.module in ('senior_grammar','senior_cloze','hub_listening','hub_reading')
   and um.is_resolved = false
 order by um.last_wrong_at desc
 limit 5;
-- 【记下上面某一行的 item_id 及其 due_at / next_review_at / lapses / srs_step 四个值。】


-- ── STEP 2【操作】回 preview,进 /mistakes,把这道美语错题「重做并做对」 ─────────
--    (跨3天连对规则下:做对 → correct_streak +1;若达 3 才移出。无论是否移出,
--     SRS 四列都不该变——重做只改 user_mistakes,碰不到 american_user_mastery。)


-- ── STEP 3【红线·对账】复查同一 item_id 的 SRS 四列,必须与 STEP 1 完全一致 ───────
select item_id,
       due_at,
       next_review_at,
       lapses,
       mastery_matrix->>'srs_step' as srs_step
  from public.american_user_mastery
 where item_type = 'am_question'
   and item_id = '<把 STEP 1 记下的 item_id 填这里>';
-- ✅ 通过 = 四列与 STEP 1 逐字相同;user_mistakes 该行 correct_streak 已 +1(或已移出)。
-- ❌ 任一列变了 = 隔离被破坏,别合,叫我查。


-- ── STEP 4【反向·应有行为】在美语课里正常做一道题 → SRS 与错题本各写各的 ──────────
--    (这是应有的,不是污染:做题时 recordMastery 推进 SRS、recordAmericanMistake 记错题本,
--     两条独立。仅"在错题本里重做"时 SRS 必须不动 —— 那才是红线。)
-- =====================================================================
