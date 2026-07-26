-- 图书馆词库入口埋点 · 上线后读数(只读,不改任何数据)
-- 什么时候跑:埋点分支上线、跑满 3 天之后。一条一条跑(SQL Editor 一次只回最后一条的结果)。

-- ① 总览:每个事件 × 每个分段 的事件数与人数
select
  event_name,
  step as segment,
  count(*)                                   as events,
  count(distinct coalesce(user_id::text, session_id)) as people
from public.funnel_events
where event_name like 'library_vocab_%'
  and created_at >= now() - interval '3 days'
group by event_name, step
order by event_name, step;

-- ② 入口转化率:看到入口的人里,有多少点进去了(按分段拆开 —— 这是"救了哪类人"的核心指标)
with v as (
  select step as segment, coalesce(user_id::text, session_id) as who
  from public.funnel_events
  where event_name = 'library_vocab_entry_view'
    and created_at >= now() - interval '3 days'
),
c as (
  select step as segment, coalesce(user_id::text, session_id) as who
  from public.funnel_events
  where event_name = 'library_vocab_entry_click'
    and created_at >= now() - interval '3 days'
)
select
  v.segment,
  count(distinct v.who)                                        as saw,
  count(distinct c.who)                                        as clicked,
  round(100.0 * count(distinct c.who) / nullif(count(distinct v.who), 0), 1) as click_pct
from v left join c on c.who = v.who and c.segment = v.segment
group by v.segment
order by v.segment;

-- ③ 收藏行为:首次收藏 vs 后续收藏,按分段
select
  step as segment,
  (metadata->>'is_first_favorite')::boolean as is_first,
  count(*)                                   as favorites,
  count(distinct user_id)                    as people
from public.funnel_events
where event_name = 'library_vocab_favorite_add'
  and created_at >= now() - interval '3 days'
group by step, (metadata->>'is_first_favorite')::boolean
order by segment, is_first desc;

-- ④ B 类阅读页提示:发出去多少次、之后这些人有没有开始收藏
select
  count(*)                as hint_shown,
  count(distinct user_id) as people
from public.funnel_events
where event_name = 'library_vocab_b_hint_view'
  and created_at >= now() - interval '3 days';

-- ⑤ 收藏发生在哪本书哪一章(看引导是不是集中在某几章,或某本书特别能带收藏)
select
  metadata->>'book_key'   as book_key,
  (metadata->>'chapter_idx')::int as chapter_idx,
  count(*)                as favorites
from public.funnel_events
where event_name = 'library_vocab_favorite_add'
  and created_at >= now() - interval '3 days'
group by 1, 2
order by favorites desc
limit 20;
