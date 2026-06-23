-- ============================================================
-- 关7听力音频预生成回填 audio_url(9); voice=nova speed=0.85; 填 edge 返回的 CF URL
-- 幂等:仅 audio_url IS NULL 才更新
-- ============================================================

-- U11 d2 "九年级 U11 听力·对话 Sad Movies" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/dc/dcf9da778ea8a4e161d1664ff6b61a572a6a8ee5fd68edb965e3c2e098d6e529.mp3' WHERE id = 'c0e240c5-53f0-4f3f-b303-1441012732ac' AND audio_url IS NULL;

-- U11 d2 "九年级 U11 听力·短文 The Happy Man's Shirt" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/c5/c5a6bf109da9f97b380ece006282d3165225ca1837812b31b5cda812c9433b7b.mp3' WHERE id = '014b538a-ca45-4756-b584-253db53d7fbd' AND audio_url IS NULL;

-- U11 d2 "九年级 U11 听力·对话 The Soccer Team" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/44/443100c0f10a93f8d4b077284a562e311d5e1406aaab4eb9b7ca33d8895e501f.mp3' WHERE id = '6f111f37-94f2-4811-9f56-3be5ca08f647' AND audio_url IS NULL;

-- U11 d2 "九年级 U11 听力·短文 How Music Affects Us" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/e8/e80a21d56600b0148b29c51746bd59877926eeaa162355d823212d1dc77c2bb4.mp3' WHERE id = '453ec2fd-f61b-4495-ae73-28b12474364c' AND audio_url IS NULL;

-- U11 d2 "九年级 U11 听力·对话 Two Friends" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/82/82176d0e378ec85e35bfc9f73417dd550f60016682fc8115936d9d55f8f8d7b3.mp3' WHERE id = '4b115f4f-d1ba-4a1a-a1ca-aea163b053fb' AND audio_url IS NULL;

-- U11 d2 "九年级 U11 听力·短文 Friendship Week" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/1b/1bc69398c67fe168e6db75e5e49b4ebea559f58e4d6a4da3fbab72b8e3a70a0a.mp3' WHERE id = '37a36e06-c71b-4472-a068-4ad578a57010' AND audio_url IS NULL;

-- 校验(单独跑): 9 已填 audio_url 的条数
SELECT unit, count(*) FROM junior_listening_exercises WHERE grade=9 AND volume='9' AND audio_url IS NOT NULL GROUP BY unit ORDER BY unit;
-- END OF FILE listening-audio-url-9.sql
