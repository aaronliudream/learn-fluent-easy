-- ============================================================
-- 步1: 建 junior_cloze 表 + RLS (镜像 junior_reading 公开读)
-- 字段参照 junior_reading; questions jsonb 装 8 空(每空 options[4]+answer+explanation)
-- ============================================================

CREATE TABLE IF NOT EXISTS junior_cloze (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grade       int  NOT NULL,
  volume      text,                              -- '7A' / '7B'
  unit        text,                              -- 'U1'..'U8'
  title       text NOT NULL,
  body        text NOT NULL,                     -- 含编号空格占位:"... he (1)____ to school ..."
  word_count  int,
  difficulty  int,                               -- 1-5
  questions   jsonb NOT NULL DEFAULT '[]'::jsonb, -- [{q,options:[4],answer:"A",explanation}] × 8
  sort_order  int  DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_junior_cloze_unit ON junior_cloze (grade, volume, unit);

-- RLS: 公开 SELECT(匿名也能读,与 junior_reading 一致;前端用 anon key 读)
ALTER TABLE junior_cloze ENABLE ROW LEVEL SECURITY;
CREATE POLICY "junior_cloze_public_select" ON junior_cloze FOR SELECT USING (true);

-- ⚠️ Aaron:请在 Supabase Dashboard 对照 junior_reading 的 RLS policy。
--   若 junior_reading 还有 INSERT/UPDATE policy(给 authenticated),按需补;
--   但内容表由 SQL Editor(service role 绕过 RLS)灌数据、前端只读,公开 SELECT 即够。

-- 校验(单独跑): 表已建、空表
SELECT count(*) AS n FROM junior_cloze;  -- 应 0
-- END OF FILE cloze-step1-ddl.sql
