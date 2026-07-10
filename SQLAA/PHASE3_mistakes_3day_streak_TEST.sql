-- =====================================================================
-- 【测试用·非生产】跨3天连对移出 —— 用 SQL 改日期模拟跨天,验 2/3、3/3 移出
--
-- 前提:先在 preview 上用 8888 学生做错一道题、再做对一次 → 该错题 correct_streak=1、
--       last_correct_date=今天(北京时间)。以下 SQL 把日期往前推,模拟"隔天再做对"。
--
-- ⚠️ 改成你要验的那条错题的 source_key / user_id。先查出来:
--   select id, module, source_key, correct_streak, last_correct_date, is_resolved
--     from public.user_mistakes
--    where user_id = '<8888的uid>' and is_resolved = false
--    order by last_wrong_at desc limit 20;
-- =====================================================================

-- ── A) 把 last_correct_date 改成"昨天",让下一次做对能 +1(模拟跨天)──────────
--    验:改完回 preview 再做对一次 → 应 correct_streak 1→2、卡片"巩固 2/3"。
update public.user_mistakes
   set last_correct_date = (now() at time zone 'Asia/Shanghai')::date - 1
 where user_id = '<8888的uid>'
   and source_key = '<要验的错题 source_key>'
   and is_resolved = false;

-- ── B) 直接把连对推到 2 且日期设昨天 → 下一次做对触发 3/3 移出 ────────────────
--    验:改完回 preview 再做对一次 → RPC 置 correct_streak=3、is_resolved=true 移出,
--        错题卡消失 + 撒花;老师端该题也随 is_resolved=true 消失。
update public.user_mistakes
   set correct_streak = 2,
       last_correct_date = (now() at time zone 'Asia/Shanghai')::date - 1,
       is_resolved = false
 where user_id = '<8888的uid>'
   and source_key = '<要验的错题 source_key>';

-- ── C) 直接调 RPC 验逻辑(不经前端)。以 8888 身份登录的会话里跑才有 auth.uid()。──
--    连续跑 3 次(每次前把 last_correct_date 用 A 往前推一天)应最终 is_resolved=true。
-- select * from public.bump_mistake_correct('<module>', '<source_key>');

-- ── D) 防刷验证:同天再调一次 RPC → already_today=true、correct_streak 不变。────
-- select * from public.bump_mistake_correct('<module>', '<source_key>');

-- ── 复位(重验时清零)────────────────────────────────────────────────────────
-- update public.user_mistakes
--    set correct_streak = 0, last_correct_date = null, is_resolved = false
--  where user_id = '<8888的uid>' and source_key = '<source_key>';
-- =====================================================================
