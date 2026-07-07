-- =====================================================================
-- 教师功能 Phase 2 · 班级拖动排序 —— 安全补丁(只补 create_class / restore_class)
--
-- 背景:你之前已跑过排序草案(加列 sort_order + 回填 + reorder_classes +
--   get_my_teacher_classes 排序),拖动已生效。整合版 PHASE2_class_sort_order.sql
--   相比草案只多了对 create_class / restore_class 的更新(新建/恢复的班落到活跃区末尾)。
--
-- ⚠ 不要整份重跑 PHASE2_class_sort_order.sql —— 那份第 1 段的回填 UPDATE 会把你
--   现在手动拖好的顺序按 created_at 重写、冲掉。本文件只做两个纯函数替换,
--   不触碰任何 sort_order 数据,现有拖动顺序原样保留。幂等,可重复跑。
-- =====================================================================

-- ── create_class:保留原校验(教师身份 + 10 班上限),新增末尾落点 ──────────
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


-- ── restore_class:保留归属/上限校验,恢复时把班放到活跃区末尾 ─────────────
create or replace function public.restore_class(_class_id uuid)
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

  select * into target
    from public.classes
   where id = _class_id and teacher_id = uid;
  if not found then
    raise exception '班级不存在或无权限';
  end if;

  if target.archived_at is null then
    return target;
  end if;

  if (select count(*) from public.classes
        where teacher_id = uid and archived_at is null) >= max_classes then
    raise exception '活跃班已满 % 个,请先归档一个再恢复此班', max_classes;
  end if;

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
-- =====================================================================
