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
    NULL::jsonb, NULL, 'passive_present', false, 1, 9000
  ),
  (
    'The Forbidden City ___ over 600 years ago.',
    'mcq', 'built', 'was built', 'is built', 'was building', 'B',
    NULL::text[],
    'over 600 years ago = 过去时间 + 主语 City 被建造 → **was built**（过去时被动）。',
    NULL::jsonb, NULL, 'passive_past', false, 1, 9001
  ),
  (
    'Mobile phones ___ off before the exam begins.',
    'mcq', 'must turn', 'must be turn', 'must be turned', 'must turning', 'C',
    NULL::text[],
    '情态被动公式：**must + be + V-ed**。turn → turned（过去分词）。',
    NULL::jsonb, NULL, 'passive_modal', false, 2, 9002
  ),
  (
    'My homework ___ already. I can play games now.',
    'mcq', 'has done', 'has been done', 'is done', 'was done', 'B',
    NULL::text[],
    '主语 homework 是被做的 + 时间 already → 现在完成时被动 = **has been + V-ed**。漏掉 been 是最常见错误。',
    NULL::jsonb, NULL, 'passive_perfect', false, 2, 9003
  ),

  -- ─── 3 fill-in ───
  (
    'English ____ (speak) in more than 100 countries in the world.',
    'fill', NULL, NULL, NULL, NULL, 'is spoken',
    ARRAY['is spoken']::text[],
    '客观事实（一般现在时）+ 主语 English 被说 → **is spoken**。',
    NULL::jsonb, NULL, 'passive_present', false, 1, 9004
  ),
  (
    'The new bridge ____ (open) to the public next Monday.',
    'fill', NULL, NULL, NULL, NULL, 'will be opened',
    ARRAY['will be opened', 'is going to be opened']::text[],
    'next Monday = 将来 + 主语 bridge 被开通 → **will be opened**（或 is going to be opened）。',
    NULL::jsonb, NULL, 'passive_future', false, 2, 9005
  ),
  (
    'The window ____ (break) by Tom yesterday afternoon.',
    'fill', NULL, NULL, NULL, NULL, 'was broken',
    ARRAY['was broken']::text[],
    'yesterday afternoon = 过去 + window 被打破 → **was broken**。注意 break 的过去分词是 **broken**，不是 broke。',
    NULL::jsonb, '中考阅卷里 "was broke" 是最高频错误之一。', 'passive_past', false, 2, 9006
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
    NULL::jsonb, NULL, 'passive_transform', true, 2, 9007
  ),
  (
    '改写为被动语态：  "They will build a new park here next year."',
    'transform', NULL, NULL, NULL, NULL, 'A new park will be built here next year.',
    ARRAY[
      'A new park will be built here next year.',
      'A new park is going to be built here next year.'
    ]::text[],
    '将来时被动 = **will be + V-ed**。a new park 提前作主语，by them 通常省略（执行者不重要）。',
    NULL::jsonb, '将来时被动里很多同学漏掉 "be"，记住公式：will + be + V-ed。', 'passive_transform', true, 2, 9008
  ),

  -- ─── 2 correction ───
  (
    '改错：  "Many trees was planted in our city last spring."',
    'correction', NULL, NULL, NULL, NULL, 'Many trees were planted in our city last spring.',
    ARRAY[
      'Many trees were planted in our city last spring.'
    ]::text[],
    '主语 trees 是复数，be 动词过去式必须用 **were**，不是 was。',
    NULL::jsonb, NULL, 'passive_subject_verb', true, 2, 9009
  ),
  (
    '改错：  "The accident was happened on a busy road yesterday."',
    'correction', NULL, NULL, NULL, NULL, 'The accident happened on a busy road yesterday.',
    ARRAY[
      'The accident happened on a busy road yesterday.'
    ]::text[],
    '**happen** 是不及物动词，没有被动形式。直接用一般过去时 **happened**。',
    NULL::jsonb, '常见同类陷阱：take place / appear / arrive / belong to — 都不能被动。', 'passive_intransitive', true, 3, 9010
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
    NULL::jsonb, '"during + 事件" 比 "in + 事件" 更地道，强调时间段而不是时间点。', 'passive_translation', true, 3, 9011
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
