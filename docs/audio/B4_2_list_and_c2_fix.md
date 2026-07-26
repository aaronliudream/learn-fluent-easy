# B4.2 生成清单 + C2 改法定稿

依据已批准的 `docs/audio/B4_1_speed_matrix.md`。cache key 公式一字未动；禁改 4 文件未触碰。

## 一句话结论

**B4 待生成清单为 0 条**（`data/audio-audit/b4_backfill_list.csv` 只有表头）。
矩阵可达的 3436 个对象**已全部就位**——B1.3 的 62 个 + B3 的 1495 个正好把 Phase A 那批
"部分档位缺音频"的对象补齐了。B4 的实际产出因此不是生成音频，而是 **C2 三处的根因修复 + 一个回归测试 + 两个数据/工具 bug**。

---

## Step 1 C2-1 / C2-2：禁止硬编码，改为共用同一符号

**没有写 `speed: 0.85`。** 新增单一来源
`src/lib/primaryHub/hubSpeakSpeed.ts` → `export const HUB_FIXED_SPEAK_SPEED = 0.85`，
并让**播放侧与预热侧都从它取**：

| 文件 | 播放侧 | 预热侧 |
|---|---|---|
| `speech.ts` | `hubSpeak(text, rate = HUB_FIXED_SPEAK_SPEED, grade?)` | 新增 `prefetchHubFixed(texts, grade)`（内部 `{ grade, speed: HUB_FIXED_SPEAK_SPEED }`）；`prefetchHubVocabulary` 的默认档也改为该常量 |
| `PrimaryHubStagePlay.tsx`（C2-1 句型对话关） | `:250 / :792 / :807` 用常量 | `:765` `prefetchTTSBatchKid(texts,{grade})` → `prefetchHubFixed(texts, grade)` |
| `PrimaryHubPhonics.tsx`（C2-2 拼读找一找） | `:204 / :302` 用常量 | `:192` → `prefetchHubFixed(...)` |
| `phonicsAudio.ts` | `:28 / :37` 兜底播放用常量 | — |
| `VocabQuizGame.tsx` / `VocabContextGame.tsx` | 用常量 | 见 Step 2 |

**为什么不能写死 0.85**（采纳评审意见，并补一条实证）：矩阵里拼写关/听音辨词关是
**按年级固定档**（g3 0.75 / g4 0.85 / g5 0.9 / g6 0.95）。在预热处写死 0.85 只有 g4 碰巧对，
其余三个年级会从"漏传"变成"传了但传错"，而且更隐蔽。共用符号后两侧不可能分叉。

### 四年级 key 逐字相等验证（新增回归测试）

`src/lib/primaryHub/speechSpeedParity.test.ts`（15 项，走仓库既有 vitest mock 模式）：

- 固定档模块：**g3 / g4 / g5 / g6 各自**断言"预热算出的 key === 播放算出的 key"（完整 key 字符串比较，不是只比 speed）
- 断言 `prefetchHubFixed` **必须显式带 speed**（漏传就会落回 `getKidSpeed`，正是 C2-1/C2-2 成因）
- 断言 `prefetchHubVocabulary` 默认档与 `hubSpeak` 默认档同源
- 按年级档模块：g3–g6 各自断言拼写关 / 听音辨词关两侧同一来源，并断言**四个年级的档位确实各不相同**
  （`[0.75, 0.85, 0.9, 0.95]`——若哪天被写死成 0.85，这条会红）

结果 **15/15 通过**。并做了**变异测试**证明它不是空转：把 `prefetchHubFixed` 改回
`{ grade }` 后 **5 项立刻转红（四个年级 + 漏传断言）**，改回来重新全绿。

## Step 2 C2-3：补全预热的**文本集合**（未动 speed 逻辑）

| 关卡 | 原来预热什么 | 现在 |
|---|---|---|
| 词汇关 Quiz | 只有 `word.en`；但揭晓后语块按钮（`:204`）也会朗读 | 并入 `word.chunks[].en` |
| 情景关 Context | 只有 `item.answer`（单个答案词）——**本关根本不播这个** | 改为预热真正会播的整句 `q.full` |

## Step 3 makeCloze 大小写：**根因不在 makeCloze**，改的是回填

**先给结论与依据，再动手**：

1. `makeCloze` 的大小写不敏感匹配是**必需的**。把它改成敏感会让 headword `yum` 找不到语块 `Yum!`
   → `buildContextItems` 直接跳过该条。实测：候选 (词,语块) 对从 **835 降到 829**，
   即"6 道题凭空消失"。**所以评审建议的那个改法不能用**（这是唯一需要纠正的一点）。
2. 真正的根因在**回填**：`ContextItem` 只带挖空后的 `cloze`，
   `VocabContextGame:42` 用 `cloze.replace("____", answer)` 重建整句，插回去的是 headword 自己的小写词形，
   句首就从 `Yum!` 变成 `yum!` ——显示不符课本，且**多出一个只差大小写的内容寻址对象**。
3. 因此改法：`ContextItem` 增加 `full`（= 语块原文 `c.en`），游戏直接用 `item.full` 朗读与显示。
   `makeCloze` **一行未动**，匹配行为零变化；顺带修正了显示（🔊 按钮现在显示课本原文大小写）。

### 又一个自我纠正：那 6 条根本不可达

B4.1 里我写"B4.2 要为这 6 条单列 @0.85"——**错了**。那次统计漏了 `isStrongCloze` 强搭配过滤。
用**修好后的真 `buildContextItems`** 实测：

- 情景题池真实规模是 **143 道**（不是 835；835 是未过滤的候选对数）
- 这 143 道里，旧回填法与原文不同的条数是 **0**
- 那 4 个词（wow / yum / whose / wait）单独喂进 `buildContextItems` → **产出 0 道题**，全被强搭配过滤挡掉

→ 6 条大小写差异**从来不是真实题目**，一个音频对象都不用生成。Step 3 的改动因此是**纯防御**：
将来新内容若产出能通过强过滤、且句首含 headword 的语块，不会再制造重复对象。

## Step 4 生成清单与 403 对账

按矩阵**从头重建**可达 (text, speed) 全集（不复用 Phase A 清单，避免同源错误）：

| 来源 | 唯一对象数 |
|---|---|
| vocab@fixed(0.85) | 428 |
| vocab@perGrade(0.75/0.85/0.9/0.95) | 271 |
| chunk@fixed | 983 |
| dialogue@fixed | 214 |
| listening@switchable(三档) | 453 |
| sentenceLesson@switchable(三档) | 809 |
| fc@kidSpeed(G3 0.85 / G4-6 1.0) | 275 |
| phonics@fixed | 3 |
| contextGame@fixed | 0（143 道题的整句与 chunk 原文逐字相同，键已被 chunk 覆盖） |
| **合计** | **3436** |

交叉对账：

| 项 | 结果 |
|---|---|
| 矩阵有、Phase A 未枚举过的组合 | **0** —— Phase A 的枚举与矩阵完全吻合（当初就只枚举了可达档位，没铺 0.8/0.74 那种不可达档） |
| Phase A 枚举过、按矩阵不可达 | **2**，均 @0.95：`studies` / `hiking`（见下） |
| 矩阵可达且至今仍缺 | **0** |

### 403 逐项归因

| 分类 | 数量 | 说明 |
|---|---|---|
| **不可达档位排除** | **0** | Phase A 本来就没枚举不可达档位，没有可排除的 |
| **已在 B1.3 / B3 中补齐** | **507 个对象**（分布在 397 条文本上） | 全部命中 B1.3 的 62 或 B3 的 1495 |
| **其他** | **0** | —— |

**403 与 397 的差 = 6**：Phase A 报告里那 403 是**没有排除 `public_asset` 行**算出来的。
那 6 行正是自然拼读的捆绑 MP3（ruler / water / sister / computer / tiger / dinner），
它们的"缺失变体"是**不存在的 mp3 文件**、不是 TTS 对象；B1.2 已把这条路径整体去掉。
按 TTS 对象口径复算就是 **397**。

### 那 2 条 @0.95 不可达对象 = 过期数据（已清理）

`listenWordAudio.json` 里存着 `6|studies` 与 `6|hiking`，而课程数据早已把这两个词改成
`study` / `hike`（这正是 B1.3 发现这两个词缺预生成 URL 的原因）。运行时查表用的 key 是
`${grade}|${target.en}` = `6|study` / `6|hike`，所以那两条**永远查不到**，是死数据，
还会误导将来的审计（它们让 grade6 的键数看起来是 82 而不是 80）。
本次已从 JSON 移除 2 条（441 → 439）。对应的两个音频对象留在桶里，无害，不单独清理。

### 不依赖账面的抽样实测

从矩阵全集里按 speed 分层抽 60 个直接 HEAD（覆盖 0.7 / 0.75 / 0.85 / 0.9 / 0.95 / 1.0 六档）：
**60/60 为 200 + audio/mpeg 且 ≥2KB**。

---

## 顺带修掉的两个工具 bug（B6 会依赖这两个脚本，必须先修）

1. **CSV 解析不容忍 CRLF**（`export-c3-list.mjs`、`backfill-missing-audio.ts`）：
   git 检出把 LF 转成 CRLF 后，按 `'\n'` 切行会让**最后一列连表头名**都带上 `\r`，
   于是 `r.verdict` 恒为 `undefined` —— **静默失效**。
   本轮在新检出的 worktree 上真踩了这一下：`export-c3-list` 一度算出"0 条 C3"。
   已改为 `split(/\r?\n/)`，并在 CRLF 检出上复测：正确算出 1495 条（与 B3 当时一致）。
2. **`listenWordAudio.json` 的 2 条过期键**（见上）。

## 质量门

- `npx vitest run src/lib/primaryHub src/pages` → **189 passed / 1 failed**，
  失败的是 `registry.test.ts > discovers sentence lessons for g4v1 u1–u6 and g4v2 u1–u6`。
  **已确认是既有基线**：把本次全部改动 revert 掉在 origin/main 上重跑，同样失败
  （另有 `slangLocalization.test.tsx` 7 项 i18n 失败，同为基线；`srs.test.ts` 那次失败是
  worktree 缺 `.env`，补上即过）。
- `npx vite build` → **绿（41.6s）**。
- 变异测试：见 Step 1。

## 待确认

B4.3 执行阶段**实际无事可做**（清单 0 条）。要不要就此收口、直接进 B6？
