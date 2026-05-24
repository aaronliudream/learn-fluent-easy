#!/usr/bin/env python3
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

import pdfplumber

from gaokao_pep_vocab import extract_appendix_section, parse_unit_vocab

candidates = [
    Path(r"c:\Users\willi\OneDrive\Desktop\英语教材\导入CURSOR\高中人教版\普通高中教科书·英语必修 第一册.pdf"),
    Path(r"c:\Users\willi\OneDrive\Desktop\英语教材\高中英语教材\人教版\普通高中教科书·英语必修 第一册.pdf"),
]
pdf = next(p for p in candidates if p.is_file())
parts = []
with pdfplumber.open(pdf) as book:
    for page in book.pages:
        parts.append(page.extract_text() or "")
text = "\n".join(parts)
sec = extract_appendix_section(text)
units = parse_unit_vocab(sec)
out = Path("scripts/out/r1_vocab_parse_test.txt")
lines = []
for u in ["Welcome Unit", "Unit 1", "Unit 2"]:
    words = units.get(u, [])
    lines.append(f"{u} ({len(words)} words)")
    for w in words[:20]:
        lines.append(f"  {w['word']} -> {w['meaning_cn']}")
    lines.append("")
out.write_text("\n".join(lines), encoding="utf-8")
print(out)
