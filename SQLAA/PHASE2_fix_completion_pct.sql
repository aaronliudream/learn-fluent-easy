-- =====================================================================
-- 教师功能 Phase 2 · P0 BUGFIX — 完成度爆表(初中153%/高中288%)
--
-- 根因:mastery_stage_proportion 里
--   stage_total = 该生在该 stage 已练的 item 数(不是语料总量);
--   user_total  = SUM(stage_total) = 该生跨所有 stage 的已练总数。
-- 原 RPC 把 completion 算成 user_total / stage_total(跨stage总和 ÷ 单stage)
--   → 507/331=153%、507/176=288%。二列都不是"语料总量",视图里也没有语料总量。
--
-- 修法(同口径比值,恒 ≤100%):三板块完成度 = 已掌握项 /(该 stage)已学项
--   touched      = master_count + fluent_count  (已掌握到位项)
--   scope_total  = stage_total                  (该 stage 已练项数)
--   completion   = round(100 * touched / scope_total)
--   已掌握 ⊆ 已学 → 分子恒 ≤ 分母 → 恒 ≤100%,【不做 min(100) 封顶】:
--   靠正确口径保证不超,而非掩盖;真超 100% 说明口径又错了,应暴露不藏。
-- american 口径不变(册内已完成课/册总课数,done ≤ 册总课数,同样恒 ≤100%,不封顶)。
-- 掌握度 score_pct(质量)不动。只 create-or-replace 本 RPC,不动另两个 RPC、不动前端。
-- 幂等,可重复跑。
-- =====================================================================

create or replace function public.get_student_module_progress(_student_id uuid)
returns table(
  module          text,
  mastery_pct     int,
  mastered_count  int,
  weak_count      int,
  touched         int,
  scope_total     int,
  completion_pct  int,
  minutes_7d      int,
  minutes_total   int,
  last_active_at  timestamptz,
  current_lesson  text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.class_members cm
    join public.classes c on c.id = cm.class_id
    where cm.member_id = _student_id
      and c.teacher_id = auth.uid()
      and cm.removed_at is null
  ) then return; end if;

  return query
  with hb as (
    select case segment when 'gaokao' then 'senior' else segment end as m,
           (coalesce(sum(active_seconds) filter (where created_at >= now() - interval '7 days'), 0) / 60)::int as min7,
           (coalesce(sum(active_seconds), 0) / 60)::int as mintot,
           max(created_at) as last_at
    from public.learning_heartbeats
    where user_id = _student_id
      and segment in ('primary','junior','gaokao','american')
    group by 1
  ),
  am_latest as (
    select lesson_id from public.american_lesson_progress
    where user_id = _student_id
    order by completed_at desc limit 1
  ),
  am_book as (select split_part(lesson_id, '_', 1) as book from am_latest),
  am_scope as (
    select count(*)::int as tot from public.american_lessons
    where id like ((select book from am_book) || '_%')
  ),
  am_done as (
    select count(*)::int as done from (
      select lp.lesson_id
      from public.american_lesson_progress lp
      where lp.user_id = _student_id
        and lp.lesson_id like ((select book from am_book) || '_%')
      group by lp.lesson_id
      having count(distinct lp.stage) >= 10
    ) t
  ),
  am_mast as (
    select count(*) filter (where mastery_level >= 4)::int                        as mastered,
           count(*) filter (where mastery_level < 4 and wrong_count > 0)::int      as weak,
           count(*)::int                                                           as attempted
    from public.american_user_mastery where user_id = _student_id
  ),
  am_cur as (
    select (case split_part(l.id, '_', 1)
              when 'am1' then '第一册' when 'am2' then '第二册'
              else split_part(l.id, '_', 1) end
            || ' L' || l.lesson_no) as label
    from am_latest al join public.american_lessons l on l.id = al.lesson_id
  )
  -- 三板块:完成度 = 已掌握项 /(该 stage)已学项,恒 ≤100%
  select v.stage::text,
         coalesce(msp.score_pct, 0)::int                                              as mastery_pct,
         (coalesce(msp.master_count,0) + coalesce(msp.fluent_count,0))::int           as mastered_count,
         coalesce(msp.weak_count, 0)::int                                             as weak_count,
         (coalesce(msp.master_count,0) + coalesce(msp.fluent_count,0))::int           as touched,       -- 已掌握项(分子)
         coalesce(msp.stage_total, 0)::int                                            as scope_total,   -- 该 stage 已学项(分母)
         case when coalesce(msp.stage_total,0) > 0
              then round(100.0 * (coalesce(msp.master_count,0) + coalesce(msp.fluent_count,0)) / msp.stage_total)::int
              else 0 end                                                              as completion_pct,
         coalesce(hb.min7, 0), coalesce(hb.mintot, 0), hb.last_at, null::text
  from (values ('primary'),('junior'),('senior')) v(stage)
  left join public.mastery_stage_proportion msp
         on msp.user_id = _student_id and msp.stage = v.stage
  left join hb on hb.m = v.stage

  union all
  -- american:册内已完成课 / 册总课数(不变),加 least(100,…) 兜底
  select 'american',
         case when (select attempted from am_mast) > 0
              then round(100.0 * (select mastered from am_mast) / (select attempted from am_mast))::int else 0 end,
         (select mastered from am_mast),
         (select weak from am_mast),
         coalesce((select done from am_done), 0),
         coalesce((select tot from am_scope), 0),
         case when coalesce((select tot from am_scope),0) > 0
              then round(100.0 * coalesce((select done from am_done),0) / (select tot from am_scope))::int
              else 0 end,
         coalesce((select min7 from hb where m = 'american'), 0),
         coalesce((select mintot from hb where m = 'american'), 0),
         (select last_at from hb where m = 'american'),
         (select label from am_cur);
end;
$$;

revoke all on function public.get_student_module_progress(uuid) from public, anon;
grant execute on function public.get_student_module_progress(uuid) to authenticated;
