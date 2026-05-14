-- ============================================================================
-- 高考英语知识图谱补充 · 听力 + 写作 + 完形
-- 用于 BigmoonEnglish 分支
-- 总计：~150 条新知识点 · 3 张新表 · 与现有 schema 完全兼容
-- ============================================================================
-- 现有数据保留不动：
--   gaokao_grammar_points        (298 行)
--   gaokao_reading_knowledge_points (557 行)
-- 本文件新增：
--   gaokao_listening_knowledge_points (~62 行)
--   gaokao_writing_knowledge_points   (~62 行)
--   gaokao_cloze_knowledge_points     (~26 行)
-- ============================================================================

-- ============================================================================
-- PART 1: 听力知识点表（短对话 / 长对话 / 独白 / 听力策略）
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.gaokao_listening_knowledge_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id text NOT NULL UNIQUE,           -- L1-101 等编号
  category_code text NOT NULL,              -- L1/L2/L3/L4
  category_name text NOT NULL,              -- 短对话/长对话/独白/听力策略
  level1 text,                              -- 题型一级（如：事实信息/推断/态度）
  level2 text,                              -- 二级（如：时间/地点/数字）
  level3 text NOT NULL,                     -- 三级原子知识点
  exam_frequency text,                      -- 极高/高/中/低
  difficulty smallint,                      -- 1-5
  year_band smallint,                       -- 1/2/3, NULL = 跨年级通用
  example text,                             -- 典型问法或对话示例
  strategy text,                            -- 解题策略
  pitfall text,                             -- 易错点
  prerequisite text,                        -- 先修知识点
  extra jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_lkp_category ON public.gaokao_listening_knowledge_points(category_code);
CREATE INDEX idx_lkp_year ON public.gaokao_listening_knowledge_points(year_band);
CREATE INDEX idx_lkp_freq ON public.gaokao_listening_knowledge_points(exam_frequency);

ALTER TABLE public.gaokao_listening_knowledge_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read listening KPs" 
  ON public.gaokao_listening_knowledge_points FOR SELECT USING (true);

-- ---------------------- 短对话 L1 (~20 条) ----------------------
INSERT INTO public.gaokao_listening_knowledge_points 
  (source_id, category_code, category_name, level1, level2, level3, exam_frequency, difficulty, year_band, example, strategy, pitfall) VALUES

('L1-101', 'L1', '短对话', '事实信息', '时间', '整点时间表达', '极高', 2, 1,
 'It''s a quarter past two. / Half past three.',
 '听准介词：past（过）+ 整点；to（差）+ 下一整点；half = 30 minutes',
 '把 "quarter past two" (2:15) 听成 "quarter to two" (1:45)'),

('L1-102', 'L1', '短对话', '事实信息', '时间', '时间换算', '高', 3, 2,
 'I''ll be there in 20 minutes, the meeting started at 3.',
 '题目问"几点开始/结束/到"，要做加减运算',
 '只听到 20 分钟就选 20 分钟选项，忘了和 3:00 相加'),

('L1-103', 'L1', '短对话', '事实信息', '数字/价格', '数字辨析（13 vs 30）', '极高', 2, 1,
 'The book costs fifteen dollars / fifty dollars.',
 '听重音位置：fif-TEEN (重在后) vs FIF-ty (重在前)；放慢倍速反复练',
 '13/30、14/40、15/50、16/60... 系列尾音相近常误听'),

('L1-104', 'L1', '短对话', '事实信息', '数字/价格', '折扣价格计算', '高', 3, 2,
 'Originally 200, now 20% off. How much?',
 '听准原价 + 折扣方式（% off 是减，% of 是乘）+ 做减法',
 '"20% off" 算成"花 20%"反向算'),

('L1-105', 'L1', '短对话', '事实信息', '地点', '室内外地点判断', '极高', 2, 1,
 'Where does the conversation most likely take place?',
 '抓地点关键词：menu/order → restaurant；prescription → hospital；shelf → library',
 '只听到单一名词就下结论，忽略全文语境'),

('L1-106', 'L1', '短对话', '事实信息', '人物', '职业身份判断', '极高', 2, 1,
 'What does the man most probably do?',
 '抓职业术语：patient/symptom → doctor；assignment → teacher；shipment → seller',
 '把对话中"我朋友是医生"听成"说话人是医生"'),

('L1-107', 'L1', '短对话', '事实信息', '人物', '人物关系判断', '高', 3, 2,
 'What is the relationship between the speakers?',
 '通过称呼/话题/语气判断：husband-wife / classmates / colleagues / boss-employee',
 '把 "Mom" 当字面理解，可能是亲密称呼'),

('L1-108', 'L1', '短对话', '事实信息', '动作/事件', '即将发生的动作', '高', 2, 1,
 'What will the man do next?',
 '关注 "Let me / I''ll / be going to" 等将来式标志',
 '答非所问选"已经做了"的事件'),

('L1-109', 'L1', '短对话', '推断', '原因', '动作原因推断', '高', 3, 2,
 'Why did the woman miss the bus?',
 '抓 "because / as / since" 后的内容，注意原因可能不止一个',
 '把表面理由当深层原因（"because I overslept" vs "because I worked late"）'),

('L1-110', 'L1', '短对话', '推断', '情感', '说话人情感判断', '高', 3, 2,
 'How does the woman feel?',
 '听语气 + 关键形容词：upset / thrilled / disappointed / relieved',
 '只看字面词不听语气（说 "fine" 但语气低沉实际不开心）'),

('L1-111', 'L1', '短对话', '推断', '态度', '说话人态度（同意/反对/中立）', '高', 3, 2,
 'What''s the man''s attitude towards...?',
 '抓 "I''m not sure / I doubt / absolutely / I don''t think so" 等态度标志',
 '把 "I don''t think it''s a bad idea" 理解成反对（实际是赞同）'),

('L1-112', 'L1', '短对话', '推断', '隐含意思', '弦外之音判断', '中', 4, 3,
 'What does the woman mean by saying...?',
 '注意反问/讽刺/委婉拒绝（"Maybe next time" 常等于"不"）',
 '把客套话当真实意图（"That''s a great idea, but..."）'),

('L1-113', 'L1', '短对话', '事实信息', '动作/事件', '建议/请求', '极高', 2, 1,
 'What does the man suggest?',
 '抓 "Why don''t you / How about / You''d better / I suggest..."',
 '区分"建议别人做"和"说话人自己要做"'),

('L1-114', 'L1', '短对话', '事实信息', '动作/事件', '请求/委托', '高', 2, 1,
 'What does the woman ask the man to do?',
 '抓 "Could you / Would you mind / Please..."',
 '听成相反方向（A 求 B vs B 求 A）'),

('L1-115', 'L1', '短对话', '事实信息', '时间', '日期/星期', '高', 2, 1,
 'When did/will the event happen?',
 '注意时态 + 时间副词：yesterday / today / tomorrow / next week',
 '把"上周三"听成"下周三"，混淆 Tuesday/Thursday'),

('L1-116', 'L1', '短对话', '事实信息', '地点', '方位/方向', '中', 3, 2,
 'Where is the place / How to get there?',
 '抓 turn left/right, go straight, opposite, next to, between',
 '把 left 和 right 听反；把 opposite 当 next to'),

('L1-117', 'L1', '短对话', '推断', '隐含意思', '婉转拒绝', '中', 4, 3,
 'What does it mean by "I''ll think about it"?',
 '英语礼貌文化中很多"我想想"=委婉拒绝',
 '理解为"还在考虑"，期待后续答应'),

('L1-118', 'L1', '短对话', '事实信息', '数字/价格', '电话/房间号', '中', 2, 1,
 'What''s the room/phone number?',
 '注意 "double" = 重复（007 = 0-double-7），"oh" = 0',
 '把 "five-O-six" 听成 "five-five-six"'),

('L1-119', 'L1', '短对话', '推断', '原因', '人物缺席原因', '中', 3, 2,
 'Why is Tom not coming?',
 '抓 because/since 后的核心理由',
 '把表面借口当真正原因'),

('L1-120', 'L1', '短对话', '事实信息', '动作/事件', '主语动作辨别', '高', 2, 1,
 'Who will do what?',
 '听人称代词（I/you/he/she/we）+ 动作；常涉及分工',
 '把 "I''ll do A, you do B" 混淆，记反人物'),

-- ---------------------- 长对话 L2 (~18 条) ----------------------
('L2-201', 'L2', '长对话', '细节理解', '具体数字', '价格/数量', '极高', 3, 2,
 '从 5 轮对话中找出"票价多少 / 几张票"等具体数字',
 '先看题再听，划重点；遇到数字立刻速记',
 '长对话中有多个数字，记错对应人物或场合'),

('L2-202', 'L2', '长对话', '细节理解', '时间', '具体事件时间', '极高', 3, 2,
 '找到"会议几点开始/几号截止"',
 '听完整时间表达，注意 a.m./p.m. 区分',
 '把 "next Tuesday" 等相对时间记成具体日期'),

('L2-203', 'L2', '长对话', '细节理解', '地点', '具体地点信息', '高', 3, 2,
 '听清"在哪开会 / 去哪取票"',
 '抓 at / in / on + 地点；注意嵌套位置',
 '把"在 Room 305"当成"305 楼"'),

('L2-204', 'L2', '长对话', '主旨', '话题', '对话主题判断', '高', 3, 2,
 'What are the speakers mainly discussing?',
 '听开头 1-2 句话；找贯穿全程的关键词',
 '抓住开头一个话题就下结论，忽略真正主线'),

('L2-205', 'L2', '长对话', '主旨', '目的', '说话人目的判断', '高', 3, 2,
 'What''s the purpose of the call/visit?',
 '抓"开门见山"句：I''m calling about / I''d like to...',
 '把附带提到的事当主要目的'),

('L2-206', 'L2', '长对话', '推断', '态度', '对某事的态度', '高', 4, 3,
 'What does the man think of...?',
 '听形容词 + 语气 + 是否多次提及',
 '只听到一句正面就下结论，忽略后面的"however..."'),

('L2-207', 'L2', '长对话', '推断', '情感', '情绪变化', '中', 4, 3,
 'How does the woman feel after hearing the news?',
 '注意情绪转折词：but / however / unfortunately',
 '只记开头情绪，忽略转折后的真实感受'),

('L2-208', 'L2', '长对话', '推断', '关系', '说话人身份关系', '中', 3, 2,
 'What''s the relationship?',
 '抓职业术语 + 话题 + 称呼综合判断',
 '基于单一线索（比如一句"Mom"）就下结论'),

('L2-209', 'L2', '长对话', '推断', '原因', '事件原因/后果', '高', 4, 3,
 'Why did the man fail / What caused the delay?',
 '原因常用 because/so/as a result；可能有多个',
 '把表面原因当根本原因'),

('L2-210', 'L2', '长对话', '细节理解', '具体细节', '事件细节描述', '极高', 3, 2,
 '听清"做了什么 / 发生了什么"',
 '记关键动词；不同人做不同事时要区分',
 '把 A 做的事记到 B 身上'),

('L2-211', 'L2', '长对话', '细节理解', '建议/方案', '提出的解决方案', '中', 3, 2,
 'What''s the suggestion?',
 '抓 You should / Why don''t we / How about...',
 '区分多个建议中哪个被采纳'),

('L2-212', 'L2', '长对话', '推断', '隐含意思', '弦外之音', '中', 4, 3,
 'What does the woman imply?',
 '注意反问、讽刺、客套用法',
 '把客套话当真实回答'),

('L2-213', 'L2', '长对话', '事实信息', '具体动作', '人物动作识别', '高', 3, 2,
 'What does the man plan to do?',
 '听 plan to / be going to / will + 动词',
 '混淆"计划做"和"已经做了"'),

('L2-214', 'L2', '长对话', '事实信息', '人物', '说话人身份', '高', 3, 2,
 'Who is the woman most likely?',
 '通过对话内容反推职业（医患/师生/客服-顾客等）',
 '只听单一线索就下结论'),

('L2-215', 'L2', '长对话', '细节理解', '原因/条件', '事件发生条件', '中', 4, 3,
 'Under what condition will...?',
 '注意 if / unless / only when 等条件标志',
 '把条件当无条件结论'),

('L2-216', 'L2', '长对话', '主旨', '总结', '对话总结性结论', '中', 4, 3,
 'What''s the conclusion of the conversation?',
 '听结尾"So we agreed... / In short..." 等总结性话语',
 '抓中间一个观点当结论'),

('L2-217', 'L2', '长对话', '推断', '态度', '同意/反对程度', '高', 4, 3,
 'Does the speaker agree?',
 '注意程度副词：completely / partly / not really',
 '把"部分同意"当"完全同意"'),

('L2-218', 'L2', '长对话', '细节理解', '比较/对比', '事物对比信息', '中', 4, 3,
 'Compared to A, what about B?',
 '抓 compared to / unlike / while / whereas',
 '把对比关系搞反'),

-- ---------------------- 独白 L3 (~15 条) ----------------------
('L3-301', 'L3', '独白', '主旨', '中心思想', '独白主题判断', '极高', 4, 3,
 'What is the talk mainly about?',
 '听开头 + 结尾；抓重复出现的关键词',
 '抓住一个 example 当主题'),

('L3-302', 'L3', '独白', '细节理解', '具体信息', '事件经过细节', '极高', 4, 3,
 '细节题：发生了什么、几个阶段',
 '按时间顺序笔记：first / then / finally',
 '混乱时间顺序，把后发生的当先发生'),

('L3-303', 'L3', '独白', '推断', '说话人身份', '说话人角色判断', '高', 4, 3,
 'Who is most likely the speaker?',
 '通过用词专业度 + 称呼听众 + 话题领域判断',
 '只听一个专业术语就下结论'),

('L3-304', 'L3', '独白', '推断', '受众', '听众身份判断', '中', 4, 3,
 'Who is the audience?',
 '抓"开场白"中的称呼：dear students / fellow workers / ladies and gentlemen',
 '把演讲者职业当听众身份'),

('L3-305', 'L3', '独白', '推断', '场合', '独白发生场合', '高', 4, 3,
 'Where is the speech taking place?',
 '听开场白 + 话题领域（机场广播 / 校园广播 / 商场广告）',
 '基于内容主题误判场合'),

('L3-306', 'L3', '独白', '主旨', '目的', '说话人目的', '高', 4, 3,
 'What''s the purpose of the talk?',
 '听开头表态：to inform / to persuade / to introduce',
 '把附带提到的事当主要目的'),

('L3-307', 'L3', '独白', '细节理解', '数字/数据', '关键数据捕获', '极高', 4, 3,
 '统计数字、百分比、年份等',
 '听到数字立刻笔记；不要试图记忆',
 '记错单位（million vs billion）'),

('L3-308', 'L3', '独白', '推断', '观点', '说话人观点', '中', 5, 3,
 'What does the speaker think of...?',
 '抓评价性形容词 + 重复表态',
 '把陈述事实当个人观点'),

('L3-309', 'L3', '独白', '细节理解', '原因/结果', '事件因果链', '高', 4, 3,
 'What caused / led to...?',
 '抓 because of / due to / as a result',
 '混淆原因和结果'),

('L3-310', 'L3', '独白', '主旨', '建议/呼吁', '说话人的建议', '高', 4, 3,
 'What does the speaker suggest?',
 '抓 I suggest / It''s important to / Don''t forget to...',
 '把背景信息当建议'),

('L3-311', 'L3', '独白', '细节理解', '步骤', '操作步骤识别', '中', 3, 2,
 '操作类独白中的步骤先后',
 '听 step 1 / next / finally；记编号',
 '步骤顺序记错'),

('L3-312', 'L3', '独白', '推断', '将来事件', '后续行动预测', '中', 5, 3,
 'What will happen next?',
 '听 will / be going to / plan to + 上下文',
 '把演讲者计划当听众行动'),

('L3-313', 'L3', '独白', '细节理解', '对比', '不同事物对比', '中', 4, 3,
 '产品介绍 / 方案对比中的差异点',
 '抓 unlike / different from / compared with',
 '记错哪个属于 A 哪个属于 B'),

('L3-314', 'L3', '独白', '推断', '语气', '说话人语气特征', '中', 5, 3,
 'What''s the tone of the speech?',
 '判断 enthusiastic / serious / humorous / cautious',
 '只听一句话就给整体语气定性'),

('L3-315', 'L3', '独白', '细节理解', '人名/地名', '专有名词识别', '高', 4, 3,
 '听清人名、地名、机构名拼写',
 '人名地名记发音 + 大致首字母',
 '把相似名词混淆（Mike/Mark, Boston/Austin）'),

-- ---------------------- 听力策略 L4 (~9 条) ----------------------
('L4-401', 'L4', '听力策略', '通用技能', '审题技巧', '听前 5 秒抓题干', '极高', 2, 1,
 '每题广播前预读题干，划出疑问词和关键名词',
 '把疑问词 + 选项的差异点圈出来，听时只关注这些',
 '通读全部选项浪费时间，反而抓不到广播重点'),

('L4-402', 'L4', '听力策略', '通用技能', '速记技能', '关键信息速记', '极高', 3, 2,
 '用缩写、符号快速记数字、人名、地点',
 '建立个人速记法：→/↑/$/h（小时）等',
 '尝试记完整句子，反而漏听后续'),

('L4-403', 'L4', '听力策略', '通用技能', '连读弱读', '识别连读', '高', 4, 3,
 'going to → gonna，want to → wanna，let me → lemme',
 '日常多听原音，建立"音变库"',
 '听不懂连读就当没说过；要根据上下文猜'),

('L4-404', 'L4', '听力策略', '通用技能', '同义替换', '近义词替换识别', '极高', 4, 3,
 '广播说 "broken"，选项写 "out of order"',
 '广播 vs 题目常用近义词替换，要会对应',
 '机械找原词，错过同义替换'),

('L4-405', 'L4', '听力策略', '通用技能', '数字处理', '快速数字识别', '极高', 3, 2,
 '13 vs 30 / 100 vs 1000 / 8:15 vs 8:50',
 '重音判断 + 上下文逻辑双重确认',
 '只凭尾音判断'),

('L4-406', 'L4', '听力策略', '通用技能', '逻辑词', '抓转折/因果信号词', '高', 3, 2,
 'but / however / on the other hand / because / therefore',
 '听到信号词立刻警觉：往往是答案出处',
 '只关注主谓宾，忽略副词和连词'),

('L4-407', 'L4', '听力策略', '通用技能', '注意力分配', '边听边记的注意力管理', '中', 4, 3,
 '听 + 记 + 思考三件事要同时',
 '只记关键信息（数字/人名/动作），不记整句',
 '尝试每个词都记，反而注意力分散'),

('L4-408', 'L4', '听力策略', '通用技能', '推断技巧', '基于常识推断', '中', 5, 3,
 '当对话不完整时，依据生活常识补全逻辑',
 '问自己"现实中这种场景下会发生什么"',
 '过度依赖字面信息，不愿用常识'),

('L4-409', 'L4', '听力策略', '通用技能', '心态管理', '漏听不慌', '高', 2, 1,
 '漏听一题不要慌，影响后续',
 '果断弃题，转到下一题预读',
 '纠结上一题，错过下一题预读窗口');


-- ============================================================================
-- PART 2: 写作知识点表（应用文 + 读后续写）
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.gaokao_writing_knowledge_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id text NOT NULL UNIQUE,           -- W1-101 等
  category_code text NOT NULL,              -- W1=应用文, W2=读后续写
  category_name text NOT NULL,              -- 应用文/读后续写
  level1 text,                              -- 文体（邀请信/感谢信...） or 维度（情节连贯...）
  level2 text,                              -- 段落功能 or 子能力
  level3 text NOT NULL,                     -- 三级原子知识点
  exam_frequency text,                      -- 极高/高/中/低
  difficulty smallint,                      -- 1-5
  year_band smallint,                       -- 1/2/3, NULL = 跨年级通用
  example text,                             -- 典型句式/例句
  strategy text,                            -- 写作策略
  pitfall text,                             -- 易错点/失分点
  prerequisite text,                        -- 先修
  extra jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_wkp_category ON public.gaokao_writing_knowledge_points(category_code);
CREATE INDEX idx_wkp_year ON public.gaokao_writing_knowledge_points(year_band);
CREATE INDEX idx_wkp_level1 ON public.gaokao_writing_knowledge_points(level1);

ALTER TABLE public.gaokao_writing_knowledge_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read writing KPs" 
  ON public.gaokao_writing_knowledge_points FOR SELECT USING (true);

-- ---------------------- 应用文 W1 (~36 条 · 6 种文体) ----------------------
INSERT INTO public.gaokao_writing_knowledge_points 
  (source_id, category_code, category_name, level1, level2, level3, exam_frequency, difficulty, year_band, example, strategy, pitfall) VALUES

-- 邀请信
('W1-101', 'W1', '应用文', '邀请信', '开头-写作目的', '直接表明邀请意图', '极高', 2, 2,
 'I''m writing to invite you to... / It''s my honor to invite you to...',
 '开门见山句直接说邀请什么活动',
 '开头绕弯子说背景，浪费篇幅'),

('W1-102', 'W1', '应用文', '邀请信', '主体-活动信息', '时间地点 5W 全', '极高', 2, 2,
 'The event will be held on Sat, June 5, at our school auditorium.',
 'When/Where/What/Why/Who 五要素都要齐全',
 '漏掉关键要素（如忘了说几点）'),

('W1-103', 'W1', '应用文', '邀请信', '主体-活动亮点', '说服对方为何值得来', '高', 3, 2,
 'It will be a great opportunity to... / You''ll have a chance to...',
 '描述 1-2 个亮点活动，激发兴趣',
 '只写流水账，不打动收信人'),

('W1-104', 'W1', '应用文', '邀请信', '结尾-期待回应', '礼貌请求回复', '极高', 2, 2,
 'Looking forward to your reply. / Please let me know if you can come.',
 '常用 Looking forward to / RSVP by...',
 '结尾突然结束，没有 closing'),

('W1-105', 'W1', '应用文', '邀请信', '格式-落款', '正确落款格式', '高', 2, 2,
 'Yours sincerely, / Best regards, [Name]',
 '正式邀请用 sincerely，朋友用 regards/love',
 '把 Yours faithfully 用在熟人邀请'),

('W1-106', 'W1', '应用文', '邀请信', '语气', '正式 vs 友好', '中', 3, 2,
 '官方活动用正式词；同学聚会用 friendly 表达',
 '判断对方关系决定语气',
 '把同学聚会写得像商务邀请'),

-- 感谢信
('W1-107', 'W1', '应用文', '感谢信', '开头-表明感谢', '直接致谢', '极高', 2, 2,
 'I''m writing to express my sincere thanks for...',
 '一句话点明感谢对象 + 事件',
 '迟迟不说为何感谢'),

('W1-108', 'W1', '应用文', '感谢信', '主体-具体事件', '回忆受助具体细节', '极高', 3, 2,
 'It was you who... / I''ll always remember how you...',
 '描述 1-2 个具体场景，让感激落地',
 '只说"非常感谢"，没有具体内容'),

('W1-109', 'W1', '应用文', '感谢信', '主体-情感影响', '描述这件事的意义', '高', 3, 2,
 'Your help meant a lot to me. / Without you, I couldn''t have...',
 '强调对方行为带来的具体价值',
 '只感谢，不说为什么这件事重要'),

('W1-110', 'W1', '应用文', '感谢信', '主体-回报承诺', '表达回报意愿（可选）', '中', 3, 2,
 'If there''s anything I can do for you, please let me know.',
 '中文学生常忽略此段，加上会显得更真诚',
 '过度承诺反而不真实'),

('W1-111', 'W1', '应用文', '感谢信', '结尾-再次致谢', '收尾再表谢意', '极高', 2, 2,
 'Once again, thank you so much for your kindness.',
 '结尾用 once again / heartfelt thanks 等强化',
 '结尾草草结束'),

-- 道歉信
('W1-112', 'W1', '应用文', '道歉信', '开头-致歉', '直接道歉', '极高', 2, 2,
 'I''m writing to apologize for / I''m terribly sorry that...',
 '不要拖泥带水，开篇就道歉',
 '先讲一堆理由再道歉，显得不真诚'),

('W1-113', 'W1', '应用文', '道歉信', '主体-原因解释', '解释原因但不过度', '高', 3, 2,
 'The reason is that... / Due to..., I had to...',
 '简短解释，不要长篇辩解',
 '把原因写成借口，转移责任'),

('W1-114', 'W1', '应用文', '道歉信', '主体-弥补方案', '提出补救措施', '极高', 3, 2,
 'To make up for it, I''d like to... / Could we reschedule to...?',
 '主动提补救方案，让对方感受到诚意',
 '只道歉不补救，问题没解决'),

('W1-115', 'W1', '应用文', '道歉信', '结尾-再次道歉', '收尾再表歉意', '极高', 2, 2,
 'Once again, please accept my sincere apologies.',
 '结尾再次表态，不留任何怨气',
 '结尾突然乐观，破坏全文情绪'),

('W1-116', 'W1', '应用文', '道歉信', '语气', '诚恳谦卑', '高', 3, 2,
 '避免找借口的措辞；使用 my fault / I should have... 等承担责任的表达',
 '把责任揽到自己身上',
 '甩锅给环境/他人'),

-- 建议信
('W1-117', 'W1', '应用文', '建议信', '开头-表达关切', '点明问题/关切', '高', 3, 2,
 'I''ve learned that you''re facing... / I''d like to share some thoughts on...',
 '开头让对方感到被理解、被重视',
 '上来就给建议，显得高高在上'),

('W1-118', 'W1', '应用文', '建议信', '主体-分点建议', '3 条建议，每条有理由', '极高', 3, 2,
 'First, you could... This will help... / Secondly,... / Finally,...',
 '每条建议 + 简短理由；不要一大坨建议没解释',
 '只列建议不解释为何这样做'),

('W1-119', 'W1', '应用文', '建议信', '主体-鼓励语气', '不命令、要鼓励', '中', 3, 2,
 'You might want to consider... / It might be helpful if...',
 '用 might / could / I''d suggest 等委婉表达',
 '用 must / have to 命令语气'),

('W1-120', 'W1', '应用文', '建议信', '结尾-期待效果', '展望积极结果', '高', 3, 2,
 'I hope these suggestions help. / Wishing you success in...',
 '结尾积极正向，表达祝福',
 '结尾平淡，没有情感连接'),

-- 通知
('W1-121', 'W1', '应用文', '通知', '格式-标题', 'Notice 标题居中', '极高', 1, 2,
 'NOTICE（全大写居中）',
 '正式通知必须有居中大标题',
 '当作普通段落开头，没标题'),

('W1-122', 'W1', '应用文', '通知', '开头-对象', '明确通知对象', '极高', 1, 2,
 'To all students / To the staff of...',
 '第一行说明面向谁',
 '不写对象，让读者猜跟自己有没有关'),

('W1-123', 'W1', '应用文', '通知', '主体-事件 + 时间 + 地点', '5W 信息齐全', '极高', 2, 2,
 'A meeting will be held on... at... to discuss...',
 '一个段落讲清 What/When/Where/Why',
 '把信息打散在不同段落'),

('W1-124', 'W1', '应用文', '通知', '主体-要求', '参加者需要做的事', '高', 2, 2,
 'Please bring your ID / Sign up at the office by...',
 '明确列出参加者要做什么、带什么、几点到',
 '该说的要求没说全'),

('W1-125', 'W1', '应用文', '通知', '格式-落款', '日期 + 单位', '极高', 1, 2,
 'The Student Union / Date: June 5',
 '落款写发布单位 + 日期；右下角',
 '只写日期不写发布单位'),

-- 演讲稿
('W1-126', 'W1', '应用文', '演讲稿', '开头-称呼', '正式称呼听众', '极高', 2, 3,
 'Good morning, everyone! / Distinguished guests, dear teachers and friends...',
 '正式场合用 distinguished；同学场合用 dear friends',
 '上来就讲主题没称呼'),

('W1-127', 'W1', '应用文', '演讲稿', '开头-主题引入', '点明演讲主题', '极高', 3, 3,
 'Today, I''d like to talk about... / The topic of my speech is...',
 '一句话点题，不要绕弯子',
 '迟迟不点题'),

('W1-128', 'W1', '应用文', '演讲稿', '主体-分点阐述', '清晰的分段结构', '极高', 4, 3,
 'First / Second / Third / In addition / Last but not least',
 '3 个分论点最稳；每点用过渡词引出',
 '一段写到底，听众抓不住重点'),

('W1-129', 'W1', '应用文', '演讲稿', '主体-举例论证', '具体例子支撑论点', '高', 4, 3,
 'For instance, ... / Take... for example, ...',
 '抽象论点必须配具体例子；不要空喊口号',
 '只讲道理不举例，缺乏说服力'),

('W1-130', 'W1', '应用文', '演讲稿', '结尾-呼吁', '号召听众行动', '高', 4, 3,
 'Let''s... together. / I sincerely hope that we can...',
 '结尾要有号召性，让听众有行动欲',
 '结尾平淡总结，没情感推动'),

('W1-131', 'W1', '应用文', '演讲稿', '结尾-感谢', '礼貌结束', '极高', 1, 3,
 'Thank you for listening. / That''s all. Thanks!',
 '一句话结束；不要话题外延',
 '结束后还在补充内容'),

('W1-132', 'W1', '应用文', '演讲稿', '语言风格', '口语化 + 情感词', '中', 4, 3,
 '用 we/you 互动；用 should / must 强化情感；用反问 Why? How?',
 '口语化语言比正式书面语更打动人',
 '写得像论文，缺乏演讲感'),

-- 通用应用文技能
('W1-133', 'W1', '应用文', '通用', '词汇丰富度', '高级词替换', '极高', 4, 3,
 'show → demonstrate, help → assist, get → obtain',
 '每篇 5-8 个高级替换，但不要堆砌',
 '一段全是基础词 get/give/make/have'),

('W1-134', 'W1', '应用文', '通用', '句式多样', '简单句+复合句搭配', '极高', 4, 3,
 '复合句：As mentioned above, ... / Given that...',
 '至少 2 个从句、1 个非谓语动词；其余用简单句保流畅',
 '全部简单句，得分上不去；全部复杂句又显笨拙'),

('W1-135', 'W1', '应用文', '通用', '过渡衔接', '段落间用过渡词', '高', 3, 2,
 'Moreover / However / In addition / On the other hand',
 '每段落间至少 1 个过渡词；不要省略',
 '段落之间硬切，没有衔接'),

('W1-136', 'W1', '应用文', '通用', '字数控制', '80-100 词最稳', '极高', 2, 2,
 '不要超过 120 词，不要少于 60 词',
 '每段 2-3 句，控制字数',
 '写超 150 词；或不到 60 词被扣分'),

-- ---------------------- 读后续写 W2 (~26 条 · 5 维度) ----------------------

-- 维度 1: 情节连贯
('W2-201', 'W2', '读后续写', '情节连贯', '段首句衔接', '续写段首句必须接原文结尾', '极高', 4, 3,
 '原文结尾 "Suddenly the door opened." → 续写段 1 句首 "John stood there, soaked from the rain..."',
 '续写第一句必须解决"开门后看到的人/事"；不能跳跃',
 '续写段首另起话题，与原文断裂'),

('W2-202', 'W2', '读后续写', '情节连贯', '人物一致性', '保持人物性格不突变', '极高', 4, 3,
 '原文中性格内向的男孩，续写不能突然变得极度外向',
 '紧贴原文给出的人物特征延伸',
 '为了戏剧性让人物性格突变，扣分'),

('W2-203', 'W2', '读后续写', '情节连贯', '因果链', '事件因果合理', '极高', 4, 3,
 '续写情节必须有合理动机和逻辑',
 '每个新事件问自己"为什么会这样"，可解释',
 '为戏剧而戏剧，前后无逻辑连接'),

('W2-204', 'W2', '读后续写', '情节连贯', '段落 2 衔接段 1', '两段间过渡自然', '极高', 4, 3,
 '段 1 结尾 "He finally found the letter." → 段 2 首句 "Reading it carefully, he..."',
 '段 2 第一句要承接段 1 最后一个事件',
 '段 2 突然跳到第二天/另一地点，没过渡'),

('W2-205', 'W2', '读后续写', '情节连贯', '时间线一致', '时态/时间副词配合', '高', 4, 3,
 '原文是过去式，续写保持过去式；时间表达连贯（later that day, the next morning）',
 '画出时间轴，确保续写时间在原文之后',
 '突然切换到现在时；时间倒退'),

('W2-206', 'W2', '读后续写', '情节连贯', '伏笔回应', '回应原文埋下的伏笔', '高', 5, 3,
 '原文提到 "the strange key"，续写需要用到这把钥匙',
 '通读原文圈出所有"未解谜题"，续写需要至少处理其中一个',
 '完全忽略原文伏笔，自创新元素'),

-- 维度 2: 用词丰富
('W2-207', 'W2', '读后续写', '用词丰富', '动词替换', '用具体动词代替万能动词', '极高', 4, 3,
 'walked → strode/sauntered/trudged; said → murmured/exclaimed/whispered',
 '建立动词替换库：每个万能动词 3-5 个高级替换',
 '全文 walked/said/went 反复出现'),

('W2-208', 'W2', '读后续写', '用词丰富', '名词具体化', '用具体名词代替抽象指代', '极高', 4, 3,
 'thing → object/item/article; place → corner/spot/destination',
 '问自己"这个 thing 具体是什么"',
 '用 thing/something 代替具体物'),

('W2-209', 'W2', '读后续写', '用词丰富', '形容词层级', '从基础到高级形容词', '极高', 4, 3,
 'happy → delighted/elated/thrilled; sad → devastated/heartbroken',
 '形容词要分情绪强度；准备 3 个 tier',
 '所有正面情绪都用 happy，所有负面都用 sad'),

('W2-210', 'W2', '读后续写', '用词丰富', '副词修饰', '副词增强动作画面感', '高', 4, 3,
 'looked → looked nervously / glared furiously',
 '用副词补充动作的情绪/态度',
 '只用动词，画面感弱'),

('W2-211', 'W2', '读后续写', '用词丰富', '比喻使用', '适度使用比喻', '中', 5, 3,
 'Her heart raced like a galloping horse.',
 '每段最多 1-2 个比喻；不要过密',
 '比喻过密反而显刻意；或完全不用'),

-- 维度 3: 句式多样
('W2-212', 'W2', '读后续写', '句式多样', '简复句搭配', '简单句 60% + 复杂句 40%', '极高', 4, 3,
 '主从复合句、非谓语短句、独立结构混搭',
 '检查每段是否有不同长度的句子',
 '全是简单句（学生）或全是复杂句（堆砌）'),

('W2-213', 'W2', '读后续写', '句式多样', '倒装句', '使用部分倒装强调', '高', 5, 3,
 'Never before had he felt so excited. / Only then did she realize...',
 '每篇 1-2 个倒装，用在关键转折处',
 '一篇用 3+ 个倒装，过度刻意'),

('W2-214', 'W2', '读后续写', '句式多样', '强调句', 'It was... that... 结构', '中', 5, 3,
 'It was the smile on her face that gave him courage.',
 '强调关键名词或时间地点；用在情感高潮',
 '滥用强调句，反而减弱情感'),

('W2-215', 'W2', '读后续写', '句式多样', '非谓语开头', '现在分词/过去分词开头', '极高', 4, 3,
 'Walking down the hall, he heard a strange sound. / Excited by the news, she...',
 '每段至少 1-2 处用非谓语动词替换从句',
 '只用 when/while 从句，句式单一'),

('W2-216', 'W2', '读后续写', '句式多样', '独立主格', '独立结构表伴随', '中', 5, 3,
 'His hands trembling, he opened the envelope.',
 '高分必备结构；适用于伴随动作描写',
 '不熟练用错位置；或完全不用错失加分点'),

-- 维度 4: 情绪刻画
('W2-217', 'W2', '读后续写', '情绪刻画', '身体反应', '用身体表现写情绪', '极高', 4, 3,
 'Her hands trembled. / His heart pounded. / Tears welled up in her eyes.',
 '不要直接说 sad/happy，用身体反应让读者感受',
 '"She was very sad." 这种直白扣分'),

('W2-218', 'W2', '读后续写', '情绪刻画', '内心独白', '插入人物内心想法', '极高', 4, 3,
 'Could this really be happening? he wondered.',
 '用 he/she thought / wondered / asked himself 引出',
 '只写动作不写内心，情绪扁平'),

('W2-219', 'W2', '读后续写', '情绪刻画', '对话传情', '通过对话台词显情绪', '高', 4, 3,
 '"I-I can''t believe it..." she stammered.',
 '台词 + 说话方式（whispered/shouted/stammered）',
 '只用 said 这一种引述方式'),

('W2-220', 'W2', '读后续写', '情绪刻画', '情绪过渡', '情绪转换有铺垫', '极高', 5, 3,
 '从惊讶到喜悦：先 stunned for a moment, then a slow smile spread across her face',
 '情绪转换至少 1-2 句铺垫，不要瞬间切换',
 '惊讶 → 喜悦 一句话直接转，显突兀'),

('W2-221', 'W2', '读后续写', '情绪刻画', '环境烘托', '用环境描写呼应情绪', '中', 5, 3,
 '悲伤场景配 grey sky / cold wind；喜悦场景配 sunshine / warm breeze',
 '环境 + 心境呼应，情景交融',
 '环境描写与人物情绪割裂'),

-- 维度 5: 升华
('W2-222', 'W2', '读后续写', '升华', '主题呼应', '结尾呼应原文主题', '极高', 5, 3,
 '原文主题是"友谊"，结尾要让读者感到这份友谊的珍贵',
 '通读原文找主题；续写结尾用 1-2 句呼应',
 '续写偏题，跑到另一个主题'),

('W2-223', 'W2', '读后续写', '升华', '哲理性总结', '结尾点睛', '高', 5, 3,
 '"Sometimes the most precious gifts come in the smallest moments."',
 '高分作文常有 1 句结尾点睛；不要长篇大论',
 '点睛句过长说教感强；或完全没有点睛'),

('W2-224', 'W2', '读后续写', '升华', '价值观传递', '正面价值观渗透', '高', 5, 3,
 '坚韧、善良、勇敢、感恩 — 高考阅卷偏好正向价值',
 '续写人物做出符合正面价值的选择',
 '让人物做出负面/消极选择'),

('W2-225', 'W2', '读后续写', '升华', '感悟回响', '给读者启发', '中', 5, 3,
 '结尾让读者产生共鸣或思考',
 '通过具体细节 + 普世感受，激起共鸣',
 '结尾纯粹结束故事，无任何升华'),

('W2-226', 'W2', '读后续写', '升华', '主题升级', '从个体到普世', '中', 5, 3,
 '从一个人的友谊上升到"友谊的本质"',
 '高级作文有"以小见大"',
 '只停留在个人故事，没有普世性提升');


-- ============================================================================
-- PART 3: 完形知识点表（动词辨析 / 名词形容词 / 上下文逻辑 / 词语复现）
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.gaokao_cloze_knowledge_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id text NOT NULL UNIQUE,           -- C1-101 等
  category_code text NOT NULL,              -- C1/C2/C3/C4
  category_name text NOT NULL,              -- 动词辨析/名形副/逻辑关系/词语复现
  level1 text,                              -- 一级（词性 or 逻辑类型）
  level2 text,                              -- 二级
  level3 text NOT NULL,                     -- 三级原子知识点
  exam_frequency text,                      -- 极高/高/中/低
  difficulty smallint,                      -- 1-5
  year_band smallint,                       -- 1/2/3, NULL = 跨年级通用
  example text,                             -- 典型考点示例
  strategy text,                            -- 解题策略
  pitfall text,                             -- 易错点
  prerequisite text,                        -- 先修
  extra jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ckp_category ON public.gaokao_cloze_knowledge_points(category_code);
CREATE INDEX idx_ckp_year ON public.gaokao_cloze_knowledge_points(year_band);
CREATE INDEX idx_ckp_freq ON public.gaokao_cloze_knowledge_points(exam_frequency);

ALTER TABLE public.gaokao_cloze_knowledge_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read cloze KPs" 
  ON public.gaokao_cloze_knowledge_points FOR SELECT USING (true);

INSERT INTO public.gaokao_cloze_knowledge_points 
  (source_id, category_code, category_name, level1, level2, level3, exam_frequency, difficulty, year_band, example, strategy, pitfall) VALUES

-- 动词辨析（完形最高频考点）
('C1-101', 'C1', '动词辨析', '同义动词', '观察类（look/see/watch）', 'look 主动看 / see 看到 / watch 观察过程', '极高', 3, 2,
 'He __ at the painting carefully. (looked)',
 '区分主动 vs 被动；瞬时 vs 持续；功能 vs 故意',
 '把 look 和 see 互换'),

('C1-102', 'C1', '动词辨析', '同义动词', '说话类（say/tell/speak/talk）', 'say + 话, tell + 人, speak 强调能力, talk 双向', '极高', 3, 2,
 'He __ me to be careful. (told)',
 '看后面带不带人；强调动作还是内容',
 '把 tell sb sth 写成 say sb sth'),

('C1-103', 'C1', '动词辨析', '同义动词', '想/认为（think/consider/regard）', 'think 想，consider 慎重考虑，regard...as... 视为', '高', 3, 2,
 'I __ him as my best friend. (regard)',
 '是 think 后面 of 还是直接接；是否需要 as',
 '把 regard 后面忘加 as'),

('C1-104', 'C1', '动词辨析', '同义动词', '走路类（walk/stride/pace/wander）', 'walk 中性, stride 大步, pace 来回, wander 漫无目的', '高', 4, 3,
 'He __ back and forth, deep in thought. (paced)',
 '看上下文情绪：紧张 → pace；激动 → stride；放松 → wander',
 '只认识 walk，错过情绪线索'),

('C1-105', 'C1', '动词辨析', '同义动词', '给予类（give/offer/provide/supply）', 'give 一般, offer 主动给, provide 提供（事先准备）, supply 持续供给', '高', 4, 3,
 'The hotel __ free breakfast. (provides/offers)',
 '区分一次性 vs 持续；主动 vs 被动',
 '把 supply 和 provide 完全混用'),

('C1-106', 'C1', '动词辨析', '心理动词', '担心类（worry/concern/bother）', 'worry 担忧, concern 关切, bother 烦扰', '中', 4, 3,
 'What __ me most is his health. (concerns)',
 '看主语是人还是事；及物还是不及物',
 '把 worry 用错形式（worried about / worry sb）'),

('C1-107', 'C1', '动词辨析', '心理动词', '怀疑类（doubt/suspect/wonder）', 'doubt 不相信, suspect 怀疑（认为是真）, wonder 疑惑想知道', '中', 4, 3,
 'I doubt he will come. (我不信他会来) / I suspect he stole it.',
 'doubt + that 否定意；suspect 倾向相信',
 '把 doubt 和 suspect 反向用'),

-- 名词/形容词/副词
('C2-201', 'C2', '名形副', '形容词辨析', '近义形容词区分', 'careful 仔细的 vs careless 粗心的；keen 渴望的 vs eager 急切的', '极高', 3, 2,
 'She is __ to learn. (keen / eager)',
 '注意褒贬色彩 + 程度 + 介词搭配',
 '把 careful (仔细) 和 carefully (副词) 词性混用'),

('C2-202', 'C2', '名形副', '形容词辨析', '形容词修饰人/物区分', 'tiring (令人累的) vs tired (感到累的); boring vs bored', '极高', 3, 2,
 'The movie was __ . / I was __ by the movie. (boring / bored)',
 '修饰物用 -ing；修饰人感受用 -ed',
 '混用 -ing 和 -ed 分词'),

('C2-203', 'C2', '名形副', '副词层级', '程度副词强弱', 'a little / somewhat / fairly / quite / very / extremely', '高', 3, 2,
 'It''s __ cold today, much worse than yesterday.',
 '根据语境判断强度；注意 quite 在英美用法差异',
 '把 quite 当 "很"（英式更接近"相当"）'),

('C2-204', 'C2', '名形副', '副词位置', '副词在句中位置', '频率副词 always/often 一般在 be 后实义动词前；方式副词在动词后', '中', 3, 2,
 'He __ comes late. (often)',
 '记住位置规则：助动词后 + 实义动词前',
 '把 always 放句末或句首'),

('C2-205', 'C2', '名形副', '抽象名词', '近义抽象名词', 'effect 效果 vs affect 动词；advice 建议（不可数）vs advise 建议（动词）', '高', 4, 3,
 'His __ on me was huge. (effect)',
 '注意名词 vs 动词同形不同义；及不可数名词形式',
 '把 effect/affect 当近义词随便互换'),

-- 上下文逻辑（解题核心技能）
('C3-301', 'C3', '逻辑关系', '转折', '转折信号词', 'however / but / yet / although / despite / on the other hand', '极高', 3, 2,
 'He studied hard; __, he failed. (however)',
 '空前后语义相反 → 选转折词',
 '把转折空填成同义递进词'),

('C3-302', 'C3', '逻辑关系', '因果', '因果信号词', 'because / since / as / so / therefore / consequently / due to', '极高', 3, 2,
 'It was raining, __ we stayed home. (so / therefore)',
 '空前是原因还是结果；判断顺序',
 '把 because 和 so 反向用'),

('C3-303', 'C3', '逻辑关系', '递进', '递进信号词', 'moreover / furthermore / besides / what''s more / in addition', '高', 3, 2,
 'He is smart. __, he works hard. (Moreover)',
 '空前后相同方向、加深一层 → 选递进',
 '把递进当转折'),

('C3-304', 'C3', '逻辑关系', '让步', '让步信号词', 'although / though / even if / despite / in spite of', '高', 4, 3,
 '__ the rain, they continued. (Despite)',
 'although 接句子；despite 接名词/动名词',
 '把 despite 后面加 that 接句子（错）'),

('C3-305', 'C3', '逻辑关系', '举例', '举例信号词', 'for example / for instance / such as / like / take...for example', '高', 2, 2,
 '__ apples and bananas are healthy fruits. (For example)',
 '空后是具体例子 → 选举例词',
 '把 such as 和 for example 在句中位置混用'),

('C3-306', 'C3', '逻辑关系', '时间顺序', '时间副词', 'first / then / next / later / finally / meanwhile / afterwards', '高', 2, 2,
 'First we ate. __ we walked. (Then)',
 '通读全文画时间线',
 '把 then 和 than 拼错'),

('C3-307', 'C3', '逻辑关系', '条件', '条件信号词', 'if / unless / provided that / as long as / on condition that', '中', 4, 3,
 '__ you work hard, you''ll succeed. (If / As long as)',
 '注意 unless = if...not',
 '把 unless 后面加否定（双重否定错）'),

('C3-308', 'C3', '逻辑关系', '总结', '总结信号词', 'in short / to sum up / in conclusion / overall / in a word', '中', 4, 3,
 '__, hard work pays off. (In short)',
 '通常在结尾段开头；前面是分论点',
 '把总结词当转折'),

-- 词语复现（高考完形的关键技能）
('C4-401', 'C4', '词语复现', '同义复现', '上下文同义词替换', '原文 "happy"，空选 delighted / cheerful', '极高', 4, 3,
 '"He felt happy. The smile on his face __ his joy." (revealed / showed)',
 '划出空所在句的关键名词/动词，再回原文找同义词',
 '只找原词 (复现 ≠ 复制) ，错失同义替换'),

('C4-402', 'C4', '词语复现', '反义复现', '上下文反义对比', '原文 "expensive"，空选 cheap / affordable', '高', 4, 3,
 '"The car wasn''t cheap, but I bought it. The price was __." (expensive / steep)',
 '看到 but / however / instead 等对比标志，找反义',
 '反义复现没识别，选了同义词'),

('C4-403', 'C4', '词语复现', '上下义复现', '范畴-个体相互复现', '原文 "fruits"，空选 apple / orange (个体)；反之亦然', '中', 4, 3,
 '"He likes fruits, especially __." (apples)',
 '注意范畴词与具体词的相互照应',
 '只找完全相同词，错失上下义关系'),

('C4-404', 'C4', '词语复现', '指代复现', '代词的指代关系', '判断 it / he / she / they 指代什么', '极高', 3, 2,
 '"The boy lost his book. He searched everywhere for __." (it = book)',
 '回到上文找最近的同性别/数量的名词',
 '把代词搞错指代对象'),

('C4-405', 'C4', '词语复现', '语义场复现', '同一主题词群', '篇章主题"环境"，相关词：pollution / climate / ecosystem 都可能出现', '中', 5, 3,
 '环境主题文章里空缺 → 优先选环境词群里的词',
 '通读全文确定主题，再判断空缺词应在哪个语义场',
 '只看局部句子，忽视全文主题倾向');


-- ============================================================================
-- PART 4: 创建跨领域知识点统一 VIEW（便于 AI 处方引擎一次性查询）
-- ============================================================================

CREATE OR REPLACE VIEW public.v_gaokao_all_knowledge_points AS
  SELECT
    'grammar' AS skill_area,
    id,
    slug AS source_id,
    title AS level3,
    NULL::text AS category_code,
    NULL::text AS category_name,
    NULL::text AS level1,
    NULL::text AS level2,
    NULL::text AS exam_frequency,
    difficulty,
    NULL::smallint AS year_band,
    explanation AS example,
    NULL::text AS strategy,
    NULL::text AS pitfall
  FROM public.gaokao_grammar_points
  
  UNION ALL
  
  SELECT
    'reading' AS skill_area,
    id,
    source_id,
    level3,
    category_code,
    category_name,
    level1,
    level2,
    exam_frequency,
    difficulty,
    CASE 
      WHEN grade_band = 'senior1' THEN 1::smallint
      WHEN grade_band = 'senior2' THEN 2::smallint
      WHEN grade_band = 'senior3' THEN 3::smallint
      ELSE NULL::smallint
    END AS year_band,
    example,
    strategy,
    pitfall
  FROM public.gaokao_reading_knowledge_points
  
  UNION ALL
  
  SELECT
    'listening' AS skill_area,
    id, source_id, level3, category_code, category_name, level1, level2, 
    exam_frequency, difficulty, year_band, example, strategy, pitfall
  FROM public.gaokao_listening_knowledge_points
  
  UNION ALL
  
  SELECT
    'writing' AS skill_area,
    id, source_id, level3, category_code, category_name, level1, level2, 
    exam_frequency, difficulty, year_band, example, strategy, pitfall
  FROM public.gaokao_writing_knowledge_points
  
  UNION ALL
  
  SELECT
    'cloze' AS skill_area,
    id, source_id, level3, category_code, category_name, level1, level2, 
    exam_frequency, difficulty, year_band, example, strategy, pitfall
  FROM public.gaokao_cloze_knowledge_points;


-- ============================================================================
-- DONE · 检查总数
-- ============================================================================
-- 执行后预期看到：
--   gaokao_listening_knowledge_points : ~62 行
--   gaokao_writing_knowledge_points   : ~62 行  
--   gaokao_cloze_knowledge_points     : ~26 行
--   v_gaokao_all_knowledge_points     : 1005 行（298 grammar + 557 reading + 62 + 62 + 26）
-- ============================================================================
