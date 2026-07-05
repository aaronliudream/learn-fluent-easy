# 明早跑单(Aaron 只需按顺序跑这些 SQL)

> CC 全自动生产,每完成一单元追加一行。全部幂等(ON CONFLICT),可重复跑。
> 跑前后建议 `SELECT count(*) FROM american_questions WHERE lesson_id LIKE 'amN_l%';` 对账。
> **依赖**:同一 seed 文件内含 lessons→questions,自带顺序,无跨文件依赖;册与册独立。

## 已跑(Aaron 确认)
- ✅ `american_am2_seed_unit02.sql`(L9–L16 全部 ④⑤⑥,2026-07-05 确认)
- ✅ `american_am2_seed_unit01.sql`(L1–L8 全部 ④⑤⑥,2026-07-05 确认)
- ✅ `american_am1_register_leak_fix.sql`(am1 泄漏+语域 by-qid;**别跑 OBSOLETE_ 开头的 expand,会抹解释**)

## 待跑(按序)

> 全部经**机器12项校验全绿**(含第11项三维闸门:全27课元语法定义题=0)。幂等 ON CONFLICT,可重复跑。

| # | 文件 | 期望 COUNT | 说明 | 依赖 |
|---|---|---|---|---|
| 1 | `american_am2_seed_unit01.sql`(**重跑**) | +0(改题不增) | L1–8:2 道🔴元语法定义题→运用题(L01 can 词类/句型题) | 无 |
| 2 | `american_am2_seed_unit02.sql`(**重跑**) | +0(改题不增) | L9–16:元语法转运用(L10/11/12/13/14/15)+ L16 集合名词修正(family are→is、as well as 陷阱→and、if 概念→运用) | 无 |
| 3 | `american_am2_seed_unit03.sql` | +352(8课×44) | am2 U3(L17–24)整单元新增,已过三维闸门(L17/18/21 元语法已转运用) | 无 |
| 4 | `american_am2_seed_unit04.sql` | +352(8课×44) | am2 U4 **整单元 L25–32 完成**(L32 Shopping made easy as…as同级比较+量词·分歧第六例),全过机器12项🟢 | 无 |
| 5 | `american_am2_seed_unit05.sql` | +264(6课×44,续增) | am2 U5 L33–38(L38 Everything except the weather 过去完成时+no sooner than·KS14),机器12项🟢;L39-40 陆续追加 | 无 |

> **✅ unit03/04 已解除暂缓**:24 道🔴元语法定义题全部转成运用题,全 27 课第11项 =0、十二项全绿。
> **🟡 待 Aaron 复核(非阻断,不影响上面照跑)**:`REVIEWAA/american-instructional-design-audit.md` 里的 ~98 道"概念辨认🟡"(如"关于X正确的是""police 后面动词用")按三维闸门属中间地带,已过机器闸(非红),留你复核是否进一步降级;要改也是幂等 UPDATE,不影响先跑。
> 说明:六项修正的 ④⑤⑥ 是给**已存在题目**加字段/补解释,COUNT 不增;跑最新版本即可覆盖。
> 后续 am2 U3–U12(L17–L96)、am3、am4 会新增 `american_am2_seed_unitNN.sql` / `american_am3_seed_unitNN.sql` / `american_am4_seed_unitNN.sql`,每单元完成追加到本表(带期望 COUNT 增量)。
