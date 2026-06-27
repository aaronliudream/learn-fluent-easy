-- ============================================================
-- 语法小知识 junior_grammar_tips:每单元一条(volume+unit),content 结构化 jsonb。
-- 初中高中通用;GrammarStage(进入综合测试上方)读它渲染速查/特例/考试vs真实/高考考点。
-- Aaron service role 跑。幂等。
-- ============================================================
CREATE TABLE IF NOT EXISTS public.junior_grammar_tips (
  id uuid primary key default gen_random_uuid(),
  grade int,
  volume text not null,
  unit text not null,
  content jsonb not null,
  created_at timestamptz default now(),
  unique (volume, unit)
);
ALTER TABLE public.junior_grammar_tips ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "junior_grammar_tips public read" ON public.junior_grammar_tips;
CREATE POLICY "junior_grammar_tips public read" ON public.junior_grammar_tips FOR SELECT USING (true);

-- ===== 必修一 U3 反意疑问句 语法小知识 =====
DELETE FROM public.junior_grammar_tips WHERE volume='required1' AND unit='U3';
INSERT INTO public.junior_grammar_tips (grade, volume, unit, content) VALUES (10, 'required1', 'U3', '{
  "title": "反意疑问句 速查",
  "intro": "前肯后否、前否后肯;反问部分=助动词/be/情态 + 主语代词。浏览完做题更有的放矢。",
  "speedTable": [
    { "stmt": "You play badminton,", "tag": "don''t you?" },
    { "stmt": "She is an athlete,", "tag": "isn''t she?" },
    { "stmt": "They won the match,", "tag": "didn''t they?" },
    { "stmt": "It isn''t a real sport,", "tag": "is it?" },
    { "stmt": "You have finished,", "tag": "haven''t you?" },
    { "stmt": "We can join the team,", "tag": "can''t we?" }
  ],
  "specialRules": [
    { "rule": "I am … , aren''t I?", "mark": "唯一特例:不用 amn''t I" },
    { "rule": "Let''s … , shall we?", "mark": "Let''s 提议固定用 shall we" },
    { "rule": "祈使句 … , will you?", "mark": "Pass me the ball, will you?" },
    { "rule": "Nobody/Nothing …, did they / can it?", "mark": "否定词作主语 → 反问用肯定" },
    { "rule": "Everyone/Somebody …, didn''t they?", "mark": "不定代词主语 → 反问用 they" },
    { "rule": "There be … , …there?", "mark": "There is…, isn''t there?" }
  ],
  "why": [
    "aren''t I 是历史习惯:amn''t I 拗口、英语里被淘汰,统一借用 aren''t I。",
    "含 never / nobody / few / hardly 等否定词的句子视为否定 → 反问部分用肯定。"
  ],
  "gaokaoPoints": [
    "高频考点:Let''s→shall we;祈使句→will you;I am→aren''t I。",
    "答语按事实:肯定事实用 Yes、否定事实用 No,与问句形式无关。"
  ],
  "examVsReal": [
    { "exam": "Let''s go, shall we?", "real": "OK? / right? / yeah?", "note": "考试填 shall we;日常口语更自然多样" },
    { "exam": "I''m right, aren''t I?", "real": "right?", "note": "考试 aren''t I;日常常说 right?" }
  ]
}'::jsonb);

COMMIT;
-- ===== 自带校验 =====
SELECT volume, unit,
  jsonb_array_length(content->'speedTable') AS speed_rows,
  jsonb_array_length(content->'specialRules') AS special_rules,
  jsonb_array_length(content->'examVsReal') AS exam_vs_real
FROM public.junior_grammar_tips WHERE volume='required1' AND unit='U3';
