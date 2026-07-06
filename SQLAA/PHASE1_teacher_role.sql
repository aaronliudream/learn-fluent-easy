-- =====================================================================
-- 教师功能 Phase 1 · 缺口 1 — 教师身份（自助开通，复用 user_roles / app_role）
--
-- 复用现有 RBAC：user_roles(id, user_id, role app_role, created_at,
--   UNIQUE(user_id, role)) + has_role(_user_id, _role)。
-- 本文件只：给 app_role 加 'teacher' 值 + 3 个 SECURITY DEFINER RPC。
-- 幂等，可重复跑。不 drop 任何表。
--
-- ⚠ 运行顺序：本文件必须最先跑（PHASE1_create_class_patch.sql 依赖
--   本文件建的 public.is_teacher()）。
-- ⚠ check_function_bodies 关掉：因为 'teacher' 枚举值刚在同一脚本里加，
--   若开着校验会在建函数时报 "unsafe use of new value teacher"。运行时
--   （app 调用，另一事务）枚举值已提交，正常解析。
-- =====================================================================

set check_function_bodies = off;

-- 1) app_role 枚举新增 'teacher'（幂等；PG12+ 支持 ADD VALUE IF NOT EXISTS）
alter type public.app_role add value if not exists 'teacher';

-- 2) 自助开通：当前登录用户给自己加 teacher 角色（user_roles 无 INSERT RLS，
--    故走 SECURITY DEFINER）。唯一约束为 (user_id, role)。
create or replace function public.enable_teacher_role()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  insert into public.user_roles(user_id, role)
  values (auth.uid(), 'teacher')
  on conflict (user_id, role) do nothing;
end $$;

revoke all on function public.enable_teacher_role() from public, anon;
grant execute on function public.enable_teacher_role() to authenticated;

-- 3) 关闭教师身份（给"退出教师模式"用）
create or replace function public.disable_teacher_role()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  delete from public.user_roles
   where user_id = auth.uid() and role = 'teacher';
end $$;

revoke all on function public.disable_teacher_role() from public, anon;
grant execute on function public.disable_teacher_role() to authenticated;

-- 4) 便捷判断：当前用户是不是老师（前端 useIsTeacher / create_class 都用它）
create or replace function public.is_teacher()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
     where user_id = auth.uid() and role = 'teacher'
  );
$$;

revoke all on function public.is_teacher() from public, anon;
grant execute on function public.is_teacher() to authenticated;
