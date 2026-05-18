#!/usr/bin/env python3
"""
Read-only export of junior_vocab + junior_word_mastery to docs/vocab/backup_/.

Uses VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY from .env (anon).
junior_vocab: public SELECT — full export.
junior_word_mastery: RLS limits anon to 0 rows — use service role if set:

  SUPABASE_SERVICE_ROLE_KEY=... python scripts/export_junior_db_backup.py

Or run docs/vocab/backup_/export_junior_backup.sql in Supabase SQL Editor and
download CSVs manually into this folder.
"""
from __future__ import annotations

import csv
import json
import os
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BACKUP_DIR = ROOT / "docs" / "vocab" / "backup_"
ENV_PATH = ROOT / ".env"

# Base columns always present; PEP columns appended if they exist in DB.
JUNIOR_VOCAB_BASE = [
    "id",
    "grade",
    "word",
    "pos",
    "phonetic",
    "meaning_cn",
    "meaning_en",
    "example_en",
    "example_cn",
    "tip",
    "theme",
    "freq_rank",
    "star_level",
    "created_at",
]
JUNIOR_VOCAB_PEP = [
    "word_id",
    "stage",
    "volume",
    "unit",
    "source_type",
    "source_page",
    "confidence",
]

TABLES = {
    "junior_vocab": JUNIOR_VOCAB_BASE,  # resolved at runtime
    "junior_word_mastery": [
        "id",
        "user_id",
        "word_id",
        "grade",
        "quiz_correct",
        "quiz_wrong",
        "listen_correct",
        "listen_wrong",
        "spell_correct",
        "spell_wrong",
        "match_correct",
        "match_wrong",
        "cloze_correct",
        "cloze_wrong",
        "reading_correct",
        "reading_wrong",
        "mastery_level",
        "ease",
        "interval_days",
        "due_at",
        "last_seen_at",
        "created_at",
        "updated_at",
    ],
}


def load_env() -> dict[str, str]:
    out: dict[str, str] = {}
    if not ENV_PATH.exists():
        return out
    for line in ENV_PATH.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        out[k.strip()] = v.strip().strip('"').strip("'")
    return out


def fetch_all(
    base_url: str, key: str, table: str, columns: list[str], order_col: str = "id"
) -> list[dict]:
    rows: list[dict] = []
    page_size = 1000
    offset = 0
    select = ",".join(columns)
    while True:
        qs = urllib.parse.urlencode(
            {"select": select, "order": order_col, "offset": offset, "limit": page_size}
        )
        url = f"{base_url}/rest/v1/{table}?{qs}"
        req = urllib.request.Request(
            url,
            headers={
                "apikey": key,
                "Authorization": f"Bearer {key}",
                "Accept": "application/json",
            },
        )
        with urllib.request.urlopen(req, timeout=120) as resp:
            chunk = json.loads(resp.read().decode("utf-8"))
        if not chunk:
            break
        rows.extend(chunk)
        if len(chunk) < page_size:
            break
        offset += page_size
    return rows


def fetch_all_star(base_url: str, key: str, table: str, order_col: str = "id") -> list[dict]:
    return fetch_all(base_url, key, table, ["*"], order_col=order_col)


def write_csv(path: Path, columns: list[str], rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    all_keys = columns[:]
    for row in rows:
        for k in row:
            if k not in all_keys:
                all_keys.append(k)
    with path.open("w", encoding="utf-8", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=all_keys, extrasaction="ignore")
        w.writeheader()
        for row in rows:
            w.writerow(row)


def write_json(path: Path, rows: list[dict]) -> None:
    path.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> None:
    env = load_env()
    base_url = os.environ.get("VITE_SUPABASE_URL") or env.get("VITE_SUPABASE_URL", "")
    key = (
        os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        or env.get("SUPABASE_SERVICE_ROLE_KEY")
        or os.environ.get("VITE_SUPABASE_PUBLISHABLE_KEY")
        or env.get("VITE_SUPABASE_PUBLISHABLE_KEY", "")
    )
    if not base_url or not key:
        raise SystemExit("Missing VITE_SUPABASE_URL or API key in .env / environment")

    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    meta: dict[str, object] = {
        "exported_at_utc": ts,
        "supabase_url": base_url,
        "used_service_role": bool(
            os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or env.get("SUPABASE_SERVICE_ROLE_KEY")
        ),
        "tables": {},
    }

    for table, cols in TABLES.items():
        print(f"Fetching {table}...")
        if table == "junior_vocab":
            rows = fetch_all_star(base_url, key, table)
            cols = list(rows[0].keys()) if rows else JUNIOR_VOCAB_BASE
        else:
            rows = fetch_all(base_url, key, table, cols)
        stem = f"{table}_{ts}"
        csv_path = BACKUP_DIR / f"{stem}.csv"
        json_path = BACKUP_DIR / f"{stem}.json"
        write_csv(csv_path, cols, rows)
        write_json(json_path, rows)
        meta["tables"][table] = {"rows": len(rows), "csv": csv_path.name, "json": json_path.name}
        print(f"  -> {len(rows)} rows -> {csv_path.name}")

    (BACKUP_DIR / f"export_meta_{ts}.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"Done. Metadata: export_meta_{ts}.json")

    jwm = meta["tables"].get("junior_word_mastery", {})
    if isinstance(jwm, dict) and jwm.get("rows") == 0 and not meta["used_service_role"]:
        print(
            "\nWARNING: junior_word_mastery exported 0 rows with anon key (RLS).\n"
            "Re-run with SUPABASE_SERVICE_ROLE_KEY in .env for a full mastery backup,\n"
            "or use docs/vocab/backup_/export_junior_backup.sql in SQL Editor."
        )


if __name__ == "__main__":
    main()
