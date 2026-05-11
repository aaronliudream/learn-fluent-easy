/**
 * G2 Lesson Stages - 5 关闯关数据结构
 * 
 * 配套现有 aiLessonsG2.json,提供闯关式学习路径
 * 第一节课 g2_l01 (How's the weather today?) 完整数据
 * 
 * 设计原则:
 * 1. INPUT FIRST:前 4 关 80% 是输入,只关 5 是产出
 * 2. CONCRETE > ABSTRACT:每个抽象词配 emoji
 * 3. REPEAT WITH VARIETY:同一词在多关以不同形式出现
 * 4. LOW STAKES:错了温和提示,允许重做
 */

// ─── 类型定义 ──────────────────────────────────────

export type Stage1Card = {
  word: string;
  ipa: string;
  emoji: string;
  meaning_cn: string;
  example_en: string;
  example_cn: string;
};

export type Stage2Question = {
  audio_word: string;        // 要听的英文词
  correct_emoji: string;     // 正确答案的 emoji
  options: string[];          // 4 个 emoji 选项
};

export type Stage3Question = {
  image_emoji: string;        // 要看的 emoji
  correct_word: string;       // 正确答案
  options: string[];           // 4 个英文选项
};

export type Stage4Sentence = {
  en: string;                  // 英文句子
  cn: string;                  // 中文翻译
  scene_hint?: string;         // 场景提示(可选)
};

export type Stage5Question = {
  sentence_with_blank: string; // 带 ___ 的句子
  cn: string;                  // 中文意思
  correct: string;             // 正确答案
  options: string[];           // 4 个选项
};

export type LessonStages = {
  lesson_id: string;
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
  
  // ━━━ 关 1: 看 + 听(单词卡片轮播)━━━━━━━━━━━━━━
  // 6 个单词依次展示,每张卡 emoji + 单词 + IPA + 中文 + 例句
  // 不测试,只需"看完听完"
  stage1: [
    {
      word: "weather",
      ipa: "/ˈweðər/",
      emoji: "🌤️",
      meaning_cn: "天气",
      example_en: "How's the weather today?",
      example_cn: "今天天气怎样?",
    },
    {
      word: "sunny",
      ipa: "/ˈsʌni/",
      emoji: "☀️",
      meaning_cn: "晴朗的",
      example_en: "It's sunny today.",
      example_cn: "今天天晴。",
    },
    {
      word: "sky",
      ipa: "/skaɪ/",
      emoji: "☁️",
      meaning_cn: "天空",
      example_en: "The sky is blue.",
      example_cn: "天空是蓝色的。",
    },
    {
      word: "hat",
      ipa: "/hæt/",
      emoji: "🎩",
      meaning_cn: "帽子",
      example_en: "Wear your hat.",
      example_cn: "戴上你的帽子。",
    },
    {
      word: "outside",
      ipa: "/aʊtˈsaɪd/",
      emoji: "🚪",
      meaning_cn: "外面",
      example_en: "Let's go outside.",
      example_cn: "我们出去吧。",
    },
    {
      word: "blue",
      ipa: "/bluː/",
      emoji: "🟦",
      meaning_cn: "蓝色",
      example_en: "The sky is blue.",
      example_cn: "天空是蓝的。",
    },
  ],

  // ━━━ 关 2: 听音配图(听英文 → 选 emoji)━━━━━━━━━━━━━━
  // 听音,从 4 个 emoji 中选对的
  // 6 题(对应 6 个 vocab)
  // 错了:Spark "再听一次" → 同题重做
  // 干扰项:从其他 5 个词的 emoji 中选 3 个
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

  // ━━━ 关 3: 看图配词(看 emoji → 选英文)━━━━━━━━━━━━━━
  // 反向训练:看 emoji 选英文
  // 6 题
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

  // ━━━ 关 4: 听句子(5 个完整句子,Karaoke 字幕)━━━━━━━━━━━━━━
  // 听音 + 字幕高亮 + 中文翻译
  // 5 句(对应 expressions 字段)
  // 不测试,只需"听完点 ✓"
  stage4: [
    {
      en: "How's the weather today?",
      cn: "今天天气怎样?",
      scene_hint: "问天气",
    },
    {
      en: "It's sunny.",
      cn: "今天晴朗。",
      scene_hint: "描述天气",
    },
    {
      en: "Look at the blue sky!",
      cn: "看那蓝天!",
      scene_hint: "感叹天气",
    },
    {
      en: "Let's go outside!",
      cn: "我们出去吧!",
      scene_hint: "提议活动",
    },
    {
      en: "Don't forget your hat.",
      cn: "别忘了你的帽子。",
      scene_hint: "提醒准备",
    },
  ],

  // ━━━ 关 5: 填空小测(3 题,产出验证)━━━━━━━━━━━━━━
  // 3 题填空
  // 全部做完即过(对错不强制 80%)
  // 错了:Spark 温和提示 + 显示正确答案
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

/** 验证关卡完成度 */
export function isStageComplete(
  stageType: "stage1" | "stage2" | "stage3" | "stage4" | "stage5",
  userActions: any[]
): boolean {
  switch (stageType) {
    case "stage1":
    case "stage4":
      // 输入关:全部"看完"即可
      return userActions.length >= G2_L01_STAGES[stageType].length;
    case "stage2":
    case "stage3":
    case "stage5":
      // 测试关:全部做完(无论对错)即可
      return userActions.every(a => a !== null);
    default:
      return false;
  }
}

/** 取下一关 */
export function getNextStage(currentStage: number): number | null {
  if (currentStage < 5) return currentStage + 1;
  return null; // 5 关全部完成
}

/** 课程完成判定 */
export function isLessonComplete(stagesProgress: Record<string, boolean>): boolean {
  return ["stage1", "stage2", "stage3", "stage4", "stage5"].every(
    s => stagesProgress[s] === true
  );
}
