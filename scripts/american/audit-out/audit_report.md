# 美语课程题库机审报告

> anon 只读机审,只报不改。修复走 Aaron 拍板 + 独立 SQL。
> 题库规模:3440 题(cloze 784 / choice 1843 / transform 597)。

## 摘要

| 级别 | 数量 |
|---|---|
| 🔴 确定错误 | 0 |
| 🟡 疑似 | 375 |
| ⚪ flag | 1184 |

按 code 分布:

| code | 数 |
|---|---|
| 超纲 | 1045 |
| 查重 | 310 |
| transform风险 | 139 |
| C7-未匹配原句 | 48 |
| CH-选项数 | 17 |

## 🔴 确定错误（0）

_无_

## 🟡 疑似(需人工判断)（375）

| 单元 | 课 | code | 说明 | qid |
|---|---|---|---|---|
| 1 | am1_l01 | 查重 | 题干/原句重复×4: "tyler: ___1___, ma'am. tyler: is this ___2___" @ am1_l01/s7/seq1 , am1_l01/s7/seq2 , am1_l01/s7/seq3 , am1_l01/s7/seq4 | `f3aaffbd` |
| 1 | am1_l02 | 查重 | 题干/原句重复×2: "___ your coffee, ma'am." @ am1_l02/s5/seq1 , am1_l02/s5/seq9 | `dec3f87d` |
| 1 | am1_l02 | 查重 | 题干/原句重复×2: "here's your key.（key 改为 keys）" @ am1_l02/s5/seq4 , am1_l02/s10/seq6 | `b4ad4ef9` |
| 1 | am1_l02 | 查重 | 题干/原句重复×5: "david: hi. ___1___ my ticket. marcus: thank y" @ am1_l02/s7/seq1 , am1_l02/s7/seq2 , am1_l02/s7/seq3 , am1_l02/s7/seq4 , am1_l02/s7/seq5 | `7e579509` |
| 1 | am1_l03 | C7-未匹配原句 | 空5填"a"后无逐字匹配(疑精简/改写/错词): "i'm ___5___ teacher." | `ab2f1518` |
| 1 | am1_l03 | 查重 | 题干/原句重复×2: "she's ___ teacher." @ am1_l03/s5/seq2 , am1_l03/s10/seq4 | `bb254252` |
| 1 | am1_l03 | 查重 | 题干/原句重复×2: "i'm from mexico. i'm ___." @ am1_l03/s5/seq7 , am1_l03/s5/seq15 | `205de14d` |
| 1 | am1_l03 | 查重 | 题干/原句重复×5: "rachel: hi, ben! ___1___ is my friend diego. " @ am1_l03/s7/seq1 , am1_l03/s7/seq2 , am1_l03/s7/seq3 , am1_l03/s7/seq4 , am1_l03/s7/seq5 | `f868440c` |
| 1 | am1_l04 | C7-未匹配原句 | 空4填"job"后无逐字匹配(疑精简/改写/错词): "what's your ___4___?" | `3dc77f29` |
| 1 | am1_l04 | 查重 | 题干/原句重复×2: "what's your job? — ___" @ am1_l04/s5/seq5 , am1_l04/s10/seq2 | `7cefe8fd` |
| 1 | am1_l04 | 查重 | 题干/原句重复×5: "kevin: hi, i'm kevin. ___1___ you new here? s" @ am1_l04/s7/seq1 , am1_l04/s7/seq2 , am1_l04/s7/seq3 , am1_l04/s7/seq4 , am1_l04/s7/seq5 | `e5369c69` |
| 1 | am1_l05 | C7-未匹配原句 | 空5填"Take"后无逐字匹配(疑精简/改写/错词): "___5___ care!" | `2cc92fc2` |
| 1 | am1_l05 | 查重 | 题干/原句重复×2: "how ___ you today?" @ am1_l05/s5/seq1 , am1_l05/s5/seq9 | `ed62026a` |
| 1 | am1_l05 | 查重 | 题干/原句重复×2: "how ___ your husband? — he's fine." @ am1_l05/s5/seq2 , am1_l05/s10/seq1 | `8bd7e683` |
| 1 | am1_l05 | 查重 | 题干/原句重复×2: "how are you? — ___" @ am1_l05/s5/seq3 , am1_l05/s10/seq2 | `c47b8222` |
| 1 | am1_l05 | 查重 | 题干/原句重复×2: "the puppy is ___." @ am1_l05/s5/seq6 , am1_l05/s10/seq3 | `349908e8` |
| 1 | am1_l05 | 查重 | 题干/原句重复×5: "megan: good morning, carlos! ___1___ are you " @ am1_l05/s7/seq1 , am1_l05/s7/seq2 , am1_l05/s7/seq3 , am1_l05/s7/seq4 , am1_l05/s7/seq5 | `a5713fae` |
| 1 | am1_l06 | 查重 | 题干/原句重复×2: "she is my sister. ___ mug is pink." @ am1_l06/s5/seq5 , am1_l06/s5/seq14 | `83e3e275` |
| 1 | am1_l06 | 查重 | 题干/原句重复×5: "tina: ___1___ coffee mug is this? tina: no, _" @ am1_l06/s7/seq1 , am1_l06/s7/seq2 , am1_l06/s7/seq3 , am1_l06/s7/seq4 , am1_l06/s7/seq5 | `8444c03e` |
| 2 | am1_l07 | C7-未匹配原句 | 空6填"size"后无逐字匹配(疑精简/改写/错词): "what ___6___ is that one?" | `72cd1b6a` |
| 2 | am1_l07 | C7-未匹配原句 | 空8填"medium"后无逐字匹配(疑精简/改写/错词): "— clerk: it's a ___." | `8ad4f67d` |
| 2 | am1_l07 | C7-未匹配原句 | 空10填"sale"后无逐字匹配(疑精简/改写/错词): "it's on ___ — only ten dollars." | `5713e61d` |
| 2 | am1_l07 | CH-选项数 | 选项数=5(非4) \| How much is the orange T | `8eea1a0a` |
| 2 | am1_l07 | 查重 | 题干/原句重复×6: "clerk: hi! can i ___1___ you? lily: yes, plea" @ am1_l07/s7/seq1 , am1_l07/s7/seq2 , am1_l07/s7/seq3 , am1_l07/s7/seq4 , am1_l07/s7/seq5 , am1_l07/s7/seq6 | `fe8fa192` |
| 2 | am1_l08 | 查重 | 题干/原句重复×5: "jake: are ___1___ your boxes? sara: yes, ___2" @ am1_l08/s7/seq1 , am1_l08/s7/seq2 , am1_l08/s7/seq3 , am1_l08/s7/seq4 , am1_l08/s7/seq5 | `74640dba` |
| 2 | am1_l09 | C7-未匹配原句 | 空3填"are"后无逐字匹配(疑精简/改写/错词): "and these ___3___ my cousins." | `25da852d` |
| 2 | am1_l09 | C7-未匹配原句 | 空4填"we"后无逐字匹配(疑精简/改写/错词): "— ethan: yes, ___4___ are." | `6ffb3291` |
| 2 | am1_l09 | C7-未匹配原句 | 空7填"aunt"后无逐字匹配(疑精简/改写/错词): "noah, this is my ___ carol." | `b9c6f5e0` |
| 2 | am1_l09 | 查重 | 题干/原句重复×2: "are you students? — yes, ___ are." @ am1_l09/s5/seq4 , am1_l09/s10/seq3 | `c93dbb42` |
| 2 | am1_l09 | 查重 | 题干/原句重复×2: "they are ___." @ am1_l09/s5/seq7 , am1_l10/s5/seq5 | `755abb41` |
| 2 | am1_l09 | 查重 | 题干/原句重复×6: "mia: welcome, noah! happy ___1___! mia: this " @ am1_l09/s7/seq1 , am1_l09/s7/seq2 , am1_l09/s7/seq3 , am1_l09/s7/seq4 , am1_l09/s7/seq5 , am1_l09/s7/seq6 | `a8dc65de` |
| 2 | am1_l10 | 查重 | 题干/原句重复×2: "what's the matter? — ___" @ am1_l10/s5/seq2 , am1_l10/s5/seq10 | `6686d38c` |
| 2 | am1_l10 | 查重 | 题干/原句重复×5: "ryan: what's the ___1___? zoe: i'm so ___2___" @ am1_l10/s7/seq1 , am1_l10/s7/seq2 , am1_l10/s7/seq3 , am1_l10/s7/seq4 , am1_l10/s7/seq5 | `143e975e` |
| 2 | am1_l11 | C7-未匹配原句 | 空5填"that"后无逐字匹配(疑精简/改写/错词): "— librarian: no, not ___5___ one." | `c46764b4` |
| 2 | am1_l11 | 查重 | 题干/原句重复×5: "emma: excuse me. is "the lost trail" ___1___?" @ am1_l11/s7/seq1 , am1_l11/s7/seq2 , am1_l11/s7/seq3 , am1_l11/s7/seq4 , am1_l11/s7/seq5 | `33d94ab2` |
| 2 | am1_l12 | 查重 | 题干/原句重复×2: "the books are ___ the shelf." @ am1_l12/s5/seq5 , am1_l12/s10/seq3 | `ba5e0dab` |
| 2 | am1_l12 | 查重 | 题干/原句重复×6: "clerk: are you here ___1___ glasses? clerk: t" @ am1_l12/s7/seq1 , am1_l12/s7/seq2 , am1_l12/s7/seq3 , am1_l12/s7/seq4 , am1_l12/s7/seq5 , am1_l12/s7/seq6 | `6f211be2` |
| 3 | am1_l13 | C7-未匹配原句 | 空4填"on"后无逐字匹配(疑精简/改写/错词): "the salt is ___4___ the counter." | `bcca221a` |
| 3 | am1_l13 | 查重 | 题干/原句重复×5: "owen: is ___1___ a pan here? nina: yes, there" @ am1_l13/s7/seq1 , am1_l13/s7/seq2 , am1_l13/s7/seq3 , am1_l13/s7/seq4 , am1_l13/s7/seq5 | `0cce35f9` |
| 3 | am1_l13 | 查重 | 题干/原句重复×2: "what night is it?" @ am1_l13/s8/seq1 , am1_l58/s8/seq1 | `2212794b` |
| 3 | am1_l14 | 查重 | 题干/原句重复×5: "kate: this garage is a ___1___! kate: are the" @ am1_l14/s7/seq1 , am1_l14/s7/seq2 , am1_l14/s7/seq3 , am1_l14/s7/seq4 , am1_l14/s7/seq5 | `9dc4f749` |
| 3 | am1_l15 | 查重 | 题干/原句重复×2: "must 后面接：" @ am1_l15/s5/seq7 , am1_l32/s10/seq3 | `90c73e7c` |
| 3 | am1_l15 | 查重 | 题干/原句重复×5: "priya: leo! ___1___ in! priya: ___2___ down, " @ am1_l15/s7/seq1 , am1_l15/s7/seq2 , am1_l15/s7/seq3 , am1_l15/s7/seq4 , am1_l15/s7/seq5 | `d7eba615` |
| 3 | am1_l16 | 查重 | 题干/原句重复×2: "sit 的 -ing 形式：" @ am1_l16/s5/seq7 , am1_l60/s5/seq11 | `60417d4d` |
| 3 | am1_l16 | 查重 | 题干/原句重复×2: "she is sleeping.（变一般疑问句）" @ am1_l16/s5/seq8 , am1_l16/s10/seq6 | `5d598bb3` |
| 3 | am1_l16 | 查重 | 题干/原句重复×6: "grandma: what are you ___1___? carmen: i'm __" @ am1_l16/s7/seq1 , am1_l16/s7/seq2 , am1_l16/s7/seq3 , am1_l16/s7/seq4 , am1_l16/s7/seq5 , am1_l16/s7/seq6 | `5cead250` |
| 3 | am1_l17 | 查重 | 题干/原句重复×2: "they are ___ ice cream." @ am1_l17/s5/seq2 , am1_l17/s10/seq3 | `4fc73cfa` |
| 3 | am1_l17 | 查重 | 题干/原句重复×2: "what's the ___ like? — it's sunny." @ am1_l17/s5/seq5 , am1_l17/s10/seq2 | `9a37a0a3` |
| 3 | am1_l17 | 查重 | 题干/原句重复×2: "what's the weather like? — ___" @ am1_l17/s5/seq6 , am1_l17/s5/seq13 | `9d3286c2` |
| 3 | am1_l17 | 查重 | 题干/原句重复×5: "tom: it's ___1___ and warm. jess: what's ___2" @ am1_l17/s7/seq1 , am1_l17/s7/seq2 , am1_l17/s7/seq3 , am1_l17/s7/seq4 , am1_l17/s7/seq5 | `e13e5a26` |
| 3 | am1_l18 | 查重 | 题干/原句重复×5: "maya: ___1___ a farmers market every saturday" @ am1_l18/s7/seq1 , am1_l18/s7/seq2 , am1_l18/s7/seq3 , am1_l18/s7/seq4 , am1_l18/s7/seq5 | `2deaa106` |
| 4 | am1_l19 | C7-未匹配原句 | 空1填"going"后无逐字匹配(疑精简/改写/错词): "we're ___1___ to have a bbq!" | `3dd189e8` |
| 4 | am1_l19 | 查重 | 题干/原句重复×5: "mark: we're ___1___ to have a bbq! mark: i'm " @ am1_l19/s7/seq1 , am1_l19/s7/seq2 , am1_l19/s7/seq3 , am1_l19/s7/seq4 , am1_l19/s7/seq5 | `3dd189e8` |
| 4 | am1_l20 | C7-未匹配原句 | 空4填"touch"后无逐字匹配(疑精简/改写/错词): "and don't ___4___ the balloons." | `c689e070` |
| 4 | am1_l20 | 查重 | 题干/原句重复×2: "touch the balloons.（变否定祈使句）" @ am1_l20/s5/seq5 , am1_l20/s10/seq6 | `d923f63b` |
| 4 | am1_l20 | 查重 | 题干/原句重复×5: "ruby: i'm ___1___ the banner. alex: i'm ___2_" @ am1_l20/s7/seq1 , am1_l20/s7/seq2 , am1_l20/s7/seq3 , am1_l20/s7/seq4 , am1_l20/s7/seq5 | `527cce1f` |
| 4 | am1_l21 | CH-选项数 | 选项数=6(非4) \| "We're good." 在对话里的意思是： | `1d71a7fb` |
| 4 | am1_l21 | 查重 | 题干/原句重复×2: "下列哪个是不可数名词：" @ am1_l21/s5/seq1 , am1_l21/s5/seq9 | `84d4ec04` |
| 4 | am1_l21 | 查重 | 题干/原句重复×2: "下列哪个是可数名词：" @ am1_l21/s5/seq2 , am1_l21/s5/seq10 | `ce848e6c` |
| 4 | am1_l21 | 查重 | 题干/原句重复×5: "amy: i'm making a shopping ___1___. nate: the" @ am1_l21/s7/seq1 , am1_l21/s7/seq2 , am1_l21/s7/seq3 , am1_l21/s7/seq4 , am1_l21/s7/seq5 | `9c47117f` |
| 4 | am1_l22 | 查重 | 题干/原句重复×5: "jordan: ___1___ you play the guitar? chloe: n" @ am1_l22/s7/seq1 , am1_l22/s7/seq2 , am1_l22/s7/seq3 , am1_l22/s7/seq4 , am1_l22/s7/seq5 | `28d37207` |
| 4 | am1_l23 | 查重 | 题干/原句重复×2: "we're lost. can you help ___?" @ am1_l23/s5/seq7 , am1_l23/s10/seq4 | `c45023f4` |
| 4 | am1_l23 | 查重 | 题干/原句重复×5: "dana: can you help ___1___? dana: can you che" @ am1_l23/s7/seq1 , am1_l23/s7/seq2 , am1_l23/s7/seq3 , am1_l23/s7/seq4 , am1_l23/s7/seq5 | `2884562f` |
| 4 | am1_l24 | CH-选项数 | 选项数=5(非4) \| Rosa's latte | `f14a7005` |
| 4 | am1_l24 | 查重 | 题干/原句重复×5: "barista: what can i ___1___ you? rosa: i ___2" @ am1_l24/s7/seq1 , am1_l24/s7/seq2 , am1_l24/s7/seq3 , am1_l24/s7/seq4 , am1_l24/s7/seq5 | `f67d728f` |
| 5 | am1_l25 | C7-未匹配原句 | 空5填"no"后无逐字匹配(疑精简/改写/错词): "tell them: ___5___ pineapple!" | `8d7de67e` |
| 5 | am1_l25 | CH-选项数 | 选项数=6(非4) \| "That's the way to go!" 的意思是： | `8c28b79a` |
| 5 | am1_l25 | 查重 | 题干/原句重复×2: "___ order tacos tonight!" @ am1_l25/s5/seq6 , am1_l25/s10/seq2 | `b15b61cb` |
| 5 | am1_l25 | 查重 | 题干/原句重复×5: "josh: what do you ___1___? emily: i ___2___ p" @ am1_l25/s7/seq1 , am1_l25/s7/seq2 , am1_l25/s7/seq3 , am1_l25/s7/seq4 , am1_l25/s7/seq5 | `30606f72` |
| 5 | am1_l26 | 查重 | 题干/原句重复×2: "i run ___ morning." @ am1_l26/s5/seq7 , am1_l26/s10/seq3 | `978f5d8c` |
| 5 | am1_l26 | 查重 | 题干/原句重复×5: "lauren: you're ___1___ early! ken: i ___2___ " @ am1_l26/s7/seq1 , am1_l26/s7/seq2 , am1_l26/s7/seq3 , am1_l26/s7/seq4 , am1_l26/s7/seq5 | `09b64f41` |
| 5 | am1_l27 | 查重 | 题干/原句重复×2: "___ he like animals? — yes, he does." @ am1_l27/s5/seq6 , am1_l27/s10/seq3 | `58faad82` |
| 5 | am1_l27 | 查重 | 题干/原句重复×2: "she ___ play music at night." @ am1_l27/s5/seq7 , am1_l27/s10/seq4 | `9d9c6dfd` |
| 5 | am1_l27 | 查重 | 题干/原句重复×5: "zach: he ___1___ at an animal hospital. zach:" @ am1_l27/s7/seq1 , am1_l27/s7/seq2 , am1_l27/s7/seq3 , am1_l27/s7/seq4 , am1_l27/s7/seq5 | `6cc3bbfa` |
| 5 | am1_l28 | C7-未匹配原句 | 空1填"works"后无逐字匹配(疑精简/改写/错词): "carter ___1___ at night." | `80f03425` |
| 5 | am1_l28 | C7-未匹配原句 | 空3填"gets"后无逐字匹配(疑精简/改写/错词): "she ___3___ up at six." | `eda92919` |
| 5 | am1_l28 | C7-未匹配原句 | 空4填"plays"后无逐字匹配(疑精简/改写/错词): "emma ___4___ soccer after school." | `cbf7abc9` |
| 5 | am1_l28 | 查重 | 题干/原句重复×2: "the kids ___ the school bus." @ am1_l28/s5/seq1 , am1_l28/s10/seq2 | `a194e4a2` |
| 5 | am1_l28 | 查重 | 题干/原句重复×2: "jack ___ homework after school." @ am1_l28/s5/seq2 , am1_l28/s10/seq3 | `7fd94259` |
| 5 | am1_l28 | 查重 | 题干/原句重复×2: "he plays soccer.（主语改 they）" @ am1_l28/s5/seq4 , am1_l28/s10/seq5 | `b52f0677` |
| 5 | am1_l28 | 查重 | 题干/原句重复×2: "we eat dinner at six.（主语改 the family）" @ am1_l28/s5/seq5 , am1_l28/s10/seq7 | `5dddc948` |
| 5 | am1_l28 | 查重 | 题干/原句重复×5: "mr. carter ___1___ at night. mrs. carter ___2" @ am1_l28/s7/seq1 , am1_l28/s7/seq2 , am1_l28/s7/seq3 , am1_l28/s7/seq4 , am1_l28/s7/seq5 | `80f03425` |
| 5 | am1_l29 | 查重 | 题干/原句重复×2: "i usually ___ coffee." @ am1_l29/s5/seq1 , am1_l29/s10/seq1 | `593dfbd4` |
| 5 | am1_l29 | 查重 | 题干/原句重复×2: "right now, she ___ tea." @ am1_l29/s5/seq2 , am1_l29/s10/seq2 | `475115e9` |
| 5 | am1_l29 | 查重 | 题干/原句重复×2: "she is running.（改为习惯：每天傍晚跑）" @ am1_l29/s5/seq5 , am1_l29/s10/seq6 | `a1cc5d8e` |
| 5 | am1_l29 | 查重 | 题干/原句重复×5: "raj: you ___1___ come in at nine. raj: are yo" @ am1_l29/s7/seq1 , am1_l29/s7/seq2 , am1_l29/s7/seq3 , am1_l29/s7/seq4 , am1_l29/s7/seq5 | `0796d233` |
| 5 | am1_l30 | C7-未匹配原句 | 空2填"bottles"后无逐字匹配(疑精简/改写/错词): "...two ___2___ of orange juice." | `17d6855c` |
| 5 | am1_l30 | CH-选项数 | 选项数=5(非4) \| Paper or plastic | `81d57498` |
| 5 | am1_l30 | 查重 | 题干/原句重复×2: "two ___ of juice" @ am1_l30/s5/seq3 , am1_l30/s10/seq2 | `fc42ed79` |
| 5 | am1_l30 | 查重 | 题干/原句重复×5: "cashier: a ___1___ of apples, a box of cereal" @ am1_l30/s7/seq1 , am1_l30/s7/seq2 , am1_l30/s7/seq3 , am1_l30/s7/seq4 , am1_l30/s7/seq5 | `71da98be` |
| 6 | am1_l31 | CH-选项数 | 选项数=6(非4) \| "That sounds rough." 里 rough 的意思是： | `dc2ef928` |
| 6 | am1_l31 | 查重 | 题干/原句重复×2: "she ___ a fever." @ am1_l31/s5/seq2 , am1_l31/s10/seq2 | `dec2b80e` |
| 6 | am1_l31 | 查重 | 题干/原句重复×2: "朋友生病，祝早日康复说：" @ am1_l31/s5/seq7 , am1_l31/s6/seq1 | `65f4f710` |
| 6 | am1_l31 | 查重 | 题干/原句重复×5: "kayla: i don't ___1___ well today. kayla: i _" @ am1_l31/s7/seq1 , am1_l31/s7/seq2 , am1_l31/s7/seq3 , am1_l31/s7/seq4 , am1_l31/s7/seq5 | `83e58d41` |
| 6 | am1_l32 | 查重 | 题干/原句重复×2: "mustn't 表示：" @ am1_l32/s5/seq5 , am1_l32/s10/seq4 | `eb04379e` |
| 6 | am1_l32 | 查重 | 题干/原句重复×5: "dr. patel: what ___1___ you in today? kayla: " @ am1_l32/s7/seq1 , am1_l32/s7/seq2 , am1_l32/s7/seq3 , am1_l32/s7/seq4 , am1_l32/s7/seq5 | `e4b01965` |
| 6 | am1_l33 | C7-未匹配原句 | 空2填"don't"后无逐字匹配(疑精简/改写/错词): "you ___2___ need to wash the dishes." | `c3596603` |
| 6 | am1_l33 | 查重 | 题干/原句重复×2: "you ___ need to bring anything.（不必）" @ am1_l33/s5/seq2 , am1_l33/s10/seq1 | `26f5d02d` |
| 6 | am1_l33 | 查重 | 题干/原句重复×2: "i need to clean the room.（变一般疑问句）" @ am1_l33/s5/seq4 , am1_l33/s10/seq6 | `950f4a0e` |
| 6 | am1_l33 | 查重 | 题干/原句重复×2: ""不必做"用：" @ am1_l33/s5/seq6 , am1_l33/s10/seq3 | `8a9be124` |
| 6 | am1_l33 | 查重 | 题干/原句重复×2: ""你必须完成作业"用：" @ am1_l33/s5/seq8 , am1_l33/s10/seq4 | `6fdcfdf5` |
| 6 | am1_l33 | 查重 | 题干/原句重复×5: "hailey: do i ___1___ to clean it right now? d" @ am1_l33/s7/seq1 , am1_l33/s7/seq2 , am1_l33/s7/seq3 , am1_l33/s7/seq4 , am1_l33/s7/seq5 | `b3e56437` |
| 6 | am1_l34 | 查重 | 题干/原句重复×2: "i ___ at home yesterday." @ am1_l34/s5/seq1 , am1_l34/s10/seq1 | `68db56e8` |
| 6 | am1_l34 | 查重 | 题干/原句重复×5: "omar: how ___1___ your weekend? nicole: i ___" @ am1_l34/s7/seq1 , am1_l34/s7/seq2 , am1_l34/s7/seq3 , am1_l34/s7/seq4 , am1_l34/s7/seq5 | `44ec3646` |
| 6 | am1_l35 | 查重 | 题干/原句重复×2: "___ there a contest? — yes, there was." @ am1_l35/s5/seq3 , am1_l35/s10/seq3 | `9cf96db7` |
| 6 | am1_l35 | 查重 | 题干/原句重复×5: "pete: that was the county fair ___1___ summer" @ am1_l35/s7/seq1 , am1_l35/s7/seq2 , am1_l35/s7/seq3 , am1_l35/s7/seq4 , am1_l35/s7/seq5 | `c8183beb` |
| 6 | am1_l36 | C7-未匹配原句 | 空2填"walked"后无逐字匹配(疑精简/改写/错词): "so i ___2___ to work in the rain." | `d28589d1` |
| 6 | am1_l36 | CH-选项数 | 选项数=5(非4) \| walked 的 -ed 读音： | `46f00e4f` |
| 6 | am1_l36 | CH-选项数 | 选项数=5(非4) \| called 的 -ed 读音： | `a799b243` |
| 6 | am1_l36 | CH-选项数 | 选项数=5(非4) \| spilled 的 -ed 读音： | `eb9b53ea` |
| 6 | am1_l36 | 查重 | 题干/原句重复×2: "i ___ to school yesterday." @ am1_l36/s5/seq1 , am1_l36/s10/seq1 | `a877e7f3` |
| 6 | am1_l36 | 查重 | 题干/原句重复×2: "stop 的过去式：" @ am1_l36/s5/seq2 , am1_l36/s10/seq2 | `52185d08` |
| 6 | am1_l36 | 查重 | 题干/原句重复×5: "max: i ___1___ the bus. max: so i ___2___ to " @ am1_l36/s7/seq1 , am1_l36/s7/seq2 , am1_l36/s7/seq3 , am1_l36/s7/seq4 , am1_l36/s7/seq5 | `21b49a43` |
| 7 | am1_l37 | C7-未匹配原句 | 空4填"ate"后无逐字匹配(疑精简/改写/错词): "we ___4___ at a tiny diner." | `30868faf` |
| 7 | am1_l37 | CH-选项数 | 选项数=6(非4) \| 口语 unreal 表示： | `e1a5c9e8` |
| 7 | am1_l37 | 查重 | 题干/原句重复×2: "go 的过去式：" @ am1_l37/s5/seq1 , am1_l37/s10/seq1 | `f19d063f` |
| 7 | am1_l37 | 查重 | 题干/原句重复×2: "we ___ a huge burger there." @ am1_l37/s5/seq3 , am1_l37/s10/seq2 | `5d84122c` |
| 7 | am1_l37 | 查重 | 题干/原句重复×2: "i eat at a diner.（改为昨天）" @ am1_l37/s5/seq5 , am1_l37/s10/seq5 | `a278c571` |
| 7 | am1_l37 | 查重 | 题干/原句重复×5: "derek: we ___1___ to the grand canyon! derek:" @ am1_l37/s7/seq1 , am1_l37/s7/seq2 , am1_l37/s7/seq3 , am1_l37/s7/seq4 , am1_l37/s7/seq5 | `90807f32` |
| 7 | am1_l38 | C7-未匹配原句 | 空3填"wore"后无逐字匹配(疑精简/改写/错词): "i ___3___ them once." | `f25292d0` |
| 7 | am1_l38 | CH-选项数 | 选项数=6(非4) \| receipt 是： | `423dac02` |
| 7 | am1_l38 | 查重 | 题干/原句重复×2: "buy 的过去式：" @ am1_l38/s5/seq1 , am1_l38/s10/seq1 | `11017372` |
| 7 | am1_l38 | 查重 | 题干/原句重复×2: "wear 的过去式：" @ am1_l38/s5/seq2 , am1_l38/s10/seq8 | `76395d0f` |
| 7 | am1_l38 | 查重 | 题干/原句重复×2: "pay 的过去式：" @ am1_l38/s5/seq3 , am1_l38/s5/seq9 | `c25f6740` |
| 7 | am1_l38 | 查重 | 题干/原句重复×5: "tessa: i ___1___ these sneakers online last w" @ am1_l38/s7/seq1 , am1_l38/s7/seq2 , am1_l38/s7/seq3 , am1_l38/s7/seq4 , am1_l38/s7/seq5 | `deb44408` |
| 7 | am1_l39 | CH-选项数 | 选项数=6(非4) \| "Thursday works." 里 works 表示： | `76282581` |
| 7 | am1_l39 | 查重 | 题干/原句重复×2: "___ you watch the game last night?" @ am1_l39/s5/seq1 , am1_l39/s10/seq1 | `162f71a0` |
| 7 | am1_l39 | 查重 | 题干/原句重复×2: "did she call you? — yes, she ___." @ am1_l39/s5/seq2 , am1_l39/s10/seq2 | `20a7fc59` |
| 7 | am1_l39 | 查重 | 题干/原句重复×2: "did you ___ the doctor?" @ am1_l39/s5/seq3 , am1_l39/s10/seq4 | `5acf5560` |
| 7 | am1_l39 | 查重 | 题干/原句重复×2: "you bought a ticket.（变一般疑问句）" @ am1_l39/s5/seq4 , am1_l39/s10/seq5 | `a24cb959` |
| 7 | am1_l39 | 查重 | 题干/原句重复×2: "did you eat breakfast?（否定简答）" @ am1_l39/s5/seq5 , am1_l39/s10/seq7 | `683f302c` |
| 7 | am1_l39 | 查重 | 题干/原句重复×2: "i ___ finish my homework yesterday.（没）" @ am1_l39/s5/seq6 , am1_l39/s10/seq3 | `0b32bf69` |
| 7 | am1_l39 | 查重 | 题干/原句重复×2: "didn't 后面接：" @ am1_l39/s5/seq7 , am1_l39/s5/seq15 | `1343be24` |
| 7 | am1_l39 | 查重 | 题干/原句重复×2: "he came at noon.（变否定句）" @ am1_l39/s5/seq8 , am1_l39/s10/seq6 | `05d89c60` |
| 7 | am1_l39 | 查重 | 题干/原句重复×5: "gloria: ___1___ you have the nine o'clock? vi" @ am1_l39/s7/seq1 , am1_l39/s7/seq2 , am1_l39/s7/seq3 , am1_l39/s7/seq4 , am1_l39/s7/seq5 | `7c533e83` |
| 7 | am1_l40 | 查重 | 题干/原句重复×2: "we ___ to buy napkins." @ am1_l40/s5/seq1 , am1_l40/s10/seq3 | `18f2a48e` |
| 7 | am1_l40 | 查重 | 题干/原句重复×2: "we get paper plates.（用 have to 表必须）" @ am1_l40/s5/seq3 , am1_l40/s10/seq5 | `774cc384` |
| 7 | am1_l40 | 查重 | 题干/原句重复×2: "___ many cups do we need?" @ am1_l40/s5/seq4 , am1_l40/s10/seq1 | `39cf96bd` |
| 7 | am1_l40 | 查重 | 题干/原句重复×2: "how ___ water do we need?" @ am1_l40/s5/seq5 , am1_l40/s10/seq2 | `d3823165` |
| 7 | am1_l40 | 查重 | 题干/原句重复×2: "how much ___ this ketchup?" @ am1_l40/s5/seq7 , am1_l40/s10/seq4 | `977285b7` |
| 7 | am1_l40 | 查重 | 题干/原句重复×2: "how many soda do we need?（改正错误）" @ am1_l40/s5/seq8 , am1_l40/s10/seq7 | `32f89624` |
| 7 | am1_l40 | 查重 | 题干/原句重复×5: "carla: we ___1___ to get everything today. we" @ am1_l40/s7/seq1 , am1_l40/s7/seq2 , am1_l40/s7/seq3 , am1_l40/s7/seq4 , am1_l40/s7/seq5 | `5cda7839` |
| 7 | am1_l41 | 查重 | 题干/原句重复×2: "make 的过去式：" @ am1_l41/s5/seq1 , am1_l41/s10/seq1 | `aa705969` |
| 7 | am1_l41 | 查重 | 题干/原句重复×2: "win 的过去式：" @ am1_l41/s5/seq2 , am1_l41/s10/seq2 | `c9a91489` |
| 7 | am1_l41 | 查重 | 题干/原句重复×2: "he cooks all day.（改为昨天）" @ am1_l41/s5/seq4 , am1_l41/s10/seq5 | `bdfc3712` |
| 7 | am1_l41 | 查重 | 题干/原句重复×2: "she makes the salad.（改为过去式）" @ am1_l41/s5/seq5 , am1_l41/s10/seq6 | `834d09d4` |
| 7 | am1_l41 | 查重 | 题干/原句重复×2: "what do you make?（改为过去式提问）" @ am1_l41/s5/seq8 , am1_l41/s10/seq7 | `53036d45` |
| 7 | am1_l41 | 查重 | 题干/原句重复×5: "mia: grandpa joe ___1___ all day again. mia: " @ am1_l41/s7/seq1 , am1_l41/s7/seq2 , am1_l41/s7/seq3 , am1_l41/s7/seq4 , am1_l41/s7/seq5 | `0ba0fd04` |
| 7 | am1_l42 | C7-未匹配原句 | 空3填"swam"后无逐字匹配(疑精简/改写/错词): "we ___3___ every morning." | `5bb17b91` |
| 7 | am1_l42 | C7-未匹配原句 | 空4填"list"后无逐字匹配(疑精简/改写/错词): "i'm making a packing ___4___ right now." | `d045ac24` |
| 7 | am1_l42 | 查重 | 题干/原句重复×2: "i ___ to miami last year." @ am1_l42/s5/seq1 , am1_l42/s10/seq1 | `b8562903` |
| 7 | am1_l42 | 查重 | 题干/原句重复×2: "tomorrow we ___ going to fly." @ am1_l42/s5/seq3 , am1_l42/s10/seq3 | `f13071a0` |
| 7 | am1_l42 | 查重 | 题干/原句重复×2: "swim 的过去式：" @ am1_l42/s5/seq4 , am1_l42/s10/seq4 | `2081fda4` |
| 7 | am1_l42 | 查重 | 题干/原句重复×2: "we eat seafood.（改为去年）" @ am1_l42/s5/seq5 , am1_l42/s10/seq6 | `7458b3cc` |
| 7 | am1_l42 | 查重 | 题干/原句重复×2: "i visit south beach.（改为明天的打算）" @ am1_l42/s5/seq6 , am1_l42/s10/seq5 | `1613cb8b` |
| 7 | am1_l42 | 查重 | 题干/原句重复×5: "ivy: we're going to ___1___ to miami. max: i " @ am1_l42/s7/seq1 , am1_l42/s7/seq2 , am1_l42/s7/seq3 , am1_l42/s7/seq4 , am1_l42/s7/seq5 | `d40f5212` |
| 8 | am1_l43 | 查重 | 题干/原句重复×2: "i ___ been to five national parks." @ am1_l43/s5/seq1 , am1_l43/s10/seq1 | `8a9e7cc8` |
| 8 | am1_l43 | 查重 | 题干/原句重复×2: "she ___ been to miami twice." @ am1_l43/s5/seq2 , am1_l43/s10/seq2 | `3126b8a0` |
| 8 | am1_l43 | 查重 | 题干/原句重复×2: "have you ever ___ to texas?" @ am1_l43/s5/seq3 , am1_l43/s10/seq3 | `9055b9e3` |
| 8 | am1_l43 | 查重 | 题干/原句重复×2: "i go to yellowstone.（改为"去过两次"的经历）" @ am1_l43/s5/seq4 , am1_l43/s10/seq5 | `963936a7` |
| 8 | am1_l43 | 查重 | 题干/原句重复×2: "she has been to the beach.（变一般疑问句）" @ am1_l43/s5/seq5 , am1_l43/s10/seq6 | `7674cc9c` |
| 8 | am1_l43 | 查重 | 题干/原句重复×2: "have you been there? — no, i ___." @ am1_l43/s5/seq7 , am1_l43/s10/seq4 | `be85748d` |
| 8 | am1_l43 | 查重 | 题干/原句重复×2: "i have been there.（改为"从未"）" @ am1_l43/s5/seq8 , am1_l43/s10/seq7 | `c22579b9` |
| 8 | am1_l43 | 查重 | 题干/原句重复×5: "colin: ___1___ you been to yellowstone? faith" @ am1_l43/s7/seq1 , am1_l43/s7/seq2 , am1_l43/s7/seq3 , am1_l43/s7/seq4 , am1_l43/s7/seq5 | `f845b719` |
| 8 | am1_l44 | 查重 | 题干/原句重复×2: "she has ___ arrived.（刚刚）" @ am1_l44/s5/seq1 , am1_l44/s10/seq1 | `ce0d3b7e` |
| 8 | am1_l44 | 查重 | 题干/原句重复×2: "take 的过去分词：" @ am1_l44/s5/seq3 , am1_l44/s10/seq4 | `246de969` |
| 8 | am1_l44 | 查重 | 题干/原句重复×2: "she leaves a note.（改为现在完成时：已留下）" @ am1_l44/s5/seq5 , am1_l44/s10/seq7 | `9a3a0670` |
| 8 | am1_l44 | 查重 | 题干/原句重复×2: "have you eaten ___? — not yet." @ am1_l44/s5/seq6 , am1_l44/s10/seq2 | `bc78e61f` |
| 8 | am1_l44 | 查重 | 题干/原句重复×2: "i haven't finished ___." @ am1_l44/s5/seq7 , am1_l44/s10/seq3 | `4c00c78d` |
| 8 | am1_l44 | 查重 | 题干/原句重复×5: "victor: someone has ___1___ hit my car! agent" @ am1_l44/s7/seq1 , am1_l44/s7/seq2 , am1_l44/s7/seq3 , am1_l44/s7/seq4 , am1_l44/s7/seq5 | `be648c7a` |
| 8 | am1_l45 | 查重 | 题干/原句重复×2: "i've lived here ___ ten years." @ am1_l45/s5/seq1 , am1_l45/s10/seq1 | `4f08e063` |
| 8 | am1_l45 | 查重 | 题干/原句重复×2: "she has worked there ___ 2020." @ am1_l45/s5/seq2 , am1_l45/s10/seq2 | `543910f9` |
| 8 | am1_l45 | 查重 | 题干/原句重复×2: "for 后面接：" @ am1_l45/s5/seq3 , am1_l45/s10/seq3 | `096d749a` |
| 8 | am1_l45 | 查重 | 题干/原句重复×2: "i live in denver.（改为"住了五年了"）" @ am1_l45/s5/seq5 , am1_l45/s10/seq5 | `4cea96c8` |
| 8 | am1_l45 | 查重 | 题干/原句重复×2: "he works at the hospital.（改为"自 2021 年起一直"）" @ am1_l45/s5/seq6 , am1_l45/s10/seq6 | `212e3287` |
| 8 | am1_l45 | 查重 | 题干/原句重复×2: "we haven't seen each other for ten years.（改用 " @ am1_l45/s5/seq8 , am1_l45/s10/seq7 | `f905b028` |
| 8 | am1_l45 | 查重 | 题干/原句重复×5: "wendy: it's been ___1___! dana: how ___2___ h" @ am1_l45/s7/seq1 , am1_l45/s7/seq2 , am1_l45/s7/seq3 , am1_l45/s7/seq4 , am1_l45/s7/seq5 | `dadd8eb4` |
| 8 | am1_l46 | C7-未匹配原句 | 空5填"arrived"后无逐字匹配(疑精简/改写/错词): "the moving truck ___5___ this morning." | `35a24bb3` |
| 8 | am1_l46 | CH-选项数 | 选项数=6(非4) \| 美国人欢迎新邻居的经典方式是： | `5ad068fe` |
| 8 | am1_l46 | 查重 | 题干/原句重复×2: "they ___ their house! big news!" @ am1_l46/s5/seq1 , am1_l46/s10/seq1 | `32e4b26b` |
| 8 | am1_l46 | 查重 | 题干/原句重复×2: "they ___ it last tuesday." @ am1_l46/s5/seq2 , am1_l46/s10/seq2 | `c670e13a` |
| 8 | am1_l46 | 查重 | 题干/原句重复×2: "i ___ them yesterday." @ am1_l46/s5/seq3 , am1_l46/s10/seq3 | `0239214e` |
| 8 | am1_l46 | 查重 | 题干/原句重复×2: "i have met the new owners.（加"昨天"改写）" @ am1_l46/s5/seq4 , am1_l46/s10/seq5 | `6fb2fe12` |
| 8 | am1_l46 | 查重 | 题干/原句重复×2: "they sold the house.（去掉具体时间，改为完成时报新闻）" @ am1_l46/s5/seq5 , am1_l46/s10/seq6 | `8d9d0eae` |
| 8 | am1_l46 | 查重 | 题干/原句重复×5: "下列哪句正确：" @ am1_l46/s5/seq13 , am1_l54/s5/seq15 , am1_l55/s5/seq15 , am1_l62/s5/seq15 , am1_l68/s5/seq15 | `b4881246` |
| 8 | am1_l46 | 查重 | 题干/原句重复×5: "megan: the johnsons have ___1___ their house!" @ am1_l46/s7/seq1 , am1_l46/s7/seq2 , am1_l46/s7/seq3 , am1_l46/s7/seq4 , am1_l46/s7/seq5 | `c58c4688` |
| 8 | am1_l47 | C7-未匹配原句 | 空2填"sleep"后无逐字匹配(疑精简/改写/错词): ""i'll ___2___ in three countries this month." ___3___ h" | `8053ec3c` |
| 8 | am1_l47 | C7-未匹配原句 | 空3填"Will"后无逐字匹配(疑精简/改写/错词): ""i'll ___2___ in three countries this month." ___3___ h" | `d041efb0` |
| 8 | am1_l47 | 查重 | 题干/原句重复×2: "he ___ fly to tokyo next week." @ am1_l47/s5/seq1 , am1_l47/s10/seq1 | `3bda982d` |
| 8 | am1_l47 | 查重 | 题干/原句重复×3: "will 后面接：" @ am1_l47/s5/seq2 , am1_l47/s5/seq10 , am1_l47/s10/seq4 | `0d89595b` |
| 8 | am1_l47 | 查重 | 题干/原句重复×2: "she starts a new job in june.（用 will 改为将来）" @ am1_l47/s5/seq4 , am1_l47/s10/seq5 | `b281fa38` |
| 8 | am1_l47 | 查重 | 题干/原句重复×2: "won't =" @ am1_l47/s5/seq6 , am1_l47/s10/seq3 | `2c35748a` |
| 8 | am1_l47 | 查重 | 题干/原句重复×2: "they will move here.（变一般疑问句）" @ am1_l47/s5/seq7 , am1_l47/s10/seq6 | `e10dcb1c` |
| 8 | am1_l47 | 查重 | 题干/原句重复×2: "i will invite them.（变否定句）" @ am1_l47/s5/seq8 , am1_l47/s10/seq7 | `4d938369` |
| 8 | am1_l47 | 查重 | 题干/原句重复×5: "carlos: he'll ___1___ to tokyo next week. car" @ am1_l47/s7/seq1 , am1_l47/s7/seq2 , am1_l47/s7/seq3 , am1_l47/s7/seq4 , am1_l47/s7/seq5 | `f15698c3` |
| 8 | am1_l48 | C7-未匹配原句 | 空1填"time"后无逐字匹配(疑精简/改写/错词): "flight 214—is it on ___1___?" | `9bd01944` |
| 8 | am1_l48 | 查重 | 题干/原句重复×2: "when ___ the train leave?" @ am1_l48/s5/seq1 , am1_l48/s10/seq1 | `16b9007e` |
| 8 | am1_l48 | 查重 | 题干/原句重复×2: "it will ___ at 3:45." @ am1_l48/s5/seq2 , am1_l48/s10/seq2 | `62c109f5` |
| 8 | am1_l48 | 查重 | 题干/原句重复×2: "boarding ___ start at 3:15." @ am1_l48/s5/seq3 , am1_l48/s10/seq4 | `80a3360e` |
| 8 | am1_l48 | 查重 | 题干/原句重复×2: "the flight leaves at 7:30.（用 will 改写）" @ am1_l48/s5/seq4 , am1_l48/s10/seq5 | `374132a9` |
| 8 | am1_l48 | 查重 | 题干/原句重复×2: "the flight is ___. it won't leave on time." @ am1_l48/s5/seq13 , am1_l48/s10/seq3 | `ace969b3` |
| 8 | am1_l48 | 查重 | 题干/原句重复×5: "ivy: flight 214—is it on ___1___? agent: that" @ am1_l48/s7/seq1 , am1_l48/s7/seq2 , am1_l48/s7/seq3 , am1_l48/s7/seq4 , am1_l48/s7/seq5 | `9bd01944` |
| 9 | am1_l49 | 查重 | 题干/原句重复×2: "this is my bottle.（用 mine 改写）" @ am1_l49/s5/seq12 , am1_l49/s10/seq5 | `f6e4b67d` |
| 9 | am1_l49 | 查重 | 题干/原句重复×2: "these are our headphones.（用 ours 改写）" @ am1_l49/s5/seq16 , am1_l49/s10/seq7 | `3a47eb6b` |
| 9 | am1_l49 | 查重 | 题干/原句重复×5: "paul: is it in the lost and ___1___? jenna: i" @ am1_l49/s7/seq1 , am1_l49/s7/seq2 , am1_l49/s7/seq3 , am1_l49/s7/seq4 , am1_l49/s7/seq5 | `305e30fb` |
| 9 | am1_l50 | 查重 | 题干/原句重复×2: "they enjoyed ___ at the party." @ am1_l50/s5/seq4 , am1_l50/s10/seq3 | `1ea7a07f` |
| 9 | am1_l50 | 查重 | 题干/原句重复×2: "you hurt you.（改正：用反身代词）" @ am1_l50/s5/seq5 , am1_l50/s10/seq6 | `266706c8` |
| 9 | am1_l50 | 查重 | 题干/原句重复×5: "andre: i hurt ___1___ a little. kyle: you can" @ am1_l50/s7/seq1 , am1_l50/s7/seq2 , am1_l50/s7/seq3 , am1_l50/s7/seq4 , am1_l50/s7/seq5 | `88e5cc9e` |
| 9 | am1_l51 | C7-未匹配原句 | 空2填"already"后无逐字匹配(疑精简/改写/错词): "i've ___2___ called your mom." | `c30f8100` |
| 9 | am1_l51 | C7-未匹配原句 | 空4填"congratulations"后无逐字匹配(疑精简/改写/错词): ""dear hailey, ___4___!" mom has just ___5___ me." | `172fc98b` |
| 9 | am1_l51 | C7-未匹配原句 | 空5填"texted"后无逐字匹配(疑精简/改写/错词): ""dear hailey, ___4___!" mom has just ___5___ me." | `8603daf2` |
| 9 | am1_l51 | 查重 | 题干/原句重复×2: "i've ___ finished my homework.（已经）" @ am1_l51/s5/seq1 , am1_l51/s10/seq1 | `58c46df3` |
| 9 | am1_l51 | 查重 | 题干/原句重复×2: "i called mom.（改为"已经打过了"）" @ am1_l51/s5/seq3 , am1_l51/s10/seq5 | `c8195c4a` |
| 9 | am1_l51 | 查重 | 题干/原句重复×2: "she has ___ arrived—one minute ago!（刚刚）" @ am1_l51/s5/seq5 , am1_l51/s10/seq2 | `4f817a88` |
| 9 | am1_l51 | 查重 | 题干/原句重复×5: "dad: have you opened it ___1___? dad: i've __" @ am1_l51/s7/seq1 , am1_l51/s7/seq2 , am1_l51/s7/seq3 , am1_l51/s7/seq4 , am1_l51/s7/seq5 | `40c8eefa` |
| 9 | am1_l52 | 查重 | 题干/原句重复×2: "the box is ___ heavy for me." @ am1_l52/s5/seq1 , am1_l52/s10/seq1 | `f9a66a12` |
| 9 | am1_l52 | 查重 | 题干/原句重复×2: "the test is hard. i can't do it.（用 too...for " @ am1_l52/s5/seq3 , am1_l52/s10/seq5 | `f03af344` |
| 9 | am1_l52 | 查重 | 题干/原句重复×2: "i don't have ___ money." @ am1_l52/s5/seq5 , am1_l52/s10/seq2 | `bb0b13ff` |
| 9 | am1_l52 | 查重 | 题干/原句重复×2: "enough 修饰名词时在名词的：" @ am1_l52/s5/seq7 , am1_l52/s10/seq4 | `b596e42b` |
| 9 | am1_l52 | 查重 | 题干/原句重复×2: "i have time. it's enough.（合成一句）" @ am1_l52/s5/seq8 , am1_l52/s10/seq7 | `d250637a` |
| 9 | am1_l52 | 查重 | 题干/原句重复×5: "sean: you've studied ___1___. nadia: chapter " @ am1_l52/s7/seq1 , am1_l52/s7/seq2 , am1_l52/s7/seq3 , am1_l52/s7/seq4 , am1_l52/s7/seq5 | `904bcbdf` |
| 9 | am1_l53 | C7-未匹配原句 | 空1填"quickly"后无逐字匹配(疑精简/改写/错词): ""he runs quick." that needs an l-y: "___1___." "she sin" | `9b2045ec` |
| 9 | am1_l53 | C7-未匹配原句 | 空2填"beautifully"后无逐字匹配(疑精简/改写/错词): ""he runs quick." that needs an l-y: "___1___." "she sin" | `1b596432` |
| 9 | am1_l53 | C7-未匹配原句 | 空3填"hard"后无逐字匹配(疑精简/改写/错词): ""he runs quick." that needs an l-y: "___1___." "she sin" | `0e5fb356` |
| 9 | am1_l53 | C7-未匹配原句 | 空4填"not"后无逐字匹配(疑精简/改写/错词): ""hardly" means "almost ___4___." you explain things ___" | `68d1bcf6` |
| 9 | am1_l53 | C7-未匹配原句 | 空5填"clearly"后无逐字匹配(疑精简/改写/错词): ""hardly" means "almost ___4___." you explain things ___" | `a9fde50c` |
| 9 | am1_l53 | 查重 | 题干/原句重复×2: "she sings ___." @ am1_l53/s5/seq1 , am1_l53/s10/seq1 | `48ec2ad9` |
| 9 | am1_l53 | 查重 | 题干/原句重复×2: "he speaks ___.（清楚地）" @ am1_l53/s5/seq2 , am1_l53/s5/seq10 | `be1af97e` |
| 9 | am1_l53 | 查重 | 题干/原句重复×2: "they work ___.（努力）" @ am1_l53/s5/seq5 , am1_l53/s10/seq3 | `03f4d382` |
| 9 | am1_l53 | 查重 | 题干/原句重复×2: ""he hardly works" 的意思是：" @ am1_l53/s5/seq6 , am1_l53/s10/seq4 | `3f27df05` |
| 9 | am1_l53 | 查重 | 题干/原句重复×5: "erin: "he runs quick." that needs an l-y: "__" @ am1_l53/s7/seq1 , am1_l53/s7/seq2 , am1_l53/s7/seq3 , am1_l53/s7/seq4 , am1_l53/s7/seq5 | `9b2045ec` |
| 9 | am1_l54 | 查重 | 题干/原句重复×3: "big 的比较级：" @ am1_l54/s5/seq1 , am1_l54/s5/seq9 , am1_l54/s10/seq1 | `693484b1` |
| 9 | am1_l54 | 查重 | 题干/原句重复×2: "good 的比较级：" @ am1_l54/s5/seq3 , am1_l54/s10/seq3 | `a5013103` |
| 9 | am1_l54 | 查重 | 题干/原句重复×2: "i need a small size.（改为"更小一号"）" @ am1_l54/s5/seq5 , am1_l54/s10/seq7 | `f96c6ade` |
| 9 | am1_l54 | 查重 | 题干/原句重复×2: "these jeans are cheaper ___ those." @ am1_l54/s5/seq6 , am1_l54/s10/seq2 | `b2140ad0` |
| 9 | am1_l54 | 查重 | 题干/原句重复×5: "tessa: do you have a ___1___ size? ray: these" @ am1_l54/s7/seq1 , am1_l54/s7/seq2 , am1_l54/s7/seq3 , am1_l54/s7/seq4 , am1_l54/s7/seq5 | `b3ed873d` |
| 10 | am1_l55 | 查重 | 题干/原句重复×2: "this hotel is ___ expensive than that one." @ am1_l55/s5/seq1 , am1_l55/s10/seq1 | `944af5f9` |
| 10 | am1_l55 | 查重 | 题干/原句重复×3: "expensive 的比较级：" @ am1_l55/s5/seq2 , am1_l55/s5/seq9 , am1_l55/s10/seq2 | `a63abe7f` |
| 10 | am1_l55 | 查重 | 题干/原句重复×2: "this chair is ___ comfortable than mine." @ am1_l55/s5/seq3 , am1_l55/s10/seq4 | `4896d5d7` |
| 10 | am1_l55 | 查重 | 题干/原句重复×2: "this book is interesting. that book is not.（用" @ am1_l55/s5/seq4 , am1_l55/s10/seq6 | `518eee6a` |
| 10 | am1_l55 | 查重 | 题干/原句重复×2: "单音节形容词的比较级一般：" @ am1_l55/s5/seq5 , am1_l55/s10/seq3 | `94325202` |
| 10 | am1_l55 | 查重 | 题干/原句重复×2: "the seafood is fresh there.（改为比较级：比这里更新鲜）" @ am1_l55/s5/seq8 , am1_l55/s10/seq7 | `5f0ec1ad` |
| 10 | am1_l55 | 查重 | 题干/原句重复×5: "carla: bella roma is more ___1___. wes: the h" @ am1_l55/s7/seq1 , am1_l55/s7/seq2 , am1_l55/s7/seq3 , am1_l55/s7/seq4 , am1_l55/s7/seq5 | `54d0d1e3` |
| 10 | am1_l56 | 查重 | 题干/原句重复×2: "this is ___ cheapest car here." @ am1_l56/s5/seq1 , am1_l56/s10/seq1 | `e025ea17` |
| 10 | am1_l56 | 查重 | 题干/原句重复×3: "popular 的最高级：" @ am1_l56/s5/seq2 , am1_l56/s5/seq10 , am1_l56/s10/seq2 | `4adc2810` |
| 10 | am1_l56 | 查重 | 题干/原句重复×2: "new 的最高级：" @ am1_l56/s5/seq3 , am1_l56/s5/seq11 | `af77a06f` |
| 10 | am1_l56 | 查重 | 题干/原句重复×3: "good 的最高级：" @ am1_l56/s5/seq5 , am1_l56/s10/seq3 , am1_l56/s10/seq8 | `31f9bec2` |
| 10 | am1_l56 | 查重 | 题干/原句重复×3: "bad 的最高级：" @ am1_l56/s5/seq6 , am1_l56/s5/seq12 , am1_l56/s10/seq4 | `f1ffb7b1` |
| 10 | am1_l56 | 查重 | 题干/原句重复×2: "she is a nice teacher.（改为最高级：全校最好的老师）" @ am1_l56/s5/seq8 , am1_l56/s10/seq7 | `c03b42c2` |
| 10 | am1_l56 | 查重 | 题干/原句重复×5: "big al: this one is the ___1___ car on the lo" @ am1_l56/s7/seq1 , am1_l56/s7/seq2 , am1_l56/s7/seq3 , am1_l56/s7/seq4 , am1_l56/s7/seq5 | `e7456d59` |
| 10 | am1_l57 | C7-未匹配原句 | 空8填"nickels"后无逐字匹配(疑精简/改写/错词): "okay: dimes, ___..." | `a0805466` |
| 10 | am1_l57 | 查重 | 题干/原句重复×2: "do you have some coins?（改为更自然的疑问，用 any）" @ am1_l57/s5/seq4 , am1_l57/s10/seq6 | `f58d556f` |
| 10 | am1_l57 | 查重 | 题干/原句重复×2: "i have some quarters.（变否定：一个也没有，用 any）" @ am1_l57/s5/seq8 , am1_l57/s10/seq5 | `c31add00` |
| 10 | am1_l57 | 查重 | 题干/原句重复×5: "jamal: this meter only takes ___1___. jamal: " @ am1_l57/s7/seq1 , am1_l57/s7/seq2 , am1_l57/s7/seq3 , am1_l57/s7/seq4 , am1_l57/s7/seq5 | `ba0b747a` |
| 10 | am1_l58 | 查重 | 题干/原句重复×2: "some person took the candy.（用 somebody 改写）" @ am1_l58/s5/seq5 , am1_l58/s10/seq5 | `d979e00b` |
| 10 | am1_l58 | 查重 | 题干/原句重复×2: "somebody ___ at the door." @ am1_l58/s5/seq7 , am1_l58/s10/seq4 | `1cd1b3a8` |
| 10 | am1_l58 | 查重 | 题干/原句重复×5: "faith: ___1___ is at the door again! derek: _" @ am1_l58/s7/seq1 , am1_l58/s7/seq2 , am1_l58/s7/seq3 , am1_l58/s7/seq4 , am1_l58/s7/seq5 | `df18d880` |
| 10 | am1_l58 | 查重 | 题干/原句重复×2: "did ___ call me?" @ am1_l58/s10/seq2 , am1_l58/s10/seq9 | `edcc2814` |
| 10 | am1_l59 | 查重 | 题干/原句重复×2: "you were sleeping.（变一般疑问句）" @ am1_l59/s5/seq4 , am1_l59/s10/seq7 | `bd830fe0` |
| 10 | am1_l59 | 查重 | 题干/原句重复×2: "she was reading ___ he was cooking.（同时）" @ am1_l59/s5/seq6 , am1_l59/s10/seq4 | `13f78263` |
| 10 | am1_l59 | 查重 | 题干/原句重复×2: "i ride my bike. a dog runs out.（用 was...when " @ am1_l59/s5/seq7 , am1_l59/s10/seq5 | `80a379b4` |
| 10 | am1_l59 | 查重 | 题干/原句重复×2: "he watched tv. she cooked.（用 while 改为同时进行）" @ am1_l59/s5/seq8 , am1_l59/s10/seq6 | `0d5eb158` |
| 10 | am1_l59 | 查重 | 题干/原句重复×5: "raj: i was ___1___ my bike when a squirrel ra" @ am1_l59/s7/seq1 , am1_l59/s7/seq2 , am1_l59/s7/seq3 , am1_l59/s7/seq4 , am1_l59/s7/seq5 | `9bedd4b5` |
| 10 | am1_l60 | C7-未匹配原句 | 空2填"heard"后无逐字匹配(疑精简/改写/错词): "suddenly, they ___2___ a strange sound." | `322339c6` |
| 10 | am1_l60 | C7-未匹配原句 | 空5填"eating"后无逐字匹配(疑精简/改写/错词): "it was ___5___ their marshmallows." | `1f628f6b` |
| 10 | am1_l60 | 查重 | 题干/原句重复×2: "they ___ sitting by the fire." @ am1_l60/s5/seq1 , am1_l60/s5/seq9 | `ffa2fb62` |
| 10 | am1_l60 | 查重 | 题干/原句重复×2: "something ___ moving in the trees." @ am1_l60/s5/seq2 , am1_l60/s10/seq2 | `2e8c49ac` |
| 10 | am1_l60 | 查重 | 题干/原句重复×2: "his hands shake.（改为过去进行时）" @ am1_l60/s5/seq3 , am1_l60/s10/seq6 | `86bf30be` |
| 10 | am1_l60 | 查重 | 题干/原句重复×2: "the raccoon eats marshmallows.（改为过去进行时）" @ am1_l60/s5/seq4 , am1_l60/s10/seq7 | `a5529262` |
| 10 | am1_l60 | 查重 | 题干/原句重复×2: "hear 的过去式：" @ am1_l60/s5/seq6 , am1_l60/s10/seq3 | `ad2b25f6` |
| 10 | am1_l60 | 查重 | 题干/原句重复×2: "it walked away ___.（慢慢地）" @ am1_l60/s5/seq7 , am1_l60/s10/seq4 | `b07b2f4a` |
| 10 | am1_l60 | 查重 | 题干/原句重复×5: "they were ___1___ by the fire and telling sto" @ am1_l60/s7/seq1 , am1_l60/s7/seq2 , am1_l60/s7/seq3 , am1_l60/s7/seq4 , am1_l60/s7/seq5 | `81565257` |
| 11 | am1_l61 | 查重 | 题干/原句重复×2: "she's a teacher ___ loves her students." @ am1_l61/s5/seq1 , am1_l61/s10/seq1 | `d9875dde` |
| 11 | am1_l61 | 查重 | 题干/原句重复×2: "i know a guy ___ fixes cars." @ am1_l61/s5/seq2 , am1_l61/s10/seq2 | `79d31492` |
| 11 | am1_l61 | 查重 | 题干/原句重复×2: "who 用来修饰：" @ am1_l61/s5/seq3 , am1_l61/s10/seq3 | `72c998e2` |
| 11 | am1_l61 | 查重 | 题干/原句重复×2: "he is a chef. he has a diner in texas.（用 who " @ am1_l61/s5/seq4 , am1_l61/s10/seq5 | `6c8095b6` |
| 11 | am1_l61 | 查重 | 题干/原句重复×2: "i have a friend. he never drinks coffee.（用 wh" @ am1_l61/s5/seq5 , am1_l61/s10/seq7 | `e2deca54` |
| 11 | am1_l61 | 查重 | 题干/原句重复×2: "people who ___ early feel great." @ am1_l61/s5/seq6 , am1_l61/s10/seq4 | `c0238126` |
| 11 | am1_l61 | 查重 | 题干/原句重复×2: "she is a writer. she builds smart stories.（用 " @ am1_l61/s5/seq8 , am1_l61/s10/seq6 | `982c067c` |
| 11 | am1_l61 | 查重 | 题干/原句重复×5: "emma: he's someone ___1___ reads everything. " @ am1_l61/s7/seq1 , am1_l61/s7/seq2 , am1_l61/s7/seq3 , am1_l61/s7/seq4 , am1_l61/s7/seq5 | `47363867` |
| 11 | am1_l62 | CH-选项数 | 选项数=6(非4) \| "Some things never change." 的意思是： | `bc727fc4` |
| 11 | am1_l62 | 查重 | 题干/原句重复×2: "i want a car ___ is cheap and safe." @ am1_l62/s5/seq1 , am1_l62/s10/seq1 | `2b73232e` |
| 11 | am1_l62 | 查重 | 题干/原句重复×2: "this is the book ___ was famous in the 1960s." @ am1_l62/s5/seq2 , am1_l62/s10/seq2 | `3a8783b0` |
| 11 | am1_l62 | 查重 | 题干/原句重复×2: "this is a lamp. it matches my desk.（用 that 合成" @ am1_l62/s5/seq3 , am1_l62/s10/seq5 | `1335e15f` |
| 11 | am1_l62 | 查重 | 题干/原句重复×2: "i found a box. it is full of books.（用 which 合" @ am1_l62/s5/seq4 , am1_l62/s10/seq6 | `6b10da42` |
| 11 | am1_l62 | 查重 | 题干/原句重复×2: "which / that 用来修饰：" @ am1_l62/s5/seq5 , am1_l62/s10/seq3 | `8be57e29` |
| 11 | am1_l62 | 查重 | 题干/原句重复×2: "she's the writer ___ wrote this book.（人！）" @ am1_l62/s5/seq6 , am1_l62/s10/seq4 | `6b0ad4ae` |
| 11 | am1_l62 | 查重 | 题干/原句重复×5: "jake: a market ___1___ sells everything! sara" @ am1_l62/s7/seq1 , am1_l62/s7/seq2 , am1_l62/s7/seq3 , am1_l62/s7/seq4 , am1_l62/s7/seq5 | `945fa93d` |
| 11 | am1_l63 | 查重 | 题干/原句重复×2: "you ___ to mow the lawn. it's the rule." @ am1_l63/s5/seq1 , am1_l63/s10/seq1 | `af205a93` |
| 11 | am1_l63 | 查重 | 题干/原句重复×2: "he ___ to hire somebody." @ am1_l63/s5/seq2 , am1_l63/s10/seq2 | `152b62a3` |
| 11 | am1_l63 | 查重 | 题干/原句重复×2: "i mow the lawn every week.（用 have to 表规定）" @ am1_l63/s5/seq4 , am1_l63/s10/seq5 | `e72148d4` |
| 11 | am1_l63 | 查重 | 题干/原句重复×2: "you ___ have to come. it's your choice.（不必）" @ am1_l63/s5/seq5 , am1_l63/s10/seq3 | `613b1d84` |
| 11 | am1_l63 | 查重 | 题干/原句重复×3: "don't have to 表示：" @ am1_l63/s5/seq6 , am1_l63/s5/seq14 , am1_l63/s10/seq4 | `38532b07` |
| 11 | am1_l63 | 查重 | 题干/原句重复×2: "you must put the trash cans away.（改为 have to）" @ am1_l63/s5/seq8 , am1_l63/s10/seq7 | `60ee21a5` |
| 11 | am1_l63 | 查重 | 题干/原句重复×5: "carlos: you ___1___ to mow your lawn every tw" @ am1_l63/s7/seq1 , am1_l63/s7/seq2 , am1_l63/s7/seq3 , am1_l63/s7/seq4 , am1_l63/s7/seq5 | `c0bd8cb1` |
| 11 | am1_l64 | 查重 | 题干/原句重复×2: "three laptops? he ___ be a programmer!" @ am1_l64/s5/seq1 , am1_l64/s10/seq1 | `459cf95d` |
| 11 | am1_l64 | 查重 | 题干/原句重复×2: "she ___ be tired. that's her third coffee." @ am1_l64/s5/seq2 , am1_l64/s10/seq2 | `e35defca` |
| 11 | am1_l64 | 查重 | 题干/原句重复×2: "he must be ___ for someone." @ am1_l64/s5/seq3 , am1_l64/s10/seq3 | `fe235ab4` |
| 11 | am1_l64 | 查重 | 题干/原句重复×2: "i think he is a student. i'm 90% sure.（用 must" @ am1_l64/s5/seq4 , am1_l64/s10/seq5 | `b8ebf6fd` |
| 11 | am1_l64 | 查重 | 题干/原句重复×2: "they are waiting for the bus. i'm sure.（用 mus" @ am1_l64/s5/seq5 , am1_l64/s10/seq7 | `fb06e505` |
| 11 | am1_l64 | 查重 | 题干/原句重复×2: ""he must be a spy" 里 must 表示：" @ am1_l64/s5/seq6 , am1_l64/s10/seq4 | `18b07983` |
| 11 | am1_l64 | 查重 | 题干/原句重复×2: "she is probably very nervous.（用 must be 改写）" @ am1_l64/s5/seq8 , am1_l64/s10/seq6 | `b7c9fb7d` |
| 11 | am1_l64 | 查重 | 题干/原句重复×5: "rosa: he ___1___ be a programmer. rosa: she m" @ am1_l64/s7/seq1 , am1_l64/s7/seq2 , am1_l64/s7/seq3 , am1_l64/s7/seq4 , am1_l64/s7/seq5 | `c9c99e30` |
| 11 | am1_l65 | 查重 | 题干/原句重复×2: "seventy-five? that ___ be right! i was going " @ am1_l65/s5/seq1 , am1_l65/s10/seq1 | `4ad219dc` |
| 11 | am1_l65 | 查重 | 题干/原句重复×3: "can't be 表示：" @ am1_l65/s5/seq2 , am1_l65/s5/seq10 , am1_l65/s10/seq3 | `b6f552a1` |
| 11 | am1_l65 | 查重 | 题干/原句重复×2: "that is not right. i'm sure.（用 can't be 改写）" @ am1_l65/s5/seq3 , am1_l65/s10/seq5 | `98a07269` |
| 11 | am1_l65 | 查重 | 题干/原句重复×2: "she isn't home. i'm sure of it.（用 can't be 改写" @ am1_l65/s5/seq4 , am1_l65/s10/seq7 | `9fcda9f1` |
| 11 | am1_l65 | 查重 | 题干/原句重复×2: "there ___ be a mistake." @ am1_l65/s5/seq5 , am1_l65/s10/seq2 | `473dc5bb` |
| 11 | am1_l65 | 查重 | 题干/原句重复×2: "catch 的过去式：" @ am1_l65/s5/seq7 , am1_l65/s10/seq4 | `4bb5c887` |
| 11 | am1_l65 | 查重 | 题干/原句重复×2: "he is the driver. i'm 100% sure.（用 must be 改写" @ am1_l65/s5/seq8 , am1_l65/s10/seq6 | `869d9e78` |
| 11 | am1_l65 | 查重 | 题干/原句重复×5: "victor: that ___1___ be right! victor: there " @ am1_l65/s7/seq1 , am1_l65/s7/seq2 , am1_l65/s7/seq3 , am1_l65/s7/seq4 , am1_l65/s7/seq5 | `f53a6961` |
| 11 | am1_l66 | C7-未匹配原句 | 空4填"may"后无逐字匹配(疑精简/改写/错词): "my sister ___4___ come too." | `aa6f06c4` |
| 11 | am1_l66 | C7-未匹配原句 | 空5填"merrier"后无逐字匹配(疑精简/改写/错词): "the more, the ___5___!" | `8eb11d04` |
| 11 | am1_l66 | 查重 | 题干/原句重复×2: "it ___ rain tomorrow. take an umbrella." @ am1_l66/s5/seq1 , am1_l66/s10/seq1 | `a8443aef` |
| 11 | am1_l66 | 查重 | 题干/原句重复×2: "she may ___ to the picnic." @ am1_l66/s5/seq2 , am1_l66/s10/seq2 | `2ad093ca` |
| 11 | am1_l66 | 查重 | 题干/原句重复×2: "may / might 表示：" @ am1_l66/s5/seq3 , am1_l66/s10/seq3 | `7e348efd` |
| 11 | am1_l66 | 查重 | 题干/原句重复×2: "maybe it will rain.（用 might 改写）" @ am1_l66/s5/seq4 , am1_l66/s10/seq5 | `095727bf` |
| 11 | am1_l66 | 查重 | 题干/原句重复×2: "it might rain.（变否定：可能不下）" @ am1_l66/s5/seq5 , am1_l66/s10/seq7 | `b3029c45` |
| 11 | am1_l66 | 查重 | 题干/原句重复×2: ""一定是"用：" @ am1_l66/s5/seq6 , am1_l66/s10/seq4 | `98a87c0b` |
| 11 | am1_l66 | 查重 | 题干/原句重复×2: "maybe she will come.（用 may 改写）" @ am1_l66/s5/seq8 , am1_l66/s10/seq6 | `5f7ff77b` |
| 11 | am1_l66 | 查重 | 题干/原句重复×5: "wendy: the weather app says it ___1___ rain. " @ am1_l66/s7/seq1 , am1_l66/s7/seq2 , am1_l66/s7/seq3 , am1_l66/s7/seq4 , am1_l66/s7/seq5 | `542fd78e` |
| 12 | am1_l67 | CH-选项数 | 选项数=6(非4) \| field trip 是： | `bccd1e77` |
| 12 | am1_l67 | 查重 | 题干/原句重复×2: "he ___ that he was tired." @ am1_l67/s5/seq1 , am1_l67/s10/seq1 | `51dbc686` |
| 12 | am1_l67 | 查重 | 题干/原句重复×2: "she said ___ she might come." @ am1_l67/s5/seq2 , am1_l67/s10/seq2 | `c5012ca4` |
| 12 | am1_l67 | 查重 | 题干/原句重复×2: "say 的过去式：" @ am1_l67/s5/seq3 , am1_l67/s10/seq3 | `952c8743` |
| 12 | am1_l67 | 查重 | 题干/原句重复×2: ""i am happy."（tom 说的，转述）" @ am1_l67/s5/seq4 , am1_l67/s10/seq5 | `d9069616` |
| 12 | am1_l67 | 查重 | 题干/原句重复×2: "原话 "i want pizza." 转述为：he said ___ wanted piz" @ am1_l67/s5/seq5 , am1_l67/s10/seq4 | `1b6594cf` |
| 12 | am1_l67 | 查重 | 题干/原句重复×2: ""twenty years is enough."（他说的，转述）" @ am1_l67/s5/seq7 , am1_l67/s10/seq6 | `1735b050` |
| 12 | am1_l67 | 查重 | 题干/原句重复×2: "she says she wants coffee.（改为过去转述）" @ am1_l67/s5/seq8 , am1_l67/s10/seq7 | `fe253e2c` |
| 12 | am1_l67 | 查重 | 题干/原句重复×5: "ken: marcus cole is ___1___! ken: he ___2___ " @ am1_l67/s7/seq1 , am1_l67/s7/seq2 , am1_l67/s7/seq3 , am1_l67/s7/seq4 , am1_l67/s7/seq5 | `82b2a09e` |
| 12 | am1_l68 | C7-未匹配原句 | 空1填"told"后无逐字匹配(疑精简/改写/错词): "ruth ___1___ me that the bookstore is moving!" | `ce978fc0` |
| 12 | am1_l68 | C7-未匹配原句 | 空4填"everybody"后无逐字匹配(疑精简/改写/错词): "jonas told ___4___ that he will bring pizza." | `31b0175b` |
| 12 | am1_l68 | CH-选项数 | 选项数=6(非4) \| "That's huge." 的意思是： | `2211d572` |
| 12 | am1_l68 | 查重 | 题干/原句重复×2: "she ___ me that the party is saturday." @ am1_l68/s5/seq1 , am1_l68/s10/seq1 | `d8596ca3` |
| 12 | am1_l68 | 查重 | 题干/原句重复×2: "tell 的过去式：" @ am1_l68/s5/seq2 , am1_l68/s10/seq4 | `688967f9` |
| 12 | am1_l68 | 查重 | 题干/原句重复×2: ""the party is at the trail."（carlos 对我说的，用 to" @ am1_l68/s5/seq4 , am1_l68/s10/seq5 | `cc2c3ccf` |
| 12 | am1_l68 | 查重 | 题干/原句重复×2: "he ___ that he was tired.（不接人）" @ am1_l68/s5/seq5 , am1_l68/s10/seq2 | `ba33b7d2` |
| 12 | am1_l68 | 查重 | 题干/原句重复×2: "tell 后面必须接：" @ am1_l68/s5/seq6 , am1_l68/s10/seq3 | `b6e4ac79` |
| 12 | am1_l68 | 查重 | 题干/原句重复×2: "he said me that he was busy.（改正错误）" @ am1_l68/s5/seq7 , am1_l68/s10/seq6 | `e3e5b7f0` |
| 12 | am1_l68 | 查重 | 题干/原句重复×2: "she told that she was happy.（改正错误：补上人）" @ am1_l68/s5/seq8 , am1_l68/s10/seq7 | `239ad1c7` |
| 12 | am1_l68 | 查重 | 题干/原句重复×5: "priya: ruth ___1___ me that the bookstore is " @ am1_l68/s7/seq1 , am1_l68/s7/seq2 , am1_l68/s7/seq3 , am1_l68/s7/seq4 , am1_l68/s7/seq5 | `ce978fc0` |
| 12 | am1_l69 | CH-选项数 | 选项数=6(非4) \| fifty-fifty 的意思是： | `78c331fd` |
| 12 | am1_l69 | 查重 | 题干/原句重复×2: "if it rains, we ___ stay home." @ am1_l69/s5/seq1 , am1_l69/s10/seq1 | `9ac4d37d` |
| 12 | am1_l69 | 查重 | 题干/原句重复×2: "___ will you do if you win?" @ am1_l69/s5/seq2 , am1_l69/s10/seq4 | `b7738f14` |
| 12 | am1_l69 | 查重 | 题干/原句重复×2: "if 从句中用：" @ am1_l69/s5/seq6 , am1_l69/s10/seq3 | `c4f99e1c` |
| 12 | am1_l69 | 查重 | 题干/原句重复×2: "if i will win, i'll quit my job.（改正错误）" @ am1_l69/s5/seq8 , am1_l69/s10/seq7 | `227926fa` |
| 12 | am1_l69 | 查重 | 题干/原句重复×5: "zoe: if we ___1___, we'll split it fifty-fift" @ am1_l69/s7/seq1 , am1_l69/s7/seq2 , am1_l69/s7/seq3 , am1_l69/s7/seq4 , am1_l69/s7/seq5 | `3364924a` |
| 12 | am1_l70 | C7-未匹配原句 | 空1填"like"后无逐字匹配(疑精简/改写/错词): "i'd ___1___ a large pepperoni pizza." | `e783ab93` |
| 12 | am1_l70 | 查重 | 题干/原句重复×2: "sorry, you have the ___ number." @ am1_l70/s5/seq1 , am1_l70/s10/seq1 | `3f7cc124` |
| 12 | am1_l70 | 查重 | 题干/原句重复×2: "___ like a large pizza, please." @ am1_l70/s5/seq2 , am1_l70/s10/seq2 | `9468261a` |
| 12 | am1_l70 | 查重 | 题干/原句重复×2: "two years ___（两年前）" @ am1_l70/s5/seq3 , am1_l70/s10/seq4 | `eea2427b` |
| 12 | am1_l70 | 查重 | 题干/原句重复×2: "i want a large pizza.（改为更礼貌的 i'd like）" @ am1_l70/s5/seq4 , am1_l70/s10/seq5 | `380b2aea` |
| 12 | am1_l70 | 查重 | 题干/原句重复×2: "you called the wrong number.（道歉场景改第一人称：我打错了）" @ am1_l70/s5/seq5 , am1_l70/s10/seq7 | `66735ddc` |
| 12 | am1_l70 | 查重 | 题干/原句重复×2: "i'll tell him ___ you're coming." @ am1_l70/s5/seq6 , am1_l70/s10/seq3 | `651266dc` |
| 12 | am1_l70 | 查重 | 题干/原句重复×2: "tell dr. kim: "she is coming."（用 tell...that " @ am1_l70/s5/seq8 , am1_l70/s10/seq6 | `cf1a9ab5` |
| 12 | am1_l70 | 查重 | 题干/原句重复×2: "打错电话道歉说：" @ am1_l70/s5/seq11 , am1_l70/s6/seq1 | `96dc7395` |
| 12 | am1_l70 | 查重 | 题干/原句重复×5: "bella: i'd ___1___ a large pepperoni pizza. b" @ am1_l70/s7/seq1 , am1_l70/s7/seq2 , am1_l70/s7/seq3 , am1_l70/s7/seq4 , am1_l70/s7/seq5 | `e783ab93` |
| 12 | am1_l71 | C7-未匹配原句 | 空5填"go"后无逐字匹配(疑精简/改写/错词): "first flight, here we ___5___!" | `86fb3e7a` |
| 12 | am1_l71 | 查重 | 题干/原句重复×2: "before 2020, i ___ never been to texas." @ am1_l71/s5/seq1 , am1_l71/s10/seq1 | `5d81c42e` |
| 12 | am1_l71 | 查重 | 题干/原句重复×3: "fly 的过去分词：" @ am1_l71/s5/seq2 , am1_l71/s5/seq14 , am1_l71/s10/seq3 | `d912737d` |
| 12 | am1_l71 | 查重 | 题干/原句重复×2: "过去完成时表示：" @ am1_l71/s5/seq3 , am1_l71/s10/seq4 | `a17708ca` |
| 12 | am1_l71 | 查重 | 题干/原句重复×2: "i never flew before that day.（用 had 改写）" @ am1_l71/s5/seq4 , am1_l71/s10/seq5 | `7401668d` |
| 12 | am1_l71 | 查重 | 题干/原句重复×2: "she visited five countries before she was thi" @ am1_l71/s5/seq5 , am1_l71/s10/seq6 | `bce777e9` |
| 12 | am1_l71 | 查重 | 题干/原句重复×2: "by the time i arrived, the movie ___ started." @ am1_l71/s5/seq6 , am1_l71/s10/seq2 | `76b46c95` |
| 12 | am1_l71 | 查重 | 题干/原句重复×2: "when i came home, the party already started.（" @ am1_l71/s5/seq8 , am1_l71/s10/seq7 | `4964e29a` |
| 12 | am1_l71 | 查重 | 题干/原句重复×5: "hailey: before today, i had never ___1___ on " @ am1_l71/s7/seq1 , am1_l71/s7/seq2 , am1_l71/s7/seq3 , am1_l71/s7/seq4 , am1_l71/s7/seq5 | `b5841daa` |
| 12 | am1_l72 | C7-未匹配原句 | 空2填"had"后无逐字匹配(疑精简/改写/错词): "carlos and megan ___2___ planned the day for months." | `15d932b2` |
| 12 | am1_l72 | C7-未匹配原句 | 空4填"stays"后无逐字匹配(疑精简/改写/错词): ""if the weather ___4___ nice, we'll do this every month" | `0bed6964` |
| 12 | am1_l72 | C7-未匹配原句 | 空5填"looked"后无逐字匹配(疑精简/改写/错词): ""if the weather ___4___ nice, we'll do this every month" | `dc7e0ef7` |
| 12 | am1_l72 | 查重 | 题干/原句重复×2: "they ___ planned the day for months before th" @ am1_l72/s5/seq1 , am1_l72/s10/seq2 | `722c316c` |
| 12 | am1_l72 | 查重 | 题干/原句重复×2: "the town never looked better before that day." @ am1_l72/s5/seq4 , am1_l72/s10/seq6 | `9885c113` |
| 12 | am1_l72 | 查重 | 题干/原句重复×2: "everybody ___ lived in town came." @ am1_l72/s5/seq5 , am1_l72/s10/seq1 | `6056a27e` |
| 12 | am1_l72 | 查重 | 题干/原句重复×2: "he said to everybody: "my car didn't start."（" @ am1_l72/s5/seq7 , am1_l72/s10/seq5 | `2e5d86f9` |
| 12 | am1_l72 | 查重 | 题干/原句重复×2: "she is a runner. she has run three 5ks.（用 who" @ am1_l72/s5/seq8 , am1_l72/s10/seq7 | `e331a9b6` |
| 12 | am1_l72 | 查重 | 题干/原句重复×5: "everybody ___1___ lived in town came to the p" @ am1_l72/s7/seq1 , am1_l72/s7/seq2 , am1_l72/s7/seq3 , am1_l72/s7/seq4 , am1_l72/s7/seq5 | `2d7f4e32` |

## ⚪ flag(信息级)（1184）

| 单元 | 课 | code | 说明 | qid |
|---|---|---|---|---|
| 1 | am1_l01 | 超纲 | 疑超纲实词: umbrella \| stage5 | `1c1fc606` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: seat \| stage5 | `ec3a0d32` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: coffee \| stage5 | `c4989d85` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: backpack \| stage5 | `a534239e` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: car \| stage5 | `d60ceca8` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: wallet \| stage5 | `c7d25e37` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: sorry \| stage5 | `c7b76c47` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: bad \| stage5 | `88dd4d53` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: seat \| stage5 | `2d173fb8` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: cup \| stage5 | `cabcdbdf` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: seat \| stage5 | `4b0ba325` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: bag \| stage5 | `a5c24b5d` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: coffee \| stage5 | `2cda5341` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: pen \| stage5 | `644e9f60` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: jacket \| stage5 | `e4403e23` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: hand, telephone, set, mobile, cell \| stage6 | `2d01b195` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: bad \| stage6 | `f70a2d8c` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: lady, mister, boy \| stage6 | `4f658514` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: sorry \| stage7 | `f3aaffbd` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: table, desk, floor \| stage7 | `f80899ee` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: lot, many \| stage7 | `ee4c3386` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: lifetime, lifeboat, lifeguard \| stage7 | `5b1cf3ab` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: matter, question \| stage7 | `f877bd8b` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: day \| stage7 | `eab36145` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: floor, table, bag \| stage8 | `5f7991a6` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: store's \| stage8 | `1fd862a9` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: say \| stage8 | `daf8d18c` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: welcome \| stage9 | `8221e30a` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: backpack \| stage10 | `5b0790f5` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: coffee \| stage10 | `bef18d9a` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: seat, taken, sorry \| stage10 | `1ffaa5c8` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: umbrella \| stage10 | `faf90274` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: wallet \| stage10 | `3c40bb20` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: car \| stage10 | `fbd59679` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: key \| stage10 | `2584e76c` |
| 1 | am1_l01 | 超纲 | 疑超纲实词: bag \| stage10 | `68a0d8df` |
| 1 | am1_l01 | transform风险 | 缩写: "No, it isn't." | `aab76177` |
| 1 | am1_l02 | 超纲 | 疑超纲实词: coffee \| stage5 | `dec3f87d` |
| 1 | am1_l02 | 超纲 | 疑超纲实词: gloves \| stage5 | `dc217915` |
| 1 | am1_l02 | 超纲 | 疑超纲实词: key \| stage5 | `b4ad4ef9` |
| 1 | am1_l02 | 超纲 | 疑超纲实词: coffee \| stage5 | `0de74930` |
| 1 | am1_l02 | 超纲 | 疑超纲实词: bags \| stage5 | `a8fc6b21` |
| 1 | am1_l02 | 超纲 | 疑超纲实词: bag, bags \| stage5 | `a8f178f0` |
| 1 | am1_l02 | 超纲 | 疑超纲实词: grei, grey, graey \| stage6 | `e03c6a08` |
| 1 | am1_l02 | 超纲 | 疑超纲实词: park, service, bus, parking, valet, self \| stage6 | `f50e1bbe` |
| 1 | am1_l02 | 超纲 | 疑超纲实词: morning \| stage6 | `6d576688` |
| 1 | am1_l02 | 超纲 | 疑超纲实词: minute, time, clock, watch \| stage7 | `6328e20a` |
| 1 | am1_l02 | 超纲 | 疑超纲实词: day, noon, clock \| stage7 | `b2bcc70d` |
| 1 | am1_l02 | 超纲 | 疑超纲实词: black, green \| stage7 | `0342b697` |
| 1 | am1_l02 | 超纲 | 疑超纲实词: key, cup \| stage7 | `b5f76d82` |
| 1 | am1_l02 | 超纲 | 疑超纲实词: clock, noon \| stage7 | `891d5f8f` |
| 1 | am1_l02 | 超纲 | 疑超纲实词: airport, coffee, shop, school \| stage8 | `36203ea1` |
| 1 | am1_l02 | 超纲 | 疑超纲实词: know \| stage8 | `d24c965f` |
| 1 | am1_l02 | 超纲 | 疑超纲实词: give, end \| stage8 | `636c7e71` |
| 1 | am1_l02 | 超纲 | 疑超纲实词: file \| stage9 | `208c1a7b` |
| 1 | am1_l02 | 超纲 | 疑超纲实词: key \| stage10 | `6dd4cd30` |
| 1 | am1_l02 | 超纲 | 疑超纲实词: wait, time, minute, clock \| stage10 | `ae3b49d7` |
| 1 | am1_l02 | 超纲 | 疑超纲实词: key \| stage10 | `4ecb02d3` |
| 1 | am1_l02 | transform风险 | 缩写: "Here's my ticket." | `866c4527` |
| 1 | am1_l02 | transform风险 | 缩写: "I'm sorry, sir." | `f85db947` |
| 1 | am1_l02 | transform风险 | 缩写: "Here's your key." | `4ecb02d3` |
| 1 | am1_l03 | 超纲 | 疑超纲实词: apple \| stage5 | `5b8102df` |
| 1 | am1_l03 | 超纲 | 疑超纲实词: need, umbrella \| stage5 | `c599587a` |
| 1 | am1_l03 | 超纲 | 疑超纲实词: man \| stage5 | `166d2143` |
| 1 | am1_l03 | 超纲 | 疑超纲实词: tea, work, class \| stage6 | `02f54f05` |
| 1 | am1_l03 | 超纲 | 疑超纲实词: high, primary, secondary \| stage6 | `89966a91` |
| 1 | am1_l03 | 超纲 | 疑超纲实词: care \| stage6 | `da224fee` |
| 1 | am1_l03 | 超纲 | 疑超纲实词: nabourhood, neighbourhood, neighborhod \| stage6 | `f7e7d144` |
| 1 | am1_l03 | 超纲 | 疑超纲实词: see, look \| stage7 | `7a05be36` |
| 1 | am1_l03 | 超纲 | 疑超纲实词: old \| stage7 | `c15c2f9d` |
| 1 | am1_l03 | 超纲 | 疑超纲实词: house \| stage7 | `14dc71cd` |
| 1 | am1_l03 | 超纲 | 疑超纲实词: job, nurse, student \| stage8 | `3c6a894f` |
| 1 | am1_l03 | 超纲 | 疑超纲实词: coworker \| stage9 | `0e657fb6` |
| 1 | am1_l03 | 超纲 | 疑超纲实词: look, see \| stage10 | `8224f2d9` |
| 1 | am1_l03 | transform风险 | 缩写: "I'm Mexican." | `ae7135b7` |
| 1 | am1_l04 | 超纲 | 疑超纲实词: amn't \| stage5 | `0bb57633` |
| 1 | am1_l04 | 超纲 | 疑超纲实词: fine \| stage5 | `7cefe8fd` |
| 1 | am1_l04 | 超纲 | 疑超纲实词: amn't \| stage5 | `b7be6d10` |
| 1 | am1_l04 | 超纲 | 疑超纲实词: work \| stage6 | `05dde83f` |
| 1 | am1_l04 | 超纲 | 疑超纲实词: community, college, driving, kindergarten \| stage6 | `5ee39764` |
| 1 | am1_l04 | 超纲 | 疑超纲实词: home, class \| stage7 | `3dc77f29` |
| 1 | am1_l04 | 超纲 | 疑超纲实词: hospital, class \| stage8 | `9b53e8c8` |
| 1 | am1_l04 | 超纲 | 疑超纲实词: know \| stage8 | `55167990` |
| 1 | am1_l04 | 超纲 | 疑超纲实词: firefighter \| stage9 | `e2decbf8` |
| 1 | am1_l04 | 超纲 | 疑超纲实词: fine \| stage10 | `011cb256` |
| 1 | am1_l04 | 超纲 | 疑超纲实词: amn't \| stage10 | `36fd54ee` |
| 1 | am1_l04 | transform风险 | 缩写: "I'm not a driver." | `4437b8b8` |
| 1 | am1_l04 | transform风险 | 缩写: "I'm not a plumber." | `58331453` |
| 1 | am1_l05 | 超纲 | 疑超纲实词: husband \| stage5 | `8bd7e683` |
| 1 | am1_l05 | 超纲 | 疑超纲实词: tired, tireds \| stage5 | `9c3ff073` |
| 1 | am1_l05 | 超纲 | 疑超纲实词: tires, tired, tiredly \| stage5 | `2ffa9c55` |
| 1 | am1_l05 | 超纲 | 疑超纲实词: many \| stage7 | `557c52d6` |
| 1 | am1_l05 | 超纲 | 疑超纲实词: mug \| stage7 | `be80f1a2` |
| 1 | am1_l05 | 超纲 | 疑超纲实词: helper, hand \| stage7 | `b7ff159b` |
| 1 | am1_l05 | 超纲 | 疑超纲实词: late, soon \| stage7 | `9555a68e` |
| 1 | am1_l05 | 超纲 | 疑超纲实词: noon \| stage8 | `8cc31619` |
| 1 | am1_l05 | 超纲 | 疑超纲实词: son, daughter \| stage9 | `aa28520c` |
| 1 | am1_l05 | 超纲 | 疑超纲实词: husband \| stage10 | `938fd3e1` |
| 1 | am1_l05 | 超纲 | 疑超纲实词: tired \| stage10 | `adbcb4a5` |
| 1 | am1_l05 | 超纲 | 疑超纲实词: late, after \| stage10 | `1a2476a5` |
| 1 | am1_l05 | transform风险 | 缩写: "I'm pretty good." | `ce354148` |
| 1 | am1_l05 | transform风险 | 缩写: "He's tired." | `adbcb4a5` |
| 1 | am1_l05 | transform风险 | 缩写: "I'm great, thanks." | `ce484e43` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: backpack \| stage5 | `304d0066` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: desk \| stage5 | `bfa28346` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: jacket \| stage5 | `4f296358` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: brother \| stage5 | `07e165a0` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: sister \| stage5 | `83e3e275` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: Amanda \| stage5 | `681e815d` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: desk \| stage5 | `bf473551` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: sister, sister's, sisters \| stage5 | `91ef2ad4` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: sister \| stage5 | `5e7ae310` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: jacket \| stage5 | `1b3aeb7d` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: wrong \| stage6 | `277490eb` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: break, room, tea, house, rest, home, staff \| stage6 | `dabff9ac` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: bike, pillow \| stage6 | `33f10bdc` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: box \| stage7 | `d21042fc` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: desk, key \| stage7 | `253715c3` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: give, buy \| stage7 | `4a78245d` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: desk, bag \| stage8 | `7325c394` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: color \| stage8 | `371cb402` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: ask \| stage8 | `7bdf5af8` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: glasses \| stage9 | `3794ddfe` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: pen \| stage9 | `6fe49017` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: desk \| stage10 | `d3d4943d` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: sister \| stage10 | `37bebda0` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: this're \| stage10 | `e365c281` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: bag \| stage10 | `722d0694` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: jacket \| stage10 | `8b90d765` |
| 1 | am1_l06 | 超纲 | 疑超纲实词: brother \| stage10 | `0c0c316f` |
| 1 | am1_l06 | transform风险 | 缩写: "This is Chris's jacket." | `1b3aeb7d` |
| 1 | am1_l06 | transform风险 | 缩写: "This is Jake's bag." | `722d0694` |
| 1 | am1_l06 | transform风险 | 可省that: "Is that his jacket?" | `8b90d765` |
| 1 | am1_l06 | transform风险 | 可省that: "Is that her mug?" | `5fa4932e` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: sky \| stage5 | `0aa31eb1` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: white \| stage5 | `59247cdd` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: yellow \| stage5 | `f06a5f22` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: Look, red \| stage5 | `93095de9` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: dress \| stage5 | `2eac1d45` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: jacket, matter \| stage5 | `f05102f0` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: purple \| stage5 | `1237067f` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: big \| stage5 | `f8919e07` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: cup \| stage5 | `5ba5d8d1` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: want \| stage5 | `1f21d59d` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: cup \| stage5 | `847499fc` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: culor, collor, colour \| stage6 | `9e38fe3a` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: favrite, favorit, favourite \| stage6 | `8607ffec` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: buck \| stage6 | `ab3fe01d` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: brilliant \| stage6 | `1e0693d7` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: big \| stage7 | `9dc27a38` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: mid, media \| stage7 | `8ad4f67d` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: shop, sell \| stage7 | `5713e61d` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: library \| stage8 | `eaa0b98b` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: want, extra, large \| stage8 | `721d2281` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: backpack \| stage9 | `dc1ae4a9` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: hat \| stage9 | `c873ee85` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: white \| stage10 | `36a336d1` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: red \| stage10 | `a0f2cbac` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: red \| stage10 | `d9b59277` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: want, media \| stage10 | `09d67db6` |
| 2 | am1_l07 | 超纲 | 疑超纲实词: bag \| stage10 | `a44f24ed` |
| 2 | am1_l07 | transform风险 | 可省that: "What color is that cup?" | `5ba5d8d1` |
| 2 | am1_l07 | transform风险 | 缩写: "It's a small." | `02dc0aa1` |
| 2 | am1_l08 | 超纲 | 疑超纲实词: gift, giftes, gifts \| stage5 | `47a01503` |
| 2 | am1_l08 | 超纲 | 疑超纲实词: chocolate, chocolates \| stage5 | `74c25b69` |
| 2 | am1_l08 | 超纲 | 疑超纲实词: suitcases \| stage5 | `32067026` |
| 2 | am1_l08 | 超纲 | 疑超纲实词: passports \| stage5 | `fb6b060c` |
| 2 | am1_l08 | 超纲 | 疑超纲实词: bags \| stage5 | `fbd95009` |
| 2 | am1_l08 | 超纲 | 疑超纲实词: gifts \| stage5 | `859beea9` |
| 2 | am1_l08 | 超纲 | 疑超纲实词: boxies, box's \| stage5 | `39d920ee` |
| 2 | am1_l08 | 超纲 | 疑超纲实词: book, bookes \| stage5 | `bd6da41e` |
| 2 | am1_l08 | 超纲 | 疑超纲实词: trunk, track, lorry \| stage6 | `e75763ee` |
| 2 | am1_l08 | 超纲 | 疑超纲实词: cake, soup, turkey \| stage6 | `226a2b49` |
| 2 | am1_l08 | 超纲 | 疑超纲实词: bookfish, booksnake, bookbird \| stage6 | `56b16544` |
| 2 | am1_l08 | 超纲 | 疑超纲实词: light, big \| stage7 | `b198047f` |
| 2 | am1_l08 | 超纲 | 疑超纲实词: booker, bookman, bookcase \| stage7 | `e0047c61` |
| 2 | am1_l08 | 超纲 | 疑超纲实词: old, big, late \| stage7 | `957a1cd1` |
| 2 | am1_l08 | 超纲 | 疑超纲实词: far, fully, fun \| stage7 | `604b078d` |
| 2 | am1_l08 | 超纲 | 疑超纲实词: know \| stage8 | `5c6f2d66` |
| 2 | am1_l08 | 超纲 | 疑超纲实词: dollar's \| stage10 | `82383e5f` |
| 2 | am1_l09 | 超纲 | 疑超纲实词: uncle \| stage5 | `ceed5734` |
| 2 | am1_l09 | 超纲 | 疑超纲实词: tired \| stage5 | `1dc3228c` |
| 2 | am1_l09 | 超纲 | 疑超纲实词: nurser \| stage5 | `ba591000` |
| 2 | am1_l09 | 超纲 | 疑超纲实词: peoples, mans \| stage6 | `abe5b85c` |
| 2 | am1_l09 | 超纲 | 疑超纲实词: cheerio, brilliant, lovely \| stage6 | `62ddd1e4` |
| 2 | am1_l09 | 超纲 | 疑超纲实词: cookers \| stage7 | `067e01c1` |
| 2 | am1_l09 | 超纲 | 疑超纲实词: home, class \| stage7 | `913e4ad9` |
| 2 | am1_l09 | 超纲 | 疑超纲实词: house \| stage7 | `364d803d` |
| 2 | am1_l09 | 超纲 | 疑超纲实词: hungry, tired \| stage7 | `e11c04e4` |
| 2 | am1_l09 | 超纲 | 疑超纲实词: holiday \| stage8 | `0bcec172` |
| 2 | am1_l09 | 超纲 | 疑超纲实词: know \| stage8 | `96c10c68` |
| 2 | am1_l10 | 超纲 | 疑超纲实词: many, such \| stage5 | `4aca77c1` |
| 2 | am1_l10 | 超纲 | 疑超纲实词: many, realy \| stage5 | `34f2ae3b` |
| 2 | am1_l10 | 超纲 | 疑超纲实词: length \| stage5 | `2d8ee3f3` |
| 2 | am1_l10 | 超纲 | 疑超纲实词: petrol, oil, shop, house \| stage6 | `4b4f169a` |
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
| 2 | am1_l11 | 超纲 | 疑超纲实词: red \| stage10 | `df74457f` |
| 2 | am1_l11 | 超纲 | 疑超纲实词: pen \| stage10 | `b8d99128` |
| 2 | am1_l11 | 超纲 | 疑超纲实词: bag \| stage10 | `11d71d1c` |
| 2 | am1_l11 | transform风险 | 缩写: "Which backpack is Jake's?" | `c9482263` |
| 2 | am1_l11 | transform风险 | 缩写: "Which box is Jake's?" | `73bcaaaa` |
| 2 | am1_l11 | transform风险 | 缩写: "Which pen is Amy's?" | `b8d99128` |
| 2 | am1_l12 | 超纲 | 疑超纲实词: shoes \| stage5 | `4fb1fd64` |
| 2 | am1_l12 | 超纲 | 疑超纲实词: gloves \| stage5 | `87efc456` |
| 2 | am1_l12 | 超纲 | 疑超纲实词: key \| stage5 | `a62e3622` |
| 2 | am1_l12 | 超纲 | 疑超纲实词: gifts, bag \| stage5 | `59e7fd44` |
| 2 | am1_l12 | 超纲 | 疑超纲实词: many \| stage5 | `454884be` |
| 2 | am1_l12 | 超纲 | 疑超纲实词: like \| stage5 | `d202d0bb` |
| 2 | am1_l12 | 超纲 | 疑超纲实词: bag \| stage5 | `4262ac3b` |
| 2 | am1_l12 | 超纲 | 疑超纲实词: shades, glassy, shadows, shines \| stage6 | `44e0af7f` |
| 2 | am1_l12 | 超纲 | 疑超纲实词: actual, action \| stage7 | `fe640977` |
| 2 | am1_l12 | 超纲 | 疑超纲实词: think \| stage7 | `83c9b270` |
| 2 | am1_l12 | 超纲 | 疑超纲实词: bag \| stage8 | `6476b217` |
| 2 | am1_l12 | 超纲 | 疑超纲实词: shoes \| stage9 | `8fd0798d` |
| 2 | am1_l12 | 超纲 | 疑超纲实词: gloves \| stage10 | `7c5a485f` |
| 2 | am1_l12 | 超纲 | 疑超纲实词: bag, bags \| stage10 | `f0bbf1e9` |
| 2 | am1_l12 | 超纲 | 疑超纲实词: red, gloves \| stage10 | `00a02904` |
| 2 | am1_l12 | 超纲 | 疑超纲实词: shop, sell \| stage10 | `8ad0e4a3` |
| 3 | am1_l13 | 超纲 | 疑超纲实词: desk \| stage5 | `9feb3d0f` |
| 3 | am1_l13 | 超纲 | 疑超纲实词: bike, street \| stage5 | `f45d070d` |
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
| 3 | am1_l13 | 超纲 | 疑超纲实词: place, park, garage \| stage7 | `cce01972` |
| 3 | am1_l13 | 超纲 | 疑超纲实词: fresh \| stage7 | `005b0fe1` |
| 3 | am1_l13 | 超纲 | 疑超纲实词: movie, game \| stage7 | `1078edc5` |
| 3 | am1_l13 | 超纲 | 疑超纲实词: behind \| stage7 | `88f5ac45` |
| 3 | am1_l13 | 超纲 | 疑超纲实词: table \| stage8 | `f7b66d0d` |
| 3 | am1_l13 | 超纲 | 疑超纲实词: cup \| stage9 | `3f241dff` |
| 3 | am1_l13 | 超纲 | 疑超纲实词: room \| stage10 | `d775727f` |
| 3 | am1_l13 | 超纲 | 疑超纲实词: street \| stage10 | `876330e8` |
| 3 | am1_l13 | 超纲 | 疑超纲实词: pen \| stage10 | `13b12115` |
| 3 | am1_l13 | 超纲 | 疑超纲实词: desk \| stage10 | `fb026859` |
| 3 | am1_l13 | 超纲 | 疑超纲实词: cat \| stage10 | `6fd97e4b` |
| 3 | am1_l13 | transform风险 | 缩写: "There isn't a book on the chair." | `7afabd95` |
| 3 | am1_l13 | transform风险 | 缩写: "There isn't a pan in the cabinet." | `6192547e` |
| 3 | am1_l14 | 超纲 | 疑超纲实词: cups \| stage5 | `eef1c6f3` |
| 3 | am1_l14 | 超纲 | 疑超纲实词: house \| stage5 | `f29fac71` |
| 3 | am1_l14 | 超纲 | 疑超纲实词: cups \| stage5 | `47b2d181` |
| 3 | am1_l14 | 超纲 | 疑超纲实词: house \| stage5 | `fa1537f6` |
| 3 | am1_l14 | 超纲 | 疑超纲实词: shop \| stage6 | `463a3d21` |
| 3 | am1_l14 | 超纲 | 疑超纲实词: bucket, bicycle, basket, motorcycle \| stage6 | `55f55992` |
| 3 | am1_l14 | 超纲 | 疑超纲实词: shop \| stage7 | `b6e637e5` |
| 3 | am1_l14 | 超纲 | 疑超纲实词: shop, sell, free \| stage7 | `3ecd9c63` |
| 3 | am1_l14 | 超纲 | 疑超纲实词: planning, trip \| stage8 | `18a07e6c` |
| 3 | am1_l14 | 超纲 | 疑超纲实词: house \| stage10 | `149323f0` |
| 3 | am1_l14 | 超纲 | 疑超纲实词: cups \| stage10 | `a73e7d02` |
| 3 | am1_l14 | transform风险 | 缩写: "There aren't any tools here." | `d6c5136c` |
| 3 | am1_l14 | transform风险 | 缩写: "There aren't any paintbrushes on the table." | `5337b155` |
| 3 | am1_l14 | transform风险 | 缩写: "The bikes aren't behind the table." | `c4a70c31` |
| 3 | am1_l14 | transform风险 | 缩写: "any）→ There aren't any cups on the table." | `a73e7d02` |
| 3 | am1_l15 | 超纲 | 疑超纲实词: pie \| stage5 | `ec45a5e9` |
| 3 | am1_l15 | 超纲 | 疑超纲实词: ing \| stage5 | `90c73e7c` |
| 3 | am1_l15 | 超纲 | 疑超纲实词: cold \| stage5 | `1d2bff41` |
| 3 | am1_l15 | 超纲 | 疑超纲实词: candy, biscuit, bread \| stage6 | `64c6de72` |
| 3 | am1_l15 | 超纲 | 疑超纲实词: park, plate \| stage7 | `781e6414` |
| 3 | am1_l15 | 超纲 | 疑超纲实词: cold, sweet \| stage7 | `ea607459` |
| 3 | am1_l15 | 超纲 | 疑超纲实词: cold \| stage7 | `30ae28b6` |
| 3 | am1_l15 | 超纲 | 疑超纲实词: sunny, charming \| stage7 | `d8265d6c` |
| 3 | am1_l15 | 超纲 | 疑超纲实词: last \| stage7 | `15e190b5` |
| 3 | am1_l15 | 超纲 | 疑超纲实词: meal \| stage7 | `4e711ba6` |
| 3 | am1_l15 | 超纲 | 疑超纲实词: shop \| stage8 | `0e149298` |
| 3 | am1_l15 | 超纲 | 疑超纲实词: cake \| stage10 | `aac2ba04` |
| 3 | am1_l16 | 超纲 | 疑超纲实词: watches \| stage5 | `64a220a4` |
| 3 | am1_l16 | 超纲 | 疑超纲实词: tall \| stage5 | `73b476cf` |
| 3 | am1_l16 | 超纲 | 疑超纲实词: ing, makking \| stage5 | `e015ba72` |
| 3 | am1_l16 | 超纲 | 疑超纲实词: ing, sitting \| stage5 | `60417d4d` |
| 3 | am1_l16 | 超纲 | 疑超纲实词: run, ing, runs, running, runned, runing \| stage5 | `35fa46b1` |
| 3 | am1_l16 | 超纲 | 疑超纲实词: watch, ing, watched, watchs, watcing \| stage5 | `132427b3` |
| 3 | am1_l16 | 超纲 | 疑超纲实词: ing, comming \| stage5 | `7c140fd1` |
| 3 | am1_l16 | 超纲 | 疑超纲实词: sweater, salty, sweaty \| stage6 | `ad1ad133` |
| 3 | am1_l16 | 超纲 | 疑超纲实词: goal \| stage6 | `e7dcdf74` |
| 3 | am1_l16 | 超纲 | 疑超纲实词: watch \| stage6 | `f1f3cafb` |
| 3 | am1_l16 | 超纲 | 疑超纲实词: watch, watches, watched \| stage7 | `90b8534f` |
| 3 | am1_l16 | 超纲 | 疑超纲实词: works, work, worked \| stage7 | `edfa0581` |
| 3 | am1_l16 | 超纲 | 疑超纲实词: sleep, sleeps, slept \| stage7 | `2d1b07b6` |
| 3 | am1_l16 | 超纲 | 疑超纲实词: gonna, getta \| stage7 | `ac8588c2` |
| 3 | am1_l16 | 超纲 | 疑超纲实词: street, house \| stage7 | `a9850dec` |
| 3 | am1_l16 | 超纲 | 疑超纲实词: selling \| stage7 | `fc4880ee` |
| 3 | am1_l16 | 超纲 | 疑超纲实词: sandwich, food \| stage8 | `f5c74169` |
| 3 | am1_l16 | 超纲 | 疑超纲实词: watch, watches \| stage10 | `53981ba6` |
| 3 | am1_l16 | 超纲 | 疑超纲实词: ing, makking \| stage10 | `d9fcd4e4` |
| 3 | am1_l16 | 超纲 | 疑超纲实词: watches \| stage10 | `0f9140ed` |
| 3 | am1_l16 | 超纲 | 疑超纲实词: sleep, ing, sleepping, slept, sleeps \| stage10 | `ea47a6f1` |
| 3 | am1_l17 | 超纲 | 疑超纲实词: sell, sold, sells \| stage5 | `4fc73cfa` |
| 3 | am1_l17 | 超纲 | 疑超纲实词: guy \| stage5 | `3b99958f` |
| 3 | am1_l17 | 超纲 | 疑超纲实词: whether \| stage5 | `9a37a0a3` |
| 3 | am1_l17 | 超纲 | 疑超纲实词: rainy, snowy, cloudy \| stage5 | `889423e3` |
| 3 | am1_l17 | 超纲 | 疑超纲实词: sell \| stage5 | `4b5f7789` |
| 3 | am1_l17 | 超纲 | 疑超纲实词: sun \| stage5 | `91b08e3a` |
| 3 | am1_l17 | 超纲 | 疑超纲实词: queue, stand \| stage6 | `7dad00c6` |
| 3 | am1_l17 | 超纲 | 疑超纲实词: meal, bus, eat \| stage6 | `f1f71e46` |
| 3 | am1_l17 | 超纲 | 疑超纲实词: kiddens, childs \| stage6 | `567ddc0b` |
| 3 | am1_l17 | 超纲 | 疑超纲实词: flies, fly, flew \| stage7 | `efbee5f1` |
| 3 | am1_l17 | 超纲 | 疑超纲实词: sell, sells, sold \| stage7 | `07d47746` |
| 3 | am1_l17 | 超纲 | 疑超纲实词: queue, road, list \| stage7 | `1215e111` |
| 3 | am1_l17 | 超纲 | 疑超纲实词: cold \| stage7 | `dfbd1d53` |
| 3 | am1_l17 | 超纲 | 疑超纲实词: soccer \| stage10 | `6d9fb87f` |
| 3 | am1_l17 | 超纲 | 疑超纲实词: whether \| stage10 | `b1bd6007` |
| 3 | am1_l17 | 超纲 | 疑超纲实词: sell, sells \| stage10 | `86480829` |
| 3 | am1_l17 | 超纲 | 疑超纲实词: guy \| stage10 | `28d550b5` |
| 3 | am1_l17 | transform风险 | 缩写: "What's the weather like?" | `2925d70a` |
| 3 | am1_l17 | transform风险 | 缩写: "What's the weather like?" | `7142fa6d` |
| 3 | am1_l18 | 超纲 | 疑超纲实词: they's \| stage5 | `64eede73` |
| 3 | am1_l18 | 超纲 | 疑超纲实词: run \| stage5 | `dac5674b` |
| 3 | am1_l18 | 超纲 | 疑超纲实词: farm, field, vegetable, mall \| stage6 | `b7f4c340` |
| 3 | am1_l18 | 超纲 | 疑超纲实词: sell, sold, sells \| stage7 | `8734852e` |
| 3 | am1_l18 | 超纲 | 疑超纲实词: plays, play, played \| stage7 | `1b98a15b` |
| 3 | am1_l18 | 超纲 | 疑超纲实词: runing, run, runs \| stage7 | `d7b858e7` |
| 3 | am1_l18 | 超纲 | 疑超纲实词: stand \| stage7 | `88af4145` |
| 3 | am1_l18 | 超纲 | 疑超纲实词: stand \| stage8 | `eb35e259` |
| 3 | am1_l18 | 超纲 | 疑超纲实词: stand \| stage10 | `7c5cab18` |
| 3 | am1_l18 | 超纲 | 疑超纲实词: run \| stage10 | `b017063c` |
| 3 | am1_l18 | 超纲 | 疑超纲实词: played, plays, play \| stage10 | `2c5aac9f` |
| 3 | am1_l18 | 超纲 | 疑超纲实词: girls \| stage10 | `ebe869d5` |
| 3 | am1_l18 | transform风险 | 缩写: "The kids aren't flying kites in the park." | `7275bf13` |
| 4 | am1_l19 | 超纲 | 疑超纲实词: gone \| stage5 | `43555edb` |
| 4 | am1_l19 | 超纲 | 疑超纲实词: made \| stage5 | `605261f7` |
| 4 | am1_l19 | 超纲 | 疑超纲实词: weekend \| stage5 | `61d69543` |
| 4 | am1_l19 | 超纲 | 疑超纲实词: ing \| stage5 | `18755241` |
| 4 | am1_l19 | 超纲 | 疑超纲实词: bubble, juice, fizzy, drink \| stage6 | `a69395ff` |
| 4 | am1_l19 | 超纲 | 疑超纲实词: foodshare, potluck, luckpot, potdish \| stage6 | `98ea9f82` |
| 4 | am1_l19 | 超纲 | 疑超纲实词: gone \| stage7 | `3dd189e8` |
| 4 | am1_l19 | 超纲 | 疑超纲实词: made \| stage7 | `fb31ae55` |
| 4 | am1_l19 | 超纲 | 疑超纲实词: brought \| stage7 | `d30a772c` |
| 4 | am1_l19 | 超纲 | 疑超纲实词: busy \| stage7 | `bead0e21` |
| 4 | am1_l19 | 超纲 | 疑超纲实词: point \| stage7 | `a7a4e2c0` |
| 4 | am1_l19 | 超纲 | 疑超纲实词: soon \| stage7 | `514bc91e` |
| 4 | am1_l19 | 超纲 | 疑超纲实词: banner \| stage8 | `1ec24eb7` |
| 4 | am1_l19 | 超纲 | 疑超纲实词: weekend \| stage9 | `d39c30fd` |
| 4 | am1_l19 | 超纲 | 疑超纲实词: went \| stage10 | `74c9179b` |
| 4 | am1_l19 | 超纲 | 疑超纲实词: cake, made \| stage10 | `4238b0fb` |
| 4 | am1_l19 | transform风险 | 缩写: "They aren't going to come." | `f5bd1bff` |
| 4 | am1_l19 | transform风险 | 缩写: "He isn't going to bring soda." | `aa346435` |
| 4 | am1_l19 | transform风险 | 缩写: "We aren't going to have a party." | `83dc4d06` |
| 4 | am1_l19 | transform风险 | 缩写: "They aren't going to have a BBQ." | `2aa61e43` |
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
| 4 | am1_l20 | transform风险 | 缩写: "Don't worry." | `f9acc435` |
| 4 | am1_l20 | transform风险 | 缩写: "Don't touch the balloons." | `d923f63b` |
| 4 | am1_l20 | transform风险 | 缩写: "Don't make a sound." | `3d44c4eb` |
| 4 | am1_l20 | transform风险 | 缩写: "Don't drop the cake." | `7fb581b8` |
| 4 | am1_l20 | transform风险 | 缩写: "Don't touch the balloons." | `292f4fe8` |
| 4 | am1_l20 | transform风险 | 缩写: "Don't worry." | `3d6b9414` |
| 4 | am1_l20 | transform风险 | 缩写: "Don't drop the balloons." | `326932d1` |
| 4 | am1_l21 | 超纲 | 疑超纲实词: many \| stage5 | `58d542b9` |
| 4 | am1_l21 | 超纲 | 疑超纲实词: sugar \| stage5 | `ddc8fb9d` |
| 4 | am1_l21 | 超纲 | 疑超纲实词: freezer, fridger, refrigerator \| stage6 | `938231ad` |
| 4 | am1_l21 | 超纲 | 疑超纲实词: chart \| stage7 | `9c47117f` |
| 4 | am1_l21 | 超纲 | 疑超纲实词: many \| stage7 | `b463443c` |
| 4 | am1_l21 | 超纲 | 疑超纲实词: many \| stage8 | `b59e2c67` |
| 4 | am1_l21 | transform风险 | 缩写: "There isn't any juice." | `e280f2bd` |
| 4 | am1_l21 | transform风险 | 缩写: "any）→ There isn't any bread." | `f3478645` |
| 4 | am1_l22 | 超纲 | 疑超纲实词: ing \| stage5 | `785a7ee3` |
| 4 | am1_l22 | 超纲 | 疑超纲实词: sang \| stage5 | `e0997672` |
| 4 | am1_l22 | 超纲 | 疑超纲实词: sang \| stage5 | `3a424b29` |
| 4 | am1_l22 | 超纲 | 疑超纲实词: road, team \| stage6 | `edda56e0` |
| 4 | am1_l22 | 超纲 | 疑超纲实词: sang \| stage7 | `8111721f` |
| 4 | am1_l22 | 超纲 | 疑超纲实词: piano \| stage7 | `71652e6e` |
| 4 | am1_l22 | 超纲 | 疑超纲实词: piano \| stage8 | `8a2be019` |
| 4 | am1_l22 | 超纲 | 疑超纲实词: swim \| stage10 | `ad9f6550` |
| 4 | am1_l22 | transform风险 | 缩写: "I can't play the guitar." | `ce4c9246` |
| 4 | am1_l22 | transform风险 | 缩写: "I can't sing." | `4a43b20a` |
| 4 | am1_l23 | 超纲 | 疑超纲实词: gift \| stage5 | `363b11ff` |

_…余 784 条见数据_

## transform 判定放宽提案（报 Aaron 拍板）

共 597 道 transform,其中 139 道答案含判定风险(缩写/可省that/全写式)。现行判定=answer_text 全匹配(忽略大小写与末尾标点)。建议放宽规则(任一命中即判对):

1. **缩写 ≡ 全写**:don't≡do not / isn't≡is not / it's≡it is / I'll≡I will 等(双向)。
2. **that 可省**:said (that) / a book (that) I bought —— 含/省 that 均判对。
3. **末尾标点 + 首字母大小写**已忽略(现状保留)。
4. 需 Aaron 拍板是否落地为判定层规则(逻辑侧改 american 判分函数,非改库)。

