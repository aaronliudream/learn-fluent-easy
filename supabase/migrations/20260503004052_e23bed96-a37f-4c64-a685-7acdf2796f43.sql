
-- 1. 给 gaokao_vocab 加学段字段，让小学/初中/CET 等共用同一套词汇表和掌握度系统
ALTER TABLE public.gaokao_vocab
  ADD COLUMN IF NOT EXISTS stage text NOT NULL DEFAULT 'senior';

-- 约束允许的学段值
ALTER TABLE public.gaokao_vocab
  DROP CONSTRAINT IF EXISTS gaokao_vocab_stage_chk;
ALTER TABLE public.gaokao_vocab
  ADD CONSTRAINT gaokao_vocab_stage_chk
  CHECK (stage IN ('primary','junior','senior','cet4','cet6','postgrad'));

CREATE INDEX IF NOT EXISTS idx_gaokao_vocab_stage_freq
  ON public.gaokao_vocab(stage, freq_rank);

-- 2. 主题表也加 stage 区分
ALTER TABLE public.gaokao_vocab_themes
  ADD COLUMN IF NOT EXISTS stage text NOT NULL DEFAULT 'senior';
ALTER TABLE public.gaokao_vocab_themes
  DROP CONSTRAINT IF EXISTS gaokao_vocab_themes_stage_chk;
ALTER TABLE public.gaokao_vocab_themes
  ADD CONSTRAINT gaokao_vocab_themes_stage_chk
  CHECK (stage IN ('primary','junior','senior','cet4','cet6','postgrad'));

-- 3. 新建小学 26 字母 Phonics 表
CREATE TABLE IF NOT EXISTS public.primary_letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  letter_upper text NOT NULL UNIQUE,        -- A
  letter_lower text NOT NULL,               -- a
  sort_order int NOT NULL,                  -- 1..26
  letter_name_ipa text NOT NULL,            -- 字母名称音标 /eɪ/
  phonics_short_ipa text,                   -- 自然拼读短音 /æ/
  phonics_long_ipa text,                    -- 自然拼读长音 /eɪ/
  mouth_tip_cn text,                        -- 发音口型提示（中文）
  stroke_order_cn text,                     -- 书写笔顺提示
  chant_cn text,                            -- 字母儿歌口诀（中文）
  chant_en text,                            -- 英文 chant
  example_words jsonb NOT NULL DEFAULT '[]'::jsonb, -- [{word, ipa, meaning_cn, emoji}]
  fun_fact_cn text,                         -- 趣味知识
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.primary_letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Letters are public readable"
  ON public.primary_letters FOR SELECT
  USING (true);

CREATE TRIGGER update_primary_letters_updated_at
  BEFORE UPDATE ON public.primary_letters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
