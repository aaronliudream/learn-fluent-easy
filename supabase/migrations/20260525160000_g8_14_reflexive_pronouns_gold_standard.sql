-- =====================================================================
-- Gold-standard content for G8 · 反身代词
-- Code: g8.14   Category: other
-- =====================================================================

UPDATE junior_grammar_points
SET
  summary = '"自己" — myself / yourself / himself ... 描述动作回到自己身上，或加强语气。',
  hook_line_cn = '中考阅读高频出现：take care of yourself / by oneself / enjoy yourself — 8 个固定搭配背完不再丢分。',
  hook_line = 'Reflexive pronouns — the "myself" family, must-know fixed phrases for 中考 daily-life passages.',
  mnemonic = '反身代词 8 个：myself · yourself · himself · herself · itself · ourselves · yourselves · themselves。',
  content_depth = 3,

  explanation_md = E'## 🎯 一句话搞定\n\n**反身代词** = "自己"。用于：① 动作回到自己身上 ② 加强语气 ③ 一组固定搭配。\n\n---\n\n## 📐 8 个反身代词全表（必背）\n\n| 人称 | 单数 | 复数 |\n|---|---|---|\n| 1 | **myself** 我自己 | **ourselves** 我们自己 |\n| 2 | **yourself** 你自己 | **yourselves** 你们自己 |\n| 3 (男) | **himself** 他自己 | — |\n| 3 (女) | **herself** 她自己 | — |\n| 3 (物) | **itself** 它自己 | — |\n| 3 (复) | — | **themselves** 他们自己 |\n\n> ⚠️ **拼写陷阱**：~~theirselves~~ → **themselves**；~~hisself~~ → **himself**\n\n---\n\n## 🔥 3 大用法（中考考点）\n\n### ① 作宾语（动作回到自己身上）\n- I cut **myself** while cooking.\n- She introduced **herself** to the class.\n- Take care of **yourself**.\n\n### ② 加强语气（"亲自" / "本人"）\n- I made the cake **myself**.（强调"我亲自做的"）\n- The president **himself** answered the question.\n\n### ③ 固定搭配（必背 8 个）\n- **by oneself** = alone（独自）\n- **enjoy oneself** = have a good time（玩得开心）\n- **help oneself to** = 自取（食物）\n- **teach oneself** = 自学\n- **take care of oneself** = 照顾自己\n- **make oneself at home** = 别拘束\n- **hurt oneself** = 弄伤自己\n- **dress oneself** = 穿衣服（自己穿）\n\n---\n\n## ⏰ 看到这些 = 反身代词题\n\n- enjoy / introduce / hurt / cut / kill / teach / take care of + 反身代词\n- by + 反身代词\n- 形容词 myself 后用于加强语气\n- 主语和宾语指同一个人/物\n\n---\n\n## ⚠️ Top 5 易错点（中考批卷红笔常出现）\n\n1. **拼写错**：~~theirselves~~ → **themselves**；~~yourselfs~~ → **yourselves**\n2. **enjoy 后用宾格**：~~Enjoy you!~~ → **Enjoy yourself!**（enjoy 后宾语和主语同一人 → 反身代词）\n3. **take care of 漏反身**：~~Take care of you.~~ → **Take care of yourself.**\n4. **by oneself 表"独自"用错**：~~He did it by him.~~ → **He did it by himself.**\n5. **myself 当主语**：~~Myself made the cake.~~ → **I made the cake myself.**（反身代词不作主语）\n\n---\n\n## 🧠 三秒判断口诀\n\n> ① 主语和宾语是**同一个人** → 宾语用反身代词  \n> ② "亲自做某事" → 在动词后或句末加 **反身代词**  \n> ③ "独自" = **by oneself**；"自学" = **teach oneself**',

  immersion_cards = $jsonb$[
    {"situation": "Mom dropping you off at school for a long trip", "cn": "好好照顾自己。", "en": "Take good care of yourself."},
    {"situation": "Welcoming a guest at home", "cn": "请别客气，自己拿东西吃。", "en": "Please help yourself to anything in the fridge."},
    {"situation": "Telling a friend about your skill", "cn": "我自学了吉他。", "en": "I taught myself the guitar."},
    {"situation": "Encouraging a shy classmate to enjoy a party", "cn": "好好玩，别紧张。", "en": "Enjoy yourself and relax."},
    {"situation": "Reporting back from a solo trip", "cn": "我一个人去爬了山。", "en": "I went hiking by myself."},
    {"situation": "Praising someone''s independence", "cn": "孩子已经会自己穿衣服了。", "en": "The child can dress himself now."}
  ]$jsonb$::jsonb,

  contrast_table = $jsonb$[
    {"lhs": "They enjoyed theirselves at the party.",       "rhs": "They enjoyed themselves at the party."},
    {"lhs": "Enjoy you on the trip!",                        "rhs": "Enjoy yourself on the trip!"},
    {"lhs": "Take care of you.",                             "rhs": "Take care of yourself."},
    {"lhs": "He did the project by him.",                    "rhs": "He did the project by himself."},
    {"lhs": "Myself made the dumplings.",                    "rhs": "I made the dumplings myself."},
    {"lhs": "She cut her finger by sheself.",                "rhs": "She cut herself."}
  ]$jsonb$::jsonb,

  reflex_cards = $jsonb$[
    {"cn": "好好照顾你自己。",                  "en": "Take care of yourself.",                       "keyword": "Take care of yourself"},
    {"cn": "他们玩得很开心。",                  "en": "They enjoyed themselves.",                     "keyword": "enjoyed themselves"},
    {"cn": "我自己做的蛋糕。",                  "en": "I made the cake myself.",                      "keyword": "myself"},
    {"cn": "她一个人住。",                      "en": "She lives by herself.",                        "keyword": "by herself"},
    {"cn": "请随意吃水果。",                    "en": "Help yourself to the fruit.",                  "keyword": "Help yourself"},
    {"cn": "Tom 是自学的法语。",                "en": "Tom taught himself French.",                   "keyword": "taught himself"},
    {"cn": "小猫给自己舔毛。",                  "en": "The kitten cleaned itself.",                   "keyword": "itself"},
    {"cn": "别勉强自己。",                      "en": "Don''t push yourself too hard.",               "keyword": "Don''t push yourself"}
  ]$jsonb$::jsonb,

  situation_drills = $jsonb$[
    {"situation": "Mom sees you off at the train station.", "cn": "在大学要好好照顾自己。", "en": "Take good care of yourself at university.", "accepted": ["Look after yourself well at uni.", "Make sure to take care of yourself in college."]},
    {"situation": "Inviting your foreign friend to relax in your kitchen.", "cn": "厨房里有水果和零食，自己随便吃。", "en": "There''s fruit and snacks in the kitchen — help yourself.", "accepted": ["There''s fruit and snacks in the kitchen — feel free to help yourself.", "Help yourself to anything in the kitchen."]},
    {"situation": "Praising a self-taught classmate to your teacher.", "cn": "她完全是自学的钢琴。", "en": "She taught herself the piano completely.", "accepted": ["She taught herself piano from scratch.", "She''s totally self-taught on the piano."]},
    {"situation": "Reporting a small accident in PE class.", "cn": "他不小心弄伤了自己的膝盖。", "en": "He accidentally hurt himself on the knee.", "accepted": ["He hurt his knee by accident.", "He accidentally injured himself on the knee."]}
  ]$jsonb$::jsonb,

  correction_tasks = $jsonb$[
    {"wrong": "They enjoyed theirselves at the picnic.", "model": "They enjoyed themselves at the picnic.", "hint": "theirselves 不存在", "why": "**正确拼写 = themselves**（不是 theirselves）。"},
    {"wrong": "Take care of you when I''m away.", "model": "Take care of yourself when I''m away.", "hint": "take care of + 反身", "why": "主语和宾语是同一人 → 用反身代词 **yourself**。"},
    {"wrong": "He cooked dinner by him last night.", "model": "He cooked dinner by himself last night.", "hint": "by + 反身代词", "why": "**by oneself = 独自**：by him**self**（不是 by him）。"},
    {"wrong": "Myself baked a cake for my mom.", "model": "I baked a cake for my mom myself.", "hint": "反身代词不作主语", "why": "**反身代词不能作主语**。主语用 I，把 myself 放在句末加强语气。"},
    {"wrong": "Enjoy you on your vacation!", "model": "Enjoy yourself on your vacation!", "hint": "enjoy + 反身", "why": "**enjoy 后接反身代词**（enjoy oneself = 玩得开心）。"},
    {"wrong": "She introduced she to the class.", "model": "She introduced herself to the class.", "hint": "主宾同一人", "why": "主语 She 和宾语是同一人 → 用反身代词 **herself**。"}
  ]$jsonb$::jsonb,

  boss_questions = $jsonb$[
    {"stem": "Don''t worry, Mom. I can take care of ___ when you''re away.", "option_a": "me", "option_b": "myself", "option_c": "my", "option_d": "mine", "correct_answer": "B",
     "trap": "选 A 是宾格，但主宾同一人时必须反身。", "why": "**主语 I = 宾语**（自己照顾自己）→ 反身代词 **myself**。"},
    {"stem": "We had a wonderful time. We really enjoyed ___ at the festival.", "option_a": "us", "option_b": "ourselves", "option_c": "ourself", "option_d": "we", "correct_answer": "B",
     "trap": "选 A 宾格错。选 C ourself 拼写错。", "why": "**enjoy + 反身代词** + 复数 we → **ourselves**。"},
    {"stem": "Tom is so amazing — he taught ___ to play the violin in just one year.", "option_a": "him", "option_b": "his", "option_c": "himself", "option_d": "he", "correct_answer": "C",
     "trap": "选 A 是宾格，但 teach + 反身代词 = 自学。", "why": "**teach + 反身代词 = 自学**（taught himself = 自学）。"},
    {"stem": "The little boy can dress ___ now. He''s growing up so fast!", "option_a": "him", "option_b": "his", "option_c": "himself", "option_d": "he", "correct_answer": "C",
     "trap": "选 A 是宾格。dress oneself = 自己穿衣服。", "why": "**dress + 反身代词** = 给自己穿衣服。the little boy → himself。"}
  ]$jsonb$::jsonb

WHERE code = 'g8.14';


UPDATE junior_grammar_points SET teacher_script = $jsonb$[
  {"text": "今天解锁**反身代词**。\"自己\" 的 8 个版本，中考阅读高频出现。", "show": "🎯 myself / yourself / himself / ...", "duration": 10},
  {"text": "**8 个必背**：myself · yourself · himself · herself · itself · ourselves · yourselves · themselves。", "show": "8 reflexive pronouns", "highlight": "themselves", "duration": 13},
  {"text": "**用法 ①**：主宾**同一个人** → 宾语用反身。I hurt **myself**。", "show": "subject = object → reflexive", "highlight": "myself", "duration": 11},
  {"text": "**用法 ②**：加强语气 \"亲自/本人\"。I made it **myself**。", "show": "I made it myself.", "highlight": "myself", "duration": 10},
  {"text": "**用法 ③**：固定搭配。**by oneself** 独自 / **enjoy oneself** 玩得开心 / **teach oneself** 自学 / **help yourself to** 自取。", "show": "by oneself · enjoy oneself · teach oneself", "highlight": "by oneself", "duration": 14},
  {"text": "**最大坑 ①**：拼写。**themselves**（不是 theirselves）；**himself**（不是 hisself）。", "show": "✗ theirselves   ✓ themselves", "highlight": "themselves", "duration": 12},
  {"text": "**最大坑 ②**：反身代词**不能作主语**。~~Myself made it~~ → **I made it myself**。", "show": "✗ Myself ...   ✓ I ... myself", "highlight": "I ... myself", "duration": 12},
  {"text": "下一关进入实战。", "show": "Next → 6 Real-life Scenarios 📚", "duration": 6}
]$jsonb$::jsonb
WHERE code = 'g8.14';


DELETE FROM junior_grammar_questions WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.14') AND sort_order BETWEEN 9000 AND 9099;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.14')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer, accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading, difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.accepted_answers, q.explanation, q.distractors, q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  ('Please make ___ at home. I''ll get you some tea.', 'mcq', 'you', 'yourself', 'your', 'yours', 'B', NULL::text[], 'make oneself at home = 别拘束（固定搭配）。', '{}'::jsonb, NULL, 'reflexive_at_home', false, 1, 9000),
  ('She walks to school by ___ every day.', 'mcq', 'she', 'her', 'herself', 'hers', 'C', NULL::text[], 'by + 反身代词 = 独自。', '{}'::jsonb, NULL, 'reflexive_by_self', false, 1, 9001),
  ('My little brother is so independent — he can wash ___ now.', 'mcq', 'him', 'his', 'himself', 'he', 'C', NULL::text[], 'wash oneself = 给自己洗澡（主宾同一人）。', '{}'::jsonb, NULL, 'reflexive_wash', false, 1, 9002),
  ('The students enjoyed ___ at the summer camp.', 'mcq', 'them', 'theirselves', 'themselves', 'theirs', 'C', NULL::text[], 'enjoy + 反身代词；复数 students → themselves。', '{}'::jsonb, NULL, 'reflexive_enjoy', false, 2, 9003),
  ('She introduced ____ (her) to all the new classmates.', 'fill', NULL, NULL, NULL, NULL, 'herself', ARRAY['herself']::text[], '主宾同一人 → herself。', '{}'::jsonb, NULL, 'reflexive_introduce', false, 1, 9004),
  ('You should not push ____ (you) too hard during exams.', 'fill', NULL, NULL, NULL, NULL, 'yourself', ARRAY['yourself']::text[], '主宾同一人 → yourself。', '{}'::jsonb, NULL, 'reflexive_push', false, 2, 9005),
  ('He taught ____ (he) French during the holidays.', 'fill', NULL, NULL, NULL, NULL, 'himself', ARRAY['himself']::text[], 'teach + 反身代词 = 自学。', '{}'::jsonb, NULL, 'reflexive_teach', false, 1, 9006),
  ('改写为反身代词句：  "She did her homework alone."', 'transform', NULL, NULL, NULL, NULL, 'She did her homework by herself.', ARRAY['She did her homework by herself.']::text[], 'alone = by oneself。', '{}'::jsonb, NULL, 'reflexive_by_self_transform', true, 2, 9007),
  ('加强语气：  "I painted the picture."（强调"我亲自"）', 'transform', NULL, NULL, NULL, NULL, 'I painted the picture myself.', ARRAY['I painted the picture myself.']::text[], '强调"亲自"在句末加 myself。', '{}'::jsonb, NULL, 'reflexive_emphasis', true, 2, 9008),
  ('改错：  "They enjoyed theirselves at the New Year''s party."', 'correction', NULL, NULL, NULL, NULL, 'They enjoyed themselves at the New Year''s party.', ARRAY['They enjoyed themselves at the New Year''s party.']::text[], 'theirselves → themselves。', '{}'::jsonb, NULL, 'reflexive_spelling', true, 1, 9009),
  ('改错：  "Take care of you while I''m on the business trip."', 'correction', NULL, NULL, NULL, NULL, 'Take care of yourself while I''m on the business trip.', ARRAY['Take care of yourself while I''m on the business trip.']::text[], 'take care of + 反身代词。', '{}'::jsonb, NULL, 'reflexive_take_care', true, 1, 9010),
  ('把这句话译成英文：我哥哥完全是自学的编程，现在已经能做出小游戏了。',
   'translation', NULL, NULL, NULL, NULL, 'My brother taught himself programming completely, and now he can even make small games.',
   ARRAY[
     'My brother taught himself programming completely, and now he can even make small games.',
     'My brother is completely self-taught in programming; he can now build small games.',
     'My brother learned programming entirely by himself, and now he makes small games.'
   ]::text[], '考点：① teach himself programming（自学）；② now he can ... 表现阶段能力。', '{}'::jsonb, '更地道：be self-taught 也是不错的同义说法，比 teach oneself 更书面。', 'reflexive_translation', true, 3, 9011)
) AS q(stem, question_type, option_a, option_b, option_c, option_d, correct_answer, accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading, difficulty, sort_order);


DO $$
DECLARE v_point_id uuid; v_q_count int; v_depth int;
BEGIN
  SELECT id, content_depth INTO v_point_id, v_depth FROM junior_grammar_points WHERE code = 'g8.14';
  IF v_point_id IS NULL THEN RAISE EXCEPTION 'Missing g8.14'; END IF;
  IF v_depth <> 3 THEN RAISE EXCEPTION 'g8.14 depth %, expected 3', v_depth; END IF;
  SELECT count(*) INTO v_q_count FROM junior_grammar_questions WHERE point_id = v_point_id AND sort_order BETWEEN 9000 AND 9099;
  IF v_q_count <> 12 THEN RAISE EXCEPTION 'g8.14 expected 12 questions, got %', v_q_count; END IF;
  RAISE NOTICE 'g8.14 verified.';
END $$;
