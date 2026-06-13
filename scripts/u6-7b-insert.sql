-- 7B U6 补齐:新增 4 条听力(2短对话 + 1长对话 + 1短文填空),凑齐 U6 = 6 条标准形态。
-- 幂等:每条 INSERT ... SELECT ... WHERE NOT EXISTS(按 id 防重复插)。
-- NOT NULL 全填;audio_url=NULL(留给 pregenerate 回填);transcript 单行连续存(同 U1 范本)。
-- 撇号双写:transcript/questions 内所有 ' 已双写。questions=jsonb(choice/options/answer字母)。

-- #1 短对话「天气与活动 Weather and Activities」
INSERT INTO junior_listening_exercises
  (id, grade, volume, unit, kind, topic, difficulty, title, transcript, translation_cn, audio_url, speaker, duration_sec, questions, key_vocab)
SELECT '7b6c0a01-9d2e-4f83-a1b5-6c7d8e9f0a11'::uuid, 7, '7B', 'U6', 'short', '七下 Unit6 听力·短对话', 1,
  '天气与活动 Weather and Activities',
  '1. M: What''s the weather like today, Anna? W: It''s snowing outside, so I''m wearing my warm coat. 2. W: What are you doing now, Jack? M: I''m doing my homework in my room. 3. M: Is your sister cooking dinner, Lucy? W: No, she''s cleaning the kitchen. My mother is cooking. 4. W: Why are you staying at home, Tom? M: Because it''s raining hard. I''m reading a book now. 5. M: What are the children doing in the park, Mrs. Green? W: They are flying kites. It''s windy but sunny today.',
  NULL, NULL, 'us_female', NULL,
  '[{"q":"What is the weather like today?","type":"choice","options":["Sunny.","Rainy.","Snowy."],"answer":"C"},{"q":"What is Jack doing now?","type":"choice","options":["Doing his homework.","Watching TV.","Sleeping."],"answer":"A"},{"q":"What is Lucy''s sister doing?","type":"choice","options":["Cooking dinner.","Cleaning the kitchen.","Washing clothes."],"answer":"B"},{"q":"Why is Tom staying at home?","type":"choice","options":["Because he is ill.","Because it is too hot.","Because it is raining."],"answer":"C"},{"q":"What are the children doing in the park?","type":"choice","options":["Flying kites.","Playing football.","Running."],"answer":"A"}]'::jsonb,
  '[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM junior_listening_exercises WHERE id = '7b6c0a01-9d2e-4f83-a1b5-6c7d8e9f0a11');

-- #2 短对话「大家在忙什么 What Is Everyone Doing」
INSERT INTO junior_listening_exercises
  (id, grade, volume, unit, kind, topic, difficulty, title, transcript, translation_cn, audio_url, speaker, duration_sec, questions, key_vocab)
SELECT '7b6c0a02-1d2e-4f83-a1b5-6c7d8e9f0a22'::uuid, 7, '7B', 'U6', 'short', '七下 Unit6 听力·短对话', 1,
  '大家在忙什么 What Is Everyone Doing',
  '1. W: Hi Ben, what are you doing? M: I''m watching a football game on TV. It''s exciting! 2. M: Is it cold in Harbin now, Emma? W: Yes, it''s very cold and windy. I''m staying inside. 3. W: What is your brother doing, Peter? M: He''s washing the car with my dad in the yard. 4. M: Are you having lunch now, Mary? W: No, I''m making a cake for my mother''s birthday. 5. W: Where is Tom swimming? M: He isn''t swimming. He''s running in the park because it''s sunny.',
  NULL, NULL, 'us_female', NULL,
  '[{"q":"What is Ben doing?","type":"choice","options":["Playing football.","Watching a football game.","Reading a book."],"answer":"B"},{"q":"What is the weather like in Harbin now?","type":"choice","options":["Hot and sunny.","Warm and rainy.","Cold and windy."],"answer":"C"},{"q":"What is Peter''s brother doing?","type":"choice","options":["Washing the car.","Cleaning his room.","Riding a bike."],"answer":"A"},{"q":"What is Mary doing now?","type":"choice","options":["Having lunch.","Making a cake.","Eating a cake."],"answer":"B"},{"q":"What is Tom doing?","type":"choice","options":["Swimming.","Sleeping.","Running in the park."],"answer":"C"}]'::jsonb,
  '[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM junior_listening_exercises WHERE id = '7b6c0a02-1d2e-4f83-a1b5-6c7d8e9f0a22');

-- #3 长对话「下雪天的电话 A Snowy Day Call」
INSERT INTO junior_listening_exercises
  (id, grade, volume, unit, kind, topic, difficulty, title, transcript, translation_cn, audio_url, speaker, duration_sec, questions, key_vocab)
SELECT '7b6c0a03-2d3e-4f83-a1b5-6c7d8e9f0a33'::uuid, 7, '7B', 'U6', 'short', '七下 Unit6 听力·长对话', 1,
  '下雪天的电话 A Snowy Day Call',
  'W: Hi Mike, this is Lucy. What are you doing now? M: Hi Lucy. I''m helping my mother cook lunch in the kitchen. W: That sounds nice! Is it still snowing in your city? M: Yes, it''s snowing heavily. We can''t go outside, so everyone is staying at home. W: What is your sister doing? Is she helping in the kitchen too? M: No, she isn''t. She''s drawing a picture of the snow by the window. W: And what about your father? M: He''s reading the newspaper and drinking coffee on the sofa. W: It sounds warm and happy! I''m watching TV with my brother. Do you want to come over later? M: I''d love to, but the snow is too heavy. Maybe tomorrow.',
  NULL, NULL, 'us_female', NULL,
  '[{"q":"What is Mike doing now?","type":"choice","options":["Helping his mother cook lunch.","Drawing a picture.","Reading the newspaper."],"answer":"A"},{"q":"What is the weather like in Mike''s city?","type":"choice","options":["It is raining.","It is sunny.","It is snowing heavily."],"answer":"C"},{"q":"What is Mike''s sister doing?","type":"choice","options":["Cooking lunch.","Drawing a picture.","Watching TV."],"answer":"B"},{"q":"What is Mike''s father doing?","type":"choice","options":["Reading the newspaper.","Drinking tea.","Sleeping."],"answer":"A"},{"q":"Why can''t Mike go to Lucy''s home today?","type":"choice","options":["Because he is busy.","Because he is ill.","Because the snow is too heavy."],"answer":"C"}]'::jsonb,
  '[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM junior_listening_exercises WHERE id = '7b6c0a03-2d3e-4f83-a1b5-6c7d8e9f0a33');

-- #4 短文填空「公园野餐 A Picnic in the Park」
INSERT INTO junior_listening_exercises
  (id, grade, volume, unit, kind, topic, difficulty, title, transcript, translation_cn, audio_url, speaker, duration_sec, questions, key_vocab)
SELECT '7b6c0a04-3d4e-4f83-a1b5-6c7d8e9f0a44'::uuid, 7, '7B', 'U6', 'short', '七下 Unit6 听力·短文填空', 1,
  '公园野餐 A Picnic in the Park',
  'Hello, I''m Anna. It''s a warm spring morning, and I''m having a picnic in the park with my family. The sun is shining and the birds are singing. My little brother is flying a kite near the lake. My parents are sitting on the grass and taking photos of the flowers. My grandmother is reading a story to me under a big tree. I''m drinking orange juice and feeling very happy. What a wonderful day!',
  NULL, NULL, 'us_female', NULL,
  '[{"q":"What is the weather like this morning?","type":"choice","options":["Cold and windy.","Warm and sunny.","Rainy and cool."],"answer":"B"},{"q":"Where is Anna having a picnic?","type":"choice","options":["In the park.","At the beach.","In the garden."],"answer":"A"},{"q":"What is Anna''s little brother doing?","type":"choice","options":["Swimming.","Singing.","Flying a kite."],"answer":"C"},{"q":"What are Anna''s parents doing?","type":"choice","options":["Taking photos.","Reading a story.","Flying a kite."],"answer":"A"},{"q":"What is Anna drinking?","type":"choice","options":["Milk.","Orange juice.","Tea."],"answer":"B"}]'::jsonb,
  '[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM junior_listening_exercises WHERE id = '7b6c0a04-3d4e-4f83-a1b5-6c7d8e9f0a44');

-- ===== 校验 =====
SELECT unit, topic, title FROM junior_listening_exercises
WHERE volume = '7B' AND unit = 'U6' ORDER BY topic, title;
-- 期望 6 条:
--   短对话 ×2(天气与活动 / 大家在忙什么)
--   短文填空 ×1(公园野餐)
--   短文理解 ×2(晴天 / 雨天,原有)
--   长对话 ×1(下雪天的电话)

-- 题型自洽抽查(确认新4条全 choice、每条5题):
SELECT title, jsonb_array_length(questions) AS n_q,
       (SELECT count(*) FROM jsonb_array_elements(questions) q WHERE q->>'type' = 'choice') AS n_choice
FROM junior_listening_exercises
WHERE id IN (
  '7b6c0a01-9d2e-4f83-a1b5-6c7d8e9f0a11',
  '7b6c0a02-1d2e-4f83-a1b5-6c7d8e9f0a22',
  '7b6c0a03-2d3e-4f83-a1b5-6c7d8e9f0a33',
  '7b6c0a04-3d4e-4f83-a1b5-6c7d8e9f0a44'
);
-- 期望:4 行,每行 n_q=5 且 n_choice=5
-- END
