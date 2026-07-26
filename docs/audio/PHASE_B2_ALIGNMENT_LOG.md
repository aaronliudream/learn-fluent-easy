# Phase B2 — tts edge function 仓库/线上对齐（执行记录）

前置：`docs/audio/B2_0_PROVIDER_REPORT.md`
对齐方向：**仓库向线上看齐**。cache key 公式一字未动，`elevenlabs|el:lily` 保持原样。
`aliyun` 死分支按要求**未清理**，留给单独的清理提交。

---

## Step 1 对齐结果

### 同步进仓库的两处差异（与 B2.0 认定的完全一致，无第三处）

**① `AUDIO_CDN_BASE` 逻辑**

```ts
// 新增
const AUDIO_CDN_BASE = (Deno.env.get("AUDIO_CDN_BASE") || "").replace(/\/$/, "");

function storageUrlFor(path: string): string {          // 原 publicUrlFor 的实现
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}
function publicUrlFor(path: string): string {           // 返回给客户端的地址：有 CDN 走 CDN
  if (AUDIO_CDN_BASE) return `${AUDIO_CDN_BASE}/${path}`;
  return storageUrlFor(path);
}
async function existsInStorage(path: string) {
  const r = await fetch(storageUrlFor(path), { method: "HEAD" });   // 探原始存储域，不被 CDN 负缓存骗
  ...
}
```

**② 冷路径 `queueMicrotask(upload)` → `await upload`，统一返 JSON**

```ts
await uploadToStorage(path, bytes!);        // 先落库再回包，客户端拿到 URL 时对象已就位
if (format === "url") {
  return json({ audioUrl: cdnUrl, cached: false, provider: usedProvider, mimeType: "audio/mpeg" });
}
```
（原仓库版在冷路径返回裸 `audio/mpeg` 字节 + `x-audio-url` 头，绕过 CDN。）

diff 规模：`1 file changed, 31 insertions(+), 22 deletions(-)`。

### 逐字校验

改完重新 `supabase functions download tts`（拉到 scratch 目录，不落仓库）再比对：

```
diff supabase/functions/tts/index.ts <重新拉取版>
429c429
< });
---
> });
\ No newline at end of file
```

唯一差异是**文件末尾换行**（下载件没有结尾换行，仓库保留）。去掉末尾换行后 md5 相同：

```
repo(去末换行) = fe5dafdcd7f3f9cfe552bce2c3c18718
线上           = fe5dafdcd7f3f9cfe552bce2c3c18718   ✅ 逐字一致
```

**结论：仓库版现在与线上部署逐字相同（仅格式化差异）。**

---

## Step 2 黄金测试：439/439 ✅

新增 `scripts/audio/tts-golden-url.mjs` + `scripts/audio/fixtures/tts-golden-439.json`。

- **fixture 来源**：`git show fec0dddc:src/data/primaryHub/listenWordAudio.json` —— Phase A 里逐条 HTTP 实测过的
  439 条线上 URL（B1 新增的 study/hike 不在内，保持"439"这个基准数不被稀释）。
  按年级：G3 95 / G4 168 / G5 96 / G6 80。
- **断言对象**：**完整 URL 字符串**（`https://audio.bigmooneducation.com/<2hex>/<64hex>.mp3`），含域名与裸 path，不是只比 hash。
- **测的是真代码**：脚本不重写任何算法，而是从 `supabase/functions/tts/index.ts` 里按锚点**原样抠出**
  `OPENAI_VOICES` / `ELEVENLABS_VOICE_MAP` / `isMainlandChina` / `sha256Hex` / `SUPABASE_URL` / `BUCKET` /
  `AUDIO_CDN_BASE` / `storageUrlFor` / `publicUrlFor`，以及 `serve()` 里从 `const requestedVoice` 到
  `const cdnUrl = publicUrlFor(path);` 的整段，拼成临时 TS 模块交给 Node 原生类型擦除执行。
  任一锚点抠不到直接判失败——源码结构变了必须有人来看。

```
完整 URL 字符串逐字比对：439/439 相等
✅ 439/439 全绿
```

**负向对照**（证明测试不是永远通过）：`AUDIO_CDN_BASE=https://wrong.example.com` 重跑 → `0/439`，退出码 1。

---

## Step 3 冷热路径行为验证（deploy 前，对线上实跑）

新增 `scripts/audio/tts-live-verify.mjs`（deploy 前后都能跑，用于对比"部署没改变行为"）。
因为仓库版此刻与线上逐字相同，对线上实跑即等价于验证"即将部署的这份代码"的行为。

```
=== 热路径 20 条（已存在对象）===
✅ 20/20：URL 三方一致（线上返回 = 本地代码构造 = Phase A 基准）且 cached=true

=== 冷路径 1 条（一次性探针，真合成）===
探针 "b2 alignment probe alpha pre-deploy-a"
✅ 合成前对象确实不存在（HEAD=400，真冷路径）
✅ 响应为 JSON，字段齐全：cached=false / mimeType=audio/mpeg / provider=openai
✅ audioUrl 与本地代码构造逐字相等（新对象仍落同一 CDN 路径格式）
✅ 新对象立刻可下载并解析出真实音频：78720B / 205 帧 / 4.92s / 24000Hz（端到端出声）

=== 前端解析兼容性（src/lib/speak.ts:436-447 判定顺序）===
✅ content-type = application/json → 走 JSON 分支，不会落到 audio/ 或 unexpected 分支
✅ data.audioUrl 是 http URL → 直接作为播放地址
```

`await upload` 的时序变化经此确认是**安全方向**：客户端拿到 audioUrl 时对象已经在桶里，
不存在"URL 到手但对象还没落库"的窗口（原 `queueMicrotask` 版本有这个窗口）。

探针对象（可清理）：`tts-audio / 86/8651f647cc88fdef5532f8107716d69302a2df6913a084beb0277e0b819a5f76.mp3`

---

## Step 4 部署：**未执行，等 Aaron 决定**（理由如下）

对齐做完后出现了一个任务书没有预料到的事实：**这次 deploy 是纯 no-op。**

| 项 | 状态 |
|---|---|
| 代码 | 仓库版与线上版**逐字相同**（md5 一致，见 Step 1）→ 部署上去的是同一份源码 |
| 函数配置 | `supabase/config.toml` 的 `[functions.tts] verify_jwt = false` 与线上实际 `verify_jwt:false` 一致；`import_map:false` 两侧也一致 → 配置不会漂移 |
| 收益 | **0**：没有任何功能/行为变化会到达用户 |
| 风险 | 非零：版本会从 v10 → v11，在**当前平台运行时**重新打包一份（线上这版是 2026-05-24 打的）。运行时版本差异带来的问题**无法回滚**——重新部署同一份代码并不能把运行时退回旧版本，任务书里"异常就回滚到 deploy 前版本"这条对运行时不成立 |

因此我停在这里等一句话：

- **不部署**（推荐）：仓库已经是线上的真源码，B2 的目的（源码可信、有黄金测试守着）已经达成；
  下一次真正需要改 tts 时再部署，那时黄金测试会先拦一道。
- **部署**：说一声我就跑 `supabase functions deploy tts`，然后立刻用
  `node scripts/audio/tts-live-verify.mjs --hot 20 --cold 3` 复验（20 条热 + 3 条冷），
  结果贴回来；异常我会立刻用同一份源码重新部署（代码层面可回滚，运行时层面不可）。
