-- 7A U1+U4 听力:fill → choice(听理解不考拼写)
-- 整条 questions jsonb 替换。3 条原本均为纯 5 道 fill(无混 choice/judge)。
-- 只改 questions;不动 transcript/audio_url/title。幂等(可重跑,结果一致)。
-- 撇号双写:q 里 speaker''s / Grace''s / Tom''s 共 6 处;options 无撇号。
BEGIN;

-- U1 赵轩的介绍 Meet Zhao Xuan
UPDATE junior_listening_exercises SET questions = '[
  {"q":"What is the speaker''s name?","type":"choice","options":["Zhao Xuan","Zhao Lei","Zhang Xuan"],"answer":"A"},
  {"q":"How old is the speaker?","type":"choice","options":["Eleven","Thirteen","Twelve"],"answer":"C"},
  {"q":"What is the speaker''s favorite subject?","type":"choice","options":["English","History","Maths"],"answer":"B"},
  {"q":"What does the speaker often play after school?","type":"choice","options":["The piano","The drums","The guitar"],"answer":"C"},
  {"q":"What does the speaker want to do with everyone?","type":"choice","options":["Make friends","Play games","Have lunch"],"answer":"A"}
]'::jsonb
WHERE id = 'f574a49b-b366-4281-9e5f-d47756650739';

-- U1 Grace的介绍 Meet Grace
UPDATE junior_listening_exercises SET questions = '[
  {"q":"What is the speaker''s first name?","type":"choice","options":["Gina","Grace","Claire"],"answer":"B"},
  {"q":"Where is the speaker from?","type":"choice","options":["The UK","The USA","Australia"],"answer":"A"},
  {"q":"How old is Grace?","type":"choice","options":["Twelve","Thirty","Thirteen"],"answer":"C"},
  {"q":"What is Grace''s favorite sport?","type":"choice","options":["Football","Basketball","Volleyball"],"answer":"B"},
  {"q":"What pet does Grace have?","type":"choice","options":["A white cat","A white dog","A black cat"],"answer":"A"}
]'::jsonb
WHERE id = 'cb81ca31-35ee-435c-a1e1-5c063a6d6256';

-- U4 Tom的课表 Tom's Timetable
UPDATE junior_listening_exercises SET questions = '[
  {"q":"What is Tom''s favourite day?","type":"choice","options":["Monday","Sunday","Friday"],"answer":"C"},
  {"q":"How many classes does Tom have in the morning?","type":"choice","options":["Three","Four","Five"],"answer":"B"},
  {"q":"What is Tom''s favourite subject?","type":"choice","options":["Maths","English","Science"],"answer":"A"},
  {"q":"What does Tom do in the afternoon?","type":"choice","options":["Play basketball","Read books","Play football"],"answer":"C"},
  {"q":"How does Tom feel about his school life?","type":"choice","options":["Tired","Happy","Boring"],"answer":"B"}
]'::jsonb
WHERE id = '8522c9d1-209e-43df-86d3-428a3573ce18';

COMMIT;

-- ===== 校验 =====
-- 3 条 each n=5 且 n_choice=5:
SELECT id, title,
       jsonb_array_length(questions) AS n,
       (SELECT count(*) FROM jsonb_array_elements(questions) q WHERE q->>'type' = 'choice') AS n_choice
FROM junior_listening_exercises
WHERE volume = '7A' AND unit IN ('U1','U4')
  AND id IN (
    'f574a49b-b366-4281-9e5f-d47756650739',
    'cb81ca31-35ee-435c-a1e1-5c063a6d6256',
    '8522c9d1-209e-43df-86d3-428a3573ce18'
  );

-- 确认这 3 条已无 fill 残留(应返回 0 行):
SELECT id, title
FROM junior_listening_exercises,
     LATERAL jsonb_array_elements(questions) AS q
WHERE id IN (
        'f574a49b-b366-4281-9e5f-d47756650739',
        'cb81ca31-35ee-435c-a1e1-5c063a6d6256',
        '8522c9d1-209e-43df-86d3-428a3573ce18'
      )
  AND q->>'type' = 'fill';
-- END
