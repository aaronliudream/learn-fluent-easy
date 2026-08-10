/**
 * 性格测评题库 —— 60 题 · 5 点李克特量表 · 中英双语。
 *
 * ═══ 为什么是这 60 题(方法学说明,改题前必读)═══════════════════════
 *
 * ① **题目来源**:主体取自 IPIP(International Personality Item Pool,
 *    Goldberg 1992/1999)的 Big-Five Factor Markers。IPIP 全部条目**公有领域**,
 *    明确允许自由使用与改编,是学术界最常用的免费人格题池,几十年重复验证。
 *    荣格四维里 IPIP 覆盖不到的部分(精力来源、具体 vs 抽象、逻辑 vs 和谐、
 *    收敛 vs 开放),按 IPIP 的行文风格自撰,句式一律「第一人称 + 具体行为」,
 *    不写「你是不是一个……的人」这种自我概念题(那种题测的是自我形象不是行为)。
 *
 * ② **平衡计分(balanced keying)**:每个量表 12 题,其中 6 题正向、6 题反向。
 *    这是防「默认赞同倾向」(acquiescence bias)的标准做法 —— 一路点「符合」
 *    的人在正反两半会互相抵消,分数自然回到中间,而不是被推向某一极。
 *    ⚠️ 加题/改题必须保持 6+6,否则整个量表出现系统性偏移。
 *
 * ③ **为什么 12 题一维**:MBTI Form M 每维 20-25 题,OEJTS 每维 8 题。
 *    12 题是可靠度(α 通常 .80+)与「答完 60 题不弃考」之间的折中。
 *
 * ④ **第 5 个量表 AT 不进四字母代码**:情绪稳定性(Big Five 的神经质维度)
 *    是荣格/MBTI 体系里**没有**的一维,但它恰恰是五因素里对幸福感、
 *    压力应对预测力最强的一维。所以单列成后缀 -A(果决)/-T(起伏),
 *    与 16Personalities 的做法一致,不混进类型字母。
 *
 * ⑤ 反向题(key: -1)计分时做 6-x 翻转,见 scoring.ts。
 */

/** 四个二分维度 + 第五维情绪稳定性(不进类型代码,只作 -A/-T 后缀)。 */
export type ScaleId = "EI" | "SN" | "TF" | "JP" | "AT";

export type PersonalityItem = {
  /** 稳定 id。⚠️ 一旦发布不要改 —— localStorage 里的旧作答按 id 存。 */
  id: string;
  scale: ScaleId;
  /** +1 = 「符合」把分数推向该量表的 A 极(E/S/T/J/A);-1 = 推向 B 极(I/N/F/P/T)。 */
  key: 1 | -1;
  en: string;
  zh: string;
};

/** 每个量表两极的字母与名称。A 极 = 高分端。 */
export const SCALE_POLES: Record<
  ScaleId,
  {
    a: string;
    b: string;
    aLabel: { zh: string; en: string };
    bLabel: { zh: string; en: string };
    /** 结果页维度标题 */
    title: { zh: string; en: string };
  }
> = {
  EI: {
    a: "E",
    b: "I",
    aLabel: { zh: "外向 Extraversion", en: "Extraversion" },
    bLabel: { zh: "内向 Introversion", en: "Introversion" },
    title: { zh: "精力从哪里来", en: "Where your energy comes from" },
  },
  SN: {
    a: "S",
    b: "N",
    aLabel: { zh: "实感 Sensing", en: "Sensing" },
    bLabel: { zh: "直觉 Intuition", en: "Intuition" },
    title: { zh: "你怎么接收信息", en: "How you take in information" },
  },
  TF: {
    a: "T",
    b: "F",
    aLabel: { zh: "思考 Thinking", en: "Thinking" },
    bLabel: { zh: "情感 Feeling", en: "Feeling" },
    title: { zh: "你怎么做决定", en: "How you make decisions" },
  },
  JP: {
    a: "J",
    b: "P",
    aLabel: { zh: "判断 Judging", en: "Judging" },
    bLabel: { zh: "感知 Perceiving", en: "Perceiving" },
    title: { zh: "你怎么安排生活", en: "How you organize your world" },
  },
  AT: {
    a: "A",
    b: "T",
    aLabel: { zh: "果决 Assertive", en: "Assertive" },
    bLabel: { zh: "起伏 Turbulent", en: "Turbulent" },
    title: { zh: "情绪的稳定程度", en: "How steady your emotions run" },
  },
};

/**
 * 60 题题库。分组书写便于核对 6+6 平衡计分;实际呈现顺序由 orderedItems() 打散。
 * 标注 [IPIP] 的是公有领域 IPIP Big-Five Markers 原句(英文原文照录),
 * 未标注的按同样风格自撰以覆盖荣格特有的对立面。
 */
export const PERSONALITY_ITEMS: PersonalityItem[] = [
  // ═══ EI · 外向 / 内向(Big Five: Extraversion)═══
  { id: "EI01", scale: "EI", key: 1, en: "Am the life of the party.", zh: "聚会上我常常是带动气氛的那个人。" }, // [IPIP]
  { id: "EI02", scale: "EI", key: 1, en: "Feel comfortable around people.", zh: "和人待在一起时我感觉自在。" }, // [IPIP]
  { id: "EI03", scale: "EI", key: 1, en: "Start conversations.", zh: "我会主动开口和别人搭话。" }, // [IPIP]
  { id: "EI04", scale: "EI", key: 1, en: "Don't mind being the center of attention.", zh: "成为大家注意的焦点，我并不觉得别扭。" }, // [IPIP]
  { id: "EI05", scale: "EI", key: 1, en: "Make friends easily.", zh: "我很容易交到新朋友。" }, // [IPIP]
  { id: "EI06", scale: "EI", key: 1, en: "Feel more energized after spending hours with a group of people.", zh: "和一群人待上几个小时之后，我反而更来劲。" },
  { id: "EI07", scale: "EI", key: -1, en: "Keep in the background.", zh: "我习惯待在不显眼的位置。" }, // [IPIP]
  { id: "EI08", scale: "EI", key: -1, en: "Am quiet around strangers.", zh: "面对陌生人时我话很少。" }, // [IPIP]
  { id: "EI09", scale: "EI", key: -1, en: "Prefer to think an idea through on my own before saying it out loud.", zh: "有想法时，我更愿意自己先想清楚再说出口。" },
  { id: "EI10", scale: "EI", key: -1, en: "Need time alone to recharge after a socially busy day.", zh: "社交了一整天之后，我需要独处才能缓过来。" },
  { id: "EI11", scale: "EI", key: -1, en: "Would rather have a few close friendships than a wide circle.", zh: "比起朋友多，我更想要几段深交。" },
  { id: "EI12", scale: "EI", key: -1, en: "Find small talk tiring.", zh: "寒暄闲聊会让我觉得累。" },

  // ═══ SN · 实感 / 直觉(Big Five: Openness–Intellect,反向)═══
  { id: "SN01", scale: "SN", key: 1, en: "Pay attention to details.", zh: "我很注意细节。" }, // [IPIP]
  { id: "SN02", scale: "SN", key: 1, en: "Trust experience and facts more than hunches.", zh: "比起直觉，我更相信经验和事实。" },
  { id: "SN03", scale: "SN", key: 1, en: "Prefer instructions that are concrete and step by step.", zh: "我喜欢一步一步、写得具体的说明。" },
  { id: "SN04", scale: "SN", key: 1, en: "Notice practical problems that other people miss.", zh: "别人没留意到的实际问题，我常常会发现。" },
  { id: "SN05", scale: "SN", key: 1, en: "Focus on what is happening now rather than on what might happen.", zh: "我更关心眼前正在发生的事，而不是可能会发生的事。" },
  { id: "SN06", scale: "SN", key: 1, en: "Have difficulty understanding abstract ideas.", zh: "抽象的概念我理解起来比较吃力。" }, // [IPIP · Intellect 反向题]
  { id: "SN07", scale: "SN", key: -1, en: "Have a vivid imagination.", zh: "我的想象力很丰富。" }, // [IPIP]
  { id: "SN08", scale: "SN", key: -1, en: "Am full of ideas.", zh: "我脑子里总冒出很多点子。" }, // [IPIP]
  { id: "SN09", scale: "SN", key: -1, en: "Spend time reflecting on things.", zh: "我常花时间琢磨事情背后的意思。" }, // [IPIP]
  { id: "SN10", scale: "SN", key: -1, en: "Love to think up new ways of doing things.", zh: "我喜欢想出做同一件事的新办法。" }, // [IPIP]
  { id: "SN11", scale: "SN", key: -1, en: "Am more interested in what something could become than in what it is now.", zh: "比起一件事现在的样子，我更好奇它可能变成什么样。" },
  { id: "SN12", scale: "SN", key: -1, en: "Often notice patterns and connections between unrelated things.", zh: "我常在看似无关的事情之间发现规律和联系。" },

  // ═══ TF · 思考 / 情感(Big Five: Agreeableness,反向)═══
  { id: "TF01", scale: "TF", key: 1, en: "Make decisions with my head rather than my heart.", zh: "做决定时我靠理智多过靠感情。" },
  { id: "TF02", scale: "TF", key: 1, en: "Point out the flaw in an argument even when it upsets people.", zh: "即使会让人不高兴，我也会指出说法里的漏洞。" },
  { id: "TF03", scale: "TF", key: 1, en: "Believe being fair matters more than being nice.", zh: "我认为公平比让人舒服更重要。" },
  { id: "TF04", scale: "TF", key: 1, en: "Stay detached when people around me are upset.", zh: "周围的人情绪激动时，我还能置身事外地想问题。" },
  { id: "TF05", scale: "TF", key: 1, en: "Am persuaded by evidence, not by how strongly someone feels.", zh: "说服我的是证据，不是别人有多在意。" },
  { id: "TF06", scale: "TF", key: 1, en: "Find it easy to give critical feedback.", zh: "给别人提批评意见对我来说不难。" },
  { id: "TF07", scale: "TF", key: -1, en: "Sympathize with others' feelings.", zh: "我能体会别人的心情。" }, // [IPIP]
  { id: "TF08", scale: "TF", key: -1, en: "Feel others' emotions.", zh: "别人的情绪我能感受得到。" }, // [IPIP]
  { id: "TF09", scale: "TF", key: -1, en: "Take time out for others.", zh: "我愿意为别人腾出时间。" }, // [IPIP]
  { id: "TF10", scale: "TF", key: -1, en: "Weigh how a decision will affect people before making it.", zh: "做决定之前，我会先想这会怎样影响到人。" },
  { id: "TF11", scale: "TF", key: -1, en: "Am bothered when there is tension in a group.", zh: "一个群体里气氛紧张时，我心里会很不舒服。" },
  { id: "TF12", scale: "TF", key: -1, en: "Know how to comfort others.", zh: "我知道怎么安慰人。" }, // [IPIP]

  // ═══ JP · 判断 / 感知(Big Five: Conscientiousness)═══
  { id: "JP01", scale: "JP", key: 1, en: "Am always prepared.", zh: "我做事总是准备充分。" }, // [IPIP]
  { id: "JP02", scale: "JP", key: 1, en: "Like order.", zh: "我喜欢井井有条。" }, // [IPIP]
  { id: "JP03", scale: "JP", key: 1, en: "Follow a schedule.", zh: "我按计划表做事。" }, // [IPIP]
  { id: "JP04", scale: "JP", key: 1, en: "Make plans and stick to them.", zh: "我定下的计划会照着做完。" }, // [IPIP]
  { id: "JP05", scale: "JP", key: 1, en: "Feel uneasy until a decision is settled.", zh: "事情没定下来之前，我心里不踏实。" },
  { id: "JP06", scale: "JP", key: 1, en: "Finish tasks well before the deadline.", zh: "我通常在截止时间之前就把事情做完了。" },
  { id: "JP07", scale: "JP", key: -1, en: "Leave my belongings around.", zh: "我的东西常常随手一放。" }, // [IPIP]
  { id: "JP08", scale: "JP", key: -1, en: "Find it difficult to get down to work.", zh: "我常常很难静下心开始做事。" }, // [IPIP]
  { id: "JP09", scale: "JP", key: -1, en: "Like to keep my options open for as long as possible.", zh: "我喜欢把选择尽量留到最后再定。" },
  { id: "JP10", scale: "JP", key: -1, en: "Work best in a last-minute rush.", zh: "越临近截止，我反而做得越好。" },
  { id: "JP11", scale: "JP", key: -1, en: "Change my plans easily when something more interesting comes up.", zh: "有更有意思的事出现，我很容易就改计划。" },
  { id: "JP12", scale: "JP", key: -1, en: "Often forget to put things back in their proper place.", zh: "我常忘了把东西放回原处。" }, // [IPIP]

  // ═══ AT · 情绪稳定性(Big Five: Neuroticism,反向)═══
  { id: "AT01", scale: "AT", key: 1, en: "Am relaxed most of the time.", zh: "大多数时候我都挺放松。" }, // [IPIP]
  { id: "AT02", scale: "AT", key: 1, en: "Am not easily bothered by things.", zh: "一般的事情不太会困扰到我。" }, // [IPIP]
  { id: "AT03", scale: "AT", key: 1, en: "Seldom feel blue.", zh: "我很少情绪低落。" }, // [IPIP]
  { id: "AT04", scale: "AT", key: 1, en: "Stay calm under pressure.", zh: "有压力的时候我仍能保持冷静。" },
  { id: "AT05", scale: "AT", key: 1, en: "Rarely second-guess a decision once I've made it.", zh: "已经做了的决定，我很少反复怀疑。" },
  { id: "AT06", scale: "AT", key: 1, en: "Am confident I can handle whatever comes up.", zh: "不管来什么事，我相信自己应付得了。" },
  { id: "AT07", scale: "AT", key: -1, en: "Get stressed out easily.", zh: "我很容易感到有压力。" }, // [IPIP]
  { id: "AT08", scale: "AT", key: -1, en: "Worry about things.", zh: "我常常担心这担心那。" }, // [IPIP]
  { id: "AT09", scale: "AT", key: -1, en: "Have frequent mood swings.", zh: "我的情绪起伏比较大。" }, // [IPIP]
  { id: "AT10", scale: "AT", key: -1, en: "Am hard on myself when I make a mistake.", zh: "做错事之后我会对自己很苛刻。" },
  { id: "AT11", scale: "AT", key: -1, en: "Care a lot about what other people think of me.", zh: "别人怎么看我，我挺在意。" },
  { id: "AT12", scale: "AT", key: -1, en: "Get overwhelmed by my emotions.", zh: "情绪一上来，我容易招架不住。" }, // [IPIP]
];

export const SCALE_ORDER: ScaleId[] = ["EI", "SN", "TF", "JP", "AT"];

/** 每个量表应有的题数(平衡计分:正向 6 + 反向 6)。 */
export const ITEMS_PER_SCALE = 12;

/**
 * 呈现顺序:五个量表轮流出题,且同一量表内正向题/反向题交替。
 *
 * 为什么不随机:① 随机顺序每次刷新都变,用户中途刷新就对不上作答缓存;
 * ② 确定性顺序可复现、可测。轮转 + 正反交替已经足够打散「连着 12 题都在问社交」
 * 造成的语境效应(context effect)与直线作答。
 */
export function orderedItems(): PersonalityItem[] {
  const buckets: Record<ScaleId, { pos: PersonalityItem[]; neg: PersonalityItem[] }> = {
    EI: { pos: [], neg: [] },
    SN: { pos: [], neg: [] },
    TF: { pos: [], neg: [] },
    JP: { pos: [], neg: [] },
    AT: { pos: [], neg: [] },
  };
  for (const item of PERSONALITY_ITEMS) {
    (item.key === 1 ? buckets[item.scale].pos : buckets[item.scale].neg).push(item);
  }
  const out: PersonalityItem[] = [];
  // 12 轮 × 5 量表 = 60 题。奇偶轮切换正/反向,量表起点每轮右移一位,
  // 避免「每一屏第一题永远是 EI」。
  for (let round = 0; round < ITEMS_PER_SCALE; round++) {
    const half = Math.floor(round / 2);
    for (let s = 0; s < SCALE_ORDER.length; s++) {
      const scale = SCALE_ORDER[(s + round) % SCALE_ORDER.length];
      const bucket = round % 2 === 0 ? buckets[scale].pos : buckets[scale].neg;
      const picked = bucket[half];
      if (picked) out.push(picked);
    }
  }
  return out;
}

/** 5 点量表的选项标签(1..5)。 */
export const LIKERT_LABELS: { value: number; zh: string; en: string; short: { zh: string; en: string } }[] = [
  { value: 1, zh: "非常不符合", en: "Very inaccurate", short: { zh: "很不符", en: "No" } },
  { value: 2, zh: "比较不符合", en: "Moderately inaccurate", short: { zh: "不太符", en: "Rather no" } },
  { value: 3, zh: "说不好 / 中立", en: "Neither accurate nor inaccurate", short: { zh: "中立", en: "Neutral" } },
  { value: 4, zh: "比较符合", en: "Moderately accurate", short: { zh: "比较符", en: "Rather yes" } },
  { value: 5, zh: "非常符合", en: "Very accurate", short: { zh: "很符合", en: "Yes" } },
];
