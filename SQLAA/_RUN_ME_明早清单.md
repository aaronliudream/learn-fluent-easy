# 明早跑单(Aaron 只需按顺序跑这些 SQL)

> CC 全自动生产,每完成一单元追加一行。全部幂等(ON CONFLICT),可重复跑。
> 跑前后建议 `SELECT count(*) FROM american_questions WHERE lesson_id LIKE 'amN_l%';` 对账。
> **依赖**:同一 seed 文件内含 lessons→questions,自带顺序,无跨文件依赖;册与册独立。

## 已跑(Aaron 2026-07-04 确认)
- ✅ `american_am2_seed_unit02.sql`(当时含 L9 ④⑤⑥)
- ✅ `american_am1_register_leak_fix.sql`(am1 泄漏+语域 by-qid;**别跑 OBSOLETE_ 开头的 expand,会抹解释**)

## 待跑(按序)

| # | 文件 | 期望 COUNT | 说明 | 依赖 |
|---|---|---|---|---|
| 1 | `american_am2_seed_unit02.sql` | 355(不变) | 幂等重跑:L9–L16 **全部** ④⑤⑥ 已产齐(stem_cn/词义题补英文/关7错因),仅 payload 更新,题数不变 | 无 |
| 2 | `american_am2_seed_unit01.sql` | 356(不变) | 幂等重跑:补 L1–L8 的 ④⑤⑥(CC 生产中) | 无 |

> 说明:六项修正的 ④⑤⑥ 是给**已存在题目**加字段/补解释,COUNT 不增;跑最新版本即可覆盖。
> 后续 am2 U3–U12(L17–L96)、am3、am4 会新增 `american_am2_seed_unitNN.sql` / `american_am3_seed_unitNN.sql` / `american_am4_seed_unitNN.sql`,每单元完成追加到本表(带期望 COUNT 增量)。
