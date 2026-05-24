#!/usr/bin/env python3
"""Extract per-unit reading, listening, writing, dialogues from PEP junior PDFs."""
from __future__ import annotations

import importlib.util
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PDF_DUMP = ROOT / "docs" / "vocab" / "scripts" / "pdf_dump.py"
OUT_JSON = ROOT / "docs" / "junior" / "pep_lesson_content.json"
RAW_DIR = ROOT / "docs" / "junior" / "raw_text"

BOOK_PATTERNS: list[tuple[str, str]] = [
    ("*七年级上册*", "7A"),
    ("*七年级下册*", "7B"),
    ("*八年级上册*", "8A"),
    ("*八年级下册*", "8B"),
    ("*九年级*", "9"),
]

UNIT_RE = re.compile(
    r"(?:Starter\s+Unit\s+(\d+)|UNIT\s+(\d+)|Unit\s+(\d+))",
    re.I,
)
ROLE_LINE = re.compile(r"^([A-Z][A-Za-z.' ]{0,20}):\s*(.+)$")
EN_SENT = re.compile(r"^[A-Za-z].*[a-zA-Z].*[.?!]$")
CN_HINT = re.compile(r"[\u4e00-\u9fff]")


def find_pdfs(base: Path) -> dict[str, Path]:
    out: dict[str, Path] = {}
    for pattern, code in BOOK_PATTERNS:
        hits = list(base.glob(pattern))
        if hits:
            out[code] = hits[0]
    return out


def dump_pdf(pdf: Path, out_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [sys.executable, str(PDF_DUMP), str(pdf), str(out_dir)],
        check=True,
    )


def load_all_text(book_dir: Path) -> str:
    parts: list[str] = []
    for p in sorted(book_dir.glob("page_*.txt")):
        parts.append(p.read_text(encoding="utf-8", errors="ignore"))
    return "\n".join(parts)


def unit_key_from_match(m: re.Match[str]) -> str:
    if m.group(1):
        return f"SU{m.group(1)}"
    num = m.group(2) or m.group(3)
    return f"U{num}"


def split_units(text: str) -> dict[str, str]:
    matches = list(UNIT_RE.finditer(text))
    blocks: dict[str, str] = {}
    for i, m in enumerate(matches):
        key = unit_key_from_match(m)
        start = m.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        chunk = text[start:end]
        if key not in blocks or len(chunk) > len(blocks[key]):
            blocks[key] = chunk
    return blocks


def clean_line(line: str) -> str:
    line = re.sub(r"\s+", " ", line).strip()
    line = re.sub(r"Th\s+en\b", "Then", line)
    line = re.sub(r"\baft\s+ernoon\b", "afternoon", line, flags=re.I)
    return line


def extract_roleplay(block: str) -> list[dict]:
    dialogues: list[dict] = []
    sections = re.split(r"\b2d\b", block, flags=re.I)
    for sec in sections[1:3]:
        lines: list[dict] = []
        for raw in sec.splitlines()[:40]:
            line = clean_line(raw)
            m = ROLE_LINE.match(line)
            if m:
                role = m.group(1).strip()
                text = m.group(2).strip()
                if len(text) > 2 and not CN_HINT.search(text):
                    lines.append({"role": role, "text": text, "cn": ""})
        if len(lines) >= 2:
            dialogues.append({"title": "Role-play", "lines": lines[:12]})
            break
    return dialogues


def extract_ab_dialogues(block: str) -> list[dict]:
    lines: list[dict] = []
    for raw in block.splitlines():
        line = clean_line(raw)
        m = re.match(r"^A:\s*(.+)$", line, re.I)
        if m:
            t = m.group(1).strip()
            if t and not CN_HINT.search(t):
                lines.append({"role": "A", "text": t, "cn": ""})
            continue
        m = re.match(r"^B:\s*(.+)$", line, re.I)
        if m:
            t = m.group(1).strip()
            if t and not CN_HINT.search(t):
                lines.append({"role": "B", "text": t, "cn": ""})
    if len(lines) >= 4:
        return [{"title": "Conversation", "lines": lines[:16]}]
    return []


def extract_reading_passage(block: str) -> str:
    candidates: list[str] = []
    buf: list[str] = []
    for raw in block.splitlines():
        line = clean_line(raw)
        if not line or CN_HINT.search(line):
            if buf:
                candidates.append(" ".join(buf))
                buf = []
            continue
        if EN_SENT.match(line) or (len(line) > 30 and re.search(r"[a-zA-Z]", line)):
            if re.match(r"^(Section|Language|Listen|UNIT|Grammar|Self)\b", line, re.I):
                continue
            if re.match(r"^\d+[a-d]?$", line):
                continue
            buf.append(line)
        elif buf:
            candidates.append(" ".join(buf))
            buf = []
    if buf:
        candidates.append(" ".join(buf))
    candidates = [c for c in candidates if len(c.split()) >= 12]
    candidates.sort(key=len, reverse=True)
    return candidates[0] if candidates else ""


def extract_listening_lines(block: str) -> list[str]:
    lines: list[str] = []
    for raw in block.splitlines():
        line = clean_line(raw)
        if re.match(r"^A:\s", line, re.I) or re.match(r"^B:\s", line, re.I):
            t = re.sub(r"^[AB]:\s*", "", line, flags=re.I).strip()
            if t and not CN_HINT.search(t):
                lines.append(t)
        elif EN_SENT.match(line) and len(line.split()) <= 12:
            if re.match(r"^(Do|Does|Is|Are|Can|What|Where|How|Why|When)\b", line):
                lines.append(line)
    seen: set[str] = set()
    out: list[str] = []
    for l in lines:
        k = l.lower()
        if k not in seen:
            seen.add(k)
            out.append(l)
    return out[:10]


def extract_writing(block: str, unit_title: str) -> dict:
    sc = re.split(r"Self Check", block, flags=re.I)
    tail = sc[1] if len(sc) > 1 else block[-2000:]
    prompts: list[str] = []
    for raw in tail.splitlines()[:25]:
        line = clean_line(raw)
        if not line or CN_HINT.search(line):
            continue
        if re.search(r"\b(write|complete|list|survey|fill|talk about|describe)\b", line, re.I):
            if len(line) > 15:
                prompts.append(line)
    if prompts:
        prompt = prompts[0]
        prompt_cn = f"请完成本单元「{unit_title}」的写作任务。"
    else:
        prompt = f'Write 4-6 sentences about "{unit_title}" using words from this unit.'
        prompt_cn = f"用 4-6 个句子描述本单元「{unit_title}」，使用本单元词汇。"
    return {"prompt": prompt, "promptCn": prompt_cn, "sampleWords": []}


def process_book(code: str, text: str, unit_titles: dict[str, str]) -> dict[str, dict]:
    blocks = split_units(text)
    allowed = set(unit_titles.keys())
    result: dict[str, dict] = {}
    for uk, block in blocks.items():
        if uk not in allowed:
            continue
        title = unit_titles.get(uk, uk)
        role = extract_roleplay(block)
        ab = extract_ab_dialogues(block)
        dialogues = role or ab
        passage = extract_reading_passage(block)
        listening = extract_listening_lines(block)
        writing = extract_writing(block, title)
        result[uk] = {
            "dialogues": dialogues,
            "reading": {"passage": passage, "passageCn": f"本单元阅读材料（{title}）"} if passage else None,
            "listeningLines": listening,
            "writing": writing,
        }
    return result


def load_unit_titles() -> dict[str, dict[str, str]]:
    gen = ROOT / "scripts" / "generate_junior_hub_courses.py"
    spec = importlib.util.spec_from_file_location("gen_jh", gen)
    assert spec and spec.loader
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    meta: dict[str, dict[str, str]] = {}
    for book, units in mod.UNIT_META.items():
        meta[book] = {uk: v[0] for uk, v in units.items()}
    return meta


def main() -> None:
    pdf_base = Path(r"c:\Users\willi\OneDrive\Desktop\英语教材\初中英语教材\人教版")
    pdfs = find_pdfs(pdf_base)
    skip_dump = "--skip-dump" in sys.argv
    if not pdfs:
        print("No PDFs found", file=sys.stderr)
        sys.exit(1)

    unit_titles = load_unit_titles()
    all_content: dict[str, dict] = {}

    for code, pdf in pdfs.items():
        out_dir = RAW_DIR / code
        print(f"Dumping {code} -> {out_dir.name}")
        if not skip_dump:
            dump_pdf(pdf, out_dir)
        text = load_all_text(out_dir)
        book_units = process_book(code, text, unit_titles.get(code, {}))
        all_content[code] = book_units
        print(f"  {code}: {len(book_units)} units extracted")

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(all_content, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {OUT_JSON}")


if __name__ == "__main__":
    main()
