# 初中（junior）音频补生成 — 第一轮（P0 + P1）

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
- **ElevenLabs 部分算不死**：它按 credit（1 字符 = 1 credit）走订阅额度，单价随套餐变：
  Creator $0.22/1k、Pro $0.198/1k、Scale $0.165/1k、Business $0.12/1k。
  116802 credits → **$14.0 ~ $25.7**；若本月额度还没用完，边际支出是 **$0**。
  本地 `.env` 里没有 ElevenLabs key（生成走线上 edge），**我无法查账户套餐和余额**，所以这里只能给区间。

**总计 $14.9 ~ $26.6，跨过了 $20 这条线**（跨线的全部不确定性都在 ElevenLabs 那 11.7 万字符上）。

因此本轮的处理：**把不含糊的、且正好是优先级 1 和 2 的两批跑完，跨线的那部分停下来等你定。**

| | 条数 | 字符 | 其中 ElevenLabs | 估算 |
|---|---:|---:|---:|---|
| 本轮已跑 P0+P1 | 2277 | 79248 | 21631 字符 | **≈ $3.5–5.7** |
| 待你确认 P2+P3+P4 | 7225 | 95171 | 95171 字符（全 el:lily） | **≈ $11.4–20.9** |

---

## 2. 跑了什么

| 批次 | 内容 | 条数 | created | skipped | failed | needs_purge |
|---|---|---:|---:|---:|---:|---:|
| **P0** 自动播 | 默写游戏 nova@0.85 的 1785 + 闯关听音选词/情景应答 1.0 的 110 | 1895 | **1890** | 5 | **0** | **0** |
| **P1** 听力 | 无 MP3 听力整段 nova@0.85 的 159 + 听力选项正音 0.7 的 223 | 382 | **382** | 0 | **0** | **0** |
| 合计 | | 2277 | **2272** | 5 | **0** | **0** |

`skipped 5` = 幂等探测发现 CDN 上已经有了（跑之前那一刻刚被真人点出来，或首轮探测到本轮之间有人播过），不是错误。
**failed 明细：无**（两批都是 0，没有可省略的条目）。
`url_mismatch` 这一类硬失败也是 0 —— 说明 edge 实际返回的 URL 与清单预测的 cache key **逐条一致**，key 公式没有漂。

---

## 3. 独立抽样复验（不看脚本自报）

`scripts/audio/junior-sample-verify.mjs`：从清单按**档位分层**抽样，重新对 CDN 发 HEAD，200 且 ≥2KB 才算通过。
固定种子（Fisher-Yates，不用有偏的 `sort(()=>rnd()-0.5)`），可复现。

| 档位 | 通过/抽样 | 体积中位数 |
|---|---:|---:|
| `userDefault` nova@0.85 | 13/13 | 28032 B |
| `fcKid` 1.0 | 13/13 | 101280 B |
| `hubSlow` 0.7 | 13/13 | 66816 B |
| `hubNormal` 0.85 | 13/13 | 29184 B |
| `hubListen` 0.8 | 13/13 | 25728 B |
| **合计** | **65/65** | |

`hubNormal` / `hubListen` 本轮没生成，抽样池取的是**盘点判定为"已存在"的对象**——
顺带独立复验了盘点自己的 exists 判定，不只是验刚生成的那部分。

---

## 4. 两个巡检

**junior**：覆盖 **7545 / 14770（51.1%）**，缺失 7225。
生成前是 5268/14770（35.7%），5268 + 2277 = 7545，**与本轮跑的条数逐条对上**。
剩余缺口按档位：`hubNormal` 4602 / `hubSlow` 1821 / `hubListen` 689 / `fcKid` 113；
`userDefault` 档 **已归零**（1944 条全部生成）。

**primary**：覆盖 **3436 / 3436**，缺失 0，退出码 0 —— 改过 `primary.json` 的 outOfScope（`src/data/juniorHub` 转交 junior）之后仍然全绿。

两轮巡检的三条前置断言都过：假 200 探针 4/4 全 404、金丝雀被正确报成缺失、反向哨兵无游离目录。

### 顺手修掉一个"永远在响"的告警

junior 首轮巡检报 `_backup/*.json` "声明为零引用，但仍被 5 个文件引用"——**是误报**：
`assertUnreferenced` 直接取 basename 去 grep，遇到 glob 就变成搜字符串 `"*.json"`，命中一大片。
（primary 那条写的是具体文件名，所以一直没暴露。）
已改成：glob 先展开成真实文件名再逐个 grep；展开不了时**明说"这轮没执行"**，不假装通过。
补了两条单测钉住这两点。修完 junior 的待复核声明从 2 条降到 1 条（剩下的 `src/data/exams` 是真的还没核）。

---

## 5. 剩下的 7225 条：等你一句话

| 批次 | 内容 | 条数 | 字符（全 el:lily） |
|---|---|---:|---:|
| P2 | 词的三个 hub 档（0.85 / 0.8 / 0.7） | 3411 | 27761 |
| P3 | 语块（JSON chunks + DB phrase + example） | 3537 | 57690 |
| P4 | 闯关剩余 113 + JSON 听力题干 102 + JSON 回退词 59 + 句型关 3 | 277 | 9720 |

子清单用一条命令重算（不入库，因为秒级可重算、且脚本里有"分批之和 = 清单总数"的断言）：

```
node scripts/audio/junior-breakdown.mjs --emit-batches
node scripts/audio/backfill-missing-audio.ts \
  --list data/audio-audit/junior_p2_words.csv \
  --out  data/audio-audit/junior_p2_result.csv \
  --progress data/audio-audit/junior_p2_progress.json --concurrency 3
```

（P3 / P4 同理换三个路径。结果与进度文件照常入库——那是"实际发生了什么"的记录。）

要我继续，回一句"跑 P2-P4"就行；如果你知道 ElevenLabs 的套餐档位（或本月额度还剩多少），
告诉我我就能把 $14–21 这个区间收成一个确定数字。
