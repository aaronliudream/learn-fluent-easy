# 小学词表灌库前校验（primary_ingest_report）

- **来源**: `docs/vocab/primary_merged_clean.csv`
- **数据行数**: 846（预期 846）
- **word_id 唯一**: 是（846）

## 按 volume 分布

- 3A: 64
- 3B: 71
- 4A: 84
- 4B: 104
- 5A: 131
- 5B: 154
- 6A: 147
- 6B: 91

## 按 volume + unit 分布（共 46 个组合）

- 3A|Unit 1: 10
- 3A|Unit 2: 10
- 3A|Unit 3: 12
- 3A|Unit 4: 12
- 3A|Unit 5: 8
- 3A|Unit 6: 12
- 3B|Unit 1: 15
- 3B|Unit 2: 12
- 3B|Unit 3: 11
- 3B|Unit 4: 12
- 3B|Unit 5: 9
- 3B|Unit 6: 12
- 4A|Unit 1: 16
- 4A|Unit 2: 13
- 4A|Unit 3: 11
- 4A|Unit 4: 12
- 4A|Unit 5: 15
- 4A|Unit 6: 17
- 4B|Unit 1: 13
- 4B|Unit 2: 18
- 4B|Unit 3: 22
- 4B|Unit 4: 16
- 4B|Unit 5: 16
- 4B|Unit 6: 19
- 5A|Unit 1: 19
- 5A|Unit 2: 28
- 5A|Unit 3: 16
- 5A|Unit 4: 28
- 5A|Unit 5: 25
- 5A|Unit 6: 15
- 5B|Unit 1: 36
- 5B|Unit 2: 24
- 5B|Unit 3: 33
- 5B|Unit 4: 21
- 5B|Unit 5: 16
- 5B|Unit 6: 24
- 6A|Unit 1: 25
- 6A|Unit 2: 29
- 6A|Unit 3: 27
- 6A|Unit 4: 14
- 6A|Unit 5: 21
- 6A|Unit 6: 31
- 6B|Unit 1: 21
- 6B|Unit 2: 24
- 6B|Unit 3: 24
- 6B|Unit 4: 22

## 字段完整性

- word / meaning_cn / grade / volume / unit / source_type / source_page / confidence 均有值
- pos 留空（无来源）
- 释义中原含英文逗号 `,` 的行数: **0**（已替换为中文顿号 `、` 写入 meaning_cn）

## UUID v5

- 命名空间（与 migration 一致）: `c3bc49a6-5f2d-523e-a89e-0a9b8c7d6e5f`
- 名称: 业务键 `word_id`（如 W0001）

