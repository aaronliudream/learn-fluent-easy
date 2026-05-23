-- =====================================================================
-- Gold-standard content for G8 · 感官动词 + 形容词
-- Code: g8.10   Category: verb
-- =====================================================================

UPDATE junior_grammar_points
SET
  summary = '"看起来香 / 听起来好 / 尝起来甜" — look / sound / smell / taste / feel 后面接形容词，不是副词。',
  hook_line_cn = '中考改错最爱挖的坑：感官动词后接形容词，不接副词。一句口诀终生记。',
  hook_line = 'Sense verbs (look/sound/smell/taste/feel) take adjectives, NOT adverbs — a classic 中考 trap.',
  mnemonic = '感官动词 + 形容词；感官动词 + like + 名词。',
  content_depth = 3,

  explanation_md = E'## 🎯 一句话搞定\n\n**5 个感官系动词** (look / sound / smell / taste / feel) + **形容词**作表语；接名词时用 **+ like + 名词**。\n\n---\n\n## 📐 核心公式\n\n| 公式 | 例子 |\n|---|---|\n| 感官动词 + **形容词** | The cake **looks delicious**. |\n| 感官动词 + **like + 名词** | She **looks like** her mom. |\n| 感官动词 + **like + 从句** | It **looks like it''s going to rain**. |\n\n> ⚠️ **铁律**：感官动词后接**形容词**，**不接副词**！~~looks deliciously~~ ✗\n\n---\n\n## 🔥 5 个感官动词怎么用\n\n### look（看起来）\n- The flower **looks beautiful**.\n- She **looks like** her sister.\n\n### sound（听起来）\n- Your idea **sounds great**!\n- It **sounds like** a good plan.\n\n### smell（闻起来）\n- The soup **smells wonderful**.\n- It **smells like** chocolate.\n\n### taste（尝起来）\n- The cake **tastes sweet**.\n- This **tastes like** apple juice.\n\n### feel（摸起来 / 感觉）\n- The fabric **feels soft**.\n- I **feel tired**.\n- It **feels like** velvet.\n\n---\n\n## ⏰ 看到这些 = 感官动词题\n\n- look / sound / smell / taste / feel 作动词\n- 后面有形容词或名词\n- 描述食物 / 物体 / 情绪 / 外貌\n- 中考改错题常用此处挖坑\n\n---\n\n## ⚠️ Top 5 易错点（中考批卷红笔常出现）\n\n1. **用副词替换形容词**（最致命）：~~The cake looks deliciously.~~ → **The cake looks delicious.**\n2. **接名词漏 like**：~~She looks her mom.~~ → **She looks like her mom.**\n3. **第三人称单数 -s 漏**：~~The flower smell sweet.~~ → **The flower smells sweet.**\n4. **进行时滥用**：~~The food is tasting good.~~（感官动词通常不用进行时）→ **The food tastes good.**\n5. **lovely 当副词错用**：~~lovely 是形容词不是副词~~ —"a lovely girl" / "she looks lovely" 都对。\n\n---\n\n## 🧠 三秒判断口诀\n\n> ① 感官动词 (look/sound/smell/taste/feel) + **形容词**（不接副词）  \n> ② 接名词必须用 **+ like + 名词**  \n> ③ 感官动词通常**不用进行时**（状态动词）',

  immersion_cards = $jsonb$[
    {"situation": "Friend brings homemade cookies", "cn": "这些饼干看起来真香！", "en": "These cookies look delicious!"},
    {"situation": "Mom tries a new recipe", "cn": "这汤尝起来很好喝。", "en": "This soup tastes wonderful."},
    {"situation": "Pet store visit", "cn": "这只小狗摸起来好软。", "en": "This puppy feels so soft."},
    {"situation": "Hearing a friend''s idea", "cn": "你的主意听起来不错！", "en": "Your idea sounds great!"},
    {"situation": "Looking at a clear sky", "cn": "看起来要下雨了。", "en": "It looks like it''s going to rain."},
    {"situation": "Meeting your friend''s sibling", "cn": "你和你姐长得真像。", "en": "You look like your sister."}
  ]$jsonb$::jsonb,

  contrast_table = $jsonb$[
    {"lhs": "The cake looks deliciously.",                "rhs": "The cake looks delicious."},
    {"lhs": "She looks her mother.",                       "rhs": "She looks like her mother."},
    {"lhs": "The flower smell sweet.",                     "rhs": "The flower smells sweet."},
    {"lhs": "The food is tasting good.",                   "rhs": "The food tastes good."},
    {"lhs": "Your voice sounds beautifully.",              "rhs": "Your voice sounds beautiful."},
    {"lhs": "The blanket feels softly.",                   "rhs": "The blanket feels soft."}
  ]$jsonb$::jsonb,

  reflex_cards = $jsonb$[
    {"cn": "这花闻起来很香。",                "en": "The flower smells sweet.",                      "keyword": "smells sweet"},
    {"cn": "这衣服摸起来很舒服。",            "en": "This shirt feels comfortable.",                 "keyword": "feels comfortable"},
    {"cn": "你看起来很累。",                  "en": "You look tired.",                               "keyword": "look tired"},
    {"cn": "这首歌听起来像摇篮曲。",          "en": "This song sounds like a lullaby.",              "keyword": "sounds like"},
    {"cn": "这道菜尝起来有点辣。",            "en": "This dish tastes a bit spicy.",                 "keyword": "tastes a bit spicy"},
    {"cn": "她长得像她爸爸。",                "en": "She looks like her dad.",                       "keyword": "looks like"},
    {"cn": "天气感觉要变凉了。",              "en": "It feels like it''s going to get cold.",        "keyword": "feels like"},
    {"cn": "你的计划听起来不错。",            "en": "Your plan sounds good.",                        "keyword": "sounds good"}
  ]$jsonb$::jsonb,

  situation_drills = $jsonb$[
    {"situation": "Visiting a Chinese New Year dinner.", "cn": "这道鱼看起来很香，闻起来更香！", "en": "This fish looks delicious, and it smells even better!", "accepted": ["The fish looks great and smells even better.", "This fish looks tasty and smells fantastic."]},
    {"situation": "Trying on a new sweater at the store.", "cn": "这件毛衣摸起来好舒服，看上去也很好看。", "en": "This sweater feels really comfortable, and it looks nice too.", "accepted": ["This sweater is comfy to the touch and looks great.", "The sweater feels soft and looks nice."]},
    {"situation": "Listening to your friend''s weekend plan.", "cn": "你的周末计划听起来挺有趣的。", "en": "Your weekend plan sounds quite interesting.", "accepted": ["Your weekend plan sounds fun.", "That sounds like an interesting weekend."]},
    {"situation": "Comforting a tired classmate.", "cn": "你看起来很累，要不要先去休息一下？", "en": "You look tired. Why don''t you take a rest first?", "accepted": ["You seem tired — maybe rest a bit first.", "You look exhausted, take a break."]}
  ]$jsonb$::jsonb,

  correction_tasks = $jsonb$[
    {"wrong": "The cake looks deliciously.", "model": "The cake looks delicious.", "hint": "感官动词后接形容词", "why": "**look + 形容词**（不是副词）。delicious 是形容词，deliciously 是副词。"},
    {"wrong": "She looks her mother.", "model": "She looks like her mother.", "hint": "接名词加 like", "why": "**感官动词 + like + 名词**（看起来像谁/什么）。"},
    {"wrong": "The flower smell sweet.", "model": "The flower smells sweet.", "hint": "单数加 -s", "why": "**flower 单数 → smells**（第三人称单数加 -s）。"},
    {"wrong": "The pizza is tasting good.", "model": "The pizza tastes good.", "hint": "感官动词不用进行时", "why": "**感官动词是状态动词，不用进行时**。直接用一般现在时 tastes。"},
    {"wrong": "Your voice sounds beautifully.", "model": "Your voice sounds beautiful.", "hint": "sound + 形容词", "why": "**sound 是感官系动词，后接形容词** beautiful（不是 beautifully）。"},
    {"wrong": "The fabric feels softly to the touch.", "model": "The fabric feels soft to the touch.", "hint": "feel + 形容词", "why": "**feel 表\"摸起来\"= 感官动词 → 形容词** soft。softly 是副词。"}
  ]$jsonb$::jsonb,

  boss_questions = $jsonb$[
    {"stem": "The fish ___ very fresh. Let''s buy some.", "option_a": "looks", "option_b": "look", "option_c": "is looking", "option_d": "looks like", "correct_answer": "A",
     "trap": "选 B 主谓不一致。选 C 进行时错。选 D fresh 是形容词不该用 like。", "why": "**fish 单数 → looks** + 形容词 fresh。"},
    {"stem": "Mom, the soup ___ a little bit salty. Maybe add more water?", "option_a": "tastes", "option_b": "taste", "option_c": "is tasting", "option_d": "tastes like", "correct_answer": "A",
     "trap": "选 D salty 是形容词不用 like。", "why": "**taste + 形容词** salty；the soup 单数。"},
    {"stem": "Tom ___ his father a lot. They have the same eyes.", "option_a": "looks", "option_b": "looks like", "option_c": "is looking like", "option_d": "looks as", "correct_answer": "B",
     "trap": "选 A his father 是名词，需要 like。", "why": "**look + like + 名词**（长得像某人）。"},
    {"stem": "It ___ rain this afternoon. The sky is getting dark.", "option_a": "looks", "option_b": "looks like", "option_c": "is looking", "option_d": "is looking like", "correct_answer": "B",
     "trap": "选 A 接的是 rain 后省略的从句。",
     "why": "**look like + 从句**（look like + it''s going to rain，常省略为 look like rain）。"}
  ]$jsonb$::jsonb

WHERE code = 'g8.10';


UPDATE junior_grammar_points SET teacher_script = $jsonb$[
  {"text": "今天解锁 **感官动词**：look / sound / smell / taste / feel。中考改错最爱挖的坑。", "show": "🎯 5 sense verbs", "duration": 10},
  {"text": "**核心**：感官动词 + **形容词**作表语（不接副词）！", "show": "sense verb + adj", "highlight": "+ adj", "duration": 10},
  {"text": "**举例**：The cake **looks delicious**.（不是 deliciously）", "show": "The cake looks delicious.", "highlight": "looks delicious", "duration": 11},
  {"text": "接**名词**时必须加 **like**：She **looks like** her mom.", "show": "+ like + noun", "highlight": "looks like", "duration": 11},
  {"text": "**5 个感官动词**：**look 看 / sound 听 / smell 闻 / taste 尝 / feel 摸感**", "show": "look · sound · smell · taste · feel", "highlight": "feel", "duration": 11},
  {"text": "**最大坑**：用副词代替形容词。~~looks deliciously~~ → **looks delicious**", "show": "✗ deliciously   ✓ delicious", "highlight": "delicious", "duration": 12},
  {"text": "**坑 ②**：感官动词通常**不用进行时**（状态动词）。", "show": "✗ is tasting   ✓ tastes", "highlight": "tastes", "duration": 11},
  {"text": "下一关进入实战。", "show": "Next → 6 Real-life Scenarios 📚", "duration": 6}
]$jsonb$::jsonb
WHERE code = 'g8.10';


DELETE FROM junior_grammar_questions WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.10') AND sort_order BETWEEN 9000 AND 9099;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.10')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer, accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading, difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.accepted_answers, q.explanation, q.distractors, q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  ('Your perfume ___ nice. What''s the name?', 'mcq', 'smells', 'smell', 'is smelling', 'smells like', 'A', NULL::text[], 'smell + 形容词 nice。perfume 单数 → smells。', '{}'::jsonb, NULL, 'sense_smell', false, 1, 9000),
  ('Tom ___ his grandpa. They have the same nose.', 'mcq', 'looks', 'looks like', 'is looking', 'looks as', 'B', NULL::text[], '接名词 his grandpa → looks like。', '{}'::jsonb, NULL, 'sense_look_like', false, 1, 9001),
  ('— Try this orange juice. — Wow, it ___ delicious!', 'mcq', 'tastes', 'is tasting', 'tastes like', 'taste', 'A', NULL::text[], 'taste + 形容词 delicious。', '{}'::jsonb, NULL, 'sense_taste', false, 1, 9002),
  ('The silk scarf ___ smooth and ___ a flower.', 'mcq', 'feels / smells like', 'feel / smell like', 'is feeling / smells', 'feels like / smells', 'A', NULL::text[], 'feel + 形容词 smooth；smell + like + 名词 a flower。', '{}'::jsonb, NULL, 'sense_feel_smell', false, 2, 9003),
  ('That cake ____ (look) wonderful. Where did you buy it?', 'fill', NULL, NULL, NULL, NULL, 'looks', ARRAY['looks']::text[], 'cake 单数 → looks + 形容词。', '{}'::jsonb, NULL, 'sense_look', false, 1, 9004),
  ('Your idea ____ (sound) interesting. Tell me more.', 'fill', NULL, NULL, NULL, NULL, 'sounds', ARRAY['sounds']::text[], 'idea 单数 → sounds + 形容词。', '{}'::jsonb, NULL, 'sense_sound', false, 1, 9005),
  ('This soup ____ (taste, like) my grandma''s recipe.', 'fill', NULL, NULL, NULL, NULL, 'tastes like', ARRAY['tastes like']::text[], '接名词 recipe → tastes like。', '{}'::jsonb, NULL, 'sense_taste_like', false, 2, 9006),
  ('改写：把副词换成形容词。  "The flower looks beautifully."', 'transform', NULL, NULL, NULL, NULL, 'The flower looks beautiful.', ARRAY['The flower looks beautiful.']::text[], 'beautifully → beautiful。', '{}'::jsonb, NULL, 'sense_adj_fix', true, 1, 9007),
  ('改写：加 like。  "She sounds her sister on the phone."', 'transform', NULL, NULL, NULL, NULL, 'She sounds like her sister on the phone.', ARRAY['She sounds like her sister on the phone.']::text[], '接名词 her sister → sounds like。', '{}'::jsonb, NULL, 'sense_add_like', true, 2, 9008),
  ('改错：  "These cookies are smelling very nice."', 'correction', NULL, NULL, NULL, NULL, 'These cookies smell very nice.', ARRAY['These cookies smell very nice.']::text[], '感官动词不用进行时。cookies 复数 → smell。', '{}'::jsonb, NULL, 'sense_no_continuous', true, 2, 9009),
  ('改错：  "You look tiredly. Did you sleep well last night?"', 'correction', NULL, NULL, NULL, NULL, 'You look tired. Did you sleep well last night?', ARRAY['You look tired. Did you sleep well last night?']::text[], 'look + 形容词 tired（tiredly 不是标准副词）。', '{}'::jsonb, NULL, 'sense_adj_after', true, 1, 9010),
  ('把这句话译成英文：你新做的发型看起来真好看，闻起来还有股淡淡的果香。',
   'translation', NULL, NULL, NULL, NULL, 'Your new hairstyle looks great, and it even smells slightly fruity.',
   ARRAY[
     'Your new hairstyle looks great, and it even smells slightly fruity.',
     'Your new hair looks lovely, and it smells like fruit.',
     'Your new hairdo looks really nice and smells faintly of fruit.'
   ]::text[], '考点：① look + 形容词 great；② smell + 形容词 fruity（或 + like + 名词 fruit）；③ "淡淡的"= slightly / faintly。', '{}'::jsonb, '更地道：smells slightly fruity / faintly of fruit 都自然。fruity 直接用形容词最简洁。', 'sense_translation', true, 3, 9011)
) AS q(stem, question_type, option_a, option_b, option_c, option_d, correct_answer, accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading, difficulty, sort_order);


DO $$
DECLARE v_point_id uuid; v_q_count int; v_depth int;
BEGIN
  SELECT id, content_depth INTO v_point_id, v_depth FROM junior_grammar_points WHERE code = 'g8.10';
  IF v_point_id IS NULL THEN RAISE EXCEPTION 'Missing g8.10'; END IF;
  IF v_depth <> 3 THEN RAISE EXCEPTION 'g8.10 depth %, expected 3', v_depth; END IF;
  SELECT count(*) INTO v_q_count FROM junior_grammar_questions WHERE point_id = v_point_id AND sort_order BETWEEN 9000 AND 9099;
  IF v_q_count <> 12 THEN RAISE EXCEPTION 'g8.10 expected 12 questions, got %', v_q_count; END IF;
  RAISE NOTICE 'g8.10 verified.';
END $$;
