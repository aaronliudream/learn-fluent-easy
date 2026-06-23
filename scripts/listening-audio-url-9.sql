-- ============================================================
-- 关7听力音频预生成回填 audio_url(9); voice=nova speed=0.85; 填 edge 返回的 CF URL
-- 幂等:仅 audio_url IS NULL 才更新
-- ============================================================

-- U6 d2 "九年级 U6 听力·对话 When Was It Invented" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/df/df829a393983c6b5e57d44497b38b1979fcc2ea5495ba0f5d1dc90cabf277958.mp3' WHERE id = 'd9c1c06e-fef7-456e-b02b-7ea456ef99e6' AND audio_url IS NULL;

-- U6 d2 "九年级 U6 听力·短文 The Potato Chip" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/50/5095f8963e06b7591e03f5dbb86cd4bad71ee97f8a80078a490ac3d9c30ee17f.mp3' WHERE id = 'cd6d5104-fd32-406d-b8cc-b0c6e25933cd' AND audio_url IS NULL;

-- U6 d2 "九年级 U6 听力·对话 What Is It Used For" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/0e/0e43b642be36a4223775a01614bef9c818197fdbbed2a937b606695327c85556.mp3' WHERE id = '7f28f4de-235f-4357-a4e9-5f72b2039229' AND audio_url IS NULL;

-- U6 d2 "九年级 U6 听力·短文 The Story of Tea" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/0d/0dbddbf46132449b4fa9b219df28ce91ea3521b71232de50277595e945ebba2b.mp3' WHERE id = '81e12e73-05d7-4292-8635-8fc7da687c76' AND audio_url IS NULL;

-- U6 d2 "九年级 U6 听力·对话 A Science Project" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/3e/3e7402341f3d808e52dfb7211a9340caaf79fbdcee719250c4213e11c3f56dac.mp3' WHERE id = 'ed8ed9cb-877f-4e10-89f6-3dcb410077dd' AND audio_url IS NULL;

-- U6 d2 "九年级 U6 听力·短文 Inventions in Our Life" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/f7/f7ee48fe4ee6f9f2ef97bf99c3422db3421080c2df6921de411c0808e8491a4f.mp3' WHERE id = 'f6d3062d-72eb-410b-b1f8-9ea65db84959' AND audio_url IS NULL;

-- 校验(单独跑): 9 已填 audio_url 的条数
SELECT unit, count(*) FROM junior_listening_exercises WHERE grade=9 AND volume='9' AND audio_url IS NOT NULL GROUP BY unit ORDER BY unit;
-- END OF FILE listening-audio-url-9.sql
