# 初中（junior）音频全量盘点（只读 · 未生成任何音频）

抽取：`scripts/audio/extract.mjs` + `scripts/audio/audio-sources/junior.json`（与小学共用同一套，未另写）。
存在性判定：对 `https://audio.bigmooneducation.com/<2hex>/<64hex>.mp3` 逐个 HEAD，**200 且 ≥2KB** 才算存在。
分组统计：`scripts/audio/junior-breakdown.mjs`（只做分组，不做抽取）。
档位依据：`docs/audio/JUNIOR_1_speed_matrix.md`（v2，本轮逐条复核过）。

> 本轮**未生成、未删除任何音频对象，未改任何播放代码**（唯一的代码改动是上一提交 `965a6c1d` 的默写关预热修复）。

> **⚠️ 数字时效**：本文是**生成前**的快照（覆盖 35.7%、缺口 9502）。
> 那 9502 条**已经全部生成完毕**，junior 现在是 **14770/14770，缺失 0** —— 见 `docs/audio/JUNIOR_3_generation.md`。
> 本文的缺口数字与 `data/audio-audit/junior_missing.csv` 都只作历史留档，别当现状读。
> 仍然有效的是：档位口径、双出版社结论、§4 那五件事、§6 口径说明。

---

## 1. 总量

**可达对象 14770 · 已存在 5268 · 缺口 9502 · 覆盖率 35.7%**
（小学是 3436/3436 = 100%；初中从来没跑过预生成，35.7% 是历史上被真人点出来的那部分自然沉淀。）

缺口清单：`data/audio-audit/junior_missing.csv`（9502 行，可直接喂 `backfill-missing-audio.ts --list`）。

### 按档位

| 档位 | 音色@速度 | 可达 | 缺口 | 覆盖率 |
|---|---|---:|---:|---:|
| `hubNormal` | el:lily @0.85 | 6205 | 4602 | 25.8% |
| `hubListen` | el:lily @0.8 | 2795 | 689 | **75.3%** |
| `hubSlow` | el:lily @0.7 | 2795 | 2044 | 26.9% |
| `userDefault` | **nova** @0.85 | 2707 | 1944 | 28.2% |
| `fcKid` | el:lily @1.0 | 268 | 223 | 16.8% |
| **合计** | | **14770** | **9502** | **35.7%** |

`hubListen` 覆盖率明显高，是因为听音辨词天天有人点，词在 0.8 档被真人喂熟了；
同一批词的 0.7 档（答错正音/词表点读）只有 29.3% —— 答错的人少，所以那一档最冷。

### 按字段

| 字段@档位 | 可达 | 缺口 | 覆盖率 |
|---|---:|---:|---:|
| `word@hubNormal` | 2547 | 1042 | 59.1% |
| `word@hubListen` | 2547 | 569 | 77.7% |
| `word@hubSlow` | 2547 | 1800 | 29.3% |
| `word@userDefault` | 2547 | 1785 | 29.9% |
| `chunks.en@hubNormal`（JSON 语块） | 1837 | 1773 | 3.5% |
| `phrase_en@hubNormal`（DB 短语） | 1439 | 1415 | 1.7% |
| `example_en@hubNormal`（DB 例句） | 350 | 349 | 0.3% |
| `audio@fcKid`（闯关） | 246 | 201 | 18.3% |
| `listeningQuestions.audio@hubListen` | 223 | 102 | 54.3% |
| `listeningQuestions.opts[answer]@hubSlow` | 223 | 223 | **0.0%** |
| `transcript@userDefault`（听力整段） | 160 | 159 | **0.6%** |
| `vocabulary.en@hubNormal/Listen/Slow`（JSON 回退词） | 25×3 | 20/18/21 | 20/28/16% |
| `display@fcKid`（排序关） | 22 | 22 | 0.0% |
| `SENTENCE_PATTERNS.q/a@hubNormal` | 4+3 | 1+2 | 57.1% |

三处 ~0%，都能解释、也都值得注意：
- **语块几乎全冷**（可达 3626 条 = JSON chunks 1837 + DB phrase 1439 + example 350，其中 **3537 条缺**）。这是最大一块缺口，占总缺口的 **37%**。语块按钮点的人少，但每次点都要等 1–3 秒。
- **听力选项正音 223 条一条都没有**。它只在答错时触发，而且是 0.7 这个独有档位，从没被喂熟过。
- **160 条无 MP3 的听力整段只有 1 条存在**。这批是最长的文本（中位 113 字符、最长 1029），冷合成也最久。

### 按内容源

| 来源 | 可达 | 缺口 | 覆盖率 |
|---|---:|---:|---:|
| `table:junior_vocab` | 11977 | 6960 | 41.9% |
| `src/data/juniorHub/grade7.json` | 1621 | 1517 | 6.4% |
| `src/data/juniorHub/grade8.json` | 636 | 549 | 13.7% |
| `finalChallenge/grade7_v2_seed.json` | 169 | 166 | 1.8% |
| `table:junior_listening_exercises` | 160 | 159 | 0.6% |
| `src/data/juniorHub/grade9.json` | 101 | 91 | 9.9% |
| `finalChallenge/grade7_v1_seed.json` | 99 | 57 | 42.4% |
| `JuniorHubStagePlay.tsx`（句型关常量） | 7 | 3 | 57.1% |

---

## 2. 缺口落在哪：自动播 vs 点击

这一栏是本盘点最该看的一栏。冷 key 在两种路径上的后果完全不同：

| 路径 | 冷 key 的后果 |
|---|---|
| **点击触发**（junior 绝大多数） | 等 1–3 秒云端合成，**会出声** |
| **自动播**（非手势） | `speak.ts:607-611` / `speakKid` 同型分支：只预热、**不出声** = 用户眼里的"这个词不发音" |

junior 的自动播只有两处（矩阵 §1.B / §1.C）：

1. **闯关 听音选词 / 情景应答** —— mount 后 250ms `playTwice`，`el:lily @1.0`
2. **词汇板块 默写游戏 `DictationSession`** —— `useEffect` 依赖 `cur?.id`，每换一词就读，`nova @0.85`
   （进关首词要等掌握度/词表两个异步查询回来，最容易掉出 `userActivation` 窗口 → 冷 key 就是静音）

| 自动播路径 | 音色@速度 | 可达 | 缺口 | 覆盖率 |
|---|---|---:|---:|---:|
| 词汇板块 默写游戏 `DictationSession` | nova @0.85 | 2547 | **1785** | 29.9% |
| 闯关 听音选词 / 情景应答 | el:lily @1.0 | 131 | **110** | 16.0% |
| **小计** | | **2678** | **1895** | **29.2%** |

**1895 个对象落在自动播路径上，这就是"有的单词不发音"的初中版本**——不是慢，是没声音。
它占总缺口的 20%，但影响的是最像 bug 的那种体验，优先级应当高于其余 7607 个。

（默写游戏那 2547 是整个词池：进关抽哪批词随掌握度变，所以整池都算在自动播风险面上。
闯关那 131 只算 `listen_and_choose_word` + `dialogue_response` 两关的题目，填空/排序两关是点击触发，不在内。）

---

## 3. 双出版社

`publisher` **不进 cache key**（key = `provider|voice|speed|accent|text`），所以同一个词在人教/外研下命中同一个对象——
两社重合的 902 个词形只占一份存储，这是对的、也是省钱的（详见矩阵 §2）。
下面按出版社分组只是为了让你知道"缺口主要欠谁"，不代表它们是不同对象。

| 出版社 | 词表源可达对象 | 缺口 | 覆盖率 |
|---|---:|---:|---:|
| 人教 `junior` | 8709 | 5051 | 42.0% |
| 外研 `junior_fltrp` | 3268 | 1909 | 41.6% |

两社覆盖率几乎一样（42.0% / 41.6%），说明**没有哪一社被系统性冷落**——
差异只来自词量（人教 2434 行 / 外研 1338 行），不是链路问题。

`junior_listening_exercises`（grade 7–9 共 633 行）按社拆开：

| | 有预生成 MP3 | 无 MP3（要现场 TTS 读整段） |
|---|---:|---:|
| 外研 `junior_fltrp` | 186 | **0** |
| 人教 `junior` | 287 | **160** |

外研 186 条全部有 MP3（wy7A/7B/8A/8B 那轮补齐的），**欠账全在人教这 160 条**。

---

## 4. 本轮查出来的五件事

### 4.0 共用 CSV 解析器对"带换行的单元格"是坏的 —— **已修**

第一次统计时按 CSV 算出 9974 条缺口，而导出侧写的是 9502 条。差值不是舍入，是 bug：
`csv.mjs` 的 `parseCsv` **先按换行切行、再处理引号**，于是任何含换行的单元格都会被切成几条垃圾记录
（初中听力 `transcript` 是整段原文，天然多行）。表现是"条数变多、解析看起来成功、cache_key 全是碎片"。

后果不止统计失真：**`backfill-missing-audio.ts` 读生成清单走的是同一个解析器**——
真去生成时，这 160 条听力会按碎片文本合成，生成出一批永远命中不了的对象。

修复：`parseCsv` 改成单趟扫描（引号内的换行属于内容，CRLF 与 LF 都认）。
单测加两条并做了变异验证：引号内换行按旧行为断行 → 1 红；去掉 CR 处理 → 4 红。
修完重跑，统计与导出**逐条对上（9502 = 4602+689+2044+1944+223）**。
本节所有数字都是修复后的；修复前那版把 `transcript@userDefault` 少报成"缺 21"，实际缺 **159**。

> 下面四条都**不是**音频缺口，但都影响你怎么读上面的数字。

### 4.1 `junior_listening_items` 的 384 道听力题**从来没被用上**（产品 bug）

`juniorFinalQuiz.ts:288` 抽单元通关听力题时 select 里带了 `audio_url`，
而这张表**没有这一列** —— PostgREST 直接 400（实测报错 `column junior_listening_items.audio_url does not exist`），
supabase-js 返回 `data=null`，代码 `data ?? []` 把错误吞掉 → 永远 0 行 → 每次都回退到内联 JSON 题。

- 影响面：`7B / 8A / 8B` 各 128 题，共 **384 题、384 条唯一 audio_text**，全部 publisher=`junior`。
- 与音频的关系：**现在播不到，所以不进盘点**。修好那天它们就变成 0.8 档的可达文本，必须同步加表源。
- 已埋绊线：`audioTableSource.test.ts` 里那条测试——select 一旦不再带 `audio_url` 而 `junior.json` 没加表源，就红。
- **我没有动它**：去掉这一列会让单元通关的听力题从"内联 6 题回退"变成"DB 题库 3 题"，是内容行为变化，你拍板。

### 4.2 错题本朗读用的是**随机音色**，任何预生成都注定 miss

`/mistakes` 的朗读走 `speakTTS(text, { voiceId: getAlexVoice() })`，
而 `getAlexVoice()`（`src/lib/alexVoice.ts:22`）是**首次使用时从 6 个 OpenAI 音色里随机挑一个**并写进 localStorage。
→ 同一句错题原文，在不同用户那里是 6 个不同 cache key；预生成任何一个都只覆盖 ~1/6 的用户。

这不只是 junior 的事（错题本是全站统一的，gaokao / american 同理）。三条路可选，都要你定：
① 错题本改成固定音色（最省，和其它页音色不统一）；
② 按 6 音色全量生成（对象数 ×6）；
③ 维持现状，接受错题本朗读永远是冷合成（点击触发，不会静音，只是慢）。

### 4.3 闯关题库只有七年级

`questionBank.ts` 只 import 了 `grade7_v1_seed` / `grade7_v2_seed`，八/九年级 FC 无题库。
这是内容缺口不是音频缺口——**但它同时意味着**：自动播那两关的风险面目前只覆盖七年级。

### 4.4 PR 闸门只跑 primary

`.github/workflows/audio-precheck.yml` 写死 `--section primary`，`audio-audit.yml` 同理。
改 `src/data/juniorHub/**` 现在**过不了任何音频检查**（会被判定为"没触及 primary 内容目录"直接放行）。
junior 接进 CI 需要给 workflow 配 `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`（表源要连库；这两个值本来就随前端 bundle 公开）。
本轮没动 workflow —— 加不加、什么时候加，等你确认生成方案之后一起做更省事。

---

## 5. 建议的生成顺序（等你确认才动手）

不建议一把梭 9502 条：分批能让"最像 bug 的那部分"先落地，也便于中途看效果。

| 批次 | 内容 | 条数 | 理由 |
|---|---|---:|---:|
| **P0** | 自动播两条路径的缺口（默写游戏 nova@0.85 的 1785 + 闯关 1.0 的 110） | **1895** | 冷 key = 真静音，用户直接说"不发音" |
| **P1** | 无 MP3 听力整段 159 + 听力选项正音 223 | **382** | 文本最长/覆盖率最低（0.6% 与 0%），一点就卡 |
| **P2** | 词的三个 hub 档（0.85 的 1042 + 0.8 的 569 + 0.7 的 1800；与 P0 不重合，P0 那档是 nova） | 3411 | 主干体验，点击触发但用得最多 |
| **P3** | 语块（JSON chunks 1773 + DB phrase 1415 + example 349） | 3537 | 量最大、频次最低，最后铺 |
| **P4** | 闯关剩余 113 + JSON 听力题干 102 + JSON 回退词 59 + 句型关 3 | 277 | 收尾 |

四批相加 = 1895+382+3411+3537+277 = **9502**，与清单条数一致。
脚本复用 `backfill-missing-audio.ts --list data/audio-audit/junior_missing.csv`（支持断点续跑），
分批按 `field` 列过滤出子清单即可。耗时我没有可引用的实测（B3 那次的速率没记），跑 P0 时顺手记一次再外推。

---

## 6. 口径说明（免得数字被误读）

- **JSON 与 DB 取并集，不是二选一。** `useUnitVocab` 是 unit 级二选一（DB 有行走 DB，无行回退 JSON），
  但"哪些 unit 会回退"随 DB 内容变。取并集的代价是多算了一点重复文本，好处是不会出现"某 unit 回退了却没人给它生成音频"。
  实测重合度：JSON 词 907 个里 **882 个 DB 里也有**（只多 25 个）；JSON 语块 2043 个里只有 173 个在 DB 里，**1870 个是 JSON 独有**（语块是七/八年级那批 chunk 工程灌进 JSON 的，没进 `junior_vocab`）。
- **同一个词横跨三档**（0.85 / 0.8 / 0.7），三档是三个对象。只按"词卡 0.85"一档看会低估三分之二。
- **用户设置音色只生成默认档 nova@0.85**（你定的）。其余 5 音色 × 5 语速视为按需冷合成。
- **`junior_reading`（460 行）零播放调用**，`JuniorReading*` 三个页面 grep 音频 API 零命中，不进盘点。
- **有预生成 `audio_url` 的 473 条听力**走 `speakFromUrl` 播固定 MP3，不经运行时 key，不进盘点；
  没有 URL 的 **160 条**（全是人教、8 年级 74 + 9 年级 86）才会现场 `speak(transcript)` 读整段，已计入。
