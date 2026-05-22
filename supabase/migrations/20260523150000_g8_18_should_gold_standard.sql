-- =====================================================================
-- Gold-standard content for G8 · should / shouldn''t · Modal: should
-- Code: g8.18   Category: verb
-- =====================================================================
-- Advice modal — the foundation for giving suggestions in 中考 writing.
-- =====================================================================

UPDATE junior_grammar_points
SET
  summary = '"应该……" / "不应该……" — 给建议、提醒、表态度的万能万圣武器，中考写作建议类作文必用。',
  hook_line_cn = '中考"给建议"类作文的核心动词。背熟 4 个固定句型，建议文模板秒拼。',
  hook_line = 'Should — the single most useful modal for any 中考 advice essay.',
  mnemonic = 'should + 动词原形；情态动词无人称变化，疑问句 should 提前。',
  content_depth = 3,

  explanation_md = E'## 🎯 一句话搞定\n\n**应该 / 建议** → 用 **should + 动词原形**；**不应该** → **shouldn''t + 动词原形**。\n\n---\n\n## 📐 核心公式\n\n| 句型 | 公式 | 例子 |\n|---|---|---|\n| 肯定 | 主语 + **should** + 动词原形 | You **should drink** more water. |\n| 否定 | 主语 + **shouldn''t** + 动词原形 | Children **shouldn''t stay up** late. |\n| 一般疑问 | **Should** + 主语 + 动词原形 ? | **Should I bring** an umbrella? |\n| 特殊疑问 | 疑问词 + **should** + 主语 + 动词原形 ? | What **should I do** now? |\n\n> ⚠️ **铁律**：should 是**情态动词** → 后面**永远直接接动词原形**，且**没有人称变化**（he should，不是 he shoulds）。\n\n---\n\n## 🔥 4 大经典用法\n\n### ① 给建议（最常见）\n- You **should eat** more vegetables.\n- You **shouldn''t play** too many games.\n\n### ② 表义务 / 责任\n- Students **should respect** their teachers.\n- We **should help** people in need.\n\n### ③ 表推测 / 应该（"按理应该……"）\n- He **should be** home now.（按理他应该到家了）\n- The book **should be** in the drawer.\n\n### ④ 提出建议 / 询问对方意见\n- **Should we go** to the cinema tonight?\n- **What should I do** about my poor English?\n\n---\n\n## ⏰ 看到这些 = should 题\n\n- 问"我该怎么办" = **What should I do?**\n- 给建议 / 提醒（中考作文里）= **You should ... / You shouldn''t ...**\n- 提建议 / 试探口气 = **Should we / Should I ...?**\n- 客观推测 / 按理应该 = **It should be ...**\n\n---\n\n## 🔥 中考建议作文 5 大模板句\n\n1. **You should + 动词原形**：You **should keep** a positive attitude.\n2. **You shouldn''t + 动词原形**：You **shouldn''t worry** too much.\n3. **It''s a good idea to + 动词原形**：It''s a good idea **to make a plan**.\n4. **Why don''t you + 动词原形 ?**：Why don''t you **join a club**?\n5. **You''d better + 动词原形** (= had better)：You''**d better** sleep earlier.\n\n---\n\n## ⚠️ Top 5 易错点（中考批卷红笔常出现）\n\n1. **should 后加 to**：~~You should to eat fruit.~~ → **You should eat fruit.**\n2. **第三人称单数加 -s**：~~He shoulds come early.~~ → **He should come early.**\n3. **shouldn''t 写成 should not''t**：~~She should not''t go.~~ → **She shouldn''t go.**\n4. **疑问句忘了把 should 提前**：~~You should do what?~~ → **What should you do?**\n5. **否定回答错**：~~No, you should.~~ → **No, you shouldn''t.**\n\n---\n\n## 🧠 三秒判断口诀\n\n> ① 给建议 / 提醒 → **You should / shouldn''t + 动词原形**  \n> ② 疑问句 → **Should + 主语 + 动词原形 ?**  \n> ③ should **后面永远直接接动词原形**，没有人称变化',

  immersion_cards = $jsonb$[
    {"situation": "Friend tells you they''re tired all the time", "cn": "你应该早点睡觉。", "en": "You should go to bed earlier."},
    {"situation": "Mom advises about screen time", "cn": "孩子们不应该一直盯着手机。", "en": "Children shouldn''t stare at their phones all the time."},
    {"situation": "You feel sick and ask Mom for advice", "cn": "我该不该看医生？", "en": "Should I see a doctor?"},
    {"situation": "Encouraging a friend who failed a test", "cn": "你应该再试一次。", "en": "You should try again."},
    {"situation": "Tutor''s top tip for English", "cn": "你应该每天读英文 30 分钟。", "en": "You should read English for 30 minutes every day."},
    {"situation": "Asking peer for help on a homework topic", "cn": "我该怎么提高写作？", "en": "What should I do to improve my writing?"}
  ]$jsonb$::jsonb,

  contrast_table = $jsonb$[
    {"lhs": "You should to eat more fruit.",                "rhs": "You should eat more fruit."},
    {"lhs": "He shoulds come earlier.",                      "rhs": "He should come earlier."},
    {"lhs": "She should not''t play too many games.",         "rhs": "She shouldn''t play too many games."},
    {"lhs": "You should do what about it?",                  "rhs": "What should you do about it?"},
    {"lhs": "— Should I bring an umbrella?\n— No, you should.","rhs": "— Should I bring an umbrella?\n— No, you shouldn''t."},
    {"lhs": "He should goes home now.",                      "rhs": "He should go home now."}
  ]$jsonb$::jsonb,

  reflex_cards = $jsonb$[
    {"cn": "你应该多锻炼。",                  "en": "You should exercise more.",                     "keyword": "should exercise"},
    {"cn": "你不应该熬夜。",                  "en": "You shouldn''t stay up late.",                  "keyword": "shouldn''t stay up"},
    {"cn": "我该穿什么？",                    "en": "What should I wear?",                           "keyword": "What should I wear"},
    {"cn": "孩子们应该尊敬老师。",            "en": "Children should respect their teachers.",       "keyword": "should respect"},
    {"cn": "你最好早点出门。",                "en": "You''d better leave earlier.",                  "keyword": "''d better leave"},
    {"cn": "我该不该告诉妈妈？",              "en": "Should I tell Mom?",                            "keyword": "Should I tell"},
    {"cn": "他不应该撒谎。",                  "en": "He shouldn''t tell lies.",                      "keyword": "shouldn''t tell"},
    {"cn": "学生应该认真听课。",              "en": "Students should listen carefully in class.",    "keyword": "should listen"}
  ]$jsonb$::jsonb,

  situation_drills = $jsonb$[
    {
      "situation": "Your foreign pen pal tells you they want to improve their Chinese fast.",
      "cn": "你应该每天和中国朋友聊天，看一些中文动画。",
      "en": "You should chat with Chinese friends every day and watch some Chinese cartoons.",
      "accepted": [
        "You should talk with Chinese friends daily and watch Chinese cartoons.",
        "Try chatting with Chinese friends and watching Chinese cartoons every day."
      ]
    },
    {
      "situation": "A classmate keeps yawning in math class.",
      "cn": "你不应该熬夜玩游戏，太累了。",
      "en": "You shouldn''t stay up playing games — you''re too tired.",
      "accepted": [
        "You shouldn''t play games so late at night; it''s making you tired.",
        "Stop staying up late playing games — look at you, exhausted."
      ]
    },
    {
      "situation": "You missed a class and ask the teacher how to catch up.",
      "cn": "我应该做些什么来赶上进度？",
      "en": "What should I do to catch up with the class?",
      "accepted": [
        "What can I do to catch up with the others?",
        "How should I catch up on what I missed?"
      ]
    },
    {
      "situation": "Writing a short advice paragraph for younger students about exam prep.",
      "cn": "你应该每天复习半小时，不应该到最后才开始。",
      "en": "You should review for half an hour every day. You shouldn''t leave it until the last minute.",
      "accepted": [
        "Review 30 minutes daily and don''t leave everything until the last minute.",
        "You should review a little every day instead of waiting till the last moment."
      ]
    }
  ]$jsonb$::jsonb,

  correction_tasks = $jsonb$[
    {
      "wrong": "You should to drink more water in summer.",
      "model": "You should drink more water in summer.",
      "hint":  "should 后接动词原形",
      "why":   "**should 是情态动词**，后面**直接接动词原形**（不加 to）。"
    },
    {
      "wrong": "He shoulds finish his homework before dinner.",
      "model": "He should finish his homework before dinner.",
      "hint":  "情态动词无人称变化",
      "why":   "**情态动词没有第三人称单数 -s**。永远是 should，不是 shoulds。"
    },
    {
      "wrong": "She should not''t play games before exams.",
      "model": "She shouldn''t play games before exams.",
      "hint":  "缩写写法",
      "why":   "**should not** 的缩写是 **shouldn''t**（一个撇号），不是 should not''t。"
    },
    {
      "wrong": "You should how to study English better?",
      "model": "How should you study English better?",
      "hint":  "疑问词提前",
      "why":   "**特殊疑问句**：疑问词 (How) 提到句首 + should + 主语 + 动词原形。"
    },
    {
      "wrong": "He should goes to bed earlier on weeknights.",
      "model": "He should go to bed earlier on weeknights.",
      "hint":  "should 后用原形",
      "why":   "**should + 动词原形**。goes 是第三人称单数，必须改回原形 **go**。"
    },
    {
      "wrong": "— Should we leave now? — No, we should.",
      "model": "— Should we leave now? — No, we shouldn''t.",
      "hint":  "否定回答",
      "why":   "**Should + 主语 + ...?** 的肯定回答 = **Yes, sb should**；否定回答 = **No, sb shouldn''t**。"
    }
  ]$jsonb$::jsonb,

  boss_questions = $jsonb$[
    {
      "stem": "— What ___ I do to improve my English?\n— You ___ read more English books.",
      "option_a": "should / should to",
      "option_b": "should / should",
      "option_c": "do / should",
      "option_d": "could / shoulds",
      "correct_answer": "B",
      "trap": "选 A 加 to。选 C 第一空错。选 D shoulds 多 s。",
      "why":  "提问 What should I do；回答 You should + 动词原形 (read)。"
    },
    {
      "stem": "Children ___ stay up too late on weekdays. They have school the next morning.",
      "option_a": "should",
      "option_b": "shouldn''t",
      "option_c": "should to",
      "option_d": "could to",
      "correct_answer": "B",
      "trap": "选 A 意思相反（应该熬夜）— 错。选 C/D 多加 to。",
      "why":  "**shouldn''t + 动词原形** = 不应该。语境第二句给出原因，确认要否定。"
    },
    {
      "stem": "— ___ I tell my mom about the broken vase?\n— Yes, you ___. Honesty is important.",
      "option_a": "Should / should",
      "option_b": "Do / should",
      "option_c": "Should / do",
      "option_d": "Should / shoulds",
      "correct_answer": "A",
      "trap": "选 B 第一空错。选 C 回答错。选 D shoulds 多 s。",
      "why":  "情态动词疑问句 = **Should + 主语 + 动词原形 ?**；肯定回答 = **Yes, you should**。"
    },
    {
      "stem": "She ___ home now — she left work an hour ago.",
      "option_a": "should is",
      "option_b": "should be",
      "option_c": "shoulds be",
      "option_d": "should being",
      "correct_answer": "B",
      "trap": "选 A is 是变形动词。选 C shoulds 多 s。选 D being 用了 ing。",
      "why":  "**should + be**（动词原形）= 按理应该。表"按理推测"。"
    }
  ]$jsonb$::jsonb

WHERE code = 'g8.18';


UPDATE junior_grammar_points SET teacher_script = $jsonb$[
  {
    "text": "今天解锁**should**。中考"给建议"作文的必背动词，三秒搞定它。",
    "show": "🎯 Today: should + 动词原形",
    "duration": 9
  },
  {
    "text": "**核心公式**：主语 + **should / shouldn''t** + 动词原形。情态动词无人称变化。",
    "show": "should + V (原形)",
    "highlight": "should + V",
    "duration": 10
  },
  {
    "text": "**用法 ①** 给建议：You **should drink** more water.（最常考）",
    "show": "You should drink more water.",
    "highlight": "should drink",
    "duration": 10
  },
  {
    "text": "**用法 ②** 表禁止 / 不该：Children **shouldn''t stay up** late.",
    "show": "Children shouldn''t stay up late.",
    "highlight": "shouldn''t stay up",
    "duration": 10
  },
  {
    "text": "**用法 ③** 表客观推测：He **should be** home now.（按理已经到家）",
    "show": "He should be home now.",
    "highlight": "should be",
    "duration": 11
  },
  {
    "text": "**疑问句** Should + 主语 + 动词原形 ?：**Should I tell** Mom?",
    "show": "Should I tell Mom?",
    "highlight": "Should I tell",
    "duration": 10
  },
  {
    "text": "**铁律 ①**：should **后面永远是动词原形**，不加 to，不加 -s。",
    "show": "✗ should to eat   ✗ shoulds   ✓ should eat",
    "highlight": "should eat",
    "duration": 12
  },
  {
    "text": "**写作模板**：You should + 原形 / You shouldn''t + 原形 / Why don''t you + 原形 — 三连建议。",
    "show": "You should ... / You shouldn''t ... / Why don''t you ...",
    "highlight": "You should",
    "duration": 11
  }
]$jsonb$::jsonb
WHERE code = 'g8.18';


DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.18')
  AND sort_order BETWEEN 9000 AND 9099;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.18')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  (
    'You ___ more vegetables and fruits to stay healthy.',
    'mcq', 'should to eat', 'should eat', 'shoulds eat', 'should eats', 'B',
    NULL::text[],
    'should + 动词原形（eat），无人称变化。',
    NULL::jsonb, NULL, 'should_basic', false, 1, 9000
  ),
  (
    'You ___ play computer games for so long every day.',
    'mcq', 'should',  'shouldn''t', 'should to', 'shouldn''t to', 'B',
    NULL::text[],
    '"不应该长时间打游戏"→ shouldn''t + 动词原形。',
    NULL::jsonb, NULL, 'should_negative', false, 1, 9001
  ),
  (
    '___ we walk to the cinema or take a taxi?',
    'mcq', 'Should', 'Are', 'Do', 'Will', 'A',
    NULL::text[],
    '提建议 / 询问对方意见用 Should + 主语 + 动词原形。',
    NULL::jsonb, NULL, 'should_suggestion', false, 1, 9002
  ),
  (
    'It''s already 7:30. Mom ___ home by now.',
    'mcq', 'should is', 'should be', 'shoulds be', 'should being', 'B',
    NULL::text[],
    'should + be（原形）表"按理应该"。',
    NULL::jsonb, NULL, 'should_deduction', false, 2, 9003
  ),

  (
    'Students ____ (respect) their teachers.',
    'fill', NULL, NULL, NULL, NULL, 'should respect',
    ARRAY['should respect']::text[],
    'should + 动词原形。',
    NULL::jsonb, NULL, 'should_obligation', false, 1, 9004
  ),
  (
    'You look pale. You ____ (see) a doctor.',
    'fill', NULL, NULL, NULL, NULL, 'should see',
    ARRAY['should see']::text[],
    '给建议 → You should see ...',
    NULL::jsonb, NULL, 'should_advice', false, 1, 9005
  ),
  (
    'Children ____ (not, play) with fire.',
    'fill', NULL, NULL, NULL, NULL, 'shouldn''t play',
    ARRAY['shouldn''t play', 'should not play']::text[],
    'should not 缩写 shouldn''t + 动词原形。',
    NULL::jsonb, NULL, 'should_negative', false, 2, 9006
  ),

  (
    '改写为 should 句：  "It''s a good idea to go to bed early."',
    'transform', NULL, NULL, NULL, NULL, 'You should go to bed early.',
    ARRAY[
      'You should go to bed early.'
    ]::text[],
    'It''s a good idea to do = You should do。',
    NULL::jsonb, NULL, 'should_advice_transform', true, 2, 9007
  ),
  (
    '改写为否定建议：  "You should play computer games late at night."',
    'transform', NULL, NULL, NULL, NULL, 'You shouldn''t play computer games late at night.',
    ARRAY[
      'You shouldn''t play computer games late at night.'
    ]::text[],
    'should → shouldn''t；其他不变。',
    NULL::jsonb, NULL, 'should_negative_transform', true, 2, 9008
  ),

  (
    '改错：  "You should to drink more water on hot days."',
    'correction', NULL, NULL, NULL, NULL, 'You should drink more water on hot days.',
    ARRAY[
      'You should drink more water on hot days.'
    ]::text[],
    'should + 动词原形（不加 to）。',
    NULL::jsonb, NULL, 'should_no_to', true, 1, 9009
  ),
  (
    '改错：  "He shoulds finish his homework before 10 p.m."',
    'correction', NULL, NULL, NULL, NULL, 'He should finish his homework before 10 p.m.',
    ARRAY[
      'He should finish his homework before 10 p.m.'
    ]::text[],
    '情态动词无人称变化，shoulds 错。',
    NULL::jsonb, NULL, 'should_no_s', true, 2, 9010
  ),

  (
    '把这句话译成英文：你应该多运动，不应该总是坐着玩手机。',
    'translation', NULL, NULL, NULL, NULL, 'You should exercise more and shouldn''t always sit and play with your phone.',
    ARRAY[
      'You should exercise more and shouldn''t always sit and play with your phone.',
      'You should do more exercise and shouldn''t sit playing on your phone all the time.',
      'You should exercise more often and stop sitting and using your phone all day.'
    ]::text[],
    '考点：① should + exercise more（动词原形）；② shouldn''t + always sit + play；③ "玩手机"= play with your phone / use your phone。',
    NULL::jsonb, '更地道：exercise more 比 do more exercises 更自然；play with your phone 比 play your phone 更地道。', 'should_translation', true, 3, 9011
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
  SELECT id, content_depth INTO v_point_id, v_depth FROM junior_grammar_points WHERE code = 'g8.18';
  IF v_point_id IS NULL THEN
    RAISE EXCEPTION 'Gold-standard migration failed: junior_grammar_points row with code=''g8.18'' does not exist.';
  END IF;
  IF v_depth <> 3 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: content_depth for g8.18 is %, expected 3.', v_depth;
  END IF;
  SELECT count(*) INTO v_q_count
  FROM junior_grammar_questions
  WHERE point_id = v_point_id AND sort_order BETWEEN 9000 AND 9099;
  IF v_q_count <> 12 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: expected 12 questions for g8.18, got %.', v_q_count;
  END IF;
  RAISE NOTICE 'Gold-standard migration for g8.18 verified: content_depth=3, % questions seeded.', v_q_count;
END $$;
