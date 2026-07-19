# 点词释义性能 · 勘察与 P0 方案

> 2026-07-11 · 图书馆(`/library`)精读点词释义慢到不可用的根因分析 + 三层重构方案。只读勘察产物,记录在案。

## 结论

三层架构**已经建好了两层半**,慢的根因不是缺机制,是**缓存几乎是空的 + 单次生成太重**:

- 缓存表 `phrase_explanations` **只有 41 行**(且部分是旧 schema `zh`、当前 `zh-v2` 读不到)。
- 实测**一次缓存未命中 = ~9000ms**(纯模型推理,非网络);命中 = ~300ms(edge invoke);直连 PostgREST = ~125ms。
- 精读一本新书时几乎每次点词都是 9 秒未命中 → 核心价值废掉。

## 链路

```
TappableLine (src/components/TappableLine.tsx，美语课与图书馆共用)
  → supabase.functions.invoke("explain-phrase")
    → 查 phrase_explanations 命中即返回
    → 未命中 → Gemini(gemini-2.5-flash)生成 8 段重讲解卡 → 写回 → 返回
```

慢的主因 = **模型推理**(那张 8 段带数组的重卡),不是网络。缓存机制对,但形同虚设(懒填充 + 表几乎空)。

## 现有可复用资产

| 资产 | 说明 |
|---|---|
| `phrase_explanations`(迁移 `20260501180358_*.sql`) | **就是要的全站缓存**:内容表、`SELECT USING(true)` 公开读、仅 `service_role` 写。已就位。 |
| `junior_vocab`(7486 行 / 4522 词)、`primary_vocab`(846 行 / 812 词) | 现成英汉词典:word/meaning_cn/pos/音标/例句。实测覆盖绿野仙踪词形 42%(精确)~57%(加词干) |
| `tts/index.ts` | `isMainlandChina(req)` 地区路由 + 内容哈希 CDN 缓存范本(AI 兜底可照抄) |
| `vocab-meaning-en/index.ts` | 批量生成范本(30/批、function-call 结构化输出) |
| `scripts/library/prewarm-audio.mjs` | 离线"读书 JSON → 批量调 edge → 产回填 SQL"范本 |

## 方案:只做 P0(已拍板)

**精读不用 9 秒重讲解卡**。精读要"这词什么意思 + 怎么读":**词性 + 一句话中文释义 + 音标 + 例句**(轻 schema)。重卡留给 v2 的"深入了解"按钮。

P0 = **离线预生成轻词表**,写进 `phrase_explanations`,用新 `target_lang='read-v1'` 区分轻词义与重卡(不改表结构)。三档数据源:

1. **词表档(零 AI)**:查 `junior_vocab`/`primary_vocab`;加词干回查(把 `lived` 的释义取自 `live`,仍按表面词形存)+ 小型语法虚词内置表。
2. **专名跳过**:Dorothy/Scarecrow/Toto 等不查词(全书大小写分析自动识别)。
3. **AI 档**:剩余实义词照 `vocab-meaning-en` 走 30/批轻 schema 生成(新 `define-words` edge function)。

**Ch1 实测分档**(55 句 / 412 可用词形):专名跳过 5 · 词表精确 209 · 词干回查 63 · 语法内置 29 · **AI 仅 106(4 批)** → 零 AI 覆盖 **74%**。

后续(不在 P0):**P1** 每本书词表随章节下发、前端本地查词(点词 0 网络,消除大陆跨境往返);**P2** AI 兜底照 TTS 加地区路由。P0 见效后再评估。

## 边界

只离线产文件 + 回填 SQL(Aaron 跑);不改 `TappableLine`、不改 `explain-phrase`;不合 main;不动 P0 `/reading`。
