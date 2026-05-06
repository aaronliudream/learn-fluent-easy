// 小学一年级文化意识卡片 · 对照《义务教育英语课程标准 2022》核心素养之"文化意识"
// 30 张卡片，覆盖：节日 / 餐桌礼仪 / 见面问候 / 校园生活 / 家庭与宠物

export type CultureCard = {
  id: string;
  category: "festival" | "manners" | "greeting" | "school" | "life";
  emoji: string;
  title_cn: string;
  title_en: string;
  desc_cn: string;
  keywords: string[]; // 关键英文词
};

export const CULTURE_CATEGORIES: Record<CultureCard["category"], { label: string; emoji: string; color: string }> = {
  festival: { label: "节日", emoji: "🎉", color: "from-rose-400 to-orange-400" },
  manners: { label: "礼仪", emoji: "🍽️", color: "from-amber-400 to-yellow-400" },
  greeting: { label: "问候", emoji: "👋", color: "from-sky-400 to-cyan-400" },
  school: { label: "校园", emoji: "🏫", color: "from-emerald-400 to-teal-400" },
  life: { label: "生活", emoji: "🏡", color: "from-violet-400 to-fuchsia-400" },
};

export const PRIMARY_CULTURE_CARDS: CultureCard[] = [
  // 节日 (8 张)
  { id: "f1", category: "festival", emoji: "🎄", title_cn: "圣诞节", title_en: "Christmas",
    desc_cn: "12 月 25 日，西方最大的节日。家人团聚，挂袜子等圣诞老人送礼物。", keywords: ["Christmas", "Santa", "tree", "gift"] },
  { id: "f2", category: "festival", emoji: "🎃", title_cn: "万圣节", title_en: "Halloween",
    desc_cn: "10 月 31 日，孩子们装扮成鬼怪挨家敲门：Trick or treat（不给糖就捣蛋）！", keywords: ["Halloween", "pumpkin", "candy", "ghost"] },
  { id: "f3", category: "festival", emoji: "🦃", title_cn: "感恩节", title_en: "Thanksgiving",
    desc_cn: "11 月第 4 个星期四，美国人和家人团聚吃火鸡，感谢一年的收获。", keywords: ["Thanksgiving", "turkey", "family"] },
  { id: "f4", category: "festival", emoji: "🐰", title_cn: "复活节", title_en: "Easter",
    desc_cn: "春天的节日。大人把彩蛋藏起来，孩子们到草地里找彩蛋。", keywords: ["Easter", "egg", "bunny"] },
  { id: "f5", category: "festival", emoji: "💝", title_cn: "情人节", title_en: "Valentine's Day",
    desc_cn: "2 月 14 日，给喜欢的人送花、巧克力和小卡片。", keywords: ["Valentine", "love", "card"] },
  { id: "f6", category: "festival", emoji: "🎂", title_cn: "生日派对", title_en: "Birthday Party",
    desc_cn: "西方孩子过生日会开派对，吹蜡烛唱 Happy Birthday，许愿后切蛋糕。", keywords: ["birthday", "cake", "candle", "wish"] },
  { id: "f7", category: "festival", emoji: "🎆", title_cn: "新年", title_en: "New Year",
    desc_cn: "1 月 1 日。倒计时 10、9、8…到 0 时大家喊 Happy New Year！放烟花。", keywords: ["new year", "countdown", "fireworks"] },
  { id: "f8", category: "festival", emoji: "👨‍👩‍👧", title_cn: "母亲节 & 父亲节", title_en: "Mother's & Father's Day",
    desc_cn: "5 月第 2 个星期日是母亲节，6 月第 3 个星期日是父亲节，给爸妈做卡片。", keywords: ["mother", "father", "love"] },

  // 礼仪 (6 张)
  { id: "m1", category: "manners", emoji: "🍴", title_cn: "刀叉用法", title_en: "Knife & Fork",
    desc_cn: "西方人吃饭用刀叉：左手拿叉，右手拿刀。不像中国用筷子。", keywords: ["knife", "fork", "spoon"] },
  { id: "m2", category: "manners", emoji: "🙏", title_cn: "请和谢谢", title_en: "Please & Thank you",
    desc_cn: "西方人非常重视礼貌。要东西要说 Please，得到帮助要说 Thank you。", keywords: ["please", "thank you", "sorry"] },
  { id: "m3", category: "manners", emoji: "🤐", title_cn: "吃饭不出声", title_en: "Quiet Eating",
    desc_cn: "西餐礼仪：嘴里有食物不说话，喝汤不出声，打喷嚏要说 Excuse me。", keywords: ["excuse me", "quiet"] },
  { id: "m4", category: "manners", emoji: "🚪", title_cn: "为别人扶门", title_en: "Hold the Door",
    desc_cn: "进门时如果后面有人，要扶着门等一下。这是基本礼貌。", keywords: ["door", "after you"] },
  { id: "m5", category: "manners", emoji: "🎁", title_cn: "收礼物当面拆", title_en: "Open Gifts",
    desc_cn: "西方人收到礼物会当面打开，并称赞礼物，说 I love it! Thank you!", keywords: ["gift", "love it"] },
  { id: "m6", category: "manners", emoji: "🤫", title_cn: "排队不插队", title_en: "Wait in Line",
    desc_cn: "无论买东西还是上厕所，都要排队 (Line up)，不能插队。", keywords: ["line up", "wait"] },

  // 问候 (5 张)
  { id: "g1", category: "greeting", emoji: "🤝", title_cn: "握手 vs 拥抱", title_en: "Handshake & Hug",
    desc_cn: "初次见面握手，朋友家人见面会拥抱。中国人通常不会拥抱。", keywords: ["handshake", "hug"] },
  { id: "g2", category: "greeting", emoji: "👋", title_cn: "How are you 怎么答", title_en: "How are you?",
    desc_cn: "回答 I'm fine, thank you. And you? 这是日常打招呼，不是真的问健康。", keywords: ["fine", "good", "great"] },
  { id: "g3", category: "greeting", emoji: "📛", title_cn: "直呼名字", title_en: "First Name",
    desc_cn: "西方人喜欢被叫名字 (Tom, Lily)，不像中国必须叫 Mr./Ms.。老师也常被直呼名字。", keywords: ["name", "Mr.", "Ms."] },
  { id: "g4", category: "greeting", emoji: "😊", title_cn: "见面要微笑", title_en: "Smile First",
    desc_cn: "和陌生人对视也要微笑点头，是基本礼貌。", keywords: ["smile", "hi", "hello"] },
  { id: "g5", category: "greeting", emoji: "🌙", title_cn: "Good night 是再见", title_en: "Good night",
    desc_cn: "Good night 不只是晚安，晚上分别说再见也用它。Good evening 是晚上好。", keywords: ["good night", "good evening"] },

  // 校园 (6 张)
  { id: "s1", category: "school", emoji: "👕", title_cn: "美国小学没校服", title_en: "No Uniform",
    desc_cn: "美国大多数公立小学没有校服，孩子可以穿喜欢的衣服上学。英国则多有校服。", keywords: ["uniform", "school"] },
  { id: "s2", category: "school", emoji: "✋", title_cn: "上课举手", title_en: "Raise Your Hand",
    desc_cn: "想发言、想上厕所都要举手等老师叫到。这点和中国一样。", keywords: ["raise hand", "May I"] },
  { id: "s3", category: "school", emoji: "🥪", title_cn: "自己带午餐", title_en: "Lunch Box",
    desc_cn: "很多西方孩子带便当盒：三明治 + 水果 + 牛奶，叫 Lunch Box。", keywords: ["lunch", "sandwich", "apple"] },
  { id: "s4", category: "school", emoji: "🚌", title_cn: "黄色校车", title_en: "School Bus",
    desc_cn: "美国的校车都是亮黄色，所有车看到必须停下让行。", keywords: ["school bus", "yellow"] },
  { id: "s5", category: "school", emoji: "🎨", title_cn: "Show and Tell", title_en: "Show and Tell",
    desc_cn: "美国小学很有名的活动：每周带一样喜欢的东西到学校，介绍给同学。", keywords: ["show", "tell", "share"] },
  { id: "s6", category: "school", emoji: "🏆", title_cn: "Star of the Week", title_en: "Star Student",
    desc_cn: "每周老师会评选一个『本周之星』，把照片贴在教室墙上，是很大的荣誉。", keywords: ["star", "week", "great job"] },

  // 生活 (5 张)
  { id: "l1", category: "life", emoji: "🐶", title_cn: "宠物是家人", title_en: "Pet is Family",
    desc_cn: "西方人把宠物当家人，狗有自己的床、玩具，圣诞节也有礼物。", keywords: ["pet", "dog", "cat", "family"] },
  { id: "l2", category: "life", emoji: "🦷", title_cn: "牙仙子", title_en: "Tooth Fairy",
    desc_cn: "孩子掉牙后把牙放枕头下，第二天会变成小钱——是牙仙子送的礼物。", keywords: ["tooth", "fairy", "pillow"] },
  { id: "l3", category: "life", emoji: "🏠", title_cn: "进门脱不脱鞋", title_en: "Shoes On or Off",
    desc_cn: "美国人在家常穿着鞋走来走去，中国家庭一般要换拖鞋。要看主人家规矩。", keywords: ["shoes", "home"] },
  { id: "l4", category: "life", emoji: "👨‍👩‍👦", title_cn: "Sleepover 过夜", title_en: "Sleepover",
    desc_cn: "好朋友会到对方家过夜，一起看电影、玩游戏，叫 Sleepover Party。", keywords: ["sleepover", "friend"] },
  { id: "l5", category: "life", emoji: "💰", title_cn: "Allowance 零花钱", title_en: "Allowance",
    desc_cn: "西方孩子做家务可以挣零花钱：洗碗、遛狗、剪草坪都有『工资』。", keywords: ["allowance", "chore", "money"] },
];
