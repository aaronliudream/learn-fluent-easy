-- =====================================================================
-- COMBINED GOLD-STANDARD RUNNER · 23 grammar points
-- Fixes applied: distractors NOT NULL, embedded JSON quotes escaped,
-- 2 typos (' instead of ") in option_c fields.
-- =====================================================================


-- ╔════════════════════════════════════════════════════════════════════╗
-- ║ FILE: 20260521120000_g8_01_past_simple_gold_standard.sql
-- ╚════════════════════════════════════════════════════════════════════╝
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
    '{}'::jsonb, NULL, 'past_simple_regular', false, 1, 9000
  ),
  (
    'My brother ___ go to bed until 11 last night.',
    'mcq', 'don''t', 'doesn''t', 'didn''t', 'wasn''t', 'C',
    NULL::text[],
    '**last night** → 过去时；否定句用 **didn''t** + 动词原形。',
    '{}'::jsonb, NULL, 'past_simple_negative', false, 1, 9001
  ),
  (
    '— ___ your sister ___ to the museum with you last Sunday?  — Yes, she did.',
    'mcq', 'Did / go', 'Did / went', 'Does / go', 'Was / go', 'A',
    NULL::text[],
    '一般疑问句：**Did + 主语 + 动词原形**。go 不能变成 went。',
    '{}'::jsonb, NULL, 'past_simple_question', false, 2, 9002
  ),
  (
    'The film ___ really exciting. We ___ a lot from start to finish.',
    'mcq', 'is / laugh', 'was / laughed', 'was / laugh', 'is / laughed', 'B',
    NULL::text[],
    '两个动词都对应过去：be 动词 → **was**，laugh → **laughed**。',
    '{}'::jsonb, NULL, 'past_simple_mixed', false, 2, 9003
  ),

  -- ─── 3 fill-in ───
  (
    'Last Sunday, we ____ (visit) the new park near our school.',
    'fill', NULL, NULL, NULL, NULL, 'visited',
    ARRAY['visited']::text[],
    'visit 是规则动词，过去式直接加 **-ed** → visited。',
    '{}'::jsonb, NULL, 'past_simple_regular', false, 1, 9004
  ),
  (
    'A: Where is Tom?  B: He ____ (go) to the library twenty minutes ago.',
    'fill', NULL, NULL, NULL, NULL, 'went',
    ARRAY['went']::text[],
    'twenty minutes **ago** → 过去时；go 的过去式是 **went**（不规则）。',
    '{}'::jsonb, NULL, 'past_simple_irregular', false, 1, 9005
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
    '{}'::jsonb, '中考阅卷里这两个不规则动词常被一起考。', 'past_simple_irregular', false, 2, 9006
  ),

  -- ─── 2 transform ───
  (
    '改写为一般过去时（提示：last night）：  "I watch TV every evening."',
    'transform', NULL, NULL, NULL, NULL, 'I watched TV last night.',
    ARRAY['I watched TV last night.', 'Last night, I watched TV.']::text[],
    'every evening → last night；watch 加 -ed。',
    '{}'::jsonb, NULL, 'past_simple_transform', true, 2, 9007
  ),
  (
    '改写为否定句（保留 last week）：  "She bought vegetables last week."',
    'transform', NULL, NULL, NULL, NULL, 'She didn''t buy vegetables last week.',
    ARRAY['She didn''t buy vegetables last week.', 'She did not buy vegetables last week.']::text[],
    '否定句：bought → didn''t buy。didn''t 后用原形。',
    '{}'::jsonb, '别忘了把 bought 改回原形 buy。', 'past_simple_negative', true, 2, 9008
  ),

  -- ─── 2 correction ───
  (
    '改错：  "He don''t went home until 9 p.m. last Friday."',
    'correction', NULL, NULL, NULL, NULL, 'He didn''t go home until 9 p.m. last Friday.',
    ARRAY['He didn''t go home until 9 p.m. last Friday.', 'He did not go home until 9 p.m. last Friday.']::text[],
    '两处错：① don''t → **didn''t** （last Friday 是过去）；② went → **go** （didn''t 后用原形）。',
    '{}'::jsonb, NULL, 'past_simple_correction', true, 2, 9009
  ),
  (
    '改错：  "What time did the meeting started yesterday?"',
    'correction', NULL, NULL, NULL, NULL, 'What time did the meeting start yesterday?',
    ARRAY['What time did the meeting start yesterday?']::text[],
    'Did 后必须用动词**原形**：started → **start**。',
    '{}'::jsonb, NULL, 'past_simple_correction', true, 2, 9010
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
    '{}'::jsonb, '地道写法：英文里"去年寒假"常拆成 "winter break/vacation … last year"，不说 "last winter vacation" — 那个像中式英语。', 'past_simple_translation', true, 3, 9011
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


-- ╔════════════════════════════════════════════════════════════════════╗
-- ║ FILE: 20260521130000_g8_27_passive_voice_gold_standard.sql
-- ╚════════════════════════════════════════════════════════════════════╝
-- =====================================================================
-- Gold-standard content for G8 · 被动语态 · Passive Voice
-- Code: g8.27   Category: verb
-- =====================================================================
-- Second gold-standard authored against docs/grammar-content-rubric.md.
-- Stress-tests the rubric on a structurally different point (state-shift
-- rather than tense-shift). All passive-voice rules covered: 8 tense
-- forms, modal passives, by-phrase, intransitive trap.
--
-- Targets the row by `code` so it works across environments.
-- Idempotent: questions scoped to sort_order 9000-9099 and re-inserted.
-- =====================================================================

-- ---- 1. Update the grammar point with the full content payload ----
UPDATE junior_grammar_points
SET
  summary = '把句子从"谁做了什么"翻转成"什么被怎样了" — 中考阅读里的新闻、说明、改写题几乎全靠它。',
  hook_line_cn = '中考阅读里 30% 的句子是被动语态。掌握公式，新闻类阅读直接降一档。',
  hook_line = 'Flip the spotlight from doer to thing — unlocks news-style reading and transform questions.',
  mnemonic = '被动 = be + 过去分词；时态全在 be 上变，过去分词不动。',
  content_depth = 3,

  explanation_md = E'## 🎯 一句话搞定\n\n**主语是动作的"承受者"** → 用 **be + 过去分词**。be 跟着时态变，过去分词不变。\n\n---\n\n## 📐 八大时态的被动形式\n\n| 时态 | 主动 | 被动公式 | 例子 |\n|---|---|---|---|\n| 一般现在 | does | **am / is / are + V-ed** | English **is spoken** here. |\n| 一般过去 | did | **was / were + V-ed** | The Wall **was built** long ago. |\n| 一般将来 | will do | **will be + V-ed** | A new school **will be built**. |\n| 现在进行 | is doing | **am / is / are being + V-ed** | The road **is being repaired**. |\n| 现在完成 | has done | **have / has been + V-ed** | The job **has been done**. |\n| 过去完成 | had done | **had been + V-ed** | The cake **had been eaten**. |\n| 含情态 | can do | **can / should / must be + V-ed** | Phones **must be turned off**. |\n| be going to | be going to do | **be going to be + V-ed** | It **is going to be built** soon. |\n\n> ⚠️ **铁律：be 后面永远是"过去分词 (V-ed/V3)"，不是"过去式"。**\n\n---\n\n## ⏰ 看到这些 = 被动语态信号\n\n- **by + 动作执行者**：The book was written **by** Lu Xun.\n- **in + 地点/年份**（被动事实）：Chinese **is spoken in** China.\n- **主语是"东西、地点、规则、被害者"** 而不是"做的人"\n- **新闻 / 说明文 / 公告**：A new bridge **will be opened** next month.\n- **必须 / 应该 / 允许 + 动作**（含情态被动）：This **must be done** today.\n\n---\n\n## 🔥 中考最爱考的过去分词（≠ 过去式！）\n\n| 原形 | 过去式 | **过去分词（被动用这个）** |\n|---|---|---|\n| break | broke | **broken** |\n| write | wrote | **written** |\n| see | saw | **seen** |\n| take | took | **taken** |\n| give | gave | **given** |\n| do | did | **done** |\n| eat | ate | **eaten** |\n| speak | spoke | **spoken** |\n| steal | stole | **stolen** |\n| forget | forgot | **forgotten** |\n| sing | sang | **sung** |\n| ride | rode | **ridden** |\n\n> 📌 记忆口诀：**过去式描述"做了"，过去分词描述"被做了"** — 形式常常不一样！\n\n---\n\n## ⚠️ Top 5 易错点（中考批卷红笔常出现）\n\n1. **用了过去式当过去分词**：~~The window is broke.~~ → **The window is broken.**\n2. **忘了 be 动词**：~~English spoken here.~~ → **English is spoken here.**\n3. **将来时被动忘 will be**：~~A school is built next year.~~ → **A school will be built next year.**\n4. **不及物动词被强行被动**：~~The accident was happened.~~ → **The accident happened.**（happen / take place / appear / arrive 不能被动！）\n5. **主谓不一致**：~~Many trees was planted.~~ → **Many trees were planted.**（主语 trees 复数，be 用 were）\n\n---\n\n## 🧠 三秒判断口诀\n\n> **主语是动作的"承受者" → 被动**（用 be + V-ed）  \n> **主语自己"动了一下"（happen / rise / appear）→ 主动**（没有被动形式）',

  -- teacher_script is set in a second UPDATE below

  immersion_cards = $jsonb$[
    {"situation": "Tour guide at the Great Wall", "cn": "长城是两千多年前修建的。", "en": "The Great Wall was built more than 2,000 years ago."},
    {"situation": "Classroom rule on day one", "cn": "上课时手机必须关机。", "en": "Phones must be turned off during class."},
    {"situation": "Showing a Chinese friend around", "cn": "汉语在世界很多地方都被使用。", "en": "Chinese is spoken in many parts of the world."},
    {"situation": "Reporting a stolen bike", "cn": "我的自行车昨天被偷了。", "en": "My bike was stolen yesterday."},
    {"situation": "Reading a school announcement", "cn": "下周五新图书馆将正式开放。", "en": "The new library will be opened next Friday."},
    {"situation": "Science class on water", "cn": "水是由氢和氧组成的。", "en": "Water is made up of hydrogen and oxygen."}
  ]$jsonb$::jsonb,

  contrast_table = $jsonb$[
    {"lhs": "The window is broke by the boy.",        "rhs": "The window was broken by the boy."},
    {"lhs": "English speak in many countries.",       "rhs": "English is spoken in many countries."},
    {"lhs": "A new school is build next year.",       "rhs": "A new school will be built next year."},
    {"lhs": "The accident was happened yesterday.",   "rhs": "The accident happened yesterday."},
    {"lhs": "Many trees was planted last spring.",    "rhs": "Many trees were planted last spring."},
    {"lhs": "The book wrote by Lu Xun.",              "rhs": "The book was written by Lu Xun."}
  ]$jsonb$::jsonb,

  reflex_cards = $jsonb$[
    {"cn": "这本书是2010年写的。",          "en": "This book was written in 2010.",                "keyword": "was written"},
    {"cn": "门刚才被关上了。",              "en": "The door was just closed.",                     "keyword": "was closed"},
    {"cn": "这首歌全世界都在唱。",          "en": "This song is sung all over the world.",         "keyword": "is sung"},
    {"cn": "手机必须保持关机。",            "en": "Phones must be kept off.",                      "keyword": "must be kept"},
    {"cn": "蛋糕已经被吃完了。",            "en": "The cake has been eaten.",                      "keyword": "has been eaten"},
    {"cn": "这栋房子下个月会被卖掉。",      "en": "This house will be sold next month.",           "keyword": "will be sold"},
    {"cn": "信刚刚被寄出去。",              "en": "The letter has just been sent.",                "keyword": "has been sent"},
    {"cn": "新桥下周开通。",                "en": "The new bridge will be opened next week.",      "keyword": "will be opened"}
  ]$jsonb$::jsonb,

  situation_drills = $jsonb$[
    {
      "situation": "Your classmate asks why you look upset on the way home.",
      "cn": "我的便当今天被人拿走了。",
      "en": "My lunch box was taken by someone today.",
      "accepted": [
        "Someone took my lunch box today.",
        "My lunch was taken today."
      ]
    },
    {
      "situation": "Introducing Suzhou Museum to a foreign visitor.",
      "cn": "苏州博物馆是由贝聿铭设计的。",
      "en": "Suzhou Museum was designed by I. M. Pei.",
      "accepted": [
        "The Suzhou Museum was designed by I. M. Pei.",
        "I. M. Pei designed the Suzhou Museum."
      ]
    },
    {
      "situation": "Posting a warning sign at the entrance of a small forest.",
      "cn": "禁止穿过这片树林。",
      "en": "This forest must not be crossed.",
      "accepted": [
        "Crossing this forest is forbidden.",
        "No crossing through this forest."
      ]
    },
    {
      "situation": "Explaining the corridor rule to a new transfer student.",
      "cn": "走廊里不能跑步。",
      "en": "Running is not allowed in the corridor.",
      "accepted": [
        "You are not allowed to run in the corridor.",
        "Running in the corridor is forbidden."
      ]
    }
  ]$jsonb$::jsonb,

  correction_tasks = $jsonb$[
    {
      "wrong": "The window is broke by the boy.",
      "model": "The window was broken by the boy.",
      "hint":  "broke 是过去式，被动要用过去分词",
      "why":   "**break → broke (过去式) → broken (过去分词)**。被动语态里 be 后面只能跟过去分词。"
    },
    {
      "wrong": "English speak in many countries.",
      "model": "English is spoken in many countries.",
      "hint":  "缺 be 动词",
      "why":   "被动公式是 **be + V-ed**，少了 be 这句就不是完整的被动语态。English 单数 → **is spoken**。"
    },
    {
      "wrong": "A new school is build next year.",
      "model": "A new school will be built next year.",
      "hint":  "next year 是将来时间",
      "why":   "**next year** 是将来时信号，将来时被动 = **will be + V-ed**。同时 build 要变 **built**。"
    },
    {
      "wrong": "The accident was happened last night.",
      "model": "The accident happened last night.",
      "hint":  "happen 是不及物动词",
      "why":   "**happen / take place / appear / arrive** 都是不及物动词，没有被动形式。直接用过去式就好。"
    },
    {
      "wrong": "Many trees was planted last spring.",
      "model": "Many trees were planted last spring.",
      "hint":  "主语是复数",
      "why":   "主语 **trees** 是复数，be 动词的过去式要用 **were**，不是 was。"
    },
    {
      "wrong": "The letter has wrote by Tom.",
      "model": "The letter has been written by Tom.",
      "hint":  "现在完成时被动的公式",
      "why":   "现在完成时被动 = **have/has + been + V-ed**。漏掉 been 是中考改错最常见错误之一。"
    }
  ]$jsonb$::jsonb,

  boss_questions = $jsonb$[
    {
      "stem": "The Mona Lisa ___ by Leonardo da Vinci more than 500 years ago.",
      "option_a": "painted",
      "option_b": "was painted",
      "option_c": "is painted",
      "option_d": "was painting",
      "correct_answer": "B",
      "trap": "选 A 的同学忘记主语 Mona Lisa 是画作（被画的），不是画的人 — 必须用被动。选 C 时态错（more than 500 years ago）。选 D 主动进行时更离谱。",
      "why":  "**主语是承受者 + 过去时间** → 一般过去时被动 = **was/were + V-ed**。paint → painted（过去分词）。"
    },
    {
      "stem": "Many trees ___ in our city last spring to fight air pollution.",
      "option_a": "are planted",
      "option_b": "were planted",
      "option_c": "planted",
      "option_d": "was planted",
      "correct_answer": "B",
      "trap": "选 D 是最常见陷阱：主语 trees 是**复数**，be 必须用 were。选 A 时态错。选 C 漏 be。",
      "why":  "复数主语 + 过去时间 = **were + V-ed**。中考改错和单选都爱在 was/were 上挖坑。"
    },
    {
      "stem": "All books ___ to the library by next Friday.",
      "option_a": "must return",
      "option_b": "must returned",
      "option_c": "must be returned",
      "option_d": "must been returned",
      "correct_answer": "C",
      "trap": "选 A 主动语态错（书自己不会回去）。选 B 情态后没接 be。选 D 完成时混进来了。",
      "why":  "情态动词被动公式：**情态 + be + V-ed**（must / should / can / may + be + V-ed）。"
    },
    {
      "stem": "— Have you finished your homework?\n— Yes, it ___ already.",
      "option_a": "has done",
      "option_b": "has been done",
      "option_c": "is done",
      "option_d": "was done",
      "correct_answer": "B",
      "trap": "选 A 漏了 been，是中考完成时被动最高频考点。选 C 时态错（题干用 Have you …）。选 D 时态不一致。",
      "why":  "现在完成时被动 = **have/has + been + V-ed**。It 替代 homework（不可数 → 单数 has）+ been + done。"
    }
  ]$jsonb$::jsonb

WHERE code = 'g8.27';


-- ---- 1b. teacher_script (separate UPDATE keeps $jsonb$ delimiter unambiguous) ----
UPDATE junior_grammar_points SET teacher_script = $jsonb$[
  {
    "text": "今天解锁**被动语态**。中考阅读里 30% 的句子都长这样：**xxx was built**、**xxx is used** — 全是被动。",
    "show": "🎯 Today: be + V-ed = Passive Voice",
    "duration": 9
  },
  {
    "text": "公式只有一行：**be + 过去分词**。整句的时态全靠 **be** 来变，过去分词不动。",
    "show": "Subject + be + V-ed  →  English is spoken.",
    "highlight": "be + V-ed",
    "duration": 10
  },
  {
    "text": "**现在被动**用 am / is / are：English **is** spoken. Books **are** read.",
    "show": "is / are + V-ed   →   English is spoken.",
    "highlight": "is spoken",
    "duration": 9
  },
  {
    "text": "**过去被动**用 was / were：The Wall **was** built thousands of years ago.",
    "show": "was / were + V-ed   →   The Wall was built.",
    "highlight": "was built",
    "duration": 9
  },
  {
    "text": "**将来被动**记住 will **be** — 千万别漏掉 be：A new bridge **will be** opened.",
    "show": "will + be + V-ed   →   will be opened",
    "highlight": "will be opened",
    "duration": 10
  },
  {
    "text": "**含情态**：can / should / must 后面也要 **be + 过去分词**。Phones **must be** turned off.",
    "show": "can / should / must + be + V-ed",
    "highlight": "must be",
    "duration": 10
  },
  {
    "text": "**坑！** 过去式 ≠ 过去分词！break → broke → **broken**，write → wrote → **written**，see → saw → **seen**。被动用第三种。",
    "show": "break → broke → broken   write → wrote → written",
    "highlight": "broken",
    "duration": 12
  },
  {
    "text": "最后提醒：**happen / take place / appear** 等不及物动词没有被动。下一关你会看到 6 个真实场景，先听再练。",
    "show": "✗ The accident was happened. → ✓ The accident happened.",
    "highlight": "happened",
    "duration": 10
  }
]$jsonb$::jsonb
WHERE code = 'g8.27';


-- ---- 2. Replace gold-standard practice questions (sort_order 9000-9099) ----
DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.27')
  AND sort_order BETWEEN 9000 AND 9099;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.27')
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
    'A lot of trees ___ along the street every spring.',
    'mcq', 'plant', 'are planted', 'is planted', 'are planting', 'B',
    NULL::text[],
    '主语 trees 复数 + 客观事实（一般现在时） → **are planted**。',
    '{}'::jsonb, NULL, 'passive_present', false, 1, 9000
  ),
  (
    'The Forbidden City ___ over 600 years ago.',
    'mcq', 'built', 'was built', 'is built', 'was building', 'B',
    NULL::text[],
    'over 600 years ago = 过去时间 + 主语 City 被建造 → **was built**（过去时被动）。',
    '{}'::jsonb, NULL, 'passive_past', false, 1, 9001
  ),
  (
    'Mobile phones ___ off before the exam begins.',
    'mcq', 'must turn', 'must be turn', 'must be turned', 'must turning', 'C',
    NULL::text[],
    '情态被动公式：**must + be + V-ed**。turn → turned（过去分词）。',
    '{}'::jsonb, NULL, 'passive_modal', false, 2, 9002
  ),
  (
    'My homework ___ already. I can play games now.',
    'mcq', 'has done', 'has been done', 'is done', 'was done', 'B',
    NULL::text[],
    '主语 homework 是被做的 + 时间 already → 现在完成时被动 = **has been + V-ed**。漏掉 been 是最常见错误。',
    '{}'::jsonb, NULL, 'passive_perfect', false, 2, 9003
  ),

  -- ─── 3 fill-in ───
  (
    'English ____ (speak) in more than 100 countries in the world.',
    'fill', NULL, NULL, NULL, NULL, 'is spoken',
    ARRAY['is spoken']::text[],
    '客观事实（一般现在时）+ 主语 English 被说 → **is spoken**。',
    '{}'::jsonb, NULL, 'passive_present', false, 1, 9004
  ),
  (
    'The new bridge ____ (open) to the public next Monday.',
    'fill', NULL, NULL, NULL, NULL, 'will be opened',
    ARRAY['will be opened', 'is going to be opened']::text[],
    'next Monday = 将来 + 主语 bridge 被开通 → **will be opened**（或 is going to be opened）。',
    '{}'::jsonb, NULL, 'passive_future', false, 2, 9005
  ),
  (
    'The window ____ (break) by Tom yesterday afternoon.',
    'fill', NULL, NULL, NULL, NULL, 'was broken',
    ARRAY['was broken']::text[],
    'yesterday afternoon = 过去 + window 被打破 → **was broken**。注意 break 的过去分词是 **broken**，不是 broke。',
    '{}'::jsonb, '中考阅卷里 "was broke" 是最高频错误之一。', 'passive_past', false, 2, 9006
  ),

  -- ─── 2 transform (主动 → 被动) ───
  (
    '改写为被动语态：  "Lu Xun wrote this novel in 1921."',
    'transform', NULL, NULL, NULL, NULL, 'This novel was written by Lu Xun in 1921.',
    ARRAY[
      'This novel was written by Lu Xun in 1921.',
      'This novel was written in 1921 by Lu Xun.'
    ]::text[],
    '主动 → 被动：宾语 (this novel) 变主语 + was written + by + 原主语 (Lu Xun)。',
    '{}'::jsonb, NULL, 'passive_transform', true, 2, 9007
  ),
  (
    '改写为被动语态：  "They will build a new park here next year."',
    'transform', NULL, NULL, NULL, NULL, 'A new park will be built here next year.',
    ARRAY[
      'A new park will be built here next year.',
      'A new park is going to be built here next year.'
    ]::text[],
    '将来时被动 = **will be + V-ed**。a new park 提前作主语，by them 通常省略（执行者不重要）。',
    '{}'::jsonb, '将来时被动里很多同学漏掉 "be"，记住公式：will + be + V-ed。', 'passive_transform', true, 2, 9008
  ),

  -- ─── 2 correction ───
  (
    '改错：  "Many trees was planted in our city last spring."',
    'correction', NULL, NULL, NULL, NULL, 'Many trees were planted in our city last spring.',
    ARRAY[
      'Many trees were planted in our city last spring.'
    ]::text[],
    '主语 trees 是复数，be 动词过去式必须用 **were**，不是 was。',
    '{}'::jsonb, NULL, 'passive_subject_verb', true, 2, 9009
  ),
  (
    '改错：  "The accident was happened on a busy road yesterday."',
    'correction', NULL, NULL, NULL, NULL, 'The accident happened on a busy road yesterday.',
    ARRAY[
      'The accident happened on a busy road yesterday.'
    ]::text[],
    '**happen** 是不及物动词，没有被动形式。直接用一般过去时 **happened**。',
    '{}'::jsonb, '常见同类陷阱：take place / appear / arrive / belong to — 都不能被动。', 'passive_intransitive', true, 3, 9010
  ),

  -- ─── 1 translation ───
  (
    '把这句话译成英文：这首歌是 2008 年北京奥运会期间被写出来的。',
    'translation', NULL, NULL, NULL, NULL, 'This song was written during the 2008 Beijing Olympics.',
    ARRAY[
      'This song was written during the 2008 Beijing Olympics.',
      'This song was written during the Beijing 2008 Olympics.',
      'The song was written during the 2008 Beijing Olympic Games.',
      'This song was written during the Beijing Olympic Games in 2008.'
    ]::text[],
    '考点：① 主语 "歌" 是被写的 → 被动；② 2008 年 → 过去时；③ write 的过去分词是 **written** 不是 wrote。',
    '{}'::jsonb, '"during + 事件" 比 "in + 事件" 更地道，强调时间段而不是时间点。', 'passive_translation', true, 3, 9011
  )
) AS q(stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
       accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
       difficulty, sort_order);


-- ---- 3. Sanity check: fail loudly if anything silently no-op'd ----
DO $$
DECLARE
  v_point_id   uuid;
  v_q_count    int;
  v_depth      int;
BEGIN
  SELECT id, content_depth INTO v_point_id, v_depth
  FROM junior_grammar_points WHERE code = 'g8.27';

  IF v_point_id IS NULL THEN
    RAISE EXCEPTION
      'Gold-standard migration failed: junior_grammar_points row with code=''g8.27'' does not exist. Run the seed migration first.';
  END IF;

  IF v_depth <> 3 THEN
    RAISE EXCEPTION
      'Gold-standard migration failed: content_depth for g8.27 is %, expected 3. The UPDATE statement did not run.', v_depth;
  END IF;

  SELECT count(*) INTO v_q_count
  FROM junior_grammar_questions
  WHERE point_id = v_point_id AND sort_order BETWEEN 9000 AND 9099;

  IF v_q_count <> 12 THEN
    RAISE EXCEPTION
      'Gold-standard migration failed: expected 12 gold-standard questions in sort_order 9000-9099 for g8.27, got %.', v_q_count;
  END IF;

  RAISE NOTICE 'Gold-standard migration for g8.27 verified: content_depth=3, % questions seeded.', v_q_count;
END $$;


-- =====================================================================
-- END · Gold-standard content for g8.27 被动语态
-- After running this migration:
--   • content_depth = 3 (full)
--   • Point page renders the 4-stage flow with teacher_script + immersion_cards
--   • Lab page renders all 8 phases with contrast/reflex/drill/correction/boss
--   • Practice surface has 12 questions across 5 types (passive_present /
--     past / future / modal / perfect / transform / subject_verb /
--     intransitive / translation)
--   • Final DO block raises EXCEPTION if anything silently failed
-- =====================================================================


-- ╔════════════════════════════════════════════════════════════════════╗
-- ║ FILE: 20260521140000_g8_24_present_perfect_gold_standard.sql
-- ╚════════════════════════════════════════════════════════════════════╝
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
      "why":   "**have been to**（去过，回来了）vs **have gone to**（去了，还没回来）。twice 表\"次数\"必须用 been to。另外，went 是过去式，过去分词是 **gone**。"
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
      "trap": "选 C 的同学忽略了：问的是经历（ever），回答说\"我去过\"，人现在不在那 → 必须用 **been to**。gone to 表示\"人还在那儿没回来\"。",
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
      "why":  "①\"持续到现在\"用现在完成时；② **since + 时间点**（2018 是年份），**for + 时长**（5 years）。"
    },
    {
      "stem": "— Where''s Mom?\n— She ___ to the supermarket. She''ll be back soon.",
      "option_a": "has been",
      "option_b": "has gone",
      "option_c": "went",
      "option_d": "goes",
      "correct_answer": "B",
      "trap": "选 A 的同学没看到 \"She''ll be back soon\"（她马上回来）— 说明妈妈**还没回**，必须用 **has gone**。",
      "why":  "**has been to**：去过然后回来了。**has gone to**：去了还没回。看后半句 \"She''ll be back soon\" 就锁定 gone。"
    },
    {
      "stem": "— ___ you ___ the new film yet?\n— No, not ___.",
      "option_a": "Did / see / yet",
      "option_b": "Have / saw / already",
      "option_c": "Have / seen / yet",
      "option_d": "Do / see / yet",
      "correct_answer": "C",
      "trap": "选 B 的同学把过去式 saw 用进了完成时（必须是 seen）。yet 出现在疑问/否定句末；already 用在肯定句。",
      "why":  "**yet** = 还，专用在否定/疑问句末。回答 \"Not yet.\" 是固定搭配。see → saw → **seen**。"
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
    '{}'::jsonb, NULL, 'present_perfect_for', false, 1, 9000
  ),
  (
    '— Where is your father?\n— He ___ to Beijing on business. He''ll come back next week.',
    'mcq', 'has been', 'has gone', 'went', 'goes', 'B',
    NULL::text[],
    '"He''ll come back next week"（下周才回）= 人还没回 → **has gone to**。',
    '{}'::jsonb, NULL, 'present_perfect_been_gone', false, 2, 9001
  ),
  (
    'My family ___ in Suzhou ___ I was born.',
    'mcq', 'lived / for', 'has lived / since', 'lives / since', 'has lived / for', 'B',
    NULL::text[],
    '持续动作用现在完成时 = has lived；"I was born"是时间点 → **since**。',
    '{}'::jsonb, NULL, 'present_perfect_since', false, 2, 9002
  ),
  (
    '— ___ Tom ___ his homework yet?\n— Yes, he ___ it twenty minutes ago.',
    'mcq', 'Has / done / has finished', 'Has / done / finished', 'Did / done / did', 'Has / did / finished', 'B',
    NULL::text[],
    '疑问 = Has + V-ed = **Has done**；回答里 "20 minutes ago" 是过去时间点 → 必须用一般过去时 **finished**，不是现在完成时。',
    '{}'::jsonb, '这题是高频陷阱：问句用完成时，但回答出现具体过去时间就必须切换到一般过去时。', 'present_perfect_vs_past', false, 3, 9003
  ),

  -- ─── 3 fill-in ───
  (
    'I ____ (read) this book three times. It''s really exciting.',
    'fill', NULL, NULL, NULL, NULL, 'have read',
    ARRAY['have read', 'have already read']::text[],
    'three times = 经历 → 现在完成时 = **have read**（read 的过去分词还是 read，但读音变成 /red/）。',
    '{}'::jsonb, NULL, 'present_perfect_experience', false, 2, 9004
  ),
  (
    'Lin ____ (not finish) her project yet. She needs more time.',
    'fill', NULL, NULL, NULL, NULL, 'hasn''t finished',
    ARRAY['hasn''t finished', 'has not finished']::text[],
    'yet 出现在否定句末 → 现在完成时否定 = **hasn''t + 过去分词**。',
    '{}'::jsonb, NULL, 'present_perfect_negative', false, 2, 9005
  ),
  (
    'My grandma ____ (live) in this town since 1980.',
    'fill', NULL, NULL, NULL, NULL, 'has lived',
    ARRAY['has lived', 'has been living']::text[],
    'since 1980 = 1980 年起持续到现在 → **has lived**（或 has been living，都对）。',
    '{}'::jsonb, NULL, 'present_perfect_since', false, 2, 9006
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
    '{}'::jsonb, NULL, 'present_perfect_transform', true, 2, 9007
  ),
  (
    '把句子改成否定句（用 yet）：  "She has answered the message."',
    'transform', NULL, NULL, NULL, NULL, 'She hasn''t answered the message yet.',
    ARRAY[
      'She hasn''t answered the message yet.',
      'She has not answered the message yet.'
    ]::text[],
    '否定句 = has not / hasn''t + V-ed；yet 放在句末。',
    '{}'::jsonb, NULL, 'present_perfect_negative', true, 2, 9008
  ),

  -- ─── 2 correction ───
  (
    '改错：  "I have seen this movie last weekend."',
    'correction', NULL, NULL, NULL, NULL, 'I saw this movie last weekend.',
    ARRAY[
      'I saw this movie last weekend.'
    ]::text[],
    '**last weekend** 是具体过去时间，现在完成时不能与之连用，必须用一般过去时 **saw**。',
    '{}'::jsonb, NULL, 'present_perfect_vs_past', true, 2, 9009
  ),
  (
    '改错：  "Tom has went to the library and is studying there now."',
    'correction', NULL, NULL, NULL, NULL, 'Tom has gone to the library and is studying there now.',
    ARRAY[
      'Tom has gone to the library and is studying there now.'
    ]::text[],
    '①go 的过去分词是 **gone**，不是 went；② 人还在图书馆 → 用 **has gone to**（不是 been to）。',
    '{}'::jsonb, NULL, 'present_perfect_been_gone', true, 3, 9010
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
    '{}'::jsonb, '更地道：since last September 比 from last September 更自然；memorize / learn / study 三个动词在中考写作里都可接受。', 'present_perfect_translation', true, 3, 9011
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


-- ╔════════════════════════════════════════════════════════════════════╗
-- ║ FILE: 20260521150000_g8_28_relative_clauses_gold_standard.sql
-- ╚════════════════════════════════════════════════════════════════════╝
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
      "why":   "先行词 **the boy** 是\"人\"，关系词必须用 **who** 或 **that**，不能用 which。which 只修饰物。"
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
      "why":   "**who''s = who is**（缩写），用在\"是谁\"的场景。所有格\"谁的\"必须用 **whose**。形似但意义完全不同。"
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
      "why":   "关系词在从句中作**主语**时**不能省略**。这里 \"is sitting\" 缺主语，必须补上 **who** 或 **that**。"
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
      "trap": "选 A 把人当成了物。选 B（whose）是所有格，但后面不是\"谁的什么\"。选 D（what）不能引导定语从句。",
      "why":  "先行词 the man 是人 + 关系词在从句作主语 → 必须用 **who**（或 that）。"
    },
    {
      "stem": "I have a friend ___ father is a famous chef in Suzhou.",
      "option_a": "who",
      "option_b": "whose",
      "option_c": "who''s",
      "option_d": "that",
      "correct_answer": "B",
      "trap": "选 C（who''s = who is）是中考改错最爱挖的坑 — 看似对，意思变成\"是谁的爸爸\"。选 A/D 都漏了\"所有格\"含义。",
      "why":  "father 前面缺一个\"她的/他的\" → 所有格 → **whose**。a friend whose father = 朋友的爸爸。"
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
    "text": "今天解锁**定语从句**。它是中考阅读长难句的\"骨架\"，看懂它，长句直接降两个难度。",
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
    "text": "**所有格\"谁的\"** → 用 **whose**（人物都可以）：a friend **whose father** ...",
    "show": "''s → whose",
    "highlight": "whose",
    "duration": 10
  },
  {
    "text": "**铁律**：关系词在从句中作**主语**时**绝对不能省**！\"The boy is reading is Tom.\" 不完整，必须加 who。",
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
    '{}'::jsonb, NULL, 'relative_who_subject', false, 1, 9000
  ),
  (
    'This is the museum ___ we visited last weekend.',
    'mcq', 'who', 'whose', 'which', 'where', 'C',
    NULL::text[],
    '先行词 the museum 是物 + 在从句中作 visited 的宾语 → **which** (或 that)。注意：这里宾语关系，所以不用 where。',
    '{}'::jsonb, NULL, 'relative_which_object', false, 2, 9001
  ),
  (
    'I have a classmate ___ mother is a famous singer.',
    'mcq', 'who', 'whose', 'whom', 'that', 'B',
    NULL::text[],
    'mother 前面缺所有格"她的" → **whose**。a classmate whose mother = 这位同学的妈妈。',
    '{}'::jsonb, NULL, 'relative_whose', false, 2, 9002
  ),
  (
    'This is the best lesson ___ I have ever had.',
    'mcq', 'which', 'who', 'that', 'whose', 'C',
    NULL::text[],
    '先行词 the best lesson 被**形容词最高级 best** 修饰 → 关系词只能用 **that**。',
    '{}'::jsonb, NULL, 'relative_that_only', false, 2, 9003
  ),

  -- ─── 3 fill-in ───
  (
    'The boy ____ is sitting next to me is from Beijing.',
    'fill', NULL, NULL, NULL, NULL, 'who',
    ARRAY['who', 'that']::text[],
    '人 + 主语 → who 或 that。',
    '{}'::jsonb, NULL, 'relative_who_subject', false, 1, 9004
  ),
  (
    'I have a dog ____ legs are very short.',
    'fill', NULL, NULL, NULL, NULL, 'whose',
    ARRAY['whose']::text[],
    '"狗的腿"= 所有格 → **whose**。whose 既可用于人也可用于物。',
    '{}'::jsonb, NULL, 'relative_whose_thing', false, 2, 9005
  ),
  (
    'This is the only book ____ can help you pass the exam.',
    'fill', NULL, NULL, NULL, NULL, 'that',
    ARRAY['that']::text[],
    'the only 后面只能用 **that**，不用 which。',
    '{}'::jsonb, NULL, 'relative_that_only', false, 2, 9006
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
    '{}'::jsonb, NULL, 'relative_combine', true, 2, 9007
  ),
  (
    '把两个句子合并：  "I have a friend. His father works in Suzhou Industrial Park."',
    'transform', NULL, NULL, NULL, NULL, 'I have a friend whose father works in Suzhou Industrial Park.',
    ARRAY[
      'I have a friend whose father works in Suzhou Industrial Park.'
    ]::text[],
    '"His father" 表所有格 → 用 **whose father** 引导定语从句。',
    '{}'::jsonb, NULL, 'relative_combine_whose', true, 3, 9008
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
    '{}'::jsonb, NULL, 'relative_double_object', true, 2, 9009
  ),
  (
    '改错：  "The man which lives next door is a doctor."',
    'correction', NULL, NULL, NULL, NULL, 'The man who lives next door is a doctor.',
    ARRAY[
      'The man who lives next door is a doctor.',
      'The man that lives next door is a doctor.'
    ]::text[],
    '先行词 the man 是人 → 用 **who** 或 that，不能用 which。',
    '{}'::jsonb, NULL, 'relative_which_for_person', true, 2, 9010
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
    '{}'::jsonb, '更地道：helped me pick up / helped me find 都自然；写作时把"帮我"对应成 "help + sb + do" 而不是 "help me to do"。', 'relative_translation', true, 3, 9011
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


-- ╔════════════════════════════════════════════════════════════════════╗
-- ║ FILE: 20260521160000_g8_26_object_clauses_gold_standard.sql
-- ╚════════════════════════════════════════════════════════════════════╝
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


-- ╔════════════════════════════════════════════════════════════════════╗
-- ║ FILE: 20260521170000_g8_17_if_conditional_gold_standard.sql
-- ╚════════════════════════════════════════════════════════════════════╝
-- =====================================================================
-- Gold-standard content for G8 · if 引导的条件状语从句 · If-Conditional (Real)
-- Code: g8.17   Category: clause
-- =====================================================================
-- 中考必考 "主将从现" 经典考点。Covers: real conditional (Type 1),
-- unless = if not, agreement, fixed errors on Chinese-student tests.
-- =====================================================================

UPDATE junior_grammar_points
SET
  summary = '"如果……就……" 的真实条件句 — "主将从现"是中考单选必考的固定考点。',
  hook_line_cn = '"主将从现" 4 个字，背熟它中考这道题稳拿。学会用 unless，作文还能加分。',
  hook_line = 'If + present, will + verb — the single most-tested conditional pattern in Chinese middle-school English.',
  mnemonic = '主句将来时，if 从句一般现在时 — 简称"主将从现"，铁律。',
  content_depth = 3,

  explanation_md = E'## 🎯 一句话搞定\n\n**"如果……（条件）就……（结果）"**  \n→ if 引导的条件状语从句：**条件用一般现在时，结果用将来时**。\n\n---\n\n## 📐 核心公式（铁律：主将从现）\n\n| 部分 | 时态 | 例子 |\n|---|---|---|\n| **从句**（if 引导，表条件） | **一般现在时** | **If it rains tomorrow**, |\n| **主句**（表结果） | **将来时（will / be going to）** | **we will stay at home**. |\n\n**完整句式：**\n- **If + 主语 + 动词（一般现在时）, 主语 + will + 动词原形 .**\n- 主从顺序可以颠倒，颠倒时**逗号去掉**：\n  - **If it rains tomorrow, we will stay at home.**\n  - **We will stay at home if it rains tomorrow.**\n\n> ⚠️ **铁律**：if 从句**绝对不能**用 will！中考改错最高频陷阱。\n\n---\n\n## 🔥 三大用法\n\n### ① 普通条件（用 if）\n- **If you work hard**, you **will succeed**.\n- **If she comes** early, we **will start** the meeting.\n\n### ② 否定条件（用 unless = if not）\n- **Unless you hurry**, you **will miss** the bus.  \n  ↑ 等于 **If you don''t hurry**, you will miss the bus.\n- **I won''t go unless you come with me.**\n\n### ③ 表事实/习惯（主从都用一般现在时）\n- **If you mix red and blue**, you **get** purple.（自然规律）\n- **If I am tired**, I **drink** a cup of coffee.（习惯）\n\n---\n\n## ⏰ 看到这些 = if 条件句\n\n- **if** 引导从句\n- **unless** 引导从句（= if not）\n- **as long as**（只要）/ **provided that**（如果）— 高级表达\n- 主句出现 **will / won''t / be going to**\n- 主从两句之间用**逗号**（从句在前时）\n\n---\n\n## ⚠️ Top 5 易错点（中考批卷红笔常出现）\n\n1. **if 从句用了 will**（最高频错误）：~~If it will rain tomorrow, we will stay home.~~ → **If it rains tomorrow, we will stay home.**\n2. **unless 后又加 not**：~~Unless you don''t come, ...~~ → **Unless you come, ...**（unless 本身已含否定）\n3. **第三人称单数 -s 漏了**：~~If she come early, ...~~ → **If she comes early, ...**\n4. **主句忘了 will**：~~If you work hard, you succeed.~~ → **If you work hard, you will succeed.**（表将来必须有 will）\n5. **从句顺序颠倒时多了逗号**：~~We will stay home, if it rains.~~ → **We will stay home if it rains.**（主句在前不加逗号）\n\n---\n\n## 🧠 三秒判断口诀\n\n> **从句（if 后面）→ 一般现在时**  \n> **主句（结果）→ will + 动词原形**  \n> **unless = if not**（unless 后面别再加 not）',

  immersion_cards = $jsonb$[
    {"situation": "Looking at dark clouds on the way to a picnic", "cn": "如果明天下雨，我们就改去博物馆。", "en": "If it rains tomorrow, we will go to the museum instead."},
    {"situation": "Mom warns you about being late", "cn": "你再不快点，就赶不上公交车了。", "en": "Unless you hurry, you will miss the bus."},
    {"situation": "Promising your friend a study session", "cn": "如果你周六有空，我们一起复习。", "en": "If you are free on Saturday, we will study together."},
    {"situation": "Explaining a deal to your sibling", "cn": "我洗碗，你帮我做作业。", "en": "If you help me with my homework, I will do the dishes."},
    {"situation": "Telling a classmate why you won''t join", "cn": "除非 Lin 也来，否则我不去。", "en": "I won''t go unless Lin comes too."},
    {"situation": "Reassuring your tired mom", "cn": "你早点睡，我来收拾。", "en": "If you go to bed early, I will clean up."}
  ]$jsonb$::jsonb,

  contrast_table = $jsonb$[
    {"lhs": "If it will rain tomorrow, we will stay home.",  "rhs": "If it rains tomorrow, we will stay home."},
    {"lhs": "Unless you don''t hurry, you will be late.",     "rhs": "Unless you hurry, you will be late."},
    {"lhs": "If she come early, we will start.",              "rhs": "If she comes early, we will start."},
    {"lhs": "If you work hard, you succeed.",                  "rhs": "If you work hard, you will succeed."},
    {"lhs": "We will stay home, if it rains.",                 "rhs": "We will stay home if it rains."},
    {"lhs": "If it will be sunny, we will go hiking.",         "rhs": "If it is sunny, we will go hiking."}
  ]$jsonb$::jsonb,

  reflex_cards = $jsonb$[
    {"cn": "如果你迟到，老师会生气。",       "en": "If you are late, the teacher will be angry.",      "keyword": "If you are"},
    {"cn": "明天不下雨我们就去野餐。",       "en": "If it doesn''t rain tomorrow, we will have a picnic.","keyword": "doesn''t rain"},
    {"cn": "你再不开始，就来不及了。",       "en": "Unless you start now, you will be too late.",       "keyword": "Unless you start"},
    {"cn": "如果他明天来，我们就开始。",     "en": "If he comes tomorrow, we will begin.",              "keyword": "he comes"},
    {"cn": "只要你努力，就能进步。",         "en": "As long as you try hard, you will improve.",        "keyword": "As long as"},
    {"cn": "我先去你那儿，再吃饭。",         "en": "If I have time, I will come to your place first.",  "keyword": "If I have time"},
    {"cn": "他们不来我们就不开始。",         "en": "We won''t start unless they come.",                 "keyword": "unless they come"},
    {"cn": "如果你帮我，我请你吃冰激凌。",   "en": "If you help me, I will buy you ice cream.",         "keyword": "If you help me"}
  ]$jsonb$::jsonb,

  situation_drills = $jsonb$[
    {
      "situation": "Your friend wants to plan a Saturday hike.",
      "cn": "周六天气好的话，我们就去爬山。",
      "en": "If the weather is good on Saturday, we will go hiking.",
      "accepted": [
        "If it''s sunny on Saturday, we''ll go hiking.",
        "We''ll go hiking if the weather is nice on Saturday."
      ]
    },
    {
      "situation": "Mom warns you about exam preparation.",
      "cn": "你再不开始复习，下周考试就考不好。",
      "en": "Unless you start reviewing now, you won''t do well in next week''s exam.",
      "accepted": [
        "If you don''t start reviewing now, you won''t do well next week.",
        "You''ll fail the exam next week unless you start reviewing now."
      ]
    },
    {
      "situation": "Negotiating chore distribution with your sibling.",
      "cn": "你帮我洗碗，我就帮你做数学题。",
      "en": "If you help me with the dishes, I will help you with your math.",
      "accepted": [
        "I''ll help you with math if you wash the dishes.",
        "If you do the dishes, I''ll help you with math."
      ]
    },
    {
      "situation": "Explaining why you can''t go to a friend''s party.",
      "cn": "除非妈妈同意，否则我去不了。",
      "en": "I can''t come unless my mom says yes.",
      "accepted": [
        "Unless my mom agrees, I won''t be able to come.",
        "If my mom doesn''t agree, I can''t come."
      ]
    }
  ]$jsonb$::jsonb,

  correction_tasks = $jsonb$[
    {
      "wrong": "If it will rain tomorrow, we will stay at home.",
      "model": "If it rains tomorrow, we will stay at home.",
      "hint":  "if 从句不能用 will",
      "why":   "**主将从现铁律**：if 从句**永远用一般现在时**，主句才用 will。这是中考改错最高频考点。"
    },
    {
      "wrong": "Unless you don''t hurry, you will be late.",
      "model": "Unless you hurry, you will be late.",
      "hint":  "unless 已经含否定",
      "why":   "**unless = if ... not**，本身已经是否定。后面不能再加 don''t，否则双重否定意思变反。"
    },
    {
      "wrong": "If she come early, we will start the meeting.",
      "model": "If she comes early, we will start the meeting.",
      "hint":  "第三人称单数加 -s",
      "why":   "if 从句用一般现在时，主语 she 是**第三人称单数**，动词要加 **-s** → comes。"
    },
    {
      "wrong": "If you study hard, you pass the exam.",
      "model": "If you study hard, you will pass the exam.",
      "hint":  "主句表将来要 will",
      "why":   "主句表示**将来的结果**，必须用 **will + 动词原形**。少了 will，意思就变成现在时的事实陈述了。"
    },
    {
      "wrong": "We will go hiking, if the weather is fine.",
      "model": "We will go hiking if the weather is fine.",
      "hint":  "主句在前不加逗号",
      "why":   "if 从句在主句**后面**时，中间**不加逗号**。只有 if 从句在前时才需要用逗号分隔。"
    },
    {
      "wrong": "If it will be sunny tomorrow, we will go to the park.",
      "model": "If it is sunny tomorrow, we will go to the park.",
      "hint":  "if 从句不能用 will",
      "why":   "同上 — if 从句中的 be 也是一般现在时（is），不能用 will be。"
    }
  ]$jsonb$::jsonb,

  boss_questions = $jsonb$[
    {
      "stem": "If it ___ tomorrow, we ___ a picnic in the park.",
      "option_a": "won''t rain / will have",
      "option_b": "doesn''t rain / will have",
      "option_c": "doesn''t rain / have",
      "option_d": "won''t rain / have",
      "correct_answer": "B",
      "trap": "选 A/D 在 if 从句里用了 won''t — 违反主将从现。选 C 主句漏 will。",
      "why":  "if 从句**一般现在时**（否定 doesn''t rain）+ 主句 **will + 动词原形**（will have）。"
    },
    {
      "stem": "Unless you ___ now, you ___ the deadline.",
      "option_a": "don''t start / will miss",
      "option_b": "start / will miss",
      "option_c": "start / miss",
      "option_d": "won''t start / will miss",
      "correct_answer": "B",
      "trap": "选 A 在 unless 后又加 don''t — 双重否定意思变反。选 C 主句漏 will。选 D 从句用 won''t 也错。",
      "why":  "**unless 已含否定**（= if not），后面用肯定形式 (start) + 主句 will。"
    },
    {
      "stem": "Lin will pass the exam if she ___ harder this term.",
      "option_a": "will study",
      "option_b": "studies",
      "option_c": "studied",
      "option_d": "is studying",
      "correct_answer": "B",
      "trap": "选 A 经典陷阱 — if 从句永远不用 will。选 C/D 时态错。",
      "why":  "主将从现：if 从句一般现在时 + 主语 she 第三人称单数 → **studies**。"
    },
    {
      "stem": "— What will you do if it ___ tomorrow?\n— I ___ at home and read a book.",
      "option_a": "rains / will stay",
      "option_b": "will rain / stay",
      "option_c": "rains / stay",
      "option_d": "will rain / will stay",
      "correct_answer": "A",
      "trap": "选 B/D 在 if 后用了 will rain。选 C 回答漏 will。",
      "why":  "完美的主将从现：if 从句 **rains**（现在时）+ 回答里用 **will stay**（将来时）。"
    }
  ]$jsonb$::jsonb

WHERE code = 'g8.17';


UPDATE junior_grammar_points SET teacher_script = $jsonb$[
  {
    "text": "今天解锁中考必考的**条件状语从句**。一个口诀：**主将从现**，4 个字保你拿满分。",
    "show": "🎯 Today: If + present, will + verb",
    "duration": 9
  },
  {
    "text": "**主将从现** = 主句用**将来时**（will），if 从句用**一般现在时**。看左边和右边的对照。",
    "show": "If + present  ,  will + verb",
    "highlight": "If + present",
    "duration": 10
  },
  {
    "text": "举例：**If it rains tomorrow, we will stay at home.** 即使 tomorrow 是将来，if 从句也用 rains。",
    "show": "If it rains tomorrow, we will stay home.",
    "highlight": "rains",
    "duration": 11
  },
  {
    "text": "**最大坑**：if 从句**永远不能用 will**。这是中考改错的高频送分题。",
    "show": "✗ If it will rain tomorrow ...   ✓ If it rains tomorrow ...",
    "highlight": "rains",
    "duration": 11
  },
  {
    "text": "**unless = if not**。Unless you hurry = If you don''t hurry。用 unless 时**别再加 not**。",
    "show": "Unless you hurry, you will be late.",
    "highlight": "Unless",
    "duration": 11
  },
  {
    "text": "**第三人称单数别忘 -s**：If **she comes** early, we will start. comes 后面有个 s。",
    "show": "If she comes early, ...",
    "highlight": "comes",
    "duration": 10
  },
  {
    "text": "**顺序可以颠倒**：从句在前用逗号；从句在后不加逗号。",
    "show": "If it rains, we''ll stay home.   We''ll stay home if it rains.",
    "highlight": "if it rains",
    "duration": 11
  },
  {
    "text": "口诀就这一个：**主将从现 + unless 不再加 not**。下一关进入真实场景练习。",
    "show": "Next → 6 Real-life Scenarios 📚",
    "duration": 7
  }
]$jsonb$::jsonb
WHERE code = 'g8.17';


DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.17')
  AND sort_order BETWEEN 9000 AND 9099;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.17')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  (
    'If it ___ tomorrow, we ___ the football match.',
    'mcq', 'will rain / cancel', 'rains / will cancel', 'rains / cancel', 'will rain / will cancel', 'B',
    NULL::text[],
    '主将从现：if 从句一般现在时 (rains) + 主句 will + 原形 (will cancel)。',
    '{}'::jsonb, NULL, 'conditional_basic', false, 1, 9000
  ),
  (
    'You ___ the bus unless you ___ now.',
    'mcq', 'will miss / hurry', 'miss / hurry', 'will miss / will hurry', 'miss / will hurry', 'A',
    NULL::text[],
    'unless 等于 if not，从句用一般现在时 (hurry)，主句用 will (will miss)。',
    '{}'::jsonb, NULL, 'conditional_unless', false, 2, 9001
  ),
  (
    'If she ___ early, we ___ together to the airport.',
    'mcq', 'come / go', 'comes / will go', 'will come / go', 'will come / will go', 'B',
    NULL::text[],
    'if 从句一般现在时 + 第三人称单数加 -s (comes) + 主句 will go。',
    '{}'::jsonb, NULL, 'conditional_third_person', false, 2, 9002
  ),
  (
    '— What will you do this weekend?\n— I ___ at home if it ___.',
    'mcq', 'will stay / will rain', 'stay / rains', 'will stay / rains', 'will stay / will rain', 'C',
    NULL::text[],
    '主句答 will stay（将来）+ if 从句 rains（一般现在时）。',
    '{}'::jsonb, NULL, 'conditional_dialogue', false, 2, 9003
  ),

  (
    'If you ____ (study) hard, you will pass the exam.',
    'fill', NULL, NULL, NULL, NULL, 'study',
    ARRAY['study']::text[],
    'if 从句一般现在时；主语 you → 动词原形 **study**。',
    '{}'::jsonb, NULL, 'conditional_basic', false, 1, 9004
  ),
  (
    'Unless Tom ____ (come) tomorrow, the meeting will be put off.',
    'fill', NULL, NULL, NULL, NULL, 'comes',
    ARRAY['comes']::text[],
    'unless 从句一般现在时 + 第三人称单数 Tom → **comes**。',
    '{}'::jsonb, NULL, 'conditional_unless', false, 2, 9005
  ),
  (
    'I ____ (call) you as soon as I get home tonight.',
    'fill', NULL, NULL, NULL, NULL, 'will call',
    ARRAY['will call', '''ll call']::text[],
    'as soon as 也遵循"主将从现"原则；主句用 **will call**。',
    '{}'::jsonb, '注意：as soon as 是时间状语从句，规则和 if 一样 — 主句将来，从句现在。', 'conditional_main', false, 2, 9006
  ),

  (
    '改写为 unless 句（保留意思）：  "If you don''t practice every day, you won''t improve."',
    'transform', NULL, NULL, NULL, NULL, 'Unless you practice every day, you won''t improve.',
    ARRAY[
      'Unless you practice every day, you won''t improve.',
      'Unless you practice every day, you will not improve.'
    ]::text[],
    'If ... not = Unless。改写时把 don''t 去掉，换成 Unless。',
    '{}'::jsonb, NULL, 'conditional_unless_transform', true, 2, 9007
  ),
  (
    '合并成条件句：  "It may rain tomorrow. We will stay at home in that case."',
    'transform', NULL, NULL, NULL, NULL, 'If it rains tomorrow, we will stay at home.',
    ARRAY[
      'If it rains tomorrow, we will stay at home.',
      'We will stay at home if it rains tomorrow.'
    ]::text[],
    'in that case 提示"在那种情况下" → 用 if 条件句合并；从句一般现在时。',
    '{}'::jsonb, NULL, 'conditional_combine', true, 3, 9008
  ),

  (
    '改错：  "If it will be sunny tomorrow, we will go hiking."',
    'correction', NULL, NULL, NULL, NULL, 'If it is sunny tomorrow, we will go hiking.',
    ARRAY[
      'If it is sunny tomorrow, we will go hiking.'
    ]::text[],
    'if 从句不能用 will be，应该用一般现在时 **is**。',
    '{}'::jsonb, NULL, 'conditional_no_will_in_if', true, 2, 9009
  ),
  (
    '改错：  "Unless you don''t finish your homework, you can''t watch TV."',
    'correction', NULL, NULL, NULL, NULL, 'Unless you finish your homework, you can''t watch TV.',
    ARRAY[
      'Unless you finish your homework, you can''t watch TV.'
    ]::text[],
    'unless 已含否定，后面用肯定形式 finish，不能加 don''t。',
    '{}'::jsonb, NULL, 'conditional_unless_double_negative', true, 2, 9010
  ),

  (
    '把这句话译成英文：如果明天天气好，我们就一起去打篮球。',
    'translation', NULL, NULL, NULL, NULL, 'If the weather is fine tomorrow, we will play basketball together.',
    ARRAY[
      'If the weather is fine tomorrow, we will play basketball together.',
      'If it''s nice tomorrow, we will play basketball together.',
      'We will play basketball together if the weather is good tomorrow.',
      'If the weather is good tomorrow, we''ll play basketball together.'
    ]::text[],
    '考点：① 主将从现 — if 从句 the weather is (现在时) + 主句 will play；② "天气好" 可以是 weather is fine/good/nice。',
    '{}'::jsonb, '更地道：If it''s nice / If the weather is good 都自然，避免逐字翻译 "weather is good"。', 'conditional_translation', true, 3, 9011
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
  SELECT id, content_depth INTO v_point_id, v_depth FROM junior_grammar_points WHERE code = 'g8.17';
  IF v_point_id IS NULL THEN
    RAISE EXCEPTION 'Gold-standard migration failed: junior_grammar_points row with code=''g8.17'' does not exist.';
  END IF;
  IF v_depth <> 3 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: content_depth for g8.17 is %, expected 3.', v_depth;
  END IF;
  SELECT count(*) INTO v_q_count
  FROM junior_grammar_questions
  WHERE point_id = v_point_id AND sort_order BETWEEN 9000 AND 9099;
  IF v_q_count <> 12 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: expected 12 questions in 9000-9099 for g8.17, got %.', v_q_count;
  END IF;
  RAISE NOTICE 'Gold-standard migration for g8.17 verified: content_depth=3, % questions seeded.', v_q_count;
END $$;


-- ╔════════════════════════════════════════════════════════════════════╗
-- ║ FILE: 20260521180000_g8_04_comparatives_gold_standard.sql
-- ╚════════════════════════════════════════════════════════════════════╝
-- =====================================================================
-- Gold-standard content for G8 · 形容词比较级（强化） · Comparatives
-- Code: g8.04   Category: other
-- =====================================================================
-- A2 foundation but heavily tested in 中考 单选 / 阅读 / 写作.
-- Covers: -er / more rules, irregular forms, much/even/a little
-- modifiers, parallel-comparison errors.
-- =====================================================================

UPDATE junior_grammar_points
SET
  summary = '比较两个事物的"谁更怎么样" — 中考写作里描述对比、给建议时几乎必用。',
  hook_line_cn = '中考写作的"加分小工具"：会用比较级 + 修饰词，作文档次直接抬一截。',
  hook_line = 'Comparatives — the single fastest way to make a 中考 essay sound advanced.',
  mnemonic = '比较级 = -er / more；要更强 = much / even / a little / a lot 修饰；不要 very。',
  content_depth = 3,

  explanation_md = E'## 🎯 一句话搞定\n\n**比较两个人或物的差异** → 用 **形容词比较级 + than**。\n\n---\n\n## 📐 比较级怎么变？\n\n| 形容词类型 | 变化规则 | 例子 |\n|---|---|---|\n| 单音节 → 加 **-er** | tall → **taller** | Tom is **taller than** me. |\n| 单音节"短元音 + 单辅音" → 双写末辅音 + er | big → **bigger**, hot → **hotter** | This box is **bigger than** that one. |\n| 以 e 结尾 → 加 **-r** | large → **larger** | Beijing is **larger than** Suzhou. |\n| 辅音 + y 结尾 → y 变 i 加 er | easy → **easier**, busy → **busier** | Math is **easier than** physics. |\n| 多音节 / 长形容词 → **more + 原级** | difficult → **more difficult** | English is **more difficult than** Chinese. |\n| 不规则 → 记住 5 组 | good/well → **better** · bad → **worse** · many/much → **more** · little → **less** · far → **farther / further** | His pronunciation is **better than** mine. |\n\n> ⚠️ **铁律**：**比较级 + than**。少了 than 就不是比较级，少了比较级就不能加 than。\n\n---\n\n## 🔥 修饰比较级（写作加分项）\n\n| 修饰词 | 含义 | 例子 |\n|---|---|---|\n| **much** | 高得多 | Lin is **much taller** than her sister. |\n| **a lot** | 高得多 | Today is **a lot colder** than yesterday. |\n| **even** | 甚至更…… | This book is **even better** than the last one. |\n| **a little** | 稍微 | The new phone is **a little heavier**. |\n| **far** | 远比…… | He runs **far faster** than I do. |\n\n> ⚠️ **绝不能用 very 修饰比较级！** ~~very taller~~ → **much taller**\n\n---\n\n## ⏰ 看到这些 = 比较级\n\n- **than**（最直接信号）\n- **the +er/more ..., the +er/more ...** = "越……越……"（The harder you study, the better you do.）\n- **A is + 比较级 + than B**\n- **Which / Who is + 比较级, A or B?**\n\n---\n\n## ⚠️ Top 5 易错点（中考批卷红笔常出现）\n\n1. **双重比较级**：~~more taller~~ → **taller**（要么加 -er，要么用 more，**不能同时用**）\n2. **用 very 修饰比较级**：~~very taller~~ → **much taller**\n3. **比较对象不一致**（最难看出的错）：~~My hair is longer than her.~~ → **My hair is longer than hers.**（比的是"我的头发"和"她的头发"，所以是 hers 不是 her）\n4. **than 后人称错**：~~Tom is taller than I.~~ ✓ 书面 / **Tom is taller than me.** ✓ 口语（中考用 me 更稳）\n5. **不规则记错**：~~gooder~~ → **better**；~~baddest~~ → **worse**\n\n---\n\n## 🧠 三秒判断口诀\n\n> ① 看到 **than** → 前面填**比较级**  \n> ② 想加强语气 → 用 **much / a lot / even / far**，**不要用 very**  \n> ③ 比较"我的"和"她的"东西 → 用 **mine / hers** 不要用 me / her',

  immersion_cards = $jsonb$[
    {"situation": "Comparing brothers at a family gathering", "cn": "我哥比我高一头。", "en": "My older brother is much taller than me."},
    {"situation": "Reacting to today''s weather forecast", "cn": "今天比昨天冷多了。", "en": "Today is a lot colder than yesterday."},
    {"situation": "Recommending a textbook to a friend", "cn": "这本练习册比那本简单。", "en": "This workbook is easier than that one."},
    {"situation": "Talking about your hometown vs. Suzhou", "cn": "苏州比我老家大得多。", "en": "Suzhou is much bigger than my hometown."},
    {"situation": "Discussing two films after class", "cn": "新版的特效比老版的好得多。", "en": "The special effects in the new version are far better than in the old one."},
    {"situation": "Encouraging a discouraged classmate", "cn": "其实你做的比你想的好。", "en": "You actually did better than you think."}
  ]$jsonb$::jsonb,

  contrast_table = $jsonb$[
    {"lhs": "He is more taller than his brother.",          "rhs": "He is much taller than his brother."},
    {"lhs": "Today is very colder than yesterday.",          "rhs": "Today is much colder than yesterday."},
    {"lhs": "My hair is longer than her.",                   "rhs": "My hair is longer than hers."},
    {"lhs": "Math is gooder than physics.",                  "rhs": "Math is better than physics."},
    {"lhs": "This box is more big than that one.",           "rhs": "This box is bigger than that one."},
    {"lhs": "Lin runs faster than me does.",                 "rhs": "Lin runs faster than I do. / Lin runs faster than me."}
  ]$jsonb$::jsonb,

  reflex_cards = $jsonb$[
    {"cn": "苹果比香蕉便宜。",                "en": "Apples are cheaper than bananas.",                "keyword": "cheaper than"},
    {"cn": "我比哥哥更喜欢运动。",            "en": "I like sports more than my brother does.",        "keyword": "more than"},
    {"cn": "这本书比那本有趣得多。",          "en": "This book is much more interesting than that one.","keyword": "much more interesting"},
    {"cn": "今天比昨天暖和一点。",            "en": "Today is a little warmer than yesterday.",        "keyword": "a little warmer"},
    {"cn": "他的字写得比我好。",              "en": "His handwriting is better than mine.",            "keyword": "better than mine"},
    {"cn": "新桥比旧桥长两倍。",              "en": "The new bridge is twice as long as the old one.", "keyword": "twice as long as"},
    {"cn": "Lin 跳得比 Wang 远。",            "en": "Lin jumps farther than Wang.",                    "keyword": "farther than"},
    {"cn": "他英语比数学好。",                "en": "He is better at English than at math.",           "keyword": "better at"}
  ]$jsonb$::jsonb,

  situation_drills = $jsonb$[
    {
      "situation": "Your friend asks which exam was harder this term.",
      "cn": "数学比英语难得多。",
      "en": "Math was much harder than English.",
      "accepted": [
        "The math exam was much harder than the English one.",
        "Math was a lot harder than English this term."
      ]
    },
    {
      "situation": "Comparing your new phone with the old one.",
      "cn": "新手机比旧的贵一点，但是相机好很多。",
      "en": "The new phone is a little more expensive than the old one, but the camera is much better.",
      "accepted": [
        "The new phone costs a little more, but it has a much better camera.",
        "The new one is slightly more expensive but the camera is far better."
      ]
    },
    {
      "situation": "Recommending Suzhou to a tourist who has only seen Shanghai.",
      "cn": "苏州比上海安静一点，更适合慢慢逛。",
      "en": "Suzhou is a little quieter than Shanghai, and better for slow exploring.",
      "accepted": [
        "Suzhou is quieter than Shanghai and a lot nicer for relaxing walks.",
        "Compared with Shanghai, Suzhou is quieter and better for taking your time."
      ]
    },
    {
      "situation": "Cheering up your friend after a tough match.",
      "cn": "其实你今天发挥得比上次好多了。",
      "en": "Actually, you played much better today than last time.",
      "accepted": [
        "You did far better today than you did last time.",
        "Honestly, your performance was a lot better today than before."
      ]
    }
  ]$jsonb$::jsonb,

  correction_tasks = $jsonb$[
    {
      "wrong": "He is more taller than his brother.",
      "model": "He is much taller than his brother.",
      "hint":  "比较级不能 -er 和 more 同时用",
      "why":   "**双重比较级**是中考最爱抓的错。tall 是单音节 → 直接 **taller**。要加强语气用 **much** 修饰。"
    },
    {
      "wrong": "Today is very colder than yesterday.",
      "model": "Today is much colder than yesterday.",
      "hint":  "very 不能修饰比较级",
      "why":   "**very 只修饰原级**（very cold）。修饰比较级要用 **much / a lot / even / far / a little**。"
    },
    {
      "wrong": "My hair is longer than her.",
      "model": "My hair is longer than hers.",
      "hint":  "比的是\"她的头发\"",
      "why":   "比较对象要**一致**：比的是\"我的头发\"和\"她的头发\"。her = 她（人），**hers = 她的（头发）**。"
    },
    {
      "wrong": "Math is gooder than physics.",
      "model": "Math is better than physics.",
      "hint":  "good 是不规则",
      "why":   "**good → better → best**，不规则变化必须记。同类：bad → worse、many/much → more、little → less。"
    },
    {
      "wrong": "This box is more big than that one.",
      "model": "This box is bigger than that one.",
      "hint":  "big 是单音节",
      "why":   "big 是**单音节**形容词，直接 **双写末辅音 + er** → **bigger**，不用 more。"
    },
    {
      "wrong": "Lin runs faster than me does.",
      "model": "Lin runs faster than I do. / Lin runs faster than me.",
      "hint":  "than 后接整句要主格",
      "why":   "than 后接**完整的省略句**（than I do）时用主格 I；接**简单宾格**（than me）也对，但不能 me does。"
    }
  ]$jsonb$::jsonb,

  boss_questions = $jsonb$[
    {
      "stem": "The new gym is ___ the old one.",
      "option_a": "more bigger than",
      "option_b": "very bigger than",
      "option_c": "much bigger than",
      "option_d": "a very big than",
      "correct_answer": "C",
      "trap": "选 A 双重比较级；选 B 用 very 修饰比较级；选 D 完全不对。",
      "why":  "big → **bigger**；修饰比较级用 **much / a lot / even / far**，不能用 very。"
    },
    {
      "stem": "Tom is good at sports, but his sister is ___.",
      "option_a": "gooder",
      "option_b": "best",
      "option_c": "more good",
      "option_d": "better",
      "correct_answer": "D",
      "trap": "选 A 不规则错记；选 B 是最高级，但只比较两个人用比较级；选 C 不存在。",
      "why":  "**good → better → best**。两人比较 → 比较级 **better**。"
    },
    {
      "stem": "My handwriting is much ___ than ___.",
      "option_a": "nicer / her",
      "option_b": "nicer / hers",
      "option_c": "more nicer / hers",
      "option_d": "nice / hers",
      "correct_answer": "B",
      "trap": "选 A 比较对象错（应该是\"她的字\"hers）；选 C 双重比较级；选 D 漏比较级。",
      "why":  "nice → **nicer**；比的是\"我的字\"和\"她的字\" → 用 **hers**（= her handwriting）。"
    },
    {
      "stem": "— Which subject is ___, math or English?\n— English. It''s ___ for me.",
      "option_a": "easier / much easier",
      "option_b": "the easier / much easier",
      "option_c": "easier / a little easier",
      "option_d": "the easiest / much easier",
      "correct_answer": "A",
      "trap": "选 B/D 多余的 the 或最高级（只两个科目用比较级）。选 C 在第二空\"几乎不可能更简单\"语境里太弱。",
      "why":  "两科目对比 → 比较级 **easier**；答案补充说明 → 用 much 加强 → **much easier**。"
    }
  ]$jsonb$::jsonb

WHERE code = 'g8.04';


UPDATE junior_grammar_points SET teacher_script = $jsonb$[
  {
    "text": "今天解锁**比较级**。中考写作里最容易加分的小工具 — 会用比较级 + 修饰词，作文档次立刻抬一截。",
    "show": "🎯 Today: Comparatives = -er / more + than",
    "duration": 9
  },
  {
    "text": "公式：**比较级 + than**。tall → **taller** than，比较级和 than 必须一起出现。",
    "show": "adj + er  /  more + adj   +   than",
    "highlight": "than",
    "duration": 10
  },
  {
    "text": "**单音节直接加 -er**：tall → taller, fast → faster, small → smaller。",
    "show": "tall → taller   fast → faster",
    "highlight": "-er",
    "duration": 9
  },
  {
    "text": "**单音节双写末辅音**：big → **bigger**, hot → hotter, thin → thinner。",
    "show": "big → bigger   hot → hotter",
    "highlight": "bigger",
    "duration": 9
  },
  {
    "text": "**y 变 i 加 er**：easy → **easier**, busy → busier, happy → happier。",
    "show": "easy → easier   happy → happier",
    "highlight": "easier",
    "duration": 9
  },
  {
    "text": "**多音节用 more**：difficult → **more difficult**, interesting → more interesting。",
    "show": "difficult → more difficult",
    "highlight": "more difficult",
    "duration": 10
  },
  {
    "text": "**5 个不规则必背**：good → **better**, bad → worse, many/much → more, little → less, far → farther/further。",
    "show": "good → better   bad → worse   many → more",
    "highlight": "better",
    "duration": 12
  },
  {
    "text": "**最重要**：修饰比较级用 **much / a lot / even / far / a little**，**绝对不能用 very**！",
    "show": "✗ very taller   ✓ much taller",
    "highlight": "much taller",
    "duration": 11
  }
]$jsonb$::jsonb
WHERE code = 'g8.04';


DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.04')
  AND sort_order BETWEEN 9000 AND 9099;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.04')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  (
    'My backpack is ___ than yours.',
    'mcq', 'more heavy', 'heavier', 'more heavier', 'heavyer', 'B',
    NULL::text[],
    'heavy（y 结尾）→ **heavier**。选 A/C/D 都是常见错误。',
    '{}'::jsonb, NULL, 'comparative_y_to_i', false, 1, 9000
  ),
  (
    'This new game is ___ exciting than the old one.',
    'mcq', 'more', 'much', 'very', 'so', 'A',
    NULL::text[],
    'exciting 是多音节形容词 → 用 **more exciting**。',
    '{}'::jsonb, NULL, 'comparative_more', false, 1, 9001
  ),
  (
    'The hot soup is ___ than I expected.',
    'mcq', 'a lot hotter', 'a lot more hot', 'very hotter', 'more hot', 'A',
    NULL::text[],
    'hot 单音节双写末辅音 → hotter；修饰用 **a lot**。',
    '{}'::jsonb, NULL, 'comparative_modifier', false, 2, 9002
  ),
  (
    'Lin''s pronunciation is ___ than ___.',
    'mcq', 'better / me', 'gooder / mine', 'better / mine', 'more good / mine', 'C',
    NULL::text[],
    '①good 不规则 → **better**；② 比的是"她的发音"和"我的发音" → **mine**。',
    '{}'::jsonb, NULL, 'comparative_irregular_object', false, 3, 9003
  ),

  (
    'Today is much ____ (cold) than yesterday. Wear a coat.',
    'fill', NULL, NULL, NULL, NULL, 'colder',
    ARRAY['colder']::text[],
    'cold 单音节 + er = **colder**；much 修饰比较级。',
    '{}'::jsonb, NULL, 'comparative_basic', false, 1, 9004
  ),
  (
    'This math problem is ____ (difficult) than the last one.',
    'fill', NULL, NULL, NULL, NULL, 'more difficult',
    ARRAY['more difficult']::text[],
    'difficult 多音节 → **more difficult**。',
    '{}'::jsonb, NULL, 'comparative_more', false, 2, 9005
  ),
  (
    'Her grade in English is ____ (good) than mine.',
    'fill', NULL, NULL, NULL, NULL, 'better',
    ARRAY['better']::text[],
    'good 不规则 → **better**。',
    '{}'::jsonb, NULL, 'comparative_irregular', false, 1, 9006
  ),

  (
    '改写为比较级：  "Beijing is big. Suzhou is not as big as Beijing."',
    'transform', NULL, NULL, NULL, NULL, 'Beijing is bigger than Suzhou.',
    ARRAY[
      'Beijing is bigger than Suzhou.',
      'Beijing is much bigger than Suzhou.'
    ]::text[],
    'A is not as big as B → B is bigger than A（注意比较关系翻转）。',
    '{}'::jsonb, NULL, 'comparative_transform', true, 2, 9007
  ),
  (
    '用 much 修饰比较级，合并：  "Today is cold. Yesterday was not so cold."',
    'transform', NULL, NULL, NULL, NULL, 'Today is much colder than yesterday.',
    ARRAY[
      'Today is much colder than yesterday.',
      'Today is a lot colder than yesterday.'
    ]::text[],
    'much / a lot 都是修饰比较级的常用副词。',
    '{}'::jsonb, NULL, 'comparative_modifier', true, 2, 9008
  ),

  (
    '改错：  "He is more taller than his brother."',
    'correction', NULL, NULL, NULL, NULL, 'He is much taller than his brother.',
    ARRAY[
      'He is much taller than his brother.'
    ]::text[],
    '双重比较级（more + -er）是中考最高频改错点。要加强用 **much / a lot / even**。',
    '{}'::jsonb, NULL, 'comparative_double', true, 2, 9009
  ),
  (
    '改错：  "My hair is longer than her."',
    'correction', NULL, NULL, NULL, NULL, 'My hair is longer than hers.',
    ARRAY[
      'My hair is longer than hers.'
    ]::text[],
    '比较对象要**对等**：比的是"我的头发"和"她的头发" → **hers**（her hair 的缩写）。',
    '{}'::jsonb, NULL, 'comparative_pronoun_match', true, 3, 9010
  ),

  (
    '把这句话译成英文：今年夏天比去年热得多。',
    'translation', NULL, NULL, NULL, NULL, 'This summer is much hotter than last summer.',
    ARRAY[
      'This summer is much hotter than last summer.',
      'It is much hotter this summer than last summer.',
      'This summer is a lot hotter than last summer.',
      'This summer is far hotter than last summer.'
    ]::text[],
    '考点：① hot 单音节双写 → hotter；② "得多"用 much / a lot / far 修饰比较级；③ 比较对象 last summer。',
    '{}'::jsonb, '更地道：It is much hotter this summer than last summer 是英语母语者更常用的句式（it 形式主语开头）。', 'comparative_translation', true, 3, 9011
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
  SELECT id, content_depth INTO v_point_id, v_depth FROM junior_grammar_points WHERE code = 'g8.04';
  IF v_point_id IS NULL THEN
    RAISE EXCEPTION 'Gold-standard migration failed: junior_grammar_points row with code=''g8.04'' does not exist.';
  END IF;
  IF v_depth <> 3 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: content_depth for g8.04 is %, expected 3.', v_depth;
  END IF;
  SELECT count(*) INTO v_q_count
  FROM junior_grammar_questions
  WHERE point_id = v_point_id AND sort_order BETWEEN 9000 AND 9099;
  IF v_q_count <> 12 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: expected 12 questions in 9000-9099 for g8.04, got %.', v_q_count;
  END IF;
  RAISE NOTICE 'Gold-standard migration for g8.04 verified: content_depth=3, % questions seeded.', v_q_count;
END $$;


-- ╔════════════════════════════════════════════════════════════════════╗
-- ║ FILE: 20260522120000_g8_03_future_simple_gold_standard.sql
-- ╚════════════════════════════════════════════════════════════════════╝
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


-- ╔════════════════════════════════════════════════════════════════════╗
-- ║ FILE: 20260522130000_g8_22_past_continuous_gold_standard.sql
-- ╚════════════════════════════════════════════════════════════════════╝
-- =====================================================================
-- Gold-standard content for G8 · 过去进行时 · Past Continuous
-- Code: g8.22   Category: tense
-- =====================================================================
-- was/were + V-ing — covers the when/while integration trap and
-- subject-verb agreement (was vs were).
-- =====================================================================

UPDATE junior_grammar_points
SET
  summary = '"昨晚八点我正在看电视" — 描述过去某一刻正在进行的动作，中考阅读 + 听力高频结构。',
  hook_line_cn = '中考阅读"突然 / 当时正在……"的句子，全靠这个时态。学会它，听力填空也能稳。',
  hook_line = 'Past continuous — the "what was happening when ..." tense that 中考 reading loves.',
  mnemonic = '过去进行 = was / were + V-ing；I/he/she/it → was，you/we/they → were。',
  content_depth = 3,

  explanation_md = E'## 🎯 一句话搞定\n\n**过去某一刻正在进行的动作** → 用 **was / were + V-ing**。\n\n---\n\n## 📐 核心公式\n\n| 句型 | 公式 | 例子 |\n|---|---|---|\n| 肯定句 | 主语 + **was / were** + V-ing | I **was watching** TV at 8 last night. |\n| 否定句 | 主语 + **wasn''t / weren''t** + V-ing | He **wasn''t doing** his homework then. |\n| 一般疑问 | **Was / Were** + 主语 + V-ing ? | **Were you sleeping** at 11 last night? |\n| 特殊疑问 | 疑问词 + **was / were** + 主语 + V-ing ? | What **were you doing** when I called? |\n\n> ⚠️ **铁律**：I / he / she / it / 单数名词 → **was**；you / we / they / 复数名词 → **were**。\n\n---\n\n## 🔥 三大经典用法（中考必考）\n\n### ① 表过去某时刻正在进行\n- I **was reading** at 9 last night.（明确时间点）\n- This time yesterday, he **was playing** basketball.\n\n### ② while 引导的"两动作同时进行"\n- **While** I **was reading**, Tom **was watching** TV.（两件事都长时间）\n\n### ③ when 引导的"被打断的动作"\n- I **was reading** **when** the phone **rang**.  \n  ↑ 长动作 (was reading) 被短动作 (rang) 打断 → 长用进行时，短用过去时。\n\n---\n\n## ⏰ 看到这些 = 过去进行时\n\n- **at this time yesterday** / at 9 last night\n- **when ...**（短动作打断长动作）\n- **while ...**（同时进行两动作）\n- **from ... to ...**（过去某段时间持续做某事）\n- **all morning / all afternoon / all day**（过去一整段时间）\n\n---\n\n## ⚠️ Top 5 易错点（中考批卷红笔常出现）\n\n1. **was / were 主谓不一致**：~~Tom were reading.~~ → **Tom was reading.**（he/she/it → was）\n2. **没用进行时，直接用过去式**：~~At 9 last night I read.~~ → **At 9 last night I was reading.**（明确时刻强调"正在"）\n3. **when 后用了进行时**：~~When the phone was ringing, I was reading.~~ → **When the phone rang, I was reading.**（when 通常接短突发动作 = 过去式）\n4. **V-ing 拼写错**：~~lieing~~ → **lying**；~~swiming~~ → **swimming**\n5. **状态动词强行用进行时**：~~I was knowing the answer.~~ → **I knew the answer.**（know/like/love/want 不用进行时）\n\n---\n\n## 🧠 三秒判断口诀\n\n> ① 时间是"过去**某一刻**"（at 9 / when / while）→ 过去进行时  \n> ② 主语单数 → **was**，主语复数或 you → **were**  \n> ③ 长动作（背景）→ 进行时；短突发（when 后面）→ 一般过去时',

  immersion_cards = $jsonb$[
    {"situation": "Mom calls you for dinner during gameplay", "cn": "你叫我的时候我正在玩游戏。", "en": "I was playing a game when you called me."},
    {"situation": "Catching up with a friend about last night", "cn": "我昨晚九点正在做作业。", "en": "I was doing my homework at nine last night."},
    {"situation": "Explaining what you saw during recess", "cn": "课间我看到老师正在批作业。", "en": "During the break, I saw the teacher correcting homework."},
    {"situation": "Telling a classmate about a brief power cut", "cn": "我在看书时灯突然灭了。", "en": "I was reading when the lights suddenly went out."},
    {"situation": "Describing yesterday afternoon", "cn": "昨天下午三点我们正在踢球。", "en": "At three yesterday afternoon, we were playing football."},
    {"situation": "Explaining why you missed a phone call", "cn": "对不起，你打来时我正在洗澡。", "en": "Sorry, I was taking a shower when you called."}
  ]$jsonb$::jsonb,

  contrast_table = $jsonb$[
    {"lhs": "Tom were reading at 8 last night.",            "rhs": "Tom was reading at 8 last night."},
    {"lhs": "At 9 last night I read a book.",                "rhs": "At 9 last night I was reading a book."},
    {"lhs": "When the phone was ringing, I was cooking.",    "rhs": "When the phone rang, I was cooking."},
    {"lhs": "While I was watching TV, Mom cooked dinner.",   "rhs": "While I was watching TV, Mom was cooking dinner."},
    {"lhs": "She were doing her homework.",                  "rhs": "She was doing her homework."},
    {"lhs": "I was knowing the answer at that time.",        "rhs": "I knew the answer at that time."}
  ]$jsonb$::jsonb,

  reflex_cards = $jsonb$[
    {"cn": "昨晚 9 点我正在洗澡。",            "en": "I was taking a shower at 9 last night.",          "keyword": "was taking"},
    {"cn": "他来的时候我们正在吃晚饭。",      "en": "We were having dinner when he came.",             "keyword": "were having"},
    {"cn": "你昨晚 10 点在干什么？",          "en": "What were you doing at 10 last night?",           "keyword": "were you doing"},
    {"cn": "Tom 进来时我正在睡觉。",          "en": "I was sleeping when Tom came in.",                "keyword": "was sleeping"},
    {"cn": "整个早上她一直在练琴。",          "en": "She was practicing the piano all morning.",       "keyword": "was practicing"},
    {"cn": "我妈做饭时我在看书。",            "en": "While my mom was cooking, I was reading.",        "keyword": "While ... was cooking"},
    {"cn": "我朋友们没在等我。",              "en": "My friends weren''t waiting for me.",             "keyword": "weren''t waiting"},
    {"cn": "他们当时正在听音乐。",            "en": "They were listening to music at that time.",      "keyword": "were listening"}
  ]$jsonb$::jsonb,

  situation_drills = $jsonb$[
    {
      "situation": "A friend asks why you didn''t answer their call last night.",
      "cn": "对不起，你打来时我正在洗澡。",
      "en": "Sorry, I was taking a shower when you called.",
      "accepted": [
        "I was in the shower when you called.",
        "Sorry, I was showering when the phone rang."
      ]
    },
    {
      "situation": "Your mom asks what you were doing during yesterday''s thunderstorm.",
      "cn": "雷声响起来的时候我正在写作业。",
      "en": "I was doing my homework when the thunder struck.",
      "accepted": [
        "I was doing homework when the thunder hit.",
        "When the thunder roared, I was working on my homework."
      ]
    },
    {
      "situation": "Telling a classmate about a small accident yesterday afternoon.",
      "cn": "Lin 骑车时不小心撞到了一棵树。",
      "en": "Lin was riding her bike when she accidentally hit a tree.",
      "accepted": [
        "Lin was cycling when she accidentally hit a tree.",
        "While Lin was riding, she crashed into a tree by accident."
      ]
    },
    {
      "situation": "Describing what your family was doing at 8 last night.",
      "cn": "我在做作业，弟弟在玩玩具，妈妈在做饭。",
      "en": "I was doing homework, my little brother was playing with his toys, and Mom was cooking.",
      "accepted": [
        "I was doing homework while my brother was playing with toys and Mom was cooking.",
        "At 8, I was studying, my brother was playing, and Mom was making dinner."
      ]
    }
  ]$jsonb$::jsonb,

  correction_tasks = $jsonb$[
    {
      "wrong": "Tom were reading a book at 8 last night.",
      "model": "Tom was reading a book at 8 last night.",
      "hint":  "Tom 是单数",
      "why":   "主语 **Tom = he**（单数）→ 用 **was**。were 只用于 you/we/they/复数名词。"
    },
    {
      "wrong": "At 9 last night I read a novel.",
      "model": "At 9 last night I was reading a novel.",
      "hint":  "强调\"正在\"",
      "why":   "时间是过去**某一刻**（at 9 last night）→ 强调\"那一刻正在做\" → 用 **was reading**。"
    },
    {
      "wrong": "When the phone was ringing, I was cooking.",
      "model": "When the phone rang, I was cooking.",
      "hint":  "短动作用过去式",
      "why":   "**when 通常接短突发动作** → 用一般过去时 **rang**。\"长动作\"被打断 → 进行时 was cooking。"
    },
    {
      "wrong": "While I was watching TV, Mom cooked dinner.",
      "model": "While I was watching TV, Mom was cooking dinner.",
      "hint":  "while 表两动作同时进行",
      "why":   "**while 引导的两个动作都长时间持续** → 两边都用过去进行时。"
    },
    {
      "wrong": "She were doing her homework when I arrived.",
      "model": "She was doing her homework when I arrived.",
      "hint":  "She 单数",
      "why":   "**She = 单数** → 用 was，不用 were。"
    },
    {
      "wrong": "I was knowing the answer when she asked me.",
      "model": "I knew the answer when she asked me.",
      "hint":  "know 不用进行时",
      "why":   "**状态动词**（know / like / love / want / believe / have-表所有）**不用进行时**。直接用 **knew**。"
    }
  ]$jsonb$::jsonb,

  boss_questions = $jsonb$[
    {
      "stem": "At 7:30 yesterday evening, we ___ supper at home.",
      "option_a": "have",
      "option_b": "had",
      "option_c": "were having",
      "option_d": "are having",
      "correct_answer": "C",
      "trap": "选 B 也是过去时，但**at 7:30 yesterday evening** 是过去某一刻 → 用进行时强调\"那一刻正在吃\"。",
      "why":  "时间 = 过去某一刻 → **过去进行时**。we 复数 → were + V-ing = **were having**。"
    },
    {
      "stem": "While Mom ___ a TV programme, I ___ in my room.",
      "option_a": "was watching / studied",
      "option_b": "watched / was studying",
      "option_c": "was watching / was studying",
      "option_d": "watched / studied",
      "correct_answer": "C",
      "trap": "选 A/B 一边进行时一边过去式 — 不对。while 引导**两个长动作同时进行** → 两边都进行时。",
      "why":  "**while** = 两动作同时持续 → 两边都用 **过去进行时**。"
    },
    {
      "stem": "I ___ a shower when the doorbell ___.",
      "option_a": "took / rang",
      "option_b": "was taking / was ringing",
      "option_c": "was taking / rang",
      "option_d": "took / was ringing",
      "correct_answer": "C",
      "trap": "选 A 两边都过去式 → 没体现\"被打断\"。选 B/D 哪个长哪个短弄反。",
      "why":  "**长动作（洗澡）被短动作（门铃响）打断** → 长用进行时 (was taking)，短用过去式 (rang)。"
    },
    {
      "stem": "— What ___ you ___ from 8 to 10 yesterday morning?\n— I ___ the new film at the cinema.",
      "option_a": "did / do / watched",
      "option_b": "were / doing / was watching",
      "option_c": "did / doing / was watching",
      "option_d": "were / do / watched",
      "correct_answer": "B",
      "trap": "选 A 完全过去式 — 没体现\"那段时间持续在做\"。选 C/D 助动词搭配混乱。",
      "why":  "**from 8 to 10 yesterday** = 过去一段时间持续 → 过去进行时。疑问句：**Were you doing ...?**"
    }
  ]$jsonb$::jsonb

WHERE code = 'g8.22';


UPDATE junior_grammar_points SET teacher_script = $jsonb$[
  {
    "text": "今天解锁**过去进行时**。中考阅读最爱用的\"当时正在……\"句式。",
    "show": "🎯 Today: was / were + V-ing",
    "duration": 8
  },
  {
    "text": "公式：**was / were + 动词 -ing**。强调\"过去某一刻正在做\"。",
    "show": "I was reading at 8 last night.",
    "highlight": "was reading",
    "duration": 10
  },
  {
    "text": "**主谓一致**：I / he / she / it → **was**；you / we / they → **were**。",
    "show": "I/he/she/it → was   |   you/we/they → were",
    "highlight": "was / were",
    "duration": 11
  },
  {
    "text": "**用法 ①** ：明确的过去时刻 — at 8 last night, this time yesterday。",
    "show": "At 8 last night, I was watching TV.",
    "highlight": "At 8 last night",
    "duration": 10
  },
  {
    "text": "**用法 ②**：**while** 引导**两个长动作同时进行**，两边都用进行时。",
    "show": "While I was reading, Tom was watching TV.",
    "highlight": "While ... was ...",
    "duration": 11
  },
  {
    "text": "**用法 ③**（最考）：**when** 引导**短动作打断长动作**。长用进行时，短用过去式。",
    "show": "I was reading when the phone rang.",
    "highlight": "rang",
    "duration": 12
  },
  {
    "text": "**坑点**：状态动词 know / like / love / want **不能用进行时**，要用过去式。",
    "show": "✗ I was knowing it.   ✓ I knew it.",
    "highlight": "knew",
    "duration": 11
  },
  {
    "text": "理论讲完。下一关 6 个真实场景练习。",
    "show": "Next → 6 Real-life Scenarios 📚",
    "duration": 7
  }
]$jsonb$::jsonb
WHERE code = 'g8.22';


DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.22')
  AND sort_order BETWEEN 9000 AND 9099;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.22')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  (
    'My sister ___ a story to my little brother at 9 last night.',
    'mcq', 'reads', 'read', 'was reading', 'is reading', 'C',
    NULL::text[],
    'at 9 last night = 过去某一刻 → 过去进行时 = **was reading**。',
    '{}'::jsonb, NULL, 'past_continuous_basic', false, 1, 9000
  ),
  (
    'When the earthquake hit, the students ___ in class.',
    'mcq', 'studied', 'were studying', 'are studying', 'was studying', 'B',
    NULL::text[],
    'when 引导短动作 hit + 长动作正在进行 → 过去进行时 = **were studying**（students 复数）。',
    '{}'::jsonb, NULL, 'past_continuous_when', false, 2, 9001
  ),
  (
    'While I ___ in the park yesterday afternoon, I ___ an old friend.',
    'mcq', 'was walking / met', 'walked / was meeting', 'was walking / was meeting', 'walked / met', 'A',
    NULL::text[],
    'while 引导的长动作（散步）+ 突发动作（碰到朋友）→ 长进行时 + 短过去式。',
    '{}'::jsonb, NULL, 'past_continuous_while_when', false, 3, 9002
  ),
  (
    'At this time yesterday, we ___ a Chinese class.',
    'mcq', 'had', 'were having', 'have', 'are having', 'B',
    NULL::text[],
    'at this time yesterday = 过去某一刻 → 进行时 **were having**。',
    '{}'::jsonb, NULL, 'past_continuous_time_marker', false, 1, 9003
  ),

  (
    'I ____ (do) my homework when my dad came home.',
    'fill', NULL, NULL, NULL, NULL, 'was doing',
    ARRAY['was doing']::text[],
    'when came home 打断"正在做作业" → was doing。',
    '{}'::jsonb, NULL, 'past_continuous_interrupted', false, 1, 9004
  ),
  (
    'My parents ____ (talk) about my study when I walked in.',
    'fill', NULL, NULL, NULL, NULL, 'were talking',
    ARRAY['were talking']::text[],
    'parents 复数 + 被打断 → **were talking**。',
    '{}'::jsonb, NULL, 'past_continuous_plural', false, 2, 9005
  ),
  (
    'From 7 to 10 yesterday evening, Tom ____ (practice) the violin.',
    'fill', NULL, NULL, NULL, NULL, 'was practicing',
    ARRAY['was practicing', 'was practising']::text[],
    'from 7 to 10 = 过去一段时间 → 进行时 **was practicing**（美式拼写）。',
    '{}'::jsonb, 'practicing 是美式，practising 是英式；中考两种拼写都接受。', 'past_continuous_duration', false, 2, 9006
  ),

  (
    '合并：  "I was walking in the park. I saw a bird."',
    'transform', NULL, NULL, NULL, NULL, 'I was walking in the park when I saw a bird.',
    ARRAY[
      'I was walking in the park when I saw a bird.',
      'While I was walking in the park, I saw a bird.'
    ]::text[],
    '长动作（散步）被短动作（看见鸟）打断 → 用 when 或 while 引导。',
    '{}'::jsonb, NULL, 'past_continuous_combine', true, 2, 9007
  ),
  (
    '改写为过去进行时（提示：at 8 last night）：  "He did his homework."',
    'transform', NULL, NULL, NULL, NULL, 'He was doing his homework at 8 last night.',
    ARRAY[
      'He was doing his homework at 8 last night.'
    ]::text[],
    'did → was doing；加上时间状语。',
    '{}'::jsonb, NULL, 'past_continuous_transform', true, 2, 9008
  ),

  (
    '改错：  "Tom were sleeping when his alarm clock rang."',
    'correction', NULL, NULL, NULL, NULL, 'Tom was sleeping when his alarm clock rang.',
    ARRAY[
      'Tom was sleeping when his alarm clock rang.'
    ]::text[],
    '主语 Tom 单数 → was，不是 were。',
    '{}'::jsonb, NULL, 'past_continuous_subject_verb', true, 2, 9009
  ),
  (
    '改错：  "While Mom was cooking, I read a book."',
    'correction', NULL, NULL, NULL, NULL, 'While Mom was cooking, I was reading a book.',
    ARRAY[
      'While Mom was cooking, I was reading a book.'
    ]::text[],
    'while 引导两个长动作同时进行 → 两边都用进行时。',
    '{}'::jsonb, NULL, 'past_continuous_while', true, 3, 9010
  ),

  (
    '把这句话译成英文：地震发生时，我们全家正在吃晚饭。',
    'translation', NULL, NULL, NULL, NULL, 'When the earthquake happened, my family was having dinner.',
    ARRAY[
      'When the earthquake happened, my family was having dinner.',
      'When the earthquake struck, my family were eating dinner.',
      'My family was having dinner when the earthquake happened.',
      'When the earthquake hit, my whole family was at dinner.'
    ]::text[],
    '考点：① 长动作（吃饭）+ 短动作（地震发生）→ 长进行时 + 短过去式；② family 可视为单数 was 或集体复数 were。',
    '{}'::jsonb, 'family 在英美用法略有不同：美式偏单数（was），英式可单可复（was/were）。中考两种都接受。', 'past_continuous_translation', true, 3, 9011
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
  SELECT id, content_depth INTO v_point_id, v_depth FROM junior_grammar_points WHERE code = 'g8.22';
  IF v_point_id IS NULL THEN
    RAISE EXCEPTION 'Gold-standard migration failed: junior_grammar_points row with code=''g8.22'' does not exist.';
  END IF;
  IF v_depth <> 3 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: content_depth for g8.22 is %, expected 3.', v_depth;
  END IF;
  SELECT count(*) INTO v_q_count
  FROM junior_grammar_questions
  WHERE point_id = v_point_id AND sort_order BETWEEN 9000 AND 9099;
  IF v_q_count <> 12 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: expected 12 questions for g8.22, got %.', v_q_count;
  END IF;
  RAISE NOTICE 'Gold-standard migration for g8.22 verified: content_depth=3, % questions seeded.', v_q_count;
END $$;


-- ╔════════════════════════════════════════════════════════════════════╗
-- ║ FILE: 20260522140000_g8_25_perfect_vs_past_gold_standard.sql
-- ╚════════════════════════════════════════════════════════════════════╝
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


-- ╔════════════════════════════════════════════════════════════════════╗
-- ║ FILE: 20260522150000_g8_09_superlatives_gold_standard.sql
-- ╚════════════════════════════════════════════════════════════════════╝
-- =====================================================================
-- Gold-standard content for G8 · 形容词最高级 · Adjective Superlatives
-- Code: g8.09   Category: other
-- =====================================================================
-- the most + adj / -est, in/of ranges, "one of the + 复数" pattern.
-- =====================================================================

UPDATE junior_grammar_points
SET
  summary = '三个或以上的"最 X" — 中考介绍家乡 / 学校 / 名人时高频用法。',
  hook_line_cn = '比较级搞定两个，最高级搞定三个以上。会用 one of the + 最高级 + 复数，作文加分稳。',
  hook_line = 'Superlatives — make any 中考 essay sound impressive ("the most ...", "one of the ...").',
  mnemonic = '最高级 = the + -est / the most；范围用 in（地点/团体）/ of（同类/数量）。',
  content_depth = 3,

  explanation_md = E'## 🎯 一句话搞定\n\n**三个或以上比较，找出"最"** → 用 **the + 形容词最高级 + 范围**。\n\n---\n\n## 📐 最高级怎么变？\n\n| 形容词类型 | 变化规则 | 例子 |\n|---|---|---|\n| 单音节 → 加 **-est** | tall → **the tallest** | He is **the tallest** in our class. |\n| 单音节短元音 + 单辅音 → 双写 + est | big → **the biggest** | Beijing is one of **the biggest** cities in China. |\n| 以 e 结尾 → 加 **-st** | large → **the largest** | The Pacific is **the largest** ocean. |\n| 辅音 + y 结尾 → y 变 i 加 est | easy → **the easiest** | This is **the easiest** problem of all. |\n| 多音节 / 长形容词 → **the most + 原级** | difficult → **the most difficult** | This is **the most difficult** question. |\n| 不规则 → 记 5 组 | good/well → **best**, bad → **worst**, many/much → **most**, little → **least**, far → **farthest/furthest** | She is **the best** singer in our school. |\n\n> ⚠️ **铁律**：最高级前面**几乎永远要 the**！\n\n---\n\n## 🔥 经典句式（中考必考）\n\n### ① 最高级 + in / of\n- **in + 地点 / 团体**：Lin is **the tallest in our class**.\n- **of + 同类 / 数量**：This is **the cheapest of all the phones**.\n\n### ② "one of the + 最高级 + 复数名词"（高分句型）\n- Suzhou is **one of the most beautiful cities** in China.（注意：cities 是**复数**）\n- He is **one of the best students** in our grade.\n\n### ③ 最高级 + that / 关系从句\n- This is **the best movie that I have ever seen**.\n- It''s **the funniest joke I''ve ever heard**.\n\n---\n\n## ⏰ 看到这些 = 最高级\n\n- **the +最高级 + in / of**\n- **one of the + 最高级 + 复数**\n- 句末有 **in our class / in the world / of all**\n- 三个或以上的比较语境\n- 关系从句里有 **that / I have ever ...**\n\n---\n\n## ⚠️ Top 5 易错点（中考批卷红笔常出现）\n\n1. **漏掉 the**：~~He is tallest in our class.~~ → **He is the tallest in our class.**\n2. **two/two 个比较用了最高级**：~~Of the two boys, Tom is the taller.~~ → 两人对比用**比较级**：**Tom is taller**（如果非要用 the taller 也可，但中考更稳的是比较级）\n3. **double 最高级**：~~the most tallest~~ → **the tallest**（只能加 -est 或 most，不能同时）\n4. **one of the + 单数**：~~one of the best student~~ → **one of the best students**（复数 students）\n5. **范围用错**：~~the tallest of our class~~ → **the tallest in our class**（class 是团体 → in）\n\n---\n\n## 🧠 三秒判断口诀\n\n> ① 三个以上比较 → **最高级**（两个用比较级）  \n> ② 最高级前面 → 一律加 **the**  \n> ③ in（地点 / 团体）vs of（同类 / 数量）— class 用 in，all 用 of  \n> ④ **one of the + 最高级 + 复数**（高分句型，必背）',

  immersion_cards = $jsonb$[
    {"situation": "Showing off your hometown to a friend", "cn": "苏州是中国最美的城市之一。", "en": "Suzhou is one of the most beautiful cities in China."},
    {"situation": "Praising the best student in class", "cn": "Lin 是我们班最聪明的学生。", "en": "Lin is the smartest student in our class."},
    {"situation": "Recommending a movie", "cn": "这是我看过的最棒的电影。", "en": "This is the best movie that I have ever seen."},
    {"situation": "Comparing prices in a shop", "cn": "三个里面这一个最便宜。", "en": "This is the cheapest of the three."},
    {"situation": "Reporting weather news", "cn": "今天是这个夏天最热的一天。", "en": "Today is the hottest day of this summer."},
    {"situation": "Talking about a tough exam", "cn": "数学是这学期最难的科目。", "en": "Math is the most difficult subject this term."}
  ]$jsonb$::jsonb,

  contrast_table = $jsonb$[
    {"lhs": "He is tallest in our class.",                    "rhs": "He is the tallest in our class."},
    {"lhs": "Lin is the most tallest in our school.",         "rhs": "Lin is the tallest in our school."},
    {"lhs": "Suzhou is one of the most beautiful city.",      "rhs": "Suzhou is one of the most beautiful cities in China."},
    {"lhs": "He is the tallest of our class.",                "rhs": "He is the tallest in our class."},
    {"lhs": "This is the goodest book I''ve ever read.",       "rhs": "This is the best book I''ve ever read."},
    {"lhs": "Of the two boys, Tom is the tallest.",            "rhs": "Of the two boys, Tom is the taller."}
  ]$jsonb$::jsonb,

  reflex_cards = $jsonb$[
    {"cn": "他是我们班最高的男生。",              "en": "He is the tallest boy in our class.",            "keyword": "the tallest"},
    {"cn": "这是我读过最好的小说。",              "en": "This is the best novel I have ever read.",       "keyword": "the best"},
    {"cn": "她是三个里跳得最远的。",              "en": "She jumped the farthest of the three.",          "keyword": "the farthest of"},
    {"cn": "中国是世界上人口最多的国家之一。",    "en": "China is one of the most populous countries in the world.","keyword": "one of the most"},
    {"cn": "今天是这周最冷的一天。",              "en": "Today is the coldest day of the week.",          "keyword": "the coldest"},
    {"cn": "鲸鱼是世界上最大的动物。",            "en": "The whale is the largest animal in the world.",  "keyword": "the largest ... in"},
    {"cn": "Tom 在班里跑得最快。",                "en": "Tom runs the fastest in our class.",             "keyword": "the fastest"},
    {"cn": "这道题是所有里面最难的。",            "en": "This is the most difficult question of all.",    "keyword": "the most difficult"}
  ]$jsonb$::jsonb,

  situation_drills = $jsonb$[
    {
      "situation": "Showing your hometown to an exchange student.",
      "cn": "苏州是中国最古老的城市之一，已经有 2500 多年历史了。",
      "en": "Suzhou is one of the oldest cities in China, with a history of more than 2,500 years.",
      "accepted": [
        "Suzhou is among the oldest cities in China — it has a 2,500-year history.",
        "With over 2,500 years of history, Suzhou is one of China''s oldest cities."
      ]
    },
    {
      "situation": "Recommending the best dish at a local restaurant.",
      "cn": "这家店的松鼠桂鱼是整个苏州最好吃的。",
      "en": "The squirrel-shaped fish here is the most delicious in all of Suzhou.",
      "accepted": [
        "Their squirrel fish is the best in Suzhou.",
        "The squirrel fish here is the tastiest in all of Suzhou."
      ]
    },
    {
      "situation": "Writing a short essay about a memorable trip.",
      "cn": "去年的西藏之旅是我最难忘的一次经历。",
      "en": "The trip to Tibet last year was the most unforgettable experience of my life.",
      "accepted": [
        "My trip to Tibet last year was the most memorable experience I''ve ever had.",
        "Last year''s Tibet trip is the most unforgettable journey of my life."
      ]
    },
    {
      "situation": "Telling a friend about your favorite teacher.",
      "cn": "Mr. Wang 是我见过最有耐心的英语老师。",
      "en": "Mr. Wang is the most patient English teacher I have ever met.",
      "accepted": [
        "Mr. Wang is the most patient English teacher I''ve ever had.",
        "Of all the English teachers I''ve met, Mr. Wang is the most patient."
      ]
    }
  ]$jsonb$::jsonb,

  correction_tasks = $jsonb$[
    {
      "wrong": "He is tallest boy in our class.",
      "model": "He is the tallest boy in our class.",
      "hint":  "最高级前要 the",
      "why":   "**最高级前面几乎永远要 the**。这是中考批卷最容易扣分的一处。"
    },
    {
      "wrong": "Lin is the most tallest in our school.",
      "model": "Lin is the tallest in our school.",
      "hint":  "double 最高级",
      "why":   "**双重最高级**：tall 是单音节，只能加 -est。不能 most 和 -est 同时用。"
    },
    {
      "wrong": "Suzhou is one of the most beautiful city in China.",
      "model": "Suzhou is one of the most beautiful cities in China.",
      "hint":  "one of the 后接复数",
      "why":   "**one of the + 最高级 + 复数名词** 是固定句型。city 必须改成 **cities**。"
    },
    {
      "wrong": "He is the tallest of our class.",
      "model": "He is the tallest in our class.",
      "hint":  "class 是团体 → in",
      "why":   "**in 接团体 / 地点**（in our class / in China）；**of 接同类 / 数量**（of the three boys / of all）。"
    },
    {
      "wrong": "This is the goodest book I have ever read.",
      "model": "This is the best book I have ever read.",
      "hint":  "good 不规则",
      "why":   "**good → better → best**。是 5 个必背不规则之一。"
    },
    {
      "wrong": "Of the two boys, Tom is the tallest.",
      "model": "Of the two boys, Tom is the taller.",
      "hint":  "两个比较用比较级",
      "why":   "**两个**人事物比较用**比较级**（the taller）；**三个或以上**才用最高级。"
    }
  ]$jsonb$::jsonb,

  boss_questions = $jsonb$[
    {
      "stem": "Mount Everest is ___ mountain in the world.",
      "option_a": "high",
      "option_b": "higher",
      "option_c": "the highest",
      "option_d": "highest",
      "correct_answer": "C",
      "trap": "选 D 漏 the；选 B 是比较级，但全世界范围 → 用最高级。",
      "why":  "最高级前**几乎永远要 the** + 范围 in the world → **the highest**。"
    },
    {
      "stem": "Of all the subjects, math is ___ for me.",
      "option_a": "more difficult",
      "option_b": "the most difficult",
      "option_c": "difficulter",
      "option_d": "most difficult",
      "correct_answer": "B",
      "trap": "选 D 漏 the；选 C 不存在。Of all... 提示最高级语境。",
      "why":  "Of all the subjects = \"在所有科目里\" → 最高级。difficult 多音节 → **the most difficult**。"
    },
    {
      "stem": "The Great Wall is ___ tourist attractions in China.",
      "option_a": "the most famous",
      "option_b": "one of most famous",
      "option_c": "one of the most famous",
      "option_d": "one of the most famous of",
      "correct_answer": "C",
      "trap": "选 A 漏了 \"one of\"（语境暗示长城是\"之一\"）。选 B 漏 the。选 D 多余 of。",
      "why":  "**one of the + 最高级 + 复数名词** 是固定高分句型。tourist attractions 是复数。"
    },
    {
      "stem": "— Who is taller, Lin or her brother?\n— Her brother is ___.",
      "option_a": "the taller",
      "option_b": "taller",
      "option_c": "the tallest",
      "option_d": "tallest",
      "correct_answer": "B",
      "trap": "选 C/D 都用了最高级 — 但**两个人**对比应该用**比较级**。",
      "why":  "**两人对比 → 比较级 taller**。问题里 \"Who is taller\" 已经用比较级，回答保持一致。"
    }
  ]$jsonb$::jsonb

WHERE code = 'g8.09';


UPDATE junior_grammar_points SET teacher_script = $jsonb$[
  {
    "text": "今天解锁**形容词最高级**。中考介绍家乡、学校、名人的写作题里几乎必用。",
    "show": "🎯 Today: the + -est / the most",
    "duration": 9
  },
  {
    "text": "公式：**the + 最高级 + 范围**。范围用 in（地点/团体）或 of（同类/数量）。",
    "show": "the + adj-est   +   in / of",
    "highlight": "the",
    "duration": 11
  },
  {
    "text": "**单音节加 -est**：tall → tallest, fast → fastest。**最高级前加 the**！",
    "show": "tall → the tallest   fast → the fastest",
    "highlight": "the tallest",
    "duration": 10
  },
  {
    "text": "**双写末辅音**：big → biggest, hot → hottest。**y 变 i 加 est**：easy → easiest, busy → busiest。",
    "show": "big → biggest   easy → easiest",
    "highlight": "biggest",
    "duration": 11
  },
  {
    "text": "**多音节用 most**：difficult → the most difficult, interesting → the most interesting。",
    "show": "the most difficult   the most interesting",
    "highlight": "the most",
    "duration": 10
  },
  {
    "text": "**5 个不规则必背**：good → **best**, bad → worst, many/much → most, little → least, far → farthest。",
    "show": "good → best   bad → worst   many → most",
    "highlight": "best",
    "duration": 12
  },
  {
    "text": "**高分句型**：**one of the + 最高级 + 复数名词**。Suzhou is **one of the most beautiful cities** in China。",
    "show": "one of the most beautiful cities",
    "highlight": "cities",
    "duration": 12
  },
  {
    "text": "**最大坑**：两个人事物对比用**比较级**，不是最高级！下一关进入真实场景练习。",
    "show": "2 → comparative   |   3+ → superlative",
    "highlight": "2 → comparative",
    "duration": 10
  }
]$jsonb$::jsonb
WHERE code = 'g8.09';


DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.09')
  AND sort_order BETWEEN 9000 AND 9099;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.09')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  (
    'The Yangtze is ___ river in China.',
    'mcq', 'long', 'longer', 'the longest', 'longest', 'C',
    NULL::text[],
    '全中国范围 + 最长 → 最高级 + the = **the longest**。',
    '{}'::jsonb, NULL, 'superlative_basic', false, 1, 9000
  ),
  (
    'Beijing is one of ___ cities in China.',
    'mcq', 'the bigger', 'big', 'the biggest', 'biggest', 'C',
    NULL::text[],
    '"one of the + 最高级 + 复数" 固定句型 → the biggest。',
    '{}'::jsonb, NULL, 'superlative_one_of', false, 2, 9001
  ),
  (
    'Of the three subjects, English is ___ for me.',
    'mcq', 'easier', 'the easier', 'the easiest', 'easiest', 'C',
    NULL::text[],
    '三科目比较 + 最 → the easiest（y → i + est）。',
    '{}'::jsonb, NULL, 'superlative_of_three', false, 2, 9002
  ),
  (
    'Who is ___ student in our class? — Lin, I think.',
    'mcq', 'the cleverer', 'cleverest', 'the cleverest', 'more clever', 'C',
    NULL::text[],
    '全班范围 + 最 → 最高级 + the = **the cleverest**。',
    '{}'::jsonb, NULL, 'superlative_class', false, 2, 9003
  ),

  (
    'This is ____ (interesting) book I have ever read.',
    'fill', NULL, NULL, NULL, NULL, 'the most interesting',
    ARRAY['the most interesting']::text[],
    'interesting 多音节 → the most interesting。',
    '{}'::jsonb, NULL, 'superlative_most', false, 2, 9004
  ),
  (
    'Tom is one of ____ (good) singers in our school.',
    'fill', NULL, NULL, NULL, NULL, 'the best',
    ARRAY['the best']::text[],
    'one of the + best + singers（复数）；good 不规则 → best。',
    '{}'::jsonb, NULL, 'superlative_one_of', false, 2, 9005
  ),
  (
    'The bag is ____ (heavy) of all.',
    'fill', NULL, NULL, NULL, NULL, 'the heaviest',
    ARRAY['the heaviest']::text[],
    'heavy（辅音+y）→ heaviest；of all → 用 of。',
    '{}'::jsonb, NULL, 'superlative_y_to_i', false, 1, 9006
  ),

  (
    '改写为最高级：  "No other mountain in the world is higher than Mount Everest."',
    'transform', NULL, NULL, NULL, NULL, 'Mount Everest is the highest mountain in the world.',
    ARRAY[
      'Mount Everest is the highest mountain in the world.'
    ]::text[],
    'No other X is + 比较级 + than Y = Y is + 最高级。',
    '{}'::jsonb, NULL, 'superlative_transform', true, 2, 9007
  ),
  (
    '改成 one of 句型：  "Suzhou is a very beautiful city in China."',
    'transform', NULL, NULL, NULL, NULL, 'Suzhou is one of the most beautiful cities in China.',
    ARRAY[
      'Suzhou is one of the most beautiful cities in China.'
    ]::text[],
    'one of the + 最高级 + 复数名词；city → cities。',
    '{}'::jsonb, NULL, 'superlative_one_of_transform', true, 3, 9008
  ),

  (
    '改错：  "He is tallest student in our class."',
    'correction', NULL, NULL, NULL, NULL, 'He is the tallest student in our class.',
    ARRAY[
      'He is the tallest student in our class.'
    ]::text[],
    '最高级前面必须加 **the**。',
    '{}'::jsonb, NULL, 'superlative_missing_the', true, 1, 9009
  ),
  (
    '改错：  "Suzhou is one of the most beautiful city in China."',
    'correction', NULL, NULL, NULL, NULL, 'Suzhou is one of the most beautiful cities in China.',
    ARRAY[
      'Suzhou is one of the most beautiful cities in China.'
    ]::text[],
    '"one of the + 最高级 + **复数**名词"。city → cities。',
    '{}'::jsonb, NULL, 'superlative_one_of_plural', true, 2, 9010
  ),

  (
    '把这句话译成英文：长城是世界上最长的人造建筑之一。',
    'translation', NULL, NULL, NULL, NULL, 'The Great Wall is one of the longest man-made structures in the world.',
    ARRAY[
      'The Great Wall is one of the longest man-made structures in the world.',
      'The Great Wall is one of the longest structures built by humans in the world.',
      'The Great Wall is one of the longest man-made buildings in the world.',
      'The Great Wall is among the longest man-made structures in the world.'
    ]::text[],
    '考点：① "之一"= one of the + 最高级 + 复数；② "人造建筑"= man-made structures / buildings；③ 范围"世界上"= in the world。',
    '{}'::jsonb, '更地道：用 structures 比 buildings 更准确（长城不是楼）。one of the longest 是中考写作高分句型。', 'superlative_translation', true, 3, 9011
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
  SELECT id, content_depth INTO v_point_id, v_depth FROM junior_grammar_points WHERE code = 'g8.09';
  IF v_point_id IS NULL THEN
    RAISE EXCEPTION 'Gold-standard migration failed: junior_grammar_points row with code=''g8.09'' does not exist.';
  END IF;
  IF v_depth <> 3 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: content_depth for g8.09 is %, expected 3.', v_depth;
  END IF;
  SELECT count(*) INTO v_q_count
  FROM junior_grammar_questions
  WHERE point_id = v_point_id AND sort_order BETWEEN 9000 AND 9099;
  IF v_q_count <> 12 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: expected 12 questions for g8.09, got %.', v_q_count;
  END IF;
  RAISE NOTICE 'Gold-standard migration for g8.09 verified: content_depth=3, % questions seeded.', v_q_count;
END $$;


-- ╔════════════════════════════════════════════════════════════════════╗
-- ║ FILE: 20260522160000_g8_21_when_while_gold_standard.sql
-- ╚════════════════════════════════════════════════════════════════════╝
-- =====================================================================
-- Gold-standard content for G8 · when / while 时间状语从句 · Time Clauses
-- Code: g8.21   Category: clause
-- =====================================================================
-- Pairs tightly with g8.22 (past continuous). Covers the 长/短 rule
-- and the most-tested mix-and-match of when + past simple vs while
-- + past continuous.
-- =====================================================================

UPDATE junior_grammar_points
SET
  summary = '"当……时" / "在……期间" — when 配短动作，while 配长动作，中考阅读叙事高频结构。',
  hook_line_cn = '一句话搞定 when 和 while：when 跟"短突发"，while 跟"长持续"。学会区分，阅读叙事和作文都通顺。',
  hook_line = 'When = short moment, while = long stretch — the rule that saves 90% of student errors.',
  mnemonic = 'when 配短（一般过去时），while 配长（过去进行时）。',
  content_depth = 3,

  explanation_md = E'## 🎯 一句话搞定\n\n**when** = 在某一时刻（短动作），通常配**一般过去时**  \n**while** = 在一段时间里（长动作），通常配**过去进行时**\n\n---\n\n## 📐 三种经典搭配（必背）\n\n| 结构 | 含义 | 例子 |\n|---|---|---|\n| **when + 过去式, 主句过去进行时** | 长动作被短突发打断 | **When the phone rang**, I **was reading**. |\n| **while + 过去进行时, 主句过去式** | 一边在做……结果发生了…… | **While I was walking**, I **met** Tom. |\n| **while + 过去进行时, 主句过去进行时** | 两动作同时持续 | **While Mom was cooking**, I **was reading**. |\n\n> ⚠️ **铁律**：when 后一般是**短突发**（用过去式）；while 后一般是**长持续**（用过去进行时）。\n\n---\n\n## 🔥 决策树：哪个先哪个后？\n\n```\n要描述"过去某动作正在进行"  ─┐\n                            ├─→ 用过去进行时（背景）\n突然发生一件事             ─┤\n                            └─→ 用过去式（事件）\n```\n\n**例**：我**正在读书**（背景，长）+ 电话**响了**（事件，短）  \n→ I **was reading** **when** the phone **rang**.  \n→ **When** the phone **rang**, I **was reading**.（两种顺序都对）\n\n---\n\n## ⏰ 看到这些 = when / while 题\n\n- 句中有 **when** + 过去时间动词\n- 句中有 **while** + V-ing 结构\n- 描述"我正在……突然……"的剧情\n- 描述"我们一起做不同事"的同时场景\n- 中考阅读叙事段（小故事 / 回忆录 / 警察笔录）\n\n---\n\n## ⚠️ Top 5 易错点（中考批卷红笔常出现）\n\n1. **while 后用了过去式**：~~While I read, Tom watched TV.~~ → **While I was reading, Tom was watching TV.**\n2. **when 后用了进行时**：~~When the phone was ringing, I was reading.~~ → **When the phone rang, I was reading.**\n3. **两边都进行时（when 句）**：~~When I was walking, I was meeting Tom.~~ → **While I was walking, I met Tom.**（短动作 met 用过去式）\n4. **两边都过去式（while 句）**：~~While I read, Mom cooked.~~ → **While I was reading, Mom was cooking.**\n5. **主谓不一致**：~~While they was sleeping~~ → **While they were sleeping**（they → were）\n\n---\n\n## 🧠 三秒判断口诀\n\n> ① 哪个**长**？→ 用 **while + 过去进行时**  \n> ② 哪个**短**？→ 用 **when + 过去式**  \n> ③ 两边都长 → 两边都用进行时  \n> ④ 一长一短 → 长进行时，短过去式',

  immersion_cards = $jsonb$[
    {"situation": "Mom calls during your homework", "cn": "我在写作业的时候妈妈叫我吃饭。", "en": "While I was doing my homework, Mom called me for dinner."},
    {"situation": "Friend asks why you didn''t answer last night", "cn": "你打来的时候我正在洗澡。", "en": "When you called, I was taking a shower."},
    {"situation": "Telling a friend about a fall on the way to school", "cn": "我骑车上学的时候摔了一跤。", "en": "While I was riding to school, I fell off my bike."},
    {"situation": "Describing what your family was doing during the storm", "cn": "外面打雷的时候我们都在客厅看电视。", "en": "When the thunder roared outside, we were all watching TV in the living room."},
    {"situation": "Two siblings doing different things last evening", "cn": "妈妈做饭的时候，我在做作业。", "en": "While Mom was cooking, I was doing my homework."},
    {"situation": "Recounting a small earthquake to classmates", "cn": "地震发生时，我正在睡觉。", "en": "When the earthquake happened, I was sleeping."}
  ]$jsonb$::jsonb,

  contrast_table = $jsonb$[
    {"lhs": "While I read, Tom watched TV.",                  "rhs": "While I was reading, Tom was watching TV."},
    {"lhs": "When the phone was ringing, I was cooking.",     "rhs": "When the phone rang, I was cooking."},
    {"lhs": "When I was walking, I was meeting Tom.",         "rhs": "While I was walking, I met Tom."},
    {"lhs": "While I read, Mom cooked dinner.",                "rhs": "While I was reading, Mom was cooking dinner."},
    {"lhs": "While they was sleeping, I came home.",          "rhs": "While they were sleeping, I came home."},
    {"lhs": "When I doing my homework, Dad came in.",         "rhs": "When I was doing my homework, Dad came in."}
  ]$jsonb$::jsonb,

  reflex_cards = $jsonb$[
    {"cn": "我正在做作业，妈妈进来了。",         "en": "I was doing my homework when Mom came in.",       "keyword": "when Mom came"},
    {"cn": "我在散步时碰到了老朋友。",           "en": "While I was walking, I met an old friend.",       "keyword": "While I was walking"},
    {"cn": "雷响了我正在睡觉。",                 "en": "When the thunder roared, I was sleeping.",        "keyword": "When the thunder"},
    {"cn": "他们在吃饭的时候我们到了。",         "en": "While they were having dinner, we arrived.",      "keyword": "While they were"},
    {"cn": "我在读书时电灯灭了。",               "en": "I was reading when the lights went out.",         "keyword": "when the lights went out"},
    {"cn": "Lin 唱歌的时候我在录像。",           "en": "While Lin was singing, I was recording.",         "keyword": "While Lin was singing"},
    {"cn": "我开门的时候听到了哭声。",           "en": "When I opened the door, I heard someone crying.", "keyword": "When I opened"},
    {"cn": "他们做实验时老师在观察。",           "en": "While they were doing the experiment, the teacher was watching.","keyword": "While they were doing"}
  ]$jsonb$::jsonb,

  situation_drills = $jsonb$[
    {
      "situation": "Mom asks why you broke a cup last night.",
      "cn": "我在洗碗的时候不小心把杯子摔了。",
      "en": "While I was washing the dishes, I accidentally dropped a cup.",
      "accepted": [
        "I was doing the dishes when I accidentally broke a cup.",
        "While I was washing up, I accidentally broke a cup."
      ]
    },
    {
      "situation": "Telling a friend why your homework is unfinished.",
      "cn": "我做到一半的时候电脑死机了。",
      "en": "While I was working on it, my computer crashed.",
      "accepted": [
        "I was halfway through when my computer crashed.",
        "My computer crashed while I was doing it."
      ]
    },
    {
      "situation": "Explaining a small classroom incident to your homeroom teacher.",
      "cn": "Lin 在画画的时候，Tom 不小心碰到了桌子。",
      "en": "While Lin was drawing, Tom accidentally bumped into the table.",
      "accepted": [
        "Lin was drawing when Tom accidentally bumped the table.",
        "While Lin was drawing, Tom bumped into the desk by accident."
      ]
    },
    {
      "situation": "Describing what everyone was doing during the fire drill.",
      "cn": "警报响起的时候，我们都在上数学课。",
      "en": "When the alarm went off, we were all in math class.",
      "accepted": [
        "We were all having math class when the alarm rang.",
        "When the fire alarm went off, we were in the middle of math."
      ]
    }
  ]$jsonb$::jsonb,

  correction_tasks = $jsonb$[
    {
      "wrong": "While I read a book, Tom watched TV.",
      "model": "While I was reading a book, Tom was watching TV.",
      "hint":  "while 配过去进行时",
      "why":   "**while 引导两个长动作同时进行** → 两边都用过去进行时（was/were + V-ing）。"
    },
    {
      "wrong": "When the phone was ringing, I was cooking.",
      "model": "When the phone rang, I was cooking.",
      "hint":  "when 后用短突发动作",
      "why":   "**when 通常接短突发动作** → 用一般过去时 **rang**。被打断的长动作 (was cooking) 用进行时。"
    },
    {
      "wrong": "When I was walking, I was meeting Tom.",
      "model": "While I was walking, I met Tom.",
      "hint":  "走路是长，碰到是短",
      "why":   "走路（长）→ while + was walking；碰到（短突发）→ 一般过去时 **met**。"
    },
    {
      "wrong": "While they was sleeping, I came home.",
      "model": "While they were sleeping, I came home.",
      "hint":  "they 用 were",
      "why":   "主语 **they = 复数** → 用 **were**。"
    },
    {
      "wrong": "When I doing my homework, Dad came in.",
      "model": "When I was doing my homework, Dad came in.",
      "hint":  "缺 was",
      "why":   "**过去进行时 = was/were + V-ing**。doing 前面必须有 **was**。"
    },
    {
      "wrong": "While Mom cooked, I was watching TV.",
      "model": "While Mom was cooking, I was watching TV.",
      "hint":  "while 后用进行时",
      "why":   "**while 后接长动作 → 用过去进行时**。cooked → was cooking。"
    }
  ]$jsonb$::jsonb,

  boss_questions = $jsonb$[
    {
      "stem": "I ___ my homework when the doorbell ___.",
      "option_a": "did / rang",
      "option_b": "was doing / rang",
      "option_c": "was doing / was ringing",
      "option_d": "did / was ringing",
      "correct_answer": "B",
      "trap": "选 A 两边都过去式 — 没体现\"被打断\"。选 C 两边进行时 — 门铃是短突发不能用进行时。",
      "why":  "**长动作（做作业）被短动作（门铃响）打断** → 长用进行时，短用过去式。"
    },
    {
      "stem": "___ Mom ___ dinner, I ___ the table for her.",
      "option_a": "When / cooked / set",
      "option_b": "While / was cooking / set",
      "option_c": "While / cooked / set",
      "option_d": "When / was cooking / was setting",
      "correct_answer": "B",
      "trap": "选 C while 后用了过去式 — 错。选 D 摆桌子是短动作，不用进行时。",
      "why":  "**while 引导长动作（做饭）→ 过去进行时**；主句**摆桌子是动作完成 → 一般过去时 set**。"
    },
    {
      "stem": "What ___ you ___ at 10 last night when I called?",
      "option_a": "did / do",
      "option_b": "were / doing",
      "option_c": "were / do",
      "option_d": "did / doing",
      "correct_answer": "B",
      "trap": "选 A 完全过去式 — 没体现\"那一刻正在做\"。选 C/D 助动词搭配错。",
      "why":  "**at 10 last night = 过去某一刻 → 进行时**。疑问句：**Were you doing ...?**"
    },
    {
      "stem": "___ I ___ along the street, I ___ an accident.",
      "option_a": "When / walked / saw",
      "option_b": "While / was walking / saw",
      "option_c": "While / walked / saw",
      "option_d": "When / was walking / was seeing",
      "correct_answer": "B",
      "trap": "选 A/C while 后用过去式 — 错。选 D 看到事故是瞬间不用进行时。",
      "why":  "**while + 长动作（走路）→ 过去进行时**；主句**瞬间看到 → 一般过去时 saw**。"
    }
  ]$jsonb$::jsonb

WHERE code = 'g8.21';


UPDATE junior_grammar_points SET teacher_script = $jsonb$[
  {
    "text": "今天解锁 **when / while 时间状语从句**。中考阅读叙事段几乎每个长句都用。",
    "show": "🎯 Today: when (short) vs while (long)",
    "duration": 9
  },
  {
    "text": "**核心区别**：when 配**短突发动作**（一般过去时），while 配**长持续动作**（过去进行时）。",
    "show": "when → past simple   |   while → past continuous",
    "highlight": "when ... while",
    "duration": 12
  },
  {
    "text": "**搭配 ①**：when + 过去式打断长动作。**When the phone rang**, I **was reading**。",
    "show": "When the phone rang, I was reading.",
    "highlight": "When ... rang",
    "duration": 11
  },
  {
    "text": "**搭配 ②**：while + 过去进行时 + 主句过去式。**While I was walking**, I **met** Tom。",
    "show": "While I was walking, I met Tom.",
    "highlight": "While ... was walking",
    "duration": 11
  },
  {
    "text": "**搭配 ③**：while + 两个长动作同时进行 → 两边都进行时。While Mom **was cooking**, I **was reading**。",
    "show": "While Mom was cooking, I was reading.",
    "highlight": "was cooking ... was reading",
    "duration": 12
  },
  {
    "text": "**最大坑 ①**：while 后用了过去式。~~While I read, Tom watched TV.~~ → **While I was reading, Tom was watching TV.**",
    "show": "✗ While I read ...   ✓ While I was reading ...",
    "highlight": "was reading",
    "duration": 12
  },
  {
    "text": "**最大坑 ②**：when 后用了进行时。~~When the phone was ringing~~ → **When the phone rang**.",
    "show": "✗ When ... was ringing   ✓ When ... rang",
    "highlight": "rang",
    "duration": 11
  },
  {
    "text": "三秒判断：哪个动作**长**？while + 进行时。哪个**短**？when + 过去式。下一关进入实战。",
    "show": "long → while + -ing   |   short → when + past",
    "highlight": "long ... short",
    "duration": 9
  }
]$jsonb$::jsonb
WHERE code = 'g8.21';


DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.21')
  AND sort_order BETWEEN 9000 AND 9099;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.21')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  (
    'I ___ TV when the doorbell ___.',
    'mcq', 'watched / rang', 'was watching / rang', 'was watching / was ringing', 'watched / was ringing', 'B',
    NULL::text[],
    '长动作（看电视）被短突发（门铃）打断 → 长用进行时 was watching，短用过去式 rang。',
    '{}'::jsonb, NULL, 'when_short_action', false, 1, 9000
  ),
  (
    '___ I ___ along the river, I ___ a beautiful bird.',
    'mcq', 'When / walked / saw', 'While / was walking / saw', 'While / walked / saw', 'When / was walking / was seeing', 'B',
    NULL::text[],
    'while 引导长动作（散步）+ 主句短动作（看到鸟）→ while + was walking + saw。',
    '{}'::jsonb, NULL, 'while_long_action', false, 2, 9001
  ),
  (
    '___ Mom ___ supper, Dad ___ a newspaper.',
    'mcq', 'When / cooked / read', 'While / was cooking / was reading', 'While / cooked / was reading', 'When / was cooking / read', 'B',
    NULL::text[],
    '两个长动作同时进行 → while 引导 + 两边都进行时。',
    '{}'::jsonb, NULL, 'while_parallel_actions', false, 2, 9002
  ),
  (
    'My little sister ___ when our dog suddenly ___ into the room.',
    'mcq', 'slept / ran', 'was sleeping / was running', 'was sleeping / ran', 'slept / was running', 'C',
    NULL::text[],
    '长（睡觉）被短（突然跑进来）打断 → was sleeping + ran。',
    '{}'::jsonb, NULL, 'when_interrupted', false, 2, 9003
  ),

  (
    'While I ____ (read) in the library, my friend ____ (call) my name.',
    'fill', NULL, NULL, NULL, NULL, 'was reading / called',
    ARRAY['was reading / called']::text[],
    'while 长动作（读书）+ 短突发（叫名字）→ was reading + called。',
    '{}'::jsonb, NULL, 'while_short_break', false, 2, 9004
  ),
  (
    'When the earthquake ____ (happen), the students ____ (study) in the classroom.',
    'fill', NULL, NULL, NULL, NULL, 'happened / were studying',
    ARRAY['happened / were studying']::text[],
    '地震发生（短突发）+ 学生学习（长动作）→ happened + were studying。',
    '{}'::jsonb, NULL, 'when_short_long', false, 2, 9005
  ),
  (
    'At 8 last night, Lin and her sister ____ (watch) a film together.',
    'fill', NULL, NULL, NULL, NULL, 'were watching',
    ARRAY['were watching']::text[],
    'at 8 last night = 过去某一刻 + 主语复数 → were watching。',
    '{}'::jsonb, NULL, 'past_continuous_time', false, 1, 9006
  ),

  (
    '合并成一句（用 when）：  "I was reading. The phone rang."',
    'transform', NULL, NULL, NULL, NULL, 'I was reading when the phone rang.',
    ARRAY[
      'I was reading when the phone rang.',
      'When the phone rang, I was reading.'
    ]::text[],
    '长（读书）+ 短（电话响）→ when 引导短动作。',
    '{}'::jsonb, NULL, 'when_combine', true, 2, 9007
  ),
  (
    '合并成一句（用 while）：  "Mom was cooking. I was doing my homework."',
    'transform', NULL, NULL, NULL, NULL, 'While Mom was cooking, I was doing my homework.',
    ARRAY[
      'While Mom was cooking, I was doing my homework.',
      'Mom was cooking while I was doing my homework.'
    ]::text[],
    '两个长动作同时进行 → while 引导其中一个。',
    '{}'::jsonb, NULL, 'while_combine', true, 2, 9008
  ),

  (
    '改错：  "While I read a book, Tom watched TV."',
    'correction', NULL, NULL, NULL, NULL, 'While I was reading a book, Tom was watching TV.',
    ARRAY[
      'While I was reading a book, Tom was watching TV.'
    ]::text[],
    'while 引导两个长动作同时进行 → 两边都用过去进行时。',
    '{}'::jsonb, NULL, 'while_both_continuous', true, 2, 9009
  ),
  (
    '改错：  "When the phone was ringing, I was cooking dinner."',
    'correction', NULL, NULL, NULL, NULL, 'When the phone rang, I was cooking dinner.',
    ARRAY[
      'When the phone rang, I was cooking dinner.'
    ]::text[],
    'when 后接短突发动作（电话响）→ 用一般过去时 rang。',
    '{}'::jsonb, NULL, 'when_no_continuous', true, 3, 9010
  ),

  (
    '把这句话译成英文：地震发生的时候，我正在学校的食堂吃午饭。',
    'translation', NULL, NULL, NULL, NULL, 'When the earthquake happened, I was having lunch in the school cafeteria.',
    ARRAY[
      'When the earthquake happened, I was having lunch in the school cafeteria.',
      'I was having lunch in the school cafeteria when the earthquake happened.',
      'When the earthquake struck, I was eating lunch in the school dining hall.',
      'I was eating lunch in the school cafeteria when the earthquake hit.'
    ]::text[],
    '考点：① 地震发生（短突发）+ 我在吃饭（长动作）→ when + happened + was having；② "学校食堂"= school cafeteria / dining hall。',
    '{}'::jsonb, '更地道：have lunch 比 eat lunch 更标准；school cafeteria 是美式，dining hall 是英式。', 'when_translation', true, 3, 9011
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
  SELECT id, content_depth INTO v_point_id, v_depth FROM junior_grammar_points WHERE code = 'g8.21';
  IF v_point_id IS NULL THEN
    RAISE EXCEPTION 'Gold-standard migration failed: junior_grammar_points row with code=''g8.21'' does not exist.';
  END IF;
  IF v_depth <> 3 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: content_depth for g8.21 is %, expected 3.', v_depth;
  END IF;
  SELECT count(*) INTO v_q_count
  FROM junior_grammar_questions
  WHERE point_id = v_point_id AND sort_order BETWEEN 9000 AND 9099;
  IF v_q_count <> 12 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: expected 12 questions for g8.21, got %.', v_q_count;
  END IF;
  RAISE NOTICE 'Gold-standard migration for g8.21 verified: content_depth=3, % questions seeded.', v_q_count;
END $$;


-- ╔════════════════════════════════════════════════════════════════════╗
-- ║ FILE: 20260523120000_g8_06_indefinite_pronouns_gold_standard.sql
-- ╚════════════════════════════════════════════════════════════════════╝
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
      "trap": "选 D 回答用 Anything 意思不对（\"任何\"）。其他选项词头匹配错。",
      "why":  "疑问句用 **anything**；回答\"没事\"用 **Nothing**（自带否定，简短回答固定搭配）。"
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
    '{}'::jsonb, NULL, 'indefinite_adj_after', false, 1, 9000
  ),
  (
    '— Did you see ___ on your way to school?\n— No, I saw ___.',
    'mcq', 'anybody / nobody', 'somebody / anybody', 'anybody / anybody', 'nobody / anybody', 'A',
    NULL::text[],
    '疑问句用 anybody；回答"没看到任何人"用 nobody（自带否定，简短回答常用）。',
    '{}'::jsonb, NULL, 'indefinite_question_negative', false, 2, 9001
  ),
  (
    '___ in our class likes the new English teacher.',
    'mcq', 'Everybody', 'Anybody', 'Somebody', 'Nobody', 'A',
    NULL::text[],
    '"全班都喜欢"→ Everybody。likes 单数动词体现 Everybody 视为单数。',
    '{}'::jsonb, NULL, 'indefinite_every', false, 1, 9002
  ),
  (
    'There isn''t ___ interesting on TV tonight.',
    'mcq', 'something', 'anything', 'nothing', 'everything', 'B',
    NULL::text[],
    '否定句 isn''t → 用 **anything**；不能用 nothing（双重否定）。',
    '{}'::jsonb, NULL, 'indefinite_negative_any', false, 2, 9003
  ),

  (
    'I have ____ to tell you. It''s a secret.',
    'fill', NULL, NULL, NULL, NULL, 'something',
    ARRAY['something']::text[],
    '肯定句 → some-；告诉秘密 = something。',
    '{}'::jsonb, NULL, 'indefinite_positive', false, 1, 9004
  ),
  (
    '____ knows where Tom went. Maybe he is at home.',
    'fill', NULL, NULL, NULL, NULL, 'Nobody',
    ARRAY['Nobody', 'No one']::text[],
    '"没人知道"= Nobody / No one；后接单数动词 knows。',
    '{}'::jsonb, NULL, 'indefinite_negative_subject', false, 2, 9005
  ),
  (
    'Look outside. Is there ____ wrong with the bus?',
    'fill', NULL, NULL, NULL, NULL, 'anything',
    ARRAY['anything']::text[],
    '疑问句 → anything；询问"有什么不对" = Is there anything wrong。',
    '{}'::jsonb, NULL, 'indefinite_question', false, 1, 9006
  ),

  (
    '改写为不定代词句：  "I bought a hot drink."（用 something）',
    'transform', NULL, NULL, NULL, NULL, 'I bought something hot to drink.',
    ARRAY[
      'I bought something hot to drink.',
      'I got something hot to drink.'
    ]::text[],
    '形容词 hot 后置；to drink 作定语后置。',
    '{}'::jsonb, NULL, 'indefinite_transform', true, 2, 9007
  ),
  (
    '改写为否定句：  "Everybody likes the new song."',
    'transform', NULL, NULL, NULL, NULL, 'Nobody likes the new song.',
    ARRAY[
      'Nobody likes the new song.',
      'No one likes the new song.'
    ]::text[],
    'Everybody → Nobody（反义）；动词保持单数 likes。',
    '{}'::jsonb, NULL, 'indefinite_opposite', true, 2, 9008
  ),

  (
    '改错：  "I want delicious something for lunch."',
    'correction', NULL, NULL, NULL, NULL, 'I want something delicious for lunch.',
    ARRAY[
      'I want something delicious for lunch.'
    ]::text[],
    '形容词必须放在不定代词**后面**。',
    '{}'::jsonb, NULL, 'indefinite_adj_position', true, 1, 9009
  ),
  (
    '改错：  "Nobody didn''t see the accident yesterday."',
    'correction', NULL, NULL, NULL, NULL, 'Nobody saw the accident yesterday.',
    ARRAY[
      'Nobody saw the accident yesterday.'
    ]::text[],
    'Nobody 已含否定，不能再加 didn''t（双重否定）。',
    '{}'::jsonb, NULL, 'indefinite_double_negative', true, 2, 9010
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
    '{}'::jsonb, '注意：has everyone（不是 have everyone）— everyone 视为单数。', 'indefinite_translation', true, 3, 9011
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


-- ╔════════════════════════════════════════════════════════════════════╗
-- ║ FILE: 20260523130000_g8_11_infinitive_gold_standard.sql
-- ╚════════════════════════════════════════════════════════════════════╝
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


-- ╔════════════════════════════════════════════════════════════════════╗
-- ║ FILE: 20260523140000_g8_12_gerund_gold_standard.sql
-- ╚════════════════════════════════════════════════════════════════════╝
-- =====================================================================
-- Gold-standard content for G8 · 动名词 · Gerund (V-ing as noun)
-- Code: g8.12   Category: verb
-- =====================================================================
-- V-ing as subject/object, enjoy/finish/mind/practice + ing,
-- 介词后 + V-ing, stop to do vs stop doing (the famous trap).
-- =====================================================================

UPDATE junior_grammar_points
SET
  summary = '"V-ing" 当名词用 — enjoy / finish / mind / be good at 后面必须跟它，中考写作高频。',
  hook_line_cn = '动名词 = 把动词变成名词。enjoy / finish / mind + ing，介词后 + ing，固定搭配一抓一大把。',
  hook_line = 'Gerund — turning a verb into a noun. The "doing" world of 中考 fixed phrases.',
  mnemonic = 'enjoy / finish / mind / practice + doing；介词后 + doing；stop to do（停下去做）≠ stop doing（停止做）。',
  content_depth = 3,

  explanation_md = E'## 🎯 一句话搞定\n\n**动名词 = 动词 + ing**，当**名词**用，可以作主语、宾语、表语。\n\n---\n\n## 📐 4 大使用场景（中考必背）\n\n### ① 作主语（视为**单数**）\n- **Reading** English every day **is** important.（不是 are）\n- **Playing** football **is** fun.\n- **Learning** a foreign language **helps** the brain.\n\n### ② 作宾语 — "动词 + V-ing" 固定搭配（必背）\n\n| 动词 | 例子 |\n|---|---|\n| **enjoy** | I **enjoy listening** to music. |\n| **finish** | She **finished writing** the essay. |\n| **mind** | Would you **mind opening** the window? |\n| **practice** | We **practice speaking** English every day. |\n| **keep** | Keep **trying**! |\n| **give up** | He **gave up smoking**. |\n| **avoid** | She **avoided meeting** him. |\n| **suggest** | I **suggest going** by bike. |\n| **can''t help** | I **can''t help laughing**. |\n| **be busy** | He **is busy studying**. |\n\n### ③ **介词后**永远用 V-ing\n固定搭配：\n- **be good at + V-ing**：She is good at **singing**.\n- **be interested in + V-ing**：I''m interested in **learning** Spanish.\n- **thank you for + V-ing**：Thank you for **helping** me.\n- **look forward to + V-ing**（注意：这里 to 是介词！）：I look forward to **seeing** you.\n- **instead of + V-ing**：I went swimming instead of **studying**.\n\n### ④ 作表语 — "is + V-ing"（强调动作本身）\n- My hobby **is reading**.\n- The most important thing **is staying** healthy.\n\n---\n\n## 🔥 经典对比：stop to do vs stop doing（中考最爱考！）\n\n| 句型 | 含义 | 例子 |\n|---|---|---|\n| **stop to do** | 停下来去做（另一件事） | He **stopped to smoke**.（停下手头事去抽烟）|\n| **stop doing** | 停止做（本来在做的事） | He **stopped smoking**.（戒烟了）|\n\n类似的还有：\n- **forget to do**（忘了去做）vs **forget doing**（忘了已做过）\n- **remember to do**（记得要去做）vs **remember doing**（记得做过）\n\n---\n\n## ⏰ 看到这些 = 用动名词\n\n- enjoy / finish / mind / practice / keep / give up + **V-ing**\n- 任何**介词后**（at / in / of / for / about / to ... ） + **V-ing**\n- 主语位置上"做某事"= **V-ing**（视为单数）\n- be busy / be worth / it''s no use + **V-ing**\n\n---\n\n## ⚠️ Top 5 易错点（中考批卷红笔常出现）\n\n1. **enjoy / finish 后用 to do**：~~I enjoy to listen to music.~~ → **I enjoy listening to music.**\n2. **介词后用动词原形**：~~Thank you for help me.~~ → **Thank you for helping me.**\n3. **look forward to 后跟原形**（最大陷阱！to 在这里是介词）：~~I look forward to see you.~~ → **I look forward to seeing you.**\n4. **stop to do vs stop doing 用反**：场景是"戒烟"（停止做）→ stopped **smoking**，不是 stopped to smoke。\n5. **动名词作主语用复数动词**：~~Reading books are fun.~~ → **Reading books is fun.**（动名词作主语视为单数）\n\n---\n\n## 🧠 三秒判断口诀\n\n> ① enjoy / finish / mind / practice / keep / give up / avoid → **+ doing**  \n> ② 任何**介词**（at / in / of / for / about / **to**当介词）→ **+ doing**  \n> ③ 动名词作主语 → 视为**单数**（is / has）  \n> ④ stop **to do** = 停下去做；stop **doing** = 停止做',

  immersion_cards = $jsonb$[
    {"situation": "Sharing your hobby with a new friend", "cn": "我喜欢听音乐和读书。", "en": "I enjoy listening to music and reading."},
    {"situation": "Mom asks if you''re done with homework", "cn": "我刚做完作业。", "en": "I have just finished doing my homework."},
    {"situation": "Asking politely to open a window", "cn": "您介意打开窗户吗？", "en": "Would you mind opening the window?"},
    {"situation": "Telling your tutor what you''re good at", "cn": "我擅长解数学题。", "en": "I''m good at solving math problems."},
    {"situation": "Ending a letter to a pen pal", "cn": "期待早日见到你。", "en": "I look forward to seeing you soon."},
    {"situation": "Mom''s decision after years of struggling", "cn": "爸爸终于戒烟了。", "en": "Dad finally gave up smoking."}
  ]$jsonb$::jsonb,

  contrast_table = $jsonb$[
    {"lhs": "I enjoy to listen to pop music.",                   "rhs": "I enjoy listening to pop music."},
    {"lhs": "Thank you for help me with my homework.",            "rhs": "Thank you for helping me with my homework."},
    {"lhs": "I look forward to see you again.",                   "rhs": "I look forward to seeing you again."},
    {"lhs": "Reading books are good for the brain.",              "rhs": "Reading books is good for the brain."},
    {"lhs": "Dad stopped to smoke and is much healthier.",        "rhs": "Dad stopped smoking and is much healthier."},
    {"lhs": "She is busy to prepare for the exam.",               "rhs": "She is busy preparing for the exam."}
  ]$jsonb$::jsonb,

  reflex_cards = $jsonb$[
    {"cn": "我喜欢唱歌和跳舞。",              "en": "I enjoy singing and dancing.",                  "keyword": "enjoy singing"},
    {"cn": "你介意开下灯吗？",                "en": "Would you mind turning on the light?",          "keyword": "mind turning"},
    {"cn": "他擅长打篮球。",                  "en": "He is good at playing basketball.",             "keyword": "good at playing"},
    {"cn": "谢谢你帮我。",                    "en": "Thank you for helping me.",                     "keyword": "for helping"},
    {"cn": "学英语对你有帮助。",              "en": "Learning English is helpful for you.",          "keyword": "Learning English is"},
    {"cn": "他戒掉了打游戏。",                "en": "He gave up playing video games.",               "keyword": "gave up playing"},
    {"cn": "妈妈忙着做饭。",                  "en": "Mom is busy cooking.",                          "keyword": "busy cooking"},
    {"cn": "我期待你的回信。",                "en": "I look forward to hearing from you.",           "keyword": "look forward to hearing"}
  ]$jsonb$::jsonb,

  situation_drills = $jsonb$[
    {
      "situation": "Telling a new pen pal about your favorite hobbies.",
      "cn": "我喜欢看书、听音乐和踢足球。",
      "en": "I enjoy reading, listening to music, and playing football.",
      "accepted": [
        "I like reading, listening to music, and playing soccer.",
        "My hobbies are reading, music, and football."
      ]
    },
    {
      "situation": "Asking your seatmate to lend you a pencil during a quiet exam.",
      "cn": "你介意借我一支铅笔吗？",
      "en": "Would you mind lending me a pencil?",
      "accepted": [
        "Could you lend me a pencil, please?",
        "Do you mind lending me a pencil?"
      ]
    },
    {
      "situation": "Ending an email to your foreign friend who promised to visit.",
      "cn": "我特别期待七月见到你。",
      "en": "I''m really looking forward to seeing you in July.",
      "accepted": [
        "I can''t wait to see you in July.",
        "Looking forward to seeing you next July."
      ]
    },
    {
      "situation": "Telling your dad how you finally finished a difficult project.",
      "cn": "我坚持每天做一点，终于完成了。",
      "en": "I kept working on it a little every day, and I finally finished it.",
      "accepted": [
        "By doing a bit every day, I eventually finished it.",
        "I just kept at it daily and eventually got it done."
      ]
    }
  ]$jsonb$::jsonb,

  correction_tasks = $jsonb$[
    {
      "wrong": "I enjoy to listen to music after class.",
      "model": "I enjoy listening to music after class.",
      "hint":  "enjoy + V-ing",
      "why":   "**enjoy / finish / mind / practice + V-ing**（不接 to do）。"
    },
    {
      "wrong": "Thank you for help me yesterday.",
      "model": "Thank you for helping me yesterday.",
      "hint":  "for 后用 V-ing",
      "why":   "**介词 for** 后面要用 **V-ing**，不能用动词原形。"
    },
    {
      "wrong": "I''m looking forward to see you again.",
      "model": "I''m looking forward to seeing you again.",
      "hint":  "look forward to 中的 to 是介词",
      "why":   "**look forward to 的 to 是介词**（不是不定式），后面必须用 **V-ing**。这是中考最大陷阱！"
    },
    {
      "wrong": "Reading English books are very useful.",
      "model": "Reading English books is very useful.",
      "hint":  "动名词主语单数",
      "why":   "**动名词作主语视为第三人称单数** → is / has。即使后面接复数名词（books），主语依然单数。"
    },
    {
      "wrong": "He stopped to smoke and his health improved a lot.",
      "model": "He stopped smoking and his health improved a lot.",
      "hint":  "戒烟 = stop doing",
      "why":   "**stop to do** = 停下来去做（另一件事）；**stop doing** = 戒掉 / 停止做。语境是戒烟 → stop **smoking**。"
    },
    {
      "wrong": "Mom is busy to cook dinner.",
      "model": "Mom is busy cooking dinner.",
      "hint":  "be busy + V-ing",
      "why":   "**be busy + V-ing** 是固定搭配（\"忙着做某事\"）。"
    }
  ]$jsonb$::jsonb,

  boss_questions = $jsonb$[
    {
      "stem": "Would you mind ___ the music? It''s too loud.",
      "option_a": "to turn down",
      "option_b": "turning down",
      "option_c": "turn down",
      "option_d": "turned down",
      "correct_answer": "B",
      "trap": "选 A 是中考最常见错。mind 后必须 + V-ing。",
      "why":  "**mind + V-ing** 是固定搭配。"
    },
    {
      "stem": "Thank you for ___ me to my favorite restaurant.",
      "option_a": "to take",
      "option_b": "take",
      "option_c": "taking",
      "option_d": "took",
      "correct_answer": "C",
      "trap": "选 A 加 to — 错。介词 for 后必须 + V-ing。",
      "why":  "**介词后用 V-ing**：for + **taking**。"
    },
    {
      "stem": "I''m really looking forward to ___ my new English teacher next Monday.",
      "option_a": "meet",
      "option_b": "meeting",
      "option_c": "to meet",
      "option_d": "met",
      "correct_answer": "B",
      "trap": "选 A/C 都把 to 当不定式 — 这里 to 是介词！中考最大陷阱。",
      "why":  "**look forward to + V-ing**（to 是介词）→ meeting。"
    },
    {
      "stem": "Dad ___ smoking three years ago, and his health has improved a lot.",
      "option_a": "stopped to smoke",
      "option_b": "stopped smoking",
      "option_c": "stop smoking",
      "option_d": "stops smoking",
      "correct_answer": "B",
      "trap": "选 A 完全反义（停下来去抽）。选 C/D 时态错（3 年前 = 过去时）。",
      "why":  "**stop smoking** = 戒烟；语境提到健康改善确认是\"戒掉\"，不是\"停下手头事去抽\"。"
    }
  ]$jsonb$::jsonb

WHERE code = 'g8.12';


UPDATE junior_grammar_points SET teacher_script = $jsonb$[
  {
    "text": "今天解锁**动名词**（V-ing 当名词）。中考写作里 enjoy / finish / mind 这些固定搭配的根。",
    "show": "🎯 Today: V-ing as a NOUN",
    "duration": 9
  },
  {
    "text": "**核心 ①** 作宾语：**enjoy / finish / mind / practice / keep + V-ing**。必背搭配。",
    "show": "enjoy / finish / mind / practice + V-ing",
    "highlight": "+ V-ing",
    "duration": 11
  },
  {
    "text": "**核心 ②** **介词后永远 + V-ing**：be good at, thank you for, look forward to ...",
    "show": "be good at singing   thank you for helping",
    "highlight": "for helping",
    "duration": 11
  },
  {
    "text": "**最大坑**：**look forward to 的 to 是介词**！to **seeing**, to **meeting**, to **hearing**。",
    "show": "✗ look forward to see   ✓ look forward to seeing",
    "highlight": "to seeing",
    "duration": 13
  },
  {
    "text": "**核心 ③** 作主语：**Reading English is** important.（视为单数 → is，不是 are）",
    "show": "Reading English is important.",
    "highlight": "is",
    "duration": 11
  },
  {
    "text": "**经典对比**：**stop to do** = 停下来去做另一件事；**stop doing** = 戒掉、停止做。",
    "show": "stop to smoke ≠ stop smoking",
    "highlight": "stop smoking",
    "duration": 13
  },
  {
    "text": "**和不定式对比**：want / hope / plan + **to do**；enjoy / finish / mind + **V-ing**。两套搭配分开记。",
    "show": "want to do   |   enjoy doing",
    "highlight": "to do ... doing",
    "duration": 12
  },
  {
    "text": "理论讲完。下一关进入 6 个真实场景。",
    "show": "Next → 6 Real-life Scenarios 📚",
    "duration": 7
  }
]$jsonb$::jsonb
WHERE code = 'g8.12';


DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.12')
  AND sort_order BETWEEN 9000 AND 9099;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.12')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  (
    'I enjoy ___ stories to my little brother before bed.',
    'mcq', 'to tell', 'telling', 'tell', 'told', 'B',
    NULL::text[],
    'enjoy + V-ing。',
    '{}'::jsonb, NULL, 'gerund_enjoy', false, 1, 9000
  ),
  (
    'She is good at ___ math problems quickly.',
    'mcq', 'to solve', 'solve', 'solving', 'solved', 'C',
    NULL::text[],
    'be good at + V-ing（介词 at 后用 V-ing）。',
    '{}'::jsonb, NULL, 'gerund_preposition', false, 1, 9001
  ),
  (
    'Look forward to ___ from you soon.',
    'mcq', 'hear', 'hearing', 'to hear', 'heard', 'B',
    NULL::text[],
    'look forward to 的 to 是介词 → V-ing。中考最大陷阱。',
    '{}'::jsonb, NULL, 'gerund_look_forward_to', false, 2, 9002
  ),
  (
    'My dad ___ smoking five years ago, and now he is much healthier.',
    'mcq', 'stopped to', 'stopped', 'stop', 'stops', 'B',
    NULL::text[],
    '语境是戒烟 → stop + V-ing；过去时 5 years ago → stopped。',
    '{}'::jsonb, NULL, 'gerund_stop_doing', false, 3, 9003
  ),

  (
    'Would you mind ____ (close) the door?',
    'fill', NULL, NULL, NULL, NULL, 'closing',
    ARRAY['closing']::text[],
    'mind + V-ing。',
    '{}'::jsonb, NULL, 'gerund_mind', false, 1, 9004
  ),
  (
    'Tom is busy ____ (prepare) for the entrance exam.',
    'fill', NULL, NULL, NULL, NULL, 'preparing',
    ARRAY['preparing']::text[],
    'be busy + V-ing。',
    '{}'::jsonb, NULL, 'gerund_be_busy', false, 2, 9005
  ),
  (
    '____ (read) English novels has helped me a lot.',
    'fill', NULL, NULL, NULL, NULL, 'Reading',
    ARRAY['Reading']::text[],
    '动名词作主语 → Reading。注意单数动词 has。',
    '{}'::jsonb, NULL, 'gerund_subject', false, 2, 9006
  ),

  (
    '改写：  "I am interested in computer games. I play them every day."',
    'transform', NULL, NULL, NULL, NULL, 'I am interested in playing computer games every day.',
    ARRAY[
      'I am interested in playing computer games every day.'
    ]::text[],
    'be interested in + V-ing 合并两句。',
    '{}'::jsonb, NULL, 'gerund_combine', true, 2, 9007
  ),
  (
    '改写为动名词作主语：  "It is fun to play volleyball with friends."',
    'transform', NULL, NULL, NULL, NULL, 'Playing volleyball with friends is fun.',
    ARRAY[
      'Playing volleyball with friends is fun.'
    ]::text[],
    'It is + adj + to do = 动名词作主语 + is + adj。',
    '{}'::jsonb, NULL, 'gerund_subject_transform', true, 3, 9008
  ),

  (
    '改错：  "Thank you for help me with my English."',
    'correction', NULL, NULL, NULL, NULL, 'Thank you for helping me with my English.',
    ARRAY[
      'Thank you for helping me with my English.'
    ]::text[],
    '介词 for 后用 V-ing。',
    '{}'::jsonb, NULL, 'gerund_preposition_for', true, 1, 9009
  ),
  (
    '改错：  "I am looking forward to meet you next Sunday."',
    'correction', NULL, NULL, NULL, NULL, 'I am looking forward to meeting you next Sunday.',
    ARRAY[
      'I am looking forward to meeting you next Sunday.'
    ]::text[],
    'look forward to 的 to 是介词 → meeting。',
    '{}'::jsonb, NULL, 'gerund_look_forward_to_trap', true, 2, 9010
  ),

  (
    '把这句话译成英文：我每天坚持写英文日记，这帮助我提高了写作水平。',
    'translation', NULL, NULL, NULL, NULL, 'I keep writing English diaries every day, and this has helped me improve my writing.',
    ARRAY[
      'I keep writing English diaries every day, and this has helped me improve my writing.',
      'I keep writing in an English diary every day, which has helped me improve my writing.',
      'Writing an English diary every day has helped me improve my writing skills.'
    ]::text[],
    '考点：① keep + V-ing（继续做）；② "帮助我提高"= help me improve（help 后可省 to）；③ 现在完成时表持续影响 has helped。',
    '{}'::jsonb, '更地道：keep doing 比 keep on doing 更常用；help me (to) improve 中 to 常省略。', 'gerund_translation', true, 3, 9011
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
  SELECT id, content_depth INTO v_point_id, v_depth FROM junior_grammar_points WHERE code = 'g8.12';
  IF v_point_id IS NULL THEN
    RAISE EXCEPTION 'Gold-standard migration failed: junior_grammar_points row with code=''g8.12'' does not exist.';
  END IF;
  IF v_depth <> 3 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: content_depth for g8.12 is %, expected 3.', v_depth;
  END IF;
  SELECT count(*) INTO v_q_count
  FROM junior_grammar_questions
  WHERE point_id = v_point_id AND sort_order BETWEEN 9000 AND 9099;
  IF v_q_count <> 12 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: expected 12 questions for g8.12, got %.', v_q_count;
  END IF;
  RAISE NOTICE 'Gold-standard migration for g8.12 verified: content_depth=3, % questions seeded.', v_q_count;
END $$;


-- ╔════════════════════════════════════════════════════════════════════╗
-- ║ FILE: 20260523150000_g8_18_should_gold_standard.sql
-- ╚════════════════════════════════════════════════════════════════════╝
-- =====================================================================
-- Gold-standard content for G8 · should / shouldn''t · Modal: should
-- Code: g8.18   Category: verb
-- =====================================================================
-- Advice modal — the foundation for giving suggestions in 中考 writing.
-- =====================================================================

UPDATE junior_grammar_points
SET
  summary = '"应该……" / "不应该……" — 给建议、提醒、表态度的万能万圣武器，中考写作建议类作文必用。',
  hook_line_cn = '中考"给建议"类作文的核心动词。背熟 4 个固定句型，建议文模板秒拼。',
  hook_line = 'Should — the single most useful modal for any 中考 advice essay.',
  mnemonic = 'should + 动词原形；情态动词无人称变化，疑问句 should 提前。',
  content_depth = 3,

  explanation_md = E'## 🎯 一句话搞定\n\n**应该 / 建议** → 用 **should + 动词原形**；**不应该** → **shouldn''t + 动词原形**。\n\n---\n\n## 📐 核心公式\n\n| 句型 | 公式 | 例子 |\n|---|---|---|\n| 肯定 | 主语 + **should** + 动词原形 | You **should drink** more water. |\n| 否定 | 主语 + **shouldn''t** + 动词原形 | Children **shouldn''t stay up** late. |\n| 一般疑问 | **Should** + 主语 + 动词原形 ? | **Should I bring** an umbrella? |\n| 特殊疑问 | 疑问词 + **should** + 主语 + 动词原形 ? | What **should I do** now? |\n\n> ⚠️ **铁律**：should 是**情态动词** → 后面**永远直接接动词原形**，且**没有人称变化**（he should，不是 he shoulds）。\n\n---\n\n## 🔥 4 大经典用法\n\n### ① 给建议（最常见）\n- You **should eat** more vegetables.\n- You **shouldn''t play** too many games.\n\n### ② 表义务 / 责任\n- Students **should respect** their teachers.\n- We **should help** people in need.\n\n### ③ 表推测 / 应该（"按理应该……"）\n- He **should be** home now.（按理他应该到家了）\n- The book **should be** in the drawer.\n\n### ④ 提出建议 / 询问对方意见\n- **Should we go** to the cinema tonight?\n- **What should I do** about my poor English?\n\n---\n\n## ⏰ 看到这些 = should 题\n\n- 问"我该怎么办" = **What should I do?**\n- 给建议 / 提醒（中考作文里）= **You should ... / You shouldn''t ...**\n- 提建议 / 试探口气 = **Should we / Should I ...?**\n- 客观推测 / 按理应该 = **It should be ...**\n\n---\n\n## 🔥 中考建议作文 5 大模板句\n\n1. **You should + 动词原形**：You **should keep** a positive attitude.\n2. **You shouldn''t + 动词原形**：You **shouldn''t worry** too much.\n3. **It''s a good idea to + 动词原形**：It''s a good idea **to make a plan**.\n4. **Why don''t you + 动词原形 ?**：Why don''t you **join a club**?\n5. **You''d better + 动词原形** (= had better)：You''**d better** sleep earlier.\n\n---\n\n## ⚠️ Top 5 易错点（中考批卷红笔常出现）\n\n1. **should 后加 to**：~~You should to eat fruit.~~ → **You should eat fruit.**\n2. **第三人称单数加 -s**：~~He shoulds come early.~~ → **He should come early.**\n3. **shouldn''t 写成 should not''t**：~~She should not''t go.~~ → **She shouldn''t go.**\n4. **疑问句忘了把 should 提前**：~~You should do what?~~ → **What should you do?**\n5. **否定回答错**：~~No, you should.~~ → **No, you shouldn''t.**\n\n---\n\n## 🧠 三秒判断口诀\n\n> ① 给建议 / 提醒 → **You should / shouldn''t + 动词原形**  \n> ② 疑问句 → **Should + 主语 + 动词原形 ?**  \n> ③ should **后面永远直接接动词原形**，没有人称变化',

  immersion_cards = $jsonb$[
    {"situation": "Friend tells you they''re tired all the time", "cn": "你应该早点睡觉。", "en": "You should go to bed earlier."},
    {"situation": "Mom advises about screen time", "cn": "孩子们不应该一直盯着手机。", "en": "Children shouldn''t stare at their phones all the time."},
    {"situation": "You feel sick and ask Mom for advice", "cn": "我该不该看医生？", "en": "Should I see a doctor?"},
    {"situation": "Encouraging a friend who failed a test", "cn": "你应该再试一次。", "en": "You should try again."},
    {"situation": "Tutor''s top tip for English", "cn": "你应该每天读英文 30 分钟。", "en": "You should read English for 30 minutes every day."},
    {"situation": "Asking peer for help on a homework topic", "cn": "我该怎么提高写作？", "en": "What should I do to improve my writing?"}
  ]$jsonb$::jsonb,

  contrast_table = $jsonb$[
    {"lhs": "You should to eat more fruit.",                "rhs": "You should eat more fruit."},
    {"lhs": "He shoulds come earlier.",                      "rhs": "He should come earlier."},
    {"lhs": "She should not''t play too many games.",         "rhs": "She shouldn''t play too many games."},
    {"lhs": "You should do what about it?",                  "rhs": "What should you do about it?"},
    {"lhs": "— Should I bring an umbrella?\n— No, you should.","rhs": "— Should I bring an umbrella?\n— No, you shouldn''t."},
    {"lhs": "He should goes home now.",                      "rhs": "He should go home now."}
  ]$jsonb$::jsonb,

  reflex_cards = $jsonb$[
    {"cn": "你应该多锻炼。",                  "en": "You should exercise more.",                     "keyword": "should exercise"},
    {"cn": "你不应该熬夜。",                  "en": "You shouldn''t stay up late.",                  "keyword": "shouldn''t stay up"},
    {"cn": "我该穿什么？",                    "en": "What should I wear?",                           "keyword": "What should I wear"},
    {"cn": "孩子们应该尊敬老师。",            "en": "Children should respect their teachers.",       "keyword": "should respect"},
    {"cn": "你最好早点出门。",                "en": "You''d better leave earlier.",                  "keyword": "''d better leave"},
    {"cn": "我该不该告诉妈妈？",              "en": "Should I tell Mom?",                            "keyword": "Should I tell"},
    {"cn": "他不应该撒谎。",                  "en": "He shouldn''t tell lies.",                      "keyword": "shouldn''t tell"},
    {"cn": "学生应该认真听课。",              "en": "Students should listen carefully in class.",    "keyword": "should listen"}
  ]$jsonb$::jsonb,

  situation_drills = $jsonb$[
    {
      "situation": "Your foreign pen pal tells you they want to improve their Chinese fast.",
      "cn": "你应该每天和中国朋友聊天，看一些中文动画。",
      "en": "You should chat with Chinese friends every day and watch some Chinese cartoons.",
      "accepted": [
        "You should talk with Chinese friends daily and watch Chinese cartoons.",
        "Try chatting with Chinese friends and watching Chinese cartoons every day."
      ]
    },
    {
      "situation": "A classmate keeps yawning in math class.",
      "cn": "你不应该熬夜玩游戏，太累了。",
      "en": "You shouldn''t stay up playing games — you''re too tired.",
      "accepted": [
        "You shouldn''t play games so late at night; it''s making you tired.",
        "Stop staying up late playing games — look at you, exhausted."
      ]
    },
    {
      "situation": "You missed a class and ask the teacher how to catch up.",
      "cn": "我应该做些什么来赶上进度？",
      "en": "What should I do to catch up with the class?",
      "accepted": [
        "What can I do to catch up with the others?",
        "How should I catch up on what I missed?"
      ]
    },
    {
      "situation": "Writing a short advice paragraph for younger students about exam prep.",
      "cn": "你应该每天复习半小时，不应该到最后才开始。",
      "en": "You should review for half an hour every day. You shouldn''t leave it until the last minute.",
      "accepted": [
        "Review 30 minutes daily and don''t leave everything until the last minute.",
        "You should review a little every day instead of waiting till the last moment."
      ]
    }
  ]$jsonb$::jsonb,

  correction_tasks = $jsonb$[
    {
      "wrong": "You should to drink more water in summer.",
      "model": "You should drink more water in summer.",
      "hint":  "should 后接动词原形",
      "why":   "**should 是情态动词**，后面**直接接动词原形**（不加 to）。"
    },
    {
      "wrong": "He shoulds finish his homework before dinner.",
      "model": "He should finish his homework before dinner.",
      "hint":  "情态动词无人称变化",
      "why":   "**情态动词没有第三人称单数 -s**。永远是 should，不是 shoulds。"
    },
    {
      "wrong": "She should not''t play games before exams.",
      "model": "She shouldn''t play games before exams.",
      "hint":  "缩写写法",
      "why":   "**should not** 的缩写是 **shouldn''t**（一个撇号），不是 should not''t。"
    },
    {
      "wrong": "You should how to study English better?",
      "model": "How should you study English better?",
      "hint":  "疑问词提前",
      "why":   "**特殊疑问句**：疑问词 (How) 提到句首 + should + 主语 + 动词原形。"
    },
    {
      "wrong": "He should goes to bed earlier on weeknights.",
      "model": "He should go to bed earlier on weeknights.",
      "hint":  "should 后用原形",
      "why":   "**should + 动词原形**。goes 是第三人称单数，必须改回原形 **go**。"
    },
    {
      "wrong": "— Should we leave now? — No, we should.",
      "model": "— Should we leave now? — No, we shouldn''t.",
      "hint":  "否定回答",
      "why":   "**Should + 主语 + ...?** 的肯定回答 = **Yes, sb should**；否定回答 = **No, sb shouldn''t**。"
    }
  ]$jsonb$::jsonb,

  boss_questions = $jsonb$[
    {
      "stem": "— What ___ I do to improve my English?\n— You ___ read more English books.",
      "option_a": "should / should to",
      "option_b": "should / should",
      "option_c": "do / should",
      "option_d": "could / shoulds",
      "correct_answer": "B",
      "trap": "选 A 加 to。选 C 第一空错。选 D shoulds 多 s。",
      "why":  "提问 What should I do；回答 You should + 动词原形 (read)。"
    },
    {
      "stem": "Children ___ stay up too late on weekdays. They have school the next morning.",
      "option_a": "should",
      "option_b": "shouldn''t",
      "option_c": "should to",
      "option_d": "could to",
      "correct_answer": "B",
      "trap": "选 A 意思相反（应该熬夜）— 错。选 C/D 多加 to。",
      "why":  "**shouldn''t + 动词原形** = 不应该。语境第二句给出原因，确认要否定。"
    },
    {
      "stem": "— ___ I tell my mom about the broken vase?\n— Yes, you ___. Honesty is important.",
      "option_a": "Should / should",
      "option_b": "Do / should",
      "option_c": "Should / do",
      "option_d": "Should / shoulds",
      "correct_answer": "A",
      "trap": "选 B 第一空错。选 C 回答错。选 D shoulds 多 s。",
      "why":  "情态动词疑问句 = **Should + 主语 + 动词原形 ?**；肯定回答 = **Yes, you should**。"
    },
    {
      "stem": "She ___ home now — she left work an hour ago.",
      "option_a": "should is",
      "option_b": "should be",
      "option_c": "shoulds be",
      "option_d": "should being",
      "correct_answer": "B",
      "trap": "选 A is 是变形动词。选 C shoulds 多 s。选 D being 用了 ing。",
      "why":  "**should + be**（动词原形）= 按理应该。表\"按理推测\"。"
    }
  ]$jsonb$::jsonb

WHERE code = 'g8.18';


UPDATE junior_grammar_points SET teacher_script = $jsonb$[
  {
    "text": "今天解锁**should**。中考\"给建议\"作文的必背动词，三秒搞定它。",
    "show": "🎯 Today: should + 动词原形",
    "duration": 9
  },
  {
    "text": "**核心公式**：主语 + **should / shouldn''t** + 动词原形。情态动词无人称变化。",
    "show": "should + V (原形)",
    "highlight": "should + V",
    "duration": 10
  },
  {
    "text": "**用法 ①** 给建议：You **should drink** more water.（最常考）",
    "show": "You should drink more water.",
    "highlight": "should drink",
    "duration": 10
  },
  {
    "text": "**用法 ②** 表禁止 / 不该：Children **shouldn''t stay up** late.",
    "show": "Children shouldn''t stay up late.",
    "highlight": "shouldn''t stay up",
    "duration": 10
  },
  {
    "text": "**用法 ③** 表客观推测：He **should be** home now.（按理已经到家）",
    "show": "He should be home now.",
    "highlight": "should be",
    "duration": 11
  },
  {
    "text": "**疑问句** Should + 主语 + 动词原形 ?：**Should I tell** Mom?",
    "show": "Should I tell Mom?",
    "highlight": "Should I tell",
    "duration": 10
  },
  {
    "text": "**铁律 ①**：should **后面永远是动词原形**，不加 to，不加 -s。",
    "show": "✗ should to eat   ✗ shoulds   ✓ should eat",
    "highlight": "should eat",
    "duration": 12
  },
  {
    "text": "**写作模板**：You should + 原形 / You shouldn''t + 原形 / Why don''t you + 原形 — 三连建议。",
    "show": "You should ... / You shouldn''t ... / Why don''t you ...",
    "highlight": "You should",
    "duration": 11
  }
]$jsonb$::jsonb
WHERE code = 'g8.18';


DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.18')
  AND sort_order BETWEEN 9000 AND 9099;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.18')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  (
    'You ___ more vegetables and fruits to stay healthy.',
    'mcq', 'should to eat', 'should eat', 'shoulds eat', 'should eats', 'B',
    NULL::text[],
    'should + 动词原形（eat），无人称变化。',
    '{}'::jsonb, NULL, 'should_basic', false, 1, 9000
  ),
  (
    'You ___ play computer games for so long every day.',
    'mcq', 'should',  'shouldn''t', 'should to', 'shouldn''t to', 'B',
    NULL::text[],
    '"不应该长时间打游戏"→ shouldn''t + 动词原形。',
    '{}'::jsonb, NULL, 'should_negative', false, 1, 9001
  ),
  (
    '___ we walk to the cinema or take a taxi?',
    'mcq', 'Should', 'Are', 'Do', 'Will', 'A',
    NULL::text[],
    '提建议 / 询问对方意见用 Should + 主语 + 动词原形。',
    '{}'::jsonb, NULL, 'should_suggestion', false, 1, 9002
  ),
  (
    'It''s already 7:30. Mom ___ home by now.',
    'mcq', 'should is', 'should be', 'shoulds be', 'should being', 'B',
    NULL::text[],
    'should + be（原形）表"按理应该"。',
    '{}'::jsonb, NULL, 'should_deduction', false, 2, 9003
  ),

  (
    'Students ____ (respect) their teachers.',
    'fill', NULL, NULL, NULL, NULL, 'should respect',
    ARRAY['should respect']::text[],
    'should + 动词原形。',
    '{}'::jsonb, NULL, 'should_obligation', false, 1, 9004
  ),
  (
    'You look pale. You ____ (see) a doctor.',
    'fill', NULL, NULL, NULL, NULL, 'should see',
    ARRAY['should see']::text[],
    '给建议 → You should see ...',
    '{}'::jsonb, NULL, 'should_advice', false, 1, 9005
  ),
  (
    'Children ____ (not, play) with fire.',
    'fill', NULL, NULL, NULL, NULL, 'shouldn''t play',
    ARRAY['shouldn''t play', 'should not play']::text[],
    'should not 缩写 shouldn''t + 动词原形。',
    '{}'::jsonb, NULL, 'should_negative', false, 2, 9006
  ),

  (
    '改写为 should 句：  "It''s a good idea to go to bed early."',
    'transform', NULL, NULL, NULL, NULL, 'You should go to bed early.',
    ARRAY[
      'You should go to bed early.'
    ]::text[],
    'It''s a good idea to do = You should do。',
    '{}'::jsonb, NULL, 'should_advice_transform', true, 2, 9007
  ),
  (
    '改写为否定建议：  "You should play computer games late at night."',
    'transform', NULL, NULL, NULL, NULL, 'You shouldn''t play computer games late at night.',
    ARRAY[
      'You shouldn''t play computer games late at night.'
    ]::text[],
    'should → shouldn''t；其他不变。',
    '{}'::jsonb, NULL, 'should_negative_transform', true, 2, 9008
  ),

  (
    '改错：  "You should to drink more water on hot days."',
    'correction', NULL, NULL, NULL, NULL, 'You should drink more water on hot days.',
    ARRAY[
      'You should drink more water on hot days.'
    ]::text[],
    'should + 动词原形（不加 to）。',
    '{}'::jsonb, NULL, 'should_no_to', true, 1, 9009
  ),
  (
    '改错：  "He shoulds finish his homework before 10 p.m."',
    'correction', NULL, NULL, NULL, NULL, 'He should finish his homework before 10 p.m.',
    ARRAY[
      'He should finish his homework before 10 p.m.'
    ]::text[],
    '情态动词无人称变化，shoulds 错。',
    '{}'::jsonb, NULL, 'should_no_s', true, 2, 9010
  ),

  (
    '把这句话译成英文：你应该多运动，不应该总是坐着玩手机。',
    'translation', NULL, NULL, NULL, NULL, 'You should exercise more and shouldn''t always sit and play with your phone.',
    ARRAY[
      'You should exercise more and shouldn''t always sit and play with your phone.',
      'You should do more exercise and shouldn''t sit playing on your phone all the time.',
      'You should exercise more often and stop sitting and using your phone all day.'
    ]::text[],
    '考点：① should + exercise more（动词原形）；② shouldn''t + always sit + play；③ "玩手机"= play with your phone / use your phone。',
    '{}'::jsonb, '更地道：exercise more 比 do more exercises 更自然；play with your phone 比 play your phone 更地道。', 'should_translation', true, 3, 9011
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
  SELECT id, content_depth INTO v_point_id, v_depth FROM junior_grammar_points WHERE code = 'g8.18';
  IF v_point_id IS NULL THEN
    RAISE EXCEPTION 'Gold-standard migration failed: junior_grammar_points row with code=''g8.18'' does not exist.';
  END IF;
  IF v_depth <> 3 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: content_depth for g8.18 is %, expected 3.', v_depth;
  END IF;
  SELECT count(*) INTO v_q_count
  FROM junior_grammar_questions
  WHERE point_id = v_point_id AND sort_order BETWEEN 9000 AND 9099;
  IF v_q_count <> 12 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: expected 12 questions for g8.18, got %.', v_q_count;
  END IF;
  RAISE NOTICE 'Gold-standard migration for g8.18 verified: content_depth=3, % questions seeded.', v_q_count;
END $$;


-- ╔════════════════════════════════════════════════════════════════════╗
-- ║ FILE: 20260523160000_g8_19_must_have_to_gold_standard.sql
-- ╚════════════════════════════════════════════════════════════════════╝
-- =====================================================================
-- Gold-standard content for G8 · have to / must · Modal: Obligation
-- Code: g8.19   Category: verb
-- =====================================================================
-- Covers the famous mustn''t ≠ don''t have to distinction —
-- one of the 5 highest-error 中考 modal traps.
-- =====================================================================

UPDATE junior_grammar_points
SET
  summary = '"必须" 有两种 — must（主观）vs have to（客观）；"禁止" 用 mustn''t，"不必" 用 don''t have to，别搞混。',
  hook_line_cn = '中考最爱挖的坑：mustn''t ≠ don''t have to。一个是"绝不可"，一个是"没必要"，意思反过来。',
  hook_line = 'must vs have to · mustn''t vs don''t have to — the most-confused modal pair in 中考.',
  mnemonic = 'must 主观必须；have to 客观必须；mustn''t = 禁止；don''t have to = 没必要。',
  content_depth = 3,

  explanation_md = E'## 🎯 一句话搞定\n\n**must / have to** 都表"必须"，但**侧重不同**；它们的否定形式**意思完全相反**！\n\n---\n\n## 📐 一图秒分四种用法\n\n| 形式 | 含义 | 例子 |\n|---|---|---|\n| **must** | 必须（**主观** / 说话人自己要求） | I **must finish** this today. |\n| **have to** | 必须（**客观** / 外部规定） | I **have to wear** a uniform at school. |\n| **mustn''t** | **禁止** / 绝不能 | You **mustn''t cross** the red light. |\n| **don''t have to** | **不必** / 没必要 | You **don''t have to come** if you''re busy. |\n\n> ⚠️ **铁律**：**mustn''t ≠ don''t have to**！意思**完全相反**！中考改错最高频陷阱。\n\n---\n\n## 🔥 must vs have to 怎么选？\n\n### must — 说话人**自己想 / 自己决定**\n- I **must study** harder. I want to go to a good high school.（自己想）\n- You **must be** quiet here. (主观命令)\n\n### have to — **外部**规则 / 客观要求\n- Students **have to wear** uniforms.（学校规定）\n- I **have to get** up at 6 every morning.（不得不 / 客观要求）\n\n### 关键区别：**must 没有过去式 / 没有人称变化**！\n- 过去时表"必须"必须用 **had to**：~~mustn''t I~~ → **Did I have to** ...?  \n  ~~He musted~~ → **He had to**\n- He / She / It 用 **has to**（不是 musts）\n\n---\n\n## ⚠️ 否定形式的"反义陷阱"（中考最爱考！）\n\n| 否定式 | 意思 | 例子 |\n|---|---|---|\n| **mustn''t** | **禁止 / 绝不能**（强烈不可） | Children **mustn''t play** with knives. |\n| **don''t have to** | **不必 / 没必要**（无义务） | You **don''t have to come** to the party. |\n\n→ **You mustn''t come.** = 你绝对不能来。  \n→ **You don''t have to come.** = 你不必来（来也行）。\n\n---\n\n## ⏰ 看到这些 = must / have to 题\n\n- 校规 / 班规 / 法律 → **have to** / **must**\n- 警告 / 禁止 → **mustn''t**\n- "如果你愿意可以不……" → **don''t have to**\n- 过去时间 + "必须" → **had to**（不能用 must）\n\n---\n\n## ⚠️ Top 5 易错点（中考批卷红笔常出现）\n\n1. **mustn''t 当"不必"用**（最致命！）：~~You mustn''t come — it''s optional.~~ → **You don''t have to come.**\n2. **don''t have to 当"禁止"用**：~~Children don''t have to play with fire.~~ → **Children mustn''t play with fire.**\n3. **must 的过去式用错**：~~I musted finish it yesterday.~~ → **I had to finish it yesterday.**\n4. **He must 加 -s**：~~He musts go.~~ → **He must go.**（情态动词无变化）\n5. **have to 第三人称漏 -s**：~~She have to go.~~ → **She has to go.**\n\n---\n\n## 🧠 三秒判断口诀\n\n> ① 说话人**自己**要求 → **must**；**外部**要求 → **have to**  \n> ② "**绝对禁止**" → **mustn''t**；"**没必要**" → **don''t have to**  \n> ③ 过去时间 = **had to**（must 没有过去式）  \n> ④ 第三人称：have to → **has to**；must → **must**（不变）',

  immersion_cards = $jsonb$[
    {"situation": "School rule on the first day", "cn": "学生必须按时到校。", "en": "Students have to arrive on time."},
    {"situation": "Parent warning a little brother", "cn": "孩子们绝对不能玩火。", "en": "Children mustn''t play with fire."},
    {"situation": "Friend wonders whether to attend a casual party", "cn": "你不必来，活动是自愿的。", "en": "You don''t have to come — it''s optional."},
    {"situation": "You hyping yourself before an exam", "cn": "我必须考好这次！", "en": "I must do well this time!"},
    {"situation": "Recounting yesterday''s busy day", "cn": "我昨天不得不加班。", "en": "I had to stay late at work yesterday."},
    {"situation": "Roadside warning to a tourist", "cn": "你绝不能闯红灯。", "en": "You mustn''t cross when the light is red."}
  ]$jsonb$::jsonb,

  contrast_table = $jsonb$[
    {"lhs": "You mustn''t come if you don''t want to. (=不必)",  "rhs": "You don''t have to come if you don''t want to."},
    {"lhs": "Children don''t have to play with fire. (=禁止)",     "rhs": "Children mustn''t play with fire."},
    {"lhs": "I musted finish it before noon yesterday.",          "rhs": "I had to finish it before noon yesterday."},
    {"lhs": "He musts go to bed by 10 p.m.",                       "rhs": "He must go to bed by 10 p.m."},
    {"lhs": "She have to wear a school uniform every day.",        "rhs": "She has to wear a school uniform every day."},
    {"lhs": "Does Tom must come to the meeting?",                  "rhs": "Does Tom have to come to the meeting?"}
  ]$jsonb$::jsonb,

  reflex_cards = $jsonb$[
    {"cn": "我必须复习数学。",                "en": "I must review math.",                          "keyword": "must review"},
    {"cn": "学生必须穿校服。",                "en": "Students have to wear school uniforms.",       "keyword": "have to wear"},
    {"cn": "你绝不能在图书馆大声喧哗。",      "en": "You mustn''t talk loudly in the library.",     "keyword": "mustn''t talk"},
    {"cn": "你不必现在就给我答案。",          "en": "You don''t have to give me an answer now.",    "keyword": "don''t have to give"},
    {"cn": "他昨天不得不步行回家。",          "en": "He had to walk home yesterday.",                "keyword": "had to walk"},
    {"cn": "她必须六点起床。",                "en": "She has to get up at six.",                     "keyword": "has to get up"},
    {"cn": "我们绝不能迟到。",                "en": "We mustn''t be late.",                          "keyword": "mustn''t be"},
    {"cn": "Tom 周末不必上学。",              "en": "Tom doesn''t have to go to school at weekends.","keyword": "doesn''t have to go"}
  ]$jsonb$::jsonb,

  situation_drills = $jsonb$[
    {
      "situation": "Telling a new exchange student about your school''s daily rules.",
      "cn": "我们必须穿校服，上课不能玩手机。",
      "en": "We have to wear school uniforms, and we mustn''t use our phones in class.",
      "accepted": [
        "We''re required to wear uniforms and aren''t allowed to use phones in class.",
        "We must wear uniforms and we can''t use phones during lessons."
      ]
    },
    {
      "situation": "Reassuring a friend who is worried about an optional weekend activity.",
      "cn": "你不必来，这只是个自愿的活动。",
      "en": "You don''t have to come — it''s a voluntary activity.",
      "accepted": [
        "You don''t need to come; it''s totally optional.",
        "Coming is optional, you don''t have to."
      ]
    },
    {
      "situation": "Explaining to your mom why you came home late yesterday.",
      "cn": "我昨天不得不在学校多待一个小时帮老师。",
      "en": "I had to stay at school for an extra hour to help the teacher yesterday.",
      "accepted": [
        "I had to stay an extra hour to help the teacher yesterday.",
        "Yesterday I had to stay back at school for one more hour to help the teacher."
      ]
    },
    {
      "situation": "Warning your younger brother about traffic safety.",
      "cn": "在路上你绝不能玩手机，绝对不能闯红灯。",
      "en": "On the road, you mustn''t use your phone, and you mustn''t cross when the light is red.",
      "accepted": [
        "You must never look at your phone on the road, and never cross on a red light.",
        "On the road, no phone use and no crossing against a red light."
      ]
    }
  ]$jsonb$::jsonb,

  correction_tasks = $jsonb$[
    {
      "wrong": "You mustn''t come to the party — it''s optional.",
      "model": "You don''t have to come to the party — it''s optional.",
      "hint":  "mustn''t = 禁止",
      "why":   "**mustn''t** = \"绝对禁止\"（强烈不可）；**don''t have to** = \"不必\"（无义务）。语境是\"可选 / 不强求\" → 必须用 don''t have to。"
    },
    {
      "wrong": "Children don''t have to play with fire — it''s very dangerous.",
      "model": "Children mustn''t play with fire — it''s very dangerous.",
      "hint":  "禁止 = mustn''t",
      "why":   "玩火**绝对禁止** → 用 **mustn''t**。don''t have to 意思变成\"不必\"，逻辑就错了。"
    },
    {
      "wrong": "I musted go to the dentist yesterday afternoon.",
      "model": "I had to go to the dentist yesterday afternoon.",
      "hint":  "must 没有过去式",
      "why":   "**must 没有过去式**！表过去的\"必须\" → 用 **had to**。"
    },
    {
      "wrong": "He musts finish his homework before he can play.",
      "model": "He must finish his homework before he can play.",
      "hint":  "情态动词无变化",
      "why":   "**情态动词没有第三人称单数 -s**。musts 错，永远是 must。"
    },
    {
      "wrong": "She have to wear glasses for reading.",
      "model": "She has to wear glasses for reading.",
      "hint":  "have to 第三人称变 has to",
      "why":   "**have to 是实义动词短语**，**第三人称单数要变 has to**（与 must 不同！）。"
    },
    {
      "wrong": "Does Tom must come to school tomorrow?",
      "model": "Does Tom have to come to school tomorrow?",
      "hint":  "must 不能跟 do/does",
      "why":   "**must 没有疑问句助动词形式**；表\"必须\"的疑问句用 **Does/Do + sb + have to + 动词原形**。"
    }
  ]$jsonb$::jsonb,

  boss_questions = $jsonb$[
    {
      "stem": "— Must I bring my own pencils?\n— No, you ___. The school provides them.",
      "option_a": "mustn''t",
      "option_b": "don''t have to",
      "option_c": "can''t",
      "option_d": "needn''t to",
      "correct_answer": "B",
      "trap": "选 A 中考最大陷阱：mustn''t = 禁止（你绝对不能带），意思错。",
      "why":  "**Must I ...? 的否定回答 = No, sb don''t have to**（不必）；不能用 No, sb mustn''t（禁止）。"
    },
    {
      "stem": "Children ___ play with knives. It''s very dangerous.",
      "option_a": "don''t have to",
      "option_b": "needn''t",
      "option_c": "mustn''t",
      "option_d": "shouldn''t to",
      "correct_answer": "C",
      "trap": "选 A/B 意思变成\"不必\"。选 D 加 to 错。",
      "why":  "玩刀**绝对禁止** → **mustn''t**。后半句的 dangerous 进一步锁定。"
    },
    {
      "stem": "I ___ stay at home yesterday because my mom was sick.",
      "option_a": "must",
      "option_b": "have to",
      "option_c": "had to",
      "option_d": "musted",
      "correct_answer": "C",
      "trap": "选 A must 没过去式。选 B 时态错。选 D musted 不存在。",
      "why":  "**过去的\"必须\" → had to**（must 没有过去式）。"
    },
    {
      "stem": "Lin ___ wear a school uniform every weekday, but she ___ wear it on weekends.",
      "option_a": "have to / mustn''t",
      "option_b": "has to / doesn''t have to",
      "option_c": "must to / don''t have to",
      "option_d": "has to / mustn''t",
      "correct_answer": "B",
      "trap": "选 D 第二空 mustn''t 意思错（变成\"周末禁止穿\"）— 但周末是\"不必穿\"。选 A/C 第一空错。",
      "why":  "第一空：第三人称 → **has to**；第二空：周末\"不必\"→ **doesn''t have to**（不是 mustn''t）。"
    }
  ]$jsonb$::jsonb

WHERE code = 'g8.19';


UPDATE junior_grammar_points SET teacher_script = $jsonb$[
  {
    "text": "今天解锁**must / have to**。中考最爱挖的\"假双胞胎\"陷阱：mustn''t ≠ don''t have to。",
    "show": "🎯 Today: must / have to + their reversed negatives",
    "duration": 10
  },
  {
    "text": "**must** = 必须（说话人**自己**要求）。I **must** finish this today.（自己想完成）",
    "show": "must = subjective must",
    "highlight": "must",
    "duration": 10
  },
  {
    "text": "**have to** = 必须（**客观**规定 / 外部要求）。Students **have to** wear uniforms.（学校规定）",
    "show": "have to = objective must",
    "highlight": "have to",
    "duration": 11
  },
  {
    "text": "**最大陷阱来了！mustn''t ≠ don''t have to**，意思**完全相反**！",
    "show": "mustn''t ≠ don''t have to",
    "highlight": "≠",
    "duration": 12
  },
  {
    "text": "**mustn''t** = **禁止 / 绝不能**！Children **mustn''t** play with fire.（绝对禁止）",
    "show": "mustn''t = NOT ALLOWED",
    "highlight": "mustn''t",
    "duration": 11
  },
  {
    "text": "**don''t have to** = **不必 / 没必要**。You **don''t have to** come if you''re busy.（来不来都行）",
    "show": "don''t have to = NOT NECESSARY",
    "highlight": "don''t have to",
    "duration": 12
  },
  {
    "text": "**must 没有过去式**！表过去的\"必须\"必须用 **had to**。~~musted~~ → **had to**。",
    "show": "✗ musted   ✓ had to",
    "highlight": "had to",
    "duration": 11
  },
  {
    "text": "**have to 第三人称变 has to**（与 must 不同）。She **has to** wear glasses。下一关进入实战。",
    "show": "He / She / It → has to",
    "highlight": "has to",
    "duration": 10
  }
]$jsonb$::jsonb
WHERE code = 'g8.19';


DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.19')
  AND sort_order BETWEEN 9000 AND 9099;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.19')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  (
    'Students ___ wear school uniforms from Monday to Friday.',
    'mcq', 'has to', 'have to', 'must to', 'have', 'B',
    NULL::text[],
    '主语 Students 复数 → have to。',
    '{}'::jsonb, NULL, 'have_to_plural', false, 1, 9000
  ),
  (
    'You ___ drive when you have been drinking. It''s very dangerous.',
    'mcq', 'mustn''t', 'don''t have to', 'don''t must', 'haven''t to', 'A',
    NULL::text[],
    '酒驾绝对禁止 → mustn''t。',
    '{}'::jsonb, NULL, 'must_not_forbidden', false, 1, 9001
  ),
  (
    '— Must I finish the test now?\n— No, you ___. You can take it home.',
    'mcq', 'mustn''t', 'don''t have to', 'don''t must', 'haven''t to', 'B',
    NULL::text[],
    'Must I ... 否定回答 = No, sb don''t have to（不必）。选 A 意思错。',
    '{}'::jsonb, NULL, 'must_not_have_to_trap', false, 2, 9002
  ),
  (
    'Yesterday Tom ___ stay at school for an extra hour to help the teacher.',
    'mcq', 'must', 'musted', 'had to', 'has to', 'C',
    NULL::text[],
    '过去时"不得不" → had to。must 没过去式。',
    '{}'::jsonb, NULL, 'must_past_form', false, 2, 9003
  ),

  (
    'Children ____ (not, play) with matches.',
    'fill', NULL, NULL, NULL, NULL, 'mustn''t play',
    ARRAY['mustn''t play', 'must not play']::text[],
    '玩火柴绝对禁止 → mustn''t + 动词原形。',
    '{}'::jsonb, NULL, 'must_not_forbid', false, 1, 9004
  ),
  (
    'My sister ____ (have to, get up) early because her school is far away.',
    'fill', NULL, NULL, NULL, NULL, 'has to get up',
    ARRAY['has to get up']::text[],
    'My sister = 第三人称单数 → has to + 动词原形。',
    '{}'::jsonb, NULL, 'have_to_third_person', false, 2, 9005
  ),
  (
    'Last summer, I ____ (have to, work) at the family store for two weeks.',
    'fill', NULL, NULL, NULL, NULL, 'had to work',
    ARRAY['had to work']::text[],
    '过去时"不得不" → had to + 动词原形。',
    '{}'::jsonb, NULL, 'have_to_past', false, 2, 9006
  ),

  (
    '改写为 have to 句（保留意思）：  "It is necessary for me to take a bus to school."',
    'transform', NULL, NULL, NULL, NULL, 'I have to take a bus to school.',
    ARRAY[
      'I have to take a bus to school.'
    ]::text[],
    'It is necessary for sb to do = sb have to do。',
    '{}'::jsonb, NULL, 'have_to_transform', true, 2, 9007
  ),
  (
    '改写为 don''t have to 句：  "It is not necessary for you to bring lunch — the school provides it."',
    'transform', NULL, NULL, NULL, NULL, 'You don''t have to bring lunch — the school provides it.',
    ARRAY[
      'You don''t have to bring lunch — the school provides it.'
    ]::text[],
    'It is not necessary = sb don''t have to do（不必）。',
    '{}'::jsonb, NULL, 'have_to_negative_transform', true, 3, 9008
  ),

  (
    '改错：  "I musted clean my room yesterday afternoon."',
    'correction', NULL, NULL, NULL, NULL, 'I had to clean my room yesterday afternoon.',
    ARRAY[
      'I had to clean my room yesterday afternoon.'
    ]::text[],
    'must 没有过去式，过去的"必须" → had to。',
    '{}'::jsonb, NULL, 'must_no_past', true, 2, 9009
  ),
  (
    '改错：  "Children don''t have to play with electric outlets — it''s dangerous."',
    'correction', NULL, NULL, NULL, NULL, 'Children mustn''t play with electric outlets — it''s dangerous.',
    ARRAY[
      'Children mustn''t play with electric outlets — it''s dangerous.'
    ]::text[],
    '危险事物绝对禁止 → mustn''t；don''t have to = 不必（逻辑错）。',
    '{}'::jsonb, NULL, 'must_not_vs_dont_have_to', true, 3, 9010
  ),

  (
    '把这句话译成英文：在中国，学生必须穿校服，但是周末不必穿。',
    'translation', NULL, NULL, NULL, NULL, 'In China, students have to wear school uniforms, but they don''t have to wear them on weekends.',
    ARRAY[
      'In China, students have to wear school uniforms, but they don''t have to wear them on weekends.',
      'In China, students must wear school uniforms, but on weekends they don''t have to.',
      'Chinese students are required to wear uniforms, but not on weekends.'
    ]::text[],
    '考点：① "必须"= have to（客观规定）；② "不必"= don''t have to（关键！不能用 mustn''t）；③ 第三人称复数 students 用 have to / don''t have to。',
    '{}'::jsonb, '更地道：are required to / don''t have to 是英文里描述规则的标准搭配。注意 mustn''t 意思相反，千万不能用。', 'must_have_to_translation', true, 3, 9011
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
  SELECT id, content_depth INTO v_point_id, v_depth FROM junior_grammar_points WHERE code = 'g8.19';
  IF v_point_id IS NULL THEN
    RAISE EXCEPTION 'Gold-standard migration failed: junior_grammar_points row with code=''g8.19'' does not exist.';
  END IF;
  IF v_depth <> 3 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: content_depth for g8.19 is %, expected 3.', v_depth;
  END IF;
  SELECT count(*) INTO v_q_count
  FROM junior_grammar_questions
  WHERE point_id = v_point_id AND sort_order BETWEEN 9000 AND 9099;
  IF v_q_count <> 12 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: expected 12 questions for g8.19, got %.', v_q_count;
  END IF;
  RAISE NOTICE 'Gold-standard migration for g8.19 verified: content_depth=3, % questions seeded.', v_q_count;
END $$;


-- ╔════════════════════════════════════════════════════════════════════╗
-- ║ FILE: 20260524120000_g8_05_adverb_comparatives_gold_standard.sql
-- ╚════════════════════════════════════════════════════════════════════╝
-- =====================================================================
-- Gold-standard content for G8 · 副词比较级与最高级
-- Code: g8.05   Category: other
-- =====================================================================
-- Adverb side of comparison (pairs with g8.04 / g8.09 adjective sides).
-- Top trap: students use adjective form where adverb is needed.
-- =====================================================================

UPDATE junior_grammar_points
SET
  summary = '"跑得更快 / 唱得最好" — 副词比较级 + 最高级，描述动作的方式，比较的不是人物本身。',
  hook_line_cn = '中考写作里"谁跑得更快、谁做得最好"全靠它。注意：修饰的是动作，不是名词，所以用副词不是形容词。',
  hook_line = 'Adverb comparatives — describe HOW someone does something, not what they are.',
  mnemonic = '副词比较 = -er / -est（单音节）或 more / most（-ly 结尾）；不规则 well → better → best。',
  content_depth = 3,

  explanation_md = E'## 🎯 一句话搞定\n\n**比较"动作的方式"** → 用 **副词比较级 + than** 或 **(the) 副词最高级**。\n\n---\n\n## 📐 副词比较怎么变？\n\n| 副词类型 | 变化规则 | 例子 |\n|---|---|---|\n| **单音节副词** | 加 **-er / -est** | fast → **faster / fastest**, hard → **harder / hardest**, early → earlier / earliest |\n| **以 -ly 结尾的副词** | 用 **more / most + 副词** | slowly → **more slowly / most slowly**, carefully → more carefully / most carefully |\n| **不规则** | 必背 4 组 | **well → better → best**, **badly → worse → worst**, far → farther / farthest, much → more / most |\n\n> ⚠️ **铁律 ①**：副词最高级前面 **the 可省略**（与形容词最高级不同！）。  \n> Of all the students, Mike works **(the) hardest**.\n\n---\n\n## 🔥 形容词 vs 副词：怎么区分？\n\n| 形容词修饰 | 副词修饰 |\n|---|---|\n| **名词** | **动词 / 形容词 / 副词** |\n| He is a **fast** runner.（修饰 runner）| He runs **fast**.（修饰 runs）|\n| She is a **beautiful** singer. | She sings **beautifully**. |\n| He is **good** at math. | He does math **well**. |\n\n> 中考最高频陷阱：~~She sings beautiful.~~ → **She sings beautifully.**（修饰动词 sing 必须用副词）\n\n---\n\n## ⏰ 看到这些 = 副词比较\n\n- **动词** + 副词 + than（runs faster than）\n- of all 后接最高级（works hardest of all）\n- Who runs ___? → 比较级或最高级\n- well / hard / fast / early / late 这些"裸副词"（不加 -ly）\n\n---\n\n## ⚠️ Top 5 易错点（中考批卷红笔常出现）\n\n1. **副词位置用了形容词**：~~She sings beautiful.~~ → **She sings beautifully.**\n2. **good vs well 混用**：~~He does well at math.~~（不规范）→ **He is good at math.** 或 **He does math well.**\n3. **hard 和 hardly 混淆**：~~He works hardly.~~（hardly = 几乎不！） → **He works hard.**（用力地）\n4. **副词比较级前漏 more**：~~She sings more beautiful.~~ → **She sings more beautifully.**\n5. **副词最高级硬加 the**（the 可省）：~~He runs the fastest of all.~~ ✓（也对）but **He runs fastest of all.** ✓（更地道）\n\n---\n\n## 🔥 hard vs hardly（中考高频陷阱）\n\n- **hard**（副词）= 努力地 / 用力地。例：He works **hard**.\n- **hardly**（副词）= 几乎不（含否定意义！）。例：I can **hardly** hear you.\n\n两个长得像，**意思相反**！\n\n---\n\n## 🧠 三秒判断口诀\n\n> ① 看修饰对象：修饰**动词** → 副词；修饰**名词** → 形容词  \n> ② 单音节副词 → -er / -est；**-ly 结尾** → more / most  \n> ③ 不规则副词：**well → better → best**；**badly → worse → worst**  \n> ④ **hard** = 努力地；**hardly** = 几乎不（含否定！）',

  immersion_cards = $jsonb$[
    {"situation": "Comparing two runners in PE class", "cn": "Lin 跑得比 Wang 快。", "en": "Lin runs faster than Wang."},
    {"situation": "Praising a hardworking classmate", "cn": "他在班里学习最努力。", "en": "He studies (the) hardest in our class."},
    {"situation": "Recommending a singer to a friend", "cn": "她唱得比我们班所有人都好听。", "en": "She sings more beautifully than anyone else in our class."},
    {"situation": "Reflecting on this term''s progress", "cn": "这学期我英语进步了很多。", "en": "I have done much better in English this term."},
    {"situation": "Friend asks how you''re feeling today", "cn": "我感觉好多了，谢谢。", "en": "I feel much better now, thanks."},
    {"situation": "Telling tutor where you struggle", "cn": "我数学做得最差。", "en": "I do worst in math."}
  ]$jsonb$::jsonb,

  contrast_table = $jsonb$[
    {"lhs": "She sings beautiful.",                          "rhs": "She sings beautifully."},
    {"lhs": "He runs more fast than me.",                     "rhs": "He runs faster than me."},
    {"lhs": "She sings more beautiful than him.",             "rhs": "She sings more beautifully than him."},
    {"lhs": "He works hardly every day.",                     "rhs": "He works hard every day."},
    {"lhs": "Of all the students, Mike speaks the most well.","rhs": "Of all the students, Mike speaks (the) best."},
    {"lhs": "Tom does good in math.",                          "rhs": "Tom does well in math. / Tom is good at math."}
  ]$jsonb$::jsonb,

  reflex_cards = $jsonb$[
    {"cn": "她跑得比我快。",                  "en": "She runs faster than me.",                      "keyword": "runs faster"},
    {"cn": "Tom 笑得最响。",                  "en": "Tom laughs (the) loudest.",                     "keyword": "(the) loudest"},
    {"cn": "他比上次写得更仔细。",            "en": "He writes more carefully than last time.",      "keyword": "more carefully"},
    {"cn": "她钢琴弹得好极了。",              "en": "She plays the piano very well.",                "keyword": "very well"},
    {"cn": "今天我感觉好多了。",              "en": "I feel much better today.",                     "keyword": "much better"},
    {"cn": "我们班谁起得最早？",              "en": "Who gets up earliest in our class?",            "keyword": "earliest"},
    {"cn": "他几乎听不见你说话。",            "en": "He can hardly hear you.",                       "keyword": "can hardly"},
    {"cn": "她比我学得更努力。",              "en": "She studies harder than me.",                   "keyword": "harder than"}
  ]$jsonb$::jsonb,

  situation_drills = $jsonb$[
    {
      "situation": "Comparing your performance with a friend after a singing contest.",
      "cn": "其实你今天唱得比我好多了。",
      "en": "Actually, you sang much better than me today.",
      "accepted": [
        "Honestly, you sang a lot better than I did today.",
        "You really sang much better than me today."
      ]
    },
    {
      "situation": "Telling your mom what changed in your English class.",
      "cn": "这学期我的英语写得比以前好多了。",
      "en": "I''ve been writing English much better this term than before.",
      "accepted": [
        "My English writing has improved a lot this term.",
        "I write English much better this term than I did before."
      ]
    },
    {
      "situation": "Praising a classmate''s hard work to your teacher.",
      "cn": "Lin 这学期学得最努力。",
      "en": "Lin has studied (the) hardest this term.",
      "accepted": [
        "Of everyone, Lin has worked the hardest this term.",
        "Lin worked harder than anyone else this term."
      ]
    },
    {
      "situation": "Reporting why you couldn''t hear the announcement at the station.",
      "cn": "广播声音太小了，我几乎听不见。",
      "en": "The announcement was so quiet that I could hardly hear it.",
      "accepted": [
        "I could barely hear the announcement.",
        "The announcement was too quiet — I almost couldn''t hear anything."
      ]
    }
  ]$jsonb$::jsonb,

  correction_tasks = $jsonb$[
    {
      "wrong": "She sings beautiful in the school choir.",
      "model": "She sings beautifully in the school choir.",
      "hint":  "修饰动词用副词",
      "why":   "**sings** 是动词，修饰动词必须用**副词** beautifully。形容词 beautiful 只能修饰名词。"
    },
    {
      "wrong": "He runs more fast than his brother.",
      "model": "He runs faster than his brother.",
      "hint":  "单音节副词加 -er",
      "why":   "**fast 是单音节副词**，直接加 **-er** = faster。不需要 more。"
    },
    {
      "wrong": "She speaks more beautiful than the others.",
      "model": "She speaks more beautifully than the others.",
      "hint":  "副词比较级也要用副词",
      "why":   "**speaks 是动词 → 必须用副词形式**。more 后接副词 **beautifully**，不是形容词 beautiful。"
    },
    {
      "wrong": "He works hardly to support his family.",
      "model": "He works hard to support his family.",
      "hint":  "hard ≠ hardly",
      "why":   "**hard** = 努力地（褒义）；**hardly** = 几乎不（否定意义）。语境是\"努力工作\" → 必须 hard。"
    },
    {
      "wrong": "Tom does good in math.",
      "model": "Tom does well in math. / Tom is good at math.",
      "hint":  "good 是形容词",
      "why":   "**修饰动词 does** 必须用副词 **well**。good 修饰名词 (a good student)。两种说法都对：do well in / be good at。"
    },
    {
      "wrong": "Lin sings the most beautifully than all of us.",
      "model": "Lin sings (the) most beautifully of all of us.",
      "hint":  "最高级搭配 of",
      "why":   "**最高级**搭配的不是 than 而是 **of / in**；than 用于比较级。"
    }
  ]$jsonb$::jsonb,

  boss_questions = $jsonb$[
    {
      "stem": "Lin runs ___ than Wang in our class.",
      "option_a": "more fast",
      "option_b": "faster",
      "option_c": "more faster",
      "option_d": "fastest",
      "correct_answer": "B",
      "trap": "选 A 多音节才用 more。选 C 双重比较级。选 D 最高级 + than 不搭配。",
      "why":  "**fast 单音节副词 → -er → faster** + than。"
    },
    {
      "stem": "Of all the children, Tom laughs ___ at funny stories.",
      "option_a": "the most loud",
      "option_b": "the loudest",
      "option_c": "the most loudly",
      "option_d": "the loudly",
      "correct_answer": "B",
      "trap": "选 C 多余的 most；loud 也可作副词。",
      "why":  "**loud 是单音节副词** → loudest。\"Of all the children\" 提示最高级。"
    },
    {
      "stem": "Today I feel ___ than yesterday. The medicine works.",
      "option_a": "more good",
      "option_b": "better",
      "option_c": "the best",
      "option_d": "more well",
      "correct_answer": "B",
      "trap": "选 A more good 错；选 C 最高级 + than 不搭配；选 D more well 错。",
      "why":  "**well → better → best**（不规则）。两种状态对比用比较级 better。"
    },
    {
      "stem": "She sings ___ than her sister.",
      "option_a": "more beautiful",
      "option_b": "beautifuler",
      "option_c": "more beautifully",
      "option_d": "most beautifully",
      "correct_answer": "C",
      "trap": "选 A 修饰动词 sings 必须用副词。选 B 不存在。选 D 最高级 + than 不搭配。",
      "why":  "**sings 是动词 → 用副词**；beautifully 多音节副词 → **more beautifully**。"
    }
  ]$jsonb$::jsonb

WHERE code = 'g8.05';


UPDATE junior_grammar_points SET teacher_script = $jsonb$[
  {
    "text": "今天解锁**副词比较级**。中考写作里\"跑得更快、唱得最好\"全靠它 — 注意修饰的是动作不是人。",
    "show": "🎯 Today: Adverb comparatives — how someone does something",
    "duration": 11
  },
  {
    "text": "**核心区别**：形容词修饰**名词**（a fast runner），副词修饰**动词**（runs fast）。",
    "show": "fast runner (adj)   |   runs fast (adv)",
    "highlight": "fast",
    "duration": 11
  },
  {
    "text": "**单音节副词加 -er**：fast → **faster**, hard → harder, early → earlier。",
    "show": "fast → faster   hard → harder",
    "highlight": "faster",
    "duration": 10
  },
  {
    "text": "**-ly 结尾的副词用 more**：slowly → **more slowly**, carefully → more carefully, beautifully → more beautifully。",
    "show": "slowly → more slowly   beautifully → more beautifully",
    "highlight": "more slowly",
    "duration": 11
  },
  {
    "text": "**4 个不规则必背**：**well → better → best**, badly → worse → worst, far → farther → farthest, much → more → most。",
    "show": "well → better → best",
    "highlight": "better",
    "duration": 11
  },
  {
    "text": "**最大坑 ①**：修饰动词用形容词。~~She sings beautiful.~~ → **She sings beautifully.**",
    "show": "✗ sings beautiful   ✓ sings beautifully",
    "highlight": "beautifully",
    "duration": 12
  },
  {
    "text": "**最大坑 ②**：**hard ≠ hardly**！hard = 努力地（褒义）；hardly = 几乎不（否定）。",
    "show": "hard = 努力   hardly = 几乎不",
    "highlight": "hardly",
    "duration": 12
  },
  {
    "text": "**最大坑 ③**：副词最高级前 **the 可省略**。He works (the) hardest. 写作时建议加 the 更稳。",
    "show": "He works (the) hardest of all.",
    "highlight": "(the) hardest",
    "duration": 11
  }
]$jsonb$::jsonb
WHERE code = 'g8.05';


DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.05')
  AND sort_order BETWEEN 9000 AND 9099;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.05')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  (
    'Lin jumps ___ than her brother in PE class.',
    'mcq', 'higher', 'high', 'more high', 'highly', 'A',
    NULL::text[],
    'high 是单音节副词 → higher。',
    '{}'::jsonb, NULL, 'adverb_comparative_basic', false, 1, 9000
  ),
  (
    'Of all the students, Tom speaks English ___.',
    'mcq', 'more well', 'best', 'better', 'the most well', 'B',
    NULL::text[],
    'well 不规则 → better → best；Of all 提示最高级。',
    '{}'::jsonb, NULL, 'adverb_superlative_irregular', false, 2, 9001
  ),
  (
    'She does her homework ___ than I do.',
    'mcq', 'more careful', 'more carefully', 'careful', 'most careful', 'B',
    NULL::text[],
    '修饰动词 does → 副词；carefully 多音节 → more carefully。',
    '{}'::jsonb, NULL, 'adverb_comparative_ly', false, 2, 9002
  ),
  (
    'He works ___ every day to support his family.',
    'mcq', 'hardly', 'hard', 'harder', 'hardest', 'B',
    NULL::text[],
    'hard = 努力地；hardly = 几乎不。语境是努力工作 → hard。',
    '{}'::jsonb, NULL, 'adverb_hard_vs_hardly', false, 1, 9003
  ),

  (
    'Lin sings ____ (beautiful) than her sister.',
    'fill', NULL, NULL, NULL, NULL, 'more beautifully',
    ARRAY['more beautifully']::text[],
    '修饰动词 sings → 副词；beautifully → more beautifully。',
    '{}'::jsonb, NULL, 'adverb_comparative_ly', false, 2, 9004
  ),
  (
    'Mike runs the ____ (fast) in our class.',
    'fill', NULL, NULL, NULL, NULL, 'fastest',
    ARRAY['fastest', 'the fastest']::text[],
    '副词最高级 fastest；the 可省。',
    '{}'::jsonb, NULL, 'adverb_superlative_basic', false, 1, 9005
  ),
  (
    'I can ____ (hard) hear what you''re saying. Please speak louder.',
    'fill', NULL, NULL, NULL, NULL, 'hardly',
    ARRAY['hardly']::text[],
    '"几乎听不见"= hardly（含否定意义）。',
    '{}'::jsonb, NULL, 'adverb_hardly', false, 2, 9006
  ),

  (
    '改写为副词比较级：  "Tom is a fast runner. His sister is a faster runner."',
    'transform', NULL, NULL, NULL, NULL, 'Tom''s sister runs faster than Tom.',
    ARRAY[
      'Tom''s sister runs faster than Tom.',
      'Tom''s sister runs faster than he does.'
    ]::text[],
    '把形容词修饰的句子改成副词修饰动词：fast runner → runs fast → runs faster。',
    '{}'::jsonb, NULL, 'adverb_transform_from_adj', true, 2, 9007
  ),
  (
    '改写为副词最高级：  "Lin works very hard."（强调班里最努力）',
    'transform', NULL, NULL, NULL, NULL, 'Lin works (the) hardest in our class.',
    ARRAY[
      'Lin works the hardest in our class.',
      'Lin works hardest in our class.'
    ]::text[],
    'works very hard → works (the) hardest + 范围。',
    '{}'::jsonb, NULL, 'adverb_superlative_transform', true, 2, 9008
  ),

  (
    '改错：  "She sings very beautiful in the school choir."',
    'correction', NULL, NULL, NULL, NULL, 'She sings very beautifully in the school choir.',
    ARRAY[
      'She sings very beautifully in the school choir.'
    ]::text[],
    '修饰动词 sings 必须用副词 beautifully。',
    '{}'::jsonb, NULL, 'adverb_modifies_verb', true, 1, 9009
  ),
  (
    '改错：  "Of all the students in our school, Mike works the most hard."',
    'correction', NULL, NULL, NULL, NULL, 'Of all the students in our school, Mike works (the) hardest.',
    ARRAY[
      'Of all the students in our school, Mike works the hardest.',
      'Of all the students in our school, Mike works hardest.'
    ]::text[],
    'hard 单音节副词 → hardest；不能用 most。',
    '{}'::jsonb, NULL, 'adverb_superlative_single_syllable', true, 2, 9010
  ),

  (
    '把这句话译成英文：他比上次跑得快多了，进步真大。',
    'translation', NULL, NULL, NULL, NULL, 'He ran much faster than last time — what great progress!',
    ARRAY[
      'He ran much faster than last time — what great progress!',
      'He ran a lot faster than last time. What huge progress!',
      'His speed was much faster than last time; he has made great progress.'
    ]::text[],
    '考点：① 修饰动词 ran 用副词 faster；② "快多了"= much faster（much / a lot / far 修饰比较级）；③ "进步真大"= great progress 感叹句。',
    '{}'::jsonb, '更地道：用 much / a lot 修饰比较级；what + a/an + adj + n 是感叹句固定句型。', 'adverb_translation', true, 3, 9011
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
  SELECT id, content_depth INTO v_point_id, v_depth FROM junior_grammar_points WHERE code = 'g8.05';
  IF v_point_id IS NULL THEN
    RAISE EXCEPTION 'Gold-standard migration failed: junior_grammar_points row with code=''g8.05'' does not exist.';
  END IF;
  IF v_depth <> 3 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: content_depth for g8.05 is %, expected 3.', v_depth;
  END IF;
  SELECT count(*) INTO v_q_count
  FROM junior_grammar_questions
  WHERE point_id = v_point_id AND sort_order BETWEEN 9000 AND 9099;
  IF v_q_count <> 12 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: expected 12 questions for g8.05, got %.', v_q_count;
  END IF;
  RAISE NOTICE 'Gold-standard migration for g8.05 verified: content_depth=3, % questions seeded.', v_q_count;
END $$;


-- ╔════════════════════════════════════════════════════════════════════╗
-- ║ FILE: 20260524130000_g8_13_verbs_to_do_gold_standard.sql
-- ╚════════════════════════════════════════════════════════════════════╝
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


-- ╔════════════════════════════════════════════════════════════════════╗
-- ║ FILE: 20260524140000_g8_16_invitations_gold_standard.sql
-- ╚════════════════════════════════════════════════════════════════════╝
-- =====================================================================
-- Gold-standard content for G8 · 邀请与建议 · Invitations & Suggestions
-- Code: g8.16   Category: other
-- =====================================================================
-- 5 patterns: Would you like / Why don''t / How about / Let''s / Shall we.
-- Top trap: How about + V-ing (about is a preposition!).
-- =====================================================================

UPDATE junior_grammar_points
SET
  summary = '"一起去 / 不如 / 要不要" — 5 个邀请和建议的固定句型，中考口语 / 写作必用。',
  hook_line_cn = '中考口语 + 写作的"邀请万能套件"：Would you like / Why don''t you / How about / Let''s / Shall we。背完写作不卡壳。',
  hook_line = 'The 5 invitation patterns that make any 中考 dialogue sound natural.',
  mnemonic = 'Would you like + to do · Why don''t you + 动词原形 · How about + V-ing · Let''s + 动词原形 · Shall we + 动词原形。',
  content_depth = 3,

  explanation_md = E'## 🎯 一句话搞定\n\n**邀请或建议某人做某事** → 5 个固定句型任选一个。注意每个后面接的形式**不一样**！\n\n---\n\n## 📐 5 大固定句型（必背）\n\n| 句型 | 后面接什么 | 例子 |\n|---|---|---|\n| **Would you like + to do ?** | **to + 动词原形** | **Would you like to come** to my party? |\n| **Why don''t you + 动词原形 ?** | **动词原形** | **Why don''t you join** us? |\n| **Why not + 动词原形 ?** | **动词原形** | **Why not play** basketball? |\n| **How about + V-ing ?** | **V-ing**（about 是介词）| **How about going** to the cinema? |\n| **What about + V-ing ?** | **V-ing** | **What about having** noodles? |\n| **Let''s + 动词原形** | **动词原形** | **Let''s go** to the park. |\n| **Shall we + 动词原形 ?** | **动词原形** | **Shall we leave** now? |\n\n> ⚠️ **铁律 ①**：How about / What about 后面只能跟 **V-ing** 或**名词**（about 是介词）！  \n> ⚠️ **铁律 ②**：Why don''t you / Why not 后面接**动词原形**！\n\n---\n\n## 🔥 邀请 vs 建议：怎么选？\n\n- **邀请**（提供机会让对方做某事）：Would you like ...? / Let''s ... \n- **建议 / 提议**（想到一个主意）：Why don''t you ...? / How about ...? / Why not ...?\n- **试探口气**（征求意见）：Shall we ...?\n\n---\n\n## 📚 完整对话模板（中考口语高分）\n\n```\nA: How about going to the cinema this Saturday?\nB: Sounds great! What about meeting at 2 p.m.?\nA: OK, let''s meet at 2.\nB: Shall we invite Lin to come along?\nA: Sure! Why don''t you ask her now?\n```\n\n---\n\n## ⏰ 应对邀请的标准答语\n\n- **接受**：That sounds good. / Sure, I''d love to. / Why not? / Sounds great!\n- **拒绝**（礼貌）：I''d love to, but I have to ... / Sorry, but I''m busy. / Maybe next time.\n\n---\n\n## ⚠️ Top 5 易错点（中考批卷红笔常出现）\n\n1. **How about 后接动词原形**：~~How about go swimming?~~ → **How about going swimming?**（about 是介词）\n2. **Why don''t you 后接 to do**：~~Why don''t you to play chess?~~ → **Why don''t you play chess?**（后接动词原形）\n3. **Why not 多了 to**：~~Why not to play chess?~~ → **Why not play chess?**\n4. **Would you like 后省 to**：~~Would you like come?~~ → **Would you like to come?**\n5. **Let''s 后接 doing**：~~Let''s going home.~~ → **Let''s go home.**\n\n---\n\n## 🧠 三秒判断口诀\n\n> ① **Would you like** + **to do**（接不定式）  \n> ② **How about / What about** + **V-ing**（about 是介词）  \n> ③ **Why don''t you / Why not / Let''s / Shall we** + **动词原形**（不带 to）',

  immersion_cards = $jsonb$[
    {"situation": "Inviting a classmate to your birthday party", "cn": "你愿意来我的生日派对吗？", "en": "Would you like to come to my birthday party?"},
    {"situation": "Suggesting a weekend movie to a friend", "cn": "周六我们一起去看电影怎么样？", "en": "How about going to the movies on Saturday?"},
    {"situation": "Trying to cheer up a tired friend", "cn": "你为什么不出去散散步呢？", "en": "Why don''t you go out for a walk?"},
    {"situation": "Making a quick plan with classmates after class", "cn": "我们一起去操场打球吧。", "en": "Let''s go to the playground and play ball."},
    {"situation": "Politely asking if you should head out", "cn": "我们现在出发好吗？", "en": "Shall we leave now?"},
    {"situation": "Proposing a study session to a study group", "cn": "周日下午一起复习数学怎么样？", "en": "What about reviewing math together on Sunday afternoon?"}
  ]$jsonb$::jsonb,

  contrast_table = $jsonb$[
    {"lhs": "How about go swimming this weekend?",          "rhs": "How about going swimming this weekend?"},
    {"lhs": "Why don''t you to play chess with me?",          "rhs": "Why don''t you play chess with me?"},
    {"lhs": "Why not to play basketball after school?",       "rhs": "Why not play basketball after school?"},
    {"lhs": "Would you like come to my party?",               "rhs": "Would you like to come to my party?"},
    {"lhs": "Let''s going home together.",                    "rhs": "Let''s go home together."},
    {"lhs": "What about have noodles for lunch?",             "rhs": "What about having noodles for lunch?"}
  ]$jsonb$::jsonb,

  reflex_cards = $jsonb$[
    {"cn": "你想喝点什么吗？",                "en": "Would you like something to drink?",            "keyword": "Would you like"},
    {"cn": "你为什么不试试呢？",              "en": "Why don''t you give it a try?",                 "keyword": "Why don''t you"},
    {"cn": "周末一起去图书馆怎么样？",        "en": "How about going to the library this weekend?",  "keyword": "How about going"},
    {"cn": "我们一起做这个项目吧。",          "en": "Let''s do this project together.",              "keyword": "Let''s do"},
    {"cn": "我们要不要叫上 Lin？",            "en": "Shall we invite Lin to join us?",               "keyword": "Shall we invite"},
    {"cn": "为什么不去公园放松一下？",        "en": "Why not relax in the park?",                    "keyword": "Why not relax"},
    {"cn": "我们点比萨怎么样？",              "en": "What about ordering pizza?",                    "keyword": "What about ordering"},
    {"cn": "我们 6 点出发好吗？",             "en": "Shall we leave at six?",                        "keyword": "Shall we leave"}
  ]$jsonb$::jsonb,

  situation_drills = $jsonb$[
    {
      "situation": "Inviting a friend who looks stressed to take a break with you.",
      "cn": "你出去走走怎么样？外面阳光真好。",
      "en": "How about going out for a walk? The sunshine is so nice today.",
      "accepted": [
        "Why don''t you take a walk outside? It''s sunny today.",
        "Let''s go out for a walk — the weather is great."
      ]
    },
    {
      "situation": "Texting a classmate to set up a weekend study group.",
      "cn": "周六上午一起复习数学怎么样？",
      "en": "How about reviewing math together on Saturday morning?",
      "accepted": [
        "Why don''t we review math on Saturday morning?",
        "What about studying math together this Saturday morning?"
      ]
    },
    {
      "situation": "Politely proposing dinner plans to a guest.",
      "cn": "您今晚想去尝尝中餐吗？",
      "en": "Would you like to try Chinese food tonight?",
      "accepted": [
        "Would you like to have Chinese food tonight?",
        "Would you like to go for Chinese food this evening?"
      ]
    },
    {
      "situation": "Suggesting that everyone leaves early for the school trip.",
      "cn": "我们 7 点出发好吗？这样不会堵车。",
      "en": "Shall we leave at seven? That way we''ll avoid the traffic.",
      "accepted": [
        "Let''s leave at 7 to avoid the traffic.",
        "Why don''t we leave at 7 so we don''t get stuck in traffic?"
      ]
    }
  ]$jsonb$::jsonb,

  correction_tasks = $jsonb$[
    {
      "wrong": "How about go to the cinema this Saturday?",
      "model": "How about going to the cinema this Saturday?",
      "hint":  "How about + V-ing",
      "why":   "**How about / What about 后面用 V-ing**（about 是介词，不是不定式的 to）。"
    },
    {
      "wrong": "Why don''t you to play with us?",
      "model": "Why don''t you play with us?",
      "hint":  "Why don''t you + 动词原形",
      "why":   "**Why don''t you / Why not** 后面直接接**动词原形**（不带 to）。"
    },
    {
      "wrong": "Why not to take a break now?",
      "model": "Why not take a break now?",
      "hint":  "Why not + 动词原形",
      "why":   "**Why not + 动词原形**（不带 to）。同样规则也适用于 Why don''t you。"
    },
    {
      "wrong": "Would you like come to my house this weekend?",
      "model": "Would you like to come to my house this weekend?",
      "hint":  "would like + to do",
      "why":   "**would like + to do** 是固定句式，漏 to 错。"
    },
    {
      "wrong": "Let''s going to the park.",
      "model": "Let''s go to the park.",
      "hint":  "Let''s + 动词原形",
      "why":   "**Let''s + 动词原形**，不能接 V-ing。"
    },
    {
      "wrong": "What about have some ice cream?",
      "model": "What about having some ice cream?",
      "hint":  "about + V-ing",
      "why":   "**What about** 后面用 **V-ing**（同 How about）。about 是介词。"
    }
  ]$jsonb$::jsonb,

  boss_questions = $jsonb$[
    {
      "stem": "— ___ a cup of tea?\n— Yes, thank you!",
      "option_a": "Would you like",
      "option_b": "Why don''t you have",
      "option_c": "How about have",
      "option_d": "Let''s have",
      "correct_answer": "A",
      "trap": "选 B 多余 have；选 C have 应为 having；选 D Let''s 用于双方共同做事。",
      "why":  "**Would you like + 名词** = 礼貌邀请。回答 Yes, thank you 锁定礼貌邀请。"
    },
    {
      "stem": "How about ___ basketball after school?",
      "option_a": "play",
      "option_b": "to play",
      "option_c": "playing",
      "option_d": "played",
      "correct_answer": "C",
      "trap": "选 A/B/D 都没用 V-ing 形式。",
      "why":  "**How about + V-ing**：about 是介词，后接 V-ing。"
    },
    {
      "stem": "Why don''t you ___ a piano class this term?",
      "option_a": "to take",
      "option_b": "taking",
      "option_c": "take",
      "option_d": "took",
      "correct_answer": "C",
      "trap": "选 A 加 to；选 B 用 ing；选 D 时态错。",
      "why":  "**Why don''t you + 动词原形**（不带 to）= take。"
    },
    {
      "stem": "— ___ go for a hike this weekend?\n— Great idea!",
      "option_a": "Why not to",
      "option_b": "How about",
      "option_c": "Why not",
      "option_d": "Let''s to",
      "correct_answer": "C",
      "trap": "选 A 多余 to；选 B 后接动词原形 go 不搭；选 D 多余 to。",
      "why":  "**Why not + 动词原形**：Why not go。选 B（How about）后接 V-ing，不接 go。"
    }
  ]$jsonb$::jsonb

WHERE code = 'g8.16';


UPDATE junior_grammar_points SET teacher_script = $jsonb$[
  {
    "text": "今天解锁**邀请与建议**的 5 大句型。中考口语和写作的\"万能套件\"。",
    "show": "🎯 Today: 5 patterns to invite & suggest",
    "duration": 9
  },
  {
    "text": "**Would you like + to do** = 礼貌邀请。Would you like **to come** to my party?",
    "show": "Would you like + to do",
    "highlight": "to come",
    "duration": 11
  },
  {
    "text": "**How about / What about + V-ing**（about 是介词）！How about **going** swimming?",
    "show": "How about + V-ing",
    "highlight": "going",
    "duration": 12
  },
  {
    "text": "**Why don''t you / Why not + 动词原形**（不带 to）。Why don''t you **play** chess?",
    "show": "Why don''t you + V (原形)",
    "highlight": "play",
    "duration": 11
  },
  {
    "text": "**Let''s + 动词原形** = 我们一起做某事。Let''s **go** to the park.",
    "show": "Let''s + V (原形)",
    "highlight": "go",
    "duration": 10
  },
  {
    "text": "**Shall we + 动词原形 ?** = 我们……好吗？（试探口气）Shall we **leave** now?",
    "show": "Shall we + V (原形)?",
    "highlight": "leave",
    "duration": 10
  },
  {
    "text": "**最大坑**：How about / What about 后接 V-ing，**不接动词原形**！",
    "show": "✗ How about go   ✓ How about going",
    "highlight": "going",
    "duration": 12
  },
  {
    "text": "**响应**：接受用 Sounds great! / I''d love to. 拒绝用 I''d love to, but ...",
    "show": "Sounds great!  /  I''d love to, but ...",
    "highlight": "I''d love to",
    "duration": 10
  }
]$jsonb$::jsonb
WHERE code = 'g8.16';


DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.16')
  AND sort_order BETWEEN 9000 AND 9099;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.16')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  (
    'How about ___ to the new museum next Sunday?',
    'mcq', 'go', 'going', 'to go', 'went', 'B',
    NULL::text[],
    'How about + V-ing。',
    '{}'::jsonb, NULL, 'invitation_how_about', false, 1, 9000
  ),
  (
    'Why don''t you ___ for the math competition?',
    'mcq', 'to sign up', 'signing up', 'sign up', 'signed up', 'C',
    NULL::text[],
    'Why don''t you + 动词原形。',
    '{}'::jsonb, NULL, 'invitation_why_dont', false, 1, 9001
  ),
  (
    'Would you like ___ at our place this evening?',
    'mcq', 'eat dinner', 'eating dinner', 'to eat dinner', 'ate dinner', 'C',
    NULL::text[],
    'Would you like + to do。',
    '{}'::jsonb, NULL, 'invitation_would_you_like', false, 1, 9002
  ),
  (
    '___ we leave a little earlier today?',
    'mcq', 'Let''s', 'Why', 'Shall', 'How about', 'C',
    NULL::text[],
    '"我们……好吗？"用 Shall we + 动词原形 ?',
    '{}'::jsonb, NULL, 'invitation_shall_we', false, 2, 9003
  ),

  (
    'How about ____ (have) a picnic this weekend?',
    'fill', NULL, NULL, NULL, NULL, 'having',
    ARRAY['having']::text[],
    'How about + V-ing。',
    '{}'::jsonb, NULL, 'invitation_how_about_ving', false, 1, 9004
  ),
  (
    'Why not ____ (join) the English club to improve your speaking?',
    'fill', NULL, NULL, NULL, NULL, 'join',
    ARRAY['join']::text[],
    'Why not + 动词原形。',
    '{}'::jsonb, NULL, 'invitation_why_not', false, 1, 9005
  ),
  (
    'Let''s ____ (start) right away. The bus is coming.',
    'fill', NULL, NULL, NULL, NULL, 'start',
    ARRAY['start']::text[],
    'Let''s + 动词原形。',
    '{}'::jsonb, NULL, 'invitation_lets', false, 1, 9006
  ),

  (
    '改写为 Why don''t you 句：  "I suggest you go to bed earlier."',
    'transform', NULL, NULL, NULL, NULL, 'Why don''t you go to bed earlier?',
    ARRAY[
      'Why don''t you go to bed earlier?'
    ]::text[],
    'suggest sb (to) do = Why don''t you + 动词原形 ?',
    '{}'::jsonb, NULL, 'invitation_suggest_transform', true, 2, 9007
  ),
  (
    '改写为 How about 句：  "Let''s play basketball this afternoon."',
    'transform', NULL, NULL, NULL, NULL, 'How about playing basketball this afternoon?',
    ARRAY[
      'How about playing basketball this afternoon?',
      'What about playing basketball this afternoon?'
    ]::text[],
    'Let''s do = How about V-ing。注意 about 后接 V-ing。',
    '{}'::jsonb, NULL, 'invitation_how_about_transform', true, 2, 9008
  ),

  (
    '改错：  "How about go swimming with us this weekend?"',
    'correction', NULL, NULL, NULL, NULL, 'How about going swimming with us this weekend?',
    ARRAY[
      'How about going swimming with us this weekend?'
    ]::text[],
    'How about 后接 V-ing。',
    '{}'::jsonb, NULL, 'invitation_how_about_error', true, 1, 9009
  ),
  (
    '改错：  "Would you like come to my birthday party?"',
    'correction', NULL, NULL, NULL, NULL, 'Would you like to come to my birthday party?',
    ARRAY[
      'Would you like to come to my birthday party?'
    ]::text[],
    'Would you like + to do（漏 to 错）。',
    '{}'::jsonb, NULL, 'invitation_would_you_like_error', true, 2, 9010
  ),

  (
    '把这句话译成英文：你要不要这周末来我家一起做作业？',
    'translation', NULL, NULL, NULL, NULL, 'Would you like to come to my house and do homework together this weekend?',
    ARRAY[
      'Would you like to come to my house and do homework together this weekend?',
      'Would you like to come over and do homework together this weekend?',
      'How about coming to my house this weekend to do homework together?'
    ]::text[],
    '考点：① 礼貌邀请 → Would you like + to do；② 两个动词并列 to come ... (and) do；③ 加上 together 强调"一起"。',
    '{}'::jsonb, '更地道：come over 是地道说法，比 come to my house 更口语化。两个动词并列时第二个动词的 to 可省略。', 'invitation_translation', true, 3, 9011
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
  SELECT id, content_depth INTO v_point_id, v_depth FROM junior_grammar_points WHERE code = 'g8.16';
  IF v_point_id IS NULL THEN
    RAISE EXCEPTION 'Gold-standard migration failed: junior_grammar_points row with code=''g8.16'' does not exist.';
  END IF;
  IF v_depth <> 3 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: content_depth for g8.16 is %, expected 3.', v_depth;
  END IF;
  SELECT count(*) INTO v_q_count
  FROM junior_grammar_questions
  WHERE point_id = v_point_id AND sort_order BETWEEN 9000 AND 9099;
  IF v_q_count <> 12 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: expected 12 questions for g8.16, got %.', v_q_count;
  END IF;
  RAISE NOTICE 'Gold-standard migration for g8.16 verified: content_depth=3, % questions seeded.', v_q_count;
END $$;


-- ╔════════════════════════════════════════════════════════════════════╗
-- ║ FILE: 20260524150000_g8_20_polite_requests_gold_standard.sql
-- ╚════════════════════════════════════════════════════════════════════╝
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


-- ╔════════════════════════════════════════════════════════════════════╗
-- ║ FILE: 20260524160000_g8_23_past_continuous_vs_simple_gold_standard.sql
-- ╚════════════════════════════════════════════════════════════════════╝
-- =====================================================================
-- Gold-standard content for G8 · 过去进行时 vs 一般过去时
-- Code: g8.23   Category: tense
-- =====================================================================
-- Pure contrast point — pairs with g8.21 (when/while) and g8.22 (past
-- continuous). Focus: which to choose when describing a past event.
-- =====================================================================

UPDATE junior_grammar_points
SET
  summary = '"正在做的事" vs "做了的事" — 中考阅读叙事段最爱考的时态对比。',
  hook_line_cn = '中考阅读叙事段几乎全靠这两个时态对照。学会"背景用进行 / 事件用过去"，长难句立刻通顺。',
  hook_line = 'Past continuous vs past simple — choose right, and 中考 narrative reading flows.',
  mnemonic = '背景 / 持续 → 过去进行时（was/were + V-ing）；事件 / 突发 / 短动作 → 一般过去时（V-ed）。',
  content_depth = 3,

  explanation_md = E'## 🎯 一句话搞定\n\n**长动作 / 当时正在进行的事 / 故事背景** → **过去进行时**  \n**短动作 / 突发事件 / 故事推进** → **一般过去时**\n\n---\n\n## 📐 一图秒分两种过去时\n\n| 维度 | 过去进行时 | 一般过去时 |\n|---|---|---|\n| **公式** | 主语 + **was/were + V-ing** | 主语 + **V-ed / 不规则** |\n| **强调** | 那一刻**正在进行** | 整件事**做了** |\n| **时间词** | at 9 last night / from 7 to 10 / at this time yesterday / while ... | yesterday / last week / ago / in 2020 / just now / when ... |\n| **故事角色** | 背景音乐 / 大长镜头 | 关键剧情 / 突发事件 |\n\n---\n\n## 🔥 三大经典组合（必背）\n\n### ① while + 过去进行时（同时进行的长动作）\n- **While I was reading**, Tom **was watching TV**.（两边都长 → 两边都进行时）\n\n### ② when + 一般过去时（突发打断长动作）\n- I **was reading** **when** the phone **rang**.（长被短打断 → 长进行时 + 短过去式）\n\n### ③ at + 时间 / from ... to ...（过去某段持续时间）\n- **At 8 last night**, I **was doing** my homework.\n- **From 7 to 10**, she **was practicing** the piano.\n\n---\n\n## 📚 决策树：怎么选时态？\n\n```\n是哪种动作？\n  ├─ 短 / 一次性 / 完成 → 一般过去时 (V-ed)\n  └─ 长 / 持续 / 当时正在 → 过去进行时 (was/were + V-ing)\n\n时间词是什么？\n  ├─ yesterday / last week / ago / 具体过去时间 → 一般过去时\n  ├─ at 9 last night / this time yesterday → 过去进行时\n  ├─ when + 短动作 → 主句进行时\n  └─ while + 长动作 → 主句进行时（两边都进行）\n```\n\n---\n\n## ⏰ 信号词清单\n\n### 一般过去时信号\n- yesterday / last week / ... ago / in 2020\n- just now / the other day\n- when + 短突发（when the phone rang）\n\n### 过去进行时信号\n- at + 具体时间 + 过去时间（at 9 last night）\n- this time yesterday / last week\n- from ... to ... yesterday\n- while + 长动作\n- all morning / all day yesterday\n\n---\n\n## ⚠️ Top 5 易错点（中考批卷红笔常出现）\n\n1. **明确时刻不用进行时**：~~At 9 last night I read.~~ → **At 9 last night I was reading.**\n2. **when 后用了进行时**：~~When the phone was ringing, I cooked.~~ → **When the phone rang, I was cooking.**（短突发用过去式）\n3. **while 后用了过去式**：~~While I read, Mom cooked.~~ → **While I was reading, Mom was cooking.**\n4. **主谓不一致**：~~Tom were sleeping.~~ → **Tom was sleeping.**\n5. **状态动词强行用进行时**：~~I was knowing the answer.~~ → **I knew the answer.**\n\n---\n\n## 🧠 三秒判断口诀\n\n> ① 是**那一刻正在做** → 过去进行时（was/were + V-ing）  \n> ② 是**做了 / 突发 / 短动作** → 一般过去时（V-ed）  \n> ③ when 句：短突发 = 过去式；长持续 = 进行时（两个时态搭配最常考）  \n> ④ while 句：两个长动作 = 两边都进行时',

  immersion_cards = $jsonb$[
    {"situation": "Friend asks about your evening yesterday", "cn": "昨晚 8 点我正在看一本英文小说。", "en": "At 8 last night I was reading an English novel."},
    {"situation": "Telling a small accident story", "cn": "我骑车上学的时候摔了一跤。", "en": "I fell off my bike while I was riding to school."},
    {"situation": "Recounting where everyone was during the storm", "cn": "雷响的时候我们正在客厅。", "en": "We were in the living room when the thunder roared."},
    {"situation": "Describing a typical week night", "cn": "妈妈做饭的时候，我在做作业。", "en": "While Mom was cooking, I was doing my homework."},
    {"situation": "Explaining why you missed the call", "cn": "对不起，你打电话的时候我在洗澡。", "en": "Sorry, I was taking a shower when you called."},
    {"situation": "A friend recounts a quick close call", "cn": "我刚关门就听到电话响了。", "en": "I had just closed the door when the phone rang."}
  ]$jsonb$::jsonb,

  contrast_table = $jsonb$[
    {"lhs": "At 9 last night I read a book.",                 "rhs": "At 9 last night I was reading a book."},
    {"lhs": "When the phone was ringing, I cooked.",          "rhs": "When the phone rang, I was cooking."},
    {"lhs": "While I read, Mom cooked.",                       "rhs": "While I was reading, Mom was cooking."},
    {"lhs": "I had homework when Dad came in.",                "rhs": "I was doing my homework when Dad came in."},
    {"lhs": "Tom were sleeping when I came home.",             "rhs": "Tom was sleeping when I came home."},
    {"lhs": "I was knowing his name then.",                    "rhs": "I knew his name then."}
  ]$jsonb$::jsonb,

  reflex_cards = $jsonb$[
    {"cn": "昨晚 10 点我正在睡觉。",          "en": "At 10 last night I was sleeping.",              "keyword": "was sleeping"},
    {"cn": "电话响时我正在做饭。",            "en": "I was cooking when the phone rang.",            "keyword": "was cooking ... rang"},
    {"cn": "我妈做饭时我在写作业。",          "en": "While Mom was cooking, I was doing homework.",  "keyword": "While ... was cooking"},
    {"cn": "我昨天看了一部新电影。",          "en": "I watched a new movie yesterday.",              "keyword": "watched yesterday"},
    {"cn": "课间我看见 Lin 在画画。",         "en": "I saw Lin drawing during the break.",           "keyword": "saw ... drawing"},
    {"cn": "他突然推门进来。",                "en": "He suddenly pushed the door open and came in.", "keyword": "suddenly pushed"},
    {"cn": "我刚到家妈妈就回来了。",          "en": "I had just got home when Mom came back.",       "keyword": "had just got home"},
    {"cn": "我整晚都在写论文。",              "en": "I was writing my essay all night.",             "keyword": "was writing ... all night"}
  ]$jsonb$::jsonb,

  situation_drills = $jsonb$[
    {
      "situation": "Mom asks why you didn''t pick up the phone last night.",
      "cn": "你打电话的时候，我正在洗澡。",
      "en": "I was taking a shower when you called.",
      "accepted": [
        "I was in the shower when the phone rang.",
        "When you called, I was showering."
      ]
    },
    {
      "situation": "Recounting a small classroom incident to the homeroom teacher.",
      "cn": "Lin 在画画的时候，Tom 不小心碰倒了她的水杯。",
      "en": "While Lin was drawing, Tom accidentally knocked over her water cup.",
      "accepted": [
        "Lin was drawing when Tom accidentally knocked over her cup.",
        "While Lin was drawing, Tom knocked her cup over by mistake."
      ]
    },
    {
      "situation": "Telling a friend what you did over the weekend.",
      "cn": "周六我看了一部电影，周日和家人吃了大餐。",
      "en": "On Saturday I watched a movie, and on Sunday I had a big dinner with my family.",
      "accepted": [
        "I watched a movie on Saturday and had a big family dinner on Sunday.",
        "Saturday I saw a film, and Sunday I had a big meal with family."
      ]
    },
    {
      "situation": "Describing what you saw on your way home yesterday.",
      "cn": "我回家的路上看到一个老人正在喂猫。",
      "en": "On my way home, I saw an old man feeding a cat.",
      "accepted": [
        "I noticed an old man feeding a cat as I was walking home.",
        "While walking home, I saw an old man feeding a cat."
      ]
    }
  ]$jsonb$::jsonb,

  correction_tasks = $jsonb$[
    {
      "wrong": "At 9 last night I read a book in my room.",
      "model": "At 9 last night I was reading a book in my room.",
      "hint":  "明确时刻用进行时",
      "why":   "**at 9 last night = 过去某一刻** → 强调\"那一刻正在做\" → **过去进行时**。"
    },
    {
      "wrong": "When the phone was ringing, I cooked dinner.",
      "model": "When the phone rang, I was cooking dinner.",
      "hint":  "when 后用短动作",
      "why":   "**when 通常引导短突发动作** → 用一般过去时 rang；被打断的长动作 (cook) → 过去进行时 was cooking。"
    },
    {
      "wrong": "While I read, Mom cooked dinner.",
      "model": "While I was reading, Mom was cooking dinner.",
      "hint":  "while 两边都长",
      "why":   "**while 引导两个长动作同时进行** → 两边都用过去进行时。"
    },
    {
      "wrong": "I had homework when Dad came home yesterday.",
      "model": "I was doing my homework when Dad came home yesterday.",
      "hint":  "强调当时正在做",
      "why":   "**当 Dad 进门时正在写作业** → 用 was doing；have/had homework 是\"有作业\"，意思不对。"
    },
    {
      "wrong": "Tom were sleeping when I came in.",
      "model": "Tom was sleeping when I came in.",
      "hint":  "Tom 单数",
      "why":   "**Tom = 第三人称单数** → 用 **was**。"
    },
    {
      "wrong": "I was knowing the answer at that time.",
      "model": "I knew the answer at that time.",
      "hint":  "状态动词不用进行时",
      "why":   "**know / like / love / want / believe** 是**状态动词，不能用进行时**。改用一般过去时 knew。"
    }
  ]$jsonb$::jsonb,

  boss_questions = $jsonb$[
    {
      "stem": "At 8:30 yesterday evening, my family ___ dinner together.",
      "option_a": "had",
      "option_b": "was having",
      "option_c": "were having",
      "option_d": "have",
      "correct_answer": "B",
      "trap": "选 A 一般过去时不强调当时正在做。选 C my family 视为单数应是 was。",
      "why":  "**At 8:30 yesterday evening = 过去某一刻 + 家人在吃饭**（强调\"正在\"）→ 过去进行时 was having。"
    },
    {
      "stem": "I ___ my homework when the lights suddenly ___.",
      "option_a": "was doing / went out",
      "option_b": "did / were going out",
      "option_c": "was doing / were going out",
      "option_d": "did / went out",
      "correct_answer": "A",
      "trap": "选 D 两边过去式 — 没体现\"被打断\"。选 B/C 进行时和过去式角色搞反。",
      "why":  "**长动作（写作业）被短动作（灯灭）打断** → 长进行时 was doing + 短过去式 went out。"
    },
    {
      "stem": "While Lin and Mei ___ for the bus, they ___ a strange noise.",
      "option_a": "waited / heard",
      "option_b": "were waiting / heard",
      "option_c": "were waiting / were hearing",
      "option_d": "waited / were hearing",
      "correct_answer": "B",
      "trap": "选 A while 后必须进行时。选 C/D 听见是短动作不该用进行时。",
      "why":  "**while + 长动作（等车）→ 过去进行时**；短动作（听见）→ 一般过去式。"
    },
    {
      "stem": "Yesterday I ___ home at 5 p.m., ___ a shower, and ___ dinner.",
      "option_a": "was getting / was taking / was having",
      "option_b": "got / took / had",
      "option_c": "got / was taking / was having",
      "option_d": "was getting / took / had",
      "correct_answer": "B",
      "trap": "选 A/C/D 多余进行时 — 三件事都是已完成动作，按顺序发生。",
      "why":  "**三个完成的动作按顺序叙述** → 一般过去时（got / took / had）。没有强调\"正在\"的语境。"
    }
  ]$jsonb$::jsonb

WHERE code = 'g8.23';


UPDATE junior_grammar_points SET teacher_script = $jsonb$[
  {
    "text": "今天解锁**过去进行时 vs 一般过去时**。中考阅读叙事段的核心对比 — 用错时态整段意思就变。",
    "show": "🎯 Today: was doing  vs  did",
    "duration": 10
  },
  {
    "text": "**核心区别**：进行时强调\"**那一刻正在做**\"；过去时强调\"**做了 / 完成了**\"。",
    "show": "was doing = in progress   |   did = completed",
    "highlight": "was doing ... did",
    "duration": 12
  },
  {
    "text": "**信号词决定时态**：at 8 last night / this time yesterday / while → 进行时；yesterday / last / ago → 过去时。",
    "show": "at 8 last night → was doing   |   yesterday → did",
    "highlight": "at 8 last night",
    "duration": 13
  },
  {
    "text": "**经典搭配 ①**：长被短打断。**I was reading when the phone rang.**",
    "show": "long: was reading   |   short: rang",
    "highlight": "rang",
    "duration": 11
  },
  {
    "text": "**经典搭配 ②**：while 两个长动作同时进行 → **两边都进行时**。",
    "show": "While Mom was cooking, I was reading.",
    "highlight": "was cooking ... was reading",
    "duration": 12
  },
  {
    "text": "**最大坑 ①**：明确时刻不用过去式。~~At 9 last night I read~~ → **was reading**。",
    "show": "✗ At 9 ... read   ✓ At 9 ... was reading",
    "highlight": "was reading",
    "duration": 12
  },
  {
    "text": "**最大坑 ②**：when 后**绝大多数**接短突发动作（过去式），不接进行时。",
    "show": "✗ When ... was ringing   ✓ When ... rang",
    "highlight": "rang",
    "duration": 12
  },
  {
    "text": "**最大坑 ③**：状态动词 (know / like / want) **不用进行时**！下一关进入实战。",
    "show": "✗ was knowing   ✓ knew",
    "highlight": "knew",
    "duration": 11
  }
]$jsonb$::jsonb
WHERE code = 'g8.23';


DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.23')
  AND sort_order BETWEEN 9000 AND 9099;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.23')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  (
    'At 7:30 yesterday morning, my sister ___ breakfast.',
    'mcq', 'had', 'was having', 'has', 'is having', 'B',
    NULL::text[],
    'at 7:30 yesterday = 过去某一刻 + 正在吃 → 进行时 was having。',
    '{}'::jsonb, NULL, 'past_vs_continuous_time_marker', false, 1, 9000
  ),
  (
    'When I got to the bus stop, the bus ___ just ___.',
    'mcq', 'was / leaving', 'had / left', 'was / left', 'is / leaving', 'B',
    NULL::text[],
    'just 表"刚刚" + 过去完成 had left（突发动作 in 过去之前）。',
    '{}'::jsonb, NULL, 'past_perfect', false, 3, 9001
  ),
  (
    'While Lin and Wang ___ for the bus, they ___ an old friend.',
    'mcq', 'waited / met', 'were waiting / met', 'were waiting / were meeting', 'waited / were meeting', 'B',
    NULL::text[],
    'while 后用进行时（长动作）+ 突发动作过去式 met。',
    '{}'::jsonb, NULL, 'past_continuous_while', false, 2, 9002
  ),
  (
    'I ___ my keys this morning, but luckily I ___ them after ten minutes.',
    'mcq', 'lose / find', 'lost / found', 'was losing / found', 'lost / was finding', 'B',
    NULL::text[],
    '两件事都是过去完成的动作（先丢后找到）→ 都用一般过去时。',
    '{}'::jsonb, NULL, 'past_simple_sequence', false, 2, 9003
  ),

  (
    'At this time yesterday, I ____ (study) in the library.',
    'fill', NULL, NULL, NULL, NULL, 'was studying',
    ARRAY['was studying']::text[],
    'at this time yesterday = 过去某一刻 → 进行时 was studying。',
    '{}'::jsonb, NULL, 'past_continuous_at_this_time', false, 1, 9004
  ),
  (
    'When the rain ____ (stop), we ____ (go) out for a walk.',
    'fill', NULL, NULL, NULL, NULL, 'stopped / went',
    ARRAY['stopped / went']::text[],
    '两个动作都已完成（先停雨后出门）→ 一般过去时。',
    '{}'::jsonb, NULL, 'past_simple_sequence', false, 2, 9005
  ),
  (
    'Tom ____ (watch) TV when the doorbell ____ (ring).',
    'fill', NULL, NULL, NULL, NULL, 'was watching / rang',
    ARRAY['was watching / rang']::text[],
    '长动作（看电视）+ 短突发（门铃）→ 进行时 + 过去式。',
    '{}'::jsonb, NULL, 'past_continuous_when', false, 2, 9006
  ),

  (
    '合并：  "I was riding my bike. I fell."',
    'transform', NULL, NULL, NULL, NULL, 'I fell while I was riding my bike.',
    ARRAY[
      'I fell while I was riding my bike.',
      'While I was riding my bike, I fell.'
    ]::text[],
    '长动作 + 突发摔倒 → while 引导进行时 + 主句过去式。',
    '{}'::jsonb, NULL, 'past_continuous_combine', true, 2, 9007
  ),
  (
    '改写为一般过去时（去掉强调"正在"）：  "I was eating dinner at 7 p.m."（强调点改为"吃完饭了"）',
    'transform', NULL, NULL, NULL, NULL, 'I had dinner at 7 p.m.',
    ARRAY[
      'I had dinner at 7 p.m.',
      'I ate dinner at 7 p.m.'
    ]::text[],
    '从"正在"改为"做了"→ was eating → had / ate。',
    '{}'::jsonb, NULL, 'past_continuous_to_simple', true, 3, 9008
  ),

  (
    '改错：  "At 9 last night I read a book quietly."',
    'correction', NULL, NULL, NULL, NULL, 'At 9 last night I was reading a book quietly.',
    ARRAY[
      'At 9 last night I was reading a book quietly.'
    ]::text[],
    '强调过去某一刻正在做 → 过去进行时。',
    '{}'::jsonb, NULL, 'past_continuous_time_marker', true, 2, 9009
  ),
  (
    '改错：  "While Mom cooked, I watched TV."',
    'correction', NULL, NULL, NULL, NULL, 'While Mom was cooking, I was watching TV.',
    ARRAY[
      'While Mom was cooking, I was watching TV.'
    ]::text[],
    'while 引导两个长动作同时进行 → 两边都用进行时。',
    '{}'::jsonb, NULL, 'past_continuous_while', true, 2, 9010
  ),

  (
    '把这句话译成英文：昨天下午雷声响起的时候，我正在客厅看书。',
    'translation', NULL, NULL, NULL, NULL, 'I was reading in the living room when the thunder roared yesterday afternoon.',
    ARRAY[
      'I was reading in the living room when the thunder roared yesterday afternoon.',
      'Yesterday afternoon, I was reading in the living room when it started thundering.',
      'When the thunder hit yesterday afternoon, I was reading in the living room.'
    ]::text[],
    '考点：① 长动作（看书）+ 短突发（雷声）→ 进行时 + 过去式；② "雷声响起"= the thunder roared / started thundering；③ 时间状语 yesterday afternoon 可放句首或句末。',
    '{}'::jsonb, '更地道：thunder roared / hit / struck 都对；started thundering 强调瞬间开始打雷。', 'past_continuous_translation', true, 3, 9011
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
  SELECT id, content_depth INTO v_point_id, v_depth FROM junior_grammar_points WHERE code = 'g8.23';
  IF v_point_id IS NULL THEN
    RAISE EXCEPTION 'Gold-standard migration failed: junior_grammar_points row with code=''g8.23'' does not exist.';
  END IF;
  IF v_depth <> 3 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: content_depth for g8.23 is %, expected 3.', v_depth;
  END IF;
  SELECT count(*) INTO v_q_count
  FROM junior_grammar_questions
  WHERE point_id = v_point_id AND sort_order BETWEEN 9000 AND 9099;
  IF v_q_count <> 12 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: expected 12 questions for g8.23, got %.', v_q_count;
  END IF;
  RAISE NOTICE 'Gold-standard migration for g8.23 verified: content_depth=3, % questions seeded.', v_q_count;
END $$;


-- ╔════════════════════════════════════════════════════════════════════╗
-- ║ FILE: 20260524170000_g8_30_subjunctive_gold_standard.sql
-- ╚════════════════════════════════════════════════════════════════════╝
-- =====================================================================
-- Gold-standard content for G8 · 虚拟语气入门 · Subjunctive (Intro)
-- Code: g8.30   Category: clause
-- =====================================================================
-- 中考-高考 bridge point. Covers: If I were ... / I wish I were ...
-- Builds foundation for the advanced subjunctive Lab (/grammar-lab/subjunctive).
-- =====================================================================

UPDATE junior_grammar_points
SET
  summary = '"如果我是你……" / "真希望我会……" — 表达"现实没发生的假设和愿望"，中考-高考衔接关键考点。',
  hook_line_cn = '中考稳拿、高考起跑：If I were you / I wish I were。一个 were，记住就够。',
  hook_line = 'If I were you — the bridge from 中考 grammar to 高考 sophistication.',
  mnemonic = '与现在事实相反 = If + 过去式 (be 用 were), 主语 + would / could + 动词原形。',
  content_depth = 3,

  explanation_md = E'## 🎯 一句话搞定\n\n**与现在事实相反的假设 / 愿望** → 用 **虚拟语气**：动词用**过去式**，be 动词**永远用 were**。\n\n---\n\n## 📐 两大核心句型\n\n### ① if 引导的虚拟条件句（与现在相反）\n\n**公式**：If + 主语 + **过去式** (be 用 **were**)，主语 + **would / could / might** + **动词原形**。\n\n- **If I were you**, I **would study** harder.（事实：我不是你）\n- **If she had** time, she **would help** us.（事实：她没时间）\n- **If we knew** the answer, we **would tell** you.（事实：我们不知道）\n\n### ② I wish 引导的虚拟愿望（与现在相反）\n\n**公式**：I wish + 主语 + **过去式** (be 用 **were**) / **could** + 动词原形。\n\n- **I wish I were** taller.（事实：我不高）\n- **I wish I could fly**.（事实：我不会飞）\n- **I wish I had** more time.（事实：我时间不够）\n\n---\n\n## ⚠️ 与一般 if 条件句（g8.17）的区别（重要！）\n\n| 类型 | 现实可能性 | 时态 | 例子 |\n|---|---|---|---|\n| **真实条件句**（g8.17） | 真的可能发生 | If + 一般现在时, 主句 will | **If it rains** tomorrow, we **will stay** home. |\n| **虚拟条件句**（g8.30） | 与事实相反 | If + 过去式 (were), 主句 would | **If it rained** every day, we **would not** go out.（事实：不是天天下雨）|\n\n→ **同一个 If 句，时态变了意思就变了！**\n\n---\n\n## 🔥 中考最爱考的 4 句套话\n\n1. **If I were you, I would + 动词原形** — 给建议的高分句型\n2. **If I had + 名词, I would + 动词原形** — 假设有某物会怎么做\n3. **I wish I were + 形容词 / 名词** — 表达愿望\n4. **I wish I could + 动词原形** — 表达"真希望能……"\n\n---\n\n## ⏰ 看到这些 = 虚拟语气\n\n- **If I / he / she / it were** ...（虚拟用 were，不是 was！）\n- **I wish ...**\n- **would / could / might + 动词原形**（在主句中）\n- 语境是"假设 / 愿望"（现实并非如此）\n\n---\n\n## ⚠️ Top 5 易错点（中考批卷红笔常出现）\n\n1. **虚拟语气用 was**（最高频错误）：~~If I was you ...~~ → **If I were you ...**（虚拟里所有人称都用 were）\n2. **主句用 will / 现在时**：~~If I were you, I will study harder.~~ → **If I were you, I would study harder.**\n3. **wish 后用现在时**：~~I wish I am taller.~~ → **I wish I were taller.**\n4. **wish 后用 can**：~~I wish I can fly.~~ → **I wish I could fly.**\n5. **混淆真实 vs 虚拟**：~~If it rains, I would stay home.~~（混用）→ 真实：If it rains, I **will** stay home. / 虚拟：If it **rained**, I would stay home.\n\n---\n\n## 🧠 三秒判断口诀\n\n> ① 看到 **If I were / If he were** → 虚拟语气  \n> ② 看到 **I wish + 过去式 / could** → 虚拟愿望  \n> ③ 虚拟主句永远是 **would / could / might + 动词原形**  \n> ④ 是否有可能发生？可能 → 用真实条件句；不可能 / 反事实 → 虚拟',

  immersion_cards = $jsonb$[
    {"situation": "Giving honest advice to a worried friend", "cn": "如果我是你，我就再努力一点。", "en": "If I were you, I would try harder."},
    {"situation": "Joking about your height", "cn": "真希望我能再高一点。", "en": "I wish I were a little taller."},
    {"situation": "Dreaming aloud about superpowers", "cn": "真希望我会飞。", "en": "I wish I could fly."},
    {"situation": "Imagining a free Saturday", "cn": "如果我有时间，我会陪你去看电影。", "en": "If I had time, I would go to the movies with you."},
    {"situation": "Wishing you spoke better English", "cn": "真希望我的英语更好。", "en": "I wish my English were better."},
    {"situation": "Imagining a different career", "cn": "如果我是一名医生，我会帮助更多人。", "en": "If I were a doctor, I would help more people."}
  ]$jsonb$::jsonb,

  contrast_table = $jsonb$[
    {"lhs": "If I was you, I would help him.",                "rhs": "If I were you, I would help him."},
    {"lhs": "If I were you, I will study harder.",             "rhs": "If I were you, I would study harder."},
    {"lhs": "I wish I am taller.",                              "rhs": "I wish I were taller."},
    {"lhs": "I wish I can fly like a bird.",                    "rhs": "I wish I could fly like a bird."},
    {"lhs": "If it rains, I would stay home (this Saturday).",  "rhs": "If it rains, I will stay home (this Saturday)."},
    {"lhs": "If he was here, he would help us.",                "rhs": "If he were here, he would help us."}
  ]$jsonb$::jsonb,

  reflex_cards = $jsonb$[
    {"cn": "如果我是你，我就道歉。",          "en": "If I were you, I would apologize.",             "keyword": "If I were you"},
    {"cn": "真希望我会弹钢琴。",              "en": "I wish I could play the piano.",                "keyword": "wish I could"},
    {"cn": "如果我有更多时间……",              "en": "If I had more time ...",                        "keyword": "If I had"},
    {"cn": "真希望今天是周六。",              "en": "I wish today were Saturday.",                   "keyword": "wish today were"},
    {"cn": "如果我是老师，我会少留作业。",    "en": "If I were a teacher, I would give less homework.","keyword": "If I were a teacher"},
    {"cn": "真希望我能去英国。",              "en": "I wish I could go to the UK.",                  "keyword": "wish I could go"},
    {"cn": "如果他在这儿，我们就能拿主意了。","en": "If he were here, we could make a decision.",    "keyword": "If he were here"},
    {"cn": "真希望我更勇敢一点。",            "en": "I wish I were braver.",                         "keyword": "wish I were braver"}
  ]$jsonb$::jsonb,

  situation_drills = $jsonb$[
    {
      "situation": "A friend asks for advice on an embarrassing situation.",
      "cn": "如果我是你，我就直接说实话。",
      "en": "If I were you, I would just tell the truth.",
      "accepted": [
        "If I were in your shoes, I''d just tell the truth.",
        "Were I you, I would simply be honest."
      ]
    },
    {
      "situation": "Sharing a wish about your favorite hobby with your tutor.",
      "cn": "真希望我能像 Lin 一样会弹钢琴。",
      "en": "I wish I could play the piano like Lin.",
      "accepted": [
        "I wish I were able to play the piano as well as Lin.",
        "How I wish I could play the piano like Lin does."
      ]
    },
    {
      "situation": "Daydreaming with a classmate about a stress-free weekend.",
      "cn": "如果今天是周六，我们就可以一起去公园了。",
      "en": "If today were Saturday, we could go to the park together.",
      "accepted": [
        "If today were a weekend, we could hang out at the park.",
        "Were it Saturday today, we could go to the park together."
      ]
    },
    {
      "situation": "Comforting a discouraged classmate.",
      "cn": "如果我有更多时间，我就帮你一起复习了。",
      "en": "If I had more time, I would help you review.",
      "accepted": [
        "If I had more free time, I would study with you.",
        "Had I more time, I would help you study."
      ]
    }
  ]$jsonb$::jsonb,

  correction_tasks = $jsonb$[
    {
      "wrong": "If I was you, I would tell the truth.",
      "model": "If I were you, I would tell the truth.",
      "hint":  "虚拟语气用 were",
      "why":   "**虚拟语气里 be 动词全部用 were**（无论主语是 I / he / she / it）。If I was 不对。"
    },
    {
      "wrong": "If I were you, I will study harder.",
      "model": "If I were you, I would study harder.",
      "hint":  "主句用 would",
      "why":   "**虚拟条件句主句必须用 would / could / might + 动词原形**，不能用 will。"
    },
    {
      "wrong": "I wish I am taller than my brother.",
      "model": "I wish I were taller than my brother.",
      "hint":  "wish 后用过去式 (were)",
      "why":   "**wish + 与现在相反的愿望** → 从句用过去式，be 用 were。"
    },
    {
      "wrong": "I wish I can speak French fluently.",
      "model": "I wish I could speak French fluently.",
      "hint":  "wish 后情态用 could",
      "why":   "**I wish 后用 could + 动词原形**，不能用 can。"
    },
    {
      "wrong": "If it rains tomorrow, I would stay at home.",
      "model": "If it rains tomorrow, I will stay at home.",
      "hint":  "真实条件句用 will",
      "why":   "**明天可能下雨** = 真实条件（主将从现）→ 主句 will，不是 would。虚拟才用 would。"
    },
    {
      "wrong": "If he was here, he would solve the problem.",
      "model": "If he were here, he would solve the problem.",
      "hint":  "虚拟 he were",
      "why":   "**虚拟语气**里 he / she / it 都用 **were**（不是 was）。"
    }
  ]$jsonb$::jsonb,

  boss_questions = $jsonb$[
    {
      "stem": "If I ___ you, I ___ apologize right away.",
      "option_a": "was / will",
      "option_b": "were / would",
      "option_c": "am / will",
      "option_d": "were / will",
      "correct_answer": "B",
      "trap": "选 A/D 都用了 will — 虚拟主句必须 would。选 C 完全是真实条件句。",
      "why":  "**虚拟语气**：If I **were** + 主句 would。"
    },
    {
      "stem": "I wish I ___ a famous singer like her.",
      "option_a": "am",
      "option_b": "were",
      "option_c": "was",
      "option_d": "be",
      "correct_answer": "B",
      "trap": "选 C 是常见错（用 was 当虚拟）。中考阅卷红笔最高频之一。",
      "why":  "**wish + 过去式 (be 用 were)** → I wish I **were**。"
    },
    {
      "stem": "If today ___ Sunday, we ___ go shopping.",
      "option_a": "is / will",
      "option_b": "were / would",
      "option_c": "were / will",
      "option_d": "was / would",
      "correct_answer": "B",
      "trap": "选 A 是真实条件句。选 C 主句错。选 D today 用 was — 虚拟全用 were。",
      "why":  "今天不是周日（与事实相反）→ 虚拟：were + would。"
    },
    {
      "stem": "Lin wishes she ___ how to swim. She really wants to learn.",
      "option_a": "knows",
      "option_b": "knew",
      "option_c": "can know",
      "option_d": "is knowing",
      "correct_answer": "B",
      "trap": "选 A/D 都用现在时。选 C can know 不存在。",
      "why":  "**wish + 过去式**（与现在事实相反 → 她不会游泳）→ **knew**。"
    }
  ]$jsonb$::jsonb

WHERE code = 'g8.30';


UPDATE junior_grammar_points SET teacher_script = $jsonb$[
  {
    "text": "今天解锁**虚拟语气**。中考-高考衔接的关键考点，一个 were，记住就够。",
    "show": "🎯 Today: If I were ... / I wish I were ...",
    "duration": 10
  },
  {
    "text": "**核心**：表达**与事实相反**的假设或愿望 → 动词用**过去式**，be 永远用 **were**。",
    "show": "If + past tense (be = were), would / could + V",
    "highlight": "were",
    "duration": 12
  },
  {
    "text": "**句型 ①** ：**If I were you, I would ...**（与现在事实相反）。",
    "show": "If I were you, I would study harder.",
    "highlight": "were ... would",
    "duration": 11
  },
  {
    "text": "**句型 ②**：**I wish I were ... / I wish I could ...**（表达愿望）。",
    "show": "I wish I were taller.   I wish I could fly.",
    "highlight": "were ... could",
    "duration": 12
  },
  {
    "text": "**最致命错误**：虚拟里**所有人称的 be 都用 were**！If I **were**，If he **were**。",
    "show": "✗ If I was   ✓ If I were",
    "highlight": "were",
    "duration": 12
  },
  {
    "text": "**第二大坑**：虚拟主句必须用 **would / could / might + 动词原形**，不能用 will！",
    "show": "✗ If I were you, I will   ✓ If I were you, I would",
    "highlight": "would",
    "duration": 13
  },
  {
    "text": "**与真实条件句对比**：If it rains tomorrow, I **will** stay home（可能发生）≠ If it **rained** every day, I would not go out（不可能 / 反事实）。",
    "show": "If it rains → will   |   If it rained → would",
    "highlight": "rained ... would",
    "duration": 14
  },
  {
    "text": "**记住这几句**：If I were you / I wish I were / I wish I could — 中考写作建议类高分句型。",
    "show": "4 templates to memorize",
    "highlight": "to memorize",
    "duration": 10
  }
]$jsonb$::jsonb
WHERE code = 'g8.30';


DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.30')
  AND sort_order BETWEEN 9000 AND 9099;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.30')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  (
    'If I ___ you, I ___ tell the truth.',
    'mcq', 'was / will', 'were / will', 'were / would', 'am / would', 'C',
    NULL::text[],
    '虚拟语气：If I were you + I would。',
    '{}'::jsonb, NULL, 'subjunctive_if_i_were', false, 1, 9000
  ),
  (
    'I wish I ___ braver in front of the class.',
    'mcq', 'am', 'was', 'were', 'be', 'C',
    NULL::text[],
    'I wish 后虚拟 be → were。',
    '{}'::jsonb, NULL, 'subjunctive_wish_were', false, 1, 9001
  ),
  (
    'If he ___ here, he ___ help us solve the problem.',
    'mcq', 'was / would', 'were / would', 'is / will', 'were / will', 'B',
    NULL::text[],
    '虚拟：he were + would。',
    '{}'::jsonb, NULL, 'subjunctive_he_were', false, 2, 9002
  ),
  (
    'I wish I ___ play the violin as well as Lin.',
    'mcq', 'can', 'could', 'will', 'am', 'B',
    NULL::text[],
    'wish 后情态用 could（不能 can）。',
    '{}'::jsonb, NULL, 'subjunctive_wish_could', false, 2, 9003
  ),

  (
    'If I ____ (be) you, I would join the English Club.',
    'fill', NULL, NULL, NULL, NULL, 'were',
    ARRAY['were']::text[],
    '虚拟语气 be → were。',
    '{}'::jsonb, NULL, 'subjunctive_were', false, 1, 9004
  ),
  (
    'I wish today ____ (be) Saturday so we could relax.',
    'fill', NULL, NULL, NULL, NULL, 'were',
    ARRAY['were']::text[],
    'I wish 后所有人称 be 都用 were。',
    '{}'::jsonb, NULL, 'subjunctive_wish_today_were', false, 2, 9005
  ),
  (
    'If I ____ (have) more time, I would help you with your essay.',
    'fill', NULL, NULL, NULL, NULL, 'had',
    ARRAY['had']::text[],
    'If + 过去式 (had)；主句 would help。',
    '{}'::jsonb, NULL, 'subjunctive_if_had', false, 2, 9006
  ),

  (
    '改写为虚拟语气：  "I am not you. I will not tell him."',
    'transform', NULL, NULL, NULL, NULL, 'If I were you, I would tell him.',
    ARRAY[
      'If I were you, I would tell him.',
      'Were I you, I would tell him.'
    ]::text[],
    '事实"我不是你 + 不会说" → 虚拟"如果我是你 + 会说"。',
    '{}'::jsonb, NULL, 'subjunctive_transform', true, 3, 9007
  ),
  (
    '用 I wish 改写：  "I''m not a good singer."',
    'transform', NULL, NULL, NULL, NULL, 'I wish I were a good singer.',
    ARRAY[
      'I wish I were a good singer.'
    ]::text[],
    'I am not X = I wish I were X（与事实相反的愿望）。',
    '{}'::jsonb, NULL, 'subjunctive_wish_transform', true, 3, 9008
  ),

  (
    '改错：  "If I was you, I will study harder."',
    'correction', NULL, NULL, NULL, NULL, 'If I were you, I would study harder.',
    ARRAY[
      'If I were you, I would study harder.'
    ]::text[],
    '虚拟语气：① If I were（不是 was）；② 主句用 would（不是 will）。',
    '{}'::jsonb, NULL, 'subjunctive_was_will_error', true, 2, 9009
  ),
  (
    '改错：  "I wish I can speak French fluently."',
    'correction', NULL, NULL, NULL, NULL, 'I wish I could speak French fluently.',
    ARRAY[
      'I wish I could speak French fluently.'
    ]::text[],
    'wish 后情态用 could，不能用 can。',
    '{}'::jsonb, NULL, 'subjunctive_wish_could_error', true, 2, 9010
  ),

  (
    '把这句话译成英文：如果我是你，我会先冷静下来再做决定。',
    'translation', NULL, NULL, NULL, NULL, 'If I were you, I would calm down first before making a decision.',
    ARRAY[
      'If I were you, I would calm down first before making a decision.',
      'If I were in your shoes, I would calm down before deciding.',
      'Were I you, I would calm down first and then decide.'
    ]::text[],
    '考点：① 虚拟条件 If I were you；② 主句 would + 动词原形；③ before + V-ing（介词后）。',
    '{}'::jsonb, '更地道：be in your shoes 比 be you 更自然；calm down first 比 be calm 更地道。', 'subjunctive_translation', true, 3, 9011
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
  SELECT id, content_depth INTO v_point_id, v_depth FROM junior_grammar_points WHERE code = 'g8.30';
  IF v_point_id IS NULL THEN
    RAISE EXCEPTION 'Gold-standard migration failed: junior_grammar_points row with code=''g8.30'' does not exist.';
  END IF;
  IF v_depth <> 3 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: content_depth for g8.30 is %, expected 3.', v_depth;
  END IF;
  SELECT count(*) INTO v_q_count
  FROM junior_grammar_questions
  WHERE point_id = v_point_id AND sort_order BETWEEN 9000 AND 9099;
  IF v_q_count <> 12 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: expected 12 questions for g8.30, got %.', v_q_count;
  END IF;
  RAISE NOTICE 'Gold-standard migration for g8.30 verified: content_depth=3, % questions seeded.', v_q_count;
END $$;

