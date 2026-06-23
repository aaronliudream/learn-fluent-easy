-- ============================================================
-- 关7听力音频预生成回填 audio_url(9); voice=nova speed=0.85; 填 edge 返回的 CF URL
-- 幂等:仅 audio_url IS NULL 才更新
-- ============================================================

-- U9 d2 "九年级 U9 听力·对话 What Music Do You Like" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/a7/a7acbb4807ee96476a39e542db92cca4e997fba0ff53fd9eafba8696a6568e06.mp3' WHERE id = '82c98df7-a160-48bc-b12e-652cf993a3a3' AND audio_url IS NULL;

-- U9 d2 "九年级 U9 听力·短文 Abing's Story" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/3e/3e5bd4949d05ac60a496048b50ff3f89f18b18f57b5902944b06573f8d885824.mp3' WHERE id = '7c2e27a2-5a6f-406a-bae9-851d34723eb6' AND audio_url IS NULL;

-- U9 d2 "九年级 U9 听力·对话 Choosing a Movie" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/b9/b9bb8fa47352db1b1d59f507b4e2db403b7cdb4a1bce7a9c0a686d74dccd322f.mp3' WHERE id = 'b8871abd-01e5-4400-a434-788ed7cdc23f' AND audio_url IS NULL;

-- U9 d2 "九年级 U9 听力·短文 Why We Love Music" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/7f/7fdbe6a97c0d2b6ae4d377f314714b46c28b3fa7dfcb18ecd23d1f9ab81e1e15.mp3' WHERE id = 'd9ef6ae4-a4e6-4209-8338-2438f423f6ef' AND audio_url IS NULL;

-- U9 d2 "九年级 U9 听力·对话 At the Music Club" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/c1/c14a606dc7e75f441c3b011247808f0b4024288d1cb85aa602faf5e45cdbd32c.mp3' WHERE id = 'ac1585b2-9a14-41a8-8740-886f747fd0f9' AND audio_url IS NULL;

-- U9 d2 "九年级 U9 听力·短文 Kinds of Movies" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/f3/f341996d9f4ac93428e0e2df04e84ed04ea68fdc4bbbf67d3226e9aff0b44097.mp3' WHERE id = '3b495b86-67b6-485a-b52b-dd06e946974a' AND audio_url IS NULL;

-- 校验(单独跑): 9 已填 audio_url 的条数
SELECT unit, count(*) FROM junior_listening_exercises WHERE grade=9 AND volume='9' AND audio_url IS NOT NULL GROUP BY unit ORDER BY unit;
-- END OF FILE listening-audio-url-9.sql
