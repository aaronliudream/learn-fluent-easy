-- =====================================================================
-- Adaptive question bank expansion · Batch B · 10 G8 grammar points
-- =====================================================================
-- Adds 16 new questions to each of 10 existing junior_grammar_points,
-- at varied difficulties (1=easy, 2=medium, 3=hard), so the adaptive
-- 5-level mastery test can drop / raise difficulty based on accuracy.
--
-- Sort_order range 9100-9115 = this adaptive expansion batch (per point)
--
-- Points covered (10):
--   g8.12 动名词 (gerund)
--   g8.13 verbs + to do / doing
--   g8.14 反身代词 (myself/yourself/...)
--   g8.15 how + adj 提问 (how tall/old/long...)
--   g8.16 邀请与建议 (would you like / shall we / let''s / why not / how about)
--   g8.17 if-conditional (第一条件句 type 1)
--   g8.18 should (建议 / 推断)
--   g8.19 have to / must
--   g8.20 could / would 礼貌请求
--   g8.21 when / while 时间状语从句
--
-- Per-point composition (16 questions):
--   • MCQ:         4  (2 easy d=1, 2 hard d=3)
--   • Fill:        3  (d=1, d=2, d=3)
--   • Correction:  3  (d=1, d=2, d=3)
--   • Transform:   3  (d=1, d=2, d=3)
--   • Translation: 3  (d=1, d=2, d=3)
--
-- Total new rows: 160
-- Idempotent: scoped to sort_order 9100-9199 per point.
-- =====================================================================


-- =============== g8.12 · 动名词 (gerund) ===============
DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.12')
  AND sort_order BETWEEN 9100 AND 9199;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.12')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  -- ─── 4 MCQs (2 easy, 2 hard) ───
  (
    'I enjoy ___ basketball on weekends.',
    'mcq', 'play', 'plays', 'playing', 'to play', 'C',
    NULL::text[],
    'enjoy + doing — **playing** 是动名词形式。',
    '{}'::jsonb, NULL, 'gerund_after_enjoy', false, 1, 9100
  ),
  (
    'Thank you for ___ me with my homework.',
    'mcq', 'help', 'helps', 'helping', 'to help', 'C',
    NULL::text[],
    '介词 for 后接动名词 → **helping**。',
    '{}'::jsonb, NULL, 'gerund_after_preposition', false, 1, 9101
  ),
  (
    'She is good at ___ Chinese paper-cuts, and she dreams of ___ them around the world someday.',
    'mcq', 'make / sell', 'making / selling', 'making / to sell', 'to make / selling', 'B',
    NULL::text[],
    '两处都是介词后 → 动名词：be good at **making**；dream of **selling**。',
    '{}'::jsonb, NULL, 'gerund_after_preposition', false, 3, 9102
  ),
  (
    '___ enough vegetables every day is important for ___ healthy.',
    'mcq', 'Eat / stay', 'To eat / stay', 'Eating / staying', 'Eating / to stay', 'C',
    NULL::text[],
    '主语用动名词 → **Eating**；介词 for 后用动名词 → **staying**。',
    '{}'::jsonb, NULL, 'gerund_as_subject', false, 3, 9103
  ),
  -- ─── 3 fills (d=1, d=2, d=3) ───
  (
    'My hobby is ____ (collect) stamps from different countries.',
    'fill', NULL, NULL, NULL, NULL, 'collecting',
    ARRAY['collecting']::text[],
    'be 动词后作表语用动名词 → **collecting**。',
    '{}'::jsonb, NULL, 'gerund_as_predicative', false, 1, 9104
  ),
  (
    'Would you mind ____ (close) the window? It is a bit cold.',
    'fill', NULL, NULL, NULL, NULL, 'closing',
    ARRAY['closing']::text[],
    'mind + doing → **closing**。',
    '{}'::jsonb, NULL, 'gerund_after_mind', false, 2, 9105
  ),
  (
    'Instead of ____ (watch) TV, why not go out for a walk?',
    'fill', NULL, NULL, NULL, NULL, 'watching',
    ARRAY['watching']::text[],
    'Instead of 是介词短语，后接动名词 → **watching**。',
    '{}'::jsonb, NULL, 'gerund_after_preposition', false, 3, 9106
  ),
  -- ─── 3 corrections (d=1, d=2, d=3) ───
  (
    '改错： I finished to do my homework before dinner.',
    'correction', NULL, NULL, NULL, NULL, 'I finished doing my homework before dinner.',
    ARRAY['I finished doing my homework before dinner.']::text[],
    'finish 后只能接**动名词** doing，不能接 to do。',
    '{}'::jsonb, NULL, 'gerund_after_finish', true, 1, 9107
  ),
  (
    '改错： He is interested in play the guitar after school.',
    'correction', NULL, NULL, NULL, NULL, 'He is interested in playing the guitar after school.',
    ARRAY['He is interested in playing the guitar after school.']::text[],
    'be interested in 后接**动名词** → playing。',
    '{}'::jsonb, NULL, 'gerund_after_preposition', true, 2, 9108
  ),
  (
    '改错： Read books every night help me to fall asleep faster.',
    'correction', NULL, NULL, NULL, NULL, 'Reading books every night helps me to fall asleep faster.',
    ARRAY['Reading books every night helps me to fall asleep faster.', 'Reading books every night helps me fall asleep faster.']::text[],
    '两处错：① 主语用**动名词** Reading；② 动名词主语视为单数，谓语用 **helps**。',
    '{}'::jsonb, NULL, 'gerund_as_subject', true, 3, 9109
  ),
  -- ─── 3 transforms (d=1, d=2, d=3) ───
  (
    '用动名词改写： I like. I swim in summer. (合成一句)',
    'transform', NULL, NULL, NULL, NULL, 'I like swimming in summer.',
    ARRAY['I like swimming in summer.']::text[],
    'like + doing 表示一般爱好 → **swimming**。',
    '{}'::jsonb, NULL, 'gerund_after_like', true, 1, 9110
  ),
  (
    '用 be good at 改写： She plays the piano very well.',
    'transform', NULL, NULL, NULL, NULL, 'She is good at playing the piano.',
    ARRAY['She is good at playing the piano.']::text[],
    'be good at + **doing**：playing。',
    '{}'::jsonb, NULL, 'gerund_after_preposition', true, 2, 9111
  ),
  (
    '用动名词作主语改写： It is not easy to learn a foreign language.',
    'transform', NULL, NULL, NULL, NULL, 'Learning a foreign language is not easy.',
    ARRAY['Learning a foreign language is not easy.', 'Learning a foreign language isn''t easy.']::text[],
    '动名词作主语：**Learning** ... is not easy。',
    '{}'::jsonb, NULL, 'gerund_as_subject', true, 3, 9112
  ),
  -- ─── 3 translations (d=1, d=2, d=3) ───
  (
    '把这句话译成英文：我喜欢读书。',
    'translation', NULL, NULL, NULL, NULL, 'I like reading books.',
    ARRAY['I like reading books.', 'I enjoy reading books.', 'I love reading books.']::text[],
    'like / enjoy + **doing** → reading。',
    '{}'::jsonb, NULL, 'gerund_translation', true, 1, 9113
  ),
  (
    '把这句话译成英文：他擅长画画。',
    'translation', NULL, NULL, NULL, NULL, 'He is good at drawing.',
    ARRAY['He is good at drawing.', 'He is good at painting.', 'He does well in drawing.']::text[],
    'be good at + **doing** → drawing / painting。',
    '{}'::jsonb, NULL, 'gerund_translation', true, 2, 9114
  ),
  (
    '把这句话译成英文：每天锻炼有助于保持健康。',
    'translation', NULL, NULL, NULL, NULL, 'Doing exercise every day helps to keep healthy.',
    ARRAY[
      'Doing exercise every day helps to keep healthy.',
      'Exercising every day helps us stay healthy.',
      'Doing sports every day helps to keep healthy.',
      'Taking exercise every day helps us keep healthy.'
    ]::text[],
    '动名词作主语视为单数，谓语用 **helps**。',
    '{}'::jsonb, NULL, 'gerund_translation', true, 3, 9115
  )
) AS q(stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
       accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
       difficulty, sort_order);


-- =============== g8.13 · verbs + to do / doing ===============
DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.13')
  AND sort_order BETWEEN 9100 AND 9199;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.13')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  -- ─── 4 MCQs ───
  (
    'My parents want me ___ a doctor in the future.',
    'mcq', 'be', 'being', 'to be', 'is', 'C',
    NULL::text[],
    'want sb. + **to do** sth. → to be。',
    '{}'::jsonb, NULL, 'want_to_do', false, 1, 9100
  ),
  (
    'He decided ___ harder next term.',
    'mcq', 'study', 'studies', 'studying', 'to study', 'D',
    NULL::text[],
    'decide + **to do** → to study。',
    '{}'::jsonb, NULL, 'decide_to_do', false, 1, 9101
  ),
  (
    'Remember ___ the door when you leave; I clearly remember ___ it open this morning.',
    'mcq', 'to lock / leaving', 'locking / to leave', 'to lock / to leave', 'locking / leaving', 'A',
    NULL::text[],
    'remember to do = 记得**去做**（未做）；remember doing = 记得**做过**（已做）。',
    '{}'::jsonb, NULL, 'remember_to_vs_doing', false, 3, 9102
  ),
  (
    'It started ___ heavily, so we stopped ___ shelter under a big tree.',
    'mcq', 'rain / find', 'raining / to find', 'to rain / finding', 'rain / to find', 'B',
    NULL::text[],
    'start + doing / to do 都可（这里 raining）；stop **to do** = 停下来**去做**另一件事（去找）。',
    '{}'::jsonb, NULL, 'stop_to_vs_doing', false, 3, 9103
  ),
  -- ─── 3 fills ───
  (
    'I hope ____ (see) you again soon.',
    'fill', NULL, NULL, NULL, NULL, 'to see',
    ARRAY['to see']::text[],
    'hope + **to do** → to see。',
    '{}'::jsonb, NULL, 'hope_to_do', false, 1, 9104
  ),
  (
    'Please keep ____ (try); don''t give up.',
    'fill', NULL, NULL, NULL, NULL, 'trying',
    ARRAY['trying']::text[],
    'keep + **doing** → trying。',
    '{}'::jsonb, NULL, 'keep_doing', false, 2, 9105
  ),
  (
    'I forgot ____ (turn) off the light before leaving, so it was on all night.',
    'fill', NULL, NULL, NULL, NULL, 'to turn',
    ARRAY['to turn']::text[],
    'forget **to do** = 忘记**去做**（未做）→ to turn。',
    '{}'::jsonb, NULL, 'forget_to_vs_doing', false, 3, 9106
  ),
  -- ─── 3 corrections ───
  (
    '改错： She enjoys to read novels in her free time.',
    'correction', NULL, NULL, NULL, NULL, 'She enjoys reading novels in her free time.',
    ARRAY['She enjoys reading novels in her free time.']::text[],
    'enjoy + **doing**，不能用 to do → reading。',
    '{}'::jsonb, NULL, 'enjoy_doing', true, 1, 9107
  ),
  (
    '改错： He promised helping me with my English.',
    'correction', NULL, NULL, NULL, NULL, 'He promised to help me with my English.',
    ARRAY['He promised to help me with my English.']::text[],
    'promise + **to do** → to help。',
    '{}'::jsonb, NULL, 'promise_to_do', true, 2, 9108
  ),
  (
    '改错： Don''t forget bringing your dictionary tomorrow; we will need to look up new words.',
    'correction', NULL, NULL, NULL, NULL, 'Don''t forget to bring your dictionary tomorrow; we will need to look up new words.',
    ARRAY['Don''t forget to bring your dictionary tomorrow; we will need to look up new words.']::text[],
    '语境是**还没带**，要用 forget **to do** → to bring。',
    '{}'::jsonb, NULL, 'forget_to_vs_doing', true, 3, 9109
  ),
  -- ─── 3 transforms ───
  (
    '用 want 改写： Lily''s wish is to be a singer.',
    'transform', NULL, NULL, NULL, NULL, 'Lily wants to be a singer.',
    ARRAY['Lily wants to be a singer.']::text[],
    'want + **to do** → to be。',
    '{}'::jsonb, NULL, 'want_to_do', true, 1, 9110
  ),
  (
    '用 finish 改写： We have done our homework.',
    'transform', NULL, NULL, NULL, NULL, 'We have finished doing our homework.',
    ARRAY['We have finished doing our homework.', 'We finished doing our homework.']::text[],
    'finish + **doing** → doing our homework。',
    '{}'::jsonb, NULL, 'finish_doing', true, 2, 9111
  ),
  (
    '用 stop ... to do 改写： He was walking. He saw an old friend and said hello.',
    'transform', NULL, NULL, NULL, NULL, 'He stopped to say hello to an old friend.',
    ARRAY['He stopped to say hello to an old friend.', 'He stopped walking to say hello to an old friend.']::text[],
    'stop **to do** = 停下来**去做**另一件事 → to say hello。',
    '{}'::jsonb, NULL, 'stop_to_do', true, 3, 9112
  ),
  -- ─── 3 translations ───
  (
    '把这句话译成英文：我希望成为一名老师。',
    'translation', NULL, NULL, NULL, NULL, 'I hope to be a teacher.',
    ARRAY['I hope to be a teacher.', 'I hope to become a teacher.', 'I want to be a teacher.']::text[],
    'hope / want + **to do** → to be / to become。',
    '{}'::jsonb, NULL, 'hope_to_do_translation', true, 1, 9113
  ),
  (
    '把这句话译成英文：请别忘记关门。',
    'translation', NULL, NULL, NULL, NULL, 'Please don''t forget to close the door.',
    ARRAY[
      'Please don''t forget to close the door.',
      'Don''t forget to close the door, please.',
      'Please remember to close the door.'
    ]::text[],
    'forget **to do** = 忘记**去做** → to close。',
    '{}'::jsonb, NULL, 'forget_to_do_translation', true, 2, 9114
  ),
  (
    '把这句话译成英文：他已经放弃了学习钢琴。',
    'translation', NULL, NULL, NULL, NULL, 'He has given up learning the piano.',
    ARRAY[
      'He has given up learning the piano.',
      'He gave up learning the piano.',
      'He has given up playing the piano.'
    ]::text[],
    'give up + **doing** → learning / playing。',
    '{}'::jsonb, NULL, 'give_up_doing', true, 3, 9115
  )
) AS q(stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
       accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
       difficulty, sort_order);


-- =============== g8.14 · 反身代词 (myself/yourself/...) ===============
DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.14')
  AND sort_order BETWEEN 9100 AND 9199;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.14')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  -- ─── 4 MCQs ───
  (
    'I hurt ___ when I was playing football yesterday.',
    'mcq', 'me', 'my', 'mine', 'myself', 'D',
    NULL::text[],
    '主语 I 的反身代词 → **myself**。hurt oneself 弄伤自己。',
    '{}'::jsonb, NULL, 'reflexive_basic', false, 1, 9100
  ),
  (
    'Help ___ to some fruit, kids.',
    'mcq', 'you', 'your', 'yours', 'yourselves', 'D',
    NULL::text[],
    'help oneself to sth. 自取，主语 kids（复数 you）→ **yourselves**。',
    '{}'::jsonb, NULL, 'reflexive_help_oneself', false, 1, 9101
  ),
  (
    'The little boy is too young to dress ___ , so his mother helps him every morning.',
    'mcq', 'him', 'his', 'he', 'himself', 'D',
    NULL::text[],
    'dress oneself 自己穿衣；主语 the little boy → **himself**。',
    '{}'::jsonb, NULL, 'reflexive_dress_oneself', false, 3, 9102
  ),
  (
    'My sister and I taught ___ how to make dumplings by watching videos.',
    'mcq', 'us', 'ourself', 'ourselves', 'themselves', 'C',
    NULL::text[],
    '主语 My sister and I （= we）→ **ourselves**（注意不是 ourself）。',
    '{}'::jsonb, NULL, 'reflexive_we_form', false, 3, 9103
  ),
  -- ─── 3 fills ───
  (
    'My little sister can dress ____ (she) now.',
    'fill', NULL, NULL, NULL, NULL, 'herself',
    ARRAY['herself']::text[],
    'dress oneself 自己穿衣；she 的反身代词 → **herself**。',
    '{}'::jsonb, NULL, 'reflexive_pronoun', false, 1, 9104
  ),
  (
    'Be careful! Don''t cut ____ (you) with the knife.',
    'fill', NULL, NULL, NULL, NULL, 'yourself',
    ARRAY['yourself']::text[],
    '主语 you（单数）→ **yourself**。',
    '{}'::jsonb, NULL, 'reflexive_pronoun', false, 2, 9105
  ),
  (
    'The children enjoyed ____ (they) at the science museum yesterday.',
    'fill', NULL, NULL, NULL, NULL, 'themselves',
    ARRAY['themselves']::text[],
    'enjoy oneself 玩得开心；the children → **themselves**。',
    '{}'::jsonb, NULL, 'reflexive_enjoy_oneself', false, 3, 9106
  ),
  -- ─── 3 corrections ───
  (
    '改错： I taught me how to play the guitar.',
    'correction', NULL, NULL, NULL, NULL, 'I taught myself how to play the guitar.',
    ARRAY['I taught myself how to play the guitar.']::text[],
    '主语和宾语指同一人，宾语用**反身代词** → myself。',
    '{}'::jsonb, NULL, 'reflexive_self_teach', true, 1, 9107
  ),
  (
    '改错： Did you boys enjoy yourself at the party last night?',
    'correction', NULL, NULL, NULL, NULL, 'Did you boys enjoy yourselves at the party last night?',
    ARRAY['Did you boys enjoy yourselves at the party last night?']::text[],
    'you boys 是复数 → **yourselves**（不是 yourself）。',
    '{}'::jsonb, NULL, 'reflexive_you_plural', true, 2, 9108
  ),
  (
    '改错： Tom and Jack made themself some sandwiches and then ate them in the garden.',
    'correction', NULL, NULL, NULL, NULL, 'Tom and Jack made themselves some sandwiches and then ate them in the garden.',
    ARRAY['Tom and Jack made themselves some sandwiches and then ate them in the garden.']::text[],
    'Tom and Jack 是复数主语 → 反身代词用 **themselves**（没有 themself 这种形式）。',
    '{}'::jsonb, NULL, 'reflexive_themselves', true, 3, 9109
  ),
  -- ─── 3 transforms ───
  (
    '用反身代词改写： I made this cake. Nobody helped me.',
    'transform', NULL, NULL, NULL, NULL, 'I made this cake myself.',
    ARRAY['I made this cake myself.', 'I made this cake by myself.']::text[],
    'oneself / by oneself = 独自；myself / by myself。',
    '{}'::jsonb, NULL, 'reflexive_by_oneself', true, 1, 9110
  ),
  (
    '用 enjoy oneself 改写： We had a great time at the picnic.',
    'transform', NULL, NULL, NULL, NULL, 'We enjoyed ourselves at the picnic.',
    ARRAY['We enjoyed ourselves at the picnic.']::text[],
    'have a great time = enjoy oneself；we → **ourselves**。',
    '{}'::jsonb, NULL, 'reflexive_enjoy_oneself', true, 2, 9111
  ),
  (
    '用 by oneself 改写： She finished the project alone, with no help from anyone.',
    'transform', NULL, NULL, NULL, NULL, 'She finished the project by herself.',
    ARRAY['She finished the project by herself.', 'She finished the project all by herself.']::text[],
    'alone / with no help = **by herself**（独自）。',
    '{}'::jsonb, NULL, 'reflexive_by_oneself', true, 3, 9112
  ),
  -- ─── 3 translations ───
  (
    '把这句话译成英文：照顾好你自己。',
    'translation', NULL, NULL, NULL, NULL, 'Take care of yourself.',
    ARRAY['Take care of yourself.', 'Please take care of yourself.', 'Look after yourself.']::text[],
    'take care of oneself 照顾自己；you → **yourself**。',
    '{}'::jsonb, NULL, 'reflexive_translation', true, 1, 9113
  ),
  (
    '把这句话译成英文：他自学法语。',
    'translation', NULL, NULL, NULL, NULL, 'He teaches himself French.',
    ARRAY[
      'He teaches himself French.',
      'He learns French by himself.',
      'He studies French by himself.'
    ]::text[],
    'teach oneself sth. 自学；by oneself 独自。',
    '{}'::jsonb, NULL, 'reflexive_self_teach', true, 2, 9114
  ),
  (
    '把这句话译成英文：孩子们在公园里玩得很开心。',
    'translation', NULL, NULL, NULL, NULL, 'The children enjoyed themselves in the park.',
    ARRAY[
      'The children enjoyed themselves in the park.',
      'The children had a good time in the park.',
      'The kids enjoyed themselves in the park.',
      'The children had fun in the park.'
    ]::text[],
    'enjoy oneself = have a good time；children → **themselves**。',
    '{}'::jsonb, NULL, 'reflexive_enjoy_oneself_tr', true, 3, 9115
  )
) AS q(stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
       accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
       difficulty, sort_order);


-- =============== g8.15 · how + adj 提问 (how tall/old/long...) ===============
DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.15')
  AND sort_order BETWEEN 9100 AND 9199;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.15')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  -- ─── 4 MCQs ───
  (
    '— ___ is your father?  — He is forty.',
    'mcq', 'How tall', 'How old', 'How long', 'How much', 'B',
    NULL::text[],
    '回答 forty 是年龄 → 问年龄 **How old**。',
    '{}'::jsonb, NULL, 'how_old', false, 1, 9100
  ),
  (
    '— ___ is the Great Wall?  — It''s more than 6,000 kilometers.',
    'mcq', 'How tall', 'How high', 'How long', 'How heavy', 'C',
    NULL::text[],
    '长城问长度 → **How long**。',
    '{}'::jsonb, NULL, 'how_long', false, 1, 9101
  ),
  (
    '— ___ is Mount Tai?  — It''s about 1,545 meters.',
    'mcq', 'How tall', 'How high', 'How long', 'How big', 'B',
    NULL::text[],
    '山的高度通常用 **How high**（人/建筑物常用 How tall）。',
    '{}'::jsonb, NULL, 'how_high_vs_tall', false, 3, 9102
  ),
  (
    '— ___ does it take you to ride to school?  — About fifteen minutes.',
    'mcq', 'How long', 'How far', 'How often', 'How soon', 'A',
    NULL::text[],
    '回答 fifteen minutes 是**时长** → **How long**（多长时间）；How far 是距离，How often 是频率，How soon 是多久之后。',
    '{}'::jsonb, NULL, 'how_long_duration', false, 3, 9103
  ),
  -- ─── 3 fills ───
  (
    '— How ____ are you?  — I am 1.65 meters.',
    'fill', NULL, NULL, NULL, NULL, 'tall',
    ARRAY['tall']::text[],
    '问人身高 → **How tall**。',
    '{}'::jsonb, NULL, 'how_tall', false, 1, 9104
  ),
  (
    '— How ____ is it from your home to school?  — About 2 kilometers.',
    'fill', NULL, NULL, NULL, NULL, 'far',
    ARRAY['far']::text[],
    '问距离 → **How far**。',
    '{}'::jsonb, NULL, 'how_far', false, 2, 9105
  ),
  (
    '— How ____ does your brother play basketball every week?  — Three times.',
    'fill', NULL, NULL, NULL, NULL, 'often',
    ARRAY['often']::text[],
    '回答 three times 是**频率** → **How often**。',
    '{}'::jsonb, NULL, 'how_often', false, 3, 9106
  ),
  -- ─── 3 corrections ───
  (
    '改错： How much is the river?  — It is 300 meters long.',
    'correction', NULL, NULL, NULL, NULL, 'How long is the river?',
    ARRAY['How long is the river?']::text[],
    '河的长度 → **How long**，不是 How much（多少钱）。',
    '{}'::jsonb, NULL, 'how_long_correction', true, 1, 9107
  ),
  (
    '改错： How old is the building? — It''s 80 meters.',
    'correction', NULL, NULL, NULL, NULL, 'How tall is the building?',
    ARRAY['How tall is the building?', 'How high is the building?']::text[],
    '回答是高度 80 meters → 应问 **How tall / How high**，不是 How old（年龄）。',
    '{}'::jsonb, NULL, 'how_tall_correction', true, 2, 9108
  ),
  (
    '改错： How long do you visit your grandparents? Once a month.',
    'correction', NULL, NULL, NULL, NULL, 'How often do you visit your grandparents?',
    ARRAY['How often do you visit your grandparents?']::text[],
    '回答 Once a month 是**频率** → **How often**（多久一次），不是 How long（多长时间）。',
    '{}'::jsonb, NULL, 'how_often_correction', true, 3, 9109
  ),
  -- ─── 3 transforms ───
  (
    '对划线部分提问： He is [thirteen years old].',
    'transform', NULL, NULL, NULL, NULL, 'How old is he?',
    ARRAY['How old is he?']::text[],
    '对年龄提问用 **How old**。',
    '{}'::jsonb, NULL, 'how_old_transform', true, 1, 9110
  ),
  (
    '对划线部分提问： The bridge is [500 meters] long.',
    'transform', NULL, NULL, NULL, NULL, 'How long is the bridge?',
    ARRAY['How long is the bridge?']::text[],
    '对长度提问 → **How long**。',
    '{}'::jsonb, NULL, 'how_long_transform', true, 2, 9111
  ),
  (
    '对划线部分提问： It takes [about half an hour] to get to the airport by taxi.',
    'transform', NULL, NULL, NULL, NULL, 'How long does it take to get to the airport by taxi?',
    ARRAY['How long does it take to get to the airport by taxi?', 'How long does it take to get to the airport?']::text[],
    '对时长提问 → **How long does it take**。',
    '{}'::jsonb, NULL, 'how_long_take', true, 3, 9112
  ),
  -- ─── 3 translations ───
  (
    '把这句话译成英文：你多大了？',
    'translation', NULL, NULL, NULL, NULL, 'How old are you?',
    ARRAY['How old are you?']::text[],
    '问年龄 → **How old**。',
    '{}'::jsonb, NULL, 'how_old_translation', true, 1, 9113
  ),
  (
    '把这句话译成英文：这座桥有多长？',
    'translation', NULL, NULL, NULL, NULL, 'How long is the bridge?',
    ARRAY['How long is the bridge?', 'How long is this bridge?']::text[],
    '问长度 → **How long**。',
    '{}'::jsonb, NULL, 'how_long_translation', true, 2, 9114
  ),
  (
    '把这句话译成英文：你妈妈多久去一次超市？',
    'translation', NULL, NULL, NULL, NULL, 'How often does your mother go to the supermarket?',
    ARRAY[
      'How often does your mother go to the supermarket?',
      'How often does your mom go to the supermarket?',
      'How often does your mother visit the supermarket?'
    ]::text[],
    '问频率 → **How often** + does + 三单 + 原形。',
    '{}'::jsonb, NULL, 'how_often_translation', true, 3, 9115
  )
) AS q(stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
       accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
       difficulty, sort_order);


-- =============== g8.16 · 邀请与建议 (would you like / shall we / let''s / why not / how about) ===============
DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.16')
  AND sort_order BETWEEN 9100 AND 9199;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.16')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  -- ─── 4 MCQs ───
  (
    '— Would you like ___ a cup of tea?  — Yes, please.',
    'mcq', 'have', 'has', 'having', 'to have', 'D',
    NULL::text[],
    'Would you like + **to do** sth.？→ to have。',
    '{}'::jsonb, NULL, 'would_you_like', false, 1, 9100
  ),
  (
    '— Let''s ___ a movie tonight.  — Good idea!',
    'mcq', 'watch', 'watches', 'watching', 'to watch', 'A',
    NULL::text[],
    'Let''s + **动词原形** → watch。',
    '{}'::jsonb, NULL, 'let_us_suggestion', false, 1, 9101
  ),
  (
    '— ___ going hiking this weekend?  — Sounds great!',
    'mcq', 'Why don''t', 'Why not', 'What about', 'Let''s', 'C',
    NULL::text[],
    'What about / How about + **doing** → going。Why not 后接动词原形，Let''s 后接原形。',
    '{}'::jsonb, NULL, 'what_about_doing', false, 3, 9102
  ),
  (
    '— ___ have a picnic if it doesn''t rain tomorrow?  — I''d love to.',
    'mcq', 'Why not', 'How about', 'Why don''t we', 'Let''s', 'C',
    NULL::text[],
    'Why don''t we + **动词原形** = 我们为什么不...；句尾问号说明是疑问句，Let''s 是陈述句不带问号。',
    '{}'::jsonb, NULL, 'why_dont_we', false, 3, 9103
  ),
  -- ─── 3 fills ───
  (
    'Would you like ____ (go) shopping with me?',
    'fill', NULL, NULL, NULL, NULL, 'to go',
    ARRAY['to go']::text[],
    'Would you like + **to do** → to go。',
    '{}'::jsonb, NULL, 'would_you_like_to_do', false, 1, 9104
  ),
  (
    'How about ____ (play) basketball after school?',
    'fill', NULL, NULL, NULL, NULL, 'playing',
    ARRAY['playing']::text[],
    'How about + **doing** → playing。',
    '{}'::jsonb, NULL, 'how_about_doing', false, 2, 9105
  ),
  (
    'Why not ____ (take) a taxi if you are in a hurry?',
    'fill', NULL, NULL, NULL, NULL, 'take',
    ARRAY['take']::text[],
    'Why not + **动词原形** → take。',
    '{}'::jsonb, NULL, 'why_not_do', false, 3, 9106
  ),
  -- ─── 3 corrections ───
  (
    '改错： Let''s to go to the park together.',
    'correction', NULL, NULL, NULL, NULL, 'Let''s go to the park together.',
    ARRAY['Let''s go to the park together.']::text[],
    'Let''s 后接**动词原形**，不加 to。',
    '{}'::jsonb, NULL, 'lets_do_correction', true, 1, 9107
  ),
  (
    '改错： What about to watch a film this evening?',
    'correction', NULL, NULL, NULL, NULL, 'What about watching a film this evening?',
    ARRAY['What about watching a film this evening?', 'How about watching a film this evening?']::text[],
    'What about / How about 是介词短语，后接**动名词** → watching。',
    '{}'::jsonb, NULL, 'what_about_correction', true, 2, 9108
  ),
  (
    '改错： Why don''t you to join our English club? It''s a lot of fun.',
    'correction', NULL, NULL, NULL, NULL, 'Why don''t you join our English club? It''s a lot of fun.',
    ARRAY['Why don''t you join our English club? It''s a lot of fun.']::text[],
    'Why don''t you + **动词原形**，不加 to → join。',
    '{}'::jsonb, NULL, 'why_dont_you_correction', true, 3, 9109
  ),
  -- ─── 3 transforms ───
  (
    '用 Let''s 改写： Shall we go swimming?',
    'transform', NULL, NULL, NULL, NULL, 'Let''s go swimming.',
    ARRAY['Let''s go swimming.', 'Let us go swimming.']::text[],
    'Let''s + 原形 → go swimming。',
    '{}'::jsonb, NULL, 'lets_transform', true, 1, 9110
  ),
  (
    '用 How about 改写： Why don''t we have lunch at the new restaurant?',
    'transform', NULL, NULL, NULL, NULL, 'How about having lunch at the new restaurant?',
    ARRAY['How about having lunch at the new restaurant?', 'What about having lunch at the new restaurant?']::text[],
    'How about + **doing** → having。',
    '{}'::jsonb, NULL, 'how_about_transform', true, 2, 9111
  ),
  (
    '用 Would you like 改写： Do you want to come to my birthday party?',
    'transform', NULL, NULL, NULL, NULL, 'Would you like to come to my birthday party?',
    ARRAY['Would you like to come to my birthday party?']::text[],
    'Would you like + **to do** → to come（更委婉的邀请）。',
    '{}'::jsonb, NULL, 'would_you_like_transform', true, 3, 9112
  ),
  -- ─── 3 translations ───
  (
    '把这句话译成英文：我们去打篮球吧。',
    'translation', NULL, NULL, NULL, NULL, 'Let''s play basketball.',
    ARRAY['Let''s play basketball.', 'Let us play basketball.', 'Shall we play basketball?']::text[],
    'Let''s + **动词原形** → play。',
    '{}'::jsonb, NULL, 'lets_translation', true, 1, 9113
  ),
  (
    '把这句话译成英文：你想喝杯咖啡吗？',
    'translation', NULL, NULL, NULL, NULL, 'Would you like a cup of coffee?',
    ARRAY[
      'Would you like a cup of coffee?',
      'Would you like to have a cup of coffee?',
      'Do you want a cup of coffee?'
    ]::text[],
    'Would you like + 名词 / + to do → a cup of coffee。',
    '{}'::jsonb, NULL, 'would_you_like_translation', true, 2, 9114
  ),
  (
    '把这句话译成英文：周末一起去公园野餐怎么样？',
    'translation', NULL, NULL, NULL, NULL, 'How about going to the park for a picnic this weekend?',
    ARRAY[
      'How about going to the park for a picnic this weekend?',
      'What about going to the park for a picnic this weekend?',
      'Why don''t we go to the park for a picnic this weekend?',
      'Shall we go to the park for a picnic this weekend?'
    ]::text[],
    'How about / What about + **doing** → going。',
    '{}'::jsonb, NULL, 'how_about_translation', true, 3, 9115
  )
) AS q(stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
       accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
       difficulty, sort_order);


-- =============== g8.17 · if-conditional (第一条件句 type 1) ===============
DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.17')
  AND sort_order BETWEEN 9100 AND 9199;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.17')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  -- ─── 4 MCQs ───
  (
    'If it ___ tomorrow, we will stay at home.',
    'mcq', 'rains', 'rained', 'will rain', 'is raining', 'A',
    NULL::text[],
    '第一条件句：if 从句**一般现在时**，主句 will + 原形 → rains。',
    '{}'::jsonb, NULL, 'if_conditional_present', false, 1, 9100
  ),
  (
    'If you study hard, you ___ pass the exam.',
    'mcq', 'pass', 'passed', 'will pass', 'are passing', 'C',
    NULL::text[],
    '主句用 **will + 原形** → will pass。',
    '{}'::jsonb, NULL, 'if_conditional_will', false, 1, 9101
  ),
  (
    'If she ___ here tomorrow, I ___ her your message.',
    'mcq', 'comes / will give', 'will come / give', 'comes / give', 'will come / will give', 'A',
    NULL::text[],
    '第一条件句（主将从现）：从句 **comes**（一般现在）；主句 **will give**。',
    '{}'::jsonb, NULL, 'if_conditional_pattern', false, 3, 9102
  ),
  (
    'Unless you ___ now, you ___ the early bus.',
    'mcq', 'leave / will miss', 'leaves / will miss', 'will leave / miss', 'leave / miss', 'A',
    NULL::text[],
    'Unless = If ... not，从句用**一般现在时** leave；主句 **will miss**。',
    '{}'::jsonb, NULL, 'unless_conditional', false, 3, 9103
  ),
  -- ─── 3 fills ───
  (
    'If it ____ (be) sunny tomorrow, we will have a picnic.',
    'fill', NULL, NULL, NULL, NULL, 'is',
    ARRAY['is']::text[],
    'if 从句用**一般现在时**；it → **is**。',
    '{}'::jsonb, NULL, 'if_conditional_be', false, 1, 9104
  ),
  (
    'If you don''t hurry, you ____ (miss) the bus.',
    'fill', NULL, NULL, NULL, NULL, 'will miss',
    ARRAY['will miss', '''ll miss']::text[],
    '主句用 **will + 原形** → will miss。',
    '{}'::jsonb, NULL, 'if_conditional_will', false, 2, 9105
  ),
  (
    'If he ____ (not finish) his homework, his teacher ____ (be) angry.',
    'fill', NULL, NULL, NULL, NULL, 'doesn''t finish / will be',
    ARRAY[
      'doesn''t finish / will be',
      'doesn''t finish/will be',
      'doesn''t finish, will be',
      'does not finish / will be'
    ]::text[],
    'if 从句**一般现在时**（三单 doesn''t finish）；主句 **will be**。',
    '{}'::jsonb, NULL, 'if_conditional_mixed', false, 3, 9106
  ),
  -- ─── 3 corrections ───
  (
    '改错： If it will rain tomorrow, we will not go out.',
    'correction', NULL, NULL, NULL, NULL, 'If it rains tomorrow, we will not go out.',
    ARRAY['If it rains tomorrow, we will not go out.', 'If it rains tomorrow, we won''t go out.']::text[],
    'if 从句**不能**用 will，用**一般现在时** rains。',
    '{}'::jsonb, NULL, 'if_no_will', true, 1, 9107
  ),
  (
    '改错： If you will work harder, you will get better grades.',
    'correction', NULL, NULL, NULL, NULL, 'If you work harder, you will get better grades.',
    ARRAY['If you work harder, you will get better grades.']::text[],
    'if 从句去掉 will，用一般现在时 → **work**。',
    '{}'::jsonb, NULL, 'if_no_will', true, 2, 9108
  ),
  (
    '改错： If she didn''t come to the party tomorrow, we are sad.',
    'correction', NULL, NULL, NULL, NULL, 'If she doesn''t come to the party tomorrow, we will be sad.',
    ARRAY['If she doesn''t come to the party tomorrow, we will be sad.']::text[],
    '两处错：① 谈未来用**一般现在** doesn''t come（不是过去 didn''t）；② 主句 **will be** sad。',
    '{}'::jsonb, NULL, 'if_conditional_future', true, 3, 9109
  ),
  -- ─── 3 transforms ───
  (
    '用 if 合并： Hurry up. You can catch the bus.',
    'transform', NULL, NULL, NULL, NULL, 'If you hurry up, you can catch the bus.',
    ARRAY['If you hurry up, you can catch the bus.', 'If you hurry up, you will catch the bus.']::text[],
    'if + 一般现在时（hurry up），主句 can / will + 原形。',
    '{}'::jsonb, NULL, 'if_conditional_transform', true, 1, 9110
  ),
  (
    '用 if 合并： Don''t eat too much sugar. You will get a toothache.',
    'transform', NULL, NULL, NULL, NULL, 'If you eat too much sugar, you will get a toothache.',
    ARRAY['If you eat too much sugar, you will get a toothache.']::text[],
    'if + 一般现在 eat，主句 **will get**。',
    '{}'::jsonb, NULL, 'if_conditional_transform', true, 2, 9111
  ),
  (
    '用 unless 改写： If you don''t take an umbrella, you will get wet.',
    'transform', NULL, NULL, NULL, NULL, 'Unless you take an umbrella, you will get wet.',
    ARRAY['Unless you take an umbrella, you will get wet.', 'You will get wet unless you take an umbrella.']::text[],
    'unless = if ... not，所以从句变肯定 take（去掉 don''t）。',
    '{}'::jsonb, NULL, 'unless_transform', true, 3, 9112
  ),
  -- ─── 3 translations ───
  (
    '把这句话译成英文：如果明天下雨，我就待在家里。',
    'translation', NULL, NULL, NULL, NULL, 'If it rains tomorrow, I will stay at home.',
    ARRAY[
      'If it rains tomorrow, I will stay at home.',
      'If it rains tomorrow, I''ll stay at home.',
      'I will stay at home if it rains tomorrow.'
    ]::text[],
    '主将从现：if 从句 **rains**；主句 **will stay**。',
    '{}'::jsonb, NULL, 'if_translation', true, 1, 9113
  ),
  (
    '把这句话译成英文：如果你努力学习，你就会成功。',
    'translation', NULL, NULL, NULL, NULL, 'If you study hard, you will succeed.',
    ARRAY[
      'If you study hard, you will succeed.',
      'If you work hard, you will succeed.',
      'You will succeed if you study hard.'
    ]::text[],
    'if + 一般现在 study/work hard；主句 **will succeed**。',
    '{}'::jsonb, NULL, 'if_translation', true, 2, 9114
  ),
  (
    '把这句话译成英文：除非你现在出发，否则你会迟到的。',
    'translation', NULL, NULL, NULL, NULL, 'Unless you leave now, you will be late.',
    ARRAY[
      'Unless you leave now, you will be late.',
      'If you don''t leave now, you will be late.',
      'You will be late unless you leave now.',
      'You will be late if you don''t leave now.'
    ]::text[],
    'Unless = If ... not；从句一般现在，主句 will。',
    '{}'::jsonb, NULL, 'unless_translation', true, 3, 9115
  )
) AS q(stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
       accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
       difficulty, sort_order);


-- =============== g8.18 · should (建议 / 推断) ===============
DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.18')
  AND sort_order BETWEEN 9100 AND 9199;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.18')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  -- ─── 4 MCQs ───
  (
    'You should ___ more vegetables; they are good for your health.',
    'mcq', 'eat', 'eats', 'eating', 'to eat', 'A',
    NULL::text[],
    'should + **动词原形** → eat。',
    '{}'::jsonb, NULL, 'should_advice', false, 1, 9100
  ),
  (
    'Students ___ listen to the teacher carefully in class.',
    'mcq', 'should', 'shoulds', 'shoulding', 'to should', 'A',
    NULL::text[],
    'should 是情态动词，无人称变化，直接 + 原形 → **should listen**。',
    '{}'::jsonb, NULL, 'should_modal', false, 1, 9101
  ),
  (
    'You look pale. You ___ go to see a doctor and ___ stay up so late.',
    'mcq', 'should / shouldn''t', 'should / should', 'shouldn''t / should', 'should not / should', 'A',
    NULL::text[],
    '建议肯定 → **should**；建议否定 → **shouldn''t**。',
    '{}'::jsonb, NULL, 'should_negative', false, 3, 9102
  ),
  (
    '— I failed the math test again.  — Don''t worry. You ___ ask Mr. Li for help; he is a very patient teacher.',
    'mcq', 'must', 'can', 'should', 'will', 'C',
    NULL::text[],
    '提建议用 **should**（应该）；must 太强（必须），will 是将来，can 是能力/许可。',
    '{}'::jsonb, NULL, 'should_advice_context', false, 3, 9103
  ),
  -- ─── 3 fills ───
  (
    'You ____ (should/must) brush your teeth twice a day.',
    'fill', NULL, NULL, NULL, NULL, 'should',
    ARRAY['should']::text[],
    '给建议（应该）用 **should**，比 must 更礼貌。',
    '{}'::jsonb, NULL, 'should_basic', false, 1, 9104
  ),
  (
    'It''s very cold outside. You ____ (should) wear a warm coat.',
    'fill', NULL, NULL, NULL, NULL, 'should',
    ARRAY['should']::text[],
    '建议穿衣 → **should**。',
    '{}'::jsonb, NULL, 'should_advice', false, 2, 9105
  ),
  (
    'You look very tired. I think you ____ (should not) work so hard.',
    'fill', NULL, NULL, NULL, NULL, 'shouldn''t',
    ARRAY['shouldn''t', 'should not']::text[],
    '建议否定 → **shouldn''t / should not** + 原形。',
    '{}'::jsonb, NULL, 'should_negative', false, 3, 9106
  ),
  -- ─── 3 corrections ───
  (
    '改错： You should to drink more water every day.',
    'correction', NULL, NULL, NULL, NULL, 'You should drink more water every day.',
    ARRAY['You should drink more water every day.']::text[],
    'should 后接**动词原形**，不加 to → drink。',
    '{}'::jsonb, NULL, 'should_no_to', true, 1, 9107
  ),
  (
    '改错： He shoulds finish his homework before watching TV.',
    'correction', NULL, NULL, NULL, NULL, 'He should finish his homework before watching TV.',
    ARRAY['He should finish his homework before watching TV.']::text[],
    'should 是情态动词，**没有三单 -s**，主语 He 也用 should。',
    '{}'::jsonb, NULL, 'should_no_s', true, 2, 9108
  ),
  (
    '改错： Students don''t should bring their mobile phones to school.',
    'correction', NULL, NULL, NULL, NULL, 'Students shouldn''t bring their mobile phones to school.',
    ARRAY['Students shouldn''t bring their mobile phones to school.', 'Students should not bring their mobile phones to school.']::text[],
    'should 的否定是 **shouldn''t**（不用 don''t）。',
    '{}'::jsonb, NULL, 'should_negative_correction', true, 3, 9109
  ),
  -- ─── 3 transforms ───
  (
    '用 should 提建议： Drink more water.',
    'transform', NULL, NULL, NULL, NULL, 'You should drink more water.',
    ARRAY['You should drink more water.']::text[],
    '祈使句改建议：**You should** + 原形 drink。',
    '{}'::jsonb, NULL, 'should_transform', true, 1, 9110
  ),
  (
    '改写为否定句： You should stay up late.',
    'transform', NULL, NULL, NULL, NULL, 'You shouldn''t stay up late.',
    ARRAY['You shouldn''t stay up late.', 'You should not stay up late.']::text[],
    'should 否定 → **shouldn''t**。',
    '{}'::jsonb, NULL, 'should_negative_transform', true, 2, 9111
  ),
  (
    '用 should 改写： It''s important for you to be on time.',
    'transform', NULL, NULL, NULL, NULL, 'You should be on time.',
    ARRAY['You should be on time.', 'You should always be on time.']::text[],
    'It''s important for sb. to do = sb. should do。',
    '{}'::jsonb, NULL, 'should_transform', true, 3, 9112
  ),
  -- ─── 3 translations ───
  (
    '把这句话译成英文：你应该早点睡觉。',
    'translation', NULL, NULL, NULL, NULL, 'You should go to bed earlier.',
    ARRAY[
      'You should go to bed earlier.',
      'You should go to bed early.',
      'You should sleep earlier.'
    ]::text[],
    'should + **原形** → go to bed earlier。',
    '{}'::jsonb, NULL, 'should_translation', true, 1, 9113
  ),
  (
    '把这句话译成英文：你不应该对父母撒谎。',
    'translation', NULL, NULL, NULL, NULL, 'You shouldn''t lie to your parents.',
    ARRAY[
      'You shouldn''t lie to your parents.',
      'You should not lie to your parents.',
      'You shouldn''t tell lies to your parents.'
    ]::text[],
    'shouldn''t + **原形** → lie / tell lies。',
    '{}'::jsonb, NULL, 'should_negative_translation', true, 2, 9114
  ),
  (
    '把这句话译成英文：如果你想保持健康，你应该多锻炼并少吃垃圾食品。',
    'translation', NULL, NULL, NULL, NULL, 'If you want to keep healthy, you should exercise more and eat less junk food.',
    ARRAY[
      'If you want to keep healthy, you should exercise more and eat less junk food.',
      'If you want to stay healthy, you should do more exercise and eat less junk food.',
      'If you want to be healthy, you should exercise more and eat less junk food.'
    ]::text[],
    'if 从句一般现在；主句 **should + 原形** exercise / eat。',
    '{}'::jsonb, NULL, 'should_translation_complex', true, 3, 9115
  )
) AS q(stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
       accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
       difficulty, sort_order);


-- =============== g8.19 · have to / must ===============
DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.19')
  AND sort_order BETWEEN 9100 AND 9199;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.19')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  -- ─── 4 MCQs ───
  (
    'I ___ get up early every day because school starts at 7:30.',
    'mcq', 'have to', 'has to', 'must to', 'having to', 'A',
    NULL::text[],
    '主语 I → **have to** + 原形 get up。',
    '{}'::jsonb, NULL, 'have_to_basic', false, 1, 9100
  ),
  (
    'You ___ finish your homework before you go to bed.',
    'mcq', 'must', 'musts', 'must to', 'have must', 'A',
    NULL::text[],
    'must 是情态动词，直接接**原形** finish。',
    '{}'::jsonb, NULL, 'must_basic', false, 1, 9101
  ),
  (
    'Tomorrow is Sunday, so I ___ get up early. I can sleep in.',
    'mcq', 'mustn''t', 'don''t have to', 'must not', 'haven''t to', 'B',
    NULL::text[],
    'mustn''t = **禁止**（不许）；don''t have to = **没必要**。这里语境是 没必要早起 → **don''t have to**。',
    '{}'::jsonb, NULL, 'must_vs_have_to_negative', false, 3, 9102
  ),
  (
    'Last weekend my brother ___ stay at school because he had extra training.',
    'mcq', 'must', 'has to', 'had to', 'must to', 'C',
    NULL::text[],
    'must **没有过去式**，过去的「必须」用 **had to**。',
    '{}'::jsonb, NULL, 'had_to_past', false, 3, 9103
  ),
  -- ─── 3 fills ───
  (
    'My mom ____ (have to) work on Saturdays this month.',
    'fill', NULL, NULL, NULL, NULL, 'has to',
    ARRAY['has to']::text[],
    '主语 My mom 三单 → **has to** + 原形。',
    '{}'::jsonb, NULL, 'have_to_third_person', false, 1, 9104
  ),
  (
    'You ____ (must) be quiet in the library.',
    'fill', NULL, NULL, NULL, NULL, 'must',
    ARRAY['must']::text[],
    'must + 原形 be → **must**（语气强）。',
    '{}'::jsonb, NULL, 'must_basic', false, 2, 9105
  ),
  (
    'Yesterday I ____ (have to) help my mother with the housework all afternoon.',
    'fill', NULL, NULL, NULL, NULL, 'had to',
    ARRAY['had to']::text[],
    '过去的「必须」→ **had to**（must 没有过去式）。',
    '{}'::jsonb, NULL, 'had_to_past', false, 3, 9106
  ),
  -- ─── 3 corrections ───
  (
    '改错： She must to go to school by bike every day.',
    'correction', NULL, NULL, NULL, NULL, 'She must go to school by bike every day.',
    ARRAY['She must go to school by bike every day.', 'She has to go to school by bike every day.']::text[],
    'must 后**不加 to**；或者改为 has to + 原形。',
    '{}'::jsonb, NULL, 'must_no_to', true, 1, 9107
  ),
  (
    '改错： He don''t have to wear a school uniform on Saturdays.',
    'correction', NULL, NULL, NULL, NULL, 'He doesn''t have to wear a school uniform on Saturdays.',
    ARRAY['He doesn''t have to wear a school uniform on Saturdays.']::text[],
    '主语 He 三单 → **doesn''t** have to。',
    '{}'::jsonb, NULL, 'have_to_negative', true, 2, 9108
  ),
  (
    '改错： Last Sunday I must stay at home because I had a bad cold.',
    'correction', NULL, NULL, NULL, NULL, 'Last Sunday I had to stay at home because I had a bad cold.',
    ARRAY['Last Sunday I had to stay at home because I had a bad cold.']::text[],
    'must **无过去式**，过去「必须」用 **had to**。',
    '{}'::jsonb, NULL, 'had_to_past_correction', true, 3, 9109
  ),
  -- ─── 3 transforms ───
  (
    '用 have to 改写： It is necessary for me to study hard.',
    'transform', NULL, NULL, NULL, NULL, 'I have to study hard.',
    ARRAY['I have to study hard.', 'I must study hard.']::text[],
    'It is necessary for sb. to do = sb. **have to / must** do。',
    '{}'::jsonb, NULL, 'have_to_transform', true, 1, 9110
  ),
  (
    '改写为否定句： She has to clean the classroom today.',
    'transform', NULL, NULL, NULL, NULL, 'She doesn''t have to clean the classroom today.',
    ARRAY['She doesn''t have to clean the classroom today.', 'She does not have to clean the classroom today.']::text[],
    'has to 的否定：**doesn''t have to**。',
    '{}'::jsonb, NULL, 'have_to_negative_transform', true, 2, 9111
  ),
  (
    '改为过去式： He must take care of his little brother.',
    'transform', NULL, NULL, NULL, NULL, 'He had to take care of his little brother.',
    ARRAY['He had to take care of his little brother.']::text[],
    'must → 过去用 **had to**。',
    '{}'::jsonb, NULL, 'had_to_past_transform', true, 3, 9112
  ),
  -- ─── 3 translations ───
  (
    '把这句话译成英文：我必须努力学习。',
    'translation', NULL, NULL, NULL, NULL, 'I must study hard.',
    ARRAY[
      'I must study hard.',
      'I have to study hard.',
      'I must work hard.'
    ]::text[],
    'must / have to + **原形** → study hard。',
    '{}'::jsonb, NULL, 'must_translation', true, 1, 9113
  ),
  (
    '把这句话译成英文：他周末不必上学。',
    'translation', NULL, NULL, NULL, NULL, 'He doesn''t have to go to school on weekends.',
    ARRAY[
      'He doesn''t have to go to school on weekends.',
      'He does not have to go to school on weekends.',
      'He doesn''t need to go to school on weekends.'
    ]::text[],
    '「不必」→ **doesn''t have to**（不是 mustn''t，mustn''t 是禁止）。',
    '{}'::jsonb, NULL, 'dont_have_to_translation', true, 2, 9114
  ),
  (
    '把这句话译成英文：昨天因为下雨，我不得不待在家里。',
    'translation', NULL, NULL, NULL, NULL, 'Yesterday I had to stay at home because it rained.',
    ARRAY[
      'Yesterday I had to stay at home because it rained.',
      'I had to stay at home yesterday because it rained.',
      'Yesterday I had to stay at home because of the rain.'
    ]::text[],
    '过去「不得不」→ **had to** + 原形 stay。',
    '{}'::jsonb, NULL, 'had_to_translation', true, 3, 9115
  )
) AS q(stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
       accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
       difficulty, sort_order);


-- =============== g8.20 · could / would 礼貌请求 ===============
DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.20')
  AND sort_order BETWEEN 9100 AND 9199;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.20')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  -- ─── 4 MCQs ───
  (
    '— Could you ___ me the salt, please?  — Sure, here you are.',
    'mcq', 'pass', 'passes', 'passing', 'to pass', 'A',
    NULL::text[],
    'Could you + **动词原形** → pass。',
    '{}'::jsonb, NULL, 'could_request', false, 1, 9100
  ),
  (
    '— ___ you like to come to my party?  — I''d love to.',
    'mcq', 'Could', 'Would', 'Should', 'May', 'B',
    NULL::text[],
    '邀请固定句型 **Would you like to** + 原形。',
    '{}'::jsonb, NULL, 'would_you_like', false, 1, 9101
  ),
  (
    '— Excuse me. Could you ___ me how to get to the train station?  — Sorry, I''m a stranger here.',
    'mcq', 'tell', 'tells', 'telling', 'told', 'A',
    NULL::text[],
    'Could you + **动词原形** → tell。',
    '{}'::jsonb, NULL, 'could_request_polite', false, 3, 9102
  ),
  (
    '— ___ I borrow your dictionary for a moment?  — Of course you ___.',
    'mcq', 'May / can', 'Could / could', 'Could / can', 'Must / can', 'C',
    NULL::text[],
    'Could I 礼貌请求；肯定回答常用 **can / sure / certainly**，一般不重复 could。',
    '{}'::jsonb, NULL, 'could_request_response', false, 3, 9103
  ),
  -- ─── 3 fills ───
  (
    'Could you please ____ (open) the window? It''s a bit hot.',
    'fill', NULL, NULL, NULL, NULL, 'open',
    ARRAY['open']::text[],
    'Could you (please) + **原形** → open。',
    '{}'::jsonb, NULL, 'could_polite', false, 1, 9104
  ),
  (
    'Would you mind ____ (turn) down the music?',
    'fill', NULL, NULL, NULL, NULL, 'turning',
    ARRAY['turning']::text[],
    'Would you mind + **doing** → turning。',
    '{}'::jsonb, NULL, 'would_you_mind_doing', false, 2, 9105
  ),
  (
    '— ____ (could/may) I use your phone, please?  — Sure, here it is.',
    'fill', NULL, NULL, NULL, NULL, 'Could',
    ARRAY['Could', 'May']::text[],
    '礼貌请求用 **Could / May** + I + 原形。',
    '{}'::jsonb, NULL, 'could_request_self', false, 3, 9106
  ),
  -- ─── 3 corrections ───
  (
    '改错： Could you helping me with this problem, please?',
    'correction', NULL, NULL, NULL, NULL, 'Could you help me with this problem, please?',
    ARRAY['Could you help me with this problem, please?']::text[],
    'Could you + **动词原形** → help（不是 helping）。',
    '{}'::jsonb, NULL, 'could_request_correction', true, 1, 9107
  ),
  (
    '改错： Would you like having a cup of tea?',
    'correction', NULL, NULL, NULL, NULL, 'Would you like to have a cup of tea?',
    ARRAY['Would you like to have a cup of tea?', 'Would you like a cup of tea?']::text[],
    'Would you like + **to do** → to have；或直接 + 名词 a cup of tea。',
    '{}'::jsonb, NULL, 'would_you_like_correction', true, 2, 9108
  ),
  (
    '改错： Could you tells me where the bus station is?',
    'correction', NULL, NULL, NULL, NULL, 'Could you tell me where the bus station is?',
    ARRAY['Could you tell me where the bus station is?']::text[],
    'Could you + **原形** tell（情态动词后无三单 -s）；宾语从句用陈述语序 where the bus station **is**。',
    '{}'::jsonb, NULL, 'could_request_object_clause', true, 3, 9109
  ),
  -- ─── 3 transforms ───
  (
    '用 Could you 改写为礼貌请求： Open the door.',
    'transform', NULL, NULL, NULL, NULL, 'Could you open the door, please?',
    ARRAY['Could you open the door, please?', 'Could you please open the door?']::text[],
    'Could you + 原形 + please？= 礼貌请求。',
    '{}'::jsonb, NULL, 'could_polite_transform', true, 1, 9110
  ),
  (
    '用 Would you mind 改写： Please don''t make so much noise.',
    'transform', NULL, NULL, NULL, NULL, 'Would you mind not making so much noise?',
    ARRAY['Would you mind not making so much noise?']::text[],
    'Would you mind + **not + doing** = 请别...',
    '{}'::jsonb, NULL, 'would_you_mind_negative', true, 2, 9111
  ),
  (
    '用 Would you like 改写： Do you want to join us for dinner?',
    'transform', NULL, NULL, NULL, NULL, 'Would you like to join us for dinner?',
    ARRAY['Would you like to join us for dinner?']::text[],
    'Would you like + **to do**（比 Do you want 更委婉）→ to join。',
    '{}'::jsonb, NULL, 'would_you_like_transform', true, 3, 9112
  ),
  -- ─── 3 translations ───
  (
    '把这句话译成英文：你能借我一支铅笔吗？',
    'translation', NULL, NULL, NULL, NULL, 'Could you lend me a pencil?',
    ARRAY[
      'Could you lend me a pencil?',
      'Could you please lend me a pencil?',
      'Would you lend me a pencil?'
    ]::text[],
    '礼貌请求用 **Could you / Would you** + 动词原形。',
    '{}'::jsonb, NULL, 'polite_request_translation', true, 1, 9113
  ),
  (
    '把这句话译成英文：请问你能告诉我现在几点了吗？',
    'translation', NULL, NULL, NULL, NULL, 'Could you tell me what time it is now?',
    ARRAY[
      'Could you tell me what time it is now?',
      'Could you tell me the time, please?',
      'Could you please tell me what time it is?',
      'Excuse me, could you tell me what time it is?'
    ]::text[],
    'Could you tell me + **宾语从句**（陈述语序 what time it is）。',
    '{}'::jsonb, NULL, 'could_object_clause_translation', true, 2, 9114
  ),
  (
    '把这句话译成英文：你介意把音量调小一点吗？',
    'translation', NULL, NULL, NULL, NULL, 'Would you mind turning down the volume?',
    ARRAY[
      'Would you mind turning down the volume?',
      'Would you mind turning the volume down?',
      'Could you turn down the volume, please?',
      'Would you mind lowering the volume?'
    ]::text[],
    'Would you mind + **doing** → turning down；或用 Could you + 原形。',
    '{}'::jsonb, NULL, 'would_you_mind_translation', true, 3, 9115
  )
) AS q(stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
       accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
       difficulty, sort_order);


-- =============== g8.21 · when / while 时间状语从句 ===============
DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.21')
  AND sort_order BETWEEN 9100 AND 9199;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.21')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  -- ─── 4 MCQs ───
  (
    'I was reading a book ___ my mother came in.',
    'mcq', 'when', 'while', 'before', 'after', 'A',
    NULL::text[],
    '一个动作正在进行（reading）时另一个**短暂动作**发生（came in） → 用 **when**。',
    '{}'::jsonb, NULL, 'when_clause', false, 1, 9100
  ),
  (
    '___ I was doing my homework, my little brother was watching TV.',
    'mcq', 'When', 'While', 'After', 'Before', 'B',
    NULL::text[],
    '两个**同时进行**的动作（doing / watching） → 通常用 **While**。',
    '{}'::jsonb, NULL, 'while_simultaneous', false, 1, 9101
  ),
  (
    'Yesterday afternoon, when the heavy rain ___ , we ___ a basketball game on the playground.',
    'mcq', 'started / were playing', 'was starting / played', 'started / played', 'starts / are playing', 'A',
    NULL::text[],
    'when 引导的**短暂动作**用一般过去 started；正在进行的动作 → **过去进行时** were playing。',
    '{}'::jsonb, NULL, 'when_past_continuous', false, 3, 9102
  ),
  (
    'My grandma fell asleep ___ she was watching the boring TV show.',
    'mcq', 'when', 'while', 'before', 'as soon as', 'B',
    NULL::text[],
    'was watching 是**正在进行的延续动作** → 用 **while**（在...期间）。',
    '{}'::jsonb, NULL, 'while_continuous', false, 3, 9103
  ),
  -- ─── 3 fills ───
  (
    '____ (when/while) I was young, I lived in a small village.',
    'fill', NULL, NULL, NULL, NULL, 'When',
    ARRAY['When']::text[],
    '「小时候」通常用 **When I was young**（固定搭配）。',
    '{}'::jsonb, NULL, 'when_basic', false, 1, 9104
  ),
  (
    'Don''t make a noise ____ (when/while) your father is sleeping.',
    'fill', NULL, NULL, NULL, NULL, 'while',
    ARRAY['while']::text[],
    'is sleeping 是**正在进行的延续动作** → **while**。',
    '{}'::jsonb, NULL, 'while_continuous', false, 2, 9105
  ),
  (
    'I ____ (cook) dinner when the phone rang.',
    'fill', NULL, NULL, NULL, NULL, 'was cooking',
    ARRAY['was cooking']::text[],
    'when the phone rang（短暂动作）时正在进行的动作 → **过去进行时** was cooking。',
    '{}'::jsonb, NULL, 'past_continuous_when', false, 3, 9106
  ),
  -- ─── 3 corrections ───
  (
    '改错： While I was young, I lived in a small village in the north.',
    'correction', NULL, NULL, NULL, NULL, 'When I was young, I lived in a small village in the north.',
    ARRAY['When I was young, I lived in a small village in the north.']::text[],
    '「小时候」是**短期状态**（点时间）→ 用 **When**，不是 While。',
    '{}'::jsonb, NULL, 'when_vs_while_correction', true, 1, 9107
  ),
  (
    '改错： When I am doing my homework last night, the lights suddenly went out.',
    'correction', NULL, NULL, NULL, NULL, 'When I was doing my homework last night, the lights suddenly went out.',
    ARRAY['When I was doing my homework last night, the lights suddenly went out.', 'While I was doing my homework last night, the lights suddenly went out.']::text[],
    'last night → 过去；am doing → **was doing**（过去进行时）。',
    '{}'::jsonb, NULL, 'past_continuous_correction', true, 2, 9108
  ),
  (
    '改错： When my mother was cooking dinner, my father reads a newspaper.',
    'correction', NULL, NULL, NULL, NULL, 'While my mother was cooking dinner, my father was reading a newspaper.',
    ARRAY['While my mother was cooking dinner, my father was reading a newspaper.', 'When my mother was cooking dinner, my father was reading a newspaper.']::text[],
    '两个**同时进行**的动作 → 优先用 **While**；reads → **was reading**（过去进行时）。',
    '{}'::jsonb, NULL, 'while_two_continuous', true, 3, 9109
  ),
  -- ─── 3 transforms ───
  (
    '用 when 合并： I was walking home. I met an old friend.',
    'transform', NULL, NULL, NULL, NULL, 'When I was walking home, I met an old friend.',
    ARRAY['When I was walking home, I met an old friend.', 'I was walking home when I met an old friend.']::text[],
    '过去进行 + when + 一般过去（短暂动作）。',
    '{}'::jsonb, NULL, 'when_join', true, 1, 9110
  ),
  (
    '用 while 合并： My sister was reading. I was playing the piano. (同时发生)',
    'transform', NULL, NULL, NULL, NULL, 'While my sister was reading, I was playing the piano.',
    ARRAY['While my sister was reading, I was playing the piano.', 'My sister was reading while I was playing the piano.']::text[],
    '两个同时进行 → **While** + 过去进行；主句也用过去进行。',
    '{}'::jsonb, NULL, 'while_two_continuous', true, 2, 9111
  ),
  (
    '用 when 改写： I was taking a shower. The doorbell rang at that moment.',
    'transform', NULL, NULL, NULL, NULL, 'I was taking a shower when the doorbell rang.',
    ARRAY['I was taking a shower when the doorbell rang.', 'When I was taking a shower, the doorbell rang.']::text[],
    '过去进行 + **when** + 短暂动作 rang。',
    '{}'::jsonb, NULL, 'when_short_action', true, 3, 9112
  ),
  -- ─── 3 translations ───
  (
    '把这句话译成英文：当我小的时候，我喜欢画画。',
    'translation', NULL, NULL, NULL, NULL, 'When I was young, I liked drawing.',
    ARRAY[
      'When I was young, I liked drawing.',
      'When I was a child, I liked drawing.',
      'When I was little, I liked drawing.',
      'When I was young, I liked painting.'
    ]::text[],
    '「小时候」→ **When I was young / a child / little**。',
    '{}'::jsonb, NULL, 'when_translation', true, 1, 9113
  ),
  (
    '把这句话译成英文：当我妈妈做饭的时候，请不要打扰她。',
    'translation', NULL, NULL, NULL, NULL, 'Please don''t bother my mother while she is cooking.',
    ARRAY[
      'Please don''t bother my mother while she is cooking.',
      'Please don''t disturb my mother while she is cooking.',
      'Don''t bother my mother while she is cooking, please.',
      'Don''t disturb my mom while she is cooking.'
    ]::text[],
    '正在进行的延续动作 → **while** + 现在进行 is cooking。',
    '{}'::jsonb, NULL, 'while_translation', true, 2, 9114
  ),
  (
    '把这句话译成英文：昨晚八点我正在洗澡的时候电话响了。',
    'translation', NULL, NULL, NULL, NULL, 'I was taking a shower at 8 last night when the phone rang.',
    ARRAY[
      'I was taking a shower at 8 last night when the phone rang.',
      'I was taking a shower when the phone rang at 8 last night.',
      'When the phone rang at 8 last night, I was taking a shower.',
      'At 8 last night I was taking a shower when the phone rang.'
    ]::text[],
    '过去进行（was taking）+ **when** + 一般过去（rang）。',
    '{}'::jsonb, NULL, 'when_past_continuous_tr', true, 3, 9115
  )
) AS q(stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
       accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
       difficulty, sort_order);


-- =====================================================================
-- Sanity check: verify all 10 G8 points each have 16 new questions
-- =====================================================================
DO $$
DECLARE
  v_codes text[] := ARRAY['g8.12','g8.13','g8.14','g8.15','g8.16','g8.17','g8.18','g8.19','g8.20','g8.21'];
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
  RAISE NOTICE 'Adaptive expansion verified for 10 G8 points (batch B): 160 new questions seeded.';
END $$;

-- =====================================================================
-- END · Batch B adaptive question bank expansion
-- =====================================================================
