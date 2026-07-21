# fir-tree 28 张旧全局卡修正审稿(B 改全局 / A 按书例外)

**背景**:fir-tree 上线后发现 654 张"已有全局卡"里 ~28 张回读不通——全局 read-v1 把**罕见义/次要义/错词性当了默认义**(违反手册"全局卡放主流义")。这些卡 Oz/Robinson/Tom 也在吃(after 鲁滨逊 214×、over 154×、word 60× …),修全局连带全修。

**规则**:默认 **B=改全局卡**(默认义→主流义);逐张查另四本,**某本依赖旧义则那本退 A**(建 library_word_senses 按书覆盖),global 仍走 B。

**审我什么**:每条的「拟改默认义」方向对不对、有没有漏掉的反例书。审定后我出 SQL(global UPDATE + 2 条 Tom 的 A 覆盖),Aaron 跑。

⚠️ 这 28 张现在 **is_published=true 在生产上**,优先级最高。

---

| # | 词 | 现全局义 | 拟改默认义(主流义) | fir-tree 出处 | 另四本核查 → 判定 |
|---|---|---|---|---|---|
| 1 | **withered** | [v.] 使…羞愧/无言以对 | [adj.] 枯萎的、干枯发蔫 | "they were all **withered** and yellow" | Tom 有旧义 `Tom withered him with derision`(使羞愧)→ **B + Tom 退 A**(使羞愧) |
| 2 | **hang** | [v.] 见鬼、真讨厌 | [v.] 悬挂、垂挂 | "hams **hang** from above" | Rob 9×/Tom 多为"悬挂";Tom `Hang the boy`(感叹)并入次义 → **B** |
| 3 | **squeak** | [v.] 告密、说漏嘴 | [v.] 吱吱叫、发出尖细声 | "**Squeak! Squeak!**" said a little Mouse | Tom 有旧义 `if we was to squeak`(告密)→ **B + Tom 退 A**(告密) |
| 4 | **star** | [adj.] 明星的、杰出的 | [n.] 星、星星;(次)明星 | "a large **star** of gold tinsel" | 无反例 → **B** |
| 5 | **sheer** | [v.] (船)偏转 | [adj.] 纯粹的、十足的;陡峭的 | "for **sheer** longing" | 无反例(Rob/Tom 均非"偏转")→ **B** |
| 6 | **trunks** | [n.] (旧时男子的)短裤 | [n.] 树干;(复)大衣箱、大木箱 | "The **trunks** were moved" | fir=箱子/Tom=树干;短裤降次义 → **B** |
| 7 | **sprung** | [v.] 裂开漏水 | [v.] 跳起、涌现;(sprung up)长出 | "where he had **sprung** up" | 无反例 → **B** |
| 8 | **spring** | [n.] 泉水;[v.] 跳 | [n.] 春天;泉水;弹簧;[v.] 跳、猛地 | "In **spring**, when the swallows…" | Oz=泉水/跳、Tom=弹力,都并入多义;**补"春天"为首义** → **B** |
| 9 | **nurse** | [v.] 照料、哺育 | [n.] 护士;保姆;[v.] 照料 | "the old **nurse**" | 无反例 → **B** |
| 10 | **plant** | [n.] 植物 | [n.] 植物;[v.] 栽种、种植 | "men cannot **plant** me now" | Rob 也用 v.种植 → **B**(补动词) |
| 11 | **plunder** | [n.] 掠夺物、赃物 | [v.] 掠夺、抢夺;[n.] 掠夺物 | "permission to **plunder** the Tree" | 无反例 → **B** |
| 12 | **troop** | [v.] 成群结队走 | [n.] 一群、一队;军队;[v.] 成群走 | "a **troop** of children rushed in" | Rob `my little troop`=一队 → **B** |
| 13 | **state** | [adj.] 正式的、隆重的 | [n.] 状态、情形;国家 | "What a **state** he was in!" | Rob/Tom 多为 n.状态;Tom `state door`(正式)并入次义 → **B** |
| 14 | **matter** | [v.] 要紧、有关系 | [n.] 事情、问题;[v.] 要紧 | "what is the **matter** with me" | Oz `doesn't matter`=v.、Rob `what was the matter`=n.,多义都覆盖 → **B** |
| 15 | **rest** | [n.] 剩余部分 | [n.] 其余、剩余;[v.] 休息、安歇 | "could never **rest**" | Aesop `time to rest`=休息、各书 `the rest`=其余;**补休息** → **B** |
| 16 | **court** | [n.] 君主及其随从 | [n.] 庭院、院子;法庭;宫廷 | "the **court** adjoined a garden" | Oz=宫廷、fir=庭院,都覆盖 → **B** |
| 17 | **over** | [prep.] (与 get 连用)克服 | [prep.] 在上方;越过;遍及;结束 | "jump right **over** the little Tree" | **影响面最大**(Rob 154×/Tom 129×/Oz 87× 全是主流介词义)→ **B** |
| 18 | **bend** | [n.] 弯曲处、转弯 | [v.] 弯曲、弯身;[n.] 弯道 | "I could **bend** with stateliness" | Rob `twigs that would bend`=v.弯 → **B** |
| 19 | **fixed** | [adj.] 处于…境地 | [adj.] 固定的、安装牢的 | "if it had not been **fixed** firmly" | Rob `fixed my habitation`=固定;Tom `how I'm fixed`(处境)降次义 → **B** |
| 20 | **beat** | [v.] (心脏)跳动 | [v.] 打、敲、拍打;(心)跳动 | "sparrows will **beat** against the windowpanes" | Rob `beat some corn`=捣、Oz `heart beat`=心跳,多义覆盖 → **B** |
| 21 | **sing** | [v.] 发出啸声 | [v.] 唱歌;(鸟)鸣叫 | "where the little birds **sing**" | Tom `making everything sing`(风呼啸)降次义 → **B** |
| 22 | **word** | [n.] 命令、指令 | [n.] 词、单词;话语 | "every single **word** of it" | Tom/fir=词语;Oz `at his word`(命令)降次义 → **B** |
| 23 | **assert** | [v.] 显现、发作 | [v.] 断言、声称、坚称 | "I venture to **assert**" | Tom `assert its claims`(显现)降次义 → **B** |
| 24 | **care** | [n.] 照料、照顾 | [v.] 关心、在意;[n.] 照料、小心 | "did not **care** for the children" | Oz/Rob/Tom `care for/take care` 多义覆盖 → **B** |
| 25 | **after** | [prep.] 照管、照料 | [prep.] 在…之后;随后 | "**after** another year" / "**after** all" | **彻底错义**(after≠照料;那是 look after)+影响面巨大(Rob 214×)→ **B** |
| 26 | **upright** | [adj.] 正直的、诚实的 | [adj./adv.] 直立的、竖直的;正直的 | "stuck **upright** in a cask" | Rob `stand upright`=直立 → **B** |
| 27 | **peeping** | [v.] (从…中)显露、冒出 | [v.] 偷看、窥视;探出、探头 | "**peeping** out of his hole" | Tom `cautiously peeping out`=窥视 → **B** |
| 28 | **kissed** | [v.] 被吻过的 | [v.] 亲吻、吻(kiss 过去式) | "the Wind **kissed** the Tree" | Oz/Tom `kissed her/lips`=亲吻 → **B** |

---

**汇总**:26 张纯 B(改全局);2 张 B + Tom 退 A(withered、squeak)。

审定后我做:
- **B**:26+2=28 张 global read-v1 UPDATE(改 pos/gloss_cn/gloss_en/example/sense_key,IPA 已正确不动),幂等,BEGIN/COMMIT+前后计数。
- **A**:2 张 `library_word_senses`(book_key=tom-sawyer:withered=使羞愧、squeak=告密),这样 global 走主流义、Tom 仍读旧义。
- 全书回读复验通过后交 Aaron 跑。

**⏭️ 另四本(Oz/Aesop/Robinson/Tom)同类全量回读扫描**:排这批之后单独一轮(它们各有 fir-tree 没出现的旧卡问题)。
