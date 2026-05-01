create table if not exists public.expression_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  phrase text not null,
  phrase_cn text,
  source_key text,
  source_line_en text,
  source_line_cn text,
  ease real not null default 2.5,
  interval_days real not null default 0,
  due_at timestamptz not null default now(),
  streak integer not null default 0,
  lapses integer not null default 0,
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, phrase)
);

alter table public.expression_reviews enable row level security;

create policy "users read own reviews"
  on public.expression_reviews for select
  using (auth.uid() = user_id);

create policy "users insert own reviews"
  on public.expression_reviews for insert
  with check (auth.uid() = user_id);

create policy "users update own reviews"
  on public.expression_reviews for update
  using (auth.uid() = user_id);

create policy "users delete own reviews"
  on public.expression_reviews for delete
  using (auth.uid() = user_id);

create index if not exists expression_reviews_due_idx
  on public.expression_reviews (user_id, due_at);

create trigger expression_reviews_updated_at
  before update on public.expression_reviews
  for each row execute function public.update_updated_at_column();
