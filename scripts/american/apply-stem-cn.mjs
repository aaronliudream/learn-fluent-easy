/**
 * ④ 给关5/关10 填空句型题注入 stem_cn(填入正确答案后整句的中文翻译)。
 * 按行注入,保留原 JSON 一行一题的排版;key=题干原文(未转义),已存在 stem_cn 的行跳过。
 * 数据源:本文件 CN 映射(CC 生成,双角色自审:译文必须对应"填答案后的完整句")。
 * 用法: node scripts/american/apply-stem-cn.mjs   → 改 docs/american/book2/am2_l*.json,后续重跑 seed 生效。
 */
import { readFileSync, writeFileSync } from "node:fs";

// { lesson_id: { "题干原文(与 JSON 中 stem 完全一致,未转义)": "中文翻译" } }
const CN = {
  am2_l09: {
    '"The clock stopped ___ five to twelve."(具体钟点)': "大钟在差五分十二点时停了。",
    '"___ that moment, everybody laughed."': "就在那一刻,所有人都笑了。",
    '"The war ended ___ 1945."(年份)': "战争在1945年结束。",
    '"It is very cold ___ winter."(季节)': "冬天非常冷。",
    '"I get up early ___ the morning."': "我早上起得很早。",
    '"We went to the Town Hall ___ Wednesday."(星期)': "我们星期三去了市政厅。",
    '"My birthday is ___ November 7th."(具体日期)': "我的生日在11月7号。",
    '"The train is leaving ___ ten minutes."(十分钟后)': "火车十分钟后出发。",
    '"The clock would strike twelve ___ twenty minutes\' time."(20分钟后)': "再过二十分钟,大钟就会敲响十二点。",
    '"He got married ___ twenty."(在20岁时)': "他在二十岁时结了婚。",
    '"The shops are open ___ 9 ___ 5."(从9点到5点)': "商店从九点开到五点。",
    '"The movie starts ___ 8 o\'clock."(钟点)': "电影八点开始。",
    '"It often snows ___ January."(只说月份)': "一月常常下雪。",
  },
  am2_l10: {
    '"The instrument ___ made in Germany."(一般过去被动,单数)': "这件乐器是在德国制造的。",
    '"This song ___ by many people."(一般现在被动,单数)': "这首歌被许多人传唱。",
    '"Our papers ___ every morning."(deliver,一般现在被动,复数)': "我们的报纸每天早上被送来。",
    '"The bridge ___ in 1942."(build,一般过去被动)': "这座桥建于1942年。",
    '"Two strings ___ by the visitor."(break,一般过去被动,复数)': "两根琴弦被那位访客弄断了。",
    '"The clavichord ___ by my grandpa."(buy,一般过去被动)': "这架古钢琴是我爷爷买的。",
    '"This bridge was built ___ prisoners of war."(指出谁建的)': "这座桥是战俘建造的。",
    '"The window ___ by the boy."(break,一般过去被动)': "窗户是那个男孩打破的。",
    '"Rice ___ in many countries."(grow,一般现在被动)': "水稻在许多国家被种植。",
  },
  am2_l11: {
    '"Tony worked in an office before, but he ___ at a bank now."(now，现在进行)': "托尼以前在办公室上班,但现在他在一家银行工作。",
    '"Tony ___ in a lawyer\'s office years ago."(years ago，一般过去)': "托尼几年前在一家律师事务所工作。",
    '"To my surprise, he ___ me the money immediately."(give,过去完成的动作)': "令我意外的是,他立刻把钱给了我。",
    '"He ___ money from me before."(never,到现在为止的经历，现在完成)': "他以前从没向我借过钱。",
    '"I ___ dinner when Tony walked in."(have,过去某刻正在进行，过去进行)': "托尼走进来时,我正在吃晚饭。",
    '"___ he was eating, I asked him to lend me money."(过去某段时间正在进行)': "他吃饭的时候,我请他借我一些钱。",
    '"This bridge ___ in 1990."(build,某物\'被建\'，被动语态复习)': "这座桥建于1990年。",
    '"Listen! Someone ___ at the door."(Listen!，此刻正在)': "听!有人正在敲门。",
    '"Tony saw me, ___ he came over and sat down."(两件事相加，并列)': "托尼看见了我,就走过来坐下了。",
    '"He gets a good salary, ___ he always borrows money."(前后相反，转折)': "他薪水不错,但他总是借钱。",
    '"He didn\'t buy the car, ___ he was short of money."(表原因)': "他没买那辆车,因为他钱不够。",
    '"I asked him ___ me twenty dollars."(ask sb to do)': "我请他借给我二十美元。",
    '"The teacher wants us ___ hard."(want sb to do)': "老师希望我们努力学习。",
    '"He ___ money from his friends every week."(every week,习惯，一般现在)': "他每周都向朋友借钱。",
    '"I ___ TV when the phone rang."(过去某刻正在，过去进行)': "电话响的时候,我正在看电视。",
  },
  am2_l12: {
    '"Captain Reed ___ tomorrow."(sail,一般将来)': "里德船长明天将起航。",
    '"We ___ him at the dock."(meet,一般将来)': "我们将去码头迎接他。",
    '"He ___ away for two months."(将来的状态:不在)': "他将离开两个月。",
    '"We ___ at the dock early tomorrow."(将来在某地)': "明天一早我们就会在码头。",
    '"I ___ buy a new bike next week."(打算、计划好要做)': "我下周打算买辆新自行车。",
    '"Dark clouds are gathering. It ___ rain."(有迹象、马上要发生)': "乌云正在聚集,快要下雨了。",
    '"The train ___ at 8:20."(时刻表，一般现在时表将来)': "火车8点20分发车。",
    '"We ___ a party this Friday."(已安排好，现在进行表将来)': "这周五我们要办一场聚会。",
    '"They ___ here on foot tomorrow."(come,一般将来)': "他们明天会步行来这儿。",
    '"Look at those clouds! It ___ snow."(有迹象、马上要发生)': "看那些云!要下雪了。",
  },
  am2_l13: {
    '"They ___ here tomorrow."(arrive,将来进行时)': "他们明天将要到达这儿。",
    '"This time tomorrow, I ___ on the beach."(lie,将来进行)': "明天这个时候,我将躺在沙滩上。",
  },
  am2_l14: {
    '"After I ___ the village, I drove on."(leave,先离开，过去完成)': "我离开村庄后,继续往前开。",
    '"When he ___ lunch, he asked for water."(finish,先吃完，过去完成)': "他吃完午饭后,要了些水。",
    '"The children ran away ___ they had broken the window."(在…之后)': "孩子们打碎窗户之后就跑掉了。",
    '"___ the sun had set, we returned to the hotel."(太阳一下山就…)': "太阳一下山,我们就回了旅馆。",
    '"She went to the post office ___ she had written the letter."(先写完信)': "她写完信后去了邮局。",
    '"I ___ the problem until he explained it."(否定 + until,过去完成)': "直到他解释,我才弄懂这个问题。",
    '"When I got to the station, the train ___ already ___."(我到之前车已开走，过去完成)': "我到车站时,火车已经开走了。",
    '"I ___ to go shopping, but my mom came."(本打算…但没成)': "我本打算去购物,但我妈妈来了。",
    '"She ___ that he would come, but he didn\'t."(原本希望…但落空)': "她原本希望他会来,但他没来。",
    '"It was the third time that I ___ him."(正式/书面:此句式规范用过去完成)': "那是我第三次见他。",
    '"___ you ever seen him before that day?"(过去完成疑问)': "那天之前你见过他吗?",
    '"By six o\'clock, they ___ dinner."(到六点之前已吃完，过去完成)': "到六点时,他们已经吃完晚饭了。",
    '"God helps those who help ___."(动作回到自己身上,用反身代词)': "天助自助者(上天帮助自己帮自己的人)。",
    '"The young man was English ___."(强调"他本人就是",课文原句)': "那青年本人就是英国人。",
    '"He told me that he ___ the book before."(read,更早读过，过去完成)': "他告诉我他以前读过这本书。",
    '"By the time we arrived, the movie ___."(我们到之前已开始，过去完成)': "我们到的时候,电影已经开始了。",
  },
  am2_l15: {
    '"He said ___ business was bad."(引出转述的内容)': "他说生意很糟糕。",
    '"I don\'t know ___ he will come."(表示\'是否\',后面无 or not)': "我不知道他是否会来。",
    '"I don\'t know ___ or not he comes."(紧跟 or not,只能用):': "我不知道他到底来不来。",
    '"He said he ___ go to the north for vacation."(从过去看将来,过去将来时)': "他说他要去北方度假。",
    '"He said that he ___ busy that day."(转述过去,is 要变成什么)': "他说他那天很忙。",
    '"She told me that she ___ finished the work."(have finished 要变成什么)': "她告诉我她已经完成了那项工作。",
  },
  am2_l16: {
    '"If it ___ tomorrow, we will stay home."(rain,if 那半句用现在时)': "如果明天下雨,我们就待在家里。",
    '"If you park here, a police officer ___ your car."(find,后半句用将来)': "如果你停在这儿,警察会找到你的车。",
    '"If he is working, I ___ disturb him."(后半句:不去打扰)': "如果他在工作,我就不去打扰他。",
    '"If you make a mistake, ___ it."(if + 让人做某事:改正它)': "如果你犯了错,就改正它。",
    '"If you see him, ___ you tell him about it?"(if + 疑问)': "如果你见到他,你会告诉他这件事吗?",
    '"You ___ the train if you don\'t hurry."(miss,后半句将来)': "如果你不快点,就会错过火车。",
    '"If they can help you, they ___."(条件成立,主句表将来)': "如果他们能帮你,他们会帮的。",
    '"Traffic police ___ sometimes very polite."(police 用复数)': "交通警察有时非常客气。",
    '"My family ___ all early risers."(把家人看成一个个成员,用复数)': "我家人都是早起的人。",
    '"The father as well as his children ___ here."(as well as 跟前面的 father)': "父亲和他的孩子们都在这儿。",
    '"Neither you nor he ___ right."(neither…nor 跟离得近的 he)': "你和他都不对。",
    '"If you ___ hard, you will pass the test."(if 那半句用一般现在时,不用将来时)': "如果你努力学习,就会通过考试。",
    '"If he plays well, he ___ into the team."(get,后半句用将来)': "如果他表现出色,就会入选球队。",
    '"The police ___ looking for the thief." 横线填(police 用复数):': "警察正在搜捕小偷。",
  },
  am2_l01: {
    'The pizza smells ___.': "这披萨闻起来很香。",
    'He looked ___ when he heard the news.': "他听到那消息时看起来很生气。",
    '"___ do you go to the theater?"(答:By subway.)': "你怎么去剧院?",
    '"___ seat is this? It\'s mine."': "这是谁的座位?是我的。",
    '"___ do you go to the theater?"(答:Three times a year.)': "你多久去一次剧院?",
    '"How ___ is the theater from here?"(答:About two miles.)': "剧院离这儿有多远?",
    'I looked at ___ angrily.(指那对情侣)': "我生气地看着他们。",
    '"pay no attention" = "not pay ___ attention"': "一点都不理会(pay no attention = not pay any attention)。",
  },
  am2_l02: {
    '"She ___ me every weekend."(每周都打来的习惯)': "她每周都给我打电话。",
    '"The sun ___ in the east and ___ in the west."(客观事实)': "太阳从东边升起,从西边落下。",
    '"Look outside! It ___ right now."(此刻正在下)': "快看外面!现在正在下雨。",
    '"What ___ you ___ now?" — "I\'m having breakfast."': "你现在在做什么?——我在吃早餐。",
    '"He ___ to work by subway every day, but today he ___ the bus."': "他每天坐地铁上班,但今天他改乘公交车。",
    '"Be quiet! The baby ___."(此刻)': "安静!宝宝在睡觉。",
    '"___ a rainy day!"(感叹"多雨/糟糕的一天")': "多糟糕的雨天啊!",
    '"___ fast time flies!"(感叹时间过得快)': "时间过得真快啊!",
    '"I stayed up late, so I went ___ bed after midnight."(上床睡觉)': "我熬夜了,所以过了午夜才上床睡觉。",
    '"He doesn\'t get up early. He gets up ___."(起得晚)': "他不早起,他起得晚。",
    '"Look! It ___ outside now."(此刻正在下雨)': "快看!外面正在下雨。",
    '"I ___ early on Sundays."(周日的习惯:从不早起)': "周日我从不早起。",
  },
};

let total = 0, patched = 0;
for (const [lid, map] of Object.entries(CN)) {
  const file = `docs/american/book2/${lid}.json`;
  const lines = readFileSync(file, "utf8").split("\n");
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/"stem":\s*"((?:[^"\\]|\\.)*)"/);
    if (!m) continue;
    let stem;
    try { stem = JSON.parse('"' + m[1] + '"'); } catch { continue; }
    if (!(stem in map)) continue;
    total++;
    if (/"stem_cn":/.test(lines[i])) continue; // 已有则跳过(幂等)
    const cnEsc = JSON.stringify(map[stem]); // 带引号且转义
    // 在 "stem": "...", 之后插入 "stem_cn": "...",
    lines[i] = lines[i].replace(/("stem":\s*"(?:[^"\\]|\\.)*",)/, `$1 "stem_cn": ${cnEsc},`);
    patched++;
  }
  writeFileSync(file, lines.join("\n"), "utf8");
  console.log(`${lid}: 命中 ${Object.keys(map).length} 条`);
}
console.log(`\n匹配题干 ${total} 条,注入 ${patched} 条(其余已存在跳过)。`);
