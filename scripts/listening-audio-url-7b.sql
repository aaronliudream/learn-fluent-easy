-- ============================================================
-- 关7听力音频预生成回填 audio_url(7B); voice=nova speed=0.85; 填 edge 返回的 CF URL
-- 幂等:仅 audio_url IS NULL 才更新
-- ============================================================

-- U2 d1 "游泳馆规则 Swimming Pool Rules" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/0c/0cf1ffa7d6c77e38e99aed72d33558a016402568182b803ff2a08b6a259b9ba2.mp3' WHERE id = '7b02a001-1d2e-4f83-a1b5-6c7d8e9f0201' AND audio_url IS NULL;

-- U2 d1 "博物馆规则 Museum Rules" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/d5/d52445cbd4e4f34af0f87bdb18ee305d233a5fef76929c214484f35622700a4b.mp3' WHERE id = '7b02a002-1d2e-4f83-a1b5-6c7d8e9f0202' AND audio_url IS NULL;

-- U2 d1 "公园规则 Park Rules" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/f9/f91fe97c23cb48b3f803c57b560b160dcd5a1bf540252c7c6546182b79d0f4c1.mp3' WHERE id = '7b02b001-1d2e-4f83-a1b5-6c7d8e9f0203' AND audio_url IS NULL;

-- U3 d1 "锻炼习惯 Exercise Habits" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/1c/1c631f5e41e84f16b1a5d28b5b8b3e0d4d9617231a5eb10a7c24e6781fbfa079.mp3' WHERE id = '7b03a001-1d2e-4f83-a1b5-6c7d8e9f0301' AND audio_url IS NULL;

-- U3 d1 "保持健康 Staying Healthy" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/a5/a5947f3d35f94e43d8e7c193fe5afcb8bd1ac43f0d84f4d199341fe02895a258.mp3' WHERE id = '7b03a002-1d2e-4f83-a1b5-6c7d8e9f0302' AND audio_url IS NULL;

-- U3 d1 "健身计划 A Fitness Plan" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/ff/fff534ca9843657c889aebef9872e69800f97a20023603a8a6ba65648c45f545.mp3' WHERE id = '7b03b001-1d2e-4f83-a1b5-6c7d8e9f0303' AND audio_url IS NULL;

-- U4 d1 "健康饮食 Eating Well" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/96/960abe95e57d3060ccac5390954e5e7b6686721d1f82023aba255b9ebbeafabc.mp3' WHERE id = '7b04a001-1d2e-4f83-a1b5-6c7d8e9f0401' AND audio_url IS NULL;

-- U4 d1 "餐厅点餐 Ordering Food" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/9e/9e56c869e08eb5648f611d148a5ce6777a524766bb3b8f1dff8cd3033502d83e.mp3' WHERE id = '7b04a002-1d2e-4f83-a1b5-6c7d8e9f0402' AND audio_url IS NULL;

-- U4 d1 "健康的一餐 A Healthy Meal" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/e2/e22f83df904b48c84b8576b71fe8dcd9dfe62946269d62646c30813caaadcabb.mp3' WHERE id = '7b04b001-1d2e-4f83-a1b5-6c7d8e9f0403' AND audio_url IS NULL;

-- U5 d1 "此刻在做什么 What Are They Doing Now" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/44/44e0bce8b6bc0284cec98713a6bdbe14b4e5724fe81b8adb60ed4d89fe81c23f.mp3' WHERE id = '7b05a001-1d2e-4f83-a1b5-6c7d8e9f0501' AND audio_url IS NULL;

-- U5 d1 "电话聊天 On the Phone" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/65/6568105c9c2200980753c9bab13ed9e923f997d15c51ae8abd9a7432b4201c2b.mp3' WHERE id = '7b05a002-1d2e-4f83-a1b5-6c7d8e9f0502' AND audio_url IS NULL;

-- U5 d1 "此刻的电话 A Call Right Now" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/4f/4f888f9a8e0d90a8ae8d6c84cdae304baf1c67a83b20b224c5db9c717ee9fbf0.mp3' WHERE id = '7b05b001-1d2e-4f83-a1b5-6c7d8e9f0503' AND audio_url IS NULL;

-- U7 d1 "难忘的一天 An Unforgettable Day" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/f3/f3777a3e9c22d3367ca9b1f47ba4c19442b65716309adafcfcd981c43fc91135.mp3' WHERE id = '7b07a001-1d2e-4f83-a1b5-6c7d8e9f0701' AND audio_url IS NULL;

-- U7 d1 "上周做了什么 Last Week" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/21/21c30307b2e8f5e02bed87b9b951b83d8441d41d18fb3fc11e08647398306443.mp3' WHERE id = '7b07a002-1d2e-4f83-a1b5-6c7d8e9f0702' AND audio_url IS NULL;

-- U7 d1 "难忘的旅行 An Unforgettable Trip" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/8e/8e629b4e1aa45d3bd4e9edbb5e7fa6354877ed0c66118b5d8416282ee424465f.mp3' WHERE id = '7b07b001-1d2e-4f83-a1b5-6c7d8e9f0703' AND audio_url IS NULL;

-- U8 d1 "狮子与老鼠 The Lion and the Mouse" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/69/6958e9255ca164b0a965432cb27d901e7d4cdd16e1a06575a69261ce3dc3a4e2.mp3' WHERE id = '7b08b001-1d2e-4f83-a1b5-6c7d8e9f0801' AND audio_url IS NULL;

-- 校验(单独跑): 7B 已填 audio_url 的条数
SELECT unit, count(*) FROM junior_listening_exercises WHERE grade=7 AND volume='7B' AND audio_url IS NOT NULL GROUP BY unit ORDER BY unit;
-- END OF FILE listening-audio-url-7b.sql
