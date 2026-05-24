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
  stage_1_listen: [
    { word: "water", zh: "水", emoji: "💧", audio: "water.mp3" },
    { word: "tiger", zh: "老虎", emoji: "🐯", audio: "tiger.mp3" },
    { word: "sister", zh: "姐妹", emoji: "👧", audio: "sister.mp3" },
    { word: "dinner", zh: "晚餐", emoji: "🍽️", audio: "dinner.mp3" },
    { word: "computer", zh: "电脑", emoji: "💻", audio: "computer.mp3" },
    { word: "ruler", zh: "尺子", emoji: "📏", audio: "ruler.mp3" },
  ],
  stage_2_find: [
    { word: "teacher", has_er: true },
    { word: "farmer", has_er: true },
    { word: "number", has_er: true },
    { word: "mother", has_er: true },
    { word: "winter", has_er: true },
    { word: "cat", has_er: false },
    { word: "book", has_er: false },
    { word: "happy", has_er: false },
    { word: "apple", has_er: false },
    { word: "pen", has_er: false },
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
} as const;

export type G4v2U1PhonicsConfig = typeof G4V2_U1_PHONICS;
