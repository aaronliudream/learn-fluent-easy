// 小学二年级 Roleplay 场景(接续 G1 体系)
// =============================================================
// 数据规模:15 个 G2 场景(接续 G1 的 20 个,累计 35 个)
//
// 设计原则:
//   1. 完全复用 G1 RolePlay 类型(import type from "./primaryRolePlays")
//   2. id rp21-rp35,sortOrder 21-35(与 G1 严格隔离)
//   3. 类别均匀分布:5 类别各 3 个(school/family/friends/public/festival)
//   4. 对话 2-3 轮(略增于 G1),句子 5-8 词
//   5. 选项设计:正确(礼貌得体) + 太直接(语法对但场合错) + 误用(教学性错误)
//   6. 中西方礼仪差异通过 feedback_cn 自然展示
//
// 场景列表:
//   学校生活 (3):课堂举手 / 找不到课本 / 操场跌倒
//   家庭日常 (3):帮做饭 / 饭桌请求 / 兄妹分享
//   朋友交流 (3):邀请玩 / 弄坏东西 / 邀请生日
//   公共场所 (3):图书馆借书 / 餐厅点菜 / 问路
//   节日庆典 (3):圣诞礼物 / 春节拜年 / 母亲节送花
//
// 难度分布:
//   - Level 2 (中等):11 个
//   - Level 3 (挑战):4 个(春节拜年 / 弄坏朋友东西 / 餐厅点菜 / 问路)
//
// UI 接入建议:
//   • G1 通关后才可访问 G2(顺序解锁)
//   • 主路径 /primary/roleplays?grade=2 切换 G2 数据
//   • 数据库表 primary_roleplay_completion 共用,roleplay_id 区分

import type { RolePlay } from "./primaryRolePlays";

// ─── 15 个 G2 场景 ──────────────────────────────────────

export const PRIMARY_ROLE_PLAYS_G2: RolePlay[] = [
  {
    id: "rp21",
    emoji: "🙋",
    title_cn: "课堂上举手",
    title_en: "Raising Hand in Class",
    scene_cn: "老师问问题,你知道答案,想举手回答",
    bg: "from-blue-500 to-indigo-500",
    category: "school",
    difficulty: 2,
    sortOrder: 21,
    lines: [
      { speaker: "老师", emoji: "👩‍🏫", side: "right", text_en: "Who can tell me what 'big' means in Chinese?", text_cn: "谁能告诉我 'big' 中文是什么意思?" },
      { speaker: "你", emoji: "👦", side: "left", text_en: "Me! I know!", text_cn: "我!我知道!" },
      { speaker: "老师", emoji: "👩‍🏫", side: "right", text_en: "Yes, please tell us.", text_cn: "好,告诉大家。" }
    ],
    choices: [
      { text_en: "'Big' means 大 in Chinese.", text_cn: "'Big' 中文是 '大'。", correct: true, feedback_cn: "🌟 完美!回答问题要清晰,先说主语 'Big means...'" },
      { text_en: "Yes, I know.", text_cn: "对,我知道。", correct: false, feedback_cn: "光说 yes 不够~ 老师想听完整答案" },
      { text_en: "Big.", text_cn: "大。", correct: false, feedback_cn: "中文对了,但要用完整句子:'Big' means 大~" }
    ],
  },
  {
    id: "rp22",
    emoji: "📚",
    title_cn: "找不到课本",
    title_en: "Lost Textbook",
    scene_cn: "上课前你发现忘带英语课本",
    bg: "from-amber-500 to-orange-500",
    category: "school",
    difficulty: 2,
    sortOrder: 22,
    lines: [
      { speaker: "你", emoji: "👦", side: "left", text_en: "Oh no, I forgot my English book!", text_cn: "糟糕,我忘带英语书了!" },
      { speaker: "Mia", emoji: "👧", side: "right", text_en: "Don't worry. What do you want to do?", text_cn: "别担心。你想怎么办?" }
    ],
    choices: [
      { text_en: "Can I share your book, please?", text_cn: "我能和你一起看吗?", correct: true, feedback_cn: "🌟 完美!礼貌请求 'Can I... please' 是关键" },
      { text_en: "Give me your book.", text_cn: "把你的书给我。", correct: false, feedback_cn: "太命令了~ 朋友间也要说 please 哦" },
      { text_en: "I don't have a book.", text_cn: "我没有书。", correct: false, feedback_cn: "这只是描述,没解决问题~ 应该问 Can I share" }
    ],
  },
  {
    id: "rp23",
    emoji: "🩹",
    title_cn: "操场上跌倒",
    title_en: "Fell on the Playground",
    scene_cn: "课间你在操场跑步,不小心摔了一跤",
    bg: "from-rose-500 to-pink-500",
    category: "school",
    difficulty: 2,
    sortOrder: 23,
    lines: [
      { speaker: "Sam", emoji: "👦", side: "right", text_en: "Are you OK? You fell down!", text_cn: "你还好吗?你摔倒了!" },
      { speaker: "你", emoji: "👦", side: "left", text_en: "My knee hurts a bit.", text_cn: "我膝盖有点疼。" },
      { speaker: "Sam", emoji: "👦", side: "right", text_en: "Let me help you up.", text_cn: "我扶你起来。" }
    ],
    choices: [
      { text_en: "Thank you so much, Sam!", text_cn: "非常感谢,Sam!", correct: true, feedback_cn: "🌟 完美!别人帮助你要说谢谢" },
      { text_en: "I can do it myself.", text_cn: "我自己可以。", correct: false, feedback_cn: "拒绝帮助不太礼貌~ 朋友的好意先接受" },
      { text_en: "Don't touch me.", text_cn: "别碰我。", correct: false, feedback_cn: "这样会伤朋友的心哦~" }
    ],
  },
  {
    id: "rp24",
    emoji: "🍳",
    title_cn: "帮妈妈做饭",
    title_en: "Helping Mom Cook",
    scene_cn: "周末早上,你看到妈妈在厨房,想帮忙",
    bg: "from-orange-500 to-amber-600",
    category: "family",
    difficulty: 2,
    sortOrder: 24,
    lines: [
      { speaker: "你", emoji: "👦", side: "left", text_en: "Mom, can I help you cook?", text_cn: "妈妈,我能帮你做饭吗?" },
      { speaker: "妈妈", emoji: "👩", side: "right", text_en: "Of course! What do you want to do?", text_cn: "当然!你想做什么?" }
    ],
    choices: [
      { text_en: "Can I wash the vegetables?", text_cn: "我能洗菜吗?", correct: true, feedback_cn: "🌟 完美!主动提出能做的事" },
      { text_en: "I want to use the knife!", text_cn: "我想用刀!", correct: false, feedback_cn: "刀很危险~ 小朋友不能自己用" },
      { text_en: "Just give me anything.", text_cn: "随便给我点事。", correct: false, feedback_cn: "可以更具体,告诉妈妈你想做什么" }
    ],
  },
  {
    id: "rp25",
    emoji: "🍽️",
    title_cn: "饭桌上要东西",
    title_en: "Asking at the Dinner Table",
    scene_cn: "晚饭时,盐在爸爸那边,你想加点盐",
    bg: "from-yellow-500 to-amber-600",
    category: "family",
    difficulty: 2,
    sortOrder: 25,
    lines: [
      { speaker: "你", emoji: "👦", side: "left", text_en: "Dad, the salt is by you.", text_cn: "爸爸,盐在你那边。" },
      { speaker: "爸爸", emoji: "👨", side: "right", text_en: "Oh, do you need it?", text_cn: "哦,你需要它吗?" }
    ],
    choices: [
      { text_en: "Yes, can you pass me the salt, please?", text_cn: "能把盐递给我吗,谢谢?", correct: true, feedback_cn: "🌟 完美!餐桌礼仪 'pass me... please'" },
      { text_en: "Give me the salt!", text_cn: "把盐给我!", correct: false, feedback_cn: "命令式不礼貌~ 用 'Can you pass me' 更好" },
      { text_en: "Salt!", text_cn: "盐!", correct: false, feedback_cn: "只说东西的名字像在喊~ 完整句子更礼貌" }
    ],
  },
  {
    id: "rp26",
    emoji: "🧸",
    title_cn: "跟弟弟分享玩具",
    title_en: "Sharing Toys with Brother",
    scene_cn: "你在玩自己的玩具车,弟弟眼巴巴看着",
    bg: "from-pink-500 to-rose-600",
    category: "family",
    difficulty: 2,
    sortOrder: 26,
    lines: [
      { speaker: "弟弟", emoji: "👶", side: "right", text_en: "Can I play with your car?", text_cn: "我能玩你的车吗?" },
      { speaker: "你", emoji: "👦", side: "left", text_en: "Hmm, let me think...", text_cn: "嗯,让我想想..." }
    ],
    choices: [
      { text_en: "Yes, let's play together!", text_cn: "好,一起玩!", correct: true, feedback_cn: "🌟 完美!分享让大家都开心" },
      { text_en: "No, this is mine!", text_cn: "不行,这是我的!", correct: false, feedback_cn: "弟弟会很难过~ 试着分享一下吧" },
      { text_en: "Only for one minute.", text_cn: "就一分钟。", correct: false, feedback_cn: "太短了~ 真正的分享要慷慨一点" }
    ],
  },
  {
    id: "rp27",
    emoji: "🎮",
    title_cn: "朋友邀请玩",
    title_en: "Friend Invites to Play",
    scene_cn: "Jake 想和你一起玩,但你正在做作业",
    bg: "from-emerald-500 to-teal-600",
    category: "friends",
    difficulty: 2,
    sortOrder: 27,
    lines: [
      { speaker: "Jake", emoji: "👦", side: "right", text_en: "Hi! Want to play with me now?", text_cn: "嗨!现在和我一起玩吗?" },
      { speaker: "你", emoji: "👦", side: "left", text_en: "I really want to, but...", text_cn: "我很想,但..." }
    ],
    choices: [
      { text_en: "Can we play after I finish homework?", text_cn: "我做完作业后一起玩好吗?", correct: true, feedback_cn: "🌟 完美!提出替代方案,不直接拒绝" },
      { text_en: "No, go away.", text_cn: "不,走开。", correct: false, feedback_cn: "朋友会受伤~ 礼貌的拒绝更好" },
      { text_en: "Sure, let's play!", text_cn: "好啊,玩吧!", correct: false, feedback_cn: "作业还没完成不能玩哦~" }
    ],
  },
  {
    id: "rp28",
    emoji: "💔",
    title_cn: "弄坏朋友的东西",
    title_en: "Broke Friend's Thing",
    scene_cn: "你不小心把 Lily 的彩色铅笔折断了",
    bg: "from-red-500 to-rose-600",
    category: "friends",
    difficulty: 3,
    sortOrder: 28,
    lines: [
      { speaker: "Lily", emoji: "👧", side: "right", text_en: "Oh! My pencil is broken!", text_cn: "啊!我的铅笔断了!" },
      { speaker: "你", emoji: "👦", side: "left", text_en: "I'm really sorry, Lily.", text_cn: "我真的很抱歉,Lily。" },
      { speaker: "Lily", emoji: "👧", side: "right", text_en: "It was my favorite color too.", text_cn: "那还是我最喜欢的颜色。" }
    ],
    choices: [
      { text_en: "I'll buy you a new one tomorrow.", text_cn: "我明天给你买个新的。", correct: true, feedback_cn: "🌟 完美!道歉 + 弥补的行动" },
      { text_en: "It was an accident.", text_cn: "这是意外。", correct: false, feedback_cn: "解释可以,但需要先提弥补~" },
      { text_en: "Don't be mad.", text_cn: "别生气。", correct: false, feedback_cn: "这没解决问题~ 应该提出弥补" }
    ],
  },
  {
    id: "rp29",
    emoji: "🎉",
    title_cn: "邀请朋友来生日",
    title_en: "Inviting to Birthday",
    scene_cn: "你的生日快到了,想邀请好朋友 Mei",
    bg: "from-fuchsia-500 to-pink-500",
    category: "friends",
    difficulty: 2,
    sortOrder: 29,
    lines: [
      { speaker: "你", emoji: "👦", side: "left", text_en: "Mei, my birthday is on Saturday.", text_cn: "Mei,我周六生日。" },
      { speaker: "Mei", emoji: "👧", side: "right", text_en: "Cool! Are you having a party?", text_cn: "酷!你要开派对吗?" }
    ],
    choices: [
      { text_en: "Yes! Can you come to my party?", text_cn: "对!你能来我的派对吗?", correct: true, feedback_cn: "🌟 完美!直接、热情的邀请" },
      { text_en: "You should come.", text_cn: "你应该来。", correct: false, feedback_cn: "应该 should 听起来像要求~ 用 Can you come 更好" },
      { text_en: "Maybe you can come.", text_cn: "也许你能来。", correct: false, feedback_cn: "Maybe 听起来不太诚意~ 直接邀请更好" }
    ],
  },
  {
    id: "rp30",
    emoji: "📖",
    title_cn: "图书馆借书",
    title_en: "Library Book Borrow",
    scene_cn: "你想借一本恐龙故事书,走向图书管理员",
    bg: "from-cyan-500 to-blue-500",
    category: "public",
    difficulty: 2,
    sortOrder: 30,
    lines: [
      { speaker: "你", emoji: "👦", side: "left", text_en: "Hi, I want to borrow this book.", text_cn: "你好,我想借这本书。" },
      { speaker: "管理员", emoji: "👨", side: "right", text_en: "Sure, do you have your library card?", text_cn: "好的,你有借书卡吗?" }
    ],
    choices: [
      { text_en: "Yes, here it is. Thank you!", text_cn: "有,在这。谢谢!", correct: true, feedback_cn: "🌟 完美!图书馆需要安静,简短礼貌即可" },
      { text_en: "Card? What card?", text_cn: "卡?什么卡?", correct: false, feedback_cn: "如果有卡就直接拿出来,不要假装不知道" },
      { text_en: "I'll just take it.", text_cn: "我直接拿走。", correct: false, feedback_cn: "图书馆借书要有卡~ 不能直接拿" }
    ],
  },
  {
    id: "rp31",
    emoji: "🍕",
    title_cn: "餐厅点菜",
    title_en: "Ordering at Restaurant",
    scene_cn: "你和爸爸妈妈在餐厅,服务员来了",
    bg: "from-orange-500 to-red-500",
    category: "public",
    difficulty: 3,
    sortOrder: 31,
    lines: [
      { speaker: "服务员", emoji: "🧑‍🍳", side: "right", text_en: "Hello! What would you like to eat?", text_cn: "你好!你想吃什么?" },
      { speaker: "你", emoji: "👦", side: "left", text_en: "Hmm, let me see the menu.", text_cn: "嗯,让我看看菜单。" },
      { speaker: "服务员", emoji: "🧑‍🍳", side: "right", text_en: "Take your time, no rush.", text_cn: "慢慢看,不着急。" }
    ],
    choices: [
      { text_en: "I'd like a pizza, please.", text_cn: "我要披萨,谢谢。", correct: true, feedback_cn: "🌟 完美!点菜用 'I'd like... please'" },
      { text_en: "I want pizza now!", text_cn: "我现在要披萨!", correct: false, feedback_cn: "餐厅是公共场所,要礼貌一点哦~" },
      { text_en: "Pizza.", text_cn: "披萨。", correct: false, feedback_cn: "需要更完整礼貌的句子:I'd like a pizza" }
    ],
  },
  {
    id: "rp32",
    emoji: "🗺️",
    title_cn: "向路人问路",
    title_en: "Asking for Directions",
    scene_cn: "和爸妈逛街,迷路了,你想问路找回去",
    bg: "from-violet-500 to-purple-500",
    category: "public",
    difficulty: 3,
    sortOrder: 32,
    lines: [
      { speaker: "你", emoji: "👦", side: "left", text_en: "Excuse me, can you help me?", text_cn: "请问,你能帮我吗?" },
      { speaker: "路人", emoji: "🧑", side: "right", text_en: "Of course! What do you need?", text_cn: "当然!你要找什么?" }
    ],
    choices: [
      { text_en: "Where is the toy store, please?", text_cn: "请问玩具店在哪?", correct: true, feedback_cn: "🌟 完美!礼貌问路用 'Where is... please'" },
      { text_en: "Where is the store?", text_cn: "店在哪?", correct: false, feedback_cn: "礼貌一点会更好~ 加 'please' 或 'Excuse me'" },
      { text_en: "Tell me where the store is!", text_cn: "告诉我店在哪!", correct: false, feedback_cn: "命令式不礼貌~ 别人是好心帮忙" }
    ],
  },
  {
    id: "rp33",
    emoji: "🎄",
    title_cn: "圣诞交换礼物",
    title_en: "Christmas Gift Exchange",
    scene_cn: "圣诞派对,你的同学 Tom 把礼物递给你",
    bg: "from-green-500 to-red-500",
    category: "festival",
    difficulty: 2,
    sortOrder: 33,
    lines: [
      { speaker: "Tom", emoji: "👦", side: "right", text_en: "Merry Christmas! This is for you.", text_cn: "圣诞快乐!这是给你的。" },
      { speaker: "你", emoji: "👦", side: "left", text_en: "Wow, thank you so much!", text_cn: "哇,非常感谢!" },
      { speaker: "Tom", emoji: "👦", side: "right", text_en: "Open it and see!", text_cn: "打开看看!" }
    ],
    choices: [
      { text_en: "It's a cool toy car! I love it!", text_cn: "是辆酷车!我超喜欢!", correct: true, feedback_cn: "🌟 完美!西方礼仪:当面打开 + 称赞" },
      { text_en: "I'll open it at home.", text_cn: "我回家再打开。", correct: false, feedback_cn: "西方习惯当面打开礼物哦~ 让对方知道你喜欢" },
      { text_en: "OK, thanks.", text_cn: "好,谢了。", correct: false, feedback_cn: "只说谢谢不够~ 打开看看让朋友开心" }
    ],
  },
  {
    id: "rp34",
    emoji: "🧧",
    title_cn: "春节拜年",
    title_en: "Chinese New Year Greeting",
    scene_cn: "春节去奶奶家拜年,奶奶笑着出来开门",
    bg: "from-red-500 to-yellow-500",
    category: "festival",
    difficulty: 3,
    sortOrder: 34,
    lines: [
      { speaker: "奶奶", emoji: "👵", side: "right", text_en: "My sweet baby! Happy New Year!", text_cn: "我的小宝贝!新年快乐!" },
      { speaker: "你", emoji: "👦", side: "left", text_en: "Happy New Year, Grandma!", text_cn: "新年快乐,奶奶!" },
      { speaker: "奶奶", emoji: "👵", side: "right", text_en: "Here's a red envelope for you!", text_cn: "给你一个红包!" }
    ],
    choices: [
      { text_en: "Thank you, Grandma! I love you!", text_cn: "谢谢奶奶!我爱你!", correct: true, feedback_cn: "🌟 完美!收红包要感谢 + 表达爱" },
      { text_en: "How much is in it?", text_cn: "里面多少钱?", correct: false, feedback_cn: "中国礼仪:当面不问红包金额~ 这不礼貌" },
      { text_en: "I'll open it now!", text_cn: "我现在打开!", correct: false, feedback_cn: "中国习俗:红包不当面拆~ 回家再拆" }
    ],
  },
  {
    id: "rp35",
    emoji: "🌷",
    title_cn: "母亲节送花",
    title_en: "Mother's Day Flowers",
    scene_cn: "母亲节,你买了一束花想送给妈妈",
    bg: "from-pink-500 to-rose-500",
    category: "festival",
    difficulty: 2,
    sortOrder: 35,
    lines: [
      { speaker: "你", emoji: "👦", side: "left", text_en: "Mom, these are for you!", text_cn: "妈妈,这是给你的!" },
      { speaker: "妈妈", emoji: "👩", side: "right", text_en: "Oh, beautiful flowers! Thank you!", text_cn: "啊,好漂亮的花!谢谢!" }
    ],
    choices: [
      { text_en: "Happy Mother's Day! I love you!", text_cn: "母亲节快乐!我爱你!", correct: true, feedback_cn: "🌟 完美!节日 + 爱意的表达" },
      { text_en: "They were on sale.", text_cn: "它们在打折。", correct: false, feedback_cn: "提价格让节日变得不浪漫~ 不用说" },
      { text_en: "You're welcome.", text_cn: "不客气。", correct: false, feedback_cn: "妈妈说谢谢,但孩子应该再说节日快乐~" }
    ],
  }
];

// ─── 工具函数 ──────────────────────────────────────

/** 按类别取 G2 场景 */
export function getRolePlaysByCategoryG2(category: string): RolePlay[] {
  return PRIMARY_ROLE_PLAYS_G2.filter(rp => rp.category === category)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** 按 sortOrder 取所有 G2 场景(用于顺序解锁) */
export function getRolePlaysSortedG2(): RolePlay[] {
  return [...PRIMARY_ROLE_PLAYS_G2].sort((a, b) => a.sortOrder - b.sortOrder);
}

/** 取下一个未完成的 G2 场景 */
export function getNextRolePlayG2(completedIds: string[]): RolePlay | null {
  const sorted = getRolePlaysSortedG2();
  return sorted.find(rp => !completedIds.includes(rp.id)) || null;
}

/** 按 id 查找 G2 场景 */
export function findRolePlayG2(id: string): RolePlay | undefined {
  return PRIMARY_ROLE_PLAYS_G2.find(rp => rp.id === id);
}

/** 取所有 G2 类别(用于 UI 分组) */
export function getAllCategoriesG2(): { category: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const rp of PRIMARY_ROLE_PLAYS_G2) {
    counts.set(rp.category, (counts.get(rp.category) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([category, count]) => ({ category, count }));
}

/** G2 统计 */
export const ROLEPLAY_STATS_G2 = {
  total: 15,
  byCategory: {
    school: 3,
    family: 3,
    friends: 3,
    public: 3,
    festival: 3,
  },
  byDifficulty: {
    level2: 11,
    level3: 4,
  },
};
