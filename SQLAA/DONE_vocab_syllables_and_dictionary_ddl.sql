-- ✅ DONE 2026-08-07 已执行,库内实证:vocab_dictionary 表 + vocab_words.syllables 列已存在
-- 两件事,一个文件:
--   G 段  音节拆分  → vocab_words 加 syllables text[] + syllable_ipa text[]
--   PR-8  点词查词  → 建 vocab_dictionary(ECDICT 预导入例句全部 token)
--
-- 幂等(ADD COLUMN / CREATE TABLE 均 IF NOT EXISTS,策略先 DROP 再建),末尾 count-validate。
-- 生成内容随各自批次开机;本文件只负责把列和表准备好。
-- ⚠️ 由 Aaron 执行。

BEGIN;

SELECT 'BEFORE' AS stage,
       (SELECT count(*) FROM information_schema.columns
         WHERE table_schema='public' AND table_name='vocab_words'
           AND column_name IN ('syllables','syllable_ipa')) AS syllable_cols,
       (SELECT count(*) FROM information_schema.tables
         WHERE table_schema='public' AND table_name='vocab_dictionary') AS has_dictionary;

-- ═══════════════════════════════════════════════════════════════
-- G 段:音节拆分
--
-- syllables     例:{'min','i','mize'}
-- syllable_ipa  例:{'mɪn','ɪ','maɪz'}  —— 长度必须与 syllables 相等(闸门层保证)
--
-- 两条闸门(在生成脚本里,不焊 DB):
--   ① 音节按序拼接必须**逐字母等于 headword**,拼不回即拒
--   ② syllable_ipa 数组长度必须等于 syllables 长度
-- 不写成 DB CHECK 的原因:数组逐元素拼接比对要写函数,而且将来若允许
-- 连字符词(self-defense)的拆分带符号,约束会先炸。判据放生成端更好调。
--
-- 慢速复读**不烧音频**,前端 playbackRate 0.7 实现;
-- 音节朗读音频("min. i. mize." 句点停顿式)每词 1 条,走攒批,复用 vocab_words.audio_url 之外的独立字段?
-- —— 不需要:音节音频是整词一条,直接进攒批后回填到下面这列。
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.vocab_words
  ADD COLUMN IF NOT EXISTS syllables       text[],
  ADD COLUMN IF NOT EXISTS syllable_ipa    text[],
  ADD COLUMN IF NOT EXISTS syllable_audio_url text;

-- ═══════════════════════════════════════════════════════════════
-- PR-8 点词查词:vocab_dictionary
--
-- 例句里**每一个 token** 都要可点,所以这张表覆盖的是"例句中出现过的所有词",
-- 不只是词库里的 4471 个 headword(batch1 约 2000 词,放量后增量导入)。
-- 数据来自 ECDICT(MIT),与 vocab_words 各管各的:
--   vocab_words       = 要学的词,有例句/搭配/掌握度
--   vocab_dictionary  = 查得到的词,只要音标 + 最多 3 个中文义 + 音频
-- 不合并成一张表的原因:合并后"这个词是不是学习目标"这件事就没法区分了,
-- 词库页会把一堆 the/of/because 也列进去。
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.vocab_dictionary (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word        text NOT NULL,            -- 小写规范化后的词形
  ipa         text,
  defs_zh     text[],                   -- 最多 3 个中文义,按常用度排序
  pos         text,
  audio_url   text,
  source      text NOT NULL DEFAULT 'ecdict',
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 一个词形只存一份(大小写不敏感),增量导入走 upsert
CREATE UNIQUE INDEX IF NOT EXISTS vocab_dictionary_word_uq
  ON public.vocab_dictionary (lower(word));

-- 点词时按词形精确查,这个索引就是热路径
CREATE INDEX IF NOT EXISTS vocab_dictionary_word_idx
  ON public.vocab_dictionary (word);

ALTER TABLE public.vocab_dictionary ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS vdict_read_all ON public.vocab_dictionary;
CREATE POLICY vdict_read_all ON public.vocab_dictionary FOR SELECT USING (true);

SELECT 'AFTER' AS stage,
       (SELECT count(*) FROM information_schema.columns
         WHERE table_schema='public' AND table_name='vocab_words'
           AND column_name IN ('syllables','syllable_ipa')) AS syllable_cols,
       (SELECT count(*) FROM information_schema.tables
         WHERE table_schema='public' AND table_name='vocab_dictionary') AS has_dictionary;

-- ── count-validate:六行都必须是 t,否则 ROLLBACK ──
SELECT 'G 段 syllables 是 text[]' AS expect,
       EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_schema='public' AND table_name='vocab_words'
                  AND column_name='syllables' AND udt_name='_text') AS ok
UNION ALL
SELECT 'G 段 syllable_ipa 是 text[]',
       EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_schema='public' AND table_name='vocab_words'
                  AND column_name='syllable_ipa' AND udt_name='_text')
UNION ALL
SELECT 'G 段 syllable_audio_url 列存在',
       EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_schema='public' AND table_name='vocab_words'
                  AND column_name='syllable_audio_url')
UNION ALL
SELECT 'vocab_dictionary 表存在',
       EXISTS (SELECT 1 FROM information_schema.tables
                WHERE table_schema='public' AND table_name='vocab_dictionary')
UNION ALL
SELECT 'vocab_dictionary 开了 RLS 且有一条只读策略(开了没策略=谁都读不到)',
       COALESCE((SELECT relrowsecurity FROM pg_class WHERE oid='public.vocab_dictionary'::regclass), false)
       AND (SELECT count(*) FROM pg_policies
             WHERE schemaname='public' AND tablename='vocab_dictionary') = 1
UNION ALL
SELECT 'vocab_dictionary 词形唯一索引已建',
       EXISTS (SELECT 1 FROM pg_indexes
                WHERE schemaname='public' AND indexname='vocab_dictionary_word_uq');

COMMIT;
