
create table if not exists public.junior_listening_exercises (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  grade smallint not null default 7,
  topic text,
  difficulty smallint not null default 2,
  transcript text not null,
  translation_cn text,
  audio_url text,
  speaker text default 'us_female',
  questions jsonb not null default '[]'::jsonb,
  key_vocab jsonb not null default '[]'::jsonb
);
alter table public.junior_listening_exercises enable row level security;
create policy "junior listening public read" on public.junior_listening_exercises for select using (true);

create table if not exists public.junior_writing_prompts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  grade smallint not null default 7,
  topic text not null,
  prompt_cn text not null,
  prompt_en text not null,
  requirements jsonb not null default '[]'::jsonb,
  min_words integer not null default 60,
  max_words integer not null default 100,
  sample_answer text,
  scoring_rubric text,
  difficulty smallint not null default 2
);
alter table public.junior_writing_prompts enable row level security;
create policy "junior writing prompts public read" on public.junior_writing_prompts for select using (true);

create table if not exists public.junior_writing_attempts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null,
  prompt_id uuid not null,
  text text not null,
  word_count integer not null default 0,
  overall_score integer,
  content_score integer,
  language_score integer,
  structure_score integer,
  feedback_cn text,
  corrections jsonb default '[]'::jsonb,
  highlights jsonb default '[]'::jsonb
);
alter table public.junior_writing_attempts enable row level security;
create policy "junior writing attempt insert own" on public.junior_writing_attempts for insert with check (auth.uid() = user_id);
create policy "junior writing attempt select own" on public.junior_writing_attempts for select using (auth.uid() = user_id);

create table if not exists public.junior_listening_attempts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null,
  exercise_id uuid not null,
  question_idx integer not null,
  user_answer text,
  is_correct boolean not null
);
alter table public.junior_listening_attempts enable row level security;
create policy "junior listening attempt insert own" on public.junior_listening_attempts for insert with check (auth.uid() = user_id);
create policy "junior listening attempt select own" on public.junior_listening_attempts for select using (auth.uid() = user_id);
