// 小学一年级 Roleplay 角色扮演剧场(v2 - 扩展到 20 个场景)
// =============================================================
// 数据规模:
//   • 20 个完整对话场景(原 5 个节日/社交 + 新 15 个生活场景)
//   • 4 大类别:学校生活 / 家庭日常 / 朋友交流 / 公共场所 / 节日庆典
//   • 每个场景 2-4 轮对话 + 3 选 1 决策
//   • 错误选项有教学性反馈(中西方礼仪对比)
//
// 设计原则:
//   1. 一年级孩子真实生活场景,不强求复杂句型
//   2. 选项设计:正确(礼貌得体)+ 太直接(语法对但场合错)+ 误用(教学性错误)
//   3. 中西方礼仪差异通过 feedback_cn 自然展示(文化意识)
//   4. 顺序解锁:简单 → 难,新手友好
//
// UI 使用建议:
//   • 主路径接入 Adventure 第 3 步轮换池
//   • 按 sortOrder 顺序展示
//   • 完成后通过 SRS / Bond 系统记录完成情况

// ─── 类型定义 ──────────────────────────────────────

export type DialogueLine = {
  speaker: string;
  emoji: string;
  text_en: string;
  text_cn: string;
  side: "left" | "right";
};

export type RolePlayChoice = {
  text_en: string;
  text_cn: string;
  correct: boolean;
  feedback_cn: string;
};

export type RolePlayCategory =
  | "school"       // 学校生活
  | "family"       // 家庭日常
  | "friends"      // 朋友交流
  | "public"       // 公共场所
  | "festival";    // 节日庆典

export type RolePlay = {
  id: string;
  emoji: string;
  title_cn: string;
  title_en: string;
  scene_cn: string;
  bg: string;                // tailwind gradient
  category: RolePlayCategory;  // 新增 - 用于分类筛选
  difficulty: 1 | 2 | 3;       // 新增 - 1=简单, 2=中等, 3=挑战
  sortOrder: number;           // 新增 - 顺序解锁用
  lines: DialogueLine[];
  choices: RolePlayChoice[];
};

export const PRIMARY_ROLE_PLAYS: RolePlay[] = [

  // ── 节日庆典 ──────────────────────────────────────

  {
    id: "rp1",
    emoji: "🎃",
    title_cn: "万圣节要糖",
    title_en: "Trick or Treat",
    scene_cn: "你穿着南瓜服去敲老奶奶的门",
    bg: "from-orange-400 to-rose-500",
    category: "festival",
    difficulty: 1,
    sortOrder: 1,
    lines: [
      { speaker: "你", emoji: "👦", side: "left", text_en: "Knock knock!", text_cn: "咚咚咚!" },
      { speaker: "老奶奶", emoji: "👵", side: "right", text_en: "Oh, what a cute pumpkin!", text_cn: "哦,多可爱的小南瓜!" },
      { speaker: "你", emoji: "👦", side: "left", text_en: "Trick or treat!", text_cn: "不给糖就捣蛋!" },
      { speaker: "老奶奶", emoji: "👵", side: "right", text_en: "Here you are! Happy Halloween!", text_cn: "给你!万圣节快乐!" },
    ],
    choices: [
      { text_en: "Thank you!", text_cn: "谢谢!", correct: true, feedback_cn: "🌟 完美!收到东西要说 Thank you" },
      { text_en: "I'm fine.", text_cn: "我很好。", correct: false, feedback_cn: "这是回答 How are you 的哦~" },
      { text_en: "Goodbye!", text_cn: "再见!", correct: false, feedback_cn: "先说谢谢再说再见会更好~" },
    ],
  },
  {
    id: "rp2",
    emoji: "🎂",
    title_cn: "生日派对",
    title_en: "Birthday Party",
    scene_cn: "好朋友 Lily 把生日礼物递给你",
    bg: "from-pink-400 to-fuchsia-500",
    category: "festival",
    difficulty: 1,
    sortOrder: 2,
    lines: [
      { speaker: "Lily", emoji: "👧", side: "right", text_en: "Happy birthday! This is for you.", text_cn: "生日快乐!这是给你的。" },
      { speaker: "你", emoji: "👦", side: "left", text_en: "Wow, a teddy bear!", text_cn: "哇,是泰迪熊!" },
      { speaker: "Lily", emoji: "👧", side: "right", text_en: "Do you like it?", text_cn: "你喜欢吗?" },
    ],
    choices: [
      { text_en: "I love it! Thank you!", text_cn: "我超喜欢!谢谢!", correct: true, feedback_cn: "🌟 西方礼仪:当面打开礼物并称赞" },
      { text_en: "I'll open it later.", text_cn: "我等会儿再拆。", correct: false, feedback_cn: "西方人喜欢你当面拆礼物哦~" },
      { text_en: "It's too small.", text_cn: "太小了。", correct: false, feedback_cn: "评价礼物大小会让朋友难过~" },
    ],
  },
  {
    id: "rp3",
    emoji: "🏫",
    title_cn: "校园见老师",
    title_en: "Meet Your Teacher",
    scene_cn: "早上进教室,新来的老师对你微笑",
    bg: "from-emerald-400 to-teal-500",
    category: "school",
    difficulty: 1,
    sortOrder: 3,
    lines: [
      { speaker: "老师", emoji: "👩‍🏫", side: "right", text_en: "Good morning! I'm Ms. Smith.", text_cn: "早上好!我是 Smith 老师。" },
      { speaker: "你", emoji: "👦", side: "left", text_en: "Good morning, Ms. Smith.", text_cn: "早上好,Smith 老师。" },
      { speaker: "老师", emoji: "👩‍🏫", side: "right", text_en: "How are you today?", text_cn: "你今天怎么样?" },
    ],
    choices: [
      { text_en: "I'm fine, thank you. And you?", text_cn: "我很好,谢谢。你呢?", correct: true, feedback_cn: "🌟 完美回答!还反问对方更礼貌" },
      { text_en: "Yes, I am.", text_cn: "是的,我是。", correct: false, feedback_cn: "How are you 不能用 Yes 回答~" },
      { text_en: "I am seven.", text_cn: "我七岁。", correct: false, feedback_cn: "那是回答 How old are you~" },
    ],
  },
  {
    id: "rp4",
    emoji: "🍽️",
    title_cn: "餐桌上想要",
    title_en: "At the Dinner Table",
    scene_cn: "在朋友家吃饭,你想要桌上的果汁",
    bg: "from-amber-400 to-orange-500",
    category: "family",
    difficulty: 2,
    sortOrder: 4,
    lines: [
      { speaker: "妈妈", emoji: "👩", side: "right", text_en: "Are you enjoying dinner?", text_cn: "晚饭还喜欢吗?" },
      { speaker: "你", emoji: "👦", side: "left", text_en: "Yes, it's delicious!", text_cn: "嗯,很好吃!" },
    ],
    choices: [
      { text_en: "Can I have some juice, please?", text_cn: "请问可以给我一些果汁吗?", correct: true, feedback_cn: "🌟 完美!Can I... please 是最礼貌的请求" },
      { text_en: "Give me the juice.", text_cn: "把果汁给我。", correct: false, feedback_cn: "太直接了,要加 please 哦~" },
      { text_en: "I want juice now!", text_cn: "我现在就要果汁!", correct: false, feedback_cn: "西方餐桌不要命令式哦~" },
    ],
  },
  {
    id: "rp5",
    emoji: "🎄",
    title_cn: "圣诞早晨",
    title_en: "Christmas Morning",
    scene_cn: "圣诞早上,你跑下楼看到树下的礼物",
    bg: "from-rose-500 to-emerald-500",
    category: "festival",
    difficulty: 1,
    sortOrder: 5,
    lines: [
      { speaker: "你", emoji: "👦", side: "left", text_en: "Wow! Santa came!", text_cn: "哇!圣诞老人来过了!" },
      { speaker: "爸爸", emoji: "👨", side: "right", text_en: "Merry Christmas! Open your gift!", text_cn: "圣诞快乐!打开你的礼物吧!" },
    ],
    choices: [
      { text_en: "Merry Christmas, Dad! I love it!", text_cn: "圣诞快乐,爸爸!我超喜欢!", correct: true, feedback_cn: "🌟 节日要互道祝福,并称赞礼物" },
      { text_en: "Where is more?", text_cn: "还有更多吗?", correct: false, feedback_cn: "知足才会更开心~" },
      { text_en: "Bye bye.", text_cn: "拜拜。", correct: false, feedback_cn: "现在不是说再见的时候哦~" },
    ],
  },

  // ── 学校生活 / 家庭日常 / 朋友交流 / 公共场所 ──

  {
    id: "rp6",
    emoji: "🎒",
    title_cn: "第一天上学",
    title_en: "First Day at School",
    scene_cn: "你第一天到新学校,在教室门口看到一个小朋友",
    bg: "from-sky-400 to-blue-500",
    category: "school",
    difficulty: 1,
    sortOrder: 6,
    lines: [
      { speaker: "小朋友", emoji: "👧", side: "right", text_en: "Hi! Are you new?", text_cn: "嗨!你是新来的吗?" },
      { speaker: "你", emoji: "👦", side: "left", text_en: "Yes, I am.", text_cn: "是的,我是。" },
      { speaker: "小朋友", emoji: "👧", side: "right", text_en: "What's your name?", text_cn: "你叫什么名字?" }
    ],
    choices: [
      { text_en: "I'm Mei. Nice to meet you!", text_cn: "我叫梅。很高兴认识你!", correct: true, feedback_cn: "🌟 完美!说名字 + Nice to meet you 是西方初次见面的标准回答" },
      { text_en: "My name.", text_cn: "我的名字。", correct: false, feedback_cn: "要把名字说出来哦,比如 I'm Mei~" },
      { text_en: "I don't know.", text_cn: "我不知道。", correct: false, feedback_cn: "你当然知道自己的名字啦,大方告诉新朋友~" }
    ],
  },
  {
    id: "rp7",
    emoji: "✏️",
    title_cn: "借橡皮",
    title_en: "Borrow an Eraser",
    scene_cn: "你画错了一个字,但是橡皮忘带了。同桌的橡皮就在旁边",
    bg: "from-yellow-400 to-orange-500",
    category: "school",
    difficulty: 2,
    sortOrder: 7,
    lines: [
      { speaker: "你", emoji: "👦", side: "left", text_en: "Oh no, I forgot my eraser.", text_cn: "糟糕,我忘带橡皮了。" },
      { speaker: "同桌", emoji: "👧", side: "right", text_en: "What happened?", text_cn: "怎么啦?" }
    ],
    choices: [
      { text_en: "Can I borrow your eraser, please?", text_cn: "请问可以借我橡皮吗?", correct: true, feedback_cn: "🌟 完美!Can I... please 是最礼貌的借东西方式" },
      { text_en: "Give me your eraser.", text_cn: "把橡皮给我。", correct: false, feedback_cn: "太命令了哦,要加 please 才礼貌~" },
      { text_en: "Your eraser is mine.", text_cn: "你的橡皮是我的。", correct: false, feedback_cn: "这样说就变成抢东西啦!要好好借哦~" }
    ],
  },
  {
    id: "rp8",
    emoji: "🙋",
    title_cn: "课堂回答问题",
    title_en: "Answer in Class",
    scene_cn: "老师在黑板上写了 '1 + 1 = ?',你知道答案,想举手回答",
    bg: "from-violet-400 to-purple-500",
    category: "school",
    difficulty: 2,
    sortOrder: 8,
    lines: [
      { speaker: "老师", emoji: "👩‍🏫", side: "right", text_en: "Who knows the answer?", text_cn: "谁知道答案?" }
    ],
    choices: [
      { text_en: "I know! Can I try?", text_cn: "我知道!可以让我试试吗?", correct: true, feedback_cn: "🌟 完美!I know + Can I try 是礼貌主动的课堂表达" },
      { text_en: "Two two two!", text_cn: "二二二!", correct: false, feedback_cn: "答案是对的,但先要完整说出来:The answer is two~" },
      { text_en: "Easy easy.", text_cn: "简单简单。", correct: false, feedback_cn: "就算知道也不要说简单哦,会让其他小朋友难过~" }
    ],
  },
  {
    id: "rp9",
    emoji: "🤸",
    title_cn: "下课玩游戏",
    title_en: "Recess Time",
    scene_cn: "下课了,你看到几个小朋友在操场上玩追人游戏",
    bg: "from-emerald-400 to-green-500",
    category: "school",
    difficulty: 2,
    sortOrder: 9,
    lines: [
      { speaker: "Tom", emoji: "👦", side: "right", text_en: "We're playing tag! Want to play?", text_cn: "我们在玩追人!想一起玩吗?" }
    ],
    choices: [
      { text_en: "Yes, I'd love to! How do we play?", text_cn: "好呀,我超想玩!怎么玩?", correct: true, feedback_cn: "🌟 完美!主动加入并问清规则,是融入新朋友的好方法" },
      { text_en: "Maybe later.", text_cn: "晚点再说吧。", correct: false, feedback_cn: "拒绝邀请会让朋友不开心哦,试着勇敢加入~" },
      { text_en: "Tag is silly.", text_cn: "追人很傻。", correct: false, feedback_cn: "不要说别人的游戏傻,可以礼貌说不想玩~" }
    ],
  },
  {
    id: "rp10",
    emoji: "🚻",
    title_cn: "找洗手间",
    title_en: "Find the Bathroom",
    scene_cn: "上课的时候你想去洗手间,但是不知道在哪里",
    bg: "from-cyan-400 to-sky-500",
    category: "school",
    difficulty: 2,
    sortOrder: 10,
    lines: [
      { speaker: "老师", emoji: "👩‍🏫", side: "right", text_en: "Yes, what is it?", text_cn: "怎么了?" }
    ],
    choices: [
      { text_en: "May I go to the bathroom, please?", text_cn: "请问我可以去洗手间吗?", correct: true, feedback_cn: "🌟 完美!May I... please 是请求许可最礼貌的说法" },
      { text_en: "I need pee!", text_cn: "我要尿尿!", correct: false, feedback_cn: "太直接了哦,在学校要用 bathroom 更礼貌~" },
      { text_en: "Bathroom!", text_cn: "洗手间!", correct: false, feedback_cn: "只说一个词不礼貌,要完整说出请求~" }
    ],
  },
  {
    id: "rp11",
    emoji: "☀️",
    title_cn: "早上起床",
    title_en: "Wake Up",
    scene_cn: "早晨阳光照进房间,妈妈走进来叫你起床",
    bg: "from-yellow-300 to-amber-400",
    category: "family",
    difficulty: 1,
    sortOrder: 11,
    lines: [
      { speaker: "妈妈", emoji: "👩", side: "right", text_en: "Good morning, honey! Time to wake up.", text_cn: "早上好,宝贝!该起床了。" }
    ],
    choices: [
      { text_en: "Good morning, Mom!", text_cn: "早上好,妈妈!", correct: true, feedback_cn: "🌟 完美!主动问候是一天的好开始" },
      { text_en: "Five more minutes...", text_cn: "再睡五分钟...", correct: false, feedback_cn: "妈妈听了会无奈哦,我们一起精神起来吧~" },
      { text_en: "No, I'm sleepy.", text_cn: "不要,我困。", correct: false, feedback_cn: "睡得够就要起床啦,新的一天等着你~" }
    ],
  },
  {
    id: "rp12",
    emoji: "🥣",
    title_cn: "早餐时间",
    title_en: "Breakfast Time",
    scene_cn: "餐桌上摆着面包、牛奶和鸡蛋,妈妈问你想要什么",
    bg: "from-orange-300 to-red-400",
    category: "family",
    difficulty: 1,
    sortOrder: 12,
    lines: [
      { speaker: "妈妈", emoji: "👩", side: "right", text_en: "What would you like for breakfast?", text_cn: "你早餐想吃什么?" }
    ],
    choices: [
      { text_en: "I'd like some milk and bread, please.", text_cn: "我想要一些牛奶和面包,谢谢。", correct: true, feedback_cn: "🌟 完美!I'd like + please 是最有礼貌的请求" },
      { text_en: "All of it!", text_cn: "全部!", correct: false, feedback_cn: "吃不完会浪费哦,要多少拿多少~" },
      { text_en: "I don't want.", text_cn: "我不想要。", correct: false, feedback_cn: "早餐很重要哦,告诉妈妈想吃什么吧~" }
    ],
  },
  {
    id: "rp13",
    emoji: "🌙",
    title_cn: "睡前道晚安",
    title_en: "Good Night",
    scene_cn: "刷完牙穿好睡衣,爸爸来房间道晚安",
    bg: "from-indigo-400 to-purple-600",
    category: "family",
    difficulty: 1,
    sortOrder: 13,
    lines: [
      { speaker: "爸爸", emoji: "👨", side: "right", text_en: "Time for bed. Good night, sweetie.", text_cn: "该睡觉了。晚安,宝贝。" }
    ],
    choices: [
      { text_en: "Good night, Dad. I love you.", text_cn: "晚安,爸爸。我爱你。", correct: true, feedback_cn: "🌟 完美!西方家庭睡前互说 I love you 是温馨传统" },
      { text_en: "OK bye.", text_cn: "好,再见。", correct: false, feedback_cn: "睡觉不是再见哦,要说 Good night~" },
      { text_en: "I'm not sleepy.", text_cn: "我不困。", correct: false, feedback_cn: "明天要早起呢,好好睡才有力气玩~" }
    ],
  },
  {
    id: "rp14",
    emoji: "🚗",
    title_cn: "周末出去玩",
    title_en: "Weekend Plans",
    scene_cn: "星期六早上,你穿好衣服下楼,看到全家人在准备出门",
    bg: "from-teal-400 to-cyan-500",
    category: "family",
    difficulty: 2,
    sortOrder: 14,
    lines: [
      { speaker: "你", emoji: "👦", side: "left", text_en: "Where are we going today?", text_cn: "我们今天要去哪?" },
      { speaker: "妈妈", emoji: "👩", side: "right", text_en: "We're going to the zoo!", text_cn: "我们要去动物园!" }
    ],
    choices: [
      { text_en: "Yay! I love the zoo!", text_cn: "耶!我超爱动物园!", correct: true, feedback_cn: "🌟 完美!对家人的计划表现兴奋,会让大家更开心" },
      { text_en: "Boring.", text_cn: "无聊。", correct: false, feedback_cn: "妈妈准备了惊喜,这样说会让她伤心~" },
      { text_en: "I want to stay home.", text_cn: "我想待在家。", correct: false, feedback_cn: "出去玩会发现很多新东西哦,试着期待一下~" }
    ],
  },
  {
    id: "rp15",
    emoji: "👋",
    title_cn: "第一次见面",
    title_en: "First Meeting",
    scene_cn: "妈妈带你去阿姨家,阿姨家有一个和你差不多大的小朋友",
    bg: "from-pink-400 to-rose-500",
    category: "friends",
    difficulty: 2,
    sortOrder: 15,
    lines: [
      { speaker: "阿姨", emoji: "👩", side: "right", text_en: "This is my son, Jake. Jake, say hi!", text_cn: "这是我儿子杰克。杰克,打招呼!" },
      { speaker: "Jake", emoji: "👦", side: "right", text_en: "Hi! How old are you?", text_cn: "嗨!你几岁?" }
    ],
    choices: [
      { text_en: "I'm seven. Nice to meet you!", text_cn: "我七岁。很高兴认识你!", correct: true, feedback_cn: "🌟 完美!回答问题 + Nice to meet you 是标准社交礼仪" },
      { text_en: "None of your business.", text_cn: "不关你的事。", correct: false, feedback_cn: "这样回答太凶啦,新朋友想了解你呢~" },
      { text_en: "Seven.", text_cn: "七。", correct: false, feedback_cn: "只说数字不完整,试试 I'm seven~" }
    ],
  },
  {
    id: "rp16",
    emoji: "🧸",
    title_cn: "分享玩具",
    title_en: "Share a Toy",
    scene_cn: "你拿出了最喜欢的玩具熊,小表弟眼巴巴地看着",
    bg: "from-amber-400 to-yellow-500",
    category: "friends",
    difficulty: 2,
    sortOrder: 16,
    lines: [
      { speaker: "表弟", emoji: "👶", side: "right", text_en: "Wow, your bear is so cute!", text_cn: "哇,你的熊好可爱!" },
      { speaker: "表弟", emoji: "👶", side: "right", text_en: "Can I play with it?", text_cn: "我能玩一下吗?" }
    ],
    choices: [
      { text_en: "Sure! Let's play together.", text_cn: "当然!我们一起玩吧。", correct: true, feedback_cn: "🌟 完美!分享 + 一起玩,是好哥哥姐姐的样子" },
      { text_en: "No, it's mine.", text_cn: "不行,这是我的。", correct: false, feedback_cn: "玩具偶尔分享一下,你会有更多朋友~" },
      { text_en: "Just for one minute.", text_cn: "就一分钟。", correct: false, feedback_cn: "限时太短了,试着大方一点分享~" }
    ],
  },
  {
    id: "rp17",
    emoji: "😢",
    title_cn: "道歉与原谅",
    title_en: "Sorry and OK",
    scene_cn: "你不小心撞到了 Lily,她手里的画本掉在地上",
    bg: "from-rose-300 to-pink-500",
    category: "friends",
    difficulty: 3,
    sortOrder: 17,
    lines: [
      { speaker: "你", emoji: "👦", side: "left", text_en: "Oh no!", text_cn: "糟糕!" },
      { speaker: "Lily", emoji: "👧", side: "right", text_en: "My drawing!", text_cn: "我的画!" }
    ],
    choices: [
      { text_en: "I'm so sorry! Are you okay?", text_cn: "真的对不起!你没事吧?", correct: true, feedback_cn: "🌟 完美!道歉 + 关心对方,是真诚的态度" },
      { text_en: "It's not my fault.", text_cn: "不是我的错。", correct: false, feedback_cn: "撞到人就要先道歉,不管谁的错~" },
      { text_en: "Whatever.", text_cn: "随便啦。", correct: false, feedback_cn: "这样说会让 Lily 很难过,试着真诚一点~" }
    ],
  },
  {
    id: "rp18",
    emoji: "🍔",
    title_cn: "餐厅点餐",
    title_en: "Order at a Restaurant",
    scene_cn: "你和妈妈去餐厅,服务员阿姨拿着菜单走过来",
    bg: "from-red-400 to-rose-500",
    category: "public",
    difficulty: 2,
    sortOrder: 18,
    lines: [
      { speaker: "服务员", emoji: "👩‍🍳", side: "right", text_en: "Hi! What would you like to eat?", text_cn: "你好!想吃什么?" }
    ],
    choices: [
      { text_en: "I'd like a hamburger, please.", text_cn: "我想要一个汉堡,谢谢。", correct: true, feedback_cn: "🌟 完美!I'd like + please 是餐厅点餐最礼貌的说法" },
      { text_en: "Burger now!", text_cn: "汉堡!现在!", correct: false, feedback_cn: "在公共场合要更礼貌哦,加 please 试试~" },
      { text_en: "Whatever, just food.", text_cn: "随便,只要是吃的。", correct: false, feedback_cn: "服务员需要知道具体要什么,告诉她想吃的~" }
    ],
  },
  {
    id: "rp19",
    emoji: "🛍️",
    title_cn: "商店买东西",
    title_en: "At the Store",
    scene_cn: "你看上了商店里一个漂亮的小玩具,想知道多少钱",
    bg: "from-purple-400 to-fuchsia-500",
    category: "public",
    difficulty: 2,
    sortOrder: 19,
    lines: [
      { speaker: "店员", emoji: "🧑‍💼", side: "right", text_en: "Hi there! Can I help you?", text_cn: "你好!需要什么帮助吗?" }
    ],
    choices: [
      { text_en: "How much is this, please?", text_cn: "请问这个多少钱?", correct: true, feedback_cn: "🌟 完美!How much + please 是询价的标准礼貌用语" },
      { text_en: "How much money?", text_cn: "多少钱?", correct: false, feedback_cn: "意思对但不够礼貌,试试 How much is this~" },
      { text_en: "Give me this.", text_cn: "给我这个。", correct: false, feedback_cn: "要先问价格,而且不能命令店员哦~" }
    ],
  },
  {
    id: "rp20",
    emoji: "🌳",
    title_cn: "公园见新朋友",
    title_en: "Meet a Friend at the Park",
    scene_cn: "公园里有一个小朋友在堆沙堡,你也想玩沙子",
    bg: "from-green-400 to-emerald-500",
    category: "public",
    difficulty: 3,
    sortOrder: 20,
    lines: [
      { speaker: "你", emoji: "👦", side: "left", text_en: "Wow, what a cool castle!", text_cn: "哇,好酷的城堡!" },
      { speaker: "小朋友", emoji: "👧", side: "right", text_en: "Thanks! I'm making a tower.", text_cn: "谢谢!我在做塔。" }
    ],
    choices: [
      { text_en: "Can I join you?", text_cn: "我可以一起玩吗?", correct: true, feedback_cn: "🌟 完美!赞美 + 主动加入,交新朋友就是这么简单" },
      { text_en: "Move over, I want to play.", text_cn: "让开,我想玩。", correct: false, feedback_cn: "不能让别人让开哦,要礼貌地问能不能加入~" },
      { text_en: "Yours is not nice.", text_cn: "你做的不好看。", correct: false, feedback_cn: "对方明明做得很好,这样说会伤心~" }
    ],
  }
];

// ─── 工具函数 ──────────────────────────────────────

/** 按类别取场景 */
export function getRolePlaysByCategory(category: RolePlayCategory): RolePlay[] {
  return PRIMARY_ROLE_PLAYS.filter(rp => rp.category === category)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** 按难度取场景 */
export function getRolePlaysByDifficulty(difficulty: 1 | 2 | 3): RolePlay[] {
  return PRIMARY_ROLE_PLAYS.filter(rp => rp.difficulty === difficulty)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** 按顺序取所有场景(用于解锁推送) */
export function getRolePlaysSorted(): RolePlay[] {
  return [...PRIMARY_ROLE_PLAYS].sort((a, b) => a.sortOrder - b.sortOrder);
}

/** 取下一个未完成的场景 */
export function getNextRolePlay(completedIds: string[]): RolePlay | null {
  const sorted = getRolePlaysSorted();
  return sorted.find(rp => !completedIds.includes(rp.id)) || null;
}

/** 按 id 查找 */
export function findRolePlay(id: string): RolePlay | undefined {
  return PRIMARY_ROLE_PLAYS.find(rp => rp.id === id);
}

/** 统计 */
export const ROLEPLAY_STATS = {
  total: 20,
  byCategory: {
    school: 5,
    family: 5,
    friends: 3,
    public: 3,
    festival: 3,
  },
  byDifficulty: {
    easy: 7,      // difficulty 1
    medium: 11,   // difficulty 2
    challenge: 2, // difficulty 3
  },
};
