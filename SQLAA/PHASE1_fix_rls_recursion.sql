-- =====================================================================
-- 教师功能 Phase 1 · BUGFIX — 打破 classes ↔ class_members RLS 无限递归
--
-- 报错：infinite recursion detected in policy for relation "classes"
--   （改班名点保存时触发：PostgREST update 默认 RETURNING 更新后的行 →
--    要跑 classes 的 SELECT 策略 → 踩中 classes_member_select）。
--
-- 成环的两条策略（互相直接子查对方表）：
--   classes.classes_member_select      → 子查 class_members
--   class_members.class_members_teacher_all → 反查 classes
--   评估 classes 的 SELECT 时二者互相触发 → 递归。
--
-- 解法（Supabase 标准做法，同 has_role）：把"跨表归属判断"抽成
--   SECURITY DEFINER 函数——它以函数属主身份执行、绕过 RLS，不会再触发
--   对方表的策略，环被切断。策略里改成调用函数，不再直接子查对方表。
--
-- 幂等：create or replace function + drop policy if exists + create policy。
-- 只改这两条成环策略 + 加两个 helper 函数；其余策略（classes_teacher_all、
--   class_members 的 self_select/self_leave）无跨表、不递归，保持不动。
-- 不 drop/改表结构。
--
-- ⚠ Aaron 需跑：本文件（PHASE1_fix_rls_recursion.sql）。跑完加 DONE_ 前缀。
-- =====================================================================

-- ---------------------------------------------------------------------
-- Helper 1：当前用户是不是 _class_id 的（未退出）成员
--   SECURITY DEFINER → 内部查 class_members 时绕过 RLS，不触发 class_members 策略。
-- ---------------------------------------------------------------------
create or replace function public.is_class_member(_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.class_members cm
     where cm.class_id  = _class_id
       and cm.member_id = auth.uid()
       and cm.removed_at is null
  );
$$;

-- ---------------------------------------------------------------------
-- Helper 2：当前用户是不是 _class_id 的老师
--   SECURITY DEFINER → 内部查 classes 时绕过 RLS，不触发 classes 策略。
-- ---------------------------------------------------------------------
create or replace function public.is_class_teacher(_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.classes c
     where c.id = _class_id
       and c.teacher_id = auth.uid()
  );
$$;

-- 供 RLS 策略在任意角色下评估时都能执行（boolean 判断，无副作用）。
-- 不 revoke，保留默认对 PUBLIC 的 execute，避免策略评估时报 permission denied。
grant execute on function public.is_class_member(uuid)  to authenticated, anon;
grant execute on function public.is_class_teacher(uuid) to authenticated, anon;

-- ---------------------------------------------------------------------
-- 重建成环的两条策略：改为调用 SECURITY DEFINER 函数（不再直接子查对方表）
-- ---------------------------------------------------------------------

-- classes：成员可读自己所在的班（原本子查 class_members → 现走 is_class_member）
drop policy if exists "classes_member_select" on public.classes;
create policy "classes_member_select" on public.classes
  for select using ( public.is_class_member(classes.id) );

-- class_members：老师全权管本班成员（原本反查 classes → 现走 is_class_teacher）
drop policy if exists "class_members_teacher_all" on public.class_members;
create policy "class_members_teacher_all" on public.class_members
  for all
  using      ( public.is_class_teacher(class_members.class_id) )
  with check ( public.is_class_teacher(class_members.class_id) );

-- ---------------------------------------------------------------------
-- 其余策略保持不动（无跨表、不递归），此处仅注释存证：
--   classes.classes_teacher_all (ALL)          : auth.uid() = teacher_id
--   class_members.class_members_self_select    : auth.uid() = member_id
--   class_members.class_members_self_leave     : auth.uid() = member_id
-- ---------------------------------------------------------------------
