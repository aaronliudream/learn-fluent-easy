-- =====================================================================
-- 教师功能 Phase 2 · 删除班级 + 回收站 —— 自包含,按顺序整份跑。幂等,可重复跑。
--
-- 两条独立的线:
--   archived_at → 归档线(只读留看)
--   deleted_at  → 回收站线(想清掉;软删,可恢复;再删一次才彻底真删)
-- deleted_at 优先级最高:一旦有值,该班只在回收站可见,活跃区/归档区/详情全过滤。
--
-- 【铁律】彻底删除(purge_class)只 delete classes 1 行;数据库外键自动且仅会:
--   • CASCADE 删 class_members 中该班的成员关系行
--   • SET NULL 把 provisioned_students.class_id 置空(行保留,学生登记完好)
--   auth.users / provisioned_students 行本身 / profiles / 学习数据 一律不动。
--   → 学生账号本人 100% 安全,变成不属于任何班,仍能登录、可再加别的班。
--
-- ⚠ 跑本文件前,先跑外键校验(确认线上只有 class_members+provisioned_students
--   引用 classes,防 dashboard 手建的额外外键)。
-- ⚠ 本文件 create-or-replace 了 get_my_teacher_classes(WHERE 加 deleted_at is null),
--   以本文件为准(它比 PHASE2_class_sort_order.sql 里的多一个过滤)。
-- =====================================================================

-- ── 1) 加软删除列 ────────────────────────────────────────────────────
-- deleted_at:null=正常/归档,有值=在回收站。默认 null,不影响存量。
alter table public.classes
  add column if not exists deleted_at timestamptz;


-- ── 2) trash_class —— 删除到回收站(软删,可逆)────────────────────────
-- 归属校验:teacher_id = auth.uid()。活跃班/归档班都能删进回收站。
create or replace function public.trash_class(_class_id uuid)
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

  update public.classes
     set deleted_at = now()
   where id = _class_id
     and teacher_id = uid          -- 归属校验:只能删自己的班
     and deleted_at is null;       -- 尚未在回收站
  if not found then
    raise exception '班级不存在、无权限,或已在回收站';
  end if;
end;
$$;

revoke all on function public.trash_class(uuid) from public, anon;
grant execute on function public.trash_class(uuid) to authenticated;


-- ── 3) restore_class_from_trash —— 从回收站恢复 ──────────────────────
-- 恢复到进回收站前的状态:
--   • 原为归档(archived_at 有值)→ 回归档态,不占活跃名额。
--   • 原为活跃(archived_at 为 null)→ 回活跃区,套 10 班上限 + sort_order 落末尾。
create or replace function public.restore_class_from_trash(_class_id uuid)
returns public.classes
language plpgsql
security definer
set search_path = public
as $$
declare
  uid          uuid := auth.uid();
  target       public.classes;
  max_classes  constant int := 10;
  next_order   int;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  -- 归属 + 必须在回收站
  select * into target
    from public.classes
   where id = _class_id
     and teacher_id  = uid          -- 归属校验
     and deleted_at is not null;    -- 必须在回收站
  if not found then
    raise exception '回收站中不存在该班级,或无权限';
  end if;

  if target.archived_at is null then
    -- 恢复为活跃班:套 10 班上限(只数活跃且未删的)
    if (select count(*) from public.classes
          where teacher_id = uid
            and archived_at is null
            and deleted_at is null) >= max_classes then
      raise exception '活跃班已满 % 个,请先归档或删除一个再恢复此班', max_classes;
    end if;
    -- 落到活跃区末尾
    select coalesce(max(sort_order) + 1, 0) into next_order
      from public.classes
     where teacher_id = uid and archived_at is null and deleted_at is null;
    update public.classes
       set deleted_at = null,
           sort_order = next_order
     where id = _class_id
    returning * into target;
  else
    -- 原为归档班:回归档态即可,不动 sort_order、不占活跃名额
    update public.classes
       set deleted_at = null
     where id = _class_id
    returning * into target;
  end if;

  return target;
end;
$$;

revoke all on function public.restore_class_from_trash(uuid) from public, anon;
grant execute on function public.restore_class_from_trash(uuid) to authenticated;


-- ── 4) purge_class —— 彻底删除(真删,不可逆)【铁律段,逐行有注释】──────
create or replace function public.purge_class(_class_id uuid)
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

  -- 双重护栏:必须是【本人的】班,且【已在回收站】(deleted_at 有值)才允许彻底删。
  -- 不在回收站的班无法直接 purge → 强制"先进回收站才能彻底删"的两步流程。
  if not exists (
    select 1 from public.classes
     where id = _class_id
       and teacher_id  = uid
       and deleted_at is not null
  ) then
    raise exception '只能彻底删除回收站里、且属于你自己的班级';
  end if;

  -- 唯一的 DELETE:只删 classes 这 1 行。
  -- 外键自动、且仅会:
  --   • CASCADE  删 public.class_members 中 class_id=_class_id 的成员关系行
  --   • SET NULL 把 public.provisioned_students.class_id 置空(行保留)
  -- auth.users / provisioned_students 行 / profiles / 学习数据 一律不动。
  delete from public.classes
   where id = _class_id
     and teacher_id  = uid
     and deleted_at is not null;
end;
$$;

revoke all on function public.purge_class(uuid) from public, anon;
grant execute on function public.purge_class(uuid) to authenticated;


-- ── 5) get_my_trashed_classes —— 回收站列表 ─────────────────────────
create or replace function public.get_my_trashed_classes()
returns table(
  id            uuid,
  name          text,
  stage         text,
  join_code     text,
  archived_at   timestamptz,
  deleted_at    timestamptz,
  created_at    timestamptz,
  student_count int
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
    c.id, c.name, c.stage, c.join_code, c.archived_at, c.deleted_at, c.created_at,
    (select count(*)::int from public.class_members cm
       where cm.class_id  = c.id
         and cm.removed_at is null
         and cm.role = 'student')                                   as student_count
  from public.classes c
  where c.teacher_id = uid
    and c.deleted_at is not null      -- 只回收站
  order by c.deleted_at desc;
end;
$$;

revoke all on function public.get_my_trashed_classes() from public, anon;
grant execute on function public.get_my_trashed_classes() to authenticated;


-- ── 6) get_my_teacher_classes —— WHERE 加 deleted_at is null(排除回收站)─
-- 除新增 "and c.deleted_at is null" 外,其余(列/结构/排序)与现网一致。
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
    (select max(hb.created_at)
       from public.learning_heartbeats hb
       join public.class_members cm on cm.member_id = hb.user_id
      where cm.class_id   = c.id
        and cm.removed_at is null
        and cm.role       = 'student')                              as last_activity_at
  from public.classes c
  where c.teacher_id = uid
    and c.deleted_at is null          -- 排除回收站里的班(新增)
  order by
    (c.archived_at is not null),
    case when c.archived_at is null then c.sort_order else null end asc nulls last,
    c.archived_at desc,
    c.created_at desc;
end;
$$;

revoke all on function public.get_my_teacher_classes() from public, anon;
grant execute on function public.get_my_teacher_classes() to authenticated;
-- =====================================================================
