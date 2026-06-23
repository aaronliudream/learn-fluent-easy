-- ============================================================
-- 关7听力音频预生成回填 audio_url(9); voice=nova speed=0.85; 填 edge 返回的 CF URL
-- 幂等:仅 audio_url IS NULL 才更新
-- ============================================================

-- U14 d2 "九年级 U14 听力·对话 Remembering Grade 7" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/1b/1ba0407a0d7e08fa347e8f9e9fb0ff4311705d0b73138f2d8d3066d2d0f99abb.mp3' WHERE id = 'd30ae222-ef06-4c22-ae60-53ef4912aea4' AND audio_url IS NULL;

-- U14 d2 "九年级 U14 听力·短文 A Graduation Speech" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/a7/a76836a5c8b9946c3bf4302b367be5aba39f971fa8b565543b3d4a41668f3538.mp3' WHERE id = '23a11557-8e56-421b-8315-2ef251ebc8bc' AND audio_url IS NULL;

-- U14 d2 "九年级 U14 听力·对话 Plans for Senior High" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/67/670938e2df4862b27b785529f009aa7c4ae7f8ad3d52cf6b89388479dff67d92.mp3' WHERE id = '35367cb8-80f8-4517-8c22-7099148c7fda' AND audio_url IS NULL;

-- U14 d2 "九年级 U14 听力·短文 Changes in Three Years" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/7d/7d39335c0a1c29357511420a90e30e1ffc180b1bb143efff2b005792d4336c06.mp3' WHERE id = '1311dbc8-d803-4066-b492-bee98d9fa17e' AND audio_url IS NULL;

-- U14 d2 "九年级 U14 听力·对话 Lily's Dream" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/eb/ebdea810ce5916a5347be46262becf09ae7fe0b30705e242264b5845f54358ce.mp3' WHERE id = 'd615c918-12bf-4a26-8c7a-fadf5efac1fe' AND audio_url IS NULL;

-- U14 d2 "九年级 U14 听力·短文 Graduation Day Notice" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/69/6943cb0d813eddba77cf580cc414fd925f294c303668ae6d0c731fb215c5f63a.mp3' WHERE id = '75102e74-3a47-42df-8639-36711b335d57' AND audio_url IS NULL;

-- 校验(单独跑): 9 已填 audio_url 的条数
SELECT unit, count(*) FROM junior_listening_exercises WHERE grade=9 AND volume='9' AND audio_url IS NOT NULL GROUP BY unit ORDER BY unit;
-- END OF FILE listening-audio-url-9.sql
