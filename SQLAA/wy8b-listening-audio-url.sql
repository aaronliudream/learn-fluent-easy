-- ============================================================
-- 关7听力音频预生成回填 audio_url(wy8B); voice=fable speed=0.9; 填 edge 返回的 CF URL
-- 幂等:仅 audio_url IS NULL 才更新
-- ============================================================

-- U1 d1 "How is bread made?" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/e4/e422789999f7fc7ed04aee82f8bedcbed3216f22c7bd9099e278b6f022ddad73.mp3' WHERE id = 'b7b822ed-5aac-4ccf-56ef-46652969b5bc' AND audio_url IS NULL;

-- U1 d1 "At the newspaper office" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/4b/4b00e6e17f03d65a92835602ea3c3a1abfbf947ef9099f61f7094dd805e6bab7.mp3' WHERE id = 'b4c48958-91b6-77e4-5e8b-f73f293bb533' AND audio_url IS NULL;

-- U1 d1 "How chocolate is made" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/34/3462aecf67722ec7759ce9d0c914c22bc5b135c874fc020c3564013c8a2ff587.mp3' WHERE id = '32cd54b7-d952-20d2-2e62-85c0124aa985' AND audio_url IS NULL;

-- U1 d1 "Career Day" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/2a/2a068f469468510baf6deecc0c17afb63575962d398bdd67f398e9fb6604e706.mp3' WHERE id = '55b90826-b8b4-201a-950e-a0bd852b08b9' AND audio_url IS NULL;

-- U1 d2 "Jobs of the future" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/23/23fb9604915244881f039451dbf8db2644b2e70f0926be701ec0538e023cbb6e.mp3' WHERE id = '87e47b9a-ec15-fb70-d410-a450595b12d6' AND audio_url IS NULL;

-- U1 d2 "Work in the future" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/b7/b73adf36ea8f1ae5eae295d4966c922942fe89e522b6bd55b9b44d482e4dbe0e.mp3' WHERE id = '94f19c0b-6e44-075e-0c3c-0ed12d785484' AND audio_url IS NULL;

-- U2 d1 "How I grew up" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/f1/f1ecfb319317b3014c31380ac06fc190996d3d09f688f78f5f3754481407c364.mp3' WHERE id = '2658c706-118b-9f08-2e54-dd1a25700ffe' AND audio_url IS NULL;

-- U2 d1 "A lesson I was taught" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/bd/bd0d1cf74a4ce87593779b7a50720eb006c7b424ca22377b4541ce36e8afd693.mp3' WHERE id = '580f7f8c-f9f0-c406-4562-82046ed074dc' AND audio_url IS NULL;

-- U2 d1 "The school show last term" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/43/43c085f49dbd12db8c7764847641822edc18d41813914da7c3e48a2ad8da59ed.mp3' WHERE id = '6eda3ca0-28ec-1a5c-bc0e-5800ce86f9c5' AND audio_url IS NULL;

-- U2 d2 "Our Class Wall" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/e8/e82655fd6d8192848c112f1b137248b6519b0cf5acbe1a345291c45668f6f83e.mp3' WHERE id = 'd5703437-e2a8-b38a-67f6-d1081ad83d58' AND audio_url IS NULL;

-- U2 d2 "The old photo" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/bb/bbe6078955fdf71fb66513f0518dcd2a4560398572a7bf2b13358c841d5eae81.mp3' WHERE id = 'c77e6941-8bb5-03da-0836-53eae5739028' AND audio_url IS NULL;

-- U2 d2 "The broken cup" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/db/db1b0cbd6a10e83f7071885872362a188a5ce5f2bc026360e506c48c5bdd4a18.mp3' WHERE id = '5c8b3a6b-19ac-c078-85aa-2232ccfbaa64' AND audio_url IS NULL;

-- U3 d1 "What makes a great team" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/6b/6be3a81ffcffbd838b089ee52f17f36031d16a34a3194624f8f2d02739daa19d.mp3' WHERE id = 'ae0416af-e87d-eee8-0c73-93ce79245033' AND audio_url IS NULL;

-- U3 d1 "Team rules" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/9e/9e42bc7df049edc7605a3bb7fa02c242001e188c3946808e22b4f29361e6367a.mp3' WHERE id = '5f12c68d-e1c7-98ca-8e50-c6de7ba4c43e' AND audio_url IS NULL;

-- U3 d1 "May I join?" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/65/650cbe5035432116bbd290b6e470f3756ae6d7a2c8b61b8e9721458f67ee2841.mp3' WHERE id = 'fc44cb5b-ff88-255a-2df6-23928e2d7778' AND audio_url IS NULL;

-- U3 d2 "Team Challenge Week" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/21/2189ab1d6da205b76fe5a952802d01405338c8e1fcdf8259857d6ff68bf1bf6f.mp3' WHERE id = '2c757d6d-0657-7e4e-4116-1bb7c05411f3' AND audio_url IS NULL;

-- U3 d2 "What can you do?" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/6d/6d097efea311043b3d127676bc5000f73a831f8dcbc55541c03782d1527c5b58.mp3' WHERE id = '8a0ce494-a9e6-015b-7393-333ec8927408' AND audio_url IS NULL;

-- U3 d2 "The class garden team" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/6d/6df21bb506fd4640baaa737ffa90d4e9c2ad0c9c44f20d259c49d7b9517c2144.mp3' WHERE id = 'b440bb2c-d5fe-df80-b8b6-5cf97c7074d3' AND audio_url IS NULL;

-- U4 d1 "Whose bag is this?" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/48/481712a93ed3eb58e4bf7293e843d8a253772e750850d9c69779d04299fb5015.mp3' WHERE id = 'e45010a3-9fd8-9144-e148-d18759def56d' AND audio_url IS NULL;

-- U4 d1 "The light in the window" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/8a/8af53b3986038efd1f5569d46929161c6525bbac1fe944ebf1ba63d9ff561242.mp3' WHERE id = '5a6eb706-1df8-0bb0-a315-e542c0c3894a' AND audio_url IS NULL;

-- U4 d1 "The quiet new boy" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/c5/c561cc320ed738f5939e92498244844937a2d9e9fa43b178ebc543fa65b41cf1.mp3' WHERE id = '197537ae-3eb5-c332-8a3b-c36f91a16b9b' AND audio_url IS NULL;

-- U4 d2 "Helping Hands Week" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/8f/8f1a84dedf14f5931392a8ea22b979179c3ceb902ac194af3c6754132441b916.mp3' WHERE id = 'b8e924a5-7e2e-491c-208b-b5c6768722b0' AND audio_url IS NULL;

-- U4 d2 "She looks worried" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/8f/8f192fe044099d769f78ab7c09a96dcce9e35e03401f025d7c631d09d28bd10e.mp3' WHERE id = 'f6b56316-742d-8c1a-cd8f-807ef9720fd9' AND audio_url IS NULL;

-- U4 d2 "Reading the signs" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/7e/7eb9333be60153591ef46ec4e41348353db1a28d274d2ff00b9faca5672e9fc2.mp3' WHERE id = 'a393d980-df27-7237-2029-22bc364a3293' AND audio_url IS NULL;

-- U5 d1 "The secret world of the forest" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/a5/a5cd9631f35b42fd07be2341d358f31da5bf826735234f43e1db85cefc83ab33.mp3' WHERE id = '09bdf814-910d-e2ea-2762-decb0dfe29c6' AND audio_url IS NULL;

-- U5 d1 "I think nature is amazing" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/f2/f2eb692d3094ba9cb6ba42bbf327c2ab13f9cf40dd19e6a91f7002313d3d6b80.mp3' WHERE id = '0b7867ea-9bba-58f9-548e-81c607c6b23e' AND audio_url IS NULL;

-- U5 d1 "I know it will help" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/49/497ad6070303c8971bdf78358bdb178af799a59e6555f4ae01c01969ff5b5887.mp3' WHERE id = 'f3e4773d-2734-52c0-acae-16ec78151bae' AND audio_url IS NULL;

-- U5 d2 "Nature Week" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/46/4634af9d72d4175ab77df8c8aef60e9d2a6f9d783a1dd1a31a75b92667b577df.mp3' WHERE id = '6d64f122-9cc4-1d91-f56d-9c667edad39e' AND audio_url IS NULL;

-- U5 d2 "Scientists have found" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/42/423ef531fd126371e7e5383a0fc535adf907911aca0b4017602326184f5ee975.mp3' WHERE id = 'd70f3a37-9ac6-1a57-0cee-18e688d42ed5' AND audio_url IS NULL;

-- U5 d2 "What the river taught me" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/8b/8bd3732f69154390fdc4263670cdee9d89d433727c37ebf3e872bad2ec237693.mp3' WHERE id = '86bfc5c6-6d4f-bbdf-cebf-e6d9b4cd5e8f' AND audio_url IS NULL;

-- U6 d1 "Can you tell me how?" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/7e/7e883e45e402e280c0649f86b160df7861b7a3f81cf0ec4d3105337394f7526e.mp3' WHERE id = 'f3fe9b2e-d773-30d3-bd2f-9061b5cdfb2c' AND audio_url IS NULL;

-- U6 d1 "I wonder if we can help" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/af/afad923ecaba48b33aa7f2253cbeb2371f5d19ce7ec1b281b6c8cb95b85bc3fa.mp3' WHERE id = '9e959545-6365-462b-b08e-f6c974e06b2a' AND audio_url IS NULL;

-- U6 d1 "Living close to nature" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/16/16da2867ac8b9c96159f9e04fee31d1150d9509aa970f50f63a2c699c1feb888.mp3' WHERE id = '11fa119a-fa33-eb39-1f8a-fe3a86159c57' AND audio_url IS NULL;

-- U6 d2 "The question that stayed with me" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/b1/b153b94b60a26f2024a93a2a0868c2ef77cbbab106f99d4aab24cde5f8962cd4.mp3' WHERE id = 'bc478421-4890-da43-ed6a-3480772c073d' AND audio_url IS NULL;

-- U6 d2 "Do you know why?" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/7c/7c19f1c2bab83a7b63418937dddb319ff1e35c12eac90b748dea0ed2d11ebe30.mp3' WHERE id = '3bea461b-ecd9-9c9f-5543-29f45ea15cca' AND audio_url IS NULL;

-- U6 d2 "Save Nature Week" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/56/569783e06e5159ad49252594404d556dbb7a19ffabe5b7cef3c145a7ad83fd2d.mp3' WHERE id = '65f1d1c4-785c-ef2d-851c-d3dae02f2c66' AND audio_url IS NULL;

-- 校验(单独跑): wy8B 已填 audio_url 的条数
SELECT unit, count(*) FROM junior_listening_exercises WHERE grade=8 AND volume='wy8B' AND audio_url IS NOT NULL GROUP BY unit ORDER BY unit;
-- END OF FILE listening-audio-url-wy8b.sql
