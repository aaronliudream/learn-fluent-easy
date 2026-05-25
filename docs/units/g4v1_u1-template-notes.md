# g4v1_u1 · Unit 1 样板说明（My classroom）

> **定位**：四年级上册**首个样板 Unit**；U2–U6 沿用本文件 + `docs/units/g4v2_u2-template-notes.md`（铁律 1–7）。  
> **活数据**：`scripts/content/g4v1_u1_unit.json` · `grade4.json` → `grade4_volume1` · commit `c237bab6` 起。

## Phonics（任务 4b 前跳过）

四上 U1 无拼读 Tab；未接入 `phonics/g4v1_u1_*`。

## 口语语速（hubSpeakSpeed）

全 Hub 默认 **0.85**（`hubSpeakSpeed.ts`）。本 Unit 无单独 JSON 字段。

## 题干文案（finalQuiz · 无音频选择题）

| 场景 | 标准题干 | 说明 |
|------|----------|------|
| **看中文选英文** | `看中文选词：「{中文释义}」` | 禁止「听意思选词」、禁止「「XX」是什么意思？」 |
| **真听音选词** | s2 `listenWord` | UI：「🎧 听一听，是哪个单词？」 |
| **真听音选句** | s6 `listenSent` | UI：「🎧 听一听，是哪一句？」 |

`FinalQuizStage` 只渲染 `q` 文字，**不会**播放题干音频。

## 出题铁律（finalQuiz · 四上 U1 起与四下对齐）

铁律 **1–7** 全文见 [`g4v2_u2-template-notes.md`](./g4v2_u2-template-notes.md)。四上 U1 无货币混用场景，铁律 7 重点查**中文自然度**与**题干不剧透答案动作**。

---

## a. Vocab Tab 设计定稿

**词数**：核心黑体 **11** + 拓展白体 **5** = 16 条（`vocabulary` 数组）；介词 **in / on / under** 不进 Tab，只进句型 / 读写 / 终测。

| Tab | 名称 | 词数 | indices | 课本页 |
|-----|------|------|---------|--------|
| Tab 1 | 教室陈设 | 6 | 0–5 | p.5 |
| Tab 2 | 教室设施 | 5 | 6–10 | p.8 |
| Tab 3 | 拓展词 | 5 | 11–15 | p.4–7 白体 |

### Tab 1 · 教室陈设（6）

| en | cn | emoji | 选择说明 |
|----|-----|-------|----------|
| classroom | 教室 | 🏫 | 场景总称 |
| window | 窗户 | 🪟 | 勿用 🏠（易混「家」） |
| blackboard | 黑板 | ⬛ | **勿用 📝**（与 notebook 混） |
| light | 电灯 | 💡 | Story 蜜蜂落点 |
| picture | 图画 | 🖼️ | |
| door | 门 | 🚪 | 颜色句型锚点 |

### Tab 2 · 教室设施（5）

| en | cn | emoji | 选择说明 |
|----|-----|-------|----------|
| teacher's desk | 讲台 | 🧑‍🏫 | **勿用 🪑**（与 chair 混） |
| computer | 计算机 | 💻 | |
| fan | 风扇 | 🌀 | Story 第二落点 |
| wall | 墙壁 | 🧱 | Story 第三落点 |
| floor | 地板 | 🟫 | 歌谣 Four walls and a floor |

### Tab 3 · 拓展听说（5）

| en | cn | emoji |
|----|-----|-------|
| really | 真的 | 😮 |
| near | 在……旁边 | 📍 |
| TV | 电视 | 📺 |
| clean | 打扫 | 🧹 |
| help | 帮助 | 🤝 |

**上线**：`"published": true`（四上首单元，验收后直接生产可见）。

---

## b. 跨 Unit recall 钩子定义（本 Unit 只埋点、不 recall）

U1 是四上**首单元**，finalQuiz **不**出现 `u2:` / `u3:` 等回考题。  
以下 `point` 供 **U2–U6**（及四下）选题时复用，**须重新设计题干**，禁止复制 U1 原题。

| point tag | 语义 | U1 埋点题号 | 后续 recall 可考 |
|-----------|------|-------------|------------------|
| `u1:recall_classroom_item` | 教室物品词义（陈设 + 设施） | 101, 102, 103, 111 | 看中文选词 / 听音辨词；干扰项同「教室物品」场 |
| `u1:recall_room_item` | 教室功能句（参观、打扫、帮忙） | 105, 106, 107 | What's in… / Let's clean / Let me…；角色须写清 |
| `u1:recall_position` | 位置介词答句（near / on / under / in） | 108, 109 | 题干给**位置线索**（旁边 / 上方），选项为完整位置句 |
| `u1:recall_color` | 颜色 + 物品描述句 | 110 | **单独 tag**，勿并入 position；题干锚定「门 + 橙色」等 |

---

## c. finalQuiz 10 题考点矩阵

**原则**：10–12 题灵活，**考点不重复**优先于凑满 12；无 `u*:recall_*` 入题（仅 U1 自身 tag）。

| 题号 | 题型 | point | 干扰策略 | 铁律要点 |
|------|------|-------|----------|----------|
| 101 | 看中文选词 | classroom_item | window / door / blackboard / picture | 教室陈设场 |
| 102 | 看中文选词 | classroom_item | computer / fan / light / wall | 教室设施场 |
| 103 | 看中文选词 | classroom_item | teacher's desk / computer / blackboard / floor | 讲台易混 desk/blackboard |
| 105 | 情境选句 | room_item | What’s in… vs Where / clean / near | Mike→Sarah；「想知道里面有什么」 |
| 106 | 情境选句 | room_item | Let me clean windows vs help / where / on light | **不写「擦窗户」**；写「抹布 + 走到窗户前」 |
| 107 | 情境选句 | room_item | Let me help you vs clean / where / Really? | **不写「想帮他」**；写「搬讲台脸红」 |
| 108 | 情境选句 | position | near window vs on light / under desk / What’s in | John→Sarah；「窗户旁边」 |
| 109 | 情境选句 | position | on light vs on fan / near window / under desk | Story；「电灯上方」 |
| 110 | 情境选句 | color | door orange vs floor/wall orange / fan green | **指着橙色的门**；四选项皆为 X is/are 颜色句 |
| 111 | 看中文选词 | classroom_item | wall / floor / fan / window | 补 p.8 floor |

**刻意未设**：104（clean 看中文题）— 白体不占 vocab 槽，clean 由 106 + readWrite 覆盖。

---

## d. 本 Unit 踩过的修改（教训清单）

| 问题 | 反例 | 正例 / 规则 |
|------|------|-------------|
| **铁律 6 剧透** | 106「她会说：擦窗户」 | 「拿起抹布，走到窗户前」— 给场景不剧透英文动作 |
| **铁律 6 剧透** | 107「想帮他」 | 「搬讲台，脸都红了」— 暗示需 help，不写「帮」 |
| **凑数 vocab 题** | 104 看中文选「打扫」 | 删除；B 句型 106 已考 clean |
| **颜色 tag 混用** | 110 并入 `recall_position` | 拆出 `u1:recall_color`（U2 有颜色课，路径清晰） |
| **颜色干扰照搬课文** | 干扰项 `The desks are green.` | 改为 `The floor is orange.` 等；四选项同句式，靠题干「门」锚点 |
| **emoji 语义撞车** | blackboard 📝、desk 🪑 | 见 §a 表「选择说明」 |

---

## e. 后续 U2–U6 沿用建议

1. **开工顺序**：读本文件 Tab/钩子 + `g4v2_u2-template-notes.md` 铁律 1–7 → 出 finalQuiz 大纲审过 → 再写 JSON。  
2. **emoji**：一词一义、避免跨 Unit 撞车（📝 留给 notebook、🪑 留给 chair）；禁止 📘。  
3. **剧透检查清单**（情境题写完必过一遍）：
   - 题干是否出现正确答案的**英文原词**？（铁律 1）
   - 题干是否写出**唯一正确动作/答句**的中文同义？（如「擦窗户」「想帮他」）
   - 学生能否**不读选项**就从题干猜对？若能 → 改线索、减剧透
4. **finalQuiz 题量**：10–12 弹性；**考点不重复** > 凑 12。  
5. **跨 Unit recall**：U2+ 每单元至少埋本单元 tag；recall 他单元题须**新题干 + 铁律 6**，见四下 U5/U6 做法。  
6. **介词 / 句型词**：课本白体若已在句型关高频出现，可不单独占 vocab 槽（U1：in/on/under）。  
7. **phonics**：任务 4b 前一律跳过；歌谣在 s4 submodule B，`Let's chant · 歌谣`。  
8. **readWrite**：仅 `fill_choice`；介词/句型在读写关练，不依赖图片。

## 产品阶段映射（8 关 · 无 phonics Tab）

| 规格名 | stage | type |
|--------|-------|------|
| vocab | s1 | vocab |
| vocabQuiz | s2–s3, s5 | listenWord, match, write |
| listen | s6 | listenSent |
| speak | s4 | sentence（含歌谣） |
| readWrite | s7 | readWrite |
| finalQuiz | s8 | finalQuiz |

## 数据文件

| 用途 | 路径 |
|------|------|
| Unit 源 JSON | `scripts/content/g4v1_u1_unit.json` |
| 注入 | `python scripts/content/patch_g4v1_u1.py` |
| 句型 | `src/data/primaryHub/sentence/g4v1_u1_grammar.json` |
| 读写 | `src/data/primaryHub/readWrite/g4v1_u1_read_write.json` |
| 课程挂载 | `src/data/primaryHub/grade4.json` → `grade4_volume1` |

## Tech Debt

与四下相同：独立 chant 阶段未支持；歌谣仅在 s4 submodule B 末尾。
