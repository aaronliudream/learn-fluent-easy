# Primary Hub 技术债 / 遗留事项

与 Unit 扩展架构重构并行记录，避免遗忘。

## 测试

### `slangLocalization.test.tsx`（10 失败）

- **现象**：`supabase.auth.getSession` 未 mock → `TypeError: Cannot read properties of undefined`
- **范围**：`src/i18n/__tests__/slangLocalization.test.tsx`
- **与架构重构关系**：无关（任务 1–3 未改动 i18n）
- **处理时机**：全部架构任务完成后单独开修

## Registry 命名

### `unit1_read_write_simplified.json`

- **建议**：内容定稿后重命名为 `g4v2_u1_read_write.json`（符合任务 1 `registryDiscovery` 文件名规范）
- **现状**：DEV 下 registry 会 `console.warn` 提示，功能仍可用

## 生成脚本

见 [primary-hub-generate-script-risks.md](./primary-hub-generate-script-risks.md)（计划任务 8）。
