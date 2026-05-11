/**
 * G2 Lesson Stages v2 - 升级版
 * 
 * 修复 v1 的核心问题:关 1 和关 4 是"被动翻页",不是真正学习
 * 升级:每个词卡 / 每个句子加"理解验证 quiz"
 * 
 * 升级原则:
 * - 关 1:听词 → 猜中文意思(4 选 1) → 揭示
 * - 关 4:听句 → 猜句子意图(4 选 1) → 揭示翻译
 * 
 * 升级后:5 关都有"强制交互",不再有"翻页式假学习"
 */

// ─── 类型定义 ──────────────────────────────────────

// Stage 1: 单词卡片 + 词义 quiz
export type Stage1Quiz = {
  question: string;           // "这个词什么意思?"
  correct: string;             // 正确中文
  options: string[];           // 4 个中文选项
};

export type Stage1Card = {
  word: string;
  ipa: string;
  emoji: string;
  meaning_cn: string;
  example_en: string;
  example_cn: string;
  quiz: Stage1Quiz;           // 升级:必须答对才能下一个
};

export type Stage2Question = {
  audio_word: string;
  correct_emoji: string;
  options: string[];
};

export type Stage3Question = {
  image_emoji: string;
  correct_word: string;
  options: string[];
};

// Stage 4: 句子 + 理解 quiz
export type Stage4Quiz = {
  question: string;           // "这句话在做什么?"
  correct: string;             // 正确答案
  options: string[];           // 4 个选项
};

export type Stage4Sentence = {
  en: string;
  cn: string;
  scene_hint?: string;
  quiz: Stage4Quiz;           // 升级:必须答对才能下一句
};

export type Stage5Question = {
  sentence_with_blank: string;
  cn: string;
  correct: string;
  options: string[];
};

export type LessonStages = {
  lesson_id: string;
  lesson_key?: string;
  total_stages: 5;
  stage1: Stage1Card[];
  stage2: Stage2Question[];
  stage3: Stage3Question[];
  stage4: Stage4Sentence[];
  stage5: Stage5Question[];
};

// ─── g2_l01: How's the weather today? ──────────────────────

export const G2_L01_STAGES: LessonStages = {
  lesson_id: "g2_l01",
  total_stages: 5,
  
  // ━━━ 关 1: 单词学习(升级!听 → 猜 → 验证)━━━━━━━━━━━━━━
  // 流程:
  //   1. 显示 emoji + 单词 + IPA(不显示中文)
  //   2. 自动播放音频
  //   3. 弹出 quiz:"这个词什么意思?"
  //   4. 用户选 → 答对揭示中文 → 答错温和提示 + 重选
  //   5. 答对后显示中文 + 例句,然后下一个
  stage1: [
    {
      word: "weather",
      ipa: "/ˈweðər/",
      emoji: "🌤️",
      meaning_cn: "天气",
      example_en: "How's the weather today?",
      example_cn: "今天天气怎样?",
      quiz: {
        question: "这个词什么意思?",
        correct: "天气",
        options: ["天气", "晴朗", "天空", "下雨"],
      },
    },
    {
      word: "sunny",
      ipa: "/ˈsʌni/",
      emoji: "☀️",
      meaning_cn: "晴朗的",
      example_en: "It's sunny today.",
      example_cn: "今天天晴。",
      quiz: {
        question: "这个词什么意思?",
        correct: "晴朗的",
        options: ["阴天的", "晴朗的", "多云的", "下雨的"],
      },
    },
    {
      word: "sky",
      ipa: "/skaɪ/",
      emoji: "☁️",
      meaning_cn: "天空",
      example_en: "The sky is blue.",
      example_cn: "天空是蓝色的。",
      quiz: {
        question: "这个词什么意思?",
        correct: "天空",
        options: ["大地", "海洋", "天空", "森林"],
      },
    },
    {
      word: "hat",
      ipa: "/hæt/",
      emoji: "🎩",
      meaning_cn: "帽子",
      example_en: "Wear your hat.",
      example_cn: "戴上你的帽子。",
      quiz: {
        question: "这个词什么意思?",
        correct: "帽子",
        options: ["鞋子", "衣服", "帽子", "围巾"],
      },
    },
    {
      word: "outside",
      ipa: "/aʊtˈsaɪd/",
      emoji: "🚪",
      meaning_cn: "外面",
      example_en: "Let's go outside.",
      example_cn: "我们出去吧。",
      quiz: {
        question: "这个词什么意思?",
        correct: "外面",
        options: ["里面", "上面", "外面", "下面"],
      },
    },
    {
      word: "blue",
      ipa: "/bluː/",
      emoji: "🟦",
      meaning_cn: "蓝色",
      example_en: "The sky is blue.",
      example_cn: "天空是蓝的。",
      quiz: {
        question: "这个词什么意思?",
        correct: "蓝色",
        options: ["红色", "黄色", "绿色", "蓝色"],
      },
    },
  ],

  // ━━━ 关 2: 听音配图 ━━━━━━━━━━━━━━(v1 不变)
  stage2: [
    {
      audio_word: "weather",
      correct_emoji: "🌤️",
      options: ["🌤️", "🎩", "🚪", "🟦"],
    },
    {
      audio_word: "sunny",
      correct_emoji: "☀️",
      options: ["☁️", "☀️", "🎩", "🟦"],
    },
    {
      audio_word: "sky",
      correct_emoji: "☁️",
      options: ["🎩", "🚪", "☁️", "☀️"],
    },
    {
      audio_word: "hat",
      correct_emoji: "🎩",
      options: ["🎩", "🟦", "🚪", "🌤️"],
    },
    {
      audio_word: "outside",
      correct_emoji: "🚪",
      options: ["☀️", "🎩", "🚪", "☁️"],
    },
    {
      audio_word: "blue",
      correct_emoji: "🟦",
      options: ["☀️", "🟦", "🌤️", "🎩"],
    },
  ],

  // ━━━ 关 3: 看图配词 ━━━━━━━━━━━━━━(v1 不变)
  stage3: [
    {
      image_emoji: "🌤️",
      correct_word: "weather",
      options: ["weather", "hat", "sky", "outside"],
    },
    {
      image_emoji: "☀️",
      correct_word: "sunny",
      options: ["blue", "sunny", "hat", "sky"],
    },
    {
      image_emoji: "☁️",
      correct_word: "sky",
      options: ["hat", "outside", "sky", "sunny"],
    },
    {
      image_emoji: "🎩",
      correct_word: "hat",
      options: ["hat", "blue", "outside", "weather"],
    },
    {
      image_emoji: "🚪",
      correct_word: "outside",
      options: ["sunny", "hat", "outside", "sky"],
    },
    {
      image_emoji: "🟦",
      correct_word: "blue",
      options: ["sunny", "blue", "weather", "hat"],
    },
  ],

  // ━━━ 关 4: 听句子(升级!听 → 猜意图 → 验证)━━━━━━━━━━━━━━
  // 流程:
  //   1. 显示英文句子(隐藏中文)+ 自动播放 + Karaoke 字幕
  //   2. 播放完后,弹出 quiz:"这句话在做什么?"
  //   3. 用户选 → 答对揭示中文翻译 → 答错温和提示 + 重选
  //   4. 答对后显示完整翻译,下一句
  stage4: [
    {
      en: "How's the weather today?",
      cn: "今天天气怎样?",
      scene_hint: "问天气",
      quiz: {
        question: "这句话在做什么?",
        correct: "问今天天气怎样",
        options: [
          "问今天天气怎样",
          "介绍自己",
          "问现在几点",
          "说再见",
        ],
      },
    },
    {
      en: "It's sunny.",
      cn: "今天晴朗。",
      scene_hint: "描述天气",
      quiz: {
        question: "这句话在说什么?",
        correct: "今天是晴天",
        options: [
          "今天下雨",
          "今天是晴天",
          "今天很冷",
          "今天有风",
        ],
      },
    },
    {
      en: "Look at the blue sky!",
      cn: "看那蓝天!",
      scene_hint: "感叹天气",
      quiz: {
        question: "这句话让你做什么?",
        correct: "看蓝色的天空",
        options: [
          "听音乐",
          "看蓝色的天空",
          "看红色的花",
          "回家",
        ],
      },
    },
    {
      en: "Let's go outside!",
      cn: "我们出去吧!",
      scene_hint: "提议活动",
      quiz: {
        question: "这句话在说什么?",
        correct: "我们出去吧",
        options: [
          "我们回家吧",
          "我们睡觉吧",
          "我们出去吧",
          "我们吃饭吧",
        ],
      },
    },
    {
      en: "Don't forget your hat.",
      cn: "别忘了你的帽子。",
      scene_hint: "提醒准备",
      quiz: {
        question: "这句话在提醒你什么?",
        correct: "别忘了戴帽子",
        options: [
          "别忘了喝水",
          "别忘了写作业",
          "别忘了戴帽子",
          "别忘了带书",
        ],
      },
    },
  ],

  // ━━━ 关 5: 填空小测 ━━━━━━━━━━━━━━(v1 不变)
  stage5: [
    {
      sentence_with_blank: "How's ___ weather today?",
      cn: "今天天气怎样?",
      correct: "the",
      options: ["a", "the", "an", "his"],
    },
    {
      sentence_with_blank: "It ___ sunny today.",
      cn: "今天天气晴朗。",
      correct: "is",
      options: ["are", "is", "am", "be"],
    },
    {
      sentence_with_blank: "Let's go ___!",
      cn: "我们出去吧!",
      correct: "outside",
      options: ["inside", "outside", "downstairs", "back"],
    },
  ],
};

// ─── 工具函数 ──────────────────────────────────────

export function isStageComplete(
  stageType: "stage1" | "stage2" | "stage3" | "stage4" | "stage5",
  userActions: any[]
): boolean {
  switch (stageType) {
    case "stage1":
    case "stage4":
      // 升级:现在每个词 / 句子都有 quiz,必须全部答对(或允许重做后答对)
      return userActions.length >= G2_L01_STAGES[stageType].length;
    case "stage2":
    case "stage3":
    case "stage5":
      return userActions.every(a => a !== null);
    default:
      return false;
  }
}

export function getNextStage(currentStage: number): number | null {
  if (currentStage < 5) return currentStage + 1;
  return null;
}

export function isLessonComplete(stagesProgress: Record<string, boolean>): boolean {
  return ["stage1", "stage2", "stage3", "stage4", "stage5"].every(
    s => stagesProgress[s] === true
  );
}
