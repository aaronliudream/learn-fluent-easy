-- =====================================================================
-- Adaptive question bank expansion · Batch A · 10 G8 grammar points
-- =====================================================================
-- Adds 16 adaptive-difficulty questions to each of 10 junior_grammar_points
-- so the adaptive 5-level mastery test can branch easier/harder.
--
-- Points covered (g8.02 ... g8.11):
--   g8.02  现在进行时 vs 一般现在时
--   g8.03  一般将来时 (will / be going to)
--   g8.04  形容词比较级
--   g8.05  副词比较级与最高级
--   g8.06  不定代词 (some/any/no/every-thing/body/one)
--   g8.07  频度副词 (always/usually/often/sometimes/never)
--   g8.08  how often + 频率回答
--   g8.09  形容词最高级
--   g8.10  感官动词 (see/hear/feel + sb. doing/do)
--   g8.11  不定式 (to-infinitive)
--
-- Per point (16 questions, sort_order 9100-9115):
--   • MCQ × 4         (2 easy d=1, 2 hard d=3)         9100-9103
--   • Fill × 3        (d=1, d=2, d=3)                  9104-9106
--   • Correction × 3  (d=1, d=2, d=3)                  9107-9109
--   • Transform × 3   (d=1, d=2, d=3)                  9110-9112
--   • Translation × 3 (d=1, d=2, d=3)                  9113-9115
--
-- Total new questions: 10 × 16 = 160
-- Sort_order range 9100-9199 reserved for adaptive expansion bank.
-- Idempotent: scoped to sort_order 9100-9199.
-- =====================================================================


-- =============== g8.02 · 现在进行时 vs 一般现在时 ===============
DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.02')
  AND sort_order BETWEEN 9100 AND 9199;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.02')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  (
    'Look! The kids ___ in the garden.',
    'mcq', 'play', 'plays', 'are playing', 'played', 'C',
    NULL::text[],
    'Look! 是现在进行时信号词 → **are playing**。',
    '{}'::jsonb, NULL, 'present_continuous_signal', false, 1, 9100
  ),
  (
    'My father ___ to work by bus every day.',
    'mcq', 'go', 'goes', 'is going', 'going', 'B',
    NULL::text[],
    'every day → 一般现在时；主语 father 第三人称单数 → **goes**。',
    '{}'::jsonb, NULL, 'simple_present_3rd', false, 1, 9101
  ),
  (
    'Listen to the teacher carefully! She ___ an important rule, but you usually ___ during her class.',
    'mcq', 'explains / are sleeping', 'is explaining / sleep', 'is explaining / are sleeping', 'explains / sleep', 'B',
    NULL::text[],
    'Listen! → 此刻 → **is explaining**；usually → 习惯 → **sleep**。两种时态对比。',
    '{}'::jsonb, NULL, 'tense_contrast', false, 3, 9102
  ),
  (
    'Water ___ at 100 °C, but the kettle in the kitchen ___ a strange noise right now.',
    'mcq', 'is boiling / makes', 'boils / is making', 'boils / makes', 'is boiling / is making', 'B',
    NULL::text[],
    '科学事实 → 一般现在时 **boils**；right now → 现在进行时 **is making**。',
    '{}'::jsonb, '客观真理永远用一般现在时。', 'tense_contrast', false, 3, 9103
  ),
  (
    'Be quiet! The baby ____ (sleep) in the next room.',
    'fill', NULL, NULL, NULL, NULL, 'is sleeping',
    ARRAY['is sleeping']::text[],
    'Be quiet! 暗示此刻 → 现在进行时 **is sleeping**。',
    '{}'::jsonb, NULL, 'present_continuous_signal', false, 1, 9104
  ),
  (
    'She often ____ (read) books in the library after school, but today she ____ (watch) a film at home.',
    'fill', NULL, NULL, NULL, NULL, 'reads / is watching',
    ARRAY[
      'reads / is watching',
      'reads/is watching',
      'reads, is watching'
    ]::text[],
    'often → 习惯 → **reads**；today（与平时对比）→ **is watching**。',
    '{}'::jsonb, NULL, 'tense_contrast', false, 2, 9105
  ),
  (
    'It usually ____ (rain) a lot in July here, but this summer it ____ (not rain) much at all.',
    'fill', NULL, NULL, NULL, NULL, 'rains / isn''t raining',
    ARRAY[
      'rains / isn''t raining',
      'rains / is not raining',
      'rains/isn''t raining'
    ]::text[],
    'usually → **rains**；this summer 与平时对比 → 现在进行时否定 **isn''t raining**。',
    '{}'::jsonb, NULL, 'tense_contrast_negative', false, 3, 9106
  ),
  (
    '改错：  「Look! The boys plays football on the playground.」',
    'correction', NULL, NULL, NULL, NULL, 'Look! The boys are playing football on the playground.',
    ARRAY['Look! The boys are playing football on the playground.']::text[],
    'Look! 是现在进行时信号 → **are playing**。',
    '{}'::jsonb, NULL, 'present_continuous_correction', true, 1, 9107
  ),
  (
    '改错：  「She is going to school by bike every morning.」',
    'correction', NULL, NULL, NULL, NULL, 'She goes to school by bike every morning.',
    ARRAY['She goes to school by bike every morning.']::text[],
    'every morning → 习惯 → 一般现在时 **goes**，不能用进行时。',
    '{}'::jsonb, NULL, 'tense_contrast_correction', true, 2, 9108
  ),
  (
    '改错：  「My sister usually is reading novels, but now she watches TV.」',
    'correction', NULL, NULL, NULL, NULL, 'My sister usually reads novels, but now she is watching TV.',
    ARRAY['My sister usually reads novels, but now she is watching TV.']::text[],
    '两处错：usually → **reads**（一般现在时）；now → **is watching**（现在进行时）。',
    '{}'::jsonb, NULL, 'tense_contrast_correction', true, 3, 9109
  ),
  (
    '改写为现在进行时（提示：now）：  「He does his homework after dinner.」',
    'transform', NULL, NULL, NULL, NULL, 'He is doing his homework now.',
    ARRAY['He is doing his homework now.', 'Now he is doing his homework.']::text[],
    'after dinner → now；does → **is doing**。',
    '{}'::jsonb, NULL, 'present_continuous_transform', true, 1, 9110
  ),
  (
    '改写为一般现在时（提示：every weekend）：  「They are visiting their grandparents this weekend.」',
    'transform', NULL, NULL, NULL, NULL, 'They visit their grandparents every weekend.',
    ARRAY['They visit their grandparents every weekend.', 'Every weekend they visit their grandparents.']::text[],
    'this weekend → every weekend；are visiting → **visit**。',
    '{}'::jsonb, NULL, 'simple_present_transform', true, 2, 9111
  ),
  (
    '改写为否定句：  「The students are having an English class right now.」',
    'transform', NULL, NULL, NULL, NULL, 'The students aren''t having an English class right now.',
    ARRAY[
      'The students aren''t having an English class right now.',
      'The students are not having an English class right now.'
    ]::text[],
    '现在进行时否定：are + **not** + having。',
    '{}'::jsonb, NULL, 'present_continuous_negative', true, 3, 9112
  ),
  (
    '把这句话译成英文：我妈妈正在厨房做饭。',
    'translation', NULL, NULL, NULL, NULL, 'My mother is cooking in the kitchen.',
    ARRAY[
      'My mother is cooking in the kitchen.',
      'My mom is cooking in the kitchen.',
      'My mother is cooking dinner in the kitchen.'
    ]::text[],
    '现在进行时：is + cooking；in the kitchen 介词短语放句末。',
    '{}'::jsonb, NULL, 'present_continuous_translation', true, 1, 9113
  ),
  (
    '把这句话译成英文：他每天早上七点起床。',
    'translation', NULL, NULL, NULL, NULL, 'He gets up at seven every morning.',
    ARRAY[
      'He gets up at seven every morning.',
      'He gets up at 7 every morning.',
      'He gets up at seven o''clock every morning.',
      'Every morning he gets up at seven.'
    ]::text[],
    'every morning → 一般现在时；主语 He → **gets**。',
    '{}'::jsonb, NULL, 'simple_present_translation', true, 2, 9114
  ),
  (
    '把这句话译成英文：他平时坐地铁上班，但今天他正在开车去公司。',
    'translation', NULL, NULL, NULL, NULL, 'He usually takes the subway to work, but today he is driving to the office.',
    ARRAY[
      'He usually takes the subway to work, but today he is driving to the office.',
      'He usually goes to work by subway, but today he is driving to the office.',
      'He usually takes the metro to work, but today he is driving to work.'
    ]::text[],
    '两种时态对比：usually → **takes**；today → **is driving**。',
    '{}'::jsonb, NULL, 'tense_contrast_translation', true, 3, 9115
  )
) AS q(stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
       accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
       difficulty, sort_order);


-- =============== g8.03 · 一般将来时 (will / be going to) ===============
DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.03')
  AND sort_order BETWEEN 9100 AND 9199;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.03')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  (
    'I ___ visit my grandma tomorrow.',
    'mcq', 'will', 'am', 'do', 'was', 'A',
    NULL::text[],
    'tomorrow → 将来时；will + 原形 visit。',
    '{}'::jsonb, NULL, 'future_will', false, 1, 9100
  ),
  (
    'Look at those dark clouds! It ___ rain soon.',
    'mcq', 'will', 'is going to', 'is', 'was', 'B',
    NULL::text[],
    '有迹象（dark clouds）预测 → **is going to** rain。',
    '{}'::jsonb, 'be going to 用于有迹象的预测，will 用于临时决定。', 'future_be_going_to', false, 1, 9101
  ),
  (
    'A: The phone is ringing.  B: I ___ answer it.',
    'mcq', 'am going to', 'will', 'am', 'do', 'B',
    NULL::text[],
    '临时决定 → **will** answer（be going to 用于事先计划）。',
    '{}'::jsonb, NULL, 'future_will_decision', false, 3, 9102
  ),
  (
    'They ___ a party next Saturday — they have already sent out the invitations.',
    'mcq', 'will have', 'are going to have', 'have', 'had', 'B',
    NULL::text[],
    '已发出邀请 → 事先计划好 → **are going to have**。',
    '{}'::jsonb, NULL, 'future_be_going_to_plan', false, 3, 9103
  ),
  (
    'We ____ (have) a maths test next Monday.',
    'fill', NULL, NULL, NULL, NULL, 'will have',
    ARRAY['will have', 'are going to have']::text[],
    'next Monday → 将来时；will + 原形 have，或事先安排 are going to have。',
    '{}'::jsonb, NULL, 'future_will', false, 1, 9104
  ),
  (
    'Don''t worry. I ____ (help) you with the homework after school.',
    'fill', NULL, NULL, NULL, NULL, 'will help',
    ARRAY['will help', '''ll help']::text[],
    '临时承诺 → **will help**。',
    '{}'::jsonb, NULL, 'future_will_promise', false, 2, 9105
  ),
  (
    'Look at the sky! It ____ (snow). And the temperature ____ (drop) below zero tonight.',
    'fill', NULL, NULL, NULL, NULL, 'is going to snow / will drop',
    ARRAY[
      'is going to snow / will drop',
      'is going to snow/will drop',
      'is going to snow, will drop'
    ]::text[],
    '有迹象 → **is going to snow**；预测 tonight → **will drop**。',
    '{}'::jsonb, NULL, 'future_mixed', false, 3, 9106
  ),
  (
    '改错：  「I will to go to Beijing next week.」',
    'correction', NULL, NULL, NULL, NULL, 'I will go to Beijing next week.',
    ARRAY['I will go to Beijing next week.']::text[],
    'will 后直接跟**原形**，不能加 to。',
    '{}'::jsonb, NULL, 'future_will_correction', true, 1, 9107
  ),
  (
    '改错：  「She is going to visits her uncle this weekend.」',
    'correction', NULL, NULL, NULL, NULL, 'She is going to visit her uncle this weekend.',
    ARRAY['She is going to visit her uncle this weekend.']::text[],
    'be going to + **原形** visit，不是 visits。',
    '{}'::jsonb, NULL, 'future_be_going_to_correction', true, 2, 9108
  ),
  (
    '改错：  「He won''t comes to the party because he will busy tomorrow.」',
    'correction', NULL, NULL, NULL, NULL, 'He won''t come to the party because he will be busy tomorrow.',
    ARRAY['He won''t come to the party because he will be busy tomorrow.']::text[],
    '两处错：① won''t 后用**原形** come；② will 后接形容词 busy 要加 **be**。',
    '{}'::jsonb, NULL, 'future_will_correction', true, 3, 9109
  ),
  (
    '改写为将来时（提示：tomorrow）：  「I do my homework after dinner.」',
    'transform', NULL, NULL, NULL, NULL, 'I will do my homework tomorrow.',
    ARRAY[
      'I will do my homework tomorrow.',
      'I am going to do my homework tomorrow.',
      'Tomorrow I will do my homework.'
    ]::text[],
    '一般现在时 → will + 原形 do；时间状语换成 tomorrow。',
    '{}'::jsonb, NULL, 'future_will_transform', true, 1, 9110
  ),
  (
    '改写为否定句：  「They will arrive at the airport before noon.」',
    'transform', NULL, NULL, NULL, NULL, 'They won''t arrive at the airport before noon.',
    ARRAY[
      'They won''t arrive at the airport before noon.',
      'They will not arrive at the airport before noon.'
    ]::text[],
    'will 否定：will + not = **won''t**。',
    '{}'::jsonb, NULL, 'future_will_negative', true, 2, 9111
  ),
  (
    '改写为一般疑问句并作否定回答：  「She is going to study in Canada next year.」',
    'transform', NULL, NULL, NULL, NULL, 'Is she going to study in Canada next year? No, she isn''t.',
    ARRAY[
      'Is she going to study in Canada next year? No, she isn''t.',
      'Is she going to study in Canada next year? No, she is not.'
    ]::text[],
    'be going to 疑问句：be 提前；否定回答 No, she **isn''t**。',
    '{}'::jsonb, NULL, 'future_be_going_to_question', true, 3, 9112
  ),
  (
    '把这句话译成英文：明天我会给你打电话。',
    'translation', NULL, NULL, NULL, NULL, 'I will call you tomorrow.',
    ARRAY[
      'I will call you tomorrow.',
      'I''ll call you tomorrow.',
      'Tomorrow I will call you.'
    ]::text[],
    'will + 原形 call；tomorrow 放句末或句首。',
    '{}'::jsonb, NULL, 'future_will_translation', true, 1, 9113
  ),
  (
    '把这句话译成英文：他们打算下个月去香港旅游。',
    'translation', NULL, NULL, NULL, NULL, 'They are going to travel to Hong Kong next month.',
    ARRAY[
      'They are going to travel to Hong Kong next month.',
      'They are going to visit Hong Kong next month.',
      'They are going to take a trip to Hong Kong next month.'
    ]::text[],
    '「打算」是事先计划 → **be going to**；travel to / visit / take a trip 都行。',
    '{}'::jsonb, NULL, 'future_be_going_to_translation', true, 2, 9114
  ),
  (
    '把这句话译成英文：如果明天下雨，我们就不去野餐了。',
    'translation', NULL, NULL, NULL, NULL, 'If it rains tomorrow, we won''t go on a picnic.',
    ARRAY[
      'If it rains tomorrow, we won''t go on a picnic.',
      'If it rains tomorrow, we will not go on a picnic.',
      'If it rains tomorrow, we won''t have a picnic.',
      'We won''t go on a picnic if it rains tomorrow.'
    ]::text[],
    '主将从现：if 从句用一般现在时 **rains**，主句用 will → **won''t go**。',
    '{}'::jsonb, '中考高频考点：if/when 从句一般现在时，主句一般将来时。', 'future_conditional', true, 3, 9115
  )
) AS q(stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
       accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
       difficulty, sort_order);


-- =============== g8.04 · 形容词比较级 ===============
DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.04')
  AND sort_order BETWEEN 9100 AND 9199;

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
    'Tom is ___ than his younger brother.',
    'mcq', 'tall', 'taller', 'tallest', 'more tall', 'B',
    NULL::text[],
    '两者比较 + than → 比较级 **taller**（短形容词加 -er）。',
    '{}'::jsonb, NULL, 'comparative_short', false, 1, 9100
  ),
  (
    'This book is ___ interesting than that one.',
    'mcq', 'more', 'much', 'most', 'very', 'A',
    NULL::text[],
    '长形容词 interesting → **more** interesting + than。',
    '{}'::jsonb, NULL, 'comparative_long', false, 1, 9101
  ),
  (
    'My new phone is ___ than my old one, although it is much ___.',
    'mcq', 'better / heavier', 'gooder / heavier', 'better / more heavy', 'best / heaviest', 'A',
    NULL::text[],
    'good 不规则 → **better**；heavy → 去 y 加 ier → **heavier**。',
    '{}'::jsonb, NULL, 'comparative_irregular', false, 3, 9102
  ),
  (
    'Today is even ___ than yesterday, so please drink ___ water.',
    'mcq', 'hot / much', 'hotter / more', 'hotter / many', 'more hot / more', 'B',
    NULL::text[],
    'hot 双写 t → **hotter**；water 不可数 → **more**（many 修饰可数）。',
    '{}'::jsonb, 'even 加强比较级语气：甚至更…。', 'comparative_doubling', false, 3, 9103
  ),
  (
    'Lily is ____ (young) than her sister.',
    'fill', NULL, NULL, NULL, NULL, 'younger',
    ARRAY['younger']::text[],
    'than 前用比较级 → young + er = **younger**。',
    '{}'::jsonb, NULL, 'comparative_short', false, 1, 9104
  ),
  (
    'The traffic in big cities is much ____ (bad) than that in small towns.',
    'fill', NULL, NULL, NULL, NULL, 'worse',
    ARRAY['worse']::text[],
    'bad 不规则比较级 → **worse**；much 加强比较级。',
    '{}'::jsonb, NULL, 'comparative_irregular', false, 2, 9105
  ),
  (
    'The more you practise, the ____ (good) your English will be.',
    'fill', NULL, NULL, NULL, NULL, 'better',
    ARRAY['better']::text[],
    'The 比较级, the 比较级；good → **better**。',
    '{}'::jsonb, '「越…越…」句型：The + 比较级, the + 比较级。', 'comparative_correlative', false, 3, 9106
  ),
  (
    '改错：  「My bag is more heavier than yours.」',
    'correction', NULL, NULL, NULL, NULL, 'My bag is heavier than yours.',
    ARRAY['My bag is heavier than yours.']::text[],
    '比较级不能 more 和 -er 同时用 → **heavier**。',
    '{}'::jsonb, NULL, 'comparative_correction', true, 1, 9107
  ),
  (
    '改错：  「This question is more easy than that one.」',
    'correction', NULL, NULL, NULL, NULL, 'This question is easier than that one.',
    ARRAY['This question is easier than that one.']::text[],
    'easy 是双音节 -y 结尾 → 去 y 加 ier → **easier**（不用 more）。',
    '{}'::jsonb, NULL, 'comparative_correction', true, 2, 9108
  ),
  (
    '改错：  「The weather in Beijing is much more colder than in Shanghai, and the food is gooder there.」',
    'correction', NULL, NULL, NULL, NULL, 'The weather in Beijing is much colder than in Shanghai, and the food is better there.',
    ARRAY['The weather in Beijing is much colder than in Shanghai, and the food is better there.']::text[],
    '两处错：① more 和 colder 不能并用 → **colder**；② good 不规则 → **better**。',
    '{}'::jsonb, NULL, 'comparative_correction', true, 3, 9109
  ),
  (
    '改写为比较级句式：  「Tom is 15. Jack is 13.」（用 than）',
    'transform', NULL, NULL, NULL, NULL, 'Tom is older than Jack.',
    ARRAY[
      'Tom is older than Jack.',
      'Jack is younger than Tom.'
    ]::text[],
    'Tom 年龄大 → Tom is **older** than Jack（或反过来用 younger）。',
    '{}'::jsonb, NULL, 'comparative_transform', true, 1, 9110
  ),
  (
    '改写句子（用 比较级 + than）：  「My room is small. Your room is big.」',
    'transform', NULL, NULL, NULL, NULL, 'Your room is bigger than mine.',
    ARRAY[
      'Your room is bigger than mine.',
      'Your room is bigger than my room.',
      'My room is smaller than yours.'
    ]::text[],
    'big 双写 g → **bigger**；mine = my room。',
    '{}'::jsonb, NULL, 'comparative_doubling', true, 2, 9111
  ),
  (
    '用「the + 比较级, the + 比较级」改写：  《If you study harder, you will get better grades.》',
    'transform', NULL, NULL, NULL, NULL, 'The harder you study, the better grades you will get.',
    ARRAY[
      'The harder you study, the better grades you will get.',
      'The harder you study, the better your grades will be.'
    ]::text[],
    '「越…越…」：**The harder** … **the better** …。',
    '{}'::jsonb, NULL, 'comparative_correlative', true, 3, 9112
  ),
  (
    '把这句话译成英文：他比我高。',
    'translation', NULL, NULL, NULL, NULL, 'He is taller than me.',
    ARRAY[
      'He is taller than me.',
      'He is taller than I am.',
      'He is taller than I.'
    ]::text[],
    'tall + er + than；than 后跟 me 或 I (am) 都可。',
    '{}'::jsonb, NULL, 'comparative_translation', true, 1, 9113
  ),
  (
    '把这句话译成英文：这次考试比上次难得多。',
    'translation', NULL, NULL, NULL, NULL, 'This exam is much more difficult than the last one.',
    ARRAY[
      'This exam is much more difficult than the last one.',
      'This exam is much harder than the last one.',
      'This test is much more difficult than the last one.',
      'This exam is much more difficult than last time.'
    ]::text[],
    '「…得多」用 **much** 修饰比较级；difficult 是长形容词 → **more difficult**。',
    '{}'::jsonb, NULL, 'comparative_translation', true, 2, 9114
  ),
  (
    '把这句话译成英文：你练习得越多，英语就会变得越好。',
    'translation', NULL, NULL, NULL, NULL, 'The more you practise, the better your English will be.',
    ARRAY[
      'The more you practise, the better your English will be.',
      'The more you practice, the better your English will be.',
      'The more you practise, the better your English will become.'
    ]::text[],
    '「越…越…」：**The more** you practise, **the better** your English will be。',
    '{}'::jsonb, NULL, 'comparative_correlative', true, 3, 9115
  )
) AS q(stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
       accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
       difficulty, sort_order);


-- =============== g8.05 · 副词比较级与最高级 ===============
DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.05')
  AND sort_order BETWEEN 9100 AND 9199;

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
    'Tom runs ___ than his brother.',
    'mcq', 'fast', 'faster', 'fastest', 'more fast', 'B',
    NULL::text[],
    'than → 比较级；fast 加 -er → **faster**（副词与形容词同形）。',
    '{}'::jsonb, NULL, 'adverb_comparative', false, 1, 9100
  ),
  (
    'Of all the boys, Jim jumps the ___.',
    'mcq', 'high', 'higher', 'highest', 'most high', 'C',
    NULL::text[],
    'Of all → 三者以上 → 最高级 **highest**，前加 the。',
    '{}'::jsonb, NULL, 'adverb_superlative', false, 1, 9101
  ),
  (
    'She speaks English ___ than any other student in our class.',
    'mcq', 'fluent', 'more fluent', 'more fluently', 'most fluently', 'C',
    NULL::text[],
    '修饰动词 speaks → 用副词；fluently 是 -ly 副词 → **more fluently**。',
    '{}'::jsonb, NULL, 'adverb_comparative_ly', false, 3, 9102
  ),
  (
    'Among the three players, Lily plays ___ but practises ___ every day.',
    'mcq', 'best / harder', 'better / hardest', 'best / hardest', 'better / harder', 'C',
    NULL::text[],
    'three → 三者最高级；play **best**（well 不规则）；practise **hardest**（hard 不规则同形）。',
    '{}'::jsonb, 'well/hard/fast 副词不规则或同形，注意区分。', 'adverb_superlative_irregular', false, 3, 9103
  ),
  (
    'Mike sings ____ (loud) than I do.',
    'fill', NULL, NULL, NULL, NULL, 'more loudly',
    ARRAY['more loudly', 'louder']::text[],
    '修饰动词 sing → 用副词 loudly → **more loudly**（louder 口语也可接受）。',
    '{}'::jsonb, NULL, 'adverb_comparative_ly', false, 1, 9104
  ),
  (
    'Of the three runners, Peter finished the race ____ (early).',
    'fill', NULL, NULL, NULL, NULL, 'earliest',
    ARRAY['earliest', 'the earliest']::text[],
    'Of the three → 三者最高级；early 去 y 加 iest → **earliest**。',
    '{}'::jsonb, NULL, 'adverb_superlative_y', false, 2, 9105
  ),
  (
    'No one in our class works ____ (hard) than Lily, and she also does the homework the ____ (careful).',
    'fill', NULL, NULL, NULL, NULL, 'harder / most carefully',
    ARRAY[
      'harder / most carefully',
      'harder/most carefully',
      'harder, most carefully'
    ]::text[],
    'No one + 比较级 = 最高级含义；hard → **harder**；carefully 是 -ly 副词 → **most carefully**。',
    '{}'::jsonb, NULL, 'adverb_mixed', false, 3, 9106
  ),
  (
    '改错：  「She dances more better than her sister.」',
    'correction', NULL, NULL, NULL, NULL, 'She dances better than her sister.',
    ARRAY['She dances better than her sister.']::text[],
    'better 已经是 well 的不规则比较级，不能再加 more。',
    '{}'::jsonb, NULL, 'adverb_correction', true, 1, 9107
  ),
  (
    '改错：  「Of all the students, Mary speaks the most loud.」',
    'correction', NULL, NULL, NULL, NULL, 'Of all the students, Mary speaks the most loudly.',
    ARRAY['Of all the students, Mary speaks the most loudly.']::text[],
    '修饰动词 speak 要用副词 → **most loudly**（loud 是形容词）。',
    '{}'::jsonb, NULL, 'adverb_correction', true, 2, 9108
  ),
  (
    '改错：  「Of the four boys, Jim runs the faster and jumps more higher than others.」',
    'correction', NULL, NULL, NULL, NULL, 'Of the four boys, Jim runs the fastest and jumps higher than the others.',
    ARRAY['Of the four boys, Jim runs the fastest and jumps higher than the others.']::text[],
    '两处错：① 四者最高级 → **fastest**；② more 与 -er 不能并用 → **higher**；并加 the others。',
    '{}'::jsonb, NULL, 'adverb_correction', true, 3, 9109
  ),
  (
    '改写为比较级（提示：than his brother）：  「Tom runs fast.」',
    'transform', NULL, NULL, NULL, NULL, 'Tom runs faster than his brother.',
    ARRAY['Tom runs faster than his brother.']::text[],
    'fast + er = **faster** + than。',
    '{}'::jsonb, NULL, 'adverb_comparative_transform', true, 1, 9110
  ),
  (
    '改写为最高级（提示：of all the girls）：  「Mary sings beautifully.」',
    'transform', NULL, NULL, NULL, NULL, 'Mary sings the most beautifully of all the girls.',
    ARRAY[
      'Mary sings the most beautifully of all the girls.',
      'Of all the girls, Mary sings the most beautifully.'
    ]::text[],
    '-ly 副词最高级 → **the most beautifully**；of all the girls 表范围。',
    '{}'::jsonb, NULL, 'adverb_superlative_transform', true, 2, 9111
  ),
  (
    '用「No one + 比较级」改写：  《Of all the students, Tom works hardest.》',
    'transform', NULL, NULL, NULL, NULL, 'No one in the class works harder than Tom.',
    ARRAY[
      'No one in the class works harder than Tom.',
      'No one works harder than Tom in the class.',
      'No other student works harder than Tom.'
    ]::text[],
    '「否定 + 比较级 = 最高级含义」。',
    '{}'::jsonb, '中考最高级常考「换装」为否定+比较级。', 'adverb_negation_comparative', true, 3, 9112
  ),
  (
    '把这句话译成英文：他跑得比我快。',
    'translation', NULL, NULL, NULL, NULL, 'He runs faster than me.',
    ARRAY[
      'He runs faster than me.',
      'He runs faster than I do.',
      'He runs faster than I.'
    ]::text[],
    'fast → **faster** + than。',
    '{}'::jsonb, NULL, 'adverb_translation', true, 1, 9113
  ),
  (
    '把这句话译成英文：在所有同学中，李雷英语说得最流利。',
    'translation', NULL, NULL, NULL, NULL, 'Li Lei speaks English the most fluently of all the students.',
    ARRAY[
      'Li Lei speaks English the most fluently of all the students.',
      'Of all the students, Li Lei speaks English the most fluently.',
      'Li Lei speaks English most fluently in all the students.'
    ]::text[],
    'fluently 是 -ly 副词 → **the most fluently**；范围 of all the students。',
    '{}'::jsonb, NULL, 'adverb_superlative_translation', true, 2, 9114
  ),
  (
    '把这句话译成英文：班里没有人比她学习更努力。',
    'translation', NULL, NULL, NULL, NULL, 'No one in the class studies harder than her.',
    ARRAY[
      'No one in the class studies harder than her.',
      'No one in the class studies harder than she does.',
      'Nobody in our class studies harder than her.',
      'No other student in the class studies harder than her.'
    ]::text[],
    '「没人比…更…」= No one + 比较级 + than；hard → **harder**。',
    '{}'::jsonb, NULL, 'adverb_translation', true, 3, 9115
  )
) AS q(stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
       accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
       difficulty, sort_order);


-- =============== g8.06 · 不定代词 (some/any/no/every-thing/body/one) ===============
DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.06')
  AND sort_order BETWEEN 9100 AND 9199;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.06')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  (
    'There is ___ in the box. It''s empty.',
    'mcq', 'something', 'anything', 'nothing', 'everything', 'C',
    NULL::text[],
    '「It''s empty」说明里面没东西 → **nothing**。',
    '{}'::jsonb, NULL, 'indefinite_pronoun_nothing', false, 1, 9100
  ),
  (
    'Would you like ___ to drink, Tom?',
    'mcq', 'something', 'anything', 'nothing', 'everything', 'A',
    NULL::text[],
    '建议或请求(Would you like)用 **something** 表示礼貌。',
    '{}'::jsonb, NULL, 'indefinite_pronoun_something', false, 1, 9101
  ),
  (
    'I knocked on the door but ___ answered. Maybe ___ was at home.',
    'mcq', 'anybody / nobody', 'nobody / nobody', 'somebody / anybody', 'nobody / anybody', 'B',
    NULL::text[],
    '过去时叙述：第一空主语 → **nobody** answered；第二空仍是否定含义 → **nobody** was at home。',
    '{}'::jsonb, NULL, 'indefinite_pronoun_nobody', false, 3, 9102
  ),
  (
    'There is ___ wrong with my computer. I can do ___ on it now.',
    'mcq', 'anything / something', 'something / nothing', 'nothing / anything', 'something / something', 'B',
    NULL::text[],
    '陈述句肯定 → **something** wrong；can do **nothing** = 什么也做不了。',
    '{}'::jsonb, '「something wrong with」是固定搭配。', 'indefinite_pronoun_mixed', false, 3, 9103
  ),
  (
    'I''m hungry. Is there ____ to eat in the fridge?',
    'fill', NULL, NULL, NULL, NULL, 'anything',
    ARRAY['anything']::text[],
    '一般疑问句用 **anything**。',
    '{}'::jsonb, NULL, 'indefinite_pronoun_anything', false, 1, 9104
  ),
  (
    '____ (每个人) in our class likes the new English teacher.',
    'fill', NULL, NULL, NULL, NULL, 'Everyone',
    ARRAY['Everyone', 'Everybody']::text[],
    '「每个人」= **Everyone / Everybody**，谓语用单数 likes。',
    '{}'::jsonb, NULL, 'indefinite_pronoun_everyone', false, 2, 9105
  ),
  (
    'A: Is there ____ new in today''s news?  B: No, ____ special.',
    'fill', NULL, NULL, NULL, NULL, 'anything / nothing',
    ARRAY[
      'anything / nothing',
      'anything/nothing',
      'anything, nothing'
    ]::text[],
    '疑问句 → **anything**；否定回答 → **nothing**。形容词后置 new/special。',
    '{}'::jsonb, '不定代词 + 形容词：anything new / nothing special（形容词后置）。', 'indefinite_pronoun_with_adj', false, 3, 9106
  ),
  (
    '改错：  「There isn''t something in my bag.」',
    'correction', NULL, NULL, NULL, NULL, 'There isn''t anything in my bag.',
    ARRAY['There isn''t anything in my bag.', 'There is nothing in my bag.']::text[],
    '否定句用 **anything**；或改为 there is **nothing**。',
    '{}'::jsonb, NULL, 'indefinite_pronoun_correction', true, 1, 9107
  ),
  (
    '改错：  「Everyone in my class are ready for the exam.」',
    'correction', NULL, NULL, NULL, NULL, 'Everyone in my class is ready for the exam.',
    ARRAY['Everyone in my class is ready for the exam.']::text[],
    'Everyone 是单数 → 谓语用 **is**。',
    '{}'::jsonb, '不定代词 -one/-body/-thing 都视为单数。', 'indefinite_pronoun_correction', true, 2, 9108
  ),
  (
    '改错：  「I have nothing important to tell you, and nobody know the secret.」',
    'correction', NULL, NULL, NULL, NULL, 'I have nothing important to tell you, and nobody knows the secret.',
    ARRAY['I have nothing important to tell you, and nobody knows the secret.']::text[],
    'nobody 是第三人称单数 → **knows**（动词 + s）。',
    '{}'::jsonb, NULL, 'indefinite_pronoun_correction', true, 3, 9109
  ),
  (
    '改写为否定句：  「There is something interesting in the book.」',
    'transform', NULL, NULL, NULL, NULL, 'There isn''t anything interesting in the book.',
    ARRAY[
      'There isn''t anything interesting in the book.',
      'There is nothing interesting in the book.',
      'There is not anything interesting in the book.'
    ]::text[],
    'something → anything（否定）；或用 nothing。',
    '{}'::jsonb, NULL, 'indefinite_pronoun_transform', true, 1, 9110
  ),
  (
    '改写为一般疑问句：  「There is somebody in the next room.」',
    'transform', NULL, NULL, NULL, NULL, 'Is there anybody in the next room?',
    ARRAY[
      'Is there anybody in the next room?',
      'Is there anyone in the next room?'
    ]::text[],
    '疑问句中 somebody → **anybody / anyone**。',
    '{}'::jsonb, NULL, 'indefinite_pronoun_transform', true, 2, 9111
  ),
  (
    '同义句改写：  「There is no one in the classroom.」',
    'transform', NULL, NULL, NULL, NULL, 'There isn''t anyone in the classroom.',
    ARRAY[
      'There isn''t anyone in the classroom.',
      'There isn''t anybody in the classroom.',
      'There is not anyone in the classroom.'
    ]::text[],
    'no one = not + anyone / anybody。',
    '{}'::jsonb, NULL, 'indefinite_pronoun_equivalent', true, 3, 9112
  ),
  (
    '把这句话译成英文：盒子里没有东西。',
    'translation', NULL, NULL, NULL, NULL, 'There is nothing in the box.',
    ARRAY[
      'There is nothing in the box.',
      'There isn''t anything in the box.',
      'There is not anything in the box.'
    ]::text[],
    '「没有东西」= **nothing**，或 isn''t + anything。',
    '{}'::jsonb, NULL, 'indefinite_pronoun_translation', true, 1, 9113
  ),
  (
    '把这句话译成英文：你能告诉我一些关于这个城市的有趣的事情吗？',
    'translation', NULL, NULL, NULL, NULL, 'Can you tell me something interesting about this city?',
    ARRAY[
      'Can you tell me something interesting about this city?',
      'Could you tell me something interesting about this city?',
      'Can you tell me anything interesting about this city?'
    ]::text[],
    '请求/期望肯定回答用 **something**；形容词后置 something interesting。',
    '{}'::jsonb, NULL, 'indefinite_pronoun_translation', true, 2, 9114
  ),
  (
    '把这句话译成英文：教室里没有人，每个人都已经回家了。',
    'translation', NULL, NULL, NULL, NULL, 'There is no one in the classroom; everyone has gone home.',
    ARRAY[
      'There is no one in the classroom; everyone has gone home.',
      'There is nobody in the classroom; everybody has gone home.',
      'There isn''t anyone in the classroom; everyone has gone home.',
      'No one is in the classroom; everyone has gone home.'
    ]::text[],
    '「没人」= no one / nobody；「每个人」= everyone / everybody，谓语单数 has gone。',
    '{}'::jsonb, NULL, 'indefinite_pronoun_translation', true, 3, 9115
  )
) AS q(stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
       accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
       difficulty, sort_order);


-- =============== g8.07 · 频度副词 (always/usually/often/sometimes/never) ===============
DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.07')
  AND sort_order BETWEEN 9100 AND 9199;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.07')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  (
    'I ___ get up at six on weekdays.',
    'mcq', 'am usually', 'usually am', 'usually', 'be usually', 'C',
    NULL::text[],
    '频度副词放在**实义动词前**：usually + get up。',
    '{}'::jsonb, NULL, 'frequency_adverb_position', false, 1, 9100
  ),
  (
    'She ___ late for school. She is always on time.',
    'mcq', 'is never', 'never is', 'is ever', 'never', 'A',
    NULL::text[],
    '频度副词放在 **be 动词之后**：is + never。',
    '{}'::jsonb, NULL, 'frequency_adverb_position_be', false, 1, 9101
  ),
  (
    'My dad ___ takes me to the park on Sundays because he ___ has to work overtime.',
    'mcq', 'sometimes / often', 'often / sometimes', 'never / often', 'always / sometimes', 'A',
    NULL::text[],
    '语义：偶尔带我去 + 经常加班；放在实义动词 takes / has 前。',
    '{}'::jsonb, NULL, 'frequency_adverb_meaning', false, 3, 9102
  ),
  (
    'A: How often do you go swimming?  B: I ___ go swimming, maybe once a year.',
    'mcq', 'often', 'always', 'hardly ever', 'usually', 'C',
    NULL::text[],
    'once a year → 非常少 → **hardly ever**（几乎从不）。',
    '{}'::jsonb, 'hardly ever = 几乎从不，是中考拔高词。', 'frequency_adverb_hardly_ever', false, 3, 9103
  ),
  (
    'I ____ (经常) read English books before bed.',
    'fill', NULL, NULL, NULL, NULL, 'often',
    ARRAY['often', 'usually']::text[],
    '「经常」= **often**（usually 也接受）。',
    '{}'::jsonb, NULL, 'frequency_adverb_often', false, 1, 9104
  ),
  (
    'Tom is ____ (从不) late for class — he gets up at 6 every day.',
    'fill', NULL, NULL, NULL, NULL, 'never',
    ARRAY['never']::text[],
    '「从不」= **never**，放在 be 动词 is 之后。',
    '{}'::jsonb, NULL, 'frequency_adverb_never', false, 2, 9105
  ),
  (
    'My grandparents ____ (有时) come to visit us at weekends, but they ____ (总是) call before they come.',
    'fill', NULL, NULL, NULL, NULL, 'sometimes / always',
    ARRAY[
      'sometimes / always',
      'sometimes/always',
      'sometimes, always'
    ]::text[],
    '「有时」= **sometimes**；「总是」= **always**，都放实义动词前。',
    '{}'::jsonb, NULL, 'frequency_adverb_mixed', false, 3, 9106
  ),
  (
    '改错：  「I go always to school by bike.」',
    'correction', NULL, NULL, NULL, NULL, 'I always go to school by bike.',
    ARRAY['I always go to school by bike.']::text[],
    'always 应放在实义动词 **go 之前**。',
    '{}'::jsonb, NULL, 'frequency_adverb_correction', true, 1, 9107
  ),
  (
    '改错：  「He never is late for the meeting.」',
    'correction', NULL, NULL, NULL, NULL, 'He is never late for the meeting.',
    ARRAY['He is never late for the meeting.']::text[],
    'never 放在 be 动词 **is 之后**。',
    '{}'::jsonb, NULL, 'frequency_adverb_correction', true, 2, 9108
  ),
  (
    '改错：  「My sister usually does her homework after dinner, but she never can finish it before 10.」',
    'correction', NULL, NULL, NULL, NULL, 'My sister usually does her homework after dinner, but she can never finish it before 10.',
    ARRAY['My sister usually does her homework after dinner, but she can never finish it before 10.']::text[],
    'never 应放在情态动词 can 之后 → **can never finish**。',
    '{}'::jsonb, '频度副词放在情态动词之后、实义动词之前。', 'frequency_adverb_correction', true, 3, 9109
  ),
  (
    '把频度副词放入正确位置：  「I am late for school.」 (never)',
    'transform', NULL, NULL, NULL, NULL, 'I am never late for school.',
    ARRAY['I am never late for school.']::text[],
    'never 放在 be 动词 am 之后。',
    '{}'::jsonb, NULL, 'frequency_adverb_transform', true, 1, 9110
  ),
  (
    '把频度副词放入正确位置：  「She watches TV in the evening.」 (sometimes)',
    'transform', NULL, NULL, NULL, NULL, 'She sometimes watches TV in the evening.',
    ARRAY[
      'She sometimes watches TV in the evening.',
      'Sometimes she watches TV in the evening.',
      'She watches TV in the evening sometimes.'
    ]::text[],
    'sometimes 灵活，可放句首/句末/实义动词前。',
    '{}'::jsonb, NULL, 'frequency_adverb_transform', true, 2, 9111
  ),
  (
    '把频度副词放入正确位置：  「He has been to the new museum.」 (never)',
    'transform', NULL, NULL, NULL, NULL, 'He has never been to the new museum.',
    ARRAY['He has never been to the new museum.']::text[],
    '完成时中 never 放在 have/has **之后**、过去分词之前。',
    '{}'::jsonb, '中考完成时 + never 是高频考点。', 'frequency_adverb_perfect', true, 3, 9112
  ),
  (
    '把这句话译成英文：我经常和爸爸去公园跑步。',
    'translation', NULL, NULL, NULL, NULL, 'I often go running in the park with my dad.',
    ARRAY[
      'I often go running in the park with my dad.',
      'I often go to the park to run with my dad.',
      'I often run in the park with my father.'
    ]::text[],
    '「经常」= **often**，放在动词 go/run 之前。',
    '{}'::jsonb, NULL, 'frequency_adverb_translation', true, 1, 9113
  ),
  (
    '把这句话译成英文：他上课从不迟到。',
    'translation', NULL, NULL, NULL, NULL, 'He is never late for class.',
    ARRAY[
      'He is never late for class.',
      'He is never late for school.'
    ]::text[],
    '「从不」= **never**，放在 be 动词 is 之后；「迟到」= be late for。',
    '{}'::jsonb, NULL, 'frequency_adverb_translation', true, 2, 9114
  ),
  (
    '把这句话译成英文：她周末有时会去看望奶奶，但她总是先打电话。',
    'translation', NULL, NULL, NULL, NULL, 'She sometimes visits her grandma at weekends, but she always calls first.',
    ARRAY[
      'She sometimes visits her grandma at weekends, but she always calls first.',
      'She sometimes visits her grandmother on weekends, but she always calls first.',
      'Sometimes she visits her grandma at weekends, but she always calls first.'
    ]::text[],
    '「有时」= sometimes；「总是」= always，都放在实义动词前。',
    '{}'::jsonb, NULL, 'frequency_adverb_translation', true, 3, 9115
  )
) AS q(stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
       accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
       difficulty, sort_order);


-- =============== g8.08 · how often + 频率回答 ===============
DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.08')
  AND sort_order BETWEEN 9100 AND 9199;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.08')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  (
    'A: ___ do you go to the cinema?  B: Once a month.',
    'mcq', 'How long', 'How often', 'How far', 'How much', 'B',
    NULL::text[],
    '回答 Once a month → 频率 → 提问用 **How often**。',
    '{}'::jsonb, NULL, 'how_often_basic', false, 1, 9100
  ),
  (
    'A: How often do you exercise?  B: ___ a week.',
    'mcq', 'Three times', 'Three time', 'Three', 'For three times', 'A',
    NULL::text[],
    '「一周三次」= **Three times** a week（一次 once，两次 twice，三次及以上用 times）。',
    '{}'::jsonb, 'once / twice / three times 是中考必考。', 'how_often_times', false, 1, 9101
  ),
  (
    'A: How often does Tom play basketball?  B: He plays basketball ___.',
    'mcq', 'on every Sunday', 'every Sunday', 'in every Sunday', 'at every Sunday', 'B',
    NULL::text[],
    'every + 时间 前不加任何介词 → **every Sunday**。',
    '{}'::jsonb, NULL, 'how_often_every', false, 3, 9102
  ),
  (
    'A: How often did your family eat out last month?  B: ___, only once or twice.',
    'mcq', 'Always', 'Often', 'Hardly ever', 'Usually', 'C',
    NULL::text[],
    'only once or twice → 非常少 → **Hardly ever**（几乎从不）。',
    '{}'::jsonb, NULL, 'how_often_frequency_word', false, 3, 9103
  ),
  (
    'A: ____ ____ do you visit your grandparents?  B: Twice a month.',
    'fill', NULL, NULL, NULL, NULL, 'How often',
    ARRAY['How often']::text[],
    '回答 Twice a month → 提问用 **How often**。',
    '{}'::jsonb, NULL, 'how_often_question', false, 1, 9104
  ),
  (
    'A: How often does she go shopping?  B: She goes shopping ____ (一周两次).',
    'fill', NULL, NULL, NULL, NULL, 'twice a week',
    ARRAY['twice a week']::text[],
    '「一周两次」= **twice a week**。',
    '{}'::jsonb, NULL, 'how_often_twice', false, 2, 9105
  ),
  (
    'A: How often do you read English novels?  B: ____ (几乎从不). I prefer Chinese ones.',
    'fill', NULL, NULL, NULL, NULL, 'Hardly ever',
    ARRAY['Hardly ever', 'Almost never', 'Rarely']::text[],
    '「几乎从不」= **Hardly ever**（或 Almost never / Rarely）。',
    '{}'::jsonb, NULL, 'how_often_hardly_ever', false, 3, 9106
  ),
  (
    '改错：  「How often do you go to the gym?  ─ Two times a week.」',
    'correction', NULL, NULL, NULL, NULL, 'How often do you go to the gym? — Twice a week.',
    ARRAY['How often do you go to the gym? — Twice a week.', 'How often do you go to the gym? - Twice a week.']::text[],
    '「两次」= **twice**，不是 two times（虽然 two times 口语也可，但中考要求 twice）。',
    '{}'::jsonb, NULL, 'how_often_correction', true, 1, 9107
  ),
  (
    '改错：  「How often does he plays the piano?」',
    'correction', NULL, NULL, NULL, NULL, 'How often does he play the piano?',
    ARRAY['How often does he play the piano?']::text[],
    'does 后用**原形** play，不是 plays。',
    '{}'::jsonb, NULL, 'how_often_correction', true, 2, 9108
  ),
  (
    '改错：  「How often did your family went on vacation last year?  ─ For three times.」',
    'correction', NULL, NULL, NULL, NULL, 'How often did your family go on vacation last year? — Three times.',
    ARRAY['How often did your family go on vacation last year? — Three times.', 'How often did your family go on vacation last year? - Three times.']::text[],
    '两处错：① did 后用**原形** go；② 「三次」= **three times**，前面不加 for。',
    '{}'::jsonb, NULL, 'how_often_correction', true, 3, 9109
  ),
  (
    '对划线部分提问：  「I go to the library [twice a week].」',
    'transform', NULL, NULL, NULL, NULL, 'How often do you go to the library?',
    ARRAY['How often do you go to the library?']::text[],
    '对频率提问 → **How often** + 一般疑问句。',
    '{}'::jsonb, NULL, 'how_often_transform', true, 1, 9110
  ),
  (
    '对划线部分提问：  「Tom plays football [three times a week].」',
    'transform', NULL, NULL, NULL, NULL, 'How often does Tom play football?',
    ARRAY['How often does Tom play football?']::text[],
    'Tom 第三单 → does + 原形 play。',
    '{}'::jsonb, NULL, 'how_often_transform_3rd', true, 2, 9111
  ),
  (
    '对划线部分提问：  「My uncle went abroad [twice last year].」',
    'transform', NULL, NULL, NULL, NULL, 'How often did your uncle go abroad last year?',
    ARRAY[
      'How often did your uncle go abroad last year?',
      'How often did your uncle go abroad last year?'
    ]::text[],
    '过去时 → did + 原形 go；人称 my → your。',
    '{}'::jsonb, NULL, 'how_often_transform_past', true, 3, 9112
  ),
  (
    '把这句话译成英文：你多久看一次电影？',
    'translation', NULL, NULL, NULL, NULL, 'How often do you watch a movie?',
    ARRAY[
      'How often do you watch a movie?',
      'How often do you see a movie?',
      'How often do you watch movies?',
      'How often do you go to the cinema?'
    ]::text[],
    '「多久一次」= **How often**。',
    '{}'::jsonb, NULL, 'how_often_translation', true, 1, 9113
  ),
  (
    '把这句话译成英文：他一周锻炼三次。',
    'translation', NULL, NULL, NULL, NULL, 'He exercises three times a week.',
    ARRAY[
      'He exercises three times a week.',
      'He does exercise three times a week.',
      'He works out three times a week.'
    ]::text[],
    '「一周三次」= **three times a week**。',
    '{}'::jsonb, NULL, 'how_often_translation', true, 2, 9114
  ),
  (
    '把这句话译成英文：我妹妹几乎从不吃快餐，但她每周喝两次牛奶茶。',
    'translation', NULL, NULL, NULL, NULL, 'My sister hardly ever eats fast food, but she drinks milk tea twice a week.',
    ARRAY[
      'My sister hardly ever eats fast food, but she drinks milk tea twice a week.',
      'My sister hardly ever has fast food, but she drinks milk tea twice a week.',
      'My sister almost never eats fast food, but she has milk tea twice a week.'
    ]::text[],
    '「几乎从不」= hardly ever；「一周两次」= twice a week；主语第三单 → eats / drinks。',
    '{}'::jsonb, NULL, 'how_often_translation', true, 3, 9115
  )
) AS q(stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
       accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
       difficulty, sort_order);


-- =============== g8.09 · 形容词最高级 ===============
DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.09')
  AND sort_order BETWEEN 9100 AND 9199;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.09')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  (
    'Mount Qomolangma is the ___ mountain in the world.',
    'mcq', 'high', 'higher', 'highest', 'more high', 'C',
    NULL::text[],
    'in the world 三者以上 → 最高级 **highest**，前加 the。',
    '{}'::jsonb, NULL, 'superlative_short', false, 1, 9100
  ),
  (
    'This is the ___ book I have ever read.',
    'mcq', 'interesting', 'more interesting', 'most interesting', 'interestingest', 'C',
    NULL::text[],
    '长形容词最高级 → the **most interesting**。',
    '{}'::jsonb, NULL, 'superlative_long', false, 1, 9101
  ),
  (
    'Of all the four seasons, I like summer ___, because it is the ___ time of the year.',
    'mcq', 'best / hotter', 'better / hottest', 'best / hottest', 'most / hot', 'C',
    NULL::text[],
    'Of all → 三者以上最高级；like best = 最喜欢；hot 双写 t → **hottest**。',
    '{}'::jsonb, NULL, 'superlative_mixed', false, 3, 9102
  ),
  (
    'Beijing is one of the ___ cities in China.',
    'mcq', 'big', 'bigger', 'biggest', 'most big', 'C',
    NULL::text[],
    '「one of the + 最高级 + 复数名词」是固定句型；big 双写 g → **biggest**。',
    '{}'::jsonb, 'one of the + 最高级 + 复数 是高频中考句型。', 'superlative_one_of', false, 3, 9103
  ),
  (
    'February is the ____ (short) month of the year.',
    'fill', NULL, NULL, NULL, NULL, 'shortest',
    ARRAY['shortest']::text[],
    'short + est = **shortest**。',
    '{}'::jsonb, NULL, 'superlative_short', false, 1, 9104
  ),
  (
    'Tom is the ____ (tall) student in his class, but he is also the ____ (heavy).',
    'fill', NULL, NULL, NULL, NULL, 'tallest / heaviest',
    ARRAY[
      'tallest / heaviest',
      'tallest/heaviest',
      'tallest, heaviest'
    ]::text[],
    'tall → tallest；heavy 去 y 加 iest → **heaviest**。',
    '{}'::jsonb, NULL, 'superlative_mixed', false, 2, 9105
  ),
  (
    'The Pacific is one of the ____ (large) oceans, and it is also the ____ (deep) of all.',
    'fill', NULL, NULL, NULL, NULL, 'largest / deepest',
    ARRAY[
      'largest / deepest',
      'largest/deepest',
      'largest, deepest'
    ]::text[],
    'large → **largest**（去 e 加 st）；deep → **deepest**。',
    '{}'::jsonb, NULL, 'superlative_largest', false, 3, 9106
  ),
  (
    '改错：  「She is the most tallest girl in our class.」',
    'correction', NULL, NULL, NULL, NULL, 'She is the tallest girl in our class.',
    ARRAY['She is the tallest girl in our class.']::text[],
    'most 与 -est 不能并用 → **tallest**。',
    '{}'::jsonb, NULL, 'superlative_correction', true, 1, 9107
  ),
  (
    '改错：  「This is most beautiful park in our city.」',
    'correction', NULL, NULL, NULL, NULL, 'This is the most beautiful park in our city.',
    ARRAY['This is the most beautiful park in our city.']::text[],
    '最高级前必须加 **the**。',
    '{}'::jsonb, NULL, 'superlative_correction', true, 2, 9108
  ),
  (
    '改错：  「Shanghai is one of the most largest city in China.」',
    'correction', NULL, NULL, NULL, NULL, 'Shanghai is one of the largest cities in China.',
    ARRAY['Shanghai is one of the largest cities in China.']::text[],
    '两处错：① most 与 -est 不能并用 → **largest**；② one of the 后接**复数** cities。',
    '{}'::jsonb, NULL, 'superlative_correction', true, 3, 9109
  ),
  (
    '改写为最高级（提示：in our class）：  「Tom is a tall boy.」',
    'transform', NULL, NULL, NULL, NULL, 'Tom is the tallest boy in our class.',
    ARRAY['Tom is the tallest boy in our class.']::text[],
    'tall + est = tallest，前加 the；范围 in our class。',
    '{}'::jsonb, NULL, 'superlative_transform', true, 1, 9110
  ),
  (
    '用「one of the + 最高级」改写：  《The Yangtze River is a very long river in the world.》',
    'transform', NULL, NULL, NULL, NULL, 'The Yangtze River is one of the longest rivers in the world.',
    ARRAY['The Yangtze River is one of the longest rivers in the world.']::text[],
    'one of the + 最高级 + 复数 → **the longest rivers**。',
    '{}'::jsonb, NULL, 'superlative_one_of_transform', true, 2, 9111
  ),
  (
    '改写为同义句（用 否定 + 比较级）：  「Mount Qomolangma is the highest mountain in the world.」',
    'transform', NULL, NULL, NULL, NULL, 'No other mountain in the world is higher than Mount Qomolangma.',
    ARRAY[
      'No other mountain in the world is higher than Mount Qomolangma.',
      'No mountain in the world is higher than Mount Qomolangma.',
      'No other mountain is higher than Mount Qomolangma in the world.'
    ]::text[],
    '最高级 ↔ 「No other + 单数 + 比较级 + than」。',
    '{}'::jsonb, '中考最常考的最高级换装题。', 'superlative_negation', true, 3, 9112
  ),
  (
    '把这句话译成英文：他是我们班最聪明的学生。',
    'translation', NULL, NULL, NULL, NULL, 'He is the cleverest student in our class.',
    ARRAY[
      'He is the cleverest student in our class.',
      'He is the smartest student in our class.',
      'He is the most clever student in our class.'
    ]::text[],
    'clever → **cleverest** 或 most clever；最高级前加 the；范围 in our class。',
    '{}'::jsonb, NULL, 'superlative_translation', true, 1, 9113
  ),
  (
    '把这句话译成英文：长江是中国最长的河流之一。',
    'translation', NULL, NULL, NULL, NULL, 'The Yangtze River is one of the longest rivers in China.',
    ARRAY[
      'The Yangtze River is one of the longest rivers in China.',
      'The Changjiang River is one of the longest rivers in China.'
    ]::text[],
    '「…最…之一」= one of the + 最高级 + 复数。',
    '{}'::jsonb, NULL, 'superlative_one_of_translation', true, 2, 9114
  ),
  (
    '把这句话译成英文：这是我读过的最有趣的书之一。',
    'translation', NULL, NULL, NULL, NULL, 'This is one of the most interesting books I have ever read.',
    ARRAY[
      'This is one of the most interesting books I have ever read.',
      'This is one of the most interesting books that I have ever read.',
      'This is one of the most interesting books I''ve ever read.'
    ]::text[],
    '「我读过的最…之一」= one of the most interesting books + I have ever read（完成时定语从句）。',
    '{}'::jsonb, NULL, 'superlative_with_ever', true, 3, 9115
  )
) AS q(stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
       accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
       difficulty, sort_order);


-- =============== g8.10 · 感官动词 (see/hear/feel + sb. doing/do) ===============
DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.10')
  AND sort_order BETWEEN 9100 AND 9199;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.10')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  (
    'I heard him ___ a song in the next room just now.',
    'mcq', 'sing', 'singing', 'sings', 'to sing', 'B',
    NULL::text[],
    'just now 听见**正在进行** → hear sb. **doing**：singing。',
    '{}'::jsonb, NULL, 'sense_verb_doing', false, 1, 9100
  ),
  (
    'I often see her ___ in the park after school.',
    'mcq', 'to run', 'running', 'runs', 'ran', 'B',
    NULL::text[],
    '「看见她在跑」（强调过程或习惯）→ see sb. **running**（中考常用）。',
    '{}'::jsonb, NULL, 'sense_verb_doing', false, 1, 9101
  ),
  (
    'I heard the door ___ at midnight, and then I saw a tall man ___ into the house.',
    'mcq', 'open / walking', 'opening / walked', 'open / walked', 'opening / walk', 'A',
    NULL::text[],
    '听见门**开了一下**（短暂动作）→ hear sth. **do** open；看见人**正在走**→ see sb. **doing** walking。',
    '{}'::jsonb, '感官动词 do vs doing：完整动作用原形，过程用 -ing。', 'sense_verb_do_vs_doing', false, 3, 9102
  ),
  (
    'When I passed by the classroom, I heard the teacher ___ a story and saw the students ___ at their desks.',
    'mcq', 'tell / sit', 'telling / sitting', 'tell / sitting', 'told / sat', 'B',
    NULL::text[],
    '「经过时」听到/看到正在进行 → telling / sitting（都用 -ing）。',
    '{}'::jsonb, NULL, 'sense_verb_doing', false, 3, 9103
  ),
  (
    'Listen! I can hear someone ____ (cry) outside the window.',
    'fill', NULL, NULL, NULL, NULL, 'crying',
    ARRAY['crying']::text[],
    'Listen! 此刻听到 → hear sb. **crying**。',
    '{}'::jsonb, NULL, 'sense_verb_doing_signal', false, 1, 9104
  ),
  (
    'I felt the ground ____ (shake) and then ran out of the room.',
    'fill', NULL, NULL, NULL, NULL, 'shake',
    ARRAY['shake', 'shaking']::text[],
    '感觉到地震「短暂动作」用原形 **shake**（强调过程用 shaking 也接受）。',
    '{}'::jsonb, NULL, 'sense_verb_do', false, 2, 9105
  ),
  (
    'Yesterday evening I saw a strange light ____ (move) in the sky for about ten minutes.',
    'fill', NULL, NULL, NULL, NULL, 'moving',
    ARRAY['moving']::text[],
    'for about ten minutes → 持续过程 → see sth. **moving**。',
    '{}'::jsonb, NULL, 'sense_verb_doing_duration', false, 3, 9106
  ),
  (
    '改错：  「I heard him sings in the bathroom.」',
    'correction', NULL, NULL, NULL, NULL, 'I heard him singing in the bathroom.',
    ARRAY['I heard him singing in the bathroom.', 'I heard him sing in the bathroom.']::text[],
    '感官动词 hear sb. + **doing/do**（不能用 sings 这种谓语形式）。',
    '{}'::jsonb, NULL, 'sense_verb_correction', true, 1, 9107
  ),
  (
    '改错：  「I saw him to walk into the library.」',
    'correction', NULL, NULL, NULL, NULL, 'I saw him walk into the library.',
    ARRAY['I saw him walk into the library.', 'I saw him walking into the library.']::text[],
    '感官动词 see 后用**原形** walk 或 **walking**，不用 to walk。',
    '{}'::jsonb, NULL, 'sense_verb_correction', true, 2, 9108
  ),
  (
    '改错：  「Last night I heard somebody to knock on the door and saw a stranger stood outside.」',
    'correction', NULL, NULL, NULL, NULL, 'Last night I heard somebody knock on the door and saw a stranger standing outside.',
    ARRAY['Last night I heard somebody knock on the door and saw a stranger standing outside.', 'Last night I heard somebody knocking on the door and saw a stranger standing outside.']::text[],
    '两处错：① hear sb. **knock**（原形，短暂动作）；② see sb. **standing**（状态/进行）。',
    '{}'::jsonb, NULL, 'sense_verb_correction', true, 3, 9109
  ),
  (
    '用感官动词改写：  「Tom is playing the piano. I can hear him.」',
    'transform', NULL, NULL, NULL, NULL, 'I can hear Tom playing the piano.',
    ARRAY['I can hear Tom playing the piano.']::text[],
    'hear sb. doing → hear Tom **playing** the piano。',
    '{}'::jsonb, NULL, 'sense_verb_transform', true, 1, 9110
  ),
  (
    '用感官动词改写：  「The students are reading aloud. I see them every morning.」',
    'transform', NULL, NULL, NULL, NULL, 'I see the students reading aloud every morning.',
    ARRAY[
      'I see the students reading aloud every morning.',
      'Every morning I see the students reading aloud.'
    ]::text[],
    'see sb. doing → see the students **reading**。',
    '{}'::jsonb, NULL, 'sense_verb_transform', true, 2, 9111
  ),
  (
    '改写为含感官动词的句子：  「The little boy fell down. I saw it happen.」',
    'transform', NULL, NULL, NULL, NULL, 'I saw the little boy fall down.',
    ARRAY[
      'I saw the little boy fall down.',
      'I saw the little boy falling down.'
    ]::text[],
    '「摔倒」是完整动作 → see sb. **fall** down（原形，强调动作完整）。',
    '{}'::jsonb, NULL, 'sense_verb_do_complete', true, 3, 9112
  ),
  (
    '把这句话译成英文：我听见她在唱歌。',
    'translation', NULL, NULL, NULL, NULL, 'I hear her singing.',
    ARRAY[
      'I hear her singing.',
      'I can hear her singing.',
      'I heard her singing.'
    ]::text[],
    'hear sb. doing → hear her **singing**。',
    '{}'::jsonb, NULL, 'sense_verb_translation', true, 1, 9113
  ),
  (
    '把这句话译成英文：我经常看到他在公园里跑步。',
    'translation', NULL, NULL, NULL, NULL, 'I often see him running in the park.',
    ARRAY[
      'I often see him running in the park.',
      'I often see him run in the park.'
    ]::text[],
    'see sb. doing → see him **running**；often 放动词前。',
    '{}'::jsonb, NULL, 'sense_verb_translation', true, 2, 9114
  ),
  (
    '把这句话译成英文：昨天晚上我感到房子在摇晃，于是看到大家都跑了出来。',
    'translation', NULL, NULL, NULL, NULL, 'Last night I felt the house shaking, and then I saw everyone run out.',
    ARRAY[
      'Last night I felt the house shaking, and then I saw everyone run out.',
      'Last night I felt the house shaking, and then I saw everyone running out.',
      'Last night I felt the house shake, and then I saw everyone run out.'
    ]::text[],
    'feel sth. doing → feel the house **shaking**（持续过程）；see sb. **run/running** out。',
    '{}'::jsonb, NULL, 'sense_verb_translation', true, 3, 9115
  )
) AS q(stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
       accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
       difficulty, sort_order);


-- =============== g8.11 · 不定式 (to-infinitive) ===============
DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.11')
  AND sort_order BETWEEN 9100 AND 9199;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.11')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  (
    'I want ___ a doctor when I grow up.',
    'mcq', 'be', 'to be', 'being', 'is', 'B',
    NULL::text[],
    'want + **to do**（to be）。',
    '{}'::jsonb, NULL, 'infinitive_after_want', false, 1, 9100
  ),
  (
    'It''s time ___ to bed, kids.',
    'mcq', 'go', 'going', 'to go', 'goes', 'C',
    NULL::text[],
    'It''s time + **to do** → to go。',
    '{}'::jsonb, NULL, 'infinitive_its_time', false, 1, 9101
  ),
  (
    'My mother asked me ___ careful when ___ the street.',
    'mcq', 'be / crossing', 'to be / crossing', 'be / cross', 'to be / cross', 'B',
    NULL::text[],
    'ask sb. **to do** → to be careful；when 后接 -ing 表示「在…时」 → crossing。',
    '{}'::jsonb, NULL, 'infinitive_after_ask', false, 3, 9102
  ),
  (
    'The teacher told us not ___ in class, and she expects us ___ harder next term.',
    'mcq', 'talk / studying', 'to talk / to study', 'talking / study', 'not to talk / to study', 'B',
    NULL::text[],
    'tell sb. (not) **to do** → not to talk；expect sb. **to do** → to study。否定不定式 = **not + to do**。',
    '{}'::jsonb, 'tell/ask/want/expect sb. (not) to do 是中考核心句型。', 'infinitive_negative', false, 3, 9103
  ),
  (
    'I hope ____ (see) you again soon.',
    'fill', NULL, NULL, NULL, NULL, 'to see',
    ARRAY['to see']::text[],
    'hope + **to do** → to see。',
    '{}'::jsonb, NULL, 'infinitive_after_hope', false, 1, 9104
  ),
  (
    'It''s important for us ____ (protect) the environment.',
    'fill', NULL, NULL, NULL, NULL, 'to protect',
    ARRAY['to protect']::text[],
    'It''s + 形 + for sb. + **to do** → to protect。',
    '{}'::jsonb, 'It''s adj. for sb. to do sth. 是中考写作高频句型。', 'infinitive_it_for_sb', false, 2, 9105
  ),
  (
    'The little boy is too young ____ (go) to school by himself, so his mother decided ____ (take) him every day.',
    'fill', NULL, NULL, NULL, NULL, 'to go / to take',
    ARRAY[
      'to go / to take',
      'to go/to take',
      'to go, to take'
    ]::text[],
    'too + 形 + **to do** → too young to go；decide + **to do** → to take。',
    '{}'::jsonb, NULL, 'infinitive_too_to', false, 3, 9106
  ),
  (
    '改错：  「I want play football with you.」',
    'correction', NULL, NULL, NULL, NULL, 'I want to play football with you.',
    ARRAY['I want to play football with you.']::text[],
    'want + **to do** → to play。',
    '{}'::jsonb, NULL, 'infinitive_correction', true, 1, 9107
  ),
  (
    '改错：  「My father asked me studying English every day.」',
    'correction', NULL, NULL, NULL, NULL, 'My father asked me to study English every day.',
    ARRAY['My father asked me to study English every day.']::text[],
    'ask sb. **to do** → to study（不是 studying）。',
    '{}'::jsonb, NULL, 'infinitive_correction', true, 2, 9108
  ),
  (
    '改错：  「The teacher told us don''t to talk in class, and it is important for us listen carefully.」',
    'correction', NULL, NULL, NULL, NULL, 'The teacher told us not to talk in class, and it is important for us to listen carefully.',
    ARRAY['The teacher told us not to talk in class, and it is important for us to listen carefully.']::text[],
    '两处错：① 否定不定式 = **not to do**（不是 don''t to）；② It''s … for sb. **to do** → to listen。',
    '{}'::jsonb, NULL, 'infinitive_correction', true, 3, 9109
  ),
  (
    '合并句子（用不定式）：  「I went to the library. I wanted to borrow some books.」',
    'transform', NULL, NULL, NULL, NULL, 'I went to the library to borrow some books.',
    ARRAY[
      'I went to the library to borrow some books.',
      'I went to the library in order to borrow some books.'
    ]::text[],
    '目的状语用 **to do**：to borrow some books。',
    '{}'::jsonb, NULL, 'infinitive_purpose', true, 1, 9110
  ),
  (
    '用「It''s + 形 + for sb. + to do」改写：  《Learning English well is important for us.》',
    'transform', NULL, NULL, NULL, NULL, 'It''s important for us to learn English well.',
    ARRAY[
      'It''s important for us to learn English well.',
      'It is important for us to learn English well.'
    ]::text[],
    'It''s + 形 + for sb. + **to do** 替换动名词主语。',
    '{}'::jsonb, NULL, 'infinitive_it_transform', true, 2, 9111
  ),
  (
    '用「too … to do」改写：  《He is so young that he can''t go to school.》',
    'transform', NULL, NULL, NULL, NULL, 'He is too young to go to school.',
    ARRAY['He is too young to go to school.']::text[],
    'so…that 否定句 → **too … to do**（too young to go）。',
    '{}'::jsonb, '「so adj. that 否定 ↔ too adj. to do」是中考必考转换。', 'infinitive_too_to_transform', true, 3, 9112
  ),
  (
    '把这句话译成英文：我想要一杯水。',
    'translation', NULL, NULL, NULL, NULL, 'I want a glass of water.',
    ARRAY[
      'I want a glass of water.',
      'I would like a glass of water.',
      'I want to have a glass of water.'
    ]::text[],
    '可以直接 want + 名词，或 want **to have** a glass of water。',
    '{}'::jsonb, NULL, 'infinitive_translation', true, 1, 9113
  ),
  (
    '把这句话译成英文：保护环境对我们很重要。',
    'translation', NULL, NULL, NULL, NULL, 'It''s important for us to protect the environment.',
    ARRAY[
      'It''s important for us to protect the environment.',
      'It is important for us to protect the environment.',
      'To protect the environment is important for us.'
    ]::text[],
    'It''s + 形 + for sb. + to do → to protect the environment。',
    '{}'::jsonb, NULL, 'infinitive_it_translation', true, 2, 9114
  ),
  (
    '把这句话译成英文：他太累了不能继续工作，所以决定休息一下。',
    'translation', NULL, NULL, NULL, NULL, 'He is too tired to keep working, so he decided to take a rest.',
    ARRAY[
      'He is too tired to keep working, so he decided to take a rest.',
      'He is too tired to continue working, so he decided to have a rest.',
      'He was too tired to keep working, so he decided to take a rest.'
    ]::text[],
    'too … to do → too tired to keep working；decide + to do → to take a rest。',
    '{}'::jsonb, NULL, 'infinitive_mixed_translation', true, 3, 9115
  )
) AS q(stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
       accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
       difficulty, sort_order);


-- =====================================================================
-- Final sanity check: verify 10 codes each have 16 questions
-- =====================================================================
DO $$
DECLARE
  v_codes text[] := ARRAY['g8.02','g8.03','g8.04','g8.05','g8.06','g8.07','g8.08','g8.09','g8.10','g8.11'];
  v_code text;
  v_pid uuid;
  v_count int;
BEGIN
  FOREACH v_code IN ARRAY v_codes LOOP
    SELECT id INTO v_pid FROM junior_grammar_points WHERE code = v_code;
    IF v_pid IS NULL THEN
      RAISE EXCEPTION 'Code % missing — cannot expand adaptive bank.', v_code;
    END IF;
    SELECT count(*) INTO v_count FROM junior_grammar_questions
     WHERE point_id = v_pid AND sort_order BETWEEN 9100 AND 9199;
    IF v_count <> 16 THEN
      RAISE EXCEPTION 'Adaptive expansion failed for %: expected 16 extras, got %.', v_code, v_count;
    END IF;
  END LOOP;
  RAISE NOTICE 'Adaptive expansion verified for 10 G8 points (batch A): 160 new questions seeded.';
END $$;

-- =====================================================================
-- END · G8 adaptive question bank · Batch A (g8.02 ... g8.11)
-- =====================================================================
