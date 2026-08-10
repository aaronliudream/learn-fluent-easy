-- cet6 内容增量 第1片(共5片)· 本片 200 词
-- ⚠️ 只含**本次新生成**的 928 词;cet6 另有 4390 词与 cet4/toefl 共用词条,已有内容,不在这里。
-- 幂等:UPDATE 按 lower(headword);例句先按 word_id 清再插,重复跑不叠加。

BEGIN;

SELECT '第1片 BEFORE' AS stage, count(*) AS 有释义的cet6词 FROM vocab_words w JOIN vocab_word_banks m ON m.word_id=w.id JOIN vocab_banks b ON b.id=m.bank_id WHERE b.code='cet6' AND w.def_zh IS NOT NULL;

UPDATE vocab_words SET ipa='/səˈsaɪ.ə.ti/', def_zh='社会', def_en='A group of individuals living together in organized communities.', updated_at=now() WHERE lower(headword)=lower('society');
UPDATE vocab_words SET ipa='/ˈbɪz.nɪs/', def_zh='生意；商业', def_en='Activity involving trade, buying, or selling goods or services.', updated_at=now() WHERE lower(headword)=lower('business');
UPDATE vocab_words SET ipa='/əˈfɪʃ.əl/', def_zh='官方的；正式的', def_en='Relating to an authority or public body and its duties.', updated_at=now() WHERE lower(headword)=lower('official');
UPDATE vocab_words SET ipa='/kɔrt/', def_zh='法院；球场', def_en='An institution that administers justice or a sports field.', updated_at=now() WHERE lower(headword)=lower('court');
UPDATE vocab_words SET ipa='/siːk/', def_zh='寻找', def_en='To try to find or discover something.', updated_at=now() WHERE lower(headword)=lower('seek');
UPDATE vocab_words SET ipa='/faɪt/', def_zh='打斗；争斗', def_en='A violent confrontation between individuals or groups.', updated_at=now() WHERE lower(headword)=lower('fight');
UPDATE vocab_words SET ipa='/raɪz/', def_zh='上升；提高', def_en='To move upwards or increase in amount.', updated_at=now() WHERE lower(headword)=lower('rise');
UPDATE vocab_words SET ipa='/ˈɔː.fɪ.sər/', def_zh='官员', def_en='A person holding a position of authority or responsibility.', updated_at=now() WHERE lower(headword)=lower('officer');
UPDATE vocab_words SET ipa='/dɪˈspaɪt/', def_zh='尽管', def_en='Without being affected by; in spite of.', updated_at=now() WHERE lower(headword)=lower('despite');
UPDATE vocab_words SET ipa='/ɪnˌvaɪ.rənˈmen.təl/', def_zh='环境的', def_en='Relating to the natural world and the impact of human activity.', updated_at=now() WHERE lower(headword)=lower('environmental');
UPDATE vocab_words SET ipa='/ˈfɪz.ɪ.kəl/', def_zh='身体的；物理的', def_en='Relating to the body or material things.', updated_at=now() WHERE lower(headword)=lower('physical');
UPDATE vocab_words SET ipa='/dɪsˈkʌv.ər/', def_zh='发现', def_en='Find something or someone that was not known before.', updated_at=now() WHERE lower(headword)=lower('discover');
UPDATE vocab_words SET ipa='/əˈfɛkt/', def_zh='影响', def_en='To have an influence on someone or something.', updated_at=now() WHERE lower(headword)=lower('affect');
UPDATE vocab_words SET ipa='/peɪn/', def_zh='疼痛', def_en='A feeling of discomfort or suffering in the body.', updated_at=now() WHERE lower(headword)=lower('pain');
UPDATE vocab_words SET ipa='/ɡʊdz/', def_zh='商品', def_en='Items that are produced for sale or trade.', updated_at=now() WHERE lower(headword)=lower('goods');
UPDATE vocab_words SET ipa='/ʃɑt/', def_zh='射击；拍摄', def_en='An act of shooting or taking a photograph.', updated_at=now() WHERE lower(headword)=lower('shot');
UPDATE vocab_words SET ipa='/rɪˌspɒn.səˈbɪl.ɪ.ti/', def_zh='责任', def_en='The state of being accountable for something.', updated_at=now() WHERE lower(headword)=lower('responsibility');
UPDATE vocab_words SET ipa='/rɪˈkɔːl/', def_zh='回忆；召回', def_en='To bring a memory or information back to mind.', updated_at=now() WHERE lower(headword)=lower('recall');
UPDATE vocab_words SET ipa='/ɪˈfɛk.tɪv/', def_zh='有效的', def_en='Producing a desired result or effect.', updated_at=now() WHERE lower(headword)=lower('effective');
UPDATE vocab_words SET ipa='/ˈsloʊ.li/', def_zh='缓慢地', def_en='In a slow manner; not quickly.', updated_at=now() WHERE lower(headword)=lower('slowly');
UPDATE vocab_words SET ipa='/ˈklaɪ.ənt/', def_zh='客户', def_en='A person or organization that receives services or advice.', updated_at=now() WHERE lower(headword)=lower('client');
UPDATE vocab_words SET ipa='/kəˌmjunɪˈkeɪʃən/', def_zh='交流；沟通', def_en='The act of sharing information or ideas with others.', updated_at=now() WHERE lower(headword)=lower('communication');
UPDATE vocab_words SET ipa='/sərˈvaɪv/', def_zh='生存；存活', def_en='To continue to live or exist, especially despite difficult conditions.', updated_at=now() WHERE lower(headword)=lower('survive');
UPDATE vocab_words SET ipa='/prəˈmoʊt/', def_zh='促进；提升', def_en='To support or encourage development or growth in something.', updated_at=now() WHERE lower(headword)=lower('promote');
UPDATE vocab_words SET ipa='/ˈtʃɛr.mən/', def_zh='主席', def_en='The person in charge of a meeting or organization.', updated_at=now() WHERE lower(headword)=lower('chairman');
UPDATE vocab_words SET ipa='/sprɛd/', def_zh='传播；扩散', def_en='To extend or distribute over a wider area.', updated_at=now() WHERE lower(headword)=lower('spread');
UPDATE vocab_words SET ipa='/ˈɪn.flu.əns/', def_zh='影响', def_en='The capacity to have an effect on someone or something.', updated_at=now() WHERE lower(headword)=lower('influence');
UPDATE vocab_words SET ipa='/əˈdɪʃ.ən.əl/', def_zh='额外的', def_en='Something added to what is already present or available.', updated_at=now() WHERE lower(headword)=lower('additional');
UPDATE vocab_words SET ipa='/ɪnˈtɛl.ɪ.dʒəns/', def_zh='智力', def_en='The ability to learn, understand, and apply knowledge.', updated_at=now() WHERE lower(headword)=lower('intelligence');
UPDATE vocab_words SET ipa='/ˈkæt.ɪ.gɔːr.i/', def_zh='类别', def_en='A group of things that share common characteristics.', updated_at=now() WHERE lower(headword)=lower('category');
UPDATE vocab_words SET ipa='/pərˈspɛk.tɪv/', def_zh='观点；看法', def_en='A particular attitude toward something; a viewpoint.', updated_at=now() WHERE lower(headword)=lower('perspective');
UPDATE vocab_words SET ipa='/ˈstjuː.di.oʊ/', def_zh='工作室', def_en='A place where creative work is done.', updated_at=now() WHERE lower(headword)=lower('studio');
UPDATE vocab_words SET ipa='/dəˈrɛkt/', def_zh='直接的；直达的', def_en='Moving along a straight line; without deviation or detour.', updated_at=now() WHERE lower(headword)=lower('direct');
UPDATE vocab_words SET ipa='/ˈkɔːr.pə.rət/', def_zh='企业的', def_en='Relating to a large company or group.', updated_at=now() WHERE lower(headword)=lower('corporate');
UPDATE vocab_words SET ipa='/ˈlɜrn.ɪŋ/', def_zh='学习', def_en='The process of acquiring knowledge or skills through experience.', updated_at=now() WHERE lower(headword)=lower('learning');
UPDATE vocab_words SET ipa='/əˈsɛs.mənt/', def_zh='评估', def_en='The process of evaluating or estimating the nature or quality.', updated_at=now() WHERE lower(headword)=lower('assessment');
UPDATE vocab_words SET ipa='/stɔrm/', def_zh='风暴；暴风雨', def_en='A violent disturbance of the atmosphere with strong winds and usually rain.', updated_at=now() WHERE lower(headword)=lower('storm');
UPDATE vocab_words SET ipa='/ˈæn.əl.ɪst/', def_zh='分析师', def_en='A person who analyzes data or information to provide insights.', updated_at=now() WHERE lower(headword)=lower('analyst');
UPDATE vocab_words SET ipa='/ˈkæθ.əl.ɪk/', def_zh='广泛的；普遍的', def_en='Universal or all-encompassing in nature or influence.', updated_at=now() WHERE lower(headword)=lower('catholic');
UPDATE vocab_words SET ipa='/kraɪˈtɪr.i.ən/', def_zh='标准；准则', def_en='A standard or principle by which something is judged or decided.', updated_at=now() WHERE lower(headword)=lower('criterion');
UPDATE vocab_words SET ipa='/ˈreɪ.tɪŋ/', def_zh='等级；评级', def_en='An evaluation or assessment of something''s quality or performance.', updated_at=now() WHERE lower(headword)=lower('rating');
UPDATE vocab_words SET ipa='/prəˈduː.sər/', def_zh='制作人；生产者', def_en='A person or company that creates or supplies goods or services.', updated_at=now() WHERE lower(headword)=lower('producer');
UPDATE vocab_words SET ipa='/spəˈsɪf.ɪ.kli/', def_zh='具体地；特别地', def_en='In a clear and detailed manner; distinctly.', updated_at=now() WHERE lower(headword)=lower('specifically');
UPDATE vocab_words SET ipa='/ɪˈmoʊ.ʃən.əl/', def_zh='情感的', def_en='Relating to feelings or mental states.', updated_at=now() WHERE lower(headword)=lower('emotional');
UPDATE vocab_words SET ipa='/ˈpɛp.ər/', def_zh='胡椒', def_en='A spice made from dried and ground peppercorns.', updated_at=now() WHERE lower(headword)=lower('pepper');
UPDATE vocab_words SET ipa='/ˈhɪə.roʊ/', def_zh='英雄', def_en='A person admired for courage or noble qualities.', updated_at=now() WHERE lower(headword)=lower('hero');
UPDATE vocab_words SET ipa='/ˈwɔːrnɪŋ/', def_zh='警告', def_en='A notice that warns of danger or possible problems.', updated_at=now() WHERE lower(headword)=lower('warning');
UPDATE vocab_words SET ipa='/kəˈrɪk.jʊ.ləm/', def_zh='课程', def_en='A set of courses constituting an educational program.', updated_at=now() WHERE lower(headword)=lower('curriculum');
UPDATE vocab_words SET ipa='/ˈæl.bəm/', def_zh='专辑', def_en='A collection of music recordings released together.', updated_at=now() WHERE lower(headword)=lower('album');
UPDATE vocab_words SET ipa='/ˈsuː.ɪ.saɪd/', def_zh='自杀', def_en='The act of intentionally causing one''s own death.', updated_at=now() WHERE lower(headword)=lower('suicide');
UPDATE vocab_words SET ipa='/ˈsɪmp.təm/', def_zh='症状', def_en='A physical or mental feature indicating a condition or disease.', updated_at=now() WHERE lower(headword)=lower('symptom');
UPDATE vocab_words SET ipa='/ˈklɪnɪk/', def_zh='诊所', def_en='A place where medical treatment is provided.', updated_at=now() WHERE lower(headword)=lower('clinic');
UPDATE vocab_words SET ipa='/ˌɪmɪˈɡreɪʃən/', def_zh='移民；移居', def_en='Movement of people into a country to live permanently.', updated_at=now() WHERE lower(headword)=lower('immigration');
UPDATE vocab_words SET ipa='/ɪˈvæl.ju.eɪ.ʃən/', def_zh='评估；评价', def_en='The process of assessing or judging something.', updated_at=now() WHERE lower(headword)=lower('evaluation');
UPDATE vocab_words SET ipa='/kənˈsʌl.tənt/', def_zh='顾问', def_en='A person who provides expert advice professionally.', updated_at=now() WHERE lower(headword)=lower('consultant');
UPDATE vocab_words SET ipa='/hɪˈstɔːr.ɪk/', def_zh='历史性的', def_en='Significant in history; having lasting importance.', updated_at=now() WHERE lower(headword)=lower('historic');
UPDATE vocab_words SET ipa='/ˈɛn.tə.praɪz/', def_zh='企业', def_en='A business or company, especially a large one.', updated_at=now() WHERE lower(headword)=lower('enterprise');
UPDATE vocab_words SET ipa='/əˈkʌm.pə.ni/', def_zh='陪伴；伴随', def_en='To go somewhere with someone or to be present with them.', updated_at=now() WHERE lower(headword)=lower('accompany');
UPDATE vocab_words SET ipa='/ˈrɛsɪpi/', def_zh='食谱', def_en='A set of instructions for preparing a dish.', updated_at=now() WHERE lower(headword)=lower('recipe');
UPDATE vocab_words SET ipa='/hɪˈstɔː.ri.ən/', def_zh='历史学家', def_en='A person who studies or writes about history.', updated_at=now() WHERE lower(headword)=lower('historian');
UPDATE vocab_words SET ipa='/nɪˈɡoʊ.ʃi.eɪt/', def_zh='谈判', def_en='To discuss something in order to reach an agreement.', updated_at=now() WHERE lower(headword)=lower('negotiate');
UPDATE vocab_words SET ipa='/kraɪˈtɪə.ri.ə/', def_zh='标准；准则', def_en='A standard or principle used for judgment or evaluation.', updated_at=now() WHERE lower(headword)=lower('criteria');
UPDATE vocab_words SET ipa='/əˈkeɪʒənəli/', def_zh='偶尔', def_en='At infrequent or irregular intervals; not often.', updated_at=now() WHERE lower(headword)=lower('occasionally');
UPDATE vocab_words SET ipa='/ˈnɔːr.mə.li/', def_zh='通常，普遍', def_en='In a usual or typical manner; generally.', updated_at=now() WHERE lower(headword)=lower('normally');
UPDATE vocab_words SET ipa='/ˌrɛfjuˈdʒiː/', def_zh='难民', def_en='A person who escapes their country due to conflict or persecution.', updated_at=now() WHERE lower(headword)=lower('refugee');
UPDATE vocab_words SET ipa='/ˈprɛɡ.nənt/', def_zh='怀孕的', def_en='Carrying a developing fetus in the uterus.', updated_at=now() WHERE lower(headword)=lower('pregnant');
UPDATE vocab_words SET ipa='/ˈnɛv.ər.ðəˌlɛs/', def_zh='然而', def_en='In spite of that; nonetheless.', updated_at=now() WHERE lower(headword)=lower('nevertheless');
UPDATE vocab_words SET ipa='/hɪp/', def_zh='时髦的；潮流的', def_en='Fashionable or trendy in style or behavior.', updated_at=now() WHERE lower(headword)=lower('hip');
UPDATE vocab_words SET ipa='/dʒiːn/', def_zh='牛仔裤', def_en='A type of sturdy fabric used for clothing, especially trousers.', updated_at=now() WHERE lower(headword)=lower('jean');
UPDATE vocab_words SET ipa='/ˈspoʊks.mən/', def_zh='发言人', def_en='A person who speaks on behalf of others.', updated_at=now() WHERE lower(headword)=lower('spokesman');
UPDATE vocab_words SET ipa='/bɛntʃ/', def_zh='长凳', def_en='A long seat for multiple people, often found in parks.', updated_at=now() WHERE lower(headword)=lower('bench');
UPDATE vocab_words SET ipa='/ˈtɛr.ər.ɪst/', def_zh='恐怖分子', def_en='A person who uses violence for political aims.', updated_at=now() WHERE lower(headword)=lower('terrorist');
UPDATE vocab_words SET ipa='/ˌprɛzənˈteɪʃən/', def_zh='演示；介绍', def_en='A formal talk or display of information to an audience.', updated_at=now() WHERE lower(headword)=lower('presentation');
UPDATE vocab_words SET ipa='/ˈhɛdˌkwɔːr.t̬ɚz/', def_zh='总部', def_en='Main offices of an organization or company.', updated_at=now() WHERE lower(headword)=lower('headquarters');
UPDATE vocab_words SET ipa='/feɪd/', def_zh='褪色；消失', def_en='To gradually lose brightness or color.', updated_at=now() WHERE lower(headword)=lower('fade');
UPDATE vocab_words SET ipa='/ˈvaɪ.ə.leɪt/', def_zh='违反', def_en='To break a law or rule intentionally.', updated_at=now() WHERE lower(headword)=lower('violate');
UPDATE vocab_words SET ipa='/ˈɜrnɪŋz/', def_zh='收益', def_en='Money obtained from work or investments.', updated_at=now() WHERE lower(headword)=lower('earnings');
UPDATE vocab_words SET ipa='/æθˈlɛtɪk/', def_zh='运动的', def_en='Relating to sports, physical activities, or athletes.', updated_at=now() WHERE lower(headword)=lower('athletic');
UPDATE vocab_words SET ipa='/saɪˈkɑː.lə.dʒi/', def_zh='心理学', def_en='The study of mind and behavior in humans and animals.', updated_at=now() WHERE lower(headword)=lower('psychology');
UPDATE vocab_words SET ipa='/ˈtrædʒ.ə.di/', def_zh='悲剧', def_en='A disastrous event or situation causing great suffering or destruction.', updated_at=now() WHERE lower(headword)=lower('tragedy');
UPDATE vocab_words SET ipa='/ˈpraɪ.və.si/', def_zh='隐私', def_en='The state of being free from public attention or scrutiny.', updated_at=now() WHERE lower(headword)=lower('privacy');
UPDATE vocab_words SET ipa='/ˈmɛm.bɚ.ʃɪp/', def_zh='会员身份', def_en='The state of being a member of a group or organization.', updated_at=now() WHERE lower(headword)=lower('membership');
UPDATE vocab_words SET ipa='/ˈfaɪ.tər/', def_zh='斗士', def_en='A person who fights, especially in a battle or competition.', updated_at=now() WHERE lower(headword)=lower('fighter');
UPDATE vocab_words SET ipa='/ˈɡɑːr.lɪk/', def_zh='大蒜', def_en='A bulbous plant used for flavoring and medicinal purposes.', updated_at=now() WHERE lower(headword)=lower('garlic');
UPDATE vocab_words SET ipa='/ˌkɒn.trəˈvɜː.ʃəl/', def_zh='有争议的', def_en='Causing disagreement or controversy among people.', updated_at=now() WHERE lower(headword)=lower('controversial');
UPDATE vocab_words SET ipa='/ˈnær.ə.tɪv/', def_zh='叙述；故事', def_en='A spoken or written account of connected events.', updated_at=now() WHERE lower(headword)=lower('narrative');
UPDATE vocab_words SET ipa='/ɪnˈstrʌk.tər/', def_zh='讲师', def_en='A person who teaches a subject or skill.', updated_at=now() WHERE lower(headword)=lower('instructor');
UPDATE vocab_words SET ipa='/ləˈdʒɪt.ɪ.mət/', def_zh='合法的', def_en='Conforming to the law or rules; valid and acceptable.', updated_at=now() WHERE lower(headword)=lower('legitimate');
UPDATE vocab_words SET ipa='/ˈvɜr.səs/', def_zh='对比；对抗', def_en='Indicating opposition or contrast between two entities.', updated_at=now() WHERE lower(headword)=lower('versus');
UPDATE vocab_words SET ipa='/ˈmɔːrɡɪdʒ/', def_zh='抵押贷款', def_en='A loan secured by property as collateral.', updated_at=now() WHERE lower(headword)=lower('mortgage');
UPDATE vocab_words SET ipa='/ˈhjuː.mər/', def_zh='幽默', def_en='The quality of being amusing or entertaining.', updated_at=now() WHERE lower(headword)=lower('humour');
UPDATE vocab_words SET ipa='/ˈfɪz.ɪ.kli/', def_zh='身体上；物理上', def_en='In a bodily manner; relating to the body.', updated_at=now() WHERE lower(headword)=lower('physically');
UPDATE vocab_words SET ipa='/kəmˈpɛtɪtər/', def_zh='竞争者', def_en='A person or organization that competes with others.', updated_at=now() WHERE lower(headword)=lower('competitor');
UPDATE vocab_words SET ipa='/skrɪpt/', def_zh='剧本；脚本', def_en='A written text for performance or production.', updated_at=now() WHERE lower(headword)=lower('script');
UPDATE vocab_words SET ipa='/prɪˈskrɪp.ʃən/', def_zh='处方', def_en='A written order for medication or treatment from a doctor.', updated_at=now() WHERE lower(headword)=lower('prescription');
UPDATE vocab_words SET ipa='/kənˈsɛn.səs/', def_zh='共识', def_en='A general agreement among a group of people.', updated_at=now() WHERE lower(headword)=lower('consensus');
UPDATE vocab_words SET ipa='/ˈprɛɡnənsi/', def_zh='怀孕', def_en='The condition of carrying a developing fetus within the body.', updated_at=now() WHERE lower(headword)=lower('pregnancy');
UPDATE vocab_words SET ipa='/dɪˈfɛndənt/', def_zh='被告', def_en='A person accused in a court of law.', updated_at=now() WHERE lower(headword)=lower('defendant');
UPDATE vocab_words SET ipa='/ˌæn.ɪˈvɜːr.sə.ri/', def_zh='周年纪念', def_en='A date marking an event''s recurrence each year.', updated_at=now() WHERE lower(headword)=lower('anniversary');
UPDATE vocab_words SET ipa='/ˌæd.əˈles.ənt/', def_zh='青少年；青春期的人', def_en='A person in the transitional stage of development between childhood and adulthood.', updated_at=now() WHERE lower(headword)=lower('adolescent');
UPDATE vocab_words SET ipa='/ˈsælmən/', def_zh='鲑鱼', def_en='A type of fish known for its pink flesh.', updated_at=now() WHERE lower(headword)=lower('salmon');
UPDATE vocab_words SET ipa='/ˈkɒm.bæt/', def_zh='战斗；搏斗', def_en='A fight or struggle between armed forces.', updated_at=now() WHERE lower(headword)=lower('combat');
UPDATE vocab_words SET ipa='/ˈskʌlp.tʃər/', def_zh='雕塑', def_en='A three-dimensional work of art created by shaping materials.', updated_at=now() WHERE lower(headword)=lower('sculpture');
UPDATE vocab_words SET ipa='/kaʊtʃ/', def_zh='沙发', def_en='A piece of furniture for sitting or lying down.', updated_at=now() WHERE lower(headword)=lower('couch');
UPDATE vocab_words SET ipa='/ˈbɪʃ.əp/', def_zh='主教', def_en='A high-ranking Christian cleric in charge of a diocese.', updated_at=now() WHERE lower(headword)=lower('bishop');
UPDATE vocab_words SET ipa='/ˌkɔːr.əˈleɪ.ʃən/', def_zh='相关性', def_en='A mutual relationship or connection between two or more things.', updated_at=now() WHERE lower(headword)=lower('correlation');
UPDATE vocab_words SET ipa='/ˌʌnɪmˈplɔɪmənt/', def_zh='失业', def_en='The state of being without a job.', updated_at=now() WHERE lower(headword)=lower('unemployment');
UPDATE vocab_words SET ipa='/ˈɛθ.ɪ.kəl/', def_zh='伦理的；道德的', def_en='Relating to principles of right and wrong behavior.', updated_at=now() WHERE lower(headword)=lower('ethical');
UPDATE vocab_words SET ipa='/ˈklɒ.zɪt/', def_zh='衣柜；壁橱', def_en='A small room or space for storing clothes or items.', updated_at=now() WHERE lower(headword)=lower('closet');
UPDATE vocab_words SET ipa='/oʊvərˈwɛlmɪŋ/', def_zh='压倒性的；无法承受的', def_en='Very powerful or intense, often to the point of being difficult to handle.', updated_at=now() WHERE lower(headword)=lower('overwhelming');
UPDATE vocab_words SET ipa='/doʊs/', def_zh='剂量', def_en='A measured amount of a substance, especially medicine.', updated_at=now() WHERE lower(headword)=lower('dose');
UPDATE vocab_words SET ipa='/hɜːrb/', def_zh='草本植物；香草', def_en='A plant used for flavoring or medicinal purposes.', updated_at=now() WHERE lower(headword)=lower('herb');
UPDATE vocab_words SET ipa='/ˈnaɪt.mɛr/', def_zh='噩梦', def_en='A frightening or unpleasant dream that causes distress.', updated_at=now() WHERE lower(headword)=lower('nightmare');
UPDATE vocab_words SET ipa='/ˈbeɪs.mənt/', def_zh='地下室', def_en='A floor of a building below ground level.', updated_at=now() WHERE lower(headword)=lower('basement');
UPDATE vocab_words SET ipa='/ˌkwɛs.tʃəˈnɛr/', def_zh='问卷', def_en='A set of printed or written questions for data collection.', updated_at=now() WHERE lower(headword)=lower('questionnaire');
UPDATE vocab_words SET ipa='/ˈrændəm/', def_zh='随机的；任意的', def_en='Chosen without method or conscious decision.', updated_at=now() WHERE lower(headword)=lower('random');
UPDATE vocab_words SET ipa='/ˈɪn.frəˌstrʌk.tʃər/', def_zh='基础设施', def_en='The basic physical systems of a country or community.', updated_at=now() WHERE lower(headword)=lower('infrastructure');
UPDATE vocab_words SET ipa='/ɡɪlt/', def_zh='内疚', def_en='A feeling of remorse or responsibility for wrongdoing.', updated_at=now() WHERE lower(headword)=lower('guilt');
UPDATE vocab_words SET ipa='/rɪˈpleɪs.mənt/', def_zh='替代；更换', def_en='An item that takes the place of another one.', updated_at=now() WHERE lower(headword)=lower('replacement');
UPDATE vocab_words SET ipa='/wɛb/', def_zh='网络；网页', def_en='A system of interconnected documents on the internet.', updated_at=now() WHERE lower(headword)=lower('web');
UPDATE vocab_words SET ipa='/ɡɪˈtɑːr/', def_zh='吉他', def_en='A musical instrument with six strings played by strumming or plucking.', updated_at=now() WHERE lower(headword)=lower('guitar');
UPDATE vocab_words SET ipa='/ˈkɜr.ən.si/', def_zh='货币；通货', def_en='A system of money used in a particular country.', updated_at=now() WHERE lower(headword)=lower('currency');
UPDATE vocab_words SET ipa='/prəˈmoʊ.ʃən/', def_zh='晋升；提升', def_en='Advancement in rank, status, or pay.', updated_at=now() WHERE lower(headword)=lower('promotion');
UPDATE vocab_words SET ipa='/ˈsaʊθˈiːst/', def_zh='东南方', def_en='The direction halfway between south and east.', updated_at=now() WHERE lower(headword)=lower('southeast');
UPDATE vocab_words SET ipa='/dɪˈtɛktɪv/', def_zh='侦探；侦查的', def_en='A person who investigates crimes or gathers information.', updated_at=now() WHERE lower(headword)=lower('detective');
UPDATE vocab_words SET ipa='/ɪnˈɡeɪdʒ.mənt/', def_zh='参与；订婚', def_en='Participation in something or a formal agreement to marry.', updated_at=now() WHERE lower(headword)=lower('engagement');
UPDATE vocab_words SET ipa='/ˈpoʊ.stɚ/', def_zh='海报', def_en='A large printed picture or notice used for decoration or advertisement.', updated_at=now() WHERE lower(headword)=lower('poster');
UPDATE vocab_words SET ipa='/pɪt/', def_zh='坑；深穴', def_en='A hole in the ground, often used for specific purposes.', updated_at=now() WHERE lower(headword)=lower('pit');
UPDATE vocab_words SET ipa='/hʌɡ/', def_zh='拥抱', def_en='A close embrace between two people.', updated_at=now() WHERE lower(headword)=lower('hug');
UPDATE vocab_words SET ipa='/ˈɛl.ɪ.gənt/', def_zh='优雅的', def_en='Graceful and stylish in appearance or manner.', updated_at=now() WHERE lower(headword)=lower('elegant');
UPDATE vocab_words SET ipa='/ˈkæn.dəl/', def_zh='蜡烛；烛光', def_en='A cylindrical piece of wax with a wick used for light.', updated_at=now() WHERE lower(headword)=lower('candle');
UPDATE vocab_words SET ipa='/prɪˈvɛnʃən/', def_zh='预防', def_en='The act of stopping something from happening or arising.', updated_at=now() WHERE lower(headword)=lower('prevention');
UPDATE vocab_words SET ipa='/fəˈtɒɡrəfi/', def_zh='摄影', def_en='The art or practice of taking and processing photographs.', updated_at=now() WHERE lower(headword)=lower('photography');
UPDATE vocab_words SET ipa='/ˈhɒs.tɪdʒ/', def_zh='人质', def_en='A person held captive for negotiations or ransom.', updated_at=now() WHERE lower(headword)=lower('hostage');
UPDATE vocab_words SET ipa='/ˈɡæð.ər.ɪŋ/', def_zh='聚会', def_en='A meeting or assembly of people for a specific purpose.', updated_at=now() WHERE lower(headword)=lower('gathering');
UPDATE vocab_words SET ipa='/ˌriː.əˈlɪs.tɪk/', def_zh='现实的', def_en='Representing things as they actually are.', updated_at=now() WHERE lower(headword)=lower('realistic');
UPDATE vocab_words SET ipa='/kɪt/', def_zh='配套工具；装备', def_en='A set of items used for a specific purpose.', updated_at=now() WHERE lower(headword)=lower('kit');
UPDATE vocab_words SET ipa='/ˈsɛntɪmənt/', def_zh='情感；观点', def_en='A feeling, opinion, or attitude toward something.', updated_at=now() WHERE lower(headword)=lower('sentiment');
UPDATE vocab_words SET ipa='/ˈpɪl.oʊ/', def_zh='枕头', def_en='A cushion used for supporting the head during sleep.', updated_at=now() WHERE lower(headword)=lower('pillow');
UPDATE vocab_words SET ipa='/ɡriːf/', def_zh='悲伤', def_en='Intense sorrow, especially caused by someone''s death.', updated_at=now() WHERE lower(headword)=lower('grief');
UPDATE vocab_words SET ipa='/bɪd/', def_zh='出价；投标', def_en='An offer, especially in an auction or competitive situation.', updated_at=now() WHERE lower(headword)=lower('bid');
UPDATE vocab_words SET ipa='/ˈtaɪt.li/', def_zh='紧密地', def_en='In a firm or secure manner, with little space between.', updated_at=now() WHERE lower(headword)=lower('tightly');
UPDATE vocab_words SET ipa='/dɪˈlɛm.ə/', def_zh='困境', def_en='A situation requiring a choice between equally undesirable options.', updated_at=now() WHERE lower(headword)=lower('dilemma');
UPDATE vocab_words SET ipa='/ˈdɪɡ.nə.ti/', def_zh='尊严', def_en='The quality of being worthy of honor or respect.', updated_at=now() WHERE lower(headword)=lower('dignity');
UPDATE vocab_words SET ipa='/ˌlaɪ.əˈbɪl.ɪ.ti/', def_zh='责任；负债', def_en='A state of being responsible for something, particularly financially.', updated_at=now() WHERE lower(headword)=lower('liability');
UPDATE vocab_words SET ipa='/ɡrɪn/', def_zh='露齿而笑；微笑', def_en='A broad smile showing teeth.', updated_at=now() WHERE lower(headword)=lower('grin');
UPDATE vocab_words SET ipa='/dɪˈvaɪn/', def_zh='神的；极好的', def_en='Relating to God or very excellent; heavenly.', updated_at=now() WHERE lower(headword)=lower('divine');
UPDATE vocab_words SET ipa='/kɑːrˈtuːn/', def_zh='卡通，动画片', def_en='A humorous drawing or animated film, often for children.', updated_at=now() WHERE lower(headword)=lower('cartoon');
UPDATE vocab_words SET ipa='/ˈæn.sɛs.tər/', def_zh='祖先', def_en='A person from whom one is descended.', updated_at=now() WHERE lower(headword)=lower('ancestor');
UPDATE vocab_words SET ipa='/ˌprɒdʌkˈtɪvɪti/', def_zh='生产力', def_en='The efficiency of productive efforts or processes.', updated_at=now() WHERE lower(headword)=lower('productivity');
UPDATE vocab_words SET ipa='/bʌɡ/', def_zh='漏洞；错误', def_en='An error or flaw in a system, typically software.', updated_at=now() WHERE lower(headword)=lower('bug');
UPDATE vocab_words SET ipa='/ˈboʊ.nəs/', def_zh='奖金', def_en='An extra payment or reward for performance or achievement.', updated_at=now() WHERE lower(headword)=lower('bonus');
UPDATE vocab_words SET ipa='/ˈɛd.ɪt/', def_zh='编辑', def_en='To make changes or corrections to a text or document.', updated_at=now() WHERE lower(headword)=lower('edit');
UPDATE vocab_words SET ipa='/æs/', def_zh='驴', def_en='A domesticated hoofed mammal related to the horse.', updated_at=now() WHERE lower(headword)=lower('ass');
UPDATE vocab_words SET ipa='/ˈtrædʒ.ɪk/', def_zh='悲惨的', def_en='Causing great sadness or suffering; very unfortunate.', updated_at=now() WHERE lower(headword)=lower('tragic');
UPDATE vocab_words SET ipa='/dɪˈzɜrt/', def_zh='甜点', def_en='A sweet course served at the end of a meal.', updated_at=now() WHERE lower(headword)=lower('dessert');
UPDATE vocab_words SET ipa='/ˈlaɪ.ən/', def_zh='狮子', def_en='A large, carnivorous feline known for its strength and pride behavior.', updated_at=now() WHERE lower(headword)=lower('lion');
UPDATE vocab_words SET ipa='/ˈjuːtəˌlaɪz/', def_zh='利用', def_en='To make practical and effective use of something.', updated_at=now() WHERE lower(headword)=lower('utilize');
UPDATE vocab_words SET ipa='/ˈpæn.ɪk/', def_zh='恐慌', def_en='A sudden overwhelming feeling of fear or anxiety.', updated_at=now() WHERE lower(headword)=lower('panic');
UPDATE vocab_words SET ipa='/əˌpriː.ʃiˈeɪ.ʃən/', def_zh='感激；欣赏', def_en='Recognition and enjoyment of the good qualities of someone or something.', updated_at=now() WHERE lower(headword)=lower('appreciation');
UPDATE vocab_words SET ipa='/ˈkɒn.sɪ.kwənt.li/', def_zh='因此；所以', def_en='As a result; in a manner that follows logically.', updated_at=now() WHERE lower(headword)=lower('consequently');
UPDATE vocab_words SET ipa='/kəˈrɛk.tli/', def_zh='正确地', def_en='In a manner that is accurate or true.', updated_at=now() WHERE lower(headword)=lower('correctly');
UPDATE vocab_words SET ipa='/ˈfɔːr.tʃən.ət.li/', def_zh='幸运的是', def_en='In a way that is fortunate or advantageous.', updated_at=now() WHERE lower(headword)=lower('fortunately');
UPDATE vocab_words SET ipa='/əkˈsɛs.ə.bəl/', def_zh='可接近的；可获得的', def_en='Able to be reached, entered, or used easily.', updated_at=now() WHERE lower(headword)=lower('accessible');
UPDATE vocab_words SET ipa='/ˈpæt.ənt/', def_zh='专利', def_en='A legal right to exclude others from an invention.', updated_at=now() WHERE lower(headword)=lower('patent');
UPDATE vocab_words SET ipa='/ʃɑrk/', def_zh='鲨鱼', def_en='A large predatory fish known for its sharp teeth.', updated_at=now() WHERE lower(headword)=lower('shark');
UPDATE vocab_words SET ipa='/oʊk/', def_zh='橡树', def_en='A large tree known for its strength and hard wood.', updated_at=now() WHERE lower(headword)=lower('oak');
UPDATE vocab_words SET ipa='/dæm/', def_zh='该死；可恶', def_en='Used to express anger or frustration.', updated_at=now() WHERE lower(headword)=lower('damn');
UPDATE vocab_words SET ipa='/ˌkɒn.frʌnˈteɪ.ʃən/', def_zh='对抗；冲突', def_en='A situation where people or groups oppose each other.', updated_at=now() WHERE lower(headword)=lower('confrontation');
UPDATE vocab_words SET ipa='/dɪˈplɔɪ/', def_zh='部署', def_en='To arrange or utilize resources effectively for a purpose.', updated_at=now() WHERE lower(headword)=lower('deploy');
UPDATE vocab_words SET ipa='/ɪkˈskluː.sɪv.li/', def_zh='专门地', def_en='Only for a specific purpose or group, not including others.', updated_at=now() WHERE lower(headword)=lower('exclusively');
UPDATE vocab_words SET ipa='/θæŋksˈɡɪvɪŋ/', def_zh='感恩节', def_en='A holiday for expressing gratitude, often celebrated in November.', updated_at=now() WHERE lower(headword)=lower('thanksgiving');
UPDATE vocab_words SET ipa='/ˈhɜːr.ɪ.keɪn/', def_zh='飓风', def_en='A large, powerful storm with strong winds and heavy rain.', updated_at=now() WHERE lower(headword)=lower('hurricane');
UPDATE vocab_words SET ipa='/skɪp/', def_zh='跳过；略过', def_en='To omit or leave out something intentionally.', updated_at=now() WHERE lower(headword)=lower('skip');
UPDATE vocab_words SET ipa='/ˈklæs.ɪ.faɪ/', def_zh='分类；归类', def_en='To arrange or sort into categories or classes.', updated_at=now() WHERE lower(headword)=lower('classify');
UPDATE vocab_words SET ipa='/æmˈbæsədər/', def_zh='大使', def_en='A representative of a country or organization in a foreign place.', updated_at=now() WHERE lower(headword)=lower('ambassador');
UPDATE vocab_words SET ipa='/ʌnˈfoʊld/', def_zh='展开', def_en='To open or spread out something that was folded or closed.', updated_at=now() WHERE lower(headword)=lower('unfold');
UPDATE vocab_words SET ipa='/əˈɡrɛʃ.ən/', def_zh='侵略；攻击', def_en='Hostile or violent behavior toward others.', updated_at=now() WHERE lower(headword)=lower('aggression');
UPDATE vocab_words SET ipa='/ˈtaɪ.tən/', def_zh='收紧', def_en='To make something tighter or firmer than before.', updated_at=now() WHERE lower(headword)=lower('tighten');
UPDATE vocab_words SET ipa='/bækˈtɪr.i.əm/', def_zh='细菌', def_en='A single-celled microorganism that can cause disease.', updated_at=now() WHERE lower(headword)=lower('bacterium');
UPDATE vocab_words SET ipa='/kruːz/', def_zh='巡航；游轮', def_en='A journey on a ship for pleasure or recreation.', updated_at=now() WHERE lower(headword)=lower('cruise');
UPDATE vocab_words SET ipa='/ˌsɪməˈlærɪti/', def_zh='相似；相似性', def_en='The state of being alike or having common features.', updated_at=now() WHERE lower(headword)=lower('similarity');
UPDATE vocab_words SET ipa='/steɪk/', def_zh='牛排', def_en='A slice of meat, typically beef, cooked by grilling or frying.', updated_at=now() WHERE lower(headword)=lower('steak');
UPDATE vocab_words SET ipa='/ˈfɔː.rəm/', def_zh='论坛', def_en='A place for discussion or exchange of ideas.', updated_at=now() WHERE lower(headword)=lower('forum');
UPDATE vocab_words SET ipa='/sɔr/', def_zh='高飞；飞翔', def_en='To rise high in the air; to fly upward.', updated_at=now() WHERE lower(headword)=lower('soar');
UPDATE vocab_words SET ipa='/tʃɑrm/', def_zh='魅力；魔力', def_en='A quality that attracts, fascinates, or delights.', updated_at=now() WHERE lower(headword)=lower('charm');
UPDATE vocab_words SET ipa='/dɪˈnaɪ.əl/', def_zh='否认', def_en='Refusal to accept the existence or truth of something.', updated_at=now() WHERE lower(headword)=lower('denial');
UPDATE vocab_words SET ipa='/fænˈtæstɪk/', def_zh='极好的；奇妙的', def_en='Extraordinarily good or impressive; remarkable.', updated_at=now() WHERE lower(headword)=lower('fantastic');
UPDATE vocab_words SET ipa='/ˈiː.ɡoʊ/', def_zh='自我；自尊', def_en='The sense of self-importance or self-esteem of an individual.', updated_at=now() WHERE lower(headword)=lower('ego');
UPDATE vocab_words SET ipa='/ˈfrædʒ.aɪl/', def_zh='脆弱的', def_en='Easily broken or damaged; delicate in nature.', updated_at=now() WHERE lower(headword)=lower('fragile');
UPDATE vocab_words SET ipa='/əˌveɪ.ləˈbɪl.ɪ.ti/', def_zh='可用性', def_en='The state of being able to be used or obtained.', updated_at=now() WHERE lower(headword)=lower('availability');
UPDATE vocab_words SET ipa='/ˈsoʊ.fə/', def_zh='沙发', def_en='A comfortable seat for multiple people, typically with cushions.', updated_at=now() WHERE lower(headword)=lower('sofa');
UPDATE vocab_words SET ipa='/aɪˈrɑː.nɪ.kli/', def_zh='具有讽刺意味地；反讽地', def_en='In a manner that is opposite to what is expected or intended.', updated_at=now() WHERE lower(headword)=lower('ironically');
UPDATE vocab_words SET ipa='/ˈʌp.deɪt/', def_zh='更新；修正', def_en='To make something more modern or up to date.', updated_at=now() WHERE lower(headword)=lower('update');
UPDATE vocab_words SET ipa='/ˈmiːn.taɪm/', def_zh='同时；其间', def_en='The period of time in between events or actions.', updated_at=now() WHERE lower(headword)=lower('meantime');
UPDATE vocab_words SET ipa='/ˈjʌŋ.stər/', def_zh='年轻人', def_en='A person who is young, especially a teenager or child.', updated_at=now() WHERE lower(headword)=lower('youngster');
UPDATE vocab_words SET ipa='/ɪkˈsplɪs.ɪt/', def_zh='明确的；清晰的', def_en='Clear and direct in expression; leaving no room for confusion.', updated_at=now() WHERE lower(headword)=lower('explicit');
UPDATE vocab_words SET ipa='/slɑt/', def_zh='位置；空位', def_en='A narrow opening or a position for something.', updated_at=now() WHERE lower(headword)=lower('slot');
UPDATE vocab_words SET ipa='/ˈsɔː.fən/', def_zh='使柔软；缓和', def_en='To make less hard or severe, to reduce intensity.', updated_at=now() WHERE lower(headword)=lower('soften');
UPDATE vocab_words SET ipa='/ˈstreɪ.tən/', def_zh='整理；矫正', def_en='To make something orderly or tidy; to correct.', updated_at=now() WHERE lower(headword)=lower('straighten');

DELETE FROM vocab_examples WHERE word_id IN (SELECT id FROM vocab_words WHERE lower(headword) IN (lower('society'),lower('business'),lower('official'),lower('court'),lower('seek'),lower('fight'),lower('rise'),lower('officer'),lower('despite'),lower('environmental'),lower('physical'),lower('discover'),lower('affect'),lower('pain'),lower('goods'),lower('shot'),lower('responsibility'),lower('recall'),lower('effective'),lower('slowly'),lower('client'),lower('communication'),lower('survive'),lower('promote'),lower('chairman'),lower('spread'),lower('influence'),lower('additional'),lower('intelligence'),lower('category'),lower('perspective'),lower('studio'),lower('direct'),lower('corporate'),lower('learning'),lower('assessment'),lower('storm'),lower('analyst'),lower('catholic'),lower('criterion'),lower('rating'),lower('producer'),lower('specifically'),lower('emotional'),lower('pepper'),lower('hero'),lower('warning'),lower('curriculum'),lower('album'),lower('suicide'),lower('symptom'),lower('clinic'),lower('immigration'),lower('evaluation'),lower('consultant'),lower('historic'),lower('enterprise'),lower('accompany'),lower('recipe'),lower('historian'),lower('negotiate'),lower('criteria'),lower('occasionally'),lower('normally'),lower('refugee'),lower('pregnant'),lower('nevertheless'),lower('hip'),lower('jean'),lower('spokesman'),lower('bench'),lower('terrorist'),lower('presentation'),lower('headquarters'),lower('fade'),lower('violate'),lower('earnings'),lower('athletic'),lower('psychology'),lower('tragedy'),lower('privacy'),lower('membership'),lower('fighter'),lower('garlic'),lower('controversial'),lower('narrative'),lower('instructor'),lower('legitimate'),lower('versus'),lower('mortgage'),lower('humour'),lower('physically'),lower('competitor'),lower('script'),lower('prescription'),lower('consensus'),lower('pregnancy'),lower('defendant'),lower('anniversary'),lower('adolescent'),lower('salmon'),lower('combat'),lower('sculpture'),lower('couch'),lower('bishop'),lower('correlation'),lower('unemployment'),lower('ethical'),lower('closet'),lower('overwhelming'),lower('dose'),lower('herb'),lower('nightmare'),lower('basement'),lower('questionnaire'),lower('random'),lower('infrastructure'),lower('guilt'),lower('replacement'),lower('web'),lower('guitar'),lower('currency'),lower('promotion'),lower('southeast'),lower('detective'),lower('engagement'),lower('poster'),lower('pit'),lower('hug'),lower('elegant'),lower('candle'),lower('prevention'),lower('photography'),lower('hostage'),lower('gathering'),lower('realistic'),lower('kit'),lower('sentiment'),lower('pillow'),lower('grief'),lower('bid'),lower('tightly'),lower('dilemma'),lower('dignity'),lower('liability'),lower('grin'),lower('divine'),lower('cartoon'),lower('ancestor'),lower('productivity'),lower('bug'),lower('bonus'),lower('edit'),lower('ass'),lower('tragic'),lower('dessert'),lower('lion'),lower('utilize'),lower('panic'),lower('appreciation'),lower('consequently'),lower('correctly'),lower('fortunately'),lower('accessible'),lower('patent'),lower('shark'),lower('oak'),lower('damn'),lower('confrontation'),lower('deploy'),lower('exclusively'),lower('thanksgiving'),lower('hurricane'),lower('skip'),lower('classify'),lower('ambassador'),lower('unfold'),lower('aggression'),lower('tighten'),lower('bacterium'),lower('cruise'),lower('similarity'),lower('steak'),lower('forum'),lower('soar'),lower('charm'),lower('denial'),lower('fantastic'),lower('ego'),lower('fragile'),lower('availability'),lower('sofa'),lower('ironically'),lower('update'),lower('meantime'),lower('youngster'),lower('explicit'),lower('slot'),lower('soften'),lower('straighten')));

INSERT INTO vocab_examples (word_id, sentence, translation_zh, collocation, scene, sort_order)
VALUES
((SELECT id FROM vocab_words WHERE lower(headword)=lower('society')), 'The society we live in is constantly changing.', '我们生活的社会在不断变化。', 'the society we live in', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('society')), 'Members of society play important roles in communities.', '社会成员在社区中扮演重要角色。', 'members of society', 'culture', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('society')), 'Society as a whole must address climate change.', '整个社会必须应对气候变化。', 'society as a whole', 'news', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('business')), 'Many people want to start a business this year.', '许多人想在今年开一家公司。', 'start a business', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('business')), 'She is looking for a reliable business partner to help her.', '她在寻找一个可靠的商业伙伴来帮助她。', 'business partner', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('business')), 'We have a business meeting scheduled for next week.', '我们下周安排了一次商务会议。', 'business meeting', 'academic', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('official')), 'The official report showed a decrease in crime rates.', '官方报告显示犯罪率有所下降。', 'official report', 'news', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('official')), 'You must submit all official documents for the application.', '你必须提交所有官方文件以供申请。', 'official documents', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('official')), 'Spanish is the official language of many countries.', '西班牙语是许多国家的官方语言。', 'official language', 'culture', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('court')), 'Many people will go to court for justice.', '许多人会去法院寻求公正。', 'go to court', 'news', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('court')), 'She won her court case after a long trial.', '经过漫长的审判，她赢得了法庭案件。', 'court case', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('court')), 'The lawyer received a court order to stop the construction.', '律师收到了停止施工的法庭命令。', 'court order', 'academic', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('seek')), 'Many people seek help for their mental health issues.', '许多人寻求心理健康方面的帮助。', 'seek help', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('seek')), 'Students often seek information for their research projects.', '学生们常常寻找他们研究项目所需的信息。', 'seek information', 'education', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('seek')), 'Employees should seek advice from their supervisors regularly.', '员工应该定期向他们的主管寻求建议。', 'seek advice', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('fight')), 'Many people fight for their rights every day.', '许多人每天都在为自己的权利而斗争。', 'fight for your rights', 'culture', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('fight')), 'Students often fight against injustice in their communities.', '学生们常常在社区中反对不公正。', 'fight against injustice', 'education', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('fight')), 'Sometimes, friends fight with each other over small issues.', '有时，朋友们会因为小事而争吵。', 'fight with friends', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('rise')), 'The temperature will rise during the summer months.', '夏季气温会升高。', 'rise in temperature', 'science_tech', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('rise')), 'Experts predict a rise of prices in the next year.', '专家预测明年物价会上涨。', 'rise of prices', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('rise')), 'She prefers to rise early every morning for exercise.', '她喜欢每天早上早起锻炼。', 'rise early', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('officer')), 'Officers help keep our neighborhoods safe and secure.', '官员帮助保持我们社区的安全与安宁。', 'police officer', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('officer')), 'He is a military officer who leads his team effectively.', '他是一名有效领导团队的军官。', 'military officer', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('officer')), 'Government officers announced new policies to improve health.', '政府官员宣布了改善健康的新政策。', 'government officer', 'news', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('despite')), 'Despite the difficulties, we completed the project on time.', '尽管有困难，我们按时完成了项目。', 'despite the difficulties', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('despite')), 'She went for a walk despite the weather being bad.', '尽管天气不好，她还是去散步了。', 'despite the weather', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('despite')), 'Students can learn quickly despite their age differences.', '学生们可以迅速学习，尽管他们的年龄不同。', 'despite their age', 'education', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('environmental')), 'Many countries are facing serious environmental issues today.', '许多国家今天面临严重的环境问题。', 'environmental issues', 'news', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('environmental')), 'We should all support environmental protection initiatives in our community.', '我们都应该支持社区的环境保护倡议。', 'environmental protection', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('environmental')), 'Scientists study environmental changes to understand climate effects.', '科学家研究环境变化以了解气候影响。', 'environmental changes', 'science_tech', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('physical')), 'Regular physical activity is important for good health.', '定期的身体活动对健康很重要。', 'physical activity', 'health', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('physical')), 'Students learn sports in their physical education classes.', '学生在体育课上学习运动。', 'physical education', 'education', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('physical')), 'Her physical appearance reflects her healthy lifestyle choices.', '她的外貌反映了她健康的生活方式。', 'physical appearance', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('discover')), 'Students usually discover new things in the classroom.', '学生们通常在课堂上发现新事物。', 'discover new things', 'education', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('discover')), 'Investigators worked hard to discover the truth behind the case.', '调查人员努力揭露案件背后的真相。', 'discover the truth', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('discover')), 'Travelers always want to discover new places during their trips.', '旅行者总是想在旅行中发现新地方。', 'discover new places', 'travel', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('affect')), 'Poor diet can greatly affect health in many ways.', '不良饮食会在许多方面严重影响健康。', 'affect health', 'health', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('affect')), 'Teachers can affect student behavior positively or negatively.', '老师可以正面或负面地影响学生的行为。', 'affect behavior', 'education', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('affect')), 'Human activities significantly affect climate change around the world.', '人类活动显著影响着全球气候变化。', 'affect climate', 'environment', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('pain')), 'Chronic pain can affect a person''s daily life greatly.', '慢性疼痛会严重影响一个人的日常生活。', 'chronic pain', 'health', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('pain')), 'Many people seek pain relief after an injury or surgery.', '许多人在受伤或手术后寻求缓解疼痛。', 'pain relief', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('pain')), 'Pain management is important for those with long-term conditions.', '疼痛管理对于长期疾病患者很重要。', 'pain management', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('goods')), 'People often buy consumer goods for their homes.', '人们经常为家里购买消费品。', 'consumer goods', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('goods')), 'Imported goods can sometimes be more expensive than local products.', '进口商品有时比本地产品更贵。', 'imported goods', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('goods')), 'The company specializes in goods transport across the country.', '这家公司专注于全国范围内的货物运输。', 'goods transport', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('shot')), 'She decided to take a shot at the target.', '她决定朝目标射击。', 'take a shot', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('shot')), 'A shot of adrenaline can help during emergencies.', '一针肾上腺素在紧急情况下可以提供帮助。', 'shot of adrenaline', 'health', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('shot')), 'He made a shot in the dark about the project.', '他对这个项目进行了一次盲目猜测。', 'shot in the dark', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('responsibility')), 'Everyone must take responsibility for their own actions.', '每个人都必须对自己的行为负责。', 'take responsibility', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('responsibility')), 'We all share responsibility for the success of the project.', '我们都对项目的成功共同负责。', 'share responsibility', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('responsibility')), 'Teachers bear responsibility for their students'' learning outcomes.', '教师要对学生的学习成果负责。', 'bear responsibility', 'education', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('recall')), 'She can easily recall a memory from her childhood.', '她能轻松回忆起童年的记忆。', 'recall a memory', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('recall')), 'Students often struggle to recall the details of the lecture.', '学生们常常难以回忆起讲座的细节。', 'recall the details', 'academic', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('recall')), 'You need to recall information quickly during the meeting.', '你需要在会议中迅速回忆信息。', 'recall information', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('effective')), 'Good teamwork leads to effective communication among colleagues.', '良好的团队合作促进了同事之间有效的沟通。', 'effective communication', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('effective')), 'Scientists are looking for effective solutions to climate change.', '科学家们正在寻找应对气候变化的有效解决方案。', 'effective solution', 'science_tech', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('effective')), 'An effective strategy helps you achieve your personal goals.', '有效的策略帮助你实现个人目标。', 'effective strategy', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('slowly')), 'Children often move slowly when they are tired.', '孩子们在疲惫时常常走得很慢。', 'move slowly', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('slowly')), 'In meetings, we should talk slowly for clarity.', '在会议中，我们应该缓慢地说以便让人清楚。', 'talk slowly', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('slowly')), 'After the treatment, she will slowly improve over time.', '经过治疗，她会逐渐好转。', 'slowly improve', 'health', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('client')), 'Many companies have satisfied clients who trust them.', '许多公司拥有满意的客户，信任他们。', 'satisfied clients', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('client')), 'She is meeting with new clients this afternoon.', '她今天下午要和新客户见面。', 'new clients', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('client')), 'Teachers often know their regular clients very well.', '老师们通常对他们的常客非常了解。', 'regular clients', 'education', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('communication')), 'Good leaders encourage effective communication among their teams.', '优秀的领导者鼓励团队之间有效的交流。', 'effective communication', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('communication')), 'Body language is an important part of nonverbal communication.', '肢体语言是非语言交流的重要组成部分。', 'nonverbal communication', 'culture', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('communication')), 'Students should develop strong communication skills for their future careers.', '学生应该培养良好的交流技能，以便于未来的职业。', 'communication skills', 'education', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('survive')), 'Animals must survive in the wild to thrive.', '动物必须在野外生存才能繁衍。', 'survive in the wild', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('survive')), 'Many people can survive a disaster with help.', '许多人在灾难中得到帮助可以生存。', 'survive a disaster', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('survive')), 'Employees need to survive tough times at work together.', '员工们需要一起在工作中度过艰难时期。', 'survive tough times', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('promote')), 'Schools promote education for all children every day.', '学校每天都促进所有儿童的教育。', 'promote education', 'education', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('promote')), 'We should promote health through better lifestyle choices.', '我们应该通过更好的生活方式促进健康。', 'promote health', 'health', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('promote')), 'Organizations promote awareness of local traditions to visitors.', '组织向游客促进对当地传统的认识。', 'promote awareness', 'culture', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('chairman')), 'Our chairman of the board made an important announcement today.', '我们的董事会主席今天做了一个重要的宣布。', 'chairman of the board', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('chairman')), 'She was elected for the chairman position in the organization.', '她被选为该组织的主席。', 'chairman position', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('chairman')), 'The acting chairman will lead the meeting next week.', '代理主席将在下周主持会议。', 'acting chairman', 'academic', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('spread')), 'Teachers help to spread information to their students.', '老师帮助将信息传播给他们的学生。', 'spread of information', 'education', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('spread')), 'We need to spread awareness about healthy eating.', '我们需要传播健康饮食的意识。', 'spread awareness', 'health', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('spread')), 'People often spread rumors without checking the facts.', '人们常常在没有核实事实的情况下传播谣言。', 'spread rumors', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('influence')), 'Friends often influence people''s decisions about where to eat.', '朋友们经常影响人们的用餐决定。', 'influence people''s decisions', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('influence')), 'The media can influence public opinion on important issues.', '媒体可以影响公众对重要问题的看法。', 'influence public opinion', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('influence')), 'Teachers significantly influence educational outcomes for their students.', '教师对学生的教育成果有显著影响。', 'influence educational outcomes', 'education', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('additional')), 'We need additional information for the project report.', '我们需要额外的信息来写项目报告。', 'additional information', 'education', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('additional')), 'She received additional support from her colleagues during the project.', '她在项目期间得到了同事们的额外支持。', 'additional support', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('additional')), 'The new software has several additional features to improve usability.', '新软件有多个额外功能来提高可用性。', 'additional features', 'science_tech', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('intelligence')), 'Artificial intelligence is changing how we live and work.', '人工智能正在改变我们的生活和工作。', 'artificial intelligence', 'science_tech', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('intelligence')), 'Many employers value emotional intelligence in their employees.', '许多雇主重视员工的情商。', 'emotional intelligence', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('intelligence')), 'National intelligence agencies gather information to protect the country.', '国家情报机构收集信息以保护国家。', 'national intelligence', 'news', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('category')), 'Many companies sell different types in this category of products.', '许多公司在这个产品类别中销售不同类型的产品。', 'category of products', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('category')), 'Teachers often organize lessons by category of information.', '教师通常按信息类别组织课程。', 'category of information', 'education', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('category')), 'This gallery exhibits a unique category of art from various artists.', '这个画廊展出了来自不同艺术家的独特艺术类别。', 'category of art', 'culture', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('perspective')), 'People have different perspectives on life and happiness.', '人们对生活和幸福有不同的看法。', 'different perspectives', 'culture', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('perspective')), 'From a historical perspective, events can be interpreted differently.', '从历史的角度来看，事件可以有不同的解读。', 'from a historical perspective', 'academic', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('perspective')), 'Traveling can help you gain a new perspective on your surroundings.', '旅行可以帮助你对周围的事物有新的看法。', 'gain a new perspective', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('studio')), 'Musicians often spend hours in the recording studio.', '音乐家们常常在录音室里花费数小时。', 'recording studio', 'culture', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('studio')), 'She loves painting in her art studio every weekend.', '她喜欢每个周末在自己的艺术工作室里画画。', 'art studio', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('studio')), 'Students practice for performances at the dance studio after school.', '学生们在放学后在舞蹈工作室里为表演练习。', 'dance studio', 'education', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('direct')), 'Many companies prefer direct communication with their employees.', '许多公司更喜欢与员工进行直接沟通。', 'direct communication', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('direct')), 'Users can gain direct access to the database anytime.', '用户可以随时直接访问数据库。', 'direct access', 'science_tech', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('direct')), 'I booked a direct flight to New York for the summer.', '我为夏天预订了前往纽约的直飞航班。', 'direct flight', 'travel', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('corporate')), 'Leaders should promote a positive corporate culture within the organization.', '领导者应在组织内促进积极的企业文化。', 'corporate culture', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('corporate')), 'Many students are interested in corporate finance as a career option.', '很多学生对企业金融作为职业选择很感兴趣。', 'corporate finance', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('corporate')), 'The company faces scrutiny over its corporate responsibility initiatives.', '该公司因其企业责任举措而面临审查。', 'corporate responsibility', 'news', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('learning')), 'Teachers encourage active learning in the classroom every day.', '教师每天都鼓励课堂上的主动学习。', 'active learning', 'education', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('learning')), 'Many employees are learning new skills to adapt to changes.', '许多员工正在学习新技能以适应变化。', 'learning new skills', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('learning')), 'The learning process can be different for each individual.', '学习过程对每个人来说可能都不同。', 'learning process', 'science_tech', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('assessment')), 'Teachers conduct performance assessments to measure student progress.', '教师进行表现评估，以衡量学生的进步。', 'performance assessment', 'education', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('assessment')), 'Companies perform risk assessments to identify potential hazards.', '公司进行风险评估，以识别潜在的危险。', 'risk assessment', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('assessment')), 'Many people do self-assessments to reflect on personal growth.', '许多人进行自我评估，以反思个人成长。', 'self-assessment', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('storm')), 'Meteorologists issued a storm warning for the coastal areas.', '气象学家对沿海地区发出了风暴警告。', 'storm warning', 'news', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('storm')), 'Dark storm clouds gathered quickly before the heavy rain started.', '在暴雨来临之前，乌云迅速聚集。', 'storm clouds', 'environment', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('storm')), 'The community assessed the storm damage after the winds passed.', '风暴过后，社区评估了风暴造成的损失。', 'storm damage', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('analyst')), 'Financial analysts evaluate investment opportunities for their clients.', '金融分析师为客户评估投资机会。', 'financial analyst', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('analyst')), 'A data analyst interprets complex datasets to help organizations.', '数据分析师解读复杂数据集来帮助组织。', 'data analyst', 'science_tech', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('analyst')), 'Market analysts study trends to advise businesses on strategies.', '市场分析师研究趋势以建议企业战略。', 'market analyst', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('catholic')), 'Many families choose catholic education for their children.', '许多家庭选择天主教教育给他们的孩子。', 'catholic education', 'education', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('catholic')), 'The catholic church plays a significant role in local communities.', '天主教会在当地社区中扮演重要角色。', 'catholic church', 'culture', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('catholic')), 'She follows catholic principles in her daily decisions.', '她在日常决定中遵循天主教原则。', 'catholic principles', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('criterion')), 'Teachers use multiple evaluation criteria to assess student performance.', '教师使用多个评估标准来评估学生的表现。', 'evaluation criterion', 'education', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('criterion')), 'Companies often establish strict selection criteria for job applicants.', '公司通常为求职者制定严格的选择标准。', 'selection criterion', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('criterion')), 'Researchers must meet specific quality criteria during their experiments.', '研究人员在实验过程中必须满足特定的质量标准。', 'quality criterion', 'science_tech', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('rating')), 'Many customers check the customer ratings before making a purchase.', '许多顾客在购买前会查看顾客评级。', 'customer rating', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('rating')), 'The movie rating helps viewers decide which films to watch.', '电影评级帮助观众决定观看哪部影片。', 'movie rating', 'culture', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('rating')), 'Our team analyzed the product ratings to improve sales strategies.', '我们的团队分析了产品评级，以改善销售策略。', 'product rating', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('producer')), 'Many film producers struggle to find funding for their projects.', '许多电影制作人努力为他们的项目寻找资金。', 'film producer', 'culture', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('producer')), 'A music producer helps artists develop their songs and sound.', '音乐制作人帮助艺术家发展他们的歌曲和音色。', 'music producer', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('producer')), 'Food producers must meet safety standards to sell their products.', '食品生产者必须满足安全标准才能出售他们的产品。', 'food producer', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('specifically')), 'Researchers specifically focused on the effects of climate change.', '研究人员具体关注气候变化的影响。', 'specifically focused on', 'academic', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('specifically')), 'The campaign is specifically targeting young voters this year.', '这次活动今年专门针对年轻选民。', 'specifically targeting', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('specifically')), 'This tool is used specifically for cutting metal surfaces.', '这个工具是专门用于切割金属表面的。', 'used specifically for', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('emotional')), 'Leaders often need to demonstrate emotional intelligence in their roles.', '领导者在岗位上常常需要展现情商。', 'emotional intelligence', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('emotional')), 'Friends provide essential emotional support during difficult times.', '朋友在困难时期提供重要的情感支持。', 'emotional support', 'health', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('emotional')), 'She had an emotional response to the movie''s ending.', '她对电影的结局有情感反应。', 'emotional response', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('pepper')), 'Many people enjoy adding black pepper to their dishes.', '许多人喜欢在菜肴中加入黑胡椒。', 'black pepper', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('pepper')), 'The security guard carried pepper spray for self-defense purposes.', '保安携带胡椒喷雾以防身。', 'pepper spray', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('pepper')), 'At the dinner table, the pepper shaker was empty after the meal.', '吃完饭后，餐桌上的胡椒瓶已经空了。', 'pepper shaker', 'culture', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('hero')), 'People celebrate their national hero on special occasions every year.', '人们在每年特定的日子庆祝他们的民族英雄。', 'national hero', 'culture', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('hero')), 'She considers her mother an everyday hero for always helping others.', '她认为母亲是日常生活中的英雄，因为她总是帮助他人。', 'everyday hero', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('hero')), 'The local hero received an award for his bravery during the crisis.', '这位当地英雄因在危机中的勇敢而获得奖项。', 'local hero', 'news', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('warning')), 'Officials issued a fire warning due to dry conditions.', '由于干燥条件，官员们发出了火灾警告。', 'fire warning', 'news', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('warning')), 'Doctors advise recognizing warning signs of serious illnesses early.', '医生建议早期识别严重疾病的警告信号。', 'warning signs', 'health', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('warning')), 'Make sure to read the warning label before using the product.', '使用产品前，请务必阅读警告标签。', 'warning label', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('curriculum')), 'Teachers must update the school curriculum regularly to stay relevant.', '教师必须定期更新学校课程，以保持相关性。', 'school curriculum', 'education', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('curriculum')), 'Our team is focused on curriculum development for the new training program.', '我们的团队专注于新培训项目的课程开发。', 'curriculum development', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('curriculum')), 'The national curriculum ensures all students receive a quality education.', '国家课程确保所有学生接受质量教育。', 'national curriculum', 'academic', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('album')), 'Many fans eagerly anticipate the release of a new music album.', '许多粉丝热切期待新音乐专辑的发布。', 'music album', 'culture', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('album')), 'She created a beautiful photo album for their vacation memories.', '她为他们的假期回忆制作了一个美丽的相册。', 'photo album', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('album')), 'The designer presented several ideas for the album cover during the meeting.', '设计师在会议上展示了几种专辑封面的创意。', 'album cover', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('suicide')), 'Many people still commit suicide due to mental health issues.', '许多人因心理健康问题而选择自杀。', 'commit suicide', 'news', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('suicide')), 'Recent reports show rising suicide rates among teenagers.', '最近的报告显示青少年的自杀率在上升。', 'suicide rates', 'health', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('suicide')), 'Schools are implementing suicide prevention programs for students.', '学校正在为学生实施自杀预防计划。', 'suicide prevention', 'education', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('symptom')), 'Many patients report common symptoms like fatigue and headaches.', '许多患者报告常见症状，如疲劳和头痛。', 'common symptoms', 'health', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('symptom')), 'Doctors warned that serious symptoms should not be ignored.', '医生警告说，严重症状不应被忽视。', 'serious symptoms', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('symptom')), 'Researchers studied initial symptoms to improve early diagnosis.', '研究人员研究了初始症状，以改善早期诊断。', 'initial symptoms', 'science_tech', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('clinic')), 'Many patients visit the medical clinic for regular check-ups.', '许多病人定期去诊所检查身体。', 'medical clinic', 'health', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('clinic')), 'She took her child to the dental clinic for a check-up.', '她带孩子去牙科诊所检查。', 'dental clinic', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('clinic')), 'A private clinic can offer specialized services not available elsewhere.', '私人诊所可以提供其他地方没有的专业服务。', 'private clinic', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('immigration')), 'Many countries are changing their immigration policies this year.', '许多国家今年正在改变移民政策。', 'immigration policies', 'news', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('immigration')), 'The immigration process can be complex and time-consuming.', '移民过程可能复杂且耗时。', 'immigration process', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('immigration')), 'His immigration status affects his ability to work legally.', '他的移民身份影响他合法工作的能力。', 'immigration status', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('evaluation')), 'Managers conduct performance evaluations regularly to improve employee productivity.', '经理定期进行绩效评估，以提高员工生产力。', 'performance evaluation', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('evaluation')), 'Students often engage in self-evaluation to reflect on their learning progress.', '学生们经常进行自我评估，以反思他们的学习进展。', 'self-evaluation', 'education', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('evaluation')), 'Peer evaluations are helpful for providing constructive feedback among students.', '同伴评估对于同学之间提供建设性反馈很有帮助。', 'peer evaluation', 'academic', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('consultant')), 'Companies hire management consultants to improve their performance.', '公司聘请管理顾问来提高他们的业绩。', 'management consultant', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('consultant')), 'She met with a financial consultant to discuss her investments.', '她会见了一位财务顾问，讨论她的投资。', 'financial consultant', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('consultant')), 'The healthcare consultant advised on improving patient care systems.', '这位医疗顾问建议改进患者护理系统。', 'healthcare consultant', 'health', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('historic')), 'Many people remember the historic event of the moon landing.', '许多人记得登月这一历史性事件。', 'historic event', 'news', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('historic')), 'Visitors come to see the historic site of the ancient ruins.', '游客来参观古代遗址这一历史性地点。', 'historic site', 'travel', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('historic')), 'The two countries reached a historic agreement after years of negotiation.', '经过多年的谈判，两国达成了一项历史性协议。', 'historic agreement', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('enterprise')), 'Social enterprises aim to address social issues while making profits.', '社会企业旨在解决社会问题，同时盈利。', 'social enterprise', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('enterprise')), 'Private enterprises play a crucial role in the economy''s growth.', '私营企业在经济增长中发挥着关键作用。', 'private enterprise', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('enterprise')), 'Promoting an enterprise culture can enhance students'' entrepreneurial skills.', '推广企业文化可以增强学生的创业技能。', 'enterprise culture', 'education', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('accompany')), 'She will accompany her friend to the market tomorrow.', '她明天会陪朋友去市场。', 'accompany someone', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('accompany')), 'This dish is best accompanied by a glass of wine.', '这道菜最好搭配一杯葡萄酒。', 'accompany a meal', 'culture', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('accompany')), 'The report will accompany the presentation for better understanding.', '报告将伴随演示，以便更好理解。', 'accompany a presentation', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('recipe')), 'Many people share their favorite cooking recipes online.', '很多人在线分享他们最喜欢的食谱。', 'cooking recipe', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('recipe')), 'She inherited a family recipe for traditional bread.', '她继承了一份传统面包的家族食谱。', 'family recipe', 'culture', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('recipe')), 'Ignoring safety rules is a recipe for disaster in construction.', '忽视安全规则在建筑中是灾难的根源。', 'recipe for disaster', 'news', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('historian')), 'Many historians claim that ancient civilizations were more advanced than we think.', '许多历史学家声称，古代文明比我们想象的更先进。', 'historian claims', 'culture', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('historian')), 'The historian argues that interpretation of events can change over time.', '历史学家认为，事件的解读可能随着时间而改变。', 'historian argues', 'academic', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('historian')), 'A prominent historian recently published a book on World War II.', '一位著名的历史学家最近出版了一本关于第二次世界大战的书。', 'prominent historian', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('negotiate')), 'Many companies negotiate a contract before starting a project.', '许多公司在开始一个项目之前会谈判合同。', 'negotiate a contract', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('negotiate')), 'The nations negotiate a deal to reduce carbon emissions.', '各国正在谈判达成减少碳排放的协议。', 'negotiate a deal', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('negotiate')), 'Students learn how to negotiate terms in a group project.', '学生们学习如何在小组项目中谈判条款。', 'negotiate terms', 'academic', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('criteria')), 'Admissions criteria for this university are quite competitive.', '这所大学的录取标准相当严格。', 'admission criteria', 'education', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('criteria')), 'Employers often list selection criteria in job advertisements.', '雇主通常在招聘广告中列出选拔标准。', 'selection criteria', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('criteria')), 'Researchers developed specific evaluation criteria for the new technology.', '研究人员为这项新技术制定了具体的评估标准。', 'evaluation criteria', 'science_tech', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('occasionally')), 'Delivery times can be affected; occasionally, there are delays.', '送货时间可能会受到影响，偶尔会有延误。', 'occasionally, there are delays', 'news', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('occasionally')), 'Employees are encouraged to occasionally participate in meetings.', '鼓励员工偶尔参加会议。', 'occasionally participate in meetings', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('occasionally')), 'I try to occasionally visit family during holidays.', '我尽量在假期中偶尔探望家人。', 'occasionally visit family', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('normally')), 'Researchers normally expect results to show significant improvements.', '研究人员通常期望结果显示显著改善。', 'normally expected results', 'science_tech', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('normally')), 'Teachers normally used methods that engage students in learning.', '教师通常使用吸引学生参与学习的方法。', 'normally used methods', 'education', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('normally')), 'The park is normally quiet during the early morning hours.', '公园在清晨通常很安静。', 'normally quiet', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('refugee')), 'Many countries are facing a refugee crisis due to ongoing wars.', '由于持续的战争，许多国家面临难民危机。', 'refugee crisis', 'news', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('refugee')), 'The charity provides food and shelter in refugee camps around the world.', '该慈善机构在全球的难民营提供食物和庇护所。', 'refugee camp', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('refugee')), 'He applied for refugee status after fleeing his home country.', '他在逃离祖国后申请了难民身份。', 'refugee status', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('pregnant')), 'Many pregnant women need special medical care during their pregnancy.', '许多怀孕的女性在怀孕期间需要特别的医疗护理。', 'pregnant women', 'health', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('pregnant')), 'The research project is pregnant with possibilities for future advancements.', '该研究项目充满了未来进展的可能性。', 'pregnant with', 'science_tech', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('pregnant')), 'Some couples find it difficult to become pregnant after trying for years.', '一些夫妇在尝试多年后发现怀孕很困难。', 'become pregnant', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('nevertheless')), 'The weather was awful; nevertheless, the event continued as planned.', '天气很糟糕，然而，活动还是按计划进行。', '..., nevertheless, ...', 'news', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('nevertheless')), 'Despite the challenges, the researchers made significant progress; nevertheless, further work is needed.', '尽管面临挑战，研究人员取得了显著进展，然而，仍需进一步的工作。', 'Despite the challenges, nevertheless', 'academic', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('nevertheless')), 'I was tired, but nevertheless I finished the project on time.', '我很累，然而我还是按时完成了项目。', '..., but nevertheless', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('hip')), 'Many young people enjoy hip hop music and culture today.', '许多年轻人如今喜欢嘻哈音乐和文化。', 'hip hop', 'culture', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('hip')), 'Doctors often treat injuries related to the hip joint.', '医生常常治疗与髋关节相关的损伤。', 'hip joint', 'health', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('hip')), 'She always wears the latest hip fashion in her outfits.', '她的服装总是穿着最新的时髦潮流。', 'hip fashion', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('jean')), 'I wear blue jeans whenever I go out with friends.', '我和朋友出门时总是穿蓝色牛仔裤。', 'blue jeans', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('jean')), 'Denim jeans are popular among people of all ages.', '牛仔裤在各个年龄段的人中都很受欢迎。', 'denim jeans', 'culture', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('jean')), 'She prefers wearing skinny jeans to the office on casual Fridays.', '她喜欢在休闲星期五穿紧身牛仔裤去办公室。', 'skinny jeans', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('spokesman')), 'The company spokesman announced the new policy today.', '公司发言人今天宣布了新政策。', 'company spokesman', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('spokesman')), 'In response, the government spokesman denied any wrongdoing.', '对此，政府发言人否认了任何不当行为。', 'government spokesman', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('spokesman')), 'An official spokesman will address the public later this week.', '一位官方发言人将于本周晚些时候向公众讲话。', 'official spokesman', 'culture', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('bench')), 'Children often play around the park bench during weekends.', '孩子们通常在周末围着长凳玩耍。', 'park bench', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('bench')), 'Athletes use the bench press to improve their upper body strength.', '运动员使用卧推来增强他们的上肢力量。', 'bench press', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('bench')), 'The judicial bench delivered a significant ruling last week.', '法庭上周作出了一个重要裁决。', 'judicial bench', 'news', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('terrorist')), 'A terrorist attack occurred in the city yesterday morning.', '昨天早晨，城市发生了一起恐怖分子袭击。', 'terrorist attack', 'news', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('terrorist')), 'Several countries are combating a terrorist organization in the region.', '几个国家正在打击该地区的恐怖组织。', 'terrorist organization', 'academic', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('terrorist')), 'They reported suspicious terrorist activities near the embassy.', '他们报告大使馆附近出现可疑的恐怖活动。', 'terrorist activities', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('presentation')), 'Many employees will make a presentation this week.', '许多员工将在本周做演示。', 'make a presentation', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('presentation')), 'Students need to develop good presentation skills for their projects.', '学生需要为他们的项目培养良好的演示技巧。', 'presentation skills', 'education', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('presentation')), 'The scientist prepared effective presentation slides for the conference.', '科学家为会议准备了有效的演示文稿。', 'presentation slides', 'science_tech', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('headquarters')), 'Our company headquarters is located in downtown Chicago.', '我们公司的总部位于芝加哥市中心。', 'company headquarters', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('headquarters')), 'The military headquarters announced a new strategic plan yesterday.', '军事总部昨天宣布了一项新的战略计划。', 'military headquarters', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('headquarters')), 'They opened a regional headquarters to better serve local communities.', '他们开设了一个区域总部，以更好地服务当地社区。', 'regional headquarters', 'culture', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('fade')), 'He watched the colors fade away from the sunset.', '他注视着夕阳的颜色逐渐褪去。', 'fade away', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('fade')), 'The music will fade in slowly as the scene changes.', '随着场景的变化，音乐会慢慢响起。', 'fade in', 'culture', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('fade')), 'She decided to fade out her involvement in the project.', '她决定逐渐减少对这个项目的参与。', 'fade out', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('violate')), 'Companies that violate regulations often face severe penalties.', '违反规定的公司通常会面临严厉的惩罚。', 'violate regulations', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('violate')), 'People should not violate privacy without consent from others.', '未经他人同意，不应侵犯隐私。', 'violate privacy', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('violate')), 'Reports indicate that many governments violate human rights regularly.', '报告显示，许多政府定期侵犯人权。', 'violate human rights', 'news', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('earnings')), 'The earnings report showed significant growth for the company this quarter.', '收益报告显示该公司本季度有显著增长。', 'earnings report', 'news', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('earnings')), 'We need to review the earnings statement to understand our financial position.', '我们需要审查收益报表以了解我们的财务状况。', 'earnings statement', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('earnings')), 'An earnings increase can indicate a successful business strategy over time.', '收益增加可以表明长期成功的商业策略。', 'earnings increase', 'academic', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('athletic')), 'She improved her athletic performance through consistent training and dedication.', '通过持续的训练和努力，她提高了运动表现。', 'athletic performance', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('athletic')), 'Many people enjoy watching athletic events during the summer Olympics.', '许多人喜欢在夏季奥运会上观看运动赛事。', 'athletic events', 'culture', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('athletic')), 'Students develop athletic skills in physical education classes at school.', '学生在学校的体育课上发展运动技能。', 'athletic skills', 'education', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('psychology')), 'Developmental psychology explores how people grow and change over their lives.', '发展心理学探讨人们如何在一生中成长和变化。', 'developmental psychology', 'academic', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('psychology')), 'Social psychology examines how individuals influence and are influenced by others.', '社会心理学研究个体是如何影响他人，及被他人影响的。', 'social psychology', 'science_tech', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('psychology')), 'Cognitive psychology investigates mental processes like memory and problem-solving.', '认知心理学研究记忆和解决问题等心理过程。', 'cognitive psychology', 'education', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('tragedy')), 'Tragedy struck the town when floods caused widespread destruction.', '当洪水造成大规模破坏时，这个小镇遭遇了悲剧。', 'tragedy struck', 'news', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('tragedy')), 'Many artists create works inspired by tragic tragedies throughout history.', '许多艺术家创作灵感来源于历史上的悲剧。', 'tragic tragedy', 'culture', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('tragedy')), 'She faced a personal tragedy after losing her beloved pet.', '失去心爱的宠物后，她经历了一场个人悲剧。', 'personal tragedy', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('privacy')), 'Companies must ensure data privacy for all their users.', '公司必须确保所有用户的数据隐私。', 'data privacy', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('privacy')), 'Everyone deserves to have personal privacy at home.', '每个人都应该在家中享有个人隐私。', 'personal privacy', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('privacy')), 'New privacy laws were enacted to protect citizens'' information.', '新的隐私法被颁布以保护市民的信息。', 'privacy laws', 'news', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('membership')), 'Many people pay their membership fees annually to stay active.', '许多人每年支付会员费用以保持活跃。', 'membership fees', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('membership')), 'Each employee received a membership card for the company gym.', '每位员工都收到了公司的健身房会员卡。', 'membership card', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('membership')), 'A membership organization often offers various resources for its members.', '会员组织通常为其会员提供各种资源。', 'membership organization', 'education', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('fighter')), 'Many people admire mixed martial arts fighters for their skills.', '许多人钦佩综合格斗斗士的技能。', 'mixed martial arts fighter', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('fighter')), 'The political fighter continues to stand up against corruption.', '这位政治斗士继续反对腐败。', 'political fighter', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('fighter')), 'Becoming a professional fighter requires intense training and discipline.', '成为职业斗士需要严格的训练和自律。', 'professional fighter', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('garlic')), 'Many recipes call for crushed garlic cloves to enhance flavor.', '许多食谱要求压碎大蒜瓣以增强风味。', 'garlic cloves', 'culture', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('garlic')), 'We often enjoy garlic bread with our pasta dishes.', '我们经常在意大利面配餐时享用大蒜面包。', 'garlic bread', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('garlic')), 'Garlic oil is known for its health benefits and can boost immunity.', '大蒜油因其健康益处而闻名，可以增强免疫力。', 'garlic oil', 'health', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('controversial')), 'Many politicians avoid discussing controversial issues to maintain support.', '许多政客避免讨论有争议的问题以维持支持。', 'controversial issue', 'news', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('controversial')), 'Her controversial decision led to heated debates within the company.', '她的有争议决定导致公司内部激烈辩论。', 'controversial decision', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('controversial')), 'Students often engage in debates about controversial topics in class.', '学生们常常在课堂上就有争议的话题进行辩论。', 'controversial topic', 'academic', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('narrative')), 'She shared her personal narrative during the family gathering.', '她在家庭聚会上分享了她的个人故事。', 'personal narrative', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('narrative')), 'Understanding narrative structure is essential for effective storytelling.', '理解叙述结构对有效讲故事至关重要。', 'narrative structure', 'education', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('narrative')), 'Filmmakers often use various narrative techniques to engage audiences.', '电影制作人经常使用各种叙事技巧来吸引观众。', 'narrative techniques', 'culture', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('instructor')), 'Many schools require instructor training for new teachers.', '许多学校要求新教师进行讲师培训。', 'instructor training', 'education', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('instructor')), 'She works as a certified instructor for a fitness program.', '她担任健身项目的认证讲师。', 'certified instructor', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('instructor')), 'The university invited a guest instructor to teach the seminar.', '大学邀请了一位客座讲师来教授研讨会。', 'guest instructor', 'academic', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('legitimate')), 'Many entrepreneurs start legitimate businesses to earn a living.', '许多企业家创办合法的公司以谋生。', 'legitimate business', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('legitimate')), 'Citizens raised legitimate concerns about the new policy changes.', '市民对新政策的变化提出了合理的担忧。', 'legitimate concerns', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('legitimate')), 'Students must provide legitimate reasons for missing classes.', '学生必须提供缺席课程的合理理由。', 'legitimate reasons', 'education', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('versus')), 'Many people struggle with the choice between time versus money.', '很多人都在时间和金钱之间苦苦挣扎。', 'time versus money', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('versus')), 'The debate on nature versus nurture continues to be a popular topic.', '关于自然与养育的辩论仍然是一个热门话题。', 'nature versus nurture', 'science_tech', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('versus')), 'In many countries, democracy versus dictatorship is a critical issue.', '在许多国家，民主与独裁是一个关键问题。', 'democracy versus dictatorship', 'culture', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('mortgage')), 'Homeowners often struggle to make their mortgage payments each month.', '房主每月常常难以支付抵押贷款。', 'mortgage payment', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('mortgage')), 'Submitting a mortgage application requires several important documents and information.', '提交抵押贷款申请需要几份重要的文件和信息。', 'mortgage application', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('mortgage')), 'Mortgage interest rates have recently increased, affecting many buyers.', '抵押贷款利率最近已上升，影响了许多买家。', 'mortgage interest rates', 'news', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('humour')), 'People with a sense of humour make life more enjoyable.', '有幽默感的人让生活更加愉快。', 'sense of humour', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('humour')), 'Humour in the workplace can improve team morale significantly.', '工作场所的幽默可以显著改善团队士气。', 'humour in the workplace', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('humour')), 'Some films use black humour to address serious issues.', '一些电影采用黑色幽默来处理严肃问题。', 'black humour', 'culture', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('physically')), 'People who are physically active tend to have better health.', '活跃的人通常更健康。', 'physically active', 'health', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('physically')), 'This job is physically demanding and requires strength and stamina.', '这份工作对身体有很高的要求，需要力量和耐力。', 'physically demanding', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('physically')), 'Students must be physically present to participate in the experiment.', '学生必须亲自到场才能参加实验。', 'physically present', 'education', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('competitor')), 'Many market competitors are entering the tech industry this year.', '许多市场竞争者今年进入了科技行业。', 'market competitors', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('competitor')), 'Our company is a strong competitor in the renewable energy sector.', '我公司在可再生能源领域是个强劲的竞争者。', 'strong competitor', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('competitor')), 'Local competitors often influence prices in small towns.', '地方竞争者往往影响小镇的价格。', 'local competitors', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('script')), 'Many directors have their own unique style for writing scripts.', '许多导演都有自己独特的编剧风格。', 'movie script', 'culture', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('script')), 'Students often practice script writing in creative writing classes.', '学生们经常在创意写作课上练习编写剧本。', 'script writing', 'education', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('script')), 'Understanding script format is essential for film and television production.', '理解剧本格式对电影和电视制作至关重要。', 'script format', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('prescription')), 'Doctors often write medical prescriptions for their patients'' needs.', '医生通常为病人的需求开具医疗处方。', 'medical prescription', 'health', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('prescription')), 'Many people rely on prescription medications to manage chronic conditions.', '许多人依赖处方药来管理慢性疾病。', 'prescription medication', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('prescription')), 'Pharmacists are trained to fill a prescription accurately and efficiently.', '药剂师接受培训，以准确高效地配药。', 'fill a prescription', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('consensus')), 'They need to reach a consensus on the project timeline.', '他们需要就项目时间表达成共识。', 'reach a consensus', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('consensus')), 'Teachers are trying to build consensus about the new curriculum.', '教师们正在努力就新课程达成共识。', 'build consensus', 'education', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('consensus')), 'The consensus opinion is that the election will be competitive.', '共识意见是这次选举将会非常激烈。', 'consensus opinion', 'news', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('pregnancy')), 'Many doctors monitor high-risk pregnancies closely for complications.', '许多医生密切监测高风险怀孕以防并发症。', 'high-risk pregnancy', 'health', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('pregnancy')), 'She faced challenges due to her unplanned pregnancy at a young age.', '由于年轻时的意外怀孕，她面临挑战。', 'unplanned pregnancy', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('pregnancy')), 'Teenage pregnancies have decreased in recent years due to education efforts.', '近年来，青少年怀孕因教育工作而减少。', 'teenage pregnancy', 'news', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('defendant')), 'The defendant''s attorney argued strongly for a reduced sentence.', '被告的律师强烈主张减轻刑罚。', 'the defendant''s attorney', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('defendant')), 'A defendant in a trial must present their case effectively.', '在审判中的被告必须有效地陈述自己的案件。', 'defendant in a trial', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('defendant')), 'Understanding a defendant''s rights is crucial in legal education.', '了解被告的权利在法律教育中至关重要。', 'defendant''s rights', 'academic', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('anniversary')), 'They celebrated their wedding anniversary at a fancy restaurant.', '他们在一家高档餐厅庆祝他们的结婚周年纪念。', 'wedding anniversary', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('anniversary')), 'The anniversary celebration attracted many visitors to the city.', '周年纪念庆祝活动吸引了许多游客来到这座城市。', 'anniversary celebration', 'culture', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('anniversary')), 'This is a special year for their anniversary of founding the school.', '这是他们创办学校周年纪念的特殊年份。', 'anniversary year', 'education', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('adolescent')), 'Educational programs often focus on adolescent development and well-being.', '教育项目通常侧重于青少年的发展和福祉。', 'adolescent development', 'education', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('adolescent')), 'Understanding adolescent behavior can help parents support their children better.', '理解青少年的行为可以帮助父母更好地支持孩子。', 'adolescent behavior', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('adolescent')), 'Adolescent mental health issues are becoming increasingly recognized in society.', '青少年的心理健康问题在社会上变得越来越受到重视。', 'adolescent mental health', 'health', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('salmon')), 'Many people enjoy eating smoked salmon on bagels for breakfast.', '许多人喜欢在贝果上吃熏鲑鱼作为早餐。', 'smoked salmon', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('salmon')), 'He spent the weekend in Alaska salmon fishing with his friends.', '他和朋友们在阿拉斯加度过了周末，捕捞鲑鱼。', 'salmon fishing', 'culture', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('salmon')), 'Researchers are studying the salmon population in the river this year.', '研究人员今年正在研究河流中的鲑鱼种群。', 'salmon population', 'environment', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('combat')), 'Governments are trying to combat issues related to climate change.', '各国政府正努力应对与气候变化相关的问题。', 'combat issues', 'news', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('combat')), 'Cities work hard to combat crime and improve safety for residents.', '各城市努力抗击犯罪，提高居民的安全。', 'combat crime', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('combat')), 'Companies must find ways to combat inflation in their pricing strategies.', '公司必须找到在定价策略中对抗通货膨胀的方法。', 'combat inflation', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('sculpture')), 'Artists often create beautiful stone sculptures for public spaces.', '艺术家们经常为公共场所创作美丽的石雕。', 'stone sculpture', 'culture', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('sculpture')), 'The gallery exhibits several pieces of modern sculpture from renowned artists.', '画廊展出了几件著名艺术家的现代雕塑作品。', 'modern sculpture', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('sculpture')), 'Visitors can relax and enjoy the sculpture garden during their walk.', '游客可以在散步时放松身心，欣赏雕塑花园。', 'sculpture garden', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('couch')), 'Many people become couch potatoes after a long day at work.', '许多人在工作一天后变得懒惰，像个沙发土豆。', 'couch potato', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('couch')), 'This sofa couch is perfect for hosting family gatherings on weekends.', '这张沙发非常适合周末举办家庭聚会。', 'sofa couch', 'culture', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('couch')), 'Couch surfing allows travelers to stay with locals for free.', '沙发冲浪让旅行者可以免费寄宿在当地人家里。', 'couch surfing', 'travel', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('bishop')), 'The bishop''s role is crucial for community leadership.', '主教的角色对社区领导至关重要。', 'the bishop''s role', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('bishop')), 'Many leaders attended the bishop''s conference this week.', '本周，许多领导出席了主教会议。', 'bishop''s conference', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('bishop')), 'Our local bishop often visits the parish on Sundays.', '我们当地的主教常常在星期天探访教区。', 'local bishop', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('correlation')), 'A positive correlation exists between study time and exam scores.', '学习时间与考试分数之间存在正相关性。', 'positive correlation', 'academic', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('correlation')), 'Researchers calculated the correlation coefficient for the data set.', '研究人员计算了数据集的相关系数。', 'correlation coefficient', 'science_tech', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('correlation')), 'Understanding the correlation between variables can improve project outcomes.', '了解变量之间的相关性可以改善项目结果。', 'correlation between variables', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('unemployment')), 'High unemployment rates are affecting many families across the country.', '高失业率正在影响全国许多家庭。', 'high unemployment', 'news', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('unemployment')), 'Youth unemployment remains a significant issue in many urban areas.', '青年失业在许多城市地区仍然是一个显著问题。', 'youth unemployment', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('unemployment')), 'Many people rely on unemployment benefits during tough economic times.', '许多人在经济困难时期依靠失业救济金。', 'unemployment benefits', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('ethical')), 'Companies must follow strict ethical standards every day.', '公司每天都必须遵循严格的伦理标准。', 'ethical standards', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('ethical')), 'Many ethical issues arise during medical treatments and research.', '在医疗治疗和研究中，许多伦理问题会出现。', 'ethical issues', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('ethical')), 'Students often face ethical dilemmas in their decision-making processes.', '学生在决策过程中常常面临伦理困境。', 'ethical dilemmas', 'education', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('closet')), 'I need more closet space for my winter clothes.', '我需要更多的衣柜空间来放冬衣。', 'closet space', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('closet')), 'The closet organizer helped maximize storage in the office.', '衣柜整理器帮助最大化了办公室的存储空间。', 'closet organizer', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('closet')), 'He painted the closet door a bright blue color.', '他把衣柜门刷成了明亮的蓝色。', 'closet door', 'culture', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('overwhelming')), 'The jury found the overwhelming evidence difficult to ignore.', '陪审团发现，压倒性的证据难以忽视。', 'overwhelming evidence', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('overwhelming')), 'An overwhelming majority of voters supported the new policy last election.', '在上次选举中，绝大多数选民支持这一新政策。', 'overwhelming majority', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('overwhelming')), 'She felt overwhelming emotions during the graduation ceremony.', '在毕业典礼上，她感受到了强烈的情感。', 'overwhelming emotions', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('dose')), 'She took her dose of medicine before breakfast.', '她在早餐前服用了药剂量。', 'dose of medicine', 'health', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('dose')), 'Researchers studied the effects of a high dose of the vaccine.', '研究人员研究了高剂量疫苗的效果。', 'high dose', 'science_tech', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('dose')), 'The dose response relationship is critical in drug development.', '剂量反应关系在药物开发中至关重要。', 'dose response', 'academic', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('herb')), 'She spends time tending to her herb garden every weekend.', '她每个周末都花时间照料她的草本植物园。', 'herb garden', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('herb')), 'Drinking herb tea can help improve digestion and relax the mind.', '饮用草本茶可以帮助改善消化，放松心情。', 'herb tea', 'health', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('herb')), 'Researchers are studying various herb species for their medicinal properties.', '研究人员正在研究不同的草本植物种类及其药用特性。', 'herb species', 'science_tech', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('nightmare')), 'The experts warned us about a nightmare scenario for the economy.', '专家警告我们，经济将面临噩梦般的情景。', 'nightmare scenario', 'news', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('nightmare')), 'She found herself in a nightmare situation during the test yesterday.', '她发现自己在昨天的考试中处于噩梦般的境地。', 'nightmare situation', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('nightmare')), 'That trip turned into a nightmare experience due to the bad weather.', '由于天气恶劣，那次旅行变成了噩梦般的经历。', 'nightmare experience', 'travel', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('basement')), 'My parents converted the basement into a finished living space.', '我的父母把地下室改造成了一个完工的居住空间。', 'finished basement', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('basement')), 'Heavy rains caused basement flooding in many homes last year.', '去年，大雨导致许多房屋的地下室被淹。', 'basement flooding', 'environment', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('basement')), 'We use the basement for storage of excess office supplies.', '我们将地下室用作多余办公用品的存储。', 'basement storage', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('questionnaire')), 'Researchers will conduct a questionnaire to gather student opinions.', '研究人员将进行问卷调查以收集学生意见。', 'conduct a questionnaire', 'academic', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('questionnaire')), 'Employees are asked to fill out a questionnaire about workplace satisfaction.', '员工被要求填写一份关于工作满意度的问卷。', 'fill out a questionnaire', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('questionnaire')), 'Doctors often distribute a questionnaire to understand patient symptoms better.', '医生经常分发问卷以更好地了解患者症状。', 'distribute a questionnaire', 'health', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('random')), 'Scientists often use random numbers for statistical analysis.', '科学家们经常使用随机数进行统计分析。', 'random numbers', 'science_tech', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('random')), 'Students can participate in random selection for the scholarship program.', '学生可以参与奖学金项目的随机选拔。', 'random selection', 'education', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('random')), 'The news covered several random events happening in the city.', '新闻报道了城市中发生的几起随机事件。', 'random events', 'news', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('infrastructure')), 'Cities must invest in better transportation infrastructure for public safety.', '城市必须投资于更好的交通基础设施，以保障公共安全。', 'transportation infrastructure', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('infrastructure')), 'Governments are focusing on improving social infrastructure to enhance living standards.', '各国政府正着重改善社会基础设施，以提高生活水平。', 'social infrastructure', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('infrastructure')), 'Advancements in technology require robust digital infrastructure for efficiency.', '技术进步需要强大的数字基础设施以提高效率。', 'digital infrastructure', 'science_tech', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('guilt')), 'Many people feel guilt after making a mistake, affecting their mood.', '许多人在犯错后感到内疚，影响了他们的情绪。', 'feel guilt', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('guilt')), 'Her manager gave her a guilt trip for missing the deadline yesterday.', '她的经理因为昨天错过截止日期而让她感到内疚。', 'guilt trip', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('guilt')), 'To overcome guilt, one must learn to forgive themselves and move on.', '要克服内疚，一个人必须学会宽恕自己并继续前进。', 'overcome guilt', 'health', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('replacement')), 'You can find replacement parts for your broken appliance online.', '你可以在网上找到你坏掉的电器的替代零件。', 'replacement parts', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('replacement')), 'Doctors recommend replacement therapy for patients with hormone deficiencies.', '医生建议对激素缺乏的患者进行替代疗法。', 'replacement therapy', 'health', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('replacement')), 'The replacement cost of the equipment was higher than expected.', '该设备的替换成本超出预期。', 'replacement cost', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('web')), 'Many people browse their favorite web pages every day.', '许多人每天浏览自己喜欢的网页。', 'web page', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('web')), 'She is studying web design to create beautiful websites.', '她正在学习网页设计，以创建漂亮的网站。', 'web design', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('web')), 'Web development is an important skill in today''s job market.', '网页开发是在当今就业市场上重要的技能。', 'web development', 'education', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('guitar')), 'Musicians often prefer an electric guitar for its versatility.', '音乐家通常更喜欢电吉他，因为它的多功能性。', 'electric guitar', 'culture', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('guitar')), 'She decided to play guitar during the family gathering this weekend.', '她决定在这个周末的家庭聚会上弹吉他。', 'play guitar', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('guitar')), 'He takes guitar lessons every Saturday at the local music school.', '他每个星期六在当地音乐学校上吉他课。', 'guitar lessons', 'education', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('currency')), 'Many businesses offer foreign currency exchanges for travelers.', '许多企业为旅行者提供外币兑换服务。', 'foreign currency exchange', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('currency')), 'Investors are interested in digital currencies for future opportunities.', '投资者对数字货币未来的机会很感兴趣。', 'digital currency', 'science_tech', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('currency')), 'Make sure to have local currency when visiting new countries.', '访问新国家时，确保携带当地货币。', 'local currency', 'travel', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('promotion')), 'He received a job promotion after completing his project successfully.', '他在成功完成项目后获得了晋升。', 'job promotion', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('promotion')), 'The store launched a promotion campaign to attract more customers.', '商店推出了一项促销活动以吸引更多顾客。', 'promotion campaign', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('promotion')), 'Students received promotion materials for the upcoming school event.', '学生们收到了即将举行的学校活动的宣传材料。', 'promotion materials', 'education', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('southeast')), 'Many tourists visit southeast Asia for its beautiful beaches.', '许多游客前往东南亚欣赏美丽的海滩。', 'southeast Asia', 'travel', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('southeast')), 'Southeast winds often bring warm weather during spring.', '东南风常常在春季带来温暖的天气。', 'southeast winds', 'environment', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('southeast')), 'The southeast region experienced heavy rainfall last week.', '东南地区上周经历了强降雨。', 'southeast region', 'news', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('detective')), 'Private detectives help clients find missing persons or solve cases.', '私人侦探帮助客户寻找失踪人员或解决案件。', 'private detective', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('detective')), 'Many readers enjoy a good detective story with unexpected twists.', '许多读者喜欢情节曲折的侦探故事。', 'detective story', 'culture', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('detective')), 'Detective work often involves gathering clues and interviewing witnesses.', '侦探工作通常包括收集线索和采访证人。', 'detective work', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('engagement')), 'Businesses often seek community engagement to improve their reputation.', '企业通常寻求社区参与以改善声誉。', 'community engagement', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('engagement')), 'Customer engagement is essential for building strong brand loyalty.', '客户参与对于建立强大的品牌忠诚度至关重要。', 'customer engagement', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('engagement')), 'An engagement announcement was shared widely on social media today.', '一则订婚公告今天在社交媒体上广泛传播。', 'engagement announcement', 'news', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('poster')), 'Artists created an advertising poster for the upcoming festival.', '艺术家为即将到来的节日创作了一张广告海报。', 'advertising poster', 'culture', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('poster')), 'Teachers use an educational poster to explain complex topics.', '教师使用教育海报来解释复杂的主题。', 'educational poster', 'education', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('poster')), 'She hung a movie poster on her bedroom wall.', '她在卧室的墙上挂了一张电影海报。', 'movie poster', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('pit')), 'They enjoyed swimming in the deep pit at the lake.', '他们喜欢在湖里的深坑游泳。', 'swimming pit', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('pit')), 'The workers dug deeper into the coal pit for resources.', '工人们在煤矿深坑中挖掘资源。', 'coal pit', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('pit')), 'Animals often get stuck in the muddy pit during the rainy season.', '在雨季，动物们常常被泥坑困住。', 'mud pit', 'environment', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('hug')), 'She will give a hug to her best friend today.', '今天，她会给她最好的朋友一个拥抱。', 'give a hug', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('hug')), 'He received a tight hug after winning the award.', '获奖后，他得到了一个紧紧的拥抱。', 'tight hug', 'culture', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('hug')), 'They shared a long hug at the end of the meeting.', '会议结束时，他们进行了一个长时间的拥抱。', 'long hug', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('elegant')), 'Many people admire the elegant design of the new smartphone.', '许多人欣赏这款新智能手机的优雅设计。', 'elegant design', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('elegant')), 'Finding an elegant solution to the problem took a lot of time.', '找到这个问题的优雅解决方案花费了很多时间。', 'elegant solution', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('elegant')), 'She wore an elegant dress to the gala event last night.', '她昨晚穿着优雅的礼服参加了晚会。', 'elegant dress', 'culture', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('candle')), 'They decided to light a candle for good luck.', '他们决定点燃一支蜡烛以求好运。', 'light a candle', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('candle')), 'Many people enjoy using a scented candle in their homes.', '许多人喜欢在家里使用香味蜡烛。', 'scented candle', 'culture', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('candle')), 'The birthday candle was placed on the cake before the celebration.', '生日蜡烛在庆祝之前放在蛋糕上。', 'birthday candle', 'education', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('prevention')), 'Health organizations recommend disease prevention programs to reduce illness.', '健康组织建议开展预防疾病的项目，以减少疾病。', 'disease prevention', 'health', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('prevention')), 'Local authorities are investing in crime prevention strategies this year.', '地方当局今年正在投资犯罪预防策略。', 'crime prevention', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('prevention')), 'Accident prevention measures are crucial for maintaining workplace safety.', '事故预防措施对维护工作场所安全至关重要。', 'accident prevention', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('photography')), 'Many companies use digital photography for marketing purposes.', '许多公司使用数码摄影用于市场营销。', 'digital photography', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('photography')), 'She loves capturing moments in wildlife photography during her trips.', '她在旅行中热衷于拍摄野生动物摄影的瞬间。', 'wildlife photography', 'travel', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('photography')), 'Portrait photography often reveals the personality of the subject.', '人像摄影常常揭示被拍摄者的个性。', 'portrait photography', 'culture', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('hostage')), 'Kidnapped hostages were finally released after long negotiations.', '被绑架的人质在长时间谈判后终于被释放。', 'kidnapped hostage', 'news', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('hostage')), 'Authorities are trying to resolve the ongoing hostage situation peacefully.', '当局正在努力和平解决正在进行的人质局势。', 'hostage situation', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('hostage')), 'Several tourists were taken hostage during the violent protest.', '在暴力抗议中，几名游客被劫为人质。', 'hostages were taken', 'culture', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('gathering')), 'We always enjoy our family gatherings during the holidays.', '节假日期间，我们总是喜欢家庭聚会。', 'family gathering', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('gathering')), 'An informal gathering of colleagues will be held after the meeting.', '会议结束后会举行一次同事的非正式聚会。', 'informal gathering', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('gathering')), 'The academic gathering featured presentations from several renowned scholars.', '这次学术聚会有几位著名学者的演讲。', 'academic gathering', 'education', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('realistic')), 'Setting realistic expectations is crucial for team success.', '设定现实的期望对团队的成功至关重要。', 'realistic expectations', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('realistic')), 'Students should create realistic goals for their academic progress.', '学生应该为自己的学业进步设定现实的目标。', 'realistic goals', 'education', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('realistic')), 'Adopting a realistic approach helps manage daily challenges effectively.', '采用现实的方法有助于有效管理日常挑战。', 'realistic approach', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('kit')), 'Workers often carry a tool kit to assist with repairs.', '工人们经常携带工具包来帮助修理。', 'tool kit', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('kit')), 'Every household should have a well-stocked first aid kit.', '每个家庭都应该备有一套装备齐全的急救包。', 'first aid kit', 'health', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('kit')), 'Students received a starter kit to begin their scientific experiments.', '学生们收到了一个入门套件以开始他们的科学实验。', 'starter kit', 'education', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('sentiment')), 'Public sentiment regarding climate change is becoming increasingly urgent.', '公众对气候变化的情感变得越来越紧迫。', 'public sentiment', 'news', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('sentiment')), 'National sentiment often influences political decisions and policies in many countries.', '民族情感常常影响许多国家的政治决策和政策。', 'national sentiment', 'culture', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('sentiment')), 'She expressed her personal sentiment about friendship during the meeting.', '她在会议中表达了对友谊的个人情感。', 'personal sentiment', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('pillow')), 'Many people enjoy decorating their sofas with colorful throw pillows.', '许多人喜欢用色彩丰富的靠垫装饰沙发。', 'throw pillows', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('pillow')), 'Children often have fun engaging in a playful pillow fight during sleepovers.', '孩子们在过夜聚会时常常乐于进行有趣的枕头大战。', 'pillow fight', 'culture', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('pillow')), 'Designers create unique patterns for elegant pillow covers in home decor.', '设计师为家居装饰设计独特图案的优雅枕套。', 'pillow cover', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('grief')), 'Many people experience deep grief after losing a loved one.', '许多人在失去亲人后感受到深深的悲伤。', 'deep grief', 'health', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('grief')), 'Communities often gather to express grief over tragic events.', '社区常常聚集在一起表达对悲剧事件的悲伤。', 'express grief', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('grief')), 'Professionals provide grief counseling to help individuals cope with loss.', '专业人士提供悲伤辅导，帮助个人应对失去。', 'grief counseling', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('bid')), 'Many companies are placing their bids for contracts this month.', '许多公司这个月正在出价投标合同。', 'bid for contracts', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('bid')), 'The politician made a bid to win the support of young voters.', '这位政治家试图争取年轻选民的支持。', 'bid to win', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('bid')), 'She decided to bid farewell to her friends before moving away.', '她决定在搬家之前向朋友们告别。', 'bid farewell', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('tightly')), 'She held tightly onto the railing while climbing the stairs.', '她在爬楼梯时紧紧抓住了扶手。', 'hold tightly', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('tightly')), 'The new cover fits tightly on the device, preventing any dust from entering.', '新盖子紧紧贴合在设备上，防止灰尘进入。', 'fit tightly', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('tightly')), 'They wrap tightly the gift in colorful paper before presenting it.', '他们在赠送礼物之前，将其紧紧包裹在彩色纸中。', 'wrap tightly', 'culture', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('dilemma')), 'Professionals often face an ethical dilemma in their decision-making processes.', '专业人士在决策过程中经常面临伦理困境。', 'ethical dilemma', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('dilemma')), 'Students are taught to analyze a moral dilemma from multiple perspectives.', '学生们被教导从多个角度分析道德困境。', 'moral dilemma', 'academic', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('dilemma')), 'She struggled with a personal dilemma about whether to relocate for a job.', '她在是否为了工作搬迁的问题上挣扎。', 'personal dilemma', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('dignity')), 'Everyone deserves to have their human dignity recognized and respected.', '每个人都应当得到尊严的认可与尊重。', 'human dignity', 'culture', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('dignity')), 'Teachers should treat all students with dignity and respect in the classroom.', '教师在课堂上应以尊严和尊重对待所有学生。', 'dignity and respect', 'education', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('dignity')), 'Patients often experience a loss of dignity during long hospital stays.', '患者在漫长的住院期间常常感到尊严的丧失。', 'loss of dignity', 'health', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('liability')), 'Businesses must understand their legal liability in case of accidents.', '企业必须了解在事故发生时的法律责任。', 'legal liability', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('liability')), 'Every household has some financial liability, such as loans or mortgages.', '每个家庭都有一些财务责任，例如贷款或抵押。', 'financial liability', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('liability')), 'The court ruled that he had personal liability for the damages caused.', '法庭裁定他对造成的损害负个人责任。', 'personal liability', 'news', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('grin')), 'She grinned widely when she received the good news.', '当她收到好消息时，她露出了灿烂的笑容。', 'grin widely', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('grin')), 'He was grinning from ear to ear after completing the project.', '完成项目后，他笑得合不拢嘴。', 'grin from ear to ear', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('grin')), 'Sometimes you have to grin and bear it during difficult times.', '在困难时期，有时你只能微笑着忍耐。', 'grin and bear it', 'academic', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('divine')), 'Many believe that divine intervention changed the outcome of the event.', '许多人相信，神的干预改变了事件的结果。', 'divine intervention', 'culture', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('divine')), 'The concept of divine right justified kings'' authority in many ancient societies.', '神权理论在许多古代社会中为国王的权威辩护。', 'divine right', 'education', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('divine')), 'Some people trust that everything happens according to a divine plan.', '有些人相信，一切都是按照神的计划发生的。', 'divine plan', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('cartoon')), 'Children often enjoy watching animated cartoons on Saturday mornings.', '孩子们通常喜欢在星期六早上观看动画片。', 'animated cartoon', 'culture', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('cartoon')), 'My favorite cartoon character always makes me laugh whenever I see him.', '我最喜欢的卡通角色每次看到他都会让我笑。', 'cartoon character', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('cartoon')), 'The political cartoon featured a clever critique of current events and leaders.', '这幅政治漫画巧妙地批评了当前的事件和领导人。', 'political cartoon', 'news', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('ancestor')), 'Many cultures honor their ancestors through various traditions and rituals.', '许多文化通过各种传统和仪式来尊敬他们的祖先。', 'descendants of ancestors', 'culture', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('ancestor')), 'In some communities, ancestor worship is an important part of daily life.', '在某些社区，祭祖是日常生活中重要的一部分。', 'ancestor worship', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('ancestor')), 'Students often research genealogy to trace their ancestors'' origins and stories.', '学生们经常研究家谱，追溯他们的祖先的起源和故事。', 'tracing ancestors', 'education', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('productivity')), 'Companies strive to increase productivity through better management practices.', '公司通过更好的管理实践来提高生产力。', 'increase productivity', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('productivity')), 'Research often evaluates various measures of productivity in different industries.', '研究通常评估不同行业的各种生产力指标。', 'measures of productivity', 'academic', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('productivity')), 'Recent reports indicate that productivity levels have significantly declined this quarter.', '最新报告显示，本季度生产力水平显著下降。', 'productivity levels', 'news', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('bug')), 'Developers are working hard to fix the software bugs reported by users.', '开发人员正在努力修复用户报告的软件漏洞。', 'software bugs', 'science_tech', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('bug')), 'He submitted a detailed bug report to the technical support team yesterday.', '他昨天向技术支持团队提交了一份详细的漏洞报告。', 'bug report', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('bug')), 'Many people experience itchy skin after bug bites during the summer.', '许多人在夏天遭到虫子叮咬后会感到皮肤瘙痒。', 'bug bites', 'health', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('bonus')), 'Many employees receive a performance bonus at the end of the year.', '许多员工在年末时会获得绩效奖金。', 'performance bonus', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('bonus')), 'Shoppers can earn a cash bonus by using loyalty points effectively.', '购物者通过有效使用积分可以获得现金奖金。', 'cash bonus', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('bonus')), 'Top athletes often negotiate a substantial signing bonus in their contracts.', '顶级运动员通常在合同中谈判可观的签约奖金。', 'signing bonus', 'news', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('edit')), 'Scholars frequently edit an article before submitting it for publication.', '学者们在提交文章之前常常会编辑。', 'edit an article', 'academic', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('edit')), 'During the meeting, she edited a video for the upcoming project presentation.', '在会议期间，她编辑了即将进行的项目展示视频。', 'edit a video', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('edit')), 'He needs to edit a document before it can be shared with the team.', '他需要编辑一份文档才能与团队分享。', 'edit a document', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('ass')), 'Some people consider her a stubborn ass when she refuses to listen.', '有些人认为她是个固执的驴，当她拒绝听从时。', 'stubborn ass', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('ass')), 'In many cultures, the donkey ass symbolizes hard work and perseverance.', '在许多文化中，驴象征着努力和坚持不懈。', 'donkey ass', 'culture', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('ass')), 'He decided to kick ass in the meeting to impress his boss.', '他决定在会议上表现出色，给老板留下深刻印象。', 'kick ass', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('tragic')), 'The tragic event left the entire community in shock and mourning.', '这起悲惨事件让整个社区感到震惊和哀悼。', 'tragic event', 'news', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('tragic')), 'Many stories feature a tragic hero who faces inevitable downfall due to flaws.', '许多故事以悲惨英雄为特色，他因缺陷而面临不可避免的衰落。', 'tragic hero', 'culture', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('tragic')), 'Ignoring safety protocols can lead to tragic consequences in the workplace.', '忽视安全规程可能导致工作场所的悲惨后果。', 'tragic consequences', 'education', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('dessert')), 'Restaurants often offer a dessert menu featuring various sweet options.', '餐厅通常提供甜点菜单，上面有各种甜品选择。', 'dessert menu', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('dessert')), 'Many chefs share their favorite dessert recipes at culinary workshops.', '许多厨师在烹饪研讨会上分享他们最喜欢的甜点食谱。', 'dessert recipes', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('dessert')), 'Pairing dessert wine with cheese can enhance the overall dining experience.', '将甜点酒与奶酪搭配可以提升整体用餐体验。', 'dessert wine', 'culture', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('lion')), 'A lion''s roar can be heard from miles away in the wild.', '狮子的吼声在野外可从数公里外听到。', 'lion''s roar', 'culture', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('lion')), 'Conservation efforts are crucial for protecting the lion habitat from destruction.', '保护狮子栖息地免于破坏的工作至关重要。', 'lion habitat', 'environment', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('lion')), 'The declining lion population raises concerns about biodiversity in ecosystems.', '狮子数量的下降引发了对生态系统生物多样性的担忧。', 'lion population', 'science_tech', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('utilize')), 'Organizations can utilize resources more efficiently to reduce costs.', '组织可以更有效地利用资源来降低成本。', 'utilize resources', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('utilize')), 'Researchers often utilize technology to improve data analysis methods.', '研究人员经常利用技术来改进数据分析方法。', 'utilize technology', 'science_tech', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('utilize')), 'Teachers should utilize information from multiple sources for better learning.', '教师应利用来自多个来源的信息以促进更好的学习。', 'utilize information', 'education', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('panic')), 'Many people suffer from panic attacks without understanding their triggers.', '许多人在不了解诱因的情况下遭受恐慌发作。', 'panic attacks', 'health', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('panic')), 'During the pandemic, panic buying caused shortages of essential goods everywhere.', '在疫情期间，恐慌性购买导致基本商品到处短缺。', 'panic buying', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('panic')), 'The body''s panic response can affect heart rate and breathing patterns significantly.', '身体的恐慌反应会显著影响心率和呼吸模式。', 'panic response', 'science_tech', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('appreciation')), 'Managers often express appreciation for employees'' efforts during meetings.', '经理们经常在会议中对员工的努力表示感谢。', 'appreciation for someone''s efforts', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('appreciation')), 'Understanding and cultural appreciation are vital for coexistence and harmony.', '理解与文化欣赏对共存与和谐至关重要。', 'cultural appreciation', 'culture', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('appreciation')), 'Students develop an appreciation of art through hands-on experiences and discussions.', '学生通过实践和讨论培养对艺术的欣赏。', 'appreciation of art', 'education', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('consequently')), 'The experiment was poorly designed; consequently, the results were inconclusive.', '实验设计不佳，因此结果不明确。', 'consequently, the results were inconclusive', 'academic', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('consequently')), 'A major storm hit the city; consequently, many people were affected.', '一场强风暴袭击了城市，因此许多人受到影响。', 'consequently, many people were affected', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('consequently')), 'His illness kept him from working; consequently, he missed the deadline.', '他的生病让他无法工作，因此他错过了截止日期。', 'consequently, he missed the deadline', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('correctly')), 'Teachers must ensure that students are correctly identified according to their needs.', '教师必须确保学生按照他们的需求被正确识别。', 'correctly identified', 'education', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('correctly')), 'Researchers correctly interpreted the data to draw significant conclusions.', '研究人员正确解读了数据，从而得出了重要结论。', 'correctly interpreted', 'science_tech', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('correctly')), 'Employees are expected to have correctly followed all safety procedures during operations.', '员工在操作过程中应当正确遵循所有安全程序。', 'correctly followed', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('fortunately')), 'In the end, fortunately, the tests showed a successful outcome.', '最终，幸运的是，测试结果显示成功。', 'fortunately, the results were positive', 'science_tech', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('fortunately')), 'During the meeting, we discussed various issues; fortunately, we found a solution.', '在会议期间，我们讨论了各种问题，幸运的是，我们找到了一个解决方案。', 'Fortunately, we found a solution', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('fortunately')), 'After the explosion, fortunately, no one was harmed in the vicinity.', '爆炸后，幸运的是，附近没有人受到伤害。', 'Fortunately, no one was harmed', 'news', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('accessible')), 'Students need easily accessible information for their research projects.', '学生们需要容易获得的信息来完成研究项目。', 'accessible information', 'education', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('accessible')), 'Local parks should provide accessible facilities for all visitors.', '当地公园应为所有游客提供可接近的设施。', 'accessible facilities', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('accessible')), 'Researchers often use accessible language to communicate complex ideas effectively.', '研究人员通常使用易于理解的语言来有效地传达复杂的思想。', 'accessible language', 'academic', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('patent')), 'Many companies submit patent applications to protect their innovations.', '许多公司提交专利申请以保护他们的创新。', 'patent application', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('patent')), 'Understanding patent law is crucial for inventors and entrepreneurs alike.', '理解专利法对发明者和企业家来说至关重要。', 'patent law', 'academic', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('patent')), 'Countries are debating changes to patent rights for pharmaceutical products.', '各国正在争论制药产品专利权的变更。', 'patent rights', 'news', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('shark')), 'Scientists are studying the behavior of great white sharks in the ocean.', '科学家们正在研究大白鲨在海洋中的行为。', 'great white shark', 'science_tech', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('shark')), 'Reports of a shark attack have raised concerns among local beachgoers.', '关于鲨鱼袭击的报道引起了当地海滩游客的担忧。', 'shark attack', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('shark')), 'Many restaurants serve dishes made with shark fin to attract customers.', '许多餐厅提供用鲨鱼鳍制作的菜肴以吸引顾客。', 'shark fin', 'culture', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('oak')), 'Oak trees provide essential habitats for various wildlife species.', '橡树为多种野生动物提供了重要栖息地。', 'oak trees', 'environment', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('oak')), 'Many furniture items are crafted from durable oak wood for its longevity.', '许多家具都是用耐用的橡木制作的，因其持久性。', 'oak wood', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('oak')), 'Wine is often aged in oak barrels to enhance its flavor profile.', '葡萄酒通常在橡木桶中陈酿，以增强其风味。', 'oak barrels', 'culture', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('damn')), 'This restaurant serves damn good food that everyone loves.', '这家餐厅的食物非常好吃，大家都喜欢。', 'damn good', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('damn')), 'The storm damn near caused severe damage to the city.', '这场风暴差点对城市造成严重损害。', 'damn near', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('damn')), 'I can’t find the damn thing we need for the project.', '我找不到我们项目需要的那个可恶的东西。', 'damn thing', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('confrontation')), 'Peaceful confrontations can lead to constructive dialogue between opposing groups.', '和平的对抗可以促使对立群体之间进行建设性对话。', 'peaceful confrontation', 'culture', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('confrontation')), 'The violent confrontations in the city escalated tensions between local residents and authorities.', '城市中的暴力冲突加剧了当地居民与当局之间的紧张关系。', 'violent confrontation', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('confrontation')), 'Developing effective confrontation strategies is essential for conflict resolution in teams.', '制定有效的对抗策略对于团队解决冲突至关重要。', 'confrontation strategies', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('deploy')), 'Military leaders have decided to deploy troops to the conflict area.', '军事领导人决定将部队部署到冲突地区。', 'deploy troops', 'news', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('deploy')), 'Innovative companies often deploy technology to enhance their services.', '创新公司常常部署技术以提升他们的服务。', 'deploy technology', 'science_tech', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('deploy')), 'Managers need to deploy strategies that improve team performance.', '经理需要部署能够提高团队表现的策略。', 'deploy strategies', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('exclusively')), 'This event is held exclusively for members of the organization.', '这个活动专门为组织的成员举办。', 'exclusively for members', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('exclusively')), 'The product is exclusively available in select stores across the country.', '该产品仅在全国部分精选商店出售。', 'exclusively available', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('exclusively')), 'Researchers are exclusively focused on the impact of climate change.', '研究人员专注于气候变化的影响。', 'exclusively focused', 'academic', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('thanksgiving')), 'Families gather for a thanksgiving dinner to enjoy traditional dishes.', '家人们聚在一起享用感恩节晚餐，品尝传统美食。', 'thanksgiving dinner', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('thanksgiving')), 'Many people travel to celebrate the thanksgiving holiday with their loved ones.', '很多人旅行，和亲人一起庆祝感恩节假期。', 'thanksgiving holiday', 'culture', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('thanksgiving')), 'Local news covered various thanksgiving celebrations happening across the city.', '当地新闻报道了全市各地举行的感恩节庆祝活动。', 'thanksgiving celebrations', 'news', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('hurricane')), 'Hurricane season begins in June and ends in November each year.', '飓风季节从每年的六月开始，直到十一月结束。', 'hurricane season', 'news', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('hurricane')), 'Residents received a hurricane warning and were advised to evacuate immediately.', '居民接到飓风警告，建议立即撤离。', 'hurricane warning', 'environment', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('hurricane')), 'Many hurricane survivors are struggling to rebuild their homes after the disaster.', '许多飓风幸存者在灾后努力重建家园。', 'hurricane survivors', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('skip')), 'Students often skip class for various reasons, including illness or personal issues.', '学生们常常因为各种原因跳过课程，包括生病或个人问题。', 'skip class', 'education', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('skip')), 'You can skip ahead in the video to find the important part more quickly.', '你可以快速跳过视频，快速找到重要部分。', 'skip ahead', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('skip')), 'Many people choose to skip a meal to reduce their calorie intake.', '许多人选择跳过一餐以减少卡路里摄入。', 'skip a meal', 'health', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('classify')), 'Managers need to classify information accurately for better decision-making.', '管理者需要准确分类信息，以便做出更好的决策。', 'classify information', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('classify')), 'Scientists aim to classify species based on their genetic characteristics.', '科学家旨在根据遗传特征对物种进行分类。', 'classify species', 'science_tech', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('classify')), 'Teachers often classify data to evaluate student performance effectively.', '教师经常对数据进行分类，以有效评估学生的表现。', 'classify data', 'education', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('ambassador')), 'Delegates attended the ambassadors forum to discuss cultural exchange.', '代表们参加了大使论坛以讨论文化交流。', 'ambassadors forum', 'culture', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('ambassador')), 'She takes her ambassadorial duties very seriously and works diligently.', '她非常认真地履行她的大使职责，努力工作。', 'ambassadorial duties', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('ambassador')), 'Visitors often admire the architecture of the ambassador''s residence.', '游客常常赞叹大使官邸的建筑风格。', 'ambassador''s residence', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('unfold')), 'After much discussion, the team will unfold their plan for the project.', '经过多次讨论，团队将展开他们的项目计划。', 'unfold a plan', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('unfold')), 'As the narrative develops, the characters begin to unfold their stories gradually.', '随着叙事的发展，角色们开始逐渐展开他们的故事。', 'unfold a story', 'culture', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('unfold')), 'Researchers believe that this discovery will unfold new possibilities in medicine.', '研究人员相信这一发现将为医学展开新的可能性。', 'unfold new possibilities', 'science_tech', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('aggression')), 'Verbal aggression can escalate conflicts and damage relationships significantly.', '语言攻击会显著升级冲突并破坏关系。', 'verbal aggression', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('aggression')), 'Physical aggression in the workplace can lead to a toxic environment for everyone involved.', '工作场所的身体攻击会导致对所有人来说有毒的环境。', 'physical aggression', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('aggression')), 'Teachers are trained in aggression management to handle difficult student behaviors effectively.', '教师接受侵略管理培训，以有效处理困难的学生行为。', 'aggression management', 'education', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('tighten')), 'Schools often tighten the rules to improve student behavior.', '学校经常收紧规定以改善学生行为。', 'tighten the rules', 'education', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('tighten')), 'Authorities will tighten security measures at the upcoming event.', '当局将在即将到来的活动中加强安全措施。', 'tighten security', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('tighten')), 'You need to tighten a screw to ensure the shelf is stable.', '你需要收紧螺丝以确保架子稳定。', 'tighten a screw', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('bacterium')), 'Doctors identified the harmful bacterium responsible for the outbreak.', '医生确认了导致疫情的有害细菌。', 'harmful bacterium', 'health', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('bacterium')), 'The researcher prepared a bacterium culture to study its growth patterns.', '研究人员制备了细菌培养以研究其生长模式。', 'bacterium culture', 'science_tech', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('bacterium')), 'Different bacterium species can have varying effects on human health.', '不同的细菌种类对人类健康可能有不同的影响。', 'bacterium species', 'academic', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('cruise')), 'Many travelers prefer an ocean cruise for relaxation and enjoyment.', '许多旅行者更喜欢海洋巡航来放松和享受。', 'ocean cruise', 'travel', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('cruise')), 'A cruise ship offers a variety of entertainment and dining options for guests.', '游轮为客人提供各种娱乐和用餐选择。', 'cruise ship', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('cruise')), 'Newer cars often include advanced cruise control features for safety.', '较新的汽车通常配备先进的巡航控制功能以提高安全性。', 'cruise control', 'science_tech', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('similarity')), 'Researchers found a strong similarity in results across different studies.', '研究人员发现不同研究之间结果有很强的相似性。', 'similarity in results', 'science_tech', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('similarity')), 'Understanding the similarity between cultures can promote better communication.', '理解文化之间的相似性可以促进更好的沟通。', 'similarity between cultures', 'culture', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('similarity')), 'They expressed a surprising similarity of opinion regarding the new policy.', '他们对新政策表达了惊人的意见相似性。', 'similarity of opinion', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('steak')), 'Many people prefer their steak cooked medium rare for optimal flavor.', '许多人喜欢将牛排煮至五分熟，以获得最佳风味。', 'cooked steak', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('steak')), 'Hosting a steak dinner can be a great way to impress guests at home.', '举办一场牛排晚餐可以是给家人留下深刻印象的好方法。', 'steak dinner', 'culture', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('steak')), 'The chef created a unique steak sauce that enhanced the dish''s taste.', '厨师制作了一种独特的牛排酱，提升了菜肴的味道。', 'steak sauce', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('forum')), 'Many users participate in online forums to share their experiences.', '许多用户参与在线论坛分享他们的经历。', 'online forums', 'culture', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('forum')), 'Students presented their research findings at the academic forum last week.', '学生们上周在学术论坛上展示了他们的研究成果。', 'academic forum', 'education', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('forum')), 'The town hall hosted a public forum for residents to voice their concerns.', '市政厅举办了一个公众论坛，让居民表达他们的担忧。', 'public forum', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('soar')), 'Companies aim to soar to new heights through innovation and teamwork.', '公司通过创新和团队合作力求达到新的高度。', 'soar to new heights', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('soar')), 'Birds can soar above the clouds, enjoying the vast sky.', '鸟儿可以在云层之上翱翔，享受广阔的天空。', 'soar above', 'environment', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('soar')), 'The prices of essential goods have soared dramatically in recent months.', '最近几个月，生活必需品的价格急剧上涨。', 'soar dramatically', 'news', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('charm')), 'Many travelers seek the charms of nature while exploring new destinations.', '许多旅行者在探索新目的地时寻求自然的魅力。', 'charms of nature', 'travel', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('charm')), 'Exploring the city''s hidden charms can lead to delightful discoveries.', '探索这座城市隐藏的魅力可能会带来愉快的发现。', 'charms of the city', 'culture', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('charm')), 'She often charms people with her warm smile and kind words.', '她常常用温暖的微笑和亲切的话语吸引他人。', 'charms people', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('denial')), 'Many politicians are in denial of their responsibilities towards the public.', '许多政治家否认自己对公众的责任。', 'denial of responsibility', 'news', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('denial')), 'The denial of reality often leads to further complications in psychological studies.', '否认现实常常导致心理研究中的进一步复杂情况。', 'denial of reality', 'academic', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('denial')), 'She remained in a state of denial about the seriousness of her health issues.', '她对自己健康问题的严重性仍处于否认状态。', 'state of denial', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('fantastic')), 'Finding a fantastic opportunity can significantly impact your career growth.', '找到一个极好的机会对你的职业发展有重大影响。', 'fantastic opportunity', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('fantastic')), 'Researchers reported fantastic results from the latest study on renewable energy.', '研究人员报告了最新可再生能源研究的极好成果。', 'fantastic results', 'science_tech', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('fantastic')), 'Travelers were amazed by the fantastic scenery during their trip to the mountains.', '旅行者在前往山区的旅途中被极好的风景惊艳。', 'fantastic scenery', 'travel', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('ego')), 'Receiving compliments can provide a significant ego boost for many people.', '收到赞美可以为很多人带来显著的自我提升。', 'ego boost', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('ego')), 'The team faced an ego clash during project discussions, affecting collaboration.', '团队在项目讨论中遭遇了自我冲突，影响了合作。', 'ego clash', 'work', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('ego')), 'Ego-driven behavior can lead to poor decision-making in leadership roles.', '自我驱动的行为可能导致领导角色中的糟糕决策。', 'ego-driven', 'academic', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('fragile')), 'Ecosystems are often fragile and can be easily disrupted by pollution.', '生态系统往往是脆弱的，容易受到污染的干扰。', 'fragile ecosystem', 'environment', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('fragile')), 'After years of conflict, the nation finally achieved a fragile peace agreement.', '经过多年的冲突，该国终于达成了脆弱的和平协议。', 'fragile peace', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('fragile')), 'Handle the fragile glassware with care to prevent it from breaking.', '小心处理这些脆弱的玻璃器皿，以免它们破裂。', 'fragile glass', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('availability')), 'Consumers are concerned about product availability during the holiday season.', '消费者对假期产品的可用性感到担忧。', 'product availability', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('availability')), 'Researchers are studying the availability of resources for sustainable development.', '研究人员正在研究可持续发展所需资源的可用性。', 'availability of resources', 'academic', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('availability')), 'The availability of information has improved due to advancements in technology.', '由于科技进步，信息的可用性得到了提高。', 'availability of information', 'news', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('sofa')), 'She just bought a new sofa set for her living room.', '她刚为客厅买了一套新的沙发。', 'sofa set', 'daily_life', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('sofa')), 'Many apartments now include a sofa bed for extra sleeping space.', '现在许多公寓都配有沙发床，以提供额外的睡眠空间。', 'sofa bed', 'culture', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('sofa')), 'The office features a stylish leather sofa in the reception area.', '办公室接待区有一款时尚的皮沙发。', 'leather sofa', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('ironically')), 'Researchers found that ironically, the results were positive despite initial doubts.', '研究人员发现，结果是积极的，具有讽刺意味，尽管最初存在怀疑。', 'ironically, the results were positive', 'science_tech', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('ironically')), 'Winning the award was ironically, the last thing he expected this year.', '获得奖项，具有讽刺意味，是他今年最后期望的事情。', 'ironically, he won the prize', 'culture', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('ironically')), 'She realized, ironically, it was too late to change her decision.', '她意识到，具有讽刺意味的是，改变决定已经太迟了。', 'ironically, it was too late', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('update')), 'Managers need to update the report with the latest data.', '经理需要用最新数据更新报告。', 'update the report', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('update')), 'Regularly installing a software update improves system security and functionality.', '定期安装软件更新可以提高系统安全性和功能性。', 'software update', 'science_tech', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('update')), 'Could you provide an update on the project progress at our next meeting?', '你能在下次会议上提供项目进展的更新吗？', 'update on the project', 'academic', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('meantime')), 'Officials will review the proposal, and in the meantime, public opinions are gathered.', '官员将审核该提案，同时，公众意见正在收集。', 'in the meantime', 'news', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('meantime')), 'The researchers implemented meantime measures to ensure data integrity during the study.', '研究人员采取了同时措施，以确保研究过程中的数据完整性。', 'meantime measures', 'academic', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('meantime')), 'We must find meantime solutions to manage the project''s delay effectively.', '我们必须找到同时解决方案，以有效管理项目的延误。', 'meantime solutions', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('youngster')), 'Many youngsters today are more aware of global issues than previous generations.', '如今，许多年轻人比以往更了解全球问题。', 'youngster culture', 'culture', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('youngster')), 'Teachers play a crucial role in the development of youngsters'' skills and knowledge.', '教师在年轻人技能和知识的发展中扮演着重要角色。', 'youngster development', 'education', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('youngster')), 'Local communities often organize sports events to engage youngsters in healthy activities.', '当地社区经常组织体育活动以吸引年轻人参与健康活动。', 'youngster sports', 'daily_life', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('explicit')), 'Students appreciate explicit instructions for completing their assignments successfully.', '学生们喜欢清晰明确的指示，以便顺利完成作业。', 'explicit instructions', 'education', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('explicit')), 'The article provided explicit details about the recent political changes.', '这篇文章提供了关于最近政治变化的明确细节。', 'explicit details', 'news', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('explicit')), 'Patients must give explicit consent before undergoing any medical procedure.', '病人在接受任何医疗程序之前必须给予明确的同意。', 'explicit consent', 'health', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('slot')), 'We need to book a time slot for the meeting next week.', '我们需要为下周的会议预定一个时间段。', 'time slot', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('slot')), 'He won a jackpot playing the slot machine at the casino.', '他在赌场玩老虎机时赢得了头奖。', 'slot machine', 'daily_life', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('slot')), 'Teachers can slot in additional activities to enhance learning.', '老师可以添加额外的活动以增强学习效果。', 'slot in', 'education', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('soften')), 'Engineers aim to soften the impact of collisions on vehicles.', '工程师的目标是减轻碰撞对车辆的冲击。', 'soften the impact', 'science_tech', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('soften')), 'Many experts suggest that you should soften the tone when discussing sensitive topics.', '许多专家建议在讨论敏感话题时应缓和语气。', 'soften the tone', 'culture', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('soften')), 'In negotiations, it is often wise to soften your stance for better outcomes.', '在谈判中，通常明智的做法是放软立场以获得更好的结果。', 'soften your stance', 'work', 2),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('straighten')), 'Managers need to straighten out any confusion during meetings.', '经理们需要在会议上理清任何混乱。', 'straighten out a situation', 'work', 0),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('straighten')), 'It is essential to straighten one''s posture to prevent back pain.', '保持正确的姿势对预防背部疼痛至关重要。', 'straighten one''s posture', 'health', 1),
((SELECT id FROM vocab_words WHERE lower(headword)=lower('straighten')), 'Many people straighten their hair before attending special events.', '许多人在参加特殊活动前会拉直头发。', 'straighten your hair', 'daily_life', 2);

SELECT '第1片 AFTER' AS stage, count(*) AS 有释义的cet6词 FROM vocab_words w JOIN vocab_word_banks m ON m.word_id=w.id JOIN vocab_banks b ON b.id=m.bank_id WHERE b.code='cet6' AND w.def_zh IS NOT NULL;

COMMIT;
