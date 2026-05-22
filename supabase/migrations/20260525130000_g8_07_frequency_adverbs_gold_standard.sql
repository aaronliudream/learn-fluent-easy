-- =====================================================================
-- Gold-standard content for G8 · 频度副词 · Frequency Adverbs
-- Code: g8.07   Category: other
-- =====================================================================

UPDATE junior_grammar_points
SET
  summary = '"总是 / 通常 / 经常 / 有时 / 从不" — 描述习惯频率的副词，位置错了整句就错。',
  hook_line_cn = '中考高频考点：频度副词放哪里？三个铁律 — 实义动词前、be 动词后、助动词后。',
  hook_line = 'always / usually / often / sometimes / never — placement rules that 中考 graders love testing.',
  mnemonic = '频度副词位置：实义动词前 · be 动词后 · 助/情态动词后。',
  content_depth = 3,

  explanation_md = E'## 🎯 一句话搞定\n\n描述"多频繁做某事" → 用 **频度副词**：从 always（100%）到 never（0%）。位置要放对，否则中考扣分。\n\n---\n\n## 📐 频度光谱（100% → 0%）\n\n| 频率 | 副词 | 大致 % |\n|---|---|---|\n| 100% | **always** 总是 | 100% |\n| 90% | **usually** 通常 | 80–90% |\n| 70% | **often** 经常 | 60–80% |\n| 50% | **sometimes** 有时 | 30–50% |\n| 10% | **seldom / rarely** 很少 | 5–15% |\n| 0% | **never** 从不 | 0% |\n\n---\n\n## 🔥 三大位置规则（必背）\n\n### ① 在**实义动词前**\n- I **always read** before bed.（实义动词 read）\n- She **often visits** her grandma.\n\n### ② 在 **be 动词后**\n- Tom **is never late** for class.\n- They **are usually busy** on weekends.\n\n### ③ 在**助动词 / 情态动词后**\n- I **have always wanted** to visit Beijing.（助动词 have）\n- You **should always wash** your hands.（情态动词 should）\n- She **doesn''t often eat** fast food.（否定句：在 don''t / doesn''t 后）\n\n---\n\n## 🔥 sometimes 的特殊位置（中考常考）\n\n**sometimes** 比较灵活，可以放：\n- 句首：**Sometimes** I go to the park.\n- 实义动词前：I **sometimes** go to the park.\n- 句末：I go to the park **sometimes**.\n\n其他频度副词通常**不能放句首/句末**，sometimes 是例外。\n\n---\n\n## ⏰ 看到这些 = 频度副词题\n\n- always / usually / often / sometimes / seldom / rarely / never\n- 询问句 How often + do/does + 主语 + 动词原形?\n- 中考写作描述习惯 / 日常 / 个人喜好\n\n---\n\n## ⚠️ Top 5 易错点（中考批卷红笔常出现）\n\n1. **always 放在 be 动词前**：~~I always am late.~~ → **I am always late.**（be 后）\n2. **often 放在实义动词后**：~~He plays often basketball.~~ → **He often plays basketball.**（实义动词前）\n3. **never 配 doesn''t**（双重否定）：~~He doesn''t never come.~~ → **He never comes.** 或 **He doesn''t come.**\n4. **频度副词放句末**（除了 sometimes）：~~I go to school always.~~ → **I always go to school.**\n5. **助动词后位置错**：~~I always have wanted to go.~~ → **I have always wanted to go.**（助动词 have 之后）\n\n---\n\n## 🧠 三秒判断口诀\n\n> ① 看主动词是什么？**实义动词** → 副词放**前面**；**be 动词** → 副词放**后面**  \n> ② 有助动词 / 情态动词？副词放**助动词后 + 实义动词前**  \n> ③ never 已含否定，**不能再加 don''t**',

  immersion_cards = $jsonb$[
    {"situation": "Sharing your healthy habit with a friend", "cn": "我总是 6 点起床去跑步。", "en": "I always get up at six to go running."},
    {"situation": "Talking about your weekend routine", "cn": "周末我通常和朋友一起打篮球。", "en": "I usually play basketball with friends on weekends."},
    {"situation": "Describing a classmate''s punctuality", "cn": "Tom 上课从不迟到。", "en": "Tom is never late for class."},
    {"situation": "Mom''s reminder about hand washing", "cn": "你饭前应该一直洗手。", "en": "You should always wash your hands before meals."},
    {"situation": "Telling about something rare", "cn": "我很少吃快餐。", "en": "I seldom eat fast food."},
    {"situation": "A flexible scheduling word", "cn": "有时我会熬夜读小说。", "en": "Sometimes I stay up reading novels."}
  ]$jsonb$::jsonb,

  contrast_table = $jsonb$[
    {"lhs": "I always am late for class.",                "rhs": "I am always late for class."},
    {"lhs": "He plays often basketball after school.",     "rhs": "He often plays basketball after school."},
    {"lhs": "Tom doesn''t never go to bed early.",          "rhs": "Tom never goes to bed early."},
    {"lhs": "I go to the gym always after work.",          "rhs": "I always go to the gym after work."},
    {"lhs": "I always have wanted to be a singer.",         "rhs": "I have always wanted to be a singer."},
    {"lhs": "She is sometime quiet in class.",              "rhs": "She is sometimes quiet in class."}
  ]$jsonb$::jsonb,

  reflex_cards = $jsonb$[
    {"cn": "我经常迟到。",                      "en": "I am often late.",                            "keyword": "am often"},
    {"cn": "她总是帮助同学。",                  "en": "She always helps her classmates.",            "keyword": "always helps"},
    {"cn": "我从不熬夜。",                      "en": "I never stay up late.",                       "keyword": "never stay up"},
    {"cn": "Tom 通常 6 点回家。",               "en": "Tom usually gets home at six.",               "keyword": "usually gets"},
    {"cn": "我们有时去看电影。",                "en": "We sometimes go to the movies.",              "keyword": "sometimes go"},
    {"cn": "他很少打游戏。",                    "en": "He seldom plays video games.",                "keyword": "seldom plays"},
    {"cn": "你应该总是诚实。",                  "en": "You should always be honest.",                "keyword": "should always be"},
    {"cn": "我一直想去日本。",                  "en": "I have always wanted to visit Japan.",        "keyword": "have always wanted"}
  ]$jsonb$::jsonb,

  situation_drills = $jsonb$[
    {
      "situation": "Telling a pen pal about your morning routine.",
      "cn": "我总是 6 点起床，然后通常吃一碗粥当早餐。",
      "en": "I always get up at 6 and usually have a bowl of porridge for breakfast.",
      "accepted": [
        "I''m always up at 6 and I usually eat porridge for breakfast.",
        "Every morning I get up at 6 and tend to have porridge."
      ]
    },
    {
      "situation": "Describing a punctual classmate to your teacher.",
      "cn": "Lin 从不迟到，每天总是早 5 分钟到教室。",
      "en": "Lin is never late and always arrives in the classroom 5 minutes early.",
      "accepted": [
        "Lin never comes late; she''s always 5 minutes early to class.",
        "Lin always arrives 5 minutes early — she''s never late."
      ]
    },
    {
      "situation": "Defending a friend who rarely makes mistakes.",
      "cn": "他很少出错，所以这次答题失误肯定有原因。",
      "en": "He rarely makes mistakes, so there must be a reason he slipped this time.",
      "accepted": [
        "He almost never makes mistakes, so there''s definitely a reason this time.",
        "He seldom gets things wrong; something must have happened."
      ]
    },
    {
      "situation": "Sharing flexibility about your weekend plans.",
      "cn": "周末我有时去公园，有时呆在家看书。",
      "en": "On weekends I sometimes go to the park and sometimes stay home reading.",
      "accepted": [
        "Sometimes I go to the park on weekends, other times I just stay home and read.",
        "On weekends I''ll either go to the park or stay home reading."
      ]
    }
  ]$jsonb$::jsonb,

  correction_tasks = $jsonb$[
    {"wrong": "I always am late for school.", "model": "I am always late for school.", "hint": "频度副词放 be 后", "why": "**频度副词在 be 动词后**：I am always ..."},
    {"wrong": "He plays often basketball.", "model": "He often plays basketball.", "hint": "实义动词前", "why": "**频度副词在实义动词前**：He often plays ..."},
    {"wrong": "Tom doesn''t never come to school late.", "model": "Tom never comes to school late.", "hint": "never 已含否定", "why": "**never 自带否定**，不能再加 doesn''t（双重否定）。"},
    {"wrong": "I go to the cinema always with my friends.", "model": "I always go to the cinema with my friends.", "hint": "不能放句末", "why": "**频度副词通常不放句末**（sometimes 例外）。always 必须放在实义动词前。"},
    {"wrong": "I always have wanted to be a doctor.", "model": "I have always wanted to be a doctor.", "hint": "助动词后", "why": "**助动词 have 之后** → I have **always** wanted ..."},
    {"wrong": "She is sometime quiet in class.", "model": "She is sometimes quiet in class.", "hint": "sometimes 有 s", "why": "**sometimes**（有时，副词，结尾有 s）≠ sometime（某时）≠ some time（一段时间）。"}
  ]$jsonb$::jsonb,

  boss_questions = $jsonb$[
    {"stem": "I ___ late for the school bus, but I''m on time today.", "option_a": "am usually", "option_b": "usually am", "option_c": "am usually being", "option_d": "usually be", "correct_answer": "A",
     "trap": "选 B 把副词放 be 前 — 错。选 C/D 形式错。", "why": "**be 动词 + 频度副词** → am usually。"},
    {"stem": "He ___ to school by subway every weekday.", "option_a": "always goes", "option_b": "goes always", "option_c": "is going always", "option_d": "go always", "correct_answer": "A",
     "trap": "选 B 副词放实义动词后 — 错。选 C 时态错。选 D 漏 -s。", "why": "**频度副词在实义动词前** + 第三人称单数 → always goes。"},
    {"stem": "I ___ wanted to learn the piano, but never had the chance.", "option_a": "always have", "option_b": "have always", "option_c": "have wanted always", "option_d": "always wanted have", "correct_answer": "B",
     "trap": "选 A 副词放助动词前 — 错。选 C 副词放句末 — 错。选 D 完全乱。", "why": "**助动词 have 之后** → have **always** wanted。"},
    {"stem": "Tom is a careful boy. He ___ makes mistakes in his homework.", "option_a": "always", "option_b": "usually", "option_c": "never", "option_d": "rarely", "correct_answer": "D",
     "trap": "选 A/B 意思相反（粗心）。选 C never 太绝对（careful 不等于完美）。",
     "why": "**careful 但不完美** → rarely / seldom 最合适（很少出错）。never 太绝对，与\"细心男孩\"略不匹配。"}
  ]$jsonb$::jsonb

WHERE code = 'g8.07';


UPDATE junior_grammar_points SET teacher_script = $jsonb$[
  {"text": "今天解锁**频度副词**。中考爱考的位置题 — 放错地方一句话直接判错。", "show": "🎯 always / usually / often / sometimes / never", "duration": 10},
  {"text": "**频度光谱**：always (100%) → usually → often → sometimes → seldom → never (0%)。", "show": "100% → 0%   always → never", "highlight": "always ... never", "duration": 11},
  {"text": "**规则 ①**：**实义动词前**。He **often plays** football.", "show": "He often plays football.", "highlight": "often plays", "duration": 10},
  {"text": "**规则 ②**：**be 动词后**。Tom **is never late**.", "show": "Tom is never late.", "highlight": "is never", "duration": 10},
  {"text": "**规则 ③**：**助动词 / 情态动词后**。I have **always** wanted to。", "show": "I have always wanted ...", "highlight": "have always", "duration": 11},
  {"text": "**坑 ①**：never 已含否定，**不能再加 don''t / doesn''t**！", "show": "✗ doesn''t never   ✓ never", "highlight": "never", "duration": 11},
  {"text": "**坑 ②**：除 sometimes 外，频度副词**不放句末**。always、never 都不行。", "show": "✗ I go always.   ✓ I always go.", "highlight": "always go", "duration": 12},
  {"text": "**sometimes 灵活**：可放句首、动词前、句末。其他副词只能放规定位置。下一关进入实战。", "show": "sometimes: flexible position", "highlight": "sometimes", "duration": 11}
]$jsonb$::jsonb
WHERE code = 'g8.07';


DELETE FROM junior_grammar_questions WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.07') AND sort_order BETWEEN 9000 AND 9099;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.07')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer, accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading, difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.accepted_answers, q.explanation, q.distractors, q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  ('Lin ___ wakes up before 7 a.m. on weekdays.', 'mcq', 'is usually', 'usually is', 'usually', 'always', 'C',
   NULL::text[], '实义动词 wakes up 前用副词 usually（"通常"）。', '{}'::jsonb, NULL, 'frequency_before_verb', false, 1, 9000),
  ('She ___ angry — she''s the most patient person I know.', 'mcq', 'is never', 'never is', 'is always', 'is sometimes', 'A',
   NULL::text[], 'be 动词后 + 上下文"最有耐心"= 从不生气 → is never。', '{}'::jsonb, NULL, 'frequency_be_after', false, 2, 9001),
  ('My grandparents ___ play chess in the park after dinner.', 'mcq', 'always', 'be always', 'always be', 'are always', 'A',
   NULL::text[], '实义动词 play 前 + grandparents 复数 → always play。', '{}'::jsonb, NULL, 'frequency_plural', false, 1, 9002),
  ('I ___ taken the subway to school — I always take the bus.', 'mcq', 'never have', 'have never', 'have ever', 'never am', 'B',
   NULL::text[], '助动词 have 之后 → have never。意思"我从没坐过地铁"。', '{}'::jsonb, NULL, 'frequency_perfect', false, 3, 9003),
  ('My dad ____ (always, drink) coffee in the morning.', 'fill', NULL, NULL, NULL, NULL, 'always drinks',
   ARRAY['always drinks']::text[], '实义动词前 + 第三人称 → always drinks。', '{}'::jsonb, NULL, 'frequency_third_person', false, 1, 9004),
  ('Our English teacher ____ (be, often) late for class.', 'fill', NULL, NULL, NULL, NULL, 'is often',
   ARRAY['is often']::text[], 'be 动词后用副词 → is often。', '{}'::jsonb, NULL, 'frequency_be', false, 1, 9005),
  ('I ____ (have, never) seen so much snow before.', 'fill', NULL, NULL, NULL, NULL, 'have never',
   ARRAY['have never']::text[], '助动词 have 之后 → have never。', '{}'::jsonb, NULL, 'frequency_perfect', false, 2, 9006),
  ('改写：把 always 加到合适位置。  "He is happy."',
   'transform', NULL, NULL, NULL, NULL, 'He is always happy.',
   ARRAY['He is always happy.']::text[], 'be 动词后 → is always happy。', '{}'::jsonb, NULL, 'frequency_be_position', true, 1, 9007),
  ('改写：把 often 加到合适位置。  "She watches movies with her sister."',
   'transform', NULL, NULL, NULL, NULL, 'She often watches movies with her sister.',
   ARRAY['She often watches movies with her sister.']::text[], '实义动词前 → often watches。', '{}'::jsonb, NULL, 'frequency_verb_position', true, 2, 9008),
  ('改错：  "I always am the first one to arrive."',
   'correction', NULL, NULL, NULL, NULL, 'I am always the first one to arrive.',
   ARRAY['I am always the first one to arrive.']::text[], '频度副词在 be 动词后。', '{}'::jsonb, NULL, 'frequency_be_after_error', true, 1, 9009),
  ('改错：  "Tom never doesn''t do his homework on time."',
   'correction', NULL, NULL, NULL, NULL, 'Tom never does his homework on time.',
   ARRAY[
     'Tom never does his homework on time.',
     'Tom doesn''t do his homework on time.'
   ]::text[], 'never 已含否定，不能加 doesn''t。', '{}'::jsonb, NULL, 'frequency_double_negative', true, 2, 9010),
  ('把这句话译成英文：我妈妈总是在我做作业的时候做晚饭。',
   'translation', NULL, NULL, NULL, NULL, 'My mom always cooks dinner while I am doing my homework.',
   ARRAY[
     'My mom always cooks dinner while I am doing my homework.',
     'My mother always makes dinner while I do my homework.',
     'My mom always prepares dinner when I''m doing homework.'
   ]::text[], '考点：① always 在实义动词 cooks 前；② while 引导同时进行的两个动作。', '{}'::jsonb, '更地道：always cooks dinner 比 is always cooking 更自然（常态而非进行）。', 'frequency_translation', true, 3, 9011)
) AS q(stem, question_type, option_a, option_b, option_c, option_d, correct_answer, accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading, difficulty, sort_order);


DO $$
DECLARE v_point_id uuid; v_q_count int; v_depth int;
BEGIN
  SELECT id, content_depth INTO v_point_id, v_depth FROM junior_grammar_points WHERE code = 'g8.07';
  IF v_point_id IS NULL THEN RAISE EXCEPTION 'Missing g8.07'; END IF;
  IF v_depth <> 3 THEN RAISE EXCEPTION 'g8.07 depth %, expected 3', v_depth; END IF;
  SELECT count(*) INTO v_q_count FROM junior_grammar_questions WHERE point_id = v_point_id AND sort_order BETWEEN 9000 AND 9099;
  IF v_q_count <> 12 THEN RAISE EXCEPTION 'g8.07 expected 12 questions, got %', v_q_count; END IF;
  RAISE NOTICE 'g8.07 verified: depth=3, %=12 questions seeded.', v_q_count;
END $$;
