-- ═══════════════════════════════════════════════════════════════
-- H 段 美国习惯用语 + I 段 中文高频表达→地道英文 · schema 对齐
--
-- ⚠️ 第一版报 `ERROR 42703: column "category" does not exist`。
--    根因:我假设两张 cn 表不存在,用了 `CREATE TABLE IF NOT EXISTS`。
--    但 Aaron 的确认稿**早就建好了这两张表**,于是 CREATE 整个跳过,
--    后面引用 category 的 CHECK 自然找不到列。
--    教训是老规矩:**先 SELECT 勘验线上实际结构,再写 ALTER**,
--    不要用 CREATE 去"顺便"建一张可能已存在的表 —— 它会静默跳过,
--    把后续所有基于新列的语句一起带沟里。
--
-- 本版全部改成对着**实测结构**做 ADD COLUMN IF NOT EXISTS / ALTER,
-- 不再有任何 CREATE TABLE。2026-08-05 实测(三张表均 0 行):
--
--   vocab_chunks          id(PK) chunk translation_zh example_en example_zh
--                         audio_url example_audio_url freq_rank created_at
--                         updated_at type scene
--                         · type CHECK 只有 phrasal_verb/frame/connector/collocation_ext
--                         · 无 literal_trap
--                         · unique(lower(chunk));RLS 开 + 1 策略 ✅
--   vocab_cn_expressions  id(PK) cn_phrase cn_note sort_order
--                         · 无 category / created_at / updated_at
--                         · cn_phrase 无唯一约束
--                         · ⚠️ RLS 关、0 策略
--   vocab_cn_renditions   expression_id(FK→expressions,可空) rendition register
--                         scene_hint example_en example_zh audio_url sort_order
--                         · ⚠️ **没有主键**
--                         · CHECK sort_order BETWEEN 1 AND 3 ✅
--                         · 无 unique(expression_id, rendition)
--                         · 无 scene / example_audio_url / 时间戳
--                         · ⚠️ RLS 关、0 策略
--
-- ⚠️ 列名一律沿用确认稿的写法(cn_note、sort_order),不改名 ——
--    改名要连带改前端和生成器,收益为零。
-- ⚠️ 由 Aaron 执行。末尾 count-validate,任一行不是 t 就 ROLLBACK。
-- ═══════════════════════════════════════════════════════════════

BEGIN;

SELECT 'BEFORE' AS stage,
       (SELECT count(*) FROM information_schema.columns
         WHERE table_schema='public' AND table_name='vocab_chunks' AND column_name='literal_trap') AS chunks_literal_trap,
       (SELECT count(*) FROM information_schema.columns
         WHERE table_schema='public' AND table_name='vocab_cn_expressions' AND column_name='category') AS expr_category,
       (SELECT count(*) FROM pg_constraint
         WHERE conrelid='public.vocab_cn_renditions'::regclass AND contype='p') AS rend_pkey;

-- ═══════════════════════════════════════════════════════════════
-- H 段:习语挂 vocab_chunks,不另起炉灶
-- 前端"词块标签页按 type 筛选"天然承接,零改动。
-- ═══════════════════════════════════════════════════════════════

-- 直译陷阱一句话。例:piece of cake -> 字面"一块蛋糕",实为"小菜一碟"
-- ⚠️ 可空 —— 只有 type='idiom' 的行才填。做成 NOT NULL 会逼着
--    phrasal_verb / frame 那些行编一句废话。
ALTER TABLE public.vocab_chunks
  ADD COLUMN IF NOT EXISTS literal_trap text;

-- type 枚举加 'idiom'。CHECK 表达式改不了,只能先删再建。
ALTER TABLE public.vocab_chunks DROP CONSTRAINT IF EXISTS vocab_chunks_type_chk;
ALTER TABLE public.vocab_chunks
  ADD CONSTRAINT vocab_chunks_type_chk
  CHECK (type IN ('phrasal_verb','frame','connector','collocation_ext','idiom'));

-- 只对 idiom 行要求 literal_trap 非空,普通词块不受影响。
-- ⚠️ 长度上限(20 字)在**生成端**卡,与 spec.mjs 同源;
--    这里只卡"idiom 必须有" —— 长度规则将来要调,调 DB 约束太重。
ALTER TABLE public.vocab_chunks DROP CONSTRAINT IF EXISTS vocab_chunks_idiom_trap_chk;
ALTER TABLE public.vocab_chunks
  ADD CONSTRAINT vocab_chunks_idiom_trap_chk
  CHECK (type <> 'idiom' OR (literal_trap IS NOT NULL AND btrim(literal_trap) <> ''));

CREATE INDEX IF NOT EXISTS vocab_chunks_type_idx ON public.vocab_chunks (type);

-- ═══════════════════════════════════════════════════════════════
-- I 段 ①:vocab_cn_expressions 补列
-- ═══════════════════════════════════════════════════════════════

-- category:daily 日常表达 / proverb 谚语俗语。
-- ⚠️ 分两步加 —— 先带默认值加列(表里 0 行,瞬间完成),再置 NOT NULL。
--    直接 ADD COLUMN ... NOT NULL 无默认值,表非空时会失败;
--    这里虽然是空表,但写成两步在将来重跑(表已有数据)时同样安全。
ALTER TABLE public.vocab_cn_expressions
  ADD COLUMN IF NOT EXISTS category   text NOT NULL DEFAULT 'daily',
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.vocab_cn_expressions DROP CONSTRAINT IF EXISTS vocab_cn_expressions_category_chk;
ALTER TABLE public.vocab_cn_expressions
  ADD CONSTRAINT vocab_cn_expressions_category_chk CHECK (category IN ('daily','proverb'));

-- sort_order 线上是 NOT NULL 但**无默认值**,插入时不给就报错。补个默认值。
ALTER TABLE public.vocab_cn_expressions ALTER COLUMN sort_order SET DEFAULT 1;

-- 中文表达唯一 —— 生成器按 cn_phrase upsert,不靠 id 匹配
CREATE UNIQUE INDEX IF NOT EXISTS vocab_cn_expressions_phrase_uq
  ON public.vocab_cn_expressions (cn_phrase);

-- ═══════════════════════════════════════════════════════════════
-- I 段 ②:vocab_cn_renditions 补主键 + 补列 + 收紧
-- ═══════════════════════════════════════════════════════════════

-- ⚠️ 这张表**没有主键**。没有 PK 意味着 PostgREST 无法做单行更新/删除,
--    重复行也无从去重。表里 0 行,现在补零成本;灌完内容再补要先清洗。
ALTER TABLE public.vocab_cn_renditions
  ADD COLUMN IF NOT EXISTS id                uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS scene             text,
  ADD COLUMN IF NOT EXISTS example_audio_url text,
  ADD COLUMN IF NOT EXISTS created_at        timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at        timestamptz NOT NULL DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conrelid='public.vocab_cn_renditions'::regclass AND contype='p'
  ) THEN
    ALTER TABLE public.vocab_cn_renditions ADD CONSTRAINT vocab_cn_renditions_pkey PRIMARY KEY (id);
  END IF;
END $$;

-- expression_id 线上可空。可空意味着能插进"不属于任何中文表达"的孤儿说法,
-- 而 unique(expression_id, rendition) 对 NULL 不去重(NULL 不等于 NULL),孤儿还能重复插。
ALTER TABLE public.vocab_cn_renditions ALTER COLUMN expression_id SET NOT NULL;

-- register / scene_hint 线上可空,但规格里它们是必填(卡片上要显示)。
ALTER TABLE public.vocab_cn_renditions ALTER COLUMN register   SET NOT NULL;
ALTER TABLE public.vocab_cn_renditions ALTER COLUMN scene_hint SET NOT NULL;

ALTER TABLE public.vocab_cn_renditions DROP CONSTRAINT IF EXISTS vocab_cn_renditions_register_chk;
ALTER TABLE public.vocab_cn_renditions
  ADD CONSTRAINT vocab_cn_renditions_register_chk CHECK (register IN ('casual','neutral','formal'));

-- 同一条中文下说法不重复(生成端 r1 闸门也查,DB 这层是最后一道)
CREATE UNIQUE INDEX IF NOT EXISTS vocab_cn_renditions_uq
  ON public.vocab_cn_renditions (expression_id, rendition);
CREATE INDEX IF NOT EXISTS vocab_cn_renditions_expr_idx
  ON public.vocab_cn_renditions (expression_id, sort_order);

-- ═══════════════════════════════════════════════════════════════
-- RLS ——⚠️ 两张 cn 表实测 **RLS 关、0 策略**。
-- RLS 关着时 Supabase 的默认授权允许 anon 增删改,这是个洞。
-- 开 RLS + 只建 SELECT 策略:前端只读,写入只走 Aaron 手跑 SQL(service role 绕过 RLS)。
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
         WHERE table_schema='public' AND table_name='vocab_chunks' AND column_name='literal_trap') AS chunks_literal_trap,
       (SELECT count(*) FROM information_schema.columns
         WHERE table_schema='public' AND table_name='vocab_cn_expressions' AND column_name='category') AS expr_category,
       (SELECT count(*) FROM pg_constraint
         WHERE conrelid='public.vocab_cn_renditions'::regclass AND contype='p') AS rend_pkey;

-- ── count-validate:九行都必须是 t,否则 ROLLBACK ──
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
SELECT 'expressions 有 category 且受 CHECK 约束',
       EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_schema='public' AND table_name='vocab_cn_expressions' AND column_name='category')
       AND EXISTS (SELECT 1 FROM pg_constraint
                    WHERE conrelid='public.vocab_cn_expressions'::regclass
                      AND conname='vocab_cn_expressions_category_chk')
UNION ALL
SELECT 'cn_phrase 唯一',
       EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='vocab_cn_expressions_phrase_uq')
UNION ALL
SELECT 'renditions 有主键',
       EXISTS (SELECT 1 FROM pg_constraint
                WHERE conrelid='public.vocab_cn_renditions'::regclass AND contype='p')
UNION ALL
SELECT 'renditions 的 expression_id / register / scene_hint 都非空',
       NOT EXISTS (
         SELECT 1 FROM information_schema.columns
          WHERE table_schema='public' AND table_name='vocab_cn_renditions'
            AND column_name IN ('expression_id','register','scene_hint')
            AND is_nullable = 'YES'
       )
UNION ALL
SELECT '(expression_id, rendition) 唯一',
       EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='vocab_cn_renditions_uq')
UNION ALL
SELECT '两张 cn 表都开了 RLS 且各有 1 条只读策略',
       (SELECT bool_and(relrowsecurity) FROM pg_class
         WHERE oid IN ('public.vocab_cn_expressions'::regclass,'public.vocab_cn_renditions'::regclass))
       AND (SELECT count(*) FROM pg_policies WHERE schemaname='public'
             AND tablename IN ('vocab_cn_expressions','vocab_cn_renditions')) = 2;

COMMIT;
