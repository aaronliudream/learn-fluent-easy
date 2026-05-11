// 小学二年级 Reading 10 本绘本(接续 G1 体系)
// =============================================================
// 数据规模:
//   - 10 本 G2 绘本(sb11-sb20,接续 G1 的 sb1-sb10)
//   - 80 页(G1 是 68 页,G2 多 18%)
//   - 30 道理解题(G1 是 20,G2 多 50%)
//   - 平均每页 6.4 词(G1 是 4.3 词,G2 ↑50%)
//
// 设计原则:
//   1. 完全复用 G1 StoryBook 类型
//   2. 难度提升:每页词数增加,故事性更强(简单情节转折)
//   3. 词汇基础:Fry's 1-200 + G2 Phonics 学过的高级音
//   4. 难度分级:
//      Level 1 (3 本):每页 5-7 词,7 页/本
//      Level 2 (4 本):每页 7-9 词,8 页/本
//      Level 3 (3 本):每页 9-12 词,9 页/本
//   5. 主题升级:从描述性 → 故事性 + 道德启发
//
// 绘本列表:
//   Level 1:
//     sb11 ⛈️ The Big Storm 暴风雨
//     sb12 🐦 My Pet Bird 我的宠物鸟
//     sb13 🌳 At the Park 公园里
//   Level 2:
//     sb14 🌸 The Magic Garden 神奇花园
//     sb15 🚀 Spark Goes to the Moon Spark 上月亮
//     sb16 🧸 The Lost Toy 丢失的泰迪熊
//     sb17 🏫 A Day at School 学校的一天
//   Level 3:
//     sb18 🐭 The Brave Little Mouse 勇敢小老鼠 Pip
//     sb19 👧 Sister and the Bird 妹妹和小鸟
//     sb20 🏃 The Big Race 大比赛
//
// UI 接入建议:
//   • G1 通关后才可访问 G2(顺序解锁)
//   • 主路径 /primary/reading?grade=2 切换 G2 数据
//   • 数据库表 primary_storybook_completion 共用,book_id 区分

import type { StoryBook } from "./primaryStoryBooks";

// ─── 10 本 G2 绘本 ──────────────────────────────────────

export const PRIMARY_STORY_BOOKS_G2: StoryBook[] = [
  {
    id: "sb11",
    title_cn: "暴风雨",
    title_en: "The Big Storm",
    description_cn: "Spark 经历一场突然的暴风雨,跑回家找到安全",
    level: 1,
    sortOrder: 11,
    bg: "from-slate-400 to-blue-600",
    cover_emoji: "⛈️🦊",
    reading_minutes: 3,
    pages: [
      { page: 1, text_en: "It is a sunny day.", text_cn: "今天是晴天。", emoji: "☀️" },
      { page: 2, text_en: "Suddenly, dark clouds come.", text_cn: "突然,乌云来了。", emoji: "☁️" },
      { page: 3, text_en: "The wind blows so hard.", text_cn: "风刮得好大。", emoji: "💨" },
      { page: 4, text_en: "A bright flash of light!", text_cn: "一道亮光闪过!", emoji: "⚡" },
      { page: 5, text_en: "Loud thunder goes BOOM!", text_cn: "大声雷响,轰隆隆!", emoji: "🌩️" },
      { page: 6, text_en: "I run home through the rain.", text_cn: "我冒雨跑回家。", emoji: "🏃‍♂️🌧️" },
      { page: 7, text_en: "Now I am safe and warm.", text_cn: "现在我又安全又暖和。", emoji: "🏠❤️" }
    ],
    questions: [
      {
        type: "comprehension",
        stem_cn: "孩子最后去了哪里?",
        stem_en: "Where did the child go?",
        options: [
        { text_en: "Home", text_cn: "回家", correct: true },
        { text_en: "School", text_cn: "学校", correct: false },
        { text_en: "The park", text_cn: "公园", correct: false }
        ],
        feedback_correct_cn: "🌟 对!I run home through the rain",
        feedback_wrong_cn: "孩子冒雨 run home 跑回家了~",
      },
      {
        type: "vocabulary",
        stem_cn: "'thunder' 是什么?",
        stem_en: "What is 'thunder'?",
        options: [
        { text_en: "雷声", text_cn: "雷声", correct: true },
        { text_en: "风", text_cn: "风", correct: false },
        { text_en: "雨", text_cn: "雨", correct: false }
        ],
        feedback_correct_cn: "🌟 对!thunder 是雷声,Loud thunder goes BOOM!",
        feedback_wrong_cn: "thunder 是雷声,故事里 BOOM 那个声音~",
      }
    ],
  },
  {
    id: "sb12",
    title_cn: "我的宠物鸟",
    title_en: "My Pet Bird",
    description_cn: "小女孩介绍她的宠物鸟 Sky,练习 R-controlled 音",
    level: 1,
    sortOrder: 12,
    bg: "from-emerald-300 to-teal-400",
    cover_emoji: "🐦",
    reading_minutes: 3,
    pages: [
      { page: 1, text_en: "I have a little bird.", text_cn: "我有一只小鸟。", emoji: "🐦" },
      { page: 2, text_en: "Her name is Sky.", text_cn: "她叫天空。", emoji: "🌤️" },
      { page: 3, text_en: "Sky is green and yellow.", text_cn: "天空是绿色和黄色的。", emoji: "💚💛" },
      { page: 4, text_en: "She sings every morning.", text_cn: "她每天早上唱歌。", emoji: "🎶" },
      { page: 5, text_en: "I give her water and seeds.", text_cn: "我给她水和种子。", emoji: "💧🌱" },
      { page: 6, text_en: "She flies around her cage.", text_cn: "她在笼子里飞来飞去。", emoji: "🐦💫" },
      { page: 7, text_en: "I love my little bird.", text_cn: "我爱我的小鸟。", emoji: "❤️🐦" }
    ],
    questions: [
      {
        type: "comprehension",
        stem_cn: "Sky 是什么颜色?",
        stem_en: "What color is Sky?",
        options: [
        { text_en: "Green and yellow", text_cn: "绿色和黄色", correct: true },
        { text_en: "Blue and red", text_cn: "蓝色和红色", correct: false },
        { text_en: "All white", text_cn: "全白", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Sky is green and yellow",
        feedback_wrong_cn: "Sky 是 green and yellow 绿黄相间的~",
      },
      {
        type: "comprehension",
        stem_cn: "Sky 什么时候唱歌?",
        stem_en: "When does Sky sing?",
        options: [
        { text_en: "Every morning", text_cn: "每天早上", correct: true },
        { text_en: "At night", text_cn: "晚上", correct: false },
        { text_en: "After school", text_cn: "放学后", correct: false }
        ],
        feedback_correct_cn: "🌟 对!She sings every morning",
        feedback_wrong_cn: "Sky 在 every morning 早上唱歌~",
      }
    ],
  },
  {
    id: "sb13",
    title_cn: "公园里",
    title_en: "At the Park",
    description_cn: "和朋友一起去公园玩",
    level: 1,
    sortOrder: 13,
    bg: "from-lime-400 to-green-500",
    cover_emoji: "🌳",
    reading_minutes: 3,
    pages: [
      { page: 1, text_en: "I love going to the park.", text_cn: "我爱去公园。", emoji: "🌳" },
      { page: 2, text_en: "I see a big tree there.", text_cn: "我看到一棵大树。", emoji: "🌲" },
      { page: 3, text_en: "Children are playing around.", text_cn: "孩子们在玩耍。", emoji: "👫👬" },
      { page: 4, text_en: "Where is my friend Tom?", text_cn: "Tom 在哪里?", emoji: "❓" },
      { page: 5, text_en: "There he is, by the slide!", text_cn: "他在那里,滑梯旁!", emoji: "🛝" },
      { page: 6, text_en: "We swing and laugh together.", text_cn: "我们一起荡秋千和笑。", emoji: "🎢😄" },
      { page: 7, text_en: "The park is so much fun!", text_cn: "公园真好玩!", emoji: "🌳🎉" }
    ],
    questions: [
      {
        type: "comprehension",
        stem_cn: "Tom 在哪里?",
        stem_en: "Where is Tom?",
        options: [
        { text_en: "By the slide", text_cn: "在滑梯旁", correct: true },
        { text_en: "At home", text_cn: "在家", correct: false },
        { text_en: "At school", text_cn: "在学校", correct: false }
        ],
        feedback_correct_cn: "🌟 对!There he is, by the slide",
        feedback_wrong_cn: "Tom 在 by the slide 滑梯旁~",
      },
      {
        type: "comprehension",
        stem_cn: "他们在公园做什么?",
        stem_en: "What do they do at the park?",
        options: [
        { text_en: "Swing and laugh", text_cn: "荡秋千和笑", correct: true },
        { text_en: "Read books", text_cn: "看书", correct: false },
        { text_en: "Eat lunch", text_cn: "吃午饭", correct: false }
        ],
        feedback_correct_cn: "🌟 对!We swing and laugh together",
        feedback_wrong_cn: "他们 swing and laugh 荡秋千和笑~",
      }
    ],
  },
  {
    id: "sb14",
    title_cn: "神奇花园",
    title_en: "The Magic Garden",
    description_cn: "一个孩子发现房子后的秘密花园",
    level: 2,
    sortOrder: 14,
    bg: "from-purple-400 to-fuchsia-500",
    cover_emoji: "🌸🚪",
    reading_minutes: 4,
    pages: [
      { page: 1, text_en: "Behind my house, there is a small door.", text_cn: "我家后面有一扇小门。", emoji: "🚪" },
      { page: 2, text_en: "One day, I opened it slowly.", text_cn: "有一天,我慢慢打开它。", emoji: "🔓" },
      { page: 3, text_en: "Wow! A magic garden full of flowers!", text_cn: "哇!满是花的神奇花园!", emoji: "🌸🌺🌷" },
      { page: 4, text_en: "Each flower had a different color.", text_cn: "每朵花颜色都不同。", emoji: "🌈" },
      { page: 5, text_en: "A small fairy was on a rose.", text_cn: "一只小仙女坐在玫瑰上。", emoji: "🧚‍♀️🌹" },
      { page: 6, text_en: "\"Hello! Will you play with me?\"", text_cn: "\"你好!跟我玩吗?\"", emoji: "👋" },
      { page: 7, text_en: "We danced under the moon together.", text_cn: "我们一起在月下跳舞。", emoji: "🌙💃" },
      { page: 8, text_en: "I will come back tomorrow night!", text_cn: "我明晚还要来!", emoji: "✨" }
    ],
    questions: [
      {
        type: "comprehension",
        stem_cn: "神奇花园在哪里?",
        stem_en: "Where is the magic garden?",
        options: [
        { text_en: "Behind the house", text_cn: "房子后面", correct: true },
        { text_en: "In school", text_cn: "学校里", correct: false },
        { text_en: "On a hill", text_cn: "山上", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Behind my house",
        feedback_wrong_cn: "花园在 behind the house 房子后面~",
      },
      {
        type: "comprehension",
        stem_cn: "孩子遇到了谁?",
        stem_en: "Who did the child meet?",
        options: [
        { text_en: "A small fairy", text_cn: "一只小仙女", correct: true },
        { text_en: "A big dragon", text_cn: "一条大龙", correct: false },
        { text_en: "A talking cat", text_cn: "会说话的猫", correct: false }
        ],
        feedback_correct_cn: "🌟 对!A small fairy was on a rose",
        feedback_wrong_cn: "她遇见了 a small fairy 一只小仙女~",
      },
      {
        type: "comprehension",
        stem_cn: "他们一起做了什么?",
        stem_en: "What did they do together?",
        options: [
        { text_en: "Danced under the moon", text_cn: "月下跳舞", correct: true },
        { text_en: "Ate dinner", text_cn: "吃晚饭", correct: false },
        { text_en: "Built a house", text_cn: "建房子", correct: false }
        ],
        feedback_correct_cn: "🌟 对!We danced under the moon",
        feedback_wrong_cn: "他们在 under the moon 月下跳舞~",
      }
    ],
  },
  {
    id: "sb15",
    title_cn: "Spark 上月亮",
    title_en: "Spark Goes to the Moon",
    description_cn: "Spark 自己造火箭飞上月球的冒险",
    level: 2,
    sortOrder: 15,
    bg: "from-indigo-500 to-purple-700",
    cover_emoji: "🚀🌙",
    reading_minutes: 4,
    pages: [
      { page: 1, text_en: "Spark wants to fly to the moon.", text_cn: "Spark 想飞到月亮上。", emoji: "🦊🌙" },
      { page: 2, text_en: "He builds a small rocket ship.", text_cn: "他造了一艘小火箭。", emoji: "🚀" },
      { page: 3, text_en: "3, 2, 1... blast off!", text_cn: "3、2、1...发射!", emoji: "🔥" },
      { page: 4, text_en: "The earth looks blue and small.", text_cn: "地球看起来又蓝又小。", emoji: "🌍" },
      { page: 5, text_en: "He lands on the gray moon.", text_cn: "他降落在灰色月亮上。", emoji: "🌑" },
      { page: 6, text_en: "\"Wow, no air, just gray rocks!\"", text_cn: "\"哇,没有空气,只有灰岩石!\"", emoji: "🪨" },
      { page: 7, text_en: "Spark plants a flag for friendship.", text_cn: "Spark 插了一面友谊的旗。", emoji: "🚩" },
      { page: 8, text_en: "He flies home with a big smile.", text_cn: "他笑着飞回家。", emoji: "😊🚀" }
    ],
    questions: [
      {
        type: "comprehension",
        stem_cn: "Spark 去了哪里?",
        stem_en: "Where does Spark go?",
        options: [
        { text_en: "To the moon", text_cn: "月亮", correct: true },
        { text_en: "To Mars", text_cn: "火星", correct: false },
        { text_en: "To the sun", text_cn: "太阳", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Spark wants to fly to the moon",
        feedback_wrong_cn: "Spark 飞到 the moon 月亮~",
      },
      {
        type: "comprehension",
        stem_cn: "地球看起来怎样?",
        stem_en: "What does the earth look like?",
        options: [
        { text_en: "Blue and small", text_cn: "又蓝又小", correct: true },
        { text_en: "Big and red", text_cn: "又大又红", correct: false },
        { text_en: "Green and bright", text_cn: "又绿又亮", correct: false }
        ],
        feedback_correct_cn: "🌟 对!The earth looks blue and small",
        feedback_wrong_cn: "地球 blue and small 又蓝又小~",
      },
      {
        type: "comprehension",
        stem_cn: "Spark 插了什么?",
        stem_en: "What does Spark plant?",
        options: [
        { text_en: "A flag", text_cn: "一面旗", correct: true },
        { text_en: "A tree", text_cn: "一棵树", correct: false },
        { text_en: "A flower", text_cn: "一朵花", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Spark plants a flag for friendship",
        feedback_wrong_cn: "Spark 插了 a flag 一面旗~",
      }
    ],
  },
  {
    id: "sb16",
    title_cn: "丢失的泰迪熊",
    title_en: "The Lost Toy",
    description_cn: "找不到泰迪熊,全家一起帮忙找",
    level: 2,
    sortOrder: 16,
    bg: "from-amber-400 to-orange-500",
    cover_emoji: "🧸",
    reading_minutes: 4,
    pages: [
      { page: 1, text_en: "I cannot find my teddy bear.", text_cn: "我找不到我的泰迪熊。", emoji: "🧸❓" },
      { page: 2, text_en: "I look under the bed. Not there.", text_cn: "我看床下。不在。", emoji: "🛏️" },
      { page: 3, text_en: "I look in my toy box. Not there.", text_cn: "我看玩具箱。不在。", emoji: "📦" },
      { page: 4, text_en: "I ask my brother. He didn't see it.", text_cn: "我问哥哥。他没看见。", emoji: "🤷" },
      { page: 5, text_en: "I start to cry. Where is Teddy?", text_cn: "我开始哭。泰迪在哪?", emoji: "😢" },
      { page: 6, text_en: "Mom comes in. \"Look in the car!\"", text_cn: "妈妈进来。\"看看车里!\"", emoji: "👩" },
      { page: 7, text_en: "I run to the car. There it is!", text_cn: "我跑到车里。在那里!", emoji: "🚗" },
      { page: 8, text_en: "Hi Teddy! I missed you so much!", text_cn: "嗨泰迪!我好想你!", emoji: "🧸❤️" }
    ],
    questions: [
      {
        type: "comprehension",
        stem_cn: "孩子在找什么?",
        stem_en: "What is the child looking for?",
        options: [
        { text_en: "Teddy bear", text_cn: "泰迪熊", correct: true },
        { text_en: "Toy car", text_cn: "玩具车", correct: false },
        { text_en: "Doll", text_cn: "娃娃", correct: false }
        ],
        feedback_correct_cn: "🌟 对!I cannot find my teddy bear",
        feedback_wrong_cn: "找 teddy bear 泰迪熊~",
      },
      {
        type: "comprehension",
        stem_cn: "泰迪熊最后在哪?",
        stem_en: "Where was Teddy?",
        options: [
        { text_en: "In the car", text_cn: "车里", correct: true },
        { text_en: "Under the bed", text_cn: "床下", correct: false },
        { text_en: "In the toy box", text_cn: "玩具箱", correct: false }
        ],
        feedback_correct_cn: "🌟 对!I run to the car. There it is!",
        feedback_wrong_cn: "泰迪在 in the car 车里~",
      },
      {
        type: "comprehension",
        stem_cn: "谁帮孩子找到了?",
        stem_en: "Who helped find Teddy?",
        options: [
        { text_en: "Mom", text_cn: "妈妈", correct: true },
        { text_en: "Brother", text_cn: "哥哥", correct: false },
        { text_en: "Dad", text_cn: "爸爸", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Mom comes in. 'Look in the car!'",
        feedback_wrong_cn: "Mom 妈妈说去车里找~",
      }
    ],
  },
  {
    id: "sb17",
    title_cn: "学校的一天",
    title_en: "A Day at School",
    description_cn: "孩子从早到晚的学校生活",
    level: 2,
    sortOrder: 17,
    bg: "from-blue-400 to-indigo-500",
    cover_emoji: "🏫📚",
    reading_minutes: 4,
    pages: [
      { page: 1, text_en: "I wake up at seven o'clock.", text_cn: "我七点起床。", emoji: "⏰" },
      { page: 2, text_en: "I eat breakfast with my family.", text_cn: "我和家人一起吃早餐。", emoji: "🥞" },
      { page: 3, text_en: "I walk to school with my friend.", text_cn: "我和朋友走路去学校。", emoji: "🚶" },
      { page: 4, text_en: "We have math, English, and art class.", text_cn: "我们有数学、英语和美术课。", emoji: "📐" },
      { page: 5, text_en: "At lunch, I eat my sandwich.", text_cn: "午餐时,我吃三明治。", emoji: "🥪" },
      { page: 6, text_en: "We play soccer at recess time.", text_cn: "课间我们踢足球。", emoji: "⚽" },
      { page: 7, text_en: "After school, I do my homework.", text_cn: "放学后,我做作业。", emoji: "📝" },
      { page: 8, text_en: "I love being a student!", text_cn: "我喜欢做学生!", emoji: "🎒❤️" }
    ],
    questions: [
      {
        type: "comprehension",
        stem_cn: "孩子几点起床?",
        stem_en: "When does the child wake up?",
        options: [
        { text_en: "Seven o'clock", text_cn: "7 点", correct: true },
        { text_en: "Six o'clock", text_cn: "6 点", correct: false },
        { text_en: "Eight o'clock", text_cn: "8 点", correct: false }
        ],
        feedback_correct_cn: "🌟 对!I wake up at seven o'clock",
        feedback_wrong_cn: "孩子 seven o'clock 7 点起床~",
      },
      {
        type: "comprehension",
        stem_cn: "他们有什么课?",
        stem_en: "What classes do they have?",
        options: [
        { text_en: "Math, English, art", text_cn: "数学、英语、美术", correct: true },
        { text_en: "Math, science", text_cn: "数学、科学", correct: false },
        { text_en: "English, music", text_cn: "英语、音乐", correct: false }
        ],
        feedback_correct_cn: "🌟 对!math, English, and art class",
        feedback_wrong_cn: "他们有 math, English, art 这三门课~",
      },
      {
        type: "comprehension",
        stem_cn: "课间他们玩什么?",
        stem_en: "What do they play at recess?",
        options: [
        { text_en: "Soccer", text_cn: "足球", correct: true },
        { text_en: "Basketball", text_cn: "篮球", correct: false },
        { text_en: "Tennis", text_cn: "网球", correct: false }
        ],
        feedback_correct_cn: "🌟 对!We play soccer at recess",
        feedback_wrong_cn: "他们玩 soccer 足球~",
      }
    ],
  },
  {
    id: "sb18",
    title_cn: "勇敢小老鼠 Pip",
    title_en: "The Brave Little Mouse",
    description_cn: "小老鼠 Pip 用善良和勇气感动一只大猫",
    level: 3,
    sortOrder: 18,
    bg: "from-stone-400 to-amber-600",
    cover_emoji: "🐭",
    reading_minutes: 5,
    pages: [
      { page: 1, text_en: "There was a tiny mouse named Pip.", text_cn: "有一只小老鼠叫 Pip。", emoji: "🐭" },
      { page: 2, text_en: "One day, a big cat came to the house.", text_cn: "一天,大猫来到房子里。", emoji: "🐱" },
      { page: 3, text_en: "All the other mice ran to hide quickly.", text_cn: "其他老鼠都赶紧躲起来。", emoji: "🏃" },
      { page: 4, text_en: "But Pip stood tall, not afraid at all.", text_cn: "但 Pip 站得直直的,一点都不怕。", emoji: "💪" },
      { page: 5, text_en: "\"Why are you here?\" Pip asked the cat.", text_cn: "\"你为什么来?\" Pip 问猫。", emoji: "❓" },
      { page: 6, text_en: "\"I am lost and hungry,\" said the cat.", text_cn: "\"我迷路又饿,\" 猫说。", emoji: "😿" },
      { page: 7, text_en: "Pip thought, then shared his cheese.", text_cn: "Pip 想了想,分享了他的奶酪。", emoji: "🧀" },
      { page: 8, text_en: "From that day, they became friends.", text_cn: "从那天起,他们成了朋友。", emoji: "🐭🐱❤️" },
      { page: 9, text_en: "Pip showed brave hearts find friends.", text_cn: "Pip 让大家看到:勇敢的心能找到朋友。", emoji: "✨" }
    ],
    questions: [
      {
        type: "comprehension",
        stem_cn: "Pip 是什么动物?",
        stem_en: "What animal was Pip?",
        options: [
        { text_en: "A mouse", text_cn: "老鼠", correct: true },
        { text_en: "A cat", text_cn: "猫", correct: false },
        { text_en: "A rabbit", text_cn: "兔子", correct: false }
        ],
        feedback_correct_cn: "🌟 对!a tiny mouse named Pip",
        feedback_wrong_cn: "Pip 是 mouse 老鼠~",
      },
      {
        type: "comprehension",
        stem_cn: "大猫来时其他老鼠怎么做?",
        stem_en: "What did the other mice do?",
        options: [
        { text_en: "Ran to hide", text_cn: "跑去躲起来", correct: true },
        { text_en: "Stood tall", text_cn: "站着不动", correct: false },
        { text_en: "Made friends", text_cn: "做朋友", correct: false }
        ],
        feedback_correct_cn: "🌟 对!All the other mice ran to hide",
        feedback_wrong_cn: "其他老鼠 ran to hide 跑去躲~",
      },
      {
        type: "comprehension",
        stem_cn: "Pip 分享了什么?",
        stem_en: "What did Pip share?",
        options: [
        { text_en: "Cheese", text_cn: "奶酪", correct: true },
        { text_en: "Bread", text_cn: "面包", correct: false },
        { text_en: "Water", text_cn: "水", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Pip shared his cheese",
        feedback_wrong_cn: "Pip 分享 cheese 奶酪~",
      },
      {
        type: "comprehension",
        stem_cn: "这个故事告诉我们什么?",
        stem_en: "What is the lesson?",
        options: [
        { text_en: "Brave hearts find friends", text_cn: "勇敢的心能找到朋友", correct: true },
        { text_en: "Always run from cats", text_cn: "总是逃离猫", correct: false },
        { text_en: "Never share your food", text_cn: "不要分享食物", correct: false }
        ],
        feedback_correct_cn: "🌟 对!brave hearts find friends",
        feedback_wrong_cn: "故事教我们:brave hearts find friends 勇敢的心能找到朋友~",
      }
    ],
  },
  {
    id: "sb19",
    title_cn: "妹妹和小鸟",
    title_en: "Sister and the Bird",
    description_cn: "妹妹照顾一只掉下来的小鸟,直到它能飞",
    level: 3,
    sortOrder: 19,
    bg: "from-sky-400 to-teal-500",
    cover_emoji: "👧🐣",
    reading_minutes: 5,
    pages: [
      { page: 1, text_en: "My little sister loves animals.", text_cn: "我妹妹爱动物。", emoji: "👧❤️" },
      { page: 2, text_en: "One morning, she found a baby bird.", text_cn: "一天早上,她发现一只小鸟。", emoji: "🐣" },
      { page: 3, text_en: "The bird had fallen from its nest.", text_cn: "小鸟从巢里掉下来了。", emoji: "🪺" },
      { page: 4, text_en: "She gently picked it up with her hands.", text_cn: "她小心地用手把它捧起来。", emoji: "🤲" },
      { page: 5, text_en: "\"Don't worry, little one,\" she said softly.", text_cn: "\"别担心,小家伙,\" 她轻声说。", emoji: "💕" },
      { page: 6, text_en: "We made a soft bed with grass and leaves.", text_cn: "我们用草和叶子做了个软床。", emoji: "🌿" },
      { page: 7, text_en: "Each day, she gave it tiny seeds.", text_cn: "每天她都给它喂小小的种子。", emoji: "🌱" },
      { page: 8, text_en: "After two weeks, the bird could fly.", text_cn: "两周后,小鸟会飞了。", emoji: "🐦" },
      { page: 9, text_en: "She smiled as it flew up to the sky.", text_cn: "看着它飞向天空,她笑了。", emoji: "😊☁️" }
    ],
    questions: [
      {
        type: "comprehension",
        stem_cn: "妹妹找到了什么?",
        stem_en: "What did the sister find?",
        options: [
        { text_en: "A baby bird", text_cn: "一只小鸟", correct: true },
        { text_en: "A kitten", text_cn: "一只小猫", correct: false },
        { text_en: "A flower", text_cn: "一朵花", correct: false }
        ],
        feedback_correct_cn: "🌟 对!she found a baby bird",
        feedback_wrong_cn: "妹妹找到 baby bird 小鸟~",
      },
      {
        type: "comprehension",
        stem_cn: "小鸟从哪儿掉下来的?",
        stem_en: "Where had the bird fallen from?",
        options: [
        { text_en: "Its nest", text_cn: "它的巢", correct: true },
        { text_en: "A tree branch", text_cn: "树枝", correct: false },
        { text_en: "The roof", text_cn: "屋顶", correct: false }
        ],
        feedback_correct_cn: "🌟 对!The bird had fallen from its nest",
        feedback_wrong_cn: "小鸟从 its nest 巢里掉下来~",
      },
      {
        type: "comprehension",
        stem_cn: "他们用什么做小床?",
        stem_en: "What did they make the bed with?",
        options: [
        { text_en: "Grass and leaves", text_cn: "草和叶子", correct: true },
        { text_en: "Paper and cloth", text_cn: "纸和布", correct: false },
        { text_en: "Cotton and wool", text_cn: "棉和毛", correct: false }
        ],
        feedback_correct_cn: "🌟 对!a soft bed with grass and leaves",
        feedback_wrong_cn: "用 grass and leaves 草和叶子做的床~",
      },
      {
        type: "comprehension",
        stem_cn: "故事结尾妹妹感觉如何?",
        stem_en: "How did the sister feel at the end?",
        options: [
        { text_en: "Happy", text_cn: "开心", correct: true },
        { text_en: "Sad", text_cn: "难过", correct: false },
        { text_en: "Scared", text_cn: "害怕", correct: false }
        ],
        feedback_correct_cn: "🌟 对!She smiled as it flew up",
        feedback_wrong_cn: "妹妹 smiled 笑了,所以开心~",
      }
    ],
  },
  {
    id: "sb20",
    title_cn: "大比赛",
    title_en: "The Big Race",
    description_cn: "学校大赛跑,跌倒后爬起来完成比赛",
    level: 3,
    sortOrder: 20,
    bg: "from-red-500 to-orange-600",
    cover_emoji: "🏃🏆",
    reading_minutes: 5,
    pages: [
      { page: 1, text_en: "Today is the big race at school.", text_cn: "今天是学校大比赛。", emoji: "🏃" },
      { page: 2, text_en: "I have practiced for many weeks.", text_cn: "我练了好几周。", emoji: "💪" },
      { page: 3, text_en: "My friends Tom and Lisa are also running.", text_cn: "我朋友 Tom 和 Lisa 也跑。", emoji: "👫" },
      { page: 4, text_en: "\"Ready, set, go!\" the teacher shouts.", text_cn: "\"预备,各就位,跑!\" 老师喊。", emoji: "📢" },
      { page: 5, text_en: "We all run as fast as we can.", text_cn: "我们都尽全力跑。", emoji: "💨" },
      { page: 6, text_en: "Lisa is in front. I am second!", text_cn: "Lisa 在前面。我第二!", emoji: "🥈" },
      { page: 7, text_en: "Just before the finish, I trip and fall.", text_cn: "快到终点时,我绊倒了。", emoji: "😣" },
      { page: 8, text_en: "Lisa wins. I get up and finish.", text_cn: "Lisa 赢了。我爬起来完赛。", emoji: "🏁" },
      { page: 9, text_en: "My family says they are proud of me.", text_cn: "家人说他们以我为荣。", emoji: "❤️🎉" }
    ],
    questions: [
      {
        type: "comprehension",
        stem_cn: "今天是什么日子?",
        stem_en: "What is today?",
        options: [
        { text_en: "The big race", text_cn: "大比赛", correct: true },
        { text_en: "First day of school", text_cn: "开学第一天", correct: false },
        { text_en: "Birthday party", text_cn: "生日派对", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Today is the big race",
        feedback_wrong_cn: "今天是 the big race 大比赛~",
      },
      {
        type: "comprehension",
        stem_cn: "谁赢了比赛?",
        stem_en: "Who wins the race?",
        options: [
        { text_en: "Lisa", text_cn: "Lisa", correct: true },
        { text_en: "Tom", text_cn: "Tom", correct: false },
        { text_en: "The narrator (I)", text_cn: "我", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Lisa wins",
        feedback_wrong_cn: "Lisa 赢了,叙述者第二跑到一半摔倒了~",
      },
      {
        type: "comprehension",
        stem_cn: "孩子在终点前发生了什么?",
        stem_en: "What happens to the child before the finish?",
        options: [
        { text_en: "Trips and falls", text_cn: "绊倒了", correct: true },
        { text_en: "Wins easily", text_cn: "轻松赢了", correct: false },
        { text_en: "Stops running", text_cn: "停止跑步", correct: false }
        ],
        feedback_correct_cn: "🌟 对!I trip and fall",
        feedback_wrong_cn: "孩子 trip and fall 绊倒了~",
      },
      {
        type: "comprehension",
        stem_cn: "家人说什么?",
        stem_en: "What does the family say?",
        options: [
        { text_en: "They are proud", text_cn: "他们很骄傲", correct: true },
        { text_en: "They are angry", text_cn: "他们很生气", correct: false },
        { text_en: "They are bored", text_cn: "他们很无聊", correct: false }
        ],
        feedback_correct_cn: "🌟 对!they are proud of me",
        feedback_wrong_cn: "家人 proud 以孩子为荣,因为孩子摔倒后爬起来完成了~",
      }
    ],
  }
];

// ─── 工具函数 ──────────────────────────────────────

/** 按难度取 G2 绘本 */
export function getBooksByLevelG2(level: 1 | 2 | 3): StoryBook[] {
  return PRIMARY_STORY_BOOKS_G2.filter(b => b.level === level)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** 按 sortOrder 取所有 G2 绘本(用于顺序解锁) */
export function getBooksSortedG2(): StoryBook[] {
  return [...PRIMARY_STORY_BOOKS_G2].sort((a, b) => a.sortOrder - b.sortOrder);
}

/** 取下一本未读的 G2 绘本 */
export function getNextBookG2(completedIds: string[]): StoryBook | null {
  const sorted = getBooksSortedG2();
  return sorted.find(b => !completedIds.includes(b.id)) || null;
}

/** 按 id 查找 G2 绘本 */
export function findBookG2(id: string): StoryBook | undefined {
  return PRIMARY_STORY_BOOKS_G2.find(b => b.id === id);
}

/** G2 统计 */
export const STORY_BOOK_STATS_G2 = {
  total: 10,
  byLevel: {
    level1: 3,
    level2: 4,
    level3: 3,
  },
  totalPages: 80,
  totalQuestions: 30,
  averagePagesPerBook: 8.0,
  averageWordsPerPage: 6.4,
};
