# 四上 U1 Stage 3 训练模式改造 ACCEPTANCE · 分支 `cursor/g4v1-u1-stage3-training`

## 改了什么

g4v1_u1 Stage 3「学习句型」从展示型朗读改成训练型三选一。8 句中 6 句训练 + 2 句朗读保留。A/B 双卡解锁流不动。

| 文件 | 动作 |
|---|---|
| `src/data/primaryHub/sentence/g4v1_u1_grammar.json` | 8 句加 `training` 字段（A1-A4 + B1/B2 训练；B3/C1 标 skip_chant） |
| `src/lib/primaryHub/sentenceTypes.ts` | 加 `SentenceTrainingType` / `SentenceTrainingOption` / `SentenceTraining`，给 `SentenceItem` 加可选 `training?:` |
| `src/lib/primaryHub/types.ts` | `UnitState` 加可选 `sentenceFirstCorrect?: string[]`（满星徽章用） |
| `src/components/primaryHub/SentenceLessonStage.tsx` | 加 `TrainingCard` 渲染分支 + 接 `onAwardPoints` + `markFirstCorrect` + 满星徽章 |
| `src/pages/primaryHub/PrimaryHubStagePlay.tsx` | 给 SentenceLessonStage 传 `onAwardPoints={(n)=>{for...addStar()}}` |
| `src/lib/primaryHub/storage.ts` | `loadPersist` 加一次性 stage3 v2 进度迁移钩子（同步、flag 守护、立即落盘） |
| `src/lib/primaryHub/registry.test.ts` | 新增 2 条 g4v1_u1 training 断言 |

## 验收清单

- [x] g4v1_u1 grammar.json 格式合法（`JSON.parse` 通过）
- [x] A 卡 4 句都有 training 且 type ≠ skip_chant（listening_response / fill_word / sentence_choice / structure_transfer）
- [x] B 卡 B3/C1 标 skip_chant，走原朗读 `SentenceCard`（截图证实无选项）
- [x] 解锁流不变：B `lockedUntil:"A"` 保留；组件 `modA/modB`、`aCount/bCount`、`isSubmoduleUnlocked` 逻辑**未改**（只在 sentences.map 里加渲染分支）
- [x] `toHaveLength(2)`（g4v1_u1）测试通过
- [x] g4v2_u1 的 `subModules[0].id==="A"` / `subModules[1].lockedUntil==="A"` 测试通过
- [x] `__getSentenceLessonsForTest().toHaveLength(8)` 通过（没新增 grammar 文件）
- [x] 新增 2 条 training 断言通过
- [x] 测试基线 **105 通过**（原 103 + 新增 2）/ 10 个 yak-shaving i18n 失败不变（零新增）；registry 31 tests
- [x] 其他 grammar.json（g4v1_u2 / g4v2_u1-u6）git diff 为空
- [x] grade4.json git diff 为空（未动）
- [x] TypeScript `tsc --noEmit` 通过

## 题型对照

| ID | tag | training.type | 满分 |
|---|---|---|---|
| A1 | A Let's talk | listening_response | 10 |
| A2 | A Let's talk | fill_word | 10 |
| A3 | A Let's talk | sentence_choice | 10 |
| A4 | A Let's learn | structure_transfer | 10 |
| B1 | B Let's talk | listening_response | 10 |
| B2 | B Let's talk | listening_response | 10 |
| B3 | B Let's talk | **skip_chant** | 0 |
| C1 | Let's chant · 歌谣 | **skip_chant** | 0 |

A 卡 40 + B 卡 20 = **全关满分 60 ⭐**（答对 +10 / 重试对 +5 / 揭晓 +0，经 `onAwardPoints` 调用现有 `addStar`，不碰 `completeStage`/`stars` 共用机制；关卡完成另由 completeStage +5）。

## 旧进度迁移（storage.ts `migrateStage3V2`，grade 4 only）

首次 hydrate（`loadPersist`）时，若迁移 flag 未设：
- `units["g4v1_u1"].sentenceCompleted = []`
- `units["g4v1_u1"].sentenceFirstCorrect = []`（防御性，见下「实现说明」第 4 条）
- `completedStages` 移除 3、`stageProgress[3] = 0`
- `stars` **不变**（关卡分不剥夺）
- 有改动时立即 `localStorage.setItem` 落盘（同步、不在 useEffect，无闪烁），并写 flag `primary_hub_v1_stage3_v2_migrated`

## 截图（7 张，390×844 本地实拍）

1. `pick_view.png` — A/B 双卡 pick 视图（解锁流保留）
2. `a1_question.png` — A1 listening_response 答题前（promptZh + 3 选项 + 🔊）
3. `a1_wrong_first.png` — A1 第一次答错：红框 + 「💡 再试一次？」，**不揭晓答案**
4. `a1_correct.png` — A1 答对：正确项绿、干扰项暗、揭晓英文/中文/回答 + StarBurst
5. `a4_structure.png` — A4 structure_transfer：🎬 scenarioZh + promptZh + 3 选项
6. `b3_skip_chant.png` — 句3 B3「Thank you.」/ 句4 C1 歌谣走原朗读（🔊 + 点击展开，无选项），对照 句2 B2 训练有选项
7. `a_module_starred.png` — A 卡 4/4 ✓ + 🌟 满星徽章（4 题首次全对，stars=40）

定位/交互数据见 `capture-console.txt`（含 `starred=true`）。

## ⚠️ 实现说明 / 与指令包的偏差（请审）

1. **类型名是 `SentenceItem`**（指令包写的是 `Sentence`）——给 `SentenceItem` 加了 `training?:`，效果一致。
2. **module 视图保持「卡片列表」，未改成单题 stepper**：现有组件把一个 submodule 的所有句子作为竖直卡片列表一次性渲染。按「只加渲染分支、不改 module 结构/解锁流」的硬约束，训练卡也在列表里，每张独立完成。§5.2 的「答对 1.5s 自动进入下一题」在列表布局下落地为「答对即标记完成 + 内联揭晓」；revealed（连错 2 次）显示「继续 →」。**如果要单题 stepper，是更大改动，等你拍板。**
3. **选项未做「听音后才可点」的硬门槛**：选项始终可点，🔊 按钮显著（更简单、可访问）。§5.2 表格里的「听音播放过→选项可点」未强制。
4. **迁移额外清了 `sentenceFirstCorrect`**：测试时发现迁移只清 `sentenceCompleted` 会让"满星"状态语义残留（生产中老用户无此新字段，本是无害），防御性地一并清空，属迁移「重置 g4v1_u1 Stage 3 进度」意图之内。
5. **pick 视图顶部「A: {aCount}/3 | B: {bCount}/3」的 `/3` 是写死的既有文案**（A 实际 4 句，故显示「4/3」）。按「不要触碰 aCount/bCount」约束**未改**；每张卡的进度条用的是正确的 `{count}/{total}`（显示 4/4）。建议后续单独清理这行文案。
6. **满星彩蛋为最简实现**（🌟 满星徽章 + 「🎉🌟 满星通关！」横幅，纯 inline className，无第三方库），符合 §12.4「最简、清晰可用」。

## 回滚

`git revert <commit>`。grammar.json / 组件 / 迁移钩子随 commit 一起回退；迁移 flag 失效后老用户重进 Stage 3 看到旧朗读模式（sentenceCompleted 已被清，重做一遍，可接受）。
