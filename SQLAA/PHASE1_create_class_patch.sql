-- ⚠ 已被 PHASE2_class_sort_order.sql 里的 create_class 取代(加了 sort_order 末尾落点)。
--   以那份为准;勿在其之后再单独重跑本文件(会退回没有排序落点的旧体)。
-- =====================================================================
-- 教师功能 Phase 1 · 缺口 1+2 — create_class 加身份校验 + 5 班上限
--
-- create-or-replace 现有 public.create_class(text, text, text)：签名、返回、
--   原有校验/insert 全部原样保留，仅新增两处：
--     (a) 身份校验：非老师拒绝（依赖 PHASE1_teacher_role.sql 的 is_teacher()）
--     (b) 数量上限：每老师未归档班级 < MAX_CLASSES（当前 10，与 enforce_class_limit 触发器同步）
-- 幂等，可重复跑。不 drop、不改表结构。
--
-- ⚠ 运行顺序：必须在 PHASE1_teacher_role.sql 之后跑（依赖 public.is_teacher()）。
-- =====================================================================

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
  uid        uuid := auth.uid();
  new_class  public.classes;
  max_classes constant int := 10;  -- 每老师班级上限（与 enforce_class_limit 触发器同步；日后放宽改这里+触发器+restore_class）
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  -- (a) 缺口1：仅老师可建班
  if not public.is_teacher() then
    raise exception '无教师权限';
  end if;

  if _name is null or length(trim(_name)) < 1 or length(_name) > 80 then
    raise exception 'class name must be 1-80 chars';
  end if;
  if _stage not in ('primary','junior','senior','mixed') then
    _stage := 'mixed';
  end if;

  -- (b) 缺口2：未归档班级数量上限
  if (select count(*) from public.classes
        where teacher_id = uid and archived_at is null) >= max_classes then
    raise exception '每位老师最多创建 % 个班级', max_classes;
  end if;

  insert into public.classes (teacher_id, name, stage, description, join_code)
       values (uid, trim(_name), _stage, _description, public.gen_class_join_code())
    returning * into new_class;
  return new_class;
end;
$$;

revoke all on function public.create_class(text, text, text) from public, anon;
grant execute on function public.create_class(text, text, text) to authenticated;
