-- =====================================================================
-- Gold-standard content for G8 · 现在完成进行时
-- Code: g8.29   Category: tense
-- =====================================================================

UPDATE junior_grammar_points
SET
  summary = '"have been doing" — 强调动作从过去持续到现在并仍在进行，中考-高考衔接的进阶时态。',
  hook_line_cn = '现在完成 vs 现在完成进行：前者强调"结果"，后者强调"持续过程"。学会一句话搞定 9 年级阅读。',
  hook_line = 'have been doing — emphasises the process, not the result.',
  mnemonic = '现在完成进行 = have/has + been + V-ing；强调"过程 / 持续"；状态动词不用。',
  content_depth = 3,

  explanation_md = E'## 🎯 一句话搞定\n\n**动作从过去持续到现在，并且仍在进行** → 用 **have/has + been + V-ing**，强调**过程 / 持续**。\n\n---\n\n## 📐 核心公式\n\n| 句型 | 公式 | 例子 |\n|---|---|---|\n| 肯定 | 主语 + **have/has + been + V-ing** | I **have been learning** English for 5 years. |\n| 否定 | 主语 + **haven''t/hasn''t + been + V-ing** | She **hasn''t been studying** lately. |\n| 一般疑问 | **Have/Has** + 主语 + **been + V-ing** ? | **Have you been waiting** long? |\n| 特殊疑问 | 疑问词 + **have/has** + 主语 + **been + V-ing** ? | How long **have you been learning** English? |\n\n> ⚠️ **铁律**：he / she / it / 单数 → **has**；其他 → **have**。\n\n---\n\n## 🔥 与现在完成时的关键区别（中考必考）\n\n| 维度 | 现在完成时 (have done) | 现在完成进行时 (have been doing) |\n|---|---|---|\n| **强调** | **结果** | **过程 / 持续** |\n| 例子 | I **have read** the book.（看完了）| I **have been reading** the book.（一直在看，可能没看完）|\n| 暗示 | 动作完成，强调影响 | 动作持续，可能还没结束 |\n\n→ **判断时**：问"做完了吗"用完成时；问"做多久了 / 还在做吗"用完成进行时。\n\n---\n\n## ⏰ 看到这些 = 现在完成进行时\n\n- **for + 时长**：for 5 years, for 3 hours\n- **since + 时间点**：since 2020, since I was 5\n- **all + 时段**：all morning, all day, all week\n- **recently / lately**\n- 强调动作**仍在进行**或**刚刚停止**（结果显示在外）\n\n---\n\n## 🔥 经典对比例句\n\n### 强调结果 → 完成时\n- She **has cleaned** the room.（房间现在很干净）\n\n### 强调过程 → 完成进行时\n- She **has been cleaning** the room **all morning**.（一上午都在打扫，可能还没完）\n\n### 同时表达：完成时 + 完成进行时\n- I **have been studying** for 3 hours, but I **haven''t finished** yet.（学了 3 小时 + 还没完成）\n\n---\n\n## ⚠️ Top 5 易错点（中考批卷红笔常出现）\n\n1. **状态动词用完成进行时**（最致命）：~~I have been knowing him for 10 years.~~ → **I have known him for 10 years.**（know/like/love/believe 是状态动词，用完成时）\n2. **漏掉 been**：~~I have learning English for 5 years.~~ → **I have been learning English for 5 years.**\n3. **第三人称用 have**：~~He have been waiting.~~ → **He has been waiting.**\n4. **强调结果时误用进行**：~~I have been reading this book.（说话人意思是"看完了"）~~ → **I have read this book.**\n5. **配 yesterday / last year**：~~I have been studying since yesterday.（错语境）~~ → 完成进行时不与过去具体时间点+完成动作搭配。"since yesterday" 接 + still 是 OK，要看上下文。\n\n---\n\n## 🧠 三秒判断口诀\n\n> ① 强调**过程 / 一直在做** → have been + V-ing  \n> ② 强调**结果 / 做完了** → have + V-ed  \n> ③ **状态动词不用进行时**（know/like/love/want/have-表所有）  \n> ④ 配 **for / since / all + 时段** 是高频信号',

  immersion_cards = $jsonb$[
    {"situation": "Friend visits and you''re mid-chore", "cn": "我已经收拾了整整一个上午。", "en": "I have been cleaning all morning."},
    {"situation": "Tutor asks about your English progress", "cn": "我学英语 6 年了，还在继续学。", "en": "I have been learning English for six years and I''m still going."},
    {"situation": "Mom is worried you''re tired", "cn": "你看起来累，等多久了？", "en": "You look tired — how long have you been waiting?"},
    {"situation": "Reaching a milestone with friends", "cn": "我们一直在为这个项目努力，终于做完了。", "en": "We have been working on this project, and we''ve finally finished."},
    {"situation": "Describing relentless weather", "cn": "已经下了一整天的雨了。", "en": "It has been raining all day."},
    {"situation": "Telling about a recent hobby", "cn": "她最近在学钢琴。", "en": "She has been learning the piano recently."}
  ]$jsonb$::jsonb,

  contrast_table = $jsonb$[
    {"lhs": "I have been knowing him for 10 years.",         "rhs": "I have known him for 10 years."},
    {"lhs": "I have learning English for 5 years.",           "rhs": "I have been learning English for 5 years."},
    {"lhs": "He have been waiting at the gate.",              "rhs": "He has been waiting at the gate."},
    {"lhs": "I have been finished my homework.",              "rhs": "I have finished my homework."},
    {"lhs": "She have been liking ice cream since she was 5.","rhs": "She has liked ice cream since she was 5."},
    {"lhs": "It has been rain all morning.",                  "rhs": "It has been raining all morning."}
  ]$jsonb$::jsonb,

  reflex_cards = $jsonb$[
    {"cn": "我已经等了一个小时。",            "en": "I have been waiting for an hour.",              "keyword": "have been waiting"},
    {"cn": "她一上午都在看书。",              "en": "She has been reading all morning.",             "keyword": "has been reading"},
    {"cn": "他们 2018 年以来一直在做这个项目。","en": "They have been working on this project since 2018.","keyword": "have been working since"},
    {"cn": "你来这里多久了？",                "en": "How long have you been here?",                  "keyword": "How long have you been"},
    {"cn": "下了一整天的雨。",                "en": "It has been raining all day.",                  "keyword": "has been raining"},
    {"cn": "我学钢琴 3 年了。",               "en": "I have been learning the piano for 3 years.",   "keyword": "have been learning"},
    {"cn": "Lin 最近一直在准备考试。",        "en": "Lin has been preparing for the exam recently.", "keyword": "has been preparing"},
    {"cn": "你最近过得怎么样？",              "en": "How have you been lately?",                     "keyword": "How have you been"}
  ]$jsonb$::jsonb,

  situation_drills = $jsonb$[
    {"situation": "Talking to a new English tutor about your background.", "cn": "我学英语已经 7 年了，但我觉得自己还需要练口语。", "en": "I have been learning English for seven years, but I feel I still need to practice speaking.", "accepted": ["I''ve studied English for 7 years, but I still need speaking practice.", "After 7 years of English, I still feel my speaking needs work."]},
    {"situation": "Apologizing to a friend you kept waiting.", "cn": "对不起让你久等了，你等多久了？", "en": "Sorry to keep you waiting — how long have you been waiting?", "accepted": ["Sorry I''m late — how long have you been here?", "Sorry for the wait — how long have you been waiting for me?"]},
    {"situation": "Explaining why your eyes are red.", "cn": "我学习了一整天，眼睛有点累。", "en": "I have been studying all day; my eyes are a bit tired.", "accepted": ["I''ve been at my books all day, so my eyes are tired.", "My eyes are tired because I''ve been studying all day."]},
    {"situation": "Asking your foreign friend how they''ve been lately.", "cn": "最近怎么样？你都在忙什么？", "en": "How have you been lately? What have you been up to?", "accepted": ["How''ve you been recently? What''ve you been doing?", "How have things been? What have you been working on?"]}
  ]$jsonb$::jsonb,

  correction_tasks = $jsonb$[
    {"wrong": "I have been knowing him for 10 years.", "model": "I have known him for 10 years.", "hint": "know 是状态动词", "why": "**状态动词** (know / like / love / want / believe) **不用进行时**。改用完成时 have known。"},
    {"wrong": "I have learning English for 5 years.", "model": "I have been learning English for 5 years.", "hint": "缺 been", "why": "**现在完成进行时公式 = have/has + been + V-ing**。漏 been 错。"},
    {"wrong": "He have been waiting at the bus stop.", "model": "He has been waiting at the bus stop.", "hint": "第三人称用 has", "why": "**He = 第三人称单数 → has**（不是 have）。"},
    {"wrong": "I have been finished my homework.", "model": "I have finished my homework.", "hint": "finish 强调结果", "why": "**finish 强调结果 / 完成** → 用完成时 have finished，不用完成进行时。"},
    {"wrong": "She have been liking ice cream since she was 5.", "model": "She has liked ice cream since she was 5.", "hint": "like 不用进行时", "why": "**like 是状态动词**，且 has（she 第三人称）。用完成时 has liked。"},
    {"wrong": "It has been rain all morning.", "model": "It has been raining all morning.", "hint": "用 V-ing", "why": "**been 后接 V-ing**：rain → raining。"}
  ]$jsonb$::jsonb,

  boss_questions = $jsonb$[
    {"stem": "Tom looks exhausted. He ___ all afternoon.", "option_a": "has played football", "option_b": "has been playing football", "option_c": "is playing football", "option_d": "played football", "correct_answer": "B",
     "trap": "选 A 强调结果（看不出\"累\"的原因）；上下文 exhausted + all afternoon 提示持续过程。", "why": "**强调持续过程 + all afternoon** → 现在完成进行时 has been playing。"},
    {"stem": "— You look tired. — Yes, I ___ for 3 hours.", "option_a": "have walked", "option_b": "have been walking", "option_c": "am walking", "option_d": "walked", "correct_answer": "B",
     "trap": "选 A 强调\"走完了\"，与\"看起来累\"对话场景不匹配。", "why": "**you look tired + for 3 hours** = 强调持续 → has/have been + V-ing。"},
    {"stem": "Lin ___ this novel for two days. She''s nearly finished.", "option_a": "has read", "option_b": "has been reading", "option_c": "is reading", "option_d": "reads", "correct_answer": "B",
     "trap": "选 A 强调结果（读完）；but she''s nearly finished 暗示还没完成。", "why": "**还没读完 + 持续 2 天** → 现在完成进行时 has been reading。"},
    {"stem": "I ___ Mr. Smith since 2020. He''s my best friend.", "option_a": "have been knowing", "option_b": "have known", "option_c": "am knowing", "option_d": "know", "correct_answer": "B",
     "trap": "选 A 中考陷阱 — know 是状态动词，永远不用进行时。",
     "why": "**状态动词 know 不用进行时** → 用完成时 have known。"}
  ]$jsonb$::jsonb

WHERE code = 'g8.29';


UPDATE junior_grammar_points SET teacher_script = $jsonb$[
  {"text": "今天解锁**现在完成进行时**。中考-高考衔接的进阶时态，强调\"一直在做\"。", "show": "🎯 have / has + been + V-ing", "duration": 10},
  {"text": "公式：**have/has + been + V-ing**。he/she/it → has；其他 → have。", "show": "have/has + been + V-ing", "highlight": "been + V-ing", "duration": 11},
  {"text": "**核心**：强调动作从过去**持续到现在**，并且**仍在进行**或**刚停止**。", "show": "in progress / just stopped", "highlight": "still going", "duration": 12},
  {"text": "**对比完成时**：have done = 强调**结果**；have been doing = 强调**过程**。", "show": "have done (result)   vs   have been doing (process)", "highlight": "process", "duration": 13},
  {"text": "**举例**：She **has cleaned** the room.（已干净）vs She **has been cleaning** all morning.（一上午在打扫）", "show": "has cleaned ≠ has been cleaning", "highlight": "has been cleaning", "duration": 14},
  {"text": "**典型信号词**：**for + 时长** / **since + 时间点** / **all morning** / **recently**。", "show": "for / since / all morning / recently", "highlight": "for / since", "duration": 12},
  {"text": "**最大坑 ①**：**状态动词不用进行时**！know / like / love / want / believe → 用完成时。", "show": "✗ have been knowing   ✓ have known", "highlight": "have known", "duration": 13},
  {"text": "**最大坑 ②**：漏 been。have **been** + V-ing。少了 been 就不是这个时态。", "show": "✗ have learning   ✓ have been learning", "highlight": "have been learning", "duration": 12}
]$jsonb$::jsonb
WHERE code = 'g8.29';


DELETE FROM junior_grammar_questions WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.29') AND sort_order BETWEEN 9000 AND 9099;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.29')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer, accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading, difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.accepted_answers, q.explanation, q.distractors, q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  ('I ___ for the bus for half an hour. Where is it?', 'mcq', 'have waited', 'have been waiting', 'am waiting', 'wait', 'B', NULL::text[], '强调持续过程 + 还在等 → have been waiting。', '{}'::jsonb, NULL, 'perfect_continuous_wait', false, 1, 9000),
  ('Lin ___ the piano since she was 6 years old.', 'mcq', 'has been learning', 'has learning', 'is learning', 'has been learn', 'A', NULL::text[], 'since + 时间点 + 持续到现在 → has been learning。', '{}'::jsonb, NULL, 'perfect_continuous_since', false, 1, 9001),
  ('How long ___ you ___ in this city?', 'mcq', 'have / been living', 'have / lived', 'do / live', 'are / living', 'A', NULL::text[], '问"住了多久" + 持续 → have been living。', '{}'::jsonb, NULL, 'perfect_continuous_question', false, 2, 9002),
  ('Tom ___ Mary since they were classmates in primary school.', 'mcq', 'has been knowing', 'has known', 'is knowing', 'knows', 'B', NULL::text[], 'know 是状态动词，不用进行时 → has known。', '{}'::jsonb, NULL, 'perfect_continuous_state_verb', false, 3, 9003),
  ('It ____ (rain) since last night. The streets are wet.', 'fill', NULL, NULL, NULL, NULL, 'has been raining', ARRAY['has been raining']::text[], 'since + 时间点 + 持续 → has been raining。', '{}'::jsonb, NULL, 'perfect_continuous_rain', false, 2, 9004),
  ('They ____ (work) on this project for two weeks.', 'fill', NULL, NULL, NULL, NULL, 'have been working', ARRAY['have been working']::text[], 'for + 时长 + 持续 → have been working。', '{}'::jsonb, NULL, 'perfect_continuous_work', false, 2, 9005),
  ('I ____ (know) him for over 10 years.', 'fill', NULL, NULL, NULL, NULL, 'have known', ARRAY['have known']::text[], 'know 是状态动词 → have known（完成时，不是完成进行）。', '{}'::jsonb, NULL, 'perfect_continuous_know_trap', false, 3, 9006),
  ('合并成完成进行时：  "I started studying English 5 years ago. I''m still studying."', 'transform', NULL, NULL, NULL, NULL, 'I have been studying English for 5 years.', ARRAY['I have been studying English for 5 years.']::text[], '从过去开始 + 仍在进行 → have been studying。', '{}'::jsonb, NULL, 'perfect_continuous_combine', true, 2, 9007),
  ('改成完成时（强调结果）：  "I have been finishing my homework."', 'transform', NULL, NULL, NULL, NULL, 'I have finished my homework.', ARRAY['I have finished my homework.']::text[], 'finish 强调结果 → 完成时。', '{}'::jsonb, NULL, 'perfect_continuous_to_perfect', true, 3, 9008),
  ('改错：  "I have been knowing Mr. Wang since I was a child."', 'correction', NULL, NULL, NULL, NULL, 'I have known Mr. Wang since I was a child.', ARRAY['I have known Mr. Wang since I was a child.']::text[], 'know 不用进行时 → have known。', '{}'::jsonb, NULL, 'perfect_continuous_state_verb_error', true, 2, 9009),
  ('改错：  "She have been studying French for 3 years."', 'correction', NULL, NULL, NULL, NULL, 'She has been studying French for 3 years.', ARRAY['She has been studying French for 3 years.']::text[], 'She 第三人称单数 → has。', '{}'::jsonb, NULL, 'perfect_continuous_third_person', true, 1, 9010),
  ('把这句话译成英文：自从去年九月以来，我一直在准备这次中考。',
   'translation', NULL, NULL, NULL, NULL, 'I have been preparing for the 中考 since last September.',
   ARRAY[
     'I have been preparing for the 中考 since last September.',
     'I have been preparing for the senior-high entrance exam since last September.',
     'Since last September, I have been preparing for the 中考.'
   ]::text[], '考点：① since + 时间点 → 现在完成进行时；② "中考" = the 中考 / senior-high entrance exam。', '{}'::jsonb, '更地道：在英文里直接保留 "中考" 表名词；正式翻译可写 the senior-high entrance exam。', 'perfect_continuous_translation', true, 3, 9011)
) AS q(stem, question_type, option_a, option_b, option_c, option_d, correct_answer, accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading, difficulty, sort_order);


DO $$
DECLARE v_point_id uuid; v_q_count int; v_depth int;
BEGIN
  SELECT id, content_depth INTO v_point_id, v_depth FROM junior_grammar_points WHERE code = 'g8.29';
  IF v_point_id IS NULL THEN RAISE EXCEPTION 'Missing g8.29'; END IF;
  IF v_depth <> 3 THEN RAISE EXCEPTION 'g8.29 depth %, expected 3', v_depth; END IF;
  SELECT count(*) INTO v_q_count FROM junior_grammar_questions WHERE point_id = v_point_id AND sort_order BETWEEN 9000 AND 9099;
  IF v_q_count <> 12 THEN RAISE EXCEPTION 'g8.29 expected 12 questions, got %', v_q_count; END IF;
  RAISE NOTICE 'g8.29 verified.';
END $$;
