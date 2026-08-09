# 托福板块全面体检报告

**日期**:2026-08-09 · **范围**:`/vocab` 全部页面与内容表 · **原则**:只查不改

> 起因:错题本从 PR-4 上线至今一直是「加载失败 · 重试」,双方都没发现。
> 本次目的不只是找 bug,是找出**为什么这种问题能躺这么久**(见第六节)。

---

## 严重度汇总

| 严重度 | 条数 | 概要 |
| --- | --- | --- |
| 🔴 阻塞使用 | **0** | 错题本那条已在本轮之前修复并合并(#334) |
| 🟠 影响体验 | **3** | translate edge CORS 全站报错 / 51 处静默失败 / 未登录态无法端到端验证 |
| 🟡 内容瑕疵 | **4** | 1 词缺 def_zh / total_words 元数据不符 / 38 组重复内容 / 16+3 条待重烧音频 |
| ⚪ 已知无害 | 2 | 冠词扫描的 5 处全是误报 / 空值全部有已知来源 |

---

## 一、每条链路端到端实跑

在真 preview 上跑了 **14 条路径**,每条等到 `networkidle` + 6 秒。

| 路径 | 结果 | 实际内容 |
| --- | --- | --- |
| `/vocab` 词汇中心 | ✓ | 749 字,横幅/词库卡/今日学习/进度条/学习方式全渲染 |
| `/vocab/today` 今日学习 | ✓ | 出题正常:`新词 1/20 defense /dɪˈfɛns/ n. 防御;辩护` + 例句 |
| `/vocab/scenes` 场景列表 | ✓ | 1218 字,30 个场景卡 |
| `/vocab/toefl` 词库页 | ✓ | 621 字 |
| `/vocab/toefl/quiz` 英汉选择 | ✓ | `1/10 defense` + 四选项(途径/整体/钱包/防御) |
| `/vocab/toefl/match` 词汇配对 | ✓ | 牌面正常 |
| `/vocab/toefl/listen` 听音辨义 | ✓ | `1/10 点喇叭再听一遍` + 四选项 |
| `/vocab/toefl/spell` 听写挑战 | ✓ | `1/10 s _ _ _ _ _ 部门;行业` |
| `/vocab/mistakes` 错题本 | ✓ | 空态正常(测试账号无错题);**#334 修复已验证** |
| `/vocab/listen` 磨耳朵 | ✓ | 四种选词范围齐、`点击开始 / 第一条已准备好` |
| `/vocab/chunks` 词块与习语 | ✓ | 10,724 字 |
| `/vocab/expressions` 中文这样说 | ✓ | 14,623 字 |
| `/vocab/confusion` 易混词辨析 | ✓ | 挖空题正常:`同组:假设的类型` + postulate/supposition/hypothesis |
| `/vocab/dictation` 默写纸 | ✓ | 2,640 字 |

**PostgREST 4xx/5xx:全部路径 0 条。**

### 🟠 [体验] 本轮实测是**未登录态**,不是登录态 — 严重度:影响体验(对本报告的可信度)

所有页面都显示「未登录状态下答题不会保存进度」,说明我用 Playwright 注入 localStorage 会话的做法在这个域名下**没有被 Supabase 客户端读到**。

**根因**:未查明。可能是键名/结构与当前 supabase-js 版本不符,也可能是客户端在注入前就已初始化。

**影响**:登录态特有的路径(掌握度写入、错题本闯关全程、今日学习结算页、收藏)**本轮没有真正走到**。第一节的"✓"只能证明**页面能开、出题正常、无 4xx**,不能证明登录后的写入链路正常。

**建议**:改用真实 UI 登录流程(填表单提交)而不是注入 localStorage;或在页面加载后调用 `supabase.auth.setSession()`。这条不修完,以后所有"端到端验过了"都要打折扣。

### 🟠 [体验] `functions/v1/translate` 全站 CORS 失败 — 严重度:影响体验

**每一个**被测页面都有同样两条 console error:

```
Access to fetch at 'https://<project>.supabase.co/functions/v1/translate'
from origin '<preview>' has been blocked by CORS policy
Failed to load resource: net::ERR_FAILED
```

**现象**:14/14 页面必现,与词汇板块本身无关(全站性)。
**根因**:未查明 —— 需要看 `supabase/functions/translate` 的 CORS 响应头是否带上 preview 域名。**注意:修改并部署 edge function 是禁区**,本轮未动。
**影响**:如果有功能依赖它(如划词翻译),那个功能在 preview 上是坏的;若只是无人调用的遗留请求,则只是噪音 —— 但它会淹没真正的报错,让"控制台有没有红字"失去筛查价值。

---

## 二、静默失败专项扫描

### 🟠 [体验] 51 处 catch 吞掉数据查询错误且无日志 — 严重度:影响体验

全板块 **118 个 catch**,其中 **51 处**满足"附近有数据获取调用 + 块体无任何日志"。这正是错题本躺了这么久的机制:**查询 400 → catch 吞掉 → 渲染空态 → 看起来像正常**。

清单在 `scripts/vocab/audit/silent2.mjs` 的输出里,高风险的几处:

| 位置 | 代码 | 风险 |
| --- | --- | --- |
| `data.ts:285` | `listMasteryRows().catch(() => [])` | 掌握度取不到 → 全站显示"一个词都没学" |
| `earTraining.ts:120` | 同上 | 磨耳朵"未学优先"退化成原序,用户无感 |
| `VocabQuiz.tsx:56` / `VocabSpell.tsx:70` | `getWordStatusMap().catch(() => ({}))` | 挑词口径失效,全变"新词" |
| `MyDataPanel.tsx:64` | `catch { setStats(null); setDays([]) }` | 数据面板静默变空 |
| `Incentive.tsx:33/90` | `.catch(() => setRows([]))` | 最难的词/周报静默消失 |
| `VocabGrowth.tsx:41` | `.catch(() => ...)` | 成长图静默空白 |
| `VocabToday.tsx:69/125/126` | `catch {}` / `.catch(() => 0)` | 今日任务算错或结算数字为 0,无从察觉 |

**建议修法**:按 Aaron 2026-08-09 立的规矩,凡 catch 不得只 setState 不打日志。统一加
`console.log("[模块] ✗ 失败", {code, message, details, hint})`(PostgREST)或错误栈(JS)。
可先做上表 7 处高风险,其余按批推进。

**其余 67 处**多为 `localStorage`(隐私模式)、`audio.pause()`(元素已回收)、`matchMedia` 这类良性兜底,不改也不会藏 bug —— 但按新规矩仍应补一行日志或写明"故意忽略"的注释。

### 关于 loading 永不解除的路径

本轮**未发现**新的此类问题。已知的两个都已修复:
- `StatsPanel` 的 IntersectionObserver 因骨架屏提前 return 而 `shown` 永远 false(已修,进度条曾全停在 3px)
- `MyDataPanel` 未登录停在骨架屏(已修,改为整块不渲染)

### 关于 `readSelectedBank()` 为空

所有调用点都是 `readSelectedBank() || "toefl"` 三级回落,`pickInitialBank` 另有 6 条测试守回落链。**未发现**为空会导致异常的路径。

---

## 三、内容质量扫描

### ⚪ 冠词错配:机器报 5 处,**人工核实全部是误报**

| 命中 | 判定 |
| --- | --- |
| `a usable` /ˈjuːzəbl/ | ✓ 正确 |
| `a urinary` /ˈjʊrəneri/ | ✓ 正确 |
| `a unanimous` ×2 /juːˈnænɪməs/ | ✓ 正确 |
| `an homage` | ✓ 可接受(美音 /ˈɑːmɪdʒ/ 与 /hoʊˈmɑːʒ/ 两种读法通行) |

**真错配 0 处** —— 2026-08-09 的 `scene_article_fix.sql` 跑完后全库干净。

⚠️ **本闸的局限要记下来**:它按"首字母是不是元音"判,例外表只覆盖了 `uni/use/usu/eu/one...`,
凡 `u` 读 /juː/ 的词都会误报。要降低误报得接音标数据(`vocab_words.ipa` 有,但例句里的任意词没有)。
按"分不清就别硬判",**建议保留误报而不是放宽判据** —— 漏报比误报危险。

### ⚪ 英式表达残留:**0 处**

扫了 18 个词(flat/queue/neighbour/colour/organise/whilst/CV/past papers/sit the exam/green channel/favourite/realise/centre/lorry/petrol/autumn/mobile phone/rubbish),跨 10 个字段,零命中。

### 🟡 [内容] 重复内容 38 组 — 严重度:内容瑕疵

| 表 | 重复组数 | 例 |
| --- | --- | --- |
| `vocab_words.def_en` | 8 | "A period of one thousand years." ×2 |
| `vocab_collocations.collocation` | 21 | "regional cooperation" ×2 |
| `vocab_scene_items.text_en` | 9 | "feedback" ×2 / "work-life balance" ×2 |

**根因**:未查明是生成时去重不足,还是同一说法确实属于不同词/不同场景(后者可能是合理的)。
**建议**:`def_en` 重复最可疑(两个不同的词有一模一样的英文释义,多半有一个是错的),优先人工看这 8 组;
搭配与场景节点的重复需要看是否跨词/跨场景,跨了就不算问题。

### ⚪ 占位/空白:**0 处**

未发现 `TODO` / `待补充` / 纯标点的字段。

### ✅ 音频链路抽样:22/22 正常

跨 5 张表抽样 22 条 `audio_url`,全部可取且 `content-length > 0`。

### 🟡 [内容] 文本改过但音频已置 NULL 的行 — 严重度:内容瑕疵(已知)

| 表 | 待重烧 |
| --- | --- |
| `vocab_cn_renditions.audio_url` | 13 |
| `vocab_cn_renditions.example_audio_url` | 3 |
| `vocab_scene_items.audio_url` | 1 |
| `vocab_scene_packs.essay_short/full_audio_url` | 各 1 |

合计 **19 条**。全部是我在内容修订时主动置 NULL 的(改英文就作废旧音频,否则"显示新句播旧音")。
Aaron 已定:攒着,等下次有别的音频要烧时一起。**前端表现是那几处没有喇叭,不是坏。**

---

## 四、数据完整性核对

| 表 | 行数 |
| --- | --- |
| `vocab_words` | 4,471 |
| `vocab_examples` | 13,410 |
| `vocab_collocations` | 22,065 |
| `vocab_chunks` | 150 |
| `vocab_confusion_groups` / `members` | 429 / 978 |
| `vocab_cn_expressions` / `renditions` | 51 / 133 |
| `vocab_scene_packs` / `items` | 30 / 262 |
| `vocab_word_banks` | 4,470 |
| `vocab_dictionary` | **0**(Aaron 已定:保留不删,标注"待定,当前不使用") |

### 🟡 [内容] `vocab_banks.total_words` 与实际挂载数不符 — 严重度:内容瑕疵

| code | 声称 | 实际 | 差 |
| --- | --- | --- | --- |
| **toefl** | 4,473 | **4,470** | **−3** |
| zhongkao | 1,600 | 0 | −1,600 |
| gaokao | 3,500 | 0 | −3,500 |
| cet4 | 4,500 | 0 | −4,500 |
| cet6 / kaoyan | 5,500 | 0 | −5,500 |
| ielts | 8,000 | 0 | −8,000 |
| ket_pet | 3,500 | 0 | −3,500 |
| gmat | 3,000 | 0 | −3,000 |
| gre / nce | 0 | 0 | 0 |

**未上线的 8 个库差额是预期的**(元数据先写、词还没灌)。
**toefl 差 3 是真问题**:`total_words=4473` 但只挂了 4,470 个词。
**根因**:未查明。`vocab_words` 有 4,471 行、`vocab_word_banks` 有 4,470 行 → 有 1 个词没挂进任何库;
另有 1 个词 `def_zh` 为空(见下)。三者关系需要人工对一次。
**影响**:词库页显示的分母、进度百分比、快筛的池子大小都会差 3(约 0.07%),用户几乎不可能察觉。

### 🟡 [内容] 1 个词缺 `def_zh` — 严重度:内容瑕疵

`vocab_words` 里有 **1 行** `def_zh IS NULL`。
**影响**:`listBankWords` 有 `.not("def_zh","is",null)` 过滤,所以它**根本不会出现在任何页面**——
这也解释了"4,471 行 vs 4,470 挂载"里的那 1 个差额。属于静默排除,不影响用户,但数字对不上。

---

## 五、未查明的问题(不用推测填充)

1. `functions/v1/translate` 的 CORS 失败根因(需看 edge 的响应头;改它是禁区)
2. Playwright 注入 Supabase 会话为何不生效
3. 38 组重复内容是生成缺陷还是合理共用
4. `toefl.total_words=4473` 这个数最初从哪来

---

## 六、我们的验收流程漏在哪

错题本能躺这么久,不是因为它难发现,而是**没有任何一个环节会去看它**。

### 漏洞一:两边都只验"自己碰到的那块"

Aaron 验的是他刚提的需求;我验的是我刚改的文件。错题本既不在任何一次需求里,也不在任何一次改动里,于是**从来没有人打开过它**。

> **改法**:每个 PR 合并前跑一次全路径冒烟(本次的 `scripts/vocab/audit/e2e.mjs` 就是),
> 14 条路径 2 分钟跑完,只判"能不能开 / 有没有 4xx / 有没有失败文案"。
> 它抓不到细节,但**能抓到"整页打不开"这一类**——错题本正是这一类。

### 漏洞二:静默 catch 让"坏"长得像"空"

错题本查询 400,catch 吞掉后 `list=[]`,页面渲染"错题本是空的"——**和真的没错题一模一样**。
对错题为 0 的人(包括我建的每一个测试账号)它永远是对的。

> **改法**:已由 Aaron 立为硬性规矩 —— 任何 catch 不得只 setState 不打日志。
> 更根本的是:**空态和失败态必须在 UI 上可区分**,不能都渲染成"空"。

### 漏洞三:测试账号是干净的,而真实用户是脏的

我历次建的测试账号都没有错题、没有掌握度、没有收藏,于是**只走得到空态分支**。
这次也是:E2E 跑出来 14 个 ✓,但那是一个零数据账号看到的世界。

> **改法**:体检用的测试账号要**先造数据再验**——错题、掌握度、收藏、跨天的复习各造几条。
> 本轮第一节的局限(未登录态)也属于这一类。

### 漏洞四:"我改的地方门全绿"被当成了"这个板块是好的"

tsc / check:undef / vitest 全绿只说明**我这次改的代码**没有明显错误,
对"三个月前写的某个页面还能不能打开"一无所知。

> **改法**:把"门全绿"和"板块可用"在汇报里分开说,不要让前者暗示后者。

---

## 附:本次体检脚本(可重复运行)

```
scripts/vocab/audit/counts.mjs        第四节 数据完整性
scripts/vocab/audit/content.mjs       第三节 内容质量(冠词/英式/占位/重复)
scripts/vocab/audit/silent.mjs        第二节 全部 catch
scripts/vocab/audit/silent2.mjs       第二节 只挑吞掉数据查询错误的
scripts/vocab/audit/e2e.mjs           第一节 14 条路径端到端
scripts/vocab/audit/audio-sample.mjs  第三节⑥ 音频抽样
```

⚠️ 跑 `e2e.mjs` 需要 `BASE=<preview>` 与 `VBP=<vercel bypass token>` 两个环境变量。
