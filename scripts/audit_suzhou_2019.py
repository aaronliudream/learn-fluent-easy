#!/usr/bin/env python3
"""Audit suzhou-2019.ts against source docx extraction."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from generate_suzhou_exams import FILES, all_lines, extract_section, build_exam  # noqa: E402

ROOT = Path(__file__).parent.parent
JSON = Path(__file__).parent / "suzhou-extract" / "suzhou-2019.json"
TS = ROOT / "src" / "data" / "exams" / "suzhou-2019.ts"


def load_built_exam() -> dict:
    return json.loads(JSON.read_text(encoding="utf-8"))


def grammar_stems_from_docx(path: Path) -> dict[int, str]:
    lines = all_lines(path)
    content_end = len(lines)
    for i, line in enumerate(lines):
        if re.search(r"参考答案|答案与解析", line):
            content_end = i
            break
    content = lines[:content_end]
    sec = extract_section(content, "第一部分", ["第二部分"])
    stems: dict[int, str] = {}
    i = 0
    while i < len(sec):
        m = re.match(r"^(\d{1,2})\.\s*(.*)$", sec[i])
        if not m:
            i += 1
            continue
        num = int(m.group(1))
        if num > 10:
            break
        parts = [m.group(2).strip() or sec[i].split(".", 1)[1].strip()]
        j = i + 1
        while j < len(sec):
            nxt = sec[j].strip()
            if re.match(r"^\d+\.", nxt):
                break
            if re.match(r"^[A-D]\.\s", nxt) and re.search(r"\s+[B-D]\.\s", nxt):
                break
            if re.match(r"^[A-D]\.\s", nxt) and len(re.findall(r"[A-D]\.", nxt)) >= 2:
                break
            parts.append(nxt)
            j += 1
        stems[num] = "\n".join(parts)
        i = j
    return stems


def main():
    path = FILES[2019]
    exam = load_built_exam()
    docx_stems = grammar_stems_from_docx(path)

    print("=== 2019 单项填空 (1-10) stem 核对 ===")
    issues = []
    for n in range(1, 11):
        q = next(x for x in exam["questions"] if x["id"] == f"q{n}")
        built = (q.get("stem") or "").strip()
        expected = docx_stems.get(n, "").strip()
        ok = built == expected
        mark = "OK" if ok else "MISMATCH"
        print(f"Q{n:02d} [{mark}]")
        if not ok:
            issues.append(n)
            print(f"  docx: {expected[:120]!r}")
            print(f"  data: {built[:120]!r}")
        opts = q.get("options") or {}
        if len(opts) < 4:
            issues.append(n)
            print(f"  options missing: {opts}")

    print("\n=== 其他检查 ===")
    mcq = [q for q in exam["questions"] if q["type"] == "multiple_choice"]
    missing_opts = [q["id"] for q in mcq if len(q.get("options") or {}) < 4]
    missing_ans = [q["id"] for q in exam["questions"] if not q.get("answer")]
    restore = exam.get("resources", {}).get("restore_options") or {}
    print(f"MCQ count: {len(mcq)}, missing options: {missing_opts or 'none'}")
    print(f"Missing answers: {missing_ans or 'none'}")
    print(f"Restore options: {len(restore)} entries ({', '.join(sorted(restore)) if restore else 'EMPTY'})")

    cloze = exam.get("passages", {}).get("cloze", "")
    if cloze.startswith("请认真阅读"):
        issues.append("cloze_passage")
        print("Cloze passage still contains instruction line")
    else:
        print("Cloze passage: OK (no instruction prefix)")

    print(f"\nTotal issues: {len(set(issues))}")
    return 1 if issues else 0


if __name__ == "__main__":
    raise SystemExit(main())
