-- =====================================================================
-- Gold-standard content for G8 · how + 形容词 提问
-- Code: g8.15   Category: other
-- =====================================================================

UPDATE junior_grammar_points
SET
  summary = '"How long / How far / How tall / How much..." — 用 how + 形容词询问长度、距离、身高、重量、价格。',
  hook_line_cn = '中考听力 + 完形里"问数据"的题全靠它。一组 8 个 how + adj 搭配，背熟就稳。',
  hook_line = 'How + adj — the question family that 中考 asks about distance, height, age, price.',
  mnemonic = 'How long 时长/长度 · How far 距离 · How tall 人高 · How high 物高 · How much 不可数/价钱 · How many 可数 · How often 频率 · How old 年龄。',
  content_depth = 3,

  explanation_md = E'## 🎯 一句话搞定\n\n**问具体数据**（长度、距离、高度、价钱、数量、年龄...） → 用 **how + 形容词 + 问句**。\n\n---\n\n## 📐 8 大 how + adj 全表（必背）\n\n| 问什么 | 公式 | 例子 | 典型答语 |\n|---|---|---|---|\n| 时长 / 长度 | **How long** | How long is the bridge? | 2 km / 3 hours |\n| 距离 | **How far** | How far is your school? | 5 minutes'' walk |\n| 人身高 | **How tall** | How tall is Yao Ming? | 2.26 m |\n| 建筑/山高 | **How high** | How high is Mount Tai? | 1,545 m |\n| 不可数量 / 价钱 | **How much** | How much is this book? | $5 / 50 yuan |\n| 可数数量 | **How many** | How many books do you have? | Five. |\n| 频率 | **How often** | How often do you exercise? | Twice a week. |\n| 年龄 | **How old** | How old is your sister? | 12. |\n\n> ⚠️ **铁律**：how long 问**时长 / 长度**；how far 问**距离**；how tall 问**人**；how high 问**山 / 建筑**。\n\n---\n\n## 🔥 易混对比（中考最爱考）\n\n### how long vs how far\n- **how long** = 多久 / 多长（时间或物体长度）  \n  → How long is the river?（多长）\n  → How long did you wait?（多久）\n- **how far** = 多远（距离）  \n  → How far is your school from home?\n\n### how tall vs how high\n- **how tall** = 多高（**人 / 树 / 楼**等"立着的"东西，强调高度）  \n  → How tall is your dad?\n- **how high** = 多高（**山 / 建筑物 / 飞高度**，强调离地高度）  \n  → How high is the wall?\n\n### how much vs how many\n- **how much** = 多少钱 / 多少（**不可数名词** + 价钱）  \n  → How much is this shirt? / How much water?\n- **how many** = 多少（**可数名词复数**）  \n  → How many apples?\n\n---\n\n## ⏰ 看到这些 = how + adj 题\n\n- 问句以 **How long / far / tall / high / much / many / often / old** 开头\n- 答语含数字 + 单位（meters / hours / yuan / times）\n- 中考听力对话开头：How long / How much / How old\n\n---\n\n## ⚠️ Top 5 易错点（中考批卷红笔常出现）\n\n1. **how long vs how tall 混用**：~~How long is your father?~~（问身高用 how tall）→ **How tall is your father?**\n2. **how much 问可数**：~~How much apples?~~ → **How many apples?**（可数复数）\n3. **how many 问钱**：~~How many is this bag?~~ → **How much is this bag?**（钱用 how much）\n4. **how far 问时间**：~~How far did you wait?~~ → **How long did you wait?**\n5. **how high 问人**：~~How high are you?~~ → **How tall are you?**（人用 tall）\n\n---\n\n## 🧠 三秒判断口诀\n\n> ① 问**时间 / 物体长度** → how long  \n> ② 问**距离** → how far  \n> ③ 问**人/树/楼的"高"** → how tall；问**山 / 飞行/建筑高度** → how high  \n> ④ 问**钱 / 不可数量** → how much；问**可数量** → how many',

  immersion_cards = $jsonb$[
    {"situation": "Stranger asks about the time spent on a trip", "cn": "你在北京呆了多久？", "en": "How long did you stay in Beijing?"},
    {"situation": "Asking a classmate about the distance to their place", "cn": "你家离学校多远？", "en": "How far is your home from school?"},
    {"situation": "Pediatrician''s height measurement", "cn": "你 13 岁，多高了？", "en": "How tall are you at 13?"},
    {"situation": "Shopping for a backpack", "cn": "这个书包多少钱？", "en": "How much is this backpack?"},
    {"situation": "Asking your foreign friend about their family", "cn": "你妹妹多大了？", "en": "How old is your sister?"},
    {"situation": "Tourist asking about Mount Tai", "cn": "泰山多高？", "en": "How high is Mount Tai?"}
  ]$jsonb$::jsonb,

  contrast_table = $jsonb$[
    {"lhs": "How long is your father?  (想问身高)",         "rhs": "How tall is your father?"},
    {"lhs": "How much apples do you want?",                  "rhs": "How many apples do you want?"},
    {"lhs": "How many is this bag?",                         "rhs": "How much is this bag?"},
    {"lhs": "How far did you wait for the bus?",             "rhs": "How long did you wait for the bus?"},
    {"lhs": "How high are you?  (问人)",                      "rhs": "How tall are you?"},
    {"lhs": "How long is the school from your home?",        "rhs": "How far is the school from your home?"}
  ]$jsonb$::jsonb,

  reflex_cards = $jsonb$[
    {"cn": "你学英语多久了？",                "en": "How long have you been learning English?",      "keyword": "How long have"},
    {"cn": "你家有多远？",                    "en": "How far is your home?",                         "keyword": "How far"},
    {"cn": "Lin 多高？",                      "en": "How tall is Lin?",                              "keyword": "How tall"},
    {"cn": "这条围巾多少钱？",                "en": "How much is this scarf?",                       "keyword": "How much"},
    {"cn": "你有多少本书？",                  "en": "How many books do you have?",                   "keyword": "How many books"},
    {"cn": "你妹妹几岁了？",                  "en": "How old is your sister?",                       "keyword": "How old"},
    {"cn": "你多久去看一次电影？",            "en": "How often do you go to the movies?",            "keyword": "How often"},
    {"cn": "珠穆朗玛峰有多高？",              "en": "How high is Mount Everest?",                    "keyword": "How high"}
  ]$jsonb$::jsonb,

  situation_drills = $jsonb$[
    {"situation": "First-day conversation with a foreign exchange student.", "cn": "你来中国多久了？", "en": "How long have you been in China?", "accepted": ["How long have you stayed in China?", "How long have you been here in China?"]},
    {"situation": "Comparing routes to school with classmates.", "cn": "从你家到学校多远？", "en": "How far is it from your home to school?", "accepted": ["How far is your school from your home?", "What''s the distance from your home to school?"]},
    {"situation": "Shopping for school supplies with Mom.", "cn": "这套笔多少钱？", "en": "How much is this set of pens?", "accepted": ["How much does this pen set cost?", "What''s the price for this set of pens?"]},
    {"situation": "Asking your friend about their family.", "cn": "你弟弟多大了？他多高？", "en": "How old is your brother and how tall is he?", "accepted": ["How old and how tall is your younger brother?", "What''s your brother''s age and height?"]}
  ]$jsonb$::jsonb,

  correction_tasks = $jsonb$[
    {"wrong": "How long is your father?  (想问身高)", "model": "How tall is your father?", "hint": "问人身高用 tall", "why": "**人 / 树 / 楼的身高** → **how tall**；how long 问时长或物体长度。"},
    {"wrong": "How much apples are there in the basket?", "model": "How many apples are there in the basket?", "hint": "apples 是可数复数", "why": "**how many + 可数名词复数**（apples）；how much 配不可数 / 价钱。"},
    {"wrong": "How many is this notebook?", "model": "How much is this notebook?", "hint": "问钱用 how much", "why": "**how much + is/are + 主语** = 多少钱。how many 问数量。"},
    {"wrong": "How far did you study for the exam?", "model": "How long did you study for the exam?", "hint": "问时长用 how long", "why": "**how long** = 多久（时间）；how far 问距离。"},
    {"wrong": "How high are you, Tom?", "model": "How tall are you, Tom?", "hint": "人用 tall", "why": "**人的身高 → how tall**；how high 用于山 / 建筑 / 飞行高度。"},
    {"wrong": "How long is the school from your home?", "model": "How far is the school from your home?", "hint": "from 提示距离", "why": "**距离 → how far**（from X to Y）。"}
  ]$jsonb$::jsonb,

  boss_questions = $jsonb$[
    {"stem": "— ___ is the bridge?\n— About 5 km long.", "option_a": "How tall", "option_b": "How high", "option_c": "How long", "option_d": "How far", "correct_answer": "C",
     "trap": "选 D 问距离不对（5 km long 强调长度而非距离）。", "why": "**5 km long** 是桥的长度 → **how long**。"},
    {"stem": "— ___ is your school from your home?\n— About 15 minutes by bus.", "option_a": "How long", "option_b": "How far", "option_c": "How much", "option_d": "How tall", "correct_answer": "B",
     "trap": "选 A 也能问时间，但 from your home 锁定距离。", "why": "**from X = 距离** → **how far**。"},
    {"stem": "— ___ is this dictionary?\n— 32 yuan.", "option_a": "How many", "option_b": "How much", "option_c": "How long", "option_d": "How big", "correct_answer": "B",
     "trap": "选 A 问可数数量。", "why": "**价钱 = how much**。"},
    {"stem": "— ___ is the Great Wall of China?\n— About 6,700 km long.", "option_a": "How tall", "option_b": "How high", "option_c": "How long", "option_d": "How far", "correct_answer": "C",
     "trap": "选 A/B 都不对（长城是水平长度，不是高度）。",
     "why": "**6,700 km long = 长度** → **how long**。"}
  ]$jsonb$::jsonb

WHERE code = 'g8.15';


UPDATE junior_grammar_points SET teacher_script = $jsonb$[
  {"text": "今天解锁 **how + 形容词** 问句家族。8 个固定搭配中考必考。", "show": "🎯 How + long / far / tall / high / much / many / old / often", "duration": 12},
  {"text": "**how long** = 时长 / 物体长度。How long is the bridge?", "show": "How long = 时长 / 长度", "highlight": "How long", "duration": 11},
  {"text": "**how far** = 距离。How far is your school?", "show": "How far = 距离", "highlight": "How far", "duration": 10},
  {"text": "**how tall** = 人 / 树 / 楼的身高。How tall is Yao Ming?", "show": "How tall = 人 / 树 / 楼", "highlight": "How tall", "duration": 11},
  {"text": "**how high** = 山 / 建筑 / 飞行高度。How high is Mount Tai?", "show": "How high = 山 / 建筑", "highlight": "How high", "duration": 11},
  {"text": "**how much / how many**：钱和不可数用 much；可数用 many。", "show": "how much (钱/不可数)   vs   how many (可数)", "highlight": "how much ... how many", "duration": 12},
  {"text": "**最大坑**：how long 问身高 / how high 问人 — 中考改错最爱挖。", "show": "✗ How long is your dad   ✓ How tall is your dad", "highlight": "How tall", "duration": 12},
  {"text": "下一关进入实战。", "show": "Next → 6 Real-life Scenarios 📚", "duration": 6}
]$jsonb$::jsonb
WHERE code = 'g8.15';


DELETE FROM junior_grammar_questions WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.15') AND sort_order BETWEEN 9000 AND 9099;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.15')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer, accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading, difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.accepted_answers, q.explanation, q.distractors, q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  ('— ___ is this skirt?\n— 99 yuan.', 'mcq', 'How long', 'How many', 'How much', 'How big', 'C', NULL::text[], '99 yuan = 价钱 → how much。', '{}'::jsonb, NULL, 'how_much_price', false, 1, 9000),
  ('— ___ books are there in the bookcase?\n— Over 200.', 'mcq', 'How much', 'How many', 'How long', 'How far', 'B', NULL::text[], 'books 可数复数 → how many。', '{}'::jsonb, NULL, 'how_many_books', false, 1, 9001),
  ('— ___ is the Yellow River?\n— About 5,464 km long.', 'mcq', 'How tall', 'How high', 'How long', 'How far', 'C', NULL::text[], '河流的长度 → how long。', '{}'::jsonb, NULL, 'how_long_river', false, 2, 9002),
  ('— ___ is your father?\n— He is 1.78 m.', 'mcq', 'How long', 'How tall', 'How high', 'How big', 'B', NULL::text[], '人的身高 → how tall。', '{}'::jsonb, NULL, 'how_tall_person', false, 1, 9003),
  ('____ (how, far) is the train station from here?', 'fill', NULL, NULL, NULL, NULL, 'How far', ARRAY['How far']::text[], '问距离 → how far。', '{}'::jsonb, NULL, 'how_far_station', false, 1, 9004),
  ('____ (how, old) was your grandma when she got married?', 'fill', NULL, NULL, NULL, NULL, 'How old', ARRAY['How old']::text[], '问年龄 → how old。', '{}'::jsonb, NULL, 'how_old', false, 1, 9005),
  ('____ (how, much) water do you drink a day?', 'fill', NULL, NULL, NULL, NULL, 'How much', ARRAY['How much']::text[], 'water 不可数 → how much。', '{}'::jsonb, NULL, 'how_much_water', false, 2, 9006),
  ('改写为 how 问句：  "The bridge is about 2 km."', 'transform', NULL, NULL, NULL, NULL, 'How long is the bridge?', ARRAY['How long is the bridge?']::text[], '陈述长度 → How long 问句。', '{}'::jsonb, NULL, 'how_long_transform', true, 2, 9007),
  ('改写为 how 问句：  "My sister is 13 years old."', 'transform', NULL, NULL, NULL, NULL, 'How old is your sister?', ARRAY['How old is your sister?']::text[], '年龄 → How old。', '{}'::jsonb, NULL, 'how_old_transform', true, 1, 9008),
  ('改错：  "How long is your dad? — 1.8 m."', 'correction', NULL, NULL, NULL, NULL, 'How tall is your dad? — 1.8 m.', ARRAY['How tall is your dad? — 1.8 m.']::text[], '问人身高 → how tall。', '{}'::jsonb, NULL, 'how_long_vs_tall', true, 1, 9009),
  ('改错：  "How many is this jacket? — 200 yuan."', 'correction', NULL, NULL, NULL, NULL, 'How much is this jacket? — 200 yuan.', ARRAY['How much is this jacket? — 200 yuan.']::text[], '问钱 → how much。', '{}'::jsonb, NULL, 'how_much_vs_many', true, 1, 9010),
  ('把这句话译成英文：你弟弟多大了？他长多高了？',
   'translation', NULL, NULL, NULL, NULL, 'How old is your brother and how tall is he?',
   ARRAY[
     'How old is your brother and how tall is he?',
     'How old and how tall is your brother?',
     'How old is your little brother? And how tall is he now?'
   ]::text[], '考点：① 年龄 → how old；② 身高 → how tall。', '{}'::jsonb, '更地道：把两个 how 问句连起来用 and；中文"长多高了"暗示成长，用 now 强化。', 'how_translation', true, 3, 9011)
) AS q(stem, question_type, option_a, option_b, option_c, option_d, correct_answer, accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading, difficulty, sort_order);


DO $$
DECLARE v_point_id uuid; v_q_count int; v_depth int;
BEGIN
  SELECT id, content_depth INTO v_point_id, v_depth FROM junior_grammar_points WHERE code = 'g8.15';
  IF v_point_id IS NULL THEN RAISE EXCEPTION 'Missing g8.15'; END IF;
  IF v_depth <> 3 THEN RAISE EXCEPTION 'g8.15 depth %, expected 3', v_depth; END IF;
  SELECT count(*) INTO v_q_count FROM junior_grammar_questions WHERE point_id = v_point_id AND sort_order BETWEEN 9000 AND 9099;
  IF v_q_count <> 12 THEN RAISE EXCEPTION 'g8.15 expected 12 questions, got %', v_q_count; END IF;
  RAISE NOTICE 'g8.15 verified.';
END $$;
