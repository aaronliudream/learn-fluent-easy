// 小学一年级 Phonics 完整体系
// 对照《义务教育英语课程标准 2022》预备级 + Jolly Phonics 教学顺序
//
// 设计原则:
// 1. 不按 A-Z 排,按 Jolly Phonics 7 组顺序 — 学完组 1(6 个字母)就能拼真词
// 2. 每个音 + 例词 + 例句,所有内容 TTS 可读
// 3. Spark 中密度叙事:每组开头/结尾有 Spark 话,每个音不重复
// 4. 难度递进:Group 1-3 字母音 → Group 4-6 字母组合 → Group 7 magic-e
//
// 数据规模:
// - 7 个 Group(教学单元)
// - 42 个音(26 字母 + 16 字母组合)
// - 50 个 CVC / 拼读练习词
// - 每个音 3-5 个例词 + 1 个例句
//
// 总计 92 个学习单元(Phonics 项 + CVC 拼读项)

// ─── 类型定义 ──────────────────────────────────────

/** Phonics 教学组(Jolly Phonics 7 组) */
export type PhonicsGroup = {
  id: string;           // "g1" ~ "g7"
  groupName: string;    // "组 1"
  groupNameEn: string;  // "Group 1"
  sparkIntro: string;   // 进入这组时 Spark 说的话
  sparkOutro: string;   // 完成这组时 Spark 说的话
  unlockReq: string;    // 解锁条件(给孩子看的)
  sortOrder: number;
};

/** 单个 Phonics 音 */
export type PhonicsItem = {
  id: string;              // "p_s", "p_sh"
  groupId: string;         // 所属组
  letter: string;          // 显示字母:"s" 或 "sh"
  letterUpper?: string;    // 大写形式(单字母才有)
  sound: string;           // IPA 音标:"/s/"
  soundDesc: string;       // 中文描述音怎么发:"像蛇吐信子的声音"
  trickHint: string;       // 帮助记忆的小窍门(肢体动作 / 联想)
  exampleWords: string[];  // 3-5 个例词
  exampleSentence: string; // 1 个简单例句(预备级孩子能懂)
  exampleSentenceCn: string;
  sparkLine?: string;      // 可选 Spark 化提示(关键位置才有)
  sortOrder: number;
};

/** 拼读练习词(CVC / 简单词) */
export type PhonicsWord = {
  id: string;              // "w_cat"
  word: string;            // "cat"
  meaningCn: string;       // "猫"
  breakdown: string[];     // ["c", "a", "t"] — 拼读拆解
  category: "cvc" | "magic_e" | "digraph" | "blend";
  unlockAfterGroup: string; // "g1" — 学完哪组后才能拼出
  exampleSentence: string;
  exampleSentenceCn: string;
  emoji: string;           // 视觉记忆 emoji
};

// ─── 7 个教学组 ──────────────────────────────────────

export const PHONICS_GROUPS: PhonicsGroup[] = [
  {
    id: "g1",
    groupName: "第 1 组 · 起步音",
    groupNameEn: "Group 1 — Starter Sounds",
    sparkIntro: "Spark 想和你一起学 6 个最有用的音!学完这一组,你就能拼出好多真词啦~",
    sparkOutro: "太棒了!Spark 现在能拼 sat、pit、tan 啦!你和 Spark 都升级啦~",
    unlockReq: "Spark 的第一个挑战",
    sortOrder: 1,
  },
  {
    id: "g2",
    groupName: "第 2 组 · 更多音",
    groupNameEn: "Group 2 — More Sounds",
    sparkIntro: "Spark 又想学 6 个新音!这次的音连起来可以拼出 cat、hen、map...",
    sparkOutro: "Spark 已经能拼很多动物名字啦!我们继续学吧~",
    unlockReq: "完成第 1 组解锁",
    sortOrder: 2,
  },
  {
    id: "g3",
    groupName: "第 3 组 · 字母大爆发",
    groupNameEn: "Group 3 — Letter Burst",
    sparkIntro: "今天 Spark 想再学 6 个音 — d、g、o、u、l、f。学完它们,你就掌握 18 个字母音啦!",
    sparkOutro: "18 个音!Spark 觉得你太厉害啦~ dog、fun、log 都能拼出来啦!",
    unlockReq: "完成第 2 组解锁",
    sortOrder: 3,
  },
  {
    id: "g4",
    groupName: "第 4 组 · 字母组合的秘密",
    groupNameEn: "Group 4 — Letter Teams",
    sparkIntro: "Spark 发现一个秘密:两个字母在一起会发新的音!ai、oa、ee... 想试试吗?",
    sparkOutro: "字母组合超神奇!现在你能拼 rain、boat、tree 啦~",
    unlockReq: "完成第 3 组解锁",
    sortOrder: 4,
  },
  {
    id: "g5",
    groupName: "第 5 组 · 短音搭档",
    groupNameEn: "Group 5 — Sound Pairs",
    sparkIntro: "ch、sh、th... 这些音听起来很有意思!像不像 Spark 在和你说悄悄话?",
    sparkOutro: "你现在能听出 ship 和 chip 的不同了!Spark 的耳朵也变厉害啦~",
    unlockReq: "完成第 4 组解锁",
    sortOrder: 5,
  },
  {
    id: "g6",
    groupName: "第 6 组 · 元音冒险",
    groupNameEn: "Group 6 — Vowel Adventures",
    sparkIntro: "Spark 想带你去元音的世界冒险!oo、ar、ou... 每个音都是一个小宝藏~",
    sparkOutro: "元音宝藏都收集啦!book、car、house 全能拼!",
    unlockReq: "完成第 5 组解锁",
    sortOrder: 6,
  },
  {
    id: "g7",
    groupName: "第 7 组 · 魔法 E",
    groupNameEn: "Group 7 — Magic E",
    sparkIntro: "Spark 听说了一个超酷的魔法:在词尾加一个不发音的 e,前面的元音就会变长!",
    sparkOutro: "魔法 e 你都掌握啦!现在 cake、bike、home 都不在话下啦~",
    unlockReq: "完成第 6 组解锁 · 最高级挑战",
    sortOrder: 7,
  },
];

// ─── 42 个 Phonics 音 ──────────────────────────────────────

export const PHONICS_ITEMS: PhonicsItem[] = [
  // ── 组 1: s, a, t, i, p, n ──────────────────────────
  {
    id: "p_s", groupId: "g1", letter: "s", letterUpper: "S",
    sound: "/s/", soundDesc: "嘶嘶嘶~ 像小蛇吐信子",
    trickHint: "学小蛇的样子,手做出弯弯的动作,嘴巴像吹气一样",
    exampleWords: ["sun", "snake", "sit", "see"],
    exampleSentence: "The sun is up.", exampleSentenceCn: "太阳升起来了。",
    sparkLine: "嘶~ Spark 也会发这个音!你和我一起念好不好?",
    sortOrder: 101,
  },
  {
    id: "p_a", groupId: "g1", letter: "a", letterUpper: "A",
    sound: "/æ/", soundDesc: "嘴巴张大,像小蚂蚁爬过手臂时的喊声 — 啊!",
    trickHint: "想象一只小蚂蚁爬到你身上,你说 'a-a-a!'",
    exampleWords: ["ant", "apple", "cat", "hat"],
    exampleSentence: "An ant on an apple.", exampleSentenceCn: "一只蚂蚁在苹果上。",
    sortOrder: 102,
  },
  {
    id: "p_t", groupId: "g1", letter: "t", letterUpper: "T",
    sound: "/t/", soundDesc: "舌头轻轻顶上颚,像在打字 — t! t! t!",
    trickHint: "想象自己在打字,手指按键盘 't-t-t'",
    exampleWords: ["top", "ten", "tap", "tea"],
    exampleSentence: "Tap the top.", exampleSentenceCn: "拍一下顶部。",
    sortOrder: 103,
  },
  {
    id: "p_i", groupId: "g1", letter: "i", letterUpper: "I",
    sound: "/ɪ/", soundDesc: "嘴角微微往两边咧,像小老鼠叫 — i! i!",
    trickHint: "做一个小老鼠的表情,鼻子皱起来念 'i-i-i'",
    exampleWords: ["ink", "in", "pin", "sit"],
    exampleSentence: "Sit in!", exampleSentenceCn: "坐进来!",
    sortOrder: 104,
  },
  {
    id: "p_p", groupId: "g1", letter: "p", letterUpper: "P",
    sound: "/p/", soundDesc: "嘴巴鼓气,然后 噗! 一下吐出来",
    trickHint: "把手放在嘴前,感受 'p' 时的气流,像吹蜡烛",
    exampleWords: ["pen", "pan", "pig", "pop"],
    exampleSentence: "A pen and a pan.", exampleSentenceCn: "一支笔和一个平底锅。",
    sparkLine: "Pop! Spark 喜欢这个音,像在弹泡泡~",
    sortOrder: 105,
  },
  {
    id: "p_n", groupId: "g1", letter: "n", letterUpper: "N",
    sound: "/n/", soundDesc: "鼻子里嗡嗡的声音,舌尖顶上颚 — n-n-n",
    trickHint: "捏住鼻子念 'n',会感觉鼻子在震动",
    exampleWords: ["net", "nut", "no", "in"],
    exampleSentence: "No, not in.", exampleSentenceCn: "不,不在里面。",
    sortOrder: 106,
  },

  // ── 组 2: c/k, e, h, r, m, d ────────────────────────
  {
    id: "p_c", groupId: "g2", letter: "c", letterUpper: "C",
    sound: "/k/", soundDesc: "喉咙后面发出的短音 — k! 像咳嗽一小下",
    trickHint: "想象自己被呛到了,轻轻 'c! c!'",
    exampleWords: ["cat", "cup", "can", "car"],
    exampleSentence: "A cat in a cup.", exampleSentenceCn: "一只小猫在杯子里。",
    sparkLine: "Cat! Spark 最喜欢的动物之一就是猫!",
    sortOrder: 201,
  },
  {
    id: "p_k", groupId: "g2", letter: "k", letterUpper: "K",
    sound: "/k/", soundDesc: "和 c 是同一个音 — k! k!",
    trickHint: "c 和 k 是好朋友,发同一个音",
    exampleWords: ["kid", "key", "kit", "king"],
    exampleSentence: "The king has a key.", exampleSentenceCn: "国王有一把钥匙。",
    sortOrder: 202,
  },
  {
    id: "p_e", groupId: "g2", letter: "e", letterUpper: "E",
    sound: "/e/", soundDesc: "嘴巴微微张开,像在喊 'eh? eh?'",
    trickHint: "假装没听清楚,问 'eh?'",
    exampleWords: ["egg", "elf", "ten", "pen"],
    exampleSentence: "Ten red eggs.", exampleSentenceCn: "十个红色的鸡蛋。",
    sortOrder: 203,
  },
  {
    id: "p_h", groupId: "g2", letter: "h", letterUpper: "H",
    sound: "/h/", soundDesc: "像哈气一样 — h! h! h! 喉咙里轻轻吐气",
    trickHint: "对着手掌哈气,感觉热热的就是 'h' 音",
    exampleWords: ["hat", "hen", "hop", "hi"],
    exampleSentence: "Hi! A hen in a hat.", exampleSentenceCn: "你好!一只戴帽子的母鸡。",
    sortOrder: 204,
  },
  {
    id: "p_r", groupId: "g2", letter: "r", letterUpper: "R",
    sound: "/r/", soundDesc: "舌头往后卷一点,像小老虎在叫 — r-r-r-r",
    trickHint: "学小老虎吼,'rrrr'",
    exampleWords: ["red", "run", "rat", "rain"],
    exampleSentence: "A red rat runs.", exampleSentenceCn: "一只红老鼠在跑。",
    sortOrder: 205,
  },
  {
    id: "p_m", groupId: "g2", letter: "m", letterUpper: "M",
    sound: "/m/", soundDesc: "嘴巴闭起来,鼻子哼 — mmm,像吃到好吃的东西",
    trickHint: "吃到好吃的就 'mmm~ 好吃'",
    exampleWords: ["mom", "map", "mat", "mum"],
    exampleSentence: "Mom is at home.", exampleSentenceCn: "妈妈在家。",
    sparkLine: "Mmm~ Spark 也想吃妈妈做的饭!",
    sortOrder: 206,
  },

  // ── 组 3: d, g, o, u, l, f ──────────────────────────
  {
    id: "p_d", groupId: "g3", letter: "d", letterUpper: "D",
    sound: "/d/", soundDesc: "舌头顶上颚,然后弹一下 — d! 像小鼓敲一下",
    trickHint: "想象敲小鼓 'd! d! d!'",
    exampleWords: ["dog", "dad", "duck", "day"],
    exampleSentence: "Dad and a dog.", exampleSentenceCn: "爸爸和一只狗。",
    sortOrder: 301,
  },
  {
    id: "p_g", groupId: "g3", letter: "g", letterUpper: "G",
    sound: "/g/", soundDesc: "喉咙深处发出 — g! g! 比 c 更靠后",
    trickHint: "想象自己在咕噜咕噜喝水,'g-g-g'",
    exampleWords: ["go", "got", "gas", "gum"],
    exampleSentence: "Go and get gum.", exampleSentenceCn: "去拿口香糖。",
    sortOrder: 302,
  },
  {
    id: "p_o", groupId: "g3", letter: "o", letterUpper: "O",
    sound: "/ɒ/", soundDesc: "嘴巴张圆圆,像在喊 — o! 像看到惊喜",
    trickHint: "看到惊喜时大喊 'oh!'",
    exampleWords: ["on", "off", "ox", "dog"],
    exampleSentence: "The dog is on top.", exampleSentenceCn: "狗在上面。",
    sortOrder: 303,
  },
  {
    id: "p_u", groupId: "g3", letter: "u", letterUpper: "U",
    sound: "/ʌ/", soundDesc: "嘴巴半开,喉咙里咕一下 — uh!",
    trickHint: "想象被人推了一下,'uh!'",
    exampleWords: ["up", "us", "bus", "cup"],
    exampleSentence: "Up the bus.", exampleSentenceCn: "上公交车。",
    sortOrder: 304,
  },
  {
    id: "p_l", groupId: "g3", letter: "l", letterUpper: "L",
    sound: "/l/", soundDesc: "舌尖顶上颚不动,声音从两边出来 — l-l-l",
    trickHint: "舌头不动,只发声 'l-l-l',像唱歌",
    exampleWords: ["log", "leg", "lap", "love"],
    exampleSentence: "Look at the log.", exampleSentenceCn: "看那根木头。",
    sortOrder: 305,
  },
  {
    id: "p_f", groupId: "g3", letter: "f", letterUpper: "F",
    sound: "/f/", soundDesc: "上牙咬下嘴唇,然后吹气 — ffff,像生气的小猫",
    trickHint: "学生气的小猫 'ffff!'",
    exampleWords: ["fish", "fox", "fun", "fan"],
    exampleSentence: "A fox and a fish.", exampleSentenceCn: "一只狐狸和一条鱼。",
    sparkLine: "Fox! Spark 就是一只小狐狸哦~",
    sortOrder: 306,
  },

  // ── 组 4: b, j, y, w, ai, oa, ee, or ───────────────
  {
    id: "p_b", groupId: "g4", letter: "b", letterUpper: "B",
    sound: "/b/", soundDesc: "嘴唇先闭住,然后 — b! 一下蹦开,像弹弓",
    trickHint: "想象嘴唇是弹弓 'b! b!'",
    exampleWords: ["bee", "boy", "bag", "ball"],
    exampleSentence: "A boy and a ball.", exampleSentenceCn: "一个男孩和一个球。",
    sortOrder: 401,
  },
  {
    id: "p_j", groupId: "g4", letter: "j", letterUpper: "J",
    sound: "/dʒ/", soundDesc: "嘴巴前后动一下,像吃果冻 — j! j!",
    trickHint: "想象在吃 jelly 果冻 'j! j!'",
    exampleWords: ["jam", "jet", "jog", "joy"],
    exampleSentence: "Jam and a jet.", exampleSentenceCn: "果酱和飞机。",
    sortOrder: 402,
  },
  {
    id: "p_y", groupId: "g4", letter: "y", letterUpper: "Y",
    sound: "/j/", soundDesc: "和 i 很像,但更短 — y! 像说 'yes' 的开头",
    trickHint: "说 'yes!' 时第一个音就是 y",
    exampleWords: ["yes", "yak", "yum", "you"],
    exampleSentence: "Yes! Yum!", exampleSentenceCn: "对啊!好吃!",
    sortOrder: 403,
  },
  {
    id: "p_w", groupId: "g4", letter: "w", letterUpper: "W",
    sound: "/w/", soundDesc: "嘴唇撮成小圆圈,像吹口哨 — w!",
    trickHint: "想象在吹口哨 'wwww'",
    exampleWords: ["we", "win", "wet", "wow"],
    exampleSentence: "We win!", exampleSentenceCn: "我们赢了!",
    sortOrder: 404,
  },
  {
    id: "p_ai", groupId: "g4", letter: "ai",
    sound: "/eɪ/", soundDesc: "两个字母在一起,发长长的 — ay!",
    trickHint: "下雨啦~ 'rain' 里就有 'ai'",
    exampleWords: ["rain", "pain", "wait", "train"],
    exampleSentence: "Wait for the rain.", exampleSentenceCn: "等雨停。",
    sparkLine: "字母组合好神奇!a 和 i 在一起就变成 'ay' 了~",
    sortOrder: 405,
  },
  {
    id: "p_oa", groupId: "g4", letter: "oa",
    sound: "/oʊ/", soundDesc: "嘴巴圆起来,长长的 — oh!",
    trickHint: "像看到漂亮东西 'oh~'",
    exampleWords: ["boat", "coat", "goat", "soap"],
    exampleSentence: "A goat in a coat.", exampleSentenceCn: "一只穿外套的山羊。",
    sortOrder: 406,
  },
  {
    id: "p_ee", groupId: "g4", letter: "ee",
    sound: "/iː/", soundDesc: "嘴角咧到两边,长长的 — eeee!",
    trickHint: "像在笑 'eeee'",
    exampleWords: ["tree", "see", "bee", "feet"],
    exampleSentence: "I see a bee in the tree.", exampleSentenceCn: "我看到树上有蜜蜂。",
    sortOrder: 407,
  },
  {
    id: "p_or", groupId: "g4", letter: "or",
    sound: "/ɔːr/", soundDesc: "嘴巴张圆,加一点 r 的味道 — or!",
    trickHint: "像在叫 'fork',舌头微微卷起",
    exampleWords: ["fork", "horn", "corn", "for"],
    exampleSentence: "A fork for me.", exampleSentenceCn: "给我一个叉子。",
    sortOrder: 408,
  },

  // ── 组 5: z, qu, ch, sh, th, ng ────────────────────
  {
    id: "p_z", groupId: "g5", letter: "z", letterUpper: "Z",
    sound: "/z/", soundDesc: "像蜜蜂飞过 — zzzz,声带在震",
    trickHint: "学蜜蜂 'zzzz'",
    exampleWords: ["zoo", "zip", "zero", "buzz"],
    exampleSentence: "Bees buzz in the zoo.", exampleSentenceCn: "蜜蜂在动物园里嗡嗡叫。",
    sortOrder: 501,
  },
  {
    id: "p_qu", groupId: "g5", letter: "qu",
    sound: "/kw/", soundDesc: "q 后面总跟着 u — kw! 像小鸭子",
    trickHint: "学小鸭子 'quack quack'",
    exampleWords: ["queen", "quick", "quiet", "quiz"],
    exampleSentence: "The queen is quick.", exampleSentenceCn: "女王很快。",
    sortOrder: 502,
  },
  {
    id: "p_ch", groupId: "g5", letter: "ch",
    sound: "/tʃ/", soundDesc: "像小火车 — ch! ch! ch!",
    trickHint: "学小火车开起来 'ch ch ch'",
    exampleWords: ["chick", "chin", "chip", "much"],
    exampleSentence: "A chick on my chin.", exampleSentenceCn: "一只小鸡在我下巴上。",
    sparkLine: "Choo choo! Spark 想坐 ch-ch-ch 小火车!",
    sortOrder: 503,
  },
  {
    id: "p_sh", groupId: "g5", letter: "sh",
    sound: "/ʃ/", soundDesc: "像让小宝宝安静 — shhh!",
    trickHint: "手指放嘴唇 'shhh'",
    exampleWords: ["ship", "shop", "fish", "wish"],
    exampleSentence: "A ship in the shop.", exampleSentenceCn: "商店里有一艘船。",
    sortOrder: 504,
  },
  {
    id: "p_th", groupId: "g5", letter: "th",
    sound: "/θ/", soundDesc: "舌头放在两排牙齿中间,轻轻吹气 — th!",
    trickHint: "舌头伸出来一点点,然后吹气",
    exampleWords: ["this", "that", "thin", "three"],
    exampleSentence: "This is three.", exampleSentenceCn: "这是三。",
    sortOrder: 505,
  },
  {
    id: "p_ng", groupId: "g5", letter: "ng",
    sound: "/ŋ/", soundDesc: "鼻子里嗡嗡的 — ng! 像 'sing' 的最后",
    trickHint: "唱歌 'sing' 时最后那个音就是 'ng'",
    exampleWords: ["sing", "king", "ring", "long"],
    exampleSentence: "The king can sing.", exampleSentenceCn: "国王会唱歌。",
    sortOrder: 506,
  },

  // ── 组 6: oo, ar, ou, oi, ue, er ──────────────────
  {
    id: "p_oo_short", groupId: "g6", letter: "oo",
    sound: "/ʊ/", soundDesc: "短短的 — uh! 像 'book' 里的音",
    trickHint: "短短的 oo,在 book、look 里",
    exampleWords: ["book", "look", "good", "foot"],
    exampleSentence: "Look at the book.", exampleSentenceCn: "看那本书。",
    sortOrder: 601,
  },
  {
    id: "p_oo_long", groupId: "g6", letter: "oo",
    sound: "/uː/", soundDesc: "长长的 — ooo! 像 'moon' 里的音",
    trickHint: "长长的 oo,在 moon、food 里",
    exampleWords: ["moon", "food", "room", "zoo"],
    exampleSentence: "The moon is in the room.", exampleSentenceCn: "月亮在房间里。",
    sortOrder: 602,
  },
  {
    id: "p_ar", groupId: "g6", letter: "ar",
    sound: "/ɑːr/", soundDesc: "嘴巴张大,加上 r — ar! 像海盗叫",
    trickHint: "学海盗 'arrr!'",
    exampleWords: ["car", "star", "park", "arm"],
    exampleSentence: "A star and a car.", exampleSentenceCn: "一颗星星和一辆车。",
    sortOrder: 603,
  },
  {
    id: "p_ou", groupId: "g6", letter: "ou",
    sound: "/aʊ/", soundDesc: "像被烫到 — ouch!",
    trickHint: "被烫到时喊 'ouch!'",
    exampleWords: ["out", "ouch", "house", "mouse"],
    exampleSentence: "A mouse in the house.", exampleSentenceCn: "房子里有只老鼠。",
    sortOrder: 604,
  },
  {
    id: "p_oi", groupId: "g6", letter: "oi",
    sound: "/ɔɪ/", soundDesc: "嘴巴圆变扁 — oi! 像在叫人",
    trickHint: "叫人的时候 'oi!'",
    exampleWords: ["oil", "coin", "boil", "join"],
    exampleSentence: "A coin in the oil.", exampleSentenceCn: "油里有一枚硬币。",
    sortOrder: 605,
  },
  {
    id: "p_er", groupId: "g6", letter: "er",
    sound: "/ɜːr/", soundDesc: "轻轻的 — er,像在思考 'em...'",
    trickHint: "在想问题时 'er...'",
    exampleWords: ["her", "term", "sister", "winter"],
    exampleSentence: "Her sister is here.", exampleSentenceCn: "她妹妹在这里。",
    sortOrder: 606,
  },

  // ── 组 7: Magic E (a_e, i_e, o_e, u_e, e_e) ────────
  {
    id: "p_a_e", groupId: "g7", letter: "a_e",
    sound: "/eɪ/", soundDesc: "魔法 e 让 a 变长 — ay!",
    trickHint: "cake、name、make — 后面的 e 不读,但让 a 变长",
    exampleWords: ["cake", "name", "make", "lake"],
    exampleSentence: "Make a cake.", exampleSentenceCn: "做一个蛋糕。",
    sparkLine: "Magic e 真神奇!它不发音,但让前面的字母变好长~",
    sortOrder: 701,
  },
  {
    id: "p_i_e", groupId: "g7", letter: "i_e",
    sound: "/aɪ/", soundDesc: "魔法 e 让 i 变长 — eye!",
    trickHint: "bike、time、five — 后面的 e 不读,让 i 变长",
    exampleWords: ["bike", "time", "five", "nice"],
    exampleSentence: "Five bikes, nice!", exampleSentenceCn: "五辆自行车,真好!",
    sortOrder: 702,
  },
  {
    id: "p_o_e", groupId: "g7", letter: "o_e",
    sound: "/oʊ/", soundDesc: "魔法 e 让 o 变长 — oh!",
    trickHint: "home、nose、rose — 后面的 e 不读,让 o 变长",
    exampleWords: ["home", "nose", "rose", "note"],
    exampleSentence: "A rose at home.", exampleSentenceCn: "家里的一朵玫瑰。",
    sortOrder: 703,
  },
  {
    id: "p_u_e", groupId: "g7", letter: "u_e",
    sound: "/juː/", soundDesc: "魔法 e 让 u 变长 — yoo!",
    trickHint: "cute、cube、mute — 后面的 e 不读,让 u 变长",
    exampleWords: ["cute", "cube", "tube", "use"],
    exampleSentence: "A cute cube.", exampleSentenceCn: "一个可爱的方块。",
    sortOrder: 704,
  },
  {
    id: "p_e_e", groupId: "g7", letter: "e_e",
    sound: "/iː/", soundDesc: "魔法 e 让 e 变长 — eee!",
    trickHint: "比较少见,如 these、Pete",
    exampleWords: ["these", "Pete", "theme", "complete"],
    exampleSentence: "These are nice.", exampleSentenceCn: "这些很好。",
    sortOrder: 705,
  },
];

// ─── 50 个拼读练习词 ──────────────────────────────────────

export const PHONICS_WORDS: PhonicsWord[] = [
  // CVC 词 - 学完组 1 (s, a, t, i, p, n) 就能拼
  { id: "w_sat", word: "sat", meaningCn: "坐(过去式)", breakdown: ["s", "a", "t"], category: "cvc", unlockAfterGroup: "g1",
    exampleSentence: "I sat on a pin.", exampleSentenceCn: "我坐在大头针上。", emoji: "🪑" },
  { id: "w_tap", word: "tap", meaningCn: "轻拍", breakdown: ["t", "a", "p"], category: "cvc", unlockAfterGroup: "g1",
    exampleSentence: "Tap the pan.", exampleSentenceCn: "拍一下平底锅。", emoji: "👆" },
  { id: "w_pin", word: "pin", meaningCn: "大头针", breakdown: ["p", "i", "n"], category: "cvc", unlockAfterGroup: "g1",
    exampleSentence: "A pin on the pan.", exampleSentenceCn: "平底锅上有个大头针。", emoji: "📍" },
  { id: "w_sit", word: "sit", meaningCn: "坐", breakdown: ["s", "i", "t"], category: "cvc", unlockAfterGroup: "g1",
    exampleSentence: "Sit in!", exampleSentenceCn: "坐进来!", emoji: "💺" },
  { id: "w_tan", word: "tan", meaningCn: "棕褐色", breakdown: ["t", "a", "n"], category: "cvc", unlockAfterGroup: "g1",
    exampleSentence: "A tan cat.", exampleSentenceCn: "一只棕色的猫。", emoji: "🟫" },
  { id: "w_pan", word: "pan", meaningCn: "平底锅", breakdown: ["p", "a", "n"], category: "cvc", unlockAfterGroup: "g1",
    exampleSentence: "A pan and an ant.", exampleSentenceCn: "一个平底锅和一只蚂蚁。", emoji: "🍳" },
  { id: "w_nap", word: "nap", meaningCn: "小睡", breakdown: ["n", "a", "p"], category: "cvc", unlockAfterGroup: "g1",
    exampleSentence: "Take a nap.", exampleSentenceCn: "睡一会儿。", emoji: "😴" },

  // 学完组 2 (c/k, e, h, r, m) 后能拼
  { id: "w_cat", word: "cat", meaningCn: "猫", breakdown: ["c", "a", "t"], category: "cvc", unlockAfterGroup: "g2",
    exampleSentence: "A cat in a hat.", exampleSentenceCn: "戴帽子的猫。", emoji: "🐱" },
  { id: "w_hat", word: "hat", meaningCn: "帽子", breakdown: ["h", "a", "t"], category: "cvc", unlockAfterGroup: "g2",
    exampleSentence: "Hat on the cat.", exampleSentenceCn: "猫头上的帽子。", emoji: "🎩" },
  { id: "w_hen", word: "hen", meaningCn: "母鸡", breakdown: ["h", "e", "n"], category: "cvc", unlockAfterGroup: "g2",
    exampleSentence: "A hen and a pen.", exampleSentenceCn: "一只母鸡和一支笔。", emoji: "🐔" },
  { id: "w_pen", word: "pen", meaningCn: "笔", breakdown: ["p", "e", "n"], category: "cvc", unlockAfterGroup: "g2",
    exampleSentence: "Pen in my hand.", exampleSentenceCn: "笔在我手里。", emoji: "🖊️" },
  { id: "w_mat", word: "mat", meaningCn: "垫子", breakdown: ["m", "a", "t"], category: "cvc", unlockAfterGroup: "g2",
    exampleSentence: "The cat is on the mat.", exampleSentenceCn: "猫在垫子上。", emoji: "🟦" },
  { id: "w_map", word: "map", meaningCn: "地图", breakdown: ["m", "a", "p"], category: "cvc", unlockAfterGroup: "g2",
    exampleSentence: "Look at the map.", exampleSentenceCn: "看地图。", emoji: "🗺️" },
  { id: "w_red", word: "red", meaningCn: "红色", breakdown: ["r", "e", "d"], category: "cvc", unlockAfterGroup: "g2",
    exampleSentence: "A red hen.", exampleSentenceCn: "一只红色的母鸡。", emoji: "🔴" },
  { id: "w_run", word: "run", meaningCn: "跑", breakdown: ["r", "u", "n"], category: "cvc", unlockAfterGroup: "g3",
    exampleSentence: "Run, cat, run!", exampleSentenceCn: "跑啊,猫,跑!", emoji: "🏃" },
  { id: "w_can", word: "can", meaningCn: "能 / 罐子", breakdown: ["c", "a", "n"], category: "cvc", unlockAfterGroup: "g2",
    exampleSentence: "I can run.", exampleSentenceCn: "我能跑。", emoji: "🥫" },
  { id: "w_kid", word: "kid", meaningCn: "小孩", breakdown: ["k", "i", "d"], category: "cvc", unlockAfterGroup: "g3",
    exampleSentence: "A kid and a cat.", exampleSentenceCn: "一个小孩和一只猫。", emoji: "🧒" },

  // 学完组 3 (d, g, o, u, l, f) 后能拼
  { id: "w_dog", word: "dog", meaningCn: "狗", breakdown: ["d", "o", "g"], category: "cvc", unlockAfterGroup: "g3",
    exampleSentence: "My dog can run.", exampleSentenceCn: "我的狗会跑。", emoji: "🐶" },
  { id: "w_fox", word: "fox", meaningCn: "狐狸", breakdown: ["f", "o", "x"], category: "cvc", unlockAfterGroup: "g3",
    exampleSentence: "Spark is a fox.", exampleSentenceCn: "Spark 是一只狐狸。", emoji: "🦊" },
  { id: "w_pig", word: "pig", meaningCn: "猪", breakdown: ["p", "i", "g"], category: "cvc", unlockAfterGroup: "g3",
    exampleSentence: "A pig and a dog.", exampleSentenceCn: "一只猪和一只狗。", emoji: "🐷" },
  { id: "w_log", word: "log", meaningCn: "木头", breakdown: ["l", "o", "g"], category: "cvc", unlockAfterGroup: "g3",
    exampleSentence: "The dog sits on a log.", exampleSentenceCn: "狗坐在木头上。", emoji: "🪵" },
  { id: "w_sun", word: "sun", meaningCn: "太阳", breakdown: ["s", "u", "n"], category: "cvc", unlockAfterGroup: "g3",
    exampleSentence: "The sun is up.", exampleSentenceCn: "太阳升起来了。", emoji: "☀️" },
  { id: "w_fun", word: "fun", meaningCn: "好玩", breakdown: ["f", "u", "n"], category: "cvc", unlockAfterGroup: "g3",
    exampleSentence: "Fun in the sun.", exampleSentenceCn: "在太阳下玩耍。", emoji: "🎉" },
  { id: "w_cup", word: "cup", meaningCn: "杯子", breakdown: ["c", "u", "p"], category: "cvc", unlockAfterGroup: "g3",
    exampleSentence: "A cup of tea.", exampleSentenceCn: "一杯茶。", emoji: "☕" },
  { id: "w_top", word: "top", meaningCn: "顶部", breakdown: ["t", "o", "p"], category: "cvc", unlockAfterGroup: "g3",
    exampleSentence: "On top of the box.", exampleSentenceCn: "盒子的顶上。", emoji: "🔝" },
  { id: "w_hop", word: "hop", meaningCn: "跳", breakdown: ["h", "o", "p"], category: "cvc", unlockAfterGroup: "g3",
    exampleSentence: "Hop, frog, hop!", exampleSentenceCn: "跳啊,青蛙,跳!", emoji: "🐸" },

  // 学完组 4 (b, j, y, w + 字母组合) 后能拼
  { id: "w_bee", word: "bee", meaningCn: "蜜蜂", breakdown: ["b", "ee"], category: "digraph", unlockAfterGroup: "g4",
    exampleSentence: "A bee in a tree.", exampleSentenceCn: "树上一只蜜蜂。", emoji: "🐝" },
  { id: "w_tree", word: "tree", meaningCn: "树", breakdown: ["t", "r", "ee"], category: "digraph", unlockAfterGroup: "g4",
    exampleSentence: "Look at the tree.", exampleSentenceCn: "看那棵树。", emoji: "🌳" },
  { id: "w_see", word: "see", meaningCn: "看见", breakdown: ["s", "ee"], category: "digraph", unlockAfterGroup: "g4",
    exampleSentence: "I see you!", exampleSentenceCn: "我看见你了!", emoji: "👀" },
  { id: "w_rain", word: "rain", meaningCn: "雨", breakdown: ["r", "ai", "n"], category: "digraph", unlockAfterGroup: "g4",
    exampleSentence: "Rain on the train.", exampleSentenceCn: "火车上有雨。", emoji: "🌧️" },
  { id: "w_train", word: "train", meaningCn: "火车", breakdown: ["t", "r", "ai", "n"], category: "digraph", unlockAfterGroup: "g4",
    exampleSentence: "The train is fast.", exampleSentenceCn: "火车很快。", emoji: "🚂" },
  { id: "w_boat", word: "boat", meaningCn: "船", breakdown: ["b", "oa", "t"], category: "digraph", unlockAfterGroup: "g4",
    exampleSentence: "A boat in the sea.", exampleSentenceCn: "海里有一条船。", emoji: "⛵" },
  { id: "w_goat", word: "goat", meaningCn: "山羊", breakdown: ["g", "oa", "t"], category: "digraph", unlockAfterGroup: "g4",
    exampleSentence: "The goat is on a boat.", exampleSentenceCn: "山羊在船上。", emoji: "🐐" },
  { id: "w_boy", word: "boy", meaningCn: "男孩", breakdown: ["b", "oy"], category: "digraph", unlockAfterGroup: "g4",
    exampleSentence: "A boy and a toy.", exampleSentenceCn: "一个男孩和一个玩具。", emoji: "👦" },
  { id: "w_jam", word: "jam", meaningCn: "果酱", breakdown: ["j", "a", "m"], category: "cvc", unlockAfterGroup: "g4",
    exampleSentence: "I like jam.", exampleSentenceCn: "我喜欢果酱。", emoji: "🍓" },
  { id: "w_yes", word: "yes", meaningCn: "是的", breakdown: ["y", "e", "s"], category: "cvc", unlockAfterGroup: "g4",
    exampleSentence: "Yes, I can!", exampleSentenceCn: "是的,我能!", emoji: "✅" },

  // 学完组 5 (ch, sh, th, ng, qu, z) 后能拼
  { id: "w_ship", word: "ship", meaningCn: "船", breakdown: ["sh", "i", "p"], category: "digraph", unlockAfterGroup: "g5",
    exampleSentence: "A big ship.", exampleSentenceCn: "一艘大船。", emoji: "🚢" },
  { id: "w_fish", word: "fish", meaningCn: "鱼", breakdown: ["f", "i", "sh"], category: "digraph", unlockAfterGroup: "g5",
    exampleSentence: "A fish in the dish.", exampleSentenceCn: "盘子里有一条鱼。", emoji: "🐠" },
  { id: "w_chip", word: "chip", meaningCn: "薯条", breakdown: ["ch", "i", "p"], category: "digraph", unlockAfterGroup: "g5",
    exampleSentence: "Fish and chips.", exampleSentenceCn: "炸鱼薯条。", emoji: "🍟" },
  { id: "w_chick", word: "chick", meaningCn: "小鸡", breakdown: ["ch", "i", "ck"], category: "digraph", unlockAfterGroup: "g5",
    exampleSentence: "A chick on my chin.", exampleSentenceCn: "下巴上的小鸡。", emoji: "🐣" },
  { id: "w_this", word: "this", meaningCn: "这个", breakdown: ["th", "i", "s"], category: "digraph", unlockAfterGroup: "g5",
    exampleSentence: "This is fun.", exampleSentenceCn: "这很好玩。", emoji: "👉" },
  { id: "w_king", word: "king", meaningCn: "国王", breakdown: ["k", "i", "ng"], category: "digraph", unlockAfterGroup: "g5",
    exampleSentence: "The king can sing.", exampleSentenceCn: "国王会唱歌。", emoji: "👑" },
  { id: "w_sing", word: "sing", meaningCn: "唱歌", breakdown: ["s", "i", "ng"], category: "digraph", unlockAfterGroup: "g5",
    exampleSentence: "Sing a song.", exampleSentenceCn: "唱首歌。", emoji: "🎵" },
  { id: "w_queen", word: "queen", meaningCn: "王后", breakdown: ["qu", "ee", "n"], category: "digraph", unlockAfterGroup: "g5",
    exampleSentence: "The queen and the king.", exampleSentenceCn: "王后和国王。", emoji: "👸" },
  { id: "w_zoo", word: "zoo", meaningCn: "动物园", breakdown: ["z", "oo"], category: "digraph", unlockAfterGroup: "g6",
    exampleSentence: "Go to the zoo.", exampleSentenceCn: "去动物园。", emoji: "🦁" },

  // 学完组 6 (oo, ar, ou, oi, er) 后能拼
  { id: "w_book", word: "book", meaningCn: "书", breakdown: ["b", "oo", "k"], category: "digraph", unlockAfterGroup: "g6",
    exampleSentence: "Look at the book.", exampleSentenceCn: "看这本书。", emoji: "📖" },
  { id: "w_moon", word: "moon", meaningCn: "月亮", breakdown: ["m", "oo", "n"], category: "digraph", unlockAfterGroup: "g6",
    exampleSentence: "The moon is bright.", exampleSentenceCn: "月亮很亮。", emoji: "🌙" },
  { id: "w_car", word: "car", meaningCn: "汽车", breakdown: ["c", "ar"], category: "digraph", unlockAfterGroup: "g6",
    exampleSentence: "A red car.", exampleSentenceCn: "一辆红色的车。", emoji: "🚗" },
  { id: "w_star", word: "star", meaningCn: "星星", breakdown: ["s", "t", "ar"], category: "digraph", unlockAfterGroup: "g6",
    exampleSentence: "A star in the sky.", exampleSentenceCn: "天上的一颗星星。", emoji: "⭐" },
  { id: "w_house", word: "house", meaningCn: "房子", breakdown: ["h", "ou", "se"], category: "digraph", unlockAfterGroup: "g6",
    exampleSentence: "My house is big.", exampleSentenceCn: "我的房子很大。", emoji: "🏠" },
  { id: "w_mouse", word: "mouse", meaningCn: "老鼠", breakdown: ["m", "ou", "se"], category: "digraph", unlockAfterGroup: "g6",
    exampleSentence: "A mouse in the house.", exampleSentenceCn: "房子里有一只老鼠。", emoji: "🐭" },
  { id: "w_coin", word: "coin", meaningCn: "硬币", breakdown: ["c", "oi", "n"], category: "digraph", unlockAfterGroup: "g6",
    exampleSentence: "A gold coin.", exampleSentenceCn: "一枚金币。", emoji: "🪙" },
  { id: "w_sister", word: "sister", meaningCn: "姐妹", breakdown: ["s", "i", "s", "t", "er"], category: "digraph", unlockAfterGroup: "g6",
    exampleSentence: "My sister is here.", exampleSentenceCn: "我姐姐在这。", emoji: "👧" },

  // 学完组 7 (Magic E) 后能拼
  { id: "w_cake", word: "cake", meaningCn: "蛋糕", breakdown: ["c", "a", "k", "e"], category: "magic_e", unlockAfterGroup: "g7",
    exampleSentence: "Make a cake.", exampleSentenceCn: "做一个蛋糕。", emoji: "🎂" },
  { id: "w_bike", word: "bike", meaningCn: "自行车", breakdown: ["b", "i", "k", "e"], category: "magic_e", unlockAfterGroup: "g7",
    exampleSentence: "My new bike.", exampleSentenceCn: "我的新自行车。", emoji: "🚲" },
  { id: "w_home", word: "home", meaningCn: "家", breakdown: ["h", "o", "m", "e"], category: "magic_e", unlockAfterGroup: "g7",
    exampleSentence: "I go home.", exampleSentenceCn: "我回家。", emoji: "🏡" },
  { id: "w_nose", word: "nose", meaningCn: "鼻子", breakdown: ["n", "o", "s", "e"], category: "magic_e", unlockAfterGroup: "g7",
    exampleSentence: "Spark has a nose.", exampleSentenceCn: "Spark 有鼻子。", emoji: "👃" },
  { id: "w_name", word: "name", meaningCn: "名字", breakdown: ["n", "a", "m", "e"], category: "magic_e", unlockAfterGroup: "g7",
    exampleSentence: "My name is Mei.", exampleSentenceCn: "我叫梅。", emoji: "🏷️" },
  { id: "w_five", word: "five", meaningCn: "五", breakdown: ["f", "i", "v", "e"], category: "magic_e", unlockAfterGroup: "g7",
    exampleSentence: "Five apples.", exampleSentenceCn: "五个苹果。", emoji: "5️⃣" },
];

// ─── 工具函数 ──────────────────────────────────────

/** 按组取所有 Phonics 项 */
export function getPhonicsByGroup(groupId: string): PhonicsItem[] {
  return PHONICS_ITEMS.filter(p => p.groupId === groupId).sort((a, b) => a.sortOrder - b.sortOrder);
}

/** 取学完某组后能拼的词 */
export function getWordsUnlockedAfter(groupId: string): PhonicsWord[] {
  return PHONICS_WORDS.filter(w => w.unlockAfterGroup === groupId);
}

/** 取所有已解锁的词(根据用户完成到第几组) */
export function getUnlockedWords(completedGroupIds: string[]): PhonicsWord[] {
  const groupOrder = PHONICS_GROUPS.map(g => g.id);
  const highestCompletedIdx = Math.max(...completedGroupIds.map(g => groupOrder.indexOf(g)));
  return PHONICS_WORDS.filter(w => groupOrder.indexOf(w.unlockAfterGroup) <= highestCompletedIdx);
}

/** 统计:总音数 / 总词数 */
export const PHONICS_STATS = {
  totalGroups: PHONICS_GROUPS.length,
  totalSounds: PHONICS_ITEMS.length,
  totalWords: PHONICS_WORDS.length,
};
