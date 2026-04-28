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

export const SAMPLE_VOCAB: Record<string, VocabItem[]> = {
  自我介绍: [
    {
      word: "introduce",
      pron: "/ˌɪntrəˈdjuːs/",
      meaning: "介绍；引进",
      example: "Let me introduce myself.",
      example_cn: "让我自我介绍一下。",
    },
    {
      word: "hello",
      pron: "/həˈloʊ/",
      meaning: "你好",
      example: "Hello, I'm Mei.",
      example_cn: "你好，我叫梅。",
    },
    {
      word: "name",
      pron: "/neɪm/",
      meaning: "名字",
      example: "My name is Mei.",
      example_cn: "我的名字叫梅。",
    },
    {
      word: "from",
      pron: "/frʌm/",
      meaning: "来自",
      example: "I'm from Beijing.",
      example_cn: "我来自北京。",
    },
  ],
};

export const findUnit = (levelId: number, unitId: number) =>
  LEVELS.find((l) => l.id === levelId)?.units.find((u) => u.id === unitId);

export const findLesson = (levelId: number, unitId: number, lessonId: number) =>
  findUnit(levelId, unitId)?.lessons.find((l) => l.id === lessonId);