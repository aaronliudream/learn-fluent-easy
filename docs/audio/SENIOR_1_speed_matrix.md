# 高中（senior / gaokao）可达语速档矩阵

代码基准：`origin/main` @ `2714d48e`。数据事实：本轮对 Supabase 只做**只读**查询与 HEAD 探测。**未生成任何音频、未改任何播放代码。**

---

## 0. 与初中最大的三点不同（先说这个）

| # | 差异 | 后果 |
|---|---|---|
| **1** | **两个数据源并存**：5 步关卡（`GaokaoHubStagePlay`）读 **JSON**（`courseData` → `year*.json` / `sufe-courses.json` / `fltrp-courses.json`）；词汇专区（`GaokaoVocabBoard`）读 **DB**（`junior_vocab`，`volume=required*/elective*`） | 同一个词可能在两处出现，但**档位与音色都不同**（JSON 侧 el:lily@0.85/0.7，DB 侧 nova@0.85）。映射表必须分成两个 source，不能合并 |
| **2** | **词只有人教在 JSON 里**：`year*.json` 36 个单元共 1706 条 vocabulary；`sufe-courses.json`（28 单元）与 `fltrp-courses.json`（42 单元）的 `vocabulary` **全为 0** | 上外/外研社的词只能从 DB 走词汇专区。它们的 5 步关卡词卡阶段没有词可读 |
| **3** | **33 张 `gaokao_*` 表实测 32 张 0 行**（唯一有数据的是 `gaokao_exam_calendar` 5 行考试日历，无朗读文本） | 高中内容全部落在 `junior_*` 表与 JSON 上，本 section 不涉及 `gaokao_*` 表 |

---

## 1. 矩阵

### A. `hubSpeak(...)` 路线 —— `el:lily`，速度逐调用点硬编码（`GaokaoHubStagePlay.tsx`）

| 模块 | 行 | 文本来源 | 速度 | 自动播 |
|---|---|---|---|---|
| 词卡关 翻卡朗读 | :184 | `unit.vocabulary[].en`（JSON） | **0.85**（默认 rate） | 否（点击翻卡） |
| 词卡关 卡面 🔊 ×2 | :226 / :231 | 同上 | **0.85** | 否 |
| 词卡关 卡背 🔊 ×2 | :249 / :254 | 同上 | **0.85** | 否 |
| 听力关 正确项正音 | :320 | `listeningQuestions[].opts[answer]` | **0.7** | 否 |
| 听力关 题目 | :354 | `listeningQuestions[].audio` | **0.8** | 否 |
| 词义配对 英侧点选 | :390 | `unit.vocabulary[].en` | **0.85** | 否（点击） |
| 句型关 q / a | :492 / :507 | **组件常量 `SENTENCE_PATTERNS`**（:19 起） | **0.85** | 否 |
| 默写关 答对正音 | :563 | `unit.vocabulary[].en` | **0.85** | 否（提交后） |
| 默写关 答错正音 | :579 | 同上 | **0.7** | 否 |
| 默写关 词表点读 | :601 | 同上 | **0.7** | 否 |
| 预热 | :842 | `prefetchHubVocabulary(vocab, grade, 0.85)` | 0.85 | — |

`hubSpeak(text, rate = HUB_FIXED_SPEAK_SPEED)` → `speakKid(text, { speed: rate })` → `KID_VOICE_ID = el:lily`。
调用时**不传 grade**，且 speed 全部显式，所以 `getKidSpeed` 分支不参与 key。

### B. `speak(text)` 路线 —— 用户设置音色（默认 `nova@0.85`）

| 模块 | 行 | 文本 | 速度/音色 | 自动播 |
|---|---|---|---|---|
| 词汇专区 词条 🔊 | `GaokaoVocabBoard.tsx:219` | `junior_vocab.word`（DB） | 用户设置（默认 nova@0.85） | 否 |
| 词汇专区 预热 | 同文件 :206 | 同上（`prefetchTTSBatch`，同键） | 同上 | — |

### C. `speakFromUrl(audio_url)` —— 预生成 MP3，不经运行时 key

`JuniorListeningPlay.tsx:104`（高中听力专区共用此页）：有 `audio_url` 直接播 CDN 文件；无则 `speak(transcript)`。
高中 636 行**全部有 `audio_url`**（见 §3），所以 TTS 兜底路径当前产出 0 条。

### 自动播路径：**0 处**

高中侧全部播放调用都在点击栈内（翻卡 / 点 🔊 / 提交答案后）。没有小学、初中那种 `useEffect` + 250ms `playTwice` 的自动播。
→ **冷 key 在高中只会表现为 1–3 秒延迟，不会出现"没有声音"。**

### 零播放需求（grep 播放 API 零命中）

| 模块 | 依据 |
|---|---|
| `GaokaoGrammarBoard` / `GaokaoExerciseBoard`（阅读·完形）/ `GaokaoWritingBoard` / `GaokaoUnitGrammarTest` | 全文件 grep `speak(`/`hubSpeak(`/`speakFromUrl(`/`new Audio(` 零命中 |
| DB 侧 `junior_reading` 636 / `junior_cloze` 636 / `junior_grammar_points` 318 / `junior_writing_prompts` 106（高中行） | 其消费页面同上，零命中 |
| JSON 侧 `unit.dialogues`（三份课程共 152 组） | 句型关读的是组件常量 `SENTENCE_PATTERNS`；全仓未见对 gaokao 侧 `unit.dialogues` 的读取 |
| `src/data/gaokao/grammarQuestions.ts` / `readingArticles.ts` / `catalog.json` / `pep-bundle.json` | 消费方零播放调用 |

---

## 2. 三出版社专项

**Q1：pep / sufe / fltrp 走同一批组件吗？**
**是。** `publisher` 只做两件事：① `getGradeCourse(grade, publisher)` 选哪份 JSON 骨架（`year*.json` / `sufe-courses.json` / `fltrp-courses.json`）；② 作为 DB 查询条件（`GaokaoVocabBoard` 的 `.eq("publisher", pub)`）。渲染与播放走的是同一个 `GaokaoHubStagePlay` / `GaokaoVocabBoard`。

**Q2：同一文本在三社下 cache key 相同吗？**
**相同。** key = `provider|voice|speed|accent|text`，`publisher` 不在其中。实测取三社共有的词 `restore`：
- 5 步关卡 → `elevenlabs|el:lily|0.85||restore`
- 词汇专区 → `openai|nova|0.85||restore`
两条 key 与 publisher 无关。

**Q3：与初中双出版社的结论一致吗？**
**一致**（初中：人教 `junior` / 外研 `junior_fltrp` 同组件同 key）。高中只是从两社变三社。实测重叠（DB 词汇，grade 10–12）：

| | 唯一词形 |
|---|---:|
| 人教 `pep` | 1670 |
| 上外 `sufe` | 1134 |
| 外研社 `fltrp` | 1889 |
| pep ∩ sufe | 618 |
| pep ∩ fltrp | 1004 |
| sufe ∩ fltrp | 625 |
| **三社并集** | **2918** |
| 三社都有 | 472 |

→ 若 publisher 进了 key，光两两重合的部分就要多生成 2247 个重复对象。现状不会。

---

## 3. `audio_url` 存活验证（Step 3）

`junior_listening_exercises` 高中 636 行**全部有 `audio_url`**、0 条走 TTS 兜底。逐条 HEAD（并发 3、指数退避、200/400/403/404 视为确定答案）：

| 结果 | 条数 |
|---|---:|
| **200 且 ≥2KB** | **636** |
| 404 / 400 / 其他 | **0** |

**零死链。** 明细：`data/audio-audit/senior_audio_url_probe.json`（含 checkedAt 与逐条结果）。

### 但回退路径确实是死的（结论与你的判断一致）

`speakFromUrl` **永不 reject、也不回退 TTS**：

```
speakFromUrl → playUrl(audio, url) → playUrlOn 失败 → playUrlDirect 失败 → resolve(false) → 外层直接 return
```

`playUrlDirect` 的 `onerror` / `play().catch()` 都只是 `resolve(false)`，没有任何"落回 speak(transcript)"的分支。
`JuniorListeningPlay.playAudio` 又是 `if (audio_url) speakFromUrl(...) else speak(transcript)` 的二选一。

→ **死链 = 彻底没声，且不报错。** 当前 636/636 存活所以没有暴露，但这条链路没有兜底，只能靠巡检盯 URL 存活。

---

## 4. 盘点（Step 4）

映射表：`scripts/audio/audio-sources/senior.json`（结构同 junior.json；`dataRoots` = `src/data/gaokao` + `src/data/gaokaoHub`，`extraFiles` = `GaokaoHubStagePlay.tsx`）。
抽取仍走 `extract.mjs`（含 `cleanForTTS`），CSV 走 `csv.mjs`，未 fork。

**可达 (文本 × 档位) 唯一对象：7476**

| 档位 | 音色@速度 | 对象数 |
|---|---|---:|
| `hubNormal` | el:lily @0.85 | 1677 |
| `hubSlow` | el:lily @0.7 | 2275 |
| `hubListen` | el:lily @0.8 | 606 |
| `userDefault` | nova @0.85 | 2918 |

| 来源 | 对象数 |
|---|---:|
| `table:junior_vocab`（词汇专区，三社并集 2918 词） | 2918 |
| `src/data/gaokaoHub/year1.json` | 1656 |
| `src/data/gaokaoHub/year2.json` | 1072 |
| `src/data/gaokaoHub/year3.json` | 1044 |
| `src/data/gaokaoHub/fltrp-courses.json` | 504 |
| `src/data/gaokaoHub/sufe-courses.json` | 275 |
| `GaokaoHubStagePlay.tsx`（SENTENCE_PATTERNS） | 7 |

存在性探测结果见下节（`data/audio-audit/senior_gap.csv`）。

### 待重新分类的声明

`primary.json` 与 `junior.json` 里都有一条 `["src/data/gaokao","src/data/gaokaoHub"] status=confirmed`，措辞是"senior section 的内容，尚未产出可达档位矩阵"。
senior 接入后这两条应改成 `ownedBy: "senior"`（`checkHandoffs` 会校验目标 section 的 `dataRoots` 真的覆盖它们）。
**本轮是只读盘点，未改这两个文件**，等确认后一并改。
