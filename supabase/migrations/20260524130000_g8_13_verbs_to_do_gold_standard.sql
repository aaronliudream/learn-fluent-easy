-- =====================================================================
-- Gold-standard content for G8 · 动词 + to do · Verbs + to-infinitive
-- Code: g8.13   Category: verb
-- =====================================================================
-- Reinforces g8.11 (infinitive). Focus: which verbs DEMAND to-do
-- (vs g8.12 verbs that demand V-ing), and the ask/tell sb to do pattern.
-- =====================================================================

UPDATE junior_grammar_points
SET
  summary = '"想做 / 希望做 / 决定做 / 答应做……" — 一组动词后面**必须**接 to do，背熟它们写作不再卡。',
  hook_line_cn = '中考写作高频动词搭配：want / hope / decide / plan / promise + to do。一组词背完，复杂句立刻能拼。',
  hook_line = 'A core list of 中考 verbs that demand "to do" — memorize the set, unlock natural English.',
  mnemonic = 'want / hope / plan / decide / promise / agree / refuse + **to do**；ask / tell / teach / order **sb to do**。',
  content_depth = 3,

  explanation_md = E'## 🎯 一句话搞定\n\n**有些动词后面只能跟 to do**（不能跟 V-ing）— 必背两类：直接接 to do、 加上 sb 再接 to do。\n\n---\n\n## 📐 两类必背搭配\n\n### ① 动词 + to do（不加宾语）\n\n| 动词 | 含义 | 例子 |\n|---|---|---|\n| **want** | 想 | I **want to be** a doctor. |\n| **hope** | 希望 | She **hopes to visit** Beijing. |\n| **plan** | 计划 | We **plan to travel** this summer. |\n| **decide** | 决定 | They **decided to leave**. |\n| **promise** | 答应 | He **promised to call** me. |\n| **agree** | 同意 | She **agreed to help**. |\n| **refuse** | 拒绝 | He **refused to answer**. |\n| **learn** | 学习 | We **learn to swim**. |\n| **would like** | 想要 | I **would like to drink** tea. |\n| **be going to** | 打算 | I **am going to study** abroad. |\n\n### ② 动词 + sb + to do（接人作宾语，再接 to do）\n\n| 动词 | 含义 | 例子 |\n|---|---|---|\n| **ask** | 要求 | Mom **asked me to clean** my room. |\n| **tell** | 告诉 | Dad **told me to do** homework first. |\n| **teach** | 教 | She **teaches me to play** the violin. |\n| **order** | 命令 | The teacher **ordered him to stand** up. |\n| **want** | 想要 sb 做 | I **want you to come** with me. |\n| **expect** | 期望 | They **expect us to win**. |\n| **invite** | 邀请 | She **invited me to her** party. |\n| **allow** | 允许 | My mom **allows me to play** for an hour. |\n\n> ⚠️ **铁律 ①**：以上动词后面**只能跟 to do**，**不能跟 V-ing**！  \n> ⚠️ **铁律 ②**：第二类必须**先接 sb（宾语），再接 to do**。\n\n---\n\n## 🔥 对比：v + to do vs v + doing 的常见动词\n\n| + to do | + V-ing |\n|---|---|\n| want / hope / plan / decide / promise / agree / refuse / learn / would like | enjoy / finish / mind / practice / keep / give up / avoid |\n| ask / tell / teach / order / invite / allow sb to do | （这些不接 sb 模式）|\n\n→ I **want to learn** Chinese.（不是 want learning）  \n→ I **enjoy learning** Chinese.（不是 enjoy to learn）\n\n---\n\n## ⏰ 看到这些 = 用 to do\n\n- want / hope / plan / decide / promise + 空格\n- ask / tell / teach + sb + 空格\n- 句意是"想做 / 希望做 / 答应做 / 让某人做某事"\n- 不定式作宾语补足语\n\n---\n\n## ⚠️ Top 5 易错点（中考批卷红笔常出现）\n\n1. **want / hope 后用 V-ing**：~~I want learning English.~~ → **I want to learn English.**\n2. **ask sb 接动词原形**：~~Mom asked me clean my room.~~ → **Mom asked me to clean my room.**\n3. **decide 后接动词原形**：~~She decided stay at home.~~ → **She decided to stay at home.**\n4. **would like 后省 to**：~~Would you like drink something?~~ → **Would you like to drink something?**\n5. **promise 否定形式错位**：~~She promised to don''t tell.~~ → **She promised not to tell.**（not 放 to 前）\n\n---\n\n## 🧠 三秒判断口诀\n\n> ① 想 / 希望 / 计划 / 决定 / 答应 + **to do**  \n> ② 让 / 教 / 告诉 / 要求 / 邀请 + **sb + to do**  \n> ③ 否定时 **not 放在 to 前**：promised **not to** tell',

  immersion_cards = $jsonb$[
    {"situation": "Sharing your future career plan", "cn": "我想成为一名英语老师。", "en": "I want to be an English teacher."},
    {"situation": "Pen pal asks about your summer", "cn": "我计划这个暑假去云南。", "en": "I plan to visit Yunnan this summer."},
    {"situation": "Mom assigns chores after dinner", "cn": "妈妈让我洗碗。", "en": "Mom asked me to do the dishes."},
    {"situation": "Apologizing for forgetting a promise", "cn": "我答应明天还书。", "en": "I promised to return the books tomorrow."},
    {"situation": "Tutor''s strict policy on her class", "cn": "她不允许我们上课玩手机。", "en": "She doesn''t allow us to use phones in class."},
    {"situation": "Inviting friends to your birthday", "cn": "我想邀请你来我的生日派对。", "en": "I''d like to invite you to my birthday party."}
  ]$jsonb$::jsonb,

  contrast_table = $jsonb$[
    {"lhs": "I want learning Japanese next year.",          "rhs": "I want to learn Japanese next year."},
    {"lhs": "Mom asked me clean my room.",                   "rhs": "Mom asked me to clean my room."},
    {"lhs": "She decided staying at home.",                  "rhs": "She decided to stay at home."},
    {"lhs": "Would you like drink some water?",              "rhs": "Would you like to drink some water?"},
    {"lhs": "She promised to don''t tell anyone.",            "rhs": "She promised not to tell anyone."},
    {"lhs": "The teacher told us no to be late.",            "rhs": "The teacher told us not to be late."}
  ]$jsonb$::jsonb,

  reflex_cards = $jsonb$[
    {"cn": "我希望明年去上海。",              "en": "I hope to visit Shanghai next year.",           "keyword": "hope to visit"},
    {"cn": "他决定不参加比赛。",              "en": "He decided not to take part in the contest.",   "keyword": "decided not to"},
    {"cn": "妈妈让我多吃水果。",              "en": "Mom asked me to eat more fruit.",               "keyword": "asked me to eat"},
    {"cn": "老师告诉我们不要迟到。",          "en": "The teacher told us not to be late.",           "keyword": "told us not to"},
    {"cn": "你想喝点什么吗？",                "en": "Would you like to drink something?",            "keyword": "Would you like to"},
    {"cn": "他答应明天还书。",                "en": "He promised to return the books tomorrow.",     "keyword": "promised to return"},
    {"cn": "我教我弟弟骑车。",                "en": "I teach my brother to ride a bike.",            "keyword": "teach ... to ride"},
    {"cn": "她拒绝告诉我答案。",              "en": "She refused to tell me the answer.",            "keyword": "refused to tell"}
  ]$jsonb$::jsonb,

  situation_drills = $jsonb$[
    {
      "situation": "Telling your parents about your plan for next term.",
      "cn": "我打算多花点时间练习写作。",
      "en": "I plan to spend more time practicing writing.",
      "accepted": [
        "I''m planning to spend more time on writing practice.",
        "I want to put more time into practicing writing."
      ]
    },
    {
      "situation": "Reporting Mom''s rule to your sibling.",
      "cn": "妈妈让你晚饭前做完作业。",
      "en": "Mom told you to finish your homework before dinner.",
      "accepted": [
        "Mom asked you to finish your homework before dinner.",
        "Mom said you should finish your homework before dinner."
      ]
    },
    {
      "situation": "Inviting your foreign pen pal to your home.",
      "cn": "我想邀请你这个暑假来中国玩。",
      "en": "I would like to invite you to visit China this summer.",
      "accepted": [
        "I''d like to invite you to come to China this summer.",
        "I want to invite you to spend the summer in China."
      ]
    },
    {
      "situation": "Explaining a refusal to a classmate.",
      "cn": "他拒绝告诉我们昨天发生了什么。",
      "en": "He refused to tell us what happened yesterday.",
      "accepted": [
        "He refused to say what had happened.",
        "He wouldn''t tell us what had happened."
      ]
    }
  ]$jsonb$::jsonb,

  correction_tasks = $jsonb$[
    {
      "wrong": "I want learning English well.",
      "model": "I want to learn English well.",
      "hint":  "want + to do",
      "why":   "**want + to do**（必须接不定式，不能接 V-ing）。"
    },
    {
      "wrong": "Mom asked me clean my room.",
      "model": "Mom asked me to clean my room.",
      "hint":  "ask sb + to do",
      "why":   "**ask + sb + to do**：必须先接宾语 me，再加 **to do**。"
    },
    {
      "wrong": "She decided staying at home all day.",
      "model": "She decided to stay at home all day.",
      "hint":  "decide + to do",
      "why":   "**decide + to do**（不接 V-ing）。staying → to stay。"
    },
    {
      "wrong": "Would you like drink some hot tea?",
      "model": "Would you like to drink some hot tea?",
      "hint":  "would like + to do",
      "why":   "**would like + to do** 是固定礼貌邀请句型。漏 to 错。"
    },
    {
      "wrong": "She promised to don''t tell my secret.",
      "model": "She promised not to tell my secret.",
      "hint":  "not 放 to 前",
      "why":   "**不定式的否定 = not + to do**：not 在 to **前面**，不是用 don''t。"
    },
    {
      "wrong": "The teacher told us no to be late again.",
      "model": "The teacher told us not to be late again.",
      "hint":  "否定用 not",
      "why":   "**否定形式 = not to do**，不是 no to do。no 不能否定不定式。"
    }
  ]$jsonb$::jsonb,

  boss_questions = $jsonb$[
    {
      "stem": "Lin hopes ___ a famous singer in the future.",
      "option_a": "be",
      "option_b": "being",
      "option_c": "to be",
      "option_d": "is",
      "correct_answer": "C",
      "trap": "选 A 漏 to；选 B hope 不接 ing；选 D 时态错。",
      "why":  "**hope + to do**；\"成为歌手\"= to be a singer。"
    },
    {
      "stem": "Mom told me ___ on the road.",
      "option_a": "don''t run",
      "option_b": "not to run",
      "option_c": "not run",
      "option_d": "to not run",
      "correct_answer": "B",
      "trap": "选 A/C 用 don''t/no — 不定式否定用 not。选 D not 位置错。",
      "why":  "**否定不定式 = not + to do**：not **在 to 前**。"
    },
    {
      "stem": "She refused ___ us why she was so angry.",
      "option_a": "telling",
      "option_b": "tell",
      "option_c": "to tell",
      "option_d": "told",
      "correct_answer": "C",
      "trap": "选 A ing 错；选 B 漏 to；选 D 过去式错。",
      "why":  "**refuse + to do**：refuse 后必须接 to do。"
    },
    {
      "stem": "The teacher asked us ___ phones ___ class.",
      "option_a": "not to use / during",
      "option_b": "don''t use / in",
      "option_c": "not using / during",
      "option_d": "to not use / in",
      "correct_answer": "A",
      "trap": "选 B/D 否定位置错。选 C ing 错。",
      "why":  "**ask + sb + not to do**：not 在 to 前；**during class** = 上课期间。"
    }
  ]$jsonb$::jsonb

WHERE code = 'g8.13';


UPDATE junior_grammar_points SET teacher_script = $jsonb$[
  {
    "text": "今天解锁**动词 + to do** 固定搭配。中考写作高频，背熟一组词，复杂句立刻能拼。",
    "show": "🎯 Today: verb + to do (the must-know list)",
    "duration": 10
  },
  {
    "text": "**第一类**：直接 + to do — **want / hope / plan / decide / promise / agree / refuse**。",
    "show": "want / hope / plan / decide / promise + to do",
    "highlight": "+ to do",
    "duration": 12
  },
  {
    "text": "**第二类**：先接宾语 sb，再 + to do — **ask / tell / teach / order / invite / allow**。",
    "show": "ask / tell sb + to do",
    "highlight": "sb + to do",
    "duration": 11
  },
  {
    "text": "**举例 ①** ：I **want to be** a doctor。**Mom asked me to clean** my room。",
    "show": "I want to be a doctor.   Mom asked me to clean my room.",
    "highlight": "to be ... to clean",
    "duration": 12
  },
  {
    "text": "**否定形式** = **not to do**：not 在 to **前面**！Mom told me **not to be** late。",
    "show": "✗ to not be   ✓ not to be",
    "highlight": "not to be",
    "duration": 12
  },
  {
    "text": "**最大坑**：want / decide / promise 后**绝对不能 + V-ing**！~~want learning~~ → **want to learn**。",
    "show": "✗ want learning   ✓ want to learn",
    "highlight": "want to learn",
    "duration": 11
  },
  {
    "text": "**对比**：enjoy / finish / mind / practice 那一组才接 V-ing。两套搭配分开记。",
    "show": "want to do   vs   enjoy doing",
    "highlight": "to do ... doing",
    "duration": 11
  },
  {
    "text": "理论讲完。下一关 6 个真实场景。",
    "show": "Next → 6 Real-life Scenarios 📚",
    "duration": 7
  }
]$jsonb$::jsonb
WHERE code = 'g8.13';


DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.13')
  AND sort_order BETWEEN 9000 AND 9099;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.13')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  (
    'Tom decided ___ harder this term.',
    'mcq', 'study', 'studying', 'to study', 'studied', 'C',
    NULL::text[],
    'decide + to do。',
    '{}'::jsonb, NULL, 'verb_to_do_decide', false, 1, 9000
  ),
  (
    'Mom asked me ___ my homework before dinner.',
    'mcq', 'finish', 'finishing', 'to finish', 'finished', 'C',
    NULL::text[],
    'ask + sb + to do。',
    '{}'::jsonb, NULL, 'verb_to_do_ask_sb', false, 1, 9001
  ),
  (
    'The doctor told Dad ___ smoking immediately.',
    'mcq', 'to give up', 'give up', 'giving up', 'gave up', 'A',
    NULL::text[],
    'tell + sb + to do；give up smoking 中 give up 是固定搭配但前面要 to → **to give up**。',
    '{}'::jsonb, NULL, 'verb_to_do_tell_sb', false, 2, 9002
  ),
  (
    'She promised ___ angry with me anymore.',
    'mcq', 'don''t be', 'not be', 'not to be', 'to not be', 'C',
    NULL::text[],
    'promise + not to do；not 放 to 前。',
    '{}'::jsonb, NULL, 'verb_to_do_negative', false, 3, 9003
  ),

  (
    'I want ____ (be) a scientist when I grow up.',
    'fill', NULL, NULL, NULL, NULL, 'to be',
    ARRAY['to be']::text[],
    'want + to be。',
    '{}'::jsonb, NULL, 'verb_to_do_want', false, 1, 9004
  ),
  (
    'Dad taught me ____ (ride) a bike when I was 6.',
    'fill', NULL, NULL, NULL, NULL, 'to ride',
    ARRAY['to ride']::text[],
    'teach + sb + to do。',
    '{}'::jsonb, NULL, 'verb_to_do_teach_sb', false, 2, 9005
  ),
  (
    'Lin agreed ____ (help) us with our math homework.',
    'fill', NULL, NULL, NULL, NULL, 'to help',
    ARRAY['to help']::text[],
    'agree + to do。',
    '{}'::jsonb, NULL, 'verb_to_do_agree', false, 1, 9006
  ),

  (
    '改写为 ask sb to do 句：  "Mom said: ''Please clean the table.''" (对 me 说)',
    'transform', NULL, NULL, NULL, NULL, 'Mom asked me to clean the table.',
    ARRAY[
      'Mom asked me to clean the table.'
    ]::text[],
    '直接引语转 ask sb to do。',
    '{}'::jsonb, NULL, 'verb_to_do_transform', true, 2, 9007
  ),
  (
    '改写为否定不定式：  "She promised that she would not tell anyone."',
    'transform', NULL, NULL, NULL, NULL, 'She promised not to tell anyone.',
    ARRAY[
      'She promised not to tell anyone.'
    ]::text[],
    'promise + not to do。',
    '{}'::jsonb, NULL, 'verb_to_do_negative_transform', true, 2, 9008
  ),

  (
    '改错：  "I hope visiting Beijing one day."',
    'correction', NULL, NULL, NULL, NULL, 'I hope to visit Beijing one day.',
    ARRAY[
      'I hope to visit Beijing one day.'
    ]::text[],
    'hope + to do（不接 V-ing）。',
    '{}'::jsonb, NULL, 'verb_to_do_hope', true, 1, 9009
  ),
  (
    '改错：  "Mom told me to not be late for school."',
    'correction', NULL, NULL, NULL, NULL, 'Mom told me not to be late for school.',
    ARRAY[
      'Mom told me not to be late for school.'
    ]::text[],
    '否定不定式 = not to do，not **在 to 前**。',
    '{}'::jsonb, NULL, 'verb_to_do_negative_position', true, 2, 9010
  ),

  (
    '把这句话译成英文：老师叫我们这周末不要熬夜。',
    'translation', NULL, NULL, NULL, NULL, 'The teacher told us not to stay up late this weekend.',
    ARRAY[
      'The teacher told us not to stay up late this weekend.',
      'The teacher asked us not to stay up late this weekend.',
      'Our teacher told us not to stay up late on the weekend.'
    ]::text[],
    '考点：① tell + sb + not to do；② "熬夜"= stay up late；③ "这周末"= this weekend / on the weekend。',
    '{}'::jsonb, '更地道：tell sb not to do 用于命令性语气，ask sb not to do 用于请求；"熬夜"= stay up late（固定搭配）。', 'verb_to_do_translation', true, 3, 9011
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
  SELECT id, content_depth INTO v_point_id, v_depth FROM junior_grammar_points WHERE code = 'g8.13';
  IF v_point_id IS NULL THEN
    RAISE EXCEPTION 'Gold-standard migration failed: junior_grammar_points row with code=''g8.13'' does not exist.';
  END IF;
  IF v_depth <> 3 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: content_depth for g8.13 is %, expected 3.', v_depth;
  END IF;
  SELECT count(*) INTO v_q_count
  FROM junior_grammar_questions
  WHERE point_id = v_point_id AND sort_order BETWEEN 9000 AND 9099;
  IF v_q_count <> 12 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: expected 12 questions for g8.13, got %.', v_q_count;
  END IF;
  RAISE NOTICE 'Gold-standard migration for g8.13 verified: content_depth=3, % questions seeded.', v_q_count;
END $$;
