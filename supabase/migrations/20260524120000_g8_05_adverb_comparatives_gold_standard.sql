-- =====================================================================
-- Gold-standard content for G8 · 副词比较级与最高级
-- Code: g8.05   Category: other
-- =====================================================================
-- Adverb side of comparison (pairs with g8.04 / g8.09 adjective sides).
-- Top trap: students use adjective form where adverb is needed.
-- =====================================================================

UPDATE junior_grammar_points
SET
  summary = '"跑得更快 / 唱得最好" — 副词比较级 + 最高级，描述动作的方式，比较的不是人物本身。',
  hook_line_cn = '中考写作里"谁跑得更快、谁做得最好"全靠它。注意：修饰的是动作，不是名词，所以用副词不是形容词。',
  hook_line = 'Adverb comparatives — describe HOW someone does something, not what they are.',
  mnemonic = '副词比较 = -er / -est（单音节）或 more / most（-ly 结尾）；不规则 well → better → best。',
  content_depth = 3,

  explanation_md = E'## 🎯 一句话搞定\n\n**比较"动作的方式"** → 用 **副词比较级 + than** 或 **(the) 副词最高级**。\n\n---\n\n## 📐 副词比较怎么变？\n\n| 副词类型 | 变化规则 | 例子 |\n|---|---|---|\n| **单音节副词** | 加 **-er / -est** | fast → **faster / fastest**, hard → **harder / hardest**, early → earlier / earliest |\n| **以 -ly 结尾的副词** | 用 **more / most + 副词** | slowly → **more slowly / most slowly**, carefully → more carefully / most carefully |\n| **不规则** | 必背 4 组 | **well → better → best**, **badly → worse → worst**, far → farther / farthest, much → more / most |\n\n> ⚠️ **铁律 ①**：副词最高级前面 **the 可省略**（与形容词最高级不同！）。  \n> Of all the students, Mike works **(the) hardest**.\n\n---\n\n## 🔥 形容词 vs 副词：怎么区分？\n\n| 形容词修饰 | 副词修饰 |\n|---|---|\n| **名词** | **动词 / 形容词 / 副词** |\n| He is a **fast** runner.（修饰 runner）| He runs **fast**.（修饰 runs）|\n| She is a **beautiful** singer. | She sings **beautifully**. |\n| He is **good** at math. | He does math **well**. |\n\n> 中考最高频陷阱：~~She sings beautiful.~~ → **She sings beautifully.**（修饰动词 sing 必须用副词）\n\n---\n\n## ⏰ 看到这些 = 副词比较\n\n- **动词** + 副词 + than（runs faster than）\n- of all 后接最高级（works hardest of all）\n- Who runs ___? → 比较级或最高级\n- well / hard / fast / early / late 这些"裸副词"（不加 -ly）\n\n---\n\n## ⚠️ Top 5 易错点（中考批卷红笔常出现）\n\n1. **副词位置用了形容词**：~~She sings beautiful.~~ → **She sings beautifully.**\n2. **good vs well 混用**：~~He does well at math.~~（不规范）→ **He is good at math.** 或 **He does math well.**\n3. **hard 和 hardly 混淆**：~~He works hardly.~~（hardly = 几乎不！） → **He works hard.**（用力地）\n4. **副词比较级前漏 more**：~~She sings more beautiful.~~ → **She sings more beautifully.**\n5. **副词最高级硬加 the**（the 可省）：~~He runs the fastest of all.~~ ✓（也对）but **He runs fastest of all.** ✓（更地道）\n\n---\n\n## 🔥 hard vs hardly（中考高频陷阱）\n\n- **hard**（副词）= 努力地 / 用力地。例：He works **hard**.\n- **hardly**（副词）= 几乎不（含否定意义！）。例：I can **hardly** hear you.\n\n两个长得像，**意思相反**！\n\n---\n\n## 🧠 三秒判断口诀\n\n> ① 看修饰对象：修饰**动词** → 副词；修饰**名词** → 形容词  \n> ② 单音节副词 → -er / -est；**-ly 结尾** → more / most  \n> ③ 不规则副词：**well → better → best**；**badly → worse → worst**  \n> ④ **hard** = 努力地；**hardly** = 几乎不（含否定！）',

  immersion_cards = $jsonb$[
    {"situation": "Comparing two runners in PE class", "cn": "Lin 跑得比 Wang 快。", "en": "Lin runs faster than Wang."},
    {"situation": "Praising a hardworking classmate", "cn": "他在班里学习最努力。", "en": "He studies (the) hardest in our class."},
    {"situation": "Recommending a singer to a friend", "cn": "她唱得比我们班所有人都好听。", "en": "She sings more beautifully than anyone else in our class."},
    {"situation": "Reflecting on this term''s progress", "cn": "这学期我英语进步了很多。", "en": "I have done much better in English this term."},
    {"situation": "Friend asks how you''re feeling today", "cn": "我感觉好多了，谢谢。", "en": "I feel much better now, thanks."},
    {"situation": "Telling tutor where you struggle", "cn": "我数学做得最差。", "en": "I do worst in math."}
  ]$jsonb$::jsonb,

  contrast_table = $jsonb$[
    {"lhs": "She sings beautiful.",                          "rhs": "She sings beautifully."},
    {"lhs": "He runs more fast than me.",                     "rhs": "He runs faster than me."},
    {"lhs": "She sings more beautiful than him.",             "rhs": "She sings more beautifully than him."},
    {"lhs": "He works hardly every day.",                     "rhs": "He works hard every day."},
    {"lhs": "Of all the students, Mike speaks the most well.","rhs": "Of all the students, Mike speaks (the) best."},
    {"lhs": "Tom does good in math.",                          "rhs": "Tom does well in math. / Tom is good at math."}
  ]$jsonb$::jsonb,

  reflex_cards = $jsonb$[
    {"cn": "她跑得比我快。",                  "en": "She runs faster than me.",                      "keyword": "runs faster"},
    {"cn": "Tom 笑得最响。",                  "en": "Tom laughs (the) loudest.",                     "keyword": "(the) loudest"},
    {"cn": "他比上次写得更仔细。",            "en": "He writes more carefully than last time.",      "keyword": "more carefully"},
    {"cn": "她钢琴弹得好极了。",              "en": "She plays the piano very well.",                "keyword": "very well"},
    {"cn": "今天我感觉好多了。",              "en": "I feel much better today.",                     "keyword": "much better"},
    {"cn": "我们班谁起得最早？",              "en": "Who gets up earliest in our class?",            "keyword": "earliest"},
    {"cn": "他几乎听不见你说话。",            "en": "He can hardly hear you.",                       "keyword": "can hardly"},
    {"cn": "她比我学得更努力。",              "en": "She studies harder than me.",                   "keyword": "harder than"}
  ]$jsonb$::jsonb,

  situation_drills = $jsonb$[
    {
      "situation": "Comparing your performance with a friend after a singing contest.",
      "cn": "其实你今天唱得比我好多了。",
      "en": "Actually, you sang much better than me today.",
      "accepted": [
        "Honestly, you sang a lot better than I did today.",
        "You really sang much better than me today."
      ]
    },
    {
      "situation": "Telling your mom what changed in your English class.",
      "cn": "这学期我的英语写得比以前好多了。",
      "en": "I''ve been writing English much better this term than before.",
      "accepted": [
        "My English writing has improved a lot this term.",
        "I write English much better this term than I did before."
      ]
    },
    {
      "situation": "Praising a classmate''s hard work to your teacher.",
      "cn": "Lin 这学期学得最努力。",
      "en": "Lin has studied (the) hardest this term.",
      "accepted": [
        "Of everyone, Lin has worked the hardest this term.",
        "Lin worked harder than anyone else this term."
      ]
    },
    {
      "situation": "Reporting why you couldn''t hear the announcement at the station.",
      "cn": "广播声音太小了，我几乎听不见。",
      "en": "The announcement was so quiet that I could hardly hear it.",
      "accepted": [
        "I could barely hear the announcement.",
        "The announcement was too quiet — I almost couldn''t hear anything."
      ]
    }
  ]$jsonb$::jsonb,

  correction_tasks = $jsonb$[
    {
      "wrong": "She sings beautiful in the school choir.",
      "model": "She sings beautifully in the school choir.",
      "hint":  "修饰动词用副词",
      "why":   "**sings** 是动词，修饰动词必须用**副词** beautifully。形容词 beautiful 只能修饰名词。"
    },
    {
      "wrong": "He runs more fast than his brother.",
      "model": "He runs faster than his brother.",
      "hint":  "单音节副词加 -er",
      "why":   "**fast 是单音节副词**，直接加 **-er** = faster。不需要 more。"
    },
    {
      "wrong": "She speaks more beautiful than the others.",
      "model": "She speaks more beautifully than the others.",
      "hint":  "副词比较级也要用副词",
      "why":   "**speaks 是动词 → 必须用副词形式**。more 后接副词 **beautifully**，不是形容词 beautiful。"
    },
    {
      "wrong": "He works hardly to support his family.",
      "model": "He works hard to support his family.",
      "hint":  "hard ≠ hardly",
      "why":   "**hard** = 努力地（褒义）；**hardly** = 几乎不（否定意义）。语境是\"努力工作\" → 必须 hard。"
    },
    {
      "wrong": "Tom does good in math.",
      "model": "Tom does well in math. / Tom is good at math.",
      "hint":  "good 是形容词",
      "why":   "**修饰动词 does** 必须用副词 **well**。good 修饰名词 (a good student)。两种说法都对：do well in / be good at。"
    },
    {
      "wrong": "Lin sings the most beautifully than all of us.",
      "model": "Lin sings (the) most beautifully of all of us.",
      "hint":  "最高级搭配 of",
      "why":   "**最高级**搭配的不是 than 而是 **of / in**；than 用于比较级。"
    }
  ]$jsonb$::jsonb,

  boss_questions = $jsonb$[
    {
      "stem": "Lin runs ___ than Wang in our class.",
      "option_a": "more fast",
      "option_b": "faster",
      "option_c": "more faster",
      "option_d": "fastest",
      "correct_answer": "B",
      "trap": "选 A 多音节才用 more。选 C 双重比较级。选 D 最高级 + than 不搭配。",
      "why":  "**fast 单音节副词 → -er → faster** + than。"
    },
    {
      "stem": "Of all the children, Tom laughs ___ at funny stories.",
      "option_a": "the most loud",
      "option_b": "the loudest",
      "option_c": "the most loudly",
      "option_d": "the loudly",
      "correct_answer": "B",
      "trap": "选 C 多余的 most；loud 也可作副词。",
      "why":  "**loud 是单音节副词** → loudest。\"Of all the children\" 提示最高级。"
    },
    {
      "stem": "Today I feel ___ than yesterday. The medicine works.",
      "option_a": "more good",
      "option_b": "better",
      "option_c": "the best",
      "option_d": "more well",
      "correct_answer": "B",
      "trap": "选 A more good 错；选 C 最高级 + than 不搭配；选 D more well 错。",
      "why":  "**well → better → best**（不规则）。两种状态对比用比较级 better。"
    },
    {
      "stem": "She sings ___ than her sister.",
      "option_a": "more beautiful",
      "option_b": "beautifuler",
      "option_c": "more beautifully",
      "option_d": "most beautifully",
      "correct_answer": "C",
      "trap": "选 A 修饰动词 sings 必须用副词。选 B 不存在。选 D 最高级 + than 不搭配。",
      "why":  "**sings 是动词 → 用副词**；beautifully 多音节副词 → **more beautifully**。"
    }
  ]$jsonb$::jsonb

WHERE code = 'g8.05';


UPDATE junior_grammar_points SET teacher_script = $jsonb$[
  {
    "text": "今天解锁**副词比较级**。中考写作里\"跑得更快、唱得最好\"全靠它 — 注意修饰的是动作不是人。",
    "show": "🎯 Today: Adverb comparatives — how someone does something",
    "duration": 11
  },
  {
    "text": "**核心区别**：形容词修饰**名词**（a fast runner），副词修饰**动词**（runs fast）。",
    "show": "fast runner (adj)   |   runs fast (adv)",
    "highlight": "fast",
    "duration": 11
  },
  {
    "text": "**单音节副词加 -er**：fast → **faster**, hard → harder, early → earlier。",
    "show": "fast → faster   hard → harder",
    "highlight": "faster",
    "duration": 10
  },
  {
    "text": "**-ly 结尾的副词用 more**：slowly → **more slowly**, carefully → more carefully, beautifully → more beautifully。",
    "show": "slowly → more slowly   beautifully → more beautifully",
    "highlight": "more slowly",
    "duration": 11
  },
  {
    "text": "**4 个不规则必背**：**well → better → best**, badly → worse → worst, far → farther → farthest, much → more → most。",
    "show": "well → better → best",
    "highlight": "better",
    "duration": 11
  },
  {
    "text": "**最大坑 ①**：修饰动词用形容词。~~She sings beautiful.~~ → **She sings beautifully.**",
    "show": "✗ sings beautiful   ✓ sings beautifully",
    "highlight": "beautifully",
    "duration": 12
  },
  {
    "text": "**最大坑 ②**：**hard ≠ hardly**！hard = 努力地（褒义）；hardly = 几乎不（否定）。",
    "show": "hard = 努力   hardly = 几乎不",
    "highlight": "hardly",
    "duration": 12
  },
  {
    "text": "**最大坑 ③**：副词最高级前 **the 可省略**。He works (the) hardest. 写作时建议加 the 更稳。",
    "show": "He works (the) hardest of all.",
    "highlight": "(the) hardest",
    "duration": 11
  }
]$jsonb$::jsonb
WHERE code = 'g8.05';


DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.05')
  AND sort_order BETWEEN 9000 AND 9099;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.05')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  (
    'Lin jumps ___ than her brother in PE class.',
    'mcq', 'higher', 'high', 'more high', 'highly', 'A',
    NULL::text[],
    'high 是单音节副词 → higher。',
    '{}'::jsonb, NULL, 'adverb_comparative_basic', false, 1, 9000
  ),
  (
    'Of all the students, Tom speaks English ___.',
    'mcq', 'more well', 'best', 'better', 'the most well', 'B',
    NULL::text[],
    'well 不规则 → better → best；Of all 提示最高级。',
    '{}'::jsonb, NULL, 'adverb_superlative_irregular', false, 2, 9001
  ),
  (
    'She does her homework ___ than I do.',
    'mcq', 'more careful', 'more carefully', 'careful', 'most careful', 'B',
    NULL::text[],
    '修饰动词 does → 副词；carefully 多音节 → more carefully。',
    '{}'::jsonb, NULL, 'adverb_comparative_ly', false, 2, 9002
  ),
  (
    'He works ___ every day to support his family.',
    'mcq', 'hardly', 'hard', 'harder', 'hardest', 'B',
    NULL::text[],
    'hard = 努力地；hardly = 几乎不。语境是努力工作 → hard。',
    '{}'::jsonb, NULL, 'adverb_hard_vs_hardly', false, 1, 9003
  ),

  (
    'Lin sings ____ (beautiful) than her sister.',
    'fill', NULL, NULL, NULL, NULL, 'more beautifully',
    ARRAY['more beautifully']::text[],
    '修饰动词 sings → 副词；beautifully → more beautifully。',
    '{}'::jsonb, NULL, 'adverb_comparative_ly', false, 2, 9004
  ),
  (
    'Mike runs the ____ (fast) in our class.',
    'fill', NULL, NULL, NULL, NULL, 'fastest',
    ARRAY['fastest', 'the fastest']::text[],
    '副词最高级 fastest；the 可省。',
    '{}'::jsonb, NULL, 'adverb_superlative_basic', false, 1, 9005
  ),
  (
    'I can ____ (hard) hear what you''re saying. Please speak louder.',
    'fill', NULL, NULL, NULL, NULL, 'hardly',
    ARRAY['hardly']::text[],
    '"几乎听不见"= hardly（含否定意义）。',
    '{}'::jsonb, NULL, 'adverb_hardly', false, 2, 9006
  ),

  (
    '改写为副词比较级：  "Tom is a fast runner. His sister is a faster runner."',
    'transform', NULL, NULL, NULL, NULL, 'Tom''s sister runs faster than Tom.',
    ARRAY[
      'Tom''s sister runs faster than Tom.',
      'Tom''s sister runs faster than he does.'
    ]::text[],
    '把形容词修饰的句子改成副词修饰动词：fast runner → runs fast → runs faster。',
    '{}'::jsonb, NULL, 'adverb_transform_from_adj', true, 2, 9007
  ),
  (
    '改写为副词最高级：  "Lin works very hard."（强调班里最努力）',
    'transform', NULL, NULL, NULL, NULL, 'Lin works (the) hardest in our class.',
    ARRAY[
      'Lin works the hardest in our class.',
      'Lin works hardest in our class.'
    ]::text[],
    'works very hard → works (the) hardest + 范围。',
    '{}'::jsonb, NULL, 'adverb_superlative_transform', true, 2, 9008
  ),

  (
    '改错：  "She sings very beautiful in the school choir."',
    'correction', NULL, NULL, NULL, NULL, 'She sings very beautifully in the school choir.',
    ARRAY[
      'She sings very beautifully in the school choir.'
    ]::text[],
    '修饰动词 sings 必须用副词 beautifully。',
    '{}'::jsonb, NULL, 'adverb_modifies_verb', true, 1, 9009
  ),
  (
    '改错：  "Of all the students in our school, Mike works the most hard."',
    'correction', NULL, NULL, NULL, NULL, 'Of all the students in our school, Mike works (the) hardest.',
    ARRAY[
      'Of all the students in our school, Mike works the hardest.',
      'Of all the students in our school, Mike works hardest.'
    ]::text[],
    'hard 单音节副词 → hardest；不能用 most。',
    '{}'::jsonb, NULL, 'adverb_superlative_single_syllable', true, 2, 9010
  ),

  (
    '把这句话译成英文：他比上次跑得快多了，进步真大。',
    'translation', NULL, NULL, NULL, NULL, 'He ran much faster than last time — what great progress!',
    ARRAY[
      'He ran much faster than last time — what great progress!',
      'He ran a lot faster than last time. What huge progress!',
      'His speed was much faster than last time; he has made great progress.'
    ]::text[],
    '考点：① 修饰动词 ran 用副词 faster；② "快多了"= much faster（much / a lot / far 修饰比较级）；③ "进步真大"= great progress 感叹句。',
    '{}'::jsonb, '更地道：用 much / a lot 修饰比较级；what + a/an + adj + n 是感叹句固定句型。', 'adverb_translation', true, 3, 9011
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
  SELECT id, content_depth INTO v_point_id, v_depth FROM junior_grammar_points WHERE code = 'g8.05';
  IF v_point_id IS NULL THEN
    RAISE EXCEPTION 'Gold-standard migration failed: junior_grammar_points row with code=''g8.05'' does not exist.';
  END IF;
  IF v_depth <> 3 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: content_depth for g8.05 is %, expected 3.', v_depth;
  END IF;
  SELECT count(*) INTO v_q_count
  FROM junior_grammar_questions
  WHERE point_id = v_point_id AND sort_order BETWEEN 9000 AND 9099;
  IF v_q_count <> 12 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: expected 12 questions for g8.05, got %.', v_q_count;
  END IF;
  RAISE NOTICE 'Gold-standard migration for g8.05 verified: content_depth=3, % questions seeded.', v_q_count;
END $$;
