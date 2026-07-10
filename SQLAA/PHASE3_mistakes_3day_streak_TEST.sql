-- =====================================================================
-- 【测试用·非生产】跨3天连对移出 —— 用 SQL 改日期模拟跨天,验 2/3、3/3 移出
--
-- 本文件已改成【零占位符·可直接跑】:用 "8888" 自动定位学生、自动选该生最近一条
-- 未解决错题。逐段单独跑(一段一段选中执行),别整文件一次跑。
--
-- 前提:先在 preview 上用 8888 学生【做错一道题、再做对一次】→ 该错题
--       correct_streak=1、last_correct_date=今天(北京时间)。再跑下面的段落模拟跨天。
--
-- ⚠️ 若你的 8888 学生不是靠用户名/昵称/邮箱含 "8888" 识别,先跑 STEP 0 确认;
--    只匹配到 1 行才安全。匹配到多行/空 → 把下面所有 `(select ... ilike '%8888%' ...)`
--    子查询替换成写死的 uuid:'xxxxxxxx-....'。
-- =====================================================================

-- ── STEP 0:确认 "8888" 唯一定位到该学生(应恰好 1 行)──────────────────────
select user_id, username, display_name, email
  from public.profiles
 where username ilike '%8888%' or display_name ilike '%8888%' or email ilike '%8888%';

-- ── STEP 1:看该生当前未解决错题(确认将被下面自动选中的是哪条:最上面那条)──
select id, module, source_key, correct_streak, last_correct_date, is_resolved, last_wrong_at
  from public.user_mistakes
 where user_id = (select user_id from public.profiles
                   where username ilike '%8888%' or display_name ilike '%8888%' or email ilike '%8888%'
                   limit 1)
   and is_resolved = false
 order by last_wrong_at desc
 limit 20;


-- ── A)模拟"昨天已连对 1 次":把最近一条未解决错题的 last_correct_date 推到昨天 ──
--    跑完回 preview 再做对一次 → correct_streak 1→2、卡片"巩固 2/3"。
with t as (
  select id from public.user_mistakes
   where user_id = (select user_id from public.profiles
                     where username ilike '%8888%' or display_name ilike '%8888%' or email ilike '%8888%'
                     limit 1)
     and is_resolved = false
   order by last_wrong_at desc
   limit 1
)
update public.user_mistakes um
   set last_correct_date = (now() at time zone 'Asia/Shanghai')::date - 1
  from t
 where um.id = t.id
returning um.id, um.module, um.source_key, um.correct_streak, um.last_correct_date;


-- ── B)直接推到 2/昨天 → 下一次做对触发 3/3 移出 ─────────────────────────────
--    跑完回 preview 再做对一次 → RPC 置 correct_streak=3、is_resolved=true 移出,
--    错题卡消失 + 撒花;老师端该题也随 is_resolved=true 消失。
with t as (
  select id from public.user_mistakes
   where user_id = (select user_id from public.profiles
                     where username ilike '%8888%' or display_name ilike '%8888%' or email ilike '%8888%'
                     limit 1)
     and is_resolved = false
   order by last_wrong_at desc
   limit 1
)
update public.user_mistakes um
   set correct_streak = 2,
       last_correct_date = (now() at time zone 'Asia/Shanghai')::date - 1
  from t
 where um.id = t.id
returning um.id, um.module, um.source_key, um.correct_streak, um.is_resolved;


-- ── C)纯 SQL 模拟"跨天做对一次"(等价 RPC,但按显式 uid,SQL 编辑器里可直接跑)──
--    RPC bump_mistake_correct 用 auth.uid(),SQL 编辑器里没有登录会话 → 跑不出效果;
--    本段等价复刻其逻辑,不需要 preview 就能验完整 1→2→3 移出:
--    连跑 3 遍即可 —— 每遍会自动把日期算成"跨天"(因为它自己把 last_correct_date 设成今天,
--    下一遍前需再把日期推回昨天:所以标准跑法 = 先跑 A、再跑本段,如此 3 轮)。
with t as (
  select id, coalesce(correct_streak,0) as cs, last_correct_date,
         (now() at time zone 'Asia/Shanghai')::date as today
    from public.user_mistakes
   where user_id = (select user_id from public.profiles
                     where username ilike '%8888%' or display_name ilike '%8888%' or email ilike '%8888%'
                     limit 1)
     and is_resolved = false
   order by last_wrong_at desc
   limit 1
)
update public.user_mistakes um
   set correct_streak    = case when t.last_correct_date = t.today then um.correct_streak else t.cs + 1 end,
       last_correct_date = t.today,
       is_resolved       = case when t.last_correct_date = t.today then um.is_resolved else (t.cs + 1 >= 3) end,
       updated_at        = now()
  from t
 where um.id = t.id
returning um.id, um.correct_streak, um.is_resolved, um.last_correct_date;


-- ── 复位(重验时清零该生最近一条错题)──────────────────────────────────────
-- with t as (
--   select id from public.user_mistakes
--    where user_id = (select user_id from public.profiles
--                      where username ilike '%8888%' or display_name ilike '%8888%' or email ilike '%8888%'
--                      limit 1)
--    order by last_wrong_at desc limit 1
-- )
-- update public.user_mistakes um
--    set correct_streak = 0, last_correct_date = null, is_resolved = false
--   from t where um.id = t.id
-- returning um.id, um.correct_streak, um.is_resolved;
-- =====================================================================
