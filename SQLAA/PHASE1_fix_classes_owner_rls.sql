-- =====================================================================
-- 教师功能 Phase 1 · BUGFIX — 班级归属比较统一到 auth.uid()
--
-- 现象：老师建班成功、/teacher 列表能看到班（get_my_teacher_classes 走
--   SECURITY DEFINER 用 auth.uid()，正常），但点进 /teacher/class/:id 详情页
--   报"这个班级不存在，或你不是它的老师"。
--
-- 根因：详情页 cls 只来自前端直接 `from('classes').select().eq('id',id)`，
--   受 classes 的 RLS 管。线上 classes 的归属 RLS 与仓库漂移了——线上那版拿
--   profiles.id 跟 teacher_id 比：
--       classes.teacher_id = auth.uid() = 1d44a541-...
--       profiles.id                     = 304bfd96-...  ≠ teacher_id
--   → RLS 判 false → SELECT 返回 0 行 → 前端 cls=null → 误报。
--   （同一策略还管详情页改名/换码/归档三处 UPDATE，一并会坏。）
--
-- 修法：把 classes / class_members 的归属 RLS，以及 get_class_weakness 的
--   老师校验，全部重建为 `auth.uid() = teacher_id`（与列表页口径完全一致，
--   去掉任何 profiles.id 转换）。幂等（drop policy if exists + create），
--   只重建策略/RPC，不 drop/改任何表结构、不动其它逻辑。
--
-- ⚠ Aaron 需重跑：本文件。若线上 get_class_students / get_my_teacher_classes
--   也曾是 profiles 版，请一并（重）跑 PHASE1_teacher_rpc_time_source.sql
--   （那两个 RPC 已是 auth.uid() + heartbeats 版）。
-- =====================================================================

-- ---------------------------------------------------------------------
-- classes —— 老师全权管自己的班（auth.uid() = teacher_id）；成员只读所属班
-- ---------------------------------------------------------------------
drop policy if exists "classes_teacher_all"   on public.classes;
create policy "classes_teacher_all" on public.classes
  for all using (auth.uid() = teacher_id)
  with check (auth.uid() = teacher_id);

drop policy if exists "classes_member_select" on public.classes;
create policy "classes_member_select" on public.classes
  for select using (
    exists (
      select 1 from public.class_members cm
       where cm.class_id  = classes.id
         and cm.member_id = auth.uid()
         and cm.removed_at is null
    )
  );

-- ---------------------------------------------------------------------
-- class_members —— 老师管本班成员（经 classes.teacher_id = auth.uid()）；
--                  成员读/退自己那行
-- ---------------------------------------------------------------------
drop policy if exists "class_members_teacher_all" on public.class_members;
create policy "class_members_teacher_all" on public.class_members
  for all using (
    exists (
      select 1 from public.classes c
       where c.id = class_members.class_id
         and c.teacher_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.classes c
       where c.id = class_members.class_id
         and c.teacher_id = auth.uid()
    )
  );

drop policy if exists "class_members_self_select" on public.class_members;
create policy "class_members_self_select" on public.class_members
  for select using (auth.uid() = member_id);

drop policy if exists "class_members_self_leave" on public.class_members;
create policy "class_members_self_leave" on public.class_members
  for update using (auth.uid() = member_id)
  with check (auth.uid() = member_id);

-- ---------------------------------------------------------------------
-- get_class_weakness —— 老师校验统一到 auth.uid()（其余逻辑原样）
-- ---------------------------------------------------------------------
create or replace function public.get_class_weakness(_class_id uuid, _limit int default 10)
returns table(
  module             text,
  source_label       text,
  affected_students  int,
  total_wrong_count  int
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
  if not exists (
    select 1 from public.classes
     where id = _class_id and teacher_id = uid
  ) then
    return;
  end if;

  return query
  select
    um.module,
    coalesce(um.source_label, um.module) as source_label,
    count(distinct um.user_id)::int      as affected_students,
    sum(um.wrong_count)::int             as total_wrong_count
    from public.user_mistakes um
    join public.class_members cm on cm.member_id = um.user_id
   where cm.class_id   = _class_id
     and cm.removed_at is null
     and cm.role       = 'student'
     and um.is_resolved = false
   group by um.module, coalesce(um.source_label, um.module)
   order by affected_students desc, total_wrong_count desc
   limit greatest(1, least(_limit, 100));
end;
$$;

revoke all on function public.get_class_weakness(uuid, int) from public, anon;
grant execute on function public.get_class_weakness(uuid, int) to authenticated;
