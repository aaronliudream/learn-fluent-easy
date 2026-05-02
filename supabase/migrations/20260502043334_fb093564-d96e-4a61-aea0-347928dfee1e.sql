-- 添加科学分类字段，支持高考词汇多维度浏览
ALTER TABLE public.gaokao_vocab
  ADD COLUMN IF NOT EXISTS theme text,                  -- 22 主题分类（校园、情感、科技…）
  ADD COLUMN IF NOT EXISTS sub_theme text,              -- 子主题（更细粒度，可选）
  ADD COLUMN IF NOT EXISTS gaokao_level smallint,       -- 高考分级 1=基础 2=核心 3=进阶 4=冲刺
  ADD COLUMN IF NOT EXISTS exam_frequency smallint,     -- 考频 1=低频 2=偶考 3=常考 4=必考
  ADD COLUMN IF NOT EXISTS freq_rank integer,           -- BNC/COCA 全球词频排名
  ADD COLUMN IF NOT EXISTS is_hot_topic boolean DEFAULT false,  -- 是否高考热点话题词
  ADD COLUMN IF NOT EXISTS tags jsonb DEFAULT '[]'::jsonb;      -- 额外标签（如 academic/spoken/写作高频）

-- 索引：支持快速按维度筛选
CREATE INDEX IF NOT EXISTS idx_gaokao_vocab_theme ON public.gaokao_vocab(theme);
CREATE INDEX IF NOT EXISTS idx_gaokao_vocab_level ON public.gaokao_vocab(gaokao_level);
CREATE INDEX IF NOT EXISTS idx_gaokao_vocab_exam_freq ON public.gaokao_vocab(exam_frequency);
CREATE INDEX IF NOT EXISTS idx_gaokao_vocab_freq_rank ON public.gaokao_vocab(freq_rank);

-- 主题元数据表：保存 22 主题的展示信息（中英文名、emoji、颜色、是否高考热点）
CREATE TABLE IF NOT EXISTS public.gaokao_vocab_themes (
  code text PRIMARY KEY,            -- 内部编码，如 'school'
  name_cn text NOT NULL,            -- 中文名
  name_en text NOT NULL,            -- 英文名
  emoji text NOT NULL,
  description_cn text,              -- 一句话说明
  is_hot boolean NOT NULL DEFAULT false,   -- 是否高考重点话题
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gaokao_vocab_themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Themes are public readable"
  ON public.gaokao_vocab_themes
  FOR SELECT
  USING (true);

-- 预填 22 个主题
INSERT INTO public.gaokao_vocab_themes (code, name_cn, name_en, emoji, description_cn, is_hot, sort_order) VALUES
  ('school',        '校园学习',     'School & Study',        '🎓', '校园生活、考试、学科、师生关系', false, 1),
  ('family',        '家庭与人际',   'Family & Friends',      '👨‍👩‍👧', '亲情、友谊、邻里、代沟', false, 2),
  ('feelings',      '情感与品格',   'Feelings & Character',  '💭', '情绪、性格、价值观，写作高频', false, 3),
  ('daily',         '日常生活',     'Daily Life',            '🏃', '作息、家务、习惯', false, 4),
  ('food',          '饮食文化',     'Food & Drink',          '🍔', '食物、餐饮、营养', false, 5),
  ('shopping',      '购物与消费',   'Shopping & Money',      '🛍️', '金钱、广告、消费观', false, 6),
  ('travel',        '旅行交通',     'Travel & Transport',    '✈️', '旅游、交通、问路', false, 7),
  ('city',          '城市与社区',   'Places & Community',    '🏙️', '建筑、社区、公共场所', false, 8),
  ('nature',        '自然天气',     'Nature & Weather',      '🌦️', '气候、动植物、地理', false, 9),
  ('work',          '工作职业',     'Work & Career',         '💼', '求职、职业、应用文写作', false, 10),
  ('tech',          '科技与互联网', 'Technology & Internet', '💻', 'AI、手机、社交媒体（近5年爆发）', true, 11),
  ('media',         '媒体与娱乐',   'Media & Entertainment', '📺', '电影、音乐、阅读', false, 12),
  ('sports',        '体育运动',     'Sports & Exercise',     '⚽', '比赛、奥运、健身', false, 13),
  ('environment',   '环保可持续',   'Environment',           '🌍', '污染、低碳、动物保护（高考必考）', true, 14),
  ('health',        '健康医疗',     'Health & Medicine',     '🏥', '疾病、心理、急救', false, 15),
  ('society',       '社会与公益',   'Society & Volunteer',   '🤝', '志愿者、慈善、社会问题（写作必考）', true, 16),
  ('chinese',       '中国文化',     'Chinese Culture',       '🎭', '节日、习俗、非遗（新高考必考）', true, 17),
  ('cross_culture', '跨文化交流',   'Cross-cultural',        '🌐', '中西对比、留学、文化差异', true, 18),
  ('science',       '科学探索',     'Science & Discovery',   '🔬', '科普、太空、动物研究（说明文高频）', false, 19),
  ('history',       '历史与人物',   'History & People',      '📚', '名人传记、历史事件', false, 20),
  ('abstract',      '抽象思辨',     'Abstract Thinking',     '💡', '时间、变化、原因、方法（议论文必备）', false, 21),
  ('function',      '功能词',       'Function Words',        '🔧', '介词、连词、助动词等', false, 22)
ON CONFLICT (code) DO NOTHING;