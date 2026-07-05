# 明早跑单(Aaron 只需按顺序跑这些 SQL)

> CC 全自动生产,每完成一单元追加一行。全部幂等(ON CONFLICT),可重复跑。
> 跑前后建议 `SELECT count(*) FROM american_questions WHERE lesson_id LIKE 'amN_l%';` 对账。
> **依赖**:同一 seed 文件内含 lessons→questions,自带顺序,无跨文件依赖;册与册独立。

## 已跑(Aaron 确认)
- ✅ `american_am2_seed_unit02.sql`(L9–L16 全部 ④⑤⑥,2026-07-05 确认)
- ✅ `american_am2_seed_unit01.sql`(L1–L8 全部 ④⑤⑥,2026-07-05 确认)
- ✅ `american_am1_register_leak_fix.sql`(am1 泄漏+语域 by-qid;**别跑 OBSOLETE_ 开头的 expand,会抹解释**)

## 待跑(按序)

| # | 文件 | 期望 COUNT | 说明 | 依赖 |
|---|---|---|---|---|
| 1 | `american_am2_seed_unit02.sql`(**重跑**) | +0(改题不增) | L16 集合名词修正:family are→family is(方向纠正+美语单数)、as well as 陷阱→and 自然题、if 概念题→运用题。幂等 UPDATE,COUNT 不变 | 无 |

> **⏸ unit03 / unit04(L17–L27)暂缓**:这些课在新加的**机器第11项三维闸门**下红灯(每课有多道元语法定义题 >1)。按"不绿不落库",等三维闸门回扫(REVIEWAA/american-instructional-design-audit.md 复核后逐课改)完成、复验全绿再跑。届时更新本表。
> 说明:六项修正的 ④⑤⑥ 是给**已存在题目**加字段/补解释,COUNT 不增;跑最新版本即可覆盖。已全部跑完。
> 后续 am2 U3–U12(L17–L96)、am3、am4 会新增 `american_am2_seed_unitNN.sql` / `american_am3_seed_unitNN.sql` / `american_am4_seed_unitNN.sql`,每单元完成追加到本表(带期望 COUNT 增量)。
