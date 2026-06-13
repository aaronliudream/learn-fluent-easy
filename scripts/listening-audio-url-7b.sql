-- ============================================================
-- 关7听力音频预生成回填 audio_url(7B); voice=nova speed=0.85; 填 edge 返回的 CF URL
-- 幂等:仅 audio_url IS NULL 才更新
-- ============================================================

-- U6 d1 "天气与活动 Weather and Activities" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/e3/e376297ee83f35c096cab2fe682df067f0c4a1f08dbe0f1a23b2e68d6a097db6.mp3' WHERE id = '7b6c0a01-9d2e-4f83-a1b5-6c7d8e9f0a11' AND audio_url IS NULL;

-- U6 d1 "大家在忙什么 What Is Everyone Doing" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/f9/f9ed38790fea3c6ed17995d72b0f7317a7450ac20124600dbcf772edaf48e5e8.mp3' WHERE id = '7b6c0a02-1d2e-4f83-a1b5-6c7d8e9f0a22' AND audio_url IS NULL;

-- U6 d1 "下雪天的电话 A Snowy Day Call" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/aa/aa73bb01407b3767795f0f258a3813d7a8e100093d1bf32d05971c20cbf2b44f.mp3' WHERE id = '7b6c0a03-2d3e-4f83-a1b5-6c7d8e9f0a33' AND audio_url IS NULL;

-- U6 d1 "公园野餐 A Picnic in the Park" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/3c/3ccf40fa68f3f3ec3ce8277205bc23ee7cefc9cfd946f30682e58a4b3fcd2cc5.mp3' WHERE id = '7b6c0a04-3d4e-4f83-a1b5-6c7d8e9f0a44' AND audio_url IS NULL;

-- 校验(单独跑): 7B 已填 audio_url 的条数
SELECT unit, count(*) FROM junior_listening_exercises WHERE grade=7 AND volume='7B' AND audio_url IS NOT NULL GROUP BY unit ORDER BY unit;
-- END OF FILE listening-audio-url-7b.sql
