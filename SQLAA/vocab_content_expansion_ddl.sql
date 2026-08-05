-- 放量内容规格 A/C/D 段的建表 DDL(一个文件交付)
--
--   A 段  反义词      → vocab_words.antonyms text[]
--   C 段  辨析组      → vocab_confusion_groups + vocab_confusion_members
--   D 段  词块        → vocab_chunks + vocab_chunk_banks
--   F 段  高频搭配    → vocab_collocations【Aaron 已手动建好,本文件只勘验对齐,不重建】
--
-- 全部幂等(IF NOT EXISTS / 策略先 DROP 再建),末尾 count-validate。
-- 生成内容等 PR-2 合并后与 4273 词同批开机;本文件只负责把表准备好。
-- ⚠️ 由 Aaron 执行。
--
-- ── 跑之前的实测基线(2026-08-05 查 information_schema)──
--   vocab_collocations: 已存在,6 列,unique(word_id, collocation),RLS 开,1 条策略,
--                       索引 vcol_word_idx 已建,0 行
--   vocab_words.antonyms: 不存在
--   vocab_confusion_groups / _members / vocab_chunks / vocab_chunk_banks: 均不存在

BEGIN;

SELECT 'BEFORE' AS stage,
       (SELECT count(*) FROM information_schema.columns
         WHERE table_schema='public' AND table_name='vocab_words' AND column_name='antonyms') AS has_antonyms,
       (SELECT count(*) FROM information_schema.tables WHERE table_schema='public'
         AND table_name IN ('vocab_confusion_groups','vocab_confusion_members','vocab_chunks','vocab_chunk_banks')) AS new_tables,
       (SELECT count(*) FROM information_schema.tables WHERE table_schema='public'
         AND table_name='vocab_collocations') AS has_collocations;

-- ═══════════════════════════════════════════════════════════════
-- A 段:反义词
-- 生成规则(内容侧,非 DDL 约束):有才给、最多 3 个、名词等无反义词留空不硬凑。
-- 用数组列而不是单开一张表:反义词是词的属性、数量极少(≤3)、不需要单独排序或挂音频。
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.vocab_words
  ADD COLUMN IF NOT EXISTS antonyms text[];

-- ═══════════════════════════════════════════════════════════════
-- C 段:辨析组
-- 一组 2-4 个易混词,每个成员给"语感一句话"(feel_zh)与"对比提示"(contrast_hint)。
-- 长度上限(feel_zh ≤10 字 / contrast_hint ≤20 字 / title_zh ≤6 字)由生成端闸门保证,
-- 这里**不加 CHECK 约束** —— 中文长度按字符数算,DDL 里写 char_length 约束会把
-- 将来想放宽的口径焊死在库上,改起来要动表。闸门在生成侧更好调。
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.vocab_confusion_groups (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_key  text NOT NULL UNIQUE,          -- 稳定标识,重跑生成时按它 upsert,不靠 title 匹配
  title_zh   text NOT NULL,                 -- ≤6 字,如「说的方式」
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vocab_confusion_members (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id      uuid NOT NULL REFERENCES public.vocab_confusion_groups(id) ON DELETE CASCADE,
  word_id       uuid NOT NULL REFERENCES public.vocab_words(id) ON DELETE CASCADE,
  feel_zh       text NOT NULL,              -- ≤10 字,组内必须互异(生成端 g 闸保证)
  contrast_hint text,                       -- ≤20 字
  sort_order    integer NOT NULL DEFAULT 1,
  created_at    timestamptz NOT NULL DEFAULT now(),
  -- 同一个词在同一组里只能出现一次
  UNIQUE (group_id, word_id)
);

-- 「每词最多属 2 组」是生成端闸门,不做成 DB 约束:
-- DB 层要表达它得写触发器,而触发器会让批量灌库变慢且难排查。
CREATE INDEX IF NOT EXISTS vcm_word_idx  ON public.vocab_confusion_members (word_id);
CREATE INDEX IF NOT EXISTS vcm_group_idx ON public.vocab_confusion_members (group_id, sort_order);

-- ═══════════════════════════════════════════════════════════════
-- D 段:词块
-- ✅ 2026-08-05 Aaron 裁决:反推版补 type / scene 两列后通过。
--    example_en / example_zh / example_audio_url 命名批准;freq_rank 替代 freq_tier 批准
--    (tier1 = rank <= 100);def_en 省略批准。
--    生成规格:300-500 条,每条 1 例句走九闸门,tier1 的 100 条先行全量审,其余分批。
-- 以下是当初反推时的记录,留档:
--      前端要的是:词库页「词块」tab + chunk 卡(大字词块 / 释义 / 例句 / 朗读),
--      另外「听音辨义短语模式」与「自动浏览」要接这张表。
--      据此给了:chunk 文本、中译、一条例句(英+中)、词块音频、例句音频、频率序。
--      **跑之前请核一眼字段够不够**;缺字段现在加是一行 ADD COLUMN,灌完库再加要回填。
-- vocab_chunk_banks 与 vocab_word_banks 同形:词块挂到词库,多对多。
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.vocab_chunks (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chunk             text NOT NULL,          -- 词块本体,如 "take into account"
  type              text NOT NULL,          -- phrasal_verb / frame / connector / collocation_ext
  scene             text,                   -- 与 vocab_examples 同的 10 值枚举(闸门层校验,不焊 DB)
  translation_zh    text NOT NULL,          -- 词块中译
  example_en        text,                   -- 一条例句(chunk 卡上展示)
  example_zh        text,
  audio_url         text,                   -- 词块朗读
  example_audio_url text,                   -- 例句朗读
  freq_rank         integer,                -- 频率序,1 最高
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- 幂等补列:表若已存在于早前的部分执行,上面的 CREATE TABLE IF NOT EXISTS 会整个跳过,
-- 那两列就补不上了。所以这里再补一次。
-- ⚠️ type 是 NOT NULL,但 ADD COLUMN 不能直接带 NOT NULL(表里若已有行会报错),
--    所以走"先加可空列 → 回填 → 再 SET NOT NULL"。现在 0 行,回填是空跑。
ALTER TABLE public.vocab_chunks ADD COLUMN IF NOT EXISTS type  text;
ALTER TABLE public.vocab_chunks ADD COLUMN IF NOT EXISTS scene text;
UPDATE public.vocab_chunks SET type = 'collocation_ext' WHERE type IS NULL;
ALTER TABLE public.vocab_chunks ALTER COLUMN type SET NOT NULL;

-- type 的取值约束焊在 DB 上(四值枚举是定死的分类,不是会漂的文案);
-- scene 按裁决不焊,留在闸门层。
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conrelid = 'public.vocab_chunks'::regclass AND conname = 'vocab_chunks_type_chk'
  ) THEN
    ALTER TABLE public.vocab_chunks
      ADD CONSTRAINT vocab_chunks_type_chk
      CHECK (type IN ('phrasal_verb','frame','connector','collocation_ext'));
  END IF;
END $$;

-- 同一个词块只存一份(大小写不敏感),重跑生成走 upsert。
CREATE UNIQUE INDEX IF NOT EXISTS vocab_chunks_chunk_uq ON public.vocab_chunks (lower(chunk));

CREATE TABLE IF NOT EXISTS public.vocab_chunk_banks (
  chunk_id uuid NOT NULL REFERENCES public.vocab_chunks(id) ON DELETE CASCADE,
  bank_id  uuid NOT NULL REFERENCES public.vocab_banks(id)  ON DELETE CASCADE,
  PRIMARY KEY (chunk_id, bank_id)
);
CREATE INDEX IF NOT EXISTS vcb_bank_idx ON public.vocab_chunk_banks (bank_id);

-- ═══════════════════════════════════════════════════════════════
-- RLS:内容表一律「登录与否都可读、任何人不可写」。
-- 写入只走 Aaron 手跑 SQL(service role 绕过 RLS),前端永远只读。
-- ⚠️ 开了 RLS 却不建 SELECT 策略 = 谁都读不到,页面直接空 —— 这是最容易漏的一步。
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.vocab_confusion_groups  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocab_confusion_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocab_chunks            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocab_chunk_banks       ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS vcg_read_all ON public.vocab_confusion_groups;
DROP POLICY IF EXISTS vcm_read_all ON public.vocab_confusion_members;
DROP POLICY IF EXISTS vch_read_all ON public.vocab_chunks;
DROP POLICY IF EXISTS vcbk_read_all ON public.vocab_chunk_banks;

CREATE POLICY vcg_read_all  ON public.vocab_confusion_groups  FOR SELECT USING (true);
CREATE POLICY vcm_read_all  ON public.vocab_confusion_members FOR SELECT USING (true);
CREATE POLICY vch_read_all  ON public.vocab_chunks            FOR SELECT USING (true);
CREATE POLICY vcbk_read_all ON public.vocab_chunk_banks       FOR SELECT USING (true);

-- ═══════════════════════════════════════════════════════════════
-- F 段:vocab_collocations —— **已存在,不重建**。这里只做勘验对齐 + 两处加固。
-- 实测已有:id / word_id / collocation / translation_zh / freq_rank / audio_url,
--          unique(word_id, collocation),RLS 开 + 1 条只读策略,索引 vcol_word_idx,0 行。
-- ═══════════════════════════════════════════════════════════════

-- 加固①:word_id 目前可空。可空意味着能插进「不属于任何词」的孤儿搭配,
--        而 unique(word_id, collocation) 对 NULL 不去重(NULL 不等于 NULL),
--        孤儿还能重复插。表里 0 行,现在收紧零成本;灌完库再收要先清洗。
ALTER TABLE public.vocab_collocations
  ALTER COLUMN word_id SET NOT NULL;

-- 加固②:补外键(若尚未有),保证词被删时搭配跟着走,不留悬挂行。
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conrelid = 'public.vocab_collocations'::regclass
       AND contype  = 'f'
  ) THEN
    ALTER TABLE public.vocab_collocations
      ADD CONSTRAINT vocab_collocations_word_id_fkey
      FOREIGN KEY (word_id) REFERENCES public.vocab_words(id) ON DELETE CASCADE;
  END IF;
END $$;

SELECT 'AFTER' AS stage,
       (SELECT count(*) FROM information_schema.columns
         WHERE table_schema='public' AND table_name='vocab_words' AND column_name='antonyms') AS has_antonyms,
       (SELECT count(*) FROM information_schema.tables WHERE table_schema='public'
         AND table_name IN ('vocab_confusion_groups','vocab_confusion_members','vocab_chunks','vocab_chunk_banks')) AS new_tables;

-- ── count-validate:八行都必须是 t,否则 ROLLBACK ──
SELECT 'A 段 antonyms 列已存在且是 text[]' AS expect,
       EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_schema='public' AND table_name='vocab_words'
                  AND column_name='antonyms' AND udt_name='_text') AS ok
UNION ALL
SELECT 'C 段两表都在',
       (SELECT count(*) FROM information_schema.tables WHERE table_schema='public'
         AND table_name IN ('vocab_confusion_groups','vocab_confusion_members')) = 2
UNION ALL
SELECT 'D 段两表都在',
       (SELECT count(*) FROM information_schema.tables WHERE table_schema='public'
         AND table_name IN ('vocab_chunks','vocab_chunk_banks')) = 2
UNION ALL
SELECT '四张新表全部开了 RLS',
       (SELECT count(*) FROM pg_class
         WHERE oid IN ('public.vocab_confusion_groups'::regclass,'public.vocab_confusion_members'::regclass,
                       'public.vocab_chunks'::regclass,'public.vocab_chunk_banks'::regclass)
           AND relrowsecurity) = 4
UNION ALL
SELECT '四张新表各有一条只读策略(开了 RLS 没策略=谁都读不到)',
       (SELECT count(*) FROM pg_policies WHERE schemaname='public'
         AND tablename IN ('vocab_confusion_groups','vocab_confusion_members','vocab_chunks','vocab_chunk_banks')) = 4
UNION ALL
SELECT 'D 段 vocab_chunks.type 存在且 NOT NULL,CHECK 约束已建',
       (SELECT is_nullable FROM information_schema.columns
         WHERE table_schema='public' AND table_name='vocab_chunks' AND column_name='type') = 'NO'
       AND EXISTS (SELECT 1 FROM pg_constraint
                    WHERE conrelid='public.vocab_chunks'::regclass AND conname='vocab_chunks_type_chk')
UNION ALL
SELECT 'D 段 vocab_chunks.scene 列存在',
       EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_schema='public' AND table_name='vocab_chunks' AND column_name='scene')
UNION ALL
SELECT '词块唯一索引已建(lower(chunk))',
       EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='vocab_chunks_chunk_uq')
UNION ALL
SELECT 'F 段 vocab_collocations 未被重建(仍是原表,列数为 6)',
       (SELECT count(*) FROM information_schema.columns
         WHERE table_schema='public' AND table_name='vocab_collocations') = 6
UNION ALL
SELECT 'F 段 word_id 已收紧为 NOT NULL 且有外键',
       (SELECT is_nullable FROM information_schema.columns
         WHERE table_schema='public' AND table_name='vocab_collocations' AND column_name='word_id') = 'NO'
       AND EXISTS (SELECT 1 FROM pg_constraint
                    WHERE conrelid='public.vocab_collocations'::regclass AND contype='f');

COMMIT;
