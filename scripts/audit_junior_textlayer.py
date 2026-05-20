#!/usr/bin/env python3
"""Quality audit for junior 7A/8A/9 text-layer vocab CSV."""
from __future__ import annotations

import csv
import re
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "docs" / "vocab" / "junior_7A_8A_9_textlayer.csv"
OUT = ROOT / "docs" / "vocab" / "junior_textlayer_audit_report.md"

ISSUE_PATTERNS = {
    "ipa_junk": re.compile(r"/[^/\n]{1,80}/|/\{|\\"),
    "page_in_meaning": re.compile(r"\bp\.?\s*S?\d", re.I),
    "english_in_meaning": re.compile(r"\b[A-Za-z]{4,}\b"),
    "empty_pos_long_word": None,
    "short_meaning": None,
    "generic_source_page": re.compile(r"^(117|132|170)$"),
}


def main() -> None:
    rows = list(csv.DictReader(SRC.open(encoding="utf-8-sig", newline="")))
    by_vol: Counter[str] = Counter()
    by_unit: defaultdict[str, Counter[str]] = defaultdict(Counter)
    issues: defaultdict[str, list[dict[str, str]]] = defaultdict(list)

    for row in rows:
        vol = row["volume"]
        by_vol[vol] += 1
        by_unit[vol][row["unit"]] += 1
        m = row["meaning_cn"] or ""
        w = row["word"] or ""

        if ISSUE_PATTERNS["ipa_junk"].search(m):
            issues["ipa_junk"].append(row)
        if ISSUE_PATTERNS["page_in_meaning"].search(m):
            issues["page_in_meaning"].append(row)
        if ISSUE_PATTERNS["english_in_meaning"].search(m):
            issues["english_in_meaning"].append(row)
        if not row["pos"] and len(w) > 12:
            issues["empty_pos_long_word"].append(row)
        if len(m) < 2:
            issues["short_meaning"].append(row)
        if ISSUE_PATTERNS["generic_source_page"].match(row.get("source_page", "")):
            issues["generic_source_page"].append(row)

    lines = [
        "# Junior text-layer quality audit",
        "",
        f"- **File**: `{SRC.name}`",
        f"- **Rows**: {len(rows)}",
        "",
        "## Count by volume",
        "",
        "| volume | count |",
        "|--------|------:|",
    ]
    for vol in ["7A", "8A", "9"]:
        lines.append(f"| {vol} | {by_vol.get(vol, 0)} |")

    lines.append("\n## Issue summary\n")
    lines.append("| issue | count |")
    lines.append("|-------|------:|")
    for key in [
        "ipa_junk",
        "page_in_meaning",
        "english_in_meaning",
        "empty_pos_long_word",
        "short_meaning",
        "generic_source_page",
    ]:
        lines.append(f"| {key} | {len(issues[key])} |")

    lines.append("\n## Samples (up to 15 per issue)\n")
    for key, items in issues.items():
        if not items:
            continue
        lines.append(f"\n### {key}\n")
        lines.append("| word_id | word | meaning_cn |")
        lines.append("|---------|------|------------|")
        for row in items[:15]:
            meaning = (row["meaning_cn"] or "")[:50].replace("|", "/")
            lines.append(f"| {row['word_id']} | {row['word']} | {meaning} |")

    lines.append(
        "\n## Manual review checklist\n"
        "\n- [ ] Compare 7A unit counts against 人教版 7A Appendix\n"
        "- [ ] Spot-check 8A/9 multi-sense entries (semicolon glosses)\n"
        "- [ ] Replace generic `source_page` with textbook page refs when PDFs re-processed\n"
    )

    OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {OUT}")
    for key, items in issues.items():
        print(f"  {key}: {len(items)}")


if __name__ == "__main__":
    main()
