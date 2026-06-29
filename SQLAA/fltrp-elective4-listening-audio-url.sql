-- 外研社(fltrp)必修一 听力 audio_url 回填(0/36)。先跑各单元 load,再跑本文件。幂等。
BEGIN;
COMMIT;
SELECT unit, count(*) FILTER (WHERE audio_url IS NOT NULL) AS have_audio, count(*) AS total FROM public.junior_listening_exercises WHERE publisher='fltrp' AND volume='elective4' GROUP BY unit ORDER BY unit;
