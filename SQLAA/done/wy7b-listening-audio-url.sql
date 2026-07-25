-- ============================================================
-- 关7听力音频预生成回填 audio_url(wy7B); voice=fable speed=0.85; 填 edge 返回的 CF URL
-- 幂等:仅 audio_url IS NULL 才更新
-- ============================================================

-- U1 d1 "A happy day" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/0b/0b413ae5bd597125724ad2e1e5b9921ee55805fc2c1fafb4e209241c693ace13.mp3' WHERE id = '556858b6-4bde-ae38-93c1-d4d7843a21b0' AND audio_url IS NULL;

-- U1 d1 "My birthday present" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/94/94642be866d1e58944f5ea4afa46c0555dc36465cdad5e7a583a717acb3f1226.mp3' WHERE id = '002f86ec-8146-3a7d-fd36-a6eb50ea39e8' AND audio_url IS NULL;

-- U1 d1 "My grandma's garden" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/d0/d080a42163706880464a3763c47b6a7bdbbb2935a8c38a99e6f60a307f630e3b.mp3' WHERE id = 'c8f9597d-b5f7-3dd6-7cbd-13cc50b3d041' AND audio_url IS NULL;

-- U1 d1 "Happiness Week" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/5d/5ddf52240a6af24acbd043087939ade21d257a9b9244ad4f335e74a883406045.mp3' WHERE id = '053541c4-a7b9-cd2e-7b77-2c2a6fcc8d20' AND audio_url IS NULL;

-- U1 d2 "The lost dog" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/db/db77a600982991a07e84e857e230c6831b6176578eabc850000a8a7c9aaf63f4.mp3' WHERE id = '4401932c-90ad-1984-47dd-3e7d50b50f26' AND audio_url IS NULL;

-- U1 d2 "The kind bus driver" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/8d/8da076522ba7d865c6243c839d4ec8ca11d6ca057400380fa85af8a023dc197b.mp3' WHERE id = 'ea2ec27f-dae7-d917-094a-1396c1eea1ef' AND audio_url IS NULL;

-- U2 d1 "Try something new" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/5d/5d6f9d6e60f679d575e15116a297a67ec8deb90da9906c8131c15d0f2060bfd0.mp3' WHERE id = '7fa9ed83-7307-6313-5cff-3ac7b407b982' AND audio_url IS NULL;

-- U2 d1 "The school got talent show" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/4b/4bb1293e3a57da39b2ed83aa3b67025d88259a438f33d9cf46d8475f1448f540.mp3' WHERE id = '723e781e-f0f3-a809-f0da-9adb1c6ceec2' AND audio_url IS NULL;

-- U2 d1 "The sports challenge" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/37/37c6e11d5505d3187bff574110f95ad2e60135d92abafcad318f77f059551e5e.mp3' WHERE id = 'f33944c3-1451-6161-b338-b93d91cdfef1' AND audio_url IS NULL;

-- U2 d1 "Never give up" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/ed/ed7d09ee2693afe0930eddce738d6b7b2936defbfab0e09d1de7061dd4009f48.mp3' WHERE id = '7c94b6cb-ed97-2d53-e188-4febbb1bdf9b' AND audio_url IS NULL;

-- U2 d2 "Is anyone there?" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/dc/dcb8394728f2497b8088007653047da57e99841f079090c4aded47f640bc1c23.mp3' WHERE id = 'b82a85ff-2cc5-3b48-983e-581c060f32d4' AND audio_url IS NULL;

-- U2 d2 "Everyone can help" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/d4/d494fed497e816c89c46f15649eec58d43beb4ceb221bc4d328c256671250cda.mp3' WHERE id = '5440dcfb-3709-ea0b-9b00-1987e2808003' AND audio_url IS NULL;

-- U3 d1 "My favourite food" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/6f/6faff133addba2a4a49c786c72d141a3ce66b38b086c79504432c30157fa577f.mp3' WHERE id = 'fe8a7478-6e1a-f4ee-276b-f06f547af22b' AND audio_url IS NULL;

-- U3 d1 "Healthy Food Week" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/5d/5d62881e7f644b04fadfa8daef22c6557482326d2ae5f68ea16e8545d5540c2c.mp3' WHERE id = '12c20767-1439-3113-8d46-b3279d1d7703' AND audio_url IS NULL;

-- U3 d1 "Cooking with Dad" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/66/66524ad66b98152617d2bbddee83e9a606157229fb8b61906fa0a00f33ba05a6.mp3' WHERE id = 'f2b152c6-4201-4753-3c97-ccca02e623d2' AND audio_url IS NULL;

-- U3 d1 "This soup tastes great" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/b9/b9fb36622ef4996224a50ae7f169550070d39f35785bb9a5119bbdd131fd549c.mp3' WHERE id = '9955b797-efd1-c710-f105-a7a33ae84e84' AND audio_url IS NULL;

-- U3 d2 "The bread went bad" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/5a/5a0ba68348dd6d03c5734c4d281096daa3e5408ddfbf43874beae9c103189e89.mp3' WHERE id = 'a68b08af-63da-bab2-f643-e1df53570954' AND audio_url IS NULL;

-- U3 d2 "Healthy eating" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/c7/c7251c0495db0d9899848bc09996442de2deab3e50992b977688f47018d2b75e.mp3' WHERE id = 'b500a4d8-b1c6-e7c8-18dc-fdf2bd38beb9' AND audio_url IS NULL;

-- U4 d1 "Let's play a game" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/2e/2e9754d70cea1c2034f38465daad76841b9cf849139fa9aeb289284b5f976b58.mp3' WHERE id = 'ac8848ea-f275-8dca-5b54-6f5390b4f07c' AND audio_url IS NULL;

-- U4 d1 "Come to the park" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/67/676e5ccedf9d64a860358cbb0d918372c4ba9b51451ce70b9ec62c77b8c91414.mp3' WHERE id = '32492f4f-e561-2eb9-d14d-db40cf6a7b1d' AND audio_url IS NULL;

-- U4 d1 "How to have fun at home" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/5c/5c83c2420d4815b5c521d5027bf5fa3ec285c726cc54bb5c6c5e9ee3f710fb84.mp3' WHERE id = 'd7398f1e-0d27-2e36-cbd4-f0aae2bae51a' AND audio_url IS NULL;

-- U4 d1 "Game Day" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/72/72a8cb6088e4b948cc4dadb8a06489f0b3c1a0fc27117e31fa893eae0cf2b188.mp3' WHERE id = '2e8f11de-c805-ec23-8595-29f14d666888' AND audio_url IS NULL;

-- U4 d2 "Make a paper boat" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/7f/7f7598c677d5553fbd7acb7246c7f87295bfff40bc8a32202040f2d79299d0e9.mp3' WHERE id = '0dfa3bf6-c8a7-9e4b-3aea-314d742c561a' AND audio_url IS NULL;

-- U4 d2 "Our fun club" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/f3/f3f4813b512948d791816825e414f297bd10a25d8863396ec78d5c012b2928ac.mp3' WHERE id = 'ba1e596b-6757-77e1-6d33-fde199b0de0c' AND audio_url IS NULL;

-- U5 d1 "Spring is the best" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/5d/5d885d6a46aa151cc2e99b78c889b62c28c3a0819d84244ce84af6448a501f87.mp3' WHERE id = '50eb3121-4f32-e897-cc69-eb03fce1c859' AND audio_url IS NULL;

-- U5 d1 "The amazing sea" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/9f/9f00559fdab280dfaf5fbce83abeea3be63e7a649c7b088a5a4406514fe2c91b.mp3' WHERE id = '7f0d9d27-0266-585d-a115-c9241282db4d' AND audio_url IS NULL;

-- U5 d1 "Nature Photo Show" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/02/021e1015607aa098ce261001fb4cc7ce4be65777ebb073de57024954d2cb4984.mp3' WHERE id = 'cb178222-8e7c-4866-0bcf-7c6f4df4f8ed' AND audio_url IS NULL;

-- U5 d1 "The tallest mountain" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/41/41a393e23940225ee22f71cf4c1948f6b3664fa2eca0861b7f103dff49697101.mp3' WHERE id = '4bff0a88-3be5-03da-10e6-32830b544580' AND audio_url IS NULL;

-- U5 d2 "Trees are our best friends" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/a5/a556353ecb8702bc489d09cc85d59938069e23f8059d15e856e1d8d7cb979753.mp3' WHERE id = '44acf621-71ee-7adb-8367-1604eea88138' AND audio_url IS NULL;

-- U5 d2 "Which animal is bigger?" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/91/915ad9c85ae4a60f5b53e82d4c5e9a5eba4045245f4f9285414a03b40dff5fc0.mp3' WHERE id = 'd19578f3-a211-755d-c1d2-8dd322f3037e' AND audio_url IS NULL;

-- U6 d1 "School Spring Trip" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/7d/7df8d31beb599746efc676dfd07985f4fcfaae2453c97b48594127628f01a720.mp3' WHERE id = '41efee43-09c2-bed6-b458-272225c6b515' AND audio_url IS NULL;

-- U6 d1 "Planning our trip" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/15/155d294a91fac63ec251189e67971d7b991325616a12d7e291e04caf54b15eaf.mp3' WHERE id = '38cb0e1f-d27d-0e8c-fe84-8ba73ccfa978' AND audio_url IS NULL;

-- U6 d1 "Two bikes" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/d7/d71f47629f92963d15f08541f7bcb415d24eda70917b5ef1f4d77a0937a8f15d.mp3' WHERE id = '29de8b4d-8714-5998-8a62-be401e819656' AND audio_url IS NULL;

-- U6 d1 "My first train trip" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/77/77e86f73f1f895c76989e7467b2d56df16ec4ddf99ee282eec35b4435f817980.mp3' WHERE id = '1e091575-27f1-452f-2829-4cede88aff0c' AND audio_url IS NULL;

-- U6 d2 "Travel light" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/ef/ef6f7998f45b6b28e86010b54cea8f2534491d1a54502480da55ac600a988016.mp3' WHERE id = '6e16aab4-4562-2f84-831d-817a73e59178' AND audio_url IS NULL;

-- U6 d2 "A day at the beach" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/68/681870a75c0e5aac76e9e7aa80d97b2722d6f4d9f0b9d82e3f19a7f4aad6ccb7.mp3' WHERE id = 'd26607f0-0055-9284-c0d9-d290b09993ba' AND audio_url IS NULL;

-- 校验(单独跑): wy7B 已填 audio_url 的条数
SELECT unit, count(*) FROM junior_listening_exercises WHERE grade=7 AND volume='wy7B' AND audio_url IS NOT NULL GROUP BY unit ORDER BY unit;
-- END OF FILE listening-audio-url-wy7b.sql
