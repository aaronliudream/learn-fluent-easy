-- =====================================================================
-- Gold-standard content for G8 · 现在完成时 · Present Perfect
-- Code: g8.24   Category: tense
-- =====================================================================
-- The single highest-value tense for 中考 — appears in every reading
-- passage and most writing prompts. Covers: have/has + V-ed structure,
-- since/for, already/just/yet, ever/never, been to vs gone to.
--
-- Idempotent: targets row by code, scopes questions to sort_order 9000-9099.
-- =====================================================================

UPDATE junior_grammar_points
SET
  summary = '描述"从过去做到现在"的动作 — 中考阅读、完形、写作里几乎每段都有它。',
  hook_line_cn = '中考使用频率第一的时态。学会它，阅读看得懂、作文加分稳。',
  hook_line = 'The single most-used tense on the 中考 — masters of it never miss reading inference.',
  mnemonic = '现在完成 = have / has + 过去分词；强调"对现在的影响"，不能和具体过去时间连用。',
  content_depth = 3,

  explanation_md = E'## 🎯 一句话搞定\n\n**过去发生的事，现在还有影响** → 用 **have / has + 过去分词**。  \n关键不是"什么时候做的"，而是"做了对现在意味着什么"。\n\n---\n\n## 📐 核心公式\n\n| 句型 | 公式 | 例子 |\n|---|---|---|\n| 肯定句 | 主语 + **have / has** + V-ed | I **have finished** my homework. |\n| 否定句 | 主语 + **haven''t / hasn''t** + V-ed | She **hasn''t arrived** yet. |\n| 一般疑问 | **Have / Has** + 主语 + V-ed ? | **Have you ever been** to Beijing? |\n| 特殊疑问 | 疑问词 + **have / has** + 主语 + V-ed ? | How long **have you lived** here? |\n\n> ⚠️ **铁律**：主语 he / she / it / 单数名词 → **has**；其他都用 **have**。\n\n---\n\n## ⏰ 看到这些 = 现在完成时\n\n- **already**（已经）/ **just**（刚刚）/ **yet**（还，否定/疑问句末）\n- **ever**（曾经）/ **never**（从未）\n- **recently**（最近）/ **lately**（最近）\n- **so far**（到目前为止）/ **up to now**\n- **this week / this month / this year**（包含现在的时间段）\n- **for + 时长**（for 3 years）/ **since + 时间点**（since 2020）\n- **twice / three times**（频率，表"做过几次"）\n\n---\n\n## 🔥 中考最爱考的 3 大用法\n\n### ① 经历类（ever / never / twice / three times）\n- I **have been** to the Great Wall **twice**. — 去过两次（人已回来）\n- She **has never seen** snow. — 从未见过\n\n### ② 持续类（for / since）\n- Tom **has lived** here **for** 5 years. — for + 时长\n- Tom **has lived** here **since** 2020. — since + 时间点\n\n### ③ 完成类（already / just / yet）\n- I **have just finished** dinner. — 刚吃完\n- — **Have** you **finished** your homework **yet**? — 还没\n- — Not **yet**.\n\n---\n\n## ⚠️ Top 5 易错点（中考批卷红笔常出现）\n\n1. **配具体过去时间词**（最致命错误！）：~~I have visited Beijing last year.~~ → **I visited Beijing last year.**（last year 是过去时间，必须用一般过去时）\n2. **been to vs gone to 不分**：\n   - He **has been to** Tokyo.（去过，人已回来）  \n   - He **has gone to** Tokyo.（去了，人还在那儿）\n3. **for / since 混用**：\n   - ~~for 2020~~ → **since 2020**（since 接时间点）\n   - ~~since 5 years~~ → **for 5 years**（for 接时长）\n4. **疑问句用了 do**：~~Do you have finished?~~ → **Have you finished?**（完成时用 have，不用 do）\n5. **过去分词当过去式**：~~I have went there.~~ → **I have gone there.**（go → went → gone）\n\n---\n\n## 🧠 三秒判断口诀\n\n> **"昨/上/前/年" 看时间点 → 一般过去时**  \n> **"已经/曾经/到现在为止 + for/since" → 现在完成时**  \n> **不确定？看句末有 yesterday/last/ago/in 2020 → 不要选完成时！**',

  immersion_cards = $jsonb$[
    {"situation": "Showing off your travel photos", "cn": "我已经去过北京三次了。", "en": "I have been to Beijing three times."},
    {"situation": "Telling your friend you finished work", "cn": "我刚做完作业，可以一起玩游戏了。", "en": "I have just finished my homework, so we can play games now."},
    {"situation": "Asking about a classmate at the door", "cn": "Tom 已经到学校了吗？", "en": "Has Tom arrived at school yet?"},
    {"situation": "Introducing yourself to a new friend", "cn": "我在苏州住了五年了。", "en": "I have lived in Suzhou for five years."},
    {"situation": "Reacting to falling snow in class", "cn": "我从来没见过这么大的雪！", "en": "I have never seen such heavy snow!"},
    {"situation": "Mom is back home from supermarket", "cn": "妈妈买了水果回来。", "en": "Mom has bought some fruit."}
  ]$jsonb$::jsonb,

  contrast_table = $jsonb$[
    {"lhs": "I have seen this film last week.",       "rhs": "I saw this film last week."},
    {"lhs": "He has went to Shanghai twice.",          "rhs": "He has been to Shanghai twice."},
    {"lhs": "She has lived here since 5 years.",       "rhs": "She has lived here for 5 years."},
    {"lhs": "Tom has lived here for 2020.",            "rhs": "Tom has lived here since 2020."},
    {"lhs": "Do you have finished your homework?",     "rhs": "Have you finished your homework?"},
    {"lhs": "I haven't see him today.",                "rhs": "I haven't seen him today."}
  ]$jsonb$::jsonb,

  reflex_cards = $jsonb$[
    {"cn": "我已经吃过晚饭了。",              "en": "I have already had dinner.",                  "keyword": "have already had"},
    {"cn": "你看过这部电影吗？",              "en": "Have you seen this film?",                    "keyword": "Have you seen"},
    {"cn": "她搬来这里两年了。",              "en": "She has lived here for two years.",           "keyword": "has lived"},
    {"cn": "我从没去过香港。",                "en": "I have never been to Hong Kong.",             "keyword": "have never been"},
    {"cn": "Tom 刚到。",                      "en": "Tom has just arrived.",                       "keyword": "has just arrived"},
    {"cn": "他们 2022 年以来一直是朋友。",    "en": "They have been friends since 2022.",          "keyword": "have been"},
    {"cn": "我把钥匙弄丢了。",                "en": "I have lost my keys.",                        "keyword": "have lost"},
    {"cn": "妈妈还没回来。",                  "en": "Mom hasn't come back yet.",                   "keyword": "hasn't come back yet"}
  ]$jsonb$::jsonb,

  situation_drills = $jsonb$[
    {
      "situation": "Your new classmate asks how long you've lived in this city.",
      "cn": "我从五岁起就住在这儿了。",
      "en": "I have lived here since I was five.",
      "accepted": [
        "I've lived here since I was 5.",
        "I have been living here since I was five."
      ]
    },
    {
      "situation": "A friend asks if you've been to a popular new restaurant.",
      "cn": "我已经去过两次了，他们的鱼非常棒。",
      "en": "I have been there twice. The fish is amazing.",
      "accepted": [
        "I've been there twice — the fish is amazing.",
        "I have already been there twice; their fish is amazing."
      ]
    },
    {
      "situation": "Mom asks why you haven't started homework yet.",
      "cn": "我刚到家，还没开始呢。",
      "en": "I have just got home — I haven't started yet.",
      "accepted": [
        "I've just got home and haven't started yet.",
        "I just arrived home, so I haven't started yet."
      ]
    },
    {
      "situation": "Your tutor asks about your English learning so far.",
      "cn": "我学英语六年了，但是还有很多要学。",
      "en": "I have learned English for six years, but there is still a lot to learn.",
      "accepted": [
        "I've been learning English for six years, but there's still a lot to learn.",
        "I have studied English for six years, but I still have a lot to learn."
      ]
    }
  ]$jsonb$::jsonb,

  correction_tasks = $jsonb$[
    {
      "wrong": "I have visited the Great Wall last summer.",
      "model": "I visited the Great Wall last summer.",
      "hint":  "last summer 是具体过去时间",
      "why":   "现在完成时**不能**和具体过去时间（yesterday / last week / ago / in 2020）连用。这里改成一般过去时 **visited**。"
    },
    {
      "wrong": "He has went to Shanghai twice.",
      "model": "He has been to Shanghai twice.",
      "hint":  "twice 表经历，人已回来",
      "why":   "**have been to**（去过，回来了）vs **have gone to**（去了，还没回来）。twice 表"次数"必须用 been to。另外，went 是过去式，过去分词是 **gone**。"
    },
    {
      "wrong": "She has lived here since 5 years.",
      "model": "She has lived here for 5 years.",
      "hint":  "5 years 是时长",
      "why":   "**for + 时长**（5 years, 3 months, a long time）；**since + 时间点**（2020, last May, I was 5）。"
    },
    {
      "wrong": "Tom has lived here for 2020.",
      "model": "Tom has lived here since 2020.",
      "hint":  "2020 是时间点",
      "why":   "同上：2020 是具体年份（时间点），必须用 **since**。"
    },
    {
      "wrong": "Do you have finished your homework yet?",
      "model": "Have you finished your homework yet?",
      "hint":  "完成时的疑问句",
      "why":   "现在完成时的疑问句直接把 **have / has** 提到主语前，不用 do / does。"
    },
    {
      "wrong": "I haven't see him this week.",
      "model": "I haven't seen him this week.",
      "hint":  "see 的过去分词",
      "why":   "现在完成时永远是 **have / has + 过去分词**。see → saw → **seen**。"
    }
  ]$jsonb$::jsonb,

  boss_questions = $jsonb$[
    {
      "stem": "— ___ you ever ___ to Mount Tai?\n— Yes, I climbed it last summer.",
      "option_a": "Did / go",
      "option_b": "Have / been",
      "option_c": "Have / gone",
      "option_d": "Are / going",
      "correct_answer": "B",
      "trap": "选 C 的同学忽略了：问的是经历（ever），回答说"我去过"，人现在不在那 → 必须用 **been to**。gone to 表示"人还在那儿没回来"。",
      "why":  "**Have you ever been to ...?** 是问经历的固定句型。回答虽然用过去时（climbed last summer），但问句必须用现在完成时。"
    },
    {
      "stem": "Tom ___ in Suzhou ___ 2018, and he loves it here.",
      "option_a": "lived / for",
      "option_b": "has lived / since",
      "option_c": "has lived / for",
      "option_d": "lives / since",
      "correct_answer": "B",
      "trap": "选 C 的同学把 since 看成了 for — 2018 是**时间点**，必须搭配 **since**。选 A 时态错（持续到现在用完成时）。",
      "why":  "①"持续到现在"用现在完成时；② **since + 时间点**（2018 是年份），**for + 时长**（5 years）。"
    },
    {
      "stem": "— Where''s Mom?\n— She ___ to the supermarket. She''ll be back soon.",
      "option_a": "has been",
      "option_b": "has gone",
      "option_c": "went",
      "option_d": "goes",
      "correct_answer": "B",
      "trap": "选 A 的同学没看到 "She''ll be back soon"（她马上回来）— 说明妈妈**还没回**，必须用 **has gone**。",
      "why":  "**has been to**：去过然后回来了。**has gone to**：去了还没回。看后半句 "She''ll be back soon" 就锁定 gone。"
    },
    {
      "stem": "— ___ you ___ the new film yet?\n— No, not ___.",
      "option_a": "Did / see / yet",
      "option_b": "Have / saw / already",
      "option_c": "Have / seen / yet",
      "option_d": "Do / see / yet",
      "correct_answer": "C",
      "trap": "选 B 的同学把过去式 saw 用进了完成时（必须是 seen）。yet 出现在疑问/否定句末；already 用在肯定句。",
      "why":  "**yet** = 还，专用在否定/疑问句末。回答 "Not yet." 是固定搭配。see → saw → **seen**。"
    }
  ]$jsonb$::jsonb

WHERE code = 'g8.24';


UPDATE junior_grammar_points SET teacher_script = $jsonb$[
  {
    "text": "今天解锁中考使用频率第一的时态：**现在完成时**。中考阅读每段几乎都能见到它。",
    "show": "🎯 Today: have / has + V-ed = Present Perfect",
    "duration": 9
  },
  {
    "text": "核心公式只有一行：**have / has + 过去分词**。he / she / it 用 **has**，其他都用 **have**。",
    "show": "I / you / we / they → have   |   he / she / it → has",
    "highlight": "has",
    "duration": 10
  },
  {
    "text": "用法 ①：表**经历** — 用 ever（曾经）、never（从未）、twice（两次）这些词。",
    "show": "I have been to Beijing twice.",
    "highlight": "have been to",
    "duration": 9
  },
  {
    "text": "用法 ②：表**持续** — 配 **for + 时长** 或 **since + 时间点**。",
    "show": "for 5 years   |   since 2020",
    "highlight": "for ... since",
    "duration": 10
  },
  {
    "text": "用法 ③：表**刚完成** — 配 already（已经）、just（刚刚）、yet（还）。",
    "show": "I have just finished. — Have you finished yet?",
    "highlight": "just ... yet",
    "duration": 10
  },
  {
    "text": "**最大的坑！** 现在完成时**绝对不能**配 yesterday、last week、ago、in 2020 这种具体过去时间。",
    "show": "✗ I have visited Beijing last year. → ✓ I visited Beijing last year.",
    "highlight": "last year",
    "duration": 12
  },
  {
    "text": "**第二大坑：been to vs gone to**。been to = 去过（人回来了）；gone to = 去了（人还没回）。",
    "show": "He has been to Tokyo.   ≠   He has gone to Tokyo.",
    "highlight": "been to",
    "duration": 11
  },
  {
    "text": "理论讲完。下一关你会看到 6 个真实场景 — 看英文怎么说，再去打题。",
    "show": "Next → 6 Real-life Scenarios 📚",
    "duration": 7
  }
]$jsonb$::jsonb
WHERE code = 'g8.24';


DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.24')
  AND sort_order BETWEEN 9000 AND 9099;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.24')
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
    'I ___ my new bike for three years, but it still looks new.',
    'mcq', 'have', 'have had', 'had', 'have having', 'B',
    NULL::text[],
    'for three years = 持续到现在 → 现在完成时 = **have + 过去分词**。have 的过去分词是 had，所以是 **have had**。',
    NULL::jsonb, NULL, 'present_perfect_for', false, 1, 9000
  ),
  (
    '— Where is your father?\n— He ___ to Beijing on business. He''ll come back next week.',
    'mcq', 'has been', 'has gone', 'went', 'goes', 'B',
    NULL::text[],
    '"He''ll come back next week"（下周才回）= 人还没回 → **has gone to**。',
    NULL::jsonb, NULL, 'present_perfect_been_gone', false, 2, 9001
  ),
  (
    'My family ___ in Suzhou ___ I was born.',
    'mcq', 'lived / for', 'has lived / since', 'lives / since', 'has lived / for', 'B',
    NULL::text[],
    '持续动作用现在完成时 = has lived；"I was born"是时间点 → **since**。',
    NULL::jsonb, NULL, 'present_perfect_since', false, 2, 9002
  ),
  (
    '— ___ Tom ___ his homework yet?\n— Yes, he ___ it twenty minutes ago.',
    'mcq', 'Has / done / has finished', 'Has / done / finished', 'Did / done / did', 'Has / did / finished', 'B',
    NULL::text[],
    '疑问 = Has + V-ed = **Has done**；回答里 "20 minutes ago" 是过去时间点 → 必须用一般过去时 **finished**，不是现在完成时。',
    NULL::jsonb, '这题是高频陷阱：问句用完成时，但回答出现具体过去时间就必须切换到一般过去时。', 'present_perfect_vs_past', false, 3, 9003
  ),

  -- ─── 3 fill-in ───
  (
    'I ____ (read) this book three times. It''s really exciting.',
    'fill', NULL, NULL, NULL, NULL, 'have read',
    ARRAY['have read', 'have already read']::text[],
    'three times = 经历 → 现在完成时 = **have read**（read 的过去分词还是 read，但读音变成 /red/）。',
    NULL::jsonb, NULL, 'present_perfect_experience', false, 2, 9004
  ),
  (
    'Lin ____ (not finish) her project yet. She needs more time.',
    'fill', NULL, NULL, NULL, NULL, 'hasn''t finished',
    ARRAY['hasn''t finished', 'has not finished']::text[],
    'yet 出现在否定句末 → 现在完成时否定 = **hasn''t + 过去分词**。',
    NULL::jsonb, NULL, 'present_perfect_negative', false, 2, 9005
  ),
  (
    'My grandma ____ (live) in this town since 1980.',
    'fill', NULL, NULL, NULL, NULL, 'has lived',
    ARRAY['has lived', 'has been living']::text[],
    'since 1980 = 1980 年起持续到现在 → **has lived**（或 has been living，都对）。',
    NULL::jsonb, NULL, 'present_perfect_since', false, 2, 9006
  ),

  -- ─── 2 transform ───
  (
    '把句子改成现在完成时（保留 already）：  "Tom finishes his lunch."',
    'transform', NULL, NULL, NULL, NULL, 'Tom has already finished his lunch.',
    ARRAY[
      'Tom has already finished his lunch.',
      'Tom has already had his lunch.'
    ]::text[],
    '现在完成时 = has + 过去分词。already 通常放在 has 和过去分词之间。',
    NULL::jsonb, NULL, 'present_perfect_transform', true, 2, 9007
  ),
  (
    '把句子改成否定句（用 yet）：  "She has answered the message."',
    'transform', NULL, NULL, NULL, NULL, 'She hasn''t answered the message yet.',
    ARRAY[
      'She hasn''t answered the message yet.',
      'She has not answered the message yet.'
    ]::text[],
    '否定句 = has not / hasn''t + V-ed；yet 放在句末。',
    NULL::jsonb, NULL, 'present_perfect_negative', true, 2, 9008
  ),

  -- ─── 2 correction ───
  (
    '改错：  "I have seen this movie last weekend."',
    'correction', NULL, NULL, NULL, NULL, 'I saw this movie last weekend.',
    ARRAY[
      'I saw this movie last weekend.'
    ]::text[],
    '**last weekend** 是具体过去时间，现在完成时不能与之连用，必须用一般过去时 **saw**。',
    NULL::jsonb, NULL, 'present_perfect_vs_past', true, 2, 9009
  ),
  (
    '改错：  "Tom has went to the library and is studying there now."',
    'correction', NULL, NULL, NULL, NULL, 'Tom has gone to the library and is studying there now.',
    ARRAY[
      'Tom has gone to the library and is studying there now.'
    ]::text[],
    '①go 的过去分词是 **gone**，不是 went；② 人还在图书馆 → 用 **has gone to**（不是 been to）。',
    NULL::jsonb, NULL, 'present_perfect_been_gone', true, 3, 9010
  ),

  -- ─── 1 translation ───
  (
    '把这句话译成英文：自从去年九月以来，我每天都背单词。',
    'translation', NULL, NULL, NULL, NULL, 'I have memorized vocabulary every day since last September.',
    ARRAY[
      'I have memorized vocabulary every day since last September.',
      'I have learned new words every day since last September.',
      'I have been memorizing words every day since last September.',
      'I have studied vocabulary every day since September last year.'
    ]::text[],
    '考点：① "自从……以来"=since + 时间点 → **since last September**；② "一直/每天" 持续到现在 → 现在完成时（或现在完成进行时）。',
    NULL::jsonb, '更地道：since last September 比 from last September 更自然；memorize / learn / study 三个动词在中考写作里都可接受。', 'present_perfect_translation', true, 3, 9011
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
  FROM junior_grammar_points WHERE code = 'g8.24';

  IF v_point_id IS NULL THEN
    RAISE EXCEPTION 'Gold-standard migration failed: junior_grammar_points row with code=''g8.24'' does not exist.';
  END IF;

  IF v_depth <> 3 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: content_depth for g8.24 is %, expected 3.', v_depth;
  END IF;

  SELECT count(*) INTO v_q_count
  FROM junior_grammar_questions
  WHERE point_id = v_point_id AND sort_order BETWEEN 9000 AND 9099;

  IF v_q_count <> 12 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: expected 12 questions in 9000-9099 for g8.24, got %.', v_q_count;
  END IF;

  RAISE NOTICE 'Gold-standard migration for g8.24 verified: content_depth=3, % questions seeded.', v_q_count;
END $$;
