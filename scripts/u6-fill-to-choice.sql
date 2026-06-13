-- 7A U6 听力:fill → choice(听理解不考拼写)
-- 整条 questions jsonb 替换。4 条原本均为纯 4 道 fill(无混 choice/judge)。
-- 只改 questions;不动 transcript/audio_url/title。幂等(可重跑,结果一致)。
-- 撇号:仅 Oliver 两道 q 含 Oliver's → SQL 内双写 Oliver''s;options 无撇号。
BEGIN;

-- Chloe的早晨 Chloe's Morning
UPDATE junior_listening_exercises SET questions = '[
  {"q":"What time does Chloe wake up on Saturdays?","type":"choice","options":["7:00 AM","7:30 AM","8:30 AM"],"answer":"B"},
  {"q":"What does Chloe eat for breakfast?","type":"choice","options":["Eggs and fruit","Bread and milk","Bread and fruit"],"answer":"C"},
  {"q":"Where does Chloe go running with her dog?","type":"choice","options":["In the park","On the street","In the garden"],"answer":"A"},
  {"q":"What time does Chloe get back home?","type":"choice","options":["9:30 AM","9:00 AM","8:00 AM"],"answer":"B"}
]'::jsonb
WHERE id = '7342c38f-7499-454a-8e01-d269f3a6520f';

-- Peter的一天 Peter's Day
UPDATE junior_listening_exercises SET questions = '[
  {"q":"What time does Peter start his homework?","type":"choice","options":["4:30 PM","5:00 PM","4:00 PM"],"answer":"C"},
  {"q":"What time does Peter eat dinner with his family?","type":"choice","options":["6:30 PM","6:00 PM","7:30 PM"],"answer":"A"},
  {"q":"What does Peter like to do after dinner?","type":"choice","options":["Watch TV","Read books","Play games"],"answer":"B"},
  {"q":"What time does Peter go to bed?","type":"choice","options":["8:30 PM","10:00 PM","9:30 PM"],"answer":"C"}
]'::jsonb
WHERE id = '8e2f33ec-ea31-4561-9a63-642f85a59917';

-- Sarah的傍晚 Sarah's Evening
UPDATE junior_listening_exercises SET questions = '[
  {"q":"What time does Sarah finish her dinner?","type":"choice","options":["6:45 PM","6:15 PM","7:45 PM"],"answer":"A"},
  {"q":"What does Sarah help her parents do after dinner?","type":"choice","options":["Cook the food","Clean the floor","Wash the dishes"],"answer":"C"},
  {"q":"What instrument does Sarah play?","type":"choice","options":["The guitar","The piano","The drums"],"answer":"B"},
  {"q":"What time does Sarah get into bed?","type":"choice","options":["9:15 PM","8:15 PM","9:50 PM"],"answer":"A"}
]'::jsonb
WHERE id = '0109fcb1-6ab1-4f6e-8403-8d36f8f004d2';

-- Oliver的一天 Oliver's Day
UPDATE junior_listening_exercises SET questions = '[
  {"q":"What time does Oliver take the school bus?","type":"choice","options":["7:50 AM","7:15 AM","8:15 AM"],"answer":"B"},
  {"q":"What time do Oliver''s morning classes end?","type":"choice","options":["11:15 AM","12:45 PM","11:45 AM"],"answer":"C"},
  {"q":"What is Oliver''s favorite subject?","type":"choice","options":["History","Music","English"],"answer":"A"},
  {"q":"Which club does Oliver go to after school?","type":"choice","options":["The art club","The chess club","The music club"],"answer":"B"}
]'::jsonb
WHERE id = 'f5bf0686-fd75-43eb-b8bc-bd4d7f1f313e';

COMMIT;

-- ===== 校验 =====
-- 1) 4 条都还是 4 道题:
SELECT id, title, jsonb_array_length(questions) AS n_q
FROM junior_listening_exercises
WHERE volume = '7A' AND unit = 'U6'
ORDER BY title;

-- 2) 抽 Chloe 看 type 全是 choice、有 options、answer 是字母:
SELECT q->>'q' AS question, q->>'type' AS type,
       jsonb_array_length(q->'options') AS n_opt, q->>'answer' AS answer
FROM junior_listening_exercises,
     LATERAL jsonb_array_elements(questions) AS q
WHERE id = '7342c38f-7499-454a-8e01-d269f3a6520f';

-- 3) 确认 U6 已无 fill 残留(应返回 0 行):
SELECT id, title
FROM junior_listening_exercises,
     LATERAL jsonb_array_elements(questions) AS q
WHERE volume = '7A' AND unit = 'U6' AND q->>'type' = 'fill';
-- END
