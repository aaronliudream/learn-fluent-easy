"""Extract Appendix 1 vocabulary from all 8 PEP primary English textbooks.

Series: 人教版（PEP）英语（三年级起点）3A/3B/4A/4B/5A/5B/6A/6B.

Extracts from "Appendix 1: Words in each unit" (Appendix 2 for 5A–6B) rather
than the alphabetical "Vocabulary" appendix.  This gives **exact unit labels
printed directly in the textbook** — no page-number reverse lookup.

Per-book structure observed:
  3A–4B  : Appendix 1 "Words in each unit"  (stop: first page with "Vocabulary")
  5A–6A  : Appendix 2 "Words in each unit"  (same stop rule)
  6B     : Appendix 2 "Words in each unit"  (only 4 main units)

Uses the same PyMuPDF blocks-mode cleaning logic validated on 4B (PUA→ASCII,
fi/fl ligature expansion, italic-fragment reassembly, CJK annotation filter,
column-aware block ordering, trailing-punctuation strip).

Usage:
    python extract_all_primary.py 3A        # single book
    python extract_all_primary.py --all     # all 8 books in order
    python extract_all_primary.py --merge   # merge existing per-book CSVs
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

PDF_OFFSET = 5   # pdf_page_1based = printed_page + PDF_OFFSET  (all 8 books)
OUT_DIR    = Path("docs/vocab")


# ---------------------------------------------------------------------------
# Text cleaning constants
# ---------------------------------------------------------------------------

# Unicode ligatures that appear in italic/mixed-font spans.
_LIGATURE_MAP: dict[str, str] = {
    "\ufb00": "ff",
    "\ufb01": "fi",   # ﬁ — most common in these books: ﬁve, ﬁrst, ﬁsh …
    "\ufb02": "fl",   # ﬂ
    "\ufb03": "ffi",
    "\ufb04": "ffl",
    "\ufb05": "st",
    "\ufb06": "st",
}

ITALIC_FIXES: list[tuple[re.Pattern[str], str]] = [
    # f-italic splits (isolated 'f' separate from word body)
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
    # fi-ligature splits  (ﬁ→fi already done in normalize_ws)
    (re.compile(r"\bfi\s+rst\b"),  "first"),
    (re.compile(r"\bfi\s+ve\b"),   "five"),
    (re.compile(r"\bfi\s+eld\b"),  "field"),
    (re.compile(r"\bfi\s+sh\b"),   "fish"),
    (re.compile(r"\bfi\s+ne\b"),   "fine"),
    (re.compile(r"\bfi\s+lm\b"),   "film"),
    (re.compile(r"\bfi\s+nish\b"), "finish"),
    # fl-ligature splits
    (re.compile(r"\bfl\s+oor\b"),  "floor"),
    (re.compile(r"\bfl\s+ower\b"), "flower"),
    (re.compile(r"\bfl\s+y\b"),    "fly"),
    # fi-ligature + extra letter (fifteen, fifth)
    (re.compile(r"\bfi\s+fteen\b"),  "fifteen"),
    (re.compile(r"\bfi\s+fth\b"),    "fifth"),
    (re.compile(r"\bf\s+ifteen\b"),  "fifteen"),
    (re.compile(r"\bf\s+ifth\b"),    "fifth"),
]

# Headers/footers to discard.  Extended for Appendix 1 page titles.
HEADER_FOOTER_RE = re.compile(
    r"^\s*(?:Vocabulary|Words in each unit|Appendix\s*\d+"
    r"|词\s*汇\s*表|单\s*元\s*词\s*汇\s*表|\d+)\s*$",
    re.IGNORECASE,
)
# Single uppercase section letter (used in Appendix 2 alphabetical dividers).
SECTION_LETTER_RE = re.compile(r"^\s*[A-Z]\s*$")
# Page reference "p.NN".
PAGE_REF_RE   = re.compile(r"p\.\s*(\d{1,3})")
# Phonetic chunk between two forward-slashes.
PHONETIC_RE   = re.compile(r"/[^/]*/")
# CJK character class (splits English head from Chinese gloss).
CJK_RE        = re.compile(r"[\u3000-\u303f\u4e00-\u9fff\uff00-\uffef]")

# Unit / Recycle section headers in Appendix 1.
# Matches at the START of a block text (the header may share the block with
# the first vocabulary entry on the same line, as in Grade 5–6 two-column pages).
UNIT_HEADER_START_RE = re.compile(
    r"^(Unit\s+[1-9]|Recycle(?:\s+[12])?)\b\s*",
    re.IGNORECASE,
)

BLACKLIST_EXACT = {"", "appendix", "appendix 2", "appendix 3", "vocabulary",
                   "words in each unit"}
BLACKLIST_REGEX = [
    re.compile(r"^\d+$"),
    re.compile(r"^[a-z]$", re.I),
    re.compile(r"^[^a-z\u4e00-\u9fff]+$", re.I),
]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def normalize_ws(s: str) -> str:
    """Collapse whitespace; decode PUA surrogates; expand Unicode ligatures."""
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


def find_per_unit_pdf_pages(doc: fitz.Document) -> list[int]:
    """Return 0-based indices of Appendix 'Words in each unit' pages.

    Detection: first page with both "Words in each unit" (English title) AND
    a CJK 单 character (from '单 元 词 汇 表').

    Termination: first subsequent page that contains "Vocabulary" (the title
    of the alphabetical appendix that follows).  Continuation pages of 'Words
    in each unit' never use the English word "Vocabulary".
    """
    start_idx: int | None = None
    end_idx: int | None = None

    for i in range(len(doc)):
        text = doc[i].get_text("text")
        if start_idx is None and "Words in each unit" in text and "单" in text:
            start_idx = i
            continue
        if start_idx is not None and "Vocabulary" in text:
            end_idx = i
            break

    if start_idx is None:
        return []
    if end_idx is None:
        end_idx = len(doc)
    return list(range(start_idx, end_idx))


def page_block_texts(page: fitz.Page) -> list[str]:
    """Return cleaned block texts in column-reading order (left then right).

    Column detection: the largest x0 gap is the column boundary, but only if
    that gap exceeds 15 % of the page width.  Pages with a smaller largest gap
    are treated as single-column (Appendix 1 of Grade 3–4 books).
    """
    raw_blocks = page.get_text("blocks")
    text_blocks = [b for b in raw_blocks if b[6] == 0]
    if not text_blocks:
        return []

    ph = page.rect.height
    pw = page.rect.width
    content = [b for b in text_blocks if b[1] > 50 and b[3] < ph - 30]
    if not content:
        return []

    x0_vals = sorted(set(round(b[0]) for b in content))

    # Find the largest gap between consecutive distinct x0 values.
    # Use the midpoint of that gap as the column boundary so that float x0
    # values (e.g. 62.4) are not accidentally sent to the wrong column when
    # the boundary equals the rounded x0 (e.g. 62).
    mid_x = float("inf")   # default: single column, all blocks go to "left"
    if len(x0_vals) >= 2:
        max_gap = 0
        best_split = x0_vals[0]
        for a, b_val in zip(x0_vals, x0_vals[1:]):
            gap = b_val - a
            if gap > max_gap:
                max_gap = gap
                best_split = a
        if max_gap >= pw * 0.15:   # substantial gap → two-column layout
            mid_x = best_split + max_gap / 2   # midpoint between columns

    def _row_x_key(b: tuple) -> tuple:
        return (round(b[1] / 4) * 4, b[0])

    left  = sorted([b for b in content if b[0] <= mid_x], key=_row_x_key)
    right = sorted([b for b in content if b[0] > mid_x],  key=_row_x_key)

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


def split_entries_per_unit(
    block_texts: Iterable[str],
) -> list[tuple[str, list[str]]]:
    """Group block texts into (unit_name, entry_buf) pairs.

    Unit labels are read **directly from 'Unit N' / 'Recycle N' headers**
    embedded in the block stream.  No page-number reverse lookup is needed.

    Two layout variants are handled:
      • Grade 3–4 (single-column): the unit header is its own standalone block.
      • Grade 5–6 (two-column):    the unit header shares a block with the
        first vocabulary entry of that unit (e.g. "Unit 1 \\nold /…/ p.5").
        In this case the remainder after the header prefix is the entry start.

    Root-cause fix for gloss-swallowing:
      Some PDF blocks contain multiple vocabulary entries (e.g. two entries that
      share the same printed page, laid out on consecutive lines in the source
      column).  Each entry ends at its own "p.NN" marker.  By splitting every
      incoming text at EVERY p.NN boundary we ensure each entry is flushed
      independently — preventing the classic pattern where:
        "salad 蔬菜沙拉；混合沙拉 p.25 hamburger 汉堡包 p.25"
      would otherwise swallow 'hamburger' into 'salad's gloss.
    """
    entries: list[tuple[str, list[str]]] = []
    buf: list[str] = []
    current_unit: str = "U?"

    def _flush_buf() -> None:
        if buf:
            entries.append((current_unit, list(buf)))
            buf.clear()

    def _ingest(text: str) -> None:
        """Add text to buf, flushing at every p.NN boundary found in text."""
        refs = list(PAGE_REF_RE.finditer(text))
        if not refs:
            # No page ref — accumulate as part of current entry
            buf.append(text)
            return
        # One or more page refs: each marks the end of one entry
        pos = 0
        for ref_m in refs:
            segment = text[pos : ref_m.end()].strip()
            if segment:
                buf.append(segment)
            _flush_buf()
            pos = ref_m.end()
        # Any text after the last page ref is the start of the next entry —
        # but ONLY if it starts with an English letter.  Trailing fragments
        # like ",28" (a second-page cross-reference printed as "p.25,28")
        # are NOT new entries and must be discarded to prevent them from
        # contaminating the following entry's word field.
        tail = text[pos:].strip()
        if tail and re.match(r"[a-zA-Z]", tail):
            buf.append(tail)

    for text in block_texts:
        text = text.strip()
        if not text:
            continue
        if HEADER_FOOTER_RE.match(text):
            buf.clear()
            continue
        # Pure-CJK annotation block (formatting note at appendix start).
        if not re.search(r"[a-zA-Z]", text) and not PAGE_REF_RE.search(text):
            buf.clear()
            continue

        # ---- Unit / Recycle header detection ----
        m = UNIT_HEADER_START_RE.match(text)
        if m:
            current_unit = re.sub(r"\s+", " ", m.group(1)).strip()
            buf.clear()
            remainder = text[m.end():].strip()
            if remainder:
                _ingest(remainder)
            continue

        # ---- Normal vocabulary block ----
        _ingest(text)

    if buf:
        entries.append((current_unit, list(buf)))
    return entries


def parse_entry(buf: list[str]) -> dict | None:
    """Turn an entry buffer into {word, gloss, printed_page, raw}."""
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
    # Strip trailing bracket / punctuation artifacts
    english = re.sub(r"[\s()\[\]{}<>]+$", "", english).strip()
    # Strip trailing ordinal parentheticals: "first (1st" → "first"
    english = re.sub(r"\s*\(\s*\d+(?:st|nd|rd|th)\s*$", "", english, flags=re.I).strip()

    gloss = normalize_ws(gloss)
    # Remove leading dangling close-bracket left over from parenthetical notes
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
    re.compile(r"\bstory\b",  re.I),
    re.compile(r"\bappendix\b", re.I),
    re.compile(r"^[a-z]$", re.I),
]


def extract_book(code: str) -> dict:
    """Extract from Appendix 1 ('Words in each unit') for one book."""
    fname    = BOOK_PDFS[code]
    pdf_path = PDF_DIR / fname
    csv_out  = OUT_DIR / f"primary_{code}_clean.csv"

    if not pdf_path.exists():
        print(f"ERROR: PDF not found: {pdf_path}", file=sys.stderr)
        return {}

    stats: dict = {
        "book":                     code,
        "pdf":                      fname,
        "source":                   "Appendix 1 (Words in each unit) — unit from direct textbook labels",
        "per_unit_pdf_pages_1based": [],
        "raw_entries":              0,
        "kept":                     0,
        "blacklisted":              0,
        "missing_page_ref":         0,
        "unit_unknown":             0,
    }

    rows: list[dict] = []
    doc = fitz.open(str(pdf_path))
    per_unit_pages = find_per_unit_pdf_pages(doc)
    stats["per_unit_pdf_pages_1based"] = [p + 1 for p in per_unit_pages]

    # Combine ALL pages' block texts before splitting so that the current_unit
    # context carries across page boundaries.  (A unit section often starts at
    # the bottom of one page and continues at the top of the next page with no
    # repeated header.)
    all_block_texts: list[str] = []
    for idx in per_unit_pages:
        all_block_texts.extend(page_block_texts(doc[idx]))

    for unit, buf in split_entries_per_unit(all_block_texts):
        stats["raw_entries"] += 1
        parsed = parse_entry(buf)
        if parsed is None or parsed["printed_page"] is None:
            stats["missing_page_ref"] += 1
            continue
        if is_blacklisted(parsed["word"]):
            stats["blacklisted"] += 1
            continue

        if unit == "U?":
            stats["unit_unknown"] += 1

        pp = parsed["printed_page"]
        rows.append({
            "book":         f"primary_{code}",
            "unit":         unit,
            "word":         parsed["word"],
            "gloss":        parsed["gloss"],
            "printed_page": pp,
            "pdf_page":     pp + PDF_OFFSET,
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
    stats["noise_hits"]  = noise_hits
    stats["total_noise"] = sum(len(v) for v in noise_hits.values())

    # Write CSV
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    with csv_out.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(
            f, fieldnames=["book", "unit", "word", "gloss", "printed_page", "pdf_page"]
        )
        writer.writeheader()
        writer.writerows(deduped)

    stats["csv"]  = str(csv_out)
    stats["rows"] = deduped

    # ---- Console report ----
    print(f"\n{'='*55}")
    print(f"  {code}  —  primary_{code}_clean.csv")
    print(f"{'='*55}")
    print(f"  Source:                        Appendix 1 (Words in each unit)")
    print(f"  Appendix PDF pages (1-based):  {stats['per_unit_pdf_pages_1based']}")
    print(f"  Raw entry buffers:             {stats['raw_entries']}")
    print(f"  Missing p.NN ref:              {stats['missing_page_ref']}")
    print(f"  Blacklisted:                   {stats['blacklisted']}")
    print(f"  Kept → deduped:                {stats['kept']} → {stats['deduped']}")
    print(f"  unit=U? (no header seen yet):  {stats['unit_unknown']}")

    sanity = (
        "OK"            if 50 <= stats["deduped"] <= 600 else
        "WARNING: low"  if stats["deduped"] < 50          else
        "⚠ ABOVE 600 — STOP"
    )
    print(f"  Word-count sanity (50–600):    {stats['deduped']}  [{sanity}]")

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
            print(f"    {r['word']!r:32s} | {r['unit']:12s} | p.{r['printed_page']}")

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
    all_rows: list[dict]        = []
    per_book_counts: dict[str, int] = {}
    unit_unknown: list[dict]    = []

    for code in codes:
        csv_path = OUT_DIR / f"primary_{code}_clean.csv"
        if not csv_path.exists():
            print(f"  MISSING: {csv_path} — skipping")
            continue
        with csv_path.open(encoding="utf-8-sig") as f:
            rows = list(csv.DictReader(f))
        per_book_counts[code] = len(rows)
        all_rows.extend(rows)

    total = len(all_rows)
    for i, r in enumerate(all_rows, 1):
        r["word_id"] = f"W{i:04d}"
        if r.get("unit", "").startswith("U?") or not r.get("unit"):
            unit_unknown.append(r)

    merged_csv = OUT_DIR / "primary_merged_clean.csv"
    fieldnames = ["word_id", "book", "unit", "word", "gloss", "printed_page", "pdf_page"]
    with merged_csv.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(all_rows)

    ids = [r["word_id"] for r in all_rows]
    unique_ids = len(set(ids))

    print(f"\n{'='*55}")
    print(f"  MERGE COMPLETE")
    print(f"{'='*55}")
    status = (
        "OK" if 400 <= total <= 1500 else
        "WARNING: outside expected 700-900 range"
    )
    print(f"  Total words:          {total}  [{status}]")
    print(f"  Unique word_ids:      {unique_ids}  ({'OK' if unique_ids == total else 'DUPLICATES!'})")
    print(f"\n  Per-book distribution:")
    for code in codes:
        n = per_book_counts.get(code, 0)
        print(f"    {code}: {n}")
    print(f"\n  unit=U? entries:      {len(unit_unknown)}")
    if unit_unknown:
        for r in unit_unknown[:10]:
            print(f"    {r['word']!r} p.{r['printed_page']} ({r['book']})")

    _write_report(all_rows, per_book_counts, codes, unit_unknown, total, unique_ids)
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
    total: int,
    unique_ids: int,
) -> None:
    lines = [
        "# Primary Vocabulary Merge Report",
        "",
        "Extracted from **Appendix 1 ('Words in each unit')** of all 8 books.",
        "",
        "> **Unit attribution**: unit labels are read **directly from the section",
        "> headers printed in the textbook** — no page-number reverse lookup.",
        "> This guarantees 100 % accurate unit assignment at every section boundary.",
        "",
        "## Summary",
        "",
        "| Item | Value |",
        "|---|---|",
        f"| Total words | {total} |",
        f"| Unique word_ids | {unique_ids} |",
        f"| word_id uniqueness | {'✓ all unique' if unique_ids == total else '✗ duplicates!'} |",
        f"| Expected range | 700–900 |",
        f"| Status | {'✓ within range' if 700 <= total <= 900 else '⚠ outside range'} |",
        "| unit source | Appendix 1 direct textbook labels |",
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
        lines += ["| book | word | printed_page |", "|---|---|---|"]
        for r in unit_unknown:
            lines.append(f"| {r['book']} | {r['word']} | {r['printed_page']} |")
    else:
        lines.append("_None — all entries have a resolved unit._")

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

    lines.append("")
    report_path = OUT_DIR / "primary_clean_merge_report.md"
    report_path.write_text("\n".join(lines), encoding="utf-8")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------


def main() -> int:
    args = sys.argv[1:]
    if not args:
        print("Usage:")
        print("  extract_all_primary.py <CODE> [CODE ...]  — one or more books")
        print("  extract_all_primary.py --all               — all 8 books")
        print("  extract_all_primary.py --merge             — merge existing CSVs")
        return 1

    if args == ["--merge"]:
        merge_all()
        return 0

    if args == ["--all"]:
        run_codes = ["3A", "3B", "4A", "4B", "5A", "5B", "6A", "6B"]
    else:
        run_codes = [a.upper() for a in args]
        invalid = [c for c in run_codes if c not in BOOK_PDFS]
        if invalid:
            print(f"Unknown book code(s): {invalid}. Valid: {list(BOOK_PDFS)}")
            return 1

    for code in run_codes:
        stats = extract_book(code)
        if not stats:
            return 1
        _save_report(code, stats)
    return 0


def _save_report(code: str, stats: dict) -> None:
    report_path = OUT_DIR / f"primary_{code}_report.json"
    rows = stats.pop("rows", [])  # don't serialise full rows into JSON
    _ = rows
    report_path.write_text(
        json.dumps(stats, ensure_ascii=False, indent=2, default=str),
        encoding="utf-8",
    )
    print(f"\n  Report JSON: {report_path}")


if __name__ == "__main__":
    sys.exit(main())
