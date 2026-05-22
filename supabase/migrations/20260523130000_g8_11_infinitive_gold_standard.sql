-- =====================================================================
-- Gold-standard content for G8 · 动词不定式 · Infinitive
-- Code: g8.11   Category: verb
-- =====================================================================
-- to + 动词原形 — 4 uses (object, purpose, post-modifier, formal subject).
-- Pairs tightly with g8.12 (gerund) and g8.13 (verbs + to do).
-- =====================================================================

UPDATE junior_grammar_points
SET
  summary = '"to + 动词原形" — 想干啥、为啥、要干啥都靠它，中考写作里最常见的非谓语动词。',
  hook_line_cn = '不定式 = 句子里的"乐高积木"：作宾语、作目的、作定语、作真主语 — 4 种用法学完，写作长难句立刻会拼。',
  hook_line = 'To + verb — the LEGO block of complex 中考 writing.',
  mnemonic = 'to do = 想做 / 去做 / 待做 / 难做；情态动词后不用 to，have/let/make/help 后省略 to。',
  content_depth = 3,

  explanation_md = E'## 🎯 一句话搞定\n\n**to + 动词原形** = 动词的"非谓语"形式，可以在句子里**当名词、形容词、副词**用。\n\n---\n\n## 📐 4 大用法（中考全覆盖）\n\n### ① 作宾语（最常见）\n动词 + **to do**：want / hope / plan / decide / would like / promise / refuse / learn\n- I **want to be** a doctor.\n- She **hopes to visit** Beijing.\n- We **decided to leave** early.\n\n### ② 作目的状语（"为了……"）\n- He went to the library **to borrow books**.（为了借书）\n- I''m studying hard **to pass the exam**.（为了通过考试）\n- 强调目的时也可用 **in order to** / **so as to**。\n\n### ③ 作定语（后置，"待做的"）\n- Do you have anything **to drink**?（待喝的东西）\n- He has a lot of homework **to do**.（要做的作业）\n- 注意：不定代词 + 形容词 + **to do** 的顺序。\n\n### ④ "It is + adj + to do something."（形式主语）\n- **It is** important **to study** English well.（学好英语很重要）\n- **It is** hard **to learn** Japanese.\n\n> ⚠️ **铁律**：不定式永远是 **to + 动词原形**（不带 -s 不带 -ed 不带 -ing）。\n\n---\n\n## 🔥 不带 to 的特殊场合（必背）\n\n| 动词 | 后面接 | 例子 |\n|---|---|---|\n| **情态动词** (can / must / should / will / may) | + **动词原形** | I **can swim**. (不是 to swim) |\n| **使役动词** (let / make / have) | + sb + **动词原形** | Mom **let me play**. |\n| **感官动词** (see / hear / watch / feel) | + sb + **动词原形** | I **saw him leave**. |\n| **help** | + sb + (to) 动词原形 | She **helped me (to) clean** the room.（to 可省）|\n\n---\n\n## ⏰ 看到这些 = 不定式\n\n- 主动词（want / hope / decide / plan）后面 → **to do**\n- "为了做某事" → **to do**\n- 名词后面"待做的" → **to do**（something to eat）\n- **It is + adj + to do** 句式\n- ask / tell / order / teach + sb + **to do**\n\n---\n\n## ⚠️ Top 5 易错点（中考批卷红笔常出现）\n\n1. **want / hope 后用 V-ing**：~~I want learning English.~~ → **I want to learn English.**\n2. **情态动词后加 to**：~~I can to swim.~~ → **I can swim.**\n3. **see / let / make 后接 to do**：~~Mom let me to play.~~ → **Mom let me play.**\n4. **形容词修饰不定代词时位置错**：~~something to eat hot~~ → **something hot to eat**\n5. **to be 漏掉 be**：~~I want a doctor.~~（表愿望） → **I want to be a doctor.**\n\n---\n\n## 🧠 三秒判断口诀\n\n> ① want / hope / plan / decide / would like + **to do**  \n> ② 情态动词 / 使役动词 / 感官动词后 → **不带 to**  \n> ③ 表"为了…" → **to do**（不用 for doing）  \n> ④ 不定代词 + adj + **to do** 是固定顺序',

  immersion_cards = $jsonb$[
    {"situation": "Telling your mom about your dream job", "cn": "我想当一名医生。", "en": "I want to be a doctor."},
    {"situation": "Explaining why you''re heading to the library", "cn": "我去图书馆借几本书。", "en": "I''m going to the library to borrow some books."},
    {"situation": "Asking a friend if they need food", "cn": "你想吃点东西吗？", "en": "Would you like something to eat?"},
    {"situation": "Encouraging a discouraged classmate", "cn": "学好英语很重要。", "en": "It is important to study English well."},
    {"situation": "Promising your tutor to work harder", "cn": "我答应你下次会更努力。", "en": "I promise to work harder next time."},
    {"situation": "Mom''s rule when you ask to play games", "cn": "妈妈让我先做完作业。", "en": "Mom told me to finish my homework first."}
  ]$jsonb$::jsonb,

  contrast_table = $jsonb$[
    {"lhs": "I want learning English well.",                "rhs": "I want to learn English well."},
    {"lhs": "I can to swim very fast.",                     "rhs": "I can swim very fast."},
    {"lhs": "Mom let me to play computer games.",            "rhs": "Mom let me play computer games."},
    {"lhs": "Would you like something to eat hot?",          "rhs": "Would you like something hot to eat?"},
    {"lhs": "I want a doctor when I grow up.",               "rhs": "I want to be a doctor when I grow up."},
    {"lhs": "She decided staying at home today.",            "rhs": "She decided to stay at home today."}
  ]$jsonb$::jsonb,

  reflex_cards = $jsonb$[
    {"cn": "我希望明年去北京。",              "en": "I hope to visit Beijing next year.",            "keyword": "hope to visit"},
    {"cn": "他每天读书是为了通过考试。",      "en": "He reads every day to pass the exam.",          "keyword": "to pass"},
    {"cn": "你有什么要喝的吗？",              "en": "Do you have anything to drink?",                "keyword": "anything to drink"},
    {"cn": "学英语并不难。",                  "en": "It is not difficult to learn English.",         "keyword": "It is ... to learn"},
    {"cn": "妈妈让我做作业。",                "en": "Mom told me to do my homework.",                "keyword": "told me to do"},
    {"cn": "我帮她搬箱子。",                  "en": "I helped her (to) move the box.",               "keyword": "helped her (to) move"},
    {"cn": "她答应不告诉别人。",              "en": "She promised not to tell anyone.",              "keyword": "promised not to tell"},
    {"cn": "妈妈让我看电视半小时。",          "en": "Mom let me watch TV for half an hour.",         "keyword": "let me watch"}
  ]$jsonb$::jsonb,

  situation_drills = $jsonb$[
    {
      "situation": "Telling your parents about your career plan for the next decade.",
      "cn": "我打算先去读医学院，然后再当医生。",
      "en": "I plan to go to medical school first and then to become a doctor.",
      "accepted": [
        "I''m planning to attend medical school and then become a doctor.",
        "First I want to study medicine, then I want to be a doctor."
      ]
    },
    {
      "situation": "Explaining to a friend why you went to the bookstore on the weekend.",
      "cn": "我去那儿是为了买一本数学练习册。",
      "en": "I went there to buy a math workbook.",
      "accepted": [
        "I went there in order to buy a math workbook.",
        "The reason I went there was to get a math workbook."
      ]
    },
    {
      "situation": "Asking a guest if they''d like to choose a drink.",
      "cn": "你想喝点冰的还是热的？",
      "en": "Would you like something cold or something hot to drink?",
      "accepted": [
        "Would you prefer a cold drink or a hot one?",
        "Would you like a cold or hot drink?"
      ]
    },
    {
      "situation": "Encouraging your discouraged little brother about reading English.",
      "cn": "其实读懂一本英文书并没有那么难。",
      "en": "Actually, it''s not that hard to read an English book all the way through.",
      "accepted": [
        "Reading an English book isn''t as hard as you think.",
        "It''s easier than you think to read through an English book."
      ]
    }
  ]$jsonb$::jsonb,

  correction_tasks = $jsonb$[
    {
      "wrong": "I want learning English well.",
      "model": "I want to learn English well.",
      "hint":  "want 后接 to do",
      "why":   "**want / hope / plan / decide / would like + to do**（不接 V-ing）。"
    },
    {
      "wrong": "I can to play the piano very well.",
      "model": "I can play the piano very well.",
      "hint":  "情态动词后无 to",
      "why":   "**情态动词**（can / must / should / will / may）后面**直接接动词原形**，不加 to。"
    },
    {
      "wrong": "Mom let me to play games for an hour.",
      "model": "Mom let me play games for an hour.",
      "hint":  "let + sb + 动词原形",
      "why":   "**使役动词 let / make / have + sb + 动词原形**（不带 to）。"
    },
    {
      "wrong": "Would you like something to eat hot?",
      "model": "Would you like something hot to eat?",
      "hint":  "形容词在 to do 前",
      "why":   "**不定代词 + 形容词 + to do**：something + hot + to eat（顺序固定）。"
    },
    {
      "wrong": "I want a doctor when I grow up.",
      "model": "I want to be a doctor when I grow up.",
      "hint":  "want + to be + 名词",
      "why":   "表\"想成为某种身份\" → 必须用 **to be + 名词**。want 后面直接接名词意思是\"想要这个人/物\"。"
    },
    {
      "wrong": "She decided staying at home today.",
      "model": "She decided to stay at home today.",
      "hint":  "decide 后接 to do",
      "why":   "**decide + to do**（不接 V-ing）。stay → to stay。"
    }
  ]$jsonb$::jsonb,

  boss_questions = $jsonb$[
    {
      "stem": "Mom told me ___ my room before lunch.",
      "option_a": "clean",
      "option_b": "cleaning",
      "option_c": "to clean",
      "option_d": "cleaned",
      "correct_answer": "C",
      "trap": "选 A 漏了 to（tell sb to do）。选 B 用了 ing。选 D 用了过去式。",
      "why":  "**tell / ask / order / teach + sb + to do**。tell me → to clean。"
    },
    {
      "stem": "I went to the supermarket ___ some milk for breakfast.",
      "option_a": "buy",
      "option_b": "to buy",
      "option_c": "buying",
      "option_d": "bought",
      "correct_answer": "B",
      "trap": "选 A 漏 to。选 C/D 时态错。",
      "why":  "表\"为了……\" = **to + 动词原形**（目的状语）。"
    },
    {
      "stem": "It''s important ___ regularly to stay healthy.",
      "option_a": "exercise",
      "option_b": "exercising",
      "option_c": "to exercise",
      "option_d": "exercises",
      "correct_answer": "C",
      "trap": "选 B 把不定式换成了 V-ing — 但 It is + adj + **to do** 是固定结构。",
      "why":  "**It is + 形容词 + to do something** 是固定句式。to exercise = 真正的主语。"
    },
    {
      "stem": "Lin saw the new student ___ into the classroom and ___ shy.",
      "option_a": "walk / looks",
      "option_b": "to walk / look",
      "option_c": "walk / look",
      "option_d": "walking / looked",
      "correct_answer": "C",
      "trap": "选 B 加 to — 感官动词不带 to。选 D ing 也对但和后面 look 形式不匹配。",
      "why":  "**感官动词 see / hear / watch + sb + 动词原形**（看到完整动作）。两个动词并列，时态一致。"
    }
  ]$jsonb$::jsonb

WHERE code = 'g8.11';


UPDATE junior_grammar_points SET teacher_script = $jsonb$[
  {
    "text": "今天解锁**动词不定式**。中考写作长难句的乐高积木 — 4 大用法学完，写作立刻升级。",
    "show": "🎯 Today: to + verb = the LEGO block",
    "duration": 9
  },
  {
    "text": "**核心**：to + 动词原形（不带 s 不带 ed 不带 ing）。",
    "show": "to + V (原形)",
    "highlight": "to + V",
    "duration": 9
  },
  {
    "text": "**用法 ①** 作宾语：want / hope / plan / decide / would like + **to do**。",
    "show": "I want to be a doctor.",
    "highlight": "to be",
    "duration": 11
  },
  {
    "text": "**用法 ②** 作目的状语（为了……）：He went there **to borrow books**。",
    "show": "He went there to borrow books.",
    "highlight": "to borrow",
    "duration": 10
  },
  {
    "text": "**用法 ③** 作定语：something **to eat**, anything **to drink**, books **to read**。",
    "show": "something to eat   anything to drink",
    "highlight": "to eat",
    "duration": 11
  },
  {
    "text": "**用法 ④** It is + adj + **to do**：**It is important to study English well**。",
    "show": "It is important to study English well.",
    "highlight": "to study",
    "duration": 12
  },
  {
    "text": "**铁律**：情态动词后**不带 to**！I **can swim**，不是 ~~can to swim~~。",
    "show": "✗ can to swim   ✓ can swim",
    "highlight": "can swim",
    "duration": 11
  },
  {
    "text": "**使役 / 感官动词**（let / make / have / see / hear）后也**不带 to**。下一关进入实战。",
    "show": "let / make / see + sb + V (原形)",
    "highlight": "V (原形)",
    "duration": 10
  }
]$jsonb$::jsonb
WHERE code = 'g8.11';


DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.11')
  AND sort_order BETWEEN 9000 AND 9099;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.11')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  (
    'Lin hopes ___ a teacher in the future.',
    'mcq', 'be', 'to be', 'being', 'is', 'B',
    NULL::text[],
    'hope + to do；"成为老师"= to be a teacher。',
    '{}'::jsonb, NULL, 'infinitive_object', false, 1, 9000
  ),
  (
    'I''m going to the library ___ a book about Suzhou.',
    'mcq', 'borrow', 'to borrow', 'borrowing', 'borrowed', 'B',
    NULL::text[],
    '"为了借书"= 目的状语 to borrow。',
    '{}'::jsonb, NULL, 'infinitive_purpose', false, 1, 9001
  ),
  (
    'It is easy ___ the new English app on your phone.',
    'mcq', 'use', 'to use', 'using', 'uses', 'B',
    NULL::text[],
    'It is + 形容词 + **to do something** 是固定句式。',
    '{}'::jsonb, NULL, 'infinitive_formal_subject', false, 2, 9002
  ),
  (
    'Mom let me ___ TV after I ___ my homework.',
    'mcq', 'watch / finish', 'to watch / finish', 'watch / finished', 'to watch / finished', 'C',
    NULL::text[],
    'let + sb + 动词原形（watch）；过去时 "做完作业" finished。',
    '{}'::jsonb, NULL, 'infinitive_let_past', false, 3, 9003
  ),

  (
    'I want ____ (be) a doctor when I grow up.',
    'fill', NULL, NULL, NULL, NULL, 'to be',
    ARRAY['to be']::text[],
    'want + to do；"成为医生"= to be a doctor。',
    '{}'::jsonb, NULL, 'infinitive_basic', false, 1, 9004
  ),
  (
    'Tom went to the supermarket ____ (buy) some fruit.',
    'fill', NULL, NULL, NULL, NULL, 'to buy',
    ARRAY['to buy']::text[],
    '目的状语 → to + 动词原形。',
    '{}'::jsonb, NULL, 'infinitive_purpose', false, 1, 9005
  ),
  (
    'It''s important ____ (have) breakfast every morning.',
    'fill', NULL, NULL, NULL, NULL, 'to have',
    ARRAY['to have']::text[],
    'It is + adj + to do = 固定句式。',
    '{}'::jsonb, NULL, 'infinitive_formal_subject', false, 2, 9006
  ),

  (
    '改写为不定式句：  "I went to the cinema. I wanted to watch the new film."',
    'transform', NULL, NULL, NULL, NULL, 'I went to the cinema to watch the new film.',
    ARRAY[
      'I went to the cinema to watch the new film.'
    ]::text[],
    '合并为目的状语 to watch。',
    '{}'::jsonb, NULL, 'infinitive_combine_purpose', true, 2, 9007
  ),
  (
    '用 It is ... to do 句型改写：  "Speaking English every day is helpful."',
    'transform', NULL, NULL, NULL, NULL, 'It is helpful to speak English every day.',
    ARRAY[
      'It is helpful to speak English every day.'
    ]::text[],
    '形式主语 It is + adj + to do。',
    '{}'::jsonb, NULL, 'infinitive_formal_subject_transform', true, 3, 9008
  ),

  (
    '改错：  "I want learning Japanese next year."',
    'correction', NULL, NULL, NULL, NULL, 'I want to learn Japanese next year.',
    ARRAY[
      'I want to learn Japanese next year.'
    ]::text[],
    'want + to do（不接 V-ing）。',
    '{}'::jsonb, NULL, 'infinitive_want_to_do', true, 1, 9009
  ),
  (
    '改错：  "Mom let me to go to the party last Saturday."',
    'correction', NULL, NULL, NULL, NULL, 'Mom let me go to the party last Saturday.',
    ARRAY[
      'Mom let me go to the party last Saturday.'
    ]::text[],
    'let + sb + **动词原形**（不带 to）。',
    '{}'::jsonb, NULL, 'infinitive_no_to_after_let', true, 2, 9010
  ),

  (
    '把这句话译成英文：每天早晨阅读半小时英文是个好习惯。',
    'translation', NULL, NULL, NULL, NULL, 'It is a good habit to read English for half an hour every morning.',
    ARRAY[
      'It is a good habit to read English for half an hour every morning.',
      'Reading English for half an hour every morning is a good habit.',
      'It''s a good habit to read English half an hour every morning.'
    ]::text[],
    '考点：① It is + 名词短语 + to do 固定句式；② "半小时"= for half an hour；③ 不定式 to read 作真主语。',
    '{}'::jsonb, '更地道：It is a good habit to ... 比 Reading ... is a good habit 更常用，开头形式主语更英语。', 'infinitive_translation', true, 3, 9011
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
  SELECT id, content_depth INTO v_point_id, v_depth FROM junior_grammar_points WHERE code = 'g8.11';
  IF v_point_id IS NULL THEN
    RAISE EXCEPTION 'Gold-standard migration failed: junior_grammar_points row with code=''g8.11'' does not exist.';
  END IF;
  IF v_depth <> 3 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: content_depth for g8.11 is %, expected 3.', v_depth;
  END IF;
  SELECT count(*) INTO v_q_count
  FROM junior_grammar_questions
  WHERE point_id = v_point_id AND sort_order BETWEEN 9000 AND 9099;
  IF v_q_count <> 12 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: expected 12 questions for g8.11, got %.', v_q_count;
  END IF;
  RAISE NOTICE 'Gold-standard migration for g8.11 verified: content_depth=3, % questions seeded.', v_q_count;
END $$;
