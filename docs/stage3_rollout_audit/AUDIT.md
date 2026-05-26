# 四上 + 四下 Stage 3 全量内容 Audit（只读）

> 只读调研，未改任何代码/数据。main `4c6afc50`（含 U1 Stage 3 training PR #58）。
> 目的：为 Stage 3 训练模式向其余单元铺开做盘点。

## 摘要 · 铺开矩阵（最重要）

Stage 3（`type:"sentence"`，URL `.../stage/3`）有两条数据/渲染路径：
- **有 `sentence/<unit>_grammar.json`** → 走 `SentenceLessonStage`（A/B 子模块 + 解锁流）。training 字段可选；有 training 走训练模式，无 training 走原朗读。
- **无 grammar.json** → 走旧 `SentenceStage`（吃 `grade4.json` 的 `unit.dialogues`），纯展示朗读，无子模块、无 training 能力。

| Unit | 学期 | 标题 | grammar.json | training | Stage 3 当前路径 | 铺开工作量 |
|---|---|---|---|---|---|---|
| g4v1_u1 | 四上 | My classroom | ✅ | ✅ **已改** | SentenceLessonStage 训练 | — 已完成（PR #58） |
| g4v1_u2 | 四上 | My schoolbag | ✅ | ❌ | SentenceLessonStage 朗读 | **Tier 1**：只加 training 字段 |
| g4v1_u3 | 四上 | My friends | ❌ | — | **SentenceStage（dialogues fallback）** | **Tier 2**：先建 grammar.json 再加 training |
| g4v1_u4 | 四上 | My home | ❌ | — | SentenceStage（dialogues fallback） | Tier 2 |
| g4v1_u5 | 四上 | Dinner's ready | ❌ | — | SentenceStage（dialogues fallback） | Tier 2 |
| g4v1_u6 | 四上 | Meet my family! | ❌ | — | SentenceStage（dialogues fallback） | Tier 2 |
| g4v2_u1 | 四下 | My School | ✅ | ❌ | SentenceLessonStage 朗读 | Tier 1 |
| g4v2_u2 | 四下 | What time is it? | ✅ | ❌ | SentenceLessonStage 朗读 | Tier 1 |
| g4v2_u3 | 四下 | Weather | ✅ | ❌ | SentenceLessonStage 朗读 | Tier 1 |
| g4v2_u4 | 四下 | At the farm | ✅ | ❌ | SentenceLessonStage 朗读 | Tier 1 |
| g4v2_u5 | 四下 | My clothes | ✅ | ❌ | SentenceLessonStage 朗读 | Tier 1 |
| g4v2_u6 | 四下 | Shopping | ✅ | ❌ | SentenceLessonStage 朗读 | Tier 1 |

- **Tier 1（7 个，已有 grammar.json，只需加 training）**：g4v1_u2 + g4v2_u1–u6。
- **Tier 2（4 个，无 grammar.json，要先从 dialogues 造 grammar.json 再加 training）**：g4v1_u3/u4/u5/u6。
- 注意 grammar.json 的 subModules 数量被组件/测试写死为 2（A/B）；测试 `__getSentenceLessonsForTest().toHaveLength(8)` 写死现有 8 个文件，**Tier 2 新增 grammar 文件会让这个断言变化**（8 → 最多 12），铺开时要同步改。

---

## 1. 全部 grammar.json 文件 + training 标注

`ls src/data/primaryHub/sentence/*.json`：

| 文件 | 是否含 `training` 字段（是否已 U1 式改造） |
|---|---|
| `g4v1_u1_grammar.json` | ✅ HAS training（已改造） |
| `g4v1_u2_grammar.json` | ❌ no training |
| `g4v2_u1_grammar.json` | ❌ no training |
| `g4v2_u2_grammar.json` | ❌ no training |
| `g4v2_u3_grammar.json` | ❌ no training |
| `g4v2_u4_grammar.json` | ❌ no training |
| `g4v2_u5_grammar.json` | ❌ no training |
| `g4v2_u6_grammar.json` | ❌ no training |

共 8 个 grammar.json。**g4v1_u3 / u4 / u5 / u6 没有 grammar.json**（见第 4、5 节，走 dialogues fallback）。

---

## 2. 七个 grammar.json 完整内容（verbatim）

### 2.1 `g4v1_u2_grammar.json`（My schoolbag · A 2 句 / B 5 句含 2 歌谣）
```json
{
  "lessonId": "g4v1_u2_grammar", "unitId": "g4v1_u2", "stageIdx": 3, "title": "学习句型",
  "transitionMessage": "Amy 和 Wu Binbin 看新书包，Tom 去失物招领，一起来练吧～",
  "subModules": [
    { "id": "A", "title": "书包里有什么 · What's in your schoolbag?", "description": "Amy 介绍新书包，Wu Binbin 问里面有什么，看见熊猫书包。", "color": "blue", "estimatedMinutes": 4,
      "sentences": [
        { "id": "A1", "question": { "en": "I have a new schoolbag.", "zh": "我有一个新书包。" }, "answer": { "en": "Really? What's in your schoolbag?", "zh": "真的吗？你的书包里有什么？" }, "tag": "A Let's talk" },
        { "id": "A2", "question": { "en": "An English book, a maths book and three storybooks.", "zh": "一本英语书、一本数学书和三本故事书。" }, "answer": { "en": "Wow! It's a panda!", "zh": "哇！是熊猫（书包）！" }, "tag": "A Let's talk" }
      ] },
    { "id": "B", "title": "失物招领 · lost / colour / What's in it", "description": "Tom 丢了书包，说明颜色和内容，工作人员归还书包。", "color": "pink", "estimatedMinutes": 5, "lockedUntil": "A",
      "sentences": [
        { "id": "B1", "question": { "en": "Excuse me. I lost my schoolbag.", "zh": "打扰一下，我丢了书包。" }, "answer": { "en": "What colour is it?", "zh": "它是什么颜色的？" }, "tag": "B Let's talk" },
        { "id": "B2", "question": { "en": "It's blue and white.", "zh": "蓝白色的。" }, "answer": { "en": "What's in it?", "zh": "里面有什么？" }, "tag": "B Let's talk" },
        { "id": "B3", "question": { "en": "An English book, two toys and a key.", "zh": "一本英语书、两个玩具和一把钥匙。" }, "answer": { "en": "Here it is!", "zh": "给你！" }, "tag": "B Let's talk" },
        { "id": "C1", "question": { "en": "Oh no! My bag is heavy!", "zh": "哦不！我的包好重！（歌谣）" }, "answer": { "en": "Oh no! My bag is heavy!", "zh": "哦不！我的包好重！（歌谣）" }, "tag": "Let's chant · 歌谣" },
        { "id": "C2", "question": { "en": "What do you have in your schoolbag?", "zh": "你的书包里有什么？（歌谣）" }, "answer": null, "tag": "Let's chant · 歌谣" }
      ] }
  ]
}
```

### 2.2 `g4v2_u1_grammar.json`（My School · A 3 句 / B 3 句）
```json
{
  "lessonId": "g4v2_u1_grammar", "unitId": "g4v2_u1", "stageIdx": 3, "title": "学习句型",
  "transitionMessage": "Mike 把朋友带进了学校，准备介绍校园啦~",
  "subModules": [
    { "id": "A", "title": "问路 · 找教师办公室", "description": "Mike 要给 Miss White 交作业，他在找教师办公室。", "color": "blue", "estimatedMinutes": 3,
      "sentences": [
        { "id": "A1", "question": { "en": "Excuse me. Where's the teachers' office?", "zh": "请问，教师办公室在哪里？" }, "answer": { "en": "It's on the second floor.", "zh": "在二楼。" }, "tag": "A Let's talk" },
        { "id": "A2", "question": { "en": "Is this the teachers' office?", "zh": "这是教师办公室吗？" }, "answer": { "en": "No, it isn't. The teachers' office is next to the library.", "zh": "不，不是。教师办公室挨着图书馆。" }, "tag": "A Let's talk" },
        { "id": "A3", "question": { "en": "OK. Thanks.", "zh": "好的，谢谢。" }, "answer": null, "tag": "A Let's talk" }
      ] },
    { "id": "B", "title": "参观 · 介绍我的学校", "description": "Mike 带朋友参观自己的学校，介绍各个场所。", "color": "pink", "estimatedMinutes": 3, "lockedUntil": "A",
      "sentences": [
        { "id": "B1", "question": { "en": "Welcome to our school! This is my classroom.", "zh": "欢迎来到我们学校！这是我的教室。" }, "answer": null, "tag": "B Let's talk" },
        { "id": "B2", "question": { "en": "Do you have a library?", "zh": "你们(学校)有图书馆吗？" }, "answer": { "en": "Yes, we do. It's on the second floor.", "zh": "是的，有。它在二楼。" }, "tag": "B Let's talk" },
        { "id": "B3", "question": { "en": "How many students are there in your class?", "zh": "你们班有多少学生？" }, "answer": { "en": "Forty-five students.", "zh": "45 个学生。" }, "tag": "B Let's talk" }
      ] }
  ]
}
```

### 2.3 `g4v2_u2_grammar.json`（What time is it? · A 3 句 / B 5 句含 2 歌谣）
```json
{
  "lessonId": "g4v2_u2_grammar", "unitId": "g4v2_u2", "stageIdx": 3, "title": "学习句型",
  "transitionMessage": "Amy 和 Zhang Peng 在聊时间，一起来练口语吧～",
  "subModules": [
    { "id": "A", "title": "问时间 · What time is it?", "description": "Zhang Peng 想知道现在几点，Amy 告诉他整点时间。", "color": "blue", "estimatedMinutes": 4,
      "sentences": [
        { "id": "A1", "question": { "en": "What time is it?", "zh": "几点了？" }, "answer": { "en": "It's 7 o'clock.", "zh": "7 点了。" }, "tag": "A Let's talk" },
        { "id": "A2", "question": { "en": "What time is it now?", "zh": "现在几点？" }, "answer": { "en": "It's 8 o'clock.", "zh": "8 点了。" }, "tag": "A Let's talk" },
        { "id": "A3", "question": { "en": "It's time for breakfast.", "zh": "该吃早餐了。" }, "answer": null, "tag": "A Let's talk" }
      ] },
    { "id": "B", "title": "作息安排 · time for / time to", "description": "Schoolboy 提醒同学该上课、该回家了。", "color": "pink", "estimatedMinutes": 4, "lockedUntil": "A",
      "sentences": [
        { "id": "B1", "question": { "en": "It's 9 o'clock. It's time for English class.", "zh": "9 点了，该上英语课了。" }, "answer": null, "tag": "B Let's talk" },
        { "id": "B2", "question": { "en": "It's 4 o'clock. It's time to go home.", "zh": "4 点了，该回家了。" }, "answer": { "en": "OK. Let's go!", "zh": "好的，走吧！" }, "tag": "B Let's talk" },
        { "id": "B3", "question": { "en": "It's 9 p.m. It's time to go to bed.", "zh": "晚上 9 点了，该睡觉了。" }, "answer": null, "tag": "B Let's talk" },
        { "id": "C1", "question": { "en": "It's twelve o'clock. It's time for lunch.", "zh": "12 点了，该吃午餐了。" }, "answer": { "en": "It's three o'clock. It's time for PE class.", "zh": "3 点了，该上体育课了。" }, "tag": "Let's chant · 歌谣" },
        { "id": "C2", "question": { "en": "It's six o'clock. It's time for dinner.", "zh": "6 点了，该吃晚餐了。" }, "answer": null, "tag": "Let's chant · 歌谣" }
      ] }
  ]
}
```

### 2.4 `g4v2_u3_grammar.json`（Weather · A 3 句 / B 5 句含 2 歌谣）⚠️ 见注
```json
{
  "lessonId": "g4v2_u3_grammar", "unitId": "g4v2_u3", "stageIdx": 3, "title": "学习句型",
  "transitionMessage": "Mike 想出去玩，Chen Jie 和 Mark 在聊各地天气，一起来练口语吧～",
  "subModules": [
    { "id": "A", "title": "问天气 · What's the weather like?", "description": "Mark 问北京天气，Chen Jie 描述晴朗温暖。", "color": "blue", "estimatedMinutes": 4,
      "sentences": [
        { "id": "A1", "question": { "en": "What's the weather like in Beijing?", "zh": "北京天气怎么样？" }, "answer": { "en": "It's sunny and warm.", "zh": "晴朗又温暖。" }, "tag": "B Let's talk" },
        { "id": "A2", "question": { "en": "Is it windy?", "zh": "风大吗？" }, "answer": { "en": "No, it isn't. It's cloudy.", "zh": "不大，阴天。" }, "tag": "B Let's talk" },
        { "id": "A3", "question": { "en": "How about New York?", "zh": "纽约呢？" }, "answer": { "en": "It's rainy and cool.", "zh": "阴雨凉爽。" }, "tag": "B Let's talk" }
      ] },
    { "id": "B", "title": "许可与提醒 · Can I / Be careful", "description": "Mike 想出门，妈妈根据外面寒冷说不行。", "color": "pink", "estimatedMinutes": 4, "lockedUntil": "A",
      "sentences": [
        { "id": "B1", "question": { "en": "Mum, can I go outside now?", "zh": "妈妈，我现在能出去吗？" }, "answer": { "en": "No, you can't. It's cold outside.", "zh": "不行，外面很冷。" }, "tag": "A Let's talk" },
        { "id": "B2", "question": { "en": "Be careful!", "zh": "小心！" }, "answer": null, "tag": "A Let's talk" },
        { "id": "B3", "question": { "en": "It's 26 degrees.", "zh": "26 度。" }, "answer": null, "tag": "B Let's talk" },
        { "id": "C1", "question": { "en": "Thunder, thunder, clap clap clap!", "zh": "轰隆隆，打雷啦！（歌谣）" }, "answer": { "en": "Rain, rain, go away!", "zh": "雨啊雨，快走开！（歌谣）" }, "tag": "Let's chant · Thunder" },
        { "id": "C2", "question": { "en": "It's rainy and cool today.", "zh": "今天阴雨凉爽。（歌谣）" }, "answer": null, "tag": "Let's chant · Thunder" }
      ] }
  ]
}
```
> ⚠️ 数据瑕疵（铺开时建议顺手修）：A 模块 3 句的 `tag` 写成了 `"B Let's talk"`，B 模块 B1/B2 的 `tag` 写成了 `"A Let's talk"`——A/B 标签互串。不影响解锁流（解锁看 subModule.id，不看 tag），但训练模式若展示 tag 会显示错的小标签。

### 2.5 `g4v2_u4_grammar.json`（At the farm · A 3 句 / B 5 句含 2 歌谣）
```json
{
  "lessonId": "g4v2_u4_grammar", "unitId": "g4v2_u4", "stageIdx": 3, "title": "学习句型",
  "transitionMessage": "Mike 和 Sarah 在农场看蔬菜和动物，一起来练口语吧～",
  "subModules": [
    { "id": "A", "title": "近处 · What are these?", "description": "Mike 指着近处蔬菜问 Sarah，确认是不是胡萝卜、西红柿。", "color": "blue", "estimatedMinutes": 4,
      "sentences": [
        { "id": "A1", "question": { "en": "Look at these! Are these carrots?", "zh": "看这些！是胡萝卜吗？" }, "answer": { "en": "No.", "zh": "不是。" }, "tag": "A Let's talk" },
        { "id": "A2", "question": { "en": "What are these?", "zh": "这些是什么？" }, "answer": { "en": "They're tomatoes.", "zh": "是西红柿。" }, "tag": "A Let's talk" },
        { "id": "A3", "question": { "en": "Try some! They're good.", "zh": "尝一个，很好吃。" }, "answer": { "en": "Thanks. Yum.", "zh": "谢谢，真好吃。" }, "tag": "A Let's talk" }
      ] },
    { "id": "B", "title": "远处与数量 · those / How many", "description": "Sarah 问远处的动物，再数一数有多少匹马。", "color": "pink", "estimatedMinutes": 4, "lockedUntil": "A",
      "sentences": [
        { "id": "B1", "question": { "en": "What are those?", "zh": "那些是什么？" }, "answer": { "en": "Are they horses?", "zh": "它们是马吗？" }, "tag": "B Let's talk" },
        { "id": "B2", "question": { "en": "No, they aren't. They're ducks.", "zh": "不是，是鸭子。" }, "answer": null, "tag": "B Let's talk" },
        { "id": "B3", "question": { "en": "How many horses do you have?", "zh": "你有多少匹马？" }, "answer": { "en": "Seventeen.", "zh": "十七匹。" }, "tag": "B Let's talk" },
        { "id": "C1", "question": { "en": "I like tomatoes. I like potatoes.", "zh": "我喜欢西红柿、土豆。（歌谣）" }, "answer": { "en": "Carrots I will try.", "zh": "胡萝卜我也要尝。（歌谣）" }, "tag": "Let's chant · Vegetables" },
        { "id": "C2", "question": { "en": "But onions make me cry.", "zh": "洋葱让我流泪。（歌谣）" }, "answer": null, "tag": "Let's chant · Vegetables" }
      ] }
  ]
}
```

### 2.6 `g4v2_u5_grammar.json`（My clothes · A 3 句 / B 6 句含 3 歌谣）
```json
{
  "lessonId": "g4v2_u5_grammar", "unitId": "g4v2_u5", "stageIdx": 3, "title": "学习句型",
  "transitionMessage": "Amy 和 Mike 在教室整理衣物，一起来练 yours / whose 吧～",
  "subModules": [
    { "id": "A", "title": "是你的吗 · Are these yours?", "description": "Amy 问 Mike 地上的东西是不是他的，Mike 说明鞋子颜色并指出主人。", "color": "blue", "estimatedMinutes": 4,
      "sentences": [
        { "id": "A1", "question": { "en": "Are these yours, Mike?", "zh": "迈克，这些是你的吗？" }, "answer": { "en": "No, they aren't. My shoes are green. They're Chen Jie's.", "zh": "不是。我的鞋是绿色的。这些是陈杰的。" }, "tag": "A Let's talk" },
        { "id": "A2", "question": { "en": "Is this John's?", "zh": "这是约翰的吗？" }, "answer": { "en": "No, it isn't. It's Mike's.", "zh": "不是。是迈克的。" }, "tag": "A Let's talk" },
        { "id": "A3", "question": { "en": "I like that green skirt. Me too. And I like those pants.", "zh": "我喜欢那条绿裙子。我也是，还喜欢那条裤子。" }, "answer": null, "tag": "A Let's learn" }
      ] },
    { "id": "B", "title": "谁的 · Whose / 整理衣物", "description": "Mike 请 Sarah 帮忙辨认大衣和裤子是谁的，最后跟读整理衣物的歌谣。", "color": "pink", "estimatedMinutes": 5, "lockedUntil": "A",
      "sentences": [
        { "id": "B1", "question": { "en": "Sarah, can you help me, please?", "zh": "萨拉，你能帮帮我吗？" }, "answer": { "en": "OK.", "zh": "好的。" }, "tag": "B Let's talk" },
        { "id": "B2", "question": { "en": "Whose coat is this?", "zh": "这是谁的大衣？" }, "answer": { "en": "It's mine.", "zh": "是我的。" }, "tag": "B Let's talk" },
        { "id": "B3", "question": { "en": "And those? Whose pants are those?", "zh": "那些呢？那条裤子是谁的？" }, "answer": { "en": "They're Mike's.", "zh": "是迈克的。" }, "tag": "B Let's talk" },
        { "id": "C1", "question": { "en": "Hang up your dress.", "zh": "把你的连衣裙挂起来。（歌谣）" }, "answer": { "en": "Take off your hat.", "zh": "摘下你的帽子。（歌谣）" }, "tag": "Let's chant · 歌谣" },
        { "id": "C2", "question": { "en": "Put on your shirt.", "zh": "穿上你的衬衫。（歌谣）" }, "answer": { "en": "Wash your skirt.", "zh": "洗你的裙子。（歌谣）" }, "tag": "Let's chant · 歌谣" },
        { "id": "C3", "question": { "en": "Put away your pants.", "zh": "把你的裤子收好。（歌谣）" }, "answer": null, "tag": "Let's chant · 歌谣" }
      ] }
  ]
}
```

### 2.7 `g4v2_u6_grammar.json`（Shopping · A 3 句 / B 7 句含 2 歌谣）⚠️ 见注
```json
{
  "lessonId": "g4v2_u6_grammar", "unitId": "g4v2_u6", "stageIdx": 3, "title": "学习句型",
  "transitionMessage": "Sarah 和 John 在商店挑衣服鞋子，一起来练购物句型吧～",
  "subModules": [
    { "id": "A", "title": "帮忙与试穿 · Can I help you?", "description": "Sarah 在服装店看连衣裙，问价钱并试穿。", "color": "blue", "estimatedMinutes": 4,
      "sentences": [
        { "id": "A1", "question": { "en": "Can I help you?", "zh": "我能帮你吗？" }, "answer": { "en": "Yes. This dress is pretty. How much is it?", "zh": "是的。这条连衣裙很漂亮。多少钱？" }, "tag": "A Let's talk" },
        { "id": "A2", "question": { "en": "It's eighty-five yuan.", "zh": "八十五元。" }, "answer": { "en": "Can I try it on?", "zh": "我可以试穿吗？" }, "tag": "A Let's talk" },
        { "id": "A3", "question": { "en": "Sure.", "zh": "当然。" }, "answer": null, "tag": "A Let's talk" }
      ] },
    { "id": "B", "title": "尺码与价钱 · too / How much", "description": "John 试鞋换尺码，Sarah 和妈妈讨论围巾和裙子的价格。", "color": "pink", "estimatedMinutes": 5, "lockedUntil": "A",
      "sentences": [
        { "id": "B1", "question": { "en": "Yes. These shoes are nice. Can I try them on? Size 6, please.", "zh": "这双鞋很好看。我能试穿 6 号吗？" }, "answer": { "en": "No. They're too small.", "zh": "不行，太小了。" }, "tag": "B Let's talk" },
        { "id": "B2", "question": { "en": "Hmm. OK. Let's try size 7.", "zh": "嗯，试试 7 号。" }, "answer": { "en": "They're just right!", "zh": "正好合适！" }, "tag": "B Let's talk" },
        { "id": "B3", "question": { "en": "That scarf is pretty. How much is it?", "zh": "那条围巾很漂亮。多少钱？" }, "answer": { "en": "It's 10 yuan.", "zh": "十元。" }, "tag": "B Let's talk" },
        { "id": "B4", "question": { "en": "Yes. How much is this skirt?", "zh": "这条短裙多少钱？" }, "answer": { "en": "It's eighty-nine dollars.", "zh": "八十九美元。" }, "tag": "B Let's talk" },
        { "id": "B5", "question": { "en": "Sorry, Sarah. It's too expensive.", "zh": "对不起，太贵了。" }, "answer": null, "tag": "B Let's talk" },
        { "id": "C1", "question": { "en": "Today all sunglasses and gloves are five yuan!", "zh": "今天太阳镜和手套只要五元！（歌谣）" }, "answer": { "en": "They are very cheap.", "zh": "非常便宜。（歌谣）" }, "tag": "Let's chant · 歌谣" },
        { "id": "C2", "question": { "en": "We have many nice scarves, too — red, yellow, brown and more!", "zh": "还有许多好看的围巾——红的、黄的、棕的，还有更多！（歌谣）" }, "answer": { "en": "Come and see us today!", "zh": "今天来看看吧！（歌谣）" }, "tag": "Let's chant · 歌谣" }
      ] }
  ]
}
```
> ⚠️ 内容瑕疵（非本次范围，记一笔）：B4 的中文「八十九美元」/ 英文 "eighty-nine dollars" 与单元「yuan-only」基调不符（U6 之前有过 dollars→yuan 的修复 commit）。铺开训练时建议核对。

> 各 grammar 的 subModule 句数差异较大（A 多为 2-3 句，B 含歌谣后 5-7 句）。U1 训练改造的口径是「A 全训练 + B 部分训练 + 歌谣/客套句标 skip_chant」，铺开时每单元要人工挑哪些句子做 training、哪些 skip_chant。

---

## 3. 「g4v2 是不是四下」调研

**是。g4v2 = 人教版 PEP 四年级下册。** 证据：

- `grade4.json` 的 `semesters` 有两个键：
  - `grade4_volume1`（`name: "上册"`）→ 单元 g4v1_u1..u6
  - `grade4_volume2`（`name: "下册"`）→ 单元 g4v2_u1..u6
- `g4v2_u1` 元数据：`{ title: "My School", cn: "我的学校", emoji: "🏫" }`。其余 g4v2 主题：u2 What time is it?、u3 Weather、u4 At the farm、u5 My clothes、u6 Shopping——与 **PEP 四下** 目录（My school / What time is it? / Weather / At the farm / My clothes / Shopping）完全对应。
- **课本页码**：grade4.json 的 unit 数据里**没有**存页码字段（unit 顶层 keys 仅 `id/num/title/cn/emoji/available/vocabulary/vocabGroups/dialogues/stages/quizQuestions/listeningQuestions`）。页码信息不在数据层。
- **有没有别处的「四下」数据**：没有独立的 `grade4_volume2.json`。四上/四下都在**同一个 `src/data/primaryHub/grade4.json`** 里（按 semester 分键）。`src/data/primaryHub/` 下数据文件：`grade3.json / grade4.json / grade5.json / grade6.json` + `legacy_g4v2_u1.json`（旧版遗留文件，非当前激活源；当前 g4v2_u1 内容在 grade4.json 内）。

---

## 4. g4v1_u3 / u4 / u5 / u6 现状

- 它们的 `stages` 数组里 `type:"sentence"` 关卡的元数据都是：`{ id:"s4", title:"学习句型", subtitle:"核心句型", icon:"💬", type:"sentence", time:"5分钟" }`。
- **数据源 = `grade4.json` 里各 unit 的 `dialogues` 字段**（因为这 4 个单元**没有** grammar.json，`getSentenceLesson()` 返回 null，走旧 `SentenceStage` fallback，见第 5 节）。
- `SentenceStage` 从 `dialogues` 的 `lines` 里**每 2 行配成一对（Q/A），最多取 4 对**渲染（见第 5 节代码）。

四个单元的 `dialogues` 字段完整内容：

#### g4v1_u3（My friends / 我的朋友）
```json
[
  { "title": "A Let's talk", "lines": [
    { "role": "Amy", "text": "I have a friend.", "cn": "我有一个朋友。" },
    { "role": "Wu Binbin", "text": "A boy or girl?", "cn": "男孩还是女孩？" },
    { "role": "Amy", "text": "A boy. He's tall and strong.", "cn": "男孩。他又高又壮。" },
    { "role": "Wu Binbin", "text": "Who is he?", "cn": "他是谁？" }
  ] },
  { "title": "B Let's talk", "lines": [
    { "role": "Amy", "text": "He has glasses and his shoes are blue.", "cn": "他戴眼镜，鞋子是蓝色的。" },
    { "role": "Sarah", "text": "His name is Zhang Peng.", "cn": "他叫张鹏。" }
  ] }
]
```

#### g4v1_u4（My home / 我的家）
```json
[
  { "title": "A Let's talk", "lines": [
    { "role": "Mum", "text": "Where's the cat?", "cn": "猫在哪里？" },
    { "role": "Sarah", "text": "It's in the kitchen.", "cn": "它在厨房里。" },
    { "role": "Mum", "text": "Is she in the living room?", "cn": "她在客厅里吗？" },
    { "role": "Sarah", "text": "No, she isn't.", "cn": "不，她不在。" }
  ] },
  { "title": "B Let's talk", "lines": [
    { "role": "Sarah", "text": "Where are the keys?", "cn": "钥匙在哪里？" },
    { "role": "Mum", "text": "They're on the fridge.", "cn": "它们在冰箱上。" },
    { "role": "Sarah", "text": "Are they on the table?", "cn": "它们在桌子上吗？" },
    { "role": "Mum", "text": "No, they aren't.", "cn": "不，它们不在。" }
  ] }
]
```

#### g4v1_u5（Dinner's ready / 晚餐准备好了）
```json
[
  { "title": "A Let's talk", "lines": [
    { "role": "Mum", "text": "Dinner's ready. Help yourself.", "cn": "晚饭好了，请自便。" },
    { "role": "Sarah", "text": "Thank you. I'd like some beef and noodles.", "cn": "谢谢。我想要些牛肉和面条。" },
    { "role": "Mum", "text": "Would you like some soup?", "cn": "你想喝点汤吗？" },
    { "role": "Sarah", "text": "Yes, please.", "cn": "好的，谢谢。" }
  ] },
  { "title": "B Let's talk", "lines": [
    { "role": "John", "text": "What would you like?", "cn": "你想要什么？" },
    { "role": "Mike", "text": "I'd like some chicken and vegetables.", "cn": "我想要些鸡肉和蔬菜。" },
    { "role": "John", "text": "Pass me the knife and fork, please.", "cn": "请把刀和叉递给我。" },
    { "role": "Mike", "text": "Here you are.", "cn": "给你。" }
  ] }
]
```

#### g4v1_u6（Meet my family! / 认识我的家人）
```json
[
  { "title": "A Let's talk", "lines": [
    { "role": "Sarah", "text": "How many people are there in your family?", "cn": "你家有几口人？" },
    { "role": "Mike", "text": "My family has six people.", "cn": "我家有六口人。" }
  ] },
  { "title": "B Let's talk", "lines": [
    { "role": "Sarah", "text": "Is this your uncle?", "cn": "这是你叔叔吗？" },
    { "role": "Mike", "text": "Yes, it is. He's a football player.", "cn": "是的，他是位足球运动员。" },
    { "role": "Sarah", "text": "What's your aunt's job?", "cn": "你姑姑做什么工作？" },
    { "role": "Mike", "text": "She's a nurse.", "cn": "她是位护士。" }
  ] }
]
```

> 铺开 Tier 2 时要把这些 `dialogues` 重新组织成 grammar.json 的 A/B subModule + sentences 结构（Q/A 配对 + tag），再加 training。注意 u3（B 只有 2 行 = 1 对）、u6（A 只有 2 行 = 1 对）句子偏少，可能需要补句或合并。

---

## 5. SentenceLessonStage 的 fallback：旧 `SentenceStage`

路由（`src/pages/primaryHub/PrimaryHubStagePlay.tsx`，`case "sentence"`）：
```tsx
const sentenceLesson = getSentenceLesson(unitId, stageIdx); // 有 grammar.json 才非 null
// ...
case "sentence":
  return sentenceLesson ? (
    <SentenceLessonStage lesson={sentenceLesson} ... onAwardPoints={...} />   // 有 grammar.json
  ) : (
    <SentenceStage dialogues={unit.dialogues} grade={grade} onFinish={handleFinish} onProgress={reportStageProgress} />  // 无 grammar.json → 吃 unit.dialogues
  );
```

`SentenceStage`（同文件内的本地组件，`function SentenceStage(...)`）：
- **props**：`{ dialogues: UnitDef["dialogues"]; grade: number; onFinish: () => void; onProgress?: (percent:number)=>void }`。**没有** unitId/stageIdx/onAwardPoints/onRegisterBack——它不写任何 per-sentence 进度、不加逐句分、无 A/B 子模块、无解锁流。
- **渲染逻辑**：把 `dialogues` 的每段 `lines` **按 i 与 i+1 两两配对成 Q/A，全局最多取 4 对**（`out.length < 4`）；每对一张卡，🔊 用 `hubSpeak(text, 0.85, grade)`（固定 0.85，无速度选择器），点击「展开」看中文 + 回答。全部展开后 `onProgress=100%`、按钮「✓ 句型学完！进入下一关 →」调 `onFinish`。`dialogues` 为空时显示「本单元暂无句型对话」直接放行。
```tsx
const patterns = useMemo(() => {
  const out = [];
  for (const dialogue of dialogues) {
    const lines = dialogue.lines;
    for (let i = 0; i < lines.length && out.length < 4; i += 2) {
      out.push({ title: dialogue.title, q: lines[i].text, qCn: lines[i].cn,
                 a: lines[i+1]?.text ?? "", aCn: lines[i+1]?.cn ?? "", color: ... });
    }
  }
  return out;
}, [dialogues]);
// ...展开全部后 onFinish；完成进度 = expanded.size / patterns.length
```

**这个旧组件正是 g4v1_u3 / u4 / u5 / u6 当前在用的 Stage 3**（它们无 grammar.json → `sentenceLesson === null` → 走 `SentenceStage`）。其余 8 个单元（v1_u1/u2 + v2_u1–u6）都有 grammar.json，走 `SentenceLessonStage`。

> 差异提示（影响铺开体验一致性）：旧 `SentenceStage` 用 `hubSpeak`（固定语速 0.85，无 `HubSpeakSpeedControl`），新 `SentenceLessonStage` 用 `hubSpeakAtSpeed` + 速度选择器（慢/正常/快）。Tier 2 单元在建 grammar.json 之前，朗读体验与其它单元不一致。

---

## 附：测试 / 类型耦合（铺开会触发）

- `registry.test.ts`：每单元 `loads <unit> grammar lesson at stage 3` 断言 `subModules.toHaveLength(2)`；g4v2_u1 额外断言 `subModules[0].id==="A"` / `subModules[1].lockedUntil==="A"`；`__getSentenceLessonsForTest().toHaveLength(8)`（**Tier 2 新增 grammar 文件会让 8 变化**）；U1 已加 2 条 training 断言。
- 组件写死 `modA=subModules[0] / modB=subModules[1]`、pick 视图顶部「A: x/3」为写死文案（U1 audit 已记）。
- 类型 `SentenceItem.training?` 可选，已就绪；铺开只填数据 + 加测试，不需再动类型。
