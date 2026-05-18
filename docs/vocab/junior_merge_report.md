# Junior vocab merge report

## Source files

- `junior_7B_renjiao.csv`: **521** rows
- `junior_8B_renjiao.csv`: **492** rows
- `junior_7A_8A_9_textlayer.csv`: **1360** rows

**Merged total: 2373** → `junior_merged.csv`

## Count by volume

| volume | count |
|--------|------:|
| 7A | 397 |
| 7B | 521 |
| 8A | 402 |
| 8B | 492 |
| 9 | 561 |

## Count by volume × unit


### 7A

| unit | count |
|------|------:|
| U1 | 47 |
| U2 | 37 |
| U3 | 42 |
| U4 | 28 |
| U5 | 40 |
| U6 | 37 |
| U7 | 36 |
| U8 | 36 |
| U9 | 28 |
| SU1 | 25 |
| SU2 | 21 |
| SU3 | 20 |

### 7B

| unit | count |
|------|------:|
| U1 | 42 |
| U2 | 46 |
| U3 | 44 |
| U4 | 45 |
| U5 | 46 |
| U6 | 38 |
| U7 | 45 |
| U8 | 42 |
| U9 | 43 |
| U10 | 29 |
| U11 | 55 |
| U12 | 46 |

### 8A

| unit | count |
|------|------:|
| U1 | 49 |
| U2 | 38 |
| U3 | 39 |
| U4 | 41 |
| U5 | 41 |
| U6 | 39 |
| U7 | 41 |
| U8 | 41 |
| U9 | 36 |
| U10 | 37 |

### 8B

| unit | count |
|------|------:|
| U1 | 68 |
| U2 | 56 |
| U3 | 38 |
| U4 | 47 |
| U5 | 48 |
| U6 | 53 |
| U7 | 68 |
| U8 | 44 |
| U9 | 41 |
| U10 | 29 |

### 9

| unit | count |
|------|------:|
| U1 | 36 |
| U2 | 43 |
| U3 | 38 |
| U4 | 39 |
| U5 | 51 |
| U6 | 54 |
| U7 | 26 |
| U8 | 46 |
| U9 | 38 |
| U10 | 43 |
| U11 | 36 |
| U12 | 39 |
| U13 | 38 |
| U14 | 34 |

## word_id uniqueness

**PASS** — all word_id values are globally unique.


## source_type distribution

| source_type | count |
|-------------|------:|
| wordlist | 2292 |
| recognize | 81 |

All values are within expected set: wordlist / recognize / text_only.

## confidence=low (1 entries)

| word_id | word | volume | unit | source_type |
|---------|------|--------|------|-------------|
| jr-7A-SU2-0001 | a | 7A | SU2 | wordlist |

## Field integrity

- Rows with column count ≠ 11: **0**
- Rows with stage ≠ junior: **0**
