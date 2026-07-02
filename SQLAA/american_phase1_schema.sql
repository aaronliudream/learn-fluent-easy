-- ============================================================
-- 美语课程 · Phase 1 建表(方案 A:新建 american_* 表;掌握表照抄 junior)
-- ============================================================
-- 项目 ref: degqpiiddkxcuzwombwp   执行:Aaron service role
-- ⚠️ 本文件为 **DRAFT**(草案)。种子(INSERT)不在此文件——种子需 6 个内容 md 定稿,
--    CC 尚未拿到,拿到后另出 american_phase1_seed.sql + 对账表。
-- ⚠️ 三处判断点(见文中 [决策?] 标注)想核对《美语课程_内容生产规格_v1》后再定,
--    确认前**先别在线上跑**;或你确认这三处后我即定稿。
-- 依据:《美语课程落地指令 v1》§1 + junior_user_mastery / junior_word_mastery 实际 schema。
-- RLS 口径:内容表匿名+登录可读(service role 写);用户表 auth.uid()=user_id 自域读写(照 junior)。
-- ============================================================

BEGIN;

-- ---------- 内容表(匿名可读) ----------

CREATE TABLE IF NOT EXISTS public.american_lessons (
  id            text PRIMARY KEY,            -- 'am1_l01' … 'am1_l72'
  unit_no       int  NOT NULL,               -- 1–12(单元 tab)
  lesson_no     int  NOT NULL,               -- 1–72
  title_en      text NOT NULL,
  title_cn      text NOT NULL,
  grammar_focus text,                        -- 本课语法目标(中文短语)
  scene         text,                        -- 场景标签
  prelisten_question jsonb,                  -- {q, options[], answer_index}
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(unit_no, lesson_no)
);

CREATE TABLE IF NOT EXISTS public.american_sentences (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id  text NOT NULL REFERENCES public.american_lessons(id) ON DELETE CASCADE,
  seq        int  NOT NULL,
  speaker    text,                           -- 从 "TYLER:" 前缀拆出
  text_en    text NOT NULL,
  text_cn    text NOT NULL,
  audio_key  text,                           -- public/audio/american/{lessonId}/{seq}.mp3
  UNIQUE(lesson_id, seq)
);

CREATE TABLE IF NOT EXISTS public.american_words (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),  -- 落库用 uuid5(lesson_id+word) 保持幂等
  lesson_id  text NOT NULL REFERENCES public.american_lessons(id) ON DELETE CASCADE,
  word       text NOT NULL,
  ipa        text,
  pos        text,
  meaning_cn text,
  example    text,
  UNIQUE(lesson_id, word)
);

CREATE TABLE IF NOT EXISTS public.american_grammar_points (
  id        text PRIMARY KEY,                -- 'am1_l01_gp1'
  lesson_id text NOT NULL REFERENCES public.american_lessons(id) ON DELETE CASCADE,
  name      text NOT NULL,
  body_md   text
);

CREATE TABLE IF NOT EXISTS public.american_questions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id         text NOT NULL REFERENCES public.american_lessons(id) ON DELETE CASCADE,
  stage             int  NOT NULL,           -- 5语法/6点睛小测/7填空/8听对话/9情景/10通关
  grammar_point_id  text REFERENCES public.american_grammar_points(id) ON DELETE SET NULL,
  qtype             text NOT NULL,           -- choice/cloze/transform/scenario
  payload           jsonb NOT NULL,          -- {stem, options[], answer_index/answer_text, blank_no?}
  seq               int,                     -- 关内题序(可空)
  UNIQUE(lesson_id, stage, seq)
);

CREATE TABLE IF NOT EXISTS public.american_amencontrast (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id text NOT NULL REFERENCES public.american_lessons(id) ON DELETE CASCADE,
  us        text NOT NULL,
  uk        text NOT NULL,
  note_cn   text
);

-- ---------- 掌握表(照抄 junior;仅改表名前缀) ----------
-- [决策?1] junior_user_mastery.item_id = uuid;美语内容 id 是 text('am1_l01_gp1')。
--          → 这里改 item_id 为 text 以容纳 text 内容 id;FSRS 字段/判定口径与 junior 1:1,
--            掌握逻辑代码可直接复用(答对 2 次=掌握由代码判定)。待核《内容生产规格》。
CREATE TABLE IF NOT EXISTS public.american_user_mastery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  item_type text NOT NULL,                   -- 'grammar_point' / 'question' / …
  item_id text NOT NULL,                     -- [决策?1] text(junior 为 uuid)
  correct_count integer NOT NULL DEFAULT 0,
  wrong_count integer NOT NULL DEFAULT 0,
  mastery_level smallint NOT NULL DEFAULT 0,
  stability real NOT NULL DEFAULT 0,
  difficulty real NOT NULL DEFAULT 5.0,
  last_seen_at timestamptz,
  last_grade smallint,
  last_latency_ms integer,
  due_at timestamptz,
  next_review_at timestamptz,
  reached_master_at timestamptz,
  retention_check_at timestamptz,
  last_result text,
  lapses integer NOT NULL DEFAULT 0,
  mastery_matrix jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_type, item_id)
);

-- [决策?2] junior_word_mastery.grade → 美语无 grade;这里保留列名 grade(存 unit_no)以复用
--          juniorWordMastery 掌握代码;若你要改名 unit_no 我改(代码需同步)。
-- [决策?3] 关2/3/4 三个词汇关共写本表(同词同环);保留 junior 全套 per-game 计数列。
CREATE TABLE IF NOT EXISTS public.american_word_mastery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  word_id uuid NOT NULL REFERENCES public.american_words(id) ON DELETE CASCADE,
  grade smallint NOT NULL,                   -- [决策?2] 存 unit_no
  quiz_correct int NOT NULL DEFAULT 0,  quiz_wrong int NOT NULL DEFAULT 0,
  listen_correct int NOT NULL DEFAULT 0, listen_wrong int NOT NULL DEFAULT 0,
  spell_correct int NOT NULL DEFAULT 0,  spell_wrong int NOT NULL DEFAULT 0,
  match_correct int NOT NULL DEFAULT 0,  match_wrong int NOT NULL DEFAULT 0,
  cloze_correct int NOT NULL DEFAULT 0,  cloze_wrong int NOT NULL DEFAULT 0,
  reading_correct int NOT NULL DEFAULT 0, reading_wrong int NOT NULL DEFAULT 0,
  mastery_level smallint NOT NULL DEFAULT 0,
  ease real NOT NULL DEFAULT 2.5,
  interval_days real NOT NULL DEFAULT 0,
  due_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, word_id)
);

-- ---------- 每关完成度 ----------
CREATE TABLE IF NOT EXISTS public.american_lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lesson_id text NOT NULL REFERENCES public.american_lessons(id) ON DELETE CASCADE,
  stage int NOT NULL,                        -- 1–10
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id, stage)
);

-- ---------- 索引 ----------
CREATE INDEX IF NOT EXISTS idx_am_lessons_unit ON public.american_lessons(unit_no, lesson_no);
CREATE INDEX IF NOT EXISTS idx_am_sentences_lesson ON public.american_sentences(lesson_id, seq);
CREATE INDEX IF NOT EXISTS idx_am_words_lesson ON public.american_words(lesson_id);
CREATE INDEX IF NOT EXISTS idx_am_questions_lesson_stage ON public.american_questions(lesson_id, stage);
CREATE INDEX IF NOT EXISTS idx_am_gp_lesson ON public.american_grammar_points(lesson_id);
CREATE INDEX IF NOT EXISTS idx_aum_user_type ON public.american_user_mastery(user_id, item_type);
CREATE INDEX IF NOT EXISTS idx_awm_user_grade ON public.american_word_mastery(user_id, grade);
CREATE INDEX IF NOT EXISTS idx_alp_user_lesson ON public.american_lesson_progress(user_id, lesson_id);

-- ---------- RLS ----------
-- 内容表:匿名+登录只读
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'american_lessons','american_sentences','american_words',
    'american_grammar_points','american_questions','american_amencontrast'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format($p$CREATE POLICY "%1$s read all" ON public.%1$I FOR SELECT USING (true)$p$, t);
  EXCEPTION WHEN duplicate_object THEN NULL;
  END LOOP;
END $$;

-- 用户表:自域读写(照 junior)
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['american_user_mastery','american_word_mastery','american_lesson_progress'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format($p$CREATE POLICY "%1$s select own" ON public.%1$I FOR SELECT USING (auth.uid() = user_id)$p$, t);
    EXECUTE format($p$CREATE POLICY "%1$s insert own" ON public.%1$I FOR INSERT WITH CHECK (auth.uid() = user_id)$p$, t);
    EXECUTE format($p$CREATE POLICY "%1$s update own" ON public.%1$I FOR UPDATE USING (auth.uid() = user_id)$p$, t);
  EXCEPTION WHEN duplicate_object THEN NULL;
  END LOOP;
END $$;

-- updated_at 触发器(掌握表)
CREATE OR REPLACE FUNCTION public.touch_american_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
DROP TRIGGER IF EXISTS trg_aum_touch ON public.american_user_mastery;
CREATE TRIGGER trg_aum_touch BEFORE UPDATE ON public.american_user_mastery
  FOR EACH ROW EXECUTE FUNCTION public.touch_american_updated_at();
DROP TRIGGER IF EXISTS trg_awm_touch ON public.american_word_mastery;
CREATE TRIGGER trg_awm_touch BEFORE UPDATE ON public.american_word_mastery
  FOR EACH ROW EXECUTE FUNCTION public.touch_american_updated_at();

COMMIT;

-- 校验:确认 9 表已建
SELECT table_name FROM information_schema.tables
WHERE table_schema='public' AND table_name LIKE 'american_%' ORDER BY 1;
