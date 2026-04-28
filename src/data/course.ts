export type Lesson = {
  id: number;
  title: string;
  duration: string;
  status: "done" | "current" | "locked";
};

export type Unit = {
  id: number;
  title: string;
  desc: string;
  icon: "star" | "book" | "map" | "shop" | "cloud" | "briefcase";
  iconBg: string; // tailwind bg class
  hours: string;
  lessons: Lesson[];
};

export type Level = {
  id: number;
  name: string;
  unitsCount: number;
  gradient: string; // tailwind bg-grad-N
  units: Unit[];
};

const mkLessons = (titles: string[], doneCount: number, lockFromIdx?: number): Lesson[] =>
  titles.map((t, i) => ({
    id: i + 1,
    title: t,
    duration: `${12 + ((i * 3) % 12)}分钟`,
    status:
      i < doneCount
        ? "done"
        : lockFromIdx !== undefined && i >= lockFromIdx
          ? "locked"
          : i === doneCount
            ? "current"
            : "locked",
  }));

export const LEVELS: Level[] = [
  {
    id: 1,
    name: "LEVEL 1",
    unitsCount: 12,
    gradient: "bg-grad-1",
    units: [
      {
        id: 1,
        title: "基础问候与介绍",
        desc: "学习日常问候、自我介绍和基本礼貌用语",
        icon: "star",
        iconBg: "bg-emerald-500",
        hours: "2小时",
        lessons: mkLessons(
          ["自我介绍", "问候与告别", "基本礼貌用语", "介绍他人", "谈论职业", "描述兴趣爱好", "国籍与语言", "数字 1–20"],
          8,
        ),
      },
      {
        id: 2,
        title: "日常对话",
        desc: "掌握日常生活中的常用对话和表达方式",
        icon: "book",
        iconBg: "bg-violet-500",
        hours: "2.5小时",
        lessons: mkLessons(
          ["早晨问候", "在咖啡馆", "约朋友见面", "打电话", "问时间", "聊天气", "聊周末", "聊家人", "聊工作", "告别用语"],
          3,
          5,
        ),
      },
      {
        id: 3,
        title: "购物与消费",
        desc: "学习购物场景下的英语交流技巧",
        icon: "book",
        iconBg: "bg-violet-400",
        hours: "3小时",
        lessons: mkLessons(
          ["进店招呼", "询问价格", "试穿衣服", "颜色与尺码", "讨价还价", "结账付款", "退换货", "在超市", "买水果", "买电子产品", "找洗手间", "离店道谢"],
          0,
          0,
        ),
      },
      {
        id: 4,
        title: "旅行与交通",
        desc: "出行场景下的实用英语表达",
        icon: "book",
        iconBg: "bg-violet-400",
        hours: "3小时",
        lessons: mkLessons(
          ["问路", "打车", "搭地铁", "买火车票", "在机场", "酒店入住", "景点游览", "餐厅点餐", "纪念品", "退房"],
          0,
          0,
        ),
      },
    ],
  },
  { id: 2, name: "LEVEL 2", unitsCount: 15, gradient: "bg-grad-2", units: [] },
  { id: 3, name: "LEVEL 3", unitsCount: 18, gradient: "bg-grad-3", units: [] },
  { id: 4, name: "LEVEL 4", unitsCount: 20, gradient: "bg-grad-4", units: [] },
  { id: 5, name: "LEVEL 5", unitsCount: 22, gradient: "bg-grad-5", units: [] },
  { id: 6, name: "LEVEL 6", unitsCount: 25, gradient: "bg-grad-6", units: [] },
];

export const LESSON_STEPS = [
  { id: 1, cn: "词汇学习", en: "Vocabulary", icon: "BookOpen" },
  { id: 2, cn: "词汇测试", en: "Vocab Quiz", icon: "Target" },
  { id: 3, cn: "课文阅读", en: "Reading", icon: "Book" },
  { id: 4, cn: "语法重点", en: "Grammar", icon: "FileText" },
  { id: 5, cn: "实用表达", en: "Expressions", icon: "MessageCircle" },
  { id: 6, cn: "选词填空", en: "Fill-in", icon: "Pencil" },
  { id: 7, cn: "阅读测验", en: "Quiz", icon: "HelpCircle" },
  { id: 8, cn: "听力填空", en: "Listening", icon: "Headphones" },
  { id: 9, cn: "实战产出", en: "Output", icon: "Mic" },
] as const;

export type VocabItem = {
  word: string;
  pron: string;
  meaning: string;
  example: string;
  example_cn: string;
};

export type Quiz = {
  q: string;
  options: string[];
  answer: number; // index
  explain?: string;
};

export type FillBlank = {
  sentence: string; // use ___ as blank
  cn: string;
  options: string[];
  answer: string;
};

export type LessonContent = {
  vocab: VocabItem[];
  reading: { en: string; cn: string }[]; // paragraphs
  grammar: { title: string; explain: string; examples: { en: string; cn: string }[] }[];
  expressions: { en: string; cn: string; scene: string }[];
  fillBlanks: FillBlank[];
  quiz: Quiz[];
  listening: { audio: string; blanks: { before: string; answer: string; after: string }[] };
  output: { prompt: string; cn: string; sample: string };
};

export const LESSON_CONTENT: Record<string, LessonContent> = {
  自我介绍: {
    vocab: [
      { word: "introduce", pron: "/ˌɪntrəˈdjuːs/", meaning: "v. 介绍；引进", example: "Let me introduce myself.", example_cn: "让我自我介绍一下。" },
      { word: "hello", pron: "/həˈloʊ/", meaning: "int. 你好", example: "Hello, I'm Mei.", example_cn: "你好，我叫梅。" },
      { word: "name", pron: "/neɪm/", meaning: "n. 名字", example: "My name is Mei.", example_cn: "我的名字叫梅。" },
      { word: "from", pron: "/frʌm/", meaning: "prep. 来自", example: "I'm from Beijing.", example_cn: "我来自北京。" },
      { word: "nice", pron: "/naɪs/", meaning: "adj. 美好的", example: "Nice to meet you.", example_cn: "很高兴认识你。" },
      { word: "meet", pron: "/miːt/", meaning: "v. 遇见，见面", example: "I meet new friends every day.", example_cn: "我每天都认识新朋友。" },
      { word: "student", pron: "/ˈstuːdənt/", meaning: "n. 学生", example: "I am a student.", example_cn: "我是一名学生。" },
      { word: "year", pron: "/jɪr/", meaning: "n. 年；岁", example: "I am twenty years old.", example_cn: "我二十岁。" },
    ],
    reading: [
      { en: "Hello, everyone! My name is Mei. I'm from Beijing, China.", cn: "大家好！我叫梅。我来自中国北京。" },
      { en: "I am twenty years old, and I am a college student.", cn: "我今年二十岁，是一名大学生。" },
      { en: "I love music, reading, and traveling. In my free time, I often listen to pop songs and read English books.", cn: "我喜欢音乐、阅读和旅行。空闲时我常常听流行歌、读英语书。" },
      { en: "I'm learning English because I want to make friends from all over the world. Nice to meet you!", cn: "我正在学英语，因为我想结识来自世界各地的朋友。很高兴认识你！" },
    ],
    grammar: [
      {
        title: "Be 动词：am / is / are",
        explain: "用于介绍身份、年龄、来源。第一人称单数（I）用 am；他/她/它用 is；你/我们/他们用 are。",
        examples: [
          { en: "I am a student.", cn: "我是学生。" },
          { en: "She is from Japan.", cn: "她来自日本。" },
          { en: "They are my friends.", cn: "他们是我的朋友。" },
        ],
      },
      {
        title: "My name is … / I'm …",
        explain: "两种最常见的介绍姓名结构，均可使用，I'm 更口语化。",
        examples: [
          { en: "My name is Lucas.", cn: "我叫卢卡斯。" },
          { en: "I'm Lucas.", cn: "我是卢卡斯。" },
        ],
      },
    ],
    expressions: [
      { en: "Nice to meet you.", cn: "很高兴认识你。", scene: "初次见面" },
      { en: "How do you do?", cn: "你好（正式）。", scene: "正式场合" },
      { en: "What's your name?", cn: "你叫什么名字？", scene: "询问姓名" },
      { en: "Where are you from?", cn: "你来自哪里？", scene: "询问来源" },
      { en: "I'm a student / engineer.", cn: "我是学生 / 工程师。", scene: "介绍身份" },
    ],
    fillBlanks: [
      { sentence: "Hello, my ___ is Mei.", cn: "你好，我的名字叫梅。", options: ["name", "from", "nice", "meet"], answer: "name" },
      { sentence: "I'm ___ Beijing.", cn: "我来自北京。", options: ["in", "at", "from", "on"], answer: "from" },
      { sentence: "___ to meet you.", cn: "很高兴认识你。", options: ["Nice", "Name", "Hello", "Year"], answer: "Nice" },
      { sentence: "I ___ a student.", cn: "我是一名学生。", options: ["am", "is", "are", "be"], answer: "am" },
    ],
    quiz: [
      {
        q: "梅来自哪里？",
        options: ["上海", "北京", "东京", "纽约"],
        answer: 1,
        explain: "文中提到 'I'm from Beijing, China.'",
      },
      {
        q: "梅多大了？",
        options: ["18 岁", "19 岁", "20 岁", "21 岁"],
        answer: 2,
        explain: "I am twenty years old.",
      },
      {
        q: "梅的爱好不包括下面哪一项？",
        options: ["音乐", "阅读", "旅行", "运动"],
        answer: 3,
        explain: "文中提到 music, reading, traveling，没有 sports。",
      },
      {
        q: "梅学英语的目的是？",
        options: ["考试", "工作", "结识世界各地的朋友", "去留学"],
        answer: 2,
      },
    ],
    listening: {
      audio: "Hello, my name is Mei. I am from Beijing. I am a student.",
      blanks: [
        { before: "Hello, my name is", answer: "Mei", after: "." },
        { before: "I am from", answer: "Beijing", after: "." },
        { before: "I am a", answer: "student", after: "." },
      ],
    },
    output: {
      prompt: "Please introduce yourself in 3–5 sentences. Include your name, where you are from, your age, and your hobbies.",
      cn: "请用 3–5 句话介绍自己，包括姓名、来源、年龄和爱好。",
      sample: "Hello! My name is Alex. I'm from Shanghai. I'm twenty-two years old and I am a student. I love movies and basketball. Nice to meet you!",
    },
  },
};

// Backward compatibility
export const SAMPLE_VOCAB: Record<string, VocabItem[]> = Object.fromEntries(
  Object.entries(LESSON_CONTENT).map(([k, v]) => [k, v.vocab]),
);

export const findUnit = (levelId: number, unitId: number) =>
  LEVELS.find((l) => l.id === levelId)?.units.find((u) => u.id === unitId);

export const findLesson = (levelId: number, unitId: number, lessonId: number) =>
  findUnit(levelId, unitId)?.lessons.find((l) => l.id === lessonId);