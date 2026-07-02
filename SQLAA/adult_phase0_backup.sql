-- ============================================================
-- 美语课程替换 · Phase 0 — 成人英语(CEFR)DB 匿名只读备份 + RLS 锁死
-- ============================================================
-- 项目 ref: degqpiiddkxcuzwombwp
-- 执行: Aaron 用 service role 跑(CC 本地只有 anon key,读不到 per-user 表,无法自跑备份)。
-- 本步零破坏: 只 CREATE 备份 schema/表 + 复制行 + 锁权限,不动任何 public.* 原表。
--
-- 背景: 成人英语板块内容 99% 在静态 TS 文件(src/data/*.ts),随代码归档即可,
--       DB 里只有 5 张表沾边。本备份覆盖这 5 张,足够支撑 Phase 1 清空回滚。
--
-- 备份去处: 独立 schema `adult_archive`(PostgREST 默认只暴露 public,此 schema 不进 API 面),
--          再叠加 REVOKE + ENABLE RLS 无策略 = anon/authenticated 一律读不到(= 匿名只读锁死)。
--          service role 绕过 RLS,回滚时可读。
-- ⚠️ 若要"真匿名"(连 service role 也看不到 user_id),把下方各 user_id 换成 md5(user_id::text)
--    ——但那样无法按用户回滚。本板块永久下线,默认保留原样以便回滚;是否哈希请 Aaron 定。
-- ============================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS adult_archive;
-- schema 本身不给 anon/authenticated 用(双保险,虽然它本就不在 public API 面)
REVOKE ALL ON SCHEMA adult_archive FROM anon, authenticated;

-- ---- 1) 有迁移、确定存在的 3 张表:直接复制 ----
CREATE TABLE IF NOT EXISTS adult_archive.daily_slang_bak_20260701      AS SELECT * FROM public.daily_slang;       -- 内容(cron 生成,无 user_id)
CREATE TABLE IF NOT EXISTS adult_archive.slang_mastery_bak_20260701    AS SELECT * FROM public.slang_mastery;     -- 用户历史(有 user_id)
CREATE TABLE IF NOT EXISTS adult_archive.generated_lessons_bak_20260701 AS SELECT * FROM public.generated_lessons; -- 用户 AI 课缓存(有 user_id)

-- ---- 2) 无迁移文件、仅存在于 types.ts / 线上库的 2 张表:存在才备份 ----
DO $$
BEGIN
  IF to_regclass('public.placement_results') IS NOT NULL THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS adult_archive.placement_results_bak_20260701 AS SELECT * FROM public.placement_results';
  ELSE
    RAISE NOTICE 'public.placement_results 不存在,跳过';
  END IF;
  IF to_regclass('public.workplace_practice') IS NOT NULL THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS adult_archive.workplace_practice_bak_20260701 AS SELECT * FROM public.workplace_practice';
  ELSE
    RAISE NOTICE 'public.workplace_practice 不存在,跳过';
  END IF;
END $$;

-- ---- 3) 锁死所有备份表:启用 RLS(无策略=默认拒绝)+ 收回 grant ----
DO $$
DECLARE t text;
BEGIN
  FOR t IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'adult_archive'
  LOOP
    EXECUTE format('ALTER TABLE adult_archive.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE adult_archive.%I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('REVOKE ALL ON adult_archive.%I FROM anon, authenticated', t);
  END LOOP;
END $$;

COMMIT;

-- ============================================================
-- 校验:确认各备份表行数(= 线上原表行数)。跑完贴回给 CC 存档。
-- ============================================================
SELECT 'daily_slang'        AS src, count(*) AS n FROM adult_archive.daily_slang_bak_20260701
UNION ALL SELECT 'slang_mastery',       count(*) FROM adult_archive.slang_mastery_bak_20260701
UNION ALL SELECT 'generated_lessons',   count(*) FROM adult_archive.generated_lessons_bak_20260701
UNION ALL SELECT 'placement_results',   count(*) FROM adult_archive.placement_results_bak_20260701
UNION ALL SELECT 'workplace_practice',  count(*) FROM adult_archive.workplace_practice_bak_20260701;
-- (若某表 Phase 0 跳过了,对应 UNION 行会报表不存在——删掉那一行再跑即可)
