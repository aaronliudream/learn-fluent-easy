-- 7B 补齐:U2/U3/U4/U5/U7 各 +3(2短对话+1长对话)+ U8 +1(长对话)= 16 条,各 unit 达 6 条标准形态。
-- 幂等:INSERT ... SELECT ... WHERE NOT EXISTS(按 id)。NOT NULL 全填;audio_url=NULL(待 pregenerate)。
-- transcript 单行连续存(M:/W: 标签,cleanForTTS 合成时自动剥离)。撇号全双写。questions=jsonb(choice/3选项/字母answer)。
-- 时态:U2 规则(must/can''t) U3 健身(一般现在+how often) U4 饮食(一般现在) U5 此刻(现在进行) U7 难忘的一天(过去) U8 故事(过去)。
BEGIN;

-- ========================= U2 No Rules, No Order?(规则) =========================
-- 短对话1
INSERT INTO junior_listening_exercises (id,grade,volume,unit,kind,topic,difficulty,title,transcript,translation_cn,audio_url,speaker,duration_sec,questions,key_vocab)
SELECT '7b02a001-1d2e-4f83-a1b5-6c7d8e9f0201'::uuid,7,'7B','U2','short','七下 Unit2 听力·短对话',1,'游泳馆规则 Swimming Pool Rules',
'1. M: Can I run beside the swimming pool, Mum? W: No, you can''t. It''s wet, so you must walk slowly. 2. W: Excuse me, can I eat my sandwich here? M: Sorry, you can''t eat in the pool area. Please eat in the dining hall. 3. M: Do I need to take a shower before swimming? W: Yes, everyone must take a shower first. 4. W: Can my little brother swim here alone? M: No, children can''t swim without an adult. 5. M: What time does the pool close? W: It closes at nine o''clock. Please leave on time.',
NULL,NULL,'us_female',NULL,
'[{"q":"What must the boy do beside the pool?","type":"choice","options":["Run fast.","Walk slowly.","Jump in."],"answer":"B"},{"q":"Where can the girl eat her sandwich?","type":"choice","options":["In the pool area.","Beside the pool.","In the dining hall."],"answer":"C"},{"q":"What must everyone do before swimming?","type":"choice","options":["Take a shower.","Buy a ticket.","Bring a friend."],"answer":"A"},{"q":"Can children swim here alone?","type":"choice","options":["Yes, of course.","No, they need an adult.","Yes, after lunch."],"answer":"B"},{"q":"When does the pool close?","type":"choice","options":["At eight o''clock.","At ten o''clock.","At nine o''clock."],"answer":"C"}]'::jsonb,'[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM junior_listening_exercises WHERE id='7b02a001-1d2e-4f83-a1b5-6c7d8e9f0201');

-- 短对话2
INSERT INTO junior_listening_exercises (id,grade,volume,unit,kind,topic,difficulty,title,transcript,translation_cn,audio_url,speaker,duration_sec,questions,key_vocab)
SELECT '7b02a002-1d2e-4f83-a1b5-6c7d8e9f0202'::uuid,7,'7B','U2','short','七下 Unit2 听力·短对话',1,'博物馆规则 Museum Rules',
'1. W: Can I take photos in the museum, sir? M: I''m sorry, you can''t take any photos here. 2. M: May I touch this old clock? W: No, please don''t touch anything. Just look at it. 3. W: Where should I put my big bag? M: You must leave your bag at the front desk. 4. M: Can we talk loudly inside? W: No, you must keep quiet in the museum. 5. W: Can I bring my dog in? M: Sorry, animals aren''t allowed inside.',
NULL,NULL,'us_female',NULL,
'[{"q":"Can visitors take photos in the museum?","type":"choice","options":["No, they can''t.","Yes, they can.","Only with a phone."],"answer":"A"},{"q":"What does the man want to do with the clock?","type":"choice","options":["Buy it.","Touch it.","Move it."],"answer":"B"},{"q":"Where must visitors leave their big bags?","type":"choice","options":["Under the seat.","In the hall.","At the front desk."],"answer":"C"},{"q":"What must visitors do inside?","type":"choice","options":["Keep quiet.","Talk loudly.","Sing songs."],"answer":"A"},{"q":"Why can''t the woman bring her dog in?","type":"choice","options":["It is too big.","It is too heavy.","Animals aren''t allowed."],"answer":"C"}]'::jsonb,'[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM junior_listening_exercises WHERE id='7b02a002-1d2e-4f83-a1b5-6c7d8e9f0202');

-- 长对话
INSERT INTO junior_listening_exercises (id,grade,volume,unit,kind,topic,difficulty,title,transcript,translation_cn,audio_url,speaker,duration_sec,questions,key_vocab)
SELECT '7b02b001-1d2e-4f83-a1b5-6c7d8e9f0203'::uuid,7,'7B','U2','short','七下 Unit2 听力·长对话',1,'公园规则 Park Rules',
'W: Good morning! Welcome to the City Park. Before you go in, please remember some rules. M: Sure. Can I ride my bike inside the park? W: I''m sorry, you can''t. You must leave your bike at the gate. M: OK. What about my lunch? Can I have a picnic on the grass? W: Yes, you can have a picnic, but you must take your rubbish away. Don''t leave it on the grass. M: No problem. Can my children pick the flowers? W: No, please don''t pick the flowers. Everyone wants to enjoy them. M: I see. Is the park open in the evening? W: Yes, but it closes at eight o''clock. Please leave before then. M: Thank you very much!',
NULL,NULL,'us_female',NULL,
'[{"q":"Where must the man leave his bike?","type":"choice","options":["At the gate.","Near the grass.","In the park."],"answer":"A"},{"q":"What can the man do on the grass?","type":"choice","options":["Ride a bike.","Have a picnic.","Pick flowers."],"answer":"B"},{"q":"What must the man do with his rubbish?","type":"choice","options":["Take it away.","Leave it on the grass.","Burn it."],"answer":"A"},{"q":"Can the children pick the flowers?","type":"choice","options":["Yes, a few.","No, they can''t.","Only red ones."],"answer":"B"},{"q":"When does the park close?","type":"choice","options":["At seven o''clock.","At nine o''clock.","At eight o''clock."],"answer":"C"}]'::jsonb,'[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM junior_listening_exercises WHERE id='7b02b001-1d2e-4f83-a1b5-6c7d8e9f0203');

-- ========================= U3 Keep Fit(健身) =========================
-- 短对话1
INSERT INTO junior_listening_exercises (id,grade,volume,unit,kind,topic,difficulty,title,transcript,translation_cn,audio_url,speaker,duration_sec,questions,key_vocab)
SELECT '7b03a001-1d2e-4f83-a1b5-6c7d8e9f0301'::uuid,7,'7B','U3','short','七下 Unit3 听力·短对话',1,'锻炼习惯 Exercise Habits',
'1. W: How often do you play basketball, Ben? M: I play it three times a week to keep fit. 2. M: What sport do you like best, Kate? W: I like swimming best. It makes me feel relaxed. 3. W: Why do you go running every morning, Mr. Lee? M: Because running keeps me healthy and strong. 4. M: How do you stay in shape, Anna? W: I ride my bike to school every day. 5. W: Do you eat junk food, Tom? M: No, I don''t. I eat lots of fruit and vegetables.',
NULL,NULL,'us_female',NULL,
'[{"q":"How often does Ben play basketball?","type":"choice","options":["Once a week.","Every day.","Three times a week."],"answer":"C"},{"q":"What sport does Kate like best?","type":"choice","options":["Swimming.","Running.","Basketball."],"answer":"A"},{"q":"Why does Mr. Lee go running every morning?","type":"choice","options":["To make friends.","To keep healthy and strong.","To win a prize."],"answer":"B"},{"q":"How does Anna stay in shape?","type":"choice","options":["She walks the dog.","She plays tennis.","She rides her bike to school."],"answer":"C"},{"q":"What does Tom eat?","type":"choice","options":["Fruit and vegetables.","Junk food.","Ice cream."],"answer":"A"}]'::jsonb,'[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM junior_listening_exercises WHERE id='7b03a001-1d2e-4f83-a1b5-6c7d8e9f0301');

-- 短对话2
INSERT INTO junior_listening_exercises (id,grade,volume,unit,kind,topic,difficulty,title,transcript,translation_cn,audio_url,speaker,duration_sec,questions,key_vocab)
SELECT '7b03a002-1d2e-4f83-a1b5-6c7d8e9f0302'::uuid,7,'7B','U3','short','七下 Unit3 听力·短对话',1,'保持健康 Staying Healthy',
'1. M: You look so fit, Emma. What is your secret? W: I play table tennis every morning before breakfast. 2. W: How often does your brother go hiking, Jack? M: He goes hiking twice a month with his friends. 3. M: Do you think sleep is important for health, Doctor? W: Yes, of course. You should sleep eight hours every night. 4. W: Why don''t you drink cola, Sam? M: Because it has too much sugar. I drink water instead. 5. M: What do you do after dinner, Lily? W: I usually take a walk with my mother.',
NULL,NULL,'us_female',NULL,
'[{"q":"What does Emma do every morning?","type":"choice","options":["Table tennis.","Running.","Dancing."],"answer":"A"},{"q":"How often does Jack''s brother go hiking?","type":"choice","options":["Once a week.","Twice a month.","Every day."],"answer":"B"},{"q":"How many hours should people sleep every night?","type":"choice","options":["Six hours.","Ten hours.","Eight hours."],"answer":"C"},{"q":"Why doesn''t Sam drink cola?","type":"choice","options":["It has too much sugar.","It is too cold.","It is too expensive."],"answer":"A"},{"q":"What does Lily do after dinner?","type":"choice","options":["Watch TV.","Do homework.","Take a walk with her mother."],"answer":"C"}]'::jsonb,'[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM junior_listening_exercises WHERE id='7b03a002-1d2e-4f83-a1b5-6c7d8e9f0302');

-- 长对话
INSERT INTO junior_listening_exercises (id,grade,volume,unit,kind,topic,difficulty,title,transcript,translation_cn,audio_url,speaker,duration_sec,questions,key_vocab)
SELECT '7b03b001-1d2e-4f83-a1b5-6c7d8e9f0303'::uuid,7,'7B','U3','short','七下 Unit3 听力·长对话',1,'健身计划 A Fitness Plan',
'M: Hi, Kate. You look great these days! How do you keep so fit? W: Thanks, Mike. I started a fitness plan three months ago. M: That sounds interesting. What do you do exactly? W: Well, I go running in the park every morning. I run for about thirty minutes. M: Wow, every morning? That is not easy. Do you do anything else? W: Yes. I play badminton with my sister twice a week. And I never eat junk food now. M: What do you eat then? W: I eat lots of vegetables, fruit and fish. I also drink plenty of water. M: How do you feel now? W: I feel much stronger and I rarely get sick. You should try it too! M: Good idea. I will start tomorrow!',
NULL,NULL,'us_female',NULL,
'[{"q":"When did Kate start her fitness plan?","type":"choice","options":["Three days ago.","Three months ago.","Three years ago."],"answer":"B"},{"q":"How long does Kate run every morning?","type":"choice","options":["About thirty minutes.","About ten minutes.","About an hour."],"answer":"A"},{"q":"How often does Kate play badminton?","type":"choice","options":["Every day.","Once a month.","Twice a week."],"answer":"C"},{"q":"What does Kate NOT eat now?","type":"choice","options":["Junk food.","Vegetables.","Fish."],"answer":"A"},{"q":"How does Kate feel now?","type":"choice","options":["Much weaker.","Much stronger.","Very tired."],"answer":"B"}]'::jsonb,'[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM junior_listening_exercises WHERE id='7b03b001-1d2e-4f83-a1b5-6c7d8e9f0303');

-- ========================= U4 Eat Well(饮食) =========================
-- 短对话1
INSERT INTO junior_listening_exercises (id,grade,volume,unit,kind,topic,difficulty,title,transcript,translation_cn,audio_url,speaker,duration_sec,questions,key_vocab)
SELECT '7b04a001-1d2e-4f83-a1b5-6c7d8e9f0401'::uuid,7,'7B','U4','short','七下 Unit4 听力·短对话',1,'健康饮食 Eating Well',
'1. W: What do you have for breakfast, Ben? M: I have milk, eggs and bread every morning. 2. M: Why don''t you eat hamburgers, Kate? W: Because they have too much fat. I prefer salad. 3. W: What is your favourite fruit, Tom? M: I love bananas. I eat one every day. 4. M: How many cups of water do you drink a day, Anna? W: I drink about eight cups of water a day. 5. W: Do you like vegetables, Sam? M: Yes, I do. Carrots are my favourite.',
NULL,NULL,'us_female',NULL,
'[{"q":"What does Ben have for breakfast?","type":"choice","options":["Milk, eggs and bread.","Rice and fish.","Cake and cola."],"answer":"A"},{"q":"Why doesn''t Kate eat hamburgers?","type":"choice","options":["They are too sweet.","They are too cold.","They have too much fat."],"answer":"C"},{"q":"What fruit does Tom love?","type":"choice","options":["Apples.","Bananas.","Oranges."],"answer":"B"},{"q":"How much water does Anna drink a day?","type":"choice","options":["About two cups.","About twelve cups.","About eight cups."],"answer":"C"},{"q":"What is Sam''s favourite vegetable?","type":"choice","options":["Carrots.","Potatoes.","Tomatoes."],"answer":"A"}]'::jsonb,'[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM junior_listening_exercises WHERE id='7b04a001-1d2e-4f83-a1b5-6c7d8e9f0401');

-- 短对话2
INSERT INTO junior_listening_exercises (id,grade,volume,unit,kind,topic,difficulty,title,transcript,translation_cn,audio_url,speaker,duration_sec,questions,key_vocab)
SELECT '7b04a002-1d2e-4f83-a1b5-6c7d8e9f0402'::uuid,7,'7B','U4','short','七下 Unit4 听力·短对话',1,'餐厅点餐 Ordering Food',
'1. M: What would you like to eat, madam? W: I would like a vegetable salad and some fish, please. 2. W: Would you like some cola, sir? M: No, thanks. I will have a glass of orange juice. 3. M: Do you want some ice cream for dessert? W: No, thank you. It has too much sugar. 4. W: How about a bowl of noodles, Jack? M: Good idea. I am really hungry now. 5. M: Is the soup too salty, Mary? W: No, it is just right. It tastes delicious.',
NULL,NULL,'us_female',NULL,
'[{"q":"What would the woman like to eat?","type":"choice","options":["A salad and some fish.","A hamburger and chips.","Rice and chicken."],"answer":"A"},{"q":"What does the man want to drink?","type":"choice","options":["Cola.","Orange juice.","Tea."],"answer":"B"},{"q":"Why doesn''t the woman want ice cream?","type":"choice","options":["It is too cold.","She is full.","It has too much sugar."],"answer":"C"},{"q":"How does Jack feel now?","type":"choice","options":["Full.","Tired.","Hungry."],"answer":"C"},{"q":"What does Mary think of the soup?","type":"choice","options":["Too salty.","Just right.","Too hot."],"answer":"B"}]'::jsonb,'[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM junior_listening_exercises WHERE id='7b04a002-1d2e-4f83-a1b5-6c7d8e9f0402');

-- 长对话
INSERT INTO junior_listening_exercises (id,grade,volume,unit,kind,topic,difficulty,title,transcript,translation_cn,audio_url,speaker,duration_sec,questions,key_vocab)
SELECT '7b04b001-1d2e-4f83-a1b5-6c7d8e9f0403'::uuid,7,'7B','U4','short','七下 Unit4 听力·长对话',1,'健康的一餐 A Healthy Meal',
'W: Tom, dinner is ready! Come and wash your hands. M: OK, Mum. Wow, what is for dinner today? W: I made fish, tomato soup and a green salad. M: Great! But where is the fried chicken? I love it. W: Sorry, Tom. We can''t eat fried food every day. It isn''t good for our health. M: But I am a growing boy. I need more energy. W: That is true. So I also cooked some brown rice and eggs for you. They give you energy. M: Can I have a cola, please? W: No, let''s drink some milk. Cola has too much sugar. M: All right, Mum. The dinner smells delicious! W: Good boy! A balanced diet will help you grow strong and tall.',
NULL,NULL,'us_female',NULL,
'[{"q":"What did Mum make for dinner?","type":"choice","options":["Fish, tomato soup and salad.","Fried chicken and chips.","Noodles and cola."],"answer":"A"},{"q":"Why can''t they eat fried food every day?","type":"choice","options":["It is too expensive.","It isn''t good for our health.","It tastes bad."],"answer":"B"},{"q":"What gives Tom energy?","type":"choice","options":["Cola and sweets.","Ice cream.","Brown rice and eggs."],"answer":"C"},{"q":"What will they drink?","type":"choice","options":["Cola.","Juice.","Milk."],"answer":"C"},{"q":"What will a balanced diet help Tom do?","type":"choice","options":["Sleep longer.","Grow strong and tall.","Run faster only."],"answer":"B"}]'::jsonb,'[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM junior_listening_exercises WHERE id='7b04b001-1d2e-4f83-a1b5-6c7d8e9f0403');

-- ========================= U5 Here and Now(现在进行时) =========================
-- 短对话1
INSERT INTO junior_listening_exercises (id,grade,volume,unit,kind,topic,difficulty,title,transcript,translation_cn,audio_url,speaker,duration_sec,questions,key_vocab)
SELECT '7b05a001-1d2e-4f83-a1b5-6c7d8e9f0501'::uuid,7,'7B','U5','short','七下 Unit5 听力·短对话',1,'此刻在做什么 What Are They Doing Now',
'1. W: Hi Ben, what are you doing now? M: I''m cleaning my room. It''s very dirty. 2. M: Is your mother cooking, Lucy? W: No, she''s watering the flowers in the garden. 3. W: What''s your father doing, Tom? M: He''s washing his car in front of the house. 4. M: Are the students having a class now, Miss Lee? W: No, they''re having a sports lesson on the playground. 5. W: Where is your sister, Jack? M: She''s reading a story book in the library.',
NULL,NULL,'us_female',NULL,
'[{"q":"What is Ben doing now?","type":"choice","options":["Cleaning his room.","Doing homework.","Sleeping."],"answer":"A"},{"q":"What is Lucy''s mother doing?","type":"choice","options":["Cooking.","Watering the flowers.","Washing clothes."],"answer":"B"},{"q":"What is Tom''s father doing?","type":"choice","options":["Driving his car.","Selling his car.","Washing his car."],"answer":"C"},{"q":"What are the students doing now?","type":"choice","options":["Having a maths class.","Having lunch.","Having a sports lesson."],"answer":"C"},{"q":"Where is Jack''s sister?","type":"choice","options":["In the garden.","In the library.","In the kitchen."],"answer":"B"}]'::jsonb,'[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM junior_listening_exercises WHERE id='7b05a001-1d2e-4f83-a1b5-6c7d8e9f0501');

-- 短对话2
INSERT INTO junior_listening_exercises (id,grade,volume,unit,kind,topic,difficulty,title,transcript,translation_cn,audio_url,speaker,duration_sec,questions,key_vocab)
SELECT '7b05a002-1d2e-4f83-a1b5-6c7d8e9f0502'::uuid,7,'7B','U5','short','七下 Unit5 听力·短对话',1,'电话聊天 On the Phone',
'1. M: Hello, Anna. What are you doing? W: Hi, I''m doing my homework in my bedroom. 2. W: Is it raining in Shanghai now, Ben? M: Yes, it is. I''m staying at home and watching TV. 3. M: What is your brother doing, Kate? W: He''s playing the guitar in the living room. 4. W: Are you having dinner now, Tom? M: No, I''m making a birthday card for my friend. 5. M: Where are your parents, Lucy? W: They''re taking a walk in the park.',
NULL,NULL,'us_female',NULL,
'[{"q":"What is Anna doing?","type":"choice","options":["Doing her homework.","Watching TV.","Playing games."],"answer":"A"},{"q":"What is the weather like in Shanghai now?","type":"choice","options":["It''s snowing.","It''s raining.","It''s sunny."],"answer":"B"},{"q":"What is Kate''s brother doing?","type":"choice","options":["Playing the piano.","Playing football.","Playing the guitar."],"answer":"C"},{"q":"What is Tom doing now?","type":"choice","options":["Having dinner.","Making a birthday card.","Sleeping."],"answer":"B"},{"q":"Where are Lucy''s parents?","type":"choice","options":["At home.","At work.","In the park."],"answer":"C"}]'::jsonb,'[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM junior_listening_exercises WHERE id='7b05a002-1d2e-4f83-a1b5-6c7d8e9f0502');

-- 长对话
INSERT INTO junior_listening_exercises (id,grade,volume,unit,kind,topic,difficulty,title,transcript,translation_cn,audio_url,speaker,duration_sec,questions,key_vocab)
SELECT '7b05b001-1d2e-4f83-a1b5-6c7d8e9f0503'::uuid,7,'7B','U5','short','七下 Unit5 听力·长对话',1,'此刻的电话 A Call Right Now',
'W: Hi, Mike! It''s Lucy. What are you doing right now? M: Hi, Lucy. I''m helping my dad clean the kitchen. W: Sounds busy! Is your sister helping too? M: No, she isn''t. She''s drawing a picture of our cat by the window. W: Ha-ha, cute! What about your mum? M: She''s sitting on the sofa and reading a magazine. W: Is it sunny there in Guangzhou? M: No, it''s cloudy and a little cold. We''re all staying inside today. W: Here in Beijing the sun is shining. I''m flying a kite with my brother in the park. M: That''s nice! Maybe we can video call again tonight. W: Sure! Talk to you later!',
NULL,NULL,'us_female',NULL,
'[{"q":"What is Mike doing right now?","type":"choice","options":["Helping his dad clean the kitchen.","Drawing a picture.","Reading a magazine."],"answer":"A"},{"q":"What is Mike''s sister doing?","type":"choice","options":["Cleaning the kitchen.","Drawing a picture.","Flying a kite."],"answer":"B"},{"q":"What is Mike''s mum doing?","type":"choice","options":["Cooking dinner.","Sleeping.","Reading a magazine."],"answer":"C"},{"q":"What is the weather like in Guangzhou?","type":"choice","options":["Sunny and warm.","Cloudy and cold.","Windy and hot."],"answer":"B"},{"q":"What is Lucy doing in the park?","type":"choice","options":["Running.","Reading.","Flying a kite."],"answer":"C"}]'::jsonb,'[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM junior_listening_exercises WHERE id='7b05b001-1d2e-4f83-a1b5-6c7d8e9f0503');

-- ========================= U7 A Day to Remember(过去时) =========================
-- 短对话1
INSERT INTO junior_listening_exercises (id,grade,volume,unit,kind,topic,difficulty,title,transcript,translation_cn,audio_url,speaker,duration_sec,questions,key_vocab)
SELECT '7b07a001-1d2e-4f83-a1b5-6c7d8e9f0701'::uuid,7,'7B','U7','short','七下 Unit7 听力·短对话',1,'难忘的一天 An Unforgettable Day',
'1. W: What did you do last weekend, Ben? M: I visited the zoo with my family. I saw many pandas. 2. M: How was your school trip, Kate? W: It was wonderful! We climbed a big mountain. 3. W: Where did you go on your birthday, Tom? M: I went to a water park with my friends. 4. M: What did you get for your birthday, Anna? W: My parents gave me a new bike. I was so happy. 5. W: Did you enjoy the concert last night, Sam? M: Yes, I did. The music was amazing.',
NULL,NULL,'us_female',NULL,
'[{"q":"What did Ben do last weekend?","type":"choice","options":["Visited the zoo.","Watched a film.","Played football."],"answer":"A"},{"q":"What did Kate do on her school trip?","type":"choice","options":["Went swimming.","Climbed a mountain.","Saw a film."],"answer":"B"},{"q":"Where did Tom go on his birthday?","type":"choice","options":["A cinema.","A library.","A water park."],"answer":"C"},{"q":"What did Anna get for her birthday?","type":"choice","options":["A new bike.","A new phone.","A new book."],"answer":"A"},{"q":"What did Sam think of the concert?","type":"choice","options":["It was boring.","The music was amazing.","It was too long."],"answer":"B"}]'::jsonb,'[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM junior_listening_exercises WHERE id='7b07a001-1d2e-4f83-a1b5-6c7d8e9f0701');

-- 短对话2
INSERT INTO junior_listening_exercises (id,grade,volume,unit,kind,topic,difficulty,title,transcript,translation_cn,audio_url,speaker,duration_sec,questions,key_vocab)
SELECT '7b07a002-1d2e-4f83-a1b5-6c7d8e9f0702'::uuid,7,'7B','U7','short','七下 Unit7 听力·短对话',1,'上周做了什么 Last Week',
'1. M: Why were you absent yesterday, Lucy? W: I was ill, so I stayed at home and saw a doctor. 2. W: What did you watch on TV last night, Tom? M: I watched an exciting football match. 3. M: How did you go to the museum, Kate? W: We went there by subway. It was fast. 4. W: Who did you meet at the park, Ben? M: I met my old friend Jack. We were very glad. 5. M: What was the weather like on your trip, Anna? W: It was sunny and warm. We were very lucky.',
NULL,NULL,'us_female',NULL,
'[{"q":"Why was Lucy absent yesterday?","type":"choice","options":["She was ill.","She was busy.","She was late."],"answer":"A"},{"q":"What did Tom watch last night?","type":"choice","options":["A cartoon.","A football match.","The news."],"answer":"B"},{"q":"How did Kate go to the museum?","type":"choice","options":["By bus.","On foot.","By subway."],"answer":"C"},{"q":"Who did Ben meet at the park?","type":"choice","options":["His teacher.","His old friend Jack.","His cousin."],"answer":"B"},{"q":"What was the weather like on Anna''s trip?","type":"choice","options":["Rainy and cold.","Windy and cool.","Sunny and warm."],"answer":"C"}]'::jsonb,'[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM junior_listening_exercises WHERE id='7b07a002-1d2e-4f83-a1b5-6c7d8e9f0702');

-- 长对话
INSERT INTO junior_listening_exercises (id,grade,volume,unit,kind,topic,difficulty,title,transcript,translation_cn,audio_url,speaker,duration_sec,questions,key_vocab)
SELECT '7b07b001-1d2e-4f83-a1b5-6c7d8e9f0703'::uuid,7,'7B','U7','short','七下 Unit7 听力·长对话',1,'难忘的旅行 An Unforgettable Trip',
'M: Hi, Lucy. How was your holiday last week? W: Hi, Tom. It was a day to remember! I went to Hainan with my family. M: Wow, lucky you! What did you do there? W: On the first day, we went to the beach. The sea was blue and warm. M: Did you swim in the sea? W: Yes, I did! I also played volleyball with my little brother. M: That sounds fun. What did you eat there? W: We ate lots of fresh fish. It was delicious. M: Did you take any photos? W: Of course! I took over a hundred photos. I''ll show you later. M: Great! I really want to go there one day. W: You should! It was the best trip of my life.',
NULL,NULL,'us_female',NULL,
'[{"q":"Where did Lucy go last week?","type":"choice","options":["Hainan.","Beijing.","Shanghai."],"answer":"A"},{"q":"What did Lucy do on the first day?","type":"choice","options":["Climbed a mountain.","Went to the beach.","Visited a museum."],"answer":"B"},{"q":"What did Lucy play with her little brother?","type":"choice","options":["Football.","Basketball.","Volleyball."],"answer":"C"},{"q":"What did they eat there?","type":"choice","options":["Fried chicken.","Noodles.","Fresh fish."],"answer":"C"},{"q":"How many photos did Lucy take?","type":"choice","options":["Over a hundred.","About ten.","About fifty."],"answer":"A"}]'::jsonb,'[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM junior_listening_exercises WHERE id='7b07b001-1d2e-4f83-a1b5-6c7d8e9f0703');

-- ========================= U8 Once upon a Time(故事/过去时) =========================
-- 长对话(谈论一个故事)
INSERT INTO junior_listening_exercises (id,grade,volume,unit,kind,topic,difficulty,title,transcript,translation_cn,audio_url,speaker,duration_sec,questions,key_vocab)
SELECT '7b08b001-1d2e-4f83-a1b5-6c7d8e9f0801'::uuid,7,'7B','U8','short','七下 Unit8 听力·长对话',1,'狮子与老鼠 The Lion and the Mouse',
'W: Hi, Jack. What are you reading? M: Hi, Anna. I''m reading a famous story, The Lion and the Mouse. W: I don''t know it. Can you tell me about it? M: Of course. One day, a big lion was sleeping under a tree. A little mouse ran across his nose and woke him up. W: Was the lion angry? M: Yes, very angry! He caught the mouse, but the mouse begged for help, so the lion let him go. W: That was kind. What happened next? M: A few days later, some hunters caught the lion in a net. The little mouse heard him and bit the net into pieces. W: So the lion was free again! M: Yes! The story tells us that even small friends can give big help.',
NULL,NULL,'us_female',NULL,
'[{"q":"What story is Jack reading?","type":"choice","options":["The Lion and the Mouse.","The Fox and the Grapes.","The Wind and the Sun."],"answer":"A"},{"q":"What was the lion doing under the tree?","type":"choice","options":["Eating.","Sleeping.","Running."],"answer":"B"},{"q":"Why was the lion angry at first?","type":"choice","options":["The mouse woke him up.","The mouse ate his food.","The mouse broke his net."],"answer":"A"},{"q":"How did the mouse help the lion later?","type":"choice","options":["It called the hunters.","It bit the net into pieces.","It brought him food."],"answer":"B"},{"q":"What does the story tell us?","type":"choice","options":["Lions are the strongest.","We should not sleep outside.","Even small friends can give big help."],"answer":"C"}]'::jsonb,'[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM junior_listening_exercises WHERE id='7b08b001-1d2e-4f83-a1b5-6c7d8e9f0801');

COMMIT;

-- ===== 校验 =====
-- 1) 各 unit 补齐后条数(应 U2/U3/U4/U5/U7=6,U8=6):
SELECT unit, count(*) AS cnt FROM junior_listening_exercises
WHERE volume='7B' AND unit IN ('U2','U3','U4','U5','U7','U8') GROUP BY unit ORDER BY unit;
-- 2) 新16条已插 + audio_url 待生成:
SELECT unit, topic, title, (audio_url IS NULL) AS audio_pending
FROM junior_listening_exercises
WHERE id::text LIKE '7b0%-1d2e-4f83-a1b5-%' ORDER BY unit, topic, title;
-- END
