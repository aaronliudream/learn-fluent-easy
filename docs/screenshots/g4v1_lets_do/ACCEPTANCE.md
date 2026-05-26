# 四上 Let's do 补全 ACCEPTANCE · 分支 `cursor/g4v1-lets-do-supplement`

## 范围
- 课本：PEP 三年级起点 四年级上册
- 涉及 unit：U1(p.5) / U2(p.15) / U4(p.39) / U5(p.52)
- 不涉及：U3（无 Let's do，是 Let's chant）、U6（无 Let's do，是 Let's count / Draw and say）
- 落地位置：readWrite Tab（append 新题）+ finalQuiz（扩原区间，每 unit +3 题）

## 4 个新锚
- `u1:recall_classroom_action` — 教室祈使动作（open/close/turn on/put up/clean）
- `u2:recall_putobject_position` — 物品+方位（Put X in/on/under/near Y）
- `u4:recall_room_activity` — 房间+活动（go to + room + activity）
- `u5:recall_utensil_action` — 餐具操作（pass me / use the / cut the）

## 数量（实际落地）

| unit | Let's do 短语 | readWrite 新增 | readWrite 总 | finalQuiz 新增 | finalQuiz 总 | 新 quiz id |
|---|---|---|---|---|---|---|
| U1 | 5 | 5 | 11 | 3 | 13 | 112 / 113 / 114 |
| U2 | 4 | 4 | 10 | 3 | 13 | **213 / 214 / 215** |
| U4 | 5 | 5 | 11 | 3 | 13 | 412 / 413 / 414 |
| U5 | 5 | 5 | 11 | 3 | 13 | 512 / 513 / 514 |

readWrite 新增 19 题、finalQuiz 新增 12 题，全部 fill_choice / single-answer，全部挂对应新锚。

## ⚠️ 执行中发现并处理的 3 件事（请审）

### 1. U2 finalQuiz id 改 213-215（不是指令包的 212-214）
指令包按"现有最大 id = N11"规划。实测 **U2 现有 ids = `[201,202,203,205,206,207,208,210,211,212]`，212 已被占用**（U2 max 是 212）。继续用 212 会撞号。patch 脚本改为「每 unit 取现有 max id + 1/2/3」自动算号：U1/U4/U5 与指令包一致（112-114 / 412-414 / 512-514），**U2 = 213/214/215**。

### 2. 发现 U6 finalQuiz 在 main 上是「未平衡」状态（本 PR 已规避，未改 U6）
跑 `rebalance_quiz_answers.py`（处理全部 unit）时发现它会改动 `g4v1_u6`——因为 **U6 在 main 上的 finalQuiz 答案分布是 4/4/2/0（未平衡）**。根因：U6 那轮改中文释义时重跑了 `patch_g4v1_u6.py`（从 unit.json 重新注入，答案位置回到 unit.json 的原始值），按"只改 cn 不重跑 rebalance"未再平衡，于是未平衡版被 merge 进 main（PR #54）。

**本 PR 严格按"U6 字节不动"纪律：rebalance 后把 U6 区块还原成 main 的状态**，本 PR 的 grade4.json diff 只含 u1/u2/u4/u5。U6 的平衡问题**留作单独小 PR**（跑一次 rebalance 即可，或修根因：rebalance 应同步回写 unit.json，或 cn 编辑不重新注入）。

### 3. finalQuiz 单次最多显示 12 题（既有逻辑，加题后 13>12 触发）
`PrimaryHubStagePlay` 里 `finalQuizQuestions = shuffleArray(quizQuestions).slice(0, 12)`。各 unit 现有 13 题，**每次答题随机展示其中 12 题**（随机漏 1 题）。这是既有代码、非本 PR 引入，但加题到 13 后会触发"娃某次可能看不到某一道题"。**若要保证 13 题全展示，需把 slice(0,12) 提到 ≥13 或改为全展示**——属代码改动，留给产品决策（建议进 backlog）。

## 验收清单
- [x] 4 个 readWrite JSON questions 末尾各 append 新题，totalPoints 同步（U1/U4/U5=11、U2=10）
- [x] grade4.json 里 U1/U2/U4/U5 的 quizQuestions 各 +3 题
- [x] 新 quiz id：112-114 / 213-215 / 412-414 / 512-514（U2 因 212 占用顺延，见上）
- [x] 4 个新锚 point 字段写入，挂载正确（每锚 readWrite + quiz 题数见数量表）
- [x] rebalance_quiz_answers.py + rebalance_readwrite_answers.py 跑过
- [x] 答案分布均衡：finalQuiz 四单元均 4/3/3/3（31%）；readWrite 均衡（U1/U4/U5 4/4/3、U2 4/3/3），不再全 A
- [x] 新题完整性校验：12 道新 quiz 正确答案文本 0 mismatch；correct 标记跟随正确选项
- [x] U3/U6 未受影响（grade4.json 里 g4v1_u3 / g4v1_u6 字节不变；v2 全部不变）
- [x] 中文释义口语化简版（open the door=打开门 / have a nap=睡一觉）
- [x] 截图 5 张
- [x] 测试基线：registry 29 通过；全量 103 通过 / 10 个 yak-shaving i18n 失败不变（零新增）
- [x] patch_lets_do.py 幂等（重跑 +0，已验证）

> 注：rebalance 是按 unit 整体重排，所以 u1/u2/u4/u5 的 readWrite/finalQuiz **原有题的选项顺序也会被重新均衡**（不只是末尾新题）。这是 rebalance 的预期行为；correct 标记/answer 始终跟随正确选项，语义不变。

## 截图（docs/screenshots/g4v1_lets_do/）
1. `u1_readwrite_lets_do.png` — U1 readWrite 第 7/11 题「Open the ___ .」(door)，提示「打开门」，标题「6/11 分」证 totalPoints 已更新
2. `u2_readwrite_position.png` — U2 readWrite 第 7/10 题「Put your Chinese book ___ your desk.」(in)，提示「把语文书放进书桌里」
3. `u4_readwrite_room.png` — U4 readWrite 第 7/11 题「I want to watch TV. Go to the ___ .」(living room)
4. `u5_readwrite_utensil.png` — U5 readWrite 第 7/11 题「Pass me the ___ .」(bowl)
5. `u4_finalquiz_413.png` — U4 finalQuiz q413「Go to the kitchen. Have a ___ .」考点角标 `u4:recall_room_activity`，选项 snack/nap/shower/book

DOM 片段与定位数据见 `capture-console.txt`（5 项 ok=true）。

## 风险与已知问题
- 未在 vocab Tab 加 Let's do 短语（动作短语非单词，沿用"vocab Tab = 课本黑体单词"契约）
- 未给 Let's do 开独立 stage（决策 1C 并进 readWrite）
- finalQuiz 题号 N12+ 扩了原区间，原跳 N06 规则不变
- 见上「发现 3 件事」：U2 id 顺延、U6 main 未平衡（单独 PR）、finalQuiz 12 题展示上限

## 复现命令
```bash
python scripts/content/patch_lets_do.py          # 幂等
python scripts/content/rebalance_quiz_answers.py
python scripts/content/rebalance_readwrite_answers.py
npm test
```
