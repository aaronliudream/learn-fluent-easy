# 美语课程题库机审报告

> anon 只读机审,只报不改。修复走 Aaron 拍板 + 独立 SQL。
> 题库规模:3556 题(cloze 784 / choice 2247 / transform 309)。

## 摘要

| 级别 | 数量 |
|---|---|
| 🔴 确定错误 | 0 |
| 🟡 疑似 | 42 |
| ⚪ flag | 892 |

按 code 分布:

| code | 数 |
|---|---|
| 超纲 | 892 |
| C7-未匹配原句 | 27 |
| 查重 | 15 |

## 🔴 确定错误（0）

_无_

## 🟡 疑似(需人工判断)（42）

| 单元 | 课 | code | 说明 | qid |
|---|---|---|---|---|
| 1 | am1_l01 | 查重 | 题干/原句重复×3: "🔊 听录音,选出这个词的意思" @ am1_l01/s10/seq18 , am1_l28/s10/seq27 , am1_l28/s10/seq28 | `ca9b3609` |
| 1 | am1_l03 | 查重 | 题干/原句重复×2: "选出 neighborhood 的意思" @ am1_l03/s10/seq22 , am1_l63/s10/seq22 | `d3c11b75` |
| 1 | am1_l04 | C7-未匹配原句 | 空7填"nurse"后无逐字匹配(疑精简/改写/错词): "are you a ___ here too?" | `b14f9cde` |
| 1 | am1_l06 | C7-未匹配原句 | 空2填"my"后无逐字匹配(疑精简/改写/错词): "no, ___2___ mug is pink." | `6f682997` |
| 2 | am1_l07 | C7-未匹配原句 | 空8填"medium"后无逐字匹配(疑精简/改写/错词): "— clerk: it's a ___." | `8ad4f67d` |
| 2 | am1_l07 | C7-未匹配原句 | 空10填"sale"后无逐字匹配(疑精简/改写/错词): "it's on ___ — only ten dollars." | `5713e61d` |
| 2 | am1_l09 | C7-未匹配原句 | 空4填"we"后无逐字匹配(疑精简/改写/错词): "— ethan: yes, ___4___ are." | `6ffb3291` |
| 2 | am1_l09 | C7-未匹配原句 | 空7填"aunt"后无逐字匹配(疑精简/改写/错词): "noah, this is my ___ carol." | `b9c6f5e0` |
| 2 | am1_l09 | 查重 | 题干/原句重复×2: "they are ___." @ am1_l09/s5/seq7 , am1_l10/s5/seq5 | `755abb41` |
| 2 | am1_l10 | 查重 | 题干/原句重复×2: "朋友看起来不舒服，你关心地问：" @ am1_l10/s5/seq10 , am1_l10/s5/seq11 | `9f98de6e` |
| 2 | am1_l11 | C7-未匹配原句 | 空5填"that"后无逐字匹配(疑精简/改写/错词): "— librarian: no, not ___5___ one." | `c46764b4` |
| 3 | am1_l13 | C7-未匹配原句 | 空4填"on"后无逐字匹配(疑精简/改写/错词): "the salt is ___4___ the counter." | `bcca221a` |
| 3 | am1_l13 | 查重 | 题干/原句重复×2: "what night is it?" @ am1_l13/s8/seq1 , am1_l58/s8/seq1 | `2212794b` |
| 3 | am1_l16 | 查重 | 题干/原句重复×2: "sit 的 -ing 形式：" @ am1_l16/s5/seq7 , am1_l60/s5/seq11 | `60417d4d` |
| 5 | am1_l25 | C7-未匹配原句 | 空5填"no"后无逐字匹配(疑精简/改写/错词): "tell them: ___5___ pineapple!" | `8d7de67e` |
| 5 | am1_l28 | C7-未匹配原句 | 空1填"works"后无逐字匹配(疑精简/改写/错词): "carter ___1___ at night." | `80f03425` |
| 5 | am1_l28 | C7-未匹配原句 | 空4填"plays"后无逐字匹配(疑精简/改写/错词): "emma ___4___ soccer after school." | `cbf7abc9` |
| 5 | am1_l30 | C7-未匹配原句 | 空2填"bottles"后无逐字匹配(疑精简/改写/错词): "...two ___2___ of orange juice." | `17d6855c` |
| 6 | am1_l31 | 查重 | 题干/原句重复×2: "朋友生病，祝早日康复说：" @ am1_l31/s5/seq7 , am1_l31/s6/seq1 | `65f4f710` |
| 6 | am1_l36 | C7-未匹配原句 | 空2填"walked"后无逐字匹配(疑精简/改写/错词): "so i ___2___ to work in the rain." | `d28589d1` |
| 8 | am1_l43 | 查重 | 题干/原句重复×2: "see 的过去分词：" @ am1_l43/s5/seq11 , am1_l71/s10/seq3 | `9c59aace` |
| 8 | am1_l46 | 查重 | 题干/原句重复×6: "下列哪句正确：" @ am1_l46/s5/seq13 , am1_l52/s10/seq4 , am1_l54/s5/seq15 , am1_l55/s5/seq15 , am1_l62/s5/seq15 , am1_l68/s5/seq15 | `b4881246` |
| 8 | am1_l47 | C7-未匹配原句 | 空2填"sleep"后无逐字匹配(疑精简/改写/错词): ""i'll ___2___ in three countries this month." ___3___ h" | `8053ec3c` |
| 8 | am1_l47 | C7-未匹配原句 | 空3填"Will"后无逐字匹配(疑精简/改写/错词): ""i'll ___2___ in three countries this month." ___3___ h" | `d041efb0` |
| 8 | am1_l48 | C7-未匹配原句 | 空1填"time"后无逐字匹配(疑精简/改写/错词): "flight 214—is it on ___1___?" | `9bd01944` |
| 9 | am1_l50 | C7-未匹配原句 | 空11填"yourself"后无逐字匹配(疑精简/改写/错词): "you take care of ___." | `d31dea92` |
| 9 | am1_l51 | C7-未匹配原句 | 空4填"congratulations"后无逐字匹配(疑精简/改写/错词): ""dear hailey, ___4___!" mom has just ___5___ me." | `172fc98b` |
| 9 | am1_l51 | C7-未匹配原句 | 空5填"texted"后无逐字匹配(疑精简/改写/错词): ""dear hailey, ___4___!" mom has just ___5___ me." | `8603daf2` |
| 9 | am1_l53 | C7-未匹配原句 | 空1填"quickly"后无逐字匹配(疑精简/改写/错词): ""he runs quick." that needs an l-y: "___1___." "she sin" | `9b2045ec` |
| 9 | am1_l53 | C7-未匹配原句 | 空2填"beautifully"后无逐字匹配(疑精简/改写/错词): ""he runs quick." that needs an l-y: "___1___." "she sin" | `1b596432` |
| 9 | am1_l53 | C7-未匹配原句 | 空3填"hard"后无逐字匹配(疑精简/改写/错词): ""he runs quick." that needs an l-y: "___1___." "she sin" | `0e5fb356` |
| 9 | am1_l53 | C7-未匹配原句 | 空4填"not"后无逐字匹配(疑精简/改写/错词): ""hardly" means "almost ___4___." you explain things ___" | `68d1bcf6` |
| 9 | am1_l53 | C7-未匹配原句 | 空5填"clearly"后无逐字匹配(疑精简/改写/错词): ""hardly" means "almost ___4___." you explain things ___" | `a9fde50c` |
| 9 | am1_l54 | 查重 | 题干/原句重复×2: "big 的比较级：" @ am1_l54/s5/seq1 , am1_l54/s5/seq9 | `693484b1` |
| 10 | am1_l55 | 查重 | 题干/原句重复×2: "expensive 的比较级：" @ am1_l55/s5/seq2 , am1_l55/s5/seq9 | `a63abe7f` |
| 10 | am1_l56 | 查重 | 题干/原句重复×2: "popular 的最高级：" @ am1_l56/s5/seq2 , am1_l56/s5/seq10 | `4adc2810` |
| 10 | am1_l56 | 查重 | 题干/原句重复×2: "bad 的最高级：" @ am1_l56/s5/seq6 , am1_l56/s5/seq12 | `f1ffb7b1` |
| 10 | am1_l57 | C7-未匹配原句 | 空8填"nickels"后无逐字匹配(疑精简/改写/错词): "okay: dimes, ___..." | `a0805466` |
| 12 | am1_l70 | 查重 | 题干/原句重复×2: "打错电话道歉说：" @ am1_l70/s5/seq11 , am1_l70/s6/seq1 | `96dc7395` |
| 12 | am1_l71 | 查重 | 题干/原句重复×2: "fly 的过去分词：" @ am1_l71/s5/seq2 , am1_l71/s5/seq14 | `d912737d` |
| 12 | am1_l72 | C7-未匹配原句 | 空4填"stays"后无逐字匹配(疑精简/改写/错词): ""if the weather ___4___ nice, we'll do this every month" | `0bed6964` |
| 12 | am1_l72 | C7-未匹配原句 | 空5填"looked"后无逐字匹配(疑精简/改写/错词): ""if the weather ___4___ nice, we'll do this every month" | `dc7e0ef7` |

## ⚪ flag(信息级)（892）

| 单元 | 课 | code | 说明 | qid |
|---|---|---|---|---|
| 1 | am1_l01 | 超纲 | 疑超纲实词: umbrella \| stage5 | `1c1fc606` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: seat \| stage5 | `ec3a0d32` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: backpack \| stage5 | `a534239e` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: car \| stage5 | `d60ceca8` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: wallet \| stage5 | `c7d25e37` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: seat \| stage5 | `2d173fb8` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: cup \| stage5 | `cabcdbdf` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: seat \| stage5 | `4b0ba325` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: bag \| stage5 | `a5c24b5d` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: pen \| stage5 | `644e9f60` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: jacket \| stage5 | `e4403e23` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: hand, telephone, set, mobile, cell \| stage6 | `2d01b195` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: lady, mister, boy \| stage6 | `4f658514` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: table, desk, floor \| stage7 | `f80899ee` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: lot, many \| stage7 | `ee4c3386` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: lifetime, lifeboat, lifeguard \| stage7 | `5b1cf3ab` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: matter, question \| stage7 | `f877bd8b` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: day \| stage7 | `eab36145` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: floor, table, bag \| stage8 | `5f7991a6` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: store's \| stage8 | `1fd862a9` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: backpack \| stage10 | `5b0790f5` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: key \| stage10 | `2584e76c` |
| 1 | am1_l02 | 超纲 | 疑超纲实词: gloves \| stage5 | `dc217915` |
| 1 | am1_l02 | 超纲 | 疑超纲实词: key \| stage5 | `b4ad4ef9` |
| 1 | am1_l02 | 超纲 | 疑超纲实词: tea \| stage5 | `0de74930` |
| 1 | am1_l02 | 超纲 | 疑超纲实词: bags \| stage5 | `a8fc6b21` |
| 1 | am1_l02 | 超纲 | 疑超纲实词: bag, bags \| stage5 | `a8f178f0` |
| 1 | am1_l02 | 超纲 | 疑超纲实词: graye, grae, grey \| stage6 | `e03c6a08` |
| 1 | am1_l02 | 超纲 | 疑超纲实词: service, bus, parking, valet, self \| stage6 | `f50e1bbe` |
| 1 | am1_l02 | 超纲 | 疑超纲实词: morning \| stage6 | `6d576688` |
| 1 | am1_l02 | 超纲 | 疑超纲实词: minute, time, clock, watch \| stage7 | `6328e20a` |
| 1 | am1_l02 | 超纲 | 疑超纲实词: day, noon, clock \| stage7 | `b2bcc70d` |
| 1 | am1_l02 | 超纲 | 疑超纲实词: black \| stage7 | `0342b697` |
| 1 | am1_l02 | 超纲 | 疑超纲实词: key, cup \| stage7 | `b5f76d82` |
| 1 | am1_l02 | 超纲 | 疑超纲实词: clock, noon \| stage7 | `891d5f8f` |
| 1 | am1_l02 | 超纲 | 疑超纲实词: airport, shop, school \| stage8 | `36203ea1` |
| 1 | am1_l02 | 超纲 | 疑超纲实词: know \| stage8 | `d24c965f` |
| 1 | am1_l02 | 超纲 | 疑超纲实词: end \| stage8 | `636c7e71` |
| 1 | am1_l02 | 超纲 | 疑超纲实词: file \| stage9 | `208c1a7b` |
| 1 | am1_l03 | 超纲 | 疑超纲实词: apple \| stage5 | `5b8102df` |
| 1 | am1_l03 | 超纲 | 疑超纲实词: need, umbrella \| stage5 | `c599587a` |
| 1 | am1_l03 | 超纲 | 疑超纲实词: tea, work, class \| stage6 | `02f54f05` |
| 1 | am1_l03 | 超纲 | 疑超纲实词: high, primary, secondary \| stage6 | `89966a91` |
| 1 | am1_l03 | 超纲 | 疑超纲实词: care \| stage6 | `da224fee` |
| 1 | am1_l03 | 超纲 | 疑超纲实词: neighbourhood, nieghborhood, neighborhud \| stage6 | `f7e7d144` |
| 1 | am1_l03 | 超纲 | 疑超纲实词: old \| stage7 | `c15c2f9d` |
| 1 | am1_l03 | 超纲 | 疑超纲实词: job, nurse, student \| stage8 | `3c6a894f` |
| 1 | am1_l03 | 超纲 | 疑超纲实词: coworker \| stage9 | `0e657fb6` |
| 1 | am1_l04 | 超纲 | 疑超纲实词: amn't \| stage5 | `0bb57633` |
| 1 | am1_l04 | 超纲 | 疑超纲实词: fine \| stage5 | `7cefe8fd` |
| 1 | am1_l04 | 超纲 | 疑超纲实词: amn't \| stage5 | `b7be6d10` |
| 1 | am1_l04 | 超纲 | 疑超纲实词: work \| stage6 | `05dde83f` |
| 1 | am1_l04 | 超纲 | 疑超纲实词: community, driving, kindergarten \| stage6 | `5ee39764` |
| 1 | am1_l04 | 超纲 | 疑超纲实词: home, class \| stage7 | `3dc77f29` |
| 1 | am1_l04 | 超纲 | 疑超纲实词: hospital, class \| stage8 | `9b53e8c8` |
| 1 | am1_l04 | 超纲 | 疑超纲实词: know \| stage8 | `55167990` |
| 1 | am1_l04 | 超纲 | 疑超纲实词: firefighter \| stage9 | `e2decbf8` |
| 1 | am1_l04 | 超纲 | 疑超纲实词: amn't \| stage10 | `36fd54ee` |
| 1 | am1_l05 | 超纲 | 疑超纲实词: husband \| stage5 | `8bd7e683` |
| 1 | am1_l05 | 超纲 | 疑超纲实词: tired, tireds \| stage5 | `9c3ff073` |
| 1 | am1_l05 | 超纲 | 疑超纲实词: tires, tired, tiredly \| stage5 | `2ffa9c55` |
| 1 | am1_l05 | 超纲 | 疑超纲实词: many \| stage7 | `557c52d6` |
| 1 | am1_l05 | 超纲 | 疑超纲实词: mug \| stage7 | `be80f1a2` |
| 1 | am1_l05 | 超纲 | 疑超纲实词: helper, hand \| stage7 | `b7ff159b` |
| 1 | am1_l05 | 超纲 | 疑超纲实词: late, soon \| stage7 | `9555a68e` |
| 1 | am1_l05 | 超纲 | 疑超纲实词: noon \| stage8 | `8cc31619` |
| 1 | am1_l05 | 超纲 | 疑超纲实词: son, daughter \| stage9 | `aa28520c` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: backpack \| stage5 | `304d0066` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: desk \| stage5 | `bfa28346` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: jacket \| stage5 | `4f296358` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: brother \| stage5 | `07e165a0` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: sister \| stage5 | `83e3e275` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: Amanda \| stage5 | `681e815d` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: desk \| stage5 | `bf473551` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: sister, sister's, sisters \| stage5 | `91ef2ad4` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: brother \| stage5 | `5e7ae310` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: jacket \| stage5 | `1b3aeb7d` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: break, room, tea, rest, home, staff \| stage6 | `dabff9ac` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: bike, pillow \| stage6 | `33f10bdc` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: box \| stage7 | `d21042fc` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: desk, key \| stage7 | `253715c3` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: buy \| stage7 | `4a78245d` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: desk, bag \| stage8 | `7325c394` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: color \| stage8 | `371cb402` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: ask \| stage8 | `7bdf5af8` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: glasses \| stage9 | `3794ddfe` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: pen \| stage9 | `6fe49017` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: desk \| stage10 | `d3d4943d` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: sister \| stage10 | `37bebda0` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: this're \| stage10 | `e365c281` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: sky \| stage5 | `0aa31eb1` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: white \| stage5 | `59247cdd` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: yellow \| stage5 | `f06a5f22` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: red \| stage5 | `93095de9` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: dress \| stage5 | `2eac1d45` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: jacket, matter \| stage5 | `f05102f0` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: purple \| stage5 | `1237067f` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: cup \| stage5 | `5ba5d8d1` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: want \| stage5 | `1f21d59d` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: cup \| stage5 | `847499fc` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: culler, coler, colour \| stage6 | `9e38fe3a` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: favrit, favorate, favourite \| stage6 | `8607ffec` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: buck \| stage6 | `ab3fe01d` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: brilliant \| stage6 | `1e0693d7` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: mid, media \| stage7 | `8ad4f67d` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: shop, sell \| stage7 | `5713e61d` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: library \| stage8 | `eaa0b98b` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: want, extra, large \| stage8 | `721d2281` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: backpack \| stage9 | `dc1ae4a9` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: hat \| stage9 | `c873ee85` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: white \| stage10 | `36a336d1` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: red \| stage10 | `a0f2cbac` |
| 2 | am1_l08 | 超纲 | 疑超纲实词: gift, giftes, gifts \| stage5 | `47a01503` |
| 2 | am1_l08 | 超纲 | 疑超纲实词: chocolate, chocolates \| stage5 | `74c25b69` |
| 2 | am1_l08 | 超纲 | 疑超纲实词: suitcases \| stage5 | `32067026` |
| 2 | am1_l08 | 超纲 | 疑超纲实词: passports \| stage5 | `fb6b060c` |
| 2 | am1_l08 | 超纲 | 疑超纲实词: bags \| stage5 | `fbd95009` |
| 2 | am1_l08 | 超纲 | 疑超纲实词: gifts \| stage5 | `859beea9` |
| 2 | am1_l08 | 超纲 | 疑超纲实词: bookes \| stage5 | `bd6da41e` |
| 2 | am1_l08 | 超纲 | 疑超纲实词: trunk, track, lorry \| stage6 | `e75763ee` |
| 2 | am1_l08 | 超纲 | 疑超纲实词: cake, soup, turkey \| stage6 | `226a2b49` |
| 2 | am1_l08 | 超纲 | 疑超纲实词: bookstore, bookcase, bookshelf \| stage6 | `56b16544` |
| 2 | am1_l08 | 超纲 | 疑超纲实词: light \| stage7 | `b198047f` |
| 2 | am1_l08 | 超纲 | 疑超纲实词: booker, bookman, bookcase \| stage7 | `e0047c61` |
| 2 | am1_l08 | 超纲 | 疑超纲实词: old, late \| stage7 | `957a1cd1` |
| 2 | am1_l08 | 超纲 | 疑超纲实词: far, fully, fun \| stage7 | `604b078d` |
| 2 | am1_l08 | 超纲 | 疑超纲实词: know \| stage8 | `5c6f2d66` |
| 2 | am1_l09 | 超纲 | 疑超纲实词: uncle \| stage5 | `ceed5734` |
| 2 | am1_l09 | 超纲 | 疑超纲实词: tired \| stage5 | `1dc3228c` |
| 2 | am1_l09 | 超纲 | 疑超纲实词: nurser \| stage5 | `ba591000` |
| 2 | am1_l09 | 超纲 | 疑超纲实词: peoples, mans \| stage6 | `abe5b85c` |
| 2 | am1_l09 | 超纲 | 疑超纲实词: cheerio, brilliant, lovely \| stage6 | `62ddd1e4` |
| 2 | am1_l09 | 超纲 | 疑超纲实词: cookers \| stage7 | `067e01c1` |
| 2 | am1_l09 | 超纲 | 疑超纲实词: home, class \| stage7 | `913e4ad9` |
| 2 | am1_l09 | 超纲 | 疑超纲实词: hungry, tired \| stage7 | `e11c04e4` |
| 2 | am1_l09 | 超纲 | 疑超纲实词: holiday \| stage8 | `0bcec172` |
| 2 | am1_l09 | 超纲 | 疑超纲实词: know \| stage8 | `96c10c68` |
| 2 | am1_l10 | 超纲 | 疑超纲实词: money \| stage5 | `9f98de6e` |
| 2 | am1_l10 | 超纲 | 疑超纲实词: many, such \| stage5 | `4aca77c1` |
| 2 | am1_l10 | 超纲 | 疑超纲实词: many, realy \| stage5 | `34f2ae3b` |
| 2 | am1_l10 | 超纲 | 疑超纲实词: length \| stage5 | `2d8ee3f3` |
| 2 | am1_l10 | 超纲 | 疑超纲实词: petrol, oil, shop \| stage6 | `4b4f169a` |
| 2 | am1_l10 | 超纲 | 疑超纲实词: trial, train, rail \| stage6 | `0e4366d8` |
| 2 | am1_l10 | 超纲 | 疑超纲实词: snake, snap, sneak \| stage6 | `71f11fba` |
| 2 | am1_l10 | 超纲 | 疑超纲实词: tree, train, trip \| stage7 | `1fbd497c` |
| 2 | am1_l10 | 超纲 | 疑超纲实词: stop, shop \| stage7 | `7c754e2b` |
| 2 | am1_l10 | 超纲 | 疑超纲实词: others, other \| stage7 | `7c0e5a55` |
| 2 | am1_l10 | 超纲 | 疑超纲实词: end, library, home \| stage8 | `368b1bd9` |
| 2 | am1_l10 | 超纲 | 疑超纲实词: feel \| stage8 | `6363064c` |
| 2 | am1_l10 | 超纲 | 疑超纲实词: know \| stage8 | `78804e83` |
| 2 | am1_l11 | 超纲 | 疑超纲实词: cup \| stage5 | `3827d769` |
| 2 | am1_l11 | 超纲 | 疑超纲实词: backpack \| stage5 | `c9482263` |
| 2 | am1_l11 | 超纲 | 疑超纲实词: red, bag \| stage5 | `2cbb958e` |
| 2 | am1_l11 | 超纲 | 疑超纲实词: bag \| stage5 | `2914b93e` |
| 2 | am1_l11 | 超纲 | 疑超纲实词: want \| stage5 | `23d4bcf8` |
| 2 | am1_l11 | 超纲 | 疑超纲实词: drawer \| stage7 | `ae54f0d7` |
| 2 | am1_l11 | 超纲 | 疑超纲实词: nearly, close \| stage7 | `22883a80` |
| 2 | am1_l11 | 超纲 | 疑超纲实词: flavor, favor, famous \| stage7 | `2fb8eb1f` |
| 2 | am1_l11 | 超纲 | 疑超纲实词: old, red \| stage8 | `d27db282` |
| 2 | am1_l11 | 超纲 | 疑超纲实词: librarian's, know \| stage8 | `fd037ff7` |
| 2 | am1_l11 | 超纲 | 疑超纲实词: pen \| stage9 | `97030698` |
| 2 | am1_l11 | 超纲 | 疑超纲实词: cup \| stage9 | `59e7b599` |
| 2 | am1_l12 | 超纲 | 疑超纲实词: shoes \| stage5 | `4fb1fd64` |
| 2 | am1_l12 | 超纲 | 疑超纲实词: gloves \| stage5 | `87efc456` |
| 2 | am1_l12 | 超纲 | 疑超纲实词: key \| stage5 | `a62e3622` |
| 2 | am1_l12 | 超纲 | 疑超纲实词: gifts, bag \| stage5 | `59e7fd44` |
| 2 | am1_l12 | 超纲 | 疑超纲实词: many \| stage5 | `454884be` |
| 2 | am1_l12 | 超纲 | 疑超纲实词: bag \| stage5 | `4262ac3b` |
| 2 | am1_l12 | 超纲 | 疑超纲实词: shades, glassy, shadows, shines \| stage6 | `44e0af7f` |
| 2 | am1_l12 | 超纲 | 疑超纲实词: actual, action \| stage7 | `fe640977` |
| 2 | am1_l12 | 超纲 | 疑超纲实词: think \| stage7 | `83c9b270` |
| 2 | am1_l12 | 超纲 | 疑超纲实词: bag \| stage8 | `6476b217` |
| 2 | am1_l12 | 超纲 | 疑超纲实词: shoes \| stage9 | `8fd0798d` |
| 2 | am1_l12 | 超纲 | 疑超纲实词: gloves \| stage10 | `7c5a485f` |
| 3 | am1_l13 | 超纲 | 疑超纲实词: desk \| stage5 | `9feb3d0f` |
| 3 | am1_l13 | 超纲 | 疑超纲实词: bike \| stage5 | `f45d070d` |
| 3 | am1_l13 | 超纲 | 疑超纲实词: pen \| stage5 | `5b59e582` |
| 3 | am1_l13 | 超纲 | 疑超纲实词: cup \| stage5 | `1326ebfc` |
| 3 | am1_l13 | 超纲 | 疑超纲实词: dog, table \| stage5 | `5570be0e` |
| 3 | am1_l13 | 超纲 | 疑超纲实词: bag \| stage5 | `47013e8f` |
| 3 | am1_l13 | 超纲 | 疑超纲实词: cup, table \| stage5 | `f758a194` |
| 3 | am1_l13 | 超纲 | 疑超纲实词: bag \| stage5 | `97a64d96` |
| 3 | am1_l13 | 超纲 | 疑超纲实词: bag \| stage5 | `b1e99ff8` |
| 3 | am1_l13 | 超纲 | 疑超纲实词: cupboard, closet \| stage6 | `e260d269` |
| 3 | am1_l13 | 超纲 | 疑超纲实词: worktop, desk, floor \| stage6 | `ab7a954a` |
| 3 | am1_l13 | 超纲 | 疑超纲实词: heat, table, fire \| stage6 | `57bfcc84` |
| 3 | am1_l13 | 超纲 | 疑超纲实词: place, garage \| stage7 | `cce01972` |
| 3 | am1_l13 | 超纲 | 疑超纲实词: fresh \| stage7 | `005b0fe1` |
| 3 | am1_l13 | 超纲 | 疑超纲实词: movie, game \| stage7 | `1078edc5` |
| 3 | am1_l13 | 超纲 | 疑超纲实词: behind \| stage7 | `88f5ac45` |
| 3 | am1_l13 | 超纲 | 疑超纲实词: table \| stage8 | `f7b66d0d` |
| 3 | am1_l13 | 超纲 | 疑超纲实词: cup \| stage9 | `3f241dff` |
| 3 | am1_l13 | 超纲 | 疑超纲实词: room \| stage10 | `d775727f` |
| 3 | am1_l14 | 超纲 | 疑超纲实词: cups \| stage5 | `eef1c6f3` |
| 3 | am1_l14 | 超纲 | 疑超纲实词: cups \| stage5 | `47b2d181` |
| 3 | am1_l14 | 超纲 | 疑超纲实词: shop \| stage6 | `463a3d21` |
| 3 | am1_l14 | 超纲 | 疑超纲实词: bucket, bicycle, basket, motorcycle \| stage6 | `55f55992` |
| 3 | am1_l14 | 超纲 | 疑超纲实词: shop \| stage7 | `b6e637e5` |
| 3 | am1_l14 | 超纲 | 疑超纲实词: shop, sell, free \| stage7 | `3ecd9c63` |
| 3 | am1_l14 | 超纲 | 疑超纲实词: planning, trip \| stage8 | `18a07e6c` |
| 3 | am1_l15 | 超纲 | 疑超纲实词: pie \| stage5 | `ec45a5e9` |
| 3 | am1_l15 | 超纲 | 疑超纲实词: cold \| stage5 | `1d2bff41` |
| 3 | am1_l15 | 超纲 | 疑超纲实词: candy, biscuit, bread \| stage6 | `64c6de72` |
| 3 | am1_l15 | 超纲 | 疑超纲实词: plate \| stage7 | `781e6414` |
| 3 | am1_l15 | 超纲 | 疑超纲实词: cold, sweet \| stage7 | `ea607459` |
| 3 | am1_l15 | 超纲 | 疑超纲实词: cold \| stage7 | `30ae28b6` |
| 3 | am1_l15 | 超纲 | 疑超纲实词: charming \| stage7 | `d8265d6c` |
| 3 | am1_l15 | 超纲 | 疑超纲实词: meal \| stage7 | `4e711ba6` |
| 3 | am1_l15 | 超纲 | 疑超纲实词: shop \| stage8 | `0e149298` |
| 3 | am1_l15 | 超纲 | 疑超纲实词: cake \| stage10 | `aac2ba04` |
| 3 | am1_l15 | 超纲 | 疑超纲实词: again \| stage10 | `f8a1b282` |
| 3 | am1_l16 | 超纲 | 疑超纲实词: watches \| stage5 | `64a220a4` |
| 3 | am1_l16 | 超纲 | 疑超纲实词: tall \| stage5 | `73b476cf` |
| 3 | am1_l16 | 超纲 | 疑超纲实词: ing \| stage5 | `e015ba72` |
| 3 | am1_l16 | 超纲 | 疑超纲实词: ing, sitting \| stage5 | `60417d4d` |
| 3 | am1_l16 | 超纲 | 疑超纲实词: run, ing, runs, running, runned, runing \| stage5 | `35fa46b1` |
| 3 | am1_l16 | 超纲 | 疑超纲实词: watch, ing, watched, watchs \| stage5 | `132427b3` |
| 3 | am1_l16 | 超纲 | 疑超纲实词: ing, comming \| stage5 | `7c140fd1` |
| 3 | am1_l16 | 超纲 | 疑超纲实词: sweater, salty, sweaty \| stage6 | `ad1ad133` |
| 3 | am1_l16 | 超纲 | 疑超纲实词: goal \| stage6 | `e7dcdf74` |
| 3 | am1_l16 | 超纲 | 疑超纲实词: watch \| stage6 | `f1f3cafb` |
| 3 | am1_l16 | 超纲 | 疑超纲实词: watch, watches, watched \| stage7 | `90b8534f` |
| 3 | am1_l16 | 超纲 | 疑超纲实词: works, work, worked \| stage7 | `edfa0581` |
| 3 | am1_l16 | 超纲 | 疑超纲实词: sleeps, slept \| stage7 | `2d1b07b6` |
| 3 | am1_l16 | 超纲 | 疑超纲实词: gonna \| stage7 | `ac8588c2` |
| 3 | am1_l16 | 超纲 | 疑超纲实词: selling \| stage7 | `fc4880ee` |
| 3 | am1_l16 | 超纲 | 疑超纲实词: sandwich, food \| stage8 | `f5c74169` |
| 3 | am1_l16 | 超纲 | 疑超纲实词: watch, watches \| stage10 | `53981ba6` |
| 3 | am1_l17 | 超纲 | 疑超纲实词: sell, sells \| stage5 | `4fc73cfa` |
| 3 | am1_l17 | 超纲 | 疑超纲实词: guy \| stage5 | `3b99958f` |
| 3 | am1_l17 | 超纲 | 疑超纲实词: whether \| stage5 | `9a37a0a3` |
| 3 | am1_l17 | 超纲 | 疑超纲实词: rainy, snowy, cloudy \| stage5 | `889423e3` |
| 3 | am1_l17 | 超纲 | 疑超纲实词: sell \| stage5 | `4b5f7789` |
| 3 | am1_l17 | 超纲 | 疑超纲实词: sun \| stage5 | `91b08e3a` |
| 3 | am1_l17 | 超纲 | 疑超纲实词: queue, stand \| stage6 | `7dad00c6` |
| 3 | am1_l17 | 超纲 | 疑超纲实词: meal, bus, eat \| stage6 | `f1f71e46` |
| 3 | am1_l17 | 超纲 | 疑超纲实词: babies, childs \| stage6 | `567ddc0b` |
| 3 | am1_l17 | 超纲 | 疑超纲实词: flies, fly, flew \| stage7 | `efbee5f1` |
| 3 | am1_l17 | 超纲 | 疑超纲实词: sell, sells \| stage7 | `07d47746` |
| 3 | am1_l17 | 超纲 | 疑超纲实词: queue, road, list \| stage7 | `1215e111` |
| 3 | am1_l17 | 超纲 | 疑超纲实词: cold \| stage7 | `dfbd1d53` |
| 3 | am1_l17 | 超纲 | 疑超纲实词: soccer \| stage10 | `6d9fb87f` |
| 3 | am1_l17 | 超纲 | 疑超纲实词: fly, flies \| stage10 | `86480829` |
| 3 | am1_l18 | 超纲 | 疑超纲实词: run \| stage5 | `dac5674b` |
| 3 | am1_l18 | 超纲 | 疑超纲实词: farm, field, vegetable, mall \| stage6 | `b7f4c340` |
| 3 | am1_l18 | 超纲 | 疑超纲实词: sell, sells \| stage7 | `8734852e` |
| 3 | am1_l18 | 超纲 | 疑超纲实词: plays, play, played \| stage7 | `1b98a15b` |
| 3 | am1_l18 | 超纲 | 疑超纲实词: runing, run, runs \| stage7 | `d7b858e7` |
| 3 | am1_l18 | 超纲 | 疑超纲实词: stand \| stage7 | `88af4145` |
| 3 | am1_l18 | 超纲 | 疑超纲实词: stand \| stage8 | `eb35e259` |
| 4 | am1_l19 | 超纲 | 疑超纲实词: gone \| stage5 | `43555edb` |
| 4 | am1_l19 | 超纲 | 疑超纲实词: made \| stage5 | `605261f7` |
| 4 | am1_l19 | 超纲 | 疑超纲实词: weekend \| stage5 | `61d69543` |
| 4 | am1_l19 | 超纲 | 疑超纲实词: bubble, juice, fizzy \| stage6 | `a69395ff` |
| 4 | am1_l19 | 超纲 | 疑超纲实词: buffet, fair, potluck \| stage6 | `98ea9f82` |
| 4 | am1_l19 | 超纲 | 疑超纲实词: gone \| stage7 | `3dd189e8` |
| 4 | am1_l19 | 超纲 | 疑超纲实词: made \| stage7 | `fb31ae55` |
| 4 | am1_l19 | 超纲 | 疑超纲实词: brought \| stage7 | `d30a772c` |
| 4 | am1_l19 | 超纲 | 疑超纲实词: busy \| stage7 | `bead0e21` |
| 4 | am1_l19 | 超纲 | 疑超纲实词: point \| stage7 | `a7a4e2c0` |
| 4 | am1_l19 | 超纲 | 疑超纲实词: soon \| stage7 | `514bc91e` |
| 4 | am1_l19 | 超纲 | 疑超纲实词: banner \| stage8 | `1ec24eb7` |
| 4 | am1_l19 | 超纲 | 疑超纲实词: weekend \| stage9 | `d39c30fd` |
| 4 | am1_l19 | 超纲 | 疑超纲实词: went \| stage10 | `74c9179b` |
| 4 | am1_l20 | 超纲 | 疑超纲实词: loud \| stage5 | `7611990a` |
| 4 | am1_l20 | 超纲 | 疑超纲实词: low \| stage5 | `b62cb403` |
| 4 | am1_l20 | 超纲 | 疑超纲实词: eat \| stage5 | `bc6a0657` |
| 4 | am1_l20 | 超纲 | 疑超纲实词: dropping, dropped \| stage5 | `62a259f5` |
| 4 | am1_l20 | 超纲 | 疑超纲实词: late \| stage5 | `0cdec17e` |
| 4 | am1_l20 | 超纲 | 疑超纲实词: secret, hide, quiet \| stage6 | `39df39c1` |
| 4 | am1_l20 | 超纲 | 疑超纲实词: shut, light, close, switch \| stage6 | `86cd2220` |
| 4 | am1_l20 | 超纲 | 疑超纲实词: hang, hangs, hung \| stage7 | `527cce1f` |
| 4 | am1_l20 | 超纲 | 疑超纲实词: carry, carries, carried \| stage7 | `8c6bc852` |
| 4 | am1_l20 | 超纲 | 疑超纲实词: song \| stage7 | `7a1a01a0` |
| 4 | am1_l20 | 超纲 | 疑超纲实词: end \| stage8 | `fd242e86` |
| 4 | am1_l20 | 超纲 | 疑超纲实词: made \| stage10 | `b1f8555b` |
| 4 | am1_l21 | 超纲 | 疑超纲实词: many \| stage5 | `58d542b9` |
| 4 | am1_l21 | 超纲 | 疑超纲实词: freezer, fridger, refrigerator \| stage6 | `938231ad` |
| 4 | am1_l21 | 超纲 | 疑超纲实词: chart \| stage7 | `9c47117f` |
| 4 | am1_l21 | 超纲 | 疑超纲实词: many \| stage7 | `b463443c` |
| 4 | am1_l21 | 超纲 | 疑超纲实词: many \| stage8 | `b59e2c67` |
| 4 | am1_l22 | 超纲 | 疑超纲实词: sang \| stage5 | `e0997672` |
| 4 | am1_l22 | 超纲 | 疑超纲实词: sang \| stage5 | `3a424b29` |
| 4 | am1_l22 | 超纲 | 疑超纲实词: road, team \| stage6 | `edda56e0` |
| 4 | am1_l22 | 超纲 | 疑超纲实词: sang \| stage7 | `8111721f` |
| 4 | am1_l22 | 超纲 | 疑超纲实词: piano \| stage7 | `71652e6e` |
| 4 | am1_l22 | 超纲 | 疑超纲实词: piano \| stage8 | `8a2be019` |
| 4 | am1_l22 | 超纲 | 疑超纲实词: swim \| stage10 | `ad9f6550` |
| 4 | am1_l23 | 超纲 | 疑超纲实词: gift \| stage5 | `363b11ff` |
| 4 | am1_l23 | 超纲 | 疑超纲实词: most \| stage6 | `77a8393a` |
| 4 | am1_l23 | 超纲 | 疑超纲实词: most \| stage7 | `4eeca535` |
| 4 | am1_l23 | 超纲 | 疑超纲实词: date \| stage7 | `53e525da` |
| 4 | am1_l23 | 超纲 | 疑超纲实词: other, again \| stage7 | `d49d289b` |
| 4 | am1_l23 | 超纲 | 疑超纲实词: ask, photo \| stage8 | `5738fbf8` |
| 4 | am1_l23 | 超纲 | 疑超纲实词: gift \| stage10 | `6170a3eb` |
| 4 | am1_l24 | 超纲 | 疑超纲实词: ever \| stage6 | `f774d593` |
| 4 | am1_l24 | 超纲 | 疑超纲实词: cold \| stage7 | `6bc77376` |
| 4 | am1_l24 | 超纲 | 疑超纲实词: cold \| stage7 | `e9e9955f` |
| 4 | am1_l24 | 超纲 | 疑超纲实词: chance \| stage7 | `40d50a9a` |
| 4 | am1_l24 | 超纲 | 疑超纲实词: gave \| stage7 | `1159555a` |
| 4 | am1_l24 | 超纲 | 疑超纲实词: office \| stage8 | `f66c968c` |
| 4 | am1_l24 | 超纲 | 疑超纲实词: Rosa's \| stage8 | `f14a7005` |
| 5 | am1_l25 | 超纲 | 疑超纲实词: song \| stage5 | `b3869fd7` |
| 5 | am1_l25 | 超纲 | 疑超纲实词: movie, watches, watched, watch \| stage5 | `90b19fbc` |
| 5 | am1_l25 | 超纲 | 疑超纲实词: board \| stage5 | `54e86004` |
| 5 | am1_l25 | 超纲 | 疑超纲实词: most \| stage5 | `4c827687` |
| 5 | am1_l25 | 超纲 | 疑超纲实词: watch, movie \| stage5 | `f93c66b5` |
| 5 | am1_l25 | 超纲 | 疑超纲实词: watch \| stage5 | `316d5d86` |
| 5 | am1_l25 | 超纲 | 疑超纲实词: most \| stage7 | `a53cdc65` |
| 5 | am1_l25 | 超纲 | 疑超纲实词: thick \| stage7 | `566bee15` |
| 5 | am1_l26 | 超纲 | 疑超纲实词: late, most \| stage5 | `c9669c74` |
| 5 | am1_l26 | 超纲 | 疑超纲实词: most \| stage5 | `978f5d8c` |
| 5 | am1_l26 | 超纲 | 疑超纲实词: week \| stage5 | `1e5189c9` |
| 5 | am1_l26 | 超纲 | 疑超纲实词: late, most \| stage5 | `1b42e972` |
| 5 | am1_l26 | 超纲 | 疑超纲实词: late \| stage5 | `4034f83a` |
| 5 | am1_l26 | 超纲 | 疑超纲实词: most \| stage5 | `62de57ca` |
| 5 | am1_l26 | 超纲 | 疑超纲实词: hold, catch \| stage6 | `5e43d474` |
| 5 | am1_l26 | 超纲 | 疑超纲实词: most \| stage7 | `39af0b72` |
| 5 | am1_l26 | 超纲 | 疑超纲实词: grabbing, grabbed \| stage7 | `6d4c2b5e` |
| 5 | am1_l26 | 超纲 | 疑超纲实词: seat, story \| stage7 | `fe61aae1` |
| 5 | am1_l26 | 超纲 | 疑超纲实词: tea \| stage7 | `c88bb18f` |
| 5 | am1_l26 | 超纲 | 疑超纲实词: photo, paper \| stage7 | `7f15732a` |
| 5 | am1_l26 | 超纲 | 疑超纲实词: chips, cereal \| stage7 | `ea21cec1` |
| 5 | am1_l26 | 超纲 | 疑超纲实词: work \| stage8 | `a8a8d493` |
| 5 | am1_l26 | 超纲 | 疑超纲实词: most \| stage10 | `1cbcc47d` |
| 5 | am1_l26 | 超纲 | 疑超纲实词: late, ever \| stage10 | `18683f01` |
| 5 | am1_l26 | 超纲 | 疑超纲实词: most \| stage10 | `422a7609` |
| 5 | am1_l26 | 超纲 | 疑超纲实词: mind \| stage10 | `89d8ea4e` |
| 5 | am1_l27 | 超纲 | 疑超纲实词: work \| stage5 | `6fccc298` |
| 5 | am1_l27 | 超纲 | 疑超纲实词: washies \| stage5 | `85020a2e` |
| 5 | am1_l27 | 超纲 | 疑超纲实词: teach, teaching, teachs, teaches, teach's \| stage5 | `61bafd9a` |
| 5 | am1_l27 | 超纲 | 疑超纲实词: go's \| stage5 | `51e2ff82` |
| 5 | am1_l27 | 超纲 | 疑超纲实词: bedmate, flatmate \| stage6 | `40beeebb` |
| 5 | am1_l27 | 超纲 | 疑超纲实词: luck \| stage6 | `5e78dd60` |
| 5 | am1_l27 | 超纲 | 疑超纲实词: work \| stage7 | `6cc3bbfa` |
| 5 | am1_l27 | 超纲 | 疑超纲实词: made \| stage7 | `2a41f7e3` |
| 5 | am1_l27 | 超纲 | 疑超纲实词: noon \| stage7 | `f4d1d639` |
| 5 | am1_l27 | 超纲 | 疑超纲实词: work, grocery \| stage8 | `b43bc5ec` |
| 5 | am1_l27 | 超纲 | 疑超纲实词: work \| stage10 | `153d8065` |
| 5 | am1_l28 | 超纲 | 疑超纲实词: movies \| stage5 | `4f53baa8` |
| 5 | am1_l28 | 超纲 | 疑超纲实词: movies \| stage5 | `7a1df854` |
| 5 | am1_l28 | 超纲 | 疑超纲实词: fireman, burn, fighter, fire, worker \| stage6 | `c3848881` |
| 5 | am1_l28 | 超纲 | 疑超纲实词: football, rugby, hockey, baseball \| stage6 | `3e858e04` |
| 5 | am1_l28 | 超纲 | 疑超纲实词: work \| stage7 | `80f03425` |
| 5 | am1_l28 | 超纲 | 疑超纲实词: took \| stage7 | `b4304c03` |
| 5 | am1_l28 | 超纲 | 疑超纲实词: ate \| stage7 | `f1a54733` |
| 5 | am1_l28 | 超纲 | 疑超纲实词: sister \| stage9 | `5124f83b` |
| 5 | am1_l28 | 超纲 | 疑超纲实词: work \| stage10 | `4ccbb2a6` |
| 5 | am1_l29 | 超纲 | 疑超纲实词: drank \| stage5 | `475115e9` |
| 5 | am1_l29 | 超纲 | 疑超纲实词: trains, trained, train \| stage5 | `cd7ca696` |
| 5 | am1_l29 | 超纲 | 疑超纲实词: drank \| stage5 | `d140b1c5` |
| 5 | am1_l29 | 超纲 | 疑超纲实词: ran \| stage5 | `3ee0de9c` |
| 5 | am1_l29 | 超纲 | 疑超纲实词: ran \| stage5 | `02243007` |
| 5 | am1_l29 | 超纲 | 疑超纲实词: fries, crisps \| stage6 | `66d9f436` |
| 5 | am1_l29 | 超纲 | 疑超纲实词: drank \| stage7 | `792c4365` |
| 5 | am1_l29 | 超纲 | 疑超纲实词: train, trains, trained \| stage7 | `c90b11d0` |
| 5 | am1_l29 | 超纲 | 疑超纲实词: late, again \| stage7 | `5c3ee966` |
| 5 | am1_l29 | 超纲 | 疑超纲实词: difficult \| stage7 | `7ac243a8` |
| 5 | am1_l29 | 超纲 | 疑超纲实词: step, shoes \| stage7 | `d75f1286` |
| 5 | am1_l29 | 超纲 | 疑超纲实词: sat \| stage10 | `611739e1` |
| 5 | am1_l29 | 超纲 | 疑超纲实词: ta \| stage10 | `b5929c02` |
| 5 | am1_l30 | 超纲 | 疑超纲实词: pair, loaf, slice \| stage5 | `5a565a75` |
| 5 | am1_l30 | 超纲 | 疑超纲实词: cup, glass \| stage5 | `c1518451` |
| 5 | am1_l30 | 超纲 | 疑超纲实词: cup \| stage5 | `fdc43ced` |
| 5 | am1_l30 | 超纲 | 疑超纲实词: glass \| stage5 | `a7ccf6ab` |
| 5 | am1_l30 | 超纲 | 疑超纲实词: cents \| stage5 | `b4b833b4` |
| 5 | am1_l30 | 超纲 | 疑超纲实词: ship, grocery, vegetable \| stage6 | `9b046962` |
| 5 | am1_l30 | 超纲 | 疑超纲实词: cup, glass \| stage7 | `71da98be` |
| 5 | am1_l30 | 超纲 | 疑超纲实词: fifteen, o'clock \| stage7 | `79162f75` |
| 5 | am1_l30 | 超纲 | 疑超纲实词: talking \| stage8 | `f7f21760` |
| 5 | am1_l30 | 超纲 | 疑超纲实词: add, end \| stage8 | `3699bf90` |
| 5 | am1_l30 | 超纲 | 疑超纲实词: slice, loaf, pair \| stage10 | `c69ae2ee` |
| 5 | am1_l30 | 超纲 | 疑超纲实词: pair, slice \| stage10 | `7a1e4d64` |
| 6 | am1_l31 | 超纲 | 疑超纲实词: hand, foot, head \| stage5 | `83d57667` |
| 6 | am1_l31 | 超纲 | 疑超纲实词: headache \| stage5 | `c7462ff4` |
| 6 | am1_l31 | 超纲 | 疑超纲实词: felt \| stage5 | `f95744d3` |
| 6 | am1_l31 | 超纲 | 疑超纲实词: headache \| stage5 | `48bc2205` |
| 6 | am1_l31 | 超纲 | 疑超纲实词: favor, cover \| stage5 | `58bdee0f` |
| 6 | am1_l31 | 超纲 | 疑超纲实词: silly, sock \| stage5 | `23621608` |
| 6 | am1_l31 | 超纲 | 疑超纲实词: ill \| stage6 | `7295cbd9` |
| 6 | am1_l31 | 超纲 | 疑超纲实词: felt \| stage7 | `83e58d41` |
| 6 | am1_l31 | 超纲 | 疑超纲实词: hand, foot, head \| stage7 | `82514285` |
| 6 | am1_l31 | 超纲 | 疑超纲实词: round \| stage7 | `42c4b04c` |
| 6 | am1_l31 | 超纲 | 疑超纲实词: talking, boss \| stage8 | `3d99fd79` |
| 6 | am1_l31 | 超纲 | 疑超纲实词: headache, stomachache \| stage8 | `26824f82` |
| 6 | am1_l31 | 超纲 | 疑超纲实词: end \| stage8 | `6488fd6f` |
| 6 | am1_l31 | 超纲 | 疑超纲实词: felt \| stage10 | `2e3c6653` |
| 6 | am1_l32 | 超纲 | 疑超纲实词: needn't \| stage5 | `1b26cba7` |
| 6 | am1_l32 | 超纲 | 疑超纲实词: drank \| stage5 | `54afe164` |
| 6 | am1_l32 | 超纲 | 疑超纲实词: need \| stage5 | `383203d9` |
| 6 | am1_l32 | 超纲 | 疑超纲实词: needn't \| stage5 | `bfda816e` |
| 6 | am1_l32 | 超纲 | 疑超纲实词: need \| stage5 | `5e4d3b94` |
| 6 | am1_l32 | 超纲 | 疑超纲实词: number \| stage6 | `834be248` |
| 6 | am1_l32 | 超纲 | 疑超纲实词: outside, rule, accept, questions, ask \| stage6 | `a1e006dd` |
| 6 | am1_l32 | 超纲 | 疑超纲实词: brought \| stage7 | `e4b01965` |
| 6 | am1_l32 | 超纲 | 疑超纲实词: need \| stage7 | `fa3771d0` |
| 6 | am1_l32 | 超纲 | 疑超纲实词: photo, seat \| stage7 | `91cab484` |
| 6 | am1_l32 | 超纲 | 疑超纲实词: expressions, questions, examples \| stage7 | `eea1b87d` |
| 6 | am1_l32 | 超纲 | 疑超纲实词: point \| stage7 | `2c1bd52c` |
| 6 | am1_l32 | 超纲 | 疑超纲实词: doctor's, office \| stage8 | `4d9521a0` |
| 6 | am1_l32 | 超纲 | 疑超纲实词: many \| stage8 | `587f465d` |
| 6 | am1_l32 | 超纲 | 疑超纲实词: needn't \| stage10 | `52b5e42e` |
| 6 | am1_l32 | 超纲 | 疑超纲实词: fire, needn't \| stage10 | `6409b1c8` |
| 6 | am1_l33 | 超纲 | 疑超纲实词: needn't \| stage5 | `2015f684` |
| 6 | am1_l33 | 超纲 | 疑超纲实词: needn't \| stage5 | `6fdcfdf5` |
| 6 | am1_l33 | 超纲 | 疑超纲实词: nothing \| stage5 | `a4c1e749` |
| 6 | am1_l33 | 超纲 | 疑超纲实词: needn't \| stage5 | `558fbcbe` |
| 6 | am1_l33 | 超纲 | 疑超纲实词: needn't \| stage6 | `7b3ede40` |
| 6 | am1_l33 | 超纲 | 疑超纲实词: wall, hall, mill \| stage6 | `383742af` |
| 6 | am1_l33 | 超纲 | 疑超纲实词: money \| stage6 | `215b51fa` |
| 6 | am1_l33 | 超纲 | 疑超纲实词: worried \| stage7 | `7299f8ca` |
| 6 | am1_l33 | 超纲 | 疑超纲实词: mail, hall \| stage7 | `d8883b41` |
| 6 | am1_l33 | 超纲 | 疑超纲实词: dirty, close \| stage7 | `0bd820b1` |
| 6 | am1_l33 | 超纲 | 疑超纲实词: cups, clothes \| stage7 | `f9f4ad4e` |
| 6 | am1_l33 | 超纲 | 疑超纲实词: noon \| stage7 | `aaa7ffd7` |
| 6 | am1_l33 | 超纲 | 疑超纲实词: wedding \| stage8 | `c5b15389` |
| 6 | am1_l33 | 超纲 | 疑超纲实词: often, end \| stage8 | `031f4de7` |
| 6 | am1_l34 | 超纲 | 疑超纲实词: summer \| stage5 | `59119145` |
| 6 | am1_l34 | 超纲 | 疑超纲实词: end \| stage6 | `29fc8da4` |
| 6 | am1_l34 | 超纲 | 疑超纲实词: quiet \| stage7 | `3fefd740` |
| 6 | am1_l34 | 超纲 | 疑超纲实词: photo \| stage7 | `3242af99` |
| 6 | am1_l34 | 超纲 | 疑超纲实词: away, angry \| stage7 | `73987c36` |
| 6 | am1_l34 | 超纲 | 疑超纲实词: door, hall \| stage7 | `d79d2569` |
| 6 | am1_l34 | 超纲 | 疑超纲实词: most \| stage7 | `7fc3305d` |
| 6 | am1_l35 | 超纲 | 疑超纲实词: stand, year \| stage5 | `5e90655c` |
| 6 | am1_l35 | 超纲 | 疑超纲实词: year \| stage5 | `84f0b7b1` |
| 6 | am1_l35 | 超纲 | 疑超纲实词: year \| stage5 | `2703f4ff` |
| 6 | am1_l35 | 超纲 | 疑超纲实词: year \| stage5 | `9ba86f2a` |
| 6 | am1_l35 | 超纲 | 疑超纲实词: court, fire, country, fear \| stage6 | `c7b636f2` |
| 6 | am1_l35 | 超纲 | 疑超纲实词: festival, ring \| stage6 | `df26c2a0` |
| 6 | am1_l35 | 超纲 | 疑超纲实词: double \| stage7 | `85a09fdd` |
| 6 | am1_l35 | 超纲 | 疑超纲实词: piano \| stage7 | `e0241a68` |
| 6 | am1_l35 | 超纲 | 疑超纲实词: tiny \| stage7 | `91addbb0` |
| 6 | am1_l35 | 超纲 | 疑超纲实词: coke, case \| stage7 | `49dd4f76` |
| 6 | am1_l35 | 超纲 | 疑超纲实词: nowhere, anywhere \| stage7 | `7821092e` |
| 6 | am1_l35 | 超纲 | 疑超纲实词: winter, year \| stage7 | `b7d45e96` |
| 6 | am1_l35 | 超纲 | 疑超纲实词: year \| stage10 | `7410245b` |
| 6 | am1_l36 | 超纲 | 疑超纲实词: stopping \| stage5 | `52185d08` |
| 6 | am1_l36 | 超纲 | 疑超纲实词: ed, w \| stage5 | `46f00e4f` |
| 6 | am1_l36 | 超纲 | 疑超纲实词: spiled \| stage5 | `0fb3e45f` |
| 6 | am1_l36 | 超纲 | 疑超纲实词: closd \| stage5 | `67a9ea85` |
| 6 | am1_l36 | 超纲 | 疑超纲实词: ed \| stage5 | `a799b243` |
| 6 | am1_l36 | 超纲 | 疑超纲实词: far \| stage5 | `809d22c7` |
| 6 | am1_l36 | 超纲 | 疑超纲实词: road \| stage6 | `1b6990a6` |
| 6 | am1_l36 | 超纲 | 疑超纲实词: stopping \| stage7 | `08ee0810` |
| 6 | am1_l36 | 超纲 | 疑超纲实词: fired, tried \| stage7 | `8f2eb58a` |
| 6 | am1_l36 | 超纲 | 疑超纲实词: most, mass \| stage7 | `b33ba1f1` |
| 6 | am1_l36 | 超纲 | 疑超纲实词: happens, happen \| stage7 | `c633d888` |
| 6 | am1_l36 | 超纲 | 疑超纲实词: mixed \| stage7 | `2f199853` |
| 6 | am1_l36 | 超纲 | 疑超纲实词: spoiled, spelled, skilled \| stage7 | `2b56f161` |
| 6 | am1_l36 | 超纲 | 疑超纲实词: office \| stage8 | `118a2806` |
| 7 | am1_l37 | 超纲 | 疑超纲实词: gone \| stage5 | `f19d063f` |
| 7 | am1_l37 | 超纲 | 疑超纲实词: sunset \| stage5 | `91fb0736` |
| 7 | am1_l37 | 超纲 | 疑超纲实词: year \| stage5 | `3d719b42` |
| 7 | am1_l37 | 超纲 | 疑超纲实词: sunset \| stage5 | `68e5514b` |
| 7 | am1_l37 | 超纲 | 疑超纲实词: until \| stage5 | `4fd981ae` |
| 7 | am1_l37 | 超纲 | 疑超纲实词: fly \| stage6 | `c4f29e03` |
| 7 | am1_l37 | 超纲 | 疑超纲实词: dive \| stage7 | `cf31c672` |
| 7 | am1_l37 | 超纲 | 疑超纲实词: burrito \| stage7 | `e6531e0a` |
| 7 | am1_l37 | 超纲 | 疑超纲实词: noon, midnight, sunset \| stage7 | `1b7bfa4d` |
| 7 | am1_l37 | 超纲 | 疑超纲实词: joyful \| stage7 | `2751bf2c` |
| 7 | am1_l37 | 超纲 | 疑超纲实词: nothing, something \| stage7 | `c83b7269` |
| 7 | am1_l37 | 超纲 | 疑超纲实词: eaten \| stage10 | `d6e6af2e` |
| 7 | am1_l38 | 超纲 | 疑超纲实词: buy, buying, buyed, buys \| stage5 | `11017372` |
| 7 | am1_l38 | 超纲 | 疑超纲实词: wear, wearing, weared, wears \| stage5 | `76395d0f` |
| 7 | am1_l38 | 超纲 | 疑超纲实词: pay, pays, paying, payed \| stage5 | `c25f6740` |
| 7 | am1_l38 | 超纲 | 疑超纲实词: buys, jacket \| stage5 | `936048ab` |
| 7 | am1_l38 | 超纲 | 疑超纲实词: shoes \| stage5 | `a9516d93` |
| 7 | am1_l38 | 超纲 | 疑超纲实词: payed, pays, paying \| stage5 | `7289fa26` |
| 7 | am1_l38 | 超纲 | 疑超纲实词: getted \| stage5 | `bf5491bf` |
| 7 | am1_l38 | 超纲 | 疑超纲实词: jacket, buyed, buying, buys \| stage5 | `852a5fe9` |
| 7 | am1_l38 | 超纲 | 疑超纲实词: weared, wears, wearing \| stage5 | `36da1492` |
| 7 | am1_l38 | 超纲 | 疑超纲实词: many \| stage5 | `b54fb833` |
| 7 | am1_l38 | 超纲 | 疑超纲实词: jacket \| stage5 | `5c7882d7` |
| 7 | am1_l38 | 超纲 | 疑超纲实词: trainers, sneak, shoes \| stage6 | `79674060` |
| 7 | am1_l38 | 超纲 | 疑超纲实词: buy, buyed, buys \| stage7 | `deb44408` |
| 7 | am1_l38 | 超纲 | 疑超纲实词: wear, weared, wears \| stage7 | `f25292d0` |
| 7 | am1_l38 | 超纲 | 疑超纲实词: getted \| stage7 | `4f8aa2ef` |
| 7 | am1_l38 | 超纲 | 疑超纲实词: pay, payed, pays \| stage7 | `02f09d45` |
| 7 | am1_l38 | 超纲 | 疑超纲实词: speakers, singers \| stage7 | `5683acdb` |
| 7 | am1_l38 | 超纲 | 疑超纲实词: team \| stage7 | `83cf046c` |
| 7 | am1_l38 | 超纲 | 疑超纲实词: recipe \| stage7 | `959ce32c` |
| 7 | am1_l38 | 超纲 | 疑超纲实词: smell, soft, tall \| stage7 | `fa21abb9` |
| 7 | am1_l38 | 超纲 | 疑超纲实词: shoe \| stage7 | `bf005b0f` |
| 7 | am1_l38 | 超纲 | 疑超纲实词: buy, buys, buying \| stage10 | `1b242299` |
| 7 | am1_l38 | 超纲 | 疑超纲实词: jacket, wear, wears, weared \| stage10 | `44a0eb29` |
| 7 | am1_l38 | 超纲 | 疑超纲实词: many \| stage10 | `b332bc62` |
| 7 | am1_l38 | 超纲 | 疑超纲实词: payed, pay, pays \| stage10 | `32e056b4` |
| 7 | am1_l39 | 超纲 | 疑超纲实词: seen \| stage5 | `5acf5560` |
| 7 | am1_l39 | 超纲 | 疑超纲实词: buy \| stage5 | `a24cb959` |
| 7 | am1_l39 | 超纲 | 疑超纲实词: came \| stage5 | `05d89c60` |
| 7 | am1_l39 | 超纲 | 疑超纲实词: office \| stage5 | `0ab4dcfb` |
| 7 | am1_l39 | 超纲 | 疑超纲实词: came \| stage5 | `8c0679fb` |
| 7 | am1_l39 | 超纲 | 疑超纲实词: office \| stage6 | `98eba3f3` |
| 7 | am1_l39 | 超纲 | 疑超纲实词: restart, return \| stage7 | `4826c548` |
| 7 | am1_l39 | 超纲 | 疑超纲实词: mixed, made \| stage7 | `c9c40ce4` |
| 7 | am1_l39 | 超纲 | 疑超纲实词: many \| stage7 | `4a25d0d4` |
| 7 | am1_l39 | 超纲 | 疑超纲实词: most, many \| stage7 | `461a2557` |
| 7 | am1_l39 | 超纲 | 疑超纲实词: boss, office \| stage8 | `9760c63f` |
| 7 | am1_l39 | 超纲 | 疑超纲实词: forgot \| stage8 | `fc4f5641` |
| 7 | am1_l39 | 超纲 | 疑超纲实词: away, came \| stage8 | `0b6f8d59` |
| 7 | am1_l40 | 超纲 | 疑超纲实词: trolley \| stage6 | `3bf50036` |
| 7 | am1_l40 | 超纲 | 疑超纲实词: empty \| stage7 | `bd783927` |
| 7 | am1_l40 | 超纲 | 疑超纲实词: pantry \| stage7 | `c3434d14` |
| 7 | am1_l40 | 超纲 | 疑超纲实词: burritos \| stage7 | `7ec30d95` |
| 7 | am1_l40 | 超纲 | 疑超纲实词: cap \| stage7 | `4d7b27bf` |
| 7 | am1_l40 | 超纲 | 疑超纲实词: pay \| stage7 | `5d5ba5bc` |
| 7 | am1_l40 | 超纲 | 疑超纲实词: talk \| stage8 | `7a61f84c` |
| 7 | am1_l41 | 超纲 | 疑超纲实词: winned, winning \| stage5 | `c9a91489` |
| 7 | am1_l41 | 超纲 | 疑超纲实词: winning \| stage7 | `784e5f50` |
| 7 | am1_l41 | 超纲 | 疑超纲实词: castle, case \| stage7 | `92042a8f` |
| 7 | am1_l41 | 超纲 | 疑超纲实词: far \| stage7 | `d5e8431d` |
| 7 | am1_l41 | 超纲 | 疑超纲实词: video \| stage7 | `40ec3b42` |
| 7 | am1_l41 | 超纲 | 疑超纲实词: cap, map, lab \| stage7 | `b1d2710e` |
| 7 | am1_l41 | 超纲 | 疑超纲实词: movie \| stage8 | `de480e1c` |
| 7 | am1_l41 | 超纲 | 疑超纲实词: winning \| stage10 | `0d952599` |
| 7 | am1_l42 | 超纲 | 疑超纲实词: swim, swims, swimmed, swimming \| stage5 | `2081fda4` |
| 7 | am1_l42 | 超纲 | 疑超纲实词: forget, forgetted, forgets, forgetting \| stage5 | `ceb6e0ba` |
| 7 | am1_l42 | 超纲 | 疑超纲实词: swims \| stage5 | `0ab61524` |
| 7 | am1_l42 | 超纲 | 疑超纲实词: holiday \| stage6 | `28fc0796` |
| 7 | am1_l42 | 超纲 | 疑超纲实词: moneys \| stage6 | `455eb912` |
| 7 | am1_l42 | 超纲 | 疑超纲实词: flew \| stage7 | `d40f5212` |
| 7 | am1_l42 | 超纲 | 疑超纲实词: swim, swims, swimming \| stage7 | `5bb17b91` |
| 7 | am1_l42 | 超纲 | 疑超纲实词: forget, forgets, forgetting \| stage7 | `62b014e7` |
| 7 | am1_l42 | 超纲 | 疑超纲实词: holiday, vocation \| stage7 | `82464d42` |
| 7 | am1_l42 | 超纲 | 疑超纲实词: tried \| stage7 | `b1cb96bd` |
| 7 | am1_l42 | 超纲 | 疑超纲实词: month \| stage8 | `f9730d18` |
| 7 | am1_l42 | 超纲 | 疑超纲实词: forget \| stage8 | `cb9c60da` |
| 7 | am1_l42 | 超纲 | 疑超纲实词: swim, swims, swimming \| stage10 | `2f1d787e` |
| 8 | am1_l43 | 超纲 | 疑超纲实词: ago \| stage5 | `0986cc01` |
| 8 | am1_l43 | 超纲 | 疑超纲实词: pastor \| stage7 | `5d802b98` |
| 8 | am1_l43 | 超纲 | 疑超纲实词: cap \| stage7 | `db277eab` |
| 8 | am1_l43 | 超纲 | 疑超纲实词: joyful, gentle \| stage7 | `fec00649` |
| 8 | am1_l43 | 超纲 | 疑超纲实词: driven \| stage7 | `f125798e` |
| 8 | am1_l43 | 超纲 | 疑超纲实词: plane \| stage7 | `212d72da` |
| 8 | am1_l44 | 超纲 | 疑超纲实词: arrived, ago \| stage5 | `ce0d3b7e` |
| 8 | am1_l44 | 超纲 | 疑超纲实词: leaves \| stage5 | `9a3a0670` |
| 8 | am1_l44 | 超纲 | 疑超纲实词: eaten, ago \| stage5 | `bc78e61f` |
| 8 | am1_l44 | 超纲 | 疑超纲实词: ago \| stage5 | `4c00c78d` |
| 8 | am1_l44 | 超纲 | 疑超纲实词: ago \| stage5 | `a986bfef` |
| 8 | am1_l44 | 超纲 | 疑超纲实词: leaving, leaves, leave \| stage5 | `550af825` |
| 8 | am1_l44 | 超纲 | 疑超纲实词: hitted, hitting \| stage5 | `f62d6de1` |
| 8 | am1_l44 | 超纲 | 疑超纲实词: ago \| stage5 | `3bcb98fb` |
| 8 | am1_l44 | 超纲 | 疑超纲实词: eaten \| stage5 | `6a4a3b65` |
| 8 | am1_l44 | 超纲 | 疑超纲实词: ago \| stage7 | `3dc45902` |
| 8 | am1_l44 | 超纲 | 疑超纲实词: leave, leaves, leaving \| stage7 | `8564f8f3` |
| 8 | am1_l44 | 超纲 | 疑超纲实词: log, lock, loft \| stage7 | `53ca1381` |
| 8 | am1_l44 | 超纲 | 疑超纲实词: away \| stage7 | `23513c68` |
| 8 | am1_l44 | 超纲 | 疑超纲实词: write \| stage7 | `5f25a9c5` |
| 8 | am1_l44 | 超纲 | 疑超纲实词: highway \| stage8 | `785e2ec0` |
| 8 | am1_l44 | 超纲 | 疑超纲实词: number \| stage8 | `9da84d24` |
| 8 | am1_l44 | 超纲 | 疑超纲实词: ago \| stage10 | `458b6d7e` |
| 8 | am1_l44 | 超纲 | 疑超纲实词: ago \| stage10 | `0f08fee7` |
| 8 | am1_l44 | 超纲 | 疑超纲实词: leave, leaving, leaves \| stage10 | `058a0b39` |
| 8 | am1_l44 | 超纲 | 疑超纲实词: hitting, hitted \| stage10 | `8895e6fc` |
| 8 | am1_l45 | 超纲 | 疑超纲实词: ago \| stage5 | `543910f9` |
| 8 | am1_l45 | 超纲 | 疑超纲实词: ago \| stage5 | `4dd9c4be` |
| 8 | am1_l45 | 超纲 | 疑超纲实词: ghost \| stage6 | `9c452271` |
| 8 | am1_l45 | 超纲 | 疑超纲实词: money \| stage6 | `c7cfbb4d` |
| 8 | am1_l45 | 超纲 | 疑超纲实词: far \| stage7 | `3d804de7` |
| 8 | am1_l45 | 超纲 | 疑超纲实词: pilot \| stage7 | `c3b004f0` |
| 8 | am1_l45 | 超纲 | 疑超纲实词: pilot \| stage8 | `563905f6` |
| 8 | am1_l45 | 超纲 | 疑超纲实词: met \| stage10 | `b55ec749` |
| 8 | am1_l45 | 超纲 | 疑超纲实词: far \| stage10 | `2b30227a` |
| 8 | am1_l46 | 超纲 | 疑超纲实词: nose \| stage7 | `7643c6c4` |
| 8 | am1_l46 | 超纲 | 疑超纲实词: dates \| stage7 | `b6dff62d` |
| 8 | am1_l46 | 超纲 | 疑超纲实词: motel \| stage7 | `14e1da3c` |
| 8 | am1_l46 | 超纲 | 疑超纲实词: trick, track, train \| stage7 | `b64055b6` |
| 8 | am1_l46 | 超纲 | 疑超纲实词: candies \| stage7 | `151ab166` |
| 8 | am1_l47 | 超纲 | 疑超纲实词: low, city, centre \| stage6 | `eea921d3` |
| 8 | am1_l47 | 超纲 | 疑超纲实词: leaf, season, autumn \| stage6 | `8d7b4fca` |
| 8 | am1_l47 | 超纲 | 疑超纲实词: ring \| stage6 | `edc3bfe8` |
| 8 | am1_l47 | 超纲 | 疑超纲实词: flew \| stage7 | `f15698c3` |
| 8 | am1_l47 | 超纲 | 疑超纲实词: slept \| stage7 | `8053ec3c` |
| 8 | am1_l47 | 超纲 | 疑超纲实词: parent, painter, pirate \| stage7 | `78dadfd1` |
| 8 | am1_l47 | 超纲 | 疑超纲实词: word \| stage7 | `1e9f146c` |
| 8 | am1_l47 | 超纲 | 疑超纲实词: uptown, inside, outside \| stage7 | `c0279745` |
| 8 | am1_l47 | 超纲 | 疑超纲实词: coal, cell \| stage7 | `4b068ca4` |
| 8 | am1_l48 | 超纲 | 疑超纲实词: train \| stage5 | `16b9007e` |
| 8 | am1_l48 | 超纲 | 疑超纲实词: train \| stage5 | `2d11a400` |
| 8 | am1_l48 | 超纲 | 疑超纲实词: late, lock \| stage5 | `d87ce358` |
| 8 | am1_l48 | 超纲 | 疑超纲实词: yard, hall, meal \| stage6 | `d38ebbc1` |
| 8 | am1_l48 | 超纲 | 疑超纲实词: plane \| stage6 | `ca2a5563` |
| 8 | am1_l48 | 超纲 | 疑超纲实词: plane \| stage7 | `8660c7c9` |
| 8 | am1_l48 | 超纲 | 疑超纲实词: late, lock \| stage7 | `0340c034` |
| 8 | am1_l48 | 超纲 | 疑超纲实词: lounge, launch \| stage7 | `26d642a6` |
| 8 | am1_l48 | 超纲 | 疑超纲实词: coat, core \| stage7 | `99b89c15` |
| 8 | am1_l48 | 超纲 | 疑超纲实词: star \| stage7 | `daf63c90` |
| 9 | am1_l49 | 超纲 | 疑超纲实词: cup \| stage5 | `81e08276` |
| 9 | am1_l49 | 超纲 | 疑超纲实词: seats \| stage5 | `c7275c34` |
| 9 | am1_l49 | 超纲 | 疑超纲实词: your's \| stage5 | `00fc84b0` |
| 9 | am1_l49 | 超纲 | 疑超纲实词: ourself, our's \| stage5 | `20f6990b` |
| 9 | am1_l49 | 超纲 | 疑超纲实词: seat, you's \| stage5 | `1a2fad7a` |
| 9 | am1_l49 | 超纲 | 疑超纲实词: lose \| stage6 | `6142bd1c` |
| 9 | am1_l49 | 超纲 | 疑超纲实词: head, door, face \| stage6 | `8812e64e` |
| 9 | am1_l49 | 超纲 | 疑超纲实词: lose, kept \| stage7 | `305e30fb` |
| 9 | am1_l49 | 超纲 | 疑超纲实词: self \| stage7 | `c9c7040e` |
| 9 | am1_l49 | 超纲 | 疑超纲实词: battle, butter, basket \| stage7 | `bd5178b1` |
| 9 | am1_l49 | 超纲 | 疑超纲实词: sneaker, speaker \| stage7 | `68f0f252` |
| 9 | am1_l49 | 超纲 | 疑超纲实词: token, tower \| stage7 | `7ba4f66d` |
| 9 | am1_l49 | 超纲 | 疑超纲实词: handbags, headlines, hats \| stage7 | `a9c2aff8` |
| 9 | am1_l49 | 超纲 | 疑超纲实词: most \| stage7 | `fac0ad2f` |
| 9 | am1_l49 | 超纲 | 疑超纲实词: gym \| stage8 | `f96188ab` |
| 9 | am1_l50 | 超纲 | 疑超纲实词: gym, self \| stage5 | `0d373397` |
| 9 | am1_l50 | 超纲 | 疑超纲实词: hisself \| stage5 | `9c6d413e` |
| 9 | am1_l50 | 超纲 | 疑超纲实词: self \| stage5 | `255c594c` |
| 9 | am1_l50 | 超纲 | 疑超纲实词: theirselves, themself \| stage5 | `1ea7a07f` |
| 9 | am1_l50 | 超纲 | 疑超纲实词: hisself, heself \| stage5 | `d129e07f` |
| 9 | am1_l50 | 超纲 | 疑超纲实词: youself \| stage5 | `864a0606` |
| 9 | am1_l50 | 超纲 | 疑超纲实词: hisself \| stage5 | `ad1863da` |
| 9 | am1_l50 | 超纲 | 疑超纲实词: self \| stage7 | `88e5cc9e` |
| 9 | am1_l50 | 超纲 | 疑超纲实词: hisself \| stage7 | `9f9b6a23` |
| 9 | am1_l50 | 超纲 | 疑超纲实词: fault, wall, ball \| stage7 | `3b499017` |
| 9 | am1_l50 | 超纲 | 疑超纲实词: arm, angle, uncle \| stage7 | `9370ee59` |
| 9 | am1_l50 | 超纲 | 疑超纲实词: pass, pull \| stage7 | `1eb5dba1` |
| 9 | am1_l50 | 超纲 | 疑超纲实词: pain, gym, gain \| stage7 | `789febcb` |
| 9 | am1_l50 | 超纲 | 疑超纲实词: cap \| stage7 | `c71f886d` |
| 9 | am1_l50 | 超纲 | 疑超纲实词: hand \| stage8 | `8fc2b878` |
| 9 | am1_l50 | 超纲 | 疑超纲实词: self \| stage10 | `2e8668f5` |
| 9 | am1_l50 | 超纲 | 疑超纲实词: hisself \| stage10 | `b99bbb0b` |
| 9 | am1_l51 | 超纲 | 疑超纲实词: ago \| stage5 | `58c46df3` |
| 9 | am1_l51 | 超纲 | 疑超纲实词: minute, ago \| stage5 | `4f817a88` |
| 9 | am1_l51 | 超纲 | 疑超纲实词: ago \| stage5 | `4c91706f` |
| 9 | am1_l51 | 超纲 | 疑超纲实词: ago \| stage5 | `dcd2b83b` |
| 9 | am1_l51 | 超纲 | 疑超纲实词: eaten, ago \| stage5 | `fc86dc0c` |
| 9 | am1_l51 | 超纲 | 疑超纲实词: ago \| stage5 | `22c80f07` |
| 9 | am1_l51 | 超纲 | 疑超纲实词: ago \| stage5 | `61a206b0` |
| 9 | am1_l51 | 超纲 | 疑超纲实词: eaten \| stage5 | `59ccd5f3` |
| 9 | am1_l51 | 超纲 | 疑超纲实词: ago \| stage7 | `c30f8100` |
| 9 | am1_l51 | 超纲 | 疑超纲实词: ago \| stage7 | `d52279d2` |
| 9 | am1_l51 | 超纲 | 疑超纲实词: goodbye \| stage7 | `172fc98b` |
| 9 | am1_l51 | 超纲 | 疑超纲实词: scary, scarred, sacred \| stage7 | `2afd1cf9` |
| 9 | am1_l51 | 超纲 | 疑超纲实词: break, breathe \| stage7 | `408c9358` |
| 9 | am1_l51 | 超纲 | 疑超纲实词: dotted, counted, shouted \| stage7 | `f7a3fd11` |
| 9 | am1_l51 | 超纲 | 疑超纲实词: poem \| stage7 | `6e4b069e` |
| 9 | am1_l51 | 超纲 | 疑超纲实词: gym \| stage8 | `1e3fb302` |
| 9 | am1_l51 | 超纲 | 疑超纲实词: eaten, ago \| stage10 | `7d0c780b` |
| 9 | am1_l51 | 超纲 | 疑超纲实词: ago \| stage10 | `1b52f9e1` |
| 9 | am1_l52 | 超纲 | 疑超纲实词: money \| stage5 | `bb0b13ff` |
| 9 | am1_l52 | 超纲 | 疑超纲实词: end \| stage6 | `b3dc6376` |
| 9 | am1_l52 | 超纲 | 疑超纲实词: clock \| stage7 | `e842a6c0` |
| 9 | am1_l52 | 超纲 | 疑超纲实词: midday \| stage7 | `87a597f7` |
| 9 | am1_l52 | 超纲 | 疑超纲实词: drank \| stage7 | `714d7b29` |
| 9 | am1_l52 | 超纲 | 疑超纲实词: cop, club, cap \| stage7 | `5e81d25d` |
| 9 | am1_l52 | 超纲 | 疑超纲实词: gone \| stage8 | `2465b245` |
| 9 | am1_l52 | 超纲 | 疑超纲实词: question \| stage9 | `dbd04528` |
| 9 | am1_l53 | 超纲 | 疑超纲实词: beautify, beauty \| stage5 | `48ec2ad9` |
| 9 | am1_l53 | 超纲 | 疑超纲实词: speaks, clear, clearful, clearness \| stage5 | `be1af97e` |
| 9 | am1_l53 | 超纲 | 疑超纲实词: quicky, quickness \| stage5 | `c6101f49` |
| 9 | am1_l53 | 超纲 | 疑超纲实词: hardful \| stage5 | `03f4d382` |
| 9 | am1_l53 | 超纲 | 疑超纲实词: goodness \| stage5 | `fbb2641b` |
| 9 | am1_l53 | 超纲 | 疑超纲实词: speak \| stage5 | `f01c53dd` |
| 9 | am1_l53 | 超纲 | 疑超纲实词: quicky, quickness \| stage5 | `5646fa6c` |
| 9 | am1_l53 | 超纲 | 疑超纲实词: speaks, clear, clearing \| stage5 | `6d34af37` |
| 9 | am1_l53 | 超纲 | 疑超纲实词: runner \| stage5 | `bbc25513` |
| 9 | am1_l53 | 超纲 | 疑超纲实词: hardful \| stage5 | `79a420cd` |
| 9 | am1_l53 | 超纲 | 疑超纲实词: peer \| stage6 | `dc12f789` |
| 9 | am1_l53 | 超纲 | 疑超纲实词: quickness, quicky \| stage7 | `9b2045ec` |
| 9 | am1_l53 | 超纲 | 疑超纲实词: beauty, beautify \| stage7 | `1b596432` |
| 9 | am1_l53 | 超纲 | 疑超纲实词: hardful \| stage7 | `0e5fb356` |
| 9 | am1_l53 | 超纲 | 疑超纲实词: clear, clearness \| stage7 | `a9fde50c` |
| 9 | am1_l53 | 超纲 | 疑超纲实词: e, mail, eraser, easy \| stage7 | `f1e78dc2` |
| 9 | am1_l53 | 超纲 | 疑超纲实词: answers, artists \| stage7 | `ef332323` |
| 9 | am1_l53 | 超纲 | 疑超纲实词: lately, large \| stage7 | `ae7caf59` |
| 9 | am1_l53 | 超纲 | 疑超纲实词: truly, tacky, trick \| stage7 | `8301b727` |
| 9 | am1_l53 | 超纲 | 疑超纲实词: textbook \| stage8 | `28dcf093` |
| 9 | am1_l53 | 超纲 | 疑超纲实词: mean, effort \| stage8 | `f186ddb1` |
| 9 | am1_l53 | 超纲 | 疑超纲实词: quickness \| stage10 | `85b25d34` |
| 9 | am1_l53 | 超纲 | 疑超纲实词: often \| stage10 | `2987de71` |
| 9 | am1_l53 | 超纲 | 疑超纲实词: hardful \| stage10 | `2262ba1f` |
| 9 | am1_l54 | 超纲 | 疑超纲实词: cheap, cheapper, cheapest \| stage5 | `4706be76` |
| 9 | am1_l54 | 超纲 | 疑超纲实词: hottest, hotter \| stage5 | `96692a92` |
| 9 | am1_l54 | 超纲 | 疑超纲实词: most \| stage5 | `5e297d98` |
| 9 | am1_l54 | 超纲 | 疑超纲实词: light, lighter \| stage5 | `6f09386e` |
| 9 | am1_l54 | 超纲 | 疑超纲实词: soft, softest, softter \| stage5 | `1dd76bfb` |
| 9 | am1_l54 | 超纲 | 疑超纲实词: est, er, ly \| stage5 | `b225b431` |
| 9 | am1_l54 | 超纲 | 疑超纲实词: cheap \| stage5 | `ee6edca3` |
| 9 | am1_l54 | 超纲 | 疑超纲实词: genes, jean, janes \| stage6 | `d45dcdd6` |
| 9 | am1_l54 | 超纲 | 疑超纲实词: biggest \| stage7 | `b3ed873d` |
| 9 | am1_l54 | 超纲 | 疑超纲实词: soft, softest \| stage7 | `83fc89f2` |
| 9 | am1_l54 | 超纲 | 疑超纲实词: cheap, cheapest \| stage7 | `33a41752` |
| 9 | am1_l54 | 超纲 | 疑超纲实词: land, lad, lately \| stage7 | `364088ee` |
| 9 | am1_l54 | 超纲 | 疑超纲实词: genes, jars \| stage7 | `1f1a750d` |
| 9 | am1_l54 | 超纲 | 疑超纲实词: light, tall \| stage7 | `f351c7c7` |
| 9 | am1_l54 | 超纲 | 疑超纲实词: banks \| stage7 | `77674290` |
| 9 | am1_l54 | 超纲 | 疑超纲实词: bog, beg \| stage7 | `c3ab739a` |
| 9 | am1_l54 | 超纲 | 疑超纲实词: jacket \| stage8 | `29e52d47` |
| 9 | am1_l54 | 超纲 | 疑超纲实词: pick \| stage8 | `6e41e70b` |
| 9 | am1_l54 | 超纲 | 疑超纲实词: biggest \| stage10 | `634df7bb` |
| 10 | am1_l55 | 超纲 | 疑超纲实词: most \| stage5 | `944af5f9` |
| 10 | am1_l55 | 超纲 | 疑超纲实词: expensivest, expensiver \| stage5 | `a63abe7f` |
| 10 | am1_l55 | 超纲 | 疑超纲实词: most \| stage5 | `4896d5d7` |
| 10 | am1_l55 | 超纲 | 疑超纲实词: interesting \| stage5 | `518eee6a` |
| 10 | am1_l55 | 超纲 | 疑超纲实词: er, most \| stage5 | `94325202` |
| 10 | am1_l55 | 超纲 | 疑超纲实词: most \| stage5 | `6c3fcf39` |
| 10 | am1_l55 | 超纲 | 疑超纲实词: most, expensiver \| stage5 | `beef7578` |
| 10 | am1_l55 | 超纲 | 疑超纲实词: most \| stage5 | `0e976483` |
| 10 | am1_l55 | 超纲 | 疑超纲实词: most, est, er \| stage5 | `27e8ceee` |
| 10 | am1_l55 | 超纲 | 疑超纲实词: restaurant, most \| stage5 | `d8036147` |
| 10 | am1_l55 | 超纲 | 疑超纲实词: most \| stage5 | `16d9f680` |
| 10 | am1_l55 | 超纲 | 疑超纲实词: most \| stage5 | `29cdbe91` |
| 10 | am1_l55 | 超纲 | 疑超纲实词: annual, university, meal \| stage6 | `d1836782` |
| 10 | am1_l55 | 超纲 | 疑超纲实词: romance \| stage7 | `54d0d1e3` |
| 10 | am1_l55 | 超纲 | 疑超纲实词: most \| stage7 | `edea1610` |
| 10 | am1_l55 | 超纲 | 疑超纲实词: expensiver, expense \| stage7 | `deb15df3` |
| 10 | am1_l55 | 超纲 | 疑超纲实词: comfortabler, comfort, comfortably \| stage7 | `be2a4ac9` |
| 10 | am1_l55 | 超纲 | 疑超纲实词: most \| stage7 | `be8bbdc5` |
| 10 | am1_l55 | 超纲 | 疑超纲实词: university, annual \| stage7 | `877cd5c2` |
| 10 | am1_l55 | 超纲 | 疑超纲实词: villa, vine, veal \| stage7 | `0fc84858` |
| 10 | am1_l55 | 超纲 | 疑超纲实词: menu \| stage7 | `35c0b2c9` |
| 10 | am1_l55 | 超纲 | 疑超纲实词: paint \| stage7 | `d125319c` |
| 10 | am1_l55 | 超纲 | 疑超纲实词: crooked, cloudy \| stage7 | `0651c390` |
| 10 | am1_l55 | 超纲 | 疑超纲实词: human \| stage7 | `a14c54f2` |
| 10 | am1_l55 | 超纲 | 疑超纲实词: celebrating, holiday \| stage8 | `bddafacd` |
| 10 | am1_l55 | 超纲 | 疑超纲实词: restaurant \| stage8 | `bba04fa4` |
| 10 | am1_l55 | 超纲 | 疑超纲实词: restaurant \| stage8 | `861a72da` |
| 10 | am1_l55 | 超纲 | 疑超纲实词: restaurant, pick \| stage8 | `6e2be934` |
| 10 | am1_l55 | 超纲 | 疑超纲实词: restaurant \| stage9 | `78395e86` |
| 10 | am1_l55 | 超纲 | 疑超纲实词: most \| stage10 | `7cd3e41b` |
| 10 | am1_l55 | 超纲 | 疑超纲实词: er \| stage10 | `f11d5662` |
| 10 | am1_l55 | 超纲 | 疑超纲实词: most \| stage10 | `320d657e` |
| 10 | am1_l56 | 超纲 | 疑超纲实词: worse, baddest \| stage5 | `f1ffb7b1` |
| 10 | am1_l56 | 超纲 | 疑超纲实词: cheapiest \| stage5 | `dcde0942` |
| 10 | am1_l56 | 超纲 | 疑超纲实词: worse, baddest \| stage5 | `6827648f` |
| 10 | am1_l56 | 超纲 | 疑超纲实词: safer \| stage5 | `729b53e5` |
| 10 | am1_l56 | 超纲 | 疑超纲实词: auto, dealership, yard \| stage6 | `ee6b44bc` |
| 10 | am1_l56 | 超纲 | 疑超纲实词: safer \| stage7 | `767b644d` |
| 10 | am1_l56 | 超纲 | 疑超纲实词: paint, pick \| stage7 | `a08b5208` |
| 10 | am1_l56 | 超纲 | 疑超纲实词: prize, piece \| stage7 | `9f72a0a6` |
| 10 | am1_l56 | 超纲 | 疑超纲实词: tent, taste \| stage7 | `e5c23e56` |
| 10 | am1_l56 | 超纲 | 疑超纲实词: knees, keels \| stage7 | `18ec54c8` |
| 10 | am1_l56 | 超纲 | 疑超纲实词: end, boss \| stage8 | `a573267f` |
| 10 | am1_l57 | 超纲 | 疑超纲实词: penny \| stage6 | `0dbd2629` |
| 10 | am1_l57 | 超纲 | 疑超纲实词: save, lifeboat \| stage6 | `2f9d6a71` |
| 10 | am1_l57 | 超纲 | 疑超纲实词: meat, mother \| stage7 | `b0e76cba` |
| 10 | am1_l57 | 超纲 | 疑超纲实词: press, phrase \| stage7 | `3c4b4fbb` |
| 10 | am1_l57 | 超纲 | 疑超纲实词: pickles, nibbles \| stage7 | `a0805466` |
| 10 | am1_l57 | 超纲 | 疑超纲实词: lawyer, lifeguard, loser \| stage7 | `9678efc0` |
| 10 | am1_l57 | 超纲 | 疑超纲实词: backward \| stage7 | `3319af69` |
| 10 | am1_l57 | 超纲 | 疑超纲实词: nothing \| stage10 | `d4bebd20` |
| 10 | am1_l58 | 超纲 | 疑超纲实词: came \| stage5 | `623fd664` |
| 10 | am1_l58 | 超纲 | 疑超纲实词: person \| stage5 | `1a7ecca1` |
| 10 | am1_l58 | 超纲 | 疑超纲实词: person \| stage5 | `d979e00b` |
| 10 | am1_l58 | 超纲 | 疑超纲实词: person, hear \| stage5 | `1ab039f9` |
| 10 | am1_l58 | 超纲 | 疑超纲实词: treat \| stage6 | `494dce77` |
| 10 | am1_l58 | 超纲 | 疑超纲实词: watermelon \| stage6 | `1a7ea71f` |
| 10 | am1_l58 | 超纲 | 疑超纲实词: pigeon, penguin \| stage7 | `03d6e0fc` |
| 10 | am1_l58 | 超纲 | 疑超纲实词: tone \| stage7 | `ae93325b` |
| 10 | am1_l58 | 超纲 | 疑超纲实词: camp, carpet \| stage7 | `dc29ad90` |
| 10 | am1_l58 | 超纲 | 疑超纲实词: curtain, custom \| stage7 | `ab21e20f` |
| 10 | am1_l58 | 超纲 | 疑超纲实词: doll, dot \| stage7 | `0265d142` |
| 10 | am1_l58 | 超纲 | 疑超纲实词: kid \| stage8 | `76e02306` |
| 10 | am1_l58 | 超纲 | 疑超纲实词: wearing \| stage8 | `ee60938e` |
| 10 | am1_l58 | 超纲 | 疑超纲实词: came \| stage10 | `ad94e4f6` |
| 10 | am1_l59 | 超纲 | 疑超纲实词: rang, during \| stage5 | `c43a3f26` |
| 10 | am1_l59 | 超纲 | 疑超纲实词: because \| stage5 | `151e20be` |
| 10 | am1_l59 | 超纲 | 疑超纲实词: panda, kangaroo, camel \| stage6 | `219a8490` |
| 10 | am1_l59 | 超纲 | 疑超纲实词: coast, cost \| stage6 | `8d64dbf5` |
| 10 | am1_l59 | 超纲 | 疑超纲实词: rode \| stage7 | `9bedd4b5` |
| 10 | am1_l59 | 超纲 | 疑超纲实词: cost, coast \| stage7 | `a0a8fc17` |
| 10 | am1_l59 | 超纲 | 疑超纲实词: art, aim, army \| stage7 | `f1373d33` |
| 10 | am1_l59 | 超纲 | 疑超纲实词: stone, step \| stage7 | `47c1e453` |
| 10 | am1_l59 | 超纲 | 疑超纲实词: low, downstairs \| stage7 | `8dc06ba0` |
| 10 | am1_l59 | 超纲 | 疑超纲实词: onion \| stage7 | `dabf3335` |
| 10 | am1_l59 | 超纲 | 疑超纲实词: barking \| stage7 | `1a27e008` |
| 10 | am1_l59 | 超纲 | 疑超纲实词: appeared \| stage8 | `03b512f3` |
| 10 | am1_l59 | 超纲 | 疑超纲实词: away \| stage8 | `528317fc` |
| 10 | am1_l59 | 超纲 | 疑超纲实词: rang, during \| stage10 | `f5673bb3` |
| 10 | am1_l60 | 超纲 | 疑超纲实词: shake \| stage5 | `86bf30be` |
| 10 | am1_l60 | 超纲 | 疑超纲实词: slowest, slow, slowness \| stage5 | `b07b2f4a` |
| 10 | am1_l60 | 超纲 | 疑超纲实词: ing, sitted \| stage5 | `55d00380` |
| 10 | am1_l60 | 超纲 | 疑超纲实词: shoe \| stage5 | `e00399f2` |
| 10 | am1_l60 | 超纲 | 疑超纲实词: sat \| stage7 | `81565257` |
| 10 | am1_l60 | 超纲 | 疑超纲实词: shake, shakes, shook \| stage7 | `07f255f5` |
| 10 | am1_l60 | 超纲 | 疑超纲实词: campus \| stage7 | `d4065eca` |
| 10 | am1_l60 | 超纲 | 疑超纲实词: song, side \| stage7 | `28328437` |
| 10 | am1_l60 | 超纲 | 疑超纲实词: wondered, whistled \| stage7 | `90dbf4fa` |
| 10 | am1_l60 | 超纲 | 疑超纲实词: lamplight, headlight, flashcard \| stage7 | `b02d7370` |
| 10 | am1_l60 | 超纲 | 疑超纲实词: slow, sadly, lowly \| stage7 | `6ef5a80b` |
| 10 | am1_l60 | 超纲 | 疑超纲实词: wind \| stage8 | `780656f8` |
| 11 | am1_l61 | 超纲 | 疑超纲实词: guy, fixes \| stage5 | `79d31492` |
| 11 | am1_l61 | 超纲 | 疑超纲实词: learns \| stage5 | `a17605f0` |
| 11 | am1_l61 | 超纲 | 疑超纲实词: built \| stage5 | `32676699` |
| 11 | am1_l61 | 超纲 | 疑超纲实词: inside, index, indie, indoor, bookshop \| stage6 | `848082bc` |
| 11 | am1_l61 | 超纲 | 疑超纲实词: ask, asking, asked \| stage7 | `8a680519` |
| 11 | am1_l61 | 超纲 | 疑超纲实词: goat, golf, gaff \| stage7 | `3c01a9ba` |
| 11 | am1_l61 | 超纲 | 疑超纲实词: waiters, workers, winners \| stage7 | `3b5b7c76` |
| 11 | am1_l61 | 超纲 | 疑超纲实词: mob, maid \| stage7 | `3bd3a535` |
| 11 | am1_l61 | 超纲 | 疑超纲实词: checkbook, casebook, notebook \| stage7 | `4dd00f9f` |
| 11 | am1_l61 | 超纲 | 疑超纲实词: cucumber, computer \| stage7 | `e9b4980c` |
| 11 | am1_l62 | 超纲 | 疑超纲实词: flee \| stage6 | `36cd98d9` |
| 11 | am1_l62 | 超纲 | 疑超纲实词: search \| stage6 | `de7127c6` |
| 11 | am1_l62 | 超纲 | 疑超纲实词: lamb \| stage7 | `4a6275d3` |
| 11 | am1_l62 | 超纲 | 疑超纲实词: lambs \| stage7 | `59056e98` |
| 11 | am1_l62 | 超纲 | 疑超纲实词: junk, racket \| stage7 | `dfc3d7b5` |
| 11 | am1_l62 | 超纲 | 疑超纲实词: rewards, rockets \| stage7 | `cfd32c51` |
| 11 | am1_l62 | 超纲 | 疑超纲实词: heady, handy \| stage7 | `00c70881` |
| 11 | am1_l63 | 超纲 | 疑超纲实词: against \| stage5 | `bbf04e3b` |
| 11 | am1_l63 | 超纲 | 疑超纲实词: roof, plant \| stage6 | `cab9f639` |
| 11 | am1_l63 | 超纲 | 疑超纲实词: lever, ladder, litter \| stage7 | `c48f309f` |
| 11 | am1_l63 | 超纲 | 疑超纲实词: assistance, assignment, animation \| stage7 | `789ae646` |
| 11 | am1_l63 | 超纲 | 疑超纲实词: fry, flow, flip \| stage7 | `ab26cec1` |
| 11 | am1_l63 | 超纲 | 疑超纲实词: sharp, chip \| stage7 | `77f42db4` |
| 11 | am1_l63 | 超纲 | 疑超纲实词: purpose, pebble \| stage7 | `98c88f41` |
| 11 | am1_l63 | 超纲 | 疑超纲实词: often \| stage8 | `6b33f841` |
| 11 | am1_l64 | 超纲 | 疑超纲实词: probably \| stage5 | `b7c9fb7d` |
| 11 | am1_l64 | 超纲 | 疑超纲实词: noses, nosier \| stage5 | `0da5521c` |
| 11 | am1_l64 | 超纲 | 疑超纲实词: tall \| stage7 | `20e95510` |
| 11 | am1_l64 | 超纲 | 疑超纲实词: lapdogs \| stage7 | `43505830` |
| 11 | am1_l64 | 超纲 | 疑超纲实词: sky, spa, soy \| stage7 | `7cd76507` |
| 11 | am1_l64 | 超纲 | 疑超纲实词: seat, suite \| stage7 | `6a5801aa` |
| 11 | am1_l64 | 超纲 | 疑超纲实词: followers, flavors \| stage7 | `0c034fea` |
| 11 | am1_l64 | 超纲 | 疑超纲实词: noisiest \| stage7 | `9a602dbd` |
| 11 | am1_l64 | 超纲 | 疑超纲实词: man's \| stage8 | `91af5df8` |
| 11 | am1_l65 | 超纲 | 疑超纲实词: ruler, radio, laser, pen \| stage6 | `5ce7fee7` |
| 11 | am1_l65 | 超纲 | 疑超纲实词: far \| stage7 | `f8b88a69` |
| 11 | am1_l65 | 超纲 | 疑超纲实词: razor, radio \| stage7 | `8ebc4c1e` |
| 11 | am1_l65 | 超纲 | 疑超纲实词: cap \| stage7 | `37e8e86f` |
| 11 | am1_l65 | 超纲 | 疑超纲实词: unlucky, luckiest, unluckier \| stage7 | `bf9cf8f8` |
| 11 | am1_l65 | 超纲 | 疑超纲实词: officer's \| stage8 | `3ae664a0` |
| 11 | am1_l66 | 超纲 | 疑超纲实词: umbrella \| stage5 | `a8443aef` |
| 11 | am1_l66 | 超纲 | 疑超纲实词: mail, sky \| stage6 | `20591309` |
| 11 | am1_l66 | 超纲 | 疑超纲实词: merry, merriest \| stage7 | `8eb11d04` |
| 11 | am1_l66 | 超纲 | 疑超纲实词: pencil, panic, picture \| stage7 | `4e24e75c` |
| 11 | am1_l66 | 超纲 | 疑超纲实词: present, parent \| stage7 | `331bbc73` |
| 11 | am1_l66 | 超纲 | 疑超纲实词: wakes \| stage7 | `aeeea392` |
| 11 | am1_l66 | 超纲 | 疑超纲实词: along \| stage7 | `54f9423f` |
| 11 | am1_l66 | 超纲 | 疑超纲实词: roof \| stage7 | `4991a726` |
| 11 | am1_l66 | 超纲 | 疑超纲实词: shy, sign, sun \| stage7 | `655b1af9` |
| 11 | am1_l66 | 超纲 | 疑超纲实词: chance \| stage8 | `21fc06de` |
| 12 | am1_l67 | 超纲 | 疑超纲实词: spoke \| stage5 | `e2629011` |
| 12 | am1_l67 | 超纲 | 疑超纲实词: spoke, talked \| stage5 | `24f50053` |
| 12 | am1_l67 | 超纲 | 疑超纲实词: age \| stage7 | `58091ee0` |
| 12 | am1_l67 | 超纲 | 疑超纲实词: nose, noise \| stage7 | `89316019` |
| 12 | am1_l67 | 超纲 | 疑超纲实词: comeback, paperback \| stage7 | `e7b52dac` |
| 12 | am1_l67 | 超纲 | 疑超纲实词: winner \| stage7 | `dbc0c960` |
| 12 | am1_l67 | 超纲 | 疑超纲实词: quizzes \| stage7 | `81ce65a8` |
| 12 | am1_l67 | 超纲 | 疑超纲实词: goodnight \| stage7 | `c6813351` |
| 12 | am1_l67 | 超纲 | 疑超纲实词: trap \| stage7 | `db2e76dc` |
| 12 | am1_l67 | 超纲 | 疑超纲实词: gym \| stage8 | `7025bf06` |
| 12 | am1_l67 | 超纲 | 疑超纲实词: bakery \| stage10 | `f6d3829a` |
| 12 | am1_l68 | 超纲 | 疑超纲实词: spoke, talked \| stage5 | `d8596ca3` |
| 12 | am1_l68 | 超纲 | 疑超纲实词: spoke, talked \| stage5 | `ba33b7d2` |
| 12 | am1_l68 | 超纲 | 疑超纲实词: talked, spoke \| stage5 | `899f1dca` |
| 12 | am1_l68 | 超纲 | 疑超纲实词: talked, spoke \| stage5 | `00bbf2ea` |
| 12 | am1_l68 | 超纲 | 疑超纲实词: spoke, talked \| stage5 | `a3907416` |
| 12 | am1_l68 | 超纲 | 疑超纲实词: legs, travels \| stage6 | `da03360e` |
| 12 | am1_l68 | 超纲 | 疑超纲实词: talked, spoke \| stage7 | `ce978fc0` |
| 12 | am1_l68 | 超纲 | 疑超纲实词: spoke, talked \| stage7 | `90703ea4` |
| 12 | am1_l68 | 超纲 | 疑超纲实词: nose \| stage7 | `485d36b7` |
| 12 | am1_l68 | 超纲 | 疑超纲实词: bank, barbershop, bakery \| stage7 | `e8758b26` |
| 12 | am1_l68 | 超纲 | 疑超纲实词: copper \| stage7 | `0d6c1bf7` |
| 12 | am1_l68 | 超纲 | 疑超纲实词: mail, mind, menu \| stage7 | `be31ce05` |
| 12 | am1_l68 | 超纲 | 疑超纲实词: ridge, rail \| stage7 | `30fc6122` |
| 12 | am1_l68 | 超纲 | 疑超纲实词: oven, pet \| stage8 | `cf089fee` |
| 12 | am1_l68 | 超纲 | 疑超纲实词: spoke, talked \| stage10 | `34f38c1c` |
| 12 | am1_l68 | 超纲 | 疑超纲实词: talked, spoke \| stage10 | `1c119962` |
| 12 | am1_l68 | 超纲 | 疑超纲实词: talked \| stage10 | `577c1470` |
| 12 | am1_l69 | 超纲 | 疑超纲实词: she'll \| stage5 | `3904a8e4` |
| 12 | am1_l69 | 超纲 | 疑超纲实词: late \| stage5 | `dec7f860` |
| 12 | am1_l69 | 超纲 | 疑超纲实词: ask, asked \| stage5 | `65b2c141` |
| 12 | am1_l69 | 超纲 | 疑超纲实词: steal \| stage5 | `13cff7e7` |
| 12 | am1_l69 | 超纲 | 疑超纲实词: quitting, quitted \| stage7 | `2da6892e` |
| 12 | am1_l69 | 超纲 | 疑超纲实词: packet, rocket \| stage7 | `ab3f2ff0` |
| 12 | am1_l69 | 超纲 | 疑超纲实词: pockets, pictures \| stage7 | `b51d0119` |
| 12 | am1_l69 | 超纲 | 疑超纲实词: hose, mouse, horse \| stage7 | `37ffeba1` |
| 12 | am1_l69 | 超纲 | 疑超纲实词: loose \| stage7 | `4734e0f8` |
| 12 | am1_l69 | 超纲 | 疑超纲实词: fans \| stage7 | `6b468434` |
| 12 | am1_l69 | 超纲 | 疑超纲实词: winning \| stage10 | `683ed4f3` |
| 12 | am1_l70 | 超纲 | 疑超纲实词: speak \| stage5 | `747a2146` |
| 12 | am1_l70 | 超纲 | 疑超纲实词: speak \| stage7 | `54d27c95` |
| 12 | am1_l70 | 超纲 | 疑超纲实词: cheers, chess, choose \| stage7 | `af76e427` |
| 12 | am1_l70 | 超纲 | 疑超纲实词: rental, mental, gentle \| stage7 | `7e26fe3c` |
| 12 | am1_l70 | 超纲 | 疑超纲实词: wave, winter \| stage7 | `f65565fa` |
| 12 | am1_l70 | 超纲 | 疑超纲实词: tooth, teens \| stage7 | `956bd384` |
| 12 | am1_l71 | 超纲 | 疑超纲实词: flew \| stage5 | `d912737d` |
| 12 | am1_l71 | 超纲 | 疑超纲实词: flew \| stage5 | `7401668d` |
| 12 | am1_l71 | 超纲 | 疑超纲实词: movie \| stage5 | `76b46c95` |
| 12 | am1_l71 | 超纲 | 疑超纲实词: snow, winter \| stage5 | `028512a6` |
| 12 | am1_l71 | 超纲 | 疑超纲实词: flew, flied \| stage5 | `569bfb2a` |
| 12 | am1_l71 | 超纲 | 疑超纲实词: flew \| stage7 | `c48f4a8f` |
| 12 | am1_l71 | 超纲 | 疑超纲实词: sharing \| stage7 | `6247f56e` |
| 12 | am1_l71 | 超纲 | 疑超纲实词: tour, tone \| stage7 | `06c3cc47` |
| 12 | am1_l71 | 超纲 | 疑超纲实词: packet, pocket \| stage7 | `91bbca97` |
| 12 | am1_l71 | 超纲 | 疑超纲实词: stair \| stage7 | `48156e27` |
| 12 | am1_l71 | 超纲 | 疑超纲实词: drum, drama, dress \| stage7 | `f7dbd3d7` |
| 12 | am1_l72 | 超纲 | 疑超纲实词: spoke \| stage5 | `7b16c518` |
| 12 | am1_l72 | 超纲 | 疑超纲实词: tail, train, trial \| stage7 | `ccaad2e6` |
| 12 | am1_l72 | 超纲 | 疑超纲实词: limeade \| stage7 | `354adf8b` |
| 12 | am1_l72 | 超纲 | 疑超纲实词: funniest \| stage7 | `887ed1c7` |
| 12 | am1_l72 | 超纲 | 疑超纲实词: pianos, potions \| stage7 | `65e3cb0a` |
| 12 | am1_l72 | 超纲 | 疑超纲实词: trained \| stage10 | `b132b727` |

## transform 判定放宽（已实装 src/lib/american/answerEquiv.ts + 单测）

共 309 道 transform。放宽规则已落地(任一命中即判对),本次复扫仅剩 **0** 道残余:

1. **缩写 ≡ 全写**:don't≡do not / isn't≡is not / it's≡it is / I'll≡I will 等(双向,规范形取缩写)。
2. **that 可省**:said (that) / a book (that) I bought —— 含/省 that 均判对(保护句首 That / that's)。
3. **末尾标点 + 首字母大小写 + 多余空白**已忽略。
4. 运行时关5/10 transform 现为"显示参考答案→自评";answerEquiv 供机审复扫 + 将来键入自动判分直接复用。

