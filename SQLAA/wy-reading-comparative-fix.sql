-- 外研社阅读·比较级/最高级/as…as 超前 + 解析引文 修正(线上重灌)
-- 生成 2026-07-25。★只 UPDATE 不删不插★ 保住 id,避免用户进度成孤儿。
-- 已由 wy-reading-difficulty-fix.sql / wy-reading-past-perfect-fix.sql 落库的字段不重复出现。
-- wy7B 不在本文件(未入库,改在 wy7b-reading-load.sql 随灌库生效);wy8B 仅 1 处解析。
-- 幂等:整值覆盖 + 断言按旧文本归零判定,重复跑安全。
BEGIN;

-- wy7A U1 My first day [questions]
UPDATE public.junior_reading SET
  questions = '[{"q": "Who helps the writer feel brave enough to answer?", "answer": "C", "options": ["Mr Lee, the maths teacher.", "A student near the door.", "Ben, the writer''s classmate.", "The writer''s mother."], "explanation": "Ben 说 \"You can try. It is OK to be wrong\",鼓励作者举手。"}, {"q": "What does Mr Lee write on the board?", "answer": "A", "options": ["Some numbers.", "A long sentence.", "The writer''s name.", "A famous saying."], "explanation": "原文 \"He writes some numbers on the board.\""}, {"q": "What is the best main idea of the passage?", "answer": "B", "options": ["Maths is a hard subject.", "Don''t be afraid to try, even if you may be wrong.", "The first day of school is boring.", "Teachers always ask easy questions."], "explanation": "Mr Lee 的话点题:\"do not be afraid to try... we learn from our mistakes.\""}, {"q": "Why does the writer''s heart beat fast before answering?", "answer": "D", "options": ["Because the room is too hot.", "Because he is late for class.", "Because he does not know the answer at all.", "Because he is nervous about answering in front of everyone."], "explanation": "作者知道答案却不确定、怕答错(\"I am not sure... What if it is wrong?\"),紧张。文中未直说,靠推断。"}, {"q": "In the passage, \"My voice is small\" means the writer speaks ____.", "answer": "A", "options": ["quietly and shyly", "loudly and clearly", "quickly and angrily", "slowly and proudly"], "explanation": "紧张、不自信的语境下 \"voice is small\" = 声音小、怯生生地说。"}]'::jsonb
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U1' AND title='My first day';

-- wy7A U1 My friends and I [body+word_count]
UPDATE public.junior_reading SET
  body = 'I have three good friends: Ben, Kate and Tom. We are all different, and that is why we are such a happy group. Ben is funny. He always tells jokes and makes us laugh. Kate is quiet but very clever. She reads a lot of books and knows many things. Tom is strong and good at sport. He runs very fast in our class. I am not clever or quick, but I am a good listener. When one of us has a problem, we all help. We study together, play together and share everything. True friends are hard to find, and I am lucky to have mine.',
  word_count = 107
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U1' AND title='My friends and I';

-- wy7A U1 Making friends [body]
UPDATE public.junior_reading SET
  body = 'Do you want to make more friends? It is not hard if you have a kind heart. First, always wear a smile. A smile is like a door; it opens easily. Second, be a good listener. When others talk, listen with care. Third, help people when they are in need. A small act of kindness means a lot. Also, share your things and your time. Do not laugh at other people''s mistakes. Everyone likes a friend who is honest and warm. Making friends takes a little time, but it is worth it. Good friends make life bright and happy. So be kind today, and friends will come to you.'
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U1' AND title='Making friends';

-- wy7A U2 Music together [questions]
UPDATE public.junior_reading SET
  questions = '[{"q": "What instrument does Kevin play?", "answer": "A", "options": ["The drums.", "The guzheng.", "The guitar.", "The erhu."], "explanation": "原文 \"I play the drums in my school band.\""}, {"q": "When do Kevin and his aunt practise for the concert?", "answer": "C", "options": ["Every morning.", "Only at weekends.", "Every evening for two weeks.", "Once a month."], "explanation": "原文 \"We practise every evening for two weeks.\""}, {"q": "What is the best main idea of the passage?", "answer": "B", "options": ["Kevin''s aunt is a famous player.", "Old music and new music can come together and bring joy.", "Only drums make good music.", "A concert is held in the town every year."], "explanation": "末句点题:新旧音乐结合让人快乐。"}, {"q": "Why don''t the two sounds match at first?", "answer": "D", "options": ["Because Kevin plays too quietly.", "Because his aunt is angry.", "Because the music room is too small.", "Because the drums and the guzheng have very different styles."], "explanation": "drums 快而强、guzheng 慢而柔,风格不同,故起初不合;文中未直说,靠推断。"}, {"q": "\"Everyone claps for us\" means the people ____.", "answer": "A", "options": ["hit their hands together to show they like it", "walk away quietly", "fall asleep", "sing a new song"], "explanation": "clap = 鼓掌。"}]'::jsonb
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U2' AND title='Music together';

-- wy7A U2 I love music [body]
UPDATE public.junior_reading SET
  body = 'Music is a big part of my life. Every day, I listen to music at home. In the morning, happy songs help me wake up. In the evening, soft music helps me relax. I also play the guitar. I am not very good yet, but I practise a little every day. My favourite songs are about nature and friends. When I feel sad, music makes me feel calm. When I feel happy, music makes me want to dance. At school, I am in the music club. We sing and play together every week. Music is a language that everyone can understand. It brings people close, and it fills my heart with joy.'
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U2' AND title='I love music';

-- wy7A U3 My grandpa [body+questions+word_count]
UPDATE public.junior_reading SET
  body = 'My grandpa is seventy years old, but he is still strong and happy. He has short white hair and a kind face. Every morning, he gets up early and does exercise in the park. He walks slowly with a cup of tea in his hand. Grandpa loves stories. In the evening, he tells me about his young days. His stories are always warm and funny. He also plays chess very well, and he often teaches me. Grandpa is patient and wise. He often tells me: a kind heart matters, not money. I learn so much from him. I hope my grandpa stays healthy and happy for many years.',
  questions = '[{"q": "What does grandpa do every morning?", "answer": "C", "options": ["He tells stories.", "He plays chess.", "He does exercise in the park.", "He drinks tea in bed."], "explanation": "''Every morning, he gets up early and does exercise in the park''。"}, {"q": "What matters to grandpa?", "answer": "B", "options": ["A good story.", "A kind heart.", "A game of chess.", "A cup of tea."], "explanation": "''a kind heart matters, not money''。"}, {"q": "What is the passage mainly about?", "answer": "D", "options": ["How to play chess.", "Why tea is warm.", "Where the park is.", "The writer''s kind and wise grandpa."], "explanation": "全文描写爷爷(现在时)。"}]'::jsonb,
  word_count = 108
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U3' AND title='My grandpa';

-- wy7A U3 Sunday with my family [body]
UPDATE public.junior_reading SET
  body = 'Sunday is my favourite day, because I spend it with my family. In the morning, we get up late and have a big breakfast together. My mother makes eggs and bread, and the kitchen smells wonderful. After breakfast, my father and I wash the car. My little brother helps, but he plays with the water more than he works! In the afternoon, we often visit my grandparents. Grandma always has sweet fruit for us. In the evening, we watch a film at home. We sit close on the sofa and laugh together. Sunday is not about big things. It is about being close to the people we love. I always want Sunday to go on and on.'
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U3' AND title='Sunday with my family';

-- wy7A U4 Spring Festival [body+word_count]
UPDATE public.junior_reading SET
  body = 'Spring Festival is a big festival in China. It comes in winter, at the start of the new year. Before the festival, every family cleans the house from top to bottom. People put up red words and bright lanterns on the doors. Red is the colour of luck and joy. On New Year''s Eve, the whole family sits together for a big dinner. There are many nice dishes, and fish is a must, because it means good luck. Children love this time best. They wear new clothes and get red packets with money inside. Everywhere, people smile and say kind words. Spring Festival is a warm time of family, food and hope.',
  word_count = 113
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U4' AND title='Spring Festival';

-- wy7A U4 Festival food [body]
UPDATE public.junior_reading SET
  body = 'At Spring Festival, food is very important. Every family cooks many special dishes. In the north of China, people love dumplings. The whole family makes them together. They put the dumplings into hot water, and soon they are ready to eat. In the south, people eat sweet rice cakes and fish. Every dish has a lucky meaning. Fish means ''more every year'', and dumplings look like old gold money. Sweet food means a sweet life. Grandma always cooks a big meal for the new year. The kitchen is warm and full of good smells. When we eat together, we feel happy and thankful. Festival food is not just tasty; it carries our best wishes.'
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U4' AND title='Festival food';

-- wy7A U5 My little seed [body]  (同单元同名两篇,靠 difficulty 消歧)
UPDATE public.junior_reading SET
  body = 'Today I put a small seed into the ground. It looks weak now, but it will become something great one day. First, it will need water and sunlight. In a few days, a tiny green leaf is going to appear. The leaf will drink the sunlight and make food for the plant. Slowly, the stem will grow tall and strong. Next spring, my little seed is going to be a young tree. Birds will come and build their nests in it. In summer, it will give us cool shade. Children will play under it on hot days. In autumn, its leaves will turn gold and fall softly to the ground. People will rest under it and tell old stories. The tree will also help the air. It is going to take in bad gas and give out fresh oxygen. Small animals will find food and a home in its branches. Years later, I will be an old man, but my tree will still be here. It will drop new seeds, and more trees are going to grow. One small seed will change a whole hill. Plants are quiet, but they are truly powerful.'
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U5' AND title='My little seed' AND difficulty=0;

-- wy7A U6 The ants’ secret [body+word_count]
UPDATE public.junior_reading SET
  body = 'I am doing a project about ants this week. At first, ants look boring to me. But now I am changing my mind. I am sitting by the garden with my notebook. A line of ants is moving across the path. They are carrying tiny pieces of food. The food is very big, but they are not giving up. Look! One ant is falling into a small hole. Two other ants are helping it. They are working together like good friends. Now it is starting to rain. The ants are running back to their home under the old tree. They are not pushing each other. They are moving in a neat line. Near the wall, some ants are building a new road with tiny stones. One big ant is cleaning its legs in the sun. They are never fighting, and they are never resting. I am reading a book about ants tonight. Ants are talking to each other with smells — that is what the book tells us. Some ants are even growing their own food! I am learning so much. Ants are small, but they are amazing. I am really glad about this project.',
  word_count = 194
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U6' AND title='The ants'' secret';

-- wy7A U6 The busy ants [body+word_count]
UPDATE public.junior_reading SET
  body = 'Ants are very small, but they are amazing animals. They live together in big groups called colonies. Every ant has a job to do. Some ants look for food. When they find it, they carry it back home. An ant is very strong. It can carry a very heavy piece of food. Other ants take care of the babies or clean the home. They all work together, and no ant is lazy. Ants talk to each other in a special way, with smells. When one ant finds food, it leaves a smell on the ground, so the others can follow. From ants, we learn an important lesson: team work makes hard things easy.',
  word_count = 113
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U6' AND title='The busy ants';

-- wy7A U6 Birds in my garden [body+word_count]
UPDATE public.junior_reading SET
  body = 'Every morning, birds come to my garden, and I love to watch them. There is a big tree near my window. Many small birds live in it. Early in the day, they sing sweet songs. Their music wakes me up every morning. I often put some bread and water on the ground for them. The birds are not afraid of me now. Some of them are brown, and some are grey with bright eyes. They fly fast and jump from branch to branch. In spring, they build small homes in the tree. Watching the birds makes me feel calm and happy. They remind me that nature is full of little wonders.',
  word_count = 111
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U6' AND title='Birds in my garden';

-- wy8A U1 My first time on a train [questions]
UPDATE public.junior_reading SET
  questions = '[{"q": "Where has the writer''s family just come back from?", "answer": "D", "options": ["The sea.", "A big city.", "A farm.", "The mountains."], "explanation": "''My family and I have just come back from a trip to the mountains''。"}, {"q": "What did the writer do with the new friend during the ride?", "answer": "C", "options": ["Slept all the way.", "Read books alone.", "Shared sweets and jokes.", "Played on a phone."], "explanation": "''We have shared sweets and jokes for hours''。"}, {"q": "What is the passage mainly about?", "answer": "D", "options": ["How to buy a train ticket.", "Why buses are slow.", "Where the mountains are.", "The writer''s exciting first long train ride."], "explanation": "全文讲第一次长途火车之旅的兴奋(完成时)。"}]'::jsonb
WHERE publisher='junior_fltrp' AND volume='wy8A' AND unit='U1' AND title='My first time on a train';

-- wy8A U4 What my mother wants me to do [questions]
UPDATE public.junior_reading SET
  questions = '[{"q": "Why does the mother ask the writer to get up early?", "answer": "C", "options": ["To watch films.", "To play games.", "Because the morning is the best time to learn.", "To clean the street."], "explanation": "''she calls the morning the best time to learn''。"}, {"q": "What does the mother do when the writer feels lazy?", "answer": "D", "options": ["She shouts at him.", "She does his homework.", "She sends him to bed.", "She encourages him to try his best."], "explanation": "''she encourages me to try my best and never to give up''。"}, {"q": "What is the passage mainly about?", "answer": "A", "options": ["How the writer''s mother guides him to grow well.", "How to wash dishes.", "Why mornings are cold.", "Where the writer studies."], "explanation": "全文讲母亲的引导(不定式作宾补)。"}]'::jsonb
WHERE publisher='junior_fltrp' AND volume='wy8A' AND unit='U4' AND title='What my mother wants me to do';

-- wy8B U4 The light in the old house [questions]
UPDATE public.junior_reading SET
  questions = '[{"q": "Why did old Mr Chen think someone was inside?", "answer": "B", "options": ["Because he saw the old man.", "Because a light can''t turn itself on.", "Because a thief was caught.", "Because children were playing."], "explanation": "''A light can''t turn itself on''→一定有人。"}, {"q": "Who was really in the old house?", "answer": "C", "options": ["A dangerous thief.", "A young traveller.", "An old man who used to live there.", "Some children playing a game."], "explanation": "''sat an old man ... I used to live here as a boy''。"}, {"q": "What is the main idea of the passage?", "answer": "D", "options": ["Old houses are dangerous places.", "Thieves often hide in empty houses.", "Children should not play at night.", "A village''s fear turned into kindness."], "explanation": "全文由猜疑转为对孤老的善意。"}, {"q": "We can infer that the villagers were ____ at the end.", "answer": "A", "options": ["kind and ready to help the old man", "angry with the old man", "still afraid of the light", "sorry they came"], "explanation": "母亲请他同住可推断村民善良。"}, {"q": "When the writer says the person ''can''t be dangerous'', he means it is ____.", "answer": "A", "options": ["impossible that the person is dangerous", "certain that the person is a thief", "possible that something was stolen", "clear that someone was hurt"], "explanation": "can''t be=不可能是,表否定推测。"}]'::jsonb
WHERE publisher='junior_fltrp' AND volume='wy8B' AND unit='U4' AND title='The light in the old house';

-- 断言:旧文本必须归零
DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM public.junior_reading WHERE publisher='junior_fltrp'
    AND volume='wy7A' AND unit='U1' AND body LIKE '%faster than anyone in our class. I am not %';
  IF n<>0 THEN RAISE EXCEPTION 'wy7A U1 My friends and I 旧文本仍在 % 行', n; END IF;
  SELECT count(*) INTO n FROM public.junior_reading WHERE publisher='junior_fltrp'
    AND volume='wy7A' AND unit='U1' AND body LIKE '%er and happier. So be kind today, and frie%';
  IF n<>0 THEN RAISE EXCEPTION 'wy7A U1 Making friends 旧文本仍在 % 行', n; END IF;
  SELECT count(*) INTO n FROM public.junior_reading WHERE publisher='junior_fltrp'
    AND volume='wy7A' AND unit='U2' AND body LIKE '%better. When I feel happy, music makes me %';
  IF n<>0 THEN RAISE EXCEPTION 'wy7A U2 I love music 旧文本仍在 % 行', n; END IF;
  SELECT count(*) INTO n FROM public.junior_reading WHERE publisher='junior_fltrp'
    AND volume='wy7A' AND unit='U3' AND body LIKE '%says that a kind heart is more important t%';
  IF n<>0 THEN RAISE EXCEPTION 'wy7A U3 My grandpa 旧文本仍在 % 行', n; END IF;
  SELECT count(*) INTO n FROM public.junior_reading WHERE publisher='junior_fltrp'
    AND volume='wy7A' AND unit='U3' AND body LIKE '%be a little longer.%';
  IF n<>0 THEN RAISE EXCEPTION 'wy7A U3 Sunday with my family 旧文本仍在 % 行', n; END IF;
  SELECT count(*) INTO n FROM public.junior_reading WHERE publisher='junior_fltrp'
    AND volume='wy7A' AND unit='U4' AND body LIKE '%the most important festival in China. It c%';
  IF n<>0 THEN RAISE EXCEPTION 'wy7A U4 Spring Festival 旧文本仍在 % 行', n; END IF;
  SELECT count(*) INTO n FROM public.junior_reading WHERE publisher='junior_fltrp'
    AND volume='wy7A' AND unit='U4' AND body LIKE '%the best meal of the year. The kitchen is %';
  IF n<>0 THEN RAISE EXCEPTION 'wy7A U4 Festival food 旧文本仍在 % 行', n; END IF;
  SELECT count(*) INTO n FROM public.junior_reading WHERE publisher='junior_fltrp'
    AND volume='wy7A' AND unit='U5' AND body LIKE '%er and stronger. Next spring, my little se%';
  IF n<>0 THEN RAISE EXCEPTION 'wy7A U5 My little seed 旧文本仍在 % 行', n; END IF;
  SELECT count(*) INTO n FROM public.junior_reading WHERE publisher='junior_fltrp'
    AND volume='wy7A' AND unit='U6' AND body LIKE '%much bigger than their bodies, but they ar%';
  IF n<>0 THEN RAISE EXCEPTION 'wy7A U6 The ants’ secret 旧文本仍在 % 行', n; END IF;
  SELECT count(*) INTO n FROM public.junior_reading WHERE publisher='junior_fltrp'
    AND volume='wy7A' AND unit='U6' AND body LIKE '%food much bigger than itself. Other ants t%';
  IF n<>0 THEN RAISE EXCEPTION 'wy7A U6 The busy ants 旧文本仍在 % 行', n; END IF;
  SELECT count(*) INTO n FROM public.junior_reading WHERE publisher='junior_fltrp'
    AND volume='wy7A' AND unit='U6' AND body LIKE '%better than any clock. I often put some br%';
  IF n<>0 THEN RAISE EXCEPTION 'wy7A U6 Birds in my garden 旧文本仍在 % 行', n; END IF;
  RAISE NOTICE 'OK: 线上超前结构修正已全部落库';
END $$;

COMMIT;