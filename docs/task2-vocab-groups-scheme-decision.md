# 任务 2 方案决策汇报（仅分析，未改代码）

## 1. 现状梳理

### 硬编码逻辑（`vocabGroupsRegistry.ts`）

- 仅当 `unitId === "g4v2_u1"` 且 `vocabulary.length >= 19` 时返回 3 组
- 分组与 UI 文案：

| 组 | `label`（Tab） | `header`（副标题） | 词数 | 特殊 |
|----|----------------|-------------------|------|------|
| 1 | 学校场所 | 学校场所 · 8 个词 | slice(0,8) | — |
| 2 | 日常用词 | 日常用词 · 5 个词 | slice(8,13) | — |
| 3 | 拼读词 | 拼读词 · 6 个词 | slice(13,19) | `showPhonicsRule: true` |

### 调用方（`PrimaryHubStagePlay.tsx`）

- `getVocabGroups(unitId, vocabulary)` → 有分组则显示 Tab + header；无则单组
- `VocabGroupDef.id` 为数字 `1 | 2 | 3`（与自然拼读 Tab `4` 配合）
- 进度用 `offset + localIdx` 作为全局索引，**组内顺序必须与 `vocabulary` 数组一致**

### Unit 1 的 `type` 字段审计（`grade4.json` · g4v2_u1）

| 指标 | 结果 |
|------|------|
| 总词数 | 19 |
| 有 `type` | **19 / 19（100%）** |
| 分布 | `core` × 8 → `extended` × 5 → `phonics` × 6 |
| 与 slice 对齐 | **完全一致**（按数组顺序，三类连续排列） |

### u2–u6 的 `type` 字段

| Unit | 词数 | 有 `type` |
|------|------|-----------|
| g4v2_u2 … g4v2_u6 | 各 8 | **0 / 8（全无）** |

生成脚本 `generate_primary_hub_courses.py` **不会**自动写入 `VocabItem.type`，只有 legacy 富内容单元（u1）有。

### `VocabItem.type` 类型现状

已是字面量联合，不是任意 `string`：

```typescript
type?: "core" | "extended" | "phonics";
```

---

## 2. 方案对比

| 维度 | 方案 A（`indices`） | 方案 B（`type` 匹配） |
|------|---------------------|----------------------|
| Unit 1 复现 8+5+6 | 精确，但与顺序强绑定 | 精确（type 100% 且顺序对齐） |
| 词表重排后 | 索引易错位 | 同 type 内可重排，分组仍正确 |
| u2–u6 现状 | 不依赖 type，可用 | 要分组必须先补 type |
| 语义分组 | 任意组合 | 限于 core / extended / phonics |
| 与现有数据模型 | 独立字段 | 复用已有 `type` |
| 配置复杂度 | 19 个索引需维护 | 3 行 type 规则 + 显示名 |

### 方案 B 的局限

- 无法表达「把 core 拆成两个主题组」（如「学校场所」vs「其他 core」）——当前 u1 的 Tab 名是**主题名**，不是 type 名
- 未来 u2–u6 若要分组，需先给词打 `type`

### 混合方案是否必要？

| 场景 | 建议 |
|------|------|
| PEP 标准三分（core / extended / phonics） | 方案 B 足够 |
| 同一 type 内再拆 Tab | 需要 `indices` 或第二维度字段 |

**结论：主用方案 B，配置里预留可选 `indices` 作为 escape hatch**（实现时 `type` 与 `indices` 二选一，不必两套并行主路径）。

---

## 3. 推荐方案：**方案 B（主）+ 可选 `indices`（备）**

### 理由

1. **Unit 1 已 100% 有 type**，且与 8+5+6 硬编码一一对应，迁移风险最低。
2. **词表顺序无关性更好**：CSV/脚本重排时，只要 type 正确，分组仍稳定；方案 A 在重生成时容易 silent break。
3. **与课程语义一致**：PEP 词表本身就有 core / extended / phonics 分层，type 是「源数据」而非「UI 索引」。
4. **u2–u6 不受影响**：无 `vocabGroups` → 单组 fallback；将来要分组时，补 type + 配置即可，符合「数据驱动、零改 TS」目标。
5. **可选 `indices`** 只留给非标准切分，不增加 u1 迁移成本。

### 不建议纯方案 A 的原因

- u1 已有完整 type，用 indices 是重复维护
- `generate_primary_hub_courses.py` 重跑 grade4.json 时，indices 比 type 更容易静默错位

---

## 4. 建议的配置 Schema（待确认后实现）

```typescript
export type VocabWordType = "core" | "extended" | "phonics";

export type VocabGroupConfig = {
  id: string;              // "places" | "daily" | "phonics"
  name: string;            // Tab 文案："学校场所"
  header?: string;         // 副标题；缺省则 "{name} · {count} 个词"
  match?: { type: VocabWordType };   // 方案 B（主）
  indices?: number[];      // 方案 A / escape hatch（与 match 二选一）
  showPhonicsRule?: boolean;
};

// UnitDef 增加：
vocabGroups?: VocabGroupConfig[];
```

**Unit 1 拟用配置（方案 B）：**

```json
"vocabGroups": [
  { "id": "places", "name": "学校场所", "header": "学校场所 · 8 个词", "match": { "type": "core" } },
  { "id": "daily", "name": "日常用词", "header": "日常用词 · 5 个词", "match": { "type": "extended" } },
  { "id": "phonics", "name": "拼读词", "header": "拼读词 · 6 个词", "match": { "type": "phonics" }, "showPhonicsRule": true }
]
```

**u1 无需改 19 个词的 type**（已齐全）。

---

## 5. 实现时注意点（确认后动手）

| 项 | 说明 |
|----|------|
| 接口签名 | 当前是 `getVocabGroups(unitId, vocabulary)`；任务书写的是 `UnitDef`。建议改为 `getVocabGroups(unit: Pick<UnitDef, "vocabulary" \| "vocabGroups">)`，并更新 `PrimaryHubStagePlay` 一处调用 |
| `VocabGroupDef.id` | 保持运行时数字 `1 \| 2 \| 3`（兼容拼读 Tab `4`）；配置里 `id` 用 string |
| 组内顺序 | 按 `vocabulary` 数组顺序 filter，保证与现 hardcode 一致 |
| Fallback | 无 `vocabGroups` → 返回 `null`（调用方继续用全量 `vocabulary` 单组） |
| Dev 校验 | 有 `vocabGroups` 但词缺 type / 未被任何组覆盖 → dev 警告 |

---

## 6. 待确认

请确认是否采用：

> **方案 B（`match.type`）为主 + 可选 `indices` 备用**

确认后将实现任务 2（types、registry、grade4.json、单元测试、build），并停下等待浏览器验证「认识单词」三 Tab。

---

*生成时间：2026-05-24*
