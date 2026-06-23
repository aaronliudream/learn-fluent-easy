-- ============================================================
-- 关7听力音频预生成回填 audio_url(9); voice=nova speed=0.85; 填 edge 返回的 CF URL
-- 幂等:仅 audio_url IS NULL 才更新
-- ============================================================

-- U10 d2 "九年级 U10 听力·对话 First Meeting Customs" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/68/68f20801e4b2753eb123a24f577b7190466944f109c15b1780fc2962af903972.mp3' WHERE id = '8cbd4686-92ce-4fa3-84ab-de33184beebb' AND audio_url IS NULL;

-- U10 d2 "九年级 U10 听力·短文 Maria's Dinner" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/22/229dcc598957ad9561863e3083eacd2c4d6f6cca504618dc90c1ae6696ead9ea.mp3' WHERE id = 'd72bc3a3-4713-42bf-b8af-77e6d6a74386' AND audio_url IS NULL;

-- U10 d2 "九年级 U10 听力·对话 Being on Time" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/e2/e234a815d2aea345c09022a9983647c12551da2c4db70bcccf4f004de2a35553.mp3' WHERE id = '76f43f7c-03b1-44ed-9db6-130272834504' AND audio_url IS NULL;

-- U10 d2 "九年级 U10 听力·短文 Table Manners" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/b1/b1a04fe6f236057083990cf35f9bfa685739c8fd5904a1db35f47a481d23b559.mp3' WHERE id = 'b187a9ec-f327-4f49-bee2-68f8d5f7388e' AND audio_url IS NULL;

-- U10 d2 "九年级 U10 听力·对话 An Exchange Student" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/12/124fb34d38048dbf8ae736ad19200b0fcd2f364b19c79b7643b522d58efa1cc7.mp3' WHERE id = '1b49ee77-2f0c-4085-ad80-0cb717da4356' AND audio_url IS NULL;

-- U10 d2 "九年级 U10 听力·短文 Welcome to Our School" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/96/9656d6fe0e4355e50132ede3dd3fb0fb2f799287bd34eab649050d714621ea82.mp3' WHERE id = 'fa4be3c7-ae40-4fc5-af4d-b1ce2b828fa1' AND audio_url IS NULL;

-- 校验(单独跑): 9 已填 audio_url 的条数
SELECT unit, count(*) FROM junior_listening_exercises WHERE grade=9 AND volume='9' AND audio_url IS NOT NULL GROUP BY unit ORDER BY unit;
-- END OF FILE listening-audio-url-9.sql
