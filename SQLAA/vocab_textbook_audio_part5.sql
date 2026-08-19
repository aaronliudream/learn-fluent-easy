-- 教材批音频回填【第 1/1 片】:10 词 + 30 例句
-- 生成: node scripts/vocab/burn-textbook-audio.mjs --emit-sql --shards=1
-- 合成参数: openai | alloy | speed 1 | accent 空(与全库定版同参,前端点播不会再现合成)
-- ⚠️ 由 Aaron 执行。脚本本身从不写库。
--
-- ⚠️ **顺序是硬的**:建词条 SQL → 内容 SQL → 本份。
--    本份按 lower(headword) / (headword, sort_order) 定位 —— 词和例句都得先存在。
-- ⚠️ audio_url 一律取 tts edge 实际返回值,不是本地猜的 hash
--    (edge 会按地区选 provider,provider 进哈希,自己猜必错)。

BEGIN;

CREATE TEMP TABLE _aw(headword text PRIMARY KEY, url text) ON COMMIT DROP;
CREATE TEMP TABLE _ae(headword text, sort_order int, url text, PRIMARY KEY (headword, sort_order)) ON COMMIT DROP;
INSERT INTO _aw(headword, url) VALUES
  ('what about', 'https://audio.bigmooneducation.com/5a/5acd7a4d10bf01b58f362bdec2360838357bfc3879c1dda6c32c840077ccb60a.mp3'),
  ('excuse me', 'https://audio.bigmooneducation.com/b9/b94d2841fc15b1e7f5640e58a0331317fcb6ca0cabc213942cd7c326450d0d83.mp3'),
  ('take a shower', 'https://audio.bigmooneducation.com/75/75f1f4ae1f63eaa194d5a2792ba27505b571485d27a5b162b18b44e36514ad0e.mp3'),
  ('hold your breath', 'https://audio.bigmooneducation.com/9a/9a075d404f680be81677b84e6098c27f6bd2b8004b0b87d9b0930c05fd24508e.mp3'),
  ('make a getaway', 'https://audio.bigmooneducation.com/ea/ea8e6a38e058eabdd25fcf1685126a59eeae3db994d221938eb4d36dc3e4412f.mp3'),
  ('look on the bright side', 'https://audio.bigmooneducation.com/e6/e600deb2b95d9f8714cfd5c43d887b4390ac5b3f1d96db1c0ede9133312304ec.mp3'),
  ('in danger', 'https://audio.bigmooneducation.com/3e/3e72c4dc1f3bb9201f8ebafbc0b2c5c55e878abf96eb049ad9e387deebb1b4ec.mp3'),
  ('in tears', 'https://audio.bigmooneducation.com/b1/b1ce71a6dd29891e225d25b20e698c40a6b5d80a778fab904f1489579bb336f8.mp3'),
  ('do chores', 'https://audio.bigmooneducation.com/19/19a42328d631ab6b4783f4fb3e154ea077b9a4a41858199ed8b7c147a4bf7792.mp3'),
  ('northeastern', 'https://audio.bigmooneducation.com/60/6018c61115a97395216e5eb478321d556bdd4fc2920aec96cc505fcb1e8b0312.mp3');
INSERT INTO _ae(headword, sort_order, url) VALUES
  ('what about', 3, 'https://audio.bigmooneducation.com/08/081e57745cc0e9a8b69a69aab7f2195369ee649f1a05c10f436928486b79e994.mp3'),
  ('what about', 2, 'https://audio.bigmooneducation.com/53/531162683819ec08601b28db1f93a6173b8ddac1a12afcc84da9bdd89fc29e94.mp3'),
  ('excuse me', 2, 'https://audio.bigmooneducation.com/f8/f878cff8cfa1929ba6f741581f4c78625c023ec285dcff94aab1cc11f63df84b.mp3'),
  ('excuse me', 3, 'https://audio.bigmooneducation.com/c1/c17281c1de97b6656990752d25a2330243b3f85639d9813af4920ce5f040cdaa.mp3'),
  ('what about', 1, 'https://audio.bigmooneducation.com/d6/d6600e99453f80be2fb72433e45bb09e7a2498a80893a0d79b414a78e93a5c9d.mp3'),
  ('excuse me', 1, 'https://audio.bigmooneducation.com/63/63d257c9f76232b89e9687502d7693b52166fb1674ec3fae89d51c2a8b4b31e9.mp3'),
  ('take a shower', 2, 'https://audio.bigmooneducation.com/69/69912f527fd7b275217b9f1843034307c777dd4ad7d12d174babe7794292ffc5.mp3'),
  ('hold your breath', 1, 'https://audio.bigmooneducation.com/51/51d17435ac5a2c904a06f51f15aeeb045d8f2fee55cb8ab77a17b9039de88f89.mp3'),
  ('hold your breath', 3, 'https://audio.bigmooneducation.com/b3/b39dbf46197b4cfb3af5bf73e8d5dcc4735dbe2f71de746b2ecebb5eeee4c53d.mp3'),
  ('take a shower', 3, 'https://audio.bigmooneducation.com/6a/6a0de22d944e88de1d04280eb6a09f818cbc9dc5a87cbe8f14632efbff9eab36.mp3'),
  ('take a shower', 1, 'https://audio.bigmooneducation.com/57/575e0221e2d062656aec4f0a674fe9566946de3985ab0cdd0d67b7de82c35fa6.mp3'),
  ('hold your breath', 2, 'https://audio.bigmooneducation.com/04/04e68d92280fb21d6e42e89784b9b4af070b148d5afd21ea6389017c71875576.mp3'),
  ('make a getaway', 1, 'https://audio.bigmooneducation.com/4f/4f6aca0f1631b5e4e7189bd7a46628f68fae94a6017c804c7fb87a8b66b6bf34.mp3'),
  ('make a getaway', 2, 'https://audio.bigmooneducation.com/2d/2d2f503dc613e3e1f2567ba38016f2b7d1910e5b7e3b62d964b53d6a8a60558c.mp3'),
  ('look on the bright side', 1, 'https://audio.bigmooneducation.com/bf/bfa39c9865a07175143d7973cd9e6f2705893b90c827ac03993bcb4463c610f7.mp3'),
  ('make a getaway', 3, 'https://audio.bigmooneducation.com/6b/6bcb1b04a93eb95d6fe7f332c09a4b29b59b8cbcf41f66daa185960a3a50d632.mp3'),
  ('look on the bright side', 2, 'https://audio.bigmooneducation.com/3d/3d879c434986a8af2d99cc755650008ab143a466435b0e963f4ca73df7e99800.mp3'),
  ('in danger', 2, 'https://audio.bigmooneducation.com/23/23de0c87ea3dc3eeb6262b3acf7cdb70700e9ec741d62e4427e51cfafc5527f2.mp3'),
  ('in tears', 1, 'https://audio.bigmooneducation.com/41/41c230afd768d5f7d8cab56f910280a893facdf1dcc7d425a6ccfd0875add1cb.mp3'),
  ('in danger', 1, 'https://audio.bigmooneducation.com/c1/c127c3d460e96980ac97e0d2aaefad8d11c61a688b0a85f1036235e92b666e3c.mp3'),
  ('look on the bright side', 3, 'https://audio.bigmooneducation.com/db/db12d1f8618c02b0670c23cdb150fa995c2453dc16a5dd6a7d929365108689f8.mp3'),
  ('in tears', 2, 'https://audio.bigmooneducation.com/65/659c3da60d678dd9d4c251ef1c0f357ce3eb72b50455c92583f79b355a711214.mp3'),
  ('in danger', 3, 'https://audio.bigmooneducation.com/b2/b214999b2e8d0e5cfcd6d3c9dd0fb00012627088c4e83368c9ff7b44076ed811.mp3'),
  ('in tears', 3, 'https://audio.bigmooneducation.com/96/967ce22d1502895352d450a278f2d52e68ebdfc0f06bd48cba2c5f4f77938a92.mp3'),
  ('do chores', 1, 'https://audio.bigmooneducation.com/d9/d9bb28be287916c087e74c1cd5d0195a321058e0ed7aa8affe7df01c137901df.mp3'),
  ('do chores', 3, 'https://audio.bigmooneducation.com/be/be579bb8daf843d447cb91af7666241a64e921bf0e9152473411609b88bbb3cb.mp3'),
  ('do chores', 2, 'https://audio.bigmooneducation.com/3c/3c8bf22fd5b53f9d898798d9dcaa497e264efbbc4baa2101982896ab71cea029.mp3'),
  ('northeastern', 1, 'https://audio.bigmooneducation.com/d2/d23b4c56a84a5b07937ded5fdbc07b1b15450461f2dcd3530e64337f60d19c84.mp3'),
  ('northeastern', 2, 'https://audio.bigmooneducation.com/82/8208e0b2d7a55b5ee2c7185744ae9c68e0f42dbc3f4661fcd3e3503233dcdd5c.mp3'),
  ('northeastern', 3, 'https://audio.bigmooneducation.com/7c/7c3f3d8113ceb04e1d00696e1d7e5ac85ec0819e0f0967acd5cd8e63e1ebdd28.mp3');

UPDATE vocab_words w SET audio_url = a.url
  FROM _aw a WHERE lower(w.headword) = a.headword;

UPDATE vocab_examples e SET audio_url = a.url
  FROM _ae a JOIN vocab_words w ON lower(w.headword) = a.headword
 WHERE e.word_id = w.id AND e.sort_order = a.sort_order;

DO $gate$
DECLARE v_n int;
BEGIN
  -- ⑴ 词:本片每条都写进去了,且值一致
  SELECT count(*) INTO v_n FROM _aw a
    LEFT JOIN vocab_words w ON lower(w.headword) = a.headword
   WHERE w.id IS NULL OR w.audio_url IS DISTINCT FROM a.url;
  IF v_n <> 0 THEN RAISE EXCEPTION '本片有 % 个词的音频没写进去或不一致(词不存在也算)', v_n; END IF;

  -- ⑵ 例句:同上
  SELECT count(*) INTO v_n FROM _ae a
    LEFT JOIN vocab_words w ON lower(w.headword) = a.headword
    LEFT JOIN vocab_examples e ON e.word_id = w.id AND e.sort_order = a.sort_order
   WHERE e.id IS NULL OR e.audio_url IS DISTINCT FROM a.url;
  IF v_n <> 0 THEN RAISE EXCEPTION '本片有 % 条例句的音频没写进去或不一致', v_n; END IF;

  -- ⑶ 临时表行数与声明一致(空表会让上面两条真空通过)
  SELECT count(*) INTO v_n FROM _aw;
  IF v_n <> 10 THEN RAISE EXCEPTION '词应有 10 行,实际 %', v_n; END IF;
  SELECT count(*) INTO v_n FROM _ae;
  IF v_n <> 30 THEN RAISE EXCEPTION '例句应有 30 行,实际 %', v_n; END IF;

  -- ⑷ 形态:全部是 CDN 内容寻址路径
  SELECT count(*) INTO v_n FROM (SELECT url FROM _aw UNION ALL SELECT url FROM _ae) t
   WHERE t.url !~ '^https://audio\.bigmooneducation\.com/[0-9a-f]{2}/[0-9a-f]{64}\.mp3$';
  IF v_n <> 0 THEN RAISE EXCEPTION '本片 % 条 URL 形态不合法', v_n; END IF;

  RAISE NOTICE '本片回填 % 词 + % 例句', 10, 30;
END
$gate$;

COMMIT;
