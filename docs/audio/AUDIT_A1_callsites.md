# 小学板块音频播放入口盘点（Phase A · Step 1）

> 只读审计，未修改任何源码。扫描范围：`src/pages/primaryHub/**`、`src/pages/Primary.tsx`、
> `src/components/primaryHub/**`（含 `finalChallenge/levels/**`）、`src/lib/primaryHub/**`，
> 以及它们依赖的共享播放层 `src/lib/speak.ts` / `src/lib/webSpeech.ts`。
> 扫描命令（本次实跑）：
> `grep -rn "hubSpeak(|hubSpeakAtSpeed(|speakKid(|speakFromUrl(|speakWebSpeech(|new Audio(|unlockAudioSync|prefetchHubVocabulary(|prefetchTTSBatchKid(|stopSpeaking(" src/pages/primaryHub src/components/primaryHub src/lib/primaryHub`

## 0. 播放层结构（谁是「统一入口」）

```
组件
 ├─ hubSpeak / hubSpeakAtSpeed / prefetchHubVocabulary   src/lib/primaryHub/speech.ts   ← 小学统一封装
 │    └─ speakKid / prefetchTTSBatchKid                  src/lib/speak.ts               ← 全站统一 TTS 入口
 │         └─ speak() → unlockAudioSync() → fetchTTS() → CDN mp3 → sharedAudio.play()
 │              └─ 失败兜底 speakBrowserFallback()（SpeechSynthesis）
 ├─ speakKid / speakFromUrl / prefetchTTSBatchKid（直调 speak.ts，绕开 speech.ts 封装但仍是统一入口）
 ├─ speakWebSpeech()                                     src/lib/webSpeech.ts           ← ✖ 绕过统一入口（浏览器 TTS）
 └─ new Audio(url).play()                                src/lib/primaryHub/phonicsAudio.ts ← ✖ 绕过统一入口（捆绑 MP3）
```

统一入口的判定标准：**是否最终由 `src/lib/speak.ts` 的 `speak()` 驱动**（内容寻址缓存 + 共享 `<audio>` 元素 + iOS 解锁 + 浏览器兜底）。

## 1. 调用点清单

| 文件路径 | 组件 / 函数 | 调用方式 | 走统一 TTS 入口 | unlockAudioSync |
|---|---|---|---|---|
| `src/lib/speak.ts` | `speak` / `speakKid` / `speakFromUrl` / `prefetchTTS*` | 统一入口本体：`sharedAudio.play()`（:335/:534）、`new Audio(url)` 兜底（:546） | ✅ 本体 | ✅ :327 定义，`speak()` :618 同步调用 |
| `src/lib/webSpeech.ts` | `speakWebSpeech` | `speechSynthesis.speak(new SpeechSynthesisUtterance(...))` :105 | ❌ 绕过（浏览器 TTS） | ❌ 不适用 |
| `src/lib/primaryHub/speech.ts` | `hubSpeak` :41 / `hubSpeakAtSpeed` :63 | `void speakKid(...)` :37 | ✅ | 间接（`speak()` 内部同步调用） |
| `src/lib/primaryHub/speech.ts` | `hubSpeak` 的 `o'clock` 分支 :48-56 | `speakWebSpeech(spoken, rate)` :53 | ❌ **绕过** | ❌ |
| `src/lib/primaryHub/phonicsAudio.ts` | `playPhonicsAudio` :7 | **`new Audio(url).play()`** :20-22（捆绑 MP3），`.catch → hubSpeak` :24 | ❌ **绕过**（兜底才回到统一入口） | ✅ :15（同步，先于 `new Audio`） |
| `src/pages/primaryHub/PrimaryHubStagePlay.tsx` | `VocabStage.revealCard` :250 | `hubSpeak(word, 0.85, grade)` | ✅ | ❌ 无显式调用（依赖 `speak()` 内部；均在 onClick 内） |
| `src/pages/primaryHub/PrimaryHubStagePlay.tsx` | `VocabStage` 预热 :274 | `prefetchHubVocabulary(words, grade, 0.85)` | ✅ | — |
| `src/pages/primaryHub/PrimaryHubStagePlay.tsx` | `ListenMcStage.speakPrompt` :606-615 | `hubSpeakAtSpeed(text, speed, grade)` :610（:614 的 0.8/0.74 分支实测不可达，见 §3） | ✅ | ❌ 无显式调用 |
| `src/pages/primaryHub/PrimaryHubStagePlay.tsx` | `ListenMcStage.speakCorrectAnswer` :617-625 | `hubSpeakAtSpeed` :621 | ✅ | ❌ |
| `src/pages/primaryHub/PrimaryHubStagePlay.tsx` | `ListenMcStage` 预热 :600 | `prefetchTTSBatchKid(audio[], {grade, speed})` | ✅ | — |
| `src/pages/primaryHub/PrimaryHubStagePlay.tsx` | `SentenceStage` :789 / :804 | `hubSpeak(s.q / s.a, 0.85, grade)` | ✅ | ❌ |
| `src/pages/primaryHub/PrimaryHubStagePlay.tsx` | `SentenceStage` 预热 :765 | `prefetchTTSBatchKid(texts, {grade})` ⚠️ 速度与播放不一致（§3 C2-1） | ✅ | — |
| `src/components/primaryHub/ListenWordStage.tsx` | `playWord` :77-109 | 优先 `speakFromUrl(audioUrl)` :92（预生成 CF MP3）；无 URL 时 `speakKid` :97；再兜底 `speakWebSpeech` :102 | ✅（`speakFromUrl`/`speakKid`）+ ❌（webSpeech 兜底） | ✅ :128（`handleStart` 首行同步） |
| `src/components/primaryHub/ListenWordStage.tsx` | 预热 :113-117 | `prefetchTTSBatchKid(needWarm, {grade, speed: cfg.speechRate})`（只热没有预生成 URL 的词） | ✅ | — |
| `src/components/primaryHub/SpellingStage.tsx` | `playWord` :227-256 | `speakKid(spoken, {grade, speed})` :240，`.catch → speakWebSpeech` :245 + Toast :247 | ✅ + ❌ 兜底 | ✅ :193（`handleStart` 首行） |
| `src/components/primaryHub/SpellingStage.tsx` | 预热 :259-265 | `prefetchTTSBatchKid(vocabulary.en[], {grade, speed})` | ✅ | — |
| `src/components/primaryHub/SentenceLessonStage.tsx` | `AudioBtn` :47-67（被 :116/:126/:387/:412/:419 使用） | `hubSpeakAtSpeed(text, speed, grade)` :63 | ✅ | ❌ 无显式调用 |
| `src/components/primaryHub/SentenceLessonStage.tsx` | 预热 :541-552 | `prefetchTTSBatchKid(texts, {grade: g, speed})` | ✅ | — |
| `src/pages/primaryHub/PrimaryHubPhonics.tsx` | `ListenStage.play` :112-116 | `playPhonicsAudio(url, word, grade)` → **`new Audio`** | ❌ 绕过（兜底回到统一入口） | ✅（在 `phonicsAudio.ts:15`） |
| `src/pages/primaryHub/PrimaryHubPhonics.tsx` | `FindStage.toggle` :199-208 | `hubSpeak(word, 0.85, grade)` :200 | ✅ | ❌ |
| `src/pages/primaryHub/PrimaryHubPhonics.tsx` | `ChallengeStage` :298 | `hubSpeak(q.options[idx], 0.85, grade)` | ✅ | ❌ |
| `src/pages/primaryHub/PrimaryHubPhonics.tsx` | 预热 :188-192 | `prefetchTTSBatchKid(find.words, {grade})` ⚠️ 速度不一致（§3 C2-2） | ✅ | — |
| `src/pages/primaryHub/vocabGames/VocabQuizGame.tsx` | 单词 :74 / :183，**语块 :196** | `hubSpeak(en, 0.85, grade)` | ✅ | ✅ :63（`begin()`） |
| `src/pages/primaryHub/vocabGames/VocabSpellGame.tsx` | 每题自动播 :52（useEffect）/ 手点 :152 | `hubSpeak(cur.en, 0.85, grade)` | ✅ | ✅ :109 |
| `src/pages/primaryHub/vocabGames/VocabRainGame.tsx` | 自动播 :75 | `hubSpeak(cur.en, 0.85, grade)` | ✅ | ✅ :130 |
| `src/pages/primaryHub/vocabGames/VocabWhackGame.tsx` | 自动播 :78 / 手点 :180 | `hubSpeak(cur.en, 0.85, grade)` | ✅ | ✅ :132 |
| `src/pages/primaryHub/vocabGames/VocabBubbleGame.tsx` | 自动播 :119 / 手点 :211 | `hubSpeak(cur.en, 0.85, grade)` | ✅ | ✅ :165 |
| `src/pages/primaryHub/vocabGames/VocabContextGame.tsx` | 选完读整句 :84 / 手点 :202 | `hubSpeak(q.full, 0.85, grade)` ⚠️ `q.full` 不在预热集合内（§3 C2-3） | ✅ | ✅ :70 |
| `src/pages/primaryHub/vocabGames/VocabMatchGame.tsx` | 无发音（只预热 :26） | — | — | ✅ :25 |
| `src/components/primaryHub/finalChallenge/levels/ListenChooseWordLevel.tsx` | `playWord` :152 + `playTwice` :176 | `speakKid(word, {grade})`，`.catch → speakWebSpeech` :156 | ✅ + ❌ 兜底 | ✅ :44（`onBeforeStart` :106） |
| `.../ListenChooseAnswerLevel.tsx` | :124 / :148 | 同上 | ✅ + ❌ | ✅ :35（:78） |
| `.../ListenJudgePictureLevel.tsx` | :133 / :156 | 同上 | ✅ + ❌ | ✅ :44（:87） |
| `.../DialogueResponseLevel.tsx` | :130 / :154 | 同上 | ✅ + ❌ | ✅ :39（:83） |
| `.../FillInChooseLevel.tsx` | :147 | `speakKid(text, {grade})`，`.catch → speakWebSpeech` :150 | ✅ + ❌ | ✅ :38（:82） |
| `.../SentenceOrderingLevel.tsx` | :121 | 同上 :124 | ✅ + ❌ | ✅ :40（:83） |
| `.../PicMatchWordLevel.tsx` | :136 | `void speakKid(q.options[q.answer], {grade})` | ✅ | ❌ **无**（也无预热，见 §3/§5） |
| `.../OddOneOutLevel.tsx` / `.../PicMatchSentenceLevel.tsx` / `.../ReadingJudgeLevel.tsx` / `.../SentenceTransformLevel.tsx` | 设计上无音频 | — | — | — |
| `src/pages/primaryHub/PrimaryHubFinalChallengeStrengthen.tsx` | 强化训练壳 | `prefetchTTSBatchKid(audios, {grade})` :87 | ✅ | ✅ :233（`onBeforeStart={unlockAudioSync}`） |

## 2. 绕过统一入口的高风险区（3 处）

| # | 位置 | 绕过方式 | 风险 |
|---|---|---|---|
| **B-1** | `src/lib/primaryHub/phonicsAudio.ts:20` `new Audio(url).play()` | 直接播 `public/` 下捆绑 MP3，不走内容寻址缓存、不走共享 `<audio>` 元素 | 6 个 MP3 **实际不存在**（`public/audio/primary/phonics/g4v2_u1/` 只有 README.md）。线上 `vercel.json` 把 `/(.*)` 全部 rewrite 到 `/index.html` → 请求返回 **200 + text/html**（实测：`HEAD https://bigmoonenglish.com/audio/primary/phonics/g4v2_u1/water.mp3` → `200 text/html; charset=utf-8`）。`play()` 因源不可解码而 reject → 落到 `hubSpeak` 兜底。兜底本身是冷 key（stage_1 的词从未被预热），且此时已脱离同步手势栈 |
| **B-2** | `src/lib/primaryHub/speech.ts:53` `speakWebSpeech`（`o'clock` 词卡专用分支） | 走浏览器 SpeechSynthesis，音色与全站 el:lily 不一致 | 仅影响 `o'clock` 单词卡；`isWebSpeechSupported()` 为假时回落 `hubSpeakCloud`，逻辑完整。风险等级低 |
| **B-3** | 各关卡 `.catch(() => speakWebSpeech(...))`（ListenWordStage:102、SpellingStage:245、6 个 FC 关卡） | TTS 失败后改用浏览器 TTS | 兜底路径本身合理；问题是**失败零上报**（详见 `AUDIO_AUDIT_REPORT.md` §5） |

## 3. 与 Step 4 分类关联的入口级发现（详细结论见 AUDIO_AUDIT_REPORT.md）

- **C2-1**：`PrimaryHubStagePlay.tsx:765` 句型对话预热用 `{grade}` → 速度 = `getKidSpeed(grade)`（三年级 0.85、四~六年级 **1.0**），而播放 `:789/:804` 固定 `0.85` → 四~六年级预热全部落空。
- **C2-2**：`PrimaryHubPhonics.tsx:188` 预热用 `{grade}`（g4 → 1.0），播放 `:200` 用 `0.85` → 预热全部落空。
- **C2-3**：`VocabContextGame` 预热的是 `item.answer`（单词），播放的是 `q.full`（整句）；`VocabQuizGame` 语块按钮 `:196` 播 `chunk.en` 也不在预热集合内。
- **C5 相关**：`PrimaryHubStagePlay.tsx:614` 的 `isSentenceListen ? 0.74 : 0.8` 为**不可达分支**——全站唯一的 `ListenMcStage` 实例（:1125-1126）`instruction="🎧 听一听，是哪一句？"` 含「句」→ `isSentenceAudio=true` → 永远走 `:610` 的可调速分支。0.74/0.8 两个速度在小学侧不产生任何音频请求。

## 4. 覆盖面说明（哪些小学入口确认「不发音」）

| 位置 | 结论 | 证据 |
|---|---|---|
| `src/pages/primaryHub/PrimaryHubUnit.tsx` / `PrimaryHubUnitDispatch.tsx` / `PrimaryHubUnitGamified.tsx`（禁改 4 文件） | 无任何音频调用；关卡内容由 `PrimaryHubStage.tsx → PrimaryHubStagePlay.tsx` 渲染 | grep 无命中 |
| `src/components/primaryHub/ReadWriteTrainingStage.tsx`（读写关） | 全程无音频 | grep `speak\|Audio\|audio` 零命中 |
| `src/pages/primaryHub/PrimaryHubMistakes.tsx`（错题本） | 听力错题存了 `audio` 文本但**没有复听按钮** | grep 零命中 |
| `src/pages/primaryHub/PrimaryHubAITest.tsx`（AI 测评） | 明确排除听力错题，因为该页无音频（源码注释 :16-19） | 源码注释 |
| `src/pages/StageTestPlay.tsx`（学段测试，读 `primary_vocab`） | 无音频调用 | grep 零命中 |
| Supabase 表 `primary_reading_articles`(40 行) / `primary_vocab`(846 行) / `primary_lessons`(4 行) | 存有英文文本，但**消费方只有家长端统计组件**（`src/components/parent/*`）与 `useMasteryOverview.ts`，无任何播放调用 → 不产生 TTS 请求 | 本次 REST 实测行数 + grep 消费方 |
| `public/audio/hub/oclock.mp3`（27264 bytes，线上 200 audio/mpeg） | 仓库内**无任何引用**（孤儿资源） | grep `oclock.mp3` 零命中 |

因此：**小学 3–6 年级的全部发音文本 100% 来自本地 JSON/TS 内容文件，无一条来自 Supabase 表。**
