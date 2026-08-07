-- H 段 美国习惯用语 —— 50 条(type='idiom')
--
-- 前置:vocab_idioms_and_cn_expressions_ddl.sql 已跑(type 枚举含 idiom、literal_trap 列 + CHECK)。
-- ⚠️ literal_trap 是这一段的全部价值:格式「字面 X,实为 Y」,DDL 侧也 CHECK 了非空。
-- 幂等:ON CONFLICT (lower(chunk)) 更新。⚠️ 由 Aaron 执行。

BEGIN;

SELECT 'BEFORE' AS stage, count(*) FILTER (WHERE type='idiom') AS idioms, count(*) AS total FROM vocab_chunks;

INSERT INTO vocab_chunks (chunk, type, translation_zh, literal_trap, scene, example_en, example_zh, freq_rank)
VALUES
  ('break the ice', 'idiom', '打破僵局', '字面"打破冰",实为"打破僵局"', 'daily_life', 'Let''s play a game to break the ice.', '我们来玩个游戏来打破僵局。', 1),
  ('piece of cake', 'idiom', '小菜一碟', '字面"一块蛋糕",实为"小菜一碟"', 'daily_life', 'The test was a piece of cake for her.', '这个测试对她来说是小菜一碟。', 2),
  ('hit the nail on the head', 'idiom', '一针见血', '字面"敲钉子在头上",实为"一针见血"', 'work', 'You really hit the nail on the head with that comment.', '你的评论真是一针见血。', 3),
  ('a blessing in disguise', 'idiom', '因祸得福', '字面"伪装的祝福",实为"因祸得福"', 'daily_life', 'Losing that job was a blessing in disguise.', '失去那份工作是因祸得福。', 4),
  ('the ball is in your court', 'idiom', '该你决定了', '字面"球在你场内",实为"该你决定了"', 'work', 'I''ve done my part; the ball is in your court now.', '我已经做了我的部分; 该你决定了。', 5),
  ('under the weather', 'idiom', '身体不适', '字面"在天气之下",实为"身体不适"', 'health', 'I''m feeling a bit under the weather today.', '我今天感觉有点不舒服。', 6),
  ('let the cat out of the bag', 'idiom', '泄露秘密', '字面"让猫出袋",实为"泄露秘密"', 'daily_life', 'She let the cat out of the bag about the surprise party.', '她泄露了惊喜派对的秘密。', 7),
  ('burn the midnight oil', 'idiom', '开夜车', '字面"烧午夜的油",实为"开夜车"', 'education', 'He had to burn the midnight oil to finish the project.', '他不得不开夜车完成项目。', 8),
  ('cost an arm and a leg', 'idiom', '价格昂贵', '字面"花一条胳膊和腿",实为"价格昂贵"', 'daily_life', 'That car costs an arm and a leg.', '那辆车价格昂贵。', 9),
  ('bark up the wrong tree', 'idiom', '找错对象', '字面"在错的树上叫",实为"找错对象"', 'daily_life', 'If you think I''m guilty, you''re barking up the wrong tree.', '如果你认为我有罪,那你找错对象了。', 10),
  ('bite the bullet', 'idiom', '硬着头皮', '字面"咬子弹",实为"硬着头皮"', 'work', 'I had to bite the bullet and accept the challenge.', '我不得不硬着头皮接受挑战。', 11),
  ('call it a day', 'idiom', '收工', '字面"称为一天",实为"收工"', 'work', 'Let''s call it a day and go home.', '我们收工回家吧。', 12),
  ('cut to the chase', 'idiom', '切入正题', '字面"切到追逐",实为"切入正题"', 'work', 'Let''s cut to the chase and discuss the main issue.', '我们切入正题,讨论主要问题。', 13),
  ('hit the sack', 'idiom', '去睡觉', '字面"打麻袋",实为"去睡觉"', 'daily_life', 'I''m tired; I''m going to hit the sack.', '我累了; 我要去睡觉。', 14),
  ('jump on the bandwagon', 'idiom', '跟风', '字面"跳上花车",实为"跟风"', 'culture', 'Everyone''s jumping on the bandwagon of this new trend.', '大家都在跟风这个新潮流。', 15),
  ('keep your chin up', 'idiom', '保持乐观', '字面"抬着下巴",实为"保持乐观"', 'health', 'Keep your chin up, things will get better.', '保持乐观,事情会好转的。', 16),
  ('on the ball', 'idiom', '机灵', '字面"在球上",实为"机灵"', 'work', 'She''s really on the ball with her new job.', '她在新工作中真是机灵。', 17),
  ('see eye to eye', 'idiom', '意见一致', '字面"眼对眼",实为"意见一致"', 'work', 'We don''t always see eye to eye on politics.', '我们在政治上并不总是意见一致。', 18),
  ('spill the beans', 'idiom', '透露秘密', '字面"洒豆子",实为"透露秘密"', 'daily_life', 'She accidentally spilled the beans about the surprise.', '她不小心透露了惊喜的秘密。', 19),
  ('take it with a grain of salt', 'idiom', '持保留态度', '字面"带一粒盐",实为"持保留态度"', 'news', 'You should take his advice with a grain of salt.', '你应该对他的建议持保留态度。', 20),
  ('the last straw', 'idiom', '最后一根稻草', '字面"最后一根稻草",实为"忍无可忍"', 'daily_life', 'Her rude comment was the last straw for him.', '她的无礼评论是他忍无可忍的最后一根稻草。', 21),
  ('throw in the towel', 'idiom', '认输', '字面"扔毛巾",实为"认输"', 'work', 'After several failures, he decided to throw in the towel.', '几次失败后,他决定认输。', 22),
  ('under the radar', 'idiom', '不被注意', '字面"在雷达下",实为"不被注意"', 'work', 'The new policy went under the radar for months.', '新政策几个月来不被注意。', 23),
  ('bend over backwards', 'idiom', '竭尽全力', '字面"向后弯曲",实为"竭尽全力"', 'work', 'She bent over backwards to help him succeed.', '她竭尽全力帮助他成功。', 24),
  ('cut corners', 'idiom', '偷工减料', '字面"切角",实为"偷工减料"', 'work', 'Don''t cut corners on this project.', '不要在这个项目上偷工减料。', 25),
  ('in the same boat', 'idiom', '同病相怜', '字面"在同一条船上",实为"同病相怜"', 'daily_life', 'We''re all in the same boat with this deadline.', '我们在这个截止日期上同病相怜。', 26),
  ('off the hook', 'idiom', '脱身', '字面"从钩子上脱下",实为"脱身"', 'daily_life', 'You''re off the hook for the mistake this time.', '这次的错误你脱身了。', 27),
  ('over the moon', 'idiom', '欣喜若狂', '字面"在月亮上",实为"欣喜若狂"', 'daily_life', 'She was over the moon about her promotion.', '她对升职欣喜若狂。', 28),
  ('play it by ear', 'idiom', '见机行事', '字面"用耳朵演奏",实为"见机行事"', 'daily_life', 'Let''s play it by ear and decide later.', '我们见机行事,稍后再决定。', 29),
  ('rock the boat', 'idiom', '捣乱', '字面"摇船",实为"捣乱"', 'work', 'Don''t rock the boat by making changes now.', '现在不要捣乱做出改变。', 30),
  ('sit on the fence', 'idiom', '骑墙观望', '字面"坐在篱笆上",实为"骑墙观望"', 'work', 'He''s sitting on the fence about the new policy.', '他对新政策持观望态度。', 31),
  ('walk on eggshells', 'idiom', '小心翼翼', '字面"走在蛋壳上",实为"小心翼翼"', 'daily_life', 'I''ve been walking on eggshells around him lately.', '我最近一直对他小心翼翼。', 32),
  ('water under the bridge', 'idiom', '过去的事', '字面"桥下的水",实为"过去的事"', 'daily_life', 'Our past arguments are water under the bridge.', '我们的过去争吵已成过去的事。', 33),
  ('beat around the bush', 'idiom', '拐弯抹角', '字面"在灌木丛周围打",实为"拐弯抹角"', 'work', 'Stop beating around the bush and get to the point.', '别拐弯抹角,直入正题。', 34),
  ('bite off more than you can chew', 'idiom', '贪多嚼不烂', '字面"咬超过能嚼的",实为"贪多嚼不烂"', 'work', 'Don''t bite off more than you can chew with this project.', '别在这个项目上贪多嚼不烂。', 35),
  ('blow off steam', 'idiom', '发泄情绪', '字面"放掉蒸汽",实为"发泄情绪"', 'health', 'He goes jogging to blow off steam after work.', '他下班后去慢跑发泄情绪。', 36),
  ('break the bank', 'idiom', '倾家荡产', '字面"破坏银行",实为"倾家荡产"', 'daily_life', 'The vacation won''t break the bank.', '这次度假不会让你倾家荡产。', 37),
  ('cut the mustard', 'idiom', '符合要求', '字面"切芥末",实为"符合要求"', 'work', 'He didn''t cut the mustard for the team.', '他没有达到团队的要求。', 38),
  ('get a second wind', 'idiom', '恢复活力', '字面"得到第二阵风",实为"恢复活力"', 'health', 'After a short break, I got a second wind.', '短暂休息后,我恢复了活力。', 39),
  ('go down in flames', 'idiom', '彻底失败', '字面"在火焰中下沉",实为"彻底失败"', 'daily_life', 'The plan went down in flames after the first week.', '计划在第一周彻底失败了。', 40),
  ('hit the ground running', 'idiom', '迅速开始', '字面"跑着落地",实为"迅速开始"', 'work', 'He hit the ground running with the new project.', '他迅速开始了新项目。', 41),
  ('jump the gun', 'idiom', '操之过急', '字面"跳过枪",实为"操之过急"', 'daily_life', 'Don''t jump the gun and make decisions now.', '不要操之过急,现在做决定。', 42),
  ('hit the books', 'idiom', '用功读书', '字面"打书",实为"用功读书"', 'education', 'I need to hit the books for tomorrow''s exam.', '我得为明天的考试用功读书。', 43),
  ('break a leg', 'idiom', '祝好运', '字面"摔断腿",实为"祝好运"', 'culture', 'Break a leg at your performance tonight!', '祝你今晚演出好运！', 44),
  ('under the gun', 'idiom', '压力之下', '字面"在枪下",实为"压力之下"', 'work', 'I''m under the gun to finish this report by noon.', '我得在中午前完成这份报告,压力很大。', 45),
  ('hit the jackpot', 'idiom', '中大奖', '字面"中头奖",实为"获得巨大成功"', 'daily_life', 'She hit the jackpot with her new book deal.', '她的新书合同取得了巨大成功。', 46),
  ('kick the bucket', 'idiom', '去世', '字面"踢桶",实为"去世"', 'culture', 'He kicked the bucket at a ripe old age.', '他在高龄时去世。', 47),
  ('hit the roof', 'idiom', '大发雷霆', '字面"撞到屋顶",实为"大发雷霆"', 'daily_life', 'My dad hit the roof when he saw the dent in the car.', '我爸爸看到车上的凹痕时大发雷霆。', 48),
  ('burn bridges', 'idiom', '断绝关系', '字面"烧桥",实为"断绝关系"', 'work', 'Don''t burn bridges with your former employer.', '不要与前雇主断绝关系。', 49),
  ('hit the road', 'idiom', '上路', '字面"打路",实为"上路"', 'travel', 'We should hit the road early to avoid traffic.', '我们应该早点上路以避免交通拥堵。', 50)
ON CONFLICT (lower(chunk)) DO UPDATE
  SET type = EXCLUDED.type, translation_zh = EXCLUDED.translation_zh,
      literal_trap = EXCLUDED.literal_trap, scene = EXCLUDED.scene,
      example_en = EXCLUDED.example_en, example_zh = EXCLUDED.example_zh,
      freq_rank = EXCLUDED.freq_rank, updated_at = now();

SELECT 'AFTER' AS stage, count(*) FILTER (WHERE type='idiom') AS idioms, count(*) AS total FROM vocab_chunks;

-- ── count-validate:四行都必须是 t,否则 ROLLBACK ──
SELECT 'idiom 条数 = 50' AS expect,
       (SELECT count(*) FROM vocab_chunks WHERE type='idiom') = 50 AS ok
UNION ALL
SELECT '每条 idiom 都有 literal_trap',
       NOT EXISTS (SELECT 1 FROM vocab_chunks WHERE type='idiom'
                    AND (literal_trap IS NULL OR btrim(literal_trap)=''))
UNION ALL
SELECT 'literal_trap 都点出了字面义与实际义',
       NOT EXISTS (SELECT 1 FROM vocab_chunks WHERE type='idiom'
                    AND NOT (literal_trap LIKE '%字面%' AND literal_trap ~ '实为|实指|实际'))
UNION ALL
SELECT 'D 段那 100 条词块没被动过',
       (SELECT count(*) FROM vocab_chunks WHERE type <> 'idiom') = 100;

COMMIT;
