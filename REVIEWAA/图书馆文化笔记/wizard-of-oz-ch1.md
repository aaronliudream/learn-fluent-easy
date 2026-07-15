# 图书馆·文化笔记 ② 读中词卡 — 绿野仙踪 第 1 章「The Cyclone」待审稿

> ⚠️ **内容红线**:以下是 **AI 初稿**,讲的是史实 / 地理 / 气象 / 建筑,**必须 Aaron 逐条核对属实后才落库**。
> 审完把「保留 / 改这里 / 删」标在每条下面,我据此出 `SQLAA/library-culture-notes-wizard-of-oz.sql`(你跑)。
> 卡片会自动在标题前渲染一个 💡 图标,所以 `title` 字段**不带 emoji**。展开默认显示中文;有英文则给「EN」小切换。

本章 4 条(全部单词,非语块)。tap 命中键 = 正文里该词的小写形式。

---

## 1. `cyclone` — 锚定章 1

**title:** 为什么叫 cyclone,不叫 tornado?

**body_zh:**
1900 年鲍姆写这本书时,美国中部平原上的人管这种从天而降、能掀翻房子的旋风叫 cyclone(旋风)。今天气象学更常用 **tornado(龙卷风)** 来指这种陆地上的漏斗状强风;而 cyclone 在现代气象里通常指范围大得多的热带气旋(台风、飓风就属于这一类)。但在堪萨斯农民口中,cyclone 就是那种突然袭来、能把多萝西的房子连根卷走的可怕龙卷风——所以第一章就叫「The Cyclone」。

**body_en:**
When Baum wrote this book in 1900, people on the American plains called the house-lifting whirlwind a "cyclone." Today weather scientists usually call this land twister a "tornado," and save "cyclone" for the much larger tropical storms. But to a Kansas farmer, a cyclone was exactly the sudden, terrifying twister that carries Dorothy's house away — which is why Chapter 1 is called "The Cyclone."

*核对点:鲍姆 1900 年出版;现代气象 tornado=陆地漏斗风、cyclone=大尺度气旋(含热带气旋);当年中西部口语 cyclone≈今 tornado。*

---

## 2. `cellar` — 锚定章 1

**title:** cellar 不是酒窖——是躲龙卷风的地洞

**body_zh:**
cellar 本义是「地下室」。书里 Uncle Henry 家太小,没有真正的地下室,只在地板正中挖了一个小地洞,叫 **cyclone cellar(防旋风地窖)**。龙卷风来时,一家人掀开地板上的活板门(trap door),顺着梯子钻进这个又小又黑的洞里躲命。这在当年美国大草原上是每户人家的救命设施,和存酒、存菜的地窖完全是两回事。

**body_en:**
A "cellar" is a room dug underground. Uncle Henry's house was too small for a real one, so the family only dug a little hole called a "cyclone cellar." When a twister came, they lifted a trap door in the floor and climbed down a ladder to hide in the small, dark hole. On the old American prairie this was a life-saving shelter — nothing like a cellar for storing wine or vegetables.

*核对点:storm/cyclone cellar 是真实存在的地下避风所;正文明写活板门 + 梯子 + 又小又黑的洞。*

---

## 3. `garret` — 锚定章 1

**title:** garret 是什么样的房间?

**body_zh:**
garret 指屋顶正下方那个又矮又斜的小阁楼:墙壁跟着屋顶倾斜,通常用来堆杂物,或给最穷的人住(欧美老小说里穷学生、穷画家常「住在 garret 里」)。它和普通的 **attic(阁楼)** 意思相近,但 garret 更强调「窄小、简陋、能住人」。书里说这间小屋「没有 garret,也没有地下室」,一句话就点出 Uncle Henry 一家有多清贫——房子只有一层、一个房间。

**body_en:**
A "garret" is the cramped little room right under a sloping roof, often used for storage or as a home for the very poor. It is close in meaning to "attic," but "garret" stresses how small and bare it is. Saying the house had "no garret at all, and no cellar" tells us in just a few words how poor Uncle Henry's family was.

*核对点:garret=坡顶下可住人的小阁楼,常与贫穷相连;与 attic 的细微差别(attic 泛指顶层空间,garret 特指窄小住人房)。*

---

## 4. `prairie` / `prairies` — 锚定章 1(**两个 tap 键,同一条内容**)

> 正文里同时出现 `prairies`(第 1 段「great Kansas prairies」)和 `prairie`(第 2 段「great gray prairie」)。tap 命中键是精确小写形式,所以这条要**落 2 行**(term=`prairie` 和 term=`prairies`),body 相同。

**title:** prairie:美国中部一望无际的大草原

**body_zh:**
prairie 指北美中部那片辽阔平坦的大草原,堪萨斯(Kansas)正在其中。这里没有山、几乎没有树,草能长得很高,一眼望去平到天边——书里说多萝西「除了灰色的大草原什么也看不见」。19 世纪的开拓者赶着大篷车来这里垦荒,土地肥沃但气候极端:夏天烈日把草和泥土都烤成灰色,还常有龙卷风。prairie 这个词本身来自法语,意思就是「草地」。

**body_en:**
A "prairie" is the huge, flat grassland in the middle of North America, and Kansas sits right in it. There are no hills and almost no trees; the grass can grow tall and the land runs flat to the edge of the sky. Settlers came here in covered wagons to farm the rich soil, but the weather was harsh — burning sun and sudden cyclones. The word "prairie" comes from French, and means "meadow."

*核对点:堪萨斯属北美大平原/草原带;prairie 源自法语=草地(经拉丁 pratum);19 世纪大篷车垦荒史实;正文第 2 段确写烈日把草烤灰。*

---

### 落库时的字段映射(审核通过后我生成 SQL)

| term | chapter_idx | title | body_zh | body_en | is_published |
|---|---|---|---|---|---|
| cyclone | 1 | 为什么叫 cyclone,不叫 tornado? | (上) | (上) | true |
| cellar | 1 | cellar 不是酒窖——是躲龙卷风的地洞 | (上) | (上) | true |
| garret | 1 | garret 是什么样的房间? | (上) | (上) | true |
| prairie | 1 | prairie:美国中部一望无际的大草原 | (上) | (上) | true |
| prairies | 1 | (同 prairie) | (同上) | (同上) | true |

> 前置依赖:先跑 `SQLAA/library-culture-notes-ddl.sql` 建表,再跑内容 SQL。
