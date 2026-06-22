-- ============================================================
-- 关7听力音频预生成回填 audio_url(g9); voice=nova speed=0.85; 填 edge 返回的 CF URL
-- 幂等:仅 audio_url IS NULL 才更新
-- ============================================================

-- U2 d2 "九年级 U2 听力·对话 Watching the Dragon Boat Races" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/b6/b697a392485297e37188b6a7dfd70d46e02b884e51f0f871b7ecabb46e0a6454.mp3' WHERE id = '1ecc7851-007c-4ce0-ac6d-7344cb01b809' AND audio_url IS NULL;

-- U2 d2 "九年级 U2 听力·短文 How My Family Celebrates Spring Festival" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/e2/e253044ae1771fe5a172e6b5209fc4d1d095cc951b118bda02f2923b2cd010ea.mp3' WHERE id = '8a0bd996-7221-4bbe-9fed-07bb888144be' AND audio_url IS NULL;

-- U2 d2 "九年级 U2 听力·对话 Asking about the Mid-Autumn Festival" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/a9/a9a8c65023595deaa064afec2a2fe90b655a3020e1dc71f8a9271c19c79ae1bb.mp3' WHERE id = 'b5403da9-5215-43a1-9ec6-1a260dba85cc' AND audio_url IS NULL;

-- U2 d2 "九年级 U2 听力·短文 My Water Festival Day" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/10/10c2730d6d928a7a7c46092a9018a81fd8e8ac7463669e10eaa7fcc57fb6e423.mp3' WHERE id = 'b47cd187-b271-4884-8759-9a58e36c01d9' AND audio_url IS NULL;

-- U2 d2 "九年级 U2 听力·对话 Our Favourite Festivals" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/ba/ba4ac2c793a52b5288c5587fd08d111b9bd8945c247d52eef62f98e08406fa0b.mp3' WHERE id = '8f32aeb7-9673-410c-8cc0-1d4ff2fb73ea' AND audio_url IS NULL;

-- U2 d2 "九年级 U2 听力·短文 Making Zongzi with Grandma" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/c5/c5fe45d24b2cc85525b0f933f6a8dff51f7e7bd6dfa91fc52562aa6aa1236768.mp3' WHERE id = 'd55f3d41-be86-427b-860a-dc8b9d382d35' AND audio_url IS NULL;

-- 校验(单独跑): g9 已填 audio_url 的条数
SELECT unit, count(*) FROM junior_listening_exercises WHERE grade=9 AND volume='g9' AND audio_url IS NOT NULL GROUP BY unit ORDER BY unit;
-- END OF FILE listening-audio-url-g9.sql
