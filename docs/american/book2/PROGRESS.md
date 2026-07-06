# AM2 第二册生产进度(L2–L96 自主生产 · 断点续做)

## 🔧 插队 bug/增强队列清账(2026-07-05,主线暂停期清完)
> 纯前端,无新增 SQL(_RUN_ME 待跑表不变)。逐个 tsc0/build0 + 单独 commit;真机验待 Aaron。
1. ✅ **课文加粗粘连**(最高)— AmericanTappableLine 段分割修复(3129d018),已合 main 部署(d06b04e0)。→ Aaron 线上硬刷确认。
2. ✅ **高中「智能选义」音频延迟** — GaokaoVocab `onPick` 手势内同步 `unlockAudioSync()` 解锁 iOS 音频(b7771350)。→ 真机:答完下一题音频应即时。
3. ✅ **小学 grass 释义** g6v2_u4「草坪」→「草;草地」+ 同步4处选项 + 语法解释(da672684)。→ 真机:grass 题面/选项显新释义。
4. ✅ **dashboard「继续上次」方向A** — 指向首个未通关单元、通关自动前进;含完成判定/最后一课收尾/老用户兼容三边界(abf7773c)。→ 真机:通关后卡片指向下一单元。
5. ✅ **关3 听音辨词答后显中文** — 全项有释义则全显、缺则只显正确项(43640716);关4 词义配对本就右列显中文,无需改。→ 真机:关3 选后四项带中文。

---

## 🚧 主线续做:U4 L30《Football or polo?》(足球还是水球?)· 进行中
> 断点续做锚点。教材文本页 doc181/p142,Key structures 页 doc182/p143(均已渲染读过)。
- **[x] 步骤1 三源扫描(主题分歧第四例)**:
  - 教材 Key structures(**主考权威**)= **A. The, Some and Any (KS6 深化)**:①some/any 区分(对比第9课)②专名前冠词——人名/地名不加 a/the;但海洋/河流/山脉/部分国名前必用 the(the Pacific / the Mediterranean)。→ **主考=冠词 the/some/any + 专名**。
  - 同步 L30~31(p182/184/191)= **so/such...that 结果状语从句**(真题 The weather was so cold that…)+ 状语从句连词(because/though/unless/when)+ **方向介词 to/towards**(swim to the shore)。
  - 课文①类实证:Note5 "so hard that he nearly fell"(so…that)、Note1 "a river that cuts across"(that 定语从句)、l.6 "towards a passing boat"(方向介词)——**均课文实际出现=①类,必须本课辅考,不得延后**。
  - **裁决(按 [[am2-source-divergence-rule]] 自决未停,第四次执行)**:冠词 the/some/any+专名=主考(~12) + so…that 结果状语 + towards 方向介词 + that 定语从句=辅考(~6,均①类)。新思维冠词/结果状语章待定点补扫(诚实标注)。
  - 新词(教材 New words):polo/Wayle/cut/row/kick/towards/nearly/sight(8官方词,待补至~11对齐体量)。
- [x] 步骤2 建考点清单 G1–G8(some/any 3 + the河流海洋 3 + the山脉国名 2 + a/an 2 + the特指 2 = 冠词主考12 + so…that 2 + toward 2 + that定从 2 = 辅考6)/ W10 / C4
- [x] 步骤3 清单自审 · [x] 4 课文美语定稿(10句·冠词密集 the Wayle/the park/a ball/a passing boat + so…that + toward + that定从;美语化 towards→toward、riverbank、realize、soccer入关6)
- [x] 5 题库(关5=18[冠词12+辅考6]/关6=6/关7=4/关8=3/关9=3/关10=10=44) · [x] 6 解释44
- [x] 7 双角色自审(冠词句义逐题回读;方向 toward、so…that、that定从三辅考均课文①类) · [x] 8 JSON+seed(am2_l30.json→unit04.sql,264题=L25-30×44) · [x] 9 机器12项🟢全绿(三维闸门元语法=0;3条[c]黄警=冠词/that题干他处含 the/that,人工判过) · [x] 10 commit
> **L30 ✅ 生产完成 · 🟢全绿。** 主题分歧第四例已自决(冠词主考+so…that/toward/that定从辅考)。seed 归 `american_am2_seed_unit04.sql`。

## ✅ U4 L31《Success story》(成功者的故事)· 🟢全绿
- 主教材 Key structures = **used to do**("He used to work fourteen hours a day",过去习惯/状态·现已停止,对比 KS7 过去进行/一般过去)。**主题分歧第五例**:同步 L30~31 讲 状语从句/方向介词(so…that/toward 已在 L30 用尽),L31 主考锚定教材 **used to do**。
- 裁决(自决未停):used to do 主考(过去习惯 gp1/状态 gp2/否定疑问 gp3/vs一般过去 gp4/vs过去进行 gp5/与现在对比 gp6)+ which 定语从句指物 gp7 / when 时间状语从句 gp8 辅考(均课文①类:a factory which employed…、smiled when…)。
- 词10(retire/company/bicycle/save/workshop/helper/employ/grandson/factory/spare);美语化 aeroplane→airplane、shop→store、postman→mailman 入关6。
- 44题(关5=18[used to 14+which/when 4]/关6=6/关7=4/关8=3/关9=3/关10=10);机器12项🟢(首验红1:s9seq2 解释含"定语"串味→改"修饰句"复验全绿)。seed→`american_am2_seed_unit04.sql`(L25-31=308)。commit 见下。

## ✅ U4 L32《Shopping made easy》(购物变得很方便)· 🟢全绿 · **U4 整单元收官**
- 主教材 Key structures = **as…as / not so…as 同级比较**("People are not so honest as they once were",KS8)+ Part b **量词 much/many↔little/few/a little/a few**。**主题分歧第六例**:同步侧重比较/量词,与教材一致偏多。
- 裁决(自决未停):同级比较 gp1-3(as…as/not so…as/as…as possible)+ 比较级 than gp4 + 最高级 gp5 + 量词 gp6 = 主考;it 形式主语 gp7(it was easier for sb to do)+ 介词+动名词 gp8(without paying)辅考(均课文①类)。
- 词10(once/temptation/article/wrap/simply/arrest/honest/steal/dress/assistant);美语化 shop→store、parcel→package、shop assistant→sales clerk、shopping centre→mall 入关6。
- 44题;机器12项🟢(8条[c]黄警=as…as 题干他处含 as/so,同级比较固有,人工判过;三维闸门元语法=0)。seed→`american_am2_seed_unit04.sql`(**L25-32=352,整单元**)。

# ===== 课程 Unit 5(L33–40)=====

## ✅ U5 L33《Out of the darkness》(冲出黑暗)· 🟢全绿(首验无黄警)
- 主教材 Key structures = **方向/位置介词短语**("Where did he go? He went to the cinema",Compare KS9):to/from、into/out of、for、towards、at,回答 Where / Which direction。
- 裁决(自决):方向介词 gp1-5(to/from·into/out of·for·towards·at)+ 综合选介词 gp6 = 主考;on + 动名词(=as soon as '一…就…',On arriving…)gp7 + that 定语从句可省 gp8 辅考(均课文①类)。
- 词10(darkness/explain/coast/storm/rock/shore/ahead/cliff/struggle/hospital);美语化 towards→toward、in hospital→in the hospital 入关6(+flashlight/torch、fall/autumn 高频美语点)。
- 44题(关5=18[方向介词14+on doing/that 4]/关6=6/关7=4/关8=3/关9=3/关10=10);机器12项🟢首验全绿。seed→`american_am2_seed_unit05.sql`(L33=44,U5起)。

## ✅ U5 L34《Quick work》(破案“神速”)· 🟢全绿
- 主教材 Key structures = **被动语态**("He was asked to call at the station",KS10):主动变被动 be+过去分词。本课覆盖各时态被动——一般过去(was stolen/was picked up)、**现在进行(is being sent,Note6 重点)**、过去完成(had been found)、ask sb to do 的被动(was asked to do)。
- 裁决(自决):被动 gp1-6(主动变被动/一般过去被动/现在进行被动/过去完成被动/be asked to do/by短语)主考;most=very+过去分词 gp7(most surprised)+ too/as well gp8(amused too)辅考(均课文①类)。
- 词10(station/receive/local/wonder/expect/steal/amuse/news/village/most);美语化 policeman→police officer、post→mail 入关6(+apartment/elevator 高频)。
- 44题;机器12项🟢(首验红1:s5#12 stem 含箭头"→"泄漏[a]→改直填复验全绿;2条[c]黄警=被动/不定式 cloze 他处含 to/was,人工判过;三维闸门元语法=0)。seed→`american_am2_seed_unit05.sql`(L33-34=88)。

## ✅ U5 L35《Stop thief!》(捉贼!)· 🟢全绿 · **复习课**
- 主教材 Key structures = **Review KS26-34**(时态语态综合复习:一般现在 These things always happen / 一般过去 What happened / 现在完成 has not regretted / used to drive / 被动 were arrested)。类比 L11 复习课处理。
- 裁决(自决):时态语态综合 gp1-6(现在/过去/完成/used to/被动/综合选)主考;far/much+比较级 gp7(far more exciting)+ such+a+名词+that gp8(such a fright that)辅考(均课文①类)。
- 词10(while/regret/far/rush/act/straight/fright/battered/shortly/afterward);美语化 shop→store、towards→toward、afterwards→afterward、taxi→cab 入关6。
- 44题;机器12项🟢(首验红1:s9seq2 解释含"主语"串味→改"两个人复数"复验全绿;三维闸门元语法=0)。seed→`american_am2_seed_unit05.sql`(L33-35=132)。

## ✅ U5 L36《Across the Channel》(横渡海峡)· 🟢全绿
- 主教材 Key structure = **be going to**("She is going to swim across the Channel tomorrow",KS12):表打算/计划的将来,替代 will/shall;条件句结果部分用 will 不用 going to。
- 裁决(自决):be going to gp1-3(be形式/接原形/疑问否定)+ will 表将来 gp4 + 将来进行时 gp5(will be watching)+ 综合选将来 gp6 主考;intend/mean to do gp7 + 倒装 Among/On…be gp8 辅考(均课文①类)。
- 词10(record/strong/swimmer/succeed/train/anxiously/intend/solid/channel/rest);关6美英-偏薄(Mr./Mr 标点差 grounded + vacation/candy/movie 高频),⚠️待裁决记美英点薄。
- 44题;机器12项🟢(首验红1:s9seq1 解释含"主语"串味→改措辞;另 s5#18 集合名词 crowd+were 陷阱黄警→改 On the coast+plural 规避,复验全绿;三维闸门元语法=0)。seed→`american_am2_seed_unit05.sql`(L33-36=176)。

## ✅ U5 L37《The Olympic Games》(奥林匹克运动会)· 🟢全绿(首验无红)
- 主教材 Key structures = **将来完成时**("Workers will have completed the new roads by the end of this year",KS13):will have+过去分词,表到将来某时刻已完成(by+时间点 / in…time),对比一般将来(will finish)与将来进行(will be building)。
- 裁决(自决):将来完成 gp1-4(will have+过分/by时间点/in…time/对比一般将来)+ 将来进行 gp5 + 将来被动 gp6 主考;look forward to+动名词 gp7(to是介词)+ as=因为/当 gp8 辅考(均课文①类)。
- 词10(Olympic/hold/government/immense/stadium/standard/capital/fantastic/design/complete);美语化 railway→railroad 入关6(+highway/subway/downtown 城建交通词)。
- 44题;机器12项🟢首验全绿。seed→`american_am2_seed_unit05.sql`(L33-37=220)。

## ✅ U5 L38《Everything except the weather》(唯独没有考虑到天气)· 🟢全绿
- 主教材 Key structures = **过去完成时**("He acted as if he had never lived in England before",KS14):had+过去分词,过去的过去,before/after/when/until 时间从句,与一般过去对比。
- 裁决(自决):过去完成 gp1-5(had+过分/vs一般过去/before-after/until-as soon as/过去的过去)+ no sooner…than/hardly…when gp6(主句过去完成)主考;as if+过去完成 gp7 + even though gp8 辅考(均课文①类)。
- 词10(except/Mediterranean/complain/continually/bitterly/sunshine/settle/shock/bear/dream);关6美英-偏薄(文本无独特美英词),用 fall/gas/cookie/garbage 高频通用,⚠️待裁决记。
- 44题;机器12项🟢(首验红1:s10#4 括号"as if"泄漏答案 as→改措辞;3条[c]黄警=过去完成 cloze 他处含 had,人工判过;三维闸门元语法=0)。seed→`american_am2_seed_unit05.sql`(L33-38=264)。⏭️ L39。

## ✅ U5 L39《Am I all right?》(我是否痊愈?)· 🟢全绿
- 主教材 Key structures = **间接引语**("He said that… He told me… He asked…",KS15):say/tell+that、ask if/whether、ask+疑问词 when/why、时态后移(will→would/have→had)、疑问转述用陈述语序。
- 裁决(自决):与 L15(间接引语)**分工**——L39 侧重**疑问句转述**(ask if/whether/疑问词+陈述语序)。间接引语 gp1-6 主考;ask sb to do/refuse to do/be allowed to do gp7-8 辅考(均课文①类)。
- 词10全用官方(operation/successful/following/patient/alone/exchange/inquire/certain/caller/relative);关6美英=in the hospital/call/busy/elevator(电话·医院主题)。⚠️ 串味坑:META_STEM 正则含"疑问句用"→gp6 hint 改"动词跟在主语后"避误红。
- 44题;机器12项🟢(1条[c]黄警=cloze 空3从句含 would、与空4答案 would 不同句,人工判过;三维闸门元语法=0)。seed→`american_am2_seed_unit05.sql`(L33-39=308)。⏭️ L40(U5末课)。

## ✅ U5 L40《Food and talk》(进餐与交谈)· 🟢全绿(零黄警)· **U5 末课**
- 主教材 Key structures = **虚拟条件句/非真实条件**("If you ate more and talked less, we would both enjoy our dinner!",KS16):if + 过去式, would + 动词原形;be 一律用 were;与真实条件(if + 现在时→will/祈使句)对比。
- ⚠️ **坑已避**:课文注释5 说"Will you be seeing it 用将来进行时委婉",易误判主考=将来进行时;实读 Key structures 页(印183)确认主考=**虚拟条件**(KS16),将来进行时只是课文①类。**铁律:主考以 Key structures 页为准,别被 Notes 带偏**。
- 裁决(自决):虚拟条件 gp1-3(if过去式/would原形/be用were)+ 真实条件对比 gp4-5 主考;将来进行时 will be+V-ing 委婉 gp6 + ask sb to do gp7 + be busy doing gp8 辅考(均课文①类)。
- 词10(hostess/unsmiling/tight/fix/globe/despair 官方6 + companion/conversation/abroad/plate 补4对齐体量);关6美英=vacation/theater/check/napkin(度假·剧院·晚宴主题)。
- 44题;机器12项🟢**零黄警**(cloze 原 would not talk→refused to talk 规避[c];三维闸门元语法=0)。seed→`american_am2_seed_unit05.sql`(**L33-40=352,U5 整单元 8 课完成**)。

# ===== 课程 Unit 6(L41–48)=====

## ✅ U6 L41《Do you call that a hat?》(你把那个叫帽子吗?)· 🟢全绿(零黄警)
- 主教材 Key structures = **Must, Have to and Need**(KS17):need 需要 / must·have to 必须 / needn't 不必(= don't have to)/ mustn't 禁止;核心难点 **mustn't(禁止)≠ needn't(不必)** + needn't have done(本来不必却做了)。
- 裁决(自决):need/needn't/mustn't/must/have to 主考 gp1-5(mustn't≠needn't 给4题重点辨);regret doing gp6 + remind sb of sth gp7 + remark/observe/notice 辨析 gp8 辅考(均课文/难点①类)。
- ⚠️ **串味坑**:"情态动词/助动词/宾补"是禁词,关6/8/9/10 一律用 must/needn't 原词或"不必/禁止/必须",不写元语法术语。全做成运用题(给情景选对词),元语法定义题=0。
- 词10(rude/mirror/hole/remark/remind/lighthouse 官方6 + regret/observe/notice/tie 补4,对齐体量+接难点)。关6美英=store/pants/line/closet(服装店·收纳主题)。
- 44题;机器12项🟢**零黄警**。seed→`american_am2_seed_unit06.sql`(**L41=44,U6 起**)。⏭️ L42。

## ✅ U6 L42《Not very musical》(并非很懂音乐)· 🟢全绿(零黄警)
- 主教材 Key structures = **Have**(KS18):own/possess → have / have got 表'拥有';**have + 名词代替普通动词**(have a look / a good time / a drink / a talk)。
- 裁决(自决):have=拥有 gp1 + have got gp2 + have+名词 gp3-4 主考;pick up(拿起/学会/接人)gp5 + pick out(挑选)gp6 + tell the difference between gp7 + as soon as gp8 辅考(均课文/难点 SD6-7 ①类)。
- ⚠️ **美语关键点**:散步/洗澡/休息/看一看,美语多用 **take** a walk/bath/rest/look(BrE 用 have)——正好做成 L42 的 关6 美英对照(高相关,非凑数)。关5 只用 AmE-natural 的 have 搭配(have a good time/drink/talk/lunch/party),**不把 take 当错误干扰项**(那会误判,因 AmE take 也对)。
- 词10全用官方(musical/market/pipe/tune/glimpse/snake/movement/continue/obviously/difference)。关6美英=take a walk/bath/rest/look(have→take 的美语偏好,4张全命中主考)。
- 44题;机器12项🟢(首验红1:s10#3 hint 含答案 have→改"填代替动词的那个词"复验全绿)。seed→`american_am2_seed_unit06.sql`(**L41-42=88**)。⏭️ L43。

## ✅ U6 L43《Over the South Pole》(飞越南极)· 🟢全绿(零黄警)
- 主教材 Key structures = **Can and Be able to**(KS19):can → be able to、将来 will be able to(can 无将来式)、过去 was/were able to;**核心难点 was able to 表'(某一次)成功做到了',此时不能用 could**(课文 plane was able to rise/cleared;was able to fly)。
- 裁决(自决):can/be able to 主考 gp1-4(gp4 成功做成不用 could 给4题重点);run into trouble gp5 + order sb to do gp6 + a great many+复数 gp7 + get over/by gp8 辅考(均课文①类)。
- 词10全用官方(explorer/flight/serious/seem/crash/sack/clear/aircraft/endless/plain)。关6美英=airplane/flashlight/gas/round trip(飞机·探险·旅行主题)。
- 44题;机器12项🟢**零黄警**。seed→`american_am2_seed_unit06.sql`(**L41-43=132**)。⏭️ L44。

## ✅ U6 L44《Through the forest》(穿过森林)· 🟢全绿(零黄警)
- 主教材 Key structures = **动名词 -ing(Gerund)**(KS20):动名词作主语(Eating is a pleasure)、介词后用动名词(keen on cycling / without saying / for not letting)、动词后接动名词(start/keep/enjoy/mind + doing)、动名词的否定(not + doing)。
- 裁决(自决):动名词 gp1-4 主考;so…that/such…that gp5 + need+doing(被动含义)gp6 + run after/catch up with gp7 + out of breath gp8 辅考(均课文①类)。
- 词10(forest/risk/picnic/edge/strap/possession/breath/contents/mend 官方9 + fright 补1)。关6美英=purse/cookie/candy/sneakers(野餐·追逐主题)。
- 44题;机器12项🟢**零黄警**。seed→`american_am2_seed_unit06.sql`(**L41-44=176**)。⏭️ L45。

## ✅ U6 L45《A clear conscience》(问心无愧)· 🟢全绿(零黄警)· **复习课**
- 主教材 Key structures = **Review KS10/21/34 复习被动语态(the passive)**:各时态被动(was built 一般过去、had been sent 过去完成)、情态被动 must be/have been done(对过去推测:must have been found)、主动↔被动、by 引出执行者。
- 裁决(自决):被动复习 gp1-5 主考(情态被动 must have been done 给4题重点);while+doing gp6 + in time gp7 + a large sum of/in this way gp8 辅考(均课文①类)。分工:L34(U5)首讲被动各时态;L45 复习+侧重情态被动/主被动转换。
- 词10(clear/conscience/wallet/savings/villager/percent 官方6 + thief/honest/note/wrap 补4)。关6美英=zip code/bill/mail/**percent**(邮局·钱主题;**percent 一词=美语,per cent 两词=英式**,课文原文已美语化)。
- 44题;机器12项🟢(首验红2:s5#10/#11 主动变被动含箭头"→"→改"把X改成被动"措辞;2条[c]黄警=cloze"He was sure"撞被动 was→改 felt sure 规避,复验零黄警)。seed→`american_am2_seed_unit06.sql`(**L41-45=220**)。⏭️ L46。

## ✅ U6 L46《Expensive and uncomfortable》(既昂贵又受罪)· 🟢全绿(零黄警)
- 主教材 Key structures = **动词/形容词 + 介词搭配**(verb + to/at/for/with,复习 KS22):belong/occur/confine **to**、astonished/surprised/arrive **at**、account/pay/wait **for**、agree/cope/satisfied **with**。
- 裁决(自决):四组 verb+prep gp1-4 主考(各3题);so…that gp5 + admit+doing gp6 + be ordered/confined to gp7 + a number of gp8 辅考(均课文①类)。"X 后面用哪个介词"=运用题(填真句介词),非元语法定义(哪个≠哪类/种,不触 META 闸),元语法定义题=0。
- 词10(unload/extremely/occur/astonish/pile/discover/admit/confine/normal/goods)。关6美英=baggage/sweater/one-way ticket/restroom(机场·服装主题)。
- 44题;机器12项🟢(首验1条[c]黄警=s5#2"occurred to…to open"两个 to→改 that 从句规避,复验零黄警)。seed→`american_am2_seed_unit06.sql`(**L41-46=264**)。⏭️ L47。

## ✅ U6 L47《A thirsty ghost》(嗜酒的鬼魂)· 🟢全绿(零黄警)· **综合复习课**
- 主教材 Key structures = **Review KS36–45(综合复习)**:be going to/将来完成时/过去完成·as if/间接引语/虚拟条件/must·have to·need/have/can·be able to/被动。
- 裁决(自决):以本课"嗜酒鬼魂"故事最突出的 **must have done(对过去推测)** 为核心 gp1(×4);被动 had been done gp2 + 间接引语 gp3 + be going to gp4 + 将来完成时 gp5 + 虚拟条件 gp6 + as if gp7 + be able to gp8 串讲复习(每点2-1题)。全运用题,元语法定义题=0。
- 词10(thirsty/ghost/haunt/block/furniture/whisky/suggest/shake/accept 官方9 + noise 补1)。关6美英=bar/whiskey/apartment/faucet(酒馆·房产主题;**bar=美语 pub、whiskey=美语拼**)。
- 44题;机器12项🟢**零黄警**。seed→`american_am2_seed_unit06.sql`(**L41-47=308**)。⏭️ L48(U6末课)。

## ✅ U6 L48《Did you want to tell me something?》(你想对我说什么吗?)· 🟢全绿 · **U6 末课**
- ⚠️ 本课**无 Key structures 页**——难点页是 **Special difficulties: Review SD26-45(易混词辨析 Words often confused)**。故主考=间接引语疑问句(ask whether/how,课文核心,呼应 L39)+ 易混词辨析(SD26-45 复习)。
- 裁决(自决):间接引语 gp1-2(whether/if + how/what+陈述语序);易混词 too/very gp3、steal/rob gp4、which/who gp5、continuously/continually gp6、past/passed gp7、deny/refuse gp8。全运用题(选正确词/形式),元语法定义题=0。
- 词10(pull/collect/collection/nod/meanwhile 官方 + dentist/tooth/tongue/worried/hole 补)。关6美英=cotton balls/candy/drugstore/dentist's office(牙医·药棉主题;**cotton balls=美语、cotton wool=英式**)。
- 44题;机器12项🟢(首验红1:s9seq2 解释含"主语"串味→改"不再倒装/陈述语序"复验全绿)。seed→`american_am2_seed_unit06.sql`(**L41-48=352,U6 整单元 8 课完成**)。

# ===== 课程 Unit 7(L49–56)= 教材 Unit 3 起 =====

> ⚠️ **教材 Unit 3(L49–72)格式变化**:每课=短文 + Summary writing(理解题)+ Composition,**无每课独立 Key structures 页**;语法在**单元层面统一**=用从属连词(when/as/while/because/although/until/after)把简单句连成**复合句**。每课主考按该课短文实际用到的连词定,schema 不变(仍 44 题),grammar_focus 从单元语法+课文连词导出。

## ✅ U7 L49《The end of a dream》(美梦告终)· 🟢全绿(零黄警)· **教材 Unit 3 首课**
- 主考(教材 Unit 3 复合句连词)= 课文实际用到的:because 原因、when 时间、although 让步、not…until 直到才、after 先后。
- 裁决(自决):连词 gp1-5 主考;be tired of gp6 + save up/blow up gp7 + send sth doing gp8 辅考(均课文①类)。全运用题(选正确连词),元语法定义题=0。
- 词10(tired/owner/mattress/gust/sweep/courtyard/smash/miraculously/unhurt/promptly)。关6美英=yard/first floor/apartment/closet(院子·住房主题);美语化 Teheran→Tehran、on to→onto。
- 44题;机器12项🟢**零黄警**。seed→`american_am2_seed_unit07.sql`(**L49=44,U7 起**)。⏭️ L50。

## ✅ U7 L50《Taken for a ride》(乘车兜风)· 🟢全绿(零黄) · 教材 Unit 3
- **⚠️ 主考修正**:初稿误把连词/疑问词不定式当主考;实读 L50 Key structures 页(doc276-277)后按**主考铁律**改正——**主考=KS26 一般现在时表习惯性动作 + 状态动词(belong to/consist of/contain/desire/detest/dislike/hate/hope/love/matter/mean/mind/need/want/wish)不用进行时**;Special difficulties **SD26 易混词 lose/loose/miss、expect/wait for**。
- 裁决(自决):gp1 状态动词一般现在(6题)+ gp2 习惯 vs 正在进行(4题)= KS26 主考;gp3 lose/loose/miss + gp4 expect/wait for = SD26 主考级辅;gp5 疑问词+不定式 + gp6 prefer to do/take sb for a ride = 课文 Notes 辅考。全运用题,元语法定义题=0。cloze 用教材 SD26 Exercise B(prefer/understand/mean/know 状态动词一般现在)。
- 词10(ride/excursion/conductor/view/prefer/passenger/countryside/shock/expect/matter;expect 正好是 SD26 考点)。关6美英=subway/sidewalk(交通街道主题)+contrast round trip·gas;美语化 travelling→traveling。
- 44题;机器12项🟢**零黄警**。seed→`american_am2_seed_unit07.sql`(**L49+L50=88**)。⏭️ L51。

## ✅ U7 L51《Reward for virtue》(对美德的奖赏)· 🟢全绿(零黄) · 教材 Unit 3
- 主考(实读 Key structures 页 doc280-281)= **KS27 What happened? 一般过去时**(过去发生的动作;不规则过去式 got/began/wrote/paid/rang/led/hid + 过去被动 was sent/was burnt)。Special difficulties **SD27 易混动词 raise/rise、lay/lie、beat/win**。
- 裁决(自决):gp1 一般过去时不规则过去式(6题)+ gp2 过去被动(2题)= KS27 主考;gp3 raise/rise + gp4 lay/lie + gp5 beat/win = SD27 主考级辅;gp6 so…that 结果 + go on a diet = 课文辅考。全运用题,元语法定义题=0。cloze 用教材 Exercise B(paid/rang/led/hid 不规则过去式)。
- 词10(reward/virtue/diet/forbid/hurriedly/embarrass/guiltily/strict/occasionally + 补 parcel)。关6美英=candy/cookie(节食/食物主题)+contrast potato chips·dessert;美语化 passage sweets→candy(两处)。
- 44题;机器12项🟢**零黄警**。seed→`american_am2_seed_unit07.sql`(**L49+L50+L51=132**)。⏭️ L52。

## ✅ U7 L52《A pretty carpet》(漂亮的地毯)· 🟢全绿 · 教材 Unit 3
- 主考(实读 Key structures 页 doc283-284)= **KS28 现在完成时(have done,完成/次数/结果)vs 现在完成进行时(have been doing,一直在进行)**。Special difficulties **SD28 形容词与副词辨析**(sings beautifully、works slowly + hard≠hardly、late≠lately、high≠highly、near≠nearly)。
- 裁决(自决):gp1 现在完成时(4)+ gp2 现在完成进行时(4)+ gp3 两者对比(2)= KS28 主考;gp4 形容词vs副词(3)+ gp5 易混副词 hard/hardly·lately(3)= SD28 主考级辅;gp6 get…in order/make matters worse/spare time(2)= 课文辅考。全运用题,元语法定义题=0。
- 词10(temporarily/inch/space/actually + 补 bookcase/gaze/surprise/spare/order/rather)。关6美英=elevator/apartment(房子主题)+contrast first floor·closet;passage 无需美语化(已 AmE)。
- 44题;机器12项🟢(1黄=s5#14 "hard worker→works hard" 是 SD28 形/副对照的教学句式,人工核合法)。seed→`american_am2_seed_unit07.sql`(**L49-L52=176**)。⏭️ L53。

## ✅ U7 L53《Hot snake》(触电的蛇)· 🟢全绿 · 教材 Unit 3
- 主考(实读 Key structures 页 doc288-289)= **KS29+KS52 三种时态综合复习**:一般过去时(What happened)/ 现在完成时(What has happened)/ 现在完成进行时(What has been happening),核心=看时间标志(ago/yesterday→过去;ever/just→完成;since/for→完成进行)选时态。Special difficulties = **易混词 throw to/at/away、quite/quiet、cause/reason、drop/fall**。
- 裁决(自决):gp1 一般过去(3)+ gp2 现在完成(3)+ gp3 现在完成进行(3)+ gp4 三时态看标志选(3)= KS 主考;gp5 throw to/at/away(3)+ gp6 quite/quiet·drop/fall(3)= SD 辅考。全运用题,元语法定义题=0。
- **词表13词全收**(hot/fireman/cause/examine/accidentally/remains/wire/volt/power line/solve/mystery/snatch/spark),守零遗漏铁律不截断。关6美英=flashlight/firefighter(火/电主题)+contrast kerosene·outlet。
- 44题;机器12项🟢**零黄警**。seed→`american_am2_seed_unit07.sql`(**L49-L53=220**)。⏭️ L54。

## ✅ U7 L54《Sticky fingers》(粘糊的手指)· 🟢全绿 · 教材 Unit 3
- 主考(实读 Key structures 页 doc292-293)= **KS30 冠词 a/an/the 与 some/any 综合复习**:some(肯定)/any(疑问否定)、a/an 泛指、the 特指、**the+形容词表一类人**(the rich/the poor/the deaf/the blind)、the+最高级 vs most(大多数)、零冠词固定短语(go to school/at work)vs the(go to the cinema)。**本课无独立 Special difficulties 页**(KS30 内含 SD9 some/any 引用)。
- 裁决(自决):gp1 some/any(4)+ gp2 a/an(3)+ gp3 the/the+形容词(3)+ gp4 零冠词vs the(3)+ gp5 the+最高级/most(2)= KS30 主考;gp6 no sooner…than/what a mess/ring back(3)= 课文辅考。全运用题,元语法定义题=0。
- **词表14词全收**(sticky/finger/pie/mix/pastry/annoying/receiver/dismay/recognize/persuade/mess/doorknob/sign/register)。关6美英=mailman/faucet(家/邮件主题)+contrast mail·zip code。
- 44题;机器12项🟢(1黄=s5#10 "the deaf and the blind" 是 the+形容词并列的教学句式,人工核合法)。seed→`american_am2_seed_unit07.sql`(**L49-L54=264**)。⏭️ L55。

## ✅ U7 L55《Not a gold mine》(并非金矿)· 🟢全绿 · **净化包生产**(2026-07-05)
- **背景**:原课文 PDF 读取被内容过滤**误判**(纯 false positive,内容无害);Aaron+网页版 Claude 核查 p260-262 后出**净化生产包**,CC 用干净素材生产,**未读源 PDF**。
- 主考 = **KS31 would/used to 表过去习惯**(would 过去反复动作、used to 过去习惯/状态、状态只能 used to)。SD = **used to do / be used to doing / be used to do 三辨析 + gold vs golden**。
- 素材=授权改写课文(Danny 爸爸买金属探测器 The Revealer 在后院找海盗埋的金子、挖遍院子一无所获),保全考点(would/used to、be used to detect 被动、All that glitters is not gold、golden memory)。
- 裁决:gp1 would(3)+ gp2 used to(3)+ gp3 would vs used to(3)= 主考;gp4 used三结构(4)+ gp5 gold/golden(3)+ gp6 dig/bury 过去式(2)= 辅考。全运用题,元语法定义题=0。
- **词表13词全收**(gold/mine/detect/metal/rock/pirate/treasure/bury/dig/hole/deep/golden/opportunity;网页版原漏 rock/deep/opportunity,CC 补回)。关6美英=backyard/parking lot(后院/挖掘主题)+contrast flashlight·trash can。
- 44题;机器12项🟢(3黄=s5#14 gold材质题、s7 cloze used to/gold 复现,人工核合法)。seed→`american_am2_seed_unit07.sql`(**U7 补齐 L49-L56=352**)。

## ✅ U7 L56《Faster than sound!》(比声音还快!)· 🟢全绿 · 教材 Unit 3
- 主考(实读 Key structures 页 doc300-301)= **KS32 数量词与比较**:as…as / not as…as、**little·few(否定)vs a little·a few(肯定)**、a lot of / a great deal of(不可数)/ a great many(可数)、the same as / different from。Special difficulties **SD 易混词 handsome/beautiful/pretty/good-looking、reach(接地点/速度)/ arrive in·at**。
- 裁决(自决):gp1 as…as(3)+ gp2 a lot of/a great deal of/a great many(4)+ gp3 little·few vs a little·a few(4)+ gp4 same as/different from(2)= KS32 主考;gp5 handsome·pretty/reach·arrive(3)+ gp6 break down/过去分词状语(2)= SD+课文辅考。全运用题,元语法定义题=0。
- 词表11词全收(sound/excitement/handsome/Rolls-Royce/Benz/wheel/explosion/course/rival/speed/downhill)。关6美英=trunk/windshield(汽车主题)+contrast hood·gas;different from 用美语标准搭配(非英式 different to)。
- 44题;机器12项🟢(3黄=s5#1/2/3 as…as 两个 as 同现,教学结构必然,人工核合法)。seed→`american_am2_seed_unit07.sql`(**U7 整单元 L49-L56=352**,含 L55 净化包)。⏭️ L57(U8)。

# ===== 课程 Unit 8(L57–64)= 教材 Unit 3 续 =====
> Unit 3(L49-72)后段;每课仍有自己的 KS/SD 页,逐课渲染定主考(除误判课走净化包)。seed→`american_am2_seed_unit08.sql`。

## ✅ U8 L57《Can I help you?》(有什么需要帮忙的吗?)· 🟢全绿(零黄) · **净化包生产**(2026-07-05)
- **背景**:原课文 PDF 读取内容过滤**误判**(纯 false positive,势利店员讽刺小故事);Aaron+网页版 Claude 出净化生产包,CC 用干净素材生产,**未读源 PDF**。
- 主考 = **KS9+KS33 介词 at/in/off/with 综合复习**(at 某一点、in 之内/穿着、off 离开脱落、with 带有拿着)。SD = **make/let sb do**(使役动词后接不带 to 的动词原形)。
- **⚠️ unit_no 自决修正**:净化包写 unit_no=7,但按课程 8课/单元 分组(U7=L49-56 已收 352),L57 应属 **U8** → CC 改 unit_no=8、落 `american_am2_seed_unit08.sql`(否则 U7 会变 9 课破坏分组)。已报 Aaron。
- 裁决:gp1 at(3)+ gp2 in(4)+ gp3 off(3)+ gp4 with(3)= KS 主考;gp5 make/let sb do(3)+ gp6 the way 从句/into(2)= SD+课文辅考。全运用题,元语法定义题=0。
- 美语化:store(非 shop)/salesclerk(非 shop assistant)/purse(非 handbag),去英式 madam 称呼。词表13词全收。关6美英=store/purse(购物主题)+contrast salesclerk·pants。
- 44题;机器12项🟢**零黄警**。seed→`american_am2_seed_unit08.sql`(**L57=44**)。⏭️ L58。

## ✅ U8 L58《A blessing in disguise?》(是因祸得福吗?)· 🟢全绿 · 教材 Unit 3
- 主考(实读 Key structures 页 doc308-309)= **KS34 被动语态综合**:各时态被动(was planted 过去/is being sent 进行/has been found 完成)+ **be said to / It is said that 转述被动** + **双宾语被动**(I was given a pen)。Special difficulties **易混动词 increase/grow、gain/earn、pick/cut**。
- 裁决:gp1 一般/过去被动(3)+ gp2 进行/完成被动(3)+ gp3 be said to/It is said that(3)+ gp4 双宾语被动(2)= KS34 主考;gp5 increase·grow/gain·earn/pick·cut(4)+ gp6 have sth done/it 强调句/a blessing in disguise(3)= SD+课文辅考。全运用题,元语法定义题=0。
- **词表16词全收**(blessing/disguise/tiny/possess/cursed/increase/plant/church/evil/reputation/claim/victim/vicar/source/income/trunk)。关6美英=fall/bill(季节/收入主题)+contrast downtown·vacation。
- 44题;机器12项🟢(初版 s5#10/11 双宾语被动用了箭头→触发泄漏[a],改成独立被动句去箭头后全绿)。seed→`american_am2_seed_unit08.sql`(**L57+L58=88**)。⏭️ L59。

## ✅ U8 L59《In or out?》(进来还是出去?)· 🟢全绿 · 教材 Unit 3
- 主考(实读 Key structures 页 doc312-313)= **Review KS50-58 时态综合复习**(一般现在习惯/一般过去/现在完成/现在完成进行/would·used to 过去习惯/被动·is said to)。Special difficulties **SD 表目的的多种方式**(to do、in order to、so as (not) to、so that、in order that、for sb to do)。
- 裁决:gp1 一般现在·过去(3)+ gp2 现在完成·完成进行(3)+ gp3 would/used to(2)+ gp4 被动/转述被动(3)= 时态复习主考;gp5 表目的多方式(4)+ gp6 every time/so…that/expert at(3)= SD+课文辅考。全运用题,元语法定义题=0。
- 美语化:garden→yard、neighbours→neighbors。词10(bark/press/paw/latch/expert/develop/habit/remove + 补 annoyed/neighbor)。关6美英=yard/neighbor(院子/拼写主题)+contrast trash·line。
- 44题;机器12项🟢(1黄=s5#12 "ran to the station...to catch" 两个 to 不同,人工核合法)。seed→`american_am2_seed_unit08.sql`(**L57-L59=132**)。⏭️ L60。

## ✅ U8 L60《The future》(卜算未来)· 🟢全绿 · 教材 Unit 3
- 主考(实读 Key structures 页 doc316-317)= **KS36+KS16 表将来的几种方式**:will/be going to、**现在进行时表已安排好的将来**(is arriving tomorrow)、**时间/条件状语从句用一般现在时表将来**(the moment you leave / if it rains / when he returns,主句 will)。Special difficulties **SD 名词作定语/复合名词**(the fair in the village→village fair、a card for Christmas→Christmas card)代替 of 短语。
- 裁决:gp1 will(2)+ gp2 be going to(2)+ gp3 现在进行表将来(3)+ gp4 状语从句一般现在表将来(5)= KS 主考;gp5 名词作定语(4)+ gp6 the moment/intend to/rush towards(2)= SD+课文辅考。全运用题,元语法定义题=0。
- 词10(future/fair/fortune-teller/crystal/relation/impatiently + 补 tent/surprise/rush/intend)。关6美英=movie/carnival(集市/娱乐主题)+contrast sweater·mom。
- 44题;机器12项🟢(初版 s9seq2/3 解释含"状语从句/定语"串味,改写去术语后全绿)。seed→`american_am2_seed_unit08.sql`(**L57-L60=176**)。⏭️ L61。

## ✅ U8 L61《Trouble with the Hubble》(哈勃望远镜的困境)· 🟢全绿 · 教材 Unit 3
- 主考(实读 Key structures 页 doc320)= **KS37 表将来的三种时态**:①将来进行时 will be doing(will be sending/taking、I will be writing letters all day tomorrow)②将来完成时 will have done(will have repaired、by the time you read this…will have sent、KS60c He will have arrived by this time tomorrow)③将来完成进行时 will have been doing(by Friday they will have been working for seven days)。Special difficulties **SD 易混词 cost/price/value**:名词(cost of living/ask the price/sentimental value)+ 动词(What does it cost?/I value your advice)。
- 裁决:gp1 将来进行(4)+ gp2 将来完成(4)+ gp3 将来完成进行(2)+ gp4 时间从句用现在/现在完成表将来(3,by the time you read/the moment he has arrived/as soon as he has received)= KS37 主考;gp5 cost/price/value 名词(3)+ gp6 动词(2)= SD 辅考。全运用题,元语法定义题=0。
- **词17全收**(零遗漏:Hubble/telescope/launch/space/NASA/billion/faulty/astronaut/shuttle/Endeavour/robot-arm/grab/atmosphere/distant/galaxy/universe/eagle eye,含3专名)。关6美英=bill/note(钞票)+check/bill(账单,呼应 cost 主题)+elevator·apartment;chunks=right from the start/at a cost of/a great deal/put…right。
- 44题;机器12项🟢一次过。seed→`american_am2_seed_unit08.sql`(**L57-L61=220**)。⏭️ L62。

## ✅ U8 L62《After the fire》(大火之后)· 🟢全绿 · 教材 Unit 3
- ⚠️ content filtering 第3次误拦(L55/L57/L62,均为含 fire/pirates/punish 等词的无害老课文)。**本课我实际未被拦**——完整读到源 doc323-326;Aaron 净化包随后到,与我从源提取的考点/词表**完全一致**(KS38+同 SD 三组+同15词),仅额外指定 firemen→firefighters 美语化。已按包对齐。
- 主考(源 doc324 = Key structures)= **KS38 过去完成时(had done)vs 过去完成进行时(had been doing)**:had done 看结果/完成(had covered/had already taken root/had lost)、had been doing 看过程/持续(had been fighting for 3 weeks/had been planting for a month/had been growing for centuries),含宾语从句 I asked what he had lost/had been doing。Special difficulties **SD 三组易混词 control/check、great/big、soil/ground**。
- 裁决:gp1 过去完成(4)+ gp2 过去完成进行(3)+ gp3 宾语从句中的完成(2)= KS38 主考;gp4 control/check(3)+ gp5 great/big(3)+ gp6 soil/ground(3)= SD 辅考。全运用题,元语法定义题=0。
- **词15全收**(control/smoke/desolate/threaten/surrounding/destruction/flood/authority/grass-seed/spray/quantity/root/century/patch/blacken)。美语化 firemen→**firefighters**、aeroplanes→**airplanes**;关6美英=firefighter/fireman+airplane/aeroplane+truck/lorry+gas/petrol;chunks=under control/take root/in place of/wash away。
- 44题;机器12项🟢。seed→`american_am2_seed_unit08.sql`(**L57-L62=264**)。⏭️ L63。

## ✅ U8 L63《She was not amused》(她并不觉得好笑)· 🟢全绿 · 教材 Unit 3
- 主考(源 doc328 = Key structures)= **KS15+KS39 间接引语**:①陈述句 said/told that + 时态后移(want→wanted)②祈使句/请求 ask/tell sb (not) to do③insist/suggest that…should④疑问句转述用陈述语序(一般疑问 if/whether、特殊疑问保留 wh-)。Special difficulties(源 doc329 exercise D)= **间接疑问句 I wonder if/when/why + 陈述语序** + 转述时人称/时间地点指示词相应变化(you→me、now→then、here→there、come→go)。
- 裁决:gp1 祈使/请求转间接(4)+ gp2 陈述转间接(3)+ gp3 insist/suggest that should(2)= 主考;gp4 间接一般疑问 if(3)+ gp5 间接特殊疑问 wh-(3)+ gp6 指示词变化(3)= 辅考。全运用题,元语法定义题=0。
- ⚠️ **本课特有坑**:间接引语题天然是"直接→间接"转换,初版 stem 用箭头 → 触发泄漏闸[a]红;已全部改写为**冒号引导 + 单句填空**(转述 'X':间接句 ___),并从括号提示去掉答案词(should/if),泄漏 a/b 清零。此坑固化:凡间接引语/句型转换课禁用 → 箭头,改冒号+单句。
- 词10(官方6:circle/admire/close/wedding/reception/sort;补4 humor/speech/popular/amuse——官方词表仅6词,按词表铁律补足至~10)。美语化 humour→**humor**;关6美英=humor/humour+favorite/favourite+color/colour+neighbor/neighbour(-or vs -our 拼写族);chunks=a sense of humor/make a speech/to one's surprise/a circle of friends。
- 44题;机器12项🟢。seed→`american_am2_seed_unit08.sql`(**L57-L63=308**)。⏭️ L64(U8 收官课)。

## ✅ U8 L64《The Channel Tunnel》(海峡隧道)· 🟢全绿 · 教材 Unit 3 · **U8 收官**
- 主考(源 doc332-333 = Key structures)= **KS16+KS40 真实与非真实条件句**:①真实(if+一般现在→will/shall,If it is fine we shall go)②与现在相反(if+过去式/be→were→would+原形,If I were you I would…)③与过去相反(if+had done→would have done,If the British had not feared invasion it would have been completed)+ suggest/demand that…should(虚拟)。Special difficulties(源 doc333)= **SD 短语动词 draw 辨析**:draw in 吸入 / draw back 退回 / draw off 开走 / draw up 停下·拟定签订(drawn up)。
- 裁决:gp1 真实条件(3)+ gp2 与现在相反(3)+ gp3 与过去相反(4)+ gp4 suggest/demand should(2)= 主考;gp5 draw in/back/off(3)+ gp6 draw up 双义(3)= SD 辅考。全运用题,元语法定义题=0。
- ⚠️ leak[b]坑复现:条件句题里"be 用 were""主句用 would have"写进括号提示=直给答案红;已改"be 动词用特殊虚拟形式""用完成体的虚拟形式",泄漏清零。
- 词13全收(tunnel/port/ventilate/chimney/sea level/double/ventilation/fear/invasion/officially/connect/European/continent)。美语化 centre→**center**、railway→**railroad**;关6美英=center/centre+railroad/railway+subway/underground+elevator/lift(交通基建族);chunks=put forward/serve as/above sea level/connect…to。
- 44题;机器12项🟢。seed→`american_am2_seed_unit08.sql`(**L57-L64=352,整单元8课齐**)。

## 🎯 U8(L57–L64)批次汇报 · 整单元完成
- **8课全绿**:L57 KS9+33介词(净化包)/ L58 KS34被动语态综合+双宾被动 / L59 Review时态综合+SD表目的 / L60 KS36+16表将来 / L61 KS37三种将来时态 / L62 KS38过去完成vs过去完成进行(净化包)/ L63 KS15+39间接引语 / L64 KS16+40真实与非真实条件句+虚拟。
- seed=`american_am2_seed_unit08.sql` 期望 **+352**(8课×44),已同步 _RUN_ME 第8行。
- 含2次 content-filter 净化包(L57/L62);L62 我本地实读源未被拦、与净化包完全一致。
- **真机抽验指定2课**:①**L62**(净化包生产+过去完成时态对比,验听力音频/时态题呈现)②**L64**(虚拟语气三型+draw短语动词,验条件句题干与SD辨析呈现)。
- ⏭️ L65 起进教材 Unit 3 后段(课程 U9,L65-72)。

# ===== 课程 Unit 9(L65–72)=====

## ✅ U9 L65《Jumbo versus the police》(小象对警察)· 🟢全绿 · 教材 Unit 3
- 主考(源 doc336-337 = Key structures)= **KS17 must/have to/should/ought to** + **should have done / ought to have done(过去本应做而没做)**:must/have to=必须(过去义务用 had to,must 无过去式)、should/ought to=应该、should/ought to have done=懊悔本该做没做(He should have known / ought to have gone)。Special difficulties(源 doc337)= **3组**:短语动词 let off/down/in/out、agree to do vs accept sth、dress up as vs dress。
- 裁决:gp1 must/have to/had to(3)+ gp2 should/ought to(2)+ gp3 should/ought to have done(4)= KS17 主考;gp4 let 短语动词(3)+ gp5 agree/accept(3)+ gp6 dress up/dress(3)= SD 辅考。全运用题,元语法定义题=0。
- 词12(官方9:versus/Christmas/circus/present/accompany/approach/ought/weigh/fortunate;补3 elephant/arrest/traffic——官方仅9词补足至~12)。美语化 Father Christmas→**Santa Claus**、honour→**honor**;关6美英=Santa Claus/Father Christmas+honor/honour+candy/sweets+cookie/biscuit;chunks=set off/hold up the traffic/let…off/dress up as。
- 44题;机器12项🟢一次过。seed→**新建 `american_am2_seed_unit09.sql`**(**L65=44**)。⏭️ L66。

## ✅ U9 L66《Sweet as honey!》(像蜜一样甜!)· 🟢全绿 · 教材 Unit 3
- ⚠️ content-filter 第4次误拦(L55/L57/L62/L66);触发词=课文 "Lancaster **bomber**"(军用轰炸机)+crash/wreck 军事联想。**本课我实读源 doc339-341 未被拦**;Aaron 净化包随后到,做了2项**正确决策**我照采:①bomber→**old airplane** 中性化(去军事触发词,故事/考点不变)②SD 集合名词改**美语单数**(教材 SD 原是英式 team are/audience were=错误语域,美语课程一律单数)。
- 主考(源 doc340 = Key structures)= **KS18+KS42 使役结构 have sth done**:have + 物 + 过去分词=请/让别人做(had the plane packaged、have my car washed、had his hair cut、have it restored/rebuilt);否定疑问借 do/did。Special difficulties(源 doc341→净化包改写)= **集合名词主谓一致·美语单数**(team/group/audience/crew/government + is/was/has,附📌美语语域注,不出英式复数陷阱题)。
- 裁决:gp1 have sth done 请人做vs自己做(4)+ gp2 否定疑问(3)+ gp3 各时态(3)+ gp4 生活场景(2)= 主考12;gp5 集合名词作整体单数(3)+ gp6 不同名词/时态单数(3)= SD 辅考6。全运用题,元语法定义题=0。
- **词20全收**(净化包表:remote/Pacific/damage/wreck/rediscover/aerial/survey/rescue/package/enthusiast/restore/imagine/packing case/colony/bee/hive/preserve/beeswax/engine/condition;Lancaster/bomber 因中性化不入表)。关6美英=trunk/boot+hood/bonnet+wrench/spanner+airplane/aeroplane(汽车机械族);chunks=have sth done/break open/in perfect condition/turn…into。
- 44题;机器12项🟢(1黄=cloze上下文另一 had,人工核过)。seed→`american_am2_seed_unit09.sql`(**L65-L66=88**)。⏭️ L67。

## ✅ U9 L67《Volcanoes》(火山)· 🟢全绿 · 教材 Unit 3
- 主考(源 doc344-345 = Key structures)= **KS43 can/could·be able to·manage to**:could=一般能力、was able to/managed to=过去"设法做成一件具体难事"(managed to escape/set up/climb)、没能做成=couldn't=wasn't able to=didn't manage to。Special difficulties(源 doc345)= **SD 带 say 与 tell 的短语辨析**:say so/say nothing/said his prayers vs tell the time/tell lies/tell the truth/tell the difference。
- 裁决:gp1 could 能力(2)+ gp2 was able to/managed to 成功做成(4)+ gp3 没能做成 didn't manage to(3)= 主考9;gp4 say 短语(3)+ gp5 tell 短语(3)+ gp6 say/tell 辨析(3)= SD 辅考9。全运用题,元语法定义题=0。
- ⚠️ leak[b]坑复现:say/tell 辨析题括号写"带 say/tell 的短语"=直给答案红;已改"选词:'…的固定说法'"纯语义提示,泄漏清零。此坑固化:词汇辨析题括号禁写候选词本身。
- 词12全收(volcano/active/Kivu/Congo/Kituro/erupt/violently/manage/brilliant/liquid/escape/alive)。关6美英=center/centre+meter/metre+liter/litre+theater/theatre(-er/-re 拼写族);chunks=set up/just in time/spend one's lifetime doing/risk one's life。
- 44题;机器12项🟢。seed→`american_am2_seed_unit09.sql`(**L65-L67=132**)。⏭️ L68。

## ✅ U9 L68《Persistent》(甩不掉的人)· 🟢全绿 · 教材 Unit 3
- ⚠️ content-filter 第5次误拦(L55/57/62/66/68);触发=课文"躲人/甩不掉黏人熟人"(avoid/following)联想。**本课我实读源 doc347-350 未被拦**;Aaron 净化包随后到,**无重大内容改动**(仅措辞中性化=社交喜剧),已采其 sanctioned 课文+10词表。
- 主考(源 doc348-349 = Key structures a-d)= **KS20+KS44 动名词 -ing**:动词+doing(avoid/enjoy/deny/finish)、结构+doing(It's no use/not worth/be busy/prevent from)、动名词逻辑主语(mind my doing)、感官动词 see/hear/smell+doing、go/come+doing。反义疑问句(Note 7)辅考。**无独立 SD 页**,KS 本身覆盖全部 -ing 用法。
- 裁决:gp1 动词+doing(4)+ gp2 结构+doing(4)+ gp3 逻辑主语(2)+ gp4 感官动词+doing(3)+ gp5 go/come+doing(3)+ gp6 反义疑问(2)=18。净化包只列 G1-G5,我按源补回感官动词/go-come(真 KS 内容,防欠覆盖)。全运用题,元语法定义题=0。
- ⚠️ 两坑复现:①反义疑问题括号"前否定→后肯定"含箭头=leak[a]红→改"前面否定,后面就用肯定";②s9解释"逻辑主语"含 banned"主语"→改"my 表示是'我'要做"。均清零。
- 词10(官方3:persistent/avoid/insist + 补7:pretend/wave/fancy/wonder/mind/dentist/waiting room)。关6美英=traveling/travelling+canceling/cancelling+colored/coloured+labeled/labelled(-l- 单双写族);chunks=it's no use doing/would you mind doing/be busy doing/Fancy meeting you here。
- 44题;机器12项🟢。seed→`american_am2_seed_unit09.sql`(**L65-L68=176**)。⏭️ L69。

## ✅ U9 L69《The old car comes back to life》(老爷车重获新生)· 🟢全绿 · **方案B换情节**
- ⚠️ **方案B换情节**(Aaron 2026-07-05 拍板,见 [[am2-filter-risk-plan-l69-96]]):原《But not murder!》驾照版含"谋杀玩笑"触发词=🔴高危。**我实读源已产出并 committed(59d18f07 原版),但按方案B用换情节包替换**:情节换成"博物馆修复古董车"(无害),**原 KS 被动语态综合考点原样承载**。
- 主考=**被动语态综合复习**:一般过去 was made/were built、情态 can/could be/must have been kept、现在完成 has been restored、过去完成 had been kept/stored、过去进行 was being cleaned、完成式非谓语 having been stored、不定式被动 to be restored。原 SD 易混词(advice/practice/amuse)随换情节去掉,聚焦被动(净化包定的范围)。
- 裁决:gp1 一般过去被动(3)+ gp2 情态/推测被动(3)+ gp3 现在完成被动(3)+ gp4 过去完成被动(2)+ gp5 过去进行被动(3)+ gp6 完成非谓语/不定式被动(4)=18。全运用题,元语法定义题=0。
- 词10(净化包表:instruct/acquire/confidence/restore/original/engine/maker/garage/condition/rare;原暴力词 murder 降级不入表)。关6美英=gas/petrol+tire/tyre+trunk/boot+hood/bonnet(汽车族);chunks=come back to life/a great deal of/restore…to/work on。
- 44题;机器12项🟢。seed→`american_am2_seed_unit09.sql`(**L65-L69=220**)。
- ⏸️ **L70 挂起**:风险表标 🔴 换情节包,包未到(网页版陆续给,优先 L69→L70);我本已读源 doc355-357(形容词+介词搭配),但按方案B**不用源产出、等 L70 换情节包**。⏭️ 收到 L70 包即做;期间穿插 ✅/🟢 可读课。

## ✅ U9 L71《A famous clock》(一个著名的大钟)· 🟢全绿 · 🟡试读通过(未被拦)
- 🟡试读课:风险表标 🟡,我试读源 doc359-361**未被拦**,正常读源产出;SD 里 hang/hanged(绞死)按方案B原则降级=只教 hang→hung 悬挂(neutral 例句),hanged 仅认读一句注,不出暴力题。
- 主考(源 doc360 = Key structures)= **Review KS60-69 综合复习**:与过去相反虚拟条件句(passage 核心:Parliament had not been burned down → clock would never have been erected)+ 各时态被动(can be heard/were being built/are connected)+ have sth done(have the clock checked)+ 现在完成/过去完成进行/将来完成。Special difficulties = **SD official/employee/salesclerk(美语 clerk)、hang→hung 悬挂**。
- 裁决:gp1 与过去相反虚拟(3)+ gp2 各时态被动(3)+ gp3 have sth done(2)+ gp4 现在完成/过去完成进行/将来完成(3)= 复习主考11;gp5 official/employee/clerk(3)+ gp6 hang→hung(4)= SD 辅考7。全运用题,元语法定义题=0。
- 词11(官方9:parliament/erect/accurate/official/Greenwich/observatory/check/microphone/tower + 补2 immense/strike)。美语化 shop assistant→**salesclerk/clerk**;关6美英=salesclerk/shop assistant+elevator/lift+first floor/ground floor+apartment/flat;chunks=take one's name from/be responsible for/all over the world/have sth checked。Big Ben/Parliament/Greenwich 系伦敦真实专名(纪实课文),保留。
- 44题;机器12项🟢。seed→`american_am2_seed_unit09.sql`(**L65-69+L71=264**,L70 空缺待换情节包补)。⏭️ L72(✅正常读)。

## ✅ U9 L72《A car called Bluebird》(“蓝鸟”汽车)· 🟢全绿 · ✅正常读源
- ✅净课:风险表标 ✅,试读源 doc363-365 顺利,正常读源产出。是**复习课**:教材 L72 Special difficulties = **Review SD50-71**(经常容易混淆的词复习),整课以词义辨析为主考,配课文语法作辅。
- 主考(源 doc363-365)= **Review SD50-71 易混词**:lose/miss、expect/wait(SD50)+ raise/rise、lie-lay、beat/win(SD51)+ value/cost/price(SD61)+ accept/agree、say/tell、dress up(SD65/67)+ hung(悬挂)、hard/hardly、near/nearly(SD52/71);辅考=**课文过去完成被动**(had been specially built / a mistake had been made)+ 现在完成(have reached)。全词选/时态运用题,元语法定义题=0。
- 裁决:gp1 SD50(3)+ gp2 SD51(3)+ gp3 SD61(3)+ gp4 SD65/67(3)= 易混词主考12;gp5 SD52/71(3)+ gp6 课文完成体被动/主动(3)= 辅考6。
- 词10(官方7:racing/per/Utah/horsepower/burst/average/footstep + 补3 record/specially/disappointed)。美语化:**tyre→tire**、**Father Christmas→Santa Claus**;**British practise/practice 区别按方案降级**——美语课只教 practice 一种拼法(名词动词同形),grammar_card 加📌 register 注,不出 practise 陷阱题。关6美英=trunk/boot(后备箱)+ hood/bonnet(引擎盖)+ gas/petrol + windshield/windscreen;chunks=set up a record/have great difficulty in doing/follow in one's footsteps/be disappointed to learn。MC comprehension 正解(a)"是否达到301一度有疑问"已用作 s10 reading#7。
- 44题;机器12项🟢。seed→`american_am2_seed_unit09.sql`(**L65-69+L71+L72=308**,L70 空缺待换情节包补)。⏭️ L73(🟢低,正常读)。

## 🛠️ 工具改进(2026-07-05)· gen-book2-seed.mjs 写前比对
- **痛点**:生成器每次无条件 writeFileSync,6 个 unit 文件时间戳全刷新,Aaron 无法从时间戳判断哪个真变了。
- **修复**:写前 readFileSync 比对,**内容相同则不动文件、不刷时间戳**;生成器确定性(mulberry32 固定种子 + 按 lesson_no 顺序消耗随机流)保证末尾加课不改前面单元输出→未改单元逐字节相同。
- 生成器结尾打印「✍️需跑 / ⏭️无需重跑」小结;`_RUN_ME` 顶部加「本批变化」块,明确列本批真变的 unit + COUNT 增量 + 无变化标注。见 [[assertions-need-evidence]]。

---


> 授权 2026-07-04:L2–L96 由 CC 自主走 10 步流水线(豁免逐课网页版评审),机器校验+双角色自审。
> 不变项:SQL 只 Aaron service role 跑 · 每单元真机抽验 2 课 · 禁区4文件不改 · 不擅自合 main · 第五节升级情形停。
> 交付批次=单元(8课)。每课一行:状态 / 校验 / 挂起原因。

| 课 | 单元 | 标题 | 状态 | 校验八项 | 备注 |
|---|---|---|---|---|---|
| L1 | 1 | A Private Conversation | ✅ 上线(48题/解释48/关6=6) | 全绿 | 真机双验通过 |
| L2 | 1 | Breakfast or lunch? | ✅ 生产完成(44题/解释44/关6=6/认知3) | 🟢八项全绿 | 步骤1-9完成;seed 归单元1批次待跑;prewarm 待单元批次;真机待Aaron抽验 |
| L3 | 1 | Please send me a card | ✅ 生产完成(44题/解释44/关6=6/认知2) | 🟢八项全绿 | 一般过去时;新思维p117已补扫并入讲深;seed归单元1批次;prewarm待批次;真机待抽验 |
| L4 | 1 | An exciting trip | ✅ 生产完成(44题/解释44/关6=6/认知3) | 🟢八项全绿(首轮) | 现在完成时;三源p27-28/p42-44/新思维p119-120已核;现在完成进行时p122排除记备用;seed归单元1批次;prewarm待批次;真机待抽验 |
| L5 | 1 | No wrong numbers | ✅ 生产完成(44题/解释44/关6=6/认知3) | 🟢八项全绿(首轮) | 现在完成时续(up to now/a great many/since/时态切换);三源p31/p42-45/新思维p120已核;与L4分工不重复;seed归单元1批次;prewarm待批次;真机待抽验 |
| L6 | 1 | Percy Buttons | ✅ 生产完成(44题/解释44/关6=6/认知3) | 🟢八项全绿(首轮) | 冠词 a/an/some/the;三源 教材p36 KeyStruct + 同步p49 LESSON6 + 新思维冠词 已核;定冠词地理习语细则留后;seed归单元1批次;prewarm待批次;真机待抽验 |
| L7 | 1 | Too late | ✅ 生产完成(44题/解释44/关6=6/认知3) | 🟢八项全绿(首轮) | 过去进行时(跨课备用落点·还账);三源 教材p40 KeyStruct + 同步p56 LESSON7 + 新思维p118 已核;过去完成时had told/would排除;seed归单元1批次;prewarm待批次;真机待抽验 |
| L8 | 1 | The best and the worst | ✅ 生产完成(44题/解释44/关6=6/认知3) | 🟢八项全绿(首轮) | 比较级和最高级;三源 教材p44 KeyStruct + 同步p58 LESSON8 + 新思维比较级 已核;as…as/进阶比较排除;seed归单元1批次;prewarm待批次;真机待抽验 |

> **✅ 单元1(L1–L8)全部生产完成 + 全部落库(2026-07-04)。** L1 上线;L2–L8 seed 在 `SQLAA/american_am2_seed_unit01.sql`(Aaron 已跑到 L8,全落库)。单元1批次汇报见 `REVIEWAA/american-book2-U1/UNIT1-batch-report.md`。⏭️ Aaron 真机抽验 L4/L7 + prewarm 音频(待)。

### 单元2(L9–L16)

| 课 | 单元 | 标题 | 状态 | 校验八项 | 备注 |
|---|---|---|---|---|---|
| L9 | 2 | A cold welcome | ✅ 生产完成(44题/解释44/关6=6/认知3) | 🟢八项全绿(首轮) | 时间介词 at/in/on;三源 教材p48 KeyStruct + 同步p67 LESSON9 + 新思维介词 已核;过去完成had gathered/过去将来would strike排除;seed=`american_am2_seed_unit02.sql`;prewarm待批次;真机待抽验 |
| L10 | 2 | Not for jazz | ✅ 生产完成(44题/解释44/关6=6/认知3) | 🟢八项全绿(首轮) | **主题分歧首例**:教材Key structures=被动语态(主考15题) vs 同步L10=名词所有格(辅考3题)→ Aaron裁决 A+覆盖补丁([[am2-source-divergence-rule]]);三源 教材p52 KeyStruct被动 + 教材注释②双重所有格 + 同步p75-76所有格 + 新思维被动p127-131(页眉核过);进行/完成/将来被动展示不设题;**同步所有格深度细则挂账(见下,单元末清零)**;seed=`american_am2_seed_unit02.sql`;prewarm待批次;真机待抽验 |
| L11 | 2 | One good turn deserves another | ✅ 生产完成(44题/解释44/关6=6/认知3) | 🟢八项全绿(首轮) | **主题分歧第二例**:教材Key structures=Review KS2-10(时态语态综合复习,主考11题) vs 同步L11=v.+sb+to do宾补 + 并列连词(辅考7题)→ 按 [[am2-source-divergence-rule]] 自决(不停),裁决A+覆盖补丁第二次执行;三源 教材p56 KeyStruct Review + 同步p83-85 宾补/连词 + 新思维时态各章L2-L10已扫(连词/宾补专题未定点补扫,诚实标注);宾补/连词深度细则挂账(见下);seed=`american_am2_seed_unit02.sql`;prewarm待批次;真机待抽验 |
| L12 | 2 | Goodbye and good luck | ✅ 生产完成(44题/解释44/关6=6/认知3) | 🟢八项全绿(首轮) | 一般将来时(主考,教材 Key structures=I'll see you tomorrow.)+ be going to/表将来的现在时(辅考讲深);**教材/同步同主题讲深(非分歧)**——同步L12讲更深(be going to/be to/将来进行时);三源 教材p60 KeyStruct + 同步p88-89 将来时各表达 + 新思维将来时章未定点补扫(诚实标注);**be to/be about to/将来进行时挂账**;seed=`american_am2_seed_unit02.sql`;prewarm待批次;真机待抽验 |
| L13 | 2 | The Greenwood Boys | ✅ 生产完成(44题/解释44/关6=6/认知3) | 🟢八项全绿(首轮) | 将来进行时(主考,教材 Key structures=What will you be doing tomorrow?)+ by交通工具/现在进行复习(辅考);**单一主题三源一致(无分歧)**;**承接兑现 L12 将来进行时挂账→L12该项清零**;三源 教材p64 KeyStruct + 同步p89 将来进行时基本用法 + 新思维将来进行章未定点补扫(诚实标注);seed=`american_am2_seed_unit02.sql`;prewarm待批次;真机待抽验 |
| L14 | 2 | Do you speak English? | ✅ 生产完成(**47题**/解释47/关6=6/认知3/**9gp**) | 🟢八项全绿(补题后复验) | 过去完成时(主考,教材 Key structures=After he had finished work he went home.)+ had planned/hoped 未实现计划/It was the…time that had done(辅考讲深)+ **反身代词(G9辅考,就地补回)**;**同主题讲深无分歧**;**承接兑现 L7/L9 排除留后的过去完成时→该跨课账清零**;三源 教材p68 KeyStruct + 同步p92 过去完成时用法 + 同步L14章反身代词 + 新思维过去完成章未定点补扫;⚠️**反身代词修订**:Aaron 反馈教材L14就教(himself在课文)不推U3,seed未跑就地补3题(关5 18→21,44→47);seed=`american_am2_seed_unit02.sql`;prewarm待批次;真机待抽验 |
| L15 | 2 | Good news | ✅ 生产完成(44题/解释44/关6=6/认知3) | 🟢八项全绿(首轮) | 间接引语(主考,教材 Key structures=He said that… He told me…)+ 宾语从句 if/whether/过去将来时 would(辅考讲深);**同主题讲深无分歧**(同步 L15=宾语从句+过去将来时=间接引语底层机制);三源 教材p72 KeyStruct + 同步p99 宾语从句+过去将来时 + 新思维间接引语章未定点补扫(诚实标注);⚠️**发现反身代词遗漏→补挂账**;seed=`american_am2_seed_unit02.sql`;prewarm待批次;真机待抽验 |
| L16 | 2 | A polite request | ✅ 生产完成(44题/解释44/关6=6/认知3) | 🟢八项全绿(首轮) | **主题分歧第三例**:教材Key structures=if 条件句(第一类真实条件) vs 同步L16=主谓一致→按 [[am2-source-divergence-rule]] 自决(不停),裁决A+覆盖补丁第三次执行;主考if条件句12+辅考主谓一致6(课文"Traffic police are"①类);三源 教材p76 KeyStruct + 同步p103 主谓一致 + 新思维条件句章未定点补扫(诚实标注);**主谓一致深度挂账**;seed=`american_am2_seed_unit02.sql`;prewarm待批次;真机待抽验 |

> **✅ 单元2(L9–L16)全部生产完成(2026-07-04)。** seed 累积在 `SQLAA/american_am2_seed_unit02.sql`(待 Aaron 批次跑)。单元2批次汇报见 `REVIEWAA/american-book2-U2/UNIT2-batch-report.md`(含挂账逐条处置)。⏭️ Aaron 批次跑 unit02 seed + 真机抽验 2 课 + prewarm 音频。

## L16 流水线步骤跟踪(if 条件句主考 + 主谓一致辅考)
- [x] 1 三源扫描(scan-evidence-lesson16.md:**主题分歧第三例**——教材p76 Key structures=if 条件句(If you open the door you will get a surprise) vs 同步p103=主谓一致;逐页页眉;课文"Traffic police are"①类→主谓一致辅考;主考教材权威已足,新思维条件句章诚实标"未定点补扫";**按裁决自决未停**[[am2-source-divergence-rule]])
- [x] 2 建考点清单(grammar-syllabus-lesson16.md:G1-G6 if条件句12 + G7集合名词3 + G8就近就前3 / W1-W11 / C1-C6)
- [x] 3 清单自审(评审角色核对裁决执行,结论写入清单头 ★)· [x] 4 课文定稿(11句·if条件句密集If you park…will find/if pay/if get…cannot fail to obey + 主谓一致 Traffic police are·11词/3语块全落·parking lot/downtown/license plate美语化)
- [x] 5 题库(关5=18[if条件12+主谓一致6,认知3] / 关6=6 / 关7=4 / 关8=3 / 关9=3 / 关10=10 = 44) · [x] 6 解释44条
- [x] 7 双角色自审(coverage U2/lesson16.md;首轮无抓修;裁决执行核对✓) · [x] 8 JSON+seed(am2_l16.json→unit02.sql) · [x] 9 机器校验八项全绿(44=44/解释44/零串味14条未用主谓术语/G1-G8全覆盖/W11) · [x] 10 commit

## L16 挂账 + 单元2末挂账汇总(⚠️ 批次汇报逐条处置)
- **本课挂账:主谓一致深度**(the+adj 作主语单复数、politics is/glasses are/ten years is、数词单用):本课只教集合名词+就近/就前;深度挂账。
- **单元2末挂账逐条**(见 UNIT2-batch-report.md 处置):L10 名词所有格深度 / L11 宾补深度+连词深度 / L12 be to+be about to / ~~L15 反身代词~~(**✅ 已就地补回 L14 G9,Aaron 反馈不推 U3**)/ L16 主谓一致深度。

## L16 待裁决(单元末汇总报 Aaron;分歧已按裁决自决,非阻塞)
1. 教材/同步主题分歧第三例(if 条件句 vs 主谓一致)→ 已按 [[am2-source-divergence-rule]] 自决:if条件句主考 + 主谓一致辅考(课文 police are)+ 深度挂账。第三次执行,记录供 Aaron 复核裁决落地质量。
2. 词表官方9词→补至11(+polite/enjoy)对齐体量 → 采纳A。
3. 关6 美英对照 parking lot/car park · downtown/city centre · license plate/number plate → 采纳:贴停车罚单场景。

## L15 流水线步骤跟踪(间接引语主考)
- [x] 1 三源扫描(scan-evidence-lesson15.md:**同主题讲深无分歧**——教材p72 Key structures=间接引语(He said that… He told me…,say/tell+that+时态后移) / 同步p99=宾语从句(that/if/whether)+过去将来时(would)=间接引语底层机制;逐页页眉;新思维间接引语章诚实标"未定点补扫";⚠️**发现同步 L14 章反身代词+教材 L14 himself→L14漏覆盖→补挂账**)
- [x] 2 建考点清单(grammar-syllabus-lesson15.md:G1-G4+G7+G8间接引语14 + G5宾语从句if/whether 2 + G6过去将来时2 / W1-W11 / C1-C6)
- [x] 3 清单自审(评审角色核对,结论写入清单头 ★)· [x] 4 课文定稿(11句·间接引语密集told me that…would/said that…was/could/had come + say·tell区分·11词/3语块全落·elevator/let go/raise/dollars美语化)
- [x] 5 题库(关5=18[间接引语14+讲深4,认知3] / 关6=6 / 关7=4 / 关8=3 / 关9=3 / 关10=10 = 44) · [x] 6 解释44条
- [x] 7 双角色自审(coverage U2/lesson15.md;首轮无抓修) · [x] 8 JSON+seed(am2_l15.json→unit02.sql) · [x] 9 机器校验八项全绿(44=44/解释44/零串味14条未用"宾语从句"术语/G1-G8全覆盖/W11) · [x] 10 commit

## L15 挂账(⚠️ 单元2末批次汇报核对)
- **✅ 反身代词已闭环**(himself/themselves):同步 L14 章(印95-97 四、反身代词)+ 教材 L14 课文"he was English himself"(=①类);L15 扫描时发现 L14 漏覆盖 → Aaron 反馈"教材就在 L14 教,不推 U3",seed 未跑就地补回 L14 G9(+3 题,44→47),复验八项全绿。**教训**:①类岔题(课文实际出现)必须当课辅考,不得跨课延后。
- **遗留继续挂账**:L10 名词所有格深度 / L11 宾补深度+连词深度 / L12 be to+be about to → 继续挂账,L16 单元末统一核对。

## L15 待裁决(单元末汇总报 Aaron;均非阻塞,已按推荐默认继续)
1. 词表官方5词→补至11(+office/business/firm/receive/extra/raise)对齐体量 → 采纳A。
2. 同步同主题深料(宾语从句+过去将来时)=间接引语底层机制 → 取常用(if/whether转述疑问+would后移)并入讲深,细则(was going to/was to)不设题。
3. 关6 美英对照 raise/rise · dollars/pounds · elevator/lift → 采纳:贴办公室加薪场景,加薪 raise 是本课好消息核心美语差。

## L14 流水线步骤跟踪(过去完成时主考)
- [x] 1 三源扫描(scan-evidence-lesson14.md:**同主题讲深无分歧**——教材p68 Key structures=过去完成时(After he had finished work he went home) / 同步p92 过去完成时用法(含 had planned/hoped 未实现计划、It was the…time that had done、一般过去vs过去完成比较);逐页页眉;**承接 L7/L9 排除留后**的 had told/had gathered→L14主考;新思维过去完成章诚实标"未定点补扫")
- [x] 2 建考点清单(grammar-syllabus-lesson14.md:G1-G5+G8过去完成15 + G6 had planned 2 + G7 It was the…time 1 / W1-W11 / C1-C6)
- [x] 3 清单自审(评审角色核对,结论写入清单头 ★)· [x] 4 课文定稿(11句·过去完成had left/had gotten/had reached/had thought + 一般过去混用·11词/3语块全落·on vacation/gotten/toward/learned美语化)
- [x] 5 题库(关5=18[过去完成15+讲深3,认知3] / 关6=6 / 关7=4 / 关8=3 / 关9=3 / 关10=10 = 44) · [x] 6 解释44条
- [x] 7 双角色自审(coverage U2/lesson14.md;首轮无抓修) · [x] 8 JSON+seed(am2_l14.json→unit02.sql) · [x] 9 机器校验八项全绿(44=44/解释44/零串味14条/G1-G8全覆盖/W11) · [x] 10 commit

## L14 挂账兑现 + 遗留(⚠️ 单元2末批次汇报核对)
- **✅ 兑现清零**:L7 had told、L9 had gathered 排除留后的过去完成时 → L14 主考落地,清零。
- **遗留继续挂账**:L10 名词所有格深度(教材 L13 SD 印62 也有 three hours' time/ten pounds' worth 同类素材;L14-L16 若非所有格主题则单元2末单开补充课处置)/ L11 宾补深度+连词深度 / L12 be to+be about to → 继续挂账,单元2末统一核对。

## L14 待裁决(单元末汇总报 Aaron;均非阻塞,已按推荐默认继续)
1. 词表官方7词→补至11(+village/drive/reach/suddenly)对齐体量 → 采纳A。
2. 承接 L7/L9 过去完成时排除留后作 L14 主考 → 跨课账兑现,正确。
3. 关6 美英对照 ride/lift · trip/journey · vacation/holiday → 采纳:贴搭便车旅行度假场景;课文保留 lift/journey 教官方词+卡教美语更常说。

## L13 流水线步骤跟踪(将来进行时主考)
- [x] 1 三源扫描(scan-evidence-lesson13.md:**单一主题三源一致无分歧**——教材p64 Key structures=将来进行时(What will you be doing tomorrow) / 同步p89 二、将来进行时基本用法 / 课文满篇will be+V-ing;逐页页眉;**承接 L12 挂账**将来进行时→L13主考;主考教材+同步双权威覆盖,新思维将来进行章诚实标"未定点补扫")
- [x] 2 建考点清单(grammar-syllabus-lesson13.md:G1-G6将来进行14 + G7 by交通2 + G8现在进行复习2 / W1-W11 / C1-C6)
- [x] 3 清单自审(评审角色核对,结论写入清单头 ★)· [x] 4 课文定稿(11句·将来进行时密集will be arriving/coming/meeting/singing/staying/trying + 现进对照are traveling·11词/3语块全落·downtown/line up/traveling美语化)
- [x] 5 题库(关5=18[将来进行14+辅考4,认知3] / 关6=6 / 关7=4 / 关8=3 / 关9=3 / 关10=10 = 44) · [x] 6 解释44条
- [x] 7 双角色自审(coverage U2/lesson13.md;首轮无抓修) · [x] 8 JSON+seed(am2_l13.json→unit02.sql) · [x] 9 机器校验八项全绿(44=44/解释44/零串味14条/G1-G8全覆盖/W11) · [x] 10 commit

## L13 挂账兑现 + 遗留(⚠️ 单元2末批次汇报核对)
- **✅ 兑现清零**:L12 挂账的"将来进行时(will be doing)"在 L13 已作主考完整落地 → **L12 该项挂账清零**。
- **遗留继续挂账**:L10 名词所有格深度 / L11 宾补深度+连词深度 / L12 be to+be about to → 继续挂账,单元2末统一核对。

## L13 待裁决(单元末汇总报 Aaron;均非阻塞,已按推荐默认继续)
1. 词表官方5词→补至11(+train/station/order/fan/usual/present)对齐体量 → 采纳A。
2. 承接 L12 将来进行时挂账作 L13 主考 → 覆盖铁律兑现,正确。
3. 关6 美英对照 downtown/town centre · line up/queue · traveling/travelling → 采纳:贴巡演粉丝排队场景 + -ing 拼写差。

## L12 流水线步骤跟踪(一般将来时主考 + be going to/表将来的现在时辅考讲深)
- [x] 1 三源扫描(scan-evidence-lesson12.md:**同主题讲深非分歧**——教材p60 Key structures=一般将来时(I'll see you tomorrow) / 同步p88-89=将来时各种表达(will/shall+be going to+be to+be about to+一般现在·现在进行表将来)+将来进行时;逐页页眉;主考由教材KeyStruct+同步双权威覆盖,新思维将来时章诚实标"未定点补扫";be to/be about to/将来进行时挂账)
- [x] 2 建考点清单(grammar-syllabus-lesson12.md:G1-G5+G8一般将来时13 + G6 be going to 3 + G7表将来现在时2 / W1-W11 / C1-C6)
- [x] 3 清单自审(评审角色核对,结论写入清单头 ★)· [x] 4 课文定稿(11句·一般将来时密集will sail/we'll meet/will be/will take part + be going to·11词/3语块全落·harbor/neighbor/sailboat美语化)
- [x] 5 题库(关5=18[将来时13+讲深5,认知3] / 关6=6 / 关7=4 / 关8=3 / 关9=3 / 关10=10 = 44) · [x] 6 解释44条
- [x] 7 双角色自审(coverage U2/lesson12.md;首轮无抓修) · [x] 8 JSON+seed(am2_l12.json→unit02.sql) · [x] 9 机器校验八项全绿(44=44/解释44/零串味14条/G1-G8全覆盖/W11) · [x] 10 commit

## L12 挂账(⚠️ 单元2末批次汇报必须核对清零)
- **将来时进阶细则**(be to + 原形约定/命令 · be about to 即将 · **将来进行时 will be doing**):本课只教一般将来时(will/shall/'ll)+ be going to + 一般现在·现在进行表将来;进阶挂账,并入后续将来时/复合时态加深课。

## L12 待裁决(单元末汇总报 Aaron;均非阻塞,已按推荐默认继续)
1. 词表官方6词→补至11(+neighbor/boat/race/famous/away)对齐体量 → 采纳A。
2. 同步同主题深料(be going to/be to/be about to/将来进行时)→ 取常用(be going to+表将来现在时)并入,进阶(be to/be about to/将来进行时)挂账。
3. 关6 美英对照 harbor/harbour · neighbor/neighbour · sailboat/sailing boat → 采纳:贴港口帆船场景,-our→-or 拼写差 + 复合词差。

## L11 流水线步骤跟踪(时态语态综合复习主考 + 连词/宾补辅考)
- [x] 1 三源扫描(scan-evidence-lesson11.md:**主题分歧第二例**——教材p56 Key structures=Review KS2-10(时态语态综合复习) vs 同步p83-85=v.+sb+to do宾补+并列连词;逐页页眉;主考各时态回溯L2-L10已扫新思维章;连词/宾补辅考以同步p83-85为权威,新思维专题诚实标"未定点补扫";课文含asked him to lend + and/but/so → 同步双岔题均①类;**按裁决自决未停**[[am2-source-divergence-rule]])
- [x] 2 建考点清单(grammar-syllabus-lesson11.md:G1-G6复习11 + G7连词4 + G8宾补3 / W1-W11 / C1-C6)
- [x] 3 清单自审(评审角色核对裁决执行,结论写入清单头 ★)· [x] 4 课文定稿(11句·时态语态满篇混用was having/worked/is working/gets/has never borrowed + ask sb to do + and/but/so·11词/3语块全落·downtown restaurant/dollars/check/immediately美语化)
- [x] 5 题库(关5=18[复习11+连词4+宾补3,认知3全复习框架] / 关6=6 / 关7=4 / 关8=3 / 关9=3 / 关10=10 = 44) · [x] 6 解释44条
- [x] 7 双角色自审(coverage U2/lesson11.md;首轮无抓修;裁决执行核对✓) · [x] 8 JSON+seed(am2_l11.json→unit02.sql) · [x] 9 机器校验八项全绿(44=44/解释44/零串味14条/G1-G8全覆盖/W11) · [x] 10 commit

## L11 挂账(⚠️ 单元2末批次汇报必须核对清零)
- **同步宾补深度细则**(let/make/have + sb + do 省 to · 变被动加 to · had better/would rather 省 to · do nothing but do):本课只教 ask/want/tell/allow sb to do 基础;深度挂账,并入后续非谓语/宾补语境课。
- **同步连词深度细则**(连接性副词 however/therefore 位置灵活 · and·or 表条件=if 从句 · not only…but also · neither…nor):本课只教 and/but/for/so 基础;深度挂账,并入后续连词/复合句课。

## L11 待裁决(单元末汇总报 Aaron;分歧已按裁决自决,非阻塞)
1. 教材/同步主题分歧第二例(Review KS2-10 vs 宾补+连词)→ 已按 [[am2-source-divergence-rule]] 自决:时态语态复习主考 + 宾补/连词双辅考(均课文出现=①类)+ 深度挂账。第二次执行,记录供 Aaron 单元末复核裁决落地质量。
2. 词表官方6词→补至11(+restaurant/borrow/lend/surprise/pay)对齐体量 → 采纳A。
3. 关6 美英对照 dollars/pounds · check/bill · attorney/lawyer → 采纳:贴餐馆结账/律师场景;课文保留 lawyer/pounds→dollars 教官方词+落美语化。

## L10 流水线步骤跟踪(被动语态主考 + 名词所有格辅考)
- [x] 1 三源扫描(scan-evidence-lesson10.md:**主题分歧首例**——教材Key structures=被动语态 vs 同步L10=名词所有格;逐页页眉;被动=教材p52 KeyStruct + 新思维p127-131(渲染TOC定位第24-25周印117-121→PDF p127-131,读TX_p127页眉"被动语态构成"be+过去分词八时态表);所有格=教材注释②双重所有格 a friend of my father's + 同步p75-76;**STOP并报→Aaron裁决 A+覆盖补丁**[[am2-source-divergence-rule]])
- [x] 2 建考点清单(grammar-syllabus-lesson10.md:G1-G6被动主考15 + G7-G8所有格辅考3 / W1-W11 / C1-C6)
- [x] 3 清单自审(评审角色核对裁决执行,结论写入清单头 ★)· [x] 4 课文定稿(11句·被动全形态密集was made/is kept/was bought by/was damaged by/were broken/are allowed/is being repaired + 双重所有格 a friend of my dad's·11词/3语块全落·living room/grandpa/practice美语化)
- [x] 5 题库(关5=18[被动15+所有格3,认知3全被动] / 关6=6 / 关7=4 / 关8=3 / 关9=3 / 关10=10 = 44) · [x] 6 解释44条
- [x] 7 双角色自审(coverage U2/lesson10.md;首轮无抓修;裁决执行核对✓) · [x] 8 JSON+seed(am2_l10.json→unit02.sql) · [x] 9 机器校验八项全绿(44=44=44/解释44/零串味/G1-G8全覆盖) · [x] 10 commit

## L10 挂账(⚠️ 单元2末批次汇报必须核对清零)
- **同步 L10 名词所有格深度细则**(无生命属格 today's paper/two pounds' weight/China's population、of 属格进阶、所有格意义主谓关系):本课只做基础辅考(3题+关6语言点);深度细则**并入后续含所有格语境的合适课次**(或单元2补充课)。单元2批次汇报时若仍无落点,则单开补充课处置——**不得让此知识点永久遗漏**(裁决 A+覆盖补丁铁律)。

## L10 待裁决(单元末汇总报 Aaron;分歧已按裁决自决,非阻塞)
1. 教材/同步主题分歧(被动 vs 所有格)→ 已按 [[am2-source-divergence-rule]] 自决:被动主考+所有格辅考+深度挂账。首次执行,记录供 Aaron 单元末复核裁决落地质量。
2. 进行时被动(is being repaired,课文有)/完成被动/将来被动 → 排除只作展示,不设题(记 scan §四)。
3. 关6 美英对照 living room/sitting room · grandpa/grandad · practice/practise(动词) → 采纳:贴古钢琴居家场景。

## L9 流水线步骤跟踪(时间介词 at/in/on)
- [x] 1 三源扫描(scan-evidence-lesson09.md:教材p48 KeyStruct[at/in/on/other+ExB]权威 / 同步p67 LESSON9[表示时间的介词at,in,on,during] / 新思维介词;逐页页眉;had gathered/would strike排除;三源一致)
- [x] 2 建考点清单(grammar-syllabus-lesson09.md:G1-G8 / W1-W11 / C1-C6)
- [x] 3 清单自审 · [x] 4 课文定稿(11句·at/in/on全覆盖·11词/3语块全落·on the weekend/sidewalk/line美语化)
- [x] 5 题库(关5=18[认知3] / 关6=6 / 关7=4 / 关8=3 / 关9=3 / 关10=10 = 44) · [x] 6 解释44条
- [x] 7 双角色自审(coverage U2/lesson09.md;首轮无抓修) · [x] 8 JSON+seed(am2_l09.json→unit02.sql) · [x] 9 机器校验八项全绿 · [x] 10 commit

## L9 待裁决(单元末汇总报;非阻塞已自决)
1. 词表官方7词→补至11(+clock/midnight/strike/moment)对齐体量 → 采纳A。
2. 过去完成时(had gathered)/过去将来时(would strike)课文偶现 → 排除留后(记 scan §四)。
3. 关6 美英对照选 on the weekend/at the weekend(时间介词差,贴本课)+ sidewalk/line → 采纳。

## L2 流水线步骤跟踪
- [x] 1 三源扫描(scan-evidence-lesson02.md:教材p19-22 / 同步p33-37 / 新思维p110,112;主题一致无冲突)
- [x] 2 建考点清单(grammar-syllabus-lesson02.md:G1-G9 / W1-W7 / C1-C7)
- [x] 3 清单自审(评审角色核对,结论写入清单头 ★)
- [x] 4 课文美语定稿(12句·过去叙事框+现在时对白·11词/语块/感叹句全落课文)
- [x] 5 题库生产(关5=19[G1-9,认知3] / 关6=6卡6题 / 关7=4 / 关8=3 / 关9=3 / 关10=10 ≈ 41题)
- [x] 6 逐题解释(am2_l02_explanations_final.md,44条)
- [x] 7 双角色自审(coverage-lesson02.md §四;抓修2处:haveing重复/rain不可数)
- [x] 8 JSON + seed(am2_l02.json;gen-book2-seed 重生成 unit01 含L1+L2,解释合并)
- [x] 9 机器校验套件(validate_l02.mjs 八项全绿:44=44=44/解释44/零串味/G9全覆盖)
- [x] 10 落盘 + commit(L2 docs 一 commit;seed SQL 归单元1批次)

## L4 流水线步骤跟踪(现在完成时)
- [x] 1 三源扫描(scan-evidence-lesson04.md:教材p27-28含Key structures权威状语清单 / 同步p42-44 / 新思维p119构成·p120状语·p122完成进行时排除;逐页页眉清单守"没找到也是断言";主题一致无冲突)
- [x] 2 建考点清单(grammar-syllabus-lesson04.md:G1-G9 / W1-W11 / C1-C6)
- [x] 3 清单自审(评审角色核对,结论写入清单头 ★)
- [x] 4 课文美语定稿(11句·现在完成时叙事·11词/3语块全落课文·gotten/center/traveled 美语化)
- [x] 5 题库生产(关5=18[G1-9,认知3] / 关6=6卡6题 / 关7=4 / 关8=3 / 关9=3 / 关10=10 = 44题)
- [x] 6 逐题解释(am2_l04_explanations_final.md,44条)
- [x] 7 双角色自审(coverage-lesson04.md §四;首轮无抓修)
- [x] 8 JSON + seed(am2_l04.json;gen-book2-seed 重生成 unit01 含L1-L4,解释合并)
- [x] 9 机器校验套件(validate-am2-lesson.mjs am2_l04 八项全绿:44=44=44/解释44/零串味/G9全覆盖)
- [x] 10 落盘 + commit(L4 docs 一 commit;seed SQL 归单元1批次)

## L5 流水线步骤跟踪(现在完成时·续)
- [x] 1 三源扫描(scan-evidence-lesson05.md:教材p31含Notes权威[up to now/a great many/from距离] / 同步p44(四)短暂动词+新闻→追问切换 / 新思维p120状语;逐页页眉;与L4互补无冲突)
- [x] 2 建考点清单(grammar-syllabus-lesson05.md:G1-G8 / W1-W11 / C1-C6;与L4分工写清)
- [x] 3 清单自审(评审角色核对,结论写入清单头 ★)
- [x] 4 课文美语定稿(11句·现完+过去时天然对比·11词/3语块全落·store/downtown/mail美语化)
- [x] 5 题库生产(关5=18[G1-8,认知3] / 关6=6 / 关7=4 / 关8=3 / 关9=3 / 关10=10 = 44题)
- [x] 6 逐题解释(am2_l05_explanations_final.md,44条)
- [x] 7 双角色自审(coverage-lesson05.md §四;首轮无抓修)
- [x] 8 JSON + seed(am2_l05.json;gen-book2-seed 重生成 unit01 含L1-L5,解释合并)
- [x] 9 机器校验套件(validate-am2-lesson.mjs am2_l05 八项全绿:44=44=44/解释44/零串味/G8全覆盖)
- [x] 10 落盘 + commit(L5 docs 一 commit;seed SQL 归单元1批次)

## L6 流水线步骤跟踪(冠词)
- [x] 1 三源扫描(scan-evidence-lesson06.md:教材p36 KeyStruct[A.The and Some]权威 / 同步p49 LESSON6[一.冠词] / 新思维冠词专题;逐页页眉;三源一致无冲突)
- [x] 2 建考点清单(grammar-syllabus-lesson06.md:G1-G8 / W1-W11 / C1-C6)
- [x] 3 清单自审(评审角色核对,结论写入清单头 ★)
- [x] 4 课文美语定稿(11句·冠词密集 an apartment/a beggar/some food/the sandwich/a cup of/专名·11词/3语块全落·apartment/neighbor/cookie美语化)
- [x] 5 题库生产(关5=18[G1-8,认知3] / 关6=6 / 关7=4 / 关8=3 / 关9=3 / 关10=10 = 44题)
- [x] 6 逐题解释(am2_l06_explanations_final.md,44条)
- [x] 7 双角色自审(coverage-lesson06.md §四;首轮无抓修)
- [x] 8 JSON + seed(am2_l06.json;gen-book2-seed 重生成 unit01 含L1-L6,解释合并)
- [x] 9 机器校验套件(validate-am2-lesson.mjs am2_l06 八项全绿:44=44=44/解释44/零串味/G8全覆盖)
- [x] 10 落盘 + commit(L6 docs 一 commit;seed SQL 归单元1批次)

## L7 流水线步骤跟踪(过去进行时)
- [x] 1 三源扫描(scan-evidence-lesson07.md:教材p40 KeyStruct[过去进行时8例句+ExD]权威 / 同步p56 LESSON7[一.过去进行时] / 新思维p118;逐页页眉;had told过去完成时/would排除;三源一致)
- [x] 2 建考点清单(grammar-syllabus-lesson07.md:G1-G8 / W1-W11 / C1-C6)
- [x] 3 清单自审(评审角色核对,结论写入清单头 ★)
- [x] 4 课文美语定稿(11句·过去进行时8处密集+when背景突发+while双进行·11词/3语块全落·package对照/gray/airplane美语化)
- [x] 5 题库生产(关5=18[G1-8,认知3] / 关6=6 / 关7=4 / 关8=3 / 关9=3 / 关10=10 = 44题)
- [x] 6 逐题解释(am2_l07_explanations_final.md,44条)
- [x] 7 双角色自审(coverage-lesson07.md §四;首轮无抓修)
- [x] 8 JSON + seed(am2_l07.json;gen-book2-seed 重生成 unit01 含L1-L7,解释合并)
- [x] 9 机器校验套件(validate-am2-lesson.mjs am2_l07 八项全绿:44=44=44/解释44/零串味/G8全覆盖)
- [x] 10 落盘 + commit(L7 docs 一 commit;seed SQL 归单元1批次)

## L8 流水线步骤跟踪(比较级和最高级)
- [x] 1 三源扫描(scan-evidence-lesson08.md:教材p44 KeyStruct[比较+Note3不规则+ExC]权威 / 同步p58 LESSON8[比较级与最高级构成] / 新思维比较级;逐页页眉;as…as/进阶排除;三源一致)
- [x] 2 建考点清单(grammar-syllabus-lesson08.md:G1-G8 / W1-W11 / C1-C6)
- [x] 3 清单自审(评审角色核对,结论写入清单头 ★)
- [x] 4 课文美语定稿(11句·比较级最高级8处全形态·11词/3语块全落·favorite/color/meter美语化)
- [x] 5 题库生产(关5=18[G1-8,认知3] / 关6=6 / 关7=4 / 关8=3 / 关9=3 / 关10=10 = 44题)
- [x] 6 逐题解释(am2_l08_explanations_final.md,44条)
- [x] 7 双角色自审(coverage-lesson08.md §四;首轮无抓修)
- [x] 8 JSON + seed(am2_l08.json;gen-book2-seed 重生成 unit01 含L1-L8,解释合并)
- [x] 9 机器校验套件(validate-am2-lesson.mjs am2_l08 八项全绿:44=44=44/解释44/零串味/G8全覆盖)
- [x] 10 落盘 + commit(L8 docs 一 commit;seed SQL 归单元1批次)

## L8 待裁决(单元末汇总报 Aaron;均非阻塞,已按推荐默认继续)
1. 词表官方5词→补至11(competition/garden/neat/path/wooden/pool + prize/flower/bridge/grow/win)→ 默认 **A**:对齐体量;favorite/color/meter 另作关6对照卡。
2. as…as 同级比较 + much/even/a little+比较级进阶 + 倍数比较 → 默认 **排除**:本课只教规则/不规则构成+than+the…in 主线,进阶留后续比较加深课(记 scan §四)。
3. 关6 美英对照 favorite/color/meter → 默认 **采纳**:三个高频 -or/-our 与 -er/-re 差,贴花园描写语境。

## L7 待裁决(单元末汇总报 Aaron;均非阻塞,已按推荐默认继续)
1. 词表官方13词→取11(detective/airport/expect/valuable/diamond/thief/steal/guard/parcel/precious/stone)→ 默认 **A**:main/airfield/sand 入课文但不单列词卡,控体量对齐 L1-L6。
2. 过去完成时(had told,课文偶现)+ would(thieves would try)→ 默认 **排除**:不在教材 Key structures 考点,留后续课(记 scan §四)。
3. 关6 美英对照选 package/parcel(课文保留 parcel 教官方词,卡教"美语更常说 package")→ 默认 **采纳**:既守官方词又落美语化。

## L6 待裁决(单元末汇总报 Aaron;均非阻塞,已按推荐默认继续)
1. 词表官方仅4词(beggar/food/pocket/call)→ 默认 **A**:补 apartment/knock/sandwich/meal/neighbor/cookie/street 凑11词(对齐体量;cookie/neighbor/apartment 兼作关6对照卡)。
2. L5 讲深遗漏(way 短语 in the/on the/in this way、spare/to spare)→ 默认 **不回补**:非冠词主线,记备用;若单元真机反馈需要再议。
3. 定冠词 the 的地理/习语细则(the United States / play the piano)→ 默认 **留后续冠词加深课**:本课只教四主线(初提a/再提the/泛指省/专名不用),不超载。

## L5 待裁决(单元末汇总报 Aaron;均非阻塞,已按推荐默认继续)
1. 词表弃 spare part(备件)→ 默认 **A**:美语化书店场景不宜"备件",改用 install/note/mile/private/own 凑11词(对齐L1-L4体量)。
2. L4 讲深遗漏(receive vs take 易混、独立 since 题)→ 默认 **since 已由 L5 G4 接住**;receive/take 易混非现在完成时主线,不回补(记此备用,若单元真机反馈需要再议)。
3. L5 与 L4 均现在完成时(同步合并 L4/5)→ 默认 **分工制**:L4 构成/gone-been/状语位置,L5 up to now/a great many/时态切换,零重复(已在两课 syllabus 写明)。

## L4 待裁决(单元末汇总报 Aaron;均非阻塞,已按推荐默认继续)
1. 词表偏薄(官方6词)→ 默认 **A**:补 letter/engineer/arrive/recently/already 凑11词(对齐L1-L3体量)。
2. gotten 作美式过去分词入关6对照卡 → 默认 **采纳**:现在完成时特有美式差(has gotten / has got),thematically 贴切。
3. 认知题达上限3(G2规则辨识/G3状语位置/G7 gone-been)→ 默认 **保留3**:现在完成时+过去分词是硬新概念,3道认知铺垫合理。

## L2 待裁决(单元末汇总报 Aaron;均非阻塞,已按推荐默认继续)
1. 词表偏薄(官方仅5词+多选2)→ 默认 **A**:补 breakfast/lunch/arrive/telephone 凑~11词(对齐L1体量)。
2. 现在进行时+always表抱怨 → 默认 **A**:并入G7作补充例句,不单设题。
3. G8 感叹句题量 → 默认 **2–3 题**(what+how 各覆盖)。

## 跨课备用素材(扫到但不属当课)
- **过去进行时**(was/were+V-ing,新思维 印108/PDF p117→p118 第22周;与一般过去时配合作"背景"):不入 L3;留给**同步书讲过去进行时的那一课**(届时并入讲深)。L1 课文 "was sitting/were talking" 是其已见例句。
- **现在完成进行时**(has/have been V-ing,新思维 印112/PDF p122 第23周,页眉即"现在完成进行时 与 现在完成时比较"):不入 L4;留给后续讲现在完成进行时的课(届时可对比 has lived / has been living)。
- **现在完成时延续 vs 影响两大用法**:同步 L4/5 合并讲现在完成时(p42 合并标题 "Lesson 4 / 5");L4 已覆盖构成+状语+经历+for/gone-been+vs过去时/进行时;若 L5《No wrong numbers》同步仍归现在完成时,L5 可侧重"延续用法 since+从句 / 与一般过去时更细对比",避免与 L4 重复(L5 扫描时按三源实际定,别预设)。

## 证据纪律补充(2026-07-04 Aaron 点)
- **"没找到"也是断言**:凡下"某书没有 X"的结论,凭证里必须附**逐页页眉清单(页码+各页标题)**证明逐页核过;没逐页核只能写"**未定位到**",不能写"没有"。反例:L3 v1 曾断言"新思维无简单过去时",实为漏读 p117(一般过去时用法就在渲染范围内)。见 [[assertions-need-evidence]]。

## 单元汇报模板(硬规则)
- **分关计数只留终值**:汇报必须逐关列明细(关5/6/7/8/9/10),且**加和恰等于总数**;禁止"早前口径"与"终值"两套数字并存(§三.7 对账延伸,2026-07-04 Aaron 点)。中途自审改题量后,回头把定稿/coverage/汇报的旧数一并改成终值。
- 汇报含:课数 / 分关计数终值总表 / 解释数 / 卡数 / 校验八项结果 / 挂起清单 / 待裁决A/B/C / SQL 文件清单(分片) / 指定抽验 2 课(附直达链接)。

## L3《Please send me a card》专项指引(还账课)
- **接住 L1/L2 攒的账**:一般过去时是 L1、L2 两次裁决"留对应课次"的落点,对应课次=L3。建 L3 清单时,**前两课课文里已出现的过去式(went/got/said/were sitting/rang/arrived…)这回名正言顺入 G 表**,别当全新知识从零讲——可复用它们作已见例句,降低认知负荷。
- 同步 L3 主题=一般过去时(已扫到 PDF p38 标题确认)。三源:教材 L3 + 同步 L3(p38 起)+ 新思维一般过去时专题。

## 单元1 阻塞/升级项
- (无)
