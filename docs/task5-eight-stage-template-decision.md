# 任务 5 决策文档：统一 8 阶段模板（u2–u6 readWrite 占位）

> 状态：**已实施** — 见 [task5-eight-stage-implementation-report.md](./task5-eight-stage-implementation-report.md)  
> 前置：任务 4 已验收并提交  
> 目标：u2–u6 与 u1 一样显示 **8 个关卡**；readWrite 无 JSON 时为友好占位，且**不拖累进度/通关**

---

## 背景（现状）

| Unit | 关卡数 | s7 | s8 |
|------|--------|----|----|
| **g4v2_u1** | 8 | `readWrite`（有 registry JSON） | `finalQuiz` |
| **g4v2_u2 … u6** | 7 | `finalQuiz` | — |

影响：

- 单元页显示 `已完成 x/7` vs u1 的 `x/8`
- `generate_primary_hub_courses.py` 的 `DEFAULT_STAGES` 仍为 7 关（无 readWrite）
- 进度：`getUnitProgress()` 以 `unit.stages.length` 为分母（`progress.ts`）

**已有能力**：`PrimaryHubStagePlay` 在 `type === "readWrite"` 且无 registry 配置时，已渲染占位文案：

```text
读写训练内容即将上线
```

u2–u6 因 **没有 readWrite stage**，从未进入该分支。

---

## 决策 1：占位阶段如何呈现

### 方案对比

| 方案 | 单元列表 | 点击进入 | 进度分母 | 评价 |
|------|----------|----------|----------|------|
| **A** 可点 + 占位页 | 显示第 7 关 | 占位 UI（已有雏形） | 若计入 → 最高约 87.5% | 需配合决策 3 排除进度 |
| **B** 置灰不可点 | 显示 🔒 | 无/Toast | 若仍显示 8 关但不算分母 → 同 3 | 少一次「空点」 |
| **C** 不显示 | 仍 7 关 | — | 7 | 与目标矛盾 |

### 最终建议：**方案 A（可点击 + 友好占位页）+ 列表视觉提示**

理由：

1. **与 u1 结构一致**：用户能看到「读写训练」在第几关、图标/副标题对齐。
2. **复用现有路由与分支**：`readWrite` + `!getReadWriteConfig` → 占位，无需新 stage `type`。
3. **占位页可加强**（实施时）：标题、说明、返回按钮；**不提供「完成」**，避免误通关（当前占位块已无 `onFinish`，安全）。
4. **列表层加轻量提示**（`PrimaryHubUnit.tsx`）：副标题或角标 `即将上线`、略降透明度；**仍可点击**进入说明页（比 B 更透明，比纯 A 少「点了才发现」的落差）。

若你更反感「可点但无内容」，可改为 **A−**：列表可点，但点击时 Toast「读写训练内容准备中，敬请期待」且不导航——**不推荐**，与现有 Stage 路由不一致，且无法预览关卡名。

---

## 决策 2：数据层实现

### 方案 X：改 `grade4.json`（推荐）

对每个 `g4v2_u2` … `g4v2_u6` 的 `stages`：

1. 在 `listenSent`（s6）之后 **插入** 与 u1 同结构的 readWrite stage（`s7`）。
2. 原 `finalQuiz` 改为 **`s8`**（`id: "s8"`，`type: "finalQuiz"` 不变）。

u1 的 s7/s8 文案作模板，readWrite 副标题可统一为 `即将上线 · 看图写句` 或保持 u1 副标题 + 列表角标区分。

**同步** `scripts/generate_primary_hub_courses.py`：

- 将 `DEFAULT_STAGES` 扩展为 8 关（s7 readWrite、s8 finalQuiz），避免下次生成把 u2+ 打回 7 关。
- **不**改 u1 legacy 合并逻辑。

### 方案 Y：代码注入占位 stage

不推荐：违反「内容在 JSON」原则；`findUnit` 与测试数据不一致。

### 最终建议：**方案 X（数据驱动）**

---

## 决策 3：总进度、通关与星星

### 问题

若 8 关全计入分母，u2 完成 7 关可玩内容后：

`percent = (7×100 + 0) / 8 = 87.5%`，且 `completedStages.length === 8` 永远达不到 → **无法 100% / 无法触发单元完成**。

### 建议：**按「可完成关卡」动态分母（代码推导，无需 JSON 字段）**

```typescript
function isStageCompletable(
  unitId: string,
  stageIdx: number,
  stage: StageDef,
): boolean {
  if (stage.type === "readWrite" && !getReadWriteConfig(unitId, stageIdx)) {
    return false;
  }
  return true;
}
```

当某 Unit 补上 `readWrite` JSON 后，**同一 stage 自动变为可完成**，无需改 JSON 标志位。

### 使用位置

| 模块 | 行为 |
|------|------|
| `progress.ts` → `getUnitProgress` | `total` = 可完成关数；`percent` = 仅对可完成关求平均；`completed` = 已完成且可完成的关数 |
| `context.tsx` 单元首次完成 | `completedStages` 覆盖所有可完成关才算单元完成 |
| `PrimaryHubUnit.tsx` 头部统计 | 显示 `已完成 a/b`，其中 **b = 可完成关数**（u2 为 7，u1 为 8） |
| 关卡列表 | 仍 **渲染全部 8 条**；占位关显示「即将上线」样式，进度条可固定 0% 或隐藏 |

### 星星

- 星星仍来自 `completeStage` / 各 stage `addStar`。
- 占位 readWrite **不可完成** → 不增加星星；u2 满星仍为 **7 颗**（与现网一致），u1 为 **8 颗**。
- 上线 readWrite JSON 后，u2 自然变为最多 8 颗——符合预期。

### 用户可见文案（建议）

- 单元头：`5/7 已完成`（u2）+ 列表第 7 项「读写训练 · 即将上线」
- 完成度条：基于可完成关 → 全做完显示 **100%**
- 可选小字：`共 8 个学习环节，其中 1 个即将上线`（避免用户以为少了一关）

---

## 风险与迁移

### localStorage 关卡索引位移（u2–u6）

插入 readWrite 后，原 **stageIdx 6（finalQuiz）→ 7**。

| 影响 | 说明 |
|------|------|
| `completedStages` 含 `6` 的用户 | 旧 6 = finalQuiz；新 6 = readWrite 占位 → **需一次性迁移**或接受 DEV 清缓存 |
| `stageProgress[6]` | 同上 |

**建议（实施时）**：

- 在 `storage.ts` 或 hub 启动时做 **仅针对 g4v2_u2…u6** 的迁移：若 `completedStages` 含 6 且 unit 已有 8 stages、stage[6] 为 readWrite，则将 `6→7` 并合并 progress。
- 或文档说明「四年级下册 u2+ 进度索引变更，需重新玩最后一关」——产品可接受则做最小迁移。

请在确认时表态：**要自动迁移还是接受清进度说明**。

---

## 实施清单（确认后）

1. `grade4.json`：u2–u6 插入 readWrite s7、finalQuiz 改 s8（与 u1 对齐）。
2. `generate_primary_hub_courses.py`：`DEFAULT_STAGES` 8 关模板。
3. `progress.ts` + `context.tsx`：`isStageCompletable` 逻辑。
4. `PrimaryHubUnit.tsx`：8 关列表 + 占位关样式/角标。
5. `PrimaryHubStagePlay.tsx`：加强 readWrite 占位 UI（返回、说明，无完成按钮）。
6. 可选：`progress.test.ts` / 扩展 registry 无关的 unit 进度测试。
7. `npm run build`；`npm test -- src/lib/primaryHub/`；全量测试（slang 10 失败已知）。

---

## 浏览器回归清单（实施后）

- [ ] **u1**：仍为 8 关；readWrite 可正常玩；进度/星星与改前一致
- [ ] **u2**：列表 **8 关**；第 7 关为读写训练（即将上线）；第 8 关为最终通关
- [ ] 点击 u2 读写训练 → 友好占位，无报错，可返回
- [ ] u2 完成 7 关可玩内容后，单元完成度 **100%**（非 87%）
- [ ] u2 头部显示 `x/7` 已完成（或确认后的文案方案）
- [ ] Console 无新增 error

---

## 待确认项

| # | 决策 | 建议 |
|---|------|------|
| 1 | 占位呈现 | **A + 列表「即将上线」样式** |
| 2 | 数据 | **X：改 grade4.json + 生成脚本** |
| 3 | 进度/星星 | **可完成关分母**；占位不计入 |
| 4 | 进度迁移 | 请选：**自动迁移 finalQuiz 索引** vs **说明清缓存** |

确认后开始编码；完成后停下等你浏览器验证。

---

## 相关文档

- [primary-hub-g4v2-u1-analysis-report.md](./primary-hub-g4v2-u1-analysis-report.md)
- [primary-hub-tech-debt.md](./primary-hub-tech-debt.md)
