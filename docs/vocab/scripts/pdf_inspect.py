"""Inspect different PyMuPDF extraction modes on chosen pages.

Used during exploration to find the cleanest text representation for the
Appendix 2 vocabulary list.

Usage:
  python pdf_inspect.py <pdf_path> <page_idx_one_based> [<extra_pages...>]
"""

from __future__ import annotations

import sys
from pathlib import Path

import fitz


def show(page: fitz.Page) -> None:
    print(f"\n========== page index {page.number + 1} ==========\n")

    print("--- mode='text' ---")
    print(page.get_text("text"))

    print("--- mode='blocks' (text only) ---")
    blocks = page.get_text("blocks")
    for b in blocks:
        x0, y0, x1, y1, text, block_no, block_type = b
        if block_type != 0:
            continue
        clean = text.replace("\n", "\\n")
        print(f"  ({x0:.1f},{y0:.1f})-({x1:.1f},{y1:.1f}) [{block_no}] {clean}")

    print("--- mode='words' (first 80) ---")
    words = page.get_text("words")
    for w in words[:80]:
        x0, y0, x1, y1, txt, block_no, line_no, word_no = w
        print(f"  b{block_no}.l{line_no}.w{word_no} ({x0:.1f},{y0:.1f}) {txt!r}")


def main() -> int:
    if len(sys.argv) < 3:
        print("Usage: python pdf_inspect.py <pdf_path> <page_idx_one_based> [<extra_pages...>]", file=sys.stderr)
        return 2
    pdf_path = Path(sys.argv[1])
    doc = fitz.open(pdf_path)
    for p in sys.argv[2:]:
        idx = int(p) - 1
        if 0 <= idx < doc.page_count:
            show(doc[idx])
        else:
            print(f"page {p} out of range (1..{doc.page_count})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
