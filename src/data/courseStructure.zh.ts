// HSK 1 course structure — for English-speaking learners studying Chinese.
// Story arc: David (an American grad student) arrives in Beijing for a
// year-long exchange. Each unit covers ~30-40 of the HSK 1 vocabulary and
// the core grammar points typically taught at that band.
//
// We start with HSK 1 only. HSK 2-6 will be appended to this file once
// HSK 1 has been reviewed and approved.

import type { Level } from "./course";

const mkLessons = (titles: string[]) =>
  titles.map((title, i) => ({
    id: i + 1,
    title,
    duration: `${12 + ((i * 3) % 12)}分钟`,
    status: i === 0 ? ("current" as const) : ("locked" as const),
  }));

export const HSK_LEVELS_RAW: Level[] = [
  {
    id: 1,
    name: "HSK 1",
    unitsCount: 4,
    gradient: "bg-grad-1",
    units: [
      {
        id: 1,
        title: "你好！· Hello!",
        desc: "Greetings, names, and basic introductions",
        icon: "star",
        iconBg: "bg-emerald-500",
        hours: "2小时",
        lessons: mkLessons([
          "你好！· Lesson 1: Hello! (David lands in Beijing)",
          "我叫 David · Lesson 2: My name is David (meeting his host family)",
          "你是哪国人？· Lesson 3: Where are you from? (talking with a neighbor)",
          "认识你很高兴 · Lesson 4: Nice to meet you (first day at the university)",
          "再见！· Lesson 5: Goodbye! (saying bye after the welcome dinner)",
        ]),
      },
      {
        id: 2,
        title: "我的家人 · My family",
        desc: "Family, age, numbers, and possessives",
        icon: "book",
        iconBg: "bg-violet-500",
        hours: "2.5小时",
        lessons: mkLessons([
          "这是我的家人 · Lesson 6: This is my family (showing photos to host mom)",
          "你今年多大？· Lesson 7: How old are you? (chatting with the host kids)",
          "我有一个姐姐 · Lesson 8: I have an older sister (talking about siblings)",
          "我的爸爸是医生 · Lesson 9: My dad is a doctor (talking about jobs)",
          "我们一起吃饭吧 · Lesson 10: Let's eat together (family dinner)",
        ]),
      },
      {
        id: 3,
        title: "在北京的一天 · A day in Beijing",
        desc: "Time, daily routine, food, and shopping",
        icon: "map",
        iconBg: "bg-amber-500",
        hours: "3小时",
        lessons: mkLessons([
          "现在几点？· Lesson 11: What time is it? (David is jet-lagged)",
          "我喜欢喝茶 · Lesson 12: I like to drink tea (breakfast at home)",
          "这个多少钱？· Lesson 13: How much is this? (shopping at the market)",
          "我想吃米饭 · Lesson 14: I want to eat rice (ordering at a restaurant)",
          "今天天气怎么样？· Lesson 15: How's the weather today? (planning a walk)",
        ]),
      },
      {
        id: 4,
        title: "学校与朋友 · School and friends",
        desc: "School life, making friends, and weekend plans",
        icon: "shop",
        iconBg: "bg-sky-500",
        hours: "3.5小时",
        lessons: mkLessons([
          "我去学校 · Lesson 16: I go to school (David's first class)",
          "老师，请再说一遍 · Lesson 17: Teacher, please say it again (in Chinese class)",
          "你会说英语吗？· Lesson 18: Do you speak English? (meeting a classmate)",
          "周末你做什么？· Lesson 19: What do you do on weekends? (making plans)",
          "我很高兴在北京 · Lesson 20: I'm happy in Beijing (one month in — recap)",
        ]),
      },
    ],
  },
];
