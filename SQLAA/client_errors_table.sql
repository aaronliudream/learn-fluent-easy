-- 前端错误上报表 client_errors(2026-08-05)
--
-- 背景:偶发「页面看得见、悬停变手型、但全页点不动,只有整页刷新才恢复」。等待无效 ⇒ 不是加载态。
-- 剩两类嫌疑:①残留透明遮罩吃点击 ②JS 运行时崩溃 / 主线程死亡。靠猜定位不了,先把崩溃现场收下来。
--
-- 消费方:src/lib/clientErrorLog.ts(裸 fetch 写 PostgREST)。表不存在时前端静默丢弃、零影响,
-- 所以本文件跑与不跑都不会弄坏站;不跑的代价只是"下次复现依然只有截图"。
--
-- 实测前置(2026-08-05 现查 DB):
--   · to_regclass('public.client_errors') = null      → 全新表,不覆盖任何东西
--   · has_role(uuid, app_role) 存在,app_role 含 'admin' → SELECT 策略可直接复用现有 RBAC
--
-- 跑法:整段贴进 Supabase SQL Editor 执行(已带 BEGIN/COMMIT + 前后计数)。

begin;

-- 前:确认表不存在(应输出 null)
select to_regclass('public.client_errors') as before_table;

create table if not exists public.client_errors (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  user_id     uuid references auth.users(id) on delete set null,
  kind        text not null,
  message     text not null,
  stack       text,
  path        text,
  user_agent  text,
  extra       jsonb
);

comment on table public.client_errors is
  '前端运行时错误上报(window.onerror / unhandledrejection / console.error / React 边界 / 死页看门狗)。只写不读,查问题用。';

create index if not exists client_errors_created_at_idx on public.client_errors (created_at desc);
create index if not exists client_errors_kind_idx       on public.client_errors (kind, created_at desc);

alter table public.client_errors enable row level security;

-- 写:游客也要能报(白屏/死页往往就发生在未登录会话)。只允许 INSERT,不允许读回。
drop policy if exists client_errors_insert_anyone on public.client_errors;
create policy client_errors_insert_anyone
  on public.client_errors for insert
  to anon, authenticated
  with check (true);

-- 读:仅 admin。错误里可能带页面路径/UA,不对普通用户开放。
drop policy if exists client_errors_select_admin on public.client_errors;
create policy client_errors_select_admin
  on public.client_errors for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 后:确认建好 + 策略数(应为 client_errors / 2)
select to_regclass('public.client_errors') as after_table,
       (select count(*) from pg_policies where schemaname='public' and tablename='client_errors') as policy_count;

commit;

-- 跑完之后怎么看(admin 账号执行):
--   select created_at, kind, path, left(message, 160) as msg
--   from public.client_errors
--   order by created_at desc limit 50;
--
-- 重点看这三种 kind:
--   session-death  = 上个会话"用户还在点、心跳已停" ⇒ JS 死亡,不是遮罩
--   dead-click     = 当场抓到透明遮罩 / body 残留 pointer-events:none
--   react.boundary = 组件崩溃(带 componentStack,直接定位到文件)
