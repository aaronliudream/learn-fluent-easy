# 小学板块 TTS 音频全量审计报告（Phase A · 只读）

审计日期：2026-07-25 ｜ 范围：小学 3–6 年级全部会触发发音的文本 ｜ **本阶段未修改任何源码**
产出物：
- `docs/audio/AUDIT_A1_callsites.md`（Step 1 播放入口盘点）
- `data/audio-audit/primary_text_inventory.csv`（Step 2 全量文本清单，6355 行）
- `data/audio-audit/primary_audio_status.csv`（Step 3 CDN 校验结果，6355 行）
- 本文件（Step 4 分类归因 + Step 5 静默失败专项）

---

## 0. 关键规则的实测依据（不靠推断）

| 项 | 取值 | 来源 |
|---|---|---|
| cache key 输入 | `` `${provider}\|${selectedVoice}\|${safeSpeed}\|${accentUpper}\|${safeText}` `` | `supabase/functions/tts/index.ts:318` |
| safeText | `String(text).slice(0, 4000)`（edge 侧不做任何归一化） | 同上 :299 |
| 客户端归一化 | `speak()` 先 `text.trim()`（`src/lib/speak.ts:595`），`fetchTTS` 再 `cleanForTTS(text)`（:411）；hub 路径额外 `toHubTtsText()`（`src/lib/primaryHub/speech.ts:18-22`，弯撇号→ASCII） | 源码 |
| safeSpeed | `Math.min(1.2, Math.max(0.6, Number(speed) \|\| 0.95))` | edge :298 |
| 存储路径 | `hash.slice(0,2) + "/" + hash + ".mp3"`，桶 `tts-audio` | edge :320 |
| 小学 voice | 恒为 `el:lily`（`KID_VOICE_ID`，`src/lib/speak.ts:748`），provider 恒为 `elevenlabs`，accent 恒为空 | 源码 + 全部命中 |
| 生产播放地址 | `https://audio.bigmooneducation.com/<2hex>/<hash>.mp3` | **实测**：调线上 `tts` edge（`{text:"ruler",voiceId:"el:lily",speed:0.75}`）返回 `{"audioUrl":"https://audio.bigmooneducation.com/3f/3f9a…87d.mp3","cached":true,"provider":"elevenlabs"}` |

**公式正确性验证**：用上表复刻的 keyInput 对 `src/data/primaryHub/listenWordAudio.json` 里 **439 条线上预生成 URL** 逐条重算 hash，**439/439 全部一致，0 条错配**。

> ⚠️ 顺带发现（不属本次分类，但影响后续维护）：仓库里的 `supabase/functions/tts/index.ts:91-94` `publicUrlFor()` 拼的是 `${SUPABASE_URL}/storage/v1/object/public/tts-audio/<path>`，而**线上部署实际返回 CF 域名 + 裸 path**。仓库源码与线上部署在 URL 构造上不一致（hash 规则一致）。

---

## 1. 汇总

| 维度 | 数量 |
|---|---|
| 清单总行数（callsite × 文本 × 语速） | **6355** |
| 去重后唯一英文文本 | 2079 |
| 去重后唯一音频对象（hash） | **3444** |
| HEAD 200 且 `audio/mpeg` | 4143 行 / 1880 个唯一对象 |
| HEAD 400（对象不存在） | 2205 行 / 1557 个唯一对象 |
| 200 但体积异常（<2KB） | 1 |
| 捆绑 MP3 缺失（返回 SPA index.html） | 6 |
| CDN 与存储不一致（C4） | **0** |

校验方式：对每条记录同时 HEAD **CF 生产域**与 **Supabase 公共桶**两个 host，并发 10、失败重试；首轮两个 host 均出现 429 限流（435/441 条），已按并发 3 + 指数退避**全部重探**，最终结果中 **0 条 429、0 条超时**。

---

## 2. 分类归因

| 类别 | 数量 | 判定 |
|---|---|---|
| **C1 数据缺陷** | **7** | 6 条捆绑 MP3 缺失 + 1 条疑似损坏音频；**文本层面 0 缺陷** |
| **C2 Key 不一致** | **403 条文本**（涉 851 行只在切换语速后才会用到的 key）+ **3 处预热/播放速度错配** | 见 §2.2 |
| **C3 存储缺失** | **2205 行 / 1557 个唯一对象** | key 正确、存储桶无对象（从未合成过） |
| **C4 CDN 异常** | **0** | 存储有对象的 1880 个，CF 全部 200 `audio/mpeg` |
| **C5 前端静默失败** | **5 处代码路径** | 见 §5 |

### 2.1 C1 数据缺陷（7）

文本层面**零缺陷**——6355 行全量扫描结果：空文本 0、含中文 0、含 emoji 0、含 `___`/标记符 0、弯撇号 0；`cleanForTTS()` 对全部小学文本都是 no-op（改写 0 条），说明说话人标签/`sb`/`sth` 那套规则在小学侧不触发。

实际缺陷全在资源层：

| # | 对象 | 现象 | 影响 |
|---|---|---|---|
| C1-1…6 | `public/audio/primary/phonics/g4v2_u1/{water,tiger,sister,dinner,computer,ruler}.mp3` | 文件根本不存在（目录下只有 README.md）；`vercel.json` 把 `/(.*)` 全 rewrite 到 `/index.html`，实测 `HEAD https://bigmoonenglish.com/audio/primary/phonics/g4v2_u1/water.mp3` → **200 `text/html`** | 自然拼读「听一听」6 张卡每次都先加载一个 HTML 当音频 → `play()` reject → 才回退 TTS。**假 200**，任何只看 status 的健康检查都发现不了 |
| C1-7 | `fc_g5v1_lcw_02` = `"funny"` @1.0 → `b13ea61f…6ff2.mp3` | HTTP 200、`audio/mpeg`，但 **1920 字节**；同格式下 `"ruler"` 是 32640 字节，全部可播对象里第二小的是 8448 字节 → 该文件比正常值小 4.4 倍以上，MP3 头合法但内容近乎为空 | 播放"成功"却没声音，前端无从察觉（五年级闯关第 2 关听音选词） |

### 2.2 C2 Key 不一致

**(a) 同一语义文本存在多个 cache_key：791 条文本**（2 个 key 的 217 条、3 个 key 的 571 条）。根因是**语速档位**：句型课/听力关的语速控件有 0.7 / 0.85 / 1.0 三档（`src/lib/primaryHub/hubSpeakSpeed.ts:7-11`），同一句话每档一个独立 hash。其中 **403 条文本处于"部分档位有音频、部分没有"**的状态，例如：

```
"Hello! I'm Chen Jie."   0.85 ✓   0.7 ✗   1.0 ✓
"What's this?"           0.85 ✓   0.7 ✗   1.0 ✓
"It's a duck."           0.85 ✓   0.7 ✗   1.0 ✓
```

→ 孩子把语速拨到「慢速」，同一句话就从秒播变成冷合成（或在自动播场景直接不出声）。

**(b) 预热用的 key ≠ 播放用的 key（3 处，预热 100% 落空）：**

| # | 位置 | 预热速度 | 播放速度 | 后果 |
|---|---|---|---|---|
| C2-1 | `PrimaryHubStagePlay.tsx:765` 预热 vs `:789/:804` 播放（句型关对话） | `{grade}` → `getKidSpeed`：G3=0.85、**G4–G6=1.0** | 固定 `0.85` | 四~六年级句型关的预热全部灌到用不上的 key |
| C2-2 | `PrimaryHubPhonics.tsx:188` 预热 vs `:200` 播放（拼读找一找） | `{grade}` → G4 = **1.0** | 固定 `0.85` | 拼读关预热 100% 落空 |
| C2-3 | `VocabContextGame.tsx:71` 预热 `item.answer`（单词） vs `:84/:202` 播放 `q.full`（整句）；`VocabQuizGame.tsx:196` 播放 `chunk.en` 但预热只含 `word.en` | — | — | 情景关整句、词汇关语块**从来不在预热集合内** |

### 2.3 C3 存储缺失（2205 行 / 1557 对象）

key 拼对了、CDN 也正常，**只是这些音频从来没有被合成过**（桶里没有对象，HEAD 返回 400）。按内容类别：

| 内容类别 | 缺失 / 总数 | 缺失率 |
|---|---|---|
| 词汇**语块** `chunks.en`（词汇关揭晓后的「地道搭配」按钮） | **869 / 1017** | **85.4%** |
| 句型课 `question.en@0.7`（慢速档） | 301 / 373 | 80.7% |
| 句型课 `answer.en@0.7` | 139 / 186 | 74.7% |
| 听力关 `audio@0.7` / `opts[answer]@0.7` | 153+153 / 213+213 | 71.8% |
| 闯关 `options[answer]`（看图选词正音，G4–G6 @1.0） | 42 / 70 | 60.0% |
| 闯关 `display`（排序句正音） | 16 / 32 | 50.0% |
| 句型课 `question.en@0.85`（**默认档**） | 124 / 373 | 33.2% |
| 闯关 `audio`（听音选词/听句判断等） | 76 / 254 | 29.9% |
| 单元对话句 `dialogues.lines.text` | 57 / 228 | 25.0% |
| 听力关 `audio@0.85`（**默认档**） | 55+55 / 213+213 | 25.8% |
| 句型课 / 听力 @1.0 档 | 105 / 745 | 14.1% |
| 单词 `vocabulary.en` @0.85（词汇卡 + 6 个词汇游戏） | **8 / 442** | 1.8% |
| 拼写关 / 听音辨词关单词（各年级专用语速） | 各 2 / 442 | 0.5% |
| 听音辨词预生成 URL（`listenWordAudio.json` 439 条） | **0 / 439** | 0% |
| 拼读关 TTS 词 | 1 / 28 | 3.6% |

**按"是否默认路径"拆分**（决定用户多快撞上）：
- **默认路径就缺**：≈1354 行（0.85 档 1217 + 0.95 档 4 + 闯关 G4–G6 默认 1.0 档 133）
- **只有孩子手动切语速才会撞上**：851 行（0.7 档 746 + hub 1.0 档 105）

**C3 的真实后果分两种**（这点决定了修复优先级）：
1. **点击触发**（🔊 按钮、答对正音）：`speak()` 冷路径会现场调 edge 合成 → **有声音，但等 1–3 秒**，第一个用户替所有人付这笔延迟。
2. **非手势自动播**（关卡自动读题、游戏切词自动读）：`src/lib/speak.ts:607-611` 的 P0 修复规定「无热缓存 + 无用户手势 → 只做纯网络预热，直接 return，不播」→ **这一次彻底没有声音**，且没有任何提示。C3 落在这条路径上就是真·哑火。

命中第 2 条的确切样本（本次实测）：
- `study`、`hike`（六上 U4）——`listenWordAudio.json` 唯一漏掉的 2 个词（439/441 覆盖），听音辨词关会回退实时 TTS，而 @0.95 的 key 存储里没有 → 自动播那一下静音。
- 六年级 8 个单词 @0.85（`police officer` / `see a doctor` / `had` / `slept` / `read` / `went` / `went camping` / `went fishing`）——词汇游戏（拼写/雨点/打地鼠/泡泡）切词是 useEffect 自动播。

**Top 20 样例（C3，语块类）**

| record_id | 文本 | cache_key |
|---|---|---|
| g3v1_u1#vocab[0].chunks[0] | a long ruler | `elevenlabs\|el:lily\|0.85\|\|a long ruler` |
| g3v1_u1#vocab[0].chunks[1] | my ruler | `elevenlabs\|el:lily\|0.85\|\|my ruler` |
| g3v1_u1#vocab[0].chunks[2] | use a ruler | `elevenlabs\|el:lily\|0.85\|\|use a ruler` |
| g3v1_u1#vocab[1].chunks[0] | a new pencil | `elevenlabs\|el:lily\|0.85\|\|a new pencil` |
| g3v1_u1#vocab[1].chunks[1] | my pencil | 同构 |
| g3v1_u1#vocab[1].chunks[2] | a red pencil | 同构 |
| g3v1_u1#vocab[2].chunks[0] | a small eraser | 同构 |
| g3v1_u1#vocab[2].chunks[1] | my eraser | 同构 |
| g3v1_u1#vocab[2].chunks[2] | a new eraser | 同构 |
| g3v1_u1#vocab[3].chunks[0] | a red crayon | 同构 |
| g3v1_u1#vocab[3].chunks[1] | my crayon | 同构 |
| g3v1_u1#vocab[3].chunks[2] | a box of crayons | 同构 |
| g3v1_u1#vocab[4].chunks[0] | my bag | 同构 |
| g3v1_u1#vocab[4].chunks[1] | a new bag | 同构 |
| g3v1_u1#vocab[4].chunks[2] | a school bag | 同构 |
| g3v1_u1#vocab[5].chunks[0] | a blue pen | 同构 |
| g3v1_u1#vocab[5].chunks[1] | my pen | 同构 |
| g3v1_u1#vocab[5].chunks[2] | a new pen | 同构 |
| g3v1_u1#vocab[6].chunks[0] | a new pencil box | 同构 |
| g3v1_u1#vocab[6].chunks[1] | my pencil box | 同构 |

**Top 20 样例（C3，句子/闯关类）**

| 来源 | record_id | 字段 | 文本 |
|---|---|---|---|
| grade3.json | g3v1_u3#listening[0] | audio@0.7 | Hello! I'm Chen Jie. |
| grade3.json | g3v1_u3#listening[2] | audio@0.7 | Let's make a puppet! |
| grade3.json | g3v1_u3#listening[3] | audio@0.7 | Great! |
| grade3.json | g3v1_u4#listening[0] | audio@0.7 | What's this? |
| grade3.json | g3v1_u4#listening[1] | audio@0.7 | It's a duck. |
| grade3.json | g3v1_u4#listening[3] | audio@0.7 | It's a panda. I like it! |
| grade3.json | g3v1_u5#listening[0] | audio@0.7 | I'd like some juice, please. |
| grade3.json | g3v1_u5#listening[2] | audio@0.7 | Can I have some bread, please? |
| g3v2_u1_grammar.json | #A.A3 | question.en@0.85 | She's a student. |
| g3v2_u2_grammar.json | #B.B4 | question.en@0.85 | Who's that man? Who's that woman? |
| g3v2_u3_grammar.json | #A.A4 | question.en@0.85 | Look at the animals. |
| g3v2_u3_grammar.json | #B.B2 | question.en@0.85 | It's so fat! |
| grade4.json | g4v1_u1#dialogue.A Let's talk.q4 | dialogues | The door is orange. The desks are green. |
| grade4.json | g4v2_u1#dialogue.A Let's talk.a3 | dialogues | Hi. Is this the teachers' office? |
| grade4.json | g4v2_u3#dialogue.B Let's talk.a3 | dialogues | It's rainy and cool. It's 26 degrees. |
| grade5_v1_seed.json | fc_g5v1_lcw_01 | audio | salad |
| grade5_v1_seed.json | fc_g5v1_lcw_04 | audio | Sunday |
| grade5_v1_seed.json | fc_g5v1_pmw_19 | options[answer] | play the pipa |
| grade4_v1_seed.json | fc_g4v1_seed_09 | options[answer] | chopsticks |
| grade6.json | g6v1_u5#vocab[4] | vocabulary.en | police officer |

（完整 1557 条见 `data/audio-audit/primary_audio_status.csv`，筛 `verdict=C3_MISSING`。）

### 2.4 C4 CDN 异常：0

存储桶里存在的 1880 个对象，CF 生产域 **全部 200 + `audio/mpeg`**，`content-length` 与存储侧一致（抽样 `ruler` 两侧均 32640）。存储不存在的 1557 个，CF 也一致返回 400（JSON 错误体）。两侧**零分歧**。

> 唯一"CDN 层面"的问题是 C1-1…6 那 6 个捆绑 MP3：Vercel 的 SPA rewrite 把 404 变成 200 HTML。它属于静态资源部署问题，不是音频 CDN 问题。

---

## 3. 覆盖面与口径说明

- 小学 3–6 年级的发音文本 **100% 来自本地 JSON/TS**。Supabase 侧 `primary_reading_articles`(40 行)、`primary_vocab`(846 行)、`primary_lessons`(4 行) 虽有英文内容，但消费方只有家长端统计组件与 `useMasteryOverview`，**无任何播放调用**（详见 `AUDIT_A1_callsites.md` §4），故不进入发音清单。
- 已确认**不发音**的小学页面：读写关、错题本、AI 测评、学段测试、禁改的 3 个 Unit 路由文件。
- 未计入清单的分支：`PrimaryHubStagePlay.tsx:614` 的 0.8 / 0.74 语速为**不可达代码**（全站唯一 `ListenMcStage` 实例的 `instruction` 含「句」→ 永远走可调速分支），不会产生任何音频请求。
- `PrimaryHubFinalChallengeStrengthen` 的题目由 `fc-strengthen-questions` edge 动态生成，文本不可静态枚举，**未计入**（其素材来自同一批 FC 种子，覆盖情况见 fc_seed 行）。
- 语速枚举口径：可调速控件的 3 档全部枚举（0.7/0.85/1.0），因为三档都是用户一键可达的真实播放路径。

---

## 4. 修复优先级建议（Phase B 备选，尚未执行）

| 优先级 | 项 | 理由 / 成本 |
|---|---|---|
| **P0-1** | 补 6 个自然拼读 MP3，或**改用 TTS 直出**（删掉 `audioBase` 走 `hubSpeak`） | 唯一 100% 复现的"假 200"；每次进拼读关必踩。改代码 1 行 / 传 6 个文件 |
| **P0-2** | `ListenWordStage.tsx:92` 给 `speakFromUrl` 加失败回退（见 §5-1） | 预生成 URL 一旦失效就是**永久静音且无兜底**；当前 439 条 URL 全部健康，属"防雷"而非救火 |
| **P0-3** | 修 C2-1 / C2-2 两处预热速度错配（把 `{grade}` 换成显式 `{grade, speed: 0.85}`） | 各改 1 行，立刻让四~六年级句型关 + 拼读关的预热真正生效 |
| **P1-1** | 批量预生成缺失的 1557 个对象（复用 `scripts/pregenerate-primary-listenword.mjs` 的 pattern，扩到语块/句型/听力/FC） | 消除全部冷合成延迟与自动播静音；1557 次合成，可按类别分批（先 chunks 869 + 默认档 0.85） |
| **P1-2** | 把语块 / 情景整句 / FC `options[answer]` 纳入各自入口的预热集合（C2-3） | 3 处各改数行；配合 P1-1 才不会再次冷掉 |
| **P1-3** | 重新合成 `funny`@1.0（1920B 那个），并加一条"合成后体积 < 3KB 视为失败"的校验到预生成脚本 | 防止再产出静音文件 |
| **P2-1** | 给 `speak()` 冷路径失败加**一次性可观测上报**（§5-5） | 目前所有失败只落 console，线上完全不可见 |
| **P2-2** | 语速档位收敛（例如慢速只对句子生效、或三档共用一份音频改用 `playbackRate`） | 能一次砍掉 ~2/3 的 key 膨胀（791 条文本 × 2–3 key） |
| **P3** | 清理孤儿资源 `public/audio/hub/oclock.mp3`（仓库零引用） | 无风险清理 |

---

## 5. 静默失败专项（Step 5）

### 5-1 ⚠️ 能取到音频却不会播 / 播不出也不兜底

| # | 位置 | 机制 |
|---|---|---|
| **S1** | `src/components/primaryHub/ListenWordStage.tsx:91-95` `speakFromUrl(audioUrl).then(done).catch(done)` | `speakFromUrl`（`speak.ts:580-591`）内部 `playUrl` 失败只 `resolve(false)`，**从不 reject** → `.catch(done)` 是死代码；URL 失效时既不回退 `speakKid`，也不回退 Web Speech，**静默无声**，UI 只是把 🔊 按钮恢复可点 |
| **S2** | `src/lib/speak.ts:607-611` 非手势 + 冷缓存 → 纯预热 `return` | 设计如此（P0 修复），但**调用方无法区分"播了"和"没播"**：`speak()` 一样 resolve。游戏切词/关卡自动读题撞上冷 key 时这一次就是无声，且没有任何 UI 提示 |
| **S3** | `src/lib/speak.ts:26-53`（`ensureLoudnessRouting`）+ `:515-538`（`playUrlOn`） | `sharedAudio` 被 `createMediaElementSource()` 永久接进 `AudioContext` 的增益链。若 `audioCtx.resume()` 失败（`:31/:39` 均为 `.catch(() => {})` 静默吞掉），音频数据就流不到扬声器。此时 `playUrlOn` 只监听 `onended`/`onerror`/`play()` reject 三个信号，**没有超时**：要么 `ended` 照常触发 → 被判成功、不走浏览器 TTS 兜底；要么 `ended` 永不触发 → Promise 永不 settle，同样不兜底。两种走向都是**"没有报错的无声"**（未在真机复现，属代码路径推断） |
| **S4** | `src/lib/primaryHub/phonicsAudio.ts:20-25` | 只有 `play()` **reject** 才回退 `hubSpeak`。若 MP3 URL 挂起（慢网/长超时）而不 reject，则既不出声也不兜底，且无超时保护 |
| **S5** | `src/pages/primaryHub/PrimaryHubPhonics.tsx:112-116` | `play()` 之后无条件 `setHeard(...)` 标记"已听"，**播放失败照样算完成**，孩子可直接过关，问题被进度掩盖 |

### 5-2 空 catch / 只写 console 不上报

| 位置 | 形态 |
|---|---|
| `src/lib/speak.ts:340` `unlockAudioSync` 整体 `catch {}` | iOS 解锁失败**完全静默** → 后续所有播放可能全哑，无任何信号 |
| `src/lib/speak.ts:31 / :39 / :50` AudioContext resume / 路由失败 | 空 catch（S3 的根源） |
| `src/lib/speak.ts:429` `console.warn("[tts] edge function status:", res.status)` → `return null` | edge 5xx/429 只进 console |
| `src/lib/speak.ts:446 / :455 / :460 / :472` | `no audio returned` / `unexpected content-type` / `fetch failed` 均只 `console.warn` |
| `src/lib/speak.ts:528 / :558` `playUrlOn` / `playUrlDirect` 的 `catch { resolve(false) }` | 播放异常不区分原因、不上报 |
| `src/lib/speak.ts:108 / :145 / :163 / :180` localStorage 配额 | 静默丢弃 URL 持久化（下次进页面又冷） |
| `src/lib/speak.ts:226` `probeCdn` `catch { return false }` | 探测失败与"确实没有"不可区分 |
| `src/lib/primaryHub/speech.ts:37` `void speakKid(...)` | 小学**最主要**入口，Promise 直接丢弃，无 `.catch`、无 UI 反馈 |
| `src/lib/primaryHub/speech.ts:53-56` `void speakWebSpeech(...).then(ok => …)` | 无 `.catch`；只在 `ok===false` 时兜底 |
| `src/lib/primaryHub/phonicsAudio.ts:22` `catch(() => { hubSpeak(...) })` | 有兜底但**零日志**，线上无法得知捆绑 MP3 全线失效 |
| `src/components/primaryHub/ListenWordStage.tsx:137` `catch {}`（AudioContext resume） | 空 catch |
| 6 个 FC 关卡：`DialogueResponseLevel:132`、`FillInChooseLevel:149`、`ListenChooseAnswerLevel:126`、`ListenChooseWordLevel:154`、`ListenJudgePictureLevel:135`、`SentenceOrderingLevel:123` | `.catch(() => { if (isWebSpeechSupported()) void speakWebSpeech(...) })` — 有兜底、**无日志无上报** |
| `LevelShell.tsx:255` | `console.warn("[LevelShell] onBeforeStart failed:", e)` 仅 console |
| 反例（做得对，可作为整改模板）：`SpellingStage.tsx:242-251` | `console.error` + Web Speech 兜底 + **给孩子的 Toast**「发音加载失败，请稍后再试」 |

### 5-3 缺 await / 未处理的 `play()` rejection

**0 处。** 小学范围内全部 `.play()` 调用均已挂 `.catch`：`speak.ts:335 / :534 / :554`、`phonicsAudio.ts:22`（实测 grep 全量列举）。`speak()` 与 `speakWebSpeech()` 内部也不会 reject，因此 `void speakKid(...)` / `void speakWebSpeech(...)` 虽然丢弃 Promise，但不产生 unhandled rejection——代价是**失败完全不可观测**（见 5-2）。

### 5-4 缺 `unlockAudioSync()` 同步调用

以下入口没有显式调用，全靠 `speak()` 内部 `:618` 的同步解锁。**在纯点击场景下等价、可接受**，但一旦将来把这些调用挪到 `await` 之后或定时器里就会失效：

| 位置 | 说明 |
|---|---|
| `PrimaryHubStagePlay.tsx`（词汇卡 :250、听力关 :610/:621、句型关 :789/:804） | 全页零 `unlockAudioSync`，全部依赖内部解锁 |
| `SentenceLessonStage.tsx:63`（`AudioBtn`，5 处使用） | 同上 |
| `PrimaryHubPhonics.tsx:200 / :298`（找一找、闯关） | 同上（只有「听一听」经 `phonicsAudio.ts:15` 解锁） |
| `finalChallenge/levels/PicMatchWordLevel.tsx:136` | **唯一一个有音频却既无 `onBeforeStart` 解锁、又无预热的 FC 关卡**；其 `options[answer]` 缺失率还是 60%（§2.3）→ 冷合成 + 无解锁双重叠加，iOS 首点最可能没声 |

### 5-5 建议的最小可观测性（Phase B）

在 `speak.ts` 的 3 个终点（冷合成失败 / 播放失败 / 纯预热跳过）各打一个带 `cacheKey` 的一次性上报，即可把上面所有"静默"变成可查数据；成本约 20 行，且不改任何播放逻辑。

---

## 6. 复现方式

本轮三个一次性脚本放在会话 scratchpad（未进仓库，避免污染工程）：
`…\scratchpad\build-inventory.mjs`（清单生成，含逐字复刻的 `cleanForTTS`/`toHubTtsText`/keyInput）、
`…\scratchpad\reprobe.mjs`（HEAD 校验 + 429 重探）、`…\scratchpad\fill-ct.mjs`（补 content-type）。
Phase B 若要批量补音频，直接读 `primary_audio_status.csv` 筛 `verdict=C3_MISSING` 的 `raw_text` + `speed` 即可，
合成接口与参数照 `scripts/pregenerate-primary-listenword.mjs`（voice `el:lily`，`format:"url"`）。

## 7. Phase A 结论一句话

小学侧**文本数据是干净的、CDN 是健康的、key 公式是对的（439/439 实测吻合）**；真正的哑火风险集中在三处：**6 个不存在的拼读 MP3 被 SPA rewrite 伪装成 200**、**1557 个从未合成的音频对象（尤以 85% 的词汇语块和慢速档为甚）在自动播路径上会直接静音**、以及**整条播放链失败零上报**（含 3 处预热灌错 key、1 处失败不兜底、1 处"成功地没有声音"）。
