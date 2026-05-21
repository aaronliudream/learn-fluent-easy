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
      explanation: "考点：动词词义辨析 + 上下文推断。空格前 'a deep love of the land' 表达对土地的热爱，热爱的对象自然会想去【保护】(protect)。A practise 练习、C prepare 准备、D provide 提供 均与'热爱土地'的逻辑不符。",
      knowledge_point: "动词词义辨析",
    },
    {
      id: "q2", type: "multiple_choice", section: "cloze",
      stem: "",
      options: { A: "weak", B: "tired", C: "relaxed", D: "angry" },
      answer: "D",
      explanation: "考点：形容词词义 + 情感推断。看到河流中漂浮垃圾，正常反应是【生气】(angry)。后文 'He knew he had to do something' 印证愤怒后产生行动。A weak 虚弱、B tired 疲倦、C relaxed 放松 都不符合看到污染时的合理情绪。",
      knowledge_point: "形容词词义辨析",
    },
    {
      id: "q3", type: "multiple_choice", section: "cloze",
      stem: "",
      options: { A: "clean up", B: "break into", C: "set up", D: "move into" },
      answer: "A",
      explanation: "考点：动词短语辨析。clean up = 清理；与上文 'rubbish' 呼应，他成立小组目的是【清理】乡村。B break into 闯入；C set up 建立；D move into 搬进。短语搭配题需结合宾语 the countryside 判断。",
      knowledge_point: "动词短语辨析",
    },
    {
      id: "q4", type: "multiple_choice", section: "cloze",
      stem: "",
      options: { A: "shy", B: "sad", C: "proud", D: "polite" },
      answer: "A",
      explanation: "考点：人物性格描写。后半句 'found it hard to speak out in public' 表明在公众面前讲话很难，这正是【害羞】(shy) 的人的典型特征。B sad、C proud、D polite 都与'难以公开发言'无直接因果关系。",
      knowledge_point: "性格形容词",
    },
    {
      id: "q5", type: "multiple_choice", section: "cloze",
      stem: "",
      options: { A: "clearly", B: "carefully", C: "successfully", D: "traditionally" },
      answer: "C",
      explanation: "考点：副词修饰动词。前文说他害羞、害怕公开发言，后文说他通过母亲帮助克服了恐惧，结果是【成功地】(successfully) 应对了恐惧。A clearly 清楚地、B carefully 仔细地、D traditionally 传统地，都不能体现'克服恐惧'的结果含义。",
      knowledge_point: "副词词义辨析",
    },
    {
      id: "q6", type: "multiple_choice", section: "cloze",
      stem: "",
      options: { A: "anything", B: "nothing", C: "something", D: "everything" },
      answer: "B",
      explanation: "考点：不定代词 + 句意理解。'When your heart is into it' 意为'心入其中时'，主句意为'没有什么能阻止你'，故用【nothing】。这是英语谚语式表达，强调坚定决心。A anything 任何东西、C something 某物、D everything 一切，均不符合谚语逻辑。",
      knowledge_point: "不定代词",
    },
    {
      id: "q7", type: "multiple_choice", section: "cloze",
      stem: "",
      options: { A: "accept", B: "change", C: "follow", D: "introduce" },
      answer: "D",
      explanation: "考点：动词词义。后文 'handed out leaflets and even appeared on radio and TV' 是【介绍/推广】(introduce) 想法的具体手段。A accept 接受、B change 改变、C follow 跟随，都与'把想法带到大众面前'的语义不匹配。",
      knowledge_point: "动词词义辨析",
    },
    {
      id: "q8", type: "multiple_choice", section: "cloze",
      stem: "",
      options: { A: "courage", B: "victory", C: "support", D: "reward" },
      answer: "C",
      explanation: "考点：名词词义。'win support from' 是固定搭配，意为'赢得……的支持'。前文'efforts paid off'(努力得到回报)，赢得的对象是 'several thousand people'，最合理的搭配是【支持】(support)。A courage 勇气、B victory 胜利、D reward 奖励，搭配 from 后接人不通顺。",
      knowledge_point: "名词词义辨析",
    },
    {
      id: "q9", type: "multiple_choice", section: "cloze",
      stem: "",
      options: { A: "wish", B: "chance", C: "luck", D: "fear" },
      answer: "A",
      explanation: "考点：上下文照应。本题与首段 'he had a strong wish to protect it' 形成首尾呼应，回到大学时代他【愿望/心愿】依然如初。B chance 机会、C luck 运气、D fear 恐惧，均不能与首段呼应。",
      knowledge_point: "篇章衔接 / 词义照应",
    },
    {
      id: "q10", type: "multiple_choice", section: "cloze",
      stem: "",
      options: { A: "busier", B: "harder", C: "better", D: "crazier" },
      answer: "C",
      explanation: "考点：比较级 + 上下文。他希望为孩子和孙辈创造【更好的】生活，与本文环保保护主题一致。A busier 更忙的、B harder 更艰难的、D crazier 更疯狂的，都与积极的人生愿景不符。",
      knowledge_point: "形容词比较级 / 语义匹配",
    },

    /* ====== 第二部分 阅读理解 11-25 ====== */
    /* Passage A — Music Festival */
    {
      id: "q11", type: "multiple_choice", section: "reading",
      stem: "If you are free on Sunday night, which concert can you attend?",
      options: { A: "Country music.", B: "Folk.", C: "Jazz.", D: "Rock." },
      answer: "D",
      explanation: "考点：海报信息细节查找。Country music 在 Thursday 7 PM；Folk 在 Friday 5 PM；Jazz 在 Saturday 6 PM；Rock 在 Sunday 7 PM。Sunday 晚上对应【Rock】。",
      knowledge_point: "应用文阅读 · 时间信息匹配",
    },
    {
      id: "q12", type: "multiple_choice", section: "reading",
      stem: "How much will Mr. Green pay if he goes to the country music concert with his two kids?",
      options: { A: "£10.", B: "£20.", C: "£30.", D: "£40." },
      answer: "B",
      explanation: "考点：数学计算 + 价格信息。Country music: Adults £10, Children £5。Mr. Green (1 成人) + 2 children = £10 + £5×2 = £20。",
      knowledge_point: "应用文阅读 · 价格计算",
    },
    {
      id: "q13", type: "multiple_choice", section: "reading",
      stem: "Which date is suitable for modern jazz lovers?",
      options: { A: "June 23.", B: "June 24.", C: "June 25.", D: "June 26." },
      answer: "C",
      explanation: "考点：标签信息 + 日期推理。Jazz 标签是 MODERN，Jazz 在 Saturday。海报日期 June 23 (Thursday) – June 26 (Sunday)，故 Saturday = June 25。",
      knowledge_point: "应用文阅读 · 日期推理",
    },

    /* Passage B — Yang Liheng */
    {
      id: "q14", type: "multiple_choice", section: "reading",
      stem: "What does Yang expect most during the Spring Festival?",
      options: { A: "Wearing new clothes.", B: "Having a big dinner.", C: "Taking a family photo.", D: "Visiting his relatives." },
      answer: "C",
      explanation: "考点：细节理解。第二段首句明确：'one of the long-expected activities during the Spring Festival is to take photos with family members'(春节最期待的活动之一就是和家人拍照)。",
      knowledge_point: "记叙文阅读 · 细节定位",
    },
    {
      id: "q15", type: "multiple_choice", section: "reading",
      stem: 'What does the underlined word "reunite" in paragraph 2 mean?',
      options: { A: "Get separated.", B: "Get much wealthier.", C: "Get improved.", D: "Get together again." },
      answer: "D",
      explanation: "考点：根据上下文猜词义。re- 前缀表'重新'，-unite 表'联合'。语境'the whole family reunite, he would dress up and wait for the photo'，全家'重新聚到一起'。D get together again 团聚 = reunite。",
      knowledge_point: "词义猜测 · 前缀分析",
    },
    {
      id: "q16", type: "multiple_choice", section: "reading",
      stem: "What is the main idea of paragraph 3?",
      options: { A: "When Yang was interviewed.", B: "Where Yang learnt to take photos.", C: "Why Yang had a painful childhood.", D: "What Yang recorded with his camera." },
      answer: "D",
      explanation: "考点：段落主旨。第三段核心句 'With his camera, Yang recorded the great changes of his hometown over time'，并展开介绍他记录的具体内容（local customs, scenes, people's spirit）。D 是对'用相机记录了什么'的概括。",
      knowledge_point: "记叙文阅读 · 段落主旨",
    },
    {
      id: "q17", type: "multiple_choice", section: "reading",
      stem: "What do we know about Yang's family?",
      options: { A: "It is full of love.", B: "It is full of mysteries.", C: "It is a rich family.", D: "It is having a hard time." },
      answer: "A",
      explanation: "考点：信息推断。第四段：孙子建议记录家庭，子孙'try their best to return home during the Spring Festival'(尽力春节回家团聚)，这些都体现了【家庭充满爱】。B mysteries 神秘、C rich 富裕、D hard time 困难时期，文中均无依据。",
      knowledge_point: "记叙文阅读 · 推断判断",
    },

    /* Passage C — Qinghai-Tibet Railway */
    {
      id: "q18", type: "multiple_choice", section: "reading",
      stem: "Where are the passengers?",
      options: { A: "On a bus.", B: "On a train.", C: "On a ship.", D: "On a plane." },
      answer: "B",
      explanation: "考点：场景判断。'All aboard'、'rail car'、'tunnel'、'leaving Qinghai Station'、'train to Tibet' 等多处线索都指向【火车】。",
      knowledge_point: "说明文阅读 · 场景判断",
    },
    {
      id: "q19", type: "multiple_choice", section: "reading",
      stem: "How does the text show the railway is amazing in paragraph 3?",
      options: { A: "By telling a story.", B: "By using a designer's words.", C: "By introducing its world records.", D: "By comparing the present with the past." },
      answer: "C",
      explanation: "考点：写作手法识别。第三段列出三个 world records：world's highest railway / world's highest tunnel / longest tunnel ever built on permafrost，通过【列举世界纪录】展示铁路之惊人。",
      knowledge_point: "说明文阅读 · 写作手法",
    },
    {
      id: "q20", type: "multiple_choice", section: "reading",
      stem: "How many oxygen systems are there in each rail car?",
      options: { A: "One.", B: "Two.", C: "Three.", D: "Four." },
      answer: "B",
      explanation: "考点：数字细节。第四段明确：'Each rail car has two separate oxygen systems'(每节车厢有两套独立的供氧系统)。",
      knowledge_point: "说明文阅读 · 数字细节",
    },
    {
      id: "q21", type: "multiple_choice", section: "reading",
      stem: "Which of the following increased the difficulty of building the railway?",
      options: { A: "The changing ground.", B: "The polluted air.", C: "The dangerous animals.", D: "The hot weather." },
      answer: "A",
      explanation: "考点：细节查找 + 同义改写。第五段第二个挑战 'permafrost, a type of ground that keeps changing as the weather warms and cools'(冻土——会随天气冷暖不断变化的地面) → A The changing ground 变化的地面。B polluted air 文中提到的是 not enough oxygen 缺氧而非污染；C dangerous animals 文中未提；D hot weather 与冻土相反。",
      knowledge_point: "说明文阅读 · 同义改写",
    },

    /* Passage D — Dave's marathon */
    {
      id: "q22", type: "multiple_choice", section: "reading",
      stem: "Why did Dave fail to join the school basketball team?",
      options: { A: "He couldn't run fast.", B: "He didn't work hard.", C: "He was not tall enough.", D: "He wasn't a quick learner." },
      answer: "C",
      explanation: "考点：细节定位 + 推断。首段：'When I was little, I was really little'(我小时候真的很矮小)，所以没能加入篮球队。爷爷后来说 'if you can't be big, you can do something big'，进一步印证身高问题。",
      knowledge_point: "记叙文阅读 · 细节推断",
    },
    {
      id: "q23", type: "multiple_choice", section: "reading",
      stem: 'What does the underlined word "it" in paragraph 4 refer to?',
      options: { A: "Adding an extra mile.", B: "Running on his birthday.", C: "Training for the marathon.", D: "Trying out for the basketball team." },
      answer: "B",
      explanation: "考点：代词指代。第四段 'I ran 12 miles on my 12th birthday. On my 13th birthday, I did it again'，it 指代上文整个行为'生日跑步'。B【生日跑步】最贴切。A 多跑一英里是 'added an extra mile' 的内容，是 'did it again' 之后的额外动作。",
      knowledge_point: "记叙文阅读 · 代词指代",
    },
    {
      id: "q24", type: "multiple_choice", section: "reading",
      stem: "Which of the following words best describes Grandpa?",
      options: { A: "Creative.", B: "Modest.", C: "Generous.", D: "Encouraging." },
      answer: "D",
      explanation: "考点：人物性格判断。爷爷的关键言行：'you can do something big'、'I promise to wait for you next year and cheer you on'、'you didn't fail. You discovered something'，都体现【鼓励】(encouraging) 的特质。A creative 富有创意、B modest 谦虚、C generous 慷慨，文中无直接体现。",
      knowledge_point: "记叙文阅读 · 人物形象",
    },
    {
      id: "q25", type: "multiple_choice", section: "reading",
      stem: "What is the best title for the text?",
      options: { A: "Dream Big", B: "The Boston Marathon", C: "Think Twice", D: "The Story of Grandpa" },
      answer: "A",
      explanation: "考点：标题概括。全文围绕主人公追逐梦想（先篮球后马拉松）展开，爷爷的话 'if you can't be big, you can do something big' 是文章核心，最合适的标题是【Dream Big】（敢于做大梦想）。B 只是其中一个事件；C 三思而行不符主题；D 爷爷的故事是支线。",
      knowledge_point: "记叙文阅读 · 标题归纳",
    },

    /* ====== 第三部分 信息还原 26-30 ====== */
    {
      id: "q26", type: "letter_choice", section: "restore",
      stem: "Why does this happen? __26__ Birds are flying into windows and tall buildings...",
      answer: "A",
      explanation: "考点：上下文逻辑。前句问 'Why does this happen?'，需要一个答语。空后给出原因 'birds flying into windows'。A 'The answer is glass.' 既回答了问题又引出下文玻璃话题，承上启下。",
      knowledge_point: "七选五 · 问答衔接",
    },
    {
      id: "q27", type: "letter_choice", section: "restore",
      stem: "...such as forests and wetlands. __27__ They might see small trees and flowers inside a window...",
      answer: "D",
      explanation: "考点：因果衔接。空前讲鸟生活在野外，空后讲鸟看到窗户内的植物想休息，故空格需要因果过渡。D 'As a result, they fly right into the glass.' 把'看到→飞向玻璃'的因果连起来。",
      knowledge_point: "七选五 · 因果连接",
    },
    {
      id: "q28", type: "letter_choice", section: "restore",
      stem: "...there is glass between them and the plants. __28__",
      answer: "C",
      explanation: "考点：段落总结句。空前讲鸟不知道有玻璃挡着，C 'These birds have no idea what glass is.'(这些鸟根本不知道玻璃是什么) 是对段落的总结升华。",
      knowledge_point: "七选五 · 总结句",
    },
    {
      id: "q29", type: "letter_choice", section: "restore",
      stem: "Tall buildings with lights on at night can confuse the birds. __29__ The birds see the light...",
      answer: "G",
      explanation: "考点：递进 / 强调。空前说夜晚高楼的灯会迷惑鸟，空后展开描述夜里灯光迷惑过程。G 'This is a big problem, especially on foggy and rainy nights.' 强调问题严重性，并引出'雾雨夜更甚'。",
      knowledge_point: "七选五 · 强调句",
    },
    {
      id: "q30", type: "letter_choice", section: "restore",
      stem: "__30__ Many office buildings now turn off their lights at night...",
      answer: "B",
      explanation: "考点：段首总起句。最后一段讲'办公楼晚上关灯减少鸟撞'，需要一个总起句。B 'People are trying to solve the problem.'(人们正在努力解决问题) 完美对应'采取关灯等具体措施'。",
      knowledge_point: "七选五 · 主题句",
    },

    /* ====== 第四部分 词汇运用 第一节 31-38 ====== */
    {
      id: "q31", type: "fill_blank", section: "vocab_fill",
      stem: "Suzhou is very attractive with different kinds of ancient ___ (桥).",
      answer: "bridges",
      explanation: "考点：名词单复数。different kinds of ancient ___ 表示多种古桥，bridge 是可数名词，与 different kinds of 搭配用复数 bridges。",
      knowledge_point: "名词复数",
    },
    {
      id: "q32", type: "fill_blank", section: "vocab_fill",
      stem: "His parents hope he can follow his heart when he ___ (选择) his job.",
      answer: "chooses",
      explanation: "考点：动词时态 + 主谓一致。when 引导时间状语从句，主句是希望(hope)，从句用一般现在时表将来。主语 he 第三人称单数，动词加 s → chooses。",
      knowledge_point: "时态 + 主谓一致",
    },
    {
      id: "q33", type: "fill_blank", section: "vocab_fill",
      stem: "Asking questions is one of the ___ (最容易) ways to lead you to active learning.",
      answer: "easiest",
      explanation: "考点：形容词最高级。one of the + 最高级 + 复数名词 是固定搭配。easy → easiest（去 y 加 iest）。",
      knowledge_point: "形容词最高级",
    },
    {
      id: "q34", type: "fill_blank", section: "vocab_fill",
      stem: "The Tiangong space station is the ___ (骄傲) of all Chinese.",
      answer: "pride",
      explanation: "考点：词性转换。the ___ of 处需要名词。骄傲 (n.) = pride；proud 是形容词，be proud of 才用 proud。",
      knowledge_point: "词性转换 (形→名)",
    },
    {
      id: "q35", type: "fill_blank", section: "vocab_fill",
      stem: "It's necessary for teenagers to learn how to spend their pocket money ___ (明智地).",
      answer: "wisely",
      explanation: "考点：词性转换。修饰动词 spend 需要副词。wise (adj.) → wisely (adv.)。",
      knowledge_point: "词性转换 (形→副)",
    },
    {
      id: "q36", type: "fill_blank", section: "vocab_fill",
      stem: "The doctor's advice on keeping healthy is w___ taking.",
      answer: "worth",
      explanation: "考点：首字母提示 + 固定搭配。be worth doing 意为'值得做……'。这里 advice is worth taking = 建议值得听取。",
      knowledge_point: "be worth doing 句型",
    },
    {
      id: "q37", type: "fill_blank", section: "vocab_fill",
      stem: "Kate has p___ her bedroom blue because the colour brings peace to her mind and body.",
      answer: "painted",
      explanation: "考点：现在完成时 + 动词。has + 过去分词；'把卧室刷成蓝色' = paint sth + 颜色，paint 的过去分词 painted。",
      knowledge_point: "现在完成时 + paint sth + colour",
    },
    {
      id: "q38", type: "fill_blank", section: "vocab_fill",
      stem: "You can't make much progress in study without m___ your time well.",
      answer: "managing",
      explanation: "考点：without + 动名词 + 首字母提示。介词 without 后接动名词；'管理时间' = manage your time，故 manage → managing。",
      knowledge_point: "介词 + 动名词",
    },

    /* ====== 第四部分 词汇运用 第二节 39-43 ====== */
    {
      id: "q39", type: "fill_blank", section: "vocab_bank",
      stem: "But I had no interest in cooking at all ___ I met with a cooking app.",
      answer: "until",
      explanation: "考点：连词。'我对烹饪没兴趣 ___ 我遇到这个 app'，前后是'从一直没兴趣到产生兴趣'的转折，用 until (直到……才)。had no interest ... until = 直到……才有兴趣。",
      knowledge_point: "连词 until",
    },
    {
      id: "q40", type: "fill_blank", section: "vocab_bank",
      stem: "They offer detailed instructions ___ users can follow them step by step.",
      answer: "so that",
      explanation: "考点：目的状语从句。'提供详细说明 ___ 用户可以一步步跟着做'，逻辑是目的，用 so that (以便)。",
      knowledge_point: "目的状语从句 so that",
    },
    {
      id: "q41", type: "fill_blank", section: "vocab_bank",
      stem: "When I ___, it was exactly what I wanted and tasted delicious.",
      answer: "finished",
      explanation: "考点：时态 + 动词原形选用。从句用一般过去时，因为主句是过去时 was。finish (完成) 的过去式 finished。",
      knowledge_point: "一般过去时",
    },
    {
      id: "q42", type: "fill_blank", section: "vocab_bank",
      stem: "Now I can cook a couple of ___.",
      answer: "dishes",
      explanation: "考点：名词复数。a couple of (几个) 后接可数名词复数。dish (菜肴) → dishes。",
      knowledge_point: "可数名词复数 + a couple of",
    },
    {
      id: "q43", type: "fill_blank", section: "vocab_bank",
      stem: "It seems that I ___ cooking.",
      answer: "have a gift for",
      explanation: "考点：短语搭配 + 主谓一致。have a gift for (在……方面有天赋) 是固定短语。It seems that I have a gift for cooking = 我似乎有烹饪天赋。主语 I 用 have 原形。",
      knowledge_point: "短语 have a gift for",
    },

    /* ====== 第五部分 短文填空 44-53 ====== */
    {
      id: "q44", type: "fill_blank", section: "passage_fill",
      stem: "Hurricanes have winds that move in ___ circle.",
      answer: "a",
      explanation: "考点：冠词。circle 是可数名词单数，首次提及'一个圈'，用不定冠词 a；circle 以辅音音素开头不用 an。",
      knowledge_point: "冠词 a/an",
    },
    {
      id: "q45", type: "fill_blank", section: "passage_fill",
      stem: "Hurricane winds are very ___ (power), and can move at speeds from 120 km/h...",
      answer: "powerful",
      explanation: "考点：词性转换。very + 形容词。power (n.) → powerful (adj.)。",
      knowledge_point: "词性转换 (名→形)",
    },
    {
      id: "q46", type: "fill_blank", section: "passage_fill",
      stem: "Winds in the eye ___ (be) not very strong.",
      answer: "are",
      explanation: "考点：主谓一致 + 时态。主语 Winds (复数) + 一般现在时陈述事实，be 动词用 are。",
      knowledge_point: "主谓一致",
    },
    {
      id: "q47", type: "fill_blank", section: "passage_fill",
      stem: "The wall is where winds are the ___ (strong) and rain is the heaviest.",
      answer: "strongest",
      explanation: "考点：形容词最高级。the + 最高级，且与 the heaviest 并列。strong → strongest。",
      knowledge_point: "形容词最高级",
    },
    {
      id: "q48", type: "fill_blank", section: "passage_fill",
      stem: "Hurricane winds can be strong enough to break ___ (window) into pieces.",
      answer: "windows",
      explanation: "考点：名词复数。表泛指'许多窗户被打碎'，可数名词用复数 windows。break ... into pieces 是固定搭配，into 后用 pieces。",
      knowledge_point: "名词复数",
    },
    {
      id: "q49", type: "fill_blank", section: "passage_fill",
      stem: "Strong winds can pick up objects and send ___ (they) into the air...",
      answer: "them",
      explanation: "考点：代词格。send 是及物动词，后接宾语，they 的宾格是 them。指代上文 objects。",
      knowledge_point: "代词宾格",
    },
    {
      id: "q50", type: "fill_blank", section: "passage_fill",
      stem: "Heavy rain from a hurricane can cause floods in areas that are not close ___ a coast.",
      answer: "to",
      explanation: "考点：介词搭配。be close to (靠近) 是固定搭配。not close to a coast = 不靠近海岸。",
      knowledge_point: "be close to 搭配",
    },
    {
      id: "q51", type: "fill_blank", section: "passage_fill",
      stem: "It sometimes ___ (reach) almost up to the top of houses.",
      answer: "reaches",
      explanation: "考点：主谓一致 + 时态。sometimes 提示一般现在时；主语 It (代指 floodwater) 第三人称单数，reach → reaches。",
      knowledge_point: "时态 + 主谓一致",
    },
    {
      id: "q52", type: "fill_blank", section: "passage_fill",
      stem: "Water goes into the houses ___ (quick) and does a lot of damage.",
      answer: "quickly",
      explanation: "考点：词性转换。修饰动词 goes，用副词。quick → quickly。",
      knowledge_point: "词性转换 (形→副)",
    },
    {
      id: "q53", type: "fill_blank", section: "passage_fill",
      stem: "___ there is no way to prevent a hurricane, you can get prepared for it.",
      answer: "Although",
      explanation: "考点：让步连词。前后两个分句构成让步关系'虽然没办法阻止飓风，但你可以做准备'，用 Although (虽然) / Though。开头大写 A。",
      knowledge_point: "让步状语从句 Although",
    },

    /* ====== 第六部分 阅读表达 54-56 ====== */
    {
      id: "q54", type: "short_answer", section: "response",
      stem: "Why are libraries less popular than before?",
      answer: "Because people prefer to use the Internet to find out information rather than books.",
      explanation: "考点：定位回答 'why'。文章第一段第二句直接给出原因：'because people prefer to use the Internet to find out information, rather than books'。回答用 Because 开头，复制核心句即可。",
      knowledge_point: "阅读表达 · 原因题",
    },
    {
      id: "q55", type: "short_answer", section: "response",
      stem: "What activities can be organized in a library?",
      answer: "Poetry workshops, guitar lessons and writers visiting and talking about their books.",
      explanation: "考点：定位 + 列举。第三段列出图书馆的活动：'poetry workshops or guitar lessons. Also, they may have writers visiting and talking about their books.'。用名词短语列举即可。",
      knowledge_point: "阅读表达 · 列举题",
    },
    {
      id: "q56", type: "short_answer", section: "response",
      stem: "What type of book would you like to borrow from your school library? Why?",
      answer: "(开放题示例) I would like to borrow science fiction books because they inspire my imagination and develop my creativity.",
      explanation: "考点：开放表达。需说明书的类型 + 给出理由。可写小说、传记、科普、漫画等任何题材；理由要具体（如：开阔视野 / 提升技能 / 减压放松等）。3 分题需要至少 2-3 句话，逻辑清晰。",
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
      explanation: `评分要点：
1. 内容完整 (5 分)：必须三点齐全 — 理解谚语、一个事例、感悟。
2. 语言准确 (10 分)：句式多样（含从句、被动等）；时态正确（现在/过去/现在完成）；用词准确不重复。
3. 篇章结构 (5 分)：开头-主体-总结清晰；逻辑连接词得当（however, in addition, as a result, finally）。
4. 字数 (5 分)：100 词左右（90-110 安全区）。
高分技巧：开门见山点题 + 用具体数字/时间增强真实感（"two years ago"、"half an hour every day"） + 结尾升华道理。
常见失分点：① 三要点写漏一点；② 用过于简单的句型（如全部 simple sentence）；③ 时态混乱（叙述事例时一般过去时和一般现在时混用）；④ 字数严重不足或超额。`,
      knowledge_point: "书面表达 · 谚语类议论 + 记叙",
    },
  ],
};

export default SUZHOU_2022;
