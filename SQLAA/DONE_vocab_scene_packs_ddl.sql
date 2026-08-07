-- ✅ DONE 2026-08-07 已执行,Aaron 回报 validate 八条全 t
-- J 段 · 场景串记 —— 建表(DDL,纯新增,不碰任何既有表)
--
-- 产品形态:一个生活场景串起 8–15 个词/搭配/词块,按**事情发生的叙事顺序**排列,
--           末尾用一篇短文把链上的词全部串进去。学完一条链 = 会说一个完整场景。
--
-- ⚠️ 由 Aaron 执行。幂等:全部 IF NOT EXISTS / DROP-CREATE 策略,可重放。
-- ⚠️ RLS 只读:内容表对所有人可读,写入只走服务端(与 vocab_words 同惯例)。

BEGIN;

-- ═══════════ 场景包 ═══════════
CREATE TABLE IF NOT EXISTS vocab_scene_packs (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_zh               text NOT NULL,                      -- 场景名(中文),如「网络购物」
  theme_en               text NOT NULL,                      -- 场景英文主题词,如 online shopping
  -- 速览版 80–100 词:完整版的机器压缩,**只审完整版**
  essay_short_en         text NOT NULL,
  essay_short_zh         text NOT NULL,
  -- 完整版 150–200 词,议论文结构:引入 → 好处三条 → 转折弊端 → 权衡结论
  essay_full_en          text NOT NULL,
  essay_full_zh          text NOT NULL,
  essay_short_audio_url  text,
  essay_full_audio_url   text,
  sort_order             integer NOT NULL DEFAULT 1,
  is_published           boolean NOT NULL DEFAULT false,     -- 先建后开灯,审完再翻
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

-- title_zh 唯一 —— 终态 SQL 靠它定位,不写死 uuid(第三条:先后关系不当状态)
CREATE UNIQUE INDEX IF NOT EXISTS vocab_scene_packs_title_uk ON vocab_scene_packs (title_zh);

-- ═══════════ 链上节点 ═══════════
CREATE TABLE IF NOT EXISTS vocab_scene_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id     uuid NOT NULL REFERENCES vocab_scene_packs(id) ON DELETE CASCADE,
  kind        text NOT NULL,
  text_en     text NOT NULL,
  text_zh     text NOT NULL,
  -- 在库词必挂:用于跳词卡与掌握度联动;搭配/词块/辨析可为空
  word_id     uuid REFERENCES vocab_words(id) ON DELETE SET NULL,
  audio_url   text,
  sort_order  integer NOT NULL,                              -- **叙事顺序**,不是重要性顺序
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- kind 四型:词 / 搭配 / 词块 / 同义辨析(第 3 段"同义弹药"落这里)
ALTER TABLE vocab_scene_items DROP CONSTRAINT IF EXISTS vocab_scene_items_kind_chk;
ALTER TABLE vocab_scene_items ADD CONSTRAINT vocab_scene_items_kind_chk
  CHECK (kind IN ('word', 'collocation', 'chunk', 'contrast'));

-- 同一包内 sort_order 不重复 —— 叙事顺序必须是全序
CREATE UNIQUE INDEX IF NOT EXISTS vocab_scene_items_pack_sort_uk
  ON vocab_scene_items (pack_id, sort_order);
CREATE INDEX IF NOT EXISTS vocab_scene_items_pack_idx ON vocab_scene_items (pack_id);
CREATE INDEX IF NOT EXISTS vocab_scene_items_word_idx ON vocab_scene_items (word_id)
  WHERE word_id IS NOT NULL;

-- ═══════════ RLS:只读 ═══════════
ALTER TABLE vocab_scene_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocab_scene_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS vocab_scene_packs_read ON vocab_scene_packs;
CREATE POLICY vocab_scene_packs_read ON vocab_scene_packs FOR SELECT USING (true);

DROP POLICY IF EXISTS vocab_scene_items_read ON vocab_scene_items;
CREATE POLICY vocab_scene_items_read ON vocab_scene_items FOR SELECT USING (true);

-- ── count-validate:八行都必须是 t ──
SELECT '两表都已建' AS expect,
       (SELECT count(*) FROM information_schema.tables
         WHERE table_schema = 'public'
           AND table_name IN ('vocab_scene_packs', 'vocab_scene_items')) = 2 AS ok
UNION ALL
SELECT 'packs 双档短文四列齐全且 NOT NULL',
       (SELECT count(*) FROM information_schema.columns
         WHERE table_name = 'vocab_scene_packs' AND is_nullable = 'NO'
           AND column_name IN ('essay_short_en','essay_short_zh','essay_full_en','essay_full_zh')) = 4
UNION ALL
SELECT 'packs 两个音频列存在且可空',
       (SELECT count(*) FROM information_schema.columns
         WHERE table_name = 'vocab_scene_packs' AND is_nullable = 'YES'
           AND column_name IN ('essay_short_audio_url','essay_full_audio_url')) = 2
UNION ALL
SELECT 'items.kind CHECK 恰为四型',
       (SELECT pg_get_constraintdef(oid) FROM pg_constraint
         WHERE conname = 'vocab_scene_items_kind_chk')
       LIKE '%chunk%collocation%contrast%word%'
    OR (SELECT pg_get_constraintdef(oid) FROM pg_constraint
         WHERE conname = 'vocab_scene_items_kind_chk')
       ~ 'word.*collocation.*chunk.*contrast'
UNION ALL
SELECT 'items.word_id 外键指向 vocab_words 且 ON DELETE SET NULL',
       EXISTS (SELECT 1 FROM pg_constraint
                WHERE conrelid = 'vocab_scene_items'::regclass
                  AND confrelid = 'vocab_words'::regclass
                  AND confdeltype = 'n')
UNION ALL
SELECT 'items.pack_id 外键 ON DELETE CASCADE(删包连带清链)',
       EXISTS (SELECT 1 FROM pg_constraint
                WHERE conrelid = 'vocab_scene_items'::regclass
                  AND confrelid = 'vocab_scene_packs'::regclass
                  AND confdeltype = 'c')
UNION ALL
SELECT '同包内 sort_order 唯一(叙事顺序是全序)',
       EXISTS (SELECT 1 FROM pg_indexes
                WHERE tablename = 'vocab_scene_items'
                  AND indexname = 'vocab_scene_items_pack_sort_uk')
UNION ALL
SELECT '两表 RLS 已开且各有一条只读策略',
       (SELECT bool_and(rowsecurity) FROM pg_tables
         WHERE tablename IN ('vocab_scene_packs','vocab_scene_items'))
       AND (SELECT count(*) FROM pg_policies
             WHERE tablename IN ('vocab_scene_packs','vocab_scene_items')) = 2;

COMMIT;
