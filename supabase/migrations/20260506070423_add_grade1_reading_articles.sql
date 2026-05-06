-- Expand Grade 1 reading library: add 8 more leveled stories (themes follow 新课标 G1 vocabulary)
INSERT INTO public.primary_reading_articles
  (grade, sort_order, theme, title_cn, title_en, emoji, cover_gradient, level, estimated_minutes, warmup, sentences, questions, treasure, parent_tip)
VALUES
(1, 3, 'color', '彩色的世界', 'A Colorful World', '🌈', 'from-pink-400 to-rose-500', 1, 5,
 '[{"w":"red","cn":"红色"},{"w":"blue","cn":"蓝色"},{"w":"green","cn":"绿色"},{"w":"yellow","cn":"黄色"}]'::jsonb,
 '[{"en":"The sun is yellow.","cn":"太阳是黄色的。"},{"en":"The sky is blue.","cn":"天空是蓝色的。"},{"en":"The leaves are green.","cn":"树叶是绿色的。"},{"en":"The apple is red.","cn":"苹果是红色的。"},{"en":"I love colors!","cn":"我爱五颜六色！"}]'::jsonb,
 '[{"q":"What color is the sky?","q_cn":"天空是什么颜色？","options":["Red","Blue","Green"],"options_cn":["红色","蓝色","绿色"],"answer":1},{"q":"What color is the apple?","q_cn":"苹果是什么颜色？","options":["Yellow","Red","Blue"],"options_cn":["黄色","红色","蓝色"],"answer":1},{"q":"\"Yellow\" 是什么意思？","options":["红色","黄色","绿色"],"answer":1}]'::jsonb,
 '{"type":"build","words":["The","sky","is","blue"],"sentence":"The sky is blue."}'::jsonb,
 '让孩子指着身边物品大声说颜色，比如 the bag is red。'),

(1, 4, 'number', '数一数', 'Count With Me', '🔢', 'from-amber-400 to-orange-500', 1, 5,
 '[{"w":"one","cn":"一"},{"w":"two","cn":"二"},{"w":"three","cn":"三"},{"w":"apple","cn":"苹果"}]'::jsonb,
 '[{"en":"I have one apple.","cn":"我有一个苹果。"},{"en":"You have two pens.","cn":"你有两支笔。"},{"en":"She has three cats.","cn":"她有三只猫。"},{"en":"We can count to ten.","cn":"我们能数到十。"},{"en":"Let''s count together!","cn":"我们一起数吧！"}]'::jsonb,
 '[{"q":"How many apples?","q_cn":"几个苹果？","options":["One","Two","Three"],"options_cn":["一个","两个","三个"],"answer":0},{"q":"How many cats does she have?","q_cn":"她有几只猫？","options":["Two","Three","Four"],"options_cn":["两只","三只","四只"],"answer":1},{"q":"\"Count\" 是什么意思？","options":["跑","数","跳"],"answer":1}]'::jsonb,
 '{"type":"build","words":["I","have","one","apple"],"sentence":"I have one apple."}'::jsonb,
 '请孩子用英语数家里的水果或玩具，巩固数词和单复数。'),

(1, 5, 'animal', '小狗汪汪', 'My Little Dog', '🐶', 'from-orange-400 to-red-500', 1, 5,
 '[{"w":"dog","cn":"狗"},{"w":"run","cn":"跑"},{"w":"play","cn":"玩"},{"w":"happy","cn":"开心"}]'::jsonb,
 '[{"en":"I have a little dog.","cn":"我有一只小狗。"},{"en":"His name is Wow.","cn":"它的名字叫汪汪。"},{"en":"He can run very fast.","cn":"它跑得很快。"},{"en":"We play in the park.","cn":"我们在公园玩。"},{"en":"My dog is so happy.","cn":"我的狗狗好开心。"}]'::jsonb,
 '[{"q":"What is the dog''s name?","q_cn":"小狗叫什么？","options":["Wow","Tom","Max"],"options_cn":["汪汪","汤姆","马克斯"],"answer":0},{"q":"Where do they play?","q_cn":"他们在哪玩？","options":["Home","Park","School"],"options_cn":["家里","公园","学校"],"answer":1},{"q":"\"Happy\" 是什么意思？","options":["难过","开心","生气"],"answer":1}]'::jsonb,
 '{"type":"build","words":["My","dog","is","happy"],"sentence":"My dog is happy."}'::jsonb,
 '可以问问孩子家里有没有宠物，引导用 I have a... 句型。'),

(1, 6, 'food', '我喜欢的早餐', 'My Breakfast', '🥞', 'from-yellow-400 to-amber-500', 1, 5,
 '[{"w":"milk","cn":"牛奶"},{"w":"egg","cn":"鸡蛋"},{"w":"bread","cn":"面包"},{"w":"yummy","cn":"好吃"}]'::jsonb,
 '[{"en":"I am hungry.","cn":"我饿了。"},{"en":"I drink milk.","cn":"我喝牛奶。"},{"en":"I eat an egg.","cn":"我吃一个鸡蛋。"},{"en":"I like bread, too.","cn":"我也喜欢面包。"},{"en":"Yummy! I love breakfast.","cn":"真好吃！我爱早餐。"}]'::jsonb,
 '[{"q":"What does the child drink?","q_cn":"小朋友喝什么？","options":["Water","Milk","Juice"],"options_cn":["水","牛奶","果汁"],"answer":1},{"q":"What does the child eat?","q_cn":"小朋友吃什么？","options":["Egg and bread","Rice","Noodles"],"options_cn":["鸡蛋和面包","米饭","面条"],"answer":0},{"q":"\"Yummy\" 是什么意思？","options":["难吃","好吃","好看"],"answer":1}]'::jsonb,
 '{"type":"build","words":["I","like","bread"],"sentence":"I like bread."}'::jsonb,
 '吃早餐时和孩子用英语说一遍餐桌上的食物。'),

(1, 7, 'school', '在学校', 'At School', '🎒', 'from-sky-400 to-blue-500', 1, 6,
 '[{"w":"school","cn":"学校"},{"w":"book","cn":"书"},{"w":"friend","cn":"朋友"},{"w":"teacher","cn":"老师"}]'::jsonb,
 '[{"en":"I go to school.","cn":"我去上学。"},{"en":"I see my friends.","cn":"我看见我的朋友。"},{"en":"My teacher is kind.","cn":"我的老师很亲切。"},{"en":"We read books together.","cn":"我们一起读书。"},{"en":"School is fun!","cn":"学校真有趣！"}]'::jsonb,
 '[{"q":"Where does the child go?","q_cn":"小朋友去哪？","options":["Park","School","Home"],"options_cn":["公园","学校","家"],"answer":1},{"q":"Who is kind?","q_cn":"谁很亲切？","options":["Mom","Friend","Teacher"],"options_cn":["妈妈","朋友","老师"],"answer":2},{"q":"\"Book\" 是什么意思？","options":["书","笔","包"],"answer":0}]'::jsonb,
 '{"type":"build","words":["I","go","to","school"],"sentence":"I go to school."}'::jsonb,
 '请孩子分享一个学校最开心的小事，用 I see / I play 句型。'),

(1, 8, 'weather', '今天天气真好', 'Sunny Day', '☀️', 'from-cyan-400 to-sky-500', 1, 5,
 '[{"w":"sun","cn":"太阳"},{"w":"rain","cn":"雨"},{"w":"warm","cn":"暖和"},{"w":"play","cn":"玩"}]'::jsonb,
 '[{"en":"The sun is bright.","cn":"太阳很明亮。"},{"en":"It is warm today.","cn":"今天很暖和。"},{"en":"There is no rain.","cn":"没有下雨。"},{"en":"I go out to play.","cn":"我出去玩。"},{"en":"What a sunny day!","cn":"多么晴朗的一天！"}]'::jsonb,
 '[{"q":"How is the weather?","q_cn":"天气如何？","options":["Rainy","Sunny","Snowy"],"options_cn":["下雨","晴天","下雪"],"answer":1},{"q":"What does the child do?","q_cn":"小朋友做什么？","options":["Sleep","Play outside","Read"],"options_cn":["睡觉","出去玩","看书"],"answer":1},{"q":"\"Warm\" 是什么意思？","options":["冷","暖和","热"],"answer":1}]'::jsonb,
 '{"type":"build","words":["It","is","warm","today"],"sentence":"It is warm today."}'::jsonb,
 '出门前用英语描述今天的天气：sunny / rainy / cold / warm。'),

(1, 9, 'toy', '我的玩具熊', 'My Teddy Bear', '🧸', 'from-fuchsia-400 to-purple-500', 1, 5,
 '[{"w":"toy","cn":"玩具"},{"w":"bear","cn":"熊"},{"w":"big","cn":"大的"},{"w":"soft","cn":"柔软"}]'::jsonb,
 '[{"en":"This is my teddy bear.","cn":"这是我的玩具熊。"},{"en":"He is big and soft.","cn":"它又大又软。"},{"en":"He sleeps with me.","cn":"它和我一起睡觉。"},{"en":"I tell him stories.","cn":"我给它讲故事。"},{"en":"I love my teddy bear.","cn":"我爱我的玩具熊。"}]'::jsonb,
 '[{"q":"What is the toy?","q_cn":"是什么玩具？","options":["Car","Bear","Doll"],"options_cn":["汽车","熊","娃娃"],"answer":1},{"q":"How is the bear?","q_cn":"熊熊是什么样的？","options":["Small and hard","Big and soft","Old"],"options_cn":["又小又硬","又大又软","旧的"],"answer":1},{"q":"\"Soft\" 是什么意思？","options":["硬","软","重"],"answer":1}]'::jsonb,
 '{"type":"build","words":["I","love","my","bear"],"sentence":"I love my bear."}'::jsonb,
 '让孩子用 my + 形容词 + 玩具 描述自己最喜欢的玩具。'),

(1, 10, 'body', '我的身体', 'My Body', '👀', 'from-teal-400 to-emerald-500', 1, 6,
 '[{"w":"eye","cn":"眼睛"},{"w":"hand","cn":"手"},{"w":"foot","cn":"脚"},{"w":"see","cn":"看见"}]'::jsonb,
 '[{"en":"I have two eyes.","cn":"我有两只眼睛。"},{"en":"I have two hands.","cn":"我有两只手。"},{"en":"I have two feet.","cn":"我有两只脚。"},{"en":"My eyes can see.","cn":"我的眼睛能看见。"},{"en":"My body is amazing!","cn":"我的身体真棒！"}]'::jsonb,
 '[{"q":"How many eyes?","q_cn":"几只眼睛？","options":["One","Two","Three"],"options_cn":["一只","两只","三只"],"answer":1},{"q":"What can the eyes do?","q_cn":"眼睛能做什么？","options":["Run","See","Eat"],"options_cn":["跑","看","吃"],"answer":1},{"q":"\"Hand\" 是什么意思？","options":["手","脚","头"],"answer":0}]'::jsonb,
 '{"type":"build","words":["I","have","two","eyes"],"sentence":"I have two eyes."}'::jsonb,
 '指着身体部位让孩子说出英文单词，玩 Touch your nose! 游戏。');
