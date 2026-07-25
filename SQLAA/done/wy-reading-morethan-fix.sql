-- 外研社阅读·more than 真比较超前修正(补充,线上)
-- 背景:比较级门原模式 more\s+\w+\s+than 匹配不到 `more` 直接跟 `than` 的写法
--       (worth more than gold / matters more than winning / plays more than he works)。
--       2026-07-25 补 COMP_MORE_THAN 规则后全册回扫揪出这 3 处。
-- 区分:`be more than + 名词`(不只是)是习语已放行,本文件只改真比较。
-- 只 UPDATE 不删不插,保住 id。幂等:旧串不存在时为空操作。
BEGIN;

-- wy7A U3 Sunday with my family [body]
UPDATE public.junior_reading SET
  body = 'Sunday is my favourite day, because I spend it with my family. In the morning, we get up late and have a big breakfast together. My mother makes eggs and bread, and the kitchen smells wonderful. After breakfast, my father and I wash the car. My little brother helps, but he plays with the water and forgets to work! In the afternoon, we often visit my grandparents. Grandma always has sweet fruit for us. In the evening, we watch a film at home. We sit close on the sofa and laugh together. Sunday is not about big things. It is about being close to the people we love. I always want Sunday to go on and on.'
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U3' AND title='Sunday with my family';

-- wy7B U4 How to be a good friend [body+word_count]
UPDATE public.junior_reading SET
  body = 'A good friend is a treasure, so learn to be one. Be kind, and always speak in a gentle way. Listen carefully when your friend talks, and don''t laugh at their mistakes. When your friend is sad, stay close and help. Share your things, and share your time too. Don''t tell your friend''s secrets to anyone. If you quarrel, say sorry first; don''t let a small thing break a good friendship. Remember birthdays, and give a warm smile every day. Be honest, but be kind with the truth. Follow these simple rules, and you will keep your friends for many years. A true friend is like gold.',
  word_count = 111
WHERE publisher='junior_fltrp' AND volume='wy7B' AND unit='U4' AND title='How to be a good friend';

-- wy7B U2 The last runner [questions]
UPDATE public.junior_reading SET
  questions = '[{"q": "Where did Danny run in the race?", "answer": "A", "options": ["At the back, behind everyone.", "At the very front.", "Beside the teacher.", "Off the track."], "explanation": "原文\"ran at the back\"、\"everyone else was far ahead\"。"}, {"q": "What did the people in the playground do near the end?", "answer": "B", "options": ["They laughed at Danny.", "They cheered for Danny.", "They went home.", "They stopped the race."], "explanation": "原文\"Everyone... began to cheer for him\"。"}, {"q": "What is the best main idea of the passage?", "answer": "C", "options": ["Danny was a fast runner.", "Sports day is boring.", "Never giving up is the real success.", "Running is bad for your legs."], "explanation": "结尾点题:坚持完成比第一更重要。"}, {"q": "Why did everyone start to cheer for Danny?", "answer": "D", "options": ["Because he was winning.", "Because he was funny.", "Because the race was over.", "Because they were moved by his refusal to give up."], "explanation": "他不放弃感动了大家;文中未直说,靠推断。"}, {"q": "\"He never gave up\" — \"gave up\" means ____.", "answer": "A", "options": ["stopped trying", "kept running", "fell down", "won the race"], "explanation": "由\"wanted to stop... did not stop\"可推断 give up=放弃、停止努力。"}]'::jsonb
WHERE publisher='junior_fltrp' AND volume='wy7B' AND unit='U2' AND title='The last runner';

-- 断言:三处旧文本必须归零、新文本必须命中
DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM public.junior_reading WHERE publisher='junior_fltrp'
    AND (body LIKE '%more than he works%'
      OR body LIKE '%worth more than gold%'
      OR questions::text LIKE '%matters more than winning%');
  IF n<>0 THEN RAISE EXCEPTION '旧文本仍在 % 行', n; END IF;
  SELECT count(*) INTO n FROM public.junior_reading WHERE publisher='junior_fltrp'
    AND (body LIKE '%and forgets to work%'
      OR body LIKE '%A true friend is like gold%'
      OR questions::text LIKE '%Never giving up is the real success%');
  IF n<>3 THEN RAISE EXCEPTION '新文本命中 % 行,期望 3', n; END IF;
  -- 《The last runner》第3题答案键仍为 C
  SELECT count(*) INTO n FROM public.junior_reading WHERE publisher='junior_fltrp'
    AND volume='wy7B' AND title='The last runner'
    AND questions::text LIKE '%Never giving up is the real success%'
    AND questions::text LIKE '%"answer": "C"%';
  IF n<>1 THEN RAISE EXCEPTION '《The last runner》答案键异常'; END IF;
  RAISE NOTICE 'OK: more than 真比较 3 处已修正,答案键未变';
END $$;

COMMIT;