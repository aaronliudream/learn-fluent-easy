-- ═══════════════════════════════════════════════════════════════════
-- user_vocab_wordbook.source_kind 扩容:允许 'chunk' 与 'expression'
--
-- 由 Aaron 执行。
--
-- 背景:PR-8c 上架了词块/习语页与中文表达页,两处都要 ☆ 收藏。
-- 现有 CHECK 约束里已知只含 'scene_node'(前端唯一在用的值)。
-- ⚠️ 我**没有**盲写 source_kind='chunk' 就上线按钮:
--    匿名 INSERT 会先被 RLS 挡住(42501),CHECK 错误被盖住,
--    所以在本地无法验证这个值合不合法。宁可先不接收藏,也不上一个会 400 的按钮。
--    这条 SQL 跑完、validate 通过后,我再把两页的 ☆ 接上。
-- ═══════════════════════════════════════════════════════════════════

BEGIN;

-- 跑之前先看清现状:约束叫什么、当前允许哪些值
SELECT conname, pg_get_constraintdef(oid) AS current_def
FROM pg_constraint
WHERE conrelid = 'public.user_vocab_wordbook'::regclass
  AND contype = 'c'
  AND pg_get_constraintdef(oid) ILIKE '%source_kind%';

-- 删旧建新。用 DO 块按实际约束名删,避免把名字写死猜错。
DO $$
DECLARE cname text;
BEGIN
  SELECT conname INTO cname
  FROM pg_constraint
  WHERE conrelid = 'public.user_vocab_wordbook'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) ILIKE '%source_kind%'
  LIMIT 1;

  IF cname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.user_vocab_wordbook DROP CONSTRAINT %I', cname);
  END IF;
END $$;

ALTER TABLE public.user_vocab_wordbook
  ADD CONSTRAINT user_vocab_wordbook_source_kind_chk
  CHECK (source_kind IN (
    'word',          -- 词卡收藏
    'scene_node',    -- 场景串记的说法(已在用)
    'chunk',         -- 词块与习语页(PR-8c 新增)
    'expression',    -- 中文这样说页(PR-8c 新增)
    'collocation',   -- 搭配(词卡增区,留位)
    'lookup'         -- 点词查词弹卡(PR-8 第 1 项,留位)
  ));

COMMIT;

-- ── validate:跑完贴回给我 ──────────────────────────────────────────
-- ① 新约束在,且六个值都在里面
SELECT conname, pg_get_constraintdef(oid) AS def
FROM pg_constraint
WHERE conrelid = 'public.user_vocab_wordbook'::regclass AND contype = 'c';

-- ② 现有数据没有被新约束卡住(应为 0 行;非 0 说明库里有我没列到的 source_kind)
SELECT source_kind, COUNT(*) AS rows
FROM public.user_vocab_wordbook
WHERE source_kind NOT IN ('word','scene_node','chunk','expression','collocation','lookup')
GROUP BY source_kind;

-- ③ 顺带看一眼现有分布,确认没有误删别人的值
SELECT source_kind, COUNT(*) AS rows
FROM public.user_vocab_wordbook GROUP BY source_kind ORDER BY rows DESC;
