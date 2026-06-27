-- ============================================================
-- 关7听力音频预生成回填 audio_url(required1); voice=nova speed=0.85; 填 edge 返回的 CF URL
-- 幂等:仅 audio_url IS NULL 才更新
-- ============================================================

-- U2 d2 "WU 听力·短文 My Trip to Peru" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/77/774db61201e0a2225f3efd831dd857d006a54d3ec2ea5622e1930696caeb1ee0.mp3' WHERE id = 'c5eb603c-630b-4fc1-8162-2151a3cbb265' AND audio_url IS NULL;

-- U2 d2 "WU 听力·短文 Why I Love Hiking" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/c2/c23b49322d2a7aff577bbb33f90e853ba29e1d7a1959777393decdb367dd9a3f.mp3' WHERE id = 'eda1b8ab-7858-4b44-9490-cd77fed20d3e' AND audio_url IS NULL;

-- U2 d2 "WU 听力·短文 A Tip for Travellers" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/44/44246764af44291b9bd45e5984bade2b69510f2099a610ffb5377eadfb331134.mp3' WHERE id = 'ac29d794-c7e9-4e98-8262-84740a831df4' AND audio_url IS NULL;

-- U2 d3 "WU 听力·对话 Booking a Flight" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/40/40d5ddc56c4555faedcefb4f095824796d50d7bc164046139ff2da9847b714b4.mp3' WHERE id = 'a465832d-8c38-4086-a578-d48fc7cfd937' AND audio_url IS NULL;

-- U2 d3 "WU 听力·对话 Checking In at the Hotel" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/cf/cf6e127fc144e7d5b5319638b4e333e4360bde6c90e159f5fe29b8494337982c.mp3' WHERE id = 'af6fa532-3378-42fa-818c-604ba62b213d' AND audio_url IS NULL;

-- U2 d3 "WU 听力·对话 Asking for Directions" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/93/9383cac4beb8f93a6a0f020dc939b8a5975efc217d156bdaeee0cc8b2998fd27.mp3' WHERE id = '2f1cb241-70df-4dd9-af00-cdf705368f45' AND audio_url IS NULL;

-- U3 d2 "U3 听力·短文 A Volleyball Legend" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/9c/9c3f7c1043824ed09a6b4cfb895fdb17116c554a5d4566cb154fd5274e8b64a4.mp3' WHERE id = '298f3226-4ab5-4268-a14d-f19beb2f34d9' AND audio_url IS NULL;

-- U3 d2 "U3 听力·短文 Why I Jog" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/d3/d3a6813be0defd1d7884216e267e90d0f8f1c58e69cacb356401e28d943a10ef.mp3' WHERE id = 'c7cedab8-063d-489b-a42f-b1c50ac1405e' AND audio_url IS NULL;

-- U3 d2 "U3 听力·短文 A Tip for Staying Fit" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/bc/bcfbc43bc15aca896f2747df849a8770e6d879485dbf89656ac7241bec36b8be.mp3' WHERE id = 'd5a007c4-5855-413c-99d4-ec554f2124c1' AND audio_url IS NULL;

-- U3 d3 "U3 听力·对话 Talking About Fair Play" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/fc/fcf7311edc2eae3b05031e61398f17fbb3a87986bcf8b1a6ea865e53136d9c73.mp3' WHERE id = '38deb201-cad1-4cf7-a0f2-c471a3bff5ad' AND audio_url IS NULL;

-- U3 d3 "U3 听力·对话 Inviting a Friend to a Match" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/b5/b57e14253cac7cf537d8991d2a0c256eafc90d4fc6d53ac587370e2294e2c98e.mp3' WHERE id = 'f8a00c1a-fcb1-4b2f-a8a4-bbe49fd02138' AND audio_url IS NULL;

-- U3 d3 "U3 听力·对话 At the Gym" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/d1/d16ff02e4793628043146a6005740ee11f9889553f12869b1bb3173cf8069e32.mp3' WHERE id = '1a061d45-1ca0-49e4-b949-31a3de9279a9' AND audio_url IS NULL;

-- U4 d2 "U4 听力·短文 The City That Rose Again" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/ec/ec9b97c695af6502d8426eda120a86286893b21fc5e812c1c06fe83ed333b407.mp3' WHERE id = '7db3bd77-15cc-42e2-ac0a-800151c7916a' AND audio_url IS NULL;

-- U4 d2 "U4 听力·短文 A Tip for Disaster Safety" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/52/529e984f7bba14c2b4d39fbeb3a790001586a1c54c2c79abcd9aab03968b6787.mp3' WHERE id = '7d39499a-3858-48af-9f63-48dee2bcbb9f' AND audio_url IS NULL;

-- U4 d2 "U4 听力·短文 During an Earthquake" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/b0/b0bc353af81980979bd2f6454b2e577bee5fc727ea5a4a9d12911b280eb09093.mp3' WHERE id = '260df1a1-7eee-4b03-bbf2-d043eeaabd92' AND audio_url IS NULL;

-- U4 d3 "U4 听力·对话 An Earthquake News Report" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/08/085fb1e8f20ab40c0c6f1abcc00d08ff39f1dd611aad9bb7d5a630b9d7dcc6d4.mp3' WHERE id = '2a672e79-c84d-4151-817a-0301655b28f5' AND audio_url IS NULL;

-- U4 d3 "U4 听力·对话 Making an Emergency Kit" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/bd/bd476d007ec59d2892facfb9467d37d9c9ae745502600a4f12ecd223f3bc6b57.mp3' WHERE id = 'ccfbffc2-c2f9-4542-9cbd-44e3bae45241' AND audio_url IS NULL;

-- U4 d3 "U4 听力·对话 A Survivor's Story" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/03/038dee0771584d095d1df3a5414117df84a60689679b021a860a64860a23a6a9.mp3' WHERE id = 'f9ff8999-0db3-43ee-9cab-524fbcaae9f2' AND audio_url IS NULL;

-- U5 d2 "U5 听力·短文 Languages of the World" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/49/49bc6e2a5cdc07b32a9bb6253f830b7eeb18b1837c5c2f48a7b92606799deb8d.mp3' WHERE id = 'b0ec9e29-f83d-40b3-a59b-0c70d58737e7' AND audio_url IS NULL;

-- U5 d2 "U5 听力·短文 The Chinese Writing System" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/aa/aaa0cf21514cd2842c53e7018811458f3d0a950e1e1d7737a3e489e8770ab23f.mp3' WHERE id = '083ecaaa-ee1f-493b-877a-d9cd054997fc' AND audio_url IS NULL;

-- U5 d2 "U5 听力·短文 A Tip for Language Learners" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/20/203c63e3f8f3a1a8bd276f82002f6cd879d52fc56c301db8986ca01583a35ff3.mp3' WHERE id = '85d72e83-050d-44fe-8ba2-7393d288d5d4' AND audio_url IS NULL;

-- U5 d3 "U5 听力·对话 Which Language to Learn" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/a3/a30096287c90d2eaeaf9811c7b53af0aa5198dad1c15c291ebc9d5761fa6590e.mp3' WHERE id = '95114a9a-ac59-4db1-9415-2eb11129e88b' AND audio_url IS NULL;

-- U5 d3 "U5 听力·对话 A Word with Two Meanings" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/13/13c3be0e5bd5f2d9f77e040f9165a04ce2ce2b34b2da5d712322f31be75324ca.mp3' WHERE id = 'eb161ddf-b9c1-41bb-ba01-e5d4ff7d6bd2' AND audio_url IS NULL;

-- U5 d3 "U5 听力·对话 Advice on Learning English" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/91/91a77163f392a0dd7d0b0ec5a9082175c6cbf9d3c7e316c019f2ea374a84b0bb.mp3' WHERE id = '030c4cd5-eb5a-4d05-9e47-630cb303eb44' AND audio_url IS NULL;

-- 校验(单独跑): required1 已填 audio_url 的条数
SELECT unit, count(*) FROM junior_listening_exercises WHERE grade=10 AND volume='required1' AND audio_url IS NOT NULL GROUP BY unit ORDER BY unit;
-- END OF FILE listening-audio-url-required1.sql
