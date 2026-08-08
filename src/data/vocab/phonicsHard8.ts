/**
 * 中国学生最易错的 8 个音(PR-10 重做)· 内容数据。
 *
 * ⚠️ **入口从错误出发,不从符号表出发**(Aaron 定的):
 *    用户不是来查音标表的,是来解决"我读得不对"的。所以每个音的第一句话
 *    是**「你可能读成了 X」**,而不是"这个音的国际音标是……"。
 *
 * ⚠️ 判据:没学过音标的学生打开 /θ/ 这张卡,**30 秒内**要能
 *    ① 知道舌头放哪(靠口腔剖面图)② 听出与 /s/ 的区别(靠最小对立对)
 *    ③ 做对 5 道辨音题(靠三种练习)。所以每条数据都为这三件事服务,
 *    没有一栏是"资料性"的。
 *
 * ⚠️ 教学内容是 v1 草稿,送审件在 REVIEWAA/vocab-phonics-48/。
 * ⚠️ 音频:本轮仍是 TTS 兜底。规格里的 tts-1-hd 300 条攒批要等 Aaron 说「开烧」。
 */

export type Hard8 = {
  /** 与 MOUTH 配置表的 key 一致(不带斜杠) */
  key: string;
  ipa: string;
  /** 「你可能读成了 X」—— 卡片第一句话 */
  mistakenAs: string;
  /** 动作口令:一句祈使句,读完就能照做 */
  command: string;
  /** 为什么中国学生会错(一句话,给理解不给背诵) */
  why: string;
  words: string[];
  focus: string[];
  /** 最小对立对:左边是目标音,右边是最常被读错成的那个音 */
  pair: { target: string; confuse: string; confuseIpa: string };
  /** 「找出目标音」练习:6 个词,标出哪几个含目标音 */
  findSet: { word: string; hit: boolean }[];
};

export const HARD_8: Hard8[] = [
  {
    key: "θ", ipa: "/θ/",
    mistakenAs: "你可能读成了 /s/ —— think 听着像 sink",
    command: "舌尖轻轻伸到上下齿之间,让气流从舌齿缝里擦出去。照镜子应该看得见舌尖。",
    why: "汉语里没有「舌头伸出来」这种音,嘴会本能地缩回舌尖去找最接近的 /s/。",
    words: ["think", "three", "mouth"], focus: ["th", "th", "th"],
    pair: { target: "think", confuse: "sink", confuseIpa: "/s/" },
    findSet: [
      { word: "thank", hit: true }, { word: "sand", hit: false }, { word: "north", hit: true },
      { word: "sing", hit: false }, { word: "both", hit: true }, { word: "sister", hit: false },
    ],
  },
  {
    key: "ð", ipa: "/ð/",
    mistakenAs: "你可能读成了 /z/ 或 /d/ —— this 听着像 zis / dis",
    command: "舌位和 /θ/ 完全一样,舌尖伸到齿间;区别只有一个:**声带要振动**,摸喉咙有麻感。",
    why: "同样是舌尖伸出的音,加上浊化后更陌生,嘴会退回汉语里现成的 /z/ 或 /d/。",
    words: ["this", "that", "mother"], focus: ["th", "th", "th"],
    pair: { target: "they", confuse: "day", confuseIpa: "/d/" },
    findSet: [
      { word: "these", hit: true }, { word: "zoo", hit: false }, { word: "father", hit: true },
      { word: "does", hit: false }, { word: "with", hit: true }, { word: "desk", hit: false },
    ],
  },
  {
    key: "r", ipa: "/r/",
    mistakenAs: "你可能读成了汉语的「日」,或者和 /l/ 混了",
    command: "舌尖向上后卷,但**千万不要碰到上腭**——悬空。同时双唇略微收圆前突。",
    why: "汉语的「日」舌位靠前且摩擦重;而英语 /r/ 是不接触的,一碰就变成 /l/ 或「日」。",
    words: ["red", "run", "very"], focus: ["r", "r", "r"],
    pair: { target: "right", confuse: "light", confuseIpa: "/l/" },
    findSet: [
      { word: "read", hit: true }, { word: "lead", hit: false }, { word: "grow", hit: true },
      { word: "glow", hit: false }, { word: "rice", hit: true }, { word: "lice", hit: false },
    ],
  },
  {
    key: "l", ipa: "/l/",
    mistakenAs: "词尾时你可能读成了「奥」—— well 听着像「威奥」",
    command: "舌尖**抵住上齿龈**(牙齿后面那道肉棱)不放,气流从舌头两侧流出去。",
    why: "汉语没有词尾的 /l/,嘴会把它化成一个元音收尾;而英语里那个舌尖必须真的顶上去。",
    words: ["look", "well", "like"], focus: ["l", "ll", "l"],
    pair: { target: "light", confuse: "right", confuseIpa: "/r/" },
    findSet: [
      { word: "long", hit: true }, { word: "wrong", hit: false }, { word: "play", hit: true },
      { word: "pray", hit: false }, { word: "class", hit: true }, { word: "grass", hit: false },
    ],
  },
  {
    key: "v", ipa: "/v/",
    mistakenAs: "你可能读成了 /w/ —— very 听着像 wery",
    command: "**上齿轻咬下唇**,气流从齿唇之间擦出,声带振动。嘴唇不要收圆。",
    why: "汉语没有齿唇音,最接近的是双唇的 /w/,嘴会自动替换过去。",
    words: ["very", "give", "love"], focus: ["v", "v", "v"],
    pair: { target: "vest", confuse: "west", confuseIpa: "/w/" },
    findSet: [
      { word: "voice", hit: true }, { word: "wine", hit: false }, { word: "seven", hit: true },
      { word: "walk", hit: false }, { word: "leave", hit: true }, { word: "wait", hit: false },
    ],
  },
  {
    key: "w", ipa: "/w/",
    mistakenAs: "你可能和 /v/ 混了 —— west 读成了 vest",
    command: "双唇**收圆并向前突出**(像吹蜡烛),然后快速滑向后面的元音。牙齿不碰嘴唇。",
    why: "/v/ 和 /w/ 在汉语里都没有严格对应,学的时候容易互相污染。",
    words: ["we", "want", "win"], focus: ["w", "w", "w"],
    pair: { target: "west", confuse: "vest", confuseIpa: "/v/" },
    findSet: [
      { word: "water", hit: true }, { word: "very", hit: false }, { word: "away", hit: true },
      { word: "video", hit: false }, { word: "week", hit: true }, { word: "visit", hit: false },
    ],
  },
  {
    key: "æ", ipa: "/æ/",
    mistakenAs: "你可能读成了 /e/ —— cat 听着像 ket",
    command: "**下巴往下压**,嘴角向两边拉平,舌头前部放低放平。开口要比你以为的更大。",
    why: "汉语里没有这么开的前元音,嘴会偷懒收成更省力的 /e/。",
    words: ["cat", "bad", "map"], focus: ["a", "a", "a"],
    pair: { target: "bad", confuse: "bed", confuseIpa: "/e/" },
    findSet: [
      { word: "hat", hit: true }, { word: "head", hit: false }, { word: "man", hit: true },
      { word: "men", hit: false }, { word: "sad", hit: true }, { word: "said", hit: false },
    ],
  },
  {
    key: "ʌ", ipa: "/ʌ/",
    mistakenAs: "你可能读成了拖长的「啊」,或者和 /ɑː/ 不分",
    command: "口腔放松、舌位居中,**又短又有力**地弹一下,像被撞了一下发出的「呃」。",
    why: "汉语的「啊」开口大且拖长;/ʌ/ 是短促的中央元音,拖长就变味了。",
    words: ["cup", "sun", "but"], focus: ["u", "u", "u"],
    pair: { target: "cup", confuse: "cap", confuseIpa: "/æ/" },
    findSet: [
      { word: "bus", hit: true }, { word: "bat", hit: false }, { word: "much", hit: true },
      { word: "match", hit: false }, { word: "luck", hit: true }, { word: "lack", hit: false },
    ],
  },
];
