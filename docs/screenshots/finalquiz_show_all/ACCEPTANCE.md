# finalQuiz 展示题数修复 ACCEPTANCE · 分支 `cursor/finalquiz-show-all`

## 问题
finalQuiz 组件用 `shuffleArray([...unit.quizQuestions]).slice(0, 12)` 限制单次展示 12 题。四上 Let's do 补全（PR #55）后，U1/U2/U4/U5 各 13 题，每次随机漏 1 题；v2 部分 unit 题数 ≥ 12 也受影响。`12` 是历史拍脑袋值，无理论依据。

## 修复
去掉 `.slice(0, 12)`，展示全部 `quizQuestions`。**保留 `shuffleArray`**（顺序仍随机，防娃背题号顺序）。

## 改动
- 改了 **1 个文件**：`src/pages/primaryHub/PrimaryHubStagePlay.tsx`（`finalQuizQuestions` useMemo）
- 改动 **1 行**：`return shuffleArray([...unit.quizQuestions]).slice(0, 12);` → `return shuffleArray([...unit.quizQuestions]);`
- 数据文件未动（grade4.json 字节不变）；registry.test.ts 未动

> 说明：仓库里其它 `slice(0, 12)`（MasteryDashboard / WeeklyDigest / I18nProvider / Gaokao* / Junior*）与 finalQuiz 无关，**未触碰**（风险提示 #1）。listeningQuestions 的 `slice(0, 6)` 也未动。

## 影响范围

| Unit | 修复前每次展示 | 修复后每次展示 |
|---|---|---|
| g4v1_u1 | 12 / 13（漏 1） | 13 / 13 |
| g4v1_u2 | 12 / 13（漏 1） | 13 / 13 |
| g4v1_u3 | 10 / 10 | 10 / 10（不变） |
| g4v1_u4 | 12 / 13（漏 1） | 13 / 13 |
| g4v1_u5 | 12 / 13（漏 1） | 13 / 13 |
| g4v1_u6 | 10 / 10 | 10 / 10（不变） |
| g4v2_u1 | 12 / 15（漏 3） | 15 / 15 |
| g4v2_u2–u6 | 12 / 12 | 12 / 12（不变） |

## 验收清单
- [x] 改动只动 1 个组件文件、1 行
- [x] grade4.json 字节不变
- [x] registry.test.ts 不动
- [x] 测试基线 **103 通过**，yak-shaving 10 个无关失败不变（registry 29 通过）
- [x] 截图证实 U4 显示「第 1 / 13 题」（`u4_finalquiz_13_questions.png`）
- [x] 截图证实 U6 显示「第 1 / 10 题」对照组（`u6_finalquiz_10_questions.png`，小题量 unit 不受影响）
- [x] shuffleArray 保留：U4 finalQuiz 连刷 3 次首题为 `["钥匙放在冰箱…","看中文选词：「冰箱」","钥匙放在冰箱…"]`，顺序确实随机变化（varied=true）

定位/校验数据见 `capture-console.txt`：`[u4] counter="第 1 / 13 题" ok=true`、`[u6] counter="第 1 / 10 题" ok=true`、`[u4 shuffle] varied=true`。

## 截图
1. `u4_finalquiz_13_questions.png` — U4 finalQuiz 首屏「第 1 / 13 题」（修复后展示全部）
2. `u6_finalquiz_10_questions.png` — U6 finalQuiz 首屏「第 1 / 10 题」（对照组，行为不变）
