create table if not exists public.dialogue_key_phrases (
  id uuid primary key default gen_random_uuid(),
  dialogue_key text not null,
  content_hash text not null,
  phrases jsonb not null,
  created_at timestamptz not null default now(),
  unique (dialogue_key, content_hash)
);

alter table public.dialogue_key_phrases enable row level security;

create policy "anyone can read key phrases"
  on public.dialogue_key_phrases
  for select
  using (true);
