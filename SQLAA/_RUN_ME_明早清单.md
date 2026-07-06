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
| 9 | `american_am2_seed_unit09.sql`(**整单元8课齐**) | +352(**8课×44,U9收官**) | am2 U9 L65(KS17 must/have to/should/ought to + should/ought to have done过去本应做 + SD let短语动词·agree/accept·dress up/dress)+ L66(KS18+42使役结构 have sth done + SD集合名词美语单数·净化包)+ L67(KS43 can/be able to/manage to + SD say/tell短语)+ L68(KS20+44动名词-ing作宾语 + 逻辑主语/感官动词/go-come/反义疑问·净化包)+ L69(**方案B换情节**《老爷车重获新生》被动语态综合复习)+ **L70**(**方案B换情节**《What Are You Good At? 你擅长什么》形容词+介词固定搭配 famous for/proud of/good at/grateful to/keen on·校园社团招新)+ L71(《A famous clock 一个著名的大钟》Review KS60-69综合复习 + SD official/employee/salesclerk/hang→hung·🟡试读通过)+ L72(《A car called Bluebird “蓝鸟”汽车》Review SD50-71易混词 + 课文过去完成被动·✅正常读),**8课齐**,机器12项🟢全绿 | 无 |

| 10 | `american_am2_seed_unit10.sql`(**新建·续增**) | +88(2课×44,续增) | am2 U10(=教材 Unit 4,L73-80)L73(《The record-holder 纪录保持者》KS1/25/49 简单句·并列句·复合句——who/whose·when/as·after+分词·although/in spite of/though·not only...but...as well·such...that·before + 课文被动复习was given/was picked up/wasn't noticed by anyone + 词汇辨析evade/ashamed/imagination·🟢低正常读)+ L74(《Too Good to Be True 好得不像真的》**方案B换情节包**——KS2/26/50 现在进行vs一般现在 + 状态动词不用进行 + SD get短语get out/into/over/on with/off/through·名演员拍电影化装太逼真被误当粉丝赶出的喜剧)+ L77(《The Oldest Bridge in Town 镇上最老的桥》**方案B换情节包**——KS5/29/53 一般过去/现在完成/现在完成进行三时态对比 + for/since/ago·考古专家研究小镇老石桥),+ L75(《The Big Race 大比赛》**方案B换情节包**——KS3/27/51 一般过去时综合·规则/不规则过去式+过去时间状语+didn't/Did疑问·学校运动会接力赛)+ L76(《What Have You Been Up To? 你最近在忙什么》**方案B换情节包**——KS4/28/52 现在完成vs现在完成进行 + since/for·朋友久别重逢聊近况)+ L79(《A Long Journey Home 漫长的回家路》**方案B换情节包**——KS7/31/55 一般过去vs过去进行vs used to/would·难忘的火车旅行)+ L80(《The Crystal Palace 水晶宫》KS8/32/56 比较级最高级 + SD带on短语·1851世博会史实·🟢正常读源),机器12项🟢;**L78(🚩题材=吸烟不宜·已报Aaron待换情节包)单元内唯一空缺**(L73-77+L79+L80 = 308,差 L78 即 U10 整单元 8课齐)。**注**:教材 Unit 4 起换格式(24短文·课后无理解题·KS 改为复习前三单元语法),语言点仍在,流水线兼容 | 无 |

| 11 | `american_am2_seed_unit11.sql`(**整单元8课齐**) | +352(**8课×44,U11收官**) | am2 U11(=教材 Unit 4,L81-88)L81(《A Day at the Museum 博物馆的一天》**方案B换情节包**——KS9/33/57 介词综合 at/in/to/with/into/about·参观科学博物馆)+ L82(《The Thing in the Attic 阁楼里的东西》**方案B换情节包·单独**——KS10/34/58 被动语态各时态was found/is being examined/have been seen/will be shown + laugh at/wash up·阁楼发现古怪旧物进博物馆)+ L83(《The Election Results 选举结果》**收官包·方案B换情节**——KS74-82 各时态综合复习 holds/were running/gathered/had been counted/have been waiting/is announcing/has won·校园社团社长选举结果揭晓)+ L84(《The School Play 校园话剧》**合集·方案B换情节**——KS12/36/60 一般将来时 will vs be going to + when/if/as soon as从句用现在时表将来·筹备校园话剧)+ L85(《Never Too Old to Learn 活到老学到老》**收官包·干净课美语化**——KS13/37/61 将来进行/将来完成/将来完成进行 will be doing·will have done·will have been doing + by/in/at time搭配·七十岁爷爷上大学)+ L86(《The Runaway Kite 跑掉的风筝》**合集·方案B换情节**——KS14/38/62 过去完成 had done vs 过去完成进行 had been doing + before/by the time搭配·放风筝线断追风筝)+ L87(《What Did She Say? 她说了什么》**合集·方案B换情节**——KS15/39/63 间接引语 say/tell区别·时态后移·ask if/whether·特殊疑问陈述语序·转述体育采访)+ L88(《Lost and Found 失物招领》**收官包·方案B换情节**——KS16/40/64 条件句 if 真实条件/与现在相反(if I were you)/与过去相反(if had done→would have done)/从句用现在表将来·丢失又找回背包),**整单元8课齐**,机器12项🟢全绿(L81-L88 = 352) | 无 |

| 12 | `american_am2_seed_unit12.sql`(**新建·续增**) | +44(1课×44,续增) | am2 U12(=教材 Unit 4,L89-96)L89(《A Slip of the Tongue 一次口误》**收官包·干净课美语化**——KS17/41/65 情态 must/must have done·have to/had to·needn't·don't have to·should/should have done·mustn't·新主持人上台口误温情鼓励)+ L90(《What's for Dinner? 晚饭吃什么》**合集·方案B换情节**——KS17/41/65 情态 must/have to/needn't/should + must vs have to 主客观区别·一家人一起做晚饭)+ L91(《Three People in a Hot-Air Balloon 热气球上的三个人》**收官包·干净课美语化**——KS19/43/67 can/could·be able to·manage to·can't/couldn't + 某次做到用was able to/managed to不用could·三人乘热气球历险),机器12项🟢;L92-96 陆续追加(L89-L91 = 132) | 无 |

> **✅ unit03/04 已解除暂缓**:24 道🔴元语法定义题全部转成运用题,全 27 课第11项 =0、十二项全绿。
> **🟡 待 Aaron 复核(非阻断,不影响上面照跑)**:`REVIEWAA/american-instructional-design-audit.md` 里的 ~98 道"概念辨认🟡"(如"关于X正确的是""police 后面动词用")按三维闸门属中间地带,已过机器闸(非红),留你复核是否进一步降级;要改也是幂等 UPDATE,不影响先跑。
> 说明:六项修正的 ④⑤⑥ 是给**已存在题目**加字段/补解释,COUNT 不增;跑最新版本即可覆盖。
> 后续 am2 U3–U12(L17–L96)、am3、am4 会新增 `american_am2_seed_unitNN.sql` / `american_am3_seed_unitNN.sql` / `american_am4_seed_unitNN.sql`,每单元完成追加到本表(带期望 COUNT 增量)。
