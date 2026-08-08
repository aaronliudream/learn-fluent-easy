/**
 * 自然拼读 42 规则(PR-13)· 内容数据。
 *
 * ⚠️ 与 48 音标**共用卡片骨架与测验引擎**(见 VocabPhonics.tsx),
 *    所以类型 SkillCardData 定义在这里、音标那边转换过来,不是两套。
 *
 * ⚠️ 自然拼读教的是**字母组合 → 读音**的对应,和音标是两个角度:
 *    音标解决"这个音怎么发",拼读解决"看见这串字母该读什么"。
 *    所以 cnError 这一栏在这边放的是**例外提示**(英语拼读规则没有无例外的)。
 *
 * ⚠️ 教学内容是 v1 草稿,送审件在 REVIEWAA/vocab-phonics-48/。
 *    审定后直接改本文件,不涉及数据库。
 *
 * ⚠️ 示例词同样限**基础高频词** —— 学拼读的人还没有词汇量。
 */

/** 音标卡与拼读卡共用的卡片数据形状。 */
export type SkillCardData = {
  id: string;
  /** 顶部横滑导航上显示的短标识(音标符号 / 字母组合) */
  symbol: string;
  /** 卡片大字 */
  title: string;
  group: string;
  /** 一句话说明 */
  tip: string;
  /** 音标卡=中国学生典型错误;拼读卡=例外提示 */
  cnError: string;
  words: string[];
  /** 与 words 等长:每词中命中该规则的字母 */
  focus: string[];
  minimalPair?: [string, string];
  advanced?: string[];
};

export const PHONICS_RULES: SkillCardData[] = [
  /* ── 单辅音(易错的几个)6 ── */
  { id: "r-c-soft", symbol: "c→/s/", title: "c 在 e/i/y 前读 /s/", group: "软音规则", tip: "c 后面跟 e、i、y 时读 /s/,其余情况读 /k/。", cnError: "例外极少;记住 city/face 对比 cat/cup。", words: ["city", "face", "ice", "cycle"], focus: ["c", "c", "c", "c"] },
  { id: "r-g-soft", symbol: "g→/dʒ/", title: "g 在 e/i/y 前读 /dʒ/", group: "软音规则", tip: "g 后面跟 e、i、y 时多读 /dʒ/,其余读 /g/。", cnError: "例外不少:get、give、girl 都读 /g/。", words: ["age", "giant", "gym", "large"], focus: ["g", "g", "g", "g"] },
  { id: "r-s-z", symbol: "-s→/z/", title: "词尾 -s 在浊音后读 /z/", group: "词尾变化", tip: "前一个音是浊音(元音或浊辅音)时,-s 读 /z/ 不读 /s/。", cnError: "清辅音后仍读 /s/:cats、books。", words: ["dogs", "beds", "runs", "plays"], focus: ["s", "s", "s", "s"] },
  /* -ed 三读合成一张卡:它们是同一条规则的三个分支,分开讲反而记不住"什么时候加音节" */
  { id: "r-ed", symbol: "-ed", title: "-ed 的三种读法", group: "词尾变化", tip: "清辅音后读 /t/(walked),浊音后读 /d/(played),**只有 t/d 后才单独成音节**读 /ɪd/(wanted)。", cnError: "最常见的错是一律读成「艾德」——前两种都不加音节,walked 是一个音节不是两个。", words: ["walked", "washed", "played", "called", "wanted", "needed"], focus: ["ed", "ed", "ed", "ed", "ed", "ed"] },

  /* ── 辅音字母组合 10 ── */
  { id: "r-sh", symbol: "sh", title: "sh 读 /ʃ/", group: "辅音组合", tip: "两个字母合成一个音,像「嘘」。", cnError: "基本无例外。", words: ["ship", "fish", "she", "wash"], focus: ["sh", "sh", "sh", "sh"] },
  { id: "r-ch", symbol: "ch", title: "ch 读 /tʃ/", group: "辅音组合", tip: "多数情况读 /tʃ/。", cnError: "外来词里读 /k/(school)或 /ʃ/(machine)。", words: ["chair", "lunch", "child", "much"], focus: ["ch", "ch", "ch", "ch"] },
  /* th 清浊合一张:这两个音是对立关系,必须放一起对比才听得出差别 */
  { id: "r-th", symbol: "th", title: "th 的清浊两读", group: "辅音组合", tip: "实词里多读清音 /θ/(think、math);虚词(the/this/they)和词中多读浊音 /ð/。舌尖都要伸出齿间。", cnError: "清浊的分界没有硬规则,靠高频词整体记;但**都不能读成 /s/ 或 /z/**。", words: ["think", "three", "this", "they", "mother"], focus: ["th", "th", "th", "th", "th"], minimalPair: ["think", "sink"] },
  { id: "r-ph", symbol: "ph", title: "ph 读 /f/", group: "辅音组合", tip: "希腊语来源的词里 ph 一律读 /f/。", cnError: "无例外 —— 见到 ph 一律读 /f/,都是希腊语来源的词。", words: ["phone", "photo", "graph", "phrase"], focus: ["ph", "ph", "ph", "ph"] },
  { id: "r-wh", symbol: "wh", title: "wh 读 /w/", group: "辅音组合", tip: "多数读 /w/,h 不发音。", cnError: "who/whose/whole 读 /h/,w 不发音。", words: ["what", "when", "white", "why"], focus: ["wh", "wh", "wh", "wh"] },
  { id: "r-ck", symbol: "ck", title: "ck 读 /k/", group: "辅音组合", tip: "短元音后用 ck 表示 /k/。", cnError: "无例外 —— ck 只出现在短元音之后,永远读一个 /k/。", words: ["back", "duck", "black", "clock"], focus: ["ck", "ck", "ck", "ck"] },
  { id: "r-ng", symbol: "ng", title: "ng 读 /ŋ/", group: "辅音组合", tip: "词尾 ng 是一个鼻音,舌尖不碰上腭。", cnError: "别在后面加出 /g/。", words: ["sing", "long", "king", "wrong"], focus: ["ng", "ng", "ng", "ng"] },
  { id: "r-nk", symbol: "nk", title: "nk 读 /ŋk/", group: "辅音组合", tip: "n 在 k 前变成 /ŋ/,后面再接 /k/。", cnError: "无例外 —— 但注意 n 已经变成 /ŋ/ 了,不是 /n/+/k/。", words: ["think", "bank", "pink", "drink"], focus: ["nk", "nk", "nk", "nk"] },
  { id: "r-qu", symbol: "qu", title: "qu 读 /kw/", group: "辅音组合", tip: "q 后面永远跟 u,合读 /kw/。", cnError: "无例外 —— q 后面永远跟 u,不会单独出现。", words: ["quick", "queen", "question", "quiet"], focus: ["qu", "qu", "qu", "qu"] },

  /* ── 短元音 5 ── */
  { id: "r-a-short", symbol: "a短", title: "闭音节里 a 读 /æ/", group: "短元音", tip: "「辅音+a+辅音」结构里,a 读 /æ/。", cnError: "a 在 l/ll 前常变音:all、call。", words: ["cat", "map", "bag", "hand"], focus: ["a", "a", "a", "a"] },
  { id: "r-e-short", symbol: "e短", title: "闭音节里 e 读 /e/", group: "短元音", tip: "「辅音+e+辅音」结构里,e 读 /e/。", cnError: "少数词里 e 弱读成 /ə/。", words: ["bed", "pen", "red", "help"], focus: ["e", "e", "e", "e"] },
  { id: "r-i-short", symbol: "i短", title: "闭音节里 i 读 /ɪ/", group: "短元音", tip: "「辅音+i+辅音」结构里,i 读 /ɪ/。", cnError: "-ind/-ild 里读长音:find、child。", words: ["sit", "big", "fish", "milk"], focus: ["i", "i", "i", "i"] },
  { id: "r-o-short", symbol: "o短", title: "闭音节里 o 读 /ɒ/", group: "短元音", tip: "「辅音+o+辅音」结构里,o 读 /ɒ/。", cnError: "-old/-ost 里读长音:cold、most。", words: ["hot", "dog", "box", "stop"], focus: ["o", "o", "o", "o"] },
  { id: "r-u-short", symbol: "u短", title: "闭音节里 u 读 /ʌ/", group: "短元音", tip: "「辅音+u+辅音」结构里,u 读 /ʌ/。", cnError: "put、full、push 读 /ʊ/。", words: ["cup", "bus", "sun", "jump"], focus: ["u", "u", "u", "u"] },

  /* ── 魔法 e(开音节)5 ── */
  { id: "r-a-e", symbol: "a_e", title: "a + 辅音 + e 读 /eɪ/", group: "魔法 e", tip: "词尾那个 e 不发音,但让前面的 a 读它的字母音。", cnError: "have、gave 里的 have 是例外读 /æ/。", words: ["name", "cake", "make", "game"], focus: ["a", "a", "a", "a"] },
  { id: "r-i-e", symbol: "i_e", title: "i + 辅音 + e 读 /aɪ/", group: "魔法 e", tip: "词尾 e 不发音,i 读字母音 /aɪ/。", cnError: "give、live(动词)是例外。", words: ["time", "five", "nice", "like"], focus: ["i", "i", "i", "i"] },
  { id: "r-o-e", symbol: "o_e", title: "o + 辅音 + e 读 /əʊ/", group: "魔法 e", tip: "词尾 e 不发音,o 读字母音 /əʊ/。", cnError: "come、some、love 是例外。", words: ["home", "nose", "note", "hope"], focus: ["o", "o", "o", "o"] },
  { id: "r-u-e", symbol: "u_e", title: "u + 辅音 + e 读 /juː/", group: "魔法 e", tip: "词尾 e 不发音,u 读字母音 /juː/。", cnError: "rule、blue 里读 /uː/,没有 /j/。", words: ["use", "cute", "huge", "tube"], focus: ["u", "u", "u", "u"] },
  { id: "r-e-e", symbol: "e_e", title: "e + 辅音 + e 读 /iː/", group: "魔法 e", tip: "较少见,e 读字母音 /iː/。", cnError: "there、where 是例外。", words: ["these", "theme", "Chinese", "complete"], focus: ["e", "e", "e", "e"] },

  /* ── 元音组合 10 ── */
  { id: "r-ee", symbol: "ee", title: "ee 读 /iː/", group: "元音组合", tip: "两个 e 合读长音 /iː/。", cnError: "无例外 —— ee 是最稳定的元音组合,见到就读 /iː/。", words: ["see", "tree", "green", "week"], focus: ["ee", "ee", "ee", "ee"] },
  { id: "r-ea", symbol: "ea", title: "ea 多读 /iː/", group: "元音组合", tip: "多数情况读 /iː/。", cnError: "bread、head、ready 读 /e/;great 读 /eɪ/。", words: ["eat", "sea", "team", "clean"], focus: ["ea", "ea", "ea", "ea"] },
  /* oo 长短合一张:同一个字母组合两种读法,分开讲学生只会更懵 */
  { id: "r-oo", symbol: "oo", title: "oo 的两种读法", group: "元音组合", tip: "多数读长音 /uː/(food、moon);**-ook 一类高频词读短音 /ʊ/**(book、look)。", cnError: "没有规则可依,靠高频词整体记:book/good/look/foot 是短音,其余多为长音。", words: ["food", "moon", "school", "book", "good", "look"], focus: ["oo", "oo", "oo", "oo", "oo", "oo"], minimalPair: ["fool", "full"] },
  { id: "r-ai", symbol: "ai/ay", title: "ai、ay 读 /eɪ/", group: "元音组合", tip: "ai 用在词中,ay 用在词尾。", cnError: "said 是例外读 /e/。", words: ["rain", "train", "day", "play"], focus: ["ai", "ai", "ay", "ay"] },
  { id: "r-oa", symbol: "oa", title: "oa 读 /əʊ/", group: "元音组合", tip: "oa 合读字母音 /əʊ/。", cnError: "broad 是例外。", words: ["boat", "coat", "road", "goat"], focus: ["oa", "oa", "oa", "oa"] },
  { id: "r-ow-ou", symbol: "ow→/aʊ/", title: "ow 读 /aʊ/", group: "元音组合", tip: "很多词里 ow 读 /aʊ/。", cnError: "snow、know、slow 读 /əʊ/ —— 同一个 ow 两种读法,必须整词记。", words: ["how", "now", "down", "town"], focus: ["ow", "ow", "ow", "ow"] },
  { id: "r-ou", symbol: "ou", title: "ou 读 /aʊ/", group: "元音组合", tip: "多数读 /aʊ/。", cnError: "you、group 读 /uː/;could、would 读 /ʊ/。", words: ["out", "house", "about", "mouth"], focus: ["ou", "ou", "ou", "ou"] },
  { id: "r-oi", symbol: "oi/oy", title: "oi、oy 读 /ɔɪ/", group: "元音组合", tip: "oi 用在词中,oy 用在词尾。", cnError: "无例外 —— oi 和 oy 分工清楚:词中用 oi,词尾用 oy。", words: ["coin", "join", "boy", "toy"], focus: ["oi", "oi", "oy", "oy"] },
  { id: "r-au", symbol: "au/aw", title: "au、aw 读 /ɔː/", group: "元音组合", tip: "au 用在词中,aw 用在词尾。", cnError: "aunt、laugh 是例外。", words: ["autumn", "cause", "saw", "draw"], focus: ["au", "au", "aw", "aw"] },

  /* ── r 控元音 5 ── */
  { id: "r-ar", symbol: "ar", title: "ar 读 /ɑː/", group: "r 控元音", tip: "重读音节里 ar 读 /ɑː/。", cnError: "非重读时弱化成 /ə/:dollar、sugar。", words: ["car", "far", "park", "start"], focus: ["ar", "ar", "ar", "ar"] },
  { id: "r-or", symbol: "or", title: "or 读 /ɔː/", group: "r 控元音", tip: "重读音节里 or 读 /ɔː/。", cnError: "work、word、world 读 /ɜː/。", words: ["for", "born", "short", "sport"], focus: ["or", "or", "or", "or"] },
  { id: "r-er", symbol: "er/ir/ur", title: "er、ir、ur 读 /ɜː/", group: "r 控元音", tip: "三种拼法同一个音,重读时都读 /ɜː/。", cnError: "词尾非重读的 -er 读 /ə/:teacher、water。", words: ["her", "bird", "turn", "girl"], focus: ["er", "ir", "ur", "ir"] },
  { id: "r-air", symbol: "air", title: "air 读 /eə/", group: "r 控元音", tip: "air、are、ear 都可能读 /eə/。", cnError: "ear 多数读 /ɪə/(hear),只有 bear/pear 读 /eə/。", words: ["hair", "chair", "care", "share"], focus: ["air", "air", "are", "are"] },
  { id: "r-ear", symbol: "ear", title: "ear 读 /ɪə/", group: "r 控元音", tip: "多数 ear 读 /ɪə/。", cnError: "learn、earth 读 /ɜː/;bear、wear 读 /eə/。", words: ["ear", "hear", "near", "year"], focus: ["ear", "ear", "ear", "ear"] },

  /* ── 不发音字母 + 常见词尾 5 ── */
  { id: "r-silent-e", symbol: "silent e", title: "词尾 e 多不发音", group: "不发音字母", tip: "词尾的 e 通常只起「让前面元音读字母音」的作用,自己不发音。", cnError: "the、be、he 里的 e 要发音。", words: ["make", "hope", "nice", "these"], focus: ["e", "e", "e", "e"] },
  { id: "r-silent-k", symbol: "kn", title: "kn 里 k 不发音", group: "不发音字母", tip: "词首 kn 只读 /n/。", cnError: "无例外 —— 词首 kn 一律只读 /n/,k 永远不发音。", words: ["know", "knee", "knife", "knock"], focus: ["kn", "kn", "kn", "kn"] },
  { id: "r-silent-w", symbol: "wr", title: "wr 里 w 不发音", group: "不发音字母", tip: "词首 wr 只读 /r/。", cnError: "无例外 —— 词首 wr 一律只读 /r/,w 永远不发音。", words: ["write", "wrong", "wrap", "wrist"], focus: ["wr", "wr", "wr", "wr"] },
  { id: "r-silent-b", symbol: "mb", title: "词尾 mb 里 b 不发音", group: "不发音字母", tip: "词尾 mb 只读 /m/。", cnError: "词中的 mb 要读:number、remember。", words: ["climb", "comb", "lamb", "thumb"], focus: ["mb", "mb", "mb", "mb"] },
  { id: "r-tion", symbol: "-tion", title: "-tion 读 /ʃn/", group: "常见词尾", tip: "名词后缀 -tion 读 /ʃn/,重音落在它前面那个音节。", cnError: "-sion 在元音后读 /ʒn/:vision、decision。", words: ["action", "nation", "question", "station"], focus: ["tion", "tion", "tion", "tion"] },
];
