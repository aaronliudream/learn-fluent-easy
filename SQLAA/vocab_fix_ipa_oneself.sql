-- 音标占位符修正 —— 2 条,**按 id 锁定,只改 ipa 一列**
-- 生成: node scripts/vocab/fix-ipa-placeholders.mjs --name=vocab_fix_ipa_oneself
-- ⚠️ 由 Aaron 执行。脚本本身从不写库。
--
-- 规则(定死,写在 gates.mjs 的 g14 注释里):
--   一条原则:真实词形念,词典缩写不念
--   sb / sth / sw / sb's / sth's → 不念(读不出来)
--   one's → /wʌnz/ · oneself → /wʌnˈsɛlf/ · do / doing → 念
--   括号内可选成分                         → 不念,括号也不出现在音标里
--   斜杠择一                               → 只念第一个
--   do / doing                             → 念(真实词形,同 one's)
--
-- ⚠️ **释义、例句、音频一律不动。** 音频是按 headword 文本烧的,与 ipa 无关,不用重烧。
--    下面用改前全表快照断言:只有这 2 行的 ipa 变了,其余列一列没动。
--
-- 逐条:
--   put oneself in sb's shoes  /pʊt ɪn ʃuːz/                  → /pʊt wʌnˈsɛlf ɪn ʃuːz/       (oneself 统一为念 /wʌnˈsɛlf/)
--   throw oneself into         /θroʊ ˈɪntuː/                  → /θroʊ wʌnˈsɛlf ˈɪntuː/       (oneself 统一为念 /wʌnˈsɛlf/)

BEGIN;

CREATE TEMP TABLE _fix(id uuid PRIMARY KEY, headword text, old_ipa text, new_ipa text) ON COMMIT DROP;
INSERT INTO _fix(id, headword, old_ipa, new_ipa) VALUES
  ('9c9387b5-bf19-432b-ae2c-6b9fdb0af907', 'put oneself in sb''s shoes', '/pʊt ɪn ʃuːz/', '/pʊt wʌnˈsɛlf ɪn ʃuːz/'),
  ('5b3c256c-f98a-409c-8ccf-92c0e74acf37', 'throw oneself into', '/θroʊ ˈɪntuː/', '/θroʊ wʌnˈsɛlf ˈɪntuː/');

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
  IF v_n <> 2 THEN RAISE EXCEPTION '名单应 2 行,实际 %', v_n; END IF;

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

  -- ⑸ 全库**只有**这 2 行的 ipa 变了
  SELECT count(*) INTO v_n FROM _before b JOIN vocab_words w ON w.id = b.id
   WHERE b.ipa IS DISTINCT FROM w.ipa;
  IF v_n <> 2 THEN RAISE EXCEPTION '全库有 % 行 ipa 发生变化,应为 2', v_n; END IF;

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

  RAISE NOTICE '音标修正 2 条完成;其余列与行数均未变动';
END
$gate$;

COMMIT;
