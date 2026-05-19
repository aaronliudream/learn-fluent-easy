#!/usr/bin/env python3
"""Generate SQL patch migration for cleaned junior 7A/8A/9 text-layer rows."""
from __future__ import annotations

import csv
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "docs" / "vocab" / "junior_7A_8A_9_textlayer.raw.csv"
CLEAN = ROOT / "docs" / "vocab" / "junior_7A_8A_9_textlayer.csv"
OUT = ROOT / "supabase" / "migrations" / "20260519120000_junior_textlayer_clean_patch.sql"


def sql_str(s: str) -> str:
    return "'" + s.replace("'", "''") + "'"


def main() -> None:
    if not RAW.exists():
        raise SystemExit(f"Run clean_junior_textlayer.py first (missing {RAW})")

    raw_rows = {
        r["word_id"]: r
        for r in csv.DictReader(RAW.open(encoding="utf-8-sig", newline=""))
    }
    clean_rows = list(csv.DictReader(CLEAN.open(encoding="utf-8-sig", newline="")))

    updates: list[str] = []
    for row in clean_rows:
        wid = row["word_id"]
        old = raw_rows.get(wid)
        if not old:
            continue
        if (
            old["word"] == row["word"]
            and old["meaning_cn"] == row["meaning_cn"]
            and old["pos"] == row["pos"]
        ):
            continue
        pos_sql = sql_str(row["pos"]) if row["pos"] else "NULL"
        updates.append(
            "UPDATE public.junior_vocab SET "
            f"word = {sql_str(row['word'])}, "
            f"pos = {pos_sql}, "
            f"meaning_cn = {sql_str(row['meaning_cn'])} "
            f"WHERE word_id = {sql_str(wid)};"
        )

    sql = f"""\
-- Patch cleaned meanings/pos for junior 7A/8A/9 text-layer rows ({len(updates)} updates)
-- Source: scripts/clean_junior_textlayer.py

"""
    sql += "\n".join(updates)
    sql += f"\n\n-- expected updates: {len(updates)}\n"

    OUT.write_text(sql, encoding="utf-8")
    print(f"Wrote {OUT} ({len(updates)} UPDATE statements)")


if __name__ == "__main__":
    main()
