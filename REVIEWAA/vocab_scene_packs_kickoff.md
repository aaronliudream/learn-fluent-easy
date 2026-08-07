# J 段 · 场景串记 —— 开工件(假设差异表 + 30 场景选题清单)

**你在这份文件里只需做一件事:圈定 / 增删下面的 30 个场景。** 其余是我自查,供你随手核。

---

## 一、假设差异表(第八条:迁移闸门前先列,不等被撞出来)

| 前面各段的隐含假设 | J 段的实际形态 | 闸门要怎么改 |
| --- | --- | --- |
| 一个条目自成一体,条目之间无关系 | **一条链上 8–15 个节点有先后**,顺序本身是内容(browse → add to cart → place an order) | 新增顺序闸:`sort_order` 全序、无空档、无重复;**顺序错 = 内容错**,不是排版问题 |
| 产出是词/句,长度以词计 | 产出还包括**两篇短文**(80–100 / 150–200 词) | 长度闸按档分:节点、速览版、完整版三把尺,不能共用 |
| 例句只需含"该说法" | **短文必须含链上 ≥80% 的词**(硬闸) | 复用 I 段那套实义词归一化;这次是**一对多**(一篇文 × 15 个词),不是一对一 |
| 内容自足,不引用其他段 | **在库词必挂 `word_id`**,同义弹药优先复用 C 段辨析组 | 新增挂靠闸:`kind='word'` 且该词在 `vocab_words` 里存在 → `word_id` 不得为空 |
| 一段产出一次成文 | **速览版是完整版的机器压缩**,只审完整版 | 速览版不进人审件;但要机器验它覆盖了链词 |
| 文本格式无约束 | 明确**禁 em-dash** | 新增字符闸(顺带扫 `—`／`--`／`–`) |

### ⚠️ 数据源覆盖也是假设(第八条补充)

- **C 段辨析组只有 428 组**,不保证每个场景都有现成同义对可复用 —— 没有的场景要新造,**新造的必须标出来给你审**,不能混在"复用"里蒙混过关。
- **在库词 4470 是托福词表**,而生活场景里大量高频词(cart、shipping、refund)**根本不在托福词表内**。所以 `word_id` 必须可空,且"挂靠率"不能当质量指标 —— 挂不上是词表边界问题,不是内容问题。

### ⚠️ 模型即判据

全段固定 gpt-4o,不中途换 mini(第八条补充)。

---

## 二、机器闸清单(j1–j9)

| 闸 | 判据 | 说明 |
| --- | --- | --- |
| j1 | 节点数 8–15 | 规格常量,不手写数字 |
| j2 | `kind ∈ {word, collocation, chunk, contrast}` | **引用 DDL CHECK** |
| j3 | `sort_order` 从 1 连续、无重复 | 叙事顺序是全序 |
| j4 | **完整版短文含链上 ≥80% 的节点词** | 硬闸;用 I 段那套实义词归一化,**同一份 `STOPWORDS`** |
| j5 | 速览版覆盖链词(比例可低于完整版) | 压缩件,不与 j4 同尺 |
| j6 | 完整版 150–200 词;速览版 80–100 词 | 分档 |
| j7 | **禁 em-dash**(`—` `–` `--`) | 字符闸 |
| j8 | 双语齐全:四个 essay 列 + 每个节点 `text_en/text_zh` 均非空 | NOT NULL 在 DB 端也卡了,这里提前拦 |
| j9 | 在库词必挂 `word_id`(`kind='word'` 且 headword 命中 `vocab_words`) | 跳词卡与掌握度联动的前提 |

**判不了、只能人审的**(第九条:不硬造):议论文结构是否真的"引入→好处三条→转折弊端→权衡结论"、
叙事顺序是否符合真实生活流程、同义弹药是否真是该场景高频。这三条我不会假装机器兜住了。

---

## 三、30 个场景选题清单 —— **请圈定 / 增删**

选题原则:① 学生真会遇到 ② 能自然串起 8–15 个词 ③ 有正反两面可写议论文 ④ 场景之间词汇不大面积重叠。

### 日常生活(8)

| # | 场景 | 链条走向示例 |
| --- | --- | --- |
| 1 | 网络购物 | browse → add to cart → place an order → free shipping → track the package → return |
| 2 | 租房搬家 | view a flat → sign a lease → deposit → utilities → move in → neighbours |
| 3 | 超市采购 | shopping list → aisle → best-before date → checkout → loyalty card |
| 4 | 看病就医 | make an appointment → symptoms → prescription → side effects → follow-up |
| 5 | 办健身卡 | free trial → membership → personal trainer → work out → give up halfway |
| 6 | 点外卖 | place an order → delivery fee → running late → cold food → leave a review |
| 7 | 手机停机与换号 | top up → data plan → roaming → out of credit → switch carriers |
| 8 | 邻里噪音纠纷 | complain → keep it down → landlord → mediate → compromise |

### 校园学习(7)

| # | 场景 | 链条走向示例 |
| --- | --- | --- |
| 9 | 选课与退课 | prerequisite → enrol → drop a course → credit → clash |
| 10 | 小组作业 | assign roles → free-rider → deadline → merge slides → present |
| 11 | 图书馆借还书 | check out → renew → overdue → fine → reserve |
| 12 | 论文写作与查重 | outline → cite → paraphrase → plagiarism → proofread |
| 13 | 考前复习 | cram → past papers → burn out → pace yourself → sit the exam |
| 14 | 找导师改论文 | office hours → feedback → revise → resubmit |
| 15 | 社团招新 | sign up → orientation → get involved → drop out |

### 工作职场(6)

| # | 场景 | 链条走向示例 |
| --- | --- | --- |
| 16 | 求职面试 | job posting → tailor your CV → shortlist → interview → offer → negotiate |
| 17 | 第一天上班 | onboarding → probation → colleague → get up to speed |
| 18 | 开会与汇报 | agenda → run over → on the same page → action items → follow up |
| 19 | 远程办公 | log on → time zone → async → burnout → work-life balance |
| 20 | 加薪与升职 | performance review → raise → promotion → take on more |
| 21 | 辞职交接 | hand in notice → notice period → hand over → exit interview |

### 出行旅游(5)

| # | 场景 | 链条走向示例 |
| --- | --- | --- |
| 22 | 订机票与值机 | book a flight → check in → boarding pass → delayed → connecting flight |
| 23 | 过海关入境 | passport control → declare → customs → baggage claim |
| 24 | 酒店入住 | reservation → check in → room service → check out → deposit refund |
| 25 | 城市交通 | rush hour → transfer → get off → run late → hail a cab |
| 26 | 旅途出岔子 | lost luggage → missed the train → refund → travel insurance |

### 社会与科技(4)

| # | 场景 | 链条走向示例 |
| --- | --- | --- |
| 27 | 社交媒体 | scroll → go viral → follower → misinformation → digital detox |
| 28 | 网上支付与诈骗 | link a card → two-factor → phishing → freeze the account → dispute |
| 29 | 垃圾分类与环保 | sort waste → recycle → single-use → carbon footprint |
| 30 | 人工智能进课堂 | prompt → generate → fact-check → over-rely → ban or embrace |

---

## 四、我需要你回什么

1. **哪些删、哪些换、要不要补** —— 圈定后我按最终清单生成
2. **场景 30(AI 进课堂)** 是否偏离"生活场景" —— 它议论文写起来最出彩,但离日常最远,你定
3. 其余按预授权我一路做到 30 场景全量送审件

**DDL 已出**:`SQLAA/vocab_scene_packs_ddl.sql`(纯新增,八条 validate,不碰既有表)。
你可以现在就跑,也可以等选题定了一起跑 —— 建表与选题无依赖。
