# 初中（junior）可达语速档矩阵

代码基准：**`origin/main`**（`git archive origin/main src` 导出后逐个调用点抓实参，不靠记忆）。
数据事实：本轮对 Supabase 只做 **只读** 计数/取样查询。**未生成任何音频。**

> **v2 修订（2026-07-26）**：解封 table 源、建 `junior.json` 时逐条复核，改了四处（原文都在，改的是判断）：
> 1. **句型关的文本来源不是 JSON 的 `dialogues`**，是组件常量 `SENTENCE_PATTERNS`（详见 §1.A 脚注）。
> 2. 补上**听音辨词**这一路：它把词当 `q.audio` 喂给 `ListenMcStage`，所以词还会在 **0.8 / 0.7** 两档被播。
> 3. 补上**语块**：核心词汇关翻卡里的 `chunks` 每条都带 🔊（`speakWord(c.en)`），是真播放源不是纯展示。
> 4. C 路线 **有一处自动播**（默写游戏 `JuniorVocab:1291`），原文写的"全部点击触发"不成立。
>
> 行号已按 Part 1 改动后的 `JuniorHubStagePlay.tsx` 更新（该文件把裸语速换成了 `JUNIOR_SPEAK_SPEED.*` 常量）。

---

## 0. 与小学最大的三点不同（先说这个，因为它推翻了"照抄 primary 做法"的前提）

| # | 差异 | 后果 |
|---|---|---|
| **1** | **朗读文本主要来自 DB，不是 JSON**。`useUnitVocab` 先查 `junior_vocab`，查不到才回退 `unit.vocabulary`；外研社的 JSON（`fltrp-grade*.json`）里 `vocabulary/dialogues/listeningQuestions` **全部为 0 条**，纯骨架 | 映射表必须用 **`table:` 源**。该路径原为封印状态（exit 2），已按封印自列的三条解封（见 `scripts/audio/table-source.mjs` 末尾）|
| **2** | **存在第三类音色空间**：小学全站只有 `el:lily`；junior 有一部分走 `speak()` = **用户设置音色**（`voiceSettings.v1`，默认 nova@0.85，可切 **6 音色 × 5 语速 = 30 种组合**） | 这部分**不可能全预生成**（30 倍对象）。只能预生成默认档，其余接受冷合成 |
| **3** | `junior_vocab` 等表是 **初中与高中混表**：junior 的 publisher 取值是 `junior` / `junior_fltrp`，高中才是 `pep` / `fltrp` / `sufe` | 按 `publisher='pep'` 取"人教初中"会取到 **高中行**（我第一次探测就踩了，1706 条其实全是 grade 10-12）。scope 必须同时卡 `grade in (7,8,9)` |

---

## 1. 矩阵

### A. `hubSpeak(...)` 路线 —— `el:lily`，速度**逐调用点硬编码**（`JuniorHubStagePlay.tsx`）

| 模块（组件） | 行 | 文本来源 | 速度 | 自动播 |
|---|---|---|---|---|
| 核心词汇关 `VocabStage` 词 | :244 `speakWord` | `junior_vocab.word`（回退 JSON） | **0.85** | 否（点击） |
| 核心词汇关 **语块**按钮 | :423 / :428 | `chunks[].en`＝`example_en` 优先、无则 `phrase_en` | **0.85** | 否 |
| 听力关 `ListenMcStage` 题目 | :630 | 听力题 `audio` | **0.8** | 否 |
| 听力关 选项正音 | :589 | `opts[answer]` | **0.7** | 否 |
| **听音辨词** `ListenWordStage` | 复用 `ListenMcStage`（:753） | **词本身**当 `q.audio`、`opts[answer]` 也是词 | **0.8 + 0.7** | 否 |
| 句型对话 `SentenceStage` | :787 / :802 | **组件常量 `SENTENCE_PATTERNS`**（:44，4 组、第 4 组无 a，共 7 条） | **0.85** | 否 |
| 默写关 `WriteStage` 答对正音 | :898 | `vocabulary[].en` | **0.85** | 否 |
| 默写关 答错正音 | :916 | 同上 | **0.7** | 否 |
| 默写关 词表点读 | :935 | 同上 | **0.7** | 否 |
| 单元通关 `FinalQuizStage` 听力题 | :1099 | 题目 `audio` | **0.8** | 否 |

**hubSpeak 路径全部点击触发，没有自动播。**

两处容易看反的地方（v2 修订）：

- **句型关读的不是 JSON**。`grade9.json` 里 14 个 unit 带 `dialogues` 字段，但 `unit.dialogues` 在 `src` 内**零读取点**——句型关渲染的是文件顶部写死的 `SENTENCE_PATTERNS`。所以 `junior.json` 不给 `dialogues` 建 source，改用 `extraFiles` 把 `JuniorHubStagePlay.tsx` 本身纳进扫描（小学的 `courseDialoguePairs` 是真播放源，这里不能照抄）。
- **同一个词会横跨三档**：0.85（词卡/默写答对）、0.8（听音辨词题目）、0.7（听音辨词正音/默写答错/词表点读）。只按"词卡 0.85"一档生成，听音辨词整关都是冷合成。

### B. `speakKid(text,{grade})` 路线 —— `el:lily` @ `getKidSpeed(grade)`

junior grade ∈ {7,8,9} → `getKidSpeed` 全部落 **1.0**（`g<=1→0.7`、`g<=3→0.85`、其余 1.0）。

| 闯关关卡 | 文本 | 速度 | **自动播** |
|---|---|---|---|
| `JuniorListenChooseWordLevel` | `audio` | 1.0 | **是**（:106 每题 250ms 自动 playTwice） |
| `JuniorDialogueResponseLevel` | `audio` | 1.0 | **是**（:111 同上） |
| `JuniorFillInChooseLevel` | `audio`（选对后正音） | 1.0 | 否 |
| `JuniorSentenceOrderingLevel` | `display`（选对后正音） | 1.0 | 否 |

→ **junior 的自动播只有这两关**（对应小学那类 250ms playTwice）。冷 key 落在这里就是真静音。

### C. `speak(text)` 路线 —— **用户设置音色**（这是 junior 独有的麻烦）

| 模块 | 行 | 文本 | 速度/音色 | 自动播 |
|---|---|---|---|---|
| `JuniorVocab` 拼写/选择答后自动读 | :624 / :863 | `word` / `answer` | **用户设置**（默认 nova@0.85） | 否（在点击栈内） |
| `JuniorVocab` 词卡点读 / 配对翻牌 | :447 / :694 / :1089 / :1109 / :1439 | `word` | 同上 | 否 |
| **`JuniorVocab` 默写游戏 `DictationSession`** | **:1291** | `word` | 同上 | **是**（`useEffect` 依赖 `cur?.id`，每换一词就读） |
| `JuniorListeningPlay` 无预生成时读整段 | :106 | `transcript`（整篇听力原文） | 同上 | 否 |

可达组合 = `VOICES` 6 个 × `SPEED_PRESETS` 5 档 = **30 种**（`VoiceSettings` 弹窗挂在 `PageHeader`，全站生效、写 localStorage）。
**只预生成默认档 nova@0.85**（已按你的决定定下），其余 29 种按需冷合成。

**但"非手势自动播为 0"这句 v1 写错了**：`JuniorVocab:1291` 是 mount 自动播。`speak()` 的判据是 `navigator.userActivation.isActive`（`speak.ts:508`），
点"下一题"后立刻换词通常还在激活窗口内、能出声；**进关首词**要等掌握度/词表两个异步查询回来，若超出窗口且 key 是冷的，就走 `speak.ts:607-611` 的纯预热分支 = **无声**。
→ 这正是"默认档必须预生成"的理由，不只是延迟问题。（该关的预热 `:1292 prefetchTTSBatch` 与播放同 key，档位本身没错位。）

### D. `speakFromUrl(audio_url)` —— 预生成文件，不经运行时 key

`JuniorListeningPlay:104`：有 `audio_url` 直接播 CDN 文件。初中范围（grade 7–9）**473 条有 URL / 160 条没有**；
没有的那 160 条会回退 C 路线读整段 transcript（长文本 + 用户音色，冷合成最久）。

### 三档全不可达（零预生成需求）

| 模块 | 依据 |
|---|---|
| `JuniorGrammar*`（9 个页面）、`JuniorClozePlay`、`JuniorWriting*`、`JuniorReading*`、`JuniorUnitGrammarTest`、`JuniorKpPractice` | 全文件 grep 音频 API **零命中** |
| 闯关 `JuniorReadingJudgeLevel` / `JuniorSentenceTransformLevel` | 无 `speakKid` 引用 |
| `JuniorHubMistakes` / `JuniorHubAITest` / 苏州考试 5 个页面 | 零命中 |

### 顺带发现：junior 自己也有一处 C2 类缺陷 —— **已修复**

`WriteStage` 预热原来写的是 `{ grade }` —— **漏传 speed**，落到 `getKidSpeed(7/8/9)=1.0`；
而同组件播放是 **0.85** 与 **0.7**。→ **默写关的预热 100% 落空**，与小学 C2-1/C2-2 完全同型。
（另外该关有两个播放速度、只预热一个，即便修好 speed 也仍有一半是冷的。）

修复（commit `965a6c1d`）：新建 `src/lib/juniorHub/speakSpeeds.ts` 作为语速唯一来源，
`prefetchJuniorWriteStage()` 按 `WRITE_STAGE_SPEEDS = [0.85, 0.7]` **两档各热一遍**；
组件里 9 处播放 + 4 处预热全部改引用常量，不再有裸字面量。
守门人 `src/lib/juniorHub/juniorSpeakParity.test.ts`（8 条）——变异测试验过非空转：
只热一档 → 3 红；预热漏传 speed → 3 红。
其余三处预热本来就对齐：`:255` 0.85 ↔ `:244`、`:547` 0.8 ↔ `:630`、`:1017` 0.8 ↔ `:1099`。

---

## 2. 双出版社专项（结论 + 数据）

**Q1：人教(PEP)与外研社(FLTRP)是否走同一批组件？**
**是，完全同一批。** `publisher` 只做两件事：① `getGradeCourse(grade, publisher)` 选哪份 JSON 骨架（`grade*.json` / `fltrp-grade*.json`）；
② 传给 `useUnitVocab` 作为 DB 过滤条件（且 `/junior` 入口**根本不传**，因为外研社的 `unitKey` 带 `wy*` 前缀、全局唯一）。
渲染与播放走的是同一个 `JuniorHubStagePlay` 和同一批闯关组件。

**Q2：同一文本在两个出版社下算出的 cache key 是否相同？**
**完全相同。** key = `provider|voice|speed|accent|text`，四个字段里：
- `provider`/`voice` 由 `hubSpeak`→`speakKid` 固定为 `elevenlabs|el:lily`；
- `speed` 是组件里的硬编码常量（0.85/0.8/0.7）或 `getKidSpeed(grade)`，**与 publisher 无关**；
- `accent` 恒空；`text` 就是词/句本身。
**publisher 不进 key**，所以同一个词在两社下命中同一个对象。

**Q3：这是设计如此还是缺陷？**
**是正确的设计，而且是省钱的。** 实测重叠（`junior_vocab`，grade 7–9）：

| | 唯一词形 |
|---|---|
| 人教 `publisher='junior'` | 2158 |
| 外研 `publisher='junior_fltrp'` | 1291 |
| **两社完全相同的词形** | **902**（占外研 **69.9%**） |
| 短语 `phrase_en` 重叠 | 0 |
| 例句 `example_en` 重叠 | 0 |

→ 若 publisher 进了 key（比如给两社配不同音色），这 902 个词会各生成一份、**凭空多 902 个重复对象**，且两社同一个词发音还会不一致。现状不会。
**唯一需要留意的不是 key，而是音色一致性**：预生成的听力 `audio_url` 与运行时 `speak()` 用的是不同音色体系（前者是脚本按固定音色批量生成，后者跟用户设置走），这属于"听感不统一"，不产生重复对象。

---

## 3. 表源封印：已按它自列的三条解封（方案甲）

v1 在这里停住，是因为 `extract.mjs` 对 `table:` 源硬失败退 2，而 junior 的文本 90% 在 DB。
封印自己写的解除条件是三条，逐条落实如下：

| # | 条件 | 落实 |
|---|---|---|
| ① | 用真实数据验证抽取（字段取法 / 分页 / 过滤） | `junior_vocab` grade in (7,8,9)：`count=exact` **3772**，分页取回 **3772**，逐条相等。单页硬顶实测 1000（请求 `limit=2000` 只回 1000）→ `PAGE_SIZE=1000` |
| ② | 与本矩阵逐项核档位 | 见 `scripts/audio/audio-sources/junior.json` 的 `tiers`/`sources`；且由单测把三档钉死在 `JUNIOR_SPEAK_SPEED` 上，改一边不改另一边就红 |
| ③ | 补表源单测 | `src/lib/juniorHub/audioTableSource.test.ts`（13 条）。变异测试验非空转：只取首页 → 4 红、去掉 count 断言 → 1 红、去掉 grade 硬闸 → 1 红 |

两道不许绕的硬闸（都在 `table-source.mjs`）：
**分页触顶 → 抛错**（少取一页 = 少报一批缺口 = precheck 谎报绿灯）；
**抽取数 ≠ `count=exact` → 抛错**（漏页/并发写入在这里现形）。
外加 `extract.mjs` 里一条：**表源不显式声明 `grade in (...)` 直接报错**——`junior_*` 是初中高中混表，
按 publisher 过滤会捞到高中行（v1 探测踩过：`publisher=pep` 的 1706 行全是 grade 10–12）。

### 归属转交（已做，并加了校验）

`primary.json` 里 `src/data/juniorHub` 那条从"待接入"改成 `ownedBy: "junior"`。
新增 `checkHandoffs()`：写了 `ownedBy` 的路径必须真的落在目标 section 的 `dataRoots`/`extraFiles` 内，
否则报错——防的是"A 说 B 管、B 根本没管，两边巡检都绿"。
其余两条 `unverified`（`exams`、`sightWords`+`g2LessonStages`）与 junior 无关，保持原样。

### 底数（只读计数，2026-07-25/26 实测）

| 内容 | 初中范围（grade 7–9）行数 |
|---|---|
| `junior_vocab` | **3772**（人教 `junior` 2434 + 外研 `junior_fltrp` 1338；两者之和 = 只按 grade 过滤的 3772，年级段内无其他 publisher） |
| 其中唯一朗读文本（词 + 短语 + 例句去重） | **4336** |
| `junior_listening_exercises` | **633**（473 已有预生成 audio_url / **160 没有** → 只有这 160 条会现场 TTS） |
| `junior_reading` | 460（**零播放调用**，不进盘点） |

展开档位后的可达对象总数见 `docs/audio/JUNIOR_2_inventory.md`。
