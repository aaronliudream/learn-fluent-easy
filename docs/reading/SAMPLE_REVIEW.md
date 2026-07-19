# 阅读中心 · 样板内容审稿件(初中 1 篇 + 4 题)

> **用途**:此件供 Aaron / 网页版 Claude **内容审核**。审核通过后再由 Aaron 执行 `SQLAA/reading-center-seed-sample.sql` 落库。
> **性质**:自编原创短文,零版权风险(决策 D9)。学段=初中,类型=分级读物(graded_reader),分级=词数(D8)。
> 同一份已镜像到 `REVIEWAA/阅读中心样板/`。

---

## 元数据

| 字段 | 值 |
|---|---|
| content_type | `graded_reader` |
| grade_band | `junior`(初中) |
| level | `J1(120–180词)` |
| title | The Lost Kitten |
| word_count | 156 |
| difficulty | 2 / 4 |
| topic | 记叙文 |
| is_published | true |

---

## 原文(Passage)

> One rainy afternoon, Lily heard a strange sound near her front door. She opened it and found a small kitten sitting on the step. The kitten was wet and cold, and it looked very hungry.
>
> Lily carried the kitten inside and dried it with a soft towel. Then she gave it some warm milk. The kitten drank all the milk quickly and began to feel better. Soon it was playing with a ball of wool on the floor.
>
> Lily wanted to keep the kitten, but she knew it might belong to someone else. The next morning, she made a small poster with a picture of the kitten. She put it on the wall near the shop at the corner of her street.
>
> Three days later, an old woman came to Lily's house. The kitten was hers, and she had been looking for it everywhere. She thanked Lily with a warm smile. Lily was a little sad to say goodbye, but she felt happy that she had helped.

**词汇注释**:kitten 小猫 · towel 毛巾 · belong 属于 · poster 海报 · corner 角落/拐角

---

## 题目 + 自审(逐题走「语义匹配铁律」:题干问的==标答;三个干扰项都可验证为错)

### Q1(选择)Where did Lily first find the kitten?
- **A. On the step near her front door** ✅
- B. Near the shop at the corner — ❌ 那是她**贴海报**的地方,不是发现处
- C. In an old woman's house — ❌ 那是小猫**的主人家**(它原本属于谁),非发现处
- D. On the floor of her kitchen — ❌ 小猫后来在地板上**玩毛线球**,不是被发现的地点
- **自审**:题干问「最初在哪发现」= 台阶/前门 = A;三干扰项各对应文中另一真实地点,但都非发现处。✅

### Q2(选择)What did Lily do to help the kitten feel warm and better?
- **A. She dried it and gave it warm milk** ✅
- B. She gave it some cold water — ❌ 是**温**牛奶,非冷水
- C. She took it to the shop — ❌ 文中无此情节
- D. She made a poster for it — ❌ 海报是**后来为找主人**做的,非取暖/复原目的
- **自审**:擦干+温牛奶 → feel better,与题干「取暖/好起来」一一对应;干扰项都错。✅

### Q3(判断 T/F)Lily made a poster because she wanted to find the kitten's owner.
- **A. True** ✅ · B. False ❌
- **自审**:文中「she knew it might belong to someone else... made a small poster」——做海报目的正是找主人,故 True。判断题建模为 `options:["True","False"]`+`answer:"A"`,不加 type 字段(决策 D2)。✅

### Q4(选择)How did Lily feel at the end of the story?
- **A. A little sad to say goodbye, but happy she had helped** ✅
- B. Angry that the woman took the kitten — ❌ 与「warm smile」矛盾
- C. Afraid of the old woman — ❌ 无依据
- D. Sorry that she had helped the kitten — ❌ 与「felt happy that she had helped」矛盾
- **自审**:结尾句直接支撑 A;三干扰项都与结尾情感相反。✅

---

## 审核关注点(请 Aaron / 网页版 Claude 重点看)

1. 语言是否地道、无语法/拼写错(初中可读性)。
2. 4 题是否都满足「题干==标答、干扰项全可验证为错、答案唯一」。
3. 词数分级 `J1(120–180词)` 是否合适(实测 156 词)。
4. 词汇注释的中文释义是否准确。

**审核通过后** → Aaron 跑 `SQLAA/reading-center-ddl.sql`(建表)+ `SQLAA/reading-center-seed-sample.sql`(落库)→ 真机走闭环:`/reading` → 进篇 → 答题 → 故意答错 → 错题本(📖 阅读错题)可见。
