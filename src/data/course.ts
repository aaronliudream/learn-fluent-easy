export type Lesson = {
  id: number;
  title: string;
  duration: string;
  status: "done" | "current" | "locked";
};

export type Unit = {
  id: number;
  title: string;
  desc: string;
  icon: "star" | "book" | "map" | "shop" | "cloud" | "briefcase";
  iconBg: string; // tailwind bg class
  hours: string;
  lessons: Lesson[];
};

export type Level = {
  id: number;
  name: string;
  unitsCount: number;
  gradient: string; // tailwind bg-grad-N
  units: Unit[];
};

const mkLessons = (titles: string[], doneCount: number, lockFromIdx?: number): Lesson[] =>
  titles.map((t, i) => ({
    id: i + 1,
    title: t,
    duration: `${12 + ((i * 3) % 12)}分钟`,
    status:
      i < doneCount
        ? "done"
        : lockFromIdx !== undefined && i >= lockFromIdx
          ? "locked"
          : i === doneCount
            ? "current"
            : "locked",
  }));

const mkOpenLessons = (titles: string[], doneCount = 0): Lesson[] =>
  titles.map((t, i) => ({
    id: i + 1,
    title: t,
    duration: `${12 + ((i * 3) % 12)}分钟`,
    status: i < doneCount ? "done" : "current",
  }));

export const LEVELS: Level[] = [
  {
    id: 1,
    name: "LEVEL 1",
    unitsCount: 12,
    gradient: "bg-grad-1",
    units: [
      { id: 1, title: "你好 · 英语第一课", desc: "Hello — first words of English", icon: "star", iconBg: "bg-emerald-500", hours: "2小时",
        lessons: mkOpenLessons(["Hello, I'm Mei. · 第一课：你好，我叫梅（梅刚到加州）", "Can you help me? · 第二课：能帮我一下吗？（梅在 SFO 求助）", "I'd like a coffee. · 第三课：我想要一杯咖啡（梅在寄宿家庭的第一个早晨）", "What time is it? · 第四课：现在几点？（梅倒时差醒来）", "First Day in America · 第五课：到美国第一天（梅的故事 · 第 1 章）"]) },
      { id: 2, title: "数字、年龄与电话", desc: "Numbers, age, and phone", icon: "book", iconBg: "bg-violet-500", hours: "2.5小时",
        lessons: mkOpenLessons(["This is my host family. · 第六课：这是我的寄宿家庭（梅认识全家）", "I get up at 7. · 第七课：我七点起床（梅在寄宿家庭的一天）", "It's sunny today. · 第八课：今天天气晴朗（梅第一个周末）", "I like pizza. · 第九课：我喜欢披萨（周五披萨夜）", "Settling In · 第十课：寄宿家庭的第一周（梅的故事 · 第 2 章）"]) },
      { id: 3, title: "你来自哪里", desc: "Where are you from?", icon: "map", iconBg: "bg-amber-500", hours: "3小时",
        lessons: mkOpenLessons(["Where do you live? · 第十一课：你住哪里？（梅第一天上英语课）", "The host family's house has three bedrooms. · 第十二课：寄宿家庭家里有三间卧室（梅给妈妈视频看房子）", "Take the bus. · 第十三课：坐公交（梅第一次独自坐公交）", "What do you do on weekends? · 第十四课：你周末做什么？（英语课聊天活动）", "Touring the Bay · 第十五课：游遍湾区（梅的故事 · 第 3 章）"]) },
      { id: 4, title: "家人与朋友", desc: "Family and friends", icon: "shop", iconBg: "bg-sky-500", hours: "3.5小时",
        lessons: mkOpenLessons(["I have a headache. · 第十六课：我头疼（梅第一次在加州生病）", "Can I speak to Linda? · 第十七课：能找一下琳达吗？（梅在诊所打电话回家）", "I'm happy today. · 第十八课：我今天很开心（梅康复后的小确幸）", "She is tall. · 第十九课：她个子高（梅给莎拉看北京家人的照片）", "Apartment Hunting · 第二十课：找房子（梅的故事 · 第 4 章）"]) },
      { id: 5, title: "时间与日常作息", desc: "Time and daily routine", icon: "cloud", iconBg: "bg-rose-500", hours: "2小时",
        lessons: mkOpenLessons(["Happy Birthday! · 第二十一课：生日快乐！（汤姆十一岁生日）", "What do you do? · 第二十二课：你是做什么的？（梅认识安娜的朋友）", "Excuse me, where's the bank? · 第二十三课：请问银行在哪里？（梅开第一个美国银行账户）", "A table for two, please. · 第二十四课：两个人的位子，谢谢（梅和安娜下馆子）", "First Halloween · 第二十五课：第一个万圣节（梅的故事 · 第 5 章）"]) },
      { id: 6, title: "饮食", desc: "Food and drink", icon: "briefcase", iconBg: "bg-cyan-500", hours: "2.5小时",
        lessons: mkOpenLessons(["In my neighborhood. · 第二十六课：我住的小区（梅熟悉了伯克利）", "Let's go to the movies! · 第二十七课：咱们去看电影吧！（梅第一次在美国看电影）", "I'm going to FaceTime grandma. · 第二十八课：我要和奶奶视频（梅打给北京的奶奶）", "I'm not American. · 第二十九课：我不是美国人（梅在咖啡馆解释自己来自中国）", "First American Friend · 第三十课：第一个朋友（梅的故事 · 第 6 章）"]) },
      { id: 7, title: "家与生活", desc: "Home and living", icon: "star", iconBg: "bg-orange-500", hours: "3小时",
        lessons: mkOpenLessons(["What's your favorite season? · 第三十一课：你最喜欢哪个季节？（梅想念北京的秋天）", "I'm not feeling well. · 第三十二课：我不太舒服（梅感恩节前又有点感冒）", "I have a reservation. · 第三十三课：我们有预订（琳达订感恩节家宴位子）", "Thanksgiving Day. · 第三十四课：感恩节那一天（梅的第一个美国感恩节）", "Weekend in LA · 第三十五课：洛杉矶周末（梅的故事 · 第 7 章）"]) },
      { id: 8, title: "购物与金钱", desc: "Shopping and money", icon: "book", iconBg: "bg-lime-600", hours: "3.5小时",
        lessons: mkOpenLessons(["What did you watch last night? · 第三十六课：你昨晚看了什么？（感恩节后的英语课）", "I'll text you later. · 第三十七课：我等会儿给你发消息（梅和安娜约周末）", "You look great today! · 第三十八课：你今天看起来真棒！（早冬·夸赞与友情）", "Have a good trip! · 第三十九课：旅途愉快！（汤姆学校滑雪旅行·梅送行）", "Three Months In · 第四十课：来到美国三个月（梅的故事 · 第 8 章 · 三时态capstone）"]) },
      { id: 9, title: "天气与季节", desc: "Weather and seasons", icon: "map", iconBg: "bg-emerald-600", hours: "2小时",
        lessons: mkOpenLessons(["How do you spell that? · 第四十一课：那个怎么拼？（梅去邮局寄圣诞包裹回中国）", "What's your phone number? · 第四十二课：你的电话号码是多少？（梅准备第一次面试）", "Could you say that again? · 第四十三课：能再说一遍吗？（梅第一次电话面试）", "How many apples? · 第四十四课：几个苹果？（圣诞节烘焙采购清单）", "Her Own Room · 第四十五课：自己的小房间（梅的故事 · 第 9 章）"]) },
      { id: 10, title: "工作与职业", desc: "Jobs and work", icon: "shop", iconBg: "bg-indigo-500", hours: "2.5小时",
        lessons: mkOpenLessons(["The cat is on the table. · 第四十六课：猫在桌上（平安夜晚餐 · 调皮的小白）", "I prefer tea. · 第四十七课：我更喜欢茶（圣诞早晨的安静仪式）", "At the grocery store. · 第四十八课：在超市（梅圣诞节后第一次自己买菜）", "Two coffees, please. · 第四十九课：两杯咖啡，谢谢（跨年早上·梅给两个人点单）", "Half a Year in California · 第五十课：半年在加州（梅的故事 · 第 10 章）"]) },
      { id: 11, title: "身体与健康", desc: "Body and health", icon: "cloud", iconBg: "bg-slate-600", hours: "3小时",
        lessons: mkOpenLessons(["Come on in! · 第五十一课：进来吧！（元旦·梅去安娜家做客）", "Let me give you a hand. · 第五十二课：我来帮你（梅在琳达晚宴上帮忙）", "She's really kind. · 第五十三课：她人真好（梅给妈妈讲老师）", "What should I do? · 第五十四课：我该怎么办？（梅和安娜聊春节回不回国）", "Should I Go Home for Spring Festival? · 第五十五课：要不要回国过年？（梅的故事 · 第 11 章）"]) },
      { id: 12, title: "兴趣与休闲时光", desc: "Hobbies and free time", icon: "briefcase", iconBg: "bg-fuchsia-500", hours: "3.5小时",
        lessons: mkOpenLessons(["Can you help with the dishes? · 第五十六课：能帮我洗碗吗？（饭后家务·汤姆请梅帮忙）", "Cash or card? · 第五十七课：现金还是刷卡？（梅给妹妹挑生日礼物）", "I'd like to mail this. · 第五十八课：我想寄这个（梅把礼物寄给妹妹）", "I'm really sorry. · 第五十九课：我真的很抱歉（梅打破琳达的杯子）", "Chinese New Year in Chinatown · 第六十课：唐人街过年（梅的故事 · 第 12 章 · A1 收官）"]) },
    ],
  },
  {
    id: 2,
    name: "LEVEL 2",
    unitsCount: 18,
    gradient: "bg-grad-2",
    units: [
      { id: 1, title: "过去、习惯、当下与计划", desc: "Past, habits, now, and plans", icon: "star", iconBg: "bg-violet-500", hours: "2小时",
        lessons: mkOpenLessons(["How was your weekend? · 第一课:周末怎么样?(梅告诉安娜自己转正了)", "What do you usually do? · 第二课:你平时都做什么?(梅讲新作息)", "I'm still studying English. · 第三课:我还在学英语(梅升到中级班)", "They're going to visit me. · 第四课:他们要来看我了(梅父母计划来美国)", "One Year In: First Real Job · 第五课:满一年了——第一份正式工作（梅 Year 2 · 第 13 章）"]) },
      { id: 2, title: "描述、比较与解释", desc: "Describe, compare, and explain", icon: "book", iconBg: "bg-slate-600", hours: "2.5小时",
        lessons: mkOpenLessons(["There's a big supermarket nearby. · 第六课:附近有一家大超市(梅给爸妈选住的地方)", "How much is it? · 第七课:多少钱?(梅给爸妈来访前买折叠床)", "I like it because it's quiet. · 第八课:我喜欢这里,因为安静(梅在咖啡馆向安娜解释)", "What does she look like? · 第九课:她长什么样?(梅给妈妈介绍即将见面的人)", "Driving to LA · 第十课:开车去洛杉矶(梅 Year 2 · 第 14 章)"]) },
      { id: 3, title: "时态进阶、建议与未来", desc: "Deeper time, advice, futures", icon: "map", iconBg: "bg-sky-500", hours: "3小时",
        lessons: mkOpenLessons(["I was cooking when you called. · 第十一课:你打电话来时我正在做饭(爸妈到 SFO)", "I have worked there for one year. · 第十二课:我在那里工作一年了(梅带爸妈参观书店)", "This is the best coffee in town. · 第十三课:这是全城最好喝的咖啡(三家人在咖啡馆见面)", "You should rest. · 第十四课:你应该好好休息(爸妈走前最后一天)", "Going Home · 第十五课:回家(梅 Year 2 收官 · 第 15 章 · A2 capstone)"]) },
      { id: 4, title: "食物、问路与假设", desc: "Food, directions, and what-ifs", icon: "shop", iconBg: "bg-orange-500", hours: "3.5小时",
        lessons: mkOpenLessons(["A pizza and some water, please. · A2 第十六课：点一份披萨和一些水（可数/不可数）", "Go straight, then turn right. · A2 第十七课：直走然后右转（问路指路）", "Can I leave a message? · A2 第十八课：能留个口信吗？（电话交流）", "Have you ever been abroad? · A2 第十九课：你出过国吗？（现在完成时深化：ever / never / just / yet）", "If it rains, I'll stay home. · A2 第二十课：如果下雨我就待家里（第一条件句）"]) },
      { id: 5, title: "情感、方式与比较", desc: "Feelings, manner, and how they compare", icon: "cloud", iconBg: "bg-amber-500", hours: "2小时",
        lessons: mkOpenLessons(["I'm interested — it's interesting. · A2 第二十一课：我感兴趣 —— 它有意思（-ed / -ing 形容词）", "She speaks English fluently. · A2 第二十二课：她英语说得流利（副词）", "My bag is not as big as yours. · A2 第二十三课：我的包没你的大（as ... as 同级比较）", "I used to play tennis every week. · A2 第二十四课：我以前每周都打网球（used to 过去习惯）", "The man who lives next door. · A2 第二十五课：住隔壁那个人（关系代词基础）"]) },
      { id: 6, title: "动词、邀请、观点与旅行", desc: "Verbs, invitations, opinions, travel", icon: "briefcase", iconBg: "bg-rose-500", hours: "2.5小时",
        lessons: mkOpenLessons(["I want to travel. I love traveling. · A2 第二十六课：我想旅行、我爱旅行（动词 + to / 动词 + -ing）", "Would you like to come to dinner? · A2 第二十七课：想来吃晚饭吗？（would like 礼貌邀请）", "Let's grab coffee sometime! · A2 第二十八课：找时间去喝咖啡！（提建议）", "I think the food is great. · A2 第二十九课：我觉得这菜很棒（表达观点）", "Checking in at the airport. · A2 第三十课：在机场办理登机（综合情景）"]) },
      { id: 7, title: "假设、义务与可能性", desc: "Hypotheticals, obligation, possibility", icon: "star", iconBg: "bg-cyan-500", hours: "3小时",
        lessons: mkOpenLessons(["If I were rich, I would travel. · A2 第三十一课：如果我有钱，我会旅行（第二条件句 · 假设）", "I have to finish this today. · A2 第三十二课：我今天必须完成（must / have to 义务表达）", "It might rain this afternoon. · A2 第三十三课：下午可能下雨（might / may / could 可能性）", "The package was delivered yesterday. · A2 第三十四课：包裹昨天送到了（被动语态入门）", "She said she was tired. · A2 第三十五课：她说她累了（间接引语入门）"]) },
      { id: 8, title: "介词、日常与健康", desc: "Prepositions, routines, health", icon: "book", iconBg: "bg-indigo-500", hours: "3.5小时",
        lessons: mkOpenLessons(["In July, on Monday, at 9 AM. · A2 第三十六课：in / on / at 时间介词", "I got up late and ran out of the house. · A2 第三十七课：我起晚了，冲出家门（核心短语动词）", "I've had a sore throat for two days. · A2 第三十八课：我喉咙痛两天了（症状详细描述）", "Put on a coat — it's freezing! · A2 第三十九课：穿上外套 —— 好冷！（天气 + 衣物）", "My phone just died! · A2 第四十课：我手机没电了！（科技与设备）"]) },
      { id: 9, title: "工作、金钱、交通与购物", desc: "Work, money, transport, shopping", icon: "map", iconBg: "bg-emerald-600", hours: "2小时",
        lessons: mkOpenLessons(["I work as a designer. · A2 第四十一课：我是个设计师（工作和职业）", "Can I pay in cash? · A2 第四十二课：能现金支付吗？（银行与付款）", "I missed the last bus. · A2 第四十三课：我错过了末班车（交通问题与解决）", "What size is this shirt? · A2 第四十四课：这件衬衫什么尺码？（衣服购物细节）", "Could I see the menu, please? · A2 第四十五课：请给我看下菜单（餐厅情境综合）"]) },
      { id: 10, title: "兴趣、世界、人与情感", desc: "Interests, world, people, feelings", icon: "shop", iconBg: "bg-indigo-600", hours: "2.5小时",
        lessons: mkOpenLessons(["I'm into photography. · A2 第四十六课：我迷上摄影了（兴趣爱好深度）", "We should recycle more. · A2 第四十七课：我们应该多回收（环保基础）", "According to the news... · A2 第四十八课：据新闻报道……（新闻与时事）", "He reminds me of my dad. · A2 第四十九课：他让我想起爸爸（家庭和关系细腻表达）", "I'm feeling under the weather. · A2 第五十课：我不太舒服（情感与地道表达综合）"]) },
      { id: 11, title: "偏好、量词与回应", desc: "Preferences, quantifiers, responses", icon: "cloud", iconBg: "bg-sky-600", hours: "3小时",
        lessons: mkOpenLessons(["I prefer tea to coffee. · A2 第五十一课：我更喜欢茶（prefer / would rather 偏好）", "Someone is at the door. · A2 第五十二课：有人在门口（不定代词 someone / anyone / no one）", "Both of my sisters speak French. · A2 第五十三课：我两个姐妹都会法语（both / either / neither）", "So do I! Me neither. · A2 第五十四课：我也是！我也不（表达同感）", "It's too cold. Not warm enough. · A2 第五十五课：太冷了 / 不够暖（too / enough 程度）"]) },
      { id: 12, title: "强调词、反身代词与闲谈", desc: "Intensifiers, reflexives, small talk", icon: "briefcase", iconBg: "bg-emerald-700", hours: "3.5小时",
        lessons: mkOpenLessons(["What a great day! · A2 第五十六课：真是美好的一天！（感叹 so / such / what a）", "I hurt myself. · A2 第五十七课：我弄伤了自己（反身代词 myself / yourself）", "A little milk, a few cookies. · A2 第五十八课：一点牛奶，几块饼干（little / few 细分量）", "How was your day? · A2 第五十九课：今天过得怎样？（地道闲聊 / 小 talk）", "Let's cook pasta together! · A2 第六十课：我们一起做意面！（烹饪综合 / A2 毕业）"]) },
      { id: 13, title: "反义疑问句、代词与使役动词", desc: "Tags, pronouns, causatives", icon: "star", iconBg: "bg-fuchsia-500", hours: "2小时",
        lessons: mkOpenLessons(["It's cold, isn't it? · A2 第六十一课：天冷，是不是？（反意疑问句 / Question Tags）", "I'll take the red one. · A2 第六十二课：我要红色那件（one / ones 避免重复）", "My mom let me drive. · A2 第六十三课：我妈让我开车（let / make / help + 宾语 + 动词原形）", "What's the word for...? · A2 第六十四课：那个词叫什么来着？（不知道单词时的说法）", "Sorry, could you repeat that? · A2 第六十五课：抱歉，能再说一遍吗？（没听懂时）"]) },
      { id: 14, title: "生存技能与讲故事", desc: "Survival skills & storytelling", icon: "book", iconBg: "bg-lime-600", hours: "2.5小时",
        lessons: mkOpenLessons(["I'd like to make a complaint. · A2 第六十六课：我想投诉一下（礼貌抱怨）", "Is it okay if I sit here? · A2 第六十七课：我坐这儿可以吗？（请求许可）", "She was born in 1995. · A2 第六十八课：她 1995 年出生（讲述人生经历）", "It's getting colder. · A2 第六十九课：天越来越冷（描述渐变）", "I'm into action movies. · A2 第七十课：我迷动作片（娱乐类话题）"]) },
      { id: 15, title: "量词、固定搭配与情态动词", desc: "Quantifiers, collocations, modals", icon: "map", iconBg: "bg-fuchsia-600", hours: "3小时",
        lessons: mkOpenLessons(["A lot of people, plenty of time. · A2 第七十一课：很多人，充足的时间（量词短语）", "I depend on coffee every morning. · A2 第七十二课：我每天靠咖啡（动词 + 介词固定搭配）", "I'm good at cooking. · A2 第七十三课：我擅长做饭（形容词 + 介词搭配）", "This must be done by Friday. · A2 第七十四课：这个周五前必须完成（情态动词 + 被动）", "The place where I grew up. · A2 第七十五课：我长大的地方（where / when 定语从句）"]) },
      { id: 16, title: "风格、仪式与告别", desc: "Style, rituals, and farewells", icon: "shop", iconBg: "bg-violet-600", hours: "3.5小时",
        lessons: mkOpenLessons(["A beautiful old wooden chair. · A2 第七十六课：一把漂亮的老木椅（形容词顺序）", "Happy Birthday! Here's a gift for you. · A2 第七十七课：生日快乐！送你个礼物（节日 / 庆祝 / 送礼）", "I'd like a room with a view. · A2 第七十八课：想要一个有景观的房间（酒店入住细节）", "You're kidding! · A2 第七十九课：你开玩笑吧！（惊讶、赞美、反应）", "Let's stay in touch. · A2 第八十课：保持联系（告别 / 维持连接）"]) },
      { id: 17, title: "进阶语法精通", desc: "Deeper grammar mastery", icon: "cloud", iconBg: "bg-slate-700", hours: "2小时",
        lessons: mkOpenLessons(["I've been waiting for an hour! · A2 第八十一课：我已经等了一小时了！（现在完成进行时）", "The more you practice, the better you get. · A2 第八十二课：练得越多，越进步（the + 比较级 + the + 比较级）", "It must be her — only she knows! · A2 第八十三课：肯定是她 —— 只有她知道！（推测情态动词）", "A dog, the dog, or just dogs? · A2 第八十四课：a / an / the / 零冠词（冠词系统）", "I used to play basketball every day. · A2 第八十五课：我以前每天打篮球（used to vs would）"]) },
      { id: 18, title: "礼貌、场景与 A2 毕业", desc: "Politeness, scenes, and graduation", icon: "briefcase", iconBg: "bg-rose-600", hours: "2.5小时",
        lessons: mkOpenLessons(["Could you tell me where the station is? · A2 第八十六课：能告诉我车站在哪吗？（间接问句）", "What a voice! She's so talented. · A2 第八十七课：多好的嗓子！她太有天赋（描述 + 赞叹）", "I play basketball three times a week. · A2 第八十八课：我一周打三次篮球（运动与健康）", "Can I help you with that? · A2 第八十九课：我能帮忙吗？（主动提供帮助）", "That's a wrap — my A2 journey. · A2 第九十课：这就结束了 —— 我的 A2 之旅（A2 毕业 + B1 预览）"]) },
    ],
  },
  {
    id: 3,
    name: "LEVEL 3",
    unitsCount: 18,
    gradient: "bg-grad-3",
    units: [
      { id: 1, title: "过去完成时叙事与推理", desc: "Past-perfect storytelling & reasoning", icon: "star", iconBg: "bg-violet-600", hours: "2小时",
        lessons: mkOpenLessons(["I had already left when you called. · 第一课:你打来时我已经走了(梅错过 Linda 的电话)", "She said she had already decided. · 第二课:她说她已经决定了(薇说要来美国读高中)", "If I had known, I would have helped. · 第三课:要是我知道,就一定帮忙了(梅得知 Anna 申请被拒)", "You should have told me sooner. · 第四课:你早该告诉我的(梅与安娜的小修复)", "The Last Leaf · 第五课：最后一片叶子（O. Henry · 单元1故事·让步连接词）"]) },
      { id: 2, title: "职场沟通基础", desc: "Workplace communication basics", icon: "book", iconBg: "bg-slate-700", hours: "2.5小时",
        lessons: mkOpenLessons(["According to the article, the school accepts 12%. · 第六课:报道说,这所学校录取率 12%(梅研究薇申请的高中)", "Could we schedule a tour next Tuesday? · 第七课:我们能下周二参观一下吗?(梅打电话给薇申请的学校)", "I'm not so sure about that. · 第八课:我不太同意(梅和妈妈温和地分歧)", "The decision was made together. · 第九课:这个决定是大家一起做的(薇正式来美国前的家庭决定)", "The Necklace · 第十课：项链（Maupassant · 单元2故事·叙事时态混搭）"]) },
      { id: 3, title: "深入提问、新闻与正式书写", desc: "Probing, news & formal writing", icon: "map", iconBg: "bg-indigo-600", hours: "3小时",
        lessons: mkOpenLessons(["Could you elaborate on that? · 第十一课:你能再详细说说吗?(梅听薇讲录取细节)", "Breaking news: Wei chose Riverside. · 第十二课:重大消息:薇选了 Riverside(梅向 Walker 一家宣布)", "What a moment! · 第十三课:多么珍贵的时刻!(梅在 SFO 接到薇)", "To whom it may concern. · 第十四课:致相关负责人(梅替薇给学校写正式邮件)", "The Lottery Ticket · 第十五课：彩票（Chekhov · 单元3故事·非人称被动）"]) },
      { id: 4, title: "定语从句与投诉表达", desc: "Relative clauses & complaints", icon: "shop", iconBg: "bg-cyan-600", hours: "3.5小时",
        lessons: mkOpenLessons(["The Thanksgiving dinner, which lasted four hours, was wonderful. · 第十六课:那顿四小时的感恩节晚饭,真好(梅家三人在 Walker 家过感恩节)", "I can't focus with the noise. · 第十七课:这么吵我没办法专心(梅和薇第一次小磨合)", "Have you heard the news? · 第十八课:你听说了吗?(Anna 收到社区学院护理项目录取)", "I regret not telling them sooner. · 第十九课:我后悔没早点告诉他们(梅终于开口说要读研)", "The Gift of the Magi · 第二十课：麦琪的礼物（O. Henry · B1 中期总结·全套语法）"]) },
      { id: 5, title: "间接命令与强烈愿望", desc: "Reported commands & strong wishes", icon: "cloud", iconBg: "bg-indigo-700", hours: "2小时",
        lessons: mkOpenLessons(["She told me not to worry. · 第二十一课:她让我别担心(梅向 Sarah 求推荐信)", "I wish he would stop calling so much. · 第二十二课:我希望他别打这么多电话(梅复习 GRE 时爸爸天天打来)", "If only I had more time. · 第二十三课:要是我有更多时间就好了(梅提交申请前夜的自我怀疑)", "Whoever you become, we are proud. · 第二十四课:不管你成为谁,我们都骄傲(申请提交后的家庭视频)", "The Open Window · 第二十五课：敞开的窗户（Saki · 单元5故事·强调最高级 + -ever）"]) },
      { id: 6, title: "条件句与短语动词", desc: "Conditionals & phrasal verbs", icon: "briefcase", iconBg: "bg-sky-700", hours: "2.5小时",
        lessons: mkOpenLessons(["As long as you tried, you didn't waste anything. · 第二十六课:只要你认真试过,就不算白费(琳达和梅在等录取通知)", "I need to get my car fixed. · 第二十七课:我得把车修一下(梅旧车出毛病·小事故让她暂时分心)", "Having waited for weeks, I finally got the email. · 第二十八课:等了好几周,终于收到邮件(梅收到第一封录取通知)", "Can you back me up on this? · 第二十九课:这事你能站我这边吗?(梅有两个录取,需要琳达的视角)", "The Wolf and the Lamb · 第三十课：狼与小羊（Aesop·B1 扩写版·使役动词 + 分词短语）"]) },
      { id: 7, title: "倒装、强调与演讲", desc: "Inversion, emphasis & presenting", icon: "star", iconBg: "bg-rose-600", hours: "3小时",
        lessons: mkOpenLessons(["Hardly had I sat down when the answer came. · 第三十一课:我刚坐下答案就来了(梅在公园做出决定)", "I remember meeting you here. · 第三十二课:我记得在这里第一次见到你(梅向 Sarah 告别)", "It was Anna who saved me. · 第三十三课:是安娜救了我(梅给安娜的告别信)", "Let's meet halfway. · 第三十四课:咱们各让一步(薇要搬去寄宿家庭·梅放手)", "A Cup of Tea · 第三十五课：一杯茶（Katherine Mansfield · 单元7故事·演示三段式信号词）"]) },
      { id: 8, title: "报告、文化与评论", desc: "Reports, culture & reviews", icon: "book", iconBg: "bg-emerald-700", hours: "3.5小时",
        lessons: mkOpenLessons(["This list outlines my new life. · 第三十六课:这张清单概括我的新生活(梅在 SF 公寓写下新生活)", "I miss the bookstore. · 第三十七课:我想念那家书店(梅在新城市的小思乡)", "The Bay Area is the most diverse place I know. · 第三十八课:湾区是我知道的最多元的地方(梅在课堂自我介绍)", "San Francisco is famous for its fog. · 第三十九课:旧金山的雾很出名(梅在新公寓认识室友 Priya)", "The Tell-Tale Heart · 第四十课：告密的心（Poe·B1 简化版·评论与反思句型）"]) },
      { id: 9, title: "情感、关系与习惯", desc: "Emotions, relationships & habits", icon: "map", iconBg: "bg-sky-500", hours: "2小时",
        lessons: mkOpenLessons(["I've been feeling overwhelmed lately. · 第四十一课:最近压力很大(梅在新学期撑不住了)", "Real friends show up when it matters. · 第四十二课:真朋友会在关键时刻出现(Priya 在梅崩溃那晚陪她)", "Anna got married last spring. · 第四十三课:安娜春天结婚了(梅周末视频补朋友的近况)", "Rest isn't a luxury. · 第四十四课:休息不是奢侈(梅 10 月底的反思)", "The Magic of Small Habits · 第四十五课：小习惯的魔法（原创·B1·习惯复利）"]) },
      { id: 10, title: "科技、身心健康与教育", desc: "Tech, wellbeing & education", icon: "shop", iconBg: "bg-emerald-500", hours: "2.5小时",
        lessons: mkOpenLessons(["Mental health deserves the same care. · 第四十六课:心理健康也值得同样的关心(梅第一篇论文不及格)", "Technology shapes how we live. · 第四十七课:科技塑造我们的生活方式(琳达体检发现心律问题)", "Social media rewards outrage. · 第四十八课:社交媒体奖励愤怒(梅给薇讲网络暴力)", "Education extends beyond the classroom. · 第四十九课:教育不止于教室(梅开始当家教)", "After Twenty Years · 第五十课：二十年后（B1 单元10故事 · O. Henry 简化版）"]) },
      { id: 11, title: "混合条件句与时间叙事", desc: "Mixed conditionals & narrative time", icon: "cloud", iconBg: "bg-pink-500", hours: "3小时",
        lessons: mkOpenLessons(["The news broke while I was studying. · 第五十一课:消息传来时我在复习(奶奶中风)", "Had I known, I would have called more. · 第五十二课:早知道我就多打电话了(梅在北京医院握奶奶的手)", "I wish I'd visited her last summer. · 第五十三课:我真希望去年夏天回来看她(梅在医院走廊的反思)", "There's no use arguing. · 第五十四课:没必要再争(梅和爸爸在病房旁的对话)", "Cat in the Rain · 第五十五课：雨中的猫（B1 单元11故事 · Hemingway 简化版）"]) },
      { id: 12, title: "高级连接词与强调结构", desc: "Advanced connectors & emphasis", icon: "briefcase", iconBg: "bg-emerald-500", hours: "3.5小时",
        lessons: mkOpenLessons(["Wei is said to be the top student. · 第五十六课:大家说薇是年级第一(梅在 SF 收到 Wei 学校的邮件)", "The more I rest, the better I do. · 第五十七课:休息越多,做得越好(梅的复利哲学)", "So good was the news that Linda threw a party. · 第五十八课:消息这么好,琳达办了个聚会(琳达康复仪式)", "Regardless of where I end up. · 第五十九课:不管我最终在哪里(梅的春天小总结)", "The Bet · 第六十课：赌约（B1 单元12故事 · Chekhov 简化版）"]) },
      { id: 13, title: "省略、强调与得体表达", desc: "Reduction, emphasis & polite style", icon: "star", iconBg: "bg-fuchsia-500", hours: "2小时",
        lessons: mkOpenLessons(["The story written by Wei is brilliant. · 第六十一课:薇写的故事真出彩(梅读到妹妹的获奖文章)", "I'd rather stay in tonight. · 第六十二课:我今晚想待在家里(梅在实习开始前自我照顾)", "I do appreciate your patience. · 第六十三课:我真的很感谢您的耐心(梅在实习里向上司致谢)", "I was wondering if you could help. · 第六十四课:我想问能不能帮个忙(梅请 Sarah 帮看简历)", "Lamb to the Slaughter · 第六十五课：杀人的羊腿（B1 单元13故事 · Roald Dahl 简化版）"]) },
      { id: 14, title: "庆祝场合与专业表达", desc: "Celebrations & professional voice", icon: "book", iconBg: "bg-orange-500", hours: "2.5小时",
        lessons: mkOpenLessons(["Congratulations are in order. · 第六十六课:该恭喜你了(梅拿到秋季研究助理 offer)", "Let me sleep on it. · 第六十七课:让我考虑一晚(梅面对一个选择:留 SF 还是搬走)", "I'm fed up with this class. · 第六十八课:这门课我受够了(梅在最后一年的小崩溃)", "Let's follow up next week. · 第六十九课:下周再跟进(梅和教授的对话)", "The Selfish Giant · 第七十课：自私的巨人（B1 单元14故事 · Wilde 简化版）"]) },
      { id: 15, title: "全球议题与职业场景", desc: "Global debate & professional settings", icon: "map", iconBg: "bg-violet-700", hours: "3小时",
        lessons: mkOpenLessons(["Global health issues connect us all. · 第七十一课:全球健康问题把我们连在一起(梅选论文题目)", "Let me play devil's advocate. · 第七十二课:我来唱反调(Priya 帮梅练答辩)", "Imagine a world where asking is easy. · 第七十三课:想象一个求助容易的世界(梅论文引言)", "According to recent research... · 第七十四课:根据最近的研究(梅论文中段·引用与数据)", "The Bottle Imp · 第七十五课：瓶中精灵（B1 单元15故事 · Stevenson 简化版）"]) },
      { id: 16, title: "会议、叙事与观点", desc: "Meetings, storytelling & opinions", icon: "shop", iconBg: "bg-sky-600", hours: "3.5小时",
        lessons: mkOpenLessons(["Let me address that concern directly. · 第七十六课:请允许我直接回应这个问题(梅论文反馈会)", "Have you considered another angle? · 第七十七课:你考虑过另一个角度吗?(琳达的小问题)", "Once upon a time, there was a girl. · 第七十八课:从前有一个女孩(梅给论文加叙事开篇)", "By 2030, I will have built something. · 第七十九课:到 2030 年我会建起些东西(梅写最后一章)", "The Cop and the Anthem · 第八十课：警察与赞美诗（B1 单元16故事 · O. Henry 简化版）"]) },
      { id: 17, title: "修补、澄清与衔接", desc: "Repair, clarify & connect", icon: "cloud", iconBg: "bg-indigo-500", hours: "2小时",
        lessons: mkOpenLessons(["I owe you an apology — a real one. · 第八十一课:我欠你一个道歉——一个真正的(梅在答辩前给爸爸打电话)", "Let's find common ground. · 第八十二课:咱们找到共识(答辩日 · 一位委员的质询)", "Could you say that more slowly? · 第八十三课:能再慢点说吗?(梅父母为毕业典礼来美)", "Crazy weather we're having! · 第八十四课:这天气真奇怪!(父亲学美式闲聊)", "A Letter to God · 第八十五课：写给上帝的信（B1 单元17故事 · López y Fuentes 简化版）"]) },
      { id: 18, title: "修辞、价值观与 B2 备考", desc: "Rhetoric, values & B2 readiness", icon: "briefcase", iconBg: "bg-fuchsia-600", hours: "2.5小时",
        lessons: mkOpenLessons(["Let me check — is it Ms. or Mrs.? · 第八十六课:让我确认一下——是 Ms. 还是 Mrs.?(毕业典礼前的小事)", "Dignity is non-negotiable. · 第八十七课:尊严不能让步(梅毕业前的第一次正式工作面试)", "I came, I struggled, I stayed. · 第八十八课:我来了,我挣扎过,我留下了(梅毕业典礼发言稿)", "Let's review everything we've learned. · 第八十九课:让我们回顾我们学到的一切(梅 L3 终章 · 最后一节非 review 课)", "Where Love Is, There God Is Also · 第九十课：爱在何处，神就在何处（B1 毕业故事 · Tolstoy 简化版）"]) },
    ],
  },
  {
    id: 4,
    name: "LEVEL 4",
    unitsCount: 18,
    gradient: "bg-grad-4",
    units: [
      { id: 1, title: "复杂句法与倒装", desc: "Complex syntax & inversion", icon: "star", iconBg: "bg-violet-700", hours: "2小时",
        lessons: mkOpenLessons(["The worst advice I gave for ten years · B2 第1课：我做了十年的错事（倒装句·否定副词前置） · 主旨：别再对孩子说\"做到你最好\"", "What the diaries said · B2 第2课：日记里的母亲（强调句型·分裂句） · 主旨：我多年来的\"完美母亲\"叙事，是为我自己服务的", "The journal I shouldn't have reread · B2 第3课：那本不该重读的日记（混合条件句） · 主旨：大多数\"如果当年我\"是事后写出来的虚构", "I gave no TED talk · B2 第4课：我没去做 TED 演讲（虚拟语气·建议/命令后） · 主旨：举报真相后多半没有掌声；你还是该举报", "The lie is the date · B2 第5课：撒谎的不是文字而是日期（分词短语） · 主旨：旅居写作多半在第六个月撒谎；只有第一周是真的"]) },
      { id: 2, title: "语篇与语域", desc: "Discourse & register", icon: "book", iconBg: "bg-slate-800", hours: "2.5小时",
        lessons: mkOpenLessons(["Two texts about the same fire · B2 第6课：关于同一场火灾的两条信息（正式与口语语域）", "Why everyone got General Thomas wrong · B2 第7课：为什么人人都搞错了托马斯将军（高阶连接词）", "The forecaster who learned to say \"probably\" · B2 第8课：学会说\"可能\"的天气预报员（谨慎表达）", "The translator who saved ten minutes · B2 第9课：那位争取到十分钟的翻译（改述与总结）", "The detective and the missing thread · B2 第10课：侦探与缺失的线索（语篇衔接手段）"]) },
      { id: 3, title: "科技与人工智能", desc: "Technology & AI", icon: "map", iconBg: "bg-indigo-700", hours: "3小时",
        lessons: mkOpenLessons(["Grandma and the chatbot · B2 第11课：外婆与聊天机器人（AI/科技话语）", "How a small bookstore beat Amazon · B2 第12课：小书店如何战胜亚马逊（被动与因果） · 主旨：算法卖不了\"读过这本书的真人\"", "Sixty seconds of you being watched · B2 第13课：你被观察的六十秒（现在进行被动态）", "The town that quietly disappeared · B2 第14课：悄悄消失的小镇（现在完成 + 变化动词）", "The poem the AI refused to write · B2 第15课：AI 拒绝写的那首诗（单元一回顾·AI 伦理）"]) },
      { id: 4, title: "环境与气候", desc: "Environment & climate", icon: "shop", iconBg: "bg-sky-700", hours: "3.5小时",
        lessons: mkOpenLessons(["The glaciologist's last count · B2 第16课：冰川学家最后一次清点（比较级与最高级高阶用法）", "What has changed in the village · B2 第17课：村子里，什么变了（现在完成时·进展与变化）", "A Queens wedding in three languages · B2 第18课：皇后区的一场三语婚礼（定语从句·限定与非限定）", "Cecilia's two percent · B2 第19课：塞西莉亚的百分之二（量化表达·规模与比例）", "Mr. Okonkwo, town arborist · Unit 4 review · B2 第20课：奥孔克沃先生·城里的护树人 · 单元4回顾"]) },
      { id: 5, title: "职业发展", desc: "Career development", icon: "cloud", iconBg: "bg-indigo-800", hours: "2小时",
        lessons: mkOpenLessons(["What Margaret brought to the interview · B2 第21课：玛格丽特带去面试的那些东西（面试叙事框架）", "Eight years at Carlo's Auto · B2 第22课：在卡洛车行的八年（谈判话语策略）", "The woman who read books at networking events · B2 第23课：在社交活动上读书的那位女士（not just A but B — 否定递进）", "Wei Li's small bowl of noodles · B2 第24课：魏丽的一碗面（长期/阶段描述）", "Tuesday, 3:14 p.m., at Eli's Coffee · Unit 5 review · B2 第25课：周二下午三点十四分，在 Eli 咖啡馆 · 单元5回顾"]) },
      { id: 6, title: "媒介素养", desc: "Media literacy", icon: "briefcase", iconBg: "bg-cyan-700", hours: "2.5小时",
        lessons: mkOpenLessons(["The morning my father died, twice · B2 第26课：父亲死了两次的那个早晨（部分否定）", "The Gift of the Magi · B2 第27课：麦琪的礼物（名物化）", "Warrior 217 · B2 第28课：兵马俑 217 号（区分主观与客观）", "What the phone knew first · B2 第29课：手机最先知道的事（缩减关系从句）", "Six things my granddaughter should know · Unit 6 review · B2 第30课：给孙女的六件事 · 单元6回顾"]) },
      { id: 7, title: "文化与身份", desc: "Culture & identity", icon: "star", iconBg: "bg-emerald-800", hours: "3小时",
        lessons: mkOpenLessons(["The shoemaker on Calle Bolivar · B2 第31课：玻利瓦尔街上的鞋匠（对比结构）", "When grandma moved into our spare room · B2 第32课：奶奶搬进我们的小书房（复合形容词）", "My father's three jobs · B2 第33课：父亲的三份工作（目的与程度）", "Grandpa, \"rizz,\" and other words I had to look up · B2 第34课：爷爷、\"rizz\"，以及其他我不得不查的词（同位语与简介）", "The interpreter who lost a language · Unit 7 review · B2 第35课：失去一种语言的口译员 · 单元7回顾"]) },
      { id: 8, title: "科学与创新", desc: "Science & innovation", icon: "book", iconBg: "bg-emerald-900", hours: "3.5小时",
        lessons: mkOpenLessons(["My grandmother's tea · B2 第36课：奶奶的那杯茶（科学高频搭配）", "Ms. Vega's third-grade space lecture · B2 第37课：维加女士给三年级讲的太空课（修辞疑问）", "The second baby · B2 第38课：第二个孩子（建议与义务）", "Mrs. Patel and the kindness experiment · B2 第39课：帕特尔老师和\"善意实验\"（if-then 逻辑）", "The Alzheimer's researcher · Unit 8 review · B2 第40课：阿尔茨海默症研究员 · 单元8回顾"]) },
      { id: 9, title: "经济与金融", desc: "Economics & finance", icon: "map", iconBg: "bg-slate-700", hours: "2小时",
        lessons: mkOpenLessons(["The Fir Tree · B2 第41课：那棵小冷杉（动词搭配 · 愿望与代价）", "The Necklace · B2 第42课：那串项链（描述趋势 · 时间与变化）", "How Much Land Does a Man Need? · B2 第43课：一个人需要多少土地？（间接疑问句）", "Marley's chain · B2 第44课：马利的锁链（情态完成式 should/could/would have V-ed）", "The Bet · Unit 9 review · B2 第45课：那场赌注 · 单元9回顾（钱与价值）"]) },
      { id: 10, title: "政治与社会", desc: "Politics & society", icon: "shop", iconBg: "bg-violet-800", hours: "2.5小时",
        lessons: mkOpenLessons(["The Three Questions · B2 第46课：三个问题（建议与劝告语气）", "The Open Window · B2 第47课：开着的那扇窗（间接引语·讲故事）", "The Selfish Giant · B2 第48课：自私的巨人（过去完成时进阶）", "The Cop and the Anthem · B2 第49课：警察与赞美诗（让步状语从句）", "The Lottery Ticket · Unit 10 review · B2 第50课：那张彩票 · 单元10回顾（社会与人生）"]) },
      { id: 11, title: "艺术与文学", desc: "Arts & literature", icon: "cloud", iconBg: "bg-fuchsia-700", hours: "3小时",
        lessons: mkOpenLessons(["The Nightingale and the Rose · B2 第51课：夜莺与玫瑰（现在分词独立结构）", "The Last Leaf · B2 第52课：最后一片叶子（强调与倒装进阶）", "A Sound of Thunder · B2 第53课：雷霆之声（高级条件句）", "The Story of an Hour · B2 第54课：一小时的故事（自由间接引语）", "Eveline · Unit 11 review · B2 第55课：伊芙琳 · 单元11回顾（艺术与文学）"]) },
      { id: 12, title: "心理与心智", desc: "Psychology & the mind", icon: "briefcase", iconBg: "bg-emerald-600", hours: "3.5小时",
        lessons: mkOpenLessons(["The Tell-Tale Heart · B2 第56课：告密的心（现在时叙事 + 强调修辞）", "After Twenty Years · B2 第57课：二十年后（对比与比较结构）", "A Christmas Memory · B2 第58课：圣诞记忆（习惯过去时 would / used to）", "An Occurrence at Owl Creek Bridge · B2 第59课：猫头鹰溪桥事件（委婉与模糊语言）", "The Monkey's Paw · Unit 12 review · B2 第60课：猴爪 · 单元12回顾（恐怖与心理）"]) },
      { id: 13, title: "教育与学习", desc: "Education & learning", icon: "star", iconBg: "bg-indigo-500", hours: "2小时",
        lessons: mkOpenLessons(["Young Goodman Brown · B2 第61课：年轻的古德曼·布朗（衔接连接词）", "The Garden Party · B2 第62课：花园派对（简化关系从句）", "The Lady or the Tiger? · B2 第63课：美女还是老虎？（正式英语虚拟语气）", "Araby · B2 第64课：阿拉比（非真实虚拟·wish / if only）", "Sredni Vashtar · Unit 13 review · B2 第65课：斯雷德尼·瓦什塔 · 单元13回顾"]) },
      { id: 14, title: "全球议题", desc: "Global issues", icon: "book", iconBg: "bg-cyan-800", hours: "2.5小时",
        lessons: mkOpenLessons(["The Devil and Daniel Webster · B2 第66课：魔鬼与丹尼尔·韦伯斯特（报告动词的细分）", "The Lottery · B2 第67课：抽签（do/did 强调）", "The Most Dangerous Game · B2 第68课：最危险的猎物（高阶搭配）", "The Use of Force · B2 第69课：动用武力（wh-cleft 分裂句）", "The Catbird Seat · Unit 14 review · B2 第70课：占上风的人 · 单元14回顾"]) },
      { id: 15, title: "商业与领导力", desc: "Business & leadership", icon: "map", iconBg: "bg-rose-700", hours: "3小时",
        lessons: mkOpenLessons(["Roman Fever · B2 第71课：罗马热（介词关系从句）", "The Door in the Wall · B2 第72课：墙上的那扇门（as if / as though 假设比较）", "The Adventure of the Speckled Band · B2 第73课：斑点带历险（推测情态）", "A Rose for Emily · B2 第74课：献给艾米丽的一朵玫瑰（进阶比较结构）", "The Story of My Dovecot · Unit 15 review · B2 第75课：我那座鸽舍 · 单元15回顾"]) },
      { id: 16, title: "哲学与伦理", desc: "Philosophy & ethics", icon: "shop", iconBg: "bg-pink-600", hours: "3.5小时",
        lessons: mkOpenLessons(["The Five Orange Pips · B2 第76课：五颗橘核（省略与替代）", "The Veldt · B2 第77课：草原（介词 + 动名词搭配）", "The Lottery in Babylon · B2 第78课：巴比伦的彩票（含义转折与让步副词）", "The Yellow Wallpaper · B2 第79课：黄色墙纸（被动语态进阶）", "Cathedral · Unit 16 review · B2 第80课：大教堂 · 单元16回顾"]) },
      { id: 17, title: "进阶语法精通", desc: "Advanced grammar mastery", icon: "cloud", iconBg: "bg-slate-600", hours: "2小时",
        lessons: mkOpenLessons(["The Hare's Race · B2 第81课：野兔的赛跑（不定式深化）", "On the Duty of Civil Disobedience · B2 第82课：论公民不服从（抽象名词化）", "The Dead · Unit 17 review · B2 第83课：死者 · 单元17回顾", "The Lumber-Room · B2 第84课：杂物间（进阶感叹与强调）", "The Verger · Unit 18 review · B2 第85课：教堂司事 · 单元18回顾"]) },
      { id: 18, title: "毕业课与 B2 收官", desc: "Capstone & B2 send-off", icon: "briefcase", iconBg: "bg-emerald-700", hours: "2.5小时",
        lessons: mkOpenLessons(["The Open Boat · B2 第86课：救生船（词序与信息焦点）", "Babylon Revisited · B2 第87课：重返巴比伦（词汇升级 B2→C1）", "The Standard of Living · Unit 19 review · B2 第88课：生活水平 · 单元19回顾", "In Another Country · B2 第89课：在异国他乡（弱化与反讽）", "The Death of the Moth · Capstone · B2 第90课：飞蛾之死 · 收官（B2→C1 过渡）"]) },
    ],
  },
  { id: 5, name: "LEVEL 5", unitsCount: 22, gradient: "bg-grad-5", units: [] },
  { id: 6, name: "LEVEL 6", unitsCount: 25, gradient: "bg-grad-6", units: [] },
];

export const LESSON_STEPS = [
  { id: 1, cn: "词汇学习", en: "Vocabulary", icon: "BookOpen" },
  { id: 2, cn: "词汇测试", en: "Vocab Quiz", icon: "Target" },
  { id: 3, cn: "课文阅读", en: "Reading", icon: "Book" },
  { id: 4, cn: "语法重点", en: "Grammar", icon: "FileText" },
  { id: 5, cn: "实用表达", en: "Expressions", icon: "MessageCircle" },
  { id: 6, cn: "选词填空", en: "Fill-in", icon: "Pencil" },
  { id: 7, cn: "阅读测验", en: "Quiz", icon: "HelpCircle" },
  { id: 8, cn: "听力填空", en: "Listening", icon: "Headphones" },
  { id: 9, cn: "实战产出", en: "Output", icon: "Mic" },
] as const;

export type VocabItem = {
  word: string;
  pron: string;
  meaning: string;
  example: string;
  example_cn: string;
};

export type Quiz = {
  q: string;
  options: string[];
  answer: number; // index
  explain?: string;
};

export type FillBlank = {
  sentence: string; // use ___ as blank
  cn: string;
  options: string[];
  answer: string;
};

export type LessonContent = {
  vocab: VocabItem[];
  reading: { en: string; cn: string }[]; // paragraphs
  grammar: { title: string; explain: string; examples: { en: string; cn: string }[] }[];
  expressions: { en: string; cn: string; scene: string }[];
  fillBlanks: FillBlank[];
  quiz: Quiz[];
  listening: { audio: string; blanks: { before: string; answer: string; after: string }[] };
  output: { prompt: string; cn: string; sample: string };
};

const buildLessonContent = (title: string): LessonContent => ({
  vocab: [
    { word: "topic", pron: "/ˈtɑːpɪk/", meaning: "n. 主题", example: `Today's topic is ${title}.`, example_cn: `今天的主题是${title}。` },
    { word: "practice", pron: "/ˈpræktɪs/", meaning: "v./n. 练习", example: "I practice English every day.", example_cn: "我每天练习英语。" },
    { word: "question", pron: "/ˈkwestʃən/", meaning: "n. 问题", example: "Can I ask a question?", example_cn: "我可以问一个问题吗？" },
    { word: "answer", pron: "/ˈænsər/", meaning: "v./n. 回答", example: "Please answer in English.", example_cn: "请用英语回答。" },
    { word: "need", pron: "/niːd/", meaning: "v. 需要", example: "I need some help.", example_cn: "我需要一些帮助。" },
    { word: "want", pron: "/wɑːnt/", meaning: "v. 想要", example: "I want to learn more.", example_cn: "我想学更多。" },
    { word: "easy", pron: "/ˈiːzi/", meaning: "adj. 容易的", example: "This sentence is easy.", example_cn: "这个句子很简单。" },
    { word: "useful", pron: "/ˈjuːsfəl/", meaning: "adj. 有用的", example: "These words are useful.", example_cn: "这些单词很有用。" },
  ],
  reading: [
    { en: "Emma is learning English for everyday life.", cn: "艾玛正在为日常生活学习英语。" },
    { en: "Today, she practices a short conversation with her teacher.", cn: "今天，她和老师练习一段简短对话。" },
    { en: "She asks questions, gives answers, and writes down useful words.", cn: "她提问、回答，并记下有用的单词。" },
    { en: "After class, she can use the new sentences with her friends.", cn: "课后，她可以和朋友使用这些新句子。" },
  ],
  grammar: [
    {
      title: "Can I …? 礼貌提问",
      explain: "Can I + 动词原形 用来礼貌地询问自己是否可以做某事。",
      examples: [
        { en: "Can I ask a question?", cn: "我可以问一个问题吗？" },
        { en: "Can I practice with you?", cn: "我可以和你练习吗？" },
      ],
    },
    {
      title: "I need / I want",
      explain: "I need 表示需要；I want 表示想要，后面可以接名词或 to + 动词。",
      examples: [
        { en: "I need some help.", cn: "我需要一些帮助。" },
        { en: "I want to speak English.", cn: "我想说英语。" },
      ],
    },
  ],
  expressions: [
    { en: "Can I ask a question?", cn: "我可以问一个问题吗？", scene: "课堂提问" },
    { en: "Could you say that again?", cn: "你能再说一遍吗？", scene: "请求重复" },
    { en: "I need some help.", cn: "我需要一些帮助。", scene: "寻求帮助" },
    { en: "Let me try again.", cn: "让我再试一次。", scene: "继续练习" },
    { en: "That is useful.", cn: "那很有用。", scene: "表达评价" },
  ],
  fillBlanks: [
    { sentence: "Can I ask a ___?", cn: "我可以问一个问题吗？", options: ["question", "topic", "practice", "answer"], answer: "question" },
    { sentence: "I ___ some help.", cn: "我需要一些帮助。", options: ["need", "want", "easy", "useful"], answer: "need" },
    { sentence: "Please ___ in English.", cn: "请用英语回答。", options: ["answer", "topic", "need", "easy"], answer: "answer" },
    { sentence: "These words are ___.", cn: "这些单词很有用。", options: ["useful", "question", "want", "practice"], answer: "useful" },
  ],
  quiz: [
    { q: "Why is Emma learning English?", options: ["For everyday life", "For cooking", "For a movie", "For shopping only"], answer: 0 },
    { q: "Who does Emma practice with?", options: ["Her doctor", "Her teacher", "Her neighbor", "Her brother"], answer: 1 },
    { q: "What does Emma write down?", options: ["Useful words", "Phone numbers", "Prices", "Addresses"], answer: 0 },
    { q: "When can she use the new sentences?", options: ["After class", "Next year", "Only at home", "Never"], answer: 0 },
  ],
  listening: {
    audio: "Can I ask a question? I need some help. These words are useful.",
    blanks: [
      { before: "Can I ask a", answer: "question", after: "?" },
      { before: "I need some", answer: "help", after: "." },
      { before: "These words are", answer: "useful", after: "." },
    ],
  },
  output: {
    prompt: `Write 3–5 sentences about ${title}. Use at least two sentences from this lesson.`,
    cn: `请围绕“${title}”写 3–5 句话，并至少使用本课两个句型。`,
    sample: "Can I ask a question? I need some help with this topic. These words are useful, and I want to practice again.",
  },
});

export const LESSON_CONTENT: Record<string, LessonContent> = {
  自我介绍: {
    vocab: [
      { word: "introduce", pron: "/ˌɪntrəˈdjuːs/", meaning: "v. 介绍；引进", example: "Let me introduce myself.", example_cn: "让我自我介绍一下。" },
      { word: "hello", pron: "/həˈloʊ/", meaning: "int. 你好", example: "Hello, I'm Mei.", example_cn: "你好，我叫梅。" },
      { word: "name", pron: "/neɪm/", meaning: "n. 名字", example: "My name is Mei.", example_cn: "我的名字叫梅。" },
      { word: "from", pron: "/frʌm/", meaning: "prep. 来自", example: "I'm from Beijing.", example_cn: "我来自北京。" },
      { word: "nice", pron: "/naɪs/", meaning: "adj. 美好的", example: "Nice to meet you.", example_cn: "很高兴认识你。" },
      { word: "meet", pron: "/miːt/", meaning: "v. 遇见，见面", example: "I meet new friends every day.", example_cn: "我每天都认识新朋友。" },
      { word: "student", pron: "/ˈstuːdənt/", meaning: "n. 学生", example: "I am a student.", example_cn: "我是一名学生。" },
      { word: "year", pron: "/jɪr/", meaning: "n. 年；岁", example: "I am twenty years old.", example_cn: "我二十岁。" },
    ],
    reading: [
      { en: "Hello, everyone! My name is Mei. I'm from Beijing, China.", cn: "大家好！我叫梅。我来自中国北京。" },
      { en: "I am twenty years old, and I am a college student.", cn: "我今年二十岁，是一名大学生。" },
      { en: "I love music, reading, and traveling. In my free time, I often listen to pop songs and read English books.", cn: "我喜欢音乐、阅读和旅行。空闲时我常常听流行歌、读英语书。" },
      { en: "I'm learning English because I want to make friends from all over the world. Nice to meet you!", cn: "我正在学英语，因为我想结识来自世界各地的朋友。很高兴认识你！" },
    ],
    grammar: [
      {
        title: "Be 动词：am / is / are",
        explain: "用于介绍身份、年龄、来源。第一人称单数（I）用 am；他/她/它用 is；你/我们/他们用 are。",
        examples: [
          { en: "I am a student.", cn: "我是学生。" },
          { en: "She is from Japan.", cn: "她来自日本。" },
          { en: "They are my friends.", cn: "他们是我的朋友。" },
        ],
      },
      {
        title: "My name is … / I'm …",
        explain: "两种最常见的介绍姓名结构，均可使用，I'm 更口语化。",
        examples: [
          { en: "My name is Lucas.", cn: "我叫卢卡斯。" },
          { en: "I'm Lucas.", cn: "我是卢卡斯。" },
        ],
      },
    ],
    expressions: [
      { en: "Nice to meet you.", cn: "很高兴认识你。", scene: "初次见面" },
      { en: "How do you do?", cn: "你好（正式）。", scene: "正式场合" },
      { en: "What's your name?", cn: "你叫什么名字？", scene: "询问姓名" },
      { en: "Where are you from?", cn: "你来自哪里？", scene: "询问来源" },
      { en: "I'm a student / engineer.", cn: "我是学生 / 工程师。", scene: "介绍身份" },
    ],
    fillBlanks: [
      { sentence: "Hello, my ___ is Mei.", cn: "你好，我的名字叫梅。", options: ["name", "from", "nice", "meet"], answer: "name" },
      { sentence: "I'm ___ Beijing.", cn: "我来自北京。", options: ["in", "at", "from", "on"], answer: "from" },
      { sentence: "___ to meet you.", cn: "很高兴认识你。", options: ["Nice", "Name", "Hello", "Year"], answer: "Nice" },
      { sentence: "I ___ a student.", cn: "我是一名学生。", options: ["am", "is", "are", "be"], answer: "am" },
    ],
    quiz: [
      {
        q: "Where is Mei from?",
        options: ["Shanghai", "Beijing", "Tokyo", "New York"],
        answer: 1,
        explain: "The text says 'I'm from Beijing, China.'",
      },
      {
        q: "How old is Mei?",
        options: ["18 years old", "19 years old", "20 years old", "21 years old"],
        answer: 2,
        explain: "I am twenty years old.",
      },
      {
        q: "Which of the following is NOT one of Mei's hobbies?",
        options: ["Music", "Reading", "Traveling", "Sports"],
        answer: 3,
        explain: "The text mentions music, reading and traveling — sports is not listed.",
      },
      {
        q: "Why is Mei learning English?",
        options: ["For exams", "For work", "To make friends from all over the world", "To study abroad"],
        answer: 2,
      },
    ],
    listening: {
      audio: "Hello, my name is Mei. I am from Beijing. I am a student.",
      blanks: [
        { before: "Hello, my name is", answer: "Mei", after: "." },
        { before: "I am from", answer: "Beijing", after: "." },
        { before: "I am a", answer: "student", after: "." },
      ],
    },
    output: {
      prompt: "Please introduce yourself in 3–5 sentences. Include your name, where you are from, your age, and your hobbies.",
      cn: "请用 3–5 句话介绍自己，包括姓名、来源、年龄和爱好。",
      sample: "Hello! My name is Alex. I'm from Shanghai. I'm twenty-two years old and I am a student. I love movies and basketball. Nice to meet you!",
    },
  },
  问候与告别: {
    vocab: [
      { word: "morning", pron: "/ˈmɔːrnɪŋ/", meaning: "n. 早晨", example: "Good morning, Tom!", example_cn: "早上好，汤姆！" },
      { word: "afternoon", pron: "/ˌæftərˈnuːn/", meaning: "n. 下午", example: "Good afternoon, class.", example_cn: "下午好，同学们。" },
      { word: "evening", pron: "/ˈiːvnɪŋ/", meaning: "n. 傍晚", example: "Good evening, sir.", example_cn: "晚上好，先生。" },
      { word: "goodbye", pron: "/ɡʊdˈbaɪ/", meaning: "int. 再见", example: "Goodbye, see you tomorrow.", example_cn: "再见，明天见。" },
      { word: "see", pron: "/siː/", meaning: "v. 看见", example: "See you later!", example_cn: "回头见！" },
      { word: "later", pron: "/ˈleɪtər/", meaning: "adv. 稍后", example: "Talk to you later.", example_cn: "稍后聊。" },
      { word: "how", pron: "/haʊ/", meaning: "adv. 怎么样", example: "How are you?", example_cn: "你好吗？" },
      { word: "fine", pron: "/faɪn/", meaning: "adj. 不错的", example: "I'm fine, thanks.", example_cn: "我很好，谢谢。" },
    ],
    reading: [
      { en: "Good morning, Lily! How are you today?", cn: "早上好，莉莉！你今天怎么样？" },
      { en: "I'm fine, thank you. And you?", cn: "我很好，谢谢。你呢？" },
      { en: "Pretty good. I'm on my way to class. See you later!", cn: "挺好的。我正要去上课。回头见！" },
      { en: "Okay, goodbye! Have a nice day.", cn: "好的，再见！祝你有美好的一天。" },
    ],
    grammar: [
      {
        title: "Good + 时间段",
        explain: "用于不同时段的问候：morning（早）、afternoon（午）、evening（晚）。睡前道别用 Good night。",
        examples: [
          { en: "Good morning!", cn: "早上好！" },
          { en: "Good evening, everyone.", cn: "大家晚上好。" },
          { en: "Good night, sleep well.", cn: "晚安，好梦。" },
        ],
      },
      {
        title: "How are you? 的回应",
        explain: "常见回答：I'm fine / Pretty good / Not bad，再加上 thanks 更礼貌，并可反问 And you?",
        examples: [
          { en: "I'm fine, thanks. And you?", cn: "我很好，谢谢。你呢？" },
          { en: "Pretty good!", cn: "挺好的！" },
        ],
      },
    ],
    expressions: [
      { en: "Good morning!", cn: "早上好！", scene: "上午问候" },
      { en: "How's it going?", cn: "最近怎么样？", scene: "朋友之间" },
      { en: "See you later.", cn: "回头见。", scene: "短暂告别" },
      { en: "Have a nice day!", cn: "祝你愉快！", scene: "礼貌告别" },
      { en: "Take care.", cn: "保重。", scene: "关心告别" },
    ],
    fillBlanks: [
      { sentence: "Good ___, everyone!", cn: "大家早上好！", options: ["morning", "night", "bye", "later"], answer: "morning" },
      { sentence: "I'm ___, thanks.", cn: "我很好，谢谢。", options: ["fine", "from", "name", "see"], answer: "fine" },
      { sentence: "See you ___!", cn: "回头见！", options: ["later", "morning", "fine", "nice"], answer: "later" },
      { sentence: "___ are you today?", cn: "你今天怎么样？", options: ["What", "How", "Where", "Who"], answer: "How" },
    ],
    quiz: [
      { q: "Where is Lily going right now?", options: ["Home", "To class", "To eat", "To exercise"], answer: 1, explain: "I'm on my way to class." },
      { q: "Someone says 'How are you?' — what is the most natural reply?", options: ["Goodbye.", "I'm fine, thanks.", "My name is Lily.", "Nice day."], answer: 1 },
      { q: "What do you say when meeting someone in the evening?", options: ["Good morning", "Good afternoon", "Good evening", "Good night"], answer: 2 },
      { q: "What does 'See you later.' mean?", options: ["Nice to meet you", "See you again soon", "Good night", "Take care"], answer: 1 },
    ],
    listening: {
      audio: "Good morning, Lily. How are you? I am fine, thank you. See you later.",
      blanks: [
        { before: "Good", answer: "morning", after: ", Lily." },
        { before: "I am", answer: "fine", after: ", thank you." },
        { before: "See you", answer: "later", after: "." },
      ],
    },
    output: {
      prompt: "Greet a friend in the morning, ask how they are, and say goodbye politely (3–4 sentences).",
      cn: "请用 3–4 句话向朋友问早安、询问近况，并礼貌道别。",
      sample: "Good morning, Anna! How are you today? I'm doing great, thanks. See you later, have a nice day!",
    },
  },
  基本礼貌用语: {
    vocab: [
      { word: "please", pron: "/pliːz/", meaning: "adv. 请", example: "Please sit down.", example_cn: "请坐。" },
      { word: "thank", pron: "/θæŋk/", meaning: "v. 感谢", example: "Thank you very much.", example_cn: "非常感谢。" },
      { word: "sorry", pron: "/ˈsɒri/", meaning: "adj. 抱歉的", example: "I'm sorry for being late.", example_cn: "抱歉我迟到了。" },
      { word: "excuse", pron: "/ɪkˈskjuːz/", meaning: "v. 原谅", example: "Excuse me, where is the bank?", example_cn: "打扰一下，银行在哪里？" },
      { word: "welcome", pron: "/ˈwelkəm/", meaning: "int. 不客气", example: "You're welcome.", example_cn: "不客气。" },
      { word: "help", pron: "/help/", meaning: "v. 帮助", example: "Can you help me?", example_cn: "你能帮我吗？" },
      { word: "problem", pron: "/ˈprɒbləm/", meaning: "n. 问题", example: "No problem.", example_cn: "没问题。" },
      { word: "kind", pron: "/kaɪnd/", meaning: "adj. 友好的", example: "You are very kind.", example_cn: "你真好。" },
    ],
    reading: [
      { en: "Excuse me, could you help me with this bag?", cn: "打扰一下，你能帮我拿一下这个包吗？" },
      { en: "Of course! Here you go.", cn: "当然！给你。" },
      { en: "Thank you so much. That's very kind of you.", cn: "非常感谢，你真是太好了。" },
      { en: "You're welcome. No problem at all.", cn: "不客气，完全没问题。" },
    ],
    grammar: [
      {
        title: "请求句型 Could you …?",
        explain: "Could you + 动词原形 是比 Can you 更礼貌的请求方式，常加 please。",
        examples: [
          { en: "Could you help me, please?", cn: "请问你能帮我吗？" },
          { en: "Could you say that again?", cn: "你能再说一遍吗？" },
        ],
      },
      {
        title: "感谢与回应",
        explain: "Thank you / Thanks 表示感谢；常见回应：You're welcome / No problem / My pleasure。",
        examples: [
          { en: "Thanks a lot. — You're welcome.", cn: "非常感谢。— 不客气。" },
          { en: "Thank you. — My pleasure.", cn: "谢谢。— 我的荣幸。" },
        ],
      },
    ],
    expressions: [
      { en: "Excuse me.", cn: "打扰一下。", scene: "引起注意" },
      { en: "I'm sorry.", cn: "对不起。", scene: "道歉" },
      { en: "No problem.", cn: "没问题。", scene: "回应感谢/道歉" },
      { en: "After you.", cn: "您先请。", scene: "礼让" },
      { en: "That's very kind of you.", cn: "你真好。", scene: "表达感激" },
    ],
    fillBlanks: [
      { sentence: "___ me, where is the toilet?", cn: "打扰一下，洗手间在哪里？", options: ["Excuse", "Sorry", "Please", "Thank"], answer: "Excuse" },
      { sentence: "Thank you. — You're ___.", cn: "谢谢。— 不客气。", options: ["welcome", "sorry", "fine", "kind"], answer: "welcome" },
      { sentence: "Could you ___ me, please?", cn: "请问你能帮我吗？", options: ["help", "thank", "sorry", "name"], answer: "help" },
      { sentence: "I'm ___ for being late.", cn: "抱歉我迟到了。", options: ["sorry", "thank", "kind", "fine"], answer: "sorry" },
    ],
    quiz: [
      { q: "What does the speaker ask for help with?", options: ["A book", "A bag", "A cup", "An umbrella"], answer: 1 },
      { q: "What does 'Of course!' mean as a reply?", options: ["Refusal", "Agreement", "Hesitation", "Confusion"], answer: 1 },
      { q: "When do you say 'You're welcome.'?", options: ["After apologizing", "After being thanked", "When asking directions", "When saying goodbye"], answer: 1 },
      { q: "How do you politely get a stranger's attention?", options: ["Hello!", "Excuse me.", "How are you?", "Goodbye."], answer: 1 },
    ],
    listening: {
      audio: "Excuse me, could you help me? Thank you so much. You are welcome.",
      blanks: [
        { before: "", answer: "Excuse", after: " me, could you help me?" },
        { before: "Thank you so", answer: "much", after: "." },
        { before: "You are", answer: "welcome", after: "." },
      ],
    },
    output: {
      prompt: "Politely ask a stranger for help, thank them, and respond when they say 'You're welcome.' (3–4 sentences).",
      cn: "请用 3–4 句话礼貌地向陌生人请求帮助、表达感谢，并对回应进行回礼。",
      sample: "Excuse me, could you help me carry this box, please? Thank you so much, that's very kind of you. — You're welcome. — Have a nice day!",
    },
  },
  介绍他人: {
    vocab: [
      { word: "this", pron: "/ðɪs/", meaning: "pron. 这个", example: "This is my friend, Tom.", example_cn: "这是我的朋友，汤姆。" },
      { word: "friend", pron: "/frend/", meaning: "n. 朋友", example: "She is my best friend.", example_cn: "她是我最好的朋友。" },
      { word: "colleague", pron: "/ˈkɒliːɡ/", meaning: "n. 同事", example: "He is my colleague.", example_cn: "他是我的同事。" },
      { word: "classmate", pron: "/ˈklɑːsmeɪt/", meaning: "n. 同学", example: "We are classmates.", example_cn: "我们是同学。" },
      { word: "brother", pron: "/ˈbrʌðər/", meaning: "n. 兄弟", example: "This is my brother, Jack.", example_cn: "这是我哥哥杰克。" },
      { word: "sister", pron: "/ˈsɪstər/", meaning: "n. 姐妹", example: "Meet my little sister.", example_cn: "见见我的妹妹。" },
      { word: "everyone", pron: "/ˈevriwʌn/", meaning: "pron. 大家", example: "Everyone, this is Lisa.", example_cn: "各位，这是丽莎。" },
      { word: "pleasure", pron: "/ˈpleʒər/", meaning: "n. 荣幸", example: "It's a pleasure to meet you.", example_cn: "很荣幸认识你。" },
    ],
    reading: [
      { en: "Hi everyone, I'd like you to meet my friend, Tom.", cn: "大家好，我想给你们介绍我的朋友汤姆。" },
      { en: "Tom is from London, and he is a software engineer.", cn: "汤姆来自伦敦，他是一名软件工程师。" },
      { en: "Tom, this is Lisa. She is my classmate at the university.", cn: "汤姆，这是丽莎。她是我大学的同学。" },
      { en: "Nice to meet you, Lisa! It's a pleasure.", cn: "很高兴认识你，丽莎！很荣幸。" },
    ],
    grammar: [
      {
        title: "This is … 介绍句型",
        explain: "用 This is + 姓名/称呼 来介绍身边的人；介绍多人用 These are …。",
        examples: [
          { en: "This is my brother, Jack.", cn: "这是我哥哥杰克。" },
          { en: "These are my friends, Mia and Leo.", cn: "这是我的朋友米娅和里奥。" },
        ],
      },
      {
        title: "I'd like you to meet …",
        explain: "更正式、礼貌的介绍方式，常用于工作或社交场合。",
        examples: [
          { en: "I'd like you to meet my colleague, Anna.", cn: "我想给你介绍我的同事安娜。" },
        ],
      },
    ],
    expressions: [
      { en: "This is my friend, …", cn: "这是我的朋友……", scene: "朋友间介绍" },
      { en: "Have you met …?", cn: "你见过……吗？", scene: "询问是否相识" },
      { en: "It's a pleasure to meet you.", cn: "很荣幸认识你。", scene: "正式场合" },
      { en: "I've heard a lot about you.", cn: "久仰大名。", scene: "见到熟人朋友" },
      { en: "Likewise.", cn: "我也是。", scene: "回应称赞/问候" },
    ],
    fillBlanks: [
      { sentence: "___ is my friend, Tom.", cn: "这是我朋友汤姆。", options: ["This", "He", "It", "That"], answer: "This" },
      { sentence: "It's a ___ to meet you.", cn: "很荣幸认识你。", options: ["pleasure", "friend", "name", "kind"], answer: "pleasure" },
      { sentence: "She is my ___ at school.", cn: "她是我学校的同学。", options: ["classmate", "colleague", "brother", "sister"], answer: "classmate" },
      { sentence: "I'd like you to ___ my brother.", cn: "我想给你介绍我哥哥。", options: ["meet", "see", "know", "look"], answer: "meet" },
    ],
    quiz: [
      { q: "What is Tom's job?", options: ["Teacher", "Student", "Software engineer", "Doctor"], answer: 2 },
      { q: "Where is Tom from?", options: ["Paris", "London", "New York", "Tokyo"], answer: 1 },
      { q: "How does the speaker know Lisa?", options: ["Sister", "Colleague", "University classmate", "Neighbor"], answer: 2 },
      { q: "Which is the most polite way to formally introduce someone?", options: ["This is …", "I'd like you to meet …", "Hey, look!", "That's …"], answer: 1 },
    ],
    listening: {
      audio: "This is my friend Tom. He is from London. Nice to meet you.",
      blanks: [
        { before: "This is my", answer: "friend", after: " Tom." },
        { before: "He is from", answer: "London", after: "." },
        { before: "Nice to", answer: "meet", after: " you." },
      ],
    },
    output: {
      prompt: "Introduce a friend or family member to someone new. Mention name, relationship, and one extra detail (3–5 sentences).",
      cn: "请用 3–5 句话向新朋友介绍你的一位朋友或家人，包括姓名、关系和一个其他细节。",
      sample: "Hi Anna, I'd like you to meet my brother, Kevin. He is a college student in Shanghai and he loves basketball. Kevin, this is Anna, my classmate. — Nice to meet you!",
    },
  },
  谈论职业: {
    vocab: [
      { word: "job", pron: "/dʒɒb/", meaning: "n. 工作", example: "What's your job?", example_cn: "你做什么工作？" },
      { word: "work", pron: "/wɜːrk/", meaning: "v./n. 工作", example: "I work in a hospital.", example_cn: "我在医院工作。" },
      { word: "teacher", pron: "/ˈtiːtʃər/", meaning: "n. 老师", example: "She is an English teacher.", example_cn: "她是英语老师。" },
      { word: "doctor", pron: "/ˈdɒktər/", meaning: "n. 医生", example: "My father is a doctor.", example_cn: "我父亲是医生。" },
      { word: "engineer", pron: "/ˌendʒɪˈnɪər/", meaning: "n. 工程师", example: "I am a software engineer.", example_cn: "我是软件工程师。" },
      { word: "company", pron: "/ˈkʌmpəni/", meaning: "n. 公司", example: "I work for a big company.", example_cn: "我在一家大公司工作。" },
      { word: "office", pron: "/ˈɒfɪs/", meaning: "n. 办公室", example: "My office is downtown.", example_cn: "我的办公室在市中心。" },
      { word: "love", pron: "/lʌv/", meaning: "v. 热爱", example: "I love my job.", example_cn: "我热爱我的工作。" },
    ],
    reading: [
      { en: "Hi, I'm David. What do you do for a living?", cn: "你好，我叫大卫。你是做什么工作的？" },
      { en: "I'm a nurse. I work at City Hospital.", cn: "我是护士，在城市医院工作。" },
      { en: "That sounds great! I'm a software engineer at a tech company.", cn: "听起来很棒！我在一家科技公司做软件工程师。" },
      { en: "Do you like your job? — Yes, I love it. It's challenging but fun.", cn: "你喜欢你的工作吗？— 是的，我很喜欢。有挑战但很有趣。" },
    ],
    grammar: [
      {
        title: "询问职业的两种问法",
        explain: "What do you do? = What's your job? 都是问职业；回答用 I'm a/an + 职业 或 I work + 介词短语。",
        examples: [
          { en: "What do you do? — I'm a teacher.", cn: "你做什么工作？— 我是老师。" },
          { en: "I work in a bank.", cn: "我在银行工作。" },
        ],
      },
      {
        title: "a 与 an 的区别",
        explain: "职业前要加冠词。辅音音开头用 a（a doctor），元音音开头用 an（an engineer, an artist）。",
        examples: [
          { en: "She is a nurse.", cn: "她是一名护士。" },
          { en: "He is an engineer.", cn: "他是一名工程师。" },
        ],
      },
    ],
    expressions: [
      { en: "What do you do?", cn: "你做什么工作？", scene: "初识询问" },
      { en: "I work for …", cn: "我在……公司工作", scene: "介绍雇主" },
      { en: "I'm in marketing / sales.", cn: "我做市场 / 销售。", scene: "介绍领域" },
      { en: "I love what I do.", cn: "我热爱我的工作。", scene: "表达态度" },
      { en: "It's a 9-to-5 job.", cn: "是朝九晚五的工作。", scene: "描述节奏" },
    ],
    fillBlanks: [
      { sentence: "I am ___ engineer.", cn: "我是工程师。", options: ["a", "an", "the", "—"], answer: "an" },
      { sentence: "She ___ in a hospital.", cn: "她在医院工作。", options: ["work", "works", "working", "is work"], answer: "works" },
      { sentence: "What do you ___?", cn: "你做什么工作？", options: ["do", "are", "work", "job"], answer: "do" },
      { sentence: "I love my ___.", cn: "我热爱我的工作。", options: ["job", "name", "office", "company"], answer: "job" },
    ],
    quiz: [
      { q: "What is the woman's job in the dialogue?", options: ["Doctor", "Nurse", "Teacher", "Engineer"], answer: 1 },
      { q: "What is David's job?", options: ["Software engineer", "Manager", "Student", "Doctor"], answer: 0 },
      { q: "How does the other person feel about their job?", options: ["Hates it", "Doesn't care", "Loves it", "Wants to switch"], answer: 2 },
      { q: "Which job should be preceded by 'an'?", options: ["doctor", "nurse", "engineer", "teacher"], answer: 2, explain: "'engineer' starts with a vowel sound." },
    ],
    listening: {
      audio: "I am a software engineer. I work for a tech company. I love my job.",
      blanks: [
        { before: "I am a software", answer: "engineer", after: "." },
        { before: "I work for a tech", answer: "company", after: "." },
        { before: "I love my", answer: "job", after: "." },
      ],
    },
    output: {
      prompt: "Talk about your job: what you do, where you work, and how you feel about it (3–5 sentences).",
      cn: "请用 3–5 句话谈论你的职业：做什么、在哪工作、对工作的感受。",
      sample: "I'm a graphic designer. I work for a small studio in Shanghai. My job is creative and busy, but I really love it because every day is different.",
    },
  },
};

// Auto-generate placeholder content for any lesson without manually authored content.
LEVELS.flatMap((level) => level.units.flatMap((unit) => unit.lessons))
  .forEach((lesson) => {
    LESSON_CONTENT[lesson.title] ??= buildLessonContent(lesson.title);
  });

// Backward compatibility
export const SAMPLE_VOCAB: Record<string, VocabItem[]> = Object.fromEntries(
  Object.entries(LESSON_CONTENT).map(([k, v]) => [k, v.vocab]),
);

export const findUnit = (levelId: number, unitId: number) =>
  LEVELS.find((l) => l.id === levelId)?.units.find((u) => u.id === unitId);

export const findLesson = (levelId: number, unitId: number, lessonId: number) =>
  findUnit(levelId, unitId)?.lessons.find((l) => l.id === lessonId);