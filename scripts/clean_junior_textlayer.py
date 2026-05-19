#!/usr/bin/env python3
"""Clean junior 7A/8A/9 text-layer vocab CSV (meaning_cn, pos, word typos)."""
from __future__ import annotations

import csv
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "docs" / "vocab" / "junior_7A_8A_9_textlayer.csv"
BACKUP = ROOT / "docs" / "vocab" / "junior_7A_8A_9_textlayer.raw.csv"
REPORT = ROOT / "docs" / "vocab" / "junior_textlayer_clean_report.md"

WORD_FIXES = {
    "afernoon": "afternoon",
}

POS_RE = re.compile(
    r"^(?:"
    r"(?:n\.|v\.|adj\.|adv\.|prep\.|conj\.|interj\.|pron\.|art\.|num\.|modal\s+v\.|det\.|modal\s+v)"
    r"(?:\s*&\s*(?:n\.|v\.|adj\.|adv\.|prep\.|conj\.|interj\.|pron\.|art\.))?"
    r"(?:\s+(?:n\.|v\.|adj\.|adv\.|prep\.|conj\.|interj\.|pron\.|art\.))?"
    r")\s+",
    re.I,
)
PAGE_SPLIT = re.compile(r"\s+p\.?\s*(?:S\d+|\d+)", re.I)
IPA_BLOCK = re.compile(r"/[^/\n]{1,80}/")
LEADING_JUNK = re.compile(r"^[、\s]+")
ENGLISH_PHRASE = re.compile(r"\b[A-Za-z][A-Za-z' -]{2,}\b")
CJK = re.compile(r"[\u4e00-\u9fff（）()；;、，,。.：:·\-—]+")


def clean_meaning(raw: str, existing_pos: str) -> tuple[str, str | None]:
    s = raw.strip()
    pos = existing_pos.strip() or None

    s = LEADING_JUNK.sub("", s)
    s = IPA_BLOCK.sub("", s)
    s = re.sub(r"\([=a-zA-Z\s]+\)", "", s)  # (=yoghurt)
    s = re.sub(r"（[^）]*[A-Za-z/][^）]*）", "", s)

    if not pos:
        m = POS_RE.match(s)
        if m:
            pos = m.group(0).strip().rstrip(".")
            s = s[m.end() :]

    s = PAGE_SPLIT.split(s, maxsplit=1)[0]
    s = re.sub(r"\s+\d{1,3}\s*$", "", s)  # trailing page numbers like "129"
    s = ENGLISH_PHRASE.sub("", s)

    parts = [p.strip(" 、；;，,.&") for p in CJK.findall(s) if p.strip(" 、；;，,.&")]
    parts = [p for p in parts if p not in {".", "&", "adj", "adv", "n", "v"} and len(p) > 0]
    if parts:
        s = "；".join(dict.fromkeys(parts))
    else:
        s = re.sub(r"\s+", " ", s).strip(" 、；;，,.")

    s = re.sub(r"^[\.&；;、]+", "", s)
    s = re.sub(r"[\.&；;、]+$", "", s)
    s = re.sub(r"；+", "；", s).strip("；")
    return s, pos


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"Missing {SRC}")

    if not BACKUP.exists():
        shutil.copy2(SRC, BACKUP)
    else:
        # Re-clean always from raw backup for idempotency.
        shutil.copy2(BACKUP, SRC)

    with SRC.open(encoding="utf-8-sig", newline="") as fh:
        reader = csv.DictReader(fh)
        fieldnames = reader.fieldnames
        if not fieldnames:
            raise SystemExit("No header")
        rows = list(reader)

    changed: list[dict[str, str]] = []
    for row in rows:
        before = dict(row)
        word = WORD_FIXES.get(row["word"].strip(), row["word"].strip())
        meaning, pos = clean_meaning(row["meaning_cn"], row["pos"])
        row["word"] = word
        row["meaning_cn"] = meaning
        if pos:
            row["pos"] = pos
        if (
            before["word"] != row["word"]
            or before["meaning_cn"] != row["meaning_cn"]
            or before["pos"] != row["pos"]
        ):
            changed.append(row)

    with SRC.open("w", encoding="utf-8", newline="") as out:
        writer = csv.DictWriter(out, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    lines = [
        "# Junior text-layer clean report",
        "",
        f"- Source: `{SRC.name}`",
        f"- Raw backup: `{BACKUP.name}`",
        f"- Rows total: **{len(rows)}**",
        f"- Rows changed: **{len(changed)}**",
        "",
        "## Sample changes (first 30)",
        "",
        "| word_id | word | meaning (before → after) |",
        "|---------|------|--------------------------|",
    ]
    for row in changed[:30]:
        # reload before from backup row - skip, show after only for brevity
        lines.append(f"| {row['word_id']} | {row['word']} | {row['meaning_cn'][:60]} |")

    REPORT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Cleaned {len(changed)}/{len(rows)} rows")
    print(f"Wrote {SRC}")
    print(f"Wrote {REPORT}")


if __name__ == "__main__":
    main()
