-- Persist user's choice for merging anonymous Primary Hub progress on first login.
-- Additive only.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS guest_merge_decision TEXT
  CHECK (guest_merge_decision IS NULL OR guest_merge_decision IN ('merged', 'reset'));

COMMENT ON COLUMN public.profiles.guest_merge_decision IS
  'Primary Hub: merged = keep browser local progress; reset = start fresh. NULL = not yet asked.';
