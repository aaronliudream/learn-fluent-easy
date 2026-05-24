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
with pdfplumber.open(pdf) as book:
    text = "\n".join(page.extract_text() or "" for page in book.pages)
u = parse_unit_vocab(extract_appendix_section(text))
lines = []
for name in ["impress", "anxious", "teenage", "challenge", "freshman", "exchange"]:
    found = False
    for unit, words in u.items():
        for w in words:
            if w["word"].lower() == name:
                lines.append(f"{name}: {unit} -> {w['meaning_cn']}")
                found = True
    if not found:
        lines.append(f"{name}: MISSING")
Path("scripts/out/r1_vocab_lookup.txt").write_text("\n".join(lines), encoding="utf-8")
