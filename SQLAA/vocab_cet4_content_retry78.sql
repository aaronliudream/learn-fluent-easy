-- cet4 补跑增量:重跑 119 个未过闸词,新通过 78 词
-- ⚠️ 只含**本次新通过**的词,已入库的 3693 词不在内(避免重复插入)。
-- 幂等:vocab_words 走 ON CONFLICT(lower(headword));例句先按 word_id 清再插。

BEGIN;

SELECT 'BEFORE' AS stage, count(*) AS 有释义的cet4词 FROM vocab_words w JOIN vocab_word_banks m ON m.word_id=w.id JOIN vocab_banks b ON b.id=m.bank_id WHERE b.code='cet4' AND w.def_zh IS NOT NULL;

UPDATE vocab_words SET ipa='/ˈfɔːr.mɚ/', def_zh='前任；以前的', def_en='Having previously occupied a position or role.', updated_at=now() WHERE lower(headword)=lower('former');
UPDATE vocab_words SET ipa='/ˈbɪz.nɪs/', def_zh='商业；生意', def_en='An organization or activity engaged in commercial, industrial, or professional activities.', updated_at=now() WHERE lower(headword)=lower('business');
UPDATE vocab_words SET ipa='/səˈsaɪ.ə.ti/', def_zh='社会', def_en='A group of individuals living together in an organized community.', updated_at=now() WHERE lower(headword)=lower('society');
UPDATE vocab_words SET ipa='/steɪt/', def_zh='状态；国家', def_en='A condition or situation of something.', updated_at=now() WHERE lower(headword)=lower('state');
UPDATE vocab_words SET ipa='/ˈsɜr.tən/', def_zh='某些的；特定的', def_en='Not having any doubt; known for sure.', updated_at=now() WHERE lower(headword)=lower('certain');
UPDATE vocab_words SET ipa='/əˈfɪʃ.əl/', def_zh='官方的；正式的', def_en='Relating to an authority or public body and its activities.', updated_at=now() WHERE lower(headword)=lower('official');
UPDATE vocab_words SET ipa='/kɔrt/', def_zh='法庭；法院', def_en='A place where legal cases are heard and decided.', updated_at=now() WHERE lower(headword)=lower('court');
UPDATE vocab_words SET ipa='/siːk/', def_zh='寻找', def_en='To try to find or obtain something.', updated_at=now() WHERE lower(headword)=lower('seek');
UPDATE vocab_words SET ipa='/ˈɔː.fɪ.sər/', def_zh='官员', def_en='A person in a position of authority or responsibility.', updated_at=now() WHERE lower(headword)=lower('officer');
UPDATE vocab_words SET ipa='/raɪz/', def_zh='上升；增加', def_en='To move from a lower position to a higher one.', updated_at=now() WHERE lower(headword)=lower('rise');
UPDATE vocab_words SET ipa='/faɪt/', def_zh='斗争；打斗', def_en='A violent confrontation between individuals or groups.', updated_at=now() WHERE lower(headword)=lower('fight');
UPDATE vocab_words SET ipa='/əˈkɜr/', def_zh='发生', def_en='To take place or happen.', updated_at=now() WHERE lower(headword)=lower('occur');
UPDATE vocab_words SET ipa='/əˈvɔɪd/', def_zh='避免', def_en='To keep away from something or someone.', updated_at=now() WHERE lower(headword)=lower('avoid');
UPDATE vocab_words SET ipa='/ˈfɪz.ɪ.kəl/', def_zh='身体的；物质的', def_en='Relating to the body or material things.', updated_at=now() WHERE lower(headword)=lower('physical');
UPDATE vocab_words SET ipa='/dɪˈskʌv.ɚ/', def_zh='发现', def_en='To find something or learn about it for the first time.', updated_at=now() WHERE lower(headword)=lower('discover');
UPDATE vocab_words SET ipa='/ˈkæn.dɪ.dət/', def_zh='候选人', def_en='A person vying for a position or honor.', updated_at=now() WHERE lower(headword)=lower('candidate');
UPDATE vocab_words SET ipa='/əˈfɛkt/', def_zh='影响', def_en='To have an influence on someone or something.', updated_at=now() WHERE lower(headword)=lower('affect');
UPDATE vocab_words SET ipa='/ɡʊdz/', def_zh='商品；货物', def_en='Items that are produced for sale or trade.', updated_at=now() WHERE lower(headword)=lower('goods');
UPDATE vocab_words SET ipa='/θruːˈaʊt/', def_zh='在整个期间；遍及', def_en='In every part or during the whole of a period.', updated_at=now() WHERE lower(headword)=lower('throughout');
UPDATE vocab_words SET ipa='/ɡæs/', def_zh='气体', def_en='A substance in a state that is neither solid nor liquid.', updated_at=now() WHERE lower(headword)=lower('gas');
UPDATE vocab_words SET ipa='/ɪˈfɛk.tɪv/', def_zh='有效的；有力的', def_en='Producing a desired result or intended effect.', updated_at=now() WHERE lower(headword)=lower('effective');
UPDATE vocab_words SET ipa='/ˈsʌf.ər/', def_zh='承受；忍受', def_en='To experience pain or discomfort.', updated_at=now() WHERE lower(headword)=lower('suffer');
UPDATE vocab_words SET ipa='/rɪˈkɔl/', def_zh='回忆；召回', def_en='To remember or bring back to mind something.', updated_at=now() WHERE lower(headword)=lower('recall');
UPDATE vocab_words SET ipa='/əˈdɪʃ.ən.əl/', def_zh='额外的；附加的', def_en='Not included in the usual or original amount.', updated_at=now() WHERE lower(headword)=lower('additional');
UPDATE vocab_words SET ipa='/ˈsloʊ.li/', def_zh='缓慢地', def_en='In a gradual or unhurried manner.', updated_at=now() WHERE lower(headword)=lower('slowly');
UPDATE vocab_words SET ipa='/sərˈvaɪv/', def_zh='生存', def_en='To continue to live or exist, especially in difficult conditions.', updated_at=now() WHERE lower(headword)=lower('survive');
UPDATE vocab_words SET ipa='/sprɛd/', def_zh='传播；散布', def_en='To distribute or extend over a wide area or range.', updated_at=now() WHERE lower(headword)=lower('spread');
UPDATE vocab_words SET ipa='/ˈtʃɛr.mən/', def_zh='主席', def_en='The head of a meeting or organization.', updated_at=now() WHERE lower(headword)=lower('chairman');
UPDATE vocab_words SET ipa='/prəˈmoʊt/', def_zh='促进；推广', def_en='To help something grow or develop successfully.', updated_at=now() WHERE lower(headword)=lower('promote');
UPDATE vocab_words SET ipa='/ɪnˈtɛl.ɪ.dʒəns/', def_zh='智力；智能', def_en='The ability to learn, understand, and think logically.', updated_at=now() WHERE lower(headword)=lower('intelligence');
UPDATE vocab_words SET ipa='/ˈɪn.flu.əns/', def_zh='影响', def_en='The capacity to have an effect on someone or something.', updated_at=now() WHERE lower(headword)=lower('influence');
UPDATE vocab_words SET ipa='/ˈlɜrnɪŋ/', def_zh='学习', def_en='The process of acquiring knowledge or skills through experience.', updated_at=now() WHERE lower(headword)=lower('learning');
UPDATE vocab_words SET ipa='/dəˈrɛkt/', def_zh='直接的', def_en='Not indirect; straight or straightaway; with no delay.', updated_at=now() WHERE lower(headword)=lower('direct');
UPDATE vocab_words SET ipa='/stɔrm/', def_zh='风暴；暴风雨', def_en='A violent disturbance of the atmosphere with strong winds and usually rain.', updated_at=now() WHERE lower(headword)=lower('storm');
UPDATE vocab_words SET ipa='/ˈhɪə.roʊ/', def_zh='英雄', def_en='A person admired for courage or noble qualities.', updated_at=now() WHERE lower(headword)=lower('hero');
UPDATE vocab_words SET ipa='/ˈpɛp.ər/', def_zh='胡椒', def_en='A pungent spice used to flavor food.', updated_at=now() WHERE lower(headword)=lower('pepper');
UPDATE vocab_words SET ipa='/ˈsaɪ.kəl/', def_zh='循环；周期', def_en='A series of events that regularly repeat in the same order.', updated_at=now() WHERE lower(headword)=lower('cycle');
UPDATE vocab_words SET ipa='/sænd/', def_zh='沙子；沙土', def_en='A loose granular substance made of finely divided rock.', updated_at=now() WHERE lower(headword)=lower('sand');
UPDATE vocab_words SET ipa='/əˈkʌm.pə.ni/', def_zh='陪伴；伴随', def_en='To go somewhere with someone as a companion.', updated_at=now() WHERE lower(headword)=lower('accompany');
UPDATE vocab_words SET ipa='/ˌnɛv.ər.ðəˈlɛs/', def_zh='尽管如此', def_en='In spite of that; however.', updated_at=now() WHERE lower(headword)=lower('nevertheless');
UPDATE vocab_words SET ipa='/ˈnɔːr.mə.li/', def_zh='通常；一般', def_en='In a usual or expected manner.', updated_at=now() WHERE lower(headword)=lower('normally');
UPDATE vocab_words SET ipa='/bɛntʃ/', def_zh='长凳；工作台', def_en='A long seat for several people to sit on.', updated_at=now() WHERE lower(headword)=lower('bench');
UPDATE vocab_words SET ipa='/feɪd/', def_zh='褪色；消失', def_en='To gradually become less visible or distinct.', updated_at=now() WHERE lower(headword)=lower('fade');
UPDATE vocab_words SET ipa='/iːz/', def_zh='轻松；舒适', def_en='A state of being comfortable or relaxed.', updated_at=now() WHERE lower(headword)=lower('ease');
UPDATE vocab_words SET ipa='/ˈtrædʒ.ə.di/', def_zh='悲剧', def_en='A very sad event or situation, often involving death.', updated_at=now() WHERE lower(headword)=lower('tragedy');
UPDATE vocab_words SET ipa='/ˈhjuː.mər/', def_zh='幽默，风趣', def_en='The quality of being amusing or entertaining.', updated_at=now() WHERE lower(headword)=lower('humour');
UPDATE vocab_words SET ipa='/ˈɑːrkɪtɛkʧər/', def_zh='建筑', def_en='The art or practice of designing buildings and other structures.', updated_at=now() WHERE lower(headword)=lower('architecture');
UPDATE vocab_words SET ipa='/klɔθ/', def_zh='布料', def_en='A fabric material used for making garments or other items.', updated_at=now() WHERE lower(headword)=lower('cloth');
UPDATE vocab_words SET ipa='/ˈsaʊθˌiːst/', def_zh='东南方；东南部', def_en='The direction between south and east on a compass.', updated_at=now() WHERE lower(headword)=lower('southeast');
UPDATE vocab_words SET ipa='/pɪt/', def_zh='坑；凹陷', def_en='A hole or cavity in the ground.', updated_at=now() WHERE lower(headword)=lower('pit');
UPDATE vocab_words SET ipa='/ˈkæn.dəl/', def_zh='蜡烛', def_en='A stick of wax with a wick for producing light.', updated_at=now() WHERE lower(headword)=lower('candle');
UPDATE vocab_words SET ipa='/ˈæn.sɛs.tər/', def_zh='祖先', def_en='A person from whom one is descended.', updated_at=now() WHERE lower(headword)=lower('ancestor');
UPDATE vocab_words SET ipa='/ˈlaɪ.ən/', def_zh='狮子', def_en='A large wild cat known for its strength and pride.', updated_at=now() WHERE lower(headword)=lower('lion');
UPDATE vocab_words SET ipa='/ˈpɪl.oʊ/', def_zh='枕头', def_en='A cushion used for resting the head in bed.', updated_at=now() WHERE lower(headword)=lower('pillow');
UPDATE vocab_words SET ipa='/ˈjuː.tɪ.laɪz/', def_zh='利用', def_en='To make practical and effective use of something.', updated_at=now() WHERE lower(headword)=lower('utilize');
UPDATE vocab_words SET ipa='/ˈkɒn.sɪ.kwənt.li/', def_zh='因此', def_en='As a result; in a manner that follows logically.', updated_at=now() WHERE lower(headword)=lower('consequently');
UPDATE vocab_words SET ipa='/ˈklæs.ɪ.faɪ/', def_zh='分类；归类', def_en='To arrange or organize into categories or groups.', updated_at=now() WHERE lower(headword)=lower('classify');
UPDATE vocab_words SET ipa='/ɪkˈskluː.sɪv.li/', def_zh='专门地；仅仅地', def_en='Only for a specific purpose or group, not shared.', updated_at=now() WHERE lower(headword)=lower('exclusively');
UPDATE vocab_words SET ipa='/bɪˈtreɪ/', def_zh='背叛', def_en='To be disloyal to someone or something.', updated_at=now() WHERE lower(headword)=lower('betray');
UPDATE vocab_words SET ipa='/ˈsoʊ.də/', def_zh='汽水', def_en='A carbonated soft drink, often flavored and sweetened.', updated_at=now() WHERE lower(headword)=lower('soda');
UPDATE vocab_words SET ipa='/məˈtʃʊr/', def_zh='成熟的；成人的', def_en='Fully developed or grown; adult or advanced in nature.', updated_at=now() WHERE lower(headword)=lower('mature');
UPDATE vocab_words SET ipa='/krʌst/', def_zh='外壳；表层', def_en='The outer layer or covering of something solid.', updated_at=now() WHERE lower(headword)=lower('crust');
UPDATE vocab_words SET ipa='/trænˈspɛr.ənt/', def_zh='透明的', def_en='Allowing light to pass through without obstruction or distortion.', updated_at=now() WHERE lower(headword)=lower('transparent');
UPDATE vocab_words SET ipa='/ˈsɛk.ənd.li/', def_zh='其次', def_en='In the second place; next in order or importance.', updated_at=now() WHERE lower(headword)=lower('secondly');
UPDATE vocab_words SET ipa='/ˈskɛr.sli/', def_zh='几乎不', def_en='Only just; barely; hardly at all.', updated_at=now() WHERE lower(headword)=lower('scarcely');
UPDATE vocab_words SET ipa='/ˈnjuː.klɪ.əs/', def_zh='细胞核', def_en='The central part of an atom or a cell containing genetic material.', updated_at=now() WHERE lower(headword)=lower('nucleus');
UPDATE vocab_words SET ipa='/ˈhæmˌbɜr.ɡɚ/', def_zh='汉堡包', def_en='A sandwich consisting of a cooked patty placed inside a sliced bun.', updated_at=now() WHERE lower(headword)=lower('hamburger');
UPDATE vocab_words SET ipa='/kənˈdʒʌŋk.ʃən/', def_zh='连词', def_en='A word used to connect clauses or sentences.', updated_at=now() WHERE lower(headword)=lower('conjunction');
UPDATE vocab_words SET ipa='/ˈeɪ.ti/', def_zh='八十', def_en='The numerical value representing eight tens or 80.', updated_at=now() WHERE lower(headword)=lower('eighty');
UPDATE vocab_words SET ipa='/baʊnd/', def_zh='界限；束缚', def_en='A limit or restriction on something.', updated_at=now() WHERE lower(headword)=lower('bound');
UPDATE vocab_words SET ipa='/ˈɡriː.di/', def_zh='贪婪的', def_en='Having an excessive desire for more than one needs or deserves.', updated_at=now() WHERE lower(headword)=lower('greedy');
UPDATE vocab_words SET ipa='/drɛd/', def_zh='恐惧', def_en='A strong feeling of fear or anxiety.', updated_at=now() WHERE lower(headword)=lower('dread');
UPDATE vocab_words SET ipa='/ˈhjuː.mər.əs/', def_zh='幽默的', def_en='Funny and able to make people laugh.', updated_at=now() WHERE lower(headword)=lower('humorous');
UPDATE vocab_words SET ipa='/ˈsɪm.pə.θaɪz/', def_zh='同情', def_en='To share feelings of sorrow or compassion for someone.', updated_at=now() WHERE lower(headword)=lower('sympathize');
UPDATE vocab_words SET ipa='/ˈsaɪtˌsiː.ɪŋ/', def_zh='观光；游览', def_en='The activity of visiting places for pleasure or interest.', updated_at=now() WHERE lower(headword)=lower('sightseeing');
UPDATE vocab_words SET ipa='/ˈkɛt.əl/', def_zh='水壶', def_en='A container for boiling water, usually with a spout.', updated_at=now() WHERE lower(headword)=lower('kettle');
UPDATE vocab_words SET ipa='/ˈleɪ.bər/', def_zh='劳动；工作', def_en='Physical or mental effort used to achieve a task.', updated_at=now() WHERE lower(headword)=lower('labour');
UPDATE vocab_words SET ipa='/brʊk/', def_zh='小溪；容忍', def_en='A small stream; to tolerate or allow something.', updated_at=now() WHERE lower(headword)=lower('brook');

-- 例句:先清后插,重复跑不会叠加
DELETE FROM vocab_examples WHERE word_id IN (SELECT id FROM vocab_words WHERE lower(headword) IN (lower('former'),lower('business'),lower('society'),lower('state'),lower('certain'),lower('official'),lower('court'),lower('seek'),lower('officer'),lower('rise'),lower('fight'),lower('occur'),lower('avoid'),lower('physical'),lower('discover'),lower('candidate'),lower('affect'),lower('goods'),lower('throughout'),lower('gas'),lower('effective'),lower('suffer'),lower('recall'),lower('additional'),lower('slowly'),lower('survive'),lower('spread'),lower('chairman'),lower('promote'),lower('intelligence'),lower('influence'),lower('learning'),lower('direct'),lower('storm'),lower('hero'),lower('pepper'),lower('cycle'),lower('sand'),lower('accompany'),lower('nevertheless'),lower('normally'),lower('bench'),lower('fade'),lower('ease'),lower('tragedy'),lower('humour'),lower('architecture'),lower('cloth'),lower('southeast'),lower('pit'),lower('candle'),lower('ancestor'),lower('lion'),lower('pillow'),lower('utilize'),lower('consequently'),lower('classify'),lower('exclusively'),lower('betray'),lower('soda'),lower('mature'),lower('crust'),lower('transparent'),lower('secondly'),lower('scarcely'),lower('nucleus'),lower('hamburger'),lower('conjunction'),lower('eighty'),lower('bound'),lower('greedy'),lower('dread'),lower('humorous'),lower('sympathize'),lower('sightseeing'),lower('kettle'),lower('labour'),lower('brook')));

INSERT INTO vocab_examples (word_id, sentence, translation_zh, collocation, scene, sort_order)
VALUES
((SELECT id FROM vocab_words WHERE lower(headword)=lower('former')), 'The former president visited the city last week.', '前任总统上周访问了这座城市。', 'former president', 'news', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('former')), 'She was a former student at this university.', '她曾是这所大学的学生。', 'former student', 'education', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('former')), 'My former colleague now works in another company.', '我的前同事现在在另一家公司工作。', 'former colleague', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('business')), 'Many people dream of running a business one day.', '许多人梦想有一天能够经营一项生意。', 'running a business', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('business')), 'She is looking for a business partner to help her expand.', '她正在寻找商业伙伴来帮助她扩展。', 'business partner', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('business')), 'We will have a business meeting next week about the project.', '我们下周将举行一次关于该项目的商务会议。', 'business meeting', 'academic', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('society')), 'Modern society often values technology and innovation highly.', '现代社会通常非常重视科技和创新。', 'modern society', 'culture', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('society')), 'The class structure in society affects many people''s opportunities.', '社会中的阶级结构影响许多人的机会。', 'class structure in society', 'education', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('society')), 'Society as a whole needs to address climate change issues.', '整个社会需要解决气候变化问题。', 'society as a whole', 'news', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('state')), 'The government declared a state of emergency yesterday.', '政府昨天宣布进入紧急状态。', 'state of emergency', 'news', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('state')), 'Please state your opinion on this matter clearly.', '请清楚地表达你对此事的看法。', 'state your opinion', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('state')), 'Employees must pay state tax by the end of April.', '员工必须在四月底之前缴纳州税。', 'state tax', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('certain')), 'We need to discuss certain aspects of the project.', '我们需要讨论这个项目的某些方面。', 'certain aspects', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('certain')), 'Students must follow certain rules in the library.', '学生在图书馆必须遵循某些规则。', 'certain rules', 'education', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('certain')), 'Certain types of data help improve our research.', '某些类型的数据有助于改进我们的研究。', 'certain types', 'science_tech', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('official')), 'They released an official report about the event.', '他们发布了关于该事件的官方报告。', 'official report', 'news', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('official')), 'Our manager gave an official statement to the press.', '我们的经理向媒体发表了官方声明。', 'official statement', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('official')), 'Please submit the official document for review soon.', '请尽快提交官方文件以供审查。', 'official document', 'academic', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('court')), 'Many people go to court to resolve disputes.', '许多人去法庭解决争端。', 'go to court', 'news', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('court')), 'She is working on a complex court case this week.', '她这周正在处理一个复杂的法庭案件。', 'court case', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('court')), 'He received a court order to pay his debts.', '他收到了法院命令支付他的债务。', 'court order', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('seek')), 'People often seek help when they feel stressed.', '人们在感到压力时经常寻求帮助。', 'seek help', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('seek')), 'Employees should seek advice from their managers regularly.', '员工应该定期向他们的经理寻求建议。', 'seek advice', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('seek')), 'Students must seek information for their research projects.', '学生必须为他们的研究项目寻找信息。', 'seek information', 'education', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('officer')), 'Many people trust their local police officer to help them.', '许多人相信他们的地方警官会帮助他们。', 'police officer', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('officer')), 'She works as a government officer in the health department.', '她在卫生部门担任政府官员。', 'government officer', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('officer')), 'The public officer announced new regulations yesterday after the meeting.', '公共官员在会议后昨天宣布了新规。', 'public officer', 'news', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('rise')), 'The rise in temperature affects our daily lives.', '气温的上升影响着我们的日常生活。', 'rise in temperature', 'science_tech', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('rise')), 'Many people worry about the rise in prices of food.', '许多人担心食品价格的上涨。', 'rise in prices', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('rise')), 'She will rise to the challenge and succeed.', '她会迎接挑战并取得成功。', 'rise to the challenge', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('fight')), 'Many people fight for their rights every day.', '许多人每天都在为自己的权利而斗争。', 'fight for your rights', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('fight')), 'Activists continue to fight against injustice in society.', '活动家们继续与社会中的不公正作斗争。', 'fight against injustice', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('fight')), 'Soldiers fight in a war to protect their country.', '士兵们在战争中战斗以保护他们的国家。', 'fight in a war', 'culture', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('occur')), 'Symptoms may occur suddenly and require immediate attention.', '症状可能会突然发生，并需要立即处理。', 'occur suddenly', 'health', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('occur')), 'Mistakes can occur frequently when learning a new skill.', '学习新技能时，错误可能会频繁发生。', 'occur frequently', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('occur')), 'These plants occur naturally in wet, tropical areas.', '这些植物自然生长在潮湿的热带地区。', 'occur naturally', 'environment', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('avoid')), 'People should avoid accidents by being careful while driving.', '人们在开车时应该小心，以避免事故。', 'avoid accidents', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('avoid')), 'Employees can avoid stress by managing their time effectively.', '员工可以通过有效管理时间来避免压力。', 'avoid stress', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('avoid')), 'You should avoid certain foods that trigger allergies.', '你应该避免某些引发过敏的食物。', 'avoid certain foods', 'health', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('physical')), 'Engaging in regular physical activity is important for health.', '定期进行身体活动对健康很重要。', 'physical activity', 'health', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('physical')), 'Many schools offer physical education classes for students.', '许多学校为学生提供体育课。', 'physical education', 'education', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('physical')), 'A doctor will perform a physical exam during your visit.', '医生会在你的就诊时进行身体检查。', 'physical exam', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('discover')), 'Children often discover new things when they play outside.', '孩子们在户外玩耍时常常发现新事物。', 'discover new things', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('discover')), 'Investigators will discover the truth behind the accident soon.', '调查员很快将发现事故背后的真相。', 'discover the truth', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('discover')), 'Travelers can discover new countries with unique cultures and traditions.', '旅行者可以发现拥有独特文化和传统的新国家。', 'discover new countries', 'travel', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('candidate')), 'We interviewed three job candidates for the position.', '我们面试了三个职位的候选人。', 'job candidate', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('candidate')), 'The presidential candidates debated important issues last night.', '总统候选人昨晚辩论了重要问题。', 'presidential candidate', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('candidate')), 'She is a potential candidate for the scholarship next year.', '她是明年奖学金的潜在候选人。', 'potential candidate', 'education', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('affect')), 'Weather conditions can affect the outcome of the game.', '天气状况会影响比赛的结果。', 'affect the outcome', 'news', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('affect')), 'What we eat can significantly affect our health.', '我们吃的食物能显著影响我们的健康。', 'affect our health', 'health', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('affect')), 'Pollution will negatively affect the environment around us.', '污染会对我们周围的环境产生负面影响。', 'affect the environment', 'environment', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('goods')), 'People buy consumer goods to meet their daily needs.', '人们购买消费品以满足日常需求。', 'consumer goods', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('goods')), 'The country increased taxes on imported goods last year.', '该国去年提高了进口商品的税收。', 'import goods', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('goods')), 'Efficient goods transportation is essential for business success.', '高效的货物运输对商业成功至关重要。', 'goods transportation', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('throughout')), 'People are busy throughout the day in the city.', '在城市里，人们在整天都很忙。', 'throughout the day', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('throughout')), 'Many cultures have changed throughout history in different ways.', '许多文化在历史上以不同方式发生了变化。', 'throughout history', 'academic', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('throughout')), 'Weather changes throughout the year in many regions.', '在许多地区，天气在整年中变化。', 'throughout the year', 'environment', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('gas')), 'Natural gas is a cleaner energy source than coal.', '天然气是一种比煤更清洁的能源。', 'natural gas', 'environment', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('gas')), 'Gas prices are rising due to increased demand and inflation.', '由于需求增加和通货膨胀，汽油价格正在上涨。', 'gas prices', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('gas')), 'We need to stop at a gas station to refuel the car.', '我们需要在加油站停下为汽车加油。', 'gas station', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('effective')), 'Good leaders use effective communication to inspire their teams.', '优秀的领导者通过有效的沟通来激励团队。', 'effective communication', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('effective')), 'Researchers are finding effective solutions for climate change issues.', '研究人员正在寻找应对气候变化问题的有效解决方案。', 'effective solutions', 'science_tech', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('effective')), 'Teachers need effective strategies to engage their students better.', '教师需要有效的策略来更好地吸引学生。', 'effective strategies', 'education', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('suffer')), 'Many people suffer from chronic pain every day.', '许多人每天都在忍受慢性疼痛。', 'suffer from pain', 'health', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('suffer')), 'Families often suffer a loss during natural disasters.', '家庭在自然灾害中常常遭受损失。', 'suffer a loss', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('suffer')), 'The community has suffered greatly after the recent storm.', '该社区在最近的风暴后遭受了重大损失。', 'suffer greatly', 'news', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('recall')), 'Students often struggle to recall information for exams.', '学生们常常难以回忆考试所需的信息。', 'recall information', 'academic', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('recall')), 'The company decided to recall a product due to safety concerns.', '由于安全问题，该公司决定召回一款产品。', 'recall a product', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('recall')), 'She tried to recall a memory from her childhood.', '她试图回忆起自己童年的一段记忆。', 'recall a memory', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('additional')), 'You should provide additional information for the project.', '你应该为这个项目提供额外的信息。', 'additional information', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('additional')), 'There may be additional costs for late payments.', '逾期付款可能会有额外费用。', 'additional costs', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('additional')), 'Students can access additional resources for their studies.', '学生可以获取额外的学习资源。', 'additional resources', 'education', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('slowly')), 'Sales are slowly improving over the last few months.', '销售在过去几个月里缓慢增长。', 'slowly improve', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('slowly')), 'The music slowly fades into silence at the end.', '音乐在结尾时缓慢消失在寂静中。', 'slowly fade', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('slowly')), 'Children slowly develop their language skills over time.', '孩子们的语言能力随着时间缓慢发展。', 'slowly develop', 'education', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('survive')), 'Animals can survive in the wild with little food.', '动物可以在野外很少食物的情况下生存。', 'survive in the wild', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('survive')), 'Many people survived a disaster after the earthquake.', '许多人在地震后幸存于灾难。', 'survive a disaster', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('survive')), 'Companies must survive difficult times to grow successfully.', '公司必须在困难时期生存才能成功发展。', 'survive difficult times', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('spread')), 'Teachers spread information to help students learn better.', '老师传播信息，以帮助学生更好地学习。', 'spread information', 'education', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('spread')), 'People often spread rumors without knowing the truth.', '人们常常在不知道真相的情况下传播谣言。', 'spread rumors', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('spread')), 'The journalist will spread the news about the event tomorrow.', '记者明天会传播关于此次活动的消息。', 'spread the news', 'news', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('chairman')), 'Our chairman of the board will attend the meeting tomorrow.', '我们的董事会主席明天会参加会议。', 'the chairman of the board', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('chairman')), 'Yesterday, the chairman said important news about the company.', '昨天，主席谈到了关于公司的重要消息。', 'the chairman said', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('chairman')), 'The acting chairman led the discussion on new policies.', '代理主席主持了关于新政策的讨论。', 'acting chairman', 'academic', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('promote')), 'Doctors promote health by advising regular exercise and proper diet.', '医生通过建议定期锻炼和合理饮食来促进健康。', 'promote health', 'health', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('promote')), 'Schools promote education by providing various learning resources.', '学校通过提供多种学习资源来促进教育。', 'promote education', 'education', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('promote')), 'Festivals promote culture and bring communities together every year.', '节日促进文化，每年将社区聚集在一起。', 'promote culture', 'culture', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('intelligence')), 'Artificial intelligence can help solve many complex problems.', '人工智能能够帮助解决许多复杂问题。', 'artificial intelligence', 'science_tech', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('intelligence')), 'She has high emotional intelligence, making her a great friend.', '她的情商很高，是个很好的朋友。', 'emotional intelligence', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('intelligence')), 'The report reveals new findings from national intelligence agencies.', '这份报告揭示了国家情报机构的新发现。', 'national intelligence', 'news', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('influence')), 'Friends can greatly influence people''s decisions in life.', '朋友可以在生活中对人们的决定产生很大影响。', 'influence people''s decisions', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('influence')), 'The media often influence public opinion on important issues.', '媒体常常影响公众对重要问题的看法。', 'influence public opinion', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('influence')), 'Teachers can influence academic performance through their teaching methods.', '教师可以通过教学方法影响学术表现。', 'influence academic performance', 'education', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('learning')), 'Teachers guide students in the learning process each day.', '教师每天指导学生的学习过程。', 'learning process', 'education', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('learning')), 'Travel can provide a valuable learning experience for everyone.', '旅行可以给每个人带来宝贵的学习经历。', 'learning experience', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('learning')), 'Students need various learning materials for their courses.', '学生需要各种学习材料来完成他们的课程。', 'learning materials', 'academic', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('direct')), 'Students gain direct experience through hands-on learning activities.', '学生通过实践学习活动获得直接体验。', 'direct experience', 'education', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('direct')), 'Effective teams use direct communication to solve problems quickly.', '有效的团队使用直接沟通快速解决问题。', 'direct communication', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('direct')), 'The new policy has a direct impact on local wildlife preservation.', '新政策对当地野生动物保护有直接影响。', 'direct impact', 'environment', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('storm')), 'Severe storms are expected to hit the region this weekend.', '预计本周末该地区将受到严重风暴的袭击。', 'severe storm', 'news', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('storm')), 'The government issued a storm warning for coastal areas this morning.', '政府今早发布了沿海地区的风暴警告。', 'storm warning', 'environment', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('storm')), 'Dark storm clouds gathered, signaling rain was coming soon.', '乌云密布，预示着雨水即将来临。', 'storm clouds', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('hero')), 'Many people consider firefighters as local heroes in our community.', '许多人认为消防员是我们社区的地方英雄。', 'local hero', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('hero')), 'The author of that famous novel became a national hero after its release.', '那部著名小说的作者在发布后成为了全国英雄。', 'national hero', 'culture', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('hero')), 'She is often an unsung hero who helps others without seeking recognition.', '她通常是一个未被赞扬的英雄，默默帮助他人。', 'unsung hero', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('pepper')), 'Many people enjoy adding black pepper to their meals.', '许多人喜欢在饭菜中加入黑胡椒。', 'black pepper', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('pepper')), 'The protestors used pepper spray for self-defense during the demonstration.', '抗议者在示威期间使用胡椒喷雾进行自我防卫。', 'pepper spray', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('pepper')), 'A ceramic pepper shaker adds charm to the dining table.', '一个陶瓷胡椒摇瓶为餐桌增添了魅力。', 'pepper shaker', 'culture', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('cycle')), 'Many people enjoy participating in cycling events every summer.', '许多人喜欢每年夏天参加骑行活动。', 'cycling events', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('cycle')), 'The economy often goes through different phases in the business cycle.', '经济通常在商业周期中经历不同的阶段。', 'business cycle', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('cycle')), 'Understanding the water cycle is essential for studying climate change.', '了解水循环对研究气候变化至关重要。', 'water cycle', 'science_tech', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('sand')), 'Fine sand can be found on many beautiful beaches.', '细沙常见于许多美丽的海滩。', 'fine sand', 'environment', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('sand')), 'Visitors often take photos of the towering sand dunes in the desert.', '游客常常拍摄沙漠中高耸的沙丘。', 'sand dunes', 'travel', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('sand')), 'Children love to build a sand castle during their beach trips.', '孩子们喜欢在海滩旅行时堆沙堡。', 'sand castle', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('accompany')), 'I often accompany my friend to the gym after work.', '我经常在下班后陪我的朋友去健身房。', 'accompany someone', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('accompany')), 'The report will accompany the new policy announcement next week.', '这份报告将伴随下周的新政策公告。', 'accompany something', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('accompany')), 'Teachers must accompany changes in the curriculum with better resources.', '教师必须为课程中的变化提供更好的资源。', 'accompany changes', 'education', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('nevertheless')), 'The storm was severe; nevertheless, the event continued as planned.', '暴风雨很严重，尽管如此，活动仍按计划进行。', '..., nevertheless, ...', 'news', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('nevertheless')), 'He faced many obstacles; nevertheless, he succeeded in his project.', '他面临许多障碍，尽管如此，他在项目中取得了成功。', 'Despite challenges, nevertheless', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('nevertheless')), 'Research shows limitations; nevertheless, it remains a significant study.', '研究显示存在局限性，尽管如此，它仍是一项重要研究。', '..., nevertheless, it remains', 'academic', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('normally')), 'People normally used to go shopping on weekends.', '人们通常在周末购物。', 'normally used', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('normally')), 'This phenomenon normally occurs during the summer months.', '这种现象通常发生在夏季。', 'normally occurs', 'science_tech', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('normally')), 'Such species are normally seen in coastal areas.', '这种物种通常出现在沿海地区。', 'normally seen', 'environment', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('bench')), 'Children often play and eat lunch on the park benches.', '孩子们经常在公园长凳上玩耍和吃午饭。', 'park bench', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('bench')), 'He can lift heavy weights during his bench press sessions.', '他在卧推训练中能举起重物。', 'bench press', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('bench')), 'The judge decided to hold a bench trial instead of a jury trial.', '法官决定进行审判，而不是陪审团审判。', 'bench trial', 'news', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('fade')), 'As the sun sets, the light begins to fade away.', '随着太阳落下，光线开始褪色。', 'fade away', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('fade')), 'The music will fade in slowly during the presentation.', '音乐将在演示期间慢慢渐入。', 'fade in', 'culture', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('fade')), 'Students noticed how the colors would fade out over time.', '学生们注意到颜色会随着时间褪色。', 'fade out', 'education', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('ease')), 'Doctors recommend ways to ease the pain after surgery.', '医生推荐一些方法来缓解手术后的疼痛。', 'ease the pain', 'health', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('ease')), 'Government plans to ease restrictions on travel soon.', '政府计划很快放宽旅行限制。', 'ease restrictions', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('ease')), 'Many people find ease in meditation and yoga practices.', '很多人在冥想和瑜伽练习中找到轻松。', 'find ease', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('tragedy')), 'Tragedy struck the small town after a severe storm caused devastation.', '一场严重的风暴导致小镇遭受毁灭性打击。', 'tragedy struck', 'news', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('tragedy')), 'Many films explore the theme of tragic tragedy in their narratives.', '许多电影在叙事中探讨悲惨悲剧的主题。', 'tragic tragedy', 'culture', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('tragedy')), 'She experienced a personal tragedy when she lost her beloved pet.', '她失去心爱的宠物时经历了一场个人悲剧。', 'personal tragedy', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('humour')), 'People with a good sense of humour make life enjoyable.', '拥有幽默感的人让生活更愉快。', 'sense of humour', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('humour')), 'Some comedians use dark humour to address serious topics.', '有些喜剧演员用黑色幽默讨论严肃话题。', 'dark humour', 'culture', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('humour')), 'Maintaining a good humour can improve workplace relationships.', '保持良好的幽默感可以改善职场关系。', 'good humour', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('architecture')), 'Modern architecture often features unique designs and materials.', '现代建筑通常具有独特的设计和材料。', 'modern architecture', 'culture', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('architecture')), 'Students learn about gothic architecture in their history classes.', '学生们在历史课上学习哥特式建筑。', 'gothic architecture', 'education', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('architecture')), 'Landscape architecture includes designing outdoor public areas and gardens.', '景观建筑包括设计户外公共区域和花园。', 'landscape architecture', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('cloth')), 'She prefers to wear clothes made of cotton cloth.', '她更喜欢穿用棉布做的衣服。', 'cotton cloth', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('cloth')), 'During the festival, people waved a piece of cloth in celebration.', '在节日期间，人们挥舞着一块布以示庆祝。', 'piece of cloth', 'culture', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('cloth')), 'They used special furniture cover cloth to protect their new chairs.', '他们用专用的家具罩布来保护新椅子。', 'furniture cover cloth', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('southeast')), 'Many tourists visit southeast Asia for its beautiful beaches.', '许多游客前往东南亚欣赏美丽的海滩。', 'southeast Asia', 'travel', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('southeast')), 'The hurricane is expected to hit the southeast coast this weekend.', '预计飓风将在这个周末袭击东南沿海。', 'southeast coast', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('southeast')), 'Southeast winds can bring warmer temperatures to the region.', '东南风会给该地区带来更高的气温。', 'southeast winds', 'environment', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('pit')), 'They decided to sink a pit for the new tree.', '他们决定为新树挖一个坑。', 'sink a pit', 'environment', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('pit')), 'The gravel pit is essential for local construction projects.', '这个沙石坑对当地建筑项目至关重要。', 'gravel pit', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('pit')), 'An open pit mining method is used to extract minerals.', '露天矿山开采法用于提取矿物。', 'open pit', 'science_tech', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('candle')), 'I love to relax with scented candles during my bath.', '我喜欢在洗澡时放香薰蜡烛放松自己。', 'scented candles', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('candle')), 'She blew out the birthday candles and made a wish.', '她吹灭了生日蜡烛，许下了一个愿望。', 'birthday candles', 'culture', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('candle')), 'Reading by candle light can create a cozy atmosphere.', '在烛光下阅读可以营造温馨的气氛。', 'candle light', 'education', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('ancestor')), 'Many people honor the traditions of their ancestors during festivals.', '许多人在节日期间尊重祖先的传统。', 'ancestors of', 'culture', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('ancestor')), 'Ancestor worship is an important practice in many cultures around the world.', '祭祖是在世界许多文化中一项重要的传统。', 'ancestor worship', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('ancestor')), 'Scholars study lineage from ancestors to understand family histories better.', '学者们研究祖先的血统以更好地理解家族历史。', 'lineage from ancestors', 'academic', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('lion')), 'In many cultures, a lion''s roar symbolizes power and authority.', '在许多文化中，狮子的吼叫象征着力量与权威。', 'lion''s roar', 'culture', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('lion')), 'Conservation efforts focus on preserving the lion habitat in Africa.', '保护工作着重于保护非洲的狮子栖息地。', 'lion habitat', 'environment', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('lion')), 'Research studies the declining lion population in various regions.', '研究调查了各个地区狮子种群的减少情况。', 'lion population', 'science_tech', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('pillow')), 'She washed the pillow cases before guests arrived for the weekend.', '她在周末客人到来之前洗了枕套。', 'pillow case', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('pillow')), 'At the sleepover, the friends had a hilarious pillow fight late at night.', '在好友家过夜时，朋友们在深夜进行了一场搞笑的枕头大战。', 'pillow fight', 'culture', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('pillow')), 'Choosing a pillow top mattress can significantly enhance your sleeping comfort.', '选择带枕头顶的床垫可以显著提高你的睡眠舒适度。', 'pillow top mattress', 'health', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('utilize')), 'Companies effectively utilize resources to maximize productivity and efficiency.', '公司有效利用资源以最大化生产力和效率。', 'effectively utilize', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('utilize')), 'Researchers utilize technology to enhance their experiments and data analysis.', '研究人员利用科技来增强他们的实验和数据分析。', 'utilize technology', 'science_tech', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('utilize')), 'People often utilize space creatively to improve their living environments.', '人们经常创造性地利用空间来改善他们的生活环境。', 'utilize space', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('consequently')), 'Researchers found significant gaps in data; consequently, the results were conclusive.', '研究人员发现数据存在显著差距，因此结果是明确的。', 'consequently, the results were conclusive', 'academic', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('consequently')), 'The new regulations were implemented without consideration; consequently, energy costs increased.', '新规没有考虑实施，因此能源成本上升。', 'consequently, energy costs increased', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('consequently')), 'Unexpected challenges arose during the project; consequently, he missed the deadline.', '项目中出现了意外挑战，因此他错过了截止日期。', 'consequently, he missed the deadline', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('classify')), 'Researchers need to classify information according to established guidelines.', '研究人员需要按照既定指南对信息进行分类。', 'classify information', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('classify')), 'Scientists often classify species based on their genetic characteristics.', '科学家通常根据物种的遗传特征进行分类。', 'classify species', 'science_tech', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('classify')), 'Students should learn how to classify data for their research projects.', '学生应该学习如何对数据进行分类，以便完成研究项目。', 'classify data', 'academic', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('exclusively')), 'This facility is exclusively for research conducted by faculty members.', '该设施专门用于教职员工进行的研究。', 'exclusively for research', 'academic', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('exclusively')), 'Certain products are exclusively available online, not in stores.', '某些产品仅在网上出售，商店里没有。', 'exclusively available online', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('exclusively')), 'The charity is exclusively funded by donations from local businesses.', '该慈善机构完全依靠当地企业的捐款资助。', 'exclusively funded by donations', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('betray')), 'When you lie, you betray the trust others have in you.', '当你撒谎时，你背叛了他人对你的信任。', 'betray trust', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('betray')), 'She felt he had betrayed her confidence by sharing secrets with others.', '她觉得他通过与他人分享秘密背叛了她的信任。', 'betray confidence', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('betray')), 'Some believe that politicians betray their country for personal gain.', '有些人认为政治家为了个人利益背叛了国家。', 'betray your country', 'news', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('soda')), 'Many people enjoy soft drinks and soda during summer barbecues.', '许多人在夏季烧烤时喜欢喝汽水和软饮料。', 'soft drinks and soda', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('soda')), 'Excessive soda consumption can lead to various health problems.', '过量饮用汽水可能导致各种健康问题。', 'soda consumption', 'health', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('soda')), 'Flavored soda has become a popular choice among young consumers.', '风味汽水已成为年轻消费者的热门选择。', 'flavored soda', 'culture', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('mature')), 'Only mature audiences are allowed to watch this film due to its content.', '由于内容原因，只有成熟观众才能观看这部电影。', 'mature audience', 'culture', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('mature')), 'In the park, mature trees provide shade and habitat for wildlife.', '公园里，成熟的树木为野生动物提供阴凉和栖息地。', 'mature trees', 'environment', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('mature')), 'Mature students often bring valuable life experience to the classroom.', '成年学生常常为课堂带来宝贵的生活经验。', 'mature students', 'education', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('crust')), 'Geologists study the crust of the Earth to understand its composition.', '地质学家研究地球的外壳，以了解其成分。', 'crust of the Earth', 'science_tech', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('crust')), 'Many people prefer the crust of bread to the soft inside.', '很多人更喜欢面包的外壳，而不是里面的软部分。', 'crust of bread', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('crust')), 'During winter, a thick crust of ice forms on the lakes.', '冬季，湖面上会形成厚厚的冰层。', 'crust of ice', 'environment', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('transparent')), 'Researchers demand transparent information to ensure data integrity in studies.', '研究人员要求透明的信息，以确保研究中的数据完整性。', 'transparent information', 'academic', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('transparent')), 'Our team implemented transparent processes to improve communication and trust among members.', '我们团队实施了透明的流程，以改善成员之间的沟通和信任。', 'transparent processes', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('transparent')), 'Engineers are exploring transparent materials for advanced display technologies and applications.', '工程师正在探索透明材料，以用于先进的显示技术和应用。', 'transparent materials', 'science_tech', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('secondly')), 'Secondly, we need to consider the implications of our findings across various fields.', '其次，我们需要考虑我们的发现对各个领域的影响。', 'secondly, we need to consider', 'academic', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('secondly')), 'It is important to note that secondly, deadlines are crucial for project success.', '重要的是，第二，截止日期对项目成功至关重要。', 'Secondly, it is important to note', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('secondly')), 'The report indicates, secondly, that climate change is accelerating at an alarming rate.', '该报告指出，第二，气候变化正以惊人的速度加剧。', 'Secondly, the report indicates', 'news', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('scarcely')), 'Students are scarcely enough prepared for the upcoming examinations.', '学生们几乎没有为即将到来的考试做好准备。', 'scarcely enough', 'education', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('scarcely')), 'There were scarcely any survivors after the devastating earthquake struck.', '在毁灭性地震袭击后，几乎没有幸存者。', 'scarcely any', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('scarcely')), 'The changes in your behavior are scarcely noticeable to others.', '你行为上的变化对别人几乎不可察觉。', 'scarcely noticeable', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('nucleus')), 'Every living cell has a nucleus that contains its genetic information.', '每个活细胞都有一个包含遗传信息的细胞核。', 'cell nucleus', 'science_tech', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('nucleus')), 'The nuclear nucleus plays a crucial role in the stability of atoms.', '核核在原子的稳定性方面起着至关重要的作用。', 'nuclear nucleus', 'academic', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('nucleus')), 'Research shows that the nucleus accumbens is involved in the brain''s reward system.', '研究表明，伏隔核参与大脑的奖励系统。', 'nucleus accumbens', 'health', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('hamburger')), 'Many customers prefer a cheeseburger with hamburger patties for lunch.', '许多顾客更喜欢午餐时吃带汉堡肉饼的奶酪汉堡。', 'cheeseburger with hamburger', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('hamburger')), 'Some restaurants now offer a vegetarian hamburger as a healthier option.', '一些餐厅现在提供素汉堡作为更健康的选择。', 'vegetarian hamburger', 'health', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('hamburger')), 'In many countries, a fast food hamburger is a popular choice among young people.', '在许多国家，快餐汉堡是年轻人中受欢迎的选择。', 'fast food hamburger', 'culture', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('conjunction')), 'Coordinating conjunctions are essential for connecting similar ideas in writing.', '并列连词在写作中连接相似观点是必不可少的。', 'coordinating conjunctions', 'academic', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('conjunction')), 'When drafting reports, subordinating conjunctions help clarify relationships between ideas.', '在撰写报告时，使用从属连词有助于明确观点之间的关系。', 'subordinating conjunctions', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('conjunction')), 'He explained the conjunctions of time that indicate when to act in various situations.', '他解释了指示在各种情况下何时行动的时间连词。', 'conjunctions of time', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('eighty')), 'Eighty years ago, the world faced significant challenges during the war.', '八十年前，世界在战争中面临重大挑战。', 'eighty years', 'news', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('eighty')), 'Around eighty percent of the participants reported positive results in the study.', '大约八成的参与者在研究中报告了积极的结果。', 'eighty percent', 'science_tech', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('eighty')), 'She saved eighty dollars to buy a new bicycle for her son.', '她省下了八十美元，为她的儿子买了一辆新自行车。', 'eighty dollars', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('bound')), 'Companies are bound by law to protect customer data.', '公司受到法律限制，必须保护客户数据。', 'bound by law', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('bound')), 'Students who work hard are often bound to succeed in their studies.', '努力学习的学生通常会在学业上取得成功。', 'bound to succeed', 'academic', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('bound')), 'They set off early in the morning, bound for adventure in the mountains.', '他们一大早出发，前往山中冒险。', 'bound for adventure', 'travel', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('greedy')), 'Many greedy people care only about their own wealth and success.', '许多贪婪的人只关心自己的财富和成功。', 'greedy people', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('greedy')), 'Researchers found that greedy behavior can lead to negative social consequences.', '研究人员发现，贪婪行为可能导致负面的社会后果。', 'greedy behavior', 'academic', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('greedy')), 'Greedy corporations often prioritize profits over the welfare of their employees.', '贪婪的公司往往优先考虑利润，而非员工的福利。', 'greedy corporations', 'news', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('dread')), 'Many people experience a dread of death as they age.', '许多人在变老时感到对死亡的恐惧。', 'dread of death', 'health', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('dread')), 'Students often dread the consequences of failing an important exam.', '学生们常常害怕未能通过重要考试的后果。', 'dread the consequences', 'education', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('dread')), 'She dreads this moment when she must say goodbye to her friends.', '她害怕这个时刻，她必须和朋友们告别。', 'dread this moment', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('humorous')), 'People often share humorous stories to lighten the mood during gatherings.', '人们常常分享幽默的故事来活跃聚会气氛。', 'humorous story', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('humorous')), 'She received positive feedback for her humorous remarks during the presentation.', '她在演示中幽默的评论获得了积极的反馈。', 'humorous remarks', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('humorous')), 'Last night, we watched a humorous film that made everyone laugh out loud.', '昨晚，我们看了一部幽默的电影，让所有人都笑出声来。', 'humorous film', 'culture', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('sympathize')), 'Many people sympathize with her struggles during this difficult time.', '很多人同情她在这个困难时期的挣扎。', 'sympathize with', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('sympathize')), 'He sympathizes deeply with the characters in the tragic play.', '他深深同情这出悲剧中的角色。', 'sympathize deeply', 'culture', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('sympathize')), 'Experts sympathize strongly with the victims of the recent disaster.', '专家们对最近灾难的受害者表示强烈的同情。', 'sympathize strongly', 'news', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('sightseeing')), 'Numerous sightseeing tours are offered in the city to explore its historical landmarks.', '城市中提供了许多观光旅游，供游客探索历史地标。', 'sightseeing tour', 'travel', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('sightseeing')), 'Travelers often seek out sightseeing opportunities to fully experience local cultures.', '旅行者通常寻找观光机会，以充分体验当地文化。', 'sightseeing opportunities', 'culture', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('sightseeing')), 'On weekends, families often engage in various sightseeing activities around the city.', '周末，家庭通常会参与各种城市周边的观光活动。', 'sightseeing activities', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('kettle')), 'An electric kettle can boil water much faster than on the stove.', '电水壶比炉子快得多。', 'electric kettle', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('kettle')), 'During the gathering, guests admired the antique tea kettle on display.', '聚会上，客人们欣赏着展示的古董茶壶。', 'tea kettle', 'culture', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('kettle')), 'Engineers designed a new pressure kettle for efficient cooking in laboratories.', '工程师们设计了一种新的高压锅，以提高实验室的烹饪效率。', 'pressure kettle', 'science_tech', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('labour')), 'Understanding the labour market is crucial for job seekers today.', '了解劳动市场对当今求职者至关重要。', 'labour market', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('labour')), 'New labour laws were introduced to protect workers'' rights more effectively.', '新的劳动法被引入，以更有效地保护工人的权利。', 'labour laws', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('labour')), 'Rising labour costs are impacting the overall pricing of consumer goods.', '上升的劳动成本正在影响消费品的整体定价。', 'labour costs', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('brook')), 'Managers will brook no argument regarding company policies and procedures.', '管理层对公司政策和程序不容许有任何争论。', 'brook no argument', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('brook')), 'Scientists must brook the consequences of their research findings on public health.', '科学家必须容忍其研究结果对公共健康带来的后果。', 'brook the consequences', 'academic', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('brook')), 'She learned to brook over time the minor annoyances in her daily routine.', '她逐渐学会了容忍日常生活中的小烦恼。', 'brook over time', 'daily_life', 2);

SELECT 'AFTER' AS stage, count(*) AS 有释义的cet4词 FROM vocab_words w JOIN vocab_word_banks m ON m.word_id=w.id JOIN vocab_banks b ON b.id=m.bank_id WHERE b.code='cet4' AND w.def_zh IS NOT NULL;

COMMIT;
