-- 词汇内容(增量:只补库里还缺释义的词):40 词 · 120 例句
-- 生成: node scripts/vocab/generate-content.mjs --bank=cet6 --emit-sql --delta
-- 模型: gpt-4o-mini · 九道机器闸门全过
-- ⚠️ 由 Aaron 执行。脚本本身从不写库。
--
-- 幂等: vocab_words 按 lower(headword) 定位更新;
--       vocab_examples 走 ON CONFLICT (word_id, sort_order)(索引 vocab_examples_word_id_sort_order_key)。
--       重复跑只会覆盖同一批内容,不产生重复行。
--
-- scene(academic/news/daily_life/... 共 10 类)既用于生成期的 g5/g6 闸门判定,
-- 也一并入库,将来可按场景筛例句。

BEGIN;

-- scene 列的安全网。2026-08-03 出这份 SQL 时已实测确认 vocab_examples.scene
-- 存在(text, nullable),所以这句就是个 no-op,留着是防回滚/换环境时缺列。
ALTER TABLE vocab_examples ADD COLUMN IF NOT EXISTS scene text;

SELECT 'BEFORE' AS stage,
       (SELECT count(*) FROM vocab_words WHERE def_zh IS NOT NULL) AS words_with_def,
       (SELECT count(*) FROM vocab_examples) AS examples;

-- ① 释义 / 音标
UPDATE vocab_words w
   SET ipa        = v.ipa,
       def_zh     = v.def_zh,
       def_en     = v.def_en,
       updated_at = now()
  FROM (VALUES
  ('church', '/tʃɜːrtʃ/', '教堂', 'A building used for public Christian worship.'),
  ('yard', '/jɑrd/', '院子', 'An area of land surrounding a house.'),
  ('capital', '/ˈkæp.ɪ.təl/', '首都；资金', 'The city where a government is based or financial resources.'),
  ('culture', '/ˈkʌl.tʃər/', '文化', 'The ideas, customs, and social behavior of a particular people.'),
  ('site', '/saɪt/', '场所', 'A location or place for a specific purpose.'),
  ('conduct', '/kənˈdʌkt/', '行为；举止', 'The manner in which a person behaves or acts.'),
  ('acre', '/ˈeɪ.kɚ/', '英亩', 'A unit of area equal to 4,840 square yards.'),
  ('pig', '/pɪɡ/', '猪', 'A domesticated animal raised for food or other products.'),
  ('fare', '/fɛr/', '费用；票价', 'The cost of a journey or transportation.'),
  ('respectively', '/rɪˈspɛk.tɪv.li/', '分别；各自', 'In the order mentioned; in the same sequence as before.'),
  ('ache', '/eɪk/', '疼痛；痛苦', 'A continuous or prolonged pain in a part of the body.'),
  ('statistics', '/stəˈtɪs.tɪks/', '统计；统计学', 'The study of collecting, analyzing, and interpreting numerical data.'),
  ('dorm', '/dɔrm/', '宿舍', 'A building providing sleeping accommodations for students.'),
  ('tub', '/tʌb/', '浴缸；桶', 'A round container used for holding liquids.'),
  ('mud', '/mʌd/', '泥；泥浆', 'Wet, soft earth that is mixed with water.'),
  ('lord', '/lɔrd/', '领主；贵族', 'A person of high rank or authority, often in feudal times.'),
  ('worm', '/wɜrm/', '虫；蠕虫', 'A long, slender, soft-bodied invertebrate.'),
  ('volt', '/voʊlt/', '伏特', 'Unit of electric potential or electromotive force.'),
  ('coastal', '/ˈkoʊ.stəl/', '沿海的', 'Relating to or situated by the sea coast.'),
  ('alongside', '/əˈlɔːŋ.saɪd/', '在旁边；与...一起', 'Next to or in conjunction with something or someone.'),
  ('momentum', '/moʊˈmɛn.təm/', '势头；动量', 'The quantity of motion an object has, depending on mass and velocity.'),
  ('caution', '/ˈkɔː.ʃən/', '小心；谨慎', 'Carefulness to avoid danger or mistakes.'),
  ('retention', '/rɪˈtɛn.ʃən/', '保留；保持', 'The act of keeping or retaining something.'),
  ('diagnostic', '/ˌdaɪ.əɡˈnɒs.tɪk/', '诊断的；诊断性', 'Related to the identification of a condition or problem.'),
  ('interim', '/ˈɪn.tə.rɪm/', '临时的；过渡的', 'Temporary or provisional, often serving a transitional purpose.'),
  ('confidential', '/ˌkɒn.fɪˈdɛn.ʃəl/', '秘密的；机密的', 'Not intended to be known or seen by others.'),
  ('pyjamas', '/pɪˈdʒɑː.məz/', '睡衣', 'Clothing worn for sleeping or lounging at home.'),
  ('kin', '/kɪn/', '亲属；家人', 'Relatives or family members, often used to denote blood relations.'),
  ('mast', '/mæst/', '桅杆；旗杆', 'A tall vertical structure used to support sails or flags.'),
  ('watery', '/ˈwɔː.tər.i/', '水状的；稀薄的', 'Containing a large amount of water; not solid or thick.'),
  ('thereof', '/ðɛəˈrʌv/', '因此；由此', 'As a result of that; from that point.'),
  ('excessively', '/ɪkˈsɛs.ɪv.li/', '过度地；过分地', 'In a manner that is more than is necessary or desirable.'),
  ('fright', '/fraɪt/', '惊恐', 'A feeling of fear or anxiety.'),
  ('commonwealth', '/ˈkɑː.mən.wɛlθ/', '联邦；英联邦', 'A political unit or community governed by elected representatives.'),
  ('henceforth', '/ˈhɛnsˌfɔrθ/', '从此以后', 'From this time on or from now on.'),
  ('therein', '/ðɛrˈɪn/', '其中；在其中', 'In that place or document; specifically stated within.'),
  ('telex', '/ˈtɛl.ɛks/', '电传机', 'A system for transmitting typed messages over telecommunication lines.'),
  ('opium', '/ˈoʊ.pi.əm/', '鸦片', 'A narcotic drug derived from the poppy plant.'),
  ('morality', '/məˈrælɪti/', '道德；道德观念', 'Beliefs about which kinds of human behaviour are right or wrong.'),
  ('mustard', '/ˈmʌstərd/', '芥末；芥菜', 'A spicy yellow paste eaten with meat, made from ground seeds.')
  ) AS v(headword, ipa, def_zh, def_en)
 WHERE lower(w.headword) = v.headword
   AND w.def_zh IS NULL;        -- ← 护栏:只填空,绝不覆盖库里已有的释义

-- ② 例句
INSERT INTO vocab_examples (word_id, sort_order, collocation, sentence, translation_zh, scene)
SELECT w.id, v.sort_order, v.collocation, v.sentence, v.translation_zh, v.scene
  FROM (VALUES
  ('church', 1, 'go to church', 'Many people go to church on Sundays.', '很多人周日去教堂。', 'daily_life'),
  ('church', 2, 'church service', 'The church service starts at ten in the morning.', '教堂的礼拜服务在早上十点开始。', 'culture'),
  ('church', 3, 'church choir', 'She sings in the church choir every week.', '她每周在教堂合唱团唱歌。', 'education'),
  ('yard', 1, 'front yard', 'She planted flowers in her front yard last spring.', '她在前院里种了花，去年春天。', 'daily_life'),
  ('yard', 2, 'back yard', 'The children played safely in the back yard every afternoon.', '孩子们每天下午在后院安全地玩耍。', 'environment'),
  ('yard', 3, 'yard sale', 'We organized a yard sale to declutter our home.', '我们举办了一个车库出售活动以清理家里。', 'culture'),
  ('capital', 1, 'capital city', 'Beijing is the capital city of China.', '北京是中国的首都。', 'travel'),
  ('capital', 2, 'capital investment', 'Companies need capital investment to grow and succeed.', '公司需要资金投资以发展和成功。', 'work'),
  ('capital', 3, 'human capital', 'Education improves a person''s human capital and skills.', '教育提高一个人的人力资本和技能。', 'education'),
  ('culture', 1, 'popular culture', 'Many young people enjoy popular culture today.', '今天，许多年轻人喜欢流行文化。', 'daily_life'),
  ('culture', 2, 'different cultures', 'We learn a lot from different cultures around the world.', '我们从世界各地不同的文化中学到很多。', 'education'),
  ('culture', 3, 'business culture', 'Understanding business culture is important for success.', '了解商业文化对成功很重要。', 'work'),
  ('site', 1, 'construction site', 'Workers are busy on the construction site today.', '今天工地上的工人们很忙。', 'work'),
  ('site', 2, 'historical site', 'They visited a famous historical site last weekend.', '他们上周末参观了一个著名的历史遗址。', 'culture'),
  ('site', 3, 'website site', 'You can find information on the official website site.', '你可以在官方网站上找到信息。', 'science_tech'),
  ('conduct', 1, 'conduct research', 'Scientists conduct research to find new medicines.', '科学家进行研究以寻找新药。', 'academic'),
  ('conduct', 2, 'conduct a survey', 'The team will conduct a survey next week.', '团队将在下周进行调查。', 'work'),
  ('conduct', 3, 'conduct oneself', 'You should conduct yourself with dignity and respect.', '你应该保持尊严和尊重的举止。', 'daily_life'),
  ('acre', 1, 'acres of land', 'Many farmers own hundreds of acres of land for crops.', '许多农民拥有数百英亩的土地用于种植作物。', 'environment'),
  ('acre', 2, 'a few acres', 'She bought a house with a few acres of garden.', '她买了一栋带有几英亩花园的房子。', 'daily_life'),
  ('acre', 3, 'one acre', 'One acre is approximately the size of a football field.', '一英亩大约是一个足球场的大小。', 'education'),
  ('pig', 1, 'pig farms', 'Farmers often raise large numbers of pigs on their farms.', '农民通常在他们的农场养殖大量的猪。', 'daily_life'),
  ('pig', 2, 'pig production', 'The country has increased its pig production in recent years.', '该国近年来增加了猪的生产。', 'work'),
  ('pig', 3, 'wild pigs', 'Wild pigs can be found in many forests across the country.', '野猪可以在全国许多森林中找到。', 'environment'),
  ('fare', 1, 'fare price', 'Travelers often compare fare prices to find the best deal.', '旅客经常比较票价以寻找最优惠的交易。', 'travel'),
  ('fare', 2, 'fare poorly', 'Many students fare poorly on standardized tests due to various factors.', '由于各种因素，许多学生在标准化考试中表现不佳。', 'news'),
  ('fare', 3, 'fare well', 'Students who study regularly tend to fare well in their exams.', '定期学习的学生通常在考试中表现良好。', 'education'),
  ('respectively', 1, 'respectively, the results showed improvement', 'Researchers found the drugs effective, respectively, in 60% and 75% of cases.', '研究人员发现这两种药物在60%和75%的病例中有效。', 'science_tech'),
  ('respectively', 2, 'the candidates, respectively', 'The two candidates finished the race in first and second place, respectively.', '这两位候选人分别获得了第一和第二名。', 'news'),
  ('respectively', 3, 'the students scored, respectively', 'Eighty percent and ninety percent of the students scored, respectively, on the test.', '这两组学生的考试成绩分别为80%和90%。', 'education'),
  ('ache', 1, 'chronic ache', 'Chronic aches can significantly affect one''s quality of life.', '慢性疼痛会严重影响生活质量。', 'health'),
  ('ache', 2, 'sharp ache', 'Suddenly, a sharp ache appeared in her lower back while lifting.', '她在搬东西时，突然感到下背部有剧烈的疼痛。', 'daily_life'),
  ('ache', 3, 'muscle ache', 'After a long day, many employees complain of muscle aches from sitting too long.', '经过漫长的一天，许多员工抱怨因久坐而感到肌肉疼痛。', 'work'),
  ('statistics', 1, 'statistics show', 'Statistics show that crime rates have decreased this year.', '统计显示，今年犯罪率有所下降。', 'news'),
  ('statistics', 2, 'official statistics', 'Researchers often rely on official statistics for accurate data.', '研究人员通常依赖官方统计数据以获取准确的信息。', 'academic'),
  ('statistics', 3, 'descriptive statistics', 'Descriptive statistics summarize the main features of a dataset.', '描述性统计总结了数据集的主要特征。', 'science_tech'),
  ('dorm', 1, 'living in a dorm', 'Many students enjoy living in a dorm during their college years.', '许多学生在大学期间喜欢住在宿舍里。', 'education'),
  ('dorm', 2, 'dorm activities', 'Residents organized various dorm activities to foster community engagement.', '居民们组织了各种宿舍活动，以促进社区参与。', 'daily_life'),
  ('dorm', 3, 'dorm regulations', 'Students must follow the dorm regulations set by the university administration.', '学生必须遵守学校管理部门制定的宿舍规定。', 'academic'),
  ('tub', 1, 'hot tub', 'Relaxing in the hot tub can relieve stress after a long day.', '在热水浴缸中放松能缓解一天的压力。', 'daily_life'),
  ('tub', 2, 'fill the tub', 'To ensure a comfortable bath, fill the tub with warm water first.', '为了确保舒适的沐浴，先将浴缸装满温水。', 'health'),
  ('tub', 3, 'tub of ice cream', 'She brought a tub of ice cream to the picnic for everyone to enjoy.', '她带了一桶冰淇淋去野餐，供大家享用。', 'culture'),
  ('mud', 1, 'play in the mud', 'Children love to play in the mud after it rains.', '下雨后，孩子们喜欢在泥里玩。', 'daily_life'),
  ('mud', 2, 'mud slides', 'Heavy rain can cause dangerous mud slides in the mountains.', '大雨可能会导致山区发生危险的泥石流。', 'environment'),
  ('mud', 3, 'mud bath', 'Many spas offer a relaxing mud bath for skin treatment.', '许多水疗中心提供放松的泥浴，以进行皮肤护理。', 'health'),
  ('lord', 1, 'lord of the manor', 'The lord of the manor held great power over the local villagers.', '庄园的领主对当地村民拥有很大的权力。', 'daily_life'),
  ('lord', 2, 'lord it over', 'She tends to lord it over her coworkers, expecting them to follow her orders.', '她常常在同事面前摆架子，期望他们听从她的命令。', 'work'),
  ('lord', 3, 'lordly manner', 'He spoke with a lordly manner that impressed everyone at the gala.', '他以一种贵族气派的方式讲话，给晚会上的每个人留下了深刻的印象。', 'culture'),
  ('worm', 1, 'fishing for worms', 'Children enjoy fishing for worms in the backyard.', '孩子们喜欢在后院钓虫。', 'daily_life'),
  ('worm', 2, 'intestinal worms', 'Many people around the world suffer from intestinal worms.', '世界上许多人都受到肠道虫的困扰。', 'health'),
  ('worm', 3, 'worm species', 'Researchers discovered new worm species in the deep ocean.', '研究人员在深海发现了新的虫类。', 'science_tech'),
  ('volt', 1, '230 volts', 'The device requires a power supply of 230 volts to operate efficiently.', '该设备需要230伏特的电源才能高效运作。', 'science_tech'),
  ('volt', 2, 'volts of power', 'Engineers measured the volts of power flowing through the circuit during the test.', '工程师在测试期间测量了电路中流动的电压。', 'work'),
  ('volt', 3, 'high voltage volt', 'High voltage volt systems are crucial for efficient power transmission in modern grids.', '高电压伏特系统对于现代电网高效输电至关重要。', 'academic'),
  ('coastal', 1, 'coastal areas', 'Many species thrive in coastal areas where land meets the sea.', '许多物种在陆地与海洋交汇的沿海地区繁衍生息。', 'environment'),
  ('coastal', 2, 'coastal cities', 'Coastal cities often attract tourists due to their beautiful beaches.', '沿海城市因美丽的海滩而常吸引游客。', 'travel'),
  ('coastal', 3, 'coastal ecosystems', 'Researchers study coastal ecosystems to understand their unique biodiversity.', '研究人员研究沿海生态系统以了解其独特的生物多样性。', 'science_tech'),
  ('alongside', 1, 'alongside others', 'Students often work alongside others to enhance their learning experience.', '学生们常常与他人一起学习，以提高他们的学习体验。', 'education'),
  ('alongside', 2, 'alongside research', 'The study was conducted alongside research in related fields.', '该研究是在相关领域的研究同时进行的。', 'science_tech'),
  ('alongside', 3, 'alongside developments', 'New policies were introduced alongside developments in technology.', '这些新政策是在科技发展的同时推出的。', 'news'),
  ('momentum', 1, 'gain momentum', 'The movement has gained significant momentum in recent months.', '这个运动在最近几个月取得了显著的势头。', 'news'),
  ('momentum', 2, 'build momentum', 'Teams can build momentum by celebrating small wins throughout a project.', '团队可以通过庆祝项目中的小胜利来建立势头。', 'work'),
  ('momentum', 3, 'momentum shifts', 'Momentum shifts can drastically alter the trajectory of a spacecraft.', '动量的变化可以极大地改变航天器的轨道。', 'science_tech'),
  ('caution', 1, 'exercise caution', 'Employees must exercise caution when using heavy machinery.', '员工在使用重型机械时必须小心。', 'work'),
  ('caution', 2, 'proceed with caution', 'Scientists warn to proceed with caution in climate change discussions.', '科学家警告在气候变化讨论中要谨慎行事。', 'news'),
  ('caution', 3, 'show caution', 'You should always show caution when crossing the street.', '过马路时你应该始终保持小心。', 'daily_life'),
  ('retention', 1, 'information retention', 'Students benefit from information retention when using effective study techniques.', '学生在使用有效的学习技巧时，受益于信息保留。', 'education'),
  ('retention', 2, 'memory retention', 'Research shows that sleep enhances memory retention significantly after learning.', '研究表明，睡眠显著提高学习后的记忆保留。', 'science_tech'),
  ('retention', 3, 'employee retention', 'Companies often implement benefits to improve employee retention rates and satisfaction.', '公司通常实施福利以提高员工保留率和满意度。', 'work'),
  ('diagnostic', 1, 'diagnostic tests', 'Healthcare providers use diagnostic tests to determine patient conditions.', '医疗提供者使用诊断测试来确定患者的病情。', 'health'),
  ('diagnostic', 2, 'diagnostic criteria', 'Researchers established diagnostic criteria for various diseases to aid in identification.', '研究人员制定了各种疾病的诊断标准以帮助识别。', 'science_tech'),
  ('diagnostic', 3, 'diagnostic tools', 'Teachers utilize diagnostic tools to assess students'' learning progress effectively.', '教师利用诊断工具有效评估学生的学习进展。', 'education'),
  ('interim', 1, 'interim report', 'Researchers submitted an interim report detailing their findings thus far.', '研究人员提交了临时报告，详细介绍了他们迄今的发现。', 'academic'),
  ('interim', 2, 'interim period', 'During the interim period, the company evaluated new strategies for growth.', '在过渡期间，公司评估了新的增长策略。', 'work'),
  ('interim', 3, 'interim management', 'The board appointed interim management to oversee operations until a new director is chosen.', '董事会任命临时管理层来监督运营，直到新主任被选出。', 'news'),
  ('confidential', 1, 'confidential information', 'Employees must handle confidential information with utmost care.', '员工必须非常小心地处理机密信息。', 'work'),
  ('confidential', 2, 'confidential report', 'I submitted a confidential report to the committee for review.', '我向委员会提交了一份机密报告以供审查。', 'academic'),
  ('confidential', 3, 'confidential meeting', 'We scheduled a confidential meeting to discuss sensitive issues.', '我们安排了一次机密会议以讨论敏感问题。', 'daily_life'),
  ('pyjamas', 1, 'wearing pyjamas', 'Children enjoy wearing pyjamas while watching cartoons on weekends.', '孩子们喜欢在周末看动画片时穿着睡衣。', 'daily_life'),
  ('pyjamas', 2, 'comfortable pyjamas', 'Wearing comfortable pyjamas can improve your sleep quality at night.', '穿着舒适的睡衣可以提高你晚上的睡眠质量。', 'health'),
  ('pyjamas', 3, 'fashionable pyjamas', 'Many people now choose fashionable pyjamas for their online video calls.', '许多人现在选择时尚的睡衣参加线上视频通话。', 'culture'),
  ('kin', 1, 'next of kin', 'In case of emergency, he designated his spouse as his next of kin.', '在紧急情况下，他指定配偶为他的直系亲属。', 'daily_life'),
  ('kin', 2, 'kin relationships', 'Many cultures emphasize the importance of kin relationships in community life.', '许多文化强调亲属关系在社区生活中的重要性。', 'culture'),
  ('kin', 3, 'kin by blood', 'Students learned about the concept of being kin by blood in family studies.', '学生在家庭研究中学习了血缘关系的概念。', 'education'),
  ('mast', 1, 'sail on a mast', 'Sailboats often rely on a sturdy mast to catch the wind effectively.', '帆船通常依靠坚固的桅杆有效捕风。', 'travel'),
  ('mast', 2, 'flag on a mast', 'During national holidays, many buildings display the flag proudly atop a mast.', '在国庆假期，许多建筑物都会自豪地在桅杆上悬挂国旗。', 'culture'),
  ('mast', 3, 'install a mast', 'Technicians will install a new mast to enhance the signal strength in the area.', '技术人员将安装新的桅杆，以增强该地区的信号强度。', 'work'),
  ('watery', 1, 'watery eyes', 'After crying, her eyes looked particularly watery and swollen.', '哭过后，她的眼睛看起来特别水汪汪而肿胀。', 'health'),
  ('watery', 2, 'watery grave', 'Many sailors feared ending up in a watery grave during storms at sea.', '许多水手害怕在海上暴风雨中结束在水下。', 'culture'),
  ('watery', 3, 'watery soup', 'The chef''s special today was a watery soup that lacked flavor and richness.', '今天厨师的特餐是一碗缺乏风味和浓郁的水状汤。', 'daily_life'),
  ('thereof', 1, 'in relation to thereof', 'Researchers presented evidence in relation to thereof in their recent study.', '研究人员在最近的研究中提出了与此相关的证据。', 'academic'),
  ('thereof', 2, 'the consequences thereof', 'The report outlined the consequences thereof for the local community.', '报告概述了对此社区的后果。', 'news'),
  ('thereof', 3, 'the legality thereof', 'Employees must understand the legality thereof in their contracts before signing.', '员工在签字前必须了解其合同的合法性。', 'work'),
  ('excessively', 1, 'excessively high standards', 'Students often face excessively high standards set by their teachers.', '学生们常常面临教师设定的过高标准。', 'academic'),
  ('excessively', 2, 'excessively strict rules', 'Employees may feel restricted by excessively strict rules at the workplace.', '员工可能会因为工作场所的过于严格的规则而感到受限。', 'work'),
  ('excessively', 3, 'excessively loud noises', 'People living nearby complained about excessively loud noises late at night.', '住在附近的人抱怨深夜的噪音过于响亮。', 'daily_life'),
  ('fright', 1, 'fright of my life', 'She experienced the fright of her life when the car suddenly stopped.', '当汽车突然停下时，她经历了她一生中最大的惊恐。', 'daily_life'),
  ('fright', 2, 'fright from a nightmare', 'Many children wake up in fright from a nightmare, needing reassurance from parents.', '许多孩子在噩梦中惊醒，需要父母的安慰。', 'health'),
  ('fright', 3, 'fright in the dark', 'He felt a fright in the dark as he heard strange noises outside.', '当他听到外面传来奇怪的声音时，他在黑暗中感到了一阵惊恐。', 'culture'),
  ('commonwealth', 1, 'commonwealth countries', 'Many commonwealth countries are collaborating on climate change initiatives.', '许多英联邦国家正在合作应对气候变化倡议。', 'news'),
  ('commonwealth', 2, 'commonwealth of nations', 'The commonwealth of nations promotes cooperation among its member states.', '英联邦促进其成员国之间的合作。', 'academic'),
  ('commonwealth', 3, 'commonwealth legislation', 'New commonwealth legislation aims to improve workers'' rights across Australia.', '新颁布的联邦立法旨在改善澳大利亚工人的权利。', 'work'),
  ('henceforth', 1, 'henceforth known as', 'The subject will henceforth be known as a critical issue in research.', '该主题从此以后将被称为研究中的一个关键问题。', 'academic'),
  ('henceforth', 2, 'henceforth applicable', 'This policy is henceforth applicable to all employees in the company.', '该政策从此适用于公司所有员工。', 'work'),
  ('henceforth', 3, 'henceforth required', 'Students are henceforth required to submit their assignments electronically.', '学生从此以后必须以电子方式提交作业。', 'education'),
  ('therein', 1, 'mentioned therein', 'Many researchers stress the importance of theories mentioned therein for future studies.', '许多研究人员强调，未来研究中提到的理论的重要性。', 'academic'),
  ('therein', 2, 'discussed therein', 'The policy changes discussed therein have sparked widespread debate among citizens.', '其中讨论的政策变更引发了公民间广泛的争论。', 'news'),
  ('therein', 3, 'included therein', 'All relevant documents included therein must be submitted by the deadline.', '所有包含在内的相关文件必须在截止日期前提交。', 'work'),
  ('telex', 1, 'telex machine', 'Many companies still rely on a telex machine for sending important documents.', '许多公司仍依赖电传机发送重要文件。', 'work'),
  ('telex', 2, 'telex communication', 'Effective telex communication was essential during the crisis to keep everyone informed.', '在危机期间，有效的电传通信对保持大家知情至关重要。', 'news'),
  ('telex', 3, 'international telex', 'An international telex service helped businesses connect across different countries easily.', '国际电传服务帮助企业轻松联系不同国家。', 'culture'),
  ('opium', 1, 'opium trade', 'The opium trade has significantly influenced the economy of certain regions in Asia.', '鸦片贸易对亚洲某些地区的经济产生了重大影响。', 'news'),
  ('opium', 2, 'opium addiction', 'Many individuals struggle with opium addiction, leading to severe health consequences.', '许多人面临鸦片成瘾问题，导致严重的健康后果。', 'health'),
  ('opium', 3, 'opium production', 'Historical records indicate that opium production was widespread in the 19th century.', '历史记录表明，19世纪鸦片生产十分普遍。', 'culture'),
  ('morality', 1, 'public morality', 'Public morality has changed a great deal over the past century.', '过去一个世纪里，公众的道德观念发生了很大变化。', 'culture'),
  ('morality', 2, 'question the morality', 'Many readers questioned the morality of the newspaper''s decision.', '许多读者质疑那家报纸这一决定的道德性。', 'news'),
  ('morality', 3, 'morality of war', 'Students debated the morality of war in their philosophy seminar.', '学生们在哲学研讨课上辩论战争的道德问题。', 'academic'),
  ('mustard', 1, 'mustard sauce', 'She spread mustard sauce on the sandwich before eating it.', '她在三明治上抹了芥末酱，然后才吃。', 'daily_life'),
  ('mustard', 2, 'Dijon mustard', 'French cooking often relies on Dijon mustard for extra flavor.', '法国菜常常靠第戎芥末来增添风味。', 'culture'),
  ('mustard', 3, 'mustard seeds', 'Farmers plant mustard seeds in early spring across these fields.', '农民在早春时节在这些田地里播种芥菜籽。', 'environment')
  ) AS v(headword, sort_order, collocation, sentence, translation_zh, scene)
  JOIN vocab_words w ON lower(w.headword) = v.headword
ON CONFLICT (word_id, sort_order) DO UPDATE
  SET collocation    = EXCLUDED.collocation,
      sentence       = EXCLUDED.sentence,
      translation_zh = EXCLUDED.translation_zh,
      scene          = EXCLUDED.scene;

SELECT 'AFTER' AS stage,
       (SELECT count(*) FROM vocab_words WHERE def_zh IS NOT NULL) AS words_with_def,
       (SELECT count(*) FROM vocab_examples) AS examples;

-- ── 断言:**只判本批这 40 个词**,不判全表 ────────────────────
-- ⚠️ 原来写的是 (SELECT count(*) FROM vocab_words WHERE def_zh IS NOT NULL) = 本批词数。
--    那在只有托福一个库时碰巧成立,多几个库以后必然为 f —— 全表里还有别的库的词。
--    判据必须锁在本批范围内(见 batch-validate-scope-to-batch)。
-- ⚠️ 用 DO + RAISE:断言不过**直接抛异常整笔回滚**,不靠人眼看那几个 t/f。
DO $gate$
DECLARE
  n_missing int; n_badcount int; n_badscene int;
BEGIN
  SELECT count(*) INTO n_missing
    FROM (VALUES
  ('church', '/tʃɜːrtʃ/', '教堂', 'A building used for public Christian worship.'),
  ('yard', '/jɑrd/', '院子', 'An area of land surrounding a house.'),
  ('capital', '/ˈkæp.ɪ.təl/', '首都；资金', 'The city where a government is based or financial resources.'),
  ('culture', '/ˈkʌl.tʃər/', '文化', 'The ideas, customs, and social behavior of a particular people.'),
  ('site', '/saɪt/', '场所', 'A location or place for a specific purpose.'),
  ('conduct', '/kənˈdʌkt/', '行为；举止', 'The manner in which a person behaves or acts.'),
  ('acre', '/ˈeɪ.kɚ/', '英亩', 'A unit of area equal to 4,840 square yards.'),
  ('pig', '/pɪɡ/', '猪', 'A domesticated animal raised for food or other products.'),
  ('fare', '/fɛr/', '费用；票价', 'The cost of a journey or transportation.'),
  ('respectively', '/rɪˈspɛk.tɪv.li/', '分别；各自', 'In the order mentioned; in the same sequence as before.'),
  ('ache', '/eɪk/', '疼痛；痛苦', 'A continuous or prolonged pain in a part of the body.'),
  ('statistics', '/stəˈtɪs.tɪks/', '统计；统计学', 'The study of collecting, analyzing, and interpreting numerical data.'),
  ('dorm', '/dɔrm/', '宿舍', 'A building providing sleeping accommodations for students.'),
  ('tub', '/tʌb/', '浴缸；桶', 'A round container used for holding liquids.'),
  ('mud', '/mʌd/', '泥；泥浆', 'Wet, soft earth that is mixed with water.'),
  ('lord', '/lɔrd/', '领主；贵族', 'A person of high rank or authority, often in feudal times.'),
  ('worm', '/wɜrm/', '虫；蠕虫', 'A long, slender, soft-bodied invertebrate.'),
  ('volt', '/voʊlt/', '伏特', 'Unit of electric potential or electromotive force.'),
  ('coastal', '/ˈkoʊ.stəl/', '沿海的', 'Relating to or situated by the sea coast.'),
  ('alongside', '/əˈlɔːŋ.saɪd/', '在旁边；与...一起', 'Next to or in conjunction with something or someone.'),
  ('momentum', '/moʊˈmɛn.təm/', '势头；动量', 'The quantity of motion an object has, depending on mass and velocity.'),
  ('caution', '/ˈkɔː.ʃən/', '小心；谨慎', 'Carefulness to avoid danger or mistakes.'),
  ('retention', '/rɪˈtɛn.ʃən/', '保留；保持', 'The act of keeping or retaining something.'),
  ('diagnostic', '/ˌdaɪ.əɡˈnɒs.tɪk/', '诊断的；诊断性', 'Related to the identification of a condition or problem.'),
  ('interim', '/ˈɪn.tə.rɪm/', '临时的；过渡的', 'Temporary or provisional, often serving a transitional purpose.'),
  ('confidential', '/ˌkɒn.fɪˈdɛn.ʃəl/', '秘密的；机密的', 'Not intended to be known or seen by others.'),
  ('pyjamas', '/pɪˈdʒɑː.məz/', '睡衣', 'Clothing worn for sleeping or lounging at home.'),
  ('kin', '/kɪn/', '亲属；家人', 'Relatives or family members, often used to denote blood relations.'),
  ('mast', '/mæst/', '桅杆；旗杆', 'A tall vertical structure used to support sails or flags.'),
  ('watery', '/ˈwɔː.tər.i/', '水状的；稀薄的', 'Containing a large amount of water; not solid or thick.'),
  ('thereof', '/ðɛəˈrʌv/', '因此；由此', 'As a result of that; from that point.'),
  ('excessively', '/ɪkˈsɛs.ɪv.li/', '过度地；过分地', 'In a manner that is more than is necessary or desirable.'),
  ('fright', '/fraɪt/', '惊恐', 'A feeling of fear or anxiety.'),
  ('commonwealth', '/ˈkɑː.mən.wɛlθ/', '联邦；英联邦', 'A political unit or community governed by elected representatives.'),
  ('henceforth', '/ˈhɛnsˌfɔrθ/', '从此以后', 'From this time on or from now on.'),
  ('therein', '/ðɛrˈɪn/', '其中；在其中', 'In that place or document; specifically stated within.'),
  ('telex', '/ˈtɛl.ɛks/', '电传机', 'A system for transmitting typed messages over telecommunication lines.'),
  ('opium', '/ˈoʊ.pi.əm/', '鸦片', 'A narcotic drug derived from the poppy plant.'),
  ('morality', '/məˈrælɪti/', '道德；道德观念', 'Beliefs about which kinds of human behaviour are right or wrong.'),
  ('mustard', '/ˈmʌstərd/', '芥末；芥菜', 'A spicy yellow paste eaten with meat, made from ground seeds.')
    ) AS v(headword, ipa, def_zh, def_en)
    LEFT JOIN vocab_words w ON lower(w.headword) = v.headword
   WHERE w.id IS NULL OR w.def_zh IS NULL;

  SELECT count(*) INTO n_badcount
    FROM (VALUES
  ('church', '/tʃɜːrtʃ/', '教堂', 'A building used for public Christian worship.'),
  ('yard', '/jɑrd/', '院子', 'An area of land surrounding a house.'),
  ('capital', '/ˈkæp.ɪ.təl/', '首都；资金', 'The city where a government is based or financial resources.'),
  ('culture', '/ˈkʌl.tʃər/', '文化', 'The ideas, customs, and social behavior of a particular people.'),
  ('site', '/saɪt/', '场所', 'A location or place for a specific purpose.'),
  ('conduct', '/kənˈdʌkt/', '行为；举止', 'The manner in which a person behaves or acts.'),
  ('acre', '/ˈeɪ.kɚ/', '英亩', 'A unit of area equal to 4,840 square yards.'),
  ('pig', '/pɪɡ/', '猪', 'A domesticated animal raised for food or other products.'),
  ('fare', '/fɛr/', '费用；票价', 'The cost of a journey or transportation.'),
  ('respectively', '/rɪˈspɛk.tɪv.li/', '分别；各自', 'In the order mentioned; in the same sequence as before.'),
  ('ache', '/eɪk/', '疼痛；痛苦', 'A continuous or prolonged pain in a part of the body.'),
  ('statistics', '/stəˈtɪs.tɪks/', '统计；统计学', 'The study of collecting, analyzing, and interpreting numerical data.'),
  ('dorm', '/dɔrm/', '宿舍', 'A building providing sleeping accommodations for students.'),
  ('tub', '/tʌb/', '浴缸；桶', 'A round container used for holding liquids.'),
  ('mud', '/mʌd/', '泥；泥浆', 'Wet, soft earth that is mixed with water.'),
  ('lord', '/lɔrd/', '领主；贵族', 'A person of high rank or authority, often in feudal times.'),
  ('worm', '/wɜrm/', '虫；蠕虫', 'A long, slender, soft-bodied invertebrate.'),
  ('volt', '/voʊlt/', '伏特', 'Unit of electric potential or electromotive force.'),
  ('coastal', '/ˈkoʊ.stəl/', '沿海的', 'Relating to or situated by the sea coast.'),
  ('alongside', '/əˈlɔːŋ.saɪd/', '在旁边；与...一起', 'Next to or in conjunction with something or someone.'),
  ('momentum', '/moʊˈmɛn.təm/', '势头；动量', 'The quantity of motion an object has, depending on mass and velocity.'),
  ('caution', '/ˈkɔː.ʃən/', '小心；谨慎', 'Carefulness to avoid danger or mistakes.'),
  ('retention', '/rɪˈtɛn.ʃən/', '保留；保持', 'The act of keeping or retaining something.'),
  ('diagnostic', '/ˌdaɪ.əɡˈnɒs.tɪk/', '诊断的；诊断性', 'Related to the identification of a condition or problem.'),
  ('interim', '/ˈɪn.tə.rɪm/', '临时的；过渡的', 'Temporary or provisional, often serving a transitional purpose.'),
  ('confidential', '/ˌkɒn.fɪˈdɛn.ʃəl/', '秘密的；机密的', 'Not intended to be known or seen by others.'),
  ('pyjamas', '/pɪˈdʒɑː.məz/', '睡衣', 'Clothing worn for sleeping or lounging at home.'),
  ('kin', '/kɪn/', '亲属；家人', 'Relatives or family members, often used to denote blood relations.'),
  ('mast', '/mæst/', '桅杆；旗杆', 'A tall vertical structure used to support sails or flags.'),
  ('watery', '/ˈwɔː.tər.i/', '水状的；稀薄的', 'Containing a large amount of water; not solid or thick.'),
  ('thereof', '/ðɛəˈrʌv/', '因此；由此', 'As a result of that; from that point.'),
  ('excessively', '/ɪkˈsɛs.ɪv.li/', '过度地；过分地', 'In a manner that is more than is necessary or desirable.'),
  ('fright', '/fraɪt/', '惊恐', 'A feeling of fear or anxiety.'),
  ('commonwealth', '/ˈkɑː.mən.wɛlθ/', '联邦；英联邦', 'A political unit or community governed by elected representatives.'),
  ('henceforth', '/ˈhɛnsˌfɔrθ/', '从此以后', 'From this time on or from now on.'),
  ('therein', '/ðɛrˈɪn/', '其中；在其中', 'In that place or document; specifically stated within.'),
  ('telex', '/ˈtɛl.ɛks/', '电传机', 'A system for transmitting typed messages over telecommunication lines.'),
  ('opium', '/ˈoʊ.pi.əm/', '鸦片', 'A narcotic drug derived from the poppy plant.'),
  ('morality', '/məˈrælɪti/', '道德；道德观念', 'Beliefs about which kinds of human behaviour are right or wrong.'),
  ('mustard', '/ˈmʌstərd/', '芥末；芥菜', 'A spicy yellow paste eaten with meat, made from ground seeds.')
    ) AS v(headword, ipa, def_zh, def_en)
    JOIN vocab_words w ON lower(w.headword) = v.headword
   WHERE (SELECT count(*) FROM vocab_examples e WHERE e.word_id = w.id) <> 3;

  SELECT count(*) INTO n_badscene
    FROM (VALUES
  ('church', '/tʃɜːrtʃ/', '教堂', 'A building used for public Christian worship.'),
  ('yard', '/jɑrd/', '院子', 'An area of land surrounding a house.'),
  ('capital', '/ˈkæp.ɪ.təl/', '首都；资金', 'The city where a government is based or financial resources.'),
  ('culture', '/ˈkʌl.tʃər/', '文化', 'The ideas, customs, and social behavior of a particular people.'),
  ('site', '/saɪt/', '场所', 'A location or place for a specific purpose.'),
  ('conduct', '/kənˈdʌkt/', '行为；举止', 'The manner in which a person behaves or acts.'),
  ('acre', '/ˈeɪ.kɚ/', '英亩', 'A unit of area equal to 4,840 square yards.'),
  ('pig', '/pɪɡ/', '猪', 'A domesticated animal raised for food or other products.'),
  ('fare', '/fɛr/', '费用；票价', 'The cost of a journey or transportation.'),
  ('respectively', '/rɪˈspɛk.tɪv.li/', '分别；各自', 'In the order mentioned; in the same sequence as before.'),
  ('ache', '/eɪk/', '疼痛；痛苦', 'A continuous or prolonged pain in a part of the body.'),
  ('statistics', '/stəˈtɪs.tɪks/', '统计；统计学', 'The study of collecting, analyzing, and interpreting numerical data.'),
  ('dorm', '/dɔrm/', '宿舍', 'A building providing sleeping accommodations for students.'),
  ('tub', '/tʌb/', '浴缸；桶', 'A round container used for holding liquids.'),
  ('mud', '/mʌd/', '泥；泥浆', 'Wet, soft earth that is mixed with water.'),
  ('lord', '/lɔrd/', '领主；贵族', 'A person of high rank or authority, often in feudal times.'),
  ('worm', '/wɜrm/', '虫；蠕虫', 'A long, slender, soft-bodied invertebrate.'),
  ('volt', '/voʊlt/', '伏特', 'Unit of electric potential or electromotive force.'),
  ('coastal', '/ˈkoʊ.stəl/', '沿海的', 'Relating to or situated by the sea coast.'),
  ('alongside', '/əˈlɔːŋ.saɪd/', '在旁边；与...一起', 'Next to or in conjunction with something or someone.'),
  ('momentum', '/moʊˈmɛn.təm/', '势头；动量', 'The quantity of motion an object has, depending on mass and velocity.'),
  ('caution', '/ˈkɔː.ʃən/', '小心；谨慎', 'Carefulness to avoid danger or mistakes.'),
  ('retention', '/rɪˈtɛn.ʃən/', '保留；保持', 'The act of keeping or retaining something.'),
  ('diagnostic', '/ˌdaɪ.əɡˈnɒs.tɪk/', '诊断的；诊断性', 'Related to the identification of a condition or problem.'),
  ('interim', '/ˈɪn.tə.rɪm/', '临时的；过渡的', 'Temporary or provisional, often serving a transitional purpose.'),
  ('confidential', '/ˌkɒn.fɪˈdɛn.ʃəl/', '秘密的；机密的', 'Not intended to be known or seen by others.'),
  ('pyjamas', '/pɪˈdʒɑː.məz/', '睡衣', 'Clothing worn for sleeping or lounging at home.'),
  ('kin', '/kɪn/', '亲属；家人', 'Relatives or family members, often used to denote blood relations.'),
  ('mast', '/mæst/', '桅杆；旗杆', 'A tall vertical structure used to support sails or flags.'),
  ('watery', '/ˈwɔː.tər.i/', '水状的；稀薄的', 'Containing a large amount of water; not solid or thick.'),
  ('thereof', '/ðɛəˈrʌv/', '因此；由此', 'As a result of that; from that point.'),
  ('excessively', '/ɪkˈsɛs.ɪv.li/', '过度地；过分地', 'In a manner that is more than is necessary or desirable.'),
  ('fright', '/fraɪt/', '惊恐', 'A feeling of fear or anxiety.'),
  ('commonwealth', '/ˈkɑː.mən.wɛlθ/', '联邦；英联邦', 'A political unit or community governed by elected representatives.'),
  ('henceforth', '/ˈhɛnsˌfɔrθ/', '从此以后', 'From this time on or from now on.'),
  ('therein', '/ðɛrˈɪn/', '其中；在其中', 'In that place or document; specifically stated within.'),
  ('telex', '/ˈtɛl.ɛks/', '电传机', 'A system for transmitting typed messages over telecommunication lines.'),
  ('opium', '/ˈoʊ.pi.əm/', '鸦片', 'A narcotic drug derived from the poppy plant.'),
  ('morality', '/məˈrælɪti/', '道德；道德观念', 'Beliefs about which kinds of human behaviour are right or wrong.'),
  ('mustard', '/ˈmʌstərd/', '芥末；芥菜', 'A spicy yellow paste eaten with meat, made from ground seeds.')
    ) AS v(headword, ipa, def_zh, def_en)
    JOIN vocab_words w ON lower(w.headword) = v.headword
    JOIN vocab_examples e ON e.word_id = w.id
   WHERE e.scene IS NULL
      OR e.scene NOT IN ('academic', 'news', 'daily_life', 'work', 'science_tech', 'health', 'environment', 'education', 'travel', 'culture');

  RAISE NOTICE '本批 40 词:缺释义 %,例句数不等于3 %,scene 非法 %',
    n_missing, n_badcount, n_badscene;

  IF n_missing > 0 OR n_badcount > 0 OR n_badscene > 0 THEN
    RAISE EXCEPTION '断言不过:缺释义 % · 例句数异常 % · scene 非法 % —— 已回滚,库里没有任何改动',
      n_missing, n_badcount, n_badscene;
  END IF;
END
$gate$;

COMMIT;
