-- =====================================================================
-- Gold-standard content for G8 · 形容词最高级 · Adjective Superlatives
-- Code: g8.09   Category: other
-- =====================================================================
-- the most + adj / -est, in/of ranges, "one of the + 复数" pattern.
-- =====================================================================

UPDATE junior_grammar_points
SET
  summary = '三个或以上的"最 X" — 中考介绍家乡 / 学校 / 名人时高频用法。',
  hook_line_cn = '比较级搞定两个，最高级搞定三个以上。会用 one of the + 最高级 + 复数，作文加分稳。',
  hook_line = 'Superlatives — make any 中考 essay sound impressive ("the most ...", "one of the ...").',
  mnemonic = '最高级 = the + -est / the most；范围用 in（地点/团体）/ of（同类/数量）。',
  content_depth = 3,

  explanation_md = E'## 🎯 一句话搞定\n\n**三个或以上比较，找出"最"** → 用 **the + 形容词最高级 + 范围**。\n\n---\n\n## 📐 最高级怎么变？\n\n| 形容词类型 | 变化规则 | 例子 |\n|---|---|---|\n| 单音节 → 加 **-est** | tall → **the tallest** | He is **the tallest** in our class. |\n| 单音节短元音 + 单辅音 → 双写 + est | big → **the biggest** | Beijing is one of **the biggest** cities in China. |\n| 以 e 结尾 → 加 **-st** | large → **the largest** | The Pacific is **the largest** ocean. |\n| 辅音 + y 结尾 → y 变 i 加 est | easy → **the easiest** | This is **the easiest** problem of all. |\n| 多音节 / 长形容词 → **the most + 原级** | difficult → **the most difficult** | This is **the most difficult** question. |\n| 不规则 → 记 5 组 | good/well → **best**, bad → **worst**, many/much → **most**, little → **least**, far → **farthest/furthest** | She is **the best** singer in our school. |\n\n> ⚠️ **铁律**：最高级前面**几乎永远要 the**！\n\n---\n\n## 🔥 经典句式（中考必考）\n\n### ① 最高级 + in / of\n- **in + 地点 / 团体**：Lin is **the tallest in our class**.\n- **of + 同类 / 数量**：This is **the cheapest of all the phones**.\n\n### ② "one of the + 最高级 + 复数名词"（高分句型）\n- Suzhou is **one of the most beautiful cities** in China.（注意：cities 是**复数**）\n- He is **one of the best students** in our grade.\n\n### ③ 最高级 + that / 关系从句\n- This is **the best movie that I have ever seen**.\n- It''s **the funniest joke I''ve ever heard**.\n\n---\n\n## ⏰ 看到这些 = 最高级\n\n- **the +最高级 + in / of**\n- **one of the + 最高级 + 复数**\n- 句末有 **in our class / in the world / of all**\n- 三个或以上的比较语境\n- 关系从句里有 **that / I have ever ...**\n\n---\n\n## ⚠️ Top 5 易错点（中考批卷红笔常出现）\n\n1. **漏掉 the**：~~He is tallest in our class.~~ → **He is the tallest in our class.**\n2. **two/two 个比较用了最高级**：~~Of the two boys, Tom is the taller.~~ → 两人对比用**比较级**：**Tom is taller**（如果非要用 the taller 也可，但中考更稳的是比较级）\n3. **double 最高级**：~~the most tallest~~ → **the tallest**（只能加 -est 或 most，不能同时）\n4. **one of the + 单数**：~~one of the best student~~ → **one of the best students**（复数 students）\n5. **范围用错**：~~the tallest of our class~~ → **the tallest in our class**（class 是团体 → in）\n\n---\n\n## 🧠 三秒判断口诀\n\n> ① 三个以上比较 → **最高级**（两个用比较级）  \n> ② 最高级前面 → 一律加 **the**  \n> ③ in（地点 / 团体）vs of（同类 / 数量）— class 用 in，all 用 of  \n> ④ **one of the + 最高级 + 复数**（高分句型，必背）',

  immersion_cards = $jsonb$[
    {"situation": "Showing off your hometown to a friend", "cn": "苏州是中国最美的城市之一。", "en": "Suzhou is one of the most beautiful cities in China."},
    {"situation": "Praising the best student in class", "cn": "Lin 是我们班最聪明的学生。", "en": "Lin is the smartest student in our class."},
    {"situation": "Recommending a movie", "cn": "这是我看过的最棒的电影。", "en": "This is the best movie that I have ever seen."},
    {"situation": "Comparing prices in a shop", "cn": "三个里面这一个最便宜。", "en": "This is the cheapest of the three."},
    {"situation": "Reporting weather news", "cn": "今天是这个夏天最热的一天。", "en": "Today is the hottest day of this summer."},
    {"situation": "Talking about a tough exam", "cn": "数学是这学期最难的科目。", "en": "Math is the most difficult subject this term."}
  ]$jsonb$::jsonb,

  contrast_table = $jsonb$[
    {"lhs": "He is tallest in our class.",                    "rhs": "He is the tallest in our class."},
    {"lhs": "Lin is the most tallest in our school.",         "rhs": "Lin is the tallest in our school."},
    {"lhs": "Suzhou is one of the most beautiful city.",      "rhs": "Suzhou is one of the most beautiful cities in China."},
    {"lhs": "He is the tallest of our class.",                "rhs": "He is the tallest in our class."},
    {"lhs": "This is the goodest book I''ve ever read.",       "rhs": "This is the best book I''ve ever read."},
    {"lhs": "Of the two boys, Tom is the tallest.",            "rhs": "Of the two boys, Tom is the taller."}
  ]$jsonb$::jsonb,

  reflex_cards = $jsonb$[
    {"cn": "他是我们班最高的男生。",              "en": "He is the tallest boy in our class.",            "keyword": "the tallest"},
    {"cn": "这是我读过最好的小说。",              "en": "This is the best novel I have ever read.",       "keyword": "the best"},
    {"cn": "她是三个里跳得最远的。",              "en": "She jumped the farthest of the three.",          "keyword": "the farthest of"},
    {"cn": "中国是世界上人口最多的国家之一。",    "en": "China is one of the most populous countries in the world.","keyword": "one of the most"},
    {"cn": "今天是这周最冷的一天。",              "en": "Today is the coldest day of the week.",          "keyword": "the coldest"},
    {"cn": "鲸鱼是世界上最大的动物。",            "en": "The whale is the largest animal in the world.",  "keyword": "the largest ... in"},
    {"cn": "Tom 在班里跑得最快。",                "en": "Tom runs the fastest in our class.",             "keyword": "the fastest"},
    {"cn": "这道题是所有里面最难的。",            "en": "This is the most difficult question of all.",    "keyword": "the most difficult"}
  ]$jsonb$::jsonb,

  situation_drills = $jsonb$[
    {
      "situation": "Showing your hometown to an exchange student.",
      "cn": "苏州是中国最古老的城市之一，已经有 2500 多年历史了。",
      "en": "Suzhou is one of the oldest cities in China, with a history of more than 2,500 years.",
      "accepted": [
        "Suzhou is among the oldest cities in China — it has a 2,500-year history.",
        "With over 2,500 years of history, Suzhou is one of China''s oldest cities."
      ]
    },
    {
      "situation": "Recommending the best dish at a local restaurant.",
      "cn": "这家店的松鼠桂鱼是整个苏州最好吃的。",
      "en": "The squirrel-shaped fish here is the most delicious in all of Suzhou.",
      "accepted": [
        "Their squirrel fish is the best in Suzhou.",
        "The squirrel fish here is the tastiest in all of Suzhou."
      ]
    },
    {
      "situation": "Writing a short essay about a memorable trip.",
      "cn": "去年的西藏之旅是我最难忘的一次经历。",
      "en": "The trip to Tibet last year was the most unforgettable experience of my life.",
      "accepted": [
        "My trip to Tibet last year was the most memorable experience I''ve ever had.",
        "Last year''s Tibet trip is the most unforgettable journey of my life."
      ]
    },
    {
      "situation": "Telling a friend about your favorite teacher.",
      "cn": "Mr. Wang 是我见过最有耐心的英语老师。",
      "en": "Mr. Wang is the most patient English teacher I have ever met.",
      "accepted": [
        "Mr. Wang is the most patient English teacher I''ve ever had.",
        "Of all the English teachers I''ve met, Mr. Wang is the most patient."
      ]
    }
  ]$jsonb$::jsonb,

  correction_tasks = $jsonb$[
    {
      "wrong": "He is tallest boy in our class.",
      "model": "He is the tallest boy in our class.",
      "hint":  "最高级前要 the",
      "why":   "**最高级前面几乎永远要 the**。这是中考批卷最容易扣分的一处。"
    },
    {
      "wrong": "Lin is the most tallest in our school.",
      "model": "Lin is the tallest in our school.",
      "hint":  "double 最高级",
      "why":   "**双重最高级**：tall 是单音节，只能加 -est。不能 most 和 -est 同时用。"
    },
    {
      "wrong": "Suzhou is one of the most beautiful city in China.",
      "model": "Suzhou is one of the most beautiful cities in China.",
      "hint":  "one of the 后接复数",
      "why":   "**one of the + 最高级 + 复数名词** 是固定句型。city 必须改成 **cities**。"
    },
    {
      "wrong": "He is the tallest of our class.",
      "model": "He is the tallest in our class.",
      "hint":  "class 是团体 → in",
      "why":   "**in 接团体 / 地点**（in our class / in China）；**of 接同类 / 数量**（of the three boys / of all）。"
    },
    {
      "wrong": "This is the goodest book I have ever read.",
      "model": "This is the best book I have ever read.",
      "hint":  "good 不规则",
      "why":   "**good → better → best**。是 5 个必背不规则之一。"
    },
    {
      "wrong": "Of the two boys, Tom is the tallest.",
      "model": "Of the two boys, Tom is the taller.",
      "hint":  "两个比较用比较级",
      "why":   "**两个**人事物比较用**比较级**（the taller）；**三个或以上**才用最高级。"
    }
  ]$jsonb$::jsonb,

  boss_questions = $jsonb$[
    {
      "stem": "Mount Everest is ___ mountain in the world.",
      "option_a": "high",
      "option_b": "higher",
      "option_c": "the highest",
      "option_d": "highest",
      "correct_answer": "C",
      "trap": "选 D 漏 the；选 B 是比较级，但全世界范围 → 用最高级。",
      "why":  "最高级前**几乎永远要 the** + 范围 in the world → **the highest**。"
    },
    {
      "stem": "Of all the subjects, math is ___ for me.",
      "option_a": "more difficult",
      "option_b": "the most difficult",
      "option_c": "difficulter",
      "option_d": "most difficult",
      "correct_answer": "B",
      "trap": "选 D 漏 the；选 C 不存在。Of all... 提示最高级语境。",
      "why":  "Of all the subjects = "在所有科目里" → 最高级。difficult 多音节 → **the most difficult**。"
    },
    {
      "stem": "The Great Wall is ___ tourist attractions in China.",
      "option_a": "the most famous",
      "option_b": "one of most famous",
      "option_c": "one of the most famous",
      "option_d": "one of the most famous of",
      "correct_answer": "C",
      "trap": "选 A 漏了 "one of"（语境暗示长城是"之一"）。选 B 漏 the。选 D 多余 of。",
      "why":  "**one of the + 最高级 + 复数名词** 是固定高分句型。tourist attractions 是复数。"
    },
    {
      "stem": "— Who is taller, Lin or her brother?\n— Her brother is ___.",
      "option_a": "the taller",
      "option_b": "taller",
      "option_c": "the tallest",
      "option_d": "tallest",
      "correct_answer": "B",
      "trap": "选 C/D 都用了最高级 — 但**两个人**对比应该用**比较级**。",
      "why":  "**两人对比 → 比较级 taller**。问题里 "Who is taller" 已经用比较级，回答保持一致。"
    }
  ]$jsonb$::jsonb

WHERE code = 'g8.09';


UPDATE junior_grammar_points SET teacher_script = $jsonb$[
  {
    "text": "今天解锁**形容词最高级**。中考介绍家乡、学校、名人的写作题里几乎必用。",
    "show": "🎯 Today: the + -est / the most",
    "duration": 9
  },
  {
    "text": "公式：**the + 最高级 + 范围**。范围用 in（地点/团体）或 of（同类/数量）。",
    "show": "the + adj-est   +   in / of",
    "highlight": "the",
    "duration": 11
  },
  {
    "text": "**单音节加 -est**：tall → tallest, fast → fastest。**最高级前加 the**！",
    "show": "tall → the tallest   fast → the fastest",
    "highlight": "the tallest",
    "duration": 10
  },
  {
    "text": "**双写末辅音**：big → biggest, hot → hottest。**y 变 i 加 est**：easy → easiest, busy → busiest。",
    "show": "big → biggest   easy → easiest",
    "highlight": "biggest",
    "duration": 11
  },
  {
    "text": "**多音节用 most**：difficult → the most difficult, interesting → the most interesting。",
    "show": "the most difficult   the most interesting",
    "highlight": "the most",
    "duration": 10
  },
  {
    "text": "**5 个不规则必背**：good → **best**, bad → worst, many/much → most, little → least, far → farthest。",
    "show": "good → best   bad → worst   many → most",
    "highlight": "best",
    "duration": 12
  },
  {
    "text": "**高分句型**：**one of the + 最高级 + 复数名词**。Suzhou is **one of the most beautiful cities** in China。",
    "show": "one of the most beautiful cities",
    "highlight": "cities",
    "duration": 12
  },
  {
    "text": "**最大坑**：两个人事物对比用**比较级**，不是最高级！下一关进入真实场景练习。",
    "show": "2 → comparative   |   3+ → superlative",
    "highlight": "2 → comparative",
    "duration": 10
  }
]$jsonb$::jsonb
WHERE code = 'g8.09';


DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.09')
  AND sort_order BETWEEN 9000 AND 9099;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.09')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  (
    'The Yangtze is ___ river in China.',
    'mcq', 'long', 'longer', 'the longest', 'longest', 'C',
    NULL::text[],
    '全中国范围 + 最长 → 最高级 + the = **the longest**。',
    NULL::jsonb, NULL, 'superlative_basic', false, 1, 9000
  ),
  (
    'Beijing is one of ___ cities in China.',
    'mcq', 'the bigger', 'big', 'the biggest', 'biggest', 'C',
    NULL::text[],
    '"one of the + 最高级 + 复数" 固定句型 → the biggest。',
    NULL::jsonb, NULL, 'superlative_one_of', false, 2, 9001
  ),
  (
    'Of the three subjects, English is ___ for me.',
    'mcq', 'easier', 'the easier', 'the easiest', 'easiest', 'C',
    NULL::text[],
    '三科目比较 + 最 → the easiest（y → i + est）。',
    NULL::jsonb, NULL, 'superlative_of_three', false, 2, 9002
  ),
  (
    'Who is ___ student in our class? — Lin, I think.',
    'mcq', 'the cleverer', 'cleverest', 'the cleverest', 'more clever', 'C',
    NULL::text[],
    '全班范围 + 最 → 最高级 + the = **the cleverest**。',
    NULL::jsonb, NULL, 'superlative_class', false, 2, 9003
  ),

  (
    'This is ____ (interesting) book I have ever read.',
    'fill', NULL, NULL, NULL, NULL, 'the most interesting',
    ARRAY['the most interesting']::text[],
    'interesting 多音节 → the most interesting。',
    NULL::jsonb, NULL, 'superlative_most', false, 2, 9004
  ),
  (
    'Tom is one of ____ (good) singers in our school.',
    'fill', NULL, NULL, NULL, NULL, 'the best',
    ARRAY['the best']::text[],
    'one of the + best + singers（复数）；good 不规则 → best。',
    NULL::jsonb, NULL, 'superlative_one_of', false, 2, 9005
  ),
  (
    'The bag is ____ (heavy) of all.',
    'fill', NULL, NULL, NULL, NULL, 'the heaviest',
    ARRAY['the heaviest']::text[],
    'heavy（辅音+y）→ heaviest；of all → 用 of。',
    NULL::jsonb, NULL, 'superlative_y_to_i', false, 1, 9006
  ),

  (
    '改写为最高级：  "No other mountain in the world is higher than Mount Everest."',
    'transform', NULL, NULL, NULL, NULL, 'Mount Everest is the highest mountain in the world.',
    ARRAY[
      'Mount Everest is the highest mountain in the world.'
    ]::text[],
    'No other X is + 比较级 + than Y = Y is + 最高级。',
    NULL::jsonb, NULL, 'superlative_transform', true, 2, 9007
  ),
  (
    '改成 one of 句型：  "Suzhou is a very beautiful city in China."',
    'transform', NULL, NULL, NULL, NULL, 'Suzhou is one of the most beautiful cities in China.',
    ARRAY[
      'Suzhou is one of the most beautiful cities in China.'
    ]::text[],
    'one of the + 最高级 + 复数名词；city → cities。',
    NULL::jsonb, NULL, 'superlative_one_of_transform', true, 3, 9008
  ),

  (
    '改错：  "He is tallest student in our class."',
    'correction', NULL, NULL, NULL, NULL, 'He is the tallest student in our class.',
    ARRAY[
      'He is the tallest student in our class.'
    ]::text[],
    '最高级前面必须加 **the**。',
    NULL::jsonb, NULL, 'superlative_missing_the', true, 1, 9009
  ),
  (
    '改错：  "Suzhou is one of the most beautiful city in China."',
    'correction', NULL, NULL, NULL, NULL, 'Suzhou is one of the most beautiful cities in China.',
    ARRAY[
      'Suzhou is one of the most beautiful cities in China.'
    ]::text[],
    '"one of the + 最高级 + **复数**名词"。city → cities。',
    NULL::jsonb, NULL, 'superlative_one_of_plural', true, 2, 9010
  ),

  (
    '把这句话译成英文：长城是世界上最长的人造建筑之一。',
    'translation', NULL, NULL, NULL, NULL, 'The Great Wall is one of the longest man-made structures in the world.',
    ARRAY[
      'The Great Wall is one of the longest man-made structures in the world.',
      'The Great Wall is one of the longest structures built by humans in the world.',
      'The Great Wall is one of the longest man-made buildings in the world.',
      'The Great Wall is among the longest man-made structures in the world.'
    ]::text[],
    '考点：① "之一"= one of the + 最高级 + 复数；② "人造建筑"= man-made structures / buildings；③ 范围"世界上"= in the world。',
    NULL::jsonb, '更地道：用 structures 比 buildings 更准确（长城不是楼）。one of the longest 是中考写作高分句型。', 'superlative_translation', true, 3, 9011
  )
) AS q(stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
       accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
       difficulty, sort_order);


DO $$
DECLARE
  v_point_id   uuid;
  v_q_count    int;
  v_depth      int;
BEGIN
  SELECT id, content_depth INTO v_point_id, v_depth FROM junior_grammar_points WHERE code = 'g8.09';
  IF v_point_id IS NULL THEN
    RAISE EXCEPTION 'Gold-standard migration failed: junior_grammar_points row with code=''g8.09'' does not exist.';
  END IF;
  IF v_depth <> 3 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: content_depth for g8.09 is %, expected 3.', v_depth;
  END IF;
  SELECT count(*) INTO v_q_count
  FROM junior_grammar_questions
  WHERE point_id = v_point_id AND sort_order BETWEEN 9000 AND 9099;
  IF v_q_count <> 12 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: expected 12 questions for g8.09, got %.', v_q_count;
  END IF;
  RAISE NOTICE 'Gold-standard migration for g8.09 verified: content_depth=3, % questions seeded.', v_q_count;
END $$;
