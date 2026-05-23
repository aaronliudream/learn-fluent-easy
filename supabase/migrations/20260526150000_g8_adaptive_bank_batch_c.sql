-- =====================================================================
-- Adaptive question bank expansion · BATCH C · 9 G8 grammar points
-- =====================================================================
-- Adds 16 extra adaptive questions to each of the following points so the
-- 5-level adaptive mastery test can drop to EASIER on a wrong answer and
-- raise to HARDER on a correct one.
--
--   g8.22  过去进行时
--   g8.23  过去进行时 vs 一般过去时
--   g8.24  现在完成时 (have done)
--   g8.25  现在完成时 vs 一般过去时
--   g8.26  宾语从句 (object clauses)
--   g8.27  被动语态 (passive voice)
--   g8.28  定语从句 (who/which/that)
--   g8.29  现在完成进行时 (have been doing)
--   g8.30  虚拟语气入门 (If I were you / I wish)
--
-- Per point (16 questions, sort_order 9100-9115):
--   • MCQ          × 4  (2 × d=1, 2 × d=3)
--   • Fill         × 3  (d=1, d=2, d=3)
--   • Correction   × 3  (d=1, d=2, d=3)
--   • Transform    × 3  (d=1, d=2, d=3)
--   • Translation  × 3  (d=1, d=2, d=3)
--
-- Total new rows: 9 × 16 = 144.
-- Idempotent: scoped to sort_order 9100-9199 per point.
-- =====================================================================


-- =============== g8.22 · 过去进行时 ===============
DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.22')
  AND sort_order BETWEEN 9100 AND 9199;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.22')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  -- 4 MCQs (2 easy, 2 hard)
  (
    'At 8 last night, I ___ my homework in my bedroom.',
    'mcq', 'do', 'did', 'was doing', 'were doing', 'C',
    NULL::text[],
    'at 8 last night → 过去某一刻；主语 I → **was doing**。',
    '{}'::jsonb, NULL, 'past_continuous', false, 1, 9100
  ),
  (
    'My parents ___ TV when I came home yesterday.',
    'mcq', 'watch', 'watched', 'are watching', 'were watching', 'D',
    NULL::text[],
    '过去某动作进行时另一动作发生：主句用 **were watching**（主语复数）。',
    '{}'::jsonb, NULL, 'past_continuous', false, 1, 9101
  ),
  (
    'While Lily ___ a shower, the phone ___ three times, but no one ___ it.',
    'mcq', 'took / rang / answered', 'was taking / rang / answered', 'was taking / was ringing / answered', 'took / was ringing / was answering', 'B',
    NULL::text[],
    'While + 过去进行 (**was taking**) 表背景；rang 是短促动作用一般过去；answer 也是过去 → **answered**。',
    '{}'::jsonb, NULL, 'past_continuous_vs_simple', false, 3, 9102
  ),
  (
    'This time last week, we ___ on the beach in Sanya, not ___ in the classroom.',
    'mcq', 'were lying / sitting', 'lay / sitting', 'were lying / were sitting', 'lay / sat', 'C',
    NULL::text[],
    'this time last week → 过去某时间点的进行状态；两个动作并列都用过去进行：**were lying / were sitting**。',
    '{}'::jsonb, '过去进行时常表那时正在……的动作。', 'past_continuous', false, 3, 9103
  ),

  -- 3 fills (d=1,2,3)
  (
    'When the teacher came in, the students ____ (talk) loudly.',
    'fill', NULL, NULL, NULL, NULL, 'were talking',
    ARRAY['were talking']::text[],
    '主句 came 是过去；从句表当时正在进行 → **were talking**。',
    '{}'::jsonb, NULL, 'past_continuous', false, 1, 9104
  ),
  (
    'From 7 to 9 yesterday evening, my father ____ (read) the newspaper in the living room.',
    'fill', NULL, NULL, NULL, NULL, 'was reading',
    ARRAY['was reading']::text[],
    'from 7 to 9 yesterday evening → 过去一段时间内持续 → **was reading**。',
    '{}'::jsonb, NULL, 'past_continuous', false, 2, 9105
  ),
  (
    'While I ____ (cook) dinner, my little sister ____ (draw) pictures on the wall.',
    'fill', NULL, NULL, NULL, NULL, 'was cooking / was drawing',
    ARRAY[
      'was cooking / was drawing',
      'was cooking/was drawing',
      'was cooking, was drawing'
    ]::text[],
    'while 两端的动作都是过去同时进行 → 都用过去进行时。',
    '{}'::jsonb, NULL, 'past_continuous', false, 3, 9106
  ),

  -- 3 corrections (d=1,2,3)
  (
    '改错： She was watch TV at 9 last night.',
    'correction', NULL, NULL, NULL, NULL, 'She was watching TV at 9 last night.',
    ARRAY['She was watching TV at 9 last night.']::text[],
    '过去进行时结构：was/were + **V-ing** → was **watching**。',
    '{}'::jsonb, NULL, 'past_continuous', true, 1, 9107
  ),
  (
    '改错： They were play football when it started to rain.',
    'correction', NULL, NULL, NULL, NULL, 'They were playing football when it started to rain.',
    ARRAY['They were playing football when it started to rain.']::text[],
    'were 后必须用 **V-ing**：play → **playing**。',
    '{}'::jsonb, NULL, 'past_continuous', true, 2, 9108
  ),
  (
    '改错： While we were having dinner, the lights was going out suddenly.',
    'correction', NULL, NULL, NULL, NULL, 'While we were having dinner, the lights went out suddenly.',
    ARRAY['While we were having dinner, the lights went out suddenly.']::text[],
    '两处错：① lights 是复数 → were (不是 was)；② 突然短暂动作用一般过去 → **went out**，不用进行时。',
    '{}'::jsonb, NULL, 'past_continuous_vs_simple', true, 3, 9109
  ),

  -- 3 transforms (d=1,2,3)
  (
    '改写为过去进行时（提示：at 8 last night）： I do my homework.',
    'transform', NULL, NULL, NULL, NULL, 'I was doing my homework at 8 last night.',
    ARRAY[
      'I was doing my homework at 8 last night.',
      'At 8 last night, I was doing my homework.'
    ]::text[],
    'was + V-ing：do → **was doing**；加 at 8 last night。',
    '{}'::jsonb, NULL, 'past_continuous_transform', true, 1, 9110
  ),
  (
    '改写为否定句： The boys were swimming in the river at noon.',
    'transform', NULL, NULL, NULL, NULL, 'The boys were not swimming in the river at noon.',
    ARRAY[
      'The boys were not swimming in the river at noon.',
      'The boys weren''t swimming in the river at noon.'
    ]::text[],
    '过去进行时否定：were + **not** + V-ing。',
    '{}'::jsonb, NULL, 'past_continuous_negative', true, 2, 9111
  ),
  (
    '对划线部分提问： Mary was reading [a story book] at 9 last night.',
    'transform', NULL, NULL, NULL, NULL, 'What was Mary reading at 9 last night?',
    ARRAY[
      'What was Mary reading at 9 last night?'
    ]::text[],
    '对物提问用 What；保留过去进行结构 was + V-ing。',
    '{}'::jsonb, NULL, 'past_continuous_question', true, 3, 9112
  ),

  -- 3 translations (d=1,2,3)
  (
    '把这句话译成英文：昨天下午三点我正在打篮球。',
    'translation', NULL, NULL, NULL, NULL, 'I was playing basketball at 3 yesterday afternoon.',
    ARRAY[
      'I was playing basketball at 3 yesterday afternoon.',
      'At 3 yesterday afternoon, I was playing basketball.',
      'I was playing basketball at three yesterday afternoon.'
    ]::text[],
    '过去某时刻正在进行 → was + V-ing。',
    '{}'::jsonb, NULL, 'past_continuous_translation', true, 1, 9113
  ),
  (
    '把这句话译成英文：当老师进来时，我们正在大声讨论。',
    'translation', NULL, NULL, NULL, NULL, 'When the teacher came in, we were discussing loudly.',
    ARRAY[
      'When the teacher came in, we were discussing loudly.',
      'We were discussing loudly when the teacher came in.',
      'When the teacher came in, we were talking loudly.'
    ]::text[],
    'when 引导短动作（came in）+ 主句进行（**were discussing**）。',
    '{}'::jsonb, NULL, 'past_continuous_translation', true, 2, 9114
  ),
  (
    '把这句话译成英文：昨晚八点我在做作业的时候，妈妈正在厨房做饭。',
    'translation', NULL, NULL, NULL, NULL, 'At 8 last night, while I was doing my homework, my mother was cooking in the kitchen.',
    ARRAY[
      'At 8 last night, while I was doing my homework, my mother was cooking in the kitchen.',
      'While I was doing my homework at 8 last night, my mother was cooking in the kitchen.',
      'At 8 last night, I was doing my homework while my mother was cooking in the kitchen.'
    ]::text[],
    '两个动作同时在过去进行 → while + 两端都用过去进行时。',
    '{}'::jsonb, NULL, 'past_continuous_translation', true, 3, 9115
  )
) AS q(stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
       accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
       difficulty, sort_order);


-- =============== g8.23 · 过去进行时 vs 一般过去时 ===============
DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.23')
  AND sort_order BETWEEN 9100 AND 9199;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.23')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  -- 4 MCQs
  (
    'I ___ my keys while I ___ the bus.',
    'mcq', 'lost / was taking', 'was losing / took', 'lost / took', 'was losing / was taking', 'A',
    NULL::text[],
    '丢钥匙是短暂动作 → **lost**；坐车是背景持续 → **was taking**。',
    '{}'::jsonb, NULL, 'past_continuous_vs_simple', false, 1, 9100
  ),
  (
    'When the bell ___, the students ___ a test.',
    'mcq', 'rang / took', 'was ringing / were taking', 'rang / were taking', 'rang / are taking', 'C',
    NULL::text[],
    '短动作 rang（响） + 当时正在进行 **were taking**（考试中）。',
    '{}'::jsonb, NULL, 'past_continuous_vs_simple', false, 1, 9101
  ),
  (
    'A: What ___ you ___ when the earthquake ___?  B: I ___ a shower.',
    'mcq', 'were / doing / happened / was taking', 'did / do / happened / took', 'were / doing / was happening / took', 'did / doing / happened / was taking', 'A',
    NULL::text[],
    '问 那时正在做什么 用过去进行：were doing；happen 短动作 → happened；take a shower 当时进行 → was taking。',
    '{}'::jsonb, NULL, 'past_continuous_vs_simple', false, 3, 9102
  ),
  (
    'It ___ heavily all morning yesterday. Then around noon, the sun finally ___ out.',
    'mcq', 'rained / was coming', 'was raining / came', 'was raining / was coming', 'rained / came', 'B',
    NULL::text[],
    'all morning 强调持续 → **was raining**；around noon 一瞬间动作 → **came out**。',
    '{}'::jsonb, NULL, 'past_continuous_vs_simple', false, 3, 9103
  ),

  -- 3 fills
  (
    'When I ____ (call) you, you ____ (sleep).',
    'fill', NULL, NULL, NULL, NULL, 'called / were sleeping',
    ARRAY[
      'called / were sleeping',
      'called/were sleeping',
      'called, were sleeping'
    ]::text[],
    'when + 短动作（called）；主句当时正在进行（**were sleeping**）。',
    '{}'::jsonb, NULL, 'past_continuous_vs_simple', false, 1, 9104
  ),
  (
    'While my dad ____ (drive) home, he ____ (see) a traffic accident.',
    'fill', NULL, NULL, NULL, NULL, 'was driving / saw',
    ARRAY[
      'was driving / saw',
      'was driving/saw',
      'was driving, saw'
    ]::text[],
    'while + 持续动作（**was driving**）；看见是短动作 → **saw**。',
    '{}'::jsonb, NULL, 'past_continuous_vs_simple', false, 2, 9105
  ),
  (
    'Last night around 10, I ____ (read) a novel when suddenly the lights ____ (go) out and everyone ____ (scream).',
    'fill', NULL, NULL, NULL, NULL, 'was reading / went / screamed',
    ARRAY[
      'was reading / went / screamed',
      'was reading/went/screamed',
      'was reading, went, screamed'
    ]::text[],
    '背景持续 **was reading**；suddenly + 短动作 went out / screamed 用过去式。',
    '{}'::jsonb, NULL, 'past_continuous_vs_simple', false, 3, 9106
  ),

  -- 3 corrections
  (
    '改错： While I had dinner, the phone rang.',
    'correction', NULL, NULL, NULL, NULL, 'While I was having dinner, the phone rang.',
    ARRAY['While I was having dinner, the phone rang.']::text[],
    'While 引导的背景动作要用 **过去进行时**：was having dinner。',
    '{}'::jsonb, NULL, 'past_continuous_vs_simple', true, 1, 9107
  ),
  (
    '改错： When the teacher came in, we were talk about the new film.',
    'correction', NULL, NULL, NULL, NULL, 'When the teacher came in, we were talking about the new film.',
    ARRAY['When the teacher came in, we were talking about the new film.']::text[],
    'were 后必须用 **V-ing** → were **talking**。',
    '{}'::jsonb, NULL, 'past_continuous_vs_simple', true, 2, 9108
  ),
  (
    '改错： Yesterday afternoon, while my brother was doing his homework, I was watching TV when my mum came home and was telling us to set the table.',
    'correction', NULL, NULL, NULL, NULL, 'Yesterday afternoon, while my brother was doing his homework, I was watching TV when my mum came home and told us to set the table.',
    ARRAY['Yesterday afternoon, while my brother was doing his homework, I was watching TV when my mum came home and told us to set the table.']::text[],
    'mum came home（短动作）后面的 tell 也是短动作 → **told**，不是 was telling。',
    '{}'::jsonb, NULL, 'past_continuous_vs_simple', true, 3, 9109
  ),

  -- 3 transforms
  (
    '用 when 合并：(1) I was reading a book. (2) My friend knocked at the door.',
    'transform', NULL, NULL, NULL, NULL, 'I was reading a book when my friend knocked at the door.',
    ARRAY[
      'I was reading a book when my friend knocked at the door.',
      'When my friend knocked at the door, I was reading a book.'
    ]::text[],
    '背景（was reading）+ when + 短动作（knocked）。',
    '{}'::jsonb, NULL, 'past_continuous_vs_simple', true, 1, 9110
  ),
  (
    '用 while 合并：(1) Tom was playing the piano. (2) His sister was singing.',
    'transform', NULL, NULL, NULL, NULL, 'Tom was playing the piano while his sister was singing.',
    ARRAY[
      'Tom was playing the piano while his sister was singing.',
      'While his sister was singing, Tom was playing the piano.',
      'While Tom was playing the piano, his sister was singing.'
    ]::text[],
    '两个同时持续的动作 → while + 两端都用过去进行时。',
    '{}'::jsonb, NULL, 'past_continuous_vs_simple', true, 2, 9111
  ),
  (
    '改写为含 when/while 的复合句：(1) It started to rain heavily. (2) The students were having a P.E. class on the playground.',
    'transform', NULL, NULL, NULL, NULL, 'It started to rain heavily while the students were having a P.E. class on the playground.',
    ARRAY[
      'It started to rain heavily while the students were having a P.E. class on the playground.',
      'While the students were having a P.E. class on the playground, it started to rain heavily.',
      'The students were having a P.E. class on the playground when it started to rain heavily.'
    ]::text[],
    '突然短动作（started）+ 背景持续动作（were having）→ while/when 都可。',
    '{}'::jsonb, NULL, 'past_continuous_vs_simple', true, 3, 9112
  ),

  -- 3 translations
  (
    '把这句话译成英文：你给我打电话时我正在洗澡。',
    'translation', NULL, NULL, NULL, NULL, 'I was taking a shower when you called me.',
    ARRAY[
      'I was taking a shower when you called me.',
      'When you called me, I was taking a shower.',
      'I was having a shower when you called me.'
    ]::text[],
    '正在洗澡 → was taking a shower；打电话是短动作 → called。',
    '{}'::jsonb, NULL, 'past_continuous_vs_simple', true, 1, 9113
  ),
  (
    '把这句话译成英文：当我妈妈在做饭的时候，爸爸正在看报纸。',
    'translation', NULL, NULL, NULL, NULL, 'While my mother was cooking, my father was reading the newspaper.',
    ARRAY[
      'While my mother was cooking, my father was reading the newspaper.',
      'My father was reading the newspaper while my mother was cooking.',
      'While my mom was cooking, my dad was reading the newspaper.'
    ]::text[],
    '两个同时进行的动作 → while + 双过去进行。',
    '{}'::jsonb, NULL, 'past_continuous_vs_simple', true, 2, 9114
  ),
  (
    '把这句话译成英文：昨晚我在街上走着的时候，突然看见一位老朋友。',
    'translation', NULL, NULL, NULL, NULL, 'While I was walking on the street last night, I suddenly saw an old friend.',
    ARRAY[
      'While I was walking on the street last night, I suddenly saw an old friend.',
      'I was walking on the street last night when I suddenly saw an old friend.',
      'Last night, while I was walking on the street, I suddenly saw an old friend.'
    ]::text[],
    '走在街上是背景（was walking）；突然看见是短动作（saw）。',
    '{}'::jsonb, NULL, 'past_continuous_vs_simple', true, 3, 9115
  )
) AS q(stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
       accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
       difficulty, sort_order);


-- =============== g8.24 · 现在完成时 (have done) ===============
DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.24')
  AND sort_order BETWEEN 9100 AND 9199;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.24')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  -- 4 MCQs
  (
    'I ___ already ___ my homework. Can I go out now?',
    'mcq', 'have / finished', 'has / finished', 'am / finishing', 'did / finish', 'A',
    NULL::text[],
    'already 是现在完成时信号词；主语 I → **have finished**。',
    '{}'::jsonb, NULL, 'present_perfect', false, 1, 9100
  ),
  (
    'Tom ___ to Beijing twice. He loves the city very much.',
    'mcq', 'goes', 'went', 'has been', 'has gone', 'C',
    NULL::text[],
    'twice 是次数信号；have/has **been to** 表去过。注意 has gone to 表已去还没回来。',
    '{}'::jsonb, NULL, 'present_perfect_been_gone', false, 1, 9101
  ),
  (
    'A: ___ you ever ___ a four-leaf clover?  B: No, never. I ___ one in my life.',
    'mcq', 'Did / find / never saw', 'Have / found / have never seen', 'Have / find / have never seen', 'Did / found / have never seen', 'B',
    NULL::text[],
    'ever / never 是现完信号；都用 have + V-pp。find → **found**；see → **seen**。',
    '{}'::jsonb, NULL, 'present_perfect_ever_never', false, 3, 9102
  ),
  (
    'My uncle ___ in this small town since 2008, and he ___ a successful bakery here.',
    'mcq', 'lives / opens', 'has lived / has opened', 'lived / opened', 'is living / opens', 'B',
    NULL::text[],
    'since 2008 → 现完信号；两个动作都用 have/has + V-pp：**has lived / has opened**。',
    '{}'::jsonb, NULL, 'present_perfect_since', false, 3, 9103
  ),

  -- 3 fills
  (
    'I ____ (just finish) my dinner. Let''s go out for a walk.',
    'fill', NULL, NULL, NULL, NULL, 'have just finished',
    ARRAY['have just finished']::text[],
    'just 是现完信号；have + just + V-pp → **have just finished**。',
    '{}'::jsonb, NULL, 'present_perfect_just', false, 1, 9104
  ),
  (
    'She ____ (not see) her grandparents for two months.',
    'fill', NULL, NULL, NULL, NULL, 'hasn''t seen',
    ARRAY[
      'hasn''t seen',
      'has not seen'
    ]::text[],
    'for two months → 现完信号；否定 has + not + V-pp → **hasn''t seen**。',
    '{}'::jsonb, NULL, 'present_perfect_for', false, 2, 9105
  ),
  (
    'A: ____ you ever ____ (be) to a foreign country?  B: Yes, I ____ (visit) Japan twice.',
    'fill', NULL, NULL, NULL, NULL, 'Have / been / have visited',
    ARRAY[
      'Have / been / have visited',
      'Have/been/have visited',
      'Have, been, have visited'
    ]::text[],
    'ever / twice 都是现完信号；have been to + 地点；have visited + 地点 都对。',
    '{}'::jsonb, NULL, 'present_perfect_ever', false, 3, 9106
  ),

  -- 3 corrections
  (
    '改错： I have saw this movie before.',
    'correction', NULL, NULL, NULL, NULL, 'I have seen this movie before.',
    ARRAY['I have seen this movie before.']::text[],
    'have + **V-pp**：see → **seen** (不是 saw)。',
    '{}'::jsonb, NULL, 'present_perfect', true, 1, 9107
  ),
  (
    '改错： She has went to school already.',
    'correction', NULL, NULL, NULL, NULL, 'She has gone to school already.',
    ARRAY['She has gone to school already.']::text[],
    'go 的过去分词是 **gone**，不是 went。',
    '{}'::jsonb, NULL, 'present_perfect', true, 2, 9108
  ),
  (
    '改错： My brother has studied English since five years, and he have made great progress.',
    'correction', NULL, NULL, NULL, NULL, 'My brother has studied English for five years, and he has made great progress.',
    ARRAY['My brother has studied English for five years, and he has made great progress.']::text[],
    '两处错：① since + 时间点；for + 时间段 → **for** five years；② 主语 he → **has** made。',
    '{}'::jsonb, NULL, 'present_perfect_since_for', true, 3, 9109
  ),

  -- 3 transforms
  (
    '改写为现在完成时（加 already）： I clean my room.',
    'transform', NULL, NULL, NULL, NULL, 'I have already cleaned my room.',
    ARRAY[
      'I have already cleaned my room.',
      'I''ve already cleaned my room.'
    ]::text[],
    'have + already + V-pp → **have already cleaned**。',
    '{}'::jsonb, NULL, 'present_perfect_transform', true, 1, 9110
  ),
  (
    '改写为否定句： She has finished her homework.',
    'transform', NULL, NULL, NULL, NULL, 'She hasn''t finished her homework yet.',
    ARRAY[
      'She hasn''t finished her homework yet.',
      'She has not finished her homework yet.',
      'She hasn''t finished her homework.'
    ]::text[],
    '现完否定：has + not + V-pp；常加 yet（还没）。',
    '{}'::jsonb, NULL, 'present_perfect_negative', true, 2, 9111
  ),
  (
    '改写为现在完成时疑问句并作否定回答（提示：ever）： You meet a famous person.',
    'transform', NULL, NULL, NULL, NULL, 'Have you ever met a famous person? No, I haven''t.',
    ARRAY[
      'Have you ever met a famous person? No, I haven''t.',
      'Have you ever met a famous person?  No, I haven''t.',
      'Have you ever met a famous person? — No, I have not.'
    ]::text[],
    'Have + you + ever + V-pp？否定回答 No, I haven''t。',
    '{}'::jsonb, NULL, 'present_perfect_question', true, 3, 9112
  ),

  -- 3 translations
  (
    '把这句话译成英文：我已经吃过午饭了。',
    'translation', NULL, NULL, NULL, NULL, 'I have already had lunch.',
    ARRAY[
      'I have already had lunch.',
      'I''ve already had lunch.',
      'I have already eaten lunch.'
    ]::text[],
    '已经 = already + have + V-pp。',
    '{}'::jsonb, NULL, 'present_perfect_translation', true, 1, 9113
  ),
  (
    '把这句话译成英文：他在这家公司工作五年了。',
    'translation', NULL, NULL, NULL, NULL, 'He has worked in this company for five years.',
    ARRAY[
      'He has worked in this company for five years.',
      'He has worked at this company for five years.',
      'He has been working in this company for five years.'
    ]::text[],
    'for + 时间段（五年）→ have/has + V-pp。',
    '{}'::jsonb, NULL, 'present_perfect_translation', true, 2, 9114
  ),
  (
    '把这句话译成英文：你曾经爬过长城吗？还没有，但是我很想去。',
    'translation', NULL, NULL, NULL, NULL, 'Have you ever climbed the Great Wall? Not yet, but I would love to.',
    ARRAY[
      'Have you ever climbed the Great Wall? Not yet, but I would love to.',
      'Have you ever climbed the Great Wall? Not yet, but I''d love to.',
      'Have you ever climbed the Great Wall? No, but I really want to.'
    ]::text[],
    'ever + V-pp 表经历；Not yet 表还没。',
    '{}'::jsonb, NULL, 'present_perfect_translation', true, 3, 9115
  )
) AS q(stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
       accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
       difficulty, sort_order);


-- =============== g8.25 · 现在完成时 vs 一般过去时 ===============
DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.25')
  AND sort_order BETWEEN 9100 AND 9199;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.25')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  -- 4 MCQs
  (
    'I ___ this book last week, and now I want to read it again.',
    'mcq', 'have read', 'read', 'have been reading', 'am reading', 'B',
    NULL::text[],
    'last week 是明确过去时间 → 用一般过去时 **read** (/red/)。',
    '{}'::jsonb, NULL, 'present_perfect_vs_past', false, 1, 9100
  ),
  (
    'My sister ___ in Shanghai since 2015. She loves the city.',
    'mcq', 'lived', 'lives', 'has lived', 'is living', 'C',
    NULL::text[],
    'since 2015 → 现完信号；she → **has lived**。',
    '{}'::jsonb, NULL, 'present_perfect_vs_past', false, 1, 9101
  ),
  (
    'A: ___ you ___ your bike?  B: Yes, I ___ it three days ago.',
    'mcq', 'Have / repaired / repaired', 'Did / repair / have repaired', 'Have / repaired / have repaired', 'Did / repair / repaired', 'A',
    NULL::text[],
    '问当前状态用 Have you repaired (现完)；回答有具体过去时间 three days ago → 一般过去时 **repaired**。',
    '{}'::jsonb, NULL, 'present_perfect_vs_past', false, 3, 9102
  ),
  (
    'My grandfather ___ in this village all his life. Sadly, he ___ last spring.',
    'mcq', 'has lived / passed away', 'lived / passed away', 'has lived / has passed away', 'lived / has passed away', 'B',
    NULL::text[],
    '已去世的人不再活着 → 不能用现完；两处都用过去 → **lived / passed away**。',
    '{}'::jsonb, '已故的人用一般过去时是中考易错点。', 'present_perfect_vs_past', false, 3, 9103
  ),

  -- 3 fills
  (
    'I ____ (see) the new Marvel film yesterday. It was great.',
    'fill', NULL, NULL, NULL, NULL, 'saw',
    ARRAY['saw']::text[],
    'yesterday → 明确过去时间 → **saw** (一般过去时)。',
    '{}'::jsonb, NULL, 'present_perfect_vs_past', false, 1, 9104
  ),
  (
    'My friend ____ (just leave). You might still catch him at the gate.',
    'fill', NULL, NULL, NULL, NULL, 'has just left',
    ARRAY['has just left']::text[],
    'just 是现完信号 → **has just left**。',
    '{}'::jsonb, NULL, 'present_perfect_vs_past', false, 2, 9105
  ),
  (
    'Mr Smith ____ (work) in our school for 12 years, but he ____ (leave) last month.',
    'fill', NULL, NULL, NULL, NULL, 'worked / left',
    ARRAY[
      'worked / left',
      'worked/left',
      'worked, left'
    ]::text[],
    '后半句 last month 是明确过去时间 → 整句都讲述过去经历 → **worked / left**。已经离开了，前面 for 12 years 也是讲过去那段时间。',
    '{}'::jsonb, '注意：现在不再工作了，用过去时；如果仍在工作则用 has worked。', 'present_perfect_vs_past', false, 3, 9106
  ),

  -- 3 corrections
  (
    '改错： I have finished my homework yesterday.',
    'correction', NULL, NULL, NULL, NULL, 'I finished my homework yesterday.',
    ARRAY['I finished my homework yesterday.']::text[],
    'yesterday 是明确过去时间 → 不能用现完，要用 **finished**。',
    '{}'::jsonb, NULL, 'present_perfect_vs_past', true, 1, 9107
  ),
  (
    '改错： She lived in Canada since 2010.',
    'correction', NULL, NULL, NULL, NULL, 'She has lived in Canada since 2010.',
    ARRAY['She has lived in Canada since 2010.']::text[],
    'since + 时间点 → 现完 → **has lived**。',
    '{}'::jsonb, NULL, 'present_perfect_vs_past', true, 2, 9108
  ),
  (
    '改错： My family has bought a new car three months ago, and we have driven it to the beach last weekend.',
    'correction', NULL, NULL, NULL, NULL, 'My family bought a new car three months ago, and we drove it to the beach last weekend.',
    ARRAY['My family bought a new car three months ago, and we drove it to the beach last weekend.']::text[],
    '两处错：① three months ago 明确过去时间 → **bought**；② last weekend 也是过去时间 → **drove**。',
    '{}'::jsonb, '…ago 和 last… 都不能搭配现完。', 'present_perfect_vs_past', true, 3, 9109
  ),

  -- 3 transforms
  (
    '改写为含 for 的现在完成时： I started to learn English when I was 7. I am 13 now.',
    'transform', NULL, NULL, NULL, NULL, 'I have learned English for six years.',
    ARRAY[
      'I have learned English for six years.',
      'I have studied English for six years.',
      'I''ve learned English for six years.'
    ]::text[],
    '把 started ... when 改写为 have + V-pp + for + 时长 (13-7=6)。',
    '{}'::jsonb, NULL, 'present_perfect_vs_past', true, 1, 9110
  ),
  (
    '把过去时改为现在完成时（去掉 yesterday，添加 already）： I bought a new bike yesterday.',
    'transform', NULL, NULL, NULL, NULL, 'I have already bought a new bike.',
    ARRAY[
      'I have already bought a new bike.',
      'I''ve already bought a new bike.'
    ]::text[],
    '现完不能搭配具体过去时间 → 去掉 yesterday，加 already。',
    '{}'::jsonb, NULL, 'present_perfect_vs_past', true, 2, 9111
  ),
  (
    '合并为一句（用 since）：(1) My uncle came to this city in 2010. (2) He still lives here now.',
    'transform', NULL, NULL, NULL, NULL, 'My uncle has lived in this city since 2010.',
    ARRAY[
      'My uncle has lived in this city since 2010.',
      'My uncle has been living in this city since 2010.',
      'My uncle has lived here since 2010.'
    ]::text[],
    '一直延续到现在 → has + V-pp + since + 起点。',
    '{}'::jsonb, NULL, 'present_perfect_vs_past', true, 3, 9112
  ),

  -- 3 translations
  (
    '把这句话译成英文：我去年去过北京。',
    'translation', NULL, NULL, NULL, NULL, 'I went to Beijing last year.',
    ARRAY[
      'I went to Beijing last year.',
      'Last year, I went to Beijing.',
      'I visited Beijing last year.'
    ]::text[],
    'last year 是明确过去时间 → 一般过去时 **went**（不是 have been）。',
    '{}'::jsonb, NULL, 'present_perfect_vs_past', true, 1, 9113
  ),
  (
    '把这句话译成英文：我学英语已经七年了。',
    'translation', NULL, NULL, NULL, NULL, 'I have learned English for seven years.',
    ARRAY[
      'I have learned English for seven years.',
      'I have studied English for seven years.',
      'I have been learning English for seven years.',
      'I''ve learned English for seven years.'
    ]::text[],
    'for + 时长 → have + V-pp。',
    '{}'::jsonb, NULL, 'present_perfect_vs_past', true, 2, 9114
  ),
  (
    '把这句话译成英文：我两小时前把作业交给老师了，但她还没批改。',
    'translation', NULL, NULL, NULL, NULL, 'I handed in my homework to the teacher two hours ago, but she hasn''t checked it yet.',
    ARRAY[
      'I handed in my homework to the teacher two hours ago, but she hasn''t checked it yet.',
      'I handed in my homework two hours ago, but the teacher hasn''t corrected it yet.',
      'I gave my homework to the teacher two hours ago, but she has not marked it yet.'
    ]::text[],
    '两小时前 → 过去时 handed in；还没批改 → hasn''t + V-pp + yet。',
    '{}'::jsonb, '一句话里两种时态并存是中考高频。', 'present_perfect_vs_past', true, 3, 9115
  )
) AS q(stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
       accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
       difficulty, sort_order);


-- =============== g8.26 · 宾语从句 (object clauses) ===============
DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.26')
  AND sort_order BETWEEN 9100 AND 9199;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.26')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  -- 4 MCQs
  (
    'He says ___ he likes Chinese food very much.',
    'mcq', 'if', 'whether', 'that', 'what', 'C',
    NULL::text[],
    '陈述句宾语从句用 **that**（可省略）引导。',
    '{}'::jsonb, NULL, 'object_clause_that', false, 1, 9100
  ),
  (
    'Could you tell me ___ the post office is?',
    'mcq', 'where', 'what', 'when', 'why', 'A',
    NULL::text[],
    '问地点用 **where**；宾语从句用陈述语序。',
    '{}'::jsonb, NULL, 'object_clause_wh', false, 1, 9101
  ),
  (
    'Mum asked me ___ I ___ my homework yet.',
    'mcq', 'if / finished', 'whether / have finished', 'if / had finished', 'that / finished', 'C',
    NULL::text[],
    '一般疑问句变宾语从句用 **if/whether**；主句过去时 asked → 从句过去完成 **had finished**（主过去 → 从过去/过去完成）。',
    '{}'::jsonb, NULL, 'object_clause_tense', false, 3, 9102
  ),
  (
    'The teacher said the earth ___ around the sun, and water ___ at 100°C.',
    'mcq', 'moved / boiled', 'moves / boils', 'was moving / boiled', 'has moved / has boiled', 'B',
    NULL::text[],
    '客观真理 / 科学事实即使主句过去，从句仍用**一般现在时**：**moves / boils**。',
    '{}'::jsonb, '客观真理是宾语从句时态唯一例外。', 'object_clause_tense', false, 3, 9103
  ),

  -- 3 fills
  (
    'I think ____ (that) English is interesting.',
    'fill', NULL, NULL, NULL, NULL, 'that',
    ARRAY[
      'that',
      ''
    ]::text[],
    '陈述句宾语从句用 **that**（口语中可省略）。',
    '{}'::jsonb, NULL, 'object_clause_that', false, 1, 9104
  ),
  (
    'Do you know ____ (whose / who''s) bag this is?',
    'fill', NULL, NULL, NULL, NULL, 'whose',
    ARRAY['whose']::text[],
    '问 谁的 用 **whose** + 名词；who''s = who is 不通顺。',
    '{}'::jsonb, NULL, 'object_clause_wh', false, 2, 9105
  ),
  (
    'She asked her son ____ he ____ (do) his homework that evening.',
    'fill', NULL, NULL, NULL, NULL, 'if / would do',
    ARRAY[
      'if / would do',
      'whether / would do',
      'if/would do',
      'whether/would do'
    ]::text[],
    '一般问句 → if/whether；主句 asked 过去时 → 从句过去将来 **would do**（that evening 还未发生）。',
    '{}'::jsonb, NULL, 'object_clause_tense', false, 3, 9106
  ),

  -- 3 corrections
  (
    '改错： Could you tell me where is the library?',
    'correction', NULL, NULL, NULL, NULL, 'Could you tell me where the library is?',
    ARRAY['Could you tell me where the library is?']::text[],
    '宾语从句要用 **陈述语序**：where + 主语 + 谓语 → where the library **is**。',
    '{}'::jsonb, NULL, 'object_clause_order', true, 1, 9107
  ),
  (
    '改错： He asked me if did I want to join them.',
    'correction', NULL, NULL, NULL, NULL, 'He asked me if I wanted to join them.',
    ARRAY['He asked me if I wanted to join them.']::text[],
    '两处错：① 陈述语序不用 did；② 主句过去 asked → 从句过去 **wanted**。',
    '{}'::jsonb, NULL, 'object_clause_order_tense', true, 2, 9108
  ),
  (
    '改错： The teacher told us that light travelled faster than sound, and that the moon went around the earth.',
    'correction', NULL, NULL, NULL, NULL, 'The teacher told us that light travels faster than sound, and that the moon goes around the earth.',
    ARRAY['The teacher told us that light travels faster than sound, and that the moon goes around the earth.']::text[],
    '客观真理用**一般现在时**，不随主句变过去：travels / goes。',
    '{}'::jsonb, NULL, 'object_clause_tense', true, 3, 9109
  ),

  -- 3 transforms
  (
    '合并为宾语从句： I think. The film is interesting.',
    'transform', NULL, NULL, NULL, NULL, 'I think (that) the film is interesting.',
    ARRAY[
      'I think (that) the film is interesting.',
      'I think that the film is interesting.',
      'I think the film is interesting.'
    ]::text[],
    'think + (that) + 从句。that 可省略。',
    '{}'::jsonb, NULL, 'object_clause_that', true, 1, 9110
  ),
  (
    '把直接引语变间接引语： Tom said: I am a student.',
    'transform', NULL, NULL, NULL, NULL, 'Tom said (that) he was a student.',
    ARRAY[
      'Tom said (that) he was a student.',
      'Tom said that he was a student.',
      'Tom said he was a student.'
    ]::text[],
    '人称 I → he；时态 am → **was**（主过去 → 从过去）。',
    '{}'::jsonb, NULL, 'object_clause_reported', true, 2, 9111
  ),
  (
    '合并为宾语从句： He asked me: Have you ever been to Hong Kong?',
    'transform', NULL, NULL, NULL, NULL, 'He asked me if I had ever been to Hong Kong.',
    ARRAY[
      'He asked me if I had ever been to Hong Kong.',
      'He asked me whether I had ever been to Hong Kong.',
      'He asked me if I had ever been to Hong Kong before.'
    ]::text[],
    '一般问句 → if/whether；have been → **had been**（主过去 → 从过去完成）；I → I（仍是被问者，但人称不变这里因为 he 问 me）。',
    '{}'::jsonb, NULL, 'object_clause_reported', true, 3, 9112
  ),

  -- 3 translations
  (
    '把这句话译成英文：你能告诉我你叫什么名字吗？',
    'translation', NULL, NULL, NULL, NULL, 'Could you tell me what your name is?',
    ARRAY[
      'Could you tell me what your name is?',
      'Can you tell me what your name is?',
      'Would you tell me what your name is?'
    ]::text[],
    '宾语从句陈述语序：what + your name + is。',
    '{}'::jsonb, NULL, 'object_clause_translation', true, 1, 9113
  ),
  (
    '把这句话译成英文：我想知道他昨天为什么没来上学。',
    'translation', NULL, NULL, NULL, NULL, 'I want to know why he didn''t come to school yesterday.',
    ARRAY[
      'I want to know why he didn''t come to school yesterday.',
      'I would like to know why he didn''t come to school yesterday.',
      'I wonder why he didn''t come to school yesterday.'
    ]::text[],
    'why + 主语 + 谓语（陈述语序）；yesterday → 一般过去时 didn''t come。',
    '{}'::jsonb, NULL, 'object_clause_translation', true, 2, 9114
  ),
  (
    '把这句话译成英文：老师问我是否完成了作业，我说我已经做完了。',
    'translation', NULL, NULL, NULL, NULL, 'The teacher asked me if I had finished my homework, and I said I had already finished it.',
    ARRAY[
      'The teacher asked me if I had finished my homework, and I said I had already finished it.',
      'The teacher asked me whether I had finished my homework, and I told her I had already finished it.',
      'My teacher asked me if I had finished my homework, and I said that I had already done it.'
    ]::text[],
    '主句过去（asked / said）→ 从句过去完成（had finished / had finished）。',
    '{}'::jsonb, NULL, 'object_clause_translation', true, 3, 9115
  )
) AS q(stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
       accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
       difficulty, sort_order);


-- =============== g8.27 · 被动语态 (passive voice) ===============
DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.27')
  AND sort_order BETWEEN 9100 AND 9199;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.27')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  -- 4 MCQs
  (
    'English ___ in many countries around the world.',
    'mcq', 'speaks', 'is spoken', 'is speaking', 'spoke', 'B',
    NULL::text[],
    '英语被人讲 → 被动语态现在时：**is spoken** (am/is/are + V-pp)。',
    '{}'::jsonb, NULL, 'passive_voice_present', false, 1, 9100
  ),
  (
    'The classroom ___ by Tom and Jerry yesterday.',
    'mcq', 'cleans', 'cleaned', 'is cleaned', 'was cleaned', 'D',
    NULL::text[],
    'yesterday → 过去；教室被打扫 → was/were + V-pp → **was cleaned**。',
    '{}'::jsonb, NULL, 'passive_voice_past', false, 1, 9101
  ),
  (
    'A new library ___ in our school last year, and it ___ by thousands of students every day now.',
    'mcq', 'built / used', 'was built / is used', 'built / is used', 'was built / used', 'B',
    NULL::text[],
    '建在去年（过去被动）→ **was built**；现在每天被用（现在被动）→ **is used**。',
    '{}'::jsonb, NULL, 'passive_voice_mixed', false, 3, 9102
  ),
  (
    'These photos ___ by my uncle. They ___ all over the world.',
    'mcq', 'were taken / are loved', 'took / love', 'were taken / love', 'are taken / loved', 'A',
    NULL::text[],
    '照片被拍：过去被动 → **were taken**；被全世界人喜爱：现在被动 → **are loved**。',
    '{}'::jsonb, NULL, 'passive_voice_mixed', false, 3, 9103
  ),

  -- 3 fills
  (
    'Many trees ____ (plant) on the hill every spring.',
    'fill', NULL, NULL, NULL, NULL, 'are planted',
    ARRAY['are planted']::text[],
    '现在被动 are + V-pp → **are planted**。',
    '{}'::jsonb, NULL, 'passive_voice_present', false, 1, 9104
  ),
  (
    'The Great Wall ____ (build) more than 2,000 years ago.',
    'fill', NULL, NULL, NULL, NULL, 'was built',
    ARRAY['was built']::text[],
    '过去被动 was + V-pp → **was built**。',
    '{}'::jsonb, NULL, 'passive_voice_past', false, 2, 9105
  ),
  (
    'Rice ____ (grow) mainly in the south of China, and it ____ (eat) by people all over the country.',
    'fill', NULL, NULL, NULL, NULL, 'is grown / is eaten',
    ARRAY[
      'is grown / is eaten',
      'is grown/is eaten',
      'is grown, is eaten'
    ]::text[],
    '两个现在被动：is + V-pp。grow → grown；eat → eaten。',
    '{}'::jsonb, NULL, 'passive_voice_present', false, 3, 9106
  ),

  -- 3 corrections
  (
    '改错： The window was break by the boy yesterday.',
    'correction', NULL, NULL, NULL, NULL, 'The window was broken by the boy yesterday.',
    ARRAY['The window was broken by the boy yesterday.']::text[],
    'was + **V-pp** → was **broken** (不是 break)。',
    '{}'::jsonb, NULL, 'passive_voice_past', true, 1, 9107
  ),
  (
    '改错： Chinese is speak by more than one billion people.',
    'correction', NULL, NULL, NULL, NULL, 'Chinese is spoken by more than one billion people.',
    ARRAY['Chinese is spoken by more than one billion people.']::text[],
    'is + **V-pp** → is **spoken** (不是 speak)。',
    '{}'::jsonb, NULL, 'passive_voice_present', true, 2, 9108
  ),
  (
    '改错： The new bridge were build by the workers last month, and now it is used by thousands of cars every day.',
    'correction', NULL, NULL, NULL, NULL, 'The new bridge was built by the workers last month, and now it is used by thousands of cars every day.',
    ARRAY['The new bridge was built by the workers last month, and now it is used by thousands of cars every day.']::text[],
    '两处错：① bridge 单数 → **was** (不是 were)；② be + **V-pp** → **built** (不是 build)。',
    '{}'::jsonb, NULL, 'passive_voice_past', true, 3, 9109
  ),

  -- 3 transforms
  (
    '改写为被动语态： The children sing this song.',
    'transform', NULL, NULL, NULL, NULL, 'This song is sung by the children.',
    ARRAY[
      'This song is sung by the children.'
    ]::text[],
    '主动 → 被动：宾语 this song 提前；am/is/are + V-pp → **is sung**；by + 原主语。',
    '{}'::jsonb, NULL, 'passive_voice_transform', true, 1, 9110
  ),
  (
    '改写为被动语态： People grow rice in the south of China.',
    'transform', NULL, NULL, NULL, NULL, 'Rice is grown in the south of China.',
    ARRAY[
      'Rice is grown in the south of China.',
      'Rice is grown in the south of China by people.'
    ]::text[],
    'people 是泛指执行者，by people 常省略；is + grown。',
    '{}'::jsonb, '泛指主语 people / they / someone 在被动中常省略 by 短语。', 'passive_voice_transform', true, 2, 9111
  ),
  (
    '改写为被动语态： The students cleaned the classroom and washed the windows yesterday.',
    'transform', NULL, NULL, NULL, NULL, 'The classroom was cleaned and the windows were washed by the students yesterday.',
    ARRAY[
      'The classroom was cleaned and the windows were washed by the students yesterday.',
      'The classroom was cleaned and the windows were washed yesterday.'
    ]::text[],
    '两个动词都变过去被动：was cleaned / were washed；by the students yesterday。',
    '{}'::jsonb, NULL, 'passive_voice_past', true, 3, 9112
  ),

  -- 3 translations
  (
    '把这句话译成英文：这本书是李雷写的。',
    'translation', NULL, NULL, NULL, NULL, 'This book was written by Li Lei.',
    ARRAY[
      'This book was written by Li Lei.',
      'The book was written by Li Lei.'
    ]::text[],
    '过去被动 was + written；by + 作者。',
    '{}'::jsonb, NULL, 'passive_voice_translation', true, 1, 9113
  ),
  (
    '把这句话译成英文：每天早上，大门六点钟被打开。',
    'translation', NULL, NULL, NULL, NULL, 'The gate is opened at six o''clock every morning.',
    ARRAY[
      'The gate is opened at six o''clock every morning.',
      'Every morning, the gate is opened at six o''clock.',
      'The gate is opened at 6 a.m. every morning.'
    ]::text[],
    '现在被动 is + V-pp opened；每天 → 现在时。',
    '{}'::jsonb, NULL, 'passive_voice_translation', true, 2, 9114
  ),
  (
    '把这句话译成英文：这个博物馆于 1985 年建成，每年被成千上万的游客参观。',
    'translation', NULL, NULL, NULL, NULL, 'The museum was built in 1985, and it is visited by thousands of tourists every year.',
    ARRAY[
      'The museum was built in 1985, and it is visited by thousands of tourists every year.',
      'This museum was built in 1985 and is visited by thousands of tourists every year.',
      'The museum was built in 1985, and it is visited by tens of thousands of tourists each year.'
    ]::text[],
    '建成（过去被动）→ was built；每年被参观（现在被动）→ is visited。',
    '{}'::jsonb, NULL, 'passive_voice_translation', true, 3, 9115
  )
) AS q(stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
       accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
       difficulty, sort_order);


-- =============== g8.28 · 定语从句 (who/which/that) ===============
DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.28')
  AND sort_order BETWEEN 9100 AND 9199;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.28')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  -- 4 MCQs
  (
    'The boy ___ is wearing a red hat is my brother.',
    'mcq', 'which', 'whose', 'who', 'what', 'C',
    NULL::text[],
    '先行词 boy 是人 → 关系代词用 **who** (或 that)。',
    '{}'::jsonb, NULL, 'relative_clause_who', false, 1, 9100
  ),
  (
    'This is the book ___ I bought yesterday.',
    'mcq', 'who', 'which', 'whose', 'what', 'B',
    NULL::text[],
    '先行词 book 是物 → 用 **which** (或 that)。',
    '{}'::jsonb, NULL, 'relative_clause_which', false, 1, 9101
  ),
  (
    'The girl and her dog ___ ___ just walked past are from next door.',
    'mcq', 'who / has', 'which / have', 'that / have', 'who / have', 'C',
    NULL::text[],
    '先行词同时包含人和动物 → 用 **that**；先行词复数 → **have** walked。',
    '{}'::jsonb, NULL, 'relative_clause_that', false, 3, 9102
  ),
  (
    'Anyone ___ wants to join the club ___ a form before Friday.',
    'mcq', 'which / fill in', 'who / must fill in', 'whose / must fill', 'who / must filled in', 'B',
    NULL::text[],
    '先行词 anyone 是不定代词指人 → 用 **who** (或 that)；情态动词 must + 原形 **fill in**。',
    '{}'::jsonb, '不定代词 anyone/someone/everyone 后面也用 who/that。', 'relative_clause_who', false, 3, 9103
  ),

  -- 3 fills
  (
    'The man ____ (who / which) is standing over there is my English teacher.',
    'fill', NULL, NULL, NULL, NULL, 'who',
    ARRAY[
      'who',
      'that'
    ]::text[],
    'man 是人 → who 或 that。',
    '{}'::jsonb, NULL, 'relative_clause_who', false, 1, 9104
  ),
  (
    'I like the new dress ____ my mother made for me last week.',
    'fill', NULL, NULL, NULL, NULL, 'that',
    ARRAY[
      'that',
      'which'
    ]::text[],
    '先行词 dress 是物 → which / that 都行。',
    '{}'::jsonb, NULL, 'relative_clause_which', false, 2, 9105
  ),
  (
    'The factory ____ my father works in produces a kind of medicine ____ helps people sleep better.',
    'fill', NULL, NULL, NULL, NULL, 'that / that',
    ARRAY[
      'that / that',
      'which / which',
      'that/that',
      'which/which',
      'that / which',
      'which / that'
    ]::text[],
    '两个先行词都是物（factory / medicine）→ which 或 that 都行。',
    '{}'::jsonb, NULL, 'relative_clause_mixed', false, 3, 9106
  ),

  -- 3 corrections
  (
    '改错： The girl which sits next to me is my best friend.',
    'correction', NULL, NULL, NULL, NULL, 'The girl who sits next to me is my best friend.',
    ARRAY[
      'The girl who sits next to me is my best friend.',
      'The girl that sits next to me is my best friend.'
    ]::text[],
    '先行词是人 → 不能用 which，要用 **who** 或 that。',
    '{}'::jsonb, NULL, 'relative_clause_who', true, 1, 9107
  ),
  (
    '改错： This is the book who I borrowed from the library.',
    'correction', NULL, NULL, NULL, NULL, 'This is the book which I borrowed from the library.',
    ARRAY[
      'This is the book which I borrowed from the library.',
      'This is the book that I borrowed from the library.'
    ]::text[],
    '先行词 book 是物 → 不能用 who，要用 **which** 或 that。',
    '{}'::jsonb, NULL, 'relative_clause_which', true, 2, 9108
  ),
  (
    '改错： The people and their pets which moved in next door is very friendly.',
    'correction', NULL, NULL, NULL, NULL, 'The people and their pets that moved in next door are very friendly.',
    ARRAY['The people and their pets that moved in next door are very friendly.']::text[],
    '两处错：① 人 + 物（people + pets）→ 必须用 **that**；② 主语复数 → **are**（不是 is）。',
    '{}'::jsonb, NULL, 'relative_clause_that', true, 3, 9109
  ),

  -- 3 transforms
  (
    '合并为含定语从句的句子： The boy is my classmate. He is reading.',
    'transform', NULL, NULL, NULL, NULL, 'The boy who is reading is my classmate.',
    ARRAY[
      'The boy who is reading is my classmate.',
      'The boy that is reading is my classmate.'
    ]::text[],
    'boy 是人 → who/that 引导从句修饰。',
    '{}'::jsonb, NULL, 'relative_clause_transform', true, 1, 9110
  ),
  (
    '合并为含定语从句的句子： I have a friend. He can speak three languages.',
    'transform', NULL, NULL, NULL, NULL, 'I have a friend who can speak three languages.',
    ARRAY[
      'I have a friend who can speak three languages.',
      'I have a friend that can speak three languages.'
    ]::text[],
    'friend → who/that + can speak。',
    '{}'::jsonb, NULL, 'relative_clause_transform', true, 2, 9111
  ),
  (
    '合并为含定语从句的句子： The book is very interesting. I borrowed it from the library yesterday.',
    'transform', NULL, NULL, NULL, NULL, 'The book that I borrowed from the library yesterday is very interesting.',
    ARRAY[
      'The book that I borrowed from the library yesterday is very interesting.',
      'The book which I borrowed from the library yesterday is very interesting.',
      'The book I borrowed from the library yesterday is very interesting.'
    ]::text[],
    'book 是物 → that / which；作宾语时可省略。',
    '{}'::jsonb, '关系代词作宾语时常可省略。', 'relative_clause_transform', true, 3, 9112
  ),

  -- 3 translations
  (
    '把这句话译成英文：那个穿蓝衣服的女孩是我妹妹。',
    'translation', NULL, NULL, NULL, NULL, 'The girl who is wearing blue is my sister.',
    ARRAY[
      'The girl who is wearing blue is my sister.',
      'The girl that is wearing blue is my sister.',
      'The girl in blue is my sister.'
    ]::text[],
    'girl 是人 → who / that。',
    '{}'::jsonb, NULL, 'relative_clause_translation', true, 1, 9113
  ),
  (
    '把这句话译成英文：这是我读过的最好的书。',
    'translation', NULL, NULL, NULL, NULL, 'This is the best book that I have ever read.',
    ARRAY[
      'This is the best book that I have ever read.',
      'This is the best book I have ever read.',
      'This is the best book I''ve ever read.'
    ]::text[],
    '最高级 + that 引导；现完 have ever read。',
    '{}'::jsonb, '最高级前面常用 that，不用 which。', 'relative_clause_translation', true, 2, 9114
  ),
  (
    '把这句话译成英文：我认识那个昨天救了一只小狗的男孩。',
    'translation', NULL, NULL, NULL, NULL, 'I know the boy who saved a little dog yesterday.',
    ARRAY[
      'I know the boy who saved a little dog yesterday.',
      'I know the boy that saved a little dog yesterday.',
      'I know the boy who rescued a puppy yesterday.'
    ]::text[],
    'boy → who/that + saved（过去式）。',
    '{}'::jsonb, NULL, 'relative_clause_translation', true, 3, 9115
  )
) AS q(stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
       accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
       difficulty, sort_order);


-- =============== g8.29 · 现在完成进行时 (have been doing) ===============
DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.29')
  AND sort_order BETWEEN 9100 AND 9199;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.29')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  -- 4 MCQs
  (
    'I ___ English for three hours. I''m really tired now.',
    'mcq', 'study', 'studied', 'have been studying', 'am studying', 'C',
    NULL::text[],
    '强调动作从过去持续到现在还在进行 → have/has been + V-ing → **have been studying**。',
    '{}'::jsonb, NULL, 'present_perfect_continuous', false, 1, 9100
  ),
  (
    'It ___ since early morning. The streets are still wet.',
    'mcq', 'rained', 'rains', 'has been raining', 'is raining', 'C',
    NULL::text[],
    'since early morning → 现完进行；动作持续 → **has been raining**。',
    '{}'::jsonb, NULL, 'present_perfect_continuous', false, 1, 9101
  ),
  (
    'A: How long ___ you ___ for the bus?  B: We ___ here for almost half an hour.',
    'mcq', 'have / waited / have waited', 'have / been waiting / have been waiting', 'did / wait / waited', 'are / waiting / are waiting', 'B',
    NULL::text[],
    'How long + have + 主语 + been + V-ing（强调持续）；回答也用 have been + V-ing。',
    '{}'::jsonb, NULL, 'present_perfect_continuous', false, 3, 9102
  ),
  (
    'Look at her red eyes — she ___ for a long time. I wonder what ___ her so sad.',
    'mcq', 'cried / has made', 'has cried / makes', 'has been crying / has made', 'is crying / has made', 'C',
    NULL::text[],
    '从过去哭到现在还在哭 → has been crying；现完 has made 强调对现在的影响。',
    '{}'::jsonb, NULL, 'present_perfect_continuous', false, 3, 9103
  ),

  -- 3 fills
  (
    'My brother ____ (play) computer games for two hours. Mum is angry.',
    'fill', NULL, NULL, NULL, NULL, 'has been playing',
    ARRAY['has been playing']::text[],
    '动作持续 → has + been + V-ing → **has been playing**。',
    '{}'::jsonb, NULL, 'present_perfect_continuous', false, 1, 9104
  ),
  (
    'They ____ (build) the new gym since last March, and it''s almost finished.',
    'fill', NULL, NULL, NULL, NULL, 'have been building',
    ARRAY['have been building']::text[],
    'since last March + still ongoing → **have been building**。',
    '{}'::jsonb, NULL, 'present_perfect_continuous', false, 2, 9105
  ),
  (
    'How long ____ (you / learn) the violin? I ____ (practise) every day since I was seven.',
    'fill', NULL, NULL, NULL, NULL, 'have you been learning / have been practising',
    ARRAY[
      'have you been learning / have been practising',
      'have you been learning / have been practicing',
      'have you been learning/have been practising'
    ]::text[],
    '两处都强调动作持续：have you been learning / have been practising（美式 practicing 也接受）。',
    '{}'::jsonb, NULL, 'present_perfect_continuous', false, 3, 9106
  ),

  -- 3 corrections
  (
    '改错： I have been studying English since three years.',
    'correction', NULL, NULL, NULL, NULL, 'I have been studying English for three years.',
    ARRAY['I have been studying English for three years.']::text[],
    'since + 时间点（2020 / last year）；for + 时间段（three years）。',
    '{}'::jsonb, NULL, 'present_perfect_continuous', true, 1, 9107
  ),
  (
    '改错： She has been work in this hospital for ten years.',
    'correction', NULL, NULL, NULL, NULL, 'She has been working in this hospital for ten years.',
    ARRAY[
      'She has been working in this hospital for ten years.',
      'She has worked in this hospital for ten years.'
    ]::text[],
    'have/has + been + **V-ing** → been **working**。',
    '{}'::jsonb, NULL, 'present_perfect_continuous', true, 2, 9108
  ),
  (
    '改错： How long has you been waiting here? I have been wait for almost an hour.',
    'correction', NULL, NULL, NULL, NULL, 'How long have you been waiting here? I have been waiting for almost an hour.',
    ARRAY['How long have you been waiting here? I have been waiting for almost an hour.']::text[],
    '两处错：① 主语 you → **have**；② have been + **V-ing** → **waiting**。',
    '{}'::jsonb, NULL, 'present_perfect_continuous', true, 3, 9109
  ),

  -- 3 transforms
  (
    '改写为现在完成进行时（加 for two hours）： I am reading.',
    'transform', NULL, NULL, NULL, NULL, 'I have been reading for two hours.',
    ARRAY[
      'I have been reading for two hours.',
      'I''ve been reading for two hours.'
    ]::text[],
    'am reading → have been reading + for + 时长。',
    '{}'::jsonb, NULL, 'present_perfect_continuous_transform', true, 1, 9110
  ),
  (
    '改写为含 since 的现在完成进行时： Tom started running at 6 a.m. It is now 8 a.m. and he is still running.',
    'transform', NULL, NULL, NULL, NULL, 'Tom has been running since 6 a.m.',
    ARRAY[
      'Tom has been running since 6 a.m.',
      'Tom has been running since six a.m.',
      'Tom has been running since 6 in the morning.'
    ]::text[],
    'since + 时间点；has been + V-ing。',
    '{}'::jsonb, NULL, 'present_perfect_continuous_transform', true, 2, 9111
  ),
  (
    '对划线部分提问： Mary has been learning the piano for [five years].',
    'transform', NULL, NULL, NULL, NULL, 'How long has Mary been learning the piano?',
    ARRAY[
      'How long has Mary been learning the piano?'
    ]::text[],
    '对持续时长提问用 How long + has + 主语 + been + V-ing？',
    '{}'::jsonb, NULL, 'present_perfect_continuous_question', true, 3, 9112
  ),

  -- 3 translations
  (
    '把这句话译成英文：他们已经讨论这个问题两个小时了。',
    'translation', NULL, NULL, NULL, NULL, 'They have been discussing this problem for two hours.',
    ARRAY[
      'They have been discussing this problem for two hours.',
      'They have been discussing this question for two hours.',
      'They have been talking about this problem for two hours.'
    ]::text[],
    'for + 时长 + have been + V-ing → 强调动作仍在进行。',
    '{}'::jsonb, NULL, 'present_perfect_continuous_translation', true, 1, 9113
  ),
  (
    '把这句话译成英文：自从七岁起，我就一直在学英语。',
    'translation', NULL, NULL, NULL, NULL, 'I have been learning English since I was seven.',
    ARRAY[
      'I have been learning English since I was seven.',
      'I have been studying English since I was seven.',
      'I have been learning English since the age of seven.'
    ]::text[],
    'since + 从句（I was seven）→ have been + V-ing。',
    '{}'::jsonb, NULL, 'present_perfect_continuous_translation', true, 2, 9114
  ),
  (
    '把这句话译成英文：你看起来很累。你在写作业吗？是的，我已经写了三个小时了，还没写完。',
    'translation', NULL, NULL, NULL, NULL, 'You look so tired. Have you been doing your homework? Yes, I have been doing it for three hours and I haven''t finished yet.',
    ARRAY[
      'You look so tired. Have you been doing your homework? Yes, I have been doing it for three hours and I haven''t finished yet.',
      'You look really tired. Have you been doing your homework? Yes, I have been doing it for three hours and I haven''t finished it yet.',
      'You look tired. Have you been doing homework? Yes, I''ve been doing it for three hours, and I haven''t finished yet.'
    ]::text[],
    '现完进行（持续动作）+ 现完否定（haven''t finished yet）。',
    '{}'::jsonb, NULL, 'present_perfect_continuous_translation', true, 3, 9115
  )
) AS q(stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
       accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
       difficulty, sort_order);


-- =============== g8.30 · 虚拟语气入门 (If I were you / I wish) ===============
DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.30')
  AND sort_order BETWEEN 9100 AND 9199;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.30')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  -- 4 MCQs
  (
    'If I ___ you, I ___ to the doctor right now.',
    'mcq', 'am / will go', 'was / would go', 'were / would go', 'were / will go', 'C',
    NULL::text[],
    '虚拟语气：If I **were** you, I **would** + 原形 go。',
    '{}'::jsonb, NULL, 'subjunctive_basic', false, 1, 9100
  ),
  (
    'I wish I ___ taller. Then I ___ play basketball better.',
    'mcq', 'am / will', 'was / would', 'were / could', 'were / will', 'C',
    NULL::text[],
    'I wish + were（与现在事实相反）；后用 could + 原形。',
    '{}'::jsonb, NULL, 'subjunctive_wish', false, 1, 9101
  ),
  (
    'If my best friend ___ here today, he ___ me with this difficult problem.',
    'mcq', 'is / will help', 'were / would help', 'was / would help', 'were / will help', 'B',
    NULL::text[],
    '与现在事实相反（朋友不在）→ If + were，主句 would + 原形。',
    '{}'::jsonb, NULL, 'subjunctive_basic', false, 3, 9102
  ),
  (
    'A: I''m so bored on this rainy Saturday.  B: I wish the weather ___ better; then we ___ a picnic in the park.',
    'mcq', 'is / can have', 'was / will have', 'were / could have', 'were / will have', 'C',
    NULL::text[],
    'I wish + were（与现在天气事实相反）；then 后 could + 原形 have。',
    '{}'::jsonb, NULL, 'subjunctive_wish', false, 3, 9103
  ),

  -- 3 fills
  (
    'If I ____ (be) a bird, I ____ (fly) to the moon.',
    'fill', NULL, NULL, NULL, NULL, 'were / would fly',
    ARRAY[
      'were / would fly',
      'were/would fly',
      'were, would fly'
    ]::text[],
    'If 虚拟：be → **were**；主句 would + 原形 fly。',
    '{}'::jsonb, NULL, 'subjunctive_basic', false, 1, 9104
  ),
  (
    'I wish I ____ (can) speak French as well as you.',
    'fill', NULL, NULL, NULL, NULL, 'could',
    ARRAY['could']::text[],
    'I wish + 过去式：can → **could**。',
    '{}'::jsonb, NULL, 'subjunctive_wish', false, 2, 9105
  ),
  (
    'If my grandfather ____ (be) still alive, he ____ (be) very proud of me, and he ____ (give) me a big hug.',
    'fill', NULL, NULL, NULL, NULL, 'were / would be / would give',
    ARRAY[
      'were / would be / would give',
      'were/would be/would give',
      'were, would be, would give'
    ]::text[],
    '与事实相反 → were；主句两处 would + 原形。',
    '{}'::jsonb, NULL, 'subjunctive_basic', false, 3, 9106
  ),

  -- 3 corrections
  (
    '改错： If I was you, I would say sorry to her.',
    'correction', NULL, NULL, NULL, NULL, 'If I were you, I would say sorry to her.',
    ARRAY['If I were you, I would say sorry to her.']::text[],
    '虚拟语气中 be 一律用 **were**（即使主语是 I/he/she/it）。',
    '{}'::jsonb, NULL, 'subjunctive_basic', true, 1, 9107
  ),
  (
    '改错： I wish I am as smart as my older sister.',
    'correction', NULL, NULL, NULL, NULL, 'I wish I were as smart as my older sister.',
    ARRAY[
      'I wish I were as smart as my older sister.',
      'I wish I was as smart as my older sister.'
    ]::text[],
    'I wish + 过去式；be → **were**（正式）；口语中 was 也被接受。',
    '{}'::jsonb, NULL, 'subjunctive_wish', true, 2, 9108
  ),
  (
    '改错： If I were you, I will tell the teacher about it, and I would not lie to my parents.',
    'correction', NULL, NULL, NULL, NULL, 'If I were you, I would tell the teacher about it, and I would not lie to my parents.',
    ARRAY['If I were you, I would tell the teacher about it, and I would not lie to my parents.']::text[],
    '主句要用 would + 原形（will → **would**）。',
    '{}'::jsonb, NULL, 'subjunctive_basic', true, 3, 9109
  ),

  -- 3 transforms
  (
    '改写为虚拟语气（用 If I were you）： I would help her if I had time.',
    'transform', NULL, NULL, NULL, NULL, 'If I were you, I would help her.',
    ARRAY[
      'If I were you, I would help her.'
    ]::text[],
    'If I **were** you, I **would** + 原形 help。',
    '{}'::jsonb, NULL, 'subjunctive_basic_transform', true, 1, 9110
  ),
  (
    '改写为含 I wish 的句子： I can''t play the piano, but I want to.',
    'transform', NULL, NULL, NULL, NULL, 'I wish I could play the piano.',
    ARRAY[
      'I wish I could play the piano.'
    ]::text[],
    'I wish + 过去式：can → **could** + 原形。',
    '{}'::jsonb, NULL, 'subjunctive_wish_transform', true, 2, 9111
  ),
  (
    '把陈述句改为虚拟条件句： I''m not rich, so I can''t buy that house.',
    'transform', NULL, NULL, NULL, NULL, 'If I were rich, I could buy that house.',
    ARRAY[
      'If I were rich, I could buy that house.',
      'If I were rich, I would buy that house.'
    ]::text[],
    '与现在事实相反 → If + were，主句 could / would + 原形。',
    '{}'::jsonb, NULL, 'subjunctive_basic_transform', true, 3, 9112
  ),

  -- 3 translations
  (
    '把这句话译成英文：要是我是你，我就告诉妈妈。',
    'translation', NULL, NULL, NULL, NULL, 'If I were you, I would tell my mother.',
    ARRAY[
      'If I were you, I would tell my mother.',
      'If I were you, I would tell my mom.',
      'If I were you, I''d tell my mother.'
    ]::text[],
    'If I were you, I would + 原形。',
    '{}'::jsonb, NULL, 'subjunctive_translation', true, 1, 9113
  ),
  (
    '把这句话译成英文：我希望我能像你一样会唱歌。',
    'translation', NULL, NULL, NULL, NULL, 'I wish I could sing as well as you.',
    ARRAY[
      'I wish I could sing as well as you.',
      'I wish I could sing like you.',
      'I wish I were able to sing as well as you.'
    ]::text[],
    'I wish + could + 原形 sing。',
    '{}'::jsonb, NULL, 'subjunctive_translation', true, 2, 9114
  ),
  (
    '把这句话译成英文：如果我现在不在学校，我就会和家人去海边度假。',
    'translation', NULL, NULL, NULL, NULL, 'If I were not at school now, I would go to the beach with my family.',
    ARRAY[
      'If I were not at school now, I would go to the beach with my family.',
      'If I weren''t at school now, I would go to the beach with my family.',
      'If I were not at school now, I would go on a beach holiday with my family.'
    ]::text[],
    'If + were not + 主句 would + 原形。',
    '{}'::jsonb, NULL, 'subjunctive_translation', true, 3, 9115
  )
) AS q(stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
       accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
       difficulty, sort_order);


-- =====================================================================
-- Sanity check across all 9 codes
-- =====================================================================
DO $$
DECLARE
  v_codes text[] := ARRAY['g8.22','g8.23','g8.24','g8.25','g8.26','g8.27','g8.28','g8.29','g8.30'];
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
  RAISE NOTICE 'Adaptive expansion verified for 9 G8 points (batch C): 144 new questions seeded.';
END $$;

-- =====================================================================
-- END · G8 adaptive question bank · BATCH C (g8.22 … g8.30)
-- =====================================================================
