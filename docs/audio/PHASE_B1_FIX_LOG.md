# 小学 TTS 修复 Phase B1 — 止血（执行记录）

依据：`docs/audio/AUDIO_AUDIT_REPORT.md`（Phase A 审计）
范围：B1.1 假 200 / B1.2 7 个问题音频 / B1.3 纯预热分支静音集
禁改文件（未触碰）：`PrimaryHubUnit.tsx`、`unitRoutingConfig.ts`、`PrimaryHubUnitDispatch.tsx`、`PrimaryHubUnitGamified.tsx`
本阶段**不涉及** C2 语速档策略、不改 schema。

---

## B1.1 vercel.json 假 200

**改动**：SPA 兜底 rewrite 从 `"/(.*)"` 改为「排除带静态资源后缀的路径」的负向前瞻：

```
/((?!.*\.(?:mp3|mp4|m4a|wav|ogg|opus|png|jpg|jpeg|gif|svg|webp|avif|ico|css|js|mjs|cjs|map|json|
webmanifest|txt|xml|pdf|html|woff|woff2|ttf|otf|eot|zip)$).*)
```

**为什么按后缀而不是按目录**：`public/primary/` 既是真实资源目录（`finalChallenge_images/`、
`hub/g4v2_u1/`、`wordcard_images/`，共 87 个文件），又和 SPA 路由 `/primary/hub/:grade` 同前缀。
按目录排除会把 `/primary/hub/4` 打成 404。全部 173 条路由（`src/App.tsx`）实测**无一条带后缀**，
按后缀切分对两边都安全。

**本地校验（已跑，PASS）**：用 vercel.json 里的 source 编译成整串正则，对 10 条代表性 SPA 路由 +
13 条静态资源路径逐条断言：SPA 全部仍进 index.html，资源全部不进 index.html（含
`/primary/hub/4` vs `/primary/hub/g4v2_u1/pic.png` 这组同前缀对照）。

**预览域 HEAD 验收：受阻，未完成** ⛔
Vercel 该项目开了 Deployment Protection：预览域对未登录请求一律 302 到
`https://vercel.com/sso-api?url=…`（实测最近一个预览 `learn-fluent-easy-272k8k01q-…vercel.app`，
`/junior` 与 `/audio/primary/phonics/g4v2_u1/water.mp3` 都是 302）。
CC 侧拿不到 `VERCEL_AUTOMATION_BYPASS_SECRET`，无法在预览域跑任务要求的两条 HEAD。
→ 需要 Aaron 二选一（见本文件末尾「待 Aaron」）。在验收通过前，这条按**未完成**记账。

---

## B1.2 7 个问题音频的归属判定

### 清单 A — 应有的自然拼读音频，需生成并上传：**空（0 个）**

判定依据（三条独立证据，均为当次实测）：
1. `git log --diff-filter=A -- public/audio/primary/phonics/` 显示该目录历史上**只提交过 README.md**，
   6 个 mp3 从未存在过，不是"丢失"而是"从未落地"。
2. 原 README 自己写的就是 "if a file is missing, playback falls back to CDN kid TTS" —— 本就是可选增强。
3. 这 6 个词（water/tiger/sister/dinner/computer/ruler）走 TTS 的音频对象**全部已存在**
   （Phase A 实测 `stage_1_listen.word(fallback TTS)` 缺失 0/6），音色与全站一致。
   自然拼读需要的是**强调词尾 /ə(r)/ 的真人录音**，用 TTS 再生成一份存成静态文件毫无增益。
→ 结论：不生成。将来若真录人声，按新 README 的三步接回即可。

### 清单 B — 误引用，改调用方走 TTS：**6 个**

| 文件 | 改法 |
|---|---|
| `src/lib/primaryHub/phonicsTypes.ts` | `PhonicsListenItem.audio` 改为**可选**，并写明「只有文件真实存在时才声明」 |
| `src/data/primaryHub/phonics/g4v2_u1_er.ts` | 去掉 6 个 `audio: "*.mp3"`（附注释说明历史与回接方式） |
| `src/lib/primaryHub/phonicsAudio.ts` | `playPhonicsAudio(url: string \| null, …)`：无 url 时在同一手势栈内直接 `hubSpeak`，不再请求不存在的文件；有 url 但播放失败时新增 `console.warn("[phonics] bundled audio failed …")`（原来完全无日志） |
| `src/pages/primaryHub/PrimaryHubPhonics.tsx` | `play(word, file?)`，`file` 缺省则传 `null` |
| `public/audio/primary/phonics/g4v2_u1/README.md` | 重写为现状说明 + 将来接真人录音的三步 |

行为收益：进拼读关「听一听」不再有 6 次「下载 HTML 当音频→解码失败→再回退」，
首次点读直接出声；且今后"声明了却没放文件"会 404 + 控制台告警，不会再被静默吞掉。

### 清单 C — 已存在但内容损坏，需 service_role 权限处理：**1 个**

`fc_g5v1_lcw_02` 的 `"funny"` @1.0 →
`tts-audio / b1/b13ea61fcc29dc2ddf1a18c8050a85c0287bf6a2009f9978a51b35a5eb8b6ff2.mp3`

**已下载确认（不是只看体积）**：逐帧解析 MPEG 帧头 → **5 帧 / 0.120 秒**（MPEG2 24000Hz 128kbps）；
同参数对照 `"ruler"` = 85 帧 / 2.040 秒 / 32640 字节。1920 字节是被截断的近乎空音频，确凿。
CC 只有 anon key 删不掉 → SQL 交给 Aaron：`SQLAA/2026-07-25-删除损坏TTS对象-funny.sql`
（含删除前后计数 + Cloudflare purge 说明；删除后 tts edge 会自动重合成）。

---

## B1.3 纯预热分支静音集

**筛选口径**（不是只补样本里的 10 个）：`speak.ts:607-611` 的规则是「无热缓存 + 无用户手势 → 只预热不播」，
所以凡是**在 useEffect / setTimeout 里触发播放**的调用点，其冷 key 就等于当次静音。逐个入口核源码后确定 4 类：

| 自动播入口 | 源码位置 | 命中字段 |
|---|---|---|
| 4 个词汇游戏切词自动读 | `VocabSpellGame:46-54`、`VocabRainGame:70-75`、`VocabWhackGame:74-78`、`VocabBubbleGame:113-119` | `vocabulary.en` @0.85 |
| 拼写关自动读 | `SpellingStage:273-280`（setTimeout） | `vocabulary.en@spelling` |
| 听音辨词自动读 | `ListenWordStage:145-151`（250ms setTimeout）——仅当该词在 `listenWordAudio.json` 无预生成 URL | `vocabulary.en@listenWord` |
| 闯关 4 个关卡「每题展示后 250ms 自动 playTwice」 | `ListenChooseWordLevel:183-186`、`ListenChooseAnswerLevel:155-158`、`ListenJudgePictureLevel:163-166`、`DialogueResponseLevel:161-164` | fc_seed `audio`（题型 listen_and_choose_word / listen_and_choose_answer / listen_and_judge_picture / dialogue_response） |

排除（点击栈内，冷 key 只是延迟不是静音）：单词卡、语块按钮、情景关整句、听力关 🔊、句型课 AudioBtn、
拼读关、FillInChoose / SentenceOrdering / PicMatchWord 的选后正音。

**结果：63 个唯一对象**（清单 `data/audio-audit/p0_silent_set.csv`）
= 62 个从未合成（C3）+ 1 个已存在但损坏（就是清单 C 的 funny）。
比任务里点名的 10 个多出 53 个，绝大多数是五、六年级闯关听力题。

| 自动播路径 | 个数 |
|---|---|
| fc-autoplay:listen_and_choose_word | 37 |
| fc-autoplay:listen_and_judge_picture | 15 |
| game-autoplay（六年级 8 词） | 8 |
| spelling-autoplay（study / hike @0.95） | 2 |
| fc-autoplay:dialogue_response | 1 |

**执行结果：62 个全部生成成功，0 失败**（走线上 tts edge 合成 + upsert，每个生成后立刻 CDN HEAD 复验，
全部 200 且 ≥ 2048 字节；最小 `coach` 9600B，最大 `February` 49920B）。

顺带回填：`study` / `hike` 是 `listenWordAudio.json` 439/441 唯一漏掉的两个词，
已把新生成的 CF URL 写回该文件（现 441 条）——听音辨词关这两题从此走固定 URL 秒播，不再依赖实时 TTS。

---

## 顺带发现（不在 B1 范围，记账）

线上音频**实际不是 ElevenLabs 合成的**：抽查的 mp3 全是 MPEG2 / 24000Hz（OpenAI TTS 的输出规格），
而 ElevenLabs 走的是 `mp3_44100_128`。说明 `el:lily` 的合成在线上失败并落到了
edge `:380` 的 OpenAI 兜底（`fallbackVoice = "shimmer"`），cache key 里却仍记着 `elevenlabs|el:lily`。
即：全站儿童音其实是 OpenAI shimmer。这与 memory 里「语音 TTS = OpenAI」一致，但与代码意图不符，
需要单独确认是"有意为之"还是 `ELEVENLABS_API_KEY` 失效。**未做任何改动。**

---

## B1.1 生产域验收（合并后实测，2026-07-26）✅ 已完成

合并 commit `a5ca3b68` → Vercel 生产部署 state=success 后立即实测。
脚本 `scripts/audio/verify-production-routing.mjs`，结果表 `data/audio-audit/b1_production_verify.csv`。

| 项 | 合并前 | 合并后 |
|---|---|---|
| SPA 路由（173 条真实完整路由，参数填真实值） | 173/173 → 200 text/html | **173/173 → 200 text/html** |
| 静态资源（public/ 分层抽样 + 线上 index.html 解析出的真实 /assets/*） | 113/113 正常 | **113/113 正常** |
| 缺失资源探针（含 water.mp3） | **4/4 是 200 text/html（假 200）** | **4/4 是 404** ✅ |
| content-type 家族异常 | 0 | 0 |

（合并后又独立复跑了一次，抽样换成 122 个静态资源，同样 173/173 + 122/122 + 4/4 全绿。）

### 验收口径有三处是被实测打脸后校正的，不校正就会误判

1. **必须直连 www**：生产是 apex → www 的 **307 规范跳转**，打 `bigmoonenglish.com` 会全部收到 307。
2. **静态资源不能用本地 `dist/assets/*`**：build hash 与线上不同，本地那批文件名在线上根本不存在，
   测出来会"全军覆没"。改为 `public/`（路径稳定）+ 运行时从线上 index.html 解析真实构建产物；
   `.html` 静态文件单独放行（它们本来就该是 text/html）。
3. **SPA 路由必须还原 `<Route>` 嵌套**——这条最要命。直接拿 `path=` 原值前面加 `/`，
   会造出 71 条根本不存在的假 URL（`/course`、`/semester/x1` 之流，靠 SPA 兜底照样 200，测了等于没测），
   同时把 90 条真实嵌套路由整片漏掉（`/primary/hub/4/semester/…/stage/1/phonics` 这些）。

### 173 vs 154 的差额说明

按 `path=` 计 173 条，旧扁平法去重后只剩 154 条，差 **19 条（10 组）**，全部是子路由重名：
`mistakes` ×4、`course` ×3、`semester/:semId` ×3、`semester/:semId/unit/:unitId` ×3、
`…/stage/:stageIdx` ×3、`profile` ×3、`aitest` ×3、`aihistory` ×3、`final-challenge` ×2、
`final-challenge/level/:levelId` ×2 —— 它们分别挂在小学 / 初中 / 高考三个 hub 下。
**还原嵌套后：173 条 `path=` → 173 条唯一完整 URL，零折叠。**

### 参数路由的点号风险（实查）

规则的失效条件很窄：参数值必须以 `.` + 白名单里那 31 个后缀之一结尾才会被打成 404
（`/library/book.json` 会 404；`/library/tom.sawyer` 不受影响，因为 `sawyer` 不在白名单里）。
能读到的自由取值空间实查结果：`library_books.book_key` 5 个、`american_lessons.id` 276 个，
**含点号 0 个、命中白名单 0 个**。
⚠️ 残留未知：gaokao / junior 的 grammar slug 表 anon key 读不到（RLS），这部分取值空间未能枚举。

---

## 待 Aaron

1. **跑 SQL**：`https://github.com/aaronliudream/learn-fluent-easy/blob/main/SQLAA/2026-07-25-删除损坏TTS对象-funny.sql`
   跑完请对文件里那条 CF URL 做一次 Cloudflare Purge，然后通知 CC 走 funny 修复三步
   （HEAD 确认已非 1920B → 预热一次 → CDN 复验 200 且 ≥2KB → 下载解析帧数对照 ruler 的 85 帧 / 2.040 秒）。
2. （可选）`SQLAA/2026-07-26-删除B2探针对象.sql`：清掉 B2 冷路径验证留下的一次性探针对象。
