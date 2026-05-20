#!/usr/bin/env python3
"""Generate Supabase migration: append PEP senior 必修 vocab to gaokao_vocab."""
from __future__ import annotations

import csv
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "docs" / "vocab" / "senior_pep_ingest_ready.csv"
OUT_MIGRATION = ROOT / "supabase" / "migrations" / "20260518140000_senior_pep_gaokao_vocab_ingest.sql"
OUT_ROLLBACK = ROOT / "supabase" / "migrations" / "20260518140000_senior_pep_gaokao_vocab_ingest_rollback.sql"
NS = uuid.UUID("d4e8a1b2-6c3f-5a9e-8f7d-2b1c0e9a8d7f")
TAG = "pep_compulsory"


def sql_str(s: str) -> str:
    return "'" + s.replace("'", "''") + "'"


def main() -> None:
    rows: list[dict[str, str]] = []
    with CSV_PATH.open(encoding="utf-8", newline="") as fh:
        rows = list(csv.DictReader(fh))

    if not rows:
        raise SystemExit("No rows in senior_pep_ingest_ready.csv")

    value_rows: list[str] = []
    for row in rows:
        word_id = row["word_id"]
        row_uuid = str(uuid.uuid5(NS, word_id))
        pos_sql = sql_str(row["pos"]) if row.get("pos") else "NULL"
        phonetic_sql = sql_str(row["phonetic"]) if row.get("phonetic") else "NULL"
        year_band = int(row["year_band"])
        freq_rank = int(row["freq_rank"])
        gaokao_level = int(row.get("gaokao_level") or year_band)

        value_rows.append(
            "("
            f"{sql_str(row_uuid)}::uuid, "
            f"{sql_str(row['word'])}, "
            f"{pos_sql}, "
            f"{sql_str(row['meaning_cn'])}, "
            f"{sql_str(row['primary_gloss'])}, "
            f"{phonetic_sql}, "
            f"'senior', "
            f"{year_band}, "
            f"{gaokao_level}, "
            f"{freq_rank}, "
            f"'[\"{TAG}\"]'::jsonb"
            ")"
        )

    insert_blocks: list[str] = []
    cols = (
        "id, word, pos, meaning_cn, primary_gloss, phonetic, stage, "
        "year_band, gaokao_level, freq_rank, tags"
    )
    chunk_size = 80
    for i in range(0, len(value_rows), chunk_size):
        chunk = value_rows[i : i + chunk_size]
        insert_blocks.append(
            f"INSERT INTO public.gaokao_vocab ({cols})\nVALUES\n"
            + ",\n".join(chunk)
            + "\nON CONFLICT (word, stage) DO NOTHING;"
        )

    migration = f"""\
-- Senior PEP 必修 vocabulary append ingest
-- Source: docs/vocab/senior_pep_ingest_ready.csv ({len(rows)} rows)
-- Series: 人教版 普通高中教科书·英语 必修 第一册–第三册
-- Scheme: APPEND only (ON CONFLICT DO NOTHING); tags include '{TAG}' for rollback
-- Rollback: supabase/migrations/20260518140000_senior_pep_gaokao_vocab_ingest_rollback.sql

CREATE TABLE IF NOT EXISTS public._senior_pep_gaokao_ingest_meta (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  applied_at timestamptz NOT NULL DEFAULT now(),
  row_count int NOT NULL,
  source_file text NOT NULL DEFAULT 'docs/vocab/senior_pep_ingest_ready.csv'
);

-- ---------------------------------------------------------------------------
-- Load (skip duplicates vs existing gaokao_vocab on word+stage)
-- ---------------------------------------------------------------------------
"""
    migration += "\n\n".join(insert_blocks)
    migration += f"""

-- ---------------------------------------------------------------------------
-- Verify inserted count (tagged rows)
-- ---------------------------------------------------------------------------
DO $verify$
DECLARE
  n int;
BEGIN
  SELECT COUNT(*)::int INTO n
    FROM public.gaokao_vocab
   WHERE tags @> '[\"{TAG}\"]'::jsonb;
  IF n < 1 THEN
    RAISE EXCEPTION 'senior PEP ingest: expected tagged rows, got %', n;
  END IF;
END $verify$;

INSERT INTO public._senior_pep_gaokao_ingest_meta (id, row_count, applied_at)
VALUES (1, {len(rows)}, now())
ON CONFLICT (id) DO UPDATE SET
  applied_at = EXCLUDED.applied_at,
  row_count = EXCLUDED.row_count;
"""

    rollback = f"""\
-- ROLLBACK for 20260518140000_senior_pep_gaokao_vocab_ingest.sql
-- Removes rows tagged '{TAG}' from gaokao_vocab (append ingest only).

BEGIN;

DELETE FROM public.gaokao_user_mastery
 WHERE item_type = 'vocab'
   AND item_id IN (
     SELECT id::text FROM public.gaokao_vocab WHERE tags @> '[\"{TAG}\"]'::jsonb
   );

DELETE FROM public.gaokao_vocab
 WHERE tags @> '[\"{TAG}\"]'::jsonb;

DELETE FROM public._senior_pep_gaokao_ingest_meta WHERE id = 1;

COMMIT;
"""

    OUT_MIGRATION.write_text(migration, encoding="utf-8")
    OUT_ROLLBACK.write_text(rollback, encoding="utf-8")
    print(f"Wrote {OUT_MIGRATION.name} ({len(rows)} rows, {len(insert_blocks)} chunks)")
    print(f"Wrote {OUT_ROLLBACK.name}")


if __name__ == "__main__":
    main()
