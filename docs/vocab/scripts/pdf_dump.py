"""Dump a PEP textbook PDF to per-page text files using PyMuPDF.

Outputs:
  - <out_dir>/page_001.txt, page_002.txt, ...
  - <out_dir>/_meta.json    page count, font / size histogram per page (optional)
  - <out_dir>/_all.txt      concatenated, with === PAGE n === markers

Usage:
  python pdf_dump.py "<pdf_path>" "<out_dir>"
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import fitz  # PyMuPDF


def main() -> int:
    if len(sys.argv) < 3:
        print("Usage: python pdf_dump.py <pdf_path> <out_dir>", file=sys.stderr)
        return 2
    pdf_path = Path(sys.argv[1])
    out_dir = Path(sys.argv[2])
    out_dir.mkdir(parents=True, exist_ok=True)

    if not pdf_path.exists():
        print(f"PDF not found: {pdf_path}", file=sys.stderr)
        return 1

    doc = fitz.open(pdf_path)
    meta = {
        "pdf": str(pdf_path),
        "page_count": doc.page_count,
        "pages": [],
    }

    all_lines: list[str] = []
    for i, page in enumerate(doc, start=1):
        text = page.get_text("text") or ""
        (out_dir / f"page_{i:03d}.txt").write_text(text, encoding="utf-8")
        all_lines.append(f"=== PAGE {i} ===")
        all_lines.append(text)
        all_lines.append("")
        meta["pages"].append({"page": i, "chars": len(text)})

    (out_dir / "_all.txt").write_text("\n".join(all_lines), encoding="utf-8")
    (out_dir / "_meta.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"Wrote {doc.page_count} pages to {out_dir}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
