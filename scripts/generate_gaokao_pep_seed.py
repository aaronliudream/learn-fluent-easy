#!/usr/bin/env python3
"""Optional: emit SQL to re-sync PEP grammar/reading into Supabase from extract output."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXTRACT = ROOT / "scripts" / "out" / "gaokao-pep-extract.json"


def main() -> None:
    if not EXTRACT.is_file():
        print(f"Run extract_gaokao_pep.py first. Missing {EXTRACT}")
        return
    data = json.loads(EXTRACT.read_text(encoding="utf-8"))
    print(f"Loaded {len(data)} book extracts. Use src/data/gaokao/*.ts as source of truth.")
    print("To bulk-import reading passages, map reading_blocks -> readingArticles.ts entries.")


if __name__ == "__main__":
    main()
