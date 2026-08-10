/**
 * Built-in English for the marketing homepage (<T>…</T> source strings).
 * Shown immediately when lang=en — no translate edge function required.
 */
export const LANDING_EN_FALLBACKS: Record<string, string> = {
  "小学": "Primary",
  "初中": "Junior High",
  "高中": "Senior High",
  "浏览课程": "Browse courses",
  "陪伴中国孩子真正走进英语世界": "Helping Chinese students truly enter the world of English",
  "考试要拿分": "Score on exams",
  "英语要会用": "Use English in real life",
  "对照最新中考高考要求 · 同步最新大纲要求 — 让应试和能力同时长进。":
    "Aligned with the latest Zhongkao & Gaokao standards — build test skills and real ability together.",
  "小学英语": "Primary English",
  "启蒙 G1-G2 · 同步 G3-G6": "G1–G2 foundations · G3–G6 textbook sync",
  "初中英语": "Junior High English",
  "语法 · 词汇 · 听说": "Grammar · Vocabulary · Listening & speaking",
  "高中英语": "Senior High English",
  "真题 · 押题 · 写作": "Past papers · Predictions · Writing",
  "AI 对话练习": "AI conversation practice",
  "24h 外教，随时开口": "24/7 tutor — speak anytime",
  "成人英语": "Adult English",
  "A1 → C2 · CEFR 六级": "A1 → C2 · CEFR six levels",
  "为什么很多孩子学了多年英语，": "Why do so many children study English for years",
  "依然不会真正使用英语？": "yet still can't really use it?",
  "传统英语学习": "Traditional English learning",
  "问题出在哪里": "Where it goes wrong",
  "只会刷题做卷": "Only drilling tests and papers",
  "没有真实语境输入": "No real-world language input",
  "缺乏语感与节奏": "Missing feel for rhythm and flow",
  "难以长期积累": "Hard to build lasting progress",
  "我们希望帮助孩子": "What we want for your child",
  "提高考试成绩": "Raise exam scores",
  "建立真实英语能力": "Build real English ability",
  "听懂真实英语": "Understand real spoken English",
  "形成长期英语思维": "Develop long-term English thinking",
  "AI 解决方案": "AI solution",
  "AI 持续分析孩子薄弱点，": "AI continuously analyzes weak spots,",
  "动态生成专属练习": "generates personalized practice",
  "，不再盲目刷题。": " — no more blind drilling.",
  "符合教育部英语新课标": "Aligned with China's English curriculum standards",
  "适合中国小学初高中学生": "Built for Chinese primary, junior & senior students",
  "你是谁？我们都为你准备好了": "Who are you? We've got you covered",
  "我是学生": "I'm a student",
  "想提分、想真正会用英语": "Want better scores and real English skills",
  "3 分钟语法闪练 →": "3-min grammar drill →",
  "我是家长": "I'm a parent",
  "想看孩子学得怎么样、能提多少分": "See how your child is doing and how much they can improve",
  "查看家长报告 →": "View parent report →",
  "我是老师": "I'm a teacher",
  "用 AI 给学生生成讲解卡片": "Use AI to create explanation cards for students",
  "进入老师工作台 →": "Open teacher workspace →",
  "中考高考语法点": "Zhongkao & Gaokao grammar points",
  "AI 智能练习题": "AI practice questions",
  "AI 助手随时答疑": "AI tutor on demand",
  "对标新课标大纲": "Aligned with curriculum standards",
  "他们在 Big Moon 找到了节奏": "They found their rhythm at Big Moon",
  "用户反馈节选 · 已隐去真实姓名": "User feedback excerpts · names anonymized",
  "孩子以前看到英语题就头疼，现在每天主动打卡 15 分钟，月考从 78 涨到 102。":
    "My child used to dread English tests. Now they study 15 minutes a day on their own — monthly score went from 78 to 102.",
  "初二学生家长 · 杭州": "Grade 8 parent · Hangzhou",
  "+24 分": "+24 pts",
  "语法实验室真的把虚拟语气讲明白了，之前老师讲三遍我都懵，这里一次就懂。":
    "The grammar lab finally made subjunctive mood click — three lectures at school left me confused; here I got it in one go.",
  "高三学生 · 北京": "Grade 12 student · Beijing",
  "高考语法 0 失分": "Zero grammar mistakes on Gaokao",
  "AI 小月会针对错题反复出变式，学生不用我盯着也能查漏补缺。":
    "AI Mei Mei generates variants from wrong answers — students fill gaps without me hovering.",
  "公立中学英语老师 · 成都": "Public school English teacher · Chengdu",
  "课后效率 ×3": "3× after-class efficiency",
  /* ── 三张较新的入口卡(图书馆 / 美语 / 词汇)────────────────────────
   * ⚠️ 这三张原本**一条兜底都没有**,只有最早那四张学段卡有。
   *    英文用户看它们走的是 dynamic translate 边缘函数,而那条路径的 CORS
   *    目前是坏的(体检报告 2026-08-09)—— 结果就是**看到原文中文或空白**。
   *    所以这不是锦上添花,是补一个真窟窿(Aaron 2026-08-09 定:三张一起补)。
   * ⚠️ 只补 <T> 包着的 title / desc / coverage。badge 与 tag 在 CourseCard 里是
   *    **裸渲染不过 <T>**,写进来也不会生效 —— 别为了"看起来齐全"往里加死条目。
   * ⚠️ 美语课名读自 lib/american/brand.ts 的常量。**那边改名了,这里的 key 要同步改**,
   *    否则兜底静默失效(key 对不上就回落到 dynamic translate,也就是回落到坏路径)。 */
  "英文图书馆": "English Library",
  "读英文原著 · 点词即懂": "Read the originals · tap any word",
  "现代版美语新概念英语1-4册": "New Concept English 1–4 · American Edition",
  "地道美语 从零开始": "Real American English, from scratch",
  "涵盖新概念1-4册全部词汇与核心知识点": "Covers all vocabulary and key points of Books 1–4",
  "词汇学习": "Vocabulary",
  "中考到托福 · 例句带发音": "Zhongkao to TOEFL · examples with audio",

  "登录 / 注册": "Log in / Sign up",
  "关于我们": "About us",
  "美式俚语": "American slang",
  "隐私": "Privacy",
  "条款": "Terms",
  // 性格测评入口卡(首页学段卡之下)
  "你是哪一种人？16 型人格测评": "Which type are you? A 16-type personality assessment",
  "免费 · 不用注册。测完给你四字母类型、大五人格分数，以及一份为你这种性格写的英语学习法。":
    "Free, no sign-up. You'll get your four-letter type, your Big Five scores, and a way of learning English written for your type.",
  "实时数据": "Live stats",
  "题 已练 / 今日": "Questions practiced today",
  "人 在线学习": "Learners online",
  "平均掌握率": "Avg. mastery rate",
};
