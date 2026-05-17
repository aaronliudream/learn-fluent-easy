// 小学一年级听力对话(听力理解模块)
// =============================================================
// 数据规模:20 个听力对话
// 主题对齐:9 个 Lesson 主题(打招呼/颜色/数字/身体/家庭/动物/食物/学校/去学校)
// 难度分级:1 (简单, 14 个) / 2 (中等, 6 个) / 3 (挑战, 0 个 - 一年级不上)
//
// 设计原则:
//   1. 每对话 4-5 轮(短句,孩子能消化)
//   2. 每句 ≤ 8 词(一年级理解水平)
//   3. 完全用学过的 Sight Words (Fry's 1-50) + 基础 Lesson 词汇
//   4. 每对话后 2-3 道理解题(听辨 + 理解 + 应用)
//   5. 题型与 Phonics Quiz 不同:这里是一次性听力测验,不进 SRS
//
// UI 使用建议:
//   • 主路径:/primary/listening
//   • Adventure 第 3 步周三轮换(替换 Lesson)
//   • 单对话页:/primary/listening/play/ld1
//   • 数据库表:primary_listening_completion(只记录是否完成,不做 SRS)

// ─── 类型定义 ──────────────────────────────────────

export type ListeningDialogueLine = {
  speaker: string;
  emoji: string;
  text_en: string;
  text_cn: string;
  side: "left" | "right";
};

export type ListeningQuestionOption = {
  text_en: string;
  text_cn: string;
  correct: boolean;
};

export type ListeningQuestion = {
  type: "listen_choose" | "comprehension" | "application";
  // listen_choose: 听到了什么(听辨能力)
  // comprehension: 理解情境(理解能力)
  // application: 如何回应(应用能力,留作 P2 扩展)
  stem_cn: string;
  stem_en: string;
  options: ListeningQuestionOption[];
  feedback_correct_cn: string;
  feedback_wrong_cn: string;
};

export type ListeningTheme =
  | "greetings"        // 打招呼
  | "colors"           // 颜色
  | "numbers"          // 数字
  | "body"             // 身体
  | "family"           // 家庭
  | "animals"          // 动物
  | "food"             // 食物
  | "school"           // 学校
  | "going_to_school"  // 去学校
  // G2 新增主题
  | "weather"
  | "time"
  | "clothes"
  | "rooms"
  | "hobbies"
  | "sports"
  | "jobs"
  | "transport";

export type ListeningDialogue = {
  id: string;
  theme: ListeningTheme;
  themeCn: string;
  difficulty: 1 | 2 | 3;
  sortOrder: number;
  title_cn: string;
  title_en: string;
  scene_cn: string;
  emoji: string;
  bg: string;                    // tailwind gradient
  lines: ListeningDialogueLine[]; // 对话内容
  questions: ListeningQuestion[]; // 听后理解题
};

// ─── 20 个听力对话 ──────────────────────────────────────

export const PRIMARY_LISTENING_DIALOGUES: ListeningDialogue[] = [
  {
    id: "ld1",
    theme: "greetings",
    themeCn: "打招呼",
    difficulty: 1,
    sortOrder: 1,
    title_cn: "早上到校问候",
    title_en: "Morning at School",
    scene_cn: "早上到校门口,同学向你打招呼",
    emoji: "🏫",
    bg: "from-yellow-300 to-amber-400",
    lines: [
      { speaker: "同学", emoji: "👧", side: "left", text_en: "Hello! Good morning!", text_cn: "你好!早上好!" },
      { speaker: "你", emoji: "👦", side: "right", text_en: "Hi! Good morning!", text_cn: "嗨!早上好!" },
      { speaker: "同学", emoji: "👧", side: "left", text_en: "How are you?", text_cn: "你好吗?" },
      { speaker: "你", emoji: "👦", side: "right", text_en: "I'm fine, thank you.", text_cn: "我很好,谢谢。" },
      { speaker: "同学", emoji: "👧", side: "left", text_en: "Goodbye! See you!", text_cn: "再见!待会见!" }
    ],
    questions: [
      {
        type: "listen_choose",
        stem_cn: "你怎么回答 How are you?",
        stem_en: "How do you answer How are you?",
        options: [
        { text_en: "I'm fine, thank you.", text_cn: "我很好,谢谢。", correct: true },
        { text_en: "Good morning!", text_cn: "早上好!", correct: false },
        { text_en: "My name is Amy.", text_cn: "我叫 Amy。", correct: false }
        ],
        feedback_correct_cn: "🌟 对!How are you 要答 I'm fine, thank you",
        feedback_wrong_cn: "再听一遍,问你好不好要答 I'm fine, thank you~",
      },
      {
        type: "comprehension",
        stem_cn: "这段对话在哪里?",
        stem_en: "Where does this talk happen?",
        options: [
        { text_en: "At school in the morning", text_cn: "早上在学校", correct: true },
        { text_en: "At home at night", text_cn: "晚上在家", correct: false },
        { text_en: "At the zoo", text_cn: "在动物园", correct: false }
        ],
        feedback_correct_cn: "🌟 对!早上到校,大家互道 Good morning",
        feedback_wrong_cn: "这是早上到校的问候,不是在家或动物园哦~",
      }
    ],
  },
  {
    id: "ld2",
    theme: "greetings",
    themeCn: "打招呼",
    difficulty: 1,
    sortOrder: 2,
    title_cn: "认识新同学",
    title_en: "Meet a New Friend",
    scene_cn: "教室里,新同学想认识你",
    emoji: "👋",
    bg: "from-emerald-400 to-teal-500",
    lines: [
      { speaker: "新同学", emoji: "👧", side: "left", text_en: "Hi! What's your name?", text_cn: "嗨!你叫什么?" },
      { speaker: "你", emoji: "👦", side: "right", text_en: "My name is Amy.", text_cn: "我叫 Amy。" },
      { speaker: "新同学", emoji: "👧", side: "left", text_en: "Nice to meet you!", text_cn: "很高兴认识你!" },
      { speaker: "你", emoji: "👦", side: "right", text_en: "Nice to meet you too!", text_cn: "我也很高兴认识你!" }
    ],
    questions: [
      {
        type: "listen_choose",
        stem_cn: "新同学问你什么?",
        stem_en: "What does the new friend ask?",
        options: [
        { text_en: "What's your name?", text_cn: "你叫什么?", correct: true },
        { text_en: "How old are you?", text_cn: "你几岁?", correct: false },
        { text_en: "How are you?", text_cn: "你好吗?", correct: false }
        ],
        feedback_correct_cn: "🌟 对!第一次见面常问 What's your name?",
        feedback_wrong_cn: "再听第一句,新同学问的是 What's your name?~",
      },
      {
        type: "comprehension",
        stem_cn: "你怎么礼貌回应?",
        stem_en: "What is a polite reply?",
        options: [
        { text_en: "Nice to meet you too!", text_cn: "我也很高兴认识你!", correct: true },
        { text_en: "Goodbye!", text_cn: "再见!", correct: false },
        { text_en: "I am fine.", text_cn: "我很好。", correct: false }
        ],
        feedback_correct_cn: "🌟 对!别人说 Nice to meet you,你要说 too",
        feedback_wrong_cn: "认识新朋友要说 Nice to meet you too!~",
      }
    ],
  },
  {
    id: "ld3",
    theme: "school",
    themeCn: "学校",
    difficulty: 1,
    sortOrder: 3,
    title_cn: "老师点名",
    title_en: "Roll Call in Class",
    scene_cn: "上课前,老师在教室里点名",
    emoji: "✏️",
    bg: "from-red-400 to-pink-500",
    lines: [
      { speaker: "老师", emoji: "👩‍🏫", side: "left", text_en: "Good morning, class!", text_cn: "早上好,同学们!" },
      { speaker: "同学们", emoji: "👶", side: "right", text_en: "Good morning, teacher!", text_cn: "早上好,老师!" },
      { speaker: "老师", emoji: "👩‍🏫", side: "left", text_en: "Amy? Are you here?", text_cn: "Amy?你在吗?" },
      { speaker: "Amy", emoji: "👧", side: "right", text_en: "Yes, I am here.", text_cn: "在,我在这里。" }
    ],
    questions: [
      {
        type: "listen_choose",
        stem_cn: "Amy 怎么回答点名?",
        stem_en: "How does Amy answer roll call?",
        options: [
        { text_en: "Yes, I am here.", text_cn: "在,我在这里。", correct: true },
        { text_en: "Goodbye!", text_cn: "再见!", correct: false },
        { text_en: "My name is Tom.", text_cn: "我叫 Tom。", correct: false }
        ],
        feedback_correct_cn: "🌟 对!被点名要说 Yes, I am here",
        feedback_wrong_cn: "老师点名时要说 Yes, I am here~",
      },
      {
        type: "comprehension",
        stem_cn: "这段对话在做什么?",
        stem_en: "What is happening in class?",
        options: [
        { text_en: "The teacher takes roll call", text_cn: "老师在点名", correct: true },
        { text_en: "They eat lunch", text_cn: "他们在吃午饭", correct: false },
        { text_en: "They go home", text_cn: "他们回家了", correct: false }
        ],
        feedback_correct_cn: "🌟 对!老师在问 Amy? Are you here?",
        feedback_wrong_cn: "这是上课前的点名,不是吃饭或回家~",
      }
    ],
  },
  {
    id: "ld4",
    theme: "greetings",
    themeCn: "打招呼",
    difficulty: 1,
    sortOrder: 4,
    title_cn: "放学道别",
    title_en: "Goodbye After School",
    scene_cn: "放学了,你和同学在校门口道别",
    emoji: "👋",
    bg: "from-purple-400 to-pink-400",
    lines: [
      { speaker: "同学", emoji: "👧", side: "left", text_en: "School is over!", text_cn: "放学啦!" },
      { speaker: "你", emoji: "👦", side: "right", text_en: "Yes! Goodbye!", text_cn: "对!再见!" },
      { speaker: "同学", emoji: "👧", side: "left", text_en: "See you tomorrow!", text_cn: "明天见!" },
      { speaker: "你", emoji: "👦", side: "right", text_en: "See you! Bye!", text_cn: "明天见!拜拜!" }
    ],
    questions: [
      {
        type: "listen_choose",
        stem_cn: "同学最后说什么?",
        stem_en: "What does the friend say last?",
        options: [
        { text_en: "See you tomorrow!", text_cn: "明天见!", correct: true },
        { text_en: "Good morning!", text_cn: "早上好!", correct: false },
        { text_en: "What's your name?", text_cn: "你叫什么?", correct: false }
        ],
        feedback_correct_cn: "🌟 对!放学要说 See you tomorrow",
        feedback_wrong_cn: "放学道别要说 See you tomorrow,不是早上好~",
      },
      {
        type: "comprehension",
        stem_cn: "什么时候说 Goodbye?",
        stem_en: "When do you say Goodbye?",
        options: [
        { text_en: "When school is over", text_cn: "放学的时候", correct: true },
        { text_en: "When you meet", text_cn: "见面的时候", correct: false },
        { text_en: "In the morning", text_cn: "早上到校时", correct: false }
        ],
        feedback_correct_cn: "🌟 对!放学离开时说 Goodbye",
        feedback_wrong_cn: "Goodbye 是告别,见面要说 Hello 或 Hi~",
      }
    ],
  },
  {
    id: "ld5",
    theme: "numbers",
    themeCn: "数字",
    difficulty: 1,
    sortOrder: 5,
    title_cn: "数玩具",
    title_en: "Count the Toys",
    scene_cn: "Lily 把所有玩具熊放在床上让弟弟数",
    emoji: "🧸",
    bg: "from-amber-400 to-orange-500",
    lines: [
      { speaker: "Lily", emoji: "👧", side: "left", text_en: "How many bears do you see?", text_cn: "你看到几只熊?" },
      { speaker: "弟弟", emoji: "👶", side: "right", text_en: "One, two, three, four!", text_cn: "一,二,三,四!" },
      { speaker: "Lily", emoji: "👧", side: "left", text_en: "Yes! Four bears.", text_cn: "对!四只熊。" },
      { speaker: "弟弟", emoji: "👶", side: "right", text_en: "I want the big one!", text_cn: "我想要那只大的!" }
    ],
    questions: [
      {
        type: "listen_choose",
        stem_cn: "床上有几只熊?",
        stem_en: "How many bears are there?",
        options: [
        { text_en: "Four", text_cn: "四只", correct: true },
        { text_en: "Three", text_cn: "三只", correct: false },
        { text_en: "Five", text_cn: "五只", correct: false }
        ],
        feedback_correct_cn: "🌟 对!弟弟数到 four,Lily 也确认了",
        feedback_wrong_cn: "弟弟一二三四,一共 four 四只~",
      },
      {
        type: "comprehension",
        stem_cn: "弟弟想要哪一只?",
        stem_en: "Which bear does the little brother want?",
        options: [
        { text_en: "The big one", text_cn: "那只大的", correct: true },
        { text_en: "The small one", text_cn: "那只小的", correct: false },
        { text_en: "The red one", text_cn: "那只红色的", correct: false }
        ],
        feedback_correct_cn: "🌟 对!弟弟说 I want the big one",
        feedback_wrong_cn: "弟弟想要 the big one 那只大的~",
      }
    ],
  },
  {
    id: "ld6",
    theme: "numbers",
    themeCn: "数字",
    difficulty: 1,
    sortOrder: 6,
    title_cn: "我七岁啦",
    title_en: "I Am Seven",
    scene_cn: "新朋友互相问年龄",
    emoji: "🎂",
    bg: "from-pink-400 to-rose-500",
    lines: [
      { speaker: "Sam", emoji: "👦", side: "left", text_en: "Hi! What's your name?", text_cn: "嗨!你叫什么?" },
      { speaker: "Eva", emoji: "👧", side: "right", text_en: "I'm Eva. And you?", text_cn: "我叫 Eva。你呢?" },
      { speaker: "Sam", emoji: "👦", side: "left", text_en: "I'm Sam. How old are you?", text_cn: "我叫 Sam。你几岁?" },
      { speaker: "Eva", emoji: "👧", side: "right", text_en: "I am seven. How about you?", text_cn: "我七岁。你呢?" },
      { speaker: "Sam", emoji: "👦", side: "left", text_en: "Me too! I am seven too!", text_cn: "我也是!我也七岁!" }
    ],
    questions: [
      {
        type: "listen_choose",
        stem_cn: "Eva 几岁?",
        stem_en: "How old is Eva?",
        options: [
        { text_en: "Seven", text_cn: "七岁", correct: true },
        { text_en: "Eight", text_cn: "八岁", correct: false },
        { text_en: "Six", text_cn: "六岁", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Eva 说 I am seven",
        feedback_wrong_cn: "Eva 说她 seven 七岁~",
      },
      {
        type: "comprehension",
        stem_cn: "Sam 也七岁吗?",
        stem_en: "Is Sam also seven?",
        options: [
        { text_en: "Yes, he is.", text_cn: "是的,他是。", correct: true },
        { text_en: "No, he is eight.", text_cn: "不,他八岁。", correct: false },
        { text_en: "We don't know.", text_cn: "我们不知道。", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Sam 最后说 Me too! I am seven too",
        feedback_wrong_cn: "Sam 说 Me too,意思是他也是 seven~",
      }
    ],
  },
  {
    id: "ld7",
    theme: "body",
    themeCn: "身体",
    difficulty: 1,
    sortOrder: 7,
    title_cn: "我的脸",
    title_en: "My Face",
    scene_cn: "妈妈和小朋友指着镜子里的脸",
    emoji: "👀",
    bg: "from-blue-400 to-cyan-500",
    lines: [
      { speaker: "妈妈", emoji: "👩", side: "left", text_en: "Look in the mirror!", text_cn: "看镜子!" },
      { speaker: "小明", emoji: "👦", side: "right", text_en: "I see my eyes.", text_cn: "我看到我的眼睛。" },
      { speaker: "妈妈", emoji: "👩", side: "left", text_en: "What else do you see?", text_cn: "你还看到什么?" },
      { speaker: "小明", emoji: "👦", side: "right", text_en: "I see my nose and mouth!", text_cn: "我看到我的鼻子和嘴!" }
    ],
    questions: [
      {
        type: "listen_choose",
        stem_cn: "小明先看到了什么?",
        stem_en: "What does the boy see first?",
        options: [
        { text_en: "His eyes", text_cn: "他的眼睛", correct: true },
        { text_en: "His mouth", text_cn: "他的嘴", correct: false },
        { text_en: "His ears", text_cn: "他的耳朵", correct: false }
        ],
        feedback_correct_cn: "🌟 对!他第一句说 I see my eyes",
        feedback_wrong_cn: "他先说看到 eyes 眼睛~",
      },
      {
        type: "comprehension",
        stem_cn: "小明在哪里?",
        stem_en: "Where is the boy?",
        options: [
        { text_en: "In front of a mirror", text_cn: "在镜子前面", correct: true },
        { text_en: "At school", text_cn: "在学校", correct: false },
        { text_en: "In bed", text_cn: "在床上", correct: false }
        ],
        feedback_correct_cn: "🌟 对!妈妈说 Look in the mirror",
        feedback_wrong_cn: "妈妈让小明看 mirror 镜子~",
      }
    ],
  },
  {
    id: "ld8",
    theme: "body",
    themeCn: "身体",
    difficulty: 2,
    sortOrder: 8,
    title_cn: "我的手",
    title_en: "Wash Your Hands",
    scene_cn: "吃饭前妈妈让小红洗手",
    emoji: "🧼",
    bg: "from-cyan-300 to-blue-400",
    lines: [
      { speaker: "妈妈", emoji: "👩", side: "left", text_en: "Time to eat! Wash your hands.", text_cn: "吃饭啦!洗手。" },
      { speaker: "小红", emoji: "👧", side: "right", text_en: "OK, Mom!", text_cn: "好的,妈妈!" },
      { speaker: "妈妈", emoji: "👩", side: "left", text_en: "Use soap and water.", text_cn: "用肥皂和水。" },
      { speaker: "小红", emoji: "👧", side: "right", text_en: "Look! My hands are clean!", text_cn: "看!我的手很干净!" }
    ],
    questions: [
      {
        type: "listen_choose",
        stem_cn: "妈妈让小红做什么?",
        stem_en: "What does Mom ask the girl to do?",
        options: [
        { text_en: "Wash her hands", text_cn: "洗手", correct: true },
        { text_en: "Sit down", text_cn: "坐下", correct: false },
        { text_en: "Eat now", text_cn: "现在吃", correct: false }
        ],
        feedback_correct_cn: "🌟 对!妈妈说 Wash your hands",
        feedback_wrong_cn: "妈妈让小红 wash hands 洗手~",
      },
      {
        type: "comprehension",
        stem_cn: "小红的手现在怎么样?",
        stem_en: "How are the girl's hands now?",
        options: [
        { text_en: "Clean", text_cn: "干净", correct: true },
        { text_en: "Dirty", text_cn: "脏", correct: false },
        { text_en: "Cold", text_cn: "冷", correct: false }
        ],
        feedback_correct_cn: "🌟 对!小红最后说 My hands are clean",
        feedback_wrong_cn: "小红的手现在 clean 干净啦~",
      }
    ],
  },
  {
    id: "ld9",
    theme: "family",
    themeCn: "家庭",
    difficulty: 1,
    sortOrder: 9,
    title_cn: "全家照",
    title_en: "Family Photo",
    scene_cn: "小红给同学看一张全家照",
    emoji: "👨‍👩‍👧",
    bg: "from-violet-400 to-purple-500",
    lines: [
      { speaker: "Lily", emoji: "👧", side: "left", text_en: "Who is this?", text_cn: "这是谁?" },
      { speaker: "小红", emoji: "👧", side: "right", text_en: "That's my mom and dad.", text_cn: "那是我妈妈和爸爸。" },
      { speaker: "Lily", emoji: "👧", side: "left", text_en: "And the little baby?", text_cn: "那个小宝宝呢?" },
      { speaker: "小红", emoji: "👧", side: "right", text_en: "That's my brother. He's two.", text_cn: "那是我弟弟。他两岁。" }
    ],
    questions: [
      {
        type: "listen_choose",
        stem_cn: "照片上有谁?",
        stem_en: "Who is in the photo?",
        options: [
        { text_en: "Mom, Dad, and a baby", text_cn: "妈妈,爸爸,和宝宝", correct: true },
        { text_en: "Just Mom", text_cn: "只有妈妈", correct: false },
        { text_en: "Grandma and Grandpa", text_cn: "奶奶和爷爷", correct: false }
        ],
        feedback_correct_cn: "🌟 对!照片有 mom, dad 和小弟弟",
        feedback_wrong_cn: "照片里有 mom, dad 和一个 baby brother~",
      },
      {
        type: "comprehension",
        stem_cn: "小红的弟弟几岁?",
        stem_en: "How old is her brother?",
        options: [
        { text_en: "Two", text_cn: "两岁", correct: true },
        { text_en: "Three", text_cn: "三岁", correct: false },
        { text_en: "Five", text_cn: "五岁", correct: false }
        ],
        feedback_correct_cn: "🌟 对!小红说 He's two",
        feedback_wrong_cn: "弟弟 two 两岁~",
      }
    ],
  },
  {
    id: "ld10",
    theme: "family",
    themeCn: "家庭",
    difficulty: 1,
    sortOrder: 10,
    title_cn: "我爱奶奶",
    title_en: "I Love Grandma",
    scene_cn: "小明的奶奶来家里看他",
    emoji: "👵",
    bg: "from-pink-300 to-rose-400",
    lines: [
      { speaker: "奶奶", emoji: "👵", side: "left", text_en: "Hi, my dear!", text_cn: "嗨,亲爱的!" },
      { speaker: "小明", emoji: "👦", side: "right", text_en: "Grandma! I miss you!", text_cn: "奶奶!我想你!" },
      { speaker: "奶奶", emoji: "👵", side: "left", text_en: "I have a gift for you.", text_cn: "我有礼物给你。" },
      { speaker: "小明", emoji: "👦", side: "right", text_en: "Wow! Thank you, Grandma!", text_cn: "哇!谢谢奶奶!" }
    ],
    questions: [
      {
        type: "listen_choose",
        stem_cn: "谁来看小明?",
        stem_en: "Who comes to visit the boy?",
        options: [
        { text_en: "Grandma", text_cn: "奶奶", correct: true },
        { text_en: "Mom", text_cn: "妈妈", correct: false },
        { text_en: "Sister", text_cn: "姐姐", correct: false }
        ],
        feedback_correct_cn: "🌟 对!小明喊 Grandma!",
        feedback_wrong_cn: "来的是 Grandma 奶奶~",
      },
      {
        type: "comprehension",
        stem_cn: "奶奶给了小明什么?",
        stem_en: "What does Grandma give the boy?",
        options: [
        { text_en: "A gift", text_cn: "一个礼物", correct: true },
        { text_en: "A book", text_cn: "一本书", correct: false },
        { text_en: "A toy", text_cn: "一个玩具", correct: false }
        ],
        feedback_correct_cn: "🌟 对!奶奶说 I have a gift for you",
        feedback_wrong_cn: "奶奶给了 a gift 一个礼物(具体是什么没说哦)~",
      }
    ],
  },
  {
    id: "ld11",
    theme: "family",
    themeCn: "家庭",
    difficulty: 2,
    sortOrder: 11,
    title_cn: "我的姐姐",
    title_en: "My Big Sister",
    scene_cn: "Tom 在跟朋友介绍家里人",
    emoji: "👭",
    bg: "from-fuchsia-400 to-pink-500",
    lines: [
      { speaker: "朋友", emoji: "👦", side: "left", text_en: "Do you have a sister?", text_cn: "你有姐姐吗?" },
      { speaker: "Tom", emoji: "👦", side: "right", text_en: "Yes! Her name is Jane.", text_cn: "有!她叫 Jane。" },
      { speaker: "朋友", emoji: "👦", side: "left", text_en: "Is she old or young?", text_cn: "她大还是小?" },
      { speaker: "Tom", emoji: "👦", side: "right", text_en: "She is older. She is ten.", text_cn: "她大一些。她十岁。" }
    ],
    questions: [
      {
        type: "listen_choose",
        stem_cn: "Tom 的姐姐叫什么?",
        stem_en: "What is Tom's sister's name?",
        options: [
        { text_en: "Jane", text_cn: "Jane", correct: true },
        { text_en: "Lily", text_cn: "Lily", correct: false },
        { text_en: "Eva", text_cn: "Eva", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Tom 说 Her name is Jane",
        feedback_wrong_cn: "姐姐叫 Jane~",
      },
      {
        type: "comprehension",
        stem_cn: "姐姐多大?",
        stem_en: "How old is the sister?",
        options: [
        { text_en: "Ten", text_cn: "十岁", correct: true },
        { text_en: "Seven", text_cn: "七岁", correct: false },
        { text_en: "Eight", text_cn: "八岁", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Tom 说 She is ten",
        feedback_wrong_cn: "姐姐 ten 十岁,比 Tom 大~",
      }
    ],
  },
  {
    id: "ld12",
    theme: "animals",
    themeCn: "动物",
    difficulty: 1,
    sortOrder: 12,
    title_cn: "动物园",
    title_en: "At the Zoo",
    scene_cn: "爸爸带小明去动物园看动物",
    emoji: "🦁",
    bg: "from-orange-400 to-red-500",
    lines: [
      { speaker: "爸爸", emoji: "👨", side: "left", text_en: "Look! It's a big lion!", text_cn: "看!一只大狮子!" },
      { speaker: "小明", emoji: "👦", side: "right", text_en: "Wow, so cool!", text_cn: "哇,太酷了!" },
      { speaker: "爸爸", emoji: "👨", side: "left", text_en: "What animal do you like?", text_cn: "你喜欢什么动物?" },
      { speaker: "小明", emoji: "👦", side: "right", text_en: "I like monkeys best!", text_cn: "我最喜欢猴子!" }
    ],
    questions: [
      {
        type: "listen_choose",
        stem_cn: "他们在哪里?",
        stem_en: "Where are they?",
        options: [
        { text_en: "At the zoo", text_cn: "在动物园", correct: true },
        { text_en: "At the park", text_cn: "在公园", correct: false },
        { text_en: "At home", text_cn: "在家", correct: false }
        ],
        feedback_correct_cn: "🌟 对!他们看到 lion 狮子,在动物园",
        feedback_wrong_cn: "他们在 zoo 动物园,看到了 lion~",
      },
      {
        type: "comprehension",
        stem_cn: "小明最喜欢什么动物?",
        stem_en: "What animal does the boy like best?",
        options: [
        { text_en: "Monkeys", text_cn: "猴子", correct: true },
        { text_en: "Lions", text_cn: "狮子", correct: false },
        { text_en: "Tigers", text_cn: "老虎", correct: false }
        ],
        feedback_correct_cn: "🌟 对!小明说 I like monkeys best",
        feedback_wrong_cn: "小明最喜欢 monkeys 猴子~",
      }
    ],
  },
  {
    id: "ld13",
    theme: "animals",
    themeCn: "动物",
    difficulty: 1,
    sortOrder: 13,
    title_cn: "我家的小狗",
    title_en: "My Pet Dog",
    scene_cn: "Lily 给 Mia 看自己的宠物狗",
    emoji: "🐶",
    bg: "from-amber-300 to-orange-400",
    lines: [
      { speaker: "Lily", emoji: "👧", side: "left", text_en: "This is my dog, Max.", text_cn: "这是我的狗,Max。" },
      { speaker: "Mia", emoji: "👧", side: "right", text_en: "He's so cute! How old is he?", text_cn: "他好可爱!他几岁?" },
      { speaker: "Lily", emoji: "👧", side: "left", text_en: "He is three years old.", text_cn: "他三岁。" },
      { speaker: "Mia", emoji: "👧", side: "right", text_en: "Can I pet him?", text_cn: "我能摸摸他吗?" }
    ],
    questions: [
      {
        type: "listen_choose",
        stem_cn: "小狗叫什么?",
        stem_en: "What is the dog's name?",
        options: [
        { text_en: "Max", text_cn: "Max", correct: true },
        { text_en: "Rex", text_cn: "Rex", correct: false },
        { text_en: "Buddy", text_cn: "Buddy", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Lily 说 This is my dog, Max",
        feedback_wrong_cn: "小狗叫 Max~",
      },
      {
        type: "comprehension",
        stem_cn: "Mia 想做什么?",
        stem_en: "What does Mia want to do?",
        options: [
        { text_en: "Pet the dog", text_cn: "摸摸小狗", correct: true },
        { text_en: "Walk the dog", text_cn: "遛狗", correct: false },
        { text_en: "Feed the dog", text_cn: "喂狗", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Mia 问 Can I pet him?",
        feedback_wrong_cn: "Mia 想 pet 摸摸小狗~",
      }
    ],
  },
  {
    id: "ld14",
    theme: "animals",
    themeCn: "动物",
    difficulty: 2,
    sortOrder: 14,
    title_cn: "农场里有什么",
    title_en: "On the Farm",
    scene_cn: "Tom 跟爷爷去农场,数那里的动物",
    emoji: "🐮",
    bg: "from-green-400 to-lime-500",
    lines: [
      { speaker: "爷爷", emoji: "👴", side: "left", text_en: "Look around. What do you see?", text_cn: "看看周围。你看到什么?" },
      { speaker: "Tom", emoji: "👦", side: "right", text_en: "I see two cows and one pig!", text_cn: "我看到两头牛和一头猪!" },
      { speaker: "爷爷", emoji: "👴", side: "left", text_en: "Good! And what else?", text_cn: "好!还有什么?" },
      { speaker: "Tom", emoji: "👦", side: "right", text_en: "Many chickens. They are noisy!", text_cn: "好多鸡。它们好吵!" }
    ],
    questions: [
      {
        type: "listen_choose",
        stem_cn: "Tom 看到几头牛?",
        stem_en: "How many cows does Tom see?",
        options: [
        { text_en: "Two", text_cn: "两头", correct: true },
        { text_en: "One", text_cn: "一头", correct: false },
        { text_en: "Three", text_cn: "三头", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Tom 说 two cows",
        feedback_wrong_cn: "Tom 看到 two 两头 cows~",
      },
      {
        type: "comprehension",
        stem_cn: "鸡怎么样?",
        stem_en: "What about the chickens?",
        options: [
        { text_en: "They are noisy", text_cn: "它们好吵", correct: true },
        { text_en: "They are quiet", text_cn: "它们好安静", correct: false },
        { text_en: "They are sleeping", text_cn: "它们在睡觉", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Tom 说 They are noisy",
        feedback_wrong_cn: "鸡 noisy 好吵~",
      }
    ],
  },
  {
    id: "ld15",
    theme: "food",
    themeCn: "食物",
    difficulty: 1,
    sortOrder: 15,
    title_cn: "早餐吃什么",
    title_en: "Breakfast Time",
    scene_cn: "妈妈在厨房问小明早餐想吃什么",
    emoji: "🍳",
    bg: "from-yellow-400 to-orange-400",
    lines: [
      { speaker: "妈妈", emoji: "👩", side: "left", text_en: "What do you want for breakfast?", text_cn: "你早餐想吃什么?" },
      { speaker: "小明", emoji: "👦", side: "right", text_en: "I want eggs and milk, please.", text_cn: "我想要鸡蛋和牛奶,谢谢。" },
      { speaker: "妈妈", emoji: "👩", side: "left", text_en: "Do you want bread too?", text_cn: "你也想要面包吗?" },
      { speaker: "小明", emoji: "👦", side: "right", text_en: "Yes, please! I love bread!", text_cn: "好的,谢谢!我爱面包!" }
    ],
    questions: [
      {
        type: "listen_choose",
        stem_cn: "小明想吃什么?",
        stem_en: "What does the boy want?",
        options: [
        { text_en: "Eggs and milk", text_cn: "鸡蛋和牛奶", correct: true },
        { text_en: "Apple and tea", text_cn: "苹果和茶", correct: false },
        { text_en: "Rice and meat", text_cn: "米饭和肉", correct: false }
        ],
        feedback_correct_cn: "🌟 对!小明说 eggs and milk",
        feedback_wrong_cn: "小明想要 eggs 鸡蛋 and milk 牛奶~",
      },
      {
        type: "comprehension",
        stem_cn: "他也想要面包吗?",
        stem_en: "Does he also want bread?",
        options: [
        { text_en: "Yes, he does.", text_cn: "是的,他想要。", correct: true },
        { text_en: "No, he doesn't.", text_cn: "不,他不想要。", correct: false },
        { text_en: "Maybe later.", text_cn: "也许等一会儿。", correct: false }
        ],
        feedback_correct_cn: "🌟 对!小明说 Yes, please! I love bread!",
        feedback_wrong_cn: "小明说 Yes,他也想要 bread~",
      }
    ],
  },
  {
    id: "ld16",
    theme: "food",
    themeCn: "食物",
    difficulty: 1,
    sortOrder: 16,
    title_cn: "我饿了",
    title_en: "I'm Hungry",
    scene_cn: "下午小红跟妈妈说想吃点东西",
    emoji: "🍪",
    bg: "from-orange-300 to-amber-400",
    lines: [
      { speaker: "小红", emoji: "👧", side: "left", text_en: "Mom, I'm hungry.", text_cn: "妈妈,我饿了。" },
      { speaker: "妈妈", emoji: "👩", side: "right", text_en: "What do you want?", text_cn: "你想要什么?" },
      { speaker: "小红", emoji: "👧", side: "left", text_en: "Can I have an apple?", text_cn: "我能要个苹果吗?" },
      { speaker: "妈妈", emoji: "👩", side: "right", text_en: "Sure! Here you go.", text_cn: "当然!给你。" }
    ],
    questions: [
      {
        type: "listen_choose",
        stem_cn: "小红感觉怎么样?",
        stem_en: "How does the girl feel?",
        options: [
        { text_en: "Hungry", text_cn: "饿", correct: true },
        { text_en: "Tired", text_cn: "累", correct: false },
        { text_en: "Happy", text_cn: "开心", correct: false }
        ],
        feedback_correct_cn: "🌟 对!小红说 I'm hungry",
        feedback_wrong_cn: "小红 hungry 饿了~",
      },
      {
        type: "comprehension",
        stem_cn: "小红想吃什么?",
        stem_en: "What does the girl want to eat?",
        options: [
        { text_en: "An apple", text_cn: "一个苹果", correct: true },
        { text_en: "A cookie", text_cn: "一块饼干", correct: false },
        { text_en: "A banana", text_cn: "一根香蕉", correct: false }
        ],
        feedback_correct_cn: "🌟 对!小红问 Can I have an apple?",
        feedback_wrong_cn: "小红想要 an apple 一个苹果~",
      }
    ],
  },
  {
    id: "ld17",
    theme: "school",
    themeCn: "学校",
    difficulty: 1,
    sortOrder: 17,
    title_cn: "我的书包",
    title_en: "My School Bag",
    scene_cn: "课前小红和同桌看彼此的书包里有什么",
    emoji: "🎒",
    bg: "from-blue-400 to-indigo-500",
    lines: [
      { speaker: "Eva", emoji: "👧", side: "left", text_en: "What's in your bag?", text_cn: "你包里有什么?" },
      { speaker: "小红", emoji: "👧", side: "right", text_en: "I have books and pens.", text_cn: "我有书和笔。" },
      { speaker: "Eva", emoji: "👧", side: "left", text_en: "I have a pencil case too.", text_cn: "我也有铅笔盒。" },
      { speaker: "小红", emoji: "👧", side: "right", text_en: "Cool! Let's look together.", text_cn: "酷!我们一起看。" }
    ],
    questions: [
      {
        type: "listen_choose",
        stem_cn: "小红包里有什么?",
        stem_en: "What is in the girl's bag?",
        options: [
        { text_en: "Books and pens", text_cn: "书和笔", correct: true },
        { text_en: "Toys", text_cn: "玩具", correct: false },
        { text_en: "Food", text_cn: "食物", correct: false }
        ],
        feedback_correct_cn: "🌟 对!小红说 books and pens",
        feedback_wrong_cn: "小红有 books 书和 pens 笔~",
      },
      {
        type: "comprehension",
        stem_cn: "Eva 包里有什么特别的?",
        stem_en: "What special thing does Eva have?",
        options: [
        { text_en: "A pencil case", text_cn: "一个铅笔盒", correct: true },
        { text_en: "A ball", text_cn: "一个球", correct: false },
        { text_en: "A doll", text_cn: "一个娃娃", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Eva 说 I have a pencil case too",
        feedback_wrong_cn: "Eva 有 a pencil case 一个铅笔盒~",
      }
    ],
  },
  {
    id: "ld18",
    theme: "school",
    themeCn: "学校",
    difficulty: 2,
    sortOrder: 18,
    title_cn: "教室里",
    title_en: "In the Classroom",
    scene_cn: "老师让小朋友们坐好准备上课",
    emoji: "✏️",
    bg: "from-purple-400 to-violet-500",
    lines: [
      { speaker: "老师", emoji: "👩‍🏫", side: "left", text_en: "Good morning, kids!", text_cn: "早上好,孩子们!" },
      { speaker: "小朋友们", emoji: "👶", side: "right", text_en: "Good morning, teacher!", text_cn: "早上好,老师!" },
      { speaker: "老师", emoji: "👩‍🏫", side: "left", text_en: "Open your books to page 5.", text_cn: "翻到书的第 5 页。" },
      { speaker: "Lily", emoji: "👧", side: "right", text_en: "I can't find it. Can you help me?", text_cn: "我找不到。可以帮我吗?" }
    ],
    questions: [
      {
        type: "listen_choose",
        stem_cn: "老师让大家翻到第几页?",
        stem_en: "Which page does the teacher mention?",
        options: [
        { text_en: "Page 5", text_cn: "第 5 页", correct: true },
        { text_en: "Page 10", text_cn: "第 10 页", correct: false },
        { text_en: "Page 1", text_cn: "第 1 页", correct: false }
        ],
        feedback_correct_cn: "🌟 对!老师说 page 5",
        feedback_wrong_cn: "老师让大家翻到 page 5 第 5 页~",
      },
      {
        type: "comprehension",
        stem_cn: "Lily 怎么了?",
        stem_en: "What's wrong with Lily?",
        options: [
        { text_en: "She can't find the page", text_cn: "她找不到那一页", correct: true },
        { text_en: "She forgot her book", text_cn: "她忘带书了", correct: false },
        { text_en: "She is sleepy", text_cn: "她困了", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Lily 说 I can't find it",
        feedback_wrong_cn: "Lily 找不到那一页,所以求助~",
      }
    ],
  },
  {
    id: "ld19",
    theme: "going_to_school",
    themeCn: "去学校",
    difficulty: 1,
    sortOrder: 19,
    title_cn: "上学路上",
    title_en: "On the Way to School",
    scene_cn: "妈妈送小明上学,路上遇到同学",
    emoji: "🚶",
    bg: "from-sky-400 to-blue-500",
    lines: [
      { speaker: "妈妈", emoji: "👩", side: "left", text_en: "It's time for school. Let's go!", text_cn: "该上学了。我们走!" },
      { speaker: "小明", emoji: "👦", side: "right", text_en: "OK, Mom!", text_cn: "好的,妈妈!" },
      { speaker: "同学", emoji: "👦", side: "left", text_en: "Hi! Going to school?", text_cn: "嗨!去上学?" },
      { speaker: "小明", emoji: "👦", side: "right", text_en: "Yes! Want to walk with me?", text_cn: "对!想和我一起走吗?" }
    ],
    questions: [
      {
        type: "listen_choose",
        stem_cn: "妈妈想做什么?",
        stem_en: "What does Mom want to do?",
        options: [
        { text_en: "Go to school", text_cn: "去上学", correct: true },
        { text_en: "Go home", text_cn: "回家", correct: false },
        { text_en: "Go shopping", text_cn: "去买东西", correct: false }
        ],
        feedback_correct_cn: "🌟 对!妈妈说 time for school. Let's go",
        feedback_wrong_cn: "妈妈说要 go to school 上学~",
      },
      {
        type: "comprehension",
        stem_cn: "小明想和同学怎么去?",
        stem_en: "How does the boy want to go with his classmate?",
        options: [
        { text_en: "Walk together", text_cn: "一起走", correct: true },
        { text_en: "Run", text_cn: "跑", correct: false },
        { text_en: "By bus", text_cn: "坐公交", correct: false }
        ],
        feedback_correct_cn: "🌟 对!小明问 Want to walk with me?",
        feedback_wrong_cn: "小明想一起 walk 走过去~",
      }
    ],
  },
  {
    id: "ld20",
    theme: "going_to_school",
    themeCn: "去学校",
    difficulty: 2,
    sortOrder: 20,
    title_cn: "我的第一天",
    title_en: "My First Day",
    scene_cn: "小红第一天上学,有点紧张,妈妈在送她进校门",
    emoji: "📚",
    bg: "from-rose-400 to-pink-500",
    lines: [
      { speaker: "妈妈", emoji: "👩", side: "left", text_en: "Are you OK, sweetie?", text_cn: "你还好吗,宝贝?" },
      { speaker: "小红", emoji: "👧", side: "right", text_en: "I am a little scared.", text_cn: "我有点害怕。" },
      { speaker: "妈妈", emoji: "👩", side: "left", text_en: "Don't worry. You'll have fun.", text_cn: "别担心。你会玩得开心。" },
      { speaker: "小红", emoji: "👧", side: "right", text_en: "OK. I'll try my best!", text_cn: "好的。我会尽力的!" },
      { speaker: "妈妈", emoji: "👩", side: "left", text_en: "I love you. See you later!", text_cn: "我爱你。一会儿见!" }
    ],
    questions: [
      {
        type: "listen_choose",
        stem_cn: "小红一开始感觉怎么样?",
        stem_en: "How does the girl feel at first?",
        options: [
        { text_en: "A little scared", text_cn: "有点害怕", correct: true },
        { text_en: "Very happy", text_cn: "很开心", correct: false },
        { text_en: "Sleepy", text_cn: "困", correct: false }
        ],
        feedback_correct_cn: "🌟 对!小红说 I am a little scared",
        feedback_wrong_cn: "小红一开始 a little scared 有点害怕~",
      },
      {
        type: "comprehension",
        stem_cn: "妈妈最后说什么?",
        stem_en: "What does Mom say at the end?",
        options: [
        { text_en: "I love you", text_cn: "我爱你", correct: true },
        { text_en: "Goodbye forever", text_cn: "永远再见", correct: false },
        { text_en: "Be careful", text_cn: "小心点", correct: false }
        ],
        feedback_correct_cn: "🌟 对!妈妈说 I love you. See you later",
        feedback_wrong_cn: "妈妈最后说 I love you 我爱你~",
      }
    ],
  }
];


// ─── 工具函数 ──────────────────────────────────────

/** 按主题取对话 */
export function getDialoguesByTheme(theme: ListeningTheme): ListeningDialogue[] {
  return PRIMARY_LISTENING_DIALOGUES.filter(d => d.theme === theme)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** 按难度取对话 */
export function getDialoguesByDifficulty(difficulty: 1 | 2 | 3): ListeningDialogue[] {
  return PRIMARY_LISTENING_DIALOGUES.filter(d => d.difficulty === difficulty)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** 按顺序取所有对话(用于顺序解锁) */
export function getDialoguesSorted(): ListeningDialogue[] {
  return [...PRIMARY_LISTENING_DIALOGUES].sort((a, b) => a.sortOrder - b.sortOrder);
}

/** 取下一个未完成的对话(用于"继续听新对话"推送) */
export function getNextDialogue(completedIds: string[]): ListeningDialogue | null {
  const sorted = getDialoguesSorted();
  return sorted.find(d => !completedIds.includes(d.id)) || null;
}

/** 按 id 查找 */
export function findDialogue(id: string): ListeningDialogue | undefined {
  return PRIMARY_LISTENING_DIALOGUES.find(d => d.id === id);
}

/** 取所有主题列表(用于 UI 分组) */
export function getAllThemes(): { theme: ListeningTheme; themeCn: string; count: number }[] {
  const themes = new Map<ListeningTheme, { themeCn: string; count: number }>();
  for (const d of PRIMARY_LISTENING_DIALOGUES) {
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

/** 统计 */
export const LISTENING_STATS = {
  total: 20,
  byTheme: {
    greetings: 3,
    colors: 0,
    numbers: 2,
    body: 2,
    family: 3,
    animals: 3,
    food: 2,
    school: 3,
    going_to_school: 2,
  },
  byDifficulty: {
    easy: 14,    // difficulty 1
    medium: 6,   // difficulty 2
    challenge: 0, // difficulty 3
  },
};
