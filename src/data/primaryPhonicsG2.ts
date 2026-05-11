// 小学二年级 Phonics 扩展(对接 G1 Phonics 体系)
// =============================================================
// 数据规模:
//   • 5 个教学组(G2 专属,sortOrder 起始 100,不与 G1 冲突)
//   • 25 个新音(对应教育部 2022 新课标二年级 / UK Phonics Stage 4-5)
//
// 主题分布:
//   1. Silent Letters 默音字母(5 个):kn / wr / mb / gh / silent b
//   2. Trigraphs 三字母组合(5 个):tch / dge / igh / ough / eigh
//   3. R-Controlled Vowels(5 个):ar / er / ir / or / ur
//   4. Advanced Vowels(5 个):aw / au / ew / oy / oi
//   5. Soft & Hard Sounds(5 个):soft c / soft g / ph / y as long-i / y as long-e
//
// 设计原则:
//   1. 完全复用 G1 PhonicsItem / PhonicsGroup 类型(同一份 type 定义)
//   2. sortOrder 100-124,与 G1(1-99)严格隔离
//   3. groupId 前缀 "g2_" 区分 G1 的 "g1"-"g7"
//   4. 例词带 IPA + 中文释义 + emoji(与 G1 一致)
//   5. 增加 funFact + sparkLine(关键音点),保持中密度叙事
//
// UI 接入建议:
//   • 合并到 primary_phonics 数据池,按 grade 维度过滤
//   • G2 用户进入 /primary/phonics?grade=2,展示 G1 已学(锁定回顾) + G2 新内容
//   • 或者:解锁 G1 全部 7 组后,自动进入 G2 第 1 组

import type { PhonicsGroup, PhonicsItem } from "./primaryPhonics";

// ─── 5 个 G2 教学组 ──────────────────────────────────────

export const PHONICS_GROUPS_G2: PhonicsGroup[] = [
  {
    id: "g2_g1",
    groupName: "二年级第 1 组 · 不发音的字母",
    groupNameEn: "Silent Letters",
    sparkIntro: "Spark 发现了一些'安静的字母'!它们在词里却不发音哦~",
    sparkOutro: "5 个默音字母!这下你认得更多大字了!",
    unlockReq: "G1 全部 7 组通关",
    sortOrder: 1,
  },
  {
    id: "g2_g2",
    groupName: "二年级第 2 组 · 三字母组合",
    groupNameEn: "Trigraphs",
    sparkIntro: "三个字母在一起,可以发一个音哦!Spark 教你这些超级组合~",
    sparkOutro: "好棒!三字母组合都难不倒你!",
    unlockReq: "完成二年级第 1 组",
    sortOrder: 2,
  },
  {
    id: "g2_g3",
    groupName: "二年级第 3 组 · R 控制的元音",
    groupNameEn: "R-Controlled Vowels",
    sparkIntro: "字母 r 是个'魔法字母'!元音遇到它,声音会变~",
    sparkOutro: "R 的魔法你掌握啦!读 'car'、'bird'、'corn' 都难不倒你~",
    unlockReq: "完成二年级第 2 组",
    sortOrder: 3,
  },
  {
    id: "g2_g4",
    groupName: "二年级第 4 组 · 高级元音组合",
    groupNameEn: "Advanced Vowels",
    sparkIntro: "更多的元音组合!Spark 带你认识这些'声音双胞胎'~",
    sparkOutro: "你的元音地图越来越丰富啦!",
    unlockReq: "完成二年级第 3 组",
    sortOrder: 4,
  },
  {
    id: "g2_g5",
    groupName: "二年级第 5 组 · 软硬音区分",
    groupNameEn: "Soft & Hard Sounds",
    sparkIntro: "有的字母会说两种声音!Spark 教你听出区别~",
    sparkOutro: "终极挑战完成!你是 Phonics 小专家啦!",
    unlockReq: "完成二年级第 4 组",
    sortOrder: 5,
  }
];

// ─── 25 个 G2 Phonics 音 ──────────────────────────────────────

export const PHONICS_ITEMS_G2: PhonicsItem[] = [
  {
    id: "p_kn",
    groupId: "g2_g1",
    letter: "kn",
    sortOrder: 100,
    sound: "/n/",
    soundDesc: "k 不发音,只读 n 的声音(像鼻子里挤出的 nnn)",
    trickHint: "看到 kn,把 k 当透明字母,只听 n",
    exampleWords: [
      { word: "knee", ipa: "/niː/", meaningCn: "膝盖", emoji: "🦵" },
      { word: "know", ipa: "/noʊ/", meaningCn: "知道", emoji: "🤔" },
      { word: "knife", ipa: "/naɪf/", meaningCn: "刀", emoji: "🔪" },
      { word: "knock", ipa: "/nɒk/", meaningCn: "敲", emoji: "✊" }
    ],
    exampleSentence: "Knock on the door, please.",
    exampleSentenceCn: "请敲门。",
    funFact: "k 在 n 前面永远不发音!是英语的小秘密~",
    sparkLine: "Spark 第一次看到 'knee' 也以为读 '克尼'~ 其实只读 'ni'!",
  },
  {
    id: "p_wr",
    groupId: "g2_g1",
    letter: "wr",
    sortOrder: 101,
    sound: "/r/",
    soundDesc: "w 不发音,只读 r 的声音(舌头卷起)",
    trickHint: "看到 wr,w 是哑巴,只听 r",
    exampleWords: [
      { word: "write", ipa: "/raɪt/", meaningCn: "写", emoji: "✍️" },
      { word: "wrong", ipa: "/rɒŋ/", meaningCn: "错的", emoji: "❌" },
      { word: "wrist", ipa: "/rɪst/", meaningCn: "手腕", emoji: "🤚" },
      { word: "wrap", ipa: "/ræp/", meaningCn: "包起来", emoji: "🎁" }
    ],
    exampleSentence: "Write your name here.",
    exampleSentenceCn: "在这里写你的名字。",
  },
  {
    id: "p_mb",
    groupId: "g2_g1",
    letter: "mb",
    sortOrder: 102,
    sound: "/m/",
    soundDesc: "b 在词尾不发音,只读 m 的声音",
    trickHint: "看到 mb 结尾,b 就溜走了,只剩 m",
    exampleWords: [
      { word: "lamb", ipa: "/læm/", meaningCn: "小羊", emoji: "🐑" },
      { word: "comb", ipa: "/koʊm/", meaningCn: "梳子", emoji: "💇" },
      { word: "climb", ipa: "/klaɪm/", meaningCn: "爬", emoji: "🧗" },
      { word: "thumb", ipa: "/θʌm/", meaningCn: "大拇指", emoji: "👍" }
    ],
    exampleSentence: "I have a small thumb.",
    exampleSentenceCn: "我有个小拇指。",
  },
  {
    id: "p_gh",
    groupId: "g2_g1",
    letter: "gh",
    sortOrder: 103,
    sound: "/silent/",
    soundDesc: "gh 经常不发音(比如 night, light, right)",
    trickHint: "看到 igh / ough,gh 通常不读",
    exampleWords: [
      { word: "night", ipa: "/naɪt/", meaningCn: "夜晚", emoji: "🌙" },
      { word: "light", ipa: "/laɪt/", meaningCn: "光", emoji: "💡" },
      { word: "right", ipa: "/raɪt/", meaningCn: "对的", emoji: "✅" },
      { word: "high", ipa: "/haɪ/", meaningCn: "高的", emoji: "🗻" }
    ],
    exampleSentence: "The light is bright.",
    exampleSentenceCn: "光很亮。",
    funFact: "gh 这两个字母在英语里几乎不发音~",
  },
  {
    id: "p_silent_b",
    groupId: "g2_g1",
    letter: "b (silent)",
    sortOrder: 104,
    sound: "/silent/",
    soundDesc: "有些词里 b 不发音,比如 thumb / lamb / climb",
    trickHint: "看到 mb 结尾,b 就是哑巴",
    exampleWords: [
      { word: "doubt", ipa: "/daʊt/", meaningCn: "怀疑", emoji: "🤔" },
      { word: "tomb", ipa: "/tuːm/", meaningCn: "坟墓", emoji: "🪦" },
      { word: "debt", ipa: "/det/", meaningCn: "债务", emoji: "💰" },
      { word: "limb", ipa: "/lɪm/", meaningCn: "肢", emoji: "🦴" }
    ],
    exampleSentence: "Climb up the tree.",
    exampleSentenceCn: "爬到树上。",
  },
  {
    id: "p_tch",
    groupId: "g2_g2",
    letter: "tch",
    sortOrder: 105,
    sound: "/tʃ/",
    soundDesc: "三个字母一起读 'ch' 的声音(像打喷嚏 chchch)",
    trickHint: "短元音后通常用 tch(像 catch / fetch)",
    exampleWords: [
      { word: "catch", ipa: "/kætʃ/", meaningCn: "抓住", emoji: "🎾" },
      { word: "watch", ipa: "/wɒtʃ/", meaningCn: "手表", emoji: "⌚" },
      { word: "match", ipa: "/mætʃ/", meaningCn: "比赛", emoji: "⚽" },
      { word: "kitchen", ipa: "/ˈkɪtʃən/", meaningCn: "厨房", emoji: "🍳" }
    ],
    exampleSentence: "Catch the ball!",
    exampleSentenceCn: "接住球!",
  },
  {
    id: "p_dge",
    groupId: "g2_g2",
    letter: "dge",
    sortOrder: 106,
    sound: "/dʒ/",
    soundDesc: "三个字母一起读 'j' 的声音",
    trickHint: "短元音后用 dge(像 bridge / edge)",
    exampleWords: [
      { word: "bridge", ipa: "/brɪdʒ/", meaningCn: "桥", emoji: "🌉" },
      { word: "edge", ipa: "/edʒ/", meaningCn: "边缘", emoji: "📏" },
      { word: "judge", ipa: "/dʒʌdʒ/", meaningCn: "法官", emoji: "⚖️" },
      { word: "fudge", ipa: "/fʌdʒ/", meaningCn: "软糖", emoji: "🍬" }
    ],
    exampleSentence: "Walk on the bridge.",
    exampleSentenceCn: "在桥上走。",
  },
  {
    id: "p_igh",
    groupId: "g2_g2",
    letter: "igh",
    sortOrder: 107,
    sound: "/aɪ/",
    soundDesc: "三个字母一起读 'I' 的长音(像说 'eye')",
    trickHint: "看到 igh,只读字母 i 的名字音 /aɪ/",
    exampleWords: [
      { word: "high", ipa: "/haɪ/", meaningCn: "高的", emoji: "🗻" },
      { word: "night", ipa: "/naɪt/", meaningCn: "夜晚", emoji: "🌙" },
      { word: "bright", ipa: "/braɪt/", meaningCn: "明亮的", emoji: "💡" },
      { word: "fight", ipa: "/faɪt/", meaningCn: "打架", emoji: "💪" }
    ],
    exampleSentence: "The moon is bright at night.",
    exampleSentenceCn: "月亮在夜里很亮。",
    sparkLine: "Spark 看 igh 就喊 'i'! 因为 g h 都不出声~",
  },
  {
    id: "p_ough",
    groupId: "g2_g2",
    letter: "ough",
    sortOrder: 108,
    sound: "/ɔː/",
    soundDesc: "四字母组合,常读 'aw' 或 'oh' 的音(英语难点!)",
    trickHint: "ough 有好几种读音,先记最常见的 /ɔː/",
    exampleWords: [
      { word: "thought", ipa: "/θɔːt/", meaningCn: "想(过去式)", emoji: "💭" },
      { word: "brought", ipa: "/brɔːt/", meaningCn: "带来(过去式)", emoji: "🎁" },
      { word: "though", ipa: "/ðoʊ/", meaningCn: "尽管", emoji: "🤷" },
      { word: "rough", ipa: "/rʌf/", meaningCn: "粗糙的", emoji: "🪨" }
    ],
    exampleSentence: "I thought you knew.",
    exampleSentenceCn: "我以为你知道。",
    funFact: "ough 是英语里最'调皮'的组合,可以读 6 种音!",
  },
  {
    id: "p_eigh",
    groupId: "g2_g2",
    letter: "eigh",
    sortOrder: 109,
    sound: "/eɪ/",
    soundDesc: "四字母组合,读 'ay' 的音",
    trickHint: "eigh = ay 的音(像 eight 八)",
    exampleWords: [
      { word: "eight", ipa: "/eɪt/", meaningCn: "八", emoji: "8️⃣" },
      { word: "weight", ipa: "/weɪt/", meaningCn: "重量", emoji: "⚖️" },
      { word: "neighbor", ipa: "/ˈneɪbər/", meaningCn: "邻居", emoji: "🏘️" },
      { word: "sleigh", ipa: "/sleɪ/", meaningCn: "雪橇", emoji: "🛷" }
    ],
    exampleSentence: "I am eight years old.",
    exampleSentenceCn: "我八岁了。",
  },
  {
    id: "p_ar",
    groupId: "g2_g3",
    letter: "ar",
    sortOrder: 110,
    sound: "/ɑːr/",
    soundDesc: "嘴张大,舌头后缩,发 'ar' 的声音(像海盗喊 arrr)",
    trickHint: "ar = 海盗音 arrrr!",
    exampleWords: [
      { word: "car", ipa: "/kɑːr/", meaningCn: "汽车", emoji: "🚗" },
      { word: "star", ipa: "/stɑːr/", meaningCn: "星星", emoji: "⭐" },
      { word: "farm", ipa: "/fɑːrm/", meaningCn: "农场", emoji: "🌾" },
      { word: "park", ipa: "/pɑːrk/", meaningCn: "公园", emoji: "🌳" }
    ],
    exampleSentence: "The car is in the park.",
    exampleSentenceCn: "车在公园里。",
    sparkLine: "Spark 假装海盗:Arrrr! ar 就是海盗音!",
  },
  {
    id: "p_er",
    groupId: "g2_g3",
    letter: "er",
    sortOrder: 111,
    sound: "/ɜːr/",
    soundDesc: "嘴唇微张,舌头平放,发 'er' 的中性音",
    trickHint: "er = 蜜蜂飞过的嗡嗡声 errrr",
    exampleWords: [
      { word: "her", ipa: "/hɜːr/", meaningCn: "她的", emoji: "👩" },
      { word: "sister", ipa: "/ˈsɪstər/", meaningCn: "姐妹", emoji: "👭" },
      { word: "water", ipa: "/ˈwɔːtər/", meaningCn: "水", emoji: "💧" },
      { word: "tiger", ipa: "/ˈtaɪɡər/", meaningCn: "老虎", emoji: "🐯" }
    ],
    exampleSentence: "My sister is older than me.",
    exampleSentenceCn: "我姐姐比我大。",
  },
  {
    id: "p_ir",
    groupId: "g2_g3",
    letter: "ir",
    sortOrder: 112,
    sound: "/ɜːr/",
    soundDesc: "和 er 同音,但拼写用 ir",
    trickHint: "ir / er / ur 都念一样的音!",
    exampleWords: [
      { word: "bird", ipa: "/bɜːrd/", meaningCn: "鸟", emoji: "🐦" },
      { word: "girl", ipa: "/ɡɜːrl/", meaningCn: "女孩", emoji: "👧" },
      { word: "first", ipa: "/fɜːrst/", meaningCn: "第一", emoji: "🥇" },
      { word: "shirt", ipa: "/ʃɜːrt/", meaningCn: "衬衫", emoji: "👕" }
    ],
    exampleSentence: "The bird is a girl.",
    exampleSentenceCn: "这只鸟是只母鸟。",
    funFact: "ir / er / ur 三个组合都读同一个音!",
  },
  {
    id: "p_or",
    groupId: "g2_g3",
    letter: "or",
    sortOrder: 113,
    sound: "/ɔːr/",
    soundDesc: "嘴圆起来,发 'or' 的圆音",
    trickHint: "or = 玉米的拼读 corn 的开头音",
    exampleWords: [
      { word: "corn", ipa: "/kɔːrn/", meaningCn: "玉米", emoji: "🌽" },
      { word: "horse", ipa: "/hɔːrs/", meaningCn: "马", emoji: "🐴" },
      { word: "for", ipa: "/fɔːr/", meaningCn: "为了", emoji: "🎁" },
      { word: "morning", ipa: "/ˈmɔːrnɪŋ/", meaningCn: "早上", emoji: "🌅" }
    ],
    exampleSentence: "Good morning, horse!",
    exampleSentenceCn: "早上好,马儿!",
  },
  {
    id: "p_ur",
    groupId: "g2_g3",
    letter: "ur",
    sortOrder: 114,
    sound: "/ɜːr/",
    soundDesc: "和 er、ir 同音,只是拼写不同",
    trickHint: "ur / er / ir 三胞胎!读音一样",
    exampleWords: [
      { word: "fur", ipa: "/fɜːr/", meaningCn: "毛皮", emoji: "🐱" },
      { word: "turn", ipa: "/tɜːrn/", meaningCn: "转弯", emoji: "↪️" },
      { word: "purple", ipa: "/ˈpɜːrpl/", meaningCn: "紫色", emoji: "💜" },
      { word: "hurt", ipa: "/hɜːrt/", meaningCn: "受伤", emoji: "🤕" }
    ],
    exampleSentence: "The cat has soft fur.",
    exampleSentenceCn: "猫有柔软的毛。",
  },
  {
    id: "p_aw",
    groupId: "g2_g4",
    letter: "aw",
    sortOrder: 115,
    sound: "/ɔː/",
    soundDesc: "嘴大圆,发 'aw' 的长音(像表达惊叹:Awww!)",
    trickHint: "aw = 看到小猫 Aww 那个音",
    exampleWords: [
      { word: "saw", ipa: "/sɔː/", meaningCn: "看见(过去)", emoji: "👀" },
      { word: "paw", ipa: "/pɔː/", meaningCn: "爪子", emoji: "🐾" },
      { word: "draw", ipa: "/drɔː/", meaningCn: "画", emoji: "🎨" },
      { word: "yawn", ipa: "/jɔːn/", meaningCn: "打哈欠", emoji: "🥱" }
    ],
    exampleSentence: "I saw a cat's paw.",
    exampleSentenceCn: "我看见一只猫的爪子。",
  },
  {
    id: "p_au",
    groupId: "g2_g4",
    letter: "au",
    sortOrder: 116,
    sound: "/ɔː/",
    soundDesc: "和 aw 同音,但拼写用 au(通常在词中间)",
    trickHint: "au / aw 是双胞胎",
    exampleWords: [
      { word: "August", ipa: "/ˈɔːɡəst/", meaningCn: "八月", emoji: "📅" },
      { word: "sauce", ipa: "/sɔːs/", meaningCn: "酱汁", emoji: "🍅" },
      { word: "autumn", ipa: "/ˈɔːtəm/", meaningCn: "秋天", emoji: "🍂" },
      { word: "laugh", ipa: "/læf/", meaningCn: "笑", emoji: "😆" }
    ],
    exampleSentence: "August is hot.",
    exampleSentenceCn: "八月很热。",
  },
  {
    id: "p_ew",
    groupId: "g2_g4",
    letter: "ew",
    sortOrder: 117,
    sound: "/uː/",
    soundDesc: "嘴噘起来,发 'oo' 的长音",
    trickHint: "ew = 听到不好的事情 'Eww!' 噘嘴",
    exampleWords: [
      { word: "new", ipa: "/njuː/", meaningCn: "新的", emoji: "✨" },
      { word: "few", ipa: "/fjuː/", meaningCn: "几个", emoji: "🔢" },
      { word: "blew", ipa: "/bluː/", meaningCn: "吹(过去)", emoji: "💨" },
      { word: "grew", ipa: "/ɡruː/", meaningCn: "长大(过去)", emoji: "🌱" }
    ],
    exampleSentence: "I have a new toy.",
    exampleSentenceCn: "我有一个新玩具。",
  },
  {
    id: "p_oy",
    groupId: "g2_g4",
    letter: "oy",
    sortOrder: 118,
    sound: "/ɔɪ/",
    soundDesc: "嘴从圆到扁,发 'oy' 的双音(像男孩 boy)",
    trickHint: "oy 在词尾;oi 在词中",
    exampleWords: [
      { word: "boy", ipa: "/bɔɪ/", meaningCn: "男孩", emoji: "👦" },
      { word: "toy", ipa: "/tɔɪ/", meaningCn: "玩具", emoji: "🧸" },
      { word: "joy", ipa: "/dʒɔɪ/", meaningCn: "快乐", emoji: "😊" },
      { word: "enjoy", ipa: "/ɪnˈdʒɔɪ/", meaningCn: "享受", emoji: "😄" }
    ],
    exampleSentence: "The boy has a toy.",
    exampleSentenceCn: "男孩有一个玩具。",
  },
  {
    id: "p_oi",
    groupId: "g2_g4",
    letter: "oi",
    sortOrder: 119,
    sound: "/ɔɪ/",
    soundDesc: "和 oy 同音,但拼写在词中间",
    trickHint: "oi 在词中(coin),oy 在词尾(boy)",
    exampleWords: [
      { word: "coin", ipa: "/kɔɪn/", meaningCn: "硬币", emoji: "🪙" },
      { word: "oil", ipa: "/ɔɪl/", meaningCn: "油", emoji: "🛢️" },
      { word: "boil", ipa: "/bɔɪl/", meaningCn: "煮沸", emoji: "💧" },
      { word: "voice", ipa: "/vɔɪs/", meaningCn: "声音", emoji: "🎤" }
    ],
    exampleSentence: "I have one coin.",
    exampleSentenceCn: "我有一个硬币。",
  },
  {
    id: "p_soft_c",
    groupId: "g2_g5",
    letter: "c (soft)",
    sortOrder: 120,
    sound: "/s/",
    soundDesc: "c 在 e / i / y 前面读 's' 的软音",
    trickHint: "c 后跟 e / i / y → 读 s",
    exampleWords: [
      { word: "city", ipa: "/ˈsɪti/", meaningCn: "城市", emoji: "🏙️" },
      { word: "circle", ipa: "/ˈsɜːrkl/", meaningCn: "圆圈", emoji: "⭕" },
      { word: "face", ipa: "/feɪs/", meaningCn: "脸", emoji: "😀" },
      { word: "ice", ipa: "/aɪs/", meaningCn: "冰", emoji: "🧊" }
    ],
    exampleSentence: "I see ice in the city.",
    exampleSentenceCn: "我在城市里看到冰。",
    funFact: "c 后跟 a / o / u → 读 k 的硬音(像 cat / cup)",
  },
  {
    id: "p_soft_g",
    groupId: "g2_g5",
    letter: "g (soft)",
    sortOrder: 121,
    sound: "/dʒ/",
    soundDesc: "g 在 e / i / y 前面读 'j' 的软音",
    trickHint: "g 后跟 e / i / y → 读 j",
    exampleWords: [
      { word: "giant", ipa: "/ˈdʒaɪənt/", meaningCn: "巨人", emoji: "🗿" },
      { word: "gym", ipa: "/dʒɪm/", meaningCn: "健身房", emoji: "🏋️" },
      { word: "page", ipa: "/peɪdʒ/", meaningCn: "页", emoji: "📄" },
      { word: "magic", ipa: "/ˈmædʒɪk/", meaningCn: "魔法", emoji: "✨" }
    ],
    exampleSentence: "Look at the magic page!",
    exampleSentenceCn: "看这页有魔法!",
  },
  {
    id: "p_ph",
    groupId: "g2_g5",
    letter: "ph",
    sortOrder: 122,
    sound: "/f/",
    soundDesc: "ph 两个字母读 'f' 的音",
    trickHint: "ph = f(常见于希腊语词)",
    exampleWords: [
      { word: "phone", ipa: "/foʊn/", meaningCn: "电话", emoji: "📞" },
      { word: "photo", ipa: "/ˈfoʊtoʊ/", meaningCn: "照片", emoji: "📷" },
      { word: "elephant", ipa: "/ˈeləfənt/", meaningCn: "大象", emoji: "🐘" },
      { word: "dolphin", ipa: "/ˈdɒlfɪn/", meaningCn: "海豚", emoji: "🐬" }
    ],
    exampleSentence: "Take a phone photo!",
    exampleSentenceCn: "用电话拍张照!",
    funFact: "ph 是从希腊语来的,英语里很多科学词都用它",
  },
  {
    id: "p_y_long_i",
    groupId: "g2_g5",
    letter: "y (as long i)",
    sortOrder: 123,
    sound: "/aɪ/",
    soundDesc: "y 在单音节词尾读 'I' 的长音",
    trickHint: "短词词尾的 y 像字母 I 的读音",
    exampleWords: [
      { word: "my", ipa: "/maɪ/", meaningCn: "我的", emoji: "👤" },
      { word: "fly", ipa: "/flaɪ/", meaningCn: "飞", emoji: "🛩️" },
      { word: "try", ipa: "/traɪ/", meaningCn: "尝试", emoji: "💪" },
      { word: "sky", ipa: "/skaɪ/", meaningCn: "天空", emoji: "☁️" }
    ],
    exampleSentence: "My kite can fly in the sky.",
    exampleSentenceCn: "我的风筝能在天上飞。",
  },
  {
    id: "p_y_long_e",
    groupId: "g2_g5",
    letter: "y (as long e)",
    sortOrder: 124,
    sound: "/iː/",
    soundDesc: "y 在多音节词词尾读 'ee' 的音",
    trickHint: "长词词尾的 y 读 ee 的音",
    exampleWords: [
      { word: "happy", ipa: "/ˈhæpi/", meaningCn: "开心", emoji: "😊" },
      { word: "baby", ipa: "/ˈbeɪbi/", meaningCn: "宝宝", emoji: "👶" },
      { word: "puppy", ipa: "/ˈpʌpi/", meaningCn: "小狗", emoji: "🐶" },
      { word: "candy", ipa: "/ˈkændi/", meaningCn: "糖", emoji: "🍬" }
    ],
    exampleSentence: "The happy baby has candy.",
    exampleSentenceCn: "开心的宝宝有糖。",
    sparkLine: "Spark 发现:同样的字母 y,在 my 和 happy 里读得不一样!",
  }
];

// ─── 工具函数 ──────────────────────────────────────

/** 按组取所有 G2 Phonics 音 */
export function getPhonicsByGroupG2(groupId: string): PhonicsItem[] {
  return PHONICS_ITEMS_G2.filter(p => p.groupId === groupId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** 按 sortOrder 取所有 G2 音(用于顺序解锁) */
export function getPhonicsSortedG2(): PhonicsItem[] {
  return [...PHONICS_ITEMS_G2].sort((a, b) => a.sortOrder - b.sortOrder);
}

/** 按 id 查找 G2 音 */
export function findPhonicsG2(id: string): PhonicsItem | undefined {
  return PHONICS_ITEMS_G2.find(p => p.id === id);
}

/** 取下一个未学的 G2 音(根据已掌握的 id 列表) */
export function getNextPhonicsG2(masteredIds: string[]): PhonicsItem | null {
  const sorted = getPhonicsSortedG2();
  return sorted.find(p => !masteredIds.includes(p.id)) || null;
}

/** G2 统计 */
export const PHONICS_STATS_G2 = {
  totalGroups: 5,
  totalItems: 25,
  byGroup: {
    g2_g1: 5,  // Silent Letters
    g2_g2: 5,  // Trigraphs
    g2_g3: 5,  // R-Controlled
    g2_g4: 5,  // Advanced Vowels
    g2_g5: 5,  // Soft & Hard
  },
};
