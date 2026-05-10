// 小学一年级 Phonics 完整体系 (v2 - 合并字母库 + Jolly Phonics 路径)
// =============================================================
// 数据来源:
//   • 26 字母详细数据(字母名/口型/笔顺/儿歌/小知识/例词):来自旧 primary_letters 表
//   • Jolly Phonics 7 组教学顺序 + 16 个字母组合 + 59 个拼读词:新设计
// =============================================================
//
// 总规模:
//   • 7 个教学组(Jolly Phonics 顺序)
//   • 42 个 Phonics 音 = 26 单字母 + 16 字母组合
//   • 59 个拼读练习词(CVC / 字母组合 / Magic E)
//
// 设计原则:
//   1. 不按 A-Z 排,按 Jolly Phonics 7 组顺序 - 学完组 1(6 字母)就能拼真词
//   2. 26 字母保留所有旧字段(字母名读音/口型/笔顺/儿歌/小知识/4 个例词带 ipa+emoji)
//   3. 字母组合(ai/oa/ee 等)用简化结构,只有必要字段
//   4. Spark 中密度叙事:每组开头/结尾 + 关键字母点位
//
// UI 使用建议:
//   • A-Z 字母索引视图:用 alphaSortOrder 排序
//   • Jolly Phonics 学习路径:用 groupId + sortOrder 排序
//   • 字母详情:展示 letterNameIpa + sound + soundDesc + chantEn/Cn + 例词 + funFact

// ─── 类型定义 ──────────────────────────────────────

/** Phonics 教学组(Jolly Phonics 7 组) */
export type PhonicsGroup = {
  id: string;
  groupName: string;
  groupNameEn: string;
  sparkIntro: string;
  sparkOutro: string;
  unlockReq: string;
  sortOrder: number;
};

/** 例词(详细版,带 ipa + emoji + 中文释义) */
export type PhonicsExampleWord = {
  word: string;
  ipa?: string;          // 字母组合可能没有
  meaningCn?: string;
  emoji?: string;
};

/** 单个 Phonics 音(字母或字母组合) */
export type PhonicsItem = {
  id: string;                  // "p_a", "p_ai"
  groupId: string;             // Jolly Phonics 组
  letter: string;              // 小写: "a" 或 "ai"
  letterUpper?: string;        // 大写 "A"(单字母才有,字母组合无)
  alphaSortOrder?: number;     // A-Z 字母索引顺序(1-26,字母组合无)
  sortOrder: number;           // Jolly Phonics 教学顺序

  // 音
  sound: string;               // 短音 IPA: "/æ/"
  letterNameIpa?: string;      // 字母名读音: "/eɪ/"(只单字母有)
  longSound?: string | null;   // 长音(只元音有): "/eɪ/"

  // 描述
  soundDesc: string;           // 详细发音口型描述
  trickHint: string;           // 记忆窍门(肢体/联想)
  strokeOrder?: string;        // 书写笔顺(单字母有,字母组合无)

  // 儿歌(Jolly Phonics 经典 chant)
  chantEn?: string;
  chantCn?: string;

  // 例词(单字母有详细版,字母组合用简化版)
  exampleWords: PhonicsExampleWord[];

  // 例句(用于 TTS 朗读)
  exampleSentence?: string;
  exampleSentenceCn?: string;

  // 小知识(单字母有)
  funFact?: string;

  // Spark 叙事(关键音点有)
  sparkLine?: string;
};

/** 拼读练习词 */
export type PhonicsWord = {
  id: string;
  word: string;
  meaningCn: string;
  breakdown: string[];          // ["c", "a", "t"]
  category: "cvc" | "magic_e" | "digraph" | "blend";
  unlockAfterGroup: string;
  exampleSentence: string;
  exampleSentenceCn: string;
  emoji: string;
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
    sparkIntro: "今天 Spark 想再学 6 个音 - d、g、o、u、l、f。学完它们,你就掌握 18 个字母音啦!",
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


// ─── 42 个 Phonics 音(26 字母 + 16 字母组合) ──────────────────────────────────────

export const PHONICS_ITEMS: PhonicsItem[] = [

  // ── 26 个单字母(按 Jolly Phonics 教学顺序排) ──

  {
    id: "p_a", groupId: "g1", letter: "a", letterUpper: "A",
    alphaSortOrder: 1, sortOrder: 102,
    sound: "/æ/",
    letterNameIpa: "/eɪ/",
    longSound: "/eɪ/",
    soundDesc: "嘴巴张大，嘴角向两边咧开，舌尖抵住下齿，就像马上要咬一个大苹果！",
    trickHint: "想一只小蚂蚁爬到你身上,你大喊 'a-a-a!'",
    strokeOrder: "斜线下，斜线下，中间画一杠。",
    chantEn: "Ants, ants, on my arm, /æ/ /æ/ /æ/!",
    chantCn: "蚂蚁蚂蚁爬手臂，/æ/ /æ/ /æ/!",
    funFact: "你知道吗？'alligator' 这个词来自西班牙语'el lagarto'，意思就是‘蜥蜴’！",
    exampleWords: [
      { word: "apple", ipa: "/ˈæpəl/", meaningCn: "苹果", emoji: "🍎" },
      { word: "ant", ipa: "/ænt/", meaningCn: "蚂蚁", emoji: "🐜" },
      { word: "alligator", ipa: "/ˈælɪɡeɪtər/", meaningCn: "鳄鱼", emoji: "🐊" },
      { word: "arrow", ipa: "/ˈæroʊ/", meaningCn: "箭头", emoji: "➡️" }
    ],
    sparkLine: "啊! Spark 想吃苹果!",
  },
  {
    id: "p_b", groupId: "g4", letter: "b", letterUpper: "B",
    alphaSortOrder: 2, sortOrder: 401,
    sound: "/b/",
    letterNameIpa: "/biː/",
    longSound: null,
    soundDesc: "嘴唇闭紧，然后突然张开，把气流送出来，就像在说‘球’(b-b-ball)！",
    trickHint: "想象嘴唇是弹弓 'b! b!'",
    strokeOrder: "一根直线，两个半圆。",
    chantEn: "Bring your bat and bring your ball, /b/ /b/ /b/!",
    chantCn: "把球带来，把棒带来，/b/ /b/ /b/!",
    funFact: "世界上最受欢迎的水果之一就是香蕉(banana)哦！",
    exampleWords: [
      { word: "ball", ipa: "/bɔːl/", meaningCn: "球", emoji: "⚽" },
      { word: "boy", ipa: "/bɔɪ/", meaningCn: "男孩", emoji: "👦" },
      { word: "bed", ipa: "/bed/", meaningCn: "床", emoji: "🛏️" },
      { word: "banana", ipa: "/bəˈnænə/", meaningCn: "香蕉", emoji: "🍌" }
    ],
    sparkLine: "Bounce! Spark 想和你一起蹦~",
  },
  {
    id: "p_c", groupId: "g2", letter: "c", letterUpper: "C",
    alphaSortOrder: 3, sortOrder: 201,
    sound: "/k/",
    letterNameIpa: "/siː/",
    longSound: null,
    soundDesc: "嘴巴微微张开，舌根抬起抵住软腭，然后快速送气，发出清脆的/k/音，像敲响板的声音。",
    trickHint: "想象自己被呛到了,轻轻 'c! c!'",
    strokeOrder: "画一个大大的半圆。",
    chantEn: "We are clicking castanets, /k/ /k/ /k/!",
    chantCn: "我们在敲响板，/k/ /k/ /k/!",
    funFact: "字母C的发音有时是/k/，有时是/s/（比如在'city'里）。是不是很有趣？",
    exampleWords: [
      { word: "cat", ipa: "/kæt/", meaningCn: "猫", emoji: "🐱" },
      { word: "car", ipa: "/kɑːr/", meaningCn: "汽车", emoji: "🚗" },
      { word: "cake", ipa: "/keɪk/", meaningCn: "蛋糕", emoji: "🎂" },
      { word: "cup", ipa: "/kʌp/", meaningCn: "杯子", emoji: "☕" }
    ],
    sparkLine: "Cat! Spark 最喜欢的动物之一就是猫!",
  },
  {
    id: "p_d", groupId: "g3", letter: "d", letterUpper: "D",
    alphaSortOrder: 4, sortOrder: 301,
    sound: "/d/",
    letterNameIpa: "/diː/",
    longSound: null,
    soundDesc: "舌尖抵住上牙齿后面，然后用力弹开，声带振动，发出‘嘚嘚嘚’的声音，像在打鼓。",
    trickHint: "想象敲小鼓 'd! d! d!'",
    strokeOrder: "一根直线，一个大半圆。",
    chantEn: "See me play on my drum, /d/ /d/ /d/!",
    chantCn: "看我打鼓，/d/ /d/ /d/!",
    funFact: "狗狗的鼻子是独一无二的，就像人类的指纹一样！",
    exampleWords: [
      { word: "dog", ipa: "/dɒɡ/", meaningCn: "狗", emoji: "🐶" },
      { word: "duck", ipa: "/dʌk/", meaningCn: "鸭子", emoji: "🦆" },
      { word: "door", ipa: "/dɔːr/", meaningCn: "门", emoji: "🚪" },
      { word: "dolphin", ipa: "/ˈdɒlfɪn/", meaningCn: "海豚", emoji: "🐬" }
    ],
  },
  {
    id: "p_e", groupId: "g2", letter: "e", letterUpper: "E",
    alphaSortOrder: 5, sortOrder: 203,
    sound: "/e/",
    letterNameIpa: "/iː/",
    longSound: "/iː/",
    soundDesc: "嘴巴微微张开，舌尖轻轻抵住下牙，就像要把鸡蛋敲开一样，发出/e/ /e/ /e/的声音。",
    trickHint: "假装没听清楚,问 'eh?'",
    strokeOrder: "一根直线，上面一横，中间一横，下面一横。",
    chantEn: "Eggs in the pan, /e/ /e/ /e/. Crack the egg like this /e/!",
    chantCn: "敲开鸡蛋，/e/ /e/ /e/!",
    funFact: "大象(elephant)是陆地上最大的动物，它们的耳朵很大，可以用来散热！",
    exampleWords: [
      { word: "egg", ipa: "/eɡ/", meaningCn: "鸡蛋", emoji: "🥚" },
      { word: "elephant", ipa: "/ˈelɪfənt/", meaningCn: "大象", emoji: "🐘" },
      { word: "elf", ipa: "/elf/", meaningCn: "精灵", emoji: "🧝" },
      { word: "envelope", ipa: "/ˈenvələʊp/", meaningCn: "信封", emoji: "✉️" }
    ],
  },
  {
    id: "p_f", groupId: "g3", letter: "f", letterUpper: "F",
    alphaSortOrder: 6, sortOrder: 306,
    sound: "/f/",
    letterNameIpa: "/ef/",
    longSound: null,
    soundDesc: "上牙轻轻咬住下嘴唇，然后吹气，就像给充气鱼放气一样。",
    trickHint: "学生气的小猫 'ffff!'",
    strokeOrder: "一根直线，上面一横，中间一横。",
    chantEn: "My friends and I went to the beach with my floating fish. It got a hole, the air came out. /f/ /f/ /f/ /f/ /f/.",
    chantCn: "我的充气鱼漏气了，/f/ /f/ /f/!",
    funFact: "你知道吗？数字五(five)的英文单词里也有字母F哦！",
    exampleWords: [
      { word: "fish", ipa: "/fɪʃ/", meaningCn: "鱼", emoji: "🐟" },
      { word: "fan", ipa: "/fæn/", meaningCn: "风扇", emoji: "🌬️" },
      { word: "frog", ipa: "/frɒɡ/", meaningCn: "青蛙", emoji: "🐸" },
      { word: "five", ipa: "/faɪv/", meaningCn: "五", emoji: "5️⃣" }
    ],
    sparkLine: "Fox! Spark 就是一只小狐狸哦~",
  },
  {
    id: "p_g", groupId: "g3", letter: "g", letterUpper: "G",
    alphaSortOrder: 7, sortOrder: 302,
    sound: "/ɡ/",
    letterNameIpa: "/dʒiː/",
    longSound: null,
    soundDesc: "舌根抬起，堵住喉咙，然后让气流冲出来，声带振动，就像水被冲下水道的声音。",
    trickHint: "想象在咕噜咕噜喝水 'g-g-g'",
    strokeOrder: "先画一个C，然后加一横，再加一竖。",
    chantEn: "The water gurgles down the drain, /g/ /g/ /g/!",
    chantCn: "水在往下流，/g/ /g/ /g/!",
    funFact: "字母G也有两种发音，一种是/g/ (gate)，一种是/dʒ/ (giraffe)！",
    exampleWords: [
      { word: "girl", ipa: "/ɡɜːrl/", meaningCn: "女孩", emoji: "👧" },
      { word: "gate", ipa: "/ɡeɪt/", meaningCn: "大门", emoji: "🚪" },
      { word: "goose", ipa: "/ɡuːs/", meaningCn: "鹅", emoji: "🦢" },
      { word: "gift", ipa: "/ɡɪft/", meaningCn: "礼物", emoji: "🎁" }
    ],
  },
  {
    id: "p_h", groupId: "g2", letter: "h", letterUpper: "H",
    alphaSortOrder: 8, sortOrder: 204,
    sound: "/h/",
    letterNameIpa: "/eɪtʃ/",
    longSound: null,
    soundDesc: "嘴巴张开，向外哈气，就像跑累了在喘气一样。",
    trickHint: "对着手掌哈气,感觉热热的就是 'h' 音",
    strokeOrder: "一竖一竖，中间一横。",
    chantEn: "I like to hop, hop, hop, all around. I like to hop, hop, hop, up and down.",
    chantCn: "我喜欢跳房子，/h/ /h/ /h/!",
    funFact: "你的手(hand)上有5个手指，但马(horse)的脚只有一个趾头哦！",
    exampleWords: [
      { word: "hat", ipa: "/hæt/", meaningCn: "帽子", emoji: "👒" },
      { word: "hand", ipa: "/hænd/", meaningCn: "手", emoji: "✋" },
      { word: "horse", ipa: "/hɔːrs/", meaningCn: "马", emoji: "🐴" },
      { word: "house", ipa: "/haʊs/", meaningCn: "房子", emoji: "🏠" }
    ],
  },
  {
    id: "p_i", groupId: "g1", letter: "i", letterUpper: "I",
    alphaSortOrder: 9, sortOrder: 104,
    sound: "/ɪ/",
    letterNameIpa: "/aɪ/",
    longSound: "/aɪ/",
    soundDesc: "嘴巴放松，微微张开，舌头向前，发出/ɪ/ /ɪ/ /ɪ/的声音，就像小老鼠在叫。",
    trickHint: "做一个小老鼠的表情,鼻子皱起来念 'i-i-i'",
    strokeOrder: "一根直线，上面一横，下面一横。",
    chantEn: "Inky the mouse is my pet. She spilled the ink and got wet. The ink it spread all over the desk. /ɪ/ /ɪ/ /ɪ/ /ɪ/ - Inky's wet!",
    chantCn: "小老鼠身上有墨水，/ɪ/ /ɪ/ /ɪ/!",
    funFact: "冰屋(igloo)是用雪砖盖的，但是里面却很暖和！",
    exampleWords: [
      { word: "ink", ipa: "/ɪŋk/", meaningCn: "墨水", emoji: "✒️" },
      { word: "igloo", ipa: "/ˈɪɡluː/", meaningCn: "冰屋", emoji: "🧊" },
      { word: "iguana", ipa: "/ɪˈɡwɑːnə/", meaningCn: "鬣蜥", emoji: "🦎" },
      { word: "insect", ipa: "/ˈɪnsekt/", meaningCn: "昆虫", emoji: "🐞" }
    ],
  },
  {
    id: "p_j", groupId: "g4", letter: "j", letterUpper: "J",
    alphaSortOrder: 10, sortOrder: 402,
    sound: "/dʒ/",
    letterNameIpa: "/dʒeɪ/",
    longSound: null,
    soundDesc: "舌尖顶住上颚，嘴唇向前突出，然后气流冲出，声带振动，就像果冻在晃动。",
    trickHint: "想象在吃 jelly 果冻 'j! j!'",
    strokeOrder: "向下的钩子，上面加一横。",
    chantEn: "Jelly and jam, jiggling on a plate, oh what will I eat with it? /dʒ/ /dʒ/ /dʒ/ /dʒ/ /dʒ/!",
    chantCn: "果冻和果酱，/dʒ/ /dʒ/ /dʒ/!",
    funFact: "水母(jellyfish)没有大脑，也没有心脏哦，但它们在地球上已经生活了数亿年！",
    exampleWords: [
      { word: "jam", ipa: "/dʒæm/", meaningCn: "果酱", emoji: "🍓" },
      { word: "jet", ipa: "/dʒet/", meaningCn: "喷气式飞机", emoji: "✈️" },
      { word: "jellyfish", ipa: "/ˈdʒelifɪʃ/", meaningCn: "水母", emoji: "🪼" },
      { word: "juice", ipa: "/dʒuːs/", meaningCn: "果汁", emoji: "🧃" }
    ],
  },
  {
    id: "p_k", groupId: "g2", letter: "k", letterUpper: "K",
    alphaSortOrder: 11, sortOrder: 202,
    sound: "/k/",
    letterNameIpa: "/keɪ/",
    longSound: null,
    soundDesc: "和字母C的发音一样！嘴巴微微张开，舌根抬起，快速送气，发出清脆的/k/音，像放风筝时线被拉紧的声音。",
    trickHint: "c 和 k 是好朋友,发同一个音",
    strokeOrder: "一根直线，然后一个小于号。",
    chantEn: "Kites are flying in the sky, /k/ /k/ /k/!",
    chantCn: "风筝飞呀飞，/k/ /k/ /k/!",
    funFact: "袋鼠(kangaroo)宝宝出生时非常小，只有一颗果冻豆那么大，然后会爬到妈妈的育儿袋里长大。",
    exampleWords: [
      { word: "kite", ipa: "/kaɪt/", meaningCn: "风筝", emoji: "🪁" },
      { word: "king", ipa: "/kɪŋ/", meaningCn: "国王", emoji: "👑" },
      { word: "key", ipa: "/kiː/", meaningCn: "钥匙", emoji: "🔑" },
      { word: "kangaroo", ipa: "/ˌkæŋɡəˈruː/", meaningCn: "袋鼠", emoji: "🦘" }
    ],
  },
  {
    id: "p_l", groupId: "g3", letter: "l", letterUpper: "L",
    alphaSortOrder: 12, sortOrder: 305,
    sound: "/l/",
    letterNameIpa: "/el/",
    longSound: null,
    soundDesc: "舌尖顶住上牙齿后面，声带振动，就像在舔一个美味的棒棒糖。",
    trickHint: "舌头不动,只发声 'l-l-l',像唱歌",
    strokeOrder: "一竖，一横。",
    chantEn: "We lick our lollipops, /l/ /l/ /l/!",
    chantCn: "我们舔着棒棒糖，/l/ /l/ /l/!",
    funFact: "狮子(lion)的吼声非常响亮，在8公里外都能听到！",
    exampleWords: [
      { word: "lion", ipa: "/ˈlaɪən/", meaningCn: "狮子", emoji: "🦁" },
      { word: "leg", ipa: "/leɡ/", meaningCn: "腿", emoji: "🦵" },
      { word: "leaf", ipa: "/liːf/", meaningCn: "叶子", emoji: "🍁" },
      { word: "lemon", ipa: "/ˈlemən/", meaningCn: "柠檬", emoji: "🍋" }
    ],
  },
  {
    id: "p_m", groupId: "g2", letter: "m", letterUpper: "M",
    alphaSortOrder: 13, sortOrder: 206,
    sound: "/m/",
    letterNameIpa: "/em/",
    longSound: null,
    soundDesc: "嘴唇闭紧，气流从鼻子里出来，发出‘嗯’的声音，就像看到美味的食物时一样。",
    trickHint: "吃到好吃的就 'mmm~ 好吃'",
    strokeOrder: "一竖，斜线，斜线，再一竖。",
    chantEn: "The mum and the dad make many meals for their hungry children. /m/ /m/ /m/ /m/ /m/.",
    chantCn: "妈妈做了美味大餐，/m/ /m/ /m/!",
    funFact: "月亮(moon)上没有风，所以宇航员在上面留下的脚印会一直都在！",
    exampleWords: [
      { word: "monkey", ipa: "/ˈmʌŋki/", meaningCn: "猴子", emoji: "🐒" },
      { word: "milk", ipa: "/mɪlk/", meaningCn: "牛奶", emoji: "🥛" },
      { word: "moon", ipa: "/muːn/", meaningCn: "月亮", emoji: "🌙" },
      { word: "mouse", ipa: "/maʊs/", meaningCn: "老鼠", emoji: "🐭" }
    ],
    sparkLine: "Mmm~ Spark 也想吃妈妈做的饭!",
  },
  {
    id: "p_n", groupId: "g1", letter: "n", letterUpper: "N",
    alphaSortOrder: 14, sortOrder: 106,
    sound: "/n/",
    letterNameIpa: "/en/",
    longSound: null,
    soundDesc: "舌尖顶住上颚，鼻子出气，发出嗯嗯嗯的声音，感觉鼻子在振动。",
    trickHint: "捏住鼻子念 'n',会感觉鼻子在震动",
    strokeOrder: "大写N，一笔写下，二笔斜下，三笔再写下。小写n，一笔写下，然后向上弯曲成拱形。",
    chantEn: "Hear the aeroplane, n-n-n! Hear the aeroplane, n-n-n! ...making lots of noise!",
    chantCn: "飞机噪音嗯嗯嗯, n, n, n。",
    funFact: "字母'N'在英语单词中出现的频率很高，很多常见的词都有它！",
    exampleWords: [
      { word: "nose", ipa: "/nəʊz/", meaningCn: "鼻子", emoji: "👃" },
      { word: "nine", ipa: "/naɪn/", meaningCn: "九", emoji: "9️⃣" },
      { word: "net", ipa: "/net/", meaningCn: "网", emoji: "🥅" },
      { word: "noodle", ipa: "/ˈnuːdl/", meaningCn: "面条", emoji: "🍜" }
    ],
  },
  {
    id: "p_o", groupId: "g3", letter: "o", letterUpper: "O",
    alphaSortOrder: 15, sortOrder: 303,
    sound: "/ɒ/",
    letterNameIpa: "/əʊ/",
    longSound: "/əʊ/",
    soundDesc: "短音/ɒ/：嘴巴张成圆形，舌头放低，快速发音“哦”。长音/əʊ/：嘴巴从圆形慢慢合拢，听起来像字母O的名字。",
    trickHint: "看到惊喜时大喊 'oh!'",
    strokeOrder: "大写O和小写o都是一个圈圈，一笔完成！",
    chantEn: "Now it’s dark, o-o-o, the lights go on! Time for bed, o-o-o, the lights go off!",
    chantCn: "电灯开关哦哦哦, o, o, o。",
    funFact: "字母'O'是第三个最常见的元音字母哦！",
    exampleWords: [
      { word: "orange", ipa: "/ˈɒrɪndʒ/", meaningCn: "橙子", emoji: "🍊" },
      { word: "octopus", ipa: "/ˈɒktəpəs/", meaningCn: "章鱼", emoji: "🐙" },
      { word: "on", ipa: "/ɒn/", meaningCn: "在...上面", emoji: "🔛" },
      { word: "open", ipa: "/ˈəʊpən/", meaningCn: "打开", emoji: "👐" }
    ],
  },
  {
    id: "p_p", groupId: "g1", letter: "p", letterUpper: "P",
    alphaSortOrder: 16, sortOrder: 105,
    sound: "/p/",
    letterNameIpa: "/piː/",
    longSound: null,
    soundDesc: "双唇紧闭，然后突然张开，把气流喷出去，发出“噗”的声音，非常短促。",
    trickHint: "把手放在嘴前,感受 'p' 时的气流,像吹蜡烛",
    strokeOrder: "大写P，先写一竖，再在上面画个半圆。小写p，先写一竖，位置低一点，再在上面画个半圆。",
    chantEn: "Puff out the candles on the pink pig cake. p-p-p! p-p-p!",
    chantCn: "吹灭蜡烛ppp, p, p, p。",
    funFact: "字母'P'和'B'发音很像，但是发'P'的时候，声带不振动，你可以把手放在喉咙上感觉一下！",
    exampleWords: [
      { word: "pig", ipa: "/pɪɡ/", meaningCn: "猪", emoji: "🐷" },
      { word: "pen", ipa: "/pen/", meaningCn: "钢笔", emoji: "🖊️" },
      { word: "panda", ipa: "/ˈpændə/", meaningCn: "熊猫", emoji: "🐼" },
      { word: "park", ipa: "/pɑːk/", meaningCn: "公园", emoji: "🏞️" }
    ],
    sparkLine: "Pop! Spark 喜欢这个音,像在弹泡泡~",
  },
  {
    id: "p_q", groupId: "g5", letter: "q", letterUpper: "Q",
    alphaSortOrder: 17, sortOrder: 502,
    sound: "/kw/",
    letterNameIpa: "/kjuː/",
    longSound: null,
    soundDesc: "嘴巴先做发/k/的准备，然后快速滑向/w/的音，听起来像“夸”。",
    trickHint: "学小鸭子 'quack quack'",
    strokeOrder: "大写Q，先画一个大圈圈，再在右下角画一小撇。小写q，先画一个半圆，再写一竖，最后带个小钩。",
    chantEn: "The duck in the pond says quack, quack, quack! qu-qu-qu!",
    chantCn: "鸭子嘎嘎kw kw kw, q, q, q。",
    funFact: "在英语中，字母'Q'后面几乎总是跟着字母'U'，它们是形影不离的好朋友！",
    exampleWords: [
      { word: "queen", ipa: "/kwiːn/", meaningCn: "女王", emoji: "👑" },
      { word: "quilt", ipa: "/kwɪlt/", meaningCn: "被子", emoji: "🛌" },
      { word: "quiet", ipa: "/ˈkwaɪət/", meaningCn: "安静的", emoji: "🤫" },
      { word: "quick", ipa: "/kwɪk/", meaningCn: "快速的", emoji: "⚡" }
    ],
  },
  {
    id: "p_r", groupId: "g2", letter: "r", letterUpper: "R",
    alphaSortOrder: 18, sortOrder: 205,
    sound: "/r/",
    letterNameIpa: "/ɑː/",
    longSound: null,
    soundDesc: "嘴唇微微撅起，舌尖向后卷，但不要碰到任何地方，发出“rrrrr”的声音，像小狗在咆哮。",
    trickHint: "学小老虎吼 'rrrr'",
    strokeOrder: "大写R，先写一竖，再画个半圆，最后画一撇。小写r，先写一竖，再向上弯曲一点点。",
    chantEn: "See my puppy rip the rag. r-r-r! r-r-r! When he pulls so hard.",
    chantCn: "小狗咆哮rrr, r, r, r。",
    funFact: "你知道吗？在某些英语口音里，单词末尾的'r'是不发音的！",
    exampleWords: [
      { word: "rabbit", ipa: "/ˈræbɪt/", meaningCn: "兔子", emoji: "🐰" },
      { word: "red", ipa: "/red/", meaningCn: "红色的", emoji: "🔴" },
      { word: "run", ipa: "/rʌn/", meaningCn: "跑", emoji: "🏃" },
      { word: "robot", ipa: "/ˈrəʊbɒt/", meaningCn: "机器人", emoji: "🤖" }
    ],
  },
  {
    id: "p_s", groupId: "g1", letter: "s", letterUpper: "S",
    alphaSortOrder: 19, sortOrder: 101,
    sound: "/s/",
    letterNameIpa: "/es/",
    longSound: null,
    soundDesc: "牙齿微微合拢，舌尖靠近上牙龈，气流从牙缝中挤出，发出“嘶嘶”的声音，像小蛇一样。",
    trickHint: "学小蛇 'sssss',手做出弯弯的动作",
    strokeOrder: "大写S和小写s都像一条弯弯曲曲的小蛇，一笔画成！",
    chantEn: "The snake is in the grass. s-s-s! s-s-s! The snake is in the grass.",
    chantCn: "小蛇嘶嘶sss, s, s, s。",
    funFact: "字母'S'可以发出/s/的音，也可以发出/z/的音，比如在单词'is'里面！",
    exampleWords: [
      { word: "sun", ipa: "/sʌn/", meaningCn: "太阳", emoji: "☀️" },
      { word: "six", ipa: "/sɪks/", meaningCn: "六", emoji: "6️⃣" },
      { word: "see", ipa: "/siː/", meaningCn: "看见", emoji: "👀" },
      { word: "snake", ipa: "/sneɪk/", meaningCn: "蛇", emoji: "🐍" }
    ],
    sparkLine: "嘶~ Spark 也会发这个音!你和我一起念好不好?",
  },
  {
    id: "p_t", groupId: "g1", letter: "t", letterUpper: "T",
    alphaSortOrder: 20, sortOrder: 103,
    sound: "/t/",
    letterNameIpa: "/tiː/",
    longSound: null,
    soundDesc: "舌尖顶住上牙龈，然后突然放开，气流冲出，发出短促的“特”的声音。",
    trickHint: "想象自己在打字,手指按键盘 't-t-t'",
    strokeOrder: "大写T，先写一横，再在中间写一竖。小写t，先写一竖，再在中间画一小横。",
    chantEn: "When I watch the tennis game, t-t-t, t-t-t, ...my head goes back and forth.",
    chantCn: "观看网球t t t, t, t, t。",
    funFact: "字母'T'发音时，如果把手放在嘴前，能感觉到很强的气流！",
    exampleWords: [
      { word: "tiger", ipa: "/ˈtaɪɡə(r)/", meaningCn: "老虎", emoji: "🐯" },
      { word: "ten", ipa: "/ten/", meaningCn: "十", emoji: "🔟" },
      { word: "teacher", ipa: "/ˈtiːtʃə(r)/", meaningCn: "老师", emoji: "👩‍🏫" },
      { word: "toy", ipa: "/tɔɪ/", meaningCn: "玩具", emoji: "🧸" }
    ],
  },
  {
    id: "p_u", groupId: "g3", letter: "u", letterUpper: "U",
    alphaSortOrder: 21, sortOrder: 304,
    sound: "/ʌ/",
    letterNameIpa: "/juː/",
    longSound: "/juː/",
    soundDesc: "短音/ʌ/：嘴巴微微张开，舌头放松，发出短促的“啊”音，像肚子被轻轻打了一下。长音/juː/：听起来像字母U的名字 'you'。",
    trickHint: "想象被人推了一下 'uh!'",
    strokeOrder: "大写U，从上往下画一个弧线再上来。小写u，先画一个向下的弧线，再加一小竖。",
    chantEn: "Up go umbrellas, u-u-u! Up go umbrellas, u-u-u! ...when it starts to rain.",
    chantCn: "撑开雨伞a a a, u, u, u。",
    funFact: "字母'U'和'V'在古代拉丁语里是同一个字母，后来才慢慢分开的！",
    exampleWords: [
      { word: "umbrella", ipa: "/ʌmˈbrelə/", meaningCn: "雨伞", emoji: "☂️" },
      { word: "up", ipa: "/ʌp/", meaningCn: "向上", emoji: "⬆️" },
      { word: "under", ipa: "/ˈʌndə(r)/", meaningCn: "在...下面", emoji: "👇" },
      { word: "uncle", ipa: "/ˈʌŋkl/", meaningCn: "叔叔；舅舅", emoji: "👨" }
    ],
  },
  {
    id: "p_v", groupId: "g4", letter: "v", letterUpper: "V",
    alphaSortOrder: 22, sortOrder: 405,
    sound: "/v/",
    letterNameIpa: "/viː/",
    longSound: null,
    soundDesc: "上牙齿轻轻咬住下嘴唇，然后发出声音，感觉嘴唇在振动，像开着小汽车“呜呜呜”。",
    trickHint: "上牙咬下嘴唇 + 声带震动 'vvvv'",
    strokeOrder: "大写V和小写v都像一个胜利的手势，从上往下写一个斜线，再往上写一个斜线。",
    chantEn: "Drive the van around the village. v-v-v! v-v-v! Drive the van around the village.",
    chantCn: "开着货车vvv, v, v, v。",
    funFact: "'V'是字母表里唯一一个发音时需要牙齿和嘴唇配合的辅音哦！",
    exampleWords: [
      { word: "van", ipa: "/væn/", meaningCn: "货车", emoji: "🚐" },
      { word: "vest", ipa: "/vest/", meaningCn: "背心", emoji: "🎽" },
      { word: "violin", ipa: "/ˌvaɪəˈlɪn/", meaningCn: "小提琴", emoji: "🎻" },
      { word: "vet", ipa: "/vet/", meaningCn: "兽医", emoji: "👨‍⚕️" }
    ],
  },
  {
    id: "p_w", groupId: "g4", letter: "w", letterUpper: "W",
    alphaSortOrder: 23, sortOrder: 404,
    sound: "/w/",
    letterNameIpa: "/ˈdʌbljuː/",
    longSound: null,
    soundDesc: "嘴巴撅成圆形，然后快速滑向后面的元音，发出“我”的声音。",
    trickHint: "想象在吹口哨 'wwww'",
    strokeOrder: "大写W，写两个V连在一起。小写w，也是写两个u或v连在一起，但是小一点。",
    chantEn: "I see the wind, w-w-w, blowing the leaves around.",
    chantCn: "风儿呼呼www, w, w, w。",
    funFact: "字母'W'的名字是'double-u'（双U），因为它看起来就像两个U连在一起！",
    exampleWords: [
      { word: "wind", ipa: "/wɪnd/", meaningCn: "风", emoji: "💨" },
      { word: "water", ipa: "/ˈwɔːtə(r)/", meaningCn: "水", emoji: "💧" },
      { word: "window", ipa: "/ˈwɪndəʊ/", meaningCn: "窗户", emoji: "🖼️" },
      { word: "watch", ipa: "/wɒtʃ/", meaningCn: "手表", emoji: "⌚" }
    ],
  },
  {
    id: "p_x", groupId: "g5", letter: "x", letterUpper: "X",
    alphaSortOrder: 24, sortOrder: 503,
    sound: "/ks/",
    letterNameIpa: "/eks/",
    longSound: null,
    soundDesc: "这个音由/k/和/s/两个音组成，发音时要快，听起来像“科斯”。",
    trickHint: "由 k 和 s 两个音组合 'ks'",
    strokeOrder: "大写X和小写x都像一个叉叉，先写一撇，再写一捺。",
    chantEn: "Take an X-ray, ks-ks-ks. Take an X-ray, ks-ks-ks. ... of my hand.",
    chantCn: "X光照片ks ks ks, x, x, x。",
    funFact: "以'X'开头的单词非常少，所以我们通常用包含'x'的单词来学习它的发音，比如 box 和 fox！",
    exampleWords: [
      { word: "box", ipa: "/bɒks/", meaningCn: "盒子", emoji: "📦" },
      { word: "fox", ipa: "/fɒks/", meaningCn: "狐狸", emoji: "🦊" },
      { word: "six", ipa: "/sɪks/", meaningCn: "六", emoji: "6️⃣" },
      { word: "fix", ipa: "/fɪks/", meaningCn: "修理", emoji: "🔧" }
    ],
  },
  {
    id: "p_y", groupId: "g4", letter: "y", letterUpper: "Y",
    alphaSortOrder: 25, sortOrder: 403,
    sound: "/j/",
    letterNameIpa: "/waɪ/",
    longSound: null,
    soundDesc: "嘴巴做发“一”的口型，舌头抬高，然后快速滑向后面的元音，声音很短，像‘呀’。",
    trickHint: "说 'yes!' 时第一个音就是 y",
    strokeOrder: "大写Y，先写一个小v，再在下面加一竖。小写y，像一个带尾巴的u。",
    chantEn: "I like to eat, eat, eat, yogurt and bananas. y-y-y!",
    chantCn: "吃着酸奶y y y, y, y, y。",
    funFact: "字母'Y'很特别，有时它当辅音（比如在'yes'里），有时它又当元音（比如在'fly'里）！",
    exampleWords: [
      { word: "yo-yo", ipa: "/ˈjəʊ jəʊ/", meaningCn: "悠悠球", emoji: "🪀" },
      { word: "yellow", ipa: "/ˈjeləʊ/", meaningCn: "黄色的", emoji: "🟡" },
      { word: "yes", ipa: "/jes/", meaningCn: "是的", emoji: "👍" },
      { word: "yogurt", ipa: "/ˈjɒɡət/", meaningCn: "酸奶", emoji: "🍦" }
    ],
  },
  {
    id: "p_z", groupId: "g5", letter: "z", letterUpper: "Z",
    alphaSortOrder: 26, sortOrder: 501,
    sound: "/z/",
    letterNameIpa: "/zed/",
    longSound: null,
    soundDesc: "和发/s/音的口型一样，但是要发出声音，感觉声带在振动，像小蜜蜂“嗡嗡嗡”。",
    trickHint: "学蜜蜂飞过 'zzzz'",
    strokeOrder: "大写Z和小写z都是一笔写成，先写一横，再写一斜，最后再写一横。",
    chantEn: "Did you ever hear a bee buzz, a bee buzz, a bee buzz? Did you ever hear a bee buzz, z-z-z, like this?",
    chantCn: "蜜蜂嗡嗡zzz, z, z, z。",
    funFact: "字母'Z'是英语字母表里的最后一个字母，它在单词里出现得最少哦！",
    exampleWords: [
      { word: "zoo", ipa: "/zuː/", meaningCn: "动物园", emoji: "🦁" },
      { word: "zebra", ipa: "/ˈzebrə/", meaningCn: "斑马", emoji: "🦓" },
      { word: "zero", ipa: "/ˈzɪərəʊ/", meaningCn: "零", emoji: "0️⃣" },
      { word: "zip", ipa: "/zɪp/", meaningCn: "拉链", emoji: "🤐" }
    ],
    sparkLine: "Buzz~ Spark 听到蜜蜂飞过来啦!",
  },

  // ── 字母组合 (字母组合无 letterNameIpa / strokeOrder / 详细 example_words ipa / funFact) ──

  // Group 4 字母组合
  {
    id: "p_ai", groupId: "g4", letter: "ai",
    sortOrder: 406,
    sound: "/eɪ/",
    soundDesc: "两个字母在一起,发长长的 — ay!",
    trickHint: "下雨啦~ 'rain' 里就有 'ai'",
    chantEn: "Rain, rain, on the train, /eɪ/ /eɪ/ /eɪ/!",
    chantCn: "下雨下雨在火车上,/eɪ/ /eɪ/ /eɪ/!",
    exampleWords: [
      { word: "rain", meaningCn: "雨", emoji: "🌧️" },
      { word: "pain", meaningCn: "疼", emoji: "🤕" },
      { word: "wait", meaningCn: "等", emoji: "⏳" },
      { word: "train", meaningCn: "火车", emoji: "🚂" },
    ],
    exampleSentence: "Wait for the rain.",
    exampleSentenceCn: "等雨停。",
    sparkLine: "字母组合好神奇!a 和 i 在一起就变成 'ay' 了~",
  },
  {
    id: "p_oa", groupId: "g4", letter: "oa",
    sortOrder: 407,
    sound: "/oʊ/",
    soundDesc: "嘴巴圆起来,长长的 — oh!",
    trickHint: "像看到漂亮东西 'oh~'",
    chantEn: "Goats in coats, /oʊ/ /oʊ/ /oʊ/!",
    chantCn: "山羊穿大衣,/oʊ/ /oʊ/ /oʊ/!",
    exampleWords: [
      { word: "boat", meaningCn: "船", emoji: "⛵" },
      { word: "coat", meaningCn: "外套", emoji: "🧥" },
      { word: "goat", meaningCn: "山羊", emoji: "🐐" },
      { word: "soap", meaningCn: "肥皂", emoji: "🧼" },
    ],
    exampleSentence: "A goat in a coat.",
    exampleSentenceCn: "一只穿外套的山羊。",
  },
  {
    id: "p_ee", groupId: "g4", letter: "ee",
    sortOrder: 408,
    sound: "/iː/",
    soundDesc: "嘴角咧到两边,长长的 — eeee!",
    trickHint: "像在笑 'eeee'",
    chantEn: "I see a bee in the tree, /iː/ /iː/ /iː/!",
    chantCn: "我看到树上有只蜜蜂,/iː/ /iː/ /iː/!",
    exampleWords: [
      { word: "tree", meaningCn: "树", emoji: "🌳" },
      { word: "see", meaningCn: "看见", emoji: "👀" },
      { word: "bee", meaningCn: "蜜蜂", emoji: "🐝" },
      { word: "feet", meaningCn: "脚", emoji: "👣" },
    ],
    exampleSentence: "I see a bee in the tree.",
    exampleSentenceCn: "我看到树上有蜜蜂。",
  },
  {
    id: "p_or", groupId: "g4", letter: "or",
    sortOrder: 409,
    sound: "/ɔːr/",
    soundDesc: "嘴巴张圆,加一点 r 的味道 — or!",
    trickHint: "像在叫 'fork',舌头微微卷起",
    chantEn: "A fork for me, /ɔːr/ /ɔːr/ /ɔːr/!",
    chantCn: "一个叉子给我,/ɔːr/ /ɔːr/ /ɔːr/!",
    exampleWords: [
      { word: "fork", meaningCn: "叉子", emoji: "🍴" },
      { word: "horn", meaningCn: "号角", emoji: "📯" },
      { word: "corn", meaningCn: "玉米", emoji: "🌽" },
      { word: "for", meaningCn: "为了", emoji: "🎁" },
    ],
    exampleSentence: "A fork for me.",
    exampleSentenceCn: "给我一个叉子。",
  },

  // Group 5 字母组合
  {
    id: "p_ch", groupId: "g5", letter: "ch",
    sortOrder: 504,
    sound: "/tʃ/",
    soundDesc: "像小火车 — ch! ch! ch!",
    trickHint: "学小火车开起来 'ch ch ch'",
    chantEn: "The choo-choo train, /tʃ/ /tʃ/ /tʃ/!",
    chantCn: "嘟嘟小火车,/tʃ/ /tʃ/ /tʃ/!",
    exampleWords: [
      { word: "chick", meaningCn: "小鸡", emoji: "🐣" },
      { word: "chin", meaningCn: "下巴", emoji: "😀" },
      { word: "chip", meaningCn: "薯条", emoji: "🍟" },
      { word: "cheese", meaningCn: "奶酪", emoji: "🧀" },
    ],
    exampleSentence: "A chick on my chin.",
    exampleSentenceCn: "一只小鸡在我下巴上。",
    sparkLine: "Choo choo! Spark 想坐 ch-ch-ch 小火车!",
  },
  {
    id: "p_sh", groupId: "g5", letter: "sh",
    sortOrder: 505,
    sound: "/ʃ/",
    soundDesc: "像让小宝宝安静 — shhh!",
    trickHint: "手指放嘴唇 'shhh'",
    chantEn: "Shh! The baby sleeps, /ʃ/ /ʃ/ /ʃ/!",
    chantCn: "嘘!宝宝睡觉,/ʃ/ /ʃ/ /ʃ/!",
    exampleWords: [
      { word: "ship", meaningCn: "船", emoji: "🚢" },
      { word: "shop", meaningCn: "商店", emoji: "🏪" },
      { word: "fish", meaningCn: "鱼", emoji: "🐠" },
      { word: "wish", meaningCn: "愿望", emoji: "⭐" },
    ],
    exampleSentence: "A ship in the shop.",
    exampleSentenceCn: "商店里有一艘船。",
  },
  {
    id: "p_th", groupId: "g5", letter: "th",
    sortOrder: 506,
    sound: "/θ/",
    soundDesc: "舌头放在两排牙齿中间,轻轻吹气 — th!",
    trickHint: "舌头伸出来一点点,然后吹气",
    chantEn: "This and that, three thumbs, /θ/ /θ/ /θ/!",
    chantCn: "这个那个,三个大拇指,/θ/ /θ/ /θ/!",
    exampleWords: [
      { word: "this", meaningCn: "这个", emoji: "👉" },
      { word: "that", meaningCn: "那个", emoji: "👈" },
      { word: "thin", meaningCn: "瘦的", emoji: "📏" },
      { word: "three", meaningCn: "三", emoji: "3️⃣" },
    ],
    exampleSentence: "This is three.",
    exampleSentenceCn: "这是三。",
  },
  {
    id: "p_ng", groupId: "g5", letter: "ng",
    sortOrder: 507,
    sound: "/ŋ/",
    soundDesc: "鼻子里嗡嗡的 — ng! 像 'sing' 的最后",
    trickHint: "唱歌 'sing' 时最后那个音就是 'ng'",
    chantEn: "Sing a song, ring the bell, /ŋ/ /ŋ/ /ŋ/!",
    chantCn: "唱首歌,摇铃铛,/ŋ/ /ŋ/ /ŋ/!",
    exampleWords: [
      { word: "sing", meaningCn: "唱歌", emoji: "🎵" },
      { word: "king", meaningCn: "国王", emoji: "👑" },
      { word: "ring", meaningCn: "戒指", emoji: "💍" },
      { word: "long", meaningCn: "长的", emoji: "📏" },
    ],
    exampleSentence: "The king can sing.",
    exampleSentenceCn: "国王会唱歌。",
  },

  // Group 6 字母组合
  {
    id: "p_oo_short", groupId: "g6", letter: "oo",
    sortOrder: 601,
    sound: "/ʊ/",
    soundDesc: "短短的 — uh! 像 'book' 里的音",
    trickHint: "短短的 oo,在 book、look 里",
    chantEn: "Look at the book, /ʊ/ /ʊ/ /ʊ/!",
    chantCn: "看那本书,/ʊ/ /ʊ/ /ʊ/!",
    exampleWords: [
      { word: "book", meaningCn: "书", emoji: "📖" },
      { word: "look", meaningCn: "看", emoji: "👀" },
      { word: "good", meaningCn: "好", emoji: "👍" },
      { word: "foot", meaningCn: "脚", emoji: "🦶" },
    ],
    exampleSentence: "Look at the book.",
    exampleSentenceCn: "看那本书。",
  },
  {
    id: "p_oo_long", groupId: "g6", letter: "oo",
    sortOrder: 602,
    sound: "/uː/",
    soundDesc: "长长的 — ooo! 像 'moon' 里的音",
    trickHint: "长长的 oo,在 moon、food 里",
    chantEn: "The moon shines, /uː/ /uː/ /uː/!",
    chantCn: "月亮在闪光,/uː/ /uː/ /uː/!",
    exampleWords: [
      { word: "moon", meaningCn: "月亮", emoji: "🌙" },
      { word: "food", meaningCn: "食物", emoji: "🍱" },
      { word: "room", meaningCn: "房间", emoji: "🚪" },
      { word: "zoo", meaningCn: "动物园", emoji: "🦁" },
    ],
    exampleSentence: "The moon is in the room.",
    exampleSentenceCn: "月亮在房间里。",
  },
  {
    id: "p_ar", groupId: "g6", letter: "ar",
    sortOrder: 603,
    sound: "/ɑːr/",
    soundDesc: "嘴巴张大,加上 r — ar! 像海盗叫",
    trickHint: "学海盗 'arrr!'",
    chantEn: "A star in a car, /ɑːr/ /ɑːr/ /ɑːr/!",
    chantCn: "车里一颗星,/ɑːr/ /ɑːr/ /ɑːr/!",
    exampleWords: [
      { word: "car", meaningCn: "汽车", emoji: "🚗" },
      { word: "star", meaningCn: "星星", emoji: "⭐" },
      { word: "park", meaningCn: "公园", emoji: "🌳" },
      { word: "arm", meaningCn: "手臂", emoji: "💪" },
    ],
    exampleSentence: "A star and a car.",
    exampleSentenceCn: "一颗星星和一辆车。",
  },
  {
    id: "p_ou", groupId: "g6", letter: "ou",
    sortOrder: 604,
    sound: "/aʊ/",
    soundDesc: "像被烫到 — ouch!",
    trickHint: "被烫到时喊 'ouch!'",
    chantEn: "Ouch! A mouse in my house, /aʊ/ /aʊ/ /aʊ/!",
    chantCn: "哎呀!我家有老鼠,/aʊ/ /aʊ/ /aʊ/!",
    exampleWords: [
      { word: "out", meaningCn: "出去", emoji: "🚪" },
      { word: "ouch", meaningCn: "哎呀", emoji: "😣" },
      { word: "house", meaningCn: "房子", emoji: "🏠" },
      { word: "mouse", meaningCn: "老鼠", emoji: "🐭" },
    ],
    exampleSentence: "A mouse in the house.",
    exampleSentenceCn: "房子里有只老鼠。",
  },
  {
    id: "p_oi", groupId: "g6", letter: "oi",
    sortOrder: 605,
    sound: "/ɔɪ/",
    soundDesc: "嘴巴圆变扁 — oi! 像在叫人",
    trickHint: "叫人的时候 'oi!'",
    chantEn: "Oil in a coin, /ɔɪ/ /ɔɪ/ /ɔɪ/!",
    chantCn: "硬币上的油,/ɔɪ/ /ɔɪ/ /ɔɪ/!",
    exampleWords: [
      { word: "oil", meaningCn: "油", emoji: "🛢️" },
      { word: "coin", meaningCn: "硬币", emoji: "🪙" },
      { word: "boil", meaningCn: "煮", emoji: "♨️" },
      { word: "join", meaningCn: "加入", emoji: "🤝" },
    ],
    exampleSentence: "A coin in the oil.",
    exampleSentenceCn: "油里有一枚硬币。",
  },
  {
    id: "p_er", groupId: "g6", letter: "er",
    sortOrder: 606,
    sound: "/ɜːr/",
    soundDesc: "轻轻的 — er,像在思考 'em...'",
    trickHint: "在想问题时 'er...'",
    chantEn: "My sister in winter, /ɜːr/ /ɜːr/ /ɜːr/!",
    chantCn: "我姐姐在冬天,/ɜːr/ /ɜːr/ /ɜːr/!",
    exampleWords: [
      { word: "her", meaningCn: "她的", emoji: "👧" },
      { word: "term", meaningCn: "学期", emoji: "📅" },
      { word: "sister", meaningCn: "姐妹", emoji: "👭" },
      { word: "winter", meaningCn: "冬天", emoji: "❄️" },
    ],
    exampleSentence: "Her sister is here.",
    exampleSentenceCn: "她妹妹在这里。",
  },

  // Group 7 魔法 E (Magic E - 5 个)
  {
    id: "p_a_e", groupId: "g7", letter: "a_e",
    sortOrder: 701,
    sound: "/eɪ/",
    soundDesc: "魔法 e 让 a 变长 — ay!",
    trickHint: "cake、name、make — 后面的 e 不读,但让 a 变长",
    chantEn: "Make a cake, name a snake, /eɪ/ /eɪ/ /eɪ/!",
    chantCn: "做个蛋糕,给蛇起名,/eɪ/ /eɪ/ /eɪ/!",
    exampleWords: [
      { word: "cake", meaningCn: "蛋糕", emoji: "🎂" },
      { word: "name", meaningCn: "名字", emoji: "🏷️" },
      { word: "make", meaningCn: "做", emoji: "🛠️" },
      { word: "lake", meaningCn: "湖", emoji: "🏞️" },
    ],
    exampleSentence: "Make a cake.",
    exampleSentenceCn: "做一个蛋糕。",
    sparkLine: "Magic e 真神奇!它不发音,但让前面的字母变好长~",
  },
  {
    id: "p_i_e", groupId: "g7", letter: "i_e",
    sortOrder: 702,
    sound: "/aɪ/",
    soundDesc: "魔法 e 让 i 变长 — eye!",
    trickHint: "bike、time、five — 后面的 e 不读,让 i 变长",
    chantEn: "Five bikes, nice time, /aɪ/ /aɪ/ /aɪ/!",
    chantCn: "五辆自行车,真好时光,/aɪ/ /aɪ/ /aɪ/!",
    exampleWords: [
      { word: "bike", meaningCn: "自行车", emoji: "🚲" },
      { word: "time", meaningCn: "时间", emoji: "⏰" },
      { word: "five", meaningCn: "五", emoji: "5️⃣" },
      { word: "nice", meaningCn: "好的", emoji: "👍" },
    ],
    exampleSentence: "Five bikes, nice!",
    exampleSentenceCn: "五辆自行车,真好!",
  },
  {
    id: "p_o_e", groupId: "g7", letter: "o_e",
    sortOrder: 703,
    sound: "/oʊ/",
    soundDesc: "魔法 e 让 o 变长 — oh!",
    trickHint: "home、nose、rose — 后面的 e 不读,让 o 变长",
    chantEn: "A rose at home, /oʊ/ /oʊ/ /oʊ/!",
    chantCn: "家里一朵玫瑰,/oʊ/ /oʊ/ /oʊ/!",
    exampleWords: [
      { word: "home", meaningCn: "家", emoji: "🏡" },
      { word: "nose", meaningCn: "鼻子", emoji: "👃" },
      { word: "rose", meaningCn: "玫瑰", emoji: "🌹" },
      { word: "note", meaningCn: "便条", emoji: "📝" },
    ],
    exampleSentence: "A rose at home.",
    exampleSentenceCn: "家里的一朵玫瑰。",
  },
  {
    id: "p_u_e", groupId: "g7", letter: "u_e",
    sortOrder: 704,
    sound: "/juː/",
    soundDesc: "魔法 e 让 u 变长 — yoo!",
    trickHint: "cute、cube、mute — 后面的 e 不读,让 u 变长",
    chantEn: "A cute cube, /juː/ /juː/ /juː/!",
    chantCn: "可爱的方块,/juː/ /juː/ /juː/!",
    exampleWords: [
      { word: "cute", meaningCn: "可爱", emoji: "🥰" },
      { word: "cube", meaningCn: "方块", emoji: "🧊" },
      { word: "tube", meaningCn: "管子", emoji: "🧴" },
      { word: "use", meaningCn: "使用", emoji: "🔨" },
    ],
    exampleSentence: "A cute cube.",
    exampleSentenceCn: "一个可爱的方块。",
  },
  {
    id: "p_e_e", groupId: "g7", letter: "e_e",
    sortOrder: 705,
    sound: "/iː/",
    soundDesc: "魔法 e 让 e 变长 — eee!",
    trickHint: "比较少见,如 these、Pete",
    chantEn: "These are complete, /iː/ /iː/ /iː/!",
    chantCn: "这些都完整,/iː/ /iː/ /iː/!",
    exampleWords: [
      { word: "these", meaningCn: "这些", emoji: "👉" },
      { word: "Pete", meaningCn: "皮特(人名)", emoji: "👦" },
      { word: "theme", meaningCn: "主题", emoji: "🎭" },
      { word: "complete", meaningCn: "完成", emoji: "✅" },
    ],
    exampleSentence: "These are nice.",
    exampleSentenceCn: "这些很好。",
  },
];

// ─── 59 个拼读练习词 ──────────────────────────────────────

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

/** 按组取所有 Phonics 项(按 Jolly Phonics 教学顺序) */
export function getPhonicsByGroup(groupId: string): PhonicsItem[] {
  return PHONICS_ITEMS.filter(p => p.groupId === groupId).sort((a, b) => a.sortOrder - b.sortOrder);
}

/** 按 A-Z 字母顺序取所有 26 单字母(用于字母索引页) */
export function getLettersAlphaSorted(): PhonicsItem[] {
  return PHONICS_ITEMS
    .filter(p => p.alphaSortOrder !== undefined)
    .sort((a, b) => (a.alphaSortOrder! - b.alphaSortOrder!));
}

/** 按 Jolly Phonics 教学顺序取所有 42 个 Phonics 项 */
export function getPhonicsByJollyOrder(): PhonicsItem[] {
  return [...PHONICS_ITEMS].sort((a, b) => a.sortOrder - b.sortOrder);
}

/** 按字母查找(支持大小写) */
export function findPhonicsByLetter(letter: string): PhonicsItem | undefined {
  const lower = letter.toLowerCase();
  return PHONICS_ITEMS.find(p => p.letter === lower);
}

/** 取学完某组后新解锁的词 */
export function getWordsUnlockedAfter(groupId: string): PhonicsWord[] {
  return PHONICS_WORDS.filter(w => w.unlockAfterGroup === groupId);
}

/** 取所有已解锁的词(根据用户完成到第几组) */
export function getUnlockedWords(completedGroupIds: string[]): PhonicsWord[] {
  if (completedGroupIds.length === 0) return [];
  const groupOrder = PHONICS_GROUPS.map(g => g.id);
  const highestCompletedIdx = Math.max(...completedGroupIds.map(g => groupOrder.indexOf(g)));
  return PHONICS_WORDS.filter(w => groupOrder.indexOf(w.unlockAfterGroup) <= highestCompletedIdx);
}

/** 统计:总组数 / 总音数 / 总字母数 / 总词数 */
export const PHONICS_STATS = {
  totalGroups: PHONICS_GROUPS.length,
  totalSounds: 42,        // 26 单字母 + 16 字母组合
  totalLetters: 26,
  totalCombos: 16,
  totalWords: 59,
};
