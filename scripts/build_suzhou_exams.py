#!/usr/bin/env python3
"""Build Suzhou exam TypeScript data files from docx + answer overlays."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

# reuse parser from sibling module
sys.path.insert(0, str(Path(__file__).parent))
from generate_suzhou_exams import FILES, build_exam, parse_restore_options  # noqa: E402

ROOT = Path(__file__).parent.parent
OUT = ROOT / "src" / "data" / "exams"
EXTRACT = Path(__file__).parent / "suzhou-extract"
ANSWER_KEYS = json.loads((Path(__file__).parent / "suzhou-answer-keys.json").read_text(encoding="utf-8"))

OPTION_LINE = re.compile(r"^[A-D]\.\s.+\s+[A-D]\.\s")


def split_compact_answers(raw: str) -> dict[int, str]:
    out: dict[int, str] = {}
    for num_s, ans in re.findall(r"(\d{1,2})\.\s*([^0-9\n]+?)(?=\s+\d{1,2}\.\s*|$)", raw):
        out[int(num_s)] = ans.strip()
    return out


def apply_answer_overrides(exam: dict, year: int) -> None:
    overlay = ANSWER_KEYS.get(str(year), {})
    parsed_from_blob: dict[int, str] = {}
    for q in exam["questions"]:
        ans = q.get("answer", "")
        if ans and re.search(r"\d{1,2}\.\s*[A-D]", ans):
            parsed_from_blob.update(split_compact_answers(ans))
    merged = {**parsed_from_blob, **{int(k): v for k, v in overlay.items()}}
    for q in exam["questions"]:
        n = int(q["id"][1:])
        if n in merged:
            q["answer"] = merged[n]


def merge_2023_tables(exam: dict) -> None:
    table_path = EXTRACT / "2023-table-data.json"
    if not table_path.exists():
        return
    data = json.loads(table_path.read_text(encoding="utf-8"))
    cloze = data.get("cloze_options", {})
    reading = data.get("reading_options", {})
    for q in exam["questions"]:
        n = int(q["id"][1:])
        if q["section"] == "cloze":
            opts = cloze.get(n) or cloze.get(str(n))
            if opts:
                q["options"] = opts
        if q["section"] == "reading" and str(n) in reading:
            q["options"] = reading[str(n)]
    if data.get("word_bank"):
        exam["resources"]["word_bank"] = data["word_bank"]


def clean_passage(text: str) -> str:
    if not text:
        return text
    lines = text.split("\n")
    kept: list[str] = []
    for line in lines:
        s = line.strip()
        if OPTION_LINE.match(s):
            continue
        if re.match(r"^[A-D]\.\s", s) and len(s) < 200:
            continue
        if s.startswith("请认真阅读") or s.startswith("根据对话") or s.startswith("选项"):
            continue
        kept.append(line)
    return "\n".join(kept).strip()


def ts_string(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


def ts_value(v) -> str:
    if isinstance(v, str):
        return ts_string(v)
    if isinstance(v, bool):
        return "true" if v else "false"
    if v is None:
        return "undefined"
    if isinstance(v, (int, float)):
        return str(v)
    if isinstance(v, list):
        if not v:
            return "[]"
        items = ",\n    ".join(ts_value(x) for x in v)
        return f"[\n    {items},\n  ]"
    if isinstance(v, dict):
        if not v:
            return "{}"
        parts = []
        for k, val in v.items():
            key = k if re.match(r"^[A-Za-z_][A-Za-z0-9_]*$", k) else ts_string(k)
            parts.append(f"    {key}: {ts_value(val)}")
        return "{\n" + ",\n".join(parts) + ",\n  }"
    return json.dumps(v, ensure_ascii=False)


def render_question(q: dict) -> str:
    lines = [
        "    {",
        f'      id: {ts_string(q["id"])}, type: {ts_string(q["type"])}, section: {ts_string(q["section"])},',
        f'      stem: {ts_string(q.get("stem", ""))},',
    ]
    if q.get("options"):
        lines.append(f"      options: {ts_value(q['options'])}, ")
    lines.extend([
        f'      answer: {ts_string(q.get("answer", ""))},',
        f'      explanation: {ts_string(q.get("explanation", ""))},',
        f'      knowledge_point: {ts_string(q.get("knowledge_point", ""))},',
        "    },",
    ])
    return "\n".join(lines)


def render_exam_ts(exam: dict) -> str:
    year = exam["year"]
    const = f"SUZHOU_{year}"
    title = exam.get("title") or f"{year} 年苏州市初中学业水平考试英语试卷"
    passages = {k: clean_passage(v) for k, v in exam.get("passages", {}).items()}
    resources = exam.get("resources", {})
    if "writing_prompt" in resources and isinstance(resources["writing_prompt"], dict):
        body = resources["writing_prompt"].get("body", "")
        body = re.split(r"参考答案|英语试题参考答案", body)[0].strip()
        resources["writing_prompt"] = {"body": body}

    blocks = exam.get("reading_blocks") or []
    q_lines = "\n".join(render_question(q) for q in exam["questions"])

    return f'''import type {{ ExamPaper }} from "./types";

/** {title} */
export const {const}: ExamPaper = {{
  id: {ts_string(exam["id"])},
  title: {ts_string(title)},
  province: "江苏",
  city: "苏州",
  year: {year},
  total_score: 100,
  duration_seconds: 6000,
  reading_blocks: {ts_value(blocks)},
  passages: {ts_value(passages)},
  resources: {ts_value(resources)},
  questions: [
{q_lines}
  ],
}};
'''


def main():
    # ensure 2023 tables extracted
    import importlib.util
    spec = importlib.util.spec_from_file_location(
        "extract_2023_tables",
        Path(__file__).parent / "extract_2023_tables.py",
    )
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)

    OUT.mkdir(parents=True, exist_ok=True)
    ids: list[str] = []
    for year, path in sorted(FILES.items()):
        if not path.exists():
            print(f"skip {year}")
            continue
        exam = build_exam(year, path)
        apply_answer_overrides(exam, year)
        if year == 2023:
            merge_2023_tables(exam)
        # fix restore options if empty
        if not exam["resources"].get("restore_options"):
            restore_sec = exam["passages"].get("restore", "")
            # already parsed in build_exam; fallback from passage tail
            pass
        ts = render_exam_ts(exam)
        out_file = OUT / f"suzhou-{year}.ts"
        out_file.write_text(ts, encoding="utf-8")
        ids.append(exam["id"])
        mcq_ok = sum(1 for q in exam["questions"] if q["type"] == "multiple_choice" and len(q.get("options", {})) >= 4)
        mcq_total = sum(1 for q in exam["questions"] if q["type"] == "multiple_choice")
        ans_ok = sum(1 for q in exam["questions"] if q.get("answer"))
        print(f"{year}: {len(exam['questions'])} q, answers {ans_ok}, mcq opts {mcq_ok}/{mcq_total} -> {out_file.name}")

    print("built:", ", ".join(ids))


if __name__ == "__main__":
    main()
