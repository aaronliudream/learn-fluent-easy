ALTER TABLE public.junior_listening_exercises
  ADD COLUMN IF NOT EXISTS kind text DEFAULT 'short',
  ADD COLUMN IF NOT EXISTS duration_sec numeric;
CREATE INDEX IF NOT EXISTS idx_jle_kind ON public.junior_listening_exercises(kind);