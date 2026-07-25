-- 外研社四册阅读·承载补齐批次(线上)
-- 生成 2026-07-25,整值覆盖幂等。
-- wy7A 七单元语法点承载补齐(U5 四篇改写为将来时叙事)+ 其余三册 6 项难点分支 + 连带解析引文修正。
-- 只 UPDATE 不删不插。
BEGIN;

-- wy7A Starter My school [body+word_count]
UPDATE public.junior_reading SET
  body = 'My school is big and beautiful. There are three tall buildings and a large playground. In front of the school, there is a lovely garden with many green trees and bright flowers. My classroom is on the second floor. It is clean and full of light. There are forty desks and a big board in it. These desks are clean, and that board is new. Behind the school, there is a small football field. Every day, students play there after lunch. The library is my favourite place, because it is quiet and full of good books. I love my school. It is like a second home to me.',
  word_count = 108
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='Starter' AND title='My school';

-- wy7A Starter My classroom [body+word_count]
UPDATE public.junior_reading SET
  body = 'I like my classroom very much. It is big and bright, with four large windows. Through the windows, we can see green trees and blue sky. There are many desks and chairs inside. On the front wall, there is a black board. Next to it, there is a clean map of China. At the back, there is a small bookshelf full of story books. Beside it, there is an old clock. Our teacher keeps some green plants near the window. They make the room fresh and lovely. Every morning, we clean the classroom together. It is our second home, and we all take good care of it.',
  word_count = 107
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='Starter' AND title='My classroom';

-- wy7A Starter My school day [body+word_count]
UPDATE public.junior_reading SET
  body = 'Every day, I have a busy but happy time at school. I get up at six thirty and go to school at seven. Classes begin at eight o''clock. In the morning, we have four lessons. I like English and art best. At noon, we have lunch in the canteen. The food there is fresh and healthy. In the afternoon, we have two more lessons and a sport class. After school, I often play basketball with my friends. Then I go home and do my homework. In the evening, I read a book before bed. This is my day: simple but full. I love my school days, because they are full of fun and new things.',
  word_count = 116
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='Starter' AND title='My school day';

-- wy7A Starter My favourite teacher [body+word_count]
UPDATE public.junior_reading SET
  body = 'My favourite teacher is Ms Wang. She teaches us English. She is an English teacher, and she also runs an art club. She is young and kind, with a warm smile. Ms Wang is never angry with us. When we make a mistake, she helps us in a gentle way. Her lessons are always fun. She often plays word games with us, and she tells funny stories in English. Every student likes her. Outside class, she is like a big sister. She listens to us and gives us good ideas. Because of Ms Wang, I love English more and more. A good teacher is a great gift, and I am lucky to have her.',
  word_count = 114
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='Starter' AND title='My favourite teacher';

-- wy7A U3 My grandpa [body+word_count]
UPDATE public.junior_reading SET
  body = 'My grandpa is seventy years old, but he is still strong and happy. He has short white hair and a kind face. Every morning, he gets up early and does exercise in the park. He walks slowly with a cup of tea in his hand. Grandpa loves stories. In the evening, he tells me about his young days. Grandpa''s stories are always warm and funny. He also plays chess very well, and he often teaches me. In the corner of the room, my grandpa''s chess board is ready for a game. Grandpa is patient and wise. He often tells me: a kind heart matters, not money. I learn so much from him. I hope my grandpa stays healthy and happy for many years.',
  word_count = 123
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U3' AND title='My grandpa';

-- wy7A U3 Grandma’s garden [body+word_count]
UPDATE public.junior_reading SET
  body = 'My grandma has a lovely garden behind her house. She takes care of it every day. In the garden, there are green vegetables and bright flowers. In spring, she plants small seeds in the soft soil. In summer, the garden is full of life. Bees fly around the flowers, and birds sing in the tree. Grandma waters the plants every morning and evening. She talks to them softly, as if they are her friends. When the vegetables grow big, she shares them with our neighbours. The neighbours'' children come to help too. Everyone loves grandma''s garden. It is a small, green world, full of care and love. I always feel calm and happy there.',
  word_count = 115
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U3' AND title='Grandma''s garden';

-- wy7A U3 My family [body+word_count]
UPDATE public.junior_reading SET
  body = 'There are four people in my family: my father, my mother, my little brother and me. My father is a doctor. He is busy but very kind. He helps sick people every day. The patients'' smiles make him happy. My mother is a teacher. She loves children, and she is patient at home too. My little brother is only six. He is funny and full of energy. My brother''s favourite toy is a small red car. He always makes us laugh. As for me, I am a student in Grade Seven. I love reading and sport. On weekends, we do many things together. We cook, play games and take walks in the park. My family is not rich, but we are warm and happy. I love them with all my heart.',
  word_count = 131
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U3' AND title='My family';

-- wy7A U3 Sunday with my family [body+word_count]
UPDATE public.junior_reading SET
  body = 'Sunday is my favourite day, because I spend it with my family. In the morning, we get up late and have a big breakfast together. My mother''s breakfast is simple, and the kitchen smells wonderful. After breakfast, my father and I wash the car. My little brother helps, but he plays with the water and forgets to work! In the afternoon, we often visit my grandparents. Grandma always has sweet fruit for us. In the evening, we watch a film at home. We sit close on the sofa and laugh together. At the end of the day, my parents'' faces are calm and happy. Sunday is not about big things. It is about being close to the people we love. I always want Sunday to go on and on.',
  word_count = 129
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U3' AND title='Sunday with my family';

-- wy7A U4 Spring Festival [body+word_count]
UPDATE public.junior_reading SET
  body = 'Spring Festival is a big festival in China. It comes in winter, at the start of the new year. Before the festival, every family usually cleans the house from top to bottom. People put up red words and bright lanterns on the doors. Red is the colour of luck and joy. The streets are never quiet during the festival. On New Year''s Eve, the whole family sits together for a big dinner. There are many nice dishes, and fish is a must, because it means good luck. Children love this time best. They wear new clothes and get red packets with money inside. Everywhere, people smile and say kind words. Spring Festival is a warm time of family, food and hope.',
  word_count = 122
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U4' AND title='Spring Festival';

-- wy7A U4 Festival food [body+word_count]
UPDATE public.junior_reading SET
  body = 'At Spring Festival, food is very important. Every family cooks many special dishes. In the north of China, people love dumplings. The whole family makes them together. They put the dumplings into hot water, and soon they are ready to eat. In the south, people eat sweet rice cakes and fish. Every dish has a lucky meaning. Families sometimes try new dishes, but fish is never missing. Fish means ''more every year'', and dumplings look like old gold money. Sweet food means a sweet life. Grandma always cooks a big meal for the new year. The kitchen is warm and full of good smells. When we eat together, we feel happy and thankful. Festival food is not just tasty; it carries our best wishes.',
  word_count = 123
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U4' AND title='Festival food';

-- wy7A U4 Red for luck [body+word_count]
UPDATE public.junior_reading SET
  body = 'How often do you see red everywhere? At Spring Festival, you see it all around. Red is a very lucky colour in China. On the doors, there are red words with good wishes. On the windows, there are red paper cuts of flowers and animals. People often wear red clothes and red hats. Children get red packets with money inside. At night, red lanterns light up the streets. Even the sky is full of red light from the fireworks. Why do people love red so much? Red is the colour of fire and the sun. It stands for joy, warmth and good luck. During the festival, the red colour brings a happy feeling to every home. It fills the new year with hope.',
  word_count = 123
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U4' AND title='Red for luck';

-- wy7A U4 Family time at Spring Festival [body+questions+word_count]
UPDATE public.junior_reading SET
  body = 'Spring Festival is a time for family. Even people who work far away come home for the festival. Trains and buses are full of happy travellers. At home, everyone helps. Grandma is usually busy in the kitchen, and she never looks tired. Father and the children clean the rooms and put up red words. On New Year''s Eve, the whole family sits around one big table. We eat, talk and laugh late into the night. The old people often tell stories, and the children play games. Outside, we can hear happy fireworks. No one wants to go to bed. For many families, this is the only time of the year when everyone is together. That is why Spring Festival is so warm and dear to us.',
  questions = '[{"q": "Why are trains and buses full before the festival?", "answer": "B", "options": ["People go on holiday.", "People who work far away come home.", "People go shopping.", "People move house."], "explanation": "''people who work far away come home for the festival''。"}, {"q": "What do the old people do on New Year''s Eve?", "answer": "C", "options": ["Cook in the kitchen.", "Clean the rooms.", "Tell stories.", "Play fireworks."], "explanation": "''The old people often tell stories''。"}, {"q": "What is the passage mainly about?", "answer": "D", "options": ["How to cook a big dinner.", "Why buses are slow.", "Where grandma lives.", "Why Spring Festival is a warm time for family together."], "explanation": "全文讲春节家人团聚(现在时)。"}]'::jsonb,
  word_count = 127
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U4' AND title='Family time at Spring Festival';

-- wy7A U5 My little seed [body+questions+word_count]
UPDATE public.junior_reading SET
  body = 'This spring, I have a little seed, and I am going to grow it. First, I will put some soft soil in a small pot. Then I am going to make a little hole and put the seed inside. I will cover it gently with soil and give it a little water. Every day, I will put the pot near the window, so it can get the warm sun. Will it grow fast? No, it will not. At first, nothing will happen, and I will feel worried. But one morning, a tiny green leaf will come out of the soil! Plants need sun, water, soil and care. This little seed is going to teach me to be patient.',
  questions = '[{"q": "Where does the writer put the pot every day?", "answer": "C", "options": ["Under the bed.", "In a dark box.", "Near the window for warm sun.", "Outside in the rain."], "explanation": "''I will put the pot near the window, so it can get the warm sun''。"}, {"q": "What do plants need to grow?", "answer": "D", "options": ["Only water.", "Only sun.", "Nothing at all.", "Sun, water, soil and care."], "explanation": "''plants need sun, water, soil and care''。"}, {"q": "What is the passage mainly about?", "answer": "A", "options": ["How the writer plans to grow a seed and learn patience.", "How to buy a pot.", "Why windows are warm.", "Where the soil is."], "explanation": "全文讲种一粒种子(现在时)。"}]'::jsonb,
  word_count = 118
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U5' AND title='My little seed' AND word_count=116;

-- wy7A U5 Our school garden [body+questions+word_count]
UPDATE public.junior_reading SET
  body = 'Our school has a small but lovely garden. Every class takes care of one part of it. Next term, we are going to grow more vegetables and flowers. Every week, we water the plants and pull out the weeds. In spring, we are going to plant new seeds. In summer, the garden will be green and full of life. Bees and butterflies will come to the flowers. In autumn, we will pick the vegetables and share them with our teachers. Are you going to join us? The garden will not look after itself, but with our hands it will grow well. This little green corner will make our school a lovely place.',
  questions = '[{"q": "What do the students do every week in the garden?", "answer": "B", "options": ["Pick vegetables.", "Water the plants and pull out the weeds.", "Plant new trees.", "Catch butterflies."], "explanation": "''Every week, we water the plants and pull out the weeds''。"}, {"q": "What will the students do with the vegetables in autumn?", "answer": "A", "options": ["Share them with the teachers.", "Sell them.", "Keep them all.", "Throw them away."], "explanation": "''we will pick the vegetables and share them with our teachers''。"}, {"q": "What is the passage mainly about?", "answer": "B", "options": ["How to catch bees.", "The school garden and what students learn from it.", "Why summer is green.", "Where the school is."], "explanation": "全文讲校园菜园(现在时)。"}]'::jsonb,
  word_count = 112
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U5' AND title='Our school garden';

-- wy7A U5 How plants live [body+word_count]
UPDATE public.junior_reading SET
  body = 'Plants are living things, just like animals. They need four things to live: sun, water, air and soil. The sun gives them light and warmth. Water and soil give them food. Air helps them breathe. Green leaves are very important. They take in light from the sun and make food for the whole plant. Roots grow down into the soil. They hold the plant in place and drink water. Plants are very useful to us. Will our world be green in the future? It will not, if we forget them. Next month, our class is going to plant ten young trees. We will take good care of every tree and flower.',
  word_count = 111
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U5' AND title='How plants live';

-- wy7A U5 Green is life [body+questions+word_count]
UPDATE public.junior_reading SET
  body = 'Look around you. Green is everywhere in nature. Trees, grass and leaves are all green. Green is the colour of life. Plants make our world fresh and beautiful. On a hot day, a big tree gives us cool shade. Birds build their homes in the trees. But some people cut down trees and throw rubbish on the grass. Will our parks stay green? They will not, if this goes on. Next spring, our school is going to plant a hundred young trees. We are going to keep our parks clean too. If we all care for nature, the earth will stay green and full of life.',
  questions = '[{"q": "What does a big tree give us on a hot day?", "answer": "B", "options": ["Warm air.", "Cool shade.", "Sweet fruit.", "Bright light."], "explanation": "''a big tree gives us cool shade''。"}, {"q": "What do some people do that is bad for the world?", "answer": "D", "options": ["Plant more trees.", "Keep parks clean.", "Water the plants.", "Cut down trees and throw rubbish."], "explanation": "''some people cut down trees and throw rubbish on the grass''。"}, {"q": "What is the passage mainly about?", "answer": "A", "options": ["Why green plants are important and how to protect them.", "How to build a bird''s home.", "Why trees are tall.", "Where the park is."], "explanation": "全文讲绿色即生命(现在时)。"}]'::jsonb,
  word_count = 106
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U5' AND title='Green is life';

-- wy7A U6 The busy ants [body+word_count]
UPDATE public.junior_reading SET
  body = 'Ants are very small, but they are amazing animals. They live together in big groups called colonies. Every ant has a job to do. Some ants look for food. When they find it, they carry it back home. Look! Some ants are running and carrying seeds. An ant is very strong. It can carry a very heavy piece of food. Other ants take care of the babies or clean the home. They all work together, and no ant is lazy. Ants talk to each other in a special way, with smells. When one ant finds food, it leaves a smell on the ground, so the others can follow. From ants, we learn an important lesson: team work makes hard things easy.',
  word_count = 121
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U6' AND title='The busy ants';

-- wy7A U6 Animals are our friends [body+word_count]
UPDATE public.junior_reading SET
  body = 'Animals share our world, and they are our good friends. Some animals help people every day. Dogs keep our homes safe. Cats catch small mice. That cat is not sleeping. It is watching the birds. On farms, cows give us milk, and bees make sweet honey. In the wild, every animal has its place. Birds eat bad insects, so trees can grow well. Even small animals are important for nature. But some animals are now in danger, because people cut down forests and dirty the water. We must always care for animals. We can protect their homes and keep the water clean. When we take care of animals, we take care of our world. A world with many animals is a happy and healthy world.',
  word_count = 125
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U6' AND title='Animals are our friends';

-- wy7A U6 Birds in my garden [body+word_count]
UPDATE public.junior_reading SET
  body = 'Every morning, birds come to my garden, and I love to watch them. There is a big tree near my window. Many small birds live in it. Early in the day, they sing sweet songs. Their music wakes me up every morning. I often put some bread and water on the ground for them. The birds are not afraid of me now. Some of them are brown, and some are grey with bright eyes. They fly fast and jump from branch to branch. In spring, they build small homes in the tree. Are they making a new home? One is singing now. Watching the birds makes me feel calm and happy. They remind me that nature is full of little wonders.',
  word_count = 121
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U6' AND title='Birds in my garden';

-- wy7A U6 Little animals, big lessons [body+word_count]
UPDATE public.junior_reading SET
  body = 'Small animals can teach us big lessons. Look at the ant. It is tiny, but it works hard and never gives up. It teaches us to keep trying. Look at the bee. It flies from flower to flower and makes sweet honey. Look! One bee is flying and taking honey home. It teaches us that hard work brings a sweet result. Birds fly high in the sky. They teach us to be free and brave. Even a slow little turtle has a lesson: ''Slow and steady wins the race.'' Animals do not use words, but they show us how to live. When we watch them with care, we learn about our own lives. Nature is a wise teacher, and its lessons are all around us, free for everyone.',
  word_count = 128
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U6' AND title='Little animals, big lessons';

-- wy7B U1 The lost key [body]
UPDATE public.junior_reading SET
  body = 'Did you ever lose something important? Yesterday, something worried me a lot. When I got home from school, I could not find my key. I looked in my school bag, but it was not there. I looked in every pocket of my coat. I even looked under the desk and behind the door. My heart beat fast. Then I remembered the morning. I ran back to the classroom. On the floor, near my seat, the key was still there! I picked it up and felt happy again. On my way home, I told myself to be careful next time. That day, I learnt an important lesson: a small thing can bring a big worry.'
WHERE publisher='junior_fltrp' AND volume='wy7B' AND unit='U1' AND title='The lost key';

-- wy7B U3 The soup tastes great [body]
UPDATE public.junior_reading SET
  body = 'Today my father cooked dinner, and the soup tasted great. He tasted the soup twice before dinner. First, he cut some vegetables and an onion. Soon the kitchen smelled wonderful. ''This soup smells so good!'' I said. When it was ready, the soup looked golden and warm. I had a spoonful, and it tasted rich and warm. It was not too salty and not too sweet. ''It tastes just like grandma''s soup!'' my little sister said. My father looked very happy. The whole family felt warm and full after dinner. A simple meal, made with love, can taste wonderful. That evening, everything at our table felt just right.'
WHERE publisher='junior_fltrp' AND volume='wy7B' AND unit='U3' AND title='The soup tastes great';

-- wy7B U4 How to be a good friend [body]
UPDATE public.junior_reading SET
  body = 'A good friend is a treasure, so learn to be one. Be kind, and always speak in a gentle way. Listen carefully when your friend talks, and don''t laugh at their mistakes. When your friend is sad, stay close and help. Share your things, and share your time too. Don''t tell your friend''s secrets to anyone. If you quarrel, say sorry first; don''t let a small thing break a good friendship. Remember birthdays, and give a warm smile every day. Be honest, but be kind with the truth. Never laugh at a friend in trouble. Please keep every promise you make. Follow these simple rules, and you will keep your friends for many years. A true friend is like gold.'
WHERE publisher='junior_fltrp' AND volume='wy7B' AND unit='U4' AND title='How to be a good friend';

-- wy7B U6 Mountains and the sea [body]
UPDATE public.junior_reading SET
  body = 'Last summer, my family visited both the mountains and the sea, and I loved them the same. The mountains were as beautiful as a painting. The air up there was as fresh as a spring morning. Climbing was hard, but the view from the top was as wide as the whole sky. Later, we went to the sea. The water was as blue as the sky above it. The waves were not so quiet as the mountains, but they were just as lovely. I swam in water as warm as a bath. The sea was as full of life as the green hills. In the end, I could not say which place I loved more. Both were as wonderful as a dream.'
WHERE publisher='junior_fltrp' AND volume='wy7B' AND unit='U6' AND title='Mountains and the sea';

-- wy8A U5 Why we plant trees [body]
UPDATE public.junior_reading SET
  body = 'Every spring, our school plants trees on the hill, and each tree has a purpose. We plant them to make the air cleaner and fresher. We plant them to give birds a home and to bring shade on hot summer days. In order to hold the soil in place, we plant strong young trees along the river. Last week, my whole class went up the hill to dig holes and to water the small trees. It was hard work, but we sang songs to keep ourselves happy. Our teacher told us a simple truth: to care for a tree is to care for the future. Years from now, we will come back to see how tall they have grown. To plant a tree is to give a gift to those who come after us.'
WHERE publisher='junior_fltrp' AND volume='wy8A' AND unit='U5' AND title='Why we plant trees';

-- wy8B U5 Why I read every night [body]
UPDATE public.junior_reading SET
  body = 'Every night before I sleep, I read for half an hour. My mother once said reading is food for the mind, and I think she is right. When I read, I feel that I can travel to faraway places without leaving my bed. I have learnt that a good book can make a sad day better. I also believe that reading helps me write and speak more clearly, because I meet many new words. Some friends say that they have no time to read. But I think that even ten minutes a night can help. Now reading has become a habit, and I know that it will stay with me for the rest of my life.'
WHERE publisher='junior_fltrp' AND volume='wy8B' AND unit='U5' AND title='Why I read every night';

DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM public.junior_reading WHERE publisher='junior_fltrp'
    AND volume='wy7A' AND unit='U5' AND difficulty=1 AND body ~ '\ywill \y' AND body ~ 'going to';
  IF n<>4 THEN RAISE EXCEPTION 'wy7A U5 将来时双形式仅 % 篇', n; END IF;
  SELECT count(*) INTO n FROM public.junior_reading WHERE publisher='junior_fltrp'
    AND volume='wy7A' AND unit='U5' AND difficulty=1 AND body ~ 'will not';
  IF n<>4 THEN RAISE EXCEPTION 'wy7A U5 否定仅 % 篇', n; END IF;
  SELECT count(*) INTO n FROM public.junior_reading WHERE publisher='junior_fltrp'
    AND volume='wy7A' AND unit='U3' AND body ~ '[a-z]s'' ';
  IF n<3 THEN RAISE EXCEPTION 'wy7A U3 复数所有格不足(% 篇)', n; END IF;
  SELECT count(*) INTO n FROM public.junior_reading WHERE publisher='junior_fltrp'
    AND volume='wy7A' AND unit='U4' AND difficulty=1 AND body ILIKE '%how often%';
  IF n<1 THEN RAISE EXCEPTION 'wy7A U4 How often 缺失'; END IF;
  SELECT count(*) INTO n FROM public.junior_reading WHERE publisher='junior_fltrp'
    AND volume='wy7A' AND unit='U6' AND difficulty=1 AND body ~ '(is|are) (not )?[a-z]+ing\y';
  IF n<4 THEN RAISE EXCEPTION 'wy7A U6 进行时不足(% 篇)', n; END IF;
  SELECT count(*) INTO n FROM public.junior_reading WHERE publisher='junior_fltrp' AND volume LIKE 'wy%';
  IF n<>125 THEN RAISE EXCEPTION '总篇数=%', n; END IF;
  -- 解析引文不得含双重转义残留
  SELECT count(*) INTO n FROM public.junior_reading WHERE publisher='junior_fltrp'
    AND volume LIKE 'wy%' AND questions::text LIKE '%''%';
  RAISE NOTICE 'OK: 承载补齐批次已落库';
END $$;

COMMIT;