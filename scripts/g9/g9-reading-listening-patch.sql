-- 回补 U3/U4/U5 reading.vocab_notes + U5 listening.translation_cn(UPDATE,按 volume='9'+unit+title 匹配,保留id/audio/掌握度)

-- U3 reading vocab_notes (6篇)
UPDATE public.junior_reading SET vocab_notes='[{"word": "polite", "cn": "礼貌的"}, {"word": "attention", "cn": "注意;关注"}, {"word": "respect", "cn": "尊重"}]'::jsonb WHERE grade=9 AND volume='9' AND unit='U3' AND title='Asking for Directions Politely';
UPDATE public.junior_reading SET vocab_notes='[{"word": "tourist", "cn": "游客"}, {"word": "straight", "cn": "直地;笔直的"}, {"word": "corner", "cn": "拐角"}]'::jsonb WHERE grade=9 AND volume='9' AND unit='U3' AND title='At the Information Desk';
UPDATE public.junior_reading SET vocab_notes='[{"word": "lost", "cn": "迷路的"}, {"word": "shy", "cn": "害羞的"}, {"word": "stranger", "cn": "陌生人"}]'::jsonb WHERE grade=9 AND volume='9' AND unit='U3' AND title='A Kind Stranger';
UPDATE public.junior_reading SET vocab_notes='[{"word": "airport", "cn": "机场"}, {"word": "staff", "cn": "工作人员"}, {"word": "officer", "cn": "官员;警官"}]'::jsonb WHERE grade=9 AND volume='9' AND unit='U3' AND title='A Letter Before the Trip';
UPDATE public.junior_reading SET vocab_notes='[{"word": "direct", "cn": "直接的"}, {"word": "rude", "cn": "粗鲁的"}, {"word": "willing", "cn": "乐意的"}]'::jsonb WHERE grade=9 AND volume='9' AND unit='U3' AND title='Why Politeness Matters When Asking';
UPDATE public.junior_reading SET vocab_notes='[{"word": "restroom", "cn": "洗手间"}, {"word": "volunteer", "cn": "志愿者"}, {"word": "emergency", "cn": "紧急情况"}]'::jsonb WHERE grade=9 AND volume='9' AND unit='U3' AND title='City Information Guide';
-- U4 reading vocab_notes (6篇)
UPDATE public.junior_reading SET vocab_notes='[{"word": "scared", "cn": "害怕的"}, {"word": "brave", "cn": "勇敢的"}, {"word": "nervous", "cn": "紧张的"}]'::jsonb WHERE grade=9 AND volume='9' AND unit='U4' AND title='Brave Now';
UPDATE public.junior_reading SET vocab_notes='[{"word": "different", "cn": "不同的"}, {"word": "confidence", "cn": "自信"}, {"word": "quiet", "cn": "安静的"}]'::jsonb WHERE grade=9 AND volume='9' AND unit='U4' AND title='A Class Reunion';
UPDATE public.junior_reading SET vocab_notes='[{"word": "experiences", "cn": "经历"}, {"word": "confident", "cn": "自信的"}, {"word": "competition", "cn": "竞赛;竞争"}]'::jsonb WHERE grade=9 AND volume='9' AND unit='U4' AND title='Why People Change';
UPDATE public.junior_reading SET vocab_notes='[{"word": "mistakes", "cn": "错误"}, {"word": "stage", "cn": "舞台"}, {"word": "patient", "cn": "有耐心的"}]'::jsonb WHERE grade=9 AND volume='9' AND unit='U4' AND title='A Letter to My Younger Self';
UPDATE public.junior_reading SET vocab_notes='[{"word": "selfish", "cn": "自私的"}, {"word": "direction", "cn": "方向"}, {"word": "admire", "cn": "钦佩;欣赏"}]'::jsonb WHERE grade=9 AND volume='9' AND unit='U4' AND title='Is Change Always Good?';
UPDATE public.junior_reading SET vocab_notes='[{"word": "inspiring", "cn": "鼓舞人心的"}, {"word": "share", "cn": "分享"}, {"word": "welcome", "cn": "欢迎"}]'::jsonb WHERE grade=9 AND volume='9' AND unit='U4' AND title='Youth Club Notice: ''The New Me'' Sharing Day';
-- U5 reading vocab_notes (6篇)
UPDATE public.junior_reading SET vocab_notes='[{"word": "process", "cn": "加工;处理"}, {"word": "flavor", "cn": "味道;风味"}, {"word": "pack", "cn": "包装"}]'::jsonb WHERE grade=9 AND volume='9' AND unit='U5' AND title='How Tea Is Made';
UPDATE public.junior_reading SET vocab_notes='[{"word": "traditional", "cn": "传统的"}, {"word": "scissors", "cn": "剪刀"}, {"word": "skill", "cn": "技巧;技能"}]'::jsonb WHERE grade=9 AND volume='9' AND unit='U5' AND title='The Art of Paper Cutting';
UPDATE public.junior_reading SET vocab_notes='[{"word": "clay", "cn": "黏土;陶土"}, {"word": "lively", "cn": "鲜艳的;生动的"}, {"word": "shape", "cn": "塑造;使成形"}]'::jsonb WHERE grade=9 AND volume='9' AND unit='U5' AND title='Clay Figures of Tianjin';
UPDATE public.junior_reading SET vocab_notes='[{"word": "cost", "cn": "成本;费用"}, {"word": "label", "cn": "标签"}, {"word": "quality", "cn": "质量"}]'::jsonb WHERE grade=9 AND volume='9' AND unit='U5' AND title='Made in Many Countries';
UPDATE public.junior_reading SET vocab_notes='[{"word": "international", "cn": "国际的"}, {"word": "environment", "cn": "环境"}, {"word": "creative", "cn": "有创意的"}]'::jsonb WHERE grade=9 AND volume='9' AND unit='U5' AND title='A School Science Fair';
UPDATE public.junior_reading SET vocab_notes='[{"word": "local", "cn": "本地的;当地的"}, {"word": "craft", "cn": "手工艺品"}, {"word": "traffic", "cn": "交通;车辆"}]'::jsonb WHERE grade=9 AND volume='9' AND unit='U5' AND title='Buying Local Products';

-- U5 listening translation_cn (6篇)
UPDATE public.junior_listening_exercises SET translation_cn='女:多漂亮的衬衫!是丝绸做的吗?
男:不,是棉的,很舒服。
女:在哪里做的?
男:中国制造的,我上周买的。
女:你穿着真好看。' WHERE grade=9 AND volume='9' AND unit='U5' AND title='九年级 U5 听力·对话 Asking About a Shirt';
UPDATE public.junior_listening_exercises SET translation_cn='我来告诉你茶是怎么做的。
首先,茶叶在春天由人手采摘。
然后在阳光下晒干。
之后,茶叶被精心加工。
最后,茶被包装好,送往世界各地的商店。' WHERE grade=9 AND volume='9' AND unit='U5' AND title='九年级 U5 听力·短文 How Tea Is Made';
UPDATE public.junior_listening_exercises SET translation_cn='女:哇,好酷的飞机模型!它是用什么做的?
男:是用废木头和玻璃做的。
女:真的吗?它是怎么做出来的?
男:每个零件都是手工切割拼接的。
女:太厉害了!而且还环保。' WHERE grade=9 AND volume='9' AND unit='U5' AND title='九年级 U5 听力·对话 At the Science Fair';
UPDATE public.junior_listening_exercises SET translation_cn='剪纸是中国的传统艺术。
美丽的图案用剪刀从纸上剪出来。
图案常常是动物和花卉。
春节期间,剪纸被贴在窗户上。
人们相信它们会给家庭带来好运。' WHERE grade=9 AND volume='9' AND unit='U5' AND title='九年级 U5 听力·短文 Paper Cutting';
UPDATE public.junior_listening_exercises SET translation_cn='女:打扰一下,这个手提包是真皮的吗?
男:不是,女士,是棉布做的,可水洗。
女:不错。在哪里做的?
男:是本镇的本地工人做的。
女:那我买了。我喜欢买本地产品。' WHERE grade=9 AND volume='9' AND unit='U5' AND title='九年级 U5 听力·对话 Buying a Handbag';
UPDATE public.junior_listening_exercises SET translation_cn='泥人是天津著名的艺术。
它们用黏土制成,手工塑形。
塑形后,泥人被加热使其变硬。
然后被涂上明亮鲜艳的颜色。
每个泥人都用心制作,讲述着中国生活的故事。' WHERE grade=9 AND volume='9' AND unit='U5' AND title='九年级 U5 听力·短文 Clay Figures';

-- 校验:vocab_notes 非空(应 U3=6/U4=6/U5=6)
SELECT unit, count(*) FROM public.junior_reading WHERE grade=9 AND volume='9' AND unit IN ('U3','U4','U5') AND vocab_notes <> '[]'::jsonb GROUP BY unit ORDER BY unit;
-- 校验:U5 listening translation_cn 非空(应6)
SELECT count(*) FROM public.junior_listening_exercises WHERE grade=9 AND volume='9' AND unit='U5' AND translation_cn IS NOT NULL AND translation_cn<>'';