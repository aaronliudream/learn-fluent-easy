-- 图书馆词库入口可发现性改造 · 前置排查(只读,不改任何数据)
-- 用途:核对四张表的实际列结构 + 今日待复习口径 + funnel_events 读权限
-- 跑法:整段贴进 SQL Editor 跑,把三段结果贴回给 CC。

-- ① 四张表实际列结构
select table_name, column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name in ('funnel_events', 'library_vocab_favorites',
                     'library_vocab_review_daily', 'library_review_streak')
order by table_name, ordinal_position;

-- ② 今日待复习口径实测(北京日 UTC+8;口径 = 未掌握(correct_streak<3) 且 今天还没答对)
--    与前端纯函数 vocabIsDueToday() 完全同源(src/lib/library/favorites.ts:52)
select
  user_id,
  count(*)                                                            as total_fav,
  count(*) filter (where coalesce(correct_streak,0) >= 3)             as mastered,
  count(*) filter (
    where coalesce(correct_streak,0) < 3
      and last_correct_date is distinct from (now() at time zone 'Asia/Shanghai')::date
  )                                                                   as due_today
from public.library_vocab_favorites
group by user_id
order by total_fav desc
limit 20;

-- ③ funnel_events 的 RLS 策略(确认前端普通用户能否 SELECT ——
--    仓库迁移显示 select 仅 admin,若属实则「是否进过词库页」不能从 funnel_events 前端推导)
select polname, polcmd, pg_get_expr(polqual, polrelid) as using_expr,
       pg_get_expr(polwithcheck, polrelid) as check_expr
from pg_policy
where polrelid = 'public.funnel_events'::regclass;
