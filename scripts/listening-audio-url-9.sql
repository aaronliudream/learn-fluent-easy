-- ============================================================
-- 关7听力音频预生成回填 audio_url(9); voice=nova speed=0.85; 填 edge 返回的 CF URL
-- 幂等:仅 audio_url IS NULL 才更新
-- ============================================================

-- U12 d2 "九年级 U12 听力·对话 A Bad Morning" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/01/0199dc3a69827e52305fa217a9ef82a25985cc38ec4c622159ca35de95d92fca.mp3' WHERE id = 'eb1ada55-001b-4927-ae30-bba332e37eb9' AND audio_url IS NULL;

-- U12 d2 "九年级 U12 听力·短文 The Radio Hoax" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/3c/3ccd8a63fa223a506f3c077e6018c1efa565e8b43cce211f7c4dc46d483b1d8f.mp3' WHERE id = 'fddb7d42-b7a5-4bfa-9be8-787717a1e746' AND audio_url IS NULL;

-- U12 d2 "九年级 U12 听力·对话 The Costume Mistake" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/68/68d6ce21c824c0fb615d714203a40e1d9f248df7aed536faa29f24541489c4f9.mp3' WHERE id = 'f5825166-4fee-4cd1-b97d-23785c77385c' AND audio_url IS NULL;

-- U12 d2 "九年级 U12 听力·短文 April Fool's Day" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/67/67433998ba01d940aa507318e59eaf2bbe99c933c9f1ccf18b96b3cb0bc7900a.mp3' WHERE id = '84b84ce1-cad2-4ca8-a8e9-e8a237b1f1e2' AND audio_url IS NULL;

-- U12 d2 "九年级 U12 听力·对话 The Lost Backpack" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/98/98d0e71ea2913f967750aa41b22ec1b7ec94af653cbd17d309a72f32de95df77.mp3' WHERE id = 'f91d338f-ea40-4bd4-a7f2-5a274097e3ec' AND audio_url IS NULL;

-- U12 d2 "九年级 U12 听力·短文 School April Fool's Rules" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/b8/b8967809bbe573b107aef615d50f8917f36944ef3eca222ea7a7ddaafa17c895.mp3' WHERE id = '9825dc85-342d-4f53-b0a8-bf6f7403c0a4' AND audio_url IS NULL;

-- 校验(单独跑): 9 已填 audio_url 的条数
SELECT unit, count(*) FROM junior_listening_exercises WHERE grade=9 AND volume='9' AND audio_url IS NOT NULL GROUP BY unit ORDER BY unit;
-- END OF FILE listening-audio-url-9.sql
