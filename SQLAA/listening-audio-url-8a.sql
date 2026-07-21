-- ============================================================
-- 关7听力音频预生成回填 audio_url(8A); voice=nova speed=0.85; 填 edge 返回的 CF URL
-- 幂等:仅 audio_url IS NULL 才更新
-- ============================================================

-- U1 d1 "难忘的旅行 An Unforgettable Trip" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/70/70dd2da5b482949c7c61ffbafdc7b2a63cdc165b42dcb2dfad9b23e5283256f4.mp3' WHERE id = '8a010002-0000-4000-8000-000000000002' AND audio_url IS NULL;

-- U1 d1 "小明的国庆节 Xiaoming's National Day" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/a6/a61eb75380265491d4cb0d3d5904507fd550724ea175db7105cb02fcd6a12d99.mp3' WHERE id = '8a010006-0000-4000-8000-000000000006' AND audio_url IS NULL;

-- U1 d1 "暑假计划 Summer Holiday Plans" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/2c/2ca1a0869d95f4db71af0adf157f984f6390362753a165eca5a3dd8a507638e3.mp3' WHERE id = '8a010001-0000-4000-8000-000000000001' AND audio_url IS NULL;

-- U1 d2 "假期购物 Holiday Shopping" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/77/77dc97bca9c9165ec3928a858ef62205d4fdfb133a7553ccf9889c015bf33706.mp3' WHERE id = '8a010005-0000-4000-8000-000000000005' AND audio_url IS NULL;

-- U1 d2 "假期里做了什么 What Did You Do" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/b0/b08422ff433b8c82a2277c408e06ea8fe0232d4350a47bb758181a7314d0c7ca.mp3' WHERE id = '8a010003-0000-4000-8000-000000000003' AND audio_url IS NULL;

-- U1 d2 "我的假期日记 My Holiday Diary" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/d1/d17109bdded4aa227343389f1935d2ae5dea6bd8e0feea33255de55713e06f15.mp3' WHERE id = '8a010004-0000-4000-8000-000000000004' AND audio_url IS NULL;

-- U2 d1 "东西放哪了 Where Are My Things" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/6b/6b9d1c49850340f0175dcae7d7db16cf296f13670e55a32e1bcd43093074a959.mp3' WHERE id = '8a020002-0000-4000-8000-000000000002' AND audio_url IS NULL;

-- U2 d1 "我的新家 My New Home" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/33/33c45bdbe44d25e35e9a3787e48001879ebcf3644609f1244a0bde784b5c9419.mp3' WHERE id = '8a020001-0000-4000-8000-000000000001' AND audio_url IS NULL;

-- U2 d1 "温馨的家 A Sweet Home" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/de/de8e7b8c5e97d892b1ce92210a9ef97101c9a3f544e6fc2ec57ae8633c223a49.mp3' WHERE id = '8a020006-0000-4000-8000-000000000006' AND audio_url IS NULL;

-- U2 d2 "理想的房间 My Dream Room" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/0d/0d10b6373c793ee062c532e3868acac10e8fa49f9be699013a283a195f2b25d6.mp3' WHERE id = '8a020005-0000-4000-8000-000000000005' AND audio_url IS NULL;

-- U2 d2 "打扫房间 Cleaning the Room" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/73/73af3f594614c603723ea32c81c2e70646eb838fd4d6f799e5f8a20fdb9bd044.mp3' WHERE id = '8a020003-0000-4000-8000-000000000003' AND audio_url IS NULL;

-- U2 d2 "参观朋友的家 Visiting a Friend's Home" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/1a/1a97df75c1dd0fc5d761a62ca6d06df7ac9880970f2e00cc3304e6e878616ae4.mp3' WHERE id = '8a020004-0000-4000-8000-000000000004' AND audio_url IS NULL;

-- U3 d1 "双胞胎姐妹 Twin Sisters" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/e5/e52b2434e590325f854bb47deabeebf134fce631a726fa87ba8b4103d98743e0.mp3' WHERE id = '8a030001-0000-4000-8000-000000000001' AND audio_url IS NULL;

-- U3 d1 "两个好朋友 Two Good Friends" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/73/7379f9d6a849f098ce5fcdb5c49a280ae4fcbb7f10df8cbc01bbe0098b5c3b83.mp3' WHERE id = '8a030002-0000-4000-8000-000000000002' AND audio_url IS NULL;

-- U3 d1 "我和我的弟弟 My Brother and Me" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/bd/bd02bb26693e9435bd2352a06475108cad6e39d73e3ae8ef00dc0dfa19b8df47.mp3' WHERE id = '8a030006-0000-4000-8000-000000000006' AND audio_url IS NULL;

-- U3 d2 "谁更适合 Who Is Better for the Job" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/f5/f5f0f36d64d7d88badef25ae612c0600d44f62ee4c14adb8af92a07f79b8b1d6.mp3' WHERE id = '8a030003-0000-4000-8000-000000000003' AND audio_url IS NULL;

-- U3 d2 "城市与乡村 City and Countryside" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/a2/a24fd96a9a59bd9c45d4dd2aa47e8b357222b1bfc99b3e5a2093418e4e123e8f.mp3' WHERE id = '8a030004-0000-4000-8000-000000000004' AND audio_url IS NULL;

-- U3 d2 "两家商店 Two Shops" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/71/71a8200f07190608f6361ce57119559cc405996e727d17424e4d8691e5c969d1.mp3' WHERE id = '8a030005-0000-4000-8000-000000000005' AND audio_url IS NULL;

-- U4 d1 "保护我们的动物朋友 Protect Our Animal Friends" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/98/986f97b7e5133c54aeeddc6745c80d904f8f92d93832667efc2ac75398b90ffc.mp3' WHERE id = '8a040006-0000-4000-8000-000000000006' AND audio_url IS NULL;

-- U4 d1 "神奇的竹子 Amazing Bamboo" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/54/54d9aae8ebf65b4610cfc1e36efc797c7b18596bb1b66e5083a4079fd5b5da25.mp3' WHERE id = '8a040001-0000-4000-8000-000000000001' AND audio_url IS NULL;

-- U4 d2 "沙漠中的仙人掌 Cactus in the Desert" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/ad/adae1035ba45c7adef1585012da724ea3d4c24ff6dcff2991dfa6c14c7e18dd1.mp3' WHERE id = '8a040003-0000-4000-8000-000000000003' AND audio_url IS NULL;

-- U4 d2 "小蜜蜂的大作用 The Busy Bees" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/22/22241cf982e1a5e32cef55e832045b89a65437b5d98281780e0c917aa9f5ed86.mp3' WHERE id = '8a040002-0000-4000-8000-000000000002' AND audio_url IS NULL;

-- U4 d2 "聪明的海豚 The Clever Dolphins" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/50/50e040e6a83bd0a83bc5680a95473a046225968c6f5bc0cc44ab537985a4507c.mp3' WHERE id = '8a040004-0000-4000-8000-000000000004' AND audio_url IS NULL;

-- U4 d2 "长颈鹿和大象 Giraffes and Elephants" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/fc/fc58b2dbfd3f38cb45bfb158197be822d836bab1b0debb8333d265a7bb6be309.mp3' WHERE id = '8a040005-0000-4000-8000-000000000005' AND audio_url IS NULL;

-- U5 d1 "妈妈的拿手菜 Mom's Best Dish" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/75/750b170d51ba7c3b83aae93436aeec5a214606851ebaf193c3f8b90e766434dc.mp3' WHERE id = '8a050002-0000-4000-8000-000000000002' AND audio_url IS NULL;

-- U5 d1 "在餐厅点餐 Ordering in a Restaurant" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/55/55934d0466cf6a5d31e88868854d24d63ba840a2b6685b4e4cdd9b70fa927599.mp3' WHERE id = '8a050001-0000-4000-8000-000000000001' AND audio_url IS NULL;

-- U5 d1 "我最爱的食物 My Favorite Food" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/28/2830cf50acb3919f4f5cda97d570842774278c206c3d5f647065f2c0b39ca4c7.mp3' WHERE id = '8a050006-0000-4000-8000-000000000006' AND audio_url IS NULL;

-- U5 d2 "健康饮食 Healthy Eating" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/61/61c087c95470cb89c55aef64c28037b3ecb08fa44078f1475cfc4196c2fe90a7.mp3' WHERE id = '8a050003-0000-4000-8000-000000000003' AND audio_url IS NULL;

-- U5 d2 "过桥米线的故事 The Story of Rice Noodles" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/3a/3a7371e0bfde793ac793c255ff7116e629416dfa4c4003819b561b7e9fe58fc0.mp3' WHERE id = '8a050004-0000-4000-8000-000000000004' AND audio_url IS NULL;

-- U5 d2 "学做蛋糕 Learning to Make a Cake" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/59/59c03a51204b7710d54c729ba7373da148d3a1e0fa86cc65b00ef15c94fee4e8.mp3' WHERE id = '8a050005-0000-4000-8000-000000000005' AND audio_url IS NULL;

-- U6 d1 "做最好的自己 Be the Best You" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/df/df6ea2e5e314916804130ddc1b183104146443c845d2061576180003d539c9c7.mp3' WHERE id = '8a060006-0000-4000-8000-000000000006' AND audio_url IS NULL;

-- U6 d1 "我的理想职业 My Dream Job" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/29/29614f1d8f253d32de512c512bb4d072f7122ef002b7cfb448048aa1605a6374.mp3' WHERE id = '8a060001-0000-4000-8000-000000000001' AND audio_url IS NULL;

-- U6 d1 "新年计划 New Year's Plans" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/f5/f51081706a768006b8575399427be3a107ba1fcfb07bf211e838b4e151b0d347.mp3' WHERE id = '8a060002-0000-4000-8000-000000000002' AND audio_url IS NULL;

-- U6 d2 "不同的梦想 Different Dreams" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/f3/f310a6c1a06590605bd12b276713503bc73ff9f3d2b4ad182c9995b753f39572.mp3' WHERE id = '8a060004-0000-4000-8000-000000000004' AND audio_url IS NULL;

-- U6 d2 "周末计划 Weekend Plans" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/58/58307b480fcd8fb0e0f4ec83156fcf12097459b571b4daf020016f54f5479022.mp3' WHERE id = '8a060005-0000-4000-8000-000000000005' AND audio_url IS NULL;

-- U6 d2 "怎样实现梦想 How to Reach a Dream" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/57/5766af1333dcdb7d8e1c79f5d902cd747f48f88d891cc8a37169812facd3e626.mp3' WHERE id = '8a060003-0000-4000-8000-000000000003' AND audio_url IS NULL;

-- U7 d1 "机器人助手 Robot Helpers" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/c0/c0568fdff269823d2ad7c3175523e34ead489f9d5c09fa8055bb074543e81a64.mp3' WHERE id = '8a070002-0000-4000-8000-000000000002' AND audio_url IS NULL;

-- U7 d1 "未来的学校 Schools in the Future" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/f0/f024161054fc33dfac776443b4b24df61b7986b9d112faf1bca4bdb6b16391ac.mp3' WHERE id = '8a070001-0000-4000-8000-000000000001' AND audio_url IS NULL;

-- U7 d1 "我对未来的希望 My Hopes for the Future" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/a1/a1596acad48feb223a6cc34dd7276f0acbc6b3f1acb2309682924c5f3322c70f.mp3' WHERE id = '8a070006-0000-4000-8000-000000000006' AND audio_url IS NULL;

-- U7 d2 "未来的交通 Future Transport" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/96/966a70e85112ca1bab25e3f505aa7c28d2be97a812c549dee60981f6c4cc8ba2.mp3' WHERE id = '8a070003-0000-4000-8000-000000000003' AND audio_url IS NULL;

-- U7 d2 "未来的城市 The City of Tomorrow" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/ea/ea08c32362da8571aacca93352a1fa8b4995f3bab185773baf995990d274bc29.mp3' WHERE id = '8a070004-0000-4000-8000-000000000004' AND audio_url IS NULL;

-- U7 d2 "明天的天气 Tomorrow's Weather" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/c2/c2e126f0e92865e455855d62f3b5b636d0ab2c318d47afc5567274c23a8c0e3d.mp3' WHERE id = '8a070005-0000-4000-8000-000000000005' AND audio_url IS NULL;

-- U8 d1 "沟通的艺术 The Art of Communication" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/80/8043d83759d93825afa46e9277a113a61c4ba939390ae1e0e0d65657d24b785d.mp3' WHERE id = '8a080006-0000-4000-8000-000000000006' AND audio_url IS NULL;

-- U8 d1 "怎样交朋友 How to Make Friends" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/68/68a19450be48469a64bec8761ff0fd97d19b94755047ceea56fad88d25f0e11d.mp3' WHERE id = '8a080001-0000-4000-8000-000000000001' AND audio_url IS NULL;

-- U8 d2 "给同学的建议 Advice for a Classmate" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/5f/5f5f7dfcc1aa45c92e98b31a9a20b6e73edace29a175051e70a581ea1297adc9.mp3' WHERE id = '8a080003-0000-4000-8000-000000000003' AND audio_url IS NULL;

-- U8 d2 "做一个好的倾听者 Be a Good Listener" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/3c/3c6a2af6763f78c1072c874c0da70ffbb2345e5a23f94998fc81f14ee33a0b2a.mp3' WHERE id = '8a080004-0000-4000-8000-000000000004' AND audio_url IS NULL;

-- U8 d2 "打电话 Making a Phone Call" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/f0/f0752403134f7249f03dc6daf2137ec023889d99743e0387301e314e7769eb2e.mp3' WHERE id = '8a080005-0000-4000-8000-000000000005' AND audio_url IS NULL;

-- U8 d2 "解决一个误会 Solving a Misunderstanding" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/c4/c4e377972c01676e9b59bf7f7451f684911386358794d62017be7933857393c6.mp3' WHERE id = '8a080002-0000-4000-8000-000000000002' AND audio_url IS NULL;

-- 校验(单独跑): 8A 已填 audio_url 的条数
SELECT unit, count(*) FROM junior_listening_exercises WHERE grade=8 AND volume='8A' AND audio_url IS NOT NULL GROUP BY unit ORDER BY unit;
-- END OF FILE listening-audio-url-8a.sql
