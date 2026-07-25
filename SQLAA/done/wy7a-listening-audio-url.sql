-- ============================================================
-- 关7听力音频预生成回填 audio_url(wy7A); voice=fable speed=0.85; 填 edge 返回的 CF URL
-- 幂等:仅 audio_url IS NULL 才更新
-- ============================================================

-- Starter d1 "Nice to meet you" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/63/63cb5520663698f9fddc82618fd9d7b918bd7ccbb1ee0738f7ece4ec98559982.mp3' WHERE id = '75bc7345-cf6c-61ad-ccb1-b4619063ac1c' AND audio_url IS NULL;

-- Starter d1 "My favourite subject" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/06/065453950aadf06e7c373c49db19da3dbdcc6ef58051d17db8d41ccc1c4108a7.mp3' WHERE id = 'efe3476e-9a61-57b5-a9f9-c3fda2c4f081' AND audio_url IS NULL;

-- Starter d1 "Our new classroom" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/79/79f9a7bdd594136998aed125fb64ab085e25af0df9fc3874e9ef9fe444cbc694.mp3' WHERE id = '2b47c19a-a773-0988-2597-78ae0d5de0d3' AND audio_url IS NULL;

-- Starter d1 "My new school" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/65/65bc7b4d8d83a6446d5433d65a2e81a9f5e364e79dc5759404dc94bb0dde1071.mp3' WHERE id = '3815fda0-aab7-efe7-b9ab-b3be3e654bd3' AND audio_url IS NULL;

-- Starter d1 "Welcome meeting" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/22/22826db156e97b96b7987a7136d87a454a88311e876878360a4bd6db7ae6a20d.mp3' WHERE id = '6a176dad-f580-ddc4-04da-c20c16a5e018' AND audio_url IS NULL;

-- Starter d2 "This is my family" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/d7/d729bf9272aa67df210e6b175fc23bc5290c82febb6df75d0d19761cc6558909.mp3' WHERE id = '472994bb-05f5-4268-3cbe-3a4262cb716a' AND audio_url IS NULL;

-- U1 d1 "Club sign-up" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/f8/f8d8768f09d01c43ce32cb8b32904d6bac2b25978c7241d7efbebf301abe19cb.mp3' WHERE id = '5dcb4086-919f-fbd1-072f-7b9d78e498a2' AND audio_url IS NULL;

-- U1 d1 "Our new timetable" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/ef/ef53aad3edfc42cd773253a11898af45228c2c26ae2bf977ca9758cad99f8ca3.mp3' WHERE id = 'cadf0a67-91e7-bb99-1f85-b88a41fa7241' AND audio_url IS NULL;

-- U1 d1 "Is this your pen?" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/96/9606240bf78e2817182ba511fdc29673b9249610964792413325d82b8ca141c4.mp3' WHERE id = 'ae937365-7245-138d-424f-7042515c72f6' AND audio_url IS NULL;

-- U1 d1 "My first week" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/03/031d5decd38d153fe2d96a50a05361faa0a10dfd3db330e2bfe23e738b307b8d.mp3' WHERE id = '7c761a67-d742-ba9e-3e01-72bffcbec87b' AND audio_url IS NULL;

-- U1 d2 "A day at school" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/f6/f6c1b1aafdd564e571d71e2789933d91e39e11c38dbb560d53e4b59ca610cdf2.mp3' WHERE id = '326846b9-3299-4d39-0a73-934f550e882a' AND audio_url IS NULL;

-- U1 d2 "My morning" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/de/dee3a72887bf28a52459e1cd5bcbbd1d59859459ae42d47b7b39cbc2917eedeb.mp3' WHERE id = '184aaf35-7805-2d42-11f7-9d5900ef7052' AND audio_url IS NULL;

-- U2 d1 "What do you do after school?" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/17/179eb0b4e09f1ef0e0e8ab8b76e4bbdea2006cf8cc316702cfa800e833240fa3.mp3' WHERE id = '98118e78-1c45-e0d8-6174-8bfcbf60332a' AND audio_url IS NULL;

-- U2 d1 "My weekend" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/89/89d93786e098c3eec41924259ca42506a8127b4148c14550664370e4e5c198cf.mp3' WHERE id = '2df830ce-d9f5-66c0-a156-f9fca78db1af' AND audio_url IS NULL;

-- U2 d1 "My hobby" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/b9/b9de07514e5bd7a9058325b6ca5ab267e6ffea952ad75d56b42c664ae2c52b0e.mp3' WHERE id = 'b2854b79-bbe1-d3fc-eb78-0a233ad62fe4' AND audio_url IS NULL;

-- U2 d1 "Sports day" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/eb/eb39a2e947df554e43ef71751731ed2547797720de6098431b5a9ef04e7f9bd7.mp3' WHERE id = 'f16846ee-8f2e-527f-6735-c9655b33fb31' AND audio_url IS NULL;

-- U2 d2 "Join our club" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/b6/b6a6e14d8486a754a57fe80c8084fb834f40c94b222469aa67950e2d13101904.mp3' WHERE id = '0958781a-f12d-b8f7-ff02-386c4cab82cd' AND audio_url IS NULL;

-- U2 d2 "The school art show" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/45/454bbef3a911d8e8129cc3a20bd72b6488eb16d029aae11f7a0bc13ff50ee032.mp3' WHERE id = '6cdbc98b-744c-3e0c-15d4-99418369008b' AND audio_url IS NULL;

-- U3 d1 "Whose photo is this?" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/3d/3da7108df47bfdb6d9725869af0a2c7925b2ebc2b617555fddb1d3a65ed6545c.mp3' WHERE id = 'e9e9b12d-4b8f-4796-b237-d0e1ae8aa182' AND audio_url IS NULL;

-- U3 d1 "My father's job" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/d4/d4b50ae9b4634994539987c0431fbbe41a7bed7e208a4e52e222c6e8ce328868.mp3' WHERE id = '3dbbaef3-d91a-b6a9-ebbd-787721af9cb9' AND audio_url IS NULL;

-- U3 d1 "Family open day" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/74/74bfd167a5251c17715653bebe6bc05328e650b48287d0255ae3105d7012358c.mp3' WHERE id = 'de59f951-fd77-d5f6-2945-aae4bd92be27' AND audio_url IS NULL;

-- U3 d1 "My grandma" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/c0/c0abe58cc1ec4d0601c770be3da8c4c3b3dba506007646946a7153bfaf2ec58e.mp3' WHERE id = '9ad6121f-c6f0-dca5-4926-42e32fad8265' AND audio_url IS NULL;

-- U3 d2 "Helping at home" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/a4/a46a4fd69ce27655607cddb591ad3de5d5756e3f7c139fa8bc4e264db4d54b77.mp3' WHERE id = '7edc8104-657a-0951-8801-814a8ad1bce5' AND audio_url IS NULL;

-- U3 d2 "Dinner time" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/16/1634f4fdf86adc89cc023243605d5a0dbc3310edbac163fdd1ff2e234e90fdff.mp3' WHERE id = 'd13072ca-a61d-b357-db5d-57a46db3ce86' AND audio_url IS NULL;

-- U4 d1 "How do you spend the festival?" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/b0/b07a7ad691df60d78383c38e6b90c5150c72e2458fe93a6db178df0697423941.mp3' WHERE id = 'eabab832-6fc0-a363-2701-f2d64688b276' AND audio_url IS NULL;

-- U4 d1 "The Mid-Autumn night" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/eb/eb13ddf537b4f887277b0c07df157ad5ccea74d445893052389e5b36c81988eb.mp3' WHERE id = '3d6768ae-188f-505e-0b7a-bae736863011' AND audio_url IS NULL;

-- U4 d1 "My favourite festival" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/ba/baaebd02f136d5f4dccaf0be0d19d4219db66244a8043cce65fa60e2379f2280.mp3' WHERE id = '719b8931-081e-0f06-f514-a7684efb77b5' AND audio_url IS NULL;

-- U4 d1 "Festival show" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/df/df7305db7f91f96350cc952b6a438a5e806e94caf7f72bb2c1c40fe595d2b05b.mp3' WHERE id = 'fa5f7cca-06b1-a854-1c10-dad322d2d883' AND audio_url IS NULL;

-- U4 d2 "A gift for Mum" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/0e/0e38478d2c13bda7350f1309368b6d155e2502f7461963b77ace991d2088fff7.mp3' WHERE id = '469a90a5-0fb2-8f39-d8fb-659e7448d13e' AND audio_url IS NULL;

-- U4 d2 "A special birthday" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/94/940bf5675e84ee738a135a5240d490282c4cfaad4aed35f4f3e0611506432ac9.mp3' WHERE id = '54f88e06-64b2-b14f-471e-4f491cbafb9a' AND audio_url IS NULL;

-- U5 d1 "Tree planting day" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/fe/fe5190fa75e1545e310d104e8510409e99a044c588ab4637f98a7c6661d0a431.mp3' WHERE id = '9943dbe6-0322-8802-d2e9-ac15a9968fc6' AND audio_url IS NULL;

-- U5 d1 "Our class garden" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/10/10ed0591d725897ce66b2abd3fa28be0ec7ce5de9aa850a37b7545d5b42693ce.mp3' WHERE id = '2fb7cd28-c757-f683-c8dd-34dde270a4fa' AND audio_url IS NULL;

-- U5 d1 "Save the tree" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/3d/3d699e2191507639cfe15456e9b3d851d3145882d6cc6f16450e897f98f072eb.mp3' WHERE id = '514cf8d3-af4d-a395-9aef-948fc0f1c197' AND audio_url IS NULL;

-- U5 d1 "My little seed" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/77/7759fda48a40138654230c6711911aeb48597e2c224687bfa182a3dd94b224c1.mp3' WHERE id = '685fa829-598e-f221-f532-682dde897b03' AND audio_url IS NULL;

-- U5 d2 "Trees are our friends" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/4f/4f2e029c6dfc8bdd8bb0664af27b867aaf8b20e5380ba58b4d92c3660ad4d197.mp3' WHERE id = '74581efa-998c-b192-826e-5a63d8029eeb' AND audio_url IS NULL;

-- U5 d2 "How to grow a seed" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/16/16bbb15e449ca0d64e57defa40bdc4ce8e1f06ae00e19b574161a6982e571bb2.mp3' WHERE id = '6d760a20-f412-284d-339e-57e2bb8eef0b' AND audio_url IS NULL;

-- U6 d1 "At the zoo" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/d2/d2f154529db47693ed4100fdd198d5d24d4bee67d78103830fea1a7e18d92970.mp3' WHERE id = '08c65744-49a5-2826-edb7-9e3f827589e2' AND audio_url IS NULL;

-- U6 d1 "Birds in the park" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/e7/e7740e911e765ff9f89639c808485e76fc031da096973435cb714d96b7b1c63a.mp3' WHERE id = '160a13c9-0263-a497-6007-7fe0f40693b1' AND audio_url IS NULL;

-- U6 d1 "My dog Lucky" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/b3/b388c385da663dd0575e49e9be6c44c104c9e74f96950b7b500bd380208f4a1b.mp3' WHERE id = 'fa5b2e31-4a1a-825d-f546-00036c3c8109' AND audio_url IS NULL;

-- U6 d1 "Animal week" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/15/15c21196f874a569991bb8a382b0237fd57cdc10c92d54446b137d67749c965b.mp3' WHERE id = '0659b062-815c-380a-1bb3-508108f00422' AND audio_url IS NULL;

-- U6 d2 "My new pet" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/97/973257c523685090be7358b4636d831d559bebcf583ccb6178ce8d3a2b1260fa.mp3' WHERE id = 'b2ad0f15-f920-9dfc-6761-3f43531fed47' AND audio_url IS NULL;

-- U6 d2 "Animals are amazing" (provider:openai)
UPDATE junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/ec/ec50d5e069757a2a522e5c378d107144d43bd1637ad626cc1cd85fbebf4fae28.mp3' WHERE id = '58bde51a-e541-3664-107b-bc57219658d5' AND audio_url IS NULL;

-- 校验(单独跑): wy7A 已填 audio_url 的条数
SELECT unit, count(*) FROM junior_listening_exercises WHERE grade=7 AND volume='wy7A' AND audio_url IS NOT NULL GROUP BY unit ORDER BY unit;
-- END OF FILE listening-audio-url-wy7a.sql
