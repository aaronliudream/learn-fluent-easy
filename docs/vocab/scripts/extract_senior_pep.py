#!/usr/bin/env python3
"""Extract curriculum vocabulary from PEP senior-high 必修 textbooks (alphabetical appendix).

Series: 人教版 普通高中教科书·英语 必修 第一册–第三册
Source PDFs: .../高中人教版/

Only **DIN-Medium** headwords/phrases (课标词, bold in print) are imported.
Skips DIN-Regular derivatives, △ proper nouns, and non-curriculum entries.

Usage:
    python extract_senior_pep.py B1
    python extract_senior_pep.py --all
    python extract_senior_pep.py --merge
"""

from __future__ import annotations

import csv
import json
import re
import sys
import unicodedata
import uuid
from pathlib import Path
from typing import Any

import fitz

ROOT = Path(__file__).resolve().parents[3]
PDF_DIR = Path(r"C:\Users\willi\OneDrive\Desktop\英语教材\导入CURSOR\高中人教版")
OUT_DIR = ROOT / "docs" / "vocab"

BOOK_PDFS: dict[str, str] = {
    "B1": "普通高中教科书·英语必修 第一册.pdf",
    "B2": "普通高中教科书·英语必修 第二册.pdf",
    "B3": "普通高中教科书·英语必修 第三册.pdf",
    # Elective / selective-compulsory — add PDF filenames here when available:
    # "X1": "普通高中教科书·英语选择性必修 第一册.pdf",
    # "X2": "普通高中教科书·英语选择性必修 第二册.pdf",
    # "X3": "普通高中教科书·英语选择性必修 第三册.pdf",
    # "X4": "普通高中教科书·英语选择性必修 第四册.pdf",
}
BOOK_YEAR_BAND: dict[str, int] = {"B1": 1, "B2": 2, "B3": 3}
BOOK_LABEL: dict[str, str] = {
    "B1": "必修第一册",
    "B2": "必修第二册",
    "B3": "必修第三册",
}

CURRICULUM_FONT = "DIN-Medium"
SKIP_HEAD_FONTS = ("DIN-Regular",)
PROPER_NOUN_MARKERS = ("△", "\u25b3")

_LIGATURE_MAP: dict[str, str] = {
    "\ufb00": "ff",
    "\ufb01": "fi",
    "\ufb02": "fl",
    "\ufb03": "ffi",
    "\ufb04": "ffl",
}

PHONETIC_RE = re.compile(r"/[^/]{1,80}/")
POS_RE = re.compile(
    r"\b(n\.|v\.|vt\.|vi\.|adj\.|adv\.|prep\.|conj\.|pron\.|interj\.|abbr\.|modal v\.|aux\.|art\.|num\.|det\.)\b",
    re.I,
)
REF_RE = re.compile(r"\(([0-9]+|w)\)\s*$")
SECTION_LETTER_RE = re.compile(r"^\s*[A-Z]\s*$")
HEADER_RE = re.compile(
    r"^(?:Vocabulary|Appendices|词汇表|注：|Irregular Verbs|不规则动词|Words and Expressions).*$",
    re.I,
)
REF_TAIL_RE = re.compile(r"\((\d+|w)\)")


def split_plain_entries(plain: str) -> list[str]:
    """Split concatenated appendix line into entry chunks (no variable-width lookbehind)."""
    if not plain.strip():
        return []
    indices = [0]
    for m in REF_TAIL_RE.finditer(plain):
        end = m.end()
        if end < len(plain) and (
            plain[end].isalpha() or plain[end] in "△\u25b3("
        ):
            indices.append(end)
    indices.append(len(plain))
    chunks: list[str] = []
    for a, b in zip(indices, indices[1:]):
        chunk = plain[a:b].strip()
        if chunk:
            chunks.append(chunk)
    return chunks

NS = uuid.UUID("d4e8a1b2-6c3f-5a9e-8f7d-2b1c0e9a8d7f")


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


def is_curriculum_font(font: str) -> bool:
    return font == CURRICULUM_FONT


def is_ipa_font(font: str) -> bool:
    return "Ipa" in font or "phon" in font.lower()


def is_chinese_font(font: str) -> bool:
    return "FZZDX" in font or "GB" in font


def find_vocab_page_range(doc: fitz.Document) -> tuple[int, int]:
    """Return 0-based [start, end] inclusive indices for alphabetical Vocabulary appendix."""
    irregular_idx: int | None = None
    for i in range(len(doc)):
        t = doc[i].get_text("text")
        if "Irregular Verbs" in t and "Past tense" in t:
            irregular_idx = i
            break
    if irregular_idx is None:
        raise ValueError("Could not find Irregular Verbs section")

    start_idx: int | None = None
    # Forward scan: first title page of the alphabetical list (not the latest chunk).
    for i in range(irregular_idx):
        t = doc[i].get_text("text")
        if "词汇表" in t and "Vocabulary" in t:
            start_idx = i
            break
        if start_idx is None and "Vocabulary" in t and (
            " n. " in t or " vt. " in t or " adj. " in t
        ):
            start_idx = i

    if start_idx is None:
        # Fallback: last appendix page with dense pos-tagged English before irregular verbs.
        for i in range(irregular_idx - 1, max(0, irregular_idx - 25), -1):
            t = doc[i].get_text("text")
            if len(t) > 400 and sum(
                1 for tag in (" n. ", " vt. ", " vi. ", " adj. ", " adv. ") if tag in t
            ) >= 2:
                start_idx = i
                break

    if start_idx is None:
        raise ValueError("Could not find Vocabulary appendix start")

    return start_idx, irregular_idx - 1


def page_spans_ordered(page: fitz.Page) -> list[dict[str, Any]]:
    """Spans in column-reading order with font metadata."""
    d = page.get_text("dict")
    blocks = [b for b in d["blocks"] if b["type"] == 0]
    if not blocks:
        return []

    ph, pw = page.rect.height, page.rect.width
    content = [
        b
        for b in blocks
        if b["bbox"][1] > 40 and b["bbox"][3] < ph - 20
    ]
    if not content:
        return []

    x0_vals = sorted(set(round(b["bbox"][0]) for b in content))
    mid_x = float("inf")
    if len(x0_vals) >= 2:
        max_gap = 0
        best_split = x0_vals[0]
        for a, b_val in zip(x0_vals, x0_vals[1:]):
            gap = b_val - a
            if gap > max_gap:
                max_gap = gap
                best_split = a
        if max_gap >= pw * 0.12:
            mid_x = best_split + max_gap / 2

    def _key(b: dict) -> tuple:
        bb = b["bbox"]
        return (round(bb[1] / 3) * 3, bb[0])

    left = sorted([b for b in content if b["bbox"][0] <= mid_x], key=_key)
    right = sorted([b for b in content if b["bbox"][0] > mid_x], key=_key)

    spans: list[dict[str, Any]] = []
    for blk in left + right:
        for line in blk["lines"]:
            for s in line["spans"]:
                txt = normalize_ws(s["text"])
                if not txt:
                    continue
                spans.append(
                    {
                        "text": txt,
                        "font": s.get("font", ""),
                        "x": s["bbox"][0],
                        "y": s["bbox"][1],
                    }
                )
    return spans


def spans_to_plain(spans: list[dict[str, Any]]) -> str:
    return "".join(s["text"] for s in spans)


def headword_from_spans(spans: list[dict[str, Any]]) -> tuple[str, bool]:
    """Extract headword from entry start spans; return (word, is_curriculum)."""
    if not spans:
        return "", False

    first = spans[0]["text"]
    if any(first.startswith(m) for m in PROPER_NOUN_MARKERS):
        return "", False

    head_parts: list[str] = []
    curriculum = False
    for s in spans:
        font = s["font"]
        txt = s["text"].strip()
        if not txt:
            continue
        if is_ipa_font(font) or txt.startswith("/"):
            break
        if POS_RE.match(txt) or txt in {"n.", "v.", "vt.", "vi.", "adj.", "adv."}:
            break
        if is_chinese_font(font) or re.search(r"[\u4e00-\u9fff]", txt):
            break
        if REF_RE.search(txt):
            break
        if any(txt.startswith(m) for m in PROPER_NOUN_MARKERS):
            return "", False
        if font in SKIP_HEAD_FONTS:
            return "", False
        if is_curriculum_font(font):
            curriculum = True
            if re.match(r"^[A-Za-z0-9][A-Za-z0-9' .\-/()]*$", txt) or re.match(
                r"^\([a-z ]+\)", txt
            ):
                head_parts.append(txt)
            else:
                break
        elif head_parts:
            break
    word = normalize_ws(" ".join(head_parts))
    word = word.strip(" \t")
    if not word or not curriculum:
        return "", False
    return word, True


def parse_entry_text(entry: str, head_hint: str) -> dict[str, str] | None:
    entry = normalize_ws(entry)
    if not entry or HEADER_RE.match(entry):
        return None
    if any(entry.startswith(m) for m in PROPER_NOUN_MARKERS):
        return None

    # Strip leading section markers
    entry = re.sub(r"^\t*[A-Z]\s+", "", entry)

    ref_m = REF_RE.search(entry)
    source_ref = ref_m.group(1) if ref_m else ""
    body = entry[: ref_m.start()].strip() if ref_m else entry

    word = head_hint
    rest = body
    if body.lower().startswith(word.lower()):
        rest = body[len(word) :].strip()

    phonetic = ""
    pm = PHONETIC_RE.search(rest)
    if pm:
        phonetic = normalize_ws(pm.group(0).strip())
        rest = (rest[: pm.start()] + rest[pm.end() :]).strip()

    pos_parts: list[str] = []
    meaning_parts: list[str] = []
    for pm2 in POS_RE.finditer(rest):
        pos_parts.append(pm2.group(1).lower())
    pos = " ".join(dict.fromkeys(pos_parts)) if pos_parts else ""

      # Meaning: CJK gloss only (strip bleed from adjacent entries / headers)
    cjk_chunks = re.findall(r"[\u4e00-\u9fff][\u4e00-\u9fff；、，,：:（）()《》\w\s\-…·]*", rest)
    meaning_cn = normalize_ws("".join(cjk_chunks))
    meaning_cn = meaning_cn.replace(",", "、").replace(";", "；")
    for stop in ("词汇表", "Vocabulary", "Appendices", "Irregular Verbs"):
        if stop in meaning_cn:
            meaning_cn = meaning_cn.split(stop)[0].strip()
    # Drop trailing province/person gloss bleed (专有名词释义)
    meaning_cn = re.sub(
        r"[（(][^）)]{0,30}(省|市|国|县|区|共和国|王朝|朝代)[）)].*$",
        "",
        meaning_cn,
    ).strip()

    if not word or not meaning_cn:
        return None
    if len(word) > 120 or len(meaning_cn) > 80:
        return None

    return {
        "word": word,
        "phonetic": phonetic,
        "pos": pos,
        "meaning_cn": meaning_cn,
        "source_ref": source_ref,
    }


def curriculum_heads_from_spans(spans: list[dict[str, Any]]) -> set[str]:
    """All DIN-Medium head tokens/phrases on the page (lowercased)."""
    heads: set[str] = set()
    i = 0
    while i < len(spans):
        s = spans[i]
        if not is_curriculum_font(s["font"]):
            i += 1
            continue
        txt = s["text"].strip()
        if not txt or any(txt.startswith(m) for m in PROPER_NOUN_MARKERS):
            i += 1
            continue
        if not re.match(r"^[A-Za-z(]", txt):
            i += 1
            continue
        parts = [txt]
        j = i + 1
        while j < len(spans) and is_curriculum_font(spans[j]["font"]):
            nt = spans[j]["text"].strip()
            if not nt or is_ipa_font(spans[j]["font"]) or nt.startswith("/"):
                break
            if POS_RE.match(nt) or re.search(r"[\u4e00-\u9fff]", nt):
                break
            parts.append(nt)
            j += 1
        head = normalize_ws(" ".join(parts))
        if head:
            heads.add(head.lower())
        i = j if j > i else i + 1
    return heads


def split_entries_with_fonts(spans: list[dict[str, Any]]) -> list[tuple[str, str]]:
    """Split page into curriculum entries using ref boundaries + DIN-Medium heads."""
    plain = spans_to_plain(spans)
    if not plain.strip():
        return []

    allowed = curriculum_heads_from_spans(spans)
    allowed_first = {h.split()[0].lower() for h in allowed}

    results: list[tuple[str, str]] = []
    for chunk in split_plain_entries(plain):
        chunk = chunk.strip()
        if not chunk or HEADER_RE.match(chunk):
            continue
        if any(chunk.startswith(m) for m in PROPER_NOUN_MARKERS):
            continue

        head = ""
        for candidate in sorted(allowed, key=len, reverse=True):
            if chunk.lower().startswith(candidate):
                head = candidate
                break
        if not head:
            head_m = re.match(
                r"^([A-Za-z][A-Za-z0-9'.\-/()]*"
                r"(?:\s+(?:\([a-z ]+\)\s*)?"
                r"(?:[a-z]+|for|of|on|to|up|out|off|in|into|with|from|sb|sth|one's|the))+)",
                chunk,
                re.I,
            )
            if head_m:
                head = head_m.group(1).strip()
        if not head:
            continue
        if head.lower() not in allowed and head.split()[0].lower() not in allowed_first:
            continue
        # Drop chunks that still contain a second curriculum head (merge artifact)
        tail = chunk[len(head) :]
        if sum(1 for h in allowed if h != head.lower() and h in tail.lower()) > 1:
            continue
        parsed = parse_entry_text(chunk, head)
        if parsed:
            results.append((parsed["word"], chunk))

    return results


def extract_book(book: str) -> list[dict[str, str]]:
    pdf_path = PDF_DIR / BOOK_PDFS[book]
    doc = fitz.open(pdf_path)
    start, end = find_vocab_page_range(doc)
    year_band = BOOK_YEAR_BAND[book]
    label = BOOK_LABEL[book]

    rows: list[dict[str, str]] = []
    seen: set[str] = set()

    for page_idx in range(start, end + 1):
        page = doc[page_idx]
        spans = page_spans_ordered(page)
        for head, entry_text in split_entries_with_fonts(spans):
            parsed = parse_entry_text(entry_text, head)
            if not parsed:
                continue
            key = parsed["word"].strip().lower()
            if key in seen:
                continue
            seen.add(key)
            seq = len(rows) + 1
            word_id = f"sr-{book}-{seq:04d}"
            rows.append(
                {
                    "word_id": word_id,
                    "word": parsed["word"],
                    "pos": parsed["pos"],
                    "phonetic": parsed["phonetic"],
                    "meaning_cn": parsed["meaning_cn"],
                    "stage": "senior",
                    "year_band": str(year_band),
                    "volume": book,
                    "volume_label": label,
                    "source_type": "vocabulary",
                    "source_page": str(page_idx + 1),
                    "source_ref": parsed["source_ref"],
                    "confidence": "high",
                }
            )

    report = {
        "book": book,
        "pdf": BOOK_PDFS[book],
        "page_range_1based": [start + 1, end + 1],
        "row_count": len(rows),
    }
    report_path = OUT_DIR / f"senior_{book}_report.json"
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    out_csv = OUT_DIR / f"senior_{book}_clean.csv"
    fields = [
        "word_id",
        "word",
        "pos",
        "phonetic",
        "meaning_cn",
        "stage",
        "year_band",
        "volume",
        "volume_label",
        "source_type",
        "source_page",
        "source_ref",
        "confidence",
    ]
    with out_csv.open("w", encoding="utf-8", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)

    print(f"{book}: {len(rows)} words (pages {start + 1}-{end + 1}) -> {out_csv.name}")
    return rows


def load_exclude_words() -> set[str]:
    exclude: set[str] = set()

    primary_csv = OUT_DIR / "primary_ingest_ready.csv"
    if primary_csv.exists():
        with primary_csv.open(encoding="utf-8", newline="") as fh:
            for row in csv.DictReader(fh):
                w = row.get("word", "").strip().lower()
                if w:
                    exclude.add(w)
                    for part in re.split(r"[/／]", w):
                        p = part.strip()
                        if p:
                            exclude.add(p)

    junior_csv = OUT_DIR / "junior_merged.csv"
    if junior_csv.exists():
        with junior_csv.open(encoding="utf-8", newline="") as fh:
            for row in csv.DictReader(fh):
                w = row.get("word", "").strip().lower()
                if w:
                    exclude.add(w)
                    for part in re.split(r"[/／]", w):
                        p = part.strip()
                        if p:
                            exclude.add(p)

    return exclude


def word_keys(word: str) -> set[str]:
    w = word.strip().lower()
    keys = {w}
    for part in re.split(r"[/／]", w):
        p = part.strip()
        if p:
            keys.add(p)
    return keys


def merge_all() -> None:
    exclude = load_exclude_words()
    merged: list[dict[str, str]] = []
    global_seen: set[str] = set()
    stats = {"by_book": {}, "skipped_primary_junior": 0, "skipped_cross_book": 0}

    for book in ("B1", "B2", "B3"):
        path = OUT_DIR / f"senior_{book}_clean.csv"
        if not path.exists():
            raise SystemExit(f"Missing {path}; run --all first")
        book_added = 0
        with path.open(encoding="utf-8", newline="") as fh:
            for row in csv.DictReader(fh):
                keys = word_keys(row["word"])
                if keys & exclude:
                    stats["skipped_primary_junior"] += 1
                    continue
                norm = row["word"].strip().lower()
                if norm in global_seen:
                    stats["skipped_cross_book"] += 1
                    continue
                global_seen.add(norm)
                seq = len(merged) + 1
                row["word_id"] = f"sr-{book}-{seq:04d}"
                row["freq_rank"] = str(10000 + seq)
                row["gaokao_level"] = row["year_band"]
                merged.append(row)
                book_added += 1
        stats["by_book"][book] = book_added

    out = OUT_DIR / "senior_pep_ingest_ready.csv"
    fields = [
        "word_id",
        "word",
        "pos",
        "phonetic",
        "meaning_cn",
        "primary_gloss",
        "stage",
        "year_band",
        "gaokao_level",
        "freq_rank",
        "volume",
        "volume_label",
        "source_type",
        "source_page",
        "source_ref",
        "confidence",
    ]
    for row in merged:
        meaning = row["meaning_cn"]
        # Keep CJK-only gloss clauses (drop POS/English bleed from multi-line entries)
        cjk_parts = [
            p.strip(" ；;、")
            for p in re.findall(
                r"[\u4e00-\u9fff][\u4e00-\u9fff；、，,：:（）()《》·…]*", meaning
            )
            if p.strip() and not re.search(r"[a-zA-Z]{2}", p)
        ]
        if cjk_parts:
            meaning = "；".join(dict.fromkeys(cjk_parts))
            row["meaning_cn"] = meaning
        gloss = meaning.split("；")[0].split(";")[0].strip()
        row["primary_gloss"] = gloss or row["meaning_cn"]
        ph = row.get("phonetic", "")
        if ph and ("{" in ph or "Vocabulary" in ph or len(ph) > 60):
            row["phonetic"] = ""

    with out.open("w", encoding="utf-8", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=fields)
        w.writeheader()
        w.writerows(merged)

    report = {"total": len(merged), **stats}
    (OUT_DIR / "senior_pep_ingest_report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"Merged {len(merged)} rows -> {out.name}")
    print(json.dumps(stats, ensure_ascii=False, indent=2))


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: extract_senior_pep.py B1|B2|B3|--all|--merge")
        return 2
    arg = sys.argv[1]
    if arg == "--all":
        for book in BOOK_PDFS:
            extract_book(book)
        merge_all()
        return 0
    if arg == "--merge":
        merge_all()
        return 0
    if arg not in BOOK_PDFS:
        print(f"Unknown book {arg!r}; choose from {list(BOOK_PDFS)}")
        return 2
    extract_book(arg)
    return 0


if __name__ == "__main__":
    sys.exit(main())
