-- =====================================================================
-- Gold-standard content for G8 · 一般将来时 · Future Simple
-- Code: g8.03   Category: tense
-- =====================================================================
-- will vs be going to, plus the 主将从现 trap (no will in if/when clauses).
-- =====================================================================

UPDATE junior_grammar_points
SET
  summary = '"明天我会……" / "我打算……" — 描述将来动作的两大武器：will 和 be going to。',
  hook_line_cn = '中考写作里"未来计划""明天天气""规则承诺"全靠它。学会区分 will 和 be going to，作文不再单调。',
  hook_line = 'Will vs. be going to — choose right, and your future tenses sound native.',
  mnemonic = 'will = 当场决定 / 主观判断；be going to = 已有计划 / 看得见的迹象。',
  content_depth = 3,

  explanation_md = E'## 🎯 一句话搞定\n\n**将要发生** → 用 **will + 动词原形** 或 **be going to + 动词原形**。  \n两者意思相近，但**侧重不同**。\n\n---\n\n## 📐 核心公式\n\n| 句型 | will 形式 | be going to 形式 |\n|---|---|---|\n| 肯定句 | 主语 + **will** + 动词原形 | 主语 + **am/is/are going to** + 动词原形 |\n| 否定句 | 主语 + **won''t** + 动词原形 | 主语 + **am/is/are not going to** + 动词原形 |\n| 一般疑问 | **Will** + 主语 + 动词原形 ? | **Am/Is/Are** + 主语 + going to + 动词原形 ? |\n| 简短回答 | Yes, I will. / No, I won''t. | Yes, I am. / No, I''m not. |\n\n> ⚠️ **铁律**：be going to 里的 be 要按主语**变形**（I am / he is / they are）。\n\n---\n\n## 🔥 will 和 be going to 怎么选？\n\n### ✅ 用 will 的场景\n- **当场决定**：— The phone is ringing. — I **will** answer it.\n- **主观判断 / 猜测**：I think it **will** rain tomorrow.\n- **承诺 / 邀请**：I **will** help you carry the box.\n- **客观必然**：The sun **will** rise at 6:15 tomorrow.\n\n### ✅ 用 be going to 的场景\n- **已经计划好的事**：We **are going to** visit Yunnan next summer.（已订票）\n- **基于现有迹象的预测**：Look at those clouds! It **is going to** rain.\n\n---\n\n## ⏰ 看到这些 = 一般将来时\n\n- **tomorrow** / tomorrow morning / tomorrow afternoon\n- **next** + week / month / year / Sunday / Monday\n- **in** + 一段时间（in two days, in a week, in 2030）\n- **soon / later / in the future**\n- **this evening / this weekend**\n\n---\n\n## ⚠️ Top 5 易错点（中考批卷红笔常出现）\n\n1. **will 后用了 to**：~~I will to help you.~~ → **I will help you.**（will 后**永远**接动词原形）\n2. **be going to 漏 be**：~~I going to study tonight.~~ → **I am going to study tonight.**\n3. **if / when / as soon as 从句里用了 will**（主将从现）：~~If it will rain, I will stay home.~~ → **If it rains, I will stay home.**\n4. **第三人称单数把 will 变 wills**：~~He wills come.~~ → **He will come.**（情态动词无变化）\n5. **be going to 的疑问句乱**：~~Do you going to go?~~ → **Are you going to go?**（go to 用 be 动词提前，不用 do）\n\n---\n\n## 🧠 三秒判断口诀\n\n> ① 看时间词 → tomorrow / next / in 2030 → 用将来时  \n> ② 当场决定 / 猜 → **will**；已有计划 / 看到迹象 → **be going to**  \n> ③ if / when 从句里 → **绝对不能** 用 will！',

  immersion_cards = $jsonb$[
    {"situation": "Phone rings during dinner", "cn": "电话响了，我去接。", "en": "The phone is ringing. I will answer it."},
    {"situation": "Looking at dark clouds before leaving", "cn": "看那些云！要下雨了。", "en": "Look at those clouds! It is going to rain."},
    {"situation": "Sharing your summer plan", "cn": "我们暑假打算去云南。", "en": "We are going to visit Yunnan during the summer holiday."},
    {"situation": "Promising your friend a study session", "cn": "明天我会帮你复习数学的。", "en": "I will help you review math tomorrow."},
    {"situation": "Predicting tomorrow''s weather", "cn": "我觉得明天会晴天。", "en": "I think it will be sunny tomorrow."},
    {"situation": "Telling your mom about a school event", "cn": "我们下周五要开运动会。", "en": "We are going to have a sports meet next Friday."}
  ]$jsonb$::jsonb,

  contrast_table = $jsonb$[
    {"lhs": "I will to help you with your homework.",        "rhs": "I will help you with your homework."},
    {"lhs": "He wills visit Beijing next year.",              "rhs": "He will visit Beijing next year."},
    {"lhs": "I going to buy a new phone.",                    "rhs": "I am going to buy a new phone."},
    {"lhs": "If it will rain tomorrow, we will stay home.",   "rhs": "If it rains tomorrow, we will stay home."},
    {"lhs": "Do you going to the concert?",                   "rhs": "Are you going to the concert?"},
    {"lhs": "She is going to visits her grandma.",            "rhs": "She is going to visit her grandma."}
  ]$jsonb$::jsonb,

  reflex_cards = $jsonb$[
    {"cn": "明天我来叫你起床。",                "en": "I will wake you up tomorrow.",                  "keyword": "will wake"},
    {"cn": "她下周要去上海。",                  "en": "She is going to Shanghai next week.",           "keyword": "is going to"},
    {"cn": "我猜他会迟到。",                    "en": "I think he will be late.",                      "keyword": "will be late"},
    {"cn": "看天气！要变冷了。",                "en": "Look at the weather! It''s going to get cold.", "keyword": "going to get cold"},
    {"cn": "我们明早八点出发。",                "en": "We will leave at 8 tomorrow morning.",          "keyword": "will leave"},
    {"cn": "我打算下周开始练琴。",              "en": "I am going to start practicing the piano next week.","keyword": "going to start"},
    {"cn": "Tom 答应明天还书。",                "en": "Tom will return the books tomorrow.",            "keyword": "will return"},
    {"cn": "他们今晚不来。",                    "en": "They aren''t going to come tonight.",            "keyword": "aren''t going to come"}
  ]$jsonb$::jsonb,

  situation_drills = $jsonb$[
    {
      "situation": "Mom asks if you''ve made plans for the weekend.",
      "cn": "我打算周六和同学一起去图书馆复习。",
      "en": "I am going to study at the library with my classmates on Saturday.",
      "accepted": [
        "I''m going to go to the library with my classmates this Saturday.",
        "I plan to study at the library with friends on Saturday."
      ]
    },
    {
      "situation": "Your friend looks at the cloudy sky and asks about the picnic.",
      "cn": "看这天，要下雨了，野餐改天吧。",
      "en": "Look at the sky — it''s going to rain. Let''s have the picnic another day.",
      "accepted": [
        "It''s going to rain, so let''s reschedule the picnic.",
        "The sky is dark — it''ll rain soon. Let''s do the picnic later."
      ]
    },
    {
      "situation": "A classmate is struggling to carry a stack of books.",
      "cn": "我来帮你拿一些吧。",
      "en": "I will help you carry some.",
      "accepted": [
        "I''ll carry some for you.",
        "Let me help you with those books."
      ]
    },
    {
      "situation": "Telling your tutor about your high-school plan.",
      "cn": "我打算明年去苏州外国语高中。",
      "en": "I am going to attend Suzhou Foreign Language High School next year.",
      "accepted": [
        "I plan to go to Suzhou Foreign Language High School next year.",
        "Next year I''m going to study at Suzhou Foreign Language High School."
      ]
    }
  ]$jsonb$::jsonb,

  correction_tasks = $jsonb$[
    {
      "wrong": "I will to call you this evening.",
      "model": "I will call you this evening.",
      "hint":  "will 后面接动词原形",
      "why":   "**will 是情态动词**，后面**永远直接接动词原形**，不能加 to。"
    },
    {
      "wrong": "He wills come to the party next Friday.",
      "model": "He will come to the party next Friday.",
      "hint":  "情态动词无人称变化",
      "why":   "**情态动词** (will / can / must / should) **没有第三人称单数 -s**。永远是 will。"
    },
    {
      "wrong": "I going to learn Japanese next year.",
      "model": "I am going to learn Japanese next year.",
      "hint":  "be going to 的 be 不能漏",
      "why":   "**be going to** 是固定结构，be 动词必须与主语匹配（I am / he is / they are）。"
    },
    {
      "wrong": "If it will rain tomorrow, I will bring an umbrella.",
      "model": "If it rains tomorrow, I will bring an umbrella.",
      "hint":  "if 从句不能用 will",
      "why":   "**主将从现**：if / when / as soon as / before 引导的从句中表将来用一般现在时，主句才用 will。"
    },
    {
      "wrong": "Do you going to study tonight?",
      "model": "Are you going to study tonight?",
      "hint":  "be going to 用 be 提前",
      "why":   "**be going to** 的疑问句用 **be 动词提前**（Am / Is / Are + 主语 + going to ...），不用 do/does。"
    },
    {
      "wrong": "She is going to visits her grandma this weekend.",
      "model": "She is going to visit her grandma this weekend.",
      "hint":  "going to 后用动词原形",
      "why":   "**going to + 动词原形**（不带 -s 不带 -ed）。visits → **visit**。"
    }
  ]$jsonb$::jsonb,

  boss_questions = $jsonb$[
    {
      "stem": "— Someone is knocking at the door.\n— I ___ get it.",
      "option_a": "am going to",
      "option_b": "will",
      "option_c": "would",
      "option_d": "am",
      "correct_answer": "B",
      "trap": "选 A 暗示\"已经计划好\"，但敲门是**当场情况、当场决定** — 用 will 才自然。",
      "why":  "**will = 当场决定**。be going to 用于已经计划好的事。"
    },
    {
      "stem": "Look at those black clouds! It ___ rain very soon.",
      "option_a": "will",
      "option_b": "is going to",
      "option_c": "is",
      "option_d": "rains",
      "correct_answer": "B",
      "trap": "选 A 也表\"会下雨\"，但**眼前已有迹象**（黑云）→ 更准用 be going to。中考最常考的细分场景。",
      "why":  "**be going to = 基于现有迹象的预测**。看到黑云就知道要下雨。"
    },
    {
      "stem": "I ___ Tom as soon as he ___ home.",
      "option_a": "will call / will get",
      "option_b": "will call / gets",
      "option_c": "call / gets",
      "option_d": "will call / get",
      "correct_answer": "B",
      "trap": "选 A/D 在 as soon as 从句用了 will — 错。选 C 主句漏 will。",
      "why":  "**主将从现**：as soon as 从句用一般现在时（gets），主句用 will（will call）。第三人称 he → gets。"
    },
    {
      "stem": "— ___ you ___ the football match this weekend?\n— Yes, I''ve already bought a ticket.",
      "option_a": "Will / watch",
      "option_b": "Do / watch",
      "option_c": "Are / going to watch",
      "option_d": "Are / watching",
      "correct_answer": "C",
      "trap": "选 A 也对，但已经买票 → 是**计划好的事**，用 be going to 更准。选 B/D 时态错。",
      "why":  "**\"已经买票\"= 已有计划** → be going to。疑问句 be 动词提前：**Are you going to watch ...?**"
    }
  ]$jsonb$::jsonb

WHERE code = 'g8.03';


UPDATE junior_grammar_points SET teacher_script = $jsonb$[
  {
    "text": "今天解锁**一般将来时**。中考写作里\"明天会怎样\"\"我打算干什么\"全靠它。",
    "show": "🎯 Today: will + V  vs  be going to + V",
    "duration": 9
  },
  {
    "text": "两种结构：**will + 动词原形** 和 **be going to + 动词原形**。意思相近，但**侧重不同**。",
    "show": "will V   |   be going to V",
    "highlight": "be going to",
    "duration": 10
  },
  {
    "text": "**will 用在两种场景**：① 当场决定 ② 主观判断 / 承诺。电话响了 — I **will** answer it。",
    "show": "Phone rings → I will answer.",
    "highlight": "will answer",
    "duration": 11
  },
  {
    "text": "**be going to 用在两种场景**：① 已经计划好 ② 看到迹象的预测。看到黑云 — It **is going to** rain。",
    "show": "Black clouds → It is going to rain.",
    "highlight": "is going to rain",
    "duration": 12
  },
  {
    "text": "**铁律 ①**：will 是情态动词，**后面永远直接接动词原形**，不能加 to。",
    "show": "✗ I will to help.   ✓ I will help.",
    "highlight": "will help",
    "duration": 10
  },
  {
    "text": "**铁律 ②**：be going to 里的 **be 不能漏**，且要随主语变（I am / he is / they are）。",
    "show": "I am going to ...   He is going to ...   They are going to ...",
    "highlight": "am / is / are",
    "duration": 11
  },
  {
    "text": "**最高频陷阱**：if / when / as soon as 从句里**绝不能**用 will！If it **rains** tomorrow, I will stay home.",
    "show": "✗ If it will rain ...   ✓ If it rains ...",
    "highlight": "rains",
    "duration": 12
  },
  {
    "text": "理论讲完。下一关进入 6 个真实场景练习，再去打题。",
    "show": "Next → 6 Real-life Scenarios 📚",
    "duration": 7
  }
]$jsonb$::jsonb
WHERE code = 'g8.03';


DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.03')
  AND sort_order BETWEEN 9000 AND 9099;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.03')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  (
    '— Who will help us with the heavy bags?\n— I ___.',
    'mcq', 'do', 'will', 'am going', 'am', 'B',
    NULL::text[],
    '当场决定帮忙 → 用 will。简短回答 = I will。',
    '{}'::jsonb, NULL, 'future_will_decision', false, 1, 9000
  ),
  (
    'Look! The cat ___ jump off the wall.',
    'mcq', 'will', 'is going to', 'is', 'jumps', 'B',
    NULL::text[],
    '眼前有迹象（猫准备跳）→ be going to。',
    '{}'::jsonb, NULL, 'future_going_to_evidence', false, 2, 9001
  ),
  (
    'If you ___ early tomorrow, please ___ me.',
    'mcq', 'will arrive / call', 'arrive / will call', 'arrive / call', 'will arrive / will call', 'B',
    NULL::text[],
    'if 从句一般现在时 (arrive) + 主句祈使句（call）— please 后接动词原形，但因为是主句"请你打电话给我"，是命令 / 请求语气，用动词原形即可。',
    '{}'::jsonb, '提示：祈使句作主句也算"将来语境"，但句子结构是 please + 动词原形。', 'future_subordinate_clause', false, 2, 9002
  ),
  (
    'Tom ___ a doctor when he grows up. He always says so.',
    'mcq', 'is going to be', 'will be', 'is', 'be', 'A',
    NULL::text[],
    '"always says so"提示这是 Tom **已经决定好**的志向 → be going to。当然 will 也能勉强用，但 be going to 更准。',
    '{}'::jsonb, NULL, 'future_going_to_plan', false, 3, 9003
  ),

  (
    'We ____ (have) a party next Saturday. Would you like to come?',
    'fill', NULL, NULL, NULL, NULL, 'are going to have',
    ARRAY['are going to have', '''re going to have', 'will have']::text[],
    '已经计划好的派对 → be going to have；当然 will have 也接受。',
    '{}'::jsonb, NULL, 'future_going_to', false, 1, 9004
  ),
  (
    'I think Lin ____ (win) the singing contest.',
    'fill', NULL, NULL, NULL, NULL, 'will win',
    ARRAY['will win']::text[],
    '"I think"是主观判断 → **will**。',
    '{}'::jsonb, NULL, 'future_will_predict', false, 1, 9005
  ),
  (
    'As soon as the rain ____ (stop), we will go out for a walk.',
    'fill', NULL, NULL, NULL, NULL, 'stops',
    ARRAY['stops']::text[],
    '主将从现：as soon as 从句一般现在时 + 第三人称单数 → **stops**。',
    '{}'::jsonb, NULL, 'future_subordinate_clause', false, 2, 9006
  ),

  (
    '改写为 be going to 句：  "I plan to visit my grandma this weekend."',
    'transform', NULL, NULL, NULL, NULL, 'I am going to visit my grandma this weekend.',
    ARRAY[
      'I am going to visit my grandma this weekend.',
      'I''m going to visit my grandma this weekend.'
    ]::text[],
    'plan to do = be going to do。',
    '{}'::jsonb, NULL, 'future_going_to_transform', true, 2, 9007
  ),
  (
    '把句子改成一般将来时（提示：tomorrow）：  "I do my homework after dinner."',
    'transform', NULL, NULL, NULL, NULL, 'I will do my homework after dinner tomorrow.',
    ARRAY[
      'I will do my homework after dinner tomorrow.',
      'I am going to do my homework after dinner tomorrow.'
    ]::text[],
    'tomorrow → 将来时。可用 will 或 be going to。',
    '{}'::jsonb, NULL, 'future_transform_basic', true, 2, 9008
  ),

  (
    '改错：  "If it will be sunny tomorrow, we will play football."',
    'correction', NULL, NULL, NULL, NULL, 'If it is sunny tomorrow, we will play football.',
    ARRAY[
      'If it is sunny tomorrow, we will play football.'
    ]::text[],
    'if 从句不能用 will，必须用一般现在时 **is**。',
    '{}'::jsonb, NULL, 'future_no_will_in_if', true, 2, 9009
  ),
  (
    '改错：  "Do you going to the new shopping mall this Sunday?"',
    'correction', NULL, NULL, NULL, NULL, 'Are you going to the new shopping mall this Sunday?',
    ARRAY[
      'Are you going to the new shopping mall this Sunday?'
    ]::text[],
    'be going to 的疑问句用 **Are/Is + 主语 + going to**，不用 do/does。',
    '{}'::jsonb, NULL, 'future_going_to_question', true, 2, 9010
  ),

  (
    '把这句话译成英文：明天我和爸爸打算一起去爬山。',
    'translation', NULL, NULL, NULL, NULL, 'My dad and I are going to climb the mountain tomorrow.',
    ARRAY[
      'My dad and I are going to climb the mountain tomorrow.',
      'My father and I are going to go hiking tomorrow.',
      'Tomorrow my dad and I will climb the mountain together.',
      'My dad and I are going hiking tomorrow.'
    ]::text[],
    '考点：① "打算"= 已有计划 → be going to；② "我和爸爸"用 my dad and I（注意 I 放后面）；③ "去爬山"= climb the mountain / go hiking。',
    '{}'::jsonb, '更地道：go hiking 比 climb the mountain 更日常；语序 "my dad and I" 比 "I and my dad" 更礼貌（自己放后面）。', 'future_translation', true, 3, 9011
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
  SELECT id, content_depth INTO v_point_id, v_depth FROM junior_grammar_points WHERE code = 'g8.03';
  IF v_point_id IS NULL THEN
    RAISE EXCEPTION 'Gold-standard migration failed: junior_grammar_points row with code=''g8.03'' does not exist.';
  END IF;
  IF v_depth <> 3 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: content_depth for g8.03 is %, expected 3.', v_depth;
  END IF;
  SELECT count(*) INTO v_q_count
  FROM junior_grammar_questions
  WHERE point_id = v_point_id AND sort_order BETWEEN 9000 AND 9099;
  IF v_q_count <> 12 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: expected 12 questions for g8.03, got %.', v_q_count;
  END IF;
  RAISE NOTICE 'Gold-standard migration for g8.03 verified: content_depth=3, % questions seeded.', v_q_count;
END $$;
