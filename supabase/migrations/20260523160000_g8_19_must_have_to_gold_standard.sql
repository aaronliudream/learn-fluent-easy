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
