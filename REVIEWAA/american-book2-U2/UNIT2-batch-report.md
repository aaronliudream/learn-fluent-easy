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
| L14 | Do you speak English? | 过去完成时 | 18 | 6 | 4 | 3 | 3 | 10 | 44 | 3 | 🟢 |
| L15 | Good news | 间接引语(主)+宾语从句/过去将来时(辅讲深) | 18 | 6 | 4 | 3 | 3 | 10 | 44 | 3 | 🟢 |
| L16 | A polite request | if 条件句(主)+主谓一致(辅) | 18 | 6 | 4 | 3 | 3 | 10 | 44 | 3 | 🟢 |
| **合计** | **8 课** | | **144** | **48** | **32** | **24** | **24** | **80** | **352** | **24** | **8×🟢** |

- 解释:每课 44 条,共 **352 条**,全覆盖(机器校验)。
- 关6 卡:每课 6(3 美英对照 + 3 语块),共 **48 张**。

## 二、落库对账证据(SQLAA/american_am2_seed_unit02.sql 当次实测)

```
INSERT INTO public.american_questions        352   (= 8 课 × 44 ✓)
INSERT INTO public.american_lessons            8
INSERT INTO public.american_amencontrast      48   (= 8 × 6 关6 ✓)
INSERT INTO public.american_grammar_points    64   (= 8 × 8 gp ✓)
INSERT INTO public.american_sentences         88   (= 8 × 11 ✓)
INSERT INTO public.american_words             88   (= 8 × 11 ✓)
```
声明(352)= JSON(352)= SQL(352),三口径一致。每课 validate-am2-lesson 八项全绿(首轮),回执见 `REVIEWAA/american-book2-U2/coverage-lesson09..16.md`。

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
| 5 | **反身代词**(himself/themselves) | L15 发现(同步 L14 章 + 教材 L14"he was English himself") | ⚠️ **未覆盖**(L14 只做过去完成时,漏了此点) | **需主动处置**:见下方"反身代词专项" |
| 6 | 主谓一致**深度**(the+adj 作主语、politics is/glasses are/ten years is、数词单用) | L16(同步) | ✅ 集合名词+就近/就前基础已在 L16 辅考 | 延后 Book2 后续主谓一致语境课 |

### ⚠️ 反身代词专项(唯一"基础知识点未覆盖"的挂账 → 主动处置方案)

- **性质**:同步 L14 章有"四、反身代词",教材 L14 课文"he was English **himself**"实际出现(=①类,本应在 L14 作辅考);L14 生产时聚焦过去完成时,**遗漏该点**。这是本单元唯一的真实覆盖缺口(其余 5 项均为进阶细则,基础已覆盖)。
- **CC 处置(自决,报 Aaron 复核)**:反身代词(myself/yourself/himself…)在 Book2 后续课文中高频复现,**承诺在 U3 第一课含反身代词语境处作辅考补足**(3 题:形式/作宾语/强调用法),对齐"跨课账兑现"机制(如 L13 兑现 L12 将来进行、L14 兑现 L7/L9 过去完成)。若 Aaron 认为应即刻单开补充,可指示。
- **不构成阻塞**:base 知识点缺口已登记 + 有明确兑现计划,不影响 U2 落库。

## 六、待裁决汇总(单元2;均已按推荐默认自决,报 Aaron 复核)

1. **教材/同步主题分歧 3 例**(L10 被动 vs 所有格 / L11 Review vs 宾补+连词 / L16 if条件 vs 主谓一致)→ 全部按 [[am2-source-divergence-rule]] 自决(A+覆盖补丁):教材 Key structures 定主考,同步岔题①类作辅考、②类挂账。**首次三连执行,请 Aaron 复核裁决落地质量**(建议抽验 L11/L16 时一并看)。
2. **同主题讲深 2 例**(L12 一般将来时+同步将来表达深料 / L15 间接引语+同步宾语从句/过去将来时)→ 取常用讲深并入,进阶挂账。
3. **跨课账兑现 2 例**(L13 兑现 L12 将来进行 / L14 兑现 L7·L9 过去完成)→ 覆盖铁律正常运转。
4. **词表补足**:各课官方词不足 11 时按体量补至 11(采纳 A),补词均来自课文/主题,美语化词入关6对照。

## 七、待办(Aaron)

- [ ] service role 批次跑 `SQLAA/american_am2_seed_unit02.sql`(前后 COUNT 对账,期望 +352 题)
- [ ] 真机抽验 L11 + L16(重点验分歧裁决落地)
- [ ] prewarm 单元2 听力音频(US/alloy/1.0;每课关8×3+关10听力2=5,共 40 条)
- [ ] 复核反身代词处置方案(承诺 U3 兑现 vs 即刻单开补充)
- [ ] 复核 3 例主题分歧的裁决落地质量(A+覆盖补丁是否妥当)

## 八、单元3(L17–L24)预告

- L17 起继续自主流水线;U3 第一课含反身代词语境处**兑现反身代词挂账**(辅考补足)。
- 继续按分歧规则自决,升级情形(源冲突无法自决/PDF 缺页/数字不对/schema 改动)才停报。
