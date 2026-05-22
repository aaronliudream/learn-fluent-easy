-- =====================================================================
-- Gold-standard content for G8 · 邀请与建议 · Invitations & Suggestions
-- Code: g8.16   Category: other
-- =====================================================================
-- 5 patterns: Would you like / Why don''t / How about / Let''s / Shall we.
-- Top trap: How about + V-ing (about is a preposition!).
-- =====================================================================

UPDATE junior_grammar_points
SET
  summary = '"一起去 / 不如 / 要不要" — 5 个邀请和建议的固定句型，中考口语 / 写作必用。',
  hook_line_cn = '中考口语 + 写作的"邀请万能套件"：Would you like / Why don''t you / How about / Let''s / Shall we。背完写作不卡壳。',
  hook_line = 'The 5 invitation patterns that make any 中考 dialogue sound natural.',
  mnemonic = 'Would you like + to do · Why don''t you + 动词原形 · How about + V-ing · Let''s + 动词原形 · Shall we + 动词原形。',
  content_depth = 3,

  explanation_md = E'## 🎯 一句话搞定\n\n**邀请或建议某人做某事** → 5 个固定句型任选一个。注意每个后面接的形式**不一样**！\n\n---\n\n## 📐 5 大固定句型（必背）\n\n| 句型 | 后面接什么 | 例子 |\n|---|---|---|\n| **Would you like + to do ?** | **to + 动词原形** | **Would you like to come** to my party? |\n| **Why don''t you + 动词原形 ?** | **动词原形** | **Why don''t you join** us? |\n| **Why not + 动词原形 ?** | **动词原形** | **Why not play** basketball? |\n| **How about + V-ing ?** | **V-ing**（about 是介词）| **How about going** to the cinema? |\n| **What about + V-ing ?** | **V-ing** | **What about having** noodles? |\n| **Let''s + 动词原形** | **动词原形** | **Let''s go** to the park. |\n| **Shall we + 动词原形 ?** | **动词原形** | **Shall we leave** now? |\n\n> ⚠️ **铁律 ①**：How about / What about 后面只能跟 **V-ing** 或**名词**（about 是介词）！  \n> ⚠️ **铁律 ②**：Why don''t you / Why not 后面接**动词原形**！\n\n---\n\n## 🔥 邀请 vs 建议：怎么选？\n\n- **邀请**（提供机会让对方做某事）：Would you like ...? / Let''s ... \n- **建议 / 提议**（想到一个主意）：Why don''t you ...? / How about ...? / Why not ...?\n- **试探口气**（征求意见）：Shall we ...?\n\n---\n\n## 📚 完整对话模板（中考口语高分）\n\n```\nA: How about going to the cinema this Saturday?\nB: Sounds great! What about meeting at 2 p.m.?\nA: OK, let''s meet at 2.\nB: Shall we invite Lin to come along?\nA: Sure! Why don''t you ask her now?\n```\n\n---\n\n## ⏰ 应对邀请的标准答语\n\n- **接受**：That sounds good. / Sure, I''d love to. / Why not? / Sounds great!\n- **拒绝**（礼貌）：I''d love to, but I have to ... / Sorry, but I''m busy. / Maybe next time.\n\n---\n\n## ⚠️ Top 5 易错点（中考批卷红笔常出现）\n\n1. **How about 后接动词原形**：~~How about go swimming?~~ → **How about going swimming?**（about 是介词）\n2. **Why don''t you 后接 to do**：~~Why don''t you to play chess?~~ → **Why don''t you play chess?**（后接动词原形）\n3. **Why not 多了 to**：~~Why not to play chess?~~ → **Why not play chess?**\n4. **Would you like 后省 to**：~~Would you like come?~~ → **Would you like to come?**\n5. **Let''s 后接 doing**：~~Let''s going home.~~ → **Let''s go home.**\n\n---\n\n## 🧠 三秒判断口诀\n\n> ① **Would you like** + **to do**（接不定式）  \n> ② **How about / What about** + **V-ing**（about 是介词）  \n> ③ **Why don''t you / Why not / Let''s / Shall we** + **动词原形**（不带 to）',

  immersion_cards = $jsonb$[
    {"situation": "Inviting a classmate to your birthday party", "cn": "你愿意来我的生日派对吗？", "en": "Would you like to come to my birthday party?"},
    {"situation": "Suggesting a weekend movie to a friend", "cn": "周六我们一起去看电影怎么样？", "en": "How about going to the movies on Saturday?"},
    {"situation": "Trying to cheer up a tired friend", "cn": "你为什么不出去散散步呢？", "en": "Why don''t you go out for a walk?"},
    {"situation": "Making a quick plan with classmates after class", "cn": "我们一起去操场打球吧。", "en": "Let''s go to the playground and play ball."},
    {"situation": "Politely asking if you should head out", "cn": "我们现在出发好吗？", "en": "Shall we leave now?"},
    {"situation": "Proposing a study session to a study group", "cn": "周日下午一起复习数学怎么样？", "en": "What about reviewing math together on Sunday afternoon?"}
  ]$jsonb$::jsonb,

  contrast_table = $jsonb$[
    {"lhs": "How about go swimming this weekend?",          "rhs": "How about going swimming this weekend?"},
    {"lhs": "Why don''t you to play chess with me?",          "rhs": "Why don''t you play chess with me?"},
    {"lhs": "Why not to play basketball after school?",       "rhs": "Why not play basketball after school?"},
    {"lhs": "Would you like come to my party?",               "rhs": "Would you like to come to my party?"},
    {"lhs": "Let''s going home together.",                    "rhs": "Let''s go home together."},
    {"lhs": "What about have noodles for lunch?",             "rhs": "What about having noodles for lunch?"}
  ]$jsonb$::jsonb,

  reflex_cards = $jsonb$[
    {"cn": "你想喝点什么吗？",                "en": "Would you like something to drink?",            "keyword": "Would you like"},
    {"cn": "你为什么不试试呢？",              "en": "Why don''t you give it a try?",                 "keyword": "Why don''t you"},
    {"cn": "周末一起去图书馆怎么样？",        "en": "How about going to the library this weekend?",  "keyword": "How about going"},
    {"cn": "我们一起做这个项目吧。",          "en": "Let''s do this project together.",              "keyword": "Let''s do"},
    {"cn": "我们要不要叫上 Lin？",            "en": "Shall we invite Lin to join us?",               "keyword": "Shall we invite"},
    {"cn": "为什么不去公园放松一下？",        "en": "Why not relax in the park?",                    "keyword": "Why not relax"},
    {"cn": "我们点比萨怎么样？",              "en": "What about ordering pizza?",                    "keyword": "What about ordering"},
    {"cn": "我们 6 点出发好吗？",             "en": "Shall we leave at six?",                        "keyword": "Shall we leave"}
  ]$jsonb$::jsonb,

  situation_drills = $jsonb$[
    {
      "situation": "Inviting a friend who looks stressed to take a break with you.",
      "cn": "你出去走走怎么样？外面阳光真好。",
      "en": "How about going out for a walk? The sunshine is so nice today.",
      "accepted": [
        "Why don''t you take a walk outside? It''s sunny today.",
        "Let''s go out for a walk — the weather is great."
      ]
    },
    {
      "situation": "Texting a classmate to set up a weekend study group.",
      "cn": "周六上午一起复习数学怎么样？",
      "en": "How about reviewing math together on Saturday morning?",
      "accepted": [
        "Why don''t we review math on Saturday morning?",
        "What about studying math together this Saturday morning?"
      ]
    },
    {
      "situation": "Politely proposing dinner plans to a guest.",
      "cn": "您今晚想去尝尝中餐吗？",
      "en": "Would you like to try Chinese food tonight?",
      "accepted": [
        "Would you like to have Chinese food tonight?",
        "Would you like to go for Chinese food this evening?"
      ]
    },
    {
      "situation": "Suggesting that everyone leaves early for the school trip.",
      "cn": "我们 7 点出发好吗？这样不会堵车。",
      "en": "Shall we leave at seven? That way we''ll avoid the traffic.",
      "accepted": [
        "Let''s leave at 7 to avoid the traffic.",
        "Why don''t we leave at 7 so we don''t get stuck in traffic?"
      ]
    }
  ]$jsonb$::jsonb,

  correction_tasks = $jsonb$[
    {
      "wrong": "How about go to the cinema this Saturday?",
      "model": "How about going to the cinema this Saturday?",
      "hint":  "How about + V-ing",
      "why":   "**How about / What about 后面用 V-ing**（about 是介词，不是不定式的 to）。"
    },
    {
      "wrong": "Why don''t you to play with us?",
      "model": "Why don''t you play with us?",
      "hint":  "Why don''t you + 动词原形",
      "why":   "**Why don''t you / Why not** 后面直接接**动词原形**（不带 to）。"
    },
    {
      "wrong": "Why not to take a break now?",
      "model": "Why not take a break now?",
      "hint":  "Why not + 动词原形",
      "why":   "**Why not + 动词原形**（不带 to）。同样规则也适用于 Why don''t you。"
    },
    {
      "wrong": "Would you like come to my house this weekend?",
      "model": "Would you like to come to my house this weekend?",
      "hint":  "would like + to do",
      "why":   "**would like + to do** 是固定句式，漏 to 错。"
    },
    {
      "wrong": "Let''s going to the park.",
      "model": "Let''s go to the park.",
      "hint":  "Let''s + 动词原形",
      "why":   "**Let''s + 动词原形**，不能接 V-ing。"
    },
    {
      "wrong": "What about have some ice cream?",
      "model": "What about having some ice cream?",
      "hint":  "about + V-ing",
      "why":   "**What about** 后面用 **V-ing**（同 How about）。about 是介词。"
    }
  ]$jsonb$::jsonb,

  boss_questions = $jsonb$[
    {
      "stem": "— ___ a cup of tea?\n— Yes, thank you!",
      "option_a": "Would you like",
      "option_b": "Why don''t you have",
      "option_c": "How about have",
      "option_d": "Let''s have",
      "correct_answer": "A",
      "trap": "选 B 多余 have；选 C have 应为 having；选 D Let''s 用于双方共同做事。",
      "why":  "**Would you like + 名词** = 礼貌邀请。回答 Yes, thank you 锁定礼貌邀请。"
    },
    {
      "stem": "How about ___ basketball after school?",
      "option_a": "play",
      "option_b": "to play",
      "option_c": "playing",
      "option_d": "played",
      "correct_answer": "C",
      "trap": "选 A/B/D 都没用 V-ing 形式。",
      "why":  "**How about + V-ing**：about 是介词，后接 V-ing。"
    },
    {
      "stem": "Why don''t you ___ a piano class this term?",
      "option_a": "to take",
      "option_b": "taking",
      "option_c": "take",
      "option_d": "took",
      "correct_answer": "C",
      "trap": "选 A 加 to；选 B 用 ing；选 D 时态错。",
      "why":  "**Why don''t you + 动词原形**（不带 to）= take。"
    },
    {
      "stem": "— ___ go for a hike this weekend?\n— Great idea!",
      "option_a": "Why not to",
      "option_b": "How about",
      "option_c": "Why not",
      "option_d": "Let''s to",
      "correct_answer": "C",
      "trap": "选 A 多余 to；选 B 后接动词原形 go 不搭；选 D 多余 to。",
      "why":  "**Why not + 动词原形**：Why not go。选 B（How about）后接 V-ing，不接 go。"
    }
  ]$jsonb$::jsonb

WHERE code = 'g8.16';


UPDATE junior_grammar_points SET teacher_script = $jsonb$[
  {
    "text": "今天解锁**邀请与建议**的 5 大句型。中考口语和写作的\"万能套件\"。",
    "show": "🎯 Today: 5 patterns to invite & suggest",
    "duration": 9
  },
  {
    "text": "**Would you like + to do** = 礼貌邀请。Would you like **to come** to my party?",
    "show": "Would you like + to do",
    "highlight": "to come",
    "duration": 11
  },
  {
    "text": "**How about / What about + V-ing**（about 是介词）！How about **going** swimming?",
    "show": "How about + V-ing",
    "highlight": "going",
    "duration": 12
  },
  {
    "text": "**Why don''t you / Why not + 动词原形**（不带 to）。Why don''t you **play** chess?",
    "show": "Why don''t you + V (原形)",
    "highlight": "play",
    "duration": 11
  },
  {
    "text": "**Let''s + 动词原形** = 我们一起做某事。Let''s **go** to the park.",
    "show": "Let''s + V (原形)",
    "highlight": "go",
    "duration": 10
  },
  {
    "text": "**Shall we + 动词原形 ?** = 我们……好吗？（试探口气）Shall we **leave** now?",
    "show": "Shall we + V (原形)?",
    "highlight": "leave",
    "duration": 10
  },
  {
    "text": "**最大坑**：How about / What about 后接 V-ing，**不接动词原形**！",
    "show": "✗ How about go   ✓ How about going",
    "highlight": "going",
    "duration": 12
  },
  {
    "text": "**响应**：接受用 Sounds great! / I''d love to. 拒绝用 I''d love to, but ...",
    "show": "Sounds great!  /  I''d love to, but ...",
    "highlight": "I''d love to",
    "duration": 10
  }
]$jsonb$::jsonb
WHERE code = 'g8.16';


DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.16')
  AND sort_order BETWEEN 9000 AND 9099;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.16')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  (
    'How about ___ to the new museum next Sunday?',
    'mcq', 'go', 'going', 'to go', 'went', 'B',
    NULL::text[],
    'How about + V-ing。',
    '{}'::jsonb, NULL, 'invitation_how_about', false, 1, 9000
  ),
  (
    'Why don''t you ___ for the math competition?',
    'mcq', 'to sign up', 'signing up', 'sign up', 'signed up', 'C',
    NULL::text[],
    'Why don''t you + 动词原形。',
    '{}'::jsonb, NULL, 'invitation_why_dont', false, 1, 9001
  ),
  (
    'Would you like ___ at our place this evening?',
    'mcq', 'eat dinner', 'eating dinner', 'to eat dinner', 'ate dinner', 'C',
    NULL::text[],
    'Would you like + to do。',
    '{}'::jsonb, NULL, 'invitation_would_you_like', false, 1, 9002
  ),
  (
    '___ we leave a little earlier today?',
    'mcq', 'Let''s', 'Why', 'Shall', 'How about', 'C',
    NULL::text[],
    '"我们……好吗？"用 Shall we + 动词原形 ?',
    '{}'::jsonb, NULL, 'invitation_shall_we', false, 2, 9003
  ),

  (
    'How about ____ (have) a picnic this weekend?',
    'fill', NULL, NULL, NULL, NULL, 'having',
    ARRAY['having']::text[],
    'How about + V-ing。',
    '{}'::jsonb, NULL, 'invitation_how_about_ving', false, 1, 9004
  ),
  (
    'Why not ____ (join) the English club to improve your speaking?',
    'fill', NULL, NULL, NULL, NULL, 'join',
    ARRAY['join']::text[],
    'Why not + 动词原形。',
    '{}'::jsonb, NULL, 'invitation_why_not', false, 1, 9005
  ),
  (
    'Let''s ____ (start) right away. The bus is coming.',
    'fill', NULL, NULL, NULL, NULL, 'start',
    ARRAY['start']::text[],
    'Let''s + 动词原形。',
    '{}'::jsonb, NULL, 'invitation_lets', false, 1, 9006
  ),

  (
    '改写为 Why don''t you 句：  "I suggest you go to bed earlier."',
    'transform', NULL, NULL, NULL, NULL, 'Why don''t you go to bed earlier?',
    ARRAY[
      'Why don''t you go to bed earlier?'
    ]::text[],
    'suggest sb (to) do = Why don''t you + 动词原形 ?',
    '{}'::jsonb, NULL, 'invitation_suggest_transform', true, 2, 9007
  ),
  (
    '改写为 How about 句：  "Let''s play basketball this afternoon."',
    'transform', NULL, NULL, NULL, NULL, 'How about playing basketball this afternoon?',
    ARRAY[
      'How about playing basketball this afternoon?',
      'What about playing basketball this afternoon?'
    ]::text[],
    'Let''s do = How about V-ing。注意 about 后接 V-ing。',
    '{}'::jsonb, NULL, 'invitation_how_about_transform', true, 2, 9008
  ),

  (
    '改错：  "How about go swimming with us this weekend?"',
    'correction', NULL, NULL, NULL, NULL, 'How about going swimming with us this weekend?',
    ARRAY[
      'How about going swimming with us this weekend?'
    ]::text[],
    'How about 后接 V-ing。',
    '{}'::jsonb, NULL, 'invitation_how_about_error', true, 1, 9009
  ),
  (
    '改错：  "Would you like come to my birthday party?"',
    'correction', NULL, NULL, NULL, NULL, 'Would you like to come to my birthday party?',
    ARRAY[
      'Would you like to come to my birthday party?'
    ]::text[],
    'Would you like + to do（漏 to 错）。',
    '{}'::jsonb, NULL, 'invitation_would_you_like_error', true, 2, 9010
  ),

  (
    '把这句话译成英文：你要不要这周末来我家一起做作业？',
    'translation', NULL, NULL, NULL, NULL, 'Would you like to come to my house and do homework together this weekend?',
    ARRAY[
      'Would you like to come to my house and do homework together this weekend?',
      'Would you like to come over and do homework together this weekend?',
      'How about coming to my house this weekend to do homework together?'
    ]::text[],
    '考点：① 礼貌邀请 → Would you like + to do；② 两个动词并列 to come ... (and) do；③ 加上 together 强调"一起"。',
    '{}'::jsonb, '更地道：come over 是地道说法，比 come to my house 更口语化。两个动词并列时第二个动词的 to 可省略。', 'invitation_translation', true, 3, 9011
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
  SELECT id, content_depth INTO v_point_id, v_depth FROM junior_grammar_points WHERE code = 'g8.16';
  IF v_point_id IS NULL THEN
    RAISE EXCEPTION 'Gold-standard migration failed: junior_grammar_points row with code=''g8.16'' does not exist.';
  END IF;
  IF v_depth <> 3 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: content_depth for g8.16 is %, expected 3.', v_depth;
  END IF;
  SELECT count(*) INTO v_q_count
  FROM junior_grammar_questions
  WHERE point_id = v_point_id AND sort_order BETWEEN 9000 AND 9099;
  IF v_q_count <> 12 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: expected 12 questions for g8.16, got %.', v_q_count;
  END IF;
  RAISE NOTICE 'Gold-standard migration for g8.16 verified: content_depth=3, % questions seeded.', v_q_count;
END $$;
