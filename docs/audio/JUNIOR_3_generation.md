# 初中（junior）音频补生成 — 全部跑完

> **结论先行：junior 覆盖 14770/14770，缺失 0。**（生成前 5268/14770 = 35.7%）
> 五批共 **created 9497 / skipped 5 / failed 0 / needs_purge 0**，抽样 70/70 复验通过。
> 下面按"第一轮 P0+P1"与"第二轮 P2-P4"分别留档，因为两轮之间纠正了一个成本判断。

生成走 `scripts/audio/backfill-missing-audio.ts`（未 fork、未改 cache key、未 deploy edge），
参数与小学同：并发 3 / 每批 200 / 批间 5s / 指数退避 / 断点续跑 / 每条生成后 CDN HEAD 复验（200 且 ≥2KB）。
清单由 `junior-breakdown.mjs --emit-batches` 从 `junior_missing.csv` 切出，**分批之和 9502 = 清单总数**（脚本内断言，不等就退 2）。

---

## 0. 前置确认：384 道 `junior_listening_items` 没有混进可达集

实测（不是推断）：

- 该表 grade 7–9 共 384 行，唯一 `audio_text` **384** 条；
- 与本轮 14770 可达集求交集 → **0 条命中**；
- 可达集里 `source_ref` 含 `listening_items` 的行数 → **0**。

原因见 `JUNIOR_2_inventory.md` §4.1：那张表的取数 select 带了它没有的 `audio_url` 列，PostgREST 400，
运行时永远回退内联题，所以这批文本现在播不到、不该生成。`junior.json` 用 `unreachableSources` 显式记着它，
并有一条绊线测试盯着"select 改好但映射表没跟上"。

---

## 1. 成本

按字符与 provider 拆（provider 由音色派生：`el:` → ElevenLabs，其余 → OpenAI）：

| provider / 模型 | 条数 | 字符数 | 均长 |
|---|---:|---:|---:|
| ElevenLabs `eleven_multilingual_v2` | 7558 | 116802 | 15.5 |
| OpenAI `tts-1`（>40 字） | 159 | 43294 | 272.3 |
| OpenAI `gpt-4o-mini-tts`（≤40 字） | 1785 | 14323 | 8.0 |
| **合计** | **9502** | **174419** | |

- **OpenAI 部分可以算死**：tts-1 按 $15/1M 字符 = **$0.65**；`gpt-4o-mini-tts` 更便宜，按 tts-1 价当上界 = $0.21。
  → OpenAI 全部 **≤ $0.9**。
### ⚠️ 第一轮把 ElevenLabs 的成本算高了 —— 实测纠正

第一轮报的是"ElevenLabs 116802 字符 = $14.0–25.7、总计 $14.9–26.6、跨过 $20"，理由是本地没有 EL key、查不到套餐。
**这个前提本身就错了。** 结果 CSV 的 `provider` 列（edge 实报）给出了直接证据：

| 清单音色 | 条数 | edge 实际 provider |
|---|---:|---|
| `nova` | 1939 | openai |
| `el:lily` | 333（110 fcKid + 223 hubSlow） | **openai** |

**全量 9497 条生成完之后复查：`provider` 分布 = `{"openai": 9497}`，一条 elevenlabs 都没有。**

原因见 `B2_0_PROVIDER_REPORT.md`：项目**没有配 `ELEVENLABS_API_KEY`**，`el:lily` 只是被冻结的遗留 token——
它决定 cache key 里的 `provider` 字段（所以 key 长得像 elevenlabs），但合成时 edge 走
`fallbackVoice = isElevenLabs ? "shimmer" : selectedVoice` 落回 **OpenAI shimmer**。
即"key 上写着 elevenlabs、实际由 OpenAI 出声"。

→ 全部 174419 字符都按 OpenAI 计价：tts-1 那 43294 字符 $0.65 + 其余 131125 字符按 tts-1 价当上界 $1.97
= **总计 ≤ $2.6**（`gpt-4o-mini-tts` 实际更便宜），远在 $20 以内。第二轮据此一次跑完。

**教训**：`provider` 这一列一直在结果 CSV 里，第一轮却拿"查不到 EL 套餐"当不确定性来源——
第一批跑完就该看它。成本这类判断，有实测列就别用推价表。

---

## 2. 跑了什么

| 批次 | 内容 | 条数 | created | skipped | failed | needs_purge |
|---|---|---:|---:|---:|---:|---:|
| **P0** 自动播 | 默写游戏 nova@0.85 的 1785 + 闯关听音选词/情景应答 1.0 的 110 | 1895 | **1890** | 5 | **0** | **0** |
| **P1** 听力 | 无 MP3 听力整段 nova@0.85 的 159 + 听力选项正音 0.7 的 223 | 382 | **382** | 0 | **0** | **0** |
| **P2** 词三档 | word @0.85 / @0.8 / @0.7 | 3411 | **3411** | 0 | **0** | **0** |
| **P3** 语块 | JSON chunks + DB phrase_en + example_en @0.85 | 3537 | **3537** | 0 | **0** | **0** |
| **P4** 收尾 | 闯关剩余 113 + JSON 听力题干 102 + JSON 回退词 59 + 句型关 3 | 277 | **277** | 0 | **0** | **0** |
| **合计** | | **9502** | **9497** | **5** | **0** | **0** |

`skipped 5` = 幂等探测发现 CDN 上已经有了（首轮探测与生成之间有真人点过），不是错误。
**failed 明细：无 —— 五批全是 0，没有任何可省略的条目。**
`url_mismatch` 这一类硬失败也是 0 —— 说明 edge 实际返回的 URL 与清单预测的 cache key **逐条一致**，key 公式没有漂。

---

## 3. 独立抽样复验（不看脚本自报）

`scripts/audio/junior-sample-verify.mjs`：从清单按**档位分层**抽样，重新对 CDN 发 HEAD，200 且 ≥2KB 才算通过。
固定种子（Fisher-Yates，不用有偏的 `sort(()=>rnd()-0.5)`），可复现。

**第一轮（P0+P1 之后，种子 7，每档 13）**：65/65 全过。
其中 `hubNormal`/`hubListen` 当时还没生成，抽样池取的是"盘点判定为已存在"的对象，
顺带独立复验了盘点自己的 exists 判定。

**第二轮（五批全部跑完之后，种子 42，每档 14，抽样池 = 五份清单全集）**：

| 档位 | 通过/抽样 | 体积中位数 |
|---|---:|---:|
| `userDefault` nova@0.85 | 14/14 | 28032 B |
| `fcKid` 1.0 | 14/14 | 87840 B |
| `hubSlow` 0.7 | 14/14 | 39168 B |
| `hubNormal` 0.85 | 14/14 | 36480 B |
| `hubListen` 0.8 | 14/14 | 30720 B |
| **合计** | **70/70** | |

两轮共 135 条独立 HEAD，零失败。换了种子，抽的不是同一批。

---

## 4. 两个巡检

| 巡检 | 生成前 | P0+P1 之后 | 全部跑完 |
|---|---|---|---|
| **junior** | 5268/14770（35.7%） | 7545/14770（51.1%） | **14770/14770（100%），缺失 0，阈值 0 通过** |
| **primary** | 3436/3436 | 3436/3436 | **3436/3436，缺失 0** |

每一步都对得上：5268 + 2277 = 7545，7545 + 7225 = 14770。
primary 是在改过 `primary.json` 的 outOfScope（`src/data/juniorHub` 转交 junior）之后复跑的，仍然全绿。

四轮巡检的三条前置断言全过：假 200 探针 4/4 全 404、金丝雀被正确报成缺失、反向哨兵无游离目录。
junior 现在只剩 1 条待复核声明（`src/data/exams` status=unverified，与 primary 同一条，跟本轮无关）。

### 顺手修掉一个"永远在响"的告警

junior 首轮巡检报 `_backup/*.json` "声明为零引用，但仍被 5 个文件引用"——**是误报**：
`assertUnreferenced` 直接取 basename 去 grep，遇到 glob 就变成搜字符串 `"*.json"`，命中一大片。
（primary 那条写的是具体文件名，所以一直没暴露。）
已改成：glob 先展开成真实文件名再逐个 grep；展开不了时**明说"这轮没执行"**，不假装通过。
补了两条单测钉住这两点。修完 junior 的待复核声明从 2 条降到 1 条（剩下的 `src/data/exams` 是真的还没核）。

---

## 5. 复现与后续

子清单用一条命令重算（不入库，因为秒级可重算、且脚本里有"分批之和 = 清单总数"的断言）：

```
node scripts/audio/junior-breakdown.mjs --emit-batches
node scripts/audio/backfill-missing-audio.ts \
  --list data/audio-audit/junior_p2_words.csv \
  --out  data/audio-audit/junior_p2_result.csv \
  --progress data/audio-audit/junior_p2_progress.json --concurrency 3
```

（P3 / P4 同理换三个路径。结果与进度文件照常入库——那是"实际发生了什么"的记录。）

### 还没做的（不属于本轮）

- **384 道 `junior_listening_items` 仍然不可达**（`JUNIOR_2` §4.1）。修好那个 select 之后它们才需要生成，
  `junior.json` 的 `unreachableSources` 与那条绊线测试会在修好时提醒补表源。
- **错题本朗读用随机音色**（`getAlexVoice()` 六选一），本轮生成的对象在错题本里**一条都命中不了**——
  那是另一套 key 空间，要么固定音色、要么按 6 音色生成，等你定（`JUNIOR_2` §4.2）。
- **PR 闸门只跑 `--section primary`**：junior 现在 100% 了，但改 `src/data/juniorHub/**` 仍然不过任何音频检查。
  把 workflow 接上 junior 需要给 CI 配 `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`（表源要连库）。
  **junior 已经归零，这条现在做最划算**——从 0 缺口起步，之后任何新增内容都会当场被闸住。
