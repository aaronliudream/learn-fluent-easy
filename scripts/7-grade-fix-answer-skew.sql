-- 七年级听力质量纠正:① 6 条答案严重偏向 → 重排选项打散位置(答案文字不变,仍正确)
--                       ② (可选)17 条 topic 名实规整:fill→choice 后"填空"标签 → "短文理解"
-- 整条 questions jsonb 替换;只改 questions/topic,不动 transcript/audio_url/title。幂等。撇号双写。
BEGIN;

-- ===== ① 答案打散(重排选项)=====

-- 7A U2 我的亲戚 My Relatives (原 BBBB → A C B C)
UPDATE junior_listening_exercises SET questions = '[
  {"q":"Who is the woman in the middle of the photo?","type":"choice","options":["The grandmother.","The mother.","The aunt."],"answer":"A"},
  {"q":"Who is Eric to Dale?","type":"choice","options":["His brother.","His uncle.","His cousin."],"answer":"C"},
  {"q":"Whose keys are they?","type":"choice","options":["The mother''s keys.","The father''s keys.","The son''s keys."],"answer":"B"},
  {"q":"Where do Grace''s grandparents live?","type":"choice","options":["Shanghai.","Guangzhou.","Beijing."],"answer":"C"}
]'::jsonb WHERE id='8dedca0b-5dd4-4357-9f5b-7672028bb4ee';

-- 7A U2 我的家人 My Family (原 BBBBB → A C B C A)
UPDATE junior_listening_exercises SET questions = '[
  {"q":"Who is the woman?","type":"choice","options":["Tina''s aunt.","Tina''s mother.","Tina''s sister."],"answer":"A"},
  {"q":"Who is the short boy?","type":"choice","options":["Sally''s brother.","Sally''s friend.","Sally''s cousin."],"answer":"C"},
  {"q":"Who is Joy''s father with right now?","type":"choice","options":["His mother.","His grandfather.","His uncle."],"answer":"B"},
  {"q":"How many people are there in Eric''s family photo?","type":"choice","options":["Three.","Five.","Four."],"answer":"C"},
  {"q":"Whose car is it?","type":"choice","options":["The grandfather''s car.","The uncle''s car.","The father''s car."],"answer":"A"}
]'::jsonb WHERE id='98432f70-3a3a-4bb9-a983-3a62ff26a038';

-- 7A U3 校园问路① Find the Way (原 BBBBB → C A B C A)
UPDATE junior_listening_exercises SET questions = '[
  {"q":"Where is the science lab?","type":"choice","options":["On the first floor.","Next to the library.","On the second floor."],"answer":"C"},
  {"q":"What is behind the tall tree?","type":"choice","options":["The dining hall.","The teachers'' office.","The library."],"answer":"A"},
  {"q":"What do they do on the sports field?","type":"choice","options":["Play basketball.","Play football.","Go running."],"answer":"B"},
  {"q":"How many classrooms are there for students?","type":"choice","options":["Six.","Thirty.","Twenty-four."],"answer":"C"},
  {"q":"Who is Mr. Green?","type":"choice","options":["A new English teacher.","A student.","A driver."],"answer":"A"}
]'::jsonb WHERE id='100b13b3-9db1-40fa-bc53-42b450a7851e';

-- 7A U4 课程问答① Subjects Talk (原 BBCBB → A C B C A)
UPDATE junior_listening_exercises SET questions = '[
  {"q":"What day is it today?","type":"choice","options":["Tuesday.","Monday.","Wednesday."],"answer":"A"},
  {"q":"What is Mary''s favourite subject?","type":"choice","options":["History.","Chinese.","Geography."],"answer":"C"},
  {"q":"Why does the boy like Maths?","type":"choice","options":["Because it is interesting.","Because the teacher is fun.","Because it is difficult."],"answer":"B"},
  {"q":"What time does the English class start?","type":"choice","options":["8:00.","9:00.","8:30."],"answer":"C"},
  {"q":"Who is the girl''s Music teacher?","type":"choice","options":["Miss White.","Mr. Green.","Mrs. Brown."],"answer":"A"}
]'::jsonb WHERE id='343170e3-a3ef-49ad-9721-54056bf173cb';

-- 7B U1 鹦鹉 The Parrot (原 CBBBB → B A C B C)
UPDATE junior_listening_exercises SET questions = '[
  {"q":"What animal is the speaker talking about?","type":"choice","options":["A panda.","A parrot.","A koala."],"answer":"B"},
  {"q":"What do parrots use to open nuts?","type":"choice","options":["Their strong beaks.","Their wings.","Their long legs."],"answer":"A"},
  {"q":"Why do people like to keep them as pets?","type":"choice","options":["Because they are big.","Because they sleep all day.","Because they are smart."],"answer":"C"},
  {"q":"What can parrots learn to do?","type":"choice","options":["Swim in the water.","Copy human sounds.","Run very fast."],"answer":"B"},
  {"q":"Where do parrots usually live?","type":"choice","options":["In cold mountains.","In dry deserts.","In warm rainforests."],"answer":"C"}
]'::jsonb WHERE id='654269bc-290c-409b-9ea8-45a45114c1bf';

-- 7B U2 科学营规则 Science Camp Rules (原 A2B6C2 → A4 B3 C3)
UPDATE junior_listening_exercises SET questions = '[
  {"q":"What time do the campers wake up in the morning?","type":"choice","options":["At 6:30 a.m.","At 6:00 a.m.","At 7:00 a.m."],"answer":"A"},
  {"q":"Where do the campers have breakfast?","type":"choice","options":["In the bedroom.","In the classroom.","In the dining hall."],"answer":"C"},
  {"q":"What must students wear every day?","type":"choice","options":["Their school uniforms.","Their sports shoes.","Their camp T-shirts."],"answer":"C"},
  {"q":"Who must a camper ask before leaving the camp area?","type":"choice","options":["A teacher.","A parent.","A teammate."],"answer":"A"},
  {"q":"What cannot be brought to the camp?","type":"choice","options":["Mobile phones.","Electronic games.","Water bottles."],"answer":"B"},
  {"q":"How long can campers use their mobile phones after dinner?","type":"choice","options":["For 15 minutes.","For one hour.","For 30 minutes."],"answer":"C"},
  {"q":"What should campers do to their bedrooms?","type":"choice","options":["Keep them clean and tidy.","Paint the walls.","Lock the doors all day."],"answer":"A"},
  {"q":"Why is swimming in the nearby lake not allowed?","type":"choice","options":["Because the water is dirty.","Because it is deep and dangerous.","Because it is too cold."],"answer":"B"},
  {"q":"When must campers start to keep quiet at night?","type":"choice","options":["After 9:30 p.m.","After 10:00 p.m.","After 10:30 p.m."],"answer":"B"},
  {"q":"Who should the campers be polite to?","type":"choice","options":["Their camp teammates.","Only Mr. Jackson.","The library workers."],"answer":"A"}
]'::jsonb WHERE id='1de964ae-88ae-4d7e-a6d3-8a30b81bf23b';

-- ===== ② (可选)topic 名实规整:全 7A/7B 已无 fill,"填空"标签 → "短文理解" =====
UPDATE junior_listening_exercises
SET topic = replace(replace(topic,'短文填空','短文理解'),'听写填空','短文理解')
WHERE volume IN ('7A','7B') AND topic LIKE '%填空%';

COMMIT;

-- ===== 校验 =====
-- 1) 6 条重排后答案分布(应不再全同):
SELECT title,
       (SELECT string_agg(q->>'answer','') FROM jsonb_array_elements(questions) q) AS answers
FROM junior_listening_exercises
WHERE id IN ('8dedca0b-5dd4-4357-9f5b-7672028bb4ee','98432f70-3a3a-4bb9-a983-3a62ff26a038',
             '100b13b3-9db1-40fa-bc53-42b450a7851e','343170e3-a3ef-49ad-9721-54056bf173cb',
             '654269bc-290c-409b-9ea8-45a45114c1bf','1de964ae-88ae-4d7e-a6d3-8a30b81bf23b')
ORDER BY title;
-- 2) 确认全 7A/7B 已无"填空"topic(应 0 行):
SELECT count(*) AS fill_topic_left FROM junior_listening_exercises WHERE volume IN ('7A','7B') AND topic LIKE '%填空%';
-- END
