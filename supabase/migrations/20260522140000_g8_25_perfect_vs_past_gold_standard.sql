-- =====================================================================
-- Gold-standard content for G8 · 现在完成时 vs 一般过去时
-- Code: g8.25   Category: tense
-- =====================================================================
-- Pure contrast point — the single most-mistaken pair in 中考.
-- Builds on g8.01 (past) and g8.24 (perfect); helps students choose.
-- =====================================================================

UPDATE junior_grammar_points
SET
  summary = '"已经做了" vs "昨天做了" — 中考单选最爱考的时态对比，一句话就分胜负。',
  hook_line_cn = '中考阅卷见过最多的错：完成时配 yesterday。学会"看信号词选时态"，这一类题不再丢分。',
  hook_line = 'Past simple vs. present perfect — the single most-tested tense pair in 中考.',
  mnemonic = '具体过去时间（yesterday / last / ago / 年份）→ 一般过去时；与现在有联系（already / ever / for / since）→ 现在完成时。',
  content_depth = 3,

  explanation_md = E'## 🎯 一句话搞定\n\n**纯粹过去发生的事** → 一般过去时  \n**过去发生但和现在有联系** → 现在完成时\n\n---\n\n## 📐 一图秒分两种时态\n\n| 维度 | 一般过去时 | 现在完成时 |\n|---|---|---|\n| **公式** | 主语 + V-ed / 不规则 | 主语 + have / has + V-ed |\n| **强调** | 过去**做了** | 对现在的**影响 / 经历 / 持续** |\n| **配什么时间词** | **具体过去时间**：yesterday, last week, ago, in 2020 | **不具体时间**：already, just, yet, ever, never, recently, for, since, this week |\n| **疑问词** | When did ...? | How long has ...? Has ... ever ...? |\n\n> ⚠️ **铁律**：看到 yesterday / last / ago / in + 年份 → **绝对不能用现在完成时**！\n\n---\n\n## 🔥 三秒选时态法\n\n### Step 1：看时间词\n- **yesterday / last week / 2 days ago / in 2020 / when I was 5** → 一般过去时  \n  → I **visited** Beijing last summer.\n- **already / just / yet / ever / never / recently / for / since** → 现在完成时  \n  → I **have just finished** my homework.\n\n### Step 2：没明显时间词怎么办？\n- 强调"现在的影响"？(她**现在**已经知道了) → 现在完成时  \n  She **has heard** the news.（言下之意：她现在知道）\n- 纯粹叙述过去？(他**去年**搬来) → 一般过去时  \n  He **moved** here last year.\n\n### Step 3：用 for / since\n- I **have lived** here **for** 5 years.（持续到现在）\n- I **lived** here **for** 5 years.（已经搬走了）\n\n---\n\n## ⏰ 完整信号词清单（背下来 = 拿分）\n\n### 一般过去时信号\n- yesterday / the day before yesterday\n- last + week / month / year / Sunday / summer\n- ... ago (two days ago, long ago)\n- in + 过去的年份 (in 2020)\n- when + 过去具体时刻\n- just now（刚才）\n\n### 现在完成时信号\n- already / just / yet\n- ever / never\n- recently / lately / so far / up to now\n- this week / this month / this year（包含现在）\n- for + 时长 / since + 时间点\n- twice / three times（次数）\n\n---\n\n## ⚠️ Top 5 易错点（中考批卷红笔常出现）\n\n1. **完成时 + 具体过去时间**（最致命！）：~~I have visited Beijing last year.~~ → **I visited Beijing last year.**\n2. **already / just 用了过去时**：~~I just finished it.~~（除非美式口语）→ **I have just finished it.**（中考标准）\n3. **When 引导的疑问句用了完成时**：~~When have you finished?~~ → **When did you finish?**（When 配过去时）\n4. **for / since 后面接错**：~~since 5 years~~ → **for 5 years**；~~for 2020~~ → **since 2020**\n5. **been to vs gone to 不分**：He **has been to** Beijing.（去过，回来了） ≠ He **has gone to** Beijing.（去了还没回）\n\n---\n\n## 🧠 三秒判断口诀\n\n> ① 看到 **yesterday / last / ago / in 2020** → 立刻用**一般过去时**  \n> ② 看到 **already / just / yet / ever / never / for / since** → **现在完成时**  \n> ③ When 提问 → **一般过去时**；How long 提问 → **现在完成时**',

  immersion_cards = $jsonb$[
    {"situation": "Friend asks if you''ve seen a popular new movie", "cn": "我已经看过了，上周末看的。", "en": "I have seen it. I watched it last weekend."},
    {"situation": "Telling Mom you finished homework", "cn": "我刚做完作业，可以休息了。", "en": "I have just finished my homework, so I can take a break."},
    {"situation": "Introducing yourself to a new tutor", "cn": "我学英语六年了。", "en": "I have studied English for six years."},
    {"situation": "Apologizing for being late", "cn": "对不起，我刚刚到。", "en": "I''m sorry. I have just arrived."},
    {"situation": "Asking about your friend''s travel history", "cn": "你去过香港吗？", "en": "Have you ever been to Hong Kong?"},
    {"situation": "Answering when you went to Shanghai", "cn": "我去年夏天去了上海。", "en": "I went to Shanghai last summer."}
  ]$jsonb$::jsonb,

  contrast_table = $jsonb$[
    {"lhs": "I have seen this film last weekend.",       "rhs": "I saw this film last weekend."},
    {"lhs": "He has bought a new bike two days ago.",     "rhs": "He bought a new bike two days ago."},
    {"lhs": "When have you finished the project?",        "rhs": "When did you finish the project?"},
    {"lhs": "I have known him since 10 years.",           "rhs": "I have known him for 10 years."},
    {"lhs": "She has gone to Beijing twice.",             "rhs": "She has been to Beijing twice."},
    {"lhs": "I lived here for 8 years, and I still do.",  "rhs": "I have lived here for 8 years."}
  ]$jsonb$::jsonb,

  reflex_cards = $jsonb$[
    {"cn": "我昨天看了那部电影。",                "en": "I saw that movie yesterday.",                 "keyword": "saw ... yesterday"},
    {"cn": "我已经看过那部电影了。",              "en": "I have already seen that movie.",             "keyword": "have already seen"},
    {"cn": "Lin 上周搬家了。",                    "en": "Lin moved last week.",                        "keyword": "moved last week"},
    {"cn": "Lin 搬到苏州两年了。",                "en": "Lin has lived in Suzhou for two years.",      "keyword": "has lived ... for"},
    {"cn": "你什么时候完成的？",                  "en": "When did you finish it?",                     "keyword": "When did you finish"},
    {"cn": "你完成多久了？",                      "en": "How long have you finished it?",              "keyword": "How long have"},
    {"cn": "他去过日本三次。",                    "en": "He has been to Japan three times.",           "keyword": "has been to ... times"},
    {"cn": "他三年前去过日本。",                  "en": "He went to Japan three years ago.",           "keyword": "went ... ago"}
  ]$jsonb$::jsonb,

  situation_drills = $jsonb$[
    {
      "situation": "Your tutor asks how long you''ve studied English.",
      "cn": "我从五岁开始学英语，已经七年了。",
      "en": "I have learned English since I was five — that''s seven years.",
      "accepted": [
        "I''ve been learning English for seven years, since I was five.",
        "I have studied English for seven years now, since I was five."
      ]
    },
    {
      "situation": "A classmate asks when you finished a tough essay.",
      "cn": "我前天晚上写完的。",
      "en": "I finished it the night before yesterday.",
      "accepted": [
        "I finished it two nights ago.",
        "I wrote it the night before last."
      ]
    },
    {
      "situation": "A teacher asks if anyone has ever been to a science museum.",
      "cn": "我去过两次，上次是上个月。",
      "en": "I have been there twice. The last time was last month.",
      "accepted": [
        "I''ve been there twice, the most recent was last month.",
        "I have visited it twice; last time was last month."
      ]
    },
    {
      "situation": "Your friend asks why you look tired today.",
      "cn": "因为我从昨晚开始就没睡。",
      "en": "Because I haven''t slept since last night.",
      "accepted": [
        "I haven''t had any sleep since last night.",
        "I''ve been awake since last night."
      ]
    }
  ]$jsonb$::jsonb,

  correction_tasks = $jsonb$[
    {
      "wrong": "I have visited the Great Wall last summer.",
      "model": "I visited the Great Wall last summer.",
      "hint":  "具体过去时间用过去式",
      "why":   "**last summer** 是具体过去时间，必须用**一般过去时 visited**，不能用现在完成时。"
    },
    {
      "wrong": "When have you finished your project?",
      "model": "When did you finish your project?",
      "hint":  "When 配过去式",
      "why":   "**When 引导疑问句问\"什么时候\"** → 必须用**一般过去时**。问\"做了多久\"才用 How long + 完成时。"
    },
    {
      "wrong": "She has known me since 10 years.",
      "model": "She has known me for 10 years.",
      "hint":  "10 years 是时长",
      "why":   "**10 years** 是时长 → 用 **for**；**2020 / last May** 是时间点 → 用 since。"
    },
    {
      "wrong": "He has gone to Tokyo twice.",
      "model": "He has been to Tokyo twice.",
      "hint":  "twice = 经历",
      "why":   "**twice 表\"经历过几次\"** → 用 **been to**（去过然后回来了）。**gone to** 表示\"去了还没回\"。"
    },
    {
      "wrong": "I lived in Suzhou for 5 years, and I''m still here.",
      "model": "I have lived in Suzhou for 5 years, and I''m still here.",
      "hint":  "仍住在 → 完成时",
      "why":   "**\"现在仍住在这里\"= 持续到现在** → 用现在完成时 **have lived**。一般过去时暗示\"已经不住了\"。"
    },
    {
      "wrong": "She has bought a new phone two days ago.",
      "model": "She bought a new phone two days ago.",
      "hint":  "ago 是具体过去时间",
      "why":   "**ago 系列**（two days ago / long ago）都是具体过去时间，必须用**一般过去时**。"
    }
  ]$jsonb$::jsonb,

  boss_questions = $jsonb$[
    {
      "stem": "— Where is your sister now?\n— She ___ to the library. She ___ home at 5 yesterday.",
      "option_a": "went / came",
      "option_b": "has gone / came",
      "option_c": "has gone / has come",
      "option_d": "went / has come",
      "correct_answer": "B",
      "trap": "第一空：人还在图书馆 → has gone。第二空：yesterday 是具体过去时间 → 必须 came。混在一起难选。",
      "why":  "**第一空**：现在没回来 → 现在完成时 **has gone to**。**第二空**：yesterday 信号 → **一般过去时 came**。"
    },
    {
      "stem": "I ___ Lin since we ___ to the same school 6 years ago.",
      "option_a": "know / went",
      "option_b": "have known / have gone",
      "option_c": "have known / went",
      "option_d": "knew / went",
      "correct_answer": "C",
      "trap": "since 后必须用具体过去时间点 + 一般过去时 (went)。主句\"从那时知道到现在\" → 现在完成时 (have known)。",
      "why":  "**since 从句用过去式 + 主句用现在完成时** 是完成时最经典搭配。"
    },
    {
      "stem": "— ___ you ever ___ a panda in real life?\n— Yes, I ___ one at Chengdu zoo last year.",
      "option_a": "Did / see / saw",
      "option_b": "Have / saw / saw",
      "option_c": "Have / seen / saw",
      "option_d": "Have / seen / have seen",
      "correct_answer": "C",
      "trap": "前问\"经历\"用完成时；回答\"去年看到\"是具体过去时间 → 必须切换到一般过去时。中考极爱考的切换。",
      "why":  "**Have you ever seen ...?**（经历）→ **saw last year**（具体过去时间）。同一对话切换时态是高分点。"
    },
    {
      "stem": "Mr. Black ___ at this school ___ 2018, and he loves teaching here.",
      "option_a": "has taught / since",
      "option_b": "taught / since",
      "option_c": "has taught / for",
      "option_d": "taught / for",
      "correct_answer": "A",
      "trap": "选 B 没看出\"持续到现在\"。选 C 把 2018 当成时长。选 D 双错。",
      "why":  "**2018 = 时间点 → since** + 持续到现在 → 现在完成时 **has taught**。"
    }
  ]$jsonb$::jsonb

WHERE code = 'g8.25';


UPDATE junior_grammar_points SET teacher_script = $jsonb$[
  {
    "text": "今天解锁中考时态对比里**最爱出错的一对**：一般过去时 vs 现在完成时。",
    "show": "🎯 Today: Past Simple vs Present Perfect",
    "duration": 9
  },
  {
    "text": "**最简单的判断**：看时间词。yesterday / last / ago / in 2020 → 一般过去时。",
    "show": "yesterday / last week / 2 years ago / in 2020 → did",
    "highlight": "yesterday",
    "duration": 11
  },
  {
    "text": "**already / just / yet / ever / never / for / since** → 现在完成时。",
    "show": "already / just / yet / ever / never / for / since → have done",
    "highlight": "for / since",
    "duration": 11
  },
  {
    "text": "**最致命错误**：完成时配 yesterday！~~I have visited Beijing last year.~~ → I **visited** Beijing last year.",
    "show": "✗ have ... last year   ✓ visited ... last year",
    "highlight": "visited",
    "duration": 12
  },
  {
    "text": "**When 提问 → 一般过去时**；**How long 提问 → 现在完成时**。问的方式决定答的时态。",
    "show": "When did you ...?   |   How long have you ...?",
    "highlight": "When did ... How long have",
    "duration": 11
  },
  {
    "text": "**for vs since**：for + 时长（5 years）；since + 时间点（2020）。",
    "show": "for 5 years   |   since 2020",
    "highlight": "for ... since",
    "duration": 10
  },
  {
    "text": "**been to vs gone to**：been to = 去过（回来了）；gone to = 去了（还没回）。",
    "show": "has been to ≠ has gone to",
    "highlight": "been to ... gone to",
    "duration": 11
  },
  {
    "text": "理论讲完。下一关 6 个真实场景，看完即去练。",
    "show": "Next → 6 Real-life Scenarios 📚",
    "duration": 7
  }
]$jsonb$::jsonb
WHERE code = 'g8.25';


DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.25')
  AND sort_order BETWEEN 9000 AND 9099;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.25')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  (
    'I ___ this novel three days ago. It''s really exciting.',
    'mcq', 'have finished', 'finished', 'have finish', 'finishes', 'B',
    NULL::text[],
    'three days ago = 具体过去时间 → 一般过去时 **finished**。',
    '{}'::jsonb, NULL, 'past_vs_perfect_signal', false, 1, 9000
  ),
  (
    'Tom ___ in this school ___ 2019.',
    'mcq', 'studied / since', 'has studied / for', 'has studied / since', 'studies / since', 'C',
    NULL::text[],
    '2019 = 时间点 → since；持续到现在 → 现在完成时 **has studied**。',
    '{}'::jsonb, NULL, 'past_vs_perfect_since', false, 2, 9001
  ),
  (
    '— ___ you ever ___ to Hong Kong?\n— Yes, I ___ there last summer.',
    'mcq', 'Did / go / went', 'Have / been / went', 'Have / gone / went', 'Have / been / have been', 'B',
    NULL::text[],
    '问经历 (ever) → 完成时 + been to；回答 last summer → 一般过去时 went。',
    '{}'::jsonb, NULL, 'past_vs_perfect_switch', false, 3, 9002
  ),
  (
    'My mother ___ to Beijing. She''ll be back next Monday.',
    'mcq', 'has gone', 'has been', 'went', 'goes', 'A',
    NULL::text[],
    '"She''ll be back next Monday"暗示**人还没回** → has gone to。',
    '{}'::jsonb, NULL, 'past_vs_perfect_been_gone', false, 2, 9003
  ),

  (
    'I ____ (see) the new film last week.',
    'fill', NULL, NULL, NULL, NULL, 'saw',
    ARRAY['saw']::text[],
    'last week = 具体过去时间 → **saw**。',
    '{}'::jsonb, NULL, 'past_simple_signal', false, 1, 9004
  ),
  (
    'My grandpa ____ (live) here ____ 1980.',
    'fill', NULL, NULL, NULL, NULL, 'has lived / since',
    ARRAY['has lived / since', 'has lived since']::text[],
    '1980 是时间点 → since；持续 → has lived。',
    '{}'::jsonb, NULL, 'past_vs_perfect_since', false, 2, 9005
  ),
  (
    'Lin ____ (be) to Suzhou three times. The first time was when she ____ (be) 8.',
    'fill', NULL, NULL, NULL, NULL, 'has been / was',
    ARRAY['has been / was']::text[],
    'three times = 经历 → has been to；"when she was 8" 具体时间 → was。',
    '{}'::jsonb, NULL, 'past_vs_perfect_switch', false, 3, 9006
  ),

  (
    '改写为现在完成时（去掉 last year）：  "I bought this phone last year."',
    'transform', NULL, NULL, NULL, NULL, 'I have bought this phone.',
    ARRAY[
      'I have bought this phone.',
      'I have already bought this phone.'
    ]::text[],
    '去掉具体过去时间 → 可改成现在完成时；buy → bought (过去分词)。',
    '{}'::jsonb, NULL, 'past_vs_perfect_transform', true, 2, 9007
  ),
  (
    '合并：  "Mom started cooking at 6. She is still cooking now."',
    'transform', NULL, NULL, NULL, NULL, 'Mom has been cooking since 6.',
    ARRAY[
      'Mom has been cooking since 6.',
      'Mom has cooked since 6.'
    ]::text[],
    '从过去某时持续到现在 → 现在完成时（或完成进行时）+ since 6。',
    '{}'::jsonb, NULL, 'past_vs_perfect_combine', true, 3, 9008
  ),

  (
    '改错：  "I have visited my uncle yesterday."',
    'correction', NULL, NULL, NULL, NULL, 'I visited my uncle yesterday.',
    ARRAY[
      'I visited my uncle yesterday.'
    ]::text[],
    'yesterday 是具体过去时间，不能配现在完成时 → 用一般过去时 **visited**。',
    '{}'::jsonb, NULL, 'past_vs_perfect_signal_error', true, 2, 9009
  ),
  (
    '改错：  "When have you started learning the piano?"',
    'correction', NULL, NULL, NULL, NULL, 'When did you start learning the piano?',
    ARRAY[
      'When did you start learning the piano?'
    ]::text[],
    'When 提问"什么时候开始" → 必须用一般过去时 **did ... start**。',
    '{}'::jsonb, NULL, 'past_vs_perfect_when', true, 2, 9010
  ),

  (
    '把这句话译成英文：自从去年九月以来，我已经读了五本英文书。',
    'translation', NULL, NULL, NULL, NULL, 'I have read five English books since last September.',
    ARRAY[
      'I have read five English books since last September.',
      'I''ve read five English books since last September.',
      'Since last September, I have read five English books.',
      'I have read 5 English books since last September.'
    ]::text[],
    '考点：① "自从去年九月以来" → since last September；② "已经读了五本"持续到现在 → 现在完成时 have read。',
    '{}'::jsonb, 'since 后接的过去时间点常用 last + 月/年，比 from + 时间 更地道。', 'past_vs_perfect_translation', true, 3, 9011
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
  SELECT id, content_depth INTO v_point_id, v_depth FROM junior_grammar_points WHERE code = 'g8.25';
  IF v_point_id IS NULL THEN
    RAISE EXCEPTION 'Gold-standard migration failed: junior_grammar_points row with code=''g8.25'' does not exist.';
  END IF;
  IF v_depth <> 3 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: content_depth for g8.25 is %, expected 3.', v_depth;
  END IF;
  SELECT count(*) INTO v_q_count
  FROM junior_grammar_questions
  WHERE point_id = v_point_id AND sort_order BETWEEN 9000 AND 9099;
  IF v_q_count <> 12 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: expected 12 questions for g8.25, got %.', v_q_count;
  END IF;
  RAISE NOTICE 'Gold-standard migration for g8.25 verified: content_depth=3, % questions seeded.', v_q_count;
END $$;
