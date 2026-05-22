-- =====================================================================
-- Gold-standard content for G8 · 不定代词 · Indefinite Pronouns
-- Code: g8.06   Category: other
-- =====================================================================
-- some/any/no/every + thing/body/one. Covers the famous 形容词后置
-- trap (something hot, not hot something) and double-negative errors.
-- =====================================================================

UPDATE junior_grammar_points
SET
  summary = '"有人 / 没事 / 任何人 / 大家" — 4 组不定代词搞定中考一切"模糊指代"。',
  hook_line_cn = '中考完形 + 单选高频考点：something / anybody / nothing / everyone — 4 个词头乘以 3 个词尾 = 12 个考点，一次学完。',
  hook_line = 'Indefinite pronouns — the 12-word kit that unlocks half your 中考 完形 questions.',
  mnemonic = 'some 肯定 · any 否定/疑问 · no 否定意义 · every 全部；形容词必须放后面。',
  content_depth = 3,

  explanation_md = E'## 🎯 一句话搞定\n\n**指代不具体的人 / 事物 / 地方** → 用 **不定代词**（4 个词头 × 3 个词尾 = 12 个）。\n\n---\n\n## 📐 12 个不定代词全表\n\n| 词头 | + thing（事物） | + body / one（人） | + where（地方） |\n|---|---|---|---|\n| **some-**（肯定 / 礼貌） | **something** | **somebody / someone** | **somewhere** |\n| **any-**（否定 / 疑问） | **anything** | **anybody / anyone** | **anywhere** |\n| **no-**（否定意义） | **nothing** | **nobody / no one** | **nowhere** |\n| **every-**（全部） | **everything** | **everybody / everyone** | **everywhere** |\n\n> ⚠️ **铁律**：所有不定代词作主语 → **视为第三人称单数**！  \n> **Everybody is** here.（不是 are）  \n> **Nothing is** wrong.\n\n---\n\n## 🔥 4 大词头怎么选？\n\n### ① some- → 肯定句 / 礼貌请求疑问句\n- I have **something** to tell you.\n- Would you like **something** to drink?（礼貌邀请）\n\n### ② any- → 否定句 / 一般疑问句\n- Is there **anything** in the box?\n- I don''t have **anything** to do.\n\n### ③ no- → 表否定意义（自带否定，不能再加 not）\n- There is **nothing** in the room.（= There isn''t anything）\n- **Nobody** knows the answer.\n\n### ④ every- → 表"全部"，强调"每一个"\n- **Everybody** loves Chinese New Year.\n- **Everything** is ready.\n\n---\n\n## ⏰ 中考 3 大高频结构\n\n### ① 形容词后置（最高频考点！）\n- ~~hot something~~ → **something hot**（形容词必须放**后面**）\n- I want to drink **something cold**.\n- Is there **anything new** in the news?\n\n### ② to do 后置作定语\n- I have **nothing to do** this weekend.\n- Would you like **something to eat**?\n\n### ③ everybody / everything 视为单数\n- **Everyone is** ready.（不是 are）\n- **Everything looks** good.\n\n---\n\n## ⚠️ Top 5 易错点（中考批卷红笔常出现）\n\n1. **形容词位置错**：~~I want hot something.~~ → **I want something hot.**\n2. **双重否定**：~~I didn''t buy nothing.~~ → **I didn''t buy anything.** 或 **I bought nothing.**\n3. **everybody / everyone 配复数动词**：~~Everybody are happy.~~ → **Everybody is happy.**\n4. **some / any 混用**：~~Do you have some questions?~~ →（一般问句用 any）**Do you have any questions?**\n5. **no- 后再加 not**：~~Nobody didn''t know.~~ → **Nobody knew.** 或 **Nobody knows.**\n\n---\n\n## 🧠 三秒判断口诀\n\n> ① 肯定句 → **some-**；否定/疑问句 → **any-**；表否定意义 → **no-**；表全部 → **every-**  \n> ② 形容词修饰 → **永远放后面**（something hot，不是 hot something）  \n> ③ 作主语 → **永远第三人称单数**（Everybody **is** ...）',

  immersion_cards = $jsonb$[
    {"situation": "Offering a guest a drink", "cn": "你想喝点什么吗？", "en": "Would you like something to drink?"},
    {"situation": "Reporting an empty box to your teacher", "cn": "盒子里什么都没有。", "en": "There is nothing in the box."},
    {"situation": "Sharing a secret with your best friend", "cn": "我有件特别有趣的事要告诉你。", "en": "I have something very interesting to tell you."},
    {"situation": "Asking if anyone has seen your eraser", "cn": "有人看见我的橡皮了吗？", "en": "Has anybody seen my eraser?"},
    {"situation": "Announcing exciting news at home", "cn": "每个人都很激动！", "en": "Everybody is so excited!"},
    {"situation": "Wishing for cold drinks on a hot day", "cn": "我想喝点冷的。", "en": "I want something cold to drink."}
  ]$jsonb$::jsonb,

  contrast_table = $jsonb$[
    {"lhs": "I want hot something to drink.",                 "rhs": "I want something hot to drink."},
    {"lhs": "I didn''t buy nothing at the store.",             "rhs": "I didn''t buy anything at the store. / I bought nothing."},
    {"lhs": "Everybody are happy today.",                      "rhs": "Everybody is happy today."},
    {"lhs": "Do you have some questions about it?",            "rhs": "Do you have any questions about it?"},
    {"lhs": "Nobody didn''t know the answer.",                 "rhs": "Nobody knew the answer."},
    {"lhs": "There is anything strange in the room.",          "rhs": "There is something strange in the room."}
  ]$jsonb$::jsonb,

  reflex_cards = $jsonb$[
    {"cn": "你想吃点东西吗？",                "en": "Would you like something to eat?",              "keyword": "something to eat"},
    {"cn": "盒子里什么也没有。",              "en": "There is nothing in the box.",                  "keyword": "nothing in"},
    {"cn": "有什么新闻吗？",                  "en": "Is there anything new?",                        "keyword": "anything new"},
    {"cn": "大家都准备好了。",                "en": "Everybody is ready.",                           "keyword": "Everybody is"},
    {"cn": "我想买点冷饮。",                  "en": "I want to buy something cold.",                 "keyword": "something cold"},
    {"cn": "没人接电话。",                    "en": "Nobody answered the phone.",                    "keyword": "Nobody answered"},
    {"cn": "她哪儿也不想去。",                "en": "She doesn''t want to go anywhere.",             "keyword": "anywhere"},
    {"cn": "一切都还好吗？",                  "en": "Is everything OK?",                             "keyword": "Is everything"}
  ]$jsonb$::jsonb,

  situation_drills = $jsonb$[
    {
      "situation": "A foreign friend visits your home for the first time.",
      "cn": "你想喝点什么吗？果汁还是水？",
      "en": "Would you like something to drink? Juice or water?",
      "accepted": [
        "Can I get you something to drink — juice or water?",
        "Would you like a drink? I have juice and water."
      ]
    },
    {
      "situation": "Mom asks what you bought at the bookstore.",
      "cn": "我什么也没买，太贵了。",
      "en": "I didn''t buy anything — everything was too expensive.",
      "accepted": [
        "I bought nothing because everything was too expensive.",
        "I didn''t get anything — it was all too pricey."
      ]
    },
    {
      "situation": "Your best friend looks upset and you want to help.",
      "cn": "有什么我能帮忙的吗？",
      "en": "Is there anything I can do to help?",
      "accepted": [
        "Is there something I can do for you?",
        "Can I help you with anything?"
      ]
    },
    {
      "situation": "Reporting back to your class after a tiring trip.",
      "cn": "每个人都玩得很开心，大家都不想回家。",
      "en": "Everybody had a great time and nobody wanted to go home.",
      "accepted": [
        "Everyone had so much fun, and no one wanted to leave.",
        "Everybody enjoyed it; nobody wanted the day to end."
      ]
    }
  ]$jsonb$::jsonb,

  correction_tasks = $jsonb$[
    {
      "wrong": "I want hot something to drink.",
      "model": "I want something hot to drink.",
      "hint":  "形容词放后面",
      "why":   "**不定代词后面**才能跟形容词，**不能放前面**。something hot 不是 hot something。"
    },
    {
      "wrong": "I didn''t buy nothing at the supermarket.",
      "model": "I didn''t buy anything at the supermarket.",
      "hint":  "双重否定",
      "why":   "**didn''t 已含否定**，后面用 anything；或者去掉 didn''t 用 nothing：I bought nothing。"
    },
    {
      "wrong": "Everybody are excited about the trip.",
      "model": "Everybody is excited about the trip.",
      "hint":  "Everybody 视为单数",
      "why":   "**所有不定代词作主语**（everybody / everyone / nobody / something）都视为**第三人称单数** → 用 is / has / does。"
    },
    {
      "wrong": "Do you have some questions about the exam?",
      "model": "Do you have any questions about the exam?",
      "hint":  "一般疑问句用 any-",
      "why":   "**一般疑问句**用 **any-**；只有礼貌邀请的问句（Would you like ...?）才用 some-。"
    },
    {
      "wrong": "Nobody didn''t know the new student.",
      "model": "Nobody knew the new student.",
      "hint":  "Nobody 已含否定",
      "why":   "**no- 词头本身含否定**，后面不能再加 not / didn''t。直接用肯定形式 knew。"
    },
    {
      "wrong": "There is anything strange in the room.",
      "model": "There is something strange in the room.",
      "hint":  "肯定句用 some-",
      "why":   "**肯定句**（There is ...）用 **some-** → something。anything 通常用于否定/疑问。"
    }
  ]$jsonb$::jsonb,

  boss_questions = $jsonb$[
    {
      "stem": "— Would you like ___ to eat?\n— No, thanks. I''m not hungry.",
      "option_a": "anything",
      "option_b": "everything",
      "option_c": "something",
      "option_d": "nothing",
      "correct_answer": "C",
      "trap": "选 A 是中考最大陷阱：**礼貌邀请的疑问句用 some-**，不是 any-。",
      "why":  "**Would you like ...** 是礼貌邀请 → 用 **something**。普通疑问句才用 anything。"
    },
    {
      "stem": "I have ___ to tell you. It''s really important.",
      "option_a": "important something",
      "option_b": "something important",
      "option_c": "anything important",
      "option_d": "important anything",
      "correct_answer": "B",
      "trap": "选 A/D 形容词放前面 — 错。选 C 肯定句用 anything — 错。",
      "why":  "肯定句 → some-；**形容词 important 必须放在不定代词后面**。"
    },
    {
      "stem": "___ in our class likes the new English teacher very much.",
      "option_a": "Everyone",
      "option_b": "Everyone are",
      "option_c": "Everybody is",
      "option_d": "Anybody",
      "correct_answer": "A",
      "trap": "选 B 主谓不一致（everyone 视为单数）。选 D anybody 在肯定句意思不对（任何人）。",
      "why":  "**Everyone = 第三人称单数** → likes（已含 -s）；句子结构完整，无需再加 is。"
    },
    {
      "stem": "— Is there ___ wrong with your phone?\n— ___. It works fine.",
      "option_a": "anything / Nothing",
      "option_b": "something / Anything",
      "option_c": "nothing / Something",
      "option_d": "anything / Anything",
      "correct_answer": "A",
      "trap": "选 D 回答用 Anything 意思不对（"任何"）。其他选项词头匹配错。",
      "why":  "疑问句用 **anything**；回答"没事"用 **Nothing**（自带否定，简短回答固定搭配）。"
    }
  ]$jsonb$::jsonb

WHERE code = 'g8.06';


UPDATE junior_grammar_points SET teacher_script = $jsonb$[
  {
    "text": "今天解锁**不定代词**。中考完形 + 单选高频考点：something / anybody / nothing / everyone。",
    "show": "🎯 Today: some / any / no / every + thing / body / one",
    "duration": 10
  },
  {
    "text": "**4 个词头 × 3 个词尾 = 12 个不定代词**。一次学完，终身受用。",
    "show": "some- / any- / no- / every-   ×   -thing / -body / -one",
    "highlight": "some- / any- / no- / every-",
    "duration": 11
  },
  {
    "text": "**some- → 肯定句 / 礼貌请求**。Would you like **something** to drink? 不能用 anything。",
    "show": "Would you like something to drink?",
    "highlight": "something",
    "duration": 11
  },
  {
    "text": "**any- → 否定句 / 一般疑问句**。Is there **anything** in the box?",
    "show": "Is there anything in the box?",
    "highlight": "anything",
    "duration": 10
  },
  {
    "text": "**no- → 含否定意义**，**不能再加 not**。**Nobody** knows. = There is **nobody** who knows.",
    "show": "✗ Nobody didn''t know.   ✓ Nobody knew.",
    "highlight": "Nobody knew",
    "duration": 12
  },
  {
    "text": "**最大坑 ①** ：形容词必须放**后面**！something **hot**，不是 ~~hot something~~。",
    "show": "✗ hot something   ✓ something hot",
    "highlight": "something hot",
    "duration": 12
  },
  {
    "text": "**最大坑 ②**：作主语永远是**第三人称单数**。**Everybody is** here.（不是 are）",
    "show": "✗ Everybody are.   ✓ Everybody is.",
    "highlight": "is",
    "duration": 11
  },
  {
    "text": "理论讲完。下一关 6 个真实场景练习。",
    "show": "Next → 6 Real-life Scenarios 📚",
    "duration": 7
  }
]$jsonb$::jsonb
WHERE code = 'g8.06';


DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.06')
  AND sort_order BETWEEN 9000 AND 9099;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.06')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  (
    'I would like ___ cold to drink, please.',
    'mcq', 'cold something', 'something cold', 'anything cold', 'cold anything', 'B',
    NULL::text[],
    '形容词必须放在不定代词后面 → something cold。礼貌请求用 some-。',
    NULL::jsonb, NULL, 'indefinite_adj_after', false, 1, 9000
  ),
  (
    '— Did you see ___ on your way to school?\n— No, I saw ___.',
    'mcq', 'anybody / nobody', 'somebody / anybody', 'anybody / anybody', 'nobody / anybody', 'A',
    NULL::text[],
    '疑问句用 anybody；回答"没看到任何人"用 nobody（自带否定，简短回答常用）。',
    NULL::jsonb, NULL, 'indefinite_question_negative', false, 2, 9001
  ),
  (
    '___ in our class likes the new English teacher.',
    'mcq', 'Everybody', 'Anybody', 'Somebody', 'Nobody', 'A',
    NULL::text[],
    '"全班都喜欢"→ Everybody。likes 单数动词体现 Everybody 视为单数。',
    NULL::jsonb, NULL, 'indefinite_every', false, 1, 9002
  ),
  (
    'There isn''t ___ interesting on TV tonight.',
    'mcq', 'something', 'anything', 'nothing', 'everything', 'B',
    NULL::text[],
    '否定句 isn''t → 用 **anything**；不能用 nothing（双重否定）。',
    NULL::jsonb, NULL, 'indefinite_negative_any', false, 2, 9003
  ),

  (
    'I have ____ to tell you. It''s a secret.',
    'fill', NULL, NULL, NULL, NULL, 'something',
    ARRAY['something']::text[],
    '肯定句 → some-；告诉秘密 = something。',
    NULL::jsonb, NULL, 'indefinite_positive', false, 1, 9004
  ),
  (
    '____ knows where Tom went. Maybe he is at home.',
    'fill', NULL, NULL, NULL, NULL, 'Nobody',
    ARRAY['Nobody', 'No one']::text[],
    '"没人知道"= Nobody / No one；后接单数动词 knows。',
    NULL::jsonb, NULL, 'indefinite_negative_subject', false, 2, 9005
  ),
  (
    'Look outside. Is there ____ wrong with the bus?',
    'fill', NULL, NULL, NULL, NULL, 'anything',
    ARRAY['anything']::text[],
    '疑问句 → anything；询问"有什么不对" = Is there anything wrong。',
    NULL::jsonb, NULL, 'indefinite_question', false, 1, 9006
  ),

  (
    '改写为不定代词句：  "I bought a hot drink."（用 something）',
    'transform', NULL, NULL, NULL, NULL, 'I bought something hot to drink.',
    ARRAY[
      'I bought something hot to drink.',
      'I got something hot to drink.'
    ]::text[],
    '形容词 hot 后置；to drink 作定语后置。',
    NULL::jsonb, NULL, 'indefinite_transform', true, 2, 9007
  ),
  (
    '改写为否定句：  "Everybody likes the new song."',
    'transform', NULL, NULL, NULL, NULL, 'Nobody likes the new song.',
    ARRAY[
      'Nobody likes the new song.',
      'No one likes the new song.'
    ]::text[],
    'Everybody → Nobody（反义）；动词保持单数 likes。',
    NULL::jsonb, NULL, 'indefinite_opposite', true, 2, 9008
  ),

  (
    '改错：  "I want delicious something for lunch."',
    'correction', NULL, NULL, NULL, NULL, 'I want something delicious for lunch.',
    ARRAY[
      'I want something delicious for lunch.'
    ]::text[],
    '形容词必须放在不定代词**后面**。',
    NULL::jsonb, NULL, 'indefinite_adj_position', true, 1, 9009
  ),
  (
    '改错：  "Nobody didn''t see the accident yesterday."',
    'correction', NULL, NULL, NULL, NULL, 'Nobody saw the accident yesterday.',
    ARRAY[
      'Nobody saw the accident yesterday.'
    ]::text[],
    'Nobody 已含否定，不能再加 didn''t（双重否定）。',
    NULL::jsonb, NULL, 'indefinite_double_negative', true, 2, 9010
  ),

  (
    '把这句话译成英文：每个人都为这次旅行准备好了什么有意思的活动吗？',
    'translation', NULL, NULL, NULL, NULL, 'Has everyone prepared something interesting for the trip?',
    ARRAY[
      'Has everyone prepared something interesting for the trip?',
      'Has everybody got something interesting ready for the trip?',
      'Has each person prepared something fun for the trip?'
    ]::text[],
    '考点：① 每个人 = everyone / everybody（单数）；② 礼貌的疑问语境用 something；③ 形容词 interesting 放后面。',
    NULL::jsonb, '注意：has everyone（不是 have everyone）— everyone 视为单数。', 'indefinite_translation', true, 3, 9011
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
  SELECT id, content_depth INTO v_point_id, v_depth FROM junior_grammar_points WHERE code = 'g8.06';
  IF v_point_id IS NULL THEN
    RAISE EXCEPTION 'Gold-standard migration failed: junior_grammar_points row with code=''g8.06'' does not exist.';
  END IF;
  IF v_depth <> 3 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: content_depth for g8.06 is %, expected 3.', v_depth;
  END IF;
  SELECT count(*) INTO v_q_count
  FROM junior_grammar_questions
  WHERE point_id = v_point_id AND sort_order BETWEEN 9000 AND 9099;
  IF v_q_count <> 12 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: expected 12 questions for g8.06, got %.', v_q_count;
  END IF;
  RAISE NOTICE 'Gold-standard migration for g8.06 verified: content_depth=3, % questions seeded.', v_q_count;
END $$;
