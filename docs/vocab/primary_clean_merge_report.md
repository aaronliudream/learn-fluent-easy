# Primary Vocabulary Merge Report

Extracted from **Appendix 1 ('Words in each unit')** of all 8 books.

> **Unit attribution**: unit labels are read **directly from the section
> headers printed in the textbook** — no page-number reverse lookup.
> This guarantees 100 % accurate unit assignment at every section boundary.

## Summary

| Item | Value |
|---|---|
| Total words | 846 |
| Unique word_ids | 846 |
| word_id uniqueness | ✓ all unique |
| Expected range | 700–900 |
| Status | ✓ within range |
| unit source | Appendix 1 direct textbook labels |

## Volume Distribution

| Book | Words |
|---|---|
| 3A | 64 |
| 3B | 71 |
| 4A | 84 |
| 4B | 104 |
| 5A | 131 |
| 5B | 154 |
| 6A | 147 |
| 6B | 91 |

## unit=U? Entries

_None — all entries have a resolved unit._

## Post-extraction Fixes Applied

| # | Type | Details |
|---|---|---|
| 1 | Parser fix (root cause) | `split_entries_per_unit` now splits at **every** `p.NN` boundary; PDF blocks containing multiple entries on the same page no longer swallow subsequent words into the previous entry's gloss |
| 2 | Regression guard | Tails after the last `p.NN` in a block are only kept if they start with an English letter; cross-reference notations like `,28` (from `p.25,28` dual-page refs) are discarded rather than contaminating the next entry's word field |
| 3 | Swallowed word recovered | **hamburger** (5A Unit 3 p.25) — was embedded in `salad`'s gloss |
| 4 | Swallowed word recovered | **season** (5B Unit 2 p.15) — was embedded in `winter`'s gloss |
| 5 | Swallowed word recovered | **kitten** (5B Unit 4 p.43) — was embedded in `festival`'s gloss |
| 6 | Swallowed word recovered | **idea** (6A Unit 4 p.38) — was embedded in `jasmine`'s gloss |
| 7 | Swallowed word recovered | **easy** (6B Unit 4 p.34) — was embedded in `star`'s gloss |
| 8 | Gloss split (4B, manual) | **animal** gloss cleaned to `兽；动物`; **those** added as separate entry (4B Unit 4 p.41) |
| 9 | Empty gloss filled (5A) | **we'll = we will** → gloss `we will 的缩写形式` |
| 10 | Empty gloss filled (5A) | **aren't = are not** → gloss `are not 的缩写形式` |
| 11 | 4B source | 4B uses the manually-verified CSV (not re-extracted), with fix #8 applied directly |

## Field Completeness

| Field | Non-empty | Total |
|---|---|---|
| word | 846 | 846 |
| gloss | 846 | 846 |
| unit | 846 | 846 |
| printed_page | 846 | 846 |
| pdf_page | 846 | 846 |
