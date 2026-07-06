-- =====================================================================
-- 教师功能 Phase 2 · P0 — 学生详情只读页的 3 个 SECURITY DEFINER RPC
--
-- 每个 RPC 开头都做【成员归属校验】：该学生必须在调用老师(auth.uid())的某个班里，
-- 否则直接 RETURN(返回空,不泄露)。SECURITY DEFINER 让函数以属主身份执行、绕过
-- 各 per-module 表的 RLS(user_id=auth.uid()),从而能读该学生数据 —— 与
-- get_class_students 同一套思路。全部幂等,不建/改表,不碰现有 RPC。
--
-- 口径(Aaron 已确认)：
--  · primary/junior/senior 掌握度/完成度 = 视图 mastery_stage_proportion(按 stage 现成)
--  · american 单独算:册=lesson_id 前缀(am1/am2);完成度=该册"10 stage 全完成"的课数/该册总课数;
--    掌握度=已练项里 mastery_level>=4 的比例(american 满级=4);当前课=最近完成课"第X册 LN"
--  · 时长/最近活跃 = learning_heartbeats(segment 'gaokao'→senior)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) get_student_module_progress —— 四板块卡(完成度%/掌握度%/时长/最近活跃/当前课)
--    每板块一行,共 primary/junior/senior + american 四行(无数据的板块出 0 行,前端灰显补位)
-- ---------------------------------------------------------------------
create or replace function public.get_student_module_progress(_student_id uuid)
returns table(
  module          text,          -- 'primary'|'junior'|'senior'|'american'
  mastery_pct     int,
  mastered_count  int,
  weak_count      int,
  touched         int,           -- 完成度分子(三板块=已接触项;american=已完成课数)
  scope_total     int,           -- 完成度分母(三板块=stage_total;american=该册总课数)
  completion_pct  int,
  minutes_7d      int,
  minutes_total   int,
  last_active_at  timestamptz,
  current_lesson  text           -- 仅 american 有;其余 null
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
  with hb as (   -- 时长/最近活跃(segment 'gaokao'→senior)
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
  am_book as (select split_part(lesson_id, '_', 1) as book from am_latest),   -- 'am1'/'am2'
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
  -- 三板块
  select v.stage::text,
         coalesce(msp.score_pct, 0)::int,
         (coalesce(msp.master_count,0) + coalesce(msp.fluent_count,0))::int,
         coalesce(msp.weak_count, 0)::int,
         coalesce(msp.user_total, 0)::int,
         coalesce(msp.stage_total, 0)::int,
         case when coalesce(msp.stage_total,0) > 0
              then round(100.0 * msp.user_total / msp.stage_total)::int else 0 end,
         coalesce(hb.min7, 0), coalesce(hb.mintot, 0), hb.last_at, null::text
  from (values ('primary'),('junior'),('senior')) v(stage)
  left join public.mastery_stage_proportion msp
         on msp.user_id = _student_id and msp.stage = v.stage
  left join hb on hb.m = v.stage

  union all
  -- american
  select 'american',
         case when (select attempted from am_mast) > 0
              then round(100.0 * (select mastered from am_mast) / (select attempted from am_mast))::int else 0 end,
         (select mastered from am_mast),
         (select weak from am_mast),
         coalesce((select done from am_done), 0),
         coalesce((select tot from am_scope), 0),
         case when coalesce((select tot from am_scope),0) > 0
              then round(100.0 * coalesce((select done from am_done),0) / (select tot from am_scope))::int else 0 end,
         coalesce((select min7 from hb where m = 'american'), 0),
         coalesce((select mintot from hb where m = 'american'), 0),
         (select last_at from hb where m = 'american'),
         (select label from am_cur);
end;
$$;

revoke all on function public.get_student_module_progress(uuid) from public, anon;
grant execute on function public.get_student_module_progress(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- 2) get_student_mistake_counts —— 各板块未解决错题计数(卡片角标,列表页先拉这个)
-- ---------------------------------------------------------------------
create or replace function public.get_student_mistake_counts(_student_id uuid)
returns table(module text, unresolved_count int)
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
  select um.module, count(*)::int
  from public.user_mistakes um
  where um.user_id = _student_id and um.is_resolved = false
  group by um.module
  order by count(*) desc;
end;
$$;

revoke all on function public.get_student_mistake_counts(uuid) from public, anon;
grant execute on function public.get_student_mistake_counts(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- 3) get_student_mistakes —— 某学生错题明细(懒加载:_module 传值只取该板块)
-- ---------------------------------------------------------------------
create or replace function public.get_student_mistakes(_student_id uuid, _module text default null)
returns table(
  id            uuid,
  module        text,
  question      text,
  user_answer   text,
  correct_answer text,
  explanation   text,
  source_label  text,
  snapshot      jsonb,
  wrong_count   int,
  last_wrong_at timestamptz
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
  select um.id, um.module, um.question, um.user_answer, um.correct_answer,
         um.explanation, um.source_label, um.snapshot, um.wrong_count::int, um.last_wrong_at
  from public.user_mistakes um
  where um.user_id = _student_id
    and um.is_resolved = false
    and (_module is null or um.module = _module)
  order by um.module, um.wrong_count desc, um.last_wrong_at desc;
end;
$$;

revoke all on function public.get_student_mistakes(uuid, text) from public, anon;
grant execute on function public.get_student_mistakes(uuid, text) to authenticated;
