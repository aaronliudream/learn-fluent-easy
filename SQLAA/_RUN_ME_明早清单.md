# 明早跑单(Aaron 只需按顺序跑这些 SQL)

> CC 全自动生产,每完成一单元追加一行。全部幂等(ON CONFLICT),可重复跑。
> 跑前后建议 `SELECT count(*) FROM american_questions WHERE lesson_id LIKE 'amN_l%';` 对账。
> **依赖**:同一 seed 文件内含 lessons→questions,自带顺序,无跨文件依赖;册与册独立。
>
> **时间戳=真相信号(2026-07-05 起)**:`gen-book2-seed.mjs` 现在**写前比对内容,只有真变的 unit 文件才重写、才刷新时间戳**;未变的文件原地不动。所以你**只需跑"时间戳是本批新的 / 下方标🔴需跑"的文件**,时间戳没动的可放心跳过。生成器结尾也会打印「✍️需跑 / ⏭️无需重跑」小结。

## 📌 本批变化(2026-07-05 session · L39–L46)
- 🔴 **需跑** `american_am2_seed_unit05.sql` —— 本批加了 **L39、L40**(整单元 8 课齐),期望 **+352**(整单元;若之前跑过 L33–38 则本次净增 L39+L40 的 +88,幂等重跑整包无害)。
- 🔴 **需跑** `american_am2_seed_unit06.sql` —— 本批 **整单元 L41–L48 完成**,期望 **+352**(8 课×44)。
- 🔴 **需跑** `american_am2_seed_unit07.sql` —— **U7 整单元 L49–L56 全部完成**(教材 Unit 3 前半),期望 **+352**(8 课×44)。L55(净化包生产)已补齐。
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
| 7 | `american_am2_seed_unit07.sql` | +352(**整单元8课**×44) | am2 U7 L49–L56 全:复合句连词/KS26状态动词/KS27一般过去/KS28现在完成vs完成进行/KS29+52三时态/KS30冠词综合/**KS31 would·used to(L55净化包)**/KS32数量词与比较,机器12项🟢全绿 | 无 |
| 8 | `american_am2_seed_unit08.sql` | +352(**整单元8课**×44) | am2 U8 L57(KS9+33介词·净化包)+ L58(KS34被动语态综合+双宾语被动)+ L59(Review KS50-58时态综合复习 + SD表目的多方式)+ L60(KS36+16表将来的几种方式 + SD名词作定语)+ L61(KS37将来进行/完成/完成进行时 + SD cost/price/value)+ L62(KS38过去完成vs过去完成进行 + SD control·great·soil,净化包)+ L63(KS15+39间接引语 + 间接疑问陈述语序)+ L64(KS16+40真实与非真实条件句+虚拟 + SD draw短语动词),**整单元8课齐**,机器12项🟢全绿 | 无 |
| 9 | `american_am2_seed_unit09.sql`(**新建·续增**) | +220(5课×44,续增) | am2 U9 L65(KS17 must/have to/should/ought to + should/ought to have done过去本应做 + SD let短语动词·agree/accept·dress up/dress)+ L66(KS18+42使役结构 have sth done + SD集合名词美语单数·净化包)+ L67(KS43 can/be able to/manage to + SD say/tell短语)+ L68(KS20+44动名词-ing作宾语 + 逻辑主语/感官动词/go-come/反义疑问·净化包)+ L69(KS10/21/34/45被动语态综合复习+must have been done推测被动 + SD advice/advise·practice/license·enjoy/entertain/amuse),机器12项🟢;L70-72 陆续追加 | 无 |

> **✅ unit03/04 已解除暂缓**:24 道🔴元语法定义题全部转成运用题,全 27 课第11项 =0、十二项全绿。
> **🟡 待 Aaron 复核(非阻断,不影响上面照跑)**:`REVIEWAA/american-instructional-design-audit.md` 里的 ~98 道"概念辨认🟡"(如"关于X正确的是""police 后面动词用")按三维闸门属中间地带,已过机器闸(非红),留你复核是否进一步降级;要改也是幂等 UPDATE,不影响先跑。
> 说明:六项修正的 ④⑤⑥ 是给**已存在题目**加字段/补解释,COUNT 不增;跑最新版本即可覆盖。
> 后续 am2 U3–U12(L17–L96)、am3、am4 会新增 `american_am2_seed_unitNN.sql` / `american_am3_seed_unitNN.sql` / `american_am4_seed_unitNN.sql`,每单元完成追加到本表(带期望 COUNT 增量)。
