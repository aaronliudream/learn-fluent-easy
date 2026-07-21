-- ============================================================
-- 关7听力音频预生成回填 audio_url(8B); voice=nova speed=0.85; 填 edge 返回的 CF URL
-- 幂等:仅 audio_url IS NULL 才更新
-- ============================================================

-- U1 d1 "假日的爱好 Holiday Hobbies" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/3a/3a9cf4344c51c1d9b2a50596eec59a95678f9b721fa344d8c0537c8fb6936945.mp3' WHERE id = '8b010002-0000-4000-8000-000000000002' AND audio_url IS NULL;

-- U1 d1 "周末怎么放松 How to Relax on Weekends" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/3c/3c4d2539cbe7e225b8698d73692cd698d589f4a8d873f8594d32830111a9a097.mp3' WHERE id = '8b010001-0000-4000-8000-000000000001' AND audio_url IS NULL;

-- U1 d1 "我最爱的放松方式 My Favorite Way to Relax" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/23/2319c37e12427bd680fb1d0ead0bcd42e9e6891e9475b8e6eba91554eb5559e6.mp3' WHERE id = '8b010006-0000-4000-8000-000000000006' AND audio_url IS NULL;

-- U1 d2 "太忙没时间休息 Too Busy to Rest" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/0e/0ecc3f192f196e2e2f0a31fde2c69e371c8c6fcc079276bf5e2ce18769301cd1.mp3' WHERE id = '8b010003-0000-4000-8000-000000000003' AND audio_url IS NULL;

-- U1 d2 "放松的重要性 The Importance of Relaxing" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/a3/a3d627f8890cd1d3ae1bdc98959e708b7a12e011bb066a23bef4aa89522270a1.mp3' WHERE id = '8b010004-0000-4000-8000-000000000004' AND audio_url IS NULL;

-- U1 d2 "一起去郊游 Going on a Day Trip" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/e6/e622a350287fe76563a31f997c5d36e0b46a4a6bf04417fe858c456c5f259f04.mp3' WHERE id = '8b010005-0000-4000-8000-000000000005' AND audio_url IS NULL;

-- U2 d1 "我的健康生活 My Healthy Life" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/5d/5da46e42fb54f9d1037825320a87993c0268107e275eee69556ae3b747c4e50e.mp3' WHERE id = '8b020006-0000-4000-8000-000000000006' AND audio_url IS NULL;

-- U2 d1 "看医生 Seeing a Doctor" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/9c/9c79caa8962d6b99a01f9d81f6309491e29a6d75df9a17cb71305531c514db83.mp3' WHERE id = '8b020001-0000-4000-8000-000000000001' AND audio_url IS NULL;

-- U2 d1 "健康的习惯 Healthy Habits" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/b9/b94eb37b81dec314e5513e573bac2e57dfc528ccca14eed4186d0cdada0206e3.mp3' WHERE id = '8b020002-0000-4000-8000-000000000002' AND audio_url IS NULL;

-- U2 d2 "健康饮食金字塔 The Healthy Food Pyramid" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/5c/5ca785da0cac2ed65cda484e03b80fb3ad64ec72785ecbf51d7b6715e1d973cc.mp3' WHERE id = '8b020004-0000-4000-8000-000000000004' AND audio_url IS NULL;

-- U2 d2 "运动让我健康 Sports Keep Me Healthy" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/64/64814d9fbae1ac66af3b45cd80cc5e08584ed7cb8061f26d86bb257d12baca6e.mp3' WHERE id = '8b020005-0000-4000-8000-000000000005' AND audio_url IS NULL;

-- U2 d2 "给生病同学的建议 Advice for a Sick Friend" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/b9/b96add6192d7f9da269e97913ea6dc3b2077a5c3f015a33eb80910b3178d59c6.mp3' WHERE id = '8b020003-0000-4000-8000-000000000003' AND audio_url IS NULL;

-- U3 d1 "长大后想做什么 What to Be When I Grow Up" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/ae/aee9daede88fcddc14ce87cd7cc15c4f0218c7b69dddcef306d14faf52cd1a05.mp3' WHERE id = '8b030001-0000-4000-8000-000000000001' AND audio_url IS NULL;

-- U3 d1 "小时候的我 When I Was Young" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/65/6558af32904b3df07c3d445ab200cd89592ba18f34a341ea559e6e1f0b896f5a.mp3' WHERE id = '8b030002-0000-4000-8000-000000000002' AND audio_url IS NULL;

-- U3 d1 "给十年后自己的信 A Letter to My Future Self" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/57/57ccbe5677c640ddbd7eecc862438369603ce52bcc9c1bb5d82074df6ff6830e.mp3' WHERE id = '8b030006-0000-4000-8000-000000000006' AND audio_url IS NULL;

-- U3 d2 "成长意味着什么 What Growing Up Means" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/bb/bb5425c1ea138488cd755a1911b5b485227c53494377bba10b269fb4dcd29f7f.mp3' WHERE id = '8b030004-0000-4000-8000-000000000004' AND audio_url IS NULL;

-- U3 d2 "学会独立 Learning to Be Independent" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/46/46f56ab3627aca2b316fd615b03841271b396986a6000ce366d4f4d07add929d.mp3' WHERE id = '8b030005-0000-4000-8000-000000000005' AND audio_url IS NULL;

-- U3 d2 "成长的烦恼 Growing Pains" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/34/343a489726af6ff8150bd24db37c86ec60af90a8d679b89fdb516d8bde10f308.mp3' WHERE id = '8b030003-0000-4000-8000-000000000003' AND audio_url IS NULL;

-- U4 d1 "世界第一高峰 The World's Highest Mountain" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/67/675ee707a92ba8479c827961f176350408c621778bd627e2889ecbf1aaf8787b.mp3' WHERE id = '8b040001-0000-4000-8000-000000000001' AND audio_url IS NULL;

-- U4 d1 "美丽的大堡礁 The Beautiful Great Barrier Reef" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/ae/ae939a91de745df52dc04c0d8a8ce0448c8a4c20b25e493d3e3d2b73b58cbb4d.mp3' WHERE id = '8b040002-0000-4000-8000-000000000002' AND audio_url IS NULL;

-- U4 d1 "为什么我们探索自然 Why We Explore Nature" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/eb/eb5bd9612389e36762bd145f3f42ec7f490d0419d111819f508bb6bf7af063c8.mp3' WHERE id = '8b040006-0000-4000-8000-000000000006' AND audio_url IS NULL;

-- U4 d2 "中国的大河 The Great Rivers of China" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/29/29cb59d5c8207dca8ec43532cf7692802af5a6f39731e265064b5432c9cc982f.mp3' WHERE id = '8b040003-0000-4000-8000-000000000003' AND audio_url IS NULL;

-- U4 d2 "勇攀高峰的中国队 The Brave Chinese Climbers" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/36/36ce62c42e296d02377986461cd467f230825231e953e926fab0ca7a650e662c.mp3' WHERE id = '8b040004-0000-4000-8000-000000000004' AND audio_url IS NULL;

-- U4 d2 "参观自然博物馆 Visiting the Nature Museum" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/12/12259bfe1d6bb8576f23fd333d5fbc519fc6f3e0270d3ee97fdf3e6ce2564298.mp3' WHERE id = '8b040005-0000-4000-8000-000000000005' AND audio_url IS NULL;

-- U5 d1 "暴风雨来临 The Coming Storm" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/2d/2db72509175012622a2a450ba3f8546eae372e3a910fabc133bd5632b505c576.mp3' WHERE id = '8b050001-0000-4000-8000-000000000001' AND audio_url IS NULL;

-- U5 d1 "地理课的力量 The Power of Geography Lessons" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/cb/cbb9408817a50c75b6e7bd8d608fb55c94dd80de5fb026fafed64d9ecf056a92.mp3' WHERE id = '8b050006-0000-4000-8000-000000000006' AND audio_url IS NULL;

-- U5 d2 "海啸的预警信号 Warning Signs of a Tsunami" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/b5/b50909db3557bbbb360c9693a9a26bcf4f88f6ae404662ed758bb8e4fe8f508f.mp3' WHERE id = '8b050003-0000-4000-8000-000000000003' AND audio_url IS NULL;

-- U5 d2 "一个女孩拯救了许多生命 How One Girl Saved Many Lives" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/b3/b35e79805a2ec04f9fe3a8cebb4ce954e895b40fcb471b76400e636ead637318.mp3' WHERE id = '8b050004-0000-4000-8000-000000000004' AND audio_url IS NULL;

-- U5 d2 "为最坏情况做准备 Preparing for the Worst" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/25/25b59546a277de59487e9b04a2fe314359c05a1cce24d50f1154ef86d7e359ab.mp3' WHERE id = '8b050005-0000-4000-8000-000000000005' AND audio_url IS NULL;

-- U5 d2 "地震时怎么办 What to Do in an Earthquake" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/46/462621c68995f0a3d4236d4ce303db74ed5d4e4161651cb0dad78a95529854c2.mp3' WHERE id = '8b050002-0000-4000-8000-000000000002' AND audio_url IS NULL;

-- U6 d1 "尊重文化差异 Respecting Cultural Differences" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/9a/9aefcb9ed8bbe8c5280b63c79c8a8bd8942bc9ce02af77a175cffc093d9e1b16.mp3' WHERE id = '8b060006-0000-4000-8000-000000000006' AND audio_url IS NULL;

-- U6 d1 "英国餐桌礼仪 British Table Manners" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/1d/1d5eb2b375230b91347c5415265ff611fb136944118fd1fee9f6c1bbcb9fdac4.mp3' WHERE id = '8b060001-0000-4000-8000-000000000001' AND audio_url IS NULL;

-- U6 d2 "不同国家的问候 Greetings Around the World" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/e5/e5cea9f260b4b2f13f590769f4052017df455da878dd00382aa9cd86d30cabb7.mp3' WHERE id = '8b060005-0000-4000-8000-000000000005' AND audio_url IS NULL;

-- U6 d2 "法国派对的习俗 French Party Customs" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/be/bea25d9e711e69e693bd9f36c28105fe1342ebb12098ae9b585d1fe3eee4b152.mp3' WHERE id = '8b060002-0000-4000-8000-000000000002' AND audio_url IS NULL;

-- U6 d2 "语言的力量 The Power of Language" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/93/93a2538926d5ac8dc33e79caecb144bfde1f070247081b6cb24173be6c4a8b65.mp3' WHERE id = '8b060004-0000-4000-8000-000000000004' AND audio_url IS NULL;

-- U6 d2 "安全的聊天话题 Safe Topics to Talk About" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/f8/f8aed39e67482882579a8e3a26df544aec808a72b71da5860b43494e35dc56ee.mp3' WHERE id = '8b060003-0000-4000-8000-000000000003' AND audio_url IS NULL;

-- U7 d1 "你读过这本书吗 Have You Read This Book" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/e7/e7a108ac303fe7b5f03177d9cb65a8f2b9569cebb58712c60f647c88cbc2b739.mp3' WHERE id = '8b070001-0000-4000-8000-000000000001' AND audio_url IS NULL;

-- U7 d1 "读书的乐趣 The Joy of Reading" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/e8/e883400340de69810f20333be07b0ccbc2ae5eda5916765227c170ffcbada0c0.mp3' WHERE id = '8b070006-0000-4000-8000-000000000006' AND audio_url IS NULL;

-- U7 d2 "老人与海 The Old Man and the Sea" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/f2/f254661cf54aed4c3ef274e2c63b189b11a19af1d61736d8d46a509c55f77a60.mp3' WHERE id = '8b070004-0000-4000-8000-000000000004' AND audio_url IS NULL;

-- U7 d2 "秘密花园 The Secret Garden" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/5f/5ff73054ff2214fd47723859c92ace2d149806d9e7bacdadd2b4a8b4bba421ca.mp3' WHERE id = '8b070002-0000-4000-8000-000000000002' AND audio_url IS NULL;

-- U7 d2 "书和电影哪个好 Books or Movies" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/86/86eaec7499e27016aff3e28245f26bafaae294ebe1380d9ce2edcc278e0fe55b.mp3' WHERE id = '8b070003-0000-4000-8000-000000000003' AND audio_url IS NULL;

-- U7 d2 "图书馆借书 Borrowing Books at the Library" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/e6/e698589faba81431534dfdb56de2ab5339d51f83d93fb849e836ce35c9494f4e.mp3' WHERE id = '8b070005-0000-4000-8000-000000000005' AND audio_url IS NULL;

-- U8 d1 "暑假做志愿者 Volunteering in Summer" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/46/4603a617899fd0d4d9acb2484577bbd7651e8d069cad806894ab526189cbbdc9.mp3' WHERE id = '8b080001-0000-4000-8000-000000000001' AND audio_url IS NULL;

-- U8 d1 "动物收容所的一天 A Day at the Animal Shelter" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/bd/bdec6eddb09ed8f2787fcda96c63aec62c58906293728b52391c90974f8c38aa.mp3' WHERE id = '8b080002-0000-4000-8000-000000000002' AND audio_url IS NULL;

-- U8 d1 "我们都能做出改变 We Can All Make a Difference" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/7a/7a916a217f0021d2becd1231a95df08aa9bdf5980260ac76ad097710ef0636ee.mp3' WHERE id = '8b080006-0000-4000-8000-000000000006' AND audio_url IS NULL;

-- U8 d2 "一名救援队员的故事 A Rescue Hero's Story" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/a7/a7340e2ba8e6a0186ed094fe5760154601109a4a1bdfdd583ab2778236fa40c9.mp3' WHERE id = '8b080003-0000-4000-8000-000000000003' AND audio_url IS NULL;

-- U8 d2 "蓝天救援队 Blue Sky Rescue" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/e3/e3c760907b78ac9e6ebc52761a749ff728202881397305be06a2acbf7ee0436c.mp3' WHERE id = '8b080004-0000-4000-8000-000000000004' AND audio_url IS NULL;

-- U8 d2 "小行动大改变 Small Actions Big Changes" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/8b/8be3221622ef99cc379afc3e3af3d2e5b48dfc36f8b8d64a85c39b83fe952276.mp3' WHERE id = '8b080005-0000-4000-8000-000000000005' AND audio_url IS NULL;

-- 校验(单独跑): 8B 已填 audio_url 的条数
SELECT unit, count(*) FROM junior_listening_exercises WHERE grade=8 AND volume='8B' AND audio_url IS NOT NULL GROUP BY unit ORDER BY unit;
-- END OF FILE listening-audio-url-8b.sql
