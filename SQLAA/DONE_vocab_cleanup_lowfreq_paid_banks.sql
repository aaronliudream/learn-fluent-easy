-- 清理:把高频词从**高阶收费库**摘掉挂载
-- 生成: node scripts/vocab/emit-lowfreq-cleanup-sql.mjs
-- ⚠️ 由 Aaron 执行。脚本本身从不写库。
--
-- 病因:词库直接按 ECDICT 的分考试标签灌,而 ECDICT 把 in(频 6)、on(频 17)、
--       as(频 33)也标成了雅思词。流水线 100% 忠实地把它们灌进来了 ——
--       忠实地灌进来一个垃圾判据的输出。收费的雅思库里因此有 160 个词频 ≤500 的词,
--       是 GRE/GMAT(各 15 个)的十倍以上;托福同区间是 0,所以这不是"所有库都这样"。
--
-- 口径:ielts ≤500 全部 160 个 + gre ≤500 全部 15 个,共 175 行挂载。
--       ⚠️ 行数 ≠ 词数:175 行只涉及 167 个词 ——
--          even/school/mean/group/hold 等同时被两个库切。
--
-- ⚠️ **只删 vocab_word_banks 的挂载行,绝不动 vocab_words。**
--    best 摘完会变成孤儿行(词还在,任何库都看不到),
--    这是 Aaron 明确接受的:孤儿行无害(millennia 已是此状态),
--    而删词不可逆且零收益 —— 没有收益的不可逆操作不做。
--
-- 影响面(Aaron 已查):涉及 16 行 user_vocab_mastery / 2 个用户 / 1 行错题本 / 0 行 pre_known。
--    摘挂载不删 user_vocab_mastery(它按 word_id 存,与库无关),
--    但词库页的"已学/已掌握"是按库过滤算的,那两个用户的雅思进度数字会变小。

BEGIN;

-- 快照:后面每一条断言都拿它当基准,不写死数字
CREATE TEMP TABLE _before_links(code text PRIMARY KEY, n int) ON COMMIT DROP;
INSERT INTO _before_links
SELECT b.code, count(wb.word_id)::int FROM vocab_banks b
  LEFT JOIN vocab_word_banks wb ON wb.bank_id = b.id GROUP BY b.code;

CREATE TEMP TABLE _before_words(n int) ON COMMIT DROP;
INSERT INTO _before_words SELECT count(*)::int FROM vocab_words;

-- 本次要摘的 (库, 词) 对
CREATE TEMP TABLE _cut(bank_code text, word_id uuid, headword text, freq int) ON COMMIT DROP;
INSERT INTO _cut(bank_code, word_id, headword, freq) VALUES
  ('gre', '924ac15d-57fe-4490-9f30-3683934f841b'::uuid, 'want', 83),
  ('gre', '0924080f-28d3-401b-b01f-f545a3dad81e'::uuid, 'even', 107),
  ('gre', '1aabedec-24a4-459e-aabb-9d6a90aa6322'::uuid, 'down', 118),
  ('gre', 'f5f7679c-3193-41aa-9cb0-c4374343e7b1'::uuid, 'school', 125),
  ('gre', 'c8af16b5-7733-4e26-a12d-76a664aa5d94'::uuid, 'mean', 154),
  ('gre', '6e0c6c6b-79d1-4426-8d2f-2669467068e6'::uuid, 'group', 163),
  ('gre', '12a38438-7d3a-49a3-9d44-37c288bdde3f'::uuid, 'hold', 213),
  ('gre', '8c7be8dc-e875-4477-85a4-faac211e04d9'::uuid, 'lot', 238),
  ('gre', 'f8a3318d-6dbc-470e-967e-6b9b390d42a1'::uuid, 'issue', 248),
  ('gre', '1bd6a05c-66da-464d-a3b8-6780182c9da2'::uuid, 'meet', 288),
  ('gre', '64c4a8e2-8b82-485b-ad8b-da68f28103af'::uuid, 'low', 360),
  ('gre', 'b58194e1-f33d-46c1-a452-7ed6a4a2a4cb'::uuid, 'guy', 364),
  ('gre', '08216b0c-9a20-41c7-b91d-608612c29a7b'::uuid, 'moment', 369),
  ('gre', '577ebe03-80c4-475b-8094-c6fcfe152ad9'::uuid, 'die', 403),
  ('gre', '4cf2a2cf-b0e3-4532-ab2c-c6c82026d99d'::uuid, 'control', 432),
  ('ielts', '4e35ced5-ef09-4086-99d6-72c83cda262c'::uuid, 'in', 6),
  ('ielts', '5f3102d5-55a3-4dbb-965f-b57d7be8f5fc'::uuid, 'on', 17),
  ('ielts', '34088850-e5d6-407d-b08b-8db6548053d2'::uuid, 'say', 19),
  ('ielts', '0e5f5c8c-e072-4699-848a-7cf77f35bab6'::uuid, 'as', 33),
  ('ielts', 'b8c97c12-1bf7-469d-bf32-4981bfe2a273'::uuid, 'go', 35),
  ('ielts', '3220a8e9-e628-4d49-8535-42b8d1a7199e'::uuid, 'get', 39),
  ('ielts', '3a0fc81d-4139-4dd3-957b-33e953ffcbd5'::uuid, 'all', 43),
  ('ielts', 'd275a249-be7c-46d8-a286-4beaef7cc0e1'::uuid, 'make', 45),
  ('ielts', '83e7daed-9f11-4e1a-bfff-a26aac1fd251'::uuid, 'one', 51),
  ('ielts', 'fd067b43-0f10-4cb5-be1b-fe3d3761e09b'::uuid, 'time', 52),
  ('ielts', 'b700c365-e1e3-4a6b-bd78-9b166179fb9d'::uuid, 'take', 63),
  ('ielts', '1db8613e-eb95-4293-97a2-bbc9603b601d'::uuid, 'come', 70),
  ('ielts', '2038b929-7ca5-405a-9f23-30a8579d3194'::uuid, 'day', 90),
  ('ielts', 'dcb56985-3352-40ab-ba73-f66641ad079c'::uuid, 'give', 98),
  ('ielts', '0924080f-28d3-401b-b01f-f545a3dad81e'::uuid, 'even', 107),
  ('ielts', 'ba7cb131-68a2-4177-8040-f71b021f5fa8'::uuid, 'back', 108),
  ('ielts', '47a738c8-5a49-49c9-b748-76c14f24840d'::uuid, 'good', 110),
  ('ielts', '1e74b99c-bf1d-46d1-b08c-7dc599afb226'::uuid, 'child', 115),
  ('ielts', 'cd60bee3-2b35-43f3-8e2e-4635f5045b34'::uuid, 'may', 119),
  ('ielts', 'bb39c268-8e1b-4eb4-ad58-32efcae48036'::uuid, 'call', 122),
  ('ielts', 'bdb22583-360e-41d8-b9a9-87d77db90c3d'::uuid, 'world', 123),
  ('ielts', 'f5f7679c-3193-41aa-9cb0-c4374343e7b1'::uuid, 'school', 125),
  ('ielts', 'be0013be-21f8-49f4-8d10-89cab9311f82'::uuid, 'feel', 134),
  ('ielts', 'c9222104-8071-4d18-90cc-8a89cbb1961d'::uuid, 'become', 139),
  ('ielts', '3f2dcece-50e1-4bff-a9c2-9b05c726186f'::uuid, 'most', 144),
  ('ielts', '6d44a7e9-c3ae-45f4-a3e0-1d6df38e7fd8'::uuid, 'family', 147),
  ('ielts', 'a0f78e1f-d7d6-4d6c-a0f5-1533f192ace7'::uuid, 'leave', 150),
  ('ielts', 'dd492369-d364-4046-bc50-cfff83a02ac8'::uuid, 'put', 151),
  ('ielts', 'c8af16b5-7733-4e26-a12d-76a664aa5d94'::uuid, 'mean', 154),
  ('ielts', 'c8bd3cf1-73c3-424e-b8b0-552e653781d6'::uuid, 'keep', 156),
  ('ielts', 'f1b11502-8db6-4d55-a5b8-8abe152673a4'::uuid, 'student', 157),
  ('ielts', 'ef1050e2-3a39-4819-95f2-672d3de12285'::uuid, 'let', 159),
  ('ielts', '6e0c6c6b-79d1-4426-8d2f-2669467068e6'::uuid, 'group', 163),
  ('ielts', 'fb38a4ec-da62-4e2d-97f3-44f61eb7ba81'::uuid, 'country', 166),
  ('ielts', '98364f55-657d-4bb4-9234-a05590a9043c'::uuid, 'hand', 174),
  ('ielts', '4fcf4fe1-f330-4d73-acf9-4caf5f59b3f3'::uuid, 'might', 175),
  ('ielts', '8a326240-afdf-4ca0-9c2d-b5be43ac22f8'::uuid, 'part', 178),
  ('ielts', '347be029-5b1e-40c2-8b6d-7bf694161e9e'::uuid, 'place', 181),
  ('ielts', '0d06f586-0134-434c-8b52-5ee7f1fb3eea'::uuid, 'case', 186),
  ('ielts', '4cc14259-d2b8-4584-9e25-c28f1e379ee2'::uuid, 'company', 189),
  ('ielts', 'a452b1d0-bfdc-44a6-b8ea-2fc845931334'::uuid, 'system', 191),
  ('ielts', '95ffa7d8-960f-446d-bcc4-9a3eb222f803'::uuid, 'program', 194),
  ('ielts', 'f0afdb50-db97-4f49-8bc8-6bce681de935'::uuid, 'government', 201),
  ('ielts', 'eb4e3aa7-e45e-45e9-9a7c-39f628911a95'::uuid, 'night', 209),
  ('ielts', 'c786917b-c719-4e13-9d25-b09003b7c89a'::uuid, 'live', 210),
  ('ielts', '77ca87fd-cf22-4396-bddc-e53b16a5bbab'::uuid, 'point', 211),
  ('ielts', '12a38438-7d3a-49a3-9d44-37c288bdde3f'::uuid, 'hold', 213),
  ('ielts', '458b24a4-b504-43fd-a520-c9c56c824e25'::uuid, 'bring', 215),
  ('ielts', '0091f158-c39a-4117-91a3-7b24ac6fbe1a'::uuid, 'million', 222),
  ('ielts', '5a1b9781-0953-46b3-87ca-543b847fa35f'::uuid, 'water', 226),
  ('ielts', '61161c4d-1aac-4c3c-ae93-9a2b3a7aae90'::uuid, 'room', 227),
  ('ielts', 'ca192cc9-8eb4-44d8-ae68-1a6a48a7c386'::uuid, 'mother', 229),
  ('ielts', '78068bad-b1b9-4eb0-8192-275eb78d30c3'::uuid, 'area', 230),
  ('ielts', '60755be4-b171-4e43-827a-35a740e674ec'::uuid, 'national', 231),
  ('ielts', 'e5b0916c-e51f-4943-855e-164fade7c923'::uuid, 'money', 232),
  ('ielts', '907c9ecc-6f1f-451c-8502-861eeaff8d30'::uuid, 'story', 233),
  ('ielts', '34b639e7-3c1f-4f83-bf92-bfe66fb3d8a3'::uuid, 'month', 236),
  ('ielts', 'c7e3dbaf-0f2a-4ed8-8d0c-ab78305ed7cf'::uuid, 'different', 237),
  ('ielts', '68e2cd88-fa69-4702-a729-bb0dfd49db32'::uuid, 'study', 240),
  ('ielts', '1c164e75-be01-4044-ac7a-00a47c3eb402'::uuid, 'book', 241),
  ('ielts', '7fb90fe6-5067-40ae-a3c3-a076f2dca2c7'::uuid, 'eye', 242),
  ('ielts', 'b1276f80-5fc4-4db5-8760-2f07fae9a434'::uuid, 'job', 243),
  ('ielts', 'b93692ae-d05c-4ce4-9238-7940dc0ee101'::uuid, 'business', 246),
  ('ielts', 'f8a3318d-6dbc-470e-967e-6b9b390d42a1'::uuid, 'issue', 248),
  ('ielts', '660bf31f-e507-4163-98e9-c56de368a8af'::uuid, 'side', 249),
  ('ielts', 'eb1a8c2f-bc3e-43ea-bf4f-06f2d8de69ac'::uuid, 'black', 253),
  ('ielts', 'cc81f50d-e0bc-4ee3-95da-aaa3b8fb93cd'::uuid, 'house', 257),
  ('ielts', '60b5674b-1022-42c2-800f-0bf61fb20e8c'::uuid, 'service', 263),
  ('ielts', '09ef8f0e-f4e6-4aaa-a821-d629212ead73'::uuid, 'important', 266),
  ('ielts', '10091717-b3b8-4502-aca9-7808637ee392'::uuid, 'power', 271),
  ('ielts', '59cc9c99-b159-46a1-b5c7-4f13e97cdc20'::uuid, 'line', 276),
  ('ielts', 'f51f7c52-cb7d-474e-9972-b252d1adb141'::uuid, 'political', 277),
  ('ielts', '934005b0-5b75-4569-9512-1d453593962d'::uuid, 'end', 278),
  ('ielts', 'f08ceab4-7732-4d04-8217-2c8f071ddcd8'::uuid, 'stand', 281),
  ('ielts', 'c2a7b465-6532-4e07-8813-83c5921c9d32'::uuid, 'pay', 286),
  ('ielts', 'a6613586-0dec-4e99-82a3-b359c902f94c'::uuid, 'law', 287),
  ('ielts', 'c2fa2061-8808-4c98-89b1-75156aa7c8ff'::uuid, 'city', 290),
  ('ielts', '48b8bcb9-a650-41c2-af11-9835a4aa4660'::uuid, 'set', 294),
  ('ielts', '3a1c730f-1e59-4251-b6ab-74f143682152'::uuid, 'community', 296),
  ('ielts', 'bfc27324-56a8-4a6d-a368-0f7582a47ad4'::uuid, 'once', 300),
  ('ielts', '44f12eba-ee31-4789-892a-e9546077f1dc'::uuid, 'least', 302),
  ('ielts', '55923b20-5a42-45b6-aec7-1887f8663159'::uuid, 'learn', 304),
  ('ielts', '10c56d3f-c444-4fda-8989-cec2d61b47bb'::uuid, 'team', 307),
  ('ielts', '542a6d74-267e-4424-8eaf-28f621ddb21d'::uuid, 'minute', 308),
  ('ielts', '068aad06-e0b9-4bf0-814b-72801588b41d'::uuid, 'best', 309),
  ('ielts', 'de390475-2845-4b4c-bdba-03644351783b'::uuid, 'several', 310),
  ('ielts', '716f39fd-a726-4651-bc1f-bfd3ec3b3ba6'::uuid, 'idea', 311),
  ('ielts', '117d7d07-d729-401c-be22-91f4cb957a18'::uuid, 'information', 314),
  ('ielts', 'd7af4fa0-fa35-40ca-9a3f-cbbcad05e79c'::uuid, 'nothing', 315),
  ('ielts', '8589fa26-05df-43dd-95a3-df8334ed97b4'::uuid, 'social', 319),
  ('ielts', '9158c9dc-ce28-475f-9034-31399112290b'::uuid, 'centre', 327),
  ('ielts', '4f39484f-114f-493e-b2aa-0dddda1cd4ef'::uuid, 'parent', 327),
  ('ielts', '4e5f1540-8bac-40b1-b342-47eca6c21d4a'::uuid, 'face', 330),
  ('ielts', 'a9c187fa-b330-4448-a7eb-3efadb3e16e5'::uuid, 'create', 332),
  ('ielts', '02fb127e-0317-4e12-96ff-af1d8379f619'::uuid, 'public', 333),
  ('ielts', '23126f64-71b9-440e-92c1-c130dd000d4b'::uuid, 'level', 338),
  ('ielts', '3c29c8fc-6690-456d-82dd-8f8c9f787fc2'::uuid, 'office', 341),
  ('ielts', '6c60bb96-58f0-4089-8d77-bc10a9bbdf4b'::uuid, 'health', 344),
  ('ielts', 'a1c70ff4-bf16-4d49-8b07-7246544bf10d'::uuid, 'person', 345),
  ('ielts', '099f1dfc-783e-4705-85ab-79c39940e628'::uuid, 'art', 346),
  ('ielts', '648997c3-d0c7-4cd5-8b74-7fafae07f848'::uuid, 'history', 350),
  ('ielts', 'ca752736-cf3c-44dd-aa5e-9ff8d174497d'::uuid, 'party', 351),
  ('ielts', '1525d707-0397-41c1-878e-ec270eeb6334'::uuid, 'result', 354),
  ('ielts', '5f309505-7e9f-47a5-ab85-f4f214bf1c39'::uuid, 'reason', 359),
  ('ielts', '57c61633-5ac4-49d1-a86f-8c8de701f87c'::uuid, 'research', 362),
  ('ielts', 'b58194e1-f33d-46c1-a452-7ed6a4a2a4cb'::uuid, 'guy', 364),
  ('ielts', '1dc4cb29-a9de-4351-82c1-60d4a19312fb'::uuid, 'food', 366),
  ('ielts', '73b4f612-9146-4a0b-bd85-a7c267731d84'::uuid, 'air', 370),
  ('ielts', 'c4890b98-1442-4e2e-899b-88c9a3ef8dd2'::uuid, 'teacher', 371),
  ('ielts', '816623a9-165f-4553-b1e2-a9a088a245f9'::uuid, 'offer', 373),
  ('ielts', '1f0acbef-a51c-49c6-8852-ffef82c9f8db'::uuid, 'education', 376),
  ('ielts', 'ade11627-6015-4eda-800c-87472e406613'::uuid, 'foot', 380),
  ('ielts', 'db3588d5-fd80-4364-ae03-123573e946b2'::uuid, 'second', 381),
  ('ielts', '02edca21-ff0b-485a-b1c6-418044695ba0'::uuid, 'age', 386),
  ('ielts', '9903b95d-3b10-45db-a192-c41cbec447f8'::uuid, 'policy', 388),
  ('ielts', '98e0a289-1635-423f-b048-10a13de65287'::uuid, 'process', 391),
  ('ielts', '7f0fa44c-cb15-4acb-8990-b6282e77e1d5'::uuid, 'music', 392),
  ('ielts', '5e323084-77c9-4f17-b0e4-1bc2562c11e0'::uuid, 'human', 399),
  ('ielts', '683037f0-0292-45e2-b946-f6a3c13c4a2d'::uuid, 'market', 402),
  ('ielts', '859273a4-307a-4f7d-b75f-3650e63aa78f'::uuid, 'sense', 407),
  ('ielts', '117b565b-78e2-4788-8c7f-c8efbc5f5268'::uuid, 'fall', 410),
  ('ielts', 'd38a9062-a68b-40d0-9846-7b98bd202a46'::uuid, 'plan', 413),
  ('ielts', 'de4c4237-fb03-4f33-8250-7f0cc5043faa'::uuid, 'cut', 414),
  ('ielts', 'aeea82eb-710f-44c9-8570-2d805d0e289f'::uuid, 'college', 415),
  ('ielts', '137d77ad-26e0-404f-a2c4-3d1163fae4a0'::uuid, 'interest', 416),
  ('ielts', 'bbe4fbb6-68e8-48e4-8a2d-4e2b881a978e'::uuid, 'course', 418),
  ('ielts', '7ae12153-d435-4040-90e6-2f31acfc41e5'::uuid, 'experience', 420),
  ('ielts', '7e8fb072-b618-4045-94c5-f25375eba7a7'::uuid, 'local', 423),
  ('ielts', 'cd305330-68eb-4fed-885e-16ae9fcc4b10'::uuid, 'effect', 427),
  ('ielts', '9a7476d5-df4e-4458-81bf-80340fcde3c0'::uuid, 'class', 431),
  ('ielts', '4cf2a2cf-b0e3-4532-ab2c-c6c82026d99d'::uuid, 'control', 432),
  ('ielts', '419825f7-0f65-43b7-8feb-ce9409e2ea41'::uuid, 'care', 434),
  ('ielts', 'cfc68620-6ce5-49bf-a274-752cf45f4d14'::uuid, 'hard', 438),
  ('ielts', '69d32b11-e736-4d21-8005-07b9364e3e9f'::uuid, 'field', 439),
  ('ielts', '6b24d0d5-ff37-4527-90e4-93bdccfbcf37'::uuid, 'pass', 441),
  ('ielts', '4243f170-3624-4f22-85df-1ab14e8b12c5'::uuid, 'former', 442),
  ('ielts', '69d0db4e-3af9-42b4-843b-db9bf48776a9'::uuid, 'major', 444),
  ('ielts', '28ac1634-27b8-4b3b-be5a-f3307723bf09'::uuid, 'development', 448),
  ('ielts', '93dfb4c2-da4c-4e7e-a47a-b53b3850b98e'::uuid, 'report', 450),
  ('ielts', '2269dd14-0001-4185-9e6d-a073be7a3e58'::uuid, 'role', 451),
  ('ielts', 'f258400f-f5fd-47e1-a8e2-08fba9d94c83'::uuid, 'better', 452),
  ('ielts', '17bb9ab6-45da-45bc-94a6-42c67546ac3c'::uuid, 'economic', 453),
  ('ielts', '7d06e71a-60c7-4ca9-9a72-e89a64519ce0'::uuid, 'rate', 457),
  ('ielts', '12bc2310-8271-4174-addf-3dcddd6d9759'::uuid, 'heart', 460),
  ('ielts', '51cd14b8-f279-4a29-aec1-4bebab5bc0de'::uuid, 'light', 464),
  ('ielts', 'e6a9a57f-3e35-4976-96e4-d3992793b783'::uuid, 'police', 468),
  ('ielts', '1f6bc467-1f31-4ead-9dea-a68df35d6538'::uuid, 'mind', 469),
  ('ielts', 'dee9c5e7-1ec6-40d3-9231-c94a471f20e9'::uuid, 'pull', 471),
  ('ielts', '8a67cf87-42f4-4228-9510-f08e3ecbdb90'::uuid, 'return', 472),
  ('ielts', 'a16a1f9a-54f1-4723-a55d-cc997f70b655'::uuid, 'price', 475),
  ('ielts', 'baebad9a-c98d-49c9-b9d9-b76e197e131d'::uuid, 'decision', 479),
  ('ielts', 'c6e264a8-d6b0-4e2b-a77a-18ed583aa741'::uuid, 'view', 485),
  ('ielts', '07ba16b1-66d2-413a-9dd9-6cedfe553423'::uuid, 'relationship', 486),
  ('ielts', 'ca72121f-706f-4918-94ce-f4666560facd'::uuid, 'carry', 487),
  ('ielts', 'c57fb28a-dee6-409c-90a0-adce2863d522'::uuid, 'town', 488),
  ('ielts', '3cafd539-c336-42df-a874-188aded0cfe6'::uuid, 'road', 489),
  ('ielts', '83cccd88-6af7-496f-9504-153b1fb65fa6'::uuid, 'break', 494),
  ('ielts', '1842d583-7d65-4b6d-aba6-9dc2dbc274d9'::uuid, 'difference', 496),
  ('ielts', '8d9851ef-3d71-4f4a-abbf-68bd7608d61a'::uuid, 'value', 499),
  ('ielts', '85453d4e-06e6-4b0f-8a60-ece5dedcc3bd'::uuid, 'international', 500);

-- 本次**真正会被删掉**的那些对(即删除前确实存在的挂载)。
-- ⚠️ 断言必须拿它当基准,不能拿 _cut 的行数:
--    跑第二遍时该删的已经没了,拿 _cut 判就会报"应减少 175 行、实际减少 0"而整笔回滚。
--    判据要判**终态**,不判"这一次删了多少" —— 否则重跑一份已跑过的 SQL 会炸,
--    而重跑本该是安全的(幂等)。
CREATE TEMP TABLE _cut_present(bank_code text, word_id uuid) ON COMMIT DROP;
INSERT INTO _cut_present
SELECT c.bank_code, c.word_id FROM _cut c
  JOIN vocab_banks b ON b.code = c.bank_code
  JOIN vocab_word_banks wb ON wb.bank_id = b.id AND wb.word_id = c.word_id;

SELECT 'BEFORE' AS stage, code, n FROM _before_links ORDER BY n DESC;

-- ── 摘挂载 ───────────────────────────────────────────────────
DELETE FROM vocab_word_banks wb
 USING _cut c, vocab_banks b
 WHERE b.code = c.bank_code AND wb.bank_id = b.id AND wb.word_id = c.word_id;

-- ── 同步 total_words ─────────────────────────────────────────
-- ⚠️ 必须在同一个事务里同步。十个库现在 total_words 与实际挂载数**全部一致**,
--    只删不同步的话,会从"全对"变成"只有雅思/GRE 两个对不上" —— 那比一直不同步更难发现。
UPDATE vocab_banks b
   SET total_words = (SELECT count(*) FROM vocab_word_banks wb WHERE wb.bank_id = b.id)
 WHERE b.code IN ('ielts', 'gre');

SELECT 'AFTER' AS stage, b.code, b.total_words,
       (SELECT count(*) FROM vocab_word_banks wb WHERE wb.bank_id = b.id) AS actual_links
  FROM vocab_banks b ORDER BY actual_links DESC;

-- ── 断言:任何一条不成立就整笔回滚 ──────────────────────────
DO $gate$
/* ⚠️ 变量一律加 v_ 前缀。第一版叫 n / expected,与临时表 _before_links 的列 n 撞名,
     plpgsql 报 "column reference "n" is ambiguous" 整笔跑不起来 ——
     这种错肉眼审 SQL 看不出来,是 pglite 真跑才炸出来的。 */
DECLARE
  v_n int; v_expected int;
BEGIN
  -- ⑴ 该摘的一条不剩
  SELECT count(*) INTO v_n
    FROM _cut c JOIN vocab_banks b ON b.code = c.bank_code
    JOIN vocab_word_banks wb ON wb.bank_id = b.id AND wb.word_id = c.word_id;
  IF v_n <> 0 THEN RAISE EXCEPTION '还有 % 条该摘的挂载没摘掉', v_n; END IF;

  -- ⑵ 被摘的两个库,减少量正好等于本次行数(多删一条都不行)
  SELECT (SELECT n FROM _before_links WHERE code = 'ielts')
       - (SELECT count(*)::int FROM vocab_word_banks wb JOIN vocab_banks b ON b.id = wb.bank_id WHERE b.code = 'ielts')
    INTO v_n;
  SELECT count(*)::int INTO v_expected FROM _cut_present WHERE bank_code = 'ielts';
  IF v_n <> v_expected THEN RAISE EXCEPTION 'ielts 应减少 % 行,实际减少 %', v_expected, v_n; END IF;
  SELECT (SELECT n FROM _before_links WHERE code = 'gre')
       - (SELECT count(*)::int FROM vocab_word_banks wb JOIN vocab_banks b ON b.id = wb.bank_id WHERE b.code = 'gre')
    INTO v_n;
  SELECT count(*)::int INTO v_expected FROM _cut_present WHERE bank_code = 'gre';
  IF v_n <> v_expected THEN RAISE EXCEPTION 'gre 应减少 % 行,实际减少 %', v_expected, v_n; END IF;

  -- ⑶ 其它八个库的挂载数**一条不少**
  SELECT count(*) INTO v_n FROM _before_links bl
    JOIN vocab_banks b ON b.code = bl.code
   WHERE bl.code NOT IN ('ielts', 'gre')
     AND bl.n <> (SELECT count(*)::int FROM vocab_word_banks wb WHERE wb.bank_id = b.id);
  IF v_n <> 0 THEN RAISE EXCEPTION '有 % 个不该动的库挂载数变了', v_n; END IF;

  -- ⑷ vocab_words 计数不变 —— 本次只摘挂载,一个词都不许消失
  SELECT bw.n INTO v_expected FROM _before_words bw;
  SELECT count(*)::int INTO v_n FROM vocab_words;
  IF v_n <> v_expected THEN RAISE EXCEPTION 'vocab_words 从 % 变成了 % —— 本次绝不该动它', v_expected, v_n; END IF;

  -- ⑸ total_words 与实际挂载数**逐库一致**(事务结束时十个库仍须全对)
  SELECT count(*) INTO v_n FROM vocab_banks b
   WHERE coalesce(b.total_words, -1) <> (SELECT count(*)::int FROM vocab_word_banks wb WHERE wb.bank_id = b.id);
  IF v_n <> 0 THEN RAISE EXCEPTION '有 % 个库的 total_words 与实际挂载数对不上', v_n; END IF;

  -- ⑹ 这些词在**别的库**里的挂载还在:摘完之后,只有 1 个词一个库都不剩
  SELECT count(*) INTO v_n FROM (
    SELECT c.word_id FROM _cut c GROUP BY c.word_id
     HAVING NOT EXISTS (SELECT 1 FROM vocab_word_banks wb WHERE wb.word_id = c.word_id)
  ) t;
  IF v_n <> 1 THEN
    RAISE EXCEPTION '摘完后一个库都不剩的词有 % 个,预期正好 1 个(best)', v_n;
  END IF;

  -- ⑺ 具体点名:中考/高考/基础库里那批挂载必须还在
  SELECT count(*) INTO v_n FROM _cut c
   WHERE c.headword <> 'best'
     AND NOT EXISTS (
       SELECT 1 FROM vocab_word_banks wb JOIN vocab_banks b ON b.id = wb.bank_id
        WHERE wb.word_id = c.word_id AND b.code IN ('zhongkao','gaokao','ket_pet','cet4','cet6','kaoyan','toefl','gmat'));
  IF v_n <> 0 THEN RAISE EXCEPTION '有 % 个词被摘得只剩空壳 —— 它们在初级库里的挂载不见了', v_n; END IF;

  RAISE NOTICE '清理完成:摘 % 行挂载,涉及 % 个词,孤儿 1 个',
    (SELECT count(*) FROM _cut), (SELECT count(DISTINCT word_id) FROM _cut);
END
$gate$;

COMMIT;
