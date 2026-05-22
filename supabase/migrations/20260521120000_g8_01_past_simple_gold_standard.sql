-- =====================================================================
-- Gold-standard content for G8 · 一般过去时（强化） · Past Simple (Advanced)
-- Code: g8.01   Category: tense
-- =====================================================================
-- This migration sets the bar for what "complete" looks like on every
-- junior_grammar_point. All other points should be brought up to this
-- standard before launch. See docs/grammar-content-rubric.md.
--
-- Targets the row by `code` (not UUID) so it works across environments.
-- Idempotent: questions are scoped to sort_order 9000-9099 and re-inserted.
-- =====================================================================

-- ---- 1. Update the grammar point with the full content payload ----
UPDATE junior_grammar_points
SET
  summary = '用动词的过去式描述昨天/上周/几年前发生的事 — 中考作文里至少一半的时态分在这里。',
  hook_line_cn = '中考英语的"第一道门"。把它拿下，作文里 50% 的时态分就稳了。',
  hook_line = 'Master the past — half of your 中考 essay tense marks live here.',
  mnemonic = '过去 = V-ed 或 不规则；Did / Didn''t 后永远跟动词原形。',
  content_depth = 3,

  explanation_md = E'## 🎯 一句话搞定\n\n**过去做的事** → 动词变 **过去式**。规则动词加 **-ed**，不规则动词要背。\n\n---\n\n## 📐 核心公式\n\n| 句型 | 公式 | 例子 |\n|---|---|---|\n| 肯定句 | 主语 + **V-ed** | I **visited** Beijing last summer. |\n| 否定句 | 主语 + **didn''t** + 动词原形 | She **didn''t go** to school yesterday. |\n| 一般疑问 | **Did** + 主语 + 动词原形 ? | **Did you finish** your homework? |\n| 特殊疑问 | 疑问词 + **did** + 主语 + 动词原形 ? | **When did you arrive**? |\n\n> ⚠️ **铁律：Did / Didn''t 后面永远跟动词原形！**\n\n---\n\n## ⏰ 看到这些词 = 一般过去时\n\n- **yesterday** / yesterday morning / yesterday evening\n- **last** + week / month / year / Sunday / summer\n- **... ago**：two hours ago, three days ago, long ago\n- **in** + 过去的年份：in 2020, in 1999\n- **just now**（刚才）/ **the other day**（前几天）\n- **once / one day / one morning**（讲故事）\n\n---\n\n## 🔥 中考最爱考的 20 个不规则动词\n\n| 原形 | 过去式 | 原形 | 过去式 |\n|---|---|---|---|\n| go | **went** | see | **saw** |\n| have | **had** | take | **took** |\n| come | **came** | do | **did** |\n| make | **made** | get | **got** |\n| buy | **bought** | bring | **brought** |\n| think | **thought** | teach | **taught** |\n| catch | **caught** | find | **found** |\n| lose | **lost** | tell | **told** |\n| say | **said** | give | **gave** |\n| eat | **ate** | drink | **drank** |\n\n> 📌 记忆口诀：**ou 组**（bought / brought / thought / taught / caught）一起背最高效。\n\n---\n\n## ⚠️ Top 5 易错点（中考批卷红笔常出现）\n\n1. **不规则当成规则**：~~goed~~ → **went**；~~buyed~~ → **bought**\n2. **Did 后用了过去式**：~~Did you saw him?~~ → **Did you see him?**\n3. **Didn''t 后用了过去式**：~~He didn''t went home~~ → **He didn''t go home**\n4. **yesterday 配现在完成时**：~~I have visited Beijing last summer~~ → **I visited Beijing last summer**\n5. **时间状语跳时态**：When I was 5, I ~~start~~ → **started** learning the piano.\n\n---\n\n## 🧠 三秒判断口诀\n\n> **"昨/上/前/年" 看时间 → 用过去式**  \n> **"已经/曾经/到现在为止" → 用现在完成时**',

  -- teacher_script is set in a second UPDATE below (keeps this block tidy)

  immersion_cards = $jsonb$[
    {"situation": "After PE class", "cn": "我昨天踢了足球。", "en": "I played football yesterday."},
    {"situation": "Showing photos to a friend", "cn": "上周末我去了苏州。", "en": "I went to Suzhou last weekend."},
    {"situation": "Explaining absence to the teacher", "cn": "他昨天没来上学。", "en": "He didn't come to school yesterday."},
    {"situation": "Calling a classmate at night", "cn": "你昨晚做完作业了吗？", "en": "Did you finish your homework last night?"},
    {"situation": "Telling a childhood story", "cn": "我五岁的时候开始学钢琴。", "en": "I started learning the piano when I was five."},
    {"situation": "Recounting a small accident", "cn": "他三天前丢了手机。", "en": "He lost his phone three days ago."}
  ]$jsonb$::jsonb,

  contrast_table = $jsonb$[
    {"lhs": "I goed to school yesterday.",            "rhs": "I went to school yesterday."},
    {"lhs": "Did you saw him?",                       "rhs": "Did you see him?"},
    {"lhs": "She didn't went home.",                  "rhs": "She didn't go home."},
    {"lhs": "I have visited Beijing last summer.",    "rhs": "I visited Beijing last summer."},
    {"lhs": "He buyed a new bike.",                   "rhs": "He bought a new bike."},
    {"lhs": "What time did the bus arrived?",         "rhs": "What time did the bus arrive?"}
  ]$jsonb$::jsonb,

  reflex_cards = $jsonb$[
    {"cn": "我昨天看了一部电影。",        "en": "I watched a movie yesterday.",          "keyword": "watched"},
    {"cn": "她上周去了上海。",            "en": "She went to Shanghai last week.",       "keyword": "went"},
    {"cn": "我们五分钟前到的。",          "en": "We arrived five minutes ago.",          "keyword": "arrived"},
    {"cn": "他今天早上没吃早饭。",        "en": "He didn't eat breakfast this morning.", "keyword": "didn't eat"},
    {"cn": "你拿了我的笔吗？",            "en": "Did you take my pen?",                  "keyword": "Did you take"},
    {"cn": "他们 2022 年搬家了。",         "en": "They moved in 2022.",                   "keyword": "moved"},
    {"cn": "我两天前看见过她。",          "en": "I saw her two days ago.",               "keyword": "saw"},
    {"cn": "妈妈昨晚做了饺子。",          "en": "Mom made dumplings last night.",        "keyword": "made"}
  ]$jsonb$::jsonb,

  situation_drills = $jsonb$[
    {
      "situation": "Your teacher asks why you were late this morning.",
      "cn": "我赶不上公交车，迟到了。",
      "en": "I missed the bus, so I was late.",
      "accepted": [
        "I missed the bus and was late.",
        "I was late because I missed the bus."
      ]
    },
    {
      "situation": "Tell a friend what you did over the May Day holiday.",
      "cn": "假期里我读了三本书，还去看了奶奶。",
      "en": "During the holiday I read three books and visited my grandma.",
      "accepted": [
        "I read three books and visited my grandma during the holiday.",
        "Over the holiday, I read three books and went to see my grandma."
      ]
    },
    {
      "situation": "A classmate asks if you watched last night's match.",
      "cn": "看了，巴西输了。",
      "en": "Yes, I watched it. Brazil lost.",
      "accepted": [
        "I did. Brazil lost.",
        "Yes, and Brazil lost."
      ]
    },
    {
      "situation": "Apologize to your friend for forgetting their birthday.",
      "cn": "对不起，我忘了你的生日。",
      "en": "Sorry, I forgot your birthday.",
      "accepted": [
        "I'm sorry — I forgot it was your birthday.",
        "Sorry, I totally forgot your birthday."
      ]
    }
  ]$jsonb$::jsonb,

  correction_tasks = $jsonb$[
    {
      "wrong": "I goed to the park yesterday.",
      "model": "I went to the park yesterday.",
      "hint":  "go 是不规则动词",
      "why":   "**go → went**，不是 goed。这是中考最常考的不规则动词之一。"
    },
    {
      "wrong": "Did you saw the new film?",
      "model": "Did you see the new film?",
      "hint":  "Did 后面只能跟原形",
      "why":   "**Did + 主语 + 动词原形**。saw 已经是过去式，跟 Did 重复了。"
    },
    {
      "wrong": "He didn't went home after school.",
      "model": "He didn't go home after school.",
      "hint":  "didn't 后用原形",
      "why":   "否定句的时态信号在 **didn't** 上，后面动词必须用原形。"
    },
    {
      "wrong": "I have finished my homework yesterday.",
      "model": "I finished my homework yesterday.",
      "hint":  "yesterday 不能跟现在完成时",
      "why":   "**yesterday** 是明确的过去时间点，必须用一般过去时，不能用 have done。"
    },
    {
      "wrong": "She buyed a beautiful dress last week.",
      "model": "She bought a beautiful dress last week.",
      "hint":  "buy 是不规则动词",
      "why":   "**buy → bought**。'ou' 一族（buy/bring/think/teach/catch）一起记最高效。"
    },
    {
      "wrong": "When did the bus arrived?",
      "model": "When did the bus arrive?",
      "hint":  "疑问句 Did 后跟原形",
      "why":   "**Did + 主语 + 动词原形**。即使前面有疑问词 When，规则不变。"
    }
  ]$jsonb$::jsonb,

  boss_questions = $jsonb$[
    {
      "stem": "— ___ you ___ the homework last night?\n— Yes, I ___.",
      "option_a": "Did / finished / do",
      "option_b": "Did / finish / did",
      "option_c": "Do / finish / did",
      "option_d": "Did / finished / did",
      "correct_answer": "B",
      "trap": "选 A 或 D 的同学被 'finished' 这个看起来像过去时的形式骗了。规则铁律：**Did 后面必须接动词原形**。",
      "why":  "完整规则：疑问句 **Did + 主语 + 动词原形 + …?** 简短回答用 **Yes, I did. / No, I didn't.**"
    },
    {
      "stem": "Tom ___ to school by bike every day when he ___ in Suzhou.",
      "option_a": "goes / lives",
      "option_b": "went / lived",
      "option_c": "goes / lived",
      "option_d": "went / lives",
      "correct_answer": "B",
      "trap": "看到 'every day' 很多同学条件反射选 'goes' — 错！这里的 every day 是过去那段时间的'每天'。",
      "why":  "when 引导的从句和主句要 **时态一致**。从句 lived 表示'住在苏州的那段时间'，主句 went 也对应过去的习惯性动作。"
    },
    {
      "stem": "I ___ my keys this morning, but luckily I ___ them after ten minutes.",
      "option_a": "lose / find",
      "option_b": "lost / found",
      "option_c": "lost / find",
      "option_d": "lose / found",
      "correct_answer": "B",
      "trap": "两个动词**都**是不规则的：**lose → lost**，**find → found**。漏掉任何一个都扣分。",
      "why":  "两件事都发生在过去（先丢后找到），都用一般过去时。注意 lose 和 find 都是常考不规则。"
    },
    {
      "stem": "— How ___ your weekend?\n— Great! I ___ a lot of friends.",
      "option_a": "was / met",
      "option_b": "is / meet",
      "option_c": "was / meet",
      "option_d": "is / met",
      "correct_answer": "A",
      "trap": "选 C 的同学只对了一半 — 'How was your weekend?' 是中考固定句型，回答里 meet 也要变 **met**（不是 meeted）。",
      "why":  "聊已经过去的周末，be 动词用 **was**；meet 是不规则动词，过去式是 **met**。"
    }
  ]$jsonb$::jsonb

WHERE code = 'g8.01';


-- ---- 1b. teacher_script (separate UPDATE so the $jsonb$ delimiter is unambiguous) ----
UPDATE junior_grammar_points SET teacher_script = $jsonb$[
  {
    "text": "今天我们要拿下中考语法第一块硬骨头：**一般过去时**。只要你会用它，就能讲清楚昨天发生了什么。",
    "show": "🎯 Today's Mission: Talk about YESTERDAY",
    "duration": 8
  },
  {
    "text": "公式很简单：**主语 + 动词的过去式**。比如 I 加 visited，就变成 I visited Beijing。",
    "show": "Subject + V-ed  →  I visited Beijing.",
    "highlight": "V-ed",
    "duration": 9
  },
  {
    "text": "规则动词大部分加 **-ed**：play 变 played，watch 变 watched，jump 变 jumped。",
    "show": "play → played   watch → watched   jump → jumped",
    "highlight": "-ed",
    "duration": 9
  },
  {
    "text": "但是！有一些常用动词是**不规则的**，必须硬背。最常考四个：**go → went**，**see → saw**，**have → had**，**take → took**。",
    "show": "go → went    see → saw    have → had    take → took",
    "highlight": "went",
    "duration": 12
  },
  {
    "text": "否定句用 **didn't**。注意铁律：didn't 后面一定要用**动词原形**，不能用过去式！",
    "show": "✓ I didn't go.    ✗ I didn't went.",
    "highlight": "didn't go",
    "duration": 10
  },
  {
    "text": "疑问句用 **Did**：Did + 主语 + 动词原形。同样不能再用过去式。",
    "show": "✓ Did you see him?    ✗ Did you saw him?",
    "highlight": "Did you see",
    "duration": 10
  },
  {
    "text": "看到这些词，就立刻用过去时：**yesterday、last week、ago、in 2020**。这是判分老师扫一眼就找的信号。",
    "show": "⏰ yesterday · last week · … ago · in 2020",
    "highlight": "yesterday",
    "duration": 10
  },
  {
    "text": "好，理论讲完。下一关你会看到 6 个真实场景 — 看英文怎么说，再去打题。",
    "show": "Next → 6 Real-life Scenarios 📚",
    "duration": 7
  }
]$jsonb$::jsonb
WHERE code = 'g8.01';


-- ---- 2. Replace gold-standard practice questions (sort_order 9000–9099) ----
DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.01')
  AND sort_order BETWEEN 9000 AND 9099;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.01')
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
    'I ___ my homework right after dinner yesterday.',
    'mcq', 'finish', 'finished', 'finishing', 'will finish', 'B',
    NULL::text[],
    '**yesterday** = 过去时信号词，finish 是规则动词，过去式是 **finished**。',
    NULL::jsonb, NULL, 'past_simple_regular', false, 1, 9000
  ),
  (
    'My brother ___ go to bed until 11 last night.',
    'mcq', 'don''t', 'doesn''t', 'didn''t', 'wasn''t', 'C',
    NULL::text[],
    '**last night** → 过去时；否定句用 **didn''t** + 动词原形。',
    NULL::jsonb, NULL, 'past_simple_negative', false, 1, 9001
  ),
  (
    '— ___ your sister ___ to the museum with you last Sunday?  — Yes, she did.',
    'mcq', 'Did / go', 'Did / went', 'Does / go', 'Was / go', 'A',
    NULL::text[],
    '一般疑问句：**Did + 主语 + 动词原形**。go 不能变成 went。',
    NULL::jsonb, NULL, 'past_simple_question', false, 2, 9002
  ),
  (
    'The film ___ really exciting. We ___ a lot from start to finish.',
    'mcq', 'is / laugh', 'was / laughed', 'was / laugh', 'is / laughed', 'B',
    NULL::text[],
    '两个动词都对应过去：be 动词 → **was**，laugh → **laughed**。',
    NULL::jsonb, NULL, 'past_simple_mixed', false, 2, 9003
  ),

  -- ─── 3 fill-in ───
  (
    'Last Sunday, we ____ (visit) the new park near our school.',
    'fill', NULL, NULL, NULL, NULL, 'visited',
    ARRAY['visited']::text[],
    'visit 是规则动词，过去式直接加 **-ed** → visited。',
    NULL::jsonb, NULL, 'past_simple_regular', false, 1, 9004
  ),
  (
    'A: Where is Tom?  B: He ____ (go) to the library twenty minutes ago.',
    'fill', NULL, NULL, NULL, NULL, 'went',
    ARRAY['went']::text[],
    'twenty minutes **ago** → 过去时；go 的过去式是 **went**（不规则）。',
    NULL::jsonb, NULL, 'past_simple_irregular', false, 1, 9005
  ),
  (
    'When the bell ____ (ring), all the students ____ (stand) up quickly.',
    'fill', NULL, NULL, NULL, NULL, 'rang / stood',
    ARRAY[
      'rang / stood',
      'rang/stood',
      'rang, stood',
      'rang stood',
      'rang and stood'
    ]::text[],
    '两个都不规则：ring → **rang**，stand → **stood**。',
    NULL::jsonb, '中考阅卷里这两个不规则动词常被一起考。', 'past_simple_irregular', false, 2, 9006
  ),

  -- ─── 2 transform ───
  (
    '改写为一般过去时（提示：last night）：  "I watch TV every evening."',
    'transform', NULL, NULL, NULL, NULL, 'I watched TV last night.',
    ARRAY['I watched TV last night.', 'Last night, I watched TV.']::text[],
    'every evening → last night；watch 加 -ed。',
    NULL::jsonb, NULL, 'past_simple_transform', true, 2, 9007
  ),
  (
    '改写为否定句（保留 last week）：  "She bought vegetables last week."',
    'transform', NULL, NULL, NULL, NULL, 'She didn''t buy vegetables last week.',
    ARRAY['She didn''t buy vegetables last week.', 'She did not buy vegetables last week.']::text[],
    '否定句：bought → didn''t buy。didn''t 后用原形。',
    NULL::jsonb, '别忘了把 bought 改回原形 buy。', 'past_simple_negative', true, 2, 9008
  ),

  -- ─── 2 correction ───
  (
    '改错：  "He don''t went home until 9 p.m. last Friday."',
    'correction', NULL, NULL, NULL, NULL, 'He didn''t go home until 9 p.m. last Friday.',
    ARRAY['He didn''t go home until 9 p.m. last Friday.', 'He did not go home until 9 p.m. last Friday.']::text[],
    '两处错：① don''t → **didn''t** （last Friday 是过去）；② went → **go** （didn''t 后用原形）。',
    NULL::jsonb, NULL, 'past_simple_correction', true, 2, 9009
  ),
  (
    '改错：  "What time did the meeting started yesterday?"',
    'correction', NULL, NULL, NULL, NULL, 'What time did the meeting start yesterday?',
    ARRAY['What time did the meeting start yesterday?']::text[],
    'Did 后必须用动词**原形**：started → **start**。',
    NULL::jsonb, NULL, 'past_simple_correction', true, 2, 9010
  ),

  -- ─── 1 translation ───
  (
    '把这句话译成英文：去年寒假我们一家去了三亚。',
    'translation', NULL, NULL, NULL, NULL, 'My family went to Sanya for winter break last year.',
    ARRAY[
      'My family went to Sanya for winter break last year.',
      'My family went to Sanya for the winter vacation last year.',
      'My family went to Sanya during last year''s winter vacation.',
      'Last winter break, my family went to Sanya.',
      'Last winter vacation, my family went to Sanya.',
      'My family and I went to Sanya for winter break last year.',
      'We went to Sanya for winter break last year.'
    ]::text[],
    '考点：① 去年寒假 → "last year" + winter break/vacation；② go 的不规则过去式 **went**；③ "一家" → my family / my family and I / we。',
    NULL::jsonb, '地道写法：英文里"去年寒假"常拆成 "winter break/vacation … last year"，不说 "last winter vacation" — 那个像中式英语。', 'past_simple_translation', true, 3, 9011
  )
) AS q(stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
       accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
       difficulty, sort_order);


-- ---- 3. Sanity check: fail loudly if the seed row never existed ----
-- A missing g8.01 row would silently turn the whole migration into a no-op.
-- This block raises EXCEPTION so CI catches missing seed data instead of
-- shipping an empty gold-standard release.
DO $$
DECLARE
  v_point_id   uuid;
  v_q_count    int;
  v_depth      int;
BEGIN
  SELECT id, content_depth INTO v_point_id, v_depth
  FROM junior_grammar_points WHERE code = 'g8.01';

  IF v_point_id IS NULL THEN
    RAISE EXCEPTION
      'Gold-standard migration failed: junior_grammar_points row with code=''g8.01'' does not exist. Run the seed migration first.';
  END IF;

  IF v_depth <> 3 THEN
    RAISE EXCEPTION
      'Gold-standard migration failed: content_depth for g8.01 is %, expected 3. The UPDATE statement did not run.', v_depth;
  END IF;

  SELECT count(*) INTO v_q_count
  FROM junior_grammar_questions
  WHERE point_id = v_point_id AND sort_order BETWEEN 9000 AND 9099;

  IF v_q_count <> 12 THEN
    RAISE EXCEPTION
      'Gold-standard migration failed: expected 12 gold-standard questions in sort_order 9000-9099 for g8.01, got %.', v_q_count;
  END IF;

  RAISE NOTICE 'Gold-standard migration for g8.01 verified: content_depth=3, % questions seeded.', v_q_count;
END $$;


-- =====================================================================
-- END · Gold-standard content for g8.01 一般过去时
-- After running this migration:
--   • content_depth = 3 (full)
--   • Point page renders the 4-stage flow with rich teacher_script + immersion_cards
--   • Lab page renders all 8 phases with contrast/reflex/drill/correction/boss
--   • Practice surface has 12 questions across 5 types
--   • Final DO block raises EXCEPTION if anything above silently failed
-- =====================================================================
