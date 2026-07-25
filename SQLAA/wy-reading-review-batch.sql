-- 外研社四册阅读·补审批次修正(线上一次性同步)
-- 生成 2026-07-25。整值覆盖,幂等,重复跑安全。
-- ★本文件取代以下四个待跑文件,不要再单独跑★
--   wy-reading-comparative-fix.sql / wy-reading-morethan-fix.sql
--   wy8a-u2-coverage-fix.sql / wy8b-u1-dedup-fix.sql
-- (wy7b-grammar-comparative-fix.sql 改的是 junior_grammar_questions 另一张表,仍需单独跑)
--
-- 含:比较级/最高级/as…as 超前、more than 真比较、过去完成时、宾语从句 12 处、
--     非限制性定语从句 2 处、解析引文不逐字、wy8A U2 考点补齐、U4 使役补齐、
--     wy8B U1 去 8-gram 模板雷同、difficulty 分层。
-- 只 UPDATE 不删不插,保住 id。
BEGIN;

-- wy7A Starter My new school [difficulty]
UPDATE public.junior_reading SET
  difficulty = 0
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='Starter' AND title='My new school';

-- wy7A U1 My first day [questions+difficulty]
UPDATE public.junior_reading SET
  questions = '[{"q": "Who helps the writer feel brave enough to answer?", "answer": "C", "options": ["Mr Lee, the maths teacher.", "A student near the door.", "Ben, the writer''s classmate.", "The writer''s mother."], "explanation": "Ben 说 \"You can try. It is OK to be wrong\",鼓励作者举手。"}, {"q": "What does Mr Lee write on the board?", "answer": "A", "options": ["Some numbers.", "A long sentence.", "The writer''s name.", "A famous saying."], "explanation": "原文 \"He writes some numbers on the board.\""}, {"q": "What is the best main idea of the passage?", "answer": "B", "options": ["Maths is a hard subject.", "Don''t be afraid to try, even if you may be wrong.", "The first day of school is boring.", "Teachers always ask easy questions."], "explanation": "Mr Lee 的话点题:\"do not be afraid to try... we learn from our mistakes.\""}, {"q": "Why does the writer''s heart beat fast before answering?", "answer": "D", "options": ["Because the room is too hot.", "Because he is late for class.", "Because he does not know the answer at all.", "Because he is nervous about answering in front of everyone."], "explanation": "作者知道答案却不确定、怕答错(\"I am not sure... What if it is wrong?\"),紧张。文中未直说,靠推断。"}, {"q": "In the passage, \"My voice is small\" means the writer speaks ____.", "answer": "A", "options": ["quietly and shyly", "loudly and clearly", "quickly and angrily", "slowly and proudly"], "explanation": "紧张、不自信的语境下 \"voice is small\" = 声音小、怯生生地说。"}]'::jsonb,
  difficulty = 0
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U1' AND title='My first day';

-- wy7A U1 A new student [body+word_count]
UPDATE public.junior_reading SET
  body = 'Today there is a new student in our class. His name is Sam. He comes from another city, so he does not know anyone here. At first, he is quiet and a little shy. He sits alone and says nothing. We want him to feel welcome. At lunch, my friends and I sit with him. We ask him about his hobbies and his old school. Soon, Sam begins to smile. ''I like football, just like you!'' he says. After school, we play a game together. Now Sam is not alone any more. A new friend brings new joy. It is easy to be kind, and kindness makes everyone happy.',
  word_count = 109
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U1' AND title='A new student';

-- wy7A U1 My friends and I [body+word_count]
UPDATE public.junior_reading SET
  body = 'I have three good friends: Ben, Kate and Tom. We are all different, and that is why we are such a happy group. Ben is funny. He always tells jokes and makes us laugh. Kate is quiet but very clever. She reads a lot of books and knows many things. Tom is strong and good at sport. He runs very fast in our class. I am not clever or quick, but I am a good listener. When one of us has a problem, we all help. We study together, play together and share everything. True friends are hard to find, and I am lucky to have mine.',
  word_count = 107
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U1' AND title='My friends and I';

-- wy7A U1 Making friends [body]
UPDATE public.junior_reading SET
  body = 'Do you want to make more friends? It is not hard if you have a kind heart. First, always wear a smile. A smile is like a door; it opens easily. Second, be a good listener. When others talk, listen with care. Third, help people when they are in need. A small act of kindness means a lot. Also, share your things and your time. Do not laugh at other people''s mistakes. Everyone likes a friend who is honest and warm. Making friends takes a little time, but it is worth it. Good friends make life bright and happy. So be kind today, and friends will come to you.'
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U1' AND title='Making friends';

-- wy7A U2 Music together [questions+difficulty]
UPDATE public.junior_reading SET
  questions = '[{"q": "What instrument does Kevin play?", "answer": "A", "options": ["The drums.", "The guzheng.", "The guitar.", "The erhu."], "explanation": "原文 \"I play the drums in my school band.\""}, {"q": "When do Kevin and his aunt practise for the concert?", "answer": "C", "options": ["Every morning.", "Only at weekends.", "Every evening for two weeks.", "Once a month."], "explanation": "原文 \"We practise every evening for two weeks.\""}, {"q": "What is the best main idea of the passage?", "answer": "B", "options": ["Kevin''s aunt is a famous player.", "Old music and new music can come together and bring joy.", "Only drums make good music.", "A concert is held in the town every year."], "explanation": "末句点题:新旧音乐结合让人快乐。"}, {"q": "Why don''t the two sounds match at first?", "answer": "D", "options": ["Because Kevin plays too quietly.", "Because his aunt is angry.", "Because the music room is too small.", "Because the drums and the guzheng have very different styles."], "explanation": "drums 快而强、guzheng 慢而柔,风格不同,故起初不合;文中未直说,靠推断。"}, {"q": "\"Everyone claps for us\" means the people ____.", "answer": "A", "options": ["hit their hands together to show they like it", "walk away quietly", "fall asleep", "sing a new song"], "explanation": "clap = 鼓掌。"}]'::jsonb,
  difficulty = 0
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U2' AND title='Music together';

-- wy7A U2 I love music [body]
UPDATE public.junior_reading SET
  body = 'Music is a big part of my life. Every day, I listen to music at home. In the morning, happy songs help me wake up. In the evening, soft music helps me relax. I also play the guitar. I am not very good yet, but I practise a little every day. My favourite songs are about nature and friends. When I feel sad, music makes me feel calm. When I feel happy, music makes me want to dance. At school, I am in the music club. We sing and play together every week. Music is a language that everyone can understand. It brings people close, and it fills my heart with joy.'
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U2' AND title='I love music';

-- wy7A U2 Our music club [body]
UPDATE public.junior_reading SET
  body = 'Our school has a wonderful music club, and I am a happy member. We meet every Friday afternoon in the music hall. Some students play the piano, and others play the guitar or the drum. A few of us just love to sing. Our teacher, Mr Li, is kind and patient. He helps everyone, even the ones who are shy. In the club, we do not need to be the best. We only need to enjoy the music. At the end of the year, we put on a big show for the whole school. Everyone claps for us. The music club is like a warm family. There we make friends and make music together.'
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U2' AND title='Our music club';

-- wy7A U3 Grandpa’s silent love [difficulty]
UPDATE public.junior_reading SET
  difficulty = 0
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U3' AND title='Grandpa''s silent love';

-- wy7A U3 My grandpa [body+questions+word_count]
UPDATE public.junior_reading SET
  body = 'My grandpa is seventy years old, but he is still strong and happy. He has short white hair and a kind face. Every morning, he gets up early and does exercise in the park. He walks slowly with a cup of tea in his hand. Grandpa loves stories. In the evening, he tells me about his young days. His stories are always warm and funny. He also plays chess very well, and he often teaches me. Grandpa is patient and wise. He often tells me: a kind heart matters, not money. I learn so much from him. I hope my grandpa stays healthy and happy for many years.',
  questions = '[{"q": "What does grandpa do every morning?", "answer": "C", "options": ["He tells stories.", "He plays chess.", "He does exercise in the park.", "He drinks tea in bed."], "explanation": "''Every morning, he gets up early and does exercise in the park''。"}, {"q": "What matters to grandpa?", "answer": "B", "options": ["A good story.", "A kind heart.", "A game of chess.", "A cup of tea."], "explanation": "''a kind heart matters, not money''。"}, {"q": "What is the passage mainly about?", "answer": "D", "options": ["How to play chess.", "Why tea is warm.", "Where the park is.", "The writer''s kind and wise grandpa."], "explanation": "全文描写爷爷(现在时)。"}]'::jsonb,
  word_count = 108
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U3' AND title='My grandpa';

-- wy7A U3 Sunday with my family [body]
UPDATE public.junior_reading SET
  body = 'Sunday is my favourite day, because I spend it with my family. In the morning, we get up late and have a big breakfast together. My mother makes eggs and bread, and the kitchen smells wonderful. After breakfast, my father and I wash the car. My little brother helps, but he plays with the water and forgets to work! In the afternoon, we often visit my grandparents. Grandma always has sweet fruit for us. In the evening, we watch a film at home. We sit close on the sofa and laugh together. Sunday is not about big things. It is about being close to the people we love. I always want Sunday to go on and on.'
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U3' AND title='Sunday with my family';

-- wy7A U4 Our warm Spring Festival [difficulty]
UPDATE public.junior_reading SET
  difficulty = 0
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U4' AND title='Our warm Spring Festival';

-- wy7A U4 Spring Festival [body+word_count]
UPDATE public.junior_reading SET
  body = 'Spring Festival is a big festival in China. It comes in winter, at the start of the new year. Before the festival, every family cleans the house from top to bottom. People put up red words and bright lanterns on the doors. Red is the colour of luck and joy. On New Year''s Eve, the whole family sits together for a big dinner. There are many nice dishes, and fish is a must, because it means good luck. Children love this time best. They wear new clothes and get red packets with money inside. Everywhere, people smile and say kind words. Spring Festival is a warm time of family, food and hope.',
  word_count = 113
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U4' AND title='Spring Festival';

-- wy7A U4 Festival food [body]
UPDATE public.junior_reading SET
  body = 'At Spring Festival, food is very important. Every family cooks many special dishes. In the north of China, people love dumplings. The whole family makes them together. They put the dumplings into hot water, and soon they are ready to eat. In the south, people eat sweet rice cakes and fish. Every dish has a lucky meaning. Fish means ''more every year'', and dumplings look like old gold money. Sweet food means a sweet life. Grandma always cooks a big meal for the new year. The kitchen is warm and full of good smells. When we eat together, we feel happy and thankful. Festival food is not just tasty; it carries our best wishes.'
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U4' AND title='Festival food';

-- wy7A U5 My little seed [body+difficulty]  (同单元同名,靠原 word_count+difficulty 消歧)
UPDATE public.junior_reading SET
  body = 'Today I put a small seed into the ground. It looks weak now, but it will become something great one day. First, it will need water and sunlight. In a few days, a tiny green leaf is going to appear. The leaf will drink the sunlight and make food for the plant. Slowly, the stem will grow tall and strong. Next spring, my little seed is going to be a young tree. Birds will come and build their nests in it. In summer, it will give us cool shade. Children will play under it on hot days. In autumn, its leaves will turn gold and fall softly to the ground. People will rest under it and tell old stories. The tree will also help the air. It is going to take in bad gas and give out fresh oxygen. Small animals will find food and a home in its branches. Years later, I will be an old man, but my tree will still be here. It will drop new seeds, and more trees are going to grow. One small seed will change a whole hill. Plants are quiet, but they are truly powerful.',
  difficulty = 0
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U5' AND title='My little seed' AND word_count=193 AND difficulty=1;

-- wy7A U5 My little seed [body+word_count]  (同单元同名,靠原 word_count+difficulty 消歧)
UPDATE public.junior_reading SET
  body = 'This spring, I have a little seed, and I want it to grow. First, I put some soft soil in a small pot. Then I make a little hole and put the seed inside. I cover it gently with soil and give it a little water. Every day, I put the pot near the window, so it can get the warm sun. I water it every morning and wait with hope. At first, nothing happens, and I feel worried. But one morning, a tiny green leaf comes out of the soil! I am so happy. Now I know the answer: plants need sun, water, soil and care. Watching a seed grow teaches me to be patient.',
  word_count = 116
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U5' AND title='My little seed' AND word_count=115 AND difficulty=1;

-- wy7A U6 The ants’ secret [body+word_count+difficulty]
UPDATE public.junior_reading SET
  body = 'I am doing a project about ants this week. At first, ants look boring to me. But now I am changing my mind. I am sitting by the garden with my notebook. A line of ants is moving across the path. They are carrying tiny pieces of food. The food is very big, but they are not giving up. Look! One ant is falling into a small hole. Two other ants are helping it. They are working together like good friends. Now it is starting to rain. The ants are running back to their home under the old tree. They are not pushing each other. They are moving in a neat line. Near the wall, some ants are building a new road with tiny stones. One big ant is cleaning its legs in the sun. They are never fighting, and they are never resting. I am reading a book about ants tonight. Ants are talking to each other with smells — that is what the book tells us. Some ants are even growing their own food! I am learning so much. Ants are small, but they are amazing. I am really glad about this project.',
  word_count = 194,
  difficulty = 0
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

-- wy7B U1 The kite my grandpa made [body+difficulty]
UPDATE public.junior_reading SET
  body = 'When I was seven, my family did not have much money. On my birthday, I hoped for a new toy, but my grandpa gave me an old paper kite. He made it himself with bamboo and some old newspaper. At first I felt a little sad, because my friends had bright new toys. That afternoon, Grandpa took me to a green hill near our home. The wind was strong, and the kite flew high into the blue sky. Grandpa held my hand and we ran together, laughing. The kite looked like a little bird above us. Other children stopped to watch us, and some of them wanted to try, too. We stayed on the green hill until the sun went down. "Money can buy toys," Grandpa said, "but it cannot buy this happy time." I looked at his kind smile and suddenly I understood. That old kite was a wonderful gift. Years later, I still remember that day. Happiness was not in the shops; it was in my grandpa''s warm hands.',
  difficulty = 0
WHERE publisher='junior_fltrp' AND volume='wy7B' AND unit='U1' AND title='The kite my grandpa made';

-- wy7B U1 A day at the zoo [body+word_count]
UPDATE public.junior_reading SET
  body = 'Last Sunday, my family went to the zoo. It was a warm and sunny day. First, we saw the pandas. They sat quietly and ate bamboo all morning. Then we watched the monkeys. They jumped from tree to tree and made us laugh. At noon, we had lunch near the lake. My little brother fed the ducks with some bread. In the afternoon, we saw the lions and the big elephants. I took many photos of them. Before we left, I bought a small toy tiger. I was tired but very happy. On the way home, my brother fell asleep in the car. It was a wonderful day in my holiday.',
  word_count = 111
WHERE publisher='junior_fltrp' AND volume='wy7B' AND unit='U1' AND title='A day at the zoo';

-- wy7B U1 My best birthday [body+questions+word_count]
UPDATE public.junior_reading SET
  body = 'Last week was my twelfth birthday, and it was wonderful. In the morning, my mother made a big chocolate cake. My friends came to my house in the afternoon. They brought me many nice presents and colourful cards. We played games in the garden and sang songs together. At six o''clock, we sat around the table. I made a wish and blew out the candles. Everyone laughed and cheered. After dinner, we watched a funny film. My best friend gave me a book about faraway places. We ate cake and told jokes until it was dark. I did not want the day to end. It was a wonderful birthday, and I will always remember it.',
  questions = '[{"q": "What did the writer''s mother make in the morning?", "answer": "D", "options": ["A card.", "A toy.", "A song.", "A big chocolate cake."], "explanation": "''my mother made a big chocolate cake''。"}, {"q": "What did the best friend give the writer?", "answer": "C", "options": ["A cake.", "A card.", "A book about faraway places.", "A film."], "explanation": "''My best friend gave me a book about faraway places''。"}, {"q": "What is the passage mainly about?", "answer": "D", "options": ["How to make a cake.", "Why friends are late.", "Where the garden is.", "The writer''s wonderful birthday."], "explanation": "全文讲最快乐的生日(过去时)。"}]'::jsonb,
  word_count = 116
WHERE publisher='junior_fltrp' AND volume='wy7B' AND unit='U1' AND title='My best birthday';

-- wy7B U1 The lost key [body+word_count]
UPDATE public.junior_reading SET
  body = 'Yesterday, something worried me a lot. When I got home from school, I could not find my key. I looked in my school bag, but it was not there. I looked in every pocket of my coat. I even looked under the desk and behind the door. My heart beat fast. Then I remembered the morning. I ran back to the classroom. On the floor, near my seat, the key was still there! I picked it up and felt happy again. On my way home, I told myself to be careful next time. That day, I learnt an important lesson: a small thing can bring a big worry.',
  word_count = 108
WHERE publisher='junior_fltrp' AND volume='wy7B' AND unit='U1' AND title='The lost key';

-- wy7B U1 A rainy Sunday [body+word_count]
UPDATE public.junior_reading SET
  body = 'Last Sunday, it rained all day, so we stayed at home. At first, I felt a little bored. I looked out of the window and watched the rain. Then my mother had a good idea. We made hot soup together in the kitchen. After lunch, I read a long story about a brave girl. My little brother drew pictures of animals. In the evening, the whole family played cards and laughed a lot. Outside, the rain was still falling, but inside it was warm and happy. A rainy day can be a good day too, if you spend it with the people you love.',
  word_count = 104
WHERE publisher='junior_fltrp' AND volume='wy7B' AND unit='U1' AND title='A rainy Sunday';

-- wy7B U2 The last runner [questions+difficulty]
UPDATE public.junior_reading SET
  questions = '[{"q": "Where did Danny run in the race?", "answer": "A", "options": ["At the back, behind everyone.", "At the very front.", "Beside the teacher.", "Off the track."], "explanation": "原文\"ran at the back\"、\"everyone else was far ahead\"。"}, {"q": "What did the people in the playground do near the end?", "answer": "B", "options": ["They laughed at Danny.", "They cheered for Danny.", "They went home.", "They stopped the race."], "explanation": "原文\"Everyone... began to cheer for him\"。"}, {"q": "What is the best main idea of the passage?", "answer": "C", "options": ["Danny was a fast runner.", "Sports day is boring.", "Never giving up is the real success.", "Running is bad for your legs."], "explanation": "结尾点题:坚持完成比第一更重要。"}, {"q": "Why did everyone start to cheer for Danny?", "answer": "D", "options": ["Because he was winning.", "Because he was funny.", "Because the race was over.", "Because they were moved by his refusal to give up."], "explanation": "他不放弃感动了大家;文中未直说,靠推断。"}, {"q": "\"He never gave up\" — \"gave up\" means ____.", "answer": "A", "options": ["stopped trying", "kept running", "fell down", "won the race"], "explanation": "由\"wanted to stop... did not stop\"可推断 give up=放弃、停止努力。"}]'::jsonb,
  difficulty = 0
WHERE publisher='junior_fltrp' AND volume='wy7B' AND unit='U2' AND title='The last runner';

-- wy7B U2 Is anyone there? [body+word_count]
UPDATE public.junior_reading SET
  body = 'One evening, I was alone at home. Everyone in my family was out. Suddenly, I heard something in the kitchen. ''Is anyone there?'' I called, but nobody answered. My heart beat fast. I did not see anything strange, but the sound came again. I took a torch and looked around carefully. There was nothing behind the door and nothing under the table. Then I saw something small and grey. It was only our cat, playing with a bottle! I laughed at myself. Everything was fine after all. Sometimes we are afraid of nothing, and there is always someone or something simple behind a strange sound.',
  word_count = 105
WHERE publisher='junior_fltrp' AND volume='wy7B' AND unit='U2' AND title='Is anyone there?';

-- wy7B U2 Something in my bag [body+word_count]
UPDATE public.junior_reading SET
  body = 'This morning, something in my school bag felt heavy. I opened it, but at first I could not find anything strange. Everything looked the same: my books, my pens and my lunch. Then I felt something hard at the bottom. It was a small box. Nobody told me about it. I opened the box carefully. Inside, there was a beautiful watch and a little note. The note said, ''Happy birthday from someone who loves you.'' It was from my mother! I forgot my own birthday, but my mother did not. Everyone in my family knew the secret except me. It was a lovely surprise, and I will keep the note for ever.',
  word_count = 112
WHERE publisher='junior_fltrp' AND volume='wy7B' AND unit='U2' AND title='Something in my bag';

-- wy7B U2 Looking for something to do [questions]
UPDATE public.junior_reading SET
  questions = '[{"q": "What did the writer''s father tell him to do?", "answer": "A", "options": ["Find something he loves.", "Watch television.", "Clean the house.", "Sleep more."], "explanation": "''Find something you love, he said''。"}, {"q": "What did the writer paint?", "answer": "B", "options": ["Only the cat.", "The tree, the sky and the cat.", "Only the sky.", "A house."], "explanation": "''painted everything I could see: the tree, the sky and our cat''。"}, {"q": "What is the passage mainly about?", "answer": "D", "options": ["How to paint a cat.", "Why holidays are short.", "Where the paint box was.", "How the writer found something fun to do on a boring day."], "explanation": "全文讲无聊时找到爱做的事(不定代词)。"}]'::jsonb
WHERE publisher='junior_fltrp' AND volume='wy7B' AND unit='U2' AND title='Looking for something to do';

-- wy7B U3 Grandma’s noodles [body+questions+difficulty]
UPDATE public.junior_reading SET
  body = 'Every winter, my grandma made hot noodles for the whole family. As soon as I opened the door, the kitchen smelled wonderful, and I felt warm at once. The noodles looked simple — just noodles, an egg and some green onions in a big bowl. But they tasted rich and warm. Grandma always said, "Good food does not need to be expensive." While we ate, the room grew warm and everyone became happy. My little brother''s face turned red from the hot soup, and we all laughed. Grandma watched us eat and her smile looked so kind. Sometimes she put a little sugar in my bowl, because I liked sweet things. On cold nights, one warm bowl could make my whole body feel happy. Now Grandma is old and cannot cook much, but that taste stays in my heart. When life feels hard, I think of her noodles. They were more than food; they were her love in a bowl. A meal made by someone who loves you always tastes sweet.',
  questions = '[{"q": "What was in Grandma''s bowl of noodles?", "answer": "A", "options": ["Noodles, an egg and some green onions.", "Rice, beef and tofu.", "Bread and milk.", "Fish and potatoes."], "explanation": "原文\"just noodles, an egg and some green onions\"。"}, {"q": "Why did the little brother''s face turn red?", "answer": "B", "options": ["He was angry.", "From the hot soup.", "He ran too fast.", "He felt shy."], "explanation": "原文\"turned red from the hot soup\"。"}, {"q": "What is the main idea of the passage?", "answer": "C", "options": ["Noodles are cheap.", "Grandma is a famous cook.", "Simple food made with love is precious.", "Winter is the best season."], "explanation": "结尾点题:充满爱的简单食物最珍贵。"}, {"q": "Why does that taste stay in the writer''s heart?", "answer": "D", "options": ["Because the noodles were expensive.", "Because the writer is always hungry.", "Because Grandma taught cooking classes.", "Because the noodles carry Grandma''s love."], "explanation": "\"they were her love in a bowl\",靠推断。"}, {"q": "\"The kitchen smelled wonderful\" — here \"smelled\" is a ____.", "answer": "A", "options": ["linking verb followed by an adjective", "past tense of \"smile\"", "kind of food", "noun"], "explanation": "smell 作系动词后接形容词,是感官系动词。"}]'::jsonb,
  difficulty = 0
WHERE publisher='junior_fltrp' AND volume='wy7B' AND unit='U3' AND title='Grandma''s noodles';

-- wy7B U3 Grandma’s kitchen [body+questions]
UPDATE public.junior_reading SET
  body = 'I love my grandma''s kitchen very much. In the morning, it smells wonderful. The fresh bread smells sweet, and the hot soup smells rich. Everything looks warm and golden in the soft light. When I taste grandma''s noodles, they taste rich and fresh. The tea tastes sweet, and the cakes taste soft. Even the air feels gentle and kind. When grandma sings an old song, her voice sounds happy and calm. In her kitchen, I never feel sad or tired. Everything there feels like home. A good kitchen is not just about food; it makes a family feel close and warm.',
  questions = '[{"q": "How do grandma''s noodles taste?", "answer": "C", "options": ["Bad.", "Cold.", "Rich and fresh.", "Salty."], "explanation": "''they taste rich and fresh''。"}, {"q": "How does grandma''s voice sound when she sings?", "answer": "B", "options": ["Loud and hard.", "Happy and calm.", "Sad and tired.", "Weak and low."], "explanation": "''her voice sounds happy and calm''。"}, {"q": "What is the passage mainly about?", "answer": "A", "options": ["Why the writer loves grandma''s warm kitchen.", "How to make noodles.", "Why restaurants are dear.", "Where grandma lives."], "explanation": "全文讲奶奶厨房的温暖(系动词)。"}]'::jsonb
WHERE publisher='junior_fltrp' AND volume='wy7B' AND unit='U3' AND title='Grandma''s kitchen';

-- wy7B U3 The music sounds nice [body+word_count]
UPDATE public.junior_reading SET
  body = 'Last night, I went to a school concert, and the music sounded wonderful. When the first song began, the room grew quiet. The soft piano sounded gentle, like rain on a window. Then the guitars grew loud and strong, and everyone felt excited. One singer had a voice that sounded sweet and clear. The music made me feel happy and calm at the same time. During a sad song, some people looked touched, and the hall felt very still. At the end, everybody clapped, and the players looked proud. Good music does something special: it makes a room full of strangers feel like friends.',
  word_count = 104
WHERE publisher='junior_fltrp' AND volume='wy7B' AND unit='U3' AND title='The music sounds nice';

-- wy7B U3 Autumn feels cool [body+word_count]
UPDATE public.junior_reading SET
  body = 'Autumn is my favourite season, because everything feels fresh and cool. In the morning, the air feels crisp, and the wind smells clean. The leaves on the trees turn yellow, red and gold. They look like little fires in the sun. When I walk to school, the ground feels soft with fallen leaves. The fruit in the market tastes sweet, and hot tea tastes warm and good. The sky looks high and blue, and the clouds seem far away. In autumn, even a simple walk feels like a small holiday. The evenings grow dark early, and the birds fly south. I never feel bored, because the world around me looks new every single day.',
  word_count = 114
WHERE publisher='junior_fltrp' AND volume='wy7B' AND unit='U3' AND title='Autumn feels cool';

-- wy7B U3 The soup tastes great [body+questions+word_count]
UPDATE public.junior_reading SET
  body = 'Today my father cooked dinner, and the soup tasted great. First, he cut some vegetables and an onion. Soon the kitchen smelled wonderful. ''This soup smells so good!'' I said. When it was ready, the soup looked golden and warm. I had a spoonful, and it tasted rich and warm. It was not too salty and not too sweet. ''It tastes just like grandma''s soup!'' my little sister said. My father looked very happy. The whole family felt warm and full after dinner. A simple meal, made with love, can taste wonderful. That evening, everything at our table felt just right.',
  questions = '[{"q": "What did the father cut for the soup?", "answer": "A", "options": ["Some vegetables and an onion.", "Fruit and rice.", "Eggs and bread.", "Meat and sugar."], "explanation": "''he cut some vegetables and an onion''。"}, {"q": "What did the little sister say the soup tasted like?", "answer": "C", "options": ["A restaurant meal.", "Something salty.", "Grandma''s soup.", "Nothing at all."], "explanation": "''It tastes just like grandma''s soup!''。"}, {"q": "What is the passage mainly about?", "answer": "B", "options": ["How to cut an onion.", "A simple, tasty soup that made the family happy.", "Why restaurants are dear.", "Where the kitchen is."], "explanation": "全文讲爸爸做的美味汤(系动词)。"}]'::jsonb,
  word_count = 102
WHERE publisher='junior_fltrp' AND volume='wy7B' AND unit='U3' AND title='The soup tastes great';

-- wy7B U4 Study, but play too [body+questions+difficulty]
UPDATE public.junior_reading SET
  body = 'Last term, my friend Ben studied all the time. Every day after school, he did his homework until late at night. He never played sports and seldom saw his friends. "I must work hard," he always said. But soon Ben looked tired and unhappy, and his marks did not go up. One day our teacher gave him some good advice. "Ben," she said, "work hard, but don''t forget to rest. Play some sport. Meet your friends. A tired mind cannot learn well." Ben decided to try. He began to play basketball twice a week. On weekends, he went out with his friends. At first he worried about losing study time, but something surprising happened. He felt happy, and his mind became clear and quick. His marks even went up. He slept well at night and woke up happy. He also made new friends when he played, and school did not feel boring any more. Now Ben knows the secret: don''t just study all day. Take a break, have some fun, and then go back to your books. Work and play are like two legs — you need both to walk well.',
  questions = '[{"q": "What did Ben do every day after school at first?", "answer": "A", "options": ["Homework until late at night.", "Played basketball.", "Went out with friends.", "Watched TV."], "explanation": "原文\"did his homework until late at night\"。"}, {"q": "How often did Ben play basketball after taking the advice?", "answer": "B", "options": ["Every day.", "Twice a week.", "Once a month.", "Never."], "explanation": "原文\"play basketball twice a week\"。"}, {"q": "What is the best main idea of the passage?", "answer": "C", "options": ["Homework is not important.", "Basketball is the best sport.", "Balancing work and play helps you do well.", "Teachers give too much advice."], "explanation": "结尾点题:劳逸结合,学得好也玩得好。"}, {"q": "Why did Ben''s marks go up after he started to play?", "answer": "D", "options": ["Because he stopped studying.", "Because the tests were not hard.", "Because his teacher helped him cheat.", "Because rest made his mind clear and he learned well."], "explanation": "\"his mind became clear and quick\"→学得好;靠推断。"}, {"q": "\"Take a break\" means ____.", "answer": "A", "options": ["stop working for a short rest", "break something", "run away", "study all night"], "explanation": "由上下文\"have some fun, and then go back\"可推断 take a break=短暂休息。"}]'::jsonb,
  difficulty = 0
WHERE publisher='junior_fltrp' AND volume='wy7B' AND unit='U4' AND title='Study, but play too';

-- wy7B U4 How to be a good friend [body+questions+word_count]
UPDATE public.junior_reading SET
  body = 'A good friend is a treasure, so learn to be one. Be kind, and always speak in a gentle way. Listen carefully when your friend talks, and don''t laugh at their mistakes. When your friend is sad, stay close and help. Share your things, and share your time too. Don''t tell your friend''s secrets to anyone. If you quarrel, say sorry first; don''t let a small thing break a good friendship. Remember birthdays, and give a warm smile every day. Be honest, but be kind with the truth. Follow these simple rules, and you will keep your friends for many years. A true friend is like gold.',
  questions = '[{"q": "What should you do when your friend is sad?", "answer": "B", "options": ["Laugh at them.", "Stay close and help.", "Leave them alone.", "Tell others."], "explanation": "''When your friend is sad, stay close and help''。"}, {"q": "What should you do first if you quarrel?", "answer": "A", "options": ["Say sorry first.", "Walk away.", "Shout at him.", "Tell a secret."], "explanation": "''If you quarrel, say sorry first''。"}, {"q": "What is the passage mainly about?", "answer": "C", "options": ["How to find gold.", "Why friends quarrel.", "Simple rules for being a good friend.", "Where friends meet."], "explanation": "全文讲怎样做好朋友(祈使句)。"}]'::jsonb,
  word_count = 111
WHERE publisher='junior_fltrp' AND volume='wy7B' AND unit='U4' AND title='How to be a good friend';

-- wy7B U4 How to plant a flower [body]
UPDATE public.junior_reading SET
  body = 'Would you like to grow a beautiful flower? It is easy if you follow these steps. First, find a clean pot and fill it with soft soil. Next, make a small hole in the middle with your finger. Put one seed in the hole, and cover it gently with soil. Then give it a little water, but don''t give it too much. Put the pot near a window, so it can get plenty of sun. Water the seed every day, and wait with patience. Don''t pull the plant to make it grow quickly. In a few weeks, a green leaf will come out. Care for it well, and soon your flower will bloom.'
WHERE publisher='junior_fltrp' AND volume='wy7B' AND unit='U4' AND title='How to plant a flower';

-- wy7B U5 The colours of my village [body+questions+word_count+difficulty]
UPDATE public.junior_reading SET
  body = 'My village is a small place among green hills, and it is the most beautiful place I know. In spring, the hills turn greener than in any other season, and wild flowers open everywhere. The air smells fresh, and the small river runs clearer than glass. Summer is the busiest time. The trees grow taller and thicker, and the fields become a sea of green. It is hotter than spring, but the tall trees give us cool shade. Autumn is my favourite. The leaves turn from green to gold, and the hills look like a big painting. The apples on the trees are the sweetest of the year, and the sky seems higher and bluer. People come to pick the sweet apples, and the whole hill smells fresh and clean. Winter is the quietest season. White snow covers the hills, and the world looks cleaner and brighter than ever. Children run out to play in the snow, and their happy voices fill the cold air. Some people think big cities are more exciting than a small village. But to me, my home among the hills is truly lovely. Each season paints my village a different colour, and I love them all.',
  questions = '[{"q": "When do the hills turn greenest?", "answer": "A", "options": ["In spring.", "In summer.", "In autumn.", "In winter."], "explanation": "原文\"In spring, the hills turn greener than in any other season\"。"}, {"q": "What is the writer''s favourite season?", "answer": "B", "options": ["Spring.", "Autumn.", "Summer.", "Winter."], "explanation": "原文\"Autumn is my favourite\"。"}, {"q": "What is the main idea of the passage?", "answer": "C", "options": ["Cities are better than villages.", "Winter is too cold.", "The writer loves the changing beauty of the home village.", "Apples grow best in autumn."], "explanation": "全文写家乡四季之美,结尾点题热爱家乡。"}, {"q": "Why does the writer prefer the village to a big city?", "answer": "D", "options": ["Because the village has more shops.", "Because cities are dangerous.", "Because the village is bigger.", "Because to the writer home is truly lovely."], "explanation": "\"my home among the hills is truly lovely\",靠推断。"}, {"q": "\"The river runs clearer than glass\" shows the water is very ____.", "answer": "A", "options": ["clean and clear", "dirty", "deep", "cold"], "explanation": "clearer than glass=像玻璃一样清澈,说明水很干净。"}]'::jsonb,
  word_count = 201,
  difficulty = 0
WHERE publisher='junior_fltrp' AND volume='wy7B' AND unit='U5' AND title='The colours of my village';

-- wy7B U6 A trip to the mountains and the sea [body+word_count+difficulty]
UPDATE public.junior_reading SET
  body = 'Last summer, my family took a long trip. In the first week, we went to the mountains in the west. The air up there was as cool as autumn, even in July. Climbing was not as easy as I thought, and by evening my legs were as heavy as stone. But the view from the top was as beautiful as a painting, and I forgot all my tired feelings. In the second week, we drove to the sea in the east. The beach was as bright as gold under the sun, and the water felt as warm as a bath. My little sister was as happy as a bird; she played in the sand all day. We made a small house of sand together, and the sea slowly took it away, but we only laughed. The sea was not as quiet as the mountains, but it was just as lovely. At night, the stars over the sea looked as many as the lights of a big city. The mountains and the sea were very different, yet each was as wonderful as the other. That trip taught me something: the world is as wide as your dreams, so go and see it.',
  word_count = 200,
  difficulty = 0
WHERE publisher='junior_fltrp' AND volume='wy7B' AND unit='U6' AND title='A trip to the mountains and the sea';

-- wy7B U6 The twins [body+word_count]
UPDATE public.junior_reading SET
  body = 'My neighbours have twin boys, Tom and Sam. They look almost the same, but they are not as alike as people think. Tom is as tall as Sam, and they are exactly as old as each other. In class, Tom is as clever as Sam, and both study just as hard. But on the sports field, Tom cannot run as fast as Sam. Sam, on the other hand, does not draw as well as Tom. When they play music, Tom sings as sweetly as a bird, while Sam plays the guitar just as beautifully. They are as close as two brothers can be. No two people are ever exactly as alike as twins, and yet even twins are never the same.',
  word_count = 121
WHERE publisher='junior_fltrp' AND volume='wy7B' AND unit='U6' AND title='The twins';

-- wy8A U1 The books that have changed me [difficulty]
UPDATE public.junior_reading SET
  difficulty = 0
WHERE publisher='junior_fltrp' AND volume='wy8A' AND unit='U1' AND title='The books that have changed me';

-- wy8A U1 My first time on a train [body+questions+word_count]
UPDATE public.junior_reading SET
  body = 'I have travelled by bus and by car many times, but I have never taken a long train ride until now. My family and I have just come back from a trip to the mountains, and I have so much to tell. I have never felt so excited as when the train began to move. Outside the window, green fields and small towns rushed by. I have seen many pictures of the countryside, but they have never looked so alive. During the ride, I have made a new friend, a boy of my own age. We have shared sweets and jokes for hours. The trip has ended, but the happy feeling has stayed with me. I have already asked my parents to plan another train trip soon.',
  questions = '[{"q": "Where has the writer''s family just come back from?", "answer": "D", "options": ["The sea.", "A big city.", "A farm.", "The mountains."], "explanation": "''My family and I have just come back from a trip to the mountains''。"}, {"q": "What did the writer do with the new friend during the ride?", "answer": "C", "options": ["Slept all the way.", "Read books alone.", "Shared sweets and jokes.", "Played on a phone."], "explanation": "''We have shared sweets and jokes for hours''。"}, {"q": "What is the passage mainly about?", "answer": "D", "options": ["How to buy a train ticket.", "Why buses are slow.", "Where the mountains are.", "The writer''s exciting first long train ride."], "explanation": "全文讲第一次长途火车之旅的兴奋(完成时)。"}]'::jsonb,
  word_count = 127
WHERE publisher='junior_fltrp' AND volume='wy8A' AND unit='U1' AND title='My first time on a train';

-- wy8A U2 The old man and the bench [difficulty]
UPDATE public.junior_reading SET
  difficulty = 0
WHERE publisher='junior_fltrp' AND volume='wy8A' AND unit='U2' AND title='The old man and the bench';

-- wy8A U2 How our town has changed [body+questions+word_count]
UPDATE public.junior_reading SET
  body = 'Our small town has changed a lot in the last few years. When I was young, there was only one narrow road and a few old shops. Now the town has grown into a busy little place. A new park has been here since 2019, and children have come to play in it every day. The old wooden bridge has gone, and a strong new one has stood by the river for three years. My cousin has gone to the city for work, but my uncle has been to many places and still calls this town home. Some things, happily, have not changed. The tall old tree in the square still stands, and the morning market has kept its friendly voices for fifty years. I have grown up with it.',
  questions = '[{"q": "How long has the new park been in the town?", "answer": "A", "options": ["Since 2019.", "Since last month.", "For fifty years.", "Since the writer was born."], "explanation": "''A new park has been here since 2019'';C 项 fifty years 是集市的年头,不是公园的。"}, {"q": "What has NOT changed in the town?", "answer": "D", "options": ["The old road.", "The wooden bridge.", "The small shops.", "The tall old tree in the square."], "explanation": "''The tall old tree in the square still stands''。"}, {"q": "What is the passage mainly about?", "answer": "A", "options": ["How the writer''s town has changed over the years.", "How to build a bridge.", "Why parks are important.", "Where the market is."], "explanation": "全文讲小镇多年的变化(完成时)。"}]'::jsonb,
  word_count = 129
WHERE publisher='junior_fltrp' AND volume='wy8A' AND unit='U2' AND title='How our town has changed';

-- wy8A U2 I have grown taller [body+word_count]
UPDATE public.junior_reading SET
  body = 'Something wonderful has happened: I have grown five centimetres in the last two years! Last summer, I could not reach the top shelf, but now I can take a book down with ease. My mother has measured me against the door, and the new mark is far above the old one. ''How long have you played basketball?'' she asked me last week. ''I have played it since I was eleven,'' I said. My shoes have become too small, and my trousers have grown too short. But growing up is more than growing tall. I have become stronger too, because I have played sport every week for two years. I have also grown braver: I have learnt to speak up in class. My grandmother has watched me change from a shy boy into a young man.',
  word_count = 135
WHERE publisher='junior_fltrp' AND volume='wy8A' AND unit='U2' AND title='I have grown taller';

-- wy8A U2 The river has come back to life [body+word_count]
UPDATE public.junior_reading SET
  body = 'The small river behind our school has come back to life, and everyone is happy. A few years ago, it was full of rubbish, and no fish lived in it. The water turned dark, and it had a bad smell. Then our school started a clean-up club, and many students have joined it. We have picked up plastic bottles and old bags from the water. We have planted young trees along the bank. Slowly, the river has become clean again. This spring, small fish have returned, and birds have come to drink and sing. Even the air near the river has grown fresh. Our teacher has told us about the power of nature: it can heal itself, if only people give it a chance. Small hands can make a big change. We have all learnt this.',
  word_count = 137
WHERE publisher='junior_fltrp' AND volume='wy8A' AND unit='U2' AND title='The river has come back to life';

-- wy8A U3 The boy who loved to invent [difficulty]
UPDATE public.junior_reading SET
  difficulty = 0
WHERE publisher='junior_fltrp' AND volume='wy8A' AND unit='U3' AND title='The boy who loved to invent';

-- wy8A U3 What I like to do after school [body]
UPDATE public.junior_reading SET
  body = 'After a long day at school, I love to relax in my own way. I enjoy reading in the quiet corner of my room - no one can trouble me there. I also like to draw, and I have decided to keep a small notebook for my pictures. On sunny days, I prefer to play outside. My friends and I enjoy playing football in the yard until it gets dark. Some of my classmates like to watch films, but I would rather do something with my hands. My mother wants me to rest too, so I have promised to sleep early. Free time is a gift, and I have learnt to use it well. Choosing to do what you love makes every day brighter.'
WHERE publisher='junior_fltrp' AND volume='wy8A' AND unit='U3' AND title='What I like to do after school';

-- wy8A U3 Learning to cook [body+word_count]
UPDATE public.junior_reading SET
  body = 'This summer, I have decided to learn to cook. At first, I did not enjoy standing in the hot kitchen, and I wanted to give up. But my grandmother kept teaching me with a smile. She showed me how to wash rice and how to cut vegetables. Slowly, I have started to enjoy making simple dishes. I love watching a plain egg turn into a golden, tasty meal. Last week, I finished cooking a whole dinner by myself, and my family enjoyed eating every bit of it. Now I practise cooking every weekend. Cooking needs both care and patience. I have learnt this in the kitchen. Choosing to learn a new skill can be hard at the start, but it brings a joy that is worth all the effort.',
  word_count = 129
WHERE publisher='junior_fltrp' AND volume='wy8A' AND unit='U3' AND title='Learning to cook';

-- wy8A U4 Great-grandmother’s diary [difficulty]
UPDATE public.junior_reading SET
  difficulty = 0
WHERE publisher='junior_fltrp' AND volume='wy8A' AND unit='U4' AND title='Great-grandmother''s diary';

-- wy8A U4 What my mother wants me to do [questions]
UPDATE public.junior_reading SET
  questions = '[{"q": "Why does the mother ask the writer to get up early?", "answer": "C", "options": ["To watch films.", "To play games.", "Because the morning is the best time to learn.", "To clean the street."], "explanation": "''she calls the morning the best time to learn''。"}, {"q": "What does the mother do when the writer feels lazy?", "answer": "D", "options": ["She shouts at him.", "She does his homework.", "She sends him to bed.", "She encourages him to try his best."], "explanation": "''she encourages me to try my best and never to give up''。"}, {"q": "What is the passage mainly about?", "answer": "A", "options": ["How the writer''s mother guides him to grow well.", "How to wash dishes.", "Why mornings are cold.", "Where the writer studies."], "explanation": "全文讲母亲的引导(不定式作宾补)。"}]'::jsonb
WHERE publisher='junior_fltrp' AND volume='wy8A' AND unit='U4' AND title='What my mother wants me to do';

-- wy8A U4 A good coach [body+word_count]
UPDATE public.junior_reading SET
  body = 'Our football coach, Mr Li, is strict but kind, and he wants every player to do his best. Before each game, he tells us to warm up carefully, so that we all stay safe. During practice, he asks us to pass the ball quickly and to help each other. When we lose, he never allows us to blame our friends. Instead, he encourages us to learn from our mistakes. Mr Li often makes us run ten circles before practice, and he never lets us leave until we put the balls away. He often reminds us to shake hands with the other team after a match. Thanks to him, we have become better players and better friends. A good coach does more than teach us to win; he teaches us to grow into good people.',
  word_count = 134
WHERE publisher='junior_fltrp' AND volume='wy8A' AND unit='U4' AND title='A good coach';

-- wy8A U4 Helping my little brother [body+word_count]
UPDATE public.junior_reading SET
  body = 'My little brother is only six, and I want him to grow up happy and kind. Every evening, I ask him to put away his toys before bed, and I teach him to say ''please'' and ''thank you''. Sometimes he does not want to listen, but I never force him. Instead, I try to make learning fun. I want him to enjoy reading, so we look at picture books together. When he does something well, I tell him to feel proud of himself. When he makes a mistake, I ask him to try again with a smile. I sometimes let him choose the book, and that makes him want to read more. Helping a younger child has taught me to be patient. To teach is also to learn - I know this now.',
  word_count = 132
WHERE publisher='junior_fltrp' AND volume='wy8A' AND unit='U4' AND title='Helping my little brother';

-- wy8A U5 Small rules, big reasons [questions+difficulty]
UPDATE public.junior_reading SET
  questions = '[{"q": "Why do we put on a seat belt in a car?", "answer": "A", "options": ["To protect ourselves if the car stops suddenly.", "To make the car go faster.", "To keep the car clean.", "To follow the driver''s order."], "explanation": "''We put on a seat belt to protect ourselves if the car stops suddenly''。"}, {"q": "According to the passage, why do we speak softly in a library?", "answer": "C", "options": ["To save our own time.", "To make the room warm.", "To let others read in peace.", "To keep the books clean."], "explanation": "''We speak softly in a library to let others read in peace''。"}, {"q": "What is the main idea of the passage?", "answer": "B", "options": ["Rules make our lives hard and boring.", "Every rule exists for a good reason.", "Only drivers need to follow rules.", "Honesty is the only rule that matters."], "explanation": "全文说明每条小规则背后都有好理由——保护、分享、关爱。"}, {"q": "Which idea would the writer probably agree with?", "answer": "A", "options": ["following rules helps everyone live better together", "rules take away all our freedom", "only children need good manners", "breaking rules brings great rewards"], "explanation": "全文肯定规则的意义,可推断作者认为守规则使大家更好地共同生活。"}, {"q": "In the passage, the word ''honesty'' is closest in meaning to ____.", "answer": "A", "options": ["telling the truth and keeping trust", "working very fast", "saving a lot of money", "staying quiet in public"], "explanation": "由''tell the truth'',''keep trust''可推断honesty=诚实。"}]'::jsonb,
  difficulty = 0
WHERE publisher='junior_fltrp' AND volume='wy8A' AND unit='U5' AND title='Small rules, big reasons';

-- wy8A U6 The night of the flood [difficulty]
UPDATE public.junior_reading SET
  difficulty = 0
WHERE publisher='junior_fltrp' AND volume='wy8A' AND unit='U6' AND title='The night of the flood';

-- wy8A U6 The day the lights went out [body+word_count]
UPDATE public.junior_reading SET
  body = 'One evening last winter, our whole street lost its power. We were having dinner when the lights suddenly went out. At first, my little brother was afraid, but my father lit some candles, and the room grew warm and golden. We could not watch television or use our phones, so we did something we did not often do. My mother was telling old stories from her childhood, and we were all listening quietly. My brother was drawing shadows on the wall with his hands. Outside, the stars were shining more brightly than ever. For two hours, while the power was off, our family talked and laughed together. When the lights came back, we almost felt sorry. That dark evening gave us something bright: time together, without any screens.',
  word_count = 128
WHERE publisher='junior_fltrp' AND volume='wy8A' AND unit='U6' AND title='The day the lights went out';

-- wy8B U1 So much is done for you [difficulty]
UPDATE public.junior_reading SET
  difficulty = 0
WHERE publisher='junior_fltrp' AND volume='wy8B' AND unit='U1' AND title='So much is done for you';

-- wy8B U1 Homes of the future [body+word_count]
UPDATE public.junior_reading SET
  body = 'In the future, our homes will be run in cleaner ways. Today, much power is made by burning coal, and the air is often dirty. But soon, sunlight and wind will be used to make most of our power. Solar panels will be put on every roof, and the light of the sun will be turned into power. On windy days, energy will be made by tall wind turbines. Extra power will be kept in batteries, so that it can be used on dark nights. Less coal will be burned, and cleaner air will be shared by all. Our homes will be kept warm and bright, and the planet will be protected at the same time. A greener life will be built by us, step by step.',
  word_count = 127
WHERE publisher='junior_fltrp' AND volume='wy8B' AND unit='U1' AND title='Homes of the future';

-- wy8B U2 The library that was saved [body+word_count+difficulty]
UPDATE public.junior_reading SET
  body = 'Years ago, a small library stood at the corner of our street. It was built long ago by the people of the town. Its walls were made of grey stone, and its doors were painted a warm red. As a child, I was often taken there by my grandmother.

One winter, everyone heard sad news: the old library would close. A new shopping centre was planned for that corner, and the little library was no longer needed. Many books were packed into boxes, and the reading room was left cold and empty. The children who read there were sad, and the old librarian was often seen standing quietly at the locked door.

But the people of the town were not happy. A meeting was held, and hundreds of letters were written to the government. Photos of the library were shared online, and its story was told again and again. Slowly, the whole town was moved by these voices.

In the end, the plan was changed. The library was saved, and money was raised to repair it. The old stone walls were cleaned, and new lights were put in. On the day it opened again, the streets were filled with happy people. Music was played, and fresh flowers were placed on every window.

That library was not just a building. It was loved by everyone, and it was kept alive by the people who cared.',
  word_count = 234,
  difficulty = 0
WHERE publisher='junior_fltrp' AND volume='wy8B' AND unit='U2' AND title='The library that was saved';

-- wy8B U3 Reaching the top together [body+word_count+difficulty]
UPDATE public.junior_reading SET
  body = 'Climbing a high mountain is never easy, and no one can do it alone. Last summer, our team of six set out to reach the top of a tall, snowy mountain. Before we started, our leader told us the rules. ''On this mountain, we must stay together,'' he said. ''You must never walk alone, and you have to follow the rope at all times.''

The first days were hard. The air was thin, and we could not walk fast. Some of us felt weak and wanted to give up. But a team can do more than one person can. When someone was tired, another would carry his bag. When the path was steep, we pulled each other up with the rope.

High on the mountain, the weather can change in minutes. One afternoon, dark clouds came, and our leader shouted, ''We have to stop! It might snow tonight. We must build our tents now.'' We could do nothing but wait. All night the cold wind blew. Nobody could sleep well, and our food was almost gone. Still, no one wanted to turn back; giving up was simply not a choice for our team.

The next morning was clear. Step by step, we climbed the last part. At noon, we reached the top at last. From up there, we could see for miles. We learnt an important lesson: alone you may be strong, but together you can be far stronger.',
  word_count = 239,
  difficulty = 0
WHERE publisher='junior_fltrp' AND volume='wy8B' AND unit='U3' AND title='Reaching the top together';

-- wy8B U4 The light in the old house [body+questions+word_count+difficulty]
UPDATE public.junior_reading SET
  body = 'For years, the old house at the end of our village stood empty. No one lived there, and its windows were always dark. So one autumn night, when a light appeared in an upstairs room, the whole village began to wonder.

''Someone must be inside,'' said old Mr Chen. ''A light can''t turn itself on.''

''But it can''t be a thief,'' said my mother. ''A thief would keep the house dark, not bright.''

''It may be a traveller,'' said my father. ''Or it might be some children playing a game.''

For three nights the light came and went. Some people were a little afraid; others were only curious. ''The person can''t be dangerous,'' I said to myself. ''Nothing was stolen, and no one was hurt.''

At last, a few of us walked up to the house. The door was open. Inside, by the warm light of a small lamp, sat an old man. He was thin and tired, and his clothes were worn. ''I used to live here as a boy,'' he said softly. ''I had nowhere else to go.''

The village was quiet for a moment. Then my mother spoke. ''You shouldn''t be alone on a cold night. You should come and stay with us.'' And so he did. Sometimes the answer to a mystery is much kinder than we fear. From that night on, the old man was never alone again. Warm meals were brought to his door, and the empty house slowly became a real home.',
  questions = '[{"q": "Why did old Mr Chen think someone was inside?", "answer": "B", "options": ["Because he saw the old man.", "Because a light can''t turn itself on.", "Because a thief was caught.", "Because children were playing."], "explanation": "''A light can''t turn itself on''→一定有人。"}, {"q": "Who was really in the old house?", "answer": "C", "options": ["A dangerous thief.", "A young traveller.", "An old man who used to live there.", "Some children playing a game."], "explanation": "''sat an old man ... I used to live here as a boy''。"}, {"q": "What is the main idea of the passage?", "answer": "D", "options": ["Old houses are dangerous places.", "Thieves often hide in empty houses.", "Children should not play at night.", "A village''s fear turned into kindness."], "explanation": "全文由猜疑转为对孤老的善意。"}, {"q": "We can infer that the villagers were ____ at the end.", "answer": "A", "options": ["kind and ready to help the old man", "angry with the old man", "still afraid of the light", "sorry they came"], "explanation": "母亲请他同住可推断村民善良。"}, {"q": "When the writer says the person ''can''t be dangerous'', he means it is ____.", "answer": "A", "options": ["impossible that the person is dangerous", "certain that the person is a thief", "possible that something was stolen", "clear that someone was hurt"], "explanation": "can''t be=不可能是,表否定推测。"}]'::jsonb,
  word_count = 253,
  difficulty = 0
WHERE publisher='junior_fltrp' AND volume='wy8B' AND unit='U4' AND title='The light in the old house';

-- wy8B U4 The lost dog [body+word_count]
UPDATE public.junior_reading SET
  body = 'On my way home, I found a small brown dog sitting alone near the park gate. ''You must be far from home,'' I said softly. The dog had a collar, so it might belong to someone close by. ''Your owner could be looking for you right now,'' I thought. I could not leave it there, so I took it home. My mother said, ''It can''t be a wild dog; it is too clean and friendly.'' The next day, we put up a poster near the park. Soon a girl called us. ''That must be my dog!'' she cried. When she came, the dog ran to her at once, and its tail wagged with joy. It was clear that they belonged together. A little care brought them home.',
  word_count = 128
WHERE publisher='junior_fltrp' AND volume='wy8B' AND unit='U4' AND title='The lost dog';

-- wy8B U5 The secrets inside amber [difficulty]
UPDATE public.junior_reading SET
  difficulty = 0
WHERE publisher='junior_fltrp' AND volume='wy8B' AND unit='U5' AND title='The secrets inside amber';

-- wy8B U6 The painter of the seasons [difficulty]
UPDATE public.junior_reading SET
  difficulty = 0
WHERE publisher='junior_fltrp' AND volume='wy8B' AND unit='U6' AND title='The painter of the seasons';

-- ── 断言 ──
DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM public.junior_reading WHERE publisher='junior_fltrp'
    AND volume IN ('wy7A','wy7B','wy8A')
    AND body ~ '\y(learnt|learned|know|knew|told us|tells us|say|says) that\y';
  IF n<>0 THEN RAISE EXCEPTION '宾语从句仍有 % 篇', n; END IF;
  SELECT count(*) INTO n FROM public.junior_reading WHERE publisher='junior_fltrp'
    AND volume IN ('wy7A','wy7B','wy8A') AND body ~ ', (where|which|whom) ';
  IF n<>0 THEN RAISE EXCEPTION '非限制性定语从句仍有 % 篇', n; END IF;
  SELECT count(*) INTO n FROM public.junior_reading WHERE publisher='junior_fltrp'
    AND volume LIKE 'wy%' AND difficulty=0;
  IF n<>25 THEN RAISE EXCEPTION '精读(diff0)=% 期望25', n; END IF;
  SELECT count(*) INTO n FROM public.junior_reading WHERE publisher='junior_fltrp'
    AND volume='wy8A' AND unit='U2' AND body LIKE '%has gone to%' AND body LIKE '%has been to%';
  IF n<>1 THEN RAISE EXCEPTION 'wy8A U2 been to/gone to 对比未落库'; END IF;
  SELECT count(*) INTO n FROM public.junior_reading WHERE publisher='junior_fltrp'
    AND volume='wy8A' AND unit='U4' AND (body ~ '\y(makes|made|make) (us|him|her|them|me) [a-z]+\y'
                                      OR body ~ '\y(lets|let) (us|him|her|them|me) [a-z]+\y');
  IF n<4 THEN RAISE EXCEPTION 'wy8A U4 使役承载不足(% 篇)', n; END IF;
  SELECT count(*) INTO n FROM public.junior_reading WHERE publisher='junior_fltrp' AND volume LIKE 'wy%';
  IF n<>125 THEN RAISE EXCEPTION '总篇数=% 期望125', n; END IF;
  SELECT count(*) INTO n FROM public.junior_reading WHERE publisher='junior_fltrp' AND volume LIKE 'wy%'
    AND NOT ((difficulty=0 AND jsonb_array_length(questions)=5) OR (difficulty=1 AND jsonb_array_length(questions)=3));
  IF n<>0 THEN RAISE EXCEPTION '题数不符的篇=%', n; END IF;
  RAISE NOTICE 'OK: 四册阅读补审批次修正已全部落库';
END $$;

COMMIT;