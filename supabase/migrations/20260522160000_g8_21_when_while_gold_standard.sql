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
      "trap": "选 A 两边都过去式 — 没体现"被打断"。选 C 两边进行时 — 门铃是短突发不能用进行时。",
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
      "trap": "选 A 完全过去式 — 没体现"那一刻正在做"。选 C/D 助动词搭配错。",
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
    NULL::jsonb, NULL, 'when_short_action', false, 1, 9000
  ),
  (
    '___ I ___ along the river, I ___ a beautiful bird.',
    'mcq', 'When / walked / saw', 'While / was walking / saw', 'While / walked / saw', 'When / was walking / was seeing', 'B',
    NULL::text[],
    'while 引导长动作（散步）+ 主句短动作（看到鸟）→ while + was walking + saw。',
    NULL::jsonb, NULL, 'while_long_action', false, 2, 9001
  ),
  (
    '___ Mom ___ supper, Dad ___ a newspaper.',
    'mcq', 'When / cooked / read', 'While / was cooking / was reading', 'While / cooked / was reading', 'When / was cooking / read', 'B',
    NULL::text[],
    '两个长动作同时进行 → while 引导 + 两边都进行时。',
    NULL::jsonb, NULL, 'while_parallel_actions', false, 2, 9002
  ),
  (
    'My little sister ___ when our dog suddenly ___ into the room.',
    'mcq', 'slept / ran', 'was sleeping / was running', 'was sleeping / ran', 'slept / was running', 'C',
    NULL::text[],
    '长（睡觉）被短（突然跑进来）打断 → was sleeping + ran。',
    NULL::jsonb, NULL, 'when_interrupted', false, 2, 9003
  ),

  (
    'While I ____ (read) in the library, my friend ____ (call) my name.',
    'fill', NULL, NULL, NULL, NULL, 'was reading / called',
    ARRAY['was reading / called']::text[],
    'while 长动作（读书）+ 短突发（叫名字）→ was reading + called。',
    NULL::jsonb, NULL, 'while_short_break', false, 2, 9004
  ),
  (
    'When the earthquake ____ (happen), the students ____ (study) in the classroom.',
    'fill', NULL, NULL, NULL, NULL, 'happened / were studying',
    ARRAY['happened / were studying']::text[],
    '地震发生（短突发）+ 学生学习（长动作）→ happened + were studying。',
    NULL::jsonb, NULL, 'when_short_long', false, 2, 9005
  ),
  (
    'At 8 last night, Lin and her sister ____ (watch) a film together.',
    'fill', NULL, NULL, NULL, NULL, 'were watching',
    ARRAY['were watching']::text[],
    'at 8 last night = 过去某一刻 + 主语复数 → were watching。',
    NULL::jsonb, NULL, 'past_continuous_time', false, 1, 9006
  ),

  (
    '合并成一句（用 when）：  "I was reading. The phone rang."',
    'transform', NULL, NULL, NULL, NULL, 'I was reading when the phone rang.',
    ARRAY[
      'I was reading when the phone rang.',
      'When the phone rang, I was reading.'
    ]::text[],
    '长（读书）+ 短（电话响）→ when 引导短动作。',
    NULL::jsonb, NULL, 'when_combine', true, 2, 9007
  ),
  (
    '合并成一句（用 while）：  "Mom was cooking. I was doing my homework."',
    'transform', NULL, NULL, NULL, NULL, 'While Mom was cooking, I was doing my homework.',
    ARRAY[
      'While Mom was cooking, I was doing my homework.',
      'Mom was cooking while I was doing my homework.'
    ]::text[],
    '两个长动作同时进行 → while 引导其中一个。',
    NULL::jsonb, NULL, 'while_combine', true, 2, 9008
  ),

  (
    '改错：  "While I read a book, Tom watched TV."',
    'correction', NULL, NULL, NULL, NULL, 'While I was reading a book, Tom was watching TV.',
    ARRAY[
      'While I was reading a book, Tom was watching TV.'
    ]::text[],
    'while 引导两个长动作同时进行 → 两边都用过去进行时。',
    NULL::jsonb, NULL, 'while_both_continuous', true, 2, 9009
  ),
  (
    '改错：  "When the phone was ringing, I was cooking dinner."',
    'correction', NULL, NULL, NULL, NULL, 'When the phone rang, I was cooking dinner.',
    ARRAY[
      'When the phone rang, I was cooking dinner.'
    ]::text[],
    'when 后接短突发动作（电话响）→ 用一般过去时 rang。',
    NULL::jsonb, NULL, 'when_no_continuous', true, 3, 9010
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
    NULL::jsonb, '更地道：have lunch 比 eat lunch 更标准；school cafeteria 是美式，dining hall 是英式。', 'when_translation', true, 3, 9011
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
