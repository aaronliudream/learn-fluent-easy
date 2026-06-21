-- ============================================================
-- 关7听力音频预生成回填 audio_url(g9); voice=nova speed=0.85; 填 edge 返回的 CF URL
-- 幂等:仅 audio_url IS NULL 才更新
-- ============================================================

-- U1 d2 "九年级 U1 听力·对话 How to Practise Listening" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/9e/9ebbeba1a6140bdb35cb94082d6f36ed73844db234bef97bee42e24d107ba2b3.mp3' WHERE id = '16964506-978b-44f5-b85d-7f888e0c21d5' AND audio_url IS NULL;

-- U1 d2 "九年级 U1 听力·短文 Listening While Running" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/b0/b09b9bd9d9851889ee2b15bb299f894c26a2d50fa1b4ad367f724189e30490cc.mp3' WHERE id = '3b02786a-99bd-4909-8562-802e043533a7' AND audio_url IS NULL;

-- U1 d2 "九年级 U1 听力·对话 Guessing Words While Reading" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/90/90950fd1bb16fad20eef5bfcc61b7838b1069fcb0de2af8d495d974fd0353fc0.mp3' WHERE id = 'e3f76a85-a030-4181-a0fa-ea02ccf9355e' AND audio_url IS NULL;

-- U1 d2 "九年级 U1 听力·短文 Using a Learner's Dictionary" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/97/9714cfc653d2b56850bf8df142182423c0c2ee38c64717c879f0f757975926ff.mp3' WHERE id = 'c76636e2-e61a-46fd-9e29-8fea50751ccb' AND audio_url IS NULL;

-- U1 d2 "九年级 U1 听力·对话 Starting a Study Group" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/70/701c9dfade461924fb4bb681892c233e41a28e9d0d1e9e513598b94729d2decb.mp3' WHERE id = '9f74fab7-d86d-46a0-b804-9fcbaa353fc4' AND audio_url IS NULL;

-- U1 d2 "九年级 U1 听力·短文 Getting Ready Before Class" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/8c/8c1cd878731311ff9590386728c52e316aa841577c32f749c3c5c530186dd447.mp3' WHERE id = '7be09ad0-a23c-41cb-8b53-395459283169' AND audio_url IS NULL;

-- 校验(单独跑): g9 已填 audio_url 的条数
SELECT unit, count(*) FROM junior_listening_exercises WHERE grade=9 AND volume='g9' AND audio_url IS NOT NULL GROUP BY unit ORDER BY unit;
-- END OF FILE listening-audio-url-g9.sql
