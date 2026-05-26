#!/usr/bin/env python3
"""Replace g4v1_u5 block in grade4.json from scripts/content/g4v1_u5_unit.json."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
GRADE = ROOT / "src/data/primaryHub/grade4.json"
UNIT = ROOT / "scripts/content/g4v1_u5_unit.json"


def main() -> None:
    unit = json.loads(UNIT.read_text(encoding="utf-8"))
    data = json.loads(GRADE.read_text(encoding="utf-8"))
    sem = data["grade4"]["semesters"]["grade4_volume1"]
    units = sem["units"]
    for i, u in enumerate(units):
        if u.get("id") == "g4v1_u5":
            units[i] = unit
            break
    else:
        raise SystemExit("g4v1_u5 not found")
    GRADE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("patched g4v1_u5 in grade4.json")


if __name__ == "__main__":
    main()
