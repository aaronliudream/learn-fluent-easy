-- ═══════════════════════════════════════════════════════════════
-- H 段 美国习惯用语 + I 段 中文高频表达→地道英文 · 建表
--
-- 纯 schema,零内容。跑完这份之后两段的内容 SQL 才有地方落。
-- ⚠️ 由 Aaron 执行。末尾 count-validate,任一行不是 t 就 ROLLBACK。
--
-- ⚠️ I 段的表结构我没找到"Aaron 确认稿",这份是按 2026-08-05 那条消息里的
--    规格设计的(cn_phrase + 3 种说法 + register + 每种 1 例句 + scene_hint)。
--    与确认稿有出入以确认稿为准,告诉我我改 —— 现在改零成本,灌了内容再改就要迁移。
-- ═══════════════════════════════════════════════════════════════

BEGIN;

SELECT 'BEFORE' AS stage,
       (SELECT count(*) FROM information_schema.columns
         WHERE table_schema='public' AND table_name='vocab_chunks' AND column_name='literal_trap') AS has_literal_trap,
       (SELECT count(*) FROM information_schema.tables WHERE table_schema='public'
         AND table_name IN ('vocab_cn_expressions','vocab_cn_renditions')) AS cn_tables;

-- ═══════════════════════════════════════════════════════════════
-- H 段:习语挂在 vocab_chunks 上,不另起炉灶
--
-- 理由:习语就是词块的一种,前端"词块标签页按 type 筛选"天然承接,零改动。
-- 新增两样:type 枚举加 'idiom'、可空列 literal_trap。
-- ═══════════════════════════════════════════════════════════════

-- literal_trap:直译陷阱一句话。
-- 例:piece of cake -> 字面"一块蛋糕",实为"小菜一碟"
-- ⚠️ 可空 —— 只有 type='idiom' 的行才填,普通词块不填。
--    做成 NOT NULL 会逼着 phrasal_verb/frame 那些行编一句废话。
ALTER TABLE public.vocab_chunks
  ADD COLUMN IF NOT EXISTS literal_trap text;

-- type 枚举加 'idiom'。约束是先删再建 —— ALTER CONSTRAINT 改不了 CHECK 表达式。
ALTER TABLE public.vocab_chunks DROP CONSTRAINT IF EXISTS vocab_chunks_type_chk;
ALTER TABLE public.vocab_chunks
  ADD CONSTRAINT vocab_chunks_type_chk
  CHECK (type IN ('phrasal_verb','frame','connector','collocation_ext','idiom'));

-- 只对 idiom 行要求 literal_trap 非空 —— 部分索引式的条件约束,
-- 普通词块不受影响。⚠️ 长度上限 20 字在**生成端**卡(与 spec.mjs 同源),
-- 这里只卡"idiom 必须有",不卡长度:长度规则将来要调,调 DB 约束太重。
ALTER TABLE public.vocab_chunks DROP CONSTRAINT IF EXISTS vocab_chunks_idiom_trap_chk;
ALTER TABLE public.vocab_chunks
  ADD CONSTRAINT vocab_chunks_idiom_trap_chk
  CHECK (type <> 'idiom' OR (literal_trap IS NOT NULL AND btrim(literal_trap) <> ''));

CREATE INDEX IF NOT EXISTS vocab_chunks_type_idx ON public.vocab_chunks (type);

-- ═══════════════════════════════════════════════════════════════
-- I 段:中文高频表达 → 地道英文
--
-- 拆成两张表而不是一张宽表:一条中文表达对应 **3 种**美国人真实说法,
-- 每种说法各有 register / 例句 / 场景提示 / 音频。塞进一张表要么开 15 个
-- rendition_1_* 列(加第 4 种说法就得改表),要么用 jsonb(查不动、约束不了)。
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.vocab_cn_expressions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cn_phrase   text NOT NULL,              -- 中文表达本体,如「辛苦了」「此地无银三百两」
  category    text NOT NULL,              -- daily 日常表达 / proverb 谚语俗语
  note_zh     text,                       -- 可选:这条中文本身的用法说明
  sort_order  integer NOT NULL DEFAULT 1,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 幂等补列:表若在早前的部分执行里已建,上面的 CREATE 会整个跳过。
ALTER TABLE public.vocab_cn_expressions
  ADD COLUMN IF NOT EXISTS note_zh    text,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.vocab_cn_expressions DROP CONSTRAINT IF EXISTS vocab_cn_expressions_category_chk;
ALTER TABLE public.vocab_cn_expressions
  ADD CONSTRAINT vocab_cn_expressions_category_chk CHECK (category IN ('daily','proverb'));

-- 中文表达唯一 —— 重跑生成器时按它 upsert,不靠 id 匹配
CREATE UNIQUE INDEX IF NOT EXISTS vocab_cn_expressions_phrase_uq
  ON public.vocab_cn_expressions (cn_phrase);

CREATE TABLE IF NOT EXISTS public.vocab_cn_renditions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expression_id     uuid NOT NULL REFERENCES public.vocab_cn_expressions(id) ON DELETE CASCADE,
  rendition         text NOT NULL,        -- 美国人真实说法,如 "Thanks for your hard work"
  register          text NOT NULL,        -- casual / neutral / formal
  freq_rank         integer NOT NULL DEFAULT 1,   -- 使用频率序,1 最常用
  scene_hint        text NOT NULL,        -- 何时用这种说法(中文,一句话)
  example_en        text NOT NULL,        -- 例句,必须含 rendition 原文(生成端闸门保证)
  example_zh        text NOT NULL,
  scene             text,                 -- 与 vocab_examples 同的 10 值枚举,闸门层校验
  audio_url         text,                 -- rendition 朗读
  example_audio_url text,                 -- 例句朗读
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vocab_cn_renditions
  ADD COLUMN IF NOT EXISTS scene             text,
  ADD COLUMN IF NOT EXISTS audio_url         text,
  ADD COLUMN IF NOT EXISTS example_audio_url text,
  ADD COLUMN IF NOT EXISTS updated_at        timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.vocab_cn_renditions DROP CONSTRAINT IF EXISTS vocab_cn_renditions_register_chk;
ALTER TABLE public.vocab_cn_renditions
  ADD CONSTRAINT vocab_cn_renditions_register_chk CHECK (register IN ('casual','neutral','formal'));

-- 同一条中文下说法不重复 —— 生成端 r1 闸门也查,DB 这层是最后一道
CREATE UNIQUE INDEX IF NOT EXISTS vocab_cn_renditions_uq
  ON public.vocab_cn_renditions (expression_id, rendition);
CREATE INDEX IF NOT EXISTS vocab_cn_renditions_expr_idx
  ON public.vocab_cn_renditions (expression_id, freq_rank);

-- ═══════════════════════════════════════════════════════════════
-- RLS:前端只读,写入只走 Aaron 手跑 SQL(service role 绕过 RLS)。
-- ⚠️ 开了 RLS 却不建 SELECT 策略 = 谁都读不到,页面直接空 —— 最容易漏的一步。
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.vocab_cn_expressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocab_cn_renditions  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS vce_read_all ON public.vocab_cn_expressions;
DROP POLICY IF EXISTS vcr_read_all ON public.vocab_cn_renditions;
CREATE POLICY vce_read_all ON public.vocab_cn_expressions FOR SELECT USING (true);
CREATE POLICY vcr_read_all ON public.vocab_cn_renditions  FOR SELECT USING (true);

SELECT 'AFTER' AS stage,
       (SELECT count(*) FROM information_schema.columns
         WHERE table_schema='public' AND table_name='vocab_chunks' AND column_name='literal_trap') AS has_literal_trap,
       (SELECT count(*) FROM information_schema.tables WHERE table_schema='public'
         AND table_name IN ('vocab_cn_expressions','vocab_cn_renditions')) AS cn_tables;

-- ── count-validate:七行都必须是 t,否则 ROLLBACK ──
SELECT 'vocab_chunks 有 literal_trap 列' AS expect,
       EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_schema='public' AND table_name='vocab_chunks' AND column_name='literal_trap') AS ok
UNION ALL
SELECT 'type 枚举已含 idiom',
       (SELECT pg_get_constraintdef(oid) FROM pg_constraint
         WHERE conrelid='public.vocab_chunks'::regclass AND conname='vocab_chunks_type_chk') LIKE '%idiom%'
UNION ALL
SELECT 'idiom 行强制有 literal_trap',
       EXISTS (SELECT 1 FROM pg_constraint
                WHERE conrelid='public.vocab_chunks'::regclass AND conname='vocab_chunks_idiom_trap_chk')
UNION ALL
SELECT '两张中文表达表都在',
       (SELECT count(*) FROM information_schema.tables WHERE table_schema='public'
         AND table_name IN ('vocab_cn_expressions','vocab_cn_renditions')) = 2
UNION ALL
SELECT '两张表都开了 RLS',
       (SELECT bool_and(relrowsecurity) FROM pg_class
         WHERE oid IN ('public.vocab_cn_expressions'::regclass,'public.vocab_cn_renditions'::regclass))
UNION ALL
SELECT '两张表各有 1 条只读策略',
       (SELECT count(*) FROM pg_policies WHERE schemaname='public'
         AND tablename IN ('vocab_cn_expressions','vocab_cn_renditions')) = 2
UNION ALL
SELECT '唯一索引都建好',
       (SELECT count(*) FROM pg_indexes WHERE schemaname='public'
         AND indexname IN ('vocab_cn_expressions_phrase_uq','vocab_cn_renditions_uq')) = 2;

COMMIT;
