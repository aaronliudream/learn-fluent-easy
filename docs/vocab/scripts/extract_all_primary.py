"""Extract Appendix vocabulary from all 8 PEP primary English textbooks.

Series: 人教版（PEP）英语（三年级起点）3A/3B/4A/4B/5A/5B/6A/6B.

Uses the same PyMuPDF blocks-mode extraction logic validated on 4B.
Each book is processed independently; per-book CSVs are written to
``docs/vocab/primary_{code}_clean.csv``.

Usage:
    # Extract one book and print stats:
    python extract_all_primary.py 3A

    # Merge all already-extracted per-book CSVs into the combined file:
    python extract_all_primary.py --merge
"""

from __future__ import annotations

import csv
import json
import re
import sys
import unicodedata
from pathlib import Path
from typing import Iterable

import fitz  # PyMuPDF


# ---------------------------------------------------------------------------
# Per-book configuration
# ---------------------------------------------------------------------------

PDF_DIR = Path(r"C:\Users\willi\OneDrive\Desktop\英语教材\导入CURSOR\小学人教版")

BOOK_PDFS: dict[str, str] = {
    "3A": "义务教育教科书·英语（PEP）（三年级起点）三年级上册.pdf",
    "3B": "义务教育教科书·英语（三年级起点）三年级下册.pdf",
    "4A": "义务教育教科书·英语（PEP）（三年级起点）四年级上册.pdf",
    "4B": "义务教育教科书·英语（三年级起点）四年级下册.pdf",
    "5A": "义务教育教科书·英语（PEP）（三年级起点）五年级上册.pdf",
    "5B": "义务教育教科书·英语（三年级起点）五年级下册.pdf",
    "6A": "义务教育教科书·英语（PEP）（三年级起点）六年级上册.pdf",
    "6B": "义务教育教科书·英语（三年级起点）六年级下册.pdf",
}

# Printed-page → unit map for books 3A–6A (identical structure across all).
UNIT_STARTS_DEFAULT: list[tuple[int, str]] = [
    (2,  "Unit 1"),
    (12, "Unit 2"),
    (22, "Unit 3"),
    (32, "Recycle 1"),
    (36, "Unit 4"),
    (46, "Unit 5"),
    (56, "Unit 6"),
    (66, "Recycle 2"),
    (70, "Appendix 1"),
    (72, "Appendix 2"),
    (75, "Appendix 3"),
]

# 6B has only 4 units + 1 recycle (shorter final-semester book).
UNIT_STARTS_6B: list[tuple[int, str]] = [
    (2,  "Unit 1"),
    (12, "Unit 2"),
    (22, "Unit 3"),
    (32, "Unit 4"),
    (42, "Recycle"),
    (52, "Appendix 1"),
    (54, "Appendix 2"),
    (57, "Appendix 3"),
]

# Offset: pdf_page_1based = printed_page + PDF_OFFSET  (same for all 8 books)
PDF_OFFSET = 5

OUT_DIR = Path("docs/vocab")


# ---------------------------------------------------------------------------
# Text cleaning constants (identical to validated 4B script)
# ---------------------------------------------------------------------------

ITALIC_FIXES: list[tuple[re.Pattern[str], str]] = [
    # --- f-italic splits (one-char 'f' separated from rest of word) ---
    (re.compile(r"\bf\s+irst\b"),  "first"),
    (re.compile(r"\bf\s+loor\b"),  "floor"),
    (re.compile(r"\boff\s+ice\b"), "office"),
    (re.compile(r"\bf\s+ly\b"),    "fly"),
    (re.compile(r"\bf\s+ive\b"),   "five"),
    (re.compile(r"\bf\s+ind\b"),   "find"),
    (re.compile(r"\bf\s+ield\b"),  "field"),
    (re.compile(r"\bf\s+riend\b"), "friend"),
    (re.compile(r"\bf\s+ruit\b"),  "fruit"),
    (re.compile(r"\bf\s+orty\b"),  "forty"),
    (re.compile(r"\bf\s+ast\b"),   "fast"),
    (re.compile(r"\bf\s+eel\b"),   "feel"),
    (re.compile(r"\bf\s+oot\b"),   "foot"),
    (re.compile(r"\bf\s+ork\b"),   "fork"),
    (re.compile(r"\bf\s+ace\b"),   "face"),
    (re.compile(r"\bf\s+ar\b"),    "far"),
    (re.compile(r"\bf\s+ull\b"),   "full"),
    (re.compile(r"\bf\s+un\b"),    "fun"),
    # --- fi-ligature splits (ﬁ→fi already expanded in normalize_ws) ---
    (re.compile(r"\bfi\s+rst\b"),  "first"),
    (re.compile(r"\bfi\s+ve\b"),   "five"),
    (re.compile(r"\bfi\s+eld\b"),  "field"),
    (re.compile(r"\bfi\s+sh\b"),   "fish"),
    (re.compile(r"\bfi\s+ne\b"),   "fine"),
    (re.compile(r"\bfi\s+lm\b"),   "film"),
    (re.compile(r"\bfi\s+nish\b"), "finish"),
    # --- fl-ligature splits ---
    (re.compile(r"\bfl\s+oor\b"),  "floor"),
    (re.compile(r"\bfl\s+ower\b"), "flower"),
    (re.compile(r"\bfl\s+y\b"),    "fly"),
]

HEADER_FOOTER_RE = re.compile(
    r"^\s*(?:Vocabulary|Appendix\s*\d+|词\s*汇\s*表|\d+)\s*$"
)
SECTION_LETTER_RE = re.compile(r"^\s*[A-Z]\s*$")
PAGE_REF_RE   = re.compile(r"p\.\s*(\d{1,3})")
PHONETIC_RE   = re.compile(r"/[^/]*/")
CJK_RE        = re.compile(r"[\u3000-\u303f\u4e00-\u9fff\uff00-\uffef]")

BLACKLIST_EXACT = {"", "appendix", "appendix 2", "appendix 3", "vocabulary"}
BLACKLIST_REGEX = [
    re.compile(r"^\d+$"),
    re.compile(r"^[a-z]$", re.I),
    re.compile(r"^[^a-z\u4e00-\u9fff]+$", re.I),
]


# ---------------------------------------------------------------------------
# Helpers (identical logic to 4B)
# ---------------------------------------------------------------------------


# Unicode ligatures that appear in italic/mixed-font spans.
_LIGATURE_MAP: dict[str, str] = {
    "\ufb00": "ff",
    "\ufb01": "fi",  # ﬁ  (most common in these books: ﬁve, ﬁrst, ﬁsh …)
    "\ufb02": "fl",  # ﬂ
    "\ufb03": "ffi",
    "\ufb04": "ffl",
    "\ufb05": "st",
    "\ufb06": "st",
}


def normalize_ws(s: str) -> str:
    result: list[str] = []
    for c in s:
        if c in _LIGATURE_MAP:
            result.append(_LIGATURE_MAP[c])
        elif "\ue000" <= c <= "\uf8ff":
            ascii_code = ord(c) - 0xF000
            result.append(chr(ascii_code) if 0x20 <= ascii_code <= 0x7E else " ")
        elif unicodedata.category(c) == "Zs":
            result.append(" ")
        else:
            result.append(c)
    return re.sub(r"\s+", " ", "".join(result)).strip()


def lookup_unit(printed_page: int, unit_starts: list[tuple[int, str]]) -> str | None:
    current: str | None = None
    for start, name in unit_starts:
        if printed_page >= start:
            current = name
        else:
            break
    return current


def find_vocab_pdf_pages(doc: fitz.Document) -> list[int]:
    """Return 0-based page indices that hold the vocabulary appendix.

    Works for all 8 books:
    - 3A–4B: Appendix 2 titled "Vocabulary" / 词汇表 → stop at Appendix 3
    - 5A–6B: Appendix 3 titled "Vocabulary" / 词汇表 → stop at Appendix 4

    Detection: first page with both "Vocabulary" AND a CJK 词 character
    (the per-unit "Words in each unit" page says only "单 元 词 汇 表" and does
    NOT contain the English word "Vocabulary", so it is skipped).

    Termination: first page after the start that contains the *next* appendix
    number (N+1) OR "Useful expressions".  Continuation pages often repeat the
    current appendix label in their running header, so we compare against N+1
    rather than a fixed string such as "Appendix 3".
    """
    start_idx: int | None = None
    start_appendix_num: int = 2
    end_idx: int | None = None

    for i in range(len(doc)):
        text = doc[i].get_text("text")

        if start_idx is None and "Vocabulary" in text and "词" in text:
            start_idx = i
            m = re.search(r"Appendix\s+(\d+)", text)
            start_appendix_num = int(m.group(1)) if m else 2
            continue

        if start_idx is not None:
            next_app = f"Appendix {start_appendix_num + 1}"
            if "Useful expressions" in text or next_app in text:
                end_idx = i
                break

    if start_idx is None:
        return []
    if end_idx is None:
        end_idx = len(doc)
    return list(range(start_idx, end_idx))


def page_block_texts(page: fitz.Page) -> list[str]:
    raw_blocks = page.get_text("blocks")
    text_blocks = [b for b in raw_blocks if b[6] == 0]
    if not text_blocks:
        return []

    ph = page.rect.height
    content = [b for b in text_blocks if b[1] > 50 and b[3] < ph - 30]
    if not content:
        return []

    x0_vals = sorted(set(round(b[0]) for b in content))
    if len(x0_vals) >= 2:
        max_gap = 0
        split_after = x0_vals[0]
        for a, b_val in zip(x0_vals, x0_vals[1:]):
            gap = b_val - a
            if gap > max_gap:
                max_gap = gap
                split_after = a
    else:
        split_after = x0_vals[0]

    def _row_x_key(b: tuple) -> tuple:
        return (round(b[1] / 4) * 4, b[0])

    left  = sorted([b for b in content if b[0] <= split_after], key=_row_x_key)
    right = sorted([b for b in content if b[0] > split_after],  key=_row_x_key)

    result: list[str] = []
    for blk in left + right:
        cleaned: list[str] = []
        for raw_line in blk[4].splitlines():
            line = normalize_ws(raw_line)
            if not line:
                continue
            if SECTION_LETTER_RE.match(line) or HEADER_FOOTER_RE.match(line):
                continue
            cleaned.append(line)
        if cleaned:
            result.append(" ".join(cleaned))
    return result


def split_entries(block_texts: Iterable[str]) -> list[list[str]]:
    entries: list[list[str]] = []
    buf: list[str] = []
    for text in block_texts:
        text = text.strip()
        if not text:
            continue
        if HEADER_FOOTER_RE.match(text):
            buf = []
            continue
        if not re.search(r"[a-zA-Z]", text) and not PAGE_REF_RE.search(text):
            buf = []
            continue
        buf.append(text)
        if PAGE_REF_RE.search(text):
            entries.append(buf)
            buf = []
    if buf:
        entries.append(buf)
    return entries


def parse_entry(buf: list[str]) -> dict | None:
    text = normalize_ws(" ".join(buf))
    m = PAGE_REF_RE.search(text)
    if not m:
        return {"word": "", "gloss": "", "printed_page": None, "raw": text}
    printed_page = int(m.group(1))
    body = (text[: m.start()] + " " + text[m.end():]).strip()

    body_no_phon = PHONETIC_RE.sub(" ", body)
    body_no_phon = normalize_ws(body_no_phon)

    cjk_match = CJK_RE.search(body_no_phon)
    if cjk_match:
        english = body_no_phon[: cjk_match.start()].strip()
        gloss   = body_no_phon[cjk_match.start():].strip()
    else:
        english = body_no_phon.strip()
        gloss   = ""

    for pat, repl in ITALIC_FIXES:
        english = pat.sub(repl, english)
    english = normalize_ws(english)
    english = re.sub(r"[\s()\[\]{}<>]+$", "", english).strip()

    gloss = normalize_ws(gloss)
    gloss = re.sub(r"^[)\]}>]+\s*", "", gloss).strip()

    return {"word": english, "gloss": gloss, "printed_page": printed_page, "raw": text}


def is_blacklisted(word: str) -> bool:
    w = word.strip().lower()
    if w in BLACKLIST_EXACT:
        return True
    return any(pat.match(w) for pat in BLACKLIST_REGEX)


# ---------------------------------------------------------------------------
# Per-book extraction
# ---------------------------------------------------------------------------

NOISE_PATTERNS = [
    re.compile(r"\blet'?s\b", re.I),
    re.compile(r"\bstory\b", re.I),
    re.compile(r"\bappendix\b", re.I),
    re.compile(r"^[a-z]$", re.I),
]


def extract_book(code: str) -> dict:
    """Extract vocabulary for one book; write CSV; return stats dict."""
    fname = BOOK_PDFS[code]
    pdf_path = PDF_DIR / fname
    csv_out = OUT_DIR / f"primary_{code}_clean.csv"

    if not pdf_path.exists():
        print(f"ERROR: PDF not found: {pdf_path}", file=sys.stderr)
        return {}

    unit_starts = UNIT_STARTS_6B if code == "6B" else UNIT_STARTS_DEFAULT

    stats: dict = {
        "book": code,
        "pdf": fname,
        "appendix_pdf_pages_1based": [],
        "raw_entries": 0,
        "kept": 0,
        "blacklisted": 0,
        "missing_page_ref": 0,
        "unit_lookup_success": 0,
        "unit_lookup_failed": 0,
    }

    rows: list[dict] = []
    doc = fitz.open(str(pdf_path))
    vocab_pages = find_vocab_pdf_pages(doc)
    stats["appendix_pdf_pages_1based"] = [p + 1 for p in vocab_pages]

    for idx in vocab_pages:
        page = doc[idx]
        block_texts = page_block_texts(page)
        for buf in split_entries(block_texts):
            stats["raw_entries"] += 1
            parsed = parse_entry(buf)
            if parsed is None or parsed["printed_page"] is None:
                stats["missing_page_ref"] += 1
                continue
            if is_blacklisted(parsed["word"]):
                stats["blacklisted"] += 1
                continue

            pp = parsed["printed_page"]
            unit = lookup_unit(pp, unit_starts)
            if unit is None:
                stats["unit_lookup_failed"] += 1
            else:
                stats["unit_lookup_success"] += 1

            rows.append({
                "book":          f"primary_{code}",
                "unit":          unit or "U?",
                "word":          parsed["word"],
                "gloss":         parsed["gloss"],
                "printed_page":  pp,
                "pdf_page":      pp + PDF_OFFSET,
            })
            stats["kept"] += 1

    doc.close()

    # Deduplicate on (word, printed_page).
    seen: set[tuple[str, int]] = set()
    deduped: list[dict] = []
    for r in rows:
        key = (r["word"].lower(), r["printed_page"])
        if key not in seen:
            seen.add(key)
            deduped.append(r)
    stats["deduped"] = len(deduped)

    # Noise scan
    noise_hits: dict[str, list[str]] = {p.pattern: [] for p in NOISE_PATTERNS}
    for r in deduped:
        for p in NOISE_PATTERNS:
            if p.search(r["word"]):
                noise_hits[p.pattern].append(r["word"])
    stats["noise_hits"] = noise_hits
    stats["total_noise"] = sum(len(v) for v in noise_hits.values())

    # Write CSV
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    with csv_out.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(
            f, fieldnames=["book", "unit", "word", "gloss", "printed_page", "pdf_page"]
        )
        writer.writeheader()
        writer.writerows(deduped)

    stats["csv"] = str(csv_out)
    stats["rows"] = deduped

    # Console report
    print(f"\n{'='*55}")
    print(f"  {code}  —  primary_{code}_clean.csv")
    print(f"{'='*55}")
    print(f"  Appendix PDF pages (1-based):  {stats['appendix_pdf_pages_1based']}")
    print(f"  Raw entry buffers:             {stats['raw_entries']}")
    print(f"  Missing p.NN ref:              {stats['missing_page_ref']}")
    print(f"  Blacklisted:                   {stats['blacklisted']}")
    print(f"  Kept → deduped:                {stats['kept']} → {stats['deduped']}")
    unit_total = stats["unit_lookup_success"] + stats["unit_lookup_failed"]
    pct = 100 * stats["unit_lookup_success"] / unit_total if unit_total else 0
    print(f"  Unit lookup success:           {stats['unit_lookup_success']}/{unit_total} ({pct:.0f}%)")

    sanity = "OK" if 100 <= stats["deduped"] <= 600 else (
        "WARNING: below 100" if stats["deduped"] < 100 else "⚠ ABOVE 600 — STOP"
    )
    print(f"  Word-count sanity (100–600):   {stats['deduped']}  [{sanity}]")

    noise_ok = stats["total_noise"] == 0
    print(f"  Noise scan (must be 0):        {'PASS ✓' if noise_ok else 'FAIL ✗'}")
    if not noise_ok:
        for pat, words in noise_hits.items():
            if words:
                print(f"    [{pat}]: {words[:5]}")

    if deduped:
        step = max(1, len(deduped) // 10)
        sample = deduped[::step][:10]
        print(f"\n  Sample (word | unit | p):")
        for r in sample:
            print(f"    {r['word']!r:30s} | {r['unit']:12s} | p.{r['printed_page']}")

    if stats["deduped"] > 600:
        print("\n  ⚠ WORD COUNT EXCEEDS 600 — STOPPING PIPELINE")
        sys.exit(1)

    return stats


# ---------------------------------------------------------------------------
# Merge
# ---------------------------------------------------------------------------


def merge_all() -> None:
    """Merge all 8 per-book CSVs into primary_merged_clean.csv."""
    codes = ["3A", "3B", "4A", "4B", "5A", "5B", "6A", "6B"]
    all_rows: list[dict] = []
    per_book_counts: dict[str, int] = {}
    unit_unknown: list[dict] = []
    conf_low: list[dict] = []

    for code in codes:
        csv_path = OUT_DIR / f"primary_{code}_clean.csv"
        if not csv_path.exists():
            print(f"  MISSING: {csv_path} — skipping")
            continue
        with csv_path.open(encoding="utf-8-sig") as f:
            rows = list(csv.DictReader(f))
        per_book_counts[code] = len(rows)
        all_rows.extend(rows)

    # Assign global word_id
    for i, r in enumerate(all_rows, 1):
        r["word_id"] = f"W{i:04d}"
        if r.get("unit", "").startswith("U?") or not r.get("unit"):
            unit_unknown.append(r)
        if r.get("confidence") == "low":
            conf_low.append(r)

    merged_csv = OUT_DIR / "primary_merged_clean.csv"
    fieldnames = ["word_id", "book", "unit", "word", "gloss", "printed_page", "pdf_page"]
    with merged_csv.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(all_rows)

    # word_id uniqueness check
    ids = [r["word_id"] for r in all_rows]
    unique_ids = len(set(ids))

    total = len(all_rows)
    print(f"\n{'='*55}")
    print(f"  MERGE COMPLETE")
    print(f"{'='*55}")
    print(f"  Total words:          {total}  ({'OK' if 1500 <= total <= 2000 else 'WARNING: outside 1500-2000'})")
    print(f"  Unique word_ids:      {unique_ids}  ({'OK' if unique_ids == total else 'DUPLICATES!'})")
    print(f"\n  Per-book distribution:")
    for code in codes:
        n = per_book_counts.get(code, 0)
        print(f"    {code}: {n}")
    print(f"\n  unit=U? entries:      {len(unit_unknown)}")
    if unit_unknown:
        for r in unit_unknown[:10]:
            print(f"    {r['word']!r} p.{r['printed_page']} ({r['book']})")
    print(f"  confidence=low:       {len(conf_low)}")

    # Write markdown report
    _write_report(all_rows, per_book_counts, codes, unit_unknown, conf_low, total, unique_ids)
    print(f"\n  Merged CSV:    {merged_csv}")
    print(f"  Report:        {OUT_DIR / 'primary_clean_merge_report.md'}")

    if total > 3000:
        print("\n  ⚠ TOTAL EXCEEDS 3000 — STOPPING")
        sys.exit(1)


def _write_report(
    all_rows: list[dict],
    per_book_counts: dict[str, int],
    codes: list[str],
    unit_unknown: list[dict],
    conf_low: list[dict],
    total: int,
    unique_ids: int,
) -> None:
    lines = [
        "# Primary Vocabulary Merge Report",
        "",
        f"Generated from 8 PEP textbooks (3A–6B).",
        "",
        "## Summary",
        "",
        f"| Item | Value |",
        f"|---|---|",
        f"| Total words | {total} |",
        f"| Unique word_ids | {unique_ids} |",
        f"| word_id uniqueness | {'✓ all unique' if unique_ids == total else '✗ duplicates!'} |",
        f"| Total word-count target | 1500–2000 |",
        f"| Status | {'✓ within range' if 1500 <= total <= 2000 else '⚠ outside range'} |",
        "",
        "## Volume Distribution",
        "",
        "| Book | Words |",
        "|---|---|",
    ]
    for code in codes:
        lines.append(f"| {code} | {per_book_counts.get(code, 0)} |")

    lines += [
        "",
        "## unit=U? Entries",
        "",
    ]
    if unit_unknown:
        lines += [
            "| book | word | printed_page |",
            "|---|---|---|",
        ]
        for r in unit_unknown:
            lines.append(f"| {r['book']} | {r['word']} | {r['printed_page']} |")
    else:
        lines.append("_None — all entries have a resolved unit._")

    lines += [
        "",
        "## confidence=low Entries",
        "",
    ]
    if conf_low:
        lines += [
            "| book | word | unit | printed_page |",
            "|---|---|---|---|",
        ]
        for r in conf_low:
            lines.append(f"| {r['book']} | {r['word']} | {r['unit']} | {r['printed_page']} |")
    else:
        lines.append("_None._")

    lines += [
        "",
        "## Field Completeness",
        "",
        "| Field | Non-empty | Total |",
        "|---|---|---|",
    ]
    for field in ["word", "gloss", "unit", "printed_page", "pdf_page"]:
        non_empty = sum(1 for r in all_rows if r.get(field))
        lines.append(f"| {field} | {non_empty} | {total} |")

    lines += [
        "",
        "## Blacklist Stats per Book",
        "",
        "_See per-book report JSON files in `docs/vocab/`._",
        "",
    ]

    report_path = OUT_DIR / "primary_clean_merge_report.md"
    report_path.write_text("\n".join(lines), encoding="utf-8")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: extract_all_primary.py <CODE>  or  extract_all_primary.py --merge")
        print("  CODE: 3A 3B 4A 4B 5A 5B 6A 6B")
        return 1

    arg = sys.argv[1]
    if arg == "--merge":
        merge_all()
        return 0

    code = arg.upper()
    if code not in BOOK_PDFS:
        print(f"Unknown book code: {code!r}. Valid: {list(BOOK_PDFS)}")
        return 1

    stats = extract_book(code)
    if not stats:
        return 1

    # Save per-book report JSON
    report_path = OUT_DIR / f"primary_{code}_report.json"
    rows = stats.pop("rows", [])  # don't serialise all rows into JSON
    report_path.write_text(
        json.dumps(stats, ensure_ascii=False, indent=2, default=str),
        encoding="utf-8",
    )
    print(f"\n  Report JSON: {report_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
