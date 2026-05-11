// 小学二年级听力对话(对接 G1 体系)
// =============================================================
// 数据规模:20 个 G2 听力对话
//
// 设计原则:
//   1. 5-6 轮对话(比 G1 的 4-5 轮多 1-2 轮)
//   2. 每句 6-10 词(比 G1 的 ≤8 词长一些)
//   3. 用 Fry's 1-200 词汇(G1 + G2 累计)
//   4. 完全复用 G1 ListeningDialogue 类型
//   5. theme 字符串扩展(新增 weather/time/clothes/rooms/hobbies/sports/jobs/transport)
//
// 主题分布(13 个主题):
//   G1 主题深化(10 个):打招呼/家庭/食物/动物/学校 各 2 个
//   G2 新主题(10 个):
//     - weather 天气(2)
//     - time 时间(2)
//     - clothes 衣服(1)
//     - rooms 房间(1)
//     - hobbies 兴趣(1)
//     - sports 运动(1)
//     - jobs 职业(1)
//     - transport 交通(1)
//
// UI 接入建议:
//   • G1 通关后才可访问 G2(顺序解锁)
//   • 主路径 /primary/listening?grade=2 切换 G2 数据
//   • 数据库表 primary_listening_completion 共用,dialogue_id 区分

import type { ListeningDialogue } from "./primaryListeningDialogues";

// ─── 类型说明 ──────────────────────────────────────
// G2 对 theme 字段做了扩展(用字符串字面量,不强制 union 匹配 G1)
// 字段结构完全和 G1 一致

// ─── 20 个 G2 听力对话 ──────────────────────────────────────

export const PRIMARY_LISTENING_DIALOGUES_G2: ListeningDialogue[] = [
  {
    id: "ld21",
    theme: "greetings",
    themeCn: "打招呼",
    difficulty: 2,
    sortOrder: 21,
    title_cn: "打电话给奶奶",
    title_en: "Calling Grandma",
    scene_cn: "Lily 想念奶奶,妈妈让她打电话",
    emoji: "📞",
    bg: "from-pink-300 to-rose-400",
    lines: [
      { speaker: "Lily", emoji: "👧", side: "left", text_en: "Hello, Grandma! It's me, Lily.", text_cn: "你好,奶奶!是我,Lily。" },
      { speaker: "奶奶", emoji: "👵", side: "right", text_en: "Hi, sweetie! How are you?", text_cn: "嗨,宝贝!你好吗?" },
      { speaker: "Lily", emoji: "👧", side: "left", text_en: "I'm great! I miss you so much.", text_cn: "我很好!我超想你。" },
      { speaker: "奶奶", emoji: "👵", side: "right", text_en: "I miss you too! See you Sunday?", text_cn: "我也想你!周日见?" },
      { speaker: "Lily", emoji: "👧", side: "left", text_en: "Yes! I love you, Grandma!", text_cn: "好!我爱你,奶奶!" }
    ],
    questions: [
      {
        type: "listen_choose",
        stem_cn: "Lily 在做什么?",
        stem_en: "What is Lily doing?",
        options: [
        { text_en: "Calling her grandma", text_cn: "给奶奶打电话", correct: true },
        { text_en: "Writing a letter", text_cn: "写信", correct: false },
        { text_en: "Sending a gift", text_cn: "送礼物", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Lily 用电话和奶奶聊天",
        feedback_wrong_cn: "Lily 在 calling grandma 打电话给奶奶~",
      },
      {
        type: "comprehension",
        stem_cn: "她们什么时候见面?",
        stem_en: "When will they meet?",
        options: [
        { text_en: "On Sunday", text_cn: "周日", correct: true },
        { text_en: "Today", text_cn: "今天", correct: false },
        { text_en: "Next month", text_cn: "下个月", correct: false }
        ],
        feedback_correct_cn: "🌟 对!奶奶说 See you Sunday",
        feedback_wrong_cn: "她们 Sunday 周日见~",
      }
    ],
  },
  {
    id: "ld22",
    theme: "greetings",
    themeCn: "打招呼",
    difficulty: 2,
    sortOrder: 22,
    title_cn: "去看医生",
    title_en: "Visit the Doctor",
    scene_cn: "小明感冒了,妈妈带他去看医生",
    emoji: "👨‍⚕️",
    bg: "from-blue-300 to-cyan-400",
    lines: [
      { speaker: "医生", emoji: "👨‍⚕️", side: "left", text_en: "Hello! What's wrong, my friend?", text_cn: "你好!怎么了,小朋友?" },
      { speaker: "小明", emoji: "👦", side: "right", text_en: "My head hurts and I'm tired.", text_cn: "我头疼,而且很累。" },
      { speaker: "医生", emoji: "👨‍⚕️", side: "left", text_en: "Open your mouth, please. Say 'Ah'.", text_cn: "请张嘴。说 'Ah'。" },
      { speaker: "小明", emoji: "👦", side: "right", text_en: "Ahhh...", text_cn: "啊啊啊..." },
      { speaker: "医生", emoji: "👨‍⚕️", side: "left", text_en: "You have a cold. Drink lots of water.", text_cn: "你感冒了。多喝水。" }
    ],
    questions: [
      {
        type: "comprehension",
        stem_cn: "小明怎么了?",
        stem_en: "What's wrong with the boy?",
        options: [
        { text_en: "His head hurts", text_cn: "他头疼", correct: true },
        { text_en: "His leg hurts", text_cn: "他腿疼", correct: false },
        { text_en: "He is fine", text_cn: "他很好", correct: false }
        ],
        feedback_correct_cn: "🌟 对!小明说 My head hurts",
        feedback_wrong_cn: "小明 head hurts 头疼~",
      },
      {
        type: "comprehension",
        stem_cn: "医生让小明做什么?",
        stem_en: "What does the doctor tell him?",
        options: [
        { text_en: "Drink lots of water", text_cn: "多喝水", correct: true },
        { text_en: "Sleep more", text_cn: "多睡觉", correct: false },
        { text_en: "Eat candy", text_cn: "吃糖", correct: false }
        ],
        feedback_correct_cn: "🌟 对!医生说 Drink lots of water",
        feedback_wrong_cn: "医生让小明 drink water 多喝水~",
      }
    ],
  },
  {
    id: "ld23",
    theme: "family",
    themeCn: "家庭",
    difficulty: 2,
    sortOrder: 23,
    title_cn: "帮妈妈做家务",
    title_en: "Help Mom",
    scene_cn: "周末早上,妈妈在厨房,小红想帮忙",
    emoji: "🧹",
    bg: "from-amber-300 to-orange-400",
    lines: [
      { speaker: "小红", emoji: "👧", side: "left", text_en: "Mom, can I help you today?", text_cn: "妈妈,我今天能帮你吗?" },
      { speaker: "妈妈", emoji: "👩", side: "right", text_en: "Yes! You can wash the apples.", text_cn: "好啊!你可以洗苹果。" },
      { speaker: "小红", emoji: "👧", side: "left", text_en: "How many apples should I wash?", text_cn: "我要洗几个苹果?" },
      { speaker: "妈妈", emoji: "👩", side: "right", text_en: "Five apples, please. Thank you!", text_cn: "五个,谢谢!" },
      { speaker: "小红", emoji: "👧", side: "left", text_en: "I love helping you, Mom!", text_cn: "我喜欢帮你,妈妈!" }
    ],
    questions: [
      {
        type: "comprehension",
        stem_cn: "小红要洗什么?",
        stem_en: "What does the girl wash?",
        options: [
        { text_en: "Apples", text_cn: "苹果", correct: true },
        { text_en: "Dishes", text_cn: "盘子", correct: false },
        { text_en: "Clothes", text_cn: "衣服", correct: false }
        ],
        feedback_correct_cn: "🌟 对!妈妈说 wash the apples",
        feedback_wrong_cn: "小红洗 apples 苹果~",
      },
      {
        type: "listen_choose",
        stem_cn: "妈妈要她洗几个?",
        stem_en: "How many?",
        options: [
        { text_en: "Five", text_cn: "5 个", correct: true },
        { text_en: "Four", text_cn: "4 个", correct: false },
        { text_en: "Three", text_cn: "3 个", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Five apples 五个苹果",
        feedback_wrong_cn: "妈妈说要 five 五个苹果~",
      }
    ],
  },
  {
    id: "ld24",
    theme: "family",
    themeCn: "家庭",
    difficulty: 2,
    sortOrder: 24,
    title_cn: "我和弟弟",
    title_en: "Me and My Brother",
    scene_cn: "小红跟同学聊她弟弟",
    emoji: "👫",
    bg: "from-fuchsia-300 to-pink-500",
    lines: [
      { speaker: "Mia", emoji: "👧", side: "left", text_en: "Do you have any brothers?", text_cn: "你有兄弟吗?" },
      { speaker: "小红", emoji: "👧", side: "right", text_en: "Yes, I have a little brother.", text_cn: "有,我有个弟弟。" },
      { speaker: "Mia", emoji: "👧", side: "left", text_en: "How old is he?", text_cn: "他几岁?" },
      { speaker: "小红", emoji: "👧", side: "right", text_en: "He is three years old. He's so funny!", text_cn: "他三岁。他很搞笑!" },
      { speaker: "Mia", emoji: "👧", side: "left", text_en: "I want to meet him!", text_cn: "我想见见他!" }
    ],
    questions: [
      {
        type: "comprehension",
        stem_cn: "弟弟几岁?",
        stem_en: "How old is the brother?",
        options: [
        { text_en: "Three", text_cn: "3 岁", correct: true },
        { text_en: "Five", text_cn: "5 岁", correct: false },
        { text_en: "Six", text_cn: "6 岁", correct: false }
        ],
        feedback_correct_cn: "🌟 对!弟弟 three 三岁",
        feedback_wrong_cn: "弟弟 three years old 三岁~",
      },
      {
        type: "comprehension",
        stem_cn: "小红怎么形容弟弟?",
        stem_en: "How does she describe him?",
        options: [
        { text_en: "Funny", text_cn: "搞笑", correct: true },
        { text_en: "Tall", text_cn: "高", correct: false },
        { text_en: "Quiet", text_cn: "安静", correct: false }
        ],
        feedback_correct_cn: "🌟 对!小红说 He's so funny",
        feedback_wrong_cn: "弟弟 funny 搞笑~",
      }
    ],
  },
  {
    id: "ld25",
    theme: "food",
    themeCn: "食物",
    difficulty: 2,
    sortOrder: 25,
    title_cn: "午餐时间",
    title_en: "Lunch Time",
    scene_cn: "学校食堂,Tom 和 Jake 坐在一起吃午饭",
    emoji: "🍱",
    bg: "from-orange-300 to-red-400",
    lines: [
      { speaker: "Tom", emoji: "👦", side: "left", text_en: "What's in your lunch box today?", text_cn: "你饭盒里有什么?" },
      { speaker: "Jake", emoji: "👦", side: "right", text_en: "Sandwich and an apple. You?", text_cn: "三明治和苹果。你呢?" },
      { speaker: "Tom", emoji: "👦", side: "left", text_en: "Rice and chicken. It smells good!", text_cn: "米饭和鸡肉。闻起来真香!" },
      { speaker: "Jake", emoji: "👦", side: "right", text_en: "Want to share? I'll trade!", text_cn: "要分享吗?我们换换!" },
      { speaker: "Tom", emoji: "👦", side: "left", text_en: "Sure! Half my chicken for half your apple!", text_cn: "好啊!我的一半鸡肉换你的半个苹果!" }
    ],
    questions: [
      {
        type: "comprehension",
        stem_cn: "Tom 午餐吃什么?",
        stem_en: "What's Tom's lunch?",
        options: [
        { text_en: "Rice and chicken", text_cn: "米饭和鸡肉", correct: true },
        { text_en: "Sandwich and apple", text_cn: "三明治和苹果", correct: false },
        { text_en: "Noodles", text_cn: "面条", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Tom 说 Rice and chicken",
        feedback_wrong_cn: "Tom 吃 rice and chicken 米饭和鸡肉~",
      },
      {
        type: "comprehension",
        stem_cn: "他们决定做什么?",
        stem_en: "What do they decide to do?",
        options: [
        { text_en: "Trade some food", text_cn: "交换一些食物", correct: true },
        { text_en: "Buy more food", text_cn: "买更多食物", correct: false },
        { text_en: "Go home", text_cn: "回家", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Tom 说 I'll trade,他们交换食物",
        feedback_wrong_cn: "他们 trade 交换食物~",
      }
    ],
  },
  {
    id: "ld26",
    theme: "food",
    themeCn: "食物",
    difficulty: 2,
    sortOrder: 26,
    title_cn: "生日蛋糕",
    title_en: "Birthday Cake",
    scene_cn: "小红的生日,全家围在桌前",
    emoji: "🎂",
    bg: "from-pink-400 to-fuchsia-500",
    lines: [
      { speaker: "妈妈", emoji: "👩", side: "left", text_en: "Happy birthday, Mei! Here's your cake!", text_cn: "生日快乐,梅!这是你的蛋糕!" },
      { speaker: "Mei", emoji: "👧", side: "right", text_en: "Wow! It's chocolate! My favorite!", text_cn: "哇!是巧克力的!我最爱的!" },
      { speaker: "爸爸", emoji: "👨", side: "left", text_en: "Make a wish, sweetie!", text_cn: "许个愿,宝贝!" },
      { speaker: "Mei", emoji: "👧", side: "right", text_en: "I'm thinking... done! Now I'll blow!", text_cn: "我想想...好了!现在我吹!" },
      { speaker: "家人", emoji: "👨‍👩‍👧", side: "left", text_en: "Happy birthday to you!", text_cn: "祝你生日快乐!" }
    ],
    questions: [
      {
        type: "listen_choose",
        stem_cn: "蛋糕是什么口味?",
        stem_en: "What flavor is the cake?",
        options: [
        { text_en: "Chocolate", text_cn: "巧克力", correct: true },
        { text_en: "Vanilla", text_cn: "香草", correct: false },
        { text_en: "Strawberry", text_cn: "草莓", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Mei 说 It's chocolate",
        feedback_wrong_cn: "蛋糕是 chocolate 巧克力的~",
      },
      {
        type: "comprehension",
        stem_cn: "爸爸让 Mei 做什么?",
        stem_en: "What does Dad ask Mei to do?",
        options: [
        { text_en: "Make a wish", text_cn: "许愿", correct: true },
        { text_en: "Sing a song", text_cn: "唱歌", correct: false },
        { text_en: "Eat first", text_cn: "先吃", correct: false }
        ],
        feedback_correct_cn: "🌟 对!爸爸说 Make a wish",
        feedback_wrong_cn: "爸爸让 Mei 许愿 make a wish~",
      }
    ],
  },
  {
    id: "ld27",
    theme: "animals",
    themeCn: "动物",
    difficulty: 2,
    sortOrder: 27,
    title_cn: "动物园奇遇",
    title_en: "Adventure at the Zoo",
    scene_cn: "Tom 和爸爸在动物园,看到长颈鹿",
    emoji: "🦒",
    bg: "from-yellow-400 to-orange-500",
    lines: [
      { speaker: "Tom", emoji: "👦", side: "left", text_en: "Look, Dad! A giraffe! It's so tall!", text_cn: "看,爸爸!长颈鹿!好高啊!" },
      { speaker: "爸爸", emoji: "👨", side: "right", text_en: "Yes! Giraffes are the tallest animals.", text_cn: "对!长颈鹿是最高的动物。" },
      { speaker: "Tom", emoji: "👦", side: "left", text_en: "What do giraffes eat?", text_cn: "长颈鹿吃什么?" },
      { speaker: "爸爸", emoji: "👨", side: "right", text_en: "They eat leaves from tall trees.", text_cn: "它们吃高树上的叶子。" },
      { speaker: "Tom", emoji: "👦", side: "left", text_en: "Cool! I want to be a giraffe!", text_cn: "酷!我也想当长颈鹿!" }
    ],
    questions: [
      {
        type: "listen_choose",
        stem_cn: "他们看到什么动物?",
        stem_en: "What animal do they see?",
        options: [
        { text_en: "A giraffe", text_cn: "长颈鹿", correct: true },
        { text_en: "A lion", text_cn: "狮子", correct: false },
        { text_en: "A bear", text_cn: "熊", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Tom 喊 A giraffe",
        feedback_wrong_cn: "他们看到 giraffe 长颈鹿~",
      },
      {
        type: "comprehension",
        stem_cn: "长颈鹿吃什么?",
        stem_en: "What do giraffes eat?",
        options: [
        { text_en: "Leaves", text_cn: "叶子", correct: true },
        { text_en: "Meat", text_cn: "肉", correct: false },
        { text_en: "Fish", text_cn: "鱼", correct: false }
        ],
        feedback_correct_cn: "🌟 对!爸爸说 They eat leaves",
        feedback_wrong_cn: "长颈鹿吃 leaves 叶子~",
      }
    ],
  },
  {
    id: "ld28",
    theme: "animals",
    themeCn: "动物",
    difficulty: 2,
    sortOrder: 28,
    title_cn: "我家的宠物兔",
    title_en: "My Pet Rabbit",
    scene_cn: "小红给同学介绍家里的兔子",
    emoji: "🐰",
    bg: "from-amber-200 to-yellow-400",
    lines: [
      { speaker: "Anna", emoji: "👧", side: "left", text_en: "I heard you have a new pet!", text_cn: "听说你有新宠物!" },
      { speaker: "小红", emoji: "👧", side: "right", text_en: "Yes! A white rabbit named Snowy.", text_cn: "对!一只白兔,叫雪雪。" },
      { speaker: "Anna", emoji: "👧", side: "left", text_en: "Aww, what does Snowy eat?", text_cn: "啊,雪雪吃什么?" },
      { speaker: "小红", emoji: "👧", side: "right", text_en: "She loves carrots and lettuce.", text_cn: "她爱胡萝卜和生菜。" },
      { speaker: "Anna", emoji: "👧", side: "left", text_en: "Can I come over to see her?", text_cn: "我能去看她吗?" }
    ],
    questions: [
      {
        type: "comprehension",
        stem_cn: "兔子叫什么名字?",
        stem_en: "What is the rabbit's name?",
        options: [
        { text_en: "Snowy", text_cn: "雪雪", correct: true },
        { text_en: "Bunny", text_cn: "邦尼", correct: false },
        { text_en: "Fluffy", text_cn: "毛毛", correct: false }
        ],
        feedback_correct_cn: "🌟 对!小红说 named Snowy",
        feedback_wrong_cn: "兔子叫 Snowy 雪雪~",
      },
      {
        type: "comprehension",
        stem_cn: "兔子爱吃什么?",
        stem_en: "What does the rabbit love?",
        options: [
        { text_en: "Carrots and lettuce", text_cn: "胡萝卜和生菜", correct: true },
        { text_en: "Bread and meat", text_cn: "面包和肉", correct: false },
        { text_en: "Fish", text_cn: "鱼", correct: false }
        ],
        feedback_correct_cn: "🌟 对!小红说 carrots and lettuce",
        feedback_wrong_cn: "兔子爱 carrots and lettuce 胡萝卜和生菜~",
      }
    ],
  },
  {
    id: "ld29",
    theme: "school",
    themeCn: "学校",
    difficulty: 2,
    sortOrder: 29,
    title_cn: "数学课",
    title_en: "Math Class",
    scene_cn: "数学课上,老师在黑板上写问题",
    emoji: "🔢",
    bg: "from-blue-400 to-indigo-500",
    lines: [
      { speaker: "老师", emoji: "👩‍🏫", side: "left", text_en: "Class, what is two plus three?", text_cn: "同学们,二加三等于几?" },
      { speaker: "Sam", emoji: "👦", side: "right", text_en: "I know! It's five!", text_cn: "我知道!是五!" },
      { speaker: "老师", emoji: "👩‍🏫", side: "left", text_en: "Great job, Sam! Now try four plus six.", text_cn: "做得好,Sam!试试四加六。" },
      { speaker: "Sam", emoji: "👦", side: "right", text_en: "Four plus six is... ten!", text_cn: "四加六是...十!" },
      { speaker: "老师", emoji: "👩‍🏫", side: "left", text_en: "Wonderful! You are a math star!", text_cn: "太棒了!你是数学之星!" }
    ],
    questions: [
      {
        type: "listen_choose",
        stem_cn: "2 + 3 = ?",
        stem_en: "What is 2 + 3?",
        options: [
        { text_en: "Five", text_cn: "五", correct: true },
        { text_en: "Four", text_cn: "四", correct: false },
        { text_en: "Six", text_cn: "六", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Sam 答 It's five",
        feedback_wrong_cn: "2 加 3 等于 five 五~",
      },
      {
        type: "comprehension",
        stem_cn: "老师怎么称赞 Sam?",
        stem_en: "How does the teacher praise Sam?",
        options: [
        { text_en: "A math star", text_cn: "数学之星", correct: true },
        { text_en: "A good boy", text_cn: "好孩子", correct: false },
        { text_en: "A super hero", text_cn: "超级英雄", correct: false }
        ],
        feedback_correct_cn: "🌟 对!老师说 You are a math star",
        feedback_wrong_cn: "老师叫 Sam math star 数学之星~",
      }
    ],
  },
  {
    id: "ld30",
    theme: "school",
    themeCn: "学校",
    difficulty: 2,
    sortOrder: 30,
    title_cn: "美术课",
    title_en: "Art Class",
    scene_cn: "美术课,孩子们在画画",
    emoji: "🎨",
    bg: "from-violet-400 to-purple-500",
    lines: [
      { speaker: "老师", emoji: "👩‍🏫", side: "left", text_en: "Today we'll draw your favorite animal.", text_cn: "今天我们画最喜欢的动物。" },
      { speaker: "Lily", emoji: "👧", side: "right", text_en: "I'll draw a big purple cat!", text_cn: "我要画一只大紫猫!" },
      { speaker: "Sam", emoji: "👦", side: "left", text_en: "I'm drawing a green dog!", text_cn: "我要画绿色的狗!" },
      { speaker: "老师", emoji: "👩‍🏫", side: "right", text_en: "Wow, so creative! Show me when done.", text_cn: "哇,真有创意!画完给我看。" },
      { speaker: "Lily", emoji: "👧", side: "right", text_en: "Look! My purple cat is finished!", text_cn: "看!我的紫猫画完了!" }
    ],
    questions: [
      {
        type: "comprehension",
        stem_cn: "Lily 画了什么?",
        stem_en: "What does Lily draw?",
        options: [
        { text_en: "A purple cat", text_cn: "紫色的猫", correct: true },
        { text_en: "A red dog", text_cn: "红色的狗", correct: false },
        { text_en: "A blue bird", text_cn: "蓝色的鸟", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Lily 说 a big purple cat",
        feedback_wrong_cn: "Lily 画 purple cat 紫猫~",
      },
      {
        type: "comprehension",
        stem_cn: "老师让大家画什么?",
        stem_en: "What does the teacher ask to draw?",
        options: [
        { text_en: "Favorite animal", text_cn: "最喜欢的动物", correct: true },
        { text_en: "Favorite food", text_cn: "最喜欢的食物", correct: false },
        { text_en: "Favorite toy", text_cn: "最喜欢的玩具", correct: false }
        ],
        feedback_correct_cn: "🌟 对!老师说 your favorite animal",
        feedback_wrong_cn: "老师让大家画 favorite animal 最爱的动物~",
      }
    ],
  },
  {
    id: "ld31",
    theme: "weather",
    themeCn: "天气",
    difficulty: 2,
    sortOrder: 31,
    title_cn: "今天天气怎样",
    title_en: "How's the Weather?",
    scene_cn: "早上,Mei 和妈妈看天气",
    emoji: "☀️",
    bg: "from-sky-300 to-blue-400",
    lines: [
      { speaker: "Mei", emoji: "👧", side: "left", text_en: "Mom, how's the weather today?", text_cn: "妈妈,今天天气怎样?" },
      { speaker: "妈妈", emoji: "👩", side: "right", text_en: "Look out the window! It's sunny!", text_cn: "看窗外!很晴朗!" },
      { speaker: "Mei", emoji: "👧", side: "left", text_en: "Yay! Can we go to the park?", text_cn: "耶!我们能去公园吗?" },
      { speaker: "妈妈", emoji: "👩", side: "right", text_en: "Sure! Don't forget your hat.", text_cn: "当然!别忘了你的帽子。" },
      { speaker: "Mei", emoji: "👧", side: "left", text_en: "OK! I love sunny days!", text_cn: "好!我爱晴天!" }
    ],
    questions: [
      {
        type: "listen_choose",
        stem_cn: "今天天气怎样?",
        stem_en: "What's the weather?",
        options: [
        { text_en: "Sunny", text_cn: "晴朗", correct: true },
        { text_en: "Rainy", text_cn: "下雨", correct: false },
        { text_en: "Cloudy", text_cn: "多云", correct: false }
        ],
        feedback_correct_cn: "🌟 对!妈妈说 It's sunny",
        feedback_wrong_cn: "今天 sunny 晴天~",
      },
      {
        type: "comprehension",
        stem_cn: "Mei 想去哪?",
        stem_en: "Where does Mei want to go?",
        options: [
        { text_en: "The park", text_cn: "公园", correct: true },
        { text_en: "School", text_cn: "学校", correct: false },
        { text_en: "Grandma's house", text_cn: "奶奶家", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Mei 说 go to the park",
        feedback_wrong_cn: "Mei 想去 park 公园~",
      }
    ],
  },
  {
    id: "ld32",
    theme: "weather",
    themeCn: "天气",
    difficulty: 2,
    sortOrder: 32,
    title_cn: "下雨啦",
    title_en: "It's Raining",
    scene_cn: "Sam 准备出门,下雨了",
    emoji: "🌧️",
    bg: "from-slate-400 to-blue-500",
    lines: [
      { speaker: "Sam", emoji: "👦", side: "left", text_en: "Oh no, it's raining outside!", text_cn: "糟糕,外面下雨了!" },
      { speaker: "妈妈", emoji: "👩", side: "right", text_en: "Take your umbrella, dear.", text_cn: "带上你的伞,宝贝。" },
      { speaker: "Sam", emoji: "👦", side: "left", text_en: "I can't find it! Where is it?", text_cn: "我找不到!在哪?" },
      { speaker: "妈妈", emoji: "👩", side: "right", text_en: "It's by the door. Look down.", text_cn: "在门边。往下看。" },
      { speaker: "Sam", emoji: "👦", side: "left", text_en: "Thanks, Mom! See you later!", text_cn: "谢谢妈妈!再见!" }
    ],
    questions: [
      {
        type: "comprehension",
        stem_cn: "天气怎样?",
        stem_en: "How's the weather?",
        options: [
        { text_en: "Raining", text_cn: "下雨", correct: true },
        { text_en: "Snowing", text_cn: "下雪", correct: false },
        { text_en: "Sunny", text_cn: "晴天", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Sam 说 it's raining",
        feedback_wrong_cn: "外面 raining 在下雨~",
      },
      {
        type: "comprehension",
        stem_cn: "Sam 需要带什么?",
        stem_en: "What does Sam need to take?",
        options: [
        { text_en: "Umbrella", text_cn: "伞", correct: true },
        { text_en: "Hat", text_cn: "帽子", correct: false },
        { text_en: "Bag", text_cn: "包", correct: false }
        ],
        feedback_correct_cn: "🌟 对!妈妈说 Take your umbrella",
        feedback_wrong_cn: "Sam 要带 umbrella 伞~",
      }
    ],
  },
  {
    id: "ld33",
    theme: "time",
    themeCn: "时间",
    difficulty: 2,
    sortOrder: 33,
    title_cn: "几点了?",
    title_en: "What Time Is It?",
    scene_cn: "Mei 在做作业,问爸爸时间",
    emoji: "🕐",
    bg: "from-purple-300 to-pink-400",
    lines: [
      { speaker: "Mei", emoji: "👧", side: "left", text_en: "Dad, what time is it now?", text_cn: "爸爸,现在几点?" },
      { speaker: "爸爸", emoji: "👨", side: "right", text_en: "It's three o'clock. Why?", text_cn: "三点了。怎么了?" },
      { speaker: "Mei", emoji: "👧", side: "left", text_en: "When can I watch cartoons?", text_cn: "我什么时候可以看动画片?" },
      { speaker: "爸爸", emoji: "👨", side: "right", text_en: "After your homework. Maybe at five.", text_cn: "做完作业后。大概五点。" },
      { speaker: "Mei", emoji: "👧", side: "left", text_en: "OK! Two more hours!", text_cn: "好!还有两小时!" }
    ],
    questions: [
      {
        type: "listen_choose",
        stem_cn: "现在几点?",
        stem_en: "What time is it?",
        options: [
        { text_en: "Three o'clock", text_cn: "3 点", correct: true },
        { text_en: "Five o'clock", text_cn: "5 点", correct: false },
        { text_en: "Six o'clock", text_cn: "6 点", correct: false }
        ],
        feedback_correct_cn: "🌟 对!爸爸说 It's three o'clock",
        feedback_wrong_cn: "现在 three o'clock 3 点~",
      },
      {
        type: "comprehension",
        stem_cn: "Mei 什么时候能看动画?",
        stem_en: "When can Mei watch cartoons?",
        options: [
        { text_en: "After homework", text_cn: "做完作业", correct: true },
        { text_en: "Right now", text_cn: "马上", correct: false },
        { text_en: "Tomorrow", text_cn: "明天", correct: false }
        ],
        feedback_correct_cn: "🌟 对!爸爸说 After your homework",
        feedback_wrong_cn: "做完作业 after homework 才可以看~",
      }
    ],
  },
  {
    id: "ld34",
    theme: "time",
    themeCn: "时间",
    difficulty: 2,
    sortOrder: 34,
    title_cn: "今天星期几",
    title_en: "What Day Is It?",
    scene_cn: "Sam 醒来,问妈妈今天星期几",
    emoji: "📅",
    bg: "from-cyan-300 to-teal-400",
    lines: [
      { speaker: "Sam", emoji: "👦", side: "left", text_en: "Mom, what day is today?", text_cn: "妈妈,今天星期几?" },
      { speaker: "妈妈", emoji: "👩", side: "right", text_en: "It's Saturday! No school today!", text_cn: "周六!今天不上学!" },
      { speaker: "Sam", emoji: "👦", side: "left", text_en: "Yay! Can we go swimming?", text_cn: "耶!我们去游泳吗?" },
      { speaker: "妈妈", emoji: "👩", side: "right", text_en: "Yes! After breakfast we'll go.", text_cn: "好!吃完早餐就去。" },
      { speaker: "Sam", emoji: "👦", side: "left", text_en: "Saturday is my favorite day!", text_cn: "周六是我最爱的日子!" }
    ],
    questions: [
      {
        type: "listen_choose",
        stem_cn: "今天星期几?",
        stem_en: "What day is it?",
        options: [
        { text_en: "Saturday", text_cn: "周六", correct: true },
        { text_en: "Sunday", text_cn: "周日", correct: false },
        { text_en: "Monday", text_cn: "周一", correct: false }
        ],
        feedback_correct_cn: "🌟 对!妈妈说 It's Saturday",
        feedback_wrong_cn: "今天 Saturday 周六~",
      },
      {
        type: "comprehension",
        stem_cn: "他们今天打算做什么?",
        stem_en: "What will they do?",
        options: [
        { text_en: "Go swimming", text_cn: "去游泳", correct: true },
        { text_en: "Go shopping", text_cn: "去购物", correct: false },
        { text_en: "Stay home", text_cn: "待在家", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Sam 问 Can we go swimming?",
        feedback_wrong_cn: "他们要 go swimming 去游泳~",
      }
    ],
  },
  {
    id: "ld35",
    theme: "clothes",
    themeCn: "衣服",
    difficulty: 2,
    sortOrder: 35,
    title_cn: "今天穿什么",
    title_en: "What to Wear",
    scene_cn: "早上,Lily 在挑衣服",
    emoji: "👕",
    bg: "from-pink-400 to-rose-500",
    lines: [
      { speaker: "Lily", emoji: "👧", side: "left", text_en: "Mom, what should I wear today?", text_cn: "妈妈,我今天穿什么?" },
      { speaker: "妈妈", emoji: "👩", side: "right", text_en: "It's cold. Wear your red sweater.", text_cn: "今天冷。穿你的红毛衣。" },
      { speaker: "Lily", emoji: "👧", side: "left", text_en: "Can I also wear my blue jeans?", text_cn: "我也能穿蓝牛仔裤吗?" },
      { speaker: "妈妈", emoji: "👩", side: "right", text_en: "Sure! And don't forget warm socks.", text_cn: "当然!别忘了厚袜子。" },
      { speaker: "Lily", emoji: "👧", side: "left", text_en: "OK! I'll be warm and cozy!", text_cn: "好!我会很暖和!" }
    ],
    questions: [
      {
        type: "comprehension",
        stem_cn: "Lily 妈妈让她穿什么?",
        stem_en: "What does Mom tell her to wear?",
        options: [
        { text_en: "Red sweater", text_cn: "红毛衣", correct: true },
        { text_en: "Yellow shirt", text_cn: "黄衬衫", correct: false },
        { text_en: "Green coat", text_cn: "绿外套", correct: false }
        ],
        feedback_correct_cn: "🌟 对!妈妈说 Wear your red sweater",
        feedback_wrong_cn: "Lily 穿 red sweater 红毛衣~",
      },
      {
        type: "comprehension",
        stem_cn: "天气怎样?",
        stem_en: "How's the weather?",
        options: [
        { text_en: "Cold", text_cn: "冷", correct: true },
        { text_en: "Hot", text_cn: "热", correct: false },
        { text_en: "Warm", text_cn: "温暖", correct: false }
        ],
        feedback_correct_cn: "🌟 对!妈妈说 It's cold",
        feedback_wrong_cn: "天气 cold 冷~",
      }
    ],
  },
  {
    id: "ld36",
    theme: "rooms",
    themeCn: "房间",
    difficulty: 2,
    sortOrder: 36,
    title_cn: "我的房间",
    title_en: "My Room",
    scene_cn: "Tom 邀请朋友 Jake 参观自己的房间",
    emoji: "🛏️",
    bg: "from-blue-300 to-indigo-400",
    lines: [
      { speaker: "Tom", emoji: "👦", side: "left", text_en: "Welcome to my room, Jake!", text_cn: "欢迎来我房间,Jake!" },
      { speaker: "Jake", emoji: "👦", side: "right", text_en: "Wow, your room is so cool!", text_cn: "哇,你房间真酷!" },
      { speaker: "Tom", emoji: "👦", side: "left", text_en: "Look! That's my new bookshelf.", text_cn: "看!那是我的新书架。" },
      { speaker: "Jake", emoji: "👦", side: "right", text_en: "And so many toys on the floor!", text_cn: "地上还有好多玩具!" },
      { speaker: "Tom", emoji: "👦", side: "left", text_en: "Let's play with the cars!", text_cn: "我们玩玩具车吧!" }
    ],
    questions: [
      {
        type: "comprehension",
        stem_cn: "Tom 让 Jake 看什么?",
        stem_en: "What does Tom show Jake?",
        options: [
        { text_en: "New bookshelf", text_cn: "新书架", correct: true },
        { text_en: "New bed", text_cn: "新床", correct: false },
        { text_en: "New chair", text_cn: "新椅子", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Tom 说 my new bookshelf",
        feedback_wrong_cn: "Tom 给 Jake 看 bookshelf 书架~",
      },
      {
        type: "comprehension",
        stem_cn: "他们要做什么?",
        stem_en: "What will they do?",
        options: [
        { text_en: "Play with cars", text_cn: "玩玩具车", correct: true },
        { text_en: "Read books", text_cn: "看书", correct: false },
        { text_en: "Go outside", text_cn: "出去", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Tom 说 Let's play with the cars",
        feedback_wrong_cn: "他们要 play with cars 玩玩具车~",
      }
    ],
  },
  {
    id: "ld37",
    theme: "hobbies",
    themeCn: "兴趣爱好",
    difficulty: 2,
    sortOrder: 37,
    title_cn: "你的爱好是什么",
    title_en: "What's Your Hobby?",
    scene_cn: "课间,两个朋友聊各自的爱好",
    emoji: "🎨",
    bg: "from-emerald-300 to-teal-500",
    lines: [
      { speaker: "Anna", emoji: "👧", side: "left", text_en: "What do you like to do after school?", text_cn: "你放学后喜欢做什么?" },
      { speaker: "Mei", emoji: "👧", side: "right", text_en: "I love drawing pictures. You?", text_cn: "我喜欢画画。你呢?" },
      { speaker: "Anna", emoji: "👧", side: "left", text_en: "I play the piano every day.", text_cn: "我每天弹钢琴。" },
      { speaker: "Mei", emoji: "👧", side: "right", text_en: "Wow, that's amazing! Is it hard?", text_cn: "哇,真厉害!难吗?" },
      { speaker: "Anna", emoji: "👧", side: "left", text_en: "A little, but very fun!", text_cn: "有一点,但很好玩!" }
    ],
    questions: [
      {
        type: "comprehension",
        stem_cn: "Mei 喜欢做什么?",
        stem_en: "What does Mei like to do?",
        options: [
        { text_en: "Drawing", text_cn: "画画", correct: true },
        { text_en: "Singing", text_cn: "唱歌", correct: false },
        { text_en: "Dancing", text_cn: "跳舞", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Mei 说 I love drawing pictures",
        feedback_wrong_cn: "Mei 喜欢 drawing 画画~",
      },
      {
        type: "comprehension",
        stem_cn: "Anna 每天做什么?",
        stem_en: "What does Anna do every day?",
        options: [
        { text_en: "Play the piano", text_cn: "弹钢琴", correct: true },
        { text_en: "Watch TV", text_cn: "看电视", correct: false },
        { text_en: "Read books", text_cn: "看书", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Anna 说 I play the piano every day",
        feedback_wrong_cn: "Anna 每天 play the piano 弹钢琴~",
      }
    ],
  },
  {
    id: "ld38",
    theme: "sports",
    themeCn: "运动",
    difficulty: 2,
    sortOrder: 38,
    title_cn: "一起踢球",
    title_en: "Let's Play Soccer",
    scene_cn: "操场上,Sam 想找朋友踢足球",
    emoji: "⚽",
    bg: "from-green-400 to-emerald-500",
    lines: [
      { speaker: "Sam", emoji: "👦", side: "left", text_en: "Hey Tom! Want to play soccer?", text_cn: "嘿 Tom!想踢足球吗?" },
      { speaker: "Tom", emoji: "👦", side: "right", text_en: "Yes! I love soccer! How many players?", text_cn: "好!我爱足球!几个人玩?" },
      { speaker: "Sam", emoji: "👦", side: "left", text_en: "Just us two. We can take turns.", text_cn: "就我们俩。我们轮流。" },
      { speaker: "Tom", emoji: "👦", side: "right", text_en: "Cool! I'll kick first. Watch this!", text_cn: "酷!我先踢。看这个!" },
      { speaker: "Sam", emoji: "👦", side: "left", text_en: "Wow, great kick! Now my turn!", text_cn: "哇,踢得好!现在轮到我!" }
    ],
    questions: [
      {
        type: "comprehension",
        stem_cn: "他们玩什么运动?",
        stem_en: "What sport do they play?",
        options: [
        { text_en: "Soccer", text_cn: "足球", correct: true },
        { text_en: "Basketball", text_cn: "篮球", correct: false },
        { text_en: "Tennis", text_cn: "网球", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Sam 说 play soccer",
        feedback_wrong_cn: "他们玩 soccer 足球~",
      },
      {
        type: "comprehension",
        stem_cn: "谁先踢?",
        stem_en: "Who kicks first?",
        options: [
        { text_en: "Tom", text_cn: "Tom", correct: true },
        { text_en: "Sam", text_cn: "Sam", correct: false },
        { text_en: "Both at once", text_cn: "两个人一起", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Tom 说 I'll kick first",
        feedback_wrong_cn: "Tom 先踢,他说 I'll kick first~",
      }
    ],
  },
  {
    id: "ld39",
    theme: "jobs",
    themeCn: "职业",
    difficulty: 3,
    sortOrder: 39,
    title_cn: "我妈妈是医生",
    title_en: "My Mom Is a Doctor",
    scene_cn: "Mei 和新朋友聊家人",
    emoji: "👩‍⚕️",
    bg: "from-rose-300 to-pink-500",
    lines: [
      { speaker: "Jake", emoji: "👦", side: "left", text_en: "Mei, what does your mom do?", text_cn: "Mei,你妈妈做什么的?" },
      { speaker: "Mei", emoji: "👧", side: "right", text_en: "She's a doctor! She helps sick people.", text_cn: "她是医生!她帮助病人。" },
      { speaker: "Jake", emoji: "👦", side: "left", text_en: "That's amazing! What about your dad?", text_cn: "好棒!那你爸爸呢?" },
      { speaker: "Mei", emoji: "👧", side: "right", text_en: "He's a teacher. He teaches math.", text_cn: "他是老师。他教数学。" },
      { speaker: "Jake", emoji: "👦", side: "left", text_en: "My dad is a chef. He makes pizza!", text_cn: "我爸爸是厨师。他做披萨!" }
    ],
    questions: [
      {
        type: "comprehension",
        stem_cn: "Mei 妈妈是做什么的?",
        stem_en: "What is Mei's mom?",
        options: [
        { text_en: "A doctor", text_cn: "医生", correct: true },
        { text_en: "A teacher", text_cn: "老师", correct: false },
        { text_en: "A chef", text_cn: "厨师", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Mei 说 She's a doctor",
        feedback_wrong_cn: "Mei 妈妈是 doctor 医生~",
      },
      {
        type: "comprehension",
        stem_cn: "Jake 的爸爸做什么?",
        stem_en: "What does Jake's dad do?",
        options: [
        { text_en: "A chef", text_cn: "厨师", correct: true },
        { text_en: "A doctor", text_cn: "医生", correct: false },
        { text_en: "A teacher", text_cn: "老师", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Jake 说 My dad is a chef",
        feedback_wrong_cn: "Jake 爸爸是 chef 厨师~",
      }
    ],
  },
  {
    id: "ld40",
    theme: "transport",
    themeCn: "交通工具",
    difficulty: 2,
    sortOrder: 40,
    title_cn: "坐公交车",
    title_en: "On the Bus",
    scene_cn: "Tom 第一次自己坐公交车,有点紧张",
    emoji: "🚌",
    bg: "from-amber-400 to-yellow-500",
    lines: [
      { speaker: "Tom", emoji: "👦", side: "left", text_en: "Excuse me, does this bus go downtown?", text_cn: "请问这车去市中心吗?" },
      { speaker: "司机", emoji: "🧑‍✈️", side: "right", text_en: "Yes! Get on. It's two dollars.", text_cn: "对!上车吧。两元。" },
      { speaker: "Tom", emoji: "👦", side: "left", text_en: "Here you go. How long is the ride?", text_cn: "给您。坐多久?" },
      { speaker: "司机", emoji: "🧑‍✈️", side: "right", text_en: "About fifteen minutes. Sit anywhere.", text_cn: "大约十五分钟。随便坐。" },
      { speaker: "Tom", emoji: "👦", side: "left", text_en: "Thank you so much!", text_cn: "非常感谢!" }
    ],
    questions: [
      {
        type: "listen_choose",
        stem_cn: "Tom 坐什么?",
        stem_en: "What is Tom taking?",
        options: [
        { text_en: "A bus", text_cn: "公交车", correct: true },
        { text_en: "A taxi", text_cn: "出租车", correct: false },
        { text_en: "A train", text_cn: "火车", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Tom 问 does this bus go downtown",
        feedback_wrong_cn: "Tom 坐 bus 公交车~",
      },
      {
        type: "comprehension",
        stem_cn: "车费多少?",
        stem_en: "How much is the fare?",
        options: [
        { text_en: "Two dollars", text_cn: "2 美元", correct: true },
        { text_en: "Five dollars", text_cn: "5 美元", correct: false },
        { text_en: "Ten dollars", text_cn: "10 美元", correct: false }
        ],
        feedback_correct_cn: "🌟 对!司机说 It's two dollars",
        feedback_wrong_cn: "车费 two dollars 两元~",
      }
    ],
  }
];

// ─── 工具函数 ──────────────────────────────────────

/** 按主题取 G2 对话 */
export function getDialoguesByThemeG2(theme: string): ListeningDialogue[] {
  return PRIMARY_LISTENING_DIALOGUES_G2.filter(d => d.theme === theme)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** 按 sortOrder 取所有 G2 对话(用于顺序解锁) */
export function getDialoguesSortedG2(): ListeningDialogue[] {
  return [...PRIMARY_LISTENING_DIALOGUES_G2].sort((a, b) => a.sortOrder - b.sortOrder);
}

/** 取下一个未完成的 G2 对话 */
export function getNextDialogueG2(completedIds: string[]): ListeningDialogue | null {
  const sorted = getDialoguesSortedG2();
  return sorted.find(d => !completedIds.includes(d.id)) || null;
}

/** 按 id 查找 G2 对话 */
export function findDialogueG2(id: string): ListeningDialogue | undefined {
  return PRIMARY_LISTENING_DIALOGUES_G2.find(d => d.id === id);
}

/** 取所有 G2 主题列表(用于 UI 分组) */
export function getAllThemesG2(): { theme: string; themeCn: string; count: number }[] {
  const themes = new Map<string, { themeCn: string; count: number }>();
  for (const d of PRIMARY_LISTENING_DIALOGUES_G2) {
    const existing = themes.get(d.theme);
    if (existing) {
      existing.count++;
    } else {
      themes.set(d.theme, { themeCn: d.themeCn, count: 1 });
    }
  }
  return Array.from(themes.entries()).map(([theme, info]) => ({
    theme,
    themeCn: info.themeCn,
    count: info.count,
  }));
}

/** G2 统计 */
export const LISTENING_STATS_G2 = {
  total: 20,
  byThemeCount: {
    greetings: 2,
    family: 2,
    food: 2,
    animals: 2,
    school: 2,
    weather: 2,
    time: 2,
    clothes: 1,
    rooms: 1,
    hobbies: 1,
    sports: 1,
    jobs: 1,
    transport: 1,
  },
  byDifficulty: {
    medium: 19,
    challenge: 1,
  },
};
