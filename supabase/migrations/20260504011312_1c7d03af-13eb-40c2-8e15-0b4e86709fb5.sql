-- 1. Roles infrastructure (per security best practice: never on profiles)
do $$ begin
  create type public.app_role as enum ('admin', 'moderator', 'user');
exception when duplicate_object then null;
end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

drop policy if exists "Users can view their own roles" on public.user_roles;
create policy "Users can view their own roles"
  on public.user_roles for select
  using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

-- 2. Feedback table
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  category text not null check (category in ('bug','suggestion','praise','other')),
  rating smallint check (rating between 1 and 5),
  message text not null check (char_length(message) between 10 and 1000),
  email text check (email is null or char_length(email) <= 255),
  page_url text,
  user_agent text,
  status text not null default 'new' check (status in ('new','blocked','resolved')),
  moderation_result jsonb,
  ip_hash text,
  created_at timestamptz not null default now()
);

create index if not exists feedback_created_at_idx on public.feedback (created_at desc);
create index if not exists feedback_status_idx on public.feedback (status);

alter table public.feedback enable row level security;

-- Anyone (anon + authed) may insert feedback
drop policy if exists "Anyone can submit feedback" on public.feedback;
create policy "Anyone can submit feedback"
  on public.feedback for insert
  with check (true);

-- Only admins can read
drop policy if exists "Admins can read all feedback" on public.feedback;
create policy "Admins can read all feedback"
  on public.feedback for select
  using (public.has_role(auth.uid(), 'admin'));

-- Only admins can update (e.g. mark resolved)
drop policy if exists "Admins can update feedback" on public.feedback;
create policy "Admins can update feedback"
  on public.feedback for update
  using (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete
drop policy if exists "Admins can delete feedback" on public.feedback;
create policy "Admins can delete feedback"
  on public.feedback for delete
  using (public.has_role(auth.uid(), 'admin'));