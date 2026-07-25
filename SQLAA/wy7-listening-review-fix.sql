-- 外研社七上/七下 听力·补审修正(线上)
-- 背景:wy7A/wy7B 听力已灌库,本轮补审改了比较级/最高级超前、现在完成时超前、宾语从句。
--       wy8A 听力的 3 处改动随其 load 灌入,不在本文件;wy8B 听力无改动。
-- 定位用主键 id,最精确。只 UPDATE 不删不插。幂等:整值覆盖。
BEGIN;

-- wy7A U1 My morning [transcript]
UPDATE public.junior_listening_exercises SET
  transcript = 'A: You look tired, Ben. What time do you get up?
B: I get up at six thirty. Then I read English for twenty minutes.
A: Wow, so early! What about breakfast?
B: I have breakfast at seven, and I go to school at seven forty.
A: No wonder you''re tired. You should go to bed early.
B: Well, you''re right. I''ll try tonight.'
WHERE id = '184aaf35-7805-2d42-11f7-9d5900ef7052';

-- wy7A U2 What do you do after school? [transcript+questions]
UPDATE public.junior_listening_exercises SET
  transcript = 'A: What do you usually do after school, Kate?
B: I often draw pictures at home. I love art. What about you, Sam?
A: I play basketball with my friends. We practise every day.
B: That sounds fun. Do you play well?
A: Not really, but I enjoy it a lot.
B: Well, having fun really matters.',
  questions = '[{"type": "choice", "q": "What does Kate often do after school?", "options": ["Play basketball.", "Read books.", "Sing songs.", "Draw pictures."], "answer": "D", "explanation": "''I often draw pictures at home.''"}, {"type": "choice", "q": "What idea do they agree on?", "options": ["Having fun matters most.", "Basketball is the best sport.", "Art is easy.", "You must play well."], "answer": "A", "explanation": "结尾 ''having fun really matters.''"}]'::jsonb
WHERE id = '98118e78-1c45-e0d8-6174-8bfcbf60332a';

-- wy7A U3 Whose photo is this? [transcript+questions]
UPDATE public.junior_listening_exercises SET
  transcript = 'A: Anna, whose photo is this on your desk?
B: Oh, that''s my family''s photo. This is my mum and dad.
A: Who is the little boy?
B: He''s my brother, Sam. And this old man is my grandpa.
A: Your family looks so happy!
B: Yes, we are. Family means a lot to me.',
  questions = '[{"type": "choice", "q": "Who is the little boy in the photo?", "options": ["Anna''s father.", "Anna''s brother.", "Anna''s grandpa.", "Anna''s friend."], "answer": "B", "explanation": "''He''s my brother, Sam.''"}, {"type": "choice", "q": "What does Anna think is most important?", "options": ["Her family.", "Her desk.", "Her photo.", "Her school."], "answer": "A", "explanation": "''Family means a lot to me.''"}]'::jsonb
WHERE id = 'e9e9b12d-4b8f-4796-b237-d0e1ae8aa182';

-- wy7A U3 My grandma [transcript]
UPDATE public.junior_listening_exercises SET
  transcript = 'I want to tell you about my grandma. She is seventy years old, but she is still strong and happy. Every morning she waters her flowers in the small garden. She cooks very good noodles for our family. On weekends, she tells me old stories about her life. I love sitting with her. My grandma''s love is warm and quiet, and I feel lucky to have her.'
WHERE id = '9ad6121f-c6f0-dca5-4926-42e32fad8265';

-- wy7A U3 Dinner time [transcript]
UPDATE public.junior_listening_exercises SET
  transcript = 'In my family, dinner time is a happy time of the day. At six o''clock, we all sit down together. My mum cooks nice food, and my dad tells us about his day. My sister and I talk about school. We laugh a lot. Sometimes we help clean the table after dinner. It is a simple thing, but sitting together every evening keeps our family close.'
WHERE id = 'd13072ca-a61d-b357-db5d-57a46db3ce86';

-- wy7B U1 The kind bus driver [transcript]
UPDATE public.junior_listening_exercises SET
  transcript = 'Last winter, something small made my whole day happy. One cold morning, I ran to the bus stop, but I forgot my bus card at home. I felt worried because I had no money with me. Then the bus driver smiled and said, ''Don''t worry, you can pay me next time.'' I thanked him again and again. That day I learnt something important: a small kind act can warm a cold morning. Now I always try to help others, just like that kind driver.'
WHERE id = 'ea2ec27f-dae7-d917-094a-1396c1eea1ef';

-- wy7B U1 Happiness Week [transcript]
UPDATE public.junior_listening_exercises SET
  transcript = 'Hello, students. Here is some news about our Happiness Week. Next week, our school will do many kind things together. On Monday, we will write thank-you cards to our teachers. On Wednesday, we will share our favourite books with the new students. On Friday, we will clean the school garden. Come and join us. Let''s make everyone happy together!'
WHERE id = '053541c4-a7b9-cd2e-7b77-2c2a6fcc8d20';

-- wy7B U2 Try something new [transcript+questions]
UPDATE public.junior_listening_exercises SET
  transcript = 'A: I want to join the school race, but I''m not sure. What if I lose?
B: Don''t worry! Everyone feels a little afraid at first.
A: But I''m not a fast runner.
B: That''s OK. You can learn something from every try.
A: You''re right. I''ll give it a go!
B: Great! Anyone can do well with practice.',
  questions = '[{"type": "choice", "q": "How does everyone feel at first, according to B?", "options": ["Very happy.", "A little afraid.", "Quite bored.", "Very angry."], "answer": "B", "explanation": "''Everyone feels a little afraid at first.''"}, {"type": "choice", "q": "What does B want A to do?", "options": ["Give up the race.", "Run away.", "Stay at home.", "Try the race and learn from it."], "answer": "D", "explanation": "鼓励尝试、从每次尝试中学习。"}]'::jsonb
WHERE id = '7fa9ed83-7307-6313-5cff-3ac7b407b982';

-- wy7B U2 Never give up [transcript+questions]
UPDATE public.junior_listening_exercises SET
  transcript = 'Last year, I joined a long race. At the start, everyone ran fast, and soon I was at the back. My legs hurt, and I wanted to stop. But something inside me said, ''Don''t give up.'' So I kept going, step by step. My best friend cheered for me all the way. At last, I reached the end. I was not first, but I finished. That day taught me a lesson: anyone can win if they never give up.',
  questions = '[{"type": "choice", "q": "What did something inside the writer say?", "options": ["Don''t give up.", "Run every day.", "Stop now.", "Go home."], "answer": "A", "explanation": "''something inside me said, Don''t give up.''"}, {"type": "choice", "q": "What did the writer learn?", "options": ["A fast runner always wins.", "Races are boring.", "Anyone can win if they never give up.", "Friends are not important."], "answer": "C", "explanation": "末句点题。"}]'::jsonb
WHERE id = '7c94b6cb-ed97-2d53-e188-4febbb1bdf9b';

-- wy7B U2 Everyone can help [transcript]
UPDATE public.junior_listening_exercises SET
  transcript = 'Our class wanted to make the school garden green and nice. At first, someone said, ''It''s too big. We can''t do anything.'' But our teacher smiled. ''Everyone can do something small,'' she said. So we started. Some students planted flowers, and others cleaned the paths. Nobody sat and did nothing. In two weeks, the garden looked wonderful. When everyone helps, nothing is too hard. We all learnt this.'
WHERE id = '5440dcfb-3709-ea0b-9b00-1987e2808003';

-- wy7B U3 The bread went bad [questions]
UPDATE public.junior_listening_exercises SET
  questions = '[{"type": "choice", "q": "Why won''t they eat the bread?", "options": ["It is too hard.", "It looks green.", "It smells bad and it went bad.", "It is too sweet."], "answer": "C", "explanation": "''it smells bad. I think it went bad.''"}, {"type": "choice", "q": "What will they probably eat instead?", "options": ["More bread.", "Fresh apples.", "Some soup.", "Nothing."], "answer": "B", "explanation": "''There are some fresh apples.''"}]'::jsonb
WHERE id = 'a68b08af-63da-bab2-f643-e1df53570954';

-- wy7B U3 Cooking with Dad [transcript]
UPDATE public.junior_listening_exercises SET
  transcript = 'A: Dad, the rice is ready. Does it look right?
B: It looks perfect. Now let''s taste the fish.
A: It tastes a little salty to me.
B: You''re right. Let''s add some water. How about now?
A: Very good! It tastes fresh now.
B: Cooking together makes dinner more fun, doesn''t it?'
WHERE id = 'f2b152c6-4201-4753-3c97-ccca02e623d2';

-- wy7B U4 Our fun club [questions]
UPDATE public.junior_listening_exercises SET
  questions = '[{"type": "choice", "q": "What should you do if someone makes a mistake?", "options": ["Laugh at them.", "Help them and try again.", "Leave them.", "Stop the game."], "answer": "B", "explanation": "''Help them and try again.''"}, {"type": "choice", "q": "What is the club''s main idea about fun?", "options": ["Winning is all that matters.", "Only good players can join.", "Games must be quiet.", "Fun is not about winning, just enjoy your time."], "answer": "D", "explanation": "''having fun is not about winning.''"}]'::jsonb
WHERE id = 'ba1e596b-6757-77e1-6d33-fde199b0de0c';

-- 断言
DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM public.junior_listening_exercises WHERE publisher='junior_fltrp'
    AND volume IN ('wy7A','wy7B')
    AND (transcript ~ '(learnt|learned|know|knew) that ' OR transcript LIKE '%has gone off%');
  IF n<>0 THEN RAISE EXCEPTION '听力仍有宾从/现在完成时超前 % 篇', n; END IF;
  SELECT count(*) INTO n FROM public.junior_listening_exercises WHERE publisher='junior_fltrp'
    AND volume IN ('wy7A','wy7B') AND (transcript LIKE '%the most important%'
      OR transcript LIKE '%go to bed earlier%' OR transcript LIKE '%the best noodles in%'
      OR transcript LIKE '%the best time of the day%' OR transcript LIKE '%do better with practice%'
      OR transcript LIKE '%I was not the fastest%' OR transcript LIKE '%Much better!%'
      OR transcript LIKE '%with younger students%');
  IF n<>0 THEN RAISE EXCEPTION '听力仍有比较级/最高级超前 % 篇', n; END IF;
  SELECT count(*) INTO n FROM public.junior_listening_exercises WHERE publisher='junior_fltrp' AND volume='wy7A';
  IF n<>42 THEN RAISE EXCEPTION 'wy7A 听力 % 篇,期望42', n; END IF;
  SELECT count(*) INTO n FROM public.junior_listening_exercises WHERE publisher='junior_fltrp' AND volume='wy7B';
  IF n<>36 THEN RAISE EXCEPTION 'wy7B 听力 % 篇,期望36', n; END IF;
  RAISE NOTICE 'OK: wy7A/wy7B 听力补审修正已落库';
END $$;

COMMIT;