
create table if not exists public.pet_skill_bindings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  skill_code text not null unique,
  label_cn text not null,
  label_en text not null,
  emoji text not null default '✨',
  description_cn text,
  module text not null,
  kp_codes jsonb not null default '[]'::jsonb,
  threshold integer not null default 10,
  rarity text not null default 'common'
);
alter table public.pet_skill_bindings enable row level security;
create policy "skill bindings public read" on public.pet_skill_bindings for select using (true);

create table if not exists public.user_pet_skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  skill_code text not null,
  progress integer not null default 0,
  unlocked_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, skill_code)
);
alter table public.user_pet_skills enable row level security;
create policy "user skills select own" on public.user_pet_skills for select using (auth.uid() = user_id);
create policy "user skills insert own" on public.user_pet_skills for insert with check (auth.uid() = user_id);
create policy "user skills update own" on public.user_pet_skills for update using (auth.uid() = user_id);

create or replace function public.bump_pet_skill(_skill_code text, _delta integer default 1)
returns table (progress integer, unlocked boolean, threshold integer)
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  bind public.pet_skill_bindings;
  row public.user_pet_skills;
  thr integer;
  was_unlocked boolean := false;
  newly_unlocked boolean := false;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  select * into bind from public.pet_skill_bindings where skill_code = _skill_code;
  if not found then return; end if;
  thr := bind.threshold;
  insert into public.user_pet_skills(user_id, skill_code, progress)
    values (uid, _skill_code, 0)
    on conflict (user_id, skill_code) do nothing;
  select * into row from public.user_pet_skills where user_id = uid and skill_code = _skill_code for update;
  was_unlocked := row.unlocked_at is not null;
  update public.user_pet_skills
    set progress = row.progress + greatest(0, _delta),
        updated_at = now(),
        unlocked_at = case when row.unlocked_at is null and (row.progress + _delta) >= thr then now() else row.unlocked_at end
    where id = row.id
    returning * into row;
  newly_unlocked := (not was_unlocked) and row.unlocked_at is not null;
  return query select row.progress, newly_unlocked, thr;
end $$;

create table if not exists public.pet_diaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  diary_date date not null default ((now() at time zone 'UTC')::date),
  created_at timestamptz not null default now(),
  body_cn text not null,
  highlights jsonb not null default '[]'::jsonb,
  pet_emoji text,
  pet_nickname text,
  unique (user_id, diary_date)
);
alter table public.pet_diaries enable row level security;
create policy "diaries select own" on public.pet_diaries for select using (auth.uid() = user_id);
create policy "diaries insert own" on public.pet_diaries for insert with check (auth.uid() = user_id);

-- Seed bindings
insert into public.pet_skill_bindings (skill_code, label_cn, label_en, emoji, description_cn, module, kp_codes, threshold, rarity) values
('time_traveler', '时间旅人', 'Time Traveler', '⏳', '掌握 10 道时态题后解锁', 'gaokao_grammar', '["tense"]'::jsonb, 10, 'rare'),
('clause_master', '从句大师', 'Clause Master', '🔗', '掌握 10 道从句题', 'gaokao_grammar', '["clause"]'::jsonb, 10, 'rare'),
('reading_owl', '阅读猫头鹰', 'Reading Owl', '🦉', '完成 5 篇阅读训练', 'gaokao_reading', '[]'::jsonb, 5, 'common'),
('cloze_ninja', '完形忍者', 'Cloze Ninja', '🥷', '完成 3 篇完形填空', 'gaokao_cloze', '[]'::jsonb, 3, 'common'),
('listener_ear', '顺风耳', 'Listener Ear', '👂', '答对 15 道听力题', 'junior_listening', '[]'::jsonb, 15, 'common'),
('writer_pen', '小作家', 'Little Writer', '🖋️', '提交 3 篇写作', 'junior_writing', '[]'::jsonb, 3, 'rare'),
('vocab_hoarder', '词汇收藏家', 'Vocab Hoarder', '📚', '掌握 100 个词', 'vocab', '[]'::jsonb, 100, 'rare')
on conflict (skill_code) do nothing;
