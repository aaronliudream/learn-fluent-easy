-- =====================================================================
-- Gold-standard content for G8 · 形容词比较级（强化） · Comparatives
-- Code: g8.04   Category: other
-- =====================================================================
-- A2 foundation but heavily tested in 中考 单选 / 阅读 / 写作.
-- Covers: -er / more rules, irregular forms, much/even/a little
-- modifiers, parallel-comparison errors.
-- =====================================================================

UPDATE junior_grammar_points
SET
  summary = '比较两个事物的"谁更怎么样" — 中考写作里描述对比、给建议时几乎必用。',
  hook_line_cn = '中考写作的"加分小工具"：会用比较级 + 修饰词，作文档次直接抬一截。',
  hook_line = 'Comparatives — the single fastest way to make a 中考 essay sound advanced.',
  mnemonic = '比较级 = -er / more；要更强 = much / even / a little / a lot 修饰；不要 very。',
  content_depth = 3,

  explanation_md = E'## 🎯 一句话搞定\n\n**比较两个人或物的差异** → 用 **形容词比较级 + than**。\n\n---\n\n## 📐 比较级怎么变？\n\n| 形容词类型 | 变化规则 | 例子 |\n|---|---|---|\n| 单音节 → 加 **-er** | tall → **taller** | Tom is **taller than** me. |\n| 单音节"短元音 + 单辅音" → 双写末辅音 + er | big → **bigger**, hot → **hotter** | This box is **bigger than** that one. |\n| 以 e 结尾 → 加 **-r** | large → **larger** | Beijing is **larger than** Suzhou. |\n| 辅音 + y 结尾 → y 变 i 加 er | easy → **easier**, busy → **busier** | Math is **easier than** physics. |\n| 多音节 / 长形容词 → **more + 原级** | difficult → **more difficult** | English is **more difficult than** Chinese. |\n| 不规则 → 记住 5 组 | good/well → **better** · bad → **worse** · many/much → **more** · little → **less** · far → **farther / further** | His pronunciation is **better than** mine. |\n\n> ⚠️ **铁律**：**比较级 + than**。少了 than 就不是比较级，少了比较级就不能加 than。\n\n---\n\n## 🔥 修饰比较级（写作加分项）\n\n| 修饰词 | 含义 | 例子 |\n|---|---|---|\n| **much** | 高得多 | Lin is **much taller** than her sister. |\n| **a lot** | 高得多 | Today is **a lot colder** than yesterday. |\n| **even** | 甚至更…… | This book is **even better** than the last one. |\n| **a little** | 稍微 | The new phone is **a little heavier**. |\n| **far** | 远比…… | He runs **far faster** than I do. |\n\n> ⚠️ **绝不能用 very 修饰比较级！** ~~very taller~~ → **much taller**\n\n---\n\n## ⏰ 看到这些 = 比较级\n\n- **than**（最直接信号）\n- **the +er/more ..., the +er/more ...** = "越……越……"（The harder you study, the better you do.）\n- **A is + 比较级 + than B**\n- **Which / Who is + 比较级, A or B?**\n\n---\n\n## ⚠️ Top 5 易错点（中考批卷红笔常出现）\n\n1. **双重比较级**：~~more taller~~ → **taller**（要么加 -er，要么用 more，**不能同时用**）\n2. **用 very 修饰比较级**：~~very taller~~ → **much taller**\n3. **比较对象不一致**（最难看出的错）：~~My hair is longer than her.~~ → **My hair is longer than hers.**（比的是"我的头发"和"她的头发"，所以是 hers 不是 her）\n4. **than 后人称错**：~~Tom is taller than I.~~ ✓ 书面 / **Tom is taller than me.** ✓ 口语（中考用 me 更稳）\n5. **不规则记错**：~~gooder~~ → **better**；~~baddest~~ → **worse**\n\n---\n\n## 🧠 三秒判断口诀\n\n> ① 看到 **than** → 前面填**比较级**  \n> ② 想加强语气 → 用 **much / a lot / even / far**，**不要用 very**  \n> ③ 比较"我的"和"她的"东西 → 用 **mine / hers** 不要用 me / her',

  immersion_cards = $jsonb$[
    {"situation": "Comparing brothers at a family gathering", "cn": "我哥比我高一头。", "en": "My older brother is much taller than me."},
    {"situation": "Reacting to today''s weather forecast", "cn": "今天比昨天冷多了。", "en": "Today is a lot colder than yesterday."},
    {"situation": "Recommending a textbook to a friend", "cn": "这本练习册比那本简单。", "en": "This workbook is easier than that one."},
    {"situation": "Talking about your hometown vs. Suzhou", "cn": "苏州比我老家大得多。", "en": "Suzhou is much bigger than my hometown."},
    {"situation": "Discussing two films after class", "cn": "新版的特效比老版的好得多。", "en": "The special effects in the new version are far better than in the old one."},
    {"situation": "Encouraging a discouraged classmate", "cn": "其实你做的比你想的好。", "en": "You actually did better than you think."}
  ]$jsonb$::jsonb,

  contrast_table = $jsonb$[
    {"lhs": "He is more taller than his brother.",          "rhs": "He is much taller than his brother."},
    {"lhs": "Today is very colder than yesterday.",          "rhs": "Today is much colder than yesterday."},
    {"lhs": "My hair is longer than her.",                   "rhs": "My hair is longer than hers."},
    {"lhs": "Math is gooder than physics.",                  "rhs": "Math is better than physics."},
    {"lhs": "This box is more big than that one.",           "rhs": "This box is bigger than that one."},
    {"lhs": "Lin runs faster than me does.",                 "rhs": "Lin runs faster than I do. / Lin runs faster than me."}
  ]$jsonb$::jsonb,

  reflex_cards = $jsonb$[
    {"cn": "苹果比香蕉便宜。",                "en": "Apples are cheaper than bananas.",                "keyword": "cheaper than"},
    {"cn": "我比哥哥更喜欢运动。",            "en": "I like sports more than my brother does.",        "keyword": "more than"},
    {"cn": "这本书比那本有趣得多。",          "en": "This book is much more interesting than that one.","keyword": "much more interesting"},
    {"cn": "今天比昨天暖和一点。",            "en": "Today is a little warmer than yesterday.",        "keyword": "a little warmer"},
    {"cn": "他的字写得比我好。",              "en": "His handwriting is better than mine.",            "keyword": "better than mine"},
    {"cn": "新桥比旧桥长两倍。",              "en": "The new bridge is twice as long as the old one.", "keyword": "twice as long as"},
    {"cn": "Lin 跳得比 Wang 远。",            "en": "Lin jumps farther than Wang.",                    "keyword": "farther than"},
    {"cn": "他英语比数学好。",                "en": "He is better at English than at math.",           "keyword": "better at"}
  ]$jsonb$::jsonb,

  situation_drills = $jsonb$[
    {
      "situation": "Your friend asks which exam was harder this term.",
      "cn": "数学比英语难得多。",
      "en": "Math was much harder than English.",
      "accepted": [
        "The math exam was much harder than the English one.",
        "Math was a lot harder than English this term."
      ]
    },
    {
      "situation": "Comparing your new phone with the old one.",
      "cn": "新手机比旧的贵一点，但是相机好很多。",
      "en": "The new phone is a little more expensive than the old one, but the camera is much better.",
      "accepted": [
        "The new phone costs a little more, but it has a much better camera.",
        "The new one is slightly more expensive but the camera is far better."
      ]
    },
    {
      "situation": "Recommending Suzhou to a tourist who has only seen Shanghai.",
      "cn": "苏州比上海安静一点，更适合慢慢逛。",
      "en": "Suzhou is a little quieter than Shanghai, and better for slow exploring.",
      "accepted": [
        "Suzhou is quieter than Shanghai and a lot nicer for relaxing walks.",
        "Compared with Shanghai, Suzhou is quieter and better for taking your time."
      ]
    },
    {
      "situation": "Cheering up your friend after a tough match.",
      "cn": "其实你今天发挥得比上次好多了。",
      "en": "Actually, you played much better today than last time.",
      "accepted": [
        "You did far better today than you did last time.",
        "Honestly, your performance was a lot better today than before."
      ]
    }
  ]$jsonb$::jsonb,

  correction_tasks = $jsonb$[
    {
      "wrong": "He is more taller than his brother.",
      "model": "He is much taller than his brother.",
      "hint":  "比较级不能 -er 和 more 同时用",
      "why":   "**双重比较级**是中考最爱抓的错。tall 是单音节 → 直接 **taller**。要加强语气用 **much** 修饰。"
    },
    {
      "wrong": "Today is very colder than yesterday.",
      "model": "Today is much colder than yesterday.",
      "hint":  "very 不能修饰比较级",
      "why":   "**very 只修饰原级**（very cold）。修饰比较级要用 **much / a lot / even / far / a little**。"
    },
    {
      "wrong": "My hair is longer than her.",
      "model": "My hair is longer than hers.",
      "hint":  "比的是"她的头发"",
      "why":   "比较对象要**一致**：比的是"我的头发"和"她的头发"。her = 她（人），**hers = 她的（头发）**。"
    },
    {
      "wrong": "Math is gooder than physics.",
      "model": "Math is better than physics.",
      "hint":  "good 是不规则",
      "why":   "**good → better → best**，不规则变化必须记。同类：bad → worse、many/much → more、little → less。"
    },
    {
      "wrong": "This box is more big than that one.",
      "model": "This box is bigger than that one.",
      "hint":  "big 是单音节",
      "why":   "big 是**单音节**形容词，直接 **双写末辅音 + er** → **bigger**，不用 more。"
    },
    {
      "wrong": "Lin runs faster than me does.",
      "model": "Lin runs faster than I do. / Lin runs faster than me.",
      "hint":  "than 后接整句要主格",
      "why":   "than 后接**完整的省略句**（than I do）时用主格 I；接**简单宾格**（than me）也对，但不能 me does。"
    }
  ]$jsonb$::jsonb,

  boss_questions = $jsonb$[
    {
      "stem": "The new gym is ___ the old one.",
      "option_a": "more bigger than",
      "option_b": "very bigger than",
      "option_c": "much bigger than",
      "option_d": "a very big than",
      "correct_answer": "C",
      "trap": "选 A 双重比较级；选 B 用 very 修饰比较级；选 D 完全不对。",
      "why":  "big → **bigger**；修饰比较级用 **much / a lot / even / far**，不能用 very。"
    },
    {
      "stem": "Tom is good at sports, but his sister is ___.",
      "option_a": "gooder",
      "option_b": "best",
      "option_c": "more good",
      "option_d": "better",
      "correct_answer": "D",
      "trap": "选 A 不规则错记；选 B 是最高级，但只比较两个人用比较级；选 C 不存在。",
      "why":  "**good → better → best**。两人比较 → 比较级 **better**。"
    },
    {
      "stem": "My handwriting is much ___ than ___.",
      "option_a": "nicer / her",
      "option_b": "nicer / hers",
      "option_c": "more nicer / hers",
      "option_d": "nice / hers",
      "correct_answer": "B",
      "trap": "选 A 比较对象错（应该是"她的字"hers）；选 C 双重比较级；选 D 漏比较级。",
      "why":  "nice → **nicer**；比的是"我的字"和"她的字" → 用 **hers**（= her handwriting）。"
    },
    {
      "stem": "— Which subject is ___, math or English?\n— English. It''s ___ for me.",
      "option_a": "easier / much easier",
      "option_b": "the easier / much easier",
      "option_c": "easier / a little easier",
      "option_d": "the easiest / much easier",
      "correct_answer": "A",
      "trap": "选 B/D 多余的 the 或最高级（只两个科目用比较级）。选 C 在第二空"几乎不可能更简单"语境里太弱。",
      "why":  "两科目对比 → 比较级 **easier**；答案补充说明 → 用 much 加强 → **much easier**。"
    }
  ]$jsonb$::jsonb

WHERE code = 'g8.04';


UPDATE junior_grammar_points SET teacher_script = $jsonb$[
  {
    "text": "今天解锁**比较级**。中考写作里最容易加分的小工具 — 会用比较级 + 修饰词，作文档次立刻抬一截。",
    "show": "🎯 Today: Comparatives = -er / more + than",
    "duration": 9
  },
  {
    "text": "公式：**比较级 + than**。tall → **taller** than，比较级和 than 必须一起出现。",
    "show": "adj + er  /  more + adj   +   than",
    "highlight": "than",
    "duration": 10
  },
  {
    "text": "**单音节直接加 -er**：tall → taller, fast → faster, small → smaller。",
    "show": "tall → taller   fast → faster",
    "highlight": "-er",
    "duration": 9
  },
  {
    "text": "**单音节双写末辅音**：big → **bigger**, hot → hotter, thin → thinner。",
    "show": "big → bigger   hot → hotter",
    "highlight": "bigger",
    "duration": 9
  },
  {
    "text": "**y 变 i 加 er**：easy → **easier**, busy → busier, happy → happier。",
    "show": "easy → easier   happy → happier",
    "highlight": "easier",
    "duration": 9
  },
  {
    "text": "**多音节用 more**：difficult → **more difficult**, interesting → more interesting。",
    "show": "difficult → more difficult",
    "highlight": "more difficult",
    "duration": 10
  },
  {
    "text": "**5 个不规则必背**：good → **better**, bad → worse, many/much → more, little → less, far → farther/further。",
    "show": "good → better   bad → worse   many → more",
    "highlight": "better",
    "duration": 12
  },
  {
    "text": "**最重要**：修饰比较级用 **much / a lot / even / far / a little**，**绝对不能用 very**！",
    "show": "✗ very taller   ✓ much taller",
    "highlight": "much taller",
    "duration": 11
  }
]$jsonb$::jsonb
WHERE code = 'g8.04';


DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.04')
  AND sort_order BETWEEN 9000 AND 9099;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.04')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  (
    'My backpack is ___ than yours.',
    'mcq', 'more heavy', 'heavier', 'more heavier', 'heavyer', 'B',
    NULL::text[],
    'heavy（y 结尾）→ **heavier**。选 A/C/D 都是常见错误。',
    NULL::jsonb, NULL, 'comparative_y_to_i', false, 1, 9000
  ),
  (
    'This new game is ___ exciting than the old one.',
    'mcq', 'more', 'much', 'very', 'so', 'A',
    NULL::text[],
    'exciting 是多音节形容词 → 用 **more exciting**。',
    NULL::jsonb, NULL, 'comparative_more', false, 1, 9001
  ),
  (
    'The hot soup is ___ than I expected.',
    'mcq', 'a lot hotter', 'a lot more hot', 'very hotter', 'more hot', 'A',
    NULL::text[],
    'hot 单音节双写末辅音 → hotter；修饰用 **a lot**。',
    NULL::jsonb, NULL, 'comparative_modifier', false, 2, 9002
  ),
  (
    'Lin''s pronunciation is ___ than ___.',
    'mcq', 'better / me', 'gooder / mine', 'better / mine', 'more good / mine', 'C',
    NULL::text[],
    '①good 不规则 → **better**；② 比的是"她的发音"和"我的发音" → **mine**。',
    NULL::jsonb, NULL, 'comparative_irregular_object', false, 3, 9003
  ),

  (
    'Today is much ____ (cold) than yesterday. Wear a coat.',
    'fill', NULL, NULL, NULL, NULL, 'colder',
    ARRAY['colder']::text[],
    'cold 单音节 + er = **colder**；much 修饰比较级。',
    NULL::jsonb, NULL, 'comparative_basic', false, 1, 9004
  ),
  (
    'This math problem is ____ (difficult) than the last one.',
    'fill', NULL, NULL, NULL, NULL, 'more difficult',
    ARRAY['more difficult']::text[],
    'difficult 多音节 → **more difficult**。',
    NULL::jsonb, NULL, 'comparative_more', false, 2, 9005
  ),
  (
    'Her grade in English is ____ (good) than mine.',
    'fill', NULL, NULL, NULL, NULL, 'better',
    ARRAY['better']::text[],
    'good 不规则 → **better**。',
    NULL::jsonb, NULL, 'comparative_irregular', false, 1, 9006
  ),

  (
    '改写为比较级：  "Beijing is big. Suzhou is not as big as Beijing."',
    'transform', NULL, NULL, NULL, NULL, 'Beijing is bigger than Suzhou.',
    ARRAY[
      'Beijing is bigger than Suzhou.',
      'Beijing is much bigger than Suzhou.'
    ]::text[],
    'A is not as big as B → B is bigger than A（注意比较关系翻转）。',
    NULL::jsonb, NULL, 'comparative_transform', true, 2, 9007
  ),
  (
    '用 much 修饰比较级，合并：  "Today is cold. Yesterday was not so cold."',
    'transform', NULL, NULL, NULL, NULL, 'Today is much colder than yesterday.',
    ARRAY[
      'Today is much colder than yesterday.',
      'Today is a lot colder than yesterday.'
    ]::text[],
    'much / a lot 都是修饰比较级的常用副词。',
    NULL::jsonb, NULL, 'comparative_modifier', true, 2, 9008
  ),

  (
    '改错：  "He is more taller than his brother."',
    'correction', NULL, NULL, NULL, NULL, 'He is much taller than his brother.',
    ARRAY[
      'He is much taller than his brother.'
    ]::text[],
    '双重比较级（more + -er）是中考最高频改错点。要加强用 **much / a lot / even**。',
    NULL::jsonb, NULL, 'comparative_double', true, 2, 9009
  ),
  (
    '改错：  "My hair is longer than her."',
    'correction', NULL, NULL, NULL, NULL, 'My hair is longer than hers.',
    ARRAY[
      'My hair is longer than hers.'
    ]::text[],
    '比较对象要**对等**：比的是"我的头发"和"她的头发" → **hers**（her hair 的缩写）。',
    NULL::jsonb, NULL, 'comparative_pronoun_match', true, 3, 9010
  ),

  (
    '把这句话译成英文：今年夏天比去年热得多。',
    'translation', NULL, NULL, NULL, NULL, 'This summer is much hotter than last summer.',
    ARRAY[
      'This summer is much hotter than last summer.',
      'It is much hotter this summer than last summer.',
      'This summer is a lot hotter than last summer.',
      'This summer is far hotter than last summer.'
    ]::text[],
    '考点：① hot 单音节双写 → hotter；② "得多"用 much / a lot / far 修饰比较级；③ 比较对象 last summer。',
    NULL::jsonb, '更地道：It is much hotter this summer than last summer 是英语母语者更常用的句式（it 形式主语开头）。', 'comparative_translation', true, 3, 9011
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
  SELECT id, content_depth INTO v_point_id, v_depth FROM junior_grammar_points WHERE code = 'g8.04';
  IF v_point_id IS NULL THEN
    RAISE EXCEPTION 'Gold-standard migration failed: junior_grammar_points row with code=''g8.04'' does not exist.';
  END IF;
  IF v_depth <> 3 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: content_depth for g8.04 is %, expected 3.', v_depth;
  END IF;
  SELECT count(*) INTO v_q_count
  FROM junior_grammar_questions
  WHERE point_id = v_point_id AND sort_order BETWEEN 9000 AND 9099;
  IF v_q_count <> 12 THEN
    RAISE EXCEPTION 'Gold-standard migration failed: expected 12 questions in 9000-9099 for g8.04, got %.', v_q_count;
  END IF;
  RAISE NOTICE 'Gold-standard migration for g8.04 verified: content_depth=3, % questions seeded.', v_q_count;
END $$;
