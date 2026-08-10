/**
 * 16 型人格说明文案(中英双语)。
 *
 * ★写作准则(改文案前先读)★
 * ① **不写谄媚的通用话**。「你既外向又需要独处」「你有未被发掘的潜力」这类
 *    对谁都成立的句子叫 Barnum 陈述,是性格测试最常见的骗术。本文件里的每一条
 *    都必须是「换成另一个类型就不成立」的具体描述。
 * ② **每个类型都要写盲点**,而且写得和优点一样具体。只夸不说的报告没有用。
 * ③ **englishTip 是本站独有的一段**:把类型特征落到「这个人怎么学英语最省力」,
 *    这是我们和通用性格网站的区别 —— 也是用户看完之后真能用上的一句。
 * ④ 描述的是**倾向**不是能力上限。禁止出现「你不适合……」「你做不到……」。
 */

export type Bi = { zh: string; en: string };

export type TypeProfile = {
  code: string;
  nickname: Bi;
  tagline: Bi;
  summary: Bi;
  strengths: Bi[];
  watchOuts: Bi[];
  stress: Bi;
  teamwork: Bi;
  englishTip: Bi;
};

export const TYPE_PROFILES: Record<string, TypeProfile> = {
  ISTJ: {
    code: "ISTJ",
    nickname: { zh: "务实执行者", en: "The Inspector" },
    tagline: { zh: "答应下来的事，一定办到", en: "If I said I'd do it, it's done" },
    summary: {
      zh: "你靠事实和先例做判断，不靠感觉。别人还在讨论方向的时候，你已经在想具体谁做、什么时候交。你对承诺极其认真，也因此对随口答应又不兑现的人很难有好感。",
      en: "You judge by facts and precedent, not by mood. While others are still debating direction, you're already asking who does what by when. You treat a promise as binding — and find it hard to respect people who don't.",
    },
    strengths: [
      { zh: "记得住细节，也记得住别人答应过什么", en: "Remembers the details — and what people committed to" },
      { zh: "把混乱的事情整理成可执行的步骤", en: "Turns a mess into an ordered set of steps" },
      { zh: "在长期、重复、需要准确的工作上极其可靠", en: "Extremely dependable on long, repetitive, accuracy-critical work" },
      { zh: "压力下不慌，按既定流程稳住局面", en: "Doesn't panic under pressure; falls back on process and holds the line" },
    ],
    watchOuts: [
      { zh: "「以前就是这么做的」有时会挡住更好的做法", en: "\"That's how we've always done it\" can block a better way" },
      { zh: "对临时变卦反应过激，其实只是需要提前几天知会", en: "Reacts hard to last-minute changes — often all you needed was earlier notice" },
      { zh: "把关心藏在「帮你把事办妥」里，别人可能收不到", en: "Shows care by getting things done; people may not read it as care" },
    ],
    stress: {
      zh: "压力大时容易钻进细节里出不来，反复检查已经做完的部分。",
      en: "Under stress you burrow into detail, re-checking work that was already finished.",
    },
    teamwork: {
      zh: "适合当项目里的「兜底的人」；和天马行空的搭档配合最好，但要先约好截止时间。",
      en: "You're the one who catches what falls. You pair well with big-picture types — as long as deadlines are agreed up front.",
    },
    englishTip: {
      zh: "你适合有明确进度条的学法：固定时间、固定题量、看得见完成度。语法规则和词表对你是加分项，别人觉得枯燥的系统学习恰恰是你的主场。薄弱点通常在「开口」——给自己排一个每周固定的口语时段，当成任务打卡，比等到「想说了再说」有效得多。",
      en: "You do best with a visible progress bar: fixed time, fixed quantity, measurable completion. Grammar rules and word lists play to your strength. Your weak spot is usually speaking — schedule it as a recurring task rather than waiting until you feel ready.",
    },
  },
  ISFJ: {
    code: "ISFJ",
    nickname: { zh: "守护者", en: "The Defender" },
    tagline: { zh: "别人还没开口，你已经准备好了", en: "Already handled, before you asked" },
    summary: {
      zh: "你记得每个人的偏好、忌口和心事，并且会不动声色地把它们照顾到。你不争功，但一旦你负责的部分出问题，你会比任何人都自责。",
      en: "You remember what people prefer, avoid, and worry about — and quietly work around it. You don't compete for credit, but you take it hardest when something you were responsible for goes wrong.",
    },
    strengths: [
      { zh: "对人的需求敏感，且真的会去做，不只是共情", en: "Notices what people need and actually acts on it" },
      { zh: "细致、有耐心，重复性的照料工作做得又久又好", en: "Patient and meticulous; sustains caring work over the long haul" },
      { zh: "记忆里存着大量具体的人和事，判断有依据", en: "Carries a deep store of concrete memories to reason from" },
      { zh: "让团队里的人觉得安全", en: "Makes the people around you feel safe" },
    ],
    watchOuts: [
      { zh: "很难说「不」，最后把自己排到最后一位", en: "Struggles to say no, and ends up last in your own queue" },
      { zh: "冲突面前先退让，事后又憋着不说", en: "Backs down from conflict, then quietly resents it" },
      { zh: "低估自己的贡献，别人也就跟着低估了", en: "Undersells your contribution — so others do too" },
    ],
    stress: {
      zh: "压力大时会反复回想「是不是我哪里做得不够」，情绪往内收。",
      en: "Under stress you replay \"was that my fault?\" and turn inward.",
    },
    teamwork: {
      zh: "是团队的黏合剂；需要队友主动问你的意见，因为你不会抢着说。",
      en: "You're the glue. Teammates need to ask for your view — you won't push it forward yourself.",
    },
    englishTip: {
      zh: "你在「为具体的人学」时动力最强：给孩子读绘本、帮朋友看邮件、准备一次真实的对话。抽象的分数目标对你效果一般。建议找一个固定搭档一起学，你对别人的承诺比对自己的更有约束力。",
      en: "You learn best when there's a real person on the other end — reading to a child, helping a friend with an email, preparing for a real conversation. Abstract score targets motivate you less. Find a study partner: a promise to someone else binds you more than a promise to yourself.",
    },
  },
  INFJ: {
    code: "INFJ",
    nickname: { zh: "洞察者", en: "The Advocate" },
    tagline: { zh: "我看得到它可以变成什么样", en: "I can see what this could become" },
    summary: {
      zh: "你对人和情境有一种说不清出处的判断力，而且事后常被证明是对的。你在意的不是「有没有用」，而是「这件事对不对」。你话不多，但一旦认定方向，会安静而固执地走很久。",
      en: "You form judgments about people and situations you can't fully explain — and they often turn out right. What drives you isn't usefulness but whether something is right. You say little, but once you've settled on a direction you pursue it quietly and stubbornly.",
    },
    strengths: [
      { zh: "能看见别人没说出口的动机和长期后果", en: "Reads unspoken motives and long-range consequences" },
      { zh: "把复杂的想法讲成别人能懂的话", en: "Translates complex ideas into language people can hold" },
      { zh: "价值感强，能长期为一件事投入", en: "Value-driven; sustains commitment over years" },
    ],
    watchOuts: [
      { zh: "对自己和别人都要求太高，容易失望", en: "Sets a bar so high that disappointment is built in" },
      { zh: "把感受攒着不说，攒到一次性关掉一段关系", en: "Stores feelings unspoken, then shuts a relationship down all at once" },
      { zh: "想得太久才动手，错过窗口", en: "Deliberates so long that the window closes" },
    ],
    stress: {
      zh: "压力大时会突然变得刻薄或沉迷琐事，那是过载的信号而不是本性。",
      en: "Under stress you may turn uncharacteristically sharp, or fixate on trivia — that's overload, not character.",
    },
    teamwork: {
      zh: "适合定方向和把关意义；需要有人帮你把想法落成日程。",
      en: "You're best at setting direction and guarding meaning; you need someone to turn the vision into a calendar.",
    },
    englishTip: {
      zh: "你不适合背孤立的词表，适合从「有分量的内容」进入英语：一本原著、一场演讲、一个你真正关心的议题。先看懂意思，词汇自然会跟上。要小心的是完美主义——允许自己带着错误开口，否则你会一直准备、迟迟不说。",
      en: "Isolated word lists bore you; enter English through content that matters to you — a novel, a talk, an issue you care about. Meaning first, vocabulary follows. Watch the perfectionism: let yourself speak with mistakes, or you'll prepare forever and never start.",
    },
  },
  INTJ: {
    code: "INTJ",
    nickname: { zh: "策略家", en: "The Architect" },
    tagline: { zh: "先把系统想清楚，再动手", en: "Get the system right, then execute" },
    summary: {
      zh: "你习惯往后站一步，看整个结构怎么运转，然后找出最省力的那个改动点。你对「因为大家都这么做」几乎没有耐心，只认逻辑和证据。",
      en: "You step back, see how the whole system works, and look for the single change with the most leverage. \"Because everyone does it this way\" carries no weight with you — only logic and evidence do.",
    },
    strengths: [
      { zh: "长线规划能力强，能为几年后的目标现在就动手", en: "Plans long; will act today for a payoff years out" },
      { zh: "独立，不需要别人推动也能持续推进", en: "Self-propelled; doesn't need external momentum" },
      { zh: "敢于放弃沉没成本，换更优的路径", en: "Willing to abandon sunk costs for a better route" },
    ],
    watchOuts: [
      { zh: "过早断定别人「想不明白」，于是懒得解释", en: "Writes people off as slow, then stops explaining" },
      { zh: "计划做得太完备，反而迟迟不开始", en: "Over-plans to the point of not starting" },
      { zh: "忽略情绪成本，把「对的方案」推得太硬", en: "Discounts emotional cost and pushes the correct plan too hard" },
    ],
    stress: {
      zh: "压力大时会退回到「我一个人做完算了」，切断协作。",
      en: "Under stress you retreat into \"I'll just do it all myself\" and cut off collaboration.",
    },
    teamwork: {
      zh: "适合当架构师和质疑者；配一个愿意做人际沟通的搭档，效率翻倍。",
      en: "You're the architect and the challenger. Pair with someone who handles the human side and you double your output.",
    },
    englishTip: {
      zh: "你适合「先建框架再填内容」：先花两周把语法体系和词根系统吃透，再海量输入，效率远高于零散刷题。别把英语当成需要天赋的技能，它是一个可拆解的系统，这正是你的强项。风险在于你会一直优化学习方法却不真正开口——给自己设死线。",
      en: "Build the frame first: spend two weeks mastering the grammar system and word roots, then flood yourself with input. Don't treat English as a talent — it's a decomposable system, which is exactly your strength. The risk: endlessly optimizing your method instead of speaking. Set a hard deadline.",
    },
  },
  ISTP: {
    code: "ISTP",
    nickname: { zh: "拆解者", en: "The Virtuoso" },
    tagline: { zh: "别解释了，我拆开看看", en: "Don't explain it — let me take it apart" },
    summary: {
      zh: "你靠动手理解世界。理论听十遍不如自己试一次。你在突发状况里出奇地冷静，别人慌的时候你在观察哪里能撬动。",
      en: "You understand things by handling them — one attempt teaches you more than ten explanations. In an emergency you're oddly calm, scanning for the lever while everyone else panics.",
    },
    strengths: [
      { zh: "上手快，工具和机制一摸就懂", en: "Picks up tools and mechanisms almost immediately" },
      { zh: "危机中冷静，能就地做出可行方案", en: "Calm in a crisis; improvises something that works" },
      { zh: "不被面子和情绪绑架，就事论事", en: "Not hostage to face or feelings; deals with what's in front of you" },
    ],
    watchOuts: [
      { zh: "对没兴趣的事直接不投入，显得敷衍", en: "Simply doesn't engage with what bores you — reads as indifference" },
      { zh: "重要的话不说，等到别人误会了才觉得麻烦", en: "Leaves important things unsaid until the misunderstanding costs you" },
      { zh: "长期承诺让你本能想跑", en: "Long-term commitments trigger an instinct to bolt" },
    ],
    stress: {
      zh: "压力大时会突然情绪爆发，或干脆消失一阵子。",
      en: "Under stress you either snap suddenly or simply disappear for a while.",
    },
    teamwork: {
      zh: "适合救火和技术攻坚；不适合被塞进冗长的例会。",
      en: "Great for firefighting and hard technical problems; wasted in long recurring meetings.",
    },
    englishTip: {
      zh: "别再看语法书了。你适合「用中学」：把手机系统换成英文、跟着视频做点什么、玩英文版游戏。你需要的是即时反馈和真实用途，纯记忆的任务你三天就会放弃。口语反而可能是你最快突破的部分。",
      en: "Stop reading grammar books. Learn by using: switch your phone to English, follow along with how-to videos, play games in English. You need immediate feedback and real use — pure memorization loses you in three days. Speaking may well be your fastest-improving skill.",
    },
  },
  ISFP: {
    code: "ISFP",
    nickname: { zh: "生活艺术家", en: "The Adventurer" },
    tagline: { zh: "我不说，但我很清楚自己要什么", en: "I don't announce it, but I know what I want" },
    summary: {
      zh: "你对美感、氛围、分寸有极敏锐的直觉，而且不太用语言解释。你看起来随和，实际上内心有一条很硬的底线，触碰了就不会再回头。",
      en: "You have a fine instinct for aesthetics, atmosphere and what's appropriate — and rarely put it into words. You seem easygoing, but there's a hard line inside; cross it and you don't come back.",
    },
    strengths: [
      { zh: "审美和手感好，做出来的东西有质感", en: "Real taste and touch; what you make has quality" },
      { zh: "活在当下，能真正享受眼前的事", en: "Present-focused; genuinely enjoys what's in front of you" },
      { zh: "不评判别人，让人放松", en: "Non-judgmental; people relax around you" },
    ],
    watchOuts: [
      { zh: "回避冲突到宁可自己吃亏", en: "Avoids conflict even at your own expense" },
      { zh: "长期目标容易被当下的感觉带偏", en: "Long-term goals get overridden by how today feels" },
      { zh: "被否定时反应很大，但表现为沉默", en: "Criticism lands hard — and shows up as silence" },
    ],
    stress: {
      zh: "压力大时会突然对自己做严厉的负面评价。",
      en: "Under stress you turn a harsh, sweeping verdict on yourself.",
    },
    teamwork: {
      zh: "在氛围好、被信任的小团队里发挥最好；不吃高压管理那一套。",
      en: "Thrives in a small, trusting team with good atmosphere; high-pressure management backfires.",
    },
    englishTip: {
      zh: "你适合从喜欢的东西进入：歌词、剧集、旅行、料理。把英语和感官体验绑在一起，你记得又快又牢。计划表对你没什么用，改成「今天想学什么就学什么，但每天都碰一下」，坚持率反而更高。",
      en: "Enter through what you love: lyrics, shows, travel, food. Tie English to sensory experience and it sticks fast. Rigid schedules don't work for you — \"study whatever appeals today, but touch it every day\" keeps you going far longer.",
    },
  },
  INFP: {
    code: "INFP",
    nickname: { zh: "理想主义者", en: "The Mediator" },
    tagline: { zh: "我得先相信它是对的", en: "I have to believe in it first" },
    summary: {
      zh: "你的判断标准来自内心的价值感，而不是外部的规则或收益。对不认同的事，你可以一动不动；对认定的事，你会拿出让人意外的韧性。",
      en: "Your standard comes from an inner sense of what's right, not from rules or payoff. You can be immovable about things you don't believe in — and surprisingly tenacious about the ones you do.",
    },
    strengths: [
      { zh: "语言和想象力强，善于表达细腻的感受", en: "Strong with language and imagination; articulates fine shades of feeling" },
      { zh: "对人真诚，能看见别人身上的可能性", en: "Sincere with people; sees the potential in them" },
      { zh: "在意义感支撑下能长期坚持", en: "Sustains effort for a long time when the meaning holds" },
    ],
    watchOuts: [
      { zh: "理想与现实的落差容易变成自我消耗", en: "The gap between ideal and real turns into self-erosion" },
      { zh: "拖延起于「还没想清楚意义」，不是懒", en: "Procrastination comes from unresolved meaning, not laziness" },
      { zh: "批评会被放大成对整个人的否定", en: "Criticism inflates into a verdict on your whole self" },
    ],
    stress: {
      zh: "压力大时会变得异常挑剔和执着于细节，那是失衡的信号。",
      en: "Under stress you become uncharacteristically nitpicky and detail-obsessed — a sign of imbalance.",
    },
    teamwork: {
      zh: "适合做内容、写作、一对一沟通；需要队友帮你守住截止日期。",
      en: "Strong at content, writing and one-to-one work; you need teammates to hold the deadline for you.",
    },
    englishTip: {
      zh: "写作和阅读是你的天然优势，先把它们做到很好，再用它们撑起口语的信心。选材要选你真的想读的东西——被强迫读的材料你会读不下去。用英文写日记是最适合你的练习，没有观众，也不用怕说错。",
      en: "Reading and writing are your natural edge — build them high first, then let them carry your speaking confidence. Choose material you actually want to read; forced material you will abandon. Keeping a diary in English suits you perfectly: no audience, no fear of mistakes.",
    },
  },
  INTP: {
    code: "INTP",
    nickname: { zh: "分析者", en: "The Logician" },
    tagline: { zh: "等一下，这个定义有问题", en: "Hold on — that definition doesn't hold" },
    summary: {
      zh: "你享受把一个概念拆到底层的过程，哪怕它眼下没有用。你对不严谨的说法本能地不舒服，会忍不住纠正——包括纠正自己。",
      en: "You enjoy taking a concept down to its foundations, useful or not. Sloppy reasoning makes you physically uncomfortable and you can't help correcting it — including your own.",
    },
    strengths: [
      { zh: "抽象思维强，能发现别人看不到的逻辑漏洞", en: "Strong abstraction; spots holes others don't see" },
      { zh: "不受权威影响，敢于独立下判断", en: "Unmoved by authority; judges independently" },
      { zh: "对感兴趣的领域能自学到很深", en: "Self-teaches to real depth in areas that grip you" },
    ],
    watchOuts: [
      { zh: "想得多做得少，项目停在「还没完全想明白」", en: "Thinks more than you ship; projects stall at \"not fully worked out yet\"" },
      { zh: "纠正别人的措辞，把讨论带偏", en: "Corrects wording and derails the actual discussion" },
      { zh: "对日常事务(账单、约定时间)容易失守", en: "Loses the thread on mundane logistics — bills, times, admin" },
    ],
    stress: {
      zh: "压力大时会情绪失控地爆发，因为情绪平时被搁在一边没处理。",
      en: "Under stress emotions erupt disproportionately — they'd been shelved rather than processed.",
    },
    teamwork: {
      zh: "适合当「先别急，这里有个问题」的角色；需要队友把你的想法推上线。",
      en: "You're the \"wait, there's a problem here\" voice. You need teammates who ship your ideas.",
    },
    englishTip: {
      zh: "语言学、词源、语法的底层逻辑会让你上瘾，这是好事——用它当入口。但要警惕：你可能把研究英语当成了学英语。给自己定个硬性比例，比如 1 小时研究规则，就必须配 3 小时真实听说读写。",
      en: "Etymology, linguistics and the deep logic of grammar will hook you — use that as your entry point. But beware: studying English is not learning English. Set a hard ratio — one hour on rules buys three hours of real listening, speaking, reading and writing.",
    },
  },
  ESTP: {
    code: "ESTP",
    nickname: { zh: "行动派", en: "The Entrepreneur" },
    tagline: { zh: "先干起来，边做边调", en: "Start now, adjust on the move" },
    summary: {
      zh: "你在真实的、正在发生的事情里最清醒。会议上你会打断空谈问「所以具体怎么做」。风险对你不是威胁，是信息不足的状态。",
      en: "You're sharpest in live, moving situations. In meetings you cut through the abstractions with \"so what do we actually do?\" Risk isn't a threat to you — it's just missing information.",
    },
    strengths: [
      { zh: "反应快，临场判断准", en: "Fast reactions; good calls in the moment" },
      { zh: "有说服力，能把人带动起来", en: "Persuasive; gets people moving" },
      { zh: "不怕犯错，试错速度快", en: "Unafraid of mistakes; iterates quickly" },
    ],
    watchOuts: [
      { zh: "决定太快，后果留给别人收拾", en: "Decides fast and leaves the cleanup to others" },
      { zh: "重复性的事情坚持不下来", en: "Can't sustain anything repetitive" },
      { zh: "低估长期积累的价值", en: "Undervalues slow accumulation" },
    ],
    stress: {
      zh: "压力大时会陷入过度悲观的空想，跟平时判若两人。",
      en: "Under stress you slide into gloomy hypotheticals — unrecognizable from your usual self.",
    },
    teamwork: {
      zh: "适合开局和攻坚；把收尾和文档交给别人。",
      en: "Best at kickoff and breakthrough; hand off the closing and the documentation.",
    },
    englishTip: {
      zh: "你学得最快的场景是「必须用」：出国点餐、跟老外打游戏、直接和人对话。传统的背单词你撑不过一周，别硬撑。把学习拆成 10 分钟一段、有输赢有反馈的形式，比如限时问答和游戏化练习。",
      en: "You learn fastest when you must use it: ordering abroad, gaming with strangers, talking to actual people. Word-list drilling won't last you a week — don't force it. Chop practice into ten-minute chunks with scores and feedback.",
    },
  },
  ESFP: {
    code: "ESFP",
    nickname: { zh: "点亮气氛的人", en: "The Entertainer" },
    tagline: { zh: "在场的人开心，事情才做得下去", en: "If the room's alive, the work follows" },
    summary: {
      zh: "你对气氛和人的状态极其敏感，也乐于成为让场子活起来的人。你活在当下，享受具体的、看得见摸得着的快乐，对沉重的长期规划本能地想绕开。",
      en: "You're highly tuned to atmosphere and to how people are doing, and happy to be the one who lifts the room. You live in the present, enjoy concrete pleasures, and instinctively route around heavy long-term planning.",
    },
    strengths: [
      { zh: "让人放松，很快建立信任", en: "Puts people at ease and builds trust fast" },
      { zh: "现场应变能力强", en: "Adapts on the spot" },
      { zh: "行动力强，不纠结就先做", en: "Acts without agonizing" },
    ],
    watchOuts: [
      { zh: "回避不愉快的事，拖到不能再拖", en: "Avoids the unpleasant until it can't be avoided" },
      { zh: "容易被别人的情绪带走", en: "Gets swept along by other people's moods" },
      { zh: "计划做了不执行", en: "Makes plans and doesn't follow them" },
    ],
    stress: {
      zh: "压力大时会突然钻牛角尖，反复分析一件小事的逻辑。",
      en: "Under stress you get stuck over-analyzing the logic of something small.",
    },
    teamwork: {
      zh: "是团队的能量来源；需要有人替你守住进度和细节。",
      en: "You're the team's energy source; someone else needs to hold schedule and detail.",
    },
    englishTip: {
      zh: "把英语放进社交里：找语伴、参加口语角、跟着剧集配音。你在有人看着、有互动的场合学得最快，一个人对着书本会很快走神。听说先行，读写慢慢补。",
      en: "Put English inside your social life: language partners, conversation clubs, dubbing along with a show. You learn fastest with people watching and reacting; alone with a book you drift. Lead with listening and speaking; let reading and writing catch up.",
    },
  },
  ENFP: {
    code: "ENFP",
    nickname: { zh: "可能性探索者", en: "The Campaigner" },
    tagline: { zh: "等等，我又想到一个更好的", en: "Wait — I've got an even better one" },
    summary: {
      zh: "你脑子里同时开着很多扇窗，随时能把两件不相干的事连起来。你对人有真实的好奇，能很快和陌生人聊到深处。难的是收尾——新点子总比旧承诺更有吸引力。",
      en: "You keep many windows open at once and connect unrelated things instinctively. You're genuinely curious about people and get deep with strangers fast. The hard part is finishing — a new idea always outshines an old commitment.",
    },
    strengths: [
      { zh: "创意密度高，能给团队打开思路", en: "High idea density; opens up a team's thinking" },
      { zh: "感染力强，能让人相信一件事值得做", en: "Infectious; makes people believe something is worth doing" },
      { zh: "适应变化，环境一变就能重新出发", en: "Adapts fast; restarts easily when things change" },
    ],
    watchOuts: [
      { zh: "开了很多头，完成率低", en: "Starts a lot, finishes little" },
      { zh: "答应得太快，后来发现排不下", en: "Says yes too fast, then can't fit it in" },
      { zh: "热情退潮时会怀疑自己是不是三分钟热度", en: "When the enthusiasm ebbs you doubt your own staying power" },
    ],
    stress: {
      zh: "压力大时会突然变得刻板挑剔，或纠缠在小细节上。",
      en: "Under stress you turn rigid and picky, or get tangled in small details.",
    },
    teamwork: {
      zh: "适合启动阶段和对外沟通；一定要有人接手执行。",
      en: "Best at launch and outward-facing work; make sure someone owns execution.",
    },
    englishTip: {
      zh: "你的问题从来不是「学不进去」，而是换得太勤。定一个「只用一套材料撑过 30 天」的规则，把新鲜感留给内容而不是方法。你的口语上限很高——大胆说，说错也不影响你，这是天赋，用足它。",
      en: "Your problem was never engagement — it's switching too often. Make a rule: one set of materials for 30 days, and let novelty come from content, not method. Your speaking ceiling is high — mistakes don't faze you, which is a real gift. Use it.",
    },
  },
  ENTP: {
    code: "ENTP",
    nickname: { zh: "挑战者", en: "The Debater" },
    tagline: { zh: "如果反过来想呢？", en: "But what if it's the other way round?" },
    summary: {
      zh: "你享受把一个共识翻过来看背面。辩论对你不是冲突，是思考方式。你能在很短时间里找到一个方案的所有漏洞——包括你自己刚提出的那个。",
      en: "You enjoy flipping a consensus over to see its underside. Debate isn't conflict to you, it's how you think. You can find every hole in a proposal in minutes — including one you just made yourself.",
    },
    strengths: [
      { zh: "思维敏捷，能快速生成多个方案", en: "Quick; generates several options fast" },
      { zh: "不怕挑战权威和惯例", en: "Unafraid to challenge authority and convention" },
      { zh: "跨领域联想能力强", en: "Connects across domains" },
    ],
    watchOuts: [
      { zh: "为了辩而辩，赢了道理输了关系", en: "Argues for sport; wins the point and loses the person" },
      { zh: "兴趣转移快，深度不够", en: "Interest moves on before depth arrives" },
      { zh: "常规维护类的工作会被你搁置", en: "Routine maintenance work quietly stalls" },
    ],
    stress: {
      zh: "压力大时会陷入过度自省和情绪化，跟平时的自信判若两人。",
      en: "Under stress you fall into brooding and emotionality — the opposite of your usual confidence.",
    },
    teamwork: {
      zh: "适合当「压力测试者」；配一个耐心的执行者最有效。",
      en: "You're the stress-tester. Pair with a patient executor.",
    },
    englishTip: {
      zh: "辩论、播客、观点类文章是你的最佳材料——你需要「有得反驳」的内容。纯语法练习会让你无聊到放弃。建议直接进入高强度输入，遇到不懂的再回头补规则，你能承受这种混乱。",
      en: "Debates, podcasts and opinion pieces are your best material — you need something to argue with. Pure grammar drills will bore you into quitting. Jump straight into heavy input and backfill the rules when you hit a wall; you can tolerate that mess.",
    },
  },
  ESTJ: {
    code: "ESTJ",
    nickname: { zh: "组织者", en: "The Executive" },
    tagline: { zh: "谁负责？什么时候交？", en: "Who owns it, and when is it due?" },
    summary: {
      zh: "你天然会把混乱变成秩序：定规则、分工、订时间表。你不回避做决定，也不介意做不受欢迎的决定。别人觉得你强势，实际上你只是受不了事情悬着。",
      en: "You turn chaos into order by reflex: set the rules, assign the work, fix the dates. You don't avoid decisions, including unpopular ones. People read you as forceful; really you just can't stand things left hanging.",
    },
    strengths: [
      { zh: "执行力强，说了就落地", en: "Executes; what you say happens" },
      { zh: "责任感强，扛得住事", en: "Takes responsibility and carries weight" },
      { zh: "能把一群人组织起来往一个方向走", en: "Gets a group aligned and moving the same way" },
    ],
    watchOuts: [
      { zh: "对效率的要求会压过对人的照顾", en: "Efficiency can override care for people" },
      { zh: "不容易接受「先试试看」的模糊方案", en: "Struggles with vague \"let's try and see\" proposals" },
      { zh: "把不同意见听成不服从", en: "Hears disagreement as insubordination" },
    ],
    stress: {
      zh: "压力大时会突然情绪化或感到被孤立，因为你很少表达需要。",
      en: "Under stress you may become uncharacteristically emotional or feel isolated — you rarely voice needs.",
    },
    teamwork: {
      zh: "天生的项目负责人；刻意给创意型队友留出「还没成型」的空间。",
      en: "A natural project owner; deliberately leave room for creative teammates to be half-formed.",
    },
    englishTip: {
      zh: "给自己一个明确的目标和期限（比如「三个月内考到 X 分」「半年后能开一场英文会」），你的完成率会远高于平均。注意别只挑能量化的部分练——语感和口语没有分数，却决定你真正能不能用。每周固定安排一次没有评分的自由对话。",
      en: "Give yourself an explicit target and deadline (\"score X in three months\", \"run a meeting in English by June\") and your completion rate will beat almost everyone's. Just don't practice only the measurable parts — feel for the language and speaking carry no score but decide whether you can actually use it. Book one ungraded free conversation a week.",
    },
  },
  ESFJ: {
    code: "ESFJ",
    nickname: { zh: "凝聚者", en: "The Consul" },
    tagline: { zh: "大家都还好吗？", en: "Is everyone okay?" },
    summary: {
      zh: "你把人际关系当成需要认真经营的事，也确实经营得很好。你记得住谁在什么时候需要帮忙，并且会主动补位。被需要对你不是负担，是意义来源。",
      en: "You treat relationships as something to be actively tended — and you tend them well. You remember who needs what and step in unprompted. Being needed isn't a burden to you; it's where meaning comes from.",
    },
    strengths: [
      { zh: "组织活动、协调人际的能力突出", en: "Excellent at organizing people and occasions" },
      { zh: "可靠、守约，别人愿意托付", en: "Reliable and punctual; people trust you with things" },
      { zh: "能敏锐察觉团队里的情绪暗流", en: "Senses the emotional undercurrent in a group" },
    ],
    watchOuts: [
      { zh: "太在意别人的评价，做决定时被牵着走", en: "Cares so much about approval that it steers your decisions" },
      { zh: "把付出记在心里，久了变成委屈", en: "Keeps a private ledger of giving that curdles into resentment" },
      { zh: "对打破规矩的人反应偏严厉", en: "Comes down hard on people who break the norms" },
    ],
    stress: {
      zh: "压力大时会退回去反复分析「他那句话什么意思」。",
      en: "Under stress you retreat into re-reading what someone meant by that one remark.",
    },
    teamwork: {
      zh: "团队的运转中枢；要提醒自己「不是所有事都得你来接」。",
      en: "You're the hub the team runs through — remind yourself you don't have to catch everything.",
    },
    englishTip: {
      zh: "群体学习对你最有效：班级、学习小组、固定的语伴。有人一起你几乎不会掉队。注意别把时间都花在照顾别人的进度上——每周留两次只为自己的学习时间，关掉消息。",
      en: "Group learning works best for you: a class, a study group, a regular partner. With others around you rarely fall behind. Just don't spend it all managing everyone else's pace — protect two sessions a week that are only yours, notifications off.",
    },
  },
  ENFJ: {
    code: "ENFJ",
    nickname: { zh: "引路人", en: "The Protagonist" },
    tagline: { zh: "我知道你可以做到", en: "I know what you're capable of" },
    summary: {
      zh: "你能看见别人身上还没长出来的部分，并且愿意花力气帮他们长出来。你说话有感染力，容易成为一群人的中心。代价是：你太习惯照顾别人的感受，常常不知道自己想要什么。",
      en: "You see what hasn't grown in someone yet, and you'll spend real effort helping it grow. You speak with warmth and end up at the center of groups. The cost: you're so practiced at reading others that your own wants get blurry.",
    },
    strengths: [
      { zh: "带人能力强，能让人变得更好", en: "Develops people; they get better around you" },
      { zh: "沟通有温度也有方向", en: "Communicates with both warmth and direction" },
      { zh: "能把不同的人凝聚到一个目标上", en: "Unites different people behind one goal" },
    ],
    watchOuts: [
      { zh: "过度投入别人的人生，忽略自己的", en: "Over-invests in other people's lives and neglects your own" },
      { zh: "被辜负时会受伤很深", en: "Takes betrayal very hard" },
      { zh: "为了维持和谐而回避必要的冲突", en: "Avoids necessary conflict to keep the peace" },
    ],
    stress: {
      zh: "压力大时会突然变得冷淡挑剔，或对细节吹毛求疵。",
      en: "Under stress you can turn cool and critical, or start nitpicking detail.",
    },
    teamwork: {
      zh: "适合带团队和对外沟通；要允许自己说「这件事我不接」。",
      en: "Strong at leading and representing a team; let yourself say \"I'm not taking this one.\"",
    },
    englishTip: {
      zh: "「教是最好的学」对你尤其成立：把学到的东西讲给别人听，你的吸收率会翻倍。可以带一个学习小组，或者干脆给孩子/同事讲课。弱点是容易只练输出不补输入——每周固定读一点难度略高于你水平的材料。",
      en: "\"Teach it to learn it\" is unusually true for you: explaining what you learned doubles retention. Run a study group, or teach a colleague. The trap is output without input — read something slightly above your level every week.",
    },
  },
  ENTJ: {
    code: "ENTJ",
    nickname: { zh: "指挥者", en: "The Commander" },
    tagline: { zh: "目标定了，路我来铺", en: "Target set — I'll build the road" },
    summary: {
      zh: "你看到低效就想改，看到无人负责就想接手。你能同时握住长期目标和当下的执行细节，并且推动力极强。别人跟不上你的节奏时，你的耐心会消耗得很快。",
      en: "You see inefficiency and want to fix it; you see an ownerless problem and take it. You hold the long-range goal and the near-term detail at once, and you push hard. When people can't keep your pace, your patience burns fast.",
    },
    strengths: [
      { zh: "决策果断，能承担后果", en: "Decides quickly and owns the consequences" },
      { zh: "战略眼光与执行力兼备", en: "Combines strategic view with real execution" },
      { zh: "能识别并调动合适的人", en: "Spots the right people and mobilizes them" },
    ],
    watchOuts: [
      { zh: "推进太急，队友只剩执行没有参与", en: "Pushes so fast that teammates execute without participating" },
      { zh: "把情绪需求当成效率的阻碍", en: "Treats emotional needs as friction" },
      { zh: "不容易承认判断失误", en: "Slow to admit a misjudgment" },
    ],
    stress: {
      zh: "压力大时会独自陷入低落和自我怀疑，但不让人看见。",
      en: "Under stress you sink into private low moods and self-doubt, out of sight.",
    },
    teamwork: {
      zh: "适合定目标和推进度；刻意留出让人反对你的机会。",
      en: "Best at setting targets and driving pace; deliberately create room for people to push back.",
    },
    englishTip: {
      zh: "把英语当成一个有 KPI 的项目来做，你会做得很好：明确用途（谈判？演讲？考试？），反推所需能力，只练那部分。别追求「全面掌握」，那是效率最低的路。给自己安排真实的高压场景（真做一次英文汇报），进步会比刷一年题快。",
      en: "Run English as a project with KPIs and you'll do well: define the use (negotiation? presentation? exam?), work backwards to the skills required, and train only those. Don't chase \"complete mastery\" — it's the least efficient path. Put yourself in a real high-stakes situation (actually give that English presentation); it beats a year of drills.",
    },
  },
};

export function profileOf(type: string): TypeProfile {
  return TYPE_PROFILES[type] ?? TYPE_PROFILES.ISTJ;
}
