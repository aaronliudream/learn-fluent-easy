# Primary Hub 生成脚本风险备忘（待任务 8）

`scripts/generate_primary_hub_courses.py` 从 `docs/vocab/primary_*_clean.csv` 生成 `src/data/primaryHub/grade*.json`。

## 已知限制

- CSV 列：`book, unit, word, gloss, printed_page, pdf_page` — **无 `type` 列**。
- `pick_core_vocab()` 只输出 `{ en, cn, emoji }`，不会写入 `VocabItem.type` 或 `vocabGroups`。

## g4v2_u1 特殊路径

生成时若存在 `legacy_g4v2_u1.json`，则 `g4v2_u1` 整单元由 `strip_storybook(g4_u1)` 替换，**保留** legacy 中的 `vocabulary[].type`、`vocabGroups` 等富内容。

## 风险（暂不修复，架构任务完成后考虑任务 8）

1. **只改 `grade4.json`、未同步 `legacy_g4v2_u1.json`** → 下次跑脚本会被 legacy 覆盖。
2. **删除 legacy 合并或 legacy 中去掉 `type` / `vocabGroups`** → Unit 1 三 Tab 分组失效。
3. **新 Unit 期望从 CSV 自动生成多组词汇** → 需扩展脚本或手写 JSON；当前设计不支持。

## 关联

- 任务 2：`vocabGroups` 配置化（已完成）。
- 建议后续：**任务 8** — 生成脚本健壮性（legacy 同步校验、type 列或生成后断言等）。
