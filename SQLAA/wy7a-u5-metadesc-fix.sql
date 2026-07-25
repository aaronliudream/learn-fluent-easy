-- 外研社七上 wy7A U5·补修(coverage-batch 治不到的部分)
-- ★为什么需要这个文件★
--   coverage-batch 对《My little seed》用 `AND word_count=116` 消歧(该单元同名两篇:
--   精读 193 词 / 泛读 116 词)。但 word_count **正是这条 UPDATE 要改的字段** ——
--   旧版跑过后 DB 已变 118,修正版的 WHERE 再也匹配不到,对该行完全失效(非幂等)。
--   本文件改用 **difficulty** 消歧(精读 0 / 泛读 1),该字段不被 UPDATE 改动,真幂等。
-- 另含:U5 四篇的中文元描述(topic 与第3题解析)原标『一般现在时』,与改后的将来时正文矛盾,一并修正。
-- 只 UPDATE 不删不插。
BEGIN;

-- wy7A U5 My little seed [整值·difficulty 消歧]
UPDATE public.junior_reading SET
  body = 'This spring, I have a little seed, and I am going to grow it. First, I will put some soft soil in a small pot. Then I am going to make a little hole and put the seed inside. I will cover it gently with soil and give it a little water. Every day, I will put the pot near the window, so it can get the warm sun. Will it grow fast? No, it will not. At first, nothing will happen, and I will feel worried. But one morning, a tiny green leaf will come out of the soil! Plants need sun, water, soil and care. This little seed is going to teach me to be patient.',
  topic = '我的小种子(一般将来时)',
  questions = '[{"q": "Where does the writer put the pot every day?", "answer": "C", "options": ["Under the bed.", "In a dark box.", "Near the window for warm sun.", "Outside in the rain."], "explanation": "''I will put the pot near the window, so it can get the warm sun''。"}, {"q": "What do plants need to grow?", "answer": "D", "options": ["Only water.", "Only sun.", "Nothing at all.", "Sun, water, soil and care."], "explanation": "''plants need sun, water, soil and care''。"}, {"q": "What is the passage mainly about?", "answer": "A", "options": ["How the writer plans to grow a seed and learn patience.", "How to buy a pot.", "Why windows are warm.", "Where the soil is."], "explanation": "全文讲计划种下一粒种子(将来时)。"}]'::jsonb,
  word_count = 118
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U5'
  AND title='My little seed' AND difficulty=1;

-- wy7A U5 Our school garden [整值·difficulty 消歧]
UPDATE public.junior_reading SET
  body = 'Our school has a small but lovely garden. Every class takes care of one part of it. Next term, we are going to grow more vegetables and flowers. Every week, we water the plants and pull out the weeds. In spring, we are going to plant new seeds. In summer, the garden will be green and full of life. Bees and butterflies will come to the flowers. In autumn, we will pick the vegetables and share them with our teachers. Are you going to join us? The garden will not look after itself, but with our hands it will grow well. This little green corner will make our school a lovely place.',
  topic = '我们的校园菜园(一般将来时)',
  questions = '[{"q": "What do the students do every week in the garden?", "answer": "B", "options": ["Pick vegetables.", "Water the plants and pull out the weeds.", "Plant new trees.", "Catch butterflies."], "explanation": "''Every week, we water the plants and pull out the weeds''。"}, {"q": "What will the students do with the vegetables in autumn?", "answer": "A", "options": ["Share them with the teachers.", "Sell them.", "Keep them all.", "Throw them away."], "explanation": "''we will pick the vegetables and share them with our teachers''。"}, {"q": "What is the passage mainly about?", "answer": "B", "options": ["How to catch bees.", "The school garden and what students learn from it.", "Why summer is green.", "Where the school is."], "explanation": "全文讲校园菜园的打算(将来时)。"}]'::jsonb,
  word_count = 112
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U5'
  AND title='Our school garden' AND difficulty=1;

-- wy7A U5 How plants live [整值·difficulty 消歧]
UPDATE public.junior_reading SET
  body = 'Plants are living things, just like animals. They need four things to live: sun, water, air and soil. The sun gives them light and warmth. Water and soil give them food. Air helps them breathe. Green leaves are very important. They take in light from the sun and make food for the whole plant. Roots grow down into the soil. They hold the plant in place and drink water. Plants are very useful to us. Will our world be green in the future? It will not, if we forget them. Next month, our class is going to plant ten young trees. We will take good care of every tree and flower.',
  topic = '植物如何生活(科普·结尾用将来时)',
  questions = '[{"q": "What do green leaves do?", "answer": "C", "options": ["Hold the plant in place.", "Drink water from the soil.", "Take in light and make food.", "Give the plant air."], "explanation": "''They take in light from the sun and make food''。"}, {"q": "What do the roots do?", "answer": "D", "options": ["Make food.", "Take in light.", "Clean the air.", "Hold the plant in place and drink water."], "explanation": "''They hold the plant in place and drink water''。"}, {"q": "What is the passage mainly about?", "answer": "C", "options": ["How to grow fruit.", "Why leaves are green only.", "How plants live and why they are useful.", "Where roots go."], "explanation": "全文讲植物如何生活,结尾展望将来(将来时)。"}]'::jsonb,
  word_count = 111
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U5'
  AND title='How plants live' AND difficulty=1;

-- wy7A U5 Green is life [整值·difficulty 消歧]
UPDATE public.junior_reading SET
  body = 'Look around you. Green is everywhere in nature. Trees, grass and leaves are all green. Green is the colour of life. Plants make our world fresh and beautiful. On a hot day, a big tree gives us cool shade. Birds build their homes in the trees. But some people cut down trees and throw rubbish on the grass. Will our parks stay green? They will not, if this goes on. Next spring, our school is going to plant a hundred young trees. We are going to keep our parks clean too. If we all care for nature, the earth will stay green and full of life.',
  topic = '绿色就是生命(一般将来时)',
  questions = '[{"q": "What does a big tree give us on a hot day?", "answer": "B", "options": ["Warm air.", "Cool shade.", "Sweet fruit.", "Bright light."], "explanation": "''a big tree gives us cool shade''。"}, {"q": "What do some people do that is bad for the world?", "answer": "D", "options": ["Plant more trees.", "Keep parks clean.", "Water the plants.", "Cut down trees and throw rubbish."], "explanation": "''some people cut down trees and throw rubbish on the grass''。"}, {"q": "What is the passage mainly about?", "answer": "A", "options": ["Why green plants are important and how to protect them.", "How to build a bird''s home.", "Why trees are tall.", "Where the park is."], "explanation": "全文讲绿色即生命与将来的行动(将来时)。"}]'::jsonb,
  word_count = 106
WHERE publisher='junior_fltrp' AND volume='wy7A' AND unit='U5'
  AND title='Green is life' AND difficulty=1;

-- 断言
DO $$
DECLARE n int;
BEGIN
  -- 四篇泛读必须都是将来时叙事
  SELECT count(*) INTO n FROM public.junior_reading WHERE publisher='junior_fltrp'
    AND volume='wy7A' AND unit='U5' AND difficulty=1
    AND body LIKE '%will %' AND body LIKE '%going to%';
  IF n<>4 THEN RAISE EXCEPTION 'U5 泛读将来时双形式仅 % 篇,期望4', n; END IF;
  -- 《My little seed》泛读必须是改后文本(此前 word_count 消歧失效的那一篇)
  SELECT count(*) INTO n FROM public.junior_reading WHERE publisher='junior_fltrp'
    AND volume='wy7A' AND unit='U5' AND title='My little seed' AND difficulty=1
    AND body LIKE '%I am going to grow it%' AND word_count=118;
  IF n<>1 THEN RAISE EXCEPTION '《My little seed》泛读未更新到位'; END IF;
  -- 精读那篇不得被误改
  SELECT count(*) INTO n FROM public.junior_reading WHERE publisher='junior_fltrp'
    AND volume='wy7A' AND unit='U5' AND title='My little seed' AND difficulty=0 AND word_count=193;
  IF n<>1 THEN RAISE EXCEPTION '《My little seed》精读被误改'; END IF;
  -- 中文元描述不得再标『现在时』
  SELECT count(*) INTO n FROM public.junior_reading WHERE publisher='junior_fltrp'
    AND volume='wy7A' AND unit='U5' AND difficulty=1
    AND (topic LIKE '%一般现在时%' OR questions::text LIKE '%(现在时)%');
  IF n<>0 THEN RAISE EXCEPTION '仍有 % 篇中文元描述标现在时', n; END IF;
  RAISE NOTICE 'OK: wy7A U5 四篇整值 + 中文元描述已修正';
END $$;

COMMIT;