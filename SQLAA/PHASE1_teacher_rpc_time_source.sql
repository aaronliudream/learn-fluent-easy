-- =====================================================================
-- 教师功能 Phase 1 · 缺口 3 — 教师端时长口径统一到 learning_heartbeats
--
-- 现状问题：get_my_teacher_classes / get_class_students 的时长读
--   learning_events.study_minutes —— 只覆盖 primary/junior/gaokao 三个 hub、
--   无模块维度、american 完全没埋。
-- 改法：create-or-replace 这两个 RPC，把时长/活跃来源换成 learning_heartbeats
--   （全站、按 segment 分模块、自带防刷；active_seconds 秒级）。
--   入参、返回列名、返回结构完全不变（Teacher.tsx / TeacherClass.tsx 在用）。
--
-- 口径说明（PR 已列）：
--   • weekly_minutes = 该生近 7 天所有 learning_heartbeats 的
--     sum(active_seconds)/60。heartbeats 只在真实学习 segment 上写入
--     （primary/junior/gaokao(=senior)/american/systematic；落地/登录/家长页
--     segFromPath 返回 null 不写），故其总和 = 跨模块总学习时长，
--     不按班级 stage 过滤 —— 这样 american 也能计到（验收 #5），
--     mixed 班也能汇总全部。按模块细分留 Phase 2。
--   • active_this_week / last_activity_at 同源改读 heartbeats。
--   • weak 相关仍读 user_mistakes（未动）。
-- 幂等，可重复跑。不 drop、不改表结构。
-- =====================================================================

-- ---------------------------------------------------------------------
-- get_my_teacher_classes — hub 列表 + 汇总（active_this_week/last_activity_at 改 heartbeats）
-- ---------------------------------------------------------------------
create or replace function public.get_my_teacher_classes()
returns table(
  id                  uuid,
  name                text,
  stage               text,
  join_code           text,
  archived_at         timestamptz,
  created_at          timestamptz,
  student_count       int,
  active_this_week    int,
  weak_student_count  int,
  last_activity_at    timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then return; end if;

  return query
  select
    c.id, c.name, c.stage, c.join_code, c.archived_at, c.created_at,
    (select count(*)::int from public.class_members cm
       where cm.class_id  = c.id
         and cm.removed_at is null
         and cm.role = 'student')                                   as student_count,
    -- 近 7 天有学习心跳的学生数
    (select count(distinct hb.user_id)::int
       from public.learning_heartbeats hb
       join public.class_members cm on cm.member_id = hb.user_id
      where cm.class_id   = c.id
        and cm.removed_at is null
        and cm.role       = 'student'
        and hb.created_at >= now() - interval '7 days')             as active_this_week,
    (select count(distinct um.user_id)::int from public.user_mistakes um
       join public.class_members cm on cm.member_id = um.user_id
      where cm.class_id   = c.id
        and cm.removed_at is null
        and cm.role       = 'student'
        and um.is_resolved = false
        and um.wrong_count >= 3)                                    as weak_student_count,
    -- 最近一次学习心跳时间
    (select max(hb.created_at)
       from public.learning_heartbeats hb
       join public.class_members cm on cm.member_id = hb.user_id
      where cm.class_id   = c.id
        and cm.removed_at is null
        and cm.role       = 'student')                              as last_activity_at
  from public.classes c
  where c.teacher_id = uid
  order by c.archived_at nulls first, c.created_at desc;
end;
$$;

revoke all on function public.get_my_teacher_classes() from public, anon;
grant execute on function public.get_my_teacher_classes() to authenticated;

-- ---------------------------------------------------------------------
-- get_class_students — 花名册 + 每生汇总（weekly_minutes/active_days/last_active 改 heartbeats）
-- ---------------------------------------------------------------------
create or replace function public.get_class_students(_class_id uuid)
returns table(
  member_id              uuid,
  display_name           text,
  role                   text,
  joined_at              timestamptz,
  weekly_minutes         int,
  active_days_last_7     int,
  unresolved_weak_count  int,
  last_active_at         timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then return; end if;

  -- 仅本班老师可列名单
  if not exists (
    select 1 from public.classes
     where id = _class_id and teacher_id = uid
  ) then
    return;
  end if;

  return query
  select
    cm.member_id,
    p.display_name,
    cm.role,
    cm.joined_at,
    -- 近 7 天总学习分钟（跨模块，含 american）：秒/60 取整
    coalesce((select (sum(hb.active_seconds) / 60)::int
                from public.learning_heartbeats hb
               where hb.user_id = cm.member_id
                 and hb.created_at >= now() - interval '7 days'), 0) as weekly_minutes,
    coalesce((select count(distinct date(hb.created_at))::int
                from public.learning_heartbeats hb
               where hb.user_id = cm.member_id
                 and hb.created_at >= now() - interval '7 days'), 0) as active_days_last_7,
    coalesce((select count(*)::int from public.user_mistakes um
               where um.user_id     = cm.member_id
                 and um.is_resolved = false), 0)                     as unresolved_weak_count,
    (select max(hb.created_at) from public.learning_heartbeats hb
       where hb.user_id = cm.member_id)                             as last_active_at
  from public.class_members cm
  left join public.profiles p on p.user_id = cm.member_id
  where cm.class_id   = _class_id
    and cm.removed_at is null
  order by cm.joined_at desc;
end;
$$;

revoke all on function public.get_class_students(uuid) from public, anon;
grant execute on function public.get_class_students(uuid) to authenticated;
