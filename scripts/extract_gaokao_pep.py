#!/usr/bin/env python3
"""
Extract passages and candidate sentences from 人教版高中英语 PEP PDFs.

Outputs:
  scripts/out/gaokao-pep-extract.json  — raw page text + detected reading blocks
  (optional) src/data/gaokao/reading-extract.json — cleaned passages for review

Requires: pip install pdfplumber

Usage:
  python scripts/extract_gaokao_pep.py
  python scripts/extract_gaokao_pep.py --book required1 --max-pages 40
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

BOOKS = {
    "required1": r"c:\Users\willi\OneDrive\Desktop\英语教材\高中英语教材\人教版\普通高中教科书·英语必修 第一册.pdf",
    "required2": r"c:\Users\willi\OneDrive\Desktop\英语教材\高中英语教材\人教版\普通高中教科书·英语必修 第二册.pdf",
    "required3": r"c:\Users\willi\OneDrive\Desktop\英语教材\高中英语教材\人教版\普通高中教科书·英语必修 第三册.pdf",
    "elective1": r"c:\Users\willi\OneDrive\Desktop\英语教材\高中英语教材\人教版\普通高中教科书·英语选择性必修 第一册.pdf",
    "elective2": r"c:\Users\willi\OneDrive\Desktop\英语教材\高中英语教材\人教版\普通高中教科书·英语选择性必修 第二册.pdf",
    "elective3": r"c:\Users\willi\OneDrive\Desktop\英语教材\高中英语教材\人教版\普通高中教科书·英语选择性必修 第三册.pdf",
    "elective4": r"c:\Users\willi\OneDrive\Desktop\英语教材\高中英语教材\人教版\普通高中教科书·英语选择性必修 第四册.pdf",
}

READING_MARKERS = (
    "Reading and Thinking",
    "Reading for Writing",
    "FIRST IMPRESSIONS",
    "THE FRESHMAN CHALLENGE",
)

SENTENCE_RE = re.compile(r"(?<=[.!?])\s+(?=[A-Z\"'])")


def extract_sentences(text: str, min_len: int = 12, max_len: int = 220) -> list[str]:
    out: list[str] = []
    for chunk in SENTENCE_RE.split(text.replace("\n", " ")):
        s = re.sub(r"\s+", " ", chunk).strip()
        if min_len <= len(s) <= max_len and re.search(r"[a-zA-Z]{3}", s):
            if not re.match(r"^(UNIT|WELCOME|Page|\d+\s)", s, re.I):
                out.append(s)
    return out


def extract_book(book_id: str, pdf_path: str, max_pages: int | None) -> dict:
    try:
        import pdfplumber
    except ImportError as e:
        raise SystemExit("Install pdfplumber: pip install pdfplumber") from e

    path = Path(pdf_path)
    if not path.is_file():
        return {"book_id": book_id, "error": f"PDF not found: {pdf_path}", "pages": []}

    pages_out = []
    reading_blocks = []
    all_sentences: list[str] = []

    with pdfplumber.open(path) as pdf:
        limit = len(pdf.pages) if max_pages is None else min(max_pages, len(pdf.pages))
        for i in range(limit):
            text = pdf.pages[i].extract_text() or ""
            if not text.strip():
                continue
            pages_out.append({"page": i + 1, "chars": len(text)})
            is_reading = any(m in text for m in READING_MARKERS)
            sents = extract_sentences(text)
            all_sentences.extend(sents[:30])
            if is_reading and len(text) > 400:
                reading_blocks.append(
                    {
                        "page": i + 1,
                        "preview": text[:1200],
                        "sentences": sents[:15],
                    }
                )

    # de-dupe sentences
    seen = set()
    unique = []
    for s in all_sentences:
        k = s.lower()
        if k not in seen:
            seen.add(k)
            unique.append(s)

    return {
        "book_id": book_id,
        "pdf_path": pdf_path,
        "page_count": len(pages_out),
        "reading_blocks": reading_blocks,
        "sample_sentences": unique[:80],
    }


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--book", choices=list(BOOKS.keys()), help="Single book id")
    ap.add_argument("--max-pages", type=int, default=None)
    args = ap.parse_args()

    out_dir = ROOT / "scripts" / "out"
    out_dir.mkdir(parents=True, exist_ok=True)

    targets = {args.book: BOOKS[args.book]} if args.book else BOOKS
    results = []
    for bid, path in targets.items():
        print(f"Extracting {bid}...")
        results.append(extract_book(bid, path, args.max_pages))

    out_path = out_dir / "gaokao-pep-extract.json"
    out_path.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {out_path}")


if __name__ == "__main__":
    main()
