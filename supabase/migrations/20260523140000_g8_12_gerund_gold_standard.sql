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
