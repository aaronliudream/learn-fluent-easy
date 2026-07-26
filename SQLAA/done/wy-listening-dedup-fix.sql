-- ============================================================
-- 8-gram 雷同修正:3 篇听力稿改写(听力×阅读重合 3 对 → 0 对)
-- 只 UPDATE 不删不插;WHERE 用 id(不变量,且不在 SET 里)。
-- ★audio_url 一并置 NULL★ —— 转录变了,旧音频对不上文本,必须重新合成。
--   跑完本文件后须跟跑 pregenerate + 它产出的回填 SQL,否则听力关会念旧稿。
-- ============================================================

BEGIN;

DO $$
DECLARE n int; still_old int;
BEGIN
  -- wy7A U5《My little seed》(全重写)
  UPDATE public.junior_listening_exercises SET
    transcript = 'Hi, I am Lin. Next week my class will start a plant project. Each of us will get one seed and a small pot. I am going to put my pot near the window. Every morning I will give it a little water. My friend Tom will take photos of his plant every week. In June we will bring our plants to school and make a green corner in our classroom. What will my seed become? I am going to take care of it every day.',
    questions = '[{"type": "choice", "q": "Where will Lin put her pot?", "options": ["At school.", "In the garden.", "Near the window.", "In the dining hall."], "answer": "C", "explanation": "''I am going to put my pot near the window.''"}, {"type": "choice", "q": "What is the passage mainly about?", "options": ["How to take photos of plants.", "A class plant project and how Lin will look after her seed.", "Why June is a busy month.", "How to clean the classroom."], "answer": "B", "explanation": "''Next week my class will start a plant project.''"}]'::jsonb,
    audio_url = NULL
  WHERE id = '685fa829-598e-f221-f532-682dde897b03';
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'My little seed 影响 % 行,期望 1(WHERE 未命中,勿当成功)', n; END IF;

  -- wy7A U1《A day at school》(外科去重)
  UPDATE public.junior_listening_exercises SET
    transcript = 'My name is Emma, and I want to tell you about my school day. Our first class starts at eight. We have four lessons before lunch. My favourite is English, because our teacher is funny and kind. At twelve we have lunch in the school dining hall. After lunch there are two lessons, and then club time. I am in the art club. School is busy, but I enjoy every day.',
    questions = '[{"type": "choice", "q": "How many lessons does Emma have before lunch?", "options": ["Two.", "Three.", "Four.", "Five."], "answer": "C", "explanation": "''We have four lessons before lunch.''"}, {"type": "choice", "q": "How does Emma feel about her school life?", "options": ["Busy but happy.", "Boring and tired.", "Sad and lonely.", "Angry and afraid."], "answer": "A", "explanation": "''busy, but I enjoy every day.''"}]'::jsonb,
    audio_url = NULL
  WHERE id = '326846b9-3299-4d39-0a73-934f550e882a';
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'A day at school 影响 % 行,期望 1(WHERE 未命中,勿当成功)', n; END IF;

  -- wy8B U6《Living close to nature》(外科去重)
  UPDATE public.junior_listening_exercises SET
    transcript = 'People often ask whether we can live close to nature in a busy city. I believe we can. Every morning, I wonder what small thing I can do for the earth. I check whether I have turned off the lights. I decide how I will travel: by bike, not by car. I have learnt where the nearest park is, and I visit it often. I cannot say whether my choices matter to the whole planet, but every small action makes me proud. Living with nature begins with small daily choices.',
    audio_url = NULL
  WHERE id = '11fa119a-fa33-eb39-1f8a-fe3a86159c57';
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Living close to nature 影响 % 行,期望 1(WHERE 未命中,勿当成功)', n; END IF;

  -- 终态断言:三篇的旧句一句都不许再存在
  SELECT count(*) INTO still_old FROM public.junior_listening_exercises
   WHERE publisher = 'junior_fltrp'
     AND (transcript LIKE '%Today I put a small seed into the ground%'
       OR transcript LIKE '%In the morning we have four lessons%'
       OR transcript LIKE '%but I know how good it feels to try%');
  IF still_old <> 0 THEN RAISE EXCEPTION '仍有 % 条旧文本残留,改写未生效', still_old; END IF;
END $$;

COMMIT;

-- ============================================================
-- 跑完必看(Supabase 不显示 RAISE NOTICE,靠这条给证据)。
-- 期望 3 行,每行 audio_url_is_null = true;记下这 3 个 id,音频重生成后应变回 false。
-- ============================================================
SELECT volume, unit, title, (audio_url IS NULL) AS audio_url_is_null,
       length(transcript) AS transcript_len
  FROM public.junior_listening_exercises
 WHERE id IN ('685fa829-598e-f221-f532-682dde897b03',
                '326846b9-3299-4d39-0a73-934f550e882a',
                '11fa119a-fa33-eb39-1f8a-fe3a86159c57')
 ORDER BY volume, unit;
