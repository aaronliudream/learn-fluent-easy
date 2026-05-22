-- =====================================================================
-- Gold-standard content for G8 · if 引导的条件状语从句 · If-Conditional (Real)
-- Code: g8.17   Category: clause
-- =====================================================================
-- 中考必考 "主将从现" 经典考点。Covers: real conditional (Type 1),
-- unless = if not, agreement, fixed errors on Chinese-student tests.
-- =====================================================================

UPDATE junior_grammar_points
SET
  summary = '"如果……就……" 的真实条件句 — "主将从现"是中考单选必考的固定考点。',
  hook_line_cn = '"主将从现" 4 个字，背熟它中考这道题稳拿。学会用 unless，作文还能加分。',
  hook_line = 'If + present, will + verb — the single most-tested conditional pattern in Chinese middle-school English.',
  mnemonic = '主句将来时，if 从句一般现在时 — 简称"主将从现"，铁律。',
  content_depth = 3,

  explanation_md = E'## 🎯 一句话搞定\n\n**"如果……（条件）就……（结果）"**  \n→ if 引导的条件状语从句：**条件用一般现在时，结果用将来时**。\n\n---\n\n## 📐 核心公式（铁律：主将从现）\n\n| 部分 | 时态 | 例子 |\n|---|---|---|\n| **从句**（if 引导，表条件） | **一般现在时** | **If it rains tomorrow**, |\n| **主句**（表结果） | **将来时（will / be going to）** | **we will stay at home**. |\n\n**完整句式：**\n- **If + 主语 + 动词（一般现在时）, 主语 + will + 动词原形 .**\n- 主从顺序可以颠倒，颠倒时**逗号去掉**：\n  - **If it rains tomorrow, we will stay at home.**\n  - **We will stay at home if it rains tomorrow.**\n\n> ⚠️ **铁律**：if 从句**绝对不能**用 will！中考改错最高频陷阱。\n\n---\n\n## 🔥 三大用法\n\n### ① 普通条件（用 if）\n- **If you work hard**, you **will succeed**.\n- **If she comes** early, we **will start** the meeting.\n\n### ② 否定条件（用 unless = if not）\n- **Unless you hurry**, you **will miss** the bus.  \n  ↑ 等于 **If you don''t hurry**, you will miss the bus.\n- **I won''t go unless you come with me.**\n\n### ③ 表事实/习惯（主从都用一般现在时）\n- **If you mix red and blue**, you **get** purple.（自然规律）\n- **If I am tired**, I **drink** a cup of coffee.（习惯）\n\n---\n\n## ⏰ 看到这些 = if 条件句\n\n- **if** 引导从句\n- **unless** 引导从句（= if not）\n- **as long as**（只要）/ **provided that**（如果）— 高级表达\n- 主句出现 **will / won''t / be going to**\n- 主从两句之间用**逗号**（从句在前时）\n\n---\n\n## ⚠️ Top 5 易错点（中考批卷红笔常出现）\n\n1. **if 从句用了 will**（最高频错误）：~~If it will rain tomorrow, we will stay home.~~ → **If it rains tomorrow, we will stay home.**\n2. **unless 后又加 not**：~~Unless you don''t come, ...~~ → **Unless you come, ...**（unless 本身已含否定）\n3. **第三人称单数 -s 漏了**：~~If she come early, ...~~ → **If she comes early, ...**\n4. **主句忘了 will**：~~If you work hard, you succeed.~~ → **If you work hard, you will succeed.**（表将来必须有 will）\n5. **从句顺序颠倒时多了逗号**：~~We will stay home, if it rains.~~ → **We will stay home if it rains.**（主句在前不加逗号）\n\n---\n\n## 🧠 三秒判断口诀\n\n> **从句（if 后面）→ 一般现在时**  \n> **主句（结果）→ will + 动词原形**  \n> **unless = if not**（unless 后面别再加 not）',

  immersion_cards = $jsonb$[
    {"situation": "Looking at dark clouds on the way to a picnic", "cn": "如果明天下雨，我们就改去博物馆。", "en": "If it rains tomorrow, we will go to the museum instead."},
    {"situation": "Mom warns you about being late", "cn": "你再不快点，就赶不上公交车了。", "en": "Unless you hurry, you will miss the bus."},
    {"situation": "Promising your friend a study session", "cn": "如果你周六有空，我们一起复习。", "en": "If you are free on Saturday, we will study together."},
    {"situation": "Explaining a deal to your sibling", "cn": "我洗碗，你帮我做作业。", "en": "If you help me with my homework, I will do the dishes."},
    {"situation": "Telling a classmate why you won''t join", "cn": "除非 Lin 也来，否则我不去。", "en": "I won''t go unless Lin comes too."},
    {"situation": "Reassuring your tired mom", "cn": "你早点睡，我来收拾。", "en": "If you go to bed early, I will clean up."}
  ]$jsonb$::jsonb,

  contrast_table = $jsonb$[
    {"lhs": "If it will rain tomorrow, we will stay home.",  "rhs": "If it rains tomorrow, we will stay home."},
    {"lhs": "Unless you don''t hurry, you will be late.",     "rhs": "Unless you hurry, you will be late."},
    {"lhs": "If she come early, we will start.",              "rhs": "If she comes early, we will start."},
    {"lhs": "If you work hard, you succeed.",                  "rhs": "If you work hard, you will succeed."},
    {"lhs": "We will stay home, if it rains.",                 "rhs": "We will stay home if it rains."},
    {"lhs": "If it will be sunny, we will go hiking.",         "rhs": "If it is sunny, we will go hiking."}
  ]$jsonb$::jsonb,

  reflex_cards = $jsonb$[
    {"cn": "如果你迟到，老师会生气。",       "en": "If you are late, the teacher will be angry.",      "keyword": "If you are"},
    {"cn": "明天不下雨我们就去野餐。",       "en": "If it doesn''t rain tomorrow, we will have a picnic.","keyword": "doesn''t rain"},
    {"cn": "你再不开始，就来不及了。",       "en": "Unless you start now, you will be too late.",       "keyword": "Unless you start"},
    {"cn": "如果他明天来，我们就开始。",     "en": "If he comes tomorrow, we will begin.",              "keyword": "he comes"},
    {"cn": "只要你努力，就能进步。",         "en": "As long as you try hard, you will improve.",        "keyword": "As long as"},
    {"cn": "我先去你那儿，再吃饭。",         "en": "If I have time, I will come to your place first.",  "keyword": "If I have time"},
    {"cn": "他们不来我们就不开始。",         "en": "We won''t start unless they come.",                 "keyword": "unless they come"},
    {"cn": "如果你帮我，我请你吃冰激凌。",   "en": "If you help me, I will buy you ice cream.",         "keyword": "If you help me"}
  ]$jsonb$::jsonb,

  situation_drills = $jsonb$[
    {
      "situation": "Your friend wants to plan a Saturday hike.",
      "cn": "周六天气好的话，我们就去爬山。",
      "en": "If the weather is good on Saturday, we will go hiking.",
      "accepted": [
        "If it''s sunny on Saturday, we''ll go hiking.",
        "We''ll go hiking if the weather is nice on Saturday."
      ]
    },
    {
      "situation": "Mom warns you about exam preparation.",
      "cn": "你再不开始复习，下周考试就考不好。",
      "en": "Unless you start reviewing now, you won''t do well in next week''s exam.",
      "accepted": [
        "If you don''t start reviewing now, you won''t do well next week.",
        "You''ll fail the exam next week unless you start reviewing now."
      ]
    },
    {
      "situation": "Negotiating chore distribution with your sibling.",
      "cn": "你帮我洗碗，我就帮你做数学题。",
      "en": "If you help me with the dishes, I will help you with your math.",
      "accepted": [
        "I''ll help you with math if you wash the dishes.",
        "If you do the dishes, I''ll help you with math."
      ]
    },
    {
      "situation": "Explaining why you can''t go to a friend''s party.",
      "cn": "除非妈妈同意，否则我去不了。",
      "en": "I can''t come unless my mom says yes.",
      "accepted": [
        "Unless my mom agrees, I won''t be able to come.",
        "If my mom doesn''t agree, I can''t come."
      ]
    }
  ]$jsonb$::jsonb,

  correction_tasks = $jsonb$[
    {
      "wrong": "If it will rain tomorrow, we will stay at home.",
      "model": "If it rains tomorrow, we will stay at home.",
      "hint":  "if 从句不能用 will",
      "why":   "**主将从现铁律**：if 从句**永远用一般现在时**，主句才用 will。这是中考改错最高频考点。"
    },
    {
      "wrong": "Unless you don''t hurry, you will be late.",
      "model": "Unless you hurry, you will be late.",
      "hint":  "unless 已经含否定",
      "why":   "**unless = if ... not**，本身已经是否定。后面不能再加 don''t，否则双重否定意思变反。"
    },
    {
      "wrong": "If she come early, we will start the meeting.",
      "model": "If she comes early, we will start the meeting.",
      "hint":  "第三人称单数加 -s",
      "why":   "if 从句用一般现在时，主语 she 是**第三人称单数**，动词要加 **-s** → comes。"
    },
    {
      "wrong": "If you study hard, you pass the exam.",
      "model": "If you study hard, you will pass the exam.",
      "hint":  "主句表将来要 will",
      "why":   "主句表示**将来的结果**，必须用 **will + 动词原形**。少了 will，意思就变成现在时的事实陈述了。"
    },
    {
      "wrong": "We will go hiking, if the weather is fine.",
      "model": "We will go hiking if the weather is fine.",
      "hint":  "主句在前不加逗号",
      "why":   "if 从句在主句**后面**时，中间**不加逗号**。只有 if 从句在前时才需要用逗号分隔。"
    },
    {
      "wrong": "If it will be sunny tomorrow, we will go to the park.",
      "model": "If it is sunny tomorrow, we will go to the park.",
      "hint":  "if 从句不能用 will",
      "why":   "同上 — if 从句中的 be 也是一般现在时（is），不能用 will be。"
    }
  ]$jsonb$::jsonb,

  boss_questions = $jsonb$[
    {
      "stem": "If it ___ tomorrow, we ___ a picnic in the park.",
      "option_a": "won''t rain / will have",
      "option_b": "doesn''t rain / will have",
      "option_c": "doesn''t rain / have",
      "option_d": "won''t rain / have",
      "correct_answer": "B",
      "trap": "选 A/D 在 if 从句里用了 won''t — 违反主将从现。选 C 主句漏 will。",
      "why":  "if 从句**一般现在时**（否定 doesn''t rain）+ 主句 **will + 动词原形**（will have）。"
    },
    {
      "stem": "Unless you ___ now, you ___ the deadline.",
      "option_a": "don''t start / will miss",
      "option_b": "start / will miss",
      "option_c": "start / miss",
      "option_d": "won''t start / will miss",
      "correct_answer": "B",
      "trap": "选 A 在 unless 后又加 don''t — 双重否定意思变反。选 C 主句漏 will。选 D 从句用 won''t 也错。",
      "why":  "**unless 已含否定**（= if not），后面用肯定形式 (start) + 主句 will。"
    },
    {
      "stem": "Lin will pass the exam if she ___ harder this term.",
      "option_a": "will study",
      "option_b": "studies",
      "option_c": "studied",
      "option_d": "is studying",
      "correct_answer": "B",
      "trap": "选 A 经典陷阱 — if 从句永远不用 will。选 C/D 时态错。",
      "why":  "主将从现：if 从句一般现在时 + 主语 she 第三人称单数 → **studies**。"
    },
    {
      "stem": "— What will you do if it ___ tomorrow?\n— I ___ at home and read a book.",
      "option_a": "rains / will stay",
      "option_b": "will rain / stay",
      "option_c": "rains / stay",
      "option_d": "will rain / will stay",
      "correct_answer": "A",
      "trap": "选 B/D 在 if 后用了 will rain。选 C 回答漏 will。",
      "why":  "完美的主将从现：if 从句 **rains**（现在时）+ 回答里用 **will stay**（将来时）。"
    }
  ]$jsonb$::jsonb

WHERE code = 'g8.17';


UPDATE junior_grammar_points SET teacher_script = $jsonb$[
  {
    "text": "今天解锁中考必考的**条件状语从句**。一个口诀：**主将从现**，4 个字保你拿满分。",
    "show": "🎯 Today: If + present, will + verb",
    "duration": 9
  },
  {
    "text": "**主将从现** = 主句用**将来时**（will），if 从句用**一般现在时**。看左边和右边的对照。",
    "show": "If + present  ,  will + verb",
    "highlight": "If + present",
    "duration": 10
  },
  {
    "text": "举例：**If it rains tomorrow, we will stay at home.** 即使 tomorrow 是将来，if 从句也用 rains。",
    "show": "If it rains tomorrow, we will stay home.",
    "highlight": "rains",
    "duration": 11
  },
  {
    "text": "**最大坑**：if 从句**永远不能用 will**。这是中考改错的高频送分题。",
    "show": "✗ If it will rain tomorrow ...   ✓ If it rains tomorrow ...",
    "highlight": "rains",
    "duration": 11
  },
  {
    "text": "**unless = if not**。Unless you hurry = If you don''t hurry。用 unless 时**别再加 not**。",
    "show": "Unless you hurry, you will be late.",
    "highlight": "Unless",
    "duration": 11
  },
  {
    "text": "**第三人称单数别忘 -s**：If **she comes** early, we will start. comes 后面有个 s。",
    "show": "If she comes early, ...",
    "highlight": "comes",
    "duration": 10
  },
  {
    "text": "**顺序可以颠倒**：从句在前用逗号；从句在后不加逗号。",
    "show": "If it rains, we''ll stay home.   We''ll stay home if it rains.",
    "highlight": "if it rains",
    "duration": 11
  },
  {
    "text": "口诀就这一个：**主将从现 + unless 不再加 not**。下一关进入真实场景练习。",
    "show": "Next → 6 Real-life Scenarios 📚",
    "duration": 7
  }
]$jsonb$::jsonb
WHERE code = 'g8.17';


DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.17')
  AND sort_order BETWEEN 9000 AND 9099;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.17')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  (
    'If it ___ tomorrow, we ___ the football match.',
    'mcq', 'will rain / cancel', 'rains / will cancel', 'rains / cancel', 'will rain / will cancel', 'B',
    NULL::text[],
    '主将从现：if 从句一般现在时 (rains) + 主句 will + 原形 (will cancel)。',
    NULL::jsonb, NULL, 'conditional_basic', false, 1, 9000
  ),
  (
    'You ___ the bus unless you ___ now.',
    'mcq', 'will miss / hurry', 'miss / hurry', 'will miss / will hurry', 'miss / will hurry', 'A',
    NULL::text[],
    'unless 等于 if not，从句用一般现在时 (hurry)，主句用 will (will miss)。',
    NULL::jsonb, NULL, 'conditional_unless', false, 2, 9001
  ),
  (
    'If she ___ early, we ___ together to the airport.',
    'mcq', 'come / go', 'comes / will go', 'will come / go', 'will come / will go', 'B',
    NULL::text[],
    'if 从句一般现在时 + 第三人称单数加 -s (comes) + 主句 will go。',
    NULL::jsonb, NULL, 'conditional_third_person', false, 2, 9002
  ),
  (
    '— What will you do this weekend?\n— I ___ at home if it ___.',
    'mcq', 'will stay / will rain', 'stay / rains', 'will stay / rains', 'will stay / will rain', 'C',
    NULL::text[],
    '主句答 will stay（将来）+ if 从句 rains（一般现在时）。',
    NULL::jsonb, NULL, 'conditional_dialogue', false, 2, 9003
  ),

  (
    'If you ____ (study) hard, you will pass the exam.',
    'fill', NULL, NULL, NULL, NULL, 'study',
    ARRAY['study']::text[],
    'if 从句一般现在时；主语 you → 动词原形 **study**。',
    NULL::jsonb, NULL, 'conditional_basic', false, 1, 9004
  ),
  (
    'Unless Tom ____ (come) tomorrow, the meeting will be put off.',
    'fill', NULL, NULL, NULL, NULL, 'comes',
    ARRAY['comes']::text[],
    'unless 从句一般现在时 + 第三人称单数 Tom → **comes**。',
    NULL::jsonb, NULL, 'conditional_unless', false, 2, 9005
  ),
  (
    'I ____ (call) you as soon as I get home tonight.',
    'fill', NULL, NULL, NULL, NULL, 'will call',
    ARRAY['will call', '''ll call']::text[],
    'as soon as 也遵循"主将从现"原则；主句用 **will call**。',
    NULL::jsonb, '注意：as soon as 是时间状语从句，规则和 if 一样 — 主句将来，从句现在。', 'conditional_main', false, 2, 9006
  ),

  (
    '改写为 unless 句（保留意思）：  "If you don''t practice every day, you won''t improve."',
    'transform', NULL, NULL, NULL, NULL, 'Unless you practice every day, you won''t improve.',
    ARRAY[
      'Unless you practice every day, you won''t improve.',
      'Unless you practice every day, you will not improve.'
    ]::text[],
    'If ... not = Unless。改写时把 don''t 去掉，换成 Unless。',
    NULL::jsonb, NULL, 'conditional_unless_transform', true, 2, 9007
  ),
  (
    '合并成条件句：  "It may rain tomorrow. We will stay at home in that case."',
    'transform', NULL, NULL, NULL, NULL, 'If it rains tomorrow, we will stay at home.',
    ARRAY[
      'If it rains tomorrow, we will stay at home.',
      'We will stay at home if it rains tomorrow.'
    ]::text[],
    'in that case 提示"在那种情况下" → 用 if 条件句合并；从句一般现在时。',
    NULL::jsonb, NULL, 'conditional_combine', true, 3, 9008
  ),

  (
    '改错：  "If it will be sunny tomorrow, we will go hiking."',
    'correction', NULL, NULL, NULL, NULL, 'If it is sunny tomorrow, we will go hiking.',
    ARRAY[
      'If it is sunny tomorrow, we will go hiking.'
    ]::text[],
    'if 从句不能用 will be，应该用一般现在时 **is**。',
    NULL::jsonb, NULL, 'conditional_no_will_in_if', true, 2, 9009
  ),
  (
    '改错：  "Unless you don''t finish your homework, you can''t watch TV."',
    'correction', NULL, NULL, NULL, NULL, 'Unless you finish your homework, you can''t watch TV.',
    ARRAY[
      'Unless you finish your homework, you can''t watch TV.'
    ]::text[],
    'unless 已含否定，后面用肯定形式 finish，不能加 don''t。',
    NULL::jsonb, NULL, 'conditional_unless_double_negative', true, 2, 9010
  ),

  (
    '把这句话译成英文：如果明天天气好，我们就一起去打篮球。',
    'translation', NULL, NULL, NULL, NULL, 'If the weather is fine tomorrow, we will play basketball together.',
    ARRAY[
      'If the weather is fine tomorrow, we will play basketball together.',
      'If it''s nice tomorrow, we will play basketball together.',
      'We will play basketball together if the weather is good tomorrow.',
      'If the weather is good tomorrow, we''ll play basketball together.'
    ]::text[],
    '考点：① 主将从现 — if 从句 the weather is (现在时) + 主句 will play；② "天气好" 可以是 weather is fine/good/nice。',
    NULL::jsonb, '更地道：If it''s nice / If the weather is good 都自然，避免逐字翻译 "weather is good"。', 'conditional_translation', true, 3, 9011
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
  SELECT id, content_depth INTO v_point_id, v_depth FROM junior_grammar_points WHERE code = 'g8.17';
  IF v_point_id IS NULL THEN
    RAISE EXCEPTION 'Gold-standard migration failed: junior_grammar_points row with code=''g8.17'' does not exist.';
  END IF;
  IF v_depth <> 3 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: content_depth for g8.17 is %, expected 3.', v_depth;
  END IF;
  SELECT count(*) INTO v_q_count
  FROM junior_grammar_questions
  WHERE point_id = v_point_id AND sort_order BETWEEN 9000 AND 9099;
  IF v_q_count <> 12 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: expected 12 questions in 9000-9099 for g8.17, got %.', v_q_count;
  END IF;
  RAISE NOTICE 'Gold-standard migration for g8.17 verified: content_depth=3, % questions seeded.', v_q_count;
END $$;
