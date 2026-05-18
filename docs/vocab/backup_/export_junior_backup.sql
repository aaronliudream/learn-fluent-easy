-- Read-only export BEFORE junior_vocab PEP ingest (Scheme A).
-- Does NOT delete or modify junior_vocab / junior_word_mastery.
-- .tmp_primary_insert.sql is unrelated — do not run it here.
--
-- ── 1) Row counts (run first) ─────────────────────────────────────────────
SELECT 'junior_vocab' AS tbl, COUNT(*)::bigint AS n FROM public.junior_vocab
UNION ALL
SELECT 'junior_word_mastery', COUNT(*)::bigint FROM public.junior_word_mastery;

-- ── 2) Local files → docs/vocab/backup_/ (recommended) ───────────────────
-- From repo root:
--   python scripts/export_junior_db_backup.py
-- For a complete junior_word_mastery export, set SUPABASE_SERVICE_ROLE_KEY in .env
-- (Dashboard → Project Settings → API → service_role) and re-run the script.
--
-- ── 3) In-dashboard CSV download ───────────────────────────────────────────
-- Run each query below → Results → Export CSV → save under docs/vocab/backup_/
--   junior_vocab_backup_YYYYMMDD.csv
--   junior_word_mastery_backup_YYYYMMDD.csv

-- SELECT * FROM public.junior_vocab ORDER BY grade, freq_rank NULLS LAST, word;
-- SELECT * FROM public.junior_word_mastery ORDER BY user_id, word_id;

-- ── 4) Optional DB-side snapshot tables (still no DELETE on source tables) ─
/*
DROP TABLE IF EXISTS public._junior_vocab_file_backup;
CREATE TABLE public._junior_vocab_file_backup AS
  SELECT *, now() AS _backed_up_at FROM public.junior_vocab;

DROP TABLE IF EXISTS public._junior_word_mastery_file_backup;
CREATE TABLE public._junior_word_mastery_file_backup AS
  SELECT *, now() AS _backed_up_at FROM public.junior_word_mastery;
*/
