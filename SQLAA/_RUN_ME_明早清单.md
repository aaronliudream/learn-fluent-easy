# 明早跑单(Aaron 只需按顺序跑这些 SQL)

> CC 全自动生产,每完成一单元追加一行。全部幂等(ON CONFLICT),可重复跑。
> 跑前后建议 `SELECT count(*) FROM american_questions WHERE lesson_id LIKE 'amN_l%';` 对账。
> **依赖**:同一 seed 文件内含 lessons→questions,自带顺序,无跨文件依赖;册与册独立。
>
> **时间戳=真相信号(2026-07-05 起)**:`gen-book2-seed.mjs` 现在**写前比对内容,只有真变的 unit 文件才重写、才刷新时间戳**;未变的文件原地不动。所以你**只需跑"时间戳是本批新的 / 下方标🔴需跑"的文件**,时间戳没动的可放心跳过。生成器结尾也会打印「✍️需跑 / ⏭️无需重跑」小结。

## 📌 本批变化(2026-07-06 session · am3 第三册 · **U1–U5 五单元收官 L1–L25**,累计 1100 题)

## 📌 AM3 U5 收官(L21–L25 · `american_am3_seed_unit05.sql` · 220题=44×5,全🟢)
> NCE3 第二册(Unit 2,即 L21 起)多为**综合复习课**,一课融合前面多个难点。以下逐课主考:
- 🔴 **需跑** `american_am3_seed_unit05.sql`(全新文件,含 L21–L25 五课)。
  - **L21《Daniel Mendoza 丹尼尔·门多萨》**(not...until / rise vs raise / ago vs before / could vs was able to / 被动 by / 形容词+不定式·18世纪拳击宗师传记)——44 题🟢全绿。**适度淡化**:略去赤手拳击"可能致死"的血腥,突出"把蛮打变成讲技巧的运动"+"挥霍致穷"的理财警示;真实历史人物,同 L17/L20 事实传记处理。
  - **L22《By Heart 熟记台词》**(so/such...that / would·used to / insist·suggest that + (should)原形 / managed to / present sth to sb·剧场趣事:两演员忘词、一张白纸互相救场)——44 题🟢全绿。无需净化(牢房是戏中布景)。美式化:jailer/theater。
  - **L23《One Man's Meat... 各有所爱》**(条件句 if+过去时→would / since·for·ago / most·the most / as 多义 / 现在完成进行·谈饮食偏好+逃跑的花园蜗牛)——44 题🟢全绿。无需净化。美式化:french fries/eggplant。
  - **L24《A Skeleton in the Closet 家丑》**(频率副词位置 / few·a few·little·a little / 形容词+介词 / make·let sb do / tell sb to do+引号·侦探小说家客房壁橱里的医学骨架 Sebastian)——44 题🟢全绿。**轻净化**:小说例子"毒死五任丈夫"→"年轻时偷跑去马戏团跳舞"的无害家丑;骨架是学医教具。美式化:a skeleton in the closet(英式 cupboard)。
  - **L25《The Cutty Sark 卡蒂萨克号帆船》**(be used to do / used to do / be used to doing 三辨 + a great many·a great deal of + on·in 固定搭配 + have sth done + its·it's / too·very / win·beat·1872 运茶帆船竞赛因折舵失利)——44 题🟢全绿。无需净化,事实历史。
- **U5 特点**:进入 NCE3 复习阶段,每课以一篇趣文/传记/事实文承载 5–8 个已学难点的综合复现。
- 对账(U5 累计):`SELECT count(*) FROM american_questions WHERE lesson_id LIKE 'am3_l%';` = **1100**(U1–U5 各 220)。

## 📌 AM3 U4 收官(L16–L20 · `american_am3_seed_unit04.sql` · 220题=44×5,全🟢)
- 🔴 **需跑** `american_am3_seed_unit04.sql`(全新文件,含 L16–L20 五课)。
  - **L16《Mary Had a Little Lamb 玛丽有一头小羔羊》**(accuse sb of doing / deny doing / be ashamed of / apologize for + 动名词,外加 had better 忠告·白羊被偷、错怪邻居后道歉、一场雨把染黑的羊毛冲白)——44 题🟢全绿。轻度处理:仅乡村小偷小摸+喜剧反转(染羊被雨冲白),无暴力,同 L11 尺度保留;美式化:后院 backyard、警长 sheriff、gotten。
  - **L17《The Longest Suspension Bridge 世界上最长的吊桥》**(被动语态各时态 is built/was designed/has been estimated/had to be taken + consider/think sth to be 把 that 从句改不定式·纽约韦拉扎诺-纳罗斯大桥)——44 题🟢全绿。**无需净化**:本就是美国地标、事实说明文。
  - **L18《Electric Currents in Modern Art 现代艺术中的电流》**(介词固定搭配 interest in/on display/suspended from/attached to/familiar to/in response to + 名词/动词以 -y 结尾变 -ies/-s 拼写规则·会动、带电的现代雕塑展)——44 题🟢全绿。无需净化。
  - **L19《A Very Dear Cat 一只贵重的宝贝猫》**(动词形式综合复习 + 逗号五种用法:句首状语后/同位语/列举/插入语 however/非限定性从句·dear 一词双关"心爱+昂贵")——44 题🟢全绿。**净化**:原课"绑架勒索赎金"→"猫溜进豪华宠物度假村 Whisker Manor,主人付千元账单赎回",保留双关与"在可靠的人那里"桥段,去掉绑架勒索;犯罪词(kidnapper/ransom/anonymous)按净化规则舍去。
  - **L20《Pioneer Pilots 飞行员的先驱》**(**综合复习课** SD1-17:happen to/否定词句首倒装 Not only had.../否定前缀 im-ir-dis-/be supposed to/would rather sb+过去式/had better/save up/find sb to be·1909 年飞越英吉利海峡竞赛:拉塔姆两次落海,布莱里奥37分钟成功)——44 题🟢全绿。无需净化,史实叙述。
- **U4 主线**:说明文与叙事综合——L16 动名词固定搭配 → L17 被动语态 → L18 介词/拼写 → L19 动词形式+标点 → L20 前四单元难点综合复习。
- 对账(U4 累计):`SELECT count(*) FROM american_questions WHERE lesson_id LIKE 'am3_l%';` = **880**(U1 220 + U2 220 + U3 220 + U4 220)。
- 🔴 **需跑(重跑)** `american_am3_seed_unit01.sql` —— 现含 **L1+L2+L3+L4+L5**,共 **220 题(44×5)**,5 课全 🟢 全绿。相对你上次已跑(仅 L1),期望 **净 +176**(L2–L5)。
  - **L5《The Exact Facts 确切数字》**(过去完成时 had done + 其被动 had been done + 否定副词句首倒装 Not only had he… / Never had I… + 冠词 a/the 复习·编辑逼记者要确切数字、记者数台阶时被捕入狱)——44 题🟢全绿。**主考取舍**:官方 Key structures 是冠词复习,但课文实际密集考点是过去完成+被动+倒装(书3级别),故以课文实考点为主考,冠词并入 gp5 复习。
- **AM3 U1 五课语法进阶**:L1 过去叙事(过去/过去进行)→ L2 现在时(一般现在/现在进行/always+进行)→ L3 一般过去+不规则动词过去式 → L4 现在完成/完成进行 → L5 过去完成+被动+倒装。时态线索完整铺开。
- 对账:`SELECT count(*) FROM american_questions WHERE lesson_id LIKE 'am3_l%';` = **220**(L1–L5,U1 收官)。

## 📌 AM3 U2 收官(L6–L10 · `american_am3_seed_unit02.sql` · 220题=44×5,全🟢)
- 🔴 **需跑** `american_am3_seed_unit02.sql`(全新文件,含 L6–L10 五课)。
  - **L6《It Was Only a Movie 原来在拍电影》**——一般过去vs过去进行 + 否定前缀 un-/im-/in-/dis-/il-/ir- + with+名词+分词伴随。**净化**:珠宝店砸窗抢劫→剧组拍电影、店主误会狂扔家具的无害喜剧。
  - **L7《Cooked Cash 被煮熟的钞票》**——名词加后缀变形容词(-ful/-less/-ish/-ic/-ous/-y) + 一般过去 + 经历疑问。美国残币赔付(真机构 Mutilated Currency Division),把钱藏微波炉被误烧。
  - **L8《The Mountain Monastery 山中修道院》**——被动语态各时态(is/are/was/were/has been done + have to be kept/are allowed) + -ever 复合词(whenever/wherever/whoever/whatever)。落基山口修道院+圣伯纳德救援犬。
  - **L9《Flying Cats 飞猫》**——so/such/such a(n) 强调结构 + the+比较级the+比较级 + 一般现在真理。城市里猫从高楼坠落却大多幸存。
  - **L10《The Loss of the Titanic 泰坦尼克号的沉没》**——名词后缀构词(-er/-ist/-ness/-ion/-ity) + 过去完成/被动 + 过去虚拟条件。泰坦尼克**史实克制叙述**(不渲染死亡,落点在"救生艇不足→立法配足"的安全教训)。
- **U2 构词法三部曲**:L6 否定前缀 → L7 名词变形容词后缀 → L10 名词后缀,配合时态复现(过去/被动/完成/虚拟)。
- 对账(U2 累计):`SELECT count(*) FROM american_questions WHERE lesson_id LIKE 'am3_l%';` = **440**(U1 220 + U2 220)。

## 📌 AM3 U3 收官(L11–L15 · `american_am3_seed_unit03.sql` · 220题=44×5,全🟢)
- 🔴 **需跑** `american_am3_seed_unit03.sql`(含 L11–L15 五课)。
  - **L11《Not Guilty 无罪》**(间接引语 He said that.../He asked whether.../He asked what... + say vs tell + 大写字母规则·旅客被海关误当走私犯,"香水"其实是自制发胶)——44 题🟢全绿。原属🔴,实读后是无害海关喜剧(旅客本就"无罪"、无真实犯罪),轻度保留,未占梗概额度。
  - **L12《Life on a Desert Island 荒岛生活》**(条件句 if 真实/虚拟 + wish/if only 虚拟愿望 + 过去时/过去完成·两人在珊瑚岛上过得有滋有味)——44 题🟢全绿。美式化:beer→soda。
  - **L13《It's Only Me 是我别害怕》**(must 推测"一定是"/义务/mustn't vs needn't + 形容词+动词不定式 glad to hear·女主人穿鬼装吓跑抄电表的人)——44 题🟢全绿。美式化:fancy-dress→costume party、metre→meter。
  - **L14《He'd Rather Do It Himself 他宁愿自己动手》**(would rather/would sooner 偏好 + would rather+某人+过去式 + have sth done·凡事亲力亲为的手艺人 Dawson)——44 题🟢全绿。**净化**:NCE3 原课"贵族歹徒勒索保护费"→"宁愿自己动手的传奇手艺人",保留"被全镇敬重、立牌纪念"的反差,去掉一切犯罪暴力;犯罪绑定词(gangster/protection/prince/city-state/Florentine)按净化规则舍去,改承载中性官方词(remarkable/promptly/hire/destroy/dedicate/memory/funeral/band/valiant)。
  - **L15《Fifty Cents' Worth of Trouble 五十美分的麻烦》**(could 一般能力 vs was able to/managed to 某次成功 vs could not + 短语动词 up:save up/fill up/roll up/wrap up/button up·侄子硬币掉下水道、胳膊卡住、消防队用润滑油救出)——44 题🟢全绿。无需净化(原课即无害喜剧);美式化:pence→cents、sweet shop→candy store、pavement→sidewalk、fire brigade→fire department、pocket money→allowance。
- **U3 语气/情态主线**:L11 间接引语 → L12 条件句/虚拟 → L13 must 推测/义务 → L14 would rather 偏好 → L15 could/was able to 能力。整单元围绕"表达语气与情态"成体系。
- 对账(U3 累计):`SELECT count(*) FROM american_questions WHERE lesson_id LIKE 'am3_l%';` = **660**(U1 220 + U2 220 + U3 220)。

<!-- 历史(上一版) -->
## 📌 本批变化(2026-07-06 session · am3 第三册 · U1 推进到 L3)
- ✅ **L1 已确认**:Aaron 已跑 unit01(仅 L1)并真机确认「unit 01 is good」。原创承载法首课样板通过。
- 🔴 **需跑(重跑)** `american_am3_seed_unit01.sql` —— 现含 **L1+L2+L3**:
  - **L1《The Mountain Lion 美洲狮》**(过去叙事时态:一般过去 vs 过去进行 + when/while)——已跑过;因后续新增课使选项重排(内容不变、answer_index 已重同步),幂等 UPSERT 覆盖,不产生重复。
  - **L2《Thirteen Is Close Enough 十三也差不多》**(两种现在时:一般现在 vs 现在进行 + always+进行时"老是……" + in 短语·小镇老钟半夜敲十三下)——44 题🟢全绿,承载 NCE3 L2 考点+官方词表(equal/vicar/raise/torchlight/recognize)。
  - **L3《The Unknown Goddess 无名女神》**(一般过去时+**不规则动词过去式** find→found/dig→dug/begin→began/come→came/feel→felt/wear→wore + happen(to be)碰巧 + story楼层美式/worship↔warship 易混·美国考古队复原古女神像)——44 题🟢全绿,承载 NCE3 L3 考点+词表。**美式化**:"楼层"课文写 story(非英式 storey),并入对照表+gp5。
  - 该文件现共 **132 题(44×3)**。相对你上次已跑的状态(仅 L1),期望 **净 +88**(L2+L3;L1 覆盖不增)。
- **第三册数据驱动自动点亮**:hub `fetchBooks` 扫到 `am3_l%` 有课即把第三册标为可进,无需改前端。
- 对账:`SELECT count(*) FROM american_questions WHERE lesson_id LIKE 'am3_l%';` = **132**(L1+L2+L3)。
- ⏭️ 下一步:U1 余 L4/L5(L4 为🔴高危课,攒到 U1 末一次性找 Aaron 要梗概)。

## 📌 本批变化(2026-07-06 session · L78 净化包 → 第二册 96/96 收官)
- 🔴 **需跑** `american_am2_seed_unit10.sql` —— 补上 **L78《The Last Game 最后一局》**(净化包·冠词 a/an/the 与零冠词·戒手机游戏),**U10 → 8课齐(352)**,机器12项🟢全绿。
- 🔴 **需跑(重跑)** `american_am2_seed_unit11.sql` / `american_am2_seed_unit12.sql` —— **内容一字未改**,但 L78 插在 L81–96 之前,确定性打散的随机流整体前移,这两个单元的**选项顺序被重排**(答案仍对,answer_index 同步更新)→ 文件已变、时间戳已刷,**必须重跑**(幂等 UPDATE 覆盖,期望 **+0**)。
- ✅ **第二册全 96 课 🟢 全绿**(逐课机器12项校验通过,0 红灯)。跑完 10/11/12 即 96/96 全部落库。
- 期望 COUNT(第二册总账):`SELECT count(*) FROM american_questions WHERE lesson_id LIKE 'am2_l%';` = **4231**;`SELECT count(*) FROM american_lessons WHERE id LIKE 'am2_l%';` = **96**。

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

| 10 | `american_am2_seed_unit10.sql`(**整单元8课齐·U10收官**) | +352(8课×44,U10收官) | am2 U10(=教材 Unit 4,L73-80)L73(《The record-holder 纪录保持者》KS1/25/49 简单句·并列句·复合句——who/whose·when/as·after+分词·although/in spite of/though·not only...but...as well·such...that·before + 课文被动复习was given/was picked up/wasn't noticed by anyone + 词汇辨析evade/ashamed/imagination·🟢低正常读)+ L74(《Too Good to Be True 好得不像真的》**方案B换情节包**——KS2/26/50 现在进行vs一般现在 + 状态动词不用进行 + SD get短语get out/into/over/on with/off/through·名演员拍电影化装太逼真被误当粉丝赶出的喜剧)+ L77(《The Oldest Bridge in Town 镇上最老的桥》**方案B换情节包**——KS5/29/53 一般过去/现在完成/现在完成进行三时态对比 + for/since/ago·考古专家研究小镇老石桥),+ L75(《The Big Race 大比赛》**方案B换情节包**——KS3/27/51 一般过去时综合·规则/不规则过去式+过去时间状语+didn't/Did疑问·学校运动会接力赛)+ L76(《What Have You Been Up To? 你最近在忙什么》**方案B换情节包**——KS4/28/52 现在完成vs现在完成进行 + since/for·朋友久别重逢聊近况)+ L79(《A Long Journey Home 漫长的回家路》**方案B换情节包**——KS7/31/55 一般过去vs过去进行vs used to/would·难忘的火车旅行)+ L80(《The Crystal Palace 水晶宫》KS8/32/56 比较级最高级 + SD带on短语·1851世博会史实·🟢正常读源),+ **L78**(《The Last Game 最后一局》**净化包·方案B换情节**——KS6/30/54 冠词 a/an/the 与零冠词·下决心戒手机游戏坚持一周又破功),机器12项🟢全绿;**U10 整单元8课齐(L73-80 = 352,第二册96/96收官)**。**注**:教材 Unit 4 起换格式(24短文·课后无理解题·KS 改为复习前三单元语法),语言点仍在,流水线兼容 | 无 |

| 11 | `american_am2_seed_unit11.sql`(**整单元8课齐**) | +352(**8课×44,U11收官**) | am2 U11(=教材 Unit 4,L81-88)L81(《A Day at the Museum 博物馆的一天》**方案B换情节包**——KS9/33/57 介词综合 at/in/to/with/into/about·参观科学博物馆)+ L82(《The Thing in the Attic 阁楼里的东西》**方案B换情节包·单独**——KS10/34/58 被动语态各时态was found/is being examined/have been seen/will be shown + laugh at/wash up·阁楼发现古怪旧物进博物馆)+ L83(《The Election Results 选举结果》**收官包·方案B换情节**——KS74-82 各时态综合复习 holds/were running/gathered/had been counted/have been waiting/is announcing/has won·校园社团社长选举结果揭晓)+ L84(《The School Play 校园话剧》**合集·方案B换情节**——KS12/36/60 一般将来时 will vs be going to + when/if/as soon as从句用现在时表将来·筹备校园话剧)+ L85(《Never Too Old to Learn 活到老学到老》**收官包·干净课美语化**——KS13/37/61 将来进行/将来完成/将来完成进行 will be doing·will have done·will have been doing + by/in/at time搭配·七十岁爷爷上大学)+ L86(《The Runaway Kite 跑掉的风筝》**合集·方案B换情节**——KS14/38/62 过去完成 had done vs 过去完成进行 had been doing + before/by the time搭配·放风筝线断追风筝)+ L87(《What Did She Say? 她说了什么》**合集·方案B换情节**——KS15/39/63 间接引语 say/tell区别·时态后移·ask if/whether·特殊疑问陈述语序·转述体育采访)+ L88(《Lost and Found 失物招领》**收官包·方案B换情节**——KS16/40/64 条件句 if 真实条件/与现在相反(if I were you)/与过去相反(if had done→would have done)/从句用现在表将来·丢失又找回背包),**整单元8课齐**,机器12项🟢全绿(L81-L88 = 352) | 无 |

| 12 | `american_am2_seed_unit12.sql`(**整单元8课齐·第二册收官**) | +352(**8课×44,U12收官=第二册96课全齐**) | am2 U12(=教材 Unit 4,L89-96)L89(《A Slip of the Tongue 一次口误》**收官包·干净课美语化**——KS17/41/65 情态 must/must have done·have to/had to·needn't·don't have to·should/should have done·mustn't·新主持人上台口误温情鼓励)+ L90(《What's for Dinner? 晚饭吃什么》**合集·方案B换情节**——KS17/41/65 情态 must/have to/needn't/should + must vs have to 主客观区别·一家人一起做晚饭)+ L91(《Three People in a Hot-Air Balloon 热气球上的三个人》**收官包·干净课美语化**——KS19/43/67 can/could·be able to·manage to·can't/couldn't + 某次做到用was able to/managed to不用could·三人乘热气球历险)+ L92(《The Windows Need Cleaning 窗户该擦了》**收官包·干净课美语化**——KS20/44/68 need + doing·want + doing 主动-ing表被动“需要被…” + 对比need to do·全家大扫除)+ L93(《A Generous Gift 一份慷慨的礼物》**收官包·换道具照搬结构**——KS21/45/69 被动语态各时态 was given/is admired/has been kept/will be moved/is being built/should be treasured + by短语·镇上捐赠的手工古钟)+ L94(《The New Library 新图书馆》**合集·方案B换情节**——KS21/45/69 被动语态各时态 was built/is admired/have been added/will be opened/can be taught/must be returned/is being built + by短语·镇上新图书馆落成)+ L95(《A Very Special Day 非常特别的一天》**收官包·方案B换情节**——全册动词形式综合复习 各时态/被动/条件/情态/现在进行被动 holds·have been helping·were set up·had been hung·will be moved·is being served·社区丰收节)+ L96(《What's It Really About? 它到底讲的是什么》**收官包·方案B换情节**——KS22/46/70 形容词/副词+介词固定搭配综合 interested in·good at·fond of·proud of·afraid of·famous for·grateful to…for·curious about·keen on·worth doing·姐姐爱读悬疑小说),**整单元8课齐·第二册全96课收官**,机器12项🟢全绿(L89-L96 = 352) | 无 |

> **✅ unit03/04 已解除暂缓**:24 道🔴元语法定义题全部转成运用题,全 27 课第11项 =0、十二项全绿。
> **🟡 待 Aaron 复核(非阻断,不影响上面照跑)**:`REVIEWAA/american-instructional-design-audit.md` 里的 ~98 道"概念辨认🟡"(如"关于X正确的是""police 后面动词用")按三维闸门属中间地带,已过机器闸(非红),留你复核是否进一步降级;要改也是幂等 UPDATE,不影响先跑。
> 说明:六项修正的 ④⑤⑥ 是给**已存在题目**加字段/补解释,COUNT 不增;跑最新版本即可覆盖。
> 后续 am2 U3–U12(L17–L96)、am3、am4 会新增 `american_am2_seed_unitNN.sql` / `american_am3_seed_unitNN.sql` / `american_am4_seed_unitNN.sql`,每单元完成追加到本表(带期望 COUNT 增量)。
