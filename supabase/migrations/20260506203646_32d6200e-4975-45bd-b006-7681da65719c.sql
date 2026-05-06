create table public.spark_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  session_id text not null,
  event text not null,
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_spark_events_user_time on public.spark_events (user_id, created_at desc);
create index idx_spark_events_session on public.spark_events (session_id, created_at);
create index idx_spark_events_event_time on public.spark_events (event, created_at desc);

alter table public.spark_events enable row level security;

create policy "anyone can insert spark events"
  on public.spark_events for insert
  to anon, authenticated
  with check (true);

create policy "users read own spark events"
  on public.spark_events for select
  to authenticated
  using (auth.uid() = user_id);
