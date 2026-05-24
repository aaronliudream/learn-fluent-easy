# 任务 3 决策文档：TTS 语速泛化

> 状态：**已实施**（2026-05-24，浏览器验收通过）  
> 前置：任务 2 已验收并提交  
> 目标：将 TTS 语速从「g4v2_u1 专属」改为 Primary Hub 通用能力

---

## 背景

以下文件命名绑定 Unit 1，阻碍其他 Unit 复用 TTS 语速控制：

| 现文件 | 说明 |
|--------|------|
| `src/lib/primaryHub/g4v2U1SpeakSpeed.ts` | localStorage + 三档语速常量 |
| `src/hooks/useG4v2U1SpeakSpeed.ts` | React hook |
| `src/components/primaryHub/G4v2U1SpeakSpeedControl.tsx` | UI 控件 |

**目标**：全 Hub 通用；Unit 1 行为完全不变（回归：句型关语速控件 + 听力句型关）。

---

## 现状（代码审计）

### 存储与 API

- 当前 localStorage key：`primary_hub_g4v2_u1_tts_speed`
- 三档：`0.7` 慢速 / `0.85` 正常 / `1.0` 快速
- 默认：`0.85`

### 使用位置

| 位置 | 显示控件？ | 使用可调语速？ |
|------|------------|----------------|
| `SentenceLessonStage.tsx` | **始终**（`LessonPanel` 顶部） | 是，`hubSpeakAtSpeed(text, speed, grade)` |
| `PrimaryHubStagePlay.tsx` → `ListenStage` | 仅 `isG4v2U1Unit(unitId) && isSentenceAudio` | 是；否则固定 `hubSpeak(0.74/0.8/0.7)` |

### 句型关路径说明

- Unit 1 句型关（stage 3）走 `SentenceLessonStage`，**不经过** `isG4v2U1Unit`。
- 听力句型关的 gating 在 `ListenStage` 内（标题/说明含「句」→ `isSentenceAudio`）。
- 目前仅 `g4v2_u1` 有 `getSentenceLesson`；u2+ 暂无 sentence lesson，但将来有句型听力时会命中 `isSentenceAudio`。

---

## 决策 1：localStorage key 策略

### 方案 X：全局共享 key（推荐）

| 项 | 内容 |
|----|------|
| Key | `primary_hub_speak_speed`（建议；与现有 `primary_hub_*` 前缀一致） |
| 行为 | 所有 Unit 共用语速偏好 |
| 优点 | 用户体验一致；实现简单 |
| 缺点 | 无法按单元单独定制 |

### 方案 Y：按 Unit 隔离 key

| 项 | 内容 |
|----|------|
| Key | `primary_hub_speak_speed_${unitId}` |
| 行为 | 每 Unit 独立存储 |
| 优点 | 灵活 |
| 缺点 | 用户每单元重设，体验割裂 |

### 最终建议

**采用方案 X（全局共享）**，与产品倾向一致。

### 迁移（保证 Unit 1 老用户行为不变）

在 `loadHubSpeakSpeed()` 中：

1. 读新 key `primary_hub_speak_speed`
2. 若为空，读旧 key `primary_hub_g4v2_u1_tts_speed`
3. 若旧值合法（0.7 / 0.85 / 1.0），写入新 key 并返回
4. 否则返回默认 `0.85`

---

## 决策 2：是否所有 Unit 默认显示语速控件

### 选项 A：所有 Unit 默认显示

- 词听、配对等阶段也用固定 `hubSpeak(0.85)`，控件易显得无效或误导。

### 选项 B：`UnitDef.showSpeakSpeedControl?: boolean`

- 默认 `true`，可在 JSON 关闭。
- 灵活，但增加每单元配置负担；当前仅 u1 富内容，略重。

### 选项 C：按内容/阶段自动判断（推荐）

| 场景 | 是否显示 |
|------|----------|
| `SentenceLessonStage`（有 sentence lesson） | 是 |
| `ListenStage` 且 `isSentenceAudio`（title/instruction 含「句」） | 是 |
| 认识单词、听词、配对、默写等 | 否（保持固定语速） |

**最终建议：采用方案 C**，不新增 JSON 字段；去掉 `isG4v2U1Unit` 硬编码后，u2+ 将来有句型听力时自动获得控件。

---

## 决策 3：重命名与旧名兼容

### 建议映射

| 现名 | 新名 |
|------|------|
| `g4v2U1SpeakSpeed.ts` | `hubSpeakSpeed.ts` |
| `G4V2_U1_SPEAK_SPEED_KEY` | `HUB_SPEAK_SPEED_KEY` |
| `G4V2_U1_SPEAK_SPEED_LEVELS` | `HUB_SPEAK_SPEED_LEVELS` |
| `G4v2U1SpeakSpeed`（类型） | `HubSpeakSpeed` |
| `loadG4v2U1SpeakSpeed` / `saveG4v2U1SpeakSpeed` | `loadHubSpeakSpeed` / `saveHubSpeakSpeed` |
| `useG4v2U1SpeakSpeed` | `useHubSpeakSpeed` |
| `G4v2U1SpeakSpeedControl` | `HubSpeakSpeedControl` |
| `isG4v2U1Unit()` | **删除**（由决策 2-C 替代） |

### 是否保留 deprecated alias？

**建议：不保留。**

- 引用点少（`PrimaryHubStagePlay`、`SentenceLessonStage`、hook/组件）。
- 一次性全局替换即可。
- **仅需** localStorage 旧 key 迁移（决策 1），不是代码 re-export。

---

## 实施清单（确认后执行）

1. 新增 `hubSpeakSpeed.ts`、`useHubSpeakSpeed`、`HubSpeakSpeedControl`；删除旧文件。
2. `ListenStage`：条件改为 `isSentenceAudio`（移除 `isG4v2U1Unit`）。
3. `SentenceLessonStage`：改用新 hook / 组件 / 类型名。
4. 全局搜索旧符号，全部替换。
5. 单元测试 `hubSpeakSpeed.test.ts`：
   - 默认值 `0.85`
   - 非法 localStorage 回退
   - 旧 key → 新 key 迁移
6. `npm run build` + 相关 vitest 通过。

---

## 浏览器回归清单（实施后）

- [ ] Unit 1 **句型关**：顶部「朗读速度」三档；切换后 🔊 语速变化
- [ ] Unit 1 **听力句型关**（若有）：控件显示，语速可调
- [ ] Unit 1 其他阶段（认识单词等）：**无**语速控件
- [ ] Unit 2「认识单词」/ 听力：**无**语速控件，播放正常
- [ ] Console 无报错
- [ ] （可选）清 localStorage 后设一次语速，刷新仍保留；有旧 key 的用户迁移后仍保留原设置

---

## 待确认项（请回复同意/修改）

| # | 决策 | 建议 |
|---|------|------|
| 1 | localStorage | **X** + `primary_hub_speak_speed` + 旧 key 迁移 |
| 2 | 控件显示 | **C**（sentence lesson / 句型听力） |
| 3 | 重命名 | 直接改名，**无** deprecated alias |

确认后开始编码；完成后停下等待浏览器验证。

---

## 相关文档

- [primary-hub-generate-script-risks.md](./primary-hub-generate-script-risks.md) — 生成脚本风险（任务 8 待办）
- [task2-vocab-groups-scheme-decision.md](./task2-vocab-groups-scheme-decision.md) — 任务 2 方案记录
