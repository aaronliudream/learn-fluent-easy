-- =====================================================================
-- 教师功能 Phase 2 · 老师专属学生备注名 —— 已审核通过 · Aaron 已跑
--
-- 老师给自己班里任意学生(含自己注册进班的)贴一个只有自己看得到的备注名,
-- 不改学生账号 display_name、不影响学生登录。备注是"老师+学生"这一对的:
-- 同一学生在不同老师班里,各老师可备注不同名字。
--
-- 显示优先级(前端):teacher_student_notes.note_name > provisioned_students.real_name
--   > profiles.display_name。有备注/真名时显示 "有效名 (账号原名)"。
--
-- ⚠ 三段:建表 + set_student_note + 重建 get_class_students(加两个 left join)。
-- ⚠ get_class_students 改了返回列 → 必须先 DROP 再 CREATE(改返回类型不能 replace)。
-- 幂等,可重复跑。
-- =====================================================================

-- ── 1) 建表 teacher_student_notes ────────────────────────────────────
create table if not exists public.teacher_student_notes (
  teacher_id      uuid not null references auth.users(id) on delete cascade,
  student_user_id uuid not null references auth.users(id) on delete cascade,
  note_name       text not null,                       -- 留空则删行(见 set_student_note),不存空串
  updated_at      timestamptz not null default now(),
  primary key (teacher_id, student_user_id)            -- 一个老师对一个学生只有一条备注
);

create index if not exists idx_tsn_teacher on public.teacher_student_notes(teacher_id);

alter table public.teacher_student_notes enable row level security;

-- 老师只读写自己的备注
drop policy if exists tsn_teacher_all on public.teacher_student_notes;
create policy tsn_teacher_all on public.teacher_student_notes
  for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());


-- ── 2) set_student_note —— 写/改/删备注(留空=删,回退原名)──────────────
-- 归属校验:该学生必须在调用老师(auth.uid())的某个班里(P0 同款成员校验)。
create or replace function public.set_student_note(_student_id uuid, _note_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  -- 成员归属校验:学生在本人某个班、且未移出
  if not exists (
    select 1 from public.class_members cm
    join public.classes c on c.id = cm.class_id
    where cm.member_id = _student_id
      and c.teacher_id = uid
      and cm.removed_at is null
  ) then
    raise exception '该学生不在你的班级中';
  end if;

  if _note_name is null or length(trim(_note_name)) = 0 then
    -- 留空 → 删备注,显示回退到原名
    delete from public.teacher_student_notes
     where teacher_id = uid and student_user_id = _student_id;
  else
    insert into public.teacher_student_notes(teacher_id, student_user_id, note_name, updated_at)
    values (uid, _student_id, left(trim(_note_name), 40), now())   -- 上限 40 字
    on conflict (teacher_id, student_user_id) do update
      set note_name  = excluded.note_name,
          updated_at = now();
  end if;
end;
$$;

revoke all on function public.set_student_note(uuid, text) from public, anon;
grant execute on function public.set_student_note(uuid, text) to authenticated;


-- ── 3) get_class_students —— 带出当前老师的备注名 + 代建真名 ──────────────
-- 改返回列 → 先 DROP 再 CREATE。新增两列:note_name(本人对该生的备注)、
-- real_name(本人代建该生时填的真名)。其余列/口径与现网一致(照抄 heartbeats 版)。
drop function if exists public.get_class_students(uuid);

create function public.get_class_students(_class_id uuid)
returns table(
  member_id              uuid,
  display_name           text,
  note_name              text,      -- 新增:本老师对该生的备注名(无则 null)
  real_name              text,      -- 新增:本老师代建该生时的真名(非代建则 null)
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
    tsn.note_name,                        -- 备注名(本人)
    ps.real_name,                         -- 代建真名(本人)
    cm.role,
    cm.joined_at,
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
  left join public.profiles p               on p.user_id = cm.member_id
  left join public.teacher_student_notes tsn on tsn.student_user_id = cm.member_id and tsn.teacher_id = uid
  left join public.provisioned_students ps  on ps.student_user_id  = cm.member_id and ps.created_by = uid
  where cm.class_id   = _class_id
    and cm.removed_at is null
  order by cm.joined_at desc;
end;
$$;

revoke all on function public.get_class_students(uuid) from public, anon;
grant execute on function public.get_class_students(uuid) to authenticated;
-- =====================================================================
