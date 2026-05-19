-- ROLLBACK for 20260518120000_primary_vocab_pep_ingest.sql (Scheme A restore)
-- Run manually in Supabase SQL Editor ONLY if backup tables exist.

BEGIN;

DO $rb$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = '_primary_vocab_backup_pep'
  ) THEN
    RAISE EXCEPTION 'No backup table _primary_vocab_backup_pep — cannot rollback';
  END IF;
END $rb$;

DELETE FROM public.primary_word_mastery;
DELETE FROM public.primary_vocab;

INSERT INTO public.primary_vocab
SELECT * FROM public._primary_vocab_backup_pep;

INSERT INTO public.primary_word_mastery
SELECT * FROM public._primary_word_mastery_backup_pep;

DELETE FROM public._primary_vocab_pep_ingest_meta WHERE id = 1;

COMMIT;
