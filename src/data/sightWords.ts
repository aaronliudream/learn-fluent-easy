/**
 * 高频词 (Sight Words) — Dolch + Fry 列表精选,共 ~80 词,
 * 按 K (幼儿园) → G1 (一年级) → G2 (二年级) 分级.
 *
 * 这些词大多无法用 phonics 拼读规则推出来 (the / was / said / one),
 * 必须靠"看一眼就认出"才能流利阅读. CCSS / 国内英语启蒙均推荐.
 */

export type SightWord = {
  id: string;       // sw_the
  word: string;     // "the"
  cn: string;       // "这个 / 那个"
  level: "K" | "G1" | "G2";
  emoji?: string;   // 可选表情(用于"看图选词")
  example?: string; // 例句
};

export const SIGHT_WORDS: SightWord[] = [
  // ─── K (幼儿园 25 词) ──
  { id: "sw_a",    word: "a",    cn: "一个",     level: "K", example: "I see a cat." },
  { id: "sw_and",  word: "and",  cn: "和",       level: "K", example: "Mom and Dad." },
  { id: "sw_I",    word: "I",    cn: "我",       level: "K", example: "I am happy." },
  { id: "sw_is",   word: "is",   cn: "是",       level: "K", example: "It is fun." },
  { id: "sw_it",   word: "it",   cn: "它",       level: "K", example: "I like it." },
  { id: "sw_in",   word: "in",   cn: "在...里",  level: "K", example: "Cat in box." },
  { id: "sw_to",   word: "to",   cn: "到",       level: "K", example: "Go to bed." },
  { id: "sw_the",  word: "the",  cn: "这/那",    level: "K", example: "The dog runs." },
  { id: "sw_we",   word: "we",   cn: "我们",     level: "K", example: "We play." },
  { id: "sw_he",   word: "he",   cn: "他",       level: "K", example: "He is tall." },
  { id: "sw_she",  word: "she",  cn: "她",       level: "K", example: "She sings." },
  { id: "sw_you",  word: "you",  cn: "你",       level: "K", example: "I see you." },
  { id: "sw_my",   word: "my",   cn: "我的",     level: "K", example: "My toy." },
  { id: "sw_me",   word: "me",   cn: "我(宾)",  level: "K", example: "Help me!" },
  { id: "sw_go",   word: "go",   cn: "去",       level: "K", example: "Go home." },
  { id: "sw_no",   word: "no",   cn: "不",       level: "K", example: "Say no." },
  { id: "sw_yes",  word: "yes",  cn: "是的",     level: "K", example: "Yes, I can." },
  { id: "sw_can",  word: "can",  cn: "能",       level: "K", example: "I can fly." },
  { id: "sw_see",  word: "see",  cn: "看见",     level: "K", example: "See the bird!" },
  { id: "sw_like", word: "like", cn: "喜欢",     level: "K", example: "I like cake." },
  { id: "sw_at",   word: "at",   cn: "在",       level: "K", example: "Look at me!" },
  { id: "sw_up",   word: "up",   cn: "向上",     level: "K", example: "Look up!" },
  { id: "sw_down", word: "down", cn: "向下",     level: "K", example: "Sit down." },
  { id: "sw_on",   word: "on",   cn: "在...上",  level: "K", example: "Cat on bed." },
  { id: "sw_big",  word: "big",  cn: "大的",     level: "K", example: "A big dog." },

  // ─── G1 (一年级 30 词) ──
  { id: "sw_was",   word: "was",   cn: "是(过去)", level: "G1", example: "It was fun." },
  { id: "sw_for",   word: "for",   cn: "为了",      level: "G1", example: "For you." },
  { id: "sw_of",    word: "of",    cn: "...的",    level: "G1", example: "Cup of tea." },
  { id: "sw_with",  word: "with",  cn: "和...一起", level: "G1", example: "Go with me." },
  { id: "sw_have",  word: "have",  cn: "有",        level: "G1", example: "I have a pen." },
  { id: "sw_had",   word: "had",   cn: "有(过)",   level: "G1", example: "We had fun." },
  { id: "sw_this",  word: "this",  cn: "这个",      level: "G1", example: "This is mine." },
  { id: "sw_that",  word: "that",  cn: "那个",      level: "G1", example: "That is yours." },
  { id: "sw_what",  word: "what",  cn: "什么",      level: "G1", example: "What is it?" },
  { id: "sw_when",  word: "when",  cn: "什么时候",  level: "G1", example: "When go?" },
  { id: "sw_where", word: "where", cn: "哪里",      level: "G1", example: "Where is dog?" },
  { id: "sw_who",   word: "who",   cn: "谁",        level: "G1", example: "Who is he?" },
  { id: "sw_why",   word: "why",   cn: "为什么",    level: "G1", example: "Why cry?" },
  { id: "sw_how",   word: "how",   cn: "怎么",      level: "G1", example: "How are you?" },
  { id: "sw_said",  word: "said",  cn: "说(过)",   level: "G1", example: "Mom said yes." },
  { id: "sw_says",  word: "says",  cn: "说",        level: "G1", example: "She says hi." },
  { id: "sw_one",   word: "one",   cn: "一",        level: "G1", example: "One cat." },
  { id: "sw_two",   word: "two",   cn: "二",        level: "G1", example: "Two dogs." },
  { id: "sw_make",  word: "make",  cn: "做",        level: "G1", example: "Make a cake." },
  { id: "sw_come",  word: "come",  cn: "来",        level: "G1", example: "Come here!" },
  { id: "sw_some",  word: "some",  cn: "一些",      level: "G1", example: "Some milk." },
  { id: "sw_were",  word: "were",  cn: "是(过)",   level: "G1", example: "They were happy." },
  { id: "sw_here",  word: "here",  cn: "这里",      level: "G1", example: "Come here." },
  { id: "sw_there", word: "there", cn: "那里",      level: "G1", example: "Look there!" },
  { id: "sw_play",  word: "play",  cn: "玩",        level: "G1", example: "Let's play." },
  { id: "sw_run",   word: "run",   cn: "跑",        level: "G1", example: "Run fast!" },
  { id: "sw_jump",  word: "jump",  cn: "跳",        level: "G1", example: "Jump high!" },
  { id: "sw_eat",   word: "eat",   cn: "吃",        level: "G1", example: "Eat the apple." },
  { id: "sw_red",   word: "red",   cn: "红色",      level: "G1", example: "A red ball." },
  { id: "sw_blue",  word: "blue",  cn: "蓝色",      level: "G1", example: "Blue sky." },

  // ─── G2 (二年级 25 词) ──
  { id: "sw_does",     word: "does",     cn: "做(三单)", level: "G2", example: "He does it." },
  { id: "sw_done",     word: "done",     cn: "做完",     level: "G2", example: "All done!" },
  { id: "sw_again",    word: "again",    cn: "再次",     level: "G2", example: "Try again!" },
  { id: "sw_around",   word: "around",   cn: "周围",     level: "G2", example: "Look around." },
  { id: "sw_because",  word: "because",  cn: "因为",     level: "G2", example: "Because I can." },
  { id: "sw_been",     word: "been",     cn: "去过",     level: "G2", example: "I've been there." },
  { id: "sw_before",   word: "before",   cn: "之前",     level: "G2", example: "Before lunch." },
  { id: "sw_could",    word: "could",    cn: "能(过)",   level: "G2", example: "I could swim." },
  { id: "sw_every",    word: "every",    cn: "每一",     level: "G2", example: "Every day." },
  { id: "sw_friend",   word: "friend",   cn: "朋友",     level: "G2", example: "My best friend." },
  { id: "sw_from",     word: "from",     cn: "来自",     level: "G2", example: "From China." },
  { id: "sw_give",     word: "give",     cn: "给",       level: "G2", example: "Give me five!" },
  { id: "sw_their",    word: "their",    cn: "他们的",   level: "G2", example: "Their toys." },
  { id: "sw_these",    word: "these",    cn: "这些",     level: "G2", example: "These books." },
  { id: "sw_those",    word: "those",    cn: "那些",     level: "G2", example: "Those kids." },
  { id: "sw_through",  word: "through",  cn: "穿过",     level: "G2", example: "Walk through." },
  { id: "sw_together", word: "together", cn: "一起",     level: "G2", example: "Sing together!" },
  { id: "sw_under",    word: "under",    cn: "在下面",   level: "G2", example: "Cat under bed." },
  { id: "sw_use",      word: "use",      cn: "使用",     level: "G2", example: "Use the pen." },
  { id: "sw_very",     word: "very",     cn: "非常",     level: "G2", example: "Very nice!" },
  { id: "sw_walk",     word: "walk",     cn: "走",       level: "G2", example: "Let's walk." },
  { id: "sw_water",    word: "water",    cn: "水",       level: "G2", example: "Drink water." },
  { id: "sw_which",    word: "which",    cn: "哪一个",   level: "G2", example: "Which one?" },
  { id: "sw_would",    word: "would",    cn: "会(虚)",   level: "G2", example: "I would go." },
  { id: "sw_write",    word: "write",    cn: "写",       level: "G2", example: "Write a letter." },
];

export const SIGHT_WORD_LEVELS: Array<{ id: "K" | "G1" | "G2"; name: string; sub: string }> = [
  { id: "K",  name: "Level K · 入门 25 词",  sub: "幼儿园必会" },
  { id: "G1", name: "Level G1 · 一年级 30 词", sub: "课文里反复出现" },
  { id: "G2", name: "Level G2 · 二年级 25 词", sub: "复杂句子奠基" },
];