-- ============================================================
-- 关7听力音频预生成回填 audio_url(wy8A); voice=fable speed=0.9; 填 edge 返回的 CF URL
-- 幂等:仅 audio_url IS NULL 才更新
-- ============================================================

BEGIN;

DO $$
DECLARE n int; filled int; total int := 0;
BEGIN
  -- U1 d1 "I've grown taller" (provider:openai)
  UPDATE public.junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/7d/7d17966fcc161b055296d65830d7b0217d76ab2a35f3aefba3fd57cec1ae9085.mp3' WHERE id = '4601d95d-c694-02e3-2a22-47297b22b9cb' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; total := total + n;
  -- U1 d1 "Have you ever tried it?" (provider:openai)
  UPDATE public.junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/6f/6fe683850ad62db2b379e70d8ac3c1759e9eb655cb09d413979c057b5e816cd8.mp3' WHERE id = '895495a3-e534-2969-ec23-eb895aed18d2' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; total := total + n;
  -- U1 d1 "How I have changed" (provider:openai)
  UPDATE public.junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/c0/c06cdb60aec84b9e40daace6dfdb6b19f15061cd0c8cdf8e2184348f78f7c898.mp3' WHERE id = 'a91f99bf-fd2f-c54d-78cf-6958fdadc137' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; total := total + n;
  -- U1 d1 "My Story Week" (provider:openai)
  UPDATE public.junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/ba/ba415bdfa8ced745d3f782a8b6af9baed3d46a13f63bff7970515b811756e11c.mp3' WHERE id = '54021e4f-2e03-e134-6afa-8c62947ab15d' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; total := total + n;
  -- U1 d2 "Have you finished yet?" (provider:openai)
  UPDATE public.junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/a5/a500fa9386f1d1f3ccc663d4d5d8fc8fc39e1d8aad6f2d2d6418279290e701f1.mp3' WHERE id = '399cfd54-942a-ffc5-17e5-0b7e8f2ca046' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; total := total + n;
  -- U1 d2 "A gift that changed me" (provider:openai)
  UPDATE public.junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/2d/2d8db4dfb6facc0c31a87178374e62f90ea8ee8cbe2ab5994cd0bfb55df9526b.mp3' WHERE id = 'cf5301d8-a6f3-3e19-38f7-de2bc4696bae' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; total := total + n;
  -- U2 d1 "My best friend" (provider:openai)
  UPDATE public.junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/4b/4b14ce0bc30f69191b84d396d054ccd95ee47e3d0b956c8575cb35bb2b2432f7.mp3' WHERE id = 'c936de9a-8f87-63db-bf36-0e24378789a3' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; total := total + n;
  -- U2 d1 "We've made up" (provider:openai)
  UPDATE public.junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/14/14f7ea12b00b67dea783e8c500ec196f41b8d98f0e91cdbf279416b53a496031.mp3' WHERE id = '43f6eb22-6021-d2df-c4dc-bb06867cb7d4' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; total := total + n;
  -- U2 d1 "Have you thanked her?" (provider:openai)
  UPDATE public.junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/85/85c82732c9ac863e59229e327165daded82d6f2eb016dc77a745608e29a896c5.mp3' WHERE id = '9af458d0-3854-73ae-2f75-aeef49552d8d' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; total := total + n;
  -- U2 d1 "Kindness Week" (provider:openai)
  UPDATE public.junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/20/20ef0024702fd4798671c640fa147c5fa8bcee7b7a652a295235b17ea4086874.mp3' WHERE id = '855a6d8d-7d55-b594-a9bc-8ff8343fcb69' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; total := total + n;
  -- U2 d2 "Getting along at home" (provider:openai)
  UPDATE public.junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/3d/3da72b49e695f6e27a90e3add9a72a765c21f15d490be0ba70d56f1b3bf33b54.mp3' WHERE id = 'a8674f8e-8b31-bb3b-31d2-47f0bf5f7883' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; total := total + n;
  -- U2 d2 "Old neighbours" (provider:openai)
  UPDATE public.junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/4c/4c61509b1d6fcc6b809ec1f1956a420cf36265f827e074035dc40a996ab4e563.mp3' WHERE id = '3f5ed540-bb22-5ee6-1fe2-2f1201b89b60' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; total := total + n;
  -- U3 d1 "I want to be a doctor" (provider:openai)
  UPDATE public.junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/09/09c53b85af3aa03988eff78d646a4f2d3671220d50f46e1992ef593f0555957e.mp3' WHERE id = 'da771765-e0a4-562d-f314-f4d37c46f618' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; total := total + n;
  -- U3 d1 "Planning the show" (provider:openai)
  UPDATE public.junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/5b/5b35e875ec46273f5d47c1930c7eff628c645bc6a34286241d9763972ec74bef.mp3' WHERE id = 'ff037712-bb13-4778-129d-95b259842f88' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; total := total + n;
  -- U3 d1 "Never stop trying" (provider:openai)
  UPDATE public.junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/29/29507cee770781dc1424e4ad8105b11a623f03dffd7dd1d5e350f91a3fd00189.mp3' WHERE id = 'dedf4a18-1ca9-6dea-f6a7-0194de4cbb9b' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; total := total + n;
  -- U3 d1 "Dream Big Day" (provider:openai)
  UPDATE public.junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/06/0692f27587f0f56452053aebb1918c918072431e7fa22ca1f95db2a183b11fcd.mp3' WHERE id = 'e6c6e87e-99fa-1a17-a0f3-7fd63470a933' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; total := total + n;
  -- U3 d2 "Keep practising" (provider:openai)
  UPDATE public.junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/e1/e13aff8e215d9440d77ac83493f1d6f110863f16404b44171117cfaa1711d749.mp3' WHERE id = '5841aeac-f284-4526-1732-49cdc67be8a4' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; total := total + n;
  -- U3 d2 "The power of small steps" (provider:openai)
  UPDATE public.junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/80/80f82ad16a0fb10e069706340c5604881175ad785db5cfaef5ecac76794ac1d1.mp3' WHERE id = '67c6bab7-8240-2b02-3155-7bee858b9f1f' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; total := total + n;
  -- U4 d1 "Too much screen time" (provider:openai)
  UPDATE public.junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/48/484b581f4aea08018f287fbab0ad63f31411b2d55c5303b1739b1db722c76c3a.mp3' WHERE id = '4d4395bb-abc0-6776-3be6-df925a62aa23' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; total := total + n;
  -- U4 d1 "Stay safe online" (provider:openai)
  UPDATE public.junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/0f/0f7c671191f8e8e28e75ee02011efa1932250eae391c8c587ad44ff6d6e11785.mp3' WHERE id = 'f7781579-346f-13f9-6bfa-55171d8c3dcb' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; total := total + n;
  -- U4 d1 "A smart phone habit" (provider:openai)
  UPDATE public.junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/23/23ffd0d6f8d702505eb2fdafe031bcae57a96996c07c394eb28fef955f8988e6.mp3' WHERE id = '8a29b834-021b-897d-30ed-2b22c8d06c49' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; total := total + n;
  -- U4 d1 "Digital Wisdom Day" (provider:openai)
  UPDATE public.junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/56/569f553d0a32a0ebde1f1a57b7a33168ce1124b633969993944b55076057b2b6.mp3' WHERE id = '29878e46-f3b4-fc6c-2991-d5504e6441d2' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; total := total + n;
  -- U4 d2 "Help me with the app" (provider:openai)
  UPDATE public.junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/87/87ed2de393e742f845da02fb11b527d5d9bbae0dfc5ff3ced8ecc9b8889c27f4.mp3' WHERE id = '486aa332-14ba-8cf8-bcf3-16924ac28196' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; total := total + n;
  -- U4 d2 "Learning online" (provider:openai)
  UPDATE public.junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/b3/b358b7b45b9b9c9df9af8d2bfc05d4214b595e424bed08a94628d72c8d36b72b.mp3' WHERE id = '49200bc6-1f30-62db-4f63-ac06e77e53fe' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; total := total + n;
  -- U5 d1 "Getting up early" (provider:openai)
  UPDATE public.junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/d3/d3b5199f2767ae9fff4145896ee4e4a5ddd5a3065a783f6781afc8077fefa2e7.mp3' WHERE id = '44765455-a297-8752-4fec-0e4b2452089b' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; total := total + n;
  -- U5 d1 "Why we have rules" (provider:openai)
  UPDATE public.junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/04/04ff5a6891d5c0119e43bbffa96b23a174eb8e97a14ed86bdbacb0f9e119edfb.mp3' WHERE id = 'fc01c57e-8bcf-aab7-a744-46a9364102c0' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; total := total + n;
  -- U5 d1 "Be a Good Citizen Week" (provider:openai)
  UPDATE public.junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/c6/c6a91cd6ccad8b91ce8b121153f19999cfc88c8b37ba332d3f07719e1855de8f.mp3' WHERE id = 'be7c0617-1f80-ff3a-0508-7aa6174158fc' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; total := total + n;
  -- U5 d1 "Why wait in line?" (provider:openai)
  UPDATE public.junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/d1/d1f1e25b45750b1a5377e6274193127dac46b7985d450868a9a05e06f739bdb5.mp3' WHERE id = '3da1095f-0789-e919-e025-90032c339919' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; total := total + n;
  -- U5 d2 "A polite city" (provider:openai)
  UPDATE public.junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/a8/a807747bdbe36832ab14a6c1d2948e45ffb5750966f39aba398ad5d6ef2714dd.mp3' WHERE id = '6b6b55f8-d76d-94f8-caa5-9da312d75d99' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; total := total + n;
  -- U5 d2 "Keep the park clean" (provider:openai)
  UPDATE public.junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/ee/ee9ea7ac952eda526847563b390b02a1a7f036e6c1e9902615bc24fc48355ecd.mp3' WHERE id = '80b1ead1-8f0c-9831-a255-0a16e1edf762' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; total := total + n;
  -- U6 d1 "The earthquake drill" (provider:openai)
  UPDATE public.junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/e6/e668b638462db0184cf028b2c905125d26148f1ea0d3285ab45be6a43c4887c1.mp3' WHERE id = '6cb25f56-ceb4-92e9-82bd-21e19f155c2d' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; total := total + n;
  -- U6 d1 "During the storm" (provider:openai)
  UPDATE public.junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/53/5388eb0701881e81047bfddf1391dce7f0e4bb3ac02d411b8d7df728f8e7eaf2.mp3' WHERE id = '46a4da42-ca54-a6d3-3a80-0bdc2062400c' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; total := total + n;
  -- U6 d1 "Safety First Week" (provider:openai)
  UPDATE public.junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/64/64fd0cbe6f35ea331b7bb20ea556c2e35817b3f304c51edcbd1d9aca3fc49c5e.mp3' WHERE id = 'ded04dd5-416d-11a6-5584-cbc82d8d4228' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; total := total + n;
  -- U6 d1 "The night of the flood" (provider:openai)
  UPDATE public.junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/4f/4f765c751f17e1394bbd3d176c6285dcd52541df8872f27c2d88602364300c67.mp3' WHERE id = '1879c2ab-0734-143c-32de-0f6e47106abf' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; total := total + n;
  -- U6 d2 "A brave neighbour" (provider:openai)
  UPDATE public.junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/ac/acdffc3c34d99c47c5820d4e973fd60fb4db7cae1bf93620ab5f8687663e8291.mp3' WHERE id = 'd8cf070f-7782-6f47-ad83-26ca3ea156c8' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; total := total + n;
  -- U6 d2 "A hero at sea" (provider:openai)
  UPDATE public.junior_listening_exercises SET audio_url = 'https://audio.bigmooneducation.com/81/81c658c3cbed86015c9185a45a02ee633a32a21a7bbbcc621546473b78f2679e.mp3' WHERE id = '2c9c7a79-a40a-d759-5610-60af1c1583c5' AND audio_url IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; total := total + n;

  -- 断言按【终态】不按【本次改了几行】:重跑时 IS NULL 全不命中、total=0 是正确的,
  -- 但终态必须是 36 条全有音频。这样既幂等,又能抓住「跑成功了却一行没生效」。
  SELECT count(*) INTO filled FROM public.junior_listening_exercises
   WHERE publisher = 'junior_fltrp' AND volume = 'wy8A' AND audio_url IS NOT NULL;
  IF filled <> 36 THEN
    RAISE EXCEPTION 'wy8A 终态有音频 % 条,期望 36(本次实改 % 行)——勿当成功', filled, total;
  END IF;
  RAISE NOTICE 'wy8A 音频回填:本次实改 % 行,终态 % / 36', total, filled;
END $$;

COMMIT;
