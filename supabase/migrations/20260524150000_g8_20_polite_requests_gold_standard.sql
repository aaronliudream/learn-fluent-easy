-- =====================================================================
-- Gold-standard content for G8 · could / would 礼貌请求
-- Code: g8.20   Category: verb
-- =====================================================================
-- Polite asking modal — Could you / Could I / Would you mind + V-ing.
-- Top trap: Would you mind requires V-ing (not to do).
-- =====================================================================

UPDATE junior_grammar_points
SET
  summary = '"请您……可以吗？" / "您介意……吗？" — 用 could 和 would 让请求显得礼貌得体，中考口语 / 写作必考。',
  hook_line_cn = '中考口语：能不能用对 Could you 和 Would you mind 直接决定你的"礼貌分"。',
  hook_line = 'Could / Would — the politeness modals that win 中考 oral score points.',
  mnemonic = 'Could you + 动词原形（请别人）；Could I + 动词原形（请求许可）；Would you mind + V-ing（介意吗）。',
  content_depth = 3,

  explanation_md = E'## 🎯 一句话搞定\n\n**礼貌请求 / 请求许可 / 提出请求** → 用 **could** / **would**，比 can / will 更**礼貌、委婉**。\n\n---\n\n## 📐 4 种礼貌请求句型\n\n| 句型 | 含义 | 例子 |\n|---|---|---|\n| **Could you + 动词原形 ?** | 请您（帮我）……可以吗？ | **Could you help** me, please? |\n| **Could I + 动词原形 ?** | 我可以……吗？（请求许可） | **Could I borrow** your pen? |\n| **Would you please + 动词原形 ?** | 请您……好吗？ | **Would you please open** the door? |\n| **Would you mind + V-ing ?** | 您介意……吗？ | **Would you mind opening** the window? |\n\n> ⚠️ **铁律 ①**：Could you / Could I / Would you please 后接**动词原形**；  \n> ⚠️ **铁律 ②**：Would you mind 后接 **V-ing**（mind 是动词后接 V-ing！）。\n\n---\n\n## 🔥 回答方式（中考考察细节）\n\n### Could you ...? 的回答\n- 肯定：**Yes, sure. / Of course. / Certainly. / No problem.**\n- 否定（礼貌）：**Sorry, I can''t. / I''m afraid not.**\n\n### Could I ...? 的回答\n- 肯定：**Yes, you can. / Of course. / Sure.**\n- 否定：**Sorry, you can''t. / I''m afraid not.**\n\n### Would you mind ...? 的特殊回答\n- 肯定**（同意，等于"不介意"）**：**No, of course not. / Not at all. / No, I wouldn''t mind.**\n- 否定（拒绝，等于"介意"）：**Yes, I''m sorry. / Yes, please don''t.**\n\n> ⚠️ 注意：Would you mind 的回答**容易反过来**！  \n> "No" = 我**不介意** = **同意**做；"Yes" = 我**介意** = **不同意**做。\n\n---\n\n## 🎯 礼貌程度对比（从随意到正式）\n\n```\nGive me ...                 ← 命令（最不礼貌）\nCan you ...?               ← 中性\nWill you ...?              ← 中性\nCould you ...?              ← 礼貌 ✓\nWould you please ...?       ← 更礼貌 ✓\nWould you mind + V-ing ...? ← 最礼貌 ✓✓\n```\n\n---\n\n## ⏰ 看到这些 = 礼貌请求题\n\n- Could / Would 开头的疑问句\n- 句末有 please\n- 服务场景（餐厅 / 商店 / 问路）\n- 跟陌生人 / 老师 / 长辈对话\n\n---\n\n## ⚠️ Top 5 易错点（中考批卷红笔常出现）\n\n1. **Would you mind 后接动词原形 / to do**：~~Would you mind open the door?~~ → **Would you mind opening the door?**\n2. **Could you 后加 to**：~~Could you to help me?~~ → **Could you help me?**\n3. **回答 Could you 用 No, you can''t**（太僵硬）→ **I''m afraid not. / Sorry, I can''t.**\n4. **回答 Would you mind 反了**：想答应却说 Yes（应该是 No）。**No = 不介意 = 同意做**。\n5. **Could I 后接第三人称单数 -s**：~~Could she borrows ...?~~ → **Could she borrow ...?**（情态动词无变化）\n\n---\n\n## 🧠 三秒判断口诀\n\n> ① 请别人做 → **Could you + 动词原形**  \n> ② 请求许可 → **Could I + 动词原形**  \n> ③ "您介意……吗" → **Would you mind + V-ing**（不是 to do！）  \n> ④ 答应 Would you mind = 答 **No**（不介意 = 同意）',

  immersion_cards = $jsonb$[
    {"situation": "Asking a stranger for directions", "cn": "请问您能告诉我去地铁站怎么走吗？", "en": "Could you tell me how to get to the subway station?"},
    {"situation": "Borrowing a pen during a quiet exam", "cn": "我可以借一下你的笔吗？", "en": "Could I borrow your pen for a moment?"},
    {"situation": "Politely asking your teacher to repeat", "cn": "您能再说一遍吗？", "en": "Could you say that again, please?"},
    {"situation": "Asking your seatmate to share a window seat", "cn": "您介意和我换一下座位吗？", "en": "Would you mind changing seats with me?"},
    {"situation": "Asking a librarian for help finding a book", "cn": "请问您能帮我找一下这本书吗？", "en": "Would you please help me find this book?"},
    {"situation": "Asking Mom for permission to go out", "cn": "妈妈，我可以和 Lin 一起去吗？", "en": "Mom, could I go with Lin?"}
  ]$jsonb$::jsonb,

  contrast_table = $jsonb$[
    {"lhs": "Would you mind to open the window?",          "rhs": "Would you mind opening the window?"},
    {"lhs": "Would you mind open the window?",              "rhs": "Would you mind opening the window?"},
    {"lhs": "Could you to help me with this?",              "rhs": "Could you help me with this?"},
    {"lhs": "— Could you wait a moment?\n— No, you can''t.","rhs": "— Could you wait a moment?\n— Sorry, I can''t."},
    {"lhs": "— Would you mind opening the door?\n— Yes (= 答应)","rhs": "— Would you mind opening the door?\n— No, of course not. (= 答应)"},
    {"lhs": "Could she borrows your book?",                  "rhs": "Could she borrow your book?"}
  ]$jsonb$::jsonb,

  reflex_cards = $jsonb$[
    {"cn": "您能帮我吗？",                    "en": "Could you help me?",                            "keyword": "Could you help"},
    {"cn": "我可以借你的伞吗？",              "en": "Could I borrow your umbrella?",                 "keyword": "Could I borrow"},
    {"cn": "您介意关一下灯吗？",              "en": "Would you mind turning off the light?",         "keyword": "Would you mind turning off"},
    {"cn": "麻烦您再说一遍。",                "en": "Would you please say that again?",              "keyword": "Would you please say"},
    {"cn": "您介意我打开窗户吗？",            "en": "Would you mind if I opened the window?",        "keyword": "Would you mind if I opened"},
    {"cn": "您能给我拍张照吗？",              "en": "Could you take a photo for me?",                "keyword": "Could you take"},
    {"cn": "我能进来吗？",                    "en": "Could I come in?",                              "keyword": "Could I come in"},
    {"cn": "您能小点声吗？",                  "en": "Could you keep your voice down?",               "keyword": "Could you keep ... down"}
  ]$jsonb$::jsonb,

  situation_drills = $jsonb$[
    {
      "situation": "Asking a hotel staff member about wifi.",
      "cn": "您能告诉我 wifi 密码是什么吗？",
      "en": "Could you tell me what the wifi password is?",
      "accepted": [
        "Could I ask you for the wifi password?",
        "Would you mind telling me the wifi password?"
      ]
    },
    {
      "situation": "Asking a classmate to lend you a textbook for one day.",
      "cn": "我可以借你的语文书用一天吗？",
      "en": "Could I borrow your Chinese textbook for one day?",
      "accepted": [
        "Would you mind lending me your Chinese textbook for a day?",
        "Could I keep your Chinese textbook for one day?"
      ]
    },
    {
      "situation": "Politely asking your sister not to play loud music.",
      "cn": "你介意把音乐声调小一点吗？",
      "en": "Would you mind turning the music down a bit?",
      "accepted": [
        "Could you turn down the music a little, please?",
        "Would you please make the music a little quieter?"
      ]
    },
    {
      "situation": "Asking a teacher to help you understand a hard question after class.",
      "cn": "老师，您能再帮我讲一遍这道题吗？",
      "en": "Excuse me, could you explain this problem to me one more time?",
      "accepted": [
        "Could you help me understand this problem again?",
        "Would you mind explaining this problem to me once more?"
      ]
    }
  ]$jsonb$::jsonb,

  correction_tasks = $jsonb$[
    {
      "wrong": "Would you mind to open the window?",
      "model": "Would you mind opening the window?",
      "hint":  "mind + V-ing",
      "why":   "**Would you mind + V-ing**：mind 是动词，后接动名词（V-ing），不接不定式 to do。"
    },
    {
      "wrong": "Would you mind open the window?",
      "model": "Would you mind opening the window?",
      "hint":  "mind + V-ing",
      "why":   "**mind 后接 V-ing**（不是动词原形）。"
    },
    {
      "wrong": "Could you to help me with this?",
      "model": "Could you help me with this?",
      "hint":  "情态动词后不加 to",
      "why":   "**情态动词 could 后直接接动词原形**，不加 to。"
    },
    {
      "wrong": "— Could you wait a moment? — No, you can''t.",
      "model": "— Could you wait a moment? — Sorry, I can''t.",
      "hint":  "礼貌拒绝",
      "why":   "**Could you ...** 拒绝时用 \"Sorry, I can''t.\" / \"I''m afraid not.\"，No, you can''t 太僵硬。"
    },
    {
      "wrong": "— Would you mind opening the door? — Yes, of course not.",
      "model": "— Would you mind opening the door? — No, of course not.",
      "hint":  "答应是 No",
      "why":   "**Would you mind 答应用 No**（= 我不介意）；Yes 等于\"介意\"= 拒绝。"
    },
    {
      "wrong": "Could she borrows your dictionary?",
      "model": "Could she borrow your dictionary?",
      "hint":  "情态动词无人称变化",
      "why":   "**情态动词没有第三人称单数 -s**：borrow，不是 borrows。"
    }
  ]$jsonb$::jsonb,

  boss_questions = $jsonb$[
    {
      "stem": "— ___ open the window? It''s a bit hot in here.\n— No, of course not.",
      "option_a": "Would you mind to",
      "option_b": "Would you mind",
      "option_c": "Could you to",
      "option_d": "Will you to",
      "correct_answer": "B",
      "trap": "选 A/C/D 都多余了 to。Would you mind + V-ing。",
      "why":  "**Would you mind + V-ing**：直接接动名词，不带 to。回答 No, of course not 锁定 Would you mind 句型。"
    },
    {
      "stem": "— Could I borrow your ruler, please?\n— ___ Here you are.",
      "option_a": "Yes, please.",
      "option_b": "Of course.",
      "option_c": "I''m afraid not.",
      "option_d": "Yes, I can.",
      "correct_answer": "B",
      "trap": "选 A Yes, please 用于回答 Would you like。选 D 改用 you 才对。选 C 是拒绝。",
      "why":  "**Could I ... 同意** = Of course / Sure / Yes, you can。Yes, please 用于回答邀请。"
    },
    {
      "stem": "Would you mind ___ a little louder? I can''t hear you well.",
      "option_a": "speak",
      "option_b": "to speak",
      "option_c": "speaking",
      "option_d": "spoke",
      "correct_answer": "C",
      "trap": "选 A/B/D 都不是 V-ing 形式。",
      "why":  "**Would you mind + V-ing**：speaking。"
    },
    {
      "stem": "— Could you tell me the way to the bookstore?\n— ___",
      "option_a": "No, you can''t.",
      "option_b": "I''m sorry, but I''m new here too.",
      "option_c": "Yes, of course you can.",
      "option_d": "Don''t ask me.",
      "correct_answer": "B",
      "trap": "选 A/D 不礼貌；选 C 文法不当（这是 you 的请求，不该用 you can）。",
      "why":  "**Could you 问路时礼貌拒绝** = \"I''m sorry, but ...\" 提出原因。"
    }
  ]$jsonb$::jsonb

WHERE code = 'g8.20';


UPDATE junior_grammar_points SET teacher_script = $jsonb$[
  {
    "text": "今天解锁**礼貌请求**：Could you / Could I / Would you mind — 中考口语和写作的\"礼貌神器\"。",
    "show": "🎯 Today: Could / Would — polite asking",
    "duration": 9
  },
  {
    "text": "**请别人做某事** → **Could you + 动词原形**。Could you **help** me, please?",
    "show": "Could you + V (原形)",
    "highlight": "help",
    "duration": 10
  },
  {
    "text": "**请求自己做某事（许可）**→ **Could I + 动词原形**。Could I **borrow** your pen?",
    "show": "Could I + V (原形)",
    "highlight": "borrow",
    "duration": 10
  },
  {
    "text": "**最礼貌：Would you mind + V-ing** ！mind 后接动名词。",
    "show": "Would you mind + V-ing",
    "highlight": "+ V-ing",
    "duration": 11
  },
  {
    "text": "**举例**：Would you mind **opening** the window?（您介意开下窗吗？）",
    "show": "Would you mind opening the window?",
    "highlight": "opening",
    "duration": 11
  },
  {
    "text": "**最大坑 ①**：Would you mind 后**不能接动词原形或 to do**！必须 V-ing。",
    "show": "✗ mind to open   ✗ mind open   ✓ mind opening",
    "highlight": "mind opening",
    "duration": 13
  },
  {
    "text": "**最大坑 ②**：回答 Would you mind **反过来**！No = 不介意 = 同意；Yes = 介意 = 拒绝。",
    "show": "No, of course not = OK   |   Yes = NO",
    "highlight": "No = OK",
    "duration": 13
  },
  {
    "text": "**回答 Could you / I**：肯定用 Of course / Sure；礼貌拒绝用 I''m afraid not / Sorry, I can''t。下一关进入实战。",
    "show": "Of course.   I''m afraid not.",
    "highlight": "I''m afraid not",
    "duration": 11
  }
]$jsonb$::jsonb
WHERE code = 'g8.20';


DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.20')
  AND sort_order BETWEEN 9000 AND 9099;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.20')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  (
    'Could you ___ me with this heavy box, please?',
    'mcq', 'to help', 'helping', 'help', 'helped', 'C',
    NULL::text[],
    'Could you + 动词原形。',
    '{}'::jsonb, NULL, 'polite_could_you', false, 1, 9000
  ),
  (
    '— Could I borrow your dictionary?\n— ___',
    'mcq', 'Yes, please.', 'Of course.', 'No, you can.', 'Yes, you must.', 'B',
    NULL::text[],
    'Could I 礼貌请求 → 同意 = Of course / Sure。',
    '{}'::jsonb, NULL, 'polite_could_i_response', false, 1, 9001
  ),
  (
    'Would you mind ___ a little? It''s too loud.',
    'mcq', 'be quiet', 'to be quiet', 'being quiet', 'is quiet', 'C',
    NULL::text[],
    'Would you mind + V-ing → being quiet。',
    '{}'::jsonb, NULL, 'polite_would_you_mind', false, 2, 9002
  ),
  (
    '— Would you mind opening the door?\n— ___ I''ll do it right away.',
    'mcq', 'Yes, of course.', 'No, of course not.', 'Sorry, I can''t.', 'No, you can''t.', 'B',
    NULL::text[],
    'Would you mind 同意答 No, of course not（不介意 = 同意）。',
    '{}'::jsonb, NULL, 'polite_would_you_mind_response', false, 3, 9003
  ),

  (
    'Excuse me, ____ (could) you tell me how to get to the post office?',
    'fill', NULL, NULL, NULL, NULL, 'could',
    ARRAY['could']::text[],
    '礼貌请求问路用 Could you。',
    '{}'::jsonb, NULL, 'polite_could_you_directions', false, 1, 9004
  ),
  (
    'Would you mind ____ (turn down) the music?',
    'fill', NULL, NULL, NULL, NULL, 'turning down',
    ARRAY['turning down']::text[],
    'mind + V-ing；turn down → turning down。',
    '{}'::jsonb, NULL, 'polite_mind_phrasal', false, 2, 9005
  ),
  (
    '____ (could) I take a picture here?',
    'fill', NULL, NULL, NULL, NULL, 'Could',
    ARRAY['Could']::text[],
    'Could I + 动词原形 = 请求许可。',
    '{}'::jsonb, NULL, 'polite_could_i_permission', false, 1, 9006
  ),

  (
    '改写为更礼貌的请求：  "Open the door."',
    'transform', NULL, NULL, NULL, NULL, 'Could you please open the door?',
    ARRAY[
      'Could you please open the door?',
      'Could you open the door, please?',
      'Would you mind opening the door?',
      'Would you please open the door?'
    ]::text[],
    '命令句 → 礼貌请求；多种形式都对。',
    '{}'::jsonb, NULL, 'polite_command_to_request', true, 2, 9007
  ),
  (
    '把 Could you 句改写为 Would you mind 句：  "Could you close the window?"',
    'transform', NULL, NULL, NULL, NULL, 'Would you mind closing the window?',
    ARRAY[
      'Would you mind closing the window?'
    ]::text[],
    'close → closing（Would you mind + V-ing）。',
    '{}'::jsonb, NULL, 'polite_transform_mind', true, 2, 9008
  ),

  (
    '改错：  "Would you mind to wait for a few minutes?"',
    'correction', NULL, NULL, NULL, NULL, 'Would you mind waiting for a few minutes?',
    ARRAY[
      'Would you mind waiting for a few minutes?'
    ]::text[],
    'mind + V-ing，不接 to do。',
    '{}'::jsonb, NULL, 'polite_mind_ving', true, 2, 9009
  ),
  (
    '改错：  "— Could you wait a moment? — No, you can''t."',
    'correction', NULL, NULL, NULL, NULL, '— Could you wait a moment? — Sorry, I can''t.',
    ARRAY[
      '— Could you wait a moment? — Sorry, I can''t.',
      '— Could you wait a moment? — I''m afraid not.'
    ]::text[],
    '"No, you can''t" 太僵硬；礼貌拒绝用 Sorry, I can''t / I''m afraid not。',
    '{}'::jsonb, NULL, 'polite_refusal', true, 3, 9010
  ),

  (
    '把这句话译成英文：您能告诉我去最近的地铁站怎么走吗？',
    'translation', NULL, NULL, NULL, NULL, 'Could you tell me how to get to the nearest subway station?',
    ARRAY[
      'Could you tell me how to get to the nearest subway station?',
      'Could you please tell me the way to the nearest subway station?',
      'Excuse me, could you tell me how I can get to the nearest subway station?'
    ]::text[],
    '考点：① 礼貌问路 → Could you ...?；② 宾语从句：how to get / how I can get（陈述语序）；③ "最近的"= the nearest。',
    '{}'::jsonb, '更地道：开头加 Excuse me 让句子更礼貌；how to get to / the way to 都自然。', 'polite_translation', true, 3, 9011
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
  SELECT id, content_depth INTO v_point_id, v_depth FROM junior_grammar_points WHERE code = 'g8.20';
  IF v_point_id IS NULL THEN
    RAISE EXCEPTION 'Gold-standard migration failed: junior_grammar_points row with code=''g8.20'' does not exist.';
  END IF;
  IF v_depth <> 3 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: content_depth for g8.20 is %, expected 3.', v_depth;
  END IF;
  SELECT count(*) INTO v_q_count
  FROM junior_grammar_questions
  WHERE point_id = v_point_id AND sort_order BETWEEN 9000 AND 9099;
  IF v_q_count <> 12 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: expected 12 questions for g8.20, got %.', v_q_count;
  END IF;
  RAISE NOTICE 'Gold-standard migration for g8.20 verified: content_depth=3, % questions seeded.', v_q_count;
END $$;
