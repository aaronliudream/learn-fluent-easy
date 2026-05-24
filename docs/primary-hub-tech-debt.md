# Primary Hub 技术债 / 遗留事项

与 Unit 扩展架构重构并行记录，避免遗忘。

## 测试

### `slangLocalization.test.tsx`（10 失败）

- **现象**：`supabase.auth.getSession` 未 mock → `TypeError: Cannot read properties of undefined`
- **范围**：`src/i18n/__tests__/slangLocalization.test.tsx`
- **与架构重构关系**：无关（任务 1–3 未改动 i18n）
- **处理时机**：全部架构任务完成后单独开修

## Registry 命名

（`unit1_read_write_simplified.json` 已于任务 6 重命名为 `g4v2_u1_read_write.json`。）

## ReadWrite 插图

见 [add-readwrite-question.md](./add-readwrite-question.md) — `picture_choice` 三路径：`visual`（主路径）/ `image`（escape hatch）/ `fill_choice`（无图）；与 [add-new-unit.md](./add-new-unit.md) §4.3 一致。

## 生成脚本

见 [primary-hub-generate-script-risks.md](./primary-hub-generate-script-risks.md)（计划任务 8）。

## Phonics UI（任务 4b，待办）

任务 4 仅完成类型层 + `matchesRule` 字段重命名；**未**泛化 UI。

- `highlightEr` → `highlightPattern(word, rule)`
- 子页标题文案（如「认识 er 发音」）→ 按 `config.phonics_rule` 模板化
- 找词关说明文案同上
- **触发时机**：Unit 2 拼读内容（如 ir 等）上线前
- **影响范围**：`PrimaryHubPhonics.tsx`、相关 ListenStage 标题等

## ReadWrite visual key 可配置化（任务 9，暂编号 / 未排期）

- **现状**：`ReadWritePictureVisual.tsx` 内置 5 个 `visual` key（u1 专用 SVG）。新 Unit 无法在不改 TS 的情况下新增 key，导致 u2–u6 实际常走 `image` 或 `fill_choice`，而非 `visual` 主路径。
- **触发条件**：Unit 2–6 上线后，如果发现 `image` 路径过重（资源体积、加载时延）或视觉风格分散（emoji 风 vs 写实图混杂），则启动本任务，让 `visual` key 也走 JSON 配置。
- **状态**：暂不排期；等 Unit 2–6 真实数据驱动设计。
