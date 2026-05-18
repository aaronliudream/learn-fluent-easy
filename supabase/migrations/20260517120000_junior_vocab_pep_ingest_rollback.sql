-- ROLLBACK for 20260517120000_junior_vocab_pep_ingest.sql (Scheme A restore)
-- Run manually in Supabase SQL Editor ONLY if backup tables exist.
-- WARNING: restores pre-ingest junior_vocab and junior_word_mastery snapshots.

BEGIN;

DO $rb$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = '_junior_vocab_backup_pep'
  ) THEN
    RAISE EXCEPTION 'No backup table _junior_vocab_backup_pep — cannot rollback';
  END IF;
END $rb$;

DELETE FROM public.junior_word_mastery;
DELETE FROM public.junior_vocab;

INSERT INTO public.junior_vocab
SELECT * FROM public._junior_vocab_backup_pep;

INSERT INTO public.junior_word_mastery
SELECT * FROM public._junior_word_mastery_backup_pep;

DELETE FROM public._junior_vocab_pep_ingest_meta WHERE id = 1;

COMMIT;
