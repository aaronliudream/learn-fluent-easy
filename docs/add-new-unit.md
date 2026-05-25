# Primary Hub — 新增 Unit 操作指南

> **定位**：架构重构（任务 1–6）的**入口文档**。读完本篇 + 按需点开链接的决策文档，即可在**零 TS 改动**前提下为 Primary Hub 新增或充实一个 Unit。  
> **目标读者**：负责批量生成 Unit 2–6 内容的 Cursor Agent 或内容工程师。  
> **活样本**：四年级下册 Unit 1（`g4v2_u1`）— 见 [§7 参考样本](#7-参考样本unit-1-活文件清单)。

---

## 目录

1. [概览：新增 Unit 做什么](#1-概览新增-unit-做什么)
2. [Unit ID 与命名规范](#2-unit-id-与命名规范)
3. [8 阶段模板](#3-8-阶段模板)
4. [产出物清单（按文件）](#4-产出物清单按文件)
5. [字段交叉约束](#5-字段交叉约束)
6. [端到端验证流程](#6-端到端验证流程)
7. [参考样本：Unit 1 活文件清单](#7-参考样本unit-1-活文件清单)
8. [自主决策 vs 必须遵守](#8-自主决策-vs-必须遵守)
9. [已知限制 / 后续改进建议](#9-已知限制--后续改进建议)
10. [决策文档索引](#10-决策文档索引)

---

## 1. 概览：新增 Unit 做什么

**一句话**：新增 Unit = 在 `grade*.json` 写入单元块 + 按需添加若干 registry 侧车 JSON/TS + 静态资源；**不需要改 React/TS 业务代码**。

```
课本单元材料
    │
    ├─► grade{N}.json          ← 必填：词表、对话、8 关、quiz、听力
    │
    ├─► sentence/*.json        ← 可选：富句型关（无则降级为 dialogues 简易模式）
    ├─► readWrite/*.json       ← 可选：读写关（无则 s7 显示「即将上线」占位）
    ├─► phonics/*.ts|json      ← 可选：自然拼读 Tab（无则无第 4 Tab）
    │
    └─► public/…               ← 按需：读写插图、拼读 MP3 等
```

**Registry 自动发现**（任务 1）：`import.meta.glob` 在 dev/build 时扫描 `sentence/`、`readWrite/`、`phonics/` 三个目录；文件名解析 `unitId` / `stageIdx`，放入内存 Map。实现见 `src/lib/primaryHub/registryDiscovery.ts`；行为测试见 `src/lib/primaryHub/registry.test.ts`。**无独立 task1 决策文档**，以代码 + 测试为准。

**两种内容路径**：

| 路径 | 适用 | 说明 |
|------|------|------|
| **A. 生成脚本** | u2–u6 批量打底 | `python scripts/generate_primary_hub_courses.py` 从 CSV 生成 `grade*.json` 骨架 |
| **B. 手写 / 脚本后精修** | 富内容 Unit | 在 JSON 上补 `vocabGroups`、registry 侧车文件、quiz 质量等 |

生成脚本风险见 [primary-hub-generate-script-risks.md](./primary-hub-generate-script-risks.md)（计划任务 8 加固）。

---

## 2. Unit ID 与命名规范

### 2.1 Unit ID 格式

| 组成部分 | 规则 | 示例 |
|----------|------|------|
| 年级 | `g3` … `g6` | 四年级 → `g4` |
| 册次 | `v1` = 上册，`v2` = 下册 | 四下 → `g4v2` |
| 单元序号 | `_u1` … `_u6` | 第 2 单元 → `g4v2_u2` |

生成脚本函数：`unit_id(grade, semester_id, num)` → `g4v2_u2`（见 `generate_primary_hub_courses.py`）。

### 2.2 课程 JSON 位置

| 文件 | 学期 key 示例 |
|------|----------------|
| `src/data/primaryHub/grade4.json` | `grade4_volume2`（四下） |

单元块挂在：`grade4.semesters.grade4_volume2.units[]`。

### 2.3 Registry 侧车文件命名

正则（`registryDiscovery.ts`）：`/(g\d+v\d+_u\d+|gk\d+_[a-z0-9]+_u\d+)/`

| 目录 | 推荐文件名 | 解析结果 |
|------|------------|----------|
| `sentence/` | `g4v2_u2_grammar.json` | `unitId=g4v2_u2`；`stageIdx` 取自 JSON 或 `_stage3` 后缀 |
| `readWrite/` | `g4v2_u2_read_write.json` | 同上；`stageIdx` 通常 **6**（对应 s7） |
| `phonics/` | `g4v2_u2_ir.ts` 或 `.json` | `unitId` 取自文件名或模块内字段 |

**规则**：

- 文件名含 `unitId` **优先**；仅 JSON 内写 `unitId` 时 DEV 会 `console.warn`。
- `stageIdx` = **0-based**，与 `stages` 数组下标一致（s1→0 … s8→7）。
- 重复 key（同 unitId + stageIdx）后者覆盖，DEV warn。

### 2.4 静态资源路径（推荐）

| 用途 | 推荐目录 | Helper |
|------|----------|--------|
| 读写插图 | `public/primary/hub/{unitId}/` | `defaultReadWriteImagePath(unitId, filename)` |
| 拼读音频 | `public/audio/primary/phonics/{unitId}/` | `defaultPhonicsAudioBase(unitId)` |

均为推荐规范，**非强制**；也支持绝对 URL（CDN）。

---

## 3. 8 阶段模板

权威决策：[task5-eight-stage-template-decision.md](./task5-eight-stage-template-decision.md) — u2–u6 与 u1 对齐 **8 关**；readWrite 无 registry JSON 时为可点击占位，**不计入**完成度分母。

### 3.1 阶段 ↔ 数组下标 ↔ 数据来源

| 下标 | Stage ID | 类型 | 标题 | 数据主要来源 |
|------|----------|------|------|--------------|
| 0 | s1 | `vocab` | 认识单词 | `grade*.json` → `vocabulary`；可选 `vocabGroups`；可选 phonics registry |
| 1 | s2 | `listenWord` | 听音辨词 | 运行时从 `vocabulary` 抽 6 题（无需单独 JSON） |
| 2 | s3 | `match` | 单词配对 | 同上 |
| 3 | s4 | `sentence` | 学习句型 | registry `sentence/*.json` **或** 降级用 `dialogues` |
| 4 | s5 | `write` | 默写挑战 | `vocabulary` |
| 5 | s6 | `listenSent` | 听力测试 | `listeningQuestions`（取 6 题） |
| 6 | s7 | `readWrite` | 读写训练 | registry `readWrite/*.json` **或** 占位 |
| 7 | s8 | `finalQuiz` | 最终通关 | `quizQuestions`（取 10 题） |

### 3.2 `stages[]` 最小字段

```json
{
  "id": "s7",
  "title": "读写训练",
  "subtitle": "即将上线 · 看图写句",
  "icon": "📝",
  "type": "readWrite",
  "time": "12分钟"
}
```

- u1 已上线 readWrite：`subtitle` 可改为实际描述（如「看图写句 · 填图 · 成句」）。
- u2+ 无 readWrite JSON 前：保持 `subtitle` 含「即将上线」即可；列表会自动显示 🚧 样式（任务 5）。

### 3.3 进度与占位

- **可完成关分母**：readWrite 占位关不算；u2 做完前 7 关可玩内容 = **100%**。
- 头部文案：`已完成 a/7 · 共 8 关`（有占位时）。
- 补上 readWrite JSON 后，**同一 s7 自动变为可玩**，无需改 `stages` 或 TS。

---

## 4. 产出物清单（按文件）

### 4.1 必填：`grade{N}.json` 单元块

**路径**：`src/data/primaryHub/grade4.json`（按年级选文件）

**顶层字段**（`UnitDef`，见 `src/lib/primaryHub/types.ts`）：

| 字段 | 必填 | 说明 |
|------|------|------|
| `id` | ✅ | 如 `g4v2_u2` |
| `num` | ✅ | 单元序号 1–6 |
| `title` / `cn` / `emoji` | ✅ | 英/中标题与 emoji |
| `available` | ✅ | `true` 表示单元已就绪（与历史「🔒」逻辑兼容） |
| `published` | ⬜ | 默认 `true`；`false` 时 Primary Hub **不展示**且直链会跳回学期列表（用于 main 上隐藏未完成单元） |
| `vocabulary` | ✅ | 词表数组，至少 1 词 |
| `dialogues` | ✅ | 对话数组（句型降级模式也依赖） |
| `stages` | ✅ | **8 条**，顺序与 §3.1 一致 |
| `quizQuestions` | ✅ | 最终通关题库，建议 ≥10 |
| `listeningQuestions` | ✅ | 听力测试题库，建议 ≥6 |
| `vocabGroups` | ⬜ | 多 Tab 分组；见 task2 |

**`VocabItem` 常用字段**：

```json
{ "en": "breakfast", "cn": "早餐", "emoji": "🍳", "phonetic": "/…/", "type": "core" }
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `en` / `cn` / `emoji` | ✅ | 基础展示 |
| `type` | 分组时需要 | `"core"` \| `"extended"` \| `"phonics"` — [task2](./task2-vocab-groups-scheme-decision.md) |
| `phonetic` / `icon` / `page` / `highlight` | ⬜ | 富内容；u1 有，`highlight` 用于拼读词高亮 |

**`QuizQuestion`**：`q`, `opts[]`, `answer`（正确选项 index）；可选 `point`, `dim`（`vocab`/`sentence`/`listening`/`phonics`）。

**`ListeningQuestion`**：`audio`（朗读文本）, `opts[]`, `answer`。

**活样本**：`grade4.json` 内 `g4v2_u2`（生成脚本打底）与 `g4v2_u1`（富内容）。

---

### 4.2 可选：`sentence/{unitId}_grammar.json`

**何时需要**：s4 要用 Submodule A/B 解锁、逐句问答等**富句型关**（u1 级别体验）。

**无此文件时**：s4 降级为 `SentenceStage`，仅展示 `dialogues` 卡片 — **可玩，但体验较简**。

**Registry**：`stageIdx: 3`（s4）。

**字段摘要**（完整类型见 `src/lib/primaryHub/sentenceTypes.ts`）：

| 字段 | 必填 |
|------|------|
| `lessonId`, `unitId`, `stageIdx`, `title`, `transitionMessage` | ✅ |
| `subModules[]` | ✅，至少 1 个；每项含 `id`(`A`\|`B`), `title`, `description`, `color`, `sentences[]` |
| `subModules[].lockedUntil` | B 模块常用 `"A"` |
| `sentences[].id`, `question`, `answer`, `tag` | ✅；`answer` 可为 `null` |

**活样本**：[`src/data/primaryHub/sentence/g4v2_u1_grammar.json`](../src/data/primaryHub/sentence/g4v2_u1_grammar.json)

**TTS**：有句型 registry 时，句型关顶部显示语速控件（[task3](./task3-hub-speak-speed-decision.md)）。

---

### 4.3 可选：`readWrite/{unitId}_read_write.json`

**何时需要**：s7 读写训练实际上线（非占位）。

**无此文件时**：s7 显示「读写训练内容准备中」占位页，不可完成、不计星。

**Registry**：`stageIdx: 6`（s7）。

**权威细节**：[add-readwrite-question.md](./add-readwrite-question.md) + [task6 实施报告](./task6-readwrite-visual-implementation-report.md)

**根结构摘要**：

```json
{
  "unitId": "g4v2_u2",
  "stageIdx": 6,
  "title": "读写训练",
  "totalPoints": 5,
  "pointsPerQuestion": 1,
  "questions": [ … ]
}
```

**题型**：`picture_choice` | `fill_choice`

**插图策略**（与任务 6「主路径 + escape hatch」一致，详见 [add-readwrite-question.md](./add-readwrite-question.md)）：

| 路径 | 字段 | 何时用 |
|------|------|--------|
| **主路径** | `visual` | 新 Unit **优先**：轻量图示 / 与词表 emoji 同语义层的题，能用简单 illustration 表达时 |
| **Escape hatch** | `image` | 仅当题目**强依赖**精确场景插图（楼层图、钟表盘面等），且内置 `visual` key 无法表达时 |
| 无图 | `fill_choice` | 纯句子填空，不需配图 |

- u1 的 5 个内置 `visual` key（`place_books` 等）是**遗留 SVG**，新 Unit **不要**复用这些 u1 专用 key。
- 使用 `image` 时：路径如 `/primary/hub/g4v2_u2/clock.svg`，文件放 `public/primary/hub/g4v2_u2/`；`image` 与 `visual` 同时存在时 **`image` 优先**（DEV warn）。

**活样本**：[`src/data/primaryHub/readWrite/g4v2_u1_read_write.json`](../src/data/primaryHub/readWrite/g4v2_u1_read_write.json)（u1 用遗留 `visual` key）

---

### 4.4 可选：`phonics/{unitId}_{rule}.ts` 或 `.json`

> **⚠️ 强烈建议：在任务 4b 完成前，不要为新 Unit 添加 phonics JSON/TS。**  
> 任务 4 仅泛化了数据类型；`PrimaryHubPhonics.tsx` 中 `highlightEr`、子页标题等 UI 仍硬编码 **er** 语义。若必须为 u2 添加拼读内容，须先评估 UI 文案与高亮对 `phonics_rule`（如 `ir`）的误导风险，并计划同步推进 4b。详见 [primary-hub-tech-debt.md — Phonics UI（任务 4b）](./primary-hub-tech-debt.md)。

**何时需要**（4b 完成后）：认识单词关需要第 4 Tab「自然拼读」子页（三关：听/找/填空）。

**无此文件时**：vocab 关仅词汇 Tab，无拼读入口 — **这是 u2–u6 的默认安全状态**。

**类型权威**：[task4-phonics-types-decision.md](./task4-phonics-types-decision.md)

**字段摘要**（`PhonicsConfig`）：

| 字段 | 说明 |
|------|------|
| `unitId`, `semesterId`, `title` | 标识 |
| `phonics_rule` | 字符串，如 `"er"`, `"ir"` |
| `phonics_sound`, `rule_explanation` | 展示文案 |
| `audioBase` | 显式路径，推荐 `/audio/primary/phonics/{unitId}` |
| `stage_1_listen[]` | `{ word, zh, emoji, audio }` |
| `stage_2_find[]` | `{ word, matchesRule }` |
| `stage_3_challenge[]` | `{ image, sentence, hint, options, correct }` |

**音频文件**：放 `public/audio/primary/phonics/{unitId}/*.mp3`。

**活样本**（仅 u1，勿照抄到新 Unit）：[`src/data/primaryHub/phonics/g4v2_u1_er.ts`](../src/data/primaryHub/phonics/g4v2_u1_er.ts)

---

### 4.5 可选：`legacy_g4v2_u1.json`（仅 u1 特殊）

u1 富内容通过生成脚本的 **legacy 合并**保留；**新 Unit 不需要此文件**。若误改 u1 且重跑生成脚本，见 [primary-hub-generate-script-risks.md](./primary-hub-generate-script-risks.md)。

---

## 5. 字段交叉约束

读 JSON 前先看这张表，避免 silent break。

| 约束 | 说明 |
|------|------|
| **`stageIdx` ↔ `stages` 下标** | registry 内 `stageIdx` 必须等于 `grade*.json` 里 `stages` 数组下标 |
| **`vocabGroups` ↔ `vocabulary[].type`** | 配置了分组则每个词需有 `type`，且被某组 `match.type` 覆盖；否则 DEV warn |
| **无 `vocabGroups`** | 整表单词单 Tab 展示（u2 现状）— 合法 |
| **readWrite 占位** | 有 s7 `type:"readWrite"` 但无 registry JSON → 占位，进度分母 -1 |
| **sentence 双模式** | 有 registry → 富句型；无 → `dialogues` 简易句型 |
| **phonics Tab** | 需 **同时** 有 phonics registry +（可选）`vocabGroups` 中 `showPhonicsRule: true` 的分组 |
| **listenWord / match / write** | 仅依赖 `vocabulary`，无需侧车文件 |
| **listenSent / finalQuiz** | 依赖 `listeningQuestions` / `quizQuestions` 数量足够（运行时 slice 6 / 10） |
| **文件名 unitId** | 侧车 JSON 文件名应含 `g4v2_u2` 等形式，避免 DEV warn |
| **重跑生成脚本** | 会覆盖 CSV 生成的 unit 块；u1 靠 legacy 豁免 — 见脚本风险文档 |

---

## 6. 端到端验证流程

### 6.1 自动化（必跑）

```bash
npm run build
npm test -- src/lib/primaryHub/
```

| 命令 | 通过标准 |
|------|----------|
| `npm run build` | 无 TypeScript / 构建错误 |
| `npm test -- src/lib/primaryHub/` | 全绿（当前 47+ 用例） |

全仓 `npm test` 中 `slangLocalization` 10 失败为**已知债**，与 Unit 内容无关。

**Registry 是否被识别（三种方式，任选）**：

| 方式 | 做法 | 通过标准 |
|------|------|----------|
| **A. 单元测试** | 在 `src/lib/primaryHub/registry.test.ts` 临时加一条 `getReadWriteConfig('g4v2_u2', 6)` 等断言，跑 `npm test -- src/lib/primaryHub/registry.test.ts` | `expect(config).not.toBeNull()` |
| **B. DEV Console** | `npm run dev`，打开目标 Unit 前看浏览器 Console | **无** `[primaryHub registry] skipped "你的文件名"`；若有 `skipped`，说明文件名/shape 不合格 |
| **C. 页面表现** | 见 §6.3 各关「Registry 已加载」列 | 富句型 / 读写实玩 / 拼读 Tab 等预期行为出现 |

> Registry 在 **dev/build 时 eager 加载**，改 JSON 后需**刷新页面**；若仍不生效，重启 dev server。

### 6.2 本地 dev

```bash
npm run dev
```

导航：**Primary Hub → 对应年级 → 对应册 → 目标 Unit**（例：四年级 → 下册 → `g4v2_u2`）。

### 6.3 单元级结构 Checklist

- [ ] `available: true`，单元卡片可点击（非 🔒）
- [ ] 关卡列表 **8 项**（s1–s8），顺序与 §3.1 一致
- [ ] 无 readWrite JSON 时：s7 副标题含「即将上线」、列表项有 🚧 / 虚线样式
- [ ] 头部：`已完成 x/y` 中 **y = 可完成关数**（有 readWrite 占位时 y=7，共 8 关）
- [ ] Console：无红色 error；无意外 `[primaryHub registry] skipped`

### 6.4 八阶段逐关 Checklist

每关：**进入 → 完成至少 1 个交互 → 能正常退出或通关**。下表「Registry 已加载」指侧车 JSON 被识别后的**额外**表现。

#### s1 · 认识单词（`vocab`）

- [ ] 词卡展示：`en` / `cn` / `emoji` 正确
- [ ] 点击 🔊 有 TTS 朗读
- [ ] 配置了 `vocabGroups` 时：Tab 数量与组名正确，切换后词表变化
- [ ] **Registry 已加载（phonics）**：出现第 4 Tab「自然拼读」，可进入子页（4b 前慎加）
- [ ] 翻完/点完所需卡片后可完成关卡

#### s2 · 听音辨词（`listenWord`）

- [ ] 标题「听音辨词」，约 **6 题**
- [ ] 播放音频后可选 4 个英文选项
- [ ] 选对/选错有反馈，可推进到下一题
- [ ] **无**语速控件（非句型听力）
- [ ] 6 题结束后可完成关卡

#### s3 · 单词配对（`match`）

- [ ] 中英配对游戏可拖拽/点击配对
- [ ] 配对完成可结束关卡
- [ ] 词表来自 `vocabulary`（与 s1 一致）

#### s4 · 学习句型（`sentence`）

- [ ] **有 sentence registry**：Submodule A/B、过渡文案、逐句问答；顶部有「朗读速度」三档（[task3](./task3-hub-speak-speed-decision.md)）
- [ ] **无 sentence registry（降级）**：`dialogues` 卡片列表，可浏览对话并完成关卡（体验较简）
- [ ] **Registry 已加载**：不应仅为 dialogues 大卡片（若仍是，检查 `stageIdx: 3` 与文件名 `unitId`）

#### s5 · 默写挑战（`write`）

- [ ] 从 `vocabulary` 抽词默写
- [ ] 输入判分（正确 / 标点 / 错误）正常
- [ ] 可完成关卡并可能获得星星

#### s6 · 听力测试（`listenSent`）

- [ ] 约 **6 题**，题干/说明含「听」类文案
- [ ] 播放句子音频，四选一
- [ ] 若题目为句型向（title/instruction 含「句」）：显示语速控件
- [ ] 6 题结束后可完成关卡

#### s7 · 读写训练（`readWrite`）

- [ ] **无 readWrite registry（占位）**：🚧「读写训练内容准备中」、说明文字、「返回单元」可用；**无**完成按钮；关卡进度条不误导为 100%
- [ ] **有 readWrite registry**：约 5 题 MCQ；`picture_choice` 插图正常（`visual` 或 `image`）；`fill_choice` 空格与选项正常；可通关并计分
- [ ] **Registry 已加载**：不应仍为占位页（若仍是，检查 `stageIdx: 6`、JSON 含 `questions[]`、文件名含 `unitId`）

#### s8 · 最终通关（`finalQuiz`）

- [ ] 约 **10 题** 综合测验（来自 `quizQuestions`）
- [ ] 题型与选项合理，选对可推进
- [ ] 完成后单元进度更新

### 6.5 进度与星星

- [ ] 完成所有**可完成**关后，单元完成度 **100%**（有 s7 占位时 = 做完其余 7 关）
- [ ] 占位 s7 **不**增加 `completedStages`、不阻塞 100%
- [ ] 星星数 ≤ 可完成关数（u2 无 readWrite 时上限 **7** 颗）

### 6.6 新增 registry 文件后的对照

| 新增文件 | 页面应出现的变化 |
|----------|------------------|
| `sentence/g4v2_u2_grammar.json` | s4 变为 Submodule 富句型（非 dialogues 列表） |
| `readWrite/g4v2_u2_read_write.json` | s7 由占位变为 5 题读写；头部分母 7→8；列表 s7 去掉 🚧 |
| `phonics/g4v2_u2_ir.ts` | s1 出现拼读 Tab（**4b 前慎加**，见 §4.4） |

---

## 7. 参考样本：Unit 1 活文件清单

**不要复制粘贴 u1 内容到新 Unit** — 仅作结构、字段密度与质量参考。在仓库中搜索 `g4v2_u1` 可定位全部引用。

### 7.1 课程主数据（必填）

| 路径 | 内容 |
|------|------|
| [`src/data/primaryHub/grade4.json`](../src/data/primaryHub/grade4.json) | `semesters.grade4_volume2.units[]` 中 `id: "g4v2_u1"` 整段：19 词 + `vocabGroups` + `dialogues` + **8** `stages` + `quizQuestions` + `listeningQuestions` |

### 7.2 Registry 侧车（u1 已齐全）

| 路径 | 绑定 | 说明 |
|------|------|------|
| [`src/data/primaryHub/sentence/g4v2_u1_grammar.json`](../src/data/primaryHub/sentence/g4v2_u1_grammar.json) | s4 · `stageIdx: 3` | Submodule A/B 句型 |
| [`src/data/primaryHub/readWrite/g4v2_u1_read_write.json`](../src/data/primaryHub/readWrite/g4v2_u1_read_write.json) | s7 · `stageIdx: 6` | 5 题 simplified readWrite（`visual` 遗留 key） |
| [`src/data/primaryHub/phonics/g4v2_u1_er.ts`](../src/data/primaryHub/phonics/g4v2_u1_er.ts) | s1 拼读 Tab | `phonics_rule: "er"` |

### 7.3 静态资源

| 路径 | 用途 |
|------|------|
| [`public/audio/primary/phonics/g4v2_u1/`](../public/audio/primary/phonics/g4v2_u1/) | 拼读 MP3（文件名与 `stage_1_listen[].audio` 对应） |
| [`public/primary/hub/g4v2_u1/`](../public/primary/hub/g4v2_u1/) | 可选读写插图（u1 readWrite 主要用内置 `visual`，非必须） |

### 7.4 仅 u1 维护、新 Unit 勿用

| 路径 | 说明 |
|------|------|
| [`src/data/primaryHub/legacy_g4v2_u1.json`](../src/data/primaryHub/legacy_g4v2_u1.json) | 生成脚本合并用；改 u1 富内容时需同步 |
| [`src/data/primaryHub/readWrite/g4v2_u1_stage6.json`](../src/data/primaryHub/readWrite/g4v2_u1_stage6.json) | 旧多 stage 格式，**registry 已忽略**，勿作模板 |

### 7.5 对比：u2 最小样本（同文件）

[`grade4.json`](../src/data/primaryHub/grade4.json) 内 `g4v2_u2`：8 关 + 8 词 + 自动生成 quiz/听力 + **无** registry 侧车 → s7 占位、s4 简易句型。适合作为「批量打底」参照。

---

## 8. 自主决策 vs 必须遵守

遵循任务 5 以来的**一次性放权**：下列「可自主」项由内容 Agent 自行判断，无需逐条请示；「必须」项违反会导致 registry 跳过、进度错误或 DEV 大量警告。

### 8.1 必须遵守（硬规范）

| 类别 | 要求 |
|------|------|
| **ID 与命名** | `unitId` 符合 `g{grade}v{1\|2}_u{n}`；侧车文件名含 `unitId` |
| **stageIdx** | registry 中 `stageIdx` = `grade*.json` 的 `stages` **0-based 下标**（s4→3, s7→6） |
| **8 关结构** | `stages` 恰好 8 条，类型顺序与 §3.1 一致 |
| **必填字段** | §4.1 表中标 ✅ 的字段齐全；`quizQuestions` ≥10、`listeningQuestions` ≥6（满足运行时 slice） |
| **vocabGroups** | 若配置分组，则每词有 `type` 且被某组覆盖 |
| **readWrite 插图** | `picture_choice` 须有 `visual` 或 `image` 至少其一（优先 `visual`，见 §4.3） |
| **phonics** | **4b 完成前不建议**为新 Unit 添加 phonics（§4.4） |
| **验证** | §6 全部 checklist 通过后再交付 |
| **出题铁律** | finalQuiz / readWrite 等须满足 [g4v2_u2-template-notes.md](./units/g4v2_u2-template-notes.md) 铁律 **1–7**（含中文自然度、PEP 场景货币一致） |

### 8.2 可自主决策（内容放权）

| 类别 | Agent 可自行决定 |
|------|------------------|
| **词表** | 每词 `emoji` 选哪个、是否写 `phonetic`/`icon`/`page`；词数在合理区间（通常 8–20，u1 为 19） |
| **分组** | 是否配置 `vocabGroups`；单 Tab 即可上线 |
| **句型** | 富句型 registry vs 仅 `dialogues` 简易模式 |
| **读写** | s7 先占位或一次上线；题型 mix（`picture_choice` / `fill_choice`）；`visual` vs `image` 按 §4.3 判断 |
| **测验文案** | `quizQuestions` / `listeningQuestions` 题干、干扰项措辞、知识点 `point` 标签 |
| **对话** | `dialogues` 行数、角色名、中文翻译风格 |
| **副标题/时长** | 各 `stages[].subtitle`、`time` 文案（符合教学节奏即可） |
| **工作流** | 先跑 `generate_primary_hub_courses.py` 再手工精修，或纯手写 JSON |
| **资源格式** | `image` 用 SVG/PNG/WebP；是否 CDN 绝对 URL |

### 8.3 边界情况：先查 §5 再决定

- 重跑生成脚本是否会覆盖手工修改 → [primary-hub-generate-script-risks.md](./primary-hub-generate-script-risks.md)
- readWrite 占位与完成度 → [task5](./task5-eight-stage-template-decision.md)

---

## 9. 已知限制 / 后续改进建议

**权威清单**：[primary-hub-tech-debt.md](./primary-hub-tech-debt.md)（本节仅摘要 + 文档编写时发现项，**不重复**全文）。

| 来源 | 概要 | 处理时机 |
|------|------|----------|
| **任务 4b** | Phonics UI：`highlightEr`、子页标题仍硬编码 er；新 Unit 不宜上 phonics | 4b 或首个非 er 拼读 Unit 前 |
| **任务 8** | 生成脚本：CSV 无 `type`、legacy 合并风险、`DEFAULT_STAGES` 在 `types.ts` 仍为 7 关 | 脚本健壮性任务 |
| **任务 9** | visual key 不可配置（产品选项 A：维持现状）；新 Unit 实际常 `fill_choice` / `image` | 见 [tech-debt](./primary-hub-tech-debt.md)，暂不排期 |
| **测试债** | `slangLocalization` 10 失败（supabase mock） | 架构重构外单独修 |

**文档编写时发现（未改代码）**：

| 项 | 说明 |
|----|------|
| 遗留 `g4v2_u1_stage6.json` | registry 忽略，易误导；可删或归档 |
| sentence 简易降级 | 无 registry 时 UX 弱于 u1，产品是否长期接受未决 |
| 无 `validate:primary-hub` CLI | 依赖 DEV warn + 单元测试 + §6 手工清单 |
| 新 Unit 无新 `visual` key | 内置 5 key 为 u1 专用；新 Unit 主路径 `visual` 在代码扩展前实际常落 `fill_choice` 或 `image` |

---

## 10. 决策文档索引

| 主题 | 文档 | 一句话摘要 |
|------|------|------------|
| **Registry 自动发现（任务 1）** | `src/lib/primaryHub/registryDiscovery.ts` · `registry.test.ts` | `import.meta.glob` 扫描三目录；文件名解析 `unitId` / `stageIdx` |
| **Vocab 分组（任务 2）** | [task2-vocab-groups-scheme-decision.md](./task2-vocab-groups-scheme-decision.md) | `vocabGroups` + `match.type` 主路径；`indices` 为 escape hatch |
| **TTS 语速（任务 3）** | [task3-hub-speak-speed-decision.md](./task3-hub-speak-speed-decision.md) | 全局 `primary_hub_speak_speed`；句型关 / 句型听力显示控件 |
| **Phonics 类型（任务 4）** | [task4-phonics-types-decision.md](./task4-phonics-types-decision.md) | `phonicsTypes.ts`；`phonics_rule: string`；UI 未泛化 → 4b |
| **8 阶段模板（任务 5）** | [task5-eight-stage-template-decision.md](./task5-eight-stage-template-decision.md) | u2+ 与 u1 对齐 8 关；readWrite 无 JSON = 占位 |
| **8 阶段实施（任务 5）** | [task5-eight-stage-implementation-report.md](./task5-eight-stage-implementation-report.md) | 进度迁移、可完成关分母、占位 UI |
| **ReadWrite 插图（任务 6）** | [task6-readwrite-visual-implementation-report.md](./task6-readwrite-visual-implementation-report.md) | `visual` 主路径 + `image` escape hatch；加载失败降级 |
| **ReadWrite 题目配置** | [add-readwrite-question.md](./add-readwrite-question.md) | `picture_choice` / `fill_choice` 字段与 JSON 示例 |
| **生成脚本风险** | [primary-hub-generate-script-risks.md](./primary-hub-generate-script-risks.md) | CSV 无 type、legacy 合并、重跑覆盖 |
| **技术债汇总** | [primary-hub-tech-debt.md](./primary-hub-tech-debt.md) | 4b phonics UI、slang 测试、registry 命名等 |
| **本篇（任务 7）** | [add-new-unit.md](./add-new-unit.md) | 新增 Unit 入口与合成视图 |

---

## 附录：Unit 2 最小可运行路径（Thought Experiment 答案）

假设只有课本 Unit 2 材料，按下列顺序即可得到**可运行** JSON（读写可先占位）：

1. 运行或仿照 `generate_primary_hub_courses.py` 产出 `g4v2_u2` 单元块（含 8 stages、8 词、dialogues、quiz、listening）。
2. 确认 `available: true`，`stages` 为 8 条且 s7=`readWrite`、s8=`finalQuiz`。
3. （可选）补 `vocabulary[].type` + `vocabGroups` — 见 task2。
4. （可选）新增 `sentence/g4v2_u2_grammar.json`，`stageIdx: 3`。
5. （可选）新增 `phonics/g4v2_u2_*.ts` + MP3 资源。
6. （可选）新增 `readWrite/g4v2_u2_read_write.json` — 插图优先 `visual`，强依赖场景再用 `image`（§4.3、add-readwrite-question.md）。
7. 跑 §6 验证 checklist。

**无需修改任何 `.tsx` / `.ts` 业务文件。**

---

*文档版本：任务 7 · 2026-05-24*
