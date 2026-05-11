// 小学一年级简单绘本(阅读理解模块)
// =============================================================
// 数据规模:10 本绘本 / 68 页 / 20 道理解题
// 难度分级:
//   Level 1 (3 本):每页 3-4 词,主要 CVC + 最基础 Sight Words
//   Level 2 (4 本):每页 5-6 词,加 Sight Words 和形容词
//   Level 3 (3 本):每页 6-7 词,含短句子
//
// 设计原则:
//   1. 严格用学过的词汇:Phonics CVC 词 + Sight Words Fry's 1-50
//   2. 每页配大 emoji 做视觉理解(无图片需求)
//   3. 读后 2 道题:理解 + 词汇
//   4. Spark 作为故事角色出现(sb1, sb3, sb5, sb7, sb10)
//   5. 主题对齐 Lesson 9 主题(日常、动物、家庭、食物、学校、睡前)
//
// UI 使用建议:
//   • 主路径:/primary/reading 或 /primary/books
//   • Adventure 第 3 步周六轮换(目前位置)
//   • 单本阅读页:/primary/reading/read/sb1
//   • 数据库表:primary_storybook_completion(只记录完成度)
//   • 翻页式 UI(左右翻页或上下滑动)
//
// 注意:这是绘本不是 Lesson,孩子是"读"而不是"被教"。
//       页面停留时间应该灵活,孩子愿意读就停,不强制时间。

// ─── 类型定义 ──────────────────────────────────────

export type StoryBookPage = {
  page: number;        // 页码(从 1 开始)
  text_en: string;     // 英文句子
  text_cn: string;     // 中文翻译
  emoji: string;       // 视觉理解 emoji
  // 朗读这一句时使用的声音角色。绘本里大部分句子都是孩子的视角,
  // 默认 "kid"(更明亮的童声 + 略快语速)。当出现妈妈/爸爸/Spark
  // 直接说话的句子时,可以指定不同的声音让孩子分清谁在讲话。
  speaker?: "kid" | "mom" | "dad" | "spark" | "narrator";
};

export type StoryQuestionOption = {
  text_en: string;
  text_cn: string;
  correct: boolean;
};

export type StoryQuestion = {
  type: "comprehension" | "vocabulary";
  // comprehension: 故事理解(谁/什么/在哪里)
  // vocabulary: 词汇理解(某个单词是什么意思)
  stem_cn: string;
  stem_en: string;
  options: StoryQuestionOption[];
  feedback_correct_cn: string;
  feedback_wrong_cn: string;
};

export type StoryBook = {
  id: string;                  // "sb1" ~ "sb10"
  title_cn: string;
  title_en: string;
  description_cn: string;
  level: 1 | 2 | 3;             // 难度
  sortOrder: number;            // 顺序解锁
  bg: string;                   // tailwind gradient
  cover_emoji: string;          // 封面 emoji
  reading_minutes: number;      // 估计阅读分钟数
  pages: StoryBookPage[];       // 6-8 页
  questions: StoryQuestion[];   // 读后 2 道题
};

// ─── 10 本绘本 ──────────────────────────────────────

export const PRIMARY_STORY_BOOKS: StoryBook[] = [
  {
    id: "sb1",
    title_cn: "Spark 和太阳",
    title_en: "Spark and the Sun",
    description_cn: "Spark 第一次见到太阳的故事",
    level: 1,
    sortOrder: 1,
    bg: "from-yellow-300 to-orange-400",
    cover_emoji: "☀️🦊",
    reading_minutes: 2,
    pages: [
      { page: 1, text_en: "Hi! I am Spark.", text_cn: "嗨!我是 Spark。", emoji: "🦊" },
      { page: 2, text_en: "I see the sun.", text_cn: "我看见太阳。", emoji: "☀️" },
      { page: 3, text_en: "The sun is up.", text_cn: "太阳升起来了。", emoji: "☀️⬆️" },
      { page: 4, text_en: "The sun is hot.", text_cn: "太阳很热。", emoji: "☀️🔥" },
      { page: 5, text_en: "I like the sun.", text_cn: "我喜欢太阳。", emoji: "☀️❤️" },
      { page: 6, text_en: "Bye, sun!", text_cn: "再见,太阳!", emoji: "👋☀️" }
    ],
    questions: [
      {
        type: "comprehension",
        stem_cn: "Spark 看见了什么?",
        stem_en: "What does Spark see?",
        options: [
        { text_en: "The sun", text_cn: "太阳", correct: true },
        { text_en: "The moon", text_cn: "月亮", correct: false },
        { text_en: "A cat", text_cn: "一只猫", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Spark 第一句就说 I see the sun",
        feedback_wrong_cn: "Spark 说 I see the sun,他看到了太阳~",
      },
      {
        type: "vocabulary",
        stem_cn: "'hot' 是什么意思?",
        stem_en: "What does 'hot' mean?",
        options: [
        { text_en: "热", text_cn: "热", correct: true },
        { text_en: "冷", text_cn: "冷", correct: false },
        { text_en: "大", text_cn: "大", correct: false }
        ],
        feedback_correct_cn: "🌟 对!太阳是 hot 热的",
        feedback_wrong_cn: "hot 意思是热,太阳很热哦~",
      }
    ],
  },
  {
    id: "sb2",
    title_cn: "我的猫戴帽子",
    title_en: "My Cat Has a Hat",
    description_cn: "一只爱戴帽子的小猫,用 -at 拼读词练习",
    level: 1,
    sortOrder: 2,
    bg: "from-orange-300 to-amber-400",
    cover_emoji: "🐱🎩",
    reading_minutes: 2,
    pages: [
      { page: 1, text_en: "I have a cat.", text_cn: "我有一只猫。", emoji: "🐱" },
      { page: 2, text_en: "My cat has a hat.", text_cn: "我的猫戴着帽子。", emoji: "🎩\n🐱" },
      { page: 3, text_en: "My cat sat on a mat.", text_cn: "我的猫坐在垫子上。", emoji: "🎩\n🐱\n🟫" },
      { page: 4, text_en: "The hat is on the cat.", text_cn: "帽子在猫头上。", emoji: "🎩\n🐱" },
      { page: 5, text_en: "A cat in a hat!", text_cn: "戴帽子的猫!", emoji: "🎩\n🐱" },
      { page: 6, text_en: "My cat is funny!", text_cn: "我的猫真有趣!", emoji: "🎩\n🐱\n😄" }
    ],
    questions: [
      {
        type: "comprehension",
        stem_cn: "猫戴着什么?",
        stem_en: "What does the cat wear?",
        options: [
        { text_en: "A hat", text_cn: "帽子", correct: true },
        { text_en: "A coat", text_cn: "外套", correct: false },
        { text_en: "Shoes", text_cn: "鞋子", correct: false }
        ],
        feedback_correct_cn: "🌟 对!猫戴着 hat 帽子",
        feedback_wrong_cn: "猫戴着 hat 帽子,书名就是 My Cat Has a Hat~",
      },
      {
        type: "vocabulary",
        stem_cn: "'mat' 是什么意思?",
        stem_en: "What is a 'mat'?",
        options: [
        { text_en: "垫子", text_cn: "垫子", correct: true },
        { text_en: "床", text_cn: "床", correct: false },
        { text_en: "椅子", text_cn: "椅子", correct: false }
        ],
        feedback_correct_cn: "🌟 对!mat 就是垫子,cat sat on a mat",
        feedback_wrong_cn: "mat 是垫子,猫坐在 mat 上~",
      }
    ],
  },
  {
    id: "sb3",
    title_cn: "我看见你啦!",
    title_en: "I See You!",
    description_cn: "和家人玩躲猫猫游戏",
    level: 1,
    sortOrder: 3,
    bg: "from-pink-300 to-rose-400",
    cover_emoji: "👀👋",
    reading_minutes: 2,
    pages: [
      { page: 1, text_en: "Where are you, Mom?", text_cn: "妈妈,你在哪里?", emoji: "👩❓" },
      { page: 2, text_en: "I see you! Hi, Mom!", text_cn: "我看见你啦!嗨,妈妈!", emoji: "👩👋" },
      { page: 3, text_en: "Where are you, Dad?", text_cn: "爸爸,你在哪里?", emoji: "👨❓" },
      { page: 4, text_en: "I see you! Hi, Dad!", text_cn: "我看见你啦!嗨,爸爸!", emoji: "👨👋" },
      { page: 5, text_en: "Where are you, Spark?", text_cn: "Spark,你在哪里?", emoji: "🦊❓" },
      { page: 6, text_en: "I see you! Hi, Spark!", text_cn: "我看见你啦!嗨,Spark!", emoji: "🦊👋" }
    ],
    questions: [
      {
        type: "comprehension",
        stem_cn: "他们在玩什么游戏?",
        stem_en: "What game are they playing?",
        options: [
        { text_en: "Hide and seek", text_cn: "躲猫猫", correct: true },
        { text_en: "Tag", text_cn: "追人", correct: false },
        { text_en: "Hopscotch", text_cn: "跳格子", correct: false }
        ],
        feedback_correct_cn: "🌟 对!孩子一直找别人,这是躲猫猫游戏",
        feedback_wrong_cn: "他们在玩 hide and seek 躲猫猫~",
      },
      {
        type: "vocabulary",
        stem_cn: "'see' 是什么意思?",
        stem_en: "What does 'see' mean?",
        options: [
        { text_en: "看见", text_cn: "看见", correct: true },
        { text_en: "听见", text_cn: "听见", correct: false },
        { text_en: "说", text_cn: "说", correct: false }
        ],
        feedback_correct_cn: "🌟 对!see 就是看见",
        feedback_wrong_cn: "see 是看见的意思,书名 I See You 就是我看见你~",
      }
    ],
  },
  {
    id: "sb4",
    title_cn: "大狗和小狗",
    title_en: "Big Dog, Little Dog",
    description_cn: "两只狗的大小对比和友谊",
    level: 2,
    sortOrder: 4,
    bg: "from-amber-400 to-orange-500",
    cover_emoji: "🐕🐶",
    reading_minutes: 3,
    pages: [
      { page: 1, text_en: "Look! Two dogs!", text_cn: "看!两只狗!", emoji: "🐕🐶" },
      { page: 2, text_en: "A big dog.", text_cn: "一只大狗。", emoji: "🐕" },
      { page: 3, text_en: "A little dog.", text_cn: "一只小狗。", emoji: "🐶" },
      { page: 4, text_en: "The big dog can run.", text_cn: "大狗会跑。", emoji: "🐕💨" },
      { page: 5, text_en: "The little dog can run too!", text_cn: "小狗也会跑!", emoji: "🐶💨" },
      { page: 6, text_en: "They run together.", text_cn: "他们一起跑。", emoji: "🐕🐶💨" },
      { page: 7, text_en: "I love dogs!", text_cn: "我爱狗狗!", emoji: "❤️🐕" }
    ],
    questions: [
      {
        type: "comprehension",
        stem_cn: "故事里有几只狗?",
        stem_en: "How many dogs are in the story?",
        options: [
        { text_en: "Two", text_cn: "两只", correct: true },
        { text_en: "One", text_cn: "一只", correct: false },
        { text_en: "Three", text_cn: "三只", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Look! Two dogs! 一只大狗一只小狗",
        feedback_wrong_cn: "故事里有 two dogs 两只狗~",
      },
      {
        type: "comprehension",
        stem_cn: "两只狗都会跑吗?",
        stem_en: "Can both dogs run?",
        options: [
        { text_en: "Yes, both can", text_cn: "都会", correct: true },
        { text_en: "Only the big one", text_cn: "只有大狗", correct: false },
        { text_en: "No", text_cn: "都不会", correct: false }
        ],
        feedback_correct_cn: "🌟 对!大狗会跑,小狗也会(too)",
        feedback_wrong_cn: "小狗也会跑!书里说 The little dog can run too~",
      }
    ],
  },
  {
    id: "sb5",
    title_cn: "上和下",
    title_en: "Up and Down",
    description_cn: "和 Spark 一起跳上跳下",
    level: 2,
    sortOrder: 5,
    bg: "from-sky-400 to-cyan-500",
    cover_emoji: "⬆️⬇️",
    reading_minutes: 3,
    pages: [
      { page: 1, text_en: "I can go up.", text_cn: "我能往上。", emoji: "🧒⬆️" },
      { page: 2, text_en: "I can go down.", text_cn: "我能往下。", emoji: "🧒⬇️" },
      { page: 3, text_en: "I can jump up.", text_cn: "我能跳起来。", emoji: "🤸⬆️" },
      { page: 4, text_en: "I can sit down.", text_cn: "我能坐下。", emoji: "💺" },
      { page: 5, text_en: "Spark can go up.", text_cn: "Spark 能往上。", emoji: "🦊⬆️" },
      { page: 6, text_en: "Spark can come down.", text_cn: "Spark 能下来。", emoji: "🦊⬇️" },
      { page: 7, text_en: "We jump together!", text_cn: "我们一起跳!", emoji: "🦊🧒🤸" }
    ],
    questions: [
      {
        type: "comprehension",
        stem_cn: "故事里谁和孩子一起玩?",
        stem_en: "Who is with the child in the story?",
        options: [
        { text_en: "Spark", text_cn: "Spark", correct: true },
        { text_en: "Mom", text_cn: "妈妈", correct: false },
        { text_en: "A cat", text_cn: "一只猫", correct: false }
        ],
        feedback_correct_cn: "🌟 对!最后他们一起跳,Spark 和孩子一起",
        feedback_wrong_cn: "Spark 和孩子一起玩,最后 We jump together~",
      },
      {
        type: "vocabulary",
        stem_cn: "'down' 是什么意思?",
        stem_en: "What does 'down' mean?",
        options: [
        { text_en: "向下", text_cn: "向下", correct: true },
        { text_en: "向上", text_cn: "向上", correct: false },
        { text_en: "旁边", text_cn: "旁边", correct: false }
        ],
        feedback_correct_cn: "🌟 对!up 是上,down 是下",
        feedback_wrong_cn: "down 是向下,sit down 就是坐下~",
      }
    ],
  },
  {
    id: "sb6",
    title_cn: "红苹果",
    title_en: "The Red Apple",
    description_cn: "一个又大又红的苹果",
    level: 2,
    sortOrder: 6,
    bg: "from-red-400 to-rose-500",
    cover_emoji: "🍎",
    reading_minutes: 3,
    pages: [
      { page: 1, text_en: "I see an apple.", text_cn: "我看见一个苹果。", emoji: "🍎" },
      { page: 2, text_en: "It is a big apple.", text_cn: "是一个大苹果。", emoji: "🍎" },
      { page: 3, text_en: "The apple is red.", text_cn: "苹果是红色的。", emoji: "🍎❤️" },
      { page: 4, text_en: "I like red apples.", text_cn: "我喜欢红苹果。", emoji: "🍎😋" },
      { page: 5, text_en: "I want to eat it!", text_cn: "我想吃它!", emoji: "🤤" },
      { page: 6, text_en: "Yum! It is good.", text_cn: "好吃!真不错。", emoji: "😋" },
      { page: 7, text_en: "Bye, apple!", text_cn: "再见,苹果!", emoji: "👋🍎" }
    ],
    questions: [
      {
        type: "comprehension",
        stem_cn: "苹果是什么颜色?",
        stem_en: "What color is the apple?",
        options: [
        { text_en: "Red", text_cn: "红色", correct: true },
        { text_en: "Green", text_cn: "绿色", correct: false },
        { text_en: "Yellow", text_cn: "黄色", correct: false }
        ],
        feedback_correct_cn: "🌟 对!The apple is red",
        feedback_wrong_cn: "苹果是 red 红色的~",
      },
      {
        type: "vocabulary",
        stem_cn: "'yum' 表示什么?",
        stem_en: "What does 'yum' mean?",
        options: [
        { text_en: "好吃", text_cn: "好吃", correct: true },
        { text_en: "难吃", text_cn: "难吃", correct: false },
        { text_en: "饿", text_cn: "饿", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Yum 是好吃的意思",
        feedback_wrong_cn: "Yum 是好吃!吃到好吃的就喊 Yum~",
      }
    ],
  },
  {
    id: "sb7",
    title_cn: "Spark 在哪里?",
    title_en: "Where Is Spark?",
    description_cn: "找一找 Spark 躲在哪里了",
    level: 2,
    sortOrder: 7,
    bg: "from-purple-400 to-violet-500",
    cover_emoji: "🦊❓",
    reading_minutes: 3,
    pages: [
      { page: 1, text_en: "Where is Spark?", text_cn: "Spark 在哪里?", emoji: "🦊❓" },
      { page: 2, text_en: "Is he in the box?", text_cn: "他在盒子里吗?", emoji: "📦" },
      { page: 3, text_en: "No, not in the box.", text_cn: "不,不在盒子里。", emoji: "📦❌" },
      { page: 4, text_en: "Is he on the bed?", text_cn: "他在床上吗?", emoji: "🛏️" },
      { page: 5, text_en: "No, not on the bed.", text_cn: "不,不在床上。", emoji: "🛏️❌" },
      { page: 6, text_en: "Is he under the chair?", text_cn: "他在椅子下面吗?", emoji: "🪑" },
      { page: 7, text_en: "Yes! Here is Spark!", text_cn: "对!Spark 在这里!", emoji: "🦊🎉" },
      { page: 8, text_en: "Hi, Spark! Let's play!", text_cn: "嗨,Spark!我们玩吧!", emoji: "🦊🎮" }
    ],
    questions: [
      {
        type: "comprehension",
        stem_cn: "Spark 最后在哪里?",
        stem_en: "Where is Spark in the end?",
        options: [
        { text_en: "Under the chair", text_cn: "椅子下面", correct: true },
        { text_en: "In the box", text_cn: "盒子里", correct: false },
        { text_en: "On the bed", text_cn: "床上", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Spark 躲在 under the chair 椅子下面",
        feedback_wrong_cn: "Spark 躲在 under the chair 椅子下面~",
      },
      {
        type: "vocabulary",
        stem_cn: "'under' 是什么意思?",
        stem_en: "What does 'under' mean?",
        options: [
        { text_en: "在...下面", text_cn: "在...下面", correct: true },
        { text_en: "在...上面", text_cn: "在...上面", correct: false },
        { text_en: "在...里面", text_cn: "在...里面", correct: false }
        ],
        feedback_correct_cn: "🌟 对!under 是下面,on 是上面",
        feedback_wrong_cn: "under 表示下面,under the chair 椅子下面~",
      }
    ],
  },
  {
    id: "sb8",
    title_cn: "我的家",
    title_en: "My Family",
    description_cn: "介绍我的家人",
    level: 3,
    sortOrder: 8,
    bg: "from-fuchsia-400 to-pink-500",
    cover_emoji: "👨‍👩‍👧‍👦",
    reading_minutes: 4,
    pages: [
      { page: 1, text_en: "This is my family.", text_cn: "这是我的家。", emoji: "👨‍👩‍👧‍👦" },
      { page: 2, text_en: "This is my mom. She is kind.", text_cn: "这是我妈妈。她很善良。", emoji: "👩❤️" },
      { page: 3, text_en: "This is my dad. He is funny.", text_cn: "这是我爸爸。他很有趣。", emoji: "👨😄" },
      { page: 4, text_en: "This is my sister. She is little.", text_cn: "这是我妹妹。她很小。", emoji: "👧" },
      { page: 5, text_en: "I am the big one!", text_cn: "我是大的那个!", emoji: "🧒" },
      { page: 6, text_en: "We have a dog, too.", text_cn: "我们也有一只狗。", emoji: "🐶" },
      { page: 7, text_en: "I love my family.", text_cn: "我爱我的家。", emoji: "❤️" }
    ],
    questions: [
      {
        type: "comprehension",
        stem_cn: "家里有几个人(不算狗)?",
        stem_en: "How many people are in the family?",
        options: [
        { text_en: "Four", text_cn: "四个", correct: true },
        { text_en: "Three", text_cn: "三个", correct: false },
        { text_en: "Five", text_cn: "五个", correct: false }
        ],
        feedback_correct_cn: "🌟 对!妈妈 + 爸爸 + 妹妹 + 我 = 四个人",
        feedback_wrong_cn: "妈妈、爸爸、妹妹、还有我自己,一共 four 四个人~",
      },
      {
        type: "comprehension",
        stem_cn: "妈妈是什么样的人?",
        stem_en: "What is Mom like?",
        options: [
        { text_en: "Kind", text_cn: "善良", correct: true },
        { text_en: "Funny", text_cn: "有趣", correct: false },
        { text_en: "Little", text_cn: "小", correct: false }
        ],
        feedback_correct_cn: "🌟 对!妈妈 is kind 善良,爸爸 is funny 有趣",
        feedback_wrong_cn: "妈妈 is kind 善良(funny 是爸爸)~",
      }
    ],
  },
  {
    id: "sb9",
    title_cn: "我们去上学!",
    title_en: "Let's Go to School!",
    description_cn: "上学路上的一天",
    level: 3,
    sortOrder: 9,
    bg: "from-blue-400 to-indigo-500",
    cover_emoji: "🎒🏫",
    reading_minutes: 4,
    pages: [
      { page: 1, text_en: "It is time for school!", text_cn: "上学时间到了!", emoji: "⏰🏫" },
      { page: 2, text_en: "I have my big bag.", text_cn: "我有我的大书包。", emoji: "🎒" },
      { page: 3, text_en: "My books are in my bag.", text_cn: "我的书在书包里。", emoji: "📚🎒" },
      { page: 4, text_en: "Bye, Mom! See you later.", text_cn: "再见,妈妈!回头见。", emoji: "👋👩" },
      { page: 5, text_en: "I walk to school.", text_cn: "我走路去学校。", emoji: "🚶🏫" },
      { page: 6, text_en: "I see my friends.", text_cn: "我看到我的朋友们。", emoji: "👫" },
      { page: 7, text_en: "I love school!", text_cn: "我爱学校!", emoji: "🏫❤️" }
    ],
    questions: [
      {
        type: "comprehension",
        stem_cn: "孩子书包里有什么?",
        stem_en: "What is in the bag?",
        options: [
        { text_en: "Books", text_cn: "书", correct: true },
        { text_en: "Toys", text_cn: "玩具", correct: false },
        { text_en: "Food", text_cn: "食物", correct: false }
        ],
        feedback_correct_cn: "🌟 对!My books are in my bag",
        feedback_wrong_cn: "书包里有 books 书,书里说 My books are in my bag~",
      },
      {
        type: "comprehension",
        stem_cn: "孩子怎么去学校?",
        stem_en: "How does the child go to school?",
        options: [
        { text_en: "Walk", text_cn: "走路", correct: true },
        { text_en: "Bus", text_cn: "坐公交", correct: false },
        { text_en: "Car", text_cn: "坐车", correct: false }
        ],
        feedback_correct_cn: "🌟 对!I walk to school 我走路去学校",
        feedback_wrong_cn: "孩子 walk to school 走路去学校~",
      }
    ],
  },
  {
    id: "sb10",
    title_cn: "晚安,Spark",
    title_en: "Good Night, Spark",
    description_cn: "和 Spark 一起睡前晚安",
    level: 3,
    sortOrder: 10,
    bg: "from-indigo-500 to-purple-600",
    cover_emoji: "🌙🦊",
    reading_minutes: 4,
    pages: [
      { page: 1, text_en: "It is night time.", text_cn: "是晚上了。", emoji: "🌙" },
      { page: 2, text_en: "I am in my bed.", text_cn: "我在床上。", emoji: "🛏️" },
      { page: 3, text_en: "Spark is with me.", text_cn: "Spark 和我在一起。", emoji: "🦊" },
      { page: 4, text_en: "I read a book.", text_cn: "我读了一本书。", emoji: "📖" },
      { page: 5, text_en: "I close my eyes.", text_cn: "我闭上眼睛。", emoji: "😴" },
      { page: 6, text_en: "Good night, Spark.", text_cn: "晚安,Spark。", emoji: "🦊🌙" },
      { page: 7, text_en: "I love you.", text_cn: "我爱你。", emoji: "💤❤️" }
    ],
    questions: [
      {
        type: "comprehension",
        stem_cn: "孩子在哪里?",
        stem_en: "Where is the child?",
        options: [
        { text_en: "In bed", text_cn: "在床上", correct: true },
        { text_en: "At school", text_cn: "在学校", correct: false },
        { text_en: "Outside", text_cn: "在外面", correct: false }
        ],
        feedback_correct_cn: "🌟 对!I am in my bed",
        feedback_wrong_cn: "孩子在 in my bed 床上,准备睡觉~",
      },
      {
        type: "comprehension",
        stem_cn: "谁陪着孩子?",
        stem_en: "Who is with the child?",
        options: [
        { text_en: "Spark", text_cn: "Spark", correct: true },
        { text_en: "Mom", text_cn: "妈妈", correct: false },
        { text_en: "Sister", text_cn: "妹妹", correct: false }
        ],
        feedback_correct_cn: "🌟 对!Spark is with me",
        feedback_wrong_cn: "Spark 陪着孩子,Spark is with me~",
      }
    ],
  }
];

// ─── 工具函数 ──────────────────────────────────────

/** 按难度取绘本 */
export function getBooksByLevel(level: 1 | 2 | 3): StoryBook[] {
  return PRIMARY_STORY_BOOKS.filter(b => b.level === level)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** 按顺序取所有绘本(用于顺序解锁) */
export function getBooksSorted(): StoryBook[] {
  return [...PRIMARY_STORY_BOOKS].sort((a, b) => a.sortOrder - b.sortOrder);
}

/** 取下一本未读的绘本(用于"继续读新绘本"推送) */
export function getNextBook(completedIds: string[]): StoryBook | null {
  const sorted = getBooksSorted();
  return sorted.find(b => !completedIds.includes(b.id)) || null;
}

/** 按 id 查找 */
export function findBook(id: string): StoryBook | undefined {
  return PRIMARY_STORY_BOOKS.find(b => b.id === id);
}

/** 取下一页内容(用于翻页 UI) */
export function getNextPage(book: StoryBook, currentPage: number): StoryBookPage | null {
  return book.pages.find(p => p.page === currentPage + 1) || null;
}

/** 取上一页内容(用于翻页 UI) */
export function getPrevPage(book: StoryBook, currentPage: number): StoryBookPage | null {
  return book.pages.find(p => p.page === currentPage - 1) || null;
}

/** 检查是否为最后一页 */
export function isLastPage(book: StoryBook, currentPage: number): boolean {
  return currentPage === book.pages.length;
}

/** 统计 */
export const STORY_BOOK_STATS = {
  total: 10,
  byLevel: {
    level1: 3,
    level2: 4,
    level3: 3,
  },
  totalPages: 68,
  totalQuestions: 20,
  averagePagesPerBook: 6.8,
  averageWordsPerPage: 4.3,
};
