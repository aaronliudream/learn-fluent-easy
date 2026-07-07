-- =====================================================================
-- 教师功能 Phase 2 · 班级拖动排序 —— 自包含,按顺序整份跑。幂等,可重复跑。
--
-- 落库方式 a(整批重写):活跃班 ≤10(硬上限),拖完把完整顺序数组传给
--   reorder_classes(_ids uuid[]),按数组下标写 sort_order。单语句原子。
-- 活跃组按 sort_order 升序;归档组按 archived_at 倒序(最近归档在前),不参与手动排序。
-- 新建班 / 恢复归档班 → sort_order 落在活跃区末尾(max+1),不打乱已排顺序。
-- sort_order 跟着行的 teacher_id 走,天然按老师隔离;RPC 逐 id 校验归属。
--
-- ⚠ 本文件 create-or-replace 了 create_class 与 restore_class(在原基础上加
--   sort_order 落点),【以本文件为准】。PHASE1_create_class_patch.sql /
--   PHASE2_restore_class.sql 是它们的历史版本,勿在本文件之后再单独重跑那两份
--   (会退回没有 sort_order 落点的旧体)。
-- =====================================================================

-- ── 1) 加列 + 回填 ────────────────────────────────────────────────────
-- sort_order:越小越靠前(左上)。NOT NULL DEFAULT 0。
alter table public.classes
  add column if not exists sort_order integer not null default 0;

-- 回填:每位老师按"当前显示顺序"(created_at desc = 新在前)赋 0,1,2…
-- 归档班也会被赋值,但排序时不使用(见第 4 段),无副作用。
with ranked as (
  select id,
         (row_number() over (partition by teacher_id order by created_at desc) - 1)::int as rn
  from public.classes
)
update public.classes c
   set sort_order = r.rn
  from ranked r
 where r.id = c.id;


-- ── 2) reorder_classes(_ids) —— 拖完整批写回(方案 a)─────────────────
-- 入参:活跃班 id 的完整有序数组(前端拖动后的最终顺序)。
-- 校验:数组里每个 id 都必须是本人的、未归档的班,否则整批拒绝(原子)。
create or replace function public.reorder_classes(_ids uuid[])
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

  -- 归属 + 活跃校验:任一 id 不是本人活跃班 → 整批拒绝
  if exists (
    select 1
      from unnest(_ids) as x(id)
      left join public.classes c
             on c.id = x.id
            and c.teacher_id = uid
            and c.archived_at is null
     where c.id is null
  ) then
    raise exception '排序数组含非本人或已归档的班级';
  end if;

  -- 按数组下标(从 0 起)写 sort_order,单语句原子
  update public.classes c
     set sort_order = arr.ord
    from (
      select t.id, (t.ord - 1)::int as ord
        from unnest(_ids) with ordinality as t(id, ord)
    ) arr
   where c.id = arr.id
     and c.teacher_id = uid;
end;
$$;

revoke all on function public.reorder_classes(uuid[]) from public, anon;
grant execute on function public.reorder_classes(uuid[]) to authenticated;


-- ── 3) create_class —— 保留原校验(教师身份 + 10 班上限),新增末尾落点 ──
create or replace function public.create_class(
  _name        text,
  _stage       text default 'mixed',
  _description text default null
)
returns public.classes
language plpgsql
security definer
set search_path = public
as $$
declare
  uid         uuid := auth.uid();
  new_class   public.classes;
  max_classes constant int := 10;   -- 每老师活跃班上限(与 enforce_class_limit 触发器同步)
  next_order  int;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  if not public.is_teacher() then
    raise exception '无教师权限';
  end if;
  if _name is null or length(trim(_name)) < 1 or length(_name) > 80 then
    raise exception 'class name must be 1-80 chars';
  end if;
  if _stage not in ('primary','junior','senior','mixed') then
    _stage := 'mixed';
  end if;
  if (select count(*) from public.classes
        where teacher_id = uid and archived_at is null) >= max_classes then
    raise exception '每位老师最多创建 % 个班级', max_classes;
  end if;

  -- 新班排到活跃区末尾(不打乱已排顺序)
  select coalesce(max(sort_order) + 1, 0) into next_order
    from public.classes
   where teacher_id = uid and archived_at is null;

  insert into public.classes (teacher_id, name, stage, description, join_code, sort_order)
       values (uid, trim(_name), _stage, _description, public.gen_class_join_code(), next_order)
    returning * into new_class;
  return new_class;
end;
$$;

revoke all on function public.create_class(text, text, text) from public, anon;
grant execute on function public.create_class(text, text, text) to authenticated;


-- ── 4) restore_class —— 保留归属/上限校验,恢复时把班放到活跃区末尾 ─────
create or replace function public.restore_class(_class_id uuid)
returns public.classes
language plpgsql
security definer
set search_path = public
as $$
declare
  uid          uuid := auth.uid();
  target       public.classes;
  max_classes  constant int := 10;  -- 与 create_class / enforce_class_limit 触发器同口径
  next_order   int;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  select * into target
    from public.classes
   where id = _class_id and teacher_id = uid;
  if not found then
    raise exception '班级不存在或无权限';
  end if;

  -- 已是活跃班 → 幂等直接返回
  if target.archived_at is null then
    return target;
  end if;

  if (select count(*) from public.classes
        where teacher_id = uid and archived_at is null) >= max_classes then
    raise exception '活跃班已满 % 个,请先归档一个再恢复此班', max_classes;
  end if;

  -- 恢复后排到活跃区末尾
  select coalesce(max(sort_order) + 1, 0) into next_order
    from public.classes
   where teacher_id = uid and archived_at is null;

  update public.classes
     set archived_at = null,
         sort_order  = next_order
   where id = _class_id
  returning * into target;
  return target;
end;
$$;

revoke all on function public.restore_class(uuid) from public, anon;
grant execute on function public.restore_class(uuid) to authenticated;


-- ── 5) get_my_teacher_classes 排序改用 sort_order ────────────────────
-- 仅改 ORDER BY;返回列/结构/其余逻辑与线上一致。
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
  order by
    (c.archived_at is not null),                                                     -- 活跃组在前
    case when c.archived_at is null then c.sort_order else null end asc nulls last,   -- 活跃:手动顺序
    c.archived_at desc,                                                              -- 归档:最近归档在前
    c.created_at desc;                                                               -- 兜底
end;
$$;

revoke all on function public.get_my_teacher_classes() from public, anon;
grant execute on function public.get_my_teacher_classes() to authenticated;
-- =====================================================================
