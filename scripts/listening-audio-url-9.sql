-- ============================================================
-- 关7听力音频预生成回填 audio_url(9); voice=nova speed=0.85; 填 edge 返回的 CF URL
-- 幂等:仅 audio_url IS NULL 才更新
-- ============================================================

-- U3 d2 "九年级 U3 听力·对话 Asking the Way to the Library" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/5a/5a7cd0bbffe0a2ac780cafaacf23c685acbd7eae5300c23e809cf632238078af.mp3' WHERE id = '8eb8fee4-cbca-4ac0-8f8d-e61631b26bec' AND audio_url IS NULL;

-- U3 d2 "九年级 U3 听力·对话 Asking About Places to Visit" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/12/12091e1f377dac2bc93d42b97c72fc67667662300d5e88a6bc17f2e78d5d19e1.mp3' WHERE id = '097d83b5-eec4-4e59-8e73-1d0e45a218e2' AND audio_url IS NULL;

-- U3 d2 "九年级 U3 听力·对话 Ordering at a Restaurant" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/9f/9f76c405395b24531bed54bef2d35d9e34b7dda2b42535c7eb89bcf313aaed12.mp3' WHERE id = '357bb332-328b-4581-a520-b8a86c4f288b' AND audio_url IS NULL;

-- U3 d2 "九年级 U3 听力·对话 Shopping for Books" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/a7/a75b392d53a346a50103c15276a63605afb934a16474e615116e4f27834cdb47.mp3' WHERE id = '0f5b9ebf-aede-4cf3-9e30-033a2f9067d0' AND audio_url IS NULL;

-- U3 d2 "九年级 U3 听力·短文 Welcome to Maple City" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/55/5557809018a2dd45c765b6f704988681bba61d8c0fbb0a031b85bd7d74048c7d.mp3' WHERE id = 'f596d367-039c-4ee2-ae0c-6fcb4ed484f1' AND audio_url IS NULL;

-- U3 d2 "九年级 U3 听力·对话 Asking for Help at School" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/e6/e69240c438aff35d7f8526b17f43e7b2c5d5a62d48c0ce3822216bd8a1f35ce4.mp3' WHERE id = 'cd121f24-fe5b-4930-8386-b153598efd84' AND audio_url IS NULL;

-- U4 d2 "九年级 U4 听力·对话 Meeting an Old Classmate" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/11/114ed5e4ceb5d166563c3d272a574184a10701410a059148394fd4c33b48a9e9.mp3' WHERE id = '59385134-85a3-4670-8d91-aed27ddd3f26' AND audio_url IS NULL;

-- U4 d2 "九年级 U4 听力·短文 How I Have Changed" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/b9/b962a15025b7c0861012fb2f41038850d08027e42d07cebcd6ef48501cb75587.mp3' WHERE id = 'bbeb5fb1-2986-4b1d-b1f6-458513ad0c37' AND audio_url IS NULL;

-- U4 d2 "九年级 U4 听力·对话 Talking About Old Fears" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/6c/6c71dfaf7299bc84b40fb448b22b1450d8befc3a0484cf03dc43520e89a6c658.mp3' WHERE id = '9b16d79d-9fd5-4adb-938c-3cf10b72255a' AND audio_url IS NULL;

-- U4 d2 "九年级 U4 听力·短文 My Cousin Mike" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/92/92a78a70ed9ae8a8c25296a92d8d0f8f066694f8205343f082eb21b6f59dfea4.mp3' WHERE id = '7c2c8695-8a00-4f43-82d5-c046cd4e433b' AND audio_url IS NULL;

-- U4 d2 "九年级 U4 听力·短文 Life in the Old Days" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/e6/e60b2ab3838fb0e3c18b895f28cd7e2a305f02942262e025327564d61265e8c0.mp3' WHERE id = 'e0f08d0e-742e-499a-ac73-b1da006b0a94' AND audio_url IS NULL;

-- U4 d2 "九年级 U4 听力·对话 Sharing How We Have Changed" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/0b/0b0717c202d042f5b53a2366c28a316762dd46c705b6770d5232cc3e285d6801.mp3' WHERE id = '0ac8daaa-52b6-492b-a98a-f463edacbd82' AND audio_url IS NULL;

-- 校验(单独跑): 9 已填 audio_url 的条数
SELECT unit, count(*) FROM junior_listening_exercises WHERE grade=9 AND volume='9' AND audio_url IS NOT NULL GROUP BY unit ORDER BY unit;
-- END OF FILE listening-audio-url-9.sql
