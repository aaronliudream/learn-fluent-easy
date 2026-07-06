# 明早跑单(Aaron 只需按顺序跑这些 SQL)

> CC 全自动生产,每完成一单元追加一行。全部幂等(ON CONFLICT),可重复跑。
> 跑前后建议 `SELECT count(*) FROM american_questions WHERE lesson_id LIKE 'amN_l%';` 对账。
> **依赖**:同一 seed 文件内含 lessons→questions,自带顺序,无跨文件依赖;册与册独立。
>
> **时间戳=真相信号(2026-07-05 起)**:`gen-book2-seed.mjs` 现在**写前比对内容,只有真变的 unit 文件才重写、才刷新时间戳**;未变的文件原地不动。所以你**只需跑"时间戳是本批新的 / 下方标🔴需跑"的文件**,时间戳没动的可放心跳过。生成器结尾也会打印「✍️需跑 / ⏭️无需重跑」小结。

## 📌 本批变化(2026-07-05 session · L39–L46)
- 🔴 **需跑** `american_am2_seed_unit05.sql` —— 本批加了 **L39、L40**(整单元 8 课齐),期望 **+352**(整单元;若之前跑过 L33–38 则本次净增 L39+L40 的 +88,幂等重跑整包无害)。
- 🔴 **需跑** `american_am2_seed_unit06.sql` —— 本批 **整单元 L41–L48 完成**,期望 **+352**(8 课×44)。
- 🔴 **需跑** `american_am2_seed_unit07.sql` —— 本批新增 **L49–L54**(U7 起,教材 Unit 3),期望 **+264**(6 课×44)。⚠️ **L55 挂起**(内容过滤拦截,Aaron 处理中),U7 暂缺 L55、跳到 L56+ 续做;L55 补齐后 seed 再 +44。
- 🔴 **需跑(重跑)** `american_am2_seed_unit01.sql` —— 本批改了 **L02 s5#8**:原"这句话表示"翻译题正确项中文把 tonight(今晚)虚化成"近期",与句子/点评不一致→**转成运用题**(中文场景"我打算今晚过来看你"→选 I'm coming over…tonight),今晚↔tonight 对齐。期望 **+0**(改题不增,幂等 UPDATE 覆盖)。
- ⏭️ **无需重跑** `unit02 / unit03 / unit04` —— 本批**未改**其内容,时间戳不会变;跑了也无害(幂等),但可跳过。

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
| 5 | `american_am2_seed_unit05.sql` | +352(8课×44) | am2 U5 **整单元 L33–40 完成**(L40 Food and talk 虚拟条件句 if+过去式/would原形/be用were·KS16),全过机器12项🟢 | 无 |
| 6 | `american_am2_seed_unit06.sql` | +352(8课×44) | am2 U6 **整单元 L41–48 完成**(KS17-20 + KS10/21/34被动 + KS22动词介词 + KS36-45综合复习 + SD26-45易混词),全过机器12项🟢 | 无 |
| 7 | `american_am2_seed_unit07.sql` | +264(6课×44,续增) | am2 U7 L49–L54:复合句连词/KS26一般现在·状态动词/KS27一般过去/KS28现在完成vs完成进行/KS29+52三时态综合/**KS30冠词a·the·some·any综合复习**,机器12项🟢;L55-56 陆续追加 | 无 |

> **✅ unit03/04 已解除暂缓**:24 道🔴元语法定义题全部转成运用题,全 27 课第11项 =0、十二项全绿。
> **🟡 待 Aaron 复核(非阻断,不影响上面照跑)**:`REVIEWAA/american-instructional-design-audit.md` 里的 ~98 道"概念辨认🟡"(如"关于X正确的是""police 后面动词用")按三维闸门属中间地带,已过机器闸(非红),留你复核是否进一步降级;要改也是幂等 UPDATE,不影响先跑。
> 说明:六项修正的 ④⑤⑥ 是给**已存在题目**加字段/补解释,COUNT 不增;跑最新版本即可覆盖。
> 后续 am2 U3–U12(L17–L96)、am3、am4 会新增 `american_am2_seed_unitNN.sql` / `american_am3_seed_unitNN.sql` / `american_am4_seed_unitNN.sql`,每单元完成追加到本表(带期望 COUNT 增量)。
