# 任务 4 决策文档：Phonics 类型泛化

> 状态：**已实施**（2026-05-24，浏览器验收通过）  
> 前置：任务 3 已验收并提交（`fef1ea57`）  
> 目标：提取通用 `PhonicsConfig` 类型，解除与 `G4v2U1PhonicsConfig` / Unit 1 的命名绑定

---

## 背景

| 现状 | 问题 |
|------|------|
| `g4v2_u1_er.ts` 导出 `G4V2_U1_PHONICS` + `G4v2U1PhonicsConfig = typeof …` | 类型名绑定 u1 |
| `phonicsRegistry.ts` 写 `export type PhonicsConfig = G4v2U1PhonicsConfig` | 全 Hub 拼读类型实为 u1 推断 |
| `PrimaryHubPhonics.tsx` 内 `highlightEr`、`has_er`、文案「er」 | **UI 仍绑定 er**（见下文范围说明） |

**本任务范围**：类型层 + registry + 数据文件类型注解 + 测试。  
**不在本任务**：把拼读 UI 全面改成任意 `phonics_rule`（建议任务 4b 或 Unit 2 内容上线时一起做）。

---

## 决策 1：类型命名与文件位置

### 建议结构（采纳你的方案，略作补充）

新建 **`src/lib/primaryHub/phonicsTypes.ts`**，集中导出：

```typescript
/** 听音关单词 */
export type PhonicsListenItem = {
  word: string;
  zh: string;
  emoji: string;
  audio: string; // filename under audioBase
};

/** 找词关 */
export type PhonicsFindItem = {
  word: string;
  matchesRule: boolean; // 是否含本单元 phonics_rule（原 has_er）
};

/** 填空关 */
export type PhonicsChallengeItem = {
  image: string;
  sentence: string;
  hint: string;
  options: string[];
  correct: number; // index into options
};

export type PhonicsConfig = {
  unitId: string;
  semesterId: string;
  title: string;
  phonics_rule: string;
  phonics_sound: string;
  rule_explanation: string;
  audioBase: string;
  stage_1_listen: PhonicsListenItem[];
  stage_2_find: PhonicsFindItem[];
  stage_3_challenge: PhonicsChallengeItem[];
};
```

### 引用关系

| 文件 | 改动 |
|------|------|
| `phonicsTypes.ts` | 类型唯一定义处 |
| `phonicsRegistry.ts` | `import type { PhonicsConfig, … } from "./phonicsTypes"`；**不再**从 `g4v2_u1_er` 导入类型 |
| `g4v2_u1_er.ts` | `satisfies PhonicsConfig` 或 `as const satisfies PhonicsConfig`；删除 `G4v2U1PhonicsConfig` |
| `PrimaryHubPhonics.tsx` 等 | `import type { PhonicsConfig } from "@/lib/primaryHub/phonicsTypes"`（或经 registry re-export，见下） |

### `phonicsRegistry` 是否 re-export 类型？

**建议**：registry **仅 re-export** `export type { PhonicsConfig, … } from "./phonicsTypes"`，保持现有 `from "@/lib/primaryHub/phonicsRegistry"` 的 import 路径可用，减少 diff。新代码优先从 `phonicsTypes` 导入亦可。

### 常量命名

- 保留 `G4V2_U1_PHONICS` 作为 **数据常量名**（与文件名 `g4v2_u1_er.ts` 一致）可接受；仅删除 **类型名** `G4v2U1PhonicsConfig`。
- 可选：重命名为 `G4V2_U1_PHONICS_CONFIG` — 非必须，本任务可不动。

---

## 决策 2：`phonics_rule` 严格度（A vs B）

### 教材与数据现状

**四年级下册 Unit 1（当前唯一实现）**

- 规则：`phonics_rule: "er"`，词尾轻声 /ə(r)/
- 词汇 `highlight` 与 `stage_2_find` 均围绕 **er**

**PEP 小学英语拼读（量级估计，非 exhaustive）**

| 类别 | 示例 | 粗估数量 |
|------|------|----------|
| R 控制元音 | ar, er, ir, or, ur | 5 |
| 元音组合 | ai, ay, ee, ea, oa, ow, oi, oy, ou, aw, au, … | 15–25 |
| 辅音组合 | ch, sh, th, ph, wh, ck, ng, … | 10–15 |
| 复杂/词缀 | tion, sion, le, magic-e 等 | 10+ |
| **合计（3–6 年级逐步引入）** | | **约 30–50+** |

课本附录随册增加，**不会**在立项时穷举完毕；且同一字母组合在不同册位可能有不同侧重的讲法。

### 方案对比

| | 方案 A：字面量联合 | 方案 B：`string` |
|--|-------------------|-----------------|
| 类型安全 | 拼写错误可编译期发现 | 仅靠 review / 测试 |
| 维护 | 每上新规则改联合类型 | 零成本 |
| 与 UI | 若未来做「按 rule 分支 UI」，联合类型有帮助 | UI 本就用 `config.phonics_rule` 动态化 |

### 最终建议

**采用方案 B：`phonics_rule: string`**

理由：

1. 与你倾向一致；规则种类多且持续增长。
2. 当前 UI 文案仍写死「er」（见范围说明），联合类型**暂时帮不上 UI**。
3. `isPhonicsConfig` 运行时校验已有 `typeof v.phonics_rule === "string"`，足够。

**可选增强（非必须）**：在 `phonicsTypes.ts` 用 JSDoc 注明「常见值：er, ir, or, ar, ur, …」，不写进 TS 联合。

---

## 决策 3：其他字段泛化与约束

### 3.1 `audioBase`

**现状**：`/audio/primary/phonics/g4v2_u1`（与 `public/audio/primary/phonics/g4v2_u1/` 目录一致）

**建议：任务 4 保持显式 `audioBase` 字段**

| 选项 | 说明 |
|------|------|
| 显式配置（推荐） | 与现网路径一致；允许将来 CDN 前缀、多 semver 目录 |
| 自动推导 `\/audio/primary/phonics/${unitId}` | 可在 `phonicsTypes.ts` 提供 **`defaultPhonicsAudioBase(unitId)` 辅助函数**，供新 Unit **可选**使用，不强制覆盖 JSON |

不在 registry 加载时自动改写 `audioBase`，避免静默改路径导致 404。

### 3.2 `unitId` 约束

**建议**：

- **TypeScript**：保持 `string`（与 `UnitDef.id` 一致）。
- **运行时（DEV）**：在 `isPhonicsConfig` 或 `loadPhonicsByUnit` 中，若 `unitId` 不匹配 `registryDiscovery` 的 `UNIT_ID_IN_FILENAME` 正则，则 `warnRegistryDev`（与 sentence/readWrite registry 一致）。
- **不引入** branded type `PrimaryHubUnitId`，避免与 course JSON 大量 `string` 交叉赋值摩擦。

### 3.3 `stage_2_find.has_er` → `matchesRule`

| 字段 | 现状 | 建议 |
|------|------|------|
| `has_er` | 仅适用于 er 单元 | 重命名为 **`matchesRule: boolean`**（类型 + u1 数据 + `PrimaryHubPhonics.tsx` 三处） |

属 schema 泛化必要改动，**纳入任务 4**（改动面小，浏览器回归可覆盖）。

### 3.4 UI 仍绑定 er 的部分（记录，本任务不全面改）

| 位置 | 绑定内容 | 后续 |
|------|----------|------|
| `highlightEr()` | 硬编码找 `"er"` | 改为 `highlightPattern(word, config.phonics_rule)` |
| 文案「认识 er 发音」「含 er 的词」 | 硬编码 | 改为模板 `` `认识 ${rule} 发音` `` |
| `ListenStage` 标题等 | 同上 | 与 Unit 2 内容一并改 |

**任务 4 最小 UI 改动**：仅 `has_er` → `matchesRule` 字段引用；**highlight/文案可暂留**，因 u1 浏览器验收仍测 er，行为不变。

若你希望任务 4 一并泛化 highlight + 文案，请确认；否则默认 **4b 再做**。

### 3.5 其他 u1 绑定字段

| 字段 | 是否 u1 专用 | 说明 |
|------|--------------|------|
| `semesterId` | 否 | 通用 |
| `phonics_sound` / `rule_explanation` | 否 | 每单元不同字符串 |
| `stage_*` 结构 | 否 | 已三关固定，合理 |

---

## 决策 4：废弃 `G4v2U1PhonicsConfig`

**建议：完全删除，不保留 deprecated alias**（与任务 3 一致）。

| 项 | 处理 |
|----|------|
| `G4v2U1PhonicsConfig` 类型 | 删除 |
| `phonicsRegistry` 对 `G4V2_U1_PHONICS` 的 import | 仅 **测试** `__assertG4v2U1PhonicsParityForTest` 可保留对常量的引用，或改为 deep-equal loaded vs 常量 |
| `__assertG4v2U1PhonicsParityForTest` | 重命名为 `__assertPhonicsRegistryLoadsG4v2U1`（可选） |

---

## 实施清单（确认后）

1. 新增 `phonicsTypes.ts`（上表类型）。
2. `g4v2_u1_er.ts`：`satisfies PhonicsConfig`；`has_er` → `matchesRule`。
3. `phonicsRegistry.ts`：类型来自 `phonicsTypes`；DEV `unitId` 格式警告（可选）。
4. `PrimaryHubPhonics.tsx`：`has_er` → `matchesRule`；类型 import 更新。
5. `vocabGroupsRegistry.ts` 等：若从 registry 引 `PhonicsConfig`，路径不变或改 `phonicsTypes`。
6. `registry.test.ts`：parity 测试保留/微调。
7. 可选：`phonicsTypes.test.ts` — `isPhonicsConfig` 对最小合法/非法对象。
8. `npm run build`；`npm test -- src/lib/primaryHub/`（24+）；全量测试记录 slang 10 失败为已知债。

---

## 浏览器回归清单（实施后）

- [ ] Unit 1 → 认识单词 → Tab「自然拼读」→ 进入子页
- [ ] 三关：听一听 / 找一找 / 填空挑战 均可完成
- [ ] er 高亮与音频正常（UI 仍可为 er 硬编码）
- [ ] Console 无新增 error

---

## 待确认项

| # | 决策 | 建议 |
|---|------|------|
| 1 | 类型文件 `phonicsTypes.ts` + 子类型命名 | **同意**；`has_er` → `matchesRule` |
| 2 | `phonics_rule` | **B：`string`** |
| 3 | `audioBase` | **显式** + 可选 helper，不自动覆盖 |
| 3b | `unitId` | **string** + DEV 正则警告 |
| 3c | UI highlight/文案 | **任务 4 不改**（仅 `matchesRule`）；或你要求一并泛化 |
| 4 | 旧类型 | **直接删除** |

请确认（尤其 **3c：UI 泛化是否纳入任务 4**），确认后开始编码。

---

## 相关文档

- [primary-hub-g4v2-u1-analysis-report.md](./primary-hub-g4v2-u1-analysis-report.md) — §3.3 自然拼读字段
- [primary-hub-tech-debt.md](./primary-hub-tech-debt.md) — 测试与 registry 遗留
