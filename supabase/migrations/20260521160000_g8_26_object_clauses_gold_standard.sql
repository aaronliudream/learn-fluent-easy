-- =====================================================================
-- Gold-standard content for G8 · 宾语从句 · Object Clauses
-- Code: g8.26   Category: clause
-- =====================================================================
-- The "三大原则" 中考 essential: 连接词 + 陈述语序 + 时态一致.
-- Most-missed point in 中考 单选 because of subtle word-order traps.
-- =====================================================================

UPDATE junior_grammar_points
SET
  summary = '把疑问句"塞进"另一个句子里 — 中考单选语序考点 + 写作复杂句首选。',
  hook_line_cn = '中考单选最爱挖坑的点：语序、时态、连接词。三招拆掉，宾语从句不再丢分。',
  hook_line = 'Embed any question inside another sentence — the cornerstone of complex 中考 writing.',
  mnemonic = '宾语从句三招：连接词对 + 陈述语序 + 时态一致。',
  content_depth = 3,

  explanation_md = E'## 🎯 一句话搞定\n\n**把一个完整句子当作"宾语"塞进另一个句子** → 用 **连接词 + 陈述语序 + 时态一致**。\n\n---\n\n## 📐 三大原则（中考必考）\n\n### ① 连接词怎么选？\n\n| 原句类型 | 连接词 | 例子 |\n|---|---|---|\n| 陈述句 → 从句 | **that**（口语可省） | I think **(that) he is right**. |\n| 一般疑问句 → 从句 | **if / whether** | I don''t know **if / whether he will come**. |\n| 特殊疑问句 → 从句 | **原疑问词**（when/where/why/how/what/who） | Tell me **where you live**. |\n\n### ② 陈述语序（最高频考点！）\n\n从句**必须**用主谓陈述语序，**不能**用疑问句的倒装。\n\n- ✗ Tell me **where do you live**.（疑问语序，错！）  \n- ✓ Tell me **where you live**.（陈述语序，对！）\n\n### ③ 时态一致\n\n| 主句时态 | 从句时态规则 |\n|---|---|\n| 现在时 | 从句**任何时态**都行（按事实选） |\n| 过去时 | 从句必须用**相应的过去时态** |\n\n- He **says** he **is** tired.（主现，从现 OK）\n- He **said** he **was** tired.（主过 → 从必须过）\n\n> ⚠️ **例外**：从句是**客观真理 / 自然规律 / 永恒事实**时，永远用一般现在时。  \n> The teacher said the earth **is** round.（不是 was round）\n\n---\n\n## ⏰ 看到这些词 = 宾语从句\n\n- **think / believe / hope / know / wonder / find / feel** + 宾语从句\n- **say / tell / ask** + (sb) + 宾语从句\n- **see / hear / understand** + 宾语从句\n- **Could / Can you tell me ...?**（礼貌的间接疑问）\n\n---\n\n## 🔥 三种连接词实战\n\n### that（陈述句）— 口语可省\n- I know **(that) you are honest**.\n\n### if / whether（一般疑问句）— "是否"\n- Ask him **if he likes tea**.\n- I wonder **whether you are free tomorrow**.\n- 后面接 **or not** 通常用 **whether** 更稳：whether **or not** you agree...\n\n### 疑问词（特殊疑问句）— 直接照搬\n- Where does he live? → I don''t know **where he lives**.  \n  （注意 does 消失了，第三人称单数加 -s 体现在动词上）\n\n---\n\n## ⚠️ Top 5 易错点（中考批卷红笔常出现）\n\n1. **疑问语序没改**：~~Tell me where do you live.~~ → **Tell me where you live.**\n2. **时态不一致**：~~He said he is busy.~~ → **He said he was busy.**\n3. **第三人称单数 -s 漏了**：~~I don''t know where he live.~~ → **I don''t know where he lives.**\n4. **客观真理也跟着退时态**：~~The teacher told me the sun rose in the east.~~ → **The teacher told me the sun rises in the east.**\n5. **疑问代词当连接词时漏掉**：~~I don''t know is he at home.~~ → **I don''t know if / whether he is at home.**\n\n---\n\n## 🧠 三秒判断口诀\n\n> ① 原句类型 → 选对连接词（that / if / wh-）  \n> ② 立刻改成**陈述语序**（主语在前，动词在后）  \n> ③ 看主句时态：是过去时？从句也要过去时（客观真理除外）',

  immersion_cards = $jsonb$[
    {"situation": "Telling your mom your honest opinion", "cn": "我觉得这部电影很无聊。", "en": "I think (that) this film is boring."},
    {"situation": "Asking a stranger for directions", "cn": "您能告诉我图书馆怎么走吗？", "en": "Could you tell me how I can get to the library?"},
    {"situation": "Wondering about your classmate''s absence", "cn": "我想知道她今天为什么没来。", "en": "I wonder why she didn''t come today."},
    {"situation": "Repeating what the teacher said", "cn": "老师说地球绕着太阳转。", "en": "The teacher said the earth goes around the sun."},
    {"situation": "Asking a friend if they''re free", "cn": "明天晚上你有空吗？", "en": "I''d like to know if / whether you are free tomorrow evening."},
    {"situation": "Sharing news with your parents", "cn": "我哥说他下周就回来。", "en": "My brother said (that) he would come back next week."}
  ]$jsonb$::jsonb,

  contrast_table = $jsonb$[
    {"lhs": "Tell me where do you live.",                    "rhs": "Tell me where you live."},
    {"lhs": "He said he is busy yesterday.",                  "rhs": "He said he was busy yesterday."},
    {"lhs": "I don''t know where he live.",                   "rhs": "I don''t know where he lives."},
    {"lhs": "The teacher told us the sun rose in the east.",  "rhs": "The teacher told us the sun rises in the east."},
    {"lhs": "I don''t know is he at home now.",               "rhs": "I don''t know if / whether he is at home now."},
    {"lhs": "Could you tell me what time is it?",             "rhs": "Could you tell me what time it is?"}
  ]$jsonb$::jsonb,

  reflex_cards = $jsonb$[
    {"cn": "我觉得他是对的。",                "en": "I think (that) he is right.",                       "keyword": "think (that) he is"},
    {"cn": "你能告诉我现在几点了吗？",        "en": "Could you tell me what time it is?",                "keyword": "what time it is"},
    {"cn": "我不知道她住哪儿。",              "en": "I don''t know where she lives.",                    "keyword": "where she lives"},
    {"cn": "他问我喜不喜欢茶。",              "en": "He asked me if / whether I liked tea.",             "keyword": "if / whether I liked"},
    {"cn": "妈妈说她马上回来。",              "en": "Mom said (that) she would come back soon.",         "keyword": "she would"},
    {"cn": "我想知道考试什么时候开始。",      "en": "I wonder when the exam starts.",                    "keyword": "when the exam starts"},
    {"cn": "老师告诉我们光速最快。",          "en": "The teacher told us that light travels fastest.",   "keyword": "light travels fastest"},
    {"cn": "你知道他为什么迟到吗？",          "en": "Do you know why he was late?",                      "keyword": "why he was late"}
  ]$jsonb$::jsonb,

  situation_drills = $jsonb$[
    {
      "situation": "A foreign tourist asks you politely how to get to the train station.",
      "cn": "请问您能告诉我去火车站怎么走吗？",
      "en": "Excuse me, could you tell me how I can get to the train station?",
      "accepted": [
        "Could you please tell me how to get to the train station?",
        "Excuse me, do you know the way to the train station?"
      ]
    },
    {
      "situation": "Reporting to your teacher why your classmate is absent today.",
      "cn": "他说他今早觉得不太舒服。",
      "en": "He said (that) he didn''t feel well this morning.",
      "accepted": [
        "He told me he wasn''t feeling well this morning.",
        "He said he was feeling sick this morning."
      ]
    },
    {
      "situation": "Asking a friend at school about an upcoming math test.",
      "cn": "你知道下周一是不是考数学吗？",
      "en": "Do you know if / whether we have the math test next Monday?",
      "accepted": [
        "Do you know whether the math test is next Monday?",
        "Do you know if there''s a math test next Monday?"
      ]
    },
    {
      "situation": "Your mom asks what your science teacher said today.",
      "cn": "她说水的沸点是 100 度。",
      "en": "She said (that) water boils at 100°C.",
      "accepted": [
        "She told us water boils at 100 degrees.",
        "She said water''s boiling point is 100°C."
      ]
    }
  ]$jsonb$::jsonb,

  correction_tasks = $jsonb$[
    {
      "wrong": "Could you tell me where do you live?",
      "model": "Could you tell me where you live?",
      "hint":  "宾语从句用陈述语序",
      "why":   "宾语从句必须是**陈述语序**（主语 + 动词），不能用疑问句的 do + 主语 + 动词原形。"
    },
    {
      "wrong": "He said he is very tired yesterday.",
      "model": "He said he was very tired yesterday.",
      "hint":  "主句过去时，从句要过去时",
      "why":   "**时态一致原则**：主句是过去时（said），从句也必须用相应的过去时（was tired）。"
    },
    {
      "wrong": "I don''t know where he live now.",
      "model": "I don''t know where he lives now.",
      "hint":  "第三人称单数",
      "why":   "陈述语序下，**第三人称单数 he/she/it** 后的动词要加 **-s/-es**：live → **lives**。"
    },
    {
      "wrong": "The teacher told us light traveled faster than sound.",
      "model": "The teacher told us light travels faster than sound.",
      "hint":  "客观真理永远用一般现在时",
      "why":   "**客观真理 / 自然规律**（光速、地球转、水沸点等）在宾语从句中**永远用一般现在时**，即使主句是过去时。"
    },
    {
      "wrong": "I don''t know is he at home now.",
      "model": "I don''t know if / whether he is at home now.",
      "hint":  "缺连接词",
      "why":   "原句是一般疑问句\"Is he at home?\" → 宾语从句要加连接词 **if / whether**，再改成陈述语序。"
    },
    {
      "wrong": "Could you tell me what time is it now?",
      "model": "Could you tell me what time it is now?",
      "hint":  "陈述语序",
      "why":   "原句 \"What time is it?\" 是疑问语序。宾语从句要还原为 **what time it is**（主语 it 在前）。"
    }
  ]$jsonb$::jsonb,

  boss_questions = $jsonb$[
    {
      "stem": "Could you tell me ___ Mr. Lee lives now?",
      "option_a": "where does",
      "option_b": "where do",
      "option_c": "where",
      "option_d": "that where",
      "correct_answer": "C",
      "trap": "选 A/B 是把疑问语序留了进来 — 中考最爱的陷阱。选 D 多加 that 累赘错误。",
      "why":  "宾语从句**陈述语序**：where + 主语 (Mr. Lee) + 动词 (lives)。不能用 does/do + 主语。"
    },
    {
      "stem": "The teacher told us that the moon ___ around the earth.",
      "option_a": "went",
      "option_b": "was going",
      "option_c": "goes",
      "option_d": "is going",
      "correct_answer": "C",
      "trap": "选 A 跟着主句过去时退时态 — 错！客观真理 (moon orbits earth) 永远用一般现在时。选 B/D 进行时也错。",
      "why":  "**客观真理 / 自然规律**在宾语从句中**永远用一般现在时**，即使主句是过去时 (told)。"
    },
    {
      "stem": "I''m not sure ___ he will agree with us or not.",
      "option_a": "if",
      "option_b": "that",
      "option_c": "whether",
      "option_d": "what",
      "correct_answer": "C",
      "trap": "选 A (if) 在普通场景可以，但**当后面紧接 \"or not\" 时只能用 whether**。中考高频考点。",
      "why":  "**whether ... or not** 是固定搭配，if 不能与 or not 直接连用（必须分开：if he will agree ... or not）。"
    },
    {
      "stem": "Lin asked her father ___ from work that evening.",
      "option_a": "when he comes back",
      "option_b": "when did he come back",
      "option_c": "when he came back",
      "option_d": "when does he come back",
      "correct_answer": "C",
      "trap": "选 A/D 没遵守时态一致；选 B 没改成陈述语序。三个原则的综合考查。",
      "why":  "主句 asked = 过去 → 从句也要过去 (came back)；同时疑问语序 did he come 改成陈述语序 **he came**。"
    }
  ]$jsonb$::jsonb

WHERE code = 'g8.26';


UPDATE junior_grammar_points SET teacher_script = $jsonb$[
  {
    "text": "今天解锁**宾语从句**。中考单选最爱挖坑的点，三个原则学会，丢分不超过一题。",
    "show": "🎯 Today: Object Clauses · 3 Rules to Master",
    "duration": 9
  },
  {
    "text": "**原则 ①**：选对连接词。陈述句用 **that**（可省）；一般疑问用 **if / whether**；特殊疑问用**原疑问词**。",
    "show": "that  |  if / whether  |  when / where / why ...",
    "highlight": "if / whether",
    "duration": 12
  },
  {
    "text": "**原则 ②** （最高频考点）：从句必须用**陈述语序** — 主语在前，动词在后。",
    "show": "✗ Tell me where do you live.   ✓ Tell me where you live.",
    "highlight": "where you live",
    "duration": 12
  },
  {
    "text": "**原则 ③**：时态一致。主句过去时 → 从句也要过去时。He **said** he **was** busy.",
    "show": "main = past  →  clause = past",
    "highlight": "was",
    "duration": 10
  },
  {
    "text": "**例外**：客观真理永远是一般现在时。老师过去说\"地球绕太阳转\"，从句还是用 goes。",
    "show": "The teacher said the earth goes around the sun.",
    "highlight": "goes",
    "duration": 11
  },
  {
    "text": "**坑点 1**：第三人称单数别忘加 -s：I don''t know where he **lives**.",
    "show": "✗ where he live   ✓ where he lives",
    "highlight": "lives",
    "duration": 10
  },
  {
    "text": "**坑点 2**：if 后面紧跟 \"or not\" 不行，要用 whether。**whether ... or not** 是固定搭配。",
    "show": "whether you agree or not   ✓",
    "highlight": "whether ... or not",
    "duration": 11
  },
  {
    "text": "三原则 + 两个坑都学完。下一关进入真实场景练习，听完再去打题。",
    "show": "Next → 6 Real-life Scenarios 📚",
    "duration": 7
  }
]$jsonb$::jsonb
WHERE code = 'g8.26';


DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.26')
  AND sort_order BETWEEN 9000 AND 9099;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.26')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  -- ─── 4 MCQs ───
  (
    'Could you tell me ___ ?',
    'mcq', 'where is the post office', 'where the post office is', 'where does the post office', 'is where the post office', 'B',
    NULL::text[],
    '宾语从句陈述语序：where + 主语 (the post office) + 动词 (is)。',
    '{}'::jsonb, NULL, 'object_clause_word_order', false, 1, 9000
  ),
  (
    'I don''t know ___ he will come tomorrow or not.',
    'mcq', 'if', 'that', 'whether', 'what', 'C',
    NULL::text[],
    '后面紧跟 "or not" → 只能用 **whether**，if 不行。',
    '{}'::jsonb, NULL, 'object_clause_whether_or_not', false, 2, 9001
  ),
  (
    'Our science teacher told us light ___ faster than sound.',
    'mcq', 'traveled', 'travels', 'is traveling', 'will travel', 'B',
    NULL::text[],
    '客观真理（光速）在宾语从句中**永远用一般现在时** → travels。',
    '{}'::jsonb, NULL, 'object_clause_truth', false, 2, 9002
  ),
  (
    'The headteacher asked me ___ then.',
    'mcq', 'why was I crying', 'why I was crying', 'why am I crying', 'why I am crying', 'B',
    NULL::text[],
    '主句过去 (asked) + 陈述语序 → **why I was crying**。',
    '{}'::jsonb, NULL, 'object_clause_tense_order', false, 3, 9003
  ),

  -- ─── 3 fill-in ───
  (
    'Do you know ____ (live) the man in this building?',
    'fill', NULL, NULL, NULL, NULL, 'where lives',
    ARRAY['where lives', 'how lives', 'who lives']::text[],
    '这是宾语从句中关系/疑问词的练习。提示：句中是"man"作主语 → who lives。',
    '{}'::jsonb, '提示：填的是连接词 + 动词的合体（陈述语序里的），考查对宾语从句结构的灵活理解。', 'object_clause_word_order', true, 2, 9004
  ),
  (
    'Mom asked me ____ I had finished my homework.',
    'fill', NULL, NULL, NULL, NULL, 'if',
    ARRAY['if', 'whether']::text[],
    '原句是 "Have you finished?" 一般疑问句 → 连接词用 **if** 或 **whether**。',
    '{}'::jsonb, NULL, 'object_clause_if_whether', false, 1, 9005
  ),
  (
    'I think the new film ____ (be) really exciting. You should see it.',
    'fill', NULL, NULL, NULL, NULL, 'is',
    ARRAY['is']::text[],
    '主句 I think 是现在时 → 从句按事实选时态。电影现在还在上映 → 现在时 **is**。',
    '{}'::jsonb, NULL, 'object_clause_tense', false, 1, 9006
  ),

  -- ─── 2 transform ───
  (
    '改写为宾语从句（用 Could you tell me 开头）：  "What time does the bus leave?"',
    'transform', NULL, NULL, NULL, NULL, 'Could you tell me what time the bus leaves?',
    ARRAY[
      'Could you tell me what time the bus leaves?',
      'Could you tell me when the bus leaves?'
    ]::text[],
    '陈述语序 + 第三人称单数加 -s：does leave → **leaves**。',
    '{}'::jsonb, NULL, 'object_clause_transform', true, 2, 9007
  ),
  (
    '改写为宾语从句（用 I wonder 开头）：  "Will it rain tomorrow?"',
    'transform', NULL, NULL, NULL, NULL, 'I wonder if / whether it will rain tomorrow.',
    ARRAY[
      'I wonder if it will rain tomorrow.',
      'I wonder whether it will rain tomorrow.',
      'I wonder if / whether it will rain tomorrow.'
    ]::text[],
    '一般疑问句 → 用 if/whether；陈述语序 it will rain。',
    '{}'::jsonb, NULL, 'object_clause_transform', true, 2, 9008
  ),

  -- ─── 2 correction ───
  (
    '改错：  "I want to know how can I get to the bookstore."',
    'correction', NULL, NULL, NULL, NULL, 'I want to know how I can get to the bookstore.',
    ARRAY[
      'I want to know how I can get to the bookstore.'
    ]::text[],
    '陈述语序：how + 主语 (I) + 助动词 (can) + 动词 (get)。',
    '{}'::jsonb, NULL, 'object_clause_word_order', true, 2, 9009
  ),
  (
    '改错：  "He said the sun rose in the east every morning."',
    'correction', NULL, NULL, NULL, NULL, 'He said the sun rises in the east every morning.',
    ARRAY[
      'He said the sun rises in the east every morning.'
    ]::text[],
    '客观真理（日出东方）在宾语从句中**永远用一般现在时** → rises。',
    '{}'::jsonb, NULL, 'object_clause_truth', true, 3, 9010
  ),

  -- ─── 1 translation ───
  (
    '把这句话译成英文：你能告诉我今天的作业是什么吗？',
    'translation', NULL, NULL, NULL, NULL, 'Could you tell me what today''s homework is?',
    ARRAY[
      'Could you tell me what today''s homework is?',
      'Could you tell me what the homework for today is?',
      'Can you tell me what our homework today is?',
      'Could you please tell me what today''s homework is?'
    ]::text[],
    '考点：① "你能告诉我"→ Could you tell me（更礼貌）；② 宾语从句陈述语序：what + 主语 + 动词 (is)；③ "今天的作业" → today''s homework。',
    '{}'::jsonb, '中考阅卷里，写成 "what is today''s homework" 是高频扣分点，记住宾语从句要倒回陈述语序。', 'object_clause_translation', true, 3, 9011
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
  SELECT id, content_depth INTO v_point_id, v_depth FROM junior_grammar_points WHERE code = 'g8.26';
  IF v_point_id IS NULL THEN
    RAISE EXCEPTION 'Gold-standard migration failed: junior_grammar_points row with code=''g8.26'' does not exist.';
  END IF;
  IF v_depth <> 3 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: content_depth for g8.26 is %, expected 3.', v_depth;
  END IF;
  SELECT count(*) INTO v_q_count
  FROM junior_grammar_questions
  WHERE point_id = v_point_id AND sort_order BETWEEN 9000 AND 9099;
  IF v_q_count <> 12 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: expected 12 questions in 9000-9099 for g8.26, got %.', v_q_count;
  END IF;
  RAISE NOTICE 'Gold-standard migration for g8.26 verified: content_depth=3, % questions seeded.', v_q_count;
END $$;
