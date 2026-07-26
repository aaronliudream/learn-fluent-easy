-- ============================================================
-- 外研社九上 wy9A 听力音频回填 audio_url(junior_listening_exercises)· 36 条
-- voice=fable(UK 英音单音色)· speed=0.95 · accent=UK · provider=openai
-- URL 为 tts edge 返回的 CDN 直链,原样回填(不自己拼 hash——edge 按地区选 provider)。
-- 内容寻址:URL = sha256(provider|voice|speed|accent|text),同参数重调 edge 会命中 cached,
--   这也是「音频与文稿对得上」的客观反证手段,不靠耳朵判。
-- 幂等:每条都带 audio_url IS NULL 保护,重跑不覆盖既有值。
-- ★断言口径★:不用逐条 ROW_COUNT(重跑时为 0 是合法的,证明不了任何事),
--   改用收口的「终态逐行核对」——拿 (id, 期望URL) 的 VALUES 表 JOIN 实表,断言 36 行完全一致。
--   逐条仍配 GET DIAGNOSTICS(verify_sql 硬规则:空匹配会静默成功),口径写成「0 或 1 行」,
--   因为重跑时 IS NULL 保护会让它是 0——真正的保证由上面那条终态逐行核对给。
-- ============================================================

BEGIN;

-- U1 d1 The morning run (provider:openai)
DO $$ DECLARE n int; BEGIN
  UPDATE public.junior_listening_exercises
     SET audio_url = 'https://audio.bigmooneducation.com/d2/d2d66e5dad09d908293f665aa62fb011d2f82ae138804b29e097d934d0e1ce28.mp3'
   WHERE id = 'c13156f7-36bb-d900-cc24-1b73807b5e41' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n NOT IN (0,1) THEN RAISE EXCEPTION 'U1 The morning run 期望更新 0 或 1 行,实际 % 行', n; END IF;
END $$;

-- U1 d1 The autumn talent show (provider:openai)
DO $$ DECLARE n int; BEGIN
  UPDATE public.junior_listening_exercises
     SET audio_url = 'https://audio.bigmooneducation.com/23/235cc8a29787e573e517c74c91fed37536a3b642d38938b69bd2ddb8c6b87c13.mp3'
   WHERE id = '51e526d2-4a3d-9365-fda2-8f470e3fe1e9' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n NOT IN (0,1) THEN RAISE EXCEPTION 'U1 The autumn talent show 期望更新 0 或 1 行,实际 % 行', n; END IF;
END $$;

-- U1 d1 A gift for Ms Wu (provider:openai)
DO $$ DECLARE n int; BEGIN
  UPDATE public.junior_listening_exercises
     SET audio_url = 'https://audio.bigmooneducation.com/98/98e5112c0dc9b3ae7b9401ac489856228cf791f29e5b01130088cc5c14b6ddf1.mp3'
   WHERE id = 'd7ecd6c7-b200-56fe-ac21-3f286bbc1f7a' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n NOT IN (0,1) THEN RAISE EXCEPTION 'U1 A gift for Ms Wu 期望更新 0 或 1 行,实际 % 行', n; END IF;
END $$;

-- U1 d2 Three hours a day (provider:openai)
DO $$ DECLARE n int; BEGIN
  UPDATE public.junior_listening_exercises
     SET audio_url = 'https://audio.bigmooneducation.com/ee/eeb86da2a175df0014a069452db257673c3d6af7437360c7b1f1b745de907eb0.mp3'
   WHERE id = 'f79492b8-f91e-9a96-3519-e3fe05b73575' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n NOT IN (0,1) THEN RAISE EXCEPTION 'U1 Three hours a day 期望更新 0 或 1 行,实际 % 行', n; END IF;
END $$;

-- U1 d2 Why I keep a diary (provider:openai)
DO $$ DECLARE n int; BEGIN
  UPDATE public.junior_listening_exercises
     SET audio_url = 'https://audio.bigmooneducation.com/84/847654bcd89ab2cb393dcc20827589698140c74941423f885cc85477ac0ddc25.mp3'
   WHERE id = '3d995e3d-d1cc-96ad-3fd5-416bfac28325' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n NOT IN (0,1) THEN RAISE EXCEPTION 'U1 Why I keep a diary 期望更新 0 或 1 行,实际 % 行', n; END IF;
END $$;

-- U1 d3 Four lines on the stage (provider:openai)
DO $$ DECLARE n int; BEGIN
  UPDATE public.junior_listening_exercises
     SET audio_url = 'https://audio.bigmooneducation.com/5a/5ad7e35a7780d6caa66401ed99596c189a1d968ca710d9459c983905f2b572de.mp3'
   WHERE id = '8c7c0267-6e05-b429-66b9-6bff1e068b79' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n NOT IN (0,1) THEN RAISE EXCEPTION 'U1 Four lines on the stage 期望更新 0 或 1 行,实际 % 行', n; END IF;
END $$;

-- U2 d1 Saving for a bike (provider:openai)
DO $$ DECLARE n int; BEGIN
  UPDATE public.junior_listening_exercises
     SET audio_url = 'https://audio.bigmooneducation.com/41/4104f72b3244fa98dee8d3ca73d13cb85e9360d0f628b9f120c6a8aced2c3beb.mp3'
   WHERE id = '54a6dee2-7ae4-d5ef-a686-b636000d50d5' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n NOT IN (0,1) THEN RAISE EXCEPTION 'U2 Saving for a bike 期望更新 0 或 1 行,实际 % 行', n; END IF;
END $$;

-- U2 d1 The class charity sale (provider:openai)
DO $$ DECLARE n int; BEGIN
  UPDATE public.junior_listening_exercises
     SET audio_url = 'https://audio.bigmooneducation.com/c3/c311eb806b885d928e7e4b96a3934bfe176454fb6bd181d77cad385d1030efba.mp3'
   WHERE id = 'd99faebe-5e5d-318f-199b-c8ef7f35a50c' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n NOT IN (0,1) THEN RAISE EXCEPTION 'U2 The class charity sale 期望更新 0 或 1 行,实际 % 行', n; END IF;
END $$;

-- U2 d2 My first ten yuan (provider:openai)
DO $$ DECLARE n int; BEGIN
  UPDATE public.junior_listening_exercises
     SET audio_url = 'https://audio.bigmooneducation.com/3c/3cc9568c35c8dd75a139edf7da950cb15b28bdac0460cdc876b1f5c7ed19845c.mp3'
   WHERE id = 'b044217a-3d28-b80e-c53e-34a52b445d44' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n NOT IN (0,1) THEN RAISE EXCEPTION 'U2 My first ten yuan 期望更新 0 或 1 行,实际 % 行', n; END IF;
END $$;

-- U2 d2 The wallet under the seat (provider:openai)
DO $$ DECLARE n int; BEGIN
  UPDATE public.junior_listening_exercises
     SET audio_url = 'https://audio.bigmooneducation.com/b4/b458ba97a82da91a160836ee033e435b1254ef11936679f17e08bbf650f5f5b9.mp3'
   WHERE id = '925ba2b1-48da-1514-2107-342f45920233' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n NOT IN (0,1) THEN RAISE EXCEPTION 'U2 The wallet under the seat 期望更新 0 或 1 行,实际 % 行', n; END IF;
END $$;

-- U2 d2 Ninety yuan for six (provider:openai)
DO $$ DECLARE n int; BEGIN
  UPDATE public.junior_listening_exercises
     SET audio_url = 'https://audio.bigmooneducation.com/00/00c47929fb14904876836930feb2125cab8b939275991840d13f619a1846a0d5.mp3'
   WHERE id = 'cc420b08-dd2e-3f12-a530-f4a051dc683a' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n NOT IN (0,1) THEN RAISE EXCEPTION 'U2 Ninety yuan for six 期望更新 0 或 1 行,实际 % 行', n; END IF;
END $$;

-- U2 d3 The first price (provider:openai)
DO $$ DECLARE n int; BEGIN
  UPDATE public.junior_listening_exercises
     SET audio_url = 'https://audio.bigmooneducation.com/e1/e13cdc2a7ebc629d2bc3d4de43b2c249c9ee61c5cb48c81bd81e1b5ce603456a.mp3'
   WHERE id = 'bfd5000d-3ae6-f947-d473-2d9db921685a' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n NOT IN (0,1) THEN RAISE EXCEPTION 'U2 The first price 期望更新 0 或 1 行,实际 % 行', n; END IF;
END $$;

-- U3 d1 The paper lantern (provider:openai)
DO $$ DECLARE n int; BEGIN
  UPDATE public.junior_listening_exercises
     SET audio_url = 'https://audio.bigmooneducation.com/25/25d2af11fe9c430666fdc8d99bb1d74a21fb8f90c2aed2b75352bdc355bb1e76.mp3'
   WHERE id = '4fdb4c99-2a96-04b2-c8c6-7569cdb48b83' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n NOT IN (0,1) THEN RAISE EXCEPTION 'U3 The paper lantern 期望更新 0 或 1 行,实际 % 行', n; END IF;
END $$;

-- U3 d1 History Week (provider:openai)
DO $$ DECLARE n int; BEGIN
  UPDATE public.junior_listening_exercises
     SET audio_url = 'https://audio.bigmooneducation.com/80/8048bea535f4fc65b536ea323b1c55d6ed4506ec14e32b0e0ce396eca8b994c1.mp3'
   WHERE id = '1d22452e-7361-df15-f353-584a2a86f43f' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n NOT IN (0,1) THEN RAISE EXCEPTION 'U3 History Week 期望更新 0 或 1 行,实际 % 行', n; END IF;
END $$;

-- U3 d2 Story day in dialect (provider:openai)
DO $$ DECLARE n int; BEGIN
  UPDATE public.junior_listening_exercises
     SET audio_url = 'https://audio.bigmooneducation.com/07/07a08943a9fe25603787446a8ec7c439ed50dcb7a0a08cf470e41511c282b99e.mp3'
   WHERE id = 'a1fedbcb-2510-80d7-d1de-bcb82614e5e5' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n NOT IN (0,1) THEN RAISE EXCEPTION 'U3 Story day in dialect 期望更新 0 或 1 行,实际 % 行', n; END IF;
END $$;

-- U3 d2 The name of our street (provider:openai)
DO $$ DECLARE n int; BEGIN
  UPDATE public.junior_listening_exercises
     SET audio_url = 'https://audio.bigmooneducation.com/bd/bd8c7b70945ddf1ba06dad1cdacae4a8271beb704655590253ae01db45556d2f.mp3'
   WHERE id = 'cd424091-aec8-8648-7827-bcae8634c4fd' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n NOT IN (0,1) THEN RAISE EXCEPTION 'U3 The name of our street 期望更新 0 或 1 行,实际 % 行', n; END IF;
END $$;

-- U3 d2 The old roll book (provider:openai)
DO $$ DECLARE n int; BEGIN
  UPDATE public.junior_listening_exercises
     SET audio_url = 'https://audio.bigmooneducation.com/7a/7a58d342f2e11c82367d5dda481190ec877b96ac4f4674df73227be6a12f0fa5.mp3'
   WHERE id = '692a7a68-9d43-2eca-fb60-8ae0b8e6dfd3' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n NOT IN (0,1) THEN RAISE EXCEPTION 'U3 The old roll book 期望更新 0 或 1 行,实际 % 行', n; END IF;
END $$;

-- U3 d3 The song my grandmother sings (provider:openai)
DO $$ DECLARE n int; BEGIN
  UPDATE public.junior_listening_exercises
     SET audio_url = 'https://audio.bigmooneducation.com/34/3437e41f944546b1160c646c2e85719bbd8017409c999bcd4d4921ad8f3dcd5b.mp3'
   WHERE id = '74cfa8e8-a7c7-5235-b674-3877af979b9d' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n NOT IN (0,1) THEN RAISE EXCEPTION 'U3 The song my grandmother sings 期望更新 0 或 1 行,实际 % 行', n; END IF;
END $$;

-- U4 d1 The doctor by the door (provider:openai)
DO $$ DECLARE n int; BEGIN
  UPDATE public.junior_listening_exercises
     SET audio_url = 'https://audio.bigmooneducation.com/c2/c2b50a8069595a54ab0b2e833aaeaed07aea9cac19e19d8fef7231304daaba64.mp3'
   WHERE id = '590451a7-cb90-e10f-bde0-70424117b190' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n NOT IN (0,1) THEN RAISE EXCEPTION 'U4 The doctor by the door 期望更新 0 或 1 行,实际 % 行', n; END IF;
END $$;

-- U4 d1 Our own heroes (provider:openai)
DO $$ DECLARE n int; BEGIN
  UPDATE public.junior_listening_exercises
     SET audio_url = 'https://audio.bigmooneducation.com/a3/a310d105af69d4016d37d5d190bdd901bb814dadf90c87e36631306cf318a489.mp3'
   WHERE id = '1bff8e8e-5a37-f286-93cc-d31bfee9dbd8' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n NOT IN (0,1) THEN RAISE EXCEPTION 'U4 Our own heroes 期望更新 0 或 1 行,实际 % 行', n; END IF;
END $$;

-- U4 d2 The man with the yellow box (provider:openai)
DO $$ DECLARE n int; BEGIN
  UPDATE public.junior_listening_exercises
     SET audio_url = 'https://audio.bigmooneducation.com/0e/0eedd8b61ca6db43a1d8ab85d884bf5ba4072d79acb886b50463676e01702924.mp3'
   WHERE id = 'ec65dc9a-0a29-a4cf-8d0a-6510ab8b3146' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n NOT IN (0,1) THEN RAISE EXCEPTION 'U4 The man with the yellow box 期望更新 0 或 1 行,实际 % 行', n; END IF;
END $$;

-- U4 d2 The woman who counts birds (provider:openai)
DO $$ DECLARE n int; BEGIN
  UPDATE public.junior_listening_exercises
     SET audio_url = 'https://audio.bigmooneducation.com/da/daf9f73d3251374b8d599da411de5cc5ed86a0d3b87c13e368c6081241b69ac0.mp3'
   WHERE id = '9ea81fb7-bab9-54a1-82f6-1deb799cc5a2' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n NOT IN (0,1) THEN RAISE EXCEPTION 'U4 The woman who counts birds 期望更新 0 或 1 行,实际 % 行', n; END IF;
END $$;

-- U4 d2 The teacher who stayed (provider:openai)
DO $$ DECLARE n int; BEGIN
  UPDATE public.junior_listening_exercises
     SET audio_url = 'https://audio.bigmooneducation.com/11/11a5c7bd5e54656f6b0cae4671a061a975ce4de7b5a362c9e103ccc289b0c941.mp3'
   WHERE id = '1c2ea302-c0a0-3a70-a62f-76c8e60baf42' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n NOT IN (0,1) THEN RAISE EXCEPTION 'U4 The teacher who stayed 期望更新 0 或 1 行,实际 % 行', n; END IF;
END $$;

-- U4 d3 The letter in the drawer (provider:openai)
DO $$ DECLARE n int; BEGIN
  UPDATE public.junior_listening_exercises
     SET audio_url = 'https://audio.bigmooneducation.com/5c/5c9e951fcc6af49c9e25994f5053543ed0111a0c6755ab65aed9f7f5b5622e92.mp3'
   WHERE id = '937cb6f0-d9c0-319c-2453-33a9265df053' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n NOT IN (0,1) THEN RAISE EXCEPTION 'U4 The letter in the drawer 期望更新 0 或 1 行,实际 % 行', n; END IF;
END $$;

-- U5 d1 The nest above the door (provider:openai)
DO $$ DECLARE n int; BEGIN
  UPDATE public.junior_listening_exercises
     SET audio_url = 'https://audio.bigmooneducation.com/66/66ed135138e5488fbc5b284d17021cb09365e3e140e879dd8749efb63a9061b1.mp3'
   WHERE id = '2e05c057-0bdc-e538-2f16-13f458fb73cf' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n NOT IN (0,1) THEN RAISE EXCEPTION 'U5 The nest above the door 期望更新 0 或 1 行,实际 % 行', n; END IF;
END $$;

-- U5 d1 Nature Watch Week (provider:openai)
DO $$ DECLARE n int; BEGIN
  UPDATE public.junior_listening_exercises
     SET audio_url = 'https://audio.bigmooneducation.com/60/60799fd98356245f84c9aaf6430ec8844099c77e32a552eee777802add49a286.mp3'
   WHERE id = '06d0d0f1-4a7f-4105-0de5-dc881e1ac96b' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n NOT IN (0,1) THEN RAISE EXCEPTION 'U5 Nature Watch Week 期望更新 0 或 1 行,实际 % 行', n; END IF;
END $$;

-- U5 d2 The bird club''s first morning (provider:openai)
DO $$ DECLARE n int; BEGIN
  UPDATE public.junior_listening_exercises
     SET audio_url = 'https://audio.bigmooneducation.com/f7/f72fe5830ae31bd0475931af3b26abeb9e280ced7a00d7174d84f9bd5f6201aa.mp3'
   WHERE id = '11dd0ee4-92a4-47c2-b50d-74db560b06c5' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n NOT IN (0,1) THEN RAISE EXCEPTION 'U5 The bird club''s first morning 期望更新 0 或 1 行,实际 % 行', n; END IF;
END $$;

-- U5 d2 The bird in the box (provider:openai)
DO $$ DECLARE n int; BEGIN
  UPDATE public.junior_listening_exercises
     SET audio_url = 'https://audio.bigmooneducation.com/95/95470ddd84c23d9a6c860e5a70211044ba8b12abd184adbe8d3babdc655ea3fd.mp3'
   WHERE id = '40a26039-1233-09c7-bcec-5414cb61ed7b' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n NOT IN (0,1) THEN RAISE EXCEPTION 'U5 The bird in the box 期望更新 0 或 1 行,实际 % 行', n; END IF;
END $$;

-- U5 d2 The frogs came back (provider:openai)
DO $$ DECLARE n int; BEGIN
  UPDATE public.junior_listening_exercises
     SET audio_url = 'https://audio.bigmooneducation.com/14/14dc9dff28d3da07244c9db4f4367f67a2d3751c0be77dd68a0556872bb19fb5.mp3'
   WHERE id = 'd280cef0-2e20-8d86-8e3e-b4e3b9941ab3' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n NOT IN (0,1) THEN RAISE EXCEPTION 'U5 The frogs came back 期望更新 0 或 1 行,实际 % 行', n; END IF;
END $$;

-- U5 d3 The lights in the grass (provider:openai)
DO $$ DECLARE n int; BEGIN
  UPDATE public.junior_listening_exercises
     SET audio_url = 'https://audio.bigmooneducation.com/e3/e352b5dd6f6a892a1ab381e18527cad988bcdd0b5be10816a199edf16a5bbbbc.mp3'
   WHERE id = 'e218264c-f459-2990-9000-579eb7de9587' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n NOT IN (0,1) THEN RAISE EXCEPTION 'U5 The lights in the grass 期望更新 0 或 1 行,实际 % 行', n; END IF;
END $$;

-- U6 d1 Green Travel Month (provider:openai)
DO $$ DECLARE n int; BEGIN
  UPDATE public.junior_listening_exercises
     SET audio_url = 'https://audio.bigmooneducation.com/45/45154daa0e4a60a945c6d1c6d5260ca59aea4457d0c22be14001066ca0080ef6.mp3'
   WHERE id = '18cb9ecd-bb1f-8123-0ac8-a27433bda879' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n NOT IN (0,1) THEN RAISE EXCEPTION 'U6 Green Travel Month 期望更新 0 或 1 行,实际 % 行', n; END IF;
END $$;

-- U6 d1 Bring your own cup (provider:openai)
DO $$ DECLARE n int; BEGIN
  UPDATE public.junior_listening_exercises
     SET audio_url = 'https://audio.bigmooneducation.com/73/732fbf13ea8fd76b16a4e446b1f3c928c353a45d67f3a26f9abd1a5a8c8f5831.mp3'
   WHERE id = 'fbc505ab-64df-e2c7-3c0a-d25d19ca4b5b' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n NOT IN (0,1) THEN RAISE EXCEPTION 'U6 Bring your own cup 期望更新 0 或 1 行,实际 % 行', n; END IF;
END $$;

-- U6 d2 The walking bus (provider:openai)
DO $$ DECLARE n int; BEGIN
  UPDATE public.junior_listening_exercises
     SET audio_url = 'https://audio.bigmooneducation.com/e0/e07934cb11d06f5c029e2527c9c1e3ebd3465e4350870a6f5f7181412c3f1f9a.mp3'
   WHERE id = '96fa1912-f492-4fc5-f8e1-5df763fde617' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n NOT IN (0,1) THEN RAISE EXCEPTION 'U6 The walking bus 期望更新 0 或 1 行,实际 % 行', n; END IF;
END $$;

-- U6 d2 The uniform swap (provider:openai)
DO $$ DECLARE n int; BEGIN
  UPDATE public.junior_listening_exercises
     SET audio_url = 'https://audio.bigmooneducation.com/82/82664301cdb8ca88ff32536da3e5c2444eb62036cc4936c7158d891eb173d6b6.mp3'
   WHERE id = 'c2382b17-5ceb-55f6-ed4f-564be80b674d' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n NOT IN (0,1) THEN RAISE EXCEPTION 'U6 The uniform swap 期望更新 0 或 1 行,实际 % 行', n; END IF;
END $$;

-- U6 d2 The blue barrel (provider:openai)
DO $$ DECLARE n int; BEGIN
  UPDATE public.junior_listening_exercises
     SET audio_url = 'https://audio.bigmooneducation.com/fe/fe46e8d12c33df165f1d130c0e18ca899a4568116f7c0754989c2bb7617b93f5.mp3'
   WHERE id = '3cb74601-e9fd-9efa-85ee-baf910078999' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n NOT IN (0,1) THEN RAISE EXCEPTION 'U6 The blue barrel 期望更新 0 或 1 行,实际 % 行', n; END IF;
END $$;

-- U6 d3 A week without plastic (provider:openai)
DO $$ DECLARE n int; BEGIN
  UPDATE public.junior_listening_exercises
     SET audio_url = 'https://audio.bigmooneducation.com/dc/dcea20988c506cfa8ab40f4ed456c5f04805a830875a72a3e1fadb4b0102aa9f.mp3'
   WHERE id = 'c37a7ea4-a0cf-b48f-0714-14bdd4430dce' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n NOT IN (0,1) THEN RAISE EXCEPTION 'U6 A week without plastic 期望更新 0 或 1 行,实际 % 行', n; END IF;
END $$;

-- ── 收口:终态断言(非增量)────────────────────────────────
DO $$
DECLARE n int;
BEGIN
  -- ① 终态逐行核对:36 条的 (id, audio_url) 必须与预期逐行完全一致
  --    这一条同时覆盖了「填了」「填对了」「没串行」三件事。
  SELECT count(*) INTO n FROM (VALUES
    ('c13156f7-36bb-d900-cc24-1b73807b5e41'::uuid, 'https://audio.bigmooneducation.com/d2/d2d66e5dad09d908293f665aa62fb011d2f82ae138804b29e097d934d0e1ce28.mp3'),
    ('51e526d2-4a3d-9365-fda2-8f470e3fe1e9'::uuid, 'https://audio.bigmooneducation.com/23/235cc8a29787e573e517c74c91fed37536a3b642d38938b69bd2ddb8c6b87c13.mp3'),
    ('d7ecd6c7-b200-56fe-ac21-3f286bbc1f7a'::uuid, 'https://audio.bigmooneducation.com/98/98e5112c0dc9b3ae7b9401ac489856228cf791f29e5b01130088cc5c14b6ddf1.mp3'),
    ('f79492b8-f91e-9a96-3519-e3fe05b73575'::uuid, 'https://audio.bigmooneducation.com/ee/eeb86da2a175df0014a069452db257673c3d6af7437360c7b1f1b745de907eb0.mp3'),
    ('3d995e3d-d1cc-96ad-3fd5-416bfac28325'::uuid, 'https://audio.bigmooneducation.com/84/847654bcd89ab2cb393dcc20827589698140c74941423f885cc85477ac0ddc25.mp3'),
    ('8c7c0267-6e05-b429-66b9-6bff1e068b79'::uuid, 'https://audio.bigmooneducation.com/5a/5ad7e35a7780d6caa66401ed99596c189a1d968ca710d9459c983905f2b572de.mp3'),
    ('54a6dee2-7ae4-d5ef-a686-b636000d50d5'::uuid, 'https://audio.bigmooneducation.com/41/4104f72b3244fa98dee8d3ca73d13cb85e9360d0f628b9f120c6a8aced2c3beb.mp3'),
    ('d99faebe-5e5d-318f-199b-c8ef7f35a50c'::uuid, 'https://audio.bigmooneducation.com/c3/c311eb806b885d928e7e4b96a3934bfe176454fb6bd181d77cad385d1030efba.mp3'),
    ('b044217a-3d28-b80e-c53e-34a52b445d44'::uuid, 'https://audio.bigmooneducation.com/3c/3cc9568c35c8dd75a139edf7da950cb15b28bdac0460cdc876b1f5c7ed19845c.mp3'),
    ('925ba2b1-48da-1514-2107-342f45920233'::uuid, 'https://audio.bigmooneducation.com/b4/b458ba97a82da91a160836ee033e435b1254ef11936679f17e08bbf650f5f5b9.mp3'),
    ('cc420b08-dd2e-3f12-a530-f4a051dc683a'::uuid, 'https://audio.bigmooneducation.com/00/00c47929fb14904876836930feb2125cab8b939275991840d13f619a1846a0d5.mp3'),
    ('bfd5000d-3ae6-f947-d473-2d9db921685a'::uuid, 'https://audio.bigmooneducation.com/e1/e13cdc2a7ebc629d2bc3d4de43b2c249c9ee61c5cb48c81bd81e1b5ce603456a.mp3'),
    ('4fdb4c99-2a96-04b2-c8c6-7569cdb48b83'::uuid, 'https://audio.bigmooneducation.com/25/25d2af11fe9c430666fdc8d99bb1d74a21fb8f90c2aed2b75352bdc355bb1e76.mp3'),
    ('1d22452e-7361-df15-f353-584a2a86f43f'::uuid, 'https://audio.bigmooneducation.com/80/8048bea535f4fc65b536ea323b1c55d6ed4506ec14e32b0e0ce396eca8b994c1.mp3'),
    ('a1fedbcb-2510-80d7-d1de-bcb82614e5e5'::uuid, 'https://audio.bigmooneducation.com/07/07a08943a9fe25603787446a8ec7c439ed50dcb7a0a08cf470e41511c282b99e.mp3'),
    ('cd424091-aec8-8648-7827-bcae8634c4fd'::uuid, 'https://audio.bigmooneducation.com/bd/bd8c7b70945ddf1ba06dad1cdacae4a8271beb704655590253ae01db45556d2f.mp3'),
    ('692a7a68-9d43-2eca-fb60-8ae0b8e6dfd3'::uuid, 'https://audio.bigmooneducation.com/7a/7a58d342f2e11c82367d5dda481190ec877b96ac4f4674df73227be6a12f0fa5.mp3'),
    ('74cfa8e8-a7c7-5235-b674-3877af979b9d'::uuid, 'https://audio.bigmooneducation.com/34/3437e41f944546b1160c646c2e85719bbd8017409c999bcd4d4921ad8f3dcd5b.mp3'),
    ('590451a7-cb90-e10f-bde0-70424117b190'::uuid, 'https://audio.bigmooneducation.com/c2/c2b50a8069595a54ab0b2e833aaeaed07aea9cac19e19d8fef7231304daaba64.mp3'),
    ('1bff8e8e-5a37-f286-93cc-d31bfee9dbd8'::uuid, 'https://audio.bigmooneducation.com/a3/a310d105af69d4016d37d5d190bdd901bb814dadf90c87e36631306cf318a489.mp3'),
    ('ec65dc9a-0a29-a4cf-8d0a-6510ab8b3146'::uuid, 'https://audio.bigmooneducation.com/0e/0eedd8b61ca6db43a1d8ab85d884bf5ba4072d79acb886b50463676e01702924.mp3'),
    ('9ea81fb7-bab9-54a1-82f6-1deb799cc5a2'::uuid, 'https://audio.bigmooneducation.com/da/daf9f73d3251374b8d599da411de5cc5ed86a0d3b87c13e368c6081241b69ac0.mp3'),
    ('1c2ea302-c0a0-3a70-a62f-76c8e60baf42'::uuid, 'https://audio.bigmooneducation.com/11/11a5c7bd5e54656f6b0cae4671a061a975ce4de7b5a362c9e103ccc289b0c941.mp3'),
    ('937cb6f0-d9c0-319c-2453-33a9265df053'::uuid, 'https://audio.bigmooneducation.com/5c/5c9e951fcc6af49c9e25994f5053543ed0111a0c6755ab65aed9f7f5b5622e92.mp3'),
    ('2e05c057-0bdc-e538-2f16-13f458fb73cf'::uuid, 'https://audio.bigmooneducation.com/66/66ed135138e5488fbc5b284d17021cb09365e3e140e879dd8749efb63a9061b1.mp3'),
    ('06d0d0f1-4a7f-4105-0de5-dc881e1ac96b'::uuid, 'https://audio.bigmooneducation.com/60/60799fd98356245f84c9aaf6430ec8844099c77e32a552eee777802add49a286.mp3'),
    ('11dd0ee4-92a4-47c2-b50d-74db560b06c5'::uuid, 'https://audio.bigmooneducation.com/f7/f72fe5830ae31bd0475931af3b26abeb9e280ced7a00d7174d84f9bd5f6201aa.mp3'),
    ('40a26039-1233-09c7-bcec-5414cb61ed7b'::uuid, 'https://audio.bigmooneducation.com/95/95470ddd84c23d9a6c860e5a70211044ba8b12abd184adbe8d3babdc655ea3fd.mp3'),
    ('d280cef0-2e20-8d86-8e3e-b4e3b9941ab3'::uuid, 'https://audio.bigmooneducation.com/14/14dc9dff28d3da07244c9db4f4367f67a2d3751c0be77dd68a0556872bb19fb5.mp3'),
    ('e218264c-f459-2990-9000-579eb7de9587'::uuid, 'https://audio.bigmooneducation.com/e3/e352b5dd6f6a892a1ab381e18527cad988bcdd0b5be10816a199edf16a5bbbbc.mp3'),
    ('18cb9ecd-bb1f-8123-0ac8-a27433bda879'::uuid, 'https://audio.bigmooneducation.com/45/45154daa0e4a60a945c6d1c6d5260ca59aea4457d0c22be14001066ca0080ef6.mp3'),
    ('fbc505ab-64df-e2c7-3c0a-d25d19ca4b5b'::uuid, 'https://audio.bigmooneducation.com/73/732fbf13ea8fd76b16a4e446b1f3c928c353a45d67f3a26f9abd1a5a8c8f5831.mp3'),
    ('96fa1912-f492-4fc5-f8e1-5df763fde617'::uuid, 'https://audio.bigmooneducation.com/e0/e07934cb11d06f5c029e2527c9c1e3ebd3465e4350870a6f5f7181412c3f1f9a.mp3'),
    ('c2382b17-5ceb-55f6-ed4f-564be80b674d'::uuid, 'https://audio.bigmooneducation.com/82/82664301cdb8ca88ff32536da3e5c2444eb62036cc4936c7158d891eb173d6b6.mp3'),
    ('3cb74601-e9fd-9efa-85ee-baf910078999'::uuid, 'https://audio.bigmooneducation.com/fe/fe46e8d12c33df165f1d130c0e18ca899a4568116f7c0754989c2bb7617b93f5.mp3'),
    ('c37a7ea4-a0cf-b48f-0714-14bdd4430dce'::uuid, 'https://audio.bigmooneducation.com/dc/dcea20988c506cfa8ab40f4ed456c5f04805a830875a72a3e1fadb4b0102aa9f.mp3')
  ) AS w(id, url)
  LEFT JOIN public.junior_listening_exercises e ON e.id = w.id
  WHERE e.id IS NULL OR e.audio_url IS DISTINCT FROM w.url;
  IF n <> 0 THEN RAISE EXCEPTION '终态逐行核对不一致的条数=%(期望 0)', n; END IF;

  -- ② 本册 36 条必须全部有音频
  SELECT count(*) INTO n FROM public.junior_listening_exercises
   WHERE publisher='junior_fltrp' AND volume='wy9A' AND audio_url IS NULL;
  IF n <> 0 THEN RAISE EXCEPTION '仍有 % 条 audio_url 为空', n; END IF;

  -- ③ 条数仍是 36(防误插误删)
  SELECT count(*) INTO n FROM public.junior_listening_exercises
   WHERE publisher='junior_fltrp' AND volume='wy9A';
  IF n <> 36 THEN RAISE EXCEPTION '本册条数变成 %,期望 36', n; END IF;

  -- ④ URL 必须互不相同(36 篇文稿各异 → 内容寻址 URL 也应各异;重复即两条共用一段音频)
  SELECT count(*) INTO n FROM (
    SELECT audio_url FROM public.junior_listening_exercises
     WHERE publisher='junior_fltrp' AND volume='wy9A'
     GROUP BY audio_url HAVING count(*) > 1) t;
  IF n <> 0 THEN RAISE EXCEPTION '有 % 个 audio_url 被多条共用', n; END IF;

  -- ⑤ 域名必须是 CDN 直链(防把内网直链或占位串填进去)
  SELECT count(*) INTO n FROM public.junior_listening_exercises
   WHERE publisher='junior_fltrp' AND volume='wy9A'
     AND audio_url NOT LIKE 'https://audio.bigmooneducation.com/%';
  IF n <> 0 THEN RAISE EXCEPTION '有 % 条 audio_url 域名异常', n; END IF;

  -- ⑥ 不得误伤其它册:前四册音频不应出现空缺
  SELECT count(*) INTO n FROM public.junior_listening_exercises
   WHERE publisher='junior_fltrp' AND volume IN ('wy7A','wy7B','wy8A','wy8B')
     AND audio_url IS NULL;
  IF n <> 0 THEN RAISE EXCEPTION '前四册出现 % 条音频空缺,疑似误伤', n; END IF;
END $$;

COMMIT;

-- ============================================================
-- 跑完必看:期望 6 行,total 全 6、with_audio 全 6、null_audio 全 0、uniq_url 全 6
-- ============================================================
SELECT unit,
       count(*) AS total,
       count(*) FILTER (WHERE audio_url IS NOT NULL) AS with_audio,
       count(*) FILTER (WHERE audio_url IS NULL) AS null_audio,
       count(DISTINCT audio_url) AS uniq_url
  FROM public.junior_listening_exercises
 WHERE publisher='junior_fltrp' AND volume='wy9A'
 GROUP BY unit ORDER BY unit;
