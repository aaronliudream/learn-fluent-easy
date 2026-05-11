-- Sight Words mastery: add listen_* and context_* counters to support 3 question types
-- (recognize / listen / context). Keep existing recognize_*, spell_* columns intact.
ALTER TABLE public.primary_sight_word_mastery
  ADD COLUMN IF NOT EXISTS listen_correct  INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS listen_wrong    INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS context_correct INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS context_wrong   INT DEFAULT 0;