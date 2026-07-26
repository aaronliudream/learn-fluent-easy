# B2.0 TTS provider 真相调查（只读）

日期：2026-07-25 ｜ 本阶段**未修改任何源码、未执行 deploy**
证据文件：`data/audio-audit/provider_format_sample.csv`（250 个存量对象的实测规格）

## 〇 先复述并确认约束

**cache key 公式一律不动。** `keyInput = ${provider}|${selectedVoice}|${safeSpeed}|${accentUpper}|${safeText}`
里的 `elevenlabs` / `el:lily` 是**遗留常量**，即使已确认与事实不符也不得修改：
key 是内容寻址的唯一寻址依据，改动会让现存 3438 个音频对象（小学范围，全站更多）**全部失联**，
等于全站音频一次性冷启动。本报告只做事实认定与成本测算，不含任何 key 变更建议。

---

## 一句话结论

**当前全站儿童音实际是 OpenAI 的 `shimmer`（模型 `gpt-4o-mini-tts` / 长文本 `tts-1`），
不是 ElevenLabs 的 `el:lily`；而且不是"某天降级"，是从这套音频系统上线第一天起就一直如此。**

---

## Step 1 降级链路

### provider 选择（部署版 `index.ts:323-329`，与仓库版逐字一致）

```
fromCN = cf-ipcountry / x-vercel-ip-country == CN，或 accept-language 以 zh-cn 开头
provider =
  fromCN && VOLCANO_TTS_APP_ID && VOLCANO_TTS_ACCESS_TOKEN  → "volcano"
  : voiceId 以 "el:" 开头                                    → "elevenlabs"
  : 其余                                                     → "openai"
```

`provider` 在**合成之前**就参与算 hash（`:331`），此后无论真正由谁合成，key 都不会变。

### 合成与兜底（`:353-400`）

| 分支 | 触发条件 | 失败/跳过时 | 是否留痕 |
|---|---|---|---|
| `elevenlabs` | provider==elevenlabs **且** `Deno.env.get("ELEVENLABS_API_KEY")` 有值 | 落 OpenAI | **key 缺失时完全静默**：`if (k)` 直接不进 try，连一次 HTTP 都不发，`console.error("ElevenLabs failed…")` 永远不会执行 |
| `volcano` | provider==volcano 且 APP_ID+ACCESS_TOKEN 都有值 | 落 OpenAI | 同上：缺 secret 时静默跳过；真调失败才 `console.error` |
| `aliyun`（CosyVoice） | **不可达死代码**：`provider` 的三元表达式永远不会产出 `"aliyun"` | — | — |
| `openai` 兜底 | `if (!bytes)`，即前面任何一支没产出字节 | 无 key 时返回 503；调用失败返回 502 + `console.error` | 有日志 |

**关键行 `:393`**：`const fallbackVoice = isElevenLabs ? "shimmer" : selectedVoice;`
→ 请求 `el:lily` 却走到兜底时，用的是 **shimmer**。

**明确回答**：ElevenLabs 在**密钥缺失**这条路径上**没有任何日志、没有任何告警**——因为根本没有"失败"，
是分支被跳过。只有"密钥存在但 API 调用抛错"才会打 `console.error`。当前项目属于前者。

### 部署版 vs 仓库版差异（本轮用 `supabase functions download tts` 拉到 scratch 目录比对，未落仓库）

差异只有两处，**都与 provider 无关**，但正是 B2 要对齐的东西：
1. 部署版多了 `AUDIO_CDN_BASE` 逻辑：`publicUrlFor()` 返回 `${AUDIO_CDN_BASE}/${path}`（CDN 域 + 裸 path），
   而 `existsInStorage()` 仍探 Supabase 原始存储域；仓库版只有存储域。
2. 部署版把 `queueMicrotask(upload)` 改成 `await uploadToStorage(...)`，冷路径统一返回 JSON（不再返回裸 MP3 字节）。

`keyInput`、`ELEVENLABS_API_KEY` 变量名、`fallbackVoice="shimmer"` 三处**两版完全一致**。

---

## Step 2 失败原因

### 项目 secrets（`supabase secrets list`，只列名称，不输出任何值/摘要）

存在：`AUDIO_CDN_BASE`、`GOOGLE_AI_API_KEY`、`OPENAI_API_KEY`、以及平台自动注入的
`SUPABASE_ANON_KEY` / `SUPABASE_DB_URL` / `SUPABASE_JWKS` / `SUPABASE_PUBLISHABLE_KEYS` /
`SUPABASE_SECRET_KEYS` / `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_URL`。

**`ELEVENLABS_API_KEY` 不存在。** 整个 secrets 列表里没有任何 ElevenLabs 相关名称
（无 `ELEVENLABS_*`、无 `XI_API_KEY`），因此"变量名写错了"这种可能性也被排除。
`VOLCANO_TTS_APP_ID` / `VOLCANO_TTS_ACCESS_TOKEN` / `DASHSCOPE_API_KEY` 同样不存在
——顺带说明 memory 里挂着的「大陆 Volcano 哈希错配」当前根本不会发生：Volcano 分支永远进不去。

### 失败状态码：**不存在这样的状态码**

任务列的四种可能（401 无效 key / 429 配额 / 402 欠费 / 网络超时）**一个都不是**。
密钥缺失时代码在 `if (k)` 处短路，**从未向 api.elevenlabs.io 发出过任何请求**，
所以不存在"实际失败状态码"这回事。

### 日志：**取不到，明确说明**

- 本机 Supabase CLI 版本 2.109.1 **没有 `functions logs` 子命令**（只有 list/delete/download/deploy/new/serve）。
- Management API 拉日志需要 PAT；CLI 虽已登录，但 token 存在 Windows 凭据管理器里（`~/.supabase/` 下无 access-token 文件），
  我没有去提取它。
→ 因此**没有拉到日志**。需要说明的是：即使拉到，也不会有 ElevenLabs 的失败记录（见上，请求根本没发出）。
日志唯一还能回答的问题是"这个 key 历史上是否曾经存在过、何时被删的"——这一条**目前无解**，
只能由 Aaron 在 Dashboard 的 secrets 变更记录/账单侧确认。存量音频的时间分布（Step 3）已从另一个角度回答了它。

### 顺带：其他依赖该 key 的函数

| 函数 | 用途 | 现状 |
|---|---|---|
| `elevenlabs-token` | ConvAI 实时对话 token | key 缺失 → 直接抛 `ELEVENLABS_API_KEY missing`；**前端零调用方**（grep `elevenlabs-token` 在 src 下无命中），孤儿函数 |
| `primary-speaking-grade` | 小学口语评分的 STT（scribe_v2） | 同样抛 missing；**前端零调用方**，孤儿函数 |

→ 密钥缺失当前的**唯一线上实际影响**就是 TTS 静默兜底，没有其他功能因此报错。

---

## Step 3 存量音色分布（实测 250 个对象）

方法：从 `primary_audio_status.csv` 的现存对象池（1942 个唯一对象 = 审计判定 OK 的 1880 + B1 新建的 62）
做 **年级 × 模块** 分层抽样，26 个层、共 **250 个**（要求 ≥150）；每个对象 `Range: bytes=0-4095` 只拉前 4KB，
解析首个 MPEG 帧头得到版本/采样率/码率，同时记录响应头 `last-modified` 做时间分桶。全部只读。

### 采样率

| 采样率 | 个数 | 占比 |
|---|---|---|
| **24000 Hz（OpenAI 规格）** | **250** | **100.0%** |
| 44100 Hz（ElevenLabs `mp3_44100_128` 规格） | 0 | 0.0% |

### 覆盖面（全部 24000Hz，无一例外）

- **年级**：G3 52 / G4 89 / G5 60 / G6 49
- **模块**：vocab 85、sentenceLesson 56、listening 35、finalChallenge 29、dialogue 21、chunk 20、
  pregen-listenword 2、phonics 2
- **批次**：legacy 240 / pregen 2 / B1 今晚新建 8
- **时间**（`last-modified` 月份）：2026-05 → 112、2026-06 → 54、2026-07 → 84
  最早对象 `2026-05-23T23:31:20Z`，最新 `2026-07-26T06:23:34Z`（今晚 B1 生成的那批）

### 码率二分，反过来又坐实了 OpenAI

| 码率 | 个数 | 文本长度 |
|---|---|---|
| 128 kbps | 238 | 2–40 字符 |
| 160 kbps | 12 | 41–61 字符 |

分界线精确落在 **40 字符**，正是 edge 里 `const isShort = safeText.length <= 40;`
`model = isShort ? "gpt-4o-mini-tts" : "tts-1"` 的分界。两种码率 = OpenAI 的两个模型。
ElevenLabs 只会输出 `mp3_44100_128`（代码 `:204` 写死 `output_format=mp3_44100_128`），一个都没出现。

### 是否存在"新老音色混排"？**不存在**

从最早的存量对象（2026-05-23）到今晚新生成的对象，采样率全为 24000Hz，跨越三个月、四个年级、八个模块。
→ **没有降级时间点**：不是某天从 lily 掉到 shimmer，而是 lily 从未在生产里发过声。
（时间下界的说明：项目创建于 2026-05-16，`OPENAI_API_KEY` 于 05-19 写入，抽样到的最早对象是 05-23；
05-16~05-23 之间是否有更早对象无法确认——匿名 key 无权 list 存储桶（`/storage/v1/object/list/tts-audio`
返回 200 + 空数组），我没有越权去拿 service_role。但该窗口最长 7 天，且当时 `AUDIO_CDN_BASE`(05-23) 尚未配置，
可以认为音频系统尚未成型。）

**因此存量没有音色一致性问题：3438 个对象是同一个声音（shimmer），整齐划一。**

---

## Step 4 成本评估（只测算，不执行）

字符量基线（小学范围唯一对象，取 `normalized_text` 长度）：

| 口径 | 对象数 | 字符数 |
|---|---|---|
| 小学全量（含未生成） | 3438 | 58,832 |
| 其中现存（需重生成的部分） | 1942 | 31,480 |
| 其中仍缺（B3 无论如何都要生成） | 1496 | 27,352 |

平均 17.1 字符/对象——都是单词和短句，量非常小。

### 方案 shimmer（维持现状）

| 项 | 量级 |
|---|---|
| 重生成 | **0** |
| 额外费用 | **0**；B3 仍要补的 1496 个走 OpenAI ≈ 27.4k 字符，按 tts-1 $15/1M 计 ≈ **$0.4**（gpt-4o-mini-tts 更便宜，量级相同） |
| 耗时 | 只剩 B3 本身（见 B3 方案，约 1496 次请求） |
| 风险 | 无。音色已全站一致 |
| 遗留 | key 里的 `elevenlabs\|el:lily` 与事实长期不符，属**已知的命名债**，需要在代码注释里写明，避免后人再被误导 |

### 方案 lily（补 key 后改用真 ElevenLabs）

⚠️ 关键点：**cache key 不含"真实 provider"，所以补上 key 不会自动换声音**——
现存 1942 个对象会被 `existsInStorage()` 命中并原样返回，永远是 shimmer。
要换音色**必须先删除存量对象**，删完才会重新合成。

| 项 | 量级（估算区间） |
|---|---|
| 需重生成对象 | **1942**（小学范围现存量）+ B3 的 1496 个改由 lily 生成 = **3438** |
| 字符量 | **58,832**（小学范围）。⚠️ 另有**未量化的额外范围**：`speakKid`/`el:lily` 还被初中闯关 4 个关卡、`vocab/GuidedSession`（初中 En2Cn）、高考 Hub 预热使用（grep 实证），这些对象不在 Phase A 清单内，需要单独盘点后才能给数 |
| ElevenLabs 费用 | `eleven_multilingual_v2` 约 1 credit/字符。按公开档位折算约 **$0.12–0.30 / 1k 字符**（Business 档更低、Creator 档更高）→ 小学范围 ≈ **$7–18**；即便算上初中/高考同音色范围翻两三倍，也在 **$20–60** 量级。**费用不是决策瓶颈** |
| 删除存量 | 1942 个对象需 service_role 批量删（CC 无权限，要 Aaron 或一次性脚本） |
| **CDN 缓存清除（真正的成本项）** | 上传时带 `Cache-Control: public, max-age=31536000, immutable`。删存储不清 CDN 的话，`audio.bigmooneducation.com` 会继续吐旧 shimmer 音频**最长一年**。1942 条 URL 需要按 URL purge（Cloudflare 免费档单次 purge 最多 30 条 URL，需分批约 65 次，或走 Purge Everything / 换 CDN 路径前缀）。这一步的复杂度与风险**高于合成本身** |
| 耗时 | 合成 3438 次，按并发 3 + 退避、ElevenLabs 单次 1–3s ≈ **0.5–1.5 小时**；加上删除与 purge，整体 **半天到 1 天**（含验证） |
| 风险 | ①换声期间用户听到新旧混排（purge 未完成的部分仍是旧音）；②ElevenLabs 配额/欠费会重新触发**静默兜底**，届时又会混入 shimmer——除非先补上失败告警；③`el:lily` 是英式偏软的女声，与现用 shimmer 音色差异明显，属于产品侧口味决策，不是纯技术问题 |

> 计价说明：以上单价来自公开档位的换算，且我的知识存在时效性；**不要当成报价**，
> 决策前请以 elevenlabs.io/pricing 当日价为准。费用区间给的是量级，不是精确值。

---

## 待决策（B3 在音色决策前保持冻结）

1. 走 shimmer（零成本、零风险，接受 key 命名债）还是走 lily（要删存量 + 清 CDN + 补告警）？
2. 若走 shimmer：建议顺带在 `tts/index.ts` 与 `speak.ts` 的注释里写明"el:lily 是历史 key token，
   实际音色为 OpenAI shimmer"，并给 ElevenLabs 分支补一条"key 缺失"的一次性告警日志（避免下一个人再查一遍）。
   —— 这属于 B2 的代码改动范围，本阶段未做。
3. 若走 lily：需要先补 `ELEVENLABS_API_KEY`，再单独排一个"删存量 + 分批 purge + 重生成 + 抽验"的子阶段，
   并把初中/高考的同音色对象一起盘点，避免只换一半。
