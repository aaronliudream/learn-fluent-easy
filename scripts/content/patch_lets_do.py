#!/usr/bin/env python3
"""Append the 四上 Let's do supplement (U1/U2/U4/U5) into the existing readWrite
JSON files and grade4.json finalQuiz arrays.

Source: scripts/content/g4_lets_do_supplement.json (data source, NOT a drop-in file).

Per unit (u1/u2/u4/u5):
  - readWrite: append each `readWrite追加题` to questions[] of
    src/data/primaryHub/readWrite/g4v1_uN_read_write.json; bump totalPoints to
    len(questions) (pointsPerQuestion stays 1).
  - finalQuiz: append each `finalQuiz追加题` to grade4.json g4v1_uN.quizQuestions[]
    as {id, q, opts, answer(index of answer_text), point, dim}.

id assignment: new finalQuiz ids = (current max id in that unit) + 1, +2, +3.
  This matches the package hints for U1/U4/U5 (111->112.., 411->412.., 511->512..)
  and AVOIDS the collision in U2, whose current max id is already 212 (so U2 gets
  213/214/215, not the package's 212-214).

Idempotent: a question is appended only if no existing question has the same
`sentence` (readWrite) or same `q` (finalQuiz). Re-running is a no-op.

readWrite files keep the repo's inline `{ "text": ..., "correct": ... }` option style.
grade4.json is dumped with indent=2 (its existing style).
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
GRADE = ROOT / "src/data/primaryHub/grade4.json"
RW_DIR = ROOT / "src/data/primaryHub/readWrite"
SUPP = ROOT / "scripts/content/g4_lets_do_supplement.json"
UNITS = ["u1", "u2", "u4", "u5"]

_INLINE_OPT = re.compile(
    r'\{\s*\n\s*("text": (?:"(?:[^"\\]|\\.)*"|[^,\n]+)),\s*\n\s*("correct": (?:true|false))\s*\n\s*\}'
)


def rw_serialize(data: dict) -> str:
    text = json.dumps(data, ensure_ascii=False, indent=2)
    return _INLINE_OPT.sub(r"{ \1, \2 }", text) + "\n"


def patch_readwrite(unit_key: str, items: list) -> tuple[int, int]:
    path = RW_DIR / f"g4v1_{unit_key}_read_write.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    existing = {q.get("sentence") for q in data["questions"]}
    added = 0
    for it in items:
        if it["sentence"] in existing:
            continue
        data["questions"].append(
            {
                "type": it["type"],
                "sentence": it["sentence"],
                "hint_zh": it["hint_zh"],
                "correctSentence": it["correctSentence"],
                "options": it["options"],
                "point": it["point"],
            }
        )
        existing.add(it["sentence"])
        added += 1
    data["totalPoints"] = len(data["questions"]) * data.get("pointsPerQuestion", 1)
    path.write_text(rw_serialize(data), encoding="utf-8")
    return added, len(data["questions"])


def patch_finalquiz(units: dict, unit_key: str, items: list) -> tuple[int, int, list]:
    uid = f"g4v1_{unit_key}"
    unit = units[uid]
    qs = unit["quizQuestions"]
    existing_q = {q.get("q") for q in qs}
    next_id = max(q["id"] for q in qs) + 1
    added, new_ids = 0, []
    for it in items:
        if it["q"] in existing_q:
            continue
        opts = it["opts"]
        qs.append(
            {
                "id": next_id,
                "q": it["q"],
                "opts": opts,
                "answer": opts.index(it["answer_text"]),
                "point": it["point"],
                "dim": it["dim"],
            }
        )
        existing_q.add(it["q"])
        new_ids.append(next_id)
        next_id += 1
        added += 1
    return added, len(qs), new_ids


def main() -> None:
    supp = json.loads(SUPP.read_text(encoding="utf-8"))
    grade = json.loads(GRADE.read_text(encoding="utf-8"))
    units = {u["id"]: u for sem in grade["grade4"]["semesters"].values() for u in sem["units"]}

    rw_report, fq_report = [], []
    for uk in UNITS:
        rw_added, rw_total = patch_readwrite(uk, supp[uk]["readWrite追加题"])
        rw_report.append(f"  {uk}: readWrite +{rw_added} -> {rw_total}")
        fq_added, fq_total, new_ids = patch_finalquiz(units, uk, supp[uk]["finalQuiz追加题"])
        fq_report.append(f"  {uk}: finalQuiz +{fq_added} -> {fq_total}  new ids={new_ids}")

    GRADE.write_text(json.dumps(grade, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print("readWrite:")
    print("\n".join(rw_report))
    print("finalQuiz:")
    print("\n".join(fq_report))


if __name__ == "__main__":
    main()
