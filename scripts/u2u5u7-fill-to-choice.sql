-- 7A U2+U5+U7 听力:fill → choice(听理解不考拼写)
-- 11 条 exercise(U2×4 家庭 / U5×4 社团 / U7×3 生日),原本均为纯 5 道 fill。
-- 整条 questions jsonb 替换;只改 questions,不动 transcript/audio_url/title。幂等(可重跑)。
-- 撇号双写:q 里 speaker''s / Leo''s / Paul''s / Helen''s / Linda''s / mother''s / brother''s / Sam''s 等;options 无撇号。
-- 社团名超纲自查:选项内仅 Music/Sports/Club Festival 含类别名,词根均在纲(primary_vocab∪junior_vocab,grade≤7);
--   原文超纲社团词(Frisbee/Coding/Baking/Green Thumb/Cooking/Science)仅在题干引用材料,不作干扰项。
BEGIN;

-- ===================== U2 家庭 =====================
-- Leo的家 Leo's Family
UPDATE junior_listening_exercises SET questions = '[
  {"q":"What is the speaker''s name?","type":"choice","options":["Leo","Leon","Theo"],"answer":"A"},
  {"q":"Who are the old people in the picture on the wall?","type":"choice","options":["His parents","His uncles","His grandparents"],"answer":"C"},
  {"q":"What is Leo''s father David?","type":"choice","options":["A teacher","A doctor","A driver"],"answer":"B"},
  {"q":"What is Leo''s mother''s name?","type":"choice","options":["Sarah","Sandra","Susan"],"answer":"A"},
  {"q":"How old is Leo''s sister Lily?","type":"choice","options":["Four","Nine","Five"],"answer":"C"}
]'::jsonb WHERE id = '37c2c015-0733-4e19-bbbb-97b85aeca703';

-- Paul的家 Paul's Family
UPDATE junior_listening_exercises SET questions = '[
  {"q":"What is the speaker''s name?","type":"choice","options":["Pete","Paul","Saul"],"answer":"B"},
  {"q":"Where is the picture of Paul''s family?","type":"choice","options":["On his desk","On the wall","On the bed"],"answer":"A"},
  {"q":"How old is Paul''s mother?","type":"choice","options":["Fourteen","Fifty","Forty"],"answer":"C"},
  {"q":"What is the name of Paul''s big brother?","type":"choice","options":["Tim","Jim","John"],"answer":"B"},
  {"q":"What kind of pet is Mimi?","type":"choice","options":["A cat","A dog","A bird"],"answer":"A"}
]'::jsonb WHERE id = 'b0956a94-41dc-4d9d-8aba-bf5c8c80a195';

-- Helen的家 Helen's Family
UPDATE junior_listening_exercises SET questions = '[
  {"q":"What is the speaker''s name?","type":"choice","options":["Ellen","Helena","Helen"],"answer":"C"},
  {"q":"What is Helen''s father?","type":"choice","options":["A teacher","A doctor","A driver"],"answer":"A"},
  {"q":"How old is Helen''s mother?","type":"choice","options":["Forty-five","Forty-one","Fourteen"],"answer":"B"},
  {"q":"What is Helen''s brother''s name?","type":"choice","options":["Tom","Jim","Tim"],"answer":"C"},
  {"q":"What pet does Helen''s family have?","type":"choice","options":["A cat","A bird","A fish"],"answer":"B"}
]'::jsonb WHERE id = '1a7e354a-356d-497e-a79a-ccca55105357';

-- Linda的大家庭 Linda's Big Family
UPDATE junior_listening_exercises SET questions = '[
  {"q":"What kind of family does Linda have?","type":"choice","options":["A big family","A small family","A new family"],"answer":"A"},
  {"q":"Who does Linda live with?","type":"choice","options":["Her parents and sister","Her parents and brother","Her grandparents"],"answer":"B"},
  {"q":"What does Linda''s father have?","type":"choice","options":["A red bike","A blue car","A red car"],"answer":"C"},
  {"q":"What does Linda say about her and her brother''s school?","type":"choice","options":["They are in the same school","They are in different schools","They are in the same class"],"answer":"A"},
  {"q":"Where do they like to play with their pet dog?","type":"choice","options":["In the park","In the yard","In the house"],"answer":"B"}
]'::jsonb WHERE id = '4c524cad-fe43-43d7-9a36-d180805c2cfa';

-- ===================== U5 社团 =====================
-- 社团报名须知 Club Sign-up
UPDATE junior_listening_exercises SET questions = '[
  {"q":"How many clubs are available this term?","type":"choice","options":["Fifteen","Fourteen","Fifty"],"answer":"A"},
  {"q":"What do English Club members do together?","type":"choice","options":["Write English stories","Sing English songs","Read English stories"],"answer":"C"},
  {"q":"When does the Coding Club meet?","type":"choice","options":["Every Monday","Every Friday","Every Wednesday"],"answer":"B"},
  {"q":"Where do Ultimate Frisbee Club members play?","type":"choice","options":["In the classroom","In the library","On the playground"],"answer":"C"},
  {"q":"When must students choose a club?","type":"choice","options":["Before Friday","Before Monday","Before Sunday"],"answer":"A"}
]'::jsonb WHERE id = 'db1ee8a0-4097-4855-8d2b-e875e63a1400';

-- 烘焙社 Baking Club
UPDATE junior_listening_exercises SET questions = '[
  {"q":"Where do students register for clubs?","type":"choice","options":["At the school office","On the school website","In the library"],"answer":"B"},
  {"q":"How many clubs can each student choose?","type":"choice","options":["One","Two","Three"],"answer":"A"},
  {"q":"How many students can the Baking Club accept?","type":"choice","options":["Twenty","Ten","Twelve"],"answer":"C"},
  {"q":"What must Music Club members bring?","type":"choice","options":["Their own books","Their own instruments","Their own food"],"answer":"B"},
  {"q":"When will club activities begin?","type":"choice","options":["Next Monday","Next Friday","Next Sunday"],"answer":"A"}
]'::jsonb WHERE id = 'df72b151-df8f-418f-b169-4d3b6119eeaf';

-- 社团节摆摊 Club Fair
UPDATE junior_listening_exercises SET questions = '[
  {"q":"What festival will the school hold?","type":"choice","options":["The Music Festival","The Sports Festival","The Club Festival"],"answer":"C"},
  {"q":"What date will the festival take place?","type":"choice","options":["October 8th","October 18th","October 28th"],"answer":"B"},
  {"q":"Where will the festival be held?","type":"choice","options":["On the school playground","In the school hall","In the gym"],"answer":"A"},
  {"q":"What can visitors try at the Cooking Club booth?","type":"choice","options":["Free drinks","Free books","Free snacks"],"answer":"C"},
  {"q":"What time will the festival finish?","type":"choice","options":["Four p.m.","Five p.m.","Six p.m."],"answer":"B"}
]'::jsonb WHERE id = '261a73cc-b1e8-4a8f-b0e3-2217e3d79329';

-- 园艺社 Gardening Club
UPDATE junior_listening_exercises SET questions = '[
  {"q":"What do club members learn to grow?","type":"choice","options":["Beautiful plants","Beautiful flowers","Tall trees"],"answer":"A"},
  {"q":"What will they plant this week?","type":"choice","options":["Flower seeds","Tomato seeds","Apple seeds"],"answer":"B"},
  {"q":"When does the club meet?","type":"choice","options":["Every Monday","Every Thursday","Every Wednesday"],"answer":"C"},
  {"q":"What should members bring?","type":"choice","options":["Their own water bottles","Their own books","Their own food"],"answer":"A"},
  {"q":"Where will they meet first?","type":"choice","options":["Near the front gate","Near the school back gate","Near the library"],"answer":"B"}
]'::jsonb WHERE id = '079021e5-136a-4513-b076-377e0aa7acec';

-- ===================== U7 生日 =====================
-- 爷爷的生日 Grandpa's Birthday
UPDATE junior_listening_exercises SET questions = '[
  {"q":"Which birthday is Grandpa celebrating?","type":"choice","options":["His 17th","His 70th","His 60th"],"answer":"B"},
  {"q":"What is the weather like?","type":"choice","options":["Sunny and warm","Sunny and cold","Rainy and warm"],"answer":"A"},
  {"q":"What does the speaker give Grandpa?","type":"choice","options":["A birthday cake","A birthday gift","A birthday card"],"answer":"C"},
  {"q":"What does the speaker''s mother cook?","type":"choice","options":["Long noodles","Long rice","Sweet cakes"],"answer":"A"},
  {"q":"How does Grandpa feel today?","type":"choice","options":["Tired","Happy","Angry"],"answer":"B"}
]'::jsonb WHERE id = '57960e50-993d-4094-ad79-000fdbba5d00';

-- 英语日 English Day
UPDATE junior_listening_exercises SET questions = '[
  {"q":"When is the English Day?","type":"choice","options":["October 12th","October 2nd","October 22nd"],"answer":"C"},
  {"q":"How old will the speaker be this year?","type":"choice","options":["Twelve","Twenty","Eleven"],"answer":"A"},
  {"q":"What will the school have on the last Friday?","type":"choice","options":["A big party","A big sale","A big game"],"answer":"B"},
  {"q":"What can students sell at the sale?","type":"choice","options":["Old clothes and shoes","Old bikes and bags","Old books and toys"],"answer":"C"},
  {"q":"What does the speaker think of October?","type":"choice","options":["Interesting","Boring","Busy"],"answer":"A"}
]'::jsonb WHERE id = '17890cd2-f36c-4a60-8d8f-8da465fed68a';

-- Sam的生日 Sam's Birthday
UPDATE junior_listening_exercises SET questions = '[
  {"q":"When is Sam''s birthday?","type":"choice","options":["July 7th","July 17th","July 27th"],"answer":"B"},
  {"q":"How old is Sam this year?","type":"choice","options":["Thirty","Twelve","Thirteen"],"answer":"C"},
  {"q":"What does Sam''s uncle give him?","type":"choice","options":["A basketball","A football","A bike"],"answer":"A"},
  {"q":"What is on Sam''s cake?","type":"choice","options":["Sweet chocolate","Sweet strawberries","Fresh apples"],"answer":"B"},
  {"q":"How does Sam feel?","type":"choice","options":["Sad","Tired","Happy"],"answer":"C"}
]'::jsonb WHERE id = '3782767a-bb91-4ba0-a8fd-9ff926d7511c';

COMMIT;

-- ===== 校验 =====
-- 1) U2/U5/U7 各 unit 条数 = all_choice(整 unit 全 choice):
SELECT volume, unit, count(*) AS total,
       sum(CASE WHEN n_choice = n THEN 1 ELSE 0 END) AS all_choice
FROM (
  SELECT unit, id,
         jsonb_array_length(questions) AS n,
         (SELECT count(*) FROM jsonb_array_elements(questions) q WHERE q->>'type' = 'choice') AS n_choice
  FROM junior_listening_exercises
  WHERE volume = '7A' AND unit IN ('U2','U5','U7')
) t
GROUP BY volume, unit
ORDER BY unit;
-- 期望:U2 total=9 all_choice=9 / U5 total=12 all_choice=12 / U7 total=12 all_choice=12
-- (total = 该 unit 全部条数:U2 含 5 条原生 choice + 本次 4 条 fill→choice = 9;
--  U5 = 8 原生 + 4 本次 = 12;U7 = 9 原生 + 3 本次 = 12。
--  这三个 unit 无 judge 题(judge 仅在 7A U1/U3),故转换后整 unit 全 choice → all_choice 应 = total。)

-- 2) 全 7A 已无 fill 残留(应 = 0):
SELECT count(*) AS exercises_with_fill_left
FROM junior_listening_exercises
WHERE volume = '7A'
  AND EXISTS (SELECT 1 FROM jsonb_array_elements(questions) q WHERE q->>'type' = 'fill');
-- END
