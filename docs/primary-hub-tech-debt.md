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

## Junior / Gaokao Hub 进度云端同步（待办）

- **现状**（2026-05）：Primary Hub G3–G6 已接入 `primary_hub_progress` 表 + `hubCloudSync.ts`。
- **Junior Hub** / **Gaokao Hub** 仍为 `localStorage` only（`juniorHub:{grade}` 等），登录后无跨设备同步。
- **处理时机**：Primary Hub 云端同步在生产验证稳定后再做。

## Primary Hub 云同步 hotfix（2026-05-24）

- **脏数据**：自测 smoke 脚本 + 游客账号进度曾写入 production `primary_hub_progress`；已 DELETE 清理（仅 `@test.bigmoon.local` / 自测 guest）。
- **空壳 unit 污染**：`getUnitState()` 在 render 时突变 state，浏览学期页会把 12 个空 unit 写入 localStorage 并触发 cloud upsert；已改为 `readUnitState()`（只读）+ `stripEmptyUnits()` + `hasUnitActivity()` 守门。
- **首次 push 条件**：由 `Object.keys(units).length > 0` 改为 `hasUnitActivity()`。

## Streak RPC 400（tech debt）

- 新账号 console 可能出现 `get_user_streak_stats` 400 / `streak rpc error`；与 Primary Hub 进度无关，`useStreakStats` 已 catch 并置 null。

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
