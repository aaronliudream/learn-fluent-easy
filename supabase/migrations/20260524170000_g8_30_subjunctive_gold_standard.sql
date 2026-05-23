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
