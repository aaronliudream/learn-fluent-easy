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
      "hint":  "强调"正在"",
      "why":   "时间是过去**某一刻**（at 9 last night）→ 强调"那一刻正在做" → 用 **was reading**。"
    },
    {
      "wrong": "When the phone was ringing, I was cooking.",
      "model": "When the phone rang, I was cooking.",
      "hint":  "短动作用过去式",
      "why":   "**when 通常接短突发动作** → 用一般过去时 **rang**。"长动作"被打断 → 进行时 was cooking。"
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
      "trap": "选 B 也是过去时，但**at 7:30 yesterday evening** 是过去某一刻 → 用进行时强调"那一刻正在吃"。",
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
      "trap": "选 A 两边都过去式 → 没体现"被打断"。选 B/D 哪个长哪个短弄反。",
      "why":  "**长动作（洗澡）被短动作（门铃响）打断** → 长用进行时 (was taking)，短用过去式 (rang)。"
    },
    {
      "stem": "— What ___ you ___ from 8 to 10 yesterday morning?\n— I ___ the new film at the cinema.",
      "option_a": "did / do / watched",
      "option_b": "were / doing / was watching",
      "option_c": "did / doing / was watching",
      "option_d": "were / do / watched",
      "correct_answer": "B",
      "trap": "选 A 完全过去式 — 没体现"那段时间持续在做"。选 C/D 助动词搭配混乱。",
      "why":  "**from 8 to 10 yesterday** = 过去一段时间持续 → 过去进行时。疑问句：**Were you doing ...?**"
    }
  ]$jsonb$::jsonb

WHERE code = 'g8.22';


UPDATE junior_grammar_points SET teacher_script = $jsonb$[
  {
    "text": "今天解锁**过去进行时**。中考阅读最爱用的"当时正在……"句式。",
    "show": "🎯 Today: was / were + V-ing",
    "duration": 8
  },
  {
    "text": "公式：**was / were + 动词 -ing**。强调"过去某一刻正在做"。",
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
    NULL::jsonb, NULL, 'past_continuous_basic', false, 1, 9000
  ),
  (
    'When the earthquake hit, the students ___ in class.',
    'mcq', 'studied', 'were studying', 'are studying', 'was studying', 'B',
    NULL::text[],
    'when 引导短动作 hit + 长动作正在进行 → 过去进行时 = **were studying**（students 复数）。',
    NULL::jsonb, NULL, 'past_continuous_when', false, 2, 9001
  ),
  (
    'While I ___ in the park yesterday afternoon, I ___ an old friend.',
    'mcq', 'was walking / met', 'walked / was meeting', 'was walking / was meeting', 'walked / met', 'A',
    NULL::text[],
    'while 引导的长动作（散步）+ 突发动作（碰到朋友）→ 长进行时 + 短过去式。',
    NULL::jsonb, NULL, 'past_continuous_while_when', false, 3, 9002
  ),
  (
    'At this time yesterday, we ___ a Chinese class.',
    'mcq', 'had', 'were having', 'have', 'are having', 'B',
    NULL::text[],
    'at this time yesterday = 过去某一刻 → 进行时 **were having**。',
    NULL::jsonb, NULL, 'past_continuous_time_marker', false, 1, 9003
  ),

  (
    'I ____ (do) my homework when my dad came home.',
    'fill', NULL, NULL, NULL, NULL, 'was doing',
    ARRAY['was doing']::text[],
    'when came home 打断"正在做作业" → was doing。',
    NULL::jsonb, NULL, 'past_continuous_interrupted', false, 1, 9004
  ),
  (
    'My parents ____ (talk) about my study when I walked in.',
    'fill', NULL, NULL, NULL, NULL, 'were talking',
    ARRAY['were talking']::text[],
    'parents 复数 + 被打断 → **were talking**。',
    NULL::jsonb, NULL, 'past_continuous_plural', false, 2, 9005
  ),
  (
    'From 7 to 10 yesterday evening, Tom ____ (practice) the violin.',
    'fill', NULL, NULL, NULL, NULL, 'was practicing',
    ARRAY['was practicing', 'was practising']::text[],
    'from 7 to 10 = 过去一段时间 → 进行时 **was practicing**（美式拼写）。',
    NULL::jsonb, 'practicing 是美式，practising 是英式；中考两种拼写都接受。', 'past_continuous_duration', false, 2, 9006
  ),

  (
    '合并：  "I was walking in the park. I saw a bird."',
    'transform', NULL, NULL, NULL, NULL, 'I was walking in the park when I saw a bird.',
    ARRAY[
      'I was walking in the park when I saw a bird.',
      'While I was walking in the park, I saw a bird.'
    ]::text[],
    '长动作（散步）被短动作（看见鸟）打断 → 用 when 或 while 引导。',
    NULL::jsonb, NULL, 'past_continuous_combine', true, 2, 9007
  ),
  (
    '改写为过去进行时（提示：at 8 last night）：  "He did his homework."',
    'transform', NULL, NULL, NULL, NULL, 'He was doing his homework at 8 last night.',
    ARRAY[
      'He was doing his homework at 8 last night.'
    ]::text[],
    'did → was doing；加上时间状语。',
    NULL::jsonb, NULL, 'past_continuous_transform', true, 2, 9008
  ),

  (
    '改错：  "Tom were sleeping when his alarm clock rang."',
    'correction', NULL, NULL, NULL, NULL, 'Tom was sleeping when his alarm clock rang.',
    ARRAY[
      'Tom was sleeping when his alarm clock rang.'
    ]::text[],
    '主语 Tom 单数 → was，不是 were。',
    NULL::jsonb, NULL, 'past_continuous_subject_verb', true, 2, 9009
  ),
  (
    '改错：  "While Mom was cooking, I read a book."',
    'correction', NULL, NULL, NULL, NULL, 'While Mom was cooking, I was reading a book.',
    ARRAY[
      'While Mom was cooking, I was reading a book.'
    ]::text[],
    'while 引导两个长动作同时进行 → 两边都用进行时。',
    NULL::jsonb, NULL, 'past_continuous_while', true, 3, 9010
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
    NULL::jsonb, 'family 在英美用法略有不同：美式偏单数（was），英式可单可复（was/were）。中考两种都接受。', 'past_continuous_translation', true, 3, 9011
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
