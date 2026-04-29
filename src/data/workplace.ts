// Auto-generated from Bay Area Workplace English source.
// Workplace English (湾区职场英语) — full dialogue dataset.
export type WorkLine = { speaker: string; en: string; cn: string };
export type WorkDialogue = {
  id: string;
  cat: string;
  catName: string;
  catEmoji: string;
  title: string;
  titleCn: string;
  emoji: string;
  lines: WorkLine[];
};

export type WorkGroup = {
  key: string;
  emoji: string;
  name: string;
  cats: { key: string; emoji: string; name: string; nameEn: string; desc: string }[];
};

export const WORK_GROUPS: WorkGroup[] = [
  {
    key: 'core', emoji: '💼', name: '职场核心',
    cats: [
      { key: 'meetings',   emoji: '💬', name: '会议',   nameEn: 'Meetings',     desc: '冲刺·跨部门·全员·启动·复盘' },
      { key: 'oneonone',   emoji: '👥', name: '一对一', nameEn: '1:1s',         desc: '与经理·反馈·成长规划' },
      { key: 'review',     emoji: '📝', name: '评审',   nameEn: 'Reviews',      desc: '设计评审·代码评审·绩效' },
    ],
  },
  {
    key: 'social', emoji: '💬', name: '社交与挑战',
    cats: [
      { key: 'daily',      emoji: '🫖', name: '日常',   nameEn: 'Daily Chat',   desc: '茶水间·闲聊·破冰' },
      { key: 'interview',  emoji: '🎯', name: '面试',   nameEn: 'Interviews',   desc: '行为·系统设计·谈薪' },
      { key: 'tough',      emoji: '⚡', name: '高难度', nameEn: 'Tough Talks',  desc: '冲突·拒绝·裁员沟通' },
    ],
  },
  {
    key: 'business', emoji: '📈', name: '业务部门',
    cats: [
      { key: 'finance',    emoji: '💰', name: '财务',   nameEn: 'Finance',      desc: '预算·报销·审计' },
      { key: 'procurement',emoji: '📦', name: '采购',   nameEn: 'Procurement',  desc: '询价·合同·供应商' },
      { key: 'sales',      emoji: '📈', name: '销售',   nameEn: 'Sales',        desc: '客户·演示·成单' },
    ],
  },
  {
    key: 'tech', emoji: '⚙️', name: '技术与生产',
    cats: [
      { key: 'engineering',emoji: '💻', name: '工程',   nameEn: 'Engineering',  desc: '需求·排期·上线' },
      { key: 'manufacturing', emoji: '🏭', name: '生产', nameEn: 'Manufacturing', desc: '产线·良率·QA' },
      { key: 'warehouse',  emoji: '🏬', name: '仓库',   nameEn: 'Warehouse',    desc: '出入库·盘点·物流' },
      { key: 'product',    emoji: '🔬', name: '产品',   nameEn: 'Product',      desc: '需求·路线图·用研' },
    ],
  },
];

export const WORK_CATEGORIES = WORK_GROUPS.flatMap(g => g.cats);

export const WORK_DIALOGUES: WorkDialogue[] = [
  {
    "id": "w1",
    "cat": "meetings",
    "catName": "会议",
    "catEmoji": "💬",
    "title": "Sprint Planning",
    "titleCn": "冲刺计划会议",
    "emoji": "👩🏻‍💼",
    "lines": [
      {
        "speaker": "Sarah",
        "en": "Alright everyone, let's get this show on the road. Quick note — we're timeboxed to 45 minutes, so let's stay focused.",
        "cn": "好，我们开始吧。提醒一下，我们只有45分钟，保持专注。"
      },
      {
        "speaker": "Alex",
        "en": "Sounds good. Before we dive in — I still have a blocker from last sprint. The design assets never landed in our repo.",
        "cn": "好的。正式开始之前，我有个上个Sprint遗留的阻碍——设计资源一直没上传到仓库。"
      },
      {
        "speaker": "Jordan",
        "en": "That was on me. I got pulled into a last-minute rebrand. I'll make sure the handoff happens today — sorry for the delay.",
        "cn": "那是我的失误。我被临时拉去做品牌重设计了。今天我会确保交接完成，抱歉拖延了。"
      },
      {
        "speaker": "Sarah",
        "en": "Appreciate the transparency, Jordan. Alex, does that unblock you for this sprint?",
        "cn": "感谢你坦诚说明，Jordan。Alex，这样你这个Sprint就能解除阻碍了吗？"
      },
      {
        "speaker": "Alex",
        "en": "Yeah, as long as I have the assets by EOD, I'm good to go. I'll take point on the checkout flow.",
        "cn": "是的，只要今天下班前能拿到资源就没问题。我来负责结账流程这块。"
      },
      {
        "speaker": "Jordan",
        "en": "Consider it done. Also — heads up — stakeholders want a demo Friday. Can we make that happen?",
        "cn": "包在我身上。另外提醒一下，利益相关方想在周五看演示，我们能做到吗？"
      },
      {
        "speaker": "Sarah",
        "en": "That's tight, but doable if we prioritize ruthlessly. Let's put a pin in the feature requests and ship what actually matters.",
        "cn": "时间很紧，但只要我们果断取舍就能做到。先搁置功能需求，上线真正重要的东西。"
      },
      {
        "speaker": "Alex",
        "en": "Agreed. I'll open a ticket and loop in Priya so she's in the loop on any scope changes.",
        "cn": "同意。我来开个ticket，把Priya也拉进来，让她了解范围调整情况。"
      }
    ]
  },
  {
    "id": "w2",
    "cat": "oneonone",
    "catName": "一对一",
    "catEmoji": "👥",
    "title": "Promotion Talk",
    "titleCn": "晋升谈话",
    "emoji": "👩🏻‍💼",
    "lines": [
      {
        "speaker": "Alex",
        "en": "Thanks for making time for this. I wanted to touch base about my career trajectory here.",
        "cn": "谢谢你抽时间过来。我想和你聊聊我在这里的职业发展方向。"
      },
      {
        "speaker": "Sarah",
        "en": "Of course. I've been meaning to have this conversation too. You've been crushing it lately.",
        "cn": "当然，我也一直想和你谈这个。你最近表现非常出色。"
      },
      {
        "speaker": "Alex",
        "en": "I appreciate that. I feel like I'm ready to level up. I've been leading projects end-to-end and mentoring two junior engineers.",
        "cn": "谢谢你这么说。我觉得已经准备好晋升了。我一直在端到端地主导项目，还在指导两名初级工程师。"
      },
      {
        "speaker": "Sarah",
        "en": "You're right — your scope has expanded significantly. What does the next level look like to you?",
        "cn": "你说得对，你的工作范围确实扩大了很多。你眼中的下一个级别是什么样的？"
      },
      {
        "speaker": "Alex",
        "en": "I want to drive larger initiatives and have more visibility across the org. I've already started putting together a case.",
        "cn": "我想主导更大的项目，在整个组织中有更多曝光机会。我已经在整理晋升材料了。"
      },
      {
        "speaker": "Sarah",
        "en": "Smart. Let's make sure your work is visible to the right people. I'll advocate for you in the calibration meeting.",
        "cn": "很好。我们要确保合适的人能看到你的成果。我会在校准会议上为你发声。"
      },
      {
        "speaker": "Alex",
        "en": "That means a lot. Is there anything I should be doing before the review cycle to strengthen my case?",
        "cn": "这对我非常重要。在考核周期之前有什么具体的事情我应该做来强化晋升依据吗？"
      },
      {
        "speaker": "Sarah",
        "en": "Get some high-visibility wins and make sure peers can speak to your impact. Cross-functional collaboration is a big one.",
        "cn": "争取一些曝光度高的成果，确保同事能够证明你的影响力。跨部门协作是很重要的一点。"
      }
    ]
  },
  {
    "id": "w3",
    "cat": "review",
    "catName": "评审",
    "catEmoji": "📝",
    "title": "Design Review: Pushback",
    "titleCn": "设计评审：礼貌反对",
    "emoji": "🧑🏼‍🎨",
    "lines": [
      {
        "speaker": "Jordan",
        "en": "Alright, here's the new checkout flow I mocked up. I think it really simplifies the UX.",
        "cn": "好，这是我做的新结账流程原型。我觉得它大大简化了用户体验。"
      },
      {
        "speaker": "Mike",
        "en": "I like the direction, but I want to flag something from a technical standpoint. That animation runs on the main thread — it'll tank performance on older devices.",
        "cn": "我喜欢这个方向，但我想从技术角度提个问题。那个动画在主线程上运行，会严重影响旧设备性能。"
      },
      {
        "speaker": "Jordan",
        "en": "Fair point. Is that a hard blocker, or more of a nice-to-have fix?",
        "cn": "说得对。这是必须解决的阻碍，还是有更好？"
      },
      {
        "speaker": "Mike",
        "en": "Not a hard blocker, but I'd push back on shipping it as-is. We'd be accruing tech debt we'll regret.",
        "cn": "不是硬性阻碍，但我反对就这样上线。会积累我们以后会后悔的技术债务。"
      },
      {
        "speaker": "Alex",
        "en": "I hear you both. Could we ship the flow itself and take the animation offline for now? Best of both worlds.",
        "cn": "我理解你们的意思。我们能不能先上线流程，暂时去掉动画？这样两全其美。"
      },
      {
        "speaker": "Jordan",
        "en": "I can live with that as a short-term solution. But I don't want it to get deprioritized and never ship.",
        "cn": "作为短期方案我可以接受。但我不想让它一拖再拖，最后永远不上线了。"
      },
      {
        "speaker": "Mike",
        "en": "Let's timebox it — two sprints. I'll own the animation refactor. We document it so it doesn't get lost in the shuffle.",
        "cn": "我们给它定个期限——两个Sprint。我来负责动画重构。记录下来别让它在混乱中被遗忘。"
      },
      {
        "speaker": "Alex",
        "en": "Works for me. Jordan, can you update the design spec to reflect the interim state?",
        "cn": "我同意。Jordan，你能更新设计文档，体现目前的过渡状态吗？"
      }
    ]
  },
  {
    "id": "w4",
    "cat": "daily",
    "catName": "日常",
    "catEmoji": "🫖",
    "title": "Monday Kitchen Chat",
    "titleCn": "周一茶水间闲聊",
    "emoji": "👨🏻‍💻",
    "lines": [
      {
        "speaker": "Mike",
        "en": "Hey Alex! How was your weekend? Do anything fun?",
        "cn": "嘿，Alex！周末怎么样？有没有做什么有趣的事？"
      },
      {
        "speaker": "Alex",
        "en": "It was great, actually — I finally hiked the Dipsea Trail. Totally wiped me out, but so worth it.",
        "cn": "还不错，我终于去徒步了Dipsea Trail。整个人都累垮了，但非常值得。"
      },
      {
        "speaker": "Mike",
        "en": "No way, that trail is brutal! Good on you. What about you, Priya?",
        "cn": "不会吧，那条路可真够狠的！不错啊。你呢，Priya？"
      },
      {
        "speaker": "Priya",
        "en": "We took the kids to the Academy of Sciences. Honestly? I needed it more than they did — completely recharged.",
        "cn": "我们带孩子去了科学院。说真的，那次充电对我来说比对他们更有意义，满血复活了。"
      },
      {
        "speaker": "Mike",
        "en": "Ha, same energy. I just decompressed all Sunday — zero plans, zero screens.",
        "cn": "哈，感同身受。我周日就纯粹放空了——零计划，零屏幕。"
      },
      {
        "speaker": "Alex",
        "en": "Living the dream. Alright, back to the grind. It's going to be a big week for all of us.",
        "cn": "这就是理想生活。好了，继续努力工作。对我们所有人来说都是很重要的一周。"
      },
      {
        "speaker": "Priya",
        "en": "For real. Let's make it count. Catch you guys at standup!",
        "cn": "确实。我们好好干。站会见！"
      }
    ]
  },
  {
    "id": "w5",
    "cat": "tough",
    "catName": "高难度",
    "catEmoji": "⚡",
    "title": "Navigating a Reorg",
    "titleCn": "应对组织重构",
    "emoji": "🧑🏼‍🎨",
    "lines": [
      {
        "speaker": "Jordan",
        "en": "Hey, do you have five minutes? That all-hands was a lot to process.",
        "cn": "嘿，你有五分钟吗？那个全员大会信息量太大了，需要消化一下。"
      },
      {
        "speaker": "Alex",
        "en": "Yeah, jumping on a quick Zoom. Between us — I'm trying to read the tea leaves on what this means for our team.",
        "cn": "当然，上个快速Zoom。私下说——我在揣摩这对我们团队意味着什么。"
      },
      {
        "speaker": "Jordan",
        "en": "Same. Leadership loves vague language during restructuring. \"Synergies\" and \"streamlining\" are never good signs.",
        "cn": "我也是。领导层在重组期间喜欢用模糊语言。「协同效应」和「精简」从来不是好兆头。"
      },
      {
        "speaker": "Sarah",
        "en": "Hey, I just hopped on. I wanted to address the elephant in the room — I know everyone is anxious right now.",
        "cn": "嘿，我刚加进来了。我想直接说说大家都在想的问题——我知道大家现在都很焦虑。"
      },
      {
        "speaker": "Alex",
        "en": "Appreciate you being straight with us. Should we be worried about our headcount?",
        "cn": "谢谢你直接跟我们说。我们需要担心我们团队的人员编制吗？"
      },
      {
        "speaker": "Sarah",
        "en": "Honest answer: I don't have full visibility yet. What I can tell you is our team's work is high-impact, and that counts for a lot.",
        "cn": "实话实说：我目前也没有完整信息。我能告诉你的是，我们团队的工作影响力很大，这现在非常重要。"
      },
      {
        "speaker": "Jordan",
        "en": "Best move is to keep our heads down and keep delivering. Hard to argue with results.",
        "cn": "最好的策略就是埋头苦干，持续产出。结果说话，很难被质疑。"
      },
      {
        "speaker": "Sarah",
        "en": "Exactly. Weather the storm, focus on what we control. I'll keep you in the loop as things develop.",
        "cn": "完全正确。坚持度过这段时期，专注于我们能控制的事。有新进展我会及时告诉你们。"
      }
    ]
  },
  {
    "id": "w6",
    "cat": "interview",
    "catName": "面试",
    "catEmoji": "🎯",
    "title": "Final Round Interview",
    "titleCn": "终面",
    "emoji": "👩🏽‍💼",
    "lines": [
      {
        "speaker": "Emma",
        "en": "Thanks for coming in today, Alex. To kick things off — tell me about yourself and what drew you to this role.",
        "cn": "感谢你今天来面试，Alex。我们先从这里开始——介绍一下你自己，以及是什么让你对这个职位感兴趣。"
      },
      {
        "speaker": "Alex",
        "en": "Sure! I've spent four years as a full-stack engineer at a B2B SaaS company, where I owned the core payments infrastructure end-to-end.",
        "cn": "当然！过去四年我一直是一家B2B SaaS公司的全栈工程师，负责端到端地主导核心支付基础设施。"
      },
      {
        "speaker": "Emma",
        "en": "Interesting. Can you walk me through a time you made a high-stakes technical decision under tight deadlines?",
        "cn": "有意思。能给我讲一个在时间紧迫的情况下做出高风险技术决策的经历吗？"
      },
      {
        "speaker": "Alex",
        "en": "Absolutely. We had a critical security vulnerability disclosed 48 hours before a major client demo. I had to triage, patch, and run full QA — all without derailing the demo.",
        "cn": "当然可以。在重要客户演示前48小时发现了严重安全漏洞。我必须分类处理、打补丁、跑QA，同时不影响演示进行。"
      },
      {
        "speaker": "Emma",
        "en": "How did you handle the pressure? Were there tradeoffs you had to navigate?",
        "cn": "你是如何应对压力的？有没有需要权衡取舍的地方？"
      },
      {
        "speaker": "Alex",
        "en": "Definitely. I made a judgment call to deploy a partial fix rather than a full refactor — and documented the tech debt clearly so the team could address it post-launch.",
        "cn": "当然有。我做了一个判断：部署局部修复而不是完整重构——并清楚记录了技术债务，让团队在上线后处理。"
      },
      {
        "speaker": "Emma",
        "en": "That's exactly the kind of ownership we look for. Last question — what's your biggest growth area right now?",
        "cn": "这正是我们寻求的主人翁精神。最后一个问题——你目前最大的成长空间在哪里？"
      },
      {
        "speaker": "Alex",
        "en": "I want to develop my ability to influence without authority — driving outcomes across teams where I don't have direct control but still need to align people.",
        "cn": "我想提升无职权影响力的能力——在没有直接控制权的跨团队环境中仍然能推动结果、凝聚共识。"
      }
    ]
  },
  {
    "id": "f1",
    "cat": "finance",
    "catName": "财务",
    "catEmoji": "💰",
    "title": "Budget Review Meeting",
    "titleCn": "预算审查会议",
    "emoji": "👩🏻‍💼",
    "lines": [
      {
        "speaker": "Sarah",
        "en": "Alright team, let's <b>dive into</b> Q2 numbers. Mike, what's your take on the variance we're seeing in OpEx?",
        "cn": "好的，大家。让我们深入了解第二季度的数字。迈克，你对我们在运营支出中看到的差异有什么看法？"
      },
      {
        "speaker": "Mike",
        "en": "Yeah, so we're <b>running way over</b> on travel and software licenses. It's honestly <b>a bit of a mess</b> right now.",
        "cn": "是的，我们在差旅和软件许可证上花费过多。坦白说，现在有点混乱。"
      },
      {
        "speaker": "Chen",
        "en": "Have you guys <b>dug into</b> which departments are the <b>biggest offenders</b>? Marketing or Sales?",
        "cn": "你们有没有深入了解哪些部门是最大的违规者？市场营销还是销售？"
      },
      {
        "speaker": "Sarah",
        "en": "Good question. Chen, can you pull that breakdown? I need to see where we're <b>bleeding money</b>.",
        "cn": "好问题。陈，你能拉出那个分析吗？我需要看看我们在哪里浪费金钱。"
      },
      {
        "speaker": "Mike",
        "en": "<b>Fair warning</b>—Sales approved a bunch of conferences without checking with us first. That's a solid thirty grand right there.",
        "cn": "公平地说——销售部批准了一些会议，事先没有咨询我们。这就是三万块。"
      },
      {
        "speaker": "Chen",
        "en": "Ouch. So we're <b>in the red</b> on that line item. Do we have any <b>contingency</b> left in the budget?",
        "cn": "天哪。所以我们在那个项目上超支了。我们预算中还有应急资金吗？"
      },
      {
        "speaker": "Sarah",
        "en": "We <b>burned through</b> most of it in Q1, to be honest. Look, here's what we're gonna do—everyone's getting a <b>hard freeze</b> on hiring and discretionary spend effective immediately.",
        "cn": "说实话，我们在第一季度用完了大部分。听着，这是我们要做的——从现在起，每个人在招聘和自主支出上都有严格冻结。"
      },
      {
        "speaker": "Mike",
        "en": "A hard freeze? That's <b>gonna hurt</b>. We've got three open positions we need to fill.",
        "cn": "严格冻结？这会很痛苦。我们有三个需要填补的空缺职位。"
      },
      {
        "speaker": "Sarah",
        "en": "I hear you, but we need to <b>tighten our belts</b> or we'll <b>miss our targets</b> for the year. Can you <b>make do</b> with contractors instead?",
        "cn": "我理解你，但我们需要勒紧裤腰带，否则我们会在年度目标中失败。你能用承包商代替吗？"
      },
      {
        "speaker": "Chen",
        "en": "Actually, Sarah, there's another <b>wrinkle</b> here. The Accounts Receivable numbers look soft. We might have <b>cash flow</b> issues if those invoices don't get paid.",
        "cn": "实际上，莎拉，这里还有另一个复杂情况。应收账款数字看起来不稳定。如果这些发票没有得到支付，我们可能会有现金流问题。"
      },
      {
        "speaker": "Sarah",
        "en": "OK, that's <b>not ideal</b>. Are we talking about <b>a specific customer</b> or is this across the board?",
        "cn": "好的，这不太理想。我们是在谈论一个具体客户，还是普遍存在？"
      },
      {
        "speaker": "Chen",
        "en": "Mostly Alpha Corp. They're <b>dragging their feet</b> on payment. Been sixty days now.",
        "cn": "主要是阿尔法公司。他们在付款上拖拖拉拉。现在已经六十天了。"
      },
      {
        "speaker": "Mike",
        "en": "Alpha Corp? <b>That's a whole other issue</b>. They always pay late. We should have <b>baked in</b> that assumption from day one.",
        "cn": "阿尔法公司？这是完全另一回事。他们总是晚付。我们应该从第一天就考虑到这一点。"
      },
      {
        "speaker": "Sarah",
        "en": "Yeah, lesson learned. Let's <b>circle back</b> on the cash flow piece. Can you guys <b>forecast out</b> what we need for the next ninety days?",
        "cn": "是的，吸取教训。让我们回到现金流问题。你们能预测未来九十天我们需要什么吗？"
      },
      {
        "speaker": "Chen",
        "en": "Absolutely. I'll <b>put together</b> a cash position report by Friday. But Sarah, we might need to <b>tap into</b> our credit line if this keeps up.",
        "cn": "当然。我会在周五整理一份现金头寸报告。但莎拉，如果这种情况继续下去，我们可能需要动用我们的信用额度。"
      },
      {
        "speaker": "Sarah",
        "en": "Don't do that unless we absolutely have to. Let's see the forecast first. Mike, in the meantime, can you <b>reach out</b> to Sales and tell them the <b>jig is up</b> on unchecked spending?",
        "cn": "除非我们绝对必须这样做，否则不要这样做。让我们先看看预测。迈克，同时，你能联系销售部，告诉他们不受约束的支出已经暴露了吗？"
      },
      {
        "speaker": "Mike",
        "en": "<b>Copy that</b>. I'll have a chat with their VP. Trust me, they won't be thrilled, but they'll get it.",
        "cn": "明白。我会和他们的副总裁谈谈。相信我，他们不会高兴，但他们会理解。"
      },
      {
        "speaker": "Sarah",
        "en": "Good. And let's all <b>touch base</b> next week to see where we stand. This is tight, but we've been through worse.",
        "cn": "好的。让我们都在下周接触一下，看看我们现在的情况。情况紧张，但我们经历过更糟的。"
      },
      {
        "speaker": "Chen",
        "en": "One more thing—should we <b>flag</b> this to the CFO, or <b>hold off</b> until we have the forecast?",
        "cn": "还有一件事——我们应该向首席财务官标记这个，还是等我们有了预测再说？"
      },
      {
        "speaker": "Sarah",
        "en": "Let's <b>loop in</b> the CFO once we have more data. No point in <b>freaking her out</b> before we know the full picture.",
        "cn": "一旦我们有了更多数据，就让首席财务官参与进来。在我们了解全貌之前，没有必要让她惊恐。"
      }
    ]
  },
  {
    "id": "f2",
    "cat": "finance",
    "catName": "财务",
    "catEmoji": "💰",
    "title": "Month-End Close",
    "titleCn": "月末结账",
    "emoji": "👩🏻‍💼",
    "lines": [
      {
        "speaker": "Lisa",
        "en": "OK people, we're in <b>the final stretch</b> here. <b>Month-end close</b> is tomorrow at midnight, and we're still <b>in the weeds</b>.",
        "cn": "好的，各位，我们在最后冲刺阶段。月末结账明天午夜，我们仍然陷入困境。"
      },
      {
        "speaker": "David",
        "en": "Tell me about it. I've been <b>hammering away</b> at the <b>reconciliations</b> all day. The credit card statement doesn't match our books.",
        "cn": "不用说了。我整天都在努力处理对账。信用卡对账单与我们的账簿不匹配。"
      },
      {
        "speaker": "Jamie",
        "en": "How far <b>off</b> are we talking? A few bucks or a real problem?",
        "cn": "差多远？几块钱还是真正的问题？"
      },
      {
        "speaker": "David",
        "en": "It's like twelve grand. That's definitely <b>not chump change</b>. I've <b>gone through</b> every transaction twice.",
        "cn": "大约一万二。这肯定不是小钱。我已经检查过每笔交易两次。"
      },
      {
        "speaker": "Lisa",
        "en": "OK, that's <b>concerning</b>. David, can you <b>pull the audit trail</b>? We need to figure out <b>what went sideways</b>.",
        "cn": "好的，这令人担忧。大卫，你能拉出审计跟踪吗？我们需要弄清楚出了什么问题。"
      },
      {
        "speaker": "David",
        "en": "Already on it. My guess is a <b>duplicate charge</b> or the timing difference between when we booked it and when the card statement captured it.",
        "cn": "已经在做了。我的猜测是重复收费或我们预订时间和信用卡对账单记录时间之间的时间差。"
      },
      {
        "speaker": "Jamie",
        "en": "Do we need to <b>accrue</b> for anything else? I noticed we didn't get the utility bill in yet.",
        "cn": "我们还需要预提什么吗？我注意到我们还没有收到公用事业账单。"
      },
      {
        "speaker": "Lisa",
        "en": "Good catch, Jamie. We need to <b>make an estimate</b> for that. Let's use last month's number as the <b>baseline</b>. What was it, around three K?",
        "cn": "很好的抓住，杰米。我们需要为此做一个估计。让我们使用上个月的数字作为基准。大约三千吗？"
      },
      {
        "speaker": "Jamie",
        "en": "Closer to 3.2, but yeah, we can use that. I'll <b>reverse it out</b> next month once the actual bill comes in.",
        "cn": "接近3.2，但是的，我们可以使用它。一旦实际账单到达，我下个月会将其反冲销。"
      },
      {
        "speaker": "David",
        "en": "<b>Standard practice</b>. Speaking of which, did anyone <b>chase down</b> the bonus accrual from HR? We need those numbers to <b>close the books</b>.",
        "cn": "标准做法。说到这一点，有没有人追踪了HR的奖金预提？我们需要这些数字来结账。"
      },
      {
        "speaker": "Lisa",
        "en": "I sent them like three emails. <b>No dice</b>. I'll try calling them first thing in the morning.",
        "cn": "我给他们发了大约三封邮件。没有成功。我明早会首先尝试给他们打电话。"
      },
      {
        "speaker": "Jamie",
        "en": "If they don't get back to you, we might have to <b>push the close</b> into next week. That's not ideal, but I don't want to <b>fudge the numbers</b>.",
        "cn": "如果他们不回复你，我们可能必须将结账推迟到下周。这不太理想，但我不想篡改数字。"
      },
      {
        "speaker": "David",
        "en": "Agreed. <b>Cooking the books</b> is not happening on my watch. We'll <b>do this by the book</b>.",
        "cn": "同意。在我的监督下不会发生做假账。我们会按规则行动。"
      },
      {
        "speaker": "Lisa",
        "en": "OK, here's the game plan. David, you <b>nail down</b> that credit card issue by end of day. Jamie, can you <b>prep</b> the <b>trial balance</b>?",
        "cn": "好的，这是计划。大卫，到今天结束时确定那个信用卡问题。杰米，你能准备试算表吗？"
      },
      {
        "speaker": "Jamie",
        "en": "<b>On it</b>. What about the <b>cutoff</b> for revenue? We need to make sure we've got the right stuff in this month and next month.",
        "cn": "好的。收入的截止日期如何？我们需要确保这个月和下个月有正确的东西。"
      },
      {
        "speaker": "Lisa",
        "en": "Right. That's usually a <b>nightmare</b> at <b>month-end</b>. Let me <b>check with</b> the sales team on any deals that <b>came through</b> in the last few days.",
        "cn": "对。这通常是月末的噩梦。让我与销售团队核实最后几天是否有任何交易成交。"
      },
      {
        "speaker": "David",
        "en": "Also, we should <b>look at</b> the <b>reserve account</b>. I think the CFO wanted us to <b>account for</b> the potential write-down.",
        "cn": "另外，我们应该查看准备金账户。我认为首席财务官希望我们计入潜在的减值。"
      },
      {
        "speaker": "Jamie",
        "en": "Oh man, I almost forgot about that. <b>That's a lot of money</b>. What's the number?",
        "cn": "哦天哪，我几乎忘记了。这是一大笔钱。数字是多少？"
      },
      {
        "speaker": "Lisa",
        "en": "We're talking 50K at minimum. It's not <b>set in stone</b> yet, but we should <b>be conservative</b> and book it.",
        "cn": "我们说的至少是5万。还不是最终决定，但我们应该保守起见并记录它。"
      },
      {
        "speaker": "David",
        "en": "Alright, I'll <b>wrap up</b> the credit card thing and help Jamie with the trial balance. We'll <b>get this done</b> by tomorrow morning.",
        "cn": "好的，我会完成信用卡的事情，并帮助杰米处理试算表。我们明早会完成这个。"
      }
    ]
  },
  {
    "id": "f3",
    "cat": "finance",
    "catName": "财务",
    "catEmoji": "💰",
    "title": "Expense Report Issues",
    "titleCn": "费用报告问题",
    "emoji": "👩🏻‍💼",
    "lines": [
      {
        "speaker": "Jennifer",
        "en": "Guys, we have a situation. I've got a <b>stack of expense reports</b> here that are <b>all over the place</b>.",
        "cn": "各位，我们有个问题。我有一堆费用报告，完全一团糟。"
      },
      {
        "speaker": "Marcus",
        "en": "What do you mean, <b>all over the place</b>? Are they missing receipts or something?",
        "cn": "你是什么意思，完全一团糟？他们缺少收据还是什么？"
      },
      {
        "speaker": "Jennifer",
        "en": "OK so Marcus's report from the Chicago trip—there's a 450-dollar bar tab that <b>doesn't add up</b>. He claims it's a client dinner, but there's no client listed.",
        "cn": "好的，所以马库斯的芝加哥出差报告——有一个450美元的酒吧账单，不匹配。他声称这是客户晚宴，但没有列出客户。"
      },
      {
        "speaker": "Alex",
        "en": "Yeah, that <b>doesn't fly</b>. We need to know who he was entertaining. That's <b>standard policy</b>.",
        "cn": "是的，那不符合规定。我们需要知道他在招待谁。那是标准政策。"
      },
      {
        "speaker": "Jennifer",
        "en": "Exactly. And then there's your report, Alex. You've got a hotel room for three nights, but you only said you were there for two days.",
        "cn": "完全正确。然后是你的报告，亚历克斯。你有三晚的酒店房间，但你只说你在那里两天。"
      },
      {
        "speaker": "Alex",
        "en": "Oh, I arrived early and needed to stay the night before. That was <b>on my own dime</b>, though.",
        "cn": "哦，我提前到达，需要前一晚住宿。不过那是我自己付的。"
      },
      {
        "speaker": "Jennifer",
        "en": "If it's on your own dime, you shouldn't <b>submit it</b>. That's the whole point.",
        "cn": "如果是你自己付的，你就不应该提交它。那是重点。"
      },
      {
        "speaker": "Marcus",
        "en": "Wait, so I'm confused. Is the issue that I'm claiming personal meals as business, or is it that the receipt is <b>sketchy</b>?",
        "cn": "等等，我很困惑。问题是我把个人餐费作为商务费用，还是收据看起来可疑？"
      },
      {
        "speaker": "Jennifer",
        "en": "Both, honestly. Look, I get it—you guys <b>go the extra mile</b> for clients. But we have to <b>play by the rules</b> or we'll get <b>flagged</b> in the next audit.",
        "cn": "说实话，两者都有。看，我理解——你们为客户付出了额外的努力。但我们必须遵守规则，否则在下次审计中会被标记。"
      },
      {
        "speaker": "Alex",
        "en": "So what do we do? Do I just not get reimbursed for my own hotel night?",
        "cn": "那么我们怎么办？我就不能因为自己的酒店夜间被报销吗？"
      },
      {
        "speaker": "Jennifer",
        "en": "Yeah, that's how it works. If it's personal, it doesn't come out of the company expense budget. <b>No hard feelings</b>, but that's the <b>bottom line</b>.",
        "cn": "是的，就是这样。如果是个人，就不会从公司费用预算中扣除。没有任何怨言，但那是底线。"
      },
      {
        "speaker": "Marcus",
        "en": "OK, so about that bar tab. Can I just <b>put down</b> the names of the clients I was with and <b>resubmit</b> the report?",
        "cn": "好的，关于那个酒吧账单。我能否只是记下与我一起的客户的名字并重新提交报告？"
      },
      {
        "speaker": "Jennifer",
        "en": "If the clients were actually there, yeah. But if you're <b>making up</b> names, that's a whole different ball game.",
        "cn": "如果客户确实在那里，是的。但如果你编造名字，那就完全不同了。"
      },
      {
        "speaker": "Alex",
        "en": "Is there any <b>wiggle room</b> on the policy, or is it totally <b>set in stone</b>?",
        "cn": "政策有任何回旋余地吗，还是完全固定？"
      },
      {
        "speaker": "Jennifer",
        "en": "Look, the policy exists for a reason. If we make exceptions for every person, the whole system <b>falls apart</b>. I <b>get the sense</b> you guys understand that.",
        "cn": "看，政策存在是有原因的。如果我们为每个人都做出异常，整个系统就会崩溃。我感觉你们理解这一点。"
      },
      {
        "speaker": "Marcus",
        "en": "You're right. I'll <b>clean up</b> my submission. If I actually had clients there, I should have written that down on the spot.",
        "cn": "你说得对。我会清理我的提交。如果我确实有客户在那里，我应该当场写下来。"
      },
      {
        "speaker": "Alex",
        "en": "And I'll just <b>eat the cost</b> on my extra hotel night. It's only like 150 bucks, so <b>no big deal</b>.",
        "cn": "我会承担我额外酒店夜间的成本。只是大约150块，没什么大不了的。"
      },
      {
        "speaker": "Jennifer",
        "en": "I appreciate it, guys. This stuff <b>goes by the wayside</b> sometimes, but we gotta <b>keep it tight</b>. Going forward, just <b>keep your receipts</b> and make notes when you submit.",
        "cn": "我很感谢，各位。有时候这些东西会被忽视，但我们必须保持紧凑。今后，只需保留你的收据并在提交时做笔记。"
      },
      {
        "speaker": "Marcus",
        "en": "Will do. Actually, is there a template or checklist we should use to avoid these issues in the future?",
        "cn": "好的。实际上，我们应该使用模板或清单来避免将来出现这些问题吗？"
      },
      {
        "speaker": "Jennifer",
        "en": "That's a good call. Let me <b>put together</b> a quick guide and send it around. It'll save us both a lot of headaches.",
        "cn": "这是个好想法。让我整理一份快速指南并发送。这会为我们双方省去很多麻烦。"
      }
    ]
  },
  {
    "id": "f4",
    "cat": "finance",
    "catName": "财务",
    "catEmoji": "💰",
    "title": "Cash Flow Planning",
    "titleCn": "现金流规划",
    "emoji": "👩🏻‍💼",
    "lines": [
      {
        "speaker": "Rachel",
        "en": "Alright team, we need to <b>map out</b> the next quarter. Cash is <b>tight</b> right now, and I need to understand what's coming down the pipeline.",
        "cn": "好的，团队，我们需要规划下一个季度。现金现在很紧张，我需要了解管道中即将发生什么。"
      },
      {
        "speaker": "Tom",
        "en": "Yeah, we're not in great shape. Our <b>accounts receivable</b> is <b>dragging</b>, and <b>accounts payable</b> is <b>due soon</b>.",
        "cn": "是的，我们处于不太好的状况。我们的应收账款在拖延，应付账款即将到期。"
      },
      {
        "speaker": "Chris",
        "en": "How <b>underwater</b> are we? Do we need to <b>draw on</b> the credit line?",
        "cn": "我们的情况有多糟？我们需要动用信用额度吗？"
      },
      {
        "speaker": "Rachel",
        "en": "Not yet, but we're <b>cutting it close</b>. Chris, can you <b>run the numbers</b> on what we've got <b>in the bank</b> right now?",
        "cn": "还没有，但我们在冒险。克里斯，你能算出我们现在在银行里有多少吗？"
      },
      {
        "speaker": "Chris",
        "en": "I just pulled it. We're sitting at about 2.3 million. But we have 1.8 million in <b>payables</b> that are due in the next two weeks.",
        "cn": "我刚拉出来。我们约有230万。但我们有180万应付账款在未来两周到期。"
      },
      {
        "speaker": "Tom",
        "en": "OK so <b>best case scenario</b>, we're left with like half a mil in <b>working capital</b>. That's <b>pretty lean</b>.",
        "cn": "好的，所以最好的情况，我们剩下大约50万的营运资本。这很微薄。"
      },
      {
        "speaker": "Rachel",
        "en": "Right. And if any of our big customers <b>default</b> or <b>push back</b> their payments, we're in hot water.",
        "cn": "对。如果我们的任何大客户违约或推迟支付，我们就陷入困境。"
      },
      {
        "speaker": "Chris",
        "en": "Should I <b>follow up</b> with Sales on those outstanding invoices? Some of them are like 60 days past due.",
        "cn": "我应该跟进销售部门的那些未清发票吗？其中一些已经逾期60多天。"
      },
      {
        "speaker": "Tom",
        "en": "Yeah, that's a <b>no-brainer</b>. We need to <b>get aggressive</b> on collections. 60 days is <b>way too long</b>.",
        "cn": "是的，那是显而易见的。我们需要在收款上变得更积极。60天太长了。"
      },
      {
        "speaker": "Rachel",
        "en": "Absolutely. And Tom, where do we stand with the big <b>vendor payments</b>? Can we <b>negotiate</b> a <b>payment plan</b> or ask for an extension?",
        "cn": "绝对同意。汤姆，我们与大供应商付款的立场如何？我们能协商付款计划或要求延期吗？"
      },
      {
        "speaker": "Tom",
        "en": "I've already <b>reached out</b> to a couple of them. One said they can <b>push it out</b> to the 30th, which helps a little.",
        "cn": "我已经与其中几个联系了。其中一个说他们可以将其推迟到30号，这有点帮助。"
      },
      {
        "speaker": "Chris",
        "en": "OK so if we <b>stagger</b> the payments, we might be able to breathe a little. But we still need more cash <b>coming in</b>.",
        "cn": "好的，所以如果我们错开付款，我们可能能够喘一口气。但我们仍然需要更多现金流入。"
      },
      {
        "speaker": "Rachel",
        "en": "That's where we need to <b>brainstorm</b>. Are there any deals we can <b>close</b> faster? Any projects we can <b>accelerate</b>?",
        "cn": "这是我们需要头脑风暴的地方。有没有交易我们可以更快地完成？有没有项目我们可以加速？"
      },
      {
        "speaker": "Tom",
        "en": "Well, there's that Enterprise deal that's been <b>in the pipeline</b> for three months. If we can <b>seal it</b> in the next week or two, we'll be looking at like a million bucks.",
        "cn": "好吧，有一个企业交易已经在管道中三个月了。如果我们能在接下来的一两周内达成协议，我们会看到大约一百万块。"
      },
      {
        "speaker": "Chris",
        "en": "That would <b>turn the tables</b> for us. But that's not guaranteed, right?",
        "cn": "这会扭转局面。但这不是有保证的，对吧？"
      },
      {
        "speaker": "Rachel",
        "en": "No, it's not. So we can't <b>bank on</b> it. We need a backup plan. Chris, what if we <b>factored</b> some of our outstanding receivables?",
        "cn": "不，不是。所以我们不能指望它。我们需要备份计划。克里斯，如果我们对一些未清应收账款进行保理怎么办？"
      },
      {
        "speaker": "Chris",
        "en": "Factoring? That's expensive. We'd lose like 3 to 5 percent in fees. That <b>eats into</b> our margins.",
        "cn": "保理？这很贵。我们会损失3到5的费用。这会影响我们的利润。"
      },
      {
        "speaker": "Tom",
        "en": "But it's better than <b>going under</b>, right? Let's at least <b>get a quote</b> and see what the real numbers look like.",
        "cn": "但这总比倒闭好，对吧？让我们至少获得报价，看看真实数字是什么。"
      },
      {
        "speaker": "Rachel",
        "en": "Good call. Chris, can you <b>shop around</b> for factoring options by tomorrow? And Tom, you keep <b>pushing</b> on collections and vendor negotiation.",
        "cn": "好主意。克里斯，你能在明天之前逛逛保理选项吗？汤姆，你继续在收款和供应商谈判上施压。"
      },
      {
        "speaker": "Chris",
        "en": "Will do. Should I also look into whether we can <b>refinance</b> any of our debt to improve cash flow?",
        "cn": "好的。我还应该查看是否可以重新融资任何债务来改善现金流吗？"
      }
    ]
  },
  {
    "id": "f5",
    "cat": "finance",
    "catName": "财务",
    "catEmoji": "💰",
    "title": "Audit Preparation",
    "titleCn": "审计准备",
    "emoji": "👩🏻‍💼",
    "lines": [
      {
        "speaker": "Sharon",
        "en": "OK people, audit is in three weeks, and we need to <b>get our ducks in a row</b>. I want everything <b>squared away</b> before they show up.",
        "cn": "好的，审计在三周后，我们需要理清思路。我希望他们到达之前一切就绪。"
      },
      {
        "speaker": "Kevin",
        "en": "What's the <b>scope</b> of the audit this year? Are they just doing the <b>financial statements</b>, or are they <b>digging deeper</b>?",
        "cn": "今年审计的范围是什么？他们只是在做财务报表，还是在深入调查？"
      },
      {
        "speaker": "Sharon",
        "en": "They're doing a <b>full audit</b>. Internal controls, revenue recognition, all the fun stuff. So we need to be <b>squeaky clean</b>.",
        "cn": "他们在进行全面审计。内部控制、收入确认，所有有趣的东西。所以我们需要非常干净。"
      },
      {
        "speaker": "Jordan",
        "en": "<b>That's a lot</b> of work. What <b>documentation</b> do they need from us?",
        "cn": "这是很多工作。他们需要我们提供什么文件？"
      },
      {
        "speaker": "Sharon",
        "en": "Everything. Bank reconciliations, vendor statements, <b>audit schedules</b>, subsidiary ledgers. I need you guys to <b>compile</b> a <b>complete package</b>.",
        "cn": "所有东西。银行对账单、供应商对账单、审计计划表、附属账簿。我需要你们编制一个完整的包。"
      },
      {
        "speaker": "Kevin",
        "en": "When do you need this by? Because we're already <b>swamped</b> with month-end close stuff.",
        "cn": "你什么时候需要这个？因为我们已经被月底关闭的东西所淹没。"
      },
      {
        "speaker": "Sharon",
        "en": "I know, it's a lot. But auditors don't <b>mess around</b>. If we don't have our <b>documentation together</b>, they'll <b>flag everything</b>.",
        "cn": "我知道，这是很多。但审计员不会胡闹。如果我们没有整理好文件，他们会标记所有东西。"
      },
      {
        "speaker": "Jordan",
        "en": "Should we have our <b>independent auditors</b> preview any of this, or is that not allowed?",
        "cn": "我们应该让我们的独立审计员预览其中任何一个，还是不允许？"
      },
      {
        "speaker": "Kevin",
        "en": "No, we want to stay <b>arm's length</b> from them until the official audit starts. But we should definitely <b>make sure</b> we've got everything <b>buttoned up</b>.",
        "cn": "不，我们想与他们保持距离，直到正式审计开始。但我们绝对应该确保一切都井然有序。"
      },
      {
        "speaker": "Sharon",
        "en": "Exactly. And Kevin, I need you to <b>walk through</b> the <b>revenue cycle</b> with me. We need to make sure all those journal entries are <b>properly supported</b>.",
        "cn": "完全正确。凯文，我需要你与我一起浏览收入周期。我们需要确保所有这些日记账分录都得到适当支持。"
      },
      {
        "speaker": "Kevin",
        "en": "Already on it. I found a few transactions that could use better documentation. Nothing <b>material</b>, but auditors love <b>seeing the workpapers</b>.",
        "cn": "已经在做了。我找到了一些需要更好文件的交易。没有实质性的，但审计员喜欢看工作底稿。"
      },
      {
        "speaker": "Jordan",
        "en": "What about those <b>year-end accruals</b>? Are we confident those are accurate?",
        "cn": "那些年末应计呢？我们确信这些是准确的吗？"
      },
      {
        "speaker": "Sharon",
        "en": "That's something I want to <b>go through</b> carefully. Sometimes we <b>under-accrue</b> or <b>over-accrue</b> because we're in a rush.",
        "cn": "这是我想仔细检查的东西。有时我们因为匆忙而少提或过度提。"
      },
      {
        "speaker": "Kevin",
        "en": "Are we gonna have to <b>restate</b> anything from previous years? That would be <b>a nightmare</b>.",
        "cn": "我们是否需要重新说明前几年的任何东西？那会是一场噩梦。"
      },
      {
        "speaker": "Jordan",
        "en": "I don't think so, but there's that one thing with the <b>deferred revenue</b> from last year. Should we <b>get ahead of it</b>?",
        "cn": "我不认为，但去年有一件关于递延收入的事情。我们应该提前处理吗？"
      },
      {
        "speaker": "Sharon",
        "en": "Good thinking. Yes, let's <b>bring it up</b> during the <b>entrance conference</b> so they're not <b>blindsided</b>.",
        "cn": "好主意。是的，让我们在进场会议上提出来，这样他们就不会被蒙在鼓里。"
      },
      {
        "speaker": "Kevin",
        "en": "One more thing—what about the <b>management letter</b>? They always have comments. Do we need to <b>address those</b> before they start?",
        "cn": "还有一件事——管理信函如何？他们总是有评论。在他们开始之前，我们需要解决这些吗？"
      },
      {
        "speaker": "Sharon",
        "en": "We'll deal with that <b>after the audit</b>. For now, let's <b>focus on</b> making sure the current year stuff is <b>locked in</b>.",
        "cn": "我们会在审计后处理。现在，让我们专注于确保当前年度的东西已锁定。"
      },
      {
        "speaker": "Jordan",
        "en": "Got it. Should I start <b>organizing</b> the schedules and uploading them to the shared portal?",
        "cn": "明白了。我应该开始组织时间表并将其上传到共享门户吗？"
      },
      {
        "speaker": "Sharon",
        "en": "Yes, do that ASAP. And make sure every schedule is <b>cross-referenced</b> to the <b>ledger</b>. Last thing we need is auditors spending hours <b>chasing numbers</b> that don't <b>tie out</b>.",
        "cn": "是的，尽快做。确保每个时间表都与账簿交叉引用。我们最不需要的是审计员花费数小时追踪与账簿不符的数字。"
      }
    ]
  },
  {
    "id": "p1",
    "cat": "procurement",
    "catName": "采购",
    "catEmoji": "📦",
    "title": "Vendor Negotiation",
    "titleCn": "供应商谈判",
    "emoji": "👨🏻‍💼",
    "lines": [
      {
        "speaker": "Doug",
        "en": "Thanks for taking the time to meet with us. Look, we've been partners for five years, and we love the quality, but your pricing has gotten <b>way out of line</b>.",
        "cn": "感谢您抽时间与我们会面。看，我们已经是五年的合作伙伴，我们喜欢质量，但您的定价已经高得离谱。"
      },
      {
        "speaker": "Nicole",
        "en": "I appreciate that, Doug. But you have to understand, our <b>cost of goods</b> has gone up. We're getting <b>squeezed</b> on our end too.",
        "cn": "我欣赏这一点，道格。但你必须理解，我们的商品成本已经上升。我们也被压榨了。"
      },
      {
        "speaker": "Tyler",
        "en": "We hear that, but you're asking for a 12 percent increase, and that's just <b>not gonna fly</b>. We're <b>locked in</b> with our customers at current prices.",
        "cn": "我们听到了，但你要求增加12%，这根本行不通。我们与客户的当前价格已锁定。"
      },
      {
        "speaker": "Doug",
        "en": "Here's the deal—we can probably accept a 5 percent increase, <b>max</b>. But we'd need a <b>volume commitment</b> on your part.",
        "cn": "这是条件——我们大概可以接受5%的增幅，最多。但我们需要你们的数量承诺。"
      },
      {
        "speaker": "Nicole",
        "en": "Five percent is <b>not enough to cover</b> what we're dealing with. We've got staffing costs, <b>raw materials</b>—everything's gone up.",
        "cn": "5%不足以应对我们面临的情况。我们有员工成本、原始材料——一切都上升了。"
      },
      {
        "speaker": "Tyler",
        "en": "Look, we're not trying to <b>squeeze you</b>, but we've got options. We can <b>shop around</b> and find another vendor. I'm hoping it doesn't come to that.",
        "cn": "看，我们不是在压榨你，但我们有选择。我们可以到处逛逛，找到另一个供应商。我希望不会走到那一步。"
      },
      {
        "speaker": "Nicole",
        "en": "<b>Fair point</b>. But switching vendors is a <b>pain in the neck</b> for you guys too. New <b>qualification</b>, testing, <b>lead time</b> delays.",
        "cn": "公平的观点。但对你们来说，更换供应商也很麻烦。新的认证、测试、交货时间延迟。"
      },
      {
        "speaker": "Doug",
        "en": "That's true, but <b>we gotta play hardball</b> here. What if we <b>bump it up</b> to 7 percent, but you lock in that price for three years?",
        "cn": "这是真的，但我们必须玩强硬游戏。如果我们提高7%，但你们为期三年锁定该价格怎么办？"
      },
      {
        "speaker": "Nicole",
        "en": "Seven percent for three years? That's <b>a tall order</b>. We don't know what inflation's gonna do.",
        "cn": "三年内7%？这是很高的要求。我们不知道通货膨胀会怎样。"
      },
      {
        "speaker": "Tyler",
        "en": "What if we <b>meet in the middle</b> at 8 percent, but with an <b>escalation clause</b>? So it goes up with inflation but capped at like 3 percent a year.",
        "cn": "如果我们在8%的中点见面怎么样，但有升级条款？所以它随通货膨胀而上升，但每年最高3%。"
      },
      {
        "speaker": "Nicole",
        "en": "OK, now we're talking. That's much more reasonable. But I'd need that three-year <b>commitment</b> from you guys on the volume side.",
        "cn": "好的，现在我们在谈话。这更合理。但我需要你们在数量方面有三年的承诺。"
      },
      {
        "speaker": "Doug",
        "en": "What's the minimum volume you'd need? Because we don't want to <b>overcommit</b> and then not be able to <b>absorb</b> it all.",
        "cn": "你们需要的最少数量是多少？因为我们不想过度承诺，然后无法全部吸收。"
      },
      {
        "speaker": "Nicole",
        "en": "Based on your current usage, you're at about 50,000 units a year. We'd want that to be a <b>floor</b>, meaning you'd purchase at least that amount.",
        "cn": "根据你们目前的使用情况，你们每年约50,000个单位。我们希望这是底线，意味着你们至少购买这个数量。"
      },
      {
        "speaker": "Tyler",
        "en": "OK, that <b>works for us</b>. But we need better <b>payment terms</b>. Right now you're net 30, but can we get to 45?",
        "cn": "好的，这对我们有效。但我们需要更好的付款条款。现在你们是30天，但我们能到45天吗？"
      },
      {
        "speaker": "Nicole",
        "en": "Net 45? <b>That's a lot to ask</b> for a mid-tier supplier. I can maybe go to net 35, but that's my limit.",
        "cn": "45天？对中等供应商来说，这要求太多了。我可能能达到35天，但这是我的极限。"
      },
      {
        "speaker": "Doug",
        "en": "Net 35 is <b>workable</b>. Can we also get a <b>volume discount</b> if we hit certain thresholds?",
        "cn": "35天是可行的。如果我们达到某些阈值，我们也能获得数量折扣吗？"
      },
      {
        "speaker": "Nicole",
        "en": "We could <b>throw in</b> a 2 percent discount if you hit 60,000 units, and another 2 percent if you hit 75,000.",
        "cn": "如果你们达到60,000个单位，我们可以增加2%的折扣，如果你们达到75,000，再增加2%。"
      },
      {
        "speaker": "Tyler",
        "en": "That's <b>a solid offer</b>. I think we can <b>make this work</b>. Let's <b>get this down on paper</b> and have the legal teams review.",
        "cn": "这是一个不错的提议。我认为我们可以让这个有效。让我们把这个写下来，让法律团队审查。"
      },
      {
        "speaker": "Nicole",
        "en": "Sounds good. I'll have my team prepare a <b>proposal</b> and send it over by end of week. We'll <b>iron out</b> any details once you review it.",
        "cn": "听起来不错。我的团队会准备一份提案并在周末前发送。一旦你审查，我们会处理任何细节。"
      },
      {
        "speaker": "Doug",
        "en": "Perfect. This was <b>a productive conversation</b>. I think we've got the bones of a good deal here.",
        "cn": "完美。这是一次富有成效的对话。我认为我们有一个好交易的基础。"
      }
    ]
  },
  {
    "id": "p2",
    "cat": "procurement",
    "catName": "采购",
    "catEmoji": "📦",
    "title": "RFP Review",
    "titleCn": "询价函审查",
    "emoji": "👨🏻‍💼",
    "lines": [
      {
        "speaker": "Brian",
        "en": "Alright, we got three proposals back. Let's <b>compare apples to apples</b>. Sandra, what's your read on these?",
        "cn": "好的，我们收到了三份提案。让我们比较同类项。桑德拉，你对这些怎么看？"
      },
      {
        "speaker": "Sandra",
        "en": "Vendor A is the cheapest—they're like 15 percent under the others. But their <b>track record</b> is sketchy. We <b>had issues</b> with them before.",
        "cn": "供应商A最便宜——他们比其他人便宜大约15%。但他们的历史记录令人担忧。我们以前与他们有问题。"
      },
      {
        "speaker": "Paul",
        "en": "Yeah, I remember that. They were <b>late on delivery</b> like three times. <b>That's a red flag</b> for us because we can't afford supply chain disruption.",
        "cn": "是的，我记得。他们交货晚了大约三次。这对我们来说是一个警告信号，因为我们承受不起供应链中断。"
      },
      {
        "speaker": "Brian",
        "en": "Exactly. It's not just about <b>the lowest bid</b>. We need reliability. What about Vendor B?",
        "cn": "完全正确。不仅仅是最低价。我们需要可靠性。供应商B怎么样？"
      },
      {
        "speaker": "Sandra",
        "en": "Vendor B is solid. Mid-range pricing, good quality, <b>on-time delivery</b> rate of like 98 percent. They also <b>have references</b> we can check.",
        "cn": "供应商B很稳固。中等价格、良好质量、按时交货率约98%。他们还有我们可以检查的参考。"
      },
      {
        "speaker": "Paul",
        "en": "What's the price difference between B and C?",
        "cn": "B和C的价格差异是多少？"
      },
      {
        "speaker": "Sandra",
        "en": "Vendor C is premium—like 20 percent more than B. But they're a <b>Tier 1 supplier</b>. Certified, <b>ISO qualified</b>, the works.",
        "cn": "供应商C是高级的——比B高约20%。但他们是一级供应商。经过认证、ISO认证，应有尽有。"
      },
      {
        "speaker": "Brian",
        "en": "OK so we're looking at a <b>cost-benefit trade-off</b>. B is the sweet spot if their <b>capacity</b> is good. Did they provide that?",
        "cn": "好的，所以我们在看成本效益权衡。如果B的产能很好，B是最佳选择。他们有提供吗？"
      },
      {
        "speaker": "Sandra",
        "en": "Yeah, and it looks <b>solid</b>. They say they can <b>ramp up</b> to 100,000 units per month if we need it.",
        "cn": "是的，看起来很稳固。他们说如果我们需要，他们可以增加到每月100,000个单位。"
      },
      {
        "speaker": "Paul",
        "en": "That's important because we're projecting 30 percent growth next year. We need a supplier who can <b>scale</b>.",
        "cn": "这很重要，因为我们预计明年增长30%。我们需要一个能够扩展的供应商。"
      },
      {
        "speaker": "Brian",
        "en": "Right. Paul, can you <b>run the numbers</b> on total cost of ownership? Include <b>logistics</b>, <b>lead time</b>, and any other <b>hidden costs</b>.",
        "cn": "对。保罗，你能计算总拥有成本吗？包括物流、交货时间和任何其他隐性成本。"
      },
      {
        "speaker": "Paul",
        "en": "Already on it. But <b>off the top of my head</b>, Vendor B is probably the best value. Vendor C is too pricey unless we really need that <b>pedigree</b>.",
        "cn": "已经在做了。但凭我的第一印象，供应商B可能是最划算的。除非我们真的需要那个血统，否则供应商C太贵了。"
      },
      {
        "speaker": "Sandra",
        "en": "What about <b>payment flexibility</b>? Did that come up in their proposals?",
        "cn": "付款灵活性怎么样？他们的提案中有提到吗？"
      },
      {
        "speaker": "Brian",
        "en": "Good question. Let me check. Vendor A offers net 60, B is net 30, and C is net 45.",
        "cn": "好问题。让我检查一下。供应商A提供60天，B是30天，C是45天。"
      },
      {
        "speaker": "Paul",
        "en": "Vendor A with net 60 is <b>a plus</b>, but it doesn't make up for their poor service history.",
        "cn": "供应商A的60天是一个优势，但这不能弥补他们糟糕的服务历史。"
      },
      {
        "speaker": "Sandra",
        "en": "Agree. I'd <b>rule out</b> Vendor A. Let me <b>reach out</b> to the top two and get more info.",
        "cn": "同意。我会排除供应商A。让我与前两个联系并获取更多信息。"
      },
      {
        "speaker": "Brian",
        "en": "Do that. Ask B about <b>quality assurance</b> processes and C about <b>flexibility</b> on pricing if we <b>lock in</b> volume.",
        "cn": "这样做。问B关于质量保证流程，问C关于定价的灵活性如果我们锁定数量。"
      },
      {
        "speaker": "Paul",
        "en": "We should also ask both if they have any <b>certifications</b> for environmental standards. That's becoming important to our customers.",
        "cn": "我们还应该问双方他们是否有任何环保标准认证。这对我们的客户变得越来越重要。"
      },
      {
        "speaker": "Sandra",
        "en": "Good call. I'll <b>send out</b> a follow-up list of questions today.",
        "cn": "好主意。我今天会发送一份后续问题清单。"
      },
      {
        "speaker": "Brian",
        "en": "Once you get answers, we'll <b>put together</b> a scoring sheet and make a decision. I'd like to <b>wrap this up</b> by next week.",
        "cn": "一旦你得到答案，我们会整理一份评分表并做出决定。我想在下周前完成这个。"
      }
    ]
  },
  {
    "id": "p3",
    "cat": "procurement",
    "catName": "采购",
    "catEmoji": "📦",
    "title": "Supply Chain Disruption",
    "titleCn": "供应链中断",
    "emoji": "👩🏻‍💼",
    "lines": [
      {
        "speaker": "Karen",
        "en": "OK everybody, we have a situation. Our primary supplier just told us their shipment is delayed by two weeks. We're in <b>crisis mode</b>.",
        "cn": "好的，各位，我们有个情况。我们的主要供应商刚刚告诉我们他们的货物延迟两周。我们处于危机模式。"
      },
      {
        "speaker": "David",
        "en": "Two weeks? That's <b>a problem</b>. We only have about ten days of <b>inventory</b> left. After that, we're <b>out of stock</b>.",
        "cn": "两周？那是一个问题。我们只有大约十天的库存。在那之后，我们缺货。"
      },
      {
        "speaker": "Lisa",
        "en": "How did this even happen? Didn't they give us a heads-up?",
        "cn": "这甚至是怎么发生的？他们没有预先通知我们吗？"
      },
      {
        "speaker": "Karen",
        "en": "They said there was a port delay and customs issues. <b>Not much we can do</b> about that, but we still need to fix this.",
        "cn": "他们说有港口延迟和海关问题。我们对此无能为力，但我们仍然需要解决这个问题。"
      },
      {
        "speaker": "David",
        "en": "Have we tried <b>expediting</b> the shipment? Like paying extra for faster <b>freight</b>?",
        "cn": "我们试过加急吗？比如付额外费用来加快运费？"
      },
      {
        "speaker": "Karen",
        "en": "Already called them. They said no amount of money will speed this up. The shipment is <b>stuck</b> at the port.",
        "cn": "已经打过电话了。他们说任何金额都不会加快速度。货物被困在港口。"
      },
      {
        "speaker": "Lisa",
        "en": "OK so we need a backup plan. Can we <b>source</b> product from one of our secondary suppliers?",
        "cn": "好的，所以我们需要一个备份计划。我们能从我们的一个次要供应商采购产品吗？"
      },
      {
        "speaker": "David",
        "en": "I checked already. Our backup guys are <b>tapped out</b>—they're at full capacity.",
        "cn": "我已经检查过了。我们的备份供应商已经满负荷了。"
      },
      {
        "speaker": "Karen",
        "en": "What about <b>spot purchasing</b> from someone else? We don't usually go this route, but we're desperate.",
        "cn": "从其他地方进行现货采购怎么样？我们通常不这样做，但我们很绝望。"
      },
      {
        "speaker": "Lisa",
        "en": "That could work, but the cost will be <b>way higher</b>. We might have to <b>eat the margin</b> on this.",
        "cn": "那可能行得通，但成本会高得多。我们可能不得不在这方面承担利润。"
      },
      {
        "speaker": "David",
        "en": "How much higher are we talking?",
        "cn": "我们说的是高多少？"
      },
      {
        "speaker": "Karen",
        "en": "I got a quote from a regional supplier—they're about 30 percent above our normal <b>cost per unit</b>. But they can <b>deliver</b> in three days.",
        "cn": "我从一个区域供应商那里得到了报价——他们的单位成本比我们的正常成本高约30%。但他们可以在三天内交货。"
      },
      {
        "speaker": "Lisa",
        "en": "That's rough. Can we <b>pass it on</b> to the customer or do we have a fixed-price contract?",
        "cn": "那很艰难。我们能把它转嫁给客户还是我们有固定价格合同？"
      },
      {
        "speaker": "David",
        "en": "Fixed price for the next three months. So yeah, we'll have to <b>suck it up</b>.",
        "cn": "接下来三个月的固定价格。所以是的，我们必须接受。"
      },
      {
        "speaker": "Karen",
        "en": "OK, let's <b>weigh our options</b>. Option one: bite the bullet and order from the spot supplier.",
        "cn": "好的，让我们权衡我们的选择。选项一：咬紧牙关并从现货供应商订购。"
      },
      {
        "speaker": "Lisa",
        "en": "What's option two?",
        "cn": "选项二是什么？"
      },
      {
        "speaker": "Karen",
        "en": "Option two: <b>reach out</b> to the customer and <b>level with</b> them about the situation. Maybe they'll accept a <b>partial shipment</b> or a short delay.",
        "cn": "选项二：与客户联系并向他们坦诚这种情况。也许他们会接受部分货物或短暂延迟。"
      },
      {
        "speaker": "David",
        "en": "I don't like that option. We'd look like we're <b>dropping the ball</b>. Customers get mad when we don't deliver on time.",
        "cn": "我不喜欢这个选项。看起来我们在失职。当我们不按时交货时，客户会生气。"
      },
      {
        "speaker": "Lisa",
        "en": "What if we do both? Use the spot supplier to keep us afloat in the short term, and work with our main supplier to make sure this doesn't happen again.",
        "cn": "如果我们两个都做怎么样？使用现货供应商在短期内支撑我们，并与我们的主要供应商合作以确保这不会再发生。"
      },
      {
        "speaker": "Karen",
        "en": "That's the move. Let's <b>move forward</b> with the spot order today and I'll <b>have a serious talk</b> with our main supplier about their <b>contingency planning</b>.",
        "cn": "这是个办法。让我们今天继续进行现货订单，我将与我们的主要供应商进行严肃的谈话，关于他们的应急计划。"
      }
    ]
  },
  {
    "id": "p4",
    "cat": "procurement",
    "catName": "采购",
    "catEmoji": "📦",
    "title": "Contract Renewal",
    "titleCn": "合同续签",
    "emoji": "👩🏻‍💼",
    "lines": [
      {
        "speaker": "Rachel",
        "en": "OK so our contract with Apex is up for renewal in thirty days. This is our chance to <b>renegotiate</b> some of the terms that haven't been working for us.",
        "cn": "好的，我们与Apex的合同将在30天内更新。这是我们重新协商一些对我们不起作用的条款的机会。"
      },
      {
        "speaker": "James",
        "en": "What's been bugging you about the current contract?",
        "cn": "目前的合同有什么问题吗？"
      },
      {
        "speaker": "Rachel",
        "en": "A few things. The minimum order quantity is <b>way too high</b>. We're overstocked most of the time.",
        "cn": "几个问题。最小订单数量太高了。我们大多数时候都库存过多。"
      },
      {
        "speaker": "Monica",
        "en": "Have you asked them about <b>flexibility</b> on MOQ? That's something we could <b>negotiate</b>.",
        "cn": "你有没有询问他们MOQ的灵活性？这是我们可以协商的东西。"
      },
      {
        "speaker": "Rachel",
        "en": "I haven't formally asked yet, but based on the history, they're pretty <b>stuck in their ways</b>.",
        "cn": "我还没有正式询问，但根据历史，他们相当固执。"
      },
      {
        "speaker": "James",
        "en": "Then we need to come with <b>leverage</b>. What's our <b>alternative</b>? Do we have other suppliers who can fill that role?",
        "cn": "那么我们需要拿出筹码。我们的替代方案是什么？我们有其他供应商可以填补这个角色吗？"
      },
      {
        "speaker": "Monica",
        "en": "We do, but switching would be a pain. There'd be <b>qualification</b> and <b>setup costs</b>, plus we'd lose institutional knowledge.",
        "cn": "我们有，但转换会很麻烦。会有认证和设置成本，而且我们会失去机构知识。"
      },
      {
        "speaker": "Rachel",
        "en": "Exactly, but they don't need to know we'd rather stay if the terms are reasonable.",
        "cn": "完全正确，但他们不需要知道如果条款合理，我们宁愿留下。"
      },
      {
        "speaker": "James",
        "en": "That's smart. So what else is on the list?",
        "cn": "这很聪明。那还有什么其他的呢？"
      },
      {
        "speaker": "Monica",
        "en": "The <b>payment terms</b> are net 30, but we're asking for net 45 to help with our <b>cash flow</b>.",
        "cn": "付款条款是30天，但我们要求45天以帮助我们的现金流。"
      },
      {
        "speaker": "Rachel",
        "en": "And we want a <b>price lock</b> for at least two years with an <b>annual adjustment</b> that's tied to <b>inflation</b>.",
        "cn": "我们希望至少两年的价格锁定，年度调整与通货膨胀挂钩。"
      },
      {
        "speaker": "James",
        "en": "Two years is aggressive. They might push back on that.",
        "cn": "两年很激进。他们可能会反对。"
      },
      {
        "speaker": "Rachel",
        "en": "Yeah, but if they want to keep our business, they'll have to <b>make concessions</b>. They depend on us for like 25 percent of their revenue.",
        "cn": "是的，但如果他们想保留我们的业务，他们必须做出让步。他们依靠我们获得大约25%的收入。"
      },
      {
        "speaker": "Monica",
        "en": "That's good <b>leverage</b>. What about <b>service levels</b>? Do we want to <b>tighten</b> the <b>SLA</b>?",
        "cn": "这是很好的筹码。服务级别怎么样？我们想收紧SLA吗？"
      },
      {
        "speaker": "Rachel",
        "en": "Absolutely. They're at like 95 percent <b>on-time delivery</b>. We want that to be 98 percent or we <b>get a credit</b>.",
        "cn": "绝对地。他们的准时交货率约为95%。我们希望是98%，否则我们获得信用。"
      },
      {
        "speaker": "James",
        "en": "That's fair. What if they <b>push back</b> and say 95 percent is their max?",
        "cn": "这很公平。如果他们反对并说95%是他们的最大值怎么办？"
      },
      {
        "speaker": "Rachel",
        "en": "Then we tell them we'll <b>go out to bid</b> and see what other suppliers can offer.",
        "cn": "那么我们告诉他们我们会出去竞标，看看其他供应商能提供什么。"
      },
      {
        "speaker": "Monica",
        "en": "I'll <b>put together</b> a formal proposal with all our asks. That way it's in <b>writing</b> and there's no confusion.",
        "cn": "我会整理一份正式提案，列出我们的所有要求。这样就有了书面记录，不会混淆。"
      },
      {
        "speaker": "James",
        "en": "Good idea. When are you planning to present this to them?",
        "cn": "好主意。你计划什么时候向他们提交？"
      },
      {
        "speaker": "Rachel",
        "en": "Next week. I'll schedule a call and <b>lay out</b> where we stand. Then we'll see if we can <b>reach a deal</b> that works for both sides.",
        "cn": "下周。我会安排一个电话并说明我们的立场。然后我们看是否能达成双方都满意的交易。"
      }
    ]
  },
  {
    "id": "p5",
    "cat": "procurement",
    "catName": "采购",
    "catEmoji": "📦",
    "title": "New Supplier Onboarding",
    "titleCn": "新供应商入职",
    "emoji": "👨🏻‍💼",
    "lines": [
      {
        "speaker": "Steven",
        "en": "Alright team, we've approved the new supplier. Now we need to <b>get them onboarded</b>. Priya, where are we on the <b>vetting process</b>?",
        "cn": "好的，团队，我们已经批准了新供应商。现在我们需要让他们入职。普里亚，我们在审查过程中处于什么位置？"
      },
      {
        "speaker": "Priya",
        "en": "We've done the background check and <b>financial health assessment</b>. They're looking solid.",
        "cn": "我们已经完成了背景检查和财务健康评估。他们看起来很稳固。"
      },
      {
        "speaker": "Tom",
        "en": "What about <b>compliance</b>? Do they meet all our <b>regulatory requirements</b>?",
        "cn": "合规性怎么样？他们是否符合所有我们的监管要求？"
      },
      {
        "speaker": "Priya",
        "en": "They're certified for most things, but they're missing a couple of <b>certifications</b>. We're working with them to <b>get those sorted out</b>.",
        "cn": "他们大多数东西都经过认证，但缺少一些认证。我们正在与他们合作以整理这些问题。"
      },
      {
        "speaker": "Steven",
        "en": "How long will that take?",
        "cn": "那需要多长时间？"
      },
      {
        "speaker": "Priya",
        "en": "They said they can <b>turn around</b> the paperwork in like two to three weeks.",
        "cn": "他们说他们可以在大约两到三周内完成文件。"
      },
      {
        "speaker": "Tom",
        "en": "Is that acceptable or do we need to <b>speed things up</b>?",
        "cn": "这能接受吗，还是我们需要加快速度？"
      },
      {
        "speaker": "Steven",
        "en": "It depends on our timeline. When do we need them operational?",
        "cn": "这取决于我们的时间表。我们什么时候需要他们运营？"
      },
      {
        "speaker": "Tom",
        "en": "Ideally in six weeks. That gives us time to <b>run tests</b> and make sure the quality is <b>up to par</b>.",
        "cn": "理想情况下在六周内。这给我们时间进行测试并确保质量达到标准。"
      },
      {
        "speaker": "Priya",
        "en": "Two to three weeks for certifications, that leaves us like a month for everything else. We should be fine.",
        "cn": "两到三周的认证，这给我们一个月来处理其他一切。我们应该没问题。"
      },
      {
        "speaker": "Steven",
        "en": "OK so next step is we set them up in our <b>vendor management system</b>. Tom, can you get their W-9 and <b>banking information</b>?",
        "cn": "好的，下一步是我们在供应商管理系统中设置他们。汤姆，你能获取他们的W-9和银行信息吗？"
      },
      {
        "speaker": "Tom",
        "en": "Already requested that. I also need their <b>insurance certificates</b> and <b>proof of workers' comp</b>.",
        "cn": "已经请求了。我还需要他们的保险证书和工伤保险证明。"
      },
      {
        "speaker": "Priya",
        "en": "They should send that over by tomorrow. Once we have all the docs, we'll <b>file them</b> and <b>get them in the system</b>.",
        "cn": "他们应该明天发送。一旦我们有了所有文件，我们会存档并将其输入系统。"
      },
      {
        "speaker": "Steven",
        "en": "What about a <b>master service agreement</b>? Do we have that <b>finalized</b>?",
        "cn": "主服务协议怎么样？我们有最终版本吗？"
      },
      {
        "speaker": "Priya",
        "en": "Still in <b>negotiation</b> with their legal team. They wanted some changes to the <b>payment terms</b> and <b>liability clause</b>.",
        "cn": "仍在与他们的法律团队谈判。他们想要对付款条款和责任条款进行一些更改。"
      },
      {
        "speaker": "Tom",
        "en": "Are we flexible on those, or are those <b>deal-breakers</b>?",
        "cn": "我们在这些问题上有灵活性吗，还是这些是决定性因素？"
      },
      {
        "speaker": "Steven",
        "en": "I can be flexible on terms, but the <b>liability clause</b> is non-negotiable. We need to protect ourselves.",
        "cn": "我可以在条款上灵活，但责任条款是不可协商的。我们需要保护自己。"
      },
      {
        "speaker": "Priya",
        "en": "I'll <b>push back</b> on that and explain our position. We'll see if they'll <b>come around</b>.",
        "cn": "我会反对这一点并解释我们的立场。我们会看看他们是否会改变主意。"
      },
      {
        "speaker": "Tom",
        "en": "Once the agreement is signed, do we do a full audit of their facility?",
        "cn": "一旦协议签署，我们会对他们的设施进行全面审计吗？"
      },
      {
        "speaker": "Steven",
        "en": "Yeah, we need to <b>conduct an audit</b> before we place any large orders. Check their processes, equipment, <b>quality control</b>. It's important stuff.",
        "cn": "是的，在我们下任何大订单之前，我们需要进行审计。检查他们的流程、设备、质量控制。这很重要。"
      }
    ]
  },
  {
    "id": "e1",
    "cat": "engineering",
    "catName": "工程",
    "catEmoji": "💻",
    "title": "Code Review Feedback",
    "titleCn": "代码审查反馈",
    "emoji": "👩🏻‍💻",
    "lines": [
      {
        "speaker": "Marcus",
        "en": "Hey Sarah, I just pushed up that auth refactor. Can you take a look when you get a sec?",
        "cn": "嘿Sarah，我刚提交了那个身份验证重构。你有空的时候看一下？"
      },
      {
        "speaker": "Sarah",
        "en": "Yeah, gonna <b>dive into it</b> right now. Give me like five.",
        "cn": "好的，我现在就开始看。给我五分钟。"
      },
      {
        "speaker": "Marcus",
        "en": "Sounds good. No rush, just trying to <b>get this thing shipped</b> before the freeze.",
        "cn": "好的。不着急，我只是想在冻结前把这个东西发布出去。"
      },
      {
        "speaker": "Sarah",
        "en": "Okay so I've got some concerns. The error handling here is <b>all over the place</b>.",
        "cn": "好吧，我有些疑虑。这里的错误处理到处都是。"
      },
      {
        "speaker": "Marcus",
        "en": "Oh no, what'd I mess up?",
        "cn": "哦天哪，我哪里搞坏了？"
      },
      {
        "speaker": "Sarah",
        "en": "You're catching generic exceptions but not <b>rethrowing</b> properly. Could mask real issues down the line.",
        "cn": "你在捕获通用异常，但没有正确地重新抛出。可能会在后面掩盖真实问题。"
      },
      {
        "speaker": "Marcus",
        "en": "Ah yeah, I see it now. That's lazy on my part.",
        "cn": "哦是的，我现在看到了。这是我的懒惰。"
      },
      {
        "speaker": "Sarah",
        "en": "Also, can you <b>add some comments</b> around the token validation logic? It's not super obvious.",
        "cn": "另外，你能在令牌验证逻辑周围添加一些注释吗？这不太明显。"
      },
      {
        "speaker": "Marcus",
        "en": "For sure. Anything else jumping out at you?",
        "cn": "当然可以。还有其他让你注意到的地方吗？"
      },
      {
        "speaker": "Sarah",
        "en": "Yeah, one more thing — <b>this timeout is way too aggressive</b>. We'll get flaked tests with that.",
        "cn": "是的，还有一件事——这个超时太激进了。我们会得到不稳定的测试。"
      },
      {
        "speaker": "Marcus",
        "en": "Good catch. I'll <b>bump it up</b> to something more reasonable.",
        "cn": "好提醒。我会提高它到更合理的水平。"
      },
      {
        "speaker": "Sarah",
        "en": "Cool, just requested some changes. Nothing <b>show-stopping</b> though.",
        "cn": "好的，我请求做一些更改。不过没什么阻碍的。"
      },
      {
        "speaker": "Marcus",
        "en": "Appreciate that. I'll <b>turn these around</b> and push an update this afternoon.",
        "cn": "感谢。我会解决这些问题，下午推送更新。"
      },
      {
        "speaker": "Sarah",
        "en": "Perfect. Once you fix those, I'll <b>rubber stamp it</b>.",
        "cn": "完美。一旦你修复了这些，我会通过它。"
      },
      {
        "speaker": "Marcus",
        "en": "Awesome. Oh, and heads up — <b>there's some technical debt</b> here with the session management. We should <b>tackle that</b> next sprint.",
        "cn": "太棒了。另外，提醒一下——这里有一些关于会话管理的技术债。我们应该下一个冲刺中解决它。"
      },
      {
        "speaker": "Sarah",
        "en": "Yeah, I noticed. Let's <b>loop in</b> the team lead and <b>scope it out</b> proper.",
        "cn": "是的，我注意到了。让我们让团队负责人加入，并正确地确定范围。"
      },
      {
        "speaker": "Marcus",
        "en": "Yeah, I'll <b>create a ticket</b> and we can discuss at standup.",
        "cn": "好的，我会创建一张票，我们可以在standup上讨论。"
      },
      {
        "speaker": "Sarah",
        "en": "Good call. Alright, I'm gonna <b>put a thumbs up</b> on this once you address the feedback.",
        "cn": "好主意。好的，一旦你解决了反馈，我会给这个点赞。"
      },
      {
        "speaker": "Marcus",
        "en": "Will do. Thanks for the thorough review!",
        "cn": "好的。谢谢你的彻底审查！"
      },
      {
        "speaker": "Sarah",
        "en": "No problem, that's what I'm here for. <b>Ship it</b> once you're done.",
        "cn": "没问题，这就是我在这里的目的。完成后就发布它。"
      }
    ]
  },
  {
    "id": "e2",
    "cat": "engineering",
    "catName": "工程",
    "catEmoji": "💻",
    "title": "Production Incident Response",
    "titleCn": "生产事故响应",
    "emoji": "👨🏽‍💻",
    "lines": [
      {
        "speaker": "James",
        "en": "Okay, <b>we're getting hammered</b> with 500 errors. What's the status on the API?",
        "cn": "好吧，我们被500错误轰炸。API的状态如何？"
      },
      {
        "speaker": "Lisa",
        "en": "<b>It's down hard</b>. Been down for like three minutes. I'm checking the logs now.",
        "cn": "完全宕机了。已经宕了大约三分钟。我现在在检查日志。"
      },
      {
        "speaker": "James",
        "en": "Three minutes?! We should have <b>got paged</b> sooner. Who's on ops?",
        "cn": "三分钟？！我们应该更早收到页面提醒。谁在值班？"
      },
      {
        "speaker": "Lisa",
        "en": "Dev-ops is looking at it. Meanwhile, can you <b>dig into</b> the application logs?",
        "cn": "Dev-ops在查看它。同时，你能深入查看应用日志吗？"
      },
      {
        "speaker": "James",
        "en": "Yeah, I'm <b>pulling them up</b> right now. Looks like memory usage just <b>shot through the roof</b>.",
        "cn": "是的，我现在在查看。看起来内存使用量突然激增。"
      },
      {
        "speaker": "Lisa",
        "en": "Memory spike? That's weird. Was there a deployment lately?",
        "cn": "内存激增？那很奇怪。最近有部署吗？"
      },
      {
        "speaker": "James",
        "en": "Yeah, we pushed the new caching layer about an hour ago. That might be the culprit.",
        "cn": "是的，我们大约一小时前推送了新的缓存层。那可能是罪魁祸首。"
      },
      {
        "speaker": "Lisa",
        "en": "<b>That's gotta be it</b>. The cache is probably <b>eating up</b> all the RAM.",
        "cn": "那肯定就是这样。缓存可能吃掉了所有的RAM。"
      },
      {
        "speaker": "James",
        "en": "So what do we do? <b>Roll back</b> the deployment?",
        "cn": "那我们怎么办？回滚部署？"
      },
      {
        "speaker": "Lisa",
        "en": "That's the fastest move. Let me <b>spin up</b> a rollback and see if it helps.",
        "cn": "那是最快的办法。让我启动回滚，看看它是否有帮助。"
      },
      {
        "speaker": "James",
        "en": "Do it. I'll <b>keep tabs on</b> the metrics.",
        "cn": "干吧。我会关注指标。"
      },
      {
        "speaker": "Lisa",
        "en": "Alright, rollback is <b>in flight</b>. Should take about two minutes.",
        "cn": "好的，回滚正在进行中。应该需要大约两分钟。"
      },
      {
        "speaker": "James",
        "en": "Come on, come on... okay, metrics are starting to normalize. Nice work!",
        "cn": "加油，加油...好的，指标开始恢复正常。干得好！"
      },
      {
        "speaker": "Lisa",
        "en": "Alright, we're coming back up. Errors are dropping. We're not totally out of the woods yet though.",
        "cn": "好的，我们恢复了。错误在下降。但我们还没完全脱离困境。"
      },
      {
        "speaker": "James",
        "en": "Yeah, let's <b>monitor this closely</b> for the next hour.",
        "cn": "是的，让我们在接下来的一小时内密切监视这一点。"
      },
      {
        "speaker": "Lisa",
        "en": "For sure. We also need to <b>do a post-mortem</b> on why that cache went haywire.",
        "cn": "当然。我们还需要对为什么缓存出错进行事后分析。"
      },
      {
        "speaker": "James",
        "en": "Absolutely. <b>File an incident ticket</b> and I'll get the team together tomorrow.",
        "cn": "绝对。提交事故票，我明天会让团队聚在一起。"
      },
      {
        "speaker": "Lisa",
        "en": "Already on it. I'm gonna <b>burn down</b> a monitoring alert for memory so this doesn't happen again.",
        "cn": "已经在做了。我会为内存创建监控警报，这样就不会再发生了。"
      },
      {
        "speaker": "James",
        "en": "Good thinking. Also, <b>patch that code</b> before the next deployment. It's not production-ready.",
        "cn": "好主意。同时，在下一次部署前修补那段代码。它不能用于生产。"
      },
      {
        "speaker": "Lisa",
        "en": "Will do. Sorry about the chaos.",
        "cn": "好的。抱歉造成的混乱。"
      }
    ]
  },
  {
    "id": "e3",
    "cat": "engineering",
    "catName": "工程",
    "catEmoji": "💻",
    "title": "Architecture Decision: Monolith vs Microservices",
    "titleCn": "架构决策：单体vs微服务",
    "emoji": "🧑🏻‍💻",
    "lines": [
      {
        "speaker": "David",
        "en": "So I've been thinking about our growth trajectory. Our monolith is <b>starting to strain</b>.",
        "cn": "所以我一直在考虑我们的增长轨迹。我们的单体结构开始承受压力。"
      },
      {
        "speaker": "Rachel",
        "en": "How so? It's been holding up pretty well.",
        "cn": "怎样？它一直表现得相当不错。"
      },
      {
        "speaker": "David",
        "en": "Yeah, but we're at that inflection point. <b>Deployment times are getting longer</b>, and every small change requires the whole thing to get redeployed.",
        "cn": "是的，但我们已经到了那个拐点。部署时间变长了，每个小改变都需要整个东西重新部署。"
      },
      {
        "speaker": "Rachel",
        "en": "True. So you're thinking <b>we should split into microservices</b>?",
        "cn": "真的。所以你认为我们应该拆分为微服务？"
      },
      {
        "speaker": "David",
        "en": "Yeah, I think it's worth exploring. Each team could own their own service, deploy independently.",
        "cn": "是的，我认为值得探索。每个团队都可以拥有自己的服务，独立部署。"
      },
      {
        "speaker": "Rachel",
        "en": "I get the appeal, but <b>it's not a silver bullet</b>. We'll have way more operational complexity.",
        "cn": "我理解其吸引力，但这不是万灵药。我们会有更多的操作复杂性。"
      },
      {
        "speaker": "David",
        "en": "Fair point. But our current deployment cycle is <b>bottlenecking us</b>. We can't ship features fast enough.",
        "cn": "公平的观点。但我们目前的部署周期是瓶颈。我们不能足够快地发送功能。"
      },
      {
        "speaker": "Rachel",
        "en": "Okay, but have you <b>thought through</b> the data consistency problems? With a monolith, that's trivial.",
        "cn": "好的，但你有考虑过数据一致性问题吗？对于单体，那很容易。"
      },
      {
        "speaker": "David",
        "en": "Yeah, that's the tradeoff. But there are patterns for that — saga pattern, event sourcing...",
        "cn": "是的，那是权衡。但有处理这个的模式——saga模式、事件溯源..."
      },
      {
        "speaker": "Rachel",
        "en": "And <b>network latency</b>? We're making way more calls between services. That adds <b>overhead</b>.",
        "cn": "还有网络延迟？我们在服务之间进行很多调用。这增加了开销。"
      },
      {
        "speaker": "David",
        "en": "Valid concern. But we could cache aggressively, use async messaging for non-critical stuff.",
        "cn": "有效的关注。但我们可以积极缓存，对非关键事务使用异步消息传递。"
      },
      {
        "speaker": "Rachel",
        "en": "That's getting complicated. What about monitoring? Our observability needs would <b>blow up</b>.",
        "cn": "这变得复杂了。监控呢？我们的可观察性需求会膨胀。"
      },
      {
        "speaker": "David",
        "en": "Yeah, we'd need to invest in better tooling. But that's not a blocker, just a cost.",
        "cn": "是的，我们需要投资更好的工具。但那不是阻碍，只是一个成本。"
      },
      {
        "speaker": "Rachel",
        "en": "<b>Here's my concern</b> — this is a huge organizational change too. Teams have to be independent.",
        "cn": "这是我的关注——这也是一个巨大的组织变化。团队必须独立。"
      },
      {
        "speaker": "David",
        "en": "True. But honestly, that's not a bad thing. It forces better ownership and clearer contracts between teams.",
        "cn": "真的。但老实说，那不是坏事。它强制更好的所有权和团队之间的更清晰的合同。"
      },
      {
        "speaker": "Rachel",
        "en": "Fair. So what's your proposal? <b>Go all-in on microservices</b> or a gradual migration?",
        "cn": "公平。那么你的提议是什么？完全采用微服务还是逐步迁移？"
      },
      {
        "speaker": "David",
        "en": "I'd suggest <b>strangler fig pattern</b> — peel off one service at a time. Less risk that way.",
        "cn": "我建议使用绞杀无花果模式——一次剥离一个服务。这样风险较少。"
      },
      {
        "speaker": "Rachel",
        "en": "That's smarter. <b>Let's start with something non-critical</b>. Maybe the notifications service.",
        "cn": "那更聪明。让我们从非关键的东西开始。也许是通知服务。"
      },
      {
        "speaker": "David",
        "en": "Perfect. That's a good proof of concept. We can validate the approach without <b>high stakes</b>.",
        "cn": "完美。那是一个很好的概念验证。我们可以在不高风险的情况下验证该方法。"
      },
      {
        "speaker": "Rachel",
        "en": "Cool. Let's <b>scope out</b> what that would look like and bring it to the team next week.",
        "cn": "好的。让我们确定范围，下周向团队展示。"
      }
    ]
  },
  {
    "id": "e4",
    "cat": "engineering",
    "catName": "工程",
    "catEmoji": "💻",
    "title": "Sprint Retrospective",
    "titleCn": "冲刺总结",
    "emoji": "🧑🏻‍💻",
    "lines": [
      {
        "speaker": "Tom",
        "en": "Alright everyone, let's <b>kick off the retro</b>. What went well this sprint?",
        "cn": "好的各位，让我们开始总结会议。这个冲刺中什么进展顺利？"
      },
      {
        "speaker": "Amy",
        "en": "I'll bite — our <b>on-time delivery was solid</b>. We shipped all the stories we committed to.",
        "cn": "我来说——我们的准时交付很稳定。我们发布了我们承诺的所有用户故事。"
      },
      {
        "speaker": "Tom",
        "en": "Good point. We were definitely more focused this sprint. No crazy mid-sprint pivots.",
        "cn": "好观点。这个冲刺我们更加专注。没有疯狂的冲刺中期改变。"
      },
      {
        "speaker": "Amy",
        "en": "Also, the <b>pair programming sessions</b> were really helpful. People learned a lot from each other.",
        "cn": "另外，配对编程课程真的很有帮助。人们从彼此身上学到了很多。"
      },
      {
        "speaker": "Tom",
        "en": "Totally. That was a good call to institute. Now, let's talk about what didn't go as planned. What <b>fell short</b>?",
        "cn": "完全同意。这是一个很好的决定。现在，让我们谈谈没有按计划进行的事情。什么没有达到预期？"
      },
      {
        "speaker": "Amy",
        "en": "Performance testing. We <b>punted it</b> to next sprint again. That can't keep happening.",
        "cn": "性能测试。我们又把它推到下一个冲刺。这不能一直发生。"
      },
      {
        "speaker": "Tom",
        "en": "Yeah, you're right. That's been <b>on the backlog</b> for three sprints now. We gotta <b>bite the bullet</b>.",
        "cn": "是的，你说得对。那已经在待办事项中三个冲刺了。我们必须硬着头皮做。"
      },
      {
        "speaker": "Amy",
        "en": "And documentation. We <b>slipped</b> on API docs for the new endpoints.",
        "cn": "还有文档。我们在新端点的API文档上落后了。"
      },
      {
        "speaker": "Tom",
        "en": "Right, <b>technical debt</b> is creeping in again. We need to <b>carve out time</b> for that.",
        "cn": "是的，技术债再次悄悄增加。我们需要为此留出时间。"
      },
      {
        "speaker": "Amy",
        "en": "Also, we had some <b>unplanned interruptions</b> from the support team. Three fire drills.",
        "cn": "另外，我们从支持团队那里受到了一些计划外的中断。三次紧急处理。"
      },
      {
        "speaker": "Tom",
        "en": "Those are killer for focus. <b>We need to set boundaries</b> with support on mid-sprint asks.",
        "cn": "那些会杀死专注力。我们需要与支持团队在冲刺中期请求上设置边界。"
      },
      {
        "speaker": "Amy",
        "en": "Totally. Like, designate one person per day to handle ad-hoc requests?",
        "cn": "完全同意。比如，每天指定一个人来处理临时请求？"
      },
      {
        "speaker": "Tom",
        "en": "Yeah, that's a solid idea. <b>Let's action that</b>. I'll bring it up with support tomorrow.",
        "cn": "是的，那是一个很好的想法。让我们执行它。我明天会向支持部门提出。"
      },
      {
        "speaker": "Amy",
        "en": "What about our velocity? How'd we do compared to last sprint?",
        "cn": "我们的速率如何？与上一个冲刺相比我们做得如何？"
      },
      {
        "speaker": "Tom",
        "en": "Actually <b>pretty good</b>. We got 38 points done vs 35 last sprint. Small improvement but we're trending the right way.",
        "cn": "实际上相当不错。我们完成了38个点对比上一个冲刺的35个。小小的改进但我们的趋势是正确的。"
      },
      {
        "speaker": "Amy",
        "en": "Nice! So what's the plan for next sprint? What should we <b>focus on</b>?",
        "cn": "太好了！那下一个冲刺的计划是什么？我们应该专注于什么？"
      },
      {
        "speaker": "Tom",
        "en": "<b>Top priority</b> is finishing that performance testing. Let's get that done first.",
        "cn": "首要任务是完成性能测试。让我们先把它做完。"
      },
      {
        "speaker": "Amy",
        "en": "Agreed. And should we <b>double down on</b> the pair programming?",
        "cn": "同意。我们应该加倍投入配对编程吗？"
      },
      {
        "speaker": "Tom",
        "en": "For sure. It's paying dividends. Let's aim for at least two sessions a week.",
        "cn": "当然可以。它在产生回报。让我们每周至少进行两次会议。"
      },
      {
        "speaker": "Amy",
        "en": "Perfect. Anything else to wrap up?",
        "cn": "完美。还有其他需要总结的吗？"
      }
    ]
  },
  {
    "id": "e5",
    "cat": "engineering",
    "catName": "工程",
    "catEmoji": "💻",
    "title": "Technical Debt Discussion",
    "titleCn": "技术债讨论",
    "emoji": "👨🏽‍💻",
    "lines": [
      {
        "speaker": "Kevin",
        "en": "Alright, so we need to talk about the elephant in the room. Our codebase is a mess.",
        "cn": "好的，所以我们需要谈论房间里的大象。我们的代码库是一个混乱。"
      },
      {
        "speaker": "Jessica",
        "en": "I mean, it works though. We shipped three features last month.",
        "cn": "我的意思是，它有效。我们上个月发布了三个功能。"
      },
      {
        "speaker": "Kevin",
        "en": "Yeah, but it's getting <b>harder and harder to ship</b>. Every change takes longer because we're constantly fighting legacy code.",
        "cn": "是的，但发布变得越来越难。每次改变都需要更长的时间，因为我们不断与遗留代码斗争。"
      },
      {
        "speaker": "Jessica",
        "en": "I get it, but we have product requests <b>stacking up</b>. If we spend time on refactoring, we're gonna miss our roadmap.",
        "cn": "我理解，但我们有产品请求在堆积。如果我们花时间进行重构，我们会错过我们的路线图。"
      },
      {
        "speaker": "Kevin",
        "en": "But that's the thing — <b>we're not actually going faster</b>. We're just making surface changes. The underlying problems remain.",
        "cn": "但问题是——我们实际上并没有更快。我们只是进行表面改变。潜在问题依然存在。"
      },
      {
        "speaker": "Jessica",
        "en": "So what are you suggesting?",
        "cn": "那么你建议什么？"
      },
      {
        "speaker": "Kevin",
        "en": "<b>We need to dedicate time</b> — maybe 20% of our capacity — to <b>pay down debt</b>. Fix the architecture, modernize the old modules.",
        "cn": "我们需要投入时间——也许是我们容量的20%——来偿还债务。修复架构，现代化旧模块。"
      },
      {
        "speaker": "Jessica",
        "en": "20% is a lot. That's basically two people for the whole sprint. We'd be <b>way behind on features</b>.",
        "cn": "20%是很多。那基本上是整个冲刺中的两个人。我们在功能上会远远落后。"
      },
      {
        "speaker": "Kevin",
        "en": "I understand the optics, but let me paint a picture. Right now, adding a new feature takes like three days of development. That's <b>a lot of overhead</b>.",
        "cn": "我理解表面现象，但让我描述一幅图景。现在，添加新功能需要大约三天的开发。那是很多开销。"
      },
      {
        "speaker": "Jessica",
        "en": "Three days? That's not that bad.",
        "cn": "三天？那不太糟糕。"
      },
      {
        "speaker": "Kevin",
        "en": "Because two of those days are fighting with the spaghetti code. <b>If we refactored</b> the auth layer, that feature would take one day.",
        "cn": "因为其中两天是与意大利面条代码的斗争。如果我们重构了认证层，那个功能只需要一天。"
      },
      {
        "speaker": "Jessica",
        "en": "Okay, so you're saying the math works out? We spend time now to save time later?",
        "cn": "好的，所以你是说数学有效？我们现在花时间以在后面节省时间？"
      },
      {
        "speaker": "Kevin",
        "en": "Exactly. It's an <b>investment</b>, not a cost. <b>Compound interest on time savings</b>.",
        "cn": "确切地说。这是一项投资，而不是成本。时间节省的复利。"
      },
      {
        "speaker": "Jessica",
        "en": "That makes sense. But how do we <b>sell this to the business</b>? They're gonna freak if we slow down feature shipping.",
        "cn": "这很有意义。但我们如何向企业兜售这个？如果我们减缓功能发布，他们会惊慌失措。"
      },
      {
        "speaker": "Kevin",
        "en": "We frame it as velocity improvement. Look, right now we're doing 30 points a sprint. If we pay down debt, we could be doing 45 points six months from now.",
        "cn": "我们把它框架化为速率改进。看，现在我们每个冲刺做30个点。如果我们偿还债务，六个月后我们可以做45个点。"
      },
      {
        "speaker": "Jessica",
        "en": "<b>That's assuming</b> the refactor actually helps. What if we spend all that time and nothing changes?",
        "cn": "那是假设重构实际上有帮助。如果我们花费所有时间而没有任何改变怎么办？"
      },
      {
        "speaker": "Kevin",
        "en": "It won't be a <b>blank check</b>. We define clear metrics. Reduce test setup time, reduce deployment time, reduce time per feature. If we don't see improvement, we course-correct.",
        "cn": "这不会是空白支票。我们定义明确的指标。减少测试设置时间，减少部署时间，减少每个功能的时间。如果我们没有看到改进，我们会更正航向。"
      },
      {
        "speaker": "Jessica",
        "en": "Okay, I'm sold. But we need to be <b>surgical about what we refactor</b>. Not just random stuff.",
        "cn": "好的，我被说服了。但我们需要对我们重构的内容进行精确处理。而不是随机的东西。"
      },
      {
        "speaker": "Kevin",
        "en": "Totally. Let's <b>create a prioritized list</b> of the most painful parts of the codebase.",
        "cn": "完全同意。让我们创建一个代码库最痛苦部分的优先级列表。"
      },
      {
        "speaker": "Jessica",
        "en": "Cool, I'll <b>sync with the team</b> and we can make a plan. But yeah, I think you're right. Let's do this.",
        "cn": "好的，我会与团队同步，我们可以制定计划。但是是的，我认为你是对的。让我们这样做。"
      }
    ]
  },
  {
    "id": "pp1",
    "cat": "manufacturing",
    "catName": "生产",
    "catEmoji": "🏭",
    "title": "Daily Production Standup",
    "titleCn": "每日生产立会",
    "emoji": "👷🏻‍♂️",
    "lines": [
      {
        "speaker": "Marcus",
        "en": "Alright, let's get through this quick. Sandra, how'd we do yesterday? <b>Are we on track</b>?",
        "cn": "好的，让我们快速完成。Sandra，我们昨天做得怎样？我们在轨道上吗？"
      },
      {
        "speaker": "Sandra",
        "en": "We <b>hit our production target</b> for the first shift, but second shift <b>came up short</b> by about 50 units.",
        "cn": "我们在第一班次达到了生产目标，但第二班次短少了大约50个单位。"
      },
      {
        "speaker": "Marcus",
        "en": "What happened? Did we have any <b>equipment downtime</b>?",
        "cn": "发生了什么？我们有任何设备停工时间吗？"
      },
      {
        "speaker": "Sandra",
        "en": "Yeah, the stamping machine <b>went down</b> for about 45 minutes. They got it back up by mid-afternoon.",
        "cn": "是的，冲压机宕了大约45分钟。他们在下午中期将其恢复。"
      },
      {
        "speaker": "Marcus",
        "en": "45 minutes is rough. <b>That impacts</b> our numbers pretty significantly.",
        "cn": "45分钟很糟糕。那大大影响了我们的数字。"
      },
      {
        "speaker": "Sandra",
        "en": "For sure. And third shift picked up some slack, but they're <b>running behind schedule</b> on the component assembly.",
        "cn": "当然。第三班次加快了步伐，但他们在组件装配上落后于计划。"
      },
      {
        "speaker": "Marcus",
        "en": "Okay, so what's the <b>bottleneck</b> on assembly? Is it a staffing issue?",
        "cn": "好的，所以组件装配的瓶颈是什么？是人员配置问题吗？"
      },
      {
        "speaker": "Sandra",
        "en": "A bit of both, actually. We're short two people today because of call-outs, and the new equipment isn't running as smooth as we'd hoped.",
        "cn": "实际上两者都有。由于请假，我们今天少了两个人，而新设备的运行不如我们希望的那样顺利。"
      },
      {
        "speaker": "Marcus",
        "en": "Ugh, and we can't really <b>push overtime</b> without approval. Let me check with management.",
        "cn": "呃，我们不能真正加班而不经过批准。让我与管理层确认。"
      },
      {
        "speaker": "Sandra",
        "en": "We might need it. If we don't <b>make up the shortfall</b>, we're gonna have an angry customer.",
        "cn": "我们可能需要它。如果我们不弥补不足，我们会有一个愤怒的客户。"
      },
      {
        "speaker": "Marcus",
        "en": "What's the deadline on that order?",
        "cn": "那个订单的截止日期是什么？"
      },
      {
        "speaker": "Sandra",
        "en": "Tomorrow end-of-day. We need to <b>ship</b> 500 units for the automotive client.",
        "cn": "明天日终。我们需要为汽车客户发运500个单位。"
      },
      {
        "speaker": "Marcus",
        "en": "Okay, that's tight. So realistically, what <b>can we deliver</b> today?",
        "cn": "好的，那很紧凑。那么现实地，我们今天能交付什么？"
      },
      {
        "speaker": "Sandra",
        "en": "If everything goes smoothly and we get those two people back, maybe 420 units. That leaves us 80 short.",
        "cn": "如果一切顺利，我们得到那两个人回来，也许420个单位。那让我们短少80个。"
      },
      {
        "speaker": "Marcus",
        "en": "80 short is a problem. Let's <b>call in</b> the team from packaging. They can help with final assembly.",
        "cn": "短少80个是个问题。让我们召集包装团队。他们可以帮助最终组装。"
      },
      {
        "speaker": "Sandra",
        "en": "Good idea. They've got some <b>downtime</b> in their schedule.",
        "cn": "好主意。他们的日程中有一些停工时间。"
      },
      {
        "speaker": "Marcus",
        "en": "Alright, get them prepped. We need to <b>ramp up</b> production on the line today.",
        "cn": "好的，让他们准备好。我们需要今天在生产线上提速。"
      },
      {
        "speaker": "Sandra",
        "en": "Will do. What about quality control? We'll be moving faster, which always makes QC <b>twitchy</b>.",
        "cn": "会的。质量控制呢？我们会更快地移动，这总是让质量控制变得神经质。"
      },
      {
        "speaker": "Marcus",
        "en": "Tell QC to <b>do spot checks</b> instead of the full inspection. Trust the process.",
        "cn": "告诉质量控制进行抽查而不是全面检查。相信这个过程。"
      },
      {
        "speaker": "Sandra",
        "en": "Got it. I'll keep you posted on our progress throughout the day.",
        "cn": "明白。我会在整个一天中让你了解我们的进展。"
      }
    ]
  },
  {
    "id": "pp2",
    "cat": "manufacturing",
    "catName": "生产",
    "catEmoji": "🏭",
    "title": "Capacity Planning Meeting",
    "titleCn": "产能规划会议",
    "emoji": "👷🏻‍♂️",
    "lines": [
      {
        "speaker": "Robert",
        "en": "Michelle, we need to <b>talk about next quarter's forecast</b>. I'm seeing some pretty aggressive numbers.",
        "cn": "Michelle，我们需要谈论下一季度的预测。我看到一些相当激进的数字。"
      },
      {
        "speaker": "Michelle",
        "en": "Yeah, sales is <b>projecting a 30% bump</b> in orders. That's huge.",
        "cn": "是的，销售部门预测订单增加30%。那很大。"
      },
      {
        "speaker": "Robert",
        "en": "So with our current staffing, we can't <b>handle that volume</b>. We're already running lean.",
        "cn": "所以根据我们目前的人员配置，我们无法处理那个量。我们已经在精益运营。"
      },
      {
        "speaker": "Michelle",
        "en": "I know. So we've got two options. Either we <b>bring on new hires</b> or we <b>amp up overtime</b>.",
        "cn": "我知道。所以我们有两个选择。要么我们招聘新员工，要么我们增加加班。"
      },
      {
        "speaker": "Robert",
        "en": "New hires take time to <b>ramp up</b>. We'd need at least 3-4 weeks of training.",
        "cn": "新员工需要时间来提速。我们至少需要3-4周的培训。"
      },
      {
        "speaker": "Michelle",
        "en": "True. And overtime costs us more per unit. But it's faster to implement.",
        "cn": "真的。加班的单位成本更高。但它实施速度更快。"
      },
      {
        "speaker": "Robert",
        "en": "How much would we save if we went with headcount instead?",
        "cn": "如果我们采用人员配置，我们会节省多少？"
      },
      {
        "speaker": "Michelle",
        "en": "Well, let's see. <b>Overtime is</b> about 50% more expensive per hour. But that's just labor. Headcount also means benefits, <b>ramp-up time</b>, turnover risk.",
        "cn": "好吧，让我们看看。加班大约每小时贵50%。但那只是劳动力。人员配置也意味着福利、提速时间、离职风险。"
      },
      {
        "speaker": "Robert",
        "en": "So it's a tradeoff. <b>Short term</b>, overtime is faster and easier. <b>Long term</b>, headcount makes more sense.",
        "cn": "所以这是一个权衡。短期来看，加班更快更容易。长期来看，人员配置更有意义。"
      },
      {
        "speaker": "Michelle",
        "en": "Exactly. But we also need to think about <b>burnout</b>. Running people overtime for months isn't sustainable.",
        "cn": "正确。但我们也需要考虑倦怠。让人加班几个月是不可持续的。"
      },
      {
        "speaker": "Robert",
        "en": "That's the thing. Our team is already <b>stretched thin</b>. Another quarter of heavy overtime could hurt morale.",
        "cn": "这就是问题。我们的团队已经人手不足。再一个季度的繁重加班可能会损害士气。"
      },
      {
        "speaker": "Michelle",
        "en": "So what do you want to do? I say we do a hybrid approach.",
        "cn": "那你想做什么？我说我们采取混合方法。"
      },
      {
        "speaker": "Robert",
        "en": "Like what?",
        "cn": "比如什么？"
      },
      {
        "speaker": "Michelle",
        "en": "We <b>post the jobs</b> now for new hires, but in the meantime, we <b>implement a modest overtime plan</b> to bridge the gap.",
        "cn": "我们现在发布新员工的职位，但同时，我们实施一个适度的加班计划来弥补差距。"
      },
      {
        "speaker": "Robert",
        "en": "How much overtime we talking?",
        "cn": "我们谈论多少加班？"
      },
      {
        "speaker": "Michelle",
        "en": "Maybe an extra 8-10 hours per week per person, max. Nothing crazy. And we <b>rotate it</b> so nobody <b>bears the brunt</b>.",
        "cn": "也许每个人每周额外8-10小时，最多。没什么疯狂的。我们轮转它，这样没有人承担重压。"
      },
      {
        "speaker": "Robert",
        "en": "That's reasonable. But we also need to <b>accelerate training</b> so new people can <b>hit the ground running</b>.",
        "cn": "这是合理的。但我们也需要加快培训，以便新人能快速上手。"
      },
      {
        "speaker": "Michelle",
        "en": "I'll work with HR on that. And we should <b>bring in a temp agency</b> as backup. In case things get worse than expected.",
        "cn": "我会与人力资源部合作。我们应该引入临时机构作为备份。以防万一情况比预期更糟。"
      },
      {
        "speaker": "Robert",
        "en": "Good thinking. What's the timeline? When do we need to have this <b>locked in</b>?",
        "cn": "好想法。时间表是什么？我们需要什么时候把这个确定下来？"
      },
      {
        "speaker": "Michelle",
        "en": "ASAP. We're already getting early orders for Q1. If we wait, we'll be <b>in the weeds</b> by the time we react.",
        "cn": "尽快。我们已经在为Q1获得早期订单。如果我们等待，我们反应时就会陷入困境。"
      }
    ]
  },
  {
    "id": "pp3",
    "cat": "manufacturing",
    "catName": "生产",
    "catEmoji": "🏭",
    "title": "Quality Issue Escalation",
    "titleCn": "质量问题上报",
    "emoji": "👷🏻‍♂️",
    "lines": [
      {
        "speaker": "Carlos",
        "en": "Lisa, we've got a problem. QC just flagged some units from line two.",
        "cn": "Lisa，我们有个问题。质量控制刚刚标记了生产线二的一些单位。"
      },
      {
        "speaker": "Lisa",
        "en": "What kind of issue?",
        "cn": "什么样的问题？"
      },
      {
        "speaker": "Carlos",
        "en": "<b>Dimensional tolerance</b> is off on the mounting brackets. We're <b>out of spec</b> on three batches.",
        "cn": "安装支架的尺寸公差有偏差。我们三个批次超出规格。"
      },
      {
        "speaker": "Lisa",
        "en": "How many units are we talking?",
        "cn": "我们在谈论多少个单位？"
      },
      {
        "speaker": "Carlos",
        "en": "About 240 units across the three batches. We need to <b>stop the line</b> and <b>contain this</b> ASAP.",
        "cn": "三个批次共约240个单位。我们需要立即停止生产线并控制住这个问题。"
      },
      {
        "speaker": "Lisa",
        "en": "Hold on, 240 units? That's a lot. Have any of these already <b>shipped out</b>?",
        "cn": "等等，240个单位？那很多。这些是否已经发货了？"
      },
      {
        "speaker": "Carlos",
        "en": "No, thank God. They're still in our warehouse. But if a customer got these, it'd be a disaster.",
        "cn": "不，感谢上帝。他们仍在我们的仓库里。但如果客户收到这些，那将是一场灾难。"
      },
      {
        "speaker": "Lisa",
        "en": "Okay, first step — <b>quarantine all 240 units</b>. Don't let anything leave the facility.",
        "cn": "好的，第一步——隔离全部240个单位。不要让任何东西离开工厂。"
      },
      {
        "speaker": "Carlos",
        "en": "Already done. But now we have to figure out <b>root cause</b>. Was it a tooling issue? A setup problem?",
        "cn": "已经做好了。但现在我们必须找出根本原因。是工具问题吗？安装问题？"
      },
      {
        "speaker": "Lisa",
        "en": "When did this start? Like, did every batch have the issue or just some?",
        "cn": "这什么时候开始的？比如，每个批次都有问题还是只有一些？"
      },
      {
        "speaker": "Carlos",
        "en": "Started on Tuesday morning with the first batch. All three batches show the same defect pattern.",
        "cn": "周二早上从第一个批次开始。所有三个批次都显示相同的缺陷模式。"
      },
      {
        "speaker": "Lisa",
        "en": "Okay, that points to <b>tooling wear</b> or a calibration drift. Did maintenance do anything Tuesday morning?",
        "cn": "好的，那指向工具磨损或校准漂移。周二早上维护做了什么吗？"
      },
      {
        "speaker": "Carlos",
        "en": "Yeah, they swapped out the cutting tool Tuesday at 6 AM. That's probably the culprit.",
        "cn": "是的，他们周二早上6点交换了切割工具。那可能是罪魁祸首。"
      },
      {
        "speaker": "Lisa",
        "en": "We need to <b>escalate this</b> to the customer immediately. No hiding this.",
        "cn": "我们需要立即向客户上报这一点。不能隐瞒。"
      },
      {
        "speaker": "Carlos",
        "en": "I was worried about that. What do we say to them?",
        "cn": "我对此感到担忧。我们对他们说什么？"
      },
      {
        "speaker": "Lisa",
        "en": "We be transparent. We caught it, we're <b>implementing a corrective action</b>, and we'll <b>rework or replace</b> the units.",
        "cn": "我们要透明。我们发现了它，我们正在实施纠正措施，我们将返工或更换这些单位。"
      },
      {
        "speaker": "Carlos",
        "en": "That's gonna hurt our margins on this order.",
        "cn": "那会伤害这个订单的利润率。"
      },
      {
        "speaker": "Lisa",
        "en": "Yeah, but it's the right call. It'll cost us way more if we let bad units get into the field. We'd be looking at recalls.",
        "cn": "是的，但这是正确的决定。如果我们让坏单位进入现场，成本会更高。我们会面临召回。"
      },
      {
        "speaker": "Carlos",
        "en": "True. So <b>rework plan</b> — can the bracket dimensions be fixed?",
        "cn": "真的。所以返工计划——支架尺寸可以修复吗？"
      },
      {
        "speaker": "Lisa",
        "en": "I think so. We can <b>rerun them through the milling operation</b> with the corrected tool. Let me check with engineering.",
        "cn": "我认为可以。我们可以用纠正的工具重新通过铣削操作运行它们。让我与工程部确认。"
      }
    ]
  },
  {
    "id": "pp4",
    "cat": "manufacturing",
    "catName": "生产",
    "catEmoji": "🏭",
    "title": "New Product Launch Prep",
    "titleCn": "新产品发布准备",
    "emoji": "👷🏻‍♂️",
    "lines": [
      {
        "speaker": "Andrew",
        "en": "So we're launching the new widget line next month. This is a big deal for us.",
        "cn": "所以我们下个月推出新的小部件线。这对我们来说很重要。"
      },
      {
        "speaker": "Diana",
        "en": "Yeah, and the ramp is gonna be aggressive. They want 10,000 units in the first month.",
        "cn": "是的，提速会很激进。他们想要第一个月10,000个单位。"
      },
      {
        "speaker": "Andrew",
        "en": "10,000? That's aggressive. Do we have all the equipment in place?",
        "cn": "10,000？那很激进。我们有所有设备就位吗？"
      },
      {
        "speaker": "Diana",
        "en": "Not yet. The new stamping machine is arriving Wednesday. We have until then to <b>set it up</b> and <b>run test batches</b>.",
        "cn": "还没有。新的冲压机周三到达。我们有时间来设置它并运行测试批次。"
      },
      {
        "speaker": "Andrew",
        "en": "Wednesday? That's tight. How long do we need for <b>tool validation</b>?",
        "cn": "周三？那很紧凑。我们需要多长时间进行工具验证？"
      },
      {
        "speaker": "Diana",
        "en": "Minimum two days if everything goes right. But you know how NPI can be — stuff breaks.",
        "cn": "最少两天如果一切顺利。但你知道新产品导入会怎样——东西坏掉。"
      },
      {
        "speaker": "Andrew",
        "en": "Yeah. So our <b>go-live date</b> is when?",
        "cn": "是的。那么我们的上线日期是什么时候？"
      },
      {
        "speaker": "Diana",
        "en": "Three weeks. We're supposed to have the line fully operational by then.",
        "cn": "三周。我们应该在那时完全操作化。"
      },
      {
        "speaker": "Andrew",
        "en": "That's not a lot of buffer. What about staffing? Do we have enough people trained on the new equipment?",
        "cn": "那没有太多缓冲。人员配置呢？我们有足够的人员接受新设备培训吗？"
      },
      {
        "speaker": "Diana",
        "en": "That's the thing — we're <b>pulling people from other lines</b> to get them up to speed. It means we're gonna be <b>short-handed</b> elsewhere.",
        "cn": "这就是问题——我们从其他线拉人来让他们跟上。这意味着我们在其他地方会人手不足。"
      },
      {
        "speaker": "Andrew",
        "en": "We need to <b>document the process</b> really well so <b>ramp-up is smooth</b>.",
        "cn": "我们需要非常好地记录这个过程，这样提速会很顺利。"
      },
      {
        "speaker": "Diana",
        "en": "Already on it. We're doing <b>process documentation</b> and <b>work instructions</b> for every step.",
        "cn": "已经在做了。我们为每一步做流程文档和工作说明。"
      },
      {
        "speaker": "Andrew",
        "en": "Good. And what about quality? Are we gonna <b>inspect every unit</b> early on?",
        "cn": "好的。质量呢？我们会在早期检查每个单位吗？"
      },
      {
        "speaker": "Diana",
        "en": "Yeah, 100% inspection for the first 5,000 units, then we can <b>dial it back</b> if the process stabilizes.",
        "cn": "是的，前5,000个单位进行100%检查，然后如果流程稳定化，我们可以减少检查。"
      },
      {
        "speaker": "Andrew",
        "en": "Smart. <b>That's a lot of labor</b>, but it's worth it to avoid field failures.",
        "cn": "聪明。那是很多劳动力，但为了避免现场故障是值得的。"
      },
      {
        "speaker": "Diana",
        "en": "Exactly. And we're bringing in a <b>process engineer</b> from corporate to oversee the first few runs.",
        "cn": "确切地说。我们从公司带来一个流程工程师来监督前几次运行。"
      },
      {
        "speaker": "Andrew",
        "en": "That'll help. What's the contingency plan if something goes wrong?",
        "cn": "那会有帮助。如果出问题，应急计划是什么？"
      },
      {
        "speaker": "Diana",
        "en": "If the new line <b>fails to ramp</b>, we've got capacity on line three to do overflow. It's not ideal, but it's something.",
        "cn": "如果新线提速失败，我们在线三有容量做溢出。不理想，但总比没有好。"
      },
      {
        "speaker": "Andrew",
        "en": "That makes sense. Are we prepping the supply chain? New materials flow in okay?",
        "cn": "那有意义。我们准备好供应链了吗？新材料流动正常吗？"
      },
      {
        "speaker": "Diana",
        "en": "Working with procurement on that. But yeah, we need <b>first article inspection</b> on the new materials too.",
        "cn": "与采购部合作。但是是的，我们也需要对新材料进行首批检查。"
      }
    ]
  },
  {
    "id": "pp5",
    "cat": "manufacturing",
    "catName": "生产",
    "catEmoji": "🏭",
    "title": "Equipment Downtime & Maintenance",
    "titleCn": "设备停工与维护",
    "emoji": "👷🏻‍♂️",
    "lines": [
      {
        "speaker": "Ed",
        "en": "Priya, I've got a nightmare on my hands. The conveyor on line four just <b>went down</b>.",
        "cn": "Priya，我手上有个噩梦。四号线的传送带刚刚宕掉了。"
      },
      {
        "speaker": "Priya",
        "en": "Line four? That's our highest volume line. What happened?",
        "cn": "四号线？那是我们的最高产量线。发生了什么？"
      },
      {
        "speaker": "Ed",
        "en": "Drive motor <b>quit on us</b>. Completely dead. No movement, no nothing.",
        "cn": "驱动马达对我们来说坏掉了。完全死掉了。没有运动，什么都没有。"
      },
      {
        "speaker": "Priya",
        "en": "Oh man. <b>That's a big component</b>. Do we have a spare?",
        "cn": "哦天哪。那是一个很大的部件。我们有备件吗？"
      },
      {
        "speaker": "Ed",
        "en": "That's the thing — we don't have one in stock. <b>It's on backorder</b>.",
        "cn": "就是这样——我们库存里没有。它在订单中。"
      },
      {
        "speaker": "Priya",
        "en": "<b>How long is the lead time</b>? Like, how fast can we get one?",
        "cn": "交付时间是多长？比如，我们多快能拿到一个？"
      },
      {
        "speaker": "Ed",
        "en": "Four to six weeks from the supplier. That's insane for critical equipment.",
        "cn": "从供应商那里四到六周。这对于关键设备来说太疯狂了。"
      },
      {
        "speaker": "Priya",
        "en": "Can we repair it? Is there any chance the motor can be <b>rebuilt</b>?",
        "cn": "我们能修理它吗？马达有任何被重建的机会吗？"
      },
      {
        "speaker": "Ed",
        "en": "Let me check with the motor specialist. He might be able to <b>diagnose it</b> and see if it's worth <b>refurbishing</b>.",
        "cn": "让我与电动机专家确认。他可能能够诊断并查看是否值得翻新。"
      },
      {
        "speaker": "Priya",
        "en": "How long would refurbishing take?",
        "cn": "翻新需要多长时间？"
      },
      {
        "speaker": "Ed",
        "en": "Best case? A few days. But we're <b>looking at</b> a week or two if there's damage.",
        "cn": "最好的情况？几天。但如果有损坏，我们在看一到两周。"
      },
      {
        "speaker": "Priya",
        "en": "Okay, so in the meantime, we're dead in the water on line four. What's our <b>contingency</b>?",
        "cn": "好的，那么在此期间，我们在四号线死掉了。我们的应急预案是什么？"
      },
      {
        "speaker": "Ed",
        "en": "We could <b>divert the production</b> to line three, but that means we'll slow everything else down.",
        "cn": "我们可以将生产转移到三号线，但这意味着我们会减缓所有其他东西。"
      },
      {
        "speaker": "Priya",
        "en": "How much capacity does line three have?",
        "cn": "三号线有多少容量？"
      },
      {
        "speaker": "Ed",
        "en": "<b>About 70% of what line four does</b>. So we're still gonna <b>lose production</b> either way.",
        "cn": "大约是四号线的70%。所以无论如何我们都会损失生产。"
      },
      {
        "speaker": "Priya",
        "en": "This is the second motor failure in six months. We need to <b>get ahead of this</b>. Let's <b>order a backup motor</b> immediately.",
        "cn": "这是六个月内第二次电动机故障。我们需要处理这个。让我们立即订购备用电动机。"
      },
      {
        "speaker": "Ed",
        "en": "That's a capital expense. Won't fly with management without justification.",
        "cn": "那是资本支出。没有正当理由不会被管理层批准。"
      },
      {
        "speaker": "Priya",
        "en": "The justification is we just lost how many units today? Calculate the cost of downtime.",
        "cn": "正当理由是我们今天损失了多少单位？计算停工成本。"
      },
      {
        "speaker": "Ed",
        "en": "Fair point. At current production rates, we're losing about 50 units an hour.",
        "cn": "公平的观点。以目前的生产率，我们每小时损失大约50个单位。"
      },
      {
        "speaker": "Priya",
        "en": "So if we're down for a week, that's 8,000 units at a loss. A spare motor costs way less than that.",
        "cn": "所以如果我们宕一周，那是损失8,000个单位。备用电动机的成本远低于此。"
      }
    ]
  },
  {
    "id": "wh1",
    "cat": "warehouse",
    "catName": "仓库",
    "catEmoji": "🏬",
    "title": "Inventory Discrepancy Investigation",
    "titleCn": "库存差异调查",
    "emoji": "👷🏻",
    "lines": [
      {
        "speaker": "Mike",
        "en": "Hey Sarah, we've got a <b>major discrepancy</b> here. The cycle count is showing we're short like 200 units of SKU 4491.",
        "cn": "嘿Sarah，我们这里有个重大差异。盘点显示我们SKU 4491缺少大约200件。"
      },
      {
        "speaker": "Sarah",
        "en": "200? That's <b>not insignificant</b>. Let me pull up the system. When was the last count?",
        "cn": "200件？那不是小数目。让我查一下系统。上次盘点是什么时候？"
      },
      {
        "speaker": "Mike",
        "en": "Two weeks ago. Everything matched then. So we're looking at either a <b>data entry error</b> or we've got <b>shrinkage</b>.",
        "cn": "两周前。那时一切都吻合。所以我们要么有数据输入错误，要么有损耗。"
      },
      {
        "speaker": "Sarah",
        "en": "Okay, <b>walk me through</b> this. What items are missing? Any pattern?",
        "cn": "好的，给我走一遍。丢失的是哪些物品？有规律吗？"
      },
      {
        "speaker": "Mike",
        "en": "All from Aisle C, zone 3. That's where we keep the higher-value stuff. I'm <b>gonna call it in</b> to the manager.",
        "cn": "都来自C通道，第3区。那是我们放高价值物品的地方。我打算把这事报告给经理。"
      },
      {
        "speaker": "Sarah",
        "en": "Yeah, do that. I'll go back and <b>double-check</b> the receiving log. Maybe something didn't get scanned.",
        "cn": "好的，你去做。我会回头重新检查收货日志。也许有东西没被扫描。"
      },
      {
        "speaker": "Mike",
        "en": "Good call. And hey, we should <b>review the camera footage</b> for that zone. If it's theft, we need to <b>nip it in the bud</b>.",
        "cn": "好主意。而且，我们应该查一下那个区域的摄像头录像。如果是偷窃，我们需要尽早制止。"
      },
      {
        "speaker": "Sarah",
        "en": "Absolutely. Look, <b>don't say anything</b> to the crew yet. We don't want to <b>start a witch hunt</b>.",
        "cn": "当然。听着，先别告诉工人们。我们不想引起恐慌。"
      },
      {
        "speaker": "Mike",
        "en": "Right. <b>Keep it quiet</b> for now. I'll loop in management first thing in the morning.",
        "cn": "对。暂时先保密。我明天一早会通知管理层。"
      },
      {
        "speaker": "Sarah",
        "en": "Perfect. Let's meet at like 8 AM before the shift? We can <b>lay out the facts</b>.",
        "cn": "完美。咱们早上8点见？我们可以列出事实。"
      },
      {
        "speaker": "Mike",
        "en": "<b>You got it</b>. I'll have the numbers ready.",
        "cn": "没问题。我会准备好数字。"
      },
      {
        "speaker": "Sarah",
        "en": "One more thing—did we have any <b>dock returns</b> that might not have been logged?",
        "cn": "还有一件事——我们有任何没有记录的退货吗？"
      },
      {
        "speaker": "Mike",
        "en": "Good point. I remember we had a <b>vendor pickup</b> last Tuesday. Let me <b>check the manifest</b>.",
        "cn": "好主意。我记得上周二有一个卖家取货。让我检查一下清单。"
      },
      {
        "speaker": "Sarah",
        "en": "Yeah, if those units weren't marked as outbound, the system would still think they're here.",
        "cn": "对，如果那些单位没有标记为出站，系统仍然会认为它们在这里。"
      },
      {
        "speaker": "Mike",
        "en": "That could <b>explain the gap</b>. Fingers crossed. Let's go dig into this.",
        "cn": "那可能会解释差异。祈祷是这样。让我们去查一下。"
      },
      {
        "speaker": "Sarah",
        "en": "<b>For sure</b>. Better than theft.",
        "cn": "肯定。总比被偷好。"
      },
      {
        "speaker": "Mike",
        "en": "No kidding. Thanks for jumping on this with me.",
        "cn": "没错。谢谢你和我一起处理这个。"
      },
      {
        "speaker": "Sarah",
        "en": "That's what <b>we're here for</b>. Team effort.",
        "cn": "那就是我们来这里的目的。团队合作。"
      },
      {
        "speaker": "Mike",
        "en": "Alright, let me grab the forklift and head to Aisle C.",
        "cn": "好的，让我拿起叉车，去C通道。"
      },
      {
        "speaker": "Sarah",
        "en": "Cool. Catch you in a bit.",
        "cn": "好的。稍会见。"
      }
    ]
  },
  {
    "id": "wh2",
    "cat": "warehouse",
    "catName": "仓库",
    "catEmoji": "🏬",
    "title": "Shipping Deadline Crunch",
    "titleCn": "出货截止日期紧张",
    "emoji": "🧑🏽‍🔧",
    "lines": [
      {
        "speaker": "Tom",
        "en": "Okay Lisa, we've got a <b>rush order</b> that needs to <b>ship out today</b>. Big customer, 5,000 units.",
        "cn": "好的，Lisa，我们有个紧急订单需要今天出货。大客户，5000件。"
      },
      {
        "speaker": "Lisa",
        "en": "Today? Come on, Tom, it's already 2 PM. <b>That's cutting it close</b>.",
        "cn": "今天？拜托，Tom，已经下午2点了。这太紧张了。"
      },
      {
        "speaker": "Tom",
        "en": "I know, I know. But this is a <b>high-value account</b>. We can't blow this. Can we <b>make it happen</b>?",
        "cn": "我知道，我知道。但这是一个高价值客户。我们不能搞砸这个。我们能做到吗？"
      },
      {
        "speaker": "Lisa",
        "en": "Let me be real with you—it's gonna be <b>super tight</b>. I need to <b>pull everyone in</b> from the other areas.",
        "cn": "让我跟你实话实说——会非常紧张。我需要从其他区域把所有人都调过来。"
      },
      {
        "speaker": "Tom",
        "en": "Do it. I'll <b>authorize the overtime</b>. Just make sure we <b>get it done</b>.",
        "cn": "去做吧。我授权加班。确保我们完成。"
      },
      {
        "speaker": "Lisa",
        "en": "Alright, first I need to <b>confirm the pick list</b> with the system. Let me check if everything's in stock.",
        "cn": "好的，首先我需要与系统确认拣货清单。让我检查一下是否所有物品都有货。"
      },
      {
        "speaker": "Tom",
        "en": "Good. And once you've got the <b>pick confirmed</b>, <b>get your team on it</b> ASAP.",
        "cn": "好的。一旦你确认了拣货，立即让你的团队开始。"
      },
      {
        "speaker": "Lisa",
        "en": "We'll need to <b>move fast but careful</b>. Mistakes cost us more time and the customer gets mad.",
        "cn": "我们需要快速但小心。错误会花费我们更多时间，客户会生气。"
      },
      {
        "speaker": "Tom",
        "en": "Exactly. <b>Quality over speed</b>. We don't want to ship a broken order.",
        "cn": "完全同意。质量优于速度。我们不想发送一个损坏的订单。"
      },
      {
        "speaker": "Lisa",
        "en": "Got it. I'm heading to the warehouse floor right now. What's the <b>cutoff time</b> for loading?",
        "cn": "明白了。我现在就要去仓库。装车的截止时间是什么？"
      },
      {
        "speaker": "Tom",
        "en": "<b>Let's aim for</b> 6 PM. That gives us time to get it to the carrier before they close.",
        "cn": "我们的目标是下午6点。这样给我们时间把它送到运营商，他们在关闭前。"
      },
      {
        "speaker": "Lisa",
        "en": "6 PM, okay. That's <b>4 hours</b>. It's gonna be <b>tight but doable</b>. I'll get Miguel and the evening crew ready.",
        "cn": "下午6点，好的。就4小时。会很紧张但可行。我会让Miguel和夜班队伍准备好。"
      },
      {
        "speaker": "Tom",
        "en": "Thanks, Lisa. I owe you one. Call me if you <b>run into any issues</b>.",
        "cn": "谢谢，Lisa。我欠你一个人情。如果你遇到任何问题，给我打电话。"
      },
      {
        "speaker": "Lisa",
        "en": "Will do. First issue—are we packing these in the usual boxes or <b>special packaging</b>?",
        "cn": "会的。第一个问题——我们用通常的盒子还是特殊包装？"
      },
      {
        "speaker": "Tom",
        "en": "Good question. Let me check with the customer. I'll text you the spec sheet.",
        "cn": "好问题。让我与客户确认。我会给你发规格说明书。"
      },
      {
        "speaker": "Lisa",
        "en": "Do that ASAP, yeah? We need <b>zero delays</b>.",
        "cn": "尽快做好，好吗？我们需要零延误。"
      },
      {
        "speaker": "Tom",
        "en": "One sec. Okay, I've got it—standard boxes with <b>foam inserts</b>. You good?",
        "cn": "等等。好的，我知道了——带泡沫衬垫的标准盒。没问题吗？"
      },
      {
        "speaker": "Lisa",
        "en": "Perfect. That's what we have on hand. Alright, I'm going to <b>rally the troops</b> and get moving.",
        "cn": "完美。那就是我们现有的。好的，我要集结队伍并开始行动。"
      },
      {
        "speaker": "Tom",
        "en": "Let's go. This is gonna be a <b>long night</b> for your crew, but let's make it happen.",
        "cn": "行动吧。对你的队伍来说会是漫长的一夜，但我们会做到。"
      },
      {
        "speaker": "Lisa",
        "en": "Will do. I'll give you an update in an hour. <b>Fingers crossed</b>!",
        "cn": "会的。我一小时后给你更新。祈祷一切顺利！"
      }
    ]
  },
  {
    "id": "wh3",
    "cat": "warehouse",
    "catName": "仓库",
    "catEmoji": "🏬",
    "title": "Receiving Inspection and Damage Claims",
    "titleCn": "收货检查与损坏索赔",
    "emoji": "👷🏻",
    "lines": [
      {
        "speaker": "Danny",
        "en": "Hey Jessica, we've got a problem. This pallet from Valley Distributors has <b>visible damage</b>.",
        "cn": "嘿Jessica，我们有个问题。来自Valley Distributors的这个托盘有明显损坏。"
      },
      {
        "speaker": "Jessica",
        "en": "What kind of damage? Just surface stuff or is the <b>merchandise damaged</b>?",
        "cn": "什么样的损坏？只是表面还是商品本身有损坏？"
      },
      {
        "speaker": "Danny",
        "en": "It's both. The box got crushed, and I can see inside—like half the units are <b>broken or warped</b>.",
        "cn": "两者都有。箱子被压扁了，我可以看到里面——大约一半的单位破损或变形。"
      },
      {
        "speaker": "Jessica",
        "en": "Okay, we need to <b>document everything</b>. Take photos of the damage, the label, serial number—everything.",
        "cn": "好的，我们需要记录所有内容。给损坏、标签、序列号拍照——所有内容。"
      },
      {
        "speaker": "Danny",
        "en": "Already on it. See? I'm shooting photos right now. <b>Pretty bad</b>, right?",
        "cn": "已经开始了。看？我现在正在拍照。相当糟糕，对吧？"
      },
      {
        "speaker": "Jessica",
        "en": "Yeah, that's definitely <b>not acceptable</b>. Okay, so here's what we do: <b>do not put this away</b>. Leave it on the dock.",
        "cn": "对，那肯定不可接受。好的，这就是我们的做法：不要把它收起来。把它留在码头。"
      },
      {
        "speaker": "Danny",
        "en": "So we're gonna <b>reject the shipment</b>?",
        "cn": "所以我们打算拒收这批货？"
      },
      {
        "speaker": "Jessica",
        "en": "We're gonna <b>file a claim</b> with the carrier and the vendor. We need to <b>hold onto it</b> as evidence.",
        "cn": "我们打算向承运商和卖方提出索赔。我们需要保留它作为证据。"
      },
      {
        "speaker": "Danny",
        "en": "What if they say it's our fault? Like, <b>our handling</b> caused the damage?",
        "cn": "如果他们说这是我们的错怎么办？比如，我们的搬运导致了损坏？"
      },
      {
        "speaker": "Jessica",
        "en": "That's why we document <b>every single detail</b>. The box was damaged when it arrived, not after. We've got proof.",
        "cn": "这就是为什么我们记录每一个细节。箱子在到达时就被损坏了，不是之后。我们有证据。"
      },
      {
        "speaker": "Danny",
        "en": "Cool. So what's the <b>next step</b>? Do I call the vendor?",
        "cn": "好的。那么下一步是什么？我应该给卖方打电话吗？"
      },
      {
        "speaker": "Jessica",
        "en": "No, <b>I'll handle the vendor</b>. You send the photos to me and to our claims department. Mark it <b>urgent</b>.",
        "cn": "不，我来处理卖方。你把照片发给我和我们的索赔部门。标记为紧急。"
      },
      {
        "speaker": "Danny",
        "en": "Done. I'll email them in two minutes. Should I also note the <b>skus</b> that are damaged?",
        "cn": "好的。我两分钟后给他们发邮件。我也应该记下受损的SKU吗？"
      },
      {
        "speaker": "Jessica",
        "en": "Yes, absolutely. List every SKU, the <b>quantity affected</b>, and the type of damage for each.",
        "cn": "是的，绝对要。列出每个SKU、受影响的数量和每个的损坏类型。"
      },
      {
        "speaker": "Danny",
        "en": "Okay, that's like maybe 40 units across 6 different SKUs. This is gonna be a <b>pain to track</b>.",
        "cn": "好的，可能跨越6个不同的SKU有大约40件。这会很难追踪。"
      },
      {
        "speaker": "Jessica",
        "en": "Yeah, I know. But we need to be <b>super detailed</b> or they'll <b>deny our claim</b>.",
        "cn": "是的，我知道。但我们需要非常详细，否则他们会拒绝我们的索赔。"
      },
      {
        "speaker": "Danny",
        "en": "Fair point. <b>What's our window</b> to file? Like, do we have to do it today?",
        "cn": "有道理。我们的提交窗口是什么？比如，我们必须今天提交吗？"
      },
      {
        "speaker": "Jessica",
        "en": "<b>ASAP</b>. Carrier claims usually have to be filed within 48 hours or <b>you lose the right</b> to claim.",
        "cn": "越快越好。承运商索赔通常必须在48小时内提交，否则你失去索赔权。"
      },
      {
        "speaker": "Danny",
        "en": "Okay, I'm on it. I'll send everything in the next hour.",
        "cn": "好的，我去处理。我会在下一个小时内发送所有内容。"
      },
      {
        "speaker": "Jessica",
        "en": "Good. And hey, thanks for <b>catching this</b>. If we'd shipped this to the customer, it would be a nightmare.",
        "cn": "好的。谢谢你发现了这个。如果我们把它发给客户，那就太糟了。"
      }
    ]
  },
  {
    "id": "wh4",
    "cat": "warehouse",
    "catName": "仓库",
    "catEmoji": "🏬",
    "title": "Warehouse Layout Optimization",
    "titleCn": "仓库布局优化",
    "emoji": "🧑🏽‍🔧",
    "lines": [
      {
        "speaker": "Carlos",
        "en": "Ahmed, look at these numbers. Our <b>average pick time</b> per order is like 45 minutes. That's <b>way too slow</b>.",
        "cn": "Ahmed，看看这些数字。我们每订单的平均拣货时间约45分钟。这太慢了。"
      },
      {
        "speaker": "Ahmed",
        "en": "Yeah, I ran the analysis. The problem is <b>our layout</b>. A lot of <b>fast-moving SKUs</b> are stuck in the back.",
        "cn": "对，我运行了分析。问题是我们的布局。很多快速流动的SKU卡在后面。"
      },
      {
        "speaker": "Carlos",
        "en": "So we need to <b>reorganize the slots</b>? Like, move high-volume stuff closer to packing?",
        "cn": "所以我们需要重新组织库位？比如，把高量的物品移得更靠近打包？"
      },
      {
        "speaker": "Ahmed",
        "en": "Exactly. That's the whole idea. <b>ABC analysis</b>—put your A items (high volume) in easy-access spots.",
        "cn": "完全同意。那是个好主意。ABC分析——把你的A物品（高量）放在易于访问的地方。"
      },
      {
        "speaker": "Carlos",
        "en": "Okay, so what's the time savings we're looking at if we <b>optimize the layout</b>?",
        "cn": "好的，那么如果我们优化布局，时间节省是多少？"
      },
      {
        "speaker": "Ahmed",
        "en": "Based on my model, if we move the top 200 SKUs closer, we could cut pick time by like 30%. That's down to maybe 30-32 minutes.",
        "cn": "根据我的模型，如果我们把排名前200的SKU移得更靠近，我们可以减少大约30%的拣货时间。大约30-32分钟。"
      },
      {
        "speaker": "Carlos",
        "en": "That's significant. How long would a <b>full reorganization</b> take?",
        "cn": "那很重要。完整的重组需要多长时间？"
      },
      {
        "speaker": "Ahmed",
        "en": "We'd need like 2-3 days with the whole team working. But we could do a <b>phase-one rollout</b> of just the high-motion zone.",
        "cn": "我们需要整个团队花费2-3天。但我们可以进行只是高流量区域的第一阶段推出。"
      },
      {
        "speaker": "Carlos",
        "en": "I like that better. Less disruption. When would you want to do this?",
        "cn": "我更喜欢这样。干扰更少。你什么时候想做这个？"
      },
      {
        "speaker": "Ahmed",
        "en": "Next Sunday when we're closed. <b>Zero orders coming in</b> that day, so we can really focus.",
        "cn": "下周日我们关闭的时候。那天没有订单进来，所以我们可以真正专注。"
      },
      {
        "speaker": "Carlos",
        "en": "Good. I'll get approval from the director. What do we need in terms of <b>equipment</b> or supplies?",
        "cn": "好的。我会从主管那里获得批准。在设备或供应方面我们需要什么？"
      },
      {
        "speaker": "Ahmed",
        "en": "Not much. Maybe some new <b>shelf labels</b> and <b>location codes</b>. I've got a new <b>bin system</b> we could test.",
        "cn": "不多。也许一些新的货架标签和位置代码。我有一个新的箱子系统，我们可以测试。"
      },
      {
        "speaker": "Carlos",
        "en": "How much is that gonna cost us?",
        "cn": "那会花多少钱？"
      },
      {
        "speaker": "Ahmed",
        "en": "Maybe $2K for labels and supplies. The real <b>win</b> is the labor savings—we're talking thousands per month.",
        "cn": "也许标签和供应品2000美元。真正的收益是劳动力节省——我们谈论每月数千美元。"
      },
      {
        "speaker": "Carlos",
        "en": "Yeah, that makes sense. <b>Do a pilot</b> with one section first, and we'll <b>measure the results</b>.",
        "cn": "是的，有道理。先用一个部分做试点，然后我们会测量结果。"
      },
      {
        "speaker": "Ahmed",
        "en": "Smart move. Let's start with Aisle B—that's where most of our <b>slow-moving stock</b> is anyway.",
        "cn": "聪明的做法。让我们从B通道开始——那是我们大部分慢销库存所在的地方。"
      },
      {
        "speaker": "Carlos",
        "en": "Perfect. So next Sunday we <b>roll out Phase 1</b> on Aisle B. How do I explain this to the team?",
        "cn": "完美。所以下周日我们在B通道推出第一阶段。我怎样向团队解释这个？"
      },
      {
        "speaker": "Ahmed",
        "en": "Tell them we're <b>streamlining operations</b> to help them work smarter, not harder. <b>Less walking around</b>.",
        "cn": "告诉他们我们正在简化操作，帮助他们更聪明地工作，而不是更努力。减少走来走去。"
      },
      {
        "speaker": "Carlos",
        "en": "Good angle. I like that. Anything else I should know going into this?",
        "cn": "好角度。我喜欢。在进行这个之前我还应该知道什么吗？"
      },
      {
        "speaker": "Ahmed",
        "en": "Just be ready for a small dip in productivity on day one. After that, we should see big improvements.",
        "cn": "只需要为第一天的小幅生产率下降做好准备。之后，我们应该看到大幅改进。"
      }
    ]
  },
  {
    "id": "wh5",
    "cat": "warehouse",
    "catName": "仓库",
    "catEmoji": "🏬",
    "title": "Morning Safety Briefing",
    "titleCn": "晨间安全会议",
    "emoji": "👷🏻",
    "lines": [
      {
        "speaker": "Marcus",
        "en": "Alright everyone, gather around for our <b>daily safety huddle</b>. Let's keep it quick.",
        "cn": "好的，各位，围成一圈进行我们的日常安全会议。让我们保持简洁。"
      },
      {
        "speaker": "Rachel",
        "en": "Before we start, I wanted to bring up a <b>near-miss incident</b> from yesterday. Anyone here when that happened?",
        "cn": "在我们开始之前，我想提一下昨天的一个险情。有人在现场吗？"
      },
      {
        "speaker": "Marcus",
        "en": "What happened?",
        "cn": "发生了什么？"
      },
      {
        "speaker": "Rachel",
        "en": "One of the guys was using a forklift without <b>the seat belt on</b>, and he almost ran over some boxes. Could've been serious.",
        "cn": "其中一个人正在使用叉车，没有系安全带，他几乎压过了一些箱子。可能会很严重。"
      },
      {
        "speaker": "Marcus",
        "en": "Yeah, that's <b>a big no-no</b>. Everyone needs to follow <b>the safety rules</b>. You wear the seat belt, period.",
        "cn": "是的，那绝对不行。每个人都需要遵守安全规则。你必须系安全带，就这样。"
      },
      {
        "speaker": "Rachel",
        "en": "Also, we're going to <b>do a refresher</b> on proper lifting techniques. Wrong lifting is the <b>number one injury</b> here.",
        "cn": "另外，我们将复习正确的搬运技巧。错误的搬运是这里的头号伤害。"
      },
      {
        "speaker": "Marcus",
        "en": "Yes. <b>Bend at the knees</b>, not the back. Keep the load close to your body. If it's too heavy, <b>ask for help</b>.",
        "cn": "对。在膝盖处弯曲，不要在背部。保持负载靠近您的身体。如果太重，请求帮助。"
      },
      {
        "speaker": "Rachel",
        "en": "And please, <b>wear your PPE</b>. That means hard hat, safety glasses, and steel-toed boots. Every. Single. Day.",
        "cn": "请穿上你的个人防护装备。那意味着安全帽、安全眼镜和钢脚趾靴。每一天。"
      },
      {
        "speaker": "Marcus",
        "en": "We've had three people come in late without proper gear this week. That's <b>not okay</b>. You <b>show up ready</b>, or we send you home.",
        "cn": "本周有三个人没有穿戴适当的装备迟到。那不行。你要做好准备来，否则我们让你回家。"
      },
      {
        "speaker": "Rachel",
        "en": "One more thing—if you see something unsafe, <b>report it immediately</b>. Don't try to be a hero and fix it yourself.",
        "cn": "还有一件事——如果你看到不安全的东西，立即报告。不要试图做英雄自己修复。"
      },
      {
        "speaker": "Marcus",
        "en": "Exactly. We have a <b>hazard reporting system</b> for a reason. Fill out a <b>safety form</b> and let us know.",
        "cn": "完全同意。我们有危险报告系统是有原因的。填写安全表格，告诉我们。"
      },
      {
        "speaker": "Rachel",
        "en": "And <b>don't shame anyone</b> for reporting. We want people to speak up. Safety comes first.",
        "cn": "不要因为报告而羞辱任何人。我们希望人们敢于发言。安全第一。"
      },
      {
        "speaker": "Marcus",
        "en": "Today's focus is on <b>aisle congestion</b>. Keep the walkways clear. No boxes, pallets, or equipment blocking the path.",
        "cn": "今天的重点是通道拥堵。保持走廊畅通。没有箱子、托盘或设备阻挡通道。"
      },
      {
        "speaker": "Rachel",
        "en": "If someone trips or falls because of clutter, that's <b>on us</b>. Let's be responsible.",
        "cn": "如果有人因为杂物摔倒，那是我们的责任。让我们负责任。"
      },
      {
        "speaker": "Marcus",
        "en": "<b>Got it?</b> Any questions?",
        "cn": "明白了吗？有问题吗？"
      },
      {
        "speaker": "Rachel",
        "en": "Oh, and if you notice something wrong with equipment—a broken pallet jack, a frayed power cord, anything—<b>tag it out</b>.",
        "cn": "另外，如果你注意到设备有问题——断裂的托盘车、磨损的电源线，任何东西——标记为禁用。"
      },
      {
        "speaker": "Marcus",
        "en": "Don't use broken stuff. <b>Report and isolate</b> it. Maintenance will fix it.",
        "cn": "不要使用坏的东西。报告并隔离它。维护部门会修复它。"
      },
      {
        "speaker": "Rachel",
        "en": "Alright, let's have a <b>safe and productive</b> day out there. Stay focused, stay alert.",
        "cn": "好的，让我们度过安全高效的一天。保持专注，保持警惕。"
      },
      {
        "speaker": "Marcus",
        "en": "One last thing—thanks for paying attention. Your safety and your coworkers' safety matters.",
        "cn": "最后一件事——感谢你的关注。你和同事们的安全很重要。"
      },
      {
        "speaker": "Rachel",
        "en": "Now let's get to work. <b>See you all at 5 PM</b> for a safe day. Go!",
        "cn": "现在让我们开始工作。下午5点见。去吧！"
      }
    ]
  },
  {
    "id": "s1",
    "cat": "sales",
    "catName": "销售",
    "catEmoji": "📈",
    "title": "Pipeline Review and Forecasting",
    "titleCn": "销售管道审查和预测",
    "emoji": "👨🏻‍💼",
    "lines": [
      {
        "speaker": "Greg",
        "en": "Okay team, let's run through the <b>pipeline</b> and see where we stand for Q2. Jennifer, you're up first.",
        "cn": "好的，团队，让我们查一下销售管道，看看我们在Q2的位置。Jennifer，你先来。"
      },
      {
        "speaker": "Jennifer",
        "en": "Right. So I've got four deals <b>in the works</b>. The biggest one is Acme Corporation—that's a <b>six-figure deal</b>.",
        "cn": "对。我有四个交易进行中。最大的是Acme Corporation——那是一个六位数的交易。"
      },
      {
        "speaker": "Greg",
        "en": "Nice. What's the status on Acme? Are we <b>close to closing</b>?",
        "cn": "不错。Acme的状态如何？我们快要成交吗？"
      },
      {
        "speaker": "Jennifer",
        "en": "They're in <b>final negotiations</b>. Sent them the contract last week. I expect to <b>hear back</b> by end of week.",
        "cn": "他们在最终谈判阶段。上周给他们发了合同。我预计周末前会收到回复。"
      },
      {
        "speaker": "Greg",
        "en": "Okay, so that's like <b>50-50 odds</b> of closing this month?",
        "cn": "好的，那就是这个月成交的50-50概率？"
      },
      {
        "speaker": "Jennifer",
        "en": "I'd say more like 70-80. The buyer is <b>really into it</b>. Just waiting on legal review.",
        "cn": "我想说更像70-80。买家真的对此感兴趣。只是在等法律审查。"
      },
      {
        "speaker": "Greg",
        "en": "Good. What about the other three deals?",
        "cn": "好的。另外三个交易怎么样？"
      },
      {
        "speaker": "Jennifer",
        "en": "One is still <b>in discovery</b>—early stage. Two more are <b>in proposal stage</b>. Those might close in June.",
        "cn": "一个仍在发现阶段——早期。另外两个在提案阶段。那些可能在6月成交。"
      },
      {
        "speaker": "Greg",
        "en": "Got it. So your <b>realistic forecast</b> for Q2 is just the Acme deal?",
        "cn": "明白了。那么你对Q2的现实预测只是Acme交易？"
      },
      {
        "speaker": "Jennifer",
        "en": "Yeah, unless something moves fast. But I'm <b>optimistic</b> about June closing the other two.",
        "cn": "是的，除非什么东西快速进行。但我对6月关闭其他两个很乐观。"
      },
      {
        "speaker": "Greg",
        "en": "Okay, good. Now, one thing we need to talk about—your <b>sales cycle</b> is taking longer than expected. What's the <b>bottleneck</b>?",
        "cn": "好的，很好。现在，我们需要讨论一件事——你的销售周期比预期花费更长时间。瓶颈是什么？"
      },
      {
        "speaker": "Jennifer",
        "en": "Honestly? <b>Budget approval</b> at the customer's end. They take forever to move money around.",
        "cn": "老实说？客户那边的预算批准。他们花永远时间来调拨资金。"
      },
      {
        "speaker": "Greg",
        "en": "Yeah, that's a common <b>objection</b>. Have you tried to <b>work with their CFO</b> to <b>accelerate the timeline</b>?",
        "cn": "是的，那是常见的异议。你有没有试图与他们的CFO合作来加快时间表？"
      },
      {
        "speaker": "Jennifer",
        "en": "Not yet. I could <b>reach out</b> next week and see if there's a way to move this faster.",
        "cn": "还没有。我下周可以联系看看是否有办法加快速度。"
      },
      {
        "speaker": "Greg",
        "en": "Do that. Sometimes a <b>direct conversation</b> with finance can <b>unblock things</b>.",
        "cn": "去做吧。有时与财务部门的直接对话可以解决问题。"
      },
      {
        "speaker": "Jennifer",
        "en": "Good point. I'll also offer to <b>split the payment</b> into phases if that helps them.",
        "cn": "好主意。我也会提出分阶段支付来帮助他们。"
      },
      {
        "speaker": "Greg",
        "en": "Exactly. Get creative. We want this deal to <b>move forward</b>.",
        "cn": "完全同意。要有创意。我们希望这笔交易进行。"
      },
      {
        "speaker": "Jennifer",
        "en": "Will do. I'm confident we'll <b>land this one</b>.",
        "cn": "会的。我相信我们会成交这个。"
      },
      {
        "speaker": "Greg",
        "en": "Great. Keep me posted on Acme. And let's <b>check in next week</b> on progress.",
        "cn": "很好。保持我对Acme的更新。让我们下周查一下进展。"
      },
      {
        "speaker": "Jennifer",
        "en": "Perfect. I'll send you a <b>quick summary</b> by Friday.",
        "cn": "完美。我会在周五前给你发一个快速摘要。"
      }
    ]
  },
  {
    "id": "s2",
    "cat": "sales",
    "catName": "销售",
    "catEmoji": "📈",
    "title": "Cold Call Strategy and Objection Handling",
    "titleCn": "冷电话策略与异议处理",
    "emoji": "👨🏻‍💼",
    "lines": [
      {
        "speaker": "David",
        "en": "Alright, before we start <b>the cold call campaign</b>, let's talk strategy. Michelle, what's your approach?",
        "cn": "好的，在我们开始冷电话活动之前，让我们谈论策略。Michelle，你的方法是什么？"
      },
      {
        "speaker": "Michelle",
        "en": "I'm gonna <b>lead with value</b>. Don't jump straight to the pitch. Ask about their <b>current situation</b>.",
        "cn": "我打算先讲价值。不要直接跳到推销。询问他们的当前情况。"
      },
      {
        "speaker": "David",
        "en": "Good. That's the right mindset. What if they say they're not interested?",
        "cn": "好的。这是正确的心态。如果他们说不感兴趣怎么办？"
      },
      {
        "speaker": "Michelle",
        "en": "That's the most common <b>objection</b>. I don't take it personally. I just say, <b>I understand</b>, but can I ask you a few quick questions?",
        "cn": "那是最常见的异议。我不会把它当作个人问题。我只是说，我理解，但我可以问你几个快速问题吗？"
      },
      {
        "speaker": "David",
        "en": "Perfect. You're <b>not pushy</b>. You're <b>conversational</b>. That works. What if they say they're too busy?",
        "cn": "完美。你不是强势的。你是谈话式的。这有效。如果他们说太忙了怎么办？"
      },
      {
        "speaker": "Michelle",
        "en": "I say, <b>I totally get it</b>. This will only take two minutes. If it's not relevant, I promise I won't bug you again.",
        "cn": "我说，我完全理解。这只需要两分钟。如果不相关，我保证不会再烦你。"
      },
      {
        "speaker": "David",
        "en": "Nice. <b>Empathy</b> plus <b>brevity</b>. That's the formula. Now, the big one—what if they say the price is too high?",
        "cn": "不错。同理心加简洁。那是公式。现在，重要的一个——如果他们说价格太高怎么办？"
      },
      {
        "speaker": "Michelle",
        "en": "That's when I <b>dig deeper</b>. I ask what budget they had in mind, and then I try to <b>show ROI</b>. Like, yes, it costs more upfront, but you save money long term.",
        "cn": "那是我深入了解的时候。我问他们心中有什么预算，然后我试图展示投资回报率。比如，是的，前期成本更高，但从长期来看，你节省了金钱。"
      },
      {
        "speaker": "David",
        "en": "Right. Don't just defend the price. <b>Justify it</b> with <b>real numbers</b>.",
        "cn": "对。不要只是为价格辩护。用真实数字证明它的正当性。"
      },
      {
        "speaker": "Michelle",
        "en": "Exactly. And if they still say <b>budget isn't there</b>, I ask, what if we <b>broke it into smaller chunks</b>? Can we do a pilot?",
        "cn": "完全同意。如果他们仍然说没有预算，我问，如果我们把它分成更小的块怎么办？我们可以做试点吗？"
      },
      {
        "speaker": "David",
        "en": "Love that. <b>Flexibility</b> shows you're not just <b>chasing commission</b>.",
        "cn": "我喜欢那样。灵活性表明你不只是在追逐佣金。"
      },
      {
        "speaker": "Michelle",
        "en": "Exactly. And here's the thing—if I <b>handle the objection well</b>, sometimes they become <b>a better fit later</b>.",
        "cn": "完全同意。这里的事情是——如果我很好地处理异议，有时他们会在以后更合适。"
      },
      {
        "speaker": "David",
        "en": "Right. You're <b>building rapport</b>, not just <b>closing a deal</b>.",
        "cn": "对。你在建立关系，而不仅仅是成交。"
      },
      {
        "speaker": "Michelle",
        "en": "One more thing—I always end with, <b>would it make sense</b> to stay in touch? Can I send you something?",
        "cn": "还有一件事——我总是以，如果保持联系是否有意义？我能给你发东西吗？结束。"
      },
      {
        "speaker": "David",
        "en": "Smart. You're setting up <b>the next touchpoint</b> even if this call goes nowhere.",
        "cn": "聪明。你甚至在这个电话没有结果的情况下设置下一个接触点。"
      },
      {
        "speaker": "Michelle",
        "en": "Right. And I always <b>log the call</b> in the CRM so I have context next time.",
        "cn": "对。我总是在CRM中记录通话，所以下次我有背景信息。"
      },
      {
        "speaker": "David",
        "en": "Okay, that's solid. Last thing—what's your <b>target call volume</b> today?",
        "cn": "好的，那很好。最后一件事——你今天的目标通话量是多少？"
      },
      {
        "speaker": "Michelle",
        "en": "I'm aiming for like 30 calls. If I get 5 to 10 <b>qualified leads</b>, that's a win.",
        "cn": "我的目标是大约30通电话。如果我得到5到10个合格的潜在客户，那就是胜利。"
      },
      {
        "speaker": "David",
        "en": "That's realistic. And remember, <b>not every call</b> will turn into a deal. Stay positive.",
        "cn": "那很现实。记住，不是每个电话都会变成交易。保持积极。"
      },
      {
        "speaker": "Michelle",
        "en": "For sure. Let's make some calls!",
        "cn": "肯定。让我们打一些电话吧！"
      }
    ]
  },
  {
    "id": "s3",
    "cat": "sales",
    "catName": "销售",
    "catEmoji": "📈",
    "title": "Big Deal Negotiation",
    "titleCn": "大交易谈判",
    "emoji": "👨🏻‍💼",
    "lines": [
      {
        "speaker": "Tom",
        "en": "Alex, thanks for staying on. We really want to <b>close this deal</b>. Let's talk terms.",
        "cn": "Alex，谢谢你留下来。我们真的想完成这笔交易。让我们谈论条款。"
      },
      {
        "speaker": "Alex",
        "en": "Yeah, I like what you're selling. But your <b>pricing is higher</b> than your competitors. How do you justify that?",
        "cn": "是的，我喜欢你在卖的东西。但你的定价比你的竞争对手更高。你怎样证明这一点的合理性？"
      },
      {
        "speaker": "Tom",
        "en": "Fair question. Our <b>implementation is faster</b>, our <b>support is 24/7</b>, and we have a <b>proven track record</b>. That reduces risk.",
        "cn": "公平的问题。我们的实施更快，我们的支持是24/7，我们有良好的记录。这降低了风险。"
      },
      {
        "speaker": "Alex",
        "en": "I get that. But if I sign a $500K contract, I need more incentive. What can you do for me?",
        "cn": "我理解。但如果我签署500K合同，我需要更多激励。你能为我做什么？"
      },
      {
        "speaker": "Tom",
        "en": "Okay, here's what I can offer: <b>we waive the implementation fee</b>—that's $50K. Second, <b>we lock in the price</b> for three years.",
        "cn": "好的，这是我能提供的：我们免除实施费——那是50K。其次，我们锁定三年的价格。"
      },
      {
        "speaker": "Alex",
        "en": "That's good, but I need one more thing. <b>Can you throw in</b> a dedicated account manager?",
        "cn": "那很好，但我需要另一件事。你能提供专属客户经理吗？"
      },
      {
        "speaker": "Tom",
        "en": "That's normally a premium add-on, but for a $500K deal, yeah, I can <b>make that work</b>. You get a dedicated manager.",
        "cn": "那通常是高级附加服务，但对于500K交易，是的，我可以解决这个问题。你得到一个专属经理。"
      },
      {
        "speaker": "Alex",
        "en": "Great. But I want you to know—I had another vendor ready to sign this morning.",
        "cn": "太好了。但我想让你知道——我有另一个卖家准备好今早签署。"
      },
      {
        "speaker": "Tom",
        "en": "I appreciate you being honest. Look, if you sign today, I can <b>add a three-month free trial</b> on our premium analytics.",
        "cn": "我感谢你的诚实。看，如果你今天签署，我可以在我们的高级分析上添加三个月的免费试用。"
      },
      {
        "speaker": "Alex",
        "en": "That's interesting. So to summarize: <b>$50K implementation waived</b>, <b>three-year price lock</b>, <b>dedicated manager</b>, and <b>three months free analytics</b>?",
        "cn": "那很有趣。所以总结一下：50K实施费免除，三年价格锁定，专属经理和三个月免费分析？"
      },
      {
        "speaker": "Tom",
        "en": "That's correct. And we <b>throw in a 30-day onboarding sprint</b> to get you up and running fast.",
        "cn": "那是对的。我们还加入30天的入职冲刺来快速让你上线。"
      },
      {
        "speaker": "Alex",
        "en": "Okay, I'm <b>pretty close</b> to a yes. But I need to loop in my CFO. Can I <b>get you in a call</b> with her tomorrow?",
        "cn": "好的，我很接近同意。但我需要让我的财务总监参与。我明天能让你和她通话吗？"
      },
      {
        "speaker": "Tom",
        "en": "Absolutely. What time works for her?",
        "cn": "当然。什么时间对她有效？"
      },
      {
        "speaker": "Alex",
        "en": "2 PM her time. She'll want to <b>discuss terms</b> one more time.",
        "cn": "她的时间下午2点。她会想再讨论一次条款。"
      },
      {
        "speaker": "Tom",
        "en": "Perfect. I'll <b>prep a summary document</b> tonight and send it to you both. She'll see exactly what we're offering.",
        "cn": "完美。我今晚会准备一份总结文档并发给你们两个。她会看到我们提供的确切内容。"
      },
      {
        "speaker": "Alex",
        "en": "Good. And one last thing—if your CFO can <b>sign off</b> on these terms, we can move forward fast.",
        "cn": "很好。最后一件事——如果你的财务总监能同意这些条款，我们可以快速推进。"
      },
      {
        "speaker": "Tom",
        "en": "I'm authorized to <b>close this deal</b> at these terms, so we're golden.",
        "cn": "我被授权以这些条款完成这笔交易，所以我们很好。"
      },
      {
        "speaker": "Alex",
        "en": "Excellent. So if the CFO call goes well tomorrow, we're <b>ready to ink the contract</b> by Friday?",
        "cn": "太棒了。所以如果财务总监电话明天进行得很好，我们周五准备签署合同？"
      },
      {
        "speaker": "Tom",
        "en": "Absolutely. I'll have legal standing by to <b>execute immediately</b>.",
        "cn": "当然。我会让法律部门准备好立即执行。"
      },
      {
        "speaker": "Alex",
        "en": "Perfect. I'll send you the CFO's calendar link. Thanks for <b>being flexible</b>.",
        "cn": "完美。我会给你发财务总监的日历链接。谢谢你的灵活性。"
      }
    ]
  },
  {
    "id": "s4",
    "cat": "sales",
    "catName": "销售",
    "catEmoji": "📈",
    "title": "Lost Deal Post-Mortem",
    "titleCn": "失败交易事后总结",
    "emoji": "👨🏻‍💼",
    "lines": [
      {
        "speaker": "Robert",
        "en": "Sandra, I wanted to go over what happened with the TechWare deal. We <b>lost it</b>, and I want to understand why.",
        "cn": "Sandra，我想讨论一下TechWare交易发生了什么。我们失败了，我想知道为什么。"
      },
      {
        "speaker": "Sandra",
        "en": "Yeah, it's tough. They went with a competitor. I thought we had it in the bag.",
        "cn": "是的，这很困难。他们选择了竞争对手。我以为我们已经确定了。"
      },
      {
        "speaker": "Robert",
        "en": "What happened at the final stage? Was it the price?",
        "cn": "最后阶段发生了什么？是价格问题吗？"
      },
      {
        "speaker": "Sandra",
        "en": "Partially. But I think the real issue was <b>we didn't build enough trust</b>. The decision-maker kept asking questions we couldn't answer.",
        "cn": "部分上是。但我认为真正的问题是我们没有建立足够的信任。决策者不断提出我们无法回答的问题。"
      },
      {
        "speaker": "Robert",
        "en": "What kind of questions?",
        "cn": "什么样的问题？"
      },
      {
        "speaker": "Sandra",
        "en": "Technical stuff about <b>integration with their existing systems</b>. I should have had a solutions architect in the room.",
        "cn": "关于与他们现有系统集成的技术问题。我应该在房间里有一个解决方案建筑师。"
      },
      {
        "speaker": "Robert",
        "en": "That's a <b>key lesson</b> right there. Did you ask for it?",
        "cn": "那是一个关键教训。你要求过吗？"
      },
      {
        "speaker": "Sandra",
        "en": "No, I should have. I was overconfident in my own knowledge. That was a mistake.",
        "cn": "不，我应该要求。我对自己的知识过于自信。那是一个错误。"
      },
      {
        "speaker": "Robert",
        "en": "Okay, so moving forward, <b>when you're pitching technical products</b>, bring in the right <b>subject matter experts</b>.",
        "cn": "好的，所以往后，当你推销技术产品时，要带上合适的主题专家。"
      },
      {
        "speaker": "Sandra",
        "en": "Agreed. Also, I realized too late that they had <b>a preferred vendor already</b>. I should have asked that earlier.",
        "cn": "同意。另外，我太晚意识到他们已经有了首选卖家。我应该更早问这个。"
      },
      {
        "speaker": "Robert",
        "en": "Yeah, that's a <b>discovery issue</b>. You need to ask about <b>existing relationships</b> in the first call.",
        "cn": "是的，那是一个发现问题。你需要在第一个电话中询问现有关系。"
      },
      {
        "speaker": "Sandra",
        "en": "I did ask, but they dodged the question. I should have <b>dug deeper</b>.",
        "cn": "我问过，但他们躲避了问题。我应该深入了解。"
      },
      {
        "speaker": "Robert",
        "en": "Right. <b>If something feels off</b>, press harder. Don't move forward until you <b>get clarity</b>.",
        "cn": "对。如果感觉不对，更加努力。在你获得清晰度之前不要前进。"
      },
      {
        "speaker": "Sandra",
        "en": "Okay, and one more thing—they mentioned <b>budget constraints</b> in week three. I should have focused on that.",
        "cn": "好的，还有一件事——他们在第三周提到预算限制。我应该专注于此。"
      },
      {
        "speaker": "Robert",
        "en": "Did they say budget was a hard no, or <b>could we have structured a deal</b> differently?",
        "cn": "他们说预算是硬性拒绝，还是我们可以以不同的方式构建交易？"
      },
      {
        "speaker": "Sandra",
        "en": "Looking back, I think <b>a phased approach</b> could have worked. Start small, prove value, then expand.",
        "cn": "回顾一下，我认为分阶段的方法可能有效。从小开始，证明价值，然后扩展。"
      },
      {
        "speaker": "Robert",
        "en": "That's smart. So next time, when budget comes up, <b>propose alternatives</b> instead of just <b>accepting the no</b>.",
        "cn": "那很聪明。所以下次，当预算出现时，提出替代方案，而不是只是接受拒绝。"
      },
      {
        "speaker": "Sandra",
        "en": "Got it. So to summarize: get the right experts in the room, ask harder discovery questions, and offer creative solutions.",
        "cn": "明白了。所以总结一下：让合适的专家在房间里，提出更难的发现问题，并提供创意解决方案。"
      },
      {
        "speaker": "Robert",
        "en": "Exactly. This deal is gone, but you've learned a lot. <b>That matters</b> for the next one.",
        "cn": "完全同意。这笔交易已经失败，但你学到了很多。这对下一个很重要。"
      },
      {
        "speaker": "Sandra",
        "en": "Thanks. I'll apply this to the pipeline. I have a similar prospect next week.",
        "cn": "谢谢。我会把这个应用到管道。我下周有一个类似的前景。"
      }
    ]
  },
  {
    "id": "s5",
    "cat": "sales",
    "catName": "销售",
    "catEmoji": "📈",
    "title": "Customer Success Handoff",
    "titleCn": "客户成功团队交接",
    "emoji": "👨🏻‍💼",
    "lines": [
      {
        "speaker": "Kevin",
        "en": "Sophia, great news—we just closed a new customer. Acme Systems, $250K annual deal. I'm handing off to you.",
        "cn": "Sophia，好消息——我们刚关闭了一个新客户。Acme Systems，年度交易250K。我把他们交给你。"
      },
      {
        "speaker": "Sophia",
        "en": "That's awesome! Let me pull up my notes. So what's the <b>customer background</b>? What did they buy?",
        "cn": "太棒了！让我查一下我的笔记。那么客户背景是什么？他们买了什么？"
      },
      {
        "speaker": "Kevin",
        "en": "They're a mid-market SaaS company. Bought our Enterprise plan with <b>custom integrations</b>. They need <b>onboarding within two weeks</b>.",
        "cn": "他们是一家中等规模的SaaS公司。购买了我们的企业计划，有自定义集成。他们需要在两周内进行入职。"
      },
      {
        "speaker": "Sophia",
        "en": "Two weeks is tight. Did you commit to that timeline, or is that their request?",
        "cn": "两周很紧张。你承诺了那个时间表，还是那是他们的要求？"
      },
      {
        "speaker": "Kevin",
        "en": "That's their request. The decision-maker is their CTO, and he's <b>really eager to get rolling</b>. He's going to be your main point of contact.",
        "cn": "那是他们的要求。决策者是他们的CTO，他非常渴望开始。他会是你的主要联系点。"
      },
      {
        "speaker": "Sophia",
        "en": "Good to know. What's their <b>main use case</b>? Like, what problem are they solving?",
        "cn": "很好知道。他们的主要用例是什么？比如，他们在解决什么问题？"
      },
      {
        "speaker": "Kevin",
        "en": "They're implementing <b>data analytics</b> across their whole platform. Our tool is key to <b>their Q3 roadmap</b>.",
        "cn": "他们在他们的整个平台上实施数据分析。我们的工具是他们Q3路线图的关键。"
      },
      {
        "speaker": "Sophia",
        "en": "So they're under time pressure. That means <b>we can't mess up the implementation</b>.",
        "cn": "所以他们受到时间压力。这意味着我们不能搞砸实施。"
      },
      {
        "speaker": "Kevin",
        "en": "Exactly. And one more thing—they have a <b>technical team</b> that's <b>pretty skilled</b>, so don't over-hand-hold.",
        "cn": "完全同意。还有一件事——他们有一个相当熟练的技术团队，所以不要过度指导。"
      },
      {
        "speaker": "Sophia",
        "en": "Got it. So I should treat them like <b>self-sufficient but available</b> for questions. What's the <b>budget for custom dev</b>?",
        "cn": "明白了。所以我应该把他们看作自给自足但可以提问。自定义开发的预算是什么？"
      },
      {
        "speaker": "Kevin",
        "en": "That's built into the contract. We allocated $30K for custom work. But here's the thing—they might ask for more. Let me know if you need to <b>scope creep</b>.",
        "cn": "那是合同中内置的。我们为自定义工作分配了30K。但这里的事情是——他们可能会要求更多。如果你需要超出范围，告诉我。"
      },
      {
        "speaker": "Sophia",
        "en": "Will do. What's their <b>success metric</b>? How do we know if they're happy?",
        "cn": "会的。他们的成功指标是什么？我们怎样知道他们是否满意？"
      },
      {
        "speaker": "Kevin",
        "en": "They want <b>data processing speed</b> to improve by 40% within 90 days. That's their big goal.",
        "cn": "他们希望数据处理速度在90天内提高40%。那是他们的大目标。"
      },
      {
        "speaker": "Sophia",
        "en": "Okay, that's measurable. I'll set up a <b>quarterly business review</b> to track progress.",
        "cn": "好的，那是可以衡量的。我会设置一个季度商务评估来跟踪进展。"
      },
      {
        "speaker": "Kevin",
        "en": "Perfect. And Sophia, one last thing—they mentioned <b>a renewal conversation</b> might happen mid-year. They like multi-year deals.",
        "cn": "完美。还有，Sophia，最后一件事——他们提到续期对话可能在年中发生。他们喜欢多年交易。"
      },
      {
        "speaker": "Sophia",
        "en": "That's great to know. So I need to <b>build the relationship</b> early and make sure they feel supported.",
        "cn": "很好知道。所以我需要尽早建立关系，并确保他们感到支持。"
      },
      {
        "speaker": "Kevin",
        "en": "Exactly. You're the face of the company now for them. <b>Make them successful</b>, and they'll renew.",
        "cn": "完全同意。你现在是公司在他们面前的代表。让他们成功，他们会续期。"
      },
      {
        "speaker": "Sophia",
        "en": "I won't let you down. Send me the <b>full contract details</b> and <b>their contact info</b>.",
        "cn": "我不会让你失望。给我发送完整的合同详情和他们的联系方式。"
      },
      {
        "speaker": "Kevin",
        "en": "Already in your inbox. You're all set to kick off the onboarding. When do you want to <b>schedule the kickoff call</b>?",
        "cn": "已经在你的收件箱中。你准备好开始入职了。你什么时候想安排启动电话？"
      },
      {
        "speaker": "Sophia",
        "en": "Tomorrow, if possible. The sooner we start, the better we'll make the timeline.",
        "cn": "如果可能的话，明天。越早开始越好，我们会更好地跟上时间表。"
      }
    ]
  },
  {
    "id": "pt1",
    "cat": "product",
    "catName": "产品",
    "catEmoji": "🔬",
    "title": "Product Roadmap Review",
    "titleCn": "产品路线图评审",
    "emoji": "👩🏻‍💼",
    "lines": [
      {
        "speaker": "Sarah",
        "en": "So here's where we're at with the roadmap. We're <b>planning to ship</b> the analytics dashboard in Q2, and we'll <b>tackle</b> the API improvements right after.",
        "cn": "我们现在的计划是这样的。我们计划在Q2推出分析仪表板，之后立即处理API改进。"
      },
      {
        "speaker": "Mike",
        "en": "Sarah, I gotta be honest — that timeline is <b>a bit of a stretch</b>. The analytics stuff alone is gonna take us eight weeks, minimum.",
        "cn": "Sarah，我得老实说，这个时间表有点不现实。光是分析的工作就需要至少八周。"
      },
      {
        "speaker": "Sarah",
        "en": "Yeah, I hear you. But the analytics dashboard is <b>on the critical path</b> for the customer success team. We're getting killed on this front.",
        "cn": "我明白你的意思。但分析仪表板是客户成功团队的关键路径。我们在这方面被打击得很惨。"
      },
      {
        "speaker": "James",
        "en": "Have you <b>run the numbers</b> on what this unblocks for us? Like, revenue impact?",
        "cn": "你有没有计算过这能给我们带来什么？比如，收入影响？"
      },
      {
        "speaker": "Sarah",
        "en": "Absolutely. Our VPs say this feature alone could <b>move the needle</b> on retention. We're talking 15-20% improvement in customer lifetime value.",
        "cn": "当然。我们的副总说这个功能本身就能改变局面。我们在谈论客户终身价值提高15-20%。"
      },
      {
        "speaker": "Mike",
        "en": "OK so that's persuasive, but we've got technical debt up to here. <b>We're drowning in</b> bug fixes and <b>fires</b> we're constantly putting out.",
        "cn": "好的，这很有说服力，但我们的技术债已经很高了。我们被淹没在bug修复和不断出现的问题中。"
      },
      {
        "speaker": "Sarah",
        "en": "I get that, Mike. <b>Here's the deal</b> — we dedicate one sprint to technical debt, <b>knock out</b> the top five issues, and then we're full steam ahead on analytics.",
        "cn": "我理解，Mike。这样吧——我们用一个冲刺周期处理技术债，解决前五个问题，然后全力推进分析。"
      },
      {
        "speaker": "James",
        "en": "What about the API integration work? Shouldn't we <b>front-load</b> that since it's blocking the mobile team?",
        "cn": "那API集成工作呢？我们不应该优先做那个，因为它正阻止手机团队的工作吗？"
      },
      {
        "speaker": "Sarah",
        "en": "That's where I was gonna <b>push back a little bit</b>. The mobile stuff is nice to have, but the analytics is <b>table stakes</b> for our Q2 goals.",
        "cn": "那就是我想稍微反驳一下的地方。手机功能很不错，但分析对我们的Q2目标是基本要求。"
      },
      {
        "speaker": "Mike",
        "en": "<b>Fair point</b>. Let me go back to the team and see if we can <b>carve out</b> resources for both. But I'm not promising anything.",
        "cn": "说得对。让我回去和团队看看我们能不能两个都兼顾。但我不能保证。"
      },
      {
        "speaker": "Sarah",
        "en": "That's all I'm asking. And look, if we <b>hit a wall</b> with the timeline, we'll <b>de-scope</b> some of the analytics features and <b>ship an MVP</b>.",
        "cn": "那就是我要求的全部。而且，如果我们在时间上遇到障碍，我们会缩减一些分析功能，推出MVP。"
      },
      {
        "speaker": "James",
        "en": "Smart. So basically we're gonna <b>run lean</b> and focus on <b>what really moves the needle</b> for customers. I like it.",
        "cn": "聪明。所以基本上我们会精简运营，专注于真正能改变客户体验的东西。我喜欢这样。"
      },
      {
        "speaker": "Mike",
        "en": "One more thing though — are we gonna <b>get the bandwidth</b> for QA testing on the analytics dashboard? That's usually where we slip.",
        "cn": "还有一件事——我们能不能为分析仪表板的QA测试获得足够的人力？那通常是我们延期的地方。"
      },
      {
        "speaker": "Sarah",
        "en": "Good catch. I'm already <b>on that</b>. I talked to the QA lead and we're bringing in an external contractor to <b>take the load off</b>.",
        "cn": "好发现。我已经在处理那个了。我和QA负责人谈过了，我们要请外包承包商来减轻压力。"
      },
      {
        "speaker": "James",
        "en": "OK I'm satisfied. Mike, does this <b>work for</b> your team?",
        "cn": "好的，我满意了。Mike，这对你的团队有用吗？"
      },
      {
        "speaker": "Mike",
        "en": "Yeah, it works. Just make sure we get written sign-off on the scope before we start sprinting, because <b>scope creep</b> is gonna kill us otherwise.",
        "cn": "好的，可以。只要确保在我们开始冲刺之前得到书面批准，否则范围蔓延会毁掉我们。"
      },
      {
        "speaker": "Sarah",
        "en": "Done. <b>I'll send out</b> a formal requirements doc by EOD tomorrow.",
        "cn": "好的。我明天下班前会发出正式的需求文档。"
      },
      {
        "speaker": "Mike",
        "en": "Perfect. One last thing — can we <b>build in some buffer time</b> for unknowns? You know how it goes with these things.",
        "cn": "完美。最后一件事——我们能不能为未知情况留出一些缓冲时间？你知道这些事是怎样的。"
      },
      {
        "speaker": "Sarah",
        "en": "Absolutely. I'm already factoring in a 20% buffer. We're not gonna <b>cut corners</b> on quality just to hit a date.",
        "cn": "当然。我已经考虑了20%的缓冲。我们不会为了赶上截止日期而偷工减料。"
      },
      {
        "speaker": "James",
        "en": "Alright, I think we've got a solid plan here. Let's <b>sync up</b> next week and make sure everything is on track.",
        "cn": "好的，我认为我们有一个可靠的计划。让我们下周同步一下，确保一切按计划进行。"
      }
    ]
  },
  {
    "id": "pt2",
    "cat": "product",
    "catName": "产品",
    "catEmoji": "🔬",
    "title": "Feature Prioritization Sprint",
    "titleCn": "功能优先级排序冲刺",
    "emoji": "👩🏻‍💼",
    "lines": [
      {
        "speaker": "Alex",
        "en": "OK team, we've got way more feature requests than we can <b>reasonably handle</b> this quarter, so we're gonna <b>rank them</b> using RICE.",
        "cn": "好的各位，这个季度我们收到的功能请求远远超过我们能合理处理的范围，所以我们要用RICE来对它们进行排名。"
      },
      {
        "speaker": "David",
        "en": "RICE? Isn't that a bit overkill? Can't we just <b>go with our gut</b>?",
        "cn": "RICE？这是不是有点小题大做？我们不能就相信直觉吗？"
      },
      {
        "speaker": "Lisa",
        "en": "No way. We tried that last quarter and ended up <b>chasing shiny objects</b>. We built features nobody actually wanted.",
        "cn": "不行。我们上个季度试过了，结果就是追逐新奇东西。我们构建了没人想要的功能。"
      },
      {
        "speaker": "Alex",
        "en": "Exactly. RICE forces us to think about what actually <b>moves the needle</b> for the business. So let's <b>start with</b> the big ones.",
        "cn": "正是。RICE迫使我们思考什么真正能推动业务。所以让我们从大的开始。"
      },
      {
        "speaker": "David",
        "en": "Alright, fine. So we've got the dark mode request — that's been <b>requested to death</b> by users. Can't we just <b>ship that</b>?",
        "cn": "好吧，好的。所以我们有暗黑模式请求——用户已经请求得死死的。我们不能直接推出那个吗？"
      },
      {
        "speaker": "Lisa",
        "en": "Here's the thing though — dark mode is all <b>low-hanging fruit</b> from a reach perspective, but the business impact is basically zero.",
        "cn": "但问题是——从可及性的角度来看，暗黑模式就是低垂的果实，但商业影响基本为零。"
      },
      {
        "speaker": "Alex",
        "en": "Right. Let's <b>run the numbers</b> on dark mode. Reach is high — maybe a million users per month would use it. But Lisa's point stands — we're not making money off it.",
        "cn": "对。让我们计算一下暗黑模式。可及性很高——可能每月有一百万用户会使用它。但Lisa的观点是对的——我们从中赚不到钱。"
      },
      {
        "speaker": "David",
        "en": "OK but user satisfaction is important too, right? I mean, if we <b>just ignore</b> what users are asking for, they'll get annoyed.",
        "cn": "好的，但用户满意度也很重要，对吧？我是说，如果我们只是忽视用户要求的东西，他们会生气。"
      },
      {
        "speaker": "Lisa",
        "en": "True, but there's a difference between <b>nice-to-haves</b> and <b>game-changers</b>. The payment flow improvement? That's a game-changer.",
        "cn": "没错，但在锦上添花和改变游戏规则之间是有区别的。改进支付流程？那是改变游戏规则的。"
      },
      {
        "speaker": "Alex",
        "en": "Exactly. The payment flow is <b>causing friction</b> at checkout, and we're <b>losing conversions</b> to it. Let's score that one.",
        "cn": "正是。支付流程在结账时造成摩擦，我们因此而失去转化。让我们对那个进行评分。"
      },
      {
        "speaker": "David",
        "en": "Fair enough. So payment flow gets a high impact score. What about the referral program overhaul? That's been on the backlog forever.",
        "cn": "公平起见。所以支付流程获得高影响力得分。转介计划改革怎么样？那已经在待办项目中很久了。"
      },
      {
        "speaker": "Lisa",
        "en": "That one's interesting because the reach is lower — not everyone uses referrals — but the ones who do have super high lifetime value. So the impact could actually be <b>disproportionate</b>.",
        "cn": "那个很有趣，因为可及性较低——不是每个人都使用转介——但那些使用的人有非常高的终身价值。所以影响实际上可能是不成比例的。"
      },
      {
        "speaker": "Alex",
        "en": "Now we're cooking with gas. So we've got three candidates so far — payment flow, referral overhaul, and... what else is on the list?",
        "cn": "现在我们真的在取得进展。所以到目前为止我们有三个候选——支付流程、转介计划改革，还有什么？"
      },
      {
        "speaker": "David",
        "en": "The analytics dashboard we talked about last week. But I'm guessing that one's a <b>heavy lift</b> from an engineering perspective.",
        "cn": "我们上周谈的分析仪表板。但我猜从工程的角度来看，那是个重活。"
      },
      {
        "speaker": "Lisa",
        "en": "Yeah, the effort score on that is gonna be high. Maybe like 8 out of 10 in terms of complexity.",
        "cn": "是的，那个的工作量得分会很高。在复杂性方面，可能是8分。"
      },
      {
        "speaker": "Alex",
        "en": "OK so here's my thinking — we <b>front-load</b> the payment flow fix because it's high impact, relatively low effort, and it directly impacts our bottom line.",
        "cn": "好的，这是我的想法——我们优先处理支付流程修复，因为它影响大，工作量相对较小，并且直接影响我们的利润。"
      },
      {
        "speaker": "David",
        "en": "And then we tackle the referral program in Q3 once we've <b>got bandwidth</b> after the payment stuff ships?",
        "cn": "然后在Q3支付工作发布后，一旦我们有了资源，我们就处理转介计划？"
      },
      {
        "speaker": "Lisa",
        "en": "Yeah, and the dark mode? <b>We'll circle back</b> on that one when we have spare capacity. For now, let's <b>shelf it</b>.",
        "cn": "是的，暗黑模式怎么样？我们以后再回到那个。现在，让我们先搁置它。"
      },
      {
        "speaker": "Alex",
        "en": "Done. So our priority ranking for this quarter is: one, payment flow; two, referral overhaul; three, technical improvements. Anything else we need to <b>hash out</b>?",
        "cn": "完成。所以这个季度的优先级排序是：一、支付流程；二、转介计划改革；三、技术改进。还有什么需要讨论的吗？"
      },
      {
        "speaker": "David",
        "en": "What about the <b>nice-to-haves</b> list? Are we just gonna <b>table</b> all of those?",
        "cn": "那锦上添花的清单呢？我们就是要搁置所有这些吗？"
      },
      {
        "speaker": "Lisa",
        "en": "Yeah, we <b>park</b> them for now. But <b>it's not a hard no</b> — if someone shows up with a crazy idea that could <b>move the needle</b>, we revisit. Sound good?",
        "cn": "是的，我们现在先暂停它们。但这不是硬性反对——如果有人想到一个可能改变局面的疯狂想法，我们就重新考虑。好吗？"
      }
    ]
  },
  {
    "id": "pt3",
    "cat": "product",
    "catName": "产品",
    "catEmoji": "🔬",
    "title": "User Research Debrief",
    "titleCn": "用户研究反馈总结",
    "emoji": "👨🏽‍💼",
    "lines": [
      {
        "speaker": "Jordan",
        "en": "So I just wrapped up eight user interviews, and honestly, the data <b>paints a pretty different picture</b> from what we expected.",
        "cn": "我刚完成了八次用户访谈，说实话，数据描绘的图景与我们预期的相当不同。"
      },
      {
        "speaker": "Emma",
        "en": "Oh no. That usually means <b>bad news</b>. What did we miss?",
        "cn": "哦，不。这通常意味着坏消息。我们遗漏了什么？"
      },
      {
        "speaker": "Jordan",
        "en": "So we assumed the main pain point was the onboarding process, right? But literally nobody <b>brought that up</b>. Everyone complained about the search functionality instead.",
        "cn": "所以我们假设主要痛点是入职过程，对吧？但实际上没有人提到那个。每个人都抱怨搜索功能。"
      },
      {
        "speaker": "Chris",
        "en": "Wait, search? We literally just cleaned that up last quarter. What's the issue?",
        "cn": "等等，搜索？我们上个季度刚清理过那个。问题是什么？"
      },
      {
        "speaker": "Jordan",
        "en": "It's not finding what they're looking for. One user said they <b>had to jump through hoops</b> to find a specific document. They ended up using Google to search our own site.",
        "cn": "它没有找到他们要找的东西。一个用户说他们不得不费尽周折才能找到一个特定的文档。他们最终使用Google搜索我们自己的网站。"
      },
      {
        "speaker": "Emma",
        "en": "That's <b>brutal</b>. So they're basically saying our search <b>is broken</b>?",
        "cn": "那太糟糕了。所以他们基本上是说我们的搜索被破坏了？"
      },
      {
        "speaker": "Jordan",
        "en": "Not broken exactly. It's more like the results are just not <b>relevant to what they're actually looking for</b>. It's a precision problem, not a recall problem.",
        "cn": "不完全是坏的。更像是结果与他们实际寻找的东西不相关。这是一个精确度问题，不是召回问题。"
      },
      {
        "speaker": "Chris",
        "en": "Ah, so they're getting results, just the wrong ones? That's actually worse in some ways because it's <b>not obvious</b> that the search is even the bottleneck.",
        "cn": "啊，所以他们得到了结果，只是错误的结果？某些方面这实际上更糟，因为不明显搜索甚至是瓶颈。"
      },
      {
        "speaker": "Emma",
        "en": "Did you <b>dig deeper</b> into what they were actually searching for?",
        "cn": "你有深入研究他们实际搜索的内容吗？"
      },
      {
        "speaker": "Jordan",
        "en": "Yeah, and here's the pattern I noticed — most searches were for things like \"how to...\", \"best practices...\", \"templates...\" — basically knowledge base stuff, not product documentation.",
        "cn": "是的，我注意到一个模式——大多数搜索是\"如何...\"、\"最佳实践...\"、\"模板...\"之类的东西——基本上是知识库的内容，而不是产品文档。"
      },
      {
        "speaker": "Emma",
        "en": "So they're <b>conflating</b> the product search with a knowledge base search? That's useful intel.",
        "cn": "所以他们混淆了产品搜索和知识库搜索？这很有用的信息。"
      },
      {
        "speaker": "Chris",
        "en": "Right, so the takeaway is we need to either <b>upgrade</b> the search algorithm or <b>create a separate knowledge base</b> with better discoverability.",
        "cn": "对的，所以结论是我们需要升级搜索算法或创建一个具有更好可发现性的单独知识库。"
      },
      {
        "speaker": "Jordan",
        "en": "Actually, three out of eight users mentioned they'd seen our knowledge base but didn't realize it could solve their problem. So it's more of a <b>messaging and organization</b> issue.",
        "cn": "实际上，八个用户中有三个提到他们看过我们的知识库，但没有意识到它可以解决他们的问题。所以这更多是一个消息传递和组织问题。"
      },
      {
        "speaker": "Emma",
        "en": "OK so <b>low-hanging fruit</b> would be improving how we <b>surface</b> the knowledge base. Make it more discoverable.",
        "cn": "好的，所以容易得到的成果是改进我们展示知识库的方式。让它更容易被发现。"
      },
      {
        "speaker": "Jordan",
        "en": "Exactly. And then longer term, we might want to <b>invest</b> in a smarter search that understands intent better.",
        "cn": "正是。然后从长期来看，我们可能想投资一个更智能的搜索，能更好地理解意图。"
      },
      {
        "speaker": "Chris",
        "en": "Did you notice any other patterns? Like, was the age range of users a factor, or experience level?",
        "cn": "你注意到其他模式吗？比如，用户的年龄范围或经验水平是一个因素吗？"
      },
      {
        "speaker": "Jordan",
        "en": "Actually yes! The less experienced users were way more likely to struggle with finding stuff. The power users already knew all the workarounds.",
        "cn": "实际上是的！经验较少的用户更容易在寻找东西时出现问题。高级用户已经知道所有的变通方法。"
      },
      {
        "speaker": "Emma",
        "en": "<b>That makes sense</b>. So we're basically <b>putting barriers in front of</b> our newest users right when they need the most help.",
        "cn": "那是有道理的。所以我们基本上在最需要帮助的时候给新用户设置障碍。"
      },
      {
        "speaker": "Jordan",
        "en": "Yeah, and some of them almost <b>gave up</b> and went back to manual processes because they couldn't figure things out. We're definitely <b>losing adoption</b> over this.",
        "cn": "是的，其中一些人差点放弃了，回到手工过程，因为他们无法解决问题。我们肯定在因此失去采用率。"
      },
      {
        "speaker": "Chris",
        "en": "Alright, so the action items are: one, improve the knowledge base discoverability; two, look at ways to better onboard power users vs. beginners. Sound right?",
        "cn": "好的，所以行动项是：一、改进知识库的可发现性；二、查看更好地引导高级用户与初学者的方式。对吗？"
      },
      {
        "speaker": "Emma",
        "en": "And three — let's <b>loop in</b> support because they probably hear this stuff too. They can give us more context on what questions are coming in most.",
        "cn": "还有三——让我们告知支持团队，因为他们可能也听到这些。他们可以给我们更多上下文，说明最多的问题是什么。"
      }
    ]
  },
  {
    "id": "pt4",
    "cat": "product",
    "catName": "产品",
    "catEmoji": "🔬",
    "title": "API Integration Planning",
    "titleCn": "API集成规划",
    "emoji": "👩🏻‍💼",
    "lines": [
      {
        "speaker": "Sara",
        "en": "OK so we're looking at integrating with Stripe's payment API. From a product perspective, this is gonna <b>be a game-changer</b> for recurring billing. Tom, what's the technical story?",
        "cn": "好的，所以我们在考虑与Stripe的支付API集成。从产品的角度来看，这对周期性计费来说将是一个改变游戏规则的。Tom，技术故事是什么？"
      },
      {
        "speaker": "Tom",
        "en": "So the good news is Stripe's API is well-documented and pretty <b>straightforward to implement</b>. But here's the tricky part — we'll need to <b>refactor</b> our entire payment infrastructure.",
        "cn": "所以好消息是Stripe的API文档齐全，实施相当直接。但这是棘手的部分——我们需要重构整个支付基础设施。"
      },
      {
        "speaker": "Rachel",
        "en": "How much of a <b>lift</b> is that refactoring?",
        "cn": "那个重构有多大的工作量？"
      },
      {
        "speaker": "Tom",
        "en": "Honestly, we're talking maybe four to six weeks of work. And that's <b>assuming</b> nothing goes sideways.",
        "cn": "说实话，我们说的是可能四到六周的工作。这是假设没有问题的情况下。"
      },
      {
        "speaker": "Sara",
        "en": "That's actually not too bad. But we'll need to make sure we <b>don't ship</b> the new feature while we're doing that refactoring. The <b>blast radius</b> would be huge if something breaks.",
        "cn": "这实际上还不错。但我们需要确保在进行重构时不推出新功能。如果出了问题，影响范围会很大。"
      },
      {
        "speaker": "Tom",
        "en": "Right, which is why we should <b>work in a feature branch</b> and <b>get comprehensive testing</b> in place before we <b>merge to main</b>.",
        "cn": "正是，这就是为什么我们应该在功能分支上工作，并在合并到主分支之前进行全面测试。"
      },
      {
        "speaker": "Rachel",
        "en": "What about security? Stripe handles payment info, so we need to make sure we're <b>not storing sensitive data</b> on our end.",
        "cn": "那安全性呢？Stripe处理支付信息，所以我们需要确保我们没有在自己的系统上存储敏感数据。"
      },
      {
        "speaker": "Tom",
        "en": "Good point. Stripe actually <b>handles that for us</b>. We never touch credit card info directly. But we do need to <b>handle the webhooks securely</b> to process payment confirmations.",
        "cn": "很好的观点。Stripe实际上为我们处理了这个。我们永远不会直接接触信用卡信息。但我们确实需要安全地处理webhook来处理支付确认。"
      },
      {
        "speaker": "Sara",
        "en": "So what's the <b>dependency chain</b> here? What do we need to finish before we can move on?",
        "cn": "那这里的依赖链是什么？我们需要完成什么才能继续？"
      },
      {
        "speaker": "Tom",
        "en": "We need to <b>design the database schema</b> changes first. Then we build the API layer, then test like crazy, then <b>do a staged rollout</b>.",
        "cn": "我们首先需要设计数据库架构更改。然后构建API层，然后进行疯狂测试，然后进行分阶段推出。"
      },
      {
        "speaker": "Rachel",
        "en": "<b>On that note</b>, what's our fallback plan if something <b>goes south</b> during the rollout?",
        "cn": "说到那个，如果推出过程中出现问题，我们的后备计划是什么？"
      },
      {
        "speaker": "Tom",
        "en": "We need to <b>have a quick kill switch</b> that lets us <b>roll back</b> to the old system immediately if we detect any issues.",
        "cn": "我们需要有一个快速的关闭开关，如果我们检测到任何问题，让我们立即回滚到旧系统。"
      },
      {
        "speaker": "Sara",
        "en": "How quickly can we detect issues? Like, are we talking minutes or hours?",
        "cn": "我们多快能检测到问题？比如，我们说的是分钟还是小时？"
      },
      {
        "speaker": "Tom",
        "en": "If we set up proper monitoring and alerting, we should <b>catch errors within minutes</b>. But that means we need to <b>instrument the code</b> heavily.",
        "cn": "如果我们设置适当的监控和警报，我们应该在几分钟内捕捉错误。但这意味着我们需要在代码中进行大量的测试。"
      },
      {
        "speaker": "Rachel",
        "en": "Can we <b>leverage</b> our existing monitoring infrastructure, or do we need to build something from scratch?",
        "cn": "我们能利用现有的监控基础设施，还是需要从头开始构建？"
      },
      {
        "speaker": "Tom",
        "en": "We can <b>leverage most of it</b>, but we'll need to <b>add custom metrics</b> for payment-specific stuff — like payment success rates, webhook latency, that kind of thing.",
        "cn": "我们可以利用大部分，但我们需要为支付特定的东西添加自定义指标——比如支付成功率、webhook延迟等。"
      },
      {
        "speaker": "Sara",
        "en": "And what about the third-party risk? Like, if Stripe has an outage, how does that affect us?",
        "cn": "那第三方风险呢？比如，如果Stripe出现故障，这对我们有什么影响？"
      },
      {
        "speaker": "Tom",
        "en": "That's a fair concern. We should <b>build in some graceful degradation</b> so that if their API is down, we can at least still accept orders and process them later.",
        "cn": "那是一个公平的关注。我们应该建立一些优雅的降级，这样如果他们的API出现故障，我们至少仍然可以接受订单并稍后处理。"
      },
      {
        "speaker": "Rachel",
        "en": "OK so to recap — we're looking at a six-week effort, <b>major refactoring</b>, secure webhook handling, staged rollout, and fallback plans. Does that sound about right?",
        "cn": "好的，所以总结一下——我们看的是六周的工作量，重大重构，安全的webhook处理，分阶段推出和后备计划。听起来对吗？"
      },
      {
        "speaker": "Tom",
        "en": "Yeah, that's the gist of it. Oh, and we should probably <b>document everything</b> as we go because this is complex stuff.",
        "cn": "是的，那就是要点。哦，我们应该边走边记录所有东西，因为这很复杂。"
      },
      {
        "speaker": "Sara",
        "en": "Agreed. Alright Tom, <b>let's sync</b> with the team at your next standup and get this thing <b>kicked off</b>. I'll handle the customer comms piece.",
        "cn": "同意。好的Tom，让我们在你的下一次站立会议上与团队同步，把这个事情启动起来。我来处理客户沟通部分。"
      }
    ]
  },
  {
    "id": "pt5",
    "cat": "product",
    "catName": "产品",
    "catEmoji": "🔬",
    "title": "Product Launch Go/No-Go Decision",
    "titleCn": "产品发布：进行或不进行决定",
    "emoji": "👨🏽‍💼",
    "lines": [
      {
        "speaker": "Kevin",
        "en": "OK team, let's do a final <b>gut check</b> on the launch. Are we <b>ready to ship</b> in 48 hours?",
        "cn": "好的各位，让我们对发布做一次最后的检查。我们准备好在48小时内推出了吗？"
      },
      {
        "speaker": "Tasha",
        "en": "I'm not gonna <b>sugarcoat</b> this — there are some <b>loose ends</b> we're still tying up.",
        "cn": "我不会美化这个——还有一些我们仍在处理的未完成事项。"
      },
      {
        "speaker": "Kevin",
        "en": "Like what? <b>Lay it out</b> for me.",
        "cn": "像什么？告诉我。"
      },
      {
        "speaker": "Tasha",
        "en": "The mobile app still has a couple of <b>critical bugs</b>. Nothing that's a complete showstopper, but they're edge cases that could <b>look bad</b> if a user <b>happens to hit</b> them.",
        "cn": "手机应用仍然有几个关键bug。没有完全阻止发布的东西，但它们是边界情况，如果用户碰巧遇到，可能看起来很糟糕。"
      },
      {
        "speaker": "Ian",
        "en": "Can we <b>hot fix</b> those bugs before launch?",
        "cn": "我们能在发布前快速修复那些bug吗？"
      },
      {
        "speaker": "Tasha",
        "en": "Maybe one of them, but the other one is deeper in the stack. <b>There's a risk</b> that fixing it could <b>introduce new bugs</b> at this point.",
        "cn": "也许其中一个可以，但另一个更深层次。有风险修复它可能在这个时点引入新bug。"
      },
      {
        "speaker": "Kevin",
        "en": "So we're basically in the <b>classic launch dilemma</b> — do we <b>push</b> the launch or go with what we've got?",
        "cn": "所以我们基本上处于经典的发布困境——我们是推迟发布还是继续进行？"
      },
      {
        "speaker": "Ian",
        "en": "What does our user testing say? Did anybody <b>run into</b> these bugs during testing?",
        "cn": "我们的用户测试怎么说？有人在测试期间遇到这些bug吗？"
      },
      {
        "speaker": "Tasha",
        "en": "Only in very specific scenarios. Out of 200 test users, maybe 5 or 6 hit those particular bugs. So the <b>reproduction rate</b> is pretty low.",
        "cn": "只在非常具体的场景中。在200个测试用户中，也许5或6个遇到了那些特定的bug。所以再现率很低。"
      },
      {
        "speaker": "Kevin",
        "en": "And the bugs themselves — are they <b>data-destroying</b>, or just cosmetic issues?",
        "cn": "而且那些bug本身——是否会破坏数据，或只是表面问题？"
      },
      {
        "speaker": "Tasha",
        "en": "Cosmetic mostly. Some UI elements render wrong, but they don't affect functionality or data integrity.",
        "cn": "主要是表面问题。一些UI元素呈现错误，但它们不影响功能或数据完整性。"
      },
      {
        "speaker": "Ian",
        "en": "OK so <b>best case scenario</b>, most users won't even notice. And if they do, it's not gonna <b>blow up in our face</b>?",
        "cn": "好的，最好的情况是，大多数用户甚至不会注意到。而且如果他们注意到，也不会对我们造成灾难？"
      },
      {
        "speaker": "Tasha",
        "en": "Correct. But we should definitely <b>make sure our support team is prepped</b> in case we get tickets about these issues.",
        "cn": "正确。但我们肯定应该确保支持团队做好准备，以防我们收到关于这些问题的工单。"
      },
      {
        "speaker": "Kevin",
        "en": "What about the server side? Any <b>capacity concerns</b>?",
        "cn": "那服务器方面呢？有任何容量问题吗？"
      },
      {
        "speaker": "Ian",
        "en": "We're looking good on that front. We <b>stress tested</b> for 10x our expected launch day traffic, and the infrastructure <b>held up</b> fine.",
        "cn": "我们在那方面看起来不错。我们压力测试了预期发布日流量的10倍，基础设施保持得很好。"
      },
      {
        "speaker": "Kevin",
        "en": "Did we <b>load test</b> the API endpoints that are gonna get hammered?",
        "cn": "我们对将被大量使用的API端点进行了负载测试吗？"
      },
      {
        "speaker": "Ian",
        "en": "Yep, and we're seeing <b>sub-second response times</b> even under heavy load. The API should <b>scale beautifully</b>.",
        "cn": "是的，即使在重负载下，我们也看到毫秒级响应时间。API应该能够美妙地扩展。"
      },
      {
        "speaker": "Tasha",
        "en": "One more thing — have we <b>briefed the customer success team</b> on what's launching? They're gonna get questions.",
        "cn": "还有一件事——我们有没有向客户成功团队简报什么要推出？他们会有问题。"
      },
      {
        "speaker": "Kevin",
        "en": "Good point. I'll <b>loop them in</b> today with talking points. So here's where I land — we're a <b>go for launch</b>. We've done the work, the infrastructure is solid, and the bugs are low-risk. I'm comfortable with the call.",
        "cn": "很好的观点。我今天会用谈话要点通知他们。所以这是我的结论——我们可以发布了。我们已经做了工作，基础设施是稳固的，bug风险很低。我对这个决定很满意。"
      },
      {
        "speaker": "Ian",
        "en": "Agreed. Let's just make sure we have a <b>war room set up</b> for launch day so we can jump on any issues immediately.",
        "cn": "同意。让我们确保为发布日设置了战斗室，以便我们可以立即处理任何问题。"
      },
      {
        "speaker": "Tasha",
        "en": "Already on it. And we'll do a <b>post-launch review</b> next week to see what went well and what we can improve for the next launch.",
        "cn": "已经在进行中了。我们将在下周进行发布后审查，看看哪些进行得很好，以及我们可以为下一次发布改进什么。"
      }
    ]
  },
  {
    "id": "m2",
    "cat": "meetings",
    "catName": "会议",
    "catEmoji": "💬",
    "title": "Cross-Department Alignment Meeting",
    "titleCn": "跨部门协调会议",
    "emoji": "👩‍💼",
    "lines": [
      {
        "speaker": "Sarah",
        "en": "Thanks everyone for joining. Let's make sure we're all <b>on the same page</b> for this quarter.",
        "cn": "感谢大家的参加。让我们确保本季度我们都步调一致。"
      },
      {
        "speaker": "Mike",
        "en": "Absolutely. I'd like to <b>flag a concern</b> about the launch timeline.",
        "cn": "当然。我想提出一个关于发布时间表的问题。"
      },
      {
        "speaker": "Lisa",
        "en": "Go ahead, Mike. What's the <b>bottleneck</b>?",
        "cn": "请继续，迈克。瓶颈是什么？"
      },
      {
        "speaker": "Mike",
        "en": "The API integration isn't <b>locked in</b> yet. We need another two weeks.",
        "cn": "API集成还没有确定。我们需要再花两周时间。"
      },
      {
        "speaker": "Sarah",
        "en": "Got it. That's a critical <b>dependency</b> we need to address.",
        "cn": "明白了。这是一个我们需要解决的关键依赖项。"
      },
      {
        "speaker": "Lisa",
        "en": "Can we <b>circle back</b> on resource allocation? Engineering might need to <b>circle back</b> later.",
        "cn": "我们能再讨论资源配置吗？工程部稍后可能需要再次讨论。"
      },
      {
        "speaker": "Sarah",
        "en": "Sure. Let's <b>touch base</b> with Finance first about the budget.",
        "cn": "当然。让我们先和财务部接触一下关于预算的事宜。"
      },
      {
        "speaker": "Mike",
        "en": "I'll <b>loop in</b> my team and get back to you by EOD.",
        "cn": "我会让我的团队知道，今天下班前会回复你。"
      },
      {
        "speaker": "Lisa",
        "en": "Perfect. Let's <b>aim for</b> launch in late May then.",
        "cn": "完美。那我们就以五月底发布为目标吧。"
      },
      {
        "speaker": "Sarah",
        "en": "Before we wrap up, does anyone have <b>blocking issues</b>?",
        "cn": "在我们结束之前，有人有阻碍性问题吗？"
      },
      {
        "speaker": "Mike",
        "en": "Not at this point, but I'll <b>raise any red flags</b> in tomorrow's sync.",
        "cn": "目前没有，但我会在明天的同步会上提出任何红旗问题。"
      },
      {
        "speaker": "Lisa",
        "en": "I'll <b>drive alignment</b> with Product on the feature scope.",
        "cn": "我会推动产品部在功能范围上的一致性。"
      },
      {
        "speaker": "Sarah",
        "en": "Great. Let's <b>document the action items</b> in our shared tracker.",
        "cn": "很好。让我们在共享跟踪工具中记录行动项。"
      },
      {
        "speaker": "Mike",
        "en": "I'll make sure everything is <b>crystal clear</b> in the notes.",
        "cn": "我会确保笔记中一切都清晰明了。"
      },
      {
        "speaker": "Lisa",
        "en": "One more thing—let's <b>set a clear deadline</b> for the API integration.",
        "cn": "还有一件事——让我们为API集成设置一个明确的截止日期。"
      },
      {
        "speaker": "Sarah",
        "en": "Good call. Mike, can you <b>own that deliverable</b>?",
        "cn": "很好的建议。迈克，你能负责那个可交付成果吗？"
      },
      {
        "speaker": "Mike",
        "en": "Absolutely. I'll <b>take point</b> on the integration.",
        "cn": "当然。我会负责集成工作。"
      },
      {
        "speaker": "Lisa",
        "en": "Let's <b>sync up</b> again next week to check progress.",
        "cn": "让我们下周再同步一次以检查进展。"
      },
      {
        "speaker": "Sarah",
        "en": "Perfect. I'll <b>send a recap email</b> with all the decisions.",
        "cn": "完美。我会发送一封包含所有决定的总结邮件。"
      },
      {
        "speaker": "Mike",
        "en": "Thanks, Sarah. That really helps us stay <b>aligned</b> across teams.",
        "cn": "谢谢，莎拉。这真的有助于我们跨团队保持一致。"
      }
    ]
  },
  {
    "id": "m3",
    "cat": "meetings",
    "catName": "会议",
    "catEmoji": "💬",
    "title": "All-Hands Town Hall Q&A",
    "titleCn": "全员大会问答",
    "emoji": "👔",
    "lines": [
      {
        "speaker": "CEO",
        "en": "Good morning, everyone. Today I want to <b>be transparent</b> about where we stand.",
        "cn": "大家好。今天我想对我们的现状保持透明。"
      },
      {
        "speaker": "CEO",
        "en": "Our Q1 results exceeded targets—we <b>moved the needle</b> on revenue growth.",
        "cn": "我们Q1的结果超过了目标——我们在收入增长上取得了显著进展。"
      },
      {
        "speaker": "Emma",
        "en": "Thank you for that update. Can you help us understand the <b>strategic shift</b> in product focus?",
        "cn": "感谢您的更新。您能帮助我们理解产品焦点的战略转变吗？"
      },
      {
        "speaker": "CEO",
        "en": "Great question. We're <b>doubling down</b> on AI capabilities because that's where the market is heading.",
        "cn": "很好的问题。我们在AI能力上加倍投入，因为这是市场的发展方向。"
      },
      {
        "speaker": "James",
        "en": "Do we have visibility into the <b>hiring plans</b> for the next quarter?",
        "cn": "我们对下一季度的招聘计划有了解吗？"
      },
      {
        "speaker": "CEO",
        "en": "Absolutely. HR will <b>share the details</b> in a follow-up email, but we're <b>ramping up</b> by 15%.",
        "cn": "当然。人力资源部将在后续电邮中分享详情，但我们将增加15%。"
      },
      {
        "speaker": "Emma",
        "en": "That's exciting. How are we <b>staying competitive</b> in this market?",
        "cn": "这很令人兴奋。我们如何在这个市场中保持竞争力？"
      },
      {
        "speaker": "CEO",
        "en": "We're <b>playing to our strengths</b>—our team, our culture, and our customer relationships.",
        "cn": "我们在发挥我们的优势——我们的团队、文化和客户关系。"
      },
      {
        "speaker": "James",
        "en": "Some folks in the field are asking: what's the <b>path forward</b> on profitability?",
        "cn": "现场的一些人在问：盈利的前进道路是什么？"
      },
      {
        "speaker": "CEO",
        "en": "That's a fair question. We're <b>focused on</b> unit economics and will reach profitability by Q4.",
        "cn": "这是一个公平的问题。我们专注于单位经济学，将在第四季度达到盈利。"
      },
      {
        "speaker": "Emma",
        "en": "I really <b>appreciate the clarity</b> on our roadmap and timeline.",
        "cn": "我真的很欣赏您对我们路线图和时间表的清晰说明。"
      },
      {
        "speaker": "James",
        "en": "One more thing—how are we <b>addressing turnover</b> concerns?",
        "cn": "还有一件事——我们如何解决人员流失问题？"
      },
      {
        "speaker": "CEO",
        "en": "That's top priority. We're <b>investing in</b> culture initiatives and <b>retaining top talent</b> through competitive packages.",
        "cn": "那是首要任务。我们正在投资文化倡议，并通过有竞争力的方案留住顶尖人才。"
      },
      {
        "speaker": "Emma",
        "en": "Can you <b>shed some light on</b> the market challenges we might face ahead?",
        "cn": "您能对我们可能面临的市场挑战说明一下吗？"
      },
      {
        "speaker": "CEO",
        "en": "Sure. Rising competition and macro headwinds are <b>headwinds</b>, but we're well positioned.",
        "cn": "当然。竞争加剧和宏观逆风是挑战，但我们位置很好。"
      },
      {
        "speaker": "James",
        "en": "How should we <b>communicate these messages</b> to our customers?",
        "cn": "我们应该如何向客户传达这些信息？"
      },
      {
        "speaker": "CEO",
        "en": "Marketing will <b>align messaging</b> across all channels next week.",
        "cn": "营销部下周将在所有渠道上调整信息传递。"
      },
      {
        "speaker": "Emma",
        "en": "This really <b>paints a clear picture</b> of our future direction.",
        "cn": "这真的清楚地描绘了我们未来的方向。"
      },
      {
        "speaker": "James",
        "en": "Thanks for being so <b>forthcoming</b> about our challenges and opportunities.",
        "cn": "感谢您对我们的挑战和机会如此坦诚。"
      },
      {
        "speaker": "CEO",
        "en": "That's what we're here for. Let's keep this <b>open dialog</b> going—reach out anytime.",
        "cn": "这就是我们在这里的原因。让我们继续保持这种开放的对话——随时联系。"
      }
    ]
  },
  {
    "id": "m4",
    "cat": "meetings",
    "catName": "会议",
    "catEmoji": "💬",
    "title": "Project Kickoff Meeting",
    "titleCn": "项目启动会",
    "emoji": "📋",
    "lines": [
      {
        "speaker": "PM",
        "en": "Welcome everyone to the kickoff! Today we'll <b>set the stage</b> for this project.",
        "cn": "欢迎大家参加启动会！今天我们将为这个项目奠定基础。"
      },
      {
        "speaker": "PM",
        "en": "First, let's align on <b>ground rules</b>. Communication is key.",
        "cn": "首先，让我们就基本规则达成一致。沟通很关键。"
      },
      {
        "speaker": "Alex",
        "en": "Understood. What's the <b>scope</b> for this initiative?",
        "cn": "明白了。这个计划的范围是什么？"
      },
      {
        "speaker": "PM",
        "en": "Great question. Here are the <b>core deliverables</b>: mobile app, backend API, and analytics dashboard.",
        "cn": "很好的问题。这里是核心可交付物：移动应用、后端API和分析仪表板。"
      },
      {
        "speaker": "Sofia",
        "en": "How much time do we have? I need to know the <b>constraints</b>.",
        "cn": "我们有多少时间？我需要了解限制条件。"
      },
      {
        "speaker": "PM",
        "en": "We have four months. That's a tight timeline, so let's <b>stay focused</b>.",
        "cn": "我们有四个月。这是一个紧凑的时间表，所以让我们保持专注。"
      },
      {
        "speaker": "Alex",
        "en": "Can you <b>walk us through</b> the <b>critical path</b>?",
        "cn": "您能带我们过一遍关键路径吗？"
      },
      {
        "speaker": "PM",
        "en": "Absolutely. API development must finish by week 6, then mobile dev can <b>kick off</b>.",
        "cn": "当然。API开发必须在第6周完成，然后移动开发可以启动。"
      },
      {
        "speaker": "Sofia",
        "en": "What about design <b>handoff</b>? I want to make sure there are no delays.",
        "cn": "那设计交接呢？我想确保没有延迟。"
      },
      {
        "speaker": "PM",
        "en": "Good point. Design must be done by week 3 so engineering can <b>start building</b> immediately.",
        "cn": "很好的指出。设计必须在第3周完成，这样工程部可以立即开始构建。"
      },
      {
        "speaker": "Alex",
        "en": "I want to <b>flag the risk</b> of third-party dependencies. Do we have a <b>backup plan</b>?",
        "cn": "我想标记第三方依赖项的风险。我们有备用计划吗？"
      },
      {
        "speaker": "PM",
        "en": "Good thinking. Let's <b>identify all risks</b> today and create mitigation strategies.",
        "cn": "想得好。让我们今天识别所有风险并创建缓解策略。"
      },
      {
        "speaker": "Sofia",
        "en": "What's the <b>definition of done</b> for design? I need <b>clear success criteria</b>.",
        "cn": "设计的完成定义是什么？我需要清晰的成功标准。"
      },
      {
        "speaker": "PM",
        "en": "Excellent. We'll <b>document all success criteria</b> in the project charter.",
        "cn": "很好。我们将在项目章程中记录所有成功标准。"
      },
      {
        "speaker": "Alex",
        "en": "What's our <b>testing strategy</b>? Should we <b>build in</b> time for QA?",
        "cn": "我们的测试策略是什么？我们应该为QA预留时间吗？"
      },
      {
        "speaker": "PM",
        "en": "We'll allocate 20% of the timeline for testing. That's non-negotiable.",
        "cn": "我们将为测试分配20%的时间表。这是不可商议的。"
      },
      {
        "speaker": "Sofia",
        "en": "Do we have <b>stakeholder alignment</b> on the feature set?",
        "cn": "我们对功能集有利益相关者的一致性吗？"
      },
      {
        "speaker": "PM",
        "en": "Yes, I've already <b>checked in with</b> leadership. Everyone's bought in.",
        "cn": "是的，我已经和领导层沟通过了。每个人都同意了。"
      },
      {
        "speaker": "Alex",
        "en": "Perfect. Let's <b>document everything</b> we discussed today.",
        "cn": "完美。让我们记录我们今天讨论的一切。"
      },
      {
        "speaker": "PM",
        "en": "Will do. Let's <b>schedule weekly syncs</b> to keep everyone on track.",
        "cn": "当然。让我们安排每周同步会以保持每个人的进度。"
      }
    ]
  },
  {
    "id": "m5",
    "cat": "meetings",
    "catName": "会议",
    "catEmoji": "💬",
    "title": "Post-Mortem / Retrospective",
    "titleCn": "事后复盘会议",
    "emoji": "🎯",
    "lines": [
      {
        "speaker": "Lead",
        "en": "Thanks everyone for your hard work. Let's do a proper <b>postmortem</b> on this sprint.",
        "cn": "感谢大家的辛勤工作。让我们对这次冲刺进行适当的事后复盘。"
      },
      {
        "speaker": "Jordan",
        "en": "I think we should <b>start by identifying</b> what went well.",
        "cn": "我认为我们应该首先确定哪些做得好。"
      },
      {
        "speaker": "Lead",
        "en": "Excellent suggestion. <b>What went well</b> from your perspective?",
        "cn": "很好的建议。从你的角度来看，什么地方做得好？"
      },
      {
        "speaker": "Casey",
        "en": "The collaboration between teams was strong. We <b>stayed on track</b> overall.",
        "cn": "团队之间的协作很强。我们总体上保持了进度。"
      },
      {
        "speaker": "Jordan",
        "en": "I agree. But I want to <b>raise a point</b> about communication delays.",
        "cn": "我同意。但我想提出一个关于沟通延迟的问题。"
      },
      {
        "speaker": "Lead",
        "en": "Good feedback. <b>What specifically</b> caused the delays?",
        "cn": "很好的反馈。具体是什么导致了延迟？"
      },
      {
        "speaker": "Casey",
        "en": "We had unclear <b>acceptance criteria</b> early on. That <b>caused rework</b>.",
        "cn": "早期我们有不清楚的验收标准。这导致了返工。"
      },
      {
        "speaker": "Lead",
        "en": "That's a valuable insight. Let's <b>dig deeper</b> into that.",
        "cn": "这是一个很有价值的见解。让我们深入挖掘这个问题。"
      },
      {
        "speaker": "Jordan",
        "en": "I think we need <b>clearer handoffs</b> between design and engineering next time.",
        "cn": "我认为下次我们需要设计和工程之间的更清晰的交接。"
      },
      {
        "speaker": "Casey",
        "en": "Definitely. We also faced <b>bottlenecks in testing</b>. Our QA was understaffed.",
        "cn": "当然。我们在测试中也面临了瓶颈。我们的QA人员不足。"
      },
      {
        "speaker": "Lead",
        "en": "Let's <b>note that as an action item</b>: adjust QA staffing.",
        "cn": "让我们将其记为行动项：调整QA人员配置。"
      },
      {
        "speaker": "Jordan",
        "en": "I want to <b>acknowledge the team</b> for pushing through challenges.",
        "cn": "我想表扬团队克服挑战的努力。"
      },
      {
        "speaker": "Casey",
        "en": "The <b>learning curve</b> on the new framework was steep, but we managed.",
        "cn": "新框架的学习曲线很陡峭，但我们设法完成了。"
      },
      {
        "speaker": "Lead",
        "en": "That brings up training. We need <b>better onboarding</b> for new tools.",
        "cn": "这引出了培训。我们需要更好的新工具入职培训。"
      },
      {
        "speaker": "Jordan",
        "en": "One thing I'd <b>recommend changing</b>: daily standups felt repetitive.",
        "cn": "我推荐改变的一件事：每日站会感觉重复。"
      },
      {
        "speaker": "Casey",
        "en": "Fair point. Maybe we should <b>try a different format</b> next sprint.",
        "cn": "公平的指出。也许我们应该在下一次冲刺中尝试不同的格式。"
      },
      {
        "speaker": "Lead",
        "en": "Good idea. Let's <b>create an action plan</b> with concrete steps.",
        "cn": "很好的想法。让我们创建一个具体步骤的行动计划。"
      },
      {
        "speaker": "Jordan",
        "en": "I'll <b>document the takeaways</b> and send them out by EOD.",
        "cn": "我会记录要点并在下班前发送出来。"
      },
      {
        "speaker": "Casey",
        "en": "Thanks for running such a <b>blameless discussion</b>. That makes people feel safe giving feedback.",
        "cn": "感谢您进行了如此不指责的讨论。这让人们有安全感给予反馈。"
      },
      {
        "speaker": "Lead",
        "en": "That's the goal. Let's <b>apply these lessons</b> to make the next sprint even better.",
        "cn": "那是目标。让我们应用这些教训使下一次冲刺更好。"
      }
    ]
  },
  {
    "id": "o2",
    "cat": "oneonone",
    "catName": "一对一",
    "catEmoji": "👥",
    "title": "Career Development Check-in",
    "titleCn": "职业发展沟通",
    "emoji": "👩‍💼",
    "lines": [
      {
        "speaker": "Sarah",
        "en": "Thanks for making time for this. I wanted to <b>touch base</b> on my career trajectory.",
        "cn": "谢谢你抽时间。我想与你探讨一下我的职业发展方向。"
      },
      {
        "speaker": "Mike",
        "en": "Of course. I'm glad you brought this up. <b>What's on your mind</b>?",
        "cn": "当然可以。我很高兴你提出这个话题。你有什么想法吗？"
      },
      {
        "speaker": "Sarah",
        "en": "I've been thinking about <b>leveling up</b> my skills. I'd like to move into a senior role within the next year or two.",
        "cn": "我一直在考虑提升我的技能。我想在一两年内晋升到高级职位。"
      },
      {
        "speaker": "Mike",
        "en": "That's great ambition. Let me <b>get the ball rolling</b> on a development plan for you.",
        "cn": "这很有野心。我来为你开始制定一个发展计划。"
      },
      {
        "speaker": "Sarah",
        "en": "I appreciate that. Do you think I should <b>pursue certifications</b> in our industry?",
        "cn": "我很感谢。你认为我应该获取行业认证吗？"
      },
      {
        "speaker": "Mike",
        "en": "Absolutely. In fact, the company will <b>foot the bill</b> for approved training programs.",
        "cn": "绝对可以。实际上，公司会为批准的培训项目付费。"
      },
      {
        "speaker": "Sarah",
        "en": "Really? That would really <b>ease the burden</b> on my personal budget.",
        "cn": "真的吗？那会减轻我个人预算的负担。"
      },
      {
        "speaker": "Mike",
        "en": "We want to invest in our top talent. You've <b>been killing it</b> on the Johnson project.",
        "cn": "我们想要投资我们的优秀人才。你在约翰逊项目上表现非常出色。"
      },
      {
        "speaker": "Sarah",
        "en": "Thank you! I've really enjoyed that challenge. What other opportunities might <b>come down the line</b>?",
        "cn": "谢谢！我真的很享受这个挑战。还有什么其他机会可能出现吗？"
      },
      {
        "speaker": "Mike",
        "en": "Well, we're looking to <b>fill a gap</b> in our product management team next quarter.",
        "cn": "好的，下个季度我们希望填补产品管理团队的空缺。"
      },
      {
        "speaker": "Sarah",
        "en": "That sounds interesting. How would I need to <b>beef up</b> my product knowledge?",
        "cn": "听起来很有趣。我需要如何加强产品知识？"
      },
      {
        "speaker": "Mike",
        "en": "I'd suggest <b>shadowing</b> our current product leads for a few months.",
        "cn": "我建议你跟随我们现在的产品负责人几个月。"
      },
      {
        "speaker": "Sarah",
        "en": "I'd be <b>down for that</b>. When could we start?",
        "cn": "我同意这样做。我们什么时候可以开始？"
      },
      {
        "speaker": "Mike",
        "en": "Let me <b>loop in</b> the product director and we'll schedule a kick-off meeting.",
        "cn": "让我把产品主管拉进来，我们来安排一个启动会议。"
      },
      {
        "speaker": "Sarah",
        "en": "Great! I'm really <b>stoked about</b> this opportunity.",
        "cn": "太棒了！我对这个机会真的很兴奋。"
      },
      {
        "speaker": "Mike",
        "en": "Before we wrap up, let's also <b>nail down</b> some milestones for your development.",
        "cn": "在我们结束之前，让我们也确定你发展过程中的一些里程碑。"
      },
      {
        "speaker": "Sarah",
        "en": "Sounds good. Should we <b>set a follow-up</b> for next month?",
        "cn": "听起来不错。我们应该为下个月设定一个后续跟进吗？"
      },
      {
        "speaker": "Mike",
        "en": "Definitely. Let's <b>put something on the calendar</b> for a month from now.",
        "cn": "肯定的。我们把一个月后的会议加到日历上。"
      },
      {
        "speaker": "Sarah",
        "en": "Perfect. I'll also <b>reach out to</b> the certification team for program details.",
        "cn": "完美。我也会与认证团队联系以获取项目详情。"
      },
      {
        "speaker": "Mike",
        "en": "Excellent work taking initiative. This is exactly the <b>go-getter attitude</b> we value here.",
        "cn": "很好，你主动出击。这正是我们这里重视的进取精神。"
      }
    ]
  },
  {
    "id": "o3",
    "cat": "oneonone",
    "catName": "一对一",
    "catEmoji": "👥",
    "title": "Performance Feedback Session",
    "titleCn": "绩效反馈会议",
    "emoji": "👨‍💼",
    "lines": [
      {
        "speaker": "David",
        "en": "Thanks for sitting down with me. I wanted to <b>give you some feedback</b> on your performance this quarter.",
        "cn": "谢谢你的配合。我想给你一些关于这个季度表现的反馈。"
      },
      {
        "speaker": "Jessica",
        "en": "Sure, I appreciate that. I'm always <b>open to constructive criticism</b>.",
        "cn": "好的，我很感谢。我总是欢迎建设性的批评。"
      },
      {
        "speaker": "David",
        "en": "Overall, you've done an excellent job. Your <b>attention to detail</b> has really impressed everyone.",
        "cn": "总体上，你做得很好。你的细致注意力给大家留下了深刻印象。"
      },
      {
        "speaker": "Jessica",
        "en": "Thank you! That means a lot coming from you.",
        "cn": "谢谢你！这对我来说意义重大。"
      },
      {
        "speaker": "David",
        "en": "However, I did notice you sometimes <b>miss deadlines</b> on the smaller tasks. Can we <b>dig into</b> what's happening there?",
        "cn": "不过，我注意到你有时在一些小任务上会错过截止日期。我们能深入讨论一下吗？"
      },
      {
        "speaker": "Jessica",
        "en": "I see. I think I've been <b>spread too thin</b> trying to juggle multiple projects.",
        "cn": "我明白。我想我一直在试图处理多个项目，有点分身乏术。"
      },
      {
        "speaker": "David",
        "en": "That's helpful to know. Let's <b>work together</b> to <b>prioritize your workload</b>.",
        "cn": "这很有帮助。让我们一起优先安排你的工作量。"
      },
      {
        "speaker": "Jessica",
        "en": "I appreciate you <b>cutting me slack</b> a bit while I adjust.",
        "cn": "我感谢你在我调整的过程中给我一些宽容。"
      },
      {
        "speaker": "David",
        "en": "Of course. I also want to <b>recognize your contributions</b> to the team dynamics.",
        "cn": "当然。我也想表扬你对团队合作的贡献。"
      },
      {
        "speaker": "Jessica",
        "en": "Thanks! I really enjoy collaborating with my colleagues.",
        "cn": "谢谢！我真的很享受与同事的合作。"
      },
      {
        "speaker": "David",
        "en": "One area I'd like you to <b>work on</b> is your <b>communication with cross-functional teams</b>.",
        "cn": "我想让你改进的一个方面是与跨部门团队的沟通。"
      },
      {
        "speaker": "Jessica",
        "en": "I hear you. I think I could be more proactive about <b>reaching out</b> to other departments.",
        "cn": "我明白。我认为我应该更主动地与其他部门沟通。"
      },
      {
        "speaker": "David",
        "en": "Exactly. That will <b>take your game to the next level</b>.",
        "cn": "正是。这将会提升你的表现水平。"
      },
      {
        "speaker": "Jessica",
        "en": "How can I <b>stay on track</b> with these goals?",
        "cn": "我怎样才能在这些目标上保持进展？"
      },
      {
        "speaker": "David",
        "en": "Let's <b>set some clear milestones</b>. I'll check in with you biweekly.",
        "cn": "让我们设定一些明确的里程碑。我会每两周与你接触一次。"
      },
      {
        "speaker": "Jessica",
        "en": "That sounds really helpful. I'm committed to <b>stepping up my game</b>.",
        "cn": "这听起来真的很有帮助。我致力于提升我的表现。"
      },
      {
        "speaker": "David",
        "en": "I'm confident you will. Just remember to <b>ask for help</b> when you need it.",
        "cn": "我相信你会做到。只要记住在需要时寻求帮助。"
      },
      {
        "speaker": "Jessica",
        "en": "Will do. Should we <b>document these action items</b>?",
        "cn": "好的。我们应该记录这些行动项吗？"
      },
      {
        "speaker": "David",
        "en": "Great idea. I'll <b>draft up</b> a summary and send it to you by end of day.",
        "cn": "好主意。我会起草一份总结并在今天结束前发给你。"
      },
      {
        "speaker": "Jessica",
        "en": "Perfect. Thank you for this feedback. It really <b>gives me direction</b>.",
        "cn": "完美。感谢你的反馈。这真的为我指引了方向。"
      }
    ]
  },
  {
    "id": "o4",
    "cat": "oneonone",
    "catName": "一对一",
    "catEmoji": "👥",
    "title": "Workload & Burnout Discussion",
    "titleCn": "工作量与倦怠讨论",
    "emoji": "👨‍💼",
    "lines": [
      {
        "speaker": "Alex",
        "en": "Thank you for being so approachable. I need to <b>level with you</b> about something that's been bothering me.",
        "cn": "谢谢你这么平易近人。我需要和你坦诚谈一件困扰我的事情。"
      },
      {
        "speaker": "Morgan",
        "en": "Of course. <b>What's going on</b>? I want to make sure you're okay.",
        "cn": "当然可以。发生了什么？我想确保你没问题。"
      },
      {
        "speaker": "Alex",
        "en": "Honestly, I've been <b>burning the candle at both ends</b>. I'm working nights and weekends, and I'm really <b>running on empty</b>.",
        "cn": "说实话，我一直在过度工作。我在晚上和周末都在工作，我真的筋疲力尽了。"
      },
      {
        "speaker": "Morgan",
        "en": "I'm concerned to hear that. <b>Tell me more</b> about your current workload.",
        "cn": "听到这个我很担心。告诉我更多关于你目前的工作量。"
      },
      {
        "speaker": "Alex",
        "en": "I'm <b>juggling</b> three major projects right now, plus handling support tickets. It's <b>unsustainable</b>.",
        "cn": "我现在正在处理三个大项目，加上处理支持票。这是不可持续的。"
      },
      {
        "speaker": "Morgan",
        "en": "That's too much. Let's <b>lighten your load</b> right away.",
        "cn": "那太多了。让我们立即减轻你的负担。"
      },
      {
        "speaker": "Alex",
        "en": "I really appreciate that. I don't want to <b>throw in the towel</b>, but I'm afraid I'm headed toward burnout.",
        "cn": "我真的很感谢。我不想放弃，但我害怕我正在走向职业倦怠。"
      },
      {
        "speaker": "Morgan",
        "en": "You won't. We need to <b>address this proactively</b>. Which projects can we <b>delegate</b>?",
        "cn": "你不会的。我们需要主动解决这个问题。哪些项目我们可以委托？"
      },
      {
        "speaker": "Alex",
        "en": "The customer support tickets are really eating up my time. Maybe someone else could <b>take ownership</b> of those?",
        "cn": "客户支持票务真的在消耗我的时间。也许其他人可以接手这些？"
      },
      {
        "speaker": "Morgan",
        "en": "Good idea. I'll <b>reach out to</b> the support team about that.",
        "cn": "好主意。我会联系支持团队。"
      },
      {
        "speaker": "Alex",
        "en": "I'm also struggling because I don't feel like I can <b>switch off</b> after work.",
        "cn": "我也在挣扎，因为我觉得下班后无法真正放松。"
      },
      {
        "speaker": "Morgan",
        "en": "That's really important. <b>Setting boundaries</b> is crucial for your wellbeing.",
        "cn": "这真的很重要。设定界限对你的幸福至关重要。"
      },
      {
        "speaker": "Alex",
        "en": "I know I should, but I worry about <b>falling behind</b> if I'm not always available.",
        "cn": "我知道我应该这样做，但我担心如果我不总是可用会落后。"
      },
      {
        "speaker": "Morgan",
        "en": "I understand that fear, but <b>taking time off</b> will actually make you more productive.",
        "cn": "我理解那种担忧，但休息时间实际上会让你更有效率。"
      },
      {
        "speaker": "Alex",
        "en": "Maybe you're right. I haven't <b>used my vacation days</b> in over a year.",
        "cn": "也许你是对的。我已经一年多没有用我的假期了。"
      },
      {
        "speaker": "Morgan",
        "en": "That's definitely concerning. Here's what I want to do: <b>Let's rebalance your workload</b> and I'll set boundaries on urgent requests.",
        "cn": "那肯定令人担忧。以下是我想做的：让我们重新平衡你的工作量，我会对紧急请求设定界限。"
      },
      {
        "speaker": "Alex",
        "en": "I really <b>appreciate your support</b>. How quickly can we make these changes?",
        "cn": "我真的很感谢你的支持。我们多快能做出这些改变？"
      },
      {
        "speaker": "Morgan",
        "en": "Starting today. I'm going to <b>block time</b> on your calendar for deep focus work.",
        "cn": "从今天开始。我会在你的日历上安排深度工作的时间。"
      },
      {
        "speaker": "Alex",
        "en": "That would be amazing. I feel like I can finally <b>breathe again</b>.",
        "cn": "那会很棒。我感觉我终于可以喘口气了。"
      },
      {
        "speaker": "Morgan",
        "en": "You're going to be fine. Let's <b>check back in</b> next week to see how things are improving.",
        "cn": "你会没事的。让我们下周再联系一下，看看事情是否有改善。"
      }
    ]
  },
  {
    "id": "o5",
    "cat": "oneonone",
    "catName": "一对一",
    "catEmoji": "👥",
    "title": "New Manager Introduction Meeting",
    "titleCn": "新经理首次1对1会议",
    "emoji": "👩‍💼",
    "lines": [
      {
        "speaker": "James",
        "en": "Lisa, thanks for taking the time. I know it can be <b>a bit awkward</b> with a new manager, but I wanted to <b>get to know you</b> better.",
        "cn": "丽莎，谢谢你抽时间。我知道换新经理可能有点尴尬，但我想更了解你。"
      },
      {
        "speaker": "Lisa",
        "en": "Thanks for the opportunity. I'm excited to <b>work under your leadership</b>.",
        "cn": "谢谢这个机会。我很兴奋能在你的领导下工作。"
      },
      {
        "speaker": "James",
        "en": "Great! Let me start by saying: I'm very <b>hands-off</b> unless you need me. How do you <b>prefer to communicate</b>?",
        "cn": "很好！让我先说：除非你需要我，我通常不会过度干预。你更喜欢如何沟通？"
      },
      {
        "speaker": "Lisa",
        "en": "I appreciate that. I think I work best with <b>regular check-ins</b>, maybe once a week?",
        "cn": "我很感谢。我认为我最适合定期接触，也许一周一次？"
      },
      {
        "speaker": "James",
        "en": "Perfect. <b>That works for me</b>. I also believe in <b>transparent communication</b> — no surprises.",
        "cn": "完美。这对我来说很合适。我也相信透明的沟通 — 没有惊喜。"
      },
      {
        "speaker": "Lisa",
        "en": "I really like that approach. Can you <b>fill me in</b> on what you'd like to see from my role?",
        "cn": "我真的喜欢这种方式。你能告诉我你希望从我的角色中看到什么吗？"
      },
      {
        "speaker": "James",
        "en": "Absolutely. I've reviewed your background, and you have <b>solid technical skills</b>. My main focus is to see you <b>step into a leadership position</b> within the next year.",
        "cn": "当然。我审查了你的背景，你有扎实的技术技能。我的主要重点是看到你在明年内进入领导岗位。"
      },
      {
        "speaker": "Lisa",
        "en": "That's encouraging to hear. <b>What support do you think I'll need</b> to get there?",
        "cn": "听到这个真的很鼓舞。你认为我需要什么样的支持才能达到这个目标？"
      },
      {
        "speaker": "James",
        "en": "<b>For starters</b>, I'd like you to <b>lead one of the upcoming projects</b>. It's a chance to <b>demonstrate your capabilities</b>.",
        "cn": "首先，我希望你领导即将进行的一个项目。这是展示你能力的机会。"
      },
      {
        "speaker": "Lisa",
        "en": "I'm totally on board with that. <b>When would this start</b>?",
        "cn": "我完全同意。这什么时候开始？"
      },
      {
        "speaker": "James",
        "en": "We can <b>kick things off</b> next month. Before that, let's <b>map out the details</b> together.",
        "cn": "我们可以下个月启动。在那之前，让我们一起规划细节。"
      },
      {
        "speaker": "Lisa",
        "en": "Sounds good. I also want to understand your <b>management style</b>. How do you typically <b>give feedback</b>?",
        "cn": "听起来不错。我也想理解你的管理风格。你通常如何提供反馈？"
      },
      {
        "speaker": "James",
        "en": "I prefer <b>real-time feedback</b> — if something needs adjustment, I'll tell you immediately. It's nothing personal.",
        "cn": "我更喜欢实时反馈 — 如果某些东西需要调整，我会立即告诉你。这不是什么个人的事。"
      },
      {
        "speaker": "Lisa",
        "en": "I appreciate that directness. <b>How should I handle</b> disagreements or concerns?",
        "cn": "我感谢你的直率。我应该如何处理分歧或关切？"
      },
      {
        "speaker": "James",
        "en": "Please <b>voice your concerns freely</b>. I value different perspectives and <b>won't take it personally</b>.",
        "cn": "请自由地表达你的关切。我重视不同的观点，不会个人化对待。"
      },
      {
        "speaker": "Lisa",
        "en": "That's really reassuring. Are there any <b>pet peeves</b> or expectations I should know about?",
        "cn": "这真的很放心。有什么特别的宠好或期望我应该知道的吗？"
      },
      {
        "speaker": "James",
        "en": "Just a few things: Please <b>come prepared to meetings</b>, and if you'll miss a deadline, <b>flag it early</b>.",
        "cn": "只有几件事：请来会议时做好准备，如果你会错过截止日期，请提前标记。"
      },
      {
        "speaker": "Lisa",
        "en": "I can definitely do that. It's great to <b>align on expectations</b> from day one.",
        "cn": "我肯定能做到。从第一天开始就与期望保持一致真的很棒。"
      },
      {
        "speaker": "James",
        "en": "Exactly. One last thing — do you have any goals or concerns you'd like to <b>bring to my attention</b>?",
        "cn": "正是。最后一件事 — 你有什么目标或关切想提请我注意吗？"
      },
      {
        "speaker": "Lisa",
        "en": "Not right now, but I'll definitely <b>reach out</b> as things come up. I'm looking forward to working together!",
        "cn": "现在没有，但如果有事我肯定会联系你。我期待与你合作！"
      }
    ]
  },
  {
    "id": "r2",
    "cat": "review",
    "catName": "评审",
    "catEmoji": "📝",
    "title": "Code Architecture Review",
    "titleCn": "代码架构评审",
    "emoji": "👨‍💻",
    "lines": [
      {
        "speaker": "Robert",
        "en": "Thanks for <b>walking us through</b> your architecture changes, Elena. There are some solid improvements here.",
        "cn": "谢谢你带我们看你的架构变化，埃琳娜。这里有一些很好的改进。"
      },
      {
        "speaker": "Elena",
        "en": "Thanks! I tried to <b>keep things modular</b> and maintainable.",
        "cn": "谢谢！我尽力保持模块化和可维护性。"
      },
      {
        "speaker": "Robert",
        "en": "I can see that. However, I'm concerned about this section. <b>Have you considered</b> using a factory pattern here instead?",
        "cn": "我能看到这一点。不过，我对这一部分感到担忧。你考虑过在这里使用工厂模式吗？"
      },
      {
        "speaker": "Elena",
        "en": "Hmm, I didn't explore that option. <b>What's the benefit</b>?",
        "cn": "嗯，我没有探索过这个选项。有什么好处？"
      },
      {
        "speaker": "Robert",
        "en": "It would <b>reduce coupling</b> between components and make <b>unit testing</b> much easier.",
        "cn": "它会降低组件之间的耦合，并使单元测试更容易。"
      },
      {
        "speaker": "Elena",
        "en": "That makes sense. I'll <b>take that on board</b> and refactor that section.",
        "cn": "这有道理。我会考虑这个意见并重构那部分。"
      },
      {
        "speaker": "DevLead",
        "en": "Before you do, let's <b>discuss this further</b>. Are there performance implications?",
        "cn": "在你这样做之前，让我们进一步讨论。有性能影响吗？"
      },
      {
        "speaker": "Robert",
        "en": "Good question. <b>In theory</b>, the factory pattern might add minimal overhead, but <b>we should benchmark</b> to be sure.",
        "cn": "好问题。在理论上，工厂模式可能增加最小开销，但我们应该进行基准测试以确保。"
      },
      {
        "speaker": "Elena",
        "en": "I can <b>run some tests</b> on that. Anything else you'd like me to <b>address</b>?",
        "cn": "我可以对此运行一些测试。还有其他你想让我解决的问题吗？"
      },
      {
        "speaker": "Robert",
        "en": "Yes, actually. I noticed you're <b>instantiating dependencies</b> directly in several places. This <b>violates the DI principle</b>.",
        "cn": "是的，实际上。我注意到你在几个地方直接实例化依赖项。这违反了DI原则。"
      },
      {
        "speaker": "Elena",
        "en": "Oh, I see what you mean. That would make testing harder.",
        "cn": "哦，我明白你的意思。那会使测试更困难。"
      },
      {
        "speaker": "DevLead",
        "en": "Elena, <b>can you walk us through</b> your testing strategy?",
        "cn": "埃琳娜，你能为我们讲解一下你的测试策略吗？"
      },
      {
        "speaker": "Elena",
        "en": "I've written unit tests for the main components, but I haven't <b>covered edge cases</b> yet.",
        "cn": "我已经为主要组件编写了单元测试，但还没有覆盖边界情况。"
      },
      {
        "speaker": "Robert",
        "en": "That's something we definitely need to <b>flesh out</b>. Edge cases are critical.",
        "cn": "那是我们肯定需要充实的东西。边界情况很关键。"
      },
      {
        "speaker": "Elena",
        "en": "You're right. How <b>comprehensive</b> should my test coverage be?",
        "cn": "你是对的。我的测试覆盖范围应该有多全面？"
      },
      {
        "speaker": "Robert",
        "en": "Aim for at least 80% code coverage. <b>That's the industry standard</b> for critical code.",
        "cn": "目标至少是80%的代码覆盖率。这是关键代码的行业标准。"
      },
      {
        "speaker": "Elena",
        "en": "Got it. I'll <b>revise my implementation</b> based on this feedback.",
        "cn": "明白了。我会根据这个反馈修改我的实现。"
      },
      {
        "speaker": "DevLead",
        "en": "When do you think you can <b>make these changes</b>?",
        "cn": "你认为什么时候可以进行这些更改？"
      },
      {
        "speaker": "Elena",
        "en": "I'll <b>have a revised version</b> ready by end of week.",
        "cn": "我会在周末准备好修改版本。"
      },
      {
        "speaker": "Robert",
        "en": "Perfect. Once you've made updates, <b>let's do a follow-up review</b> to ensure everything aligns with our standards.",
        "cn": "完美。一旦你进行了更新，让我们进行后续审查以确保一切符合我们的标准。"
      }
    ]
  },
  {
    "id": "r3",
    "cat": "review",
    "catName": "评审",
    "catEmoji": "📝",
    "title": "Quarterly Business Review",
    "titleCn": "季度业务评审",
    "emoji": "👩‍💼",
    "lines": [
      {
        "speaker": "Sarah",
        "en": "Welcome, everyone. Let's <b>kick off</b> this quarter's business review. I've compiled <b>the key metrics</b> we need to discuss.",
        "cn": "欢迎大家。让我们启动本季度的业务评审。我已经编制了我们需要讨论的关键指标。"
      },
      {
        "speaker": "Michael",
        "en": "Thanks for putting this together. <b>Walk us through</b> the highlights, starting with revenue.",
        "cn": "感谢你的整理。为我们讲解亮点，从收入开始。"
      },
      {
        "speaker": "Finance",
        "en": "Absolutely. We're <b>looking at</b> a 15% increase in quarterly revenue, which <b>exceeds our targets</b> by 5%.",
        "cn": "当然。我们看到季度收入增长15%，这超过了我们的目标5%。"
      },
      {
        "speaker": "Sarah",
        "en": "That's excellent. However, <b>let's dig deeper</b> into acquisition costs. I'm concerned about the trend.",
        "cn": "那很好。不过，让我们深入探讨获客成本。我对这个趋势感到担忧。"
      },
      {
        "speaker": "Finance",
        "en": "Good point. Customer acquisition costs have <b>gone up by</b> 12% compared to last quarter.",
        "cn": "好点子。与上季度相比，客户获取成本上升了12%。"
      },
      {
        "speaker": "Michael",
        "en": "That's worrying. <b>What's driving</b> this increase?",
        "cn": "那令人担忧。是什么推动了这个增长？"
      },
      {
        "speaker": "Sarah",
        "en": "We've increased our marketing spend significantly. It's helping us <b>get the word out</b>, but we need to <b>optimize our ROI</b>.",
        "cn": "我们显著增加了市场营销支出。这帮助我们传播消息，但我们需要优化我们的投资回报率。"
      },
      {
        "speaker": "Finance",
        "en": "Looking at our conversion rates, I'd say we're <b>on track</b> with customer retention. Our churn rate is down to 3%.",
        "cn": "查看我们的转化率，我会说我们在客户保留方面进展顺利。我们的流失率降低到3%。"
      },
      {
        "speaker": "Michael",
        "en": "That's good news. Now, let's <b>talk about</b> our product roadmap. Are we still on schedule?",
        "cn": "那很好消息。现在，让我们谈论我们的产品路线图。我们仍然按计划进行吗？"
      },
      {
        "speaker": "Sarah",
        "en": "We're <b>slightly behind</b>, but not significantly. The engineering team is working to <b>catch up</b> next quarter.",
        "cn": "我们稍微落后了，但不是太多。工程团队正在努力在下个季度追上进度。"
      },
      {
        "speaker": "Michael",
        "en": "I'd like to <b>pivot our strategy</b> slightly. Should we <b>ramp up</b> product development or focus on sales?",
        "cn": "我想稍微改变我们的战略。我们应该加快产品开发还是专注于销售？"
      },
      {
        "speaker": "Finance",
        "en": "<b>Based on the data</b>, I'd recommend focusing on sales first. We have strong product-market fit now.",
        "cn": "根据数据，我建议首先专注于销售。我们现在有很强的产品市场契合度。"
      },
      {
        "speaker": "Sarah",
        "en": "I agree. That means we need to <b>allocate more resources</b> to the sales team.",
        "cn": "我同意。这意味着我们需要为销售团队分配更多资源。"
      },
      {
        "speaker": "Michael",
        "en": "Sounds reasonable. What about our new market expansion? Are we <b>making headway</b>?",
        "cn": "听起来合理。我们的新市场拓展呢？我们取得进展了吗？"
      },
      {
        "speaker": "Finance",
        "en": "Yes, the European market is <b>starting to gain traction</b>. We've <b>lined up</b> three enterprise clients.",
        "cn": "是的，欧洲市场开始获得关注。我们已经确保了三个企业客户。"
      },
      {
        "speaker": "Sarah",
        "en": "That's very encouraging. Let's <b>formalize this strategy</b> and <b>set quarterly targets</b> for expansion.",
        "cn": "这非常令人鼓舞。让我们正式确定这个战略并为扩展设定季度目标。"
      },
      {
        "speaker": "Michael",
        "en": "Before we wrap up, let's <b>touch base</b> on operational efficiency. Are there any bottlenecks we should <b>address</b>?",
        "cn": "在我们结束之前，让我们简要联系一下运营效率。有什么瓶颈我们应该处理的吗？"
      },
      {
        "speaker": "Finance",
        "en": "Actually, yes. Our infrastructure costs have <b>spiraled out of control</b>. We need to <b>streamline our systems</b>.",
        "cn": "实际上，有的。我们的基础设施成本已经失控了。我们需要简化我们的系统。"
      },
      {
        "speaker": "Sarah",
        "en": "That's a critical issue. I'll <b>initiate a review</b> with the IT department immediately.",
        "cn": "这是一个关键问题。我会立即与IT部门启动审查。"
      },
      {
        "speaker": "Michael",
        "en": "Excellent. So, to <b>sum things up</b>: strong revenue growth, but we need to control costs and focus on sales expansion. <b>Let's reconvene</b> next month.",
        "cn": "非常好。总结一下：收入强劲增长，但我们需要控制成本并专注于销售拓展。让我们下个月再次开会。"
      }
    ]
  },
  {
    "id": "r4",
    "cat": "review",
    "catName": "评审",
    "catEmoji": "📝",
    "title": "Security Audit Review",
    "titleCn": "安全审计评审",
    "emoji": "👨‍💼",
    "lines": [
      {
        "speaker": "Marcus",
        "en": "Thanks for conducting the audit. I know these reviews can be <b>time-consuming</b>, but they're essential. Please <b>share your findings</b>.",
        "cn": "感谢你进行审计。我知道这些评审可能很费时，但它们很重要。请分享你的发现。"
      },
      {
        "speaker": "Security",
        "en": "Understood. Overall, I'm pleased to report that <b>we're doing well</b> with our security posture, but there are several areas that <b>need attention</b>.",
        "cn": "理解。总体来说，我很高兴报告我们的安全状况做得很好，但有几个领域需要关注。"
      },
      {
        "speaker": "Lisa",
        "en": "Can you <b>break this down</b> for us? What are the critical findings?",
        "cn": "你能为我们分解这个吗？关键发现是什么？"
      },
      {
        "speaker": "Security",
        "en": "Sure. We identified a <b>critical vulnerability</b> in the authentication system. <b>It requires immediate patching</b>.",
        "cn": "当然。我们在身份验证系统中发现了一个关键漏洞。它需要立即修补。"
      },
      {
        "speaker": "Marcus",
        "en": "How serious is this? Can someone <b>exploit this vulnerability</b> easily?",
        "cn": "这有多严重？有人可以轻易利用这个漏洞吗？"
      },
      {
        "speaker": "Security",
        "en": "Yes, unfortunately. This is a <b>high-risk issue</b> that could <b>compromise user data</b>.",
        "cn": "是的，不幸的是。这是一个高风险问题，可能会危及用户数据。"
      },
      {
        "speaker": "Lisa",
        "en": "This needs to be <b>addressed immediately</b>. What's our timeline?",
        "cn": "这需要立即处理。我们的时间表是什么？"
      },
      {
        "speaker": "Security",
        "en": "I'd recommend we <b>prioritize this patch</b> and deploy it within 48 hours.",
        "cn": "我建议我们优先考虑这个补丁并在48小时内部署它。"
      },
      {
        "speaker": "Marcus",
        "en": "Agreed. We'll <b>mobilize the team</b> right away. What else did you find?",
        "cn": "同意。我们会立即动员团队。你还发现了什么？"
      },
      {
        "speaker": "Security",
        "en": "We also discovered several instances where <b>passwords weren't properly encrypted</b> in our database.",
        "cn": "我们还发现了几个实例，其中数据库中的密码没有正确加密。"
      },
      {
        "speaker": "Lisa",
        "en": "That's concerning. <b>How many accounts</b> are affected?",
        "cn": "那令人担忧。有多少个账户受到影响？"
      },
      {
        "speaker": "Security",
        "en": "Approximately 50,000 accounts. However, I recommend we <b>notify users</b> and <b>require password resets</b>.",
        "cn": "大约50,000个账户。但是，我建议我们通知用户并要求重置密码。"
      },
      {
        "speaker": "Marcus",
        "en": "That will have a major impact on our reputation if it <b>becomes public</b>. We need to act fast.",
        "cn": "如果这变成公开的，这将对我们的声誉产生重大影响。我们需要快速行动。"
      },
      {
        "speaker": "Security",
        "en": "Agreed. <b>Let's develop an action plan</b>. First, we <b>patch the vulnerability</b>. Then, we fix encryption issues.",
        "cn": "同意。让我们制定一个行动计划。首先，我们修补漏洞。然后，我们修复加密问题。"
      },
      {
        "speaker": "Lisa",
        "en": "Should we <b>bring in external consultants</b> to help expedite this?",
        "cn": "我们应该引入外部顾问来帮助加快这个过程吗？"
      },
      {
        "speaker": "Security",
        "en": "I think it's wise. A third-party review will <b>validate our remediation efforts</b>.",
        "cn": "我认为这很明智。第三方评审将验证我们的补救工作。"
      },
      {
        "speaker": "Marcus",
        "en": "Okay. Lisa, can you <b>liaise with</b> legal about notification requirements?",
        "cn": "好的。丽莎，你能与法律部门联系关于通知要求吗？"
      },
      {
        "speaker": "Lisa",
        "en": "Will do. We'll also <b>ensure compliance</b> with GDPR and other regulations.",
        "cn": "会的。我们还将确保符合GDPR和其他法规。"
      },
      {
        "speaker": "Security",
        "en": "Finally, I recommend we <b>strengthen our security protocols</b> going forward.",
        "cn": "最后，我建议我们加强我们的安全协议以便往后继续。"
      },
      {
        "speaker": "Marcus",
        "en": "Excellent. Let's <b>document everything</b> and <b>schedule a follow-up meeting</b> for next week to review progress.",
        "cn": "非常好。让我们记录一切并为下周安排后续会议以审查进展。"
      }
    ]
  },
  {
    "id": "r5",
    "cat": "review",
    "catName": "评审",
    "catEmoji": "📝",
    "title": "Product Launch Readiness Review",
    "titleCn": "产品上线准备评审",
    "emoji": "👩‍💼",
    "lines": [
      {
        "speaker": "Jennifer",
        "en": "Great to have everyone here. We're <b>approaching launch day</b>, so let's make sure we're <b>on the same page</b>. Are we ready?",
        "cn": "很高兴大家都在这里。我们即将发布，所以让我们确保我们意见一致。我们准备好了吗？"
      },
      {
        "speaker": "Tom",
        "en": "Before we proceed, I need to <b>flag some concerns</b> about marketing readiness.",
        "cn": "在我们继续之前，我需要指出一些营销准备方面的关切。"
      },
      {
        "speaker": "Jennifer",
        "en": "Okay, <b>what's the issue</b>? <b>Talk us through it</b>.",
        "cn": "好的，问题是什么？为我们讲解一下。"
      },
      {
        "speaker": "Tom",
        "en": "The marketing campaign isn't <b>fully finalized</b>. We still need to <b>coordinate messaging</b> across all channels.",
        "cn": "营销活动还没有完全确定。我们仍然需要在所有渠道上协调信息传递。"
      },
      {
        "speaker": "QA",
        "en": "That's a concern, but from our side, the product is <b>feature-complete</b> and <b>bug-free</b> for launch.",
        "cn": "那是一个关切，但从我们的角度来看，产品对于发布是功能完整和无缺陷的。"
      },
      {
        "speaker": "Jennifer",
        "en": "Good to hear. Tom, <b>what's your timeline</b> for marketing materials?",
        "cn": "很高兴听到。汤姆，你的营销材料时间表是什么？"
      },
      {
        "speaker": "Tom",
        "en": "We can <b>wrap things up</b> by Friday if we <b>get approval</b> on the campaign by Wednesday.",
        "cn": "如果我们周三得到活动批准，我们可以在周五前完成。"
      },
      {
        "speaker": "Jennifer",
        "en": "Friday might be <b>cutting it close</b> for our Tuesday launch. Can you accelerate that timeline?",
        "cn": "周五对于我们的周二发布来说可能太紧张了。你能加快那个时间表吗？"
      },
      {
        "speaker": "Tom",
        "en": "Actually, if we <b>prioritize the most critical materials</b>, we could <b>have them ready</b> by Thursday.",
        "cn": "实际上，如果我们优先考虑最关键的材料，我们可以在周四准备好。"
      },
      {
        "speaker": "Jennifer",
        "en": "That works. Let's <b>move forward with that plan</b>. Jennifer, are there any <b>logistics or operational issues</b> we should be aware of?",
        "cn": "那样有效。让我们推进这个计划。詹妮弗，有什么物流或运营问题我们应该注意的吗？"
      },
      {
        "speaker": "QA",
        "en": "The server infrastructure is <b>ready to handle</b> the expected traffic. However, we'll need to <b>monitor closely</b> for the first 24 hours.",
        "cn": "服务器基础设施已准备好处理预期的流量。但是，我们需要在前24小时内密切监控。"
      },
      {
        "speaker": "Tom",
        "en": "Should we <b>have a contingency plan</b> in case something goes wrong?",
        "cn": "如果出了问题，我们应该有应急计划吗？"
      },
      {
        "speaker": "Jennifer",
        "en": "Absolutely. <b>Let's detail out</b> a rollback procedure if we encounter critical issues.",
        "cn": "绝对的。让我们详细说明如果遇到关键问题时的回滚程序。"
      },
      {
        "speaker": "QA",
        "en": "We can <b>roll back within</b> 30 minutes if needed. I've already prepared the procedure.",
        "cn": "如果需要，我们可以在30分钟内回滚。我已经准备好了程序。"
      },
      {
        "speaker": "Jennifer",
        "en": "Excellent. One more thing — are we <b>confident about</b> user adoption?",
        "cn": "很好。还有一件事 — 我们对用户采用有信心吗？"
      },
      {
        "speaker": "Tom",
        "en": "Yes. We've been <b>building anticipation</b> with beta testers. The feedback has been very positive.",
        "cn": "是的。我们一直在与测试用户建立期待。反馈非常积极。"
      },
      {
        "speaker": "QA",
        "en": "I'd like to <b>suggest a soft launch</b> to a subset of users first to catch any last-minute issues.",
        "cn": "我想建议先对用户子集进行软发布，以捕获任何最后时刻的问题。"
      },
      {
        "speaker": "Jennifer",
        "en": "Great idea. That will help us <b>validate our assumptions</b> before the full launch.",
        "cn": "很好的主意。这将帮助我们在完全发布之前验证我们的假设。"
      },
      {
        "speaker": "Tom",
        "en": "Okay, so to summarize: we're <b>all set</b> pending marketing approval by Wednesday. Agreed?",
        "cn": "好的，总结一下：待周三营销批准后，我们万事俱备。同意吗？"
      },
      {
        "speaker": "Jennifer",
        "en": "Perfect. Let's <b>execute on this plan</b> and <b>touch base</b> daily until launch. <b>We are a go!</b>",
        "cn": "完美。让我们执行这个计划并每天联系。我们准备好了！"
      }
    ]
  },
  {
    "id": "c2",
    "cat": "daily",
    "catName": "日常",
    "catEmoji": "🫖",
    "title": "Lunch Run with Coworkers",
    "titleCn": "同事一起午餐",
    "emoji": "👨‍💼",
    "lines": [
      {
        "speaker": "Alex",
        "en": "Hey team, I'm <b>starving</b>. Should we <b>grab lunch</b> together?",
        "cn": "嘿，伙计们，我饿死了。我们一起去吃午餐怎么样？"
      },
      {
        "speaker": "Sarah",
        "en": "Yeah, I'm <b>down for</b> that! Where's everyone thinking?",
        "cn": "好啊，我赞成！大家在想哪里吃？"
      },
      {
        "speaker": "Mike",
        "en": "Honestly, <b>I could go either way</b>. Mexican or Thai?",
        "cn": "说实话，我都可以。墨西哥菜还是泰国菜？"
      },
      {
        "speaker": "Alex",
        "en": "I'm <b>sick of</b> Thai right now. How about <b>that new place</b> downtown?",
        "cn": "我现在吃腻了泰国菜。那家新开的市中心餐厅怎么样？"
      },
      {
        "speaker": "Sarah",
        "en": "Ooh, the one with the <b>fire tacos</b>? I'm <b>totally in</b>!",
        "cn": "哦，那家有超辣塔可的地方？我完全同意！"
      },
      {
        "speaker": "Mike",
        "en": "Let me check the <b>menu real quick</b>. Is it <b>close by</b>?",
        "cn": "让我快速看一下菜单。它离得近吗？"
      },
      {
        "speaker": "Alex",
        "en": "Yeah, it's like <b>five minutes away</b>. We can <b>dip out</b> now and be back by one.",
        "cn": "是的，大约五分钟的路程。我们现在可以溜出去，一点之前回来。"
      },
      {
        "speaker": "Sarah",
        "en": "Perfect! Let me just <b>knock on the boss's door</b> and tell him we're taking lunch.",
        "cn": "完美！让我敲一下老板的门，告诉他我们要去吃午餐。"
      },
      {
        "speaker": "Mike",
        "en": "You think he'll <b>be cool with it</b>? We have that meeting at two, right?",
        "cn": "你觉得他会同意吗？我们两点有个会议，对吧？"
      },
      {
        "speaker": "Alex",
        "en": "Yeah, but we should <b>be back in plenty of time</b>. Let's <b>move it</b>!",
        "cn": "是的，但我们应该有充足的时间回来。让我们动作快点！"
      },
      {
        "speaker": "Sarah",
        "en": "Hold up! I need to <b>grab my wallet</b> from my desk.",
        "cn": "等等！我需要从我的办公桌拿上钱包。"
      },
      {
        "speaker": "Mike",
        "en": "<b>Good call</b>. I'll <b>meet you guys at the elevator</b>.",
        "cn": "想得好。我在电梯那里和你们碰面。"
      },
      {
        "speaker": "Alex",
        "en": "Awesome! And hey, if anyone's <b>short on cash</b>, I can <b>spot you</b>.",
        "cn": "太好了！如果有人缺钱，我可以借你们。"
      },
      {
        "speaker": "Sarah",
        "en": "You're <b>a lifesaver</b>, Alex! Let me just <b>send a quick Slack</b> to the team.",
        "cn": "你真是救世主，亚历克斯！让我快速发个Slack信息给团队。"
      },
      {
        "speaker": "Mike",
        "en": "<b>What time should we head out</b>? Like right now?",
        "cn": "我们什么时候出发？现在就去？"
      },
      {
        "speaker": "Alex",
        "en": "<b>ASAP</b> is probably best. I'm <b>absolutely famished</b>!",
        "cn": "越快越好。我真的饿坏了！"
      },
      {
        "speaker": "Sarah",
        "en": "Alright, <b>let's roll</b>! Oh wait, should we <b>invite anyone else</b>?",
        "cn": "好的，我们出发吧！哦等等，我们应该邀请其他人吗？"
      },
      {
        "speaker": "Mike",
        "en": "Nah, <b>the crew's already pretty full</b>. Just the three of us is <b>chill</b>.",
        "cn": "不，我们的人已经够了。就我们三个很舒服。"
      },
      {
        "speaker": "Alex",
        "en": "Cool, <b>let's bounce</b> then! I'll <b>snag a table</b> if we get there first.",
        "cn": "好的，我们走吧！如果我们先到，我会拿到一张桌子。"
      },
      {
        "speaker": "Sarah",
        "en": "<b>Sounds good to me</b>! Let's hit the road!",
        "cn": "听起来不错！让我们出发！"
      }
    ]
  },
  {
    "id": "c3",
    "cat": "daily",
    "catName": "日常",
    "catEmoji": "🫖",
    "title": "Happy Hour After Work",
    "titleCn": "下班后的欢乐时光",
    "emoji": "👩‍💼",
    "lines": [
      {
        "speaker": "Jamie",
        "en": "Finally! I need to <b>let loose</b> after this crazy week.",
        "cn": "终于！这周太疯狂了，我需要放松一下。"
      },
      {
        "speaker": "Chris",
        "en": "Tell me about it. That project was <b>pretty intense</b>. <b>Cheers to the weekend</b>!",
        "cn": "我完全同意。那个项目真的很紧张。敬周末！"
      },
      {
        "speaker": "Priya",
        "en": "Seriously, I'm <b>pumped</b> to just <b>chill out</b> for two days.",
        "cn": "认真地说，我很兴奋能够放松两天。"
      },
      {
        "speaker": "Jamie",
        "en": "What are you guys <b>up to</b> this weekend? Anything fun planned?",
        "cn": "你们这个周末要做什么？计划了什么有趣的事情吗？"
      },
      {
        "speaker": "Chris",
        "en": "I'm thinking about <b>sleeping in</b>, then maybe <b>grabbing brunch</b> with the wife.",
        "cn": "我在想睡个懒觉，然后也许和妻子去吃早午餐。"
      },
      {
        "speaker": "Priya",
        "en": "That sounds <b>lowkey amazing</b>. I'm probably just <b>staying in</b> and watching Netflix.",
        "cn": "这听起来很棒。我可能就待在家里看Netflix。"
      },
      {
        "speaker": "Jamie",
        "en": "Aw, come on! You should <b>get out and do something</b>. Don't just <b>couch potato</b> it.",
        "cn": "哎呀，拜托！你应该出去做点什么。别就这样窝在沙发上。"
      },
      {
        "speaker": "Priya",
        "en": "Maybe you're right. <b>What do you suggest</b>? I need some <b>inspo</b>.",
        "cn": "也许你说得对。你有什么建议？我需要一些灵感。"
      },
      {
        "speaker": "Chris",
        "en": "There's a cool concert downtown this Saturday. We should <b>totally go</b>!",
        "cn": "周六市中心有个很酷的演唱会。我们应该绝对去！"
      },
      {
        "speaker": "Jamie",
        "en": "Oh yeah? <b>Who's playing</b>? I'm <b>down if</b> it's someone good.",
        "cn": "是吗？谁在表演？如果是个不错的艺人，我就赞成。"
      },
      {
        "speaker": "Chris",
        "en": "It's that band we were <b>vibing on</b> last month. You know, the indie rock ones?",
        "cn": "就是我们上个月喜欢的那个乐队。你知道的，独立摇滚乐队？"
      },
      {
        "speaker": "Priya",
        "en": "Oh, <b>for sure</b>! I'm actually <b>really into</b> them right now.",
        "cn": "哦，当然！我现在真的很喜欢他们。"
      },
      {
        "speaker": "Jamie",
        "en": "Cool, let's <b>make it happen</b>. Someone <b>check the ticket prices</b> real quick?",
        "cn": "好的，我们就这样做。有人快速查一下票价吗？"
      },
      {
        "speaker": "Chris",
        "en": "Already on it. Tickets are like <b>forty bucks</b> each. That's <b>not too bad</b>.",
        "cn": "我已经查了。票大约每张四十块。不太贵。"
      },
      {
        "speaker": "Priya",
        "en": "I'm <b>game for that</b>. Should we <b>invite the crew</b> from our team?",
        "cn": "我同意。我们应该邀请我们团队的其他人吗？"
      },
      {
        "speaker": "Jamie",
        "en": "Yeah, the more the <b>merrier</b>! Let me <b>shoot a message</b> in our group chat.",
        "cn": "是的，人越多越好玩！让我在我们的群聊里发消息。"
      },
      {
        "speaker": "Chris",
        "en": "<b>Sounds like a plan</b>! I'll <b>grab another round</b> of drinks to celebrate.",
        "cn": "听起来不错！我会再来一轮饮料来庆祝。"
      },
      {
        "speaker": "Priya",
        "en": "This is why I love working here. The team is <b>pretty solid</b>.",
        "cn": "这就是我喜欢在这里工作的原因。这个团队很棒。"
      },
      {
        "speaker": "Jamie",
        "en": "Right? Even though work is <b>no joke</b>, at least we <b>vibe well together</b>.",
        "cn": "对吧？虽然工作很不简单，但至少我们相处融洽。"
      },
      {
        "speaker": "Chris",
        "en": "Alright, <b>let's toast</b> to surviving another week and an awesome weekend ahead!",
        "cn": "好的，让我们为度过了又一周和即将到来的美好周末而干杯！"
      }
    ]
  },
  {
    "id": "c4",
    "cat": "daily",
    "catName": "日常",
    "catEmoji": "🫖",
    "title": "Water Cooler Sports Talk",
    "titleCn": "茶水间聊体育",
    "emoji": "👨‍💼",
    "lines": [
      {
        "speaker": "David",
        "en": "Did you catch <b>the game last night</b>? It was <b>insane</b>!",
        "cn": "你看了昨晚的比赛吗？太疯狂了！"
      },
      {
        "speaker": "Lisa",
        "en": "Yeah! I was <b>literally on the edge of my seat</b> the whole time.",
        "cn": "是的！我整个时间都坐在椅子边上。"
      },
      {
        "speaker": "Tony",
        "en": "I <b>dozed off</b> during the second half. Was it good?",
        "cn": "我在下半场睡着了。好看吗？"
      },
      {
        "speaker": "David",
        "en": "Are you serious? Dude, it was <b>the most epic finish</b> I've ever seen!",
        "cn": "你是认真的吗？伙计，这是我见过的最壮观的结局！"
      },
      {
        "speaker": "Lisa",
        "en": "Right? When they scored that last-minute goal, I literally <b>jumped out of my chair</b>.",
        "cn": "对吧？当他们进了那个最后一刻的进球时，我真的跳起来了。"
      },
      {
        "speaker": "Tony",
        "en": "<b>No way</b>! Who scored? I might need to <b>check the highlights</b> later.",
        "cn": "不可能！谁进的球？我稍后可能需要查看精彩片段。"
      },
      {
        "speaker": "David",
        "en": "It was the rookie. Kid is <b>absolutely killing it</b> this season.",
        "cn": "是新秀进的。这个小伙子这赛季表现得真是太棒了。"
      },
      {
        "speaker": "Lisa",
        "en": "For real! I wasn't expecting much from him, but he's been <b>playing out of his mind</b>.",
        "cn": "真的！我本来没有对他抱太大期望，但他一直在超常发挥。"
      },
      {
        "speaker": "Tony",
        "en": "That's cool. Maybe <b>I should tune in</b> more often. I've been <b>out of the loop</b> lately.",
        "cn": "那很酷。也许我应该更经常地关注一下。我最近有点与世隔绝。"
      },
      {
        "speaker": "David",
        "en": "Dude, you're missing out! This season has been <b>straight fire</b>.",
        "cn": "伙计，你错过了！这赛季真的太棒了。"
      },
      {
        "speaker": "Lisa",
        "en": "Yeah, and next week's matchup is supposed to be <b>absolutely crazy</b>. It's the championship game!",
        "cn": "是的，下周的比赛应该非常疯狂。这是总决赛！"
      },
      {
        "speaker": "Tony",
        "en": "Okay, okay, I'm convinced. <b>Can you fill me in</b> on what I missed?",
        "cn": "好的，好的，你们说服我了。你能告诉我我错过了什么吗？"
      },
      {
        "speaker": "David",
        "en": "<b>Long story short</b>, the team was down by 5 points at halftime.",
        "cn": "长话短说，球队在中场落后5分。"
      },
      {
        "speaker": "Lisa",
        "en": "Then in the second half, they came back strong. <b>It was a nail-biter</b> until the very end.",
        "cn": "然后在下半场，他们强势回归。直到最后都很紧张。"
      },
      {
        "speaker": "Tony",
        "en": "Wow, that sounds intense! <b>What was the final score</b>?",
        "cn": "哇，听起来很紧张！最终比分是多少？"
      },
      {
        "speaker": "David",
        "en": "108 to 105. <b>A squeaker</b>, but they pulled it off!",
        "cn": "108比105。虽然很险，但他们赢了！"
      },
      {
        "speaker": "Lisa",
        "en": "<b>The crowd went wild</b>. I think I lost my voice from yelling!",
        "cn": "观众疯狂了。我觉得我的嗓子都喊哑了！"
      },
      {
        "speaker": "Tony",
        "en": "That's awesome! You guys should <b>really hype me up more often</b> so I watch.",
        "cn": "太棒了！你们应该更经常鼓励我，这样我会看的。"
      },
      {
        "speaker": "David",
        "en": "<b>Deal</b>! Same time next week? We can <b>grab some snacks</b> and watch it here at work.",
        "cn": "好的！下周同一时间？我们可以拿点零食，在办公室这里看。"
      },
      {
        "speaker": "Lisa",
        "en": "Yes! <b>Sounds like a plan</b>. Tony, you're not allowed to doze off again!",
        "cn": "是的！听起来不错。托尼，你不允许再睡着了！"
      }
    ]
  },
  {
    "id": "c5",
    "cat": "daily",
    "catName": "日常",
    "catEmoji": "🫖",
    "title": "Weekend Plans Chat",
    "titleCn": "聊周末计划",
    "emoji": "👩‍💼",
    "lines": [
      {
        "speaker": "Emma",
        "en": "So, what's everyone doing this weekend? Anything exciting <b>on the agenda</b>?",
        "cn": "那么，大家这个周末要做什么？有什么有趣的计划吗？"
      },
      {
        "speaker": "Mark",
        "en": "Honestly, I'm just planning a <b>chill weekend</b>. Nothing too crazy.",
        "cn": "说实话，我只是计划一个放松的周末。没什么太疯狂的。"
      },
      {
        "speaker": "Sophie",
        "en": "Same here! I'm <b>all about</b> that <b>staycation</b> life right now.",
        "cn": "我也是！我现在完全支持那种居家度假的生活方式。"
      },
      {
        "speaker": "Emma",
        "en": "<b>You guys are boring</b>! I'm going hiking up in the mountains.",
        "cn": "你们都太无聊了！我要去爬山。"
      },
      {
        "speaker": "Mark",
        "en": "Hiking? That sounds <b>pretty exhausting</b> to me. How long of a hike?",
        "cn": "爬山？对我来说听起来很累。要爬多长时间？"
      },
      {
        "speaker": "Emma",
        "en": "Just like two hours. It's <b>low-key</b> trail, so no biggie.",
        "cn": "大约两小时。这是个很简单的小径，没什么大不了的。"
      },
      {
        "speaker": "Sophie",
        "en": "That actually sounds kind of fun! <b>Want some company</b>?",
        "cn": "那听起来有点有趣！想要人陪吗？"
      },
      {
        "speaker": "Emma",
        "en": "Yeah, that would be awesome! The more the merrier.",
        "cn": "是的，那太棒了！人越多越好。"
      },
      {
        "speaker": "Mark",
        "en": "I appreciate the offer, but I'm <b>gonna pass</b>. My feet are <b>killing me</b> from work.",
        "cn": "我感谢邀请，但我会拒绝。我的脚因为工作都累坏了。"
      },
      {
        "speaker": "Sophie",
        "en": "Fair enough! What are you doing instead? Something relaxing, I hope?",
        "cn": "也好！那你要做什么？希望是放松的事情。"
      },
      {
        "speaker": "Mark",
        "en": "I'm <b>catching up on sleep</b>. I'm absolutely <b>exhausted</b>.",
        "cn": "我要补觉。我真的筋疲力尽了。"
      },
      {
        "speaker": "Emma",
        "en": "You need to <b>take it easy</b> more. All work and no play, you know?",
        "cn": "你需要更多地放松。一味工作，没有娱乐，你知道吗？"
      },
      {
        "speaker": "Mark",
        "en": "You're right. Maybe I should <b>look into</b> some fun activities soon.",
        "cn": "你说得对。也许我应该很快寻找一些有趣的活动。"
      },
      {
        "speaker": "Sophie",
        "en": "You could always <b>hang out with us</b>! We're going to check out the new farmers market downtown.",
        "cn": "你总可以和我们一起！我们要去市中心的新农贸市场看看。"
      },
      {
        "speaker": "Emma",
        "en": "Oh yes! The farmers market is <b>absolutely amazing</b>. Fresh produce everywhere!",
        "cn": "哦是的！农贸市场太棒了。到处都是新鲜农产品！"
      },
      {
        "speaker": "Mark",
        "en": "Farmers market? <b>That actually sounds pretty cool</b>. Maybe I'll <b>pop by</b> Saturday afternoon.",
        "cn": "农贸市场？那听起来很酷。也许我周六下午会去转转。"
      },
      {
        "speaker": "Sophie",
        "en": "<b>For sure</b>! We're going around 10 AM. <b>Come if you can</b>!",
        "cn": "当然！我们上午10点去。如果你能去就来吧！"
      },
      {
        "speaker": "Emma",
        "en": "Perfect! And then after hiking, Sophie and I could <b>grab dinner</b> with you guys.",
        "cn": "完美！爬山之后，Sophie和我可以和你们一起吃晚餐。"
      },
      {
        "speaker": "Mark",
        "en": "That sounds like a solid plan. <b>I'm in</b>! What time and where?",
        "cn": "那听起来是个很好的计划。我同意！什么时间，在哪里？"
      },
      {
        "speaker": "Sophie",
        "en": "We can <b>figure it out later</b> in our group chat. But for now, <b>let's focus on this meeting</b>!",
        "cn": "我们稍后可以在群聊里商量。但现在，让我们专注于这个会议！"
      }
    ]
  },
  {
    "id": "d2",
    "cat": "tough",
    "catName": "高难度",
    "catEmoji": "⚡",
    "title": "Dealing with a Toxic Coworker",
    "titleCn": "应对有毒同事",
    "emoji": "👩‍💼",
    "lines": [
      {
        "speaker": "Rachel",
        "en": "I need to vent about something. Do you have a minute?",
        "cn": "我需要发泄一下。你有一分钟吗？"
      },
      {
        "speaker": "James",
        "en": "Of course. What's going on? Is everything <b>okay</b>?",
        "cn": "当然。怎么了？一切都好吗？"
      },
      {
        "speaker": "Rachel",
        "en": "It's Tom from marketing. He's been <b>absolutely insufferable</b> lately.",
        "cn": "是来自市场部的汤姆。他最近太令人难以忍受了。"
      },
      {
        "speaker": "James",
        "en": "<b>Tell me more</b>. What has he been doing?",
        "cn": "告诉我更多。他一直在做什么？"
      },
      {
        "speaker": "Rachel",
        "en": "He <b>constantly undermines</b> my ideas in meetings and takes <b>all the credit</b> for team work.",
        "cn": "他在会议上不断贬低我的想法，并为团队工作独占功劳。"
      },
      {
        "speaker": "Elena",
        "en": "That's <b>completely unacceptable</b>. Have you talked to him directly?",
        "cn": "那完全不可接受。你和他直接谈过吗？"
      },
      {
        "speaker": "Rachel",
        "en": "I tried, but he just <b>got defensive</b> and said I was <b>being oversensitive</b>.",
        "cn": "我试过了，但他只是变得自卫，说我太敏感了。"
      },
      {
        "speaker": "James",
        "en": "That's a classic <b>toxic behavior</b>. You need to <b>set clear boundaries</b> with him.",
        "cn": "这是典型的有毒行为。你需要和他设置清晰的界限。"
      },
      {
        "speaker": "Elena",
        "en": "Exactly. And I'd recommend <b>documenting everything</b> in case things escalate.",
        "cn": "完全同意。我建议记录所有事情，以防事情升级。"
      },
      {
        "speaker": "Rachel",
        "en": "<b>Good idea</b>. Should I go to HR? I don't want to <b>make things worse</b>.",
        "cn": "好主意。我应该去人力资源部吗？我不想让事情变得更糟。"
      },
      {
        "speaker": "James",
        "en": "Before you <b>escalate it</b>, try having one final conversation where you <b>spell out</b> the problem.",
        "cn": "在你上报之前，尝试进行最后一次谈话，明确指出问题。"
      },
      {
        "speaker": "Elena",
        "en": "Yes. Be <b>firm but professional</b>. Use specific examples of his behavior.",
        "cn": "是的。要坚定但专业。使用他行为的具体例子。"
      },
      {
        "speaker": "Rachel",
        "en": "What if he <b>doesn't take it seriously</b>? He never seems to care about feedback.",
        "cn": "如果他不认真对待呢？他似乎从不在乎反馈。"
      },
      {
        "speaker": "James",
        "en": "Then you have <b>solid documentation</b> to show HR that you've tried to resolve it yourself.",
        "cn": "那样你就有了确凿的文件记录，可以向人力资源部证明你已经尝试自己解决了。"
      },
      {
        "speaker": "Elena",
        "en": "And remember, his behavior is <b>not your fault</b>. You're doing the right thing by addressing it.",
        "cn": "记住，他的行为不是你的错。你通过解决它做了正确的事情。"
      },
      {
        "speaker": "Rachel",
        "en": "You're right. I've been <b>letting it get to me</b> too much. It's affecting my work.",
        "cn": "你说得对。我一直太在意这件事了。它影响了我的工作。"
      },
      {
        "speaker": "James",
        "en": "<b>Don't let him drag you down</b>. Stay professional and focus on your own performance.",
        "cn": "不要让他拖累你。保持专业，专注于你自己的表现。"
      },
      {
        "speaker": "Elena",
        "en": "Exactly. And if the behavior continues after your conversation, HR will <b>take action</b> for sure.",
        "cn": "完全同意。如果行为在你谈话后继续，人力资源部肯定会采取行动。"
      },
      {
        "speaker": "Rachel",
        "en": "Thanks, guys. I feel much better having talked this through. I'll approach him tomorrow.",
        "cn": "谢谢，伙计们。通过谈论这件事，我感觉好多了。我明天会去找他。"
      },
      {
        "speaker": "James",
        "en": "Good luck. And <b>keep us posted</b>. We're here for you if you need support.",
        "cn": "祝你好运。有进展时告诉我们。如果你需要支持，我们在这里。"
      }
    ]
  },
  {
    "id": "d3",
    "cat": "tough",
    "catName": "高难度",
    "catEmoji": "⚡",
    "title": "Pushing Back on Unrealistic Deadlines",
    "titleCn": "反对不合理的截止日期",
    "emoji": "👨‍💼",
    "lines": [
      {
        "speaker": "Derek",
        "en": "Patricia, thanks for taking the time to meet with me.",
        "cn": "Patricia，感谢你抽时间和我见面。"
      },
      {
        "speaker": "Patricia",
        "en": "Of course! What's on your mind?",
        "cn": "当然！你想说什么？"
      },
      {
        "speaker": "Derek",
        "en": "I wanted to <b>voice some concerns</b> about the new project timeline.",
        "cn": "我想对新项目的时间表表达一些关切。"
      },
      {
        "speaker": "Patricia",
        "en": "Okay, I'm listening. What's the issue?",
        "cn": "好的，我在听。问题是什么？"
      },
      {
        "speaker": "Derek",
        "en": "The deadline you gave us is <b>two weeks</b>, but based on the scope, I think we need <b>at least four weeks</b>.",
        "cn": "你给我们的截止日期是两周，但根据范围，我认为我们需要至少四周。"
      },
      {
        "speaker": "Patricia",
        "en": "Two weeks is what the client requested. Can't your team <b>make it work</b>?",
        "cn": "两周是客户要求的。你的团队不能做到吗？"
      },
      {
        "speaker": "Derek",
        "en": "I appreciate the confidence, but I have to be honest—<b>this timeline is not realistic</b>.",
        "cn": "我感谢你的信心，但我必须诚实地说，这个时间表不现实。"
      },
      {
        "speaker": "Patricia",
        "en": "What specifically makes it unrealistic? <b>Walk me through it</b>.",
        "cn": "具体什么使它不现实？详细解释一下。"
      },
      {
        "speaker": "Derek",
        "en": "We have three main phases: design, development, and testing. <b>Each phase alone</b> takes 2 weeks minimum.",
        "cn": "我们有三个主要阶段：设计、开发和测试。每个阶段单独就需要最少2周。"
      },
      {
        "speaker": "Patricia",
        "en": "But couldn't you run some phases <b>in parallel</b>?",
        "cn": "但你不能同时运行一些阶段吗？"
      },
      {
        "speaker": "Derek",
        "en": "Not really. Development depends on design being complete. And testing needs to happen after development. <b>There's no way around it</b>.",
        "cn": "不能。开发取决于设计完成。测试需要在开发之后进行。没有办法解决。"
      },
      {
        "speaker": "Patricia",
        "en": "I see your point. But I also have <b>pressure from above</b> to keep costs down.",
        "cn": "我明白你的观点。但我也面临来自上面的压力，要降低成本。"
      },
      {
        "speaker": "Derek",
        "en": "I understand, but cutting time usually means <b>cutting corners</b>, which leads to poor quality.",
        "cn": "我理解，但减少时间通常意味着偷工减料，这会导致质量不好。"
      },
      {
        "speaker": "Patricia",
        "en": "Fair point. So what are you proposing?",
        "cn": "好的观点。那你建议什么？"
      },
      {
        "speaker": "Derek",
        "en": "<b>Here's what I suggest</b>: give us a realistic deadline of three and a half weeks.",
        "cn": "这是我的建议：给我们一个现实的截止日期三周半。"
      },
      {
        "speaker": "Patricia",
        "en": "Three and a half? That's still <b>significantly longer</b> than two weeks.",
        "cn": "三周半？那仍然比两周长很多。"
      },
      {
        "speaker": "Derek",
        "en": "Yes, but it's a <b>reasonable compromise</b> between quality and timeline.",
        "cn": "是的，但这是质量和时间表之间的合理折中。"
      },
      {
        "speaker": "Patricia",
        "en": "Let me see if I can <b>negotiate with</b> the client. In the meantime, <b>prepare a detailed plan</b> showing your timeline.",
        "cn": "让我看看我能否与客户协商。同时，准备一份详细的计划，显示你的时间表。"
      },
      {
        "speaker": "Derek",
        "en": "I will. And I really appreciate you <b>being open to this conversation</b>.",
        "cn": "我会的。我真的很感谢你愿意进行这次对话。"
      },
      {
        "speaker": "Patricia",
        "en": "Of course. <b>Good communication</b> is how we avoid problems down the road.",
        "cn": "当然。好的沟通是我们避免未来问题的方式。"
      }
    ]
  },
  {
    "id": "d4",
    "cat": "tough",
    "catName": "高难度",
    "catEmoji": "⚡",
    "title": "Salary Negotiation",
    "titleCn": "薪资谈判",
    "emoji": "👩‍💼",
    "lines": [
      {
        "speaker": "Maya",
        "en": "Thank you for the positive review, Susan. I'm really proud of what I've accomplished this year.",
        "cn": "感谢你的正面评价，Susan。我对今年的成就感到非常自豪。"
      },
      {
        "speaker": "Susan",
        "en": "Your performance has been excellent. We're very happy with your contributions.",
        "cn": "你的表现一直很优秀。我们对你的贡献非常满意。"
      },
      {
        "speaker": "Maya",
        "en": "I'm glad to hear that. <b>Given my performance and responsibilities</b>, I'd like to discuss my compensation.",
        "cn": "很高兴听到这个。考虑到我的表现和责任，我想讨论我的薪酬。"
      },
      {
        "speaker": "Susan",
        "en": "Of course. What do you have in mind?",
        "cn": "当然。你想要什么？"
      },
      {
        "speaker": "Maya",
        "en": "I've done some research on <b>market rates</b> for my position and experience level.",
        "cn": "我已经对我的职位和经验水平的市场率进行了一些研究。"
      },
      {
        "speaker": "Susan",
        "en": "Good. I'm always interested in data. What did you find?",
        "cn": "很好。我总是对数据感兴趣。你发现了什么？"
      },
      {
        "speaker": "Maya",
        "en": "Based on industry standards, someone with my <b>skill set and experience</b> typically earns <b>between $85,000 and $95,000</b>.",
        "cn": "根据行业标准，具有我技能和经验的人通常赚取85,000到95,000美元之间。"
      },
      {
        "speaker": "Susan",
        "en": "That's a significant jump from your current salary. <b>What's driving that increase</b>?",
        "cn": "这比你目前的薪资有很大跳跃。是什么促使这个增长？"
      },
      {
        "speaker": "Maya",
        "en": "I've <b>taken on additional responsibilities</b>: mentoring junior staff, leading the new client project, and improving our processes.",
        "cn": "我承担了额外的责任：指导初级员工、领导新客户项目和改进我们的流程。"
      },
      {
        "speaker": "Susan",
        "en": "Those are good points. But our budget is <b>somewhat limited</b> this year.",
        "cn": "这些是好的观点。但我们的预算今年有些有限。"
      },
      {
        "speaker": "Maya",
        "en": "I understand budget constraints. <b>What salary range can you work with</b>?",
        "cn": "我理解预算限制。你能接受什么薪资范围？"
      },
      {
        "speaker": "Susan",
        "en": "I could potentially offer <b>a 5% raise</b>, bringing you to around $76,000.",
        "cn": "我可以提供5%的加薪，让你达到大约76,000美元。"
      },
      {
        "speaker": "Maya",
        "en": "I appreciate the offer, but that falls short of <b>the competitive rate</b> for my role.",
        "cn": "我感谢这个提议，但这没有达到我的职位的竞争率。"
      },
      {
        "speaker": "Susan",
        "en": "What if we revisit this in <b>six months</b>? We could discuss a larger increase then.",
        "cn": "如果我们在六个月后重新讨论呢？我们可以讨论更大的增长。"
      },
      {
        "speaker": "Maya",
        "en": "Six months is a long time. <b>Is there any flexibility</b> in your budget?",
        "cn": "六个月很长。你的预算有什么灵活性吗？"
      },
      {
        "speaker": "Susan",
        "en": "Let me be honest—<b>I'm limited</b> by corporate budget guidelines. But I can <b>explore other options</b>.",
        "cn": "让我老实说，我受到公司预算指南的限制。但我可以探索其他选择。"
      },
      {
        "speaker": "Maya",
        "en": "What other options do you mean? <b>Performance bonuses</b>? <b>Extra vacation days</b>?",
        "cn": "你的意思是什么其他选择？绩效奖金？额外的假期？"
      },
      {
        "speaker": "Susan",
        "en": "Those are possibilities. And I could also push for <b>a bigger increase</b> in the next review cycle.",
        "cn": "这些都是可能性。我也可以推动下个审查周期的更大增长。"
      },
      {
        "speaker": "Maya",
        "en": "Okay. <b>Let's do this</b>: 8% raise now, and we reassess in four months based on goals.",
        "cn": "好的。我们这样做：现在提高8%，四个月后根据目标重新评估。"
      },
      {
        "speaker": "Susan",
        "en": "I think I can make that work. But <b>we need to put this in writing</b> with clear milestones.",
        "cn": "我认为我可以做到。但我们需要把这个写成文件，包括清晰的里程碑。"
      }
    ]
  },
  {
    "id": "d5",
    "cat": "tough",
    "catName": "高难度",
    "catEmoji": "⚡",
    "title": "Handling Layoff Announcement",
    "titleCn": "应对裁员通知",
    "emoji": "👨‍💼",
    "lines": [
      {
        "speaker": "Robert",
        "en": "Michael, thank you for coming in on short notice. I've asked you here because we need to <b>discuss something important</b>.",
        "cn": "Michael，感谢你短时间内过来。我叫你来这里是因为我们需要讨论一些重要的事情。"
      },
      {
        "speaker": "Michael",
        "en": "Of course. <b>Is everything okay</b>? You seem serious.",
        "cn": "当然。一切都好吗？你看起来很严肃。"
      },
      {
        "speaker": "Robert",
        "en": "I'll be direct with you. <b>Your position is being eliminated</b> due to our company restructuring.",
        "cn": "我会直接告诉你。由于我们公司的重组，你的职位被裁撤了。"
      },
      {
        "speaker": "Michael",
        "en": "What? <b>I don't understand</b>. I just got a good performance review last month.",
        "cn": "什么？我不明白。我上个月才得到一个很好的性能评审。"
      },
      {
        "speaker": "Robert",
        "en": "Your performance has been excellent. <b>This isn't about your work</b>. It's a company-wide decision.",
        "cn": "你的表现一直很出色。这不是关于你的工作。这是一个公司范围的决定。"
      },
      {
        "speaker": "Michael",
        "en": "How is this possible? When does this happen?",
        "cn": "这怎么可能？什么时候发生？"
      },
      {
        "speaker": "Robert",
        "en": "<b>Your last day of work</b> will be two weeks from today. We're providing <b>severance pay</b> and <b>outplacement services</b>.",
        "cn": "你的最后一天工作是从今天起两周。我们提供遣散费和再就业服务。"
      },
      {
        "speaker": "Michael",
        "en": "Severance? How much are we talking about?",
        "cn": "遣散费？我们在谈论多少？"
      },
      {
        "speaker": "Robert",
        "en": "<b>You'll receive</b> two months of salary, <b>plus benefits</b> through the end of the month.",
        "cn": "你将获得两个月的薪水，加上本月底的福利。"
      },
      {
        "speaker": "Michael",
        "en": "That's not much for five years of work here. <b>Is there any chance</b> of staying?",
        "cn": "那对于我在这里五年的工作来说不是很多。有留下的机会吗？"
      },
      {
        "speaker": "Robert",
        "en": "Unfortunately, the decision is final. <b>However</b>, we have several <b>internal job openings</b> you might qualify for.",
        "cn": "不幸的是，这个决定是最终的。但是，我们有几个你可能符合条件的内部职位空缺。"
      },
      {
        "speaker": "Michael",
        "en": "<b>What positions</b> are you talking about?",
        "cn": "你在说什么职位？"
      },
      {
        "speaker": "Robert",
        "en": "HR will meet with you tomorrow to review the options. <b>We want to help you transition</b>.",
        "cn": "人力资源部明天会和你见面审查这些选择。我们想帮助你过渡。"
      },
      {
        "speaker": "Michael",
        "en": "I appreciate that. <b>Can I tell my team</b>? They'll be wondering where I went.",
        "cn": "我很感谢。我可以告诉我的团队吗？他们会想知道我去了哪里。"
      },
      {
        "speaker": "Robert",
        "en": "We'll <b>make an announcement</b> tomorrow morning. <b>Until then</b>, please keep it confidential.",
        "cn": "我们明天早上会做一个通知。在那之前，请保持机密。"
      },
      {
        "speaker": "Michael",
        "en": "This is a lot to take in. <b>Do I have support resources</b>?",
        "cn": "这需要消化很多。我有支持资源吗？"
      },
      {
        "speaker": "Robert",
        "en": "Yes. We're providing <b>career counseling</b> and access to <b>a job placement agency</b>.",
        "cn": "是的。我们提供职业咨询和职业安置机构的接入。"
      },
      {
        "speaker": "Michael",
        "en": "Okay. <b>I just need time to process this</b>. This is overwhelming.",
        "cn": "好的。我只需要时间来处理这个。这太压倒性了。"
      },
      {
        "speaker": "Robert",
        "en": "That's completely understandable. <b>Take care of yourself</b>. HR and I are here to support you.",
        "cn": "那完全可以理解。照顾好自己。我和人力资源部在这里支持你。"
      },
      {
        "speaker": "Michael",
        "en": "Thank you for being direct about this at least. I'll meet with HR tomorrow.",
        "cn": "至少感谢你对此直接了当。我明天会和人力资源部见面。"
      }
    ]
  },
  {
    "id": "i2",
    "cat": "interview",
    "catName": "面试",
    "catEmoji": "🎯",
    "title": "Phone Screen with Recruiter",
    "titleCn": "电话初筛",
    "emoji": "📞",
    "lines": [
      {
        "speaker": "Recruiter",
        "en": "Hi Sarah! Thanks for picking up. I'm calling to schedule a quick <b>phone screen</b> with our team. Do you have about 20 minutes right now?",
        "cn": "你好Sarah！感谢你接电话。我打来是想为我们的团队安排一个简短的电话初筛。你现在有大约20分钟吗？"
      },
      {
        "speaker": "Candidate",
        "en": "Absolutely! I'm very <b>interested in the position</b> and happy to chat.",
        "cn": "当然可以！我非常有兴趣了解这个职位，很高兴能聊一下。"
      },
      {
        "speaker": "Recruiter",
        "en": "Great! So I've looked at your resume, and I see you have 5 years of <b>experience in full-stack development</b>. Can you walk me through your most recent role?",
        "cn": "太好了！我看过你的简历，发现你有5年全栈开发经验。你能告诉我你最近的工作角色吗？"
      },
      {
        "speaker": "Candidate",
        "en": "Of course. In my <b>current position</b>, I lead a team of three engineers, and we're responsible for managing a microservices architecture with about 50 APIs.",
        "cn": "当然可以。在我现在的职位中，我领导一个由三名工程师组成的团队，我们负责管理约50个API的微服务架构。"
      },
      {
        "speaker": "Recruiter",
        "en": "That sounds solid. We're looking for someone who can <b>hit the ground running</b>. What's your availability if we move forward?",
        "cn": "听起来不错。我们在寻找能尽快上手的人。如果我们继续推进，你什么时候可以开始？"
      },
      {
        "speaker": "Candidate",
        "en": "I'm open to <b>starting in about two weeks</b>. I would need to give proper notice at my current company.",
        "cn": "我可以在大约两周后开始。我需要在现公司提供适当的离职通知。"
      },
      {
        "speaker": "Recruiter",
        "en": "Perfect. One more thing—do you have any <b>experience with cloud technologies</b>, specifically AWS or GCP?",
        "cn": "完美。最后一个问题——你有云技术经验吗？特别是AWS或GCP？"
      },
      {
        "speaker": "Candidate",
        "en": "Yes, I've worked extensively with AWS, particularly with Lambda, S3, and RDS. I even <b>led a migration project</b> that saved the company 40% on infrastructure costs.",
        "cn": "是的，我广泛使用过AWS，特别是Lambda、S3和RDS。我还领导过一个迁移项目，为公司节省了40%的基础设施成本。"
      },
      {
        "speaker": "Recruiter",
        "en": "Excellent! That's exactly what we need. Let me get you <b>connected with the hiring manager</b> for the next round. She's available next week.",
        "cn": "太好了！这正是我们需要的。让我为你联系一下招聘经理进行下一轮面试。她下周有时间。"
      },
      {
        "speaker": "Candidate",
        "en": "Sounds great! I'm excited to <b>move forward</b> with the interview process.",
        "cn": "太好了！我很期待继续推进面试流程。"
      },
      {
        "speaker": "Recruiter",
        "en": "Wonderful. Before we wrap up, do you have any <b>questions for me</b> about the role or the company?",
        "cn": "太棒了。在结束之前，你对这个职位或公司有什么问题吗？"
      },
      {
        "speaker": "Candidate",
        "en": "Yes, actually. Can you tell me a bit about the <b>team structure</b> and who I'd be reporting to?",
        "cn": "是的，实际上。你能告诉我一下团队结构以及我将向谁汇报吗？"
      },
      {
        "speaker": "Recruiter",
        "en": "Sure thing. You'd be reporting to our Engineering Manager, Tom. The team is <b>geographically distributed</b> across San Francisco, Seattle, and Austin.",
        "cn": "当然可以。你将向我们的工程经理Tom汇报。这个团队在旧金山、西雅图和奥斯汀之间分散分布。"
      },
      {
        "speaker": "Candidate",
        "en": "That works for me. I've worked in <b>remote collaboration</b> environments before and really enjoy it.",
        "cn": "这对我来说没问题。我之前在远程协作环境中工作过，真的很喜欢。"
      },
      {
        "speaker": "Recruiter",
        "en": "Perfect! I'll send you a calendar invite for next Wednesday at 2 PM. The meeting will be with the hiring manager. <b>You'll receive further details</b> via email.",
        "cn": "完美！我会给你发一个下周三下午2点的日历邀请。会议将与招聘经理进行。你会通过电子邮件收到更多详情。"
      },
      {
        "speaker": "Candidate",
        "en": "Thank you so much! I really appreciate <b>this opportunity</b>.",
        "cn": "非常感谢！我真的很感激这个机会。"
      },
      {
        "speaker": "Recruiter",
        "en": "You're welcome. We think you're a <b>strong candidate</b> and we're excited to learn more. Have a great day!",
        "cn": "不客气。我们认为你是一个很强的候选人，我们期待更多地了解你。祝你有美好的一天！"
      },
      {
        "speaker": "Candidate",
        "en": "You too! Thanks again for calling.",
        "cn": "你也是！再次感谢你的来电。"
      },
      {
        "speaker": "Manager",
        "en": "[After recruiter hangs up] That was a great call. You really stood out. Let's move you to the next interview round.",
        "cn": "[招聘人员挂断后]那是一个很棒的电话。你真的给人留下了深刻印象。让我们把你推进到下一轮面试。"
      },
      {
        "speaker": "Candidate",
        "en": "Thank you! I'm <b>looking forward to</b> the next stage.",
        "cn": "谢谢！我期待下一个阶段。"
      }
    ]
  },
  {
    "id": "i3",
    "cat": "interview",
    "catName": "面试",
    "catEmoji": "🎯",
    "title": "Behavioral Interview - STAR Method",
    "titleCn": "行为面试 - STAR方法",
    "emoji": "👔",
    "lines": [
      {
        "speaker": "HiringManager",
        "en": "Thanks for coming in. I'd like to ask you some questions about your <b>past experiences</b>. Tell me about a time when you had to deal with a <b>difficult team member</b>.",
        "cn": "感谢你的到来。我想问你一些关于你过去经历的问题。告诉我你曾经不得不与一个困难的团队成员打交道的情况。"
      },
      {
        "speaker": "Candidate",
        "en": "Great question. Let me use the <b>STAR method</b> to answer this. The <b>Situation</b> was that I was working on a critical project with a developer who wasn't communicating with the rest of the team.",
        "cn": "很好的问题。让我用STAR方法来回答这个问题。情况是我在与一个不与团队其他成员沟通的开发人员进行一个关键项目。"
      },
      {
        "speaker": "Candidate",
        "en": "The <b>Task</b> was to deliver a microservices architecture update within two weeks. My responsibility was to ensure smooth collaboration and keep everyone aligned.",
        "cn": "任务是在两周内交付微服务架构更新。我的责任是确保顺畅的协作并保持每个人的一致。"
      },
      {
        "speaker": "Candidate",
        "en": "For the <b>Action</b>, I scheduled a one-on-one meeting with this developer to understand his concerns. He was frustrated because he felt his ideas weren't being heard in the team meetings.",
        "cn": "对于行动，我与这位开发人员进行了一对一的会议，以了解他的关切。他感到沮丧，因为他觉得他的想法在团队会议中没有被听取。"
      },
      {
        "speaker": "Candidate",
        "en": "I made sure to <b>actively listen</b> and then proposed a rotating meeting schedule where everyone could share their ideas.",
        "cn": "我确保积极倾听，然后提议了一个轮流的会议时间表，这样每个人都可以分享他们的想法。"
      },
      {
        "speaker": "Candidate",
        "en": "The <b>Result</b> was that the team delivered the project on time with zero defects. The developer became one of our best contributors, and we eventually adopted this meeting format company-wide.",
        "cn": "结果是团队按时交付了项目，零缺陷。这位开发人员成为了我们最优秀的贡献者之一，我们最终在整个公司范围内采用了这种会议格式。"
      },
      {
        "speaker": "HiringManager",
        "en": "That's a really solid answer. I appreciate how you <b>took ownership</b> of the problem. Let me ask another one: tell me about a time when you <b>failed at something</b>.",
        "cn": "这是一个非常坚实的答案。我赞赏你如何主动承担问题的责任。让我再问一个：告诉我你在某件事上失败的时候。"
      },
      {
        "speaker": "Candidate",
        "en": "Sure. Early in my career, I <b>misjudged a deadline</b> for a feature rollout. I promised the stakeholders we could deliver in two weeks when it actually needed four weeks of work.",
        "cn": "当然可以。在我职业生涯的早期，我对一个功能发布的截止日期的判断失误。我承诺利益相关者我们可以在两周内交付，但实际上需要四周的工作。"
      },
      {
        "speaker": "Candidate",
        "en": "Instead of hiding it, I <b>escalated the issue</b> immediately and had a <b>transparent conversation</b> with my manager about the realistic timeline.",
        "cn": "我没有隐瞒它，而是立即上报了这个问题，并与我的经理进行了关于现实时间表的透明对话。"
      },
      {
        "speaker": "Candidate",
        "en": "We then <b>communicated the revised timeline</b> to stakeholders. The team delivered the feature on the new schedule with full quality assurance.",
        "cn": "然后我们将修改后的时间表传达给了利益相关者。团队按新时间表交付了该功能，并进行了全面的质量保证。"
      },
      {
        "speaker": "HiringManager",
        "en": "I really like that you owned the mistake and didn't try to cover it up. That shows <b>integrity and maturity</b>. Let me ask one more: tell me about your <b>proudest achievement</b> in your last role.",
        "cn": "我真的很喜欢你承担了错误并没有试图隐瞒。这显示了诚信和成熟。让我再问一个：告诉我你在上一个职位中最引以为豪的成就。"
      },
      {
        "speaker": "Candidate",
        "en": "I'm really proud of <b>leading a technical initiative</b> that reduced our database query time by 60%. The situation was that our application was experiencing <b>performance bottlenecks</b> that frustrated our users.",
        "cn": "我真的很为领导一项技术计划感到骄傲，该计划将我们的数据库查询时间减少了60%。情况是我们的应用程序经历了让用户感到沮丧的性能瓶颈。"
      },
      {
        "speaker": "Candidate",
        "en": "I <b>conducted a thorough analysis</b>, identified the root cause in our indexing strategy, and proposed a comprehensive solution involving query optimization and caching.",
        "cn": "我进行了彻底的分析，确定了我们索引策略中的根本原因，并提出了一个包括查询优化和缓存的综合解决方案。"
      },
      {
        "speaker": "Candidate",
        "en": "I worked with two senior engineers to implement this. The <b>end result</b> was a 60% improvement in query performance, which translated to faster page loads and better user experience.",
        "cn": "我与两名高级工程师一起实施了这个方案。最终结果是查询性能提高了60%，这转化为更快的页面加载和更好的用户体验。"
      },
      {
        "speaker": "Candidate",
        "en": "This initiative earned our team recognition in the company newsletter, and I was promoted to a senior engineering role.",
        "cn": "这个计划使我们的团队在公司通讯中获得认可，我被晋升为高级工程师。"
      },
      {
        "speaker": "HiringManager",
        "en": "Wow, that's <b>impressive work</b>. It's clear you have strong <b>problem-solving skills</b> and can <b>drive results</b>. I think you'd be a <b>great fit</b> for our team.",
        "cn": "哇，那是令人印象深刻的工作。很清楚你有强大的问题解决技能，可以推动结果。我认为你会是我们团队的完美选择。"
      },
      {
        "speaker": "Candidate",
        "en": "Thank you so much! I'm <b>really excited about</b> the opportunity to <b>contribute my skills</b> to your team.",
        "cn": "非常感谢！我真的很期待有机会为你们的团队做出贡献。"
      },
      {
        "speaker": "HiringManager",
        "en": "Do you have any <b>questions for the panel</b> before we wrap up?",
        "cn": "在我们结束之前，你对小组有什么问题吗？"
      },
      {
        "speaker": "Candidate",
        "en": "Yes, I'd love to know more about the <b>growth opportunities</b> and what <b>success looks like</b> in this role during the first year.",
        "cn": "是的，我很想了解更多关于增长机会以及在第一年这个职位上成功是什么样的。"
      },
      {
        "speaker": "Interviewer",
        "en": "Great questions. We believe in continuous learning and development. We'll discuss all the details in our next conversation. <b>We'll be in touch</b> soon.",
        "cn": "很好的问题。我们相信持续学习和发展。我们将在下次谈话中讨论所有细节。我们很快会与你联系。"
      },
      {
        "speaker": "Candidate",
        "en": "Perfect! Thank you both for such a <b>thoughtful conversation</b>. I'm <b>looking forward to</b> the next steps!",
        "cn": "完美！感谢你们两位进行了如此深思熟虑的对话。我期待下一步！"
      }
    ]
  },
  {
    "id": "i4",
    "cat": "interview",
    "catName": "面试",
    "catEmoji": "🎯",
    "title": "Technical Interview Discussion",
    "titleCn": "技术面试讨论",
    "emoji": "👨‍💻",
    "lines": [
      {
        "speaker": "SeniorEngineer",
        "en": "Alright, let's talk about a <b>system design problem</b>. How would you design a <b>caching layer</b> for a high-traffic e-commerce platform?",
        "cn": "好的，让我们讨论一个系统设计问题。你将如何为高流量的电商平台设计缓存层？"
      },
      {
        "speaker": "Candidate",
        "en": "Great question. Before I dive into the design, let me ask some <b>clarifying questions</b> to understand the requirements better. What's the expected daily active users?",
        "cn": "很好的问题。在我深入设计之前，让我问一些澄清性问题，更好地了解需求。预期日活跃用户数是多少？"
      },
      {
        "speaker": "SeniorEngineer",
        "en": "Good approach. We're looking at around 10 million DAU. Also consider <b>scalability and latency</b> as key concerns.",
        "cn": "很好的方法。我们看的是大约1000万日活跃用户。还要考虑可扩展性和延迟作为关键问题。"
      },
      {
        "speaker": "Candidate",
        "en": "Got it. I would <b>propose a multi-layer caching strategy</b>. First, we'd use Redis for <b>in-memory caching</b> of frequently accessed data like product catalogs and user sessions.",
        "cn": "明白了。我会提出一个多层缓存策略。首先，我们将使用Redis进行经常访问的数据（如产品目录和用户会话）的内存缓存。"
      },
      {
        "speaker": "Candidate",
        "en": "Second, we'd implement <b>database-level caching</b> using query result caching. And third, we'd use a <b>CDN for static assets</b> to reduce latency for global users.",
        "cn": "其次，我们将使用查询结果缓存实现数据库级缓存。第三，我们将使用CDN来缓存静态资产，以减少全球用户的延迟。"
      },
      {
        "speaker": "TechLead",
        "en": "That's solid. But tell me about the <b>cache invalidation strategy</b>. Cache invalidation is notoriously one of the hardest problems in computer science.",
        "cn": "这很好。但告诉我缓存失效策略。缓存失效是计算机科学中最难的问题之一。"
      },
      {
        "speaker": "Candidate",
        "en": "Absolutely. I'd use a <b>time-based expiration</b> with a TTL of 15 minutes for product data, since prices don't change that frequently. For user-specific data, I'd use an <b>event-driven invalidation</b> approach.",
        "cn": "当然。我对产品数据使用15分钟TTL的基于时间的过期，因为价格不经常改变。对于用户特定的数据，我会使用事件驱动的失效方法。"
      },
      {
        "speaker": "Candidate",
        "en": "When a user updates their profile or adds something to their cart, we send an event that <b>invalidates relevant cache keys</b> immediately. This way, we get both freshness and performance.",
        "cn": "当用户更新他们的个人资料或将某个商品添加到购物车时，我们发送一个事件，立即使相关缓存键失效。这样，我们既获得了新鲜感又获得了性能。"
      },
      {
        "speaker": "SeniorEngineer",
        "en": "I like that you're thinking about <b>trade-offs between consistency and performance</b>. Let's dive deeper. What about <b>handling cache failures</b>? What if Redis goes down?",
        "cn": "我喜欢你在思考一致性和性能之间的权衡。让我们深入讨论。处理缓存失败怎么样？如果Redis宕机了怎么办？"
      },
      {
        "speaker": "Candidate",
        "en": "Excellent point. I would implement a <b>circuit breaker pattern</b> to detect when Redis is unavailable. If it fails, we <b>fall back to the database</b>, but with <b>rate limiting</b> to prevent overwhelming the database.",
        "cn": "很好的一点。我会实现一个断路器模式来检测Redis何时不可用。如果失败，我们会回退到数据库，但使用速率限制来防止数据库过载。"
      },
      {
        "speaker": "Candidate",
        "en": "Additionally, I'd set up <b>monitoring and alerting</b> to notify the team immediately if cache hit ratio drops below a certain threshold, which could indicate a problem.",
        "cn": "此外，我会设置监控和警报，以在缓存命中率降到某个阈值以下时立即通知团队，这可能表示出现了问题。"
      },
      {
        "speaker": "TechLead",
        "en": "Good thinking. Now let's talk about code. I'm going to give you a simple <b>coding challenge</b>. Can you <b>write a function</b> that detects if a binary tree is balanced?",
        "cn": "很好的想法。现在让我们谈论代码。我给你一个简单的编码挑战。你能写一个函数来检测二叉树是否平衡吗？"
      },
      {
        "speaker": "Candidate",
        "en": "Sure. Let me think about this out loud. A balanced tree is one where the <b>difference in height</b> between left and right subtrees is at most 1 for every node.",
        "cn": "当然可以。让我大声思考这个问题。平衡树是指对于每个节点，左右子树的高度差最多为1的树。"
      },
      {
        "speaker": "Candidate",
        "en": "I'd use a <b>recursive approach</b> where I calculate the height of both subtrees and check the balance condition at each node. Let me code this up.",
        "cn": "我会使用递归方法计算两个子树的高度，并检查每个节点的平衡条件。让我编写这个代码。"
      },
      {
        "speaker": "Candidate",
        "en": "The <b>time complexity</b> would be O(n) since we visit each node once, and the <b>space complexity</b> would be O(h) where h is the height, due to the recursion stack.",
        "cn": "时间复杂度是O(n)，因为我们访问每个节点一次，空间复杂度是O(h)，其中h是高度，因为递归堆栈。"
      },
      {
        "speaker": "SeniorEngineer",
        "en": "<b>Walk me through your code</b>. How does your recursive function work exactly?",
        "cn": "给我讲解一下你的代码。你的递归函数具体是如何工作的？"
      },
      {
        "speaker": "Candidate",
        "en": "Sure. The function returns -1 if the tree is unbalanced, or the height if it's balanced. For each node, I recursively check left and right subtrees. If either returns -1, the tree is unbalanced.",
        "cn": "当然可以。如果树不平衡，函数返回-1，如果平衡则返回高度。对于每个节点，我递归检查左右子树。如果其中任何一个返回-1，树就不平衡。"
      },
      {
        "speaker": "TechLead",
        "en": "That's a <b>solid solution</b>. I appreciate how you <b>explained the trade-offs</b> and <b>considered edge cases</b>. Do you have any <b>follow-up questions</b> for us?",
        "cn": "这是一个很好的解决方案。我赞赏你如何解释权衡和考虑边界情况。你对我们有什么后续问题吗？"
      },
      {
        "speaker": "Candidate",
        "en": "Yes, I'm curious about the <b>tech stack</b> you currently use and your <b>deployment pipeline</b>. Also, how do you <b>handle monitoring</b> in production?",
        "cn": "是的，我很想了解你们目前使用的技术栈和部署流程。另外，你们如何在生产环境中处理监控？"
      },
      {
        "speaker": "SeniorEngineer",
        "en": "Great questions. We use Kubernetes for orchestration, and we have a <b>continuous integration pipeline</b> that runs tests automatically. We'll discuss this more if you move forward.",
        "cn": "很好的问题。我们使用Kubernetes进行编排，并有一个自动运行测试的持续集成流程。如果你继续推进，我们会更多地讨论这个。"
      },
      {
        "speaker": "Candidate",
        "en": "Perfect. I'm very excited about this opportunity and the <b>technical challenges</b> this role offers.",
        "cn": "完美。我对这个机会和这个职位提供的技术挑战感到非常兴奋。"
      }
    ]
  },
  {
    "id": "i5",
    "cat": "interview",
    "catName": "面试",
    "catEmoji": "🎯",
    "title": "Offer Negotiation Call",
    "titleCn": "录用谈判电话",
    "emoji": "👩‍💼",
    "lines": [
      {
        "speaker": "HRManager",
        "en": "Congratulations! I'm excited to <b>extend an offer</b> for the Senior Engineer role. Let me walk you through the <b>compensation package</b>.",
        "cn": "恭喜你！我很高兴为你提供高级工程师职位的录用。让我给你介绍一下薪酬方案。"
      },
      {
        "speaker": "HRManager",
        "en": "The <b>base salary</b> is $180,000 per year. We're also offering a <b>sign-on bonus</b> of $40,000 to help with your transition.",
        "cn": "基本年薪是18万美元。我们还提供4万美元的签约奖金，帮助你过渡。"
      },
      {
        "speaker": "Candidate",
        "en": "Thank you for the offer. I'm genuinely excited about joining the team. Before I <b>commit to</b> anything, I'd like to discuss a few aspects of the offer.",
        "cn": "感谢你的录用。我真的很期待加入团队。在我承诺任何事情之前，我想讨论一下录用的几个方面。"
      },
      {
        "speaker": "Candidate",
        "en": "I've done my <b>market research</b>, and based on the Bay Area salary data and my experience, I was expecting something closer to $200,000 for this role.",
        "cn": "我进行了市场调查，根据湾区薪资数据和我的经验，我预期这个职位的薪资接近20万美元。"
      },
      {
        "speaker": "HiringManager",
        "en": "I understand. That's a reasonable ask. The <b>budget constraint</b> we're working with is tight, but let me see what we can do. What if we increase the base to $190,000 and add an additional <b>equity grant</b> of 0.1% in company stock?",
        "cn": "我理解。这是一个合理的要求。我们所处理的预算限制很紧张，但让我看看我们能做什么。如果我们将基本工资增加到19万美元，并增加0.1%的公司股票期权怎么样？"
      },
      {
        "speaker": "Candidate",
        "en": "That's helpful. I appreciate the <b>flexibility</b>. Can you also clarify the <b>vesting schedule</b> for the equity? Is it a standard 4-year vest with a 1-year cliff?",
        "cn": "这很有帮助。我感谢你的灵活性。你能澄清一下股票期权的授予计划吗？这是标准的4年授予期和1年悬崖期吗？"
      },
      {
        "speaker": "HRManager",
        "en": "Yes, exactly. It's a <b>4-year vesting schedule with a 1-year cliff</b>, which is standard in the industry. You'll vest 25% after one year, then monthly thereafter.",
        "cn": "是的，完全正确。这是标准的4年授予期和1年悬崖期，这是业界标准。你在一年后获得25%，然后每个月之后。"
      },
      {
        "speaker": "Candidate",
        "en": "That makes sense. Let me also ask about <b>professional development</b>. Does the company offer a <b>learning budget</b> or <b>conference attendance</b> support?",
        "cn": "那是合理的。让我也问一下关于专业发展。公司提供学习预算或会议参加支持吗？"
      },
      {
        "speaker": "HRManager",
        "en": "Great question. We offer a $2,500 annual <b>professional development budget</b> that you can use for courses, certifications, or conference travel. Plus, we <b>encourage remote work flexibility</b>—most of our team works 3 days in office and 2 days remote.",
        "cn": "很好的问题。我们提供每年2500美元的专业发展预算，你可以用于课程、认证或会议旅行。此外，我们鼓励远程工作灵活性——我们的大多数团队每周在办公室工作3天，远程工作2天。"
      },
      {
        "speaker": "Candidate",
        "en": "Excellent. What about <b>health insurance</b> and other <b>benefits</b>? I'd like to understand the full <b>benefits package</b>.",
        "cn": "太好了。关于健康保险和其他福利呢？我想了解完整的福利方案。"
      },
      {
        "speaker": "HRManager",
        "en": "We offer comprehensive <b>medical, dental, and vision coverage</b> with 80% company coverage. We also provide <b>401k matching</b> up to 6% of your salary. Additionally, we offer 4 weeks of <b>paid time off</b> annually.",
        "cn": "我们提供全面的医疗、牙科和视觉覆盖，公司承担80%的费用。我们还提供高达你薪资6%的401k匹配。另外，我们每年提供4周的带薪休假。"
      },
      {
        "speaker": "Candidate",
        "en": "That's solid. I'm getting closer to a <b>decision</b>, but I'd like to <b>take some time to review</b> the complete offer package. Can you send me all the details in writing?",
        "cn": "这很好。我越来越接近做出决定，但我想花一些时间审查完整的录用方案。你能把所有细节以书面形式发给我吗？"
      },
      {
        "speaker": "HiringManager",
        "en": "Of course. We'll <b>send you a formal offer letter</b> with all the terms and conditions. We're eager to have you <b>join the team</b>, so please get back to us within a week if possible.",
        "cn": "当然可以。我们会发送给你一份正式的录用信，包括所有的条款和条件。我们渴望你加入团队，所以请在可能的情况下在一周内回复我们。"
      },
      {
        "speaker": "Candidate",
        "en": "I will definitely review everything carefully. One more thing—is there any <b>flexibility on the start date</b>? I need to give notice at my current company.",
        "cn": "我肯定会仔细审查所有内容。还有一件事——开始日期有灵活性吗？我需要在现公司提交辞职通知。"
      },
      {
        "speaker": "HRManager",
        "en": "Yes, we can be flexible. We can accommodate a <b>start date</b> within the next 4-6 weeks, depending on your <b>notice period</b>.",
        "cn": "是的，我们可以灵活安排。根据你的离职通知期，我们可以在接下来的4-6周内开始工作。"
      },
      {
        "speaker": "Candidate",
        "en": "Perfect. I need to give two weeks notice, so I'm looking at <b>starting around June 15th</b>. Does that work?",
        "cn": "完美。我需要给出两周的通知，所以我看大约6月15日开始。这可以吗？"
      },
      {
        "speaker": "HiringManager",
        "en": "That works great. June 15th is perfect. We'll start the <b>onboarding process</b> in the meantime and have everything ready for you.",
        "cn": "这太好了。6月15日很完美。我们同时将开始入职流程，并为你准备好一切。"
      },
      {
        "speaker": "Candidate",
        "en": "I appreciate all of this <b>information</b> and your willingness to <b>negotiate in good faith</b>. I'm definitely interested in this opportunity.",
        "cn": "我感谢所有这些信息以及你以诚意谈判的意愿。我肯定对这个机会很感兴趣。"
      },
      {
        "speaker": "HRManager",
        "en": "We're thrilled to have you <b>as part of the team</b>. Please review the offer letter and don't hesitate to reach out with any questions.",
        "cn": "我们很高兴你能成为团队的一部分。请审查录用信，如有任何问题，请随时与我们联系。"
      },
      {
        "speaker": "Candidate",
        "en": "Thank you both. I'll review everything and get back to you by end of week. This has been a great conversation.",
        "cn": "谢谢你们。我会审查所有内容，并在周末前回复你。这是一个很棒的对话。"
      }
    ]
  }
];
