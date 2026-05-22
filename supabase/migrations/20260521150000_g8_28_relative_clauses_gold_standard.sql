-- =====================================================================
-- Gold-standard content for G8 · 定语从句 · Relative Clauses
-- Code: g8.28   Category: clause
-- =====================================================================
-- 中考单选 + 阅读高频考点。Covers: who / which / that / whose,
-- antecedent-pronoun agreement, common Chinese-student errors
-- (which for people, missing relative pronoun, "who's name"
-- confusion, that-only contexts).
-- =====================================================================

UPDATE junior_grammar_points
SET
  summary = '在名词后面挂一条"修饰小尾巴"，让一句话说更多信息 — 中考阅读长句的核心结构。',
  hook_line_cn = '中考阅读看不懂的长句，70% 是定语从句。学会拆它，长难句直接降两个难度。',
  hook_line = 'Master relative clauses — the structural backbone of every long 中考 reading sentence.',
  mnemonic = '人用 who，物用 which，人物都行 that，所有格用 whose。',
  content_depth = 3,

  explanation_md = E'## 🎯 一句话搞定\n\n**给名词加一条"修饰小尾巴"** → 在名词后面用 **who / which / that / whose** 引出一个从句。\n\n---\n\n## 📐 关系词四件套\n\n| 修饰的名词 | 在从句里作 | 关系词 | 例子 |\n|---|---|---|---|\n| **人** | 主语 | **who / that** | The boy **who is** wearing glasses is Tom. |\n| **人** | 宾语 | **whom / that / 省略** | The boy **(whom) I met** yesterday is Tom. |\n| **物** | 主语 / 宾语 | **which / that** | The book **which / that I bought** is great. |\n| **人或物** | 所有格 | **whose** | The girl **whose hair** is long is Lisa. |\n\n> ⚠️ **铁律**：在从句里作**主语**时**不能省略**关系词；作**宾语**时**可以省略**。\n\n---\n\n## ⏰ 看到这些信号 = 定语从句\n\n- 名词后面紧跟 **who / which / that / whose**\n- 名词后面紧跟"空缺关系词"+ 主谓结构（如 The book I bought ...）\n- 两个动词围着同一个名词转 → 中间一定有关系词\n- "the + 形容词最高级" / "the only" / "all" / "every" 后面 → 用 **that** 不用 which\n\n---\n\n## 🔥 三大用法实战\n\n### ① who 修饰人，在从句中作主语\n- The teacher **who teaches** us math is very kind.\n- 拆开：The teacher is kind. + **The teacher** teaches us math. → 重复的 the teacher → 用 who 代替。\n\n### ② which / that 修饰物\n- This is the book **which / that** I borrowed from the library.\n- 拆开：This is the book. + I borrowed **the book** from the library.\n\n### ③ whose 表所有格（人 + 物都能用）\n- I have a friend **whose father** is a doctor.\n- That''s the house **whose roof** is red.\n- 拆开：I have a friend. + **The friend''s** father is a doctor.\n\n---\n\n## ⚠️ Top 5 易错点（中考批卷红笔常出现）\n\n1. **用 which 指人**：~~The boy which is reading~~ → **The boy who / that is reading**\n2. **多了一个代词**：~~The book that I bought it~~ → **The book that I bought**（it 多余！）\n3. **whose 写成 who''s**：~~The girl who''s hair is long~~ → **The girl whose hair is long**（who''s = who is）\n4. **the only / 最高级后用 which**：~~He is the only one which can help~~ → **the only one that can help**\n5. **关系词作主语时漏掉**：~~The boy is reading is Tom.~~ → **The boy who is reading is Tom.**\n\n---\n\n## 🧠 三秒判断口诀\n\n> ① 先行词是**人**还是**物**？人 → who/that，物 → which/that  \n> ② 关系词在从句中作**主语**（不能省）还是**宾语**（可省）？  \n> ③ 看到 **the only / all / 最高级 / every** → 一律用 **that**',

  immersion_cards = $jsonb$[
    {"situation": "Pointing out a classmate in the playground", "cn": "戴眼镜的男孩是我哥哥。", "en": "The boy who is wearing glasses is my brother."},
    {"situation": "Recommending a novel", "cn": "这本书改变了我对编程的看法。", "en": "This is the book that changed my view on coding."},
    {"situation": "Introducing a new teacher", "cn": "她是儿子在我们班的那位老师。", "en": "She''s the teacher whose son is in our class."},
    {"situation": "Talking about a favorite restaurant", "cn": "我喜欢卖广式点心的餐厅。", "en": "I love restaurants which serve dim sum."},
    {"situation": "Telling a friend about Lu Xun", "cn": "鲁迅就是那个写《狂人日记》的作家。", "en": "Lu Xun is the writer who wrote A Madman''s Diary."},
    {"situation": "Praising the best student", "cn": "Lin 是我认识的最聪明的同学。", "en": "Lin is the smartest classmate that I know."}
  ]$jsonb$::jsonb,

  contrast_table = $jsonb$[
    {"lhs": "The boy which is reading is Tom.",          "rhs": "The boy who is reading is Tom."},
    {"lhs": "This is the book that I bought it.",        "rhs": "This is the book that I bought."},
    {"lhs": "I have a friend who''s father is a doctor.","rhs": "I have a friend whose father is a doctor."},
    {"lhs": "He is the only one which can help.",        "rhs": "He is the only one that can help."},
    {"lhs": "The boy is wearing glasses is Tom.",        "rhs": "The boy who is wearing glasses is Tom."},
    {"lhs": "The girl who I met her is Lin.",            "rhs": "The girl whom / that I met is Lin."}
  ]$jsonb$::jsonb,

  reflex_cards = $jsonb$[
    {"cn": "正在唱歌的女孩是我妹妹。",          "en": "The girl who is singing is my sister.",          "keyword": "who is singing"},
    {"cn": "这就是我说的那部电影。",             "en": "This is the film that I told you about.",       "keyword": "that I told you about"},
    {"cn": "我有个朋友，他家有只狗。",           "en": "I have a friend whose family has a dog.",       "keyword": "whose family"},
    {"cn": "她唱的歌很受欢迎。",                 "en": "The song that she sings is very popular.",      "keyword": "that she sings"},
    {"cn": "你认识那个穿红衣服的人吗？",         "en": "Do you know the man who is wearing red?",       "keyword": "who is wearing"},
    {"cn": "这是我读过最有趣的书。",             "en": "This is the most interesting book that I have ever read.", "keyword": "that I have ever read"},
    {"cn": "苹果是我最爱的水果之一。",           "en": "Apples are one of the fruits which I like best.","keyword": "which I like best"},
    {"cn": "屋顶是红色的房子是我家。",           "en": "The house whose roof is red is mine.",          "keyword": "whose roof is red"}
  ]$jsonb$::jsonb,

  situation_drills = $jsonb$[
    {
      "situation": "Pointing out your best friend in a group photo to your mom.",
      "cn": "穿蓝色 T 恤的那个就是我最好的朋友。",
      "en": "The boy who is wearing the blue T-shirt is my best friend.",
      "accepted": [
        "The one wearing the blue T-shirt is my best friend.",
        "That boy in the blue T-shirt is my best friend."
      ]
    },
    {
      "situation": "Recommending a movie to your English tutor.",
      "cn": "这部我上周看的电影你一定会喜欢。",
      "en": "This is the movie that I watched last week, and I''m sure you''ll like it.",
      "accepted": [
        "I watched a movie last week which you''ll definitely like.",
        "The movie I watched last week — I''m sure you''d enjoy it."
      ]
    },
    {
      "situation": "Telling a classmate about your favorite teacher.",
      "cn": "教我们数学的那个老师特别有耐心。",
      "en": "The teacher who teaches us math is very patient.",
      "accepted": [
        "Our math teacher, who is very patient, is great.",
        "The teacher that teaches us math is super patient."
      ]
    },
    {
      "situation": "Describing your neighbor''s house.",
      "cn": "屋顶是蓝色的那座房子是我家邻居。",
      "en": "The house whose roof is blue belongs to my neighbor.",
      "accepted": [
        "The house with the blue roof is my neighbor''s.",
        "My neighbor lives in the house whose roof is blue."
      ]
    }
  ]$jsonb$::jsonb,

  correction_tasks = $jsonb$[
    {
      "wrong": "The boy which is wearing glasses is my brother.",
      "model": "The boy who is wearing glasses is my brother.",
      "hint":  "先行词是人",
      "why":   "先行词 **the boy** 是"人"，关系词必须用 **who** 或 **that**，不能用 which。which 只修饰物。"
    },
    {
      "wrong": "This is the book that I bought it yesterday.",
      "model": "This is the book that I bought yesterday.",
      "hint":  "关系词已经代替了 it",
      "why":   "**that** 已经替代了 the book，从句里**不能再出现 it**。中考改错里这是高频陷阱。"
    },
    {
      "wrong": "I have a friend who''s name is Tony.",
      "model": "I have a friend whose name is Tony.",
      "hint":  "所有格用 whose",
      "why":   "**who''s = who is**（缩写），用在"是谁"的场景。所有格"谁的"必须用 **whose**。形似但意义完全不同。"
    },
    {
      "wrong": "He is the only one which can help us.",
      "model": "He is the only one that can help us.",
      "hint":  "the only 后必须用 that",
      "why":   "先行词被 **the only / all / 最高级 / every** 修饰时，关系词只能用 **that**，不能用 which。"
    },
    {
      "wrong": "The girl is sitting next to me is my cousin.",
      "model": "The girl who is sitting next to me is my cousin.",
      "hint":  "缺关系词",
      "why":   "关系词在从句中作**主语**时**不能省略**。这里 "is sitting" 缺主语，必须补上 **who** 或 **that**。"
    },
    {
      "wrong": "The teacher who I met him this morning is very kind.",
      "model": "The teacher whom / that I met this morning is very kind.",
      "hint":  "关系词已经代替了 him",
      "why":   "**whom / that** 已经替代了 the teacher（作 met 的宾语），从句里**不能再加 him**。"
    }
  ]$jsonb$::jsonb,

  boss_questions = $jsonb$[
    {
      "stem": "The man ___ is talking to my father is our new neighbor.",
      "option_a": "which",
      "option_b": "whose",
      "option_c": "who",
      "option_d": "what",
      "correct_answer": "C",
      "trap": "选 A 把人当成了物。选 B（whose）是所有格，但后面不是"谁的什么"。选 D（what）不能引导定语从句。",
      "why":  "先行词 the man 是人 + 关系词在从句作主语 → 必须用 **who**（或 that）。"
    },
    {
      "stem": "I have a friend ___ father is a famous chef in Suzhou.",
      "option_a": "who",
      "option_b": "whose",
      "option_c": "who''s",
      "option_d": "that",
      "correct_answer": "B",
      "trap": "选 C（who''s = who is）是中考改错最爱挖的坑 — 看似对，意思变成"是谁的爸爸"。选 A/D 都漏了"所有格"含义。",
      "why":  "father 前面缺一个"她的/他的" → 所有格 → **whose**。a friend whose father = 朋友的爸爸。"
    },
    {
      "stem": "This is the most interesting story ___ I have ever read.",
      "option_a": "which",
      "option_b": "who",
      "option_c": "that",
      "option_d": "whose",
      "correct_answer": "C",
      "trap": "选 A 在普通句子里也对，但**最高级修饰先行词**时只能用 **that**。中考高频考点。",
      "why":  "先行词被**形容词最高级 (the most interesting)** 修饰 → 关系词只能用 **that**。同类还有 the only / all / every / no。"
    },
    {
      "stem": "The book ___ on the desk belongs to me. ___ I borrowed yesterday is on the bookshelf.",
      "option_a": "which / The one",
      "option_b": "that / Which",
      "option_c": "that''s / The one which",
      "option_d": "that is / The one that",
      "correct_answer": "D",
      "trap": "第一空缺谓语（is）让句子完整；第二空 the one + 定语从句修饰。选 A 漏 is，选 B/C 结构错乱。",
      "why":  "第一空：The book (that is) on the desk → 关系词 + be 可省，但这里没省，应是 **that is**；第二空：开头需补 The one + **that** 引导从句。"
    }
  ]$jsonb$::jsonb

WHERE code = 'g8.28';


UPDATE junior_grammar_points SET teacher_script = $jsonb$[
  {
    "text": "今天解锁**定语从句**。它是中考阅读长难句的"骨架"，看懂它，长句直接降两个难度。",
    "show": "🎯 Today: Relative Clauses = sentence with a tail",
    "duration": 9
  },
  {
    "text": "核心：**名词后面挂一个修饰从句**。关系词四件套：**who / which / that / whose**。",
    "show": "Noun + [ who / which / that / whose ] + clause",
    "highlight": "who / which / that / whose",
    "duration": 11
  },
  {
    "text": "先行词是**人** → 用 **who** 或 that：The boy **who is** wearing glasses ...",
    "show": "person → who   |   The boy who is wearing glasses",
    "highlight": "who is",
    "duration": 10
  },
  {
    "text": "先行词是**物** → 用 **which** 或 that：The book **which / that** I bought ...",
    "show": "thing → which / that",
    "highlight": "which / that",
    "duration": 10
  },
  {
    "text": "**所有格"谁的"** → 用 **whose**（人物都可以）：a friend **whose father** ...",
    "show": "''s → whose",
    "highlight": "whose",
    "duration": 10
  },
  {
    "text": "**铁律**：关系词在从句中作**主语**时**绝对不能省**！"The boy is reading is Tom." 不完整，必须加 who。",
    "show": "✗ The boy is reading is Tom.   ✓ The boy who is reading is Tom.",
    "highlight": "who is reading",
    "duration": 12
  },
  {
    "text": "**坑点 1**：用 **which** 指人是中国学生最常犯的错。**坑点 2**：从句里多了 it / him / her 这种代词。",
    "show": "✗ The book that I bought it.   ✓ The book that I bought.",
    "highlight": "I bought",
    "duration": 12
  },
  {
    "text": "**坑点 3**：**the only / all / 最高级 / every** 后面只能用 **that**，不能用 which。理论讲完，下一关进入实战。",
    "show": "the only / all / the most ... → that",
    "highlight": "that",
    "duration": 10
  }
]$jsonb$::jsonb
WHERE code = 'g8.28';


DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.28')
  AND sort_order BETWEEN 9000 AND 9099;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.28')
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
    'The girl ___ is dancing on the stage is my classmate.',
    'mcq', 'which', 'who', 'whose', 'whom', 'B',
    NULL::text[],
    '先行词 the girl 是人 + 关系词在从句作主语 → **who**。',
    NULL::jsonb, NULL, 'relative_who_subject', false, 1, 9000
  ),
  (
    'This is the museum ___ we visited last weekend.',
    'mcq', 'who', 'whose', 'which', 'where', 'C',
    NULL::text[],
    '先行词 the museum 是物 + 在从句中作 visited 的宾语 → **which** (或 that)。注意：这里宾语关系，所以不用 where。',
    NULL::jsonb, NULL, 'relative_which_object', false, 2, 9001
  ),
  (
    'I have a classmate ___ mother is a famous singer.',
    'mcq', 'who', 'whose', 'whom', 'that', 'B',
    NULL::text[],
    'mother 前面缺所有格"她的" → **whose**。a classmate whose mother = 这位同学的妈妈。',
    NULL::jsonb, NULL, 'relative_whose', false, 2, 9002
  ),
  (
    'This is the best lesson ___ I have ever had.',
    'mcq', 'which', 'who', 'that', 'whose', 'C',
    NULL::text[],
    '先行词 the best lesson 被**形容词最高级 best** 修饰 → 关系词只能用 **that**。',
    NULL::jsonb, NULL, 'relative_that_only', false, 2, 9003
  ),

  -- ─── 3 fill-in ───
  (
    'The boy ____ is sitting next to me is from Beijing.',
    'fill', NULL, NULL, NULL, NULL, 'who',
    ARRAY['who', 'that']::text[],
    '人 + 主语 → who 或 that。',
    NULL::jsonb, NULL, 'relative_who_subject', false, 1, 9004
  ),
  (
    'I have a dog ____ legs are very short.',
    'fill', NULL, NULL, NULL, NULL, 'whose',
    ARRAY['whose']::text[],
    '"狗的腿"= 所有格 → **whose**。whose 既可用于人也可用于物。',
    NULL::jsonb, NULL, 'relative_whose_thing', false, 2, 9005
  ),
  (
    'This is the only book ____ can help you pass the exam.',
    'fill', NULL, NULL, NULL, NULL, 'that',
    ARRAY['that']::text[],
    'the only 后面只能用 **that**，不用 which。',
    NULL::jsonb, NULL, 'relative_that_only', false, 2, 9006
  ),

  -- ─── 2 transform ───
  (
    '把两个句子合并成一个定语从句：  "The man is my uncle. The man is talking to my dad."',
    'transform', NULL, NULL, NULL, NULL, 'The man who is talking to my dad is my uncle.',
    ARRAY[
      'The man who is talking to my dad is my uncle.',
      'The man that is talking to my dad is my uncle.'
    ]::text[],
    '重复的 the man → 用 who/that 代替；who is talking to my dad 嵌入主句作定语修饰 the man。',
    NULL::jsonb, NULL, 'relative_combine', true, 2, 9007
  ),
  (
    '把两个句子合并：  "I have a friend. His father works in Suzhou Industrial Park."',
    'transform', NULL, NULL, NULL, NULL, 'I have a friend whose father works in Suzhou Industrial Park.',
    ARRAY[
      'I have a friend whose father works in Suzhou Industrial Park.'
    ]::text[],
    '"His father" 表所有格 → 用 **whose father** 引导定语从句。',
    NULL::jsonb, NULL, 'relative_combine_whose', true, 3, 9008
  ),

  -- ─── 2 correction ───
  (
    '改错：  "The book which I read it yesterday is interesting."',
    'correction', NULL, NULL, NULL, NULL, 'The book which I read yesterday is interesting.',
    ARRAY[
      'The book which I read yesterday is interesting.',
      'The book that I read yesterday is interesting.'
    ]::text[],
    'which 已经代替了 the book，从句里**不能再出现 it**。',
    NULL::jsonb, NULL, 'relative_double_object', true, 2, 9009
  ),
  (
    '改错：  "The man which lives next door is a doctor."',
    'correction', NULL, NULL, NULL, NULL, 'The man who lives next door is a doctor.',
    ARRAY[
      'The man who lives next door is a doctor.',
      'The man that lives next door is a doctor.'
    ]::text[],
    '先行词 the man 是人 → 用 **who** 或 that，不能用 which。',
    NULL::jsonb, NULL, 'relative_which_for_person', true, 2, 9010
  ),

  -- ─── 1 translation ───
  (
    '把这句话译成英文：那个昨天帮我捡回手机的女孩是我们班的。',
    'translation', NULL, NULL, NULL, NULL, 'The girl who helped me pick up my phone yesterday is in our class.',
    ARRAY[
      'The girl who helped me pick up my phone yesterday is in our class.',
      'The girl that helped me pick up my phone yesterday is in our class.',
      'The girl who picked up my phone for me yesterday is from our class.',
      'The girl who helped me find my phone yesterday is in our class.'
    ]::text[],
    '考点：① 先行词 the girl 是人 → who/that；② "昨天帮我"嵌入主句作定语；③ "我们班的" = is in our class / is from our class。',
    NULL::jsonb, '更地道：helped me pick up / helped me find 都自然；写作时把"帮我"对应成 "help + sb + do" 而不是 "help me to do"。', 'relative_translation', true, 3, 9011
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
  SELECT id, content_depth INTO v_point_id, v_depth
  FROM junior_grammar_points WHERE code = 'g8.28';

  IF v_point_id IS NULL THEN
    RAISE EXCEPTION 'Gold-standard migration failed: junior_grammar_points row with code=''g8.28'' does not exist.';
  END IF;
  IF v_depth <> 3 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: content_depth for g8.28 is %, expected 3.', v_depth;
  END IF;

  SELECT count(*) INTO v_q_count
  FROM junior_grammar_questions
  WHERE point_id = v_point_id AND sort_order BETWEEN 9000 AND 9099;
  IF v_q_count <> 12 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: expected 12 questions in 9000-9099 for g8.28, got %.', v_q_count;
  END IF;

  RAISE NOTICE 'Gold-standard migration for g8.28 verified: content_depth=3, % questions seeded.', v_q_count;
END $$;
