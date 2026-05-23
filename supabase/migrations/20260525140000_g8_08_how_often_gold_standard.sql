-- =====================================================================
-- Gold-standard content for G8 · how often + 频率回答
-- Code: g8.08   Category: other
-- =====================================================================

UPDATE junior_grammar_points
SET
  summary = '"How often ...?" — 询问频率的固定句型，回答用 once / twice / three times a week 等。',
  hook_line_cn = '中考听力 + 单选必考：How often 问的是次数，答的是"几次 / 隔几天"。一组固定搭配，背完不丢分。',
  hook_line = 'How often — the question that unlocks half the daily-routine 中考 listening prompts.',
  mnemonic = 'How often + do/does + 主语 + 动词原形 ?  答：once a week / twice a month / X times a year。',
  content_depth = 3,

  explanation_md = E'## 🎯 一句话搞定\n\n**问"多久一次"** → 用 **How often + do/does + 主语 + 动词原形 ?**  \n**回答**用次数 + 单位时间。\n\n---\n\n## 📐 核心公式\n\n| 用法 | 公式 | 例子 |\n|---|---|---|\n| 提问 | **How often + do/does + 主语 + 动词原形 ?** | **How often do you exercise?** |\n| 回答 (次数) | **once / twice / three times / four times + a/an/per + 单位时间** | **Twice a week.** |\n| 回答 (频度副词) | **always / usually / often / sometimes / seldom / never** | **I sometimes go.** |\n| 回答 (间隔) | **every + 时间单位 / every + 数字 + 复数** | **Every Sunday. / Every two weeks.** |\n\n> ⚠️ **铁律**：**once / twice** = 1/2 次（不能说 one time / two times — 不地道）；3 次以上才用 **three / four times**。\n\n---\n\n## 🔥 高频答语清单（必背）\n\n### 频度副词答语\n- **always / usually / often / sometimes / hardly ever / never**\n\n### 次数答语\n- **once a day / week / month / year**（一天/周/月/年一次）\n- **twice a week**（一周两次）\n- **three / four / five times a month**（一个月 N 次）\n\n### 间隔答语\n- **every day / every weekend**（每天 / 每周末）\n- **every other day**（每隔一天）\n- **every two days**（每两天）\n\n### 习惯答语\n- **on Mondays**（每周一）\n- **at weekends / on weekends**\n- **from time to time**（偶尔）\n\n---\n\n## ⏰ 看到这些 = how often 题\n\n- 问句开头 **How often**\n- 答语含 a week / a month / times / every\n- 询问运动 / 阅读 / 看电影 / 上课等习惯频率\n- 中考听力对话开头常用"How often do you ...?"\n\n---\n\n## ⚠️ Top 5 易错点（中考批卷红笔常出现）\n\n1. **how often vs how long 混用**：~~How long do you exercise?~~（多久＝多长时间）→ **How often do you exercise?**（多频繁）\n2. **回答用 one time**：~~one time a week~~ → **once a week**（地道说法）\n3. **a 漏了**：~~twice week~~ → **twice a week**（必须有 a/per）\n4. **every day vs everyday**：副词"每天"是 **every day**（两个词）；形容词"日常的"是 **everyday**（一个词，如 everyday life）\n5. **第三人称问句用 do**：~~How often do she go ...?~~ → **How often does she go ...?**（第三人称用 does）\n\n---\n\n## 🧠 三秒判断口诀\n\n> ① 问"多久一次" → **How often + do/does + 主语 + V 原形 ?**  \n> ② 1 次用 **once**, 2 次用 **twice**, 3+ 次用 **N times**  \n> ③ 必带 **a / per** 接时间单位（a week / per month）',

  immersion_cards = $jsonb$[
    {"situation": "First-day interview at a new gym", "cn": "你多久锻炼一次？", "en": "How often do you exercise?"},
    {"situation": "Telling your teacher about your reading habit", "cn": "我每天读半小时英文。", "en": "I read English for 30 minutes every day."},
    {"situation": "Mom asks about your eye-exercise routine", "cn": "我们每天做两次眼保健操。", "en": "We do eye exercises twice a day."},
    {"situation": "Friend asks about cinema visits", "cn": "我大约一个月去看一次电影。", "en": "I go to the movies about once a month."},
    {"situation": "Talking about a sports star", "cn": "他一周训练 5 次。", "en": "He trains five times a week."},
    {"situation": "Casual chat about junk food", "cn": "我很少吃快餐。", "en": "I hardly ever eat fast food."}
  ]$jsonb$::jsonb,

  contrast_table = $jsonb$[
    {"lhs": "How long do you exercise?  (想问频率)",       "rhs": "How often do you exercise?"},
    {"lhs": "I go to the gym one time a week.",            "rhs": "I go to the gym once a week."},
    {"lhs": "Twice week, I have piano lessons.",            "rhs": "Twice a week, I have piano lessons."},
    {"lhs": "I take everyday a shower.",                    "rhs": "I take a shower every day."},
    {"lhs": "How often do she go swimming?",                "rhs": "How often does she go swimming?"},
    {"lhs": "Three time a month I visit grandma.",          "rhs": "Three times a month I visit grandma."}
  ]$jsonb$::jsonb,

  reflex_cards = $jsonb$[
    {"cn": "你多久去看一次电影？",            "en": "How often do you go to the movies?",            "keyword": "How often"},
    {"cn": "我一周去图书馆两次。",            "en": "I go to the library twice a week.",             "keyword": "twice a week"},
    {"cn": "他多久打一次篮球？",              "en": "How often does he play basketball?",            "keyword": "How often does"},
    {"cn": "她每天都背单词。",                "en": "She memorizes words every day.",                "keyword": "every day"},
    {"cn": "我每月去一次外婆家。",            "en": "I visit my grandma once a month.",              "keyword": "once a month"},
    {"cn": "我几乎从不吃糖。",                "en": "I hardly ever eat candy.",                      "keyword": "hardly ever"},
    {"cn": "我们每隔一天打扫房间。",          "en": "We clean the room every other day.",            "keyword": "every other day"},
    {"cn": "Lin 一年看 50 本书。",            "en": "Lin reads 50 books a year.",                    "keyword": "books a year"}
  ]$jsonb$::jsonb,

  situation_drills = $jsonb$[
    {"situation": "Asking a new classmate about their reading habit.", "cn": "你多久读一本课外书？", "en": "How often do you read an extracurricular book?", "accepted": ["How often do you read a non-textbook book?", "How frequently do you read for fun?"]},
    {"situation": "Telling your tutor how often you practice English speaking.", "cn": "我每天和同学练习 20 分钟英语口语。", "en": "I practice English speaking with classmates for 20 minutes every day.", "accepted": ["Every day I practice English speaking with classmates for 20 min.", "I do 20 minutes of English speaking practice daily with my classmates."]},
    {"situation": "Asking your friend about their weekend exercise.", "cn": "你周末多久去一次健身房？", "en": "How often do you go to the gym on weekends?", "accepted": ["How frequently do you hit the gym on weekends?", "How many times a weekend do you work out at the gym?"]},
    {"situation": "Describing your family movie tradition.", "cn": "我们家每两周看一次电影。", "en": "Our family watches a movie every two weeks.", "accepted": ["My family has a movie night once every two weeks.", "We have a family movie every other week."]}
  ]$jsonb$::jsonb,

  correction_tasks = $jsonb$[
    {"wrong": "How long do you read English every day?  (想问\"多频繁\")", "model": "How often do you read English every day?", "hint": "How often = 频率", "why": "**how long** 问时长（多长时间）；**how often** 问频率（多久一次）。"},
    {"wrong": "I go to the cinema one time a month.", "model": "I go to the cinema once a month.", "hint": "1 次用 once", "why": "**1 次 = once**（不是 one time）；**2 次 = twice**；**3 次以上 = N times**。"},
    {"wrong": "Twice week I have art class.", "model": "Twice a week I have art class.", "hint": "必须有 a", "why": "**twice / once / N times + a/per + 时间**。a 不能省。"},
    {"wrong": "I take everyday a 30-minute walk.", "model": "I take a 30-minute walk every day.", "hint": "every day 是两个词", "why": "**every day**（两个词）= 副词\"每天\"；**everyday**（一个词）= 形容词\"日常的\"。"},
    {"wrong": "How often do she go swimming?", "model": "How often does she go swimming?", "hint": "she 用 does", "why": "**第三人称单数**疑问用 does，不是 do。"},
    {"wrong": "Three time a month I visit my grandma.", "model": "Three times a month I visit my grandma.", "hint": "3 次以上用 times", "why": "**3 次及以上加复数 times**（three times / four times / five times ...）。"}
  ]$jsonb$::jsonb,

  boss_questions = $jsonb$[
    {"stem": "— ___ do you play basketball?\n— Three times a week.", "option_a": "How long", "option_b": "How often", "option_c": "How much", "option_d": "How many", "correct_answer": "B",
     "trap": "选 A 问时长；C 问不可数量；D 问可数数量。答语 Three times a week 锁定频率。", "why": "**回答用 three times a week** 是频率 → 提问用 **How often**。"},
    {"stem": "Tom ___ his teeth ___ a day.", "option_a": "brushes / two times", "option_b": "brush / twice", "option_c": "brushes / twice", "option_d": "is brushing / twice", "correct_answer": "C",
     "trap": "选 A 用 two times（不地道）。选 B 第三人称漏 s。选 D 时态错。", "why": "**Tom 单数 → brushes** + **2 次 = twice**。"},
    {"stem": "— ___ ?\n— I read for half an hour every night.", "option_a": "How long do you read every night?", "option_b": "How often do you read?", "option_c": "When do you read?", "option_d": "Where do you read?", "correct_answer": "A",
     "trap": "选 B 问频率，但答语 half an hour 是时长。", "why": "**答语 for half an hour = 时长** → 提问用 **How long**。"},
    {"stem": "She visits the dentist ___ a year.", "option_a": "twice", "option_b": "two times", "option_c": "two time", "option_d": "second time", "correct_answer": "A",
     "trap": "选 B 不地道（中考标准用 twice）。选 C 漏 s。选 D second 是序数词，意思错。",
     "why": "**2 次的标准地道说法 = twice**。two times 中考不算最佳。"}
  ]$jsonb$::jsonb

WHERE code = 'g8.08';


UPDATE junior_grammar_points SET teacher_script = $jsonb$[
  {"text": "今天解锁 **how often + 频率回答**。中考听力对话开头必考。", "show": "🎯 How often + frequency answers", "duration": 9},
  {"text": "公式：**How often + do/does + 主语 + 动词原形 ?**", "show": "How often do/does + S + V ?", "highlight": "How often", "duration": 10},
  {"text": "**1 次 = once, 2 次 = twice, 3+ 次 = N times**。后面 + a/per + 时间单位。", "show": "once / twice / three times + a week", "highlight": "once / twice", "duration": 12},
  {"text": "**间隔表达**：every day / every other day（每隔一天）/ every two days。", "show": "every other day = 每隔一天", "highlight": "every other day", "duration": 11},
  {"text": "**坑 ①**：how long ≠ how often。how long = 时长；how often = 频率。", "show": "how long (时长) ≠ how often (频率)", "highlight": "≠", "duration": 12},
  {"text": "**坑 ②**：one time → **once**；two times → **twice**（地道说法）。", "show": "✗ one time   ✓ once", "highlight": "once", "duration": 10},
  {"text": "**坑 ③**：every day（两词，副词）≠ everyday（一词，形容词）。", "show": "every day (adv) ≠ everyday (adj)", "highlight": "every day", "duration": 11},
  {"text": "下一关进入实战。", "show": "Next → 6 Real-life Scenarios 📚", "duration": 6}
]$jsonb$::jsonb
WHERE code = 'g8.08';


DELETE FROM junior_grammar_questions WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.08') AND sort_order BETWEEN 9000 AND 9099;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.08')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer, accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading, difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.accepted_answers, q.explanation, q.distractors, q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  ('— ___ do you exercise?\n— Three times a week.', 'mcq', 'How long', 'How often', 'When', 'How much', 'B', NULL::text[], '答语 Three times a week 是频率 → How often。', '{}'::jsonb, NULL, 'how_often_basic', false, 1, 9000),
  ('I go to the gym ___ a week.', 'mcq', 'twice', 'two times', 'two time', 'second', 'A', NULL::text[], '2 次的标准说法 = twice。', '{}'::jsonb, NULL, 'how_often_twice', false, 1, 9001),
  ('— How often ___ Tom ___ piano?\n— Every other day.', 'mcq', 'do / practice', 'does / practices', 'does / practice', 'is / practicing', 'C', NULL::text[], '第三人称 → does + 动词原形。', '{}'::jsonb, NULL, 'how_often_third_person', false, 2, 9002),
  ('She does her eye exercises ___ a day.', 'mcq', 'twice', 'two times', 'every', 'sometime', 'A', NULL::text[], '2 次 = twice + a day。', '{}'::jsonb, NULL, 'how_often_eye_exercises', false, 1, 9003),
  ('How often ____ (do, you, brush) your teeth?', 'fill', NULL, NULL, NULL, NULL, 'do you brush', ARRAY['do you brush']::text[], 'How often + do + 主语 + 动词原形。', '{}'::jsonb, NULL, 'how_often_question', false, 1, 9004),
  ('I read English novels ____ (three, times) a month.', 'fill', NULL, NULL, NULL, NULL, 'three times', ARRAY['three times']::text[], '3 次 = three times（复数）。', '{}'::jsonb, NULL, 'how_often_times', false, 1, 9005),
  ('We have an English class ____ (every, day) at 8 a.m.', 'fill', NULL, NULL, NULL, NULL, 'every day', ARRAY['every day']::text[], 'every day（两词）= 每天。', '{}'::jsonb, NULL, 'how_often_every_day', false, 1, 9006),
  ('用 How often 提问：  "I go swimming twice a week."', 'transform', NULL, NULL, NULL, NULL, 'How often do you go swimming?', ARRAY['How often do you go swimming?']::text[], '把陈述句改成 How often 问句。', '{}'::jsonb, NULL, 'how_often_transform', true, 2, 9007),
  ('改写：用 once 替代 one time。  "I see my cousin one time a year."', 'transform', NULL, NULL, NULL, NULL, 'I see my cousin once a year.', ARRAY['I see my cousin once a year.']::text[], 'one time → once（地道）。', '{}'::jsonb, NULL, 'how_often_once', true, 1, 9008),
  ('改错：  "How long do you exercise? — Three times a week."', 'correction', NULL, NULL, NULL, NULL, 'How often do you exercise? — Three times a week.', ARRAY['How often do you exercise? — Three times a week.']::text[], 'three times a week 是频率，问句应是 How often。', '{}'::jsonb, NULL, 'how_often_vs_how_long', true, 2, 9009),
  ('改错：  "I take everyday a 20-minute walk."', 'correction', NULL, NULL, NULL, NULL, 'I take a 20-minute walk every day.', ARRAY['I take a 20-minute walk every day.']::text[], 'every day（两词）是副词，放句末。everyday（一词）是形容词。', '{}'::jsonb, NULL, 'how_often_every_day_vs_everyday', true, 2, 9010),
  ('把这句话译成英文：你多久和爷爷奶奶视频通话一次？',
   'translation', NULL, NULL, NULL, NULL, 'How often do you have a video call with your grandparents?',
   ARRAY[
     'How often do you have a video call with your grandparents?',
     'How often do you video-chat with your grandparents?',
     'How often do you call your grandparents on video?'
   ]::text[], '考点：① How often + do + 主语 + 动词原形；② "视频通话"= have a video call / video-chat。', '{}'::jsonb, '更地道：have a video call 比 video chat 更正式；video-chat 也接受。', 'how_often_translation', true, 3, 9011)
) AS q(stem, question_type, option_a, option_b, option_c, option_d, correct_answer, accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading, difficulty, sort_order);


DO $$
DECLARE v_point_id uuid; v_q_count int; v_depth int;
BEGIN
  SELECT id, content_depth INTO v_point_id, v_depth FROM junior_grammar_points WHERE code = 'g8.08';
  IF v_point_id IS NULL THEN RAISE EXCEPTION 'Missing g8.08'; END IF;
  IF v_depth <> 3 THEN RAISE EXCEPTION 'g8.08 depth %, expected 3', v_depth; END IF;
  SELECT count(*) INTO v_q_count FROM junior_grammar_questions WHERE point_id = v_point_id AND sort_order BETWEEN 9000 AND 9099;
  IF v_q_count <> 12 THEN RAISE EXCEPTION 'g8.08 expected 12 questions, got %', v_q_count; END IF;
  RAISE NOTICE 'g8.08 verified.';
END $$;
