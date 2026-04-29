-- Daily slang table
CREATE TABLE IF NOT EXISTS public.daily_slang (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phrase text NOT NULL,
  meaning_cn text NOT NULL,
  meaning_en text NOT NULL,
  example text NOT NULL,
  example_cn text NOT NULL,
  source_hint text,
  fetch_date date NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::date,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (fetch_date, phrase)
);

CREATE INDEX IF NOT EXISTS daily_slang_fetch_date_idx ON public.daily_slang (fetch_date DESC);

ALTER TABLE public.daily_slang ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Daily slang is viewable by everyone"
ON public.daily_slang FOR SELECT
USING (true);

-- Enable extensions for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
