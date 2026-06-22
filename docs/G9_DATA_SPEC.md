# G9(九年级)数据规范 — volume 键锁死

> **本文件是权威规范。任何人(包括 AI 窗口)在向 G9 灌库、改 hub、做前端聚合前,必须先读本文件。**
> 位置:`docs/G9_DATA_SPEC.md`,提交进仓库。
> 最后更新:2026-06-22(U1–U4 阶段)

---

## 0. 一句话铁律

**G9 所有单元(U1–U14)的所有内容,volume 一律用 `'9'`(不是 `'g9'`,不是 `9` 数字)。hub book 一律 `'9'`。**

违反这条 = 前端读不到 / 语法总览页分裂成多个 tab。

---

## 1. 为什么有这条规范(历史教训,别重蹈)

G9 早期分两批做,用了两个不同的 volume 键,导致分裂:

| 批次 | 单元 | 用的键 | 来源 |
| --- | --- | --- | --- |
| 早期 pipeline | U1 / U2 | `'g9'` ❌ | 做 U1/U2 时 pipeline 选错 |
| 整册骨架导入 + hub 预设 | U3–U14 | `'9'` ✅ | 2026-06-02 整册裸词导入;hub book 本就是 '9' |

**后果:** 每个单元各自和自己 hub book 对齐时看不出问题(useUnitVocab 按 `volume=unit.book` 各查各的),但**语法总览页 `junior/grammar` 把所有单元按 volume 聚合分组**时,`'g9'` 和 `'9'` 被拆成两个 tab("初三全学期" + 突兀的 "9")。

**根因:没有统一标准 + 没有数据地图。** 两批数据各用各的键,没对齐;早期 '9' 导入没留文档,做 U1/U2 时不知道 '9' 标准已存在,又造了个 'g9'。

**已定方案:统一到 `'9'`,迁移 U1/U2('g9'→'9')。** 因为 '9' 是主流键(覆盖 u3–u14 共 12 单元),'g9' 仅 U1/U2 历史遗留。迁 2 个单元即根治。

---

## 2. volume / book 键 — 标准对照

| 项 | 标准值 | 说明 |
| --- | --- | --- |
| junior_vocab.volume | `'9'` | 字符串 '9',非 'g9'、非数字 9 |
| junior_grammar_points.volume | `'9'` | |
| junior_grammar_questions.volume | `'9'` | |
| junior_reading.volume | `'9'` | |
| junior_cloze.volume | `'9'` | |
| junior_listening_exercises.volume | `'9'` | |
| junior_writing_prompts.volume | `'9'` | |
| grade9.json 各单元节点 book | `'9'` | 前端 `volume = unit.book` 据此查 DB |
| grade (所有表) | `9` | 数字 9 |
| unit (所有表) | `'U1'`..`'U14'` | 大写 U + 数字 |

**前端查询机制:** `useUnitVocab` 及各 stage hook 用 `volume = unit.book` 查 DB。所以 **DB 存的 volume 必须 == hub book == '9'**,三者一致才能读到。

---

## 3. 灌库铁律(每次向 G9 灌任何内容)

1. **volume 一律 '9'** — 灌前 grep 确认 SQL 里所有 volume 都是 '9',无 'g9' 残留。
2. **DELETE 键也用 '9'** — `DELETE ... WHERE volume='9' AND unit='UX'`。用 'g9' 删会删不掉旧数据 → 导致重复。
3. **覆盖式灌库(不是先删后补)** — 同键 DELETE + INSERT 放**同一事务**,不留空窗期(否则线上该单元白屏)。
4. **每批 count 校验** — 灌前 count → DELETE 后 = 0 → INSERT 后 = 预期数 → 查重 = 0 行。
5. **DELETE 与 INSERT 分段,可独立验证** — Aaron 每跑一步,CC 用只读 SELECT 验证贴回。
6. **每次灌库 SQL 提交进仓库** — `scripts/g9/uX/g9-uX-load.sql`,DB 每次变更有据可查(早期坑就是无 commit 记录无法回溯)。

---

## 4. 每单元标准 count(验收基准)

| 表 | 每单元数量 |
| --- | --- |
| junior_vocab | 课本 Words and Expressions 实际词数(U3/U4=39) |
| junior_grammar_points | 3(三个考点) |
| junior_grammar_questions | 60(每考点 20 题) |
| junior_reading | 6 篇 / 30 题 |
| junior_cloze | 6 篇 / 60 题 |
| junior_listening_exercises | 6 篇 / 30 题 |
| junior_writing_prompts | 1 |

灌完逐表 count 对得上 = DB 层 OK。

---

## 5. category_id(语法分类,实测 id,灌前查确认)

| category | id | 用于 |
| --- | --- | --- |
| clause | `c49e0d84-1b6d-4bea-bb83-35ff7558dc8f` | 宾从/状从等从句类语法 |
| other | `e05f9874-6401-42f8-a361-28f1dee3a58e` | 句型/固定搭配等 |
| verb | `158797be-3277-482a-b730-75b29dfa47b4` | 动词类语法(如 used to) |

**灌前查实测,别硬编码靠记忆:** `SELECT id, code FROM junior_grammar_categories;` 用查出的 id。category 必须匹配考点实际内容(used to 是 verb,不是 clause)。

---

## 6. hub 接入(grade9.json 单元节点)

每单元节点接 DB 题库时,确认/设置:

| 字段 | 正确值 | 说明 |
| --- | --- | --- |
| book | `'9'` | 必须 '9' |
| grammarCodes | `['g9uX.01','g9uX.02','g9uX.03']` | 设了才走 DB 语法题 |
| grammarCode(单数·老字段) | `null` | 🔴 删掉任何 `g8.xx` 残留错值(指向 8 年级) |
| grammarTitle / 副标题 | 该单元真实语法 | 别留错标(U4 曾错标"宾语从句",实为 used to) |
| stages | 9 关(含完形 cloze 关) | 对齐 U1/U2;别少完形关 |
| 老内联 stub(vocabulary/reading/grammarQuiz) | 保留不删 | DB 优先,内联自动 dormant;删它改大 JSON 反增风险 |

**前端读数优先级(已确认):** vocab(useUnitVocab)、阅读(L1250/1288/1295)都是 **DB 优先,DB 空才回退内联**;语法关 grammarCodes 一设就走 DB 忽略内联 grammarQuiz。所以**灌了 DB 就显示,老内联自动失效,不用删 stub**。

**改 grade9.json 安全姿势:** 先验 json 往返零差异(`json.dumps(indent=2, ensure_ascii=False)` == 原文),再用脚本精确改节点,git diff 只显示真改动 — 别手改大 JSON(易误伤)。

---

## 7. 听力 audio_url 预生成

- pregenerate 脚本用 `--volume=9`(grade 推断 → 9,过滤 `grade=9 AND volume='9' AND audio_url IS NULL`)。
- ⚠️ **别用 'g9'** — U3+ 听力存 '9',用 'g9' 过滤命中 0 条。
- 12 条 TTS 合成 → 出 `UPDATE ... SET audio_url` SQL → Aaron 跑 → CC 验 audio_url 非空(每单元 6)。

---

## 8. 真机验收清单(每单元上线后)

1. 9 关齐(核心词汇 → 听辨 → 配对 → 语法 → 阅读 → **完形** → 听力 → 写作 → 通关)
2. 语法关是本单元 g9uX.* 的题(不是 g8.xx)
3. 语法关标题正确(对应本单元真实语法)
4. 词汇关显示官方词(带 IPA + chunk,非老 stub 裸词)
5. 阅读 6 篇 / 完形 6 / 听力 6 能做、判分对、听力即时播放
6. **语法总览页 `junior/grammar`:G9 只有一个 "初三全学期" tab,含 U1–U当前最新单元**(不再有突兀的 "9" tab);g9 语法题总数 = 已上线单元数 × 60

---

## 9. U1–U14 现状快照(随进度更新)

| 单元 | 主题/语法 | vocab | 题库5表 | hub | volume | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| U1 | by+doing / How / 情态 | ✅ | ✅ | ✅ | **g9→待迁9** | 上线,待迁 volume |
| U2 | that/if 宾从 / 感叹句 | ✅ | ✅ | ✅ | **g9→待迁9** | 上线,待迁 volume |
| U3 | 宾从语序/连接词/礼貌问路 | ✅39 | ✅ | ✅ | 9 | 已灌,待真机 |
| U4 | used to | ✅39 | ✅ | ✅ | 9 | 已灌,待真机 |
| U5–U14 | 待做 | ❌ | ❌ | 占位 | (将用)9 | 未做 |

> 每完成一个单元,更新本表 + 把灌库 SQL commit 进仓库。

---

## 10. 开新窗口的标准开场(给未来的 CC / Claude)

> "先读 docs/G9_DATA_SPEC.md。G9 所有内容 volume='9'、hub book='9'。别灌任何东西,直到你能告诉我 U1–U14 每个单元的 volume 键和当前状态(查 DB 实测,不靠记忆)。"
