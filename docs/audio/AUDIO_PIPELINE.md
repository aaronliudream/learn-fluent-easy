# 新内容上线前的音频两步（标准操作）

> 为什么要有这一步：音频是**内容寻址**的——文本或语速差一个字符就是另一个对象。
> 新词表/新题库合进来时，这批文本的音频对象并不存在；**在自动播路径上（游戏切词、
> 关卡自动读题、闯关每题 250ms 自动播），冷合成等于这一次没有声音**（`speak.ts` 的
> 非手势分支只做纯预热、不出声）。所以补生成必须发生在合入前，而不是等孩子踩到。

## 两步

```bash
# ① 先看缺口（不生成，CI 可用；有缺口时退出码 1）
npm run audio:precheck

# ② 生成（导出清单 → 逐条合成 → 逐条 CDN 复验）
npm run audio:backfill
```

就这两条。`audio:backfill` 内部串的是：

```
scripts/audio/export-content-audio-list.mjs   # 内容源 → 待生成清单（增量：已有对象不列入）
  ↓ data/audio-audit/pipeline_list.csv
scripts/audio/backfill-missing-audio.ts       # 并发 3 + 退避 + 断点续跑 + 逐条 CDN 复验
  ↓ data/audio-audit/pipeline_result.csv
```

默认跑 `--section primary`。想跑别的 section：`npm run audio:precheck -- --section junior`
（参数取最后一次出现，会覆盖 npm script 里写死的那个）。

## 档位映射表：`scripts/audio/audio-sources/<section>.json`

管线**不含任何默认档位**。每个内容源要生成哪几档，全部来自这张表；表是数据、picker 是代码，两者分离。

```
tiers      档位定义（fixed / perGrade / switchable / kidSpeed），每档标注对应的代码常量与模块
sources    有朗读文本的内容源：files(glob) + picker + tiers + playedBy(哪一行代码在播)
audioFree  确认无音频的文件，必须写 why（依据）
artifacts  产物而非内容源（如 listenWordAudio.json）
dataRoots  覆盖率检查要**递归**扫的根目录
```

primary 的档位取自已批准的 `docs/audio/B4_1_speed_matrix.md`：

| 档位 | 速度 | 模块 |
|---|---|---|
| `fixed` | 0.85 | 单词卡 / 句型对话关 / 6 个词汇游戏 / 语块 / 情景关 / 自然拼读 |
| `perGrade` | g3 0.75 · g4 0.85 · g5 0.9 · g6 0.95 | 拼写关 / 听音辨词关 |
| `switchable` | 0.7 · 0.85 · 1.0（用户可切，三档全可达） | 听力测试关 / 句型课 |
| `kidSpeed` | G3 0.85 · G4-6 1.0 | 英语闯关全部关卡 |

## 加新内容时会遇到的三种情况

**① 往已映射的目录里加文件**（例如新增一课 `src/data/primaryHub/sentence/g5v2_u7_grammar.json`）
→ 自动纳入，无需改配置。`audio:precheck` 会把新句子按 `switchable` 三档报成缺口。

**② 新增一类内容（新目录 / 新数据结构）**
→ 管线**报错退出（退出码 2）**，并列出未分类的文件。必须手工在映射表里加一行，三选一：

```jsonc
// 有朗读文本
{ "id": "xxx", "files": "src/data/primaryHub/xxx/*.json", "picker": "<已实现的 picker>",
  "tiers": ["fixed"], "playedBy": "哪个组件哪一行在播" }
// 确认无音频
{ "files": "src/data/primaryHub/xxx/*.json", "why": "grep speak|Audio 零命中" }
```

**这条挡人是故意的。** 默认值会让管线"看起来跑通了"，而实际上那批文本一个音频都没生成
（或生成到没人播的档位上）——两种情况都没有任何审计能发现：对象 HTTP 200、体积正常，
就是永远不会被命中。宁可每次手工加一行。

若新内容需要新的抽取方式，则要同时在 `export-content-audio-list.mjs` 的 `pickers` 里加一个
（现有：`courseVocab` / `courseChunks` / `courseDialoguePairs` / `courseListening` /
`sentenceLesson` / `fcSeed` / `phonicsTs`）。picker 未实现也会报错退出，不会静默跳过。

**③ 接入新的 section（junior / senior / american）**
→ 管线**拒绝执行**，提示需先产出该 section 的可达档位矩阵。理由同上：没有矩阵就没有正确档位，
猜一个默认值等于批量生成错档对象。做法照 `docs/audio/B4_1_speed_matrix.md`：
逐个音频调用点核源码，区分固定档 / 按年级档 / 用户可切换档 / getKidSpeed，产出矩阵后再写映射表。

## 当前状态（实测）

| 项 | 值 |
|---|---|
| 已接入 section | **primary**（junior / senior / american 会拒绝执行并提示） |
| 覆盖率检查 | `src/data/primaryHub` 下 **74 个文件全部已分类** |
| 可达 (文本 × 档位) 唯一对象 | **3436** |
| 现存 | 3435 |
| 缺口 | **1** —— `funny` @1.0（`fc_g5v1_lcw_02`）|

那 1 个缺口不是新发现的漏网之鱼，正是音频审计里那个 **1920 字节 / 0.12 秒的损坏对象**：
管线按"HTTP 200 且 ≥2KB 才算存在"判定，于是在完全不知情的前提下把它独立挖了出来。
处理方式见 `SQLAA/2026-07-25-删除损坏TTS对象-funny.sql`（删对象 + CF purge，之后管线会自动补上）。

## 排错

| 现象 | 含义 |
|---|---|
| 退出码 2 + "找不到 xxx 的档位映射表" | 该 section 还没有矩阵，见上面情况③ |
| 退出码 2 + "覆盖率检查未通过" | 有新内容文件没分类，见情况② |
| 退出码 2 + "picker 未实现" | 映射表里写了不存在的 picker 名 |
| 退出码 1（precheck） | 有缺口，正常，跑 `npm run audio:backfill` |
| backfill 报 `url_mismatch` | edge 返回的 URL 与本地算的不一致 = key 构造漂移，**立刻停手查**，别重试 |
| backfill 报 `needs_purge` | 存储有对象但 CDN 取不到（负缓存），需要清 CDN 缓存 |
