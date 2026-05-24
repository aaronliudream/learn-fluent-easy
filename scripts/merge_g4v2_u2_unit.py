#!/usr/bin/env python3
"""Merge g4v2_u2 unit block into grade4.json (one-off content task)."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GRADE4 = ROOT / "src/data/primaryHub/grade4.json"
UNIT_FILE = Path(__file__).resolve().parent / "g4v2_u2_unit.json"

def main() -> None:
    unit = json.loads(UNIT_FILE.read_text(encoding="utf-8"))
    data = json.loads(GRADE4.read_text(encoding="utf-8"))
    semester = data["grade4"]["semesters"]["grade4_volume2"]
    units = semester["units"]
    for i, u in enumerate(units):
        if u.get("id") == "g4v2_u2":
            units[i] = unit
            break
    else:
        raise SystemExit("g4v2_u2 not found in grade4_volume2")
    GRADE4.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print("Updated g4v2_u2 in grade4.json")

if __name__ == "__main__":
    main()
