/**
 * 音标基础 48 卡(PR-10)· 内容数据。
 *
 * ⚠️ 采用**中国英语教学传统的 48 音标**体系:20 元音 + 28 辅音。
 *    28 辅音里含 tr/dr/ts/dz —— 现代音系学不把它们算独立音位(是辅音连缀),
 *    但国内教材普遍单列,学生也是按 48 个学的。跟教材走,不跟学术走。
 *
 * ⚠️ **教学内容(要领 / 典型错误 / 示例词 / 最小对立对)是 v1 草稿,待 Aaron 审。**
 *    送审件见 REVIEWAA/vocab-phonics-48/。审定前页面照常能跑,
 *    审定后直接改这个文件即可,不涉及数据库。
 *
 * ⚠️ 示例词硬约束:**最高频 1000 内的基础词** —— 学音标的人多数还没有词汇量,
 *    拿托福词举例等于用没学过的词教发音。进阶示例(托福词)另放 advanced,默认折叠。
 *
 * ⚠️ focus 是每个示例词里**发这个音的那几个字母**,用于在卡片上标色。
 *    必须与 words 一一对应、且是该词里真实出现的子串(有测试守着)。
 */

export type PhonicsKind = "vowel" | "consonant";

export type PhonicsCard = {
  /** 稳定 id(URL / 进度用),不要改 —— 改了用户的学习记录就对不上 */
  id: string;
  ipa: string;
  kind: PhonicsKind;
  /** 分组:元音按长短/双元音,辅音按发音方式 */
  group: string;
  /** 发音要领:嘴型/舌位,一句话 */
  tip: string;
  /** 中国学习者典型错误,一句话 */
  cnError: string;
  words: string[];
  /** 与 words 等长:每词中发该音的字母 */
  focus: string[];
  /** 最小对立对:只差这一个音的两个词 */
  minimalPair?: [string, string];
  /** 进阶示例(托福词),默认折叠 */
  advanced?: string[];
};

export const PHONICS_48: PhonicsCard[] = [
  /* ── 元音 · 长元音 5 ── */
  { id: "i-long", ipa: "/iː/", kind: "vowel", group: "长元音", tip: "嘴角向两边咧开,舌头抬高靠前,音拖足。", cnError: "读成短促的「一」,长度不够,see 听着像 sit。", words: ["see", "eat", "he"], focus: ["ee", "ea", "e"], minimalPair: ["seat", "sit"], advanced: ["prestige", "convene"] },
  { id: "u-long", ipa: "/uː/", kind: "vowel", group: "长元音", tip: "双唇收圆并向前突出,舌后部抬高。", cnError: "圆唇不够,读成汉语「乌」,food 听着像 foot。", words: ["food", "too", "blue"], focus: ["oo", "oo", "ue"], minimalPair: ["fool", "full"], advanced: ["crucial", "pursuit"] },
  { id: "a-long", ipa: "/ɑː/", kind: "vowel", group: "长元音", tip: "嘴张到最大,舌头放平后缩,像看医生说「啊」。", cnError: "开口不够大,car 读成了 cur。", words: ["car", "far", "art"], focus: ["ar", "ar", "ar"], minimalPair: ["cart", "cut"], advanced: ["archive", "regard"] },
  { id: "o-long", ipa: "/ɔː/", kind: "vowel", group: "长元音", tip: "双唇收圆略突,舌后部中高,音拖足。", cnError: "读成汉语「奥」,或长度不够与 /ɒ/ 混。", words: ["door", "law", "four"], focus: ["oor", "aw", "our"], minimalPair: ["port", "pot"], advanced: ["applaud", "restore"] },
  { id: "er-long", ipa: "/ɜː/", kind: "vowel", group: "长元音", tip: "舌位居中不动,双唇放松微扁,声音从喉咙平稳送出。", cnError: "加了汉语儿化音,bird 读成「伯儿的」。", words: ["bird", "work", "her"], focus: ["ir", "or", "er"], minimalPair: ["burn", "barn"], advanced: ["deterrent", "asserted"] },

  /* ── 元音 · 短元音 7 ── */
  { id: "i-short", ipa: "/ɪ/", kind: "vowel", group: "短元音", tip: "嘴型比 /iː/ 放松,短促轻点即收。", cnError: "拖长成 /iː/,sit 听着像 seat。", words: ["sit", "big", "in"], focus: ["i", "i", "i"], minimalPair: ["sit", "seat"], advanced: ["implicit", "vivid"] },
  { id: "u-short", ipa: "/ʊ/", kind: "vowel", group: "短元音", tip: "双唇微圆放松,舌后略抬,短促。", cnError: "圆唇过度读成 /uː/,full 听着像 fool。", words: ["book", "good", "put"], focus: ["oo", "oo", "u"], minimalPair: ["full", "fool"], advanced: ["bulletin", "cushion"] },
  { id: "e-short", ipa: "/e/", kind: "vowel", group: "短元音", tip: "嘴半开,舌前部中高,像汉语「诶」但更短。", cnError: "开口过大与 /æ/ 混,bed 听着像 bad。", words: ["bed", "red", "ten"], focus: ["e", "e", "e"], minimalPair: ["bed", "bad"], advanced: ["pending", "eloquent"] },
  { id: "ae", ipa: "/æ/", kind: "vowel", group: "短元音", tip: "嘴角向两边拉平,下巴放低,舌前部低平。", cnError: "读成 /e/,cat 听着像 ket;这是最常见的元音错误之一。", words: ["cat", "bad", "map"], focus: ["a", "a", "a"], minimalPair: ["cat", "cut"], advanced: ["adamant", "tactic"] },
  { id: "uh", ipa: "/ʌ/", kind: "vowel", group: "短元音", tip: "口腔中部放松,短促有力,像被撞了一下的「啊」。", cnError: "读成汉语「啊」拖长,或与 /ɑː/ 不分。", words: ["cup", "sun", "but"], focus: ["u", "u", "u"], minimalPair: ["cup", "cap"], advanced: ["abrupt", "sustain"] },
  { id: "o-short", ipa: "/ɒ/", kind: "vowel", group: "短元音", tip: "嘴张开并收圆,舌后部低,短促。", cnError: "拖长成 /ɔː/,或圆唇不足读成 /ɑː/。", words: ["hot", "dog", "box"], focus: ["o", "o", "o"], minimalPair: ["cot", "caught"], advanced: ["prospect", "modify"] },
  { id: "schwa", ipa: "/ə/", kind: "vowel", group: "短元音", tip: "最放松的音,口型几乎不动,极轻极短。只出现在非重读音节。", cnError: "把弱读音节读成饱满元音,about 读成「阿包特」——英语的节奏就毁在这。", words: ["about", "sofa", "again"], focus: ["a", "a", "a"], advanced: ["deliberate", "consensus"] },

  /* ── 元音 · 双元音 8 ── */
  { id: "ei", ipa: "/eɪ/", kind: "vowel", group: "双元音", tip: "从 /e/ 滑向 /ɪ/,前长后短,一个音里滑过去。", cnError: "读成两个分开的音,或直接读成汉语「诶」。", words: ["day", "make", "name"], focus: ["ay", "a", "a"], minimalPair: ["late", "let"], advanced: ["stagnate", "vacant"] },
  { id: "ai", ipa: "/aɪ/", kind: "vowel", group: "双元音", tip: "从 /a/ 滑向 /ɪ/,起点嘴张大,滑动明显。", cnError: "滑动不足,my 听着发闷。", words: ["my", "time", "five"], focus: ["y", "i", "i"], minimalPair: ["light", "let"], advanced: ["viable", "incite"] },
  { id: "oi", ipa: "/ɔɪ/", kind: "vowel", group: "双元音", tip: "从圆唇 /ɔ/ 滑向 /ɪ/,唇形由圆变扁。", cnError: "唇形不变,读成单个音。", words: ["boy", "coin", "join"], focus: ["oy", "oi", "oi"], minimalPair: ["toy", "tie"] as [string, string], advanced: ["exploit", "adjoin"] },
  { id: "au", ipa: "/aʊ/", kind: "vowel", group: "双元音", tip: "从 /a/ 滑向 /ʊ/,嘴由大张收成圆。", cnError: "收圆不到位,how 听着像 ha。", words: ["how", "now", "out"], focus: ["ow", "ow", "ou"], minimalPair: ["town", "tone"] as [string, string], advanced: ["profound", "devour"] },
  { id: "ou", ipa: "/əʊ/", kind: "vowel", group: "双元音", tip: "从 /ə/ 滑向 /ʊ/,起点放松,终点收圆。", cnError: "读成汉语「欧」,起点太圆;美音更接近 /oʊ/。", words: ["go", "home", "no"], focus: ["o", "o", "o"], minimalPair: ["coat", "caught"], advanced: ["erode", "prolong"] },
  { id: "ie", ipa: "/ɪə/", kind: "vowel", group: "双元音", tip: "从 /ɪ/ 滑向 /ə/,后半段极轻。", cnError: "把 /ə/ 读成饱满的「儿」。", words: ["here", "ear", "near"], focus: ["ere", "ear", "ear"], minimalPair: ["here", "hair"] as [string, string], advanced: ["sincere", "adhere"] },
  { id: "ea", ipa: "/eə/", kind: "vowel", group: "双元音", tip: "从 /e/ 滑向 /ə/,嘴半开逐渐放松。", cnError: "与 /ɪə/ 不分,hair 听着像 here。", words: ["hair", "care", "where"], focus: ["air", "are", "ere"], minimalPair: ["hair", "here"], advanced: ["impair", "declare"] },
  { id: "ue", ipa: "/ʊə/", kind: "vowel", group: "双元音", tip: "从 /ʊ/ 滑向 /ə/,唇由圆转松。现代英音里常并入 /ɔː/。", cnError: "读成 /uː/ + 儿化。", words: ["poor", "sure", "tour"], focus: ["oor", "ure", "our"], minimalPair: ["poor", "paw"] as [string, string], advanced: ["allure", "endure"] },

  /* ── 辅音 · 爆破音 6 ── */
  { id: "p", ipa: "/p/", kind: "consonant", group: "爆破音(清)", tip: "双唇紧闭再突然放开,送气强,纸片会被吹动。", cnError: "送气不足,pen 听着像 Ben。", words: ["pen", "map", "open"], focus: ["p", "p", "p"], minimalPair: ["pen", "Ben"], advanced: ["prospect", "compile"] },
  { id: "b", ipa: "/b/", kind: "consonant", group: "爆破音(浊)", tip: "双唇紧闭再放开,不送气,声带振动。", cnError: "读成汉语「不」,带出多余元音。", words: ["bag", "job", "big"], focus: ["b", "b", "b"], minimalPair: ["bat", "pat"], advanced: ["ambiguous", "robust"] },
  { id: "t", ipa: "/t/", kind: "consonant", group: "爆破音(清)", tip: "舌尖抵上齿龈,突然放开送气。", cnError: "词尾 /t/ 加元音,cat 读成「凯特」。", words: ["ten", "cat", "time"], focus: ["t", "t", "t"], minimalPair: ["ten", "den"], advanced: ["tentative", "distort"] },
  { id: "d", ipa: "/d/", kind: "consonant", group: "爆破音(浊)", tip: "舌尖抵上齿龈,放开不送气,声带振动。", cnError: "词尾加元音,bed 读成「白的」。", words: ["dog", "bed", "do"], focus: ["d", "d", "d"], minimalPair: ["dot", "tot"], advanced: ["diligent", "candid"] },
  { id: "k", ipa: "/k/", kind: "consonant", group: "爆破音(清)", tip: "舌后部抵软腭再放开,送气强。", cnError: "送气不足与 /g/ 混。", words: ["cat", "book", "key"], focus: ["c", "k", "k"], minimalPair: ["coat", "goat"], advanced: ["scrutiny", "acclaim"] },
  { id: "g", ipa: "/g/", kind: "consonant", group: "爆破音(浊)", tip: "舌后部抵软腭放开,不送气,声带振动。", cnError: "读成汉语「哥」。", words: ["go", "bag", "get"], focus: ["g", "g", "g"], minimalPair: ["gate", "Kate"], advanced: ["aggregate", "vigor"] },

  /* ── 辅音 · 摩擦音 9 ── */
  { id: "f", ipa: "/f/", kind: "consonant", group: "摩擦音(清)", tip: "上齿轻咬下唇,气流从缝中摩擦而出。", cnError: "用双唇代替齿唇,读成汉语「夫」。", words: ["fish", "life", "off"], focus: ["f", "f", "ff"], minimalPair: ["fan", "van"], advanced: ["fluctuate", "profound"] },
  { id: "v", ipa: "/v/", kind: "consonant", group: "摩擦音(浊)", tip: "上齿轻咬下唇,声带振动。", cnError: "读成 /w/,very 听着像 wery ——最典型的中式错误之一。", words: ["very", "give", "love"], focus: ["v", "v", "v"], minimalPair: ["vest", "west"], advanced: ["vivid", "prevail"] },
  { id: "th-unvoiced", ipa: "/θ/", kind: "consonant", group: "摩擦音(清)", tip: "舌尖轻放上下齿之间,送气摩擦,舌头要看得见。", cnError: "**最易读成 /s/**,think 听着像 sink。", words: ["think", "three", "mouth"], focus: ["th", "th", "th"], minimalPair: ["think", "sink"], advanced: ["theoretical", "synthesis"] },
  { id: "th-voiced", ipa: "/ð/", kind: "consonant", group: "摩擦音(浊)", tip: "舌位同 /θ/,但声带振动。", cnError: "读成 /z/ 或 /d/,this 听着像 zis。", words: ["this", "that", "mother"], focus: ["th", "th", "th"], minimalPair: ["they", "day"], advanced: ["nevertheless", "rhythm"] },
  { id: "s", ipa: "/s/", kind: "consonant", group: "摩擦音(清)", tip: "舌尖靠近上齿龈,气流成窄缝摩擦,像蛇声。", cnError: "与 /θ/ 混;或词尾 -s 吞掉。", words: ["see", "bus", "city"], focus: ["s", "s", "c"], minimalPair: ["sink", "think"], advanced: ["consensus", "persist"] },
  { id: "z", ipa: "/z/", kind: "consonant", group: "摩擦音(浊)", tip: "舌位同 /s/,声带振动,像蜜蜂声。", cnError: "词尾读成 /s/,is 读成 iss。", words: ["zoo", "is", "these"], focus: ["z", "s", "se"], minimalPair: ["zip", "sip"], advanced: ["resolve", "presume"] },
  { id: "sh", ipa: "/ʃ/", kind: "consonant", group: "摩擦音(清)", tip: "双唇略突成圆,舌面抬向硬腭,像「嘘」。", cnError: "读成汉语「西」,舌位太前。", words: ["she", "fish", "shop"], focus: ["sh", "sh", "sh"], minimalPair: ["ship", "sip"], advanced: ["diminish", "sufficient"] },
  { id: "zh", ipa: "/ʒ/", kind: "consonant", group: "摩擦音(浊)", tip: "舌位同 /ʃ/,声带振动。英语里较少见。", cnError: "读成 /dʒ/,vision 听着像 vidgeon。", words: ["usual", "measure", "vision"], focus: ["s", "s", "s"], advanced: ["composure", "illusion"] },
  { id: "h", ipa: "/h/", kind: "consonant", group: "摩擦音(清)", tip: "口腔放松,气流从声门直接呼出,像哈气。", cnError: "用汉语「喝」的摩擦,过重。", words: ["hat", "he", "home"], focus: ["h", "h", "h"], minimalPair: ["hair", "air"] as [string, string], advanced: ["inherent", "cohesive"] },

  /* ── 辅音 · 塞擦音 6 ── */
  { id: "ch", ipa: "/tʃ/", kind: "consonant", group: "塞擦音(清)", tip: "/t/ 与 /ʃ/ 快速连成一个音,双唇略突。", cnError: "读成汉语「气」,舌位太前。", words: ["chair", "teach", "much"], focus: ["ch", "ch", "ch"], minimalPair: ["chair", "share"], advanced: ["approach", "virtue"] },
  { id: "j", ipa: "/dʒ/", kind: "consonant", group: "塞擦音(浊)", tip: "/d/ 与 /ʒ/ 快速连成一个音,声带振动。", cnError: "读成汉语「基」。", words: ["job", "age", "just"], focus: ["j", "ge", "j"], minimalPair: ["jeep", "cheap"], advanced: ["adjacent", "allege"] },
  { id: "tr", ipa: "/tr/", kind: "consonant", group: "塞擦音(清)", tip: "/t/ 后紧跟 /r/,双唇略突,一个动作完成。", cnError: "拆成两个音「特-若」。", words: ["tree", "train", "try"], focus: ["tr", "tr", "tr"], minimalPair: ["train", "drain"] as [string, string], advanced: ["intrinsic", "traverse"] },
  { id: "dr", ipa: "/dr/", kind: "consonant", group: "塞擦音(浊)", tip: "/d/ 后紧跟 /r/,声带振动。", cnError: "拆成两个音「的-若」。", words: ["dream", "drink", "draw"], focus: ["dr", "dr", "dr"], minimalPair: ["drain", "train"] as [string, string], advanced: ["hindrance", "withdraw"] },
  { id: "ts", ipa: "/ts/", kind: "consonant", group: "塞擦音(清)", tip: "/t/ 与 /s/ 连读,近似汉语「次」但更短。多出现在词尾。", cnError: "词尾吞掉,students 读成 studen。", words: ["cats", "hits", "students"], focus: ["ts", "ts", "ts"], advanced: ["prospects", "constraints"] },
  { id: "dz", ipa: "/dz/", kind: "consonant", group: "塞擦音(浊)", tip: "/d/ 与 /z/ 连读,声带振动。多出现在词尾。", cnError: "词尾吞掉或读成 /ts/。", words: ["beds", "kids", "words"], focus: ["ds", "ds", "ds"], advanced: ["standards", "methods"] },

  /* ── 辅音 · 鼻音 3 ── */
  { id: "m", ipa: "/m/", kind: "consonant", group: "鼻音", tip: "双唇闭合,气流从鼻腔出,声带振动。", cnError: "词尾不闭唇,time 听着像 tie。", words: ["man", "time", "come"], focus: ["m", "m", "m"], minimalPair: ["map", "nap"] as [string, string], advanced: ["momentum", "diminish"] },
  { id: "n", ipa: "/n/", kind: "consonant", group: "鼻音", tip: "舌尖抵上齿龈,气流从鼻腔出。", cnError: "与 /ŋ/ 不分(前后鼻音),sin 与 sing 混。", words: ["no", "run", "nine"], focus: ["n", "n", "n"], minimalPair: ["sin", "sing"], advanced: ["nominal", "sustain"] },
  { id: "ng", ipa: "/ŋ/", kind: "consonant", group: "鼻音", tip: "舌后部抵软腭,气流从鼻腔出,舌尖不碰任何地方。", cnError: "加出 /g/ 尾音,sing 读成 sing-g。", words: ["sing", "long", "thing"], focus: ["ng", "ng", "ng"], minimalPair: ["sing", "sin"], advanced: ["prolonging", "distinguishing"] },

  /* ── 辅音 · 舌侧音 1 ── */
  { id: "l", ipa: "/l/", kind: "consonant", group: "舌侧音", tip: "舌尖抵上齿龈,气流从舌两侧出。词尾时舌位后缩(暗 l)。", cnError: "词尾 /l/ 加元音,well 读成「威奥」。", words: ["look", "well", "like"], focus: ["l", "ll", "l"], minimalPair: ["light", "right"], advanced: ["fulfill", "eligible"] },

  /* ── 辅音 · 半元音 3 ── */
  { id: "r", ipa: "/r/", kind: "consonant", group: "半元音", tip: "舌尖上卷但**不碰**上腭,双唇略突。", cnError: "读成汉语「日」,或与 /l/ 不分。", words: ["red", "run", "very"], focus: ["r", "r", "r"], minimalPair: ["right", "light"], advanced: ["reciprocal", "deteriorate"] },
  { id: "y", ipa: "/j/", kind: "consonant", group: "半元音", tip: "舌前部抬向硬腭,快速滑向后面的元音。", cnError: "读成汉语「衣」并拖长。", words: ["yes", "you", "year"], focus: ["y", "y", "y"], minimalPair: ["year", "ear"] as [string, string], advanced: ["yield", "beyond"] },
  { id: "w", ipa: "/w/", kind: "consonant", group: "半元音", tip: "双唇收圆突出,快速滑向后面的元音。", cnError: "与 /v/ 混,west 读成 vest。", words: ["we", "want", "win"], focus: ["w", "w", "w"], minimalPair: ["west", "vest"], advanced: ["widespread", "warrant"] },
];

export const VOWELS = PHONICS_48.filter(c => c.kind === "vowel");
export const CONSONANTS = PHONICS_48.filter(c => c.kind === "consonant");
