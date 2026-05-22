-- =====================================================================
-- Gold-standard content for G8 · 现在进行时 vs 一般现在时
-- Code: g8.02   Category: tense
-- =====================================================================

UPDATE junior_grammar_points
SET
  summary = '"我正在做" vs "我天天做" — 中考阅读区分"此刻"和"常态"的关键时态对比。',
  hook_line_cn = '现在进行 = 此刻；一般现在 = 习惯。看到 now / look / listen 用进行时；看到 every / usually 用一般现在。',
  hook_line = 'be doing (right now) vs do/does (always) — the most-tested present-tense pair in 中考.',
  mnemonic = '此刻正在做 = am/is/are + V-ing；天天经常做 = 动词原形（he/she 加 -s）。',
  content_depth = 3,

  explanation_md = E'## 🎯 一句话搞定\n\n**现在正在发生 / 此刻这一段** → 现在进行时（**be + V-ing**）  \n**习惯 / 常态 / 客观事实** → 一般现在时（**动词原形 / -s**）\n\n---\n\n## 📐 一图秒分两种时态\n\n| 维度 | 现在进行时 | 一般现在时 |\n|---|---|---|\n| **公式** | 主语 + **am/is/are + V-ing** | 主语 + 动词原形（he/she/it + V-s） |\n| **含义** | 此刻 / 这段时间正在做 | 习惯 / 经常 / 客观事实 |\n| **典型信号词** | now, right now, **look!**, **listen!**, at the moment, these days | every day / week, usually, often, always, sometimes |\n| **例子** | She **is reading** now. | She **reads** every day. |\n\n> ⚠️ **铁律**：look! / listen! 开头几乎一定要用进行时。\n\n---\n\n## 🔥 现在进行时的 3 大用法\n\n### ① 此刻正在做\n- **Look!** The kids **are playing** football.\n\n### ② 当前这段时间（不一定此刻）\n- I **am studying** English **these days**.（这段时间）\n\n### ③ 已计划好的将来（少数动词如 go/come/leave）\n- I **am leaving** for Beijing tomorrow.\n\n---\n\n## 🔥 一般现在时的 3 大用法\n\n### ① 习惯 / 经常做\n- He **plays** basketball every weekend.\n\n### ② 客观真理 / 自然规律\n- The earth **goes** around the sun.\n\n### ③ 时刻表（确定的将来事件）\n- The train **leaves** at 7 a.m. tomorrow.\n\n---\n\n## ⏰ 关键信号词清单（背下来 = 拿分）\n\n### 现在进行时信号\n- **now / right now / at the moment / at present**\n- **Look! / Listen! / Be careful!**（祈使开头）\n- **these days / this week / this year**（这段时间）\n- It is + 时刻 + ... is doing（强调那一刻）\n\n### 一般现在时信号\n- **every day / week / month / morning**\n- **usually / often / always / sometimes / seldom / never**\n- **on Mondays / on weekends**\n- 客观事实陈述（无时间状语，描述真理）\n\n---\n\n## ⚠️ Top 5 易错点（中考批卷红笔常出现）\n\n1. **状态动词用进行时**（最致命）：~~I am knowing the answer.~~ → **I know the answer.**（know/like/love/want/have-表所有不用进行时）\n2. **Look! / Listen! 用了一般现在时**：~~Look! He plays football.~~ → **Look! He is playing football.**\n3. **every day 用进行时**：~~He is going to school every day.~~ → **He goes to school every day.**\n4. **第三人称单数 -s 漏了**：~~She play piano every day.~~ → **She plays piano every day.**\n5. **V-ing 拼写错**：~~runing~~ → **running**（双写）；~~comeing~~ → **coming**（去 e）\n\n---\n\n## 🧠 三秒判断口诀\n\n> ① 看时间词：**every / usually / always** → 一般现在；**now / look / these days** → 进行时  \n> ② **状态动词不用进行时**（know/like/want/have...）  \n> ③ 第三人称单数 → 一般现在加 -s；进行时则改 is 不变动词形式',

  immersion_cards = $jsonb$[
    {"situation": "Mom asks where you are during a call", "cn": "我正在做作业。", "en": "I am doing my homework."},
    {"situation": "Telling a friend your daily routine", "cn": "我每天 6:30 起床。", "en": "I get up at 6:30 every day."},
    {"situation": "Pointing out a scene in the park", "cn": "看！那个男孩正在喂鸽子。", "en": "Look! That boy is feeding the pigeons."},
    {"situation": "Talking about a long-term plan", "cn": "我最近在准备中考。", "en": "I am preparing for 中考 these days."},
    {"situation": "Stating a science fact", "cn": "水沸腾时温度是 100 度。", "en": "Water boils at 100 degrees Celsius."},
    {"situation": "Asking a classmate at recess", "cn": "你现在听什么呢？", "en": "What are you listening to right now?"}
  ]$jsonb$::jsonb,

  contrast_table = $jsonb$[
    {"lhs": "I am knowing the answer.",                  "rhs": "I know the answer."},
    {"lhs": "Look! He plays football over there.",        "rhs": "Look! He is playing football over there."},
    {"lhs": "He is going to school every day.",           "rhs": "He goes to school every day."},
    {"lhs": "She play piano every day.",                  "rhs": "She plays piano every day."},
    {"lhs": "They are study English now.",                "rhs": "They are studying English now."},
    {"lhs": "The sun is going around the earth.",         "rhs": "The earth goes around the sun."}
  ]$jsonb$::jsonb,

  reflex_cards = $jsonb$[
    {"cn": "他每天都跑步。",                  "en": "He runs every day.",                            "keyword": "runs every day"},
    {"cn": "她正在弹钢琴。",                  "en": "She is playing the piano.",                     "keyword": "is playing"},
    {"cn": "看！他们正在跳舞。",              "en": "Look! They are dancing.",                       "keyword": "Look! ... are dancing"},
    {"cn": "我妈妈每周三去超市。",            "en": "My mom goes to the supermarket on Wednesdays.", "keyword": "goes ... on Wednesdays"},
    {"cn": "我现在正在看一本好书。",          "en": "I am reading a good book now.",                 "keyword": "am reading ... now"},
    {"cn": "他不喜欢香菜。",                  "en": "He doesn't like coriander.",                    "keyword": "doesn''t like"},
    {"cn": "Lin 这个学期在学法语。",          "en": "Lin is studying French this term.",             "keyword": "is studying ... this term"},
    {"cn": "他们从不迟到。",                  "en": "They never arrive late.",                       "keyword": "never arrive"}
  ]$jsonb$::jsonb,

  situation_drills = $jsonb$[
    {
      "situation": "Phone call from your friend asking what you''re doing.",
      "cn": "我正在帮妈妈洗碗。",
      "en": "I am helping my mom with the dishes.",
      "accepted": [
        "I''m doing the dishes with my mom.",
        "I''m helping my mom wash the dishes."
      ]
    },
    {
      "situation": "Telling a new pen pal about your daily routine.",
      "cn": "我每天 7 点起床，6 点回家。",
      "en": "I get up at 7 every day and come home at 6.",
      "accepted": [
        "Every day I wake up at 7 and get home at 6.",
        "I usually get up at 7 and arrive home around 6."
      ]
    },
    {
      "situation": "Walking your foreign friend through a busy school day.",
      "cn": "看！同学们正在做眼保健操。",
      "en": "Look! The students are doing eye exercises.",
      "accepted": [
        "Look at them — they''re doing eye exercises.",
        "See? They are doing eye exercises now."
      ]
    },
    {
      "situation": "Explaining a change in your study habits this term.",
      "cn": "我这学期每天放学后多学一小时英语。",
      "en": "I am studying English for an extra hour after school every day this term.",
      "accepted": [
        "This term I study an extra hour of English after school every day.",
        "I''ve been doing one extra hour of English daily this term."
      ]
    }
  ]$jsonb$::jsonb,

  correction_tasks = $jsonb$[
    {
      "wrong": "I am knowing the answer to this question.",
      "model": "I know the answer to this question.",
      "hint":  "know 不用进行时",
      "why":   "**know / like / love / want / have（表所有）/ believe** 等**状态动词**不用进行时。"
    },
    {
      "wrong": "Look! He plays basketball over there.",
      "model": "Look! He is playing basketball over there.",
      "hint":  "Look! 开头要进行时",
      "why":   "**Look! / Listen!** 开头几乎一定接进行时（此刻正在发生）。"
    },
    {
      "wrong": "He is going to school every day.",
      "model": "He goes to school every day.",
      "hint":  "every day 是习惯",
      "why":   "**every day = 习惯** → 一般现在时；第三人称单数加 -s → goes。"
    },
    {
      "wrong": "She play piano every day after dinner.",
      "model": "She plays piano every day after dinner.",
      "hint":  "第三人称单数加 -s",
      "why":   "**She** 第三人称单数，一般现在时动词加 **-s** → plays。"
    },
    {
      "wrong": "They are study English in the library now.",
      "model": "They are studying English in the library now.",
      "hint":  "be + V-ing",
      "why":   "**现在进行时公式：be + V-ing**。study → studying（不变 y）。"
    },
    {
      "wrong": "The sun is going around the earth every day.",
      "model": "The earth goes around the sun.",
      "hint":  "客观真理用一般现在时",
      "why":   "**客观真理 / 自然规律**永远用一般现在时；而且常识：是地球绕太阳，不是反过来。"
    }
  ]$jsonb$::jsonb,

  boss_questions = $jsonb$[
    {
      "stem": "Look! The kids ___ in the park.",
      "option_a": "play",
      "option_b": "plays",
      "option_c": "are playing",
      "option_d": "is playing",
      "correct_answer": "C",
      "trap": "选 A/B 没看到 Look! 信号。选 D 主谓不一致（kids 复数用 are）。",
      "why":  "**Look!** 开头 → 进行时；kids 复数 → **are playing**。"
    },
    {
      "stem": "Tom usually ___ to school by bike, but today he ___ a taxi.",
      "option_a": "goes / takes",
      "option_b": "is going / takes",
      "option_c": "goes / is taking",
      "option_d": "is going / is taking",
      "correct_answer": "C",
      "trap": "选 A 第二空错（today 暗示打破常规，此刻）。选 B/D 第一空错。",
      "why":  "**usually = 习惯** → 一般现在时 goes；**today (打破常规)** + 此刻 → 进行时 is taking。"
    },
    {
      "stem": "— What is your mom doing now?\n— She ___ a phone call.",
      "option_a": "makes",
      "option_b": "is making",
      "option_c": "make",
      "option_d": "made",
      "correct_answer": "B",
      "trap": "选 A/C 一般现在时，但 now 提示进行时。",
      "why":  "**now** + 此刻动作 → 进行时 **is making**。"
    },
    {
      "stem": "I ___ that the answer ___ wrong. Let me think again.",
      "option_a": "am thinking / is",
      "option_b": "think / is",
      "option_c": "am thinking / is being",
      "option_d": "think / is being",
      "correct_answer": "B",
      "trap": "选 A/C 把 think（表\"认为\"时）当成动作。选 D be 表状态不用进行时。",
      "why":  "**think 表\"认为\"时是状态动词**，用一般现在时；**is = 状态**，也用一般现在时。"
    }
  ]$jsonb$::jsonb

WHERE code = 'g8.02';


UPDATE junior_grammar_points SET teacher_script = $jsonb$[
  {
    "text": "今天解锁**现在进行 vs 一般现在**。中考阅读高频对比 — 看错时态整段意思都变。",
    "show": "🎯 Today: be doing  vs  do/does",
    "duration": 10
  },
  {
    "text": "**现在进行时** = 此刻正在做。公式：**am/is/are + V-ing**。",
    "show": "She is reading now.",
    "highlight": "is reading",
    "duration": 10
  },
  {
    "text": "**一般现在时** = 习惯 / 经常做。公式：**动词原形**，第三人称单数加 **-s**。",
    "show": "She reads every day.",
    "highlight": "reads",
    "duration": 10
  },
  {
    "text": "**信号词决定时态**：now / Look! / these days → 进行时；every / usually / always → 一般现在。",
    "show": "now / Look! → be V-ing   |   every / usually → V/Vs",
    "highlight": "Look!",
    "duration": 13
  },
  {
    "text": "**铁律 ①**：Look! / Listen! 开头几乎一定是进行时。",
    "show": "Look! He is playing football.",
    "highlight": "is playing",
    "duration": 11
  },
  {
    "text": "**铁律 ②**：状态动词 **know / like / love / want / have（所有）** **不用进行时**！",
    "show": "✗ am knowing   ✓ know",
    "highlight": "know",
    "duration": 12
  },
  {
    "text": "**铁律 ③**：客观真理 / 自然规律永远用一般现在时。The earth **goes** around the sun.",
    "show": "The earth goes around the sun.",
    "highlight": "goes",
    "duration": 11
  },
  {
    "text": "理论讲完。下一关 6 个真实场景。",
    "show": "Next → 6 Real-life Scenarios 📚",
    "duration": 7
  }
]$jsonb$::jsonb
WHERE code = 'g8.02';


DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.02')
  AND sort_order BETWEEN 9000 AND 9099;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.02')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  ('Listen! Mom ___ a song in the kitchen.', 'mcq', 'sings', 'is singing', 'sing', 'sang', 'B',
   NULL::text[], 'Listen! 开头 → 进行时；Mom 单数 → is + V-ing。', '{}'::jsonb, NULL, 'continuous_listen', false, 1, 9000),
  ('My brother ___ basketball every Saturday afternoon.', 'mcq', 'is playing', 'plays', 'play', 'played', 'B',
   NULL::text[], 'every Saturday = 习惯 → 一般现在时；my brother 第三人称单数 → plays。', '{}'::jsonb, NULL, 'simple_present_habit', false, 1, 9001),
  ('I ___ tired right now. I think I need a break.', 'mcq', 'am feeling', 'feel', 'feels', 'am feel', 'B',
   NULL::text[], 'feel 表状态（感觉如何）→ 一般现在时；I → 动词原形 feel。', '{}'::jsonb, NULL, 'state_verb_feel', false, 2, 9002),
  ('Look at those clouds! It ___ rain soon.', 'mcq', 'goes to', 'is going to', 'is going', 'going to', 'B',
   NULL::text[], 'Look + 现有迹象（黑云）→ be going to + 动词原形 = 进行时表将来。', '{}'::jsonb, NULL, 'continuous_evidence', false, 2, 9003),
  ('Tom ____ (read) a comic book in his bedroom right now.', 'fill', NULL, NULL, NULL, NULL, 'is reading',
   ARRAY['is reading']::text[], 'right now → 进行时 is reading。', '{}'::jsonb, NULL, 'continuous_now', false, 1, 9004),
  ('Lin ____ (go) swimming twice a week.', 'fill', NULL, NULL, NULL, NULL, 'goes',
   ARRAY['goes']::text[], 'twice a week = 习惯 → 一般现在；Lin 第三人称 → goes。', '{}'::jsonb, NULL, 'simple_present_third', false, 1, 9005),
  ('The earth ____ (move) around the sun once a year.', 'fill', NULL, NULL, NULL, NULL, 'moves',
   ARRAY['moves']::text[], '客观真理 → 一般现在时；the earth 单数 → moves。', '{}'::jsonb, NULL, 'simple_present_truth', false, 2, 9006),
  ('改写为现在进行时（提示：now）：  "I read an English book."',
   'transform', NULL, NULL, NULL, NULL, 'I am reading an English book now.',
   ARRAY['I am reading an English book now.']::text[], 'read → am reading + now。', '{}'::jsonb, NULL, 'continuous_transform', true, 2, 9007),
  ('改写为一般现在时（提示：every weekend）：  "I am visiting my grandma."',
   'transform', NULL, NULL, NULL, NULL, 'I visit my grandma every weekend.',
   ARRAY['I visit my grandma every weekend.']::text[], 'am visiting → visit + every weekend。', '{}'::jsonb, NULL, 'simple_present_transform', true, 2, 9008),
  ('改错：  "Look! The boy plays the violin so well."',
   'correction', NULL, NULL, NULL, NULL, 'Look! The boy is playing the violin so well.',
   ARRAY['Look! The boy is playing the violin so well.']::text[], 'Look! 开头 → 进行时 is playing。', '{}'::jsonb, NULL, 'continuous_look_error', true, 1, 9009),
  ('改错：  "She is liking her new English teacher very much."',
   'correction', NULL, NULL, NULL, NULL, 'She likes her new English teacher very much.',
   ARRAY['She likes her new English teacher very much.']::text[], 'like 是状态动词，不用进行时 → likes。', '{}'::jsonb, NULL, 'state_verb_like', true, 2, 9010),
  ('把这句话译成英文：我每天 7 点起床，但今天早上我 8 点才起。',
   'translation', NULL, NULL, NULL, NULL, 'I get up at 7 every day, but this morning I got up at 8.',
   ARRAY[
     'I get up at 7 every day, but this morning I got up at 8.',
     'I usually get up at 7, but this morning I got up at 8 instead.',
     'I get up at 7 daily, but today I didn''t get up until 8.'
   ]::text[], '考点：① every day → 一般现在 get up；② this morning + 已发生 → 一般过去 got up。', '{}'::jsonb, '更地道：but this morning 引导对比；didn''t get up until 8 表"直到 8 点才起"。', 'present_vs_past_translation', true, 3, 9011)
) AS q(stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
       accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
       difficulty, sort_order);


DO $$
DECLARE
  v_point_id   uuid;
  v_q_count    int;
  v_depth      int;
BEGIN
  SELECT id, content_depth INTO v_point_id, v_depth FROM junior_grammar_points WHERE code = 'g8.02';
  IF v_point_id IS NULL THEN RAISE EXCEPTION 'Missing g8.02'; END IF;
  IF v_depth <> 3 THEN RAISE EXCEPTION 'g8.02 depth %, expected 3', v_depth; END IF;
  SELECT count(*) INTO v_q_count FROM junior_grammar_questions
    WHERE point_id = v_point_id AND sort_order BETWEEN 9000 AND 9099;
  IF v_q_count <> 12 THEN RAISE EXCEPTION 'g8.02 expected 12 questions, got %', v_q_count; END IF;
  RAISE NOTICE 'g8.02 verified: depth=3, %=12 questions seeded.', v_q_count;
END $$;
