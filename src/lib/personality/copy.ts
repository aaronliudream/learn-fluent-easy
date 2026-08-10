/**
 * 性格测评页的界面文案(中英双语)。
 *
 * ⚠️ 这一页**不走全站 i18n**。原因:首页给的是「中文测试 / English」两个入口,
 * 用户在这一页选的语言必须和全站语言解耦(一个中文用户完全可能想做英文版),
 * 而且 60 道题 + 16 型说明走翻译 edge function 既慢又会被机器翻译磨掉语气。
 * 所以本页所有文案都是人工双语,由页面自己的 lang 状态切换。
 */

export type Lang = "zh" | "en";

type Bi = { zh: string; en: string };

export const pick = (bi: Bi, lang: Lang) => bi[lang];

export const UI = {
  pageTitle: { zh: "性格类型测评", en: "Personality Type Assessment" },
  brandLine: { zh: "Big Moon English · 免费 · 不需要注册", en: "Big Moon English · Free · No sign-up" },
  back: { zh: "返回首页", en: "Back to home" },

  // ── 介绍页 ──
  heroTitle: { zh: "你是哪一种人？", en: "Which type are you?" },
  heroSub: {
    zh: "60 道题，约 8 分钟。测完给你四字母类型（比如 ESTJ）、五个维度的具体分数，以及一份适合你的英语学习建议。",
    en: "60 questions, about 8 minutes. You'll get a four-letter type (e.g. ESTJ), scores on five dimensions, and a study plan that fits how you actually learn.",
  },
  start: { zh: "开始测试", en: "Start the test" },
  resume: { zh: "继续上次的作答", en: "Resume where you left off" },
  viewLast: { zh: "查看上次结果", en: "View my last result" },
  restart: { zh: "重新测一次", en: "Take it again" },

  whatTitle: { zh: "这份测评量什么", en: "What this measures" },
  what1: {
    zh: "四个荣格维度：精力来源（E/I）、接收信息的方式（S/N）、做决定的依据（T/F）、安排生活的方式（J/P）",
    en: "Four Jungian dimensions: energy (E/I), perception (S/N), decisions (T/F), lifestyle (J/P)",
  },
  what2: {
    zh: "第五个维度：情绪稳定性（-A 果决 / -T 起伏）。MBTI 体系里没有这一维，但它是学界公认预测力最强的一维，所以我们单独测、单独报。",
    en: "A fifth dimension: emotional stability (-A assertive / -T turbulent). MBTI has no equivalent, but it's the most predictive trait in the research — so we measure and report it separately.",
  },
  what3: {
    zh: "同一批作答同时换算成「大五人格」五因素分数——那是心理学界真正在用的模型。",
    en: "The same answers are also mapped onto the Big Five — the model psychologists actually use.",
  },

  howTitle: { zh: "怎么答才准", en: "How to answer" },
  how1: { zh: "凭第一反应答，不要斟酌太久。", en: "Go with your first reaction; don't deliberate." },
  how2: {
    zh: "答「你实际是怎样的」，不是「你希望自己是怎样的」，也不是「工作时的你」。",
    en: "Answer as you actually are — not as you'd like to be, and not as you are at work.",
  },
  how3: { zh: "尽量少选中间项，除非真的说不好。", en: "Use the middle option sparingly — only when you truly can't say." },

  methodTitle: { zh: "方法说明（点开看）", en: "Methodology (tap to expand)" },
  method1: {
    zh: "题目主体取自 IPIP（International Personality Item Pool）的大五人格标记题。IPIP 属于公有领域，是学术研究中使用最广的免费人格题池；荣格四维中 IPIP 未覆盖的部分按同样风格自撰。",
    en: "Items are drawn mainly from the International Personality Item Pool (IPIP) Big-Five Factor Markers — a public-domain, widely validated research item pool. Items covering Jungian-specific contrasts were written in the same style.",
  },
  method2: {
    zh: "每个维度 12 题，其中 6 题正向、6 题反向计分（balanced keying）。这是防止「一路点同意」把结果推向某一极的标准做法。",
    en: "Each dimension has 12 items — six positively keyed, six reverse keyed. This balanced keying is the standard defence against agreeing your way to a skewed result.",
  },
  method3: {
    zh: "分数是连续的，不是非黑即白。结果页会给出每个字母的「倾向清晰度」；低于 20% 的字母我们会明确标出来，因为它重测很可能翻面。",
    en: "Scores are continuous, not binary. The result shows a clarity index for each letter; below 20% we flag it, because a retest would likely flip it.",
  },
  method4: {
    zh: "我们没有中国人群常模，所以分数表示的是「你在这条量表上离中点多远」，不是人群百分位。任何声称给你人群排名的免费测试，都值得怀疑。",
    en: "We have no population norms, so scores show how far you sit from the scale midpoint — not a population percentile. Be sceptical of any free test that claims to rank you against the population.",
  },
  method5: {
    zh: "作答数据只存在你这台设备的浏览器里，不上传服务器，不与账号关联。",
    en: "Your answers stay in this browser only. Nothing is uploaded or tied to an account.",
  },

  // ── 答题页 ──
  progress: { zh: "已答", en: "Answered" },
  of: { zh: "共", en: "of" },
  disagree: { zh: "不符合", en: "Disagree" },
  agree: { zh: "符合", en: "Agree" },
  prev: { zh: "上一页", en: "Back" },
  next: { zh: "下一页", en: "Next" },
  seeResult: { zh: "查看结果", en: "See my result" },
  unanswered: { zh: "本页还有题没答", en: "Some questions on this page are unanswered" },
  quitConfirm: {
    zh: "作答已自动保存，下次打开可以继续。",
    en: "Your answers are saved automatically — you can pick up where you left off.",
  },

  // ── 结果页 ──
  yourType: { zh: "你的类型", en: "Your type" },
  dimensions: { zh: "四个维度的具体分数", en: "Your four dimensions" },
  emotionScale: { zh: "第五维度 · 情绪稳定性", en: "Fifth dimension · Emotional stability" },
  clarityWord: { zh: "倾向清晰度", en: "clarity" },
  bigFiveTitle: { zh: "换算成大五人格", en: "The same answers as Big Five" },
  bigFiveNote: {
    zh: "大五人格（Big Five）是目前心理学界证据最充分的人格模型。下面的分数由你这次的作答直接换算——本测的题目本来就是大五标记题，只是按荣格四维重新分组呈现。分数表示离量表中点的距离，不是人群百分位。",
    en: "The Big Five is the best-evidenced personality model in psychology. These scores come straight from your answers — the items are Big Five markers to begin with, just grouped along Jungian lines. Scores show distance from the scale midpoint, not a population percentile.",
  },
  functionsTitle: { zh: "荣格功能序（理论推导）", en: "Jungian function stack (theoretical)" },
  functionsNote: {
    zh: "由四个字母按标准规则推出，不是另外测量的。列在这里供了解荣格理论的人参考，它的实证支持弱于上面的维度分数。",
    en: "Derived from your four letters by the standard rule, not separately measured. Included for readers familiar with Jungian theory; its empirical support is weaker than the dimension scores above.",
  },
  strengthsTitle: { zh: "你的优势", en: "Your strengths" },
  watchTitle: { zh: "值得留意的地方", en: "Worth watching" },
  stressTitle: { zh: "压力之下", en: "Under stress" },
  teamTitle: { zh: "和别人合作时", en: "Working with others" },
  englishTitle: { zh: "适合你的英语学习方式", en: "How you should learn English" },
  englishBadge: { zh: "Big Moon 专有", en: "Big Moon exclusive" },

  qualityTitle: { zh: "关于这次作答", en: "About this attempt" },
  qStraight: {
    zh: "你有八成以上的题选了同一个选项。这种作答模式下分数不太能反映真实差异，建议重测一次。",
    en: "More than 80% of your answers used the same option. Scores from that pattern don't separate the dimensions well — a retake would help.",
  },
  qInconsistent: {
    zh: "同一维度的正向题和反向题答得不太一致。可能是答得太快，也可能是有些题目在不同情境下你的答案确实不同。字母结果请当作参考。",
    en: "Your answers to the positively and negatively worded items in the same dimension don't line up. That can mean speed — or that your answer genuinely depends on context. Treat the letters as indicative.",
  },
  qTooFast: {
    zh: "平均每题不到 1.5 秒，可能来不及读完题目。",
    en: "Under 1.5 seconds per item on average — probably too fast to read them.",
  },
  qGood: {
    zh: "作答模式正常：没有直线作答，正反向题一致，速度合理。",
    en: "Response pattern looks clean: no straight-lining, keyed items agree, pacing is reasonable.",
  },

  caveatTitle: { zh: "请这样看待这个结果", en: "How to hold this result" },
  caveat1: {
    zh: "四字母类型只是一个方便记忆的摘要，真实的分数是连续的。清晰度低的字母，换一天测很可能变成另一个。",
    en: "The four-letter type is a convenient summary; the real scores are continuous. A letter with low clarity may well come out differently on another day.",
  },
  caveat2: {
    zh: "类型不是能力，也不是命运。它描述的是你倾向于怎么做，不是你能做到什么。任何说「你这个类型不适合做 X」的说法都不成立。",
    en: "Type is not ability and not destiny. It describes what you tend to do, not what you can do. Nobody can tell you your type is unsuited to some job.",
  },
  caveat3: {
    zh: "MBTI 类型体系在学术界争议很大（主要问题是重测稳定性和「把连续分数切成两半」）。本测把连续分数和大五结果都摆出来，就是为了让你不只看到那四个字母。",
    en: "The MBTI-style type system is genuinely contested in academia — mainly over retest stability and cutting continuous scores in half. We show the continuous scores and the Big Five precisely so the four letters aren't all you see.",
  },
  caveat4: {
    zh: "不要用它做招聘、分班或任何影响别人处境的决定。",
    en: "Don't use it for hiring, streaming students, or any decision that affects someone else's situation.",
  },

  copyResult: { zh: "复制结果", en: "Copy result" },
  copied: { zh: "已复制", en: "Copied" },
  goStudy: { zh: "去学英语", en: "Start learning English" },
  savedNote: { zh: "结果已保存在本机浏览器，下次打开还能看到。", en: "Saved in this browser — it'll still be here next time." },
} satisfies Record<string, Bi>;
