// Auto-generated from legacy data. Do not edit by hand.
export type SceneLine = { speaker: string; en: string; cn: string };
export type SceneDialogue = {
  id: string;
  cat: string;
  catName: string;
  catEmoji: string;
  title: string;
  titleCn: string;
  emoji: string;
  lines: SceneLine[];
};

export const SCENE_CATEGORIES: { key: string; emoji: string; name: string; nameEn: string; desc: string }[] = [
  { key: 'restaurant', emoji: '🍽️', name: '餐馆点餐', nameEn: 'Restaurants', desc: '中餐·西餐·汉堡·拉面' },
  { key: 'coffee',     emoji: '☕',  name: '咖啡店',   nameEn: 'Coffee Shops', desc: "Starbucks · Peet's" },
  { key: 'bank',       emoji: '🏦', name: '银行业务', nameEn: 'Banking', desc: '开户·挂失·汇款' },
  { key: 'shopping',   emoji: '🛍️', name: '商场购物', nameEn: 'Shopping', desc: '鞋子·衣服·退货' },
  { key: 'movie',      emoji: '🎬', name: '看电影',   nameEn: 'Movies', desc: '买票·零食·讨论' },
  { key: 'traffic',    emoji: '🚗', name: '交通事故', nameEn: 'Traffic', desc: '追尾·报警·理赔' },
  { key: 'gym',        emoji: '💪', name: '健身锻炼', nameEn: 'Gym & Fitness', desc: '办卡·私教·团课' },
  { key: 'study',      emoji: '📚', name: '学习考试', nameEn: 'Study & Exams', desc: '考研·英语考试' },
  { key: 'job',        emoji: '💼', name: '求职面试', nameEn: 'Job Interviews', desc: '初面·谈薪·跟进' },
  { key: 'travel',     emoji: '✈️', name: '景点旅游', nameEn: 'Travel', desc: '酒店·导游·纪念品' },
  { key: 'health',     emoji: '🏥', name: '看病就医', nameEn: 'Healthcare', desc: '感冒·发烧·牙医' },
  { key: 'acting',     emoji: '🎭', name: '影视表演', nameEn: 'Acting', desc: '试镜·排练·拍摄' },
  { key: 'filmreview', emoji: '🎥', name: '影视评论', nameEn: 'Film Reviews', desc: '教父·肖申克·绝望的主妇' },
  { key: 'bookreview', emoji: '📖', name: '读书评论', nameEn: 'Book Reviews', desc: '盖茨比·基督山·知更鸟' },
];

export const SCENE_DIALOGUES: SceneDialogue[] = [
  {
    "id": "restaurant-chinese-1",
    "cat": "restaurant",
    "catName": "餐馆点餐",
    "catEmoji": "🍽️",
    "title": "Ordering at a Chinese Restaurant",
    "titleCn": "中餐馆点餐",
    "emoji": "🥡",
    "lines": [
      {
        "speaker": "Waiter",
        "en": "Welcome to Golden Dragon. How many in your party?",
        "cn": "欢迎来到金龙餐厅。请问几位？"
      },
      {
        "speaker": "You",
        "en": "Just two, please. Can we get a table by the window?",
        "cn": "两位，请问可以坐窗边吗？"
      },
      {
        "speaker": "Waiter",
        "en": "Sure thing! Right this way. Here are your menus.",
        "cn": "当然可以！这边请。这是菜单。"
      },
      {
        "speaker": "You",
        "en": "Thanks. Um, what do you recommend for someone who's never been here?",
        "cn": "谢谢。嗯，第一次来的话你们有什么推荐吗？"
      },
      {
        "speaker": "Waiter",
        "en": "Our kung pao chicken is super popular, and the mapo tofu is amazing if you like spicy.",
        "cn": "我们的宫保鸡丁特别受欢迎，如果你喜欢吃辣的话，麻婆豆腐也非常棒。"
      },
      {
        "speaker": "You",
        "en": "Oh nice. We'll do the kung pao chicken and, hmm, the beef chow fun.",
        "cn": "不错。那我们要一份宫保鸡丁，还有嗯，一份干炒牛河。"
      },
      {
        "speaker": "Waiter",
        "en": "Great choices. Would you like any appetizers? Our egg rolls are made fresh.",
        "cn": "选得好。要来点开胃菜吗？我们的蛋卷是现做的。"
      },
      {
        "speaker": "You",
        "en": "Yeah, let's get an order of egg rolls and some hot and sour soup.",
        "cn": "好的，来一份蛋卷和一份酸辣汤。"
      },
      {
        "speaker": "Waiter",
        "en": "Got it. Anything to drink? We have Chinese beer, tea, or soft drinks.",
        "cn": "好的。喝点什么？我们有中国啤酒、茶和软饮。"
      },
      {
        "speaker": "You",
        "en": "I'll have a Tsingtao, and she'll have jasmine tea, please.",
        "cn": "我要一瓶青岛啤酒，她要一杯茉莉花茶。"
      },
      {
        "speaker": "Waiter",
        "en": "You got it. I'll put that order in right away.",
        "cn": "没问题。我马上下单。"
      },
      {
        "speaker": "You",
        "en": "Oh wait, can we also add a side of steamed rice?",
        "cn": "等一下，能再加一份白米饭吗？"
      },
      {
        "speaker": "Waiter",
        "en": "Of course. One or two bowls?",
        "cn": "当然可以。要一碗还是两碗？"
      },
      {
        "speaker": "You",
        "en": "Two bowls, please. Actually, do you guys do family style here?",
        "cn": "两碗吧。对了，你们这里是可以大家一起分着吃的吧？"
      },
      {
        "speaker": "Waiter",
        "en": "Absolutely! Everything comes on big plates so you can share. That's the best way to do it.",
        "cn": "当然！所有菜都是用大盘子上的，方便大家分享。这样吃最好了。"
      },
      {
        "speaker": "You",
        "en": "Perfect, that's what we were hoping for.",
        "cn": "太好了，我们就想这样吃。"
      },
      {
        "speaker": "Waiter",
        "en": "Your egg rolls and soup should be out in about five minutes.",
        "cn": "蛋卷和汤大概五分钟就能上。"
      },
      {
        "speaker": "You",
        "en": "Sounds good. Oh, one more thing — is the kung pao chicken very spicy?",
        "cn": "好的。哦对了，再问一下——宫保鸡丁很辣吗？"
      },
      {
        "speaker": "Waiter",
        "en": "It's got a kick to it, but it's not crazy hot. I can ask the kitchen to tone it down if you want.",
        "cn": "有点辣，但不会特别猛。如果你想的话，我可以让厨房少放点辣。"
      },
      {
        "speaker": "You",
        "en": "Nah, keep it as is. We like a little heat. Thanks!",
        "cn": "不用了，就按正常的来吧。我们喜欢吃点辣的。谢谢！"
      }
    ]
  },
  {
    "id": "restaurant-chinese-2",
    "cat": "restaurant",
    "catName": "餐馆点餐",
    "catEmoji": "🍽️",
    "title": "Asking about Spicy Dishes",
    "titleCn": "中餐馆问辣度",
    "emoji": "🌶️",
    "lines": [
      {
        "speaker": "Waiter",
        "en": "Hey there, ready to order or do you need a few more minutes?",
        "cn": "嗨，准备好点菜了吗，还是再看看？"
      },
      {
        "speaker": "You",
        "en": "Almost ready. Quick question though — how spicy is the Sichuan boiled fish?",
        "cn": "差不多了。不过想问一下——水煮鱼辣不辣？"
      },
      {
        "speaker": "Waiter",
        "en": "Oh, that one's no joke. It's one of our spiciest dishes, honestly.",
        "cn": "那道菜可不是开玩笑的，说实话，是我们最辣的菜之一。"
      },
      {
        "speaker": "You",
        "en": "Like, on a scale of one to ten, where would you put it?",
        "cn": "那如果从一到十打分的话，你觉得能到几？"
      },
      {
        "speaker": "Waiter",
        "en": "I'd say a solid eight. The Sichuan peppercorns give it that numbing heat, you know?",
        "cn": "我觉得能到八吧。花椒会让你嘴巴又麻又辣，你懂的。"
      },
      {
        "speaker": "You",
        "en": "Hmm, I can handle spicy food but my friend here, not so much.",
        "cn": "嗯，我能吃辣，但我这个朋友就不太行了。"
      },
      {
        "speaker": "Waiter",
        "en": "No worries. We can make it mild, medium, or hot. What works for you guys?",
        "cn": "没关系。我们可以做微辣、中辣或者特辣。你们想要哪种？"
      },
      {
        "speaker": "You",
        "en": "Could we do medium? That way it's still got flavor but won't destroy us.",
        "cn": "中辣可以吗？这样还有味道，但不至于受不了。"
      },
      {
        "speaker": "Waiter",
        "en": "Medium it is. Smart call. Anything else catch your eye?",
        "cn": "中辣没问题。聪明的选择。还有别的想点的吗？"
      },
      {
        "speaker": "You",
        "en": "What about the dan dan noodles? Are those spicy too?",
        "cn": "担担面呢？也辣吗？"
      },
      {
        "speaker": "Waiter",
        "en": "They've got some chili oil in them, but it's more like a four or five. Way more manageable.",
        "cn": "里面有辣椒油，但大概就四五的水平。温和多了。"
      },
      {
        "speaker": "You",
        "en": "OK cool, we'll get those too. And maybe something not spicy at all for balance?",
        "cn": "行，那也来一份。再来一个完全不辣的菜调和一下？"
      },
      {
        "speaker": "Waiter",
        "en": "I'd suggest the steamed sea bass. Zero spice, really clean flavors.",
        "cn": "我推荐清蒸鲈鱼。完全不辣，味道很清爽。"
      },
      {
        "speaker": "You",
        "en": "That sounds perfect. Let's add that.",
        "cn": "听起来不错。那就加上这个。"
      },
      {
        "speaker": "Waiter",
        "en": "Great combo. Oh, and just a heads up — the boiled fish comes in a big bowl with a lot of oil on top. Totally normal.",
        "cn": "搭配得不错。对了提醒一下——水煮鱼是用大碗装的，上面会有很多油。这是正常的。"
      },
      {
        "speaker": "You",
        "en": "Oh yeah, I've had it before. That's the best part honestly, all that chili oil.",
        "cn": "对，我以前吃过。说实话那些辣椒油才是精华。"
      },
      {
        "speaker": "Waiter",
        "en": "Ha, you get it! Alright, I'll get this started for you.",
        "cn": "哈，你懂行！好的，我这就去下单。"
      },
      {
        "speaker": "You",
        "en": "Wait, do you have any recommendations for drinks to cool down the spice?",
        "cn": "等等，有什么饮料可以解辣的吗？"
      },
      {
        "speaker": "Waiter",
        "en": "Honestly, the coconut milk works way better than water. Water just spreads the heat around.",
        "cn": "说实话椰奶比水管用多了。水只会让辣味扩散。"
      },
      {
        "speaker": "You",
        "en": "Good tip. Two coconut milks then. Thanks a lot!",
        "cn": "好建议。那来两杯椰奶吧。谢谢！"
      }
    ]
  },
  {
    "id": "restaurant-chinese-3",
    "cat": "restaurant",
    "catName": "餐馆点餐",
    "catEmoji": "🍽️",
    "title": "Ordering Takeout at Chinese Restaurant",
    "titleCn": "中餐馆打包外卖",
    "emoji": "🥡",
    "lines": [
      {
        "speaker": "Cashier",
        "en": "Hi! Are you ordering for here or to go?",
        "cn": "你好！在这儿吃还是打包带走？"
      },
      {
        "speaker": "You",
        "en": "To go, please. I'm picking up dinner for my whole family tonight.",
        "cn": "打包带走。今晚要给全家人带晚饭。"
      },
      {
        "speaker": "Cashier",
        "en": "Oh nice, big order then! Take your time with the menu.",
        "cn": "那是个大单子呢！慢慢看菜单吧。"
      },
      {
        "speaker": "You",
        "en": "So, I'll need like four or five dishes. Can I get the orange chicken, General Tso's, and some fried rice?",
        "cn": "那我大概需要四五个菜。来一份陈皮鸡、左宗棠鸡和炒饭。"
      },
      {
        "speaker": "Cashier",
        "en": "Sure. What kind of fried rice — pork, chicken, shrimp, or veggie?",
        "cn": "好的。炒饭要哪种——猪肉、鸡肉、虾仁还是蔬菜的？"
      },
      {
        "speaker": "You",
        "en": "Let's do shrimp fried rice. And can I get a large? There's five of us.",
        "cn": "要虾仁炒饭吧。能要大份的吗？我们有五个人。"
      },
      {
        "speaker": "Cashier",
        "en": "Absolutely. For five people I'd recommend at least two large sides. Want to add lo mein or chow mein?",
        "cn": "当然。五个人的话我建议至少点两个大份的主食。要加炒面或者捞面吗？"
      },
      {
        "speaker": "You",
        "en": "Yeah, throw in a large lo mein too. What else... my dad loves sweet and sour pork.",
        "cn": "好，再加一份大份捞面。还有什么……我爸爱吃糖醋排骨。"
      },
      {
        "speaker": "Cashier",
        "en": "We make a great sweet and sour pork. It's one of our top sellers.",
        "cn": "我们的糖醋排骨做得很好，是招牌菜之一。"
      },
      {
        "speaker": "You",
        "en": "Perfect, add that. And hmm, you guys have any veggies? My mom always says we need something green.",
        "cn": "好，加上。嗯，你们有什么蔬菜吗？我妈总说得吃点绿色蔬菜。"
      },
      {
        "speaker": "Cashier",
        "en": "Ha, moms are always right! We have sauteed broccoli, Chinese greens, or string beans.",
        "cn": "哈，妈妈们说得永远是对的！我们有炒西兰花、中国绿叶菜和炒四季豆。"
      },
      {
        "speaker": "You",
        "en": "The Chinese greens sound good. Is that bok choy?",
        "cn": "中国绿叶菜听着不错，是小白菜吗？"
      },
      {
        "speaker": "Cashier",
        "en": "Yep, baby bok choy with garlic sauce. Really good.",
        "cn": "对，蒜蓉小白菜，很好吃。"
      },
      {
        "speaker": "You",
        "en": "Done. That should be enough. How long is the wait gonna be?",
        "cn": "行，应该够了。大概要等多久？"
      },
      {
        "speaker": "Cashier",
        "en": "For this size order, probably about twenty to twenty-five minutes. That OK?",
        "cn": "这么多菜的话，大概二十到二十五分钟。可以吗？"
      },
      {
        "speaker": "You",
        "en": "That works. I'll just wait here. Oh, can you make sure to include extra soy sauce and chopsticks?",
        "cn": "可以。我就在这等。哦，能多给点酱油和筷子吗？"
      },
      {
        "speaker": "Cashier",
        "en": "Of course. Want any hot mustard or duck sauce packets too?",
        "cn": "没问题。要芥末酱或者甜酸酱的小包装吗？"
      },
      {
        "speaker": "You",
        "en": "Yeah, a few of each would be great.",
        "cn": "好的，每种来几包吧。"
      },
      {
        "speaker": "Cashier",
        "en": "Alright, your total comes to forty-seven fifty. Cash or card?",
        "cn": "好的，一共四十七块五。现金还是刷卡？"
      },
      {
        "speaker": "You",
        "en": "Card, please. And can I get a bag that won't leak? Last time the soup spilled everywhere.",
        "cn": "刷卡吧。能给我一个不会漏的袋子吗？上次汤洒了一路。"
      }
    ]
  },
  {
    "id": "restaurant-chinese-4",
    "cat": "restaurant",
    "catName": "餐馆点餐",
    "catEmoji": "🍽️",
    "title": "Splitting the Bill at Chinese Restaurant",
    "titleCn": "中餐馆AA制买单",
    "emoji": "💳",
    "lines": [
      {
        "speaker": "Waiter",
        "en": "How was everything, folks? Can I get you anything else?",
        "cn": "各位吃得怎么样？还需要什么吗？"
      },
      {
        "speaker": "You",
        "en": "Everything was amazing, thanks. We're actually ready for the check.",
        "cn": "非常好吃，谢谢。我们准备买单了。"
      },
      {
        "speaker": "Waiter",
        "en": "Sure! One check or separate?",
        "cn": "好的！一起算还是分开算？"
      },
      {
        "speaker": "You",
        "en": "Uh, we actually need to split it. Is it OK to put it on three different cards?",
        "cn": "呃，我们要分开付。可以刷三张不同的卡吗？"
      },
      {
        "speaker": "Waiter",
        "en": "No problem at all. Want me to split it evenly three ways?",
        "cn": "完全没问题。要平均分成三份吗？"
      },
      {
        "speaker": "You",
        "en": "Hmm, actually it's kinda tricky. I had the sea bass which was more expensive...",
        "cn": "嗯，其实有点麻烦。我点了鲈鱼，那个比较贵……"
      },
      {
        "speaker": "Friend",
        "en": "Dude, don't worry about it. Let's just split it evenly. It's easier.",
        "cn": "哥们，别纠结了。平均分吧，简单点。"
      },
      {
        "speaker": "You",
        "en": "You sure? I feel bad 'cause my dish was like twenty bucks more than yours.",
        "cn": "你确定？我那道菜比你的贵了差不多二十块，有点过意不去。"
      },
      {
        "speaker": "Friend",
        "en": "Seriously, it's fine. We all shared the appetizers anyway.",
        "cn": "真的没事。反正开胃菜大家都吃了。"
      },
      {
        "speaker": "You",
        "en": "OK, fair enough. Three ways even then, please.",
        "cn": "好吧，也是。那就平均分三份吧。"
      },
      {
        "speaker": "Waiter",
        "en": "Got it. So your total is a hundred and twenty dollars before tip. That's forty each.",
        "cn": "好的。不含小费总共一百二十美元，每人四十。"
      },
      {
        "speaker": "You",
        "en": "What do you guys wanna tip? Like eighteen or twenty percent?",
        "cn": "你们想给多少小费？百分之十八还是二十？"
      },
      {
        "speaker": "Friend",
        "en": "The service was great, let's do twenty.",
        "cn": "服务挺好的，给百分之二十吧。"
      },
      {
        "speaker": "You",
        "en": "Agreed. So that's forty-eight each with tip. Everyone cool with that?",
        "cn": "同意。那加上小费每人四十八。大家没问题吧？"
      },
      {
        "speaker": "Friend",
        "en": "Works for me. Here's my card.",
        "cn": "没问题。这是我的卡。"
      },
      {
        "speaker": "You",
        "en": "Here's mine too. Thanks for splitting it for us.",
        "cn": "我的也给你。谢谢帮我们分开算。"
      },
      {
        "speaker": "Waiter",
        "en": "Of course. I'll be right back with the receipts.",
        "cn": "没事。我马上把收据拿过来。"
      },
      {
        "speaker": "You",
        "en": "Oh wait — before you go, can we get some to-go boxes? We've got a ton of leftovers.",
        "cn": "等一下——你走之前，能给我们几个打包盒吗？剩了好多菜。"
      },
      {
        "speaker": "Waiter",
        "en": "Absolutely. I'll bring some right over. You've got enough food for another meal there!",
        "cn": "当然。我马上拿过来。你们这些剩菜够再吃一顿了！"
      },
      {
        "speaker": "You",
        "en": "Ha, yeah. Leftover Chinese food for lunch tomorrow — honestly the best part.",
        "cn": "哈，是啊。明天午饭吃剩菜——说真的这才是最好的部分。"
      }
    ]
  },
  {
    "id": "restaurant-chinese-5",
    "cat": "restaurant",
    "catName": "餐馆点餐",
    "catEmoji": "🍽️",
    "title": "Complaining about Wrong Order",
    "titleCn": "中餐馆上错菜",
    "emoji": "😤",
    "lines": [
      {
        "speaker": "Waiter",
        "en": "Here you go — kung pao shrimp and the beef with broccoli.",
        "cn": "来了——宫保虾仁和西兰花牛肉。"
      },
      {
        "speaker": "You",
        "en": "Um, sorry, I think there might be a mix-up. I ordered kung pao chicken, not shrimp.",
        "cn": "呃，不好意思，好像弄错了。我点的是宫保鸡丁，不是虾仁。"
      },
      {
        "speaker": "Waiter",
        "en": "Oh, really? Let me check the ticket... You're right, my apologies. I'll get that fixed.",
        "cn": "是吗？我看看单子……您说得对，抱歉。我马上给您换。"
      },
      {
        "speaker": "You",
        "en": "No worries, it happens. How long will the chicken take?",
        "cn": "没关系，这种事难免。鸡丁大概要多久？"
      },
      {
        "speaker": "Waiter",
        "en": "Shouldn't be more than five or six minutes. I'll rush it for you.",
        "cn": "应该不超过五六分钟。我让厨房加快做。"
      },
      {
        "speaker": "You",
        "en": "Thanks, I appreciate it. Oh, and actually, this beef with broccoli doesn't look right either.",
        "cn": "谢谢，很感谢。哦对了，这个西兰花牛肉看着也不太对。"
      },
      {
        "speaker": "Waiter",
        "en": "What do you mean? What's wrong with it?",
        "cn": "怎么了？哪里不对？"
      },
      {
        "speaker": "You",
        "en": "I asked for it without oyster sauce because I'm allergic, but I can see it's got the dark sauce on it.",
        "cn": "我说了不要蚝油因为我过敏，但是上面明显有深色的酱汁。"
      },
      {
        "speaker": "Waiter",
        "en": "Oh gosh, I'm so sorry about that. That's definitely oyster sauce. Let me take that back right away.",
        "cn": "天哪，真的非常抱歉。那确实是蚝油。我马上拿走。"
      },
      {
        "speaker": "You",
        "en": "Yeah, please. An allergy is kind of a big deal, you know?",
        "cn": "好的，麻烦了。过敏这种事可不是小事。"
      },
      {
        "speaker": "Waiter",
        "en": "You're absolutely right, and I apologize. I should have flagged it in the kitchen. I'll make sure the new one is oyster-sauce free.",
        "cn": "您说得完全对，我道歉。我应该在厨房特别标注的。新做的这份我会确保不放蚝油。"
      },
      {
        "speaker": "You",
        "en": "Thank you. Can you also double-check with the chef directly? I don't wanna take any chances.",
        "cn": "谢谢。能直接跟厨师确认一下吗？我不想冒任何风险。"
      },
      {
        "speaker": "Waiter",
        "en": "Absolutely, I'll talk to the chef myself. And I want you to know, we're going to comp that dish for you.",
        "cn": "当然，我会亲自跟厨师说。而且这道菜我们给您免单。"
      },
      {
        "speaker": "You",
        "en": "Oh, you don't have to do that. I just want it made correctly.",
        "cn": "不用这样。我只是希望做对就行。"
      },
      {
        "speaker": "Waiter",
        "en": "I insist. Getting an allergy order wrong is on us, one hundred percent.",
        "cn": "我坚持。过敏的单子搞错了完全是我们的责任。"
      },
      {
        "speaker": "You",
        "en": "Well, thanks. I really do appreciate you taking it seriously.",
        "cn": "那谢谢了。你们认真对待这件事我很感激。"
      },
      {
        "speaker": "Waiter",
        "en": "Of course. Can I get you anything while you wait? Maybe some tea on the house?",
        "cn": "应该的。等菜的时候要来点什么吗？赠送您一壶茶？"
      },
      {
        "speaker": "You",
        "en": "A hot tea would be great, actually. Jasmine if you have it.",
        "cn": "热茶挺好的。有茉莉花茶的话就来一壶。"
      },
      {
        "speaker": "Waiter",
        "en": "Coming right up. Again, I'm really sorry about all this.",
        "cn": "马上来。再次为这些失误向您道歉。"
      },
      {
        "speaker": "You",
        "en": "It's OK. Mistakes happen — I just appreciate how you're handling it. Thanks.",
        "cn": "没事。谁都会犯错——你们的处理方式让我很满意。谢谢。"
      }
    ]
  },
  {
    "id": "restaurant-western-1",
    "cat": "restaurant",
    "catName": "餐馆点餐",
    "catEmoji": "🍽️",
    "title": "Fine Dining Reservation",
    "titleCn": "西餐馆预约",
    "emoji": "🍷",
    "lines": [
      {
        "speaker": "Host",
        "en": "Good evening, thank you for calling La Maison. How can I help you?",
        "cn": "晚上好，感谢致电La Maison餐厅。请问有什么可以帮您的？"
      },
      {
        "speaker": "You",
        "en": "Hi, I'd like to make a reservation for this Saturday evening, if possible.",
        "cn": "你好，我想订这周六晚上的位子，不知道还有没有？"
      },
      {
        "speaker": "Host",
        "en": "Saturday evening — let me check. What time were you thinking?",
        "cn": "周六晚上——我查一下。您想订几点的？"
      },
      {
        "speaker": "You",
        "en": "Around seven or seven-thirty? It's for a special occasion — our anniversary.",
        "cn": "七点或七点半左右？是个特殊场合——我们的结婚纪念日。"
      },
      {
        "speaker": "Host",
        "en": "Oh, congratulations! I have an opening at seven-fifteen. How many guests?",
        "cn": "恭喜！七点一刻有一个空位。请问几位？"
      },
      {
        "speaker": "You",
        "en": "Just two. And if it's not too much trouble, could we get a quieter table?",
        "cn": "就两位。如果不麻烦的话，能安排一个安静点的位子吗？"
      },
      {
        "speaker": "Host",
        "en": "Of course. I can seat you in our garden room — it's more intimate and really lovely in the evening.",
        "cn": "当然可以。我可以给您安排在花园厅——那里更私密，晚上氛围很好。"
      },
      {
        "speaker": "You",
        "en": "That sounds perfect. Is there a dress code I should know about?",
        "cn": "听起来太好了。有什么着装要求吗？"
      },
      {
        "speaker": "Host",
        "en": "We ask for business casual at minimum. No shorts or flip-flops, but you don't need a full suit or anything.",
        "cn": "至少要商务休闲装。不能穿短裤和人字拖，但不需要穿正式西装。"
      },
      {
        "speaker": "You",
        "en": "Got it. And do you guys do any kind of special setup for anniversaries?",
        "cn": "明白了。你们有没有针对纪念日的特别布置？"
      },
      {
        "speaker": "Host",
        "en": "We do! We can arrange flowers and candles at the table, and our pastry chef does a beautiful dessert plate with a message.",
        "cn": "有的！我们可以在桌上摆上鲜花和蜡烛，我们的甜点师还可以做一个带祝福语的精美甜点盘。"
      },
      {
        "speaker": "You",
        "en": "Oh that's awesome. Yeah, let's do the flowers and the dessert plate. Can it say \"Happy Anniversary\"?",
        "cn": "太棒了。好，要鲜花和甜点盘。上面可以写\"结婚纪念日快乐\"吗？"
      },
      {
        "speaker": "Host",
        "en": "Absolutely. Is there an extra charge? It's twenty-five dollars for the flowers and the dessert is complimentary.",
        "cn": "当然可以。需要额外收费吗？鲜花二十五美元，甜点是赠送的。"
      },
      {
        "speaker": "You",
        "en": "That's totally fine. Oh, one more thing — my wife is vegetarian. Do you have good veggie options?",
        "cn": "完全没问题。哦还有一件事——我太太是素食者。你们有好的素食选择吗？"
      },
      {
        "speaker": "Host",
        "en": "Definitely. Our chef actually has a full vegetarian tasting menu. It's five courses and it's phenomenal.",
        "cn": "当然有。我们厨师实际上有一套完整的素食品鉴菜单。五道菜，非常出色。"
      },
      {
        "speaker": "You",
        "en": "She'd love that. Can I book that for her and the regular tasting menu for me?",
        "cn": "她肯定喜欢。能给她订素食品鉴菜单，我要普通的品鉴菜单吗？"
      },
      {
        "speaker": "Host",
        "en": "Absolutely. I'll note all of that in your reservation. Can I get your name and a phone number?",
        "cn": "当然可以。我会把这些都备注在您的预订信息里。请问您的姓名和电话号码？"
      },
      {
        "speaker": "You",
        "en": "Sure, it's David Chen, and my number is 415-555-0182.",
        "cn": "好的，我叫David Chen，电话是415-555-0182。"
      },
      {
        "speaker": "Host",
        "en": "Perfect. So that's Saturday at seven-fifteen, party of two, garden room, anniversary setup. Anything else?",
        "cn": "好的。那就是周六七点一刻，两位，花园厅，纪念日布置。还有其他的吗？"
      },
      {
        "speaker": "You",
        "en": "Nope, that covers it. We're really looking forward to it. Thank you so much!",
        "cn": "没有了，都安排好了。我们非常期待。太感谢了！"
      }
    ]
  },
  {
    "id": "restaurant-western-2",
    "cat": "restaurant",
    "catName": "餐馆点餐",
    "catEmoji": "🍽️",
    "title": "Ordering Steak and Wine",
    "titleCn": "西餐馆点牛排红酒",
    "emoji": "🥩",
    "lines": [
      {
        "speaker": "Waiter",
        "en": "Good evening. Have you had a chance to look over the menu?",
        "cn": "晚上好。菜单看过了吗？"
      },
      {
        "speaker": "You",
        "en": "Yeah, I think we're ready. I'm definitely getting the ribeye. How do you guys cook it here?",
        "cn": "嗯，我们准备好了。我肯定要肋眼牛排。你们这里是怎么做的？"
      },
      {
        "speaker": "Waiter",
        "en": "It's a sixteen-ounce bone-in ribeye, grilled over charcoal. How would you like it cooked?",
        "cn": "是十六盎司带骨肋眼，用炭火烤的。您想要几分熟？"
      },
      {
        "speaker": "You",
        "en": "Medium-rare, please. Nice and pink in the center.",
        "cn": "三分熟吧。中间要好看的粉色。"
      },
      {
        "speaker": "Waiter",
        "en": "Excellent choice. That comes with your choice of two sides. We have roasted potatoes, asparagus, creamed spinach, or a house salad.",
        "cn": "很好的选择。配两道配菜，有烤土豆、芦笋、奶油菠菜和餐厅沙拉可选。"
      },
      {
        "speaker": "You",
        "en": "I'll do the roasted potatoes and asparagus.",
        "cn": "我要烤土豆和芦笋。"
      },
      {
        "speaker": "Waiter",
        "en": "Great. And for you, ma'am?",
        "cn": "好的。女士您呢？"
      },
      {
        "speaker": "You",
        "en": "She'll have the filet mignon, medium. With the creamed spinach and salad.",
        "cn": "她要菲力牛排，五分熟。配奶油菠菜和沙拉。"
      },
      {
        "speaker": "Waiter",
        "en": "Perfect. Now, would you like to see our wine list? We have some great pairings for steak.",
        "cn": "好的。要看看酒单吗？我们有很棒的牛排配酒。"
      },
      {
        "speaker": "You",
        "en": "For sure. What do you recommend with a ribeye? I'm into red wines but I'm no expert.",
        "cn": "当然要看。配肋眼你推荐什么？我喜欢红酒但不太懂。"
      },
      {
        "speaker": "Waiter",
        "en": "You can't go wrong with a Cabernet Sauvignon. We have a really nice Napa Valley Cab — it's bold and goes perfectly with the charcoal flavor.",
        "cn": "赤霞珠绝对不会错。我们有一款很不错的纳帕谷赤霞珠——口感浓郁，跟炭烤的风味特别搭。"
      },
      {
        "speaker": "You",
        "en": "What's the price on that?",
        "cn": "那款多少钱？"
      },
      {
        "speaker": "Waiter",
        "en": "By the bottle it's sixty-five, or fourteen a glass.",
        "cn": "一瓶六十五，一杯十四。"
      },
      {
        "speaker": "You",
        "en": "Let's just go with the bottle since we're both drinking. Might as well, right?",
        "cn": "那就要一瓶吧，反正我们俩都喝。不要白不要，对吧？"
      },
      {
        "speaker": "Waiter",
        "en": "Absolutely, way better deal. I'll bring it right out so it can breathe a little.",
        "cn": "那当然，划算多了。我马上拿过来，让它醒一会儿。"
      },
      {
        "speaker": "You",
        "en": "Sounds good. Oh, and could we start with the bruschetta?",
        "cn": "好的。对了，能先来一份意式烤面包吗？"
      },
      {
        "speaker": "Waiter",
        "en": "Of course. The bruschetta here is house-made with heirloom tomatoes and fresh basil. You're gonna love it.",
        "cn": "当然可以。我们的烤面包是自制的，用的是传家宝番茄和新鲜罗勒。您一定会喜欢。"
      },
      {
        "speaker": "You",
        "en": "Can't wait. One last thing — do you do any steak sauces? Like a peppercorn or béarnaise?",
        "cn": "太期待了。最后一个问题——有牛排酱汁吗？比如黑椒汁或者伯那西酱？"
      },
      {
        "speaker": "Waiter",
        "en": "We have both! The peppercorn cream sauce is our most popular. I'd highly recommend it.",
        "cn": "都有！黑椒奶油酱是我们最受欢迎的，强烈推荐。"
      },
      {
        "speaker": "You",
        "en": "Perfect, I'll get the peppercorn on the side. Thanks a lot, man.",
        "cn": "好，黑椒酱单独放旁边。多谢了。"
      }
    ]
  },
  {
    "id": "restaurant-western-3",
    "cat": "restaurant",
    "catName": "餐馆点餐",
    "catEmoji": "🍽️",
    "title": "Asking for the Check",
    "titleCn": "西餐馆买单",
    "emoji": "🧾",
    "lines": [
      {
        "speaker": "Waiter",
        "en": "How was everything tonight? Can I tempt you with our dessert menu?",
        "cn": "今晚吃得怎么样？要看看甜点菜单吗？"
      },
      {
        "speaker": "You",
        "en": "Everything was incredible, honestly. But I think we're stuffed. Just the check, please.",
        "cn": "说真的，一切都太棒了。但我们真的吃撑了。买单吧。"
      },
      {
        "speaker": "Waiter",
        "en": "No dessert? Not even our famous chocolate lava cake?",
        "cn": "不要甜点吗？连我们招牌的巧克力熔岩蛋糕也不要？"
      },
      {
        "speaker": "You",
        "en": "Oh man, you're making it hard to say no. But really, I can't eat another bite.",
        "cn": "你这让我好难拒绝啊。但真的，一口也吃不下了。"
      },
      {
        "speaker": "Waiter",
        "en": "Ha, I understand. Let me grab the check for you. I'll be right back.",
        "cn": "哈，理解。我去给你们拿账单，马上回来。"
      },
      {
        "speaker": "You",
        "en": "Thanks. Oh wait, real quick — do you guys take American Express?",
        "cn": "谢谢。等一下，你们收美国运通卡吗？"
      },
      {
        "speaker": "Waiter",
        "en": "We do! Visa, Mastercard, Amex — all of them.",
        "cn": "收的！Visa、万事达、运通卡都可以。"
      },
      {
        "speaker": "You",
        "en": "Great. And there isn't an automatic gratuity added, right? I wanna leave the tip myself.",
        "cn": "好。没有自动加服务费吧？我想自己留小费。"
      },
      {
        "speaker": "Waiter",
        "en": "Nope, no auto-grat unless it's a party of six or more. You're all good.",
        "cn": "没有，六人以上才会自动加。你们这桌不会。"
      },
      {
        "speaker": "You",
        "en": "Perfect.",
        "cn": "好的。"
      },
      {
        "speaker": "Waiter",
        "en": "Here's your check. No rush at all — take your time.",
        "cn": "这是账单。不着急，慢慢来。"
      },
      {
        "speaker": "You",
        "en": "Let's see... OK, so the total is a hundred and forty-two dollars. That seems right.",
        "cn": "看看……好，总共一百四十二美元。数目对的。"
      },
      {
        "speaker": "Waiter",
        "en": "That includes the bottle of wine, two entrees, and the appetizer.",
        "cn": "包括了一瓶红酒、两份主菜和开胃菜。"
      },
      {
        "speaker": "You",
        "en": "Yep, that all checks out. I'm gonna put the whole thing on my card.",
        "cn": "嗯，都对。我全部刷卡。"
      },
      {
        "speaker": "Waiter",
        "en": "Sounds good. I'll run that for you.",
        "cn": "好的，我去刷卡。"
      },
      {
        "speaker": "You",
        "en": "Oh, can you bring back a pen? I need to fill in the tip on the receipt.",
        "cn": "能带一支笔回来吗？我要在收据上写小费。"
      },
      {
        "speaker": "Waiter",
        "en": "Of course! Here you go — card's been approved and here's your receipt.",
        "cn": "当然！给您——卡已经通过了，这是收据。"
      },
      {
        "speaker": "You",
        "en": "Awesome. The service was really outstanding tonight, by the way.",
        "cn": "太好了。顺便说一下，今晚的服务真的很棒。"
      },
      {
        "speaker": "Waiter",
        "en": "That really means a lot, thank you. It was a pleasure serving you both.",
        "cn": "这对我来说很重要，谢谢。很荣幸为你们服务。"
      },
      {
        "speaker": "You",
        "en": "We'll definitely be back. Have a good night!",
        "cn": "我们一定会再来的。晚安！"
      }
    ]
  },
  {
    "id": "restaurant-western-4",
    "cat": "restaurant",
    "catName": "餐馆点餐",
    "catEmoji": "🍽️",
    "title": "Sending Food Back",
    "titleCn": "西餐馆退菜",
    "emoji": "🔙",
    "lines": [
      {
        "speaker": "Waiter",
        "en": "Here's your pan-seared salmon and the risotto. Enjoy!",
        "cn": "这是您的香煎三文鱼和意大利烩饭。请慢用！"
      },
      {
        "speaker": "You",
        "en": "Thanks. Hmm, actually... I hate to be that person, but this salmon seems really undercooked.",
        "cn": "谢谢。嗯，其实……我不太好意思说，但这个三文鱼好像没熟。"
      },
      {
        "speaker": "Waiter",
        "en": "Oh, I'm sorry to hear that. May I take a look?",
        "cn": "抱歉。我能看一下吗？"
      },
      {
        "speaker": "You",
        "en": "Yeah, look — the center is basically still raw. I asked for it well done.",
        "cn": "你看——中间基本上还是生的。我要的是全熟。"
      },
      {
        "speaker": "Waiter",
        "en": "You're right, that's definitely not well done. I sincerely apologize. Let me take it back to the kitchen.",
        "cn": "您说得对，这肯定不是全熟。非常抱歉。我拿回厨房。"
      },
      {
        "speaker": "You",
        "en": "Can they actually just cook it more, or do they need to start from scratch?",
        "cn": "他们能直接再煎一下，还是需要重新做？"
      },
      {
        "speaker": "Waiter",
        "en": "I'd recommend we start fresh so the quality is right. It'll take about eight minutes, if that's OK.",
        "cn": "我建议重新做，这样质量有保证。大概需要八分钟，可以吗？"
      },
      {
        "speaker": "You",
        "en": "That's fine. I'd rather wait and get it done right.",
        "cn": "没问题。我宁愿等一下也要吃到做好的。"
      },
      {
        "speaker": "Waiter",
        "en": "Absolutely. And again, I'm really sorry about that. Can I bring you some bread while you wait?",
        "cn": "当然。再次为此道歉。等菜的时候给您来些面包好吗？"
      },
      {
        "speaker": "You",
        "en": "Sure, that'd be nice. And the risotto is actually really good, so I'll work on that.",
        "cn": "好啊。而且烩饭其实很好吃，我先吃这个。"
      },
      {
        "speaker": "Waiter",
        "en": "Glad to hear the risotto is good! I'll have your salmon out as quickly as possible.",
        "cn": "很高兴烩饭不错！三文鱼我会尽快给您送上。"
      },
      {
        "speaker": "You",
        "en": "No rush. These things happen. I worked in restaurants before, so I get it.",
        "cn": "不着急。这种事难免的。我以前也在餐厅工作过，理解。"
      },
      {
        "speaker": "Waiter",
        "en": "That's really kind of you to say. Here's some warm bread and butter for you.",
        "cn": "您这么说真是太好了。这是给您的热面包和黄油。"
      },
      {
        "speaker": "You",
        "en": "Thank you. Oh, and the bread is warm — that's a nice touch.",
        "cn": "谢谢。面包是热的——这个细节很好。"
      },
      {
        "speaker": "Waiter",
        "en": "Alright, here's your new salmon. We made sure it's well done this time. Wanna check it?",
        "cn": "好了，新的三文鱼来了。这次确保做到了全熟。您检查一下？"
      },
      {
        "speaker": "You",
        "en": "Let me cut into it... yeah, this is perfect. Cooked all the way through. Thank you.",
        "cn": "我切开看看……嗯，这次很好。完全熟了。谢谢。"
      },
      {
        "speaker": "Waiter",
        "en": "Great. And just so you know, the manager wanted me to let you know that salmon is on us tonight.",
        "cn": "太好了。另外经理让我告诉您，今晚这份三文鱼免单。"
      },
      {
        "speaker": "You",
        "en": "Oh wow, that's really generous. You don't have to do that.",
        "cn": "哇，太慷慨了。不用这样的。"
      },
      {
        "speaker": "Waiter",
        "en": "We insist. We want to make sure you have a great experience here.",
        "cn": "我们坚持。我们希望您在这里有完美的用餐体验。"
      },
      {
        "speaker": "You",
        "en": "Well, I really appreciate it. And honestly, the way you handled this was top-notch. I'll leave a great review.",
        "cn": "那真的非常感谢。说实话，你们处理这件事的方式非常专业。我会留一个好评的。"
      }
    ]
  },
  {
    "id": "restaurant-western-5",
    "cat": "restaurant",
    "catName": "餐馆点餐",
    "catEmoji": "🍽️",
    "title": "Leaving a Tip",
    "titleCn": "西餐馆给小费",
    "emoji": "💰",
    "lines": [
      {
        "speaker": "Friend",
        "en": "Hey, so the check came. How much should we tip?",
        "cn": "账单来了。我们给多少小费？"
      },
      {
        "speaker": "You",
        "en": "Hmm, let me think. The service was pretty good tonight. I'd say at least twenty percent.",
        "cn": "嗯，让我想想。今晚服务挺好的。我觉得至少给百分之二十。"
      },
      {
        "speaker": "Friend",
        "en": "Twenty percent? Isn't that a lot? In my country we don't really tip at all.",
        "cn": "百分之二十？是不是太多了？在我们国家根本不需要给小费。"
      },
      {
        "speaker": "You",
        "en": "Yeah, I know it's different. But here in the States, waiters depend on tips. It's a huge part of their income.",
        "cn": "我知道各地不一样。但在美国，服务员靠小费吃饭。这是他们收入很大的一部分。"
      },
      {
        "speaker": "Friend",
        "en": "So what's considered normal? Like what's the minimum?",
        "cn": "那一般给多少？最低给多少？"
      },
      {
        "speaker": "You",
        "en": "Fifteen percent is basically the bare minimum for OK service. Eighteen to twenty is standard for good service.",
        "cn": "百分之十五基本上是还行的服务的最低标准。百分之十八到二十是好服务的常规水平。"
      },
      {
        "speaker": "Friend",
        "en": "And if the service is bad?",
        "cn": "那服务不好呢？"
      },
      {
        "speaker": "You",
        "en": "Even then, most people still leave at least ten to fifteen percent. Leaving nothing is like, a really strong statement.",
        "cn": "即使那样，大多数人还是会留百分之十到十五。一分不给的话等于是在强烈表达不满。"
      },
      {
        "speaker": "Friend",
        "en": "Wow, that's so different from home. OK, so how do we calculate it?",
        "cn": "跟我们那儿差别也太大了。好，那怎么算？"
      },
      {
        "speaker": "You",
        "en": "Easy — the total before tax is eighty bucks. Twenty percent of that is sixteen dollars.",
        "cn": "很简单——税前总额是八十块。百分之二十就是十六块。"
      },
      {
        "speaker": "Friend",
        "en": "Do you tip on the tax amount too?",
        "cn": "税金部分也要给小费吗？"
      },
      {
        "speaker": "You",
        "en": "Some people do, some don't. Technically you're supposed to tip on the pre-tax amount, but honestly a couple extra bucks doesn't hurt.",
        "cn": "有人给有人不给。理论上应该按税前金额算，但说实话多几块钱也无所谓。"
      },
      {
        "speaker": "Friend",
        "en": "OK, makes sense. And do we write the tip on the receipt?",
        "cn": "好，明白了。小费是写在收据上吗？"
      },
      {
        "speaker": "You",
        "en": "Yeah, see this line here? You write the tip amount, then add it to the total, and write the new total on the bottom line.",
        "cn": "对，看到这一行了吗？在这里写小费金额，然后加上总额，把新的总计写在最下面一行。"
      },
      {
        "speaker": "Friend",
        "en": "What if I want to pay cash for the tip instead?",
        "cn": "如果我想用现金给小费呢？"
      },
      {
        "speaker": "You",
        "en": "You can totally do that. Just leave the cash on the table and write \"cash\" on the tip line of the receipt.",
        "cn": "完全可以。把现金放在桌上，然后在收据的小费那一行写\"cash\"就行。"
      },
      {
        "speaker": "Friend",
        "en": "Got it. Is there anything else I should know about tipping in America?",
        "cn": "明白了。还有什么关于在美国给小费的注意事项吗？"
      },
      {
        "speaker": "You",
        "en": "Oh yeah — you also tip bartenders, delivery drivers, hairstylists, taxi drivers... basically anyone in service.",
        "cn": "还有很多——酒保、外卖送餐员、理发师、出租车司机……基本上所有服务行业的人都要给。"
      },
      {
        "speaker": "Friend",
        "en": "That's a lot of tipping. How much for those?",
        "cn": "要给的地方也太多了。那些给多少？"
      },
      {
        "speaker": "You",
        "en": "It varies. A dollar or two per drink for bartenders, fifteen to twenty percent for everything else. You'll get the hang of it.",
        "cn": "不一定。酒保每杯酒一两块钱，其他的百分之十五到二十。你慢慢就习惯了。"
      }
    ]
  },
  {
    "id": "restaurant-burger-1",
    "cat": "restaurant",
    "catName": "餐馆点餐",
    "catEmoji": "🍽️",
    "title": "Ordering a Combo at In-N-Out",
    "titleCn": "在In-N-Out点餐",
    "emoji": "🍔",
    "lines": [
      {
        "speaker": "Cashier",
        "en": "Hi, welcome to In-N-Out! What can I get for you?",
        "cn": "嗨，欢迎来到In-N-Out！要点什么？"
      },
      {
        "speaker": "You",
        "en": "Hey! Uh, this is actually my first time here. What do you recommend?",
        "cn": "嗨！呃，我其实是第一次来。你推荐什么？"
      },
      {
        "speaker": "Cashier",
        "en": "Oh, you're in for a treat! Most people go for the Double-Double. That's two patties, two slices of cheese.",
        "cn": "那你有口福了！大多数人都选Double-Double，就是两个肉饼加两片芝士。"
      },
      {
        "speaker": "You",
        "en": "That sounds good. I've heard you guys have a secret menu too?",
        "cn": "听起来不错。我听说你们还有隐藏菜单？"
      },
      {
        "speaker": "Cashier",
        "en": "Ha, yeah! The most popular one is Animal Style — we add grilled onions, pickles, extra spread, and the patty is cooked in mustard.",
        "cn": "哈，没错！最受欢迎的是Animal Style——加烤洋葱、酸黄瓜、多放酱料，肉饼用芥末煎的。"
      },
      {
        "speaker": "You",
        "en": "Whoa, that sounds amazing. OK, I'll get a Double-Double Animal Style.",
        "cn": "天哪，听起来太棒了。好，我要一个Animal Style的Double-Double。"
      },
      {
        "speaker": "Cashier",
        "en": "Great choice. Want fries with that? We've got regular or you can get those Animal Style too.",
        "cn": "好选择。要薯条吗？普通的或者也可以做成Animal Style。"
      },
      {
        "speaker": "You",
        "en": "What are Animal Style fries like?",
        "cn": "Animal Style薯条是怎样的？"
      },
      {
        "speaker": "Cashier",
        "en": "They're topped with melted cheese, grilled onions, and our spread. Super messy but so good.",
        "cn": "上面加了融化的芝士、烤洋葱和我们的酱料。超级不好拿但特别好吃。"
      },
      {
        "speaker": "You",
        "en": "You had me at melted cheese. Yeah, let me get those. And a chocolate shake.",
        "cn": "说到融化的芝士我就动心了。要一份。再来一杯巧克力奶昔。"
      },
      {
        "speaker": "Cashier",
        "en": "Nice, the shakes here are made with real ice cream. What size — regular?",
        "cn": "不错，我们的奶昔都是用真正的冰淇淋做的。要中杯的吗？"
      },
      {
        "speaker": "You",
        "en": "Yeah, regular is fine. How much is everything?",
        "cn": "嗯，中杯就好。一共多少钱？"
      },
      {
        "speaker": "Cashier",
        "en": "Let me ring that up... comes to eleven ninety-five.",
        "cn": "我算一下……一共十一块九毛五。"
      },
      {
        "speaker": "You",
        "en": "That's it? Wow, that's way cheaper than I expected.",
        "cn": "就这么多？比我想象的便宜多了。"
      },
      {
        "speaker": "Cashier",
        "en": "Yeah, we keep our prices pretty reasonable. That's the In-N-Out way! Cash or card?",
        "cn": "是的，我们的价格一直挺实惠的。这就是In-N-Out的风格！现金还是刷卡？"
      },
      {
        "speaker": "You",
        "en": "Card. Here you go.",
        "cn": "刷卡。给你。"
      },
      {
        "speaker": "Cashier",
        "en": "Alright, your number is sixty-three. We'll call you when it's ready.",
        "cn": "好的，您的号码是六十三号。做好了会叫您。"
      },
      {
        "speaker": "You",
        "en": "About how long is the wait?",
        "cn": "大概等多久？"
      },
      {
        "speaker": "Cashier",
        "en": "We're pretty busy right now, so maybe eight to ten minutes.",
        "cn": "现在比较忙，大概八到十分钟。"
      },
      {
        "speaker": "You",
        "en": "No problem. Thanks! I'm so hyped to try this.",
        "cn": "没事。谢谢！我已经迫不及待要尝了。"
      }
    ]
  },
  {
    "id": "restaurant-burger-2",
    "cat": "restaurant",
    "catName": "餐馆点餐",
    "catEmoji": "🍽️",
    "title": "Customizing Your Burger",
    "titleCn": "定制汉堡",
    "emoji": "🛠️",
    "lines": [
      {
        "speaker": "Cashier",
        "en": "Next in line! What can I get started for you?",
        "cn": "下一位！要点什么？"
      },
      {
        "speaker": "You",
        "en": "Can I get a cheeseburger, but I wanna customize it a bit.",
        "cn": "来一个芝士汉堡，不过我想自己搭配一下。"
      },
      {
        "speaker": "Cashier",
        "en": "Sure, go for it. What would you like?",
        "cn": "当然，你说吧。想怎么搭配？"
      },
      {
        "speaker": "You",
        "en": "First off, can I swap the regular bun for a lettuce wrap? I'm trying to cut carbs.",
        "cn": "首先，能把普通面包换成生菜包吗？我在减少碳水。"
      },
      {
        "speaker": "Cashier",
        "en": "Yep, we call that Protein Style. No problem.",
        "cn": "可以，我们叫这个Protein Style。没问题。"
      },
      {
        "speaker": "You",
        "en": "Cool. And can I get extra pickles? Like, a lot of pickles.",
        "cn": "好。能多加酸黄瓜吗？要很多很多酸黄瓜那种。"
      },
      {
        "speaker": "Cashier",
        "en": "Ha, you got it — extra extra pickles. Anything else?",
        "cn": "哈，没问题——超多酸黄瓜。还有别的吗？"
      },
      {
        "speaker": "You",
        "en": "Add grilled onions instead of raw, and can I get jalapeños on there?",
        "cn": "把生洋葱换成烤洋葱，能加墨西哥辣椒吗？"
      },
      {
        "speaker": "Cashier",
        "en": "Grilled onions, yes. Jalapeños — we actually have chopped chilies, would that work?",
        "cn": "烤洋葱可以。墨西哥辣椒——我们有切碎的辣椒，可以吗？"
      },
      {
        "speaker": "You",
        "en": "Yeah, that works. And I want the spread on the side, not on the burger.",
        "cn": "行，可以。还有酱料我要放旁边，不要涂在汉堡上。"
      },
      {
        "speaker": "Cashier",
        "en": "Spread on the side, got it. What kind of cheese — American or no cheese?",
        "cn": "酱料放旁边，好的。芝士要什么——美式芝士还是不要？"
      },
      {
        "speaker": "You",
        "en": "American is fine. Actually, can I do double cheese?",
        "cn": "美式芝士就行。对了，能双份芝士吗？"
      },
      {
        "speaker": "Cashier",
        "en": "Sure, that's a little extra. So to confirm: Protein Style cheeseburger, double cheese, grilled onions, extra pickles, chopped chilies, spread on the side.",
        "cn": "可以，要加一点钱。确认一下：Protein Style芝士汉堡，双份芝士，烤洋葱，多加酸黄瓜，切碎辣椒，酱料放旁边。"
      },
      {
        "speaker": "You",
        "en": "Wait, I also want tomato but no lettuce inside. I know I have the lettuce wrap but I don't want extra lettuce in the middle.",
        "cn": "等等，我还要番茄但里面不要生菜。我知道外面是生菜包，但中间不要再加生菜了。"
      },
      {
        "speaker": "Cashier",
        "en": "Tomato yes, no inner lettuce. Got it. You really know what you want!",
        "cn": "要番茄，里面不加生菜。好的。你真的很清楚自己要什么！"
      },
      {
        "speaker": "You",
        "en": "Haha, I'm a regular at Five Guys too. I like my burgers a certain way.",
        "cn": "哈哈，我也经常去Five Guys。我对汉堡有自己的要求。"
      },
      {
        "speaker": "Cashier",
        "en": "Nothing wrong with that! Want anything else with the burger?",
        "cn": "这没什么不好！汉堡之外还要别的吗？"
      },
      {
        "speaker": "You",
        "en": "Just a water. Gotta balance out the double cheese somehow, right?",
        "cn": "来杯水就好。双份芝士总得找点平衡嘛，对吧？"
      },
      {
        "speaker": "Cashier",
        "en": "Ha, fair enough. Your total is seven forty-five.",
        "cn": "哈，也是。一共七块四毛五。"
      },
      {
        "speaker": "You",
        "en": "Here you go. Man, I can already tell this burger is gonna be fire.",
        "cn": "给你。我已经能预感这个汉堡会超好吃了。"
      }
    ]
  },
  {
    "id": "restaurant-burger-3",
    "cat": "restaurant",
    "catName": "餐馆点餐",
    "catEmoji": "🍽️",
    "title": "Drive-Through at McDonald's",
    "titleCn": "麦当劳得来速",
    "emoji": "🚗",
    "lines": [
      {
        "speaker": "Speaker",
        "en": "Hi, welcome to McDonald's! Order whenever you're ready.",
        "cn": "您好，欢迎来到麦当劳！准备好了就点吧。"
      },
      {
        "speaker": "You",
        "en": "Hey, uh, can I get a Big Mac meal? Make it a large.",
        "cn": "嗨，呃，来一个巨无霸套餐？要大份的。"
      },
      {
        "speaker": "Speaker",
        "en": "Large Big Mac meal. What would you like to drink with that?",
        "cn": "大份巨无霸套餐。配什么饮料？"
      },
      {
        "speaker": "You",
        "en": "A Coke, please. Oh wait, do you guys still have the McFlurry with Oreo?",
        "cn": "可乐。哦等等，你们还有奥利奥麦旋风吗？"
      },
      {
        "speaker": "Speaker",
        "en": "Yes, we do! Regular or snack size?",
        "cn": "有的！要普通的还是小份的？"
      },
      {
        "speaker": "You",
        "en": "Snack size. And, hmm, let me add a ten-piece McNuggets too.",
        "cn": "小份的。然后嗯，再加一个十块装的麦乐鸡。"
      },
      {
        "speaker": "Speaker",
        "en": "What sauce for the nuggets? We have BBQ, sweet and sour, ranch, honey mustard, and hot mustard.",
        "cn": "麦乐鸡要什么蘸酱？有烧烤酱、糖醋酱、田园酱、蜂蜜芥末酱和辣芥末酱。"
      },
      {
        "speaker": "You",
        "en": "Can I get two BBQ and one sweet and sour?",
        "cn": "能给两个烧烤酱和一个糖醋酱吗？"
      },
      {
        "speaker": "Speaker",
        "en": "Sure thing. Anything else?",
        "cn": "没问题。还要别的吗？"
      },
      {
        "speaker": "You",
        "en": "Yeah, one more thing — a plain cheeseburger for my kid. No onions, no pickles, just cheese and ketchup.",
        "cn": "对，还有一个——给我孩子来一个普通芝士汉堡。不要洋葱不要酸黄瓜，只要芝士和番茄酱。"
      },
      {
        "speaker": "Speaker",
        "en": "One plain cheeseburger, cheese and ketchup only. Got it. Will that be all?",
        "cn": "一个普通芝士汉堡，只要芝士和番茄酱。好的。就这些吗？"
      },
      {
        "speaker": "You",
        "en": "Actually, you know what, throw in an apple juice box too. For the little one.",
        "cn": "想了想，再加一盒苹果汁吧。给小朋友的。"
      },
      {
        "speaker": "Speaker",
        "en": "Apple juice, got it. Your total is seventeen twenty-three. Please pull up to the first window.",
        "cn": "苹果汁，好的。一共十七块二毛三。请到第一个窗口。"
      },
      {
        "speaker": "You",
        "en": "Wait, is the ice cream machine working today? Wanna make sure before I commit to that McFlurry.",
        "cn": "等一下，今天冰淇淋机能用吗？我想确认一下再决定要不要麦旋风。"
      },
      {
        "speaker": "Speaker",
        "en": "Ha, I get that question a lot. Yes, it's working today! You're in luck.",
        "cn": "哈，这个问题我经常被问到。今天能用！你运气好。"
      },
      {
        "speaker": "You",
        "en": "Nice. OK, that's everything then.",
        "cn": "太好了。那就这些。"
      },
      {
        "speaker": "Speaker",
        "en": "Alright, first window please. Thanks for choosing McDonald's!",
        "cn": "好的，请到第一个窗口。感谢光临麦当劳！"
      },
      {
        "speaker": "You",
        "en": "Thanks. Oh, one more thing — can I get extra napkins? We always need a million of them.",
        "cn": "谢谢。对了再说一个——能多给点餐巾纸吗？我们每次都要用很多。"
      },
      {
        "speaker": "Speaker",
        "en": "No problem, we'll throw in extra napkins and some wet wipes for you.",
        "cn": "没问题，我们会多给你餐巾纸和湿巾。"
      },
      {
        "speaker": "You",
        "en": "You're a lifesaver. Thanks!",
        "cn": "你可帮了大忙了。谢谢！"
      }
    ]
  },
  {
    "id": "restaurant-burger-4",
    "cat": "restaurant",
    "catName": "餐馆点餐",
    "catEmoji": "🍽️",
    "title": "Using McDonald's App for Deals",
    "titleCn": "用麦当劳App优惠",
    "emoji": "📱",
    "lines": [
      {
        "speaker": "Cashier",
        "en": "Hi there! Ordering for here or to go?",
        "cn": "您好！在这吃还是带走？"
      },
      {
        "speaker": "You",
        "en": "For here. Hey, so I've got a coupon on the McDonald's app. Can I use it here?",
        "cn": "在这吃。对了，我麦当劳App上有一个优惠券。能在这用吗？"
      },
      {
        "speaker": "Cashier",
        "en": "Absolutely! What deal do you have?",
        "cn": "当然可以！你有什么优惠？"
      },
      {
        "speaker": "You",
        "en": "It says buy one Big Mac, get one free. Let me pull it up... hang on, my phone is being slow.",
        "cn": "上面说买一送一巨无霸。我找一下……等等，手机有点慢。"
      },
      {
        "speaker": "Cashier",
        "en": "No worries, take your time. Just show me the barcode when you're ready.",
        "cn": "没关系，不着急。准备好了给我看条形码就行。"
      },
      {
        "speaker": "You",
        "en": "OK, here it is. Can you scan this?",
        "cn": "好了，在这。你能扫一下吗？"
      },
      {
        "speaker": "Cashier",
        "en": "Let me try... yep, it went through! Two Big Macs, one is free.",
        "cn": "我试试……可以了！两个巨无霸，一个免费。"
      },
      {
        "speaker": "You",
        "en": "Awesome. Are there any other deals on the app today? I didn't really look through all of them.",
        "cn": "太好了。App上今天还有别的优惠吗？我没有都看完。"
      },
      {
        "speaker": "Cashier",
        "en": "I think there's a free medium fries with any purchase, and maybe a dollar off twenty-piece nuggets.",
        "cn": "好像有任意消费送中薯的活动，还有二十块装麦乐鸡减一块钱的。"
      },
      {
        "speaker": "You",
        "en": "Oh sweet, the free fries one — can I stack that with the Big Mac deal?",
        "cn": "不错，免费薯条那个——能和巨无霸的优惠叠加吗？"
      },
      {
        "speaker": "Cashier",
        "en": "Yep! You can use one deal per item, so the fries deal stacks fine since it's a different product.",
        "cn": "可以！每个商品用一个优惠，薯条是不同的商品所以可以叠加。"
      },
      {
        "speaker": "You",
        "en": "Man, this app is seriously clutch. Let me claim that fries deal too.",
        "cn": "这App真的太给力了。我把那个薯条优惠也领了。"
      },
      {
        "speaker": "Cashier",
        "en": "There you go. Scanned! Anything else you wanna add?",
        "cn": "好了，扫上了！还要加什么吗？"
      },
      {
        "speaker": "You",
        "en": "Two large drinks — one Sprite and one Dr Pepper.",
        "cn": "两杯大杯饮料——一杯雪碧一杯胡椒博士。"
      },
      {
        "speaker": "Cashier",
        "en": "Got it. Oh, you know what, you might wanna check the app for the points too. Every dollar you spend gets you a hundred points.",
        "cn": "好的。对了，你可以看看App上的积分。每消费一美元得一百积分。"
      },
      {
        "speaker": "You",
        "en": "Oh right, I forgot about the rewards program. How many points do I need for free stuff?",
        "cn": "对哦，我忘了还有积分奖励。多少积分能换免费的东西？"
      },
      {
        "speaker": "Cashier",
        "en": "Fifteen hundred points gets you a free menu item from the first tier, like a McChicken or a hash brown.",
        "cn": "一千五百积分可以换第一档的免费菜品，比如麦辣鸡腿堡或者薯饼。"
      },
      {
        "speaker": "You",
        "en": "Not bad at all. OK, I think I'm all set. What's my total?",
        "cn": "挺划算。好，我都点完了。一共多少？"
      },
      {
        "speaker": "Cashier",
        "en": "With the deals applied, your total is just eight fourteen. Saved you about seven bucks today!",
        "cn": "优惠后一共才八块一毛四。今天帮你省了大概七块钱！"
      },
      {
        "speaker": "You",
        "en": "Seven bucks? That's insane. I'm never ordering without the app again.",
        "cn": "七块钱？太疯狂了。以后再也不会不用App点餐了。"
      }
    ]
  },
  {
    "id": "restaurant-burger-5",
    "cat": "restaurant",
    "catName": "餐馆点餐",
    "catEmoji": "🍽️",
    "title": "Ordering for a Group at McDonald's",
    "titleCn": "麦当劳给一群人点餐",
    "emoji": "👥",
    "lines": [
      {
        "speaker": "Cashier",
        "en": "Welcome to McDonald's! Go ahead when you're ready.",
        "cn": "欢迎来到麦当劳！准备好了就点吧。"
      },
      {
        "speaker": "You",
        "en": "OK, so I'm ordering for like eight people, so bear with me. This is gonna be a big one.",
        "cn": "我要给大概八个人点餐，所以请多担待。这会是一个大单子。"
      },
      {
        "speaker": "Cashier",
        "en": "No problem! Take your time. I'll get it all in.",
        "cn": "没问题！慢慢来，我都记下来。"
      },
      {
        "speaker": "You",
        "en": "Alright. First, three Big Mac meals — two large and one medium. All with Coke.",
        "cn": "好。首先三个巨无霸套餐——两个大份一个中份。都配可乐。"
      },
      {
        "speaker": "Cashier",
        "en": "Three Big Mac meals, two large, one medium, all Coke. Got it. Next?",
        "cn": "三个巨无霸套餐，两大一中，都是可乐。好了。下一个？"
      },
      {
        "speaker": "You",
        "en": "Two Quarter Pounder meals, both large. One with Sprite, one with Hi-C Orange.",
        "cn": "两个巨无霸皇堡套餐，都要大份。一杯雪碧，一杯Hi-C橙汁。"
      },
      {
        "speaker": "Cashier",
        "en": "Do we still have Hi-C? Let me check... sorry, we switched to Minute Maid Orange. Is that OK?",
        "cn": "我们还有Hi-C吗？我查一下……抱歉，换成美汁源橙汁了。可以吗？"
      },
      {
        "speaker": "You",
        "en": "Uh, sure, that's fine. OK, then one ten-piece nuggets meal, large, with a Fanta.",
        "cn": "呃，行，没问题。然后一个十块装麦乐鸡套餐，大份，配芬达。"
      },
      {
        "speaker": "Cashier",
        "en": "Got it. What sauce?",
        "cn": "好的。要什么蘸酱？"
      },
      {
        "speaker": "You",
        "en": "Uh, she said ranch. And then one Filet-O-Fish meal, medium, with sweet tea.",
        "cn": "呃，她说要田园酱。然后一个麦香鱼套餐，中份，配甜茶。"
      },
      {
        "speaker": "Cashier",
        "en": "OK, that's seven so far. One more?",
        "cn": "好，到现在七份了。还有一个？"
      },
      {
        "speaker": "You",
        "en": "Yeah, the last person wants just a twenty-piece nuggets and a large fry. No drink.",
        "cn": "对，最后一个人只要二十块装麦乐鸡和一份大薯，不要饮料。"
      },
      {
        "speaker": "Cashier",
        "en": "Got it. So that's the full order? Want me to read it all back?",
        "cn": "好的。这就是全部了？要我念一遍确认吗？"
      },
      {
        "speaker": "You",
        "en": "Yes please. I wanna make sure I didn't mess anything up or everyone's gonna kill me.",
        "cn": "麻烦了。我得确认没搞错，不然他们要骂死我了。"
      },
      {
        "speaker": "Cashier",
        "en": "Ha! OK — three Big Mac meals, two large one medium all Coke. Two Quarter Pounder meals large, one Sprite one Minute Maid. One nuggets meal large with Fanta and ranch. One Filet-O-Fish medium with sweet tea. And a twenty-piece nuggets with large fry. Sound right?",
        "cn": "哈！好——三个巨无霸套餐两大一中都是可乐。两个皇堡套餐大份一杯雪碧一杯美汁源。一个麦乐鸡套餐大份配芬达和田园酱。一个麦香鱼套餐中份配甜茶。再加一个二十块装麦乐鸡和大薯。对吗？"
      },
      {
        "speaker": "You",
        "en": "Yep, that's perfect. What's the damage?",
        "cn": "没错，完全正确。一共多少钱？"
      },
      {
        "speaker": "Cashier",
        "en": "Alright... your total comes to seventy-three forty-eight.",
        "cn": "算一下……一共七十三块四毛八。"
      },
      {
        "speaker": "You",
        "en": "Ouch. I better be getting Venmo'd for this. Card, please.",
        "cn": "心疼。他们最好赶紧转账给我。刷卡吧。"
      },
      {
        "speaker": "Cashier",
        "en": "Ha, I feel that. It's gonna take about ten minutes for this size order, OK?",
        "cn": "哈，理解。这么大的单子大概要十分钟，可以吗？"
      },
      {
        "speaker": "You",
        "en": "That's fine. I'll start texting everyone to send me money while I wait.",
        "cn": "没问题。等着的时候我先发消息让他们都转账给我。"
      }
    ]
  },
  {
    "id": "restaurant-lanzhou-1",
    "cat": "restaurant",
    "catName": "餐馆点餐",
    "catEmoji": "🍽️",
    "title": "First Time at a Lanzhou Noodle Shop",
    "titleCn": "第一次去兰州拉面馆",
    "emoji": "🍜",
    "lines": [
      {
        "speaker": "Cashier",
        "en": "Hey, what can I get you?",
        "cn": "你好，要什么？"
      },
      {
        "speaker": "You",
        "en": "Hi! So, I've never been to a Lanzhou noodle shop before. My friend dragged me here and said I have to try it.",
        "cn": "嗨！我从来没来过兰州拉面馆。我朋友把我拉过来说一定得尝尝。"
      },
      {
        "speaker": "Cashier",
        "en": "Oh, nice! Well, you're in the right place. Everything is hand-pulled to order. Have you ever had hand-pulled noodles?",
        "cn": "不错！来对地方了。所有面都是现拉的。你吃过手工拉面吗？"
      },
      {
        "speaker": "You",
        "en": "I've had ramen, but I don't think that's the same thing, right?",
        "cn": "我吃过拉面，但好像不是一回事吧？"
      },
      {
        "speaker": "Cashier",
        "en": "Totally different! Our noodles are Chinese-style, pulled fresh right in front of you. The broth is beef-based, simmered for hours.",
        "cn": "完全不一样！我们的面是中式的，在你面前现拉。汤底是牛肉的，炖了好几个小时。"
      },
      {
        "speaker": "You",
        "en": "That sounds incredible. OK so what should I get for my first time?",
        "cn": "听起来太棒了。那第一次来我该点什么？"
      },
      {
        "speaker": "Cashier",
        "en": "I'd say start with our classic beef noodle soup. You get to pick your noodle thickness too.",
        "cn": "我建议从经典牛肉面开始。你还可以选面的粗细。"
      },
      {
        "speaker": "You",
        "en": "Wait, I can choose the thickness? That's so cool. What are the options?",
        "cn": "等等，还能选粗细？太酷了。有哪些选择？"
      },
      {
        "speaker": "Cashier",
        "en": "We've got thin, medium, wide, and extra wide. Thin is like angel hair, wide is like fettuccine, if that helps.",
        "cn": "有细的、中等的、宽的和特宽的。细的像天使面，宽的像意大利宽面，这样说好理解些。"
      },
      {
        "speaker": "You",
        "en": "Hmm, I'll go with medium. Seems like a safe bet for a first-timer.",
        "cn": "嗯，我选中等的吧。对第一次来的人来说比较稳妥。"
      },
      {
        "speaker": "Cashier",
        "en": "Smart choice. Medium is our most popular. It picks up the broth really well.",
        "cn": "聪明的选择。中等是我们最受欢迎的，很能吸汤汁。"
      },
      {
        "speaker": "You",
        "en": "Awesome. Is it spicy at all?",
        "cn": "太好了。辣不辣？"
      },
      {
        "speaker": "Cashier",
        "en": "The base broth isn't spicy, but we've got chili oil on the side if you want to add some kick.",
        "cn": "汤底不辣，但旁边有辣椒油，想加辣可以自己放。"
      },
      {
        "speaker": "You",
        "en": "Perfect. I'll add some myself. Can I also see the noodle-pulling? My friend said it's like watching a show.",
        "cn": "太好了。我自己加。能看拉面过程吗？我朋友说就像看表演一样。"
      },
      {
        "speaker": "Cashier",
        "en": "For sure! The kitchen is open — you can watch the chef pull your noodles right there through the window.",
        "cn": "当然！厨房是开放式的——你可以透过窗口看师傅给你拉面。"
      },
      {
        "speaker": "You",
        "en": "That's awesome. How long does it usually take?",
        "cn": "太棒了。一般要等多久？"
      },
      {
        "speaker": "Cashier",
        "en": "Just a few minutes. That's the beauty of hand-pulled noodles — they cook super fast once they hit the water.",
        "cn": "就几分钟。这就是手工拉面的好处——下锅后很快就熟了。"
      },
      {
        "speaker": "You",
        "en": "Way faster than I expected. Alright, one beef noodle soup, medium noodles.",
        "cn": "比我想的快多了。好，一碗牛肉面，中等粗细。"
      },
      {
        "speaker": "Cashier",
        "en": "That'll be twelve ninety-five. Grab a seat and we'll bring it out.",
        "cn": "十二块九毛五。找个位子坐，我们给您端上来。"
      },
      {
        "speaker": "You",
        "en": "Thanks! I'm honestly so excited. This smells unbelievable already.",
        "cn": "谢谢！说真的我好兴奋。已经闻到味道了，太香了。"
      }
    ]
  },
  {
    "id": "restaurant-lanzhou-2",
    "cat": "restaurant",
    "catName": "餐馆点餐",
    "catEmoji": "🍽️",
    "title": "Explaining Noodle Types to a Friend",
    "titleCn": "给朋友介绍拉面种类",
    "emoji": "📖",
    "lines": [
      {
        "speaker": "Friend",
        "en": "OK so I'm looking at this menu and I have no idea what any of this means. Help me out?",
        "cn": "我看了看这个菜单完全看不懂。能帮我解释一下吗？"
      },
      {
        "speaker": "You",
        "en": "Yeah, of course! So Lanzhou noodles are all about the noodle shape and thickness. That's the main thing you're choosing.",
        "cn": "当然！兰州拉面主要就是选面条的形状和粗细，这是你要选的重点。"
      },
      {
        "speaker": "Friend",
        "en": "OK, so what's the difference between all these noodle types?",
        "cn": "那这些面条种类有什么区别？"
      },
      {
        "speaker": "You",
        "en": "Alright, so the thinnest one is called mao xi — it's like hair-thin. Super delicate, almost melts in the soup.",
        "cn": "最细的叫毛细——像头发丝一样细。非常精致，几乎在汤里就化开了。"
      },
      {
        "speaker": "Friend",
        "en": "That sounds too thin for me. What's next?",
        "cn": "那个感觉太细了。再粗一点的呢？"
      },
      {
        "speaker": "You",
        "en": "Then there's xi de, which is just \"thin.\" Think spaghetti thickness. That's actually what I usually get.",
        "cn": "然后是细的，就是\"细面\"。差不多意大利面那么粗。我一般就点这个。"
      },
      {
        "speaker": "Friend",
        "en": "OK, what about something wider? I like thick noodles.",
        "cn": "那有没有更宽的？我喜欢粗面。"
      },
      {
        "speaker": "You",
        "en": "Then you'd want kuan de — that's the wide flat noodle, kind of like fettuccine. Really chewy and satisfying.",
        "cn": "那你可以选宽的——就是宽扁面条，有点像意大利宽面。嚼劲十足很过瘾。"
      },
      {
        "speaker": "Friend",
        "en": "Ooh, that sounds good. Is there anything even wider?",
        "cn": "听着不错。有更宽的吗？"
      },
      {
        "speaker": "You",
        "en": "Yeah, da kuan is extra wide — like a belt almost. It's thick and really substantial.",
        "cn": "有，大宽——像腰带一样宽。又厚又实在。"
      },
      {
        "speaker": "Friend",
        "en": "Like a belt? Ha, that's wild. OK, what do you recommend for me?",
        "cn": "像腰带？哈，太夸张了。那你推荐我吃哪种？"
      },
      {
        "speaker": "You",
        "en": "Honestly, for your first time, I'd go with er xi — that's medium. It's the crowd-pleaser.",
        "cn": "说实话，第一次来的话我推荐二细——就是中等粗细。大众最爱。"
      },
      {
        "speaker": "Friend",
        "en": "What about the broth? Is it all the same soup?",
        "cn": "汤呢？都是一样的汤吗？"
      },
      {
        "speaker": "You",
        "en": "The classic is the clear beef broth — it's been simmering for like twelve hours. Then you can also get dry-mixed noodles without soup.",
        "cn": "经典的是清汤牛肉汤——炖了大概十二个小时。你也可以选拌面，没有汤的。"
      },
      {
        "speaker": "Friend",
        "en": "Dry mixed? What's that like?",
        "cn": "拌面？那是什么样的？"
      },
      {
        "speaker": "You",
        "en": "It's the same hand-pulled noodles, but tossed with chili oil, vinegar, and minced meat. More like a noodle bowl than a soup.",
        "cn": "同样的手工拉面，但拌上辣椒油、醋和肉末。更像是拌面碗而不是汤面。"
      },
      {
        "speaker": "Friend",
        "en": "Hmm, I kinda want soup today since it's cold out. I'll do the medium noodle soup.",
        "cn": "嗯，今天外面挺冷的我想喝汤。我就要中等粗细的汤面吧。"
      },
      {
        "speaker": "You",
        "en": "Good call. Oh, and pro tip — add some of that chili oil and vinegar from the condiment table. Game changer.",
        "cn": "好选择。对了，小窍门——从调料台加一点辣椒油和醋。味道完全不一样。"
      },
      {
        "speaker": "Friend",
        "en": "Noted. Let's go order. You're paying though, since you're the one who brought me here.",
        "cn": "记住了。去点餐吧。不过你请客，毕竟是你带我来的。"
      },
      {
        "speaker": "You",
        "en": "Ha, fine, but only because this place is super cheap. You're gonna thank me later, trust me.",
        "cn": "哈，行吧，但只是因为这里超便宜。你以后会感谢我的，相信我。"
      }
    ]
  },
  {
    "id": "restaurant-lanzhou-3",
    "cat": "restaurant",
    "catName": "餐馆点餐",
    "catEmoji": "🍽️",
    "title": "Ordering Extra Toppings",
    "titleCn": "加料加菜",
    "emoji": "🥚",
    "lines": [
      {
        "speaker": "Cashier",
        "en": "What'll it be today?",
        "cn": "今天吃什么？"
      },
      {
        "speaker": "You",
        "en": "I'll have the regular beef noodle soup with thin noodles. But I wanna add some extra stuff.",
        "cn": "一碗普通牛肉面，要细面。但我想加点料。"
      },
      {
        "speaker": "Cashier",
        "en": "Sure, what would you like to add?",
        "cn": "好的，想加什么？"
      },
      {
        "speaker": "You",
        "en": "Can I get an extra egg? Like, a marinated egg if you have it.",
        "cn": "能加个鸡蛋吗？如果有卤蛋的话要卤蛋。"
      },
      {
        "speaker": "Cashier",
        "en": "We've got the tea egg, yeah. That's a dollar fifty extra.",
        "cn": "有茶叶蛋。加一块五。"
      },
      {
        "speaker": "You",
        "en": "Perfect. And can I get extra beef? The regular portion is kinda small for me.",
        "cn": "好。能加牛肉吗？普通份量对我来说有点少。"
      },
      {
        "speaker": "Cashier",
        "en": "Double meat is three bucks more. Worth it though — you get a lot more.",
        "cn": "加肉三块钱。不过很值——会多很多。"
      },
      {
        "speaker": "You",
        "en": "Yeah, do that. I'm starving today. What else can I add?",
        "cn": "好，加上。今天饿坏了。还能加什么？"
      },
      {
        "speaker": "Cashier",
        "en": "We've got extra cilantro, green onions, chili oil, bok choy, or tofu skin.",
        "cn": "可以加香菜、葱花、辣椒油、小白菜或者豆腐皮。"
      },
      {
        "speaker": "You",
        "en": "Ooh, tofu skin? I love that. How much is that?",
        "cn": "豆腐皮？我喜欢吃那个。多少钱？"
      },
      {
        "speaker": "Cashier",
        "en": "That's two dollars. It comes in strips, mixes right into the soup.",
        "cn": "两块钱。切成条状，直接拌在汤里。"
      },
      {
        "speaker": "You",
        "en": "Add that. And extra cilantro and green onions — those are free right?",
        "cn": "加上。再多加香菜和葱花——这些免费吧？"
      },
      {
        "speaker": "Cashier",
        "en": "Yep, herbs and chili oil are all complimentary. I'll load you up.",
        "cn": "对，香菜葱花和辣椒油都免费。给你多放点。"
      },
      {
        "speaker": "You",
        "en": "You're the best. Oh, and can I also get a side of their pickled vegetables?",
        "cn": "你太好了。对了，能再来一碟小咸菜吗？"
      },
      {
        "speaker": "Cashier",
        "en": "The pickled radish? That's actually self-serve over at the condiment station.",
        "cn": "腌萝卜？那个是在调料台自取的。"
      },
      {
        "speaker": "You",
        "en": "Oh sweet, even better. Free toppings are the best toppings.",
        "cn": "太好了，那更好。免费的配菜是最好的配菜。"
      },
      {
        "speaker": "Cashier",
        "en": "Ha, can't argue with that. So that's a beef noodle soup, thin, extra meat, tea egg, and tofu skin. Anything else?",
        "cn": "哈，没错。那就是一碗细面牛肉面，加肉、茶叶蛋和豆腐皮。还要别的吗？"
      },
      {
        "speaker": "You",
        "en": "Actually, let me add a side of pan-fried dumplings too if you have them.",
        "cn": "对了，如果有的话再来一份煎饺。"
      },
      {
        "speaker": "Cashier",
        "en": "We do — six pieces for five bucks. Pork and chive filling.",
        "cn": "有的——六个五块钱。猪肉韭菜馅的。"
      },
      {
        "speaker": "You",
        "en": "Done. OK now I'm really done. Ring me up!",
        "cn": "要了。好了这次真的够了。结账吧！"
      }
    ]
  },
  {
    "id": "restaurant-lanzhou-4",
    "cat": "restaurant",
    "catName": "餐馆点餐",
    "catEmoji": "🍽️",
    "title": "Chatting with the Noodle Chef",
    "titleCn": "和拉面师傅聊天",
    "emoji": "👨‍🍳",
    "lines": [
      {
        "speaker": "You",
        "en": "Excuse me — is it OK if I watch you pull the noodles? This is so cool.",
        "cn": "打扰一下——我可以看你拉面吗？太酷了。"
      },
      {
        "speaker": "Chef",
        "en": "Of course! Come on over. I'm about to start a batch right now.",
        "cn": "当然可以！过来吧。我正好要开始拉一批面。"
      },
      {
        "speaker": "You",
        "en": "How long have you been doing this? It looks like it takes years to learn.",
        "cn": "你做这个多久了？看起来得学好多年。"
      },
      {
        "speaker": "Chef",
        "en": "About fifteen years now. I started learning when I was sixteen back in Lanzhou.",
        "cn": "大概十五年了。我十六岁在兰州开始学的。"
      },
      {
        "speaker": "You",
        "en": "Wow, fifteen years. So you learned in the actual city of Lanzhou?",
        "cn": "十五年！你是在兰州本地学的？"
      },
      {
        "speaker": "Chef",
        "en": "Yep, apprenticed under a master for three years before I was allowed to make noodles for customers.",
        "cn": "对，跟师傅学了三年才被允许给客人做面。"
      },
      {
        "speaker": "You",
        "en": "Three years of training? That's intense. What was the hardest part?",
        "cn": "学了三年？好严格。最难的是什么？"
      },
      {
        "speaker": "Chef",
        "en": "Getting the dough right. The stretch has to be perfect — too stiff and it breaks, too soft and it won't hold shape.",
        "cn": "和面最难。筋道要刚刚好——太硬会断，太软就不成形。"
      },
      {
        "speaker": "You",
        "en": "I can see you're stretching it right now. How many times do you fold and pull it?",
        "cn": "我看到你正在拉面。你要折叠拉伸多少次？"
      },
      {
        "speaker": "Chef",
        "en": "For thin noodles, I fold it about seven or eight times. Each fold doubles the number of strands.",
        "cn": "细面的话大概折叠七八次。每折一次面条数量就翻倍。"
      },
      {
        "speaker": "You",
        "en": "So that's like... a hundred and twenty-eight strands from one piece of dough? That's wild.",
        "cn": "那就是……一块面团拉出一百二十八根？太神了。"
      },
      {
        "speaker": "Chef",
        "en": "Ha, you did the math! Yeah, it's all about rhythm and feel. Watch this part — this is where it gets fun.",
        "cn": "哈，你还算了一下！是的，全靠节奏和手感。看这步——接下来是最精彩的部分。"
      },
      {
        "speaker": "You",
        "en": "Oh wow, you just turned that into a bunch of perfect noodles in like two seconds.",
        "cn": "天哪，你两秒钟就把那团面变成一把完美的面条了。"
      },
      {
        "speaker": "Chef",
        "en": "That's the fun part — the final pull. Then right into the boiling water.",
        "cn": "这是最好玩的部分——最后一拉。然后直接下锅。"
      },
      {
        "speaker": "You",
        "en": "This is honestly the most impressive cooking technique I've ever seen. Way cooler than anything on TV.",
        "cn": "说真的这是我见过最厉害的烹饪技术。比电视上看到的酷多了。"
      },
      {
        "speaker": "Chef",
        "en": "Haha, thanks! You should see the competition noodle pullers though. They do stuff I can't even do.",
        "cn": "哈哈，谢谢！不过你应该看看比赛选手拉面。他们能做我都做不到的。"
      },
      {
        "speaker": "You",
        "en": "There are competitions? I had no idea. That's amazing.",
        "cn": "还有比赛的？我完全不知道。太厉害了。"
      },
      {
        "speaker": "Chef",
        "en": "Oh yeah, it's a whole thing in China. Some guys can pull noodles thinner than a hair.",
        "cn": "当然了，在中国是很正式的。有人能拉出比头发还细的面。"
      },
      {
        "speaker": "You",
        "en": "Man, I need to look that up on YouTube tonight. Hey, thanks for letting me watch and chat.",
        "cn": "我今晚得上YouTube搜搜看。谢谢你让我参观和聊天。"
      },
      {
        "speaker": "Chef",
        "en": "Anytime! Come back and I'll teach you how to pull a noodle yourself.",
        "cn": "随时欢迎！下次来我教你自己拉面。"
      }
    ]
  },
  {
    "id": "restaurant-lanzhou-5",
    "cat": "restaurant",
    "catName": "餐馆点餐",
    "catEmoji": "🍽️",
    "title": "Recommending the Restaurant to Others",
    "titleCn": "推荐兰州拉面给别人",
    "emoji": "⭐",
    "lines": [
      {
        "speaker": "Coworker",
        "en": "Hey, any lunch recommendations around here? I'm tired of the usual spots.",
        "cn": "嘿，这附近有什么午饭推荐吗？老去那几家都吃腻了。"
      },
      {
        "speaker": "You",
        "en": "Dude, have you tried that Lanzhou noodle place on Main Street? It's been my go-to lately.",
        "cn": "你试过主街上那家兰州拉面吗？最近一直在去。"
      },
      {
        "speaker": "Coworker",
        "en": "Lanzhou noodles? I don't think I've heard of that. Is it like ramen?",
        "cn": "兰州拉面？没听说过。像日式拉面吗？"
      },
      {
        "speaker": "You",
        "en": "Kind of, but not really. It's a Chinese hand-pulled noodle soup. The noodles are literally pulled fresh right in front of you.",
        "cn": "有点像，但又不太一样。是中国手工拉面汤。面条真的是在你面前现拉的。"
      },
      {
        "speaker": "Coworker",
        "en": "Wait, like they make the noodles from scratch while you watch?",
        "cn": "等等，就是你看着他们从头做面条？"
      },
      {
        "speaker": "You",
        "en": "Exactly. The chef takes a big lump of dough and stretches it into thin noodles by hand. It's like watching a magic trick.",
        "cn": "没错。师傅把一大团面手工拉成细面条。就像看魔术一样。"
      },
      {
        "speaker": "Coworker",
        "en": "OK, that does sound pretty cool. What's the food like though?",
        "cn": "听起来确实挺酷。但味道怎么样？"
      },
      {
        "speaker": "You",
        "en": "The broth is this clear beef soup that's been simmering for hours. Super savory and comforting. And you pick your noodle thickness.",
        "cn": "汤底是炖了好几个小时的清汤牛肉汤。特别鲜美暖胃。你还能选面条粗细。"
      },
      {
        "speaker": "Coworker",
        "en": "You can pick the thickness? That's wild. How thick do you go?",
        "cn": "还能选粗细？太新鲜了。你一般选多粗？"
      },
      {
        "speaker": "You",
        "en": "I usually get thin noodles, but the wide ones are amazing too. They're like these big flat ribbons. So chewy and good.",
        "cn": "我一般选细面，不过宽面也很棒。就像宽扁的丝带。嚼起来特别带劲。"
      },
      {
        "speaker": "Coworker",
        "en": "Is it expensive? What's a bowl run you?",
        "cn": "贵吗？一碗多少钱？"
      },
      {
        "speaker": "You",
        "en": "That's the best part — like twelve or thirteen bucks for a huge bowl. It's probably the best deal in the neighborhood.",
        "cn": "这是最棒的——一大碗才十二三块钱。可能是附近最实惠的了。"
      },
      {
        "speaker": "Coworker",
        "en": "Twelve bucks for hand-pulled noodles? OK, you've got my attention. When should I go?",
        "cn": "手工拉面才十二块？好，你说动我了。什么时候去比较好？"
      },
      {
        "speaker": "You",
        "en": "Go right at eleven-thirty when they open for lunch. By noon there's always a line.",
        "cn": "十一点半刚开始午市的时候去。到中午肯定排队。"
      },
      {
        "speaker": "Coworker",
        "en": "A line? It's that popular?",
        "cn": "还排队？这么火？"
      },
      {
        "speaker": "You",
        "en": "Oh yeah. Once you try it you'll understand why. Oh, and get the chili oil on the side — it's homemade and incredible.",
        "cn": "是的。你吃了就知道为什么了。对了，辣椒油一定要加——是自制的，超好吃。"
      },
      {
        "speaker": "Coworker",
        "en": "I'm not great with spicy food. Will I be OK?",
        "cn": "我不太能吃辣。能行吗？"
      },
      {
        "speaker": "You",
        "en": "Totally fine. The base soup isn't spicy at all. The chili oil is just optional on the side. You control how much goes in.",
        "cn": "完全没问题。汤底一点都不辣。辣椒油是自己选择加的。放多少你自己控制。"
      },
      {
        "speaker": "Coworker",
        "en": "Alright, I'm sold. Wanna go together tomorrow? You can show me the ropes.",
        "cn": "行，你说服我了。明天一起去？你带我去入个门。"
      },
      {
        "speaker": "You",
        "en": "I'm down. Meet me in the lobby at eleven-twenty and we'll walk over. You're gonna love it, I promise.",
        "cn": "没问题。十一点二十在大厅碰头，我们走过去。你一定会爱上的，我保证。"
      }
    ]
  },
  {
    "id": "coffee-starbucks-1",
    "cat": "coffee",
    "catName": "咖啡店",
    "catEmoji": "☕",
    "title": "Ordering Your First Latte at Starbucks",
    "titleCn": "星巴克第一次点拿铁",
    "emoji": "☕",
    "lines": [
      {
        "speaker": "Barista",
        "en": "Hi there! Welcome to Starbucks. What can I get started for you?",
        "cn": "你好！欢迎来到星巴克。想喝点什么？"
      },
      {
        "speaker": "You",
        "en": "Hi! Um, this is actually my first time here. Could you recommend something?",
        "cn": "你好！嗯，这其实是我第一次来。你能推荐一下吗？"
      },
      {
        "speaker": "Barista",
        "en": "Of course! Do you usually like your coffee sweet or do you prefer something more classic?",
        "cn": "当然可以！你平时喜欢甜一点的还是经典口味的？"
      },
      {
        "speaker": "You",
        "en": "I like it a little sweet, but not too much. What do you suggest?",
        "cn": "我喜欢稍微甜一点的，但别太甜。你有什么建议？"
      },
      {
        "speaker": "Barista",
        "en": "I'd recommend a vanilla latte. It's smooth and just a touch sweet. Very popular with first-timers.",
        "cn": "我推荐香草拿铁。口感顺滑，微微带甜。第一次来的人都很喜欢。"
      },
      {
        "speaker": "You",
        "en": "That sounds great! I'll try that. What sizes do you have?",
        "cn": "听起来不错！我试试吧。你们有什么杯型？"
      },
      {
        "speaker": "Barista",
        "en": "We have Tall, Grande, and Venti. Tall is twelve ounces, Grande is sixteen, and Venti is twenty.",
        "cn": "我们有Tall、Grande和Venti。Tall是12盎司，Grande是16盎司，Venti是20盎司。"
      },
      {
        "speaker": "You",
        "en": "I'll go with a Grande, please. Can I get that hot?",
        "cn": "我要Grande的吧。可以做热的吗？"
      },
      {
        "speaker": "Barista",
        "en": "Absolutely! One Grande hot vanilla latte. Would you like whole milk, two percent, oat, or almond milk?",
        "cn": "当然可以！一杯Grande热香草拿铁。你要全脂牛奶、低脂牛奶、燕麦奶还是杏仁奶？"
      },
      {
        "speaker": "You",
        "en": "Oat milk sounds good. Is there an extra charge for that?",
        "cn": "燕麦奶听起来不错。换燕麦奶要加钱吗？"
      },
      {
        "speaker": "Barista",
        "en": "Yes, oat milk is an extra eighty cents. Is that okay?",
        "cn": "是的，燕麦奶要加八毛钱。可以吗？"
      },
      {
        "speaker": "You",
        "en": "That's fine. I'll stick with oat milk.",
        "cn": "没问题。就要燕麦奶吧。"
      },
      {
        "speaker": "Barista",
        "en": "Perfect! Would you like any extra shots of espresso in that?",
        "cn": "好的！需要额外加浓缩咖啡吗？"
      },
      {
        "speaker": "You",
        "en": "No thanks, the regular amount is fine. How many shots come in a Grande?",
        "cn": "不用了，正常的就行。Grande有几份浓缩？"
      },
      {
        "speaker": "Barista",
        "en": "A Grande latte comes with two shots. Can I get a name for the order?",
        "cn": "Grande拿铁有两份浓缩。请问您贵姓？"
      },
      {
        "speaker": "You",
        "en": "It's Wei. W-E-I.",
        "cn": "我叫Wei，W-E-I。"
      },
      {
        "speaker": "Barista",
        "en": "Got it, Wei! Anything else? A pastry or a snack maybe?",
        "cn": "好的，Wei！还需要别的吗？要不要来个糕点或小吃？"
      },
      {
        "speaker": "You",
        "en": "No, just the latte. How much is that?",
        "cn": "不用了，就一杯拿铁。多少钱？"
      },
      {
        "speaker": "Barista",
        "en": "That'll be six dollars and fifty-five cents. You can tap or swipe right here.",
        "cn": "一共六块五毛五。可以在这里刷卡或感应支付。"
      },
      {
        "speaker": "You",
        "en": "Here you go. Thanks so much for the help! I'll wait over there?",
        "cn": "给你。太感谢了！我在那边等是吗？"
      }
    ]
  },
  {
    "id": "coffee-starbucks-2",
    "cat": "coffee",
    "catName": "咖啡店",
    "catEmoji": "☕",
    "title": "Customizing a Frappuccino",
    "titleCn": "定制星冰乐",
    "emoji": "🥤",
    "lines": [
      {
        "speaker": "Barista",
        "en": "Hey! Welcome to Starbucks. What can I get for you today?",
        "cn": "嘿！欢迎来到星巴克。今天想喝点什么？"
      },
      {
        "speaker": "You",
        "en": "Hi! I want to try a Frappuccino, but I'd like to customize it a bit. Is that okay?",
        "cn": "你好！我想试试星冰乐，但想稍微定制一下。可以吗？"
      },
      {
        "speaker": "Barista",
        "en": "Absolutely! We love custom orders. Which Frappuccino are you starting with?",
        "cn": "当然可以！我们很欢迎定制。你想以哪款星冰乐为基础？"
      },
      {
        "speaker": "You",
        "en": "I'm thinking the Mocha Frappuccino. Can I make some changes to it?",
        "cn": "我在想摩卡星冰乐。可以做一些调整吗？"
      },
      {
        "speaker": "Barista",
        "en": "Sure thing! What would you like to change?",
        "cn": "当然可以！你想改什么？"
      },
      {
        "speaker": "You",
        "en": "Can I get it with less sugar? I find the regular version a little too sweet.",
        "cn": "能少放点糖吗？我觉得正常版本有点太甜了。"
      },
      {
        "speaker": "Barista",
        "en": "Of course. I can do half the pumps of mocha sauce. A Grande normally gets three pumps, so I'll do one and a half.",
        "cn": "当然可以。摩卡酱我可以减半。Grande正常是三泵，我给你打一泵半。"
      },
      {
        "speaker": "You",
        "en": "That sounds perfect. Can I also add some caramel drizzle on top?",
        "cn": "听起来很好。还能在上面加一些焦糖淋酱吗？"
      },
      {
        "speaker": "Barista",
        "en": "Yep! Caramel drizzle is free. Want whipped cream under the drizzle too, or skip it?",
        "cn": "可以的！焦糖淋酱是免费的。要不要在淋酱下面加奶油，还是不要？"
      },
      {
        "speaker": "You",
        "en": "I'll keep the whipped cream. And could I add java chips to it?",
        "cn": "奶油留着吧。还能加咖啡碎片吗？"
      },
      {
        "speaker": "Barista",
        "en": "Java chips, nice choice! That's like turning it into a Java Chip Frappuccino with mocha. No extra charge for that.",
        "cn": "咖啡碎片，好选择！这就像是把它变成了摩卡口味的Java Chip星冰乐。这个不额外收费。"
      },
      {
        "speaker": "You",
        "en": "Oh awesome! One more thing — can I get an extra shot of espresso in it?",
        "cn": "太好了！还有一件事——能多加一份浓缩咖啡吗？"
      },
      {
        "speaker": "Barista",
        "en": "Sure! An extra shot is a dollar ten. Anything else you want to add?",
        "cn": "可以的！多加一份浓缩是一块一。还想加别的吗？"
      },
      {
        "speaker": "You",
        "en": "Can I swap the regular milk for coconut milk?",
        "cn": "能把普通牛奶换成椰奶吗？"
      },
      {
        "speaker": "Barista",
        "en": "You got it. Coconut milk is an extra eighty cents. So just to confirm your order...",
        "cn": "没问题。椰奶要加八毛钱。那我确认一下你的订单……"
      },
      {
        "speaker": "You",
        "en": "Sure, go ahead!",
        "cn": "好的，你说吧！"
      },
      {
        "speaker": "Barista",
        "en": "Grande Mocha Frappuccino with half mocha, coconut milk, java chips, extra espresso shot, whip, and caramel drizzle. Sound right?",
        "cn": "Grande摩卡星冰乐，摩卡减半，椰奶，咖啡碎片，多一份浓缩，奶油加焦糖淋酱。对吗？"
      },
      {
        "speaker": "You",
        "en": "That's exactly right! You got all that? I'm impressed.",
        "cn": "完全正确！你全记住了？太厉害了。"
      },
      {
        "speaker": "Barista",
        "en": "Ha, we get way more complicated orders than that! Your total is eight twenty. Tap whenever you're ready.",
        "cn": "哈哈，比这复杂的订单我们见多了！一共八块二。随时可以刷卡。"
      },
      {
        "speaker": "You",
        "en": "Done! I can't wait to try it. How long will it take?",
        "cn": "好了！我迫不及待想尝尝。要等多久？"
      }
    ]
  },
  {
    "id": "coffee-starbucks-3",
    "cat": "coffee",
    "catName": "咖啡店",
    "catEmoji": "☕",
    "title": "Using the Starbucks App and Rewards",
    "titleCn": "用星巴克App和积分",
    "emoji": "📱",
    "lines": [
      {
        "speaker": "Barista",
        "en": "Hi! Welcome back. What can I get for you?",
        "cn": "你好！欢迎再来。想喝点什么？"
      },
      {
        "speaker": "You",
        "en": "Hey! Before I order, I have a question about the Starbucks app. How do I earn stars?",
        "cn": "嘿！点单之前我想问一下星巴克App的事。怎么攒星星？"
      },
      {
        "speaker": "Barista",
        "en": "Great question! You earn two stars for every dollar you spend when you pay through the app or use a registered Starbucks card.",
        "cn": "好问题！用App支付或注册的星巴克卡消费，每花一美元可以得两颗星。"
      },
      {
        "speaker": "You",
        "en": "Oh nice! How many stars do I need for a free drink?",
        "cn": "不错！攒多少颗星可以换一杯免费饮品？"
      },
      {
        "speaker": "Barista",
        "en": "A hundred and fifty stars gets you a free handcrafted drink, any size. You can also redeem at lower levels for other things.",
        "cn": "一百五十颗星可以换一杯免费手工饮品，任意杯型。低一点的星星数也可以换其他东西。"
      },
      {
        "speaker": "You",
        "en": "Like what? What can I get with fewer stars?",
        "cn": "比如什么？少一点的星星能换什么？"
      },
      {
        "speaker": "Barista",
        "en": "Twenty-five stars gets you a free customization like an extra shot. A hundred stars gets you a free brewed coffee or pastry.",
        "cn": "二十五颗星可以免费定制，比如多加一份浓缩。一百颗星可以换一杯美式咖啡或一个糕点。"
      },
      {
        "speaker": "You",
        "en": "That's good to know. I just downloaded the app. Can I pay with it right now?",
        "cn": "这个信息很有用。我刚下载了App。现在可以用它付款吗？"
      },
      {
        "speaker": "Barista",
        "en": "Sure! Just pull up your barcode under \"Pay\" in the app, and I'll scan it. Make sure you loaded some money onto it first.",
        "cn": "当然！在App里点\"Pay\"调出条形码，我来扫。确保你先往里面充了钱。"
      },
      {
        "speaker": "You",
        "en": "Oh, I need to load money first? I thought it could just charge my credit card directly.",
        "cn": "哦，需要先充值吗？我以为可以直接扣信用卡。"
      },
      {
        "speaker": "Barista",
        "en": "You can set it to auto-reload, so it'll charge your card when the balance gets low. That way you don't have to think about it.",
        "cn": "你可以设置自动充值，余额不足时自动从信用卡扣款。这样就不用操心了。"
      },
      {
        "speaker": "You",
        "en": "Smart. Let me set that up real quick... Okay, I think it's ready. Let me order a Grande iced Americano.",
        "cn": "聪明。让我快速设一下……好了，应该可以了。我点一杯Grande冰美式。"
      },
      {
        "speaker": "Barista",
        "en": "You got it. Go ahead and scan your app right here.",
        "cn": "好的。在这里扫一下你的App。"
      },
      {
        "speaker": "You",
        "en": "Here we go. Did it work?",
        "cn": "好了。成功了吗？"
      },
      {
        "speaker": "Barista",
        "en": "Yep, all set! You just earned seven stars for that purchase too.",
        "cn": "嗯，搞定了！这笔消费你还赚了七颗星。"
      },
      {
        "speaker": "You",
        "en": "Nice! So I can see my star balance in the app?",
        "cn": "太好了！我可以在App里看到星星余额吗？"
      },
      {
        "speaker": "Barista",
        "en": "Yeah, it should update right away. Also check out the \"Offers\" tab — there are sometimes bonus star challenges.",
        "cn": "是的，应该马上就会更新。你也看看\"Offers\"那一栏——有时候会有额外赚星星的活动。"
      },
      {
        "speaker": "You",
        "en": "Oh cool, like what kind of challenges?",
        "cn": "哦不错，什么样的活动？"
      },
      {
        "speaker": "Barista",
        "en": "Like \"Buy three drinks this week and earn a hundred bonus stars.\" They change all the time, so check back often.",
        "cn": "比如\"本周买三杯饮品额外得一百颗星\"。活动经常换，所以常看看。"
      },
      {
        "speaker": "You",
        "en": "That's awesome. Thanks for explaining all of that! I'll definitely start using the app more.",
        "cn": "太棒了。谢谢你解释这些！我以后肯定会多用App。"
      }
    ]
  },
  {
    "id": "coffee-starbucks-4",
    "cat": "coffee",
    "catName": "咖啡店",
    "catEmoji": "☕",
    "title": "Ordering for a Meeting at Starbucks",
    "titleCn": "星巴克帮同事带咖啡",
    "emoji": "👥",
    "lines": [
      {
        "speaker": "Barista",
        "en": "Welcome to Starbucks! Looks like you've got a big order today?",
        "cn": "欢迎来到星巴克！看起来你今天要点不少？"
      },
      {
        "speaker": "You",
        "en": "Yeah, I'm picking up coffee for a team meeting. I need five drinks total. Can I read them off to you?",
        "cn": "是的，我帮团队会议买咖啡。一共要五杯。我念给你听可以吗？"
      },
      {
        "speaker": "Barista",
        "en": "Go for it! I'll punch them in one by one.",
        "cn": "来吧！我一个一个录。"
      },
      {
        "speaker": "You",
        "en": "Okay, first one is a Grande hot vanilla latte with oat milk.",
        "cn": "好，第一杯是Grande热香草拿铁，燕麦奶。"
      },
      {
        "speaker": "Barista",
        "en": "Got it. Next?",
        "cn": "好了。下一杯？"
      },
      {
        "speaker": "You",
        "en": "A Venti iced caramel macchiato with an extra shot.",
        "cn": "一杯Venti冰焦糖玛奇朵，多加一份浓缩。"
      },
      {
        "speaker": "Barista",
        "en": "Okay, that's in. Number three?",
        "cn": "好了，录好了。第三杯？"
      },
      {
        "speaker": "You",
        "en": "A Tall hot drip coffee, just black. Nothing fancy.",
        "cn": "一杯Tall热美式滴滤咖啡，纯黑的。不加任何东西。"
      },
      {
        "speaker": "Barista",
        "en": "Easy one! And the fourth?",
        "cn": "简单！第四杯呢？"
      },
      {
        "speaker": "You",
        "en": "A Grande chai tea latte with almond milk and no whip.",
        "cn": "一杯Grande的chai茶拿铁，杏仁奶，不要奶油。"
      },
      {
        "speaker": "Barista",
        "en": "Almond milk chai, no whip. Got it. And the last one?",
        "cn": "杏仁奶chai茶拿铁，不加奶油。好了。最后一杯？"
      },
      {
        "speaker": "You",
        "en": "A Grande mocha Frappuccino with extra whipped cream. That one's for our intern — she has a sweet tooth.",
        "cn": "一杯Grande摩卡星冰乐，多加奶油。那杯是给我们实习生的——她爱吃甜的。"
      },
      {
        "speaker": "Barista",
        "en": "Ha! Okay, so that's five drinks. Would you like a drink carrier? I can give you two trays.",
        "cn": "哈！好的，一共五杯。要不要杯托？我可以给你两个托盘。"
      },
      {
        "speaker": "You",
        "en": "Yes please, that would be super helpful. Also, can I get the names written on the cups?",
        "cn": "好的，那太有用了。还有，能在杯子上写名字吗？"
      },
      {
        "speaker": "Barista",
        "en": "Of course! Just tell me the names for each drink and I'll label them.",
        "cn": "当然可以！告诉我每杯对应的名字，我来标。"
      },
      {
        "speaker": "You",
        "en": "Vanilla latte is for Linda, the macchiato is for James, black coffee is for Mike, chai is for Sarah, and the Frappuccino is for Amy.",
        "cn": "香草拿铁是Linda的，玛奇朵是James的，黑咖啡是Mike的，chai是Sarah的，星冰乐是Amy的。"
      },
      {
        "speaker": "Barista",
        "en": "All labeled! Your total comes to thirty-two dollars and forty cents. Are you paying all together?",
        "cn": "都标好了！一共三十二块四毛。一起结账吗？"
      },
      {
        "speaker": "You",
        "en": "Yes, I'll put it on the company card. Can I get a receipt? I need it for reimbursement.",
        "cn": "是的，刷公司卡。能给我一张收据吗？我要报销。"
      },
      {
        "speaker": "Barista",
        "en": "Sure, I'll print one for you. It'll take about five to seven minutes for everything.",
        "cn": "好的，我给你打印一张。全部做好大概需要五到七分钟。"
      },
      {
        "speaker": "You",
        "en": "No problem. My meeting doesn't start for another twenty minutes. Thanks a lot!",
        "cn": "没问题。我还有二十分钟才开会。非常感谢！"
      }
    ]
  },
  {
    "id": "coffee-starbucks-5",
    "cat": "coffee",
    "catName": "咖啡店",
    "catEmoji": "☕",
    "title": "Complaining about a Wrong Drink",
    "titleCn": "星巴克做错饮品",
    "emoji": "😟",
    "lines": [
      {
        "speaker": "You",
        "en": "Excuse me, I think there might be a mix-up with my drink. This doesn't taste right.",
        "cn": "不好意思，我觉得我的饮品可能拿错了。味道不对。"
      },
      {
        "speaker": "Barista",
        "en": "Oh no, I'm sorry about that! What did you order?",
        "cn": "哦不，很抱歉！你点的是什么？"
      },
      {
        "speaker": "You",
        "en": "I ordered a Grande iced oat milk latte, but this tastes like regular milk and it's way too sweet.",
        "cn": "我点的是Grande冰燕麦奶拿铁，但这杯喝起来像普通牛奶，而且太甜了。"
      },
      {
        "speaker": "Barista",
        "en": "Let me check the sticker on the cup... Oh I see, this one is actually a vanilla latte with whole milk. That's definitely not yours.",
        "cn": "让我看看杯子上的标签……哦我看到了，这杯其实是全脂牛奶的香草拿铁。确实不是你的。"
      },
      {
        "speaker": "You",
        "en": "Yeah, I didn't order any vanilla. And I specifically asked for oat milk because I'm lactose intolerant.",
        "cn": "是的，我没有点香草的。而且我特地要了燕麦奶，因为我乳糖不耐。"
      },
      {
        "speaker": "Barista",
        "en": "I completely understand, and I'm really sorry about that. We'll remake it for you right away. No charge of course.",
        "cn": "我完全理解，真的很抱歉。我们马上给你重新做一杯。当然不会再收费。"
      },
      {
        "speaker": "You",
        "en": "Thank you. I appreciate that. Should I just wait here?",
        "cn": "谢谢。我很感激。我就在这里等吗？"
      },
      {
        "speaker": "Barista",
        "en": "Yes, I'll put a rush on it. It'll be ready in just a couple minutes. And here, let me take this wrong one from you.",
        "cn": "是的，我会让他们加急做。几分钟就好。来，把这杯错的给我吧。"
      },
      {
        "speaker": "You",
        "en": "Sure. You know, I actually took a few sips before I realized it was wrong. I hope that's not a problem.",
        "cn": "好的。你知道，我喝了几口才发现不对。希望这不是问题。"
      },
      {
        "speaker": "Barista",
        "en": "Not at all! We just want to make sure you get what you ordered. Again, sorry for the inconvenience.",
        "cn": "完全没问题！我们只想确保你拿到你点的。再次抱歉给你添麻烦了。"
      },
      {
        "speaker": "You",
        "en": "It happens. Actually, this has been happening more often lately. Is there a new system or something?",
        "cn": "没事的。不过最近这种情况发生得比较频繁。是换了新系统什么的吗？"
      },
      {
        "speaker": "Barista",
        "en": "We've actually been really busy with the new seasonal menu launch. More orders means more room for mistakes, unfortunately.",
        "cn": "其实最近新季节菜单上线，我们特别忙。订单多了，出错的几率也高了。"
      },
      {
        "speaker": "You",
        "en": "I see. Well, maybe you could double-check the milk option before making the drink? That part is important for people with allergies.",
        "cn": "我明白。那你们能不能在做饮品之前再确认一下奶的选项？对有过敏的人来说这很重要。"
      },
      {
        "speaker": "Barista",
        "en": "That's really good feedback. I'll pass that along to our shift supervisor. We should definitely be more careful about allergen orders.",
        "cn": "这个反馈很好。我会转达给值班主管。对于涉及过敏的订单，我们确实应该更仔细。"
      },
      {
        "speaker": "You",
        "en": "Thanks. I'm not trying to be difficult — I just want to make sure it's safe.",
        "cn": "谢谢。我不是想找麻烦——只是想确保安全。"
      },
      {
        "speaker": "Barista",
        "en": "You're not being difficult at all. Food safety is super important to us. Oh, here's your remade drink!",
        "cn": "你一点都不麻烦。食品安全对我们来说非常重要。哦，你重新做的饮品好了！"
      },
      {
        "speaker": "You",
        "en": "Let me taste it... Yes, this is perfect. Oat milk, no sweetener. Exactly what I wanted.",
        "cn": "让我尝尝……嗯，这杯完美。燕麦奶，没有甜味剂。正是我要的。"
      },
      {
        "speaker": "Barista",
        "en": "I'm glad we got it right this time! And here, I added a recovery coupon for a free drink next time.",
        "cn": "太好了，这次做对了！给你，这是一张补偿券，下次可以免费喝一杯。"
      },
      {
        "speaker": "You",
        "en": "Oh wow, that's really nice of you! You didn't have to do that.",
        "cn": "哇，你太好了！你不必这样的。"
      },
      {
        "speaker": "Barista",
        "en": "We want you to come back! Thanks for being so patient about it, and sorry again.",
        "cn": "我们希望你再来！谢谢你这么耐心，再次抱歉。"
      }
    ]
  },
  {
    "id": "coffee-peets-1",
    "cat": "coffee",
    "catName": "咖啡店",
    "catEmoji": "☕",
    "title": "Discovering Peet's Coffee",
    "titleCn": "第一次去Peet's Coffee",
    "emoji": "🆕",
    "lines": [
      {
        "speaker": "Barista",
        "en": "Hey there, welcome to Peet's Coffee! Have you been here before?",
        "cn": "嘿，欢迎来到Peet's Coffee！你以前来过吗？"
      },
      {
        "speaker": "You",
        "en": "No, this is my first time! I usually go to Starbucks, but a friend told me I should try Peet's.",
        "cn": "没有，这是第一次！我平时都去星巴克，但朋友说我应该试试Peet's。"
      },
      {
        "speaker": "Barista",
        "en": "Well, your friend has great taste! We're known for our dark roast and hand-crafted drinks. What do you normally get at Starbucks?",
        "cn": "那你朋友很有品味！我们以深烘和手工饮品出名。你在星巴克一般喝什么？"
      },
      {
        "speaker": "You",
        "en": "I usually get a vanilla latte. Do you guys have something similar?",
        "cn": "我一般喝香草拿铁。你们有类似的吗？"
      },
      {
        "speaker": "Barista",
        "en": "We sure do! Our vanilla latte is really popular. And I think you'll notice our espresso has a richer, bolder flavor.",
        "cn": "当然有！我们的香草拿铁很受欢迎。而且我觉得你会发现我们的浓缩咖啡味道更浓郁、更醇厚。"
      },
      {
        "speaker": "You",
        "en": "Sounds good. What sizes do you have? Is it the same as Starbucks?",
        "cn": "听起来不错。你们有什么杯型？和星巴克一样吗？"
      },
      {
        "speaker": "Barista",
        "en": "We keep it simple — small, medium, and large. No fancy Italian names here.",
        "cn": "我们比较简单——小杯、中杯、大杯。没有花哨的意大利名字。"
      },
      {
        "speaker": "You",
        "en": "Ha, that's refreshing! I'll take a medium vanilla latte, please. Hot.",
        "cn": "哈，这倒挺清爽！我要一杯中杯香草拿铁，热的。"
      },
      {
        "speaker": "Barista",
        "en": "Great choice! What kind of milk would you like? We have whole, two percent, nonfat, oat, almond, and soy.",
        "cn": "好选择！要什么奶？我们有全脂、低脂、脱脂、燕麦、杏仁和豆奶。"
      },
      {
        "speaker": "You",
        "en": "I'll go with whole milk. Keep it classic for my first visit.",
        "cn": "我选全脂吧。第一次来就喝经典的。"
      },
      {
        "speaker": "Barista",
        "en": "Love it. Would you like to try one of our fresh pastries too? We bake them in-house every morning.",
        "cn": "好的。要不要也尝尝我们的新鲜糕点？我们每天早上现烤的。"
      },
      {
        "speaker": "You",
        "en": "Oh, you bake them here? What's popular?",
        "cn": "哦，你们自己烤的？什么比较受欢迎？"
      },
      {
        "speaker": "Barista",
        "en": "The almond croissant is a customer favorite. It's buttery, flaky, and has an almond cream filling.",
        "cn": "杏仁牛角包是客人的最爱。酥脆黄油香，里面还有杏仁奶油馅。"
      },
      {
        "speaker": "You",
        "en": "That sounds amazing. I'll add one of those. How much for both?",
        "cn": "听起来太棒了。我也加一个。一共多少钱？"
      },
      {
        "speaker": "Barista",
        "en": "The latte is five seventy-five and the croissant is four twenty-five. So your total is ten dollars even.",
        "cn": "拿铁五块七毛五，牛角包四块两毛五。一共正好十块钱。"
      },
      {
        "speaker": "You",
        "en": "Perfect. Here's my card.",
        "cn": "好的。给你我的卡。"
      },
      {
        "speaker": "Barista",
        "en": "All set! Your latte will be ready at the end of the bar in about three minutes.",
        "cn": "搞定了！你的拿铁大约三分钟后在吧台那头取。"
      },
      {
        "speaker": "You",
        "en": "Great. Oh, one more question — do you guys have a rewards program like Starbucks?",
        "cn": "好的。哦，再问一下——你们有像星巴克那样的积分计划吗？"
      },
      {
        "speaker": "Barista",
        "en": "We do! It's called Peetnik Rewards. You can sign up on our app and start earning points right away.",
        "cn": "有的！叫Peetnik Rewards。你可以在我们的App上注册，马上就能开始攒积分。"
      },
      {
        "speaker": "You",
        "en": "I'll download it right now. Thanks for being so helpful — I can already tell I'll be coming back!",
        "cn": "我现在就下载。谢谢你这么热心——我已经感觉我会再来了！"
      }
    ]
  },
  {
    "id": "coffee-peets-2",
    "cat": "coffee",
    "catName": "咖啡店",
    "catEmoji": "☕",
    "title": "Asking about Peet's Dark Roast",
    "titleCn": "了解Peet's深烘咖啡",
    "emoji": "🫘",
    "lines": [
      {
        "speaker": "You",
        "en": "Hi! I've heard Peet's is famous for dark roast coffee. Can you tell me more about it?",
        "cn": "你好！我听说Peet's以深烘咖啡出名。能给我介绍一下吗？"
      },
      {
        "speaker": "Barista",
        "en": "Absolutely! Our founder, Alfred Peet, actually started the craft coffee movement in the US. Dark roast has been our specialty since 1966.",
        "cn": "当然！我们的创始人Alfred Peet实际上开创了美国的精品咖啡运动。深烘从1966年起就是我们的特色。"
      },
      {
        "speaker": "You",
        "en": "Wow, that's a long history. What makes your dark roast different from other brands?",
        "cn": "哇，历史很久了。你们的深烘和其他品牌有什么不同？"
      },
      {
        "speaker": "Barista",
        "en": "We roast our beans longer and at higher temperatures. That gives them a smoky, full-bodied flavor with low acidity.",
        "cn": "我们把咖啡豆烘得更久、温度更高。这让它有烟熏感、醇厚口感，而且酸度低。"
      },
      {
        "speaker": "You",
        "en": "I usually drink medium roast. Would the dark roast be too strong for me?",
        "cn": "我平时喝中度烘焙。深烘对我来说会不会太浓了？"
      },
      {
        "speaker": "Barista",
        "en": "Not necessarily! Strong flavor doesn't always mean more caffeine. Dark roast actually has slightly less caffeine than light roast. Want to try a sample?",
        "cn": "不一定哦！味道浓并不意味着咖啡因更多。深烘的咖啡因其实比浅烘的稍微少一点。要不要试喝一下？"
      },
      {
        "speaker": "You",
        "en": "You can give samples? That'd be great!",
        "cn": "可以试喝？那太好了！"
      },
      {
        "speaker": "Barista",
        "en": "Of course! Here, try our Major Dickason's Blend. It's our most popular dark roast — rich, complex, and smooth.",
        "cn": "当然！来，试试我们的Major Dickason's Blend。这是我们最受欢迎的深烘——丰富、复杂、顺滑。"
      },
      {
        "speaker": "You",
        "en": "Mmm, that is smooth. I expected it to be more bitter, honestly.",
        "cn": "嗯，确实很顺滑。说实话，我以为会更苦。"
      },
      {
        "speaker": "Barista",
        "en": "A lot of people think that! When dark roast is done right, it's actually very smooth. Bitterness usually comes from over-extraction or low-quality beans.",
        "cn": "很多人都这么以为！深烘如果做得好，其实非常顺滑。苦味通常来自过度萃取或低质量的豆子。"
      },
      {
        "speaker": "You",
        "en": "Good to know. Do you have any other dark roast options I should try?",
        "cn": "涨知识了。还有其他深烘推荐吗？"
      },
      {
        "speaker": "Barista",
        "en": "Sure! French Roast is our darkest — very bold and smoky. And if you want something between medium and dark, try our House Blend.",
        "cn": "有的！French Roast是我们最深的——非常浓烈有烟熏感。如果你想要中度和深度之间的，试试我们的House Blend。"
      },
      {
        "speaker": "You",
        "en": "Let me try the French Roast too, just to compare.",
        "cn": "让我也试试French Roast，做个对比。"
      },
      {
        "speaker": "Barista",
        "en": "Here you go. You can really taste the difference, right?",
        "cn": "给你。能尝出区别吧？"
      },
      {
        "speaker": "You",
        "en": "Definitely! This one is much smokier. I think I prefer the Major Dickason's though. It's more balanced.",
        "cn": "当然能！这个烟熏味重很多。不过我觉得我更喜欢Major Dickason's。更平衡。"
      },
      {
        "speaker": "Barista",
        "en": "That's our bestseller for a reason! Would you like a cup, or are you interested in buying a bag of beans to take home?",
        "cn": "它是我们的畅销款是有原因的！你想来一杯，还是买一袋豆子带回家？"
      },
      {
        "speaker": "You",
        "en": "I'll take a medium cup for now. And actually, how much is a bag of beans?",
        "cn": "我先来一中杯。另外，一袋豆子多少钱？"
      },
      {
        "speaker": "Barista",
        "en": "A twelve-ounce bag is fifteen ninety-nine. We can grind it for you too, depending on how you brew at home.",
        "cn": "十二盎司的一袋是十五块九毛九。我们也可以帮你磨，取决于你在家怎么冲泡。"
      },
      {
        "speaker": "You",
        "en": "I have a French press at home. Would you recommend a coarse grind?",
        "cn": "我家有个法压壶。你推荐粗磨吗？"
      },
      {
        "speaker": "Barista",
        "en": "Exactly right! Coarse grind is perfect for French press. I'll get your cup ready and grind a bag for you too.",
        "cn": "完全正确！粗磨最适合法压壶。我给你准备这杯，也给你磨一袋。"
      }
    ]
  },
  {
    "id": "coffee-peets-3",
    "cat": "coffee",
    "catName": "咖啡店",
    "catEmoji": "☕",
    "title": "Buying Coffee Beans to Go",
    "titleCn": "买咖啡豆带走",
    "emoji": "🛒",
    "lines": [
      {
        "speaker": "You",
        "en": "Hi! I'm looking to buy some coffee beans to take home. Do you sell whole beans here?",
        "cn": "你好！我想买一些咖啡豆带回家。你们这里卖整豆吗？"
      },
      {
        "speaker": "Barista",
        "en": "We sure do! We have a whole wall of options over here. Are you looking for dark, medium, or light roast?",
        "cn": "当然卖！我们这边有一整面墙的选择。你想要深烘、中烘还是浅烘？"
      },
      {
        "speaker": "You",
        "en": "I'm not sure yet. I normally buy pre-ground coffee from the grocery store, so this is new for me.",
        "cn": "我还没确定。我平时在超市买磨好的咖啡粉，所以这对我来说是个新尝试。"
      },
      {
        "speaker": "Barista",
        "en": "Welcome to the world of fresh beans! Freshly ground coffee makes a huge difference in flavor. What kind of coffee maker do you have?",
        "cn": "欢迎进入新鲜咖啡豆的世界！现磨咖啡在口味上差别很大。你有什么样的咖啡机？"
      },
      {
        "speaker": "You",
        "en": "I have a drip coffee maker. The basic kind with a glass pot.",
        "cn": "我有一台滴滤咖啡机。就是那种最基本的带玻璃壶的。"
      },
      {
        "speaker": "Barista",
        "en": "Perfect! For a drip machine, you'll want a medium grind. We can grind the beans right here for you.",
        "cn": "很好！滴滤机的话你需要中度研磨。我们可以当场帮你磨。"
      },
      {
        "speaker": "You",
        "en": "That's convenient. So which blend would you recommend for someone just starting with fresh beans?",
        "cn": "真方便。那你推荐哪款给刚开始尝试新鲜豆子的人？"
      },
      {
        "speaker": "Barista",
        "en": "I'd start with our Big Bang blend. It's medium roast, very balanced, with a sweet finish. Great everyday coffee.",
        "cn": "我建议从我们的Big Bang拼配开始。中度烘焙，非常平衡，收尾带甜。很棒的日常咖啡。"
      },
      {
        "speaker": "You",
        "en": "Sounds good. What sizes do the bags come in?",
        "cn": "听起来不错。袋装有什么规格？"
      },
      {
        "speaker": "Barista",
        "en": "We have twelve-ounce bags for fifteen ninety-nine and one-pound bags for seventeen ninety-nine. The one-pound is a better deal.",
        "cn": "有十二盎司的，十五块九毛九，还有一磅的，十七块九毛九。一磅的更划算。"
      },
      {
        "speaker": "You",
        "en": "I'll take the one-pound bag. How long do the beans stay fresh after I open them?",
        "cn": "那我要一磅的。打开之后豆子能保持新鲜多久？"
      },
      {
        "speaker": "Barista",
        "en": "Once opened, try to use them within two weeks for the best flavor. Store them in an airtight container at room temperature — not in the fridge.",
        "cn": "打开之后尽量在两周内用完，这样味道最好。放在密封容器里常温保存——不要放冰箱。"
      },
      {
        "speaker": "You",
        "en": "Oh really? I always thought the fridge kept coffee fresher.",
        "cn": "真的吗？我一直以为冰箱能让咖啡更新鲜。"
      },
      {
        "speaker": "Barista",
        "en": "Common misconception! The fridge actually introduces moisture and can absorb other food odors. A cool, dark pantry is ideal.",
        "cn": "这是常见的误区！冰箱会带来湿气，还会吸收其他食物的气味。阴凉干燥的柜子最理想。"
      },
      {
        "speaker": "You",
        "en": "Good tip. I'll keep that in mind. Can you grind this bag for me then?",
        "cn": "好建议。我记住了。那能帮我把这袋磨一下吗？"
      },
      {
        "speaker": "Barista",
        "en": "Sure thing! Medium grind for a drip machine, right? It'll just take a minute.",
        "cn": "当然！滴滤机用的中度研磨，对吧？一分钟就好。"
      },
      {
        "speaker": "You",
        "en": "Yes please. Oh, and do you offer any kind of subscription for bean deliveries?",
        "cn": "好的。哦，你们有咖啡豆配送的订阅服务吗？"
      },
      {
        "speaker": "Barista",
        "en": "We do! You can set it up on our website. You pick the beans, the grind, and how often you want them delivered. Plus you get a discount.",
        "cn": "有的！可以在我们的网站上设置。选择豆子、研磨度和配送频率。还能享受折扣。"
      },
      {
        "speaker": "You",
        "en": "That's awesome. How much of a discount?",
        "cn": "太好了。折扣力度多大？"
      },
      {
        "speaker": "Barista",
        "en": "Subscribers save fifteen percent on every bag, and shipping is free. It's a pretty good deal if you drink coffee every day.",
        "cn": "订阅用户每袋省百分之十五，免运费。如果你每天喝咖啡的话非常划算。"
      }
    ]
  },
  {
    "id": "coffee-peets-4",
    "cat": "coffee",
    "catName": "咖啡店",
    "catEmoji": "☕",
    "title": "Working Remotely at Peet's",
    "titleCn": "在Peet's远程办公",
    "emoji": "💻",
    "lines": [
      {
        "speaker": "You",
        "en": "Hi! I'm planning to work here for a few hours. Do you have Wi-Fi?",
        "cn": "你好！我打算在这里办公几个小时。你们有Wi-Fi吗？"
      },
      {
        "speaker": "Barista",
        "en": "Yes, we do! The network name is \"Peets_Guest\" and there's no password. Just accept the terms when it pops up.",
        "cn": "有的！网络名是\"Peets_Guest\"，没有密码。弹出条款的时候接受就行。"
      },
      {
        "speaker": "You",
        "en": "Great, thanks! Are there outlets near any of the tables? I need to charge my laptop.",
        "cn": "太好了，谢谢！桌子旁边有插座吗？我需要给笔记本充电。"
      },
      {
        "speaker": "Barista",
        "en": "Yeah, the tables along the back wall all have outlets. I'd grab one of those if you're staying a while.",
        "cn": "有，后面靠墙的桌子旁边都有插座。如果你要待一阵子的话建议坐那边。"
      },
      {
        "speaker": "You",
        "en": "Perfect, I see one open. Let me order first though. Can I get a large iced coffee?",
        "cn": "好的，我看到一个空位。不过让我先点单。来一杯大杯冰咖啡。"
      },
      {
        "speaker": "Barista",
        "en": "Sure! Would you like that black, or with cream and sugar?",
        "cn": "好的！要黑咖啡，还是加奶油和糖？"
      },
      {
        "speaker": "You",
        "en": "Just a splash of cream, no sugar. And can I also get a refill later? How does that work?",
        "cn": "加一点点奶油就行，不加糖。另外我过会儿能续杯吗？怎么操作？"
      },
      {
        "speaker": "Barista",
        "en": "If you're a Peetnik Rewards member, you get free refills on drip coffee and tea during the same visit. Otherwise refills are a dollar fifty.",
        "cn": "如果你是Peetnik Rewards会员，同一次消费可以免费续杯滴滤咖啡和茶。不然续杯一块五。"
      },
      {
        "speaker": "You",
        "en": "I signed up last week actually! I'll use my app. So just come back up here when I want a refill?",
        "cn": "我上周刚注册了！我用App吧。要续杯的时候就走过来就行？"
      },
      {
        "speaker": "Barista",
        "en": "Yep, just bring your cup up and show your app. We'll top you off.",
        "cn": "对，拿着杯子过来出示App就行。我们给你续上。"
      },
      {
        "speaker": "You",
        "en": "Awesome. One more thing — do you mind if I take a phone call in here? I have a video meeting at two.",
        "cn": "太好了。还有一件事——我在这里接电话可以吗？我两点有个视频会议。"
      },
      {
        "speaker": "Barista",
        "en": "We don't have a strict no-phone-call policy, but we'd appreciate it if you keep the volume down since it can get pretty cozy in here.",
        "cn": "我们没有严格的禁止打电话的规定，但希望你保持音量低一点，因为这里空间不太大。"
      },
      {
        "speaker": "You",
        "en": "Of course, I'll use my earbuds and keep it quiet. Is there a quieter corner you'd recommend?",
        "cn": "当然，我会用耳机保持安静。有推荐的安静角落吗？"
      },
      {
        "speaker": "Barista",
        "en": "The far corner by the window is usually the quietest spot. People tend to gather near the counter.",
        "cn": "窗边最远的角落通常最安静。大家一般都聚在吧台附近。"
      },
      {
        "speaker": "You",
        "en": "I'll move over there then. Oh, what time do you close? I want to make sure I don't overstay.",
        "cn": "那我搬到那边去。哦，你们几点关门？我不想待太久打扰你们。"
      },
      {
        "speaker": "Barista",
        "en": "We close at eight tonight. But we start cleaning up around seven thirty, so just keep that in mind.",
        "cn": "今晚八点关门。但七点半左右我们就开始收拾了，记一下就好。"
      },
      {
        "speaker": "You",
        "en": "Got it. I'll be out way before then. How much for the iced coffee?",
        "cn": "明白了。我会提前很久走的。冰咖啡多少钱？"
      },
      {
        "speaker": "Barista",
        "en": "A large iced coffee is four twenty-five. Go ahead and scan your app.",
        "cn": "大杯冰咖啡四块两毛五。扫一下你的App。"
      },
      {
        "speaker": "You",
        "en": "Done! Thanks for all the info. I'll go set up my stuff now.",
        "cn": "好了！谢谢你提供这些信息。我去布置我的东西了。"
      },
      {
        "speaker": "Barista",
        "en": "No problem! Enjoy your work session, and just holler if you need anything.",
        "cn": "不客气！好好办公，有什么需要随时叫我。"
      }
    ]
  },
  {
    "id": "coffee-peets-5",
    "cat": "coffee",
    "catName": "咖啡店",
    "catEmoji": "☕",
    "title": "Comparing Peet's and Starbucks",
    "titleCn": "比较Peet's和星巴克",
    "emoji": "⚖️",
    "lines": [
      {
        "speaker": "You",
        "en": "Hey, can I ask you something kind of funny? What makes Peet's better than Starbucks?",
        "cn": "嘿，我能问你个有点搞笑的问题吗？Peet's比星巴克好在哪里？"
      },
      {
        "speaker": "Barista",
        "en": "Ha! We get that question a lot. I'd say we're not necessarily better — just different. It depends on what you're looking for.",
        "cn": "哈！这个问题我们经常被问到。我觉得不一定是更好——只是不同。取决于你想要什么。"
      },
      {
        "speaker": "You",
        "en": "Fair enough. What would you say the biggest difference is?",
        "cn": "说得有道理。你觉得最大的区别是什么？"
      },
      {
        "speaker": "Barista",
        "en": "Our focus is really on the coffee itself. We roast in small batches and tend to go darker, which gives a richer, bolder flavor.",
        "cn": "我们真正专注的是咖啡本身。我们小批量烘焙，倾向于更深的烘焙度，口味更丰富浓郁。"
      },
      {
        "speaker": "You",
        "en": "I've noticed that. The espresso here does taste stronger. Is it the beans or the roasting?",
        "cn": "我注意到了。这里的浓缩确实味道更浓。是豆子的原因还是烘焙的原因？"
      },
      {
        "speaker": "Barista",
        "en": "Both, actually. We source high-quality arabica beans and roast them by hand. Starbucks uses a more automated process since they're so much bigger.",
        "cn": "两者都有。我们采购高品质的阿拉比卡豆，手工烘焙。星巴克因为规模更大，使用的是更自动化的流程。"
      },
      {
        "speaker": "You",
        "en": "That makes sense. What about the menu? Starbucks has a ton of fancy seasonal drinks.",
        "cn": "有道理。那菜单呢？星巴克有很多花哨的季节限定饮品。"
      },
      {
        "speaker": "Barista",
        "en": "True, their seasonal menu is huge. Ours is smaller, but we focus on quality over variety. We do have seasonal specials too, just fewer of them.",
        "cn": "没错，他们的季节菜单很丰富。我们的较小，但注重质量而非数量。我们也有季节特饮，只是少一些。"
      },
      {
        "speaker": "You",
        "en": "I do love a good Pumpkin Spice Latte from Starbucks though. Do you have anything like that?",
        "cn": "不过我确实喜欢星巴克的南瓜拿铁。你们有类似的吗？"
      },
      {
        "speaker": "Barista",
        "en": "We have our own version in the fall! Ours uses real pumpkin and baking spices. Customers who've tried both usually say ours tastes more natural.",
        "cn": "秋天我们也有自己的版本！用的是真南瓜和烘焙香料。两家都试过的顾客通常说我们的味道更天然。"
      },
      {
        "speaker": "You",
        "en": "Interesting. What about price? Is Peet's more expensive?",
        "cn": "有意思。价格呢？Peet's更贵吗？"
      },
      {
        "speaker": "Barista",
        "en": "We're pretty similar, actually. Maybe fifty cents more on some drinks. But a lot of customers think the taste difference is worth it.",
        "cn": "其实差不多。有些饮品可能贵五毛钱。但很多顾客觉得味道的差异值得。"
      },
      {
        "speaker": "You",
        "en": "And the atmosphere? Starbucks is everywhere, which is convenient.",
        "cn": "那氛围呢？星巴克到处都有，很方便。"
      },
      {
        "speaker": "Barista",
        "en": "That's their biggest advantage — scale and convenience. We have way fewer locations, so we feel more like a neighborhood coffee shop.",
        "cn": "那是他们最大的优势——规模和便利性。我们的店少很多，所以更像社区咖啡馆的感觉。"
      },
      {
        "speaker": "You",
        "en": "I actually like that it's less crowded here. At Starbucks I can never find a seat.",
        "cn": "我其实喜欢这里不那么挤。在星巴克我总找不到座位。"
      },
      {
        "speaker": "Barista",
        "en": "Yeah, that's a common thing we hear. Our regulars love the more relaxed vibe.",
        "cn": "是的，这个我们经常听到。我们的常客很喜欢这种更轻松的氛围。"
      },
      {
        "speaker": "You",
        "en": "Okay, I think I'm becoming a Peet's convert. Let me get a medium dark roast drip coffee.",
        "cn": "好吧，我觉得我要变成Peet's的粉丝了。给我来一杯中杯深烘滴滤咖啡。"
      },
      {
        "speaker": "Barista",
        "en": "Welcome to the club! Medium dark roast coming right up. That's three fifty.",
        "cn": "欢迎加入！中杯深烘马上好。三块五。"
      },
      {
        "speaker": "You",
        "en": "Here you go. I'll probably still go to Starbucks for their Frappuccinos though, not gonna lie.",
        "cn": "给你。不过说实话，我可能还是会去星巴克喝星冰乐。"
      },
      {
        "speaker": "Barista",
        "en": "Hey, no judgment here! Life's too short to be loyal to just one coffee shop. Enjoy!",
        "cn": "嘿，我们不评判！人生苦短，没必要只忠于一家咖啡店。慢慢享用！"
      }
    ]
  },
  {
    "id": "bank-open-1",
    "cat": "bank",
    "catName": "银行",
    "catEmoji": "🏦",
    "title": "Opening a Checking Account",
    "titleCn": "开支票账户",
    "emoji": "📋",
    "lines": [
      {
        "speaker": "Teller",
        "en": "Good morning! Welcome to Chase Bank. How can I help you today?",
        "cn": "早上好！欢迎来到大通银行。今天有什么可以帮您的？"
      },
      {
        "speaker": "You",
        "en": "Hi, I'd like to open a checking account. I just moved to the US and need a bank account.",
        "cn": "你好，我想开一个支票账户。我刚搬到美国，需要一个银行账户。"
      },
      {
        "speaker": "Teller",
        "en": "Congratulations on your move! Let me set you up with one of our bankers. Please have a seat and someone will be right with you.",
        "cn": "恭喜你搬来！让我帮你安排一位银行顾问。请坐，马上就有人来。"
      },
      {
        "speaker": "Banker",
        "en": "Hi there! I'm Kevin. I understand you'd like to open a checking account. Have you had a US bank account before?",
        "cn": "你好！我是Kevin。我了解到你想开一个支票账户。你以前有过美国的银行账户吗？"
      },
      {
        "speaker": "You",
        "en": "No, this is my first one. I'm not really sure what I need or how it works.",
        "cn": "没有，这是我的第一个。我不太确定需要什么，也不了解怎么运作。"
      },
      {
        "speaker": "Banker",
        "en": "No worries! I'll walk you through everything. First, do you have two forms of ID? A passport and something with your current address would work.",
        "cn": "没关系！我会一步一步带你了解。首先，你有两种身份证件吗？护照加一个有你现住址的证件就行。"
      },
      {
        "speaker": "You",
        "en": "I have my passport and my apartment lease agreement. Would that work?",
        "cn": "我有护照和公寓租约。可以吗？"
      },
      {
        "speaker": "Banker",
        "en": "The lease works great for address verification. Now, we have a few checking account options. The basic one has no monthly fee if you keep a minimum balance of fifteen hundred dollars.",
        "cn": "租约可以用来验证地址。我们有几种支票账户选择。基本款如果保持一千五百美元的最低余额，就没有月费。"
      },
      {
        "speaker": "You",
        "en": "What happens if my balance goes below fifteen hundred?",
        "cn": "如果余额低于一千五百会怎样？"
      },
      {
        "speaker": "Banker",
        "en": "Then there's a twelve-dollar monthly service fee. But you can also waive the fee by setting up direct deposit from your employer.",
        "cn": "那会有每月十二美元的服务费。但如果设置了工资直接存款，也可以免除这笔费用。"
      },
      {
        "speaker": "You",
        "en": "I do have a job starting next week. I can set up direct deposit. How do I do that?",
        "cn": "我下周开始工作。我可以设置工资直接存款。怎么操作？"
      },
      {
        "speaker": "Banker",
        "en": "Once your account is open, I'll give you your routing number and account number. Just give those to your employer's payroll department.",
        "cn": "账户开通后，我会给你routing number和账户号码。把这些给你雇主的薪资部门就行。"
      },
      {
        "speaker": "You",
        "en": "Got it. Does the account come with a debit card?",
        "cn": "明白了。账户带借记卡吗？"
      },
      {
        "speaker": "Banker",
        "en": "Yes! You'll get a temporary debit card today, and we'll mail your permanent card with your name on it within seven to ten business days.",
        "cn": "是的！今天你会拿到一张临时借记卡，带你名字的正式卡会在七到十个工作日内寄到。"
      },
      {
        "speaker": "You",
        "en": "Can I also use the mobile banking app?",
        "cn": "我也可以用手机银行App吗？"
      },
      {
        "speaker": "Banker",
        "en": "Absolutely. You can download our app to check your balance, transfer money, deposit checks by taking a photo, and pay bills.",
        "cn": "当然。你可以下载我们的App查余额、转账、拍照存支票和付账单。"
      },
      {
        "speaker": "You",
        "en": "That's very convenient. How much do I need to deposit to open the account today?",
        "cn": "非常方便。今天开户需要存多少钱？"
      },
      {
        "speaker": "Banker",
        "en": "The minimum opening deposit is twenty-five dollars. But I'd recommend depositing at least enough to cover any immediate expenses.",
        "cn": "最低开户存款是二十五美元。但我建议至少存够应付近期开销的金额。"
      },
      {
        "speaker": "You",
        "en": "I'll deposit five hundred dollars to start. Can I do that in cash?",
        "cn": "我先存五百美元。可以存现金吗？"
      },
      {
        "speaker": "Banker",
        "en": "Of course! Let me get all the paperwork ready for you to sign, and then we'll make the deposit. This should take about fifteen minutes total.",
        "cn": "当然可以！让我把所有文件准备好让你签字，然后我们来存款。整个过程大约需要十五分钟。"
      }
    ]
  },
  {
    "id": "bank-open-2",
    "cat": "bank",
    "catName": "银行",
    "catEmoji": "🏦",
    "title": "Opening a Savings Account",
    "titleCn": "开储蓄账户",
    "emoji": "💰",
    "lines": [
      {
        "speaker": "Banker",
        "en": "Hi, welcome to Bank of America. What brings you in today?",
        "cn": "你好，欢迎来到美国银行。今天来办什么业务？"
      },
      {
        "speaker": "You",
        "en": "Hi, I already have a checking account here, but I'd like to open a savings account too.",
        "cn": "你好，我已经有你们的支票账户了，但我还想开一个储蓄账户。"
      },
      {
        "speaker": "Banker",
        "en": "Great idea! Saving is so important. Let me pull up your checking account first. Can I see your ID?",
        "cn": "好主意！储蓄很重要。让我先调出你的支票账户。能看一下你的身份证件吗？"
      },
      {
        "speaker": "You",
        "en": "Sure, here's my driver's license. So what kinds of savings accounts do you offer?",
        "cn": "好的，这是我的驾照。你们有什么样的储蓄账户？"
      },
      {
        "speaker": "Banker",
        "en": "We have two main options. Our Advantage Savings has a higher interest rate but requires a minimum daily balance. Our regular savings has no minimum but a lower rate.",
        "cn": "我们有两个主要选项。Advantage Savings利率更高但要求最低日余额。普通储蓄账户没有最低余额但利率较低。"
      },
      {
        "speaker": "You",
        "en": "What's the interest rate on each?",
        "cn": "各自的利率是多少？"
      },
      {
        "speaker": "Banker",
        "en": "The regular savings earns point zero one percent APY. The Advantage Savings can earn up to point zero four percent, depending on your balance tier.",
        "cn": "普通储蓄的年利率是百分之零点零一。Advantage Savings根据余额等级最高可以达到百分之零点零四。"
      },
      {
        "speaker": "You",
        "en": "Honestly, those rates seem really low. Are there any other options to earn more?",
        "cn": "说实话，这些利率看起来很低。有其他能赚更多的选项吗？"
      },
      {
        "speaker": "Banker",
        "en": "I understand. You might also consider a high-yield savings account online, or a CD if you can lock your money up for a set period.",
        "cn": "我理解。你也可以考虑网上的高收益储蓄账户，或者如果能把钱锁定一段时间的话可以考虑定期存款。"
      },
      {
        "speaker": "You",
        "en": "What's a CD exactly? I've heard the term but I'm not sure what it means.",
        "cn": "CD到底是什么？我听过这个词但不太确定意思。"
      },
      {
        "speaker": "Banker",
        "en": "CD stands for Certificate of Deposit. You deposit a fixed amount for a fixed term — like six months or a year — and in return you get a higher interest rate.",
        "cn": "CD是定期存单的意思。你存入一笔固定金额，期限固定——比如六个月或一年——作为回报你能得到更高的利率。"
      },
      {
        "speaker": "You",
        "en": "What happens if I need the money before the term is up?",
        "cn": "如果期限没到我就需要用钱怎么办？"
      },
      {
        "speaker": "Banker",
        "en": "There's an early withdrawal penalty, usually a few months' worth of interest. So it's best for money you know you won't need right away.",
        "cn": "会有提前取款的罚金，通常是几个月的利息。所以最好存你确定短期不需要用的钱。"
      },
      {
        "speaker": "You",
        "en": "I think I'll just start with the regular savings for now. I want easy access to my money.",
        "cn": "那我想先开个普通储蓄账户。我希望能随时用到钱。"
      },
      {
        "speaker": "Banker",
        "en": "Makes sense. One thing to know — federal regulations used to limit savings withdrawals to six per month, but that rule has been relaxed. Still, it's designed for saving, not daily spending.",
        "cn": "有道理。有一点要知道——联邦法规以前限制储蓄账户每月取款六次，不过这个规定已经放宽了。但它毕竟是为储蓄设计的，不是日常消费。"
      },
      {
        "speaker": "You",
        "en": "Got it. Can I transfer money between my checking and savings through the app?",
        "cn": "明白了。我可以通过App在支票账户和储蓄账户之间转账吗？"
      },
      {
        "speaker": "Banker",
        "en": "Yes, instantly! You can even set up automatic transfers, like moving a hundred dollars to savings every payday. It's a great way to build the habit.",
        "cn": "可以，秒到！你还可以设置自动转账，比如每个发薪日自动转一百美元到储蓄账户。这是养成储蓄习惯的好方法。"
      },
      {
        "speaker": "Banker",
        "en": "Just twenty-five dollars. And since you already have a checking account with us, the setup is quick. I just need you to sign a couple of forms.",
        "cn": "只要二十五美元。而且因为你已经有我们的支票账户了，开户很快。你只需要签几份表格。"
      },
      {
        "speaker": "You",
        "en": "Let's do it. I'll transfer two thousand from checking to get started.",
        "cn": "那就办吧。我从支票账户转两千美元过来开始。"
      },
      {
        "speaker": "Banker",
        "en": "Perfect! I'll set that transfer up right now. Your savings account will be active within the hour. Anything else I can help with?",
        "cn": "好的！我现在就设置这笔转账。你的储蓄账户一小时内就能激活。还有其他需要帮忙的吗？"
      }
    ]
  },
  {
    "id": "bank-card-1",
    "cat": "bank",
    "catName": "银行",
    "catEmoji": "🏦",
    "title": "Reporting a Lost Debit Card",
    "titleCn": "挂失借记卡",
    "emoji": "💳",
    "lines": [
      {
        "speaker": "You",
        "en": "Hi, I need to report a lost debit card. I think I left it at a restaurant last night.",
        "cn": "你好，我需要挂失借记卡。我觉得昨晚把它落在餐厅了。"
      },
      {
        "speaker": "Teller",
        "en": "I'm sorry to hear that. Let me help you right away. Can I see your ID so I can pull up your account?",
        "cn": "很抱歉听到这个。让我马上帮你处理。能看一下你的身份证件以便调出你的账户吗？"
      },
      {
        "speaker": "You",
        "en": "Here's my driver's license. Should I be worried about someone using my card?",
        "cn": "这是我的驾照。我需要担心有人盗刷我的卡吗？"
      },
      {
        "speaker": "Teller",
        "en": "Let me lock the card immediately to prevent any unauthorized use. I'm doing that right now... Okay, it's locked. No one can use it.",
        "cn": "让我立刻锁定这张卡以防止任何未授权的使用。我现在就操作……好了，已经锁定了。没人能用了。"
      },
      {
        "speaker": "You",
        "en": "Oh thank goodness. Has anyone tried to use it since last night?",
        "cn": "谢天谢地。昨晚到现在有人试过用它吗？"
      },
      {
        "speaker": "Teller",
        "en": "Let me check your recent transactions... I see the restaurant charge from last night, but nothing after that. So you're in the clear.",
        "cn": "让我查看你的近期交易……我看到昨晚的餐厅消费，但之后没有了。所以没问题。"
      },
      {
        "speaker": "You",
        "en": "That's a relief. So what happens now? Do I get a new card?",
        "cn": "那就放心了。那现在怎么办？我能拿到新卡吗？"
      },
      {
        "speaker": "Teller",
        "en": "Yes, I can order a replacement card for you. It'll arrive in five to seven business days. Or I can issue a temporary card right now.",
        "cn": "是的，我可以帮你订一张补办卡。五到七个工作日到。或者我现在可以发一张临时卡。"
      },
      {
        "speaker": "You",
        "en": "I need to buy groceries today, so a temporary card would be great. Will it have the same card number?",
        "cn": "我今天需要买菜，所以临时卡就太好了。卡号和以前一样吗？"
      },
      {
        "speaker": "Teller",
        "en": "No, the replacement will have a new card number for security reasons. The old number is permanently deactivated.",
        "cn": "不，出于安全考虑，补办卡会有新卡号。旧卡号已经永久停用了。"
      },
      {
        "speaker": "You",
        "en": "Oh, that means I need to update my card info everywhere. Like for my subscriptions and autopay bills.",
        "cn": "哦，那意味着我需要到处更新卡信息。比如订阅服务和自动付款的账单。"
      },
      {
        "speaker": "Teller",
        "en": "That's right. Any recurring payments linked to the old card number will need to be updated once you receive your new permanent card.",
        "cn": "没错。所有关联旧卡号的定期付款都需要在你收到新的正式卡后更新。"
      },
      {
        "speaker": "You",
        "en": "That's going to be a hassle, but I understand. Is there a fee for the replacement card?",
        "cn": "那会很麻烦，但我理解。补卡收费吗？"
      },
      {
        "speaker": "Teller",
        "en": "Since you reported it right away, there's no fee for the replacement. We appreciate you acting quickly.",
        "cn": "因为你及时来报告了，补卡不收费。我们很感谢你迅速采取行动。"
      },
      {
        "speaker": "You",
        "en": "Good to know. What if the restaurant finds my old card? Should I still use it?",
        "cn": "这就好。如果餐厅找到了我的旧卡呢？我还能用吗？"
      },
      {
        "speaker": "Teller",
        "en": "No, please don't use the old card even if you find it. Once it's deactivated, it can't be reactivated. Just cut it up and throw it away.",
        "cn": "不行，即使找到旧卡也请不要使用。一旦停用就无法重新激活。把它剪碎扔掉就好。"
      },
      {
        "speaker": "You",
        "en": "Understood. Let me get that temporary card then. Does it work right away?",
        "cn": "明白了。那我先拿临时卡吧。可以马上用吗？"
      },
      {
        "speaker": "Teller",
        "en": "Yes, you can use it immediately. Let me set your PIN. You'll enter a four-digit PIN on this keypad — cover it with your hand.",
        "cn": "是的，可以立刻使用。让我帮你设密码。在这个键盘上输入四位密码——用手遮住。"
      },
      {
        "speaker": "You",
        "en": "Done. So this temporary card works at ATMs too?",
        "cn": "好了。这张临时卡在ATM也能用吗？"
      },
      {
        "speaker": "Teller",
        "en": "Yes, it works for purchases and ATM withdrawals. Just remember to switch to the permanent card once it arrives. Is there anything else I can help with?",
        "cn": "是的，购物和ATM取款都可以。只要记得正式卡到了就换过来。还有什么需要帮忙的吗？"
      }
    ]
  },
  {
    "id": "bank-card-2",
    "cat": "bank",
    "catName": "银行",
    "catEmoji": "🏦",
    "title": "Closing a Credit Card Account",
    "titleCn": "注销信用卡",
    "emoji": "✂️",
    "lines": [
      {
        "speaker": "You",
        "en": "Hi, I'd like to close my credit card account. I have a Visa card with you guys.",
        "cn": "你好，我想注销我的信用卡账户。我有你们的一张Visa卡。"
      },
      {
        "speaker": "Banker",
        "en": "I can help with that. Before we proceed, may I ask why you're looking to close the account?",
        "cn": "我可以帮你处理。在开始之前，能问一下为什么想注销吗？"
      },
      {
        "speaker": "You",
        "en": "I have too many credit cards and I want to simplify. This one has an annual fee that I'd rather not pay anymore.",
        "cn": "我信用卡太多了，想简化一下。这张有年费，我不想再交了。"
      },
      {
        "speaker": "Banker",
        "en": "I understand. Just so you know, we could potentially waive the annual fee or switch you to a no-fee card instead. Would you be interested in either of those options?",
        "cn": "我理解。告诉你一下，我们可能可以免除年费或者帮你转成无年费的卡。你对这些选项有兴趣吗？"
      },
      {
        "speaker": "You",
        "en": "I appreciate the offer, but I've already made up my mind. I just want to close it.",
        "cn": "感谢你的提议，但我已经决定了。我就想注销。"
      },
      {
        "speaker": "Banker",
        "en": "No problem at all. Let me pull up your account. Can I see your ID? And do you have the card with you?",
        "cn": "完全没问题。让我调出你的账户。能看一下你的身份证件吗？卡带了吗？"
      },
      {
        "speaker": "Banker",
        "en": "Yes, the account needs to have a zero balance before we can close it. Let me check... You have a remaining balance of a hundred and twenty-three dollars and forty-five cents.",
        "cn": "是的，账户余额必须为零才能注销。让我查查……你还有一百二十三美元四毛五的余额。"
      },
      {
        "speaker": "You",
        "en": "Can I pay that off right now?",
        "cn": "我现在可以还清吗？"
      },
      {
        "speaker": "Banker",
        "en": "Absolutely. You can pay by cash, check, or transfer from your checking account. Which would you prefer?",
        "cn": "当然可以。你可以用现金、支票或从支票账户转账还款。你选哪种？"
      },
      {
        "speaker": "You",
        "en": "I'll transfer from my checking account. It's at this same bank.",
        "cn": "我从支票账户转吧。就在你们这家银行。"
      },
      {
        "speaker": "Banker",
        "en": "Perfect, that makes it easy. I've transferred the full balance. Your credit card balance is now zero. Now, there are a few things to know about closing a credit card.",
        "cn": "好的，这样很方便。我已经转了全额。你的信用卡余额现在为零了。现在有几件关于注销信用卡需要知道的事。"
      },
      {
        "speaker": "You",
        "en": "Oh? Like what?",
        "cn": "哦？什么事？"
      },
      {
        "speaker": "Banker",
        "en": "Closing a credit card can affect your credit score. It reduces your total available credit and can shorten your credit history.",
        "cn": "注销信用卡可能会影响你的信用评分。它会减少你的总可用额度，也可能缩短你的信用记录长度。"
      },
      {
        "speaker": "You",
        "en": "I've thought about that. I have other cards with longer histories, so I think I'll be okay.",
        "cn": "我考虑过了。我有其他历史更久的卡，所以应该没问题。"
      },
      {
        "speaker": "Banker",
        "en": "Sounds like you've done your research. I'll process the closure now. You should also destroy the physical card.",
        "cn": "看来你做过功课了。我现在处理注销。你也应该销毁实体卡。"
      },
      {
        "speaker": "You",
        "en": "I have the card here. Should I give it to you?",
        "cn": "卡在我这里。要交给你吗？"
      },
      {
        "speaker": "Banker",
        "en": "You can hand it to me and I'll shred it here, or you can cut it up yourself at home. Either way works.",
        "cn": "你可以交给我，我在这里碎掉，或者你自己回家剪碎也行。都可以。"
      },
      {
        "speaker": "You",
        "en": "I'll give it to you. And how long until the account is officially closed?",
        "cn": "我交给你吧。账户正式注销需要多久？"
      },
      {
        "speaker": "Banker",
        "en": "The account will show as closed within one to two billing cycles. You'll receive a confirmation letter in the mail. Make sure any recurring charges are moved to another card first.",
        "cn": "账户会在一到两个账单周期内显示为已注销。你会收到一封确认信。确保所有定期扣款都已经转到其他卡上了。"
      },
      {
        "speaker": "You",
        "en": "I already moved everything over. Thanks for making this so straightforward. I was expecting it to be harder.",
        "cn": "我已经全部转好了。谢谢你让这个过程这么简单。我本以为会更复杂的。"
      }
    ]
  },
  {
    "id": "bank-wire-1",
    "cat": "bank",
    "catName": "银行",
    "catEmoji": "🏦",
    "title": "Sending an International Wire Transfer",
    "titleCn": "国际汇款",
    "emoji": "🌍",
    "lines": [
      {
        "speaker": "You",
        "en": "Hi, I need to send money to my family in China. Can I do an international wire transfer here?",
        "cn": "你好，我需要给国内家人汇款。我可以在这里做国际汇款吗？"
      },
      {
        "speaker": "Teller",
        "en": "Yes, we can set that up for you! International wires are handled at the service desk. Let me walk you over there.",
        "cn": "可以的，我们可以帮你办理！国际汇款在服务台处理。我带你过去。"
      },
      {
        "speaker": "Banker",
        "en": "Hi, I hear you'd like to send an international wire. Where are you sending it to?",
        "cn": "你好，听说你要做国际汇款。汇到哪里？"
      },
      {
        "speaker": "You",
        "en": "To China, to my parents' bank account. They bank with ICBC — the Industrial and Commercial Bank of China.",
        "cn": "汇到中国，汇到我父母的银行账户。他们在工商银行。"
      },
      {
        "speaker": "Banker",
        "en": "Okay, I'll need some information. Do you have the recipient's full name, bank name, account number, and the bank's SWIFT code?",
        "cn": "好的，我需要一些信息。你有收款人的全名、银行名称、账号和银行的SWIFT代码吗？"
      },
      {
        "speaker": "You",
        "en": "I have the name and account number. What's a SWIFT code? I'm not sure I have that.",
        "cn": "我有姓名和账号。SWIFT代码是什么？我不确定我有。"
      },
      {
        "speaker": "Banker",
        "en": "A SWIFT code is an international bank identification code. It's used to route money to the correct bank worldwide. For ICBC, I can look that up for you.",
        "cn": "SWIFT代码是国际银行识别码。用于将汇款路由到全球正确的银行。工商银行的我可以帮你查。"
      },
      {
        "speaker": "You",
        "en": "Oh great, thanks. Here's the account number and my dad's name. How much can I send?",
        "cn": "太好了，谢谢。这是账号和我爸的名字。我最多能汇多少？"
      },
      {
        "speaker": "Banker",
        "en": "There's no set maximum for wire transfers, but amounts over ten thousand dollars are reported to the government as required by law. How much are you looking to send?",
        "cn": "汇款没有固定上限，但超过一万美元的金额按法律要求需要向政府申报。你打算汇多少？"
      },
      {
        "speaker": "You",
        "en": "I want to send five thousand US dollars. Will it arrive in dollars or Chinese yuan?",
        "cn": "我想汇五千美元。到账是美元还是人民币？"
      },
      {
        "speaker": "Banker",
        "en": "It depends on the receiving bank. Most Chinese banks will automatically convert it to yuan at the current exchange rate when it arrives.",
        "cn": "取决于收款银行。大多数中国的银行在到账时会自动按当时的汇率转换成人民币。"
      },
      {
        "speaker": "You",
        "en": "Got it. What are the fees for sending this wire?",
        "cn": "明白了。汇这笔钱的手续费是多少？"
      },
      {
        "speaker": "Banker",
        "en": "Our outgoing international wire fee is forty-five dollars. There may also be intermediary bank fees and a fee on the receiving end, which vary.",
        "cn": "我们的国际汇款手续费是四十五美元。中间银行可能还有费用，收款方那边也可能收费，这些各不相同。"
      },
      {
        "speaker": "You",
        "en": "So the total fees could be more than forty-five? About how much in total?",
        "cn": "所以总费用可能不止四十五？大概一共多少？"
      },
      {
        "speaker": "Banker",
        "en": "Typically the intermediary and receiving bank fees combined are another ten to thirty dollars, depending on the banks involved.",
        "cn": "通常中间银行和收款银行的费用加起来还有十到三十美元，取决于涉及的银行。"
      },
      {
        "speaker": "You",
        "en": "That's quite a bit. Are there any cheaper ways to send money internationally?",
        "cn": "费用不少啊。有没有更便宜的国际汇款方式？"
      },
      {
        "speaker": "Banker",
        "en": "You might want to look into services like Wise or Remitly for smaller amounts. They often have lower fees and better exchange rates. But for larger or more formal transfers, a bank wire is the most secure.",
        "cn": "你可以看看Wise或Remitly这样的服务，对较小金额来说更合适。它们通常手续费更低、汇率更好。但对于较大金额或更正式的转账，银行汇款最安全。"
      },
      {
        "speaker": "You",
        "en": "I'll stick with the wire transfer this time since it's a larger amount. How long will it take to arrive?",
        "cn": "这次金额较大，我还是用银行汇款吧。到账需要多长时间？"
      },
      {
        "speaker": "Banker",
        "en": "International wires usually take one to three business days. I'll give you a confirmation number so you can track it.",
        "cn": "国际汇款通常需要一到三个工作日。我会给你一个确认号，你可以用它追踪进度。"
      },
      {
        "speaker": "You",
        "en": "Perfect. Let's go ahead and send it. I'll deduct it from my checking account.",
        "cn": "好的。那就办理吧。从我的支票账户扣款。"
      }
    ]
  },
  {
    "id": "shopping-shoes-1",
    "cat": "shopping",
    "catName": "商场购物",
    "catEmoji": "🛍️",
    "title": "Buying Running Shoes at Nike Store",
    "titleCn": "耐克店买跑鞋",
    "emoji": "👟",
    "lines": [
      {
        "speaker": "Staff",
        "en": "Hey there! Welcome to Nike. Are you looking for anything specific today?",
        "cn": "嘿！欢迎来到耐克。今天有什么特别想找的吗？"
      },
      {
        "speaker": "You",
        "en": "Yeah, I need a pair of running shoes. I just started jogging and my current shoes aren't cutting it.",
        "cn": "嗯，我需要一双跑鞋。我刚开始跑步，现在的鞋子不太行。"
      },
      {
        "speaker": "Staff",
        "en": "Great that you're getting into running! Do you know what kind of running you'll be doing? Like road running, trail, or treadmill?",
        "cn": "开始跑步很棒！你知道你主要跑什么类型吗？比如公路跑、越野跑还是跑步机？"
      },
      {
        "speaker": "You",
        "en": "Mostly road running. I run on the sidewalk in my neighborhood, about three miles at a time.",
        "cn": "主要是公路跑。我在小区的人行道上跑，每次大概三英里。"
      },
      {
        "speaker": "Staff",
        "en": "Perfect. For road running, I'd recommend something with good cushioning and support. What's your shoe size?",
        "cn": "好的。公路跑的话我推荐缓震性和支撑性好的。你穿多大码？"
      },
      {
        "speaker": "You",
        "en": "In China I'm a 42, but I'm not sure what that is in US sizes.",
        "cn": "在中国我穿42码，但不知道美国码是多少。"
      },
      {
        "speaker": "Staff",
        "en": "No worries! European 42 is usually a US men's 8.5 or 9. Let me measure your foot to be sure. Can you take off your shoe and step on this device?",
        "cn": "没关系！欧码42通常是美国男码8.5或9。让我量一下你的脚来确定。能脱掉鞋子踩在这个设备上吗？"
      },
      {
        "speaker": "You",
        "en": "Sure, here you go. I think my feet might be a little wide too.",
        "cn": "好的。我觉得我的脚可能有点宽。"
      },
      {
        "speaker": "Staff",
        "en": "You're a 9 in length and yes, slightly wide. I'd recommend trying our shoes in 9 wide. Let me grab the Nike Pegasus and the React for you — both are great for beginners.",
        "cn": "你脚长是9码，确实稍微宽一点。我建议你试试9码的宽版。让我给你拿Nike Pegasus和React——两双都很适合初学者。"
      },
      {
        "speaker": "You",
        "en": "What's the difference between those two?",
        "cn": "这两双有什么区别？"
      },
      {
        "speaker": "Staff",
        "en": "The Pegasus is lighter and more responsive — great for faster runs. The React has more cushioning, so it's better for longer distances and easier on your joints.",
        "cn": "Pegasus更轻更灵敏——适合快跑。React缓震更多，更适合长距离，对关节更友好。"
      },
      {
        "speaker": "You",
        "en": "I think more cushioning sounds better for me since I'm just starting out. Can I try the React first?",
        "cn": "我觉得缓震多一点对我这个刚开始跑的人更好。可以先试React吗？"
      },
      {
        "speaker": "Staff",
        "en": "Absolutely! Here you go. Put them on and walk around. There should be about a thumb's width of space between your longest toe and the front of the shoe.",
        "cn": "当然！给你。穿上走走看。最长的脚趾和鞋头之间应该有大约一个拇指宽的空间。"
      },
      {
        "speaker": "You",
        "en": "These feel really comfortable! The cushioning is amazing. But how do I know if they're actually good for running and not just standing?",
        "cn": "感觉非常舒服！缓震太好了。但我怎么知道跑步时也合适，不光是站着舒服？"
      },
      {
        "speaker": "Staff",
        "en": "Good question! Try jogging in place or doing a short run up and down the aisle. Pay attention to any heel slipping or tightness across the top.",
        "cn": "好问题！试试原地跑或在走道上来回小跑一下。注意脚后跟有没有滑动，鞋面有没有太紧。"
      },
      {
        "speaker": "You",
        "en": "Okay, let me try... Yeah, they feel great! No slipping. How much are these?",
        "cn": "好，让我试试……嗯，感觉很棒！没有滑动。这双多少钱？"
      },
      {
        "speaker": "Staff",
        "en": "The React is a hundred and forty dollars. We also have a ten percent off deal if you sign up for our Nike membership. It's free to join.",
        "cn": "React是一百四十美元。如果注册Nike会员可以打九折。免费注册。"
      },
      {
        "speaker": "You",
        "en": "I'll sign up! So that brings it down to a hundred and twenty-six?",
        "cn": "我注册！那就是一百二十六？"
      },
      {
        "speaker": "Staff",
        "en": "Exactly! I'll ring you up at the register. Would you like to wear them out or keep them in the box?",
        "cn": "没错！我在收银台帮你结账。你想穿着走还是放在盒子里？"
      },
      {
        "speaker": "You",
        "en": "I'll wear them out! Can you put my old shoes in the box? Thanks for all your help!",
        "cn": "我穿着走！能把我的旧鞋放盒子里吗？太感谢你的帮助了！"
      }
    ]
  },
  {
    "id": "shopping-pants-1",
    "cat": "shopping",
    "catName": "商场购物",
    "catEmoji": "🛍️",
    "title": "Trying on Jeans at a Department Store",
    "titleCn": "商场试牛仔裤",
    "emoji": "👖",
    "lines": [
      {
        "speaker": "You",
        "en": "Excuse me, could you help me find some jeans? I'm not sure about American sizing.",
        "cn": "打扰一下，能帮我找几条牛仔裤吗？我不太了解美国的尺码。"
      },
      {
        "speaker": "Staff",
        "en": "Of course! American jeans are sized by waist and length in inches. Do you know your measurements?",
        "cn": "当然！美国牛仔裤按腰围和裤长的英寸数来定尺码。你知道你的尺寸吗？"
      },
      {
        "speaker": "You",
        "en": "In China I wear a 31 waist, but I don't know my inseam length in inches.",
        "cn": "在中国我穿31的腰围，但不知道内缝长度的英寸数。"
      },
      {
        "speaker": "Staff",
        "en": "No problem! I can measure you really quick. The inseam is the length from your crotch to the bottom of the leg. Stand straight for me... You're about a 30 inseam.",
        "cn": "没关系！我快速帮你量一下。内缝是从裆部到裤脚的长度。站直……你的内缝大约是30。"
      },
      {
        "speaker": "You",
        "en": "So I should look for 31 by 30? Are those the two numbers on the tag?",
        "cn": "那我应该找31乘30的？标签上就是这两个数字吗？"
      },
      {
        "speaker": "Staff",
        "en": "Exactly! The first number is waist, second is length. Let's find some styles you like. Do you prefer slim fit, straight, or relaxed?",
        "cn": "没错！第一个数字是腰围，第二个是裤长。来找找你喜欢的款式吧。你喜欢修身、直筒还是宽松的？"
      },
      {
        "speaker": "You",
        "en": "I usually wear slim fit, but not too tight. Something in between would be ideal.",
        "cn": "我一般穿修身的，但不要太紧。介于两者之间的最理想。"
      },
      {
        "speaker": "Staff",
        "en": "Try our \"slim straight\" fit. It's tapered through the leg but not as tight as a skinny jean. Very popular right now.",
        "cn": "试试我们的\"修身直筒\"。裤腿有收窄但不像紧身牛仔裤那么紧。现在很流行。"
      },
      {
        "speaker": "You",
        "en": "Sure, I'll try those. Do you have them in dark blue?",
        "cn": "好的，我试试。有深蓝色的吗？"
      },
      {
        "speaker": "Staff",
        "en": "We have dark wash, medium wash, and black. Let me grab the dark wash in 31 by 30 for you. The fitting rooms are just around the corner.",
        "cn": "有深色水洗、中度水洗和黑色。我给你拿一条31乘30的深色水洗。试衣间就在转角。"
      },
      {
        "speaker": "You",
        "en": "Thanks! Oh, one question — do American jeans shrink after washing?",
        "cn": "谢谢！哦，问一个问题——美国的牛仔裤洗过会缩水吗？"
      },
      {
        "speaker": "Staff",
        "en": "These are pre-shrunk, so they shouldn't shrink much. But I'd still recommend washing them in cold water and hang drying to keep them looking their best.",
        "cn": "这些是预缩处理过的，所以不会缩太多。但我还是建议冷水洗、晾干，这样能保持最好的状态。"
      },
      {
        "speaker": "You",
        "en": "Good to know. Let me go try them on... Okay, I'm back. The waist fits perfectly, but the legs feel a little long.",
        "cn": "知道了。让我去试试……好了，我出来了。腰围完美，但裤腿感觉有点长。"
      },
      {
        "speaker": "Staff",
        "en": "We can have those hemmed for you. Our tailor is right inside the store. It usually costs about ten to fifteen dollars.",
        "cn": "我们可以帮你改短。店里有裁缝。通常要十到十五美元。"
      },
      {
        "speaker": "You",
        "en": "Oh, that's handy! How long does it take?",
        "cn": "哦，那很方便！需要多长时间？"
      },
      {
        "speaker": "Staff",
        "en": "Usually about thirty minutes if you wait, or you can pick them up tomorrow. How much shorter do you want them?",
        "cn": "如果你等的话通常大约三十分钟，或者明天来取。你想改短多少？"
      },
      {
        "speaker": "You",
        "en": "Just about an inch. I want them to sit right at my shoe. How much are the jeans themselves?",
        "cn": "大约一英寸就行。我想让裤脚正好到鞋子。裤子本身多少钱？"
      },
      {
        "speaker": "Staff",
        "en": "These are Levi's 511 slim straight, regular price sixty-eight dollars. But they're part of our buy one get one fifty percent off sale right now.",
        "cn": "这是Levi's 511修身直筒，原价六十八美元。不过现在正好参加买一条第二条半价的活动。"
      },
      {
        "speaker": "You",
        "en": "Really? Then I might grab a second pair in a different color. Can I try the black ones too?",
        "cn": "真的吗？那我可能再拿一条不同颜色的。可以也试试黑色的吗？"
      },
      {
        "speaker": "Staff",
        "en": "Absolutely! Same size? I'll grab those right now. You're getting a great deal!",
        "cn": "当然！同样尺码吗？我马上去拿。你捡到便宜了！"
      }
    ]
  },
  {
    "id": "shopping-clothes-1",
    "cat": "shopping",
    "catName": "商场购物",
    "catEmoji": "🛍️",
    "title": "Shopping for a Formal Outfit",
    "titleCn": "买正装",
    "emoji": "👔",
    "lines": [
      {
        "speaker": "You",
        "en": "Hi, I need to buy a formal outfit. I have a job interview next week and I want to look professional.",
        "cn": "你好，我需要买一套正装。下周有面试，我想穿得职业一些。"
      },
      {
        "speaker": "Staff",
        "en": "Congratulations on the interview! What kind of company is it? That'll help me suggest the right level of formality.",
        "cn": "恭喜你有面试！是什么类型的公司？这样我好建议合适的正式程度。"
      },
      {
        "speaker": "You",
        "en": "It's a finance company downtown. I think they're pretty traditional.",
        "cn": "是市中心的一家金融公司。我觉得他们挺传统的。"
      },
      {
        "speaker": "Staff",
        "en": "Then you'll definitely want a classic look. I'd suggest a navy or charcoal suit with a white or light blue dress shirt and a conservative tie.",
        "cn": "那你肯定需要经典造型。我建议一套藏青色或炭灰色西装，搭配白色或浅蓝色正装衬衫和一条保守的领带。"
      },
      {
        "speaker": "You",
        "en": "I've never bought a suit in the US before. What should I look for in terms of fit?",
        "cn": "我从没在美国买过西装。合身方面应该注意什么？"
      },
      {
        "speaker": "Staff",
        "en": "The shoulders of the jacket should end right at your shoulder bone. The sleeves should show about half an inch of your shirt cuff. Let me get your measurements first.",
        "cn": "西装外套的肩线应该正好在你的肩骨处。袖子应该露出大约半英寸的衬衫袖口。让我先量一下你的尺寸。"
      },
      {
        "speaker": "You",
        "en": "Sure. I'm probably a size 40 based on my measurements in China.",
        "cn": "好的。按我在中国的尺寸，大概是40码。"
      },
      {
        "speaker": "Staff",
        "en": "Let me check... Yes, you're a 40 regular in the jacket. Let me pull a few options for you to try. Do you have a budget in mind?",
        "cn": "让我量量……对，你穿40常规码的外套。让我拿几套给你试。你有预算吗？"
      },
      {
        "speaker": "You",
        "en": "I'd like to stay under five hundred dollars for everything — suit, shirt, and tie.",
        "cn": "所有的加起来我希望在五百美元以下——西装、衬衫和领带。"
      },
      {
        "speaker": "Staff",
        "en": "That's very doable! Here's a navy suit for two ninety-nine, and we have dress shirts starting at forty-five. Let me set you up in a fitting room.",
        "cn": "完全可以！这里有一套藏青色西装二百九十九，正装衬衫四十五起。让我带你去试衣间。"
      },
      {
        "speaker": "You",
        "en": "This jacket feels good in the shoulders. But isn't it a little long?",
        "cn": "这件外套肩膀感觉不错。但是不是有点长？"
      },
      {
        "speaker": "Staff",
        "en": "Actually, a suit jacket should cover your seat. This length looks right for your frame. How does the pants fit?",
        "cn": "其实西装外套应该盖住臀部。这个长度对你的身形来说合适。裤子合身吗？"
      },
      {
        "speaker": "You",
        "en": "The waist is fine but the pants are too long. They're bunching up at the bottom.",
        "cn": "腰围没问题但裤子太长了。裤脚堆在下面了。"
      },
      {
        "speaker": "Staff",
        "en": "We can hem those for free with the suit purchase. Now, let's look at shirts. This slim fit white shirt would look sharp with the navy suit.",
        "cn": "买西装免费改裤脚。现在来看衬衫吧。这件修身白衬衫配藏青西装会很好看。"
      },
      {
        "speaker": "You",
        "en": "I like it. The collar isn't too tight. What about a tie?",
        "cn": "我喜欢。领口不太紧。领带呢？"
      },
      {
        "speaker": "Staff",
        "en": "For a finance interview, I'd go with a solid burgundy or a subtle striped tie. Nothing too flashy. Here are a couple options.",
        "cn": "金融公司面试的话，我建议酒红色纯色或细条纹领带。别太花哨。这里有几个选择。"
      },
      {
        "speaker": "You",
        "en": "I like this burgundy one. It's simple but elegant. I have dress shoes already, but I still need a belt.",
        "cn": "我喜欢这条酒红色的。简约又优雅。正装鞋我有了，但还需要一条皮带。"
      },
      {
        "speaker": "Staff",
        "en": "A black leather belt would complete the look perfectly. Let me grab one for you.",
        "cn": "一条黑色皮带就能完美搭配了。我给你拿一条。"
      },
      {
        "speaker": "Staff",
        "en": "Absolutely! Here's a classic black leather belt for thirty-five dollars. Your total is four twenty-four before tax. Want me to ring everything up?",
        "cn": "当然！这是一条经典黑色皮带三十五美元。税前总价四百二十四。要我结账吗？"
      },
      {
        "speaker": "You",
        "en": "Yes please! And when will the pants hemming be ready?",
        "cn": "好的！裤子改好什么时候能取？"
      }
    ]
  },
  {
    "id": "shopping-return-1",
    "cat": "shopping",
    "catName": "商场购物",
    "catEmoji": "🛍️",
    "title": "Returning an Item",
    "titleCn": "退货",
    "emoji": "🔄",
    "lines": [
      {
        "speaker": "You",
        "en": "Hi, I'd like to return this jacket. I bought it last weekend but it doesn't fit right.",
        "cn": "你好，我想退这件夹克。上周末买的，但不太合身。"
      },
      {
        "speaker": "Staff",
        "en": "Sure, I can help with that. Do you have the receipt?",
        "cn": "好的，我可以帮你。你有收据吗？"
      },
      {
        "speaker": "You",
        "en": "Yes, here it is. And I have the original tags still attached. I only tried it on once at home.",
        "cn": "有，给你。原来的标签还在。我只在家里试穿了一次。"
      },
      {
        "speaker": "Staff",
        "en": "Perfect. With the receipt and tags, this should be a straightforward return. Let me look up the transaction... I see it here. Ninety-eight dollars on your Visa card.",
        "cn": "很好。有收据和标签，这个退货应该很简单。让我查一下交易记录……找到了。Visa卡消费九十八美元。"
      },
      {
        "speaker": "You",
        "en": "That's right. Will the refund go back to my Visa card?",
        "cn": "没错。退款会退到我的Visa卡吗？"
      },
      {
        "speaker": "Staff",
        "en": "Yes, it'll go back to the original payment method. It usually takes three to five business days to show up on your statement.",
        "cn": "是的，会退到原来的支付方式。通常三到五个工作日会在你的账单上显示。"
      },
      {
        "speaker": "You",
        "en": "Okay, that's fine. Is there anything else I need to do?",
        "cn": "好的，没问题。我还需要做什么吗？"
      },
      {
        "speaker": "Staff",
        "en": "Let me just verify the jacket is in its original condition... Looks good. I'll process the return now. May I ask what was wrong with the fit?",
        "cn": "让我确认一下夹克是否保持原样……看起来没问题。我现在处理退货。能问一下哪里不合身吗？"
      },
      {
        "speaker": "You",
        "en": "The sleeves were too short. I liked everything else about it. Do you have a larger size?",
        "cn": "袖子太短了。其他方面我都喜欢。有大一号的吗？"
      },
      {
        "speaker": "Staff",
        "en": "We might! Would you like to exchange it instead of returning it? Let me check if we have the next size up.",
        "cn": "可能有！你想换一件而不是退吗？让我查查有没有大一号的。"
      },
      {
        "speaker": "You",
        "en": "Actually, an exchange would be even better. I really did like the jacket otherwise.",
        "cn": "其实换一件更好。除了袖子我真的很喜欢这件。"
      },
      {
        "speaker": "Staff",
        "en": "Let me check our inventory... Good news! We have one left in a large. Want to try it on?",
        "cn": "让我查查库存……好消息！大号还剩一件。要试试吗？"
      },
      {
        "speaker": "You",
        "en": "Yes please! I'll go to the fitting room.",
        "cn": "好的！我去试衣间。"
      },
      {
        "speaker": "Staff",
        "en": "Take your time. The fitting rooms are right around the corner on the left.",
        "cn": "慢慢来。试衣间就在左手边拐角处。"
      },
      {
        "speaker": "You",
        "en": "Okay, I tried it on. This one fits much better! The sleeves are the right length now. Can we do the exchange?",
        "cn": "好了，我试过了。这件合身多了！袖子长度现在正好。可以换吗？"
      },
      {
        "speaker": "Staff",
        "en": "Great! The large is the same price, so it's an even exchange. I'll process the return of the medium and ring up the large. No additional charge.",
        "cn": "太好了！大号价格一样，所以是等价换。我处理退中号的，然后录入大号的。不需要额外付费。"
      },
      {
        "speaker": "You",
        "en": "That's convenient. So I don't need to pay again or anything?",
        "cn": "真方便。所以我不用再付一次款什么的？"
      },
      {
        "speaker": "Staff",
        "en": "Nope! It's a simple swap. I'll just give you a new receipt for the exchange. Keep it in case you need to return or exchange again.",
        "cn": "不用！就是简单换一下。我给你一张新的换货收据。留好以防需要再退换。"
      },
      {
        "speaker": "You",
        "en": "Perfect. What's the return policy window, just in case?",
        "cn": "好的。退货期限是多久，以防万一？"
      },
      {
        "speaker": "Staff",
        "en": "You have thirty days from the purchase date for a full refund with receipt. After thirty days, we can offer store credit. Here's your new receipt. Enjoy the jacket!",
        "cn": "购买日期起三十天内凭收据可全额退款。三十天后可以给商店积分。这是你的新收据。好好穿这件夹克吧！"
      }
    ]
  },
  {
    "id": "shopping-mall-1",
    "cat": "shopping",
    "catName": "商场购物",
    "catEmoji": "🛍️",
    "title": "Asking for Directions in a Mall",
    "titleCn": "商场里问路",
    "emoji": "🗺️",
    "lines": [
      {
        "speaker": "You",
        "en": "Excuse me, could you tell me where the Apple Store is? This mall is huge and I'm totally lost.",
        "cn": "打扰一下，能告诉我苹果店在哪吗？这个商场太大了，我完全迷路了。"
      },
      {
        "speaker": "Staff",
        "en": "Sure! You're on the first floor right now. The Apple Store is on the second floor, east wing. Take those escalators up and turn right.",
        "cn": "当然！你现在在一楼。苹果店在二楼东翼。坐那个扶梯上去然后右转。"
      },
      {
        "speaker": "You",
        "en": "East wing? How do I know which direction is east?",
        "cn": "东翼？我怎么知道哪个方向是东？"
      },
      {
        "speaker": "Staff",
        "en": "Ha, don't worry about compass directions! When you get off the escalator, turn right. Walk past Macy's and the food court. You'll see the Apple Store on your left.",
        "cn": "哈，不用管指南针方向！上了扶梯后右转。经过梅西百货和美食广场。你会在左手边看到苹果店。"
      },
      {
        "speaker": "You",
        "en": "Okay, right after the escalator, then past Macy's and the food court. Got it. About how far is it?",
        "cn": "好的，扶梯上去后右转，经过梅西和美食广场。明白了。大概多远？"
      },
      {
        "speaker": "Staff",
        "en": "It's about a five-minute walk. You can't miss it — they have that big glowing Apple logo on the front.",
        "cn": "大约走五分钟。你不会错过的——前面有个大大的发光苹果标志。"
      },
      {
        "speaker": "You",
        "en": "Great, thanks! Oh, while I'm here, where's the nearest restroom?",
        "cn": "太好了，谢谢！哦，顺便问一下，最近的卫生间在哪？"
      },
      {
        "speaker": "Staff",
        "en": "There's one right down this hallway, past the elevators on the left. Can't miss it — look for the signs overhead.",
        "cn": "沿着这个走廊走，过了左边的电梯就到了。不会错过的——抬头看标识牌。"
      },
      {
        "speaker": "You",
        "en": "Perfect. And is there a directory map somewhere? I feel like I need a GPS in here.",
        "cn": "好的。有商场导览图吗？我觉得在这里面需要一个GPS。"
      },
      {
        "speaker": "Staff",
        "en": "Ha! There are directory boards near each major entrance and by the elevators. You can also download our mall app — it has an interactive map.",
        "cn": "哈！每个主要入口和电梯旁边都有导览板。你也可以下载我们商场的App——有交互地图。"
      },
      {
        "speaker": "You",
        "en": "An app? That's pretty handy. Does it show store hours too?",
        "cn": "App？那挺方便的。上面也显示店铺营业时间吗？"
      },
      {
        "speaker": "Staff",
        "en": "Yes! Store hours, sales, events — it has everything. It can even help you find your parked car if you forget where it is.",
        "cn": "是的！营业时间、促销、活动——什么都有。如果你忘了车停哪里，它甚至能帮你找到。"
      },
      {
        "speaker": "You",
        "en": "That parking feature would actually be really useful. This parking garage is confusing.",
        "cn": "找车的功能确实很实用。这个停车场太复杂了。"
      },
      {
        "speaker": "Staff",
        "en": "Tell me about it! Just make sure to save your parking spot in the app before you come inside. A lot of people forget that part.",
        "cn": "可不是嘛！进商场之前记得在App里保存停车位置。很多人都忘了这一步。"
      },
      {
        "speaker": "You",
        "en": "Good tip. One more question — my wife wants to check out some clothing stores. Where should she go?",
        "cn": "好建议。再问一个——我太太想逛几家服装店。她应该去哪里？"
      },
      {
        "speaker": "Staff",
        "en": "The west wing on this floor has most of our women's clothing stores — H&M, Zara, Nordstrom. Just head in the opposite direction from the escalators.",
        "cn": "一楼的西翼有大部分女装店——H&M、Zara、Nordstrom。朝扶梯的反方向走就行。"
      },
      {
        "speaker": "You",
        "en": "Awesome. Is there a place where we could meet up later? Like a central spot?",
        "cn": "太好了。有没有我们之后可以碰头的地方？比如一个中心位置？"
      },
      {
        "speaker": "Staff",
        "en": "The food court on the second floor is the best meeting spot. It's right in the center of the mall and easy to find from either wing.",
        "cn": "二楼的美食广场是最好的碰头点。在商场正中央，从哪个方向都容易找到。"
      },
      {
        "speaker": "You",
        "en": "We'll meet there at three o'clock then. Thank you so much for all your help!",
        "cn": "那我们三点在那碰头。非常感谢你的帮助！"
      },
      {
        "speaker": "Staff",
        "en": "You're very welcome! Enjoy your time at the mall. If you need anything else, there are info desks near every major entrance.",
        "cn": "不客气！祝你在商场玩得开心。如果还需要什么，每个主要入口附近都有咨询台。"
      }
    ]
  },
  {
    "id": "movie-theater-1",
    "cat": "movie",
    "catName": "看电影",
    "catEmoji": "🎬",
    "title": "Buying Movie Tickets",
    "titleCn": "买电影票",
    "emoji": "🎬",
    "lines": [
      {
        "speaker": "You",
        "en": "Hey, two tickets for the 7:30 showing of that new horror movie, please.",
        "cn": "嘿，请给我两张七点半那场新恐怖片的票。"
      },
      {
        "speaker": "Cashier",
        "en": "Sure thing! Would you like standard or IMAX?",
        "cn": "没问题！您要普通场还是IMAX？"
      },
      {
        "speaker": "You",
        "en": "Hmm, how much more is IMAX?",
        "cn": "嗯，IMAX贵多少？"
      },
      {
        "speaker": "Cashier",
        "en": "It's an extra five bucks per ticket, so twenty-six total instead of sixteen.",
        "cn": "每张票多五块，一共二十六而不是十六。"
      },
      {
        "speaker": "You",
        "en": "Yeah, let's go IMAX. Might as well get the full experience, right?",
        "cn": "行，就IMAX吧。既然来了就要看最好的，对吧？"
      },
      {
        "speaker": "Cashier",
        "en": "Totally! Great choice. Any seat preference?",
        "cn": "完全同意！很好的选择。有座位偏好吗？"
      },
      {
        "speaker": "You",
        "en": "Somewhere in the middle if possible. Not too close to the screen.",
        "cn": "尽量坐中间吧。别离屏幕太近。"
      },
      {
        "speaker": "Cashier",
        "en": "How about row J, seats 8 and 9? Right in the sweet spot.",
        "cn": "J排8号和9号怎么样？正好在最佳位置。"
      },
      {
        "speaker": "You",
        "en": "Perfect, that works. Can I pay with Apple Pay?",
        "cn": "太好了，就这个。能用Apple Pay吗？"
      },
      {
        "speaker": "Cashier",
        "en": "Absolutely, just tap right here on the reader.",
        "cn": "当然可以，在这个读卡器上碰一下就行。"
      },
      {
        "speaker": "You",
        "en": "Cool, done. Do we get actual paper tickets or is it all digital now?",
        "cn": "好了，搞定。我们会拿到纸质票还是现在全是电子的了？"
      },
      {
        "speaker": "Cashier",
        "en": "I can print them out or send them to your email. What do you prefer?",
        "cn": "我可以打印出来或者发到您邮箱。您喜欢哪种？"
      },
      {
        "speaker": "You",
        "en": "Just print 'em, I always lose stuff in my email.",
        "cn": "打印吧，我邮箱里的东西总找不到。"
      },
      {
        "speaker": "Cashier",
        "en": "Ha, I feel that. Here you go, two tickets. Theater 6, down the hall to your left.",
        "cn": "哈，我懂。给您，两张票。6号厅，沿走廊往左走。"
      },
      {
        "speaker": "You",
        "en": "Thanks! Oh wait, what time do they start letting people in?",
        "cn": "谢谢！哦等等，什么时候开始检票入场？"
      },
      {
        "speaker": "Cashier",
        "en": "Usually about fifteen minutes before showtime, so around 7:15.",
        "cn": "一般是开场前十五分钟，大概七点一刻。"
      },
      {
        "speaker": "You",
        "en": "Got it. Is there still time to grab some snacks?",
        "cn": "明白了。还来得及买点零食吗？"
      },
      {
        "speaker": "Cashier",
        "en": "Oh yeah, for sure. The concession stand is right over there. You've got plenty of time.",
        "cn": "完全来得及。小吃柜台就在那边。时间很充裕。"
      },
      {
        "speaker": "You",
        "en": "Awesome, thanks a lot! You've been super helpful.",
        "cn": "太好了，非常感谢！你帮了大忙。"
      },
      {
        "speaker": "Cashier",
        "en": "No problem! Enjoy the movie. Fair warning though, I heard it's really scary!",
        "cn": "不客气！观影愉快。不过提醒一下，我听说特别吓人！"
      }
    ]
  },
  {
    "id": "movie-theater-2",
    "cat": "movie",
    "catName": "看电影",
    "catEmoji": "🎬",
    "title": "Choosing Snacks at Concession Stand",
    "titleCn": "买爆米花零食",
    "emoji": "🍿",
    "lines": [
      {
        "speaker": "You",
        "en": "Hey, can I get a large popcorn and... hmm, what drinks do you have?",
        "cn": "嘿，给我一个大桶爆米花，还有……嗯，你们有什么饮料？"
      },
      {
        "speaker": "Cashier",
        "en": "We've got Coke, Sprite, Dr Pepper, lemonade, and iced tea.",
        "cn": "我们有可乐、雪碧、胡椒博士、柠檬水和冰茶。"
      },
      {
        "speaker": "You",
        "en": "I'll do a medium Coke. Actually wait, is there a combo deal or something?",
        "cn": "来个中杯可乐。等等，有套餐优惠什么的吗？"
      },
      {
        "speaker": "Cashier",
        "en": "Yeah! The movie munch combo is a large popcorn, two medium drinks, and a candy for eighteen bucks.",
        "cn": "有的！电影零食套餐包含一大桶爆米花、两杯中饮料和一份糖果，十八块。"
      },
      {
        "speaker": "You",
        "en": "Oh nice, that's way better. Let's go with that. Two Cokes for the drinks.",
        "cn": "哦不错，那划算多了。就要这个吧。饮料都要可乐。"
      },
      {
        "speaker": "Cashier",
        "en": "And which candy would you like? We've got M&Ms, Sour Patch Kids, Reese's...",
        "cn": "糖果您要哪种？我们有M&M巧克力豆、酸味软糖、Reese's花生酱杯……"
      },
      {
        "speaker": "You",
        "en": "Ooh, tough call. Let me go with the Sour Patch Kids. My friend loves those.",
        "cn": "哦，好难选。来个酸味软糖吧。我朋友超爱吃这个。"
      },
      {
        "speaker": "Cashier",
        "en": "Good pick! Would you like butter on the popcorn?",
        "cn": "选得好！爆米花要加黄油吗？"
      },
      {
        "speaker": "You",
        "en": "Duh, of course! Extra butter if you can. I know it's bad for me but whatever.",
        "cn": "那当然！能多加就多加。我知道不健康但管不了那么多。"
      },
      {
        "speaker": "Cashier",
        "en": "Ha, no judgment here! I'll load it up for you.",
        "cn": "哈，我绝不评判！给你多加点。"
      },
      {
        "speaker": "You",
        "en": "You're the best. Oh, can I also add some nachos? How much are those?",
        "cn": "你太好了。哦，能再加份玉米片吗？多少钱？"
      },
      {
        "speaker": "Cashier",
        "en": "The nachos with cheese are six fifty. Want jalapeños on them?",
        "cn": "芝士玉米片六块五。要加墨西哥辣椒吗？"
      },
      {
        "speaker": "You",
        "en": "Yes please, pile 'em on! I like it spicy.",
        "cn": "要的，多放点！我喜欢吃辣。"
      },
      {
        "speaker": "Cashier",
        "en": "Alright, so that's the combo plus nachos. Your total comes to twenty-four fifty.",
        "cn": "好的，套餐加玉米片。总共二十四块五。"
      },
      {
        "speaker": "You",
        "en": "Geez, movie snacks are kinda pricey, huh? But okay, here's my card.",
        "cn": "天哪，电影院零食真不便宜啊。算了，给你我的卡。"
      },
      {
        "speaker": "Cashier",
        "en": "Ha, yeah, that's the movie theater tax. Alright, you're all set!",
        "cn": "哈，是啊，这就是电影院的\"税\"。好了，搞定了！"
      },
      {
        "speaker": "You",
        "en": "How am I supposed to carry all this? I only have two hands!",
        "cn": "我怎么拿这么多东西？我只有两只手啊！"
      },
      {
        "speaker": "Cashier",
        "en": "Here, let me put everything in a carrier tray for you. That should help.",
        "cn": "来，我给你放到一个托盘里吧。这样方便些。"
      },
      {
        "speaker": "You",
        "en": "Oh lifesaver, thanks! This is like a whole feast, honestly.",
        "cn": "哦太救命了，谢谢！说真的，这简直是一顿大餐。"
      },
      {
        "speaker": "Cashier",
        "en": "Enjoy the movie! And pro tip: the popcorn refill is only two bucks if you come back.",
        "cn": "观影愉快！小窍门：爆米花续杯回来只要两块钱。"
      }
    ]
  },
  {
    "id": "movie-theater-3",
    "cat": "movie",
    "catName": "看电影",
    "catEmoji": "🎬",
    "title": "Discussing a Movie After Watching",
    "titleCn": "看完电影讨论",
    "emoji": "💬",
    "lines": [
      {
        "speaker": "You",
        "en": "Oh my God, that was insane! I did NOT see that ending coming.",
        "cn": "天哪，太疯狂了！我完全没料到那个结局。"
      },
      {
        "speaker": "Friend",
        "en": "Right?! When the main character turned out to be the villain the whole time? My jaw dropped.",
        "cn": "对吧？！当主角原来从头到尾都是反派的时候？我下巴都掉了。"
      },
      {
        "speaker": "You",
        "en": "Dude, the clues were there all along but I totally missed them.",
        "cn": "兄弟，线索一直都在但我完全没注意到。"
      },
      {
        "speaker": "Friend",
        "en": "Same! I wanna watch it again just to catch all the foreshadowing.",
        "cn": "我也是！我想再看一遍，专门找那些伏笔。"
      },
      {
        "speaker": "You",
        "en": "The acting was phenomenal too. She really killed it in that breakdown scene.",
        "cn": "演技也太棒了。她在那场崩溃戏里演得太好了。"
      },
      {
        "speaker": "Friend",
        "en": "Oh for real, that was Oscar-worthy. I literally got chills.",
        "cn": "真的，那完全是奥斯卡级别的。我真的起了鸡皮疙瘩。"
      },
      {
        "speaker": "You",
        "en": "And the soundtrack? Chef's kiss. It made everything so much more intense.",
        "cn": "还有配乐？绝了。把所有场景都烘托得更紧张了。"
      },
      {
        "speaker": "Friend",
        "en": "Yeah, especially during that chase scene through the warehouse. My heart was pounding.",
        "cn": "是啊，尤其是仓库追逐那场戏。我心脏都快跳出来了。"
      },
      {
        "speaker": "You",
        "en": "I gotta say though, the middle part dragged a little. Like, the romance subplot felt kinda forced.",
        "cn": "不过说实话，中间部分有点拖。感情支线感觉有点生硬。"
      },
      {
        "speaker": "Friend",
        "en": "Hmm, I actually didn't mind that part. I thought it added depth to the character.",
        "cn": "嗯，我倒觉得那段还行。我觉得增加了角色的深度。"
      },
      {
        "speaker": "You",
        "en": "Fair enough. Different strokes, I guess. What would you rate it overall?",
        "cn": "也对。各有各的看法吧。你给总体打几分？"
      },
      {
        "speaker": "Friend",
        "en": "I'd give it a solid 8.5 out of 10. It's one of the best thrillers I've seen this year.",
        "cn": "我给8.5分吧。这是我今年看过最好的惊悚片之一。"
      },
      {
        "speaker": "You",
        "en": "That's generous! I'd say maybe an 8. Knock off half a point for that slow middle section.",
        "cn": "你给得挺高的！我可能给8分。中间拖沓的部分扣半分。"
      },
      {
        "speaker": "Friend",
        "en": "That's fair. Hey, should we grab dinner and keep talking about it?",
        "cn": "也合理。嘿，咱们去吃个饭接着聊？"
      },
      {
        "speaker": "You",
        "en": "Yeah, I'm starving. That popcorn did NOT fill me up.",
        "cn": "好啊，我饿死了。那爆米花根本没吃饱。"
      },
      {
        "speaker": "Friend",
        "en": "Ha, same. Wanna hit that ramen place across the street?",
        "cn": "哈，我也是。想去街对面那家拉面店吗？"
      },
      {
        "speaker": "You",
        "en": "Oh absolutely, I could crush a bowl of ramen right now.",
        "cn": "当然了，我现在能干掉一大碗拉面。"
      },
      {
        "speaker": "Friend",
        "en": "Bet. Let's go before it gets too crowded. It's Friday night after all.",
        "cn": "走起。赶在人多之前去吧。毕竟是周五晚上。"
      },
      {
        "speaker": "You",
        "en": "Good call. Oh, and no spoilers on social media! Some of our friends haven't seen it yet.",
        "cn": "说得对。哦对了，别在社交媒体上剧透！咱们有些朋友还没看呢。"
      },
      {
        "speaker": "Friend",
        "en": "Ha, don't worry, I'm not a monster. My lips are sealed until everyone's watched it.",
        "cn": "哈，放心，我没那么缺德。等所有人都看了我再说。"
      }
    ]
  },
  {
    "id": "movie-theater-4",
    "cat": "movie",
    "catName": "看电影",
    "catEmoji": "🎬",
    "title": "Movie Date Night Planning",
    "titleCn": "计划看电影约会",
    "emoji": "💑",
    "lines": [
      {
        "speaker": "You",
        "en": "Hey babe, wanna catch a movie tonight? I feel like we haven't been out in forever.",
        "cn": "亲爱的，今晚想去看电影吗？感觉我们好久没出去了。"
      },
      {
        "speaker": "Partner",
        "en": "Ooh yes, I'd love that! What's playing right now?",
        "cn": "哦好啊，我很想去！现在有什么电影？"
      },
      {
        "speaker": "You",
        "en": "Let me check... okay, there's a new rom-com, an action movie, and that sci-fi one everyone's been talking about.",
        "cn": "我查一下……好，有一部新的爱情喜剧，一部动作片，还有那部大家都在讨论的科幻片。"
      },
      {
        "speaker": "Partner",
        "en": "Hmm, I'm kinda in the mood for the rom-com. But I know that's not really your thing.",
        "cn": "嗯，我有点想看爱情喜剧。但我知道你不太喜欢那类的。"
      },
      {
        "speaker": "You",
        "en": "Honestly, I don't mind! The reviews are actually pretty solid. Plus, it's date night, your pick.",
        "cn": "说实话，我不介意！评价其实挺好的。而且，今晚是约会夜，你来选。"
      },
      {
        "speaker": "Partner",
        "en": "Aw, you're sweet. Let's do the rom-com then! What time works?",
        "cn": "你真贴心。那就看爱情喜剧吧！几点方便？"
      },
      {
        "speaker": "You",
        "en": "There's a 7:15 and a 9:30. The earlier one gives us time for dinner after.",
        "cn": "有七点一刻和九点半的。看早那场的话看完还能去吃饭。"
      },
      {
        "speaker": "Partner",
        "en": "Oh, dinner and a movie? Now you're really going all out. Let's do the 7:15.",
        "cn": "又看电影又吃饭？你今天真下了血本。那就七点一刻的。"
      },
      {
        "speaker": "You",
        "en": "Done! I just booked two seats online. Center row, pretty good spots.",
        "cn": "搞定！我刚在网上订了两个座位。中间排，位置不错。"
      },
      {
        "speaker": "Partner",
        "en": "Yay! Should I dress up a little? Like, what's the vibe?",
        "cn": "太好了！我需要稍微打扮一下吗？是什么风格？"
      },
      {
        "speaker": "You",
        "en": "I mean, it's just the movies, but if you wanna get cute, go for it. I'll clean up a bit too.",
        "cn": "只是看电影而已，但你想打扮漂亮的话尽管来。我也稍微收拾一下。"
      },
      {
        "speaker": "Partner",
        "en": "Ha, \"clean up a bit.\" That means you'll put on a non-wrinkled shirt, right?",
        "cn": "哈，\"稍微收拾一下\"。就是说你会穿一件没有褶子的衬衫，对吧？"
      },
      {
        "speaker": "You",
        "en": "Hey! I can be fancy when I want to. I might even iron it.",
        "cn": "嘿！我想帅的时候也可以很帅的。我可能还会熨一下。"
      },
      {
        "speaker": "Partner",
        "en": "Wow, breaking out the iron? This IS a special occasion. Where should we eat after?",
        "cn": "哇，都要用熨斗了？这还真是特殊场合。看完去哪吃？"
      },
      {
        "speaker": "You",
        "en": "How about that Italian place you've been wanting to try? The one on Main Street.",
        "cn": "去你一直想试的那家意大利餐厅怎么样？主街上那家。"
      },
      {
        "speaker": "Partner",
        "en": "Oh yes, I've been dying to go there! They supposedly have amazing pasta.",
        "cn": "太好了，我一直想去那里！听说他们的意面特别好吃。"
      },
      {
        "speaker": "You",
        "en": "Cool, I'll make a reservation for around 9:30 then. Movie plus dinner, boom.",
        "cn": "好，那我预订九点半的位子。看电影加吃饭，完美。"
      },
      {
        "speaker": "Partner",
        "en": "This is gonna be the best date night ever. You're scoring major points right now.",
        "cn": "这会是最棒的约会之夜。你现在得分超高。"
      },
      {
        "speaker": "You",
        "en": "Ha, I'll take those points! Alright, start getting ready. I'll pick you up at 6:45.",
        "cn": "哈，我收下这些分数！好了，开始准备吧。我六点四十五来接你。"
      },
      {
        "speaker": "Partner",
        "en": "Can't wait! Oh, and you better not fall asleep during the movie like last time!",
        "cn": "等不及了！哦对了，你最好别像上次那样看电影看睡着了！"
      }
    ]
  },
  {
    "id": "movie-theater-5",
    "cat": "movie",
    "catName": "看电影",
    "catEmoji": "🎬",
    "title": "Reviewing a New Marvel Movie",
    "titleCn": "评价新漫威电影",
    "emoji": "🦸",
    "lines": [
      {
        "speaker": "You",
        "en": "Okay, be honest. What did you think of the new Marvel movie?",
        "cn": "说实话，你觉得新漫威电影怎么样？"
      },
      {
        "speaker": "Friend",
        "en": "Honestly? It was fine, but I feel like Marvel's kinda losing its magic lately.",
        "cn": "说实话？还行吧，但我觉得漫威最近有点走下坡路了。"
      },
      {
        "speaker": "You",
        "en": "See, I was worried you'd say that. I actually really enjoyed it though.",
        "cn": "我就猜你会这么说。不过我其实挺喜欢的。"
      },
      {
        "speaker": "Friend",
        "en": "Don't get me wrong, the action sequences were awesome. That fight on the bridge? Insane.",
        "cn": "别误会，动作场面很棒。桥上那场打斗？太炸了。"
      },
      {
        "speaker": "You",
        "en": "RIGHT? And the CGI was next level. You could tell they spent a fortune on the visual effects.",
        "cn": "对吧？而且特效是顶级的。看得出来他们花了巨资做视觉效果。"
      },
      {
        "speaker": "Friend",
        "en": "True, it looked incredible. But the story felt so predictable. Like, we all knew the hero was gonna win.",
        "cn": "没错，画面确实很震撼。但剧情太可预测了。大家都知道英雄最终会赢。"
      },
      {
        "speaker": "You",
        "en": "I mean, that's kind of every superhero movie though, isn't it?",
        "cn": "但每部超级英雄电影不都是这样吗？"
      },
      {
        "speaker": "Friend",
        "en": "Yeah, but some of the older ones at least had real stakes. Remember when they actually surprised us?",
        "cn": "是啊，但以前有些片子至少有真正的紧张感。还记得他们真的让我们吃惊的时候吗？"
      },
      {
        "speaker": "You",
        "en": "Fair point. The villain was pretty weak too, now that I think about it. Kinda forgettable.",
        "cn": "有道理。现在想想反派也挺弱的。有点没存在感。"
      },
      {
        "speaker": "Friend",
        "en": "Exactly! Like, what was his motivation again? World domination? So original.",
        "cn": "就是！他的动机是啥来着？统治世界？真有创意。"
      },
      {
        "speaker": "You",
        "en": "Ha, okay, you're not wrong about that. But the humor was on point, at least.",
        "cn": "哈，好吧，这点你说得没错。但至少笑点很到位。"
      },
      {
        "speaker": "Friend",
        "en": "Some of the jokes landed, but a few felt forced. Like they were trying too hard to be funny.",
        "cn": "有些笑话确实好笑，但有几个感觉很刻意。像是太使劲想搞笑了。"
      },
      {
        "speaker": "You",
        "en": "Hmm, I guess I can see that. Did you stay for the post-credits scene though?",
        "cn": "嗯，我能理解。你留下来看片尾彩蛋了吗？"
      },
      {
        "speaker": "Friend",
        "en": "Obviously! That tease at the end has me hyped for the next one, not gonna lie.",
        "cn": "那当然！结尾那个预告不得不说让我对下一部很期待。"
      },
      {
        "speaker": "You",
        "en": "Same here! That cameo was wild. The whole theater went nuts.",
        "cn": "我也是！那个客串太惊喜了。整个影厅都炸了。"
      },
      {
        "speaker": "Friend",
        "en": "Okay yeah, THAT part was peak Marvel. If the next movie delivers on that setup, I'm back in.",
        "cn": "好吧，那部分确实是漫威巅峰。如果下一部能兑现那个铺垫，我就继续追。"
      },
      {
        "speaker": "You",
        "en": "So overall, what would you rate it? I'd give it like a 7.",
        "cn": "所以总体你打几分？我给7分左右。"
      },
      {
        "speaker": "Friend",
        "en": "I'd say a 6.5. Solid popcorn entertainment but nothing groundbreaking.",
        "cn": "我给6.5。合格的爆米花电影，但没什么突破。"
      },
      {
        "speaker": "You",
        "en": "That's fair. It's not their best, but I'd still watch it again, honestly.",
        "cn": "也合理。不是他们最好的，但说实话我还会再看一遍。"
      },
      {
        "speaker": "Friend",
        "en": "You know what, me too. Sometimes you just wanna turn your brain off and enjoy the ride.",
        "cn": "你知道吗，我也会。有时候就想放空大脑享受过程。"
      }
    ]
  },
  {
    "id": "traffic-accident-1",
    "cat": "traffic",
    "catName": "交通事故",
    "catEmoji": "🚗",
    "title": "Minor Fender Bender",
    "titleCn": "轻微追尾",
    "emoji": "🚗",
    "lines": [
      {
        "speaker": "You",
        "en": "Oh no, I'm so sorry! Are you okay? I didn't see you stopping.",
        "cn": "天哪，太对不起了！你没事吧？我没看到你停车。"
      },
      {
        "speaker": "Other Driver",
        "en": "Yeah, I'm fine, just a little shaken up. What happened? Weren't you paying attention?",
        "cn": "嗯，我没事，就是吓了一跳。怎么回事？你没注意看路吗？"
      },
      {
        "speaker": "You",
        "en": "I know, I know. I looked down at my GPS for like one second. This is totally my fault.",
        "cn": "我知道，我知道。我就看了一眼导航。这完全是我的错。"
      },
      {
        "speaker": "Other Driver",
        "en": "Let's pull over to the side so we're not blocking traffic. Can you move your car?",
        "cn": "我们靠边停吧，别挡着交通。你能挪一下车吗？"
      },
      {
        "speaker": "You",
        "en": "Yeah, yeah, let me pull into that parking lot right there. You follow me.",
        "cn": "行行，我开到那个停车场。你跟着我。"
      },
      {
        "speaker": "Other Driver",
        "en": "Okay. Let me take a look at the damage first... alright, it's mostly just the bumper.",
        "cn": "好。我先看看损坏情况……好吧，主要就是保险杠。"
      },
      {
        "speaker": "You",
        "en": "Oh thank God, it doesn't look too bad. There's a dent and some paint scratches.",
        "cn": "谢天谢地，看起来不太严重。有个凹痕和一些划痕。"
      },
      {
        "speaker": "Other Driver",
        "en": "Yeah, my car's got a cracked tail light too though. See that?",
        "cn": "是的，但我的车尾灯也裂了。看到了吗？"
      },
      {
        "speaker": "You",
        "en": "Oh shoot, I see it. I'm really sorry about that. Do you want to call the police or just exchange info?",
        "cn": "哎呀，看到了。真的很抱歉。你想报警还是直接交换信息？"
      },
      {
        "speaker": "Other Driver",
        "en": "For something this minor, let's just exchange insurance info. No need for a whole police report.",
        "cn": "这么小的事，咱们交换保险信息就行了。没必要弄警察报告。"
      },
      {
        "speaker": "You",
        "en": "Sounds good. Let me grab my insurance card from the glove compartment real quick.",
        "cn": "好的。我去副驾储物箱拿一下保险卡。"
      },
      {
        "speaker": "Other Driver",
        "en": "Should we take some photos of the damage too? Just to have on record.",
        "cn": "我们也拍几张损坏照片吧？留个记录。"
      },
      {
        "speaker": "You",
        "en": "Great idea. I'll get pictures of both cars from different angles.",
        "cn": "好主意。我从不同角度两辆车都拍一下。"
      },
      {
        "speaker": "Other Driver",
        "en": "Make sure you get a shot of my license plate and the tail light damage.",
        "cn": "记得拍我的车牌和尾灯损坏的照片。"
      },
      {
        "speaker": "You",
        "en": "Got it. Here, this is my insurance info and my driver's license. Wanna take a picture?",
        "cn": "拍好了。给，这是我的保险信息和驾照。你拍个照？"
      },
      {
        "speaker": "Other Driver",
        "en": "Yeah, let me snap a photo of those. And here's mine. My number is on there too.",
        "cn": "好，我拍一下。这是我的。上面也有我的电话号码。"
      },
      {
        "speaker": "You",
        "en": "Thanks for being so cool about this. I feel terrible about the whole thing.",
        "cn": "谢谢你这么通情达理。我对这件事真的很愧疚。"
      },
      {
        "speaker": "Other Driver",
        "en": "Accidents happen, don't beat yourself up. At least nobody got hurt.",
        "cn": "事故总会发生的，别太自责。至少没人受伤。"
      },
      {
        "speaker": "You",
        "en": "You're right. I'll call my insurance first thing tomorrow and get this sorted out.",
        "cn": "你说得对。我明天第一时间打给保险公司把这事处理好。"
      },
      {
        "speaker": "Other Driver",
        "en": "Sounds good. Drive safe, and maybe keep your eyes off the GPS next time, okay?",
        "cn": "好的。开车注意安全，下次别再看导航了，行吗？"
      }
    ]
  },
  {
    "id": "traffic-accident-2",
    "cat": "traffic",
    "catName": "交通事故",
    "catEmoji": "🚗",
    "title": "Exchanging Insurance Information",
    "titleCn": "交换保险信息",
    "emoji": "📋",
    "lines": [
      {
        "speaker": "You",
        "en": "Alright, so let's swap insurance info. Do you have your card on you?",
        "cn": "好，咱们交换一下保险信息。你带保险卡了吗？"
      },
      {
        "speaker": "Other Driver",
        "en": "Yeah, hold on, let me find it. I think it's in my wallet... here we go.",
        "cn": "有，等一下，我找找。应该在钱包里……找到了。"
      },
      {
        "speaker": "You",
        "en": "Thanks. So you're with State Farm? Okay, let me write down your policy number.",
        "cn": "谢谢。你用的是State Farm？好，让我记下你的保单号。"
      },
      {
        "speaker": "Other Driver",
        "en": "It's right there at the top. And what insurance do you have?",
        "cn": "就在最上面。你用的什么保险？"
      },
      {
        "speaker": "You",
        "en": "I've got Progressive. Here's my card. The policy number is that long one in the middle.",
        "cn": "我用的Progressive。给你我的卡。保单号是中间那个长串数字。"
      },
      {
        "speaker": "Other Driver",
        "en": "Got it. Can I also get your phone number in case my insurance company needs to reach you?",
        "cn": "记下了。能给我你的电话号码吗？万一我的保险公司需要联系你。"
      },
      {
        "speaker": "You",
        "en": "Sure, it's 555-0147. And can I get yours too?",
        "cn": "好的，是555-0147。你的号码也给我一下？"
      },
      {
        "speaker": "Other Driver",
        "en": "Mine is 555-0283. You should probably write down my license plate number too.",
        "cn": "我的是555-0283。你最好也记一下我的车牌号。"
      },
      {
        "speaker": "You",
        "en": "Oh right, good thinking. What is it? Actually, I'll just take a photo of your plate.",
        "cn": "哦对，想得周到。多少来着？算了，我直接拍你车牌照片。"
      },
      {
        "speaker": "Other Driver",
        "en": "Smart. Let me do the same for yours. And let's get each other's full names and addresses.",
        "cn": "聪明。我也拍一下你的。然后咱们交换一下全名和地址。"
      },
      {
        "speaker": "You",
        "en": "My name is Mike Chen, and I live at 425 Oak Street, Apartment 3B.",
        "cn": "我叫Mike Chen，住在橡树街425号，3B公寓。"
      },
      {
        "speaker": "Other Driver",
        "en": "I'm Sarah Johnson, 1820 Pine Avenue. Do you know which insurance company I should call first?",
        "cn": "我叫Sarah Johnson，松树大道1820号。你知道我应该先打给哪家保险公司吗？"
      },
      {
        "speaker": "You",
        "en": "Usually you call your own insurance company and they'll handle everything from their end.",
        "cn": "一般你打给自己的保险公司，他们那边会处理一切。"
      },
      {
        "speaker": "Other Driver",
        "en": "Okay, makes sense. Will your insurance cover the damage to my car since it was your fault?",
        "cn": "好的，有道理。既然是你的责任，你的保险会赔我的车损吗？"
      },
      {
        "speaker": "You",
        "en": "Yeah, my liability coverage should handle your repairs. That's how it usually works.",
        "cn": "会的，我的责任险应该能赔你的修理费。通常都是这样的。"
      },
      {
        "speaker": "Other Driver",
        "en": "Good. Should we also note down the time and location of the accident?",
        "cn": "好。我们也要记下事故的时间和地点吗？"
      },
      {
        "speaker": "You",
        "en": "Definitely. It's, uh, 3:45 PM on the corner of Main and 5th. I'll put that in my notes.",
        "cn": "必须的。现在是下午三点四十五分，在主街和第五街交叉口。我记在备忘录里。"
      },
      {
        "speaker": "Other Driver",
        "en": "Perfect. I think we've got everything. Is there anything else we should do?",
        "cn": "好。我觉得该记的都记了。还需要做什么吗？"
      },
      {
        "speaker": "You",
        "en": "I think that covers it. I'll file the claim tonight and give them your info.",
        "cn": "我觉得差不多了。我今晚就报案，把你的信息给他们。"
      },
      {
        "speaker": "Other Driver",
        "en": "Sounds like a plan. Thanks for being upfront about everything. Hope your car is okay too.",
        "cn": "好的。谢谢你这么坦诚。也希望你的车没什么大问题。"
      }
    ]
  },
  {
    "id": "traffic-accident-3",
    "cat": "traffic",
    "catName": "交通事故",
    "catEmoji": "🚗",
    "title": "Calling 911 After an Accident",
    "titleCn": "事故后打911",
    "emoji": "🚨",
    "lines": [
      {
        "speaker": "You",
        "en": "911, I need to report a car accident. It just happened like two minutes ago.",
        "cn": "911，我要报告一起车祸。大概两分钟前刚发生的。"
      },
      {
        "speaker": "Dispatcher",
        "en": "Okay, stay calm. Can you tell me your exact location?",
        "cn": "好的，请保持冷静。能告诉我您的确切位置吗？"
      },
      {
        "speaker": "You",
        "en": "I'm on Highway 101, heading north, right near the exit for Elm Street. There's a gas station on the right.",
        "cn": "我在101号公路上，往北开，就在榆树街出口附近。右边有个加油站。"
      },
      {
        "speaker": "Dispatcher",
        "en": "Got it. Is anyone injured? How many vehicles are involved?",
        "cn": "收到。有人受伤吗？有几辆车卷入？"
      },
      {
        "speaker": "You",
        "en": "Two cars. The other driver is holding his neck and saying it hurts. I think I'm okay, just my hands are shaking.",
        "cn": "两辆车。另一个司机捂着脖子说疼。我应该没事，就是手在抖。"
      },
      {
        "speaker": "Dispatcher",
        "en": "I'm sending an ambulance and police to your location right now. Don't move the injured person.",
        "cn": "我现在就派救护车和警察到您的位置。不要移动伤者。"
      },
      {
        "speaker": "You",
        "en": "Okay, I won't. Should I turn off my car's engine? There's some smoke coming from under my hood.",
        "cn": "好的，我不会的。需要关掉车的引擎吗？我的引擎盖下面有烟冒出来。"
      },
      {
        "speaker": "Dispatcher",
        "en": "Yes, turn off the engine immediately and move away from the vehicle if you can do so safely.",
        "cn": "是的，立即关掉引擎，如果安全的话远离车辆。"
      },
      {
        "speaker": "You",
        "en": "Okay, I'm out of the car now. The other driver is still in his car though. He says he's afraid to move.",
        "cn": "好，我已经出来了。另一个司机还在车里。他说不敢动。"
      },
      {
        "speaker": "Dispatcher",
        "en": "That's okay, tell him to stay put and keep still. Help is on the way. How bad is the damage?",
        "cn": "没关系，让他待着别动。救援正在路上。损坏情况严重吗？"
      },
      {
        "speaker": "You",
        "en": "Pretty bad. The front of my car is smashed in and his driver side door is dented really badly.",
        "cn": "挺严重的。我车头撞凹了，他的驾驶门严重变形。"
      },
      {
        "speaker": "Dispatcher",
        "en": "Are there any hazards? Leaking fluids, downed power lines, anything like that?",
        "cn": "有什么危险情况吗？漏油、电线倒塌之类的？"
      },
      {
        "speaker": "You",
        "en": "I can see some liquid on the ground, maybe coolant or something. It's greenish. No power lines though.",
        "cn": "我能看到地上有些液体，可能是冷却液什么的。是绿色的。没有电线。"
      },
      {
        "speaker": "Dispatcher",
        "en": "Okay, keep a safe distance from that. Are there any other passengers in either vehicle?",
        "cn": "好的，离那个远点。两辆车里还有其他乘客吗？"
      },
      {
        "speaker": "You",
        "en": "No, it's just us two. One driver each. No passengers.",
        "cn": "没有，就我们两个人。各一个司机。没有乘客。"
      },
      {
        "speaker": "Dispatcher",
        "en": "Good. The ambulance should be there in about four minutes. Can you flag them down when they arrive?",
        "cn": "好的。救护车大概四分钟后到。他们到的时候您能招手示意吗？"
      },
      {
        "speaker": "You",
        "en": "Yes, I'll watch for them. Should I, like, put on my hazard lights or something to warn other drivers?",
        "cn": "好的，我会注意看的。我需要打开双闪之类的来提醒其他司机吗？"
      },
      {
        "speaker": "Dispatcher",
        "en": "If you can safely reach your car to turn on hazards, yes. Otherwise, stay clear of traffic.",
        "cn": "如果你能安全地回到车里打开双闪，那就打开。否则远离车流。"
      },
      {
        "speaker": "You",
        "en": "Okay, I turned them on. I can hear sirens now, I think help is almost here.",
        "cn": "好了，已经打开了。我能听到警笛声了，救援应该快到了。"
      },
      {
        "speaker": "Dispatcher",
        "en": "Great, that should be our units. Stay where you are and the paramedics will check on both of you. Stay safe.",
        "cn": "好的，应该是我们的车。待在原地，急救人员会检查你们两个人的情况。注意安全。"
      }
    ]
  },
  {
    "id": "traffic-accident-4",
    "cat": "traffic",
    "catName": "交通事故",
    "catEmoji": "🚗",
    "title": "Talking to a Police Officer",
    "titleCn": "和警察对话",
    "emoji": "👮",
    "lines": [
      {
        "speaker": "Officer",
        "en": "Good afternoon. I'm Officer Martinez. I'm here to take a report on this accident. Are you okay?",
        "cn": "下午好。我是Martinez警官。我来做事故记录。您还好吗？"
      },
      {
        "speaker": "You",
        "en": "Yes sir, I'm a bit shaken but I'm not injured. Thank you for coming so quickly.",
        "cn": "是的警官，我有点受惊但没有受伤。谢谢你们来得这么快。"
      },
      {
        "speaker": "Officer",
        "en": "Of course. Can I see your driver's license, registration, and proof of insurance?",
        "cn": "应该的。能看一下您的驾照、行驶证和保险证明吗？"
      },
      {
        "speaker": "You",
        "en": "Sure, here you go. Everything should be current. I just renewed my registration last month.",
        "cn": "好的，给您。都应该是有效的。我上个月刚续了行驶证。"
      },
      {
        "speaker": "Officer",
        "en": "Thank you. Now, can you walk me through exactly what happened?",
        "cn": "谢谢。现在能跟我说说具体发生了什么吗？"
      },
      {
        "speaker": "You",
        "en": "I was driving north on Main Street, going maybe 30 miles an hour. The light turned yellow and the car ahead of me stopped suddenly.",
        "cn": "我当时在主街往北开，大概时速30英里。信号灯变黄了，前面的车突然停了。"
      },
      {
        "speaker": "Officer",
        "en": "And you weren't able to stop in time?",
        "cn": "然后您没来得及刹车？"
      },
      {
        "speaker": "You",
        "en": "No, I hit the brakes but it was too late. I rear-ended them. It happened so fast.",
        "cn": "是的，我踩了刹车但已经来不及了。我追尾了。发生得太快了。"
      },
      {
        "speaker": "Officer",
        "en": "Were you distracted at all? Using your phone, adjusting the radio, anything like that?",
        "cn": "您当时有分心吗？用手机、调收音机之类的？"
      },
      {
        "speaker": "You",
        "en": "No, I was paying attention. I just didn't expect them to slam on the brakes like that.",
        "cn": "没有，我在注意看路。我就是没想到他们会那样急刹车。"
      },
      {
        "speaker": "Officer",
        "en": "Understood. And what about your speed? Do you think you might have been following too closely?",
        "cn": "明白了。您的车速呢？您觉得是不是跟车太近了？"
      },
      {
        "speaker": "You",
        "en": "In hindsight, yeah, probably. I should have left more space between us. That's on me.",
        "cn": "回头想想，可能是的。我应该留更多车距。这是我的责任。"
      },
      {
        "speaker": "Officer",
        "en": "I appreciate your honesty. Were there any witnesses that you noticed?",
        "cn": "感谢您的诚实。您注意到有目击者吗？"
      },
      {
        "speaker": "You",
        "en": "Um, there was a woman on the sidewalk who saw the whole thing. She came over to check on us.",
        "cn": "嗯，人行道上有个女士看到了全过程。她过来查看我们的情况了。"
      },
      {
        "speaker": "Officer",
        "en": "Good, I'll try to get a statement from her too. Did either vehicle have a dashcam running?",
        "cn": "好，我也会去找她录口供。两辆车有行车记录仪在运行吗？"
      },
      {
        "speaker": "You",
        "en": "Actually, yeah, I have a dashcam. It should have the whole thing recorded. Want me to pull it up?",
        "cn": "其实有，我有行车记录仪。应该录下了全过程。需要我调出来吗？"
      },
      {
        "speaker": "Officer",
        "en": "That would be very helpful. I'll include that in the report. Now, you mentioned no injuries, correct?",
        "cn": "那会非常有帮助。我会把这个写进报告里。您说没有受伤，对吗？"
      },
      {
        "speaker": "You",
        "en": "I'm fine, but the other driver said his neck was a little sore. The paramedics checked him out.",
        "cn": "我没事，但另一个司机说脖子有点疼。急救人员已经检查过了。"
      },
      {
        "speaker": "Officer",
        "en": "Alright, I'll note that. Here's the accident report number. You'll need this for your insurance claim.",
        "cn": "好的，我会记录的。这是事故报告编号。您办理保险理赔时需要用到。"
      },
      {
        "speaker": "You",
        "en": "Thank you, Officer Martinez. I really appreciate your help with all this. Am I free to go?",
        "cn": "谢谢您，Martinez警官。非常感谢您的帮助。我可以走了吗？"
      }
    ]
  },
  {
    "id": "traffic-accident-5",
    "cat": "traffic",
    "catName": "交通事故",
    "catEmoji": "🚗",
    "title": "Filing an Insurance Claim",
    "titleCn": "理赔保险",
    "emoji": "📝",
    "lines": [
      {
        "speaker": "You",
        "en": "Hi, I'd like to file a claim. I was in a car accident yesterday afternoon.",
        "cn": "你好，我想报一个理赔。我昨天下午出了车祸。"
      },
      {
        "speaker": "Agent",
        "en": "I'm sorry to hear that. Are you alright? Let me pull up your policy first. Can I get your name and policy number?",
        "cn": "很抱歉听到这个。您没事吧？让我先调出您的保单。能给我您的姓名和保单号吗？"
      },
      {
        "speaker": "You",
        "en": "I'm okay, thanks. My name is Mike Chen, policy number is PG-445-882-901.",
        "cn": "我没事，谢谢。我叫Mike Chen，保单号是PG-445-882-901。"
      },
      {
        "speaker": "Agent",
        "en": "Got it, I've pulled up your account. Now, can you describe what happened?",
        "cn": "收到，已经调出您的账户了。能描述一下发生了什么吗？"
      },
      {
        "speaker": "You",
        "en": "I rear-ended someone on Main Street. It was my fault. The traffic light turned yellow and they stopped, but I couldn't brake in time.",
        "cn": "我在主街追尾了别人。是我的责任。信号灯变黄了他们停了车，但我没来得及刹车。"
      },
      {
        "speaker": "Agent",
        "en": "I see. Was a police report filed? If so, do you have the report number?",
        "cn": "明白了。报警了吗？如果报了，有报告编号吗？"
      },
      {
        "speaker": "You",
        "en": "Yeah, the report number is ACC-2024-88743. An officer came to the scene and documented everything.",
        "cn": "有，报告编号是ACC-2024-88743。有警察到现场记录了一切。"
      },
      {
        "speaker": "Agent",
        "en": "Perfect. And what about damage? Can you describe the damage to both vehicles?",
        "cn": "好的。损坏情况呢？能描述一下两辆车的损坏吗？"
      },
      {
        "speaker": "You",
        "en": "My front bumper is pretty banged up, and their rear bumper, tail light, and trunk all have damage.",
        "cn": "我的前保险杠损坏比较严重，对方的后保险杠、尾灯和后备箱都有损坏。"
      },
      {
        "speaker": "Agent",
        "en": "Did you take photos of the damage? We'll need those for the claim.",
        "cn": "您拍了损坏照片吗？理赔需要用到。"
      },
      {
        "speaker": "You",
        "en": "Yes, I took a bunch from different angles. I can email them to you right now if you want.",
        "cn": "拍了，从不同角度拍了很多。你要的话我现在就发邮件给你。"
      },
      {
        "speaker": "Agent",
        "en": "That would be great. Send them to claims@progressive-example.com with your policy number in the subject line.",
        "cn": "太好了。发到claims@progressive-example.com，主题行写上您的保单号。"
      },
      {
        "speaker": "You",
        "en": "Will do. So what happens next? How long does this whole process usually take?",
        "cn": "好的。那接下来怎么办？整个过程一般需要多久？"
      },
      {
        "speaker": "Agent",
        "en": "We'll assign an adjuster to your case within 24 hours. They'll assess the damage and contact the other party's insurance.",
        "cn": "我们会在24小时内给您安排一位理赔员。他们会评估损失并联系对方的保险公司。"
      },
      {
        "speaker": "You",
        "en": "Okay. And will my rates go up because of this? I've never had an accident before.",
        "cn": "好的。那我的保费会涨吗？我以前从来没出过事故。"
      },
      {
        "speaker": "Agent",
        "en": "There may be some impact on your premium at renewal time, but since this is your first incident, it shouldn't be too drastic.",
        "cn": "续保时可能会对保费有一些影响，但因为这是您第一次事故，应该不会太大。"
      },
      {
        "speaker": "You",
        "en": "That's a relief. What about a rental car while mine is being fixed? Does my policy cover that?",
        "cn": "那还好。修车期间租车的话，我的保险包含这个吗？"
      },
      {
        "speaker": "Agent",
        "en": "Let me check... yes, you have rental car coverage, up to thirty dollars a day for up to two weeks.",
        "cn": "我查一下……是的，您有租车保障，每天最多三十美元，最长两周。"
      },
      {
        "speaker": "You",
        "en": "Oh awesome, I didn't even know I had that. Is there a specific rental company I need to use?",
        "cn": "太好了，我都不知道有这个。需要用指定的租车公司吗？"
      },
      {
        "speaker": "Agent",
        "en": "We partner with Enterprise, so they'll give you the easiest process, but you can use any major rental company. I'll email you all the details.",
        "cn": "我们和Enterprise有合作，流程最方便，但您也可以用任何大型租车公司。我会把所有细节发邮件给您。"
      }
    ]
  },
  {
    "id": "gym-join-1",
    "cat": "gym",
    "catName": "健身锻炼",
    "catEmoji": "💪",
    "title": "Signing Up for a Gym Membership",
    "titleCn": "办健身卡",
    "emoji": "🏋️",
    "lines": [
      {
        "speaker": "You",
        "en": "Hi there! I'm interested in joining. Can you tell me about your membership plans?",
        "cn": "你好！我想办卡。能介绍一下你们的会员方案吗？"
      },
      {
        "speaker": "Staff",
        "en": "Absolutely! We've got three tiers: Basic, Plus, and Premium. It depends on what you're looking for.",
        "cn": "当然！我们有三个等级：基础、升级和高级。取决于您的需求。"
      },
      {
        "speaker": "You",
        "en": "What's the difference between them? I'm kinda new to the whole gym thing.",
        "cn": "它们有什么区别？我对健身房这些东西不太了解。"
      },
      {
        "speaker": "Staff",
        "en": "No worries! Basic is just gym access, thirty bucks a month. Plus adds group classes for forty-five. Premium includes personal training sessions for seventy.",
        "cn": "没关系！基础的只包含健身房使用权，每月三十块。升级的增加团课，四十五块。高级的包含私教课程，七十块。"
      },
      {
        "speaker": "You",
        "en": "Hmm, I think Plus sounds right for me. I've been wanting to try some classes.",
        "cn": "嗯，升级的比较适合我。我一直想试试上课。"
      },
      {
        "speaker": "Staff",
        "en": "Great choice! The classes are really fun. We've got yoga, spin, HIIT, kickboxing, you name it.",
        "cn": "很好的选择！课程真的很有趣。我们有瑜伽、动感单车、高强度间歇训练、搏击操，应有尽有。"
      },
      {
        "speaker": "You",
        "en": "Nice! Is there a sign-up fee or anything extra I should know about?",
        "cn": "不错！有注册费或其他额外费用吗？"
      },
      {
        "speaker": "Staff",
        "en": "There's normally a fifty-dollar enrollment fee, but actually, we're running a promo right now and it's waived.",
        "cn": "通常有五十块注册费，但实际上我们现在有促销活动，免注册费。"
      },
      {
        "speaker": "You",
        "en": "Oh sweet, good timing on my part then! What about a contract? Am I locked in for a year?",
        "cn": "哦太好了，我来得真是时候！合约呢？需要签一年吗？"
      },
      {
        "speaker": "Staff",
        "en": "Nope, it's month-to-month. You can cancel anytime with thirty days' notice. No hidden fees.",
        "cn": "不用，按月付。提前三十天通知就可以随时取消。没有隐藏费用。"
      },
      {
        "speaker": "You",
        "en": "That's exactly what I wanna hear. Some gyms make it impossible to cancel, you know?",
        "cn": "这正是我想听到的。有些健身房取消特别难，你知道吧？"
      },
      {
        "speaker": "Staff",
        "en": "Ha, yeah, we're not like that. We want people to stay because they love it, not because they're trapped.",
        "cn": "哈，是啊，我们不那样。我们希望会员留下是因为喜欢，而不是被绑住。"
      },
      {
        "speaker": "You",
        "en": "Love that. Okay, what do I need to sign up? Just an ID?",
        "cn": "太好了。那办卡需要什么？带身份证就行？"
      },
      {
        "speaker": "Staff",
        "en": "Yep, just a valid ID and a credit or debit card for the monthly payments. Takes about five minutes.",
        "cn": "对，带有效身份证和信用卡或借记卡用于月付就行。大概五分钟搞定。"
      },
      {
        "speaker": "You",
        "en": "Perfect. Oh, one more thing. What are your hours? I'm kind of an early bird.",
        "cn": "好的。哦，还有一件事。你们营业时间是？我比较喜欢早起锻炼。"
      },
      {
        "speaker": "Staff",
        "en": "We open at 5 AM and close at 11 PM on weekdays. Weekends are 7 AM to 9 PM.",
        "cn": "工作日早上五点到晚上十一点。周末早上七点到晚上九点。"
      },
      {
        "speaker": "You",
        "en": "5 AM? That's perfect for me. I like getting my workout in before work.",
        "cn": "早上五点？太适合我了。我喜欢上班前锻炼。"
      },
      {
        "speaker": "Staff",
        "en": "You'd be surprised how many people are here at 5. It's a whole community of early risers.",
        "cn": "你会惊讶五点来的人有多少。这是一个早起族的小圈子。"
      },
      {
        "speaker": "You",
        "en": "Ha, I love that. Alright, let's do it. Sign me up for the Plus membership!",
        "cn": "哈，我喜欢。好吧，就这样。给我办升级会员卡！"
      },
      {
        "speaker": "Staff",
        "en": "Awesome, welcome to the family! Let's get your paperwork started and I'll give you a quick tour after.",
        "cn": "太好了，欢迎加入大家庭！我们先办手续，然后我带你简单参观一下。"
      }
    ]
  },
  {
    "id": "gym-trainer-1",
    "cat": "gym",
    "catName": "健身锻炼",
    "catEmoji": "💪",
    "title": "First Session with a Personal Trainer",
    "titleCn": "第一次私教课",
    "emoji": "🏃",
    "lines": [
      {
        "speaker": "Trainer",
        "en": "Hey! You must be Mike. I'm Alex, I'll be your trainer. Nice to meet you, man!",
        "cn": "嘿！你一定是Mike。我是Alex，我会是你的教练。很高兴认识你！"
      },
      {
        "speaker": "You",
        "en": "Hey Alex! Yeah, nice to meet you too. I'm a little nervous, not gonna lie.",
        "cn": "嗨Alex！是的，也很高兴认识你。不瞒你说，我有点紧张。"
      },
      {
        "speaker": "Trainer",
        "en": "Don't be! Everyone starts somewhere. So tell me, what are your fitness goals?",
        "cn": "别紧张！每个人都是从零开始的。跟我说说，你的健身目标是什么？"
      },
      {
        "speaker": "You",
        "en": "I mainly wanna lose some belly fat and build a little muscle. Nothing crazy, just get in decent shape.",
        "cn": "我主要想减掉肚子上的赘肉，练点肌肉。不用太夸张，就是让身材变好点。"
      },
      {
        "speaker": "Trainer",
        "en": "Totally doable. Have you worked out before, or is this completely new for you?",
        "cn": "完全可以做到。你以前锻炼过吗，还是完全从零开始？"
      },
      {
        "speaker": "You",
        "en": "I used to run in college, but that was like five years ago. Since then, not much honestly.",
        "cn": "大学时跑过步，但那都是五年前了。之后说实话就没怎么运动。"
      },
      {
        "speaker": "Trainer",
        "en": "No worries, we'll start slow and build up. First, let me check your form on some basic movements.",
        "cn": "没关系，我们会慢慢来逐步增加。首先，让我看看你做几个基本动作的姿势。"
      },
      {
        "speaker": "Trainer",
        "en": "Let's start with some bodyweight squats. Feet shoulder-width apart, and just sit back like you're sitting in a chair.",
        "cn": "我们从徒手深蹲开始。双脚与肩同宽，像坐椅子一样往后坐。"
      },
      {
        "speaker": "You",
        "en": "Like this? My knees are making weird noises, is that normal?",
        "cn": "这样吗？我的膝盖在响，正常吗？"
      },
      {
        "speaker": "Trainer",
        "en": "Ha, that's pretty common if you haven't been active. Try to push your knees out a bit more. Yeah, just like that!",
        "cn": "哈，不经常运动的话很常见。试着把膝盖再往外推一点。对，就是这样！"
      },
      {
        "speaker": "You",
        "en": "Okay, that actually feels better. How many should I do?",
        "cn": "好，这样确实感觉好多了。我该做几个？"
      },
      {
        "speaker": "Trainer",
        "en": "Let's do three sets of ten. Rest thirty seconds between sets. We're just warming up.",
        "cn": "做三组，每组十个。组间休息三十秒。我们只是在热身。"
      },
      {
        "speaker": "You",
        "en": "Whew, okay, that last set was tough! I'm already sweating.",
        "cn": "呼，好吧，最后一组真吃力！我已经在出汗了。"
      },
      {
        "speaker": "Trainer",
        "en": "That's what I like to see! Now let's try some push-ups. Drop down and show me what you've got.",
        "cn": "这才对！现在试试俯卧撑。趴下来让我看看你的水平。"
      },
      {
        "speaker": "You",
        "en": "Oh man, I can probably only do like five. Push-ups have always been my weakness.",
        "cn": "天哪，我可能只能做五个。俯卧撑一直是我的弱项。"
      },
      {
        "speaker": "Trainer",
        "en": "That's totally fine. We can modify them. Start on your knees if you need to. No shame in that.",
        "cn": "完全没问题。我们可以降低难度。需要的话先跪着做。这一点都不丢人。"
      },
      {
        "speaker": "You",
        "en": "Thanks for being so patient. I feel like such a beginner, but this is actually kinda fun.",
        "cn": "谢谢你这么有耐心。我觉得自己像个新手，但这其实挺好玩的。"
      },
      {
        "speaker": "Trainer",
        "en": "That's what I wanna hear! Fitness should be enjoyable. We'll meet twice a week and you'll see progress fast.",
        "cn": "我就想听到这个！健身应该是快乐的。我们每周见两次，你会很快看到进步的。"
      },
      {
        "speaker": "You",
        "en": "I'm actually looking forward to it. Same time next week?",
        "cn": "我还真挺期待的。下周同一时间？"
      },
      {
        "speaker": "Trainer",
        "en": "You got it! And hey, drink lots of water tonight. You're gonna be sore tomorrow, fair warning!",
        "cn": "没问题！还有，今晚多喝水。明天你会浑身酸痛的，提前警告你！"
      }
    ]
  },
  {
    "id": "gym-class-1",
    "cat": "gym",
    "catName": "健身锻炼",
    "catEmoji": "💪",
    "title": "Trying a Group Fitness Class",
    "titleCn": "上团体健身课",
    "emoji": "🧘",
    "lines": [
      {
        "speaker": "You",
        "en": "Excuse me, is this the spin class? I've never been before and I have no idea what I'm doing.",
        "cn": "请问，这是动感单车课吗？我从没上过，完全不知道该干嘛。"
      },
      {
        "speaker": "Instructor",
        "en": "Yes it is! Welcome! Don't worry, just grab a bike in the back row and I'll help you set it up.",
        "cn": "是的！欢迎！别担心，在后排找辆车，我来帮你调整。"
      },
      {
        "speaker": "You",
        "en": "Thanks! There are so many knobs on this thing. How do I adjust the seat?",
        "cn": "谢谢！这上面好多旋钮。怎么调座椅？"
      },
      {
        "speaker": "Instructor",
        "en": "Just pull that lever under the seat to raise or lower it. You want your leg almost straight when the pedal is at the bottom.",
        "cn": "拉座椅下面那个把手就能升降。踏板在最下面时你的腿应该几乎伸直。"
      },
      {
        "speaker": "You",
        "en": "Like this? Okay, I think that feels about right.",
        "cn": "这样吗？好，我觉得差不多了。"
      },
      {
        "speaker": "Instructor",
        "en": "Perfect! And the resistance knob is right here in the center. Turn it right to make it harder, left to make it easier.",
        "cn": "完美！阻力旋钮在中间这里。往右转加重，往左转减轻。"
      },
      {
        "speaker": "You",
        "en": "Got it. Any tips for a total newbie? I really don't wanna embarrass myself.",
        "cn": "明白了。对纯新手有什么建议吗？我真的不想出丑。"
      },
      {
        "speaker": "Instructor",
        "en": "Just go at your own pace! Nobody's watching you, everyone's focused on their own ride. And drink water whenever you need to.",
        "cn": "按自己的节奏来就好！没人会看你，大家都专注于自己的骑行。想喝水随时喝。"
      },
      {
        "speaker": "You",
        "en": "Okay, I can do this. How long is the class?",
        "cn": "好的，我能行。这节课多长时间？"
      },
      {
        "speaker": "Instructor",
        "en": "Forty-five minutes. We'll warm up for five, then do intervals, some climbs, and a cool down at the end.",
        "cn": "四十五分钟。先热身五分钟，然后做间歇训练、爬坡，最后放松。"
      },
      {
        "speaker": "Classmate",
        "en": "Hey, first time? Don't worry, I could barely walk after my first class, but now I'm addicted!",
        "cn": "嘿，第一次来？别担心，我第一次上完课都快走不了路了，现在都上瘾了！"
      },
      {
        "speaker": "You",
        "en": "Ha, that's both encouraging and terrifying. How often do you come?",
        "cn": "哈，这既鼓励人又吓人。你多久来一次？"
      },
      {
        "speaker": "Classmate",
        "en": "Three times a week. It's the best stress relief. Way better than therapy, honestly.",
        "cn": "一周三次。是最好的减压方式。说真的，比心理治疗还管用。"
      },
      {
        "speaker": "Instructor",
        "en": "Alright everyone, let's get started! Turn up that resistance and let's warm up those legs!",
        "cn": "好了各位，我们开始！把阻力调上来，让腿热起来！"
      },
      {
        "speaker": "You",
        "en": "Oh wow, this is already harder than I thought! And we're just warming up?",
        "cn": "哇，这比我想的难多了！而且这才是热身？"
      },
      {
        "speaker": "Classmate",
        "en": "Ha, just wait for the hill climbs. That's when it really gets spicy!",
        "cn": "哈，等爬坡的时候再说。那时候才真的酸爽！"
      },
      {
        "speaker": "You",
        "en": "I might die. But like, in a good way? Is that a thing?",
        "cn": "我可能会累死。但是那种好的累死？有这回事吗？"
      },
      {
        "speaker": "Instructor",
        "en": "You're doing great! Keep those legs moving! Remember, the only bad workout is the one you didn't do!",
        "cn": "你做得很好！腿不要停！记住，唯一糟糕的锻炼就是你没做的那次！"
      },
      {
        "speaker": "You",
        "en": "Okay... I'm drenched in sweat but I'm actually having a blast. I'm definitely coming back.",
        "cn": "好吧……我浑身是汗但真的很开心。我一定会再来的。"
      },
      {
        "speaker": "Classmate",
        "en": "That's the spirit! Welcome to the spin fam. See you next class!",
        "cn": "这才对！欢迎加入单车大家庭。下次课见！"
      }
    ]
  },
  {
    "id": "gym-routine-1",
    "cat": "gym",
    "catName": "健身锻炼",
    "catEmoji": "💪",
    "title": "Asking for Workout Advice",
    "titleCn": "请教健身方法",
    "emoji": "🤔",
    "lines": [
      {
        "speaker": "You",
        "en": "Hey, sorry to bother you. You look like you know what you're doing. Can I ask you something?",
        "cn": "嘿，打扰了。你看起来很专业。能请教你一个问题吗？"
      },
      {
        "speaker": "Gym Regular",
        "en": "Oh hey, no worries at all! What's up?",
        "cn": "嘿，完全没关系！什么事？"
      },
      {
        "speaker": "You",
        "en": "I've been coming here for a month but I feel like I'm not making any progress. What am I doing wrong?",
        "cn": "我来这健身一个月了，但感觉没什么进步。我哪里做错了？"
      },
      {
        "speaker": "Gym Regular",
        "en": "What does your routine look like? Like, what do you do when you come in?",
        "cn": "你的训练计划是什么样的？就是你来了都做什么？"
      },
      {
        "speaker": "You",
        "en": "Honestly? I just kinda wander around and use whatever machines are open. No real plan.",
        "cn": "说实话？我就是随便转转，哪个器械空了就用哪个。没有什么计划。"
      },
      {
        "speaker": "Gym Regular",
        "en": "Ah, see, that's probably the issue. You need a structured routine. Are you trying to build muscle or lose weight?",
        "cn": "啊，这可能就是问题所在。你需要一个系统的训练计划。你是想增肌还是减肥？"
      },
      {
        "speaker": "You",
        "en": "A little bit of both, I guess? Mainly I wanna get stronger and tone up.",
        "cn": "两个都有点吧？主要想变壮一些，让身材更紧实。"
      },
      {
        "speaker": "Gym Regular",
        "en": "Cool. I'd suggest doing a push-pull-legs split. That means you hit different muscle groups on different days.",
        "cn": "好。我建议做推拉腿分化训练。就是不同天练不同肌群。"
      },
      {
        "speaker": "You",
        "en": "Push-pull-legs? I've heard of that. So like, chest on one day, back the next?",
        "cn": "推拉腿？我听过这个。就是一天练胸，第二天练背这样？"
      },
      {
        "speaker": "Gym Regular",
        "en": "Exactly! Push day is chest, shoulders, and triceps. Pull day is back and biceps. Legs are... well, legs.",
        "cn": "没错！推日练胸、肩和三头肌。拉日练背和二头肌。腿日就是……练腿。"
      },
      {
        "speaker": "You",
        "en": "That makes sense. How many days a week should I be training?",
        "cn": "有道理。我一周应该练几天？"
      },
      {
        "speaker": "Gym Regular",
        "en": "Three to four days is perfect for a beginner. Rest days are just as important as training days.",
        "cn": "对于新手来说三到四天最合适。休息日和训练日一样重要。"
      },
      {
        "speaker": "You",
        "en": "Really? I thought more was better. I was trying to come every single day.",
        "cn": "真的吗？我以为练得越多越好。我之前试着每天都来。"
      },
      {
        "speaker": "Gym Regular",
        "en": "Nah, your muscles grow during rest, not during the workout. Overtraining is a real thing.",
        "cn": "不是的，肌肉是在休息时增长的，不是在锻炼时。过度训练是真的会发生的。"
      },
      {
        "speaker": "You",
        "en": "Mind blown. What about nutrition? I'm basically just eating whatever.",
        "cn": "长见识了。那饮食呢？我基本上就是随便吃。"
      },
      {
        "speaker": "Gym Regular",
        "en": "Diet is like 80 percent of the game, dude. Focus on protein. Try to get about a gram per pound of body weight.",
        "cn": "老哥，饮食占了八成。重点是蛋白质。争取每磅体重摄入一克蛋白质。"
      },
      {
        "speaker": "You",
        "en": "A gram per pound? That's a lot of chicken breast. Any other protein sources you recommend?",
        "cn": "每磅一克？那得吃好多鸡胸肉。你还推荐什么蛋白质来源？"
      },
      {
        "speaker": "Gym Regular",
        "en": "Eggs, Greek yogurt, protein shakes, fish, tofu if you're into that. Mix it up so you don't get bored.",
        "cn": "鸡蛋、希腊酸奶、蛋白粉、鱼、喜欢的话豆腐也行。多换着吃免得腻。"
      },
      {
        "speaker": "You",
        "en": "This is super helpful, man. I feel like I wasted a whole month just messing around.",
        "cn": "太有用了，兄弟。我感觉浪费了一整个月在瞎练。"
      },
      {
        "speaker": "Gym Regular",
        "en": "Nah, you showed up and that's what counts. Most people never even make it through the door. You got this!",
        "cn": "不，你能来就很好了。大多数人连门都不会踏进来。你一定行的！"
      }
    ]
  },
  {
    "id": "gym-cancel-1",
    "cat": "gym",
    "catName": "健身锻炼",
    "catEmoji": "💪",
    "title": "Canceling a Gym Membership",
    "titleCn": "取消健身卡",
    "emoji": "❌",
    "lines": [
      {
        "speaker": "You",
        "en": "Hi, I'd like to cancel my membership. I'm moving to a different city next month.",
        "cn": "你好，我想取消会员卡。我下个月要搬到另一个城市。"
      },
      {
        "speaker": "Staff",
        "en": "Oh no, we're sorry to hear that! Can I get your name and member ID?",
        "cn": "哦不，很遗憾听到这个！能给我您的姓名和会员编号吗？"
      },
      {
        "speaker": "You",
        "en": "Sure, it's Mike Chen, member ID 88421.",
        "cn": "好的，Mike Chen，会员编号88421。"
      },
      {
        "speaker": "Staff",
        "en": "Got it. Before I process that, would you be interested in a membership freeze instead? You can pause it for up to three months.",
        "cn": "收到了。在处理之前，您有兴趣冻结会员资格吗？最多可以暂停三个月。"
      },
      {
        "speaker": "You",
        "en": "I appreciate that, but I'm not coming back. The move is permanent.",
        "cn": "谢谢你的建议，但我不会回来了。是永久搬走。"
      },
      {
        "speaker": "Staff",
        "en": "Understood. We also have locations nationwide. There might be one near your new city.",
        "cn": "明白了。我们在全国都有分店。您的新城市附近可能有一家。"
      },
      {
        "speaker": "You",
        "en": "Oh really? I'm moving to Austin. Is there one there?",
        "cn": "真的吗？我搬去Austin。那里有分店吗？"
      },
      {
        "speaker": "Staff",
        "en": "Let me check... yes, actually! There are two locations in Austin. Would you like to transfer your membership?",
        "cn": "我查一下……有的！Austin有两家。您想转移会员资格吗？"
      },
      {
        "speaker": "You",
        "en": "Hmm, that's tempting. Would I keep the same rate and plan?",
        "cn": "嗯，挺心动的。我能保留同样的价格和方案吗？"
      },
      {
        "speaker": "Staff",
        "en": "Yep, everything transfers over. Same rate, same benefits, no extra fee for the transfer.",
        "cn": "是的，全部转过去。同样的价格、同样的权益，转移不收额外费用。"
      },
      {
        "speaker": "You",
        "en": "Actually, you know what, let me think about it. I was kinda planning to try a different gym there.",
        "cn": "这样吧，让我想想。我本来计划在那边试试别的健身房。"
      },
      {
        "speaker": "Staff",
        "en": "Totally understand. No pressure at all. If you do want to cancel, there's a thirty-day notice period.",
        "cn": "完全理解。一点都不勉强。如果您要取消，有三十天的通知期。"
      },
      {
        "speaker": "You",
        "en": "Right, so if I cancel today, my last day would be... mid-May?",
        "cn": "好的，所以如果我今天取消，我的最后一天是……五月中旬？"
      },
      {
        "speaker": "Staff",
        "en": "Correct, your membership would end on May 16th. You'll still have full access until then.",
        "cn": "没错，您的会员资格到五月十六号结束。在那之前您仍然可以正常使用。"
      },
      {
        "speaker": "You",
        "en": "Perfect, that works since I'm not moving until the end of May. Let's go ahead and cancel.",
        "cn": "正好，我五月底才搬。那就取消吧。"
      },
      {
        "speaker": "Staff",
        "en": "Alright, I'll process the cancellation now. You won't be charged after the final billing date.",
        "cn": "好的，我现在处理取消。最后一次扣款日之后就不会再收费了。"
      },
      {
        "speaker": "You",
        "en": "Great. And just to confirm, there's no cancellation fee, right?",
        "cn": "好的。确认一下，没有取消费，对吧？"
      },
      {
        "speaker": "Staff",
        "en": "No cancellation fee at all. We'll send you a confirmation email within the hour.",
        "cn": "完全没有取消费。我们会在一小时内给您发确认邮件。"
      },
      {
        "speaker": "You",
        "en": "Awesome, thanks. Honestly, I've loved being a member here. You guys run a great gym.",
        "cn": "太好了，谢谢。说真的，我很喜欢在这里。你们健身房经营得很好。"
      },
      {
        "speaker": "Staff",
        "en": "Aw, thanks so much! We'll miss you. And if you ever come back to town, our doors are always open!",
        "cn": "谢谢！我们会想念你的。如果你回来的话，我们的大门永远为你敞开！"
      }
    ]
  },
  {
    "id": "study-grad-1",
    "cat": "study",
    "catName": "学习考试",
    "catEmoji": "📚",
    "title": "Discussing Graduate School Plans",
    "titleCn": "讨论考研计划",
    "emoji": "🎓",
    "lines": [
      {
        "speaker": "You",
        "en": "So I've been thinking about it a lot, and I'm pretty sure I wanna go to grad school.",
        "cn": "我想了很久，我基本确定要考研了。"
      },
      {
        "speaker": "Friend",
        "en": "Oh wow, for real? That's a big step. What program are you looking at?",
        "cn": "哇，真的？那可是个大决定。你想读什么专业？"
      },
      {
        "speaker": "You",
        "en": "I'm leaning toward a Master's in Computer Science. I feel like my bachelor's alone isn't cutting it in this job market.",
        "cn": "我倾向于计算机科学硕士。我觉得光本科学历在现在的就业市场不够用。"
      },
      {
        "speaker": "Friend",
        "en": "That makes sense. CS is super in demand. Have you looked at any specific schools yet?",
        "cn": "有道理。CS需求量很大。你看了具体哪些学校了吗？"
      },
      {
        "speaker": "You",
        "en": "Yeah, I've been eyeing a few. Georgia Tech has a great program, and so does UT Austin.",
        "cn": "看了，我关注了几所。佐治亚理工的项目很好，UT Austin也不错。"
      },
      {
        "speaker": "Friend",
        "en": "Both solid choices. Are you thinking about doing it full-time or part-time while working?",
        "cn": "都是很好的选择。你打算全日制还是边工作边读？"
      },
      {
        "speaker": "You",
        "en": "Honestly, I'm not sure yet. Full-time would be ideal, but I've got student loans to worry about.",
        "cn": "说实话，我还没确定。全日制最理想，但我还有助学贷款要还。"
      },
      {
        "speaker": "Friend",
        "en": "Have you looked into assistantships? A lot of programs offer tuition waivers plus a stipend.",
        "cn": "你了解过助教奖学金吗？很多项目提供学费减免加生活补贴。"
      },
      {
        "speaker": "You",
        "en": "Wait, really? I didn't know that was a thing for Master's students. I thought it was just for PhDs.",
        "cn": "等等，真的吗？我不知道硕士也有。我以为只有博士才有。"
      },
      {
        "speaker": "Friend",
        "en": "Nope, some CS programs offer them to Master's students too. Definitely worth looking into.",
        "cn": "不是的，有些CS项目也给硕士生提供。绝对值得了解一下。"
      },
      {
        "speaker": "You",
        "en": "That would be a game-changer. When do applications usually open?",
        "cn": "那可太好了。申请一般什么时候开放？"
      },
      {
        "speaker": "Friend",
        "en": "Most fall deadlines are in December or January. So you've got some time, but you should start prepping soon.",
        "cn": "大多数秋季入学的截止日期在十二月或一月。所以还有时间，但你应该尽快开始准备了。"
      },
      {
        "speaker": "You",
        "en": "Right. I still need to take the GRE. How bad is that test?",
        "cn": "对。我还需要考GRE。那考试难吗？"
      },
      {
        "speaker": "Friend",
        "en": "It's not terrible if you study. The math section is pretty straightforward for CS people. The verbal part is tricky though.",
        "cn": "认真复习的话不算太难。数学部分对CS的人来说比较简单。语文部分比较棘手。"
      },
      {
        "speaker": "You",
        "en": "Yeah, vocabulary has never been my strong suit. Any study tips?",
        "cn": "是啊，词汇一直不是我的强项。有什么复习建议吗？"
      },
      {
        "speaker": "Friend",
        "en": "Flashcards and practice tests. I used that Magoosh app and it helped a ton.",
        "cn": "闪卡和模拟考试。我用了Magoosh那个APP，帮助很大。"
      },
      {
        "speaker": "You",
        "en": "I'll download that today. What about recommendation letters? How many do I need?",
        "cn": "我今天就下载。推荐信呢？需要几封？"
      },
      {
        "speaker": "Friend",
        "en": "Usually two or three. Start asking your professors now so they have plenty of time.",
        "cn": "一般两到三封。现在就开始找教授，这样他们有充足的时间准备。"
      },
      {
        "speaker": "You",
        "en": "Good call. I'm actually kinda excited about this now. Thanks for talking it through with me.",
        "cn": "说得对。我现在真的有点兴奋了。谢谢你陪我聊这些。"
      },
      {
        "speaker": "Friend",
        "en": "Of course! I think you'd crush it in grad school. Seriously, go for it. I'm rooting for you.",
        "cn": "当然！我觉得你读研一定会很出色的。说真的，去吧。我支持你。"
      }
    ]
  },
  {
    "id": "study-grad-2",
    "cat": "study",
    "catName": "学习考试",
    "catEmoji": "📚",
    "title": "Asking a Professor for Recommendation",
    "titleCn": "找教授要推荐信",
    "emoji": "✉️",
    "lines": [
      {
        "speaker": "You",
        "en": "Professor Williams, do you have a minute? I wanted to ask you something important.",
        "cn": "Williams教授，您有空吗？我想问您一件重要的事。"
      },
      {
        "speaker": "Professor",
        "en": "Of course, Mike. Come on in. What's on your mind?",
        "cn": "当然，Mike。请进。什么事？"
      },
      {
        "speaker": "You",
        "en": "Well, I'm applying to grad school for Computer Science, and I was wondering if you'd be willing to write me a recommendation letter.",
        "cn": "是这样，我正在申请计算机科学的研究生，我想问您是否愿意帮我写一封推荐信。"
      },
      {
        "speaker": "Professor",
        "en": "I'd be happy to! You were one of my strongest students in Advanced Algorithms. Which schools are you applying to?",
        "cn": "我很乐意！你是我高级算法课上最优秀的学生之一。你申请哪些学校？"
      },
      {
        "speaker": "You",
        "en": "Thank you so much! I'm looking at Georgia Tech, UT Austin, and maybe a couple of reaches like MIT.",
        "cn": "太感谢了！我在看佐治亚理工、UT Austin，也许还有几所冲刺学校比如MIT。"
      },
      {
        "speaker": "Professor",
        "en": "Those are great choices. MIT is ambitious, but hey, you never know unless you try.",
        "cn": "都是很好的选择。MIT很有挑战性，但不试怎么知道呢。"
      },
      {
        "speaker": "You",
        "en": "Exactly my thinking. Is there anything you need from me to write the letter?",
        "cn": "我也是这么想的。您需要我提供什么材料来写推荐信吗？"
      },
      {
        "speaker": "Professor",
        "en": "Yes, actually. Could you send me your resume, your personal statement draft, and a list of the programs with their deadlines?",
        "cn": "需要的。你能把简历、个人陈述草稿和申请学校的清单及截止日期发给我吗？"
      },
      {
        "speaker": "You",
        "en": "Absolutely, I can email all of that to you by this weekend.",
        "cn": "没问题，我这周末前把这些都发邮件给您。"
      },
      {
        "speaker": "Professor",
        "en": "That would be great. Also, it would help if you reminded me of specific projects you did in my class.",
        "cn": "那太好了。另外，如果你能提醒我你在我课上做的具体项目会有帮助。"
      },
      {
        "speaker": "You",
        "en": "Oh sure! I did that research project on machine learning optimization. The one you said was one of the best in the class.",
        "cn": "好的！我做了那个关于机器学习优化的研究项目。就是您说是班上最好之一的那个。"
      },
      {
        "speaker": "Professor",
        "en": "Right, right! That was excellent work. I'll definitely highlight that in the letter.",
        "cn": "对对！那个做得非常好。我一定会在信里重点提到这个。"
      },
      {
        "speaker": "You",
        "en": "That means a lot, thank you. I was also the TA for your intro class last semester, if that helps.",
        "cn": "那真的太感谢了。我上学期还给您的入门课当过助教，不知道有没有帮助。"
      },
      {
        "speaker": "Professor",
        "en": "Oh yes, you were great as a TA. The students loved you. That's definitely going in there.",
        "cn": "对啊，你当助教很出色。学生们都很喜欢你。这个一定要写进去。"
      },
      {
        "speaker": "You",
        "en": "Ha, thanks! What's the earliest deadline I should worry about?",
        "cn": "哈，谢谢！最早的截止日期是什么时候？"
      },
      {
        "speaker": "Professor",
        "en": "When is the first one due? I usually like at least three weeks' notice.",
        "cn": "第一封什么时候截止？我一般需要至少三周的准备时间。"
      },
      {
        "speaker": "You",
        "en": "The earliest is December 15th for Georgia Tech. So you'd have about six weeks.",
        "cn": "最早的是十二月十五号，佐治亚理工。所以您大概有六周时间。"
      },
      {
        "speaker": "Professor",
        "en": "Perfect, that's plenty of time. I'll have a strong letter ready for you.",
        "cn": "很好，时间很充裕。我会给你写一封有力的推荐信。"
      },
      {
        "speaker": "You",
        "en": "I really can't thank you enough, Professor. This means the world to me.",
        "cn": "真的太感谢您了，教授。这对我来说意义重大。"
      },
      {
        "speaker": "Professor",
        "en": "Don't mention it. You've earned it with your hard work. I have no doubt you'll do great in grad school.",
        "cn": "不用客气。这是你努力换来的。我毫不怀疑你读研会很出色。"
      }
    ]
  },
  {
    "id": "study-english-1",
    "cat": "study",
    "catName": "学习考试",
    "catEmoji": "📚",
    "title": "Preparing for English Proficiency Test",
    "titleCn": "准备英语等级考试",
    "emoji": "📝",
    "lines": [
      {
        "speaker": "You",
        "en": "I'm freaking out about the TOEFL. It's in three weeks and I don't feel ready at all.",
        "cn": "我因为托福快崩溃了。还有三周就考了，感觉完全没准备好。"
      },
      {
        "speaker": "Friend",
        "en": "Hey, take a deep breath. Three weeks is actually a decent amount of time. What section are you worried about?",
        "cn": "嘿，深呼吸。三周时间其实还挺多的。你担心哪个部分？"
      },
      {
        "speaker": "You",
        "en": "Honestly, the speaking section terrifies me. I freeze up whenever I have to speak English on the spot.",
        "cn": "说实话，口语部分吓死我了。每次需要临场说英语我就大脑一片空白。"
      },
      {
        "speaker": "Friend",
        "en": "That's super common, don't worry. Have you been practicing with a timer? The prompts are timed, so getting used to that pressure helps.",
        "cn": "这很常见，别担心。你有计时练习吗？题目是限时的，所以习惯那种压力很有帮助。"
      },
      {
        "speaker": "You",
        "en": "Not really. I've mostly been watching YouTube videos about test strategies.",
        "cn": "没怎么练。我主要在看关于考试策略的YouTube视频。"
      },
      {
        "speaker": "Friend",
        "en": "Those are helpful, but you gotta actually practice speaking out loud. Want me to do some mock sessions with you?",
        "cn": "那些有用，但你得真的开口说。要我陪你做模拟练习吗？"
      },
      {
        "speaker": "You",
        "en": "Would you really? That would be amazing. I feel so awkward practicing by myself.",
        "cn": "你真的愿意？那太好了。自己练好尴尬。"
      },
      {
        "speaker": "Friend",
        "en": "Of course! What about the listening section? How are you doing with that?",
        "cn": "当然！那听力部分呢？你做得怎么样？"
      },
      {
        "speaker": "You",
        "en": "The listening is actually not too bad. I've been binging American podcasts and TV shows.",
        "cn": "听力其实还好。我一直在刷美国播客和美剧。"
      },
      {
        "speaker": "Friend",
        "en": "Smart move. That's honestly one of the best ways to train your ear. What have you been watching?",
        "cn": "聪明的做法。那确实是练听力最好的方法之一。你在看什么？"
      },
      {
        "speaker": "You",
        "en": "A lot of Friends reruns, and I started listening to NPR for the academic stuff.",
        "cn": "很多老友记重播，还开始听NPR来练学术类的。"
      },
      {
        "speaker": "Friend",
        "en": "Perfect combo. And what about reading and writing? Those sections can be tricky too.",
        "cn": "完美搭配。那阅读和写作呢？那些部分也可能很棘手。"
      },
      {
        "speaker": "You",
        "en": "The reading is okay, but I run out of time. I spend too long on each passage.",
        "cn": "阅读还行，但时间不够。每篇文章花的时间太长了。"
      },
      {
        "speaker": "Friend",
        "en": "Try skimming first, then going back for details. You don't need to read every single word to answer the questions.",
        "cn": "试试先快速浏览，再回去看细节。不需要逐字阅读也能回答问题。"
      },
      {
        "speaker": "You",
        "en": "That makes sense. I just get anxious and try to understand everything perfectly.",
        "cn": "有道理。我就是太焦虑了，总想完美理解每个字。"
      },
      {
        "speaker": "Friend",
        "en": "I get it. And for writing, structure is key. Make sure every essay has a clear intro, body, and conclusion.",
        "cn": "我理解。写作的话，结构是关键。确保每篇文章有清晰的引言、正文和结论。"
      },
      {
        "speaker": "You",
        "en": "I've been using templates. Is that cheating?",
        "cn": "我一直在用模板。那算作弊吗？"
      },
      {
        "speaker": "Friend",
        "en": "Not at all! Everyone uses templates. The graders are looking at your language skills, not your creativity.",
        "cn": "完全不算！大家都用模板。评分员看的是你的语言能力，不是创造力。"
      },
      {
        "speaker": "You",
        "en": "Okay, I feel a little better now. Let's set up a study schedule for these three weeks.",
        "cn": "好的，我现在感觉好多了。我们来制定这三周的学习计划吧。"
      },
      {
        "speaker": "Friend",
        "en": "Deal! We'll do mock speaking sessions every other day. You're gonna crush this test, I can feel it.",
        "cn": "成交！我们隔一天做一次口语模拟。你一定能考好的，我有预感。"
      }
    ]
  },
  {
    "id": "study-english-2",
    "cat": "study",
    "catName": "学习考试",
    "catEmoji": "📚",
    "title": "Study Group for English Exam",
    "titleCn": "英语考试学习小组",
    "emoji": "👥",
    "lines": [
      {
        "speaker": "You",
        "en": "Alright everyone, thanks for coming. Let's make this study session count. The exam is in five days.",
        "cn": "好了大家，谢谢你们来。我们要好好利用这次学习。还有五天就考了。"
      },
      {
        "speaker": "Lisa",
        "en": "Five days! I cannot believe it's so soon. I still haven't memorized all the vocabulary.",
        "cn": "五天！不敢相信这么快就到了。我词汇还没背完呢。"
      },
      {
        "speaker": "Kevin",
        "en": "Same. There's like 500 words on that list. How is anyone supposed to learn all of them?",
        "cn": "我也是。那个清单上有五百来个词。谁能全学会啊？"
      },
      {
        "speaker": "You",
        "en": "Here's what I think we should do. Let's divide the vocab list and quiz each other. It'll be way faster.",
        "cn": "我觉得我们可以这样。把词汇表分一下，互相考。会快很多。"
      },
      {
        "speaker": "Lisa",
        "en": "Ooh, like flashcard battles? I'm down. That actually sounds kinda fun.",
        "cn": "哦，像闪卡对战？我愿意。听起来其实挺好玩的。"
      },
      {
        "speaker": "Kevin",
        "en": "I'm in. But can we also go over the grammar section? I keep messing up conditional sentences.",
        "cn": "我也参加。但能不能也复习一下语法部分？我条件句老是搞错。"
      },
      {
        "speaker": "You",
        "en": "Yeah, conditionals are tricky. Which ones give you the most trouble?",
        "cn": "是啊，条件句确实难。你哪种最容易错？"
      },
      {
        "speaker": "Kevin",
        "en": "The third conditional. Like, \"If I had studied harder, I would have passed.\" That structure confuses me.",
        "cn": "第三类条件句。比如\"如果我当时更努力学习，我就通过了。\"这个结构让我很困惑。"
      },
      {
        "speaker": "Lisa",
        "en": "Oh yeah, that one's hard. The verb tenses get all tangled up.",
        "cn": "对，那个确实难。时态都搅在一起了。"
      },
      {
        "speaker": "You",
        "en": "The trick is to remember: \"had\" plus past participle in the if clause, \"would have\" plus past participle in the result clause.",
        "cn": "诀窍是记住：if从句用\"had\"加过去分词，结果从句用\"would have\"加过去分词。"
      },
      {
        "speaker": "Kevin",
        "en": "So like, \"If I had known about the party, I would have come\"?",
        "cn": "所以比如，\"如果我知道有派对，我就来了\"？"
      },
      {
        "speaker": "You",
        "en": "Exactly! See, you actually do get it. You just need to practice more.",
        "cn": "没错！看，你其实会的。就是需要多练习。"
      },
      {
        "speaker": "Lisa",
        "en": "What about the essay section? I always run out of things to say after the first paragraph.",
        "cn": "那作文部分呢？我总是写完第一段就没话说了。"
      },
      {
        "speaker": "You",
        "en": "Try the point-example-explanation method. Make a point, give an example, then explain why it matters.",
        "cn": "试试论点-例子-解释法。提出观点，给出例子，然后解释为什么重要。"
      },
      {
        "speaker": "Lisa",
        "en": "Oh, that's a good framework. Can we practice writing an essay together right now?",
        "cn": "哦，这个框架不错。我们现在能一起练习写一篇作文吗？"
      },
      {
        "speaker": "Kevin",
        "en": "Yeah, let's pick a topic from the practice test and each write one. Then we can review each other's.",
        "cn": "好啊，从模拟题里选个话题，各写一篇。然后互相批改。"
      },
      {
        "speaker": "You",
        "en": "Love it. Let's use the topic about whether technology improves education. We've got thirty minutes, go!",
        "cn": "好主意。用这个话题：科技是否改善了教育。三十分钟，开始！"
      },
      {
        "speaker": "Lisa",
        "en": "Wait, before we start, can I grab a coffee? My brain isn't functioning without caffeine.",
        "cn": "等等，开始之前，我能先去买杯咖啡吗？没有咖啡因我脑子转不动。"
      },
      {
        "speaker": "Kevin",
        "en": "Ha, grab me one too! We're gonna be here for a while.",
        "cn": "哈，也帮我带一杯！我们要待挺久的。"
      },
      {
        "speaker": "You",
        "en": "Alright, coffee run first, then we grind. We're gonna ace this exam, team. Let's go!",
        "cn": "好吧，先买咖啡，然后认真学。我们一定能考好的，团队加油！"
      }
    ]
  },
  {
    "id": "study-english-3",
    "cat": "study",
    "catName": "学习考试",
    "catEmoji": "📚",
    "title": "Celebrating Passing the Exam",
    "titleCn": "庆祝考试通过",
    "emoji": "🎉",
    "lines": [
      {
        "speaker": "You",
        "en": "GUYS! I just checked my scores and... I PASSED! I actually passed the TOEFL!",
        "cn": "大家！我刚查了分数然后……我过了！我竟然过了托福！"
      },
      {
        "speaker": "Lisa",
        "en": "SHUT UP! Are you serious?! What did you get?! Tell me everything!",
        "cn": "不是吧！你说真的？！你考了多少？！快说！"
      },
      {
        "speaker": "You",
        "en": "I got a 98! That's above the minimum for every school I'm applying to!",
        "cn": "我考了98分！超过了我所有申请学校的最低分数线！"
      },
      {
        "speaker": "Kevin",
        "en": "Dude, 98 is amazing! That's like way better than we expected. I'm so pumped for you!",
        "cn": "兄弟，98分太厉害了！比我们预期的好太多了。我太为你高兴了！"
      },
      {
        "speaker": "You",
        "en": "I literally screamed when I saw it. My roommate thought something was wrong.",
        "cn": "我看到分数的时候真的尖叫了。我室友以为出什么事了。"
      },
      {
        "speaker": "Lisa",
        "en": "Ha! I bet! Which section did you score the highest on?",
        "cn": "哈！可以想象！你哪个部分分最高？"
      },
      {
        "speaker": "You",
        "en": "Believe it or not, speaking! I got a 26 on speaking. All that practice with you guys totally paid off.",
        "cn": "你们信不信，是口语！口语我拿了26分。跟你们的练习完全值了。"
      },
      {
        "speaker": "Kevin",
        "en": "No way! That was the section you were most worried about! See, I told you you'd do great.",
        "cn": "不会吧！那是你最担心的部分啊！看，我说了你会考得很好。"
      },
      {
        "speaker": "You",
        "en": "Honestly, I couldn't have done it without this study group. You guys are the real MVPs.",
        "cn": "说真的，没有这个学习小组我做不到。你们才是真正的功臣。"
      },
      {
        "speaker": "Lisa",
        "en": "Aw, stop it! But also, don't stop, keep complimenting us. We deserve it.",
        "cn": "别说了！不对，继续说，继续夸我们。我们值得。"
      },
      {
        "speaker": "Kevin",
        "en": "Ha! But seriously, we all worked so hard. Did you guys check your scores yet?",
        "cn": "哈！但说真的，我们都很努力。你们查分了吗？"
      },
      {
        "speaker": "Lisa",
        "en": "I got a 92! I almost cried when I saw it. My reading score went up by like ten points from my practice test.",
        "cn": "我考了92！看到分数时差点哭了。阅读比模拟考提高了将近十分。"
      },
      {
        "speaker": "You",
        "en": "Lisa, that's incredible! All those reading strategies we practiced really worked!",
        "cn": "Lisa，太厉害了！我们练的那些阅读策略真的管用了！"
      },
      {
        "speaker": "Kevin",
        "en": "I got an 88. Not as high as you two, but honestly, I'm thrilled. I was aiming for 85.",
        "cn": "我考了88。没你们俩高，但说实话我很满意。我的目标是85。"
      },
      {
        "speaker": "You",
        "en": "88 is awesome, Kevin! That's three points above your goal. We should celebrate!",
        "cn": "88分很厉害啊Kevin！比你的目标高了三分。我们该庆祝一下！"
      },
      {
        "speaker": "Lisa",
        "en": "Yes! We need to go out tonight. Dinner's on me. You guys picked the restaurant.",
        "cn": "对！我们今晚必须出去庆祝。我请吃饭。你们选餐厅。"
      },
      {
        "speaker": "Kevin",
        "en": "For real? In that case, let's go somewhere nice. How about that Korean BBQ place downtown?",
        "cn": "真的？那咱们去个好点的。市中心那家韩国烤肉怎么样？"
      },
      {
        "speaker": "You",
        "en": "Oh man, Korean BBQ sounds perfect right now. I'm so hungry I could eat an entire cow.",
        "cn": "天哪，韩国烤肉现在听起来太完美了。我饿得能吃掉一整头牛。"
      },
      {
        "speaker": "Lisa",
        "en": "Korean BBQ it is! We earned this. All those late nights studying finally paid off.",
        "cn": "就韩国烤肉！我们值得。那些熬夜学习的晚上终于有回报了。"
      },
      {
        "speaker": "Kevin",
        "en": "Cheers to that! And cheers to the best study group ever. We crushed it, team!",
        "cn": "为此干杯！也为最棒的学习小组干杯。我们成功了，团队！"
      }
    ]
  },
  {
    "id": "job-interview-1",
    "cat": "job",
    "catName": "求职面试",
    "catEmoji": "💼",
    "title": "Phone Screening Interview",
    "titleCn": "电话初面",
    "emoji": "📞",
    "lines": [
      {
        "speaker": "HR",
        "en": "Hi, is this Alex? This is Sarah from TechCorp. Is now still a good time to chat?",
        "cn": "你好，请问是Alex吗？我是TechCorp的Sarah。现在方便聊吗？"
      },
      {
        "speaker": "You",
        "en": "Hey Sarah! Yes, absolutely. I've been looking forward to this call.",
        "cn": "嗨Sarah！当然方便。我一直很期待这个电话。"
      },
      {
        "speaker": "HR",
        "en": "Awesome. So, I've got your resume pulled up here. Could you give me a quick rundown of your background?",
        "cn": "太好了。我这边已经打开了你的简历。你能简单介绍一下你的背景吗？"
      },
      {
        "speaker": "You",
        "en": "Sure thing. I've been in software development for about five years now, mostly doing full-stack work.",
        "cn": "没问题。我做软件开发大概五年了，主要是全栈开发。"
      },
      {
        "speaker": "HR",
        "en": "Got it. And what made you interested in this particular role at our company?",
        "cn": "了解了。那是什么让你对我们公司的这个职位感兴趣的呢？"
      },
      {
        "speaker": "You",
        "en": "Honestly, I've been following your product for a while, and I love the direction you guys are heading.",
        "cn": "说实话，我关注你们的产品很久了，非常喜欢你们的发展方向。"
      },
      {
        "speaker": "HR",
        "en": "That's great to hear! So this role does require some experience with cloud infrastructure. How comfortable are you with that?",
        "cn": "很高兴听到这个！这个职位需要一些云基础设施的经验。你在这方面熟练吗？"
      },
      {
        "speaker": "You",
        "en": "Oh yeah, I've worked extensively with AWS and a little bit of GCP. I actually led a migration project last year.",
        "cn": "当然，我在AWS方面经验丰富，也用过一些GCP。去年我还主导了一个迁移项目。"
      },
      {
        "speaker": "HR",
        "en": "Nice, that's exactly what we're looking for. Now, what's your current situation? Are you actively job hunting?",
        "cn": "不错，这正是我们需要的。那你现在是什么状态？在积极找工作吗？"
      },
      {
        "speaker": "You",
        "en": "Yeah, I'm currently wrapping things up at my current gig. My last day is in two weeks.",
        "cn": "是的，我正在现在的公司收尾。再过两周就是最后一天了。"
      },
      {
        "speaker": "HR",
        "en": "Perfect timing then. Can I ask about your salary expectations? Just wanna make sure we're in the same ballpark.",
        "cn": "那时间刚好。方便问一下你的薪资期望吗？就想确认我们大致在同一个范围内。"
      },
      {
        "speaker": "You",
        "en": "I'm looking at something in the range of 140 to 160K, depending on the overall comp package.",
        "cn": "我期望大概在14万到16万之间，具体取决于整体薪酬方案。"
      },
      {
        "speaker": "HR",
        "en": "Okay, that's within our range, so that's good. We also offer equity and a pretty solid benefits package.",
        "cn": "好的，这在我们的范围内，挺好的。我们还提供股权和相当不错的福利。"
      },
      {
        "speaker": "You",
        "en": "That sounds really appealing. I'd love to hear more about that down the line.",
        "cn": "听起来很吸引人。我很想在后续了解更多细节。"
      },
      {
        "speaker": "HR",
        "en": "Absolutely. So next steps — I'd like to set you up with a technical interview with the team lead. How does next Tuesday work?",
        "cn": "当然。接下来——我想安排你和技术负责人做一次技术面试。下周二方便吗？"
      },
      {
        "speaker": "You",
        "en": "Tuesday works great for me. Morning or afternoon?",
        "cn": "周二没问题。上午还是下午？"
      },
      {
        "speaker": "HR",
        "en": "Let's say 2 PM Pacific. It'll be a video call, about an hour long. I'll send you the link.",
        "cn": "定在太平洋时间下午两点吧。视频面试，大概一个小时。我会把链接发给你。"
      },
      {
        "speaker": "You",
        "en": "Sounds perfect. Should I prepare anything specific for it?",
        "cn": "太好了。我需要为此做什么特别的准备吗？"
      },
      {
        "speaker": "HR",
        "en": "Just brush up on system design stuff and maybe review some of your past projects to talk through. Nothing too crazy.",
        "cn": "复习一下系统设计方面的东西，回顾一下你之前的项目以便讨论就行。没什么太难的。"
      },
      {
        "speaker": "You",
        "en": "Will do. Thanks so much, Sarah. Really appreciate you reaching out, and I'm excited about this opportunity!",
        "cn": "好的。非常感谢你，Sarah。很感谢你的联系，我对这个机会非常期待！"
      }
    ]
  },
  {
    "id": "job-interview-2",
    "cat": "job",
    "catName": "求职面试",
    "catEmoji": "💼",
    "title": "Behavioral Interview Questions",
    "titleCn": "行为面试问题",
    "emoji": "🗣️",
    "lines": [
      {
        "speaker": "Interviewer",
        "en": "Alright, so this part of the interview is gonna focus on behavioral questions. We use the STAR method here — you familiar with that?",
        "cn": "好的，面试的这个环节主要是行为面试问题。我们这里用STAR方法——你了解吗？"
      },
      {
        "speaker": "You",
        "en": "Yeah, Situation, Task, Action, Result. I've done a bit of prep on that, so fire away!",
        "cn": "了解，就是情境、任务、行动、结果。我做了一些准备，尽管问吧！"
      },
      {
        "speaker": "Interviewer",
        "en": "Great. Tell me about a time you had to deal with a really difficult coworker.",
        "cn": "好的。跟我说说你和一个很难相处的同事打交道的经历。"
      },
      {
        "speaker": "You",
        "en": "Oh man, yeah. So at my last job, there was this guy on my team who would constantly push back on every single idea in meetings.",
        "cn": "哦天，确实有过。在上一份工作中，我们团队有个人在会上对每个想法都要反驳。"
      },
      {
        "speaker": "Interviewer",
        "en": "That sounds frustrating. How'd you handle it?",
        "cn": "听起来很让人头疼。你是怎么处理的？"
      },
      {
        "speaker": "You",
        "en": "I pulled him aside after a meeting and just had a one-on-one. Turns out he felt like his ideas weren't being heard.",
        "cn": "我在一次会后把他拉到一边，就我们俩聊了聊。结果发现他觉得自己的想法没人重视。"
      },
      {
        "speaker": "Interviewer",
        "en": "Interesting. And what was the outcome?",
        "cn": "有意思。那最后结果怎样？"
      },
      {
        "speaker": "You",
        "en": "We actually ended up becoming a pretty solid team after that. I made sure to loop him in earlier on decisions, and he chilled out a lot.",
        "cn": "后来我们的合作其实变得相当好。我会提前让他参与决策，他也放松了很多。"
      },
      {
        "speaker": "Interviewer",
        "en": "Nice. Okay, next one. Can you describe a situation where you failed at something?",
        "cn": "不错。好，下一个问题。能描述一个你失败的经历吗？"
      },
      {
        "speaker": "You",
        "en": "Ugh, yeah. I once totally underestimated the scope of a project and missed the deadline by like two weeks.",
        "cn": "唉，有的。我曾经完全低估了一个项目的规模，结果比截止日期晚了大概两周。"
      },
      {
        "speaker": "Interviewer",
        "en": "That happens. What did you learn from it?",
        "cn": "这种事会发生的。你从中学到了什么？"
      },
      {
        "speaker": "You",
        "en": "I learned to always pad my estimates and to break projects into smaller milestones. Now I do weekly check-ins to make sure things stay on track.",
        "cn": "我学会了做预估时要留出余量，并把项目拆成更小的里程碑。现在我会每周检查进度确保不偏离轨道。"
      },
      {
        "speaker": "Interviewer",
        "en": "Smart. How about leadership? Give me an example of when you stepped up to lead something.",
        "cn": "聪明。那关于领导力呢？举个你主动承担领导角色的例子。"
      },
      {
        "speaker": "You",
        "en": "So there was this time our team lead went on parental leave, and nobody was really taking charge. I kind of just naturally stepped in.",
        "cn": "有一次我们的团队负责人休产假了，没人真正挑大梁。我就自然而然地顶上去了。"
      },
      {
        "speaker": "Interviewer",
        "en": "What specifically did you do?",
        "cn": "你具体做了什么？"
      },
      {
        "speaker": "You",
        "en": "I organized our standups, prioritized the backlog, and made sure everyone knew what they were working on. Kept the ship running, basically.",
        "cn": "我组织了每日站会，整理了需求优先级，确保每个人都知道自己在做什么。基本上就是保证团队正常运转。"
      },
      {
        "speaker": "Interviewer",
        "en": "And how did the team respond to you stepping up like that?",
        "cn": "那团队对你这样站出来有什么反应？"
      },
      {
        "speaker": "You",
        "en": "Honestly, they were super supportive. I think they were just relieved someone was keeping things organized. We actually hit all our sprint goals that quarter.",
        "cn": "说实话，他们都非常支持。我觉得他们就是很高兴有人在维持秩序。那个季度我们实际上完成了所有冲刺目标。"
      },
      {
        "speaker": "Interviewer",
        "en": "That's really impressive. I think that tells me a lot about your work style. Last question — why should we hire you?",
        "cn": "真的很棒。我觉得这很好地展示了你的工作风格。最后一个问题——我们为什么要录用你？"
      },
      {
        "speaker": "You",
        "en": "I'm someone who doesn't just do the work — I care about the people and the process. I bring energy, I solve problems, and I make teams better. Simple as that.",
        "cn": "我不只是埋头干活——我关心团队成员和工作流程。我带来活力，解决问题，让团队变得更好。就这么简单。"
      }
    ]
  },
  {
    "id": "job-interview-3",
    "cat": "job",
    "catName": "求职面试",
    "catEmoji": "💼",
    "title": "Salary Negotiation",
    "titleCn": "薪资谈判",
    "emoji": "💰",
    "lines": [
      {
        "speaker": "HR",
        "en": "So Alex, we're really excited to extend an offer to you. Let me walk you through the details.",
        "cn": "Alex，我们很高兴向你发出录用通知。让我跟你详细说说。"
      },
      {
        "speaker": "You",
        "en": "Thank you so much! I'm really thrilled to hear that. I'd love to go over everything.",
        "cn": "非常感谢！听到这个消息我真的很激动。我想详细了解一下。"
      },
      {
        "speaker": "HR",
        "en": "The base salary we're offering is 130K, plus a 10% annual bonus and standard benefits.",
        "cn": "我们提供的基本工资是13万，加上10%的年度奖金和标准福利。"
      },
      {
        "speaker": "You",
        "en": "I appreciate the offer. Can I be honest with you? I was hoping the base would be a bit higher given my experience.",
        "cn": "感谢这个报价。我能坦诚地说吗？考虑到我的经验，我原本期望底薪能更高一些。"
      },
      {
        "speaker": "HR",
        "en": "Sure, I totally understand. What number did you have in mind?",
        "cn": "当然，我完全理解。你心里期望的数字是多少？"
      },
      {
        "speaker": "You",
        "en": "Based on my research and the market rate for this role, I was thinking more in the 145 to 150 range.",
        "cn": "根据我的调查和这个职位的市场行情，我想的是大概14.5万到15万的范围。"
      },
      {
        "speaker": "HR",
        "en": "Hmm, that's a bit above our initial range. Let me see what I can do. Can I ask what's driving that number?",
        "cn": "嗯，这有点超出我们最初的范围。我看看能怎么做。你能说说这个数字的依据吗？"
      },
      {
        "speaker": "You",
        "en": "Absolutely. I've got five years of directly relevant experience, and my last role was paying 135. I think the jump is justified for the responsibilities here.",
        "cn": "当然。我有五年的直接相关经验，上一份工作薪资是13.5万。考虑到这个职位的职责，我觉得涨幅是合理的。"
      },
      {
        "speaker": "HR",
        "en": "That's fair. What if we met in the middle — say 140K base, and we could bump the signing bonus to 15K?",
        "cn": "有道理。如果我们折中一下呢——底薪14万，然后签约奖金提高到1.5万？"
      },
      {
        "speaker": "You",
        "en": "That's definitely moving in the right direction. What about the equity component? Is there any flexibility there?",
        "cn": "这确实在往好的方向走。那股权部分呢？那方面有灵活性吗？"
      },
      {
        "speaker": "HR",
        "en": "We could potentially increase the RSU grant from 50K to 65K vesting over four years. How does that sound?",
        "cn": "我们可以把RSU的授予量从5万提高到6.5万，四年归属。你觉得怎么样？"
      },
      {
        "speaker": "You",
        "en": "Now we're talking. What about remote work flexibility? That's actually really important to me.",
        "cn": "这就对了。那远程办公的灵活性呢？这对我来说真的很重要。"
      },
      {
        "speaker": "HR",
        "en": "We do hybrid — three days in office, two from home. But for the right candidate, we can be flexible on that.",
        "cn": "我们是混合办公——三天去办公室，两天居家。不过对于合适的候选人，这方面可以灵活一些。"
      },
      {
        "speaker": "You",
        "en": "Would two days in office be possible? I'm super productive working from home and I've got a long commute.",
        "cn": "能改成两天去办公室吗？我在家办公效率很高，而且通勤时间很长。"
      },
      {
        "speaker": "HR",
        "en": "I think we can make that work, especially since your team lead is mostly remote anyway.",
        "cn": "我觉得可以安排，尤其是你的团队负责人本来也主要是远程的。"
      },
      {
        "speaker": "You",
        "en": "That's huge for me, honestly. One more thing — what does the PTO situation look like?",
        "cn": "这对我来说真的太重要了。还有一件事——休假制度是怎样的？"
      },
      {
        "speaker": "HR",
        "en": "We offer unlimited PTO, but realistically most people take about three to four weeks. No one's gonna judge you for taking time off.",
        "cn": "我们提供无限休假，但实际上大多数人大概休三到四周。没人会因为你休假而说什么。"
      },
      {
        "speaker": "You",
        "en": "That's really good to know. Okay, so just to recap — 140K base, 15K signing bonus, 65K in RSUs, and a two-day in-office schedule?",
        "cn": "这真的很好。那我总结一下——底薪14万，签约奖金1.5万，RSU 6.5万，每周去办公室两天？"
      },
      {
        "speaker": "HR",
        "en": "That's right. I'll get the revised offer letter over to you by end of day tomorrow. Sound good?",
        "cn": "没错。我明天下班前把修改后的录用信发给你。可以吗？"
      },
      {
        "speaker": "You",
        "en": "Sounds perfect. I really appreciate you working with me on this, Sarah. I'm super excited to join the team!",
        "cn": "太好了。非常感谢你的配合，Sarah。我真的非常期待加入团队！"
      }
    ]
  },
  {
    "id": "job-interview-4",
    "cat": "job",
    "catName": "求职面试",
    "catEmoji": "💼",
    "title": "Technical Interview",
    "titleCn": "技术面试",
    "emoji": "💻",
    "lines": [
      {
        "speaker": "Interviewer",
        "en": "Hey Alex, welcome. I'm Dan, the engineering lead. Today we're gonna do some system design and a coding problem. Cool?",
        "cn": "嗨Alex，欢迎。我是Dan，工程负责人。今天我们会做一些系统设计和一道编程题。可以吗？"
      },
      {
        "speaker": "You",
        "en": "Sounds great, Dan. I'm ready to go. Should we dive right in?",
        "cn": "好的，Dan。我准备好了。我们直接开始吧？"
      },
      {
        "speaker": "Interviewer",
        "en": "Yeah, let's do it. So imagine you're designing a URL shortener — like a simplified version of Bitly. How would you approach that?",
        "cn": "好，开始吧。假设你要设计一个短链接服务——类似简化版的Bitly。你会怎么做？"
      },
      {
        "speaker": "You",
        "en": "Okay, first I'd wanna clarify some requirements. Are we talking about just the core shortening, or also analytics and custom URLs?",
        "cn": "好的，我先确认一下需求。我们是只做核心的短链接功能，还是也包括数据分析和自定义链接？"
      },
      {
        "speaker": "Interviewer",
        "en": "Good question. Let's start with just the core — create a short URL and redirect. We can add analytics after.",
        "cn": "好问题。先从核心功能开始——创建短链接并重定向。之后可以加分析功能。"
      },
      {
        "speaker": "You",
        "en": "Got it. So I'd use a hash function to generate a unique key, store the mapping in a database, and when someone hits the short URL, we look it up and redirect.",
        "cn": "明白了。那我会用哈希函数生成一个唯一键值，把映射关系存到数据库里，当有人访问短链接时，查询并重定向。"
      },
      {
        "speaker": "Interviewer",
        "en": "What about collisions with the hash function? How would you handle that?",
        "cn": "那哈希碰撞怎么办？你怎么处理？"
      },
      {
        "speaker": "You",
        "en": "I'd check for collisions before writing to the database. If there's a conflict, I'd regenerate with a salt or just increment and retry. Could also use a counter-based approach instead.",
        "cn": "写入数据库之前先检查碰撞。如果有冲突，就加盐重新生成，或者递增后重试。也可以用基于计数器的方式。"
      },
      {
        "speaker": "Interviewer",
        "en": "Nice. What database would you use and why?",
        "cn": "不错。你会用什么数据库，为什么？"
      },
      {
        "speaker": "You",
        "en": "For this, I'd go with something like DynamoDB or Redis for the lookups since we need super low latency. Maybe Postgres as a backing store for durability.",
        "cn": "对于这种场景，我会用DynamoDB或Redis做查询，因为需要极低延迟。可能再用Postgres作为持久化的后端存储。"
      },
      {
        "speaker": "Interviewer",
        "en": "Solid. How would you handle scaling if this thing blows up and gets millions of requests per second?",
        "cn": "靠谱。如果这个服务火了，每秒有上百万请求，你怎么扩展？"
      },
      {
        "speaker": "You",
        "en": "I'd put a load balancer out front, use horizontal scaling for the application layer, and lean heavily on caching. Most short URL lookups are read-heavy, so a CDN layer would help a ton.",
        "cn": "我会在前面放一个负载均衡器，应用层做水平扩展，并大量使用缓存。短链接查询主要是读操作，所以CDN层会很有帮助。"
      },
      {
        "speaker": "Interviewer",
        "en": "Love it. Alright, let's switch gears to the coding portion. You can use whatever language you're comfortable with.",
        "cn": "很好。好的，我们转到编码环节吧。你可以用你熟悉的任何语言。"
      },
      {
        "speaker": "You",
        "en": "I'll go with Python if that's cool. It's what I think fastest in.",
        "cn": "如果可以的话我用Python。这是我思考最快的语言。"
      },
      {
        "speaker": "Interviewer",
        "en": "Totally fine. So here's the problem: given a list of meeting time intervals, find the minimum number of conference rooms required.",
        "cn": "完全没问题。题目是这样的：给定一组会议时间区间，求最少需要多少间会议室。"
      },
      {
        "speaker": "You",
        "en": "Classic! So I'd sort the intervals by start time, then use a min-heap to track end times of ongoing meetings. Let me code it up.",
        "cn": "经典题！我会按开始时间排序，然后用最小堆来追踪正在进行的会议的结束时间。我来写代码。"
      },
      {
        "speaker": "Interviewer",
        "en": "Walk me through your logic as you write it.",
        "cn": "写的时候跟我说说你的思路。"
      },
      {
        "speaker": "You",
        "en": "Sure. So for each meeting, I check if its start time is after the earliest ending meeting. If so, that room is freed up, so I pop the heap. Either way, I push the new end time. The heap size at any point is the number of rooms needed.",
        "cn": "好的。对于每个会议，我检查它的开始时间是否在最早结束的会议之后。如果是，那个房间就空出来了，弹出堆顶。不管怎样，都把新的结束时间压入堆。堆的大小就是需要的房间数。"
      },
      {
        "speaker": "Interviewer",
        "en": "That's exactly right. And what's the time complexity here?",
        "cn": "完全正确。那这个算法的时间复杂度是多少？"
      },
      {
        "speaker": "You",
        "en": "O of n log n — the sort is n log n, and each heap operation is log n with n meetings. Space is O of n for the heap in the worst case.",
        "cn": "O(n log n)——排序是n log n，每次堆操作是log n，有n个会议。空间复杂度最坏情况下是O(n)，用于存堆。"
      }
    ]
  },
  {
    "id": "job-interview-5",
    "cat": "job",
    "catName": "求职面试",
    "catEmoji": "💼",
    "title": "Following Up After Interview",
    "titleCn": "面试后跟进",
    "emoji": "📧",
    "lines": [
      {
        "speaker": "Friend",
        "en": "Hey, how'd the interview go yesterday? You were super nervous about it.",
        "cn": "嘿，昨天面试怎么样？你之前特别紧张。"
      },
      {
        "speaker": "You",
        "en": "Dude, I think it went really well actually! The vibe was great and we totally clicked.",
        "cn": "老兄，我觉得真的很顺利！氛围很好，我们聊得特别投机。"
      },
      {
        "speaker": "Friend",
        "en": "That's awesome! Did you send a thank-you email yet? You gotta do that like right away.",
        "cn": "太棒了！你发感谢邮件了吗？这个要立刻发。"
      },
      {
        "speaker": "You",
        "en": "I know, I know. I'm actually drafting one right now. How does this sound — \"Dear Dan, thank you for taking the time...\"",
        "cn": "我知道，我知道。我正在写呢。你觉得这样怎么样——\"亲爱的Dan，感谢您抽出时间……\""
      },
      {
        "speaker": "Friend",
        "en": "Hmm, that's kinda generic though. You should mention something specific you guys talked about.",
        "cn": "嗯，不过这有点太笼统了。你应该提到你们聊的一些具体内容。"
      },
      {
        "speaker": "You",
        "en": "Good call. We had this whole conversation about their microservices migration. I could reference that.",
        "cn": "说得对。我们聊了很多关于他们微服务迁移的事。我可以提到这个。"
      },
      {
        "speaker": "Friend",
        "en": "Yeah, that's way better. Shows you were actually paying attention and engaged.",
        "cn": "对，那就好多了。说明你确实在认真听而且很投入。"
      },
      {
        "speaker": "You",
        "en": "Okay, done. Just sent it. Now comes the hard part — waiting. They said they'd get back to me within a week.",
        "cn": "好了，搞定了。刚发出去。现在最难的部分来了——等消息。他们说一周内给我回复。"
      },
      {
        "speaker": "Friend",
        "en": "A week? That's not bad. Some places ghost you for like a month.",
        "cn": "一周？还行。有些公司能让你等一个月都不回。"
      },
      {
        "speaker": "You",
        "en": "Tell me about it. My last job hunt, I waited three weeks and then got a rejection email at like 11 PM on a Friday. So brutal.",
        "cn": "可不是嘛。上次找工作，我等了三周，然后周五晚上十一点收到了拒信。太残忍了。"
      },
      {
        "speaker": "Friend",
        "en": "Oof. Well, if you don't hear back after a week, are you gonna follow up?",
        "cn": "哎。那如果一周后没消息，你会主动跟进吗？"
      },
      {
        "speaker": "You",
        "en": "Definitely. I'll send a polite check-in email. Something like \"just wanted to touch base on the timeline.\"",
        "cn": "肯定会。我会发一封礼貌的跟进邮件。类似\"想确认一下进度安排\"之类的。"
      },
      {
        "speaker": "Friend",
        "en": "Smart. Don't be too pushy though. Nobody likes a desperate candidate.",
        "cn": "聪明。不过别太急切了。没人喜欢看起来很急的候选人。"
      },
      {
        "speaker": "You",
        "en": "For sure. I'll keep it casual and professional. By the way, should I connect with the interviewer on LinkedIn?",
        "cn": "当然。我会保持随意但专业的语气。对了，我要不要在LinkedIn上加面试官好友？"
      },
      {
        "speaker": "Friend",
        "en": "I'd wait until after you hear back. If you get the job, then add them. Otherwise it might be a little awkward.",
        "cn": "我觉得等有消息了再说。如果拿到了offer就加。不然可能有点尴尬。"
      },
      {
        "speaker": "You",
        "en": "Yeah, you're probably right. Okay, I'm also still applying to other places just in case. Gotta keep my options open.",
        "cn": "嗯，你说得对。好吧，我也在继续投其他公司以防万一。得多留几条后路。"
      },
      {
        "speaker": "Friend",
        "en": "That's the move. Never put all your eggs in one basket. How many other applications do you have out?",
        "cn": "这才对。永远别把鸡蛋放在一个篮子里。你还投了多少家？"
      },
      {
        "speaker": "You",
        "en": "Like five or six. Got another phone screen tomorrow actually, so I should probably prep for that too.",
        "cn": "大概五六家吧。明天其实还有一个电话面试，我也得准备一下。"
      },
      {
        "speaker": "Friend",
        "en": "You're on fire, dude. I have a good feeling about TechCorp though. Fingers crossed!",
        "cn": "你状态太好了，老兄。不过我对TechCorp有预感。祝你好运！"
      },
      {
        "speaker": "You",
        "en": "Thanks, man. I'll let you know as soon as I hear anything. Wish me luck!",
        "cn": "谢啦，兄弟。一有消息我就告诉你。祝我好运吧！"
      }
    ]
  },
  {
    "id": "travel-hotel-1",
    "cat": "travel",
    "catName": "景点旅游",
    "catEmoji": "🌍",
    "title": "Checking Into a Hotel",
    "titleCn": "酒店入住",
    "emoji": "🏨",
    "lines": [
      {
        "speaker": "You",
        "en": "Hi there! I have a reservation under the name Alex Chen. Checking in for two nights.",
        "cn": "你好！我有一个预订，名字是Alex Chen。入住两晚。"
      },
      {
        "speaker": "Receptionist",
        "en": "Welcome! Let me pull that up... Yep, I see it right here. A king room with a city view, is that right?",
        "cn": "欢迎！让我查一下……好的，找到了。大床房，城市景观，对吗？"
      },
      {
        "speaker": "You",
        "en": "That's the one. Actually, is there any chance I could get a higher floor? I'm kind of a view junkie.",
        "cn": "对的。对了，有没有可能安排一个高一点的楼层？我特别喜欢看风景。"
      },
      {
        "speaker": "Receptionist",
        "en": "Let me check... I've got a room on the 18th floor. Same room type. Want me to switch you over?",
        "cn": "我看看……18楼有一间，同样的房型。要不要帮你换过去？"
      },
      {
        "speaker": "You",
        "en": "That would be amazing, thank you! By the way, what time is checkout?",
        "cn": "那太好了，谢谢！顺便问一下，退房时间是几点？"
      },
      {
        "speaker": "Receptionist",
        "en": "Checkout is at 11 AM, but we can do a late checkout until 1 PM if you let us know the night before.",
        "cn": "退房时间是上午11点，但如果你提前一晚告诉我们，可以延迟到下午1点。"
      },
      {
        "speaker": "You",
        "en": "Good to know. And is breakfast included with my rate?",
        "cn": "好的。那我的房价含早餐吗？"
      },
      {
        "speaker": "Receptionist",
        "en": "It sure is! Breakfast is served in the restaurant on the second floor from 6:30 to 10 AM.",
        "cn": "当然含的！早餐在二楼的餐厅供应，时间是早上6:30到10点。"
      },
      {
        "speaker": "You",
        "en": "Perfect. Oh, one more thing — is there a gym or pool in the hotel?",
        "cn": "太好了。哦，还有一件事——酒店有健身房或泳池吗？"
      },
      {
        "speaker": "Receptionist",
        "en": "We've got both! The gym is on the 3rd floor, open 24/7. The pool is on the rooftop and closes at 10 PM.",
        "cn": "都有！健身房在3楼，24小时开放。泳池在顶楼，晚上10点关闭。"
      },
      {
        "speaker": "You",
        "en": "A rooftop pool? No way, that's so cool. Do I need to bring my own towels?",
        "cn": "天台泳池？太酷了吧。我需要自带毛巾吗？"
      },
      {
        "speaker": "Receptionist",
        "en": "Nope, we provide towels up there. Just bring your key card for access.",
        "cn": "不用，我们上面备有毛巾。带上房卡刷卡进入就行。"
      },
      {
        "speaker": "You",
        "en": "Awesome. Can I get an extra key card for my partner? She'll be joining me later tonight.",
        "cn": "太好了。能多给我一张房卡吗？我女朋友今晚晚些时候会过来。"
      },
      {
        "speaker": "Receptionist",
        "en": "Of course! Here are two key cards for you. Your room is 1815 — elevators are right around the corner to your left.",
        "cn": "当然！给你两张房卡。你的房间是1815——电梯在你左边拐角处。"
      },
      {
        "speaker": "You",
        "en": "Thanks. Is there WiFi? What's the password?",
        "cn": "谢谢。有WiFi吗？密码是什么？"
      },
      {
        "speaker": "Receptionist",
        "en": "WiFi is complimentary. The network is \"HotelGuest\" and the password is on the card sleeve for your key card.",
        "cn": "WiFi是免费的。网络名是\"HotelGuest\"，密码印在房卡套上。"
      },
      {
        "speaker": "You",
        "en": "Oh nice, that's convenient. Any restaurant recommendations nearby for dinner?",
        "cn": "真方便。附近有什么推荐的餐厅可以吃晚饭吗？"
      },
      {
        "speaker": "Receptionist",
        "en": "There's a great Italian place two blocks down called Lucia's. Super popular with guests. Want me to make a reservation?",
        "cn": "往前走两个街区有一家叫Lucia's的意大利餐厅，很受住客欢迎。要我帮你订位吗？"
      },
      {
        "speaker": "You",
        "en": "That would be great! A table for two around 7:30 if possible.",
        "cn": "太好了！如果可以的话，7:30左右两个人的位子。"
      },
      {
        "speaker": "Receptionist",
        "en": "I'll get that set up for you. Enjoy your stay, Mr. Chen! Don't hesitate to call the front desk if you need anything.",
        "cn": "我帮你安排。祝您入住愉快，Chen先生！有任何需要随时打前台电话。"
      }
    ]
  },
  {
    "id": "travel-tour-1",
    "cat": "travel",
    "catName": "景点旅游",
    "catEmoji": "🌍",
    "title": "Booking a Guided Tour",
    "titleCn": "预约导游",
    "emoji": "🗺️",
    "lines": [
      {
        "speaker": "You",
        "en": "Hi! I'm looking to book a guided tour of the city. What do you guys have available?",
        "cn": "你好！我想预约一个城市导览。你们有什么可以选的？"
      },
      {
        "speaker": "Agent",
        "en": "Hey there! We've got a few options. There's a walking tour, a bus tour, and a food tour. How much time do you have?",
        "cn": "你好！我们有几个选择。有步行游、巴士游和美食游。你有多少时间？"
      },
      {
        "speaker": "You",
        "en": "I've got a full day, so I'm flexible. What's the most popular one?",
        "cn": "我有一整天，所以比较灵活。最受欢迎的是哪个？"
      },
      {
        "speaker": "Agent",
        "en": "Hands down, the food tour. It's four hours, you hit like six different spots, and you get to try all the local stuff. People go nuts for it.",
        "cn": "毫无疑问是美食游。四个小时，走六个不同的地方，能尝遍所有当地美食。大家都超喜欢。"
      },
      {
        "speaker": "You",
        "en": "That sounds right up my alley. How much does it run?",
        "cn": "听起来很适合我。多少钱？"
      },
      {
        "speaker": "Agent",
        "en": "It's 85 bucks per person. That includes all the food tastings and a drink at each stop.",
        "cn": "每人85美元。包含所有的试吃和每站一杯饮料。"
      },
      {
        "speaker": "You",
        "en": "Not bad at all. Is there one available tomorrow morning?",
        "cn": "还真不贵。明天上午有吗？"
      },
      {
        "speaker": "Agent",
        "en": "Let me check... Yep, there's a 10 AM slot with spots open. It starts at the central market.",
        "cn": "我看看……有的，上午10点有一场还有空位。起点在中央市场。"
      },
      {
        "speaker": "You",
        "en": "Sweet. I'll take two spots — my girlfriend and I. Do we need to bring anything?",
        "cn": "太好了。我订两个位——我和我女朋友。我们需要带什么吗？"
      },
      {
        "speaker": "Agent",
        "en": "Just comfy shoes and an empty stomach! Oh, and maybe an umbrella — the forecast says there might be some drizzle.",
        "cn": "穿舒服的鞋子、空着肚子来就行！哦，最好带把伞——天气预报说可能有小雨。"
      },
      {
        "speaker": "You",
        "en": "Ha, will do. How big are the groups usually?",
        "cn": "哈，好的。团通常多大？"
      },
      {
        "speaker": "Agent",
        "en": "We cap it at twelve people, so it stays pretty intimate. Your guide can actually chat with everyone.",
        "cn": "我们上限是十二个人，所以比较有亲密感。导游能跟每个人交流。"
      },
      {
        "speaker": "You",
        "en": "That's way better than those massive tour buses. Can I pay now or at the meeting point?",
        "cn": "那比那种大巴旅行团好多了。我现在付还是到集合点再付？"
      },
      {
        "speaker": "Agent",
        "en": "Either works, but if you pay now you're locked in and don't have to worry about it selling out.",
        "cn": "都可以，但现在付的话就确定了，不用担心卖完。"
      },
      {
        "speaker": "You",
        "en": "Makes sense. I'll go ahead and pay now. Do you take credit cards?",
        "cn": "有道理。那我现在就付吧。你们收信用卡吗？"
      },
      {
        "speaker": "Agent",
        "en": "Yep, Visa, Mastercard, Amex — we take 'em all. Also Apple Pay if that's your thing.",
        "cn": "收的，Visa、万事达、美国运通——都可以。也支持Apple Pay。"
      },
      {
        "speaker": "You",
        "en": "I'll tap with my phone then. There we go. So where exactly do we meet tomorrow?",
        "cn": "那我手机刷一下吧。好了。那明天具体在哪集合？"
      },
      {
        "speaker": "Agent",
        "en": "Right at the main entrance of the central market. Look for the guide wearing an orange hat — that's Marco, he's awesome.",
        "cn": "就在中央市场正门。找戴橙色帽子的导游——那是Marco，人超好的。"
      },
      {
        "speaker": "You",
        "en": "Got it — orange hat, main entrance, 10 AM. And we should get there a little early, right?",
        "cn": "记住了——橙色帽子，正门，上午10点。我们应该稍微早到一点吧？"
      },
      {
        "speaker": "Agent",
        "en": "Yeah, like five or ten minutes early is perfect. You're gonna have a blast, trust me!",
        "cn": "对，早到五到十分钟就好。相信我，你们会玩得很开心的！"
      }
    ]
  },
  {
    "id": "travel-photo-1",
    "cat": "travel",
    "catName": "景点旅游",
    "catEmoji": "🌍",
    "title": "Asking Someone to Take a Photo",
    "titleCn": "请人拍照",
    "emoji": "📸",
    "lines": [
      {
        "speaker": "You",
        "en": "Excuse me! Sorry to bother you. Would you mind taking a picture of us?",
        "cn": "打扰一下！不好意思。你介意帮我们拍张照吗？"
      },
      {
        "speaker": "Stranger",
        "en": "Oh, not at all! Happy to help. Just hand me your phone.",
        "cn": "哦，当然不介意！很乐意帮忙。把手机给我就行。"
      },
      {
        "speaker": "You",
        "en": "Awesome, thanks! Here you go. The camera's already open. Just tap that big white button.",
        "cn": "太好了，谢谢！给你。相机已经打开了。按那个大白色按钮就行。"
      },
      {
        "speaker": "Stranger",
        "en": "Got it. Okay, scoot in a little closer together... there ya go. Ready? One, two, three!",
        "cn": "好的。你们靠近一点……对对。准备好了？一、二、三！"
      },
      {
        "speaker": "You",
        "en": "Thank you! Let me check it real quick... Oh man, that's actually a really good shot!",
        "cn": "谢谢！我看一下……哇，拍得真好！"
      },
      {
        "speaker": "Stranger",
        "en": "Oh good! Want me to take another one just in case? Sometimes I blink at the wrong moment, haha.",
        "cn": "那就好！要不要我再拍一张以防万一？有时候我会在不对的时候眨眼，哈哈。"
      },
      {
        "speaker": "You",
        "en": "Sure, that'd be great! Maybe a vertical one this time so we can get more of the building behind us?",
        "cn": "好的，那太好了！这次拍竖版的行吗？这样能拍到更多身后的建筑。"
      },
      {
        "speaker": "Stranger",
        "en": "Smart thinking. Alright, back up a tiny bit... perfect. Say cheese!",
        "cn": "聪明。好的，往后退一小步……完美。笑一个！"
      },
      {
        "speaker": "You",
        "en": "Ha, cheese! Okay let me see... yeah, that one's even better. You're a natural photographer!",
        "cn": "哈，茄子！让我看看……嗯，这张更好。你天生就是摄影师！"
      },
      {
        "speaker": "Stranger",
        "en": "Ha, thanks! I do take way too many photos on vacation. Are you guys visiting from out of town?",
        "cn": "哈，谢谢！我度假的时候确实拍太多照片了。你们是从外地来玩的吗？"
      },
      {
        "speaker": "You",
        "en": "Yeah, we're from San Francisco. First time here and this city is blowing our minds.",
        "cn": "对，我们从旧金山来的。第一次来这里，这座城市太让人惊艳了。"
      },
      {
        "speaker": "Stranger",
        "en": "Oh nice! Well you picked a gorgeous day for sightseeing. Have you been to the old quarter yet?",
        "cn": "不错！你们选了个好天气来观光。你们去过老城区了吗？"
      },
      {
        "speaker": "You",
        "en": "Not yet! We were actually trying to figure out where to go next. Is it worth checking out?",
        "cn": "还没有呢！我们正在想下一站去哪里。值得去看看吗？"
      },
      {
        "speaker": "Stranger",
        "en": "Oh, a hundred percent. The architecture there is incredible, and there's this amazing little coffee shop on the corner — you can't miss it.",
        "cn": "绝对值得。那里的建筑太美了，拐角处有一家超棒的小咖啡馆——你们一定不能错过。"
      },
      {
        "speaker": "You",
        "en": "Ooh, we love coffee. What's it called?",
        "cn": "我们超爱喝咖啡的。那家店叫什么？"
      },
      {
        "speaker": "Stranger",
        "en": "It's called Café Luna. Get the iced latte — it's to die for. Trust me.",
        "cn": "叫Café Luna。一定要喝他们的冰拿铁——好喝到不行。相信我。"
      },
      {
        "speaker": "You",
        "en": "We're so going there. Hey, do you want us to take a photo of you too? Only fair!",
        "cn": "我们一定去。对了，要不要我们也帮你拍一张？这才公平嘛！"
      },
      {
        "speaker": "Stranger",
        "en": "Aw, that's sweet of you! Sure, why not. Here's my phone.",
        "cn": "你们真贴心！好啊，为什么不呢。给你我的手机。"
      },
      {
        "speaker": "You",
        "en": "Okay, smile big! Got it. And one more for good measure... perfect. Here you go!",
        "cn": "好的，笑大一点！拍好了。再来一张保险一点……完美。还给你！"
      },
      {
        "speaker": "Stranger",
        "en": "These are great! Thanks so much. Enjoy the rest of your trip, and don't forget Café Luna!",
        "cn": "拍得真好！太谢谢了。祝你们旅途愉快，别忘了去Café Luna！"
      }
    ]
  },
  {
    "id": "travel-lost-1",
    "cat": "travel",
    "catName": "景点旅游",
    "catEmoji": "🌍",
    "title": "Getting Lost and Asking Directions",
    "titleCn": "迷路问路",
    "emoji": "🧭",
    "lines": [
      {
        "speaker": "You",
        "en": "Ugh, I think we're totally lost. My phone died and I have no idea where we are.",
        "cn": "天哪，我们好像完全迷路了。手机没电了，我完全不知道在哪。"
      },
      {
        "speaker": "Partner",
        "en": "Let's just ask someone. Hey, excuse me! Could you help us? We're trying to get to the central train station.",
        "cn": "我们问一下人吧。嗨，打扰一下！能帮帮我们吗？我们想去中央火车站。"
      },
      {
        "speaker": "Local",
        "en": "Oh sure! You're actually not that far. It's maybe a fifteen-minute walk from here.",
        "cn": "当然！你们其实不算太远。从这里走大概十五分钟。"
      },
      {
        "speaker": "You",
        "en": "Oh thank god. We've been walking in circles for like thirty minutes. Which way do we go?",
        "cn": "谢天谢地。我们已经绕了大概三十分钟了。往哪个方向走？"
      },
      {
        "speaker": "Local",
        "en": "Okay so, go straight down this street until you hit the big intersection with the traffic light.",
        "cn": "好，沿着这条路一直走，走到有红绿灯的那个大十字路口。"
      },
      {
        "speaker": "You",
        "en": "The one with the traffic light, got it. Then what?",
        "cn": "有红绿灯的那个路口，记住了。然后呢？"
      },
      {
        "speaker": "Local",
        "en": "Take a left there and walk for about two blocks. You'll see a big park on your right — that's the city park.",
        "cn": "在那左转，走大概两个街区。你会看到右边有个大公园——那是城市公园。"
      },
      {
        "speaker": "You",
        "en": "Left at the light, then the park on the right. Okay, and then?",
        "cn": "红绿灯左转，然后公园在右边。好的，然后呢？"
      },
      {
        "speaker": "Local",
        "en": "Keep going past the park and you'll see the station right in front of you. It's a huge building, you literally can't miss it.",
        "cn": "经过公园继续走，你就能看到车站就在正前方。是一个大建筑，绝对不会错过。"
      },
      {
        "speaker": "Partner",
        "en": "That doesn't sound too bad. Is it a safe walk? We're not from around here.",
        "cn": "听起来不难。这条路安全吗？我们不是本地人。"
      },
      {
        "speaker": "Local",
        "en": "Oh yeah, totally safe. It's a main road the whole way. Plus it's still early so there's tons of people around.",
        "cn": "完全安全。全程都是大马路。而且现在还早，到处都有人。"
      },
      {
        "speaker": "You",
        "en": "Great. Hey, is there a place to charge my phone near the station? I really need my maps app.",
        "cn": "太好了。对了，车站附近有没有可以充电的地方？我真的需要用地图。"
      },
      {
        "speaker": "Local",
        "en": "There's a coffee shop right next to the entrance. They've got outlets everywhere. I charge my phone there all the time.",
        "cn": "入口旁边就有一家咖啡店。到处都有插座。我老在那充电。"
      },
      {
        "speaker": "You",
        "en": "Lifesaver! One more question — do you know if the station has a currency exchange?",
        "cn": "救了我一命！再问一个——你知道车站有货币兑换的地方吗？"
      },
      {
        "speaker": "Local",
        "en": "Hmm, I think there's one inside on the main level, but honestly the rates aren't great. You're better off using an ATM.",
        "cn": "嗯，我记得大厅里面有一个，但说实话汇率不太好。你去ATM取钱更划算。"
      },
      {
        "speaker": "You",
        "en": "Good tip. Okay, just to make sure I got it — straight ahead, left at the light, past the park, and boom, there's the station?",
        "cn": "好建议。好的，我确认一下——一直往前走，红绿灯左转，经过公园，然后车站就在那里？"
      },
      {
        "speaker": "Local",
        "en": "That's it! You got it. If you get confused, just look for the tall clock tower — that's the station.",
        "cn": "没错！记对了。如果搞不清方向，就找那个高钟楼——那就是车站。"
      },
      {
        "speaker": "You",
        "en": "A clock tower? Even better. That's way easier to spot. Thank you so much!",
        "cn": "钟楼？那更好找了。太感谢了！"
      },
      {
        "speaker": "Local",
        "en": "No worries at all! Welcome to our city. Hope you enjoy the rest of your visit!",
        "cn": "不客气！欢迎来到我们城市。祝你们玩得开心！"
      },
      {
        "speaker": "You",
        "en": "We will! Everyone here has been so friendly. Thanks again, you're a lifesaver!",
        "cn": "一定会的！这里每个人都特别热情。再次感谢，你真是救星！"
      }
    ]
  },
  {
    "id": "travel-souvenir-1",
    "cat": "travel",
    "catName": "景点旅游",
    "catEmoji": "🌍",
    "title": "Buying Souvenirs",
    "titleCn": "买纪念品",
    "emoji": "🎁",
    "lines": [
      {
        "speaker": "You",
        "en": "Hey, these handmade bracelets are gorgeous! How much are they?",
        "cn": "嗨，这些手工手链好漂亮！多少钱？"
      },
      {
        "speaker": "Vendor",
        "en": "Thanks! Those are 25 dollars each, or I can do two for 40.",
        "cn": "谢谢！每条25美元，或者两条40。"
      },
      {
        "speaker": "You",
        "en": "Ooh, the bundle deal is tempting. My mom and sister would both love these. Do you have them in different colors?",
        "cn": "哦，捆绑优惠很诱人。我妈妈和姐姐都会喜欢的。有不同颜色吗？"
      },
      {
        "speaker": "Vendor",
        "en": "Absolutely! I've got turquoise, coral, and this deep purple one that's been super popular.",
        "cn": "当然有！有绿松石色、珊瑚色，还有这款深紫色的卖得特别好。"
      },
      {
        "speaker": "You",
        "en": "The turquoise and purple ones are stunning. I'll take those two. Actually, what else do you have that'd make a good gift?",
        "cn": "绿松石色和紫色的真好看。我要这两条。对了，你还有什么适合当礼物的？"
      },
      {
        "speaker": "Vendor",
        "en": "We've got these keychains with local landmarks — they're really popular with tourists. Five bucks a pop.",
        "cn": "我们有这种带当地地标的钥匙扣——很受游客欢迎。五美元一个。"
      },
      {
        "speaker": "You",
        "en": "Oh those are cute! I need like five of those for my coworkers. Can you give me a deal if I buy a bunch?",
        "cn": "好可爱！我需要买五个给同事。多买能便宜一点吗？"
      },
      {
        "speaker": "Vendor",
        "en": "For five? I'll do them for 20 bucks total. That's four dollars each — can't beat that!",
        "cn": "五个的话？总共20美元吧。每个四美元——很划算了！"
      },
      {
        "speaker": "You",
        "en": "Deal! Let me pick them out. I want the bridge one, the lighthouse, two of the old town, and the cathedral.",
        "cn": "成交！我来挑一下。我要桥的、灯塔的、两个老城区的，还有大教堂的。"
      },
      {
        "speaker": "Vendor",
        "en": "Great choices. Anything else catching your eye? These magnets are handpainted — they're one of a kind.",
        "cn": "选得好。还有其他看中的吗？这些冰箱贴是手绘的——独一无二。"
      },
      {
        "speaker": "You",
        "en": "Those magnets are really cool actually. How much for those?",
        "cn": "这些冰箱贴确实很酷。多少钱？"
      },
      {
        "speaker": "Vendor",
        "en": "Eight dollars each. They take like two hours to paint, so it's all in the craftsmanship.",
        "cn": "每个八美元。每个要画大概两个小时，都是工艺价值。"
      },
      {
        "speaker": "You",
        "en": "I can tell they're handmade — the detail is amazing. I'll grab two of those as well.",
        "cn": "看得出是手工做的——细节很棒。我也拿两个吧。"
      },
      {
        "speaker": "Vendor",
        "en": "Awesome! So let me add that up... two bracelets, five keychains, and two magnets.",
        "cn": "好的！我算一下……两条手链、五个钥匙扣、两个冰箱贴。"
      },
      {
        "speaker": "You",
        "en": "What's the damage? Hopefully my wallet can survive this.",
        "cn": "总共多少？希望我的钱包还撑得住。"
      },
      {
        "speaker": "Vendor",
        "en": "That'd be 76 bucks total. But since you're buying a bunch, I'll round it down to 70 even. How's that?",
        "cn": "总共76美元。不过你买了这么多，我就凑个整给你70吧。怎么样？"
      },
      {
        "speaker": "You",
        "en": "You're the best! Do you take cards or just cash?",
        "cn": "你太好了！你们收刷卡还是只收现金？"
      },
      {
        "speaker": "Vendor",
        "en": "I can do both. Cards are totally fine — I've got the little square reader right here.",
        "cn": "都可以。刷卡完全没问题——我这有个小方块刷卡器。"
      },
      {
        "speaker": "You",
        "en": "Perfect, I'll tap my card. There we go. Could you wrap the bracelets separately? They're gifts.",
        "cn": "好的，我刷一下卡。好了。能不能把手链分开包装？是送人的。"
      },
      {
        "speaker": "Vendor",
        "en": "Of course! I'll put them in these little gift bags for you. Free of charge. Thanks for shopping with us, enjoy your trip!",
        "cn": "当然！我把它们放进这些小礼品袋里。免费的。谢谢光顾，祝你旅途愉快！"
      }
    ]
  },
  {
    "id": "health-cold-1",
    "cat": "health",
    "catName": "看病就医",
    "catEmoji": "🏥",
    "title": "Seeing a Doctor for a Cold",
    "titleCn": "感冒看医生",
    "emoji": "🤧",
    "lines": [
      {
        "speaker": "Doctor",
        "en": "Hi there. So what brings you in today? The nurse said you're not feeling so hot.",
        "cn": "你好。今天是什么情况呢？护士说你感觉不太舒服。"
      },
      {
        "speaker": "You",
        "en": "Yeah, I've had this really nasty cold for about a week now and it just won't go away.",
        "cn": "是的，我感冒快一周了，一直不见好。"
      },
      {
        "speaker": "Doctor",
        "en": "A whole week, huh? Let's go through your symptoms. What's been bothering you the most?",
        "cn": "一整周了啊。我们来看看你的症状。最困扰你的是什么？"
      },
      {
        "speaker": "You",
        "en": "Mainly this horrible stuffy nose and a sore throat. I also have this annoying cough that keeps me up at night.",
        "cn": "主要是严重的鼻塞和嗓子疼。还有烦人的咳嗽，晚上睡不好。"
      },
      {
        "speaker": "Doctor",
        "en": "Any fever or body aches?",
        "cn": "有发烧或身体酸痛吗？"
      },
      {
        "speaker": "You",
        "en": "I had a low-grade fever the first couple days but that went away. Still feeling pretty achy and wiped out though.",
        "cn": "头两天有点低烧但后来退了。不过身体还是酸痛，感觉很疲惫。"
      },
      {
        "speaker": "Doctor",
        "en": "Got it. Have you been taking anything for it?",
        "cn": "了解了。你有吃什么药吗？"
      },
      {
        "speaker": "You",
        "en": "Just some DayQuil and drinking a ton of water. It helps a little but not much honestly.",
        "cn": "就吃了些DayQuil，喝了大量的水。稍微有点用，但说实话效果不大。"
      },
      {
        "speaker": "Doctor",
        "en": "Okay, let me take a look. Open your mouth and say \"ahh\" for me... Yeah, your throat is pretty red and irritated.",
        "cn": "好的，我看一下。张嘴说\"啊\"……嗯，你的喉咙确实很红，有些发炎。"
      },
      {
        "speaker": "You",
        "en": "Is it anything serious? I was worried it might be strep or something.",
        "cn": "严重吗？我担心会不会是链球菌感染之类的。"
      },
      {
        "speaker": "Doctor",
        "en": "I don't think it's strep, but let me do a quick swab just to rule it out. This'll be a tiny bit uncomfortable.",
        "cn": "我觉得不是链球菌，但我做个快速咽拭子排除一下。可能会有一点不舒服。"
      },
      {
        "speaker": "You",
        "en": "Ugh, I hate the throat swab. But yeah, go for it. Better safe than sorry.",
        "cn": "我最讨厌咽拭子了。但还是做吧。小心驶得万年船。"
      },
      {
        "speaker": "Doctor",
        "en": "All done! That was quick, right? Results will take about five minutes. In the meantime, let me listen to your lungs.",
        "cn": "好了！很快吧？结果大概五分钟出来。这段时间我先听一下你的肺。"
      },
      {
        "speaker": "You",
        "en": "Sure thing. Should I take a deep breath?",
        "cn": "好的。需要深呼吸吗？"
      },
      {
        "speaker": "Doctor",
        "en": "Yep, deep breath in and out... Lungs sound clear, which is great. Okay, so the strep test came back negative.",
        "cn": "对，深吸一口气再呼出……肺部听起来很清楚，这很好。好的，链球菌检测结果是阴性的。"
      },
      {
        "speaker": "You",
        "en": "Oh good. So it's just a regular cold then?",
        "cn": "太好了。那就是普通感冒？"
      },
      {
        "speaker": "Doctor",
        "en": "Looks like it. It's viral, so antibiotics won't help. I'd recommend a good decongestant and some cough suppressant for nighttime.",
        "cn": "看起来是的。是病毒性的，所以抗生素没用。我建议你吃点通鼻药，晚上吃点止咳药。"
      },
      {
        "speaker": "You",
        "en": "Should I take any time off work? I've been trying to push through but I'm pretty miserable.",
        "cn": "需要请假休息吗？我一直在硬撑但确实很难受。"
      },
      {
        "speaker": "Doctor",
        "en": "I'd say take at least a couple days off. Rest is honestly the best medicine right now. Push fluids and get lots of sleep.",
        "cn": "我建议至少休息两天。休息真的是现在最好的药。多喝水，多睡觉。"
      },
      {
        "speaker": "You",
        "en": "Will do, doc. I'll grab some meds on the way home and park myself on the couch. Thanks for seeing me today!",
        "cn": "好的，医生。我回家路上买点药然后就在沙发上躺着。谢谢您今天的诊治！"
      }
    ]
  },
  {
    "id": "health-fever-1",
    "cat": "health",
    "catName": "看病就医",
    "catEmoji": "🏥",
    "title": "Going to Urgent Care with Fever",
    "titleCn": "发烧去急诊",
    "emoji": "🌡️",
    "lines": [
      {
        "speaker": "Nurse",
        "en": "Hi, welcome to urgent care. Can you fill out this form for me? What brings you in today?",
        "cn": "你好，欢迎来到急诊。能帮我填一下这张表吗？今天是什么情况？"
      },
      {
        "speaker": "You",
        "en": "I've had a really high fever since last night. Like 103 degrees. I can barely stand up straight.",
        "cn": "我从昨晚开始高烧。大概103华氏度。几乎站不稳。"
      },
      {
        "speaker": "Nurse",
        "en": "Oh wow, 103 is pretty high. Let's get your vitals first. I'm gonna check your temperature and blood pressure real quick.",
        "cn": "哦，103度确实挺高的。我先量一下你的生命体征。马上测一下体温和血压。"
      },
      {
        "speaker": "You",
        "en": "Yeah, I feel awful. I've also been getting these crazy chills and sweating through my sheets.",
        "cn": "是的，我感觉很难受。还一直打寒战，床单都被汗浸湿了。"
      },
      {
        "speaker": "Nurse",
        "en": "That's rough. Your temp is actually 102.8 right now. Let me get the doctor in here quickly.",
        "cn": "真难受。你现在体温是102.8度。我赶紧让医生过来。"
      },
      {
        "speaker": "Doctor",
        "en": "Hey, I'm Dr. Martinez. The nurse says you've got a nasty fever. When did it start exactly?",
        "cn": "你好，我是Martinez医生。护士说你发了高烧。具体什么时候开始的？"
      },
      {
        "speaker": "You",
        "en": "It hit me like a truck last night around 9 PM. I took some Tylenol but it barely brought it down.",
        "cn": "昨晚大概九点突然就烧起来了。吃了泰诺但几乎没降下来。"
      },
      {
        "speaker": "Doctor",
        "en": "Any other symptoms? Headache, body aches, nausea?",
        "cn": "还有其他症状吗？头疼、身体酸痛、恶心？"
      },
      {
        "speaker": "You",
        "en": "All of the above, actually. My whole body hurts and I threw up once this morning. Plus I have zero appetite.",
        "cn": "都有。全身疼，今早还吐了一次。而且完全没有食欲。"
      },
      {
        "speaker": "Doctor",
        "en": "Have you been around anyone who was sick recently? There's a flu going around right now.",
        "cn": "你最近接触过生病的人吗？现在流感正在流行。"
      },
      {
        "speaker": "You",
        "en": "Come to think of it, yeah. A couple coworkers were out sick last week with the flu.",
        "cn": "你这一说我想起来了。上周有几个同事得了流感请假了。"
      },
      {
        "speaker": "Doctor",
        "en": "That's probably it then. I'm gonna order a rapid flu test and some bloodwork just to be thorough.",
        "cn": "那很可能就是了。我安排一个快速流感检测和一些验血来全面检查一下。"
      },
      {
        "speaker": "You",
        "en": "Okay. Is the flu test the nose swab thing? Because that is not fun.",
        "cn": "好的。流感检测是鼻拭子那个吗？那可不好受。"
      },
      {
        "speaker": "Doctor",
        "en": "Ha, yeah, it's the one nobody likes. But it's quick, I promise. Just a couple seconds of discomfort.",
        "cn": "哈，对，没人喜欢的那个。但很快的，我保证。就难受几秒钟。"
      },
      {
        "speaker": "You",
        "en": "Alright, let's get it over with. Should I also be worried about COVID at this point?",
        "cn": "好吧，赶紧做完吧。我现在还需要担心新冠吗？"
      },
      {
        "speaker": "Doctor",
        "en": "Good thinking. We'll test for that too — the combo test checks for both flu and COVID.",
        "cn": "想得周到。我们也会测的——组合检测同时查流感和新冠。"
      },
      {
        "speaker": "You",
        "en": "Great. How long until we get the results back?",
        "cn": "好。多久出结果？"
      },
      {
        "speaker": "Doctor",
        "en": "About fifteen minutes. In the meantime, I'm gonna give you some ibuprofen to help bring that fever down. You're pretty dehydrated too, so we might do an IV.",
        "cn": "大概十五分钟。这期间我先给你布洛芬帮助退烧。你也挺脱水的，可能需要挂个点滴。"
      },
      {
        "speaker": "You",
        "en": "An IV? Is it that serious? I thought it was just the flu.",
        "cn": "挂点滴？有那么严重吗？我以为就是流感。"
      },
      {
        "speaker": "Doctor",
        "en": "It's more of a precaution. You're running a high fever and vomiting, so your body needs fluids. The IV will get you feeling better way faster than just drinking water. Trust me, you'll feel like a new person.",
        "cn": "主要是预防性的。你高烧还呕吐，身体需要补液。挂点滴会比光喝水恢复快得多。相信我，输完液你会感觉焕然一新。"
      }
    ]
  },
  {
    "id": "health-pharmacy-1",
    "cat": "health",
    "catName": "看病就医",
    "catEmoji": "🏥",
    "title": "Picking Up Prescription",
    "titleCn": "药房取药",
    "emoji": "💊",
    "lines": [
      {
        "speaker": "You",
        "en": "Hi, I'm here to pick up a prescription. Last name is Chen, C-H-E-N.",
        "cn": "你好，我来取处方药。姓Chen，C-H-E-N。"
      },
      {
        "speaker": "Pharmacist",
        "en": "Let me look that up... Chen, Alex? Looks like we've got two prescriptions ready for you.",
        "cn": "我查一下……Alex Chen？看起来你有两个处方药准备好了。"
      },
      {
        "speaker": "You",
        "en": "Two? I think my doctor only called in one — the antibiotics for my sinus infection.",
        "cn": "两个？我记得医生只开了一个——治鼻窦炎的抗生素。"
      },
      {
        "speaker": "Pharmacist",
        "en": "Yep, I've got the amoxicillin, and there's also a nasal spray — fluticasone. Maybe the doctor added it after your visit?",
        "cn": "对，有阿莫西林，还有一个鼻喷雾——氟替卡松。也许是医生在你就诊后加的？"
      },
      {
        "speaker": "You",
        "en": "Oh, that makes sense actually. She did mention something about a spray. How do I take each of these?",
        "cn": "哦，那说得通了。她确实提过什么喷雾。这两种药怎么用？"
      },
      {
        "speaker": "Pharmacist",
        "en": "The amoxicillin is 500 milligrams, three times a day with food. Take it for the full ten days even if you feel better.",
        "cn": "阿莫西林是500毫克，一天三次，随餐服用。即使感觉好了也要吃满十天。"
      },
      {
        "speaker": "You",
        "en": "Got it — don't stop early even if I'm feeling fine. What about the nasal spray?",
        "cn": "明白了——即使好了也不能提前停药。那鼻喷雾呢？"
      },
      {
        "speaker": "Pharmacist",
        "en": "Two sprays in each nostril, once a day. It's a steroid so it takes a few days to kick in. Don't expect instant relief.",
        "cn": "每个鼻孔两喷，一天一次。这是激素类的，需要几天才能起效。别指望立竿见影。"
      },
      {
        "speaker": "You",
        "en": "Okay, good to know. Are there any side effects I should watch out for?",
        "cn": "好的。有什么需要注意的副作用吗？"
      },
      {
        "speaker": "Pharmacist",
        "en": "The antibiotic might upset your stomach a little. Taking it with food should help. Some people get diarrhea — eating yogurt can offset that.",
        "cn": "抗生素可能会有点胃不舒服。随餐吃应该会好些。有些人会拉肚子——吃酸奶可以缓解。"
      },
      {
        "speaker": "You",
        "en": "Yogurt, noted. And can I drink alcohol while on the amoxicillin? I've got a birthday dinner this weekend.",
        "cn": "酸奶，记住了。吃阿莫西林期间能喝酒吗？这周末我有个生日聚餐。"
      },
      {
        "speaker": "Pharmacist",
        "en": "Technically it's not a hard no, but I'd recommend avoiding it. Alcohol can make the side effects worse and slow down your recovery.",
        "cn": "严格来说不是绝对不行，但我建议避免。酒精会加重副作用并减慢恢复。"
      },
      {
        "speaker": "You",
        "en": "Fair enough, I'll play it safe. How much do these cost with my insurance?",
        "cn": "也对，我保险起见不喝了。有保险的话这些多少钱？"
      },
      {
        "speaker": "Pharmacist",
        "en": "Let me run it through... the amoxicillin is a 5 dollar copay, and the nasal spray is 15. So 20 total.",
        "cn": "我查一下……阿莫西林自付5美元，鼻喷雾15美元。总共20美元。"
      },
      {
        "speaker": "You",
        "en": "Oh that's way less than I expected. Last time I picked up meds it was like 60 bucks.",
        "cn": "比我预想的便宜多了。上次拿药花了差不多60美元。"
      },
      {
        "speaker": "Pharmacist",
        "en": "Yeah, these are both generics so they're pretty affordable. Your insurance covers most of it.",
        "cn": "这两种都是仿制药，所以比较实惠。你的保险覆盖了大部分。"
      },
      {
        "speaker": "You",
        "en": "Nice. Oh wait, should I avoid taking these with any of my regular medications? I take daily allergy pills.",
        "cn": "太好了。等等，这些药会不会和我平时吃的药冲突？我每天吃抗过敏药。"
      },
      {
        "speaker": "Pharmacist",
        "en": "Which allergy medication? Cetirizine? Loratadine?",
        "cn": "是哪种抗过敏药？西替利嗪？氯雷他定？"
      },
      {
        "speaker": "You",
        "en": "Zyrtec — so cetirizine, yeah.",
        "cn": "开瑞坦——就是西替利嗪。"
      },
      {
        "speaker": "Pharmacist",
        "en": "You're all good. No interactions there. Just remember — finish all the antibiotics, take them with food, and give me a call if anything feels off. Feel better soon!",
        "cn": "没问题，不会有相互作用。记住——抗生素要全部吃完，随餐服用，有任何不对的地方给我打电话。祝你早日康复！"
      }
    ]
  },
  {
    "id": "health-insurance-1",
    "cat": "health",
    "catName": "看病就医",
    "catEmoji": "🏥",
    "title": "Understanding Health Insurance",
    "titleCn": "了解医疗保险",
    "emoji": "📋",
    "lines": [
      {
        "speaker": "You",
        "en": "Hi, I just started a new job and I'm trying to figure out my health insurance options. I'm honestly kinda confused by all the jargon.",
        "cn": "你好，我刚开始新工作，在研究医疗保险选项。说实话这些术语让我很困惑。"
      },
      {
        "speaker": "HR Rep",
        "en": "Totally get it — insurance stuff can be super overwhelming. Let me break it down for you. We offer two plans: an HMO and a PPO.",
        "cn": "完全理解——保险的事确实让人头大。我给你解释一下。我们有两种方案：HMO和PPO。"
      },
      {
        "speaker": "You",
        "en": "Okay, what's the difference? I keep seeing those terms but I honestly have no idea what they mean.",
        "cn": "好的，有什么区别？我老看到这两个词但真不知道什么意思。"
      },
      {
        "speaker": "HR Rep",
        "en": "So the HMO is cheaper monthly, but you have to pick a primary care doctor and get referrals to see specialists. The PPO costs more but you can see pretty much any doctor.",
        "cn": "HMO每月保费更便宜，但你需要选一个家庭医生，看专科需要转介。PPO费用更高但你基本上可以看任何医生。"
      },
      {
        "speaker": "You",
        "en": "Hmm, I do like flexibility. What's the monthly premium for each one?",
        "cn": "嗯，我确实喜欢灵活性。两种的月保费各是多少？"
      },
      {
        "speaker": "HR Rep",
        "en": "The HMO is 150 a month, and the PPO is 280. But keep in mind the copays and deductibles are different too.",
        "cn": "HMO每月150美元，PPO每月280美元。不过要注意，共付额和免赔额也不一样。"
      },
      {
        "speaker": "You",
        "en": "Okay wait, what's a deductible again? Like, the amount I have to pay before insurance kicks in?",
        "cn": "等一下，免赔额是什么来着？就是保险开始报销之前我要自己付的金额吗？"
      },
      {
        "speaker": "HR Rep",
        "en": "Exactly! The HMO has a 500 dollar deductible and the PPO has a 1,500 dollar deductible. After that, insurance covers most things.",
        "cn": "没错！HMO的免赔额是500美元，PPO的是1500美元。之后保险就覆盖大部分了。"
      },
      {
        "speaker": "You",
        "en": "And the copay is what I pay each time I go to the doctor, right?",
        "cn": "那共付额就是我每次看医生要付的钱，对吧？"
      },
      {
        "speaker": "HR Rep",
        "en": "Bingo. With the HMO it's 20 bucks per visit, and with the PPO it's 40. But with the PPO you don't need referrals.",
        "cn": "没错。HMO是每次20美元，PPO是每次40美元。但PPO不需要转介。"
      },
      {
        "speaker": "You",
        "en": "What about prescriptions? I take a daily medication and that stuff adds up.",
        "cn": "处方药呢？我每天要吃一种药，费用会累积。"
      },
      {
        "speaker": "HR Rep",
        "en": "Both plans cover prescriptions, but the copays vary. Generic drugs are like 10 bucks on HMO and 15 on PPO. Brand name is way more though.",
        "cn": "两种方案都覆盖处方药，但共付额不同。仿制药HMO大约10美元，PPO大约15美元。品牌药就贵多了。"
      },
      {
        "speaker": "You",
        "en": "Mine is generic, so that's good. What about dental and vision? Are those included?",
        "cn": "我的是仿制药，那就好。那牙科和视力呢？包含在里面吗？"
      },
      {
        "speaker": "HR Rep",
        "en": "Those are separate plans. Dental is an extra 30 a month and vision is 15. I'd honestly recommend both — they pay for themselves if you go to the dentist twice a year.",
        "cn": "那是单独的方案。牙科每月多30美元，视力每月多15美元。我真心推荐都买——一年看两次牙就回本了。"
      },
      {
        "speaker": "You",
        "en": "Yeah, dental work is crazy expensive without insurance. Okay, so if I go with the PPO plus dental and vision, what am I looking at monthly?",
        "cn": "是啊，没保险看牙太贵了。那如果我选PPO加上牙科和视力，每月总共多少？"
      },
      {
        "speaker": "HR Rep",
        "en": "That'd be 325 a month total. The company covers 70% of the base plan, so your actual out-of-pocket is way less. More like 140-ish.",
        "cn": "总共每月325美元。公司承担基本方案的70%，所以你实际自付的少很多。大概140左右。"
      },
      {
        "speaker": "You",
        "en": "Oh, that's actually pretty reasonable. When does coverage start?",
        "cn": "哦，那还挺合理的。保险什么时候开始生效？"
      },
      {
        "speaker": "HR Rep",
        "en": "First of the month after your start date. So if you started this week, you'd be covered starting May 1st.",
        "cn": "入职后的下月一号。所以如果你这周入职，5月1号开始生效。"
      },
      {
        "speaker": "You",
        "en": "Perfect. I think I'll go with the PPO and add dental and vision. Where do I sign up?",
        "cn": "好的。我选PPO加牙科和视力吧。在哪里注册？"
      },
      {
        "speaker": "HR Rep",
        "en": "I'll send you a link to our benefits portal. Just log in, make your selections, and you're all set. Deadline is end of this week, so don't sit on it!",
        "cn": "我会发给你福利平台的链接。登录进去做好选择就行了。截止日期是这周末，别拖哦！"
      }
    ]
  },
  {
    "id": "health-dental-1",
    "cat": "health",
    "catName": "看病就医",
    "catEmoji": "🏥",
    "title": "Visiting the Dentist",
    "titleCn": "看牙医",
    "emoji": "🦷",
    "lines": [
      {
        "speaker": "Dentist",
        "en": "Hey Alex, long time no see! Says here your last visit was... oh, almost two years ago. We gotta fix that!",
        "cn": "嗨Alex，好久不见！这上面显示你上次来是……快两年前了。这可得改改！"
      },
      {
        "speaker": "You",
        "en": "Yeah, I know, I know. I've been putting it off. Honestly, I'm a little anxious about being here.",
        "cn": "是啊，我知道。一直在拖。说实话，来这里我有点紧张。"
      },
      {
        "speaker": "Dentist",
        "en": "No judgment at all. A lot of people feel that way. We'll take it nice and easy. Any pain or issues lately?",
        "cn": "完全不会评判你。很多人都是这样。我们慢慢来。最近有疼痛或什么问题吗？"
      },
      {
        "speaker": "You",
        "en": "Actually yeah, my upper left molar has been kinda sensitive. Especially when I drink cold stuff.",
        "cn": "其实有的，左上方的臼齿有点敏感。特别是喝冷的东西的时候。"
      },
      {
        "speaker": "Dentist",
        "en": "Okay, I'll definitely take a closer look at that. Let's start with some X-rays so we can see what's going on in there.",
        "cn": "好的，我一定仔细看看那颗。先拍个X光片看看里面的情况。"
      },
      {
        "speaker": "You",
        "en": "Sure. Is the X-ray thing gonna be uncomfortable? I have kind of a small mouth.",
        "cn": "好的。拍X光会不舒服吗？我嘴巴比较小。"
      },
      {
        "speaker": "Dentist",
        "en": "We use digital sensors now — they're way smaller than the old film ones. You'll barely notice it. Just bite down gently for me.",
        "cn": "我们现在用数字传感器了——比以前的胶片小很多。你几乎不会注意到。轻轻咬住就好。"
      },
      {
        "speaker": "You",
        "en": "Oh okay, that wasn't bad at all. So what do you see?",
        "cn": "好的，确实一点都不难受。你看到什么了？"
      },
      {
        "speaker": "Dentist",
        "en": "Well, the good news is no cavities on most of your teeth. But that molar you mentioned — I can see a small cavity forming there.",
        "cn": "好消息是大部分牙齿没有蛀牙。但你说的那颗臼齿——我能看到一个小的蛀牙正在形成。"
      },
      {
        "speaker": "You",
        "en": "Ugh, I was afraid of that. Is it a big deal? How bad is it?",
        "cn": "唉，我就怕这个。严重吗？有多糟？"
      },
      {
        "speaker": "Dentist",
        "en": "It's actually pretty small — we caught it early. A simple filling should take care of it. No need for anything major.",
        "cn": "其实很小——我们发现得早。做个简单的补牙就行了。不需要什么大的处理。"
      },
      {
        "speaker": "You",
        "en": "Oh thank goodness. I was worried you'd say root canal. How long does a filling take?",
        "cn": "谢天谢地。我还以为你会说要做根管。补牙要多久？"
      },
      {
        "speaker": "Dentist",
        "en": "About thirty minutes, tops. We can actually do it right now if you've got the time. Or schedule it for another day.",
        "cn": "最多三十分钟。如果你有时间的话现在就可以做。或者另约一天。"
      },
      {
        "speaker": "You",
        "en": "Let's just get it over with today. Will it hurt? Please be honest.",
        "cn": "今天做了吧。会疼吗？请说实话。"
      },
      {
        "speaker": "Dentist",
        "en": "I'll numb you up real good, so you won't feel any pain. Just some pressure. The numbing shot is the worst part, and that's like a quick pinch.",
        "cn": "我会给你打好麻药，所以不会疼。只会有一点压迫感。打麻药是最难受的，就像快速掐一下。"
      },
      {
        "speaker": "You",
        "en": "Okay, I can handle that. Should I also get a cleaning today while I'm here?",
        "cn": "好的，我能接受。既然来了今天也洗个牙吧？"
      },
      {
        "speaker": "Dentist",
        "en": "Absolutely, I was gonna suggest that. The hygienist will do the cleaning first, then I'll come back for the filling. Two birds, one stone.",
        "cn": "当然，我正想说呢。洁牙师先给你洗牙，然后我再来补牙。一举两得。"
      },
      {
        "speaker": "You",
        "en": "Sounds like a plan. And going forward, how often should I really be coming in?",
        "cn": "就这么办。那以后我到底应该多久来一次？"
      },
      {
        "speaker": "Dentist",
        "en": "Every six months is ideal. I know life gets busy, but catching stuff early like this saves you a ton of money and pain down the road.",
        "cn": "最理想的是六个月一次。我知道生活很忙，但像这样早发现能帮你省很多钱也少受很多罪。"
      },
      {
        "speaker": "You",
        "en": "You're right. I'll be better about it, I promise. Let's book my next appointment before I leave today so I don't flake again.",
        "cn": "你说得对。我保证以后会按时来。今天走之前就把下次预约定好，免得我又拖。"
      }
    ]
  },
  {
    "id": "acting-audition-1",
    "cat": "acting",
    "catName": "影视表演",
    "catEmoji": "🎬",
    "title": "Preparing for an Audition",
    "titleCn": "准备试镜",
    "emoji": "🎭",
    "lines": [
      {
        "speaker": "Friend",
        "en": "So you've got that big audition tomorrow, right? How are you feeling about it?",
        "cn": "你明天有那个大试镜对吧？感觉怎么样？"
      },
      {
        "speaker": "You",
        "en": "Honestly? I'm freaking out a little. It's for a recurring role on a network show. This could be huge.",
        "cn": "说实话？有点慌。是一个电视剧的固定角色。这可能是个大机会。"
      },
      {
        "speaker": "Friend",
        "en": "Dude, that's amazing though! What's the character like?",
        "cn": "老兄，那很棒啊！角色是什么样的？"
      },
      {
        "speaker": "You",
        "en": "She's a sarcastic lawyer who's secretly really insecure. Like she puts on this tough front but she's falling apart inside.",
        "cn": "是一个很毒舌的律师但内心其实很不自信。就是外表很强硬但内心快崩溃的那种。"
      },
      {
        "speaker": "Friend",
        "en": "Oh, that's got some depth. Have you been running the sides? How's the monologue feeling?",
        "cn": "这个角色挺有深度的。你排练过台词了吗？独白感觉怎么样？"
      },
      {
        "speaker": "You",
        "en": "I've been running them all week. The monologue is solid but there's this one scene with the opposing counsel that I keep tripping over.",
        "cn": "我整周都在排练。独白没问题，但有一场和对方律师的戏我老是卡壳。"
      },
      {
        "speaker": "Friend",
        "en": "Want me to read the other part? I can be your scene partner for a bit.",
        "cn": "要不要我念对方的台词？我可以当一会你的对手戏搭档。"
      },
      {
        "speaker": "You",
        "en": "Would you? That'd be awesome. Okay, let's start from \"Your Honor, my client has every right...\"",
        "cn": "真的吗？那太好了。好，我们从\"法官大人，我的当事人完全有权利……\"开始。"
      },
      {
        "speaker": "Friend",
        "en": "Hold on — before you start, what's your character feeling in this moment? Like, what just happened before this scene?",
        "cn": "等一下——在你开始之前，你的角色在这个时刻是什么感受？就是这场戏之前刚发生了什么？"
      },
      {
        "speaker": "You",
        "en": "Good question. She just found out her client lied to her, so she's furious but she can't show it in court. She has to keep it together.",
        "cn": "好问题。她刚发现她的当事人对她撒了谎，所以她很愤怒但在法庭上不能表现出来。她必须保持镇定。"
      },
      {
        "speaker": "Friend",
        "en": "That's the juice right there. Play that inner conflict. Let us see her trying not to crack.",
        "cn": "这就是精华所在。演出那种内心的挣扎。让观众看到她在努力不崩溃。"
      },
      {
        "speaker": "You",
        "en": "You're right. I've been playing it too cool. I need to show the cracks underneath. Okay, let me try it again with that in mind.",
        "cn": "你说得对。我之前演得太淡定了。我需要让人看到表面下的裂缝。好，我带着这个想法再来一次。"
      },
      {
        "speaker": "Friend",
        "en": "Yeah, that was SO much better! Did you feel the difference? There was real tension that time.",
        "cn": "对，那次好太多了！你感觉到区别了吗？那次有真实的张力了。"
      },
      {
        "speaker": "You",
        "en": "I totally did. It felt way more alive. Okay, what about my outfit? Should I go full lawyer look or keep it casual?",
        "cn": "完全感觉到了。感觉真实多了。那穿什么呢？要不要穿全套律师的样子还是休闲一点？"
      },
      {
        "speaker": "Friend",
        "en": "I'd suggest something that suggests the character without going full costume. Maybe a blazer with jeans? Professional but not over the top.",
        "cn": "我建议穿能暗示角色但不是全套戏服的。也许西装外套配牛仔裤？专业但不过头。"
      },
      {
        "speaker": "You",
        "en": "Smart. I don't wanna look like I'm trying too hard. Should I bring a headshot and resume even though I submitted online?",
        "cn": "聪明。我不想看起来太刻意。虽然网上已经交了，但还要带纸质的头像和简历吗？"
      },
      {
        "speaker": "Friend",
        "en": "Always bring a hard copy. You never know. And make sure you slate clearly — state your name, your agency, and the role you're reading for.",
        "cn": "永远带纸质的。说不准呢。还有确保报板的时候说清楚——说你的名字、经纪公司和你试的角色。"
      },
      {
        "speaker": "You",
        "en": "Right, right. And if they give me a redirect, I should just go with it and not overthink, yeah?",
        "cn": "对对。如果他们给我一个调整方向，我就跟着走不要想太多，对吧？"
      },
      {
        "speaker": "Friend",
        "en": "Exactly. A redirect means they're interested. It means they wanna see what else you can do. That's a good sign.",
        "cn": "没错。给你调整方向说明他们感兴趣。说明他们想看你还能怎么演。那是好兆头。"
      },
      {
        "speaker": "You",
        "en": "Okay, I feel so much better now. I'm gonna run the scenes a few more times, get a good night's sleep, and crush it tomorrow. Wish me luck!",
        "cn": "好了，我现在感觉好多了。我再排几遍台词，好好睡一觉，明天好好发挥。祝我好运吧！"
      }
    ]
  },
  {
    "id": "acting-class-1",
    "cat": "acting",
    "catName": "影视表演",
    "catEmoji": "🎬",
    "title": "First Acting Class",
    "titleCn": "第一堂表演课",
    "emoji": "🎓",
    "lines": [
      {
        "speaker": "Teacher",
        "en": "Alright everyone, welcome to Intro to Acting! I see some new faces. Let's go around and say your name and why you're here.",
        "cn": "好的各位，欢迎来到表演入门课！我看到一些新面孔。我们绕一圈，说说你的名字和你为什么来。"
      },
      {
        "speaker": "You",
        "en": "Hi, I'm Alex. I've always been interested in acting but never really had the guts to try it until now.",
        "cn": "嗨，我是Alex。我一直对表演感兴趣，但直到现在才鼓起勇气来尝试。"
      },
      {
        "speaker": "Teacher",
        "en": "Love that! It takes courage to walk through that door. So today we're gonna start with some warm-up exercises. Everybody stand up!",
        "cn": "很棒！走进这扇门需要勇气。今天我们先做一些热身练习。大家站起来！"
      },
      {
        "speaker": "You",
        "en": "Oh boy, here we go. I'm already nervous and we haven't even started yet.",
        "cn": "天哪，开始了。还没正式开始我就紧张了。"
      },
      {
        "speaker": "Teacher",
        "en": "That's totally normal! Nerves mean you care. Okay, first exercise — I want everyone to walk around the room and make eye contact with each person you pass.",
        "cn": "这完全正常！紧张说明你在乎。好的，第一个练习——我想让大家在教室里走动，和你经过的每个人进行眼神交流。"
      },
      {
        "speaker": "You",
        "en": "Just eye contact? That sounds easy enough... okay, this is actually way more intense than I thought.",
        "cn": "就眼神交流？听起来挺简单的……好吧，其实比我想象的紧张多了。"
      },
      {
        "speaker": "Teacher",
        "en": "See? Something so simple can feel really vulnerable. And that's what acting is all about — being willing to be vulnerable. Now pair up!",
        "cn": "看到了吗？这么简单的事也能让人感觉很脆弱。而表演就是要愿意展示脆弱。现在两人一组！"
      },
      {
        "speaker": "Classmate",
        "en": "Hey, wanna be partners? I'm Jamie. This is my first class too, so we can be nervous wrecks together.",
        "cn": "嗨，要不要一组？我是Jamie。这也是我第一节课，咱们可以一起紧张。"
      },
      {
        "speaker": "You",
        "en": "Ha! Deal. Nice to meet you, Jamie. So what are we supposed to do?",
        "cn": "哈！一言为定。很高兴认识你，Jamie。那我们该做什么？"
      },
      {
        "speaker": "Teacher",
        "en": "Okay partners, here's a fun one. I want you to have a conversation using only gibberish. No real words. Communicate purely through emotion and body language.",
        "cn": "好了搭档们，来一个有趣的。我要你们只用胡言乱语来对话。不能说真正的词。完全靠情感和肢体语言来沟通。"
      },
      {
        "speaker": "You",
        "en": "Wait, seriously? Just... made-up sounds? This is gonna be so weird.",
        "cn": "等等，认真的？就……编造的声音？这也太怪了吧。"
      },
      {
        "speaker": "Classmate",
        "en": "I know, right? But honestly, if we're gonna look silly, might as well go all in. Let's do it!",
        "cn": "对吧？但说实话，反正都要出丑了，不如全力投入。来吧！"
      },
      {
        "speaker": "You",
        "en": "Okay... *speaks gibberish*... Dude, that was actually kind of liberating! I wasn't worried about saying the wrong thing because nothing was real!",
        "cn": "好吧……*说胡话*……哈，那感觉其实挺释放的！因为什么都不是真的，所以不怕说错！"
      },
      {
        "speaker": "Teacher",
        "en": "That's EXACTLY the point! When we remove the pressure of words, we connect to pure emotion. How did that feel for everyone?",
        "cn": "这就对了！当我们去掉语言的压力，就能连接到纯粹的情感。大家感觉怎么样？"
      },
      {
        "speaker": "You",
        "en": "It felt amazing, honestly. Scary at first but then something just clicked and I let go.",
        "cn": "说实话感觉很棒。一开始很害怕但后来突然就通了，我就放开了。"
      },
      {
        "speaker": "Teacher",
        "en": "That's what we call getting out of your head. Now let's try an improv exercise. I'm gonna give you a scenario and you just react naturally. No scripts.",
        "cn": "这就叫跳出思维的束缚。现在来试一个即兴练习。我给你们一个场景，你们自然反应就好。没有台词。"
      },
      {
        "speaker": "You",
        "en": "Improv? Like, making it up as we go? That's terrifying but also kind of exciting?",
        "cn": "即兴？就是随机应变？好可怕但又有点兴奋？"
      },
      {
        "speaker": "Teacher",
        "en": "The golden rule of improv is \"yes, and.\" Whatever your partner gives you, accept it and build on it. Never shut down an idea.",
        "cn": "即兴的黄金法则是\"是的，而且\"。不管搭档给你什么，接受它并在此基础上发展。永远不要否定一个想法。"
      },
      {
        "speaker": "Classmate",
        "en": "Hey Alex, I think we actually killed it! That was way more fun than I expected.",
        "cn": "嘿Alex，我觉得咱们表现得真不错！比我想象的好玩多了。"
      },
      {
        "speaker": "You",
        "en": "Right? I walked in here terrified and now I genuinely can't wait for next week's class. I think I'm hooked!",
        "cn": "对吧？我进来的时候吓得要命，现在真心期待下周的课了。我好像上瘾了！"
      }
    ]
  },
  {
    "id": "acting-scene-1",
    "cat": "acting",
    "catName": "影视表演",
    "catEmoji": "🎬",
    "title": "Rehearsing a Scene with a Partner",
    "titleCn": "和搭档排练",
    "emoji": "🎪",
    "lines": [
      {
        "speaker": "Partner",
        "en": "Okay, so should we just jump right into the scene or do you wanna talk through it first?",
        "cn": "好，我们直接开始演还是先讨论一下？"
      },
      {
        "speaker": "You",
        "en": "Let's talk through it first. I wanna make sure we're on the same page about what's happening between our characters.",
        "cn": "先讨论一下吧。我想确保我们对角色之间发生了什么有一致的理解。"
      },
      {
        "speaker": "Partner",
        "en": "Cool. So in this scene, my character just told yours that I'm moving across the country. And you're not taking it well.",
        "cn": "好的。在这场戏里，我的角色刚告诉你我要搬到国家另一头去。你不太能接受。"
      },
      {
        "speaker": "You",
        "en": "Right. I think my character is hurt but trying to play it off like she doesn't care. There's a lot of unspoken stuff going on.",
        "cn": "对。我觉得我的角色很受伤但在装作不在乎的样子。有很多没说出口的东西。"
      },
      {
        "speaker": "Partner",
        "en": "Totally. And my character feels guilty about leaving but also excited. So there's this weird emotional tug-of-war.",
        "cn": "完全同意。而我的角色对离开感到愧疚但同时也很兴奋。所以有种奇怪的情感拉扯。"
      },
      {
        "speaker": "You",
        "en": "Love that. Okay, let's try a run-through. I'll start from my line — \"So when were you planning on telling me?\"",
        "cn": "很好。来走一遍吧。我从我的台词开始——\"那你打算什么时候告诉我？\""
      },
      {
        "speaker": "Partner",
        "en": "Wait, before that — where are we physically? Like, are we sitting, standing? How close together?",
        "cn": "等下，先说说我们的位置。我们是坐着还是站着？距离多近？"
      },
      {
        "speaker": "You",
        "en": "Good call. I think we start sitting next to each other, and then as the tension builds, I get up and create distance.",
        "cn": "问得好。我觉得一开始我们挨着坐，然后随着紧张感上升，我站起来拉开距离。"
      },
      {
        "speaker": "Partner",
        "en": "Oh that's a great choice. The physical distance reflecting the emotional distance. I dig it.",
        "cn": "这个选择很棒。身体上的距离映射情感上的距离。我喜欢。"
      },
      {
        "speaker": "You",
        "en": "Exactly. Alright, let's go. \"So when were you planning on telling me? Or was I just gonna wake up one day and find your stuff gone?\"",
        "cn": "就是这个意思。好，开始吧。\"那你打算什么时候告诉我？还是说有天我醒来发现你的东西都没了？\""
      },
      {
        "speaker": "Partner",
        "en": "\"It's not like that. I just found out last week, and I've been trying to figure out the right way to say it.\"",
        "cn": "\"不是那样的。我上周才知道的，一直在想怎么跟你说才好。\""
      },
      {
        "speaker": "You",
        "en": "\"The right way? There's no right way to tell someone you're just... leaving.\" — Okay hold on, I feel like I went too angry too fast there.",
        "cn": "\"什么好的说法？告诉别人你就这么……要走了，哪有什么好的说法。\"——等等，我觉得我太快进入愤怒状态了。"
      },
      {
        "speaker": "Partner",
        "en": "Yeah, I was thinking the same thing. Maybe start more stunned? Like you're still processing it. The anger can come later.",
        "cn": "对，我也这么想。也许一开始更震惊一些？就像你还在消化这件事。愤怒可以晚一点。"
      },
      {
        "speaker": "You",
        "en": "Good note. Let me try it quieter. Almost like I can't believe what I'm hearing. The devastation hits before the anger.",
        "cn": "说得好。我试试更安静地说。几乎像是不敢相信自己听到的。先是心碎，然后才是愤怒。"
      },
      {
        "speaker": "Partner",
        "en": "Yes! That'll make the eventual blow-up way more powerful. It's the slow burn that gets the audience.",
        "cn": "对！那样的话最后的爆发会更有力量。慢慢酝酿才能打动观众。"
      },
      {
        "speaker": "You",
        "en": "Okay, from the top again. Let me take a breath and really put myself in her headspace...",
        "cn": "好，从头再来。让我深呼吸一下，真正进入她的心理状态……"
      },
      {
        "speaker": "Partner",
        "en": "Take your time. No rush. The more grounded you are before we start, the more real it'll feel.",
        "cn": "慢慢来，不急。你开始前越沉稳，表演就越真实。"
      },
      {
        "speaker": "You",
        "en": "That was so much better. I actually felt something real that time. Did you feel the shift?",
        "cn": "那次好太多了。我那次确实感受到了真实的情感。你感觉到变化了吗？"
      },
      {
        "speaker": "Partner",
        "en": "A hundred percent. When you went quiet on that line, I got actual chills. That's the take.",
        "cn": "百分之百感觉到了。你那句台词说得很轻的时候，我真的起鸡皮疙瘩了。就是这个版本。"
      },
      {
        "speaker": "You",
        "en": "I'm so glad we took the time to really break it down. That's the one we bring to class tomorrow. Let's run it one final time to lock it in.",
        "cn": "太高兴我们花时间好好拆解了。这就是我们明天带到课上的版本。最后再走一遍巩固一下吧。"
      }
    ]
  },
  {
    "id": "acting-feedback-1",
    "cat": "acting",
    "catName": "影视表演",
    "catEmoji": "🎬",
    "title": "Getting Director's Feedback",
    "titleCn": "导演给反馈",
    "emoji": "🎥",
    "lines": [
      {
        "speaker": "Director",
        "en": "Okay, cut! That was good, Alex, but I need to give you some notes. Come here for a sec.",
        "cn": "好的，停！Alex演得不错，但我有一些意见。过来一下。"
      },
      {
        "speaker": "You",
        "en": "Sure thing. I felt like that last take was a little off but I couldn't pinpoint why.",
        "cn": "好的。我觉得刚才那条好像有点不对劲，但说不出哪里不对。"
      },
      {
        "speaker": "Director",
        "en": "So here's the thing — technically you're nailing it. The lines are perfect, the blocking is great. But I'm not feeling the emotional connection yet.",
        "cn": "是这样——技术上你做得很好。台词没问题，走位也很好。但我还没感受到那个情感上的连接。"
      },
      {
        "speaker": "You",
        "en": "Hmm, okay. Can you be more specific? Like, which part felt disconnected?",
        "cn": "嗯，好的。能说得更具体一些吗？哪个部分感觉脱节了？"
      },
      {
        "speaker": "Director",
        "en": "That moment where you find out your brother is sick. Right now it feels like you're performing sadness rather than actually experiencing it.",
        "cn": "就是你发现你哥哥生病了那个时刻。现在感觉你在表演悲伤，而不是真正在经历它。"
      },
      {
        "speaker": "You",
        "en": "Oh, I see what you mean. I think I've been so focused on remembering the technical stuff that I lost the rawness.",
        "cn": "哦，我明白你的意思了。我觉得我太专注于记住技术细节了，失去了那种原始感。"
      },
      {
        "speaker": "Director",
        "en": "Exactly. Forget the technique for a second. Think about someone you love. Now imagine getting that phone call. Let that land before you say anything.",
        "cn": "没错。先忘掉技巧。想一个你爱的人。然后想象接到那个电话。让那个感觉先沉淀一下再开口。"
      },
      {
        "speaker": "You",
        "en": "So you want me to really sit in the silence before I react? Give it more space?",
        "cn": "所以你想让我在反应之前真正停留在那个沉默里？给它更多的空间？"
      },
      {
        "speaker": "Director",
        "en": "Yes! The pause is everything in this scene. The audience needs to see you processing it. Right now you're jumping to the emotion too fast.",
        "cn": "对！这场戏里停顿就是一切。观众需要看到你在消化这件事。现在你进入情绪太快了。"
      },
      {
        "speaker": "You",
        "en": "Got it. So less is more in this moment. Let the pain show in my eyes before it hits my voice.",
        "cn": "明白了。这个时刻少即是多。先让痛苦在眼神里显现，然后再到声音。"
      },
      {
        "speaker": "Director",
        "en": "Now you're getting it. Also, in the next beat where you pick up the car keys — don't rush that. Make it deliberate.",
        "cn": "这就对了。还有，接下来你拿起车钥匙的那个节拍——别太快。要刻意一些。"
      },
      {
        "speaker": "You",
        "en": "Like she's making a decision in that moment? Not just grabbing the keys but deciding to go?",
        "cn": "就像她在那个时刻正在做一个决定？不是随手拿钥匙而是决定要去？"
      },
      {
        "speaker": "Director",
        "en": "EXACTLY. You just nailed what I've been trying to say. Every small action should have intention behind it.",
        "cn": "就是这样！你说到点子上了。每一个小动作背后都应该有意图。"
      },
      {
        "speaker": "You",
        "en": "That makes so much sense. Can I try the scene one more time with these adjustments?",
        "cn": "这太有道理了。我能带着这些调整再演一遍吗？"
      },
      {
        "speaker": "Director",
        "en": "Absolutely. Take a minute to reset. And remember — don't try to make us feel something. Just feel it yourself and let the camera do its job.",
        "cn": "当然。花一分钟调整一下。记住——别试图让我们感受到什么。你自己去感受就好，让镜头来做它的工作。"
      },
      {
        "speaker": "You",
        "en": "Okay, I'm ready. Let's go again.",
        "cn": "好了，我准备好了。再来一遍吧。"
      },
      {
        "speaker": "Director",
        "en": "And... action!... Cut! YES! That's it! Did you feel the difference? That was night and day!",
        "cn": "开始！……停！对了！就是这样！你感觉到区别了吗？简直判若两人！"
      },
      {
        "speaker": "You",
        "en": "Oh my god, yes. That felt completely different. I actually got emotional for real that time.",
        "cn": "天哪，是的。感觉完全不一样。那次我是真的动了感情。"
      },
      {
        "speaker": "Director",
        "en": "That's what we want. That's what the audience will connect with. Real emotion, not performance. Beautiful work, Alex.",
        "cn": "这就是我们要的。这才是能打动观众的。真实的情感，不是表演。演得很棒，Alex。"
      },
      {
        "speaker": "You",
        "en": "Thank you so much for the notes. Seriously, that one direction about the pause changed everything for me.",
        "cn": "非常感谢你的指导。说真的，关于停顿的那个建议改变了我的整个表演。"
      }
    ]
  },
  {
    "id": "acting-wrap-1",
    "cat": "acting",
    "catName": "影视表演",
    "catEmoji": "🎬",
    "title": "Wrapping Up a Filming Day",
    "titleCn": "一天拍摄结束",
    "emoji": "🎬",
    "lines": [
      {
        "speaker": "AD",
        "en": "That's a wrap on today, everyone! Great work. We got all fifteen setups done, which is honestly a miracle.",
        "cn": "今天就到这里了，各位！干得好。我们完成了全部十五个机位，说实话简直是奇迹。"
      },
      {
        "speaker": "You",
        "en": "Finally! My feet are killing me. We've been going since like 5 AM. What a marathon.",
        "cn": "终于结束了！我的脚快废了。我们从早上五点就开始了。真是马拉松式的一天。"
      },
      {
        "speaker": "Costar",
        "en": "No kidding. But hey, I think we got some really solid stuff today. That rooftop scene was magic.",
        "cn": "可不是嘛。不过今天拍了一些很棒的内容。天台那场戏太精彩了。"
      },
      {
        "speaker": "You",
        "en": "Oh totally. When we did that long take with no cuts? I was so in the zone I forgot the camera was even there.",
        "cn": "完全同意。我们拍那个没有剪切的长镜头时？我太入戏了，都忘了摄像机的存在。"
      },
      {
        "speaker": "Costar",
        "en": "Same! The director was literally tearing up behind the monitor. I think we nailed it in one.",
        "cn": "我也是！导演在监视器后面都哭了。我觉得我们一条就过了。"
      },
      {
        "speaker": "You",
        "en": "That never happens. Usually we do like fifteen takes minimum. Speaking of the director, here she comes.",
        "cn": "这种事很少发生。通常我们至少拍十五条。说到导演，她过来了。"
      },
      {
        "speaker": "Director",
        "en": "Hey you two, I just wanted to say — today was incredible. You both brought something really special to those scenes.",
        "cn": "嘿你们俩，我就想说——今天太棒了。你们俩给那些场景带来了非常特别的东西。"
      },
      {
        "speaker": "You",
        "en": "Thanks! It helps when you have a great scene partner. We really fed off each other's energy today.",
        "cn": "谢谢！有一个好搭档很重要。今天我们真的互相带动了。"
      },
      {
        "speaker": "Director",
        "en": "It shows on screen. Oh, and heads up — I might want to add a scene to tomorrow's schedule. I'll send you the pages tonight.",
        "cn": "在镜头里看得出来。对了，提醒一下——我可能要在明天的日程里加一场戏。今晚把台词发给你们。"
      },
      {
        "speaker": "You",
        "en": "No worries. I'll look them over before bed. Early call time again tomorrow?",
        "cn": "没问题。我睡前看一下。明天又是早班吗？"
      },
      {
        "speaker": "AD",
        "en": "Call time is 6 AM. Makeup at 6:30. First shot at 8. We're doing the courtroom stuff so it'll be a long one.",
        "cn": "集合时间早上6点。6:30化妆。8点第一个镜头。明天拍法庭戏，会比较长。"
      },
      {
        "speaker": "You",
        "en": "The courtroom scene — that's the big monologue, right? I've been working on that one for weeks.",
        "cn": "法庭那场戏——就是那段大独白对吧？我已经准备了好几周了。"
      },
      {
        "speaker": "Costar",
        "en": "You're gonna crush it. I heard you practicing in your trailer earlier. It sounded incredible.",
        "cn": "你一定能演好的。我早些时候听到你在化妆车里练，听起来太好了。"
      },
      {
        "speaker": "You",
        "en": "Aw, thanks. I'm nervous but excited. Anyway, I need to return my wardrobe and get out of this makeup.",
        "cn": "哎，谢谢。我又紧张又兴奋。不过我得去还戏服然后卸妆了。"
      },
      {
        "speaker": "Costar",
        "en": "Same. Hey, a bunch of us are grabbing dinner at that Thai place down the street. You in?",
        "cn": "我也是。对了，我们几个人要去街尾那家泰国餐厅吃饭。你来不来？"
      },
      {
        "speaker": "You",
        "en": "Oh man, that sounds amazing but I'm so exhausted. Rain check? I really need to get some sleep before tomorrow.",
        "cn": "天哪，听起来太好了，但我太累了。改天行吗？我明天之前真的需要好好睡一觉。"
      },
      {
        "speaker": "Costar",
        "en": "Totally fair. Get some rest. We need you at a hundred percent for the courtroom scene.",
        "cn": "完全理解。好好休息。法庭那场戏需要你百分之百的状态。"
      },
      {
        "speaker": "You",
        "en": "Hey, before I go — is it weird that I already feel sad this shoot is almost over? We've only got three more days.",
        "cn": "走之前说一句——拍摄快结束了我就已经开始难过了，这正常吗？就剩三天了。"
      },
      {
        "speaker": "Costar",
        "en": "Not weird at all. This has been one of the best sets I've ever been on. The whole crew is amazing.",
        "cn": "一点都不奇怪。这是我待过的最好的剧组之一。整个团队都很棒。"
      },
      {
        "speaker": "You",
        "en": "For real. Alright, I'm heading out. See you bright and early tomorrow. Let's make it another great day!",
        "cn": "真的。好了，我走了。明天一大早见。让我们再创造一个美好的拍摄日！"
      }
    ]
  },
  {
    "id": "review-godfather-1",
    "cat": "filmreview",
    "catName": "影视评论",
    "catEmoji": "🎥",
    "title": "Discussing The Godfather Part I",
    "titleCn": "讨论教父第一部",
    "emoji": "🎥",
    "lines": [
      {
        "speaker": "Friend",
        "en": "So I finally watched The Godfather last night. I can't believe I waited this long.",
        "cn": "我昨晚终于看了《教父》。真不敢相信我等了这么久。"
      },
      {
        "speaker": "You",
        "en": "Dude, welcome to the club! What did you think? Pretty epic, right?",
        "cn": "兄弟，欢迎入伙！你觉得怎么样？很史诗吧？"
      },
      {
        "speaker": "Friend",
        "en": "Marlon Brando was absolutely incredible. The way he talked with that raspy voice gave me chills.",
        "cn": "马龙·白兰度简直太厉害了。他用那种沙哑的声音说话让我起鸡皮疙瘩。"
      },
      {
        "speaker": "You",
        "en": "Right? He literally stuffed cotton in his cheeks to get that look. Total dedication to the role.",
        "cn": "对吧？他真的在脸颊里塞了棉花来达到那个效果。完全投入角色。"
      },
      {
        "speaker": "Friend",
        "en": "The opening scene at the wedding was so well done. You get introduced to the whole family at once.",
        "cn": "婚礼的开场戏拍得太好了。你一下子就认识了整个家族。"
      },
      {
        "speaker": "You",
        "en": "That's Coppola's genius. He uses the wedding to set up every major character and conflict.",
        "cn": "那就是科波拉的天才之处。他用婚礼来铺垫每个主要角色和冲突。"
      },
      {
        "speaker": "Friend",
        "en": "I was surprised how much of the movie is actually about family loyalty, not just violence.",
        "cn": "我很惊讶电影其实大部分是关于家族忠诚的，不只是暴力。"
      },
      {
        "speaker": "You",
        "en": "Exactly. That's what separates it from regular gangster flicks. It's really a family drama at its core.",
        "cn": "没错。这就是它和普通黑帮片不同的地方。它的核心其实是家庭剧。"
      },
      {
        "speaker": "Friend",
        "en": "Michael's transformation blew my mind. He starts out as this innocent war hero who wants nothing to do with the business.",
        "cn": "迈克尔的转变让我震惊。他一开始是个天真的战争英雄，不想跟家族生意扯上关系。"
      },
      {
        "speaker": "You",
        "en": "And by the end he's colder than his father ever was. Al Pacino nailed that slow descent.",
        "cn": "到最后他比他父亲还要冷酷。阿尔·帕西诺把那种缓慢的堕落演绎得淋漓尽致。"
      },
      {
        "speaker": "Friend",
        "en": "The scene in the restaurant where he shoots Sollozzo and the police captain was so intense.",
        "cn": "他在餐厅枪杀索洛佐和警察局长的那场戏太紧张了。"
      },
      {
        "speaker": "You",
        "en": "That's the turning point for his whole character. Once he pulls that trigger, there's no going back.",
        "cn": "那是他整个角色的转折点。一旦他扣下扳机，就再也回不了头了。"
      },
      {
        "speaker": "Friend",
        "en": "I also loved the whole subplot with Sonny. James Caan was so explosive in that role.",
        "cn": "我也很喜欢桑尼的副线剧情。詹姆斯·凯恩在那个角色里太有爆发力了。"
      },
      {
        "speaker": "You",
        "en": "Sonny's temper is what gets him killed though. The tollbooth scene is brutal even by today's standards.",
        "cn": "但桑尼的暴脾气害死了他。收费站那场戏即使以今天的标准来看也很残暴。"
      },
      {
        "speaker": "Friend",
        "en": "Don't even get me started on the horse head scene. I did NOT see that coming.",
        "cn": "别提那个马头的场景了。我完全没料到。"
      },
      {
        "speaker": "You",
        "en": "Ha! Nobody does the first time. That scene is legendary for a reason. Pure shock value.",
        "cn": "哈！第一次看谁都没料到。那场戏成为经典是有原因的。纯粹的震撼效果。"
      },
      {
        "speaker": "Friend",
        "en": "The cinematography was gorgeous too. All those dark, shadowy shots really set the mood.",
        "cn": "摄影也很漂亮。所有那些黑暗的、阴影的镜头真的营造了氛围。"
      },
      {
        "speaker": "You",
        "en": "Gordon Willis shot it that way on purpose. They called him the Prince of Darkness because of his lighting style.",
        "cn": "戈登·威利斯是故意那样拍的。他们叫他\"黑暗王子\"，因为他的打光风格。"
      },
      {
        "speaker": "Friend",
        "en": "I'm honestly mad at myself for not watching it sooner. It totally lives up to the hype.",
        "cn": "说实话我很生自己的气没早点看。它完全名副其实。"
      },
      {
        "speaker": "You",
        "en": "Better late than never! Now you gotta watch Part II immediately. Some people think it's even better.",
        "cn": "迟到总比不到好！现在你得马上看第二部。有些人觉得第二部更好。"
      }
    ]
  },
  {
    "id": "review-godfather-2",
    "cat": "filmreview",
    "catName": "影视评论",
    "catEmoji": "🎥",
    "title": "Comparing Godfather I and II",
    "titleCn": "比较教父一和二",
    "emoji": "🎥",
    "lines": [
      {
        "speaker": "Friend",
        "en": "Okay so I just finished Godfather Part II. Now I get why people always debate which one is better.",
        "cn": "好吧我刚看完《教父2》。现在我明白为什么人们总是争论哪部更好了。"
      },
      {
        "speaker": "You",
        "en": "So which side are you on? Part I or Part II? This is like the ultimate movie debate.",
        "cn": "那你站哪边？第一部还是第二部？这可是终极电影辩论。"
      },
      {
        "speaker": "Friend",
        "en": "Honestly, I think Part II is slightly better. The dual timeline thing was so creative.",
        "cn": "说实话，我觉得第二部稍微好一点。双时间线的手法太有创意了。"
      },
      {
        "speaker": "You",
        "en": "That's a hot take but I respect it. Seeing young Vito's story alongside Michael's was brilliant storytelling.",
        "cn": "这个观点挺大胆的，但我尊重。看到年轻维托的故事和迈克尔的故事并行确实是很出色的叙事。"
      },
      {
        "speaker": "Friend",
        "en": "Robert De Niro as young Vito was perfect casting. He barely speaks English in those scenes and still steals the show.",
        "cn": "罗伯特·德尼罗演年轻的维托选角太完美了。他在那些场景里几乎不说英语，还是抢了所有人的风头。"
      },
      {
        "speaker": "You",
        "en": "He won an Oscar for it and he totally deserved it. The way he mirrors Brando's mannerisms is insane.",
        "cn": "他因此获得了奥斯卡奖，完全实至名归。他模仿白兰度举止的方式太厉害了。"
      },
      {
        "speaker": "Friend",
        "en": "Meanwhile Michael's story in Part II is so much darker. He's basically destroying everything around him.",
        "cn": "与此同时迈克尔在第二部的故事黑暗多了。他基本上在摧毁他周围的一切。"
      },
      {
        "speaker": "You",
        "en": "That's what makes it tragic. He thinks he's protecting the family but he's actually tearing it apart.",
        "cn": "这就是它悲剧性的地方。他以为自己在保护家庭，但实际上在撕裂它。"
      },
      {
        "speaker": "Friend",
        "en": "The scene where Kay tells him about the abortion is devastating. Pacino's reaction is terrifying.",
        "cn": "凯告诉他堕胎的那场戏太让人心碎了。帕西诺的反应令人恐惧。"
      },
      {
        "speaker": "You",
        "en": "That slap came out of nowhere. You see the monster he's become in that single moment.",
        "cn": "那一巴掌完全出乎意料。在那一瞬间你看到了他已经变成了怪物。"
      },
      {
        "speaker": "Friend",
        "en": "Part I had more iconic moments though. The horse head, the restaurant scene, the wedding opening.",
        "cn": "但第一部有更多经典时刻。马头、餐厅场景、婚礼开场。"
      },
      {
        "speaker": "You",
        "en": "True. Part I is more quotable too. Everyone knows \"I'm gonna make him an offer he can't refuse.\"",
        "cn": "确实。第一部也更容易被引用。每个人都知道\"我会给他一个他无法拒绝的条件。\""
      },
      {
        "speaker": "Friend",
        "en": "But Part II has the Fredo betrayal. When Michael kisses him and says he knows? Gut-wrenching.",
        "cn": "但第二部有弗雷多的背叛。迈克尔亲吻他并说他知道了的时候？太揪心了。"
      },
      {
        "speaker": "You",
        "en": "John Cazale was so underrated. He made Fredo pathetic and sympathetic at the same time.",
        "cn": "约翰·卡泽尔太被低估了。他把弗雷多演得既可悲又让人同情。"
      },
      {
        "speaker": "Friend",
        "en": "The Cuba scenes were really cool too. You don't see that era depicted in movies very often.",
        "cn": "古巴的场景也很酷。你在电影里不常看到那个时代的描写。"
      },
      {
        "speaker": "You",
        "en": "Coppola went all out on the production. The New Year's Eve sequence during the revolution is masterful.",
        "cn": "科波拉在制作上全力以赴。革命期间的跨年夜那段拍得堪称大师级。"
      },
      {
        "speaker": "Friend",
        "en": "I think what makes Part II edge ahead is the ending. Michael sitting alone, completely isolated.",
        "cn": "我觉得让第二部更胜一筹的是结局。迈克尔独自坐着，完全被孤立。"
      },
      {
        "speaker": "You",
        "en": "That final shot is haunting. He won every battle but lost everyone who ever loved him.",
        "cn": "最后那个镜头令人难忘。他赢了每一场战斗，却失去了每一个爱他的人。"
      },
      {
        "speaker": "Friend",
        "en": "Whereas Part I ends with that door closing on Kay. Both endings are poetic in different ways.",
        "cn": "而第一部以门在凯面前关上结尾。两个结局以不同的方式都很有诗意。"
      },
      {
        "speaker": "You",
        "en": "That's why they're both masterpieces. You literally can't go wrong picking either one as the best.",
        "cn": "所以它们都是杰作。你选哪一部当最好的都不会错。"
      }
    ]
  },
  {
    "id": "review-shawshank-1",
    "cat": "filmreview",
    "catName": "影视评论",
    "catEmoji": "🎥",
    "title": "Why Shawshank Redemption is the Best",
    "titleCn": "肖申克的救赎为什么最好",
    "emoji": "🎥",
    "lines": [
      {
        "speaker": "Friend",
        "en": "I saw that Shawshank Redemption is still number one on IMDb. How is that even possible after thirty years?",
        "cn": "我看到《肖申克的救赎》在IMDb上还是第一名。三十年了这怎么可能？"
      },
      {
        "speaker": "You",
        "en": "Because it's genuinely that good. Every single time I rewatch it, I notice something new.",
        "cn": "因为它真的就是那么好。每次重看我都会注意到新的东西。"
      },
      {
        "speaker": "Friend",
        "en": "It's crazy that it flopped at the box office when it first came out though.",
        "cn": "疯狂的是它刚上映的时候票房惨淡。"
      },
      {
        "speaker": "You",
        "en": "Yeah, it went up against Forrest Gump and Pulp Fiction that year. Talk about bad luck with timing.",
        "cn": "是的，那年它碰上了《阿甘正传》和《低俗小说》。说到时机不好。"
      },
      {
        "speaker": "Friend",
        "en": "Morgan Freeman's narration is what makes the whole film work for me. His voice is just so perfect.",
        "cn": "摩根·弗里曼的旁白是让整部电影对我来说成功的原因。他的声音太完美了。"
      },
      {
        "speaker": "You",
        "en": "Red is the heart of the story. Without Freeman's warmth, it would feel way too bleak.",
        "cn": "瑞德是故事的核心。没有弗里曼的温暖，电影会感觉太阴暗了。"
      },
      {
        "speaker": "Friend",
        "en": "Tim Robbins is amazing too though. Andy Dufresne might be the most patient character in movie history.",
        "cn": "蒂姆·罗宾斯也很出色。安迪·杜弗雷恩可能是电影史上最有耐心的角色。"
      },
      {
        "speaker": "You",
        "en": "The guy spent twenty years chipping through a wall with a tiny rock hammer. That's next-level determination.",
        "cn": "这哥们花了二十年用一把小石锤凿穿了一堵墙。这是超级毅力。"
      },
      {
        "speaker": "Friend",
        "en": "What gets me every time is the scene where Andy plays the opera music over the loudspeakers.",
        "cn": "每次都让我感动的是安迪通过喇叭播放歌剧音乐的那场戏。"
      },
      {
        "speaker": "You",
        "en": "That scene is pure cinema. Everyone just stops and listens. For a moment, they all feel free.",
        "cn": "那场戏是纯粹的电影艺术。每个人都停下来听。在那一刻，他们都感到自由了。"
      },
      {
        "speaker": "Friend",
        "en": "The warden is such a great villain too. So corrupt and hypocritical with his Bible quotes.",
        "cn": "典狱长也是一个很棒的反派。拿着圣经引言却那么腐败和虚伪。"
      },
      {
        "speaker": "You",
        "en": "Bob Gunton crushed that role. He's the kind of villain you love to hate because he feels so real.",
        "cn": "鲍勃·冈顿把那个角色演绝了。他是那种你喜欢讨厌的反派，因为他感觉太真实了。"
      },
      {
        "speaker": "Friend",
        "en": "I think the movie works because it's really about hope. Like, hope as an act of resistance.",
        "cn": "我觉得这部电影之所以成功是因为它真的是关于希望的。希望作为一种抵抗行为。"
      },
      {
        "speaker": "You",
        "en": "Andy says it himself. Hope is a good thing, maybe the best of things. That line hits so hard.",
        "cn": "安迪自己说的。希望是好东西，也许是最好的东西。那句台词太打动人了。"
      },
      {
        "speaker": "Friend",
        "en": "Meanwhile Brooks's story is the opposite. The way institutionalization breaks him is heartbreaking.",
        "cn": "而布鲁克斯的故事是相反的。体制化摧毁他的方式令人心碎。"
      },
      {
        "speaker": "You",
        "en": "Brooks was free but he couldn't handle freedom. That subplot adds so much depth to the whole film.",
        "cn": "布鲁克斯自由了但他无法承受自由。那条副线给整部电影增加了很多深度。"
      },
      {
        "speaker": "Friend",
        "en": "Do you think it deserves the number one spot over The Godfather though?",
        "cn": "但你觉得它配不配排在《教父》前面占据第一名？"
      },
      {
        "speaker": "You",
        "en": "I think they're completely different films. But Shawshank has more universal appeal. Everyone relates to wanting freedom.",
        "cn": "我觉得它们是完全不同的电影。但肖申克更有普世吸引力。每个人都能感受到对自由的渴望。"
      },
      {
        "speaker": "Friend",
        "en": "Fair point. My grandma loves it and she hates mob movies. It really does connect with everyone.",
        "cn": "有道理。我奶奶很喜欢它，但她讨厌黑帮电影。它确实能和每个人产生共鸣。"
      },
      {
        "speaker": "You",
        "en": "That's exactly why it's number one. It's the kind of movie that makes you feel better about being human.",
        "cn": "这正是它排第一的原因。它是那种让你对身为人类感觉更好的电影。"
      }
    ]
  },
  {
    "id": "review-shawshank-2",
    "cat": "filmreview",
    "catName": "影视评论",
    "catEmoji": "🎥",
    "title": "Analyzing the Ending of Shawshank",
    "titleCn": "分析肖申克的结局",
    "emoji": "🎥",
    "lines": [
      {
        "speaker": "Friend",
        "en": "Can we talk about the ending of Shawshank? Because I have some thoughts about whether it was too neat.",
        "cn": "我们能聊聊肖申克的结局吗？因为我对它是不是太完美有一些想法。"
      },
      {
        "speaker": "You",
        "en": "Oh interesting, you're one of those people. Let me guess, you think it should have ended with Red on the bus?",
        "cn": "哦有意思，你是那种人。让我猜猜，你觉得应该在瑞德坐大巴的时候就结束？"
      },
      {
        "speaker": "Friend",
        "en": "Kind of, yeah. The beach reunion feels a little too Hollywood for such a gritty film, don't you think?",
        "cn": "差不多，是的。海滩重逢对这么一部硬核电影来说感觉有点太好莱坞了，你不觉得吗？"
      },
      {
        "speaker": "You",
        "en": "I used to think that too, but now I feel like the audience earned that ending after two hours of suffering.",
        "cn": "我以前也这么想，但现在我觉得观众在经历了两个小时的痛苦后值得那个结局。"
      },
      {
        "speaker": "Friend",
        "en": "But Stephen King's original story is more ambiguous. Red just gets on the bus and hopes for the best.",
        "cn": "但斯蒂芬·金的原著更模糊。瑞德只是上了大巴，抱着最好的希望。"
      },
      {
        "speaker": "You",
        "en": "True, and that works great on the page. But film is a visual medium. Showing the payoff matters more.",
        "cn": "确实，在书上效果很好。但电影是视觉媒体。展示结果更重要。"
      },
      {
        "speaker": "Friend",
        "en": "Let's back up though. The tunnel escape itself is one of the greatest reveals in cinema history.",
        "cn": "不过让我们倒回去说。隧道逃脱本身是电影史上最伟大的揭秘之一。"
      },
      {
        "speaker": "You",
        "en": "When the warden throws the rock and it goes through the poster? My jaw dropped the first time I saw that.",
        "cn": "当典狱长扔石头穿过海报的时候？我第一次看的时候下巴都掉了。"
      },
      {
        "speaker": "Friend",
        "en": "And then the montage showing how Andy did it all. Walking into banks with fake identities, mailing the evidence.",
        "cn": "然后是展示安迪怎么做到的蒙太奇。用假身份走进银行，寄出证据。"
      },
      {
        "speaker": "You",
        "en": "That whole sequence is so satisfying. He beat them at their own game using their own money. Chef's kiss.",
        "cn": "整段太让人满足了。他用他们自己的钱在他们自己的游戏里打败了他们。完美。"
      },
      {
        "speaker": "Friend",
        "en": "The rain scene where Andy stands with his arms out after crawling through the sewage pipe is iconic.",
        "cn": "安迪爬过污水管后张开双臂站在雨中的场景是标志性的。"
      },
      {
        "speaker": "You",
        "en": "That shot represents rebirth. He literally crawled through filth to come out clean on the other side.",
        "cn": "那个镜头代表重生。他真的从肮脏中爬过去，在另一边干净地出来了。"
      },
      {
        "speaker": "Friend",
        "en": "Okay, so what about the warden's death? Shooting himself when the cops come. Deserved or too easy?",
        "cn": "好的，那典狱长的死呢？警察来的时候自杀了。活该还是太便宜他了？"
      },
      {
        "speaker": "You",
        "en": "I think it's poetic justice. He spent years quoting scripture and in the end his own sins caught up with him.",
        "cn": "我觉得这是诗意的正义。他多年来引用圣经，最终自己的罪孽追上了他。"
      },
      {
        "speaker": "Friend",
        "en": "The detail of him embroidering \"His judgment cometh\" on the wall is such perfect irony.",
        "cn": "他在墙上绣着\"审判即将来临\"这个细节真是完美的讽刺。"
      },
      {
        "speaker": "You",
        "en": "Frank Darabont packed the script with little details like that. Every rewatch you catch more foreshadowing.",
        "cn": "弗兰克·达拉邦特在剧本里塞满了这样的小细节。每次重看你都能发现更多伏笔。"
      },
      {
        "speaker": "Friend",
        "en": "I guess my real question is whether Red actually finds Andy or if it's just his hopeful imagination.",
        "cn": "我想我真正的问题是瑞德是真的找到了安迪，还是只是他充满希望的想象。"
      },
      {
        "speaker": "You",
        "en": "The movie presents it as real. But honestly, even if it's imagined, the point is that Red chose hope.",
        "cn": "电影把它呈现为真实的。但说实话，即使是想象的，重点是瑞德选择了希望。"
      },
      {
        "speaker": "Friend",
        "en": "That's actually a really good point. The ending works either way because hope itself is the victory.",
        "cn": "这其实是一个很好的观点。结局无论哪种都成立，因为希望本身就是胜利。"
      },
      {
        "speaker": "You",
        "en": "Exactly. Whether they meet on that beach or not, Red broke free from the institution in his mind. That's what counts.",
        "cn": "没错。不管他们是否在那片海滩上相遇，瑞德在心灵上挣脱了体制。这才是最重要的。"
      }
    ]
  },
  {
    "id": "review-housewives-1",
    "cat": "filmreview",
    "catName": "影视评论",
    "catEmoji": "🎥",
    "title": "Binge-Watching Desperate Housewives",
    "titleCn": "追剧绝望的主妇",
    "emoji": "🎥",
    "lines": [
      {
        "speaker": "Friend",
        "en": "I started binge-watching Desperate Housewives and I'm already on season three. I can't stop.",
        "cn": "我开始追《绝望的主妇》，已经看到第三季了。我停不下来。"
      },
      {
        "speaker": "You",
        "en": "Oh no, you're hooked! That show is so addictive. Which season has been your favorite so far?",
        "cn": "哦不，你上瘾了！那部剧太让人上瘾了。到目前为止你最喜欢哪一季？"
      },
      {
        "speaker": "Friend",
        "en": "Season one for sure. The mystery about Mary Alice's suicide kept me glued to the screen.",
        "cn": "肯定是第一季。关于玛丽·爱丽丝自杀的悬疑让我目不转睛。"
      },
      {
        "speaker": "You",
        "en": "That pilot episode is legendary. Opening with the narration from a dead woman was such a bold creative choice.",
        "cn": "那集试播集是传奇级的。用一个死去的女人的旁白开场是多么大胆的创意选择。"
      },
      {
        "speaker": "Friend",
        "en": "The whole concept of suburban perfection hiding dark secrets really hooked me from the start.",
        "cn": "郊区完美表面下隐藏黑暗秘密的整个概念从一开始就吸引了我。"
      },
      {
        "speaker": "You",
        "en": "That's the genius of the show. It looks like a soap opera on the surface but there's real depth underneath.",
        "cn": "那就是这部剧的天才之处。表面上看像肥皂剧，但底下有真正的深度。"
      },
      {
        "speaker": "Friend",
        "en": "I love how each season has its own mystery. It keeps things fresh instead of dragging one story forever.",
        "cn": "我喜欢每一季都有自己的悬疑。这让一切保持新鲜，而不是永远拖一个故事。"
      },
      {
        "speaker": "You",
        "en": "Some seasons pull it off better than others though. Season two's mystery with Betty Applewhite was kind of weak.",
        "cn": "不过有些季做得比其他季好。第二季贝蒂·阿普尔怀特的悬疑有点弱。"
      },
      {
        "speaker": "Friend",
        "en": "Yeah that plotline felt underdeveloped. But the stuff with Bree and her family more than made up for it.",
        "cn": "是的那条故事线感觉不够充分。但布里和她家人的剧情完全弥补了。"
      },
      {
        "speaker": "You",
        "en": "Bree Van De Kamp is one of the greatest TV characters ever written. Fight me on that.",
        "cn": "布里·范德坎普是有史以来写得最好的电视角色之一。不接受反驳。"
      },
      {
        "speaker": "Friend",
        "en": "No argument here. Marcia Cross plays her so perfectly. The way she maintains composure while everything falls apart.",
        "cn": "我没有异议。玛西亚·克罗斯演得太完美了。一切崩塌时她保持镇定的样子。"
      },
      {
        "speaker": "You",
        "en": "It's the comedic timing that gets me. She can deliver the most savage line with a sweet smile.",
        "cn": "让我折服的是她的喜剧节奏。她能带着甜美的微笑说出最尖刻的台词。"
      },
      {
        "speaker": "Friend",
        "en": "I also can't get over how much drama happens on one street. Wisteria Lane is basically cursed.",
        "cn": "我也无法相信一条街上能发生这么多事。紫藤巷基本上是被诅咒了。"
      },
      {
        "speaker": "You",
        "en": "Murders, affairs, tornadoes, plane crashes. That neighborhood has the worst luck in television history.",
        "cn": "谋杀、出轨、龙卷风、飞机坠毁。那个社区是电视史上最倒霉的地方。"
      },
      {
        "speaker": "Friend",
        "en": "The show is basically a dark comedy pretending to be a drama. That mix is what keeps me watching.",
        "cn": "这部剧基本上是一部伪装成剧情片的黑色喜剧。这种混合让我一直在看。"
      },
      {
        "speaker": "You",
        "en": "Marc Cherry knew exactly what tone he was going for. It walks that line between funny and dark perfectly.",
        "cn": "马克·切瑞完全清楚他想要什么基调。它在搞笑和黑暗之间走得恰到好处。"
      },
      {
        "speaker": "Friend",
        "en": "How many seasons are there total? I need to mentally prepare for the commitment.",
        "cn": "总共有几季？我需要在心理上为这个承诺做准备。"
      },
      {
        "speaker": "You",
        "en": "Eight seasons, a hundred and eighty episodes. But honestly some seasons you can breeze through pretty fast.",
        "cn": "八季，一百八十集。但说实话有些季你可以很快刷完。"
      },
      {
        "speaker": "Friend",
        "en": "That's a lot but I'm in too deep to quit now. Wisteria Lane has me in its grip.",
        "cn": "那很多，但我已经陷太深了不能退出。紫藤巷已经牢牢抓住我了。"
      },
      {
        "speaker": "You",
        "en": "Just wait till you get to the later seasons. There are some twists coming that will absolutely wreck you.",
        "cn": "等你看到后面几季吧。有些反转会彻底击垮你。"
      }
    ]
  },
  {
    "id": "review-housewives-2",
    "cat": "filmreview",
    "catName": "影视评论",
    "catEmoji": "🎥",
    "title": "Picking Favorite Characters in DH",
    "titleCn": "讨论绝望的主妇角色",
    "emoji": "🎥",
    "lines": [
      {
        "speaker": "Friend",
        "en": "Okay, rank the four main housewives for me. I need to know if we can still be friends.",
        "cn": "好的，给我排一下四个主要主妇的名次。我需要知道我们还能不能做朋友。"
      },
      {
        "speaker": "You",
        "en": "Ha! Alright, for me it's Bree first, then Lynette, Gabrielle, and Susan last. What about you?",
        "cn": "哈！好吧，对我来说布里第一，然后是勒奈特，加布丽尔，苏珊最后。你呢？"
      },
      {
        "speaker": "Friend",
        "en": "Wait, you put Susan last? She's supposed to be the relatable one, the audience stand-in.",
        "cn": "等等，你把苏珊放最后？她应该是最有共鸣的那个，观众的代入角色。"
      },
      {
        "speaker": "You",
        "en": "That's exactly the problem. She's so clumsy and helpless it gets annoying after a while. She causes half her own problems.",
        "cn": "这恰恰就是问题。她笨手笨脚又无助，看久了很烦人。她一半的问题都是自己造成的。"
      },
      {
        "speaker": "Friend",
        "en": "Okay fair enough. I actually think Gabrielle is the funniest character on the whole show.",
        "cn": "好吧说得也对。我其实觉得加布丽尔是整部剧里最有趣的角色。"
      },
      {
        "speaker": "You",
        "en": "Eva Longoria's comic delivery is incredible. Her scenes with the gardener in season one are hilarious.",
        "cn": "伊娃·朗格利亚的喜剧表达太厉害了。她和园丁在第一季的戏太搞笑了。"
      },
      {
        "speaker": "Friend",
        "en": "The whole affair with John was ridiculous but also kind of iconic for the show.",
        "cn": "和约翰的整段婚外情很荒唐但也算是这部剧的标志性剧情了。"
      },
      {
        "speaker": "You",
        "en": "Gabby is at her best when she's being completely shallow and owning it. Her one-liners are gold.",
        "cn": "加比最出彩的时候是她完全肤浅并且坦然接受的时候。她的金句太棒了。"
      },
      {
        "speaker": "Friend",
        "en": "What about Lynette though? I feel like she's the most realistic character. All that parenting stress.",
        "cn": "那勒奈特呢？我觉得她是最现实的角色。那些育儿压力。"
      },
      {
        "speaker": "You",
        "en": "Felicity Huffman brought so much authenticity to that role. Her struggles with work-life balance felt so real.",
        "cn": "费利西蒂·赫夫曼给那个角色带来了很多真实感。她在工作和生活之间的挣扎感觉太真实了。"
      },
      {
        "speaker": "Friend",
        "en": "Her relationship with Tom is so frustrating though. He's kind of a man-child honestly.",
        "cn": "但她和汤姆的关系太让人抓狂了。他说实话有点像个大孩子。"
      },
      {
        "speaker": "You",
        "en": "Tom Scavo might be the most divisive character on the show. People either defend him or can't stand him.",
        "cn": "汤姆·斯卡沃可能是剧里最有争议的角色。人们要么为他辩护要么受不了他。"
      },
      {
        "speaker": "Friend",
        "en": "Let's talk about the side characters. Edie Britt was so entertaining before they wrote her off.",
        "cn": "我们来说说配角。伊迪·布里特在被写出局之前太有趣了。"
      },
      {
        "speaker": "You",
        "en": "Edie was the wildcard that every scene needed. The show definitely lost some energy when she left.",
        "cn": "伊迪是每个场景都需要的百搭牌。她离开后剧集确实失去了一些活力。"
      },
      {
        "speaker": "Friend",
        "en": "And Mrs. McCluskey! Karen McCluskey is the nosy neighbor everyone secretly wants in their life.",
        "cn": "还有麦克拉斯基太太！凯伦·麦克拉斯基是每个人都暗暗想要的八卦邻居。"
      },
      {
        "speaker": "You",
        "en": "Kathryn Joosten was a treasure in that role. She added so much heart to the later seasons.",
        "cn": "凯瑟琳·乔斯滕在那个角色里是个宝藏。她给后面几季增添了很多温情。"
      },
      {
        "speaker": "Friend",
        "en": "I think what makes the show work is that each housewife represents a different type of woman.",
        "cn": "我觉得让这部剧成功的是每个主妇代表一种不同类型的女性。"
      },
      {
        "speaker": "You",
        "en": "The perfectionist, the career woman, the bombshell, and the romantic. Everyone identifies with at least one.",
        "cn": "完美主义者、职业女性、大美人和浪漫主义者。每个人至少能和其中一个产生共鸣。"
      },
      {
        "speaker": "Friend",
        "en": "I'm definitely a Lynette. Constantly stressed and trying to keep everything together.",
        "cn": "我绝对是勒奈特。一直处于压力中，努力把一切维持住。"
      },
      {
        "speaker": "You",
        "en": "I'm probably a Bree. I organize my problems into neat little boxes and pretend everything is fine.",
        "cn": "我可能是布里。我把问题整整齐齐地归类，假装一切都好。"
      }
    ]
  },
  {
    "id": "review-housewives-3",
    "cat": "filmreview",
    "catName": "影视评论",
    "catEmoji": "🎥",
    "title": "Discussing Plot Twists in DH",
    "titleCn": "讨论绝望的主妇剧情反转",
    "emoji": "🎥",
    "lines": [
      {
        "speaker": "Friend",
        "en": "Desperate Housewives has some of the craziest plot twists I've ever seen on TV. Like, constantly.",
        "cn": "《绝望的主妇》有我在电视上见过的最疯狂的一些剧情反转。几乎不间断。"
      },
      {
        "speaker": "You",
        "en": "Right? Just when you think the show can't top itself, something absolutely insane happens.",
        "cn": "对吧？你刚觉得这剧不能再超越自己了，就发生了一些绝对疯狂的事。"
      },
      {
        "speaker": "Friend",
        "en": "The tornado episode in season four blew my mind. Pun totally intended. I did not expect them to go that big.",
        "cn": "第四季的龙卷风那集让我震惊。完全想玩文字游戏。我没想到他们会搞这么大。"
      },
      {
        "speaker": "You",
        "en": "That episode changed the whole dynamic of the street. Multiple characters injured, relationships destroyed overnight.",
        "cn": "那集改变了整条街的格局。多个角色受伤，关系一夜之间被摧毁。"
      },
      {
        "speaker": "Friend",
        "en": "And then there's the whole Orson running over Mike thing. That reveal had me screaming at my TV.",
        "cn": "还有奥尔森开车撞迈克的事。那个揭秘让我对着电视尖叫。"
      },
      {
        "speaker": "You",
        "en": "Bree literally married the guy who tried to kill her friend's husband. The drama writes itself.",
        "cn": "布里真的嫁给了试图杀死她朋友丈夫的人。这剧情简直自己就会写。"
      },
      {
        "speaker": "Friend",
        "en": "Season five's time jump was a bold move too. Jumping ahead five years completely reset everything.",
        "cn": "第五季的时间跳跃也是大胆之举。往前跳了五年，彻底重置了一切。"
      },
      {
        "speaker": "You",
        "en": "Some fans hated it but I thought it was smart. The show was getting stale and needed a fresh start.",
        "cn": "有些粉丝讨厌这个，但我觉得很聪明。这部剧正在变得乏味，需要一个新的开始。"
      },
      {
        "speaker": "Friend",
        "en": "The Dave Williams mystery in season five was actually really creepy. Neal McDonough was terrifying.",
        "cn": "第五季戴夫·威廉姆斯的悬疑其实真的很吓人。尼尔·麦克唐纳演得太恐怖了。"
      },
      {
        "speaker": "You",
        "en": "A guy moving to the street specifically to get revenge on someone? That's a whole other level of psycho.",
        "cn": "一个人专门搬到这条街来报复某人？那是另一个层次的变态。"
      },
      {
        "speaker": "Friend",
        "en": "But the biggest twist for me was Bree's fake pregnancy to cover for her daughter. That was so messed up.",
        "cn": "但对我来说最大的反转是布里假装怀孕来帮女儿掩盖。太离谱了。"
      },
      {
        "speaker": "You",
        "en": "Only Bree Van De Kamp would fake a pregnancy and pull it off for months. Peak Bree behavior.",
        "cn": "只有布里·范德坎普会假装怀孕并且能瞒好几个月。典型的布里行为。"
      },
      {
        "speaker": "Friend",
        "en": "The plane crash in season four was another huge one. When it hit Wisteria Lane I couldn't believe it.",
        "cn": "第四季的飞机坠毁也是一个大事件。当它撞上紫藤巷我简直不敢相信。"
      },
      {
        "speaker": "You",
        "en": "That show treated disasters like other shows treat dinner scenes. Just casually dropping catastrophes every season.",
        "cn": "那部剧对灾难的态度就像其他剧对晚餐场景一样。每季随随便便就来一场大灾难。"
      },
      {
        "speaker": "Friend",
        "en": "Remember when Carlos went blind? That came out of absolutely nowhere.",
        "cn": "记得卡洛斯失明吗？那完全是毫无征兆的。"
      },
      {
        "speaker": "You",
        "en": "And then he just kind of adapted to it? The show would introduce these huge events and sometimes resolve them weirdly fast.",
        "cn": "然后他就差不多适应了？这剧会引入这些大事件，有时候解决得奇怪地快。"
      },
      {
        "speaker": "Friend",
        "en": "The series finale twist with the murder cover-up coming back was a great way to bring everything full circle.",
        "cn": "大结局里谋杀掩盖案回归的反转是让一切首尾呼应的好方式。"
      },
      {
        "speaker": "You",
        "en": "Having all four women involved in hiding a body together was the perfect final test of their friendship.",
        "cn": "让四个女人一起参与藏尸是对她们友谊的完美最终考验。"
      },
      {
        "speaker": "Friend",
        "en": "It's funny how a show about suburban housewives had more plot twists than most thriller series.",
        "cn": "有趣的是一部关于郊区主妇的剧比大多数惊悚剧有更多的剧情反转。"
      },
      {
        "speaker": "You",
        "en": "That's the whole point though. The most dramatic stuff always happens behind the prettiest front doors.",
        "cn": "但这就是重点。最戏剧性的事总是发生在最漂亮的大门后面。"
      }
    ]
  },
  {
    "id": "book-monte-cristo-1",
    "cat": "bookreview",
    "catName": "读书评论",
    "catEmoji": "📚",
    "title": "Discussing The Count of Monte Cristo",
    "titleCn": "讨论基督山伯爵",
    "emoji": "📚",
    "lines": [
      {
        "speaker": "Friend",
        "en": "I just finished The Count of Monte Cristo and it took me like three months. That book is massive.",
        "cn": "我刚读完《基督山伯爵》，花了我大概三个月。那本书太厚了。"
      },
      {
        "speaker": "You",
        "en": "Three months isn't bad for over a thousand pages! Did you read the abridged or unabridged version?",
        "cn": "一千多页三个月不错了！你读的是删节版还是完整版？"
      },
      {
        "speaker": "Friend",
        "en": "Unabridged all the way. I figured if I'm going to read it, I might as well get the full experience.",
        "cn": "当然是完整版。我想既然要读，不如读完整的体验。"
      },
      {
        "speaker": "You",
        "en": "Respect. The unabridged version has so many subplots that the shortened version just cuts entirely.",
        "cn": "佩服。完整版有很多副线剧情是删节版完全删掉的。"
      },
      {
        "speaker": "Friend",
        "en": "The beginning in the prison is absolutely gripping. Dantes meeting Abbe Faria is such a pivotal moment.",
        "cn": "监狱里的开头部分绝对扣人心弦。唐泰斯遇到法利亚神父是一个关键时刻。"
      },
      {
        "speaker": "You",
        "en": "Faria is basically the mentor archetype done perfectly. He gives Dantes everything he needs for his transformation.",
        "cn": "法利亚基本上是完美的导师原型。他给了唐泰斯他转变所需的一切。"
      },
      {
        "speaker": "Friend",
        "en": "The escape from the Chateau d'If is one of the most thrilling sequences I've ever read in any novel.",
        "cn": "从伊夫堡越狱是我在任何小说中读过的最惊险的段落之一。"
      },
      {
        "speaker": "You",
        "en": "Being sewn into a burial sack and thrown off a cliff? Dumas really knew how to write action scenes.",
        "cn": "被缝进裹尸袋然后从悬崖上扔下去？大仲马真的很会写动作场景。"
      },
      {
        "speaker": "Friend",
        "en": "What impressed me most is how patient the Count is. He spends years setting up his revenge schemes.",
        "cn": "最让我印象深刻的是伯爵多么有耐心。他花了好几年来策划他的复仇计划。"
      },
      {
        "speaker": "You",
        "en": "That's what makes him terrifying honestly. He doesn't just want to hurt his enemies. He wants to destroy them completely.",
        "cn": "这是让他真正可怕的地方。他不只是想伤害敌人。他想彻底摧毁他们。"
      },
      {
        "speaker": "Friend",
        "en": "The way he dismantles Fernand, Danglars, and Villefort one by one is like watching chess at the highest level.",
        "cn": "他逐一摧毁费尔南、邓格拉斯和维尔福的方式就像在看最高水平的象棋。"
      },
      {
        "speaker": "You",
        "en": "Each revenge is tailored to the specific crime. Fernand gets exposed for his betrayal, Danglars loses his fortune.",
        "cn": "每个复仇都是针对具体罪行量身定制的。费尔南因为背叛被揭穿，邓格拉斯失去了财产。"
      },
      {
        "speaker": "Friend",
        "en": "Villefort's punishment is the most brutal though. His entire family crumbles around him.",
        "cn": "但维尔福的惩罚最残忍。他整个家庭在他周围崩塌。"
      },
      {
        "speaker": "You",
        "en": "That's where the book asks its biggest question. Does Dantes go too far? Innocent people get hurt in the crossfire.",
        "cn": "那正是这本书提出最大问题的地方。唐泰斯是否做过头了？无辜的人在交火中受到伤害。"
      },
      {
        "speaker": "Friend",
        "en": "Dumas also packed in so many side characters. Haydee, Maximilian, Valentine. They all have their own full stories.",
        "cn": "大仲马还塞了很多配角。海黛、马克西米利安、瓦朗蒂娜。他们都有自己完整的故事。"
      },
      {
        "speaker": "You",
        "en": "That's the beauty of the unabridged version. It's not just a revenge story. It's a whole world.",
        "cn": "这就是完整版的美妙之处。它不只是一个复仇故事。它是一整个世界。"
      },
      {
        "speaker": "Friend",
        "en": "I was also surprised by how modern it feels. The themes of justice and corruption still resonate today.",
        "cn": "我还惊讶于它感觉多么现代。正义和腐败的主题在今天仍然引起共鸣。"
      },
      {
        "speaker": "You",
        "en": "Dumas wrote it in the 1840s but the human emotions are timeless. Betrayal, ambition, revenge, forgiveness.",
        "cn": "大仲马在1840年代写的，但人类的情感是永恒的。背叛、野心、复仇、宽恕。"
      },
      {
        "speaker": "Friend",
        "en": "Honestly it might be the greatest adventure novel ever written. Nothing else comes close in scope.",
        "cn": "说实话这可能是有史以来最伟大的冒险小说。在规模上没有其他作品能媲美。"
      },
      {
        "speaker": "You",
        "en": "I'd agree with that. It's got everything: romance, intrigue, action, philosophy. The original page-turner.",
        "cn": "我同意。它什么都有：爱情、阴谋、动作、哲学。最原始的让人欲罢不能的书。"
      }
    ]
  },
  {
    "id": "book-monte-cristo-2",
    "cat": "bookreview",
    "catName": "读书评论",
    "catEmoji": "📚",
    "title": "Themes of Revenge in Monte Cristo",
    "titleCn": "基督山伯爵的复仇主题",
    "emoji": "📚",
    "lines": [
      {
        "speaker": "Friend",
        "en": "I keep thinking about Monte Cristo days after finishing it. The revenge theme really messes with your head.",
        "cn": "读完后好几天我一直在想《基督山伯爵》。复仇的主题真的让你脑子停不下来。"
      },
      {
        "speaker": "You",
        "en": "That's because Dumas doesn't make it simple. You start cheering for the Count and then start questioning him.",
        "cn": "那是因为大仲马没有把它写得简单。你一开始为伯爵欢呼，然后开始质疑他。"
      },
      {
        "speaker": "Friend",
        "en": "At the beginning I was totally on his side. Those three guys ruined his life for completely selfish reasons.",
        "cn": "一开始我完全站在他那边。那三个人因为完全自私的原因毁了他的生活。"
      },
      {
        "speaker": "You",
        "en": "Fernand wanted Mercedes, Danglars wanted his job, Villefort wanted political advancement. Pure greed all around.",
        "cn": "费尔南想要梅赛德斯，邓格拉斯想要他的职位，维尔福想要政治晋升。到处都是纯粹的贪婪。"
      },
      {
        "speaker": "Friend",
        "en": "And poor Dantes lost fourteen years of his life rotting in prison for something he didn't do. That's horrific.",
        "cn": "可怜的唐泰斯在监狱里白白浪费了十四年，因为他没做过的事。太可怕了。"
      },
      {
        "speaker": "You",
        "en": "Fourteen years with no trial, no explanation, nothing. The injustice is what makes the revenge feel justified at first.",
        "cn": "十四年没有审判，没有解释，什么都没有。这种不公正让复仇一开始感觉是正当的。"
      },
      {
        "speaker": "Friend",
        "en": "But then he starts affecting innocent people. Like Edward, Villefort's young son. That kid didn't deserve any of it.",
        "cn": "但后来他开始影响到无辜的人。比如爱德华，维尔福的小儿子。那孩子不应该承受这些。"
      },
      {
        "speaker": "You",
        "en": "That's the turning point morally. When children start suffering, you realize the Count has lost perspective.",
        "cn": "那是道德上的转折点。当孩子们开始受苦时，你意识到伯爵已经失去了分寸。"
      },
      {
        "speaker": "Friend",
        "en": "He basically plays God for most of the book. Deciding who deserves punishment and how much they should suffer.",
        "cn": "他在书的大部分时间里基本上在扮演上帝。决定谁该受惩罚以及他们该受多少苦。"
      },
      {
        "speaker": "You",
        "en": "And Dumas makes him acknowledge that at the end. The Count realizes he overstepped the boundaries of human justice.",
        "cn": "大仲马在结尾让他承认了这一点。伯爵意识到他越过了人类正义的界限。"
      },
      {
        "speaker": "Friend",
        "en": "The contrast between his patience and his ruthlessness is fascinating. He waits years but shows no mercy.",
        "cn": "他的耐心和无情之间的对比令人着迷。他等了好几年但毫不留情。"
      },
      {
        "speaker": "You",
        "en": "That's what prison did to him. It didn't just give him time to plan. It burned away his capacity for mercy.",
        "cn": "这就是监狱对他造成的影响。它不只是给了他时间去计划。它烧尽了他的怜悯之心。"
      },
      {
        "speaker": "Friend",
        "en": "Do you think Dumas is ultimately saying revenge is wrong, or that it's sometimes necessary?",
        "cn": "你觉得大仲马最终是在说复仇是错的，还是有时候是必要的？"
      },
      {
        "speaker": "You",
        "en": "I think he's saying it's understandable but ultimately self-destructive. The Count only finds peace when he lets go.",
        "cn": "我觉得他是在说复仇可以理解但最终是自我毁灭的。伯爵只有在放手后才找到了平静。"
      },
      {
        "speaker": "Friend",
        "en": "The ending with Haydee sailing away together suggests he can still be redeemed through love.",
        "cn": "结尾他和海黛一起扬帆远航暗示他仍然可以通过爱来救赎。"
      },
      {
        "speaker": "You",
        "en": "Love versus revenge is the real conflict of the whole book. Mercedes represents the love he lost, Haydee represents new hope.",
        "cn": "爱与复仇是整本书真正的冲突。梅赛德斯代表他失去的爱，海黛代表新的希望。"
      },
      {
        "speaker": "Friend",
        "en": "It's interesting that Mercedes is one of the few characters who sees through his disguise almost immediately.",
        "cn": "有意思的是梅赛德斯是少数几个几乎立刻看穿他伪装的角色之一。"
      },
      {
        "speaker": "You",
        "en": "Because their connection was real. She loved the man underneath all the wealth and scheming.",
        "cn": "因为他们之间的感情是真实的。她爱的是所有财富和阴谋之下的那个人。"
      },
      {
        "speaker": "Friend",
        "en": "Man, this book has so many layers. I feel like I'd get something completely different on a reread.",
        "cn": "天哪，这本书有太多层次了。我觉得重读的话会得到完全不同的东西。"
      },
      {
        "speaker": "You",
        "en": "That's what separates great literature from just a good story. Monte Cristo rewards you every time you come back to it.",
        "cn": "这就是伟大文学和好故事之间的区别。每次回来读《基督山伯爵》都会给你新的收获。"
      }
    ]
  },
  {
    "id": "book-gatsby-1",
    "cat": "bookreview",
    "catName": "读书评论",
    "catEmoji": "📚",
    "title": "The American Dream in Great Gatsby",
    "titleCn": "了不起的盖茨比的美国梦",
    "emoji": "📚",
    "lines": [
      {
        "speaker": "Friend",
        "en": "I reread The Great Gatsby last week and I swear it hits different when you're an adult.",
        "cn": "我上周重读了《了不起的盖茨比》，我发誓成年后读感觉完全不同。"
      },
      {
        "speaker": "You",
        "en": "Oh totally. In high school everyone focuses on the love story. As an adult you see the social commentary.",
        "cn": "完全是。高中的时候大家都关注爱情故事。成年后你看到了社会评论。"
      },
      {
        "speaker": "Friend",
        "en": "Gatsby built this whole empire just to impress a woman who's honestly not worth it.",
        "cn": "盖茨比建了这整个帝国就为了打动一个说实话不值得的女人。"
      },
      {
        "speaker": "You",
        "en": "But that's Fitzgerald's whole point. The American Dream itself is chasing something that's not worth it.",
        "cn": "但那正是菲茨杰拉德的重点。美国梦本身就是在追逐不值得的东西。"
      },
      {
        "speaker": "Friend",
        "en": "Gatsby isn't really in love with Daisy the person. He's in love with what she represents.",
        "cn": "盖茨比并不是真的爱黛西这个人。他爱的是她所代表的东西。"
      },
      {
        "speaker": "You",
        "en": "Exactly. She represents old money, status, everything he thought would make him complete. It's all an illusion.",
        "cn": "没错。她代表老钱、地位、他认为能让自己完整的一切。全是幻觉。"
      },
      {
        "speaker": "Friend",
        "en": "The green light at the end of the dock is such a perfect symbol. Always visible but never reachable.",
        "cn": "码头尽头的绿灯是一个完美的象征。总是看得见但永远够不着。"
      },
      {
        "speaker": "You",
        "en": "That image sums up the entire American experience in a way. We're all reaching for something across the water.",
        "cn": "那个意象在某种程度上总结了整个美国经历。我们都在隔着水面伸手去够什么东西。"
      },
      {
        "speaker": "Friend",
        "en": "What gets me is the class divide. No matter how rich Gatsby gets, the old money crowd still looks down on him.",
        "cn": "让我感触深的是阶级分化。无论盖茨比多富有，旧贵族圈子还是看不起他。"
      },
      {
        "speaker": "You",
        "en": "Tom Buchanan is basically the gatekeeper of old money privilege. He's awful but the system protects him.",
        "cn": "汤姆·布坎南基本上就是旧贵族特权的守门人。他很糟糕但体制保护他。"
      },
      {
        "speaker": "Friend",
        "en": "Tom is the worst character in American literature and I will die on that hill. Completely irredeemable.",
        "cn": "汤姆是美国文学中最差劲的角色，我至死不渝。完全无可救药。"
      },
      {
        "speaker": "You",
        "en": "He's racist, he's a bully, he cheats on his wife openly. And he faces zero consequences for any of it.",
        "cn": "他是种族主义者，是恶霸，公开出轨。而且他对这一切没有承受任何后果。"
      },
      {
        "speaker": "Friend",
        "en": "Meanwhile Gatsby, who actually worked for everything he has, ends up dead in his own pool.",
        "cn": "而盖茨比，一个真正靠自己努力得到一切的人，最后死在自己的泳池里。"
      },
      {
        "speaker": "You",
        "en": "And nobody comes to his funeral. That scene is devastating. All those party guests and not one shows up.",
        "cn": "而且没有人来参加他的葬礼。那个场景太令人心碎了。那么多派对客人没有一个来。"
      },
      {
        "speaker": "Friend",
        "en": "Fitzgerald was basically predicting the crash of 1929, wasn't he? All that excess had to collapse.",
        "cn": "菲茨杰拉德基本上是在预言1929年的崩盘，对吧？那些过度挥霍必然会崩塌。"
      },
      {
        "speaker": "You",
        "en": "He published it in 1925, just four years before. He could see the hollow foundation underneath all the glitter.",
        "cn": "他1925年出版的，就在四年前。他能看到所有光鲜之下空洞的根基。"
      },
      {
        "speaker": "Friend",
        "en": "Nick Carraway is an interesting narrator too. He claims to be non-judgmental but he's judging everyone the whole time.",
        "cn": "尼克·卡拉威也是一个有趣的叙述者。他声称自己不评判别人，但他整本书都在评判所有人。"
      },
      {
        "speaker": "You",
        "en": "Nick is the ultimate unreliable narrator. You have to read between his lines to get the real story.",
        "cn": "尼克是终极不可靠叙述者。你得读懂他的言外之意才能了解真实的故事。"
      },
      {
        "speaker": "Friend",
        "en": "I think the book is more relevant now than ever. Everyone's chasing clout and status on social media.",
        "cn": "我觉得这本书现在比以往任何时候都更有现实意义。每个人都在社交媒体上追逐名气和地位。"
      },
      {
        "speaker": "You",
        "en": "Gatsby would have been an Instagram influencer today, throwing parties and curating a fake perfect life. Nothing has changed.",
        "cn": "盖茨比如果在今天就会是个Instagram网红，办派对然后打造一个虚假完美的生活。什么都没变。"
      }
    ]
  },
  {
    "id": "book-gatsby-2",
    "cat": "bookreview",
    "catName": "读书评论",
    "catEmoji": "📚",
    "title": "Analyzing Gatsby's Character",
    "titleCn": "分析盖茨比人物",
    "emoji": "📚",
    "lines": [
      {
        "speaker": "Friend",
        "en": "Do you think Gatsby is actually a great man or is the title ironic?",
        "cn": "你觉得盖茨比真的了不起吗，还是书名是讽刺的？"
      },
      {
        "speaker": "You",
        "en": "That's the million-dollar question, right? I think it's both. He's great in his ambition but tragic in his delusion.",
        "cn": "这是百万美元的问题，对吧？我觉得两者都是。他的雄心让他了不起，但他的妄想让他悲剧。"
      },
      {
        "speaker": "Friend",
        "en": "His ability to reinvent himself from James Gatz to Jay Gatsby is pretty incredible when you think about it.",
        "cn": "仔细想想，他把自己从詹姆斯·盖茨重塑为杰伊·盖茨比的能力确实很不可思议。"
      },
      {
        "speaker": "You",
        "en": "He basically willed himself into a new identity through sheer determination. That takes a certain kind of genius.",
        "cn": "他基本上通过纯粹的决心把自己变成了一个新的身份。这需要某种天才。"
      },
      {
        "speaker": "Friend",
        "en": "But he built everything on a lie. The money, the background story, even the Oxford thing was mostly fabricated.",
        "cn": "但他把一切都建立在谎言上。钱、背景故事、甚至牛津的事大部分都是编造的。"
      },
      {
        "speaker": "You",
        "en": "That's the dark side of the self-made man myth. To remake yourself in America, you often have to lie.",
        "cn": "这是白手起家神话的阴暗面。要在美国重塑自己，你往往不得不撒谎。"
      },
      {
        "speaker": "Friend",
        "en": "His devotion to Daisy is both his greatest strength and his fatal flaw. He literally cannot let go.",
        "cn": "他对黛西的执着既是他最大的优点也是他的致命弱点。他真的放不下。"
      },
      {
        "speaker": "You",
        "en": "Five years he spent building that mansion across the bay just to be near her. That's obsession, not love.",
        "cn": "他花了五年在海湾对面建了那座豪宅，就为了离她近一些。那是执念，不是爱。"
      },
      {
        "speaker": "Friend",
        "en": "Yet there's something pure about it too. In a world full of phonies, his feelings are genuine at least.",
        "cn": "但其中也有某种纯粹。在一个充满虚伪的世界里，至少他的感情是真实的。"
      },
      {
        "speaker": "You",
        "en": "That's what Nick sees in him. Gatsby has this romantic readiness, this hope that nobody else has anymore.",
        "cn": "这就是尼克在他身上看到的。盖茨比有一种浪漫的准备，一种其他人都不再有的希望。"
      },
      {
        "speaker": "Friend",
        "en": "Compared to Tom and Daisy who are just careless people who smash things and retreat into their money.",
        "cn": "相比之下汤姆和黛西只是粗心的人，打碎东西然后躲回他们的钱里。"
      },
      {
        "speaker": "You",
        "en": "That line about them being careless people is one of the most savage things ever written. Fitzgerald had no chill.",
        "cn": "关于他们是粗心的人那句话是有史以来最尖刻的文字之一。菲茨杰拉德毫不客气。"
      },
      {
        "speaker": "Friend",
        "en": "What do you make of Gatsby's criminal connections? The whole bootlegging and Meyer Wolfsheim thing.",
        "cn": "你怎么看盖茨比的犯罪关系？整个走私酒和迈耶·沃尔夫沙姆的事。"
      },
      {
        "speaker": "You",
        "en": "It shows that the American Dream has always been linked to corruption. You can't get that rich playing by the rules.",
        "cn": "这说明美国梦一直和腐败联系在一起。你不可能按规矩来致富到那种程度。"
      },
      {
        "speaker": "Friend",
        "en": "Wolfsheim is based on a real person too, which makes the whole thing feel more grounded in reality.",
        "cn": "沃尔夫沙姆也是以真人为原型的，这让整件事感觉更扎根于现实。"
      },
      {
        "speaker": "You",
        "en": "Fitzgerald was writing about real people and real corruption in the Jazz Age. The fiction was barely fiction.",
        "cn": "菲茨杰拉德写的是爵士时代真实的人和真实的腐败。小说几乎不算小说。"
      },
      {
        "speaker": "Friend",
        "en": "I think what makes Gatsby sympathetic despite everything is that he genuinely believes in the possibility of change.",
        "cn": "我觉得尽管如此让盖茨比令人同情的是他真正相信改变的可能性。"
      },
      {
        "speaker": "You",
        "en": "He thinks you can repeat the past. Nick tells him you can't, and Gatsby just refuses to accept it.",
        "cn": "他认为你可以重复过去。尼克告诉他不能，盖茨比就是拒绝接受。"
      },
      {
        "speaker": "Friend",
        "en": "That stubborn hopefulness is very American in a way. Always believing tomorrow will be better.",
        "cn": "那种固执的希望在某种程度上很美国。总是相信明天会更好。"
      },
      {
        "speaker": "You",
        "en": "And that's exactly why the book endures. Gatsby is America. Brilliant, hopeful, doomed, and absolutely unforgettable.",
        "cn": "这正是这本书经久不衰的原因。盖茨比就是美国。才华横溢、充满希望、注定失败、而且绝对令人难忘。"
      }
    ]
  },
  {
    "id": "book-mockingbird-1",
    "cat": "bookreview",
    "catName": "读书评论",
    "catEmoji": "📚",
    "title": "Discussing To Kill a Mockingbird",
    "titleCn": "讨论杀死一只知更鸟",
    "emoji": "📚",
    "lines": [
      {
        "speaker": "Friend",
        "en": "I just reread To Kill a Mockingbird for the first time since middle school. I forgot how powerful it is.",
        "cn": "我刚重读了《杀死一只知更鸟》，这是中学以来第一次。我忘了它有多震撼。"
      },
      {
        "speaker": "You",
        "en": "It hits so much harder as an adult. When you're a kid you follow Scout's adventure. As an adult you see the injustice.",
        "cn": "成年后读冲击力更大。小时候你跟着斯库特的冒险走。成年后你看到了不公正。"
      },
      {
        "speaker": "Friend",
        "en": "The trial of Tom Robinson is gut-wrenching. You know he's innocent and you know the jury will convict him anyway.",
        "cn": "汤姆·罗宾逊的审判令人揪心。你知道他是无辜的，你也知道陪审团还是会定他有罪。"
      },
      {
        "speaker": "You",
        "en": "That's what makes it so devastating. Harper Lee doesn't give you a fairy tale ending. She gives you reality.",
        "cn": "这就是它如此令人心碎的原因。哈珀·李没有给你一个童话结局。她给你的是现实。"
      },
      {
        "speaker": "Friend",
        "en": "Seeing it through Scout's innocent eyes makes the racism even more obvious. A child can see the injustice that adults ignore.",
        "cn": "通过斯库特天真的眼睛看让种族主义更加明显。一个孩子能看到大人忽视的不公正。"
      },
      {
        "speaker": "You",
        "en": "That's the brilliance of the child narrator. Scout asks the questions that adults are too afraid or too corrupted to ask.",
        "cn": "这就是儿童叙述者的妙处。斯库特问出了大人们太害怕或太堕落而不敢问的问题。"
      },
      {
        "speaker": "Friend",
        "en": "Boo Radley fascinated me as a kid but now I realize his story is about prejudice too, just a different kind.",
        "cn": "布·拉德利小时候让我着迷，但现在我意识到他的故事也是关于偏见的，只是不同类型的。"
      },
      {
        "speaker": "You",
        "en": "People fear what they don't understand. The whole town turned Boo into a monster based on rumors and ignorance.",
        "cn": "人们害怕他们不理解的东西。整个镇子基于谣言和无知把布变成了怪物。"
      },
      {
        "speaker": "Friend",
        "en": "The moment when Scout finally meets Boo and says \"Hey, Boo\" is one of the most touching scenes in all of literature.",
        "cn": "斯库特终于见到布然后说\"嘿，布\"的那一刻是所有文学作品中最感人的场景之一。"
      },
      {
        "speaker": "You",
        "en": "It's so simple but so profound. All the fear and mystery dissolves into basic human connection.",
        "cn": "如此简单但如此深刻。所有的恐惧和神秘都消融成了基本的人与人之间的联系。"
      },
      {
        "speaker": "Friend",
        "en": "I think the book also does a great job showing how racism is taught, not innate. The kids learn it from adults.",
        "cn": "我觉得这本书也很好地展示了种族主义是后天教会的，不是天生的。孩子们从大人那里学来的。"
      },
      {
        "speaker": "You",
        "en": "Scout and Jem start confused by the hatred around them. They have to be taught to see people as different.",
        "cn": "斯库特和杰姆一开始对周围的仇恨感到困惑。他们必须被教导才会把人看成不同的。"
      },
      {
        "speaker": "Friend",
        "en": "Calpurnia is such an important character too. She bridges two worlds and shows the kids a broader perspective.",
        "cn": "卡尔珀尼亚也是一个很重要的角色。她连接了两个世界，给孩子们展示了更广阔的视角。"
      },
      {
        "speaker": "You",
        "en": "The scene where she takes the kids to her church is eye-opening for them and for the reader.",
        "cn": "她带孩子们去她的教堂那场戏对他们和读者来说都大开眼界。"
      },
      {
        "speaker": "Friend",
        "en": "Do you think the book is still relevant today or has it become just a historical piece?",
        "cn": "你觉得这本书今天还有现实意义吗，还是它只是一部历史作品了？"
      },
      {
        "speaker": "You",
        "en": "Unfortunately it's still incredibly relevant. The themes of racial injustice haven't gone away. They've just evolved.",
        "cn": "不幸的是它仍然非常有现实意义。种族不公的主题没有消失。只是演变了。"
      },
      {
        "speaker": "Friend",
        "en": "That's depressing but true. The book was set in the 1930s and we're still dealing with the same issues.",
        "cn": "这很令人沮丧但是是事实。这本书的背景是1930年代，我们仍在面对同样的问题。"
      },
      {
        "speaker": "You",
        "en": "That's exactly why every generation needs to read it. The lessons never expire.",
        "cn": "这正是为什么每一代人都需要读它。这些教训永远不会过时。"
      },
      {
        "speaker": "Friend",
        "en": "Harper Lee only wrote two novels and one of them is arguably the most important American novel ever. That's wild.",
        "cn": "哈珀·李只写了两部小说，其中一部可以说是有史以来最重要的美国小说。太不可思议了。"
      },
      {
        "speaker": "You",
        "en": "Sometimes you only need to say one thing if you say it perfectly. And she absolutely did.",
        "cn": "有时候如果你说得完美，你只需要说一件事。她绝对做到了。"
      }
    ]
  },
  {
    "id": "book-mockingbird-2",
    "cat": "bookreview",
    "catName": "读书评论",
    "catEmoji": "📚",
    "title": "Atticus Finch as a Role Model",
    "titleCn": "阿提克斯·芬奇作为榜样",
    "emoji": "📚",
    "lines": [
      {
        "speaker": "Friend",
        "en": "Atticus Finch is probably the most admired character in American literature. Every lawyer I know mentions him.",
        "cn": "阿提克斯·芬奇大概是美国文学中最受敬仰的角色。我认识的每个律师都会提到他。"
      },
      {
        "speaker": "You",
        "en": "He's the gold standard for moral courage. Standing up for what's right when the whole town is against you takes guts.",
        "cn": "他是道德勇气的黄金标准。当全镇都反对你时，为正确的事站出来需要勇气。"
      },
      {
        "speaker": "Friend",
        "en": "Gregory Peck in the movie basically defined how everyone pictures Atticus. Tall, calm, principled.",
        "cn": "电影里的格里高利·派克基本上定义了每个人心中阿提克斯的形象。高大、沉稳、有原则。"
      },
      {
        "speaker": "You",
        "en": "Peck said it was his favorite role ever. He felt like he was playing the ideal version of what a man should be.",
        "cn": "派克说那是他最喜欢的角色。他觉得自己在演一个男人应该成为的理想版本。"
      },
      {
        "speaker": "Friend",
        "en": "What I love about Atticus is that he doesn't preach to his kids. He teaches them by example.",
        "cn": "我喜欢阿提克斯的一点是他不对孩子说教。他通过以身作则来教导他们。"
      },
      {
        "speaker": "You",
        "en": "Like when he shoots the rabid dog. Scout and Jem had no idea their quiet dad was the best shot in the county.",
        "cn": "比如他打死疯狗的时候。斯库特和杰姆根本不知道他们安静的爸爸是全县最好的射手。"
      },
      {
        "speaker": "Friend",
        "en": "That scene teaches humility without a single lecture. Real strength doesn't need to show off.",
        "cn": "那场戏不用一句说教就教会了谦逊。真正的力量不需要炫耀。"
      },
      {
        "speaker": "You",
        "en": "And when he sits outside the jail to protect Tom Robinson. No weapons, just his presence and his principles.",
        "cn": "还有他坐在监狱外面保护汤姆·罗宾逊的时候。没有武器，只有他的存在和他的原则。"
      },
      {
        "speaker": "Friend",
        "en": "That scene is terrifying. The mob shows up and it's Scout who diffuses the situation by being innocent and kind.",
        "cn": "那场戏很吓人。暴民出现了，是斯库特用天真和善良化解了局面。"
      },
      {
        "speaker": "You",
        "en": "She learned that from Atticus. Treating people like humans even when they're acting like monsters.",
        "cn": "她是从阿提克斯那里学来的。即使人们表现得像怪物，也把他们当人对待。"
      },
      {
        "speaker": "Friend",
        "en": "But some critics say Atticus is too perfect. That he's not a realistic character but a moral fantasy.",
        "cn": "但有些评论家说阿提克斯太完美了。他不是一个真实的角色，而是一个道德幻想。"
      },
      {
        "speaker": "You",
        "en": "That criticism has some merit especially after Go Set a Watchman came out and showed an older, more flawed Atticus.",
        "cn": "这个批评有一定道理，尤其是在《设立守望者》出版后，展示了一个更老、更有缺陷的阿提克斯。"
      },
      {
        "speaker": "Friend",
        "en": "That sequel was controversial. A lot of fans felt betrayed seeing Atticus with racist views.",
        "cn": "那个续集很有争议。很多粉丝看到阿提克斯有种族主义观点时感到被背叛了。"
      },
      {
        "speaker": "You",
        "en": "I think the original Atticus still matters though. Literature needs ideals to aspire to, even if they're not perfectly realistic.",
        "cn": "但我觉得原来的阿提克斯仍然重要。文学需要可以追求的理想，即使它们不是完美的现实。"
      },
      {
        "speaker": "Friend",
        "en": "His line about walking in someone else's shoes is something I genuinely try to live by.",
        "cn": "他关于穿别人的鞋走路的那句话是我真正努力践行的。"
      },
      {
        "speaker": "You",
        "en": "That's maybe the most important lesson in the whole book. Empathy as a daily practice, not just a nice idea.",
        "cn": "那可能是整本书中最重要的教训。同理心作为日常实践，而不只是一个好想法。"
      },
      {
        "speaker": "Friend",
        "en": "He also shows that doing the right thing doesn't mean you'll win. He loses the case but he still fought.",
        "cn": "他还展示了做正确的事并不意味着你会赢。他输了案子但他还是战斗了。"
      },
      {
        "speaker": "You",
        "en": "That's real courage. Not guaranteed victory but doing it anyway because it's the right thing to do.",
        "cn": "那才是真正的勇气。不是保证胜利，而是因为那是正确的事所以还是去做。"
      },
      {
        "speaker": "Friend",
        "en": "No wonder law schools use him as a model. He represents what the justice system should be.",
        "cn": "难怪法学院用他作为榜样。他代表了司法系统应该是什么样的。"
      },
      {
        "speaker": "You",
        "en": "Atticus shows that one person with integrity can make a difference even if the system is broken. That's a timeless message.",
        "cn": "阿提克斯展示了一个有正直品格的人即使在系统崩坏时也能产生影响。这是一个永恒的信息。"
      }
    ]
  },
  {
    "id": "book-catcher-1",
    "cat": "bookreview",
    "catName": "读书评论",
    "catEmoji": "📚",
    "title": "Understanding The Catcher in the Rye",
    "titleCn": "理解麦田守望者",
    "emoji": "📚",
    "lines": [
      {
        "speaker": "Friend",
        "en": "I finally read The Catcher in the Rye and honestly I'm not sure if I liked it or hated it.",
        "cn": "我终于读了《麦田守望者》，说实话我不确定我是喜欢还是讨厌。"
      },
      {
        "speaker": "You",
        "en": "That's literally the most common reaction to that book. Holden Caulfield is designed to be divisive.",
        "cn": "这基本上是对那本书最常见的反应。霍尔顿·考菲尔德就是被设计成有争议的。"
      },
      {
        "speaker": "Friend",
        "en": "He complains about everything being phony but he's kind of a phony himself. He lies constantly.",
        "cn": "他抱怨一切都是虚伪的，但他自己就有点虚伪。他不停地撒谎。"
      },
      {
        "speaker": "You",
        "en": "That's part of the point though. He's a hypocrite and he knows it deep down, which makes him even more miserable.",
        "cn": "但这就是重点的一部分。他是个伪君子，内心深处他自己知道，这让他更加痛苦。"
      },
      {
        "speaker": "Friend",
        "en": "The writing style threw me off at first. It's so rambling and informal. Like a teenager just talking at you.",
        "cn": "写作风格一开始让我不适应。太啰嗦太随意了。就像一个青少年在对你说个不停。"
      },
      {
        "speaker": "You",
        "en": "That's exactly what Salinger was going for. The stream of consciousness style captures how a teenager actually thinks.",
        "cn": "这正是塞林格想要的效果。意识流的风格捕捉了青少年实际上是怎么思考的。"
      },
      {
        "speaker": "Friend",
        "en": "I guess when it came out in 1951 it was pretty revolutionary. Nobody was writing like that for young people.",
        "cn": "我猜它在1951年出版的时候是很革命性的。当时没有人为年轻人这样写作。"
      },
      {
        "speaker": "You",
        "en": "It basically invented the modern young adult voice. Every angsty teen narrator since then owes something to Holden.",
        "cn": "它基本上发明了现代青少年叙事声音。从那以后每一个焦虑的青少年叙述者都欠霍尔顿一些东西。"
      },
      {
        "speaker": "Friend",
        "en": "What do you think the whole book is really about? Because on the surface not much actually happens.",
        "cn": "你觉得整本书真正讲的是什么？因为表面上其实没发生什么事。"
      },
      {
        "speaker": "You",
        "en": "It's about grief and the fear of growing up. Everything traces back to his brother Allie's death.",
        "cn": "它是关于悲伤和对长大的恐惧。一切都追溯到他弟弟阿利的死。"
      },
      {
        "speaker": "Friend",
        "en": "Oh right, the red hunting hat and the baseball mitt. Those symbols are tied to Allie, aren't they?",
        "cn": "哦对，红色猎帽和棒球手套。那些象征和阿利有关，对吧？"
      },
      {
        "speaker": "You",
        "en": "The hat is basically his security blanket. He puts it on when he feels vulnerable. It's a connection to childhood innocence.",
        "cn": "那顶帽子基本上是他的安全毯。他在感到脆弱的时候就戴上。它是与童年纯真的连接。"
      },
      {
        "speaker": "Friend",
        "en": "The title itself is about protecting children from losing their innocence. The catcher in the rye fantasy.",
        "cn": "书名本身就是关于保护孩子们不失去天真。麦田守望者的幻想。"
      },
      {
        "speaker": "You",
        "en": "He wants to stand at the edge of a cliff and catch kids before they fall into adulthood. It's beautiful and impossible.",
        "cn": "他想站在悬崖边在孩子们坠入成人世界前接住他们。这既美丽又不可能。"
      },
      {
        "speaker": "Friend",
        "en": "The scene with his little sister Phoebe at the carousel at the end always gets me emotional.",
        "cn": "结尾他妹妹菲比在旋转木马上的那场戏总是让我感动。"
      },
      {
        "speaker": "You",
        "en": "That's the turning point. He watches her reach for the gold ring and realizes he has to let kids take risks.",
        "cn": "那是转折点。他看着她伸手去够金环，意识到他必须让孩子们冒险。"
      },
      {
        "speaker": "Friend",
        "en": "Is the ending hopeful or not? He's in some kind of institution telling us this story.",
        "cn": "结局是充满希望的还是不是？他在某种机构里给我们讲这个故事。"
      },
      {
        "speaker": "You",
        "en": "I think it's cautiously hopeful. He's getting help and he misses people, which shows he's still connected to the world.",
        "cn": "我觉得是谨慎乐观的。他在接受帮助，他想念人们，这说明他还和这个世界有联系。"
      },
      {
        "speaker": "Friend",
        "en": "I think I need to reread it in a few years. I have a feeling I'll understand Holden better the second time around.",
        "cn": "我觉得我需要过几年再读一次。我有一种感觉第二次我会更理解霍尔顿。"
      },
      {
        "speaker": "You",
        "en": "Definitely. It's one of those books that changes based on where you are in life. Teenagers love him, adults understand him.",
        "cn": "肯定的。这是那种根据你人生阶段不同而改变的书。青少年喜欢他，成年人理解他。"
      }
    ]
  },
  {
    "id": "book-catcher-2",
    "cat": "bookreview",
    "catName": "读书评论",
    "catEmoji": "📚",
    "title": "Holden Caulfield's Rebellion",
    "titleCn": "霍尔顿的叛逆",
    "emoji": "📚",
    "lines": [
      {
        "speaker": "Friend",
        "en": "Do you think Holden Caulfield is actually rebelling against anything or is he just a spoiled rich kid whining?",
        "cn": "你觉得霍尔顿·考菲尔德真的在反抗什么，还是他只是一个被宠坏的富家子在抱怨？"
      },
      {
        "speaker": "You",
        "en": "Both can be true at the same time. He's privileged and he's also genuinely suffering. Those aren't mutually exclusive.",
        "cn": "两者可以同时成立。他有特权，同时也在真正受苦。这两者不矛盾。"
      },
      {
        "speaker": "Friend",
        "en": "But what's he actually rebelling against? He gets kicked out of fancy prep schools because he won't try.",
        "cn": "但他到底在反抗什么？他因为不努力被精英预科学校开除。"
      },
      {
        "speaker": "You",
        "en": "He's rebelling against the adult world and all its phoniness. Every institution he encounters disappoints him.",
        "cn": "他在反抗成人世界和它所有的虚伪。他遇到的每一个机构都让他失望。"
      },
      {
        "speaker": "Friend",
        "en": "The schools, the teachers, the movies, social conventions. He rejects everything mainstream society values.",
        "cn": "学校、老师、电影、社会惯例。他拒绝主流社会重视的一切。"
      },
      {
        "speaker": "You",
        "en": "But here's the thing. His rebellion has no direction. He knows what he's against but not what he's for.",
        "cn": "但关键是，他的叛逆没有方向。他知道自己反对什么但不知道自己支持什么。"
      },
      {
        "speaker": "Friend",
        "en": "That actually sounds like a lot of teenagers. Angry at the world without a clear alternative.",
        "cn": "这其实听起来像很多青少年。对世界愤怒但没有明确的替代方案。"
      },
      {
        "speaker": "You",
        "en": "Which is why every generation of teenagers sees themselves in Holden. That feeling of being stuck is universal.",
        "cn": "这就是为什么每一代青少年都在霍尔顿身上看到自己。那种被困住的感觉是普遍的。"
      },
      {
        "speaker": "Friend",
        "en": "His encounter with Mr. Antolini is really interesting. The teacher tries to help but even that gets complicated.",
        "cn": "他和安托利尼先生的遭遇很有趣。老师试图帮助他，但即使那也变得复杂了。"
      },
      {
        "speaker": "You",
        "en": "Antolini gives him genuinely good advice about finding purpose, but then the ambiguous situation on the couch ruins everything.",
        "cn": "安托利尼给了他关于找到目标的真正好建议，但后来沙发上的暧昧情况毁了一切。"
      },
      {
        "speaker": "Friend",
        "en": "That scene is so debated. Was Antolini being inappropriate or was Holden misreading the situation?",
        "cn": "那个场景争议很大。安托利尼是有不当行为还是霍尔顿误解了情况？"
      },
      {
        "speaker": "You",
        "en": "Salinger intentionally left it ambiguous. It shows how Holden can't trust anyone, even people who might genuinely care.",
        "cn": "塞林格故意留了模糊。它展示了霍尔顿无法信任任何人，即使是那些可能真正关心他的人。"
      },
      {
        "speaker": "Friend",
        "en": "His interactions with the nuns and the little kids are his most genuine moments. He's only real with the innocent.",
        "cn": "他和修女以及小孩子的互动是他最真实的时刻。他只有和纯真的人在一起才真实。"
      },
      {
        "speaker": "You",
        "en": "Because he sees them as uncorrupted. They haven't been ruined by the adult world yet, so they're safe.",
        "cn": "因为他认为他们没有被污染。他们还没有被成人世界毁掉，所以是安全的。"
      },
      {
        "speaker": "Friend",
        "en": "Reading it now, I think Holden clearly has depression and PTSD. His brother died, his classmate committed suicide.",
        "cn": "现在读来，我觉得霍尔顿明显有抑郁症和创伤后应激障碍。他弟弟死了，他的同学自杀了。"
      },
      {
        "speaker": "You",
        "en": "In 1951 nobody had that language for it. Salinger captured mental illness before anyone knew what to call it.",
        "cn": "在1951年没有人有这样的术语。塞林格在任何人知道怎么称呼之前就捕捉到了精神疾病。"
      },
      {
        "speaker": "Friend",
        "en": "And Salinger himself had severe PTSD from World War Two. He was at D-Day and the liberation of concentration camps.",
        "cn": "而且塞林格自己也有严重的二战创伤后应激障碍。他经历了诺曼底登陆和解放集中营。"
      },
      {
        "speaker": "You",
        "en": "That experience absolutely informed the book. Holden's alienation mirrors what a lot of veterans felt coming home.",
        "cn": "那段经历绝对影响了这本书。霍尔顿的疏离感反映了很多退伍军人回家后的感受。"
      },
      {
        "speaker": "Friend",
        "en": "So his rebellion isn't really rebellion. It's a cry for help disguised as teenage attitude.",
        "cn": "所以他的叛逆并不真的是叛逆。它是伪装成青少年态度的求助呼声。"
      },
      {
        "speaker": "You",
        "en": "That's the most accurate reading in my opinion. Behind all the sarcasm is a kid who's drowning and doesn't know how to ask for a lifeline.",
        "cn": "在我看来这是最准确的解读。在所有讽刺背后是一个正在溺水却不知道如何求救的孩子。"
      }
    ]
  }
];
