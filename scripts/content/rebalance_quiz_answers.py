#!/usr/bin/env python3
"""Deterministically rebalance finalQuiz correct-answer positions in grade4.json.

Problem: most units had the correct answer parked on option A, so the position was
guessable. This permutes each question's `opts` so the correct answer lands evenly
across A/B/C/D *within each unit*, while:

  - keeping every option's text unchanged (no rewording),
  - keeping the three distractors in their original relative order
    (only the correct option moves — "只是正确答案位置变"),
  - touching only `opts` order and the `answer` index. Nothing else.

Determinism / re-runnability:
  - Target positions per unit come from a fixed base cycle [0,1,2,3,...] (which makes
    counts as even as possible) shuffled by a PRNG seeded from BASE_SEED ^ md5(unit.id).
    The seed depends only on unit.id and question count, never on current data order.
  - Because distractors keep their relative order and the correct option is re-inserted
    at the same seed-derived slot, running the script again is idempotent (stable output).

Usage: python scripts/content/rebalance_quiz_answers.py
"""
import hashlib
import json
import random
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
GRADE = ROOT / "src/data/primaryHub/grade4.json"
BASE_SEED = 42
LETTERS = ["A", "B", "C", "D"]


def unit_seed(unit_id: str) -> int:
    h = int(hashlib.md5(unit_id.encode("utf-8")).hexdigest()[:8], 16)
    return BASE_SEED ^ h


def distribution(questions) -> list[int]:
    c = Counter(q["answer"] for q in questions)
    return [c.get(i, 0) for i in range(4)]


def fmt(dist: list[int]) -> str:
    total = sum(dist)
    share = f"{max(dist) / total * 100:.0f}%" if total else "-"
    return " | ".join(str(x) for x in dist) + f" | {total} | {share}"


def rebalance_unit(questions) -> None:
    n = len(questions)
    targets = [i % 4 for i in range(n)]  # counts even to within 1
    random.Random(unit_seed(questions[0].get("_uid", ""))).shuffle(targets)
    for q, tpos in zip(questions, targets):
        opts = q["opts"]
        correct_idx = q["answer"]
        # clamp for safety; all current questions have exactly 4 opts
        tpos = tpos % len(opts)
        correct_text = opts[correct_idx]
        distractors = [o for j, o in enumerate(opts) if j != correct_idx]
        new_opts = distractors[:]
        new_opts.insert(tpos, correct_text)
        q["opts"] = new_opts
        q["answer"] = tpos


def main() -> None:
    data = json.loads(GRADE.read_text(encoding="utf-8"))
    before_rows, after_rows = [], []
    for sem in data["grade4"]["semesters"].values():
        for u in sem["units"]:
            qs = u.get("quizQuestions")
            if not qs:
                continue
            before_rows.append((u["id"], distribution(qs)))
            # stamp unit id onto questions so rebalance_unit can seed from it
            for q in qs:
                q["_uid"] = u["id"]
            rebalance_unit(qs)
            for q in qs:
                q.pop("_uid", None)
            after_rows.append((u["id"], distribution(qs)))

    GRADE.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    print("unit | A | B | C | D | total | maxShare")
    print("--- BEFORE ---")
    for uid, dist in before_rows:
        print(f"{uid} | {fmt(dist)}")
    print("--- AFTER ---")
    for uid, dist in after_rows:
        print(f"{uid} | {fmt(dist)}")
    print(f"\nrebalanced {len(after_rows)} units in grade4.json")


if __name__ == "__main__":
    main()
