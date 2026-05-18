"""Extract Appendix 2 vocabulary from the PEP 4B textbook PDF.

Uses PyMuPDF get_text("blocks") mode, which gives one text-block per
vocabulary entry (or 2 consecutive blocks for entries whose gloss wraps).
Blocks are already column-separated by the PDF's own layout engine, so
two-column merges that plague line/word extraction are avoided entirely.

Locates Appendix 2 ("Vocabulary" / 词汇表), parses every entry (word/phrase +
Chinese gloss + printed page ref `p.NN`), reverse-looks-up the unit from the
printed page, filters junk via a blacklist, and writes results to
``docs/vocab/primary_4B_clean.csv``.

The script ONLY prints summary statistics and a 10-word sample — never the
full appendix text — so it is safe to share its stdout.

Usage:
    python extract_4B_vocab.py [<pdf_path>] [<csv_out_path>]
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
# Configuration
# ---------------------------------------------------------------------------

DEFAULT_PDF = Path(
    r"C:\Users\willi\OneDrive\Desktop\英语教材\导入CURSOR\小学人教版"
    r"\义务教育教科书·英语（三年级起点）四年级下册.pdf"
)
DEFAULT_CSV_OUT = Path("docs/vocab/primary_4B_clean.csv")
DEFAULT_REPORT_OUT = Path("docs/vocab/primary_4B_report.json")

# Printed-page → Unit map (taken from the textbook Contents page).
# Each tuple is (first_printed_page_of_section, section_name).
UNIT_STARTS: list[tuple[int, str]] = [
    (2, "Unit 1"),
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

# Consistent offset observed for this PDF: pdf_page_idx_1based = printed_page + 5.
PDF_OFFSET = 5

# Italic single-letter fragments that PyMuPDF splits into separate blocks for
# italic/regular boundary reasons. Fix them with word-boundary substitutions
# on the English portion before storing.
ITALIC_FIXES: list[tuple[re.Pattern[str], str]] = [
    (re.compile(r"\bf\s+irst\b"), "first"),
    (re.compile(r"\bf\s+loor\b"), "floor"),
    (re.compile(r"\boff\s+ice\b"), "office"),
    (re.compile(r"\bf\s+ly\b"), "fly"),
]

# Block texts that should never count as entries (page headers/footers etc.).
HEADER_FOOTER_RE = re.compile(
    r"^\s*(?:Vocabulary|Appendix\s*\d+|词\s*汇\s*表|\d+)\s*$"
)
# Section letter (single uppercase A–Z on its own line within a block).
SECTION_LETTER_RE = re.compile(r"^\s*[A-Z]\s*$")
# Page reference "p.NN" (allow trailing punctuation/whitespace).
PAGE_REF_RE = re.compile(r"p\.\s*(\d{1,3})")
# Phonetic transcription chunk: anything between two `/` chars.
PHONETIC_RE = re.compile(r"/[^/]*/")
# CJK character class (used to split English head from Chinese gloss).
CJK_RE = re.compile(r"[\u3000-\u303f\u4e00-\u9fff\uff00-\uffef]")

# Blacklist: if the extracted "word" matches any of these it will be skipped.
BLACKLIST_EXACT = {
    "",
    "appendix",
    "appendix 2",
    "vocabulary",
}
BLACKLIST_REGEX = [
    re.compile(r"^\d+$"),                              # bare numbers
    re.compile(r"^[a-z]$", re.I),                     # single stray letter
    re.compile(r"^[^a-z\u4e00-\u9fff]+$", re.I),      # no letters/CJK at all
]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def normalize_ws(s: str) -> str:
    """Collapse whitespace runs to a single space; decode PUA surrogates.

    This PDF's font maps printable ASCII characters into the Private Use Area
    starting at U+F000 (e.g. U+F02F encodes '/', U+F020 encodes ' ').
    We map those back to real ASCII so that PHONETIC_RE can find the complete
    /…/ delimiters.  PUA characters outside the printable-ASCII band
    (0x20–0x7E) are replaced with a space.
    """
    result: list[str] = []
    for c in s:
        if "\ue000" <= c <= "\uf8ff":
            ascii_code = ord(c) - 0xF000
            result.append(chr(ascii_code) if 0x20 <= ascii_code <= 0x7E else " ")
        elif unicodedata.category(c) == "Zs":
            result.append(" ")
        else:
            result.append(c)
    return re.sub(r"\s+", " ", "".join(result)).strip()


def lookup_unit(printed_page: int) -> str | None:
    """Reverse-lookup which textbook section contains `printed_page`."""
    current: str | None = None
    for start, name in UNIT_STARTS:
        if printed_page >= start:
            current = name
        else:
            break
    return current


def find_appendix2_pdf_pages(doc: fitz.Document) -> list[int]:
    """Return 0-based page indices that hold Appendix 2 content."""
    start_idx: int | None = None
    end_idx: int | None = None
    for i in range(len(doc)):
        text = doc[i].get_text("text")
        # Title page of Appendix 2 has both "Vocabulary" and a 词汇表 heading.
        if start_idx is None and "Vocabulary" in text and "词" in text:
            start_idx = i
            continue
        # Stop when we hit Appendix 3 / "Useful expressions".
        if start_idx is not None and (
            "Appendix 3" in text or "Useful expressions" in text
        ):
            end_idx = i
            break
    if start_idx is None:
        return []
    if end_idx is None:
        end_idx = len(doc)
    return list(range(start_idx, end_idx))


def page_block_texts(page: fitz.Page) -> list[str]:
    """Return cleaned block texts in column-reading order (left then right).

    Uses get_text("blocks") so each PDF text-object becomes one unit.
    In this textbook's Appendix the PDF layout engine already places every
    vocabulary entry in its own block, which makes column-merging impossible.

    Processing steps per block:
    1. Skip blocks in the header strip (y < 50 pt) and footer strip
       (y > page_height − 30 pt) — these hold page numbers and titles.
    2. Split the block's raw text on newlines; discard empty lines, section
       letters (lone A–Z), and known header/footer strings.
    3. Join surviving lines with a space to form one cleaned block string.

    Blocks are sorted left-column-first, top-to-bottom within each column.
    The column boundary is detected from the actual x0 distribution rather
    than being hard-coded, so it works even when page margins differ.
    """
    raw_blocks = page.get_text("blocks")
    # type 0 = text; type 1 = image — skip images.
    text_blocks = [b for b in raw_blocks if b[6] == 0]
    if not text_blocks:
        return []

    ph = page.rect.height
    # Exclude header and footer strips.
    content = [b for b in text_blocks if b[1] > 50 and b[3] < ph - 30]
    if not content:
        return []

    # Detect column boundary: look for the largest x0 gap.
    x0_vals = sorted(set(round(b[0]) for b in content))
    if len(x0_vals) >= 2:
        # Find the biggest jump between consecutive distinct x0 values.
        max_gap = 0
        split_after = x0_vals[0]
        for a, b_val in zip(x0_vals, x0_vals[1:]):
            gap = b_val - a
            if gap > max_gap:
                max_gap = gap
                split_after = a
        mid_x = split_after + max_gap / 2
    else:
        mid_x = page.rect.width / 2

    # Sort key: (4-pt y-bucket, x0).
    # Grouping by 4-pt bucket before x0 prevents sub-pixel y-jitter from
    # flipping the order of same-row italic fragments (e.g. narrow "f" block
    # at y=344.6193 vs. its "ly..." continuation block at y=344.6190).
    def _row_x_key(b: tuple) -> tuple:
        return (round(b[1] / 4) * 4, b[0])

    left = sorted([b for b in content if b[0] <= split_after], key=_row_x_key)
    right = sorted([b for b in content if b[0] > split_after], key=_row_x_key)

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
    """Group consecutive block texts into entry buffers.

    An entry is a run of block texts that ends when a `p.NN` reference
    appears (the reference may be in the same block as the word, or in a
    following continuation block for long glosses).
    """
    entries: list[list[str]] = []
    buf: list[str] = []
    for text in block_texts:
        text = text.strip()
        if not text:
            continue
        # Header/footer strings that somehow survived block filtering.
        if HEADER_FOOTER_RE.match(text):
            buf = []
            continue
        # A block containing no Latin letters and no page reference is a
        # Chinese-only annotation (e.g. the formatting note on the first
        # Appendix page).  Reset the buffer rather than accumulating it so
        # the next vocabulary entry starts clean.
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
    """Turn an entry buffer into {word, gloss, printed_page}.

    Returns a dict with printed_page=None when no page reference is found.
    """
    text = normalize_ws(" ".join(buf))

    m = PAGE_REF_RE.search(text)
    if not m:
        return {"word": "", "gloss": "", "printed_page": None, "raw": text}
    printed_page = int(m.group(1))
    body = (text[: m.start()] + " " + text[m.end():]).strip()

    # Strip phonetic transcriptions /.../
    body_no_phon = PHONETIC_RE.sub(" ", body)
    body_no_phon = normalize_ws(body_no_phon)

    # Split English head from Chinese gloss at the first CJK character.
    cjk_match = CJK_RE.search(body_no_phon)
    if cjk_match:
        english = body_no_phon[: cjk_match.start()].strip()
        gloss = body_no_phon[cjk_match.start():].strip()
    else:
        english = body_no_phon.strip()
        gloss = ""

    # Fix italic-fragment splits (e.g. "f irst" → "first").
    for pat, repl in ITALIC_FIXES:
        english = pat.sub(repl, english)
    english = normalize_ws(english)

    # Strip trailing bracket/punctuation artifacts that appear when a Chinese
    # parenthetical note immediately follows the English head with an ASCII
    # '(' (e.g. "o'clock (" → "o'clock").
    english = re.sub(r"[\s()\[\]{}<>]+$", "", english).strip()

    gloss = normalize_ws(gloss)
    # If the English head absorbed the opening '(' of a parenthetical note,
    # the gloss may start with a dangling ')'.  Remove it.
    gloss = re.sub(r"^[)\]}>]+\s*", "", gloss).strip()

    return {
        "word": english,
        "gloss": gloss,
        "printed_page": printed_page,
        "raw": text,
    }


def is_blacklisted(word: str) -> bool:
    w = word.strip().lower()
    if w in BLACKLIST_EXACT:
        return True
    for pat in BLACKLIST_REGEX:
        if pat.match(w):
            return True
    return False


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main() -> int:
    pdf_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PDF
    csv_out = Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_CSV_OUT
    report_out = DEFAULT_REPORT_OUT

    if not pdf_path.exists():
        print(f"ERROR: PDF not found: {pdf_path}", file=sys.stderr)
        return 1

    csv_out.parent.mkdir(parents=True, exist_ok=True)

    stats = {
        "pdf": str(pdf_path),
        "appendix2_pdf_pages_1based": [],
        "raw_entries": 0,
        "kept": 0,
        "blacklisted": 0,
        "missing_page_ref": 0,
        "unit_lookup_success": 0,
        "unit_lookup_failed": 0,
    }

    rows: list[dict] = []

    doc = fitz.open(str(pdf_path))
    appendix_pages = find_appendix2_pdf_pages(doc)
    stats["appendix2_pdf_pages_1based"] = [p + 1 for p in appendix_pages]

    for idx in appendix_pages:
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

            printed_page = parsed["printed_page"]
            unit = lookup_unit(printed_page)
            if unit is None:
                stats["unit_lookup_failed"] += 1
            else:
                stats["unit_lookup_success"] += 1

            rows.append(
                {
                    "book": "primary_4B",
                    "unit": unit or "",
                    "word": parsed["word"],
                    "gloss": parsed["gloss"],
                    "printed_page": printed_page,
                    "pdf_page": printed_page + PDF_OFFSET,
                }
            )
            stats["kept"] += 1

    doc.close()

    # Deduplicate on (word, printed_page). Preserve first-seen order.
    seen: set[tuple[str, int]] = set()
    deduped: list[dict] = []
    for r in rows:
        key = (r["word"].lower(), r["printed_page"])
        if key in seen:
            continue
        seen.add(key)
        deduped.append(r)
    stats["deduped"] = len(deduped)

    # Write CSV.
    with csv_out.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["book", "unit", "word", "gloss", "printed_page", "pdf_page"],
        )
        writer.writeheader()
        writer.writerows(deduped)

    # Write JSON report.
    report_out.write_text(
        json.dumps(stats, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # ---- console summary (numbers + 10-word sample only) ----
    print("=== primary_4B vocabulary extraction ===")
    print(f"pdf:                   {pdf_path}")
    print(f"appendix 2 pdf pages:  {stats['appendix2_pdf_pages_1based']}")
    print(f"raw entry buffers:     {stats['raw_entries']}")
    print(f"  missing p.NN ref:    {stats['missing_page_ref']}")
    print(f"  blacklisted:         {stats['blacklisted']}")
    print(f"kept rows:             {stats['kept']}")
    print(f"after dedup:           {stats['deduped']}")
    print(f"unit lookup success:   {stats['unit_lookup_success']}")
    print(f"unit lookup failed:    {stats['unit_lookup_failed']}")
    print(f"csv written to:        {csv_out}")
    print(f"report written to:     {report_out}")

    if deduped:
        step = max(1, len(deduped) // 10)
        sample = deduped[::step][:10]
        print("\nSample (10 entries, word | unit | printed_page):")
        for r in sample:
            print(f"  {r['word']!r:30s} | {r['unit']:10s} | p.{r['printed_page']}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
