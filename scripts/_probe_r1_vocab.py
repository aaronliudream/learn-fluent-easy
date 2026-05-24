#!/usr/bin/env python3
"""Probe required1 PDF for Word Study / vocabulary lists."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

PDF_CANDIDATES = [
    Path(r"c:\Users\willi\OneDrive\Desktop\英语教材\导入CURSOR\高中人教版\普通高中教科书·英语必修 第一册.pdf"),
    Path(r"c:\Users\willi\OneDrive\Desktop\英语教材\高中英语教材\人教版\普通高中教科书·英语必修 第一册.pdf"),
]

MARKERS = (
    "Word Study",
    "Vocabulary",
    "词汇",
    "Welcome Unit",
    "UNIT 1",
    "Unit 1",
    "Teenage Life",
    "Build up your vocabulary",
    "Words and expressions",
)


def main() -> None:
    import pdfplumber

    pdf = next((p for p in PDF_CANDIDATES if p.is_file()), None)
    if not pdf:
        raise SystemExit("PDF not found")
    out = ROOT / "scripts" / "out" / "r1_vocab_probe.txt"
    lines: list[str] = [f"PDF: {pdf.name}", f"pages: "]

    with pdfplumber.open(pdf) as book:
        lines[1] += str(len(book.pages))
        for i, page in enumerate(book.pages):
            text = page.extract_text() or ""
            if not any(m in text for m in MARKERS):
                continue
            lines.append(f"\n{'='*60}\nPAGE {i + 1}\n{'='*60}\n")
            lines.append(text[:4000])

    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text("\n".join(lines), encoding="utf-8")
    print(out)


if __name__ == "__main__":
    main()
