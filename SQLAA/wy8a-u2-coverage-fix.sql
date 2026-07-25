-- 外研社阅读·wy8A U2 考点承载改造 + wy7B U6 精读去雷同(线上)
-- ① wy8A U2《现在完成时(二)》语法点是 since/for 延续、How long…?、have been to vs gone to,
--    但原四篇泛读两篇 0 考点、全单元 How long / been to / gone to 各 0 处(与 U1 撞题)。
--    改造 2 篇补齐,另 2 篇不动(《Our class》已有 since then/for life)。
-- ② wy7B U6 精读原 as tired as a runner after a long race,与同单元泛读《A day as busy as ever》
--    8-gram 重合 4 处(ngram_similarity.py 扫出),改为 my legs were as heavy as stone。
-- 只 UPDATE 不删不插,保住 id。幂等:整值覆盖。
BEGIN;

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

-- wy7B U6 A trip to the mountains and the sea [body+word_count]
UPDATE public.junior_reading SET
  body = 'Last summer, my family took a long trip. In the first week, we went to the mountains in the west. The air up there was as cool as autumn, even in July. Climbing was not as easy as I thought, and by evening my legs were as heavy as stone. But the view from the top was as beautiful as a painting, and I forgot all my tired feelings. In the second week, we drove to the sea in the east. The beach was as bright as gold under the sun, and the water felt as warm as a bath. My little sister was as happy as a bird; she played in the sand all day. We made a small house of sand together, and the sea slowly took it away, but we only laughed. The sea was not as quiet as the mountains, but it was just as lovely. At night, the stars over the sea looked as many as the lights of a big city. The mountains and the sea were very different, yet each was as wonderful as the other. That trip taught me something: the world is as wide as your dreams, so go and see it.',
  word_count = 200
WHERE publisher='junior_fltrp' AND volume='wy7B' AND unit='U6' AND title='A trip to the mountains and the sea';

-- 断言
DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM public.junior_reading WHERE publisher='junior_fltrp'
    AND (body LIKE '%A new park has opened near the river%'
      OR body LIKE '%I have grown much taller%'
      OR body LIKE '%as tired as a runner%');
  IF n<>0 THEN RAISE EXCEPTION '旧文本仍在 % 行', n; END IF;
  SELECT count(*) INTO n FROM public.junior_reading WHERE publisher='junior_fltrp'
    AND (body LIKE '%has been here since 2019%'
      OR body LIKE '%five centimetres in the last two years%'
      OR body LIKE '%my legs were as heavy as stone%');
  IF n<>3 THEN RAISE EXCEPTION '新文本命中 % 行,期望 3', n; END IF;
  -- U2 独有考点必须落到库里
  SELECT count(*) INTO n FROM public.junior_reading WHERE publisher='junior_fltrp'
    AND volume='wy8A' AND unit='U2' AND body LIKE '%has gone to%' AND body LIKE '%has been to%';
  IF n<>1 THEN RAISE EXCEPTION 'been to / gone to 对比未落库'; END IF;
  SELECT count(*) INTO n FROM public.junior_reading WHERE publisher='junior_fltrp'
    AND volume='wy8A' AND unit='U2' AND (body LIKE '%How long%' OR questions::text LIKE '%How long%');
  IF n<2 THEN RAISE EXCEPTION 'How long 承载不足(% 篇)', n; END IF;
  -- 改题不得动其余答案键
  SELECT count(*) INTO n FROM public.junior_reading WHERE publisher='junior_fltrp'
    AND volume='wy8A' AND title='How our town has changed'
    AND questions::text LIKE '%How long has the new park%' AND questions::text LIKE '%"answer": "A"%';
  IF n<>1 THEN RAISE EXCEPTION '《How our town has changed》首题答案键异常'; END IF;
  RAISE NOTICE 'OK: wy8A U2 考点已补齐,wy7B U6 精读去雷同';
END $$;

COMMIT;