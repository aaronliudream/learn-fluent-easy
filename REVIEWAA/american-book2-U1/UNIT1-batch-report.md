# AM2 第二册 · 单元1(L1–L8)批次汇报

> 自主生产(授权 2026-07-04)· 交付批次=单元 · 本报告为 Aaron 单元验收入口
> 生产者:CC(10 步流水线 + 机器校验八项 + 双角色自审)· 全部数字为生成器/校验器当次实测

---

## 一、计数总表(分关终值,单一口径,加和=总数)

| 课 | 标题 | 语法主线 | 关5 | 关6 | 关7 | 关8 | 关9 | 关10 | 合计 | 认知 | 校验 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| L1 | A Private Conversation | 五种基本句型·语序·疑问否定 | 22 | 6 | 4 | 3 | 3 | 10 | **48** | — | 🟢上线 |
| L2 | Breakfast or lunch? | 现在进行时 vs 一般现在时 | 18 | 6 | 4 | 3 | 3 | 10 | **44** | 3 | 🟢八项 |
| L3 | Please send me a card | 一般过去时 | 18 | 6 | 4 | 3 | 3 | 10 | **44** | 2 | 🟢八项 |
| L4 | An exciting trip | 现在完成时 | 18 | 6 | 4 | 3 | 3 | 10 | **44** | 3 | 🟢八项 |
| L5 | No wrong numbers | 现在完成时·续 | 18 | 6 | 4 | 3 | 3 | 10 | **44** | 3 | 🟢八项 |
| L6 | Percy Buttons | 冠词 a/an/some/the | 18 | 6 | 4 | 3 | 3 | 10 | **44** | 3 | 🟢八项 |
| L7 | Too late | 过去进行时 | 18 | 6 | 4 | 3 | 3 | 10 | **44** | 3 | 🟢八项 |
| L8 | The best and the worst | 比较级和最高级 | 18 | 6 | 4 | 3 | 3 | 10 | **44** | 3 | 🟢八项 |
| — | **单元合计** | — | 148 | 48 | 32 | 24 | 24 | 80 | **356** | — | — |

- **总题数 356**(L1=48 + L2–L8=44×7=308),与 `SQLAA/american_am2_seed_unit01.sql` 的 356 条 american_questions INSERT **完全一致**(实测 `grep -c` = 356)。
- 每课另含:关1 逐句 11–12 句 + 前置听力题 1 · 关2–4 词汇 11–12 词 · 关6 卡 6(3语块+3美英对照)· grammar_card 1(L2–L8 每课一张)。
- 语法主线闭合:**句型基础(L1)→ 时态四连(现在进行 L2 / 一般过去 L3 / 现在完成 L4-5 / 过去进行 L7)→ 冠词(L6)→ 比较级(L8)**,循序递进无跳档。

## 二、SQL 分片清单(只 Aaron service role 跑)

| 文件 | 内容 | 幂等 | 状态 |
|---|---|---|---|
| `SQLAA/american_am2_seed_unit01.sql` | 单元1(L1–L8)全量 seed:lessons/sentences/words/grammar_points/amencontrast/questions | 全 ON CONFLICT | Aaron 已跑到 L6;**L7+L8 待再跑一次该文件补上**(幂等,重跑不重复) |

- 依赖(此前已跑):`american_add_book_no.sql`(book_no 列)、`american_add_grammar_card.sql`(grammar_card 列)。
- ⚠️ **prewarm 音频待跑**:关8 播 sentences + 关10 passage,US/alloy/1.0;脚本 `scripts/american/prewarm-book2.mjs`。建议 Aaron 单元首课(L1 或抽验课)听一次出声确认音质。

## 三、指定真机抽验 2 课(代表两类语法)

> 每单元抽验 2 课(不变项②)。选覆盖面最广、干扰项设计最密的两课:

1. **L4《An exciting trip》· 现在完成时** — 新时态引入课,grammar_card + 认知题 3 + gone/been 陷阱 + a·an 无关的纯时态盘。验:关5 语法卡先教是否顺、认知题是否好懂、关6 gotten/center 美语点。
   - 直达:`/american/book/2/hub/1` → L4
2. **L7《Too late》· 过去进行时** — 跨课"还账"落点,过去进行时密集 8 处 + when背景突发 + while双进行 + 否定/疑问全形态。验:背景 vs 突发是否讲清、关8/9 听力情景是否自然、关6 package/gray 美语点。
   - 直达:`/american/book/2/hub/1` → L7

（其余 6 课同一流水线同一模板,机器八项全绿;如抽验两课通过即可代表批次。）

## 四、挂起 / 待裁决清单(均非阻塞,已按推荐默认继续;逐课明细见各 PROGRESS 段)

**A. 无阻塞项**:单元1 无升级/停手项(第五节升级情形均未触发);三源逐页核过,无缺页/错位/主题冲突。

**B. 待裁决(已自决,报你复核;不同意再回调)**:

| # | 课 | 事项 | 默认 |
|---|---|---|---|
| 1 | L2–L8 | 官方词表偏薄(L6/L8 仅 4–5 词)→ 统一补至 11 词对齐 L1 体量 | 采纳 A |
| 2 | L3 | 一般过去时是 L1/L2 两次"留对应课"的落点,已接住(went/got 等复用) | 采纳 |
| 3 | L5 | L4 官方遗漏的独立 since 题 → L5 G4 接住;receive/take 易混非主线不回补 | 采纳 |
| 4 | L6 | 定冠词 the 地理/习语细则(the US / play the piano)→ 留后续冠词加深课 | 采纳 |
| 5 | L7 | 过去完成时(课文 had told)/would → 不在 Key structures 考点,排除留后 | 采纳 |
| 6 | L8 | as…as 同级比较 / much+比较级进阶 / 倍数比较 → 留后续比较加深课 | 采纳 |

**C. 跨课备用素材(扫到但已妥善安置)**:
- 过去进行时 → **已在 L7 落地**(原挂 L3 备用,还账完成)。
- 现在完成进行时(新思维 p122)→ 仍留后续课(超纲,已排除)。
- L4 receive/take 易混、L5 way 短语/spare → 记备用,非时态主线,真机反馈需要再议。

## 五、机器校验八项 · 单元汇总

L2–L8 七课 **每课八项全绿(首轮通过率:L4/L5/L6/L7/L8 首轮全绿;L3 关9seq2 串味首轮抓修后绿;L2 自审抓修 2 处)**。八项 = 计数对账(声明=JSON=SQL)/ 解释全覆盖 / 选项无重复 / 答案位置 LCG 分散 / 串味零术语 / 禁引选项字母 / 听力一致 / G-W 覆盖。每课校验实测见 `coverage-lesson0N.md §一`。

## 六、下一步

1. **Aaron**:①(可选)再跑一次 `american_am2_seed_unit01.sql` 补 L7/L8 入库;② 真机抽验 L4/L7;③ prewarm 音频 + 首课听一次。
2. **CC**:待你抽验反馈;无异议则开工 **单元2(L9–L16)**,继续自主生产流水线。

> 本批次全部产物路径:课设计 `docs/american/book2/`(scan-evidence / grammar-syllabus / 定稿 / am2_l0N.json / _explanations_final.md)· 覆盖报告 `REVIEWAA/american-book2-U1/coverage-lesson0N.md` · 进度 `docs/american/book2/PROGRESS.md` · seed `SQLAA/american_am2_seed_unit01.sql`。
