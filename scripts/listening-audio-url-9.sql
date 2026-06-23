-- ============================================================
-- 关7听力音频预生成回填 audio_url(9); voice=nova speed=0.85; 填 edge 返回的 CF URL
-- 幂等:仅 audio_url IS NULL 才更新
-- ============================================================

-- U8 d2 "九年级 U8 听力·对话 Whose Volleyball" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/ae/ae8627a5cc2f5019bbe6a90fa2dc46f68ecde00a7c4df7ea179ac811b46d1650.mp3' WHERE id = 'e09ccc7a-e292-4c97-be94-6b9e31da012e' AND audio_url IS NULL;

-- U8 d2 "九年级 U8 听力·短文 The Mystery of Stonehenge" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/0f/0fc420459fa12178174bbe1391891823e3ff529ffbd1a5c790a86dc858e82d8b.mp3' WHERE id = '3a8bca5b-20e1-47bc-8508-5d42a80d2d6a' AND audio_url IS NULL;

-- U8 d2 "九年级 U8 听力·对话 A Strange Noise" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/8f/8f7bdcd56ac532dc29cb53e85b64a5f00680f38675934cd0b0a54c5042bca133.mp3' WHERE id = '05b3d96e-945d-4b6c-8339-6ceb677eb8e1' AND audio_url IS NULL;

-- U8 d2 "九年级 U8 听力·短文 The UFO Night" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/cd/cd30d9c4383e5067a29918e9c232da5d2723360dc0f1ceb64642891db5c3d90b.mp3' WHERE id = '2385fec1-e230-4d4a-b457-2773f28bf95a' AND audio_url IS NULL;

-- U8 d2 "九年级 U8 听力·对话 Whose Things" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/63/639ac804a721f2bd2e39321b63b7c2a4ca5916b63fc22f8a14a05a10a9e0898b.mp3' WHERE id = '12295ed5-0103-4ba4-8374-bb4bda13e261' AND audio_url IS NULL;

-- U8 d2 "九年级 U8 听力·短文 Making Guesses" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/cc/cc99a0f727c54fbc20a9f1ffcd1e30acf8199574d07da895c0455f97859b848c.mp3' WHERE id = '86bea9c8-19b5-4c45-98d1-f944e3746817' AND audio_url IS NULL;

-- 校验(单独跑): 9 已填 audio_url 的条数
SELECT unit, count(*) FROM junior_listening_exercises WHERE grade=9 AND volume='9' AND audio_url IS NOT NULL GROUP BY unit ORDER BY unit;
-- END OF FILE listening-audio-url-9.sql
