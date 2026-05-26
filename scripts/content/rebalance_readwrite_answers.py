#!/usr/bin/env python3
"""Deterministically rebalance readWrite fill_choice correct-answer positions.

Problem: every fill_choice readWrite question parked the correct option at index 0
(A) — 54 questions across 9 files were 100% A, trivially guessable.

This permutes each question's `options` array so the correct option lands evenly
across A/B/C *within each file*, while:

  - keeping every option's text unchanged and the two distractors in their original
    relative order (only the correct option moves),
  - moving the `{ "text", "correct": true }` object as a whole — there is NO separate
    answer index in this schema, so nothing else needs syncing.

Scope: only `*_read_write.json` files whose questions are `fill_choice` (3 options).
The picture_choice file (g4v2_u1, already balanced) and the legacy multi-stage
g4v2_u1_stage6.json (no flat questions[]) are skipped automatically.

Determinism / idempotency:
  - Per-file target slots come from base cycle [0,1,2,...] (counts even to within 1),
    shuffled by a PRNG seeded from BASE_SEED ^ md5(filename). Seed depends only on the
    filename and question count, never on current data order.
  - Distractors keep relative order and the correct option is re-inserted at the same
    seed-derived slot, so re-running yields byte-identical output (stable md5).

Output JSON preserves the repo's inline `{ "text": ..., "correct": ... }` option style.

Usage: python scripts/content/rebalance_readwrite_answers.py
"""
import hashlib
import json
import random
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RW_DIR = ROOT / "src/data/primaryHub/readWrite"
BASE_SEED = 42

# Collapse expanded option objects back to the repo's one-line style.
_INLINE_OPT = re.compile(
    r'\{\s*\n\s*("text": (?:"(?:[^"\\]|\\.)*"|[^,\n]+)),\s*\n\s*("correct": (?:true|false))\s*\n\s*\}'
)


def serialize(data: dict) -> str:
    text = json.dumps(data, ensure_ascii=False, indent=2)
    text = _INLINE_OPT.sub(r"{ \1, \2 }", text)
    return text + "\n"


def file_seed(name: str) -> int:
    return BASE_SEED ^ int(hashlib.md5(name.encode("utf-8")).hexdigest()[:8], 16)


def correct_index(options) -> int:
    idxs = [i for i, o in enumerate(options) if o.get("correct")]
    if len(idxs) != 1:
        raise ValueError(f"expected exactly one correct option, got {idxs}")
    return idxs[0]


def distribution(questions) -> list[int]:
    c = Counter(correct_index(q["options"]) for q in questions)
    return [c.get(i, 0) for i in range(4)]


def fmt(dist: list[int], width: int) -> str:
    cells = dist[:width]
    total = sum(dist)
    share = f"{max(dist) / total * 100:.0f}%" if total else "-"
    return " | ".join(str(x) for x in cells) + f" | {total} | {share}"


def rebalance_file(path: Path):
    data = json.loads(path.read_text(encoding="utf-8"))
    questions = data.get("questions")
    if not isinstance(questions, list):
        return None  # legacy multi-stage shape
    fill = [q for q in questions if q.get("type") == "fill_choice"]
    if not fill:
        return None  # picture_choice etc. — out of scope

    before = distribution(fill)
    n = len(fill)
    targets = [i % 3 for i in range(n)]  # 3 options -> A/B/C counts even to within 1
    random.Random(file_seed(path.name)).shuffle(targets)

    ti = 0
    for q in questions:
        if q.get("type") != "fill_choice":
            continue
        opts = q["options"]
        cidx = correct_index(opts)
        correct = opts[cidx]
        distractors = [o for j, o in enumerate(opts) if j != cidx]
        tpos = targets[ti] % len(opts)
        ti += 1
        new_opts = distractors[:]
        new_opts.insert(tpos, correct)
        q["options"] = new_opts

    path.write_text(serialize(data), encoding="utf-8")
    after = distribution(fill)
    return before, after


def main() -> None:
    rows = []
    for path in sorted(RW_DIR.glob("*_read_write.json")):
        result = rebalance_file(path)
        if result is None:
            continue
        before, after = result
        rows.append((path.name, before, after))

    print("file | A | B | C | total | maxShare")
    print("--- BEFORE ---")
    for name, before, _ in rows:
        print(f"{name} | {fmt(before, 3)}")
    print("--- AFTER ---")
    for name, _, after in rows:
        print(f"{name} | {fmt(after, 3)}")
    print(f"\nrebalanced {len(rows)} fill_choice files")


if __name__ == "__main__":
    main()
