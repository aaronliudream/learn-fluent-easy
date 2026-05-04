create table if not exists public.funnel_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  step text,
  user_id uuid,
  session_id text,
  metadata jsonb default '{}'::jsonb,
  page_path text,
  referrer text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists idx_funnel_events_event_name_created_at on public.funnel_events (event_name, created_at desc);
create index if not exists idx_funnel_events_session on public.funnel_events (session_id);
create index if not exists idx_funnel_events_user on public.funnel_events (user_id);

alter table public.funnel_events enable row level security;

create policy "Anyone can insert funnel events"
on public.funnel_events for insert
to anon, authenticated
with check (true);

create policy "Admins can read funnel events"
on public.funnel_events for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));