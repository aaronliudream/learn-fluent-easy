-- ============================================================
-- junior_vocab 加课标词汇等级列(为 wy9A 九上的「三级词 vs 认读词」分层)
--
-- 背景:课本 Words and expressions 页脚注明「加粗词汇为义务教育英语课程标准三级词汇」。
--   前四册没有这个分层(全部走 SRS 全流程),九上首次引入:
--     三级词 → SRS 全流程(拼写+听音+释义)
--     非三级 → 只进认读卡(见词知义,不考拼写)
--
-- 为什么加列而不复用现有列(实测依据):
--   · star_level 已在承载学段语义 —— 实测 senior 5052 行全为 0、junior 3535 行全为 3,
--     且 src/lib/gaokaoVocabPool.ts 与 gaokaoContent.ts 在读它。改它会破坏该不变量。
--   · theme(19 处代码引用)/ tip(36 处)是展示字段;
--     source_type / confidence 是抽取溯源('wordlist' / 'high');
--     phrase_en 已被听音辨词消费(答对后显示的英文语块)。
--   均不适合承载教学分级。
--
-- 影响面:纯新增可空列。junior_vocab 现有 8587 行(junior 3535 + senior 5052)
--   全部取 NULL,行为零变化、无需回填。回滚 = DROP COLUMN。
-- ============================================================

BEGIN;

ALTER TABLE public.junior_vocab
  ADD COLUMN IF NOT EXISTS syllabus_level smallint;

COMMENT ON COLUMN public.junior_vocab.syllabus_level IS
  '义务教育英语课标词汇等级:3=三级词(课本加粗,进拼写考核);2=非三级(认读卡,不考拼写);NULL=未标注';

DO $$
DECLARE n_col int; n_dirty int;
BEGIN
  SELECT count(*) INTO n_col FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'junior_vocab'
     AND column_name = 'syllabus_level';
  IF n_col <> 1 THEN RAISE EXCEPTION '列未创建成功(找到 % 个)', n_col; END IF;

  -- 现有行必须全部为 NULL(证明这次 ALTER 没有动到任何既有数据)
  SELECT count(*) INTO n_dirty FROM public.junior_vocab WHERE syllabus_level IS NOT NULL;
  IF n_dirty <> 0 THEN
    RAISE EXCEPTION '有 % 行 syllabus_level 非 NULL,ALTER 不该写入任何值', n_dirty;
  END IF;
END $$;

COMMIT;

-- ============================================================
-- 跑完必看(Supabase 编辑器不显示 RAISE NOTICE,靠这条给证据)。
-- 期望 1 行:column_name=syllabus_level, data_type=smallint, is_nullable=YES,
--          total_rows=8587, non_null=0
-- ============================================================
SELECT c.column_name, c.data_type, c.is_nullable,
       (SELECT count(*) FROM public.junior_vocab) AS total_rows,
       (SELECT count(syllabus_level) FROM public.junior_vocab) AS non_null
  FROM information_schema.columns c
 WHERE c.table_schema = 'public' AND c.table_name = 'junior_vocab'
   AND c.column_name = 'syllabus_level';
