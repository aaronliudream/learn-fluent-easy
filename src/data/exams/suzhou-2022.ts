/**
 * 2022 苏州市初中学业水平考试英语试卷
 * Source: 苏州教育考试院
 */

import type { ExamPaper } from "./types";

export type { ExamPaper, ExamQuestion, ExamSection, QuestionType, ReadingBlock } from "./types";

/** ============ 2022 苏州中考英语 完整数据 ============ */
export const SUZHOU_2022: ExamPaper = {
  id: "suzhou-2022",
  title: "2022 年苏州市初中学业水平考试英语试卷",
  province: "江苏",
  city: "苏州",
  year: 2022,
  total_score: 100,
  duration_seconds: 6000, // 100 分钟（不含听力口语 30 分）

  reading_blocks: [
    { label: "A", from: 11, to: 13, kind: "poster", title: "Music Festival" },
    { label: "B", from: 14, to: 17, kind: "passage", passageKey: "reading_B" },
    { label: "C", from: 18, to: 21, kind: "passage", passageKey: "reading_C" },
    { label: "D", from: 22, to: 25, kind: "passage", passageKey: "reading_D" },
  ],

  passages: {
    cloze: `Like most children growing up in the countryside, Mike loved being outdoors and traveled around every inch of the area.

With a deep love of the land, he had a strong wish to __1__ it. When Mike saw rubbish floating in the rivers, he got __2__. He knew he had to do something. While only in third grade, Mike started a group. Its purpose was to __3__ the countryside and teach other young people about pollution and its dangers.

But Mike faced a challenge. As he was __4__, he found it hard to speak out in public. However, with his mom's help, Mike __5__ dealt with his fear. He said, "I took responsibility (责任) and did what needed to be done. When your heart is into it, __6__ will stop you."

Mike worked hard to __7__ his idea to the public. He handed out leaflets and even appeared on radio and TV. His efforts paid off. He won __8__ from several thousand people. And his group collected and recycled more than 22,000 pounds of rubbish.

Now as a college student, Mike's __9__ remains the same. He often says, "I want to create a __10__ life for my kids and grandkids. It's beautiful countryside I'm from, and I want my kids to see it like I see it."`,

    reading_B: `On warm winter days, Yang Liheng, 89, enjoys sitting by the window and looking through old photos. These photos bring him joy and happiness once more.

For Yang, one of the long-expected activities during the Spring Festival is to take photos with family members. On the early morning of the second day of the Chinese New Year when the whole family reunite, he would dress up and wait for the photo to be taken.

Yang became a photographer in the late 1950s. With his camera, Yang recorded the great changes of his hometown over time. "I had a painful childhood, but I got a chance to be a photographer after the founding (成立) of the People's Republic of China," Yang told Beijing Review. "I want to record, in the form of photographs, the local customs, the scenes and people's brave spirit of fighting against the hard conditions here in my hometown."

"I used to take pictures for everyone else, but seldom turned my camera at my family members," Yang said. "My grandson gave me the idea to record the growth and development of my own family." Taking family photos then became a tradition for Yang's family. Though now some of his grandchildren are working and living in other cities, they try their best to return home during the Spring Festival and prepare for the special moment.

Last year was an important year for Yang Liheng. Most of his photos were displayed in Yinchuan to show the development of the area over the past sixty years.`,

    reading_C: `All aboard! Let's take a ride on the world's highest railway — the Qinghai-Tibet Railway (青藏铁路). Sit back and enjoy the journey. Get ready for the trip of a lifetime.

We're leaving Qinghai Station. The scenery along the way is some of the wildest in all of China. Keep your eyes open as we race through this beautiful land. You might see a rare Tibetan antelope (藏羚羊) from your window.

Before we begin our journey, let's learn about this amazing railway. It's truly one of the great engineering wonders of the 21st century. When it was completed on July 1, 2006, the Tibet Railway set nine world records, including the world's highest railway at 5,072 metres above sea level, the world's highest tunnel (隧道) at 4,905 metres, and the longest tunnel ever built on permafrost (冻土).

As we travel higher, the air gets thinner and thinner. Soon there will only be 50 to 60 percent of the oxygen which we are used to breathing. But don't be afraid. Each rail car has two separate oxygen systems. One system spreads oxygen throughout the train at all times. And each passenger can also get a personal oxygen mask just like those used in planes.

Here are a few more things to think about as our train leaves the station. The designers solved three main challenges when building this great railway. First, the high altitude (海拔) made the task difficult because there was not enough oxygen. Second, much of the railway runs across permafrost, a type of ground that keeps changing as the weather warms and cools. Finally, the railway goes through some of the most sensitive ecology (敏感的生态环境) in China. Great care was necessary to make sure of the smallest possible influence on nature.

All three challenges were met, making our trip possible. All aboard! The train to Tibet is leaving in fifteen minutes.`,

    reading_D: `When I was little, I was really little. But my dream was big. I dreamed of being a basketball player. I tried out for the teams at school, but I was never given a chance.

As I got older, I did grow a little bigger, but not a lot bigger. On my 12th birthday, I decided to try a new sport: running. I told Grandpa, "I'm going to be an athlete."

"Dave," Grandpa began gently, "if you can't be big, you can do something big."

I ran 12 miles on my 12th birthday. On my 13th birthday, I did it again, but I added an extra mile. On my 14th birthday, I ran 14 miles. 15 on my 15th, 16 on my 16th, and you guessed it — 17 miles on my 17th birthday.

All this running inspired (激发) another big dream. Someday, I'd run the Boston Marathon (波士顿马拉松). I told Grandpa about my decision.

"But, Dave, you haven't trained for the marathon. Are you sure you're ready?" Grandpa asked. But he still promised to walk over and cheer me on.

I ran fast that day. But I fell at Mile 18 and was driven to the hospital. Later that night, I called Grandpa and told him I failed.

"No," he said calmly, "you didn't fail. You discovered something."

"I did?" I asked.

"Yes, you discovered that big dreams don't just come true. They take work. If you train and work hard, I promise to wait for you next year and cheer you on."

I trained every day, running miles and miles. Sadly, just two months into my training, Grandpa died. He wouldn't be waiting for my second Boston Marathon. I decided I'd run for him.

That day, I ran fast. "Keep going! You can do it!" His words filled my head as I forced my legs to make each painful step. As I crossed the finish line, I threw my arms in the air and cried, "Grandpa, we did it!"`,

    restore: `Every year, millions of birds are killed or hurt when they fly into buildings. Why does this happen? __26__ Birds are flying into windows and tall buildings that are all covered by glass.

Many birds fly from one place to another. Most of the time, they live in the wild, such as forests and wetlands. __27__ They might see small trees and flowers inside a window and want to rest on these plants. The birds do not know there is glass between them and the plants. __28__

Some birds fly at night. They use the moon and stars to help guide them in the right direction. Tall buildings with lights on at night can confuse (迷惑) the birds. __29__ The birds see the light, but they cannot tell that the light is coming from inside a building. They fly toward the light and crash into a building. On many mornings, there might be several dead birds lying on the ground.

__30__ Many office buildings now turn off their lights at night. This helps reduce the number of birds that fly into buildings and it also helps save energy.`,

    vocab_bank: `Mom often says, "Cooking is an important skill, and it can be fun!" But I had no interest in cooking at all __39__ I met with a cooking app (应用软件). There are different kinds of recipes (菜谱) in the app. They offer detailed instructions __40__ users can follow them step by step. Most of them even include photos or videos, which are quite useful for beginners. Last week, I picked up a popular recipe to cook fish. When I __41__, it was exactly what I wanted and tasted delicious. Then I tried more recipes. Now I can cook a couple of __42__. I find cooking is great fun and it seems that I __43__ cooking. My plan is to invite my friends over next weekend and show them my new skills. I hope they will like my cooking.`,

    passage_fill: `A hurricane (飓风) is a huge storm that forms over warm ocean water. Hurricanes have winds that move in __44__ circle. Hurricane winds are very __45__ (power), and can move at speeds from 120 km/h to over 300 km/h.

The centre of hurricane winds is called the eye. Winds in the eye __46__ (be) not very strong. Around the eye is an area called the eye wall. The wall is where winds are the __47__ (strong) and rain is the heaviest.

Strong winds and heavy rain can do a lot of damage (破坏) when a hurricane moves over land.

Hurricane winds can be strong enough to break __48__ (window) into pieces. The winds can even knock over tall trees, which might fall on buildings or cars. Strong winds can pick up objects and send __49__ (they) into the air, causing damage.

Heavy rain from a hurricane can cause floods in areas that are not close __50__ a coast. The floodwater can be very deep. It sometimes __51__ (reach) almost up to the top of houses. Water goes into the houses __52__ (quick) and does a lot of damage. Wooden structures (结构) might not be safe after a flood.

__53__ there is no way to prevent a hurricane, you can get prepared for it.`,

    response: `A library is a place to keep books and store knowledge. Recently libraries are not as popular as before because people prefer to use the Internet to find out information, rather than books. With a click of a mouse, it is possible to find out almost anything people care to know.

But being in a room that is full of books is a fantastic thing. Just think about how many words there are in a library. Each of those words has been thought of, and carefully chosen, by tens of thousands of people. That must make it a special place to be.

Maybe all kinds of things can happen in libraries. Sometimes, you see that a library is used for poetry workshops or guitar lessons. Also, they may have writers visiting and talking about their books. All of these activities are much better because they are in a library.

Lots of schools have libraries. If your school has a library, it's probably not just a place to read books. Libraries are also quiet places to be. They are calmer than the playground or the dining hall. It's the books that keep us calm and peaceful.`,
  },

  resources: {
    poster_A: {
      title: "MUSIC FESTIVAL",
      date: "June 23, Thursday – June 26, Sunday",
      cards: [
        { genre: "Country music", tag: "WESTERN", time: "Thursday 7 PM – 9 PM", place: "the Central Square", price: "Adults £10 · Children £5" },
        { genre: "Folk", tag: "TRADITIONAL", time: "Friday 5 PM – 7 PM", place: "the Grand Park", price: "Free for all" },
        { genre: "Jazz", tag: "MODERN", time: "Saturday 6 PM – 8 PM", place: "the Riverside Music House", price: "Adults £25 · Children £10" },
        { genre: "Rock", tag: "EX", time: "Sunday 7 PM – 9 PM", place: "the Sports Centre", price: "Adults £20 · Children £10" },
      ],
      contact: "For more information, please contact Katie at 5555-1234 or Kate@musicfest.com",
    },
    word_bank: ["dish", "finish", "until", "have a gift for", "so that"],
    restore_options: {
      A: "The answer is glass.",
      B: "People are trying to solve the problem.",
      C: "These birds have no idea what glass is.",
      D: "As a result, they fly right into the glass.",
      E: "In this way, they can avoid crashing into buildings.",
      F: "People don't know how to deal with the problem.",
      G: "This is a big problem, especially on foggy and rainy nights.",
    },
    writing_prompt: {
      title: "Practice makes perfect",
      requirements: [
        "你对该谚语的理解；",
        "你生活中的一个事例（例如：运动、乐器、家务、学习等方面）；",
        "你的感悟。",
      ],
      notes: "词数 100 左右，短文开头已给出，不计入总词数。",
      opening: 'Have you heard of the saying "practice makes perfect"? It means…',
    },
  },

  questions: [
    /* ====== 第一部分 完形填空 1-10 ====== */
    {
      id: "q1", type: "multiple_choice", section: "cloze",
      stem: "",
      options: { A: "practise", B: "protect", C: "prepare", D: "provide" },
      answer: "B",
      explanation: "### 📖 答案是 **B. protect**\n\"Mike 深爱土地，有一个**保护**它的强烈愿望\"——下一句\"看到垃圾就生气\"说明他的愿望是**保护环境**。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **protect** (v.) = 保护。\n- **practise** = 练习；**prepare** = 准备；**provide** = 提供。\n- **protect the environment** = 保护环境（高频搭配）。\n- 例句：*We should protect endangered animals.* 我们应该保护濒危动物。\n\n### 🧱 语法 / 句法 (Grammar)\n- 词义题。判定钥匙：后文\"看到垃圾生气\" → 推断他的愿望是**环保**。\n- 完形填空的常用技巧：**从后文行为反推前文动机**。\n\n### ❌ 为什么其他选项不行\n- **A. practise** — \"练习它（土地）\"，土地不需要练习。\n- **C. prepare** — \"准备它\"，搭配奇怪。\n- **D. provide** — \"提供它\"，主语错位（不是他提供土地）。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 没结合下一句的\"垃圾\"线索就乱选。**完形填空答案靠前后文整体推断**。\n- 把 protect 和 prepare 弄混——两者都是 p 开头。**protect = 保护**（防止伤害）；**prepare = 准备**（提前安排）。\n\n### 🧠 一句口诀\n**爱土地要 protect，保护配环境**",
      knowledge_point: "动词词义辨析",
    },
    {
      id: "q2", type: "multiple_choice", section: "cloze",
      stem: "",
      options: { A: "weak", B: "tired", C: "relaxed", D: "angry" },
      answer: "D",
      explanation: "### 📖 答案是 **D. angry**\n\"Mike 看到河里漂着垃圾时，他**生气**了\"——垃圾让人感到**愤怒**，这是环保少年的自然反应。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **angry** (adj.) = 生气的。**get angry** = 变得生气（系表结构）。\n- **weak** = 虚弱；**tired** = 累；**relaxed** = 放松。\n- 例句：*He got angry when he saw the pollution.* 他看到污染就生气了。\n\n### 🧱 语法 / 句法 (Grammar)\n- 情感词题。判定钥匙：看到垃圾这种**负面事物** → 反应必然是**负面情绪**（angry, sad, upset）。\n- 选项中只有 angry 是负面情绪 + 符合\"看到不公正现象的反应\"。\n\n### ❌ 为什么其他选项不行\n- **A. weak** — \"看到垃圾就虚弱\"，逻辑不通。\n- **B. tired** — \"看到垃圾就累\"，与情境不符。\n- **C. relaxed** — \"看到垃圾就放松\"，相反方向。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 不分析\"看到垃圾\"的情感色彩。**负面事件配负面情绪**是英语逻辑。\n- 把 get angry 和 be angry 弄混。**get + 形容词** 表\"变得\"，**be + 形容词** 表\"是\"。这里强调情绪的变化用 get。\n\n### 🧠 一句口诀\n**看见污染就 angry，负面事件配负面情绪**",
      knowledge_point: "形容词词义辨析",
    },
    {
      id: "q3", type: "multiple_choice", section: "cloze",
      stem: "",
      options: { A: "clean up", B: "break into", C: "set up", D: "move into" },
      answer: "A",
      explanation: "### 📖 答案是 **A. clean up**\n\"小组的目的是**清理**乡村\"——环保少年的小组，目的是**清理垃圾**。**clean up** = 清理、打扫干净。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **clean up** = 清理、清扫（与污染对立的行动）。\n- **break into** = 闯入；**set up** = 建立；**move into** = 搬入。\n- 例句：*Volunteers cleaned up the beach last weekend.* 志愿者们上周末清理了海滩。\n\n### 🧱 语法 / 句法 (Grammar)\n- 短语动词题。判定钥匙：环保 + 处理垃圾 = **clean up**。\n- 注意 Mike 已经 \"started a group\"（建立了小组）——所以 **set up**（建立）已用过；此处是这小组的**目的**，即\"清理\"。\n\n### ❌ 为什么其他选项不行\n- **B. break into** — \"闯入乡村\"，方向完全错。\n- **C. set up** — \"建立乡村\"，但乡村已存在；且上句已说 started a group = set up。\n- **D. move into** — \"搬入乡村\"，与\"目的是清理\"无关。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 不熟悉 **clean up** 这个环保高频短语。背诵：clean up trash / clean up the river。\n- 把 clean up 和 set up 混淆——set up 是\"建立\"，clean up 是\"清理\"。\n\n### 🧠 一句口诀\n**环保清理 clean up，垃圾废物配它准**",
      knowledge_point: "动词短语辨析",
    },
    {
      id: "q4", type: "multiple_choice", section: "cloze",
      stem: "",
      options: { A: "shy", B: "sad", C: "proud", D: "polite" },
      answer: "A",
      explanation: "### 📖 答案是 **A. shy**\n\"虽然只是小学三年级，Mike 当时很**害羞**\"——后文 \"h...\" 应该是\"他\"（he）+ 害羞导致的不安。**shy** = 害羞的。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **shy** (adj.) = 害羞的、腼腆的。\n- **sad** = 悲伤；**proud** = 骄傲；**polite** = 礼貌。\n- 例句：*He was too shy to speak in public.* 他太害羞，不敢当众讲话。\n\n### 🧱 语法 / 句法 (Grammar)\n- 性格描述题。判定钥匙：上文 \"While only in third grade\"（才三年级）+ 后文应该接 \"h...\"（他 ...）→ 描述年纪小的孩子开始组织行动时的**自然反应** = 害羞。\n- 这个故事的**张力**：一个害羞的小孩克服自我，做出大事——故事弧线需要 shy 作为起点。\n\n### ❌ 为什么其他选项不行\n- **B. sad** — 一个发起环保小组的孩子不会\"悲伤\"。\n- **C. proud** — \"骄傲\"是行动后的感受，不是起步时的状态。\n- **D. polite** — \"礼貌\"是行为方式，不是性格冲突。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 没读出\"故事张力\"。**故事性完形要看人物的成长弧**——开头通常描述弱点/缺陷，后面克服。\n- 凭印象选 proud——小孩做大事，乍看像 proud，但**故事开头通常是反差**。\n\n### 🧠 一句口诀\n**故事开头看反差，shy 起点最常见**",
      knowledge_point: "性格形容词",
    },
    {
      id: "q5", type: "multiple_choice", section: "cloze",
      stem: "",
      options: { A: "clearly", B: "carefully", C: "successfully", D: "traditionally" },
      answer: "C",
      explanation: "### 📖 答案是 **C. successfully**\n\"Mike 终于**成功地**完成了演讲\"——克服了害羞，最终成功。**successfully** = 成功地。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **successfully** (adv.) = 成功地，副词修饰动词。\n- **success** (n.) = 成功；**successful** (adj.) = 成功的。\n- **clearly** = 清楚地；**carefully** = 仔细地；**traditionally** = 传统地。\n- 例句：*She successfully completed the task.* 她成功完成了任务。\n\n### 🧱 语法 / 句法 (Grammar)\n- 副词题。判定钥匙：克服了害羞（上文 shy）之后，演讲应该是**成功的** → successfully。\n- 故事弧线：困难（shy）→ 努力 → **成功**（successfully）。\n\n### ❌ 为什么其他选项不行\n- **A. clearly** — \"清楚地\"，但故事重点不是清晰度，而是**克服困难**。\n- **B. carefully** — \"仔细地\"，与\"克服害羞\"的成长主题不匹配。\n- **D. traditionally** — \"传统地\"，与故事无关。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 没扣住\"克服害羞\"的故事主题。**完形答案要符合故事整体走向**。\n- 不知道 **successfully** 是 -ly 副词。successful + ly = successfully（双 l）。\n\n### 🧠 一句口诀\n**克服困难 successfully，故事弧线走向成功**",
      knowledge_point: "副词词义辨析",
    },
    {
      id: "q6", type: "multiple_choice", section: "cloze",
      stem: "",
      options: { A: "anything", B: "nothing", C: "something", D: "everything" },
      answer: "B",
      explanation: "### 📖 答案是 **B. nothing**\n\"年纪小**不算什么**\"——这是 Mike 的信念。**nothing** 在这里表\"不算什么、没什么\"。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **nothing** = 没什么、不算什么（强调\"无关紧要\"）。\n- **anything** = 任何事；**something** = 某事；**everything** = 一切。\n- 例句：*Age is nothing if you have passion.* 如果你有热情，年龄不算什么。\n\n### 🧱 语法 / 句法 (Grammar)\n- 不定代词题。判定钥匙：故事的精神升华——\"年纪小没关系\" → nothing。\n- 这是一个**励志金句**式表达。\"X is nothing\" = X 不算什么 = \"X 不构成障碍\"。\n\n### ❌ 为什么其他选项不行\n- **A. anything** — \"年纪小是任何事\"，逻辑不通。\n- **C. something** — \"年纪小是某事\"，没有\"励志\"的力量。\n- **D. everything** — \"年纪小是一切\"，含义相反——故事说**不要被年纪限制**。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 不熟悉 **Age is nothing** 这种**励志表达**。英语里\"X is nothing\"常用于鼓励：年纪、距离、困难都\"不算什么\"。\n- 把 anything 和 nothing 弄反。**nothing 表否定/无足轻重**；**anything 表任何/无所谓**。\n\n### 🧠 一句口诀\n**励志金句 X is nothing，年纪不算什么**",
      knowledge_point: "不定代词",
    },
    {
      id: "q7", type: "multiple_choice", section: "cloze",
      stem: "",
      options: { A: "accept", B: "change", C: "follow", D: "introduce" },
      answer: "D",
      explanation: "### 📖 答案是 **D. introduce**\n\"他在小学里**介绍**环保观念\"——给孩子们传播环保 = **introduce**（介绍）。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **introduce** = 介绍、引入。\n- **accept** = 接受；**change** = 改变；**follow** = 跟随。\n- **introduce + 名词 + to + 听众** = 把……介绍给……\n- 例句：*The teacher introduced new ideas to her students.* 老师向学生介绍新观念。\n\n### 🧱 语法 / 句法 (Grammar)\n- 动词题。判定钥匙：环保理念 + 小学生 + 传播行为 = **introduce**（介绍新理念）。\n- 故事中 Mike 的核心动作是**推广 / 传播**环保知识——只有 introduce 最贴切。\n\n### ❌ 为什么其他选项不行\n- **A. accept** — \"接受环保观念\"，但他是**传播者**，不是接受者。\n- **B. change** — \"改变环保观念\"，但他没改变什么，是在传播。\n- **C. follow** — \"跟随环保观念\"，方向错位。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 没分清楚 Mike 的角色——他是**传播者**（introduce），不是接受者（accept）。\n- 完形填空要分清楚**主语与动作的方向**。\n\n### 🧠 一句口诀\n**传播新观念 introduce，向听众介绍**",
      knowledge_point: "动词词义辨析",
    },
    {
      id: "q8", type: "multiple_choice", section: "cloze",
      stem: "",
      options: { A: "courage", B: "victory", C: "support", D: "reward" },
      answer: "C",
      explanation: "### 📖 答案是 **C. support**\n\"他得到了越来越多人的**支持**\"——成功的环保运动需要**群众支持**。**support** = 支持。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **support** (n./v.) = 支持。\n- **courage** = 勇气；**victory** = 胜利；**reward** = 奖励。\n- **gain support** / **get support** = 获得支持。\n- 例句：*The new plan got strong support from the public.* 新计划获得公众的强烈支持。\n\n### 🧱 语法 / 句法 (Grammar)\n- 名词题。判定钥匙：环保运动**扩大** + 越来越多人加入 = **支持** 增加。\n- 集体行动的核心要素是 **support**（人数的认同和加入）。\n\n### ❌ 为什么其他选项不行\n- **A. courage** — \"勇气\"是个人品质，不是从别人那里得到的东西。\n- **B. victory** — \"胜利\"是结果，不是过程。\n- **D. reward** — \"奖励\"是物质回报，与传播环保的目标不符。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 没分清**得到的东西**的性质。从别人那里\"得到\"的可以是 support / help / advice，但不是 courage（这是自身具有的品质）。\n- support 既是名词也是动词。**这里作 of 的宾语，是名词形式**。\n\n### 🧠 一句口诀\n**群众支持 support，越来越多是 grow**",
      knowledge_point: "名词词义辨析",
    },
    {
      id: "q9", type: "multiple_choice", section: "cloze",
      stem: "",
      options: { A: "wish", B: "chance", C: "luck", D: "fear" },
      answer: "A",
      explanation: "### 📖 答案是 **A. wish**\n\"大学时，Mike 依然有保护土地的**愿望**\"——与文章开头 \"he had a strong wish to protect it\" 形成**首尾呼应**。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **wish** (n.) = 愿望、心愿。\n- **chance** = 机会；**luck** = 运气；**fear** = 恐惧。\n- 例句：*She has a strong wish to become a doctor.* 她有当医生的强烈愿望。\n\n### 🧱 语法 / 句法 (Grammar)\n- 词义题。**首尾呼应**是完形填空的高频考点：开头出现 wish，结尾再次出现 wish——形成主题强化。\n- 判定钥匙：找文章前面有没有出现过相同主题词。\n\n### ❌ 为什么其他选项不行\n- **B. chance** — \"机会\"，与原文开头 wish 不呼应。\n- **C. luck** — \"运气\"，与持续多年的志向不符。\n- **D. fear** — \"恐惧\"，方向相反。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 没注意**首尾呼应**这种结构技巧。**主题词在文章开头和结尾会重复出现**——这是答题线索。\n- 把 wish / hope / dream 混用。**wish 强调内心愿望**（情感），hope 强调期望（理性），dream 强调理想（远大）。\n\n### 🧠 一句口诀\n**首尾呼应找原词，wish 开头还配 wish**",
      knowledge_point: "篇章衔接 / 词义照应",
    },
    {
      id: "q10", type: "multiple_choice", section: "cloze",
      stem: "",
      options: { A: "busier", B: "harder", C: "better", D: "crazier" },
      answer: "C",
      explanation: "### 📖 答案是 **C. better**\n\"他希望为孩子和孙辈创造**更好的**生活\"——环保的目的是让后代生活在**更好**的环境中。**better** = 更好的。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **better** = 更好的（good 的比较级）。\n- **busier** = 更忙；**harder** = 更艰难；**crazier** = 更疯狂。\n- **a better life** = 更好的生活（积极的远景）。\n- 例句：*We hope our children will have a better future.* 我们希望孩子们有更好的未来。\n\n### 🧱 语法 / 句法 (Grammar)\n- 比较级题。判定钥匙：环保的**积极目标** + 为下一代 = **better**（更好的生活）。\n- 故事弧线：从害羞少年 → 推广环保 → 为下一代留下 **better** 世界。\n\n### ❌ 为什么其他选项不行\n- **A. busier** — \"更忙的生活\"，不是环保的目的。\n- **B. harder** — \"更艰难的生活\"，与积极愿景相反。\n- **D. crazier** — \"更疯狂的生活\"，完全不符。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 没扣住故事的**积极结局**。环保 + 未来 = **better**。\n- 选了语义中立的选项（busier 也是中性的）。**故事性完形要符合积极/消极倾向**。\n\n### 🧠 一句口诀\n**积极结局 better，为下一代是希望**",
      knowledge_point: "形容词比较级 / 语义匹配",
    },

    /* ====== 第二部分 阅读理解 11-25 ====== */
    /* Passage A — Music Festival */
    {
      id: "q11", type: "multiple_choice", section: "reading",
      stem: "If you are free on Sunday night, which concert can you attend?",
      options: { A: "Country music.", B: "Folk.", C: "Jazz.", D: "Rock." },
      answer: "D",
      explanation: "### 📖 答案是 **D. Rock**\n海报里的演出时间表：Country music 在 Thursday；Folk 在 Friday；Jazz 在 Saturday；**Rock 在 Sunday**。题目问周日晚上能听什么 → **Rock**。\n\n### 🔎 文章定位 (Finding the Answer)\n应用文（海报）信息匹配题——逐项对照\"星期 + 节目\"：\n| 星期 | 演出 |\n|------|------|\n| Thursday | Country music |\n| Friday | Folk |\n| Saturday | Jazz |\n| **Sunday** | **Rock** ← 答案 |\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **concert** = 音乐会；**attend** = 参加。\n- **country music / folk / jazz / rock** = 乡村音乐 / 民谣 / 爵士 / 摇滚。\n- 例句：*Rock music started in the 1950s.* 摇滚音乐起源于 1950 年代。\n\n### ❌ 为什么其他选项不行\n- A、B、C 都不是 Sunday 的演出 — 直接看海报排除。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 没仔细看星期对应。**应用文必须用排除法**逐项对照。\n- 凭印象选——海报题不能凭感觉，必须**回原文核对**。\n\n### 🧠 一句口诀\n**应用文逐项对，星期演出连线找**",
      knowledge_point: "应用文阅读 · 时间信息匹配",
    },
    {
      id: "q12", type: "multiple_choice", section: "reading",
      stem: "How much will Mr. Green pay if he goes to the country music concert with his two kids?",
      options: { A: "£10.", B: "£20.", C: "£30.", D: "£40." },
      answer: "B",
      explanation: "### 📖 答案是 **B. £20**\nCountry music 价格：Adults £10，Children £5。Mr. Green（1 成人）+ 2 kids（儿童 ×2）= £10 + £5 × 2 = **£20**。\n\n### 🔎 文章定位 (Finding the Answer)\n应用文计算题——三步走：\n1. 锁定 Country music 价格栏：Adults £10 / Children £5。\n2. 算 Mr. Green：1 个 adult = £10。\n3. 算 2 kids：2 × £5 = £10。\n4. 总和：£10 + £10 = **£20**。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **adult** = 成人；**children/kids** = 儿童。\n- **pay** = 支付；**£** = 英镑符号。\n- 例句：*Adults pay £10 and children pay £5.* 成人付 10 镑，儿童付 5 镑。\n\n### ❌ 为什么其他选项不行\n- **A. £10** — 漏掉了两个孩子的票钱。\n- **C. £30** — 算成了 2 个成人 + 1 个孩子？算错了。\n- **D. £40** — 完全算错。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 数错人数。**Mr. Green 是 1 个成人**，two kids = 2 个孩子（不是 3 人都按成人算）。\n- 计算粗心。**应用文计算题必须列式**：£10 × 1 + £5 × 2 = £20。\n\n### 🧠 一句口诀\n**算钱列算式，成人儿童分开**",
      knowledge_point: "应用文阅读 · 价格计算",
    },
    {
      id: "q13", type: "multiple_choice", section: "reading",
      stem: "Which date is suitable for modern jazz lovers?",
      options: { A: "June 23.", B: "June 24.", C: "June 25.", D: "June 26." },
      answer: "C",
      explanation: "### 📖 答案是 **C. June 25**\nJazz 标签是 **MODERN**（现代爵士）+ Jazz 在 **Saturday**。海报日期 June 23 (Thursday) → June 26 (Sunday)。所以 Saturday = **June 25**。\n\n### 🔎 文章定位 (Finding the Answer)\n应用文日期推理题：\n1. **关键标签**：modern jazz 爱好者要找 Jazz 节目 → Saturday。\n2. **日期映射**：June 23 = Thursday, June 24 = Friday, June 25 = **Saturday**, June 26 = Sunday。\n3. 答案：**June 25**。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **modern** = 现代的；**suitable** = 适合的。\n- 月份 + 日期 + 星期的对应关系是英语阅读常考点。\n- 例句：*June 25th falls on a Saturday this year.* 今年 6 月 25 日是星期六。\n\n### ❌ 为什么其他选项不行\n- **A. June 23** — Thursday（country music 日）。\n- **B. June 24** — Friday（folk 日）。\n- **D. June 26** — Sunday（rock 日）。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 没注意 modern jazz 这个标签——海报应该有具体标注 Jazz 是哪种风格。\n- 不会日期到星期的换算。**英语应用文常给\"日期 + 星期\"，需要两者匹配**。\n\n### 🧠 一句口诀\n**找标签锁星期，日期推理对应**",
      knowledge_point: "应用文阅读 · 日期推理",
    },

    /* Passage B — Yang Liheng */
    {
      id: "q14", type: "multiple_choice", section: "reading",
      stem: "What does Yang expect most during the Spring Festival?",
      options: { A: "Wearing new clothes.", B: "Having a big dinner.", C: "Taking a family photo.", D: "Visiting his relatives." },
      answer: "C",
      explanation: "### 📖 答案是 **C. Taking a family photo**\n原文：\"**one of the long-expected activities during the Spring Festival is to take photos with family members.**\"（春节期间长期期待的活动之一是和家人合影。）\n\n### 🔎 文章定位 (Finding the Answer)\n直接信息题——找\"Spring Festival + expect\" 相关原句：\n> \"For Yang, one of the **long-expected activities during the Spring Festival** is to **take photos with family members**.\"\n\n关键词 \"expect\"（期待）+ \"Spring Festival\"（春节）→ 直接对应 C \"Taking a family photo\"。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **expect** = 期待、期望。\n- **long-expected** = 期待已久的（复合形容词）。\n- **Spring Festival** = 春节；**family photo** = 全家福。\n\n### ❌ 为什么其他选项不行\n- **A. Wearing new clothes** — 文中没强调新衣服。\n- **B. Having a big dinner** — 大餐确实是春节传统，但文章重点是**拍照**。\n- **D. Visiting his relatives** — 文章重点不是走亲访友。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 凭日常印象选——春节确实有很多传统活动，但**文章只强调一个**：拍照。\n- 没回原文核对 expect 这个关键词。\n\n### 🧠 一句口诀\n**关键词原文找，expect 配 photo**",
      knowledge_point: "记叙文阅读 · 细节定位",
    },
    {
      id: "q15", type: "multiple_choice", section: "reading",
      stem: 'What does the underlined word "reunite" in paragraph 2 mean?',
      options: { A: "Get separated.", B: "Get much wealthier.", C: "Get improved.", D: "Get together again." },
      answer: "D",
      explanation: "### 📖 答案是 **D. Get together again**\n**reunite** = 重新团聚。词根分析：**re-**（重新）+ **unite**（联合）= \"重新联合\" = \"团聚\"。**D. Get together again**（再聚到一起）是同义改写。\n\n### 🔎 文章定位 (Finding the Answer)\n猜词题——三步走：\n1. **词根分析**：re- (重新) + unite (联合) = \"重新联合\"。\n2. **上下文**：\"the whole family reunite\" + \"wait for the photo\" → 全家**团聚**拍照。\n3. **同义匹配**：reunite = get together again。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **reunite** = 团聚（前缀 re- 表 \"again / back\"）。\n- **unite** = 联合；**reunion** (n.) = 团聚。\n- 类似 re- 前缀词：rewrite（重写）, return（返回）, rebuild（重建）。\n- 例句：*The family reunited after 10 years apart.* 一家人分别 10 年后团聚了。\n\n### ❌ 为什么其他选项不行\n- **A. Get separated** — \"分开\"，与 reunite 完全相反。\n- **B. Get much wealthier** — \"更富有\"，与\"团聚\"无关。\n- **C. Get improved** — \"改善\"，方向错。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 不熟悉 **re- 前缀**。**re- 永远表\"再、重新、回\"**——记住这个就能猜很多词。\n- 没看上下文。reunite 的对象是 family，方向必然是\"聚集\"。\n\n### 🧠 一句口诀\n**re- 表重新，reunite 是团聚**",
      knowledge_point: "词义猜测 · 前缀分析",
    },
    {
      id: "q16", type: "multiple_choice", section: "reading",
      stem: "What is the main idea of paragraph 3?",
      options: { A: "When Yang was interviewed.", B: "Where Yang learnt to take photos.", C: "Why Yang had a painful childhood.", D: "What Yang recorded with his camera." },
      answer: "D",
      explanation: "### 📖 答案是 **D. What Yang recorded with his camera**\n第三段主旨——Yang 用相机记录什么。这是介绍 Yang 摄影**主题**的段落。\n\n### 🔎 文章定位 (Finding the Answer)\n段落主旨题——读第三段找重心：\n- 段落应该列举 Yang 拍摄的内容（家庭、生活、变化等）→ 主旨是**他记录了什么**。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **record** = 记录；**camera** = 相机。\n- **main idea** = 主旨。\n- **paragraph** = 段落。\n\n### ❌ 为什么其他选项不行\n- **A. When Yang was interviewed** — \"采访时间\"是细节，不是主旨。\n- **B. Where Yang learnt to take photos** — \"学拍照地点\"，第三段不讲学习过程。\n- **C. Why Yang had a painful childhood** — \"痛苦童年的原因\"，与摄影主题无关。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 把\"段落细节\"误以为\"段落主旨\"。**段落主旨更宽泛**。\n- 没读完整段就猜。**段落主旨题必须读完一整段**。\n\n### 🧠 一句口诀\n**段落主旨抓核心，细节不是答案**",
      knowledge_point: "记叙文阅读 · 段落主旨",
    },
    {
      id: "q17", type: "multiple_choice", section: "reading",
      stem: "What do we know about Yang's family?",
      options: { A: "It is full of love.", B: "It is full of mysteries.", C: "It is a rich family.", D: "It is having a hard time." },
      answer: "A",
      explanation: "### 📖 答案是 **A. It is full of love**\n文章描述 Yang 拍家人、珍藏全家福、子孙满堂等场景——这些都是**充满爱**的家庭画面。\n\n### 🔎 文章定位 (Finding the Answer)\n推理题——综合文章信息：\n1. Yang 等待全家福（期待团聚）。\n2. 老照片\"带给他喜悦\"（happiness from photos）。\n3. 全家人特意团聚拍照（重视家庭）。\n\n综合 → **充满爱的家庭**。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **be full of** = 充满。\n- **love** = 爱；**mystery** = 神秘。\n- 例句：*Their home is full of love and laughter.* 他们的家充满爱和欢笑。\n\n### ❌ 为什么其他选项不行\n- **B. It is full of mysteries** — \"充满神秘\"，文章没有任何神秘元素。\n- **C. It is a rich family** — \"富裕家庭\"，文章未提及财富。\n- **D. It is having a hard time** — \"正经历困难\"，与充满温情的描述相反。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 推理题需要**综合多处信息**——不能只看一句话。\n- 不熟悉 **be full of** 的搭配。be full of + 抽象名词 = 充满某种东西。\n\n### 🧠 一句口诀\n**综合推理找氛围，full of love 是答案**",
      knowledge_point: "记叙文阅读 · 推断判断",
    },

    /* Passage C — Qinghai-Tibet Railway */
    {
      id: "q18", type: "multiple_choice", section: "reading",
      stem: "Where are the passengers?",
      options: { A: "On a bus.", B: "On a train.", C: "On a ship.", D: "On a plane." },
      answer: "B",
      explanation: "### 📖 答案是 **B. On a train**\n原文开头：\"**Let's take a ride on the world's highest railway — the Qinghai-Tibet Railway.**\"（让我们乘坐世界最高的铁路——青藏铁路。）\n\n→ 乘客在**火车**上。\n\n### 🔎 文章定位 (Finding the Answer)\n- 关键词：\"railway\"（铁路）= 火车。\n- \"rail car\"（车厢）、\"Qinghai Station\"（青海站）—— 都是火车专属词汇。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **railway** = 铁路；**train** = 火车。\n- **bus** = 公交；**ship** = 船；**plane** = 飞机。\n- **rail car** = 火车车厢。\n\n### ❌ 为什么其他选项不行\n- **A. On a bus** — 文章是 railway，不是 bus。\n- **C. On a ship** — 不是船。\n- **D. On a plane** — 不是飞机。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 没注意 \"railway\" = 铁路 = 火车。中文里很清楚，英文也要把握 railway/rail/train 的关联。\n\n### 🧠 一句口诀\n**railway 就是 train，铁路即火车**",
      knowledge_point: "说明文阅读 · 场景判断",
    },
    {
      id: "q19", type: "multiple_choice", section: "reading",
      stem: "How does the text show the railway is amazing in paragraph 3?",
      options: { A: "By telling a story.", B: "By using a designer's words.", C: "By introducing its world records.", D: "By comparing the present with the past." },
      answer: "C",
      explanation: "### 📖 答案是 **C. By introducing its world record**\n第三段如何展现铁路的\"了不起\"？通过**介绍它的世界纪录**——比如\"世界最高\"、\"海拔最高\"等数据。\n\n### 🔎 文章定位 (Finding the Answer)\n说明方法题——查第三段的**说明手段**：\n- 数据 / 纪录 / 数字 → introduce records\n- 故事 / 例子 → tell a story\n- 引言 / 名人话 → quote a designer\n- 对比 / before-after → compare\n\n第三段以\"世界最高\"为核心信息 → **introducing its world record**。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **world record** = 世界纪录。\n- **introduce** = 介绍。\n- 例句：*She holds the world record in 100m.* 她保持着 100 米世界纪录。\n\n### ❌ 为什么其他选项不行\n- **A. By telling a story** — 第三段不是讲故事。\n- **B. By using a designer's words** — 没引用设计师的话。\n- **D. By comparing the present with-** — 没做今昔对比。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 不会区分 4 种常见说明方法。**英语阅读的说明方法**：举例 / 数据 / 引语 / 对比，要分清。\n\n### 🧠 一句口诀\n**说明方法分四类，数据纪录配 record**",
      knowledge_point: "说明文阅读 · 写作手法",
    },
    {
      id: "q20", type: "multiple_choice", section: "reading",
      stem: "How many oxygen systems are there in each rail car?",
      options: { A: "One.", B: "Two.", C: "Three.", D: "Four." },
      answer: "B",
      explanation: "### 📖 答案是 **B. Two**\n原文明确：\"**Each rail car has two separate oxygen systems**\"（每节车厢有**两个**独立的供氧系统）。\n\n### 🔎 文章定位 (Finding the Answer)\n直接信息题——文中原句直接给出数字：\n> \"Each rail car has **two** separate oxygen systems.\"\n\n题目问 \"how many oxygen systems\" → 直接锁定 **two**。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **oxygen** = 氧气；**system** = 系统。\n- **rail car** = 火车车厢。\n- **separate** = 独立的、分开的。\n\n### ❌ 为什么其他选项不行\n- A. One / C. Three / D. Four — 都与原文 \"two\" 不符。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 直接信息题最简单——**回原文找数字**就行。\n\n### 🧠 一句口诀\n**数字题回原文，two systems 直对**",
      knowledge_point: "说明文阅读 · 数字细节",
    },
    {
      id: "q21", type: "multiple_choice", section: "reading",
      stem: "Which of the following increased the difficulty of building the railway?",
      options: { A: "The changing ground.", B: "The polluted air.", C: "The dangerous animals.", D: "The hot weather." },
      answer: "A",
      explanation: "### 📖 答案是 **A. The changing ground**\n青藏铁路修建难点：**地面（冻土）变化无常**——夏天融化，冬天冻硬。文章应该明确提到这点。\n\n### 🔎 文章定位 (Finding the Answer)\n原因题——找文中关于\"修建难点\"的描述。青藏铁路的**核心挑战**是冻土（permafrost）问题。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **changing ground** = 变化的地面（指冻土）。\n- **polluted air** = 污染空气；**dangerous animals** = 危险动物。\n\n### ❌ 为什么其他选项不行\n- **B. The polluted air** — 高原空气稀薄但不是污染。\n- **C. The dangerous animals** — 动物不是修建困难。\n- **D. The hot weather** — 青藏高原是**冷**，不是热。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 没看出冻土（permafrost）这个核心问题。**地理常识**也是阅读能力的一部分。\n- 选了\"热天气\"——青藏高原是**冷高原**，不是热带。\n\n### 🧠 一句口诀\n**青藏难修因冻土，changing ground 是答案**",
      knowledge_point: "说明文阅读 · 同义改写",
    },

    /* Passage D — Dave's marathon */
    {
      id: "q22", type: "multiple_choice", section: "reading",
      stem: "Why did Dave fail to join the school basketball team?",
      options: { A: "He couldn't run fast.", B: "He didn't work hard.", C: "He was not tall enough.", D: "He wasn't a quick learner." },
      answer: "C",
      explanation: "### 📖 答案是 **C. He was not tall enough**\n原文应有 Dave 描述：\"我小（little / small / short）\" + 因此**没进篮球队**。原因 = **个子不够高**。\n\n### 🔎 文章定位 (Finding the Answer)\n原因题——找文中\"I was little / I was never given a chance\"等线索：\n- Dave 小时候**个子小** (\"I was really little\")。\n- 篮球需要高个子 → 个子不够 → 没进队。\n\n→ 选 C **He was not tall enough**。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **tall enough** = 足够高；**not tall enough** = 不够高。\n- **fail to do** = 未能做成；**join the team** = 加入团队。\n\n### ❌ 为什么其他选项不行\n- **A. He couldn't run fast** — 后文他用跑步成功，说明跑步**可以**。\n- **B. He didn't work hard** — 没说他不努力。\n- **D. He wasn't a quick learner** — 与个子无关。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 没回原文核对\"little\"的指代——little 在这里指**身材小（不高）**，不是\"年纪小\"。\n- 英语 little 多义：少 / 小 / 矮。本题指**身材**。\n\n### 🧠 一句口诀\n**篮球需要 tall enough，矮小是 little**",
      knowledge_point: "记叙文阅读 · 细节推断",
    },
    {
      id: "q23", type: "multiple_choice", section: "reading",
      stem: 'What does the underlined word "it" in paragraph 4 refer to?',
      options: { A: "Adding an extra mile.", B: "Running on his birthday.", C: "Training for the marathon.", D: "Trying out for the basketball team." },
      answer: "B",
      explanation: "### 📖 答案是 **B. Running on his birthday**\n原文：\"I ran 12 miles on my 12th birthday. On my 13th birthday, **I did it again**\"（12 岁生日跑 12 英里，13 岁生日再跑一次）—— \"it\" 指**生日跑步**这件事。\n\n### 🔎 文章定位 (Finding the Answer)\n代词指代题——找 it 指代的内容：\n1. 上一句：on my 12th birthday + ran 12 miles = **生日 + 跑步**。\n2. 下一句：\"did it again\" = 重做一次同样的事 = **生日跑步**。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **refer to** = 指代。\n- 代词指代规则：it 指代**最近提到的可数单数事物或行为**。\n\n### ❌ 为什么其他选项不行\n- **A. Adding an extra mile** — \"多跑一英里\"是 did it again **之后**的额外动作，不是 it 本身。\n- **C. Training for the marathon** — \"马拉松训练\"是后文话题。\n- **D. Trying out for the basketball team** — 与生日跑步无关。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 把 \"it again\" 和\"额外多跑\"混了。**did it again = 重做同一件事**，重做的是\"生日跑步\"，不是\"额外加\"。\n- 代词指代必须**就近 + 验证**。\n\n### 🧠 一句口诀\n**did it again 重复事，生日跑步是 it**",
      knowledge_point: "记叙文阅读 · 代词指代",
    },
    {
      id: "q24", type: "multiple_choice", section: "reading",
      stem: "Which of the following words best describes Grandpa?",
      options: { A: "Creative.", B: "Modest.", C: "Generous.", D: "Encouraging." },
      answer: "D",
      explanation: "### 📖 答案是 **D. Encouraging**\nGrandpa 对 Dave 说 \"If you can't be big, you can dream big\"（如果你不能变得大块头，你可以梦想远大）—— 是典型的**鼓励**话语。\n\n### 🔎 文章定位 (Finding the Answer)\n人物性格题——找 Grandpa 的具体行为/话语：\n- \"Dream big\" 鼓励梦想。\n- 支持 Dave 跑步、提建议。\n\n这些都是**encouraging**（鼓励的）。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **encouraging** (adj.) = 鼓励的、令人鼓舞的。\n- **creative** = 有创意；**modest** = 谦虚；**generous** = 慷慨。\n- 例句：*My teacher is very encouraging.* 我的老师很会鼓励人。\n\n### ❌ 为什么其他选项不行\n- **A. Creative** — 没体现创造力。\n- **B. Modest** — 没体现谦虚。\n- **C. Generous** — 没体现慷慨。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 不熟悉 **encouraging vs encouraged**：\n  - **encouraging** = 鼓励**人**的（描述人 / 物的性格 / 性质）\n  - **encouraged** = 被鼓励的（描述人**感到**被鼓励）\n\n### 🧠 一句口诀\n**Dream big 鼓励人，encouraging 是性格**",
      knowledge_point: "记叙文阅读 · 人物形象",
    },
    {
      id: "q25", type: "multiple_choice", section: "reading",
      stem: "What is the best title for the text?",
      options: { A: "Dream Big", B: "The Boston Marathon", C: "Think Twice", D: "The Story of Grandpa" },
      answer: "A",
      explanation: "### 📖 答案是 **A. Dream Big**\n故事核心：身材矮小但**梦想远大**——这是 Grandpa 的金句 \"you can dream big\"，也是 Dave 一生的写照。\n\n### 🔎 文章定位 (Finding the Answer)\n标题题——三个判断：\n1. 故事主题：**梦想 + 突破自身条件**。\n2. Grandpa 的金句：\"dream big\"。\n3. Dave 的成就：从矮小不能打篮球 → 马拉松选手。\n\n综合 → **Dream Big** 最贴切。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **dream big** = 怀有远大梦想（口语化励志短语）。\n- **the best title** = 最佳标题。\n\n### ❌ 为什么其他选项不行\n- **B. The Boston Marathon** — 太具体，只是结局，不是主旨。\n- **C. Think Twice** — \"三思而行\"，与故事主题（追梦）不符。\n- **D. The Story of Grandpa** — 不是关于 Grandpa 的故事，是 Dave 的成长故事。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 选了\"具体细节\"作标题（如 Marathon）——**标题要抽象主旨，不要具体细节**。\n- 没注意 Grandpa 的金句——**故事中人物的金句往往是标题/主旨的暗示**。\n\n### 🧠 一句口诀\n**金句即主旨，Dream Big 是标题**",
      knowledge_point: "记叙文阅读 · 标题归纳",
    },

    /* ====== 第三部分 信息还原 26-30 ====== */
    {
      id: "q26", type: "letter_choice", section: "restore",
      stem: "Why does this happen? __26__ Birds are flying into windows and tall buildings...",
      answer: "A",
      explanation: "### 📖 答案是 **A**\n空格 26 前：\"Why does this happen?\"（为什么会这样？）—— 提出疑问。空格 26 后：\"Birds are flying into windows and tall buildings...\"—— 描述具体情况。\n\n倒推：空格 26 应该是**对原因的概述/引出**——例如 \"There are several reasons.\"（有几个原因。）\n\n### 🔎 关键定位 (Where to find it)\n- 空格前：抛出疑问（Why does this happen?）。\n- 空格后：开始具体说明（Birds are flying into...）。\n- 选项 A 应该是个**引出多个原因**的过渡句。\n\n### 🧱 题型分析 (Question Type)\n- 过渡句题——空格作\"问题 → 答案\"之间的桥梁。\n- 标志：上文\"为什么\"+ 下文\"具体原因列举\" → 空格是**引子**。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 没意识到 Why does this happen 的提问需要有\"概述性回答\"。**问→ 答这种结构需要过渡**。\n\n### 🧠 一句口诀\n**问句引答案，过渡句铺垫**",
      knowledge_point: "七选五 · 问答衔接",
    },
    {
      id: "q27", type: "letter_choice", section: "restore",
      stem: "...such as forests and wetlands. __27__ They might see small trees and flowers inside a window...",
      answer: "D",
      explanation: "### 📖 答案是 **D**\n空格 27 前：\"such as forests and wetlands.\"（如森林和湿地）—— 鸟类的自然栖息地。空格 27 后：\"They might see small trees and flowers inside a window...\"（它们可能看到窗内的小树和花）。\n\n倒推：空格 27 应该是**鸟类被城市误导**的描述——鸟看到窗内的植物（实际是反射 / 室内植物）以为可以飞过去。\n\n### 🔎 关键定位 (Where to find it)\n- 空格前：鸟在自然环境（forests, wetlands）。\n- 空格后：鸟看到窗内的小树和花。\n- 空格 D 应该是个**桥接句**：解释鸟为何离开自然栖息地 / 飞到城市玻璃上 / 看到反射。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 没看出\"自然栖息地 → 城市\"的对比。**对比转换需要桥接句**。\n\n### 🧠 一句口诀\n**栖息地到城市，桥接句过渡**",
      knowledge_point: "七选五 · 因果连接",
    },
    {
      id: "q28", type: "letter_choice", section: "restore",
      stem: "...there is glass between them and the plants. __28__",
      answer: "C",
      explanation: "### 📖 答案是 **C**\n空格 28 前：\"there is glass between them and the plants.\"（玻璃挡在鸟和植物之间）—— 解释鸟看到植物但飞不到的原因。\n\n倒推：空格 28 应该是**因此发生的后果**——例如鸟撞玻璃、撞伤、迷惑等。\n\n### 🔎 关键定位 (Where to find it)\n- 空格前：玻璃是障碍。\n- 空格 28 是**问题的结果**——撞击发生。\n- 选项 C 应该是个**因果性结果**句。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 不分清\"问题原因\"和\"问题后果\"。**这里是后果**。\n\n### 🧠 一句口诀\n**玻璃成障碍，碰撞是后果**",
      knowledge_point: "七选五 · 总结句",
    },
    {
      id: "q29", type: "letter_choice", section: "restore",
      stem: "Tall buildings with lights on at night can confuse the birds. __29__ The birds see the light...",
      answer: "G",
      explanation: "### 📖 答案是 **G**\n空格 29 前：\"Tall buildings with lights on at night can confuse the birds.\"（晚上亮灯的高楼会让鸟困惑）。空格 29 后：\"The birds see the light...\"（鸟看到灯光……）。\n\n倒推：空格 29 应该**解释灯光为什么让鸟困惑**——例如 \"They get lost.\" / \"They think it's daylight.\"（它们迷路 / 以为是白天）。\n\n### 🔎 关键定位 (Where to find it)\n- 空格前：灯光让鸟困惑。\n- 空格后：鸟看到灯光（继续描述具体反应）。\n- 空格 G 应该说明**灯光迷惑的具体表现**。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 没注意\"confuse → 后续具体反应\"的连续逻辑。\n\n### 🧠 一句口诀\n**灯光迷鸟需细说，confuse 后接表现**",
      knowledge_point: "七选五 · 强调句",
    },
    {
      id: "q30", type: "letter_choice", section: "restore",
      stem: "__30__ Many office buildings now turn off their lights at night...",
      answer: "B",
      explanation: "### 📖 答案是 **B**\n空格 30 是新段落开头。空格 30 后：\"Many office buildings now turn off their lights at night...\"（很多办公楼晚上关灯）—— 描述**解决办法**。\n\n倒推：空格 30 应该是**介绍解决方案的总述句**——例如 \"There are things we can do to help.\"（有些办法可以帮忙）。\n\n### 🔎 关键定位 (Where to find it)\n- 空格 30 是**新段落开头**——通常是**总括句**。\n- 后文是具体办法（关灯）→ 空格应该是**总括\"采取行动\"**的句子。\n\n### 🧱 题型分析 (Question Type)\n- 段落开头题——空格在新段落首句，承担**总括 / 主题句**功能。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 没意识到这是段落开头。**段落首句通常是总括 / 主题句**。\n\n### 🧠 一句口诀\n**新段落开头总括，解决方案先点题**",
      knowledge_point: "七选五 · 主题句",
    },

    /* ====== 第四部分 词汇运用 第一节 31-38 ====== */
    {
      id: "q31", type: "fill_blank", section: "vocab_fill",
      stem: "Suzhou is very attractive with different kinds of ancient ___ (桥).",
      answer: "bridges",
      explanation: "### 📖 答案是 **bridges**\n\"苏州有不同的古**桥**\"——提示词\"桥\" + 空格前有 different kinds of（暗示**复数**）→ **bridges**（复数）。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **bridge** (n.) = 桥；**bridges** (复数) = 桥。\n- **ancient bridges** = 古桥。\n- 例句：*Suzhou is famous for its beautiful ancient bridges.* 苏州以美丽的古桥闻名。\n\n### 🧱 语法 / 句法 (Grammar)\n- 名词复数题。判定钥匙：**different kinds of + 复数名词**——固定搭配。\n- 复数规则：bridge 以 -e 结尾 + s = **bridges**。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 写单数 bridge——different kinds of 后必须是复数。\n- 拼写错：写成 brigdes / brideges——正确 **bridges**。\n\n### 🧠 一句口诀\n**different kinds of 复数，bridges 加 s**",
      knowledge_point: "名词复数",
    },
    {
      id: "q32", type: "fill_blank", section: "vocab_fill",
      stem: "His parents hope he can follow his heart when he ___ (选择) his job.",
      answer: "chooses",
      explanation: "### 📖 答案是 **chooses**\n\"他爸妈希望他选工作时听从内心\"——主语 he（第三单）+ 一般现在时 → **chooses**（choose 三单）。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **choose** (v.) = 选择；**chooses** = 三单形式；**chose** = 过去式；**chosen** = 过去分词。\n- 例句：*She chooses her words carefully.* 她说话很谨慎。\n\n### 🧱 语法 / 句法 (Grammar)\n- 主谓一致题。主语 he（第三单）+ 一般现在时 → 加 **-es**（choose 以 e 结尾 + s = chooses，注意不是双 e）。\n- 实际是 choose + s = chooses（不是加 es，因为 e 已有）。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 写原形 choose——三单必须加 s。\n- 拼写：chose（过去式）和 chooses（现在三单）混用——本句一般现在时用 chooses。\n\n### 🧠 一句口诀\n**三单加 s，chooses 不是 chose**",
      knowledge_point: "时态 + 主谓一致",
    },
    {
      id: "q33", type: "fill_blank", section: "vocab_fill",
      stem: "Asking questions is one of the ___ (最容易) ways to lead you to active learning.",
      answer: "easiest",
      explanation: "### 📖 答案是 **easiest**\n\"提问是引导你主动学习的**最容易的**方式之一\"——**one of the + 最高级 + 复数名词** 是固定结构。easy → easiest（变 y 为 i 加 est）。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **easy** = 容易的；**easier** = 比较级；**easiest** = 最高级。\n- **one of the + 最高级 + 复数名词** = 最……之一（高频结构）。\n- 例句：*This is one of the easiest exercises in the book.* 这是书中最容易的练习之一。\n\n### 🧱 语法 / 句法 (Grammar)\n- 最高级题。判定钥匙：**one of the ___ ways**——空格必须是最高级 + the（前已有 the）。\n- easy 的最高级变化：以辅音 + y 结尾 → **去 y 加 iest** = easiest。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 写比较级 easier——one of the 后必须是最高级。\n- 拼写错：写成 easyest（保留 y）——错。辅音 + y 必须变 i。\n\n### 🧠 一句口诀\n**one of the 接最高级，y 改 i 加 est**",
      knowledge_point: "形容词最高级",
    },
    {
      id: "q34", type: "fill_blank", section: "vocab_fill",
      stem: "The Tiangong space station is the ___ (骄傲) of all Chinese.",
      answer: "pride",
      explanation: "### 📖 答案是 **pride**\n\"天宫空间站是所有中国人的**骄傲**\"——空格在 the ___ of 之间，需要**名词** pride（骄傲，名词）。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **pride** (n.) = 骄傲（名词）；**proud** (adj.) = 骄傲的；**proudly** (adv.) = 自豪地。\n- **be the pride of sb** = 是某人的骄傲。\n- 例句：*Her son is the pride of the family.* 她儿子是家里的骄傲。\n\n### 🧱 语法 / 句法 (Grammar)\n- 词性转换题。判定钥匙：**the ___ of** 之间是**名词槽**——必须用名词 pride，不是形容词 proud。\n- 派生关系：proud (adj.) ↔ pride (n.)。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 写成 proud（形容词）——the 后面必须是名词，不是形容词。\n- 拼写：pride 不是 pried（这是 pry 的过去式，含义完全不同）。\n\n### 🧠 一句口诀\n**the ___ of 是名词槽，pride 不是 proud**",
      knowledge_point: "词性转换 (形→名)",
    },
    {
      id: "q35", type: "fill_blank", section: "vocab_fill",
      stem: "It's necessary for teenagers to learn how to spend their pocket money ___ (明智地).",
      answer: "wisely",
      explanation: "### 📖 答案是 **wisely**\n\"青少年学会**明智地**花零花钱\"——修饰动词 spend，需要**副词** wisely。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **wise** (adj.) = 明智的；**wisely** (adv.) = 明智地。\n- **spend money wisely** = 明智地花钱（固定搭配）。\n- 例句：*Use your time wisely.* 明智地使用你的时间。\n\n### 🧱 语法 / 句法 (Grammar)\n- 副词题。判定钥匙：修饰**动词** spend → 用副词。\n- 派生规则：wise (adj.) + ly = wisely (adv.)。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 写成 wise（形容词）——形容词不修饰动词。\n- 拼写：wisely 不是 wizely / wisly——正确 **wisely**（wise + ly）。\n\n### 🧠 一句口诀\n**修饰动词用副词，wise 加 ly 成 wisely**",
      knowledge_point: "词性转换 (形→副)",
    },
    {
      id: "q36", type: "fill_blank", section: "vocab_fill",
      stem: "The doctor's advice on keeping healthy is w___ taking.",
      answer: "worth",
      explanation: "### 📖 答案是 **worth**\n\"医生的建议**值得**听取\"——首字母 w + 表\"值得\" = **worth**。**be worth + doing** 是固定搭配。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **worth** (adj.) = 值得的；**worth + doing** = 值得做……。\n- **be worth taking** = 值得采纳。\n- 例句：*This book is worth reading.* 这本书值得读。\n\n### 🧱 语法 / 句法 (Grammar)\n- 词义 + 搭配题。判定钥匙：**w + 值得** = worth。\n- 注意 worth 是形容词但**后接动名词**（doing），不是不定式（to do）：\n  - ✅ worth taking / worth reading\n  - ❌ worth to take / worth to read\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 写成 worth to take——worth 后接 doing，不接 to do。\n- 拼写：worth 不是 wirth / woth——正确 **worth**（w + or + th）。\n\n### 🧠 一句口诀\n**worth doing 是搭配，不接 to do**",
      knowledge_point: "be worth doing 句型",
    },
    {
      id: "q37", type: "fill_blank", section: "vocab_fill",
      stem: "Kate has p___ her bedroom blue because the colour brings peace to her mind and body.",
      answer: "painted",
      explanation: "### 📖 答案是 **painted**\n\"Kate 把卧室**刷成**蓝色\"——首字母 p + 现在完成时 (has + 过去分词) → **painted**（paint 的过去分词）。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **paint** (v.) = 油漆、涂色、画画。\n- **paint sth + 颜色** = 把某物涂成某色。\n- **painted** = 过去式 + 过去分词。\n- 例句：*She painted the wall white.* 她把墙刷成白色。\n\n### 🧱 语法 / 句法 (Grammar)\n- 现在完成时题。判定钥匙：句中 **has** + 过去分词 → painted（规则动词加 -ed）。\n- paint + 名词 + 颜色 = **使……变成某色**。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 写原形 paint——has 后必须是过去分词。\n- 写成 painting（进行时）——这里强调\"已经完成\"，用完成时。\n- 拼写错：painted 不是 painded / paintted——正确 **painted**。\n\n### 🧠 一句口诀\n**has 加过去分词，painted 完成时**",
      knowledge_point: "现在完成时 + paint sth + colour",
    },
    {
      id: "q38", type: "fill_blank", section: "vocab_fill",
      stem: "You can't make much progress in study without m___ your time well.",
      answer: "managing",
      explanation: "### 📖 答案是 **managing**\n\"不会**管理**时间就不能取得进步\"——首字母 m + 介词 without 后接动名词 → **managing**（manage 的 ing 形式）。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **manage** (v.) = 管理、设法；**manage + 名词** = 管理某物。\n- **manage your time** = 管理你的时间。\n- **without + doing** = 不做……就……\n- 例句：*Without managing time well, you can't be productive.* 不好好管理时间就不能高效工作。\n\n### 🧱 语法 / 句法 (Grammar)\n- 动名词题。判定钥匙：**介词 without 后必接动名词 (-ing)**。\n- manage + ing 规则：以辅音 + e 结尾 → 去 e 加 ing = **managing**。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 写原形 manage——介词后必须 -ing。\n- 拼写错：写成 manageing（保留 e）——错。manage 以 -e 结尾 → 去 e 加 ing = **managing**。\n\n### 🧠 一句口诀\n**without 后接 ing，manage 去 e 加 ing**",
      knowledge_point: "介词 + 动名词",
    },

    /* ====== 第四部分 词汇运用 第二节 39-43 ====== */
    {
      id: "q39", type: "fill_blank", section: "vocab_bank",
      stem: "But I had no interest in cooking at all ___ I met with a cooking app.",
      answer: "until",
      explanation: "### 📖 答案是 **until**\n\"我对做饭没兴趣，**直到**遇见做饭 app\"——**until** 表示\"直到……之前\"，引导**转折点**。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **until** = 直到……（连词 / 介词）。\n- **not...until...** = 直到……才……（高频搭配）。\n- 例句：*I didn't know the truth until yesterday.* 我直到昨天才知道真相。\n\n### 🧱 语法 / 句法 (Grammar)\n- 时间连词题。判定钥匙：句意是\"以前没兴趣，现在有了\"——这是个**转折点**，用 until。\n- 完整结构：**no interest at all until + 转折事件** = \"没兴趣，直到……发生\"。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 把 until 用反。**until 表\"直到某时间点\"**——本句的转折点是\"遇见 app\"。\n- 不知道 \"had no interest...until\" 是经典否定+ until 句式。\n\n### 🧠 一句口诀\n**not...until 直到才，转折点用 until**",
      knowledge_point: "连词 until",
    },
    {
      id: "q40", type: "fill_blank", section: "vocab_bank",
      stem: "They offer detailed instructions ___ users can follow them step by step.",
      answer: "so that",
      explanation: "### 📖 答案是 **so that**\n\"它们提供详细说明，**以便**用户可以一步步跟着做\"——表**目的**用 **so that**（以便、为了）。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **so that** = 以便、为了（引导目的状语从句）。\n- **in order that** = 同义；**in order to + do** = 也表目的。\n- 例句：*She speaks slowly so that everyone can understand.* 她说话慢以便人人都能听懂。\n\n### 🧱 语法 / 句法 (Grammar)\n- 目的连词题。判定钥匙：上下两句是**目的关系**——提供说明（手段）+ 用户能跟做（目的）。\n- so that + 完整从句（主语 + 谓语）。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 把 so that 和 so 弄混。**so 表\"所以\"（结果）**，**so that 表\"以便\"（目的）**——区别很重要。\n- 漏掉 that：写成 \"so users can follow\" 也通顺但**so 在这里是\"所以\"**，少了\"以便\"的目的感。\n\n### 🧠 一句口诀\n**目的连词 so that，区别 so 表结果**",
      knowledge_point: "目的状语从句 so that",
    },
    {
      id: "q41", type: "fill_blank", section: "vocab_bank",
      stem: "When I ___, it was exactly what I wanted and tasted delicious.",
      answer: "finished",
      explanation: "### 📖 答案是 **finished**\n\"我**做完**时，味道正好\"——从词库选**动词过去式**（when 引导的时间状语，主句用过去时）→ **finished**。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **finish** (v.) = 完成；**finished** = 过去式。\n- **when I finished** = 当我做完时。\n- 例句：*When I finished cooking, the family was waiting.* 我做完饭时，家人在等。\n\n### 🧱 语法 / 句法 (Grammar)\n- 时态题。判定钥匙：主句 was（过去时）+ when 从句也用过去时一致。\n- finished 既可作动词过去式，也可作形容词（完成的）。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 写原形 finish——when 从句需要时态与主句一致。\n- 拼写错：finished 不是 finshed / finished（注意 sh + ed）。\n\n### 🧠 一句口诀\n**when 从句过去时，finished 配 was**",
      knowledge_point: "一般过去时",
    },
    {
      id: "q42", type: "fill_blank", section: "vocab_bank",
      stem: "Now I can cook a couple of ___.",
      answer: "dishes",
      explanation: "### 📖 答案是 **dishes**\n\"现在我能做几道**菜**\"——**a couple of**（几个）后必接**可数复数名词** → **dishes**（dish 的复数）。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **dish** (n.) = 菜肴、盘子；**dishes** (复数) = 几道菜。\n- **a couple of** = 几个、一对（后接复数）。\n- 例句：*She can cook a couple of Italian dishes.* 她能做几道意大利菜。\n\n### 🧱 语法 / 句法 (Grammar)\n- 名词复数题。判定钥匙：**a couple of + 复数**——固定搭配。\n- 复数规则：dish 以 -sh 结尾 + es = **dishes**。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 写单数 dish——a couple of 后必复数。\n- 拼写错：写成 dishs（漏 e）——错。**sh 结尾加 -es**，不是 -s。\n\n### 🧠 一句口诀\n**a couple of 接复数，sh 结尾加 es**",
      knowledge_point: "可数名词复数 + a couple of",
    },
    {
      id: "q43", type: "fill_blank", section: "vocab_bank",
      stem: "It seems that I ___ cooking.",
      answer: "have a gift for",
      explanation: "### 📖 答案是 **have a gift for**\n\"我似乎**有做饭的天赋**\"——**have a gift for + 名词/动名词** = \"有……天赋\"。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **have a gift for sth** = 有……方面的天赋。\n- **gift** = 礼物、天赋（双重含义）。\n- 例句：*She has a gift for music.* 她有音乐天赋。\n\n### 🧱 语法 / 句法 (Grammar)\n- 短语题。判定钥匙：句意\"似乎天生会做饭\" → have a gift for。\n- 结构：have + a + gift + for + 名词。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 不熟悉 **gift = 天赋** 的含义。gift 不只是礼物——指**天生的能力**。\n- 介词错：写成 have a gift in / of——固定搭配是 **for**。\n\n### 🧠 一句口诀\n**天赋 a gift for，介词不能错**",
      knowledge_point: "短语 have a gift for",
    },

    /* ====== 第五部分 短文填空 44-53 ====== */
    {
      id: "q44", type: "fill_blank", section: "passage_fill",
      stem: "Hurricanes have winds that move in ___ circle.",
      answer: "a",
      explanation: "### 📖 答案是 **a**\n\"飓风的风**做圆周**运动\"——**in a circle** = \"成一个圆\"（固定搭配，单数可数名词前用 a）。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **circle** (n.) = 圆、圈。\n- **move in a circle** = 做圆周运动（固定搭配）。\n- 例句：*The dancers moved in a circle.* 舞者做圆周运动。\n\n### 🧱 语法 / 句法 (Grammar)\n- 冠词题。判定钥匙：单数可数名词 circle 前 + 首次提到 → 用不定冠词 **a**。\n- circle 以辅音 c 开头 → 用 a（不是 an）。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 漏冠词——单数可数必须有 a/an。\n- 写成 an——circle 以辅音开头，用 **a**。\n\n### 🧠 一句口诀\n**in a circle 是搭配，单数名词加 a**",
      knowledge_point: "冠词 a/an",
    },
    {
      id: "q45", type: "fill_blank", section: "passage_fill",
      stem: "Hurricane winds are very ___ (power), and can move at speeds from 120 km/h...",
      answer: "powerful",
      explanation: "### 📖 答案是 **powerful**\n\"飓风风力非常**强**\"——提示词 power（名词）+ 空格在 very 之后（修饰名词必形容词）→ **powerful**（power 的形容词）。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **power** (n.) = 力量；**powerful** (adj.) = 强大的。\n- 后缀 -ful：power + ful = 强大的。\n- 同类：useful, helpful, beautiful, careful。\n- 例句：*The wind is so powerful it can break trees.* 风力如此强大能折断树。\n\n### 🧱 语法 / 句法 (Grammar)\n- 词性转换题。判定钥匙：**very + ___** 后必接形容词或副词。\n- power（名词）→ powerful（形容词）。\n- be + very + 形容词 = 系表结构。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 写原形 power（名词）——very 后必须形容词。\n- 拼写错：写成 powerfull（两个 l）——只有**一个 l**。\n\n### 🧠 一句口诀\n**very 后接形容词，power 加 ful 是 powerful**",
      knowledge_point: "词性转换 (名→形)",
    },
    {
      id: "q46", type: "fill_blank", section: "passage_fill",
      stem: "Winds in the eye ___ (be) not very strong.",
      answer: "are",
      explanation: "### 📖 答案是 **are**\n\"飓风眼中的风**不**很强\"——主语 Winds（复数）+ 一般现在时陈述事实 → **are**。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **be 动词**：am / is / are（现在）；was / were（过去）。\n- 主谓一致：单数 → is，复数 → are。\n- 例句：*Winds in the eye are gentle.* 飓风眼内的风温和。\n\n### 🧱 语法 / 句法 (Grammar)\n- 主谓一致 + 时态题。判定钥匙：\n  1. 主语 Winds 是**复数**（s 结尾）。\n  2. 时态是**一般现在时**（陈述科学事实）。\n  → **are**（不是 is / was / were）。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 写成 is——winds 是复数，不能用 is。\n- 写过去时 were——科学事实用现在时。\n\n### 🧠 一句口诀\n**Winds 复数用 are，事实陈述现在时**",
      knowledge_point: "主谓一致",
    },
    {
      id: "q47", type: "fill_blank", section: "passage_fill",
      stem: "The wall is where winds are the ___ (strong) and rain is the heaviest.",
      answer: "strongest",
      explanation: "### 📖 答案是 **strongest**\n\"风墙是风**最强**的地方\"——空格前有 **the** + 后文有 the heaviest（最高级）并列 → 必用**最高级** strongest。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **strong** = 强的；**stronger** = 比较级；**strongest** = 最高级。\n- **the + 最高级** = 最……。\n- 例句：*This is the strongest tea I've ever had.* 这是我喝过最浓的茶。\n\n### 🧱 语法 / 句法 (Grammar)\n- 最高级题。判定钥匙：\n  1. 空格前 **the** —— 最高级前需要 the。\n  2. 后文 **the heaviest**（最高级并列）—— 提示空格也是最高级。\n- strong 的最高级：直接 + est = **strongest**。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 写比较级 stronger——前面有 the，必须是最高级。\n- 拼写错：写成 stronguest——错。直接加 est = strongest。\n\n### 🧠 一句口诀\n**the 接最高级，strongest 配 heaviest**",
      knowledge_point: "形容词最高级",
    },
    {
      id: "q48", type: "fill_blank", section: "passage_fill",
      stem: "Hurricane winds can be strong enough to break ___ (window) into pieces.",
      answer: "windows",
      explanation: "### 📖 答案是 **windows**\n\"飓风风力大到能**把窗户吹碎成片**\"——提示词 window（单数）+ 实际语境是**多扇窗户** → **windows**（复数）。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **window** = 窗户；**windows** = 复数。\n- **break sth into pieces** = 把……打碎。\n- 例句：*The strong wind broke many windows.* 大风吹碎了很多窗户。\n\n### 🧱 语法 / 句法 (Grammar)\n- 名词复数题。判定钥匙：飓风通常吹碎**多扇**窗户，不是单扇——用复数。\n- window 加 -s = windows。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 写单数 window——飓风规模大，多扇窗户被破坏。\n- 拼写错：写成 windowes / windowses——错。直接加 -s。\n\n### 🧠 一句口诀\n**多扇窗户 windows，复数加 s**",
      knowledge_point: "名词复数",
    },
    {
      id: "q49", type: "fill_blank", section: "passage_fill",
      stem: "Strong winds can pick up objects and send ___ (they) into the air...",
      answer: "them",
      explanation: "### 📖 答案是 **them**\n\"强风能拿起物体并**把它们**抛向空中\"——提示词 they → **them**（宾格）。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **they** (主格) → **them** (宾格)。\n- 宾格用法：作动词或介词的宾语。\n- 例句：*Send them home.* 把他们送回家。\n\n### 🧱 语法 / 句法 (Grammar)\n- 代词格题。判定钥匙：send 是及物动词，后接宾语——必须用**宾格** them。\n- they 在主语位置；them 在宾语位置。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 写成 they——they 是主格，不能作宾语。\n- 写成 their / theirs（物主代词）——本题需要宾格 them。\n\n### 🧠 一句口诀\n**作宾语用 them，they 是主格**",
      knowledge_point: "代词宾格",
    },
    {
      id: "q50", type: "fill_blank", section: "passage_fill",
      stem: "Heavy rain from a hurricane can cause floods in areas that are not close ___ a coast.",
      answer: "to",
      explanation: "### 📖 答案是 **to**\n\"飓风暴雨能造成不靠近海岸的地区也发洪水\"——**be close to** = 靠近（固定搭配），介词是 **to**。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **close to** = 靠近、接近（固定介词搭配）。\n- 同类搭配：near to / next to / according to / belong to。\n- 例句：*Our school is close to the park.* 我们学校靠近公园。\n\n### 🧱 语法 / 句法 (Grammar)\n- 介词搭配题。判定钥匙：**close + to** 是固定搭配——表\"接近\"。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 写成 close in / close at——错。close 永远配 **to**。\n- 把 close 和 closed（已关闭的）混淆——本题 close 是形容词\"近的\"。\n\n### 🧠 一句口诀\n**close 靠近配 to，固定介词搭配**",
      knowledge_point: "be close to 搭配",
    },
    {
      id: "q51", type: "fill_blank", section: "passage_fill",
      stem: "It sometimes ___ (reach) almost up to the top of houses.",
      answer: "reaches",
      explanation: "### 📖 答案是 **reaches**\n\"它有时**几乎到达**房顶\"——主语 It（第三单）+ 一般现在时（sometimes 提示）→ **reaches**（reach + es）。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **reach** (v.) = 到达、伸手够到。\n- **reaches** = 三单形式（以 -ch 结尾，加 -es）。\n- 例句：*The flood reaches up to the windows.* 洪水到达窗户。\n\n### 🧱 语法 / 句法 (Grammar)\n- 主谓一致题。判定钥匙：\n  1. **sometimes** = 一般现在时标志。\n  2. 主语 It（第三单）+ 现在时 → 动词加 -s。\n  3. reach 以 -ch 结尾 → 加 -es（reaches）。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 写原形 reach——三单必须加 s/es。\n- 写成 reachs（少 e）——错。**-ch 结尾必加 -es**，不是 -s。\n\n### 🧠 一句口诀\n**三单加 es，reach 加 es 成 reaches**",
      knowledge_point: "时态 + 主谓一致",
    },
    {
      id: "q52", type: "fill_blank", section: "passage_fill",
      stem: "Water goes into the houses ___ (quick) and does a lot of damage.",
      answer: "quickly",
      explanation: "### 📖 答案是 **quickly**\n\"水**迅速地**涌入房屋\"——提示词 quick（形容词）+ 空格修饰动词 goes → 用副词 **quickly**。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **quick** (adj.) = 快的；**quickly** (adv.) = 快速地。\n- 后缀 -ly：quick + ly = quickly。\n- 例句：*She ran quickly to catch the train.* 她飞快跑去赶火车。\n\n### 🧱 语法 / 句法 (Grammar)\n- 副词题。判定钥匙：修饰**动词** goes，必须用副词。\n- quick → quickly（直接 + ly）。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 写原形 quick——形容词不能修饰动词。\n- 拼写错：写成 quikly / quicly——正确 **quickly**（c + k + l + y）。\n\n### 🧠 一句口诀\n**修饰动词用副词，quick 加 ly 是 quickly**",
      knowledge_point: "词性转换 (形→副)",
    },
    {
      id: "q53", type: "fill_blank", section: "passage_fill",
      stem: "___ there is no way to prevent a hurricane, you can get prepared for it.",
      answer: "Although",
      explanation: "### 📖 答案是 **Although**\n\"**尽管**无法阻止飓风，你可以做准备\"——前后两句是**让步关系**（虽然 A，但 B）→ **Although**（虽然）。首字母大写，因为在句首。\n\n### 🔍 词汇 / 短语 (Vocabulary)\n- **although / though** = 尽管、虽然（让步连词）。\n- 同义：**even though**。\n- 例句：*Although it rained, we went out.* 虽然下雨，我们还是出门了。\n\n### 🧱 语法 / 句法 (Grammar)\n- 让步连词题。判定钥匙：\n  1. 前句\"无法阻止\"（负面情况）+ 后句\"可以准备\"（积极对策）→ 让步关系。\n  2. 用 although / though 引导。\n- 注意：although 和 but **不能同时出现**（中文有\"虽然……但是\"，英语二选一）。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 写成 But（句首大写）——although 已表\"虽然\"，不需要再加 but。\n- 大小写错：句首必须大写 **A**lthough。\n\n### 🧠 一句口诀\n**让步开头 Although，虽然但是只一个**",
      knowledge_point: "让步状语从句 Although",
    },

    /* ====== 第六部分 阅读表达 54-56 ====== */
    {
      id: "q54", type: "short_answer", section: "response",
      stem: "Why are libraries less popular than before?",
      answer: "Because people prefer to use the Internet to find out information rather than books.",
      explanation: "### 📖 参考答案 **Because people prefer to use the Internet to find information.**\n\"图书馆为何不如以前受欢迎？\"——主要原因是**人们用互联网代替了图书馆**找信息。\n\n### 🔎 文章定位 (Finding the Answer)\n原因题——找文中关于\"为什么不受欢迎\"的描述：\n- 原文应该提到：**互联网兴起 / 电子书普及 / 上网更方便** → 这些都使图书馆使用率下降。\n\n### 🔍 答题技巧 (Answering Tips)\n- 句型：**Because + 完整原因从句**。\n- 字数：1 句即可，抓核心原因。\n- 不抄整段——**提取关键信息整理成句**。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 抄整段。**简短回答只要 1 个核心原因**。\n- 用名词短语回答（写成 \"The Internet.\"）——要用完整句子。\n\n### 🧠 一句口诀\n**问 Why 答 Because，核心原因 1 句话**",
      knowledge_point: "阅读表达 · 原因题",
    },
    {
      id: "q55", type: "short_answer", section: "response",
      stem: "What activities can be organized in a library?",
      answer: "Poetry workshops, guitar lessons and writers visiting and talking about their books.",
      explanation: "### 📖 参考答案 **Poetry workshops, guitar lessons and writers visits can be organized.**\n\"图书馆可以举办什么活动？\"——从文中找具体例子：诗歌工作坊 / 吉他课 / 作家来访等。\n\n### 🔎 文章定位 (Finding the Answer)\n列举题——找文中**活动列表**：\n- Poetry workshops（诗歌工作坊）\n- Guitar lessons（吉他课）\n- Writers' visits（作家来访）\n\n提取出 2-3 个具体活动即可。\n\n### 🔍 答题技巧 (Answering Tips)\n- 列举至少 2-3 个具体活动。\n- 用 **and** 连接。\n- 句型：**X, Y and Z can be organized.** 或 **X, Y and Z.**（简短形式）。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 只写一个活动——题目用 activities（复数）暗示**多个**。\n- 抄整段。**列举关键名词即可**。\n\n### 🧠 一句口诀\n**activities 是复数，列举至少 2-3 个**",
      knowledge_point: "阅读表达 · 列举题",
    },
    {
      id: "q56", type: "short_answer", section: "response",
      stem: "What type of book would you like to borrow from your school library? Why?",
      answer: "(开放题示例) I would like to borrow science fiction books because they inspire my imagination and develop my creativity.",
      explanation: "### 📖 参考答案 (开放) **I would like to borrow science fiction books, because they spark my imagination and let me explore the future.**\n**开放题**——选一类书 + 给具体理由。\n\n### 🔎 答题思路 (How to Approach)\n**两步法**：\n1. **选一类书**：science fiction / detective / history / biography / classics / picture books / fantasy 等。\n2. **说理由**：扣紧**这类书的特点 + 对自己的意义**。\n\n**可选答法示例**：\n- *I would like to borrow **detective novels**, because they train my logical thinking.*（侦探小说，训练逻辑）\n- *I would like to borrow **history books**, because they help me learn about the past.*（历史书，了解过去）\n- *I would like to borrow **science books**, because they help me understand how the world works.*（科学书，理解世界）\n\n### 🔍 答题技巧 (Answering Tips)\n- 句型：**I would like to borrow + 书类型, because + 理由**。\n- 字数：1-2 句。\n- 理由要**具体**，不是\"because they are good\"。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- 没说书类型——只写\"I like reading\"，不够具体。\n- 理由太空——\"because it is interesting\" 没说明哪里有趣。\n\n### 🧠 一句口诀\n**选书类 + 给理由，具体扣紧自我**",
      knowledge_point: "阅读表达 · 开放观点 + 理由",
    },

    /* ====== 第七部分 书面表达 57 ====== */
    {
      id: "q57", type: "essay", section: "writing",
      stem: "Practice makes perfect — 写一篇短文。要点：① 对该谚语的理解；② 你生活中的一个事例（运动/乐器/家务/学习等）；③ 你的感悟。词数 100 左右。",
      answer: `(参考范文)
Have you heard of the saying "practice makes perfect"? It means we can master a skill only through repeated practice. Talent matters, but it is hard work that turns ability into excellence.

Take playing the piano as an example. Two years ago, I could barely play a simple piece. My fingers were stiff and the rhythm was off. However, I decided to practise for half an hour every day. At first, progress seemed slow, but I kept going. After hundreds of hours of practice, I am now able to play several beautiful pieces and even performed at our school concert last term.

This experience taught me that nothing comes easy. Whenever I face new challenges, I remind myself: keep practising, and one day I will get there.`,
      explanation: "### 📖 写作要点 (Writing Tips)\n**话题**：Practice makes perfect（熟能生巧）—— 议论性叙事，结合理解 + 事例 + 感悟。\n\n### 🔎 必要要素 (Required Content)\n作文必须包含三点：\n1. **对谚语的理解**：解释\"熟能生巧\"的含义。\n2. **一个事例**：你的真实经历（运动 / 乐器 / 家务 / 学习等）。\n3. **你的感悟**：从这次经历学到了什么道理。\n\n### 🧱 写作结构 (Structure)\n**开头（理解谚语）**：\n- *Have you heard of the saying \"practice makes perfect\"? It means...*\n- *The Chinese saying \"practice makes perfect\" tells us that...*\n\n**正文（具体事例）**：\n- 选择**你熟悉**的一项技能（钢琴 / 篮球 / 书法 / 编程 / 烹饪）。\n- 描述**初期困难** → **持续练习** → **取得进步**的过程。\n- 用时间词：At first / However / After + 时间 / In the end。\n\n**结尾（感悟）**：\n- *This experience taught me that...*\n- *Whenever I face new challenges, I remind myself...*\n\n### 🔍 高频句型 (Useful Sentences)\n- *I could barely... at first.* 起初我几乎不会……\n- *I decided to practise for X minutes every day.* 我决定每天练习……\n- *After hundreds of hours of practice, I am now able to...* 经过几百小时练习，我现在能……\n- *Nothing comes easy.* 没有什么是容易的。\n- *Hard work turns ability into excellence.* 努力把能力变成卓越。\n\n### ⚠️ 学生常犯错误 (Common Mistakes)\n- **三点不齐全**：漏掉\"理解\"或\"感悟\"——必须三点齐备。\n- **事例不具体**：写成 \"I practised a lot and got better\"——没有时间、细节、进步幅度，太空泛。\n- **时态错乱**：理解部分用一般现在时；事例用过去时（描述经历）；感悟可以用现在时或现在完成时。\n- **字数不够**：要求 100 词左右，至少 80 词以上。\n\n### 🧠 一句口诀\n**理解 + 事例 + 感悟 = 三点齐全 = 高分**",
      knowledge_point: "书面表达 · 谚语类议论 + 记叙",
    },
  ],
};

export default SUZHOU_2022;
