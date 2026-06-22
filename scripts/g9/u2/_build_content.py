# -*- coding: utf-8 -*-
"""九年级 U2(主题=节日)阅读6/完形6(10空)/听力6(5题)/写作。全原创,18情境互不重复,
   词汇限 U2+中考常用。答案位置=按qid播种shuffle(U2语法同法)。打印完形/听力全文+去重表+QC。"""
import json, os, sys, io, random, collections
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
DIR = r"C:\Projects\learn-fluent-easy\scripts\g9\u2"
os.makedirs(DIR, exist_ok=True)
V, U = "g9", "U2"
LET = "ABCD"
def dump(n, o):
    with open(os.path.join(DIR, n), "w", encoding="utf-8") as f: json.dump(o, f, ensure_ascii=False, indent=2)
# 均衡池:30阅读+60完形+30听力=120题,每档(0/1/2/3)等量30,整体随机打散(播种可复现)。
# 按执行顺序(阅读→完形→听力)依次取位,既均衡又无固定序列规律。U3–U14 同法(池大小=总MCQ数)。
_POOL = [i % 4 for i in range(120)]
random.Random("g9u2-content").shuffle(_POOL)
_PI = [0]
def shuf(correct, dis, seed):
    i = _POOL[_PI[0]]; _PI[0] += 1
    o = list(dis); o.insert(i, correct); return o, i

# ================= 阅读 6 篇 × 5题 =================
RD = [
 ("g9u2.rd1","The Mid-Autumn Festival","说明文",
  "The Mid-Autumn Festival is one of the most important festivals in China. It falls on the fifteenth "
  "day of the eighth lunar month, usually in September or October. On this day, the moon is round and "
  "bright. Chinese people believe that a round moon means family reunion, so families try to get "
  "together on this night. They sit in the yard, look at the full moon and eat mooncakes. Mooncakes are "
  "round and sweet, with many different fillings. Children also love the old story of Chang'e, the lady "
  "who flew to the moon. The festival is a happy time for families to share love and good food.",
  [("When does the Mid-Autumn Festival fall?","On the 15th day of the 8th lunar month.",["On October 1st.","On December 25th.","On the first day of the year."]),
   ("What does a round moon mean to Chinese people?","Family reunion.",["Good weather.","A new year.","Hard work."]),
   ("What do families do on this night?","Look at the full moon and eat mooncakes.",["Watch dragon boat races.","Throw water at each other.","Give red packets."]),
   ("What are mooncakes like?","Round and sweet with different fillings.",["Long and salty.","Hot and spicy.","Green and sour."]),
   ("Whose story do children love?","Chang'e's.",["Qu Yuan's.","Santa's.","The Monkey King's."])]),
 ("g9u2.rd2","Tom's First Spring Festival","记叙文",
  "Last winter, Tom, an exchange student from London, spent his first Spring Festival in a small Chinese "
  "village. His friend Lin invited him home for the holiday. On New Year's Eve, the whole family cleaned "
  "the house and put up red couplets on the doors. In the evening, they made dumplings together and "
  "watched the Spring Festival show on TV. At midnight, Tom heard firecrackers outside and saw the sky "
  "full of light. The next morning, Lin's grandparents gave the children red packets with money inside. "
  "Tom was very surprised and happy. He said it was the most exciting festival he had ever had.",
  [("Where is Tom from?","London.",["Sydney.","New York.","Tokyo."]),
   ("Where did Tom spend Spring Festival?","In a small Chinese village.",["In a big city.","At school.","In London."]),
   ("What did the family do on New Year's Eve?","Cleaned the house and made dumplings.",["Watched a film at the cinema.","Went swimming.","Visited a museum."]),
   ("What did the grandparents give the children?","Red packets with money.",["Books and pens.","New clothes.","Toy cars."]),
   ("How did Tom feel about the festival?","It was the most exciting one he had ever had.",["It was boring.","It was too quiet.","It was scary."])]),
 ("g9u2.rd3","Spring Festival and Christmas","对比说明",
  "Spring Festival in China and Christmas in the West are both important family festivals, but they have "
  "some differences. Both are a time for family: people come home, share a big meal and give presents to "
  "each other. However, the dates are different. Spring Festival follows the lunar calendar, so it falls "
  "on a different day each year, usually in late January or February. Christmas is always on December "
  "25th. The food is different too. At Spring Festival, Chinese families eat dumplings and fish, while "
  "at Christmas many Western families eat turkey. Though the customs are not the same, both festivals "
  "carry the same warm wish: happiness for the whole family.",
  [("What do the two festivals have in common?","Both are a time for family.",["Both fall on the same day.","Both have the same food.","Both last one month."]),
   ("When is Spring Festival?","In late January or February.",["Always on December 25th.","Always in April.","On October 1st."]),
   ("When is Christmas?","On December 25th.",["On a different day each year.","In February.","In June."]),
   ("What do many Western families eat at Christmas?","Turkey.",["Dumplings.","Zongzi.","Mooncakes."]),
   ("What wish do both festivals carry?","Happiness for the whole family.",["Success at work.","Good weather.","More money."])]),
 ("g9u2.rd4","An Invitation to the Dragon Boat Festival","书信",
  "Dear Jack, How are you? I'm writing to invite you to visit my city during the Dragon Boat Festival in "
  "June. It is one of the most exciting festivals in China. On that day, people watch dragon boat races "
  "by the river. The boats are long and colourful, and the teams row very fast to the sound of drums. We "
  "also eat zongzi, sticky rice wrapped in green leaves. My mother makes the best zongzi! The festival "
  "remembers an old poet who loved his country. I'm sure you will love the races and the food. Please "
  "come and join us! Your friend, Li Hua",
  [("Why is Li Hua writing the letter?","To invite Jack to the Dragon Boat Festival.",["To say goodbye.","To borrow money.","To ask for homework."]),
   ("When is the Dragon Boat Festival?","In June.",["In December.","In April.","In September."]),
   ("What do people watch on that day?","Dragon boat races.",["Lantern shows.","Football matches.","Films."]),
   ("What is zongzi?","Sticky rice wrapped in green leaves.",["A round sweet cake.","A kind of soup.","A green drink."]),
   ("Who does the festival remember?","An old poet who loved his country.",["A famous king.","A brave soldier.","A rich businessman."])]),
 ("g9u2.rd5","Why Festivals Still Matter","议论文",
  "Today some young people think that traditional festivals are old-fashioned. They prefer shopping "
  "online or playing games. But traditional festivals still matter a lot. First, they bring families "
  "together. In our busy life, festivals give us a reason to go home and meet the people we love. "
  "Second, festivals help us remember our culture and history. Through festival food, stories and "
  "customs, young people learn where they come from. Finally, festivals make life more colourful and "
  "fun. Without them, the year would feel the same from beginning to end. So we should keep our "
  "festivals alive and pass them on to the next generation.",
  [("What do some young people think about traditional festivals?","They are old-fashioned.",["They are too expensive.","They are dangerous.","They are too short."]),
   ("What is the first reason festivals matter?","They bring families together.",["They save money.","They are easy.","They are quiet."]),
   ("How do festivals help with culture?","Through festival food, stories and customs.",["By selling things online.","By playing games.","By cleaning houses."]),
   ("What would the year feel like without festivals?","The same from beginning to end.",["Much shorter.","Much busier.","More expensive."]),
   ("What does the writer suggest?","Keep festivals alive and pass them on.",["Stop all festivals.","Only shop online.","Forget old customs."])]),
 ("g9u2.rd6","The Water Festival","应用说明",
  "The Water Festival is the most important festival for the Dai people in Yunnan, China. It also takes "
  "place in Thailand and some other countries in April. During the festival, people go out into the "
  "streets and throw water at each other. You may get very wet, but no one gets angry. In fact, getting "
  "wet is a good thing! People believe that the water washes away bad luck and brings a happy new year. "
  "Besides throwing water, people also watch dragon boat races, sing and dance. The Water Festival is a "
  "time of joy, and visitors from all over the world come to join the fun.",
  [("Who is the Water Festival most important for?","The Dai people.",["The British.","The Americans.","The Japanese."]),
   ("When does it take place?","In April.",["In December.","In September.","In January."]),
   ("What do people do during the festival?","Throw water at each other.",["Light lanterns.","Climb mountains.","Watch films."]),
   ("Why is getting wet a good thing?","The water washes away bad luck.",["The weather is hot.","Water is cheap.","It saves time."]),
   ("Who comes to join the fun?","Visitors from all over the world.",["Only the Dai people.","Only children.","Only teachers."])]),
]
reading_passages = []
for code, title, genre, body, qs in RD:
    out = []
    for i, (stem, correct, dis) in enumerate(qs, 1):
        qid = f"{code}.q{i}"; o, idx = shuf(correct, dis, qid)
        out.append({"qid": qid,"volume": V,"unit": U,"code": code,"stem": stem,"options": o,
                    "answer_index": idx,"answer_text": correct,"explanation": "见原文对应句"})
    reading_passages.append({"code": code,"title": title,"genre": genre,"body": body,"questions": out})
dump("g9-u2-reading.json", {"volume": V,"unit": U,"passages": reading_passages})

# ================= 完形 6 篇 × 10 空 =================
CZ = [
 ("g9u2.cz1","The Lantern Festival",
  "The Lantern Festival comes on the fifteenth day of the first lunar (1)____, two weeks after Spring "
  "Festival. It marks the (2)____ of the New Year celebrations. On this night, the streets are full of "
  "beautiful (3)____ in many shapes and colours. Children carry small ones and walk (4)____ the streets "
  "happily. Many lanterns have riddles on them, and people try to (5)____ the answers. Families also eat "
  "tangyuan, sweet rice (6)____ that are round and soft. The round shape (7)____ family reunion, just "
  "like the full moon. Long ago, people lit lanterns to (8)____ for good luck. Today the festival is "
  "still very (9)____, and parks hold big lantern shows. It is a (10)____ end to the Spring Festival "
  "holiday.",
  [("month",["week","day","year"],"first lunar month 正月"),
   ("end",["start","middle","top"],"marks the end 标志结束"),
   ("lanterns",["books","cars","trees"],"灯笼"),
   ("along",["under","into","off"],"walk along the streets 沿街"),
   ("guess",["throw","lose","cut"],"guess the answers 猜谜底"),
   ("balls",["cards","boxes","leaves"],"rice balls 汤圆"),
   ("means",["asks","stops","leaves"],"圆形象征团圆"),
   ("hope",["hate","fear","fail"],"to hope for good luck 祈求好运"),
   ("popular",["empty","silent","quiet"],"仍很受欢迎"),
   ("happy",["boring","scary","terrible"],"欢乐的结尾")]),
 ("g9u2.cz2","My First Thanksgiving",
  "Last November, I stayed with a host (1)____ in the United States and had my first Thanksgiving. "
  "Thanksgiving is an important American (2)____. On that day, families get (3)____ to give thanks for "
  "the good things in their life. My host mother (4)____ a big dinner. The main dish was a large "
  "(5)____, and there were also potatoes and pumpkin pie. Before we (6)____, everyone said what they "
  "were thankful (7)____. I said I was thankful for my new friends. The food was (8)____, and I ate too "
  "much! After dinner, we (9)____ games and talked for hours. It was a warm evening, and I will never "
  "(10)____ my first Thanksgiving.",
  [("family",["school","shop","team"],"host family 寄宿家庭"),
   ("festival",["lesson","game","sport"],"美国重要节日"),
   ("together",["away","lost","angry"],"get together 团聚"),
   ("cooked",["washed","sold","broke"],"cook dinner 做饭"),
   ("turkey",["fish","cake","soup"],"火鸡是主菜"),
   ("ate",["slept","ran","left"],"before we ate 吃饭前"),
   ("for",["at","in","on"],"thankful for 感激"),
   ("delicious",["terrible","ugly","empty"],"食物美味"),
   ("played",["lost","missed","stopped"],"play games 玩游戏"),
   ("forget",["clean","sell","miss"],"never forget 永不忘")]),
 ("g9u2.cz3","Our Culture Festival",
  "Last Friday, our school held an International Culture (1)____. Each class showed the festivals of a "
  "different (2)____. My class chose China. We made paper (3)____ and wrote Spring Festival couplets. "
  "The students in Class Two showed Christmas, with a big green (4)____ and small gifts. Another class "
  "(5)____ everyone an Indian dance. The hall was full of music, colour and (6)____ food from around the "
  "world. I (7)____ a sweet rice cake from the Japan booth — it was new to me but very nice. Through the "
  "festival, we (8)____ a lot about other cultures. We also felt (9)____ of our own traditions. Everyone "
  "agreed it was the best school (10)____ of the year.",
  [("Festival",["lesson","exam","match"],"文化节"),
   ("country",["school","family","year"],"不同国家"),
   ("lanterns",["cars","boats","planes"],"纸灯笼"),
   ("tree",["box","bell","star"],"Christmas tree 圣诞树"),
   ("taught",["sold","bought","threw"],"teach a dance 教舞蹈"),
   ("tasty",["ugly","empty","silent"],"美味的食物"),
   ("tried",["threw","lost","broke"],"try food 品尝"),
   ("learned",["forgot","lost","missed"],"learn about 了解"),
   ("proud",["afraid","tired","bored"],"proud of 自豪"),
   ("event",["exam","rule","problem"],"最棒的活动")]),
 ("g9u2.cz4","A Christmas Morning",
  "On Christmas (1)____, my sister and I woke up very early. We ran to the living room and saw a big "
  "Christmas (2)____ with colourful lights. Under it, there were many (3)____ wrapped in shiny paper. We "
  "could not (4)____ to open them! I got a new book, and my sister got a beautiful (5)____. We said "
  "\"Thank you\" to our parents and gave them our cards. Then the whole family had a big (6)____ "
  "together. My mother had cooked a turkey, and the kitchen smelled (7)____. After lunch, we sang "
  "Christmas (8)____ and called our grandparents to say \"(9)____ Christmas\". It was a warm and "
  "(10)____ day that I will always remember.",
  [("morning",["night","week","year"],"圣诞节早晨"),
   ("tree",["box","car","wall"],"圣诞树"),
   ("presents",["problems","lessons","rules"],"礼物"),
   ("wait",["run","sleep","cry"],"could not wait 迫不及待"),
   ("doll",["knife","stone","brick"],"洋娃娃"),
   ("meal",["game","test","trip"],"a big meal 大餐"),
   ("wonderful",["terrible","empty","silent"],"smell wonderful 香"),
   ("songs",["books","games","cards"],"Christmas songs 圣诞歌"),
   ("Merry",["sad","angry","late"],"Merry Christmas 圣诞快乐"),
   ("happy",["boring","scary","sad"],"温暖快乐的一天")]),
 ("g9u2.cz5","My First Halloween",
  "When I was studying in Canada, I (1)____ my first Halloween on October 31st. In the afternoon, my "
  "friends and I made lanterns from big orange (2)____. We cut funny faces on them and put a light "
  "(3)____. In the evening, we put on scary (4)____. I dressed up as a black cat! Then we went from "
  "house to (5)____ in our neighbourhood. At each door, we said \"Trick or (6)____!\" and people gave us "
  "sweets. Soon my bag was (7)____ of candy. Some houses looked really (8)____, with fake spiders and "
  "ghosts. At first I was a little (9)____, but it was actually great fun. Halloween is a (10)____ "
  "festival, and I enjoyed every minute of it.",
  [("celebrated",["lost","missed","sold"],"过节"),
   ("pumpkins",["apples","oranges","potatoes"],"南瓜"),
   ("inside",["outside","away","off"],"put a light inside 里面放灯"),
   ("costumes",["books","songs","games"],"scary costumes 吓人服装"),
   ("house",["school","river","hill"],"house to house 挨家挨户"),
   ("treat",["trip","team","test"],"Trick or treat 不给糖就捣蛋"),
   ("full",["free","short","late"],"full of candy 装满糖"),
   ("scary",["lovely","quiet","empty"],"房子很吓人"),
   ("afraid",["proud","tired","sure"],"起初有点害怕"),
   ("fun",["boring","sad","terrible"],"有趣的节日")]),
 ("g9u2.cz6","A Mid-Autumn Reunion",
  "Every year on Mid-Autumn night, my family has a big reunion (1)____. This year my aunt came back from "
  "far away, so everyone was very (2)____. After dinner, we carried chairs into the (3)____ and sat "
  "under the night sky. The moon was round and (4)____, the brightest I had ever seen. We ate (5)____ "
  "together, and each one had a different filling. My grandfather told us the old (6)____ of Chang'e "
  "flying to the moon. My little cousin listened with wide (7)____. We also took many photos to (8)____ "
  "this happy moment. My mother said the round moon (9)____ that our family is always together, even "
  "when we are far (10)____. It was a perfect night.",
  [("dinner",["exam","game","trip"],"团圆饭"),
   ("happy",["angry","tired","sad"],"非常高兴"),
   ("garden",["river","school","shop"],"院子里"),
   ("bright",["dark","small","empty"],"又圆又亮"),
   ("mooncakes",["dumplings","noodles","bread"],"吃月饼"),
   ("story",["song","game","rule"],"嫦娥的故事"),
   ("eyes",["ears","hands","feet"],"with wide eyes 睁大眼睛"),
   ("remember",["forget","lose","sell"],"to remember 记住此刻"),
   ("means",["asks","stops","hopes"],"圆月象征团圆"),
   ("apart",["ago","along","off"],"far apart 远隔")]),
]
cloze_passages = []
for code, title, text, blanks in CZ:
    out = []
    for i, (correct, dis, expl) in enumerate(blanks, 1):
        qid = f"{code}.q{i}"; o, idx = shuf(correct, dis, qid)
        assert len(set(o)) == 4, f"{qid} dup"
        out.append({"qid": qid,"volume": V,"unit": U,"code": code,"blank": i,"options": o,
                    "answer_index": idx,"answer_text": correct,"explanation": expl})
    cloze_passages.append({"code": code,"title": title,"text": text,"questions": out})
dump("g9-u2-cloze.json", {"volume": V,"unit": U,"passages": cloze_passages})

# ================= 听力 6 篇 × 5题 =================
def D(*a): return list(a)
LS = [
 ("g9u2.ls1","九年级 U2 听力·对话 Watching the Dragon Boat Races","dialogue","long","us_male",
  D("Mike: Anna, the Dragon Boat Festival is this Saturday. Do you want to watch the races with me?",
    "Anna: Sure! I've never seen a dragon boat race before. Where are they?",
    "Mike: By the river near the city park. They start at nine in the morning.",
    "Anna: Great. Should we bring anything?",
    "Mike: Yes, let's bring some zongzi to eat. My mum made a lot.",
    "Anna: Yummy! How does a team win?",
    "Mike: The fastest boat to the end wins. The drums help them row together.",
    "Anna: Sounds exciting. Let's meet at the park gate at half past eight."),
  "Mike约Anna周六看龙舟赛;赛在城市公园旁的河上、上午九点开始;带Mike妈妈做的粽子;最快到终点的队获胜,鼓声帮助齐桨;约八点半在公园门口见。",
  [("When is the Dragon Boat Festival?","This Saturday.",["Next Sunday.","This Friday.","Next month."]),
   ("Where are the races held?","By the river near the city park.",["At the school.","In the city square.","On the lake in the mountains."]),
   ("What will they bring to eat?","Zongzi.",["Mooncakes.","Dumplings.","Turkey."]),
   ("How does a team win the race?","Its boat reaches the end fastest.",["It has the biggest boat.","It sings the loudest.","It has the most people."]),
   ("When will they meet?","At half past eight at the park gate.",["At nine at the river.","At eight at school.","At ten at the park."])]),
 ("g9u2.ls2","九年级 U2 听力·短文 How My Family Celebrates Spring Festival","passage","short","us_female",
  D("Spring Festival is my favourite time of the year. A few days before it, my family cleans the whole "
    "house to sweep away bad luck. We also put up red couplets on the door. On New Year's Eve, all my "
    "relatives come to my grandparents' home for a big dinner. We always eat dumplings and fish, because "
    "they bring good luck. After dinner, we watch the festival show on TV and wait for midnight. The "
    "best part for me is the red packets. My parents and grandparents give us money in red envelopes. "
    "The next day, we visit our relatives and say \"Happy New Year\"."),
  "春节是“我”最爱的节日。节前几天全家大扫除扫走霉运、贴红春联;除夕亲戚到爷爷奶奶家吃年夜饭,吃饺子和鱼(寓意好运);饭后看春晚守岁;最爱红包(长辈给压岁钱);第二天走亲戚拜年。",
  [("What does the family do a few days before Spring Festival?","Clean the whole house.",["Buy a new car.","Travel abroad.","Plant trees."]),
   ("Where do the relatives gather on New Year's Eve?","At the grandparents' home.",["At a restaurant.","At the speaker's school.","At the park."]),
   ("What do they eat for good luck?","Dumplings and fish.",["Turkey and pie.","Mooncakes.","Zongzi."]),
   ("What is the speaker's favourite part?","The red packets.",["The cleaning.","The TV show.","The couplets."]),
   ("What do they do the next day?","Visit relatives and say Happy New Year.",["Go back to school.","Clean again.","Watch races."])]),
 ("g9u2.ls3","九年级 U2 听力·对话 Asking about the Mid-Autumn Festival","dialogue","long","us_male",
  D("Sam: Hi, Mei. What festival is coming soon?",
    "Mei: The Mid-Autumn Festival. It's next week.",
    "Sam: I'm from Australia, so I don't know much about it. What do people do?",
    "Mei: Families get together and look at the full moon. We also eat mooncakes.",
    "Sam: Mooncakes? What are they like?",
    "Mei: They're round cakes with sweet fillings, like nuts or red beans.",
    "Sam: That sounds nice. Why do you look at the moon?",
    "Mei: A round moon means the family is together. Would you like to join my family this year?",
    "Sam: I'd love to. Thank you!"),
  "Sam问梅快到什么节日;梅:下周中秋节。Sam来自澳大利亚不太了解;梅:家人团聚、赏满月、吃月饼;月饼是带坚果或红豆等甜馅的圆饼;圆月象征团圆;梅邀Sam今年加入她家,Sam欣然答应。",
  [("What festival is coming soon?","The Mid-Autumn Festival.",["The Spring Festival.","Christmas.","Halloween."]),
   ("Where is Sam from?","Australia.",["Canada.","England.","America."]),
   ("What do families do on this festival?","Get together and look at the full moon.",["Throw water at each other.","Watch boat races.","Make lanterns."]),
   ("What is inside mooncakes?","Sweet fillings like nuts or red beans.",["Meat and salt.","Rice and leaves.","Cheese and ham."]),
   ("What does Mei invite Sam to do?","Join her family.",["Visit Australia.","Buy mooncakes.","Write a letter."])]),
 ("g9u2.ls4","九年级 U2 听力·短文 My Water Festival Day","passage","short","us_female",
  D("Last April, I visited Yunnan during the Water Festival of the Dai people. It was the most fun day of "
    "my trip. In the morning, everyone went into the streets carrying bowls and buckets of water. Then "
    "the water fight began! People threw water at each other and laughed. Soon I was wet from head to "
    "foot, but I didn't mind at all. The Dai people say that the water washes away bad luck and brings "
    "happiness. In the afternoon, we watched dragon boat races and saw beautiful dances. By evening, I "
    "was tired but very happy. I will never forget the day I got soaked at the Water Festival."),
  "去年四月“我”在云南赶上傣族泼水节,是旅途中最开心的一天。早上人们提着碗和桶上街,泼水大战开始,互相泼水欢笑;很快全身湿透但毫不在意;傣族人说水能洗去霉运、带来幸福;下午看龙舟赛和舞蹈;傍晚虽累但很开心,永远忘不了被泼湿的这天。",
  [("Where did the speaker go?","Yunnan.",["Thailand.","Beijing.","London."]),
   ("When was it?","Last April.",["Last December.","Last September.","Last June."]),
   ("What did people throw at each other?","Water.",["Flowers.","Sweets.","Paper."]),
   ("What do the Dai people believe the water does?","Washes away bad luck and brings happiness.",["Makes people rich.","Keeps people cool only.","Cleans the streets."]),
   ("How did the speaker feel by evening?","Tired but very happy.",["Angry and wet.","Bored and cold.","Sad and tired."])]),
 ("g9u2.ls5","九年级 U2 听力·对话 Our Favourite Festivals","dialogue","long","us_female",
  D("Lily: What's your favourite festival, Ben?",
    "Ben: I think Spring Festival is the best. I love the dumplings and the red packets.",
    "Lily: Me too, but I also like the Mid-Autumn Festival.",
    "Ben: Why is that?",
    "Lily: Because I can eat mooncakes and look at the beautiful moon with my family.",
    "Ben: That's nice. What about a festival from another country?",
    "Lily: I'd like to try Christmas one day. I want to see a real Christmas tree.",
    "Ben: I'd like to see Halloween. Wearing scary costumes looks fun!",
    "Lily: Haha, you would make a great ghost!"),
  "Lily问Ben最爱的节日;Ben:春节最好,爱饺子和红包;Lily也喜欢春节,还喜欢中秋(能和家人吃月饼赏月);谈到外国节日,Lily想体验圣诞看真圣诞树,Ben想看万圣节、觉得穿吓人服装好玩;Lily打趣他会是个好“鬼”。",
  [("What is Ben's favourite festival?","Spring Festival.",["The Mid-Autumn Festival.","Christmas.","Halloween."]),
   ("Why does Lily like the Mid-Autumn Festival?","She can eat mooncakes and look at the moon with family.",["She gets red packets.","She watches races.","She throws water."]),
   ("Which foreign festival would Lily like to try?","Christmas.",["Halloween.","Thanksgiving.","The Water Festival."]),
   ("What does Ben want to see?","Halloween.",["A dragon boat race.","A lantern show.","A Christmas tree."]),
   ("Why does Ben like Halloween?","Wearing scary costumes looks fun.",["He likes the food.","He likes the moon.","He likes red packets."])]),
 ("g9u2.ls6","九年级 U2 听力·短文 Making Zongzi with Grandma","passage","short","us_female",
  D("Last year, before the Dragon Boat Festival, my grandma taught me how to make zongzi. First, we "
    "washed the green leaves and the sticky rice. Then Grandma showed me how to fold the leaves into a "
    "small cup. We put rice and a sweet red date inside, and tied it up with string. My first zongzi "
    "looked ugly, and the rice fell out! But Grandma was patient, and I tried again and again. By the "
    "end, I could make nice ones. When we ate them together, I felt very proud. Making zongzi with "
    "Grandma is my best festival memory, because I learned a skill and spent happy time with her."),
  "去年端午前,奶奶教“我”包粽子。先洗粽叶和糯米;奶奶教把叶子折成小杯,放米和一颗甜红枣,用绳扎好;“我”第一个包得很丑、米还漏出来,但奶奶很耐心,反复练后能包好了;一起吃时很自豪。和奶奶包粽子是最美的节日记忆——学会一项技能又和她共度快乐时光。",
  [("Which festival was coming?","The Dragon Boat Festival.",["The Lantern Festival.","Christmas.","The Water Festival."]),
   ("Who taught the speaker to make zongzi?","Grandma.",["Mum.","A teacher.","A friend."]),
   ("What did they put inside the zongzi?","Rice and a sweet red date.",["Meat and salt.","Nuts and sugar.","Fish and leaves."]),
   ("What happened to the first zongzi?","It looked ugly and the rice fell out.",["It was perfect.","It was too big.","It tasted salty."]),
   ("Why is it the speaker's best festival memory?","She learned a skill and spent happy time with Grandma.",["She won a prize.","She got money.","She went travelling."])]),
]
exercises = []
for code, title, typ, kind, spk, transcript, trcn, qs in LS:
    out = []
    for i, (stem, correct, dis) in enumerate(qs, 1):
        qid = f"{code}.q{i}"; o, idx = shuf(correct, dis, qid)
        out.append({"qid": qid,"volume": V,"unit": U,"code": code,"stem": stem,"options": o,
                    "answer_index": idx,"answer_text": correct})
    exercises.append({"code": code,"title": title,"type": typ,"kind": kind,"speaker": spk,
                      "transcript": transcript,"translation_cn": trcn,"questions": out})
dump("g9-u2-listening.json", {"volume": V,"unit": U,"exercises": exercises})

# ================= 写作 =================
WRITING = {"volume": V,"unit": U,"topic": "My Favourite Festival",
 "genre": "介绍性短文","word_count": "80 词左右",
 "points": ["写出节日名称与时间","人们做什么、吃什么","你为什么喜欢它","用本单元句型:宾语从句 I think/believe that… + 感叹句 What…!/How…!"],
 "model_essay": ("My favourite festival is the Mid-Autumn Festival. It usually comes in September or "
 "October. On that day, my family gets together and has a big dinner. We eat mooncakes and look at the "
 "full moon. I think that the round moon is a symbol of family reunion. What a beautiful night it is! I "
 "like this festival because I can spend happy time with the people I love. I believe that traditional "
 "festivals make our life warmer and more colourful."),
 "model_translation": ("我最喜欢的节日是中秋节,通常在九、十月。那天全家团聚吃一顿大餐,我们吃月饼、赏满月。"
 "我认为圆月是家庭团圆的象征。多么美的夜晚啊!我喜欢这个节日,因为能和我爱的人共度快乐时光。我相信传统节日让我们的生活更温暖、更多彩。")}
dump("g9-u2-writing.json", WRITING)

# finaltest 引用
ft = {"volume": V,"unit": U,"code": "g9u2.final","title": "Unit 2 单元通关",
 "note": "运行时 buildFinalQuiz:语法7(g9u2.01/02/03)+听力3(内联)+词汇2。完形题携带原文。",
 "cloze_context": cloze_passages[0]["text"],
 "question_refs": ["g9u2.01.q1","g9u2.01.q12","g9u2.02.q1","g9u2.02.q11","g9u2.03.q3","g9u2.03.q5",
   "g9u2.rd1.q2","g9u2.rd4.q1","g9u2.rd6.q3",
   "g9u2.cz1.q3","g9u2.cz4.q3","g9u2.cz6.q5",
   "g9u2.ls1.q1","g9u2.ls3.q1","g9u2.ls6.q2"]}
dump("g9-u2-finaltest.json", ft)

# ================= 去重表 + QC + 全文 =================
SCEN = {
 "g9u2.rd1":"[中秋·说明]月饼/满月/团圆","g9u2.rd2":"[春节·记叙]Tom在乡村过第一个春节",
 "g9u2.rd3":"[春节vs圣诞·对比]异同","g9u2.rd4":"[端午·书信]李华邀Jack看龙舟",
 "g9u2.rd5":"[通用·议论]传统节日为何重要","g9u2.rd6":"[泼水节·应用]傣族/泰国",
 "g9u2.cz1":"灯节(灯谜/汤圆)","g9u2.cz2":"在美国寄宿家庭过感恩节","g9u2.cz3":"学校国际文化节",
 "g9u2.cz4":"圣诞节早晨拆礼物","g9u2.cz5":"在加拿大第一次过万圣节","g9u2.cz6":"中秋团圆饭赏月",
 "g9u2.ls1":"约看龙舟赛","g9u2.ls2":"我家怎么过春节","g9u2.ls3":"外国学生问中秋",
 "g9u2.ls4":"我的泼水节一天","g9u2.ls5":"聊各自最爱的节日","g9u2.ls6":"和奶奶包粽子",
}
print("===== 去重表(阅读6+完形6+听力6=18,情境互不重复)=====")
print("-- 阅读 --");  [print(f"  {p['code']}: {SCEN[p['code']]}  《{p['title']}》") for p in reading_passages]
print("-- 完形 --");  [print(f"  {p['code']}: {SCEN[p['code']]}  《{p['title']}》") for p in cloze_passages]
print("-- 听力 --");  [print(f"  {e['code']}: {SCEN[e['code']]}  《{e['title']}》") for e in exercises]

allq = [q for p in reading_passages for q in p["questions"]] + [q for p in cloze_passages for q in p["questions"]] + [q for e in exercises for q in e["questions"]]
ids = [q["qid"] for q in allq]
bad = [q["qid"] for q in allq if len(set(q["options"]))!=4 or q["options"][q["answer_index"]]!=q["answer_text"]]
cd = collections.Counter(q["answer_index"] for p in cloze_passages for q in p["questions"])
ld = collections.Counter(q["answer_index"] for e in exercises for q in e["questions"])
rdd = collections.Counter(q["answer_index"] for p in reading_passages for q in p["questions"])
print("\n===== QC =====")
print(f"  阅读 {len(reading_passages)}篇/{sum(len(p['questions']) for p in reading_passages)}题 A/B/C/D={rdd[0]}/{rdd[1]}/{rdd[2]}/{rdd[3]}")
print(f"  完形 {len(cloze_passages)}篇/{sum(len(p['questions']) for p in cloze_passages)}空 A/B/C/D={cd[0]}/{cd[1]}/{cd[2]}/{cd[3]}")
print(f"  听力 {len(exercises)}篇/{sum(len(e['questions']) for e in exercises)}题 A/B/C/D={ld[0]}/{ld[1]}/{ld[2]}/{ld[3]}")
for p in cloze_passages:
    seq = [q["blank"] for q in p["questions"]] == list(range(1,11))
    if not seq: print(f"  ⚠️ {p['code']} 空号不连续")
print(f"  qid去重 {len(set(ids))}/{len(ids)} | 选项/答案失败 {len(bad)} {bad}")

print("\n############### 完形全文 ###############")
for p in cloze_passages:
    print(f"\n===== {p['code']} 《{p['title']}》(10空) =====\n{p['text']}")
    for q in p["questions"]:
        print(f"  ({q['blank']}) " + "  ".join(f"{LET[j]}.{o}" for j,o in enumerate(q['options'])) + f"  →{LET[q['answer_index']]}({q['answer_text']}) | {q['explanation']}")
print("\n############### 听力全文 ###############")
for e in exercises:
    print(f"\n===== {e['code']} 《{e['title']}》[{e['type']}/{e['kind']}] =====")
    for ln in e["transcript"]: print("  "+ln)
    print("译: "+e["translation_cn"])
    for i,q in enumerate(e["questions"],1):
        print(f"  Q{i} {q['stem']}\n     " + "  ".join(f"{LET[j]}.{o}" for j,o in enumerate(q['options'])) + f"  →{LET[q['answer_index']]}({q['answer_text']})")
