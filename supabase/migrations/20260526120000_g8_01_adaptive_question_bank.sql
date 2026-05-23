-- =====================================================================
-- Adaptive question bank expansion · g8.01 一般过去时 · Past Simple
-- =====================================================================
-- Adds 32 more questions at varied difficulties (1=easy, 2=medium, 3=hard)
-- so the adaptive 5-level mastery test can drop the user to an EASIER
-- question after a wrong answer, and raise to HARDER after a correct one.
--
-- Sort_order range 9100-9199 = adaptive expansion bank
--   (9000-9099 still reserved for the original gold-standard 12.)
--
-- Final g8.01 bank after this migration: 44 questions across 5 types
--   • MCQ:          12 (4 easy / 4 med / 4 hard)
--   • Fill:         10 (3 easy / 3 med / 4 hard)
--   • Correction:    8 (3 easy / 2 med / 3 hard)
--   • Transform:     8 (3 easy / 2 med / 3 hard)
--   • Translation:   6 (2 easy / 2 med / 2 hard)
--
-- Idempotent: scoped to sort_order 9100-9199.
-- =====================================================================

DELETE FROM junior_grammar_questions
WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = 'g8.01')
  AND sort_order BETWEEN 9100 AND 9199;

WITH p AS (SELECT id FROM junior_grammar_points WHERE code = 'g8.01')
INSERT INTO junior_grammar_questions
  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
   difficulty, sort_order)
SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,
       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,
       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order
FROM p, (VALUES
  -- ─── 8 extra MCQs (4 easy d=1, 4 hard d=3) ───
  (
    'Yesterday I ___ a new pencil case at the school shop.',
    'mcq', 'buy', 'buys', 'bought', 'buying', 'C',
    NULL::text[],
    'yesterday → 过去时；buy 不规则，过去式 **bought**。',
    '{}'::jsonb, NULL, 'past_simple_irregular', false, 1, 9100
  ),
  (
    'My grandpa ___ born in 1958.',
    'mcq', 'is', 'was', 'were', 'be', 'B',
    NULL::text[],
    'in 1958 → 过去；主语 grandpa 单数 → **was**。',
    '{}'::jsonb, NULL, 'past_simple_be', false, 1, 9101
  ),
  (
    'They ___ to the cinema last Friday evening.',
    'mcq', 'go', 'goes', 'went', 'going', 'C',
    NULL::text[],
    'last Friday → 过去；go 的过去式 **went**。',
    '{}'::jsonb, NULL, 'past_simple_irregular', false, 1, 9102
  ),
  (
    'I ___ my bike to school this morning.',
    'mcq', 'ride', 'rides', 'rided', 'rode', 'D',
    NULL::text[],
    'this morning（已经过去）→ 过去时；ride 不规则，过去式 **rode**（不是 rided）。',
    '{}'::jsonb, NULL, 'past_simple_irregular', false, 1, 9103
  ),
  (
    'It was so quiet that I could hear my heart ___. Then suddenly the door ___ and Tom ___ in with a huge smile.',
    'mcq', 'beating / opened / walked', 'beat / opened / walked', 'beating / opens / walks', 'beating / opened / walks', 'A',
    NULL::text[],
    '叙事过去：hear sb./sth. doing → **beating**（感官动词+ing 进行）；door open 用过去 → **opened**；walk in → **walked**。',
    '{}'::jsonb, NULL, 'past_simple_narrative', false, 3, 9104
  ),
  (
    'Although he ___ very hard, he still ___ the final exam by two points.',
    'mcq', 'studied / failed', 'studies / failed', 'studied / fails', 'was studying / failed', 'A',
    NULL::text[],
    '两个动词都在过去：study → **studied**（y 变 i 加 ed）；fail → **failed**。注意 although 引导让步状语。',
    '{}'::jsonb, '中考阅读常考"努力但失败"的让步结构 — 时态要前后一致。', 'past_simple_mixed', false, 3, 9105
  ),
  (
    'A: I called you at 9 last night but no one answered.  B: Sorry, I ___ in the shower at that time.',
    'mcq', 'am', 'was', 'were', 'have been', 'B',
    NULL::text[],
    'at 9 last night → 过去某一刻；主语 I → **was**（in the shower 是状态，be 动词足够）。',
    '{}'::jsonb, NULL, 'past_simple_be', false, 3, 9106
  ),
  (
    'The new shopping mall ___ last March, but it ___ very popular until summer.',
    'mcq', 'opened / didn''t become', 'opens / didn''t become', 'opened / didn''t became', 'was opened / didn''t became', 'A',
    NULL::text[],
    '两处过去：open → **opened**；didn''t 后用**原形** become。注意 became 是过去式，不能跟在 didn''t 后。',
    '{}'::jsonb, NULL, 'past_simple_negative', false, 3, 9107
  ),

  -- ─── 7 extra fills (3 easy d=1, 4 hard d=3) ───
  (
    'I ____ (play) basketball with my classmates yesterday afternoon.',
    'fill', NULL, NULL, NULL, NULL, 'played',
    ARRAY['played']::text[],
    'yesterday afternoon → 过去；play → **played**。',
    '{}'::jsonb, NULL, 'past_simple_regular', false, 1, 9108
  ),
  (
    'My mom ____ (make) a chocolate cake for my birthday last week.',
    'fill', NULL, NULL, NULL, NULL, 'made',
    ARRAY['made']::text[],
    'last week → 过去；make 不规则，过去式 **made**。',
    '{}'::jsonb, NULL, 'past_simple_irregular', false, 1, 9109
  ),
  (
    'We ____ (see) a wonderful film at the cinema last Saturday.',
    'fill', NULL, NULL, NULL, NULL, 'saw',
    ARRAY['saw']::text[],
    'last Saturday → 过去；see → **saw**。',
    '{}'::jsonb, NULL, 'past_simple_irregular', false, 1, 9110
  ),
  (
    'A: Why ____ (be) you absent yesterday?  B: I ____ (catch) a bad cold and ____ (have) to stay in bed.',
    'fill', NULL, NULL, NULL, NULL, 'were / caught / had',
    ARRAY[
      'were / caught / had',
      'were/caught/had',
      'were, caught, had',
      'were caught had'
    ]::text[],
    '三处过去：① why **were** you absent；② catch → **caught**；③ have to → **had to**。',
    '{}'::jsonb, '中考写病假条最爱考的三个动词全在这里。', 'past_simple_irregular', false, 3, 9111
  ),
  (
    'Although it ____ (rain) heavily, the football match ____ (not stop) until 9 p.m.',
    'fill', NULL, NULL, NULL, NULL, 'rained / didn''t stop',
    ARRAY[
      'rained / didn''t stop',
      'rained / did not stop',
      'rained/didn''t stop',
      'rained, didn''t stop'
    ]::text[],
    'rain → **rained**；否定句 → **didn''t stop**（didn''t + 原形）。',
    '{}'::jsonb, NULL, 'past_simple_negative', false, 3, 9112
  ),
  (
    'The moment the teacher ____ (walk) in, all the students ____ (stop) talking and ____ (sit) down.',
    'fill', NULL, NULL, NULL, NULL, 'walked / stopped / sat',
    ARRAY[
      'walked / stopped / sat',
      'walked/stopped/sat',
      'walked, stopped, sat',
      'walked stopped sat'
    ]::text[],
    '三个连续动作都是过去：walk → **walked**；stop → **stopped**（双写 p）；sit → **sat**（不规则）。',
    '{}'::jsonb, 'stop 双写 p 是中考拼写常考点。', 'past_simple_mixed', false, 3, 9113
  ),
  (
    'When I ____ (be) a child, I often ____ (fly) kites with my brother on weekends.',
    'fill', NULL, NULL, NULL, NULL, 'was / flew',
    ARRAY[
      'was / flew',
      'was/flew',
      'was, flew',
      'was flew'
    ]::text[],
    'When I was a child → 过去状态；fly 不规则，过去式 **flew**（不是 flied）。',
    '{}'::jsonb, NULL, 'past_simple_irregular', false, 3, 9114
  ),

  -- ─── 6 extra corrections (3 easy d=1, 3 hard d=3) ───
  (
    '改错：  "She goed to the supermarket yesterday."',
    'correction', NULL, NULL, NULL, NULL, 'She went to the supermarket yesterday.',
    ARRAY['She went to the supermarket yesterday.']::text[],
    'go 是不规则动词，过去式是 **went**，不是 goed。',
    '{}'::jsonb, NULL, 'past_simple_correction', true, 1, 9115
  ),
  (
    '改错：  "I buyed a new schoolbag last week."',
    'correction', NULL, NULL, NULL, NULL, 'I bought a new schoolbag last week.',
    ARRAY['I bought a new schoolbag last week.']::text[],
    'buy 不规则，过去式是 **bought**，不是 buyed。',
    '{}'::jsonb, NULL, 'past_simple_correction', true, 1, 9116
  ),
  (
    '改错：  "Did you saw the rainbow this morning?"',
    'correction', NULL, NULL, NULL, NULL, 'Did you see the rainbow this morning?',
    ARRAY['Did you see the rainbow this morning?']::text[],
    'Did 后必须用**原形** see，不能再用过去式 saw。',
    '{}'::jsonb, NULL, 'past_simple_correction', true, 1, 9117
  ),
  (
    '改错：  "When I was at primary school, my best friend and me always sat together and shared everything."',
    'correction', NULL, NULL, NULL, NULL, 'When I was at primary school, my best friend and I always sat together and shared everything.',
    ARRAY['When I was at primary school, my best friend and I always sat together and shared everything.']::text[],
    '主语位置要用主格 **I**，不是宾格 me。其他动词时态都正确（sat / shared）。',
    '{}'::jsonb, '过去时常和主格易错点一起考。', 'past_simple_correction', true, 3, 9118
  ),
  (
    '改错：  "He didn''t went home until midnight, and his parents was very worried."',
    'correction', NULL, NULL, NULL, NULL, 'He didn''t go home until midnight, and his parents were very worried.',
    ARRAY['He didn''t go home until midnight, and his parents were very worried.']::text[],
    '两处错：① didn''t 后用**原形** go；② parents 是复数主语 → **were**（不是 was）。',
    '{}'::jsonb, NULL, 'past_simple_correction', true, 3, 9119
  ),
  (
    '改错：  "Last summer my family and me visit Hainan, and we stayed there for a week."',
    'correction', NULL, NULL, NULL, NULL, 'Last summer my family and I visited Hainan, and we stayed there for a week.',
    ARRAY['Last summer my family and I visited Hainan, and we stayed there for a week.']::text[],
    '两处错：① 主语用 **I** 不是 me；② Last summer → 过去，visit → **visited**。',
    '{}'::jsonb, 'and we stayed 已经用了过去时，整句必须保持一致。', 'past_simple_correction', true, 3, 9120
  ),

  -- ─── 6 extra transforms (3 easy d=1, 3 hard d=3) ───
  (
    '改写为一般过去时（提示：last weekend）：  "I play computer games every weekend."',
    'transform', NULL, NULL, NULL, NULL, 'I played computer games last weekend.',
    ARRAY['I played computer games last weekend.', 'Last weekend, I played computer games.']::text[],
    'every weekend → last weekend；play → **played**。',
    '{}'::jsonb, NULL, 'past_simple_transform', true, 1, 9121
  ),
  (
    '改写为一般过去时（提示：yesterday）：  "She has lunch at school."',
    'transform', NULL, NULL, NULL, NULL, 'She had lunch at school yesterday.',
    ARRAY['She had lunch at school yesterday.', 'Yesterday she had lunch at school.']::text[],
    'has → **had**（have 不规则）；加 yesterday。',
    '{}'::jsonb, NULL, 'past_simple_transform', true, 1, 9122
  ),
  (
    '改写为否定句：  "We saw a wonderful film yesterday."',
    'transform', NULL, NULL, NULL, NULL, 'We didn''t see a wonderful film yesterday.',
    ARRAY['We didn''t see a wonderful film yesterday.', 'We did not see a wonderful film yesterday.']::text[],
    '否定：saw → **didn''t see**（didn''t 后用原形）。',
    '{}'::jsonb, NULL, 'past_simple_negative', true, 1, 9123
  ),
  (
    '改写为一般疑问句并作肯定回答：  "Tom finished his homework before dinner last night."',
    'transform', NULL, NULL, NULL, NULL, 'Did Tom finish his homework before dinner last night? Yes, he did.',
    ARRAY[
      'Did Tom finish his homework before dinner last night? Yes, he did.',
      'Did Tom finish his homework before dinner last night?  Yes, he did.',
      'Did Tom finish his homework before dinner last night? — Yes, he did.'
    ]::text[],
    '一般疑问句：**Did** + Tom + **finish** (原形)；肯定回答 Yes, he did。',
    '{}'::jsonb, NULL, 'past_simple_question', true, 3, 9124
  ),
  (
    '对划线部分提问：  "I went to the library [yesterday afternoon]."',
    'transform', NULL, NULL, NULL, NULL, 'When did you go to the library?',
    ARRAY[
      'When did you go to the library?',
      'When did you go to the library?'
    ]::text[],
    '提问时间：When + did + 主语 + **原形** go。注意人称 I → you。',
    '{}'::jsonb, '对时间提问用 When，went 要还原成 go。', 'past_simple_question', true, 3, 9125
  ),
  (
    '改写为一般过去时（提示：last winter）：  "It often snows in our city, and we make snowmen in the park."',
    'transform', NULL, NULL, NULL, NULL, 'It often snowed in our city last winter, and we made snowmen in the park.',
    ARRAY[
      'It often snowed in our city last winter, and we made snowmen in the park.',
      'Last winter it often snowed in our city, and we made snowmen in the park.'
    ]::text[],
    '两个动词都要变过去：snow → **snowed**；make → **made**。加 last winter。',
    '{}'::jsonb, NULL, 'past_simple_transform', true, 3, 9126
  ),

  -- ─── 5 extra translations (2 easy d=1, 2 med d=2, 1 hard d=3) ───
  (
    '把这句话译成英文：我昨天没去上学。',
    'translation', NULL, NULL, NULL, NULL, 'I didn''t go to school yesterday.',
    ARRAY[
      'I didn''t go to school yesterday.',
      'I did not go to school yesterday.',
      'Yesterday I didn''t go to school.',
      'Yesterday, I did not go to school.'
    ]::text[],
    '否定句：didn''t + 原形 go。yesterday 放句末或句首都可以。',
    '{}'::jsonb, NULL, 'past_simple_translation', true, 1, 9127
  ),
  (
    '把这句话译成英文：上周日我们打了一场篮球比赛。',
    'translation', NULL, NULL, NULL, NULL, 'We played a basketball game last Sunday.',
    ARRAY[
      'We played a basketball game last Sunday.',
      'We played a basketball match last Sunday.',
      'Last Sunday we played a basketball game.',
      'Last Sunday, we played a basketball match.'
    ]::text[],
    'play 加 -ed；last Sunday 表示过去时间。',
    '{}'::jsonb, '"比赛"用 game 或 match 都行。', 'past_simple_translation', true, 1, 9128
  ),
  (
    '把这句话译成英文：你昨晚几点完成作业的？',
    'translation', NULL, NULL, NULL, NULL, 'What time did you finish your homework last night?',
    ARRAY[
      'What time did you finish your homework last night?',
      'When did you finish your homework last night?',
      'At what time did you finish your homework last night?'
    ]::text[],
    '特殊疑问句：What time + did + you + **原形** finish。',
    '{}'::jsonb, NULL, 'past_simple_question', true, 2, 9129
  ),
  (
    '把这句话译成英文：那天下雨了，所以我们取消了野餐。',
    'translation', NULL, NULL, NULL, NULL, 'It rained that day, so we cancelled the picnic.',
    ARRAY[
      'It rained that day, so we cancelled the picnic.',
      'It rained that day, so we canceled the picnic.',
      'That day it rained, so we cancelled the picnic.',
      'It rained that day, and we cancelled the picnic.'
    ]::text[],
    '两个过去动作：rain → **rained**；cancel → **cancelled**（英式双写 l，美式 canceled 也接受）。',
    '{}'::jsonb, NULL, 'past_simple_translation', true, 2, 9130
  ),
  (
    '把这句话译成英文：尽管他迟到了，老师还是没批评他。',
    'translation', NULL, NULL, NULL, NULL, 'Although he was late, the teacher didn''t criticize him.',
    ARRAY[
      'Although he was late, the teacher didn''t criticize him.',
      'Although he was late, the teacher did not criticize him.',
      'Though he was late, the teacher didn''t criticize him.',
      'Even though he was late, the teacher didn''t criticize him.'
    ]::text[],
    '让步状语 Although/Though；was late + didn''t criticize（didn''t 后用**原形**）。',
    '{}'::jsonb, '中考写作高频结构：Although + 过去 + , + 主句过去。', 'past_simple_translation', true, 3, 9131
  )
) AS q(stem, question_type, option_a, option_b, option_c, option_d, correct_answer,
       accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,
       difficulty, sort_order);


-- ---- Sanity check ----
DO $$
DECLARE
  v_point_id   uuid;
  v_extra      int;
  v_total      int;
  v_easy       int;
  v_hard       int;
BEGIN
  SELECT id INTO v_point_id FROM junior_grammar_points WHERE code = 'g8.01';
  IF v_point_id IS NULL THEN
    RAISE EXCEPTION 'g8.01 row missing — cannot expand adaptive bank.';
  END IF;

  SELECT count(*) INTO v_extra FROM junior_grammar_questions
   WHERE point_id = v_point_id AND sort_order BETWEEN 9100 AND 9199;
  IF v_extra <> 32 THEN
    RAISE EXCEPTION 'Adaptive expansion failed for g8.01: expected 32 extra questions in 9100-9199, got %.', v_extra;
  END IF;

  SELECT count(*) INTO v_total FROM junior_grammar_questions
   WHERE point_id = v_point_id AND sort_order BETWEEN 9000 AND 9199;
  SELECT count(*) INTO v_easy FROM junior_grammar_questions
   WHERE point_id = v_point_id AND sort_order BETWEEN 9000 AND 9199 AND difficulty = 1;
  SELECT count(*) INTO v_hard FROM junior_grammar_questions
   WHERE point_id = v_point_id AND sort_order BETWEEN 9000 AND 9199 AND difficulty = 3;

  RAISE NOTICE 'g8.01 adaptive bank ready: % total questions (% easy / % hard).', v_total, v_easy, v_hard;
END $$;

-- =====================================================================
-- END · g8.01 adaptive question bank expansion
-- =====================================================================
