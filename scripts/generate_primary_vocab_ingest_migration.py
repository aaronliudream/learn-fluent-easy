#!/usr/bin/env python3
"""Generate Supabase migration: primary_vocab PEP ingest (scheme A)."""
from __future__ import annotations

import csv
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "docs" / "vocab" / "primary_ingest_ready.csv"
OUT_MIGRATION = ROOT / "supabase" / "migrations" / "20260518120000_primary_vocab_pep_ingest.sql"
OUT_ROLLBACK = ROOT / "supabase" / "migrations" / "20260518120000_primary_vocab_pep_ingest_rollback.sql"
NS = uuid.UUID("c3bc49a6-5f2d-523e-a89e-0a9b8c7d6e5f")
EXPECTED_ROWS = 846

HEADER = """\
-- Primary PEP vocabulary ingest (Scheme A: backup → clear → reload)
-- Source: docs/vocab/primary_ingest_ready.csv ({row_count} rows)
-- Series: 人教版（PEP）英语（三年级起点）3A–6B
-- Rollback: supabase/migrations/20260518120000_primary_vocab_pep_ingest_rollback.sql

"""


def sql_str(s: str) -> str:
    return "'" + s.replace("'", "''") + "'"


def main() -> None:
    rows: list[list[str]] = []
    with CSV_PATH.open(encoding="utf-8", newline="") as fh:
        reader = csv.reader(fh)
        next(reader)
        rows = list(reader)

    if len(rows) != EXPECTED_ROWS:
        raise SystemExit(f"Expected {EXPECTED_ROWS} rows, got {len(rows)}")

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
        row_uuid = str(uuid.uuid5(NS, word_id))
        pos_sql = sql_str(pos) if pos else "NULL"

        value_rows.append(
            "("
            f"{sql_str(row_uuid)}::uuid, "
            f"{sql_str(word)}, "
            f"{pos_sql}, "
            f"{sql_str(meaning_cn)}, "
            f"NULL, NULL, NULL, NULL, "
            f"{grade}, "
            f"NULL, "
            f"{sql_str(word_id)}, "
            f"{sql_str(volume)}, "
            f"{sql_str(unit)}, "
            f"{sql_str(source_type)}, "
            f"{sql_str(source_page)}, "
            f"{sql_str(confidence)}, "
            f"{sql_str(stage)}"
            ")"
        )

    insert_blocks: list[str] = []
    chunk_size = 100
    cols = (
        "id, word, pos, meaning_cn, example_en, example_cn, theme, tip, grade, ipa, "
        "word_id, volume, unit, source_type, source_page, confidence, stage"
    )
    for i in range(0, len(value_rows), chunk_size):
        chunk = value_rows[i : i + chunk_size]
        insert_blocks.append(
            f"INSERT INTO public.primary_vocab ({cols})\nVALUES\n"
            + ",\n".join(chunk)
            + "\nON CONFLICT (word_id) DO UPDATE SET\n"
            "  word = EXCLUDED.word,\n"
            "  pos = EXCLUDED.pos,\n"
            "  meaning_cn = EXCLUDED.meaning_cn,\n"
            "  grade = EXCLUDED.grade,\n"
            "  volume = EXCLUDED.volume,\n"
            "  unit = EXCLUDED.unit,\n"
            "  source_type = EXCLUDED.source_type,\n"
            "  source_page = EXCLUDED.source_page,\n"
            "  confidence = EXCLUDED.confidence,\n"
            "  stage = EXCLUDED.stage;"
        )

    up = HEADER.format(row_count=len(rows))
    up += """
-- ---------------------------------------------------------------------------
-- 0. Idempotency marker
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public._primary_vocab_pep_ingest_meta (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  applied_at timestamptz NOT NULL DEFAULT now(),
  row_count int NOT NULL,
  source_file text NOT NULL DEFAULT 'docs/vocab/primary_ingest_ready.csv'
);

-- ---------------------------------------------------------------------------
-- 1. Extend schema (safe to re-run)
-- ---------------------------------------------------------------------------
ALTER TABLE public.primary_vocab ADD COLUMN IF NOT EXISTS word_id text;
ALTER TABLE public.primary_vocab ADD COLUMN IF NOT EXISTS stage text DEFAULT 'primary';
ALTER TABLE public.primary_vocab ADD COLUMN IF NOT EXISTS volume text;
ALTER TABLE public.primary_vocab ADD COLUMN IF NOT EXISTS unit text;
ALTER TABLE public.primary_vocab ADD COLUMN IF NOT EXISTS source_type text;
ALTER TABLE public.primary_vocab ADD COLUMN IF NOT EXISTS source_page text;
ALTER TABLE public.primary_vocab ADD COLUMN IF NOT EXISTS confidence text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_primary_vocab_word_id
  ON public.primary_vocab (word_id) WHERE word_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_primary_vocab_volume_unit
  ON public.primary_vocab (volume, unit);

DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'primary_vocab_word_id_key'
  ) THEN
    ALTER TABLE public.primary_vocab
      ADD CONSTRAINT primary_vocab_word_id_key UNIQUE (word_id);
  END IF;
END $do$;

-- ---------------------------------------------------------------------------
-- 2. Backup
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS public._primary_vocab_backup_pep;
CREATE TABLE public._primary_vocab_backup_pep AS
  SELECT * FROM public.primary_vocab;

DROP TABLE IF EXISTS public._primary_word_mastery_backup_pep;
CREATE TABLE public._primary_word_mastery_backup_pep AS
  SELECT * FROM public.primary_word_mastery;

-- ---------------------------------------------------------------------------
-- 3. Clear (Scheme A) — mastery rows invalidated
-- ---------------------------------------------------------------------------
DELETE FROM public.primary_word_mastery;
DELETE FROM public.primary_vocab;

-- ---------------------------------------------------------------------------
-- 4. Load PEP CSV (deterministic uuid v5 per word_id)
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
  SELECT COUNT(*)::int INTO n FROM public.primary_vocab WHERE word_id IS NOT NULL;
  IF n <> """
    up += str(EXPECTED_ROWS)
    up += """ THEN
    RAISE EXCEPTION 'primary_vocab PEP ingest row count mismatch: expected """
    up += str(EXPECTED_ROWS)
    up += """, got %', n;
  END IF;
END $verify$;

INSERT INTO public._primary_vocab_pep_ingest_meta (id, row_count, applied_at)
VALUES (1, """
    up += str(EXPECTED_ROWS)
    up += """, now())
ON CONFLICT (id) DO UPDATE SET
  applied_at = EXCLUDED.applied_at,
  row_count = EXCLUDED.row_count;
"""

    rollback = """\
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
"""

    OUT_MIGRATION.write_text(up, encoding="utf-8")
    OUT_ROLLBACK.write_text(rollback, encoding="utf-8")
    print(f"Wrote {OUT_MIGRATION} ({len(up):,} bytes)")
    print(f"Wrote {OUT_ROLLBACK}")


if __name__ == "__main__":
    main()
