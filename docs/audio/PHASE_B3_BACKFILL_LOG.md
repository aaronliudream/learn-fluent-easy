# Phase B3 — C3 缺失音频批量补生成（执行记录）

音色维持现状（OpenAI shimmer，见 `B2_0_PROVIDER_REPORT.md`）。cache key 公式一字未动，
未改 tts edge、未 deploy。禁改 4 文件未触碰。

---

## Step 1 生成清单

`node scripts/audio/export-c3-list.mjs --status data/audio-audit/primary_audio_status.csv --exclude data/audio-audit/p0_silent_set.csv --out data/audio-audit/b3_backfill_list.csv`

结果：**1495 个唯一对象**（1495 行 / 1495 唯一 cache_key / 1495 唯一 CDN URL，无重复）。

### 与审计数字 1496 的差异说明

| 口径 | 数量 |
|---|---|
| Phase A 判定 `C3_MISSING` 的唯一对象 | 1557 |
| 减去 B1.3 已补的自动播静音集 | −62 |
| **B3 清单** | **1495** |
| 审计报告里写的"仍缺 1496" | 1495 + **funny** |

差的那 1 条是 `fc_g5v1_lcw_02` 的 `"funny"`：审计里它的 verdict 是 `C1_SUSPICIOUS_SMALL`（**对象存在但只有 0.12 秒**），
统计"还需要补"的时候把它算进去了，但它**不属于 C3、也不能靠生成修复**——
`existsInStorage()` 会命中这个损坏对象直接返回，不会触发重新合成。
必须先删对象 + 清 CDN 缓存（`SQLAA/2026-07-25-删除损坏TTS对象-funny.sql`），再走预热与复验三步。

清单构成：按语速 0.85 → 999 / 0.7 → 380 / 1.0 → 116；总字符 27,347。

## Step 2 脚本

`scripts/audio/backfill-missing-audio.ts`（Node 24 原生跑 .ts，无需构建）

- **列表驱动**：生成什么全来自 `--list` 的 CSV，代码里不写死任何业务清单；B4 语速档换个清单即可复用。
- **幂等**：每条先 HEAD 探测，已存在（200 且 ≥2KB）记 `skipped`，不重复合成。
- **并发 3 + 指数退避**，覆盖两类限流来源：CDN/Storage 侧 429，以及 edge 把 OpenAI 错误
  （含 OpenAI 自己的 429/超时）包装成的 502/5xx；网络异常单独退避。
- **断点续跑**：每 25 条与每批结束落盘 `data/audio-audit/backfill_progress.json`（tmp + rename 原子写），
  重跑同一命令自动跳过已完成条目。本次实测生效：先跑了 `--limit 5`，全量跑时正确识别"已有 5 条完成记录"。
- **每批 200，批间停顿 5s**。
- **逐条 CDN 复验**：非 200 或 < 2048 字节记 `failed`；
  CDN 取不到但**存储侧有对象**记 `needs_purge=yes` 单列（CDN 负缓存，需要清缓存，绝不静默）。
- **额外不变量**：edge 返回的 audioUrl 必须与清单预测的 URL 逐字相等，否则记 `failed:url_mismatch`
  ——这条是 B2 黄金测试的运行时版本，key/URL 构造一旦漂移立刻炸出来。

## Step 3 结果

```
created     : 1495
skipped     : 0
failed      : 0
needs_purge : 0
```

**failed 明细：无**（不是省略）。结果 CSV 1495 行逐行核对：
`status` 全 `created`、`cdn_status` 全 200、`needs_purge` 全 `no`、`attempts` 全为 1
（一次成功，整程没触发任何退避重试，说明没撞到 429）、`provider` 全 `openai`。
字节分布 min 15,360 / p50 40,320 / max 126,336，**0 条 < 2KB**。
清单 1495 ↔ 结果 1495 ↔ 唯一 key 1495 三处对账一致。

**独立抽样复验**（不依赖脚本自身结论）：等距抽 30 条直接 HEAD 线上 → **30/30 为 200 + audio/mpeg + ≥2KB**。

### 小学范围覆盖度

| 阶段 | 对象数 |
|---|---|
| Phase A 审计时已存在 | 1880 |
| B1.3 自动播静音集补齐 | +62 |
| B3 本次补齐 | +1495 |
| **合计已就位** | **3437 / 3438** |
| 仍缺 | 1（funny，等删除+purge 后走三步修复） |

> 注：`data/audio-audit/primary_audio_status.csv` 是 Phase A 的**快照**，其中 2205 行 `C3_MISSING`
> 反映的是审计当时的状态，不代表现状。现状 = 快照 + B1.3 的 62 + B3 的 1495。

## 顺带

`SQLAA/2026-07-26-删除B2探针对象.sql`：清理 B2 冷路径验证留下的一次性探针对象（可选，77KB，不影响功能）。
