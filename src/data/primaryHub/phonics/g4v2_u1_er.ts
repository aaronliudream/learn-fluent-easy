import type { PhonicsConfig } from "@/lib/primaryHub/phonicsTypes";

/** 四年级下册 Unit 1 · er 自然拼读 — 拼读词 sub-page content */
export const G4V2_U1_PHONICS = {
  unitId: "g4v2_u1",
  semesterId: "grade4_volume2",
  title: "自然拼读 · er",
  phonics_rule: "er",
  phonics_sound: "/ə(r)/",
  rule_explanation:
    "字母组合 er 在单词末尾发轻声 /ə(r)/，像「额」一样短促",
  audioBase: "/audio/primary/phonics/g4v2_u1",
  // 不带 `audio` 字段 = 用共享儿童音 TTS 朗读。
  // 这 6 个词原先写着 water.mp3 / tiger.mp3 …，但那些文件从未存在过
  // （git 历史里 public/audio/primary/phonics/g4v2_u1/ 只提交过 README.md），
  // 请求被 SPA rewrite 兜成 200 + index.html，每次点读都要先解码失败再回退 TTS。
  // 将来真录了人声，把文件放进 audioBase 目录并补回 `audio: "water.mp3"` 即可。
  stage_1_listen: [
    { word: "water", zh: "水", emoji: "💧" },
    { word: "tiger", zh: "老虎", emoji: "🐯" },
    { word: "sister", zh: "姐妹", emoji: "👧" },
    { word: "dinner", zh: "晚饭", emoji: "🍽️" },
    { word: "computer", zh: "电脑", emoji: "💻" },
    { word: "ruler", zh: "尺子", emoji: "📏" },
  ],
  stage_2_find: [
    { word: "teacher", matchesRule: true },
    { word: "farmer", matchesRule: true },
    { word: "number", matchesRule: true },
    { word: "mother", matchesRule: true },
    { word: "winter", matchesRule: true },
    { word: "cat", matchesRule: false },
    { word: "book", matchesRule: false },
    { word: "happy", matchesRule: false },
    { word: "apple", matchesRule: false },
    { word: "pen", matchesRule: false },
  ],
  stage_3_challenge: [
    {
      image: "👧📖",
      sentence: "My ___ is reading a book.",
      hint: "我的___在看书。",
      options: ["sister", "apple", "book"],
      correct: 0,
    },
    {
      image: "💻🪑",
      sentence: "The ___ is on the desk.",
      hint: "___在桌子上。",
      options: ["cat", "computer", "door"],
      correct: 1,
    },
    {
      image: "🐯🏞️",
      sentence: "I see a ___ at the zoo.",
      hint: "我在动物园看见一只___。",
      options: ["fish", "bird", "tiger"],
      correct: 2,
    },
    {
      image: "🍽️⏰",
      sentence: "It's time for ___.",
      hint: "该吃___了。",
      options: ["dinner", "pencil", "school"],
      correct: 0,
    },
  ],
} satisfies PhonicsConfig;
