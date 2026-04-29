// Workplace English (湾区职场英语) — categories scaffolding.
// Dialogues to be filled in. Mirrors the SceneDialogue shape.
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

// Empty for now — fill in dialogues per category later.
export const WORK_DIALOGUES: WorkDialogue[] = [];
