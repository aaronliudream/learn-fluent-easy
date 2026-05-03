
-- 1. 词表
CREATE TABLE public.junior_vocab (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grade smallint NOT NULL CHECK (grade IN (7,8,9)),
  word text NOT NULL,
  pos text,
  phonetic text,
  meaning_cn text NOT NULL,
  meaning_en text,
  example_en text,
  example_cn text,
  tip text,
  theme text,
  freq_rank int,
  star_level smallint NOT NULL DEFAULT 3,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_junior_vocab_grade ON public.junior_vocab(grade);
CREATE INDEX idx_junior_vocab_theme ON public.junior_vocab(theme);
ALTER TABLE public.junior_vocab ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read junior vocab" ON public.junior_vocab FOR SELECT USING (true);

-- 2. 主题
CREATE TABLE public.junior_themes (
  code text PRIMARY KEY,
  grade smallint NOT NULL CHECK (grade IN (7,8,9)),
  name_cn text NOT NULL,
  emoji text NOT NULL DEFAULT '📘',
  sort_order int NOT NULL DEFAULT 0
);
ALTER TABLE public.junior_themes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read junior themes" ON public.junior_themes FOR SELECT USING (true);

-- 3. 单词掌握度
CREATE TABLE public.junior_word_mastery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  word_id uuid NOT NULL,
  grade smallint NOT NULL,
  quiz_correct int NOT NULL DEFAULT 0,
  quiz_wrong int NOT NULL DEFAULT 0,
  listen_correct int NOT NULL DEFAULT 0,
  listen_wrong int NOT NULL DEFAULT 0,
  spell_correct int NOT NULL DEFAULT 0,
  spell_wrong int NOT NULL DEFAULT 0,
  match_correct int NOT NULL DEFAULT 0,
  match_wrong int NOT NULL DEFAULT 0,
  cloze_correct int NOT NULL DEFAULT 0,
  cloze_wrong int NOT NULL DEFAULT 0,
  reading_correct int NOT NULL DEFAULT 0,
  reading_wrong int NOT NULL DEFAULT 0,
  mastery_level smallint NOT NULL DEFAULT 0,
  ease real NOT NULL DEFAULT 2.5,
  interval_days real NOT NULL DEFAULT 0,
  due_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, word_id)
);
CREATE INDEX idx_jwm_user_grade ON public.junior_word_mastery(user_id, grade);
ALTER TABLE public.junior_word_mastery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users select own jwm" ON public.junior_word_mastery FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own jwm" ON public.junior_word_mastery FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own jwm" ON public.junior_word_mastery FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "users delete own jwm" ON public.junior_word_mastery FOR DELETE USING (auth.uid() = user_id);

-- 4. 游戏分数
CREATE TABLE public.junior_game_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  game_type text NOT NULL,
  grade smallint,
  score int NOT NULL DEFAULT 0,
  accuracy real,
  duration_ms int,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_jgs_user ON public.junior_game_scores(user_id);
CREATE INDEX idx_jgs_game ON public.junior_game_scores(game_type, grade);
ALTER TABLE public.junior_game_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone read jgs" ON public.junior_game_scores FOR SELECT USING (true);
CREATE POLICY "users insert own jgs" ON public.junior_game_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users delete own jgs" ON public.junior_game_scores FOR DELETE USING (auth.uid() = user_id);

-- 5. 句子填空
CREATE TABLE public.junior_sentences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grade smallint NOT NULL CHECK (grade IN (7,8,9)),
  word_id uuid REFERENCES public.junior_vocab(id) ON DELETE CASCADE,
  sentence_en text NOT NULL,
  blank text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]',
  meaning_cn text,
  grammar_tag text,
  difficulty smallint NOT NULL DEFAULT 2,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_js_grade ON public.junior_sentences(grade);
ALTER TABLE public.junior_sentences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone read js" ON public.junior_sentences FOR SELECT USING (true);

-- 6. 短文阅读
CREATE TABLE public.junior_reading (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grade smallint NOT NULL CHECK (grade IN (7,8,9)),
  title text NOT NULL,
  body text NOT NULL,
  topic text,
  word_count int,
  questions jsonb NOT NULL DEFAULT '[]',
  vocab_notes jsonb NOT NULL DEFAULT '[]',
  difficulty smallint NOT NULL DEFAULT 2,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_jr_grade ON public.junior_reading(grade);
ALTER TABLE public.junior_reading ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone read jr" ON public.junior_reading FOR SELECT USING (true);

-- 7. updated_at 触发器
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER trg_jwm_touch BEFORE UPDATE ON public.junior_word_mastery FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 8. 主题种子
INSERT INTO public.junior_themes (code, grade, name_cn, emoji, sort_order) VALUES
  ('g7_self',7,'自我与家庭','👪',1),('g7_school',7,'校园生活','🏫',2),('g7_food',7,'饮食健康','🍎',3),
  ('g7_hobby',7,'兴趣爱好','🎨',4),('g7_travel',7,'出行交通','🚌',5),('g7_weather',7,'天气季节','🌤️',6),
  ('g7_animal',7,'动物自然','🐼',7),('g7_emotion',7,'情绪表达','😊',8),
  ('g8_culture',8,'文化习俗','🎎',1),('g8_health',8,'健康运动','🏃',2),('g8_tech',8,'科技生活','💻',3),
  ('g8_friend',8,'人际交往','🤝',4),('g8_environment',8,'环境保护','🌱',5),('g8_history',8,'历史名人','📜',6),
  ('g8_career',8,'职业理想','💼',7),('g8_emotion',8,'情感故事','💭',8),
  ('g9_society',9,'社会问题','🏛️',1),('g9_global',9,'国际视野','🌍',2),('g9_science',9,'科学探索','🔬',3),
  ('g9_literature',9,'文学艺术','📚',4),('g9_growth',9,'成长励志','🌟',5),('g9_communication',9,'跨文化沟通','💬',6),
  ('g9_future',9,'未来规划','🚀',7),('g9_critical',9,'思辨表达','🧠',8);
