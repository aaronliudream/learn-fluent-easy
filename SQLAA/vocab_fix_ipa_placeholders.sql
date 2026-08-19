-- 音标占位符修正 —— 14 条,**按 id 锁定,只改 ipa 一列**
-- 生成: node scripts/vocab/fix-ipa-placeholders.mjs
-- ⚠️ 由 Aaron 执行。脚本本身从不写库。
--
-- 规则(定死,写在 gates.mjs 的 g14 注释里):
--   sb / sth / sw / sb's / sth's / oneself → 不念
--   one's                                  → 念作 /wʌnz/
--   括号内可选成分                         → 不念,括号也不出现在音标里
--   斜杠择一                               → 只念第一个
--   do / doing                             → 念(真实词形,同 one's)
--
-- ⚠️ **释义、例句、音频一律不动。** 音频是按 headword 文本烧的,与 ipa 无关,不用重烧。
--    下面用改前全表快照断言:只有这 14 行的 ipa 变了,其余列一列没动。
--
-- 逐条:
--   help sb with               /hɛlp sɪb wɪð/                 → /hɛlp wɪð/                   (sb 念成 sɪb)
--   to sb's surprise           /tə sbz səˈpraɪz/              → /tə səˈpraɪz/                (sb's 念成 sbz)
--   fight against sb/sth       /faɪt əˈɡeɪnst ˈsʌm.bɒ.di/     → /faɪt əˈɡeɪnst/              (sb 念成 somebody)
--   keep on doing sth          /kiːp ɒn ˈduː.ɪŋ ˈsʌm.θɪŋ/     → /kiːp ɒn ˈduː.ɪŋ/            (sth 念成 something)
--   ready to do sth            /ˈrɛd.i tə duː ˈsʌm.θɪŋ/       → /ˈrɛd.i tə duː/              (sth 念成 something)
--   show interest in sth       /ʃoʊ ˈɪn.trəst ɪn ˈsʌm.θɪŋ/    → /ʃoʊ ˈɪn.trəst ɪn/           (sth 念成 something)
--   try one's best             /traɪ bɛst/                    → /traɪ wʌnz bɛst/             (one's 该念却省了)
--   make one's own decision    /meɪk oʊn dɪˈsɪʒ.ən/           → /meɪk wʌnz oʊn dɪˈsɪʒ.ən/    (one's 该念却省了)
--   put oneself in sb's shoes  /pʊt wʌnˈsɛlf ɪn ˈsʊz/         → /pʊt ɪn ʃuːz/                (oneself 被念 + shoes 转错成 ˈsʊz)
--   move on (to sth)           /muːv ɑn (tuː)/                → /muːv ɑn/                    (括号原样抄进音标)
--   run low (on sth)           /rʌn loʊ ɑn/                   → /rʌn loʊ/                    (括号没了但 on 念了)
--   cut sth in/into sth        /kʌt ɪn ˈɪntu/                 → /kʌt ɪn/                     (斜杠两边都念了)
--   throw oneself into         /θroʊ jʊrˈsɛlf ˈɪntuː/         → /θroʊ ˈɪntuː/                (oneself 念成 yourself(同样违反已定规则))
--   stop sth from doing        /stɑp frʌm/                    → /stɑp frʌm ˈduːɪŋ/           (doing 漏念(规则未覆盖 do/doing,按真实词形处理))

BEGIN;

CREATE TEMP TABLE _fix(id uuid PRIMARY KEY, headword text, old_ipa text, new_ipa text) ON COMMIT DROP;
INSERT INTO _fix(id, headword, old_ipa, new_ipa) VALUES
  ('af71df0d-4eb8-42d7-a292-a1aa77405f6b', 'help sb with', '/hɛlp sɪb wɪð/', '/hɛlp wɪð/'),
  ('fb5adb36-5c87-4689-9ab6-b53f18af4aa7', 'to sb''s surprise', '/tə sbz səˈpraɪz/', '/tə səˈpraɪz/'),
  ('e1359a70-4837-4e36-8356-90a774f9efd6', 'fight against sb/sth', '/faɪt əˈɡeɪnst ˈsʌm.bɒ.di/', '/faɪt əˈɡeɪnst/'),
  ('e10215e0-b26d-48ea-898a-4c1cdef6f042', 'keep on doing sth', '/kiːp ɒn ˈduː.ɪŋ ˈsʌm.θɪŋ/', '/kiːp ɒn ˈduː.ɪŋ/'),
  ('b6e39549-5d97-4e13-9765-b311198d3941', 'ready to do sth', '/ˈrɛd.i tə duː ˈsʌm.θɪŋ/', '/ˈrɛd.i tə duː/'),
  ('33e644fd-9a44-4a3e-907d-817a5109d62e', 'show interest in sth', '/ʃoʊ ˈɪn.trəst ɪn ˈsʌm.θɪŋ/', '/ʃoʊ ˈɪn.trəst ɪn/'),
  ('efd977a9-2fcd-4208-884d-e2996361bbfa', 'try one''s best', '/traɪ bɛst/', '/traɪ wʌnz bɛst/'),
  ('80b45ce9-0e27-4467-bd6a-7338843789ed', 'make one''s own decision', '/meɪk oʊn dɪˈsɪʒ.ən/', '/meɪk wʌnz oʊn dɪˈsɪʒ.ən/'),
  ('9c9387b5-bf19-432b-ae2c-6b9fdb0af907', 'put oneself in sb''s shoes', '/pʊt wʌnˈsɛlf ɪn ˈsʊz/', '/pʊt ɪn ʃuːz/'),
  ('d1a1cf7d-d965-4519-81d1-fca4b43bc08c', 'move on (to sth)', '/muːv ɑn (tuː)/', '/muːv ɑn/'),
  ('288e593a-8a6f-43c4-be6e-c4f45ccd6e7f', 'run low (on sth)', '/rʌn loʊ ɑn/', '/rʌn loʊ/'),
  ('19c828e7-cc6a-4195-a744-59f99bc9c3a6', 'cut sth in/into sth', '/kʌt ɪn ˈɪntu/', '/kʌt ɪn/'),
  ('5b3c256c-f98a-409c-8ccf-92c0e74acf37', 'throw oneself into', '/θroʊ jʊrˈsɛlf ˈɪntuː/', '/θroʊ ˈɪntuː/'),
  ('8a6af64c-454e-44f5-9553-50af92ac97c2', 'stop sth from doing', '/stɑp frʌm/', '/stɑp frʌm ˈduːɪŋ/');

-- 改前快照:证明"只动了 ipa、只动了这几行"唯一靠得住的办法
CREATE TEMP TABLE _before AS
  SELECT id, headword, ipa, def_zh, def_en, pos, audio_url FROM vocab_words;

SELECT 'BEFORE' AS stage, f.headword, w.ipa
  FROM _fix f JOIN vocab_words w ON w.id = f.id ORDER BY f.headword;

UPDATE vocab_words w SET ipa = f.new_ipa, updated_at = now()
  FROM _fix f WHERE w.id = f.id;

SELECT 'AFTER' AS stage, f.headword, w.ipa
  FROM _fix f JOIN vocab_words w ON w.id = f.id ORDER BY f.headword;

DO $gate$
DECLARE v_n int;
BEGIN
  -- ⑴ 名单非空且行数对(空表会让下面每条断言真空通过)
  SELECT count(*) INTO v_n FROM _fix;
  IF v_n <> 14 THEN RAISE EXCEPTION '名单应 14 行,实际 %', v_n; END IF;

  -- ⑵ 名单里每个 id 都真的在库里(不加这条,id 写错会让后面几条断言真空通过,
  --    只剩 ⑷ 那条数量断言兜底 —— 报错信息会指向完全不相干的地方)
  SELECT count(*) INTO v_n FROM _fix f
   WHERE NOT EXISTS (SELECT 1 FROM vocab_words w WHERE w.id = f.id);
  IF v_n <> 0 THEN RAISE EXCEPTION '名单里有 % 个 id 在库里不存在', v_n; END IF;

  -- ⑶ 改前值必须就是名单里的坏值 —— 对不上就是改错行,或者已经有人改过
  SELECT count(*) INTO v_n FROM _fix f JOIN _before b ON b.id = f.id
   WHERE b.ipa IS DISTINCT FROM f.old_ipa;
  IF v_n <> 0 THEN RAISE EXCEPTION '有 % 行改前值与名单对不上 —— 已回滚', v_n; END IF;

  -- ⑷ 终态:每一行都等于新值(判终态,不判这一次改了多少)
  SELECT count(*) INTO v_n FROM _fix f JOIN vocab_words w ON w.id = f.id
   WHERE w.ipa IS DISTINCT FROM f.new_ipa;
  IF v_n <> 0 THEN RAISE EXCEPTION '有 % 行没改成新值', v_n; END IF;

  -- ⑸ 全库**只有**这 14 行的 ipa 变了
  SELECT count(*) INTO v_n FROM _before b JOIN vocab_words w ON w.id = b.id
   WHERE b.ipa IS DISTINCT FROM w.ipa;
  IF v_n <> 14 THEN RAISE EXCEPTION '全库有 % 行 ipa 发生变化,应为 14', v_n; END IF;

  -- ⑹ 其余列一列没动(Aaron 已审过的释义/例句/音频)
  SELECT count(*) INTO v_n FROM _before b JOIN vocab_words w ON w.id = b.id
   WHERE b.headword IS DISTINCT FROM w.headword
      OR b.def_zh   IS DISTINCT FROM w.def_zh
      OR b.def_en   IS DISTINCT FROM w.def_en
      OR b.pos      IS DISTINCT FROM w.pos
      OR b.audio_url IS DISTINCT FROM w.audio_url;
  IF v_n <> 0 THEN RAISE EXCEPTION '有 % 行的其它列被改动了 —— 已回滚', v_n; END IF;

  -- ⑺ 没有多出来或少掉的行
  SELECT count(*) INTO v_n FROM vocab_words;
  IF v_n <> (SELECT count(*) FROM _before) THEN RAISE EXCEPTION '词条总数变了 —— 已回滚'; END IF;

  RAISE NOTICE '音标修正 14 条完成;其余列与行数均未变动';
END
$gate$;

COMMIT;
