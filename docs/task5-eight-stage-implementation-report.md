# 任务 5 实施汇报：统一 8 阶段模板

> 状态：**待浏览器验收**  
> 实施日期：2026-05-24

---

## 1. 决策与理由

| 决策点 | 最终选择 | 理由 |
|--------|----------|------|
| **A 占位呈现** | 可点击 + 列表 🚧/虚线样式 + 友好占位页 | 符合数据驱动；复用已有 `readWrite` 分支；占位不计进度，不误导完成度 |
| **A 标题** | 仍为「读写训练」，角标「即将上线」 | 与 u1 结构一致；副标题 JSON：`即将上线 · 看图写句` |
| **A 进度条** | 占位关 **不显示** 条内进度 | 避免 0% 像坏掉 |
| **B 数据** | **grade4.json** 为 u2–u6 插入 s7 readWrite、s8 finalQuiz | 内容数据化；生成脚本 `DEFAULT_STAGES` 同步 8 关 |
| **B 占位标记** | **不**加 JSON 字段；`readWrite` 且无 registry JSON = 占位 | 上线 JSON 后自动可玩，零配置切换 |
| **C 完成度** | 可完成关分母 → u2 做完 7 关 = **100%** | 进度诚实，不卡在 87.5% |
| **C 头部文案** | `已完成 a/b`（b=可完成数）+ `· 共 8 关`（有占位时） | 兼顾成就感与 8 关结构可见 |
| **C 星星** | 仅完成可完成关获得；u2 上限仍 7 颗 | 与现网一致，readWrite 上线后自然变 8 |
| **D 占位页** | 🚧 +「读写训练内容准备中」+ 说明 +「返回单元」 | 非空白、非报错、可退出 |
| **进度迁移** | `loadPersist` 时 u2–u6：旧 idx6(finalQuiz) → idx7 | 避免老用户最后一关进度丢失 |

---

## 2. 改动文件

| 文件 | 变更 |
|------|------|
| `src/data/primaryHub/grade4.json` | g4v2_u2–u6：8 stages（s7 readWrite 占位，s8 finalQuiz） |
| `scripts/generate_primary_hub_courses.py` | `DEFAULT_STAGES` 8 关模板 |
| `src/lib/primaryHub/stageCompletable.ts` | **新建** `isStageCompletable` / `isReadWriteComingSoon` |
| `src/lib/primaryHub/stageProgressMigrate.ts` | **新建** 8 关布局迁移 |
| `src/lib/primaryHub/progress.ts` | 按可完成关计算 percent/total；`stageCount` |
| `src/lib/primaryHub/storage.ts` | `loadPersist` 调用迁移 |
| `src/lib/primaryHub/context.tsx` | 单元完成判定用可完成关 |
| `src/pages/primaryHub/PrimaryHubUnit.tsx` | 占位视觉 + 头部「共 N 关」 |
| `src/pages/primaryHub/PrimaryHubStagePlay.tsx` | 加强 readWrite 占位 UI |
| `src/lib/primaryHub/progress.test.ts` | **新建** 进度与迁移测试 |
| `docs/primary-hub-tech-debt.md` | （无新增，任务 4b 已记录） |

**未改**：u1 readWrite 玩法、registry、任务 4b UI（`highlightEr` 等）。

---

## 3. 测试结果

| 命令 | 结果 |
|------|------|
| `npm run build` | ✅ 通过 |
| `npm test -- src/lib/primaryHub/` | ✅ **31/31**（含 progress 4 + 既有 27） |
| `npm test` 全量 | 37 通过 / 10 失败（`slangLocalization` supabase mock，已知债） |

---

## 4. 浏览器验证清单

### 重点（u2）

- [ ] **u2 单元页**：列表 **8 关**；第 7 项「读写训练」有 🚧 / 虚线 /「即将上线」
- [ ] 头部：`0/7`（或进行中 `n/7`）+ **`· 共 8 关`**
- [ ] 点击第 7 关 → 占位页（准备中 + 返回），**无报错、非空白**
- [ ] 第 8 关「最终通关」仍可正常进入游玩
- [ ] 完成前 7 个可玩关后，完成度 **100%**（非 87%）

### 回归（u1）

- [ ] **u1** 仍 8 关；读写训练（s7）**正常内容**，非占位
- [ ] u1 完成度 / 星星与改前一致

### 其他

- [ ] u3–u6 同 u2 结构（抽测 1 个即可）
- [ ] Console 无新增 error

---

## 5. Tech debt

无新增（任务 4b Phonics UI、readWrite 重命名、slang 测试仍为既有项）。
