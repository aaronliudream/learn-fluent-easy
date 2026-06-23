-- ============================================================
-- 关7听力音频预生成回填 audio_url(9); voice=nova speed=0.85; 填 edge 返回的 CF URL
-- 幂等:仅 audio_url IS NULL 才更新
-- ============================================================

-- U13 d2 "九年级 U13 听力·短文 Save the Sharks" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/d5/d55ccb4b94062f322509ed3f388ffc7f9a0717abd5f333e861ceb3a6499bb5c5.mp3' WHERE id = '593732e0-c7a1-43bf-bb5a-4b207fc2b7d0' AND audio_url IS NULL;

-- U13 d2 "九年级 U13 听力·对话 The Three R's" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/30/307e32cedfe82b8c969ce8d943a044fa3c32b1b5ba710377a2c033f101349ee5.mp3' WHERE id = '23bb7bf5-1c09-4df3-bc25-c662b83cd6bb' AND audio_url IS NULL;

-- U13 d2 "九年级 U13 听力·短文 The Bottle House" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/53/538e4b5276373341b9ca777c417bd86972aecf8b39d88b80dc52ce2553c96125.mp3' WHERE id = '2c78b479-0a5a-4fa0-b28e-26c253855342' AND audio_url IS NULL;

-- U13 d2 "九年级 U13 听力·对话 A Reusable Bag" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/5b/5b9aacea737e2fed22166ee11422e9d49721d341b61909d6d33aed13b6c48e10.mp3' WHERE id = 'a37634ea-f5a0-4470-b7b7-67320522b500' AND audio_url IS NULL;

-- U13 d2 "九年级 U13 听力·短文 Green School Week" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/97/975ca39776914823e66b461bc7e54193c81e408e4d605ac6a61bb13689c92683.mp3' WHERE id = '90f2ba1b-bb87-4d09-9df1-9f8fdde12fcd' AND audio_url IS NULL;

-- U13 d2 "九年级 U13 听力·对话 Saving the Earth" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/f7/f7f1ec82fece9af36ff5518b338baaa98109a58ac8088a0fb160d46ffdfb6877.mp3' WHERE id = '53f429e5-6e67-44a7-8512-5d939ab73b5b' AND audio_url IS NULL;

-- 校验(单独跑): 9 已填 audio_url 的条数
SELECT unit, count(*) FROM junior_listening_exercises WHERE grade=9 AND volume='9' AND audio_url IS NOT NULL GROUP BY unit ORDER BY unit;
-- END OF FILE listening-audio-url-9.sql
