#!/usr/bin/env python3
"""Merge junior vocab CSVs and emit validation report (phase 1)."""
from __future__ import annotations

import csv
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VOCAB = ROOT / "docs" / "vocab"
EXPECTED_HEADER = [
    "word_id",
    "word",
    "pos",
    "meaning_cn",
    "stage",
    "grade",
    "volume",
    "unit",
    "source_type",
    "source_page",
    "confidence",
]
SOURCES = [
    VOCAB / "junior_7B_renjiao.csv",
    VOCAB / "junior_8B_renjiao.csv",
    VOCAB / "junior_7A_8A_9_textlayer.csv",
]
MERGED = VOCAB / "junior_merged.csv"
REPORT = VOCAB / "junior_merge_report.md"


def main() -> None:
    rows: list[list[str]] = []
    source_counts: dict[str, int] = {}

    for path in SOURCES:
        if not path.exists():
            raise SystemExit(f"MISSING: {path}")
        with path.open(encoding="utf-8-sig", newline="") as fh:
            reader = csv.reader(fh)
            header = next(reader)
            if header != EXPECTED_HEADER:
                raise SystemExit(
                    f"Header mismatch in {path.name}:\n  got:  {header}\n  exp:  {EXPECTED_HEADER}"
                )
            file_rows = list(reader)
            source_counts[path.name] = len(file_rows)
            rows.extend(file_rows)

    # Write merged CSV
    with MERGED.open("w", encoding="utf-8", newline="") as out:
        writer = csv.writer(out)
        writer.writerow(EXPECTED_HEADER)
        writer.writerows(rows)

    # Validation
    bad_col_count: list[tuple[int, list[str]]] = []
    bad_stage: list[tuple[int, list[str]]] = []
    by_volume: Counter[str] = Counter()
    by_volume_unit: defaultdict[str, Counter[str]] = defaultdict(Counter)
    source_type_dist: Counter[str] = Counter()
    low_confidence: list[list[str]] = []
    word_id_rows: defaultdict[str, list[int]] = defaultdict(list)

    for i, row in enumerate(rows, start=2):
        if len(row) != 11:
            bad_col_count.append((i, row))
            continue
        (
            word_id,
            _word,
            _pos,
            _meaning,
            stage,
            _grade,
            volume,
            unit,
            source_type,
            _page,
            confidence,
        ) = row
        if stage != "junior":
            bad_stage.append((i, row))
        by_volume[volume] += 1
        by_volume_unit[volume][unit] += 1
        source_type_dist[source_type] += 1
        if confidence == "low":
            low_confidence.append(row)
        word_id_rows[word_id].append(i)

    duplicates = {wid: lines for wid, lines in word_id_rows.items() if len(lines) > 1}

    lines: list[str] = []
    lines.append("# Junior vocab merge report\n")
    lines.append("## Source files\n")
    for name, count in source_counts.items():
        lines.append(f"- `{name}`: **{count}** rows")
    lines.append(f"\n**Merged total: {len(rows)}** → `junior_merged.csv`\n")

    lines.append("## Count by volume\n")
    lines.append("| volume | count |")
    lines.append("|--------|------:|")
    for vol in ["7A", "7B", "8A", "8B", "9"]:
        lines.append(f"| {vol} | {by_volume.get(vol, 0)} |")
    other_vols = sorted(set(by_volume) - {"7A", "7B", "8A", "8B", "9"})
    for vol in other_vols:
        lines.append(f"| {vol} (unexpected) | {by_volume[vol]} |")

    lines.append("\n## Count by volume × unit\n")
    for vol in ["7A", "7B", "8A", "8B", "9"]:
        if vol not in by_volume_unit:
            continue
        lines.append(f"\n### {vol}\n")
        lines.append("| unit | count |")
        lines.append("|------|------:|")
        for unit in sorted(by_volume_unit[vol], key=lambda u: (len(u), u)):
            lines.append(f"| {unit} | {by_volume_unit[vol][unit]} |")

    lines.append("\n## word_id uniqueness\n")
    if duplicates:
        lines.append(f"**FAIL — {len(duplicates)} duplicate word_id(s):**\n")
        for wid, line_nums in sorted(duplicates.items()):
            lines.append(f"- `{wid}`: rows {line_nums}")
    else:
        lines.append("**PASS** — all word_id values are globally unique.\n")

    lines.append("\n## source_type distribution\n")
    lines.append("| source_type | count |")
    lines.append("|-------------|------:|")
    for st, cnt in source_type_dist.most_common():
        lines.append(f"| {st} | {cnt} |")
    allowed = {"wordlist", "recognize", "text_only"}
    unexpected_st = set(source_type_dist) - allowed
    if unexpected_st:
        lines.append(f"\n**WARNING** — unexpected source_type values: {sorted(unexpected_st)}")
    else:
        lines.append("\nAll values are within expected set: wordlist / recognize / text_only.")

    lines.append(f"\n## confidence=low ({len(low_confidence)} entries)\n")
    if low_confidence:
        lines.append("| word_id | word | volume | unit | source_type |")
        lines.append("|---------|------|--------|------|-------------|")
        for row in low_confidence:
            lines.append(
                f"| {row[0]} | {row[1]} | {row[6]} | {row[7]} | {row[8]} |"
            )
    else:
        lines.append("(none)")

    lines.append("\n## Field integrity\n")
    lines.append(f"- Rows with column count ≠ 11: **{len(bad_col_count)}**")
    if bad_col_count:
        for line_no, row in bad_col_count[:20]:
            lines.append(f"  - row {line_no}: {len(row)} cols — `{row[:3]}...`")
        if len(bad_col_count) > 20:
            lines.append(f"  - … and {len(bad_col_count) - 20} more")
    lines.append(f"- Rows with stage ≠ junior: **{len(bad_stage)}**")
    if bad_stage:
        for line_no, row in bad_stage[:20]:
            lines.append(f"  - row {line_no}: stage=`{row[4]}` word_id=`{row[0]}`")

    REPORT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {MERGED} ({len(rows)} rows)")
    print(f"Wrote {REPORT}")
    if duplicates:
        raise SystemExit(f"STOP: {len(duplicates)} duplicate word_id(s) — see report")


if __name__ == "__main__":
    main()
