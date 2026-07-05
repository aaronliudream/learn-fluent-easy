# AM2 单元2(Lessons 9–16)批次汇报

> 自主生产(授权 2026-07-04):CC 走 10 步流水线,机器校验+双角色自审,交付单元批次。**数字均为 gen-book2-seed / validate-am2-lesson 当次实测**(见文末对账证据),非估算。

## 一、分关计数终值总表(单一口径,加和=总数)

| 课 | 标题 | 主考 | 关5 | 关6 | 关7 | 关8 | 关9 | 关10 | 合计 | 认知题 | 校验八项 |
|---|------|------|----|----|----|----|----|----|----|----|----|
| L9 | A cold welcome | 时间介词 at/in/on | 18 | 6 | 4 | 3 | 3 | 10 | 44 | 3 | 🟢 |
| L10 | Not for jazz | 被动语态(主)+名词所有格(辅) | 18 | 6 | 4 | 3 | 3 | 10 | 44 | 3 | 🟢 |
| L11 | One good turn deserves another | 时态语态综合复习(主)+连词/宾补(辅) | 18 | 6 | 4 | 3 | 3 | 10 | 44 | 3 | 🟢 |
| L12 | Goodbye and good luck | 一般将来时(主)+be going to(辅讲深) | 18 | 6 | 4 | 3 | 3 | 10 | 44 | 3 | 🟢 |
| L13 | The Greenwood Boys | 将来进行时 | 18 | 6 | 4 | 3 | 3 | 10 | 44 | 3 | 🟢 |
| L14 | Do you speak English? | 过去完成时 + 反身代词(辅) | **21** | 6 | 4 | 3 | 3 | 10 | **47** | 3 | 🟢 |
| L15 | Good news | 间接引语(主)+宾语从句/过去将来时(辅讲深) | 18 | 6 | 4 | 3 | 3 | 10 | 44 | 3 | 🟢 |
| L16 | A polite request | if 条件句(主)+主谓一致(辅) | 18 | 6 | 4 | 3 | 3 | 10 | 44 | 3 | 🟢 |
| **合计** | **8 课** | | **147** | **48** | **32** | **24** | **24** | **80** | **355** | **24** | **8×🟢** |

> **修订(Aaron 反馈,跑 SQL 前)**:反身代词就地补回 L14（+3 题辅考:形式/作宾语/强调,课文 himself），L14=**47 题**,单元总 **355 题**。不推 U3。

- 解释:L14=47 条、其余每课 44 条,共 **355 条**,全覆盖(机器校验)。
- 关6 卡:每课 6(3 美英对照 + 3 语块),共 **48 张**。

## 二、落库对账证据(SQLAA/american_am2_seed_unit02.sql 当次实测)

```
INSERT INTO public.american_questions        355   (= 7 课 × 44 + L14 × 47 ✓)
INSERT INTO public.american_lessons            8
INSERT INTO public.american_amencontrast      48   (= 8 × 6 关6 ✓)
INSERT INTO public.american_grammar_points    65   (= 7 × 8 + L14 × 9 gp ✓)
INSERT INTO public.american_sentences         88   (= 8 × 11 ✓)
INSERT INTO public.american_words             88   (= 8 × 11 ✓)
```
声明(355)= JSON(355)= SQL(355),三口径一致。每课 validate-am2-lesson 八项全绿(L14 补题后 47=47 复验全绿),回执见 `REVIEWAA/american-book2-U2/coverage-lesson09..16.md`。
> 注:gp 数非均一(L14=9,其余=8)——已按 Aaron 反馈,gp 数随考点自然落,不再凑格子。

## 三、SQL 文件(待 Aaron service role 批次跑)

- **`SQLAA/american_am2_seed_unit02.sql`**(单文件,幂等 ON CONFLICT,含 L9–L16 全部 352 题 + 课文/词表/关6/考点)。
- ⚠️ SQL 只 Aaron 跑(红线①);跑前后建议各 `SELECT count(*) FROM american_questions WHERE unit_no=2`(期望增量 352)。

## 四、指定真机抽验 2 课(红线②,附直达)

> 建议抽验**分歧处理最复杂的两课**,重点验分歧裁决落地质量:

1. **L11《One good turn deserves another》** — 教材=Review KS2-10 综合复习 vs 同步=宾补+连词(分歧第二例);验时态辨析主考 + 连词/宾补辅考是否清楚、无串味。`docs/american/book2/am2_l11.json`
2. **L16《A polite request》** — 教材=if 条件句 vs 同步=主谓一致(分歧第三例);验 if 条件主考(从句用现在时易错点)+ 主谓一致辅考(police 复数)。`docs/american/book2/am2_l16.json`

## 五、⚠️ 挂账逐条处置(裁决铁律:单元末必须核对清零/明确处置)

| # | 挂账项 | 来源 | 基础知识点是否已覆盖 | 处置 |
|---|--------|------|----|----|
| 1 | 名词所有格**深度**(无生命属格 today's paper/two pounds' weight、of 属格进阶) | L10(同步) | ✅ 所有格基础('s/of/双重)已在 L10 辅考 | 延后 Book2 后续含所有格语境课(理由:基础已覆盖,仅进阶细则延后,不构成知识点遗漏) |
| 2 | 宾补**深度**(let/make/have+sb+do 省 to、被动加 to、had better) | L11(同步) | ✅ ask/want/tell sb to do 基础已在 L11 辅考 | 延后 Book2 后续非谓语/使役动词语境课 |
| 3 | 连词**深度**(连接性副词 however/therefore、and·or 表条件) | L11(同步) | ✅ and/but/for/so 基础已在 L11 辅考 | 延后 Book2 后续复合句/连词语境课 |
| 4 | be to / be about to(将来表达进阶) | L12(同步) | ✅ 一般将来时+be going to 已覆盖;将来进行时已在 L13 主考 | 延后 Book2 后续将来时加深课 |
| 5 | ~~反身代词~~ | L15 发现 | ✅ **已就地补回 L14**(+3 题辅考:形式 himself/作宾语 help themselves/强调 English himself) | **✅ 清零**(Aaron 反馈:教材就在 L14 教,不推 U3;seed 未跑,就地改 L14→47 题) |
| 6 | 主谓一致**深度**(the+adj 作主语、politics is/glasses are/ten years is、数词单用) | L16(同步) | ✅ 集合名词+就近/就前基础已在 L16 辅考 | 延后 Book2 后续主谓一致语境课 |

### ✅ 反身代词已就地闭环(Aaron 反馈采纳)

- **原判失误**:我把它当"跨课账"处理(承诺 U3 兑现),但性质不同——L12/L7 那些是"教材还没教到";反身代词是**教材就在 L14 教(himself 在课文里)、我漏了**。推 U3 会让学生在 L14 读到 himself 却没学它。
- **就地修**(seed 未跑,零成本):直接在 am2_l14.json 补 3 题反身代词辅考(gp9)+ 解释,重生成 seed,L14=**47 题**,复验 47=47 八项全绿。**不推 U3**。
- 教训写入 [[am2-source-divergence-rule]]:①类岔题(课文实际出现)必须**当课**辅考,不得跨课延后;跨课兑现只适用于"教材尚未教到"的排除项。

## 六、待裁决汇总(单元2;均已按推荐默认自决,报 Aaron 复核)

1. **教材/同步主题分歧 3 例**(L10 被动 vs 所有格 / L11 Review vs 宾补+连词 / L16 if条件 vs 主谓一致)→ 全部按 [[am2-source-divergence-rule]] 自决(A+覆盖补丁):教材 Key structures 定主考,同步岔题①类作辅考、②类挂账。**首次三连执行,请 Aaron 复核裁决落地质量**(建议抽验 L11/L16 时一并看)。
2. **同主题讲深 2 例**(L12 一般将来时+同步将来表达深料 / L15 间接引语+同步宾语从句/过去将来时)→ 取常用讲深并入,进阶挂账。
3. **跨课账兑现 2 例**(L13 兑现 L12 将来进行 / L14 兑现 L7·L9 过去完成)→ 覆盖铁律正常运转。
4. **词表规则(Aaron 定死,写入默认裁决表)**:~~官方词不足 11 补至 11~~ 这条"uniform 11"是我自设、越权,且藏反向风险(后段课官方 12–15 词若按 11 截断=违反零遗漏铁律)。**正确规则:官方词表是下限、零遗漏、无上限;不足 11 可补足(追认),超过 11 必须全收,uniform 11 不是目标。** U2 各课官方词均 ≤11,补足无遗漏;后段课凡官方 >11 一律全收。
5. **均一化自查(Aaron 盯)**:U2 出现 7 课齐刷 18/6/4/3/3/10、gp 8×8——是我先有模板再填考点(validator 实为全动态:只查 JSON=SQL + 每 gp≥1 题,不硬编码 8/18/44)。**已确认:8 gp 非 schema 约束。下个单元起考点天然几个就几个(6 就 6、10 就 10),不为凑格子撑或压。** L14 补反身代词后已 9 gp/47 题,率先破均一。

## 七、待办(Aaron)

- [ ] service role 批次跑 `SQLAA/american_am2_seed_unit02.sql`(前后 COUNT 对账,**期望 +355 题**;L14=47 其余=44)
- [ ] 真机抽验 L11 + L16(重点验分歧裁决落地)+ 顺带看 L14 反身代词 3 新题
- [ ] prewarm 单元2 听力音频(US/alloy/1.0;每课关8×3+关10听力2=5,共 40 条)
- [ ] 复核 3 例主题分歧的裁决落地质量(A+覆盖补丁是否妥当)

## 八、单元3(L17–L24)预告

- L17 起继续自主流水线。**反身代词已在 L14 就地闭环,U3 无遗留兑现。**
- 两条新铁律生效(词表下限无上限 / gp 数随考点不均一化,见六.4/六.5),已写入 [[am2-source-divergence-rule]] / 生产 memory。
- 继续按分歧规则自决,升级情形(源冲突无法自决/PDF 缺页/数字不对/schema 改动)才停报。
