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

## 巡检（定期跑，防"再长回来"）

```bash
npm run audio:audit          # = node scripts/audio/audit-audio.mjs --section primary --threshold 0
```

### 先证明检查器不空转，再信它的结论

三条**前置断言**，任一不过 → 整轮判无效、**禁止输出"全绿"**、退出码 **3**：

| # | 断言 | 挡的是什么 |
|---|---|---|
| ① | 4 条**必然不存在**的静态资源必须返回 404 | SPA 兜底一旦回归（返回 200 text/html），所有"缺失检查"都会假绿——这就是 water.mp3 那次的原始故障 |
| ② | **金丝雀**：注入一个随机 UUID 文本的 key，检查器必须把它报成缺失 | 探测函数恒返回"存在"之类的空转。报不出来说明检查器坏了，而不是内容没问题 |
| ③ | **反向哨兵**：无游离内容目录 | 新建内容目录没人告诉管线 |

三条都设计成"失效时可见"，并各有单测（含用**永远返回全绿的假检查器**验证金丝雀能识破它）。

### 退出码语义（便于接告警时分流）

| 码 | 含义 | 该怎么处理 |
|---|---|---|
| 0 | 前置全过 + 缺失 ≤ 阈值 | 无事 |
| 1 | 前置全过，但有真实缺口 | 跑 `npm run audio:backfill` |
| **3** | **前置未过，本轮结论作废** | 当"检查器/兜底坏了"处理，**不要**当成"内容缺音频" |
| 2 | 配置/覆盖率错误 | 新内容源没分类、picker 缺失、表源未解封 |

### 声明复核（防声明过期）

巡检每轮还会复核映射表里的"声明"是否仍然成立，输出为「声明待复核」清单（**告警但不判失败**）：

- `audioFree` 的 `consumers` 组件里若出现播放调用（`hubSpeak(` / `speakKid(` / `new Audio(` …）→ 告警，
  说明该内容源可能需要改成 `sources` 并声明档位；
- `audioFree` 带 `assertUnreferenced` 的文件若仍被引用 → 告警；
- `outOfScope` 里 `status: "unverified"` 的条目 → **每轮告警一次**，查清后改成 `confirmed` 告警自然消失。

> `status` 是必填的：缺失即 exit 2。理由是"未经确认"和"已确认无音频"必须区分开——
> 把"不知道"写进排除列表，从此哨兵不再报它，就又变成了一条静默假绿。
> 当前 `unverified`：`src/data/exams`、`src/data/sightWords.ts` + `src/data/g2LessonStages.ts`。

### 运行方式（已评估，不是假设）

实测结论：**巡检不需要任何凭据** —— 只对公开 CDN 与生产站点发 HEAD，不碰 Supabase 密钥、不调 edge。
（需要凭据的是"生成"：`audio:backfill` 要 anon key 调 tts edge。）

| 项 | 实测值 |
|---|---|
| 仓库可见性 | **private** |
| Actions | **已启用**（`allowed_actions: all`），此前无任何 workflow |
| 巡检所需 secrets | **0 个** |
| 单轮成本 | ~3400 次 HEAD、并发 8，4~6 分钟 |

因此走 GitHub Actions 可行，已加 `.github/workflows/audio-audit.yml`：`workflow_dispatch` + **每周一** 02:00 UTC。
按周跑约 25 分钟/月（私有仓库分钟数计费，故不设每日）。缺口结果以 artifact 上传。

⚠️ 一个诚实的提醒：**funny 修好之前这个任务会红，而且红是对的**（确实有 1 个对象缺失）。
funny 处理完后它应立刻变绿（3438/3438）；若仍红，说明有新缺口，别把它当成"已知的老红"忽略过去。

### 巡检看不见的盲区（记账，不用处理）

`o'clock` 这个孤立词条走的是浏览器 Web Speech（历史上云 TTS 读错撇号，四轮绕行后定的方案）。
巡检只能查云端对象存在与否；**它在某台设备上读得对不对，管线永远看不见**。
云端对象只是兜底。将来别有人"顺手统一"回云端——那四轮绕行说明这个词单独调过很久。

## 排错

| 现象 | 含义 |
|---|---|
| 退出码 2 + "找不到 xxx 的档位映射表" | 该 section 还没有矩阵，见上面情况③ |
| 退出码 2 + "覆盖率检查未通过" | 有新内容文件没分类，见情况② |
| 退出码 2 + "反向哨兵未通过" | 新建了内容目录但没在 `dataRoots`/`outOfScope` 声明 |
| 退出码 2 + "picker 未实现" | 映射表里写了不存在的 picker 名 |
| 退出码 2 + "表源…已封印" | 表源路径未经真实数据验证，按设计硬失败（不许 warn-and-skip） |
| 退出码 2 + "outOfScope 缺少合法 status" | 排除项必须标 confirmed / unverified |
| 退出码 1（precheck / audit） | 有缺口，正常，跑 `npm run audio:backfill` |
| **退出码 3** | 前置断言未过 → 结论作废，先查兜底/检查器，别改内容 |
| backfill 报 `url_mismatch` | edge 返回的 URL 与本地算的不一致 = key 构造漂移，**立刻停手查**，别重试 |
| backfill 报 `needs_purge` | 存储有对象但 CDN 取不到（负缓存），需要清 CDN 缓存 |
