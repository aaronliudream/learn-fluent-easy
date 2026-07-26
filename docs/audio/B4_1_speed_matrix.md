# B4.1 小学可达语速档矩阵（只读）

代码基准：**`origin/main` @ `fd0654f3`**（不是本地工作树——主工作树当前停在 `feat-wy9a-reading`，
不含 B1 的改动，按它核会得出过期结论）。核法：`git archive origin/main …` 导出后逐个调用点抓 speed 实参，
不靠记忆复述。

## 0. 结论先行

- 小学全站可达的 speed 取值共 **6 个**：`0.7 / 0.75 / 0.85 / 0.9 / 0.95 / 1.0`
- 但**没有任何一个文本需要 6 档全生成**。档位由「所在模块」决定，分三类：
  **固定 0.85** / **按年级固定（0.75-0.95）** / **用户可切换三档（0.7·0.85·1.0）**
- 方案 A 的实际含义：只有**听力测试关**和**句型课**这两个模块的文本需要 3 档，其余模块 1 档。
- `grade` 被 `resolvePrimaryGrade()` 硬钳在 **[3,6]**（`src/lib/primaryGrade.ts:5-6` MIN=3/MAX=6），
  因此 `getKidSpeed()` 的 `≤1 → 0.7` 分支、以及 `spellingStageConfig` / `listenWordStageConfig`
  里的 `middle` / `high` 两行在小学侧**永不可达**。

## 1. 矩阵

| # | 模块 | 组件:行（origin/main） | 文本来源 | 可达 speed 档位 | 自动播（非手势） |
|---|---|---|---|---|---|
| 1 | 认识单词关·单词卡 | `PrimaryHubStagePlay.tsx:250` `revealCard` | `grade{3..6}.json` `vocabulary[].en` | **0.85**（固定） | 否（翻卡/点 🔊） |
| 2 | 句型对话关 | `PrimaryHubStagePlay.tsx:789 / :804` `SentenceStage` | `dialogues[].lines[].text`（每单元前 4 组 q/a） | **0.85**（固定） | 否 |
| 3 | 听力测试关 | `PrimaryHubStagePlay.tsx:610`（题目）/ `:621`（答错后正音） | `listeningQuestions[].audio`、`opts[answer]` | **0.7 / 0.85 / 1.0 三档全可达** | 否 |
| 4 | 拼写关 | `SpellingStage.tsx:240` | `vocabulary[].en` | **按年级固定**：g3 `0.75` / g4 `0.85` / g5 `0.9` / g6 `0.95` | **是**（`:278` setTimeout 自动读） |
| 5 | 听音辨词关 | `ListenWordStage.tsx:97`（仅无预生成 URL 时） | `vocabulary[].en` | 同上按年级固定 | **是**（`:147` 250ms 自动播） |
| 6 | 句型课 | `SentenceLessonStage.tsx:63` `AudioBtn`（5 处使用） | `sentence/*.json` `question.en` / `answer.en` | **0.7 / 0.85 / 1.0 三档全可达** | 否 |
| 7 | 词汇游戏·拼写/雨点/打地鼠/泡泡 | `VocabSpellGame:52`、`VocabRainGame:75`、`VocabWhackGame:78`、`VocabBubbleGame:119` | 各年级 `vocabulary[].en`（排除 `type=phonics`） | **0.85**（固定） | **是**（useEffect 切词自动读） |
| 8 | 词汇游戏·手点重听 | `VocabSpellGame:152`、`VocabWhackGame:180`、`VocabBubbleGame:211` | 同上 | 0.85 | 否 |
| 9 | 词汇关 Quiz·揭晓读词 | `VocabQuizGame:74 / :183` | `vocabulary[].en` | 0.85 | 否（在 `choose()` 点击栈内） |
| 10 | 词汇关 Quiz·**语块按钮** | `VocabQuizGame:196` | `vocabulary[].chunks[].en` | 0.85 | 否 |
| 11 | 情景关·读整句 | `VocabContextGame:84 / :202` | 运行时 `cloze.replace('____', answer)` | 0.85 | 否 |
| 12 | 自然拼读·听一听 | `PrimaryHubPhonics:114` → `phonicsAudio.ts:27` | `phonics` `stage_1_listen[].word` | 0.85 | 否 |
| 13 | 自然拼读·找一找 | `PrimaryHubPhonics:201` | `stage_2_find[].word` | 0.85 | 否 |
| 14 | 自然拼读·闯关 | `PrimaryHubPhonics:299` | `stage_3_challenge[].options` | 0.85 | 否 |
| 15 | 英语闯关·听音选词 | `ListenChooseWordLevel:152` | fc seed `audio` | **`getKidSpeed(grade)`**：G3 `0.85` / G4-6 `1.0` | **是**（每题 250ms 自动 playTwice） |
| 16 | 英语闯关·听句选答 | `ListenChooseAnswerLevel:124` | fc seed `audio` | 同上 | **是** |
| 17 | 英语闯关·听句判图 | `ListenJudgePictureLevel:133` | fc seed `audio` | 同上 | **是** |
| 18 | 英语闯关·对话应答 | `DialogueResponseLevel:130` | fc seed `audio` | 同上 | **是** |
| 19 | 英语闯关·填空选词（选对后正音） | `FillInChooseLevel:147` | fc seed `audio`（填好的整句） | 同上 | 否 |
| 20 | 英语闯关·句子排序（选对后正音） | `SentenceOrderingLevel:121` | fc seed `display` | 同上 | 否 |
| 21 | 英语闯关·看图选词 | `PicMatchWordLevel:136` | fc seed `options[answer]` | 同上 | 否 |
| 22 | 闯关·强化训练 | 自身不播；复用 `ListenChooseWord/ListenChooseAnswer/ListenJudgePicture/OddOneOut/PicMatchSentence` 的 PlayCard | `fc-strengthen-questions` edge 动态出题 | 同上（沿用所复用关卡） | 随所复用关卡（听力三种=是） |

### 按文本来源汇总（B4.2 直接用这张）

| 文本来源 | 需要的档位 |
|---|---|
| `vocabulary[].en` | `0.85`（卡片+6 个游戏）**＋** 本年级档（g3 0.75 / g4 —— 与 0.85 重合 / g5 0.9 / g6 0.95） |
| `vocabulary[].chunks[].en` | `0.85` |
| `dialogues[].lines[].text`（前 4 组） | `0.85` |
| `listeningQuestions[].audio`、`opts[answer]` | `0.7`、`0.85`、`1.0` |
| `sentence/*.json` `question.en` / `answer.en` | `0.7`、`0.85`、`1.0` |
| fc seed `audio` / `display` / `options[answer]` | G3 `0.85`；G4-6 `1.0` |
| phonics 三个 stage 的词 | `0.85` |
| 情景关整句 | `0.85`（见 §3 的实测结论） |

## 2. 「三档全不可达」——零预生成需求的模块

| 模块 | 依据 |
|---|---|
| 读写关 `ReadWriteTrainingStage` | 全文件 grep `speak\|Audio\|audio` 零命中 |
| 词汇游戏·配对 `VocabMatchGame` | 只在 `:26` 预热、自身不发音（预热的是 0.85 单词，与其他游戏共用对象，不算浪费） |
| 闯关 `OddOneOutLevel` / `PicMatchSentenceLevel` / `ReadingJudgeLevel` / `SentenceTransformLevel` | 无 speakKid 引用（OddOneOut 源码注释明写"没有音频 → 不传 onBeforeStart"） |
| 错题本 `PrimaryHubMistakes` / AI 测评 `PrimaryHubAITest` / 学段测试 `StageTestPlay` | 无音频调用；AI 测评源码注释明写"该页无音频，故排除听力错题" |

## 3. 三个必须写进矩阵的实测细节

**① `PrimaryHubStagePlay.tsx:614` 的 `0.8 / 0.74` 是不可达分支**
全站唯一的 `ListenMcStage` 实例在 `:1124-1126`，`instruction="🎧 听一听，是哪一句？"` 含「句」
→ `isSentenceAudio=true`（`:587`）→ `useAdjustableSpeakSpeed=true` → 永远在 `:610` 就 return。
**这两个语速在小学侧不产生任何音频请求，B4 不为它们生成。**

**② 情景关的整句 = 语块原文，但有 6 条例外**
`full = cloze.replace('____', answer)`，而 `makeCloze` 用的是**大小写不敏感**正则挖空
（`context.ts:33` `new RegExp('\\b'+hw+'\\b','i')`），所以句首大写会被替换成小写词形。
实测 835 对候选 (词, 语块)：**829 条 `full` 与 `chunk.en` 逐字相同**（复用同一音频对象），
**6 条只差句首大小写**，是独立 cache key：

```
"Wow, it's big!"        → "wow, it's big!"
"Wow, so nice!"         → "wow, so nice!"
"Yum!"                  → "yum!"
"Whose coat is this?"   → "whose coat is this?"
"Whose pants are those?"→ "whose pants are those?"
"Wait a minute!"        → "wait a minute!"
```

→ B4.2 要为这 6 条单列 @0.85（不列的话情景关点这几题会现场冷合成）。

**③ 三处 C2「预热灌错 key」的成因已查清：全是传错 speed，没有一处是传错 voice**
三处的 voice 都是 `el:lily`（`prefetchTTSBatchKid` 内部写死 `KID_VOICE_ID`，调用方无从传错），
差异全部出在 speed：

| # | 位置 | 预热用的 speed | 播放用的 speed | 成因 |
|---|---|---|---|---|
| C2-1 | `PrimaryHubStagePlay.tsx:765` vs `:789/:804` | `{grade}` → `getKidSpeed()` → G3 0.85 / **G4-6 1.0** | 固定 `0.85` | 调用方**漏传 speed**，落到 `getKidSpeed` 默认值 |
| C2-2 | `PrimaryHubPhonics.tsx:189` vs `:201` | `{grade}` → G4 = **1.0** | 固定 `0.85` | 同上，漏传 speed |
| C2-3 | `VocabQuizGame:64` / `VocabContextGame:71` vs `:196` / `:84` | speed 正确（0.85），但**预热的文本集合不含语块 / 整句** | 0.85 | 不是 speed 错，是**文本集合漏了** |

→ 结论：C2-1 / C2-2 是**调用方一行参数的事**（`{grade}` → `{grade, speed: 0.85}`），
C2-3 是**预热集合要并入 chunks / full**。三处都需要改调用方，但都不涉及 key 公式、不涉及 voice。
**本阶段（B4.1 只读）未改任何代码**，改法留给 B4.2 决策后执行。

## 4. 对 B4.2 的预期影响（先说口径，数字等 B4.2 实算）

Phase A 的「403 条文本部分档位缺音频」是按**三档全铺**统计的。按本矩阵会明显变少，因为：

- 占比最大的 `vocabulary[].en`（442 个）只需 0.85 + 本年级档，**不需要 0.7 / 1.0**；
- `chunks[].en`（1017 个）、dialogues、phonics 只需 0.85 单档；
- 真正需要三档的只有 `listeningQuestions`（213×2）与 `sentence/*.json`（373+186）；
- fc seed 每个年级只需 1 档（G3 0.85 / G4-6 1.0）。

B4.2 会以本矩阵为准做交叉，并对 403 这个数字逐项对账说明差异来源。

---

**等确认后再进 B4.2。**
