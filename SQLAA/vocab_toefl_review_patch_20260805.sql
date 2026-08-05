-- 2026-08-05 审后定点补丁 —— 12 个词,36 条例句
-- 前置:5 片 content SQL 已跑完(你已确认 4471/13413 五条 validate 全过)。
-- 本补丁只覆盖这 12 个词,**不要重跑那 5 片**。
--
-- 改了什么:
--   ① softwood 释义误译「软木」(软木=cork)→「软材；针叶材」,连带 3 条译文里的同一误译
--   ② 义项超 8 字的解释句 8 条(honor / proceeding / diagnose / precede /
--      codify / baste / covetous / equivocate)—— 检测器阈值从 12 收紧到 8 后暴露的
--   ③ g13 同根搭配 3 条(immunity / dissenter / melodious),各只换违规的那一条例句
-- 对照件:REVIEWAA/vocab_toefl_review_fixes_20260805.md
-- ⚠️ 由 Aaron 执行。

BEGIN;

SELECT 'BEFORE' AS stage,
       (SELECT count(*) FROM vocab_words WHERE def_zh IS NOT NULL) AS words_with_def,
       (SELECT count(*) FROM vocab_examples) AS examples;

UPDATE vocab_words w
   SET def_zh = v.def_zh, updated_at = now()
  FROM (VALUES
  ('softwood', '软材；针叶材'),
  ('honor', '荣誉；尊敬'),
  ('proceeding', '诉讼程序；进程'),
  ('diagnose', '诊断'),
  ('precede', '先于；居先'),
  ('codify', '编纂；法典化'),
  ('baste', '涂油汁；粗缝'),
  ('covetous', '贪婪的；觊觎的'),
  ('equivocate', '模棱两可；含糊其辞'),
  ('immunity', '免疫力'),
  ('dissenter', '持不同政见者'),
  ('melodious', '悦耳的')
  ) AS v(headword, def_zh)
 WHERE lower(w.headword) = v.headword;

INSERT INTO vocab_examples (word_id, sort_order, collocation, sentence, translation_zh, scene)
SELECT w.id, v.sort_order, v.collocation, v.sentence, v.translation_zh, v.scene
  FROM (VALUES
  ('softwood', 1, 'softwood lumber', 'Construction companies frequently use softwood lumber for building residential homes.', '建筑公司经常使用针叶材木料来建造住宅。', 'work'),
  ('softwood', 2, 'softwood species', 'Researchers have identified several softwood species suitable for sustainable forestry practices.', '研究人员已确定几种适合可持续林业实践的针叶树种。', 'science_tech'),
  ('softwood', 3, 'softwood products', 'You can find various softwood products like furniture and flooring in local stores.', '你可以在当地商店找到各种针叶材制品，如家具和地板。', 'daily_life'),
  ('honor', 1, 'pay honor to', 'We pay honor to those who sacrificed their lives for freedom.', '我们向为自由献身的人致以荣誉。', 'culture'),
  ('honor', 2, 'in honor of', 'She organized a party in honor of her friend''s promotion.', '她为朋友的晋升举办了一个庆祝派对。', 'daily_life'),
  ('honor', 3, 'honor the commitment', 'They must honor the commitment to complete the project on time.', '他们必须遵守按时完成项目的承诺。', 'work'),
  ('proceeding', 1, 'legal proceeding', 'Legal proceedings against the company are ongoing and will conclude next month.', '对该公司的法律程序正在进行中，将于下个月结束。', 'news'),
  ('proceeding', 2, 'court proceeding', 'Court proceedings related to the case are expected to resume next week.', '与此案相关的法庭程序预计下周将恢复进行。', 'work'),
  ('proceeding', 3, 'academic proceeding', 'Academic proceedings for the conference will start early in the morning.', '会议的学术程序将在早晨开始进行。', 'education'),
  ('diagnose', 1, 'diagnose a problem', 'Technicians diagnose a problem to ensure the system works properly.', '技术人员会诊断问题，以确保系统正常运作。', 'work'),
  ('diagnose', 2, 'diagnose an illness', 'Doctors can diagnose an illness based on the patient''s symptoms.', '医生可以根据病人的症状诊断疾病。', 'health'),
  ('diagnose', 3, 'diagnose a condition', 'Researchers aim to diagnose a condition using advanced imaging techniques.', '研究人员旨在利用先进的成像技术诊断一种病症。', 'science_tech'),
  ('precede', 1, 'precede a discussion', 'Several important points should precede a discussion on this topic.', '在讨论这个主题之前，应该先提出几个重要观点。', 'academic'),
  ('precede', 2, 'precede the main event', 'Traditional rituals often precede the main event of the festival.', '传统仪式通常在节日的主要活动之前举行。', 'culture'),
  ('precede', 3, 'precede the findings', 'New theories must precede the findings of the experimental research.', '新理论必须在实验研究的发现之前提出。', 'science_tech'),
  ('codify', 1, 'codify laws', 'Legislators aim to codify laws that protect the environment for future generations.', '立法者旨在法典化保护环境的法律，以惠及未来几代人。', 'work'),
  ('codify', 2, 'codify standards', 'Researchers often seek to codify standards for ethical practices in their fields.', '研究人员通常寻求在他们的领域内法典化伦理实践标准。', 'academic'),
  ('codify', 3, 'codify principles', 'Communities should work together to codify principles that promote inclusivity and respect.', '社区应共同努力法典化促进包容和尊重的原则。', 'daily_life'),
  ('baste', 1, 'baste the turkey', 'When preparing the feast, many chefs baste the turkey to enhance its flavor.', '在准备盛宴时，许多厨师给火鸡涂抹肉汁以增强其风味。', 'daily_life'),
  ('baste', 2, 'baste with butter', 'Cooks often baste with butter to achieve a golden-brown crust on meats.', '厨师们经常用黄油涂抹，以使肉类表面呈现金黄色的外壳。', 'work'),
  ('baste', 3, 'baste the chicken', 'During the festival, it is customary to baste the chicken with garlic sauce while grilling.', '在节日期间，烤制时给鸡肉涂抹蒜蓉酱是传统做法。', 'culture'),
  ('covetous', 1, 'covetous behavior', 'People often exhibit covetous behavior when they see others with luxurious items.', '人们看到他人拥有奢华物品时，常常表现出贪婪的行为。', 'culture'),
  ('covetous', 2, 'covetous thoughts', 'He found it hard to ignore his covetous thoughts about his neighbor''s car.', '他发现很难忽视自己对邻居汽车的贪婪想法。', 'daily_life'),
  ('covetous', 3, 'covetous desires', 'In the corporate world, covetous desires can lead to unethical competition.', '在职场，贪婪的欲望可能导致不道德的竞争。', 'work'),
  ('equivocate', 1, 'equivocate on issues', 'Politicians often equivocate on issues to appeal to multiple voters simultaneously.', '政治家常常在问题上模棱两可，以同时吸引多个选民。', 'news'),
  ('equivocate', 2, 'equivocate about decisions', 'During the meeting, she decided to equivocate about decisions to maintain team morale.', '在会议期间，她决定对决策模棱两可，以维护团队士气。', 'work'),
  ('equivocate', 3, 'equivocate in interviews', 'Interviewers may find candidates who tend to equivocate in interviews less trustworthy.', '面试官可能会发现，在面试中倾向于模棱两可的候选人不那么值得信任。', 'daily_life'),
  ('immunity', 1, 'build immunity', 'Regular exposure to mild germs helps children build immunity against common infections.', '经常接触轻微病菌有助于儿童建立对常见感染的免疫力。', 'health'),
  ('immunity', 2, 'herd immunity', 'Achieving herd immunity requires a significant portion of the population to be vaccinated.', '实现群体免疫需要相当大比例的人口接种疫苗。', 'science_tech'),
  ('immunity', 3, 'immunity to disease', 'Children often develop immunity to disease after common illnesses like chickenpox.', '儿童在经历水痘等常见疾病后通常会获得免疫力。', 'daily_life'),
  ('dissenter', 1, 'dissenter''s views', 'Scholars often publish critiques to highlight a dissenter''s views on controversial topics.', '学者们经常发表批评，以凸显持不同政见者在争议话题上的观点。', 'academic'),
  ('dissenter', 2, 'a vocal dissenter', 'During the meeting, a vocal dissenter raised concerns about the proposed legislation''s impact.', '在会议期间，一位直言不讳的持不同政见者对提议立法的影响表示担忧。', 'news'),
  ('dissenter', 3, 'a lone dissenter', 'The film portrays a lone dissenter who challenged societal norms through his bold art.', '这部影片刻画了一位通过大胆艺术挑战社会规范的孤立持不同政见者。', 'culture'),
  ('melodious', 1, 'melodious tones', 'Birds often produce melodious tones that brighten up the morning.', '鸟儿常常发出悦耳的音调，让早晨更加明亮。', 'daily_life'),
  ('melodious', 2, 'melodious voice', 'She sang with a melodious voice, captivating everyone in the audience.', '她以悦耳的嗓音歌唱，吸引了在场的每一个人。', 'culture'),
  ('melodious', 3, 'a melodious tune', 'The teacher played a melodious tune to help students relax before the difficult exam.', '老师播放了一段悦耳的曲子，帮助学生在考试前放松。', 'education')
  ) AS v(headword, sort_order, collocation, sentence, translation_zh, scene)
  JOIN vocab_words w ON lower(w.headword) = v.headword
ON CONFLICT (word_id, sort_order) DO UPDATE
  SET collocation = EXCLUDED.collocation, sentence = EXCLUDED.sentence,
      translation_zh = EXCLUDED.translation_zh, scene = EXCLUDED.scene;

-- ── count-validate:五行都必须是 t,否则 ROLLBACK ──
SELECT '总量没变:4471 词' AS expect,
       (SELECT count(*) FROM vocab_words WHERE def_zh IS NOT NULL) = 4471 AS ok
UNION ALL
SELECT '总量没变:13413 例句',
       (SELECT count(*) FROM vocab_examples) = 13413
UNION ALL
SELECT '12 个词的 def_zh 已是新值',
       (SELECT count(*) FROM vocab_words WHERE def_zh IN ('软材；针叶材', '荣誉；尊敬', '诉讼程序；进程', '诊断', '先于；居先', '编纂；法典化', '涂油汁；粗缝', '贪婪的；觊觎的', '模棱两可；含糊其辞', '免疫力', '持不同政见者', '悦耳的')) >= 12
UNION ALL
SELECT 'softwood 不再是「软木」',
       (SELECT def_zh FROM vocab_words WHERE lower(headword)='softwood') = '软材；针叶材'
UNION ALL
SELECT '没有 def_zh 义项超 8 字',
       NOT EXISTS (
         SELECT 1 FROM vocab_words, unnest(string_to_array(def_zh, '；')) AS seg
          WHERE def_zh IS NOT NULL AND char_length(trim(seg)) > 8
       );

COMMIT;
