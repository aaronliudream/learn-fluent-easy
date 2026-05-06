// 一年级西方文化角色扮演剧场 - 纯 TTS 漫画对话
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

export type RolePlay = {
  id: string;
  emoji: string;
  title_cn: string;
  title_en: string;
  scene_cn: string;
  bg: string; // tailwind gradient
  lines: DialogueLine[];
  choices: RolePlayChoice[]; // 最后一句让孩子选
};

export const PRIMARY_ROLE_PLAYS: RolePlay[] = [
  {
    id: "rp1",
    emoji: "🎃",
    title_cn: "万圣节要糖",
    title_en: "Trick or Treat",
    scene_cn: "你穿着南瓜服去敲老奶奶的门",
    bg: "from-orange-400 to-rose-500",
    lines: [
      { speaker: "你", emoji: "👦", side: "left", text_en: "Knock knock!", text_cn: "咚咚咚！" },
      { speaker: "老奶奶", emoji: "👵", side: "right", text_en: "Oh, what a cute pumpkin!", text_cn: "哦，多可爱的小南瓜！" },
      { speaker: "你", emoji: "👦", side: "left", text_en: "Trick or treat!", text_cn: "不给糖就捣蛋！" },
      { speaker: "老奶奶", emoji: "👵", side: "right", text_en: "Here you are! Happy Halloween!", text_cn: "给你！万圣节快乐！" },
    ],
    choices: [
      { text_en: "Thank you!", text_cn: "谢谢！", correct: true, feedback_cn: "🌟 完美！收到东西要说 Thank you" },
      { text_en: "I'm fine.", text_cn: "我很好。", correct: false, feedback_cn: "这是回答 How are you 的哦～" },
      { text_en: "Goodbye!", text_cn: "再见！", correct: false, feedback_cn: "先说谢谢再说再见会更好～" },
    ],
  },
  {
    id: "rp2",
    emoji: "🎂",
    title_cn: "生日派对",
    title_en: "Birthday Party",
    scene_cn: "好朋友 Lily 把生日礼物递给你",
    bg: "from-pink-400 to-fuchsia-500",
    lines: [
      { speaker: "Lily", emoji: "👧", side: "right", text_en: "Happy birthday! This is for you.", text_cn: "生日快乐！这是给你的。" },
      { speaker: "你", emoji: "👦", side: "left", text_en: "Wow, a teddy bear!", text_cn: "哇，是泰迪熊！" },
      { speaker: "Lily", emoji: "👧", side: "right", text_en: "Do you like it?", text_cn: "你喜欢吗？" },
    ],
    choices: [
      { text_en: "I love it! Thank you!", text_cn: "我超喜欢！谢谢！", correct: true, feedback_cn: "🌟 西方礼仪：当面打开礼物并称赞" },
      { text_en: "I'll open it later.", text_cn: "我等会儿再拆。", correct: false, feedback_cn: "西方人喜欢你当面拆礼物哦～" },
      { text_en: "It's too small.", text_cn: "太小了。", correct: false, feedback_cn: "评价礼物大小会让朋友难过～" },
    ],
  },
  {
    id: "rp3",
    emoji: "🏫",
    title_cn: "校园见老师",
    title_en: "Meet Your Teacher",
    scene_cn: "早上进教室，新来的老师对你微笑",
    bg: "from-emerald-400 to-teal-500",
    lines: [
      { speaker: "老师", emoji: "👩‍🏫", side: "right", text_en: "Good morning! I'm Ms. Smith.", text_cn: "早上好！我是 Smith 老师。" },
      { speaker: "你", emoji: "👦", side: "left", text_en: "Good morning, Ms. Smith.", text_cn: "早上好，Smith 老师。" },
      { speaker: "老师", emoji: "👩‍🏫", side: "right", text_en: "How are you today?", text_cn: "你今天怎么样？" },
    ],
    choices: [
      { text_en: "I'm fine, thank you. And you?", text_cn: "我很好，谢谢。你呢？", correct: true, feedback_cn: "🌟 完美回答！还反问对方更礼貌" },
      { text_en: "Yes, I am.", text_cn: "是的，我是。", correct: false, feedback_cn: "How are you 不能用 Yes 回答～" },
      { text_en: "I am seven.", text_cn: "我七岁。", correct: false, feedback_cn: "那是回答 How old are you～" },
    ],
  },
  {
    id: "rp4",
    emoji: "🍽️",
    title_cn: "餐桌上想要",
    title_en: "At the Dinner Table",
    scene_cn: "在朋友家吃饭，你想要桌上的果汁",
    bg: "from-amber-400 to-orange-500",
    lines: [
      { speaker: "妈妈", emoji: "👩", side: "right", text_en: "Are you enjoying dinner?", text_cn: "晚饭还喜欢吗？" },
      { speaker: "你", emoji: "👦", side: "left", text_en: "Yes, it's delicious!", text_cn: "嗯，很好吃！" },
    ],
    choices: [
      { text_en: "Can I have some juice, please?", text_cn: "请问可以给我一些果汁吗？", correct: true, feedback_cn: "🌟 完美！Can I... please 是最礼貌的请求" },
      { text_en: "Give me the juice.", text_cn: "把果汁给我。", correct: false, feedback_cn: "太直接了，要加 please 哦～" },
      { text_en: "I want juice now!", text_cn: "我现在就要果汁！", correct: false, feedback_cn: "西方餐桌不要命令式哦～" },
    ],
  },
  {
    id: "rp5",
    emoji: "🎄",
    title_cn: "圣诞早晨",
    title_en: "Christmas Morning",
    scene_cn: "圣诞早上，你跑下楼看到树下的礼物",
    bg: "from-rose-500 to-emerald-500",
    lines: [
      { speaker: "你", emoji: "👦", side: "left", text_en: "Wow! Santa came!", text_cn: "哇！圣诞老人来过了！" },
      { speaker: "爸爸", emoji: "👨", side: "right", text_en: "Merry Christmas! Open your gift!", text_cn: "圣诞快乐！打开你的礼物吧！" },
    ],
    choices: [
      { text_en: "Merry Christmas, Dad! I love it!", text_cn: "圣诞快乐，爸爸！我超喜欢！", correct: true, feedback_cn: "🌟 节日要互道祝福，并称赞礼物" },
      { text_en: "Where is more?", text_cn: "还有更多吗？", correct: false, feedback_cn: "知足才会更开心～" },
      { text_en: "Bye bye.", text_cn: "拜拜。", correct: false, feedback_cn: "现在不是说再见的时候哦～" },
    ],
  },
];
