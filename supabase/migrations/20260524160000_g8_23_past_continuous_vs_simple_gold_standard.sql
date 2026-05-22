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
