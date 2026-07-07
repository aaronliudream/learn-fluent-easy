-- =====================================================================
-- 教师功能 Phase 2 · P4 追加 — restore_class(_class_id) 恢复归档班为活跃班
--
-- 老师把已归档班级恢复为活跃(archived_at 置 null)。后端硬保证 5 班上限,
-- 与 create_class 的 (b) 上限口径对称:未归档班级(archived_at is null)< 5。
--
-- 校验链(全部通过才恢复):
--   1. 已登录(auth.uid() 非空)
--   2. 该班存在、是本人的班(teacher_id = uid) —— 否则报"班级不存在或无权限"
--   3. 该班当前确为已归档(archived_at is not null) —— 已是活跃则幂等直接返回
--   4. 恢复后不突破上限:当前未归档班 < 5 —— 满则 raise exception,前端提示先归档一个
--
-- 返回恢复后的 classes 行(与 create_class 一致,便于前端拿到最新状态)。
-- SECURITY DEFINER:绕过 RLS 前先做 teacher_id 归属校验,安全。
-- 幂等,可重复跑。不 drop、不改表结构。
-- =====================================================================

create or replace function public.restore_class(_class_id uuid)
returns public.classes
language plpgsql
security definer
set search_path = public
as $$
declare
  uid          uuid := auth.uid();
  target       public.classes;
  max_classes  constant int := 5;   -- 每老师活跃班上限(与 create_class 同口径)
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  -- 归属校验:必须是本人的班
  select * into target
    from public.classes
   where id = _class_id and teacher_id = uid;
  if not found then
    raise exception '班级不存在或无权限';
  end if;

  -- 已是活跃班 → 幂等直接返回,不占用上限判断
  if target.archived_at is null then
    return target;
  end if;

  -- 上限:恢复后活跃班不得超过 max_classes(当前未归档已达上限则拦住)
  if (select count(*) from public.classes
        where teacher_id = uid and archived_at is null) >= max_classes then
    raise exception '活跃班已满 % 个,请先归档一个再恢复此班', max_classes;
  end if;

  update public.classes
     set archived_at = null
   where id = _class_id
  returning * into target;
  return target;
end;
$$;

revoke all on function public.restore_class(uuid) from public, anon;
grant execute on function public.restore_class(uuid) to authenticated;
