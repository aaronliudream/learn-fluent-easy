# 答案泄漏修复报告(P0)· am2 全库 + am1 全库

日期:2026-07-04 · 分支 feat-american-course
触发:am2_l14 关5 #14 题干把标答 `had hoped` 直接印在提示里(定稿 md 的 "(提示 → 答案)" 格式渗进了 payload.stem)。

## 一、机器校验第 9 项「答案泄漏扫描」已上线

`scripts/american/validate-am2-lesson.mjs` 由八项升为九项;规则:

- **a(红)** 任何 stem/context 含 `→`/`->`(内部标注符,禁出现在面向学生字段)。
- **b(红)** 选择/完形题:中文括号提示内直给"正确选项完整字符串"(英文用词边界防子串误杀,如 `in`⊄`morning`;中文用子串)。
- **c(黄·人工判)** 英文题干主体(括号外)含正确选项作为独立词 → 人工核(多为合法复现,如 `ones`/`there`/gp 名)。

同款逻辑另有独立全量扫描器 `scripts/american/scan-answer-leak.mjs`(一条命令扫 am2 全 JSON + am1 全 SQL payload)。

## 二、泄漏清单(课/关/seq/原文 → 改后)

### am2 第一册单元01(L1–L8,上一轮已修 6 处)
| 课 | 关#seq | 原文提示 | 改后 |
|---|---|---|---|
| l01 | s5 | (判别法:…→ him is captain ✓) | (判别法:…如 him is captain) |
| l03 | s10#3 | (read 的过去式) | (yesterday,这个动词的过去式拼写不变) |
| l04 | s5#1 | (主语 I,填 have 还是 has) | (主语是 I,现在完成时的助动词用哪个) |
| l05 | s5#17 | (距离多远,与 away 义近) | (表示"离这儿有多远") |
| l06 | s5#1 | (填 a 还是 an;hour 的 h 不发音) | (hour 的 h 不发音,以元音开头) |
| l08 | s9#3 | (good→better) | (用比较级) |

### am2 第二册单元02(L11–L16,本轮修复)
**箭头类(a)**:L11 共 10 处、L12 6 处、L13 5 处、L14 8 处、L15 3 处的题干把 " → " 改为逗号(右侧是时态名/结构名,非选项,仅去箭头)。

**直给答案类(b,删英文答案词,只留纯语义中文提示)**:
| 课 | 关#seq | 原文提示 | 改后 |
|---|---|---|---|
| l12 | s5#13 | (打算 → be going to) | (打算、计划好要做) |
| l12 | s5#14 | (有迹象 → be going to) | (有迹象、马上要发生) |
| l12 | s9#2 | (计划好 → be going to) | (计划好要做的事) |
| l12 | s9#3 | (提议 → Shall we) | (提议一起做某事) |
| l12 | s9(grammar) | (有迹象 → be going to) | (有迹象、马上要发生) |
| l12 | s10 gp8 | (提议,用 shall) | (提议一起做,注意人称和语序) |
| l14 | s5#13 | (本打算…但没成 → had planned) | (本打算…但没成) |
| l14 | s5#14 | (原本希望…但落空 → had hoped)【**现场那题**】 | (原本希望…但落空) |
| l14 | s9#3 | (本打算但没成 → had planned) | (本打算但没成) |
| l15 | s5 gp4 | 改成间接引语(broke→had broken) | (broke 往过去退一步) |
| l15 | s5 gp4 | 改成间接引语(have finished→had finished) | (have done 往过去退) |
| l15 | s5 gp7 | 转述(can→could,you→I) | (时态和人称都要变) |
| l15 | s9 | (will→would,tell 接人) | (时态后移,tell 后面接人) |
| l15 | s9 | (转述一般疑问句 → ask if + 陈述语序) | (转述一般疑问句,注意语序) |
| l15 | s10 | (转述过去,is→?) | (转述过去,is 要变成什么) |
| l15 | s10 | (have finished→?) | (have finished 要变成什么) |
| l16 | s5 gp6 | (后半句用 will 结尾) | (条件成立,主句表将来) |
| l16 | s10#3 | (work,if 那半句用现在时) | (if 那半句用一般现在时,不用将来时) |

### am1 第一册全库(SQL payload,箭头 a + 直给 b)
| 文件(课) | 类型 | 原文 | 改后 |
|---|---|---|---|
| expand_unit01(l01)×2 | a | （变一般疑问句，my→your） | （…，my 变 your） |
| expand_unit01(l04) | a | （变一般疑问句，he→you） | （…，he 变 you） |
| expand_unit02(l09) | a | （变一般疑问句，they→you） | （…，they 变 you） |
| expand_unit02(l10) | a | （变一般疑问句，we→you） | （…，we 变 you） |
| expand_unit03(l14)×2 | a | （变…，some→any） | （…，some 变 any） |
| expand_unit09(l49) | a | my → mine，your → ___ | my 对应 mine，那么 your 对应 ___ |
| expand_unit09(l54) | a | cheap → 比较级 | cheap 变比较级 |
| expand_unit10(l55) | a | comfortable → 比较级 | comfortable 变比较级 |
| expand_unit10(l56)×2 | a | big/small → 最高级 | big/small 变最高级 |
| expand_unit11(l66) | **b** | She ___ come too.（可能，用 may） | （表示可能性） |
| expand_unit12(l67)×2 | a | （He 转述，…注意 is→was） | （…注意时态后移） |

> am1 是已上线数据,按 P0 约定靠幂等 seed 重跑覆盖:Aaron 需重跑受影响的 `american_expand_unit0{1,2,3,9},unit1{0,1,2}.sql`。

### 保留不动(判为教学正当,非泄漏)
- 选项内的紧凑箭头(如 `am→was`、`buy → bought`)= 正确答案在展示"转换规则本身",保留。
- `grammar_focus`(纯元数据,不面向学生)、`grammar_card` 教学卡例句(`'I am busy.' → He said…`)、gp 名称里的箭头 = 教学记法,非题干,规则 a 范围外,保留。

## 三、11 条 YELLOW(c)人工核结论:全部合法,无需改
`has`(l05 完形上下文里的 `hasn't`)、`a`(l06 单字母)、`and`(l11 自然句里二次出现)、am1 的 `one/ones/there/must/hit/the/was` 均为 gp 讲解正当复现或上下文自然出现,不构成"仅凭提示即可选对"。

## 四、九项校验 + 全量扫描结果

- **单课九项**:am2_l01–l16 **16/16 🟢 全绿**(计数对账/解释全覆盖/SQL带解释/选项无重复/串味/禁字母/G/W/**答案泄漏**)。
- **全量泄漏扫描**:`scan-answer-leak.mjs` → **RED 0**,YELLOW 11(已人工核为合法)。
- **计数**:unit01 = 356 题(l01=48 + 7×44),unit02 = 355 题(l14=47 + 7×44)。

## 五、附带修复(重要,请知悉)

修 P0 时发现 `gen-book2-seed.mjs` 的 loadExp 正则 `ans:.+?\n` **在 CRLF 文件上失配**(JS 的 `.` 不匹配 `\r`)。`am2_l01_explanations_final.md` 恰为 CRLF,导致 **l01 的 48 条逐题解释从未进过 seed(线上 DB 的 l01 也一直没有解释)**。已把正则改为 `ans:.+?\r?\n`(对所有课兼容 CRLF/LF)。重跑后 l01 解释已回填 48/48。

→ Aaron 重跑 unit01 seed 时,l01 的逐题解释会一并补进线上库(顺带补齐历史缺口)。

## 六、语域注回扫(与泄漏修复合并进同一次 seed 重跑)

新规范固化:`scripts/american/specs/register_spec.md`(三条硬规则 + 分化点清单)。am2 L1–16 命中 3 处,均已修:

| 课/题 | 分化点 | 处置 |
|---|---|---|
| **L12 shall(G8+卡+focus)** | shall 表将来=英式/古旧,美语用 will;仅 Shall we…?/Shall I…? 提议活着 | 语法卡/gp名/grammar_focus 全改口径;认知题「shall 常用哪个人称」→「shall 现代美语主要做什么」(答:提建议 Shall we…?);Shall we…? 提议题保留;解释加语感注 |
| **L14 #15** `It was the third time that I ___ him` | had done(规范) vs 裸过去 did(口语常用) | 题干锚定 `(正式/书面:此句式规范用过去完成)`;裸过去 `met` 移出干扰项(换 `meeting` 非谓语病句);解释加语感注(口语 "I met him" 也对) |
| **L15 时态后移** | said she was coming(规范) vs said she's coming(所述仍真) | 教规范退步不变;解释加语感注(所述现仍成立时口语可不退) |

其余分化点(If I were / who-whom / fewer-less / May I 独立成题)**am2 L1–16 未命中**;L15 课文里的 "may I say something?" 是 NCE2 原文、正式办公场景,语域得当,非题目,不动。

**校验**:L1–16 九项(含第9泄漏)**16/16 🟢**;`validate-am2-all.mjs`(新增,对 seed 内全部课跑,防只验新课漏老课)全绿;泄漏全扫 RED 0。

## 七、CRLF 静默失效 —— 补两块板子

修根(正则 `\r?\n`)之外,按你要求加防线:
- **① seed 生成器逐课断言合并数**:`gen-book2-seed` 现逐课打印 `l01: merged 48`;凡存在 `*_explanations_final.md` 却合并 0 条 → **生成即红灯 exit(1)**,不产出无解释 seed(堵住 ON CONFLICT 整包覆盖抹解释的 footgun)。
- **② 全量校验器**:新增 `validate-am2-all.mjs`,九项对 seed 内**全部课**跑(可选单元过滤),不再只验当轮新课——L1 的 0/48 换这个当场就炸。

## 八、Aaron 待跑 SQL(幂等,前后 COUNT)
- `SQLAA/american_am2_seed_unit01.sql`(356 题,含 l01 新回填解释)
- `SQLAA/american_am2_seed_unit02.sql`(355 题)
- am1 受影响:`american_expand_unit01/02/03/09/10/11/12.sql`
