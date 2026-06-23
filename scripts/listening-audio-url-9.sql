-- ============================================================
-- 关7听力音频预生成回填 audio_url(9); voice=nova speed=0.85; 填 edge 返回的 CF URL
-- 幂等:仅 audio_url IS NULL 才更新
-- ============================================================

-- U7 d2 "九年级 U7 听力·对话 Choosing Clothes" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/f9/f97609ffd3e9b94a0dbe103302548a2b34ddc9f0aa90ea5c913b8f8bb8115765.mp3' WHERE id = '09ee5236-3dd1-4bea-92b1-a2c1dca07fc1' AND audio_url IS NULL;

-- U7 d2 "九年级 U7 听力·短文 Liu Yu's Dream" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/02/02ecd276c985c7a093a755fd92d5c5892f26a742411a5d8d8f3d9f37d71fd8c0.mp3' WHERE id = '647243eb-a548-4b7d-9c4d-85f4a25a7d31' AND audio_url IS NULL;

-- U7 d2 "九年级 U7 听力·对话 Part-Time Job" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/d9/d97639258a06ba07e51b47def0357a954ab46352257bebe6f4683cb90cae6add.mp3' WHERE id = '5b6af26a-e321-403f-a541-00ed5b7d589e' AND audio_url IS NULL;

-- U7 d2 "九年级 U7 听力·短文 Mom Knows Best" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/04/04252d2edfcb88b6b4945469c4d2e7a04ab64d8d180e36fa0df14b8f858d5f16.mp3' WHERE id = '6425ae39-c973-4023-82df-71890cd90f34' AND audio_url IS NULL;

-- U7 d2 "九年级 U7 听力·对话 At the Museum" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/3b/3b383d0fba2a73b19aa6e75480ab1ab46bc0bfe521fbfeb4bd57509115b63832.mp3' WHERE id = '42071d60-0e02-4b95-a07c-bd190aac8c0d' AND audio_url IS NULL;

-- U7 d2 "九年级 U7 听力·短文 School Rules" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/81/81268bba484347ef7358f6723e006a7e2d9c6e114827e65ab279f1545dd708c1.mp3' WHERE id = 'e2cbb1c9-f5f4-4b17-8e3b-fd919a2d8455' AND audio_url IS NULL;

-- 校验(单独跑): 9 已填 audio_url 的条数
SELECT unit, count(*) FROM junior_listening_exercises WHERE grade=9 AND volume='9' AND audio_url IS NOT NULL GROUP BY unit ORDER BY unit;
-- END OF FILE listening-audio-url-9.sql
