-- ============================================================
-- 关7听力音频预生成回填 audio_url(9); voice=nova speed=0.85; 填 edge 返回的 CF URL
-- 幂等:仅 audio_url IS NULL 才更新
-- ============================================================

-- U5 d2 "九年级 U5 听力·对话 Asking About a Shirt" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/76/76702e425a713259ed4bf6e91c3a0f2b9c730f519e2c68b7d2939edc6395be35.mp3' WHERE id = 'dbd14088-9bc3-450d-9f5c-a1bc194c70b4' AND audio_url IS NULL;

-- U5 d2 "九年级 U5 听力·短文 How Tea Is Made" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/c2/c20b07e70be84b13a7329e5ef42e7baf909acc69e1dbe33ff29b8ed264ee8e28.mp3' WHERE id = '8183912c-e31d-4869-9ac0-7e2edf8b7f81' AND audio_url IS NULL;

-- U5 d2 "九年级 U5 听力·对话 At the Science Fair" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/11/110cbdd7b9cd697b83efb673d7a1f41e9631226c3000fc1032562c717029a67a.mp3' WHERE id = '599ba6ce-d448-43be-baee-30d755e4721c' AND audio_url IS NULL;

-- U5 d2 "九年级 U5 听力·短文 Paper Cutting" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/f2/f2c9790a61249169804d985b9e884597b168130ec0d9ffa4b76e4850e2332b1b.mp3' WHERE id = '87c31351-537a-4cbf-9a75-81d4625b7487' AND audio_url IS NULL;

-- U5 d2 "九年级 U5 听力·对话 Buying a Handbag" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/d8/d8a6330db4e1ed30f0b927edd186f9558f409bf3aa0d64765155fcf86c7c5cac.mp3' WHERE id = '3da8696c-31af-4411-96dc-fd7643f9b6fb' AND audio_url IS NULL;

-- U5 d2 "九年级 U5 听力·短文 Clay Figures" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/75/759c1bb99dbdc32cf200c91c3db9b512733ee9c9065dad3391414647cc708de1.mp3' WHERE id = '05fd5c33-e278-465b-b5eb-8540376b28f2' AND audio_url IS NULL;

-- 校验(单独跑): 9 已填 audio_url 的条数
SELECT unit, count(*) FROM junior_listening_exercises WHERE grade=9 AND volume='9' AND audio_url IS NOT NULL GROUP BY unit ORDER BY unit;
-- END OF FILE listening-audio-url-9.sql
