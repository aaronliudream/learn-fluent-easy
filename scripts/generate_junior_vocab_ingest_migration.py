#!/usr/bin/env python3
"""Generate Supabase migration: junior_vocab PEP ingest (scheme A)."""
from __future__ import annotations

import csv
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "docs" / "vocab" / "junior_merged.csv"
OUT_MIGRATION = ROOT / "supabase" / "migrations" / "20260517120000_junior_vocab_pep_ingest.sql"
OUT_ROLLBACK = ROOT / "supabase" / "migrations" / "20260517120000_junior_vocab_pep_ingest_rollback.sql"
NS = uuid.UUID("a3f2c8e1-4b9d-4e7a-9c1d-8f6e5d4c3b2a")  # stable namespace for word_id → uuid
EXPECTED_ROWS = 2373

HEADER = """\
-- Junior PEP vocabulary ingest (Scheme A: backup → clear → reload)
-- Source: docs/vocab/junior_merged.csv ({row_count} rows)
-- Do NOT run on production without reviewing backup tables.
-- Rollback: supabase/migrations/20260517120000_junior_vocab_pep_ingest_rollback.sql

"""


def sql_str(s: str) -> str:
    return "'" + s.replace("'", "''") + "'"


def main() -> None:
    rows: list[list[str]] = []
    with CSV_PATH.open(encoding="utf-8", newline="") as fh:
        reader = csv.reader(fh)
        header = next(reader)
        rows = list(reader)

    if len(rows) != EXPECTED_ROWS:
        raise SystemExit(f"Expected {EXPECTED_ROWS} rows, got {len(rows)}")

    # freq_rank: order within each grade as file order
    rank_by_grade: dict[int, int] = {7: 0, 8: 0, 9: 0}
    value_rows: list[str] = []

    for row in rows:
        (
            word_id,
            word,
            pos,
            meaning_cn,
            stage,
            grade_s,
            volume,
            unit,
            source_type,
            source_page,
            confidence,
        ) = row
        grade = int(grade_s)
        rank_by_grade[grade] += 1
        freq_rank = rank_by_grade[grade]
        row_uuid = str(uuid.uuid5(NS, word_id))

        value_rows.append(
            "("
            f"{sql_str(row_uuid)}::uuid, "
            f"{sql_str(word_id)}, "
            f"{grade}, "
            f"{sql_str(word)}, "
            f"{sql_str(pos) if pos else 'NULL'}, "
            f"{sql_str(meaning_cn)}, "
            f"{sql_str(stage)}, "
            f"{sql_str(volume)}, "
            f"{sql_str(unit)}, "
            f"{sql_str(source_type)}, "
            f"{sql_str(source_page)}, "
            f"{sql_str(confidence)}, "
            f"{freq_rank}"
            ")"
        )

    # Batch INSERTs in chunks of 100
    insert_blocks: list[str] = []
    chunk_size = 100
    cols = (
        "id, word_id, grade, word, pos, meaning_cn, stage, volume, unit, "
        "source_type, source_page, confidence, freq_rank"
    )
    for i in range(0, len(value_rows), chunk_size):
        chunk = value_rows[i : i + chunk_size]
        insert_blocks.append(
            f"INSERT INTO public.junior_vocab ({cols})\nVALUES\n"
            + ",\n".join(chunk)
            + "\nON CONFLICT (word_id) DO UPDATE SET\n"
            "  grade = EXCLUDED.grade,\n"
            "  word = EXCLUDED.word,\n"
            "  pos = EXCLUDED.pos,\n"
            "  meaning_cn = EXCLUDED.meaning_cn,\n"
            "  stage = EXCLUDED.stage,\n"
            "  volume = EXCLUDED.volume,\n"
            "  unit = EXCLUDED.unit,\n"
            "  source_type = EXCLUDED.source_type,\n"
            "  source_page = EXCLUDED.source_page,\n"
            "  confidence = EXCLUDED.confidence,\n"
            "  freq_rank = EXCLUDED.freq_rank;"
        )

    up = HEADER.format(row_count=len(rows))
    up += """
-- ---------------------------------------------------------------------------
-- 0. Idempotency marker
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public._junior_vocab_pep_ingest_meta (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  applied_at timestamptz NOT NULL DEFAULT now(),
  row_count int NOT NULL,
  source_file text NOT NULL DEFAULT 'docs/vocab/junior_merged.csv'
);

-- ---------------------------------------------------------------------------
-- 1. Extend schema (safe to re-run)
-- ---------------------------------------------------------------------------
ALTER TABLE public.junior_vocab ADD COLUMN IF NOT EXISTS word_id text;
ALTER TABLE public.junior_vocab ADD COLUMN IF NOT EXISTS stage text DEFAULT 'junior';
ALTER TABLE public.junior_vocab ADD COLUMN IF NOT EXISTS volume text;
ALTER TABLE public.junior_vocab ADD COLUMN IF NOT EXISTS unit text;
ALTER TABLE public.junior_vocab ADD COLUMN IF NOT EXISTS source_type text;
ALTER TABLE public.junior_vocab ADD COLUMN IF NOT EXISTS source_page text;
ALTER TABLE public.junior_vocab ADD COLUMN IF NOT EXISTS confidence text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_junior_vocab_word_id
  ON public.junior_vocab (word_id) WHERE word_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_junior_vocab_volume_unit
  ON public.junior_vocab (volume, unit);

DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'junior_vocab_word_id_key'
  ) THEN
    ALTER TABLE public.junior_vocab
      ADD CONSTRAINT junior_vocab_word_id_key UNIQUE (word_id);
  END IF;
END $do$;

-- ---------------------------------------------------------------------------
-- 2. Backup (overwrite previous backup — single rollback snapshot)
-- Re-running this migration re-backs up, clears, and reloads the same 2373 rows
-- (outcome-idempotent). See _junior_vocab_pep_ingest_meta for last apply time.
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS public._junior_vocab_backup_pep;
CREATE TABLE public._junior_vocab_backup_pep AS
  SELECT * FROM public.junior_vocab;

DROP TABLE IF EXISTS public._junior_word_mastery_backup_pep;
CREATE TABLE public._junior_word_mastery_backup_pep AS
  SELECT * FROM public.junior_word_mastery;

-- ---------------------------------------------------------------------------
-- 3. Clear (Scheme A) — mastery rows invalidated; sentences CASCADE
-- ---------------------------------------------------------------------------
DELETE FROM public.junior_word_mastery;
DELETE FROM public.junior_vocab;

-- ---------------------------------------------------------------------------
-- 4. Load merged CSV (deterministic uuid v5 per word_id)
-- ---------------------------------------------------------------------------
"""
    up += "\n\n".join(insert_blocks)
    up += """

-- ---------------------------------------------------------------------------
-- 5. Verify & mark complete
-- ---------------------------------------------------------------------------
DO $verify$
DECLARE
  n int;
BEGIN
  SELECT COUNT(*)::int INTO n FROM public.junior_vocab WHERE word_id IS NOT NULL;
  IF n <> """
    up += str(EXPECTED_ROWS)
    up += """ THEN
    RAISE EXCEPTION 'junior_vocab PEP ingest row count mismatch: expected """
    up += str(EXPECTED_ROWS)
    up += """, got %', n;
  END IF;
END $verify$;

INSERT INTO public._junior_vocab_pep_ingest_meta (id, row_count, applied_at)
VALUES (1, """
    up += str(EXPECTED_ROWS)
    up += """, now())
ON CONFLICT (id) DO UPDATE SET
  applied_at = EXCLUDED.applied_at,
  row_count = EXCLUDED.row_count;
"""

    rollback = """\
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
"""

    OUT_MIGRATION.write_text(up, encoding="utf-8")
    OUT_ROLLBACK.write_text(rollback, encoding="utf-8")
    print(f"Wrote {OUT_MIGRATION} ({len(up):,} bytes)")
    print(f"Wrote {OUT_ROLLBACK}")


if __name__ == "__main__":
    main()
