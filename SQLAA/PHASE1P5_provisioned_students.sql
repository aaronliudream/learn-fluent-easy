-- =====================================================================
-- 教师功能 Phase 1.5 · Step 1 — provisioned_students（老师代建学生登记表）
--
-- ⚠ 草案：等 Aaron 审字段后再跑。记录"哪个学生账号是哪个老师代建的 + 真实姓名"。
-- 幂等，不 drop/改现有表。真实姓名只经此表、仅代建老师(created_by)可读；
-- 绝不进 profiles.display_name（profiles 全站可读，会泄露真名）。
--
-- 与 class_members 真实字段的对齐（本表不复制这些列，仅说明代建时如何挂班/移出）：
--   挂班   → insert class_members(class_id, member_id = student_user_id, role='student')
--   移出   → update class_members set removed_at = now()  (软删，非硬删)
-- =====================================================================

create table if not exists public.provisioned_students (
  student_user_id uuid primary key references auth.users(id) on delete cascade,   -- 学生 auth uid
  created_by      uuid not null references auth.users(id) on delete cascade,      -- 代建老师 = auth.uid()
  login_id        text not null unique,          -- 登录 ID，如 moon100237（全站唯一）
  real_name       text,                          -- 真实姓名备注，仅老师(created_by)可读
  class_id        uuid references public.classes(id) on delete set null,          -- 代建时所属班级
  created_at      timestamptz not null default now()
);

create index if not exists idx_provisioned_created_by on public.provisioned_students(created_by);
create index if not exists idx_provisioned_class      on public.provisioned_students(class_id);

alter table public.provisioned_students enable row level security;

-- 老师只能看/改自己代建的学生记录（学生本人无需读；edge function 走 service role 绕 RLS 写）
drop policy if exists ps_teacher_all on public.provisioned_students;
create policy ps_teacher_all on public.provisioned_students
  for all using (created_by = auth.uid()) with check (created_by = auth.uid());
